export type GamePhase =
  | 'TITLE_SETUP'
  | 'PLAYING'
  | 'SIMULATING'
  | 'MIDTERM_REVIEW'
  | 'CAREER_END';

export type WorkspaceTab =
  | 'briefing'
  | 'news'
  | 'cabinet'
  | 'military'
  | 'policy_archive'
  | 'library';

export type PartyId = 'democratic' | 'independent' | 'republican';

export type CoalitionId =
  | 'center_left'
  | 'center_right'
  | 'independent_populist'
  | 'technocratic_reformist';

export type BackgroundId =
  | 'governor'
  | 'senator'
  | 'executive'
  | 'commander';

export type GameDifficultyId = 'easy' | 'medium' | 'hard';

export interface PresidentProfile {
  name: string;
  party?: PartyId;
  coalition: CoalitionId;
  background: BackgroundId;
  termLength: 12 | 48;
  startingYear?: number;
  historicalPresidentId?: string;
  governingDoctrine?: string;
  motto?: string;
  difficultyMode?: string;
  gameDifficulty?: GameDifficultyId;
  historicalScenarioId?: string;
  historicalBenchmarkNote?: string;
}

export type PoliticalClimateModeId =
  | 'standard'
  | 'mandate'
  | 'hardball'
  | 'honeymoon'
  | 'populist_wave'
  | 'tech_disruption';

export type ScenarioClimateCategory =
  | 'tech_economy'
  | 'geopolitics_crisis'
  | 'governance_fiscal';

export type GovernanceFocus = string;
export type PressAccessMode = string;
export type VpAssignmentId = string;
export type CyberDefenseMode = string;
export type TriadPosture = string;
export type IntelFocusRegion = string;
export type DefenseProcurementFocus = string;

export interface AdminSuiteState {
  governanceFocus: GovernanceFocus;
  pressAccessMode: PressAccessMode;
  vpAssignment: VpAssignmentId;
  cyberDefenseMode: CyberDefenseMode;
  triadPosture: TriadPosture;
  intelFocusRegion: IntelFocusRegion;
  defenseProcurementFocus: DefenseProcurementFocus;
  activeSanctions: string[];
  actionLog: {
    id?: string;
    month: number;
    title: string;
    desc: string;
    category?: string;
    summary?: string;
    impactSummary?: string;
  }[];
  lastCommendMonth?: number;
  lastLeakAuditMonth?: number;
  lastActingSwapMonth?: number;
  lastPardonMonth?: number;
  lastProclamationMonth?: number;
  lastCampDavidMonth?: number;
  lastTownHallMonth?: number;
  lastAdWaveMonth?: number;
  lastDebatePrepMonth?: number;
  lastSanctionMonth?: number;
  lastAidMonth?: number;
  lastReserveMonth?: number;
  lastExerciseMonth?: number;
}

export interface NationalMetrics {
  approval: number; // 0-100
  congressSupport: number; // 0-100
  gdpGrowth: number; // annualized %
  inflation: number; // %
  unemployment: number; // %
  diplomaticStanding: number; // 0-100
  nationalDebtTrillions: number;
  houseSeats: number; // out of 435
  senateSeats: number; // out of 100
}

export interface VoterBlocs {
  workingClass: number;
  suburbanModerates: number;
  techFinance: number;
  seniors: number;
  youngVoters: number;
}

export type NewsCategory =
  | 'economy'
  | 'foreign'
  | 'domestic'
  | 'defense'
  | 'politics';

export interface NewsHeadlineItem {
  id: string;
  month: number;
  outlet: string;
  category: NewsCategory;
  headline: string;
  summary: string;
  tone: 'positive' | 'neutral' | 'critical';
}

export type CabinetDepartment =
  | 'chief_of_staff'
  | 'state'
  | 'defense'
  | 'treasury'
  | 'nsa'
  | 'justice'
  | 'labor'
  | 'press_secretary';

export interface CabinetMember {
  id: CabinetDepartment;
  roleTitle: string;
  name: string;
  leaning: string;
  loyalty: number; // 0-100
  competence: number; // 0-100
  status: 'Aligned' | 'Cautious' | 'Strained';
  currentCounsel: string;
}

export interface CabinetConfirmationResult {
  departmentId: CabinetDepartment;
  roleTitle: string;
  previousName: string;
  nomineeName: string;
  leaning: string;
  loyalty: number;
  competence: number;
  currentCounsel: string;
  approved: boolean;
  senateYea: number;
  senateNay: number;
  houseSupportPercent: number;
  vpTieBreakerUsed: boolean;
  voteMarginLabel: string;
  confirmationHeadline: string;
  committeeSummary: string;
  congressDelta: number;
  approvalDelta: number;
}

