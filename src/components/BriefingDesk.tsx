import React, { useState } from 'react';
import {
  Send,
  Volume2,
  VolumeX,
  Newspaper,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Shield,
  Megaphone,
  X,
  Landmark,
  Zap,
  Gavel,
  LogOut,
  ScrollText,
  Mic,
  Coins,
} from 'lucide-react';
import {
  DiplomaticMission,
  EmergencyResolutionRecord,
  InstitutionalState,
  LegislativeRecordItem,
  MilitaryCommandState,
  MonthlyBriefing,
  NationalMetrics,
  NewsHeadlineItem,
  PresidentProfile,
  PublicStatementResult,
  ReelectionCampaignState,
  StabilityMetricKey,
  StatementVenue,
  TermHistoryEntry,
  TurnOutcome,
  UnscriptedActionResult,
  UnscriptedActionVisibility,
  WorkspaceTab,
} from '../types/game';
import { GlobalEventsTicker } from './GlobalEventsTicker';
import { FinancialOutlookCard } from './FinancialOutlookCard';
import { ExecutiveOrdersModal } from './ExecutiveOrdersModal';
import { InstitutionalStabilityMonitor } from './InstitutionalStabilityMonitor';
import { formatMonthCalendar } from '../data/historicalPresidents';
import { getPartyMeta } from '../data/scenarios';
import {
  ACTION_CATEGORIES,
  PRESIDENTIAL_ACTION_PRESETS,
  PresidentialActionCategory,
} from '../data/presidentialActions';
import { ensureStaffOptionMemos } from '../utils/briefingMemos';

const STATEMENT_VENUES: StatementVenue[] = [
  'Press Podium',
  'Oval Office Address',
  'Social Media Post',
  'Press Gaggle',
];

interface BriefingDeskProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  currentMonth: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  institutions: InstitutionalState;
  history: TermHistoryEntry[];
  legislativeRecords: LegislativeRecordItem[];
  diplomaticMissions: DiplomaticMission[];
  newsFeed: NewsHeadlineItem[];
  briefing: MonthlyBriefing;
  latestOutcome: TurnOutcome | null;
  policyDraftText: string;
  personalActionText: string;
  speechDraftText: string;
  onChangePolicyDraft: (text: string) => void;
  onChangePersonalAction: (text: string) => void;
  onChangeSpeechDraft: (text: string) => void;
  isSimulating: boolean;
  isIssuingStatement: boolean;
  latestStatementResult: PublicStatementResult | null;
  isExecutingUnscriptedAction: boolean;
  latestUnscriptedResult: UnscriptedActionResult | null;
  reelectionCampaign: ReelectionCampaignState;
  onRunForReelection: () => void;
  onDeclineReelection: () => void;
  errorMsg: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onIssuePublicStatement: (
    statementText: string,
    venue: StatementVenue
  ) => Promise<void>;
  onDismissStatementResult: () => void;
  onExecuteUnscriptedAction: (
    actionText: string,
    visibility: UnscriptedActionVisibility
  ) => Promise<void>;
  onDismissUnscriptedResult: () => void;
  onOpenImpeachment: () => void;
  onOpenResign: () => void;
  addressedStabilityMonths: Partial<Record<StabilityMetricKey, number>>;
  emergencyResolutions: EmergencyResolutionRecord[];
  onTriggerEmergencyCheck: (metricKey: StabilityMetricKey) => void;
  onOpenPressConference: () => void;
  onOpenStateOfTheUnion: () => void;
  sotuDeliveredThisYear: boolean;
  currentYearNumber: number;
  onOpenCapitolWhip: () => void;
  whipUsedThisMonth: boolean;
  onOpenBudgetNegotiator: () => void;
  lastBudgetMonth: number | null;
  onSubmitTurn: (
    policyDirective: string,
    publicMessaging: string,
    personalAction: string
  ) => void;
}

