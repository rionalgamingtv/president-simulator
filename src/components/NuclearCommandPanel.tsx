import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Landmark,
  Radiation,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react';
import { MilitaryCommandState, NationalMetrics } from '../types/game';
import {
  FEATURED_US_STATE_NAMES,
  FOREIGN_NUCLEAR_TARGETS,
  NUCLEAR_STRIKE_PROFILES,
  NuclearStrikeProfileId,
  NuclearStrikeRecord,
  NuclearTargetCategory,
  US_STATES,
  previewCongressNuclearVote,
} from '../data/nuclearCommand';

interface NuclearCommandPanelProps {
  currentMonth: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  latestNuclearResult: NuclearStrikeRecord | null;
  nuclearStrikeHistory: NuclearStrikeRecord[];
  onDismissNuclearResult: () => void;
  onExecuteNuclearStrike: (params: {
    targetCategory: NuclearTargetCategory;
    targetName: string;
    profileId: NuclearStrikeProfileId;
    requireCongressApproval: boolean;
  }) => void;
}

export const NuclearCommandPanel: React.FC<NuclearCommandPanelProps> = ({
  metrics,
  military,
  latestNuclearResult,
  nuclearStrikeHistory,
  onDismissNuclearResult,
  onExecuteNuclearStrike,
}) => {
  const [targetCategory, setTargetCategory] =
    useState<NuclearTargetCategory>('country');
  const [selectedState, setSelectedState] = useState<string>('California');
  const [selectedCountry, setSelectedCountry] = useState<string>('North Korea');
  const [profileId, setProfileId] =
    useState<NuclearStrikeProfileId>('tactical');
  const [requireCongressApproval, setRequireCongressApproval] =
    useState<boolean>(true);
  const [confirmingLaunch, setConfirmingLaunch] = useState<boolean>(false);

  const activeTargetName =
    targetCategory === 'state'
      ? selectedState
      : selectedCountry.trim() || 'North Korea';

  const congressPreview = useMemo(
    () =>
      previewCongressNuclearVote({
        targetCategory,
        targetName: activeTargetName,
        profileId,
        metrics,
        military,
      }),
    [targetCategory, activeTargetName, profileId, metrics, military]
  );

  const struckTargets = useMemo(
    () =>
      nuclearStrikeHistory
        .filter((h) => h.executed)
        .map((h) => `${h.targetName} (M${h.month})`),
    [nuclearStrikeHistory]
  );

  const handleCategoryChange = (cat: NuclearTargetCategory) => {
    setTargetCategory(cat);
    setConfirmingLaunch(false);
  };

  const handleConfirmStrike = () => {
    onExecuteNuclearStrike({
      targetCategory,
      targetName: activeTargetName,
      profileId,
      requireCongressApproval,
    });
    setConfirmingLaunch(false);
  };

  return (
    <section
      id="strategic-nuclear-command"
      aria-label="Strategic Nuclear Command"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium text-red-700">
            USSTRATCOM · National Command Authority · DEFCON{' '}
            <span className="font-mono-num">{military.defconLevel}</span>
          </p>
          <h3 className="mt-0.5 flex items-center gap-2 font-display text-xl font-semibold text-stone-900">
            <Radiation className="h-5 w-5 text-red-700" aria-hidden="true" />
            <span>Strategic Nuclear Command &amp; Launch Authorization</span>
          </h3>
          <p className="mt-1 text-xs text-stone-600">
            Select a U.S. state or foreign country target and toggle whether
            Congressional approval is required before launch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono-num">
          <div>
            <span className="block text-stone-500 font-sans">
              Congressional Support
            </span>
            <span className="font-bold text-stone-900">
              {metrics.congressSupport.toFixed(1)}% ({metrics.senateSeats}S /{' '}
              {metrics.houseSeats}H)
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-sans">
              Strikes Executed
            </span>
            <span className="font-bold text-stone-900">
              {struckTargets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Latest Nuclear Strike / Blocked Vote Outcome */}
      {latestNuclearResult && (
        <div
          role="status"
          className={`rounded-xl border p-5 space-y-3 ${
            latestNuclearResult.executed
              ? 'border-red-300 bg-red-50/80'
              : 'border-amber-300 bg-amber-50/80'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              {latestNuclearResult.executed ? (
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-800"
                  aria-hidden="true"
                />
              )}
              <div className="space-y-1">
                <p
                  className={`text-xs font-semibold ${
                    latestNuclearResult.executed
                      ? 'text-red-800'
                      : 'text-amber-900'
                  }`}
                >
                  {latestNuclearResult.warPowersStatus} ·{' '}
                  {latestNuclearResult.profileLabel} · Target:{' '}
                  {latestNuclearResult.targetName}
                </p>
                <h4 className="font-display text-lg font-bold text-stone-900">
                  {latestNuclearResult.headline}
                </h4>
                <p className="text-xs leading-relaxed text-stone-800">
                  {latestNuclearResult.summary}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissNuclearResult}
              aria-label="Dismiss nuclear strike outcome"
              className="rounded-lg p-1 text-stone-500 hover:bg-white/80 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {latestNuclearResult.senateYea !== null &&
            latestNuclearResult.houseYea !== null && (
              <div className="flex flex-wrap gap-4 rounded-lg border border-stone-200 bg-white px-3.5 py-2 font-mono-num text-xs">
                <span>
                  Senate Vote:{' '}
                  <strong className="text-stone-900">
                    {latestNuclearResult.senateYea} Yea –{' '}
                    {latestNuclearResult.senateNay} Nay
                  </strong>
                </span>
                <span>
                  House Vote:{' '}
                  <strong className="text-stone-900">
                    {latestNuclearResult.houseYea} Yea –{' '}
                    {latestNuclearResult.houseNay} Nay
                  </strong>
                </span>
              </div>
            )}

          <div className="flex flex-wrap gap-3 font-mono-num text-xs text-stone-800">
            <span>
              Approval {latestNuclearResult.metricDeltas.approval.toFixed(1)}%
            </span>
            <span>·</span>
            <span>
              Congress{' '}
              {latestNuclearResult.metricDeltas.congressSupport.toFixed(1)}%
            </span>
            <span>·</span>
            <span>
              Diplomacy{' '}
              {latestNuclearResult.metricDeltas.diplomaticStanding.toFixed(1)}
            </span>
            <span>·</span>
            <span>
              GDP {latestNuclearResult.metricDeltas.gdpGrowth.toFixed(2)}%
            </span>
            <span>·</span>
            <span>
              Inflation +{latestNuclearResult.metricDeltas.inflation.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <div className="rounded-lg border border-stone-200 bg-white p-3 text-xs">
              <span className="block font-semibold text-stone-500">
                Majority Leadership
              </span>
              <p className="mt-0.5 text-stone-800">
                “{latestNuclearResult.majorityLeaderQuote}”
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3 text-xs">
              <span className="block font-semibold text-stone-500">
                Opposition Leadership
              </span>
              <p className="mt-0.5 text-stone-800">
                “{latestNuclearResult.oppositionLeaderQuote}”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Command Controls */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Target Scope & Selection */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-700">
              1. Select Target Scope (U.S. States or Other Countries)
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('country')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  targetCategory === 'country'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Other Countries
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('state')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  targetCategory === 'state'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                U.S. States
              </button>
            </div>
          </div>

          {targetCategory === 'country' ? (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {FOREIGN_NUCLEAR_TARGETS.slice(0, 12).map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      setConfirmingLaunch(false);
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCountry.toLowerCase() === country.toLowerCase()
                        ? 'border-red-700 bg-red-700 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nuke-country-select"
                    className="mb-1 block text-[11px] font-medium text-stone-500"
                  >
                    Quick Country Directory
                  </label>
                  <select
                    id="nuke-country-select"
                    value={
                      FOREIGN_NUCLEAR_TARGETS.includes(selectedCountry)
                        ? selectedCountry
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedCountry(e.target.value);
                        setConfirmingLaunch(false);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                  >
                    <option value="">Select a country...</option>
                    {FOREIGN_NUCLEAR_TARGETS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="nuke-country-custom"
                    className="mb-1 block text-[11px] font-medium text-stone-500"
                  >
                    Or Type Any Country / Territory
                  </label>
                  <input
                    id="nuke-country-custom"
                    type="text"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setConfirmingLaunch(false);
                    }}
                    placeholder="Enter any country..."
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap gap-1.5">
                {FEATURED_US_STATE_NAMES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setSelectedState(st);
                      setConfirmingLaunch(false);
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedState === st
                        ? 'border-red-700 bg-red-700 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div>
                <label
                  htmlFor="nuke-state-select"
                  className="mb-1 block text-[11px] font-medium text-stone-500"
                >
                  All 50 U.S. States &amp; District of Columbia
                </label>
                <select
                  id="nuke-state-select"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setConfirmingLaunch(false);
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                >
                  {US_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name} ({st.code}) · {st.region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Yield / Strike Profile */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-semibold text-stone-700">
              2. Select Warhead &amp; Delivery Profile
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {NUCLEAR_STRIKE_PROFILES.map((prof) => {
                const active = profileId === prof.id;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => {
                      setProfileId(prof.id);
                      setConfirmingLaunch(false);
                    }}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? 'border-red-700 bg-red-50/70 ring-1 ring-red-700'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-stone-900">
                        {prof.label}
                      </span>
                    </div>
                    <p className="mt-1 font-mono-num text-[11px] font-semibold text-red-800">
                      {prof.yieldLabel} · {prof.delivery}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-stone-600">
                      {prof.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Congressional Approval Checkbox (ON/OFF) & Launch Console */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4">
          <div className="space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <p className="text-xs font-medium text-stone-500">
                Target Locked
              </p>
              <h4 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                {activeTargetName}{' '}
                <span className="text-xs font-normal text-stone-500">
                  ({targetCategory === 'state' ? 'U.S. State' : 'Foreign Country'})
                </span>
              </h4>
            </div>

            {/* Congressional Approval Checkbox ON / OFF */}
            <label
              htmlFor="congressional-nuke-approval-checkbox"
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                requireCongressApproval
                  ? 'border-[#132238]/30 bg-white'
                  : 'border-red-300 bg-red-50/70'
              }`}
            >
              <input
                id="congressional-nuke-approval-checkbox"
                type="checkbox"
                checked={requireCongressApproval}
                onChange={(e) => {
                  setRequireCongressApproval(e.target.checked);
                  setConfirmingLaunch(false);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 accent-[#132238]"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-stone-900">
                    Congressional Approval for Nuclear Strike
                  </span>
                  <span
                    className={`font-mono-num font-bold ${
                      requireCongressApproval
                        ? 'text-emerald-800'
                        : 'text-red-700'
                    }`}
                  >
                    [{requireCongressApproval ? 'ON' : 'OFF'}]
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  {requireCongressApproval
                    ? 'ON: Congress must vote to authorize the strike before warheads launch. If rejected, the launch is blocked.'
                    : 'OFF: Bypass Congress and transmit unilateral Presidential launch codes immediately.'}
                </p>
              </div>
            </label>

            {/* Vote Forecast or Bypass Warning */}
            {requireCongressApproval ? (
              <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-[#132238]">
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Capitol Hill Authorization Forecast</span>
                </div>
                <div className="flex items-center justify-between font-mono-num text-stone-700">
                  <span>
                    Senate: <strong>{congressPreview.senateYea}</strong>–
                    {congressPreview.senateNay}
                  </span>
                  <span>
                    House: <strong>{congressPreview.houseYea}</strong>–
                    {congressPreview.houseNay}
                  </span>
                  <span
                    className={`font-bold ${
                      congressPreview.willPass
                        ? 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {congressPreview.willPass ? 'Likely Passes' : 'Likely Blocked'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {congressPreview.assessmentLabel}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-white p-3.5 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-red-700">
                  <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Unilateral Nuclear Authority (Congress Bypassed)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-700">
                  Launching without Congressional approval triggers immediate
                  War Powers confrontation, severe approval and market fallout,
                  and DEFCON 1 alert.
                </p>
              </div>
            )}

            {struckTargets.length > 0 && (
              <div className="text-[11px] text-stone-600">
                <span className="font-semibold text-stone-800">
                  Previous Targets Struck:
                </span>{' '}
                {struckTargets.join(', ')}
              </div>
            )}
          </div>

          {/* Launch Action / Inline Confirm */}
          <div className="pt-2">
            {!confirmingLaunch ? (
              <button
                type="button"
                onClick={() => setConfirmingLaunch(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-800"
              >
                <Radiation className="h-4 w-4" aria-hidden="true" />
                <span>
                  {requireCongressApproval
                    ? `Request Congress Vote & Launch on ${activeTargetName}`
                    : `Execute Unilateral Nuclear Strike on ${activeTargetName}`}
                </span>
              </button>
            ) : (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 space-y-2.5">
                <p className="text-xs font-semibold text-red-900">
                  Confirm National Command Order targeting{' '}
                  <strong>{activeTargetName}</strong> (Congressional Approval:{' '}
                  {requireCongressApproval ? 'ON' : 'OFF'})?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmStrike}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Confirm Launch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingLaunch(false)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                  >
                    Abort
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
