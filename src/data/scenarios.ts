import {
  BackgroundId,
  CabinetMember,
  CoalitionId,
  GameDifficultyId,
  InstitutionalState,
  MilitaryCommandState,
  PartyId,
  PoliticalClimateModeId,
  ScenarioDefinition,
  VicePresidentProfile,
} from '../types/game';
import {
  CABINET_ROSTER_OPTIONS,
  JOINT_CHIEFS_CANDIDATES,
  VP_CANDIDATES,
} from './appointees';

export const PARTIES: {
  id: PartyId;
  label: string;
  shortCode: 'D' | 'I' | 'R';
  summary: string;
  trait: string;
  badgeClass: string;
  activeCardClass: string;
}[] = [
  {
    id: 'democratic',
    label: 'Democratic',
    shortCode: 'D',
    summary:
      'Broad-tent coalition emphasizing labor protections, healthcare & clean-grid investment, civil rights, and multilateral alliances.',
    trait: '+2% Young Voters · +1% Working Class',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-800',
    activeCardClass: 'border-sky-700 bg-sky-50/70 ring-1 ring-sky-700',
  },
  {
    id: 'independent',
    label: 'Independent',
    shortCode: 'I',
    summary:
      'Non-partisan, cross-aisle White House outside strict party orthodoxy—wins swing moderates but must negotiate ad-hoc floor majorities.',
    trait: '+4% Suburban Moderates · +2% Approval · -3% Auto Congress Whip',
    badgeClass: 'border-amber-300 bg-amber-50 text-amber-900',
    activeCardClass: 'border-amber-700 bg-amber-50/70 ring-1 ring-amber-700',
  },
  {
    id: 'republican',
    label: 'Republican',
    shortCode: 'R',
    summary:
      'Conservative-to-populist coalition prioritizing tax relief, deregulation, border & energy security, fiscal restraint, and military deterrence.',
    trait: '+2% Seniors · +2% Tech & Finance',
    badgeClass: 'border-red-200 bg-red-50 text-red-800',
    activeCardClass: 'border-red-700 bg-red-50/70 ring-1 ring-red-700',
  },
];

export function resolvePartyId(
  party?: PartyId,
  coalition?: CoalitionId
): PartyId {
  if (party === 'democratic' || party === 'independent' || party === 'republican') {
    return party;
  }
  if (coalition === 'center_right') return 'republican';
  if (coalition === 'independent_populist') return 'independent';
  return 'democratic';
}

export function getPartyMeta(party?: PartyId, coalition?: CoalitionId) {
  const id = resolvePartyId(party, coalition);
  return PARTIES.find((p) => p.id === id) || PARTIES[0];
}

export const COALITIONS: {
  id: CoalitionId;
  label: string;
  summary: string;
}[] = [
  {
    id: 'center_left',
    label: 'Center-Left Coalition',
    summary: 'Prioritizes labor investment, social safety nets, and clean infrastructure.',
  },
  {
    id: 'center_right',
    label: 'Center-Right Coalition',
    summary: 'Prioritizes deregulation, supply-side tax reform, and fiscal restraint.',
  },
  {
    id: 'independent_populist',
    label: 'Independent Populist',
    summary: 'Prioritizes reshoring manufacturing, trade protection, and anti-monopoly action.',
  },
  {
    id: 'technocratic_reformist',
    label: 'Technocratic Reformist',
    summary: 'Prioritizes deficit stabilization, permitting modernization, and allied trade.',
  },
];

export interface PoliticalClimateModeOption {
  id: PoliticalClimateModeId;
  label: string;
  shortTrait: string;
  description: string;
  promptNote: string;
  modifiers: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
    gdpGrowth: number;
    inflation: number;
    workingClass: number;
    suburbanModerates: number;
    techFinance: number;
    seniors: number;
    youngVoters: number;
  };
}

export const POLITICAL_CLIMATE_MODES: PoliticalClimateModeOption[] = [
  {
    id: 'standard',
    label: 'Balanced Cycle',
    shortTrait: 'Baseline · Standard Scrutiny',
    description: 'Conventional midterm tension, normal legislative friction, and balanced press coverage.',
    promptNote: 'Balanced modern political climate with standard partisan pushback and press scrutiny.',
    modifiers: {
      approval: 0,
      congressSupport: 0,
      diplomaticStanding: 0,
      gdpGrowth: 0,
      inflation: 0,
      workingClass: 0,
      suburbanModerates: 0,
      techFinance: 0,
      seniors: 0,
      youngVoters: 0,
    },
  },
  {
    id: 'mandate',
    label: 'Landslide Mandate',
    shortTrait: '+5% Approval · +6% Congress · +4% Blocs',
    description: 'Decisive electoral victory grants early Capitol leverage and broad coalition tailwinds.',
    promptNote: 'Landslide Mandate political climate: administration enters with strong political capital, higher Congressional deference, and broad voter goodwill.',
    modifiers: {
      approval: 5,
      congressSupport: 6,
      diplomaticStanding: 2,
      gdpGrowth: 0,
      inflation: 0,
      workingClass: 4,
      suburbanModerates: 4,
      techFinance: 4,
      seniors: 4,
      youngVoters: 4,
    },
  },
  {
    id: 'hardball',
    label: 'Partisan Hardball',
    shortTrait: '-5% Approval · -6% Congress · High Oversight',
    description: 'Razor-thin majorities, hostile cable commentary, and relentless oversight subpoenas.',
    promptNote: 'Partisan Hardball climate: deeply polarized Congress, aggressive opposition subpoenas, skeptical media, and minimal legislative margin for error.',
    modifiers: {
      approval: -5,
      congressSupport: -6,
      diplomaticStanding: -2,
      gdpGrowth: 0,
      inflation: 0,
      workingClass: -3,
      suburbanModerates: -4,
      techFinance: -2,
      seniors: -2,
      youngVoters: -3,
    },
  },
  {
    id: 'honeymoon',
    label: 'Bipartisan Honeymoon',
    shortTrait: '+3% Approval · +8% Congress · +4 Diplomacy',
    description: 'Cross-aisle Senate dealmaking opens a rare window for treaties and infrastructure.',
    promptNote: 'Bipartisan Honeymoon climate: rare cross-party Senate cooperation, constructive allied diplomacy, and willingness to broker compromise bills.',
    modifiers: {
      approval: 3,
      congressSupport: 8,
      diplomaticStanding: 4,
      gdpGrowth: 0.1,
      inflation: 0,
      workingClass: 2,
      suburbanModerates: 5,
      techFinance: 3,
      seniors: 3,
      youngVoters: 1,
    },
  },
  {
    id: 'populist_wave',
    label: 'Populist Upheaval',
    shortTrait: '+6% Working Class · -4% Tech · -4% Congress',
    description: 'Anti-establishment fervor rallies industrial voters while rattling institutions and markets.',
    promptNote: 'Populist Upheaval climate: intense voter anger toward corporate monopolies and Washington institutions, strong working-class mobilization, and elevated bond/trade friction.',
    modifiers: {
      approval: -1,
      congressSupport: -4,
      diplomaticStanding: -3,
      gdpGrowth: -0.1,
      inflation: 0.3,
      workingClass: 6,
      suburbanModerates: -2,
      techFinance: -4,
      seniors: 2,
      youngVoters: 3,
    },
  },
  {
    id: 'tech_disruption',
    label: 'AI & Market Volatility',
    shortTrait: '+0.4% GDP · +6% Tech · -4% Labor Mood',
    description: 'Rapid frontier tech booms lift equity valuations even as white-collar and blue-collar anxiety spikes.',
    promptNote: 'AI & Market Volatility climate: rapid automation shocks, soaring compute investment, anxious white-collar and union households, and fierce regulatory debates.',
    modifiers: {
      approval: -2,
      congressSupport: -2,
      diplomaticStanding: 1,
      gdpGrowth: 0.4,
      inflation: -0.1,
      workingClass: -4,
      suburbanModerates: -2,
      techFinance: 6,
      seniors: -3,
      youngVoters: 2,
    },
  },
];