export interface VicePresidentProfile {
  id: string;
  name: string;
  formerTitle: string;
  leaning: string;
  loyalty: number;
  popularity: number;
  traitSummary: string;
  currentCounsel: string;
}

export type FireTargetCategory =
  | 'vp'
  | 'cabinet'
  | 'white_house'
  | 'military'
  | 'agency_official';

export interface FireOfficialRequest {
  targetCategory: FireTargetCategory;
  targetId?: string;
  targetName: string;
  roleTitle: string;
  reason: string;
}

export interface OfficialDismissalResult {
  targetCategory: FireTargetCategory;
  targetId?: string;
  targetName: string;
  roleTitle: string;
  reason: string;
  constitutionalNote?: string;
  leadOutlet: string;
  leadHeadline: string;
  mediaSummary: string;
  congressResponse: {
    status: string;
    summary: string;
    majorityLeaderQuote: string;
    oppositionLeaderQuote: string;
  };
  mediaReactions: NewsHeadlineItem[];
  loyaltyShock: number;
  metricDeltas: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
    forceReadiness?: number;
  };
}

export interface VpNominationResult {
  previousName: string;
  nomineeName: string;
  formerTitle: string;
  leaning: string;
  loyalty: number;
  popularity: number;
  traitSummary: string;
  currentCounsel: string;
  approved: boolean;
  senateYea: number;
  senateNay: number;
  houseYea: number;
  houseNay: number;
  voteMarginLabel: string;
  confirmationHeadline: string;
  committeeSummary: string;
  congressDelta: number;
  approvalDelta: number;
}

export interface AppointeeBonuses {
  approval?: number;
  congressSupport?: number;
  gdpGrowth?: number;
  inflation?: number;
  diplomaticStanding?: number;
  workingClass?: number;
  suburbanModerates?: number;
  techFinance?: number;
  seniors?: number;
  youngVoters?: number;
  forceReadiness?: number;
}

export interface AppointeeCandidate {
  id: string;
  name: string;
  leaning: string;
  bio: string;
  bonusLabel: string;
  loyalty: number;
  competence: number;
  openingCounsel: string;
  bonuses: AppointeeBonuses;
}

export interface VicePresidentCandidate {
  id: string;
  name: string;
  formerTitle: string;
  leaning: string;
  bio: string;
  bonusLabel: string;
  loyalty: number;
  popularity: number;
  openingCounsel: string;
  bonuses: AppointeeBonuses;
}

export interface MilitaryOperation {
  id: string;
  name: string;
  region: string;
  posture: 'Deterrence' | 'Active Strike' | 'Humanitarian' | 'Cyber Defense' | 'Standby';
  personnelCount: string;
  statusNote: string;
}

export interface MilitaryCommandState {
  jointChiefsChair: {
    name: string;
    branch: string;
    doctrine: string;
  };
  defconLevel: 1 | 2 | 3 | 4 | 5;
  forceReadiness: number; // 0-100
  defenseBudgetBillions: number;
  cyberPosture: 'Normal' | 'Elevated' | 'Active Shield';
  intelThreatLevel: 'Guarded' | 'Elevated' | 'High' | 'Severe';
  intelSummary: string;
  operations: MilitaryOperation[];
}

export type MilitaryServiceBranch =
  | 'army'
  | 'marines'
  | 'navy'
  | 'coast_guard';

export type MilitaryRankTier =
  | 'recruit'
  | 'enlisted'
  | 'nco'
  | 'junior_officer'
  | 'field_officer'
  | 'flag_officer';

export interface MilitaryRankInfo {
  gradeIndex: number; // 0 (E-1) to 18 (O-10)
  payGrade: string; // e.g., E-1 .. E-9, O-1 .. O-10
  title: string; // e.g., Private (Recruit), Gunnery Sergeant, Rear Admiral
  abbr: string; // e.g., PVT, GySgt, RDML, GEN
  tier: MilitaryRankTier;
  tierLabel: string;
  stars: number; // 0 for E-1..O-6, 1..4 for O-7..O-10
  isOfficer: boolean;
}

export type MilitaryMedalTier =
  | 'achievement'
  | 'commendation'
  | 'meritorious'
  | 'distinguished'
  | 'valor'
  | 'highest_honor';

export interface MilitaryMedalDefinition {
  id: string;
  name: string;
  abbr: string;
  tier: MilitaryMedalTier;
  tierLabel: string;
  minMeritScore: number;
  serviceSpecificNames?: Partial<Record<MilitaryServiceBranch, string>>;
  eligibilityNote: string;
  description: string;
  readinessBonus: number;
  approvalBonus: number;
  meritBoost: number;
}

