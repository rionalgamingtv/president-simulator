import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Megaphone,
  MessageSquare,
  Search,
  ShieldAlert,
  Tv,
  Users,
} from 'lucide-react';
import {
  AdminSuiteState,
  MilitaryCommandState,
  NationalMetrics,
  NewsHeadlineItem,
  PressAccessMode,
  ReelectionCampaignState,
  VoterBlocs,
} from '../types/game';
import {
  CAMPAIGN_AD_STRATEGIES,
  DEBATE_PREP_TRACKS,
  PRESS_ACCESS_MODES,
  synthesizeOppositionAttacks,
  TOWN_HALL_VENUES,
  TownHallVenueOption,
} from '../data/expansionSuites';

interface PressSuitePanelProps {
  currentMonth: number;
  metrics: NationalMetrics;
  initialMetrics: NationalMetrics;
  blocs: VoterBlocs;
  military: MilitaryCommandState;
  newsFeed: NewsHeadlineItem[];
  campaign: ReelectionCampaignState;
  adminSuite: AdminSuiteState;
  onChangePressAccess: (mode: PressAccessMode) => void;
  onHostTownHall: (venue: TownHallVenueOption) => void;
  onQueueRebuttalStatement: (text: string) => void;
  onRunCampaignAdWave: (strategyId: string) => void;
  onRunDebatePrep: (trackId: string) => void;
}

