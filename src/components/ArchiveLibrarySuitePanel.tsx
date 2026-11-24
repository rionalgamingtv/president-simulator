import React, { useMemo, useState } from 'react';
import {
  Award,
  BookText,
  Download,
  GitCompare,
  History,
  Scale,
  Users,
} from 'lucide-react';
import {
  AdminSuiteState,
  LegislativeRecordItem,
  MilestoneItem,
  NationalMetrics,
  NewsHeadlineItem,
  PresidentProfile,
  TermHistoryEntry,
  VoterBlocs,
} from '../types/game';
import {
  buildAdministrationMarkdownDossier,
  HISTORICAL_BENCHMARKS,
} from '../data/expansionSuites';
import { formatMonthCalendar } from '../data/historicalPresidents';

interface PolicyArchiveSuiteProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  history: TermHistoryEntry[];
  records: LegislativeRecordItem[];
  initialMetrics: NationalMetrics;
  currentMetrics: NationalMetrics;
  newsFeed: NewsHeadlineItem[];
  adminSuite: AdminSuiteState;
}

export const PolicyArchiveSuitePanel: React.FC<PolicyArchiveSuiteProps> = ({
  profile,
  scenarioTitle,
  history,
  records,
  initialMetrics,
  currentMetrics,
  newsFeed,
  adminSuite,
}) => {
  const [monthA, setMonthA] = useState<number>(
    history.length > 0 ? history[0].month : 1
  );
  const [monthB, setMonthB] = useState<number>(
    history.length > 0 ? history[history.length - 1].month : 1
  );

  const entryA = history.find((h) => h.month === monthA) || history[0] || null;
  const entryB =
    history.find((h) => h.month === monthB) ||
    history[history.length - 1] ||
    null;

  const eoVsBillStats = useMemo(() => {
    let eos = 0;
    let bills = 0;
    let treaties = 0;
    let inst = 0;
    let firstHalfEnacted = 0;
    let firstHalfTotal = 0;
    let secondHalfEnacted = 0;
    let secondHalfTotal = 0;
    const midpoint = Math.ceil(profile.termLength / 2);

    for (const r of records) {
      if (r.recordType === 'Executive Order') eos += 1;
      else if (r.recordType === 'Legislation') bills += 1;
      else if (r.recordType === 'Treaty') treaties += 1;
      else inst += 1;

      if (r.month <= midpoint) {
        firstHalfTotal += 1;
        if (r.outcomeStatus === 'Enacted') firstHalfEnacted += 1;
      } else {
        secondHalfTotal += 1;
        if (r.outcomeStatus === 'Enacted') secondHalfEnacted += 1;
      }
    }

    const total = Math.max(1, records.length);
    return {
      eos,
      bills,
      treaties,
      inst,
      eoSharePct: Math.round((eos / total) * 100),
      firstHalfRate: firstHalfTotal
        ? Math.round((firstHalfEnacted / firstHalfTotal) * 100)
        : 0,
      secondHalfRate: secondHalfTotal
        ? Math.round((secondHalfEnacted / secondHalfTotal) * 100)
        : 0,
    };
  }, [records, profile.termLength]);

  const handleExportMarkdown = () => {
    const md = buildAdministrationMarkdownDossier({
      profile,
      scenarioTitle,
      metrics: currentMetrics,
      initialMetrics,
      history,
      records,
      headlines: newsFeed,
    });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-term-dossier-${profile.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Governing Instrument Ratio & Term-Half Comparison */}
        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <Scale className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Executive Order vs. Legislation Audit</span>
            </span>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap"
            >
              <Download className="h-3 w-3" aria-hidden="true" />
              <span>Export Dossier (.md)</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono-num">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="font-sans text-stone-500">Executive Orders</span>
              <p className="mt-0.5 text-lg font-bold text-stone-900">
                {eoVsBillStats.eos} ({eoVsBillStats.eoSharePct}%)
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <span className="font-sans text-stone-500">Bills &amp; Treaties</span>
              <p className="mt-0.5 text-lg font-bold text-stone-900">
                {eoVsBillStats.bills + eoVsBillStats.treaties}
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-mono-num">
            1st-Half Enactment: {eoVsBillStats.firstHalfRate}% · 2nd-Half
            Enactment: {eoVsBillStats.secondHalfRate}%
          </p>
        </div>

        {/* Side-by-Side Month Comparator */}
        <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700">
              <GitCompare className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Side-by-Side Month Comparison</span>
            </span>
            {history.length >= 2 && (
              <div className="flex items-center gap-2 text-xs">
                <select
                  aria-label="First comparison month"
                  value={entryA?.month ?? 1}
                  onChange={(e) => setMonthA(Number(e.target.value))}
                  className="rounded border border-stone-300 bg-white px-2 py-1 font-mono-num text-xs"
                >
                  {history.map((h) => (
                    <option key={h.month} value={h.month}>
                      {formatMonthCalendar(h.month, profile.startingYear).shortDate}
                    </option>
                  ))}
                </select>
                <span className="text-stone-400">vs.</span>
                <select
                  aria-label="Second comparison month"
                  value={entryB?.month ?? 1}
                  onChange={(e) => setMonthB(Number(e.target.value))}
                  className="rounded border border-stone-300 bg-white px-2 py-1 font-mono-num text-xs"
                >
                  {history.map((h) => (
                    <option key={h.month} value={h.month}>
                      {formatMonthCalendar(h.month, profile.startingYear).shortDate}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {entryA && entryB ? (
            <div className="grid grid-cols-3 gap-2 text-xs font-mono-num">
              <div className="font-sans font-semibold text-stone-500">
                Metric
              </div>
              <div className="font-semibold text-stone-800">
                {formatMonthCalendar(entryA.month, profile.startingYear).shortDate}
              </div>
              <div className="font-semibold text-stone-800">
                {formatMonthCalendar(entryB.month, profile.startingYear).shortDate}
              </div>

              {[
                {
                  label: 'Approval',
                  a: `${entryA.metricsAfter.approval.toFixed(1)}%`,
                  b: `${entryB.metricsAfter.approval.toFixed(1)}%`,
                },
                {
                  label: 'GDP Growth',
                  a: `${entryA.metricsAfter.gdpGrowth.toFixed(1)}%`,
                  b: `${entryB.metricsAfter.gdpGrowth.toFixed(1)}%`,
                },
                {
                  label: 'Inflation (CPI)',
                  a: `${entryA.metricsAfter.inflation.toFixed(1)}%`,
                  b: `${entryB.metricsAfter.inflation.toFixed(1)}%`,
                },
                {
                  label: 'National Debt',
                  a: `$${entryA.metricsAfter.nationalDebtTrillions.toFixed(2)}T`,
                  b: `$${entryB.metricsAfter.nationalDebtTrillions.toFixed(2)}T`,
                },
              ].map((row) => (
                <React.Fragment key={row.label}>
                  <div className="font-sans text-stone-600">{row.label}</div>
                  <div className="text-stone-900">{row.a}</div>
                  <div className="text-stone-900">{row.b}</div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              Complete at least 1 month to compare snapshots across your term.
            </p>
          )}
        </div>
      </section>

      {/* Executive Action & Crisis Log */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700">
            <History className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>
              Executive Actions &amp; Special Interventions Log (
              {adminSuite.actionLog.length})
            </span>
          </span>
        </div>
        {adminSuite.actionLog.length === 0 ? (
          <p className="text-xs text-stone-500">
            Pardons, proclamations, Camp David summits, town halls, sanctions,
            and spin room interventions will be logged here automatically.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {[...adminSuite.actionLog]
              .reverse()
              .slice(0, 8)
              .map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 space-y-1"
                >
                  <p className="text-[11px] font-mono-num text-stone-500">
                    M{String(log.month).padStart(2, '0')} · {log.category}
                  </p>
                  <p className="text-xs font-semibold text-stone-900">
                    {log.title}
                  </p>
                  <p className="text-[11px] text-stone-600">{log.summary}</p>
                  <p className="font-mono-num text-[11px] text-[#132238]">
                    {log.impactSummary}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface LibrarySuitePanelProps {
  profile: PresidentProfile;
  scenarioTitle: string;
  initialMetrics: NationalMetrics;
  currentMetrics: NationalMetrics;
  initialBlocs: VoterBlocs;
  currentBlocs: VoterBlocs;
  records: LegislativeRecordItem[];
  milestones: MilestoneItem[];
  history: TermHistoryEntry[];
}

export const LibrarySuitePanel: React.FC<LibrarySuitePanelProps> = ({
  profile,
  scenarioTitle,
  initialMetrics,
  currentMetrics,
  initialBlocs,
  currentBlocs,
  records,
  milestones,
  history,
}) => {
  const [showMemoir, setShowMemoir] = useState(false);

  const enactedRate = useMemo(() => {
    if (records.length === 0) return 0;
    const enacted = records.filter((r) => r.outcomeStatus === 'Enacted').length;
    return Math.round((enacted / records.length) * 100);
  }, [records]);

  const blocShiftRows = (
    [
      ['workingClass', 'Working Class'],
      ['suburbanModerates', 'Suburban Moderates'],
      ['techFinance', 'Tech & Finance'],
      ['seniors', 'Seniors'],
      ['youngVoters', 'Young Voters'],
    ] as Array<[keyof VoterBlocs, string]>
  ).map(([key, label]) => ({
    key,
    label,
    start: initialBlocs[key],
    now: currentBlocs[key],
    delta: currentBlocs[key] - initialBlocs[key],
  }));

  const topHeadline =
    history.length > 0
      ? history[history.length - 1].outcome.newspaperHeadline
      : `Inauguration under ${scenarioTitle}`;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Historical Peer Cohort Scorecard */}
        <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <Award className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Presidential Cohort &amp; Historical Benchmarks</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2 pr-3 font-semibold">Administration / Cohort</th>
                  <th className="py-2 px-2 font-semibold text-right">Approval</th>
                  <th className="py-2 px-2 font-semibold text-right">GDP</th>
                  <th className="py-2 px-2 font-semibold text-right">CPI</th>
                  <th className="py-2 pl-2 font-semibold text-right">Enacted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono-num">
                <tr className="bg-stone-50 font-semibold text-[#132238]">
                  <td className="py-2 pr-3 font-sans">
                    President {profile.name} (Current Term)
                  </td>
                  <td className="py-2 px-2 text-right">
                    {currentMetrics.approval.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-right">
                    {currentMetrics.gdpGrowth.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-right">
                    {currentMetrics.inflation.toFixed(1)}%
                  </td>
                  <td className="py-2 pl-2 text-right">{enactedRate}%</td>
                </tr>
                {HISTORICAL_BENCHMARKS.map((b) => (
                  <tr key={b.eraName} className="text-stone-700">
                    <td className="py-2 pr-3 font-sans">{b.eraName}</td>
                    <td className="py-2 px-2 text-right">
                      {b.avgApproval.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right">
                      {b.avgGdp.toFixed(1)}%
                    </td>
                    <td className="py-2 px-2 text-right">
                      {b.avgInflation.toFixed(1)}%
                    </td>
                    <td className="py-2 pl-2 text-right">
                      {b.enactmentRatePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voter Coalition Shift Matrix */}
        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3 text-xs font-semibold text-stone-700">
            <Users className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Voter Coalition Trajectory (Day 1 → Now)</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {blocShiftRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-0"
              >
                <span className="font-medium text-stone-800">{row.label}</span>
                <div className="font-mono-num">
                  <span className="text-stone-500">{row.start}%</span>
                  <span className="mx-1.5 text-stone-400">→</span>
                  <span className="font-semibold text-stone-900">{row.now}%</span>
                  <span
                    className={`ml-2 font-semibold ${
                      row.delta > 0
                        ? 'text-emerald-700'
                        : row.delta < 0
                        ? 'text-red-700'
                        : 'text-stone-500'
                    }`}
                  >
                    ({row.delta >= 0 ? '+' : ''}
                    {row.delta}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presidential Memoir & Farewell Address Outline */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <BookText className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>Presidential Memoir &amp; Farewell Address Outline</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMemoir((s) => !s)}
            className="rounded-lg border border-[#132238] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#132238] hover:bg-[#132238] hover:text-white"
          >
            {showMemoir ? 'Hide Memoir Draft' : 'Generate Memoir & Farewell Draft'}
          </button>
        </div>

        {showMemoir && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2.5 text-xs leading-relaxed text-stone-700">
            <h4 className="font-display text-base font-bold text-stone-900">
              “{profile.motto || 'Stewardship in Testing Times'}”: The{' '}
              {profile.name} Years
            </h4>
            <p>
              <strong>Chapter I — The Mandate:</strong> Entering office under{' '}
              <em>{scenarioTitle}</em> at{' '}
              <span className="font-mono-num">
                {initialMetrics.approval.toFixed(1)}%
              </span>{' '}
              approval, the administration confronted{' '}
              <span className="font-mono-num">
                {initialMetrics.inflation.toFixed(1)}%
              </span>{' '}
              inflation and immediate institutional tests.
            </p>
            <p>
              <strong>Chapter II — Governing Record:</strong> Across{' '}
              <span className="font-mono-num">{history.length}</span> simulated
              months, the White House logged{' '}
              <span className="font-mono-num">{records.length}</span> formal
              directives/legislation and{' '}
              <span className="font-mono-num">{milestones.length}</span>{' '}
              historical milestones, culminating in “{topHeadline}”.
            </p>
            <p>
              <strong>Farewell Closing Note:</strong> Today public approval
              stands at{' '}
              <span className="font-mono-num">
                {currentMetrics.approval.toFixed(1)}%
              </span>
              , GDP growth at{' '}
              <span className="font-mono-num">
                {currentMetrics.gdpGrowth.toFixed(1)}%
              </span>
              , and diplomatic standing at{' '}
              <span className="font-mono-num">
                {currentMetrics.diplomaticStanding.toFixed(0)}/100
              </span>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
