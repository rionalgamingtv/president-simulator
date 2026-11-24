import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Gavel,
  Landmark,
  Scale,
  X,
  XCircle,
} from 'lucide-react';
import {
  CONSTITUTIONAL_DOCKET_CASES,
  DocketCase,
  JUDICIAL_NOMINEES,
  JUDICIARY_HEARING_QUESTIONS,
  JudicialNomineeProfile,
  SupremeCourtJustice,
  computeBenchBreakdown,
} from '../data/supremeCourt';
import { InstitutionalState, NationalMetrics, PartyId, VoterBlocs } from '../types/game';

interface SupremeCourtModalProps {
  currentMonth: number;
  party?: PartyId;
  metrics: NationalMetrics;
  institutions: InstitutionalState;
  bench: SupremeCourtJustice[];
  resolvedCaseIds: string[];
  onResolveCase: (result: {
    caseId: string;
    caseName: string;
    strategyLabel: string;
    upheld: boolean;
    voteLabel: string;
    approvalDelta: number;
    congressDelta: number;
    gdpDelta: number;
    headline: string;
    rulingSummary: string;
  }) => void;
  onConfirmNominee: (result: {
    replacedJusticeId: string;
    replacedJusticeName: string;
    newJustice: SupremeCourtJustice;
    approved: boolean;
    senateYea: number;
    senateNay: number;
    derivedClimate: InstitutionalState['judiciaryClimate'];
    approvalDelta: number;
    congressDelta: number;
    blocImpacts: Partial<VoterBlocs>;
    headline: string;
    summary: string;
  }) => void;
  onClose: () => void;
}

type CourtTab = 'bench' | 'docket' | 'nominate';