export function getPoliticalClimateMode(
  modeId?: string
): PoliticalClimateModeOption {
  return (
    POLITICAL_CLIMATE_MODES.find((m) => m.id === modeId) ||
    POLITICAL_CLIMATE_MODES[0]
  );
}

export interface GameDifficultyOption {
  id: GameDifficultyId;
  label: string;
  subtitle: string;
  description: string;
  shortTrait: string;
  promptNote: string;
  startingModifiers: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
    gdpGrowth: number;
    inflation: number;
    blocOffset: number;
    forceReadiness: number;
  };
  gainMultiplier: number;
  lossMultiplier: number;
  opsOddsOffset: number;
  impeachmentApprovalThreshold: number;
}

export const GAME_DIFFICULTIES: GameDifficultyOption[] = [
  {
    id: 'easy',
    label: 'Easy',
    subtitle: 'Favorable Tailwinds',
    description:
      'Forgiving public polling, cooperative floor whips, softer economic setbacks, higher mission success odds, and fewer Capitol scandals.',
    shortTrait: '+6% Approval & Congress · +8% Ops Odds · 1.2x Gains',
    promptNote:
      'Easy difficulty: forgiving political environment, constructive press and bipartisan leeway, softened setbacks, and strong policy upside.',
    startingModifiers: {
      approval: 6,
      congressSupport: 6,
      diplomaticStanding: 5,
      gdpGrowth: 0.25,
      inflation: -0.3,
      blocOffset: 3,
      forceReadiness: 4,
    },
    gainMultiplier: 1.2,
    lossMultiplier: 0.75,
    opsOddsOffset: 8,
    impeachmentApprovalThreshold: 3,
  },
  {
    id: 'medium',
    label: 'Medium',
    subtitle: 'Realistic Presidency',
    description:
      'Balanced modern simulation. Standard congressional resistance, realistic economic trade-offs, and proportional rewards for disciplined governance.',
    shortTrait: 'Balanced Baseline · Standard Scrutiny & Risk',
    promptNote:
      'Medium difficulty: balanced, realistic political simulation with credible partisan pushback and proportional economic/diplomatic trade-offs.',
    startingModifiers: {
      approval: 0,
      congressSupport: 0,
      diplomaticStanding: 0,
      gdpGrowth: 0,
      inflation: 0,
      blocOffset: 0,
      forceReadiness: 0,
    },
    gainMultiplier: 1.0,
    lossMultiplier: 1.0,
    opsOddsOffset: 0,
    impeachmentApprovalThreshold: 5,
  },
  {
    id: 'hard',
    label: 'Hard',
    subtitle: 'Brutal Crucible',
    description:
      'Skeptical electorate, hostile opposition oversight, steeper inflation and polling penalties, tougher mission odds, and earlier impeachment jeopardy.',
    shortTrait: '-6% Approval & Congress · -8% Ops Odds · 1.25x Penalties',
    promptNote:
      'Hard difficulty: unforgiving, hyper-scrutinized presidency with entrenched opposition, sharper economic/inflation headwinds, and heightened scandal & impeachment jeopardy.',
    startingModifiers: {
      approval: -6,
      congressSupport: -6,
      diplomaticStanding: -5,
      gdpGrowth: -0.3,
      inflation: 0.5,
      blocOffset: -3,
      forceReadiness: -4,
    },
    gainMultiplier: 0.85,
    lossMultiplier: 1.25,
    opsOddsOffset: -8,
    impeachmentApprovalThreshold: 12,
  },
];

export function getGameDifficulty(
  difficultyId?: string
): GameDifficultyOption {
  return (
    GAME_DIFFICULTIES.find((d) => d.id === difficultyId) ||
    GAME_DIFFICULTIES[1]
  );
}

export const BACKGROUNDS: {
  id: BackgroundId;
  label: string;
  trait: string;
}[] = [
  {
    id: 'governor',
    label: 'Two-Term Governor',
    trait: 'Starts with stronger executive management and suburban moderate trust.',
  },
  {
    id: 'senator',
    label: 'Senior U.S. Senator',
    trait: 'Starts with higher Congressional legislative leverage and floor alliances.',
  },
  {
    id: 'executive',
    label: 'Industrial Executive',
    trait: 'Starts with elevated market confidence and private-sector credibility.',
  },
  {
    id: 'commander',
    label: 'Former Defense Commander',
    trait: 'Starts with higher diplomatic authority and national security cohesion.',
  },
];

export const DEFAULT_VP: VicePresidentProfile = {
  id: VP_CANDIDATES[0].id,
  name: VP_CANDIDATES[0].name,
  formerTitle: VP_CANDIDATES[0].formerTitle,
  leaning: VP_CANDIDATES[0].leaning,
  loyalty: VP_CANDIDATES[0].loyalty,
  popularity: VP_CANDIDATES[0].popularity,
  traitSummary: VP_CANDIDATES[0].bonusLabel,
  currentCounsel: VP_CANDIDATES[0].openingCounsel,
};

export const DEFAULT_CABINET: CabinetMember[] = (
  Object.keys(CABINET_ROSTER_OPTIONS) as Array<keyof typeof CABINET_ROSTER_OPTIONS>
).map((dept) => {
  const info = CABINET_ROSTER_OPTIONS[dept];
  const first = info.candidates[0];
  return {
    id: dept,
    roleTitle: info.roleTitle,
    name: first.name,
    leaning: first.leaning,
    loyalty: first.loyalty,
    competence: first.competence,
    status: 'Aligned',
    currentCounsel: first.openingCounsel,
  };
});

