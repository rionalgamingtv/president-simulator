import React from 'react';
import {
  Activity,
  Cpu,
  Flame,
  Globe2,
  Radar,
  Scale,
  Shield,
  Ship,
} from 'lucide-react';
import {
  AdminSuiteState,
  CyberDefenseMode,
  DefenseProcurementFocus,
  InstitutionalState,
  IntelFocusRegion,
  LegislativeRecordItem,
  MilitaryCommandState,
  NationalMetrics,
  TriadPosture,
} from '../types/game';
import {
  CYBER_DEFENSE_MODES,
  DEFENSE_PROCUREMENT_OPTIONS,
  FOREIGN_AID_PACKAGES,
  INTEL_FOCUS_REGIONS,
  SANCTION_ACTIONS,
  SanctionActionOption,
  TRIAD_POSTURES,
} from '../data/expansionSuites';

interface SituationSuitePanelProps {
  currentMonth: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  institutions: InstitutionalState;
  legislativeRecords: LegislativeRecordItem[];
  adminSuite: AdminSuiteState;
  onSetTriadPosture: (posture: TriadPosture) => void;
  onSetCyberMode: (mode: CyberDefenseMode) => void;
  onSetIntelRegion: (region: IntelFocusRegion) => void;
  onSetProcurementFocus: (focus: DefenseProcurementFocus) => void;
  onExecuteSanctionAction: (option: SanctionActionOption) => void;
  onExecuteForeignAid: (pkgId: string) => void;
  onTriggerStrategicReserve: (action: 'release' | 'refill') => void;
  onTriggerAlliedExercise: (regionLabel: string) => void;
}