export const SupremeCourtModal: React.FC<SupremeCourtModalProps> = ({
  party,
  metrics,
  institutions,
  bench,
  resolvedCaseIds,
  onResolveCase,
  onConfirmNominee,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CourtTab>('docket');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    CONSTITUTIONAL_DOCKET_CASES.find((c) => !resolvedCaseIds.includes(c.id))?.id ||
      CONSTITUTIONAL_DOCKET_CASES[0].id
  );
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    CONSTITUTIONAL_DOCKET_CASES[0].briefStrategies[0].id
  );
  const [caseResultBanner, setCaseResultBanner] = useState<{
    caseName: string;
    upheld: boolean;
    voteLabel: string;
    summary: string;
  } | null>(null);

  // Nomination & Confirmation Hearing state
  const defaultRetiringJustice =
    bench.find((j) => j.retirementRisk === 'Imminent') ||
    bench.find((j) => j.retirementRisk === 'Moderate') ||
    bench[1];
  const [vacantJusticeId, setVacantJusticeId] = useState<string>(
    defaultRetiringJustice?.id || bench[0]?.id || 'sc-2'
  );
  const [selectedNomineeId, setSelectedNomineeId] = useState<string>(
    JUDICIAL_NOMINEES[0].id
  );
  const [hearingAnswers, setHearingAnswers] = useState<Record<string, string>>({
    [JUDICIARY_HEARING_QUESTIONS[0].id]:
      JUDICIARY_HEARING_QUESTIONS[0].responses[0].id,
    [JUDICIARY_HEARING_QUESTIONS[1].id]:
      JUDICIARY_HEARING_QUESTIONS[1].responses[0].id,
  });
  const [confirmationResultBanner, setConfirmationResultBanner] = useState<{
    approved: boolean;
    voteLabel: string;
    nomineeName: string;
    summary: string;
  } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const breakdown = useMemo(
    () => computeBenchBreakdown(bench, party),
    [bench, party]
  );

  const activeCase: DocketCase =
    CONSTITUTIONAL_DOCKET_CASES.find((c) => c.id === selectedCaseId) ||
    CONSTITUTIONAL_DOCKET_CASES[0];

  const activeStrategy =
    activeCase.briefStrategies.find((s) => s.id === selectedStrategyId) ||
    activeCase.briefStrategies[0];

  const isCaseResolved = resolvedCaseIds.includes(activeCase.id);

  // Estimate ruling vote split from current 9-justice bench + Solicitor General brief
  const projectedDocketPreview = useMemo(() => {
    let baseSupportVotes = 0;
    for (const j of bench) {
      if (j.alignment === 'swing') {
        baseSupportVotes += 0.65;
      } else if (activeCase.leaningBonusForGov === 'neutral') {
        baseSupportVotes += j.alignment === 'conservative' ? 0.55 : 0.45;
      } else if (j.alignment === activeCase.leaningBonusForGov) {
        baseSupportVotes += 0.85;
      } else {
        baseSupportVotes += 0.2;
      }
    }
    const rawVotes = Math.round(
      Math.max(1, Math.min(8, baseSupportVotes + activeStrategy.swingShift * 0.65))
    );
    return {
      projectedFor: rawVotes,
      projectedAgainst: 9 - rawVotes,
      likelyUpheld: rawVotes >= 5,
    };
  }, [bench, activeCase, activeStrategy]);

  const handleArgueCase = () => {
    if (isCaseResolved) return;
    // Slight deterministic + probabilistic judicial variation
    const swingRoll = (Math.random() - 0.45) * 1.4;
    const finalFor = Math.max(
      1,
      Math.min(8, Math.round(projectedDocketPreview.projectedFor + swingRoll))
    );
    const finalAgainst = 9 - finalFor;
    const upheld = finalFor >= 5;
    const voteLabel = `${finalFor}–${finalAgainst} ${upheld ? 'Upheld' : 'Struck Down'}`;
    const outcomeData = upheld ? activeCase.upheldImpact : activeCase.struckDownImpact;

    setCaseResultBanner({
      caseName: activeCase.caseName,
      upheld,
      voteLabel,
      summary: outcomeData.rulingSummary,
    });

    onResolveCase({
      caseId: activeCase.id,
      caseName: activeCase.caseName,
      strategyLabel: activeStrategy.label,
      upheld,
      voteLabel,
      approvalDelta: Number(
        (outcomeData.approvalDelta + activeStrategy.approvalDelta).toFixed(1)
      ),
      congressDelta: Number(
        (outcomeData.congressDelta + activeStrategy.congressDelta).toFixed(1)
      ),
      gdpDelta: outcomeData.gdpDelta,
      headline: outcomeData.headline,
      rulingSummary: outcomeData.rulingSummary,
    });
  };

  const selectedNominee: JudicialNomineeProfile =
    JUDICIAL_NOMINEES.find((n) => n.id === selectedNomineeId) ||
    JUDICIAL_NOMINEES[0];

  const retiringJustice =
    bench.find((j) => j.id === vacantJusticeId) || bench[0];

  const hearingProjection = useMemo(() => {
    let hearingBonus = 0;
    let approvalBoost = 0;
    for (const q of JUDICIARY_HEARING_QUESTIONS) {
      const chosenId = hearingAnswers[q.id];
      const resp =
        q.responses.find((r) => r.id === chosenId) || q.responses[0];
      hearingBonus += resp.confirmationBonus;
      approvalBoost += resp.approvalDelta;
    }

    const baseSenate = metrics.senateSeats;
    const supportShift = (metrics.congressSupport - 50) * 0.14;
    const appealShift = selectedNominee.bipartisanAppeal * 0.55;
    const rawYea = Math.round(
      baseSenate + supportShift + appealShift + hearingBonus * 0.45
    );
    const projectedYea = Math.max(32, Math.min(78, rawYea));
    return {
      projectedYea,
      projectedNay: 100 - projectedYea,
      hearingBonus,
      approvalBoost: Number(approvalBoost.toFixed(1)),
    };
  }, [metrics.senateSeats, metrics.congressSupport, selectedNominee, hearingAnswers]);

  const handleHoldConfirmationVote = () => {
    const jitter = Math.round((Math.random() - 0.45) * 3);
    const senateYea = Math.max(
      30,
      Math.min(82, hearingProjection.projectedYea + jitter)
    );
    const senateNay = 100 - senateYea;
    const approved = senateYea >= 50; // VP tie-break clears 50-50
    const voteLabel =
      senateYea === 50
        ? `Confirmed 50–50 (VP Tie-Break)`
        : approved
        ? `Confirmed ${senateYea}–${senateNay}`
        : `Rejected ${senateYea}–${senateNay}`;

    const newJustice: SupremeCourtJustice = {
      id: `sc-new-${Date.now()}`,
      seatNumber: retiringJustice.seatNumber,
      name: selectedNominee.name.replace(/\s*\(.*?\)$/, ''),
      role: retiringJustice.role,
      philosophy: selectedNominee.philosophy,
      alignment: selectedNominee.alignment,
      appointedYear: new Date().getFullYear(),
      retirementRisk: 'Low',
      swingSensitivity:
        selectedNominee.alignment === 'swing'
          ? 66
          : selectedNominee.alignment === 'conservative'
          ? 24
          : 30,
    };

    const nextBench = approved
      ? bench.map((j) => (j.id === retiringJustice.id ? newJustice : j))
      : bench;
    const nextBreakdown = computeBenchBreakdown(nextBench, party);

    const summary = approved
      ? `${newJustice.name} takes Seat ${retiringJustice.seatNumber} (${voteLabel}), shifting the Court to ${nextBreakdown.summaryLabel}.`
      : `Senate floor coalition fell short (${voteLabel}) after contentious Judiciary hearings; ${retiringJustice.name} remains on the docket pending a new nominee.`;

    setConfirmationResultBanner({
      approved,
      voteLabel,
      nomineeName: selectedNominee.name,
      summary,
    });

    onConfirmNominee({
      replacedJusticeId: retiringJustice.id,
      replacedJusticeName: retiringJustice.name,
      newJustice,
      approved,
      senateYea,
      senateNay,
      derivedClimate: nextBreakdown.derivedClimate,
      approvalDelta: approved
        ? Number((1.2 + hearingProjection.approvalBoost).toFixed(1))
        : -2.1,
      congressDelta: approved ? 1.5 : -2.8,
      blocImpacts: approved
        ? selectedNominee.blocImpacts
        : { suburbanModerates: -1 },
      headline: approved
        ? `Senate Confirms ${newJustice.name} to Supreme Court (${senateYea}–${senateNay})`
        : `Senate Rejects Supreme Court Nominee ${selectedNominee.name} (${senateYea}–${senateNay})`,
      summary,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Supreme Court Bench and Confirmation Hearings"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#F7F6F2] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#132238] text-[#C99A3B]">
              <Scale className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">
                Article III Judiciary · {breakdown.summaryLabel} · Climate:{' '}
                <strong className="text-stone-900">
                  {institutions.judiciaryClimate}
                </strong>
              </p>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Supreme Court Bench &amp; Confirmation Desk
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Supreme Court desk"
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('docket')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'docket'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Constitutional Docket ({CONSTITUTIONAL_DOCKET_CASES.length - resolvedCaseIds.length} Pending)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nominate')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'nominate'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Vacancy &amp; Senate Hearing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bench')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'bench'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              9-Justice Bench ({breakdown.conservative}C · {breakdown.swing}S · {breakdown.progressive}P)
            </button>
          </div>

          <div className="text-xs font-medium text-stone-600 font-mono-num">
            Senate Seats: <strong className="text-stone-900">{metrics.senateSeats}/100</strong> · Hill Support:{' '}
            <strong className="text-stone-900">{metrics.congressSupport.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'docket' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Case Selector List */}
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Active Supreme Court Petitions
                </h3>
                {CONSTITUTIONAL_DOCKET_CASES.map((c) => {
                  const done = resolvedCaseIds.includes(c.id);
                  const selected = c.id === activeCase.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setSelectedStrategyId(c.briefStrategies[0].id);
                      }}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-[#132238] bg-white shadow-sm'
                          : 'border-stone-200 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-mono-num">
                        <span>{c.docketNumber}</span>
                        <span
                          className={
                            done
                              ? 'font-semibold text-emerald-700'
                              : 'font-semibold text-amber-700'
                          }
                        >
                          {done ? 'Decided' : 'Oral Argument Ready'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-stone-900 leading-snug">
                        {c.caseName}
                      </p>
                      <p className="mt-1 text-xs text-stone-600">{c.issueArea}</p>
                    </button>
                  );
                })}
              </div>

              {/* Case Brief & Argument Controls */}
              <div className="lg:col-span-7 space-y-5">
                {caseResultBanner && (
                  <div
                    className={`rounded-xl border p-4 ${
                      caseResultBanner.upheld
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-red-200 bg-red-50 text-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        {caseResultBanner.upheld ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-700" />
                        )}
                        <span>
                          Ruling Delivered: {caseResultBanner.voteLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCaseResultBanner(null)}
                        className="text-xs underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed">
                      <strong>{caseResultBanner.caseName}:</strong>{' '}
                      {caseResultBanner.summary}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
                  <div className="border-b border-stone-200 pb-4">
                    <p className="text-xs text-stone-500 font-mono-num">
                      {activeCase.docketNumber} · {activeCase.issueArea}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-stone-900">
                      {activeCase.caseName}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">
                      {activeCase.summary}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[#132238]">
                      White House Legal Objective: {activeCase.administrationGoal}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Select Solicitor General Brief Strategy
                    </p>
                    {activeCase.briefStrategies.map((strat) => {
                      const chosen = strat.id === activeStrategy.id;
                      return (
                        <button
                          key={strat.id}
                          type="button"
                          disabled={isCaseResolved}
                          onClick={() => setSelectedStrategyId(strat.id)}
                          className={`w-full rounded-lg border p-3.5 text-left transition-colors disabled:opacity-60 ${
                            chosen
                              ? 'border-[#132238] bg-stone-50'
                              : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-stone-900">
                              {strat.label}
                            </span>
                            <span className="text-xs font-mono-num text-stone-600">
                              Swing Shift: {strat.swingShift >= 0 ? `+${strat.swingShift}` : strat.swingShift} · Congress{' '}
                              {strat.congressDelta >= 0 ? `+${strat.congressDelta}%` : `${strat.congressDelta}%`}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-stone-600">
                            {strat.legalArgument}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
                    <div className="text-xs text-stone-600 font-mono-num">
                      Projected 9-Justice Split:{' '}
                      <strong
                        className={
                          projectedDocketPreview.likelyUpheld
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }
                      >
                        {projectedDocketPreview.projectedFor}–
                        {projectedDocketPreview.projectedAgainst}{' '}
                        {projectedDocketPreview.likelyUpheld
                          ? '(Likely Upheld)'
                          : '(At Risk)'}
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={isCaseResolved}
                      onClick={handleArgueCase}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap shrink-0"
                    >
                      <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {isCaseResolved
                          ? 'Decision Recorded'
                          : 'File Brief & Hold Oral Argument'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nominate' && (
            <div className="space-y-6">
              {confirmationResultBanner && (
                <div
                  className={`rounded-xl border p-4 ${
                    confirmationResultBanner.approved
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                      : 'border-red-200 bg-red-50 text-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      {confirmationResultBanner.approved ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-700" />
                      )}
                      <span>
                        Senate Judiciary Outcome: {confirmationResultBanner.voteLabel}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmationResultBanner(null)}
                      className="text-xs underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed">
                    {confirmationResultBanner.summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Step 1 & 2: Target Seat + Nominee Selection */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                    <label
                      htmlFor="vacant-seat-select"
                      className="block text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      1. Seat Opening / Retirement Transition
                    </label>
                    <select
                      id="vacant-seat-select"
                      value={vacantJusticeId}
                      onChange={(e) => setVacantJusticeId(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
                    >
                      {bench.map((j) => (
                        <option key={j.id} value={j.id}>
                          Seat {j.seatNumber}: {j.name} ({j.philosophy} · Retirement: {j.retirementRisk})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      2. Select Supreme Court Nominee
                    </p>
                    <div className="space-y-2.5">
                      {JUDICIAL_NOMINEES.map((nom) => {
                        const selected = nom.id === selectedNominee.id;
                        return (
                          <button
                            key={nom.id}
                            type="button"
                            onClick={() => setSelectedNomineeId(nom.id)}
                            className={`w-full rounded-lg border p-3.5 text-left transition-colors ${
                              selected
                                ? 'border-[#132238] bg-stone-50'
                                : 'border-stone-200 bg-white hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-bold text-stone-900">
                                {nom.name}
                              </span>
                              <span className="text-xs font-mono-num font-semibold text-stone-600">
                                {nom.philosophy} · Appeal {nom.bipartisanAppeal >= 0 ? `+${nom.bipartisanAppeal}` : nom.bipartisanAppeal}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-stone-600">
                              {nom.summary}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Live Judiciary Hearing Questions & Roll Call */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                      <Landmark className="h-4 w-4 text-[#132238]" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-stone-900">
                        3. Senate Judiciary Committee Confirmation Hearings
                      </h3>
                    </div>

                    {JUDICIARY_HEARING_QUESTIONS.map((q) => (
                      <div key={q.id} className="space-y-2 border-b border-stone-100 pb-4 last:border-b-0 last:pb-0">
                        <p className="text-xs font-medium text-stone-500">
                          {q.senatorName} · {q.committeeRole}
                        </p>
                        <p className="text-sm font-medium text-stone-900">
                          “{q.question}”
                        </p>
                        <div className="space-y-1.5 pt-1">
                          {q.responses.map((resp) => {
                            const active = hearingAnswers[q.id] === resp.id;
                            return (
                              <button
                                key={resp.id}
                                type="button"
                                onClick={() =>
                                  setHearingAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: resp.id,
                                  }))
                                }
                                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                  active
                                    ? 'border-[#132238] bg-[#132238] text-white'
                                    : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                                  <span>{resp.label}</span>
                                  <span className="font-mono-num">
                                    Senate {resp.confirmationBonus >= 0 ? `+${resp.confirmationBonus}` : resp.confirmationBonus}
                                  </span>
                                </div>
                                <p
                                  className={`mt-1 text-[11px] leading-snug ${
                                    active ? 'text-stone-200' : 'text-stone-600'
                                  }`}
                                >
                                  “{resp.quote}”
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
                      <div className="text-xs text-stone-600 font-mono-num">
                        Projected Floor Tally:{' '}
                        <strong
                          className={
                            hearingProjection.projectedYea >= 50
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }
                        >
                          {hearingProjection.projectedYea}–
                          {hearingProjection.projectedNay}{' '}
                          {hearingProjection.projectedYea >= 50
                            ? '(Majority Path)'
                            : '(At Risk)'}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleHoldConfirmationVote}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap shrink-0"
                      >
                        <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hold Senate Confirmation Vote</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bench' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {bench.map((j) => (
                  <article
                    key={j.id}
                    className="rounded-xl border border-stone-200 bg-white p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-mono-num">
                      <span>
                        Seat {j.seatNumber} · {j.role}
                      </span>
                      <span>Since {j.appointedYear}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900">{j.name}</h3>
                    <p className="text-xs text-stone-600">
                      {j.philosophy} · Retirement Risk:{' '}
                      <strong className="text-stone-900">{j.retirementRisk}</strong>
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
