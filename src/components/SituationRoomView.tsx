import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Landmark,
  Scale,
  ArrowRight,
  Plane,
  Lock,
  Swords,
  Handshake,
  Loader2,
  X,
  Building2,
  Newspaper,
  Users,
  AlertTriangle,
  CheckCircle2,
  Search,
  UserX,
  Globe,
  Send,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  CabinetMember,
  ClassifiedIntelBrief,
  DiplomaticMission,
  DiplomaticMissionFocus,
  DiplomaticSummitOutcome,
  DiplomaticSummitPower,
  FedConsultOption,
  InstitutionalState,
  JudicialNominationOption,
  MilitaryCommandState,
  NationalMetrics,
  OfficialDismissalResult,
  SituationRoomResult,
  SituationScenarioType,
} from '../types/game';
import { JOINT_CHIEFS_CANDIDATES } from '../data/appointees';
import {
  FED_CONSULT_OPTIONS,
  JUDICIAL_NOMINATION_OPTIONS,
} from '../data/institutionalActions';
import { SUMMIT_FOREIGN_POWERS } from '../data/diplomaticSummit';
import { DiplomaticSummitModal } from './DiplomaticSummitModal';

interface SituationRoomViewProps {
  currentMonth: number;
  military: MilitaryCommandState;
  institutions: InstitutionalState;
  metrics: NationalMetrics;
  cabinet: CabinetMember[];
  diplomaticMissions: DiplomaticMission[];
  isResolvingScenario: boolean;
  isFiringOfficial: boolean;
  latestResult: SituationRoomResult | null;
  latestDismissalResult: OfficialDismissalResult | null;
  errorMsg: string | null;
  onDismissResult: () => void;
  onDismissDismissalResult: () => void;
  onExecuteScenario: (params: {
    scenarioType: SituationScenarioType;
    targetCountry: string;
    orderSummary: string;
    seekCongressAuthorization: boolean;
  }) => void;
  onChangeJointChiefsChair: (chair: {
    name: string;
    branch: string;
    doctrine: string;
  }) => void;
  onFireJointChiefsChair: (reason: string) => Promise<void>;
  onQueueSecurityOrder: (orderText: string, speechText: string) => void;
  onDispatchDiplomaticMission: (params: {
    targetCountry: string;
    envoyName: string;
    envoyTitle: string;
    missionTitle: string;
    focusMetric: DiplomaticMissionFocus;
    durationTurns: number;
    successProbability: number;
  }) => void;
  onRecallDiplomaticMission: (missionId: string) => void;
  onClearResolvedMissions: () => void;
  lastFedConsultMonth: number | null;
  lastJudicialNomMonth: number | null;
  onConsultFed: (option: FedConsultOption) => void;
  onNominateJudges: (option: JudicialNominationOption) => void;
  isLoadingIntelBrief: boolean;
  latestIntelBrief: ClassifiedIntelBrief | null;
  lastIntelBriefMonth: number | null;
  onRunIntelBrief: () => Promise<void>;
  lastSummitMonth: number | null;
  latestSummitOutcome: DiplomaticSummitOutcome | null;
  onDismissSummitOutcome: () => void;
  onCompleteDiplomaticSummit: (outcome: DiplomaticSummitOutcome) => void;
}

const DEFCON_LABELS: Record<number, string> = {
  5: 'DEFCON 5 · Normal Peacetime Readiness',
  4: 'DEFCON 4 · Increased Intelligence Watch',
  3: 'DEFCON 3 · Force Mobilization Ready',
  2: 'DEFCON 2 · Armed Forces Deployed',
  1: 'DEFCON 1 · Maximum Strategic Alert',
};

const TARGET_COUNTRIES = [
  'Iran',
  'Russia',
  'China',
  'North Korea',
  'Venezuela',
  'Taiwan Strait',
  'Eastern Europe',
  'Red Sea / Yemen',
];

const ENVOY_COUNTRIES = [
  'United Kingdom',
  'Germany',
  'Japan',
  'South Korea',
  'India',
  'Brazil',
  'Saudi Arabia',
  'Mexico',
  'Ukraine',
  'China',
  'Taiwan',
  'Vietnam',
];

const PRESIDENTIAL_ENVOYS: {
  id: string;
  name: string;
  title: string;
  specialty: DiplomaticMissionFocus;
  specialtyLabel: string;
  bonusOdds: number;
}[] = [
  {
    id: 'envoy-castellano',
    name: 'Amb. Victoria Castellano',
    title: 'Special Envoy for Trade & Supply Chains',
    specialty: 'gdpGrowth',
    specialtyLabel: 'Trade & GDP +7% odds',
    bonusOdds: 7,
  },
  {
    id: 'envoy-vance',
    name: 'Gen. (Ret.) Marcus Vance',
    title: 'Special Envoy for Security & Détente',
    specialty: 'diplomaticStanding',
    specialtyLabel: 'Diplomacy +7% odds',
    bonusOdds: 7,
  },
  {
    id: 'envoy-ramanathan',
    name: 'Dr. Priya Ramanathan',
    title: 'Envoy for Technology & Critical Minerals',
    specialty: 'gdpGrowth',
    specialtyLabel: 'Tech Commerce +6% odds',
    bonusOdds: 6,
  },
  {
    id: 'envoy-albright',
    name: 'Amb. Thomas Albright',
    title: 'Special Multilateral & Treaty Envoy',
    specialty: 'diplomaticStanding',
    specialtyLabel: 'Allied Treaties +6% odds',
    bonusOdds: 6,
  },
];

