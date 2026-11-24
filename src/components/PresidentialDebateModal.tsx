import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Shield,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { DebateMatchupPreset } from '../data/debates';
import { DebateStanceOption, VoterBlocs } from '../types/game';

interface PresidentialDebateModalProps {
  matchup: DebateMatchupPreset;
  currentBlocs: VoterBlocs;
  onCompleteDebate: (result: {
    totalScore: number;
    momentumDelta: number;
    approvalDelta: number;
    blocDeltas: Partial<VoterBlocs>;
    summaryHeadline: string;
  }) => void;
  onClose: () => void;
}

export const PresidentialDebateModal: React.FC<PresidentialDebateModalProps> = ({
  matchup,
  onCompleteDebate,
  onClose,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedStanceId, setSelectedStanceId] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<
    { roundIndex: number; topic: string; stance: DebateStanceOption }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentRound = matchup.rounds[currentRoundIdx];
  const activeStance = currentRound?.stances.find(
    (s: DebateStanceOption) => s.id === selectedStanceId
  );

  const handleConfirmStance = () => {
    if (!activeStance) return;
    const nextResults = [
      ...roundResults,
      {
        roundIndex: currentRoundIdx,
        topic: currentRound.topic,
        stance: activeStance,
      },
    ];
    setRoundResults(nextResults);

    if (currentRoundIdx + 1 < matchup.rounds.length) {
      setCurrentRoundIdx((prev) => prev + 1);
      setSelectedStanceId(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinishAndApply = () => {
    let totalMomentum = 0;
    let totalApproval = 0;
    const aggregatedBlocs: Partial<VoterBlocs> = {
      workingClass: 0,
      suburbanModerates: 0,
      techFinance: 0,
      seniors: 0,
      youngVoters: 0,
    };

    for (const res of roundResults) {
      totalMomentum += res.stance.momentumDelta;
      totalApproval += res.stance.approvalDelta;
      for (const [k, val] of Object.entries(res.stance.blocImpacts)) {
        const key = k as keyof VoterBlocs;
        aggregatedBlocs[key] =
          (aggregatedBlocs[key] || 0) + Number(val || 0);
      }
    }

    const avgScore = Math.round(
      75 +
        totalMomentum * 2.5 +
        Math.min(15, Math.max(-10, totalApproval * 3))
    );
    const clampedScore = Math.min(99, Math.max(50, avgScore));

    const headline =
      clampedScore >= 90
        ? `Presidential Debate Triumph: Incumbent Dominates ${matchup.opponentName} in ${matchup.venueCity}`
        : clampedScore >= 75
        ? `Solid Debate Performance Reinforces Incumbent's Message in ${matchup.venueCity}`
        : `Tough Exchange: Challenger Presses Incumbent hard in ${matchup.venueCity} Debate`;

    onCompleteDebate({
      totalScore: clampedScore,
      momentumDelta: totalMomentum,
      approvalDelta: Number(totalApproval.toFixed(1)),
      blocDeltas: aggregatedBlocs,
      summaryHeadline: headline,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Presidential Debate Arena"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#C99A3B]">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C99A3B]">
                National General Election Debate · {matchup.venueCity}
              </p>
              <h2 className="font-display text-xl font-bold text-white">
                Presidential Debate Arena vs. {matchup.opponentName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isFinished ? (
            <div className="space-y-6">
              {/* Progress & Topic */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <span className="font-mono-num text-xs font-semibold text-[#132238]">
                    Round {currentRoundIdx + 1} of {matchup.rounds.length}
                  </span>
                  <h3 className="mt-0.5 font-display text-lg font-semibold text-stone-900">
                    {currentRound.topic}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {matchup.rounds.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 w-10 rounded-full transition-colors ${
                        i < currentRoundIdx
                          ? 'bg-[#132238]'
                          : i === currentRoundIdx
                          ? 'bg-[#C99A3B]'
                          : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Moderator Prompt & Opponent Attack */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
                    <MessageSquare className="h-4 w-4 text-[#132238]" aria-hidden="true" />
                    <span>Moderator Question</span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-800">
                    &ldquo;{currentRound.moderatorPrompt}&rdquo;
                  </p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-800">
                    <Shield className="h-4 w-4 text-red-700" aria-hidden="true" />
                    <span>{matchup.opponentName}&apos;s Attack</span>
                  </div>
                  <p className="text-sm leading-relaxed text-red-950 font-medium">
                    &ldquo;{currentRound.opponentAttack}&rdquo;
                  </p>
                </div>
              </div>

              {/* Stance Choices */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900">
                  Select Your Refutation &amp; Policy Stance:
                </label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {currentRound.stances.map((stance: DebateStanceOption) => {
                    const picked = selectedStanceId === stance.id;
                    return (
                      <button
                        key={stance.id}
                        type="button"
                        onClick={() => setSelectedStanceId(stance.id)}
                        className={`rounded-xl border p-4 text-left transition-colors flex flex-col justify-between ${
                          picked
                            ? 'border-[#132238] bg-[#132238]/[0.04] ring-2 ring-[#132238]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#132238]">
                              {stance.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                stance.tone === 'aggressive'
                                  ? 'bg-amber-100 text-amber-900'
                                  : stance.tone === 'visionary'
                                  ? 'bg-sky-100 text-sky-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {stance.tone}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-stone-700">
                            {stance.stanceText}
                          </p>
                        </div>

                        <div className="mt-4 border-t border-stone-100 pt-2 flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-emerald-700">
                            +{stance.momentumDelta} Momentum
                          </span>
                          <span className="text-[#132238]">
                            +{stance.approvalDelta}% Approval
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end border-t border-stone-200 pt-4">
                <button
                  type="button"
                  disabled={!selectedStanceId}
                  onClick={handleConfirmStance}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50"
                >
                  <span>Deliver Stance &amp; Advance Round</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Award className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-stone-900">
                  Debate Concluded in {matchup.venueCity}
                </h3>
                <p className="text-sm text-stone-600 max-w-lg mx-auto">
                  Voter panels and instantaneous snap polls have recorded your exchanges against {matchup.opponentName}. Here is your debate scorecard:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-2xl mx-auto text-left">
                {roundResults.map((res, idx) => (
                  <div
                    key={res.topic}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1.5"
                  >
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                      Round {idx + 1} · {res.topic}
                    </span>
                    <p className="text-xs font-bold text-stone-900">
                      {res.stance.title}
                    </p>
                    <p className="text-[11px] italic text-stone-600 leading-snug">
                      &ldquo;{res.stance.mediaReaction}&rdquo;
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleFinishAndApply}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557]"
                >
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span>Apply Debate Score &amp; Return to Campaign</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
