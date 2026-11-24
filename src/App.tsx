import { useEffect, useState } from 'react';
import {
  AppointeeBonuses,
  BattlegroundStateProjection,
  BudgetAllocationInput,
  BudgetProjection,
  CabinetConfirmationResult,
  CabinetDepartment,
  CabinetHarmonyOutcome,
  CabinetMember,
  CabinetScandalDecision,
  CabinetScandalEvent,
  CapitolWhipOption,
  CareerEvaluation,
  ClassifiedIntelBrief,
  DiplomaticMission,
  DiplomaticMissionFocus,
  DiplomaticSummitOutcome,
  EmergencyAlertEvent,
  EmergencyResolutionRecord,
  EmergencyResponseOption,
  ExecutedPowerRecord,
  ExecutivePowerDefinition,
  FedConsultOption,
  FireOfficialRequest,
  GamePhase,
  ImpeachmentResult,
  ImpeachmentStrategy,
  InstitutionalState,
  JcsConfirmationResult,
  JudicialNominationOption,
  LegislativeRecordItem,
  LibrarySynthesis,
  MilestoneItem,
  MilitaryCommandState,
  MilitaryMedalAwardRecord,
  MilitaryMedalDefinition,
  MilitaryPromotionRecord,
  MilitaryServiceBranch,
  MilitaryServiceMember,
  MonthlyBriefing,
  NationalMetrics,
  NewsHeadlineItem,
  OfficialDismissalResult,
  PartyId,
  PresidentProfile,
  PressConferenceQuestion,
  PressConferenceQuestionResult,
  PressConferenceSummary,
  PublicStatementResult,
  ReelectionCampaignState,
  RegionalTheaterId,
  SavedCareerState,
  ScenarioDefinition,
  SituationRoomResult,
  SituationScenarioType,
  StabilityMetricKey,
  StateOfTheUnionResult,
  StatementVenue,
  TermHistoryEntry,
  TheaterSecurityEventDefinition,
  TheaterSecurityEventOutcome,
  TheaterUnitAssignment,
  TheaterUnitPosture,
  TurnOutcome,
  UnscriptedActionResult,
  UnscriptedActionVisibility,
  VetoChallengeResult,
  VicePresidentProfile,
  VoterBlocs,
  VpNominationResult,
  WorkspaceTab,
  AdminSuiteState,
} from './types/game';
import { createDefaultAdminSuiteState } from './data/executiveSuite';
import {
  computeTheaterInfluence,
  createDefaultTheaterAssignments,
  DEPLOYABLE_MILITARY_UNITS,
  REGIONAL_THEATERS,
  resolveCountryToTheater,
} from './data/regionalTheaters';
import {
  canAwardMedalToMember,
  createInitialMilitaryRoster,
  getMedalDisplayName,
  getServiceRankInfo,
  getTopEligibleMedalForMember,
  MAX_RANK_GRADE_INDEX,
  MILITARY_SERVICES,
  recruitMilitaryPersonnel,
} from './data/militaryPromotions';
import {
  buildEmergencyAlertForMetric,
  evaluateInstitutionalStability,
  findNextUnaddressedEmergency,
} from './data/institutionalStability';
import {
  DEFAULT_CABINET,
  DEFAULT_VP,
  getGameDifficulty,
  getPoliticalClimateMode,
  INSTITUTIONS_PRESET,
  MILITARY_OPERATIONS_PRESET,
  resolvePartyId,
  SCENARIOS,
} from './data/scenarios';
import { DEBATE_MATCHUPS } from './data/debates';
import { shiftJudiciaryClimate } from './data/institutionalActions';
import { HeaderBar } from './components/HeaderBar';
import {
  SelectedAdministration,
  TitleSetup,
} from './components/TitleSetup';
import { BriefingDesk } from './components/BriefingDesk';
import { PresidentialDebateModal } from './components/PresidentialDebateModal';
import { PresidentialPardonsModal } from './components/PresidentialPardonsModal';
import { SupremeCourtModal } from './components/SupremeCourtModal';
import { TradePolicyModal } from './components/TradePolicyModal';
import { WhiteHouseToursModal } from './components/WhiteHouseToursModal';
import {
  INITIAL_SUPREME_COURT_BENCH,
  SupremeCourtJustice,
} from './data/supremeCourt';
import { DEFAULT_TRADE_STANCES, TradePostureId } from './data/tradeWar';
import {
  ScheduledWhiteHouseTourRecord,
  TourScreeningPosture,
  WhiteHouseTourGroup,
} from './data/whiteHouseTours';
import {
  NuclearStrikeProfileId,
  NuclearStrikeRecord,
  NuclearTargetCategory,
  evaluateNuclearStrike,
} from './data/nuclearCommand';
import { PressAndPolls } from './components/PressAndPolls';
import { CabinetView } from './components/CabinetView';
import { SituationRoomView } from './components/SituationRoomView';
import { PolicyArchiveView } from './components/PolicyArchiveView';
import { PresidentialLibraryView } from './components/PresidentialLibraryView';
import {
  CareerEndView,
  MidtermModal,
  ReelectionPromptModal,
} from './components/LegacyModal';
import { CabinetScandalModal } from './components/CabinetScandalModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { PressConferenceModal } from './components/PressConferenceModal';
import { StateOfTheUnionModal } from './components/StateOfTheUnionModal';
import { CapitolWhipModal } from './components/CapitolWhipModal';
import { BudgetAllocationModal } from './components/BudgetAllocationModal';
import { ImpeachmentModal, ResignModal } from './components/ImpeachmentModal';
import { ExecutivePowersHub } from './components/ExecutivePowersHub';
import { NominateJcsModal } from './components/NominateJcsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playDeskSound } from './utils/sound';
import { normalizeMonthlyBriefing } from './utils/briefingMemos';

function createDefaultCampaignState(): ReelectionCampaignState {
  return {
    decision: 'undecided',
    opponentName: '',
    opponentParty: '',
    campaignSlogan: '',
    campaignMomentum: 0,
    projectedVoteShare: 50,
    battlegroundEdge: 'Toss-Up',
    eventsHeld: 0,
  };
}

function computeCampaignProjection(
  metrics: NationalMetrics,
  momentum: number
): { projectedVoteShare: number; battlegroundEdge: string } {
  const econBoost =
    (metrics.gdpGrowth - 2.0) * 1.4 - Math.max(0, metrics.inflation - 2.8) * 1.1;
  const rawShare =
    49.5 + (metrics.approval - 49) * 0.42 + econBoost + momentum * 0.25;
  const projectedVoteShare = clamp(Number(rawShare.toFixed(1)), 34, 66);
  const battlegroundEdge =
    projectedVoteShare >= 53.5
      ? 'Likely Incumbent'
      : projectedVoteShare >= 51.0
      ? 'Lean Incumbent'
      : projectedVoteShare >= 48.8
      ? 'Toss-Up'
      : projectedVoteShare >= 46.5
      ? 'Lean Challenger'
      : 'Likely Challenger';
  return { projectedVoteShare, battlegroundEdge };
}

function pickChallengerForParty(
  party: PartyId,
  presidentName: string
): { opponentName: string; opponentParty: string; campaignSlogan: string } {
  if (party === 'democratic') {
    return {
      opponentName: 'Gov. Garrett Vance',
      opponentParty: 'Republican',
      campaignSlogan: `Finish the Job · ${presidentName}`,
    };
  }
  if (party === 'republican') {
    return {
      opponentName: 'Sen. Maya Alvarez',
      opponentParty: 'Democratic',
      campaignSlogan: `Strength & Renewal · ${presidentName}`,
    };
  }
  return {
    opponentName: 'Sen. Thomas Reid',
    opponentParty: 'National Coalition',
    campaignSlogan: `Country Over Party · ${presidentName}`,
  };
}

const STORAGE_KEY = 'executive_term_saved_career_v4';
const LIBRARY_ARCHIVE_KEY = 'executive_term_library_archives_v1';

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function mergeNewsStories(
  existing: NewsHeadlineItem[],
  incoming: NewsHeadlineItem[]
): NewsHeadlineItem[] {
  const seen = new Set(
    existing.map((item) => item.headline.trim().toLowerCase())
  );
  const uniqueIncoming: NewsHeadlineItem[] = [];
  for (const item of incoming) {
    const key = (item.headline || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueIncoming.push(item);
  }
  return [...existing, ...uniqueIncoming].slice(-80);
}

async function parseJsonResponse<T>(
  res: Response,
  fallbackError: string
): Promise<T> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error(
      `${fallbackError} The server connection dropped before returning data (empty response, HTTP ${res.status}).`
    );
  }
  if (trimmed.startsWith('<') || contentType.includes('text/html')) {
    throw new Error(
      `The simulation server returned an unexpected HTML response (HTTP ${res.status}). The request may have timed out or the server is still starting—please try again.`
    );
  }
  let parsed: T & { error?: string };
  try {
    parsed = JSON.parse(trimmed) as T & { error?: string };
  } catch {
    throw new Error(
      `${fallbackError} (invalid JSON response, HTTP ${res.status}).`
    );
  }
  if (!res.ok || (parsed && typeof parsed === 'object' && parsed.error)) {
    throw new Error(parsed.error || `${fallbackError} (HTTP ${res.status}).`);
  }
  return parsed;
}

