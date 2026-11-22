import React, { useMemo, useState } from 'react';
import {
  Archive,
  ArrowDownUp,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  Filter,
  MessageSquareQuote,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Gavel,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  LegislativeRecordItem,
  NationalMetrics,
  PresidentProfile,
  TermHistoryEntry,
  VetoChallengeResult,
} from '../types/game';

interface PolicyArchiveViewProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  history: TermHistoryEntry[];
  legislativeRecords: LegislativeRecordItem[];
  initialMetrics: NationalMetrics;
  currentMetrics: NationalMetrics;
  canChallengeVeto: boolean;
  latestVetoResult: VetoChallengeResult | null;
  onDismissVetoResult: () => void;
  onChallengeVeto: (record: LegislativeRecordItem) => void;
  onNavigateToBriefing: () => void;
}

type SortDirection = 'asc' | 'desc';
type OutcomeFilter =
  | 'all'
  | 'Enacted'
  | 'Compromise'
  | 'Blocked'
  | 'approval_gain'
  | 'approval_loss';
type InstrumentFilter = 'all' | LegislativeRecordItem['recordType'];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatCalendarMonth(termMonth: number, startingYear?: number): string {
  const baseYear = startingYear || 2026;
  const zeroIdx = Math.max(0, termMonth - 1);
  const yearOffset = Math.floor(zeroIdx / 12);
  const monthIdx = zeroIdx % 12;
  return `${MONTH_NAMES[monthIdx]} ${baseYear + yearOffset}`;
}

function formatSignedDelta(value: number, suffix = '%', decimals = 1): string {
  const threshold = decimals === 2 ? 0.005 : 0.05;
  if (Math.abs(value) < threshold) return `0.${'0'.repeat(decimals)}${suffix}`;
  return `${value > 0 ? '+' : '-'}${Math.abs(value).toFixed(decimals)}${suffix}`;
}

