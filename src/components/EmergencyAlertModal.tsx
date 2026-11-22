import React, { useState } from 'react';
import {
  AlertOctagon,
  History,
  Landmark,
  ShieldAlert,
  TrendingDown,
  Zap,
} from 'lucide-react';
import {
  EmergencyAlertEvent,
  EmergencyResponseOption,
  PresidentProfile,
} from '../types/game';

interface EmergencyAlertModalProps {
  profile: PresidentProfile;
  alert: EmergencyAlertEvent;
  onResolve: (
    alert: EmergencyAlertEvent,
    option: EmergencyResponseOption,
    customDirectiveNote: string
  ) => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  profile,
  alert,
  onResolve,
}) => {
  const [customNote, setCustomNote] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-[2px] overflow-y-auto"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-alert-title"
      aria-describedby="emergency-alert-summary"
    >
      <div className="my-4 w-full max-w-3xl rounded-xl border-2 border-red-400 bg-white p-6 md:p-7 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-900">
              <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Emergency Alert · Institutional Stability Breach · Month{' '}
                {String(alert.month).padStart(2, '0')}
              </span>
            </div>
            <h2
              id="emergency-alert-title"
              className="font-display text-2xl font-bold text-[#132238] leading-snug"
            >
              {alert.title}
            </h2>
            <p className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
              <History className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span>{alert.historicalBenchmark}</span>
            </p>
          </div>

          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-right shrink-0">
            <span className="block text-[11px] font-semibold text-red-800">
              Current vs. Threshold
            </span>
            <p className="mt-0.5 font-mono-num text-xl font-bold text-red-900">
              {alert.triggerValueLabel}{' '}
              <span className="text-xs font-semibold text-red-700">
                (Limit {alert.thresholdLabel})
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p
            id="emergency-alert-summary"
            className="text-sm leading-relaxed text-stone-800"
          >
            President {profile.name}, {alert.briefSummary}
          </p>

          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950">
            <Landmark
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p>
              <strong className="font-semibold">
                Immediate Institutional Risk:
              </strong>{' '}
              {alert.institutionalConsequence}
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="emergency-directive-note"
            className="block text-xs font-semibold text-stone-700"
          >
            Presidential Emergency Rationale / Statement (Optional — recorded in
            Executive Order &amp; Press Wire)
          </label>
          <textarea
            id="emergency-directive-note"
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add an official White House justification or guidance for agency heads..."
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3 text-xs leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-900">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Immediate Executive Intervention Required — Select One Response
              </span>
            </p>
            <span className="text-[11px] text-stone-500">
              Cannot proceed until crisis is addressed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {alert.options.map((opt, idx) => {
              const isPrimary = idx === 0;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onResolve(alert, opt, customNote.trim())}
                  className={`flex flex-col justify-between rounded-xl p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238] ${
                    isPrimary
                      ? 'border-2 border-[#132238] bg-[#132238] text-white hover:bg-[#1E3557]'
                      : 'border border-stone-300 bg-white text-stone-900 hover:border-[#132238] hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div
                      className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                        isPrimary ? 'text-amber-200' : 'text-[#132238]'
                      }`}
                    >
                      {isPrimary ? (
                        <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      ) : (
                        <TrendingDown
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span>{opt.instrumentLabel}</span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug">
                      {opt.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isPrimary ? 'text-stone-200' : 'text-stone-600'
                      }`}
                    >
                      {opt.description}
                    </p>
                  </div>

                  <p
                    className={`mt-3 border-t pt-2.5 font-mono-num text-[11px] font-semibold leading-snug ${
                      isPrimary
                        ? 'border-white/15 text-emerald-200'
                        : 'border-stone-200 text-stone-700'
                    }`}
                  >
                    {opt.tradeoffSummary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
