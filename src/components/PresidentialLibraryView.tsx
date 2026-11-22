import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ScrollText,
  Newspaper,
  LineChart,
  RefreshCw,
  Landmark,
  Award,
  Download,
  Trash2,
  Scale,
} from 'lucide-react';
import {
  LegislativeRecordItem,
  LibrarySynthesis,
  MilestoneItem,
  NationalMetrics,
  NewsHeadlineItem,
  SavedCareerState,
  TermHistoryEntry,
} from '../types/game';
import { NationalLedger } from './NationalLedger';
import { PresidentialLegacySection } from './PresidentialLegacySection';
import { getPartyMeta, SCENARIOS } from '../data/scenarios';

interface PresidentialLibraryViewProps {
  careerState: SavedCareerState;
  pastLibraries: SavedCareerState[];
  initialMetrics: NationalMetrics;
  isSynthesizing: boolean;
  synthesisError: string | null;
  onSynthesizeLibrary: () => void;
  onStartNewCareer: () => void;
}

type LibrarySection =
  | 'overview'
  | 'legacy'
  | 'legislation'
  | 'gallery'
  | 'ledger';

function formatNetDelta(val: number, suffix = '%', invertGood = false) {
  const positive = val > 0.01;
  const negative = val < -0.01;
  if (!positive && !negative) {
    return { text: `0.0${suffix}`, color: 'text-stone-500' };
  }
  const good = invertGood ? negative : positive;
  return {
    text: `${positive ? '+' : ''}${val.toFixed(1)}${suffix}`,
    color: good ? 'text-emerald-700' : 'text-red-700',
  };
}