export interface MilitaryMedalAwardRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberRankAbbr: string;
  service: MilitaryServiceBranch;
  medalId: string;
  medalName: string;
  medalAbbr: string;
  tier: MilitaryMedalTier;
  month: number;
  meritScoreAtAward: number;
  citation: string;
  awardedBy: string;
}

export interface MilitaryServiceMember {
  id: string;
  name: string;
  service: MilitaryServiceBranch;
  gradeIndex: number; // 0..18
  specialty: string;
  unit: string;
  yearsOfService: number;
  commendations: number;
  meritScore: number; // 65-99
  status: 'Active Duty' | 'Forward Deployed' | 'Command Staff';
  promotedMonth?: number;
  serviceRecordMedals?: MilitaryMedalAwardRecord[];
}

export interface MilitaryPromotionRecord {
  id: string;
  memberId: string;
  memberName: string;
  service: MilitaryServiceBranch;
  fromPayGrade: string;
  fromRankTitle: string;
  toPayGrade: string;
  toRankTitle: string;
  toAbbr: string;
  stars: number;
  month: number;
  promotionType: 'Standard Advancement' | 'Battlefield Commission' | 'Senate Flag Confirmation';
  note: string;
}

export interface InstitutionalState {
  fedFundsRate: number;
  fedStance: 'Hawkish' | 'Neutral' | 'Accommodative';
  fedChairNote: string;
  judiciaryClimate: 'Favorable' | 'Split' | 'Hostile';
  pendingCourtNote: string;
}

export type DiplomaticMissionFocus = 'diplomaticStanding' | 'gdpGrowth';

export interface DiplomaticMission {
  id: string;
  targetCountry: string;
  envoyName: string;
  envoyTitle: string;
  missionTitle: string;
  focusMetric: DiplomaticMissionFocus;
  durationTurns: number; // 3 to 6 turns
  turnsElapsed: number;
  successProbability: number; // 25 to 92 (%)
  cumulativeDelta: number;
  status: 'In Progress' | 'Succeeded' | 'Setback';
  startedMonth: number;
  resolvedMonth?: number;
  theaterBonusAtDispatch?: number;
  latestUpdate: string;
}

export interface AdvisorSuggestion {
  role: string;
  title: string;
  policyDraft: string;
  speechDraft: string;
}

export interface MonthlyBriefing {
  title: string;
  situationSummary: string;
  domesticIssue: string;
  economicIssue: string;
  foreignIssue: string;
  urgentDilemma: string;
  suggestedDirectives: AdvisorSuggestion[];
}

export interface AdvisorReaction {
  speaker: string;
  role: string;
  quote: string;
  stance: 'supportive' | 'skeptical' | 'critical';
}

export interface LegislativeRecordItem {
  id: string;
  month: number;
  recordType: 'Legislation' | 'Executive Order' | 'Treaty' | 'Institutional';
  title: string;
  summary: string;
  outcomeStatus: 'Enacted' | 'Compromise' | 'Blocked';
  approvalImpact: number;
  vetoChallenged?: boolean;
}

export interface VetoChallengeResult {
  recordId: string;
  month: number;
  title: string;
  recordType: LegislativeRecordItem['recordType'];
  succeeded: boolean;
  previousStatus: LegislativeRecordItem['outcomeStatus'];
  newStatus: LegislativeRecordItem['outcomeStatus'];
  approvalDelta: number;
  congressDelta: number;
  summary: string;
}

export interface MilestoneItem {
  id: string;
  month: number;
  category: 'Political' | 'Economic' | 'Security' | 'Constitutional';
  title: string;
  description: string;
}

export interface LibrarySynthesis {
  generatedAtMonth: number;
  administrationTheme: string;
  longTermSummary: string;
  economicArc: string;
  foreignPolicyArc: string;
  institutionalLegacy: string;
}

export interface TurnOutcome {
  month: number;
  newspaperOutlet: string;
  newspaperHeadline: string;
  newspaperSubhead: string;
  outcomeNarrative: string;
  advisorReactions: AdvisorReaction[];
  newsWire: NewsHeadlineItem[];
  legislativeRecord?: Omit<
    LegislativeRecordItem,
    'id' | 'month' | 'approvalImpact'
  >;
  milestone?: Omit<MilestoneItem, 'id' | 'month'>;
  metricDeltas: {
    approval: number;
    congressSupport: number;
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
    diplomaticStanding: number;
    nationalDebtTrillions: number;
  };
  voterBlocDeltas: {
    workingClass: number;
    suburbanModerates: number;
    techFinance: number;
    seniors: number;
    youngVoters: number;
  };
  midtermSeatShift?: {
    houseDelta: number;
    senateDelta: number;
    summary: string;
  };
  collapseTriggered?: boolean;
  collapseReason?: string;
}