const SCENARIO_TEMPLATES: {
  type: SituationScenarioType;
  shortLabel: string;
  tone: 'war' | 'peace' | 'tactical';
  defaultSeekCongress: boolean;
  buildOrder: (country: string) => string;
}[] = [
  {
    type: 'Start War / Request AUMF',
    shortLabel: 'Start War / AUMF',
    tone: 'war',
    defaultSeekCongress: true,
    buildOrder: (country) =>
      `Authorize full-scale joint combat operations against strategic military targets in ${country}, mobilize forward carrier and air wings, and submit an Authorization for Use of Military Force (AUMF) to Congress.`,
  },
  {
    type: 'End War / Peace Treaty',
    shortLabel: 'End War / Peace',
    tone: 'peace',
    defaultSeekCongress: true,
    buildOrder: (country) =>
      `Declare a cessation of hostilities in ${country}, initiate a phased withdrawal of U.S. combat forces, and submit a formal peace and security settlement to the Senate.`,
  },
  {
    type: 'Targeted Strikes & No-Fly Zone',
    shortLabel: 'Strikes & No-Fly Zone',
    tone: 'war',
    defaultSeekCongress: false,
    buildOrder: (country) =>
      `Order precision air and cruise missile strikes on missile batteries and command nodes in ${country} while establishing an allied no-fly enforcement corridor.`,
  },
  {
    type: 'Naval Blockade & Sanctions',
    shortLabel: 'Blockade & Sanctions',
    tone: 'tactical',
    defaultSeekCongress: true,
    buildOrder: (country) =>
      `Impose a maritime quarantine and naval interdiction around ${country}'s energy ports paired with emergency secondary financial sanctions.`,
  },
  {
    type: 'Covert & Cyber Operation',
    shortLabel: 'Covert & Cyber Ops',
    tone: 'tactical',
    defaultSeekCongress: false,
    buildOrder: (country) =>
      `Authorize U.S. Cyber Command and special operations forces to disable military communications, drone logistics, and air-defense radar networks inside ${country}.`,
  },
  {
    type: 'Allied Deterrence Surge',
    shortLabel: 'Allied Deterrence',
    tone: 'tactical',
    defaultSeekCongress: false,
    buildOrder: (country) =>
      `Deploy forward armored brigades, Patriot air-defense batteries, and joint allied patrols to deter aggression from ${country} without initiating combat.`,
  },
  {
    type: 'Custom Crisis Scenario',
    shortLabel: 'Custom Scenario',
    tone: 'tactical',
    defaultSeekCongress: true,
    buildOrder: (country) =>
      `Convene emergency NSC action regarding ${country}: outline exact military, diplomatic, or peace terms below.`,
  },
];

