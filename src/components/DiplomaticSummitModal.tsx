import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Handshake,
  MessageSquare,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  DiplomaticSummitChoice,
  DiplomaticSummitOutcome,
  DiplomaticSummitPower,
  NationalMetrics,
} from '../types/game';
import {
  buildSummitRound1,
  buildSummitRound2,
  buildSummitRound3,
  computeInitialSummitMetrics,
  evaluateDiplomaticSummit,
} from '../data/diplomaticSummit';

interface DiplomaticSummitModalProps {
  power: DiplomaticSummitPower;
  currentMonth: number;
  metrics: NationalMetrics;
  stateSecCompetence: number;
  onComplete: (outcome: DiplomaticSummitOutcome) => void;
  onClose: () => void;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const DiplomaticSummitModal: React.FC<DiplomaticSummitModalProps> = ({
  power,
  currentMonth,
  metrics,
  stateSecCompetence,
  onComplete,
  onClose,
}) => {
  const initial = useMemo(
    () => computeInitialSummitMetrics(power, metrics, stateSecCompetence),
    [power, metrics, stateSecCompetence]
  );

  const [choices, setChoices] = useState<DiplomaticSummitChoice[]>([]);
  const [outcome, setOutcome] = useState<DiplomaticSummitOutcome | null>(null);

  const currentTrust = clamp(
    initial.startingTrust + choices.reduce((acc, c) => acc + c.trustDelta, 0),
    10,
    100
  );
  const currentWalkoutRisk = clamp(
    Math.round(
      initial.baseWalkoutRiskPct +
        choices.reduce((acc, c) => acc + c.walkoutRiskDelta, 0)
    ),
    2,
    70
  );
  const projectedStanding = choices.reduce(
    (acc, c) => acc + c.standingBonus,
    0
  );

  const round1 = useMemo(
    () => buildSummitRound1(power, initial.startingTrust),
    [power, initial.startingTrust]
  );

  const round2 = useMemo(() => {
    if (choices.length < 1) return null;
    return buildSummitRound2(power, choices[0].tone, currentTrust);
  }, [power, choices, currentTrust]);

  const round3 = useMemo(() => {
    if (choices.length < 2) return null;
    return buildSummitRound3(power, currentTrust, currentWalkoutRisk);
  }, [power, choices, currentTrust, currentWalkoutRisk]);

  const activeRound =
    choices.length === 0 ? round1 : choices.length === 1 ? round2 : round3;

  const handlePickChoice = (choice: DiplomaticSummitChoice) => {
    const nextChoices = [...choices, choice];
    setChoices(nextChoices);

    if (nextChoices.length === 3) {
      const evaluated = evaluateDiplomaticSummit({
        power,
        month: currentMonth,
        startingTrust: initial.startingTrust,
        baseWalkoutRiskPct: initial.baseWalkoutRiskPct,
        choices: nextChoices,
      });
      setOutcome(evaluated);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diplomatic-summit-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Globe className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                Bilateral Summit · {power.country} · Month{' '}
                <span className="font-mono-num">{currentMonth}</span>
              </span>
              {!outcome && (
                <span className="font-mono-num text-stone-300">
                  · Round {choices.length + 1} / 3
                </span>
              )}
            </div>
            <h3
              id="diplomatic-summit-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              {power.summitTitle}
            </h3>
            <p className="text-xs text-stone-300">
              {power.counterpartName} · {power.counterpartTitle} (
              {power.postureLabel})
            </p>
          </div>

          {!outcome && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel diplomatic summit"
              className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Live Telemetry Strip */}
        <div className="grid grid-cols-1 gap-3 border-b border-stone-200 bg-stone-50 px-6 py-3.5 sm:grid-cols-3 text-xs">
          <div>
            <span className="block text-[11px] font-medium text-stone-500">
              Delegation Trust
            </span>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                <div
                  className={`h-full transition-all ${
                    currentTrust >= 65
                      ? 'bg-emerald-600'
                      : currentTrust >= 45
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${currentTrust}%` }}
                />
              </div>
              <span className="font-mono-num font-bold text-stone-900">
                {currentTrust}/100
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-stone-500">
              Walkout Risk
            </span>
            <p
              className={`mt-1 font-mono-num font-bold ${
                currentWalkoutRisk >= 28
                  ? 'text-red-700'
                  : currentWalkoutRisk >= 15
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {currentWalkoutRisk}% ({power.postureLabel})
            </p>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-stone-500">
              Projected Standing
            </span>
            <p className="mt-1 font-mono-num font-bold text-[#132238]">
              {projectedStanding >= 0 ? '+' : ''}
              {projectedStanding.toFixed(1)} pts (Now{' '}
              {metrics.diplomaticStanding.toFixed(1)})
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!outcome && activeRound ? (
            <>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1.5">
                <p className="text-[11px] font-semibold text-stone-500">
                  Summit Dossier · {power.secondaryMetricLabel}
                </p>
                <p className="text-xs leading-relaxed text-stone-700">
                  {power.coreIssue}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#132238]">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>{activeRound.stageTitle}</span>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-4">
                  <p className="text-sm leading-relaxed text-stone-900">
                    {activeRound.counterpartPrompt}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {activeRound.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handlePickChoice(choice)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-left transition-all hover:border-[#132238] hover:bg-white group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-stone-900 group-hover:text-[#132238]">
                          {choice.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#132238] shrink-0">
                          <span className="capitalize">{choice.tone}</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        {choice.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 font-mono-num text-[11px] text-stone-500">
                        <span>
                          Trust:{' '}
                          <strong
                            className={
                              choice.trustDelta >= 0
                                ? 'text-emerald-700'
                                : 'text-red-700'
                            }
                          >
                            {choice.trustDelta >= 0
                              ? `+${choice.trustDelta}`
                              : choice.trustDelta}
                          </strong>
                        </span>
                        <span>
                          Walkout Risk:{' '}
                          <strong
                            className={
                              choice.walkoutRiskDelta > 0
                                ? 'text-red-700'
                                : 'text-emerald-700'
                            }
                          >
                            {choice.walkoutRiskDelta > 0
                              ? `+${choice.walkoutRiskDelta}%`
                              : `${choice.walkoutRiskDelta}%`}
                          </strong>
                        </span>
                        <span>
                          Standing:{' '}
                          <strong
                            className={
                              choice.standingBonus >= 0
                                ? 'text-[#132238]'
                                : 'text-amber-800'
                            }
                          >
                            {choice.standingBonus >= 0 ? '+' : ''}
                            {choice.standingBonus.toFixed(1)}
                          </strong>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : outcome ? (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-5 space-y-3 ${
                  outcome.walkedOut
                    ? 'border-red-300 bg-red-50'
                    : outcome.verdict === 'Stalled Talks'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-emerald-200 bg-emerald-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {outcome.walkedOut ? (
                    <ShieldAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                      aria-hidden="true"
                    />
                  ) : outcome.verdict === 'Stalled Talks' ? (
                    <AlertTriangle
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-700">
                      {outcome.verdict} · {outcome.country}
                    </p>
                    <h4 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                      {outcome.headline}
                    </h4>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-stone-800">
                  {outcome.summary}
                </p>

                <div className="flex flex-wrap gap-2 font-mono-num text-xs pt-1">
                  <span
                    className={`rounded border bg-white px-2.5 py-1 font-bold ${
                      outcome.diplomaticDelta >= 0
                        ? 'border-emerald-200 text-emerald-800'
                        : 'border-red-200 text-red-800'
                    }`}
                  >
                    Diplomacy {outcome.diplomaticDelta >= 0 ? '+' : ''}
                    {outcome.diplomaticDelta.toFixed(1)} pts
                  </span>
                  <span className="rounded border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                    Approval {outcome.approvalDelta >= 0 ? '+' : ''}
                    {outcome.approvalDelta.toFixed(1)}%
                  </span>
                  {Math.abs(outcome.gdpDelta) >= 0.01 && (
                    <span className="rounded border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                      GDP {outcome.gdpDelta >= 0 ? '+' : ''}
                      {outcome.gdpDelta.toFixed(2)}%
                    </span>
                  )}
                  {Math.abs(outcome.inflationDelta) >= 0.01 && (
                    <span className="rounded border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                      Inflation {outcome.inflationDelta >= 0 ? '+' : ''}
                      {outcome.inflationDelta.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onComplete(outcome)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1E3557]"
                >
                  <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Apply Summit Results &amp; Close</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
