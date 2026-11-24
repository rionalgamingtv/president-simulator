import React, { useState } from 'react';
import {
  ArrowRight,
  RotateCcw,
  Landmark,
  AlertCircle,
  Check,
  Calendar,
  UserCheck,
  Sparkles,
  Minus,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import {
  AppointeeBonuses,
  BackgroundId,
  CabinetDepartment,
  CabinetMember,
  CoalitionId,
  GameDifficultyId,
  PartyId,
  PoliticalClimateModeId,
  PresidentProfile,
  SavedCareerState,
  ScenarioClimateCategory,
  ScenarioDefinition,
  VicePresidentProfile,
} from '../types/game';
import {
  BACKGROUNDS,
  COALITIONS,
  GAME_DIFFICULTIES,
  getPartyMeta,
  PARTIES,
  POLITICAL_CLIMATE_MODES,
  SCENARIOS,
} from '../data/scenarios';
import {
  CABINET_ROSTER_OPTIONS,
  JOINT_CHIEFS_CANDIDATES,
  VP_CANDIDATES,
} from '../data/appointees';
import {
  CUSTOM_ERA_BLUEPRINTS,
  getEraOverviewForYear,
  HISTORICAL_PRESIDENTS,
  HistoricalPresidentOption,
  QUICK_MILESTONE_YEARS,
} from '../data/historicalPresidents';
import { HISTORICAL_SCENARIOS } from '../data/historicalScenarios';
import { PWAInstallControl } from './PWAInstallControl';

export interface SelectedAdministration {
  vicePresident: VicePresidentProfile;
  cabinet: CabinetMember[];
  jointChiefsChair: {
    name: string;
    branch: string;
    doctrine: string;
  };
  aggregatedBonuses: AppointeeBonuses;
}

interface TitleSetupProps {
  savedCareer: SavedCareerState | null;
  isLoadingCustom: boolean;
  errorMsg: string | null;
  onStartScenario: (
    profile: PresidentProfile,
    scenario: ScenarioDefinition,
    administration: SelectedAdministration,
    customPremise?: string
  ) => void;
  onResumeSaved: () => void;
  onDiscardSaved: () => void;
  onImportCareerJson?: (imported: SavedCareerState) => void;
}

type RosterSlotId = 'vp' | 'jcs' | CabinetDepartment;

const ROSTER_SLOT_ORDER: { id: RosterSlotId; label: string }[] = [
  { id: 'vp', label: 'Vice President' },
  { id: 'chief_of_staff', label: 'Chief of Staff' },
  { id: 'treasury', label: 'Treasury Secretary' },
  { id: 'state', label: 'Secretary of State' },
  { id: 'defense', label: 'Secretary of Defense' },
  { id: 'jcs', label: 'Chair, Joint Chiefs' },
  { id: 'nsa', label: 'National Security Advisor' },
  { id: 'justice', label: 'Attorney General' },
  { id: 'labor', label: 'Labor & Commerce' },
  { id: 'press_secretary', label: 'Press Secretary' },
];

const YEARS_2000_TO_2026 = Array.from({ length: 27 }, (_, i) => 2000 + i);

function mergeBonuses(list: AppointeeBonuses[]): AppointeeBonuses {
  const acc: AppointeeBonuses = {};
  const keys: (keyof AppointeeBonuses)[] = [
    'approval',
    'congressSupport',
    'gdpGrowth',
    'inflation',
    'diplomaticStanding',
    'workingClass',
    'suburbanModerates',
    'techFinance',
    'seniors',
    'youngVoters',
    'forceReadiness',
  ];
  for (const k of keys) {
    let sum = 0;
    for (const item of list) {
      sum += item[k] || 0;
    }
    if (sum !== 0) {
      acc[k] = Number(sum.toFixed(2));
    }
  }
  return acc;
}

export const TitleSetup: React.FC<TitleSetupProps> = ({
  savedCareer,
  isLoadingCustom,
  errorMsg,
  onStartScenario,
  onResumeSaved,
  onDiscardSaved,
  onImportCareerJson,
}) => {
  const defaultHistPres =
    HISTORICAL_PRESIDENTS.find((p) => p.id === 'obama') ||
    HISTORICAL_PRESIDENTS[0];
  const [candidateMode, setCandidateMode] = useState<'historical' | 'custom'>(
    'historical'
  );
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string>(
    defaultHistPres.id
  );
  const [presidentSearch, setPresidentSearch] = useState('');
  const [rosterSearch, setRosterSearch] = useState('');
  const [name, setName] = useState(defaultHistPres.name);
  const [party, setParty] = useState<PartyId>(defaultHistPres.partyId);
  const [coalition, setCoalition] = useState<CoalitionId>(
    defaultHistPres.coalition
  );
  const [background, setBackground] = useState<BackgroundId>(
    defaultHistPres.background
  );
  const [termLength, setTermLength] = useState<12 | 48>(48);
  const [gameDifficulty, setGameDifficulty] =
    useState<GameDifficultyId>('medium');
  const [difficultyMode, setDifficultyMode] =
    useState<PoliticalClimateModeId>('standard');
  const [motto, setMotto] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [ticketSyncedNotice, setTicketSyncedNotice] = useState<string | null>(
    null
  );

  // Roster selections
  const [activeSlot, setActiveSlot] = useState<RosterSlotId>('vp');
  const [selectedVpId, setSelectedVpId] = useState<string>(VP_CANDIDATES[0].id);
  const [customVpName, setCustomVpName] = useState('');
  const [selectedJcsId, setSelectedJcsId] = useState<string>(
    JOINT_CHIEFS_CANDIDATES[0].id
  );
  const [selectedCabinetIds, setSelectedCabinetIds] = useState<
    Record<CabinetDepartment, string>
  >({
    chief_of_staff: CABINET_ROSTER_OPTIONS.chief_of_staff.candidates[0].id,
    treasury: CABINET_ROSTER_OPTIONS.treasury.candidates[0].id,
    state: CABINET_ROSTER_OPTIONS.state.candidates[0].id,
    defense: CABINET_ROSTER_OPTIONS.defense.candidates[0].id,
    nsa: CABINET_ROSTER_OPTIONS.nsa.candidates[0].id,
    justice: CABINET_ROSTER_OPTIONS.justice.candidates[0].id,
    labor: CABINET_ROSTER_OPTIONS.labor.candidates[0].id,
    press_secretary: CABINET_ROSTER_OPTIONS.press_secretary.candidates[0].id,
  });

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    SCENARIOS[0].id
  );
  const [selectedHistoricalScenarioId, setSelectedHistoricalScenarioId] =
    useState<string>(HISTORICAL_SCENARIOS[0].id);
  const [climateFilter, setClimateFilter] = useState<
    'all' | ScenarioClimateCategory
  >('all');
  const [scenarioMode, setScenarioMode] = useState<
    'preset' | 'historical' | 'custom'
  >('preset');
  const [customStartYear, setCustomStartYear] = useState<number>(2008);
  const [customPremise, setCustomPremise] = useState<string>(
    () => getEraOverviewForYear(2008).defaultPremise
  );
  const [premiseEditedManually, setPremiseEditedManually] = useState(false);

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [failedScenarioImgs, setFailedScenarioImgs] = useState<
    Record<string, boolean>
  >({});

  const selectedHistoricalPresident: HistoricalPresidentOption | undefined =
    candidateMode === 'historical'
      ? HISTORICAL_PRESIDENTS.find((p) => p.id === selectedHistoricalId)
      : HISTORICAL_PRESIDENTS.find(
          (p) => p.name.toLowerCase() === name.trim().toLowerCase()
        );

  const normalizedPresQuery = presidentSearch.trim().toLowerCase();
  const filteredPresidents = normalizedPresQuery
    ? HISTORICAL_PRESIDENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedPresQuery) ||
          p.party.toLowerCase().includes(normalizedPresQuery) ||
          p.orderLabel.toLowerCase().includes(normalizedPresQuery) ||
          p.yearsInOffice.toLowerCase().includes(normalizedPresQuery)
      )
    : HISTORICAL_PRESIDENTS;

  const normalizedRosterQuery = rosterSearch.trim().toLowerCase();
  const filteredVpCandidates = normalizedRosterQuery
    ? VP_CANDIDATES.filter(
        (v) =>
          v.name.toLowerCase().includes(normalizedRosterQuery) ||
          v.formerTitle.toLowerCase().includes(normalizedRosterQuery) ||
          v.leaning.toLowerCase().includes(normalizedRosterQuery) ||
          v.bio.toLowerCase().includes(normalizedRosterQuery)
      )
    : VP_CANDIDATES;

  const filteredJcsCandidates = normalizedRosterQuery
    ? JOINT_CHIEFS_CANDIDATES.filter(
        (j) =>
          j.name.toLowerCase().includes(normalizedRosterQuery) ||
          j.branch.toLowerCase().includes(normalizedRosterQuery) ||
          j.leaning.toLowerCase().includes(normalizedRosterQuery) ||
          j.bio.toLowerCase().includes(normalizedRosterQuery)
      )
    : JOINT_CHIEFS_CANDIDATES;

  const currentEraOverview = getEraOverviewForYear(customStartYear);

  const handleSelectHistoricalPresident = (pres: HistoricalPresidentOption) => {
    setCandidateMode('historical');
    setSelectedHistoricalId(pres.id);
    setName(pres.name);
    setParty(pres.partyId);
    setCoalition(pres.coalition);
    setBackground(pres.background);
    setTicketSyncedNotice(null);
  };

  const handleSelectCustomPresetPresident = (presId: string) => {
    const pres = HISTORICAL_PRESIDENTS.find((p) => p.id === presId);
    if (!pres) return;
    setSelectedHistoricalId(pres.id);
    setName(pres.name);
    setParty(pres.partyId);
    setCoalition(pres.coalition);
    setBackground(pres.background);
    setTicketSyncedNotice(null);
  };

  const handleApplyHistoricalTicket = (pres: HistoricalPresidentOption) => {
    setSelectedVpId(pres.recommendedTicket.vpId);
    setCustomVpName('');
    setSelectedJcsId(pres.recommendedTicket.jcsId);
    setSelectedCabinetIds({ ...pres.recommendedTicket.cabinet });
    setTicketSyncedNotice(
      `Aligned real-life VP, Joint Chiefs Chair, Cabinet & Advisors with ${pres.name}.`
    );
  };

  const handleSwitchCandidateMode = (mode: 'historical' | 'custom') => {
    setCandidateMode(mode);
    setTicketSyncedNotice(null);
    if (mode === 'custom') {
      if (HISTORICAL_PRESIDENTS.some((p) => p.name === name)) {
        setName('Jordan Mercer');
        setParty('independent');
      }
    } else {
      const pres =
        HISTORICAL_PRESIDENTS.find((p) => p.id === selectedHistoricalId) ||
        HISTORICAL_PRESIDENTS[0];
      setSelectedHistoricalId(pres.id);
      setName(pres.name);
      setParty(pres.partyId);
      setCoalition(pres.coalition);
      setBackground(pres.background);
    }
  };

  const handleChangeCustomYear = (yearValue: number, forceLoadPremise = false) => {
    const clampedYear = Math.max(2000, Math.min(2026, Math.round(yearValue)));
    setCustomStartYear(clampedYear);
    if (forceLoadPremise || !premiseEditedManually) {
      setCustomPremise(getEraOverviewForYear(clampedYear).defaultPremise);
      if (forceLoadPremise) {
        setPremiseEditedManually(false);
      }
    }
  };

  const getSlotSummaryName = (slot: RosterSlotId): string => {
    if (slot === 'vp') {
      if (customVpName.trim()) return customVpName.trim();
      return (
        VP_CANDIDATES.find((v) => v.id === selectedVpId)?.name ||
        VP_CANDIDATES[0].name
      );
    }
    if (slot === 'jcs') {
      return (
        JOINT_CHIEFS_CANDIDATES.find((j) => j.id === selectedJcsId)?.name ||
        JOINT_CHIEFS_CANDIDATES[0].name
      );
    }
    const opts = CABINET_ROSTER_OPTIONS[slot].candidates;
    return opts.find((c) => c.id === selectedCabinetIds[slot])?.name || opts[0].name;
  };

  const handleResetDefaults = () => {
    setSelectedVpId(VP_CANDIDATES[0].id);
    setCustomVpName('');
    setSelectedJcsId(JOINT_CHIEFS_CANDIDATES[0].id);
    setSelectedCabinetIds({
      chief_of_staff: CABINET_ROSTER_OPTIONS.chief_of_staff.candidates[0].id,
      treasury: CABINET_ROSTER_OPTIONS.treasury.candidates[0].id,
      state: CABINET_ROSTER_OPTIONS.state.candidates[0].id,
      defense: CABINET_ROSTER_OPTIONS.defense.candidates[0].id,
      nsa: CABINET_ROSTER_OPTIONS.nsa.candidates[0].id,
      justice: CABINET_ROSTER_OPTIONS.justice.candidates[0].id,
      labor: CABINET_ROSTER_OPTIONS.labor.candidates[0].id,
      press_secretary: CABINET_ROSTER_OPTIONS.press_secretary.candidates[0].id,
    });
    setTicketSyncedNotice(null);
  };

  const buildAdministration = (): SelectedAdministration => {
    const vpChoice =
      VP_CANDIDATES.find((v) => v.id === selectedVpId) || VP_CANDIDATES[0];
    const jcsChoice =
      JOINT_CHIEFS_CANDIDATES.find((j) => j.id === selectedJcsId) ||
      JOINT_CHIEFS_CANDIDATES[0];

    const bonusList: AppointeeBonuses[] = [vpChoice.bonuses, jcsChoice.bonuses];

    const cabinet: CabinetMember[] = (
      Object.keys(CABINET_ROSTER_OPTIONS) as CabinetDepartment[]
    ).map((dept) => {
      const info = CABINET_ROSTER_OPTIONS[dept];
      const chosen =
        info.candidates.find((c) => c.id === selectedCabinetIds[dept]) ||
        info.candidates[0];
      bonusList.push(chosen.bonuses);
      return {
        id: dept,
        roleTitle: info.roleTitle,
        name: chosen.name,
        leaning: chosen.leaning,
        loyalty: chosen.loyalty,
        competence: chosen.competence,
        status: 'Aligned',
        currentCounsel: chosen.openingCounsel,
      };
    });

    const vicePresident: VicePresidentProfile = {
      id: vpChoice.id,
      name: customVpName.trim() || vpChoice.name,
      formerTitle: customVpName.trim()
        ? `Running Mate (${vpChoice.leaning})`
        : vpChoice.formerTitle,
      leaning: vpChoice.leaning,
      loyalty: vpChoice.loyalty,
      popularity: vpChoice.popularity,
      traitSummary: vpChoice.bonusLabel,
      currentCounsel: vpChoice.openingCounsel,
    };

    return {
      vicePresident,
      cabinet,
      jointChiefsChair: {
        name: jcsChoice.name,
        branch: jcsChoice.branch,
        doctrine: jcsChoice.leaning,
      },
      aggregatedBonuses: mergeBonuses(bonusList),
    };
  };

  const activeHistoricalScenario =
    HISTORICAL_SCENARIOS.find((s) => s.id === selectedHistoricalScenarioId) ||
    HISTORICAL_SCENARIOS[0];

  const handleSyncHistoricalScenarioTicket = (sc: ScenarioDefinition) => {
    if (!sc.recommendedPresidentId) return;
    const pres = HISTORICAL_PRESIDENTS.find(
      (p) => p.id === sc.recommendedPresidentId
    );
    if (!pres) return;
    setCandidateMode('historical');
    handleSelectHistoricalPresident(pres);
    handleApplyHistoricalTicket(pres);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const isHistMode = scenarioMode === 'historical';
    const isCustomMode = scenarioMode === 'custom';
    const chosenHist = isHistMode ? activeHistoricalScenario : undefined;

    const profile: PresidentProfile = {
      name: name.trim() || 'Jordan Mercer',
      party,
      coalition,
      background,
      termLength,
      difficultyMode,
      gameDifficulty,
      ...(motto.trim() ? { motto: motto.trim() } : {}),
      ...(isCustomMode ? { startingYear: customStartYear } : {}),
      ...(chosenHist
        ? {
            startingYear: chosenHist.historicalYear,
            historicalScenarioId: chosenHist.id,
            historicalBenchmarkNote: chosenHist.historicalBenchmarkNote,
          }
        : {}),
      ...(selectedHistoricalPresident
        ? {
            historicalPresidentId: selectedHistoricalPresident.id,
            governingDoctrine: selectedHistoricalPresident.governingDoctrine,
          }
        : {}),
    };
    const administration = buildAdministration();

    if (isCustomMode) {
      const customPlaceholder: ScenarioDefinition = {
        ...SCENARIOS[0],
        id: `custom_${customStartYear}`,
        title: `${customStartYear} Custom Mandate`,
        isCustom: true,
      };
      onStartScenario(
        profile,
        customPlaceholder,
        administration,
        customPremise.trim()
      );
    } else if (chosenHist) {
      onStartScenario(profile, chosenHist, administration);
    } else {
      const chosen =
        SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];
      onStartScenario(profile, chosen, administration);
    }
  };

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-10 space-y-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-8 md:p-10">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Open-Ended Presidential Simulator · Windows 11 Installable App
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#132238] sm:text-[2.75rem] leading-[1.12] [text-wrap:balance]">
              Govern in your own words, one month at a time.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
              Hand-pick your Vice President, Cabinet Secretaries, Joint Chiefs
              Chair, and Senior Advisors—then write custom executive directives
              and national addresses across a 48-month term.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {savedCareer && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-stone-500">
                      Saved Administration · Month{' '}
                      <span className="font-mono-num">
                        {savedCareer.currentMonth}
                      </span>{' '}
                      of{' '}
                      <span className="font-mono-num">
                        {savedCareer.profile.termLength}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900">
                      President {savedCareer.profile.name} ·{' '}
                      {savedCareer.scenarioTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onDiscardSaved}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Discard</span>
                    </button>
                    <button
                      type="button"
                      onClick={onResumeSaved}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap shrink-0"
                    >
                      <span>Resume Saved Term</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#candidate-profile"
                className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557] whitespace-nowrap shrink-0"
              >
                <span>Configure New Term</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              {onImportCareerJson && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 whitespace-nowrap shrink-0">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Import .json Save</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          const parsed = JSON.parse(
                            String(reader.result || '')
                          ) as SavedCareerState;
                          if (!parsed?.profile || !parsed?.metrics) {
                            setImportError(
                              'Invalid administration archive file.'
                            );
                            return;
                          }
                          setImportError(null);
                          onImportCareerJson(parsed);
                        } catch {
                          setImportError('Could not parse JSON save file.');
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <PWAInstallControl variant="banner" />
            </div>
            {importError && (
              <p className="text-xs font-medium text-red-700">{importError}</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
          {heroImgFailed ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-[#132238] to-[#23395B] p-8 text-center text-white">
              <Landmark className="h-12 w-12 text-[#C99A3B]" aria-hidden="true" />
              <p className="mt-3 font-display text-xl font-semibold">
                The Oval Desk
              </p>
              <p className="mt-1 text-sm text-stone-300">
                Daily Briefings &amp; Executive Action
              </p>
            </div>
          ) : (
            <img
              src="/src/assets/images/hero_oval_desk_1795129501179.jpg"
              alt="Presidential study desk with leather national security briefing folder, brass lamp, and fountain pen"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="h-72 w-full object-cover lg:h-full"
            />
          )}
        </div>
      </section>

      {/* Setup Form */}
      <form onSubmit={handleLaunch} className="space-y-10">
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">Unable to initialize scenario</p>
              <p className="mt-0.5 text-red-800">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Step 1: Candidate Profile */}
        <section
          id="candidate-profile"
          className="rounded-xl border border-stone-200 bg-white p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-medium text-stone-500">
                01. Candidate Dossier
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
                Establish your presidency
              </h2>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => handleSwitchCandidateMode('historical')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  candidateMode === 'historical'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Real-Life Presidents (50 Choices)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchCandidateMode('custom')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  candidateMode === 'custom'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Custom Select Your President
              </button>
            </div>
          </div>

          {candidateMode === 'historical' && (
            <div className="mt-6 space-y-4 border-b border-stone-200 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-stone-800">
                    Select from 50 U.S. Presidents &amp; Historical Figures
                    (Washington to Trump + Contenders)
                  </span>
                  <p className="text-xs text-stone-500">
                    Showing {filteredPresidents.length} of{' '}
                    {HISTORICAL_PRESIDENTS.length} · Auto-configures party,
                    coalition &amp; governing doctrine
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={presidentSearch}
                    onChange={(e) => setPresidentSearch(e.target.value)}
                    placeholder="Search 50 Presidents by name, party, era..."
                    className="w-full rounded-lg border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                  />
                </div>
              </div>

              <div className="max-h-[340px] overflow-y-auto pr-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
                {filteredPresidents.map((pres) => {
                  const picked = selectedHistoricalId === pres.id;
                  return (
                    <button
                      key={pres.id}
                      type="button"
                      onClick={() => handleSelectHistoricalPresident(pres)}
                      className={`rounded-lg border p-3.5 text-left transition-colors flex flex-col justify-between ${
                        picked
                          ? 'border-[#132238] bg-[#132238] text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className={`font-mono-num text-[11px] font-medium truncate ${
                              picked ? 'text-stone-300' : 'text-stone-500'
                            }`}
                          >
                            {pres.orderLabel}
                          </span>
                          <span
                            className={`text-[11px] font-semibold shrink-0 ${
                              picked
                                ? 'text-[#E3B857]'
                                : pres.partyId === 'republican'
                                ? 'text-red-700'
                                : pres.partyId === 'democratic'
                                ? 'text-sky-700'
                                : 'text-stone-600'
                            }`}
                          >
                            {pres.partyId === 'republican'
                              ? 'R'
                              : pres.partyId === 'democratic'
                              ? 'D'
                              : 'I'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold leading-snug">
                          {pres.name}
                        </p>
                      </div>
                      <p
                        className={`mt-2 font-mono-num text-[11px] ${
                          picked ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {pres.yearsInOffice}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedHistoricalPresident && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
                      <UserCheck
                        className="h-3.5 w-3.5 text-[#132238]"
                        aria-hidden="true"
                      />
                      <span className="font-semibold text-stone-900">
                        {selectedHistoricalPresident.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedHistoricalPresident.party}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedHistoricalPresident.priorRole}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-700">
                      {selectedHistoricalPresident.summary}
                    </p>
                    <p className="text-xs leading-relaxed text-stone-600">
                      <span className="font-semibold text-stone-800">
                        Governing Doctrine:
                      </span>{' '}
                      {selectedHistoricalPresident.governingDoctrine}
                    </p>
                    {ticketSyncedNotice && (
                      <p className="pt-1 text-xs font-semibold text-emerald-700">
                        {ticketSyncedNotice}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleApplyHistoricalTicket(selectedHistoricalPresident)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#132238] bg-white px-3.5 py-2 text-xs font-semibold text-[#132238] hover:bg-[#132238] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Align Real-Life VP, Cabinet &amp; Chiefs</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {candidateMode === 'custom' && (
            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4 space-y-3 border-b border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label
                    htmlFor="custom-president-preset"
                    className="block text-sm font-semibold text-stone-800"
                  >
                    Custom Select Your President (or Quick-Fill from 50 Real-Life Figures)
                  </label>
                  <p className="text-xs text-stone-500">
                    Type any custom President below, or pick any of the 50 real-life
                    Presidents &amp; figures to customize their party, coalition, VP,
                    Cabinet &amp; Chiefs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  id="custom-president-preset"
                  value={
                    HISTORICAL_PRESIDENTS.find(
                      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
                    )?.id || ''
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectCustomPresetPresident(e.target.value);
                    }
                  }}
                  className="flex-1 min-w-[260px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-[#132238] focus:outline-none"
                >
                  <option value="">
                    -- Quick-Select Any of 50 Real-Life Presidents / Figures --
                  </option>
                  {HISTORICAL_PRESIDENTS.map((pres) => (
                    <option key={pres.id} value={pres.id}>
                      {pres.name} ({pres.orderLabel} · {pres.party} ·{' '}
                      {pres.yearsInOffice})
                    </option>
                  ))}
                </select>

                {selectedHistoricalPresident && (
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyHistoricalTicket(selectedHistoricalPresident)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#132238] bg-white px-3 py-2 text-xs font-semibold text-[#132238] hover:bg-[#132238] hover:text-white transition-colors whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Align Real-Life VP, Cabinet &amp; Chiefs</span>
                  </button>
                )}
              </div>

              {ticketSyncedNotice && (
                <p className="text-xs font-semibold text-emerald-700">
                  {ticketSyncedNotice}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="president-name"
                className="block text-sm font-semibold text-stone-800"
              >
                President Name
              </label>
              <input
                id="president-name"
                type="text"
                required
                maxLength={48}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter any real-life or custom President name"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-sm font-semibold text-stone-800">
                Term Duration
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setTermLength(48)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    termLength === 48
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Full Term (48 Months)
                </button>
                <button
                  type="button"
                  onClick={() => setTermLength(12)}
                  className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    termLength === 12
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  First-Year Sprint (12 Months)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="administration-motto"
                className="block text-sm font-semibold text-stone-800"
              >
                Administration Motto / Doctrine Slogan (Optional)
              </label>
              <input
                id="administration-motto"
                type="text"
                maxLength={72}
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="e.g., Rebuild Main Street, Restore Credibility"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="block text-sm font-semibold text-stone-800">
                  Difficulty Setting
                </span>
                <span className="text-xs text-stone-500">
                  Controls starting approval headwinds, metric volatility, scandal rate, and operational odds
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                {GAME_DIFFICULTIES.map((diff) => {
                  const active = gameDifficulty === diff.id;
                  const accentClass =
                    diff.id === 'easy'
                      ? active
                        ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                      : diff.id === 'hard'
                      ? active
                        ? 'border-red-700 bg-red-50/70 ring-1 ring-red-700'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                      : active
                      ? 'border-[#132238] bg-[#132238]/[0.04] ring-1 ring-[#132238]'
                      : 'border-stone-200 bg-white hover:border-stone-300';
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setGameDifficulty(diff.id)}
                      className={`rounded-lg border p-3.5 text-left transition-colors flex flex-col justify-between ${accentClass}`}
                    >
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-bold text-stone-900">
                            {diff.label}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500">
                            {diff.subtitle}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-stone-600">
                          {diff.description}
                        </p>
                      </div>
                      <p className="mt-2.5 border-t border-stone-100 pt-2 font-mono-num text-[11px] font-semibold text-[#132238]">
                        {diff.shortTrait}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="block text-sm font-semibold text-stone-800">
                  Political Climate &amp; Governance Posture
                </span>
                <span className="text-xs text-stone-500">
                  Shapes Day-1 Capitol leverage, voter bloc mood, and press dynamics
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {POLITICAL_CLIMATE_MODES.map((mode) => {
                  const active = difficultyMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDifficultyMode(mode.id)}
                      className={`rounded-lg border p-3 text-left transition-colors flex flex-col justify-between ${
                        active
                          ? 'border-[#132238] bg-[#132238]/[0.04] ring-1 ring-[#132238]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          {mode.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-600">
                          {mode.description}
                        </p>
                      </div>
                      <p className="mt-2 border-t border-stone-100 pt-1.5 font-mono-num text-[11px] font-semibold text-[#132238]">
                        {mode.shortTrait}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <span className="block text-sm font-semibold text-stone-800">
              Political Party
            </span>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
              {PARTIES.map((p) => {
                const active = party === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setParty(p.id)}
                    className={`rounded-lg border p-4 text-left transition-colors flex flex-col justify-between ${
                      active
                        ? p.activeCardClass
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-stone-900">
                          {p.label}
                        </span>
                        <span
                          className={`rounded border px-2 py-0.5 font-mono-num text-[11px] font-bold ${p.badgeClass}`}
                        >
                          {p.shortCode}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                        {p.summary}
                      </p>
                    </div>
                    <p className="mt-3 border-t border-stone-200/70 pt-2 font-mono-num text-[11px] font-semibold text-[#132238]">
                      {p.trait}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <span className="block text-sm font-semibold text-stone-800">
                Governing Coalition
              </span>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {COALITIONS.map((c) => {
                  const active = coalition === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCoalition(c.id)}
                      className={`rounded-lg border p-3.5 text-left transition-colors ${
                        active
                          ? 'border-[#132238] bg-[#132238]/[0.04]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-stone-900">
                        {c.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        {c.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-stone-800">
                Prior Background
              </span>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {BACKGROUNDS.map((b) => {
                  const active = background === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBackground(b.id)}
                      className={`rounded-lg border p-3.5 text-left transition-colors ${
                        active
                          ? 'border-[#132238] bg-[#132238]/[0.04]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-stone-900">
                        {b.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        {b.trait}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Assemble Vice President, Cabinet, Military Chief & Advisors */}
        <section
          id="administration-roster"
          className="rounded-xl border border-stone-200 bg-white p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-medium text-stone-500">
                02. Assemble Your Administration · 50 Real-Life Options Per Role
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
                Choose your Vice President, Cabinet, Military Chief &amp; Advisors
              </h2>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              Reset Recommended Ticket
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Roster List */}
            <div className="lg:col-span-5 space-y-1.5">
              {ROSTER_SLOT_ORDER.map((slot) => {
                const isSelected = activeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setActiveSlot(slot.id);
                      setRosterSearch('');
                    }}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-[#132238] bg-[#132238] text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-[11px] font-medium ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {slot.label} (50)
                      </p>
                      <p className="text-sm font-semibold truncate">
                        {getSlotSummaryName(slot.id)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium shrink-0 ${
                        isSelected ? 'text-stone-200' : 'text-stone-500'
                      }`}
                    >
                      Change
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Candidate Picker */}
            <div className="lg:col-span-7 rounded-xl border border-stone-200 bg-stone-50 p-5 md:p-6 space-y-4">
              {/* Shared live search bar across 50 choices per slot */}
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Filter 50 real-life nominees by name, doctrine, or era..."
                  className="w-full rounded-lg border border-stone-300 bg-white pl-8 pr-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                />
              </div>

              {activeSlot === 'vp' && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <p className="text-xs font-medium text-stone-500">
                        Running Mate &amp; Senate Tie-Breaker
                      </p>
                      <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                        Select Vice President
                      </h3>
                    </div>
                    <span className="font-mono-num text-xs font-medium text-stone-500">
                      {filteredVpCandidates.length} / {VP_CANDIDATES.length}{' '}
                      real-life options
                    </span>
                  </div>

                  <div className="max-h-[440px] overflow-y-auto pr-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredVpCandidates.map((vp) => {
                      const picked = selectedVpId === vp.id;
                      return (
                        <button
                          key={vp.id}
                          type="button"
                          onClick={() => setSelectedVpId(vp.id)}
                          className={`rounded-lg border p-4 text-left transition-colors flex flex-col justify-between ${
                            picked
                              ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-stone-900">
                                  {vp.name}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {vp.formerTitle} · {vp.leaning}
                                </p>
                              </div>
                              {picked && (
                                <Check
                                  className="h-4 w-4 shrink-0 text-[#132238]"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-stone-600">
                              {vp.bio}
                            </p>
                          </div>
                          <p className="mt-3 border-t border-stone-100 pt-2 font-mono-num text-[11px] font-semibold text-[#132238]">
                            {vp.bonusLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-stone-200 pt-3">
                    <label
                      htmlFor="custom-vp-name"
                      className="block text-xs font-semibold text-stone-700"
                    >
                      Optional: Custom Vice President Name (inherits selected
                      archetype bonuses)
                    </label>
                    <input
                      id="custom-vp-name"
                      type="text"
                      maxLength={48}
                      value={customVpName}
                      onChange={(e) => setCustomVpName(e.target.value)}
                      placeholder="Leave blank to use selected real-life nominee name"
                      className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {activeSlot === 'jcs' && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <p className="text-xs font-medium text-stone-500">
                        Pentagon Military Command
                      </p>
                      <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                        Select Chair of the Joint Chiefs of Staff
                      </h3>
                    </div>
                    <span className="font-mono-num text-xs font-medium text-stone-500">
                      {filteredJcsCandidates.length} /{' '}
                      {JOINT_CHIEFS_CANDIDATES.length} real-life chiefs
                    </span>
                  </div>

                  <div className="max-h-[460px] overflow-y-auto pr-1 space-y-3">
                    {filteredJcsCandidates.map((jcs) => {
                      const picked = selectedJcsId === jcs.id;
                      return (
                        <button
                          key={jcs.id}
                          type="button"
                          onClick={() => setSelectedJcsId(jcs.id)}
                          className={`w-full rounded-lg border p-4 text-left transition-colors ${
                            picked
                              ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-stone-900">
                                {jcs.name}
                              </p>
                              <p className="text-xs text-stone-500">
                                {jcs.branch} · {jcs.leaning}
                              </p>
                            </div>
                            {picked && (
                              <Check
                                className="h-4 w-4 shrink-0 text-[#132238]"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-stone-600">
                            {jcs.bio}
                          </p>
                          <p className="mt-2.5 font-mono-num text-[11px] font-semibold text-[#132238]">
                            {jcs.bonusLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {activeSlot !== 'vp' &&
                activeSlot !== 'jcs' &&
                (() => {
                  const deptInfo = CABINET_ROSTER_OPTIONS[activeSlot];
                  const filteredCab = normalizedRosterQuery
                    ? deptInfo.candidates.filter(
                        (c) =>
                          c.name.toLowerCase().includes(normalizedRosterQuery) ||
                          c.leaning
                            .toLowerCase()
                            .includes(normalizedRosterQuery) ||
                          c.bio.toLowerCase().includes(normalizedRosterQuery)
                      )
                    : deptInfo.candidates;

                  return (
                    <>
                      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-200 pb-3">
                        <div>
                          <p className="text-xs font-medium text-stone-500">
                            Cabinet &amp; Senior Advisory Appointment
                          </p>
                          <h3 className="mt-0.5 font-display text-xl font-semibold text-stone-900">
                            Select {deptInfo.roleTitle}
                          </h3>
                        </div>
                        <span className="font-mono-num text-xs font-medium text-stone-500">
                          {filteredCab.length} / {deptInfo.candidates.length}{' '}
                          real-life choices
                        </span>
                      </div>

                      <div className="max-h-[460px] overflow-y-auto pr-1 space-y-3">
                        {filteredCab.map((cand) => {
                          const picked =
                            selectedCabinetIds[activeSlot] === cand.id;
                          return (
                            <button
                              key={cand.id}
                              type="button"
                              onClick={() =>
                                setSelectedCabinetIds((prev) => ({
                                  ...prev,
                                  [activeSlot]: cand.id,
                                }))
                              }
                              className={`w-full rounded-lg border p-4 text-left transition-colors ${
                                picked
                                  ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                                  : 'border-stone-200 bg-white hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-stone-900">
                                    {cand.name}
                                  </p>
                                  <p className="text-xs text-stone-500">
                                    {cand.leaning} · Loyalty{' '}
                                    <span className="font-mono-num">
                                      {cand.loyalty}%
                                    </span>{' '}
                                    · Competence{' '}
                                    <span className="font-mono-num">
                                      {cand.competence}%
                                    </span>
                                  </p>
                                </div>
                                {picked && (
                                  <Check
                                    className="h-4 w-4 shrink-0 text-[#132238]"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                                {cand.bio}
                              </p>
                              <p className="mt-2.5 font-mono-num text-[11px] font-semibold text-[#132238]">
                                {cand.bonusLabel}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
            </div>
          </div>
        </section>

        {/* Step 3: Scenarios */}
        <section
          id="starting-scenarios"
          className="rounded-xl border border-stone-200 bg-white p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <p className="text-xs font-medium text-stone-500">
                03. Starting Political Climate
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
                Select your inaugural crisis
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => setScenarioMode('preset')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  scenarioMode === 'preset'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Preset Climates ({SCENARIOS.length})
              </button>
              <button
                type="button"
                onClick={() => setScenarioMode('historical')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  scenarioMode === 'historical'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Historical Scenarios ({HISTORICAL_SCENARIOS.length})
              </button>
              <button
                type="button"
                onClick={() => setScenarioMode('custom')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  scenarioMode === 'custom'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Custom Scenario (2000–2026)
              </button>
            </div>
          </div>

          {scenarioMode === 'preset' ? (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
                  {(
                    [
                      { id: 'all', label: `All Climates (${SCENARIOS.length})` },
                      { id: 'tech_economy', label: 'AI, Tech & Economy' },
                      { id: 'geopolitics_crisis', label: 'Geopolitics & Crisis' },
                      { id: 'governance_fiscal', label: 'Governance & Fiscal' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setClimateFilter(tab.id);
                        if (tab.id !== 'all') {
                          const current = SCENARIOS.find(
                            (s) => s.id === selectedScenarioId
                          );
                          if (current?.climateCategory !== tab.id) {
                            const firstInCategory = SCENARIOS.find(
                              (s) => s.climateCategory === tab.id
                            );
                            if (firstInCategory) {
                              setSelectedScenarioId(firstInCategory.id);
                            }
                          }
                        }
                      }}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                        climateFilter === tab.id
                          ? 'bg-white text-[#132238] shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-stone-500">
                  Select a national backdrop including The AI Age, Cold War, and Fiscal Reckoning
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {SCENARIOS.filter(
                  (sc) =>
                    climateFilter === 'all' ||
                    sc.climateCategory === climateFilter
                ).map((sc) => {
                  const selected = selectedScenarioId === sc.id;
                  const imgFailed = failedScenarioImgs[sc.id];
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-[#132238] ring-1 ring-[#132238] bg-[#132238]/[0.02]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-200">
                        {imgFailed ? (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#132238] to-stone-700 p-4 text-center text-white">
                            <Landmark className="h-8 w-8 text-[#C99A3B]" />
                            <span className="mt-2 text-xs font-medium">
                              {sc.title}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={sc.imageUrl}
                            alt={sc.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedScenarioImgs((prev) => ({
                                ...prev,
                                [sc.id]: true,
                              }))
                            }
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <p className="text-[11px] font-medium text-stone-500">
                            {sc.eraLabel}
                          </p>
                          <h3 className="mt-1 font-display text-lg font-semibold text-stone-900">
                            {sc.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                            {sc.description}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3 text-xs">
                          <div>
                            <span className="block text-[11px] text-stone-500">
                              Approval
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.approval}%
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-stone-500">
                              Inflation
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.inflation}%
                            </span>
                          </div>
                          <div>
                            <span className="block text-[11px] text-stone-500">
                              GDP
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.gdpGrowth}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : scenarioMode === 'historical' ? (
            <div className="mt-6 space-y-5">
              {/* Historical Mode Context & 1-Click Ticket Sync */}
              {(() => {
                const recPres = HISTORICAL_PRESIDENTS.find(
                  (p) => p.id === activeHistoricalScenario.recommendedPresidentId
                );
                const isAlreadySynced =
                  recPres &&
                  name.trim().toLowerCase() === recPres.name.toLowerCase();
                return (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <p className="text-xs font-semibold text-[#132238]">
                        Historical Scenarios Mode · Era-Accurate Congress, Macro &amp; News Benchmarks
                      </p>
                      <p className="text-xs leading-relaxed text-stone-600">
                        Command landmark American crises from the 1933 Great Depression to the 1962 Cuban Missile Crisis and 1979 Oil Shock with real-world unemployment, inflation, congressional seat splits, and historically grounded headlines.
                      </p>
                      {activeHistoricalScenario.historicalBenchmarkNote && (
                        <p className="text-[11px] leading-relaxed text-stone-500 pt-0.5">
                          <span className="font-semibold text-stone-700">
                            Selected Era Benchmark:
                          </span>{' '}
                          {activeHistoricalScenario.historicalBenchmarkNote}
                        </p>
                      )}
                    </div>
                    {recPres && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSyncHistoricalScenarioTicket(
                            activeHistoricalScenario
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#132238] bg-[#132238] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] whitespace-nowrap shrink-0"
                      >
                        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {isAlreadySynced
                            ? `Synced: ${recPres.name} (${activeHistoricalScenario.historicalYear} Ticket)`
                            : `Load ${activeHistoricalScenario.historicalYear} Ticket: ${recPres.name}`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {HISTORICAL_SCENARIOS.map((sc) => {
                  const selected = selectedHistoricalScenarioId === sc.id;
                  const imgFailed = failedScenarioImgs[sc.id];
                  const recPres = HISTORICAL_PRESIDENTS.find(
                    (p) => p.id === sc.recommendedPresidentId
                  );
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedHistoricalScenarioId(sc.id)}
                      className={`flex flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-[#132238] ring-1 ring-[#132238] bg-[#132238]/[0.02]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-200">
                        {imgFailed ? (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#132238] to-stone-700 p-4 text-center text-white">
                            <Landmark className="h-8 w-8 text-[#C99A3B]" />
                            <span className="mt-2 text-xs font-medium">
                              {sc.title}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={sc.imageUrl}
                            alt={sc.title}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedScenarioImgs((prev) => ({
                                ...prev,
                                [sc.id]: true,
                              }))
                            }
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono-num text-[11px] font-semibold text-[#8B1E24]">
                              {sc.historicalEraTag || sc.eraLabel}
                            </p>
                            {recPres && (
                              <span className="text-[11px] font-medium text-stone-500 truncate">
                                {recPres.name}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-1 font-display text-lg font-semibold text-stone-900">
                            {sc.title}
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                            {sc.description}
                          </p>
                          {sc.historicalKeyEvents &&
                            sc.historicalKeyEvents.length > 0 && (
                              <ul className="mt-2.5 space-y-1 border-t border-stone-100 pt-2 text-[11px] text-stone-600">
                                {sc.historicalKeyEvents.map((evt) => (
                                  <li key={evt} className="truncate">
                                    · {evt}
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-stone-100 pt-3 text-xs">
                          <div>
                            <span className="block text-[10px] text-stone-500">
                              Approval
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.approval}%
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-stone-500">
                              Jobless
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.unemployment}%
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-stone-500">
                              CPI
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.inflation}%
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-stone-500">
                              Congress
                            </span>
                            <span className="font-mono-num font-semibold text-stone-900">
                              {sc.initialMetrics.houseSeats}H
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* Year Range 2000–2026 Selector */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                      <Calendar className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                      <span>Timeline Year (2000–2026)</span>
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">
                      Inauguration Year:{' '}
                      <span className="font-mono-num text-[#132238]">
                        {customStartYear}
                      </span>{' '}
                      <span className="text-sm font-normal text-stone-500">
                        · {currentEraOverview.eraLabel}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeCustomYear(customStartYear - 1)}
                      disabled={customStartYear <= 2000}
                      aria-label="Previous year"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    <select
                      aria-label="Select inauguration year between 2000 and 2026"
                      value={customStartYear}
                      onChange={(e) =>
                        handleChangeCustomYear(Number(e.target.value))
                      }
                      className="h-9 rounded-lg border border-stone-300 bg-white px-3 font-mono-num text-sm font-semibold text-[#132238] focus:border-[#132238] focus:outline-none"
                    >
                      {YEARS_2000_TO_2026.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleChangeCustomYear(customStartYear + 1)}
                      disabled={customStartYear >= 2026}
                      aria-label="Next year"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min={2000}
                    max={2026}
                    step={1}
                    aria-label="Timeline year slider from 2000 to 2026"
                    value={customStartYear}
                    onChange={(e) =>
                      handleChangeCustomYear(Number(e.target.value))
                    }
                    className="w-full accent-[#132238] cursor-pointer"
                  />
                  <div className="mt-1 flex justify-between font-mono-num text-[11px] text-stone-500">
                    <span>2000</span>
                    <span>2005</span>
                    <span>2010</span>
                    <span>2015</span>
                    <span>2020</span>
                    <span>2026</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="mr-1 text-xs font-medium text-stone-500">
                    Key Years:
                  </span>
                  {QUICK_MILESTONE_YEARS.map((yr) => {
                    const active = customStartYear === yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => handleChangeCustomYear(yr, true)}
                        className={`rounded-md border px-2.5 py-1 font-mono-num text-xs font-semibold transition-colors ${
                          active
                            ? 'border-[#132238] bg-[#132238] text-white'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-3">
                  <p className="text-xs leading-relaxed text-stone-600 max-w-3xl">
                    <span className="font-semibold text-stone-800">
                      {customStartYear} Historical Climate:
                    </span>{' '}
                    {currentEraOverview.macroSnapshot}
                  </p>
                  {premiseEditedManually && (
                    <button
                      type="button"
                      onClick={() =>
                        handleChangeCustomYear(customStartYear, true)
                      }
                      className="text-xs font-semibold text-[#132238] hover:underline whitespace-nowrap shrink-0"
                    >
                      Load {customStartYear} Era Premise
                    </button>
                  )}
                </div>
              </div>

              {/* Historical Era Scenario Blueprints (2000–2026) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-800">
                    2000–2026 Scenario Templates (click any era to load &amp;
                    customize)
                  </span>
                  <span className="text-xs text-stone-500">
                    Works with any former President or custom candidate
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CUSTOM_ERA_BLUEPRINTS.map((bp) => {
                    const picked = customStartYear === bp.year;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => {
                          setCustomStartYear(bp.year);
                          setCustomPremise(bp.premise);
                          setPremiseEditedManually(false);
                        }}
                        className={`rounded-lg border p-3.5 text-left transition-colors ${
                          picked
                            ? 'border-[#132238] bg-[#132238]/[0.04] ring-1 ring-[#132238]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono-num text-xs font-bold text-[#132238]">
                            {bp.year}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500 truncate">
                            {bp.eraTag}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-stone-900">
                          {bp.title.replace(/^\d{4}\s*·\s*/, '')}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-stone-600 line-clamp-2">
                          {bp.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable Premise */}
              <div className="space-y-2">
                <label
                  htmlFor="custom-premise"
                  className="block text-sm font-semibold text-stone-800"
                >
                  Customize Your {customStartYear} Starting Crisis &amp; Premise
                </label>
                <textarea
                  id="custom-premise"
                  rows={4}
                  required={scenarioMode === 'custom'}
                  value={customPremise}
                  onChange={(e) => {
                    setCustomPremise(e.target.value);
                    setPremiseEditedManually(true);
                  }}
                  placeholder="Describe any scenario from 2000 to 2026—change Congress, inflation, foreign crises, or alternate history..."
                  className="w-full rounded-lg border border-stone-300 bg-white p-4 text-sm leading-relaxed text-stone-900 focus:border-[#132238] focus:outline-none"
                />
                <p className="text-xs text-stone-500">
                  The simulation generates realistic {customStartYear}{' '}
                  macroeconomic baselines (GDP, CPI, Fed rate, debt, Congress
                  seats) and a Month 1 dossier tailored to President{' '}
                  <span className="font-semibold text-stone-700">
                    {name.trim() || 'your candidate'}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
            <p className="text-sm text-stone-600">
              Launching{' '}
              <span className="font-semibold text-stone-900">
                President {name.trim() || 'Jordan Mercer'} (
                {getPartyMeta(party, coalition).shortCode} ·{' '}
                {getPartyMeta(party, coalition).label})
              </span>{' '}
              in{' '}
              <span className="font-semibold text-[#132238]">
                {scenarioMode === 'custom'
                  ? `Jan ${customStartYear} Custom Climate`
                  : scenarioMode === 'historical'
                  ? `${activeHistoricalScenario.title}`
                  : SCENARIOS.find((s) => s.id === selectedScenarioId)?.title ??
                    'Preset Climate'}
              </span>{' '}
              <span className="text-stone-500">
                (
                {GAME_DIFFICULTIES.find((d) => d.id === gameDifficulty)?.label ??
                  'Medium'}{' '}
                ·{' '}
                {POLITICAL_CLIMATE_MODES.find((m) => m.id === difficultyMode)
                  ?.label ?? 'Balanced Cycle'}
                )
              </span>{' '}
              with selected VP, Cabinet &amp; Military bonuses active on Day 1.
            </p>
            <button
              type="submit"
              disabled={isLoadingCustom}
              className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <span>
                {isLoadingCustom
                  ? `Drafting ${scenarioMode === 'custom' ? customStartYear : ''} Briefing...`
                  : 'Take the Oath & Start Term'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </form>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-medium text-stone-500">01. Hand-Picked Team</p>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-stone-900">
            Select your leadership bench
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Choose your Vice President, eight Cabinet &amp; senior advisor seats,
            and Chair of the Joint Chiefs—or reshuffle secretaries mid-term.
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-medium text-stone-500">
            02. Free-Form Directives
          </p>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-stone-900">
            Write any policy you imagine
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Draft exact executive orders, tax compromises, military
            deployments, or diplomatic deals—and pair them with your speech.
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-medium text-stone-500">
            03. Windows 11 Desktop Ready
          </p>
          <h3 className="mt-1.5 font-display text-lg font-semibold text-stone-900">
            Pin to your taskbar
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Download the Windows 11 Setup package or install directly via
            Microsoft Edge or Chrome for Start Menu, Desktop, and standalone
            window support.
          </p>
        </div>
      </section>
    </main>
  );
};