export type StatementVenue =
  | 'Press Podium'
  | 'Oval Office Address'
  | 'Social Media Post'
  | 'Press Gaggle';

export interface PublicStatementResult {
  id: string;
  month: number;
  venue: StatementVenue;
  statement: string;
  leadOutlet: string;
  leadHeadline: string;
  mediaSummary: string;
  congressReaction?: CongressActionReaction;
  advisorResponses: AdvisorReaction[];
  mediaReactions: NewsHeadlineItem[];
  metricDeltas: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
  };
  voterBlocDeltas: VoterBlocs;
}

export interface PressConferenceQuestion {
  id: string;
  reporterName: string;
  outlet: string;
  beat: NewsCategory;
  question: string;
  contextRef: string;
}

export interface PressConferenceQuestionResult {
  id: string;
  month: number;
  reporterName: string;
  outlet: string;
  beat: NewsCategory;
  question: string;
  playerAnswer: string;
  verdictLabel:
    | 'Commanding Response'
    | 'Measured Clarification'
    | 'Combative Pushback'
    | 'Evasive Pivot'
    | 'Damaging Gaffe';
  leadHeadline: string;
  mediaSummary: string;
  reporterFollowUp: string;
  approvalDelta: number;
  congressDelta: number;
  diplomaticDelta: number;
  mediaReactions: NewsHeadlineItem[];
  voterBlocDeltas: VoterBlocs;
}

export interface PressConferenceSummary {
  month: number;
  questionsAnswered: number;
  netApprovalDelta: number;
  netCongressDelta: number;
  netDiplomaticDelta: number;
  results: PressConferenceQuestionResult[];
}

export type UnscriptedActionVisibility = 'public' | 'off_record';

export interface CongressActionReaction {
  oversightStatus:
    | 'No Action'
    | 'Bipartisan Applause'
    | 'Partisan Criticism'
    | 'Ethics Inquiry'
    | 'Subpoena Threat'
    | 'Censure Resolution'
    | 'Impeachment Inquiry';
  censureRisk: 'None' | 'Low' | 'Elevated' | 'Severe';
  chamberSummary: string;
  majorityLeaderQuote: string;
  oppositionLeaderQuote: string;
  caucusReactionNote: string;
}

export interface UnscriptedActionResult {
  id: string;
  month: number;
  action: string;
  visibility: UnscriptedActionVisibility;
  leakedToPress: boolean;
  leadOutlet: string;
  leadHeadline: string;
  mediaSummary: string;
  congressReaction: CongressActionReaction;
  advisorResponses: AdvisorReaction[];
  mediaReactions: NewsHeadlineItem[];
  metricDeltas: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
  };
  voterBlocDeltas: VoterBlocs;
}

export type SituationScenarioType =
  | 'Start War / Request AUMF'
  | 'End War / Peace Treaty'
  | 'Targeted Strikes & No-Fly Zone'
  | 'Naval Blockade & Sanctions'
  | 'Covert & Cyber Operation'
  | 'Allied Deterrence Surge'
  | 'Custom Crisis Scenario';

export interface SituationCongressResponse {
  chamberSummary: string;
  warPowersStatus:
    | 'AUMF Authorized'
    | 'Pending AUMF Vote'
    | 'War Powers Challenge'
    | 'Peace Treaty Ratified'
    | 'Bipartisan Backing'
    | 'Constitutional Standoff';
  senateVoteEstimate: string;
  houseVoteEstimate: string;
  majorityLeaderQuote: string;
  oppositionLeaderQuote: string;
}

export interface SituationCabinetResponse {
  departmentId?: CabinetDepartment;
  speaker: string;
  role: string;
  quote: string;
  stance: 'supportive' | 'skeptical' | 'critical';
  loyaltyDelta: number;
}

export interface SituationRoomResult {
  id: string;
  month: number;
  scenarioType: SituationScenarioType;
  targetCountry: string;
  orderSummary: string;
  leadOutlet: string;
  leadHeadline: string;
  mediaSummary: string;
  congressResponse: SituationCongressResponse;
  cabinetResponses: SituationCabinetResponse[];
  mediaReactions: NewsHeadlineItem[];
  metricDeltas: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
    gdpGrowth: number;
    inflation: number;
    nationalDebtTrillions: number;
  };
  voterBlocDeltas: VoterBlocs;
  theaterDeploymentContext?: TheaterDeploymentContext;
}

export type RegionalTheaterId =
  | 'americas'
  | 'europe'
  | 'middle_east'
  | 'indo_pacific'
  | 'africa_atlantic';

