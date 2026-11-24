import React from 'react';
import { Compass, Megaphone, Sliders, Sparkles } from 'lucide-react';
import {
  AdminSuiteState,
  GovernanceFocus,
  InstitutionalState,
  NationalMetrics,
  TurnOutcome,
} from '../types/game';
import {
  AGENCY_QUICK_DISPATCHES,
  DIRECTIVE_CLAUSES,
  estimateDirectivePreFlight,
  GOVERNANCE_FOCUS_OPTIONS,
  SPEECH_FRAMES,
  SPIN_STRATEGIES,
  SpinStrategyOption,
} from '../data/executiveSuite';

interface GovernanceScheduleBarProps {
  currentMonth: number;
  adminSuite: AdminSuiteState;
  onChangeFocus: (focus: GovernanceFocus) => void;
  onOpenExecutiveTools: () => void;
}

export const GovernanceScheduleBar: React.FC<GovernanceScheduleBarProps> = ({
  currentMonth,
  adminSuite,
  onChangeFocus,
  onOpenExecutiveTools,
}) => {
  const activeOption =
    GOVERNANCE_FOCUS_OPTIONS.find((f) => f.id === adminSuite.governanceFocus) ||
    GOVERNANCE_FOCUS_OPTIONS[0];
  const honeymoonActive = currentMonth <= 4;

  return (
    <section
      aria-label="West Wing schedule focus and executive powers"
      className="rounded-xl border border-stone-200 bg-white px-5 py-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
          <Compass className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
          <span className="font-semibold text-stone-900">
            Monthly Schedule Priority
          </span>
          <span aria-hidden="true">·</span>
          <span>{activeOption.effectSummary}</span>
          {honeymoonActive && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num font-semibold text-emerald-800">
                Honeymoon Window (M{currentMonth}/4)
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenExecutiveTools}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#132238] bg-white px-3 py-1.5 text-xs font-semibold text-[#132238] transition-colors hover:bg-[#132238] hover:text-white whitespace-nowrap shrink-0"
        >
          <Sliders className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Pardons, Camp David &amp; Backup</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {GOVERNANCE_FOCUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChangeFocus(opt.id)}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              adminSuite.governanceFocus === opt.id
                ? 'border-[#132238] bg-[#132238] text-white'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
};

interface DirectiveAssistToolsProps {
  policyDraftText: string;
  personalActionText: string;
  speechDraftText: string;
  currentMonth: number;
  metrics: NationalMetrics;
  institutions: InstitutionalState;
  isSimulating: boolean;
  onAppendPolicyClause: (clause: string) => void;
  onApplySpeechFrame: (text: string) => void;
}

export const DirectiveAssistTools: React.FC<DirectiveAssistToolsProps> = ({
  policyDraftText,
  personalActionText,
  speechDraftText,
  currentMonth,
  metrics,
  institutions,
  isSimulating,
  onAppendPolicyClause,
  onApplySpeechFrame,
}) => {
  const estimate = estimateDirectivePreFlight(
    policyDraftText,
    personalActionText,
    speechDraftText,
    metrics,
    institutions
  );

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/70 p-3.5">
      {/* Live Policy Impact Pre-Flight Estimator */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-stone-800">
            Pre-Flight Policy &amp; Market Read
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono-num text-[11px] text-stone-700">
            <span>{estimate.passageOddsLabel}</span>
            <span aria-hidden="true">·</span>
            <span>CPI: {estimate.inflationSignal}</span>
            <span aria-hidden="true">·</span>
            <span>Fiscal: {estimate.debtSignal}</span>
            <span aria-hidden="true">·</span>
            <span>Bonds: {estimate.marketTone}</span>
          </div>
        </div>
        <p className="text-[11px] text-stone-600">{estimate.summaryNote}</p>
      </div>

      {/* Agency Quick-Dispatchers & Policy Clauses */}
      <div className="space-y-1.5 border-t border-stone-200/80 pt-2.5">
        <span className="block text-[11px] font-semibold text-stone-600">
          Add Agency Directive or Legislative Guardrail Clause:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {AGENCY_QUICK_DISPATCHES.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={isSimulating}
              onClick={() => onAppendPolicyClause(a.draft)}
              className="rounded border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 hover:border-[#132238] hover:text-[#132238] disabled:opacity-50"
            >
              + {a.label}
            </button>
          ))}
          {DIRECTIVE_CLAUSES.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={isSimulating}
              onClick={() => onAppendPolicyClause(c.clause)}
              className="rounded border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-stone-600 hover:border-[#132238] hover:text-[#132238] disabled:opacity-50"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Speechwriter Tone Frames */}
      <div className="space-y-1.5 border-t border-stone-200/80 pt-2.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600">
          <Sparkles className="h-3 w-3 text-[#132238]" aria-hidden="true" />
          <span>Speechwriter Tone Frame (fills public messaging):</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SPEECH_FRAMES.map((frame) => (
            <button
              key={frame.id}
              type="button"
              disabled={isSimulating}
              onClick={() =>
                onApplySpeechFrame(frame.template(currentMonth, metrics))
              }
              className="rounded border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-[#132238] hover:text-[#132238] disabled:opacity-50"
            >
              {frame.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface FalloutSpinRoomProps {
  latestOutcome: TurnOutcome;
  currentMonth: number;
  lastSpinMonth?: number;
  onDeploySpin: (strategy: SpinStrategyOption) => void;
}

export const FalloutSpinRoom: React.FC<FalloutSpinRoomProps> = ({
  latestOutcome,
  currentMonth,
  lastSpinMonth,
  onDeploySpin,
}) => {
  const usedThisTurn = lastSpinMonth === currentMonth;

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#132238]">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span>White House Rapid-Response Spin Room</span>
        </span>
        <span className="font-mono-num text-[11px] text-stone-500">
          {usedThisTurn
            ? 'Counter-Narrative Deployed'
            : `Last Approval Delta: ${
                latestOutcome.metricDeltas.approval >= 0 ? '+' : ''
              }${latestOutcome.metricDeltas.approval.toFixed(1)}%`}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SPIN_STRATEGIES.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={usedThisTurn}
            onClick={() => onDeploySpin(s)}
            className="rounded-md border border-stone-200 bg-white p-2.5 text-left transition-colors hover:border-[#132238] disabled:opacity-45"
          >
            <p className="text-xs font-semibold text-stone-900">{s.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-stone-600">
              {s.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
