import React, { useState } from 'react';
import {
  CheckCircle2,
  Landmark,
  Loader2,
  Newspaper,
  ScrollText,
  X,
} from 'lucide-react';
import {
  NationalMetrics,
  StateOfTheUnionResult,
} from '../types/game';
import { SOTU_THEMES } from '../data/institutionalActions';

interface StateOfTheUnionModalProps {
  presidentName: string;
  currentMonth: number;
  yearNumber: number;
  metrics: NationalMetrics;
  alreadyDeliveredThisYear: boolean;
  onDeliverAddress: (
    themeTitle: string,
    customRemarks: string
  ) => Promise<StateOfTheUnionResult>;
  onClose: () => void;
}

function signed(val: number, suffix = '%'): string {
  const n = Number(val.toFixed(1));
  return `${n > 0 ? '+' : ''}${n}${suffix}`;
}

export const StateOfTheUnionModal: React.FC<StateOfTheUnionModalProps> = ({
  presidentName,
  currentMonth,
  yearNumber,
  metrics,
  alreadyDeliveredThisYear,
  onDeliverAddress,
  onClose,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState(SOTU_THEMES[0].id);
  const [remarks, setRemarks] = useState(SOTU_THEMES[0].defaultRemarks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<StateOfTheUnionResult | null>(null);

  const selectedTheme =
    SOTU_THEMES.find((t) => t.id === selectedThemeId) ?? SOTU_THEMES[0];

  const handleSelectTheme = (id: string) => {
    setSelectedThemeId(id);
    const found = SOTU_THEMES.find((t) => t.id === id);
    if (found) setRemarks(found.defaultRemarks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyDeliveredThisYear || isSubmitting) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const outcome = await onDeliverAddress(
        selectedTheme.title,
        remarks.trim() || selectedTheme.defaultRemarks
      );
      setResult(outcome);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to deliver the State of the Union Address.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sotu-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Landmark className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                Joint Session of Congress · Year{' '}
                <span className="font-mono-num">{yearNumber}</span> (Month{' '}
                <span className="font-mono-num">{currentMonth}</span>)
              </span>
            </div>
            <h3
              id="sotu-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              State of the Union Address
            </h3>
            <p className="text-xs text-stone-300">
              President {presidentName} · House{' '}
              <span className="font-mono-num">{metrics.houseSeats}/435</span> ·
              Senate{' '}
              <span className="font-mono-num">{metrics.senateSeats}/100</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close State of the Union modal"
            className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-900"
            >
              {errorMsg}
            </div>
          )}

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {alreadyDeliveredThisYear && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
                  Your Year <span className="font-mono-num">{yearNumber}</span>{' '}
                  State of the Union Address has already been delivered. The next
                  annual address unlocks next year.
                </div>
              )}

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-stone-800">
                  1. Select Keynote Strategic Theme
                </span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SOTU_THEMES.map((theme) => {
                    const active = theme.id === selectedThemeId;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        disabled={alreadyDeliveredThisYear || isSubmitting}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`rounded-xl border p-3.5 text-left transition-colors disabled:opacity-50 ${
                          active
                            ? 'border-[#132238] bg-stone-50 ring-1 ring-[#132238]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <p className="text-xs font-bold text-stone-900">
                          {theme.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-stone-600">
                          {theme.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="sotu-remarks"
                  className="block text-xs font-semibold text-stone-800"
                >
                  2. Signature Opening &amp; Closing Pledge
                </label>
                <textarea
                  id="sotu-remarks"
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  disabled={alreadyDeliveredThisYear || isSubmitting}
                  placeholder="Write your prime-time address to Congress and the American people..."
                  className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={alreadyDeliveredThisYear || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      <span>Addressing Joint Session...</span>
                    </>
                  ) : (
                    <>
                      <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Deliver State of the Union</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#132238]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-semibold text-stone-600">
                        {result.leadOutlet} · {result.chamberReception}
                      </p>
                      <h4 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                        {result.leadHeadline}
                      </h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-stone-800">
                  {result.mediaSummary}
                </p>

                <div className="flex flex-wrap gap-2 font-mono-num text-xs">
                  <span
                    className={`rounded border bg-white px-2.5 py-1 font-bold ${
                      result.approvalDelta >= 0
                        ? 'border-emerald-200 text-emerald-800'
                        : 'border-red-200 text-red-800'
                    }`}
                  >
                    Approval {signed(result.approvalDelta)}
                  </span>
                  <span
                    className={`rounded border bg-white px-2.5 py-1 font-bold ${
                      result.congressDelta >= 0
                        ? 'border-emerald-200 text-emerald-800'
                        : 'border-red-200 text-red-800'
                    }`}
                  >
                    Congress {signed(result.congressDelta)}
                  </span>
                  {Math.abs(result.diplomaticDelta) >= 0.1 && (
                    <span className="rounded border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                      Diplomacy {signed(result.diplomaticDelta, '')}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-1">
                  <span className="font-semibold text-stone-500">
                    Chamber Leadership Reaction
                  </span>
                  <p className="leading-relaxed text-stone-800">
                    “{result.speakerReaction}”
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-1">
                  <span className="font-semibold text-stone-500">
                    Opposition Televised Rebuttal
                  </span>
                  <p className="leading-relaxed text-stone-800">
                    “{result.oppositionRebuttal}”
                  </p>
                </div>
              </div>

              {result.mediaReactions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                    <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Morning Headlines</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {result.mediaReactions.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-1 text-xs"
                      >
                        <p className="font-semibold text-stone-500">
                          {item.outlet} ·{' '}
                          <span className="capitalize">{item.tone}</span>
                        </p>
                        <p className="font-display text-sm font-bold text-stone-900">
                          {item.headline}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-[#132238] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
                >
                  Return to Briefing Desk
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
