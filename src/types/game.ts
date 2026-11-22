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

export interface PresidentProfile {
  name: string;
  party?: PartyId;
  coalition: CoalitionId;
  background: BackgroundId;
  termLength: 12 | 48;
  startingYear?: number;
  historicalPresidentId?: string;
  governingDoctrine?: string;
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
  isCustom?: boolean;
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
    | 'Summit Walkout';
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
  collapseReason?: string;
  updatedAt: string;
}
