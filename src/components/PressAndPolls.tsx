import React, { useMemo, useState } from 'react';
import { Megaphone, Mic, Newspaper, TrendingUp, X } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BattlegroundStateProjection,
  NationalMetrics,
  NewsCategory,
  NewsHeadlineItem,
  PartyId,
  PressConferenceSummary,
  PublicStatementResult,
  ReelectionCampaignState,
  StatementVenue,
  TermHistoryEntry,
  TurnOutcome,
  VoterBlocs,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';
import { ElectoralMapPanel } from './ElectoralMapPanel';

const PODIUM_VENUES: StatementVenue[] = [
  'Press Podium',
  'Oval Office Address',
  'Social Media Post',
  'Press Gaggle',
];

interface PressAndPollsProps {
  party: PartyId;
  campaign: ReelectionCampaignState;
  blocs: VoterBlocs;
  latestOutcome: TurnOutcome | null;
  newsFeed: NewsHeadlineItem[];
  initialMetrics: NationalMetrics;
  metrics: NationalMetrics;
  history: TermHistoryEntry[];
  currentMonth?: number;
  startingYear?: number;
  isIssuingStatement: boolean;
  latestStatementResult: PublicStatementResult | null;
  latestPressConferenceSummary: PressConferenceSummary | null;
  lastRegionalOutreachMonth: number | null;
  onIssuePublicStatement: (
    statementText: string,
    venue: StatementVenue
  ) => Promise<void>;
  onDismissStatementResult: () => void;
  onOpenPressConference: () => void;
  onDismissPressConferenceSummary: () => void;
  onDispatchRegionalOutreach: (state: BattlegroundStateProjection) => void;
}

interface TrendPoint {
  label: string;
  fullLabel: string;
  approval: number;
  congressSupport: number;
  approvalChange?: number;
  headline?: string;
}

const BLOC_META: {
  key: keyof VoterBlocs;
  label: string;
  description: string;
}[] = [
  {
    key: 'workingClass',
    label: 'Working Class Households',
    description:
      'Sensitive to grocery/fuel costs, domestic manufacturing, and wage stability.',
  },
  {
    key: 'suburbanModerates',
    label: 'Suburban Moderates',
    description:
      'Values institutional competence, bipartisan tone, and mortgage/school stability.',
  },
  {
    key: 'techFinance',
    label: 'Tech & Financial Sector',
    description:
      'Tracks sovereign debt credibility, regulatory clarity, and innovation capital.',
  },
  {
    key: 'seniors',
    label: 'Seniors & Retirees',
    description:
      'Prioritizes entitlement solvency, inflation control, and healthcare reliability.',
  },
  {
    key: 'youngVoters',
    label: 'Young Voters',
    description:
      'Focused on housing supply, clean energy transition, and civil freedoms.',
  },
];

const CATEGORIES: { id: 'all' | NewsCategory; label: string }[] = [
  { id: 'all', label: 'All Wire' },
  { id: 'economy', label: 'Economy' },
  { id: 'politics', label: 'Politics' },
  { id: 'defense', label: 'Defense' },
  { id: 'foreign', label: 'Foreign' },
  { id: 'domestic', label: 'Domestic' },
];