export const MILITARY_OPERATIONS_PRESET: Record<string, MilitaryCommandState> = {
  fragile_boom: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 84,
    defenseBudgetBillions: 895,
    cyberPosture: 'Elevated',
    intelThreatLevel: 'Elevated',
    intelSummary:
      'Signals intelligence detects heightened maritime militia coordination near contested semiconductor transit lanes.',
    operations: [
      {
        id: 'op-pacific-watch',
        name: 'Operation Pacific Corridor',
        region: 'South China Sea',
        posture: 'Deterrence',
        personnelCount: '14,200 sailors & aircrew',
        statusNote: 'Carrier Strike Group 7 maintaining freedom-of-navigation patrols.',
      },
      {
        id: 'op-cyber-aegis',
        name: 'Task Force Grid Shield',
        region: 'CONUS Critical Infrastructure',
        posture: 'Cyber Defense',
        personnelCount: '2,400 cyber specialists',
        statusNote: 'Monitoring power substations and port logistics telemetry.',
      },
    ],
  },
  stagflation_gridlock: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 79,
    defenseBudgetBillions: 870,
    cyberPosture: 'Normal',
    intelThreatLevel: 'Elevated',
    intelSummary:
      'Energy corridor disruptions in the Red Sea and Black Sea threaten allied LNG and crude tanker insurance rates.',
    operations: [
      {
        id: 'op-maritime-escort',
        name: 'Operation Tanker Guard',
        region: 'Bab el-Mandeb & Gulf of Aden',
        posture: 'Deterrence',
        personnelCount: '8,600 naval & marine personnel',
        statusNote: 'Destroyer escort rotation keeping energy lanes open.',
      },
      {
        id: 'op-atlantic-reserve',
        name: 'Northern Logistics Readiness',
        region: 'North Atlantic',
        posture: 'Standby',
        personnelCount: '4,100 airlift crew',
        statusNote: 'Strategic airlift wings on 24-hour allied winter fuel alert.',
      },
    ],
  },
  crisis_confidence: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 81,
    defenseBudgetBillions: 882,
    cyberPosture: 'Active Shield',
    intelThreatLevel: 'High',
    intelSummary:
      'Domestic emergency infrastructure strain coincides with probing attacks against regional financial clearing networks.',
    operations: [
      {
        id: 'op-heartland-relief',
        name: 'Joint Task Force Heartland',
        region: 'Great Lakes & Midwest',
        posture: 'Humanitarian',
        personnelCount: '11,500 National Guard & Army Corps',
        statusNote: 'Deploying mobile microgrids and emergency substation repairs.',
      },
      {
        id: 'op-fin-shield',
        name: 'Operation Clearinghouse Shield',
        region: 'Cyber Command',
        posture: 'Cyber Defense',
        personnelCount: '3,100 cyber operators',
        statusNote: 'Hardening regional bank settlement gateways against ransomware.',
      },
    ],
  },
  ai_age: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 86,
    defenseBudgetBillions: 912,
    cyberPosture: 'Active Shield',
    intelThreatLevel: 'High',
    intelSummary:
      'Automated cyber-intrusion swarms probe national power grids and frontier AI lab model weights while rival states race to bypass advanced lithography export controls.',
    operations: [
      {
        id: 'op-compute-shield',
        name: 'Task Force Compute Shield',
        region: 'CONUS Labs & Energy Grid',
        posture: 'Cyber Defense',
        personnelCount: '3,800 cyber & AI defense specialists',
        statusNote:
          'Guarding frontier model-weight vaults and regional gigawatt substation telemetry.',
      },
      {
        id: 'op-foundry-guard',
        name: 'Operation Foundry Guard',
        region: 'Taiwan Strait & First Island Chain',
        posture: 'Deterrence',
        personnelCount: '16,400 naval & marine personnel',
        statusNote:
          'Protecting advanced chip lithography shipping corridors and subsea fiber cables.',
      },
    ],
  },
  multipolar_cold_war: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 3,
    forceReadiness: 88,
    defenseBudgetBillions: 945,
    cyberPosture: 'Active Shield',
    intelThreatLevel: 'High',
    intelSummary:
      'Coordinated naval exercises in the Western Pacific coincide with heightened electronic jamming and artillery probes along NATO Eastern Flank borders.',
    operations: [
      {
        id: 'op-northern-trident',
        name: 'Operation Northern Trident',
        region: 'Baltic & Eastern Flank',
        posture: 'Deterrence',
        personnelCount: '18,500 army & air personnel',
        statusNote:
          'Forward armored brigades and integrated Patriot batteries reinforcing allied borders.',
      },
      {
        id: 'op-pacific-freedom',
        name: 'Pacific Freedom Watch',
        region: 'East & South China Seas',
        posture: 'Deterrence',
        personnelCount: '22,000 sailors & marines',
        statusNote:
          'Dual carrier strike deterrence rotation reassuring Tokyo, Seoul, and Manila.',
      },
    ],
  },
  constitutional_gridlock: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 80,
    defenseBudgetBillions: 865,
    cyberPosture: 'Elevated',
    intelThreatLevel: 'Elevated',
    intelSummary:
      'Continuing-resolution budget uncertainty delays Pentagon procurement contracts while foreign disinformation campaigns amplify domestic polarization.',
    operations: [
      {
        id: 'op-border-watch',
        name: 'Joint Border Logistics Task Force',
        region: 'Southwest Border & Gulf',
        posture: 'Standby',
        personnelCount: '6,200 Coast Guard & Guard support',
        statusNote:
          'Assisting maritime interdiction and customs radar surveillance.',
      },
      {
        id: 'op-election-cyber',
        name: 'Cyber Integrity Watch',
        region: 'CONUS Critical Networks',
        posture: 'Cyber Defense',
        personnelCount: '2,100 cyber analysts',
        statusNote:
          'Monitoring state infrastructure portals against foreign botnet interference.',
      },
    ],
  },
  clean_grid_transition: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 83,
    defenseBudgetBillions: 890,
    cyberPosture: 'Elevated',
    intelThreatLevel: 'Elevated',
    intelSummary:
      'Export restrictions on refined lithium, cobalt, and rare-earth magnets test allied battery supply chains alongside severe seasonal storm response demands.',
    operations: [
      {
        id: 'op-arctic-minerals',
        name: 'Operation Arctic Corridor',
        region: 'North Atlantic & Bering Strait',
        posture: 'Deterrence',
        personnelCount: '3,400 Coast Guard & naval crew',
        statusNote:
          'Icebreaker patrols protecting northern critical-mineral shipping lanes.',
      },
      {
        id: 'op-climate-corps',
        name: 'Army Corps Resilience Task Force',
        region: 'Gulf Coast & Western Grid',
        posture: 'Humanitarian',
        personnelCount: '7,800 engineers & Guard',
        statusNote:
          'Hardening coastal floodgates and wildfire-threatened transmission corridors.',
      },
    ],
  },
  sovereign_debt_reckoning: {
    jointChiefsChair: {
      name: JOINT_CHIEFS_CANDIDATES[0].name,
      branch: JOINT_CHIEFS_CANDIDATES[0].branch,
      doctrine: JOINT_CHIEFS_CANDIDATES[0].leaning,
    },
    defconLevel: 4,
    forceReadiness: 81,
    defenseBudgetBillions: 850,
    cyberPosture: 'Elevated',
    intelThreatLevel: 'Elevated',
    intelSummary:
      'Congressional deficit-cap negotiations force Pentagon acquisition reviews while overseas allies debate burden-sharing commitments.',
    operations: [
      {
        id: 'op-nato-burden',
        name: 'Allied Burden-Sharing Watch',
        region: 'North Atlantic & Europe',
        posture: 'Deterrence',
        personnelCount: '9,400 rotational troops',
        statusNote:
          'Maintaining baseline deterrence while shifting logistics overhead to European allies.',
      },
      {
        id: 'op-maritime-economy',
        name: 'Operation Lean Sea Shield',
        region: 'Middle East & Red Sea',
        posture: 'Standby',
        personnelCount: '5,800 naval surface crew',
        statusNote:
          'Automated unmanned patrol vessels augmenting destroyer escorts to curb fuel burn.',
      },
    ],
  },
};

