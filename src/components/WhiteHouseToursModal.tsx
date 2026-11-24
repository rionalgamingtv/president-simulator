import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Landmark,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import {
  MilitaryCommandState,
  NationalMetrics,
  VoterBlocs,
} from '../types/game';
import {
  ScheduledWhiteHouseTourRecord,
  TourScreeningPosture,
  WHITE_HOUSE_TOUR_GROUPS,
  WhiteHouseTourGroup,
  computeTourProjection,
} from '../data/whiteHouseTours';

interface WhiteHouseToursModalProps {
  currentMonth: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  lastTourMonth: number | null;
  tourHistory: ScheduledWhiteHouseTourRecord[];
  onScheduleTour: (payload: {
    group: WhiteHouseTourGroup;
    posture: TourScreeningPosture;
    approvalDelta: number;
    readinessDelta: number;
    blocImpacts: Partial<VoterBlocs>;
  }) => void;
  onClose: () => void;
}

export const WhiteHouseToursModal: React.FC<WhiteHouseToursModalProps> = ({
  currentMonth,
  metrics,
  military,
  lastTourMonth,
  tourHistory,
  onScheduleTour,
  onClose,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    WHITE_HOUSE_TOUR_GROUPS[0].id
  );
  const [posture, setPosture] = useState<TourScreeningPosture>('standard');
  const [confirmationRecord, setConfirmationRecord] = useState<{
    groupName: string;
    routeLabel: string;
    approvalDelta: number;
    readinessDelta: number;
    headline: string;
  } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const selectedGroup = useMemo(
    () =>
      WHITE_HOUSE_TOUR_GROUPS.find((g) => g.id === selectedGroupId) ||
      WHITE_HOUSE_TOUR_GROUPS[0],
    [selectedGroupId]
  );

  const projection = useMemo(
    () =>
      computeTourProjection(
        selectedGroup,
        posture,
        military.intelThreatLevel
      ),
    [selectedGroup, posture, military.intelThreatLevel]
  );

  const alreadyScheduledThisMonth = lastTourMonth === currentMonth;
  const readinessTooLow =
    military.forceReadiness + projection.readinessDelta < 10;
  const canSchedule = !alreadyScheduledThisMonth && !readinessTooLow;

  const handleConfirmSchedule = () => {
    if (!canSchedule) return;
    onScheduleTour({
      group: selectedGroup,
      posture,
      approvalDelta: projection.approvalDelta,
      readinessDelta: projection.readinessDelta,
      blocImpacts: projection.blocImpacts,
    });
    setConfirmationRecord({
      groupName: selectedGroup.name,
      routeLabel: selectedGroup.routeLabel,
      approvalDelta: projection.approvalDelta,
      readinessDelta: projection.readinessDelta,
      headline: selectedGroup.headline,
    });
  };

  const recentHistory = [...tourHistory].slice(-4).reverse();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="white-house-tours-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-[2px]"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#F7F6F2] shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Office of the Social Secretary · Secret Service Visitor Operations
            </p>
            <h2
              id="white-house-tours-title"
              className="mt-0.5 flex items-center gap-2 font-display text-xl font-bold text-[#132238]"
            >
              <Landmark className="h-5 w-5 text-[#132238]" aria-hidden="true" />
              <span>White House Public Tours</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close White House Tours"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Telemetry Strip */}
        <div className="grid grid-cols-2 gap-4 border-b border-stone-200 bg-stone-50 px-6 py-3 text-xs sm:grid-cols-4">
          <div>
            <span className="block text-stone-500">Public Approval</span>
            <span className="font-mono-num text-base font-bold text-stone-900">
              {metrics.approval.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="block text-stone-500">Security Readiness</span>
            <span
              className={`font-mono-num text-base font-bold ${
                military.forceReadiness < 30
                  ? 'text-red-700'
                  : 'text-stone-900'
              }`}
            >
              {military.forceReadiness.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="block text-stone-500">Threat &amp; DEFCON</span>
            <span className="font-mono-num text-base font-semibold text-stone-800">
              {military.intelThreatLevel} · D{military.defconLevel}
            </span>
          </div>
          <div>
            <span className="block text-stone-500">Monthly Schedule</span>
            <span
              className={`text-sm font-semibold ${
                alreadyScheduledThisMonth
                  ? 'text-amber-800'
                  : 'text-emerald-800'
              }`}
            >
              {alreadyScheduledThisMonth
                ? `Completed (Month ${currentMonth})`
                : `Open (Month ${currentMonth})`}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {confirmationRecord && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1.5"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-emerald-900">
                    Tour Scheduled · {confirmationRecord.groupName}
                  </p>
                  <p className="text-sm font-semibold text-stone-900">
                    {confirmationRecord.headline}
                  </p>
                  <p className="font-mono-num text-xs text-stone-700">
                    Route: {confirmationRecord.routeLabel} · Public Approval{' '}
                    <span className="font-semibold text-emerald-800">
                      +{confirmationRecord.approvalDelta.toFixed(1)}%
                    </span>{' '}
                    · Security Readiness{' '}
                    <span className="font-semibold text-amber-800">
                      {confirmationRecord.readinessDelta.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interest Group Grid */}
          <section aria-label="Select visitor interest group" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-900">
                1. Choose Interest Group &amp; Tour Route
              </h3>
              <span className="text-xs text-stone-500">
                1 scheduled delegation per month
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {WHITE_HOUSE_TOUR_GROUPS.map((group) => {
                const isSelected = group.id === selectedGroup.id;
                const preview = computeTourProjection(
                  group,
                  posture,
                  military.intelThreatLevel
                );
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-base font-bold text-stone-900">
                          {group.name}
                        </span>
                        <Users
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            isSelected ? 'text-[#132238]' : 'text-stone-400'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="text-xs font-medium text-stone-500">
                        {group.routeLabel} · {group.targetGroupsLabel}
                      </p>
                      <p className="text-xs leading-relaxed text-stone-700">
                        {group.summary}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5 font-mono-num text-xs">
                      <span className="font-semibold text-emerald-800">
                        Approval +{preview.approvalDelta.toFixed(1)}%
                      </span>
                      <span className="font-semibold text-amber-800">
                        Security Readiness {preview.readinessDelta.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Screening Posture */}
          <section
            aria-label="Security screening posture"
            className="rounded-xl border border-stone-200 bg-white p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  2. Secret Service Screening Posture
                </h3>
                <p className="text-xs text-stone-600">
                  {projection.postureSummary}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setPosture('standard')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    posture === 'standard'
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Standard Welcome
                </button>
                <button
                  type="button"
                  onClick={() => setPosture('tightened')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    posture === 'tightened'
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tightened Perimeter
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <span>
                <strong className="text-stone-800">Security Assessment:</strong>{' '}
                {selectedGroup.securityNote}
                {military.intelThreatLevel === 'High' ||
                military.intelThreatLevel === 'Severe'
                  ? ` Elevated threat posture (${military.intelThreatLevel}) increases Uniformed Division staffing demand.`
                  : ''}
              </span>
            </div>
          </section>

          {/* Recent Tours Log */}
          {recentHistory.length > 0 && (
            <section
              aria-label="Recent White House tours"
              className="rounded-xl border border-stone-200 bg-white p-4 space-y-2.5"
            >
              <h3 className="text-xs font-semibold text-stone-700">
                Recent Hosted Delegations ({tourHistory.length} total)
              </h3>
              <div className="divide-y divide-stone-100 text-xs">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <div>
                      <span className="font-mono-num font-semibold text-stone-500">
                        M{item.month}
                      </span>{' '}
                      <span className="font-semibold text-stone-900">
                        {item.groupName}
                      </span>
                      <span className="text-stone-500">
                        {' '}
                        · {item.posture === 'tightened' ? 'Tightened Perimeter' : 'Standard Welcome'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono-num">
                      <span className="font-semibold text-emerald-800">
                        +{item.approvalDelta.toFixed(1)}% Approval
                      </span>
                      <span className="font-semibold text-amber-800">
                        {item.readinessDelta.toFixed(1)}% Readiness
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-6 py-4">
          <div className="text-xs text-stone-600">
            {alreadyScheduledThisMonth ? (
              <span className="font-medium text-amber-800">
                A public tour has already been hosted this month. Advance to next month to schedule another delegation.
              </span>
            ) : readinessTooLow ? (
              <span className="font-medium text-red-700">
                Security readiness is too low to safely authorize public tours right now.
              </span>
            ) : (
              <span className="font-mono-num">
                Projected: <strong className="text-emerald-800">+{projection.approvalDelta.toFixed(1)}% Approval</strong> ·{' '}
                <strong className="text-amber-800">{projection.readinessDelta.toFixed(1)}% Security Readiness</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!canSchedule}
              onClick={handleConfirmSchedule}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap shrink-0"
            >
              <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {alreadyScheduledThisMonth
                  ? 'Tour Hosted This Month'
                  : 'Schedule White House Tour'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