export const PressAndPolls: React.FC<PressAndPollsProps> = ({
  party,
  campaign,
  blocs,
  latestOutcome,
  newsFeed,
  initialMetrics,
  metrics,
  history,
  currentMonth,
  startingYear,
  isIssuingStatement,
  latestStatementResult,
  latestPressConferenceSummary,
  lastRegionalOutreachMonth,
  onIssuePublicStatement,
  onDismissStatementResult,
  onOpenPressConference,
  onDismissPressConferenceSummary,
  onDispatchRegionalOutreach,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | NewsCategory>(
    'all'
  );
  const [showCongressOverlay, setShowCongressOverlay] = useState(false);
  const [podiumText, setPodiumText] = useState('');
  const [podiumVenue, setPodiumVenue] =
    useState<StatementVenue>('Press Podium');

  const handlePodiumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podiumText.trim() || isIssuingStatement) return;
    const msg = podiumText;
    setPodiumText('');
    await onIssuePublicStatement(msg, podiumVenue);
  };

  const trendData = useMemo<TrendPoint[]>(() => {
    const inaugApproval = Number(initialMetrics.approval.toFixed(1));
    const inaugCongress = Number(initialMetrics.congressSupport.toFixed(1));

    const points: TrendPoint[] = [
      {
        label: 'Inaug.',
        fullLabel: startingYear
          ? `Inauguration (Jan ${startingYear})`
          : 'Inauguration Baseline',
        approval: inaugApproval,
        congressSupport: inaugCongress,
      },
    ];

    if (history.length === 0) {
      const mNum = currentMonth ?? 1;
      const liveApp = Number(metrics.approval.toFixed(1));
      points.push({
        label: `M${mNum}`,
        fullLabel: startingYear
          ? `${formatMonthCalendar(mNum, startingYear).fullDate} (Live)`
          : `Month ${mNum} (Live)`,
        approval: liveApp,
        congressSupport: Number(metrics.congressSupport.toFixed(1)),
        approvalChange: Number((liveApp - inaugApproval).toFixed(1)),
      });
      return points;
    }

    let prevApproval = inaugApproval;
    for (const entry of history) {
      const cal = formatMonthCalendar(entry.month, startingYear);
      const app = Number(entry.metricsAfter.approval.toFixed(1));
      points.push({
        label: `M${entry.month}`,
        fullLabel: startingYear
          ? `${cal.fullDate} (Month ${entry.month})`
          : `Month ${entry.month}`,
        approval: app,
        congressSupport: Number(entry.metricsAfter.congressSupport.toFixed(1)),
        approvalChange: Number((app - prevApproval).toFixed(1)),
        headline: entry.outcome.newspaperHeadline,
      });
      prevApproval = app;
    }

    const lastRecorded = history[history.length - 1];
    const activeMonth = currentMonth ?? lastRecorded.month + 1;
    const liveApproval = Number(metrics.approval.toFixed(1));
    const liveCongress = Number(metrics.congressSupport.toFixed(1));
    const lastApp = Number(lastRecorded.metricsAfter.approval.toFixed(1));
    const lastCong = Number(lastRecorded.metricsAfter.congressSupport.toFixed(1));

    if (
      activeMonth > lastRecorded.month &&
      (Math.abs(liveApproval - lastApp) >= 0.05 ||
        Math.abs(liveCongress - lastCong) >= 0.05)
    ) {
      const cal = formatMonthCalendar(activeMonth, startingYear);
      points.push({
        label: `M${activeMonth} Live`,
        fullLabel: startingYear
          ? `${cal.fullDate} (Month ${activeMonth} In-Progress)`
          : `Month ${activeMonth} (In-Progress)`,
        approval: liveApproval,
        congressSupport: liveCongress,
        approvalChange: Number((liveApproval - lastApp).toFixed(1)),
        headline: 'Mid-month live polling update',
      });
    }

    return points;
  }, [history, initialMetrics, metrics, currentMonth, startingYear]);

  const approvalStats = useMemo(() => {
    let peak = trendData[0];
    let low = trendData[0];
    let sum = 0;
    for (const pt of trendData) {
      sum += pt.approval;
      if (pt.approval > peak.approval) peak = pt;
      if (pt.approval < low.approval) low = pt;
    }
    return {
      peak,
      low,
      average: Number((sum / Math.max(1, trendData.length)).toFixed(1)),
    };
  }, [trendData]);

  const approvalNet = metrics.approval - initialMetrics.approval;
  const congressNet = metrics.congressSupport - initialMetrics.congressSupport;

  const filteredNews = [...newsFeed]
    .reverse()
    .filter(
      (item) => categoryFilter === 'all' || item.category === categoryFilter
    );

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* Approval Trends Graph (Recharts) */}
      <section
        aria-label="Approval Trends over presidential term"
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <TrendingUp className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Historical Polling Trajectory · Term Overview</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Approval Trends
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
              <button
                type="button"
                onClick={() => setShowCongressOverlay(false)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  !showCongressOverlay
                    ? 'bg-[#132238] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Approval Only
              </button>
              <button
                type="button"
                onClick={() => setShowCongressOverlay(true)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  showCongressOverlay
                    ? 'bg-[#132238] text-white'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Compare Congress
              </button>
            </div>
          </div>
        </div>

        {/* Term Approval Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
            <span className="block text-[11px] font-medium text-stone-500">
              Current Approval
            </span>
            <div className="mt-0.5 flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-[#132238]">
                {metrics.approval.toFixed(1)}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  approvalNet > 0.05
                    ? 'text-emerald-700'
                    : approvalNet < -0.05
                    ? 'text-red-700'
                    : 'text-stone-500'
                }`}
              >
                {approvalNet >= 0 ? '+' : ''}
                {approvalNet.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
            <span className="block text-[11px] font-medium text-stone-500">
              Term Peak
            </span>
            <div className="mt-0.5 flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-emerald-700">
                {approvalStats.peak.approval.toFixed(1)}%
              </span>
              <span className="text-[11px] text-stone-500">
                ({approvalStats.peak.label})
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
            <span className="block text-[11px] font-medium text-stone-500">
              Term Low
            </span>
            <div className="mt-0.5 flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-red-700">
                {approvalStats.low.approval.toFixed(1)}%
              </span>
              <span className="text-[11px] text-stone-500">
                ({approvalStats.low.label})
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
            <span className="block text-[11px] font-medium text-stone-500">
              Term Average
            </span>
            <div className="mt-0.5 font-mono-num">
              <span className="text-lg font-bold text-stone-900">
                {approvalStats.average.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 col-span-2 sm:col-span-1">
            <span className="block text-[11px] font-medium text-stone-500">
              Congress Support
            </span>
            <div className="mt-0.5 flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-[#B45309]">
                {metrics.congressSupport.toFixed(1)}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  congressNet > 0.05
                    ? 'text-emerald-700'
                    : congressNet < -0.05
                    ? 'text-red-700'
                    : 'text-stone-500'
                }`}
              >
                {congressNet >= 0 ? '+' : ''}
                {congressNet.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart
              data={trendData}
              margin={{ top: 12, right: 18, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="approvalAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#132238" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#132238" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#57534E', fontSize: 12 }}
                axisLine={{ stroke: '#D6D3D1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: '#57534E', fontSize: 12 }}
                axisLine={{ stroke: '#D6D3D1' }}
                tickLine={false}
                width={44}
              />
              <ReferenceLine
                y={50}
                stroke="#A8A29E"
                strokeDasharray="4 4"
                label={{
                  value: '50% Majority',
                  position: 'insideTopRight',
                  fill: '#78716C',
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                y={5}
                stroke="#DC2626"
                strokeDasharray="3 3"
                label={{
                  value: '5% Impeachment Threshold',
                  position: 'insideTopRight',
                  fill: '#B91C1C',
                  fontSize: 10,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const point = payload[0]?.payload as TrendPoint | undefined;
                  if (!point) return null;
                  return (
                    <div className="max-w-xs rounded-lg border border-stone-200 bg-white p-3 shadow-md space-y-1.5 text-xs">
                      <p className="font-semibold text-stone-900">
                        {point.fullLabel}
                      </p>
                      <div className="flex items-center justify-between gap-4 font-mono-num">
                        <span className="text-[#132238] font-medium">
                          Approval Rating:
                        </span>
                        <span className="font-bold text-[#132238]">
                          {point.approval.toFixed(1)}%
                          {typeof point.approvalChange === 'number' && (
                            <span
                              className={`ml-1.5 text-[11px] ${
                                point.approvalChange > 0
                                  ? 'text-emerald-700'
                                  : point.approvalChange < 0
                                  ? 'text-red-700'
                                  : 'text-stone-500'
                              }`}
                            >
                              ({point.approvalChange >= 0 ? '+' : ''}
                              {point.approvalChange.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                      {showCongressOverlay && (
                        <div className="flex items-center justify-between gap-4 font-mono-num">
                          <span className="text-[#B45309] font-medium">
                            Congress Support:
                          </span>
                          <span className="font-bold text-[#B45309]">
                            {point.congressSupport.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {point.headline && (
                        <p className="border-t border-stone-100 pt-1.5 text-[11px] leading-snug text-stone-600">
                          “{point.headline}”
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="approval"
                name="Presidential Approval (%)"
                stroke="#132238"
                strokeWidth={2.75}
                fillOpacity={1}
                fill="url(#approvalAreaFill)"
                dot={{ r: 3.5, fill: '#132238', strokeWidth: 0 }}
                activeDot={{ r: 5.5 }}
              />
              {showCongressOverlay && (
                <Line
                  type="monotone"
                  dataKey="congressSupport"
                  name="Congress Support (%)"
                  stroke="#B45309"
                  strokeWidth={2.25}
                  dot={{ r: 3, fill: '#B45309', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {history.length === 0 && (
          <p className="text-xs text-stone-500">
            Showing inauguration baseline and Month {currentMonth ?? 1} live polling. Historical monthly points populate as your presidential term progresses.
          </p>
        )}
      </section>

      {/* Live Press Conference Desk */}
      <section
        aria-label="Presidential Press Conference"
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-stone-500">
              James S. Brady Press Briefing Room · Live Q&amp;A
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Hold a Live Press Conference
            </h2>
            <p className="mt-0.5 text-xs text-stone-600">
              Step up to the podium to field randomly generated journalist questions on recent events, economic indicators, and foreign crises. Every spoken answer shifts approval ratings and generates new headlines.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPressConference}
            className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] whitespace-nowrap shrink-0"
          >
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Start Press Conference</span>
          </button>
        </div>

        {latestPressConferenceSummary && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-stone-600">
                  Latest Briefing Summary · Month{' '}
                  <span className="font-mono-num">
                    {latestPressConferenceSummary.month}
                  </span>{' '}
                  ·{' '}
                  <span className="font-mono-num">
                    {latestPressConferenceSummary.questionsAnswered}
                  </span>{' '}
                  {latestPressConferenceSummary.questionsAnswered === 1
                    ? 'Question Answered'
                    : 'Questions Answered'}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 font-mono-num text-xs">
                  <span
                    className={`font-semibold ${
                      latestPressConferenceSummary.netApprovalDelta >= 0
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    Approval{' '}
                    {latestPressConferenceSummary.netApprovalDelta > 0 ? '+' : ''}
                    {latestPressConferenceSummary.netApprovalDelta.toFixed(1)}%
                  </span>
                  {Math.abs(latestPressConferenceSummary.netCongressDelta) >= 0.1 && (
                    <span className="text-stone-700 font-semibold">
                      · Congress{' '}
                      {latestPressConferenceSummary.netCongressDelta > 0 ? '+' : ''}
                      {latestPressConferenceSummary.netCongressDelta.toFixed(1)}%
                    </span>
                  )}
                  {Math.abs(latestPressConferenceSummary.netDiplomaticDelta) >= 0.1 && (
                    <span className="text-stone-700 font-semibold">
                      · Diplomacy{' '}
                      {latestPressConferenceSummary.netDiplomaticDelta > 0 ? '+' : ''}
                      {latestPressConferenceSummary.netDiplomaticDelta.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onDismissPressConferenceSummary}
                aria-label="Dismiss press conference summary"
                className="rounded-md p-1 text-stone-400 hover:bg-white hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              {latestPressConferenceSummary.results.map((resItem) => (
                <div
                  key={resItem.id}
                  className="rounded-lg border border-stone-200 bg-white p-3 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 text-stone-500">
                    <span className="font-semibold text-stone-700 truncate">
                      {resItem.outlet}
                    </span>
                    <span
                      className={`font-mono-num font-bold shrink-0 ${
                        resItem.approvalDelta >= 0
                          ? 'text-emerald-700'
                          : 'text-red-700'
                      }`}
                    >
                      {resItem.approvalDelta > 0 ? '+' : ''}
                      {resItem.approvalDelta.toFixed(1)}%
                    </span>
                  </div>
                  <p className="font-display text-sm font-bold leading-snug text-stone-900">
                    {resItem.leadHeadline}
                  </p>
                  <p className="text-[11px] text-stone-600">
                    {resItem.verdictLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* White House Press Podium — Instant Public Statement */}
      <section
        aria-label="Issue public statement to press and advisors"
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              White House Communications Desk
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Make a Public Statement
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Address the media, Congress, markets, or the public on any topic
              and get immediate reactions from your advisors and press outlets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {PODIUM_VENUES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPodiumVenue(v)}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  podiumVenue === v
                    ? 'border-[#132238] bg-[#132238] text-white'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePodiumSubmit} className="space-y-3">
          <textarea
            rows={2}
            value={podiumText}
            onChange={(e) => setPodiumText(e.target.value)}
            disabled={isIssuingStatement}
            placeholder="Say anything publicly: defend a policy, blast critics, weigh in on inflation, talk sports, or drop a surprise announcement..."
            className="w-full rounded-lg border border-stone-300 bg-white p-3.5 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isIssuingStatement || !podiumText.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50 whitespace-nowrap"
            >
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isIssuingStatement
                  ? 'Gathering Press & Advisor Reactions...'
                  : `Deliver via ${podiumVenue}`}
              </span>
            </button>
          </div>
        </form>

        {latestStatementResult && (
          <div className="rounded-xl border border-[#132238]/20 bg-stone-50 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#B45309]">
                  {latestStatementResult.venue} · {latestStatementResult.leadOutlet}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-stone-900">
                  {latestStatementResult.leadHeadline}
                </h3>
                <p className="mt-1 text-xs text-stone-600">
                  “{latestStatementResult.statement}”
                </p>
              </div>
              <button
                type="button"
                onClick={onDismissStatementResult}
                aria-label="Close statement response"
                className="rounded-md p-1 text-stone-400 hover:bg-white hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-stone-700">
              {latestStatementResult.mediaSummary}
            </p>

            {latestStatementResult.congressReaction && (
              <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#132238]">
                    Congressional Reaction
                  </span>
                  <span className="rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-800">
                    {latestStatementResult.congressReaction.oversightStatus}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-stone-700">
                  {latestStatementResult.congressReaction.chamberSummary}
                </p>
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 text-xs">
                  <div className="rounded border border-stone-200 bg-stone-50 p-3">
                    <span className="block text-[11px] font-semibold text-stone-500">
                      Majority Leadership
                    </span>
                    <p className="mt-1 text-stone-800">
                      “{latestStatementResult.congressReaction.majorityLeaderQuote}”
                    </p>
                  </div>
                  <div className="rounded border border-stone-200 bg-stone-50 p-3">
                    <span className="block text-[11px] font-semibold text-stone-500">
                      Opposition Leadership
                    </span>
                    <p className="mt-1 text-stone-800">
                      “{latestStatementResult.congressReaction.oppositionLeaderQuote}”
                    </p>
                  </div>
                </div>
              </div>
            )}

            {latestStatementResult.advisorResponses.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {latestStatementResult.advisorResponses.map((rx, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-stone-900 truncate">
                        {rx.speaker}
                      </span>
                      <span
                        className={`font-semibold capitalize shrink-0 ${
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
                    <p className="text-[11px] text-stone-500">{rx.role}</p>
                    <p className="text-xs leading-relaxed text-stone-700">
                      “{rx.quote}”
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Breaking News Headlines Wire */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Multi-Outlet Coverage
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              National News Headlines
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {latestOutcome && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Lead Story · {latestOutcome.newspaperOutlet} · Month{' '}
                {latestOutcome.month}
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-2xl font-bold text-stone-900">
              {latestOutcome.newspaperHeadline}
            </h3>
            <p className="mt-1 text-sm font-medium text-stone-600">
              {latestOutcome.newspaperSubhead}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredNews.map((item) => {
            const toneLabel =
              item.tone === 'positive'
                ? 'Favorable'
                : item.tone === 'critical'
                ? 'Critical'
                : 'Neutral';
            const toneColor =
              item.tone === 'positive'
                ? 'text-emerald-700'
                : item.tone === 'critical'
                ? 'text-red-700'
                : 'text-stone-500';

            return (
              <article
                key={item.id}
                className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">
                    {item.outlet} ·{' '}
                    <span className="capitalize font-normal">
                      {item.category}
                    </span>{' '}
                    · <span className="font-mono-num">M{item.month}</span>
                  </span>
                  <span className={`font-semibold ${toneColor}`}>
                    {toneLabel}
                  </span>
                </div>
                <h4 className="font-display text-base font-bold leading-snug text-stone-900">
                  {item.headline}
                </h4>
                <p className="text-xs leading-relaxed text-stone-600">
                  {item.summary}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Battleground States & Electoral Map Forecast */}
      <ElectoralMapPanel
        party={party}
        currentMonth={currentMonth ?? 1}
        metrics={metrics}
        blocs={blocs}
        campaign={campaign}
        lastRegionalOutreachMonth={lastRegionalOutreachMonth}
        onDispatchRegionalOutreach={onDispatchRegionalOutreach}
      />

      {/* Voter Bloc Approval */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <p className="text-xs font-medium text-stone-500">
          Electorate Coalition Tracking
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
          Voter Bloc Approval
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BLOC_META.map((item) => {
            const score = blocs[item.key];
            const delta = latestOutcome
              ? latestOutcome.voterBlocDeltas[item.key]
              : 0;
            const statusText =
              score >= 58
                ? 'Strong Backing'
                : score >= 45
                ? 'Contested'
                : 'Eroding Support';

            return (
              <div
                key={item.key}
                className="rounded-xl border border-stone-200 bg-stone-50 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-stone-900">
                      {item.label}
                    </h3>
                    <span className="font-mono-num text-xl font-semibold text-[#132238]">
                      {score.toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full transition-all ${
                        score >= 55
                          ? 'bg-emerald-700'
                          : score >= 45
                          ? 'bg-[#132238]'
                          : 'bg-red-700'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-600">
                      {statusText}
                    </span>
                    {latestOutcome && (
                      <span
                        className={`font-mono-num font-semibold ${
                          delta > 0
                            ? 'text-emerald-700'
                            : delta < 0
                            ? 'text-red-700'
                            : 'text-stone-500'
                        }`}
                      >
                        {delta > 0
                          ? `+${delta.toFixed(1)}%`
                          : `${delta.toFixed(1)}%`}{' '}
                        last month
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
