import React from 'react';
import { Award, RotateCcw, ArrowRight, Megaphone, Clock } from 'lucide-react';
import {
  CareerEvaluation,
  NationalMetrics,
  PresidentProfile,
  TurnOutcome,
} from '../types/game';
import { getPartyMeta } from '../data/scenarios';

interface MidtermModalProps {
  outcome: TurnOutcome;
  metrics: NationalMetrics;
  onContinue: () => void;
}

export const MidtermModal: React.FC<MidtermModalProps> = ({
  outcome,
  metrics,
  onContinue,
}) => {
  const shift = outcome.midtermSeatShift;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="midterm-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-7 shadow-xl space-y-5">
        <div>
          <p className="text-xs font-medium text-stone-500">
            Month 24 · National Referendum
          </p>
          <h2
            id="midterm-title"
            className="mt-1 font-display text-2xl font-bold text-[#132238]"
          >
            Midterm Election Results
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-stone-700">
          {shift?.summary ||
            'Voters across all fifty states weighed your first two years in office, reshaping the balance of power on Capitol Hill.'}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              House Coalition Seats
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-bold text-stone-900">
              {metrics.houseSeats} / 435
            </span>
            {shift && (
              <span
                className={`mt-1 block font-mono-num text-xs font-semibold ${
                  shift.houseDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {shift.houseDelta >= 0 ? '+' : ''}
                {shift.houseDelta} seats
              </span>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Senate Coalition Seats
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-bold text-stone-900">
              {metrics.senateSeats} / 100
            </span>
            {shift && (
              <span
                className={`mt-1 block font-mono-num text-xs font-semibold ${
                  shift.senateDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {shift.senateDelta >= 0 ? '+' : ''}
                {shift.senateDelta} seats
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3557]"
          >
            <span>Proceed to Year 3</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReelectionPromptModalProps {
  profile: PresidentProfile;
  currentMonth: number;
  metrics: NationalMetrics;
  onRunForReelection: () => void;
  onDeclineReelection: () => void;
}

export const ReelectionPromptModal: React.FC<ReelectionPromptModalProps> = ({
  profile,
  currentMonth,
  metrics,
  onRunForReelection,
  onDeclineReelection,
}) => {
  const partyMeta = getPartyMeta(profile.party, profile.coalition);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reelection-title"
    >
      <div className="w-full max-w-xl rounded-xl border border-stone-200 bg-white p-7 shadow-xl space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-stone-500">
              Month {currentMonth} of {profile.termLength} · Presidential Election
              Decision
            </p>
            <span
              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${partyMeta.badgeClass}`}
            >
              {partyMeta.shortCode} · {partyMeta.label}
            </span>
          </div>
          <h2
            id="reelection-title"
            className="mt-1.5 font-display text-2xl font-bold text-[#132238]"
          >
            Will President {profile.name} Run for Re-Election?
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-stone-700">
          Party leaders, donors, and the national press are waiting on your
          announcement. Decide whether to launch a formal re-election campaign
          or step aside from campaigning and finish your current term.
        </p>

        <div className="grid grid-cols-3 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-center">
          <div>
            <span className="block text-[11px] text-stone-500">Approval</span>
            <span className="font-mono-num text-base font-bold text-stone-900">
              {metrics.approval.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-stone-500">GDP Growth</span>
            <span className="font-mono-num text-base font-bold text-stone-900">
              {metrics.gdpGrowth.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="block text-[11px] text-stone-500">
              Months Left
            </span>
            <span className="font-mono-num text-base font-bold text-stone-900">
              {Math.max(1, profile.termLength - currentMonth + 1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
          <button
            type="button"
            onClick={onRunForReelection}
            className="rounded-xl border-2 border-[#132238] bg-[#132238] p-4 text-left text-white transition-colors hover:bg-[#1E3557]"
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Megaphone className="h-4 w-4" aria-hidden="true" />
              <span>Yes — Run for Re-Election</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-200">
              Launch your campaign headquarters, face a general election
              challenger, and campaign on the trail through your term.
            </p>
          </button>

          <button
            type="button"
            onClick={onDeclineReelection}
            className="rounded-xl border border-stone-300 bg-white p-4 text-left text-stone-900 transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              <Clock className="h-4 w-4 text-stone-600" aria-hidden="true" />
              <span>No — Continue Current Term</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
              Decline a second-term bid, gain bipartisan goodwill in Congress,
              and focus strictly on governing your remaining months.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

interface CareerEndViewProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  metrics: NationalMetrics;
  evaluation: CareerEvaluation | null;
  collapseReason?: string;
  isLoading: boolean;
  onOpenLibrary: () => void;
  onPlayAgain: () => void;
}

export const CareerEndView: React.FC<CareerEndViewProps> = ({
  profile,
  scenarioTitle,
  metrics,
  evaluation,
  collapseReason,
  isLoading,
  onOpenLibrary,
  onPlayAgain,
}) => {
  const partyMeta = getPartyMeta(profile.party, profile.coalition);

  return (
    <main className="mx-auto max-w-[960px] px-6 py-10">
      <div className="rounded-xl border border-stone-200 bg-white p-8 md:p-10 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium text-stone-500">
                Presidential Legacy Dossier · {scenarioTitle}
              </p>
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${partyMeta.badgeClass}`}
              >
                {partyMeta.shortCode} · {partyMeta.label}
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-3xl font-bold text-[#132238]">
              {collapseReason
                ? `Administration Ended Early — President ${profile.name}`
                : `The Term of President ${profile.name}`}
            </h1>
            {evaluation && (
              <p className="mt-1 text-base font-medium text-stone-600">
                {evaluation.legacyTitle}
              </p>
            )}
          </div>

          {evaluation && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-center">
              <span className="block text-xs font-medium text-stone-500">
                Historian Grade
              </span>
              <span className="font-display text-3xl font-bold text-[#132238]">
                {evaluation.historicalGrade}
              </span>
            </div>
          )}
        </div>

        {collapseReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <strong>Constitutional Conclusion:</strong> {collapseReason}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Final Approval</span>
            <span className="mt-1 block font-mono-num text-xl font-semibold text-stone-900">
              {metrics.approval.toFixed(1)}%
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">GDP Growth</span>
            <span className="mt-1 block font-mono-num text-xl font-semibold text-stone-900">
              {metrics.gdpGrowth.toFixed(1)}%
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Inflation</span>
            <span className="mt-1 block font-mono-num text-xl font-semibold text-stone-900">
              {metrics.inflation.toFixed(1)}%
            </span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Unemployment</span>
            <span className="mt-1 block font-mono-num text-xl font-semibold text-stone-900">
              {metrics.unemployment.toFixed(1)}%
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-stone-600">
            Compiling historical evaluation and presidential archives...
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-stone-500">
                Historical Assessment
              </h2>
              <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                {evaluation.historianEssay}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-sm font-semibold text-stone-900">
                  Defining Achievements
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm text-stone-700 list-disc pl-4">
                  {evaluation.definingAchievements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-sm font-semibold text-stone-900">
                  Major Missteps &amp; Headwinds
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm text-stone-700 list-disc pl-4">
                  {evaluation.majorMissteps.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-[#132238]/[0.04] p-4 flex items-start gap-3">
              <Award
                className="mt-0.5 h-5 w-5 shrink-0 text-[#132238]"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-stone-600">
                  Electoral &amp; Legacy Verdict
                </p>
                <p className="mt-0.5 text-sm font-medium text-stone-900">
                  {evaluation.reelectionVerdict}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-6">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            <span>Open Presidential Library</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3557]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </main>
  );
};
