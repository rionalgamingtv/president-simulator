import React, { useMemo, useState } from 'react';
import {
  AlertOctagon,
  ArrowDownUp,
  BookOpen,
  Calendar,
  Flag,
  Scale,
  Shield,
  TrendingUp,
} from 'lucide-react';
import {
  EmergencyResolutionRecord,
  MilestoneItem,
  PresidentProfile,
  StabilityMetricKey,
  TermHistoryEntry,
  WorkspaceTab,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';

type TimelineCategory =
  | 'All'
  | 'Political'
  | 'Economic'
  | 'Security'
  | 'Constitutional'
  | 'Emergency';

interface TimelineEntry {
  id: string;
  month: number;
  termYear: number;
  dateLabel: string;
  kind: 'milestone' | 'emergency';
  category: Exclude<TimelineCategory, 'All'>;
  title: string;
  description: string;
  detailLine?: string;
  statusTone?: 'stabilized' | 'watch' | 'milestone';
  approvalSnapshot?: number;
}

interface AdministrationTimelineProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  currentMonth: number;
  milestones: MilestoneItem[];
  emergencyResolutions: EmergencyResolutionRecord[];
  history: TermHistoryEntry[];
  onNavigateTab: (tab: WorkspaceTab) => void;
}

const CATEGORIES: TimelineCategory[] = [
  'All',
  'Political',
  'Economic',
  'Security',
  'Constitutional',
  'Emergency',
];

const METRIC_LABELS: Record<StabilityMetricKey, string> = {
  inflation: 'Inflation (CPI)',
  nationalDebtTrillions: 'National Debt',
  approval: 'Public Approval',
};

function getCategoryIcon(category: Exclude<TimelineCategory, 'All'>) {
  switch (category) {
    case 'Political':
      return <Flag className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />;
    case 'Economic':
      return (
        <TrendingUp className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
      );
    case 'Security':
      return (
        <Shield className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
      );
    case 'Constitutional':
      return (
        <Scale className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
      );
    case 'Emergency':
      return (
        <AlertOctagon className="h-3.5 w-3.5 text-red-700" aria-hidden="true" />
      );
  }
}