function DeltaLabel({
  value,
  suffix = '%',
  invertGood = false,
}: {
  value: number;
  suffix?: string;
  invertGood?: boolean;
}) {
  if (Math.abs(value) < 0.01) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 font-mono-num">
        <Minus className="h-3 w-3" aria-hidden="true" />
        0.0{suffix}
      </span>
    );
  }
  const positive = value > 0;
  const good = invertGood ? !positive : positive;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold font-mono-num ${
        good ? 'text-emerald-700' : 'text-red-700'
      }`}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
      )}
      {positive ? '+' : ''}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

export const BriefingDesk: React.FC<BriefingDeskProps> = ({
  profile,
  scenarioTitle,
  currentMonth,
  metrics,
  military,
  institutions,
  history,
  legislativeRecords,
  diplomaticMissions,
  newsFeed,
  briefing,
  latestOutcome,
  policyDraftText,
  personalActionText,
  speechDraftText,
  onChangePolicyDraft,
  onChangePersonalAction,
  onChangeSpeechDraft,
  isSimulating,
  isIssuingStatement,
  latestStatementResult,
  isExecutingUnscriptedAction,
  latestUnscriptedResult,
  reelectionCampaign,
  onRunForReelection,
  onDeclineReelection,
  errorMsg,
  muted,
  onToggleMute,
  onNavigateTab,
  onIssuePublicStatement,
  onDismissStatementResult,
  onExecuteUnscriptedAction,
  onDismissUnscriptedResult,
  onOpenImpeachment,
  onOpenResign,
  addressedStabilityMonths,
  emergencyResolutions,
  onTriggerEmergencyCheck,
  onOpenPressConference,
  onOpenStateOfTheUnion,
  sotuDeliveredThisYear,
  currentYearNumber,
  onOpenCapitolWhip,
  whipUsedThisMonth,
  onOpenBudgetNegotiator,
  lastBudgetMonth,
  onSubmitTurn,
}) => {
  const [briefingFocus, setBriefingFocus] = useState<'briefing' | 'fallout'>(
    latestOutcome ? 'fallout' : 'briefing'
  );
  const [actionCategory, setActionCategory] =
    useState<PresidentialActionCategory>('sports');
  const [actionVisibility, setActionVisibility] =
    useState<UnscriptedActionVisibility>('public');
  const [statementVenue, setStatementVenue] =
    useState<StatementVenue>('Press Podium');
  const [showExecutiveOrdersModal, setShowExecutiveOrdersModal] =
    useState(false);

  const executiveOrdersCount = React.useMemo(() => {
    const rawOrders = legislativeRecords.filter(
      (r) => r.recordType === 'Executive Order'
    );
    const seen = new Set(rawOrders.map((r) => `${r.month}-${r.title}`));
    let count = rawOrders.length;
    for (const h of history) {
      const rec = h.outcome.legislativeRecord;
      if (rec && rec.recordType === 'Executive Order') {
        const key = `${h.month}-${rec.title}`;
        if (!seen.has(key)) {
          seen.add(key);
          count += 1;
        }
      }
    }
    return count;
  }, [legislativeRecords, history]);

  React.useEffect(() => {
    if (latestOutcome) {
      setBriefingFocus('fallout');
    } else {
      setBriefingFocus('briefing');
    }
  }, [latestOutcome?.month]);

  const calendarInfo = formatMonthCalendar(currentMonth, profile.startingYear);
  const partyMeta = getPartyMeta(profile.party, profile.coalition);
  const topHeadlines = [...newsFeed].slice(-3).reverse();
  const visibleActionPresets = PRESIDENTIAL_ACTION_PRESETS.filter(
    (item) => item.category === actionCategory
  );
  const staffOptionMemos = React.useMemo(
    () => ensureStaffOptionMemos(briefing, currentMonth),
    [briefing, currentMonth]
  );
  const canSubmitTurn = Boolean(
    policyDraftText.trim() || personalActionText.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitTurn || isSimulating) return;
    onSubmitTurn(policyDraftText, speechDraftText, personalActionText);
  };

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* Executive Telemetry Strip */}
      <section
        aria-label="Administration summary metrics"
        className="rounded-xl border border-stone-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600">
            <span className="font-semibold text-[#132238]">
              President {profile.name}
            </span>
            <span
              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${partyMeta.badgeClass}`}
            >
              {partyMeta.shortCode} · {partyMeta.label}
            </span>
            <span aria-hidden="true">·</span>
            <span>{scenarioTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">
              Month {String(currentMonth).padStart(2, '0')} of{' '}
              {profile.termLength}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">
              {calendarInfo.fullDate}
            </span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigateTab('military')}
              className="inline-flex items-center gap-1 font-mono-num font-semibold text-[#132238] hover:underline"
            >
              <Shield className="h-3 w-3" aria-hidden="true" />
              <span>
                DEFCON {military.defconLevel} · Threat {military.intelThreatLevel}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenStateOfTheUnion}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#132238]/25 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-[#132238] hover:bg-stone-100 whitespace-nowrap"
            >
              <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {sotuDeliveredThisYear
                  ? `Year ${currentYearNumber} SOTU Delivered`
                  : `State of the Union (Y${currentYearNumber})`}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenCapitolWhip}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap"
            >
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {whipUsedThisMonth ? 'Hill Whip Used' : 'Whip Capitol Votes'}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenBudgetNegotiator}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap"
            >
              <Coins className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {lastBudgetMonth !== null && currentMonth - lastBudgetMonth < 6
                  ? `Budget M${lastBudgetMonth + 6}`
                  : 'Federal Budget'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowExecutiveOrdersModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#132238]/25 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-[#132238] hover:bg-stone-100 whitespace-nowrap"
            >
              <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Executive Orders ({executiveOrdersCount})</span>
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute desk audio' : 'Mute desk audio'}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{muted ? 'Audio Muted' : 'Audio On'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenResign}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Resign</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <span className="block text-xs text-stone-500">Public Approval</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`font-mono-num text-xl font-semibold ${
                  metrics.approval < 5 ? 'text-red-700' : 'text-stone-900'
                }`}
              >
                {metrics.approval.toFixed(1)}%
              </span>
              {latestOutcome && (
                <DeltaLabel value={latestOutcome.metricDeltas.approval} />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-500">Congress Support</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-semibold text-stone-900">
                {metrics.congressSupport.toFixed(1)}%
              </span>
              {latestOutcome && (
                <DeltaLabel value={latestOutcome.metricDeltas.congressSupport} />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-500">GDP Growth</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-semibold text-stone-900">
                {metrics.gdpGrowth.toFixed(1)}%
              </span>
              {latestOutcome && (
                <DeltaLabel value={latestOutcome.metricDeltas.gdpGrowth} />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-500">Inflation (CPI)</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-semibold text-stone-900">
                {metrics.inflation.toFixed(1)}%
              </span>
              {latestOutcome && (
                <DeltaLabel
                  value={latestOutcome.metricDeltas.inflation}
                  invertGood
                />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-500">Unemployment</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-semibold text-stone-900">
                {metrics.unemployment.toFixed(1)}%
              </span>
              {latestOutcome && (
                <DeltaLabel
                  value={latestOutcome.metricDeltas.unemployment}
                  invertGood
                />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs text-stone-500">
              Fed Rate · Congress
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-num text-xl font-semibold text-stone-900">
                {institutions.fedFundsRate.toFixed(2)}%
              </span>
              <span className="font-mono-num text-xs text-stone-500">
                {metrics.houseSeats}H / {metrics.senateSeats}S
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Stability Monitor */}
      <InstitutionalStabilityMonitor
        metrics={metrics}
        currentMonth={currentMonth}
        addressedStabilityMonths={addressedStabilityMonths}
        emergencyResolutions={emergencyResolutions}
        onTriggerEmergencyCheck={onTriggerEmergencyCheck}
      />

      {/* Impeachment Threshold Crisis Alert (Approval < 5%) */}
      {metrics.approval < 5 && (
        <section
          role="alert"
          aria-label="Impeachment threshold triggered"
          className="rounded-xl border-2 border-red-400 bg-red-50 p-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-900">
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              Constitutional Crisis · Approval Below 5.0% (
              {metrics.approval.toFixed(1)}%)
            </p>
            <p className="text-sm font-medium text-red-950">
              Your public support has fallen below the 5% threshold. House
              leadership has prepared Articles of Impeachment for a floor vote
              and Senate trial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenImpeachment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-900"
            >
              <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Face Impeachment Vote</span>
            </button>
            <button
              type="button"
              onClick={onOpenResign}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-900 hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Resign Presidency</span>
            </button>
          </div>
        </section>
      )}

      {/* Re-Election Decision & Campaign Headquarters */}
      {reelectionCampaign.decision === 'undecided' && (
        <section
          aria-label="Re-election decision"
          className="rounded-xl border border-stone-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#132238]">
              Second-Term Decision · Month {currentMonth} of {profile.termLength}
            </p>
            <p className="text-sm font-medium text-stone-800">
              Run for re-election? Choose <strong>Yes</strong> to launch your
              campaign now, or <strong>No</strong> to continue with your current
              term without campaigning.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onRunForReelection}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
            >
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Yes — Run for Re-Election (Start Campaign)</span>
            </button>
            <button
              type="button"
              onClick={onDeclineReelection}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <span>No — Continue With Term</span>
            </button>
          </div>
        </section>
      )}

      {reelectionCampaign.decision === 'running' && (
        <section
          aria-label="Re-election campaign headquarters"
          className="rounded-xl border-2 border-[#132238] bg-white p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#132238]">
                Active Re-Election Campaign · Launched Month{' '}
                {reelectionCampaign.announcedMonth || currentMonth}
              </p>
              <h3 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                {profile.name} ({partyMeta.shortCode}) vs.{' '}
                {reelectionCampaign.opponentName} (
                {reelectionCampaign.opponentParty})
              </h3>
              <p className="text-xs italic text-stone-600">
                Campaign Slogan: “{reelectionCampaign.campaignSlogan}”
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-center">
                <span className="block text-[10px] font-semibold uppercase text-stone-500">
                  Projected Vote
                </span>
                <span className="font-mono-num text-lg font-bold text-[#132238]">
                  {reelectionCampaign.projectedVoteShare.toFixed(1)}%
                </span>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-center">
                <span className="block text-[10px] font-semibold uppercase text-stone-500">
                  Race Rating
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {reelectionCampaign.battlegroundEdge}
                </span>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2 text-center">
                <span className="block text-[10px] font-semibold uppercase text-stone-500">
                  Momentum
                </span>
                <span
                  className={`font-mono-num text-sm font-bold ${
                    reelectionCampaign.campaignMomentum >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {reelectionCampaign.campaignMomentum >= 0 ? '+' : ''}
                  {reelectionCampaign.campaignMomentum}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-600">
              Campaign Trail Actions (adds to this month&apos;s executive
              schedule):
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: 'Swing-State Bus Tour',
                  action: `Lead a 3-day campaign bus tour across Pennsylvania, Michigan, and Wisconsin alongside local mayors, contrasting administration results against ${reelectionCampaign.opponentName}.`,
                  speech: `We are delivering jobs and stability for working families—not turning back the clock.`,
                },
                {
                  label: 'Primetime Rally & Fundraising Blitz',
                  action: `Headline a packed arena re-election rally and grassroots small-dollar fundraising blitz to build battleground field offices.`,
                  speech: `Our movement is powered by everyday citizens, and together we will finish the job.`,
                },
                {
                  label: 'Challenge Opponent to Debate',
                  action: `Publicly challenge ${reelectionCampaign.opponentName} to three televised general-election policy debates on the economy and national security.`,
                  speech: `Voters deserve a side-by-side debate on facts, results, and the future of the country.`,
                },
                {
                  label: 'National Contrast Ad Wave',
                  action: `Launch a targeted $45M battleground television and digital ad wave highlighting administration achievements and criticizing ${reelectionCampaign.opponentName}'s record.`,
                  speech: `Judge us by results—and compare our record to empty campaign slogans.`,
                },
              ].map((evt) => (
                <button
                  key={evt.label}
                  type="button"
                  onClick={() => {
                    onChangePersonalAction(evt.action);
                    if (!speechDraftText.trim()) {
                      onChangeSpeechDraft(evt.speech);
                    }
                  }}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:border-[#132238] hover:bg-white"
                >
                  {evt.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {reelectionCampaign.decision === 'declined' && (
        <section
          aria-label="Re-election declined status"
          className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-xs font-medium text-stone-700">
            <strong className="text-stone-900">
              Re-Election Declined:
            </strong>{' '}
            You chose not to seek a second term and are focusing solely on
            completing your current term through Month {profile.termLength}.
          </p>
          <button
            type="button"
            onClick={onRunForReelection}
            className="text-xs font-semibold text-[#132238] hover:underline"
          >
            Reconsider &amp; Launch Campaign
          </button>
        </section>
      )}

      {/* Latest News Headlines Wire Strip */}
      {topHeadlines.length > 0 && (
        <section
          aria-label="Latest news wire headlines"
          className="rounded-xl border border-stone-200 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <Newspaper className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Latest News Wire</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('news')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#132238] hover:underline"
            >
              <span>All Headlines &amp; Polls</span>
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {topHeadlines.map((item) => (
              <div key={item.id} className="space-y-1">
                <p className="text-[11px] font-medium text-stone-500">
                  {item.outlet} · <span className="capitalize">{item.category}</span>
                </p>
                <p className="text-sm font-semibold leading-snug text-stone-900">
                  {item.headline}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Simulation could not process turn</p>
            <p className="mt-0.5 text-red-800">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Fallout & Monthly Briefing */}
        <section className="lg:col-span-6 space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setBriefingFocus('briefing')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    briefingFocus === 'briefing'
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Month {currentMonth} Briefing</span>
                </button>
                {latestOutcome && (
                  <button
                    type="button"
                    onClick={() => setBriefingFocus('fallout')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      briefingFocus === 'fallout'
                        ? 'bg-white text-[#132238] shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Month {latestOutcome.month} Fallout</span>
                  </button>
                )}
              </div>

              <span className="text-xs font-medium text-stone-500">
                {briefingFocus === 'fallout' && latestOutcome
                  ? latestOutcome.newspaperOutlet
                  : 'Executive Intelligence Dossier'}
              </span>
            </div>

            {briefingFocus === 'fallout' && latestOutcome ? (
              <div className="mt-5 space-y-5">
                <div className="border-b border-stone-200 pb-4">
                  <p className="text-xs font-medium text-stone-500">
                    Press Coverage · Month {latestOutcome.month}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold leading-snug text-stone-900">
                    {latestOutcome.newspaperHeadline}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-stone-600">
                    {latestOutcome.newspaperSubhead}
                  </p>
                </div>

                <div className="space-y-3 text-sm leading-relaxed text-stone-700 whitespace-pre-line">
                  {latestOutcome.outcomeNarrative}
                </div>

                <div className="space-y-3 border-t border-stone-200 pt-4">
                  <h3 className="text-xs font-semibold text-stone-500">
                    Institutional &amp; Political Reactions
                  </h3>
                  <div className="space-y-2.5">
                    {latestOutcome.advisorReactions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-stone-900">
                            {rx.speaker} ·{' '}
                            <span className="font-normal text-stone-600">
                              {rx.role}
                            </span>
                          </span>
                          <span
                            className={`font-medium capitalize ${
                              rx.stance === 'supportive'
                                ? 'text-emerald-700'
                                : rx.stance === 'critical'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {rx.stance}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-stone-700">
                          “{rx.quote}”
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setBriefingFocus('briefing')}
                    className="rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
                  >
                    Read Month {currentMonth} Briefing
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-stone-500">
                    Presidential Daily Briefing · Month {currentMonth}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold leading-snug text-stone-900">
                    {briefing.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">
                    {briefing.situationSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-stone-200 pt-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-500">
                      Domestic &amp; Legislative Front
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {briefing.domesticIssue}
                    </p>
                  </div>

                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-500">
                      Macroeconomic &amp; Treasury Desk
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {briefing.economicIssue}
                    </p>
                  </div>

                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-500">
                      Foreign &amp; National Security
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {briefing.foreignIssue}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                  <h3 className="text-xs font-semibold text-amber-900">
                    Decision Point
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-amber-950">
                    {briefing.urgentDilemma}
                  </p>
                </div>
              </div>
            )}
          </div>

          <FinancialOutlookCard
            currentMonth={currentMonth}
            startingYear={profile.startingYear}
            metrics={metrics}
            institutions={institutions}
            history={history}
            diplomaticMissions={diplomaticMissions}
          />
        </section>

        {/* Right Column: Free-Form Policy Writing & Public Messaging */}
        <section className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-stone-200 bg-white p-6 md:p-7 space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Executive Decision Desk
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-stone-900">
                  Write your Month {currentMonth} policy &amp; address
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExecutiveOrdersModal(true)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#132238]/25 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-[#132238] hover:bg-stone-100"
                >
                  <ScrollText className="h-3 w-3" aria-hidden="true" />
                  <span>Executive Orders ({executiveOrdersCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('cabinet')}
                  className="rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Consult Cabinet
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('military')}
                  className="rounded-md border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Military Orders
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-600">
                Staff Option Memos (click to draft, then edit freely)
              </span>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {staffOptionMemos.map((s, idx) => {
                  const isDrafted =
                    Boolean(policyDraftText.trim()) &&
                    policyDraftText.trim() === s.policyDraft.trim();
                  return (
                    <button
                      key={`${currentMonth}-${idx}-${s.title}`}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => {
                        onChangePolicyDraft(s.policyDraft);
                        onChangeSpeechDraft(s.speechDraft);
                      }}
                      className={`rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${
                        isDrafted
                          ? 'border-[#132238] bg-white ring-1 ring-[#132238]/20'
                          : 'border-stone-200 bg-stone-50 hover:border-[#132238] hover:bg-white'
                      }`}
                    >
                      <p className="text-xs font-medium text-stone-500 truncate">
                        {s.role}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-stone-900 line-clamp-2">
                        {s.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="policy-directive"
                className="block text-sm font-semibold text-stone-800"
              >
                Executive Directive, Legislation &amp; Military Orders
              </label>
              <p className="mt-0.5 text-xs text-stone-500">
                Combine domestic policies, budget compromises, Cabinet actions,
                and Pentagon deployments in plain English (optional if logging an
                unscripted action below).
              </p>
              <textarea
                id="policy-directive"
                rows={4}
                value={policyDraftText}
                onChange={(e) => onChangePolicyDraft(e.target.value)}
                disabled={isSimulating}
                placeholder="Write your custom policy decision in plain English..."
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
              />
            </div>

            {/* Off-the-Clock & Unscripted Presidential Freedom ("Do Anything") */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold text-[#132238]">
                    Off-the-Clock &amp; Unscripted Presidential Actions (Do Anything)
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Attend MLB, NBA, or UFC events, tour diners, or take high-risk
                    personal/after-hours actions—write anything you want below.
                  </p>
                </div>
                {personalActionText.trim() && (
                  <button
                    type="button"
                    onClick={() => onChangePersonalAction('')}
                    className="text-[11px] font-medium text-stone-500 hover:text-stone-800 underline"
                  >
                    Clear Action
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ACTION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActionCategory(cat.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      actionCategory === cat.id
                        ? 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {visibleActionPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isSimulating}
                    onClick={() => {
                      onChangePersonalAction(
                        personalActionText.trim()
                          ? `${personalActionText.trim()} ${preset.actionDraft}`
                          : preset.actionDraft
                      );
                      if (!speechDraftText.trim()) {
                        onChangeSpeechDraft(preset.speechDraft);
                      }
                    }}
                    className="rounded-lg border border-stone-200 bg-white p-2.5 text-left transition-colors hover:border-[#132238] disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stone-900">
                        {preset.title}
                      </span>
                      <span
                        className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                          preset.riskLevel === 'High Controversy'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : preset.riskLevel === 'Mixed Reaction'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {preset.riskLevel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label
                  htmlFor="personal-action"
                  className="sr-only"
                >
                  Unscripted Personal or After-Hours Presidential Action
                </label>
                <textarea
                  id="personal-action"
                  rows={2}
                  value={personalActionText}
                  onChange={(e) => onChangePersonalAction(e.target.value)}
                  disabled={isSimulating || isExecutingUnscriptedAction}
                  placeholder="Type anything you want to do—from attending a game or podcast to high-stakes personal controversies or unorthodox stunts—and see how Congress reacts..."
                  className="w-full rounded-lg border border-stone-300 bg-white p-3 text-xs leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1 rounded-md border border-stone-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setActionVisibility('public')}
                    className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                      actionVisibility === 'public'
                        ? 'bg-[#132238] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Public Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionVisibility('off_record')}
                    className={`rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                      actionVisibility === 'off_record'
                        ? 'bg-[#132238] text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Off-the-Record (Leaks to Press)
                  </button>
                </div>

                <button
                  type="button"
                  disabled={
                    isSimulating ||
                    isExecutingUnscriptedAction ||
                    !personalActionText.trim()
                  }
                  onClick={() =>
                    onExecuteUnscriptedAction(personalActionText, actionVisibility)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#132238] bg-white px-3 py-1.5 text-xs font-semibold text-[#132238] transition-colors hover:bg-[#132238] hover:text-white disabled:opacity-45 whitespace-nowrap"
                >
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isExecutingUnscriptedAction
                      ? 'Polling Capitol Hill...'
                      : 'Do Action & Get Congress Reaction Now'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="public-messaging"
                  className="block text-sm font-semibold text-stone-800"
                >
                  Public Messaging &amp; Press Statement (Any Topic)
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  {STATEMENT_VENUES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStatementVenue(v)}
                      className={`rounded border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        statementVenue === v
                          ? 'border-[#132238] bg-[#132238] text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-stone-500">
                Say anything to the nation, press, markets, or rivals—deliver it
                live right now for instant advisor &amp; media responses, or pair
                it with your monthly directive.
              </p>
              <textarea
                id="public-messaging"
                rows={2}
                value={speechDraftText}
                onChange={(e) => onChangeSpeechDraft(e.target.value)}
                disabled={isSimulating || isIssuingStatement}
                placeholder="Say anything publicly: comment on the economy, call out Congress, respond to a rumor, hype a UFC fight, or give an Oval Office speech..."
                className="w-full rounded-lg border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
              />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSimulating}
                  onClick={onOpenPressConference}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-45 whitespace-nowrap"
                >
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hold Press Conference</span>
                </button>
                <button
                  type="button"
                  disabled={
                    isSimulating ||
                    isIssuingStatement ||
                    !speechDraftText.trim()
                  }
                  onClick={() =>
                    onIssuePublicStatement(speechDraftText, statementVenue)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#132238] bg-white px-3.5 py-2 text-xs font-semibold text-[#132238] transition-colors hover:bg-[#132238] hover:text-white disabled:opacity-45 whitespace-nowrap"
                >
                  <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isIssuingStatement
                      ? 'Gathering Press & Advisor Reactions...'
                      : `Deliver ${statementVenue} Now (Instant Response)`}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
              <span className="text-xs text-stone-500">
                {currentMonth === 24 && profile.termLength === 48
                  ? 'Note: Midterm congressional elections occur after this month.'
                  : currentMonth === profile.termLength
                  ? 'Final month of your current term.'
                  : `${profile.termLength - currentMonth} months remaining after this decision.`}
              </span>

              <button
                type="submit"
                disabled={isSimulating || !canSubmitTurn}
                className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {isSimulating ? (
                  <>
                    <Sparkles
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Simulating Fallout...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {policyDraftText.trim()
                        ? 'Issue Directive & Advance Month'
                        : 'Take Action & Advance Month'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {latestStatementResult && (
            <div
              aria-label="Live press and advisor reaction"
              className="rounded-xl border border-[#132238]/25 bg-white p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
                    Live Press &amp; Advisor Reaction ·{' '}
                    {latestStatementResult.venue}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-stone-900">
                    {latestStatementResult.leadHeadline}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {latestStatementResult.leadOutlet} · “
                    {latestStatementResult.statement.slice(0, 120)}
                    {latestStatementResult.statement.length > 120 ? '…' : ''}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDismissStatementResult}
                  aria-label="Dismiss statement reaction"
                  className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-stone-700">
                {latestStatementResult.mediaSummary}
              </p>

              <div className="flex flex-wrap gap-2 font-mono-num text-xs">
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Approval{' '}
                  <span
                    className={
                      latestStatementResult.metricDeltas.approval >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestStatementResult.metricDeltas.approval >= 0 ? '+' : ''}
                    {latestStatementResult.metricDeltas.approval.toFixed(1)}%
                  </span>
                </span>
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Congress{' '}
                  <span
                    className={
                      latestStatementResult.metricDeltas.congressSupport >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestStatementResult.metricDeltas.congressSupport >= 0
                      ? '+'
                      : ''}
                    {latestStatementResult.metricDeltas.congressSupport.toFixed(1)}
                    %
                  </span>
                </span>
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Diplomacy{' '}
                  <span
                    className={
                      latestStatementResult.metricDeltas.diplomaticStanding >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestStatementResult.metricDeltas.diplomaticStanding >= 0
                      ? '+'
                      : ''}
                    {latestStatementResult.metricDeltas.diplomaticStanding.toFixed(
                      1
                    )}
                  </span>
                </span>
              </div>

              {latestStatementResult.congressReaction && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#132238]">
                      <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Congressional Reaction</span>
                    </div>
                    <span className="rounded border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-800">
                      {latestStatementResult.congressReaction.oversightStatus}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-700">
                    {latestStatementResult.congressReaction.chamberSummary}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded border border-stone-200 bg-white p-2.5">
                      <p className="text-[11px] font-semibold text-stone-500">
                        Majority Leadership
                      </p>
                      <p className="mt-0.5 text-xs text-stone-800">
                        “{latestStatementResult.congressReaction.majorityLeaderQuote}”
                      </p>
                    </div>
                    <div className="rounded border border-stone-200 bg-white p-2.5">
                      <p className="text-[11px] font-semibold text-stone-500">
                        Opposition Leadership
                      </p>
                      <p className="mt-0.5 text-xs text-stone-800">
                        “{latestStatementResult.congressReaction.oppositionLeaderQuote}”
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {latestStatementResult.advisorResponses.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-xs font-semibold text-stone-500">
                    Advisor &amp; Cabinet Responses
                  </p>
                  <div className="space-y-2">
                    {latestStatementResult.advisorResponses.map((rx, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-stone-900">
                            {rx.speaker}{' '}
                            <span className="font-normal text-stone-500">
                              · {rx.role}
                            </span>
                          </span>
                          <span
                            className={`font-semibold capitalize ${
                              rx.stance === 'supportive'
                                ? 'text-emerald-700'
                                : rx.stance === 'critical'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {rx.stance}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-stone-700">
                          “{rx.quote}”
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {latestStatementResult.mediaReactions.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-xs font-semibold text-stone-500">
                    Immediate Media Wire
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {latestStatementResult.mediaReactions.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-1"
                      >
                        <p className="text-[11px] font-semibold text-stone-500">
                          {m.outlet} ·{' '}
                          <span className="capitalize">{m.tone}</span>
                        </p>
                        <p className="text-xs font-bold text-stone-900 leading-snug">
                          {m.headline}
                        </p>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {m.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {latestUnscriptedResult && (
            <div
              aria-label="Live Congressional reaction to unscripted action"
              className="rounded-xl border-2 border-[#132238]/30 bg-white p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-[#132238]/20 bg-[#132238]/5 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#132238]">
                      <Zap className="h-3 w-3" aria-hidden="true" />
                      Capitol Hill Reaction ·{' '}
                      {latestUnscriptedResult.visibility === 'off_record'
                        ? 'Off-the-Record (Leaked to Press & Congress)'
                        : 'Public Action'}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[11px] font-bold ${
                        latestUnscriptedResult.congressReaction.oversightStatus ===
                          'Bipartisan Applause' ||
                        latestUnscriptedResult.congressReaction.oversightStatus ===
                          'No Action'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : latestUnscriptedResult.congressReaction
                              .oversightStatus === 'Partisan Criticism'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-red-200 bg-red-50 text-red-800'
                      }`}
                    >
                      {latestUnscriptedResult.congressReaction.oversightStatus}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500">
                      Censure/Impeachment Risk:{' '}
                      <strong className="text-stone-800">
                        {latestUnscriptedResult.congressReaction.censureRisk}
                      </strong>
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-stone-900">
                    {latestUnscriptedResult.leadHeadline}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {latestUnscriptedResult.leadOutlet} · Action: “
                    {latestUnscriptedResult.action.slice(0, 120)}
                    {latestUnscriptedResult.action.length > 120 ? '…' : ''}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDismissUnscriptedResult}
                  aria-label="Dismiss Congress reaction"
                  className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-stone-700">
                {latestUnscriptedResult.mediaSummary}
              </p>

              <div className="flex flex-wrap gap-2 font-mono-num text-xs">
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Approval{' '}
                  <span
                    className={
                      latestUnscriptedResult.metricDeltas.approval >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestUnscriptedResult.metricDeltas.approval >= 0 ? '+' : ''}
                    {latestUnscriptedResult.metricDeltas.approval.toFixed(1)}%
                  </span>
                </span>
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Congress{' '}
                  <span
                    className={
                      latestUnscriptedResult.metricDeltas.congressSupport >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestUnscriptedResult.metricDeltas.congressSupport >= 0
                      ? '+'
                      : ''}
                    {latestUnscriptedResult.metricDeltas.congressSupport.toFixed(
                      1
                    )}
                    %
                  </span>
                </span>
                <span className="rounded border border-stone-200 bg-stone-50 px-2.5 py-1 font-semibold text-stone-700">
                  Diplomacy{' '}
                  <span
                    className={
                      latestUnscriptedResult.metricDeltas.diplomaticStanding >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }
                  >
                    {latestUnscriptedResult.metricDeltas.diplomaticStanding >= 0
                      ? '+'
                      : ''}
                    {latestUnscriptedResult.metricDeltas.diplomaticStanding.toFixed(
                      1
                    )}
                  </span>
                </span>
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#132238]">
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Congressional Floor &amp; Oversight Response</span>
                </div>
                <p className="text-xs leading-relaxed text-stone-700">
                  {latestUnscriptedResult.congressReaction.chamberSummary}
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-md border border-stone-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-stone-500">
                      Majority Leadership
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-800">
                      “{latestUnscriptedResult.congressReaction.majorityLeaderQuote}”
                    </p>
                  </div>
                  <div className="rounded-md border border-stone-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-stone-500">
                      Opposition Leadership
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-800">
                      “{latestUnscriptedResult.congressReaction.oppositionLeaderQuote}”
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-600">
                  <strong className="text-stone-800">Caucus Dynamics:</strong>{' '}
                  {latestUnscriptedResult.congressReaction.caucusReactionNote}
                </p>
              </div>

              {latestUnscriptedResult.advisorResponses.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-xs font-semibold text-stone-500">
                    West Wing &amp; White House Counsel Reactions
                  </p>
                  <div className="space-y-2">
                    {latestUnscriptedResult.advisorResponses.map((rx, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-stone-900">
                            {rx.speaker}{' '}
                            <span className="font-normal text-stone-500">
                              · {rx.role}
                            </span>
                          </span>
                          <span
                            className={`font-semibold capitalize ${
                              rx.stance === 'supportive'
                                ? 'text-emerald-700'
                                : rx.stance === 'critical'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {rx.stance}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-stone-700">
                          “{rx.quote}”
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {latestUnscriptedResult.mediaReactions.length > 0 && (
                <div className="space-y-2 border-t border-stone-200 pt-3">
                  <p className="text-xs font-semibold text-stone-500">
                    Media Wire Coverage
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {latestUnscriptedResult.mediaReactions.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-1"
                      >
                        <p className="text-[11px] font-semibold text-stone-500">
                          {m.outlet} ·{' '}
                          <span className="capitalize">{m.tone}</span>
                        </p>
                        <p className="text-xs font-bold text-stone-900 leading-snug">
                          {m.headline}
                        </p>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {m.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Real-Time Simulated Global Events Ticker */}
      <GlobalEventsTicker
        currentMonth={currentMonth}
        startingYear={profile.startingYear}
        metrics={metrics}
        military={military}
        institutions={institutions}
        newsFeed={newsFeed}
        briefing={briefing}
        latestOutcome={latestOutcome}
        onNavigateTab={onNavigateTab}
      />

      <ExecutiveOrdersModal
        isOpen={showExecutiveOrdersModal}
        onClose={() => setShowExecutiveOrdersModal(false)}
        profile={profile}
        scenarioTitle={scenarioTitle}
        legislativeRecords={legislativeRecords}
        history={history}
      />
    </main>
  );
};
