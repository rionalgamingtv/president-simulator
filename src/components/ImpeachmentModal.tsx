import React, { useState } from 'react';
import {
  AlertTriangle,
  Gavel,
  Scale,
  Handshake,
  LogOut,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import {
  ImpeachmentResult,
  ImpeachmentStrategy,
  NationalMetrics,
  PresidentProfile,
  VicePresidentProfile,
} from '../types/game';

interface ImpeachmentModalProps {
  profile: PresidentProfile;
  vicePresident: VicePresidentProfile;
  currentMonth: number;
  metrics: NationalMetrics;
  isSubmitting: boolean;
  result: ImpeachmentResult | null;
  errorMsg: string | null;
  onRunProceedings: (
    strategy: ImpeachmentStrategy,
    defenseStatement: string
  ) => Promise<void>;
  onResignInstead: () => void;
  onCompleteRemoval: (result: ImpeachmentResult) => void;
  onCloseSurvived: (result: ImpeachmentResult) => void;
  onDismissPreVote: () => void;
}

export const ImpeachmentModal: React.FC<ImpeachmentModalProps> = ({
  profile,
  vicePresident,
  currentMonth,
  metrics,
  isSubmitting,
  result,
  errorMsg,
  onRunProceedings,
  onResignInstead,
  onCompleteRemoval,
  onCloseSurvived,
  onDismissPreVote,
}) => {
  const [defenseText, setDefenseText] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-[2px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="impeachment-title"
    >
      <div className="my-4 w-full max-w-2xl rounded-xl border border-stone-200 bg-white p-6 md:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded border border-red-300 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-900">
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              Constitutional Crisis · Approval Below 5.0%
            </span>
            <h2
              id="impeachment-title"
              className="font-display text-2xl font-bold text-[#132238]"
            >
              {result
                ? result.senateConvicted
                  ? 'Senate Convicts & Removes President'
                  : result.houseImpeached
                  ? 'Senate Acquits President in Impeachment Trial'
                  : 'House Rejects Articles of Impeachment'
                : `Impeachment Proceedings — Month ${currentMonth}`}
            </h2>
          </div>

          {!result && !isSubmitting && (
            <button
              type="button"
              onClick={onDismissPreVote}
              aria-label="Defer impeachment modal"
              className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900"
          >
            {errorMsg}
          </div>
        )}

        {!result ? (
          <>
            <p className="text-sm leading-relaxed text-stone-700">
              With public approval collapsing to{' '}
              <strong className="font-mono-num text-red-700">
                {metrics.approval.toFixed(1)}%
              </strong>{' '}
              (below the 5.0% constitutional collapse threshold), House leaders
              have drafted formal Articles of Impeachment against President{' '}
              {profile.name}. If the House votes to impeach (218+ Yea), the
              Senate will hold a trial requiring <strong>67 votes</strong> to
              convict and install Vice President {vicePresident.name}.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-center">
              <div>
                <span className="block text-[11px] text-stone-500">Approval</span>
                <span className="font-mono-num text-base font-bold text-red-700">
                  {metrics.approval.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Congress Support
                </span>
                <span className="font-mono-num text-base font-bold text-stone-900">
                  {metrics.congressSupport.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  House Coalition
                </span>
                <span className="font-mono-num text-base font-bold text-stone-900">
                  {metrics.houseSeats} / 435
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Senate Coalition
                </span>
                <span className="font-mono-num text-base font-bold text-stone-900">
                  {metrics.senateSeats} / 100
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="impeachment-defense"
                className="block text-xs font-semibold text-stone-700"
              >
                Presidential Defense or Concession Statement to Congress
                (Optional)
              </label>
              <textarea
                id="impeachment-defense"
                rows={2}
                value={defenseText}
                onChange={(e) => setDefenseText(e.target.value)}
                disabled={isSubmitting}
                placeholder="Write a closing constitutional defense, apology, or concession offer to sway wavering Senators..."
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3 text-xs leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onRunProceedings('contest', defenseText)}
                className="flex flex-col justify-between rounded-xl border-2 border-[#132238] bg-[#132238] p-4 text-left text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Scale className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {isSubmitting ? 'Voting...' : 'Contest Impeachment Trial'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-200">
                    Challenge the Articles on constitutional grounds and take
                    your chances in a full House vote and Senate trial.
                  </p>
                </div>
                <p className="mt-3 border-t border-white/15 pt-2 text-[11px] font-medium text-amber-200">
                  High Removal Risk if Senate hits 67+
                </p>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onRunProceedings('deal', defenseText)}
                className="flex flex-col justify-between rounded-xl border border-stone-300 bg-white p-4 text-left transition-colors hover:border-[#132238] hover:bg-stone-50 disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#132238]">
                    <Handshake className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Strike Survival Deal</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    Offer sweeping legislative and oversight concessions to
                    secure the 34+ Senate votes needed for acquittal.
                  </p>
                </div>
                <p className="mt-3 border-t border-stone-200 pt-2 text-[11px] font-medium text-emerald-700">
                  Best Odds to Survive Vote
                </p>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={onResignInstead}
                className="flex flex-col justify-between rounded-xl border border-red-200 bg-red-50/50 p-4 text-left transition-colors hover:border-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-red-900">
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Resign Before Vote</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-red-900/80">
                    Step down voluntarily prior to roll call, transferring power
                    to Vice President {vicePresident.name}.
                  </p>
                </div>
                <p className="mt-3 border-t border-red-200 pt-2 text-[11px] font-medium text-red-800">
                  Ends Term Immediately
                </p>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                {result.leadOutlet}
              </p>
              <p className="font-display text-lg font-bold text-stone-900">
                {result.leadHeadline}
              </p>
              <p className="text-xs font-semibold text-[#132238]">
                {result.articlesTitle}
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                {result.articlesSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  House Impeachment Roll Call (218 Needed)
                </span>
                <p className="mt-1 font-mono-num text-xl font-bold text-stone-900">
                  {result.houseYea} Yea · {result.houseNay} Nay
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                    result.houseImpeached ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {result.houseImpeached
                    ? 'Articles Adopted — Sent to Senate'
                    : 'Articles Rejected — President Cleared'}
                </span>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  Senate Trial Roll Call (67 Needed)
                </span>
                <p className="mt-1 font-mono-num text-xl font-bold text-stone-900">
                  {result.houseImpeached
                    ? `${result.senateYea} Guilty · ${result.senateNay} Not Guilty`
                    : 'No Trial Held'}
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                    result.senateConvicted ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {result.senateConvicted ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      Convicted &amp; Removed from Office
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Acquitted — Remains in Office
                    </>
                  )}
                </span>
              </div>
            </div>

            <p className="text-xs italic text-stone-600">
              {result.chiefJusticeNote}
            </p>
            <p className="text-sm leading-relaxed text-stone-800">
              {result.verdictSummary}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] font-semibold text-stone-500">
                  Majority Leader
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-800">
                  “{result.majorityLeaderQuote}”
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] font-semibold text-stone-500">
                  Opposition Leader
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-800">
                  “{result.oppositionLeaderQuote}”
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-stone-200 pt-4">
              {result.senateConvicted ? (
                <button
                  type="button"
                  onClick={() => onCompleteRemoval(result)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-900"
                >
                  <span>Proceed to Legacy Dossier</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onCloseSurvived(result)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3557]"
                >
                  <span>Return to Oval Office</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResignModalProps {
  profile: PresidentProfile;
  vicePresident: VicePresidentProfile;
  currentMonth: number;
  metrics: NationalMetrics;
  onConfirmResign: (statement: string) => void;
  onCancel: () => void;
}

export const ResignModal: React.FC<ResignModalProps> = ({
  profile,
  vicePresident,
  currentMonth,
  metrics,
  onConfirmResign,
  onCancel,
}) => {
  const [resignStatement, setResignStatement] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resign-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 md:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-800">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Presidential Resignation · Month {currentMonth}
            </span>
            <h2
              id="resign-title"
              className="mt-1.5 font-display text-2xl font-bold text-[#132238]"
            >
              Resign the Presidency?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel resignation"
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-stone-700">
          Stepping down ends President {profile.name}&apos;s term immediately in
          Month {currentMonth} (at{' '}
          <strong className="font-mono-num">
            {metrics.approval.toFixed(1)}%
          </strong>{' '}
          approval) and transfers constitutional authority to Vice President{' '}
          <strong>{vicePresident.name}</strong>. Your record will be compiled
          into the Presidential Legacy Dossier and Library.
        </p>

        <div>
          <label
            htmlFor="resignation-note"
            className="block text-xs font-semibold text-stone-700"
          >
            Farewell / Resignation Statement (Optional)
          </label>
          <textarea
            id="resignation-note"
            rows={2}
            value={resignStatement}
            onChange={(e) => setResignStatement(e.target.value)}
            placeholder={`e.g., To spare the nation prolonged division, I am stepping aside for ${vicePresident.name}...`}
            className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3 text-xs leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2.5 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel — Remain in Office
          </button>
          <button
            type="button"
            onClick={() => onConfirmResign(resignStatement)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Resignation &amp; Step Down</span>
          </button>
        </div>
      </div>
    </div>
  );
};
