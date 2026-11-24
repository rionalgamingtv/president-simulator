import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  Compass,
  Globe,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  DiplomaticMission,
  MilitaryCommandState,
  MilitaryServiceBranch,
  MilitaryServiceMember,
  RegionalTheaterId,
  TheaterSecurityEventDefinition,
  TheaterSecurityEventOutcome,
  TheaterUnitAssignment,
  TheaterUnitPosture,
} from '../types/game';
import {
  computeTheaterInfluence,
  DEPLOYABLE_MILITARY_UNITS,
  getBranchShortLabel,
  REGIONAL_THEATERS,
  resolveCountryToTheater,
  THEATER_SECURITY_EVENTS,
} from '../data/regionalTheaters';

interface TheaterDeploymentMapProps {
  currentMonth: number;
  military: MilitaryCommandState;
  militaryRoster: MilitaryServiceMember[];
  diplomaticMissions: DiplomaticMission[];
  theaterAssignments: TheaterUnitAssignment[];
  resolvedTheaterEventMonths: Partial<Record<RegionalTheaterId, number>>;
  latestTheaterEventOutcome: TheaterSecurityEventOutcome | null;
  onDismissTheaterEventOutcome: () => void;
  onAssignUnitToTheater: (
    unitId: string,
    theaterId: RegionalTheaterId,
    posture: TheaterUnitPosture
  ) => void;
  onRecallUnitFromTheater: (unitId: string) => void;
  onUpdateTheaterUnitPosture: (
    unitId: string,
    posture: TheaterUnitPosture
  ) => void;
  onResolveTheaterSecurityEvent: (
    event: TheaterSecurityEventDefinition,
    probabilityUsedPct: number,
    unitBonusPct: number,
    assignedUnitNames: string[]
  ) => void;
}

const POSTURE_OPTIONS: {
  value: TheaterUnitPosture;
  hint: string;
}[] = [
  { value: 'Forward Presence', hint: '+Diplomacy focus' },
  { value: 'Deterrence Patrol', hint: 'Balanced posture' },
  { value: 'Rapid Contingency', hint: '+Security focus' },
];

const BRANCH_FILTERS: { id: 'all' | MilitaryServiceBranch; label: string }[] = [
  { id: 'all', label: 'All Branches' },
  { id: 'army', label: 'Army' },
  { id: 'marines', label: 'Marines' },
  { id: 'navy', label: 'Navy' },
  { id: 'coast_guard', label: 'Coast Guard' },
];