async function waitForSimulationBackend(maxWaitMs = 10000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const healthRes = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const ct = (healthRes.headers.get('content-type') || '').toLowerCase();
      if (healthRes.ok && ct.includes('application/json')) {
        const data = (await healthRes.json()) as { ok?: boolean };
        if (data?.ok) return;
      }
    } catch {
      // Server still booting or proxy reconnecting
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function postSimulationApi<T>(
  url: string,
  body: unknown,
  fallbackError: string
): Promise<T> {
  const maxAttempts = 4;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 75000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);
      return await parseJsonResponse<T>(res, fallbackError);
    } catch (err) {
      window.clearTimeout(timeoutId);
      lastError = err;
      const msg = err instanceof Error ? err.message : '';
      const isTransient =
        msg.includes('empty response') ||
        msg.includes('unexpected HTML response') ||
        msg.includes('Failed to fetch') ||
        msg.includes('Load failed') ||
        msg.includes('NetworkError') ||
        msg.includes('HTTP 502') ||
        msg.includes('HTTP 503') ||
        msg.includes('HTTP 504');
      if (attempt < maxAttempts && isTransient) {
        await waitForSimulationBackend(attempt === 1 ? 4500 : 8000);
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        continue;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(
          `${fallbackError} The request timed out after 75 seconds. Please try again.`
        );
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(fallbackError);
}

function applyDeltas(
  metrics: NationalMetrics,
  blocs: VoterBlocs,
  outcome: TurnOutcome,
  gameDifficulty?: string
): { nextMetrics: NationalMetrics; nextBlocs: VoterBlocs } {
  const md = outcome.metricDeltas;
  const bd = outcome.voterBlocDeltas;
  const seatShift = outcome.midtermSeatShift;
  const diff = getGameDifficulty(gameDifficulty);

  const scalePoliticalDelta = (val: number) =>
    val >= 0 ? val * diff.gainMultiplier : val * diff.lossMultiplier;

  const nextMetrics: NationalMetrics = {
    approval: clamp(
      Number((metrics.approval + scalePoliticalDelta(md.approval)).toFixed(1)),
      0,
      95
    ),
    congressSupport: clamp(
      Number(
        (
          metrics.congressSupport + scalePoliticalDelta(md.congressSupport)
        ).toFixed(1)
      ),
      5,
      95
    ),
    gdpGrowth: clamp(
      Number((metrics.gdpGrowth + md.gdpGrowth).toFixed(2)),
      -15.0,
      22.0
    ),
    inflation: clamp(
      Number((metrics.inflation + md.inflation).toFixed(2)),
      -12.0,
      25.0
    ),
    unemployment: clamp(
      Number((metrics.unemployment + md.unemployment).toFixed(2)),
      1.0,
      30.0
    ),
    diplomaticStanding: clamp(
      Number(
        (
          metrics.diplomaticStanding +
          scalePoliticalDelta(md.diplomaticStanding)
        ).toFixed(1)
      ),
      5,
      100
    ),
    nationalDebtTrillions: Math.max(
      0.01,
      Number(
        (metrics.nationalDebtTrillions + md.nationalDebtTrillions).toFixed(2)
      )
    ),
    houseSeats: seatShift
      ? clamp(metrics.houseSeats + seatShift.houseDelta, 100, 340)
      : metrics.houseSeats,
    senateSeats: seatShift
      ? clamp(metrics.senateSeats + seatShift.senateDelta, 25, 75)
      : metrics.senateSeats,
  };

  const nextBlocs: VoterBlocs = {
    workingClass: clamp(
      Math.round(blocs.workingClass + bd.workingClass),
      5,
      95
    ),
    suburbanModerates: clamp(
      Math.round(blocs.suburbanModerates + bd.suburbanModerates),
      5,
      95
    ),
    techFinance: clamp(Math.round(blocs.techFinance + bd.techFinance), 5, 95),
    seniors: clamp(Math.round(blocs.seniors + bd.seniors), 5, 95),
    youngVoters: clamp(Math.round(blocs.youngVoters + bd.youngVoters), 5, 95),
  };

  return { nextMetrics, nextBlocs };
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE_SETUP');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('briefing');
  const [muted, setMuted] = useState(false);

  const [savedCareer, setSavedCareer] = useState<SavedCareerState | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedCareerState) : null;
    } catch {
      return null;
    }
  });

  const [pastLibraries, setPastLibraries] = useState<SavedCareerState[]>(() => {
    try {
      const raw = localStorage.getItem(LIBRARY_ARCHIVE_KEY);
      return raw ? (JSON.parse(raw) as SavedCareerState[]) : [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<PresidentProfile>({
    name: 'Jordan Mercer',
    party: 'democratic',
    coalition: 'center_left',
    background: 'governor',
    termLength: 48,
  });
  const [vicePresident, setVicePresident] =
    useState<VicePresidentProfile>(DEFAULT_VP);
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [scenarioTitle, setScenarioTitle] = useState<string>(SCENARIOS[0].title);
  const [customPremise, setCustomPremise] = useState<string | undefined>(
    undefined
  );
  const [initialMetrics, setInitialMetrics] = useState<NationalMetrics>(
    SCENARIOS[0].initialMetrics
  );
  const [metrics, setMetrics] = useState<NationalMetrics>(
    SCENARIOS[0].initialMetrics
  );
  const [blocs, setBlocs] = useState<VoterBlocs>(SCENARIOS[0].initialBlocs);
  const [cabinet, setCabinet] = useState<CabinetMember[]>(DEFAULT_CABINET);
  const [military, setMilitary] = useState<MilitaryCommandState>(
    MILITARY_OPERATIONS_PRESET.fragile_boom
  );
  const [militaryRoster, setMilitaryRoster] = useState<MilitaryServiceMember[]>(
    () => createInitialMilitaryRoster()
  );
  const [promotionHistory, setPromotionHistory] = useState<
    MilitaryPromotionRecord[]
  >([]);
  const [medalHistory, setMedalHistory] = useState<MilitaryMedalAwardRecord[]>(
    []
  );
  const [theaterAssignments, setTheaterAssignments] = useState<
    TheaterUnitAssignment[]
  >(() => createDefaultTheaterAssignments());
  const [resolvedTheaterEventMonths, setResolvedTheaterEventMonths] = useState<
    Partial<Record<RegionalTheaterId, number>>
  >({});
  const [latestTheaterEventOutcome, setLatestTheaterEventOutcome] =
    useState<TheaterSecurityEventOutcome | null>(null);
  const [adminSuite, setAdminSuite] = useState<AdminSuiteState>(
    () => createDefaultAdminSuiteState()
  );
  const [diplomaticMissions, setDiplomaticMissions] = useState<
    DiplomaticMission[]
  >([]);
  const [institutions, setInstitutions] = useState<InstitutionalState>(
    INSTITUTIONS_PRESET.fragile_boom
  );
  const [newsFeed, setNewsFeed] = useState<NewsHeadlineItem[]>(
    SCENARIOS[0].initialNews
  );
  const [legislativeRecords, setLegislativeRecords] = useState<
    LegislativeRecordItem[]
  >([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [librarySynthesis, setLibrarySynthesis] =
    useState<LibrarySynthesis | null>(null);

  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentBriefing, setCurrentBriefing] = useState<MonthlyBriefing>(
    SCENARIOS[0].initialBriefing
  );
  const [latestOutcome, setLatestOutcome] = useState<TurnOutcome | null>(null);
  const [history, setHistory] = useState<TermHistoryEntry[]>([]);
  const [evaluation, setEvaluation] = useState<CareerEvaluation | null>(null);
  const [collapseReason, setCollapseReason] = useState<string | undefined>(
    undefined
  );

  const [policyDraftText, setPolicyDraftText] = useState('');
  const [personalActionText, setPersonalActionText] = useState('');
  const [speechDraftText, setSpeechDraftText] = useState('');

  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [isLoadingEval, setIsLoadingEval] = useState(false);
  const [isSynthesizingLibrary, setIsSynthesizingLibrary] = useState(false);
  const [isIssuingStatement, setIsIssuingStatement] = useState(false);
  const [latestStatementResult, setLatestStatementResult] =
    useState<PublicStatementResult | null>(null);
  const [showPressConference, setShowPressConference] = useState(false);
  const [latestPressConferenceSummary, setLatestPressConferenceSummary] =
    useState<PressConferenceSummary | null>(null);
  const [isExecutingUnscriptedAction, setIsExecutingUnscriptedAction] =
    useState(false);
  const [latestUnscriptedResult, setLatestUnscriptedResult] =
    useState<UnscriptedActionResult | null>(null);
  const [isResolvingSituation, setIsResolvingSituation] = useState(false);
  const [latestSituationResult, setLatestSituationResult] =
    useState<SituationRoomResult | null>(null);
  const [latestVetoResult, setLatestVetoResult] =
    useState<VetoChallengeResult | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [replacingCabinetId, setReplacingCabinetId] =
    useState<CabinetDepartment | null>(null);
  const [lastConfirmationResult, setLastConfirmationResult] =
    useState<CabinetConfirmationResult | null>(null);
  const [isFiringOfficial, setIsFiringOfficial] = useState(false);
  const [latestDismissalResult, setLatestDismissalResult] =
    useState<OfficialDismissalResult | null>(null);
  const [isNominatingVp, setIsNominatingVp] = useState(false);
  const [lastVpConfirmation, setLastVpConfirmation] =
    useState<VpNominationResult | null>(null);
  const [isNominatingJcs, setIsNominatingJcs] = useState(false);
  const [showNominateJcsModal, setShowNominateJcsModal] = useState(false);
  const [lastJcsConfirmation, setLastJcsConfirmation] =
    useState<JcsConfirmationResult | null>(null);
  const [dismissedOtherOfficials, setDismissedOtherOfficials] = useState<
    string[]
  >([]);
  const [reelectionCampaign, setReelectionCampaign] =
    useState<ReelectionCampaignState>(createDefaultCampaignState);
  const [showDebateModal, setShowDebateModal] = useState(false);
  const [showPardonsModal, setShowPardonsModal] = useState(false);
  const [showSupremeCourtModal, setShowSupremeCourtModal] = useState(false);
  const [supremeCourtBench, setSupremeCourtBench] = useState<
    SupremeCourtJustice[]
  >(() => INITIAL_SUPREME_COURT_BENCH);
  const [resolvedCourtCaseIds, setResolvedCourtCaseIds] = useState<string[]>(
    []
  );
  const [showTradePolicyModal, setShowTradePolicyModal] = useState(false);
  const [tradeStances, setTradeStances] = useState<
    Record<string, TradePostureId>
  >(() => ({ ...DEFAULT_TRADE_STANCES }));
  const [lastTradeActionMonth, setLastTradeActionMonth] = useState<
    number | null
  >(null);
  const [showWhiteHouseToursModal, setShowWhiteHouseToursModal] =
    useState(false);
  const [lastWhiteHouseTourMonth, setLastWhiteHouseTourMonth] = useState<
    number | null
  >(null);
  const [whiteHouseTourHistory, setWhiteHouseTourHistory] = useState<
    ScheduledWhiteHouseTourRecord[]
  >([]);
  const [latestNuclearResult, setLatestNuclearResult] =
    useState<NuclearStrikeRecord | null>(null);
  const [nuclearStrikeHistory, setNuclearStrikeHistory] = useState<
    NuclearStrikeRecord[]
  >([]);
  const [secretServiceProtection, setSecretServiceProtection] =
    useState<boolean>(false);
  const [lastSecretServiceBudgetMonth, setLastSecretServiceBudgetMonth] =
    useState<number | null>(null);
  const [showReelectionPrompt, setShowReelectionPrompt] = useState(false);
  const [pendingScandal, setPendingScandal] =
    useState<CabinetScandalEvent | null>(null);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showImpeachmentModal, setShowImpeachmentModal] = useState(false);
  const [isRunningImpeachment, setIsRunningImpeachment] = useState(false);
  const [impeachmentResult, setImpeachmentResult] =
    useState<ImpeachmentResult | null>(null);
  const [impeachmentAutoPrompted, setImpeachmentAutoPrompted] = useState(false);
  const [activeEmergencyAlert, setActiveEmergencyAlert] =
    useState<EmergencyAlertEvent | null>(null);
  const [addressedStabilityMonths, setAddressedStabilityMonths] = useState<
    Partial<Record<StabilityMetricKey, number>>
  >({});
  const [emergencyResolutions, setEmergencyResolutions] = useState<
    EmergencyResolutionRecord[]
  >([]);
  const [executedPowers, setExecutedPowers] = useState<ExecutedPowerRecord[]>([]);
  const [showExecutivePowersHub, setShowExecutivePowersHub] = useState(false);
  const [harmonyMeetingMonths, setHarmonyMeetingMonths] = useState<
    Partial<Record<CabinetDepartment, number>>
  >({});
  const [latestHarmonyOutcome, setLatestHarmonyOutcome] =
    useState<CabinetHarmonyOutcome | null>(null);
  const [showSotuModal, setShowSotuModal] = useState(false);
  const [sotuDeliveredYears, setSotuDeliveredYears] = useState<number[]>([]);
  const [showWhipModal, setShowWhipModal] = useState(false);
  const [lastWhipMonth, setLastWhipMonth] = useState<number | null>(null);
  const [lastFedConsultMonth, setLastFedConsultMonth] = useState<number | null>(
    null
  );
  const [lastJudicialNomMonth, setLastJudicialNomMonth] = useState<
    number | null
  >(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [lastBudgetMonth, setLastBudgetMonth] = useState<number | null>(null);
  const [lastRegionalOutreachMonth, setLastRegionalOutreachMonth] = useState<
    number | null
  >(null);
  const [isLoadingIntelBrief, setIsLoadingIntelBrief] = useState(false);
  const [latestIntelBrief, setLatestIntelBrief] =
    useState<ClassifiedIntelBrief | null>(null);
  const [lastIntelBriefMonth, setLastIntelBriefMonth] = useState<number | null>(
    null
  );
  const [lastSummitMonth, setLastSummitMonth] = useState<number | null>(null);
  const [latestSummitOutcome, setLatestSummitOutcome] =
    useState<DiplomaticSummitOutcome | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'PLAYING') {
      if (activeEmergencyAlert) setActiveEmergencyAlert(null);
      return;
    }
    const nextAlert = findNextUnaddressedEmergency(
      metrics,
      currentMonth,
      addressedStabilityMonths
    );
    if (nextAlert) {
      if (
        !activeEmergencyAlert ||
        activeEmergencyAlert.metricKey !== nextAlert.metricKey ||
        activeEmergencyAlert.month !== nextAlert.month
      ) {
        setActiveEmergencyAlert(nextAlert);
      }
    } else if (activeEmergencyAlert) {
      setActiveEmergencyAlert(null);
    }
  }, [
    phase,
    metrics,
    currentMonth,
    addressedStabilityMonths,
    activeEmergencyAlert,
  ]);

  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const impeachmentThreshold = getGameDifficulty(
      profile.gameDifficulty
    ).impeachmentApprovalThreshold;
    if (metrics.approval < impeachmentThreshold) {
      if (
        !impeachmentAutoPrompted &&
        !pendingScandal &&
        !activeEmergencyAlert &&
        !showResignModal
      ) {
        setImpeachmentAutoPrompted(true);
        setShowImpeachmentModal(true);
      }
    } else if (impeachmentAutoPrompted) {
      setImpeachmentAutoPrompted(false);
    }
  }, [
    phase,
    metrics.approval,
    profile.gameDifficulty,
    impeachmentAutoPrompted,
    pendingScandal,
    activeEmergencyAlert,
    showResignModal,
  ]);

  useEffect(() => {
    if (phase === 'TITLE_SETUP') return;
    const stateToSave: SavedCareerState = {
      profile,
      vicePresident,
      scenarioId,
      scenarioTitle,
      customPremise,
      currentMonth,
      phase,
      initialMetricsSnapshot: initialMetrics,
      metrics,
      blocs,
      cabinet,
      military,
      diplomaticMissions,
      institutions,
      newsFeed,
      legislativeRecords,
      milestones,
      librarySynthesis,
      currentBriefing,
      latestOutcome,
      history,
      evaluation,
      reelectionCampaign,
      pendingScandal,
      addressedStabilityMonths,
      emergencyResolutions,
      harmonyMeetingMonths,
      sotuDeliveredYears,
      lastWhipMonth: lastWhipMonth ?? undefined,
      lastFedConsultMonth: lastFedConsultMonth ?? undefined,
      lastJudicialNomMonth: lastJudicialNomMonth ?? undefined,
      lastBudgetMonth: lastBudgetMonth ?? undefined,
      lastRegionalOutreachMonth: lastRegionalOutreachMonth ?? undefined,
      lastIntelBriefMonth: lastIntelBriefMonth ?? undefined,
      lastSummitMonth: lastSummitMonth ?? undefined,
      collapseReason,
      adminSuite,
      militaryRoster,
      promotionHistory,
      medalHistory,
      theaterAssignments,
      resolvedTheaterEventMonths,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      setSavedCareer(stateToSave);
    } catch {
      // Ignore storage quota errors
    }
  }, [
    phase,
    profile,
    vicePresident,
    scenarioId,
    scenarioTitle,
    customPremise,
    currentMonth,
    initialMetrics,
    metrics,
    blocs,
    cabinet,
    military,
    militaryRoster,
    promotionHistory,
    medalHistory,
    theaterAssignments,
    resolvedTheaterEventMonths,
    adminSuite,
    diplomaticMissions,
    institutions,
    newsFeed,
    legislativeRecords,
    milestones,
    librarySynthesis,
    currentBriefing,
    latestOutcome,
    history,
    evaluation,
    reelectionCampaign,
    pendingScandal,
    addressedStabilityMonths,
    emergencyResolutions,
    harmonyMeetingMonths,
    sotuDeliveredYears,
    lastWhipMonth,
    lastFedConsultMonth,
    lastJudicialNomMonth,
    lastBudgetMonth,
    lastRegionalOutreachMonth,
    lastIntelBriefMonth,
    lastSummitMonth,
    collapseReason,
  ]);

  const archiveCompletedLibrary = (snapshot: SavedCareerState) => {
    if (snapshot.history.length === 0) return;
    setPastLibraries((prev) => {
      const filtered = prev.filter(
        (p) =>
          p.profile.name !== snapshot.profile.name ||
          p.history.length !== snapshot.history.length ||
          p.scenarioTitle !== snapshot.scenarioTitle
      );
      const next = [snapshot, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(LIBRARY_ARCHIVE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      return next;
    });
  };

  const applyStartingModifiers = (
    baseMetrics: NationalMetrics,
    baseBlocs: VoterBlocs,
    baseMilitary: MilitaryCommandState,
    bg: PresidentProfile['background'],
    party: PartyId,
    bonuses: AppointeeBonuses,
    jcs: SelectedAdministration['jointChiefsChair'],
    difficultyMode?: string,
    gameDifficulty?: string
  ) => {
    const partyApprovalMod = party === 'independent' ? 2 : 0;
    const partyCongressMod = party === 'independent' ? -3 : 0;
    const climateMod = getPoliticalClimateMode(difficultyMode).modifiers;
    const diffMod = getGameDifficulty(gameDifficulty).startingModifiers;

    const m: NationalMetrics = {
      ...baseMetrics,
      approval: clamp(
        baseMetrics.approval +
          (bonuses.approval || 0) +
          partyApprovalMod +
          climateMod.approval +
          diffMod.approval,
        10,
        90
      ),
      congressSupport: clamp(
        baseMetrics.congressSupport +
          (bonuses.congressSupport || 0) +
          (bg === 'senator' ? 5 : 0) +
          partyCongressMod +
          climateMod.congressSupport +
          diffMod.congressSupport,
        10,
        90
      ),
      gdpGrowth: Number(
        (
          baseMetrics.gdpGrowth +
          (bonuses.gdpGrowth || 0) +
          (bg === 'executive' ? 0.2 : 0) +
          climateMod.gdpGrowth +
          diffMod.gdpGrowth
        ).toFixed(2)
      ),
      inflation: Number(
        Math.max(
          -12.0,
          baseMetrics.inflation +
            (bonuses.inflation || 0) +
            climateMod.inflation +
            diffMod.inflation
        ).toFixed(2)
      ),
      diplomaticStanding: clamp(
        baseMetrics.diplomaticStanding +
          (bonuses.diplomaticStanding || 0) +
          (bg === 'commander' ? 6 : 0) +
          climateMod.diplomaticStanding +
          diffMod.diplomaticStanding,
        10,
        100
      ),
    };

    const b: VoterBlocs = {
      workingClass: clamp(
        baseBlocs.workingClass +
          (bonuses.workingClass || 0) +
          (party === 'democratic' ? 1 : 0) +
          climateMod.workingClass +
          diffMod.blocOffset,
        10,
        90
      ),
      suburbanModerates: clamp(
        baseBlocs.suburbanModerates +
          (bonuses.suburbanModerates || 0) +
          (bg === 'governor' ? 4 : 0) +
          (party === 'independent' ? 4 : 0) +
          climateMod.suburbanModerates +
          diffMod.blocOffset,
        10,
        90
      ),
      techFinance: clamp(
        baseBlocs.techFinance +
          (bonuses.techFinance || 0) +
          (bg === 'executive' ? 5 : 0) +
          (party === 'republican' ? 2 : 0) +
          climateMod.techFinance +
          diffMod.blocOffset,
        10,
        90
      ),
      seniors: clamp(
        baseBlocs.seniors +
          (bonuses.seniors || 0) +
          (party === 'republican' ? 2 : 0) +
          climateMod.seniors +
          diffMod.blocOffset,
        10,
        90
      ),
      youngVoters: clamp(
        baseBlocs.youngVoters +
          (bonuses.youngVoters || 0) +
          (party === 'democratic' ? 2 : 0) +
          climateMod.youngVoters +
          diffMod.blocOffset,
        10,
        90
      ),
    };

    const mil: MilitaryCommandState = {
      ...baseMilitary,
      jointChiefsChair: jcs,
      forceReadiness: clamp(
        baseMilitary.forceReadiness +
          (bonuses.forceReadiness || 0) +
          diffMod.forceReadiness,
        30,
        100
      ),
    };

    return { m, b, mil };
  };

  const handleStartScenario = async (
    nextProfile: PresidentProfile,
    scenario: ScenarioDefinition,
    administration: SelectedAdministration,
    premise?: string
  ) => {
    setErrorMsg(null);
    playDeskSound('stamp', muted);

    if (scenario.isCustom) {
      setIsLoadingCustom(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await postSimulationApi<any>(
          '/api/generate-initial-briefing',
          {
            profile: nextProfile,
            customPremise: premise,
          },
          'Failed to generate custom scenario.'
        );

        const mappedNews: NewsHeadlineItem[] = (data.initialNews || []).map(
          (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
            ...item,
            id: `m1-custom-${idx}`,
            month: 1,
          })
        );
        const mappedOps = (data.initialMilitary?.operations || []).map(
          (op: MilitaryCommandState['operations'][number], idx: number) => ({
            ...op,
            id: `op-custom-${idx}`,
          })
        );
        const baseMilitary: MilitaryCommandState = {
          ...MILITARY_OPERATIONS_PRESET.fragile_boom,
          ...(data.initialMilitary || {}),
          defconLevel: clamp(
            Number(data.initialMilitary?.defconLevel || 4),
            1,
            5
          ) as 1 | 2 | 3 | 4 | 5,
          operations: mappedOps,
        };

        const { m, b, mil } = applyStartingModifiers(
          data.initialMetrics,
          data.initialBlocs,
          baseMilitary,
          nextProfile.background,
          resolvePartyId(nextProfile.party, nextProfile.coalition),
          administration.aggregatedBonuses,
          administration.jointChiefsChair,
          nextProfile.difficultyMode,
          nextProfile.gameDifficulty
        );

        setProfile(nextProfile);
        setVicePresident(administration.vicePresident);
        setScenarioId(scenario.id || 'custom');
        setScenarioTitle(data.scenarioTitle || scenario.title || 'Custom National Mandate');
        setCustomPremise(premise);
        setInitialMetrics(m);
        setMetrics(m);
        setBlocs(b);
        setCabinet(administration.cabinet);
        setMilitary(mil);
        setDiplomaticMissions([]);
        setInstitutions(
          data.initialInstitutions || INSTITUTIONS_PRESET.fragile_boom
        );
        setNewsFeed(mappedNews);
        setLegislativeRecords([]);
        setMilestones([]);
        setLibrarySynthesis(null);
        setCurrentMonth(1);
        setCurrentBriefing(normalizeMonthlyBriefing(data.initialBriefing, 1));
        setLatestOutcome(null);
        setHistory([]);
        setEvaluation(null);
        setCollapseReason(undefined);
        setPolicyDraftText('');
        setPersonalActionText('');
        setSpeechDraftText('');
        setLatestStatementResult(null);
        setLatestUnscriptedResult(null);
        setLatestSituationResult(null);
        setLatestVetoResult(null);
        setLastConfirmationResult(null);
        setReelectionCampaign(createDefaultCampaignState());
        setShowReelectionPrompt(false);
        setPendingScandal(null);
        setShowResignModal(false);
        setShowImpeachmentModal(false);
        setImpeachmentResult(null);
        setImpeachmentAutoPrompted(false);
        setActiveEmergencyAlert(null);
        setAddressedStabilityMonths({});
        setEmergencyResolutions([]);
        setHarmonyMeetingMonths({});
        setLatestHarmonyOutcome(null);
        setShowPressConference(false);
        setLatestPressConferenceSummary(null);
        setShowSotuModal(false);
        setSotuDeliveredYears([]);
        setShowWhipModal(false);
        setLastWhipMonth(null);
        setLastFedConsultMonth(null);
        setLastJudicialNomMonth(null);
        setShowBudgetModal(false);
        setLastBudgetMonth(null);
        setLastRegionalOutreachMonth(null);
        setLatestIntelBrief(null);
        setLastIntelBriefMonth(null);
        setLastSummitMonth(null);
        setLatestSummitOutcome(null);
        setExecutedPowers([]);
        setShowExecutivePowersHub(false);
        setMilitaryRoster(createInitialMilitaryRoster());
        setPromotionHistory([]);
        setMedalHistory([]);
        setTheaterAssignments(createDefaultTheaterAssignments());
        setResolvedTheaterEventMonths({});
        setLatestTheaterEventOutcome(null);
        setSupremeCourtBench(INITIAL_SUPREME_COURT_BENCH);
        setResolvedCourtCaseIds([]);
        setTradeStances({ ...DEFAULT_TRADE_STANCES });
        setLastTradeActionMonth(null);
        setShowSupremeCourtModal(false);
        setShowTradePolicyModal(false);
        setShowWhiteHouseToursModal(false);
        setLastWhiteHouseTourMonth(null);
        setWhiteHouseTourHistory([]);
        setLatestNuclearResult(null);
        setNuclearStrikeHistory([]);
        setSecretServiceProtection(false);
        setLastSecretServiceBudgetMonth(null);
        setActiveTab('briefing');
        setPhase('PLAYING');
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Unable to initialize custom scenario.'
        );
      } finally {
        setIsLoadingCustom(false);
      }
      return;
    }

    const resolvedProfile: PresidentProfile = {
      ...nextProfile,
      ...(scenario.isHistorical && scenario.historicalYear && !nextProfile.startingYear
        ? { startingYear: scenario.historicalYear }
        : {}),
      ...(scenario.isHistorical && !nextProfile.historicalScenarioId
        ? { historicalScenarioId: scenario.id }
        : {}),
      ...(scenario.historicalBenchmarkNote && !nextProfile.historicalBenchmarkNote
        ? { historicalBenchmarkNote: scenario.historicalBenchmarkNote }
        : {}),
    };

    const { m, b, mil } = applyStartingModifiers(
      scenario.initialMetrics,
      scenario.initialBlocs,
      scenario.initialMilitary,
      resolvedProfile.background,
      resolvePartyId(resolvedProfile.party, resolvedProfile.coalition),
      administration.aggregatedBonuses,
      administration.jointChiefsChair,
      resolvedProfile.difficultyMode,
      resolvedProfile.gameDifficulty
    );

    setProfile(resolvedProfile);
    setVicePresident(administration.vicePresident);
    setScenarioId(scenario.id);
    setScenarioTitle(scenario.title);
    setCustomPremise(undefined);
    setInitialMetrics(m);
    setMetrics(m);
    setBlocs(b);
    setCabinet(administration.cabinet);
    setMilitary(mil);
    setDiplomaticMissions([]);
    setInstitutions(scenario.initialInstitutions);
    setNewsFeed(scenario.initialNews);
    setLegislativeRecords([]);
    setMilestones([]);
    setLibrarySynthesis(null);
    setCurrentMonth(1);
    setCurrentBriefing(normalizeMonthlyBriefing(scenario.initialBriefing, 1));
    setLatestOutcome(null);
    setHistory([]);
    setEvaluation(null);
    setCollapseReason(undefined);
    setPolicyDraftText('');
    setPersonalActionText('');
    setSpeechDraftText('');
    setLatestStatementResult(null);
    setLatestUnscriptedResult(null);
    setLatestSituationResult(null);
    setLatestVetoResult(null);
    setLastConfirmationResult(null);
    setLatestDismissalResult(null);
    setLastVpConfirmation(null);
    setLastJcsConfirmation(null);
    setShowNominateJcsModal(false);
    setDismissedOtherOfficials([]);
    setReelectionCampaign(createDefaultCampaignState());
    setShowReelectionPrompt(false);
    setPendingScandal(null);
    setShowResignModal(false);
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
    setImpeachmentAutoPrompted(false);
    setActiveEmergencyAlert(null);
    setAddressedStabilityMonths({});
    setEmergencyResolutions([]);
    setHarmonyMeetingMonths({});
    setLatestHarmonyOutcome(null);
    setShowPressConference(false);
    setLatestPressConferenceSummary(null);
    setShowSotuModal(false);
    setSotuDeliveredYears([]);
    setShowWhipModal(false);
    setLastWhipMonth(null);
    setLastFedConsultMonth(null);
    setLastJudicialNomMonth(null);
    setShowBudgetModal(false);
    setLastBudgetMonth(null);
    setLastRegionalOutreachMonth(null);
    setLatestIntelBrief(null);
    setLastIntelBriefMonth(null);
    setLastSummitMonth(null);
    setLatestSummitOutcome(null);
    setExecutedPowers([]);
    setShowExecutivePowersHub(false);
    setMilitaryRoster(createInitialMilitaryRoster());
    setPromotionHistory([]);
    setMedalHistory([]);
    setSupremeCourtBench(INITIAL_SUPREME_COURT_BENCH);
    setResolvedCourtCaseIds([]);
    setTradeStances({ ...DEFAULT_TRADE_STANCES });
    setLastTradeActionMonth(null);
    setShowSupremeCourtModal(false);
    setShowTradePolicyModal(false);
    setShowWhiteHouseToursModal(false);
    setLastWhiteHouseTourMonth(null);
    setWhiteHouseTourHistory([]);
    setLatestNuclearResult(null);
    setNuclearStrikeHistory([]);
    setSecretServiceProtection(false);
    setLastSecretServiceBudgetMonth(null);
    setTheaterAssignments(createDefaultTheaterAssignments());
    setResolvedTheaterEventMonths({});
    setLatestTheaterEventOutcome(null);
    setActiveTab('briefing');
    setPhase('PLAYING');
  };

  const handleResumeSaved = () => {
    if (!savedCareer) return;
    playDeskSound('select', muted);
    setProfile(savedCareer.profile);
    setVicePresident(savedCareer.vicePresident || DEFAULT_VP);
    setScenarioId(savedCareer.scenarioId);
    setScenarioTitle(savedCareer.scenarioTitle);
    setCustomPremise(savedCareer.customPremise);
    const matchingScenario = SCENARIOS.find(
      (s) => s.id === savedCareer.scenarioId
    );
    setInitialMetrics(
      savedCareer.initialMetricsSnapshot ||
        matchingScenario?.initialMetrics ||
        savedCareer.metrics
    );
    setMetrics(savedCareer.metrics);
    setBlocs(savedCareer.blocs);
    setCabinet(savedCareer.cabinet || DEFAULT_CABINET);
    setMilitary(savedCareer.military || MILITARY_OPERATIONS_PRESET.fragile_boom);
    setDiplomaticMissions(savedCareer.diplomaticMissions || []);
    setInstitutions(
      savedCareer.institutions || INSTITUTIONS_PRESET.fragile_boom
    );
    setNewsFeed(savedCareer.newsFeed || SCENARIOS[0].initialNews);
    setLegislativeRecords(savedCareer.legislativeRecords || []);
    setMilestones(savedCareer.milestones || []);
    setLibrarySynthesis(savedCareer.librarySynthesis || null);
    setCurrentMonth(savedCareer.currentMonth);
    setCurrentBriefing(
      normalizeMonthlyBriefing(
        savedCareer.currentBriefing,
        savedCareer.currentMonth
      )
    );
    setLatestOutcome(savedCareer.latestOutcome);
    setHistory(savedCareer.history);
    setEvaluation(savedCareer.evaluation);
    setCollapseReason(savedCareer.collapseReason);
    setPolicyDraftText('');
    setPersonalActionText('');
    setSpeechDraftText('');
    setLatestStatementResult(null);
    setLatestUnscriptedResult(null);
    setLatestSituationResult(null);
    setLatestVetoResult(null);
    setLastConfirmationResult(null);
    setLatestDismissalResult(null);
    setLastVpConfirmation(null);
    setLastJcsConfirmation(null);
    setShowNominateJcsModal(false);
    setDismissedOtherOfficials([]);
    setReelectionCampaign(
      savedCareer.reelectionCampaign || createDefaultCampaignState()
    );
    setShowReelectionPrompt(false);
    setPendingScandal(savedCareer.pendingScandal || null);
    setShowResignModal(false);
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
    setImpeachmentAutoPrompted(savedCareer.metrics.approval < 5);
    setActiveEmergencyAlert(null);
    setAddressedStabilityMonths(savedCareer.addressedStabilityMonths || {});
    setEmergencyResolutions(savedCareer.emergencyResolutions || []);
    setHarmonyMeetingMonths(savedCareer.harmonyMeetingMonths || {});
    setLatestHarmonyOutcome(null);
    setShowPressConference(false);
    setLatestPressConferenceSummary(null);
    setShowSotuModal(false);
    setSotuDeliveredYears(savedCareer.sotuDeliveredYears || []);
    setShowWhipModal(false);
    setLastWhipMonth(
      typeof savedCareer.lastWhipMonth === 'number'
        ? savedCareer.lastWhipMonth
        : null
    );
    setLastFedConsultMonth(
      typeof savedCareer.lastFedConsultMonth === 'number'
        ? savedCareer.lastFedConsultMonth
        : null
    );
    setLastJudicialNomMonth(
      typeof savedCareer.lastJudicialNomMonth === 'number'
        ? savedCareer.lastJudicialNomMonth
        : null
    );
    setShowBudgetModal(false);
    setLastBudgetMonth(
      typeof savedCareer.lastBudgetMonth === 'number'
        ? savedCareer.lastBudgetMonth
        : null
    );
    setLastRegionalOutreachMonth(
      typeof savedCareer.lastRegionalOutreachMonth === 'number'
        ? savedCareer.lastRegionalOutreachMonth
        : null
    );
    setLatestIntelBrief(null);
    setLastIntelBriefMonth(
      typeof savedCareer.lastIntelBriefMonth === 'number'
        ? savedCareer.lastIntelBriefMonth
        : null
    );
    setLastSummitMonth(
      typeof savedCareer.lastSummitMonth === 'number'
        ? savedCareer.lastSummitMonth
        : null
    );
    setLatestSummitOutcome(null);
    setExecutedPowers(savedCareer.executedPowers || []);
    setShowExecutivePowersHub(false);
    setShowWhiteHouseToursModal(false);
    setLatestNuclearResult(null);
    setNuclearStrikeHistory([]);
    setMilitaryRoster(
      savedCareer.militaryRoster && savedCareer.militaryRoster.length > 0
        ? savedCareer.militaryRoster
        : createInitialMilitaryRoster()
    );
    setPromotionHistory(savedCareer.promotionHistory || []);
    setMedalHistory(savedCareer.medalHistory || []);
    setTheaterAssignments(
      savedCareer.theaterAssignments || createDefaultTheaterAssignments()
    );
    setResolvedTheaterEventMonths(savedCareer.resolvedTheaterEventMonths || {});
    setLatestTheaterEventOutcome(null);
    setActiveTab('briefing');
    setPhase(
      savedCareer.phase === 'SIMULATING' ? 'PLAYING' : savedCareer.phase
    );
  };

  const handleDiscardSaved = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedCareer(null);
  };

  const handleReplaceCabinet = async (
    member: CabinetMember,
    replacementDirection: string
  ) => {
    setErrorMsg(null);
    setLastConfirmationResult(null);
    setReplacingCabinetId(member.id);
    playDeskSound('select', muted);
    try {
      const data = await postSimulationApi<CabinetConfirmationResult>(
        '/api/replace-cabinet',
        {
          profile,
          vicePresident,
          currentMember: member,
          replacementDirection,
          metrics,
        },
        'Failed to hold Congressional confirmation vote.'
      );

      if (data.approved) {
        setCabinet((prev) =>
          prev.map((c) =>
            c.id === member.id
              ? {
                  ...c,
                  name: data.nomineeName,
                  leaning: data.leaning,
                  loyalty: clamp(Number(data.loyalty || 80), 40, 96),
                  competence: clamp(Number(data.competence || 82), 50, 96),
                  status: 'Aligned',
                  currentCounsel: data.currentCounsel,
                }
              : c
          )
        );
      } else {
        setCabinet((prev) =>
          prev.map((c) => {
            if (c.id !== member.id) return c;
            const strainedLoyalty = clamp(c.loyalty - 8, 15, 98);
            return {
              ...c,
              loyalty: strainedLoyalty,
              status:
                strainedLoyalty >= 65
                  ? 'Aligned'
                  : strainedLoyalty >= 45
                  ? 'Cautious'
                  : 'Strained',
            };
          })
        );
      }

      setMetrics((prev) => ({
        ...prev,
        congressSupport: clamp(
          Number((prev.congressSupport + (data.congressDelta || 0)).toFixed(1)),
          5,
          95
        ),
        approval: clamp(
          Number((prev.approval + (data.approvalDelta || 0)).toFixed(1)),
          0,
          95
        ),
      }));

      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-cab-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title: data.approved
            ? `Confirmed ${data.nomineeName} as ${member.roleTitle} (${data.voteMarginLabel})`
            : `Blocked Nomination of ${data.nomineeName} for ${member.roleTitle} (${data.voteMarginLabel})`,
          summary: data.committeeSummary,
          outcomeStatus: data.approved
            ? data.vpTieBreakerUsed || data.senateYea <= 54
              ? 'Compromise'
              : 'Enacted'
            : 'Blocked',
          approvalImpact: data.approvalDelta || 0,
        },
      ]);

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-cab-${Date.now()}`,
          month: currentMonth,
          category: 'Political',
          title: data.approved
            ? `Cabinet Confirmed: ${data.nomineeName} (${data.voteMarginLabel})`
            : `Nomination Defeated: ${data.nomineeName} (${data.voteMarginLabel})`,
          description: data.approved
            ? `${data.nomineeName} replaced ${member.name} at ${member.roleTitle}. ${data.committeeSummary}`
            : `Congress rejected ${data.nomineeName} for ${member.roleTitle}; ${member.name} remained in office.`,
        },
      ]);

      setNewsFeed((prev) => [
        ...prev,
        {
          id: `cab-${Date.now()}`,
          month: currentMonth,
          outlet: 'Capitol Dispatch',
          category: 'politics',
          headline: data.confirmationHeadline,
          summary: `${data.voteMarginLabel}. ${data.committeeSummary}`,
          tone: data.approved ? 'neutral' : 'critical',
        },
      ]);

      setLastConfirmationResult(data);
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Cabinet nomination failed.'
      );
    } finally {
      setReplacingCabinetId(null);
    }
  };

  const handleNominateJcs = async (replacementDirection: string) => {
    if (isNominatingJcs) return;
    setErrorMsg(null);
    setLastJcsConfirmation(null);
    setIsNominatingJcs(true);
    playDeskSound('select', muted);

    try {
      const data = await postSimulationApi<JcsConfirmationResult>(
        '/api/replace-joint-chiefs',
        {
          profile,
          currentJcs: military.jointChiefsChair,
          replacementDirection,
          metrics,
        },
        'Failed to hold Senate Armed Services confirmation vote for Joint Chiefs Chair.'
      );

      if (data.approved) {
        setMilitary((prev) => ({
          ...prev,
          jointChiefsChair: {
            name: data.nomineeName,
            branch: data.branch,
            doctrine: data.doctrine,
          },
          forceReadiness: clamp(
            Math.round(prev.forceReadiness + 3),
            30,
            100
          ),
        }));
      }

      setMetrics((prev) => {
        const nextMetrics: NationalMetrics = {
          ...prev,
          congressSupport: clamp(
            Number((prev.congressSupport + (data.congressDelta || 0)).toFixed(1)),
            5,
            95
          ),
          approval: clamp(
            Number((prev.approval + (data.approvalDelta || 0)).toFixed(1)),
            0,
            95
          ),
        };
        if (reelectionCampaign.decision === 'running') {
          const proj = computeCampaignProjection(
            nextMetrics,
            reelectionCampaign.campaignMomentum
          );
          setReelectionCampaign((c) => ({
            ...c,
            projectedVoteShare: proj.projectedVoteShare,
            battlegroundEdge: proj.battlegroundEdge,
          }));
        }
        return nextMetrics;
      });

      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-jcs-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title: data.approved
            ? `Confirmed ${data.nomineeName} as Joint Chiefs Chair (${data.voteMarginLabel})`
            : `Senate Rejected ${data.nomineeName} for Joint Chiefs Chair (${data.voteMarginLabel})`,
          summary: data.committeeSummary,
          outcomeStatus: data.approved
            ? data.senateYea <= 54
              ? 'Compromise'
              : 'Enacted'
            : 'Blocked',
          approvalImpact: data.approvalDelta || 0,
        },
      ]);

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-jcs-nom-${Date.now()}`,
          month: currentMonth,
          category: 'Security',
          title: data.approved
            ? `Joint Chiefs Chair Confirmed: ${data.nomineeName} (${data.voteMarginLabel})`
            : `Joint Chiefs Nomination Rejected: ${data.nomineeName} (${data.voteMarginLabel})`,
          description: data.approved
            ? `Senate Armed Services Committee confirmed ${data.nomineeName} (${data.branch} · ${data.doctrine}) to lead the Joint Staff.`
            : `Senate declined to confirm ${data.nomineeName}; Interim Acting Chair remains in place.`,
        },
      ]);

      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `jcs-nom-${Date.now()}`,
            month: currentMonth,
            outlet: 'Capitol Dispatch',
            category: 'defense',
            headline: data.confirmationHeadline,
            summary: `${data.voteMarginLabel}. ${data.committeeSummary}`,
            tone: data.approved ? 'positive' : 'critical',
          },
        ])
      );

      setLastJcsConfirmation(data);
      setShowNominateJcsModal(false);
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Joint Chiefs nomination failed.'
      );
    } finally {
      setIsNominatingJcs(false);
    }
  };

  const handleFireOfficial = async (req: FireOfficialRequest) => {
    if (isFiringOfficial) return;
    setErrorMsg(null);
    setLatestDismissalResult(null);
    setIsFiringOfficial(true);
    playDeskSound('select', muted);

    try {
      const data = await postSimulationApi<OfficialDismissalResult>(
        '/api/fire-official',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          cabinet,
          military,
          ...req,
        },
        'Failed to process dismissal of executive official.'
      );

      const loyaltyShock = Math.max(2, Math.min(18, Number(data.loyaltyShock || 5)));

      if (data.targetCategory === 'vp') {
        setVicePresident({
          id: 'vp_vacant',
          name: 'Vacant (Ousted / Forced Resignation)',
          formerTitle: '25th Amendment Vacancy',
          leaning: 'Seat Vacant',
          loyalty: 0,
          popularity: 18,
          traitSummary: 'Senate tie-break unavailable until nominee confirmed',
          currentCounsel:
            'The Vice Presidency is vacant following an unprecedented presidential dismissal order. Submit a 25th Amendment nominee to both chambers to restore full executive succession.',
        });
      } else if (data.targetCategory === 'military') {
        setMilitary((prev) => ({
          ...prev,
          jointChiefsChair: {
            name: 'Acting Vice Chair (Interim)',
            branch: 'Joint Staff · Caretaker Command',
            doctrine: 'Interim Continuity Pending Senate Confirmation',
          },
          forceReadiness: clamp(
            Math.round(
              prev.forceReadiness + Number(data.metricDeltas?.forceReadiness ?? -4)
            ),
            30,
            100
          ),
        }));
      } else if (
        (data.targetCategory === 'cabinet' || data.targetCategory === 'white_house') &&
        data.targetId
      ) {
        setCabinet((prev) =>
          prev.map((c) => {
            if (c.id === data.targetId) {
              return {
                ...c,
                name: `Acting ${c.roleTitle}`,
                leaning: 'Interim Caretaker',
                loyalty: 66,
                competence: 70,
                status: 'Cautious',
                currentCounsel: `Maintaining day-to-day operations at ${c.roleTitle} following the dismissal of ${data.targetName}.`,
              };
            }
            const nextLoyalty = clamp(c.loyalty - loyaltyShock, 15, 98);
            return {
              ...c,
              loyalty: nextLoyalty,
              status:
                nextLoyalty >= 65
                  ? 'Aligned'
                  : nextLoyalty >= 45
                  ? 'Cautious'
                  : 'Strained',
            };
          })
        );
      } else {
        const mildShock = Math.max(2, Math.round(loyaltyShock * 0.5));
        setCabinet((prev) =>
          prev.map((c) => {
            const nextLoyalty = clamp(c.loyalty - mildShock, 15, 98);
            return {
              ...c,
              loyalty: nextLoyalty,
              status:
                nextLoyalty >= 65
                  ? 'Aligned'
                  : nextLoyalty >= 45
                  ? 'Cautious'
                  : 'Strained',
            };
          })
        );
        const key = data.targetId || `${data.roleTitle}:${data.targetName}`;
        setDismissedOtherOfficials((prev) =>
          prev.includes(key) ? prev : [...prev, key]
        );
      }

      if (data.targetCategory === 'vp' || data.targetCategory === 'military') {
        setCabinet((prev) =>
          prev.map((c) => {
            const nextLoyalty = clamp(c.loyalty - loyaltyShock, 15, 98);
            return {
              ...c,
              loyalty: nextLoyalty,
              status:
                nextLoyalty >= 65
                  ? 'Aligned'
                  : nextLoyalty >= 45
                  ? 'Cautious'
                  : 'Strained',
            };
          })
        );
      }

      setMetrics((prev) => {
        const nextMetrics: NationalMetrics = {
          ...prev,
          approval: clamp(
            Number((prev.approval + Number(data.metricDeltas?.approval || 0)).toFixed(1)),
            0,
            95
          ),
          congressSupport: clamp(
            Number(
              (
                prev.congressSupport +
                Number(data.metricDeltas?.congressSupport || 0)
              ).toFixed(1)
            ),
            5,
            95
          ),
          diplomaticStanding: clamp(
            Number(
              (
                prev.diplomaticStanding +
                Number(data.metricDeltas?.diplomaticStanding || 0)
              ).toFixed(1)
            ),
            5,
            100
          ),
        };
        if (reelectionCampaign.decision === 'running') {
          const proj = computeCampaignProjection(
            nextMetrics,
            reelectionCampaign.campaignMomentum
          );
          setReelectionCampaign((curr) => ({
            ...curr,
            projectedVoteShare: proj.projectedVoteShare,
            battlegroundEdge: proj.battlegroundEdge,
          }));
        }
        return nextMetrics;
      });

      const dismissalLeadStory: NewsHeadlineItem = {
        id: `fire-lead-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        outlet: data.leadOutlet || 'The Washington Chronicle',
        category: data.targetCategory === 'military' ? 'defense' : 'politics',
        headline: data.leadHeadline,
        summary: `${data.mediaSummary} Congress (${data.congressResponse.status}): ${data.congressResponse.summary}`,
        tone: 'critical',
      };
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          dismissalLeadStory,
          ...(Array.isArray(data.mediaReactions) ? data.mediaReactions : []),
        ])
      );

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-fire-${Date.now()}`,
          month: currentMonth,
          category:
            data.targetCategory === 'vp'
              ? 'Constitutional'
              : data.targetCategory === 'military'
              ? 'Security'
              : 'Political',
          title: `Ousted ${data.roleTitle}: ${data.targetName}`,
          description: `${data.leadHeadline} — ${data.congressResponse.summary}`,
        },
      ]);

      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-fire-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title: `Presidential Dismissal of ${data.roleTitle} (${data.targetName})`,
          summary: `${data.constitutionalNote || data.mediaSummary} Congress: ${data.congressResponse.status}.`,
          outcomeStatus:
            data.congressResponse.status === 'Backlash' ||
            data.congressResponse.status === 'Constitutional Crisis'
              ? 'Blocked'
              : 'Compromise',
          approvalImpact: Number(data.metricDeltas?.approval || 0),
        },
      ]);

      setLatestDismissalResult(data);
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to process official dismissal.'
      );
    } finally {
      setIsFiringOfficial(false);
    }
  };

  const handleNominateVp = async (nomineeDirection: string) => {
    if (isNominatingVp) return;
    setErrorMsg(null);
    setLastVpConfirmation(null);
    setIsNominatingVp(true);
    playDeskSound('select', muted);

    try {
      const data = await postSimulationApi<VpNominationResult>(
        '/api/nominate-vp',
        {
          profile,
          currentVpName: vicePresident.name,
          nomineeDirection,
          metrics,
        },
        'Failed to hold 25th Amendment Vice Presidential confirmation votes.'
      );

      if (data.approved) {
        setVicePresident({
          id: `vp_${Date.now()}`,
          name: data.nomineeName,
          formerTitle: data.formerTitle,
          leaning: data.leaning,
          loyalty: clamp(Number(data.loyalty || 82), 50, 95),
          popularity: clamp(Number(data.popularity || 56), 35, 85),
          traitSummary: data.traitSummary,
          currentCounsel: data.currentCounsel,
        });
      }

      setMetrics((prev) => ({
        ...prev,
        congressSupport: clamp(
          Number((prev.congressSupport + (data.congressDelta || 0)).toFixed(1)),
          5,
          95
        ),
        approval: clamp(
          Number((prev.approval + (data.approvalDelta || 0)).toFixed(1)),
          0,
          95
        ),
      }));

      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-vp-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title: data.approved
            ? `25th Amend. Confirmation: VP ${data.nomineeName}`
            : `25th Amend. Rejection: ${data.nomineeName}`,
          summary: `${data.voteMarginLabel}. ${data.committeeSummary}`,
          outcomeStatus: data.approved ? 'Enacted' : 'Blocked',
          approvalImpact: data.approvalDelta || 0,
        },
      ]);

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-vp-${Date.now()}`,
          month: currentMonth,
          category: 'Constitutional',
          title: data.approved
            ? `New Vice President Confirmed: ${data.nomineeName}`
            : `VP Nominee Rejected: ${data.nomineeName}`,
          description: `${data.voteMarginLabel}. ${data.committeeSummary}`,
        },
      ]);

      setNewsFeed((prev) => [
        ...prev,
        {
          id: `vp-news-${Date.now()}`,
          month: currentMonth,
          outlet: 'Capitol Dispatch',
          category: 'politics',
          headline: data.confirmationHeadline,
          summary: `${data.voteMarginLabel}. ${data.committeeSummary}`,
          tone: data.approved ? 'positive' : 'critical',
        },
      ]);

      setLastVpConfirmation(data);
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : '25th Amendment VP confirmation failed.'
      );
    } finally {
      setIsNominatingVp(false);
    }
  };

  const handleDraftFromCounsel = (
    roleLabel: string,
    advisorName: string,
    counsel: string
  ) => {
    playDeskSound('select', muted);
    const addition = `Consulted ${roleLabel} ${advisorName}: ${counsel}`;
    setPolicyDraftText((prev) =>
      prev.trim() ? `${prev.trim()}\n\n${addition}` : addition
    );
    setActiveTab('briefing');
  };

  const handleResolveClemency = (result: {
    petitionTitle: string;
    actionLabel: string;
    approvalDelta: number;
    congressDelta: number;
    justiceLoyaltyDelta: number;
    blocImpacts: Partial<VoterBlocs>;
    headline: string;
    newsTone: 'positive' | 'neutral' | 'critical';
  }) => {
    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number(
          (prev.congressSupport + result.congressDelta).toFixed(1)
        ),
        5,
        95
      ),
    }));

    setBlocs((prev) => {
      const next = { ...prev };
      (Object.keys(result.blocImpacts) as (keyof VoterBlocs)[]).forEach((bKey) => {
        const delta = result.blocImpacts[bKey] || 0;
        next[bKey] = clamp(next[bKey] + delta, 0, 100);
      });
      return next;
    });

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-clemency-${Date.now()}`,
        month: currentMonth,
        recordType: 'Executive Order',
        title: `Clemency Board: ${result.petitionTitle} (${result.actionLabel})`,
        summary: result.headline,
        outcomeStatus: 'Enacted',
        approvalImpact: result.approvalDelta,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-clemency-${Date.now()}`,
        month: currentMonth,
        category: 'Political',
        title: `Executive Clemency Action: ${result.petitionTitle}`,
        description: `${result.actionLabel}. ${result.headline}`,
      },
    ]);

    setNewsFeed((prev) => [
      ...prev,
      {
        id: `news-clemency-${Date.now()}`,
        month: currentMonth,
        outlet:
          result.newsTone === 'positive'
            ? 'Chronicle & Herald'
            : result.newsTone === 'critical'
            ? 'National Watchdog'
            : 'Capital Dispatch',
        category: 'politics',
        headline: result.headline,
        summary: `Presidential Clemency Board recommendation executed for ${result.petitionTitle}. Action: ${result.actionLabel}.`,
        tone: result.newsTone,
      },
    ]);

    playDeskSound('stamp', muted);
    setShowPardonsModal(false);
  };

  const handleResolveCourtCase = (result: {
    caseId: string;
    caseName: string;
    strategyLabel: string;
    upheld: boolean;
    voteLabel: string;
    approvalDelta: number;
    congressDelta: number;
    gdpDelta: number;
    headline: string;
    rulingSummary: string;
  }) => {
    setResolvedCourtCaseIds((prev) =>
      prev.includes(result.caseId) ? prev : [...prev, result.caseId]
    );

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((prev.congressSupport + result.congressDelta).toFixed(1)),
        5,
        95
      ),
      gdpGrowth: clamp(
        Number((prev.gdpGrowth + result.gdpDelta).toFixed(1)),
        -12,
        14
      ),
    }));

    setInstitutions((prev) => ({
      ...prev,
      pendingCourtNote: `${result.caseName} (${result.voteLabel}): ${result.rulingSummary}`,
    }));

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-scotus-${Date.now()}`,
        month: currentMonth,
        recordType: 'Institutional',
        title: `Supreme Court Ruling (${result.voteLabel}): ${result.caseName}`,
        summary: `Brief: ${result.strategyLabel}. ${result.rulingSummary}`,
        outcomeStatus: result.upheld ? 'Enacted' : 'Blocked',
        approvalImpact: result.approvalDelta,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-scotus-${Date.now()}`,
        month: currentMonth,
        category: 'Constitutional',
        title: `${result.caseName}: ${result.voteLabel}`,
        description: result.rulingSummary,
      },
    ]);

    setNewsFeed((prev) => [
      ...prev,
      {
        id: `news-scotus-${Date.now()}`,
        month: currentMonth,
        outlet: 'Supreme Court Wire',
        category: 'politics',
        headline: result.headline,
        summary: `${result.voteLabel} — ${result.rulingSummary}`,
        tone: result.upheld ? 'positive' : 'critical',
      },
    ]);

    playDeskSound(result.upheld ? 'stamp' : 'alert', muted);
  };

  const handleConfirmCourtNominee = (result: {
    replacedJusticeId: string;
    replacedJusticeName: string;
    newJustice: SupremeCourtJustice;
    approved: boolean;
    senateYea: number;
    senateNay: number;
    derivedClimate: InstitutionalState['judiciaryClimate'];
    approvalDelta: number;
    congressDelta: number;
    blocImpacts: Partial<VoterBlocs>;
    headline: string;
    summary: string;
  }) => {
    if (result.approved) {
      setSupremeCourtBench((prev) =>
        prev.map((j) =>
          j.id === result.replacedJusticeId ? result.newJustice : j
        )
      );
      setInstitutions((prev) => ({
        ...prev,
        judiciaryClimate: result.derivedClimate,
        pendingCourtNote: `${result.newJustice.name} confirmed (${result.senateYea}–${result.senateNay}) to replace ${result.replacedJusticeName}.`,
      }));
    }

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((prev.congressSupport + result.congressDelta).toFixed(1)),
        5,
        95
      ),
    }));

    setBlocs((prev) => {
      const next = { ...prev };
      (Object.keys(result.blocImpacts) as (keyof VoterBlocs)[]).forEach(
        (bKey) => {
          const delta = result.blocImpacts[bKey] || 0;
          next[bKey] = clamp(next[bKey] + delta, 5, 95);
        }
      );
      return next;
    });

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-nom-${Date.now()}`,
        month: currentMonth,
        recordType: 'Institutional',
        title: result.approved
          ? `SCOTUS Confirmation: ${result.newJustice.name} (${result.senateYea}–${result.senateNay})`
          : `SCOTUS Rejection: ${result.newJustice.name} (${result.senateYea}–${result.senateNay})`,
        summary: result.summary,
        outcomeStatus: result.approved ? 'Enacted' : 'Blocked',
        approvalImpact: result.approvalDelta,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-nom-${Date.now()}`,
        month: currentMonth,
        category: 'Constitutional',
        title: result.approved
          ? `Appointed Justice ${result.newJustice.name}`
          : `Senate Rejected Nominee ${result.newJustice.name}`,
        description: result.summary,
      },
    ]);

    setNewsFeed((prev) => [
      ...prev,
      {
        id: `news-nom-${Date.now()}`,
        month: currentMonth,
        outlet: 'Capitol Hill Ledger',
        category: 'politics',
        headline: result.headline,
        summary: result.summary,
        tone: result.approved ? 'positive' : 'critical',
      },
    ]);

    playDeskSound(result.approved ? 'stamp' : 'alert', muted);
  };

  const handleEnactTradePackage = (result: {
    stances: Record<string, TradePostureId>;
    gdpDelta: number;
    inflationDelta: number;
    debtDeltaTrillions: number;
    diplomaticDelta: number;
    approvalDelta: number;
    blocImpacts: Partial<VoterBlocs>;
    retaliationSummary: string;
    overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    headline: string;
    newsTone: 'positive' | 'neutral' | 'critical';
  }) => {
    setTradeStances(result.stances);
    setLastTradeActionMonth(currentMonth);

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      gdpGrowth: clamp(
        Number((prev.gdpGrowth + result.gdpDelta).toFixed(2)),
        -12,
        14
      ),
      inflation: clamp(
        Number((prev.inflation + result.inflationDelta).toFixed(2)),
        -8,
        24
      ),
      nationalDebtTrillions: Math.max(
        0.01,
        Number((prev.nationalDebtTrillions + result.debtDeltaTrillions).toFixed(2))
      ),
      diplomaticStanding: clamp(
        Number((prev.diplomaticStanding + result.diplomaticDelta).toFixed(1)),
        5,
        100
      ),
    }));

    setBlocs((prev) => {
      const next = { ...prev };
      (Object.keys(result.blocImpacts) as (keyof VoterBlocs)[]).forEach(
        (bKey) => {
          const delta = result.blocImpacts[bKey] || 0;
          next[bKey] = clamp(next[bKey] + delta, 5, 95);
        }
      );
      return next;
    });

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-trade-${Date.now()}`,
        month: currentMonth,
        recordType: 'Executive Order',
        title: `Trade & Tariff Proclamation (${result.overallRisk} Retaliation Risk)`,
        summary: result.retaliationSummary,
        outcomeStatus: 'Enacted',
        approvalImpact: result.approvalDelta,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-trade-${Date.now()}`,
        month: currentMonth,
        category: 'Economic',
        title: result.headline,
        description: result.retaliationSummary,
      },
    ]);

    setNewsFeed((prev) => [
      ...prev,
      {
        id: `news-trade-${Date.now()}`,
        month: currentMonth,
        outlet: 'Financial Times Wire',
        category: 'economy',
        headline: result.headline,
        summary: result.retaliationSummary,
        tone: result.newsTone,
      },
    ]);

    playDeskSound('stamp', muted);
    setShowTradePolicyModal(false);
  };

  const handleScheduleWhiteHouseTour = (payload: {
    group: WhiteHouseTourGroup;
    posture: TourScreeningPosture;
    approvalDelta: number;
    readinessDelta: number;
    blocImpacts: Partial<VoterBlocs>;
  }) => {
    setLastWhiteHouseTourMonth(currentMonth);

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + payload.approvalDelta).toFixed(1)),
        0,
        95
      ),
    }));

    setMilitary((prev) => ({
      ...prev,
      forceReadiness: clamp(
        Number((prev.forceReadiness + payload.readinessDelta).toFixed(1)),
        0,
        100
      ),
    }));

    setBlocs((prev) => {
      const next = { ...prev };
      (Object.keys(payload.blocImpacts) as (keyof VoterBlocs)[]).forEach(
        (bKey) => {
          const delta = payload.blocImpacts[bKey] || 0;
          next[bKey] = clamp(Number((next[bKey] + delta).toFixed(1)), 5, 95);
        }
      );
      return next;
    });

    setWhiteHouseTourHistory((prev) => [
      ...prev,
      {
        id: `wh-tour-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        groupId: payload.group.id,
        groupName: payload.group.name,
        routeLabel: payload.group.routeLabel,
        posture: payload.posture,
        approvalDelta: payload.approvalDelta,
        readinessDelta: payload.readinessDelta,
        headline: payload.group.headline,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-tour-${Date.now()}`,
        month: currentMonth,
        category: 'Political',
        title: `White House Tour: ${payload.group.name}`,
        description: `${payload.group.routeLabel} · Approval +${payload.approvalDelta.toFixed(1)}%, Security Readiness ${payload.readinessDelta.toFixed(1)}%.`,
      },
    ]);

    setNewsFeed((prev) => [
      ...prev,
      {
        id: `news-tour-${Date.now()}`,
        month: currentMonth,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: payload.group.headline,
        summary: payload.group.pressSummary,
        tone: 'positive',
      },
    ]);

    playDeskSound('stamp', muted);
  };

  const handleExecuteNuclearStrike = (params: {
    targetCategory: NuclearTargetCategory;
    targetName: string;
    profileId: NuclearStrikeProfileId;
    requireCongressApproval: boolean;
  }) => {
    const result = evaluateNuclearStrike({
      currentMonth,
      targetCategory: params.targetCategory,
      targetName: params.targetName,
      profileId: params.profileId,
      requireCongressApproval: params.requireCongressApproval,
      metrics,
      military,
    });

    setLatestNuclearResult(result);
    setNuclearStrikeHistory((prev) => [...prev, result]);

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.metricDeltas.approval).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number(
          (prev.congressSupport + result.metricDeltas.congressSupport).toFixed(
            1
          )
        ),
        5,
        95
      ),
      diplomaticStanding: clamp(
        Number(
          (
            prev.diplomaticStanding + result.metricDeltas.diplomaticStanding
          ).toFixed(1)
        ),
        5,
        100
      ),
      gdpGrowth: clamp(
        Number((prev.gdpGrowth + result.metricDeltas.gdpGrowth).toFixed(2)),
        -12,
        14
      ),
      inflation: clamp(
        Number((prev.inflation + result.metricDeltas.inflation).toFixed(2)),
        -8,
        24
      ),
    }));

    setMilitary((prev) => ({
      ...prev,
      defconLevel: result.executed
        ? 1
        : (Math.max(1, prev.defconLevel - 1) as 1 | 2 | 3 | 4 | 5),
      intelThreatLevel: result.executed ? 'Severe' : prev.intelThreatLevel,
      forceReadiness: clamp(
        Number(
          (prev.forceReadiness + result.metricDeltas.forceReadiness).toFixed(1)
        ),
        10,
        100
      ),
      operations: result.executed
        ? [
            {
              id: `nuke-op-${Date.now()}`,
              name: `STRATCOM Strike: ${result.targetName}`,
              region: result.targetName,
              posture: 'Active Strike',
              personnelCount: 'Strategic Triad Wings & Missile Commands',
              statusNote: result.summary,
            },
            ...prev.operations,
          ]
        : prev.operations,
    }));

    setBlocs((prev) => {
      const next = { ...prev };
      (Object.keys(result.blocDeltas) as (keyof VoterBlocs)[]).forEach((bKey) => {
        const delta = result.blocDeltas[bKey] || 0;
        next[bKey] = clamp(Math.round(next[bKey] + delta), 5, 95);
      });
      return next;
    });

    setCabinet((prev) =>
      prev.map((member) => {
        const nextLoyalty = clamp(
          Math.round(member.loyalty + result.cabinetLoyaltyDelta),
          10,
          98
        );
        const nextStatus: CabinetMember['status'] =
          nextLoyalty >= 65
            ? 'Aligned'
            : nextLoyalty >= 42
            ? 'Cautious'
            : 'Strained';
        return {
          ...member,
          loyalty: nextLoyalty,
          status: nextStatus,
        };
      })
    );

    if (result.executed && result.targetCategory === 'state') {
      setInstitutions((prev) => ({
        ...prev,
        judiciaryClimate: 'Hostile',
        pendingCourtNote: `Emergency Supreme Court petitions filed following domestic nuclear deployment against ${result.targetName}.`,
      }));
    }

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-nuke-${Date.now()}`,
        month: currentMonth,
        recordType: result.requireCongressApproval
          ? 'Legislation'
          : 'Executive Order',
        title: `${result.warPowersStatus}: ${result.targetName}`,
        summary: result.summary,
        outcomeStatus: result.executed ? 'Enacted' : 'Blocked',
        approvalImpact: result.metricDeltas.approval,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-nuke-${Date.now()}`,
        month: currentMonth,
        category: result.executed ? 'Security' : 'Constitutional',
        title: result.headline,
        description: result.summary,
      },
    ]);

    setNewsFeed((prev) => [...prev, result.mediaHeadline]);
    playDeskSound(result.executed ? 'alert' : 'stamp', muted);
  };

  const handleQueueSecurityOrder = (orderText: string, speechText: string) => {
    playDeskSound('select', muted);
    setPolicyDraftText((prev) =>
      prev.trim() ? `${prev.trim()}\n\n${orderText}` : orderText
    );
    if (!speechDraftText.trim()) {
      setSpeechDraftText(speechText);
    }
    setActiveTab('briefing');
  };

  const handleSynthesizeLibrary = async () => {
    setSynthesisError(null);
    setIsSynthesizingLibrary(true);
    playDeskSound('select', muted);
    try {
      const data = await postSimulationApi<LibrarySynthesis>(
        '/api/synthesize-library',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          initialMetrics,
          metrics,
          legislativeRecords,
          history: history.map((h) => ({
            month: h.month,
            policyDirective: h.policyDirective.slice(0, 140),
            outcome: { newspaperHeadline: h.outcome.newspaperHeadline },
          })),
        },
        'Failed to synthesize library retrospective.'
      );
      setLibrarySynthesis(data);
    } catch (err) {
      setSynthesisError(
        err instanceof Error
          ? err.message
          : 'Unable to synthesize retrospective.'
      );
    } finally {
      setIsSynthesizingLibrary(false);
    }
  };

  const triggerEvaluation = async (
    finalMetrics: NationalMetrics,
    finalBlocs: VoterBlocs,
    finalHistory: TermHistoryEntry[]
  ) => {
    setIsLoadingEval(true);
    try {
      const data = await postSimulationApi<CareerEvaluation>(
        '/api/evaluate-term',
        {
          profile,
          scenarioTitle,
          metrics: finalMetrics,
          blocs: finalBlocs,
          reelectionCampaign,
          history: finalHistory.map((h) => ({
            month: h.month,
            policyDirective: h.policyDirective.slice(0, 140),
            outcome: { newspaperHeadline: h.outcome.newspaperHeadline },
          })),
        },
        'Failed to evaluate term.'
      );
      setEvaluation(data);
    } catch {
      // Non-fatal
    } finally {
      setIsLoadingEval(false);
    }
  };

  const handleIssuePublicStatement = async (
    statementText: string,
    venue: StatementVenue
  ) => {
    const clean = statementText.trim();
    if (!clean || isIssuingStatement) return;
    setErrorMsg(null);
    setIsIssuingStatement(true);
    playDeskSound('select', muted);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postSimulationApi<any>(
        '/api/public-statement',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          cabinet,
          currentBriefing,
          statement: clean,
          venue,
        },
        'Unable to deliver public statement.'
      );

      const stampedMedia: NewsHeadlineItem[] = (data.mediaReactions || []).map(
        (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
          ...item,
          id: `stmt-m${currentMonth}-${Date.now()}-${idx}`,
          month: currentMonth,
        })
      );

      const md = data.metricDeltas || {
        approval: 0,
        congressSupport: 0,
        diplomaticStanding: 0,
      };
      const vd = data.voterBlocDeltas || {
        workingClass: 0,
        suburbanModerates: 0,
        techFinance: 0,
        seniors: 0,
        youngVoters: 0,
      };

      setMetrics((prev) => ({
        ...prev,
        approval: clamp(
          Number((prev.approval + Number(md.approval || 0)).toFixed(1)),
          0,
          95
        ),
        congressSupport: clamp(
          Number(
            (prev.congressSupport + Number(md.congressSupport || 0)).toFixed(1)
          ),
          5,
          95
        ),
        diplomaticStanding: clamp(
          Number(
            (
              prev.diplomaticStanding + Number(md.diplomaticStanding || 0)
            ).toFixed(1)
          ),
          5,
          100
        ),
      }));

      setBlocs((prev) => ({
        workingClass: clamp(
          Math.round(prev.workingClass + Number(vd.workingClass || 0)),
          5,
          95
        ),
        suburbanModerates: clamp(
          Math.round(
            prev.suburbanModerates + Number(vd.suburbanModerates || 0)
          ),
          5,
          95
        ),
        techFinance: clamp(
          Math.round(prev.techFinance + Number(vd.techFinance || 0)),
          5,
          95
        ),
        seniors: clamp(
          Math.round(prev.seniors + Number(vd.seniors || 0)),
          5,
          95
        ),
        youngVoters: clamp(
          Math.round(prev.youngVoters + Number(vd.youngVoters || 0)),
          5,
          95
        ),
      }));

      const statementLeadStory: NewsHeadlineItem = {
        id: `stmt-lead-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        outlet: data.leadOutlet || 'The Washington Chronicle',
        category: 'politics',
        headline: data.leadHeadline || 'White House Remarks Draw Immediate Reaction',
        summary: `${data.mediaSummary || ''}${
          data.congressReaction
            ? ` Congress (${data.congressReaction.oversightStatus}): ${data.congressReaction.chamberSummary}`
            : ''
        }`.trim(),
        tone:
          Number(md.approval || 0) >= 0.8
            ? 'positive'
            : Number(md.approval || 0) <= -0.8
            ? 'critical'
            : 'neutral',
      };
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [statementLeadStory, ...stampedMedia])
      );

      setLatestStatementResult({
        id: `stmt-${Date.now()}`,
        month: currentMonth,
        venue: data.venue || venue,
        statement: data.statement || clean,
        leadOutlet: data.leadOutlet || 'The Washington Chronicle',
        leadHeadline: data.leadHeadline || 'White House Remarks Draw Swift Reaction',
        mediaSummary: data.mediaSummary || '',
        congressReaction: data.congressReaction,
        advisorResponses: data.advisorResponses || [],
        mediaReactions: stampedMedia,
        metricDeltas: md,
        voterBlocDeltas: vd,
      });
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to process public statement.'
      );
    } finally {
      setIsIssuingStatement(false);
    }
  };

  const handleFetchPressConferenceQuestions = async (): Promise<
    PressConferenceQuestion[]
  > => {
    const data = await postSimulationApi<{
      questions: PressConferenceQuestion[];
    }>(
      '/api/press-conference/questions',
      {
        profile,
        scenarioTitle,
        currentMonth,
        metrics,
        history,
        newsFeed,
        legislativeRecords,
        diplomaticMissions,
        currentBriefing,
      },
      'Unable to generate press corps questions.'
    );
    return Array.isArray(data.questions) ? data.questions : [];
  };

  const handleAnswerPressConferenceQuestion = async (
    questionItem: PressConferenceQuestion,
    answer: string
  ): Promise<PressConferenceQuestionResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await postSimulationApi<any>(
      '/api/press-conference/answer',
      {
        profile,
        scenarioTitle,
        currentMonth,
        metrics,
        cabinet,
        questionItem,
        answer,
      },
      'Unable to process press conference answer.'
    );

    const approvalDelta = Number(data.approvalDelta || 0);
    const congressDelta = Number(data.congressDelta || 0);
    const diplomaticDelta = Number(data.diplomaticDelta || 0);
    const vd = data.voterBlocDeltas || {
      workingClass: 0,
      suburbanModerates: 0,
      techFinance: 0,
      seniors: 0,
      youngVoters: 0,
    };

    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((metrics.congressSupport + congressDelta).toFixed(1)),
        5,
        95
      ),
      diplomaticStanding: clamp(
        Number((metrics.diplomaticStanding + diplomaticDelta).toFixed(1)),
        5,
        100
      ),
    };
    setMetrics(nextMetrics);

    setBlocs((prev) => ({
      workingClass: clamp(
        Math.round(prev.workingClass + Number(vd.workingClass || 0)),
        5,
        95
      ),
      suburbanModerates: clamp(
        Math.round(prev.suburbanModerates + Number(vd.suburbanModerates || 0)),
        5,
        95
      ),
      techFinance: clamp(
        Math.round(prev.techFinance + Number(vd.techFinance || 0)),
        5,
        95
      ),
      seniors: clamp(
        Math.round(prev.seniors + Number(vd.seniors || 0)),
        5,
        95
      ),
      youngVoters: clamp(
        Math.round(prev.youngVoters + Number(vd.youngVoters || 0)),
        5,
        95
      ),
    }));

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const stampedMedia: NewsHeadlineItem[] = (data.mediaReactions || []).map(
      (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
        ...item,
        id: `pc-m${currentMonth}-${Date.now()}-${idx}`,
        month: currentMonth,
      })
    );

    const leadStory: NewsHeadlineItem = {
      id: `pc-lead-${currentMonth}-${Date.now()}`,
      month: currentMonth,
      outlet: questionItem.outlet,
      category: questionItem.beat,
      headline: String(
        data.leadHeadline ||
          `President Fields ${questionItem.outlet} Question at Briefing`
      ),
      summary: String(data.mediaSummary || ''),
      tone:
        approvalDelta >= 0.8
          ? 'positive'
          : approvalDelta <= -0.8
          ? 'critical'
          : 'neutral',
    };

    setNewsFeed((prev) => mergeNewsStories(prev, [leadStory, ...stampedMedia]));
    playDeskSound(approvalDelta >= 0 ? 'stamp' : 'alert', muted);

    return {
      id: `pc-res-${currentMonth}-${Date.now()}`,
      month: currentMonth,
      reporterName: questionItem.reporterName,
      outlet: questionItem.outlet,
      beat: questionItem.beat,
      question: questionItem.question,
      playerAnswer: answer,
      verdictLabel: data.verdictLabel || 'Measured Clarification',
      leadHeadline: leadStory.headline,
      mediaSummary: leadStory.summary,
      reporterFollowUp: String(data.reporterFollowUp || ''),
      approvalDelta,
      congressDelta,
      diplomaticDelta,
      mediaReactions: stampedMedia,
      voterBlocDeltas: {
        workingClass: Number(vd.workingClass || 0),
        suburbanModerates: Number(vd.suburbanModerates || 0),
        techFinance: Number(vd.techFinance || 0),
        seniors: Number(vd.seniors || 0),
        youngVoters: Number(vd.youngVoters || 0),
      },
    };
  };

  const handleExecuteUnscriptedAction = async (
    actionText: string,
    visibility: UnscriptedActionVisibility
  ) => {
    const clean = actionText.trim();
    if (!clean || isExecutingUnscriptedAction) return;
    setErrorMsg(null);
    setIsExecutingUnscriptedAction(true);
    playDeskSound('stamp', muted);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postSimulationApi<any>(
        '/api/unscripted-action',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          cabinet,
          currentBriefing,
          action: clean,
          visibility,
        },
        'Unable to process unscripted action.'
      );

      const stampedMedia: NewsHeadlineItem[] = (data.mediaReactions || []).map(
        (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
          ...item,
          id: `act-m${currentMonth}-${Date.now()}-${idx}`,
          month: currentMonth,
        })
      );

      const md = data.metricDeltas || {
        approval: 0,
        congressSupport: 0,
        diplomaticStanding: 0,
      };
      const vd = data.voterBlocDeltas || {
        workingClass: 0,
        suburbanModerates: 0,
        techFinance: 0,
        seniors: 0,
        youngVoters: 0,
      };

      const nextMetrics: NationalMetrics = {
        ...metrics,
        approval: clamp(
          Number((metrics.approval + Number(md.approval || 0)).toFixed(1)),
          0,
          95
        ),
        congressSupport: clamp(
          Number(
            (metrics.congressSupport + Number(md.congressSupport || 0)).toFixed(1)
          ),
          5,
          95
        ),
        diplomaticStanding: clamp(
          Number(
            (
              metrics.diplomaticStanding + Number(md.diplomaticStanding || 0)
            ).toFixed(1)
          ),
          5,
          100
        ),
      };

      setMetrics(nextMetrics);
      setBlocs((prev) => ({
        workingClass: clamp(
          Math.round(prev.workingClass + Number(vd.workingClass || 0)),
          5,
          95
        ),
        suburbanModerates: clamp(
          Math.round(
            prev.suburbanModerates + Number(vd.suburbanModerates || 0)
          ),
          5,
          95
        ),
        techFinance: clamp(
          Math.round(prev.techFinance + Number(vd.techFinance || 0)),
          5,
          95
        ),
        seniors: clamp(
          Math.round(prev.seniors + Number(vd.seniors || 0)),
          5,
          95
        ),
        youngVoters: clamp(
          Math.round(prev.youngVoters + Number(vd.youngVoters || 0)),
          5,
          95
        ),
      }));

      if (reelectionCampaign.decision === 'running') {
        const { projectedVoteShare, battlegroundEdge } =
          computeCampaignProjection(
            nextMetrics,
            reelectionCampaign.campaignMomentum
          );
        setReelectionCampaign((prev) => ({
          ...prev,
          projectedVoteShare,
          battlegroundEdge,
        }));
      }

      if (data.legislativeRecord) {
        setLegislativeRecords((prev) => [
          ...prev,
          {
            id: `act-leg-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            recordType: 'Institutional',
            title: data.legislativeRecord.title,
            summary: data.legislativeRecord.summary,
            outcomeStatus: data.legislativeRecord.outcomeStatus,
            approvalImpact: Number(md.approval || 0),
          },
        ]);
      }

      if (data.milestone) {
        setMilestones((prev) => [
          ...prev,
          {
            id: `act-ms-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            category: data.milestone.category,
            title: data.milestone.title,
            description: data.milestone.description,
          },
        ]);
      }

      const unscriptedLeadStory: NewsHeadlineItem = {
        id: `act-lead-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        outlet: data.leadOutlet || 'The Washington Chronicle',
        category: 'politics',
        headline:
          data.leadHeadline ||
          'Capitol Hill Reacts to Unscripted Presidential Action',
        summary: `${data.mediaSummary || ''} Congress (${
          data.congressReaction?.oversightStatus || 'Partisan Criticism'
        }): ${data.congressReaction?.chamberSummary || ''}`.trim(),
        tone:
          Number(md.approval || 0) >= 1.0
            ? 'positive'
            : Number(md.approval || 0) <= -1.0 ||
              data.congressReaction?.censureRisk === 'Elevated' ||
              data.congressReaction?.censureRisk === 'Severe'
            ? 'critical'
            : 'neutral',
      };
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [unscriptedLeadStory, ...stampedMedia])
      );

      setLatestUnscriptedResult({
        id: `act-${Date.now()}`,
        month: currentMonth,
        action: data.action || clean,
        visibility: data.visibility || visibility,
        leakedToPress: true,
        leadOutlet: data.leadOutlet || 'The Washington Chronicle',
        leadHeadline:
          data.leadHeadline || 'Capitol Hill Reacts to Unscripted Presidential Action',
        mediaSummary: data.mediaSummary || '',
        congressReaction: data.congressReaction,
        advisorResponses: data.advisorResponses || [],
        mediaReactions: stampedMedia,
        metricDeltas: md,
        voterBlocDeltas: vd,
      });
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to process unscripted presidential action.'
      );
    } finally {
      setIsExecutingUnscriptedAction(false);
    }
  };

  const handleExecuteSituationScenario = async (params: {
    scenarioType: SituationScenarioType;
    targetCountry: string;
    orderSummary: string;
    seekCongressAuthorization: boolean;
  }) => {
    const cleanOrder = params.orderSummary.trim();
    if (!cleanOrder || isResolvingSituation) return;
    setErrorMsg(null);
    setIsResolvingSituation(true);
    playDeskSound('stamp', muted);

    const targetTheater = resolveCountryToTheater(params.targetCountry);
    const theaterInfluence = computeTheaterInfluence(
      targetTheater.id,
      theaterAssignments,
      militaryRoster,
      military
    );
    const theaterContextPayload = {
      theaterId: targetTheater.id,
      theaterName: targetTheater.name,
      commandCode: targetTheater.commandCode,
      assignedUnitCount: theaterInfluence.unitCount,
      assignedUnitNames: theaterInfluence.assignedUnits.map(
        (d) => d.unit.name
      ),
      diplomacyOddsBonusPct: theaterInfluence.diplomacyOddsBonusPct,
      securityOddsBonusPct: theaterInfluence.securityOddsBonusPct,
      operationSuccessProbabilityPct:
        theaterInfluence.operationSuccessProbabilityPct,
      deterrenceLabel: theaterInfluence.deterrenceLabel,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postSimulationApi<any>(
        '/api/situation-room',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          cabinet,
          military,
          scenarioType: params.scenarioType,
          targetCountry: params.targetCountry,
          orderSummary: cleanOrder,
          seekCongressAuthorization: params.seekCongressAuthorization,
          theaterContext: theaterContextPayload,
        },
        'Situation Room action failed.'
      );

      const stampedMedia: NewsHeadlineItem[] = (data.mediaReactions || []).map(
        (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
          ...item,
          id: `sit-m${currentMonth}-${Date.now()}-${idx}`,
          month: currentMonth,
        })
      );

      const md = data.metricDeltas || {
        approval: 0,
        congressSupport: 0,
        diplomaticStanding: 0,
        gdpGrowth: 0,
        inflation: 0,
        nationalDebtTrillions: 0,
      };
      const vd = data.voterBlocDeltas || {
        workingClass: 0,
        suburbanModerates: 0,
        techFinance: 0,
        seniors: 0,
        youngVoters: 0,
      };

      setMetrics((prev) => ({
        ...prev,
        approval: clamp(
          Number((prev.approval + Number(md.approval || 0)).toFixed(1)),
          0,
          95
        ),
        congressSupport: clamp(
          Number(
            (prev.congressSupport + Number(md.congressSupport || 0)).toFixed(1)
          ),
          5,
          95
        ),
        diplomaticStanding: clamp(
          Number(
            (
              prev.diplomaticStanding + Number(md.diplomaticStanding || 0)
            ).toFixed(1)
          ),
          5,
          100
        ),
        gdpGrowth: clamp(
          Number((prev.gdpGrowth + Number(md.gdpGrowth || 0)).toFixed(2)),
          -6.0,
          8.5
        ),
        inflation: clamp(
          Number((prev.inflation + Number(md.inflation || 0)).toFixed(2)),
          0.5,
          14.0
        ),
        nationalDebtTrillions: Number(
          Math.max(
            1,
            prev.nationalDebtTrillions + Number(md.nationalDebtTrillions || 0)
          ).toFixed(2)
        ),
      }));

      setBlocs((prev) => ({
        workingClass: clamp(
          Math.round(prev.workingClass + Number(vd.workingClass || 0)),
          5,
          95
        ),
        suburbanModerates: clamp(
          Math.round(
            prev.suburbanModerates + Number(vd.suburbanModerates || 0)
          ),
          5,
          95
        ),
        techFinance: clamp(
          Math.round(prev.techFinance + Number(vd.techFinance || 0)),
          5,
          95
        ),
        seniors: clamp(
          Math.round(prev.seniors + Number(vd.seniors || 0)),
          5,
          95
        ),
        youngVoters: clamp(
          Math.round(prev.youngVoters + Number(vd.youngVoters || 0)),
          5,
          95
        ),
      }));

      if (data.militaryUpdates) {
        const mu = data.militaryUpdates;
        setMilitary((prev) => ({
          jointChiefsChair: prev.jointChiefsChair,
          defconLevel: clamp(
            Number(mu.defconLevel || prev.defconLevel),
            1,
            5
          ) as 1 | 2 | 3 | 4 | 5,
          forceReadiness: clamp(
            Math.round(prev.forceReadiness + Number(mu.readinessDelta || 0)),
            30,
            100
          ),
          defenseBudgetBillions: Math.max(
            400,
            Math.round(
              prev.defenseBudgetBillions +
                Number(mu.defenseBudgetDeltaBillions || 0)
            )
          ),
          cyberPosture: mu.cyberPosture || prev.cyberPosture,
          intelThreatLevel: mu.intelThreatLevel || prev.intelThreatLevel,
          intelSummary: mu.intelSummary || prev.intelSummary,
          operations: Array.isArray(mu.operations)
            ? mu.operations.map(
                (op: MilitaryCommandState['operations'][number], i: number) => ({
                  ...op,
                  id: `sit-m${currentMonth}-op-${Date.now()}-${i}`,
                })
              )
            : prev.operations,
        }));
      }

      if (Array.isArray(data.cabinetResponses)) {
        setCabinet((prev) =>
          prev.map((member) => {
            const resp = data.cabinetResponses.find(
              (r: { departmentId?: string; speaker?: string }) =>
                r.departmentId === member.id || r.speaker === member.name
            );
            if (!resp) return member;
            const nextLoyalty = clamp(
              Math.round(member.loyalty + Number(resp.loyaltyDelta || 0)),
              15,
              98
            );
            const nextStatus: CabinetMember['status'] =
              nextLoyalty >= 65
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained';
            return {
              ...member,
              loyalty: nextLoyalty,
              status: nextStatus,
              currentCounsel: resp.quote || member.currentCounsel,
            };
          })
        );
      }

      if (data.legislativeRecord) {
        setLegislativeRecords((prev) => [
          ...prev,
          {
            id: `sit-leg-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            recordType: data.legislativeRecord.recordType,
            title: data.legislativeRecord.title,
            summary: data.legislativeRecord.summary,
            outcomeStatus: data.legislativeRecord.outcomeStatus,
            approvalImpact: Number(md.approval || 0),
          },
        ]);
      }

      if (data.milestone) {
        setMilestones((prev) => [
          ...prev,
          {
            id: `sit-ms-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            category: data.milestone.category,
            title: data.milestone.title,
            description: data.milestone.description,
          },
        ]);
      }

      const sitLeadStory: NewsHeadlineItem = {
        id: `sit-lead-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        outlet: data.leadOutlet || 'Reuters World Desk',
        category: 'defense',
        headline:
          data.leadHeadline || 'Situation Room Issues Strategic Directive',
        summary: `${data.mediaSummary || ''} Congress (${
          data.congressResponse?.warPowersStatus || 'Briefed'
        }): ${data.congressResponse?.chamberSummary || ''}`.trim(),
        tone:
          Number(md.approval || 0) >= 1.5
            ? 'positive'
            : Number(md.approval || 0) <= -1.5
            ? 'critical'
            : 'neutral',
      };
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [sitLeadStory, ...stampedMedia])
      );
      setLatestSituationResult({
        id: `sit-${Date.now()}`,
        month: currentMonth,
        scenarioType: data.scenarioType || params.scenarioType,
        targetCountry: data.targetCountry || params.targetCountry,
        orderSummary: data.orderSummary || cleanOrder,
        leadOutlet: data.leadOutlet || 'Reuters World Desk',
        leadHeadline:
          data.leadHeadline || 'Situation Room Issues Strategic Directive',
        mediaSummary: data.mediaSummary || '',
        congressResponse: data.congressResponse,
        cabinetResponses: data.cabinetResponses || [],
        mediaReactions: stampedMedia,
        metricDeltas: md,
        voterBlocDeltas: vd,
        theaterDeploymentContext: theaterContextPayload,
      });
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to resolve Situation Room decision.'
      );
    } finally {
      setIsResolvingSituation(false);
    }
  };

  const handleRunForReelection = () => {
    const partyId = resolvePartyId(profile.party, profile.coalition);
    const challenger = pickChallengerForParty(partyId, profile.name);
    const initialMomentum = metrics.approval >= 50 ? 2 : -1;
    const { projectedVoteShare, battlegroundEdge } = computeCampaignProjection(
      metrics,
      initialMomentum
    );
    setReelectionCampaign({
      decision: 'running',
      announcedMonth: currentMonth,
      opponentName: challenger.opponentName,
      opponentParty: challenger.opponentParty,
      campaignSlogan: challenger.campaignSlogan,
      campaignMomentum: initialMomentum,
      projectedVoteShare,
      battlegroundEdge,
      eventsHeld: 0,
    });
    setShowReelectionPrompt(false);
    setNewsFeed((prev) =>
      [
        ...prev,
        {
          id: `reelect-run-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'Associated Press',
          category: 'politics' as const,
          headline: `President ${profile.name} Launches Official Re-Election Campaign`,
          summary: `With ${profile.termLength - currentMonth + 1} months remaining in the term, the White House opened campaign headquarters to face ${challenger.opponentName} (${challenger.opponentParty}).`,
          tone: 'neutral' as const,
        },
      ].slice(-60)
    );
    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-reelect-run-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        category: 'Political',
        title: `Launched Re-Election Campaign (${challenger.campaignSlogan})`,
        description: `Entered the race against ${challenger.opponentName} (${challenger.opponentParty}) at ${projectedVoteShare.toFixed(1)}% projected vote share.`,
      },
    ]);
    playDeskSound('alert', muted);
  };

  const handleDeclineReelection = () => {
    setReelectionCampaign((prev) => ({
      ...prev,
      decision: 'declined',
      announcedMonth: currentMonth,
    }));
    setShowReelectionPrompt(false);
    setMetrics((prev) => ({
      ...prev,
      approval: clamp(Number((prev.approval + 1.0).toFixed(1)), 0, 95),
      congressSupport: clamp(
        Number((prev.congressSupport + 1.5).toFixed(1)),
        5,
        95
      ),
    }));
    setNewsFeed((prev) =>
      [
        ...prev,
        {
          id: `reelect-decline-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'The Washington Chronicle',
          category: 'politics' as const,
          headline: `President ${profile.name} Declines Re-Election Bid to Focus on Current Term`,
          summary: `Lawmakers from both parties reacted with respect as the President pledged to govern without campaign politics through the remainder of the term.`,
          tone: 'positive' as const,
        },
      ].slice(-60)
    );
    playDeskSound('select', muted);
  };

  const handleResolveCabinetScandal = (decision: CabinetScandalDecision) => {
    if (!pendingScandal) return;

    const severityMult =
      pendingScandal.severity === 'Critical'
        ? 1.5
        : pendingScandal.severity === 'Severe'
        ? 1.25
        : 1.0;

    const approvalDelta =
      decision === 'fire'
        ? Number((3.2 * severityMult).toFixed(1))
        : decision === 'investigate'
        ? Number((1.2 * severityMult).toFixed(1))
        : Number((-4.0 * severityMult).toFixed(1));

    const congressDelta =
      decision === 'fire'
        ? Number((3.0 * severityMult).toFixed(1))
        : decision === 'investigate'
        ? Number((2.0 * severityMult).toFixed(1))
        : Number((-4.5 * severityMult).toFixed(1));

    const diplomaticDelta =
      decision === 'fire'
        ? Number((0.8 * severityMult).toFixed(1))
        : decision === 'investigate'
        ? Number((0.5 * severityMult).toFixed(1))
        : Number((-1.0 * severityMult).toFixed(1));

    const blocSwing =
      decision === 'fire'
        ? Math.round(3 * severityMult)
        : decision === 'investigate'
        ? Math.round(1 * severityMult)
        : -Math.round(4 * severityMult);

    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(Number((metrics.approval + approvalDelta).toFixed(1)), 0, 95),
      congressSupport: clamp(
        Number((metrics.congressSupport + congressDelta).toFixed(1)),
        5,
        95
      ),
      diplomaticStanding: clamp(
        Number((metrics.diplomaticStanding + diplomaticDelta).toFixed(1)),
        5,
        100
      ),
    };

    setMetrics(nextMetrics);
    setBlocs((prev) => ({
      workingClass: clamp(prev.workingClass + Math.round(blocSwing * 0.7), 5, 95),
      suburbanModerates: clamp(prev.suburbanModerates + blocSwing, 5, 95),
      techFinance: clamp(prev.techFinance + Math.round(blocSwing * 0.5), 5, 95),
      seniors: clamp(prev.seniors + Math.round(blocSwing * 0.8), 5, 95),
      youngVoters: clamp(prev.youngVoters + blocSwing, 5, 95),
    }));

    setCabinet((prev) =>
      prev.map((member) => {
        const isTarget = member.id === pendingScandal.departmentId;
        if (decision === 'fire') {
          if (isTarget) {
            return {
              ...member,
              name: `Acting ${member.roleTitle}`,
              leaning: 'Interim Caretaker',
              loyalty: 68,
              competence: 72,
              status: 'Cautious',
              currentCounsel: `Serving in an acting capacity after the dismissal of ${pendingScandal.memberName}. Recommend nominating a Senate-confirmed replacement promptly.`,
            };
          }
          const nextLoyalty = clamp(member.loyalty - 6, 15, 98);
          return {
            ...member,
            loyalty: nextLoyalty,
            status:
              nextLoyalty >= 65
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained',
          };
        }

        if (decision === 'investigate') {
          const delta = isTarget ? -Math.round(16 * severityMult) : -2;
          const nextLoyalty = clamp(member.loyalty + delta, 15, 98);
          return {
            ...member,
            loyalty: nextLoyalty,
            status:
              nextLoyalty >= 65
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained',
            currentCounsel: isTarget
              ? 'Cooperating formally with the independent review, though relations with the West Wing are tense.'
              : member.currentCounsel,
          };
        }

        // 'defend'
        const delta = isTarget ? 20 : 4;
        const nextLoyalty = clamp(member.loyalty + delta, 15, 98);
        return {
          ...member,
          loyalty: nextLoyalty,
          status:
            nextLoyalty >= 65
              ? 'Aligned'
              : nextLoyalty >= 45
              ? 'Cautious'
              : 'Strained',
          currentCounsel: isTarget
            ? 'Deeply grateful for the President’s public backing amid intense media and Capitol Hill scrutiny.'
            : member.currentCounsel,
        };
      })
    );

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const headline =
      decision === 'fire'
        ? `White House Fires ${pendingScandal.roleTitle} ${pendingScandal.memberName} Amid Scandal`
        : decision === 'investigate'
        ? `President Orders Independent Ethics Probe Into ${pendingScandal.memberName}`
        : `President Publicly Defends ${pendingScandal.memberName} Against Ethics Allegations`;

    const summary =
      decision === 'fire'
        ? `Swift dismissal drew relief on Capitol Hill (${congressDelta >= 0 ? '+' : ''}${congressDelta}% Congress, ${approvalDelta >= 0 ? '+' : ''}${approvalDelta}% approval) while unsettling senior West Wing aides.`
        : decision === 'investigate'
        ? `Inspector General and DOJ ethics officials launched a formal review, steadying congressional critics while straining internal Cabinet loyalty.`
        : `Standing firmly behind ${pendingScandal.memberName} rallied Cabinet solidarity (+20% loyalty) at steep political cost (${approvalDelta}% approval).`;

    setNewsFeed((prev) =>
      [
        ...prev,
        {
          id: `scandal-res-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: pendingScandal.outlet,
          category: 'politics' as const,
          headline,
          summary,
          tone:
            decision === 'fire'
              ? ('positive' as const)
              : decision === 'investigate'
              ? ('neutral' as const)
              : ('critical' as const),
        },
      ].slice(-60)
    );

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-scandal-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        category: 'Political',
        title: headline,
        description: `${pendingScandal.severity} Cabinet scandal response: ${summary}`,
      },
    ]);

    if (decision !== 'defend') {
      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-scandal-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title:
            decision === 'fire'
              ? `Cabinet Dismissal: ${pendingScandal.memberName} (${pendingScandal.roleTitle})`
              : `Ethics Investigation Ordered: ${pendingScandal.memberName}`,
          summary,
          outcomeStatus: decision === 'fire' ? 'Enacted' : 'Compromise',
          approvalImpact: approvalDelta,
        },
      ]);
    }

    playDeskSound(decision === 'defend' ? 'alert' : 'stamp', muted);
    setPendingScandal(null);
  };

  const handleCompleteHarmonyMeeting = (outcome: CabinetHarmonyOutcome) => {
    setCabinet((prev) =>
      prev.map((member) =>
        member.id === outcome.memberId
          ? {
              ...member,
              loyalty: outcome.newLoyalty,
              status: outcome.newStatus,
              currentCounsel: outcome.updatedCounsel,
            }
          : member
      )
    );

    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + outcome.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((metrics.congressSupport + outcome.congressDelta).toFixed(1)),
        5,
        95
      ),
    };
    setMetrics(nextMetrics);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    setHarmonyMeetingMonths((prev) => ({
      ...prev,
      [outcome.memberId]: currentMonth,
    }));

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `harmony-${outcome.memberId}-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: outcome.revealedScandal
            ? outcome.revealedScandal.outlet
            : 'West Wing Pool Report',
          category: 'politics',
          headline: outcome.headline,
          summary: outcome.summary,
          tone: outcome.revealedScandal
            ? 'critical'
            : outcome.loyaltyDelta >= 0
            ? 'positive'
            : 'neutral',
        },
      ])
    );

    if (outcome.revealedScandal) {
      setLatestHarmonyOutcome(null);
      setPendingScandal(outcome.revealedScandal);
      playDeskSound('alert', muted);
    } else {
      setLatestHarmonyOutcome(outcome);
      playDeskSound(outcome.loyaltyDelta >= 0 ? 'stamp' : 'select', muted);
    }
  };

  const handleConfirmResign = (statement: string) => {
    const cleanNote = statement.trim();
    const reasonText = cleanNote
      ? `President ${profile.name} resigned from office in Month ${currentMonth}: “${cleanNote}” Vice President ${vicePresident.name} assumed the Presidency.`
      : `President ${profile.name} voluntarily resigned from office in Month ${currentMonth}, transferring executive authority to Vice President ${vicePresident.name}.`;

    setShowResignModal(false);
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
    setPendingScandal(null);
    setShowReelectionPrompt(false);

    setNewsFeed((prev) =>
      [
        ...prev,
        {
          id: `resign-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'The Washington Chronicle',
          category: 'politics' as const,
          headline: `President ${profile.name} Resigns From Office; ${vicePresident.name} Sworn In`,
          summary: reasonText,
          tone: 'critical' as const,
        },
      ].slice(-60)
    );

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-resign-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        category: 'Constitutional',
        title: `Presidential Resignation — Month ${currentMonth}`,
        description: reasonText,
      },
    ]);

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `leg-resign-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        recordType: 'Institutional',
        title: `Letter of Presidential Resignation (${profile.name})`,
        summary: reasonText,
        outcomeStatus: 'Enacted',
        approvalImpact: 0,
      },
    ]);

    setCollapseReason(reasonText);
    setPhase('CAREER_END');
    playDeskSound('alert', muted);
    triggerEvaluation(metrics, blocs, history);
  };

  const handleRunImpeachment = async (
    strategy: ImpeachmentStrategy,
    defenseStatement: string
  ) => {
    if (isRunningImpeachment) return;
    setErrorMsg(null);
    setIsRunningImpeachment(true);
    playDeskSound('stamp', muted);

    try {
      const data = await postSimulationApi<ImpeachmentResult>(
        '/api/impeachment',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          strategy,
          defenseStatement,
          recentHistory: history.slice(-4).map((h) => ({
            month: h.month,
            policyDirective: h.policyDirective.slice(0, 180),
            outcome: { newspaperHeadline: h.outcome.newspaperHeadline },
          })),
        },
        'Failed to hold impeachment proceedings.'
      );

      setImpeachmentResult(data);

      setNewsFeed((prev) =>
        [
          ...prev,
          {
            id: `imp-m${currentMonth}-${Date.now()}`,
            month: currentMonth,
            outlet: data.leadOutlet,
            category: 'politics' as const,
            headline: data.leadHeadline,
            summary: data.verdictSummary,
            tone: data.senateConvicted ? ('critical' as const) : ('neutral' as const),
          },
        ].slice(-60)
      );

      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `leg-imp-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          recordType: 'Institutional',
          title: `${data.articlesTitle} (House ${data.houseYea}–${data.houseNay}${
            data.houseImpeached
              ? ` · Senate ${data.senateYea}–${data.senateNay}`
              : ''
          })`,
          summary: data.verdictSummary,
          outcomeStatus: data.senateConvicted ? 'Enacted' : 'Blocked',
          approvalImpact: data.approvalDelta,
        },
      ]);

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-imp-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          category: 'Constitutional',
          title: data.senateConvicted
            ? `Impeached & Removed by Senate (${data.senateYea}–${data.senateNay})`
            : data.houseImpeached
            ? `Acquitted in Senate Trial (${data.senateYea}–${data.senateNay})`
            : `Impeachment Articles Defeated in House (${data.houseYea}–${data.houseNay})`,
          description: data.verdictSummary,
        },
      ]);

      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Impeachment vote could not be completed.'
      );
    } finally {
      setIsRunningImpeachment(false);
    }
  };

  const handleCompleteImpeachmentRemoval = (result: ImpeachmentResult) => {
    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((metrics.congressSupport + result.congressDelta).toFixed(1)),
        5,
        95
      ),
    };
    setMetrics(nextMetrics);
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
    setCollapseReason(
      `The House impeached (${result.houseYea}–${result.houseNay}) and the Senate convicted President ${profile.name} (${result.senateYea}–${result.senateNay}) in Month ${currentMonth}, removing the administration from office and elevating Vice President ${vicePresident.name}.`
    );
    setPhase('CAREER_END');
    triggerEvaluation(nextMetrics, blocs, history);
  };

  const handleCloseImpeachmentSurvived = (result: ImpeachmentResult) => {
    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((prev.congressSupport + result.congressDelta).toFixed(1)),
        5,
        95
      ),
    }));
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
  };

  const handleSubmitTurn = async (
    policyDirective: string,
    publicMessaging: string,
    personalAction = ''
  ) => {
    setErrorMsg(null);
    setPhase('SIMULATING');
    playDeskSound('stamp', muted);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postSimulationApi<any>(
        '/api/simulate-turn',
        {
          profile,
          vicePresident,
          scenarioTitle,
          currentMonth,
          metrics,
          blocs,
          cabinet,
          military,
          institutions,
          currentBriefing,
          policyDirective,
          personalAction,
          publicMessaging,
          reelectionCampaign,
          recentHistory: history.slice(-4).map((h) => ({
            month: h.month,
            policyDirective: h.policyDirective.slice(0, 180),
            outcome: { newspaperHeadline: h.outcome.newspaperHeadline },
          })),
        },
        'Simulation failed.'
      );

      const rawOutcome = data.outcome;
      const newWireItems: NewsHeadlineItem[] = (rawOutcome.newsWire || []).map(
        (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
          ...item,
          id: `m${currentMonth}-news-${idx}-${Date.now()}`,
          month: currentMonth,
        })
      );

      const outcome: TurnOutcome = {
        ...rawOutcome,
        month: currentMonth,
        newsWire: newWireItems,
      };
      const { nextMetrics, nextBlocs } = applyDeltas(
        metrics,
        blocs,
        outcome,
        profile.gameDifficulty
      );
      const difficultyOpsOffset = getGameDifficulty(
        profile.gameDifficulty
      ).opsOddsOffset;

      // Advance active Diplomatic Missions (3-6 turn probability-based envoy missions)
      let missionDiplomaticDelta = 0;
      let missionGdpDelta = 0;
      const missionWireItems: NewsHeadlineItem[] = [];
      const missionMilestones: MilestoneItem[] = [];

      if (diplomaticMissions.some((m) => m.status === 'In Progress')) {
        const updatedMissions = diplomaticMissions.map((mission) => {
          if (mission.status !== 'In Progress') return mission;

          const nextElapsed = mission.turnsElapsed + 1;
          const isFinalTurn = nextElapsed >= mission.durationTurns;
          const missionTheater = resolveCountryToTheater(mission.targetCountry);
          const currentTheaterBonus = computeTheaterInfluence(
            missionTheater.id,
            theaterAssignments,
            militaryRoster,
            military
          ).diplomacyOddsBonusPct;
          const baseDispatchBonus =
            mission.theaterBonusAtDispatch ?? currentTheaterBonus;
          const effectiveRollOdds = clamp(
            Math.round(
              mission.successProbability +
                (currentTheaterBonus - baseDispatchBonus) +
                difficultyOpsOffset
            ),
            20,
            96
          );
          const rollSucceeded = Math.random() * 100 < effectiveRollOdds;

          let turnDelta = 0;
          let nextStatus: DiplomaticMission['status'] = 'In Progress';
          let latestUpdate = '';

          if (mission.focusMetric === 'diplomaticStanding') {
            if (isFinalTurn) {
              if (rollSucceeded) {
                turnDelta = 4.5;
                nextStatus = 'Succeeded';
                latestUpdate = `Breakthrough reached in ${mission.targetCountry}: ${mission.envoyName} signed "${mission.missionTitle}", boosting Diplomatic Standing.`;
              } else {
                turnDelta = -3.0;
                nextStatus = 'Setback';
                latestUpdate = `Talks stalled in ${mission.targetCountry}: final summit adjourned without agreement, denting Diplomatic Standing.`;
              }
            } else if (rollSucceeded) {
              turnDelta = 1.5;
              latestUpdate = `Turn ${nextElapsed}/${mission.durationTurns}: Productive bilateral sessions in ${mission.targetCountry} (+1.5 Diplomatic Standing).`;
            } else {
              turnDelta = 0;
              latestUpdate = `Turn ${nextElapsed}/${mission.durationTurns}: Negotiations in ${mission.targetCountry} hit procedural friction; envoy remains engaged.`;
            }
            missionDiplomaticDelta += turnDelta;
          } else {
            if (isFinalTurn) {
              if (rollSucceeded) {
                turnDelta = 0.35;
                nextStatus = 'Succeeded';
                latestUpdate = `Compact ratified with ${mission.targetCountry}: "${mission.missionTitle}" opens new investment & trade corridors (+0.35% GDP).`;
              } else {
                turnDelta = -0.15;
                nextStatus = 'Setback';
                latestUpdate = `Trade talks collapsed in ${mission.targetCountry}: tariff standoff dampened export outlook (-0.15% GDP).`;
              }
            } else if (rollSucceeded) {
              turnDelta = 0.15;
              latestUpdate = `Turn ${nextElapsed}/${mission.durationTurns}: ${mission.targetCountry} trade framework advancing (+0.15% GDP Growth).`;
            } else {
              turnDelta = 0;
              latestUpdate = `Turn ${nextElapsed}/${mission.durationTurns}: Customs & market access talks in ${mission.targetCountry} paused pending counterproposals.`;
            }
            missionGdpDelta += turnDelta;
          }

          if (nextStatus !== 'In Progress') {
            missionWireItems.push({
              id: `envoy-res-${mission.id}-m${currentMonth}`,
              month: currentMonth,
              outlet: 'Global Diplomatic Wire',
              category:
                mission.focusMetric === 'diplomaticStanding'
                  ? 'foreign'
                  : 'economy',
              headline:
                nextStatus === 'Succeeded'
                  ? `Envoy Secures "${mission.missionTitle}" with ${mission.targetCountry}`
                  : `U.S. Envoy Mission to ${mission.targetCountry} Ends in Diplomatic Setback`,
              summary: latestUpdate,
              tone: nextStatus === 'Succeeded' ? 'positive' : 'critical',
            });

            if (nextStatus === 'Succeeded') {
              missionMilestones.push({
                id: `ms-envoy-${mission.id}-m${currentMonth}`,
                month: currentMonth,
                category:
                  mission.focusMetric === 'diplomaticStanding'
                    ? 'Security'
                    : 'Economic',
                title: `Envoy Accord: ${mission.missionTitle}`,
                description: `${mission.envoyName} successfully concluded a ${mission.durationTurns}-turn mission to ${mission.targetCountry}.`,
              });
            }
          }

          return {
            ...mission,
            turnsElapsed: nextElapsed,
            cumulativeDelta: Number(
              (mission.cumulativeDelta + turnDelta).toFixed(2)
            ),
            status: nextStatus,
            resolvedMonth: isFinalTurn ? currentMonth : undefined,
            latestUpdate,
          };
        });

        setDiplomaticMissions(updatedMissions);

        if (missionDiplomaticDelta !== 0) {
          nextMetrics.diplomaticStanding = clamp(
            Number(
              (nextMetrics.diplomaticStanding + missionDiplomaticDelta).toFixed(
                1
              )
            ),
            0,
            100
          );
          outcome.metricDeltas.diplomaticStanding = Number(
            (
              outcome.metricDeltas.diplomaticStanding + missionDiplomaticDelta
            ).toFixed(1)
          );
        }

        if (missionGdpDelta !== 0) {
          nextMetrics.gdpGrowth = clamp(
            Number((nextMetrics.gdpGrowth + missionGdpDelta).toFixed(2)),
            -5,
            10
          );
          outcome.metricDeltas.gdpGrowth = Number(
            (outcome.metricDeltas.gdpGrowth + missionGdpDelta).toFixed(2)
          );
        }

        if (missionMilestones.length > 0) {
          setMilestones((prev) => [...prev, ...missionMilestones]);
        }
      }

      if (rawOutcome.legislativeRecord) {
        setLegislativeRecords((prev) => [
          ...prev,
          {
            id: `leg-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            recordType: rawOutcome.legislativeRecord.recordType,
            title: rawOutcome.legislativeRecord.title,
            summary: rawOutcome.legislativeRecord.summary,
            outcomeStatus: rawOutcome.legislativeRecord.outcomeStatus,
            approvalImpact: rawOutcome.metricDeltas.approval,
          },
        ]);
      }

      if (rawOutcome.milestone) {
        setMilestones((prev) => [
          ...prev,
          {
            id: `ms-${currentMonth}-${Date.now()}`,
            month: currentMonth,
            category: rawOutcome.milestone.category,
            title: rawOutcome.milestone.title,
            description: rawOutcome.milestone.description,
          },
        ]);
      }

      if (data.vicePresidentUpdate) {
        const vpUpd = data.vicePresidentUpdate;
        setVicePresident((prev) => ({
          ...prev,
          loyalty: clamp(
            Math.round(prev.loyalty + (vpUpd.loyaltyDelta || 0)),
            15,
            98
          ),
          popularity: clamp(
            Math.round(prev.popularity + (vpUpd.popularityDelta || 0)),
            15,
            90
          ),
          currentCounsel: vpUpd.currentCounsel || prev.currentCounsel,
        }));
      }

      if (Array.isArray(data.cabinetUpdates)) {
        setCabinet((prev) =>
          prev.map((member) => {
            const upd = data.cabinetUpdates.find(
              (u: { id: string; loyaltyDelta: number; currentCounsel: string }) =>
                u.id === member.id
            );
            if (!upd) return member;
            const nextLoyalty = clamp(
              Math.round(member.loyalty + upd.loyaltyDelta),
              15,
              98
            );
            const nextStatus: CabinetMember['status'] =
              nextLoyalty >= 65
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained';
            return {
              ...member,
              loyalty: nextLoyalty,
              status: nextStatus,
              currentCounsel: upd.currentCounsel || member.currentCounsel,
            };
          })
        );
      }

      if (data.militaryUpdates) {
        const mu = data.militaryUpdates;
        setMilitary((prev) => ({
          jointChiefsChair: prev.jointChiefsChair,
          defconLevel: clamp(Number(mu.defconLevel || prev.defconLevel), 1, 5) as
            | 1
            | 2
            | 3
            | 4
            | 5,
          forceReadiness: clamp(
            Math.round(prev.forceReadiness + (mu.readinessDelta || 0)),
            30,
            100
          ),
          defenseBudgetBillions: Math.max(
            1,
            Math.round(
              prev.defenseBudgetBillions + (mu.defenseBudgetDeltaBillions || 0)
            )
          ),
          cyberPosture: mu.cyberPosture || prev.cyberPosture,
          intelThreatLevel: mu.intelThreatLevel || prev.intelThreatLevel,
          intelSummary: mu.intelSummary || prev.intelSummary,
          operations: Array.isArray(mu.operations)
            ? mu.operations.map(
                (op: MilitaryCommandState['operations'][number], i: number) => ({
                  ...op,
                  id: `m${currentMonth}-op-${i}`,
                })
              )
            : prev.operations,
        }));
      }

      if (data.institutionalUpdates) {
        const iu = data.institutionalUpdates;
        setInstitutions((prev) => ({
          fedFundsRate: clamp(
            Number((prev.fedFundsRate + (iu.fedRateDelta || 0)).toFixed(2)),
            0,
            12
          ),
          fedStance: iu.fedStance || prev.fedStance,
          fedChairNote: iu.fedChairNote || prev.fedChairNote,
          judiciaryClimate: iu.judiciaryClimate || prev.judiciaryClimate,
          pendingCourtNote: iu.pendingCourtNote || prev.pendingCourtNote,
        }));
      }

      const turnLeadStory: NewsHeadlineItem = {
        id: `turn-lead-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        outlet: rawOutcome.newspaperOutlet || 'The Washington Chronicle',
        category: 'politics',
        headline: rawOutcome.newspaperHeadline,
        summary: rawOutcome.newspaperSubhead || '',
        tone:
          Number(rawOutcome.metricDeltas?.approval || 0) >= 0.8
            ? 'positive'
            : Number(rawOutcome.metricDeltas?.approval || 0) <= -1.2
            ? 'critical'
            : 'neutral',
      };
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          turnLeadStory,
          ...missionWireItems,
          ...newWireItems,
        ])
      );

      const combinedDirectiveSummary = [
        policyDirective.trim(),
        personalAction.trim()
          ? `[Unscripted / Personal]: ${personalAction.trim()}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const historyEntry: TermHistoryEntry = {
        month: currentMonth,
        briefingTitle: currentBriefing.title,
        policyDirective: combinedDirectiveSummary,
        personalAction: personalAction.trim() || undefined,
        publicMessaging,
        outcome,
        metricsAfter: nextMetrics,
        blocsAfter: nextBlocs,
      };
      const nextHistory = [...history, historyEntry];

      setMetrics(nextMetrics);
      setBlocs(nextBlocs);
      setLatestOutcome(outcome);
      setHistory(nextHistory);
      setCurrentBriefing(
        normalizeMonthlyBriefing(
          data.nextBriefing as MonthlyBriefing,
          currentMonth + 1
        )
      );
      setPolicyDraftText('');
      setPersonalActionText('');
      setSpeechDraftText('');
      setLatestStatementResult(null);
      setLatestUnscriptedResult(null);
      setLatestSituationResult(null);
      playDeskSound('alert', muted);

      if (outcome.collapseTriggered) {
        setCollapseReason(
          outcome.collapseReason ||
            'Loss of institutional confidence ended the administration early.'
        );
        setPhase('CAREER_END');
        triggerEvaluation(nextMetrics, nextBlocs, nextHistory);
        return;
      }

      if (reelectionCampaign.decision === 'running') {
        const campaignActionUsed = /rally|bus tour|debate|fundraising|campaign|ad wave/i.test(
          `${personalAction} ${policyDirective} ${publicMessaging}`
        );
        const momentumShift =
          Math.round(outcome.metricDeltas.approval * 0.8) +
          (campaignActionUsed ? 2 : 0);
        const nextMomentum = clamp(
          reelectionCampaign.campaignMomentum + momentumShift,
          -20,
          20
        );
        const { projectedVoteShare, battlegroundEdge } =
          computeCampaignProjection(nextMetrics, nextMomentum);
        setReelectionCampaign((prev) => ({
          ...prev,
          campaignMomentum: nextMomentum,
          projectedVoteShare,
          battlegroundEdge,
          eventsHeld: prev.eventsHeld + (campaignActionUsed ? 1 : 0),
        }));
      }

      if (currentMonth >= profile.termLength) {
        setPhase('CAREER_END');
        triggerEvaluation(nextMetrics, nextBlocs, nextHistory);
        return;
      }

      const nextMonth = currentMonth + 1;
      const justFinishedMidterm =
        currentMonth === 24 && profile.termLength === 48;
      const shouldPromptReelection =
        reelectionCampaign.decision === 'undecided' &&
        ((profile.termLength === 48 && nextMonth === 37) ||
          (profile.termLength === 12 && nextMonth === 9));
      if (shouldPromptReelection) {
        setShowReelectionPrompt(true);
      }
      if (data.cabinetScandal && typeof data.cabinetScandal === 'object') {
        setPendingScandal({
          id: `scandal-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          departmentId: data.cabinetScandal.departmentId,
          memberName: data.cabinetScandal.memberName,
          roleTitle: data.cabinetScandal.roleTitle,
          outlet: data.cabinetScandal.outlet,
          headline: data.cabinetScandal.headline,
          allegationSummary: data.cabinetScandal.allegationSummary,
          severity: data.cabinetScandal.severity,
          congressPressure: data.cabinetScandal.congressPressure,
        });
      }
      setCurrentMonth(nextMonth);
      setPhase(justFinishedMidterm ? 'MIDTERM_REVIEW' : 'PLAYING');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to reach simulation server.'
      );
      setPhase('PLAYING');
    }
  };

  const fullCareerSnapshot: SavedCareerState = {
    profile,
    vicePresident,
    scenarioId,
    scenarioTitle,
    customPremise,
    currentMonth,
    phase,
    initialMetricsSnapshot: initialMetrics,
    metrics,
    blocs,
    cabinet,
    military,
    diplomaticMissions,
    institutions,
    newsFeed,
    legislativeRecords,
    milestones,
    librarySynthesis,
    currentBriefing,
    latestOutcome,
    history,
    evaluation,
    reelectionCampaign,
    pendingScandal,
    addressedStabilityMonths,
    emergencyResolutions,
    harmonyMeetingMonths,
    sotuDeliveredYears,
    lastWhipMonth: lastWhipMonth ?? undefined,
    lastFedConsultMonth: lastFedConsultMonth ?? undefined,
    lastJudicialNomMonth: lastJudicialNomMonth ?? undefined,
    lastBudgetMonth: lastBudgetMonth ?? undefined,
    lastRegionalOutreachMonth: lastRegionalOutreachMonth ?? undefined,
    lastIntelBriefMonth: lastIntelBriefMonth ?? undefined,
    lastSummitMonth: lastSummitMonth ?? undefined,
    executedPowers,
    militaryRoster,
    promotionHistory,
    medalHistory,
    theaterAssignments,
    resolvedTheaterEventMonths,
    secretServiceProtection,
    collapseReason,
    updatedAt: new Date().toISOString(),
  };

  const handleDispatchDiplomaticMission = (params: {
    targetCountry: string;
    envoyName: string;
    envoyTitle: string;
    missionTitle: string;
    focusMetric: DiplomaticMissionFocus;
    durationTurns: number;
    successProbability: number;
  }) => {
    playDeskSound('stamp', muted);
    const missionId = `envoy-${currentMonth}-${Date.now()}`;
    const dispatchTheater = resolveCountryToTheater(params.targetCountry);
    const dispatchTheaterBonus = computeTheaterInfluence(
      dispatchTheater.id,
      theaterAssignments,
      militaryRoster,
      military
    ).diplomacyOddsBonusPct;
    const newMission: DiplomaticMission = {
      id: missionId,
      targetCountry: params.targetCountry,
      envoyName: params.envoyName,
      envoyTitle: params.envoyTitle,
      missionTitle: params.missionTitle,
      focusMetric: params.focusMetric,
      durationTurns: clamp(Math.round(params.durationTurns), 3, 6),
      turnsElapsed: 0,
      successProbability: params.successProbability,
      theaterBonusAtDispatch: dispatchTheaterBonus,
      cumulativeDelta: 0,
      status: 'In Progress',
      startedMonth: currentMonth,
      latestUpdate: `Dispatched to ${params.targetCountry} (${dispatchTheater.commandCode}) on a ${params.durationTurns}-turn mandate (${params.successProbability}% odds). Updates roll each monthly turn.`,
    };

    setDiplomaticMissions((prev) => [newMission, ...prev]);
    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `envoy-dispatch-${missionId}`,
          month: currentMonth,
          outlet: 'State & Foreign Desk',
          category:
            params.focusMetric === 'diplomaticStanding' ? 'foreign' : 'economy',
          headline: `White House Sends ${params.envoyName} to ${params.targetCountry}`,
          summary: `Special envoy tasked with "${params.missionTitle}" across ${params.durationTurns} months (${params.successProbability}% projected success odds).`,
          tone: 'neutral',
        },
      ])
    );
  };

  const handleRecallDiplomaticMission = (missionId: string) => {
    const target = diplomaticMissions.find((m) => m.id === missionId);
    playDeskSound('select', muted);
    setDiplomaticMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (target) {
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `envoy-recall-${missionId}-${Date.now()}`,
            month: currentMonth,
            outlet: 'Diplomatic Cable',
            category: 'foreign',
            headline: `President Recalls Special Envoy from ${target.targetCountry}`,
            summary: `${target.envoyName} returned from "${target.missionTitle}" after ${target.turnsElapsed} of ${target.durationTurns} turns.`,
            tone: 'neutral',
          },
        ])
      );
    }
  };

  const handleClearResolvedMissions = () => {
    setDiplomaticMissions((prev) =>
      prev.filter((m) => m.status === 'In Progress')
    );
  };

  const handleChallengeVeto = (record: LegislativeRecordItem) => {
    if (
      phase !== 'PLAYING' ||
      record.vetoChallenged ||
      record.outcomeStatus !== 'Enacted'
    ) {
      return;
    }

    const succeeded = Math.random() < 0.1;
    const newStatus: LegislativeRecordItem['outcomeStatus'] = succeeded
      ? 'Blocked'
      : record.outcomeStatus;
    const approvalDelta = -6.0;
    const congressDelta = -3.0;

    playDeskSound(succeeded ? 'stamp' : 'alert', muted);

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(Number((prev.approval + approvalDelta).toFixed(1)), 0, 95),
      congressSupport: clamp(
        Number((prev.congressSupport + congressDelta).toFixed(1)),
        5,
        95
      ),
    }));

    setLegislativeRecords((prev) => {
      const exists = prev.some(
        (r) => r.id === record.id || r.month === record.month
      );
      if (exists) {
        return prev.map((r) =>
          r.id === record.id || r.month === record.month
            ? {
                ...r,
                outcomeStatus: newStatus,
                vetoChallenged: true,
              }
            : r
        );
      }
      return [
        ...prev,
        {
          ...record,
          outcomeStatus: newStatus,
          vetoChallenged: true,
        },
      ];
    });

    setHistory((prev) =>
      prev.map((h) => {
        if (h.month !== record.month) return h;
        const updatedRecord = h.outcome.legislativeRecord
          ? {
              ...h.outcome.legislativeRecord,
              outcomeStatus: newStatus,
            }
          : undefined;
        return {
          ...h,
          outcome: {
            ...h.outcome,
            legislativeRecord: updatedRecord,
          },
        };
      })
    );

    const summary = succeeded
      ? `Constitutional challenge prevailed (10% odds): "${record.title}" from Month ${String(record.month).padStart(2, '0')} has been flipped from Enacted to Blocked. Public backlash cost ${approvalDelta.toFixed(1)}% approval and ${congressDelta.toFixed(1)}% Congressional support.`
      : `Veto challenge rejected (90% failure odds): "${record.title}" from Month ${String(record.month).padStart(2, '0')} remains Enacted. The failed reversal attempt still cost ${approvalDelta.toFixed(1)}% approval and ${congressDelta.toFixed(1)}% Congressional support.`;

    setLatestVetoResult({
      recordId: record.id,
      month: record.month,
      title: record.title,
      recordType: record.recordType,
      succeeded,
      previousStatus: record.outcomeStatus,
      newStatus,
      approvalDelta,
      congressDelta,
      summary,
    });

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `veto-challenge-m${currentMonth}-${record.month}-${Date.now()}`,
          month: currentMonth,
          outlet: 'The Capitol Dispatch',
          category: 'politics',
          headline: succeeded
            ? `President Overturns Month ${record.month} ${record.recordType} in Rare Veto Challenge`
            : `White House Bid to Undo "${record.title}" Fails Amid Approval Slide`,
          summary,
          tone: 'critical',
        },
      ])
    );

    if (succeeded) {
      setMilestones((prev) => [
        ...prev,
        {
          id: `veto-milestone-m${currentMonth}-${record.month}-${Date.now()}`,
          month: currentMonth,
          category: 'Constitutional',
          title: `Retroactive Veto Blocked "${record.title}"`,
          description: `Challenged Month ${record.month} ${record.recordType} and overturned its Enacted status to Blocked despite severe political fallout.`,
        },
      ]);
    }
  };

  const handleResolveEmergencyAlert = (
    alert: EmergencyAlertEvent,
    option: EmergencyResponseOption,
    customDirectiveNote: string
  ) => {
    playDeskSound('stamp', muted);

    const d = option.metricDeltas;
    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + (d.approval || 0)).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number(
          (metrics.congressSupport + (d.congressSupport || 0)).toFixed(1)
        ),
        5,
        95
      ),
      gdpGrowth: clamp(
        Number((metrics.gdpGrowth + (d.gdpGrowth || 0)).toFixed(2)),
        -6.0,
        8.5
      ),
      inflation: clamp(
        Number((metrics.inflation + (d.inflation || 0)).toFixed(2)),
        -1.0,
        18.0
      ),
      unemployment: clamp(
        Number((metrics.unemployment + (d.unemployment || 0)).toFixed(2)),
        1.0,
        30.0
      ),
      diplomaticStanding: clamp(
        Number(
          (metrics.diplomaticStanding + (d.diplomaticStanding || 0)).toFixed(1)
        ),
        5,
        100
      ),
      nationalDebtTrillions: Math.max(
        0.01,
        Number(
          (
            metrics.nationalDebtTrillions +
            (d.nationalDebtTrillions || 0)
          ).toFixed(2)
        )
      ),
    };

    setMetrics(nextMetrics);

    if (option.fedFundsDelta || option.fedStance) {
      setInstitutions((prev) => ({
        ...prev,
        fedFundsRate: clamp(
          Number((prev.fedFundsRate + (option.fedFundsDelta || 0)).toFixed(2)),
          0.25,
          20
        ),
        fedStance: option.fedStance || prev.fedStance,
        fedChairNote: `Emergency coordination enacted following ${option.title} in Month ${currentMonth}.`,
      }));
    }

    if (typeof option.cabinetLoyaltyDelta === 'number') {
      const lDelta = option.cabinetLoyaltyDelta;
      setCabinet((prev) =>
        prev.map((c) => {
          const nextLoyalty = clamp(c.loyalty + lDelta, 10, 100);
          return {
            ...c,
            loyalty: nextLoyalty,
            status:
              nextLoyalty >= 70
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained',
          };
        })
      );
    }

    setAddressedStabilityMonths((prev) => ({
      ...prev,
      [alert.metricKey]: currentMonth,
    }));

    const postEval = evaluateInstitutionalStability(nextMetrics);
    const postStatus = postEval.statuses.find(
      (s) => s.metricKey === alert.metricKey
    );

    const resolutionRecord: EmergencyResolutionRecord = {
      id: `em-res-${alert.metricKey}-m${currentMonth}-${Date.now()}`,
      month: currentMonth,
      metricKey: alert.metricKey,
      alertTitle: alert.title,
      chosenOptionTitle: option.title,
      customDirectiveNote: customDirectiveNote || undefined,
      resolvedValueLabel: postStatus?.formattedValue || alert.triggerValueLabel,
      stillBreached: Boolean(postStatus?.breached),
    };

    setEmergencyResolutions((prev) => [...prev, resolutionRecord]);

    const orderSummary = customDirectiveNote
      ? `${option.description} Presidential Statement: "${customDirectiveNote}"`
      : option.description;

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `em-eo-${alert.metricKey}-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        recordType: 'Executive Order',
        title: `Emergency Directive: ${option.title}`,
        summary: orderSummary,
        outcomeStatus: 'Enacted',
        approvalImpact: d.approval || 0,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `em-ms-${alert.metricKey}-m${currentMonth}-${Date.now()}`,
        month: currentMonth,
        category:
          alert.metricKey === 'approval' ? 'Constitutional' : 'Economic',
        title: `Emergency Intervention: ${option.title}`,
        description: `Invoked ${option.instrumentLabel} after ${alert.title}. Reading shifted from ${alert.triggerValueLabel} to ${resolutionRecord.resolvedValueLabel}.`,
      },
    ]);

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `em-news-${alert.metricKey}-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'The Washington Chronicle',
          category:
            alert.metricKey === 'approval' ? 'politics' : 'economy',
          headline: `EMERGENCY ACTION: President Orders ${option.title} Amid ${
            alert.metricKey === 'inflation'
              ? '15%+ Inflation Spiral'
              : alert.metricKey === 'nationalDebtTrillions'
              ? '$45T Debt Crisis'
              : 'Sub-20% Approval Collapse'
          }`,
          summary: `${option.instrumentLabel} deployed (${option.tradeoffSummary}).${
            customDirectiveNote ? ` White House: "${customDirectiveNote}"` : ''
          }`,
          tone: 'critical',
        },
      ])
    );

    setActiveEmergencyAlert(null);
  };

  const handleExecuteExecutivePower = (power: ExecutivePowerDefinition) => {
    playDeskSound('stamp', muted);
    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number(
          (metrics.approval + (power.metricImpacts.approval || 0)).toFixed(1)
        ),
        1,
        99
      ),
      congressSupport: clamp(
        Number(
          (
            metrics.congressSupport +
            (power.metricImpacts.congressSupport || 0)
          ).toFixed(1)
        ),
        5,
        95
      ),
      gdpGrowth: Number(
        (metrics.gdpGrowth + (power.metricImpacts.gdpGrowth || 0)).toFixed(1)
      ),
      inflation: Number(
        Math.max(
          -12.0,
          metrics.inflation + (power.metricImpacts.inflation || 0)
        ).toFixed(1)
      ),
      unemployment: Number(
        Math.max(
          1.0,
          metrics.unemployment + (power.metricImpacts.unemployment || 0)
        ).toFixed(1)
      ),
      diplomaticStanding: clamp(
        Number(
          (
            metrics.diplomaticStanding +
            (power.metricImpacts.diplomaticStanding || 0)
          ).toFixed(1)
        ),
        10,
        100
      ),
      nationalDebtTrillions: Number(
        (
          metrics.nationalDebtTrillions +
          (power.metricImpacts.nationalDebtTrillions || 0)
        ).toFixed(2)
      ),
    };
    setMetrics(nextMetrics);

    if (reelectionCampaign.decision === 'running') {
      const proj = computeCampaignProjection(
        nextMetrics,
        reelectionCampaign.campaignMomentum
      );
      setReelectionCampaign((curr) => ({
        ...curr,
        projectedVoteShare: proj.projectedVoteShare,
        battlegroundEdge: proj.battlegroundEdge,
      }));
    }

    if (power.blocImpacts) {
      const bi = power.blocImpacts;
      setBlocs((prev) => ({
        workingClass: clamp(
          Math.round(prev.workingClass + (bi.workingClass || 0)),
          5,
          95
        ),
        suburbanModerates: clamp(
          Math.round(prev.suburbanModerates + (bi.suburbanModerates || 0)),
          5,
          95
        ),
        youngVoters: clamp(
          Math.round(prev.youngVoters + (bi.youngVoters || 0)),
          5,
          95
        ),
        seniors: clamp(Math.round(prev.seniors + (bi.seniors || 0)), 5, 95),
        techFinance: clamp(
          Math.round(prev.techFinance + (bi.techFinance || 0)),
          5,
          95
        ),
      }));
    }

    if (
      typeof power.forceReadinessDelta === 'number' &&
      power.forceReadinessDelta !== 0
    ) {
      setMilitary((prev) => ({
        ...prev,
        forceReadiness: clamp(
          Number(
            (prev.forceReadiness + (power.forceReadinessDelta || 0)).toFixed(1)
          ),
          30,
          100
        ),
      }));
    }

    if (
      typeof power.cabinetLoyaltyDelta === 'number' &&
      power.cabinetLoyaltyDelta !== 0
    ) {
      const delta = power.cabinetLoyaltyDelta;
      setCabinet((prev) =>
        prev.map((c) => {
          const nextLoyalty = clamp(c.loyalty + delta, 15, 98);
          return {
            ...c,
            loyalty: nextLoyalty,
            status:
              nextLoyalty >= 65
                ? 'Aligned'
                : nextLoyalty >= 45
                ? 'Cautious'
                : 'Strained',
          };
        })
      );
    }

    const record: ExecutedPowerRecord = {
      id: `exec-pow-${currentMonth}-${power.id}-${Date.now()}`,
      powerId: power.id,
      title: power.title,
      category: power.category,
      month: currentMonth,
      summary: `Invoked ${power.instrumentType}: ${power.effectSummary}`,
    };
    setExecutedPowers((prev) => [record, ...prev]);

    const milestoneCategory: MilestoneItem['category'] =
      power.category === 'National Security' ||
      power.category === 'Intelligence & Cyber Command'
        ? 'Security'
        : power.category === 'Economic & Fiscal' ||
          power.category === 'Infrastructure & Housing' ||
          power.category === 'Trade, Labor & Education'
        ? 'Economic'
        : 'Political';

    const milestone: MilestoneItem = {
      id: `ms-pow-${currentMonth}-${power.id}-${Date.now()}`,
      month: currentMonth,
      category: milestoneCategory,
      title: `Executive Instrument: ${power.title}`,
      description: power.description,
    };
    setMilestones((prev) => [milestone, ...prev]);

    const newsCategory: NewsHeadlineItem['category'] =
      power.category === 'National Security' ||
      power.category === 'Intelligence & Cyber Command'
        ? 'defense'
        : power.category === 'Economic & Fiscal' ||
          power.category === 'Trade, Labor & Education' ||
          power.category === 'Science, Space & Energy'
        ? 'economy'
        : power.category === 'Legacy & Media' ||
          power.category === 'Healthcare & Public Welfare' ||
          power.category === 'Infrastructure & Housing'
        ? 'domestic'
        : 'politics';

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `news-pow-${currentMonth}-${power.id}-${Date.now()}`,
          month: currentMonth,
          outlet: 'The Washington Chronicle',
          category: newsCategory,
          headline:
            power.customHeadline ||
            `White House Invokes ${power.instrumentType}: "${power.title}"`,
          summary: power.effectSummary,
          tone:
            (power.metricImpacts.approval || 0) >= 1.0
              ? 'positive'
              : (power.metricImpacts.approval || 0) < 0
              ? 'critical'
              : 'neutral',
        },
      ])
    );
  };

  const currentYearNumber = Math.max(1, Math.ceil(currentMonth / 12));
  const sotuDeliveredThisYear = sotuDeliveredYears.includes(currentYearNumber);
  const whipUsedThisMonth = lastWhipMonth === currentMonth;

  const handleDeliverStateOfTheUnion = async (
    themeTitle: string,
    customRemarks: string
  ): Promise<StateOfTheUnionResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await postSimulationApi<any>(
      '/api/state-of-the-union',
      {
        profile,
        vicePresident,
        scenarioTitle,
        currentMonth,
        yearNumber: currentYearNumber,
        metrics,
        themeTitle,
        customRemarks,
      },
      'Failed to deliver the State of the Union Address.'
    );

    const ts = Date.now();
    const mappedMedia: NewsHeadlineItem[] = Array.isArray(data.mediaReactions)
      ? data.mediaReactions.map(
          (item: Omit<NewsHeadlineItem, 'id' | 'month'>, idx: number) => ({
            ...item,
            id: `sotu-y${currentYearNumber}-m${currentMonth}-${idx}-${ts}`,
            month: currentMonth,
          })
        )
      : [];

    const result: StateOfTheUnionResult = {
      id: `sotu-y${currentYearNumber}-m${currentMonth}-${ts}`,
      yearNumber: currentYearNumber,
      month: currentMonth,
      themeTitle: data.themeTitle || themeTitle,
      customRemarks: data.customRemarks || customRemarks,
      chamberReception: data.chamberReception || 'Respectful Partisan Divide',
      leadOutlet: data.leadOutlet || 'The Washington Chronicle',
      leadHeadline:
        data.leadHeadline ||
        `President ${profile.name} Delivers Year ${currentYearNumber} State of the Union`,
      mediaSummary: data.mediaSummary || '',
      speakerReaction: data.speakerReaction || '',
      oppositionRebuttal: data.oppositionRebuttal || '',
      approvalDelta: Number(data.approvalDelta || 0),
      congressDelta: Number(data.congressDelta || 0),
      diplomaticDelta: Number(data.diplomaticDelta || 0),
      voterBlocDeltas: data.voterBlocDeltas || {
        workingClass: 0,
        suburbanModerates: 0,
        techFinance: 0,
        seniors: 0,
        youngVoters: 0,
      },
      mediaReactions: mappedMedia,
    };

    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((metrics.congressSupport + result.congressDelta).toFixed(1)),
        5,
        95
      ),
      diplomaticStanding: clamp(
        Number((metrics.diplomaticStanding + result.diplomaticDelta).toFixed(1)),
        5,
        100
      ),
    };

    const vd = result.voterBlocDeltas;
    const nextBlocs: VoterBlocs = {
      workingClass: clamp(Math.round(blocs.workingClass + vd.workingClass), 5, 95),
      suburbanModerates: clamp(
        Math.round(blocs.suburbanModerates + vd.suburbanModerates),
        5,
        95
      ),
      techFinance: clamp(Math.round(blocs.techFinance + vd.techFinance), 5, 95),
      seniors: clamp(Math.round(blocs.seniors + vd.seniors), 5, 95),
      youngVoters: clamp(Math.round(blocs.youngVoters + vd.youngVoters), 5, 95),
    };

    setMetrics(nextMetrics);
    setBlocs(nextBlocs);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    setSotuDeliveredYears((prev) =>
      prev.includes(currentYearNumber) ? prev : [...prev, currentYearNumber]
    );

    const leadStory: NewsHeadlineItem = {
      id: `sotu-lead-y${currentYearNumber}-m${currentMonth}-${ts}`,
      month: currentMonth,
      outlet: result.leadOutlet,
      category: 'politics',
      headline: result.leadHeadline,
      summary: result.mediaSummary,
      tone:
        result.approvalDelta >= 1
          ? 'positive'
          : result.approvalDelta <= -1
          ? 'critical'
          : 'neutral',
    };

    setNewsFeed((prev) => mergeNewsStories(prev, [leadStory, ...mappedMedia]));

    setMilestones((prev) => [
      ...prev,
      {
        id: `sotu-ms-y${currentYearNumber}-m${currentMonth}-${ts}`,
        month: currentMonth,
        category: 'Political',
        title: `Year ${currentYearNumber} State of the Union: ${result.themeTitle}`,
        description: `${result.chamberReception}. Approval ${
          result.approvalDelta >= 0 ? '+' : ''
        }${result.approvalDelta.toFixed(1)}%, Congress ${
          result.congressDelta >= 0 ? '+' : ''
        }${result.congressDelta.toFixed(1)}%.`,
      },
    ]);

    playDeskSound(result.approvalDelta >= 0 ? 'stamp' : 'alert', muted);
    return result;
  };

  const handleExecuteCapitolWhip = (option: CapitolWhipOption) => {
    if (lastWhipMonth === currentMonth) return;
    playDeskSound('stamp', muted);

    const nextMetrics: NationalMetrics = {
      ...metrics,
      congressSupport: clamp(
        Number((metrics.congressSupport + option.congressDelta).toFixed(1)),
        5,
        95
      ),
      approval: clamp(
        Number((metrics.approval + option.approvalDelta).toFixed(1)),
        0,
        95
      ),
      nationalDebtTrillions: Math.max(
        0.01,
        Number(
          (metrics.nationalDebtTrillions + option.debtDeltaTrillions).toFixed(2)
        )
      ),
      inflation: clamp(
        Number((metrics.inflation + option.inflationDelta).toFixed(2)),
        -12.0,
        25.0
      ),
    };

    setMetrics(nextMetrics);
    setLastWhipMonth(currentMonth);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const ts = Date.now();
    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `whip-m${currentMonth}-${ts}`,
        month: currentMonth,
        recordType: 'Legislation',
        title: option.title,
        summary: `${option.caucusTarget}: ${option.summary}`,
        outcomeStatus: 'Compromise',
        approvalImpact: option.approvalDelta,
      },
    ]);

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `whip-news-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: 'The Capitol Dispatch',
          category: 'politics',
          headline: `White House Strikes ${option.title} With ${option.caucusTarget}`,
          summary: `${option.summary} (${option.tradeoffLabel}).`,
          tone: option.approvalDelta >= 0 ? 'positive' : 'neutral',
        },
      ])
    );
  };

  const handleConsultFed = (option: FedConsultOption) => {
    if (
      lastFedConsultMonth !== null &&
      currentMonth - lastFedConsultMonth < 3
    ) {
      return;
    }
    playDeskSound('stamp', muted);

    setInstitutions((prev) => ({
      ...prev,
      fedFundsRate: clamp(
        Number((prev.fedFundsRate + option.rateDelta).toFixed(2)),
        0.25,
        20
      ),
      fedStance: option.stanceRequested,
      fedChairNote: option.chairNote,
    }));

    const nextMetrics: NationalMetrics = {
      ...metrics,
      gdpGrowth: clamp(
        Number((metrics.gdpGrowth + option.gdpDelta).toFixed(2)),
        -15.0,
        22.0
      ),
      inflation: clamp(
        Number((metrics.inflation + option.inflationDelta).toFixed(2)),
        -12.0,
        25.0
      ),
      approval: clamp(
        Number((metrics.approval + option.approvalDelta).toFixed(1)),
        0,
        95
      ),
    };

    setMetrics(nextMetrics);
    setLastFedConsultMonth(currentMonth);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const ts = Date.now();
    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `fed-consult-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: 'Wall Street Wire',
          category: 'economy',
          headline: `Treasury–Fed Briefing: ${option.title}`,
          summary: `${option.chairNote} (${option.tradeoffLabel}).`,
          tone:
            option.inflationDelta < 0
              ? 'positive'
              : option.gdpDelta > 0
              ? 'neutral'
              : 'neutral',
        },
      ])
    );
  };

  const handleNominateJudges = (option: JudicialNominationOption) => {
    if (
      lastJudicialNomMonth !== null &&
      currentMonth - lastJudicialNomMonth < 3
    ) {
      return;
    }
    playDeskSound('stamp', muted);

    setInstitutions((prev) => ({
      ...prev,
      judiciaryClimate: shiftJudiciaryClimate(
        prev.judiciaryClimate,
        option.shiftsClimateTowardFavorable
      ),
      pendingCourtNote: option.courtNote,
    }));

    const nextMetrics: NationalMetrics = {
      ...metrics,
      congressSupport: clamp(
        Number((metrics.congressSupport - option.congressCost).toFixed(1)),
        5,
        95
      ),
      approval: clamp(
        Number((metrics.approval + option.approvalDelta).toFixed(1)),
        0,
        95
      ),
    };

    setMetrics(nextMetrics);
    setLastJudicialNomMonth(currentMonth);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const ts = Date.now();
    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `jud-nom-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: 'Judicial Docket',
          category: 'domestic',
          headline: `Senate Confirms Presidential Slate: ${option.title}`,
          summary: `${option.courtNote} (${option.tradeoffLabel}).`,
          tone: option.approvalDelta >= 0 ? 'positive' : 'neutral',
        },
      ])
    );
  };

  const handleEnactBudget = (
    title: string,
    allocation: BudgetAllocationInput,
    projection: BudgetProjection
  ) => {
    if (lastBudgetMonth !== null && currentMonth - lastBudgetMonth < 6) return;
    playDeskSound('stamp', muted);

    const nextMetrics: NationalMetrics = {
      ...metrics,
      nationalDebtTrillions: Math.max(
        0.01,
        Number(
          (metrics.nationalDebtTrillions + projection.debtDeltaTrillions).toFixed(
            2
          )
        )
      ),
      gdpGrowth: clamp(
        Number((metrics.gdpGrowth + projection.gdpDelta).toFixed(2)),
        -15.0,
        22.0
      ),
      inflation: clamp(
        Number((metrics.inflation + projection.inflationDelta).toFixed(2)),
        -12.0,
        25.0
      ),
      approval: clamp(
        Number((metrics.approval + projection.approvalDelta).toFixed(1)),
        0,
        95
      ),
      congressSupport: clamp(
        Number((metrics.congressSupport + projection.congressDelta).toFixed(1)),
        5,
        95
      ),
    };

    const bd = projection.blocDeltas;
    setMetrics(nextMetrics);
    setBlocs((prev) => ({
      workingClass: clamp(Math.round(prev.workingClass + bd.workingClass), 5, 95),
      suburbanModerates: clamp(
        Math.round(prev.suburbanModerates + bd.suburbanModerates),
        5,
        95
      ),
      techFinance: clamp(Math.round(prev.techFinance + bd.techFinance), 5, 95),
      seniors: clamp(Math.round(prev.seniors + bd.seniors), 5, 95),
      youngVoters: clamp(Math.round(prev.youngVoters + bd.youngVoters), 5, 95),
    }));

    setMilitary((prev) => ({
      ...prev,
      defenseBudgetBillions: Math.max(
        400,
        prev.defenseBudgetBillions + projection.defenseBudgetDeltaBillions
      ),
      forceReadiness: clamp(
        prev.forceReadiness + projection.readinessDelta,
        30,
        100
      ),
    }));

    setLastBudgetMonth(currentMonth);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    const ts = Date.now();
    const summaryText = `Defense ${allocation.defenseShiftPct >= 0 ? '+' : ''}${
      allocation.defenseShiftPct
    }%, Infrastructure ${
      allocation.infrastructureShiftPct >= 0 ? '+' : ''
    }${allocation.infrastructureShiftPct}%, Household Tax Relief ${
      allocation.taxReliefShiftPct >= 0 ? '+' : ''
    }${allocation.taxReliefShiftPct}%, Deficit Curb +${
      allocation.deficitCurbPct
    }%. Projected Debt ${
      projection.debtDeltaTrillions >= 0 ? '+' : ''
    }$${projection.debtDeltaTrillions.toFixed(2)}T, GDP ${
      projection.gdpDelta >= 0 ? '+' : ''
    }${projection.gdpDelta.toFixed(2)}%.`;

    setLegislativeRecords((prev) => [
      ...prev,
      {
        id: `budget-m${currentMonth}-${ts}`,
        month: currentMonth,
        recordType: 'Legislation',
        title,
        summary: summaryText,
        outcomeStatus: projection.passageStatus,
        approvalImpact: projection.approvalDelta,
      },
    ]);

    setMilestones((prev) => [
      ...prev,
      {
        id: `budget-ms-m${currentMonth}-${ts}`,
        month: currentMonth,
        category: 'Economic',
        title: `Signed Federal Budget: ${title}`,
        description: summaryText,
      },
    ]);

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `budget-news-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: 'Treasury & Fiscal Monitor',
          category: 'economy',
          headline: `President Signs ${title} (${projection.passageStatus})`,
          summary: summaryText,
          tone: projection.approvalDelta >= 0 ? 'positive' : 'neutral',
        },
      ])
    );
  };

  const handleCompleteDebate = (result: {
    totalScore: number;
    momentumDelta: number;
    approvalDelta: number;
    blocDeltas: Partial<VoterBlocs>;
    summaryHeadline: string;
  }) => {
    playDeskSound('stamp', muted);
    setShowDebateModal(false);

    const nextMetrics = {
      ...metrics,
      approval: clamp(
        Number((metrics.approval + result.approvalDelta).toFixed(1)),
        0,
        95
      ),
    };
    setMetrics(nextMetrics);

    setBlocs((prev) => ({
      workingClass: clamp(
        Math.round(prev.workingClass + (result.blocDeltas.workingClass || 0)),
        5,
        95
      ),
      suburbanModerates: clamp(
        Math.round(
          prev.suburbanModerates + (result.blocDeltas.suburbanModerates || 0)
        ),
        5,
        95
      ),
      techFinance: clamp(
        Math.round(prev.techFinance + (result.blocDeltas.techFinance || 0)),
        5,
        95
      ),
      seniors: clamp(
        Math.round(prev.seniors + (result.blocDeltas.seniors || 0)),
        5,
        95
      ),
      youngVoters: clamp(
        Math.round(prev.youngVoters + (result.blocDeltas.youngVoters || 0)),
        5,
        95
      ),
    }));

    if (reelectionCampaign.decision === 'running') {
      const nextMomentum = clamp(
        reelectionCampaign.campaignMomentum + result.momentumDelta,
        -20,
        20
      );
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(nextMetrics, nextMomentum);
      setReelectionCampaign((prev) => ({
        ...prev,
        campaignMomentum: nextMomentum,
        projectedVoteShare,
        battlegroundEdge,
        eventsHeld: prev.eventsHeld + 1,
      }));
    }

    const ts = Date.now();
    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `debate-news-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: 'National Debate Broadcast',
          category: 'politics',
          headline: result.summaryHeadline,
          summary: `Debate score: ${result.totalScore}/100. Voter bloc enthusiasm shifted in real-time across battleground states.`,
          tone: result.totalScore >= 75 ? 'positive' : 'neutral',
        },
      ])
    );

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-debate-m${currentMonth}-${ts}`,
        month: currentMonth,
        category: 'Political',
        title: `Televised Presidential Debate: Score ${result.totalScore}/100`,
        description: `Successfully squared off against ${reelectionCampaign.opponentName} in debate format, boosting campaign momentum and voter enthusiasm.`,
      },
    ]);
  };

  const handleDispatchRegionalOutreach = (
    state: BattlegroundStateProjection
  ) => {
    if (
      lastRegionalOutreachMonth !== null &&
      currentMonth - lastRegionalOutreachMonth < 2
    ) {
      return;
    }
    playDeskSound('stamp', muted);

    const nextMetrics: NationalMetrics = {
      ...metrics,
      approval: clamp(Number((metrics.approval + 0.6).toFixed(1)), 0, 95),
    };

    setMetrics(nextMetrics);
    setBlocs((prev) => ({
      ...prev,
      [state.primaryBlocKey]: clamp(
        Math.round(prev[state.primaryBlocKey] + 2),
        5,
        95
      ),
    }));
    setLastRegionalOutreachMonth(currentMonth);

    if (reelectionCampaign.decision === 'running') {
      const nextMomentum = clamp(reelectionCampaign.campaignMomentum + 1, -20, 20);
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(nextMetrics, nextMomentum);
      setReelectionCampaign((prev) => ({
        ...prev,
        campaignMomentum: nextMomentum,
        projectedVoteShare,
        battlegroundEdge,
        eventsHeld: prev.eventsHeld + 1,
      }));
    }

    const ts = Date.now();
    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `outreach-${state.code}-m${currentMonth}-${ts}`,
          month: currentMonth,
          outlet: `${state.name} Political Wire`,
          category: 'politics',
          headline: `White House Targets ${state.name} (${state.electoralVotes} EV) With ${state.primaryBlocLabel} Blitz`,
          summary: `Oval Office outreach bolstered support among ${state.primaryBlocLabel.toLowerCase()}, nudging battleground momentum upward.`,
          tone: 'positive',
        },
      ])
    );
  };

  const handleRunIntelBrief = async () => {
    if (
      isLoadingIntelBrief ||
      (lastIntelBriefMonth !== null && currentMonth - lastIntelBriefMonth < 3)
    ) {
      return;
    }
    setErrorMsg(null);
    setIsLoadingIntelBrief(true);
    playDeskSound('select', muted);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postSimulationApi<any>(
        '/api/situation-room/intel-brief',
        {
          profile,
          scenarioTitle,
          currentMonth,
          metrics,
          military,
          diplomaticMissions,
        },
        'Failed to compile Classified Presidential Daily Brief.'
      );

      const ts = Date.now();
      const brief: ClassifiedIntelBrief = {
        id: `pdb-m${currentMonth}-${ts}`,
        month: currentMonth,
        threatLevel: data.threatLevel || military.intelThreatLevel,
        executiveSummary: data.executiveSummary || military.intelSummary,
        flashpoints: Array.isArray(data.flashpoints) ? data.flashpoints : [],
        recommendedActionTitle:
          data.recommendedActionTitle || 'Authorize Strategic Deterrence',
        recommendedTargetCountry:
          data.recommendedTargetCountry || 'Red Sea / Yemen',
        recommendedScenarioType:
          data.recommendedScenarioType || 'Covert & Cyber Operation',
        recommendedOrderText:
          data.recommendedOrderText ||
          'Direct defense and intelligence leadership to strengthen allied deterrence posture.',
      };

      setLatestIntelBrief(brief);
      setLastIntelBriefMonth(currentMonth);
      setMilitary((prev) => ({
        ...prev,
        intelThreatLevel: brief.threatLevel,
        intelSummary: brief.executiveSummary,
      }));
      playDeskSound('alert', muted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to compile Classified Presidential Daily Brief.'
      );
    } finally {
      setIsLoadingIntelBrief(false);
    }
  };

  const handleToggleSecretServiceProtection = () => {
    const nextEnabled = !secretServiceProtection;
    setSecretServiceProtection(nextEnabled);
    playDeskSound('select', muted);

    if (nextEnabled && lastSecretServiceBudgetMonth !== currentMonth) {
      setLastSecretServiceBudgetMonth(currentMonth);
      setMetrics((prev) => ({
        ...prev,
        nationalDebtTrillions: Number(
          (prev.nationalDebtTrillions + 0.01).toFixed(2)
        ),
      }));
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `ss-prot-m${currentMonth}-${Date.now()}`,
            month: currentMonth,
            outlet: 'Federal Wire',
            category: 'defense',
            headline:
              'White House Expands Secret Service Summit Protection Detail ($10B)',
            summary:
              'Supplemental protective funding authorizes advanced counter-assault and motorcade teams for foreign diplomatic summits, cutting assassination and kidnapping risk by 75%.',
            tone: 'neutral',
          },
        ])
      );
    }
  };

  const handleCompleteDiplomaticSummit = (outcome: DiplomaticSummitOutcome) => {
    playDeskSound(
      outcome.walkedOut || outcome.securityEvent ? 'alert' : 'stamp',
      muted
    );

    const budgetCost = outcome.budgetCostTrillions || 0;
    const nextMetrics: NationalMetrics = {
      ...metrics,
      diplomaticStanding: clamp(
        Number((metrics.diplomaticStanding + outcome.diplomaticDelta).toFixed(1)),
        5,
        100
      ),
      approval: clamp(
        Number((metrics.approval + outcome.approvalDelta).toFixed(1)),
        0,
        95
      ),
      gdpGrowth: clamp(
        Number((metrics.gdpGrowth + outcome.gdpDelta).toFixed(2)),
        -6.0,
        8.5
      ),
      inflation: clamp(
        Number((metrics.inflation + outcome.inflationDelta).toFixed(2)),
        -1.0,
        18.0
      ),
      nationalDebtTrillions: Number(
        Math.max(0.01, metrics.nationalDebtTrillions + budgetCost).toFixed(2)
      ),
    };

    setMetrics(nextMetrics);
    if (
      typeof outcome.forceReadinessDelta === 'number' &&
      outcome.forceReadinessDelta !== 0
    ) {
      setMilitary((prev) => ({
        ...prev,
        forceReadiness: clamp(
          Number(
            (prev.forceReadiness + outcome.forceReadinessDelta!).toFixed(1)
          ),
          10,
          100
        ),
      }));
    }
    setLastSummitMonth(currentMonth);
    setLatestSummitOutcome(outcome);

    if (reelectionCampaign.decision === 'running') {
      const { projectedVoteShare, battlegroundEdge } =
        computeCampaignProjection(
          nextMetrics,
          reelectionCampaign.campaignMomentum
        );
      setReelectionCampaign((prev) => ({
        ...prev,
        projectedVoteShare,
        battlegroundEdge,
      }));
    }

    if (outcome.treatyTitle) {
      setLegislativeRecords((prev) => [
        ...prev,
        {
          id: `${outcome.id}-treaty`,
          month: currentMonth,
          recordType: 'Treaty',
          title: outcome.treatyTitle!,
          summary: outcome.summary,
          outcomeStatus:
            outcome.verdict === 'Historic Breakthrough Treaty'
              ? 'Enacted'
              : 'Compromise',
          approvalImpact: outcome.approvalDelta,
        },
      ]);
    }

    if (
      outcome.verdict === 'Historic Breakthrough Treaty' ||
      outcome.walkedOut ||
      outcome.securityEvent
    ) {
      setMilestones((prev) => [
        ...prev,
        {
          id: `${outcome.id}-ms`,
          month: currentMonth,
          category: 'Security',
          title: outcome.headline,
          description: outcome.summary,
        },
      ]);
    }

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `${outcome.id}-news`,
          month: currentMonth,
          outlet: 'Global Diplomatic Wire',
          category: outcome.securityEvent ? 'defense' : 'foreign',
          headline: outcome.headline,
          summary: outcome.summary,
          tone:
            outcome.walkedOut || outcome.securityEvent
              ? 'critical'
              : outcome.diplomaticDelta > 0
              ? 'positive'
              : 'neutral',
        },
      ])
    );
  };

  const applyMilitaryPromotions = (
    targets: { memberId: string; targetGradeIndex: number; note?: string }[]
  ) => {
    if (targets.length === 0) return;
    playDeskSound('select', muted);

    const newRecords: MilitaryPromotionRecord[] = [];
    let readinessGain = 0;
    let flagPromotions = 0;
    let fourStarPromotions = 0;

    setMilitaryRoster((prev) => {
      const targetMap = new Map(targets.map((t) => [t.memberId, t]));
      return prev.map((member) => {
        const req = targetMap.get(member.id);
        if (!req) return member;

        const nextGrade = Math.max(
          member.gradeIndex + 1,
          Math.min(MAX_RANK_GRADE_INDEX, req.targetGradeIndex)
        );
        if (nextGrade <= member.gradeIndex) return member;

        const fromRank = getServiceRankInfo(member.service, member.gradeIndex);
        const toRank = getServiceRankInfo(member.service, nextGrade);
        const isCommissioning = !fromRank.isOfficer && toRank.isOfficer;
        const isFlag = toRank.stars > 0;
        const promotionType: MilitaryPromotionRecord['promotionType'] = isFlag
          ? 'Senate Flag Confirmation'
          : isCommissioning || nextGrade - member.gradeIndex > 1
          ? 'Battlefield Commission'
          : 'Standard Advancement';

        if (isFlag) flagPromotions++;
        if (nextGrade === MAX_RANK_GRADE_INDEX) fourStarPromotions++;
        readinessGain += isFlag ? 0.5 : 0.2;

        newRecords.push({
          id: `prom-${member.id}-m${currentMonth}-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`,
          memberId: member.id,
          memberName: member.name,
          service: member.service,
          fromPayGrade: fromRank.payGrade,
          fromRankTitle: fromRank.title,
          toPayGrade: toRank.payGrade,
          toRankTitle: toRank.title,
          toAbbr: toRank.abbr,
          stars: toRank.stars,
          month: currentMonth,
          promotionType,
          note:
            req.note ||
            `${MILITARY_SERVICES[member.service].shortLabel} promotion signed for ${member.unit} (${member.specialty}).`,
        });

        return {
          ...member,
          gradeIndex: nextGrade,
          commendations: member.commendations + 1,
          meritScore: Math.min(99, member.meritScore + 1),
          status:
            nextGrade >= 15
              ? 'Command Staff'
              : member.status,
          promotedMonth: currentMonth,
        };
      });
    });

    if (newRecords.length === 0) return;

    setPromotionHistory((prev) => [...newRecords, ...prev]);

    setMilitary((prev) => ({
      ...prev,
      forceReadiness: Math.min(
        100,
        Number((prev.forceReadiness + Math.min(2.5, readinessGain)).toFixed(1))
      ),
    }));

    if (flagPromotions > 0) {
      const lead = newRecords.find((r) => r.stars > 0) || newRecords[0];
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `prom-news-m${currentMonth}-${Date.now()}`,
            month: currentMonth,
            outlet: 'Pentagon Wire',
            category: 'defense',
            headline:
              fourStarPromotions > 0
                ? `Senate Confirms New Four-Star Command Promotion: ${lead.toAbbr} ${lead.memberName}`
                : `White House Advances ${flagPromotions} Flag & General Officer Promotion${
                    flagPromotions > 1 ? 's' : ''
                  }`,
            summary: `Commander-in-Chief signed promotion orders elevating ${lead.memberName} (${MILITARY_SERVICES[lead.service].label}) to ${lead.toRankTitle} (${lead.toPayGrade}).`,
            tone: 'positive',
          },
        ])
      );
    }

    if (fourStarPromotions > 0) {
      const fourStarRec =
        newRecords.find((r) => r.stars === 4) || newRecords[0];
      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-4star-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          category: 'Security',
          title: `Promoted 4-Star ${fourStarRec.toRankTitle}: ${fourStarRec.memberName}`,
          description: `Confirmed ${fourStarRec.memberName} (${MILITARY_SERVICES[fourStarRec.service].label}) to ${fourStarRec.toPayGrade} four-star command.`,
        },
      ]);
    }
  };

  const handlePromoteMilitaryMember = (
    memberId: string,
    targetGradeIndex: number,
    note?: string
  ) => {
    applyMilitaryPromotions([{ memberId, targetGradeIndex, note }]);
  };

  const handleBatchPromoteMilitaryMembers = (memberIds: string[]) => {
    const targets = memberIds
      .map((id) => {
        const m = militaryRoster.find((item) => item.id === id);
        if (!m || m.gradeIndex >= MAX_RANK_GRADE_INDEX) return null;
        return { memberId: m.id, targetGradeIndex: m.gradeIndex + 1 };
      })
      .filter(
        (t): t is { memberId: string; targetGradeIndex: number } => t !== null
      );
    applyMilitaryPromotions(targets);
  };

  const handleRecruitMilitaryPersonnel = (
    service: MilitaryServiceBranch,
    startingGradeIndex: number
  ) => {
    playDeskSound('select', muted);
    const created = recruitMilitaryPersonnel(
      militaryRoster,
      service,
      startingGradeIndex
    );
    const rankInfo = getServiceRankInfo(service, created.gradeIndex);
    setMilitaryRoster((prev) => [created, ...prev]);
    setPromotionHistory((prev) => [
      {
        id: `enlist-${created.id}-m${currentMonth}`,
        memberId: created.id,
        memberName: created.name,
        service,
        fromPayGrade: 'Civilian',
        fromRankTitle:
          created.gradeIndex === 0 ? 'New Enlistee' : 'Officer Candidate',
        toPayGrade: rankInfo.payGrade,
        toRankTitle: rankInfo.title,
        toAbbr: rankInfo.abbr,
        stars: rankInfo.stars,
        month: currentMonth,
        promotionType:
          created.gradeIndex >= 9
            ? 'Battlefield Commission'
            : 'Standard Advancement',
        note: `Inducted into ${MILITARY_SERVICES[service].label} (${created.unit}).`,
      },
      ...prev,
    ]);
  };

  const handleAppointFourStarAsJcs = (member: MilitaryServiceMember) => {
    playDeskSound('select', muted);
    const rank = getServiceRankInfo(member.service, member.gradeIndex);
    const branchLabel = MILITARY_SERVICES[member.service].label;
    const chairTitle = `${rank.abbr} ${member.name}`;

    setMilitary((prev) => ({
      ...prev,
      jointChiefsChair: {
        name: chairTitle,
        branch: branchLabel,
        doctrine: `${member.specialty} & Joint Force Readiness`,
      },
      forceReadiness: Math.min(100, Number((prev.forceReadiness + 1).toFixed(1))),
    }));

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `jcs-promoted-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'Capitol Dispatch',
          category: 'defense',
          headline: `President Taps Promoted Four-Star ${chairTitle} as Joint Chiefs Chair`,
          summary: `Elevated directly from ${member.unit}, ${chairTitle} (${branchLabel}) assumes top Pentagon advisory command.`,
          tone: 'positive',
        },
      ])
    );

    setMilestones((prev) => [
      ...prev,
      {
        id: `ms-jcs-prom-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        category: 'Security',
        title: `Elevated ${chairTitle} to Joint Chiefs Chair`,
        description: `Promoted ${branchLabel} four-star commander from ${member.unit} to Chair of the Joint Chiefs of Staff.`,
      },
    ]);
  };

  const applyMilitaryMedals = (
    awards: {
      memberId: string;
      medal: MilitaryMedalDefinition;
      citation?: string;
    }[]
  ) => {
    if (awards.length === 0) return;
    playDeskSound('stamp', muted);

    const awardMap = new Map(awards.map((a) => [a.memberId, a]));
    const newRecords: MilitaryMedalAwardRecord[] = [];
    let readinessGain = 0;
    let approvalGain = 0;

    const nextRoster = militaryRoster.map((member) => {
      const req = awardMap.get(member.id);
      if (!req) return member;
      const eligibility = canAwardMedalToMember(member, req.medal);
      if (!eligibility.eligible) return member;

      const rank = getServiceRankInfo(member.service, member.gradeIndex);
      const medalName = getMedalDisplayName(req.medal, member.service);
      const citationText =
        req.citation?.trim() ||
        `Awarded for exemplary ${member.specialty} performance and distinguished service with ${member.unit} (Merit ${member.meritScore}).`;

      const record: MilitaryMedalAwardRecord = {
        id: `med-${member.id}-${req.medal.id}-m${currentMonth}-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`,
        memberId: member.id,
        memberName: member.name,
        memberRankAbbr: rank.abbr,
        service: member.service,
        medalId: req.medal.id,
        medalName,
        medalAbbr: req.medal.abbr,
        tier: req.medal.tier,
        month: currentMonth,
        meritScoreAtAward: member.meritScore,
        citation: citationText,
        awardedBy: `President ${profile.name}`,
      };

      newRecords.push(record);
      readinessGain += req.medal.readinessBonus;
      approvalGain += req.medal.approvalBonus;

      return {
        ...member,
        commendations: member.commendations + 1,
        meritScore: Math.min(99, member.meritScore + req.medal.meritBoost),
        serviceRecordMedals: [
          record,
          ...(member.serviceRecordMedals || []),
        ],
      };
    });

    if (newRecords.length === 0) return;

    setMilitaryRoster(nextRoster);
    setMedalHistory((prev) => [...newRecords, ...prev]);

    setMilitary((prev) => ({
      ...prev,
      forceReadiness: clamp(
        Number((prev.forceReadiness + Math.min(3.0, readinessGain)).toFixed(1)),
        30,
        100
      ),
    }));

    setMetrics((prev) => ({
      ...prev,
      approval: clamp(
        Number((prev.approval + Math.min(2.5, approvalGain)).toFixed(1)),
        0,
        95
      ),
    }));

    const highHonors = newRecords.filter(
      (r) => r.tier === 'valor' || r.tier === 'highest_honor'
    );
    if (highHonors.length > 0) {
      const lead =
        highHonors.find((r) => r.tier === 'highest_honor') || highHonors[0];
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `medal-news-m${currentMonth}-${Date.now()}`,
            month: currentMonth,
            outlet: 'Pentagon Wire',
            category: 'defense',
            headline:
              lead.tier === 'highest_honor'
                ? `White House Ceremony: President Presents Medal of Honor to ${lead.memberRankAbbr} ${lead.memberName}`
                : `President Awards ${lead.medalName} to ${highHonors.length} Decorated Service Member${
                    highHonors.length > 1 ? 's' : ''
                  }`,
            summary: `${lead.memberRankAbbr} ${lead.memberName} (${MILITARY_SERVICES[lead.service].label}) received the ${lead.medalName}. ${lead.citation}`,
            tone: 'positive',
          },
        ])
      );

      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-medal-${currentMonth}-${Date.now()}`,
          month: currentMonth,
          category: 'Security',
          title: `Presidential Decoration: ${lead.medalName} (${lead.memberRankAbbr} ${lead.memberName})`,
          description: `Presented the ${lead.medalName} to ${lead.memberRankAbbr} ${lead.memberName} (${MILITARY_SERVICES[lead.service].label}) with Merit Score ${lead.meritScoreAtAward}.`,
        },
      ]);
    }
  };

  const handleAwardMilitaryMedal = (
    memberId: string,
    medal: MilitaryMedalDefinition,
    citation?: string
  ) => {
    applyMilitaryMedals([{ memberId, medal, citation }]);
  };

  const handleBatchAwardTopPerformers = (memberIds: string[]) => {
    const awards = memberIds
      .map((id) => {
        const member = militaryRoster.find((m) => m.id === id);
        if (!member) return null;
        const topMedal = getTopEligibleMedalForMember(member);
        if (!topMedal) return null;
        return {
          memberId: member.id,
          medal: topMedal,
          citation: `Batch Merit Citation for sustained high performance (Merit ${member.meritScore}) with ${member.unit}.`,
        };
      })
      .filter(
        (
          item
        ): item is {
          memberId: string;
          medal: MilitaryMedalDefinition;
          citation: string;
        } => item !== null
      );
    applyMilitaryMedals(awards);
  };

  const handleAssignUnitToTheater = (
    unitId: string,
    theaterId: RegionalTheaterId,
    posture: TheaterUnitPosture
  ) => {
    const unit = DEPLOYABLE_MILITARY_UNITS.find((u) => u.id === unitId);
    const theater = REGIONAL_THEATERS.find((t) => t.id === theaterId);
    if (!unit || !theater) return;

    const currentInTheater = theaterAssignments.filter(
      (a) => a.theaterId === theaterId
    );
    if (
      currentInTheater.length >= theater.maxUnits &&
      !currentInTheater.some((a) => a.unitId === unitId)
    ) {
      return;
    }

    playDeskSound('stamp', muted);
    setTheaterAssignments((prev) => {
      const filtered = prev.filter((a) => a.unitId !== unitId);
      return [
        ...filtered,
        {
          unitId,
          theaterId,
          posture,
          assignedMonth: currentMonth,
        },
      ];
    });

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `theater-deploy-${unitId}-m${currentMonth}-${Date.now()}`,
          month: currentMonth,
          outlet: 'Pentagon Force Posture Wire',
          category: 'defense',
          headline: `Pentagon Orders ${unit.name} to ${theater.commandCode}`,
          summary: `${unit.name} (${unit.unitType}) deployed to ${theater.name} under ${posture} posture, boosting regional diplomatic and security odds.`,
          tone: 'neutral',
        },
      ])
    );
  };

  const handleRecallUnitFromTheater = (unitId: string) => {
    const unit = DEPLOYABLE_MILITARY_UNITS.find((u) => u.id === unitId);
    const existing = theaterAssignments.find((a) => a.unitId === unitId);
    if (!existing) return;
    playDeskSound('select', muted);
    setTheaterAssignments((prev) => prev.filter((a) => a.unitId !== unitId));
    if (unit) {
      const theater = REGIONAL_THEATERS.find(
        (t) => t.id === existing.theaterId
      );
      setNewsFeed((prev) =>
        mergeNewsStories(prev, [
          {
            id: `theater-recall-${unitId}-m${currentMonth}-${Date.now()}`,
            month: currentMonth,
            outlet: 'Pentagon Force Posture Wire',
            category: 'defense',
            headline: `${unit.name} Rotates Out of ${theater?.commandCode || 'Theater'} to Reserve`,
            summary: `Commanders returned ${unit.name} to strategic U.S. reserve readiness.`,
            tone: 'neutral',
          },
        ])
      );
    }
  };

  const handleUpdateTheaterUnitPosture = (
    unitId: string,
    posture: TheaterUnitPosture
  ) => {
    playDeskSound('select', muted);
    setTheaterAssignments((prev) =>
      prev.map((a) => (a.unitId === unitId ? { ...a, posture } : a))
    );
  };

  const handleResolveTheaterSecurityEvent = (
    event: TheaterSecurityEventDefinition,
    probabilityUsedPct: number,
    unitBonusPct: number,
    assignedUnitNames: string[]
  ) => {
    const lastResolved = resolvedTheaterEventMonths[event.theaterId];
    if (
      typeof lastResolved === 'number' &&
      currentMonth - lastResolved < 3
    ) {
      return;
    }

    const theater =
      REGIONAL_THEATERS.find((t) => t.id === event.theaterId) ||
      REGIONAL_THEATERS[0];
    const diffOpsOffset = getGameDifficulty(
      profile.gameDifficulty
    ).opsOddsOffset;
    const effectiveEventOdds = clamp(
      Math.round(probabilityUsedPct + diffOpsOffset),
      15,
      96
    );
    const succeeded = Math.random() * 100 < effectiveEventOdds;
    playDeskSound(succeeded ? 'stamp' : 'alert', muted);

    const deltas = succeeded ? event.successRewards : event.failurePenalties;
    const unitListLabel =
      assignedUnitNames.length > 0
        ? assignedUnitNames.join(', ')
        : 'baseline homeland-staged forces';

    const outcome: TheaterSecurityEventOutcome = {
      id: `theater-evt-${event.id}-m${currentMonth}-${Date.now()}`,
      eventId: event.id,
      theaterId: event.theaterId,
      theaterName: theater.name,
      title: event.title,
      month: currentMonth,
      succeeded,
      probabilityUsedPct: effectiveEventOdds,
      unitBonusPct,
      assignedUnitNames,
      headline: succeeded
        ? `${theater.commandCode} Neutralizes ${event.title}`
        : `${theater.commandCode} Faces Setback During ${event.title}`,
      summary: succeeded
        ? `Operating with ${probabilityUsedPct}% success odds (+${unitBonusPct}% from regional units: ${unitListLabel}), U.S. commands stabilized ${theater.name} and reassured regional partners.`
        : `Despite ${probabilityUsedPct}% projected odds (${unitListLabel}), adversaries exploited coverage gaps during ${event.title}, straining regional deterrence.`,
      diplomaticDelta: deltas.diplomaticDelta,
      approvalDelta: deltas.approvalDelta,
      readinessDelta: deltas.readinessDelta,
    };

    setResolvedTheaterEventMonths((prev) => ({
      ...prev,
      [event.theaterId]: currentMonth,
    }));
    setLatestTheaterEventOutcome(outcome);

    setMetrics((prev) => ({
      ...prev,
      diplomaticStanding: clamp(
        Number((prev.diplomaticStanding + deltas.diplomaticDelta).toFixed(1)),
        5,
        100
      ),
      approval: clamp(
        Number((prev.approval + deltas.approvalDelta).toFixed(1)),
        0,
        95
      ),
    }));

    setMilitary((prev) => ({
      ...prev,
      forceReadiness: clamp(
        Math.round(prev.forceReadiness + deltas.readinessDelta),
        30,
        100
      ),
    }));

    setNewsFeed((prev) =>
      mergeNewsStories(prev, [
        {
          id: `news-${outcome.id}`,
          month: currentMonth,
          outlet: 'Global Security Monitor',
          category: 'defense',
          headline: outcome.headline,
          summary: outcome.summary,
          tone: succeeded ? 'positive' : 'critical',
        },
      ])
    );

    if (succeeded) {
      setMilestones((prev) => [
        ...prev,
        {
          id: `ms-${outcome.id}`,
          month: currentMonth,
          category: 'Security',
          title: `${theater.commandCode} Deterrence Success: ${event.title}`,
          description: outcome.summary,
        },
      ]);
    }
  };

  const handlePlayAgain = () => {
    archiveCompletedLibrary(fullCareerSnapshot);
    localStorage.removeItem(STORAGE_KEY);
    setSavedCareer(null);
    setErrorMsg(null);
    setCollapseReason(undefined);
    setPolicyDraftText('');
    setPersonalActionText('');
    setSpeechDraftText('');
    setLatestStatementResult(null);
    setLatestUnscriptedResult(null);
    setLatestSituationResult(null);
    setLatestVetoResult(null);
    setDiplomaticMissions([]);
    setReelectionCampaign(createDefaultCampaignState());
    setShowReelectionPrompt(false);
    setPendingScandal(null);
    setShowResignModal(false);
    setShowImpeachmentModal(false);
    setImpeachmentResult(null);
    setImpeachmentAutoPrompted(false);
    setActiveEmergencyAlert(null);
    setAddressedStabilityMonths({});
    setEmergencyResolutions([]);
    setHarmonyMeetingMonths({});
    setLatestHarmonyOutcome(null);
    setShowPressConference(false);
    setLatestPressConferenceSummary(null);
    setShowSotuModal(false);
    setSotuDeliveredYears([]);
    setShowWhipModal(false);
    setLastWhipMonth(null);
    setLastFedConsultMonth(null);
    setLastJudicialNomMonth(null);
    setShowBudgetModal(false);
    setLastBudgetMonth(null);
    setLastRegionalOutreachMonth(null);
    setLatestIntelBrief(null);
    setLastIntelBriefMonth(null);
    setLastSummitMonth(null);
    setLatestSummitOutcome(null);
    setMilitaryRoster(createInitialMilitaryRoster());
    setPromotionHistory([]);
    setMedalHistory([]);
    setTheaterAssignments(createDefaultTheaterAssignments());
    setResolvedTheaterEventMonths({});
    setLatestTheaterEventOutcome(null);
    setSupremeCourtBench(INITIAL_SUPREME_COURT_BENCH);
    setResolvedCourtCaseIds([]);
    setTradeStances({ ...DEFAULT_TRADE_STANCES });
    setLastTradeActionMonth(null);
    setShowSupremeCourtModal(false);
    setShowTradePolicyModal(false);
    setShowWhiteHouseToursModal(false);
    setLastWhiteHouseTourMonth(null);
    setWhiteHouseTourHistory([]);
    setLatestNuclearResult(null);
    setNuclearStrikeHistory([]);
    setSecretServiceProtection(false);
    setLastSecretServiceBudgetMonth(null);
    setActiveTab('briefing');
    setPhase('TITLE_SETUP');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-stone-900">
      <HeaderBar
        phase={phase}
        activeTab={activeTab}
        history={history}
        newsFeed={newsFeed}
        startingYear={profile.startingYear}
        onSelectTab={(tab) => {
          playDeskSound('select', muted);
          if (phase === 'CAREER_END' && tab === 'library') {
            setActiveTab('library');
            return;
          }
          setActiveTab(tab);
        }}
        onReturnToSetup={() => setPhase('TITLE_SETUP')}
        onOpenResign={() => setShowResignModal(true)}
      />

      <div className="flex-1">
        {phase === 'TITLE_SETUP' && (
          <TitleSetup
            savedCareer={savedCareer}
            isLoadingCustom={isLoadingCustom}
            errorMsg={errorMsg}
            onStartScenario={handleStartScenario}
            onResumeSaved={handleResumeSaved}
            onDiscardSaved={handleDiscardSaved}
          />
        )}

        {(phase === 'PLAYING' ||
          phase === 'SIMULATING' ||
          phase === 'MIDTERM_REVIEW') && (
          <>
            {activeTab === 'briefing' && (
              <BriefingDesk
                profile={profile}
                scenarioTitle={scenarioTitle}
                currentMonth={currentMonth}
                metrics={metrics}
                military={military}
                institutions={institutions}
                history={history}
                legislativeRecords={legislativeRecords}
                milestones={milestones}
                diplomaticMissions={diplomaticMissions}
                newsFeed={newsFeed}
                briefing={currentBriefing}
                latestOutcome={latestOutcome}
                policyDraftText={policyDraftText}
                personalActionText={personalActionText}
                speechDraftText={speechDraftText}
                onChangePolicyDraft={setPolicyDraftText}
                onChangePersonalAction={setPersonalActionText}
                onChangeSpeechDraft={setSpeechDraftText}
                isSimulating={phase === 'SIMULATING'}
                isIssuingStatement={isIssuingStatement}
                latestStatementResult={latestStatementResult}
                isExecutingUnscriptedAction={isExecutingUnscriptedAction}
                latestUnscriptedResult={latestUnscriptedResult}
                reelectionCampaign={reelectionCampaign}
                onRunForReelection={handleRunForReelection}
                onDeclineReelection={handleDeclineReelection}
                errorMsg={errorMsg}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
                onNavigateTab={(tab) => {
                  playDeskSound('select', muted);
                  setActiveTab(tab);
                }}
                onIssuePublicStatement={handleIssuePublicStatement}
                onDismissStatementResult={() => setLatestStatementResult(null)}
                onExecuteUnscriptedAction={handleExecuteUnscriptedAction}
                onDismissUnscriptedResult={() => setLatestUnscriptedResult(null)}
                onOpenImpeachment={() => setShowImpeachmentModal(true)}
                onOpenResign={() => setShowResignModal(true)}
                addressedStabilityMonths={addressedStabilityMonths}
                emergencyResolutions={emergencyResolutions}
                onTriggerEmergencyCheck={(metricKey) => {
                  const alert = buildEmergencyAlertForMetric(
                    metricKey,
                    metrics,
                    currentMonth
                  );
                  setActiveEmergencyAlert(alert);
                }}
                onOpenPressConference={() => {
                  playDeskSound('select', muted);
                  setShowPressConference(true);
                }}
                onOpenStateOfTheUnion={() => {
                  playDeskSound('select', muted);
                  setShowSotuModal(true);
                }}
                sotuDeliveredThisYear={sotuDeliveredThisYear}
                currentYearNumber={currentYearNumber}
                onOpenCapitolWhip={() => {
                  playDeskSound('select', muted);
                  setShowWhipModal(true);
                }}
                whipUsedThisMonth={whipUsedThisMonth}
                onOpenBudgetNegotiator={() => {
                  playDeskSound('select', muted);
                  setShowBudgetModal(true);
                }}
                lastBudgetMonth={lastBudgetMonth}
                onOpenExecutivePowersHub={() => {
                  playDeskSound('select', muted);
                  setShowExecutivePowersHub(true);
                }}
                onOpenDebateArena={() => {
                  playDeskSound('select', muted);
                  setShowDebateModal(true);
                }}
                onOpenSupremeCourt={() => {
                  playDeskSound('select', muted);
                  setShowSupremeCourtModal(true);
                }}
                onOpenTradePolicy={() => {
                  playDeskSound('select', muted);
                  setShowTradePolicyModal(true);
                }}
                onOpenWhiteHouseTours={() => {
                  playDeskSound('select', muted);
                  setShowWhiteHouseToursModal(true);
                }}
                lastTourMonth={lastWhiteHouseTourMonth}
                secretServiceProtection={secretServiceProtection}
                onToggleSecretServiceProtection={
                  handleToggleSecretServiceProtection
                }
                onSubmitTurn={handleSubmitTurn}
              />
            )}

            {activeTab === 'news' && (
              <PressAndPolls
                party={resolvePartyId(profile.party, profile.coalition)}
                campaign={reelectionCampaign}
                blocs={blocs}
                latestOutcome={latestOutcome}
                newsFeed={newsFeed}
                initialMetrics={initialMetrics}
                metrics={metrics}
                military={military}
                history={history}
                currentMonth={currentMonth}
                startingYear={profile.startingYear}
                isIssuingStatement={isIssuingStatement}
                latestStatementResult={latestStatementResult}
                latestPressConferenceSummary={latestPressConferenceSummary}
                lastRegionalOutreachMonth={lastRegionalOutreachMonth}
                onIssuePublicStatement={handleIssuePublicStatement}
                onDismissStatementResult={() => setLatestStatementResult(null)}
                onOpenPressConference={() => {
                  playDeskSound('select', muted);
                  setShowPressConference(true);
                }}
                onDismissPressConferenceSummary={() =>
                  setLatestPressConferenceSummary(null)
                }
                onDispatchRegionalOutreach={handleDispatchRegionalOutreach}
                adminSuite={adminSuite}
                onChangePressAccess={(mode) => setAdminSuite(prev => ({ ...prev, pressAccessMode: mode }))}
                onHostTownHall={(venue) => setAdminSuite(prev => ({ ...prev, lastTownHallMonth: currentMonth, actionLog: [{ month: currentMonth, title: `Town Hall: ${venue.label}`, desc: venue.headline }, ...prev.actionLog] }))}
                onQueueRebuttalStatement={(text) => setAdminSuite(prev => ({ ...prev, actionLog: [{ month: currentMonth, title: 'Public Rebuttal', desc: text }, ...prev.actionLog] }))}
                onRunCampaignAdWave={(strat) => setAdminSuite(prev => ({ ...prev, lastAdWaveMonth: currentMonth, actionLog: [{ month: currentMonth, title: 'Campaign Ad Wave', desc: strat }, ...prev.actionLog] }))}
                onRunDebatePrep={(track) => setAdminSuite(prev => ({ ...prev, lastDebatePrepMonth: currentMonth, actionLog: [{ month: currentMonth, title: 'Debate Prep Track', desc: track }, ...prev.actionLog] }))}
              />
            )}

            {activeTab === 'cabinet' && (
              <CabinetView
                party={resolvePartyId(profile.party, profile.coalition)}
                currentMonth={currentMonth}
                vicePresident={vicePresident}
                cabinet={cabinet}
                military={military}
                metrics={metrics}
                newsFeed={newsFeed}
                isReplacingId={replacingCabinetId}
                isFiringOfficial={isFiringOfficial}
                isNominatingVp={isNominatingVp}
                lastConfirmation={lastConfirmationResult}
                lastVpConfirmation={lastVpConfirmation}
                latestDismissalResult={latestDismissalResult}
                latestHarmonyOutcome={latestHarmonyOutcome}
                harmonyMeetingMonths={harmonyMeetingMonths}
                dismissedOtherOfficials={dismissedOtherOfficials}
                errorMsg={errorMsg}
                onDismissConfirmation={() => setLastConfirmationResult(null)}
                onDismissVpConfirmation={() => setLastVpConfirmation(null)}
                onDismissDismissalResult={() => setLatestDismissalResult(null)}
                onDismissHarmonyOutcome={() => setLatestHarmonyOutcome(null)}
                onCompleteHarmonyMeeting={handleCompleteHarmonyMeeting}
                onReplaceCabinet={handleReplaceCabinet}
                onNominateVp={handleNominateVp}
                onFireOfficial={handleFireOfficial}
                onDraftFromCounsel={handleDraftFromCounsel}
                adminSuite={adminSuite}
                onChangeVpAssignment={(asgn) => setAdminSuite(prev => ({ ...prev, vpAssignment: asgn }))}
                onRunLeakAudit={(style) => setAdminSuite(prev => ({ ...prev, lastLeakAuditMonth: currentMonth, actionLog: [{ month: currentMonth, title: 'Leak Audit Conducted', desc: style }, ...prev.actionLog] }))}
                onCommendSecretary={(member) => setAdminSuite(prev => ({ ...prev, lastCommendMonth: currentMonth, actionLog: [{ month: currentMonth, title: `Commended ${member.name}`, desc: member.roleTitle }, ...prev.actionLog] }))}
                onActingSwap={(member) => setAdminSuite(prev => ({ ...prev, lastActingSwapMonth: currentMonth, actionLog: [{ month: currentMonth, title: `Acting Status Swap for ${member.name}`, desc: member.roleTitle }, ...prev.actionLog] }))}
                onQueueTaskForce={(policy, speech) => setAdminSuite(prev => ({ ...prev, actionLog: [{ month: currentMonth, title: 'Cabinet Task Force', desc: policy }, ...prev.actionLog] }))}
                onOpenNominateJcsModal={() => {
                  playDeskSound('select', muted);
                  setShowNominateJcsModal(true);
                }}
                onOpenPardonsModal={() => {
                  playDeskSound('select', muted);
                  setShowPardonsModal(true);
                }}
              />
            )}

            {activeTab === 'military' && (
              <SituationRoomView
                currentMonth={currentMonth}
                military={military}
                institutions={institutions}
                metrics={metrics}
                cabinet={cabinet}
                diplomaticMissions={diplomaticMissions}
                isResolvingScenario={isResolvingSituation}
                isFiringOfficial={isFiringOfficial}
                latestResult={latestSituationResult}
                latestDismissalResult={latestDismissalResult}
                errorMsg={errorMsg}
                onDismissResult={() => setLatestSituationResult(null)}
                onDismissDismissalResult={() => setLatestDismissalResult(null)}
                onExecuteScenario={handleExecuteSituationScenario}
                onChangeJointChiefsChair={(chair) => {
                  playDeskSound('select', muted);
                  setMilitary((prev) => ({
                    ...prev,
                    jointChiefsChair: chair,
                  }));
                  setNewsFeed((prev) =>
                    mergeNewsStories(prev, [
                      {
                        id: `jcs-assign-m${currentMonth}-${Date.now()}`,
                        month: currentMonth,
                        outlet: 'Capitol Dispatch',
                        category: 'defense',
                        headline: `White House Taps ${chair.name} as Joint Chiefs Chair`,
                        summary: `Senate and House Armed Services leaders weighed the shift to ${chair.doctrine} (${chair.branch}) ahead of confirmation oversight.`,
                        tone: 'neutral',
                      },
                    ])
                  );
                  setMilestones((prev) => [
                    ...prev,
                    {
                      id: `ms-jcs-${currentMonth}-${Date.now()}`,
                      month: currentMonth,
                      category: 'Security',
                      title: `Appointed Joint Chiefs Chair: ${chair.name}`,
                      description: `Pentagon command leadership shifted to ${chair.name} (${chair.branch} · ${chair.doctrine}).`,
                    },
                  ]);
                }}
                onFireJointChiefsChair={(reason) =>
                  handleFireOfficial({
                    targetCategory: 'military',
                    targetId: 'joint_chiefs_chair',
                    targetName: military.jointChiefsChair.name,
                    roleTitle: 'Chair of the Joint Chiefs of Staff',
                    reason,
                  })
                }
                onQueueSecurityOrder={handleQueueSecurityOrder}
                onDispatchDiplomaticMission={handleDispatchDiplomaticMission}
                onRecallDiplomaticMission={handleRecallDiplomaticMission}
                onClearResolvedMissions={handleClearResolvedMissions}
                lastFedConsultMonth={lastFedConsultMonth}
                lastJudicialNomMonth={lastJudicialNomMonth}
                onConsultFed={handleConsultFed}
                onNominateJudges={handleNominateJudges}
                isLoadingIntelBrief={isLoadingIntelBrief}
                latestIntelBrief={latestIntelBrief}
                lastIntelBriefMonth={lastIntelBriefMonth}
                onRunIntelBrief={handleRunIntelBrief}
                lastSummitMonth={lastSummitMonth}
                latestSummitOutcome={latestSummitOutcome}
                onDismissSummitOutcome={() => setLatestSummitOutcome(null)}
                onCompleteDiplomaticSummit={handleCompleteDiplomaticSummit}
                militaryRoster={militaryRoster}
                promotionHistory={promotionHistory}
                medalHistory={medalHistory}
                onPromoteMilitaryMember={handlePromoteMilitaryMember}
                onBatchPromoteMilitaryMembers={handleBatchPromoteMilitaryMembers}
                onRecruitMilitaryPersonnel={handleRecruitMilitaryPersonnel}
                onAppointFourStarAsJcs={handleAppointFourStarAsJcs}
                onAwardMilitaryMedal={handleAwardMilitaryMedal}
                onBatchAwardTopPerformers={handleBatchAwardTopPerformers}
                lastJcsConfirmation={lastJcsConfirmation}
                onDismissJcsConfirmation={() => setLastJcsConfirmation(null)}
                onOpenNominateJcsModal={() => {
                  playDeskSound('select', muted);
                  setShowNominateJcsModal(true);
                }}
                theaterAssignments={theaterAssignments}
                resolvedTheaterEventMonths={resolvedTheaterEventMonths}
                latestTheaterEventOutcome={latestTheaterEventOutcome}
                onDismissTheaterEventOutcome={() =>
                  setLatestTheaterEventOutcome(null)
                }
                onAssignUnitToTheater={handleAssignUnitToTheater}
                onRecallUnitFromTheater={handleRecallUnitFromTheater}
                onUpdateTheaterUnitPosture={handleUpdateTheaterUnitPosture}
                onResolveTheaterSecurityEvent={
                  handleResolveTheaterSecurityEvent
                }
                latestNuclearResult={latestNuclearResult}
                nuclearStrikeHistory={nuclearStrikeHistory}
                onDismissNuclearResult={() => setLatestNuclearResult(null)}
                onExecuteNuclearStrike={handleExecuteNuclearStrike}
                secretServiceProtection={secretServiceProtection}
              />
            )}

            {activeTab === 'policy_archive' && (
              <PolicyArchiveView
                profile={profile}
                scenarioTitle={scenarioTitle}
                history={history}
                legislativeRecords={legislativeRecords}
                initialMetrics={initialMetrics}
                currentMetrics={metrics}
                canChallengeVeto={true}
                latestVetoResult={latestVetoResult}
                onDismissVetoResult={() => setLatestVetoResult(null)}
                onChallengeVeto={handleChallengeVeto}
                onNavigateToBriefing={() => setActiveTab('briefing')}
              />
            )}

            {activeTab === 'library' && (
              <PresidentialLibraryView
                careerState={fullCareerSnapshot}
                pastLibraries={pastLibraries}
                initialMetrics={initialMetrics}
                isSynthesizing={isSynthesizingLibrary}
                synthesisError={synthesisError}
                onSynthesizeLibrary={handleSynthesizeLibrary}
                onStartNewCareer={handlePlayAgain}
              />
            )}
          </>
        )}

        {phase === 'MIDTERM_REVIEW' && latestOutcome && (
          <MidtermModal
            outcome={latestOutcome}
            metrics={metrics}
            onContinue={() => setPhase('PLAYING')}
          />
        )}

        {phase === 'PLAYING' && pendingScandal && (
          <CabinetScandalModal
            scandal={pendingScandal}
            memberLoyalty={
              cabinet.find((c) => c.id === pendingScandal.departmentId)?.loyalty
            }
            onResolve={handleResolveCabinetScandal}
          />
        )}

        {phase === 'PLAYING' && !pendingScandal && activeEmergencyAlert && (
          <EmergencyAlertModal
            profile={profile}
            alert={activeEmergencyAlert}
            onResolve={handleResolveEmergencyAlert}
          />
        )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showReelectionPrompt &&
          reelectionCampaign.decision === 'undecided' && (
            <ReelectionPromptModal
              profile={profile}
              currentMonth={currentMonth}
              metrics={metrics}
              onRunForReelection={handleRunForReelection}
              onDeclineReelection={handleDeclineReelection}
            />
          )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showImpeachmentModal && (
          <ImpeachmentModal
            profile={profile}
            vicePresident={vicePresident}
            currentMonth={currentMonth}
            metrics={metrics}
            isSubmitting={isRunningImpeachment}
            result={impeachmentResult}
            errorMsg={errorMsg}
            onRunProceedings={handleRunImpeachment}
            onResignInstead={() => {
              setShowImpeachmentModal(false);
              setShowResignModal(true);
            }}
            onCompleteRemoval={handleCompleteImpeachmentRemoval}
            onCloseSurvived={handleCloseImpeachmentSurvived}
            onDismissPreVote={() => setShowImpeachmentModal(false)}
          />
        )}

        {phase === 'PLAYING' && showResignModal && (
          <ResignModal
            profile={profile}
            vicePresident={vicePresident}
            currentMonth={currentMonth}
            metrics={metrics}
            onConfirmResign={handleConfirmResign}
            onCancel={() => setShowResignModal(false)}
          />
        )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showPressConference && (
            <PressConferenceModal
              currentMonth={currentMonth}
              presidentName={profile.name}
              onFetchQuestions={handleFetchPressConferenceQuestions}
              onAnswerQuestion={handleAnswerPressConferenceQuestion}
              onFinishSession={(summary) => {
                setShowPressConference(false);
                if (summary) {
                  setLatestPressConferenceSummary(summary);
                }
              }}
            />
          )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showSotuModal && (
            <StateOfTheUnionModal
              presidentName={profile.name}
              currentMonth={currentMonth}
              yearNumber={currentYearNumber}
              metrics={metrics}
              alreadyDeliveredThisYear={sotuDeliveredThisYear}
              onDeliverAddress={handleDeliverStateOfTheUnion}
              onClose={() => setShowSotuModal(false)}
            />
          )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showWhipModal && (
            <CapitolWhipModal
              currentMonth={currentMonth}
              metrics={metrics}
              lastWhipMonth={lastWhipMonth}
              onExecuteWhip={handleExecuteCapitolWhip}
              onClose={() => setShowWhipModal(false)}
            />
          )}

        {phase === 'PLAYING' &&
          !pendingScandal &&
          !activeEmergencyAlert &&
          showBudgetModal && (
            <BudgetAllocationModal
              currentMonth={currentMonth}
              metrics={metrics}
              military={military}
              lastBudgetMonth={lastBudgetMonth}
              onEnactBudget={handleEnactBudget}
              onClose={() => setShowBudgetModal(false)}
            />
          )}

        {phase === 'PLAYING' && showExecutivePowersHub && (
          <ExecutivePowersHub
            isOpen={showExecutivePowersHub}
            onClose={() => setShowExecutivePowersHub(false)}
            currentMonth={currentMonth}
            metrics={metrics}
            executedPowers={executedPowers}
            onExecutePower={handleExecuteExecutivePower}
          />
        )}

        {phase === 'PLAYING' && showNominateJcsModal && (
          <NominateJcsModal
            isOpen={showNominateJcsModal}
            onClose={() => {
              if (!isNominatingJcs) setShowNominateJcsModal(false);
            }}
            profile={profile}
            military={military}
            isSubmitting={isNominatingJcs}
            onNominate={handleNominateJcs}
          />
        )}

        {phase === 'CAREER_END' &&
          (activeTab === 'library' ? (
            <PresidentialLibraryView
              careerState={fullCareerSnapshot}
              pastLibraries={pastLibraries}
              initialMetrics={initialMetrics}
              isSynthesizing={isSynthesizingLibrary}
              synthesisError={synthesisError}
              onSynthesizeLibrary={handleSynthesizeLibrary}
              onStartNewCareer={handlePlayAgain}
            />
          ) : activeTab === 'policy_archive' ? (
            <PolicyArchiveView
              profile={profile}
              scenarioTitle={scenarioTitle}
              history={history}
              legislativeRecords={legislativeRecords}
              initialMetrics={initialMetrics}
              currentMetrics={metrics}
              canChallengeVeto={false}
              latestVetoResult={latestVetoResult}
              onDismissVetoResult={() => setLatestVetoResult(null)}
              onChallengeVeto={handleChallengeVeto}
              onNavigateToBriefing={() => setActiveTab('briefing')}
            />
          ) : (
            <CareerEndView
              profile={profile}
              scenarioTitle={scenarioTitle}
              metrics={metrics}
              evaluation={evaluation}
              collapseReason={collapseReason}
              isLoading={isLoadingEval}
              onOpenLibrary={() => setActiveTab('library')}
              onPlayAgain={handlePlayAgain}
            />
          ))}
        {showDebateModal && (
          <PresidentialDebateModal
            matchup={DEBATE_MATCHUPS[0]}
            currentBlocs={blocs}
            onCompleteDebate={handleCompleteDebate}
            onClose={() => setShowDebateModal(false)}
          />
        )}
        {showPardonsModal && (
          <PresidentialPardonsModal
            currentMonth={currentMonth}
            metrics={metrics}
            onResolvePetition={handleResolveClemency}
            onClose={() => setShowPardonsModal(false)}
          />
        )}
        {showSupremeCourtModal && (
          <SupremeCourtModal
            currentMonth={currentMonth}
            party={resolvePartyId(profile.party, profile.coalition)}
            metrics={metrics}
            institutions={institutions}
            bench={supremeCourtBench}
            resolvedCaseIds={resolvedCourtCaseIds}
            onResolveCase={handleResolveCourtCase}
            onConfirmNominee={handleConfirmCourtNominee}
            onClose={() => setShowSupremeCourtModal(false)}
          />
        )}
        {showTradePolicyModal && (
          <TradePolicyModal
            currentMonth={currentMonth}
            metrics={metrics}
            currentStances={tradeStances}
            lastTradeActionMonth={lastTradeActionMonth}
            onEnactTradePackage={handleEnactTradePackage}
            onClose={() => setShowTradePolicyModal(false)}
          />
        )}
        {showWhiteHouseToursModal && (
          <WhiteHouseToursModal
            currentMonth={currentMonth}
            metrics={metrics}
            military={military}
            lastTourMonth={lastWhiteHouseTourMonth}
            tourHistory={whiteHouseTourHistory}
            onScheduleTour={handleScheduleWhiteHouseTour}
            onClose={() => setShowWhiteHouseToursModal(false)}
          />
        )}
      </div>

      <OfflineIndicator />
    </div>
  );
}