export const AdministrationTimeline: React.FC<AdministrationTimelineProps> = ({
  profile,
  scenarioTitle,
  currentMonth,
  milestones,
  emergencyResolutions,
  history,
  onNavigateTab,
}) => {
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [selectedCategory, setSelectedCategory] =
    useState<TimelineCategory>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const historyByMonth = useMemo(() => {
    const map = new Map<number, TermHistoryEntry>();
    for (const h of history) {
      map.set(h.month, h);
    }
    return map;
  }, [history]);

  const allEntries = useMemo<TimelineEntry[]>(() => {
    const items: TimelineEntry[] = [];
    const seenKeys = new Set<string>();

    const addMilestone = (m: MilestoneItem) => {
      const month = Math.max(1, Number(m.month || 1));
      const dedupeKey = `ms-${month}-${m.title.trim().toLowerCase()}`;
      if (seenKeys.has(dedupeKey)) return;
      seenKeys.add(dedupeKey);

      const cal = formatMonthCalendar(month, profile.startingYear);
      const termYear = Math.floor((month - 1) / 12) + 1;
      const hist = historyByMonth.get(month);

      items.push({
        id: m.id || `ms-${month}-${items.length}`,
        month,
        termYear,
        dateLabel: cal.shortDate,
        kind: 'milestone',
        category: m.category || 'Political',
        title: m.title,
        description: m.description,
        statusTone: 'milestone',
        approvalSnapshot: hist?.metricsAfter?.approval,
      });
    };

    const hasInaugurationMilestone = milestones.some((m) =>
      /inaugurat/i.test(m.title)
    );
    if (!hasInaugurationMilestone) {
      addMilestone({
        id: 'timeline-inauguration',
        month: 1,
        category: 'Constitutional',
        title: `Inauguration of President ${profile.name}`,
        description: `Assumed office under "${scenarioTitle}" at the start of a ${profile.termLength}-month term.`,
      });
    }

    for (const m of milestones) {
      addMilestone(m);
    }

    for (const h of history) {
      if (h.outcome?.milestone?.title) {
        addMilestone({
          id: `hist-ms-m${h.month}-${h.outcome.milestone.title}`,
          month: h.month,
          category: h.outcome.milestone.category,
          title: h.outcome.milestone.title,
          description: h.outcome.milestone.description,
        });
      }
    }

    for (const er of emergencyResolutions) {
      const month = Math.max(1, Number(er.month || 1));
      const cal = formatMonthCalendar(month, profile.startingYear);
      const termYear = Math.floor((month - 1) / 12) + 1;
      const hist = historyByMonth.get(month);
      const metricName = METRIC_LABELS[er.metricKey] || er.metricKey;

      items.push({
        id: er.id,
        month,
        termYear,
        dateLabel: cal.shortDate,
        kind: 'emergency',
        category: 'Emergency',
        title: `${er.alertTitle}: ${er.chosenOptionTitle}`,
        description: er.customDirectiveNote
          ? `Executive directive: “${er.customDirectiveNote}”`
          : `Triggered emergency intervention on ${metricName} during Month ${String(
              month
            ).padStart(2, '0')}.`,
        detailLine: `${metricName} · Post-action: ${er.resolvedValueLabel} · ${
          er.stillBreached ? 'Watch Ongoing' : 'Stabilized'
        }`,
        statusTone: er.stillBreached ? 'watch' : 'stabilized',
        approvalSnapshot: hist?.metricsAfter?.approval,
      });
    }

    return items.sort((a, b) => a.month - b.month);
  }, [
    milestones,
    emergencyResolutions,
    history,
    historyByMonth,
    profile.name,
    profile.startingYear,
    profile.termLength,
    scenarioTitle,
  ]);

  const totalTermYears = Math.max(1, Math.ceil(profile.termLength / 12));
  const activeMaxYear = Math.max(
    1,
    Math.ceil(currentMonth / 12),
    ...allEntries.map((e) => e.termYear)
  );
  const yearOptions = useMemo(() => {
    const maxY = Math.min(totalTermYears, Math.max(activeMaxYear, 1));
    return Array.from({ length: maxY }, (_, idx) => {
      const yr = idx + 1;
      const calYear =
        typeof profile.startingYear === 'number' &&
        Number.isFinite(profile.startingYear)
          ? Math.round(profile.startingYear) + idx
          : null;
      const count = allEntries.filter((e) => e.termYear === yr).length;
      return {
        termYear: yr,
        label: calYear ? `${calYear} (Yr ${yr})` : `Year ${yr}`,
        shortLabel: calYear ? `${calYear}` : `Yr ${yr}`,
        count,
      };
    });
  }, [totalTermYears, activeMaxYear, profile.startingYear, allEntries]);

  const categoryCounts = useMemo(() => {
    const counts: Record<TimelineCategory, number> = {
      All: 0,
      Political: 0,
      Economic: 0,
      Security: 0,
      Constitutional: 0,
      Emergency: 0,
    };
    const yearFiltered =
      selectedYear === 'all'
        ? allEntries
        : allEntries.filter((e) => e.termYear === selectedYear);

    counts.All = yearFiltered.length;
    for (const entry of yearFiltered) {
      counts[entry.category] += 1;
    }
    return counts;
  }, [allEntries, selectedYear]);

  const filteredEntries = useMemo(() => {
    const list = allEntries.filter((entry) => {
      if (selectedYear !== 'all' && entry.termYear !== selectedYear) {
        return false;
      }
      if (selectedCategory !== 'All' && entry.category !== selectedCategory) {
        return false;
      }
      return true;
    });
    return sortOrder === 'desc' ? [...list].reverse() : list;
  }, [allEntries, selectedYear, selectedCategory, sortOrder]);

  const milestoneCount = allEntries.filter(
    (e) => e.kind === 'milestone'
  ).length;
  const emergencyCount = allEntries.filter(
    (e) => e.kind === 'emergency'
  ).length;
  const progressPct = Math.min(
    100,
    Math.max(2, Math.round((currentMonth / profile.termLength) * 100))
  );

  return (
    <section
      aria-label="Administration historical trajectory timeline"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <Calendar className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Administration Historical Trajectory</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">
              Month {String(currentMonth).padStart(2, '0')} of{' '}
              {profile.termLength}
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-stone-900">
            Milestones &amp; Emergency Resolutions Timeline
          </h2>
          <p className="text-xs text-stone-600">
            Track major historical turning points and systemic crisis
            interventions across your presidency, filtered by term year or
            policy domain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-4 font-mono-num text-stone-600">
            <span>
              <strong className="text-stone-900">{milestoneCount}</strong>{' '}
              Milestones
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-stone-900">{emergencyCount}</strong>{' '}
              Emergency Actions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238]"
            >
              <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {sortOrder === 'desc' ? 'Newest First' : 'Chronological'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('library')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#132238] transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238]"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Full Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Horizontal Term Trajectory Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono-num text-stone-500">
          <span>
            Inauguration (
            {formatMonthCalendar(1, profile.startingYear).shortDate})
          </span>
          <span>
            Term Trajectory · {progressPct}% Elapsed ({allEntries.length}{' '}
            recorded)
          </span>
          <span>
            End of Term (
            {
              formatMonthCalendar(profile.termLength, profile.startingYear)
                .shortDate
            }
            )
          </span>
        </div>

        <div className="relative h-8 rounded-lg border border-stone-200 bg-stone-50 px-2 flex items-center">
          {/* Year grid dividers */}
          {Array.from({ length: totalTermYears - 1 }, (_, i) => {
            const pct = ((i + 1) * 12 * 100) / profile.termLength;
            return (
              <div
                key={`yr-div-${i + 1}`}
                style={{ left: `${pct}%` }}
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-stone-200"
              />
            );
          })}

          {/* Baseline track + elapsed fill */}
          <div className="relative h-1.5 w-full rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-[#132238]/75 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />

            {/* Event nodes on trajectory bar */}
            {allEntries.map((entry) => {
              const rawPct =
                profile.termLength <= 1
                  ? 50
                  : ((entry.month - 1) / (profile.termLength - 1)) * 100;
              const leftPct = Math.min(98.5, Math.max(1.5, rawPct));
              const isSelected = selectedEntryId === entry.id;
              const matchesFilter =
                (selectedYear === 'all' || entry.termYear === selectedYear) &&
                (selectedCategory === 'All' ||
                  entry.category === selectedCategory);

              return (
                <button
                  key={`node-${entry.id}`}
                  type="button"
                  title={`${entry.dateLabel} · ${entry.title}`}
                  aria-label={`Jump to ${entry.title} in ${entry.dateLabel}`}
                  onClick={() => {
                    setSelectedYear(entry.termYear);
                    setSelectedCategory('All');
                    setSelectedEntryId(entry.id);
                  }}
                  style={{ left: `${leftPct}%` }}
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238] ${
                    entry.kind === 'emergency'
                      ? 'h-3 w-3 rotate-45 rounded-[2px] border border-white'
                      : 'h-3 w-3 rounded-full border border-white'
                  } ${
                    entry.kind === 'emergency'
                      ? entry.statusTone === 'watch'
                        ? 'bg-red-700'
                        : 'bg-amber-600'
                      : 'bg-[#132238]'
                  } ${
                    isSelected
                      ? 'scale-125 ring-2 ring-[#132238]/30'
                      : matchesFilter
                      ? 'opacity-100 hover:scale-125'
                      : 'opacity-30 hover:opacity-80'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend & Year Tick Labels */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full bg-[#132238]"
                aria-hidden="true"
              />
              <span>Milestone</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-amber-600"
                aria-hidden="true"
              />
              <span>Stabilized Emergency</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-red-700"
                aria-hidden="true"
              />
              <span>Ongoing Crisis Watch</span>
            </span>
          </div>
          <span className="text-stone-400">
            Click any trajectory marker to focus that year
          </span>
        </div>
      </div>

      {/* Filter Bars: Year & Category */}
      <div className="flex flex-col gap-3 border-t border-b border-stone-100 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Year Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">Year:</span>
          <div
            role="group"
            aria-label="Filter timeline by administration year"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedYear('all');
                setSelectedEntryId(null);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedYear === 'all'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Years ({allEntries.length})
            </button>
            {yearOptions.map((yr) => (
              <button
                key={yr.termYear}
                type="button"
                onClick={() => {
                  setSelectedYear(yr.termYear);
                  setSelectedEntryId(null);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold font-mono-num transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === yr.termYear
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {yr.label} ({yr.count})
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">
            Category:
          </span>
          <div
            role="group"
            aria-label="Filter timeline by event category"
            className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1"
          >
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedEntryId(null);
                  }}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Feed */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-6 text-center space-y-2.5">
          <p className="text-sm font-semibold text-stone-800">
            No timeline events match this filter
          </p>
          <p className="text-xs text-stone-600">
            No milestones or emergency resolutions were recorded for{' '}
            {selectedYear === 'all' ? 'any year' : `Year ${selectedYear}`} under{' '}
            {selectedCategory}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedYear('all');
              setSelectedCategory('All');
              setSelectedEntryId(null);
            }}
            className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="relative max-h-[440px] overflow-y-auto pr-1">
          <ol className="relative space-y-3 pl-7">
            {/* Vertical timeline spine */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-3 bottom-3 left-[11px] w-px bg-stone-200"
            />

            {filteredEntries.map((entry) => {
              const isSelected = selectedEntryId === entry.id;
              return (
                <li key={entry.id} className="relative">
                  {/* Timeline node */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-7 top-3.5 flex h-6 w-6 items-center justify-center rounded-md border bg-white ${
                      entry.kind === 'emergency'
                        ? 'border-red-300'
                        : 'border-stone-300'
                    }`}
                  >
                    {getCategoryIcon(entry.category)}
                  </span>

                  <div
                    className={`rounded-lg border p-4 transition-colors ${
                      isSelected
                        ? 'border-[#132238] bg-stone-50'
                        : entry.kind === 'emergency'
                        ? 'border-red-200 bg-red-50/35 hover:bg-red-50/60'
                        : 'border-stone-200 bg-white hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                      <div className="flex flex-wrap items-center gap-2 font-mono-num">
                        <span className="font-semibold text-stone-800">
                          Month {String(entry.month).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.dateLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>Year {entry.termYear}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            entry.kind === 'emergency'
                              ? 'font-sans font-semibold text-red-800'
                              : 'font-sans font-medium text-stone-700'
                          }
                        >
                          {entry.kind === 'emergency'
                            ? 'Emergency Resolution'
                            : entry.category}
                        </span>
                      </div>

                      {typeof entry.approvalSnapshot === 'number' && (
                        <span className="font-mono-num text-[11px] text-stone-500">
                          End-of-Month Approval{' '}
                          <strong className="text-stone-800">
                            {entry.approvalSnapshot.toFixed(1)}%
                          </strong>
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-sm font-semibold text-stone-900">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {entry.description}
                    </p>
                    {entry.detailLine && (
                      <p className="mt-1.5 font-mono-num text-[11px] font-medium text-stone-700">
                        {entry.detailLine}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
};