export const PresidentialLibraryView: React.FC<PresidentialLibraryViewProps> = ({
  careerState,
  pastLibraries,
  initialMetrics,
  isSynthesizing,
  synthesisError,
  onSynthesizeLibrary,
  onStartNewCareer,
}) => {
  const [section, setSection] = useState<LibrarySection>('overview');
  const [recordFilter, setRecordFilter] = useState<
    'all' | LegislativeRecordItem['recordType'] | 'Blocked'
  >('all');
  const [expandedNewsMonth, setExpandedNewsMonth] = useState<number | null>(
    null
  );
  const [inspectingPastId, setInspectingPastId] = useState<string | null>(null);

  const activeLibrary: SavedCareerState = useMemo(() => {
    if (!inspectingPastId) return careerState;
    return (
      pastLibraries.find((p) => p.updatedAt === inspectingPastId) || careerState
    );
  }, [inspectingPastId, pastLibraries, careerState]);

  const activeInitial =
    activeLibrary.initialMetricsSnapshot || initialMetrics;
  const chosenScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === activeLibrary.scenarioId),
    [activeLibrary.scenarioId]
  );
  const scenarioInitialMetrics =
    chosenScenario?.initialMetrics || activeInitial;
  const metrics = activeLibrary.metrics;
  const history = activeLibrary.history;

  const derivedMilestones = useMemo<MilestoneItem[]>(() => {
    const items: MilestoneItem[] = [
      {
        id: 'ms-inauguration',
        month: 1,
        category: 'Constitutional',
        title: `Inauguration of President ${activeLibrary.profile.name}`,
        description: `Took the oath of office alongside Vice President ${activeLibrary.vicePresident.name} under "${activeLibrary.scenarioTitle}" with ${activeInitial.approval.toFixed(
          1
        )}% initial approval.`,
      },
      ...(activeLibrary.milestones || []),
    ];

    if (history.length >= 3) {
      const m3 = history[2];
      items.push({
        id: 'ms-100-days',
        month: 3,
        category: 'Political',
        title: 'First 100 Days Assessment',
        description: `Completed opening quarter at ${m3.metricsAfter.approval.toFixed(
          1
        )}% approval and ${m3.metricsAfter.gdpGrowth.toFixed(
          1
        )}% GDP growth.`,
      });
    }

    if (history.length > 0) {
      let peak = history[0];
      for (const h of history) {
        if (h.metricsAfter.approval > peak.metricsAfter.approval) peak = h;
      }
      if (peak.metricsAfter.approval >= activeInitial.approval + 3) {
        items.push({
          id: 'ms-peak-approval',
          month: peak.month,
          category: 'Political',
          title: `Term Approval High (${peak.metricsAfter.approval.toFixed(1)}%)`,
          description: `Reached peak public backing following "${peak.outcome.newspaperHeadline}".`,
        });
      }
    }

    const midterm = history.find((h) => h.month === 24 && h.outcome.midtermSeatShift);
    if (midterm?.outcome.midtermSeatShift) {
      items.push({
        id: 'ms-midterm',
        month: 24,
        category: 'Constitutional',
        title: 'Midterm Congressional Elections',
        description: midterm.outcome.midtermSeatShift.summary,
      });
    }

    const seen = new Set<string>();
    return items
      .filter((m) => {
        const key = `${m.month}-${m.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.month - b.month);
  }, [activeLibrary, activeInitial, history]);

  const legislativeRecords = useMemo<LegislativeRecordItem[]>(() => {
    if (activeLibrary.legislativeRecords?.length > 0) {
      return activeLibrary.legislativeRecords;
    }
    return history.map((h) => ({
      id: `leg-fallback-${h.month}`,
      month: h.month,
      recordType: h.outcome.legislativeRecord?.recordType || 'Executive Order',
      title:
        h.outcome.legislativeRecord?.title ||
        `Month ${h.month} Directive: ${h.briefingTitle}`,
      summary: h.outcome.legislativeRecord?.summary || h.policyDirective,
      outcomeStatus: h.outcome.legislativeRecord?.outcomeStatus || 'Enacted',
      approvalImpact: h.outcome.metricDeltas.approval,
    }));
  }, [activeLibrary.legislativeRecords, history]);

  const filteredRecords = useMemo(() => {
    const list = [...legislativeRecords].reverse();
    if (recordFilter === 'all') return list;
    if (recordFilter === 'Blocked') {
      return list.filter((r) => r.outcomeStatus === 'Blocked');
    }
    return list.filter((r) => r.recordType === recordFilter);
  }, [legislativeRecords, recordFilter]);

  const enactedCount = legislativeRecords.filter(
    (r) => r.outcomeStatus === 'Enacted'
  ).length;
  const compromiseCount = legislativeRecords.filter(
    (r) => r.outcomeStatus === 'Compromise'
  ).length;
  const blockedCount = legislativeRecords.filter(
    (r) => r.outcomeStatus === 'Blocked'
  ).length;

  const synthesis: LibrarySynthesis | null = activeLibrary.librarySynthesis;

  const approvalNet = formatNetDelta(metrics.approval - activeInitial.approval);
  const gdpNet = formatNetDelta(metrics.gdpGrowth - activeInitial.gdpGrowth);
  const inflationNet = formatNetDelta(
    metrics.inflation - activeInitial.inflation,
    '%',
    true
  );
  const unempNet = formatNetDelta(
    metrics.unemployment - activeInitial.unemployment,
    '%',
    true
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(activeLibrary, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presidential-library-${activeLibrary.profile.name
      .toLowerCase()
      .replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const partyMeta = getPartyMeta(
    activeLibrary.profile.party,
    activeLibrary.profile.coalition
  );

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* Library Masthead & Cumulative Bar */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Cumulative Historical Record · Independent of Monthly Cycle
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-3xl font-bold text-[#132238]">
                The {activeLibrary.profile.name} Presidential Library
              </h1>
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${partyMeta.badgeClass}`}
              >
                {partyMeta.shortCode} · {partyMeta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {activeLibrary.scenarioTitle}
              {activeLibrary.profile.startingYear
                ? ` (Inaugurated Jan ${activeLibrary.profile.startingYear})`
                : ''}{' '}
              · Vice President {activeLibrary.vicePresident.name} ·{' '}
              <span className="font-mono-num">
                {history.length} of {activeLibrary.profile.termLength} months
                archived
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!inspectingPastId && (
              <button
                type="button"
                onClick={onSynthesizeLibrary}
                disabled={isSynthesizing || history.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isSynthesizing ? 'animate-spin' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {isSynthesizing
                    ? 'Synthesizing Archive...'
                    : synthesis
                    ? 'Refresh Retrospective'
                    : 'Generate Retrospective'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Library</span>
            </button>

            <button
              type="button"
              onClick={onStartNewCareer}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Start New Term</span>
            </button>
          </div>
        </div>

        {/* Past Administrations Shelf */}
        {pastLibraries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs">
            <span className="font-semibold text-stone-600">
              Presidential Shelf:
            </span>
            <button
              type="button"
              onClick={() => setInspectingPastId(null)}
              className={`rounded-md px-2.5 py-1 font-medium ${
                !inspectingPastId
                  ? 'bg-[#132238] text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Current ({careerState.profile.name})
            </button>
            {pastLibraries.map((p) => (
              <button
                key={p.updatedAt}
                type="button"
                onClick={() => setInspectingPastId(p.updatedAt)}
                className={`rounded-md px-2.5 py-1 font-medium ${
                  inspectingPastId === p.updatedAt
                    ? 'bg-[#132238] text-white'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p.profile.name} ({p.scenarioTitle})
              </button>
            ))}
          </div>
        )}

        {/* Cumulative Term Comparison Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Net Approval</span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {metrics.approval.toFixed(1)}%
            </span>
            <span
              className={`font-mono-num text-xs font-semibold ${approvalNet.color}`}
            >
              {approvalNet.text} since Day 1
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">GDP Trajectory</span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {metrics.gdpGrowth.toFixed(1)}%
            </span>
            <span
              className={`font-mono-num text-xs font-semibold ${gdpNet.color}`}
            >
              {gdpNet.text} since Day 1
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Inflation Shift</span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {metrics.inflation.toFixed(1)}%
            </span>
            <span
              className={`font-mono-num text-xs font-semibold ${inflationNet.color}`}
            >
              {inflationNet.text} since Day 1
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Unemployment</span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {metrics.unemployment.toFixed(1)}%
            </span>
            <span
              className={`font-mono-num text-xs font-semibold ${unempNet.color}`}
            >
              {unempNet.text} since Day 1
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Legislative Record
            </span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {enactedCount + compromiseCount} Passed
            </span>
            <span className="font-mono-num text-xs text-stone-500">
              {blockedCount} blocked
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Congressional Margin
            </span>
            <span className="mt-1 block font-mono-num text-xl font-bold text-stone-900">
              {metrics.houseSeats}H / {metrics.senateSeats}S
            </span>
            <span className="font-mono-num text-xs text-stone-500">
              Support {metrics.congressSupport.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Segmented Sub-Views */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1 w-fit">
          <button
            type="button"
            onClick={() => setSection('overview')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'overview'
                ? 'bg-white text-[#132238] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Overview &amp; Milestones</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('legacy')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'legacy'
                ? 'bg-white text-[#132238] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Scale className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Presidential Legacy</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('legislation')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'legislation'
                ? 'bg-white text-[#132238] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Legislative Record ({legislativeRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('gallery')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'gallery'
                ? 'bg-white text-[#132238] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Major News Gallery ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSection('ledger')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              section === 'ledger'
                ? 'bg-white text-[#132238] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
            <span>National Ledger</span>
          </button>
        </div>

        {synthesisError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-900"
          >
            {synthesisError}
          </div>
        )}
      </section>

      {/* Section 1: Overview & Milestones */}
      {section === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Archivist Retrospective
                </p>
                <h2 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                  {synthesis
                    ? synthesis.administrationTheme
                    : `Cumulative Portrait · ${activeLibrary.profile.name}`}
                </h2>
              </div>
              <Landmark className="h-5 w-5 text-[#132238]" aria-hidden="true" />
            </div>

            {synthesis ? (
              <div className="space-y-4">
                <p className="text-xs font-mono-num text-stone-500">
                  Synthesized through Month {synthesis.generatedAtMonth}
                </p>
                <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-line">
                  {synthesis.longTermSummary}
                </p>
                <div className="grid grid-cols-1 gap-4 border-t border-stone-200 pt-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-600">
                      Economic &amp; Fiscal Arc
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {synthesis.economicArc}
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-600">
                      Foreign Policy &amp; Defense Posture
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {synthesis.foreignPolicyArc}
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <h3 className="text-xs font-semibold text-stone-600">
                      Institutional &amp; Constitutional Standing
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {synthesis.institutionalLegacy}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-stone-700">
                  {history.length === 0
                    ? `President ${activeLibrary.profile.name} has just been inaugurated alongside Vice President ${activeLibrary.vicePresident.name}. As you govern month by month, enacted bills, executive orders, milestones, and front-page journalism will accumulate here automatically.`
                    : `Over ${history.length} completed months, the ${activeLibrary.profile.name} administration has recorded ${legislativeRecords.length} formal actions (${enactedCount} enacted, ${compromiseCount} compromises, ${blockedCount} blocked). Public approval stands at ${metrics.approval.toFixed(
                        1
                      )}% (${approvalNet.text} since inauguration), with inflation at ${metrics.inflation.toFixed(
                        1
                      )}% and GDP growth at ${metrics.gdpGrowth.toFixed(1)}%.`}
                </p>
                {history.length > 0 && !inspectingPastId && (
                  <button
                    type="button"
                    onClick={onSynthesizeLibrary}
                    disabled={isSynthesizing}
                    className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100"
                  >
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {isSynthesizing
                        ? 'Drafting Historian Synthesis...'
                        : 'Generate Full Historian Retrospective'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-6 space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <p className="text-xs font-medium text-stone-500">
                Administration Chronology
              </p>
              <h2 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                Major Milestones
              </h2>
            </div>

            <div className="space-y-3">
              {derivedMilestones.map((ms) => (
                <article
                  key={ms.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-num font-semibold text-[#132238]">
                      Month {String(ms.month).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-stone-500">
                      {ms.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {ms.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    {ms.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Section 2: Achieved Legislative & Executive Record */}
      {section === 'legislation' && (
        <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Bills, Executive Orders &amp; Treaties
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-semibold text-stone-900">
                Achieved Legislative &amp; Executive Record
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
              {(
                [
                  { id: 'all', label: 'All Records' },
                  { id: 'Legislation', label: 'Legislation' },
                  { id: 'Executive Order', label: 'Executive Orders' },
                  { id: 'Treaty', label: 'Treaties' },
                  { id: 'Blocked', label: 'Blocked' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRecordFilter(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    recordFilter === tab.id
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <p className="text-sm text-stone-600">
              No records match this filter yet. Directives issued on the
              Briefing Desk are permanently cataloged here.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((rec) => {
                const statusColor =
                  rec.outcomeStatus === 'Enacted'
                    ? 'text-emerald-700'
                    : rec.outcomeStatus === 'Compromise'
                    ? 'text-amber-700'
                    : 'text-red-700';

                return (
                  <article
                    key={rec.id}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
                  >
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span className="font-mono-num font-semibold text-stone-700">
                          Month {String(rec.month).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.recordType}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${statusColor}`}>
                          {rec.outcomeStatus}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-stone-900">
                        {rec.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-stone-700">
                        {rec.summary}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs font-mono-num md:text-right">
                      <span className="block text-stone-500">
                        Approval Shift
                      </span>
                      <span
                        className={`font-semibold ${
                          rec.approvalImpact >= 0
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {rec.approvalImpact >= 0 ? '+' : ''}
                        {rec.approvalImpact.toFixed(1)}%
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Section 3: Gallery of Major News Events */}
      {section === 'gallery' && (
        <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
          <div className="border-b border-stone-200 pb-4">
            <p className="text-xs font-medium text-stone-500">
              Front-Page Broadsheet Exhibition
            </p>
            <h2 className="mt-0.5 font-display text-2xl font-semibold text-stone-900">
              Gallery of Major News Events
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Front-page coverage of every month in office will appear in this
                exhibition gallery. Opening wire dispatches from Inauguration
                Week:
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeLibrary.newsFeed.slice(0, 4).map((n: NewsHeadlineItem) => (
                  <article
                    key={n.id}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-1.5"
                  >
                    <p className="text-xs font-semibold text-stone-500">
                      {n.outlet} · Month {n.month}
                    </p>
                    <h3 className="font-display text-lg font-bold text-stone-900">
                      {n.headline}
                    </h3>
                    <p className="text-xs leading-relaxed text-stone-600">
                      {n.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[...history].reverse().map((entry: TermHistoryEntry) => {
                const isExpanded = expandedNewsMonth === entry.month;
                const appDelta = entry.outcome.metricDeltas.approval;
                return (
                  <article
                    key={entry.month}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5 text-xs">
                        <span className="font-semibold text-stone-700">
                          {entry.outcome.newspaperOutlet} ·{' '}
                          <span className="font-mono-num">
                            Month {String(entry.month).padStart(2, '0')}
                          </span>
                        </span>
                        <span
                          className={`font-mono-num font-semibold ${
                            appDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {appDelta >= 0 ? '+' : ''}
                          {appDelta.toFixed(1)}% approval
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold leading-snug text-stone-900">
                        {entry.outcome.newspaperHeadline}
                      </h3>
                      <p className="text-sm font-medium text-stone-600">
                        {entry.outcome.newspaperSubhead}
                      </p>

                      <p
                        className={`text-xs leading-relaxed text-stone-700 ${
                          isExpanded ? 'whitespace-pre-line' : 'line-clamp-3'
                        }`}
                      >
                        {entry.outcome.outcomeNarrative}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
                      <span className="font-mono-num text-stone-500">
                        GDP {entry.metricsAfter.gdpGrowth.toFixed(1)}% · CPI{' '}
                        {entry.metricsAfter.inflation.toFixed(1)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedNewsMonth(isExpanded ? null : entry.month)
                        }
                        className="font-semibold text-[#132238] hover:underline"
                      >
                        {isExpanded ? 'Show Less' : 'Read Full Dispatch'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Section 4: National Ledger Charts & Full Chronological Log */}
      {section === 'ledger' && (
        <NationalLedger
          careerState={activeLibrary}
          metrics={metrics}
          initialMetrics={activeInitial}
          history={history}
          onStartNewCareer={onStartNewCareer}
        />
      )}

      {/* Section 5: Presidential Legacy Comparison */}
      {section === 'legacy' && (
        <PresidentialLegacySection
          activeLibrary={activeLibrary}
          scenarioInitialMetrics={scenarioInitialMetrics}
          scenarioDefinition={chosenScenario}
          inaugurationMetrics={activeInitial}
        />
      )}
    </main>
  );
};