export type TheaterUnitPosture =
  | 'Deterrence Patrol'
  | 'Forward Presence'
  | 'Rapid Contingency';

export interface DeployableMilitaryUnit {
  id: string;
  name: string;
  shortCode: string;
  branch: MilitaryServiceBranch;
  unitType: string;
  strengthRating: number;
  diplomacyBonusPct: number;
  securityBonusPct: number;
  preferredTheaters: RegionalTheaterId[];
  specialtyNote: string;
}

export interface TheaterUnitAssignment {
  unitId: string;
  theaterId: RegionalTheaterId;
  posture: TheaterUnitPosture;
  assignedMonth: number;
}

export interface RegionalTheaterDefinition {
  id: RegionalTheaterId;
  name: string;
  commandCode: string;
  hqLabel: string;
  strategicSummary: string;
  mapPin: { x: number; y: number };
  sectorBox: { x: number; y: number; width: number; height: number };
  labelAnchor: { x: number; y: number };
  countries: string[];
  maxUnits: number;
}

export interface TheaterSecurityEventDefinition {
  id: string;
  theaterId: RegionalTheaterId;
  title: string;
  category: 'Maritime Security' | 'Air Defense' | 'Border Stability' | 'Counter-Proliferation';
  threatSummary: string;
  baseSuccessPct: number;
  recommendedBranches: MilitaryServiceBranch[];
  successRewards: {
    diplomaticDelta: number;
    approvalDelta: number;
    readinessDelta: number;
  };
  failurePenalties: {
    diplomaticDelta: number;
    approvalDelta: number;
    readinessDelta: number;
  };
}

export interface TheaterSecurityEventOutcome {
  id: string;
  eventId: string;
  theaterId: RegionalTheaterId;
  theaterName: string;
  title: string;
  month: number;
  succeeded: boolean;
  probabilityUsedPct: number;
  unitBonusPct: number;
  assignedUnitNames: string[];
  headline: string;
  summary: string;
  diplomaticDelta: number;
  approvalDelta: number;
  readinessDelta: number;
}

export interface TheaterDeploymentContext {
  theaterId: RegionalTheaterId;
  theaterName: string;
  commandCode: string;
  assignedUnitCount: number;
  assignedUnitNames: string[];
  diplomacyOddsBonusPct: number;
  securityOddsBonusPct: number;
  operationSuccessProbabilityPct: number;
  deterrenceLabel: string;
}

export interface TermHistoryEntry {
  month: number;
  briefingTitle: string;
  policyDirective: string;
  personalAction?: string;
  publicMessaging: string;
  outcome: TurnOutcome;
  metricsAfter: NationalMetrics;
  blocsAfter: VoterBlocs;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  eraLabel: string;
  description: string;
  imageUrl: string;
  initialMetrics: NationalMetrics;
  initialBlocs: VoterBlocs;
  initialBriefing: MonthlyBriefing;
  initialNews: NewsHeadlineItem[];
  initialCabinet: CabinetMember[];
  initialMilitary: MilitaryCommandState;
  initialInstitutions: InstitutionalState;
  climateCategory?: ScenarioClimateCategory;
  isCustom?: boolean;
  isHistorical?: boolean;
  historicalYear?: number;
  historicalEraTag?: string;
  recommendedPresidentId?: string;
  historicalBenchmarkNote?: string;
  historicalKeyEvents?: string[];
}

export interface CareerEvaluation {
  historicalGrade: string;
  legacyTitle: string;
  historianEssay: string;
  definingAchievements: string[];
  majorMissteps: string[];
  reelectionVerdict: string;
}

export type ReelectionDecision = 'undecided' | 'running' | 'declined';

export interface ReelectionCampaignState {
  decision: ReelectionDecision;
  announcedMonth?: number;
  opponentName: string;
  opponentParty: string;
  campaignSlogan: string;
  campaignMomentum: number; // -20 to +20
  projectedVoteShare: number; // 30 to 70 (%)
  battlegroundEdge: string;
  eventsHeld: number;
}

export type CabinetScandalDecision = 'fire' | 'investigate' | 'defend';

export interface CabinetScandalEvent {
  id: string;
  month: number;
  departmentId: CabinetDepartment;
  memberName: string;
  roleTitle: string;
  outlet: string;
  headline: string;
  allegationSummary: string;
  severity: 'Moderate' | 'Severe' | 'Critical';
  congressPressure: string;
}

export type ImpeachmentStrategy = 'contest' | 'deal';

export interface ImpeachmentResult {
  articlesTitle: string;
  articlesSummary: string;
  houseImpeached: boolean;
  houseYea: number;
  houseNay: number;
  senateConvicted: boolean;
  senateYea: number;
  senateNay: number;
  chiefJusticeNote: string;
  majorityLeaderQuote: string;
  oppositionLeaderQuote: string;
  leadOutlet: string;
  leadHeadline: string;
  verdictSummary: string;
  approvalDelta: number;
  congressDelta: number;
}

