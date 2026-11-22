import React from 'react';
import { Building2, Handshake, X } from 'lucide-react';
import { CapitolWhipOption, NationalMetrics } from '../types/game';
import { CAPITOL_WHIP_OPTIONS } from '../data/institutionalActions';

interface CapitolWhipModalProps {
  currentMonth: number;
  metrics: NationalMetrics;
  lastWhipMonth: number | null;
  onExecuteWhip: (option: CapitolWhipOption) => void;
  onClose: () => void;
}

export const CapitolWhipModal: React.FC<CapitolWhipModalProps> = ({
  currentMonth,
  metrics,
  lastWhipMonth,
  onExecuteWhip,
  onClose,
}) => {
  const usedThisMonth = lastWhipMonth === currentMonth;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capitol-whip-modal-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Building2 className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                Capitol Hill Vote Whipping · Month{' '}
                <span className="font-mono-num">{currentMonth}</span>
              </span>
            </div>
            <h3
              id="capitol-whip-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              Capitol Hill Legislative Summit
            </h3>
            <p className="text-xs text-stone-300 font-mono-num">
              Congress Support {metrics.congressSupport.toFixed(1)}% · House{' '}
              {metrics.houseSeats}/435 · Senate {metrics.senateSeats}/100
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Capitol Hill summit"
            className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {usedThisMonth ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
              You have already negotiated a legislative whip concession with Capitol
              Hill leadership this month. Additional whip deals unlock next month.
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-stone-600">
              Negotiate a concrete legislative concession with House and Senate
              caucuses to build coalition votes before submitting major policy
              directives. Limited to one negotiation per month.
            </p>
          )}

          <div className="space-y-3">
            {CAPITOL_WHIP_OPTIONS.map((option) => (
              <div
                key={option.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-stone-500">
                      Target: {option.caucusTarget}
                    </p>
                    <h4 className="font-display text-base font-bold text-stone-900">
                      {option.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    disabled={usedThisMonth}
                    onClick={() => {
                      onExecuteWhip(option);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap"
                  >
                    <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Seal Deal</span>
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-stone-700">
                  {option.summary}
                </p>

                <p className="font-mono-num text-[11px] font-semibold text-[#132238]">
                  {option.tradeoffLabel}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-stone-200 bg-stone-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
