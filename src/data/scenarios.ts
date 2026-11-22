import {
  BackgroundId,
  CabinetMember,
  CoalitionId,
  InstitutionalState,
  MilitaryCommandState,
  PartyId,
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
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'fragile_boom',
    title: 'The Fragile Boom',
    subtitle: 'High growth meets sovereign debt and Indo-Pacific friction',
    eraLabel: 'Year 2026 · Expansion Under Strain',
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
];