export type StabilityMetricKey =
  | 'inflation'
  | 'nationalDebtTrillions'
  | 'approval';

export type StabilitySeverity = 'Nominal' | 'Elevated' | 'Severe' | 'Critical';

export interface StabilityThresholdStatus {
  metricKey: StabilityMetricKey;
  label: string;
  currentValue: number;
  formattedValue: string;
  thresholdLabel: string;
  historicalReference: string;
  severity: StabilitySeverity;
  breached: boolean;
  proximityPct: number;
  marginLabel: string;
}

export interface EmergencyResponseOption {
  id: string;
  title: string;
  instrumentLabel: string;
  description: string;
  metricDeltas: {
    approval?: number;
    congressSupport?: number;
    gdpGrowth?: number;
    inflation?: number;
    unemployment?: number;
    diplomaticStanding?: number;
    nationalDebtTrillions?: number;
  };
  fedFundsDelta?: number;
  fedStance?: InstitutionalState['fedStance'];
  cabinetLoyaltyDelta?: number;
  tradeoffSummary: string;
}

export interface EmergencyAlertEvent {
  id: string;
  month: number;
  metricKey: StabilityMetricKey;
  title: string;
  historicalBenchmark: string;
  triggerValueLabel: string;
  thresholdLabel: string;
  briefSummary: string;
  institutionalConsequence: string;
  options: EmergencyResponseOption[];
}

export interface EmergencyResolutionRecord {
  id: string;
  month: number;
  metricKey: StabilityMetricKey;
  alertTitle: string;
  chosenOptionTitle: string;
  customDirectiveNote?: string;
  resolvedValueLabel: string;
  stillBreached: boolean;
}

export type CabinetHarmonyTone =
  | 'empathetic'
  | 'pragmatic'
  | 'directive'
  | 'confrontational';

export interface CabinetHarmonyChoice {
  id: string;
  label: string;
  tone: CabinetHarmonyTone;
  toneLabel: string;
  promptQuote: string;
  rapportDelta: number;
  scandalRiskDelta: number;
  approvalDelta: number;
  congressDelta: number;
  officialResponse: string;
  riskHint: string;
}

export interface CabinetHarmonyRound {
  roundNumber: 1 | 2;
  topic: string;
  officialOpening: string;
  choices: CabinetHarmonyChoice[];
}

export interface CabinetHarmonyScenario {
  memberId: CabinetDepartment;
  memberName: string;
  roleTitle: string;
  leaning: string;
  currentLoyalty: number;
  currentStatus: CabinetMember['status'];
  startingRapport: number;
  isToxic: boolean;
  baseScandalRiskPct: number;
  meetingTitle: string;
  briefingContext: string;
  round1: CabinetHarmonyRound;
}

export interface CabinetHarmonyOutcome {
  memberId: CabinetDepartment;
  memberName: string;
  roleTitle: string;
  month: number;
  previousStatus: CabinetMember['status'];
  newStatus: CabinetMember['status'];
  previousLoyalty: number;
  newLoyalty: number;
  loyaltyDelta: number;
  approvalDelta: number;
  congressDelta: number;
  finalRapport: number;
  scandalRiskPct: number;
  headline: string;
  summary: string;
  updatedCounsel: string;
  revealedScandal: CabinetScandalEvent | null;
}

export interface StateOfTheUnionResult {
  id: string;
  yearNumber: number;
  month: number;
  themeTitle: string;
  customRemarks: string;
  chamberReception: string;
  leadOutlet: string;
  leadHeadline: string;
  mediaSummary: string;
  speakerReaction: string;
  oppositionRebuttal: string;
  approvalDelta: number;
  congressDelta: number;
  diplomaticDelta: number;
  voterBlocDeltas: VoterBlocs;
  mediaReactions: NewsHeadlineItem[];
}

export interface CapitolWhipOption {
  id: string;
  title: string;
  caucusTarget: string;
  summary: string;
  congressDelta: number;
  approvalDelta: number;
  debtDeltaTrillions: number;
  inflationDelta: number;
  tradeoffLabel: string;
}

export interface FedConsultOption {
  id: string;
  title: string;
  stanceRequested: InstitutionalState['fedStance'];
  summary: string;
  rateDelta: number;
  gdpDelta: number;
  inflationDelta: number;
  approvalDelta: number;
  chairNote: string;
  tradeoffLabel: string;
}

