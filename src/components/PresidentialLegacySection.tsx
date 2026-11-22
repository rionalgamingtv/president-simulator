import React, { useMemo, useState } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Landmark,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  NationalMetrics,
  SavedCareerState,
  ScenarioDefinition,
} from '../types/game';

interface PresidentialLegacySectionProps {
  activeLibrary: SavedCareerState;
  scenarioInitialMetrics: NationalMetrics;
  scenarioDefinition?: ScenarioDefinition;
  inaugurationMetrics: NationalMetrics;
}

type LegacyCategoryFilter = 'all' | 'mandate' | 'economy' | 'capitol';
type ChartViewMode = 'indices' | 'macro';

interface MetricSpec {
  key: keyof NationalMetrics;
  label: string;
  shortLabel: string;
  category: Exclude<LegacyCategoryFilter, 'all'>;
  unit: string;
  prefix?: string;
  decimals: number;
  invertGood?: boolean;
  zeroThreshold: number;
  directionHint: string;
  minBound: number;
  maxBound: number;
}

const METRIC_SPECS: MetricSpec[] = [
  {
    key: 'approval',
    label: 'Public Approval Rating',
    shortLabel: 'Approval',
    category: 'mandate',
    unit: '%',
    decimals: 1,
    zeroThreshold: 0.05,
    directionHint: 'Higher reflects stronger public backing',
    minBound: 0,
    maxBound: 100,
  },
  {
    key: 'congressSupport',
    label: 'Congressional Support',
    shortLabel: 'Congress',
    category: 'mandate',
    unit: '%',
    decimals: 1,
    zeroThreshold: 0.05,
    directionHint: 'Higher improves legislative passage odds',
    minBound: 0,
    maxBound: 100,
  },
  {
    key: 'diplomaticStanding',
    label: 'Diplomatic Standing',
    shortLabel: 'Diplomacy',
    category: 'capitol',
    unit: ' / 100',
    decimals: 1,
    zeroThreshold: 0.05,
    directionHint: 'Higher reflects stronger allied credibility',
    minBound: 0,
    maxBound: 100,
  },
  {
    key: 'gdpGrowth',
    label: 'Annualized GDP Growth',
    shortLabel: 'GDP Growth',
    category: 'economy',
    unit: '%',
    decimals: 1,
    zeroThreshold: 0.05,
    directionHint: 'Higher indicates stronger economic expansion',
    minBound: -3,
    maxBound: 7,
  },
  {
    key: 'inflation',
    label: 'Consumer Inflation (CPI)',
    shortLabel: 'Inflation',
    category: 'economy',
    unit: '%',
    decimals: 1,
    invertGood: true,
    zeroThreshold: 0.05,
    directionHint: 'Lower is favorable for household purchasing power',
    minBound: 0,
    maxBound: 12,
  },
  {
    key: 'unemployment',
    label: 'Unemployment Rate',
    shortLabel: 'Unemployment',
    category: 'economy',
    unit: '%',
    decimals: 1,
    invertGood: true,
    zeroThreshold: 0.05,
    directionHint: 'Lower is favorable for labor market health',
    minBound: 2,
    maxBound: 12,
  },
  {
    key: 'nationalDebtTrillions',
    label: 'National Debt',
    shortLabel: 'National Debt',
    category: 'economy',
    unit: 'T',
    prefix: '$',
    decimals: 2,
    invertGood: true,
    zeroThreshold: 0.005,
    directionHint: 'Lower growth or reduction preserves fiscal headroom',
    minBound: 30,
    maxBound: 50,
  },
  {
    key: 'houseSeats',
    label: 'House Coalition Seats',
    shortLabel: 'House Seats',
    category: 'capitol',
    unit: ' / 435',
    decimals: 0,
    zeroThreshold: 0.5,
    directionHint: '218+ required for House majority control',
    minBound: 0,
    maxBound: 435,
  },
  {
    key: 'senateSeats',
    label: 'Senate Coalition Seats',
    shortLabel: 'Senate Seats',
    category: 'capitol',
    unit: ' / 100',
    decimals: 0,
    zeroThreshold: 0.5,
    directionHint: '50+ (with VP tie-breaker) needed for Senate control',
    minBound: 0,
    maxBound: 100,
  },
];

