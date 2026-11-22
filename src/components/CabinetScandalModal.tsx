import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  UserX,
  SearchCheck,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import {
  CabinetScandalDecision,
  CabinetScandalEvent,
} from '../types/game';

interface CabinetScandalModalProps {
  scandal: CabinetScandalEvent;
  memberLoyalty?: number;
  onResolve: (decision: CabinetScandalDecision) => void;
}

export const CabinetScandalModal: React.FC<CabinetScandalModalProps> = ({
  scandal,
  memberLoyalty,
  onResolve,
}) => {
  const severityStyles =
    scandal.severity === 'Critical'
      ? 'border-red-300 bg-red-100 text-red-900'
      : scandal.severity === 'Severe'
      ? 'border-amber-300 bg-amber-100 text-amber-900'
      : 'border-stone-300 bg-stone-100 text-stone-800';

  const scaleLabel =
    scandal.severity === 'Critical'
      ? 'High Fallout (1.5×)'
      : scandal.severity === 'Severe'
      ? 'Elevated Fallout (1.25×)'
      : 'Standard Fallout (1.0×)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-[2px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scandal-title"
    >
      <div className="my-4 w-full max-w-2xl rounded-xl border border-stone-200 bg-white p-6 md:p-7 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-800">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Breaking Cabinet Scandal · Month {scandal.month}
              </span>
              <span className="text-xs font-medium text-stone-500">
                {scandal.outlet}
              </span>
            </div>
            <h2
              id="scandal-title"
              className="font-display text-xl md:text-2xl font-bold text-[#132238] leading-snug"
            >
              {scandal.headline}
            </h2>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-bold ${severityStyles}`}
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {scandal.severity} Severity
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              {scaleLabel}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Implicated Official
              </p>
              <p className="text-sm font-bold text-stone-900">
                {scandal.memberName}{' '}
                <span className="font-normal text-stone-600">
                  · {scandal.roleTitle}
                </span>
              </p>
            </div>
            {typeof memberLoyalty === 'number' && (
              <div className="rounded-md border border-stone-200 bg-white px-3 py-1 text-right">
                <span className="block text-[10px] font-medium uppercase tracking-wide text-stone-500">
                  Current Loyalty
                </span>
                <span className="font-mono-num text-sm font-bold text-[#132238]">
                  {memberLoyalty}%
                </span>
              </div>
            )}
          </div>

          <p className="text-sm leading-relaxed text-stone-700">
            {scandal.allegationSummary}
          </p>

          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
            <Landmark
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p>
              <strong className="font-semibold">Capitol Hill Pressure:</strong>{' '}
              {scandal.congressPressure}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Executive Response Required — Choose One Course of Action
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => onResolve('fire')}
              className="group flex flex-col justify-between rounded-xl border border-stone-300 bg-white p-4 text-left transition-all hover:border-red-600 hover:bg-red-50/40 focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-red-900">
                  <UserX className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                  <span>Fire Official</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Dismiss {scandal.memberName} immediately and install an acting
                  caretaker pending Senate confirmation.
                </p>
              </div>
              <div className="mt-3 border-t border-stone-200 pt-2.5 text-[11px] font-medium space-y-0.5">
                <p className="text-emerald-700">+ Public Approval &amp; Congress</p>
                <p className="text-red-700">− Cabinet Loyalty (−6% team)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onResolve('investigate')}
              className="group flex flex-col justify-between rounded-xl border border-stone-300 bg-white p-4 text-left transition-all hover:border-[#132238] hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#132238]"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#132238]">
                  <SearchCheck className="h-4 w-4 shrink-0 text-[#132238]" aria-hidden="true" />
                  <span>Investigate</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Order an independent Inspector General &amp; DOJ ethics review
                  while keeping the official under scrutiny.
                </p>
              </div>
              <div className="mt-3 border-t border-stone-200 pt-2.5 text-[11px] font-medium space-y-0.5">
                <p className="text-emerald-700">+ Modest Approval &amp; Congress</p>
                <p className="text-amber-700">− Target Loyalty (sharp drop)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onResolve('defend')}
              className="group flex flex-col justify-between rounded-xl border-2 border-[#132238] bg-[#132238] p-4 text-left text-white transition-all hover:bg-[#1E3557] focus:outline-none focus:ring-2 focus:ring-[#132238]"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  <span>Defend Publicly</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-200">
                  Stand firmly behind {scandal.memberName} from the podium and
                  dismiss oversight demands as partisan theater.
                </p>
              </div>
              <div className="mt-3 border-t border-white/15 pt-2.5 text-[11px] font-medium space-y-0.5">
                <p className="text-emerald-300">+ Major Loyalty (+20% / +4% team)</p>
                <p className="text-red-300">− Heavy Approval &amp; Congress hit</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