export interface JudicialNominationOption {
  id: string;
  title: string;
  summary: string;
  congressCost: number;
  approvalDelta: number;
  shiftsClimateTowardFavorable: boolean;
  courtNote: string;
  tradeoffLabel: string;
}

export interface BudgetAllocationInput {
  defenseShiftPct: number; // -15 to +25
  infrastructureShiftPct: number; // -15 to +25
  taxReliefShiftPct: number; // -15 to +25
  deficitCurbPct: number; // 0 to +25
}

export interface BudgetProjection {
  debtDeltaTrillions: number;
  gdpDelta: number;
  inflationDelta: number;
  approvalDelta: number;
  congressDelta: number;
  defenseBudgetDeltaBillions: number;
  readinessDelta: number;
  passageStatus: 'Enacted' | 'Compromise';
  blocDeltas: VoterBlocs;
}

export interface BattlegroundStateProjection {
  code: string;
  name: string;
  electoralVotes: number;
  primaryBlocKey: keyof VoterBlocs;
  primaryBlocLabel: string;
  margin: number; // positive = Incumbent lead, negative = Challenger lead
  status: 'Likely Incumbent' | 'Lean Incumbent' | 'Toss-Up' | 'Lean Challenger' | 'Likely Challenger';
  headlineNote: string;
}

export interface ClassifiedIntelFlashpoint {
  region: string;
  severity: 'Watch' | 'Elevated' | 'Critical';
  assessment: string;
}

export interface ClassifiedIntelBrief {
  id: string;
  month: number;
  threatLevel: MilitaryCommandState['intelThreatLevel'];
  executiveSummary: string;
  flashpoints: ClassifiedIntelFlashpoint[];
  recommendedActionTitle: string;
  recommendedTargetCountry: string;
  recommendedScenarioType: SituationScenarioType;
  recommendedOrderText: string;
}

export type DiplomaticSummitTone = 'conciliatory' | 'pragmatic' | 'assertive';

export interface DiplomaticSummitPower {
  id: string;
  country: string;
  summitTitle: string;
  counterpartName: string;
  counterpartTitle: string;
  postureLabel: 'Strategic Rival' | 'Competitive Partner' | 'Key Ally';
  coreIssue: string;
  baseTrust: number;
  baseWalkoutRiskPct: number;
  secondaryMetricLabel: string;
}

export interface DiplomaticSummitChoice {
  id: string;
  label: string;
  tone: DiplomaticSummitTone;
  description: string;
  trustDelta: number;
  walkoutRiskDelta: number;
  standingBonus: number;
  approvalDelta: number;
  gdpDelta: number;
  inflationDelta: number;
}

export interface DiplomaticSummitRound {
  roundNumber: 1 | 2 | 3;
  stageTitle: string;
  counterpartPrompt: string;
  choices: DiplomaticSummitChoice[];
}

export interface DiplomaticSummitOutcome {
  id: string;
  powerId: string;
  country: string;
  summitTitle: string;
  counterpartName: string;
  month: number;
  verdict:
    | 'Historic Breakthrough Treaty'
    | 'Constructive Joint Communiqué'
    | 'Stalled Talks'
    | 'Summit Walkout'
    | 'Security Incident';
  walkedOut: boolean;
  finalTrust: number;
  walkoutRiskPct: number;
  diplomaticDelta: number;
  approvalDelta: number;
  gdpDelta: number;
  inflationDelta: number;
  headline: string;
  summary: string;
  treatyTitle?: string;
  securityEvent?: 'Assassination Attempt' | 'Kidnapping' | null;
  securityEventRiskPct?: number;
  secretServiceProtected?: boolean;
  forceReadinessDelta?: number;
  budgetCostTrillions?: number;
}

export type ExecutivePowerCategory =
  | 'Cabinet & Bureaucracy'
  | 'Economic & Fiscal'
  | 'National Security'
  | 'Congress & Judiciary'
  | 'Legacy & Media'
  | 'Science, Space & Energy'
  | 'Healthcare & Public Welfare'
  | 'Infrastructure & Housing'
  | 'Trade, Labor & Education'
  | 'Intelligence & Cyber Command';

export interface ExecutivePowerDefinition {
  id: string;
  category: ExecutivePowerCategory;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  instrumentType: 'Executive Order' | 'Policy Directive' | 'Emergency Action' | 'Diplomatic Order' | 'White House Proclamation';
  cooldownMonths: number;
  effectSummary: string;
  isNewExpansion?: boolean;
  customHeadline?: string;
  forceReadinessDelta?: number;
  cabinetLoyaltyDelta?: number;
  blocImpacts?: Partial<VoterBlocs>;
  metricImpacts: {
    approval?: number;
    congressSupport?: number;
    gdpGrowth?: number;
    inflation?: number;
    unemployment?: number;
    diplomaticStanding?: number;
    nationalDebtTrillions?: number;
  };
}