function formatMetricValue(val: number, spec: MetricSpec): string {
  const prefix = spec.prefix || '';
  return `${prefix}${val.toFixed(spec.decimals)}${spec.unit}`;
}

function formatMetricDelta(delta: number, spec: MetricSpec): string {
  if (Math.abs(delta) < spec.zeroThreshold) {
    return spec.decimals === 0 ? '0' : `0.${'0'.repeat(spec.decimals)}${spec.unit === ' / 100' || spec.unit === ' / 435' ? '' : spec.unit}`;
  }
  const sign = delta > 0 ? '+' : '-';
  const absFormatted = Math.abs(delta).toFixed(spec.decimals);
  const unitSuffix =
    spec.unit === ' / 100'
      ? ' pts'
      : spec.unit === ' / 435'
      ? ' seats'
      : spec.unit;
  const prefix = spec.prefix || '';
  return `${sign}${prefix}${absFormatted}${unitSuffix}`;
}

function clampPct(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export const PresidentialLegacySection: React.FC<
  PresidentialLegacySectionProps
> = ({
  activeLibrary,
  scenarioInitialMetrics,
  scenarioDefinition,
  inaugurationMetrics,
}) => {
  const [categoryFilter, setCategoryFilter] =
    useState<LegacyCategoryFilter>('all');
  const [chartMode, setChartMode] = useState<ChartViewMode>('indices');

  const finalMetrics = activeLibrary.metrics;
  const isFinalized = activeLibrary.phase === 'CAREER_END';

  const evaluatedRows = useMemo(() => {
    return METRIC_SPECS.map((spec) => {
      const baseline = scenarioInitialMetrics[spec.key];
      const current = finalMetrics[spec.key];
      const delta = current - baseline;
      const isSteady = Math.abs(delta) < spec.zeroThreshold;
      const isPositiveDelta = delta > 0;
      const improved = isSteady
        ? false
        : spec.invertGood
        ? !isPositiveDelta
        : isPositiveDelta;
      const declined = isSteady ? false : !improved;

      const status: 'improved' | 'declined' | 'steady' = isSteady
        ? 'steady'
        : improved
        ? 'improved'
        : 'declined';

      return {
        spec,
        baseline,
        current,
        delta,
        status,
        baselineFormatted: formatMetricValue(baseline, spec),
        currentFormatted: formatMetricValue(current, spec),
        deltaFormatted: formatMetricDelta(delta, spec),
        baselineBarPct: clampPct(baseline, spec.minBound, spec.maxBound),
        currentBarPct: clampPct(current, spec.minBound, spec.maxBound),
      };
    });
  }, [scenarioInitialMetrics, finalMetrics]);

  const summaryCounts = useMemo(() => {
    let improved = 0;
    let declined = 0;
    let steady = 0;
    for (const row of evaluatedRows) {
      if (row.status === 'improved') improved += 1;
      else if (row.status === 'declined') declined += 1;
      else steady += 1;
    }

    let legacyVerdict = 'Mixed & Contested Record';
    let legacyVerdictNote =
      'Delivered gains in targeted areas while confronting persistent headwinds elsewhere.';
    if (improved >= 7) {
      legacyVerdict = 'Transformative Stewardship';
      legacyVerdictNote =
        'Broad-based gains across governance, economic vitality, and institutional standing compared with starting scenario conditions.';
    } else if (improved >= 5 && declined <= 3) {
      legacyVerdict = 'Constructive Administration';
      legacyVerdictNote =
        'Left the majority of national indicators stronger than the baseline inherited on Inauguration Day.';
    } else if (declined >= 6) {
      legacyVerdict = 'Turbulent & Embattled Term';
      legacyVerdictNote =
        'Severe regressions relative to starting scenario benchmarks defined public and congressional memory.';
    }

    return {
      improved,
      declined,
      steady,
      legacyVerdict,
      legacyVerdictNote,
    };
  }, [evaluatedRows]);

  const filteredRows = useMemo(() => {
    if (categoryFilter === 'all') return evaluatedRows;
    return evaluatedRows.filter((r) => r.spec.category === categoryFilter);
  }, [evaluatedRows, categoryFilter]);

  const indicesChartData = useMemo(
    () => [
      {
        name: 'Approval',
        ScenarioStart: Number(scenarioInitialMetrics.approval.toFixed(1)),
        FinalStanding: Number(finalMetrics.approval.toFixed(1)),
      },
      {
        name: 'Congress',
        ScenarioStart: Number(
          scenarioInitialMetrics.congressSupport.toFixed(1)
        ),
        FinalStanding: Number(finalMetrics.congressSupport.toFixed(1)),
      },
      {
        name: 'Diplomacy',
        ScenarioStart: Number(
          scenarioInitialMetrics.diplomaticStanding.toFixed(1)
        ),
        FinalStanding: Number(finalMetrics.diplomaticStanding.toFixed(1)),
      },
      {
        name: 'House Share',
        ScenarioStart: Number(
          ((scenarioInitialMetrics.houseSeats / 435) * 100).toFixed(1)
        ),
        FinalStanding: Number(
          ((finalMetrics.houseSeats / 435) * 100).toFixed(1)
        ),
      },
      {
        name: 'Senate Share',
        ScenarioStart: Number(scenarioInitialMetrics.senateSeats.toFixed(1)),
        FinalStanding: Number(finalMetrics.senateSeats.toFixed(1)),
      },
    ],
    [scenarioInitialMetrics, finalMetrics]
  );

  const macroChartData = useMemo(
    () => [
      {
        name: 'GDP Growth %',
        ScenarioStart: Number(scenarioInitialMetrics.gdpGrowth.toFixed(1)),
        FinalStanding: Number(finalMetrics.gdpGrowth.toFixed(1)),
      },
      {
        name: 'Inflation %',
        ScenarioStart: Number(scenarioInitialMetrics.inflation.toFixed(1)),
        FinalStanding: Number(finalMetrics.inflation.toFixed(1)),
      },
      {
        name: 'Unemployment %',
        ScenarioStart: Number(scenarioInitialMetrics.unemployment.toFixed(1)),
        FinalStanding: Number(finalMetrics.unemployment.toFixed(1)),
      },
    ],
    [scenarioInitialMetrics, finalMetrics]
  );

  const hasInaugurationModifierDiff = useMemo(() => {
    if (!scenarioDefinition) return false;
    return METRIC_SPECS.some(
      (spec) =>
        Math.abs(
          inaugurationMetrics[spec.key] - scenarioDefinition.initialMetrics[spec.key]
        ) >= spec.zeroThreshold
    );
  }, [inaugurationMetrics, scenarioDefinition]);

  const approvalRow = evaluatedRows.find((r) => r.spec.key === 'approval')!;
  const gdpRow = evaluatedRows.find((r) => r.spec.key === 'gdpGrowth')!;
  const inflationRow = evaluatedRows.find((r) => r.spec.key === 'inflation')!;
  const houseDelta = finalMetrics.houseSeats - scenarioInitialMetrics.houseSeats;
  const senateDelta =
    finalMetrics.senateSeats - scenarioInitialMetrics.senateSeats;

  return (
    <div className="space-y-6">
      {/* Header & Legacy Scorecard Banner */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <Scale className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>
                Starting Scenario Benchmark ·{' '}
                {scenarioDefinition?.title || activeLibrary.scenarioTitle}
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Presidential Legacy
            </h2>
            <p className="mt-1 text-sm text-stone-600 max-w-3xl">
              Direct comparison of {activeLibrary.profile.name}&apos;s{' '}
              {isFinalized ? 'final' : 'current'} national standing against the
              opening{' '}
              <span className="font-semibold text-stone-800">
                {scenarioDefinition?.title || activeLibrary.scenarioTitle}
              </span>{' '}
              scenario benchmarks.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                isFinalized
                  ? 'border-[#132238]/20 bg-[#132238] text-white'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {isFinalized
                  ? 'Final Term Scorecard'
                  : `Interim Ledger · Month ${activeLibrary.currentMonth} of ${activeLibrary.profile.termLength}`}
              </span>
            </span>
            {activeLibrary.evaluation && (
              <span className="font-mono-num text-xs font-semibold text-stone-700">
                Historian Grade: {activeLibrary.evaluation.historicalGrade} ·{' '}
                {activeLibrary.evaluation.legacyTitle}
              </span>
            )}
          </div>
        </div>

        {/* 4 Summary Legacy Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Scenario Scorecard
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-num text-2xl font-bold text-[#132238]">
                {summaryCounts.improved} / {METRIC_SPECS.length}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Improved
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              {summaryCounts.declined} declined · {summaryCounts.steady} steady
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Public Approval Legacy
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-2xl font-bold text-stone-900">
                {approvalRow.currentFormatted}
              </span>
              <span
                className={`text-xs font-semibold ${
                  approvalRow.status === 'improved'
                    ? 'text-emerald-700'
                    : approvalRow.status === 'declined'
                    ? 'text-red-700'
                    : 'text-stone-500'
                }`}
              >
                {approvalRow.deltaFormatted}
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              Scenario Start: {approvalRow.baselineFormatted}
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Growth &amp; Price Stability
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-stone-900">
                GDP {gdpRow.currentFormatted}
              </span>
              <span
                className={`text-xs font-semibold ${
                  gdpRow.status === 'improved'
                    ? 'text-emerald-700'
                    : gdpRow.status === 'declined'
                    ? 'text-red-700'
                    : 'text-stone-500'
                }`}
              >
                ({gdpRow.deltaFormatted})
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              CPI {inflationRow.baselineFormatted} →{' '}
              {inflationRow.currentFormatted} ({inflationRow.deltaFormatted})
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1">
            <span className="block text-xs font-medium text-stone-500">
              Capitol Seat Shift
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span className="text-lg font-bold text-stone-900">
                {finalMetrics.houseSeats}H / {finalMetrics.senateSeats}S
              </span>
            </div>
            <p className="font-mono-num text-xs text-stone-600">
              House {houseDelta >= 0 ? '+' : ''}
              {houseDelta} · Senate {senateDelta >= 0 ? '+' : ''}
              {senateDelta} vs Start
            </p>
          </div>
        </div>

        {/* Verdict Assessment Strip */}
        <div className="rounded-lg border border-stone-200 bg-[#F7F6F2] p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#132238]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#132238]">
                {activeLibrary.evaluation
                  ? `${activeLibrary.evaluation.legacyTitle} (${activeLibrary.evaluation.historicalGrade})`
                  : summaryCounts.legacyVerdict}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-700">
              {activeLibrary.evaluation
                ? activeLibrary.evaluation.reelectionVerdict
                : summaryCounts.legacyVerdictNote}
            </p>
            {activeLibrary.collapseReason && (
              <p className="text-xs font-medium text-red-800">
                Term Conclusion Note: {activeLibrary.collapseReason}
              </p>
            )}
          </div>

          {scenarioDefinition && (
            <div className="shrink-0 text-xs text-stone-600 md:text-right">
              <span className="block font-semibold text-stone-800">
                {scenarioDefinition.eraLabel}
              </span>
              <span>{scenarioDefinition.subtitle}</span>
            </div>
          )}
        </div>
      </section>

      {/* Recharts Visual Baseline vs Final Comparison */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <BarChart3
                className="h-3.5 w-3.5 text-[#132238]"
                aria-hidden="true"
              />
              <span>Visual Benchmark Comparison</span>
            </div>
            <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
              Scenario Baseline vs. {isFinalized ? 'Final' : 'Current'}{' '}
              Standing
            </h3>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setChartMode('indices')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                chartMode === 'indices'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Governance &amp; Standing (0–100)
            </button>
            <button
              type="button"
              onClick={() => setChartMode('macro')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                chartMode === 'macro'
                  ? 'bg-white text-[#132238] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Macroeconomic Rates (%)
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartMode === 'indices' ? indicesChartData : macroChartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#44403C' }}
                axisLine={{ stroke: '#D6D3D1' }}
                tickLine={false}
              />
              <YAxis
                domain={chartMode === 'indices' ? [0, 100] : ['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#57534E' }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D6D3D1',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [
                  `${Number(value ?? 0).toFixed(1)}%`,
                  undefined,
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <Bar
                dataKey="ScenarioStart"
                name="Scenario Start (initialMetrics)"
                fill="#A8A29E"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="FinalStanding"
                name={isFinalized ? 'Final Metrics' : 'Current Metrics'}
                fill="#132238"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Full 9-Metric Comparison Ledger */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Complete 9-Indicator National Audit
            </p>
            <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
              Full Metric-by-Metric Legacy Ledger
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
            {(
              [
                { id: 'all', label: 'All Metrics (9)' },
                { id: 'mandate', label: 'Political Mandate' },
                { id: 'economy', label: 'Economy & Debt' },
                { id: 'capitol', label: 'Foreign & Capitol' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  categoryFilter === tab.id
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredRows.map((row) => {
            const deltaColor =
              row.status === 'improved'
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : row.status === 'declined'
                ? 'text-red-700 bg-red-50 border-red-200'
                : 'text-stone-600 bg-stone-100 border-stone-200';

            const barFill =
              row.status === 'improved'
                ? 'bg-emerald-600'
                : row.status === 'declined'
                ? 'bg-red-600'
                : 'bg-[#132238]';

            const StatusIcon =
              row.status === 'improved'
                ? TrendingUp
                : row.status === 'declined'
                ? TrendingDown
                : Minus;

            return (
              <article
                key={row.spec.key}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-5 space-y-0.5">
                    <h4 className="text-sm font-bold text-stone-900">
                      {row.spec.label}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {row.spec.directionHint}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="block text-[11px] font-medium text-stone-500">
                      Scenario Start
                    </span>
                    <span className="font-mono-num text-sm font-semibold text-stone-700">
                      {row.baselineFormatted}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <span className="block text-[11px] font-medium text-stone-500">
                      {isFinalized ? 'Final Standing' : 'Current Standing'}
                    </span>
                    <span className="font-mono-num text-base font-bold text-[#132238]">
                      {row.currentFormatted}
                    </span>
                  </div>

                  <div className="md:col-span-3 flex md:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono-num text-xs font-semibold ${deltaColor}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{row.deltaFormatted}</span>
                      <span className="font-sans font-medium opacity-80">
                        ·{' '}
                        {row.status === 'improved'
                          ? 'Improved'
                          : row.status === 'declined'
                          ? 'Declined'
                          : 'Steady'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Comparative Dual-Position Track */}
                <div className="space-y-1">
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barFill}`}
                      style={{ width: `${row.currentBarPct}%` }}
                    />
                    <div
                      title={`Scenario Start: ${row.baselineFormatted}`}
                      className="absolute top-0 bottom-0 w-0.5 bg-stone-900"
                      style={{
                        left: `calc(${row.baselineBarPct}% - 1px)`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono-num text-stone-500">
                    <span>
                      Marker line = Scenario initialMetrics (
                      {row.baselineFormatted})
                    </span>
                    <span>
                      {isFinalized ? 'Final' : 'Current'}:{' '}
                      {row.currentFormatted}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {hasInaugurationModifierDiff && scenarioDefinition && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-600">
            <span className="font-semibold text-stone-800">
              Benchmark Note:
            </span>{' '}
            Comparisons above measure against the unadjusted{' '}
            <span className="font-semibold">
              {scenarioDefinition.title}
            </span>{' '}
            scenario <code className="font-mono">initialMetrics</code> (
            {scenarioDefinition.initialMetrics.approval.toFixed(1)}% approval,{' '}
            {scenarioDefinition.initialMetrics.congressSupport.toFixed(1)}%
            Congress support). Your Inauguration Day starting numbers after
            candidate background, Vice President, and Cabinet modifiers were{' '}
            {inaugurationMetrics.approval.toFixed(1)}% approval and{' '}
            {inaugurationMetrics.congressSupport.toFixed(1)}% Congress support.
          </div>
        )}
      </section>
    </div>
  );
};
