import React, { useMemo, useState } from 'react';
import { MapPin, Megaphone } from 'lucide-react';
import {
  BattlegroundStateProjection,
  NationalMetrics,
  PartyId,
  ReelectionCampaignState,
  VoterBlocs,
} from '../types/game';
import { computeElectoralForecast } from '../data/electoralMap';

interface ElectoralMapPanelProps {
  party: PartyId;
  currentMonth: number;
  metrics: NationalMetrics;
  blocs: VoterBlocs;
  campaign: ReelectionCampaignState;
  lastRegionalOutreachMonth: number | null;
  onDispatchRegionalOutreach: (state: BattlegroundStateProjection) => void;
}

export const ElectoralMapPanel: React.FC<ElectoralMapPanelProps> = ({
  party,
  currentMonth,
  metrics,
  blocs,
  campaign,
  lastRegionalOutreachMonth,
  onDispatchRegionalOutreach,
}) => {
  const forecast = useMemo(
    () => computeElectoralForecast(party, metrics, blocs, campaign),
    [party, metrics, blocs, campaign]
  );

  const [selectedCode, setSelectedCode] = useState<string>('PA');

  const selectedState =
    forecast.states.find((s) => s.code === selectedCode) || forecast.states[0];

  const outreachCooldown =
    lastRegionalOutreachMonth !== null &&
    currentMonth - lastRegionalOutreachMonth < 2;
  const nextOutreachMonth =
    lastRegionalOutreachMonth !== null
      ? lastRegionalOutreachMonth + 2
      : currentMonth;

  const incPct = Math.round((forecast.incumbentTotalEV / 538) * 100);
  const tossPct = Math.round((forecast.tossupEV / 538) * 100);
  const chalPct = Math.max(0, 100 - incPct - tossPct);

  return (
    <section
      aria-label="Battleground electoral college tracker"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium text-stone-500">
            538 Electoral Votes · 270 to Win
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
            Battleground States &amp; Electoral Map Forecast
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono-num text-xs">
          <div>
            <span className="text-stone-500">Incumbent Projected: </span>
            <strong className="text-base text-[#132238]">
              {forecast.incumbentTotalEV} EV
            </strong>
          </div>
          <span className="text-stone-300" aria-hidden="true">
            |
          </span>
          <div>
            <span className="text-stone-500">Toss-Up: </span>
            <strong className="text-base text-amber-800">
              {forecast.tossupEV} EV
            </strong>
          </div>
          <span className="text-stone-300" aria-hidden="true">
            |
          </span>
          <div>
            <span className="text-stone-500">Challenger: </span>
            <strong className="text-base text-red-700">
              {forecast.challengerTotalEV} EV
            </strong>
          </div>
        </div>
      </div>

      {/* 270-to-Win Meter */}
      <div className="space-y-1.5">
        <div className="relative h-3.5 w-full overflow-hidden rounded-md bg-stone-200 flex">
          <div
            className="h-full bg-[#132238] transition-all"
            style={{ width: `${incPct}%` }}
            title={`Incumbent ${forecast.incumbentTotalEV} EV`}
          />
          <div
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${tossPct}%` }}
            title={`Toss-Up ${forecast.tossupEV} EV`}
          />
          <div
            className="h-full bg-red-700 transition-all"
            style={{ width: `${chalPct}%` }}
            title={`Challenger ${forecast.challengerTotalEV} EV`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono-num text-stone-500">
          <span>Base States: {forecast.incumbentBaseEV} EV</span>
          <span className="font-semibold text-stone-700">
            270 EV Majority Line (50.2%)
          </span>
          <span>Opposition Base: {forecast.challengerBaseEV} EV</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Interactive 8-State Battleground Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {forecast.states.map((st) => {
            const selected = st.code === selectedState.code;
            const toneClass =
              st.margin >= 1.4
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                : st.margin <= -1.4
                ? 'border-red-200 bg-red-50/70 text-red-900'
                : 'border-amber-200 bg-amber-50/70 text-amber-950';

            return (
              <button
                key={st.code}
                type="button"
                onClick={() => setSelectedCode(st.code)}
                className={`rounded-xl border p-3 text-left transition-all ${toneClass} ${
                  selected ? 'ring-2 ring-[#132238] bg-white' : 'hover:bg-white'
                }`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-display text-lg font-bold">
                    {st.code}
                  </span>
                  <span className="font-mono-num text-[11px] font-semibold opacity-80">
                    {st.electoralVotes} EV
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-semibold truncate">
                  {st.name}
                </p>
                <p className="mt-1 font-mono-num text-xs font-bold">
                  {st.margin > 0 ? `+${st.margin.toFixed(1)}%` : `${st.margin.toFixed(1)}%`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected State Inspector & Regional Outreach Action */}
        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-stone-50 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <MapPin className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                <span>
                  {selectedState.name} ·{' '}
                  <span className="font-mono-num">
                    {selectedState.electoralVotes} EV
                  </span>
                </span>
              </div>
              <span className="text-xs font-bold text-[#132238]">
                {selectedState.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono-num text-2xl font-bold text-stone-900">
                {selectedState.margin > 0
                  ? `+${selectedState.margin.toFixed(1)}%`
                  : `${selectedState.margin.toFixed(1)}%`}
              </span>
              <span className="text-xs text-stone-600">
                Key Cohort: {selectedState.primaryBlocLabel}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-stone-700">
              {selectedState.headlineNote}
            </p>
          </div>

          <div className="border-t border-stone-200 pt-3 space-y-2">
            <button
              type="button"
              disabled={outreachCooldown}
              onClick={() => onDispatchRegionalOutreach(selectedState)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-45"
            >
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {outreachCooldown
                  ? `Next State Outreach Unlocks M${nextOutreachMonth}`
                  : `Dispatch ${selectedState.name} Outreach (+2 Key Bloc · +0.6% Approval)`}
              </span>
            </button>
            <p className="text-[11px] text-stone-500">
              Targets {selectedState.primaryBlocLabel.toLowerCase()} every 2
              months and generates regional press coverage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