export const PressSuitePanel: React.FC<PressSuitePanelProps> = ({
  currentMonth,
  metrics,
  initialMetrics,
  blocs,
  military,
  newsFeed,
  campaign,
  adminSuite,
  onChangePressAccess,
  onHostTownHall,
  onQueueRebuttalStatement,
  onRunCampaignAdWave,
  onRunDebatePrep,
}) => {
  const [headlineSearch, setHeadlineSearch] = useState('');
  const [toneFilter, setToneFilter] = useState<'all' | 'positive' | 'neutral' | 'critical'>('all');

  const sentimentStats = useMemo(() => {
    let pos = 0;
    let neu = 0;
    let crit = 0;
    for (const item of newsFeed) {
      if (item.tone === 'positive') pos += 1;
      else if (item.tone === 'critical') crit += 1;
      else neu += 1;
    }
    const total = Math.max(1, newsFeed.length);
    return {
      pos,
      neu,
      crit,
      total: newsFeed.length,
      posPct: Math.round((pos / total) * 100),
      critPct: Math.round((crit / total) * 100),
    };
  }, [newsFeed]);

  const miseryIndex = metrics.inflation + metrics.unemployment;
  const realGrowthSpread = metrics.gdpGrowth - metrics.inflation;
  const netApprovalChange = metrics.approval - initialMetrics.approval;

  const swingLeverageBlocs = useMemo(() => {
    const labels: Record<keyof VoterBlocs, string> = {
      workingClass: 'Working Class',
      suburbanModerates: 'Suburban Moderates',
      techFinance: 'Tech & Finance',
      seniors: 'Seniors',
      youngVoters: 'Young Voters',
    };
    return (Object.keys(labels) as Array<keyof VoterBlocs>)
      .map((key) => ({
        key,
        label: labels[key],
        score: blocs[key],
        persuasionGap: Math.abs(50 - blocs[key]),
      }))
      .sort((a, b) => a.persuasionGap - b.persuasionGap);
  }, [blocs]);

  const oppositionAttacks = useMemo(
    () => synthesizeOppositionAttacks(metrics, military),
    [metrics, military]
  );

  const filteredArchiveHeadlines = useMemo(() => {
    const q = headlineSearch.trim().toLowerCase();
    return [...newsFeed]
      .reverse()
      .filter((item) => {
        if (toneFilter !== 'all' && item.tone !== toneFilter) return false;
        if (!q) return true;
        return (
          item.headline.toLowerCase().includes(q) ||
          item.outlet.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)
        );
      })
      .slice(0, 12);
  }, [newsFeed, headlineSearch, toneFilter]);

  const townHallUsedThisMonth = adminSuite.lastTownHallMonth === currentMonth;
  const adWaveUsedThisMonth = adminSuite.lastAdWaveMonth === currentMonth;
  const debatePrepUsedThisMonth = adminSuite.lastDebatePrepMonth === currentMonth;

  return (
    <div className="space-y-6">
      {/* Row 1: Media Sentiment, Misery Index & Swing-Voter Leverage */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <BarChart3 className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Media Sentiment &amp; Misery Index</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="text-stone-500">Misery Index (CPI+Jobs)</span>
              <p className="mt-0.5 font-mono-num text-lg font-bold text-stone-900">
                {miseryIndex.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="text-stone-500">Real Growth Spread</span>
              <p
                className={`mt-0.5 font-mono-num text-lg font-bold ${
                  realGrowthSpread >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {realGrowthSpread >= 0 ? '+' : ''}
                {realGrowthSpread.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-mono-num text-stone-600">
              <span>Favorable Wire: {sentimentStats.posPct}%</span>
              <span>Critical Wire: {sentimentStats.critPct}%</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="bg-emerald-600"
                style={{ width: `${sentimentStats.posPct}%` }}
              />
              <div
                className="bg-red-600"
                style={{ width: `${sentimentStats.critPct}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 font-mono-num">
              Net Term Approval Shift:{' '}
              {netApprovalChange >= 0 ? '+' : ''}
              {netApprovalChange.toFixed(1)}% across {sentimentStats.total}{' '}
              stories
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <Users className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Swing-Voter Persuasion Leverage</span>
          </div>
          <p className="text-xs text-stone-500">
            Blocs closest to 50% offer the highest electoral swing return right
            now:
          </p>
          <div className="space-y-2">
            {swingLeverageBlocs.slice(0, 4).map((b, idx) => (
              <div
                key={b.key}
                className="flex items-center justify-between border-b border-stone-100 pb-1.5 text-xs last:border-0"
              >
                <span className="font-medium text-stone-800">
                  {idx + 1}. {b.label}
                </span>
                <span className="font-mono-num text-stone-600">
                  {b.score}% ({b.persuasionGap <= 4 ? 'Battleground' : b.score > 50 ? 'Leaning' : 'Trailing'})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <MessageSquare className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Press Room Access Posture</span>
          </div>
          <div className="space-y-2">
            {PRESS_ACCESS_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangePressAccess(mode.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                  adminSuite.pressAccessMode === mode.id
                    ? 'border-[#132238] bg-stone-50'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <p className="text-xs font-semibold text-stone-900">
                  {mode.label}
                </p>
                <p className="text-[11px] text-stone-600">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Row 2: Televised Town Hall & Opposition Rebuttal Tracker */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <Tv className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Televised Regional Town Hall</span>
            </div>
            <span className="font-mono-num text-[11px] text-stone-500">
              {townHallUsedThisMonth ? 'Held This Month' : 'Available (1/mo)'}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {TOWN_HALL_VENUES.map((v) => (
              <div
                key={v.id}
                className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <p className="text-[11px] text-stone-500">{v.location}</p>
                  <p className="text-xs font-semibold text-stone-900">
                    {v.label}
                  </p>
                  <p className="mt-1 font-mono-num text-[11px] text-emerald-800">
                    +{v.blocDelta}% {v.targetBlocLabel} · +
                    {v.approvalDelta.toFixed(1)}% Approval
                  </p>
                </div>
                <button
                  type="button"
                  disabled={townHallUsedThisMonth}
                  onClick={() => onHostTownHall(v)}
                  className="rounded-md bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                >
                  Host Town Hall
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <ShieldAlert className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Opposition Narrative Tracker &amp; Rapid Rebuttal</span>
          </div>
          <div className="space-y-2.5">
            {oppositionAttacks.map((atk) => (
              <div
                key={atk.id}
                className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-900">
                    {atk.topic}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQueueRebuttalStatement(atk.rebuttalDraft)}
                    className="rounded border border-[#132238] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#132238] hover:bg-[#132238] hover:text-white whitespace-nowrap shrink-0"
                  >
                    Deliver Rebuttal
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-stone-600">
                  {atk.attackLine}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Row 3: Active Re-Election Campaign Ad Allocator & Debate Prep */}
      {campaign.decision === 'running' && (
        <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#132238]">
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Campaign War Room · Media Ad Buy &amp; Debate Sparring Prep
              </span>
            </div>
            <span className="font-mono-num text-xs text-stone-600">
              Momentum: {campaign.campaignMomentum >= 0 ? '+' : ''}
              {campaign.campaignMomentum} · Projected{' '}
              {campaign.projectedVoteShare.toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">
                  Targeted Battleground Ad Wave
                </span>
                <span className="font-mono-num text-stone-500">
                  {adWaveUsedThisMonth ? 'Deployed This Month' : 'Ready (1/mo)'}
                </span>
              </div>
              <div className="space-y-2">
                {CAMPAIGN_AD_STRATEGIES.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        {ad.label}
                      </p>
                      <p className="text-[11px] text-stone-600">
                        {ad.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={adWaveUsedThisMonth}
                      onClick={() => onRunCampaignAdWave(ad.id)}
                      className="rounded-md bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap shrink-0"
                    >
                      Launch Ad Buy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">
                  General Election Debate Sparring
                </span>
                <span className="font-mono-num text-stone-500">
                  {debatePrepUsedThisMonth
                    ? 'Completed This Month'
                    : 'Ready (1/mo)'}
                </span>
              </div>
              <div className="space-y-2">
                {DEBATE_PREP_TRACKS.map((tr) => (
                  <div
                    key={tr.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-stone-900">
                        {tr.label}
                      </p>
                      <p className="text-[11px] text-stone-600">{tr.focus}</p>
                    </div>
                    <button
                      type="button"
                      disabled={debatePrepUsedThisMonth}
                      onClick={() => onRunDebatePrep(tr.id)}
                      className="rounded-md border border-[#132238] bg-white px-3 py-1.5 text-xs font-semibold text-[#132238] hover:bg-[#132238] hover:text-white disabled:opacity-45 whitespace-nowrap shrink-0"
                    >
                      Run Prep
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Row 4: Searchable Wire Archive */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <Search className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Search Full Media Wire Archive ({newsFeed.length} stories)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={headlineSearch}
              onChange={(e) => setHeadlineSearch(e.target.value)}
              placeholder="Search outlet or headline..."
              className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
            <div className="flex items-center gap-1 rounded-md bg-stone-100 p-0.5">
              {(['all', 'positive', 'neutral', 'critical'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setToneFilter(t)}
                  className={`rounded px-2 py-1 text-[11px] font-semibold capitalize ${
                    toneFilter === t
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {filteredArchiveHeadlines.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 space-y-1"
            >
              <p className="text-[11px] font-mono-num text-stone-500">
                M{String(item.month).padStart(2, '0')} · {item.outlet} ·{' '}
                <span className="capitalize">{item.tone}</span>
              </p>
              <p className="text-xs font-semibold text-stone-900 leading-snug">
                {item.headline}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
