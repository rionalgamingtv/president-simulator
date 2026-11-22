import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  EmergencyResolutionRecord,
  NationalMetrics,
  StabilityMetricKey,
  StabilitySeverity,
} from '../types/game';
import { evaluateInstitutionalStability } from '../data/institutionalStability';

interface InstitutionalStabilityMonitorProps {
  metrics: NationalMetrics;
  currentMonth: number;
  addressedStabilityMonths: Partial<Record<StabilityMetricKey, number>>;
  emergencyResolutions: EmergencyResolutionRecord[];
  onTriggerEmergencyCheck: (metricKey: StabilityMetricKey) => void;
}

const SEVERITY_BADGE_CLASS: Record<StabilitySeverity, string> = {
  Nominal: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Elevated: 'border-amber-200 bg-amber-50 text-amber-900',
  Severe: 'border-orange-300 bg-orange-50 text-orange-900',
  Critical: 'border-red-300 bg-red-50 text-red-900',
};

const BAR_FILL_CLASS: Record<StabilitySeverity, string> = {
  Nominal: 'bg-emerald-600',
  Elevated: 'bg-amber-500',
  Severe: 'bg-orange-600',
  Critical: 'bg-red-700',
};

function SeverityIcon({ severity }: { severity: StabilitySeverity }) {
  if (severity === 'Critical') {
    return <AlertOctagon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  if (severity === 'Severe' || severity === 'Elevated') {
    return <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
  }
  return <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
}

export const InstitutionalStabilityMonitor: React.FC<
  InstitutionalStabilityMonitorProps
> = ({
  metrics,
  currentMonth,
  addressedStabilityMonths,
  emergencyResolutions,
  onTriggerEmergencyCheck,
}) => {
  const { overallSeverity, statuses, breachedKeys } =
    evaluateInstitutionalStability(metrics);

  const latestResolution =
    emergencyResolutions.length > 0
      ? emergencyResolutions[emergencyResolutions.length - 1]
      : null;

  return (
    <section
      aria-label="Institutional Stability Monitor"
      className={`rounded-xl border bg-white p-5 space-y-4 ${
        breachedKeys.length > 0 ? 'border-red-300' : 'border-stone-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <Activity className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>
              Institutional Stability Monitor · Historical Guardrail Watch
            </span>
          </div>
          <h2 className="font-display text-lg font-semibold text-stone-900">
            Systemic Threshold Telemetry
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-stone-500">
            Breach triggers immediate Emergency Alert
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${SEVERITY_BADGE_CLASS[overallSeverity]}`}
          >
            <SeverityIcon severity={overallSeverity} />
            <span>
              {overallSeverity === 'Critical'
                ? 'Constitutional Emergency'
                : `${overallSeverity} Stability`}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statuses.map((item) => {
          const addressedThisMonth =
            addressedStabilityMonths[item.metricKey] === currentMonth;

          return (
            <div
              key={item.metricKey}
              className={`rounded-lg border p-4 space-y-2.5 ${
                item.breached
                  ? 'border-red-300 bg-red-50/60'
                  : 'border-stone-200 bg-stone-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-stone-700">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-mono-num text-xl font-bold text-stone-900">
                    {item.formattedValue}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${SEVERITY_BADGE_CLASS[item.severity]}`}
                >
                  <SeverityIcon severity={item.severity} />
                  <span>{item.severity}</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono-num text-stone-600">
                  <span>Danger Threshold: {item.thresholdLabel}</span>
                  <span
                    className={
                      item.breached
                        ? 'font-semibold text-red-800'
                        : 'text-stone-600'
                    }
                  >
                    {item.marginLabel}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-label={`${item.label} proximity to historical danger threshold`}
                  aria-valuenow={item.proximityPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full transition-all duration-200 ${BAR_FILL_CLASS[item.severity]}`}
                    style={{ width: `${item.proximityPct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-stone-500">
                <span>{item.historicalReference}</span>
                {item.breached && (
                  <button
                    type="button"
                    onClick={() => onTriggerEmergencyCheck(item.metricKey)}
                    className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-2 py-0.5 font-semibold text-red-800 hover:bg-red-100"
                  >
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {addressedThisMonth
                        ? 'Re-open Crisis Action'
                        : 'Address Now'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {latestResolution && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
          <span>
            <strong className="text-stone-800">
              Last Emergency Response (Month{' '}
              {String(latestResolution.month).padStart(2, '0')}):
            </strong>{' '}
            {latestResolution.chosenOptionTitle}
            {latestResolution.customDirectiveNote
              ? ` · “${latestResolution.customDirectiveNote}”`
              : ''}
          </span>
          <span className="font-mono-num text-stone-500">
            Post-action reading: {latestResolution.resolvedValueLabel}
            {latestResolution.stillBreached ? ' (Watch Ongoing)' : ' (Stabilized)'}
          </span>
        </div>
      )}
    </section>
  );
};
