import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Handshake,
  MessageSquare,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  CabinetHarmonyChoice,
  CabinetHarmonyOutcome,
  CabinetMember,
} from '../types/game';
import {
  buildHarmonyRound2,
  buildHarmonyScenario,
  evaluateHarmonyMeeting,
  statusFromLoyalty,
} from '../data/cabinetHarmony';

interface CabinetHarmonyModalProps {
  member: CabinetMember;
  currentMonth: number;
  onClose: () => void;
  onComplete: (outcome: CabinetHarmonyOutcome) => void;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getStatusTextClass(status: CabinetMember['status']) {
  if (status === 'Aligned') return 'text-emerald-700';
  if (status === 'Cautious') return 'text-amber-700';
  return 'text-red-700';
}

export const CabinetHarmonyModal: React.FC<CabinetHarmonyModalProps> = ({
  member,
  currentMonth,
  onClose,
  onComplete,
}) => {
  const scenario = useMemo(() => buildHarmonyScenario(member), [member]);
  const [round1Choice, setRound1Choice] = useState<CabinetHarmonyChoice | null>(
    null
  );
  const [round2Choice, setRound2Choice] = useState<CabinetHarmonyChoice | null>(
    null
  );
  const [outcome, setOutcome] = useState<CabinetHarmonyOutcome | null>(null);

  const currentRapport = clamp(
    scenario.startingRapport +
      (round1Choice?.rapportDelta || 0) +
      (round2Choice?.rapportDelta || 0),
    5,
    100
  );

  const currentScandalRiskPct = clamp(
    Math.round(
      scenario.baseScandalRiskPct +
        (round1Choice?.scandalRiskDelta || 0) +
        (round2Choice?.scandalRiskDelta || 0)
    ),
    0,
    72
  );

  const projectedLoyalty = clamp(
    member.loyalty +
      Math.round(
        ((round1Choice?.rapportDelta || 0) +
          (round2Choice?.rapportDelta || 0)) *
          0.72
      ),
    15,
    98
  );
  const projectedStatus = statusFromLoyalty(projectedLoyalty);

  const round2 = useMemo(() => {
    if (!round1Choice) return null;
    return buildHarmonyRound2(scenario, round1Choice.tone, currentRapport);
  }, [scenario, round1Choice, currentRapport]);

  const handleSelectRound1 = (choice: CabinetHarmonyChoice) => {
    setRound1Choice(choice);
  };

  const handleSelectRound2 = (choice: CabinetHarmonyChoice) => {
    if (!round1Choice) return;
    setRound2Choice(choice);
    const evaluated = evaluateHarmonyMeeting({
      scenario,
      member,
      month: currentMonth,
      round1Choice,
      round2Choice: choice,
    });
    setOutcome(evaluated);
  };

  const activeRound = !round1Choice ? scenario.round1 : round2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cabinet-harmony-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-stone-200 bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Handshake className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                Cabinet Harmony Session · Month{' '}
                <span className="font-mono-num">{currentMonth}</span>
              </span>
              {!outcome && (
                <span className="font-mono-num text-stone-300">
                  · Round {round1Choice ? '2 / 2' : '1 / 2'}
                </span>
              )}
            </div>
            <h3
              id="cabinet-harmony-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              1-on-1 Meeting: {member.name}
            </h3>
            <p className="text-xs text-stone-300">
              {member.roleTitle} · {member.leaning} ·{' '}
              <span className="font-mono-num">
                Loyalty {member.loyalty}% ({member.status})
              </span>
            </p>
          </div>

          {!outcome && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel 1-on-1 meeting"
              className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Live Telemetry Strip */}
        <div className="grid grid-cols-1 gap-3 border-b border-stone-200 bg-stone-50 px-6 py-3.5 sm:grid-cols-3 text-xs">
          <div>
            <div className="flex items-center justify-between text-stone-600">
              <span>Meeting Rapport</span>
              <span className="font-mono-num font-bold text-stone-900">
                {outcome ? outcome.finalRapport : currentRapport} / 100
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full bg-[#132238] transition-all duration-300"
                style={{
                  width: `${outcome ? outcome.finalRapport : currentRapport}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
            <span className="text-[11px] text-stone-500">
              {outcome ? 'Resulting Status' : 'Projected Standing'}
            </span>
            <div className="flex items-center gap-1.5 font-mono-num font-semibold">
              <span className={getStatusTextClass(member.status)}>
                {member.status}
              </span>
              <ArrowRight className="h-3 w-3 text-stone-400" aria-hidden="true" />
              <span
                className={getStatusTextClass(
                  outcome ? outcome.newStatus : projectedStatus
                )}
              >
                {outcome ? outcome.newStatus : projectedStatus} (
                {outcome ? outcome.newLoyalty : projectedLoyalty}%)
              </span>
            </div>
          </div>

          <div
            className={`flex flex-col justify-between rounded-lg border px-3 py-2 ${
              currentScandalRiskPct >= 25
                ? 'border-red-200 bg-red-50'
                : currentScandalRiskPct > 0
                ? 'border-amber-200 bg-amber-50'
                : 'border-stone-200 bg-white'
            }`}
          >
            <span className="text-[11px] text-stone-600">
              Hidden Scandal Risk
            </span>
            <div className="flex items-center justify-between font-mono-num font-bold">
              <span
                className={
                  currentScandalRiskPct >= 25
                    ? 'text-red-800'
                    : currentScandalRiskPct > 0
                    ? 'text-amber-800'
                    : 'text-emerald-800'
                }
              >
                {outcome ? outcome.scandalRiskPct : currentScandalRiskPct}%
              </span>
              <span className="text-[10px] font-medium text-stone-600">
                {scenario.isToxic ? 'Toxic Relationship' : 'Standard Review'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {scenario.isToxic && !outcome && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                <strong>Toxic Relationship Warning:</strong> Trust with{' '}
                {member.name} is severely fractured ({member.status},{' '}
                <span className="font-mono-num">{member.loyalty}%</span> loyalty).
                Empathetic or pragmatic dialogue can repair the rift, while
                confrontational pressure sharply elevates the odds of exposing a
                damaging internal scandal.
              </p>
            </div>
          )}

          {/* Round 1 Reaction Transcript (shown during Round 2) */}
          {round1Choice && !outcome && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2 text-xs">
              <p className="font-semibold text-stone-500">
                Your Opening · {round1Choice.toneLabel}
              </p>
              <p className="text-stone-800">{round1Choice.promptQuote}</p>
              <div className="border-t border-stone-200 pt-2">
                <p className="font-semibold text-[#132238]">
                  {member.name} Responds:
                </p>
                <p className="mt-0.5 italic text-stone-700">
                  {round1Choice.officialResponse}
                </p>
              </div>
            </div>
          )}

          {/* Active Dialogue Round */}
          {!outcome && activeRound && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#132238]">
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    Round {activeRound.roundNumber}: {activeRound.topic}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-stone-900">
                  “{activeRound.officialOpening}”
                </p>
                <p className="text-[11px] text-stone-500">
                  Focus: {scenario.briefingContext}
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-stone-700">
                  Choose Your Oval Office Response
                </p>
                {activeRound.choices.map((choice) => {
                  const isConfrontational = choice.tone === 'confrontational';
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() =>
                        activeRound.roundNumber === 1
                          ? handleSelectRound1(choice)
                          : handleSelectRound2(choice)
                      }
                      className={`w-full text-left rounded-xl border p-4 transition-colors space-y-1.5 ${
                        isConfrontational
                          ? 'border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50'
                          : 'border-stone-200 bg-white hover:border-[#132238] hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {choice.label}
                        </span>
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${
                            choice.tone === 'empathetic'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : choice.tone === 'pragmatic'
                              ? 'border-sky-200 bg-sky-50 text-sky-800'
                              : choice.tone === 'directive'
                              ? 'border-stone-200 bg-stone-100 text-stone-800'
                              : 'border-red-200 bg-red-50 text-red-800'
                          }`}
                        >
                          {choice.toneLabel}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-stone-700">
                        {choice.promptQuote}
                      </p>
                      <p className="text-[11px] font-medium text-stone-500">
                        {choice.riskHint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meeting Outcome Summary */}
          {outcome && (
            <div className="space-y-4">
              {round2Choice && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1.5 text-xs">
                  <p className="font-semibold text-stone-500">
                    Closing Exchange · {round2Choice.toneLabel}
                  </p>
                  <p className="text-stone-800">{round2Choice.promptQuote}</p>
                  <p className="pt-1 italic text-stone-700">
                    {member.name}: {round2Choice.officialResponse}
                  </p>
                </div>
              )}

              <div
                className={`rounded-xl border p-5 space-y-3 ${
                  outcome.revealedScandal
                    ? 'border-red-300 bg-red-50'
                    : outcome.loyaltyDelta >= 0
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-amber-200 bg-amber-50/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  {outcome.revealedScandal ? (
                    <ShieldAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        outcome.loyaltyDelta >= 0
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold text-stone-900">
                      {outcome.headline}
                    </h4>
                    <p className="text-xs leading-relaxed text-stone-800">
                      {outcome.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 font-mono-num text-xs">
                  <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                    Loyalty {outcome.previousLoyalty}% → {outcome.newLoyalty}% (
                    {outcome.loyaltyDelta >= 0 ? '+' : ''}
                    {outcome.loyaltyDelta}%)
                  </span>
                  <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1 font-semibold text-stone-800">
                    Status: {outcome.previousStatus} → {outcome.newStatus}
                  </span>
                  {Math.abs(outcome.approvalDelta) >= 0.1 && (
                    <span
                      className={`rounded-md border px-2.5 py-1 font-semibold ${
                        outcome.approvalDelta >= 0
                          ? 'border-emerald-200 bg-white text-emerald-800'
                          : 'border-red-200 bg-white text-red-800'
                      }`}
                    >
                      Approval {outcome.approvalDelta >= 0 ? '+' : ''}
                      {outcome.approvalDelta}%
                    </span>
                  )}
                  {Math.abs(outcome.congressDelta) >= 0.1 && (
                    <span
                      className={`rounded-md border px-2.5 py-1 font-semibold ${
                        outcome.congressDelta >= 0
                          ? 'border-emerald-200 bg-white text-emerald-800'
                          : 'border-red-200 bg-white text-red-800'
                      }`}
                    >
                      Congress {outcome.congressDelta >= 0 ? '+' : ''}
                      {outcome.congressDelta}%
                    </span>
                  )}
                </div>

                {outcome.revealedScandal && (
                  <div className="rounded-lg border border-red-200 bg-white p-3.5 text-xs text-stone-800 space-y-1">
                    <p className="font-semibold text-red-800">
                      Breaking Scandal Exposed · {outcome.revealedScandal.outlet} (
                      {outcome.revealedScandal.severity})
                    </p>
                    <p className="font-semibold text-stone-900">
                      {outcome.revealedScandal.headline}
                    </p>
                    <p className="text-stone-700">
                      {outcome.revealedScandal.allegationSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 bg-stone-50 px-6 py-3.5">
          {!outcome ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
            >
              Cancel Meeting
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(outcome)}
              className={`rounded-lg px-5 py-2 text-xs font-semibold text-white ${
                outcome.revealedScandal
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-[#132238] hover:bg-[#1E3557]'
              }`}
            >
              {outcome.revealedScandal
                ? 'Confront Breaking Scandal Now'
                : 'Apply Meeting Outcome'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
