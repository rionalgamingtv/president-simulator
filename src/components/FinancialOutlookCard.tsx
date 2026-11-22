import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  DiplomaticMission,
  InstitutionalState,
  NationalMetrics,
  TermHistoryEntry,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';

interface FinancialOutlookCardProps {
  currentMonth: number;
  startingYear?: number;
  metrics: NationalMetrics;
  institutions: InstitutionalState;
  history: TermHistoryEntry[];
  diplomaticMissions: DiplomaticMission[];
}

interface ForecastPoint {
  horizon: string;
  label: string;
  monthNumber: number;
  calendarLabel: string;
  inflation: number;
  gdpGrowth: number;
  inflationBand: number;
  gdpBand: number;
}

export const FinancialOutlookCard: React.FC<FinancialOutlookCardProps> = ({
  currentMonth,
  startingYear,
  metrics,
  institutions,
  history,
  diplomaticMissions,
}) => {
  const forecast = useMemo(() => {
    const recent = history.slice(-3);
    const avgInfDelta =
      recent.length > 0
        ? recent.reduce((acc, h) => acc + h.outcome.metricDeltas.inflation, 0) /
          recent.length
        : 0;
    const avgGdpDelta =
      recent.length > 0
        ? recent.reduce((acc, h) => acc + h.outcome.metricDeltas.gdpGrowth, 0) /
          recent.length
        : 0;

    // Fed policy pressure per month
    const fedInfPressure =
      institutions.fedStance === 'Hawkish'
        ? -0.14
        : institutions.fedStance === 'Accommodative'
        ? 0.08
        : institutions.fedFundsRate >= 5.25
        ? -0.07
        : institutions.fedFundsRate <= 2.75
        ? 0.05
        : -0.02;

    const fedGdpPressure =
      institutions.fedStance === 'Hawkish'
        ? -0.08
        : institutions.fedStance === 'Accommodative'
        ? 0.09
        : institutions.fedFundsRate >= 5.25
        ? -0.04
        : 0.02;

    // Expected monthly contribution from active GDP/Trade envoy missions
    const activeTradeMissions = diplomaticMissions.filter(
      (m) => m.status === 'In Progress' && m.focusMetric === 'gdpGrowth'
    );
    const tradeEnvoyMonthlyBoost = activeTradeMissions.reduce(
      (acc, m) => acc + (m.successProbability / 100) * 0.14,
      0
    );

    const points: ForecastPoint[] = [
      {
        horizon: 'Now',
        label: `M${currentMonth}`,
        monthNumber: currentMonth,
        calendarLabel: formatMonthCalendar(currentMonth, startingYear).shortDate,
        inflation: Number(metrics.inflation.toFixed(1)),
        gdpGrowth: Number(metrics.gdpGrowth.toFixed(1)),
        inflationBand: 0,
        gdpBand: 0,
      },
    ];

    let projInf = metrics.inflation;
    let projGdp = metrics.gdpGrowth;

    for (let step = 1; step <= 3; step += 1) {
      const momentumWeight = Math.pow(0.55, step);
      const overheatingInfFeedback = projGdp > 3.2 ? 0.05 : projGdp < 1.0 ? -0.04 : 0;
      const inflationGdpDrag = projInf > 4.5 ? -0.06 : projInf < 2.5 ? 0.03 : 0;

      const stepInfDelta =
        avgInfDelta * momentumWeight +
        fedInfPressure +
        overheatingInfFeedback;

      const stepGdpDelta =
        avgGdpDelta * momentumWeight +
        fedGdpPressure +
        inflationGdpDrag +
        (step <= 2 ? tradeEnvoyMonthlyBoost : tradeEnvoyMonthlyBoost * 0.6);

      projInf = Math.max(0.2, Math.min(15, projInf + stepInfDelta));
      projGdp = Math.max(-4.5, Math.min(8.5, projGdp + stepGdpDelta));

      const targetMonth = currentMonth + step;
      points.push({
        horizon: `+${step} Mo`,
        label: `M${targetMonth}`,
        monthNumber: targetMonth,
        calendarLabel: formatMonthCalendar(targetMonth, startingYear).shortDate,
        inflation: Number(projInf.toFixed(1)),
        gdpGrowth: Number(projGdp.toFixed(1)),
        inflationBand: Number((0.15 * step).toFixed(1)),
        gdpBand: Number((0.15 * step).toFixed(1)),
      });
    }

    const endPoint = points[3];
    const infNet = Number((endPoint.inflation - metrics.inflation).toFixed(1));
    const gdpNet = Number((endPoint.gdpGrowth - metrics.gdpGrowth).toFixed(1));

    let regime = 'Balanced Baseline';
    let regimeTone: 'good' | 'warn' | 'risk' = 'good';
    let guidance =
      'Macro fundamentals sit on a steady baseline. Targeted supply-side investments can lift growth without reigniting prices.';

    if (endPoint.inflation >= 4.5 && endPoint.gdpGrowth < 1.5) {
      regime = 'Stagflation Risk';
      regimeTone = 'risk';
      guidance =
        'Sticky inflation paired with sluggish growth signals stagflation pressure. Favor supply-chain relief, energy output, or tariff cuts over deficit-financed stimulus.';
    } else if (endPoint.inflation >= 4.2) {
      regime = 'Inflation Watch';
      regimeTone = 'warn';
      guidance =
        'CPI is projected to remain elevated over the next 90 days. Pair fiscal restraint or permitting reform with cost-lowering directives to avoid tighter Fed hikes.';
    } else if (endPoint.gdpGrowth < 1.2) {
      regime = 'Slowdown Watch';
      regimeTone = 'warn';
      guidance =
        'Growth is projected to cool below 1.2%. Consider pro-growth infrastructure, domestic credit support, or Trade Envoy compacts in the Situation Room.';
    } else if (endPoint.gdpGrowth >= 2.3 && endPoint.inflation <= 3.2) {
      regime = 'Non-Inflationary Expansion';
      regimeTone = 'good';
      guidance =
        'Projected soft landing with solid expansion and contained CPI. Good window for structural legislation or long-term debt stabilization.';
    }

    return {
      points,
      endPoint,
      infNet,
      gdpNet,
      regime,
      regimeTone,
      guidance,
      activeTradeCount: activeTradeMissions.length,
    };
  }, [
    currentMonth,
    startingYear,
    metrics.inflation,
    metrics.gdpGrowth,
    institutions.fedStance,
    institutions.fedFundsRate,
    history,
    diplomaticMissions,
  ]);

  const badgeClass =
    forecast.regimeTone === 'good'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : forecast.regimeTone === 'risk'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <section
      aria-label="Financial Outlook 3-month projection"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <LineChartIcon
              className="h-3.5 w-3.5 text-[#132238]"
              aria-hidden="true"
            />
            <span>CEA &amp; Treasury Memo · 3-Month Macro Forecast</span>
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold text-stone-900">
            Financial Outlook
          </h2>
        </div>

        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {forecast.regime}
        </span>
      </div>

      {/* 3-Month Headline Projection Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-600">
              Projected Inflation (3 Mo)
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono-num text-xs font-semibold ${
                forecast.infNet < -0.05
                  ? 'text-emerald-700'
                  : forecast.infNet > 0.05
                  ? 'text-red-700'
                  : 'text-stone-500'
              }`}
            >
              {forecast.infNet > 0.05 ? (
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
              ) : forecast.infNet < -0.05 ? (
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Minus className="h-3 w-3" aria-hidden="true" />
              )}
              {forecast.infNet > 0 ? '+' : ''}
              {forecast.infNet.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-bold text-[#132238]">
              {forecast.endPoint.inflation.toFixed(1)}%
            </span>
            <span className="text-xs text-stone-500">
              from {metrics.inflation.toFixed(1)}% now
            </span>
          </div>
          <p className="font-mono-num text-[11px] text-stone-500">
            Range:{' '}
            {Math.max(
              0,
              forecast.endPoint.inflation - forecast.endPoint.inflationBand
            ).toFixed(1)}
            % –{' '}
            {(
              forecast.endPoint.inflation + forecast.endPoint.inflationBand
            ).toFixed(1)}
            % ({forecast.endPoint.calendarLabel})
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-600">
              Projected GDP Growth (3 Mo)
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono-num text-xs font-semibold ${
                forecast.gdpNet > 0.05
                  ? 'text-emerald-700'
                  : forecast.gdpNet < -0.05
                  ? 'text-red-700'
                  : 'text-stone-500'
              }`}
            >
              {forecast.gdpNet > 0.05 ? (
                <TrendingUp className="h-3 w-3" aria-hidden="true" />
              ) : forecast.gdpNet < -0.05 ? (
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Minus className="h-3 w-3" aria-hidden="true" />
              )}
              {forecast.gdpNet > 0 ? '+' : ''}
              {forecast.gdpNet.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-bold text-[#132238]">
              {forecast.endPoint.gdpGrowth.toFixed(1)}%
            </span>
            <span className="text-xs text-stone-500">
              from {metrics.gdpGrowth.toFixed(1)}% now
            </span>
          </div>
          <p className="font-mono-num text-[11px] text-stone-500">
            Range:{' '}
            {(
              forecast.endPoint.gdpGrowth - forecast.endPoint.gdpBand
            ).toFixed(1)}
            % –{' '}
            {(
              forecast.endPoint.gdpGrowth + forecast.endPoint.gdpBand
            ).toFixed(1)}
            % ({forecast.endPoint.calendarLabel})
          </p>
        </div>
      </div>

      {/* 3-Month Recharts Trajectory */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecast.points}
            margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
            <XAxis
              dataKey="calendarLabel"
              tick={{ fontSize: 11, fill: '#57534E' }}
              axisLine={{ stroke: '#D6D3D1' }}
              tickLine={false}
            />
            <YAxis
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
              formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
            <Line
              type="monotone"
              dataKey="gdpGrowth"
              name="GDP Growth %"
              stroke="#132238"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#132238' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="inflation"
              name="Inflation (CPI) %"
              stroke="#B91C1C"
              strokeWidth={2.5}
              strokeDasharray="4 3"
              dot={{ r: 3.5, fill: '#B91C1C' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Month-by-Month Strip */}
      <div className="grid grid-cols-3 gap-2">
        {forecast.points.slice(1).map((pt) => (
          <div
            key={pt.horizon}
            className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-mono-num"
          >
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>{pt.horizon}</span>
              <span>{pt.calendarLabel}</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-semibold text-stone-900">
              <span>GDP {pt.gdpGrowth.toFixed(1)}%</span>
              <span className="text-red-800">CPI {pt.inflation.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Planning Guidance */}
      <div className="rounded-lg border border-stone-200 bg-[#F7F6F2] p-3.5 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#132238]">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Strategic Policy Planning Note</span>
          </span>
          <span className="font-mono-num text-[11px] text-stone-500">
            Fed: {institutions.fedStance} ({institutions.fedFundsRate.toFixed(2)}%)
            {forecast.activeTradeCount > 0
              ? ` · ${forecast.activeTradeCount} Trade Envoy${
                  forecast.activeTradeCount > 1 ? 's' : ''
                } Active`
              : ''}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-stone-700">
          {forecast.guidance}
        </p>
      </div>
    </section>
  );
};