export const PolicyArchiveView: React.FC<PolicyArchiveViewProps> = ({
  profile,
  scenarioTitle,
  history,
  legislativeRecords,
  initialMetrics,
  currentMetrics,
  canChallengeVeto,
  latestVetoResult,
  onDismissVetoResult,
  onChallengeVeto,
  onNavigateToBriefing,
}) => {
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [instrumentFilter, setInstrumentFilter] =
    useState<InstrumentFilter>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>(
    {}
  );
  const [confirmingVetoRecord, setConfirmingVetoRecord] =
    useState<LegislativeRecordItem | null>(null);

  // Canonical chronological array (oldest -> newest) for computing strategy shifts
  const chronologicalHistory = useMemo(
    () => [...history].sort((a, b) => a.month - b.month),
    [history]
  );

  const recordsByMonth = useMemo(() => {
    const map = new Map<number, LegislativeRecordItem>();
    for (const r of legislativeRecords) {
      map.set(r.month, r);
    }
    return map;
  }, [legislativeRecords]);

  const enrichedEntries = useMemo(() => {
    return chronologicalHistory.map((entry, idx) => {
      const prevEntry = idx > 0 ? chronologicalHistory[idx - 1] : null;
      const storedRecord = recordsByMonth.get(entry.month);
      const recordType: LegislativeRecordItem['recordType'] =
        storedRecord?.recordType ||
        entry.outcome.legislativeRecord?.recordType ||
        'Executive Order';
      const outcomeStatus: LegislativeRecordItem['outcomeStatus'] =
        storedRecord?.outcomeStatus ||
        entry.outcome.legislativeRecord?.outcomeStatus ||
        'Enacted';
      const legislativeTitle =
        storedRecord?.title ||
        entry.outcome.legislativeRecord?.title ||
        entry.briefingTitle;

      const linkedRecord: LegislativeRecordItem = storedRecord || {
        id: `leg-archive-m${entry.month}`,
        month: entry.month,
        recordType,
        title: legislativeTitle,
        summary:
          entry.outcome.legislativeRecord?.summary || entry.policyDirective,
        outcomeStatus,
        approvalImpact: entry.outcome.metricDeltas.approval,
      };

      const prevRecordType = prevEntry
        ? recordsByMonth.get(prevEntry.month)?.recordType ||
          prevEntry.outcome.legislativeRecord?.recordType ||
          'Executive Order'
        : null;

      const shiftTags: string[] = [];
      if (prevRecordType && prevRecordType !== recordType) {
        shiftTags.push(`Pivot: ${prevRecordType} → ${recordType}`);
      }
      if (entry.outcome.metricDeltas.approval >= 2.5) {
        shiftTags.push('Momentum Surge');
      } else if (entry.outcome.metricDeltas.approval <= -2.5) {
        shiftTags.push('Political Headwind');
      }
      if (entry.personalAction && entry.personalAction.trim().length > 0) {
        shiftTags.push('Parallel Personal/Exec Action');
      }

      return {
        entry,
        linkedRecord,
        recordType,
        outcomeStatus,
        legislativeTitle,
        shiftTags,
      };
    });
  }, [chronologicalHistory, recordsByMonth]);

  const strategySummary = useMemo(() => {
    const total = enrichedEntries.length;
    let enacted = 0;
    let compromise = 0;
    let blocked = 0;
    const typeCounts: Record<LegislativeRecordItem['recordType'], number> = {
      Legislation: 0,
      'Executive Order': 0,
      Treaty: 0,
      Institutional: 0,
    };

    for (const item of enrichedEntries) {
      if (item.outcomeStatus === 'Enacted') enacted += 1;
      else if (item.outcomeStatus === 'Compromise') compromise += 1;
      else blocked += 1;
      typeCounts[item.recordType] = (typeCounts[item.recordType] || 0) + 1;
    }

    const sortedTypes = (
      Object.entries(typeCounts) as [
        LegislativeRecordItem['recordType'],
        number,
      ][]
    ).sort((a, b) => b[1] - a[1]);
    const dominantInstrument =
      total > 0 && sortedTypes[0][1] > 0 ? sortedTypes[0][0] : '—';

    let pivotCount = 0;
    for (let i = 1; i < enrichedEntries.length; i += 1) {
      if (enrichedEntries[i].recordType !== enrichedEntries[i - 1].recordType) {
        pivotCount += 1;
      }
    }

    let strategicDriftNote =
      'Issue multiple monthly directives to trace strategic pivots across your term.';
    if (total >= 4) {
      const mid = Math.floor(total / 2);
      const firstHalf = enrichedEntries.slice(0, mid);
      const secondHalf = enrichedEntries.slice(mid);
      const topType = (arr: typeof enrichedEntries) => {
        const counts = new Map<string, number>();
        for (const item of arr) {
          counts.set(item.recordType, (counts.get(item.recordType) || 0) + 1);
        }
        let best = 'Executive Order';
        let bestCount = -1;
        for (const [k, v] of counts.entries()) {
          if (v > bestCount) {
            best = k;
            bestCount = v;
          }
        }
        return best;
      };
      const earlyStyle = topType(firstHalf);
      const recentStyle = topType(secondHalf);
      strategicDriftNote =
        earlyStyle === recentStyle
          ? `Consistent ${recentStyle}-led posture across early and recent halves (${pivotCount} tactical shifts).`
          : `Shifted primary instrument from ${earlyStyle} (early term) to ${recentStyle} (recent term).`;
    } else if (total > 0) {
      strategicDriftNote = `${pivotCount} instrument ${
        pivotCount === 1 ? 'pivot' : 'pivots'
      } logged across ${total} ${total === 1 ? 'month' : 'months'}.`;
    }

    return {
      total,
      enacted,
      compromise,
      blocked,
      typeCounts,
      dominantInstrument,
      pivotCount,
      strategicDriftNote,
    };
  }, [enrichedEntries]);

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = enrichedEntries.filter((item) => {
      if (instrumentFilter !== 'all' && item.recordType !== instrumentFilter) {
        return false;
      }
      if (outcomeFilter === 'approval_gain') {
        if (item.entry.outcome.metricDeltas.approval <= 0) return false;
      } else if (outcomeFilter === 'approval_loss') {
        if (item.entry.outcome.metricDeltas.approval >= 0) return false;
      } else if (
        outcomeFilter !== 'all' &&
        item.outcomeStatus !== outcomeFilter
      ) {
        return false;
      }

      if (q) {
        const haystack = [
          item.entry.policyDirective,
          item.entry.briefingTitle,
          item.entry.publicMessaging,
          item.entry.personalAction || '',
          item.legislativeTitle,
          item.entry.outcome.newspaperHeadline,
          item.recordType,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return sortOrder === 'asc' ? list : [...list].reverse();
  }, [
    enrichedEntries,
    searchQuery,
    outcomeFilter,
    instrumentFilter,
    sortOrder,
  ]);

  const allVisibleExpanded =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((item) => Boolean(expandedMonths[item.entry.month]));

  const handleToggleAll = () => {
    if (allVisibleExpanded) {
      setExpandedMonths({});
      return;
    }
    const next: Record<number, boolean> = {};
    for (const item of filteredAndSorted) {
      next[item.entry.month] = true;
    }
    setExpandedMonths(next);
  };

  const toggleExpandMonth = (month: number) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const approvalNetSinceStart =
    currentMetrics.approval - initialMetrics.approval;
  const gdpNetSinceStart = currentMetrics.gdpGrowth - initialMetrics.gdpGrowth;

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* Masthead & Strategy Shift Summary */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 md:p-7 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Archive className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>
                Chronological Directive Log · {scenarioTitle}
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold text-[#132238]">
              Policy Archive
            </h1>
            <p className="mt-1 text-sm text-stone-600 max-w-2xl">
              Every policy directive issued by President {profile.name} in
              chronological order, alongside its governing instrument, public
              framing, and economic/political aftermath.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap"
            >
              <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {sortOrder === 'asc'
                  ? 'Order: Chronological (Month 1 → Latest)'
                  : 'Order: Most Recent First'}
              </span>
            </button>

            {filteredAndSorted.length > 0 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap"
              >
                {allVisibleExpanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Collapse Details</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Expand All Details</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 4 Strategy Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Directives Archived
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-2xl font-bold text-[#132238]">
                {strategySummary.total}
              </span>
              <span className="text-xs text-stone-500">
                / {profile.termLength} months
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              {strategySummary.enacted} enacted · {strategySummary.compromise}{' '}
              compromise · {strategySummary.blocked} blocked
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Primary Governance Mode
            </span>
            <span className="block text-lg font-bold text-stone-900">
              {strategySummary.dominantInstrument}
            </span>
            <p className="font-mono-num text-xs text-stone-600">
              {strategySummary.typeCounts.Legislation} Leg ·{' '}
              {strategySummary.typeCounts['Executive Order']} EO ·{' '}
              {strategySummary.typeCounts.Treaty} Treaty ·{' '}
              {strategySummary.typeCounts.Institutional} Inst
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Long-Term Strategy Arc
            </span>
            <div className="flex items-center gap-1.5">
              <Compass
                className="h-4 w-4 text-[#132238] shrink-0"
                aria-hidden="true"
              />
              <span className="font-mono-num text-base font-bold text-stone-900">
                {strategySummary.pivotCount} Tactical{' '}
                {strategySummary.pivotCount === 1 ? 'Shift' : 'Shifts'}
              </span>
            </div>
            <p className="text-xs leading-snug text-stone-600">
              {strategySummary.strategicDriftNote}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Cumulative Policy Impact
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-xl font-bold text-stone-900">
                {currentMetrics.approval.toFixed(1)}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  approvalNetSinceStart >= 0
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}
              >
                {formatSignedDelta(approvalNetSinceStart)} approval
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              GDP {formatSignedDelta(gdpNetSinceStart)} vs Inauguration
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {history.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-[#F7F6F2] p-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search directives, briefings, headlines, or messaging..."
                aria-label="Search past policy directives"
                className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mr-1">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-medium">Filter:</span>
              </div>

              <select
                value={instrumentFilter}
                onChange={(e) =>
                  setInstrumentFilter(e.target.value as InstrumentFilter)
                }
                aria-label="Filter by governing instrument"
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
              >
                <option value="all">All Instruments</option>
                <option value="Legislation">Legislation</option>
                <option value="Executive Order">Executive Order</option>
                <option value="Treaty">Treaty</option>
                <option value="Institutional">Institutional</option>
              </select>

              <select
                value={outcomeFilter}
                onChange={(e) =>
                  setOutcomeFilter(e.target.value as OutcomeFilter)
                }
                aria-label="Filter by directive outcome"
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
              >
                <option value="all">All Outcomes</option>
                <option value="Enacted">Enacted</option>
                <option value="Compromise">Compromise</option>
                <option value="Blocked">Blocked</option>
                <option value="approval_gain">Approval Gained (+)</option>
                <option value="approval_loss">Approval Lost (-)</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Veto Challenge Outcome Banner */}
      {latestVetoResult && (
        <section
          role="status"
          aria-label="Veto challenge result"
          className={`rounded-xl border-2 p-5 space-y-2 ${
            latestVetoResult.succeeded
              ? 'border-emerald-300 bg-emerald-50/90'
              : 'border-red-300 bg-red-50/90'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
                {latestVetoResult.succeeded ? (
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-700"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertTriangle
                    className="h-4 w-4 text-red-700"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={
                    latestVetoResult.succeeded
                      ? 'text-emerald-800'
                      : 'text-red-800'
                  }
                >
                  {latestVetoResult.succeeded
                    ? `Veto Upheld (10% Roll Succeeded) · Month ${latestVetoResult.month}`
                    : `Veto Challenge Overridden (90% Roll Failed) · Month ${latestVetoResult.month}`}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                {latestVetoResult.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onDismissVetoResult}
              aria-label="Dismiss veto challenge result"
              className="rounded-md p-1 text-stone-500 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-stone-800">
            {latestVetoResult.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 font-mono-num text-xs">
            <span className="rounded border border-stone-200 bg-white px-2.5 py-0.5 font-semibold text-stone-800">
              Status: {latestVetoResult.previousStatus} →{' '}
              {latestVetoResult.newStatus}
            </span>
            <span className="rounded border border-red-200 bg-white px-2.5 py-0.5 font-semibold text-red-700">
              Approval {latestVetoResult.approvalDelta.toFixed(1)}%
            </span>
            <span className="rounded border border-red-200 bg-white px-2.5 py-0.5 font-semibold text-red-700">
              Congress {latestVetoResult.congressDelta.toFixed(1)}%
            </span>
          </div>
        </section>
      )}

      {/* Chronological Directive Timeline */}
      {history.length === 0 ? (
        <section className="rounded-xl border border-stone-200 bg-white p-8 text-center space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-[#132238]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            No Policy Directives Issued Yet
          </h2>
          <p className="mx-auto max-w-lg text-sm text-stone-600">
            Your administration is in Month 1. Once you issue your first monthly
            policy directive from the Briefing Desk, every order, strategic
            shift, and outcome metric will be logged chronologically here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToBriefing}
              className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
            >
              <span>Return to Briefing Desk</span>
            </button>
          </div>
        </section>
      ) : filteredAndSorted.length === 0 ? (
        <section className="rounded-xl border border-stone-200 bg-white p-8 text-center space-y-3">
          <p className="text-sm font-medium text-stone-700">
            No archived policy directives match your current search or filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setOutcomeFilter('all');
              setInstrumentFilter('all');
            }}
            className="inline-flex items-center rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
          >
            Reset Filters
          </button>
        </section>
      ) : (
        <section
          aria-label="Chronological list of issued policy directives"
          className="relative space-y-4"
        >
          {filteredAndSorted.map(
            ({
              entry,
              linkedRecord,
              recordType,
              outcomeStatus,
              legislativeTitle,
              shiftTags,
            }) => {
              const isExpanded = Boolean(expandedMonths[entry.month]);
              const deltas = entry.outcome.metricDeltas;
              const approvalPositive = deltas.approval >= 0;
              const canVetoThis =
                canChallengeVeto &&
                outcomeStatus === 'Enacted' &&
                !linkedRecord.vetoChallenged;

              const statusStyles =
                outcomeStatus === 'Enacted'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : outcomeStatus === 'Compromise'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-800';

              return (
                <article
                  key={entry.month}
                  className="rounded-xl border border-stone-200 bg-white p-5 md:p-6 space-y-4 transition-colors hover:border-stone-300"
                >
                  {/* Top Meta Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3.5">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center rounded-md bg-[#132238] px-2.5 py-0.5 font-mono-num font-semibold text-white">
                          Month {String(entry.month).padStart(2, '0')} ·{' '}
                          {formatCalendarMonth(
                            entry.month,
                            profile.startingYear
                          )}
                        </span>
                        <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 font-semibold text-stone-700">
                          {recordType}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-0.5 font-semibold ${statusStyles}`}
                        >
                          {outcomeStatus}
                        </span>
                        {shiftTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50/70 px-2 py-0.5 font-medium text-amber-900"
                          >
                            <Sparkles
                              className="h-3 w-3 shrink-0"
                              aria-hidden="true"
                            />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>

                      <h2 className="font-display text-lg font-bold text-stone-900 pt-1">
                        {legislativeTitle}
                      </h2>
                      <p className="text-xs text-stone-500">
                        Briefing Agenda: {entry.briefingTitle}
                      </p>
                    </div>

                    {/* Key Deltas */}
                    <div className="flex flex-wrap items-center gap-2 font-mono-num text-xs shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-semibold ${
                          approvalPositive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        {approvalPositive ? (
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <TrendingDown
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                        <span>
                          Approval {formatSignedDelta(deltas.approval)}
                        </span>
                      </span>

                      <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 font-medium text-stone-700">
                        Congress {formatSignedDelta(deltas.congressSupport)}
                      </span>

                      <span className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 font-medium text-stone-700">
                        GDP {formatSignedDelta(deltas.gdpGrowth)}
                      </span>
                    </div>
                  </div>

                  {/* Issued Policy Directive Text */}
                  <div className="rounded-lg border border-stone-200 bg-[#F7F6F2] p-4 space-y-1.5">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                      Policy Directive Issued
                    </span>
                    <p className="text-sm leading-relaxed text-stone-900 font-medium whitespace-pre-line">
                      {entry.policyDirective}
                    </p>
                  </div>

                  {entry.personalAction &&
                    entry.personalAction.trim().length > 0 && (
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                          Accompanying Personal / Executive Action
                        </span>
                        <p className="text-xs leading-relaxed text-stone-800">
                          {entry.personalAction}
                        </p>
                      </div>
                    )}

                  {/* Footer Strip, Veto Action & Expand Trigger */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-stone-600">
                      <span className="font-semibold text-stone-800">
                        {entry.outcome.newspaperOutlet}:
                      </span>
                      <span className="italic">
                        &ldquo;{entry.outcome.newspaperHeadline}&rdquo;
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {canVetoThis && (
                        <button
                          type="button"
                          onClick={() => setConfirmingVetoRecord(linkedRecord)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100"
                        >
                          <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Veto Challenge (10% · -6% Approval)</span>
                        </button>
                      )}

                      {linkedRecord.vetoChallenged && (
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                            outcomeStatus === 'Blocked'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-stone-200 bg-stone-100 text-stone-600'
                          }`}
                        >
                          {outcomeStatus === 'Blocked'
                            ? 'Veto Upheld (Blocked)'
                            : 'Veto Challenge Failed'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpandMonth(entry.month)}
                        className="inline-flex items-center gap-1 font-semibold text-[#132238] hover:underline shrink-0"
                      >
                        <span>
                          {isExpanded
                            ? 'Hide Messaging & Snapshot'
                            : 'Inspect Messaging & Metric Snapshot'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Turn Context */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-stone-200 pt-4">
                      {entry.publicMessaging && (
                        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                            <MessageSquareQuote
                              className="h-3.5 w-3.5 text-[#132238]"
                              aria-hidden="true"
                            />
                            <span>Accompanying Public Messaging</span>
                          </div>
                          <p className="text-xs leading-relaxed text-stone-700 italic">
                            &ldquo;{entry.publicMessaging}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="block text-xs font-semibold text-stone-700">
                          Turn Outcome Summary
                        </span>
                        <p className="text-xs leading-relaxed text-stone-700 whitespace-pre-line">
                          {entry.outcome.outcomeNarrative}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Approval
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.approval.toFixed(1)}%
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Congress
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.congressSupport.toFixed(1)}%
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            GDP Growth
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.gdpGrowth.toFixed(1)}%
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Inflation
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.inflation.toFixed(1)}%
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Unemployment
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.unemployment.toFixed(1)}%
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Diplomacy
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            {entry.metricsAfter.diplomaticStanding.toFixed(1)}
                          </span>
                        </div>
                        <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                          <span className="block text-[11px] text-stone-500">
                            Debt
                          </span>
                          <span className="font-mono-num text-sm font-bold text-stone-900">
                            ${entry.metricsAfter.nationalDebtTrillions.toFixed(2)}T
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            }
          )}
        </section>
      )}

      {/* Veto Challenge Confirmation Modal */}
      {confirmingVetoRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="veto-challenge-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmingVetoRecord(null);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                  Retroactive Presidential Veto Challenge
                </p>
                <h3
                  id="veto-challenge-modal-title"
                  className="mt-1 font-display text-xl font-bold text-stone-900"
                >
                  {confirmingVetoRecord.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Month {String(confirmingVetoRecord.month).padStart(2, '0')} ·{' '}
                  {confirmingVetoRecord.recordType} · Currently{' '}
                  <strong className="text-emerald-700">
                    {confirmingVetoRecord.outcomeStatus}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmingVetoRecord(null)}
                aria-label="Cancel veto challenge"
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 space-y-1.5 text-xs text-amber-950">
              <p className="font-semibold">
                Constitutional &amp; Political Stakes:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>10% Success Chance:</strong> Flips this record&apos;s
                  status from <strong>Enacted</strong> to{' '}
                  <strong>Blocked</strong> via executive challenge / injunction.
                </li>
                <li>
                  <strong>Guaranteed Approval Hit:</strong> Challenging a
                  previously enacted policy immediately costs{' '}
                  <strong>-6.0% Public Approval</strong> and{' '}
                  <strong>-3.0% Congressional Support</strong> regardless of
                  outcome.
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmingVetoRecord(null)}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmingVetoRecord;
                  setConfirmingVetoRecord(null);
                  onChallengeVeto(target);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
              >
                <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Execute Veto Challenge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
