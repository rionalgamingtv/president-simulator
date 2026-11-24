import React, { useMemo } from 'react';
import {
  Award,
  Briefcase,
  Layers,
  ShieldCheck,
  UserCheck,
  UserCog,
} from 'lucide-react';
import {
  AdminSuiteState,
  CabinetDepartment,
  CabinetMember,
  VpAssignmentId,
} from '../types/game';
import {
  evaluateCabinetIdeologySpread,
  INTERAGENCY_TASK_FORCES,
  VP_ASSIGNMENTS,
} from '../data/expansionSuites';

interface CabinetSuitePanelProps {
  currentMonth: number;
  cabinet: CabinetMember[];
  adminSuite: AdminSuiteState;
  onChangeVpAssignment: (assignment: VpAssignmentId) => void;
  onRunLeakAudit: (style: 'clearance' | 'open_door' | 'taskforce') => void;
  onCommendSecretary: (member: CabinetMember) => void;
  onActingSwap: (member: CabinetMember) => void;
  onQueueTaskForce: (policyDraft: string, speechDraft: string) => void;
}

export const CabinetSuitePanel: React.FC<CabinetSuitePanelProps> = ({
  currentMonth,
  cabinet,
  adminSuite,
  onChangeVpAssignment,
  onRunLeakAudit,
  onCommendSecretary,
  onActingSwap,
  onQueueTaskForce,
}) => {
  const spread = useMemo(
    () => evaluateCabinetIdeologySpread(cabinet),
    [cabinet]
  );

  const lowLoyaltyMembers = useMemo(
    () => cabinet.filter((m) => m.loyalty < 45),
    [cabinet]
  );
  const topAlignedMembers = useMemo(
    () =>
      [...cabinet]
        .filter((m) => m.loyalty >= 75)
        .sort((a, b) => b.loyalty - a.loyalty),
    [cabinet]
  );

  const commendCooldown =
    typeof adminSuite.lastCommendMonth === 'number'
      ? Math.max(0, 4 - (currentMonth - adminSuite.lastCommendMonth))
      : 0;
  const auditCooldown =
    typeof adminSuite.lastLeakAuditMonth === 'number'
      ? Math.max(0, 3 - (currentMonth - adminSuite.lastLeakAuditMonth))
      : 0;
  const actingSwapCooldown =
    typeof adminSuite.lastActingSwapMonth === 'number'
      ? Math.max(0, 4 - (currentMonth - adminSuite.lastActingSwapMonth))
      : 0;

  return (
    <div className="space-y-6">
      {/* Row 1: Loyalty/Competence Matrix & Ideological Balance */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <Layers className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Cabinet Loyalty &amp; Competence Matrix</span>
            </div>
            <div className="flex items-center gap-3 font-mono-num text-xs text-stone-600">
              <span>Avg Loyalty {spread.avgLoyalty.toFixed(0)}%</span>
              <span aria-hidden="true">·</span>
              <span>Avg Competence {spread.avgCompetence.toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cabinet.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-stone-900">
                    {m.name}
                  </p>
                  <p className="truncate text-[11px] text-stone-500">
                    {m.roleTitle} · {m.status}
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono-num text-[11px]">
                  <span
                    className={
                      m.loyalty < 45
                        ? 'font-bold text-red-700'
                        : 'font-semibold text-stone-800'
                    }
                  >
                    L {m.loyalty}%
                  </span>
                  <span className="mx-1 text-stone-400">/</span>
                  <span className="text-stone-600">C {m.competence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <UserCheck className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Cabinet Ideological Balance &amp; Risk</span>
          </div>

          <div className="space-y-2 text-xs">
            {(
              Object.entries(spread.buckets) as Array<[string, number]>
            ).map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3"
              >
                <span className="w-24 text-stone-700">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full bg-[#132238]"
                    style={{
                      width: `${Math.round(
                        (count / Math.max(1, cabinet.length)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right font-mono-num text-stone-700">
                  {count}
                </span>
              </div>
            ))}
          </div>

          <p className="border-t border-stone-100 pt-2.5 text-xs text-stone-600">
            Active friction:{' '}
            <strong className="font-mono-num text-stone-900">
              {spread.strainedCount} Strained
            </strong>{' '}
            ·{' '}
            <strong className="font-mono-num text-stone-900">
              {spread.cautiousCount} Cautious
            </strong>
          </p>
        </div>
      </section>

      {/* Row 2: VP Assignment, Leak Audit, Commendation & Acting Swap */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <Briefcase className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Vice President Portfolio Assignment</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {VP_ASSIGNMENTS.map((va) => (
              <button
                key={va.id}
                type="button"
                onClick={() => onChangeVpAssignment(va.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  adminSuite.vpAssignment === va.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <p className="text-xs font-semibold text-stone-900">
                  {va.label}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-600">
                  {va.description}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#132238]">
                  {va.bonusText}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800">
                <ShieldCheck className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                <span>West Wing Leak Audit &amp; Clearance Protocol</span>
              </span>
              <span className="font-mono-num text-stone-500">
                {auditCooldown > 0 ? `Cooldown ${auditCooldown} mo` : 'Ready'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                {
                  id: 'clearance' as const,
                  label: 'Tighten Clearance',
                  sub: '+Approval Stability, -2% Loyalty',
                },
                {
                  id: 'open_door' as const,
                  label: 'Open Door Briefings',
                  sub: '+3% Cabinet Loyalty',
                },
                {
                  id: 'taskforce' as const,
                  label: 'Joint Staff Sync',
                  sub: '+1.0% Congress, +2% Loyalty',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={auditCooldown > 0}
                  onClick={() => onRunLeakAudit(opt.id)}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-2.5 text-left hover:border-[#132238] disabled:opacity-45"
                >
                  <p className="text-xs font-semibold text-stone-900">
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-stone-600">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                  <Award className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                  <span>Commend Aligned Secretary</span>
                </span>
                <span className="font-mono-num text-[11px] text-stone-500">
                  {commendCooldown > 0 ? `${commendCooldown} mo` : 'Ready'}
                </span>
              </div>
              {topAlignedMembers.length > 0 ? (
                <button
                  type="button"
                  disabled={commendCooldown > 0}
                  onClick={() => onCommendSecretary(topAlignedMembers[0])}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-xs font-semibold text-stone-800 hover:border-[#132238] disabled:opacity-45"
                >
                  Commend {topAlignedMembers[0].name} ({topAlignedMembers[0].roleTitle})
                </button>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Requires a Secretary at 75%+ loyalty.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                  <UserCog className="h-3.5 w-3.5 text-red-700" aria-hidden="true" />
                  <span>Acting Deputy Rotation</span>
                </span>
                <span className="font-mono-num text-[11px] text-stone-500">
                  {actingSwapCooldown > 0 ? `${actingSwapCooldown} mo` : 'Ready'}
                </span>
              </div>
              {lowLoyaltyMembers.length > 0 ? (
                <button
                  type="button"
                  disabled={actingSwapCooldown > 0}
                  onClick={() => onActingSwap(lowLoyaltyMembers[0])}
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-semibold text-red-900 hover:bg-red-100 disabled:opacity-45"
                >
                  Install Acting Deputy for {lowLoyaltyMembers[0].name}
                </button>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Available if any Secretary drops below 45% loyalty.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Row 3: Inter-Agency Task Force Builder */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <div className="border-b border-stone-100 pb-3">
          <h3 className="font-display text-base font-semibold text-stone-900">
            Inter-Agency Task Force Quick-Builders
          </h3>
          <p className="text-xs text-stone-600">
            Pair two Cabinet departments on a joint policy draft and queue it
            directly onto the Briefing Desk.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {INTERAGENCY_TASK_FORCES.map((tf) => (
            <div
              key={tf.id}
              className="rounded-lg border border-stone-200 bg-stone-50/70 p-3.5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-stone-500">
                  {tf.departments[0]} + {tf.departments[1]}
                </p>
                <p className="text-xs font-semibold text-stone-900">
                  {tf.title}
                </p>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  {tf.policyDraft}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onQueueTaskForce(tf.policyDraft, tf.speechDraft)}
                className="rounded-md bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557]"
              >
                Queue Joint Directive
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