export const TheaterDeploymentMap: React.FC<TheaterDeploymentMapProps> = ({
  currentMonth,
  military,
  militaryRoster,
  diplomaticMissions,
  theaterAssignments,
  resolvedTheaterEventMonths,
  latestTheaterEventOutcome,
  onDismissTheaterEventOutcome,
  onAssignUnitToTheater,
  onRecallUnitFromTheater,
  onUpdateTheaterUnitPosture,
  onResolveTheaterSecurityEvent,
}) => {
  const [selectedTheaterId, setSelectedTheaterId] =
    useState<RegionalTheaterId>('indo_pacific');
  const [branchFilter, setBranchFilter] = useState<'all' | MilitaryServiceBranch>(
    'all'
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedPosture, setSelectedPosture] =
    useState<TheaterUnitPosture>('Forward Presence');

  const theaterSummaries = useMemo(() => {
    const record: Record<
      RegionalTheaterId,
      ReturnType<typeof computeTheaterInfluence>
    > = {
      americas: computeTheaterInfluence(
        'americas',
        theaterAssignments,
        militaryRoster,
        military
      ),
      europe: computeTheaterInfluence(
        'europe',
        theaterAssignments,
        militaryRoster,
        military
      ),
      middle_east: computeTheaterInfluence(
        'middle_east',
        theaterAssignments,
        militaryRoster,
        military
      ),
      indo_pacific: computeTheaterInfluence(
        'indo_pacific',
        theaterAssignments,
        militaryRoster,
        military
      ),
      africa_atlantic: computeTheaterInfluence(
        'africa_atlantic',
        theaterAssignments,
        militaryRoster,
        military
      ),
    };
    return record;
  }, [theaterAssignments, militaryRoster, military]);

  const activeMissionsByTheater = useMemo(() => {
    const counts: Record<RegionalTheaterId, number> = {
      americas: 0,
      europe: 0,
      middle_east: 0,
      indo_pacific: 0,
      africa_atlantic: 0,
    };
    for (const mission of diplomaticMissions) {
      if (mission.status !== 'In Progress') continue;
      const t = resolveCountryToTheater(mission.targetCountry);
      counts[t.id] += 1;
    }
    return counts;
  }, [diplomaticMissions]);

  const selectedInfluence = theaterSummaries[selectedTheaterId];
  const selectedTheater = selectedInfluence.theater;

  const assignedUnitIds = useMemo(
    () => new Set(theaterAssignments.map((a) => a.unitId)),
    [theaterAssignments]
  );

  const reserveUnits = useMemo(() => {
    return DEPLOYABLE_MILITARY_UNITS.filter(
      (u) =>
        !assignedUnitIds.has(u.id) &&
        (branchFilter === 'all' || u.branch === branchFilter)
    );
  }, [assignedUnitIds, branchFilter]);

  const effectiveUnitId =
    reserveUnits.find((u) => u.id === selectedUnitId)?.id ||
    reserveUnits[0]?.id ||
    '';

  const selectedReserveUnit = useMemo(
    () =>
      DEPLOYABLE_MILITARY_UNITS.find((u) => u.id === effectiveUnitId) || null,
    [effectiveUnitId]
  );

  const theaterEvents = useMemo(
    () =>
      THEATER_SECURITY_EVENTS.filter((e) => e.theaterId === selectedTheaterId),
    [selectedTheaterId]
  );

  const lastEventMonth = resolvedTheaterEventMonths[selectedTheaterId];
  const eventOnCooldown =
    typeof lastEventMonth === 'number' && currentMonth - lastEventMonth < 3;
  const nextEventMonth =
    typeof lastEventMonth === 'number' ? lastEventMonth + 3 : currentMonth;

  const isTheaterFull =
    selectedInfluence.unitCount >= selectedTheater.maxUnits;

  const totalDeployedCount = theaterAssignments.length;
  const totalReserveCount =
    DEPLOYABLE_MILITARY_UNITS.length - totalDeployedCount;

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReserveUnit || isTheaterFull) return;
    onAssignUnitToTheater(
      selectedReserveUnit.id,
      selectedTheaterId,
      selectedPosture
    );
  };

  return (
    <section
      aria-label="Global Combatant Command & Theater Deployment Map"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <Compass className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>
              Global Force Posture &amp; Regional Theater Assignments ·{' '}
              {REGIONAL_THEATERS.length} Combatant Commands
            </span>
          </div>
          <h3 className="mt-1 font-display text-2xl font-semibold text-stone-900">
            Theater Command Map &amp; Unit Deployment
          </h3>
          <p className="mt-1 text-sm text-stone-600 max-w-3xl">
            Assign named Army, Marine, Navy, and Coast Guard units to regional
            theaters on the map. Forward deployments boost{' '}
            <span className="font-semibold text-stone-800">
              Diplomatic Mission &amp; Summit odds
            </span>{' '}
            and strengthen{' '}
            <span className="font-semibold text-stone-800">
              Regional Security Flashpoints &amp; Situation Room operations
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono-num text-xs text-stone-700">
          <div>
            <span className="text-stone-500">Deployed: </span>
            <strong className="text-sm text-[#132238]">
              {totalDeployedCount} / {DEPLOYABLE_MILITARY_UNITS.length}
            </strong>
          </div>
          <span className="text-stone-300" aria-hidden="true">
            |
          </span>
          <div>
            <span className="text-stone-500">Strategic Reserve: </span>
            <strong className="text-sm text-stone-900">
              {totalReserveCount} Units
            </strong>
          </div>
          <span className="text-stone-300" aria-hidden="true">
            |
          </span>
          <div>
            <span className="text-stone-500">Readiness: </span>
            <strong className="text-sm text-stone-900">
              {military.forceReadiness}%
            </strong>
          </div>
        </div>
      </div>

      {/* Latest Regional Security Event Outcome Banner */}
      {latestTheaterEventOutcome && (
        <div
          className={`rounded-xl border p-4 space-y-2 ${
            latestTheaterEventOutcome.succeeded
              ? 'border-emerald-200 bg-emerald-50/80'
              : 'border-red-200 bg-red-50/80'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-stone-700">
                {latestTheaterEventOutcome.theaterName} ·{' '}
                {latestTheaterEventOutcome.succeeded
                  ? 'Security Operation Succeeded'
                  : 'Security Operation Contested'}{' '}
                · M{latestTheaterEventOutcome.month}
              </p>
              <h4 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                {latestTheaterEventOutcome.headline}
              </h4>
            </div>
            <button
              type="button"
              onClick={onDismissTheaterEventOutcome}
              aria-label="Dismiss theater security outcome"
              className="rounded-md p-1 text-stone-500 hover:bg-white hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-stone-700">
            {latestTheaterEventOutcome.summary}
          </p>
          <div className="flex flex-wrap items-center gap-3 font-mono-num text-[11px] font-semibold text-stone-800">
            <span>
              Success Odds Used: {latestTheaterEventOutcome.probabilityUsedPct}%
              (Units +{latestTheaterEventOutcome.unitBonusPct}%)
            </span>
            <span>·</span>
            <span>
              Diplomacy{' '}
              {latestTheaterEventOutcome.diplomaticDelta >= 0 ? '+' : ''}
              {latestTheaterEventOutcome.diplomaticDelta.toFixed(1)}
            </span>
            <span>·</span>
            <span>
              Approval{' '}
              {latestTheaterEventOutcome.approvalDelta >= 0 ? '+' : ''}
              {latestTheaterEventOutcome.approvalDelta.toFixed(1)}%
            </span>
            <span>·</span>
            <span>
              Readiness{' '}
              {latestTheaterEventOutcome.readinessDelta >= 0 ? '+' : ''}
              {latestTheaterEventOutcome.readinessDelta}%
            </span>
          </div>
        </div>
      )}

      {/* Map + Selected Theater Inspector Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Interactive Global Theater SVG Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-[#F3F6F9]">
            <svg
              viewBox="0 0 860 380"
              className="block h-auto w-full select-none"
              role="img"
              aria-label="Interactive global regional theater deployment map"
            >
              {/* Ocean Grid Lines */}
              <g stroke="#DCE4EC" strokeWidth="0.75" strokeDasharray="3 4">
                <line x1="0" y1="95" x2="860" y2="95" />
                <line x1="0" y1="190" x2="860" y2="190" />
                <line x1="0" y1="285" x2="860" y2="285" />
                <line x1="215" y1="0" x2="215" y2="380" />
                <line x1="430" y1="0" x2="430" y2="380" />
                <line x1="645" y1="0" x2="645" y2="380" />
              </g>

              {/* Stylized World Landmasses */}
              <g fill="#E5E1D6" stroke="#CEC8B9" strokeWidth="1.1">
                {/* North & Central America */}
                <path d="M 65 78 L 122 58 L 210 52 L 265 66 L 278 96 L 245 124 L 222 146 L 195 162 L 178 184 L 198 196 L 188 206 L 160 192 L 140 166 L 116 142 L 98 112 L 62 96 Z" />
                {/* Greenland */}
                <path d="M 278 24 L 336 22 L 348 48 L 315 68 L 284 54 Z" />
                {/* South America */}
                <path d="M 196 210 L 238 204 L 278 228 L 288 262 L 262 308 L 234 348 L 216 346 L 210 302 L 192 252 Z" />
                {/* Europe */}
                <path d="M 386 72 L 424 52 L 478 50 L 516 68 L 512 104 L 484 126 L 456 134 L 424 136 L 396 124 L 382 100 Z" />
                {/* UK & Ireland */}
                <path d="M 368 80 L 382 76 L 384 96 L 370 98 Z" />
                {/* Middle East / Arabian Peninsula */}
                <path d="M 482 140 L 536 136 L 568 158 L 564 196 L 534 214 L 496 202 L 480 170 Z" />
                {/* Africa */}
                <path d="M 378 154 L 444 148 L 478 168 L 488 204 L 466 254 L 442 316 L 414 318 L 396 266 L 372 222 L 362 182 Z" />
                {/* Eurasia / Asia */}
                <path d="M 518 58 L 625 46 L 732 54 L 792 78 L 774 114 L 742 134 L 716 170 L 686 204 L 642 212 L 608 228 L 578 198 L 560 156 L 520 132 Z" />
                {/* Japan & Philippines / Island Chain */}
                <path d="M 754 112 L 770 106 L 774 136 L 758 144 Z" />
                <path d="M 736 178 L 750 178 L 752 204 L 738 206 Z" />
                {/* Maritime SE Asia & Australia */}
                <path d="M 654 236 L 712 242 L 722 258 L 656 256 Z" />
                <path d="M 702 276 L 768 272 L 790 304 L 772 336 L 724 334 L 696 306 Z" />
              </g>

              {/* Regional Theater Sectors & Command Markers */}
              {REGIONAL_THEATERS.map((theater) => {
                const summary = theaterSummaries[theater.id];
                const isSelected = theater.id === selectedTheaterId;
                const envoyCount = activeMissionsByTheater[theater.id];
                const theaterLastEvt = resolvedTheaterEventMonths[theater.id];
                const flashpointReady =
                  typeof theaterLastEvt !== 'number' ||
                  currentMonth - theaterLastEvt >= 3;

                return (
                  <g
                    key={theater.id}
                    onClick={() => setSelectedTheaterId(theater.id)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${theater.name} theater`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTheaterId(theater.id);
                      }
                    }}
                  >
                    {/* Clickable Sector Box */}
                    <rect
                      x={theater.sectorBox.x}
                      y={theater.sectorBox.y}
                      width={theater.sectorBox.width}
                      height={theater.sectorBox.height}
                      rx={10}
                      fill={
                        isSelected
                          ? 'rgba(19, 34, 56, 0.11)'
                          : summary.unitCount > 0
                          ? 'rgba(19, 34, 56, 0.04)'
                          : 'rgba(120, 113, 108, 0.03)'
                      }
                      stroke={isSelected ? '#132238' : '#94A3B8'}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? undefined : '4 3'}
                    />

                    {/* Command Pin Ring */}
                    <circle
                      cx={theater.mapPin.x}
                      cy={theater.mapPin.y}
                      r={isSelected ? 17 : 14}
                      fill={isSelected ? '#132238' : '#FFFFFF'}
                      stroke="#132238"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text
                      x={theater.mapPin.x}
                      y={theater.mapPin.y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fill={isSelected ? '#FFFFFF' : '#132238'}
                    >
                      {summary.unitCount}/{theater.maxUnits}
                    </text>

                    {/* Active Envoy Indicator */}
                    {envoyCount > 0 && (
                      <g>
                        <circle
                          cx={theater.mapPin.x + 15}
                          cy={theater.mapPin.y - 12}
                          r={7}
                          fill="#D97706"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        <text
                          x={theater.mapPin.x + 15}
                          y={theater.mapPin.y - 9}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="#FFFFFF"
                        >
                          E{envoyCount}
                        </text>
                      </g>
                    )}

                    {/* Flashpoint Indicator */}
                    {flashpointReady && (
                      <circle
                        cx={theater.mapPin.x - 15}
                        cy={theater.mapPin.y - 12}
                        r={4.5}
                        fill="#B91C1C"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Command Label Card */}
                    <g>
                      <rect
                        x={theater.labelAnchor.x - 58}
                        y={theater.labelAnchor.y - 12}
                        width="116"
                        height="30"
                        rx="5"
                        fill={isSelected ? '#132238' : '#FFFFFF'}
                        stroke={isSelected ? '#132238' : '#CBD5E1'}
                        strokeWidth="1"
                      />
                      <text
                        x={theater.labelAnchor.x}
                        y={theater.labelAnchor.y}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill={isSelected ? '#FFFFFF' : '#1E293B'}
                      >
                        {theater.commandCode}
                      </text>
                      <text
                        x={theater.labelAnchor.x}
                        y={theater.labelAnchor.y + 12}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        fill={isSelected ? '#FCD34D' : '#475569'}
                      >
                        +{summary.diplomacyOddsBonusPct}% Dip · +
                        {summary.securityOddsBonusPct}% Sec
                      </text>
                    </g>

                    {/* Deployed Unit Short Codes directly under Pin */}
                    {summary.assignedUnits.length > 0 && (
                      <text
                        x={theater.mapPin.x}
                        y={theater.mapPin.y + 29}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                        fill="#132238"
                      >
                        {summary.assignedUnits
                          .map((d) => d.unit.shortCode)
                          .join(' · ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend & Quick Theater Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#132238]" />
                <span>Assigned Units / Max</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                <span>Active Envoy Missions (E#)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-700" />
                <span>Security Flashpoint Ready</span>
              </span>
            </div>
            <span className="font-mono-num text-stone-500">
              Click any theater on map to command
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {REGIONAL_THEATERS.map((t) => {
              const summary = theaterSummaries[t.id];
              const active = t.id === selectedTheaterId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTheaterId(t.id)}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    active
                      ? 'border-[#132238] bg-[#132238] text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400'
                  }`}
                >
                  <span className="block truncate text-[11px] font-bold">
                    {t.commandCode}
                  </span>
                  <span
                    className={`mt-0.5 block font-mono-num text-[10px] ${
                      active ? 'text-amber-300' : 'text-stone-600'
                    }`}
                  >
                    {summary.unitCount}/{t.maxUnits} · +
                    {summary.diplomacyOddsBonusPct}% Dip
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Theater Command Inspector */}
        <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
              <span className="font-mono-num font-semibold text-[#132238]">
                {selectedTheater.commandCode} · HQ {selectedTheater.hqLabel}
              </span>
              <span className="font-mono-num font-semibold text-stone-700">
                {selectedInfluence.unitCount} / {selectedTheater.maxUnits} Slots
              </span>
            </div>
            <h4 className="mt-1 font-display text-xl font-semibold text-stone-900">
              {selectedTheater.name}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              {selectedTheater.strategicSummary}
            </p>
            <p className="mt-1.5 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Key States: </span>
              {selectedTheater.countries.slice(0, 8).join(', ')}
            </p>
          </div>

          {/* Theater Effect Telemetry */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Diplomacy Odds
              </span>
              <span className="mt-1 block font-mono-num text-lg font-bold text-emerald-700">
                +{selectedInfluence.diplomacyOddsBonusPct}%
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Security Odds
              </span>
              <span className="mt-1 block font-mono-num text-lg font-bold text-[#132238]">
                {selectedInfluence.operationSuccessProbabilityPct}%
              </span>
              <span className="block font-mono-num text-[10px] text-stone-500">
                (+{selectedInfluence.securityOddsBonusPct}% units)
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                Posture
              </span>
              <span className="mt-1 block text-xs font-bold text-stone-900 leading-tight">
                {selectedInfluence.deterrenceLabel}
              </span>
              <span className="mt-0.5 block font-mono-num text-[10px] text-stone-500">
                {selectedInfluence.rosterSynergyCount} Roster Personnel
              </span>
            </div>
          </div>

          {/* Assigned Units in Selected Theater */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wide text-stone-700">
                Assigned Military Units ({selectedInfluence.unitCount}/
                {selectedTheater.maxUnits})
              </h5>
              {activeMissionsByTheater[selectedTheaterId] > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  <span>
                    {activeMissionsByTheater[selectedTheaterId]} Active Envoy(s)
                  </span>
                </span>
              )}
            </div>

            {selectedInfluence.assignedUnits.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 bg-white p-3.5 text-xs text-stone-600">
                No combat or maritime units assigned to this theater. Envoys
                and security responses rely solely on baseline national
                readiness until you deploy forces below.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedInfluence.assignedUnits.map(
                  ({
                    assignment,
                    unit,
                    rosterMatches,
                    isPreferredTheater,
                    diplomacyContribution,
                    securityContribution,
                  }) => (
                    <div
                      key={unit.id}
                      className="rounded-lg border border-stone-200 bg-white p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="font-mono-num font-bold text-[#132238]">
                              {getBranchShortLabel(unit.branch)} · {unit.shortCode}
                            </span>
                            {isPreferredTheater && (
                              <span className="font-semibold text-emerald-700">
                                · Optimal Theater Fit
                              </span>
                            )}
                            {rosterMatches.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 font-mono-num font-semibold text-stone-600">
                                <Users className="h-3 w-3" aria-hidden="true" />
                                {rosterMatches.length} Roster
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-stone-900">
                            {unit.name}
                          </p>
                          <p className="font-mono-num text-[11px] text-stone-600">
                            +{diplomacyContribution.toFixed(1)}% Diplomacy · +
                            {securityContribution.toFixed(1)}% Security · Deployed M
                            {assignment.assignedMonth}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRecallUnitFromTheater(unit.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          <span>Recall</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {POSTURE_OPTIONS.map((opt) => {
                          const active = assignment.posture === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                onUpdateTheaterUnitPosture(unit.id, opt.value)
                              }
                              className={`rounded border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                                active
                                  ? 'border-[#132238] bg-[#132238] text-white'
                                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                              }`}
                            >
                              {opt.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Assign Unit from Strategic Reserve */}
          <form
            onSubmit={handleAssignSubmit}
            className="rounded-lg border border-stone-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <h5 className="text-xs font-bold uppercase tracking-wide text-stone-800">
                Assign Unit to {selectedTheater.commandCode}
              </h5>
              <Anchor className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {BRANCH_FILTERS.map((bf) => (
                <button
                  key={bf.id}
                  type="button"
                  onClick={() => setBranchFilter(bf.id)}
                  className={`rounded border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    branchFilter === bf.id
                      ? 'border-[#132238] bg-[#132238] text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {bf.label}
                </button>
              ))}
            </div>

            {reserveUnits.length === 0 ? (
              <p className="text-xs text-stone-600">
                No unassigned reserve units match this branch filter. Recall a
                deployed unit or switch branches.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <label
                    htmlFor="theater-unit-select"
                    className="block text-[11px] font-semibold text-stone-700"
                  >
                    Reserve Force
                  </label>
                  <select
                    id="theater-unit-select"
                    value={effectiveUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                  >
                    {reserveUnits.map((unit) => {
                      const optimal =
                        unit.preferredTheaters.includes(selectedTheaterId);
                      return (
                        <option key={unit.id} value={unit.id}>
                          [{getBranchShortLabel(unit.branch)}] {unit.name}{' '}
                          {optimal ? '★ Optimal Fit' : ''} (+
                          {unit.diplomacyBonusPct}% Dip / +{unit.securityBonusPct}
                          % Sec)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedReserveUnit && (
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    <strong className="text-stone-800">
                      {selectedReserveUnit.unitType}:
                    </strong>{' '}
                    {selectedReserveUnit.specialtyNote}
                  </p>
                )}

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-stone-700">
                    Deployment Posture
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {POSTURE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedPosture(opt.value)}
                        className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                          selectedPosture === opt.value
                            ? 'border-[#132238] bg-[#132238] text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <span className="block text-[10px] font-bold">
                          {opt.value}
                        </span>
                        <span className="block text-[9px] opacity-80">
                          {opt.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isTheaterFull || !selectedReserveUnit}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#132238] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                >
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isTheaterFull
                      ? `Theater Capacity Reached (${selectedTheater.maxUnits}/${selectedTheater.maxUnits})`
                      : `Deploy ${selectedReserveUnit?.shortCode || 'Unit'} to ${selectedTheater.commandCode}`}
                  </span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Regional Security Flashpoints Panel */}
      <div className="border-t border-stone-200 pt-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-stone-500">
              {selectedTheater.name} · Regional Contingency Operations
            </p>
            <h4 className="font-display text-lg font-semibold text-stone-900">
              Regional Security Flashpoints ({selectedTheater.commandCode})
            </h4>
          </div>
          <span className="font-mono-num text-xs font-semibold text-stone-700">
            {eventOnCooldown
              ? `Next Regional Security Operation Unlocks M${nextEventMonth}`
              : 'Flashpoint Response Ready (3-Month Cadence per Theater)'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {theaterEvents.map((evt) => {
            const matchingBranchUnits = selectedInfluence.assignedUnits.filter(
              (d) => evt.recommendedBranches.includes(d.unit.branch)
            ).length;
            const branchFitBonus = Math.min(8, matchingBranchUnits * 4);
            const readinessOffset = Math.round(
              (military.forceReadiness - 80) * 0.15
            );
            const unitBonusPct =
              selectedInfluence.securityOddsBonusPct + branchFitBonus;
            const successOddsPct = Math.max(
              25,
              Math.min(
                95,
                evt.baseSuccessPct + unitBonusPct + readinessOffset
              )
            );
            const assignedNames = selectedInfluence.assignedUnits.map(
              (d) => d.unit.name
            );

            return (
              <article
                key={evt.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{evt.category}</span>
                    </span>
                    <span className="font-mono-num font-bold text-[#132238]">
                      {successOddsPct}% Success Odds
                    </span>
                  </div>

                  <h5 className="font-display text-base font-bold text-stone-900">
                    {evt.title}
                  </h5>
                  <p className="text-xs leading-relaxed text-stone-700">
                    {evt.threatSummary}
                  </p>

                  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] space-y-1 font-mono-num">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-stone-700">
                      <span>Base Odds: {evt.baseSuccessPct}%</span>
                      <span className="font-bold text-emerald-700">
                        Theater Units: +{unitBonusPct}%
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-stone-500">
                      Recommended:{' '}
                      {evt.recommendedBranches
                        .map((b) => getBranchShortLabel(b))
                        .join(' / ')}
                      {matchingBranchUnits > 0
                        ? ` (+${branchFitBonus}% branch match active)`
                        : ' (deploy matching branch for +4% each)'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-3">
                  <span className="font-mono-num text-[11px] text-stone-600">
                    Win: +{evt.successRewards.diplomaticDelta} Dip, +
                    {evt.successRewards.approvalDelta}% App
                  </span>
                  <button
                    type="button"
                    disabled={eventOnCooldown}
                    onClick={() =>
                      onResolveTheaterSecurityEvent(
                        evt,
                        successOddsPct,
                        unitBonusPct,
                        assignedNames
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                  >
                    {successOddsPct >= 70 ? (
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : eventOnCooldown ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      {eventOnCooldown
                        ? `On Cooldown (M${nextEventMonth})`
                        : 'Deploy Response'}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
