import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import {
  NationalMetrics,
  SavedCareerState,
  TermHistoryEntry,
} from '../types/game';
import { getPartyMeta } from '../data/scenarios';

interface NationalLedgerProps {
  careerState: SavedCareerState;
  metrics: NationalMetrics;
  initialMetrics: NationalMetrics;
  history: TermHistoryEntry[];
  onStartNewCareer: () => void;
}

function MiniTrendChart({
  title,
  unit,
  values,
  strokeColor,
}: {
  title: string;
  unit: string;
  values: { month: number; val: number }[];
  strokeColor: string;
}) {
  const width = 380;
  const height = 130;
  const padX = 28;
  const padY = 18;

  const vals = values.map((v) => v.val);
  const rawMin = Math.min(...vals);
  const rawMax = Math.max(...vals);
  const span = Math.max(2, rawMax - rawMin);
  const minV = rawMin - span * 0.15;
  const maxV = rawMax + span * 0.15;

  const points = values.map((v, i) => {
    const x =
      values.length === 1
        ? width / 2
        : padX + (i / (values.length - 1)) * (width - padX * 2);
    const y =
      height -
      padY -
      ((v.val - minV) / (maxV - minV || 1)) * (height - padY * 2);
    return { x, y, ...v };
  });

  const pathD = points
    .map(
      (p, idx) =>
        `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    )
    .join(' ');

  const latest = values[values.length - 1]?.val ?? 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        <span className="font-mono-num text-lg font-semibold text-stone-900">
          {latest.toFixed(1)}
          {unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 w-full overflow-visible"
        role="img"
        aria-label={`${title} trend chart`}
      >
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="#E7E5E4"
          strokeWidth="1"
        />
        <line
          x1={padX}
          y1={padY}
          x2={width - padX}
          y2={padY}
          stroke="#F5F5F4"
          strokeWidth="1"
        />
        {points.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={idx === points.length - 1 ? 4 : 2.5}
            fill={strokeColor}
          />
        ))}
        <text
          x={padX - 4}
          y={padY + 4}
          textAnchor="end"
          fontSize="10"
          fill="#78716C"
          className="font-mono-num"
        >
          {maxV.toFixed(1)}
        </text>
        <text
          x={padX - 4}
          y={height - padY}
          textAnchor="end"
          fontSize="10"
          fill="#78716C"
          className="font-mono-num"
        >
          {minV.toFixed(1)}
        </text>
      </svg>

      <div className="mt-1 flex justify-between text-[11px] text-stone-500 font-mono-num">
        <span>
          Start: {values[0]?.val.toFixed(1)}
          {unit}
        </span>
        <span>{values.length - 1} months elapsed</span>
      </div>
    </div>
  );
}

export const NationalLedger: React.FC<NationalLedgerProps> = ({
  careerState,
  metrics,
  initialMetrics,
  history,
  onStartNewCareer,
}) => {
  const buildSeries = (getter: (m: NationalMetrics) => number) => [
    { month: 0, val: getter(initialMetrics) },
    ...history.map((h) => ({ month: h.month, val: getter(h.metricsAfter) })),
  ];

  const housePct = (metrics.houseSeats / 435) * 100;
  const senatePct = (metrics.senateSeats / 100) * 100;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(careerState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-term-${careerState.profile.name
      .toLowerCase()
      .replace(/\s+/g, '-')}-month-${careerState.currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <p className="text-xs font-medium text-stone-500">
          Macroeconomic &amp; Fiscal Indicators
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
          National Ledger
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <MiniTrendChart
            title="Presidential Approval Rating"
            unit="%"
            values={buildSeries((m) => m.approval)}
            strokeColor="#132238"
          />
          <MiniTrendChart
            title="Annualized Real GDP Growth"
            unit="%"
            values={buildSeries((m) => m.gdpGrowth)}
            strokeColor="#0F766E"
          />
          <MiniTrendChart
            title="Headline Inflation (CPI)"
            unit="%"
            values={buildSeries((m) => m.inflation)}
            strokeColor="#B45309"
          />
          <MiniTrendChart
            title="Unemployment Rate"
            unit="%"
            values={buildSeries((m) => m.unemployment)}
            strokeColor="#B91C1C"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Capitol Hill Balance
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">
              Congressional Composition
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-stone-800">
                  House of Representatives (218 for majority)
                </span>
                <span className="font-mono-num font-semibold text-stone-900">
                  {metrics.houseSeats} / 435
                </span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-[#132238] transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, housePct))}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {(() => {
                  const partyMeta = getPartyMeta(
                    careerState.profile.party,
                    careerState.profile.coalition
                  );
                  const allyLabel =
                    partyMeta.id === 'independent'
                      ? 'Cross-aisle governing coalition'
                      : `${partyMeta.label} coalition`;
                  return metrics.houseSeats >= 218
                    ? `${allyLabel} holds House majority.`
                    : `Opposition controls the House floor against ${partyMeta.label} agenda.`;
                })()}
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-stone-800">
                  U.S. Senate (51 for majority)
                </span>
                <span className="font-mono-num font-semibold text-stone-900">
                  {metrics.senateSeats} / 100
                </span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-[#132238] transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, senatePct))}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {(() => {
                  const partyMeta = getPartyMeta(
                    careerState.profile.party,
                    careerState.profile.coalition
                  );
                  const allyLabel =
                    partyMeta.id === 'independent'
                      ? 'Cross-aisle coalition'
                      : `${partyMeta.label} caucus`;
                  return metrics.senateSeats >= 51
                    ? `${allyLabel} holds Senate majority.`
                    : metrics.senateSeats === 50
                    ? 'Chamber is evenly split at 50–50.'
                    : `Opposition holds the Senate majority.`;
                })()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Sovereign &amp; Global Posture
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">
              Debt &amp; Diplomatic Standing
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <span className="block text-xs text-stone-500">
                Gross National Debt
              </span>
              <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
                ${metrics.nationalDebtTrillions.toFixed(2)}T
              </span>
              <span className="mt-1 block text-xs text-stone-500 font-mono-num">
                Start: ${initialMetrics.nationalDebtTrillions.toFixed(2)}T
              </span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <span className="block text-xs text-stone-500">
                Diplomatic Standing
              </span>
              <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
                {metrics.diplomaticStanding.toFixed(0)} / 100
              </span>
              <span className="mt-1 block text-xs text-stone-500">
                {metrics.diplomaticStanding >= 65
                  ? 'High allied credibility'
                  : metrics.diplomaticStanding >= 45
                  ? 'Guarded international posture'
                  : 'Strained alliances'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Term Archive Section */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Official Presidential Record
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Term Archive
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export Record JSON</span>
            </button>

            <button
              type="button"
              onClick={onStartNewCareer}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>End &amp; Start New Term</span>
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="mt-6 text-sm text-stone-600">
            No completed months archived yet. Your enacted directives, public
            statements, and newspaper headlines will appear here chronologically.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {[...history].reverse().map((entry) => (
              <article
                key={entry.month}
                className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <span className="font-mono-num text-xs font-semibold text-stone-500">
                      Month {String(entry.month).padStart(2, '0')} ·{' '}
                      {entry.outcome.newspaperOutlet}
                    </span>
                    <h3 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                      {entry.outcome.newspaperHeadline}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono-num text-stone-700">
                    <span>
                      Approval: {entry.metricsAfter.approval.toFixed(1)}%
                    </span>
                    <span>GDP: {entry.metricsAfter.gdpGrowth.toFixed(1)}%</span>
                    <span>
                      CPI: {entry.metricsAfter.inflation.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-stone-500">
                      Executive Directive
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-800">
                      {entry.policyDirective}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-500">
                      Public Messaging
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-700">
                      {entry.publicMessaging || 'No formal statement issued.'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