function formatDeltaBadge(label: string, val: number, suffix = '') {
  const num = Number(val || 0);
  if (Math.abs(num) < 0.01) return null;
  const positiveGood =
    label === 'Approval' ||
    label === 'Congress' ||
    label === 'Diplomacy' ||
    label === 'GDP';
  const isGood = positiveGood ? num > 0 : num < 0;
  return (
    <span
      key={label}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono-num text-[11px] font-semibold ${
        isGood
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {label} {num > 0 ? `+${num}` : num}
      {suffix}
    </span>
  );
}

export const SituationRoomView: React.FC<SituationRoomViewProps> = ({
  currentMonth,
  military,
  institutions,
  metrics,
  cabinet,
  diplomaticMissions,
  isResolvingScenario,
  isFiringOfficial,
  latestResult,
  latestDismissalResult,
  errorMsg,
  onDismissResult,
  onDismissDismissalResult,
  onExecuteScenario,
  onChangeJointChiefsChair,
  onFireJointChiefsChair,
  onQueueSecurityOrder,
  onDispatchDiplomaticMission,
  onRecallDiplomaticMission,
  onClearResolvedMissions,
  lastFedConsultMonth,
  lastJudicialNomMonth,
  onConsultFed,
  onNominateJudges,
  isLoadingIntelBrief,
  latestIntelBrief,
  lastIntelBriefMonth,
  onRunIntelBrief,
  lastSummitMonth,
  latestSummitOutcome,
  onDismissSummitOutcome,
  onCompleteDiplomaticSummit,
}) => {
  const [scenarioType, setScenarioType] = useState<SituationScenarioType>(
    'Start War / Request AUMF'
  );
  const [targetCountry, setTargetCountry] = useState('Iran');
  const [seekCongressAuthorization, setSeekCongressAuthorization] =
    useState(true);
  const [scenarioOrder, setScenarioOrder] = useState(() =>
    SCENARIO_TEMPLATES[0].buildOrder('Iran')
  );
  const [showReassignJcs, setShowReassignJcs] = useState(false);
  const [jcsSearch, setJcsSearch] = useState('');
  const [showFireJcsModal, setShowFireJcsModal] = useState(false);
  const [fireJcsReason, setFireJcsReason] = useState(
    'Disagreement over military doctrine, strategic posture, and command responsiveness.'
  );
  const [showFedOptions, setShowFedOptions] = useState(false);
  const [showJudicialOptions, setShowJudicialOptions] = useState(false);
  const [activeSummitPower, setActiveSummitPower] =
    useState<DiplomaticSummitPower | null>(null);

  // Diplomatic Missions builder state
  const [envoyCountry, setEnvoyCountry] = useState('Japan');
  const [selectedEnvoyId, setSelectedEnvoyId] = useState(
    PRESIDENTIAL_ENVOYS[0].id
  );
  const [missionFocus, setMissionFocus] =
    useState<DiplomaticMissionFocus>('diplomaticStanding');
  const [missionDuration, setMissionDuration] = useState<number>(4);
  const [customMissionTitle, setCustomMissionTitle] = useState('');

  const isJcsInterim = military.jointChiefsChair.name
    .toLowerCase()
    .startsWith('acting ');

  const defenseSec = cabinet.find((c) => c.id === 'defense');
  const stateSec = cabinet.find((c) => c.id === 'state');
  const nsaSec = cabinet.find((c) => c.id === 'nsa');

  const defconColor =
    military.defconLevel <= 2
      ? 'text-red-700'
      : military.defconLevel === 3
      ? 'text-amber-700'
      : 'text-[#132238]';

  const handleSelectScenarioType = (nextType: SituationScenarioType) => {
    setScenarioType(nextType);
    const tpl = SCENARIO_TEMPLATES.find((t) => t.type === nextType);
    if (tpl) {
      setSeekCongressAuthorization(tpl.defaultSeekCongress);
      setScenarioOrder(tpl.buildOrder(targetCountry.trim() || 'Iran'));
    }
  };

  const handleSelectCountry = (country: string) => {
    setTargetCountry(country);
    const tpl = SCENARIO_TEMPLATES.find((t) => t.type === scenarioType);
    if (tpl && scenarioType !== 'Custom Crisis Scenario') {
      setScenarioOrder(tpl.buildOrder(country));
    }
  };

  const handleEndOperationShortcut = (opName: string, region: string) => {
    setScenarioType('End War / Peace Treaty');
    setTargetCountry(region);
    setSeekCongressAuthorization(true);
    setScenarioOrder(
      `Order an immediate cessation of combat operations for ${opName} in ${region}, begin phased troop withdrawal, and negotiate a formal peace and security accord.`
    );
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioOrder.trim() || isResolvingScenario) return;
    onExecuteScenario({
      scenarioType,
      targetCountry: targetCountry.trim() || 'Global Flashpoint',
      orderSummary: scenarioOrder.trim(),
      seekCongressAuthorization,
    });
  };

  const handleAttachToBriefing = () => {
    if (!scenarioOrder.trim()) return;
    onQueueSecurityOrder(
      `[${scenarioType} — ${targetCountry.trim() || 'Global Theater'}] ${scenarioOrder.trim()}`,
      scenarioType === 'End War / Peace Treaty'
        ? `Today we turn the page from conflict toward durable peace and safe return of our service members from ${targetCountry.trim() || 'the theater'}.`
        : `As Commander-in-Chief, I have ordered decisive action regarding ${targetCountry.trim() || 'national security'} and am briefing Congressional leadership.`
    );
  };

  const selectedEnvoy =
    PRESIDENTIAL_ENVOYS.find((e) => e.id === selectedEnvoyId) ||
    PRESIDENTIAL_ENVOYS[0];

  const activeMissions = diplomaticMissions.filter(
    (m) => m.status === 'In Progress'
  );
  const resolvedMissions = diplomaticMissions.filter(
    (m) => m.status !== 'In Progress'
  );

  const normalizedEnvoyCountry = envoyCountry.trim() || 'Japan';
  const duplicateActiveCountry = activeMissions.some(
    (m) => m.targetCountry.toLowerCase() === normalizedEnvoyCountry.toLowerCase()
  );

  const computedProbability = Math.round(
    Math.max(
      25,
      Math.min(
        92,
        56 +
          (metrics.diplomaticStanding - 50) * 0.25 +
          ((stateSec?.competence || 65) - 60) * 0.2 +
          (selectedEnvoy.specialty === missionFocus
            ? selectedEnvoy.bonusOdds
            : 0) +
          (missionDuration - 3) * 3
      )
    )
  );

  const defaultMissionTitle =
    missionFocus === 'diplomaticStanding'
      ? `${normalizedEnvoyCountry} Security & Détente Accord`
      : `${normalizedEnvoyCountry} Bilateral Trade & Growth Compact`;

  const handleDispatchEnvoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMissions.length >= 4 || duplicateActiveCountry) return;
    onDispatchDiplomaticMission({
      targetCountry: normalizedEnvoyCountry,
      envoyName: selectedEnvoy.name,
      envoyTitle: selectedEnvoy.title,
      missionTitle: customMissionTitle.trim() || defaultMissionTitle,
      focusMetric: missionFocus,
      durationTurns: missionDuration,
      successProbability: computedProbability,
    });
    setCustomMissionTitle('');
  };

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* National Security & Readiness Overview */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Chair of Joint Chiefs: {military.jointChiefsChair.name} ·{' '}
              {military.jointChiefsChair.doctrine}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Situation Room &amp; War Powers Command
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`font-mono-num text-sm font-bold ${defconColor}`}>
              {DEFCON_LABELS[military.defconLevel] ||
                `DEFCON ${military.defconLevel}`}
            </span>
            <button
              type="button"
              onClick={() => setShowReassignJcs((v) => !v)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              {showReassignJcs ? 'Close Command Picker' : 'Switch Joint Chiefs Chair'}
            </button>
            <button
              type="button"
              disabled={isJcsInterim || isFiringOfficial}
              onClick={() => setShowFireJcsModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-45"
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isJcsInterim ? 'Acting Chair' : 'Fire Chief'}</span>
            </button>
          </div>
        </div>

        {latestDismissalResult &&
          latestDismissalResult.targetCategory === 'military' && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50/80 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-red-800">
                    Pentagon Leadership Dismissal ·{' '}
                    {latestDismissalResult.leadOutlet} · Congress:{' '}
                    {latestDismissalResult.congressResponse.status}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                    {latestDismissalResult.leadHeadline}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onDismissDismissalResult}
                  aria-label="Dismiss military firing alert"
                  className="rounded p-1 text-stone-500 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                {latestDismissalResult.mediaSummary}{' '}
                {latestDismissalResult.congressResponse.summary}
              </p>
            </div>
          )}

        {showReassignJcs &&
          (() => {
            const q = jcsSearch.trim().toLowerCase();
            const filteredJcs = q
              ? JOINT_CHIEFS_CANDIDATES.filter(
                  (j) =>
                    j.name.toLowerCase().includes(q) ||
                    j.branch.toLowerCase().includes(q) ||
                    j.leaning.toLowerCase().includes(q) ||
                    j.bio.toLowerCase().includes(q)
                )
              : JOINT_CHIEFS_CANDIDATES;

            return (
              <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-stone-700">
                    Select from {JOINT_CHIEFS_CANDIDATES.length} Real-Life
                    Military Chiefs ({filteredJcs.length} shown)
                  </span>
                  <div className="relative w-full sm:w-64">
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={jcsSearch}
                      onChange={(e) => setJcsSearch(e.target.value)}
                      placeholder="Filter generals & admirals..."
                      className="w-full rounded-lg border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto pr-1 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {filteredJcs.map((jcs) => {
                    const current = military.jointChiefsChair.name === jcs.name;
                    return (
                      <button
                        key={jcs.id}
                        type="button"
                        onClick={() => {
                          onChangeJointChiefsChair({
                            name: jcs.name,
                            branch: jcs.branch,
                            doctrine: jcs.leaning,
                          });
                          setShowReassignJcs(false);
                          setJcsSearch('');
                        }}
                        className={`rounded-lg border p-3.5 text-left transition-colors ${
                          current
                            ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <p className="text-sm font-bold text-stone-900">
                          {jcs.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {jcs.branch} · {jcs.leaning}
                        </p>
                        <p className="mt-1.5 text-xs text-stone-600">
                          {jcs.bio}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Force Readiness
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
              {military.forceReadiness.toFixed(0)}%
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Defense Budget
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
              ${military.defenseBudgetBillions.toFixed(0)}B
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">Cyber Posture</span>
            <span className="mt-1 block text-lg font-semibold text-stone-900">
              {military.cyberPosture}
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Intel Threat Level
            </span>
            <span
              className={`mt-1 block text-lg font-semibold ${
                military.intelThreatLevel === 'Severe' ||
                military.intelThreatLevel === 'High'
                  ? 'text-red-700'
                  : military.intelThreatLevel === 'Elevated'
                  ? 'text-amber-700'
                  : 'text-emerald-700'
              }`}
            >
              {military.intelThreatLevel}
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Diplomatic Standing
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
              {metrics.diplomaticStanding.toFixed(0)} / 100
            </span>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <span className="block text-xs text-stone-500">
              Congress War Backing
            </span>
            <span className="mt-1 block font-mono-num text-2xl font-semibold text-stone-900">
              {metrics.congressSupport.toFixed(0)}%
            </span>
            <span className="block text-[11px] text-stone-500">
              S:{metrics.senateSeats} · H:{metrics.houseSeats}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Radio
                className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-stone-600">
                  Joint Intelligence Assessment (PDB)
                </p>
                <p className="mt-1 text-sm leading-relaxed text-stone-800">
                  {military.intelSummary}
                </p>
              </div>
            </div>

            {(() => {
              const intelOnCooldown =
                lastIntelBriefMonth !== null &&
                currentMonth - lastIntelBriefMonth < 3;
              const nextMonth =
                lastIntelBriefMonth !== null
                  ? lastIntelBriefMonth + 3
                  : currentMonth;
              return (
                <button
                  type="button"
                  disabled={isLoadingIntelBrief || intelOnCooldown}
                  onClick={onRunIntelBrief}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {isLoadingIntelBrief ? (
                    <>
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Compiling PDB...</span>
                    </>
                  ) : intelOnCooldown ? (
                    <span>Next Intel Brief M{nextMonth}</span>
                  ) : (
                    <span>Run Classified Intel Assessment</span>
                  )}
                </button>
              );
            })()}
          </div>

          {latestIntelBrief && (
            <div className="border-t border-stone-200 pt-3 space-y-3">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                {latestIntelBrief.flashpoints.map((fp, idx) => (
                  <div
                    key={`${fp.region}-${idx}`}
                    className="rounded-lg border border-stone-200 bg-white p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-stone-900 truncate">
                        {fp.region}
                      </span>
                      <span
                        className={`font-semibold shrink-0 ${
                          fp.severity === 'Critical'
                            ? 'text-red-700'
                            : fp.severity === 'Elevated'
                            ? 'text-amber-700'
                            : 'text-stone-600'
                        }`}
                      >
                        {fp.severity}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-700">
                      {fp.assessment}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3.5 py-2.5">
                <div className="text-xs">
                  <span className="font-semibold text-stone-500">
                    NSC Recommended Option ({latestIntelBrief.recommendedTargetCountry}):{' '}
                  </span>
                  <span className="font-bold text-stone-900">
                    {latestIntelBrief.recommendedActionTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScenarioType(latestIntelBrief.recommendedScenarioType);
                    setTargetCountry(latestIntelBrief.recommendedTargetCountry);
                    setScenarioOrder(latestIntelBrief.recommendedOrderText);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap"
                >
                  <span>Load Into Command Order</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Key NSC Roster Quick Readout */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[defenseSec, stateSec, nsaSec].filter(Boolean).map((advisor) => (
            <div
              key={advisor!.id}
              className="rounded-lg border border-stone-200 bg-white px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                  {advisor!.roleTitle}
                </span>
                <span className="font-mono-num text-[11px] font-semibold text-stone-700">
                  Loyalty {advisor!.loyalty}%
                </span>
              </div>
              <p className="text-xs font-bold text-stone-900">
                {advisor!.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Error Banner */}
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Situation Room Response Panel (Cabinet, Congress & Media) */}
      {latestResult && (
        <section className="rounded-xl border-2 border-[#132238] bg-white p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                Situation Room Flash Dispatch · {latestResult.leadOutlet} ·{' '}
                {latestResult.scenarioType} ({latestResult.targetCountry})
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold text-stone-900">
                {latestResult.leadHeadline}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                {latestResult.mediaSummary}
              </p>
            </div>
            <button
              type="button"
              onClick={onDismissResult}
              aria-label="Dismiss Situation Room outcome"
              className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Metric Deltas */}
          <div className="flex flex-wrap gap-2">
            {formatDeltaBadge('Approval', latestResult.metricDeltas.approval, '%')}
            {formatDeltaBadge(
              'Congress',
              latestResult.metricDeltas.congressSupport,
              '%'
            )}
            {formatDeltaBadge(
              'Diplomacy',
              latestResult.metricDeltas.diplomaticStanding
            )}
            {formatDeltaBadge('GDP', latestResult.metricDeltas.gdpGrowth, '%')}
            {formatDeltaBadge(
              'Inflation',
              latestResult.metricDeltas.inflation,
              '%'
            )}
            {formatDeltaBadge(
              'Debt',
              latestResult.metricDeltas.nationalDebtTrillions,
              'T'
            )}
          </div>

          {/* Congressional & War Powers Reaction */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2
                  className="h-4 w-4 text-[#132238]"
                  aria-hidden="true"
                />
                <h4 className="font-display text-base font-bold text-stone-900">
                  Capitol Hill &amp; War Powers Response
                </h4>
              </div>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                  latestResult.congressResponse.warPowersStatus ===
                    'AUMF Authorized' ||
                  latestResult.congressResponse.warPowersStatus ===
                    'Peace Treaty Ratified' ||
                  latestResult.congressResponse.warPowersStatus ===
                    'Bipartisan Backing'
                    ? 'bg-emerald-100 text-emerald-900'
                    : latestResult.congressResponse.warPowersStatus ===
                        'War Powers Challenge' ||
                      latestResult.congressResponse.warPowersStatus ===
                        'Constitutional Standoff'
                    ? 'bg-red-100 text-red-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {latestResult.congressResponse.warPowersStatus}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-stone-800">
              {latestResult.congressResponse.chamberSummary}
            </p>

            <div className="flex flex-wrap gap-4 font-mono-num text-xs font-semibold text-stone-700">
              <span>
                Senate Tally:{' '}
                <strong className="text-stone-900">
                  {latestResult.congressResponse.senateVoteEstimate}
                </strong>
              </span>
              <span>
                House Tally:{' '}
                <strong className="text-stone-900">
                  {latestResult.congressResponse.houseVoteEstimate}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 pt-1">
              <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Congressional Majority Leadership
                </span>
                <p className="mt-1 text-xs italic leading-relaxed text-stone-800">
                  &ldquo;{latestResult.congressResponse.majorityLeaderQuote}
                  &rdquo;
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-stone-500">
                  Congressional Opposition Leadership
                </span>
                <p className="mt-1 text-xs italic leading-relaxed text-stone-800">
                  &ldquo;{latestResult.congressResponse.oppositionLeaderQuote}
                  &rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Cabinet & Joint Chiefs Reactions */}
          {latestResult.cabinetResponses.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#132238]" aria-hidden="true" />
                <h4 className="font-display text-base font-bold text-stone-900">
                  Cabinet &amp; Pentagon Response
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {latestResult.cabinetResponses.map((resp, idx) => (
                  <div
                    key={`${resp.speaker}-${idx}`}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          {resp.speaker}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {resp.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {resp.loyaltyDelta !== 0 && (
                          <span
                            className={`font-mono-num text-[11px] font-semibold ${
                              resp.loyaltyDelta > 0
                                ? 'text-emerald-700'
                                : 'text-red-700'
                            }`}
                          >
                            Loyalty {resp.loyaltyDelta > 0 ? `+${resp.loyaltyDelta}` : resp.loyaltyDelta}
                          </span>
                        )}
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            resp.stance === 'supportive'
                              ? 'bg-emerald-100 text-emerald-800'
                              : resp.stance === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {resp.stance}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs italic leading-relaxed text-stone-700">
                      &ldquo;{resp.quote}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Wire Reactions */}
          {latestResult.mediaReactions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Newspaper
                  className="h-4 w-4 text-[#132238]"
                  aria-hidden="true"
                />
                <h4 className="font-display text-base font-bold text-stone-900">
                  Press &amp; Global Media Wire
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {latestResult.mediaReactions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-stone-900">
                        {item.outlet}
                      </span>
                      <span
                        className={`font-semibold uppercase ${
                          item.tone === 'positive'
                            ? 'text-emerald-700'
                            : item.tone === 'critical'
                            ? 'text-red-700'
                            : 'text-stone-500'
                        }`}
                      >
                        {item.tone}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-stone-900">
                      {item.headline}
                    </p>
                    <p className="text-xs leading-relaxed text-stone-600">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* War/Peace Scenario Command & Active Operations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Scenario Command Builder */}
        <section className="lg:col-span-7 rounded-xl border border-stone-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Commander-in-Chief War &amp; Peace Authority
              </p>
              <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                Situation Room Scenarios
              </h3>
            </div>
            <Swords className="h-5 w-5 text-[#132238]" aria-hidden="true" />
          </div>

          {/* Scenario Type Buttons */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-stone-700">
              1. Select War, Peace, or Crisis Action
            </span>
            <div className="flex flex-wrap gap-2">
              {SCENARIO_TEMPLATES.map((tpl) => {
                const active = scenarioType === tpl.type;
                return (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => handleSelectScenarioType(tpl.type)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? tpl.tone === 'war'
                          ? 'border-red-700 bg-red-700 text-white'
                          : tpl.tone === 'peace'
                          ? 'border-emerald-700 bg-emerald-700 text-white'
                          : 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    {tpl.tone === 'war' && (
                      <Swords className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {tpl.tone === 'peace' && (
                      <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {tpl.tone === 'tactical' && (
                      <Plane className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{tpl.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Country Picker */}
          <div className="space-y-2">
            <label
              htmlFor="situation-target-country"
              className="block text-xs font-semibold text-stone-700"
            >
              2. Target Country or Theater (pick or type any country)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    targetCountry.toLowerCase() === country.toLowerCase()
                      ? 'border-[#132238] bg-[#132238] text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
            <input
              id="situation-target-country"
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="Or type any country or region (e.g., Syria, Cuba, South China Sea)..."
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
          </div>

          {/* Custom Scenario Directive Form */}
          <form onSubmit={handleExecute} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="situation-scenario-order"
                className="block text-xs font-semibold text-stone-700"
              >
                3. Write or Edit Your Situation Room Scenario Order
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seekCongressAuthorization}
                  onChange={(e) =>
                    setSeekCongressAuthorization(e.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-stone-300 accent-[#132238]"
                />
                <span>Request Congressional AUMF / Treaty Vote</span>
              </label>
            </div>

            <textarea
              id="situation-scenario-order"
              rows={4}
              value={scenarioOrder}
              onChange={(e) => setScenarioOrder(e.target.value)}
              placeholder="Write any military, diplomatic, war declaration, peace treaty, or crisis scenario..."
              className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={!scenarioOrder.trim() || isResolvingScenario}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                  scenarioType === 'Start War / Request AUMF' ||
                  scenarioType === 'Targeted Strikes & No-Fly Zone'
                    ? 'bg-red-700 hover:bg-red-800'
                    : scenarioType === 'End War / Peace Treaty'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#132238] hover:bg-[#1E3557]'
                }`}
              >
                {isResolvingScenario ? (
                  <>
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Convening Cabinet, Congress &amp; Press...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      Execute Situation Room Decision (Cabinet, Congress &amp;
                      Media)
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={!scenarioOrder.trim() || isResolvingScenario}
                onClick={handleAttachToBriefing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Queue for Monthly Briefing</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>

        {/* Active Military & Cyber Operations */}
        <section className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Global Combatant Commands
              </p>
              <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                Active Wars &amp; Operations
              </h3>
            </div>
            <Shield className="h-5 w-5 text-[#132238]" aria-hidden="true" />
          </div>

          {military.operations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 space-y-1">
              <p className="text-sm font-medium text-stone-800">
                No active wars or overseas combat deployments.
              </p>
              <p className="text-xs text-stone-600">
                Armed forces are in standard garrison rotation. Use the
                Situation Room Scenarios panel to initiate operations or respond
                to emerging crises.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {military.operations.map((op) => (
                <div
                  key={op.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-stone-900">
                      {op.name}
                    </h4>
                    <span
                      className={`text-xs font-bold ${
                        op.posture === 'Active Strike'
                          ? 'text-red-700'
                          : 'text-[#132238]'
                      }`}
                    >
                      {op.posture} · {op.region}
                    </span>
                  </div>
                  <p className="text-xs font-mono-num text-stone-600">
                    {op.personnelCount}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-700">
                    {op.statusNote}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleEndOperationShortcut(op.name, op.region)
                      }
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
                    >
                      <Handshake className="h-3 w-3" aria-hidden="true" />
                      <span>Draft End War / Withdrawal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Independent Institutions: Federal Reserve & Federal Judiciary */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Monetary Policy
              </p>
              <h3 className="mt-0.5 font-display text-lg font-semibold text-stone-900">
                Federal Reserve System
              </h3>
            </div>
            <Landmark className="h-5 w-5 text-[#132238]" aria-hidden="true" />
          </div>

          <div className="flex items-baseline gap-6 pt-1">
            <div>
              <span className="block text-xs text-stone-500">
                Fed Funds Target
              </span>
              <span className="font-mono-num text-2xl font-bold text-stone-900">
                {institutions.fedFundsRate.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="block text-xs text-stone-500">
                Policy Stance
              </span>
              <span className="text-sm font-semibold text-stone-900">
                {institutions.fedStance}
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-stone-700">
            {institutions.fedChairNote}
          </p>

          {(() => {
            const fedOnCooldown =
              lastFedConsultMonth !== null &&
              currentMonth - lastFedConsultMonth < 3;
            const nextMonth =
              lastFedConsultMonth !== null ? lastFedConsultMonth + 3 : currentMonth;
            return (
              <div className="border-t border-stone-200 pt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-stone-500 font-mono-num">
                    {fedOnCooldown
                      ? `Next Treasury–Fed briefing unlocks M${nextMonth}`
                      : 'Treasury–Fed briefing available (3-month cadence)'}
                  </span>
                  <button
                    type="button"
                    disabled={fedOnCooldown}
                    onClick={() => setShowFedOptions((v) => !v)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-45"
                  >
                    {showFedOptions ? 'Hide Options' : 'Consult Fed Chair'}
                  </button>
                </div>

                {showFedOptions && !fedOnCooldown && (
                  <div className="space-y-2">
                    {FED_CONSULT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onConsultFed(opt);
                          setShowFedOptions(false);
                        }}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-left hover:border-[#132238] hover:bg-white transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            {opt.title}
                          </span>
                          <span className="text-[11px] font-semibold text-[#132238]">
                            {opt.stanceRequested}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          {opt.summary}
                        </p>
                        <p className="font-mono-num text-[11px] font-semibold text-stone-700">
                          {opt.tradeoffLabel}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <p className="text-xs font-medium text-stone-500">
                Constitutional Review
              </p>
              <h3 className="mt-0.5 font-display text-lg font-semibold text-stone-900">
                Federal Judiciary &amp; Supreme Court
              </h3>
            </div>
            <Scale className="h-5 w-5 text-[#132238]" aria-hidden="true" />
          </div>

          <div className="pt-1">
            <span className="block text-xs text-stone-500">
              Judicial Alignment
            </span>
            <span
              className={`text-sm font-semibold ${
                institutions.judiciaryClimate === 'Favorable'
                  ? 'text-emerald-700'
                  : institutions.judiciaryClimate === 'Hostile'
                  ? 'text-red-700'
                  : 'text-amber-700'
              }`}
            >
              {institutions.judiciaryClimate}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-stone-700">
            {institutions.pendingCourtNote}
          </p>

          {(() => {
            const judOnCooldown =
              lastJudicialNomMonth !== null &&
              currentMonth - lastJudicialNomMonth < 3;
            const nextMonth =
              lastJudicialNomMonth !== null
                ? lastJudicialNomMonth + 3
                : currentMonth;
            return (
              <div className="border-t border-stone-200 pt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-stone-500 font-mono-num">
                    {judOnCooldown
                      ? `Next judicial slate unlocks M${nextMonth}`
                      : 'Senate Judiciary nomination push available'}
                  </span>
                  <button
                    type="button"
                    disabled={judOnCooldown}
                    onClick={() => setShowJudicialOptions((v) => !v)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-45"
                  >
                    {showJudicialOptions
                      ? 'Hide Options'
                      : 'Advance Judicial Nominees'}
                  </button>
                </div>

                {showJudicialOptions && !judOnCooldown && (
                  <div className="space-y-2">
                    {JUDICIAL_NOMINATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onNominateJudges(opt);
                          setShowJudicialOptions(false);
                        }}
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-left hover:border-[#132238] hover:bg-white transition-colors space-y-1"
                      >
                        <p className="text-xs font-bold text-stone-900">
                          {opt.title}
                        </p>
                        <p className="text-[11px] text-stone-600">
                          {opt.summary}
                        </p>
                        <p className="font-mono-num text-[11px] font-semibold text-stone-700">
                          {opt.tradeoffLabel}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Diplomatic Missions & Presidential Envoys */}
      <section
        aria-label="Diplomatic Missions"
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Globe className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>
                State Department &amp; Special Presidential Envoys · 3–6 Turn
                Operations
              </span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Diplomatic Missions
            </h3>
            <p className="mt-1 text-sm text-stone-600 max-w-2xl">
              Dispatch Special Envoys to foreign capitals on multi-turn
              probability-based missions that reshape{' '}
              <span className="font-semibold text-stone-800">
                Diplomatic Standing
              </span>{' '}
              or{' '}
              <span className="font-semibold text-stone-800">GDP Growth</span>{' '}
              across 3 to 6 monthly turns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono-num text-xs">
            <span className="rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 font-semibold text-stone-800">
              Active Envoys: {activeMissions.length} / 4
            </span>
            <span className="rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 font-semibold text-[#132238]">
              Diplomacy {metrics.diplomaticStanding.toFixed(1)} · GDP{' '}
              {metrics.gdpGrowth.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Envoy Dispatch Form */}
          <form
            onSubmit={handleDispatchEnvoy}
            className="lg:col-span-6 rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h4 className="font-display text-lg font-semibold text-stone-900">
                Dispatch Presidential Envoy
              </h4>
              <span className="rounded-md border border-[#132238]/20 bg-white px-2.5 py-1 font-mono-num text-xs font-bold text-[#132238]">
                {computedProbability}% Success Odds
              </span>
            </div>

            {/* 1. Target Country */}
            <div className="space-y-2">
              <label
                htmlFor="envoy-country-input"
                className="block text-xs font-semibold text-stone-700"
              >
                1. Destination Country
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ENVOY_COUNTRIES.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => setEnvoyCountry(country)}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      envoyCountry.toLowerCase() === country.toLowerCase()
                        ? 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              <input
                id="envoy-country-input"
                type="text"
                value={envoyCountry}
                onChange={(e) => setEnvoyCountry(e.target.value)}
                placeholder="Or enter any country (e.g., France, Poland, Canada)..."
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            {/* 2. Select Envoy */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-stone-700">
                2. Assign Envoy
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PRESIDENTIAL_ENVOYS.map((envoy) => {
                  const selected = envoy.id === selectedEnvoyId;
                  return (
                    <button
                      key={envoy.id}
                      type="button"
                      onClick={() => setSelectedEnvoyId(envoy.id)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selected
                          ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-stone-900">
                        {envoy.name}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {envoy.title}
                      </p>
                      <p className="mt-1 font-mono-num text-[11px] font-semibold text-[#132238]">
                        {envoy.specialtyLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Mission Objective & 4. Duration (3-6 turns) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-stone-700">
                  3. Target Metric Mandate
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setMissionFocus('diplomaticStanding')}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      missionFocus === 'diplomaticStanding'
                        ? 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <span className="block font-semibold">
                      Diplomatic Standing
                    </span>
                    <span className="block text-[11px] opacity-80">
                      Alliance &amp; détente pact (+Standing / turn)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMissionFocus('gdpGrowth')}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      missionFocus === 'gdpGrowth'
                        ? 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <span className="block font-semibold">
                      GDP Growth Compact
                    </span>
                    <span className="block text-[11px] opacity-80">
                      Trade &amp; investment corridor (+GDP% / turn)
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-semibold text-stone-700">
                  4. Mission Duration (3–6 Turns)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 4, 5, 6].map((turns) => (
                    <button
                      key={turns}
                      type="button"
                      onClick={() => setMissionDuration(turns)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold font-mono-num transition-colors ${
                        missionDuration === turns
                          ? 'border-[#132238] bg-[#132238] text-white'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                      }`}
                    >
                      {turns} Turns
                    </button>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  Longer missions add +3% odds per extra turn and more negotiation
                  ticks.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="envoy-mission-title"
                className="block text-xs font-semibold text-stone-700"
              >
                5. Mission Codename / Mandate Title (optional)
              </label>
              <input
                id="envoy-mission-title"
                type="text"
                value={customMissionTitle}
                onChange={(e) => setCustomMissionTitle(e.target.value)}
                placeholder={defaultMissionTitle}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            {(activeMissions.length >= 4 || duplicateActiveCountry) && (
              <p className="text-xs font-medium text-amber-800">
                {duplicateActiveCountry
                  ? `An Envoy is already stationed in ${normalizedEnvoyCountry}. Wait for completion or recall them first.`
                  : 'Maximum of 4 concurrent Envoy missions reached. Wait for a mission to conclude or recall an Envoy.'}
              </p>
            )}

            <button
              type="submit"
              disabled={activeMissions.length >= 4 || duplicateActiveCountry}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                Send {selectedEnvoy.name} to {normalizedEnvoyCountry} (
                {missionDuration} Turns · {computedProbability}% Odds)
              </span>
            </button>
          </form>

          {/* Active & Completed Missions Tracker */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold text-stone-900">
                Active &amp; Completed Envoy Missions
              </h4>
              {resolvedMissions.length > 0 && (
                <button
                  type="button"
                  onClick={onClearResolvedMissions}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 hover:underline"
                >
                  Clear Resolved ({resolvedMissions.length})
                </button>
              )}
            </div>

            {diplomaticMissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center space-y-2">
                <Globe
                  className="mx-auto h-6 w-6 text-stone-400"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-stone-800">
                  No Envoys Currently Deployed
                </p>
                <p className="text-xs leading-relaxed text-stone-600 max-w-md mx-auto">
                  Send an Envoy on the left to begin a 3–6 turn diplomatic or
                  trade initiative. Progress rolls automatically each time you
                  submit a monthly turn on the Briefing Desk.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {diplomaticMissions.map((mission) => {
                  const pct = Math.min(
                    100,
                    Math.round(
                      (mission.turnsElapsed / mission.durationTurns) * 100
                    )
                  );
                  const isActive = mission.status === 'In Progress';
                  const isSuccess = mission.status === 'Succeeded';
                  const deltaFormatted =
                    mission.focusMetric === 'diplomaticStanding'
                      ? `${mission.cumulativeDelta >= 0 ? '+' : ''}${mission.cumulativeDelta.toFixed(1)} pts`
                      : `${mission.cumulativeDelta >= 0 ? '+' : ''}${mission.cumulativeDelta.toFixed(2)}% GDP`;

                  return (
                    <article
                      key={mission.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-[#132238]">
                              {mission.targetCountry}
                            </span>
                            <span aria-hidden="true" className="text-stone-400">
                              ·
                            </span>
                            <span className="font-medium text-stone-700">
                              {mission.envoyName}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-stone-900 mt-0.5">
                            {mission.missionTitle}
                          </h5>
                        </div>

                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                            isActive
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : isSuccess
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : 'border-red-200 bg-red-50 text-red-800'
                          }`}
                        >
                          {mission.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-num text-stone-600">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            Turn {mission.turnsElapsed} /{' '}
                            {mission.durationTurns}
                          </span>
                        </span>

                        <span>
                          Target:{' '}
                          <strong className="text-stone-900">
                            {mission.focusMetric === 'diplomaticStanding'
                              ? 'Diplomatic Standing'
                              : 'GDP Growth'}
                          </strong>
                        </span>

                        <span className="inline-flex items-center gap-1 font-semibold text-[#132238]">
                          <TrendingUp
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span>Net: {deltaFormatted}</span>
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isActive
                              ? 'bg-[#132238]'
                              : isSuccess
                              ? 'bg-emerald-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <p className="text-xs leading-relaxed text-stone-700">
                          {mission.latestUpdate}
                        </p>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() =>
                              onRecallDiplomaticMission(mission.id)
                            }
                            className="shrink-0 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                          >
                            Recall Envoy
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Diplomatic Summit */}
      <section
        aria-label="Diplomatic Summit"
        className="rounded-xl border border-stone-200 bg-white p-6 space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Handshake className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>
                Bilateral Heads-of-State Negotiations · 3-Round Mini-Game
              </span>
            </div>
            <h3 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Diplomatic Summit
            </h3>
            <p className="mt-1 text-sm text-stone-600 max-w-2xl">
              Convene a high-stakes summit with a foreign power and navigate three rounds of bargaining to elevate{' '}
              <span className="font-semibold text-stone-800">
                Diplomatic Standing
              </span>{' '}
              without triggering a delegation walkout.
            </p>
          </div>

          <div className="font-mono-num text-xs">
            <span className="rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 font-semibold text-stone-800">
              {lastSummitMonth !== null && currentMonth - lastSummitMonth < 2
                ? `Next Summit Unlocks M${lastSummitMonth + 2}`
                : 'Summit Venue Ready (2-Month Cadence)'}
            </span>
          </div>
        </div>

        {latestSummitOutcome && (
          <div
            className={`rounded-xl border p-4 space-y-2 ${
              latestSummitOutcome.walkedOut
                ? 'border-red-200 bg-red-50'
                : latestSummitOutcome.verdict === 'Stalled Talks'
                ? 'border-amber-200 bg-amber-50'
                : 'border-emerald-200 bg-emerald-50/70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-stone-700">
                  {latestSummitOutcome.verdict} · {latestSummitOutcome.country}{' '}
                  · M{latestSummitOutcome.month}
                </p>
                <h4 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                  {latestSummitOutcome.headline}
                </h4>
              </div>
              <button
                type="button"
                onClick={onDismissSummitOutcome}
                aria-label="Dismiss summit outcome"
                className="rounded-md p-1 text-stone-500 hover:bg-white hover:text-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-stone-700">
              {latestSummitOutcome.summary}
            </p>
            <div className="flex flex-wrap gap-2 font-mono-num text-[11px] font-semibold">
              <span className="rounded border border-stone-200 bg-white px-2 py-0.5 text-stone-900">
                Diplomacy{' '}
                {latestSummitOutcome.diplomaticDelta >= 0 ? '+' : ''}
                {latestSummitOutcome.diplomaticDelta.toFixed(1)} pts
              </span>
              <span className="rounded border border-stone-200 bg-white px-2 py-0.5 text-stone-900">
                Approval {latestSummitOutcome.approvalDelta >= 0 ? '+' : ''}
                {latestSummitOutcome.approvalDelta.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUMMIT_FOREIGN_POWERS.map((power) => {
            const onCooldown =
              lastSummitMonth !== null && currentMonth - lastSummitMonth < 2;
            return (
              <article
                key={power.id}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#132238]">
                      {power.country}
                    </span>
                    <span
                      className={`font-semibold ${
                        power.postureLabel === 'Strategic Rival'
                          ? 'text-red-700'
                          : power.postureLabel === 'Competitive Partner'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {power.postureLabel}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-stone-900">
                    {power.summitTitle}
                  </h4>
                  <p className="text-[11px] font-medium text-stone-500">
                    {power.counterpartName} · {power.counterpartTitle}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-700">
                    {power.coreIssue}
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-3 flex items-center justify-between gap-2">
                  <span className="font-mono-num text-[11px] text-stone-500">
                    Base Trust {power.baseTrust} · Risk {power.baseWalkoutRiskPct}%
                  </span>
                  <button
                    type="button"
                    disabled={onCooldown}
                    onClick={() => setActiveSummitPower(power)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap"
                  >
                    <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Host Summit</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {activeSummitPower && (
        <DiplomaticSummitModal
          power={activeSummitPower}
          currentMonth={currentMonth}
          metrics={metrics}
          stateSecCompetence={stateSec?.competence ?? 65}
          onComplete={(outcome) => {
            setActiveSummitPower(null);
            onCompleteDiplomaticSummit(outcome);
          }}
          onClose={() => setActiveSummitPower(null)}
        />
      )}

      {showFireJcsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fire-jcs-title"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (isFiringOfficial) return;
              const reason = fireJcsReason.trim();
              setShowFireJcsModal(false);
              await onFireJointChiefsChair(reason);
            }}
            className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Commander-in-Chief Dismissal Order
                </p>
                <h3
                  id="fire-jcs-title"
                  className="mt-0.5 font-display text-xl font-bold text-stone-900"
                >
                  Fire {military.jointChiefsChair.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFireJcsModal(false)}
                aria-label="Cancel firing Joint Chiefs Chair"
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              Relieving the Chair of the Joint Chiefs of Staff shifts command to an Acting Vice Chair, lowers force readiness temporarily, and triggers Armed Services Committee hearings.
            </p>
            <div>
              <label
                htmlFor="fire-jcs-reason"
                className="block text-xs font-semibold text-stone-800"
              >
                Stated Reason
              </label>
              <textarea
                id="fire-jcs-reason"
                rows={3}
                value={fireJcsReason}
                onChange={(e) => setFireJcsReason(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFireJcsModal(false)}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFiringOfficial}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Execute Dismissal</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};