export const INSTITUTIONS_PRESET: Record<string, InstitutionalState> = {
  fragile_boom: {
    fedFundsRate: 4.5,
    fedStance: 'Neutral',
    fedChairNote:
      'Fed Chair signals patience on rate cuts until fiscal deficit trajectory and services inflation cool.',
    judiciaryClimate: 'Split',
    pendingCourtNote:
      'Supreme Court docket includes a pivotal challenge to executive regulatory authority over AI infrastructure.',
  },
  stagflation_gridlock: {
    fedFundsRate: 5.5,
    fedStance: 'Hawkish',
    fedChairNote:
      'Central bank warns further 25bp tightening remains on the table if energy and port shocks lift expectations.',
    judiciaryClimate: 'Hostile',
    pendingCourtNote:
      'Fifth Circuit issued preliminary injunctions halting prior administration emergency tariff waivers.',
  },
  crisis_confidence: {
    fedFundsRate: 3.75,
    fedStance: 'Accommodative',
    fedChairNote:
      'Federal Reserve opened temporary discount-window liquidity swaps to stabilize regional commercial lenders.',
    judiciaryClimate: 'Split',
    pendingCourtNote:
      'Federal courts reviewing emergency federal preemption over interstate high-voltage transmission siting.',
  },
  ai_age: {
    fedFundsRate: 4.25,
    fedStance: 'Neutral',
    fedChairNote:
      'Fed economists debate whether surging AI productivity offsets white-collar layoffs and rising industrial electricity costs.',
    judiciaryClimate: 'Split',
    pendingCourtNote:
      'Supreme Court prepares landmark arguments on federal preemption of state AI liability statutes and training-data copyright.',
  },
  multipolar_cold_war: {
    fedFundsRate: 4.75,
    fedStance: 'Hawkish',
    fedChairNote:
      'Central bank flags defense-industrial capacity bottlenecks and shipping insurance premiums as persistent upside inflation risks.',
    judiciaryClimate: 'Favorable',
    pendingCourtNote:
      'Appeals courts uphold broad presidential export-control and sanctions enforcement powers under IEEPA.',
  },
  constitutional_gridlock: {
    fedFundsRate: 4.5,
    fedStance: 'Neutral',
    fedChairNote:
      'Fed urges Congress to avert shutdowns and debt-ceiling brinkmanship that threaten short-term Treasury bill liquidity.',
    judiciaryClimate: 'Hostile',
    pendingCourtNote:
      'Supreme Court enforces strict major-questions scrutiny on unilateral White House agency directives.',
  },
  clean_grid_transition: {
    fedFundsRate: 4.0,
    fedStance: 'Accommodative',
    fedChairNote:
      'Fed monitors surging capital expenditure in domestic battery plants, grid transformers, and clean power corridors.',
    judiciaryClimate: 'Split',
    pendingCourtNote:
      'Federal appellate panels weigh NEPA streamlining rules for interstate transmission and critical-mineral mines.',
  },
  sovereign_debt_reckoning: {
    fedFundsRate: 5.25,
    fedStance: 'Hawkish',
    fedChairNote:
      'Fed Chair refuses to monetize Treasury deficits, insisting Capitol Hill adopt a credible multi-year fiscal stabilization path.',
    judiciaryClimate: 'Split',
    pendingCourtNote:
      'Constitutional challenge pending over executive impoundment authority and automatic sequestration caps.',
  },
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'fragile_boom',
    title: 'The Fragile Boom',
    subtitle: 'High growth meets sovereign debt and Indo-Pacific friction',
    eraLabel: 'Year 2026 · Expansion Under Strain',
    climateCategory: 'tech_economy',
    description:
      'GDP is expanding at 2.7%, yet housing affordability, AI labor displacement, and rising Treasury yields threaten to fracture your narrow legislative majority.',
    imageUrl: '/src/assets/images/scenario_boom_1795129501987.jpg',
    initialMetrics: {
      approval: 51,
      congressSupport: 52,
      gdpGrowth: 2.7,
      inflation: 3.1,
      unemployment: 4.1,
      diplomaticStanding: 62,
      nationalDebtTrillions: 36.2,
      houseSeats: 222,
      senateSeats: 51,
    },
    initialBlocs: {
      workingClass: 46,
      suburbanModerates: 53,
      techFinance: 58,
      seniors: 50,
      youngVoters: 49,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.fragile_boom,
    initialInstitutions: INSTITUTIONS_PRESET.fragile_boom,
    initialNews: [
      {
        id: 'n-boom-1',
        month: 1,
        outlet: 'Financial Ledger',
        category: 'economy',
        headline: '10-Year Treasury Yield Touches 4.85% Ahead of Inaugural Budget Memo',
        summary: 'Bond desks urge clear deficit offsets as Congress prepares spring appropriations.',
        tone: 'critical',
      },
      {
        id: 'n-boom-2',
        month: 1,
        outlet: 'Pacific Wire',
        category: 'defense',
        headline: 'Semiconductor Cargo Delays Ripple Through West Coast Ports',
        summary: 'Allied shipping insurers cite heightened naval patrols near Taiwan Strait corridors.',
        tone: 'neutral',
      },
      {
        id: 'n-boom-3',
        month: 1,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: 'Mayors Coalition Demands Emergency Starter-Home Permitting Bill',
        summary: 'Bipartisan municipal leaders press the White House for immediate construction grants.',
        tone: 'neutral',
      },
      {
        id: 'n-boom-4',
        month: 1,
        outlet: 'Tech & Labor Daily',
        category: 'domestic',
        headline: 'Major Cloud Employers Trim 45,000 Roles Amid AI Automation Wave',
        summary: 'White-collar displacement sparks fresh hearings on workforce retraining credits.',
        tone: 'critical',
      },
    ],
    initialBriefing: {
      title: 'Inaugural Week: Yields Surge as Maritime Corridor Tightens',
      situationSummary:
        'Ten-year Treasury yields spiked 22 basis points overnight after major credit desks warned that unfunded campaign pledges could widen the fiscal deficit. Simultaneously, naval patrols in the South China Sea have delayed semiconductor shipments bound for West Coast ports.',
      domesticIssue:
        'A coalition of mid-sized city mayors is demanding emergency federal matching funds for transit and starter-home construction before spring.',
      economicIssue:
        'Big Tech firms announced 45,000 automated white-collar reductions this quarter while small manufacturers struggle to borrow at 7.4% prime rates.',
      foreignIssue:
        'Allied ambassadors in Tokyo and Manila are requesting an immediate joint maritime escort commitment within 14 days.',
      urgentDilemma:
        'Do you reassure bond markets with spending discipline, subsidize domestic housing and workers, or project naval deterrence abroad?',
      suggestedDirectives: [
        {
          role: 'Treasury Secretary',
          title: 'Credible Deficit & Permitting Compact',
          policyDraft:
            'Direct OMB to freeze discretionary agency expansion for 12 months while sending Congress a bipartisan fast-track permitting bill for grid and housing construction.',
          speechDraft:
            'America can grow without borrowing against its grandchildren. Tonight we pair disciplined fiscal stewardship with building the homes and energy capacity our workers need.',
        },
        {
          role: 'National Security Advisor',
          title: 'Allied Maritime Escort & Chip Reserve',
          policyDraft:
            'Authorize joint freedom-of-navigation escorts with Pacific allies and invoke Defense Production Act incentives for domestic semiconductor packaging.',
          speechDraft:
            'Open sea lanes are the lifeblood of every American paycheck. Together with our allies, we will ensure supply chains remain free from coercion.',
        },
        {
          role: 'Chief of Staff',
          title: 'AI Transition & Housing Credit Act',
          policyDraft:
            'Propose a targeted corporate automation retraining levy paired with a 25-billion-dollar municipal housing construction block grant.',
          speechDraft:
            'Technological progress must lift working families, not leave communities behind. Every worker displaced by automation deserves a bridge to the next frontier.',
        },
      ],
    },
  },
  {
    id: 'stagflation_gridlock',
    title: 'Stagflation & Gridlock',
    subtitle: 'Energy shock, 6.2% inflation, and a deadlocked Congress',
    eraLabel: 'Supply Crunch · Divided Capitol',
    climateCategory: 'tech_economy',
    description:
      'You take the oath amidst port strikes, elevated fuel costs, and 6.2% annual inflation. An opposition House stands ready to block sweeping spending bills.',
    imageUrl: '/src/assets/images/scenario_stagflation_1795129500881.jpg',
    initialMetrics: {
      approval: 44,
      congressSupport: 39,
      gdpGrowth: 0.9,
      inflation: 6.2,
      unemployment: 5.4,
      diplomaticStanding: 50,
      nationalDebtTrillions: 37.8,
      houseSeats: 204,
      senateSeats: 49,
    },
    initialBlocs: {
      workingClass: 41,
      suburbanModerates: 43,
      techFinance: 42,
      seniors: 47,
      youngVoters: 45,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.stagflation_gridlock,
    initialInstitutions: INSTITUTIONS_PRESET.stagflation_gridlock,
    initialNews: [
      {
        id: 'n-stag-1',
        month: 1,
        outlet: 'Commerce Wire',
        category: 'economy',
        headline: 'Fourteen Atlantic & Gulf Terminals Idle as Dockworker Strike Begins',
        summary: 'Retailers warn of fresh produce and industrial parts bottlenecks within ten days.',
        tone: 'critical',
      },
      {
        id: 'n-stag-2',
        month: 1,
        outlet: 'Energy Markets Today',
        category: 'economy',
        headline: 'Diesel Jumps 48 Cents as European Buyers Bid Up LNG Cargoes',
        summary: 'Freight carriers pass fuel surcharges directly to grocery and manufacturing shippers.',
        tone: 'critical',
      },
      {
        id: 'n-stag-3',
        month: 1,
        outlet: 'Capitol Chronicle',
        category: 'politics',
        headline: 'House Speaker Rules Out Any Deficit-Financed Relief Package',
        summary: 'Divided Congress sets high hurdle for executive compromises on inflation.',
        tone: 'neutral',
      },
      {
        id: 'n-stag-4',
        month: 1,
        outlet: 'Defense Monitor',
        category: 'defense',
        headline: 'Tanker Escort Destroyers Rotate Into Red Sea Shipping Lane',
        summary: 'Pentagon confirms steady posture as maritime insurance premiums climb.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'Day One Crisis: East Coast Port Walkout & Diesel Spike',
      situationSummary:
        'Dockworkers at fourteen Atlantic and Gulf terminals walked off the job at midnight over automated crane rules, halting 40% of containerized imports. Retail diesel jumped 48 cents a gallon this week, threatening to push headline CPI above 6.5%.',
      domesticIssue:
        'Grocery chains warn of regional shortages within ten days unless perishable cargo clears customs immediately.',
      economicIssue:
        'The Federal Reserve Chair signaled privately that persistent inflation may force another rate hike even as GDP cools toward stagnation.',
      foreignIssue:
        'European energy ministers are competing aggressively for U.S. liquefied natural gas cargoes ahead of an unseasonably cold quarter.',
      urgentDilemma:
        'Invoking Taft-Hartley risks alienating union households permanently, while letting the strike linger deepens stagflation.',
      suggestedDirectives: [
        {
          role: 'Secretary of Labor',
          title: 'Presidential Mediation Board & 60-Day Cooling Period',
          policyDraft:
            'Appoint a high-level federal mediation panel, broker a conditional 60-day terminal reopening with guaranteed wage floors, and freeze automated crane rollouts during talks.',
          speechDraft:
            'We respect the dignity of dockworkers and the urgency of every family at the checkout counter. Both sides are coming to the table today so goods move and fair wages win.',
        },
        {
          role: 'Energy Secretary',
          title: 'Strategic Reserve Swap & Freight Corridors',
          policyDraft:
            'Release 30 million barrels from strategic reserves paired with temporary rail weight waivers and expedited domestic LNG export permits for allies.',
          speechDraft:
            'Energy costs ripple into every loaf of bread and every factory floor. We are unlocking immediate supply today to break the back of price spikes.',
        },
        {
          role: 'Chief Economic Advisor',
          title: 'Tariff Suspension & Competition Sweep',
          policyDraft:
            'Issue an executive suspension of tariffs on essential industrial inputs and direct the FTC to investigate maritime shipping surcharges.',
          speechDraft:
            'Hidden supply-chain markups are taxing American households. Today we cut input costs at the border and hold price-gougers accountable.',
        },
      ],
    },
  },
  {
    id: 'crisis_confidence',
    title: 'Crisis of Confidence',
    subtitle: 'Post-downturn recovery, aging infrastructure, and civic fatigue',
    eraLabel: 'National Renewal · Institutional Test',
    climateCategory: 'geopolitics_crisis',
    description:
      'Trust in public institutions sits at historic lows following a regional banking scare and severe winter grid failures across three states.',
    imageUrl: '/src/assets/images/scenario_confidence_1795129500889.jpg',
    initialMetrics: {
      approval: 46,
      congressSupport: 47,
      gdpGrowth: 1.4,
      inflation: 2.6,
      unemployment: 5.9,
      diplomaticStanding: 54,
      nationalDebtTrillions: 35.9,
      houseSeats: 219,
      senateSeats: 50,
    },
    initialBlocs: {
      workingClass: 45,
      suburbanModerates: 46,
      techFinance: 48,
      seniors: 49,
      youngVoters: 41,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.crisis_confidence,
    initialInstitutions: INSTITUTIONS_PRESET.crisis_confidence,
    initialNews: [
      {
        id: 'n-conf-1',
        month: 1,
        outlet: 'Midwest Herald',
        category: 'domestic',
        headline: '1.8 Million Without Power After Great Lakes Interconnect Failure',
        summary: 'Governors request immediate Army Corps microgrids and federal emergency grants.',
        tone: 'critical',
      },
      {
        id: 'n-conf-2',
        month: 1,
        outlet: 'Market Desk',
        category: 'economy',
        headline: 'Regional Bank Index Drops 11% Following Commercial Loan Losses',
        summary: 'Treasury and FDIC officials weigh bridge guarantees for small-business payrolls.',
        tone: 'critical',
      },
      {
        id: 'n-conf-3',
        month: 1,
        outlet: 'Diplomatic Post',
        category: 'foreign',
        headline: 'NATO Capitals Seek Reassurance on U.S. Defense Budget Continuity',
        summary: 'Allies watch whether domestic emergency spending squeezes overseas commitments.',
        tone: 'neutral',
      },
      {
        id: 'n-conf-4',
        month: 1,
        outlet: 'Cyber Security Wire',
        category: 'defense',
        headline: 'Cyber Command Elevates Shield Over Regional Settlement Networks',
        summary: 'Officials report probing attempts targeting municipal utilities and lenders.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'Emergency Dossier: Midwest Grid Collapse & Regional Bank Jitters',
      situationSummary:
        'A severe ice storm knocked out three high-voltage interconnects across the Great Lakes, leaving 1.8 million residents without heat. Meanwhile, two mid-sized regional lenders requested emergency liquidity windows after commercial real estate defaults accelerated.',
      domesticIssue:
        'Governors in Ohio, Michigan, and Pennsylvania are demanding immediate federal disaster declarations and Army Corps microgrid deployment.',
      economicIssue:
        'Regional bank equities dropped 11% before the bell as depositors questioned uninsured commercial balances.',
      foreignIssue:
        'NATO partners are watching closely to see whether domestic stabilization forces Washington to scale back European defense commitments.',
      urgentDilemma:
        'Can you stabilize households and regional banks decisively without sparking a populist backlash against perceived bailouts?',
      suggestedDirectives: [
        {
          role: 'Treasury Secretary',
          title: 'FDIC Bridge Guarantee & Executive Clawback Rule',
          policyDraft:
            'Establish an industry-funded FDIC liquidity facility for small-business payroll accounts while mandating full executive bonus clawbacks at any bank tapping emergency windows.',
          speechDraft:
            'Main Street payrolls will never be collateral damage for reckless lending. Depositors are protected, and executives who failed will pay the price—not taxpayers.',
        },
        {
          role: 'Energy & Infrastructure Lead',
          title: 'Federal Grid Modernization & Corps Deployment',
          policyDraft:
            'Deploy Army Corps mobile generators to affected counties and launch a fast-tracked interstate high-voltage transmission modernization act.',
          speechDraft:
            'No American family should sit in the dark in the twenty-first century. Help is arriving tonight, and tomorrow we rebuild a grid worthy of this nation.',
        },
        {
          role: 'White House Counsel',
          title: 'Open Ledger Governance Mandate',
          policyDraft:
            'Publish real-time public tracking for every emergency disaster dollar and appoint an independent Inspector General to oversee bank resolution.',
          speechDraft:
            'Trust is earned in daylight. Every dollar spent under this emergency order will be visible to every citizen online.',
        },
      ],
    },
  },
  {
    id: 'ai_age',
    title: 'The AI Age',
    subtitle: 'Frontier compute race, gigawatt grid strain, and white-collar disruption',
    eraLabel: 'Frontier Compute · Workforce & Grid Shift',
    climateCategory: 'tech_economy',
    description:
      'Autonomous software agents drive 3.8% GDP growth while displacing 180,000 service roles, pushing regional power grids to reserve limits, and igniting a global compute treaty race.',
    imageUrl: '/src/assets/images/scenario_ai_age_1795457951861.jpg',
    initialMetrics: {
      approval: 49,
      congressSupport: 50,
      gdpGrowth: 3.8,
      inflation: 2.8,
      unemployment: 4.9,
      diplomaticStanding: 58,
      nationalDebtTrillions: 37.1,
      houseSeats: 220,
      senateSeats: 51,
    },
    initialBlocs: {
      workingClass: 42,
      suburbanModerates: 48,
      techFinance: 68,
      seniors: 46,
      youngVoters: 44,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.ai_age,
    initialInstitutions: INSTITUTIONS_PRESET.ai_age,
    initialNews: [
      {
        id: 'n-ai-1',
        month: 1,
        outlet: 'Tech & Labor Daily',
        category: 'economy',
        headline: 'Enterprise AI Agents Cut 180,000 Back-Office & Logistics Roles in 90 Days',
        summary: 'Output per worker climbs sharply even as college-town and suburban layoff filings accelerate.',
        tone: 'critical',
      },
      {
        id: 'n-ai-2',
        month: 1,
        outlet: 'Grid & Energy Monitor',
        category: 'domestic',
        headline: 'Mid-Atlantic & Texas Utilities Issue Reserve Alerts Over 10-GW Data Centers',
        summary: 'Residential electricity bills tick upward as hyperscalers bid up transformer and natural gas capacity.',
        tone: 'critical',
      },
      {
        id: 'n-ai-3',
        month: 1,
        outlet: 'Pacific Defense Wire',
        category: 'defense',
        headline: 'Allies Seek Unified Frontier Chip Export & Model-Weight Security Pact',
        summary: 'Tokyo and Amsterdam await White House rules on next-generation lithography and autonomous cyber tools.',
        tone: 'neutral',
      },
      {
        id: 'n-ai-4',
        month: 1,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: 'Bipartisan Senate Panel Unveils Competing AI Safety & Preemption Bills',
        summary: 'Governors demand clarity as 28 conflicting state AI laws threaten to fragment interstate commerce.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'Inaugural Dossier: The AI Compute Boom Meets Grid & Labor Shock',
      situationSummary:
        'Surging capital investment in frontier AI clusters pushed annualized GDP growth to 3.8%, yet major corporate agent deployments eliminated 180,000 administrative and customer-support jobs this quarter. Meanwhile, regional grid operators warn that hyperscale training campuses are exhausting reserve power margins ahead of summer.',
      domesticIssue:
        'Twenty-eight states have enacted conflicting AI liability and licensing rules, prompting tech leaders to demand federal preemption while unions seek mandatory human-in-the-loop protections.',
      economicIssue:
        'Household electricity bills rose 9% near data-center corridors even as Wall Street equities hit record highs on autonomous productivity forecasts.',
      foreignIssue:
        'Intelligence agencies report foreign adversaries attempting covert diversion of frontier AI chips and automated cyber-vulnerability discovery against U.S. banks.',
      urgentDilemma:
        'Do you accelerate American AI compute and nuclear-grid permitting to outpace rivals, impose guardrails and worker-transition levies to protect displaced households, or forge a global frontier safety compact?',
      suggestedDirectives: [
        {
          role: 'Chief of Staff & Labor Secretary',
          title: 'AI Workforce Transition & Portable Skills Compact',
          policyDraft:
            'Establish a 30-billion-dollar AI Workforce Retraining & Wage-Insurance Fund financed by a narrow tax on massive data-center power leases, paired with a National AI Safety Institute evaluation standard.',
          speechDraft:
            'Artificial intelligence should multiply the dignity of American workers, not erase their livelihoods overnight. Tonight we pair frontier innovation with real security for every displaced household.',
        },
        {
          role: 'Energy & Tech Policy Lead',
          title: 'Project Gigawatt: Nuclear SMR & Grid Fast-Track',
          policyDraft:
            'Invoke federal grid-reliability authority to fast-track small modular nuclear reactors, industrial battery storage, and dedicated data-center co-location transmission lines that shield residential utility rates.',
          speechDraft:
            'To win the AI century, America must build the power to run it—clean, abundant baseload electricity that never forces families to subsidize corporate server farms.',
        },
        {
          role: 'National Security Advisor',
          title: 'Compute Security & Allied Lithography Accord',
          policyDraft:
            'Tighten end-use verification on advanced AI accelerators, mandate Defense Production Act cyber hardening for frontier model weights, and convene an Allied Compute Security Summit with Japan and the EU.',
          speechDraft:
            'Frontier compute is the defining strategic asset of our era. Alongside our allies, we will safeguard our most capable systems while keeping democratic innovation in the lead.',
        },
      ],
    },
  },
  {
    id: 'multipolar_cold_war',
    title: 'Multipolar Cold War',
    subtitle: 'Allied deterrence, proxy maritime flashpoints, and munitions surge',
    eraLabel: 'Great Power Rivalry · DEFCON 3 Alert',
    climateCategory: 'geopolitics_crisis',
    description:
      'Simultaneous naval brinkmanship in the Western Pacific and missile probes along NATO’s Eastern Flank demand rapid defense-industrial mobilization without triggering global war.',
    imageUrl: '/src/assets/images/scenario_cold_war_1795457953891.jpg',
    initialMetrics: {
      approval: 52,
      congressSupport: 56,
      gdpGrowth: 2.2,
      inflation: 3.4,
      unemployment: 4.0,
      diplomaticStanding: 53,
      nationalDebtTrillions: 37.4,
      houseSeats: 224,
      senateSeats: 52,
    },
    initialBlocs: {
      workingClass: 50,
      suburbanModerates: 51,
      techFinance: 52,
      seniors: 57,
      youngVoters: 43,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.multipolar_cold_war,
    initialInstitutions: INSTITUTIONS_PRESET.multipolar_cold_war,
    initialNews: [
      {
        id: 'n-cold-1',
        month: 1,
        outlet: 'Defense Monitor',
        category: 'defense',
        headline: 'Dual Carrier Strike Groups Deploy as Pacific & Baltic Exercises Overlap',
        summary: 'Pentagon elevates readiness to DEFCON 3 while urging allies to expand air-defense stockpiles.',
        tone: 'critical',
      },
      {
        id: 'n-cold-2',
        month: 1,
        outlet: 'Global Diplomatic Wire',
        category: 'foreign',
        headline: 'NATO & Indo-Pacific Envoys Seek Mutual Security & Munitions Guarantees',
        summary: 'Allied capitals press Washington for multi-year industrial co-production commitments.',
        tone: 'neutral',
      },
      {
        id: 'n-cold-3',
        month: 1,
        outlet: 'Industrial Ledger',
        category: 'economy',
        headline: 'Defense Shipyards & Aerospace Suppliers Report Acute Skilled-Trades Backlog',
        summary: 'Submarine and interceptor production schedules stretch unless workforce training scales fast.',
        tone: 'neutral',
      },
      {
        id: 'n-cold-4',
        month: 1,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: 'Armed Services Chairmen Rally Bipartisan Coalition Behind Deterrence Package',
        summary: 'Fiscal hawks insist any supplemental defense surge include domestic efficiency offsets.',
        tone: 'positive',
      },
    ],
    initialBriefing: {
      title: 'Strategic Alert: Coordinated Maritime & Eastern Flank Probes',
      situationSummary:
        'Pentagon planners elevated alert status to DEFCON 3 after rival naval flotillas staged simultaneous blockade drills near Luzon while electronic warfare units jammed Baltic air-traffic transponders. Defense shipyards and missile factories warn that existing interceptor stockpiles cannot sustain two theaters without surge contracts.',
      domesticIssue:
        'Shipyard states in Virginia, Wisconsin, and Maine request emergency vocational grants to hire 40,000 welders and aerospace technicians.',
      economicIssue:
        'War-risk shipping insurance premiums lifted imported component costs by 3%, nudging defense and energy inflation higher.',
      foreignIssue:
        'Allied leaders in Warsaw, Tokyo, and Manila are requesting immediate U.S. theater unit deployments and crisis-hotline diplomacy.',
      urgentDilemma:
        'Do you authorize an industrial-scale defense procurement surge, prioritize quiet crisis-deescalation diplomacy, or press allies to shoulder greater frontline spending?',
      suggestedDirectives: [
        {
          role: 'Secretary of Defense',
          title: 'Multi-Year Munitions & Shipyard Surge Act',
          policyDraft:
            'Sign multi-year Defense Production Act contracts for air-defense interceptors and Virginia-class submarine components paired with a national skilled-trades apprenticeship expansion.',
          speechDraft:
            'Weakness invites aggression; credible American industrial strength keeps the peace. Today we rebuild the arsenal of democracy and put thousands of skilled tradespeople to work.',
        },
        {
          role: 'Secretary of State',
          title: 'Allied Deterrence & Crisis-Hotline Compact',
          policyDraft:
            'Convene an urgent joint NATO–Indo-Pacific Ministerial to lock in allied defense-spending floors while opening direct military-to-military deconfliction hotlines with Beijing and Moscow.',
          speechDraft:
            'Strength and dialogue go hand in hand. We stand shoulder to shoulder with our allies, and we keep crisis channels open so miscalculation never sparks catastrophe.',
        },
        {
          role: 'Treasury Secretary',
          title: 'Strategic Mineral & Sanction Enforcement Shield',
          policyDraft:
            'Expand secondary financial sanctions on dual-use weapons smugglers while funding allied critical-mineral refining hubs outside adversary control.',
          speechDraft:
            'Those who bankroll aggression will face decisive financial isolation—and America will never again rely on adversaries for the metals that build our defense.',
        },
      ],
    },
  },
  {
    id: 'constitutional_gridlock',
    title: 'Populist Surge & Gridlock',
    subtitle: 'Razor-thin Capitol margins, shutdown brinkmanship, and anti-establishment fury',
    eraLabel: 'Divided Capitol · Populist Realignment',
    climateCategory: 'governance_fiscal',
    description:
      'Both chambers are deadlocked in procedural warfare, federal funding expires in 14 days, and populist insurgencies threaten every traditional legislative compromise.',
    imageUrl: '/src/assets/images/scenario_polarization_1795457953352.jpg',
    initialMetrics: {
      approval: 43,
      congressSupport: 34,
      gdpGrowth: 2.0,
      inflation: 3.5,
      unemployment: 4.3,
      diplomaticStanding: 55,
      nationalDebtTrillions: 36.9,
      houseSeats: 214,
      senateSeats: 48,
    },
    initialBlocs: {
      workingClass: 49,
      suburbanModerates: 41,
      techFinance: 45,
      seniors: 46,
      youngVoters: 42,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.constitutional_gridlock,
    initialInstitutions: INSTITUTIONS_PRESET.constitutional_gridlock,
    initialNews: [
      {
        id: 'n-grid-1',
        month: 1,
        outlet: 'Capitol Chronicle',
        category: 'politics',
        headline: 'House Majority Faction Rejects Leadership Stopgap With 14 Days to Shutdown',
        summary: 'Procedural rebellions leave Speaker unable to bring bipartisan appropriations to the floor.',
        tone: 'critical',
      },
      {
        id: 'n-grid-2',
        month: 1,
        outlet: 'Heartland Tribune',
        category: 'domestic',
        headline: 'Populist Rallies Demand Congressional Term Limits & Corporate Lobbying Ban',
        summary: 'Voters across industrial and rural districts voice record frustration with Washington paralysis.',
        tone: 'neutral',
      },
      {
        id: 'n-grid-3',
        month: 1,
        outlet: 'Treasury Markets Desk',
        category: 'economy',
        headline: 'Rating Agencies Flag Governance Friction Ahead of Appropriations Deadline',
        summary: 'Short-term T-bill yields widen slightly as contractors brace for delayed federal disbursements.',
        tone: 'critical',
      },
      {
        id: 'n-grid-4',
        month: 1,
        outlet: 'National Civic Poll',
        category: 'politics',
        headline: '68% of Independents Back Anti-Corruption & Permitting Compromise',
        summary: 'Suburban moderates look to the Oval Office to break Capitol Hill trench warfare.',
        tone: 'positive',
      },
    ],
    initialBriefing: {
      title: 'Capitol Deadlock: 14 Days to Shutdown Amid Populist Realignment',
      situationSummary:
        'An opposition-controlled House and a razor-thin Senate have stalled all twelve annual appropriations bills, putting federal agencies 14 days from a partial shutdown. Outside Washington, surging populist movements are demanding sweeping anti-corruption reforms, corporate accountability, and immediate relief from everyday costs.',
      domesticIssue:
        'Two million federal civilian workers, TSA officers, and small-business federal contractors face missed paychecks if no continuing resolution passes by month’s end.',
      economicIssue:
        'Treasury desks warn that prolonged shutdown brinkmanship could trim 0.4% off quarterly GDP and spook consumer sentiment.',
      foreignIssue:
        'Foreign capitals wonder whether domestic political paralysis will delay routine security assistance and trade accords.',
      urgentDilemma:
        'Do you fight fire with populist executive orders to bypass Congress, broker a cross-aisle reform package with moderate caucuses, or force a high-stakes public showdown over the shutdown?',
      suggestedDirectives: [
        {
          role: 'Chief of Staff',
          title: 'Cross-Aisle Budget & Anti-Corruption Grand Bargain',
          policyDraft:
            'Invite House and Senate moderates to Camp David to pass a clean 90-day funding bill paired with a bipartisan stock-trading ban for lawmakers and agency waste audits.',
          speechDraft:
            'Americans are tired of politicians holding their paychecks hostage for cable-news clips. Keep the government open, ban congressional stock trading, and earn back the public trust.',
        },
        {
          role: 'White House Counsel & DOJ',
          title: 'Executive Anti-Monopoly & Junk-Fee Crackdown',
          policyDraft:
            'Deploy existing statutory antitrust and consumer-protection authorities to break up hidden banking, ticketing, and grocery supply markups without waiting on stalled House committees.',
          speechDraft:
            'If gridlocked committees won’t protect working families from hidden corporate fees, this Oval Office will use every lawful tool on the books to fight for your wallet.',
        },
        {
          role: 'Treasury & OMB',
          title: 'Essential Operations Shield & Taxpayer Ledger',
          policyDraft:
            'Publish contingency directives protecting military pay, veterans clinics, and air-traffic control while auditing $40B in unspent legacy agency accounts for immediate rescission.',
          speechDraft:
            'We will protect every soldier, veteran, and traveler while cutting every dime of idle bureaucracy in Washington.',
        },
      ],
    },
  },
  {
    id: 'clean_grid_transition',
    title: 'Clean-Grid Industrial Race',
    subtitle: 'Transmission bottlenecks, critical minerals, and climate resilience',
    eraLabel: 'Energy Transition · Permitting & Minerals',
    climateCategory: 'tech_economy',
    description:
      'Billions in domestic battery and clean-tech factories sit waiting for power hookups as NEPA permitting lawsuits, rare-earth export bans, and regional climate disasters collide.',
    imageUrl: '/src/assets/images/scenario_clean_grid_1795457953304.jpg',
    initialMetrics: {
      approval: 50,
      congressSupport: 49,
      gdpGrowth: 2.9,
      inflation: 3.0,
      unemployment: 3.9,
      diplomaticStanding: 64,
      nationalDebtTrillions: 36.5,
      houseSeats: 219,
      senateSeats: 51,
    },
    initialBlocs: {
      workingClass: 48,
      suburbanModerates: 52,
      techFinance: 55,
      seniors: 47,
      youngVoters: 59,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.clean_grid_transition,
    initialInstitutions: INSTITUTIONS_PRESET.clean_grid_transition,
    initialNews: [
      {
        id: 'n-grid-t1',
        month: 1,
        outlet: 'Energy & Industry Wire',
        category: 'economy',
        headline: '1,400 Gigawatts of Power & Factory Projects Stuck in Grid Interconnection Queue',
        summary: 'Manufacturers warn domestic battery and semiconductor plants need high-voltage lines within 18 months.',
        tone: 'critical',
      },
      {
        id: 'n-grid-t2',
        month: 1,
        outlet: 'Global Commodities Post',
        category: 'foreign',
        headline: 'Rival Producer Tightens Export Quotas on Processed Gallium & Battery Graphite',
        summary: 'Allied trade ministers push for joint mineral-refining agreements across North America and Australia.',
        tone: 'critical',
      },
      {
        id: 'n-grid-t3',
        month: 1,
        outlet: 'Western & Gulf Dispatch',
        category: 'domestic',
        headline: 'Homeowners Insurers Exit Coastal & Wildfire Counties After Record Storm Losses',
        summary: 'Governors urge federal disaster-mitigation grants and grid undergrounding funds.',
        tone: 'neutral',
      },
      {
        id: 'n-grid-t4',
        month: 1,
        outlet: 'Union & Jobs Bulletin',
        category: 'economy',
        headline: 'Midwest & Sunbelt Clean-Manufacturing Hiring Tops 85,000 New Roles',
        summary: 'Apprenticeship programs report surging demand for high-voltage linemen and turbine engineers.',
        tone: 'positive',
      },
    ],
    initialBriefing: {
      title: 'Industrial Transition: Clearing the Grid & Critical-Mineral Bottleneck',
      situationSummary:
        'Domestic clean-energy and battery factories have sparked a 2.9% manufacturing expansion, yet 1,400 gigawatts of new power generation remain trapped in five-year permitting queues. Simultaneously, foreign export quotas on processed lithium, graphite, and rare-earth magnets threaten factory assembly lines just as insurers pull back from high-risk coastal and wildfire states.',
      domesticIssue:
        'Property insurance premiums spiked 28% in storm-hit states, prompting governors to demand federal grid-hardening and flood-mitigation investments.',
      economicIssue:
        'Transformer shortages and delayed transmission lines are keeping industrial electricity prices elevated for small manufacturers.',
      foreignIssue:
        'Canada, Australia, and EU partners are ready to sign a Critical Minerals Supply Compact if Washington streamlines domestic permitting.',
      urgentDilemma:
        'Can you bridge environmental groups and energy-producing states to pass bipartisan permitting reform while securing critical mineral supply chains abroad?',
      suggestedDirectives: [
        {
          role: 'Energy & Interior Secretaries',
          title: 'Bipartisan Clean-Grid & All-of-the-Above Permitting Act',
          policyDraft:
            'Send Congress a permitting compromise establishing a 24-month review clock for interstate transmission lines, geothermal, and battery-mineral mines alongside fast-tracked clean baseload interconnects.',
          speechDraft:
            'You cannot build the clean economy of tomorrow on the permitting bottlenecks of yesterday. Let’s build the wires, the mines, and the factories right here in America.',
        },
        {
          role: 'Secretary of State & USTR',
          title: 'Allied Critical Minerals Buyers Club',
          policyDraft:
            'Launch a joint critical-minerals stockpiling and refining pact with Canada, Australia, and Japan backed by Export-Import Bank loan guarantees.',
          speechDraft:
            'Together with trusted allies, we are breaking adversary chokeholds over the minerals that power modern industry and national defense.',
        },
        {
          role: 'FEMA & Treasury',
          title: 'Community Grid-Hardening & Insurance Resilience Fund',
          policyDraft:
            'Deploy Army Corps resilience grants to underground vulnerable power lines and match state home-fortification tax credits to stabilize homeowner insurance markets.',
          speechDraft:
            'Investing a dollar in stronger roofs and underground power lines saves ten dollars in disaster recovery—and keeps insurance affordable for working families.',
        },
      ],
    },
  },
  {
    id: 'sovereign_debt_reckoning',
    title: 'Sovereign Debt Reckoning',
    subtitle: 'Treasury auction stress, $39.4T debt, and entitlement cliff',
    eraLabel: 'Bond Vigilantes · Fiscal Cliff',
    climateCategory: 'governance_fiscal',
    description:
      'Annual federal interest payments now surpass defense spending after a weak 30-year Treasury auction, forcing immediate choices between entitlement solvency, tax reform, and spending caps.',
    imageUrl: '/src/assets/images/scenario_debt_reckoning_1795457954693.jpg',
    initialMetrics: {
      approval: 45,
      congressSupport: 42,
      gdpGrowth: 1.6,
      inflation: 3.3,
      unemployment: 4.5,
      diplomaticStanding: 56,
      nationalDebtTrillions: 39.4,
      houseSeats: 216,
      senateSeats: 49,
    },
    initialBlocs: {
      workingClass: 43,
      suburbanModerates: 47,
      techFinance: 44,
      seniors: 41,
      youngVoters: 45,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: MILITARY_OPERATIONS_PRESET.sovereign_debt_reckoning,
    initialInstitutions: INSTITUTIONS_PRESET.sovereign_debt_reckoning,
    initialNews: [
      {
        id: 'n-debt-1',
        month: 1,
        outlet: 'Wall Street Bond Wire',
        category: 'economy',
        headline: 'Weak 30-Year Treasury Auction Sends Long-End Borrowing Costs to 5.45%',
        summary: 'Primary dealers warn Washington that $2.3T annual deficits risk crowding out private investment.',
        tone: 'critical',
      },
      {
        id: 'n-debt-2',
        month: 1,
        outlet: 'Senior & Civic Ledger',
        category: 'domestic',
        headline: 'Trustees Warn Medicare & Highway Trust Funds Face Automatic Cuts Within 4 Years',
        summary: 'Senior advocacy groups warn Congress against abrupt benefit reductions for current retirees.',
        tone: 'critical',
      },
      {
        id: 'n-debt-3',
        month: 1,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: 'Bipartisan Fiscal Commission Demands Grand Deficit Bargain Before Debt Ceiling',
        summary: 'Tax-cutters and spending hawks remain deadlocked over revenue vs. discretionary caps.',
        tone: 'neutral',
      },
      {
        id: 'n-debt-4',
        month: 1,
        outlet: 'Financial Times Wire',
        category: 'foreign',
        headline: 'Sovereign Wealth Funds Trim Long-Duration Dollar Holdings Pending Budget Plan',
        summary: 'Allied central bankers watch U.S. fiscal consolidation credibility closely.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'Fiscal Inflection: Treasury Auction Tail & Entitlement Solvency Clock',
      situationSummary:
        'A poorly subscribed 30-year Treasury auction pushed 10- and 30-year yields sharply higher overnight, locking federal net interest outlays above the entire annual defense budget. Trust-fund actuaries simultaneously warned that without congressional action, automatic Medicare and highway formula reductions will trigger within four years.',
      domesticIssue:
        'Retiree groups have mobilized nationwide against any reductions to current Social Security or Medicare benefits, while younger taxpayers fear bearing the full tax burden.',
      economicIssue:
        'Higher Treasury yields immediately lifted 30-year fixed mortgage rates and corporate borrowing spreads, cooling business expansion to 1.6%.',
      foreignIssue:
        'Foreign sovereign buyers scaled back long-bond bids while NATO allies questioned whether U.S. fiscal retrenchment will curtail overseas deployments.',
      urgentDilemma:
        'Will you assemble a politically risky Simpson–Bowles-style grand bargain combining tax loopholes closure with long-term spending discipline, cut discretionary budgets unilaterally, or target pro-growth revenue expansion?',
      suggestedDirectives: [
        {
          role: 'Treasury Secretary & OMB',
          title: 'Bipartisan Fiscal Solvency & Tax-Loophole Compact',
          policyDraft:
            'Propose a 10-year $2.4-trillion deficit-reduction package pairing carried-interest and corporate loophole closures, healthcare drug-pricing savings, and gradual non-defense discretionary caps while shielding current seniors.',
          speechDraft:
            'Fiscal credibility is national security. We will protect every current retiree’s earned benefits, close special-interest tax loopholes, and bring our debt back under control.',
        },
        {
          role: 'Council of Economic Advisers',
          title: 'Pro-Growth Permitting & Treasury Buyback Stabilization',
          policyDraft:
            'Authorize Treasury liquidity buybacks on off-the-run bonds to calm auction volatility while launching pro-growth permitting and workforce-participation reforms to lift nominal GDP.',
          speechDraft:
            'You cannot balance a budget on stagnation. By calming bond markets and unlocking private-sector growth, we grow the economy faster than the debt.',
        },
        {
          role: 'Defense & OMB',
          title: 'Pentagon Audit & Overseas Burden-Sharing Compact',
          policyDraft:
            'Mandate line-by-line Pentagon procurement audits to eliminate $45B in duplicate legacy systems and negotiate 25% higher allied base-support contributions in Europe and East Asia.',
          speechDraft:
            'Every taxpayer dollar—from domestic agencies to Pentagon contractors—must deliver measurable results, and our wealthiest allies must carry their fair share.',
        },
      ],
    },
  },
];