export interface ExecutedPowerRecord {
  id: string;
  powerId: string;
  title: string;
  category: ExecutivePowerCategory;
  month: number;
  summary: string;
}

export interface JcsConfirmationResult {
  approved: boolean;
  senateYea: number;
  senateNay: number;
  voteMarginLabel: string;
  nomineeName: string;
  branch: string;
  doctrine: string;
  loyalty: number;
  competence: number;
  currentCounsel: string;
  confirmationHeadline: string;
  committeeSummary: string;
  congressDelta: number;
  approvalDelta: number;
}

export interface SavedCareerState {
  profile: PresidentProfile;
  vicePresident: VicePresidentProfile;
  scenarioId: string;
  scenarioTitle: string;
  customPremise?: string;
  currentMonth: number;
  phase: GamePhase;
  initialMetricsSnapshot?: NationalMetrics;
  metrics: NationalMetrics;
  blocs: VoterBlocs;
  cabinet: CabinetMember[];
  military: MilitaryCommandState;
  diplomaticMissions?: DiplomaticMission[];
  institutions: InstitutionalState;
  newsFeed: NewsHeadlineItem[];
  legislativeRecords: LegislativeRecordItem[];
  milestones: MilestoneItem[];
  librarySynthesis: LibrarySynthesis | null;
  currentBriefing: MonthlyBriefing;
  latestOutcome: TurnOutcome | null;
  history: TermHistoryEntry[];
  evaluation: CareerEvaluation | null;
  reelectionCampaign?: ReelectionCampaignState;
  pendingScandal?: CabinetScandalEvent | null;
  addressedStabilityMonths?: Partial<Record<StabilityMetricKey, number>>;
  emergencyResolutions?: EmergencyResolutionRecord[];
  harmonyMeetingMonths?: Partial<Record<CabinetDepartment, number>>;
  sotuDeliveredYears?: number[];
  lastWhipMonth?: number;
  lastFedConsultMonth?: number;
  lastJudicialNomMonth?: number;
  lastBudgetMonth?: number;
  lastRegionalOutreachMonth?: number;
  lastIntelBriefMonth?: number;
  lastSummitMonth?: number;
  executedPowers?: ExecutedPowerRecord[];
  adminSuite?: AdminSuiteState;
  militaryRoster?: MilitaryServiceMember[];
  promotionHistory?: MilitaryPromotionRecord[];
  medalHistory?: MilitaryMedalAwardRecord[];
  theaterAssignments?: TheaterUnitAssignment[];
  resolvedTheaterEventMonths?: Partial<Record<RegionalTheaterId, number>>;
  resolvedHistoricalEvents?: ResolvedHistoricalEventRecord[];
  secretServiceProtection?: boolean;
  collapseReason?: string;
  updatedAt: string;
}

export type HistoricalEventCategory =
  | 'constitutional'
  | 'security'
  | 'economic'
  | 'geopolitical';

export interface HistoricalEventOption {
  id: string;
  label: string;
  stanceTag: string;
  description: string;
  policyDraft: string;
  speechDraft: string;
  metricDeltas: {
    approval: number;
    congressSupport: number;
    gdpGrowth: number;
    inflation: number;
    unemployment: number;
    diplomaticStanding: number;
  };
  blocImpacts: Partial<VoterBlocs>;
  defconDelta?: number;
  readinessDelta?: number;
  headline: string;
  newsTone: 'positive' | 'neutral' | 'critical';
}

export interface HistoricalEventItem {
  id: string;
  title: string;
  historicalDate: string;
  year: number;
  category: HistoricalEventCategory;
  severity: 'High' | 'Critical' | 'Historic';
  linkedScenarioIds: string[];
  summary: string;
  historicalPrecedent: string;
  options: HistoricalEventOption[];
}

export interface ResolvedHistoricalEventRecord {
  eventId: string;
  title: string;
  historicalDate: string;
  monthResolved: number;
  optionId: string;
  decision: string;
  headline: string;
}

export interface DebateStanceOption {
  id: string;
  title: string;
  stanceText: string;
  tone: 'aggressive' | 'technocratic' | 'visionary';
  blocImpacts: {
    workingClass?: number;
    suburbanModerates?: number;
    techFinance?: number;
    seniors?: number;
    youngVoters?: number;
  };
  momentumDelta: number;
  approvalDelta: number;
  mediaReaction: string;
}

export interface DebateRound {
  topic: string;
  category: 'economy' | 'defense' | 'domestic' | 'foreign' | 'technology';
  moderatorPrompt: string;
  opponentAttack: string;
  stances: DebateStanceOption[];
}