export const SituationSuitePanel: React.FC<SituationSuitePanelProps> = ({
  currentMonth,
  metrics,
  military,
  institutions,
  legislativeRecords,
  adminSuite,
  onSetTriadPosture,
  onSetCyberMode,
  onSetIntelRegion,
  onSetProcurementFocus,
  onExecuteSanctionAction,
  onExecuteForeignAid,
  onTriggerStrategicReserve,
  onTriggerAlliedExercise,
}) => {
  const sanctionUsedThisMonth = adminSuite.lastSanctionMonth === currentMonth;
  const aidCooldown =
    typeof adminSuite.lastAidMonth === 'number'
      ? Math.max(0, 3 - (currentMonth - adminSuite.lastAidMonth))
      : 0;
  const reserveCooldown =
    typeof adminSuite.lastReserveMonth === 'number'
      ? Math.max(0, 4 - (currentMonth - adminSuite.lastReserveMonth))
      : 0;
  const exerciseCooldown =
    typeof adminSuite.lastExerciseMonth === 'number'
      ? Math.max(0, 3 - (currentMonth - adminSuite.lastExerciseMonth))
      : 0;

  const realRate = institutions.fedFundsRate - metrics.inflation;
  const eoCount = legislativeRecords.filter(
    (r) => r.recordType === 'Executive Order'
  ).length;
  const scotusRiskLabel =
    institutions.judiciaryClimate === 'Hostile' || eoCount >= 8
      ? 'Elevated Injunction Risk'
      : institutions.judiciaryClimate === 'Split'
      ? 'Moderate Review Scrutiny'
      : 'Low Constitutional Friction';

  return (
    <div className="space-y-6">
      {/* Row 1: Nuclear Triad, Cyber Command & Intel Focus */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <Shield className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Nuclear Triad &amp; Strategic Alert</span>
          </div>
          <div className="space-y-2">
            {TRIAD_POSTURES.map((tp) => (
              <button
                key={tp.id}
                type="button"
                onClick={() => onSetTriadPosture(tp.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                  adminSuite.triadPosture === tp.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>{tp.label}</span>
                  <span className="font-mono-num text-[11px] text-stone-600">
                    DEFCON {tp.defconTarget}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-600">{tp.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <Cpu className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Cyber Command Active Defense Matrix</span>
          </div>
          <div className="space-y-2">
            {CYBER_DEFENSE_MODES.map((cm) => (
              <button
                key={cm.id}
                type="button"
                onClick={() => onSetCyberMode(cm.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                  adminSuite.cyberDefenseMode === cm.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                  <span>{cm.label}</span>
                  <span className="text-[11px] text-stone-500">
                    {cm.cyberPosture}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-600">{cm.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <Radar className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Intelligence Satellite &amp; HUMINT Priority</span>
          </div>
          <div className="space-y-2">
            {INTEL_FOCUS_REGIONS.map((ir) => (
              <button
                key={ir.id}
                type="button"
                onClick={() => onSetIntelRegion(ir.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                  adminSuite.intelFocusRegion === ir.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <p className="text-xs font-semibold text-stone-900">
                  {ir.label}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-600">{ir.note}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Row 2: Sanctions, Foreign Aid, Strategic Reserves & Allied Drills */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Globe2 className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Sanctions &amp; Export Control Desk</span>
            </span>
            <span className="font-mono-num text-[11px] text-stone-500">
              Active: {adminSuite.activeSanctions.length} ·{' '}
              {sanctionUsedThisMonth ? 'Used This Month' : '1 Action/mo'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SANCTION_ACTIONS.map((opt) => {
              const isActive = adminSuite.activeSanctions.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 flex flex-col justify-between gap-2"
                >
                  <div>
                    <p className="text-[11px] text-stone-500">{opt.target}</p>
                    <p className="text-xs font-semibold text-stone-900">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-600">
                      {opt.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={sanctionUsedThisMonth}
                    onClick={() => onExecuteSanctionAction(opt)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-45 ${
                      isActive
                        ? 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-100'
                        : 'bg-[#132238] text-white hover:bg-[#1E3557]'
                    }`}
                  >
                    {isActive ? 'Lift / Revise Measure' : 'Enact Measure'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">
                Foreign Aid &amp; Alliance Burden-Sharing
              </span>
              <span className="font-mono-num text-stone-500">
                {aidCooldown > 0 ? `Cooldown ${aidCooldown} mo` : 'Ready'}
              </span>
            </div>
            <div className="space-y-2">
              {FOREIGN_AID_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50/70 p-2.5"
                >
                  <div>
                    <p className="text-xs font-semibold text-stone-900">
                      {pkg.label}
                    </p>
                    <p className="font-mono-num text-[11px] text-stone-600">
                      Diplomacy +{pkg.diplomaticDelta} · Debt +$
                      {(pkg.costTrillions * 1000).toFixed(0)}B
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={aidCooldown > 0}
                    onClick={() => onExecuteForeignAid(pkg.id)}
                    className="rounded-md bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap shrink-0"
                  >
                    Authorize Aid
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-stone-100 pt-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                  <Flame className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                  <span>Strategic Petroleum Reserve</span>
                </span>
                <span className="font-mono-num text-[11px] text-stone-500">
                  {reserveCooldown > 0 ? `${reserveCooldown} mo` : 'Ready'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={reserveCooldown > 0}
                  onClick={() => onTriggerStrategicReserve('release')}
                  className="flex-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-45"
                >
                  Release (-CPI)
                </button>
                <button
                  type="button"
                  disabled={reserveCooldown > 0}
                  onClick={() => onTriggerStrategicReserve('refill')}
                  className="flex-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-45"
                >
                  Refill (+Ready)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                  <Ship className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                  <span>Allied Readiness Drill</span>
                </span>
                <span className="font-mono-num text-[11px] text-stone-500">
                  {exerciseCooldown > 0 ? `${exerciseCooldown} mo` : 'Ready'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={exerciseCooldown > 0}
                  onClick={() => onTriggerAlliedExercise('NATO Baltic Shield')}
                  className="flex-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-45"
                >
                  NATO Drill
                </button>
                <button
                  type="button"
                  disabled={exerciseCooldown > 0}
                  onClick={() =>
                    onTriggerAlliedExercise('Indo-Pacific Maritime Patrol')
                  }
                  className="flex-1 rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-45"
                >
                  Pacific Drill
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Row 3: Yield Curve Stress, Supreme Court Docket & Defense Procurement */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <Activity className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Treasury Stress &amp; Supreme Court Risk</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="text-stone-500">Real Fed Rate (Rate - CPI)</span>
              <p className="mt-0.5 font-mono-num text-lg font-bold text-stone-900">
                {realRate >= 0 ? '+' : ''}
                {realRate.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="text-stone-500">Defense Budget</span>
              <p className="mt-0.5 font-mono-num text-lg font-bold text-stone-900">
                ${military.defenseBudgetBillions}B
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-xs">
            <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]" aria-hidden="true" />
            <div>
              <p className="font-semibold text-stone-900">
                Supreme Court Docket Risk: {scotusRiskLabel}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-600">
                Judiciary Climate: {institutions.judiciaryClimate} · Executive
                Orders Signed: <span className="font-mono-num">{eoCount}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-xs font-semibold text-stone-700">
              Pentagon Defense Procurement &amp; Modernization Priority
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {DEFENSE_PROCUREMENT_OPTIONS.map((dp) => (
              <button
                key={dp.id}
                type="button"
                onClick={() => onSetProcurementFocus(dp.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  adminSuite.defenseProcurementFocus === dp.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <p className="text-xs font-semibold text-stone-900">
                  {dp.label}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-600">{dp.note}</p>
                <p className="mt-1 font-mono-num text-[11px] text-stone-700">
                  Readiness +{dp.readinessDelta}% · Budget +${dp.budgetDelta}B
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
