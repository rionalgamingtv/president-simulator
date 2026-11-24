import {
  CabinetMember,
  CyberDefenseMode,
  DefenseProcurementFocus,
  IntelFocusRegion,
  LegislativeRecordItem,
  MilitaryCommandState,
  NationalMetrics,
  NewsHeadlineItem,
  PresidentProfile,
  PressAccessMode,
  TermHistoryEntry,
  TriadPosture,
  VoterBlocs,
  VpAssignmentId,
} from '../types/game';
import { formatMonthCalendar } from './historicalPresidents';

export interface TownHallVenueOption {
  id: string;
  label: string;
  location: string;
  targetBloc: keyof VoterBlocs;
  targetBlocLabel: string;
  approvalDelta: number;
  congressDelta: number;
  blocDelta: number;
  headline: string;
  summary: string;
}

export const TOWN_HALL_VENUES: TownHallVenueOption[] = [
  {
    id: 'th_rustbelt',
    label: 'Rust Belt Manufacturing Plant',
    location: 'Toledo, Ohio',
    targetBloc: 'workingClass',
    targetBlocLabel: 'Working Class',
    approvalDelta: 1.1,
    congressDelta: 0.4,
    blocDelta: 3,
    headline: 'President Takes Unfiltered Questions From Ohio Factory Workers',
    summary:
      'Direct answers on grocery costs, domestic manufacturing, and overtime wages resonated with blue-collar voters.',
  },
  {
    id: 'th_suburb',
    label: 'Sunbelt Suburban Town Hall',
    location: 'Phoenix, Arizona',
    targetBloc: 'suburbanModerates',
    targetBlocLabel: 'Suburban Moderates',
    approvalDelta: 1.2,
    congressDelta: 0.8,
    blocDelta: 3,
    headline: 'Suburban Moderates Weigh Presidential Pitch on Schools & Mortgage Rates',
    summary:
      'A calm, bipartisan-toned Q&A reassured undecided suburban households watching inflation and governance.',
  },
  {
    id: 'th_campus',
    label: 'Public University Forum',
    location: 'Ann Arbor, Michigan',
    targetBloc: 'youngVoters',
    targetBlocLabel: 'Young Voters',
    approvalDelta: 0.9,
    congressDelta: -0.2,
    blocDelta: 4,
    headline: 'Young Voters Press President on Housing Supply & Climate Jobs in Campus Forum',
    summary:
      'Student and early-career turnout surged after concrete pledges on starter housing and clean-grid apprenticeships.',
  },
  {
    id: 'th_seniors',
    label: 'Retiree Community Roundtable',
    location: 'Sarasota, Florida',
    targetBloc: 'seniors',
    targetBlocLabel: 'Seniors',
    approvalDelta: 1.0,
    congressDelta: 0.6,
    blocDelta: 3,
    headline: 'President Pledges Ironclad Social Security & Medicare Solvency at Senior Forum',
    summary:
      'Retirees responded positively to explicit guarantees shielding entitlement benefits from austerity cuts.',
  },
];

export const PRESS_ACCESS_MODES: {
  id: PressAccessMode;
  label: string;
  description: string;
}[] = [
  {
    id: 'open',
    label: 'Open Access',
    description: 'Frequent unscripted gaggles; boosts press trust & transparency.',
  },
  {
    id: 'rotation',
    label: 'Traditional Rotation',
    description: 'Balanced briefing room rotation across legacy and digital desks.',
  },
  {
    id: 'controlled',
    label: 'Strict Message Control',
    description: 'Tight scripted statements; limits gaffes but draws press pushback.',
  },
];

export const CAMPAIGN_AD_STRATEGIES: {
  id: string;
  label: string;
  description: string;
  momentumDelta: number;
  approvalDelta: number;
  headline: string;
}[] = [
  {
    id: 'ad_econ',
    label: 'Economic Record Blitz',
    description: 'Highlight jobs, factory construction, and household relief.',
    momentumDelta: 3,
    approvalDelta: 0.9,
    headline: 'Re-Election Campaign Launches $35M Economic Record Ad Wave in Swing States',
  },
  {
    id: 'ad_security',
    label: 'Commander-in-Chief Contrast',
    description: 'Emphasize steady deterrence, military readiness, and allied unity.',
    momentumDelta: 2,
    approvalDelta: 0.8,
    headline: 'Campaign Spotlights Presidential Crisis Leadership Across Battlegrounds',
  },
  {
    id: 'ad_attack',
    label: 'Sharp Opponent Contrast',
    description: 'Aggressive opposition-research attack ads across Midwest airwaves.',
    momentumDelta: 4,
    approvalDelta: -0.4,
    headline: 'Hard-Hitting Contrast Spots Escalate General Election Battleground Clash',
  },
];

export const DEBATE_PREP_TRACKS: {
  id: string;
  label: string;
  focus: string;
  momentumDelta: number;
  approvalDelta: number;
  headline: string;
}[] = [
  {
    id: 'prep_macro',
    label: 'Macro & Kitchen-Table Mastery',
    focus: 'Drill CPI, mortgage, and wage specifics to disarm economic attacks.',
    momentumDelta: 3,
    approvalDelta: 1.0,
    headline: 'President Wins Praise for Sharp Economic Command in Debate Prep Town Hall',
  },
  {
    id: 'prep_zingers',
    label: 'Rapid-Fire Rebuttal & Counterpunch',
    focus: 'Rehearse memorable one-liners to neutralize challenger talking points.',
    momentumDelta: 4,
    approvalDelta: 0.5,
    headline: 'Campaign Sharpens Rapid-Response Rebuttals Ahead of Primetime Debate',
  },
  {
    id: 'prep_foreign',
    label: 'Global Statesman Framing',
    focus: 'Anchor presidential stature on alliances, deterrence, and trade.',
    momentumDelta: 2,
    approvalDelta: 0.9,
    headline: 'Advisors Highlight Global Experience as Foreign Policy Takes Debate Center Stage',
  },
];

export interface OppositionAttackLine {
  id: string;
  topic: string;
  attackLine: string;
  rebuttalDraft: string;
}

export function synthesizeOppositionAttacks(
  metrics: NationalMetrics,
  military: MilitaryCommandState
): OppositionAttackLine[] {
  const lines: OppositionAttackLine[] = [];

  if (metrics.inflation >= 3.5) {
    lines.push({
      id: 'atk_cpi',
      topic: 'Cost of Living & CPI',
      attackLine: `Opposition leaders blame White House spending for keeping CPI elevated at ${metrics.inflation.toFixed(
        1
      )}%, hitting groceries and gas.`,
      rebuttalDraft: `We are tackling inflation from the supply side—unlocking domestic energy, lowering shipping bottlenecks, and rejecting reckless giveaways that fuel prices.`,
    });
  } else {
    lines.push({
      id: 'atk_growth',
      topic: 'Wage & Growth Pace',
      attackLine: `Critics argue ${metrics.gdpGrowth.toFixed(
        1
      )}% GDP growth is unevenly distributed outside major coastal tech corridors.`,
      rebuttalDraft: `Every region deserves growth—which is why our permits, apprenticeships, and infrastructure investments target heartland towns first.`,
    });
  }

  if (metrics.nationalDebtTrillions >= 36) {
    lines.push({
      id: 'atk_debt',
      topic: 'Sovereign Debt Trajectory',
      attackLine: `Fiscal hawks warn $${metrics.nationalDebtTrillions.toFixed(
        1
      )}T in federal debt threatens higher Treasury yields and long-term borrowing costs.`,
      rebuttalDraft: `Responsible budgets require real offsets and growth—and we invite Congress to match our Pay-As-You-Go discipline instead of staging shutdown theater.`,
    });
  }

  if (metrics.diplomaticStanding < 58 || military.defconLevel <= 3) {
    lines.push({
      id: 'atk_foreign',
      topic: 'Global Deterrence & Alliances',
      attackLine: `Rivals contend global flashpoints and ${metrics.diplomaticStanding.toFixed(
        0
      )}/100 standing show strained U.S. leverage abroad.`,
      rebuttalDraft: `We are rebuilding allied deterrence from a position of clarity and readiness—never bluffing, never retreating from core commitments.`,
    });
  } else {
    lines.push({
      id: 'atk_congress',
      topic: 'Capitol Gridlock & Executive Action',
      attackLine: `Congressional critics accuse the Oval Office of bypassing lawmakers while Hill support sits at ${metrics.congressSupport.toFixed(
        0
      )}%.`,
      rebuttalDraft: `My door to Speaker and Senate leaders stays open every day—when Congress moves legislation, we sign it; when families wait, I act within the Constitution.`,
    });
  }

  return lines.slice(0, 3);
}

export const VP_ASSIGNMENTS: {
  id: VpAssignmentId;
  label: string;
  description: string;
  bonusText: string;
}[] = [
  {
    id: 'senate_whip',
    label: 'Senate Floor Whip & Tie-Breaker',
    description: 'Works moderate Senate offices daily to protect thin floor margins.',
    bonusText: '+Congressional dealmaking focus',
  },
  {
    id: 'rust_belt',
    label: 'Heartland & Labor Surrogate',
    description: 'Travels manufacturing counties defending administration jobs bills.',
    bonusText: '+Working Class outreach',
  },
  {
    id: 'allied_envoy',
    label: 'Special Allied Envoy',
    description: 'Represents the President at European and Indo-Pacific summits.',
    bonusText: '+Diplomatic Standing support',
  },
  {
    id: 'tech_council',
    label: 'AI, Grid & Competitiveness Chair',
    description: 'Leads interagency taskforces on semiconductors, power, and innovation.',
    bonusText: '+Tech & Growth alignment',
  },
];

export const INTERAGENCY_TASK_FORCES: {
  id: string;
  title: string;
  departments: [string, string];
  policyDraft: string;
  speechDraft: string;
}[] = [
  {
    id: 'tf_inflation',
    title: 'Supply-Chain & Cost-Relief Task Force',
    departments: ['Treasury', 'Labor'],
    policyDraft:
      'Convene a joint Treasury-Labor task force to clear port bottlenecks, suspend non-essential freight surcharges, and expand trade apprenticeships.',
    speechDraft:
      'By pairing Treasury supply-side discipline with skilled American workers, we can bring costs down and keep paychecks rising.',
  },
  {
    id: 'tf_deterrence',
    title: 'Integrated Deterrence & Sanctions Cell',
    departments: ['Defense', 'State'],
    policyDraft:
      'Establish a joint Pentagon-State Deterrence Cell synchronizing allied naval patrols with targeted financial and dual-use export sanctions.',
    speechDraft:
      'Our diplomacy is backed by credible readiness, and our readiness serves a clear, peaceful strategic objective alongside our allies.',
  },
  {
    id: 'tf_integrity',
    title: 'West Wing Ethics & Rapid-Response Desk',
    departments: ['Justice', 'Press Secretary'],
    policyDraft:
      'Mandate proactive Inspector General ethics disclosures alongside coordinated Press Office fact-sheets to reinforce institutional trust.',
    speechDraft:
      'Public trust is non-negotiable. We are setting the highest transparency standards across every agency in this administration.',
  },
];

export const TRIAD_POSTURES: {
  id: TriadPosture;
  label: string;
  defconTarget: 1 | 2 | 3 | 4 | 5;
  readinessDelta: number;
  diplomacyDelta: number;
  note: string;
}[] = [
  {
    id: 'standard',
    label: 'Baseline Triad Readiness',
    defconTarget: 4,
    readinessDelta: 0,
    diplomacyDelta: 0.5,
    note: 'Routine strategic submarine patrols and ICBM/bomber garrison posture.',
  },
  {
    id: 'bomber_dispersal',
    label: 'Forward Bomber Deterrence Rotation',
    defconTarget: 3,
    readinessDelta: 4,
    diplomacyDelta: -1.2,
    note: 'Increases readiness +4% and signals resolve; adds minor escalation friction.',
  },
  {
    id: 'ssbn_surge',
    label: 'Silent SSBN Deterrent Surge',
    defconTarget: 3,
    readinessDelta: 5,
    diplomacyDelta: -0.5,
    note: 'Expands continuous-at-sea ballistic deterrence with minimal public noise.',
  },
];

export const CYBER_DEFENSE_MODES: {
  id: CyberDefenseMode;
  label: string;
  cyberPosture: MilitaryCommandState['cyberPosture'];
  note: string;
}[] = [
  {
    id: 'perimeter',
    label: 'Perimeter Watch',
    cyberPosture: 'Normal',
    note: 'Standard federal network monitoring with minimal private-sector burden.',
  },
  {
    id: 'grid_shield',
    label: 'Critical Grid & Treasury Shield',
    cyberPosture: 'Active Shield',
    note: 'Hardens power interconnects, clearinghouses, and aviation networks.',
  },
  {
    id: 'hunt_forward',
    label: 'USCYBERCOM Hunt-Forward',
    cyberPosture: 'Elevated',
    note: 'Proactive allied threat-hunting deployments against state cyber groups.',
  },
];

export interface SanctionActionOption {
  id: string;
  label: string;
  target: string;
  description: string;
  diplomaticDelta: number;
  inflationDelta: number;
  gdpDelta: number;
  approvalDelta: number;
}

export const SANCTION_ACTIONS: SanctionActionOption[] = [
  {
    id: 'sanc_chips',
    label: 'Advanced Lithography & AI Chip Ban',
    target: 'Strategic Adversaries',
    description: 'Restrict export of high-end accelerators and semiconductor tooling.',
    diplomaticDelta: -1.4,
    inflationDelta: 0.1,
    gdpDelta: -0.1,
    approvalDelta: 1.2,
  },
  {
    id: 'sanc_shadow_fleet',
    label: 'Sanctioned Tanker Maritime Insurance Freeze',
    target: 'Illicit Oil Shadow Fleet',
    description: 'Target maritime insurers and port agents facilitating sanctioned crude.',
    diplomaticDelta: 1.1,
    inflationDelta: 0.2,
    gdpDelta: 0,
    approvalDelta: 0.8,
  },
  {
    id: 'sanc_oligarch',
    label: 'Treasury Sovereign Asset & Kleptocracy Freeze',
    target: 'Hostile Regime Elites',
    description: 'Freeze offshore dollar clearing accounts alongside G7 finance ministries.',
    diplomaticDelta: 1.6,
    inflationDelta: 0,
    gdpDelta: 0,
    approvalDelta: 1.0,
  },
  {
    id: 'sanc_tariff_corridor',
    label: 'Allied Critical-Minerals Trade Corridor',
    target: 'Trusted Partner Network',
    description: 'Lower allied input tariffs to ease manufacturing inflation and strengthen supply chains.',
    diplomaticDelta: 2.2,
    inflationDelta: -0.2,
    gdpDelta: 0.2,
    approvalDelta: 0.7,
  },
];

export const FOREIGN_AID_PACKAGES: {
  id: string;
  label: string;
  costTrillions: number;
  diplomaticDelta: number;
  approvalDelta: number;
  congressDelta: number;
  headline: string;
}[] = [
  {
    id: 'aid_indo_pacific',
    label: 'Indo-Pacific Maritime & Radar Package ($12B)',
    costTrillions: 0.012,
    diplomaticDelta: 2.4,
    approvalDelta: 0.4,
    congressDelta: 0.5,
    headline: 'White House Announces $12B Indo-Pacific Maritime Security Compact',
  },
  {
    id: 'aid_euro_air',
    label: 'European Air Defense & Munitions Replenishment ($18B)',
    costTrillions: 0.018,
    diplomaticDelta: 2.8,
    approvalDelta: 0.2,
    congressDelta: -0.4,
    headline: 'U.S. Commits $18B Allied Air Defense Replenishment With European Partners',
  },
  {
    id: 'aid_humanitarian',
    label: 'Global Food Corridor & Disaster Relief ($6B)',
    costTrillions: 0.006,
    diplomaticDelta: 1.9,
    approvalDelta: 0.7,
    congressDelta: 0.6,
    headline: 'Bipartisan Global Food & Relief Initiative Wins Praise Across Capitals',
  },
];

export const INTEL_FOCUS_REGIONS: {
  id: IntelFocusRegion;
  label: string;
  note: string;
}[] = [
  {
    id: 'indo_pacific',
    label: 'Indo-Pacific & Strait',
    note: 'Prioritizes maritime imagery, semiconductor corridor tracking, and naval intercepts.',
  },
  {
    id: 'eastern_europe',
    label: 'Eastern Europe & NATO Flank',
    note: 'Tracks armor logistics, artillery production, and energy infrastructure threats.',
  },
  {
    id: 'middle_east',
    label: 'Middle East & Red Sea',
    note: 'Monitors tanker lane choke points, proxy drone depots, and regional diplomacy.',
  },
  {
    id: 'cyber_grid',
    label: 'Homeland Cyber & Grid',
    note: 'Focuses NSA/CISA telemetry on banking settlement nodes and regional power grids.',
  },
];

export const DEFENSE_PROCUREMENT_OPTIONS: {
  id: DefenseProcurementFocus;
  label: string;
  readinessDelta: number;
  budgetDelta: number;
  note: string;
}[] = [
  {
    id: 'drones_munitions',
    label: 'Autonomous Drones & Munitions Surge',
    readinessDelta: 3,
    budgetDelta: 6,
    note: 'Rapidly replenishes precision stockpiles and attritable unmanned systems.',
  },
  {
    id: 'shipyards',
    label: 'Naval Shipyards & Submarine Capacity',
    readinessDelta: 2,
    budgetDelta: 10,
    note: 'Expands drydock throughput and long-range Pacific fleet sustainment.',
  },
  {
    id: 'air_space',
    label: 'Next-Gen Air & Space Missile Shield',
    readinessDelta: 2,
    budgetDelta: 12,
    note: 'Upgrades orbital early-warning satellites and hypersonic defense interceptors.',
  },
  {
    id: 'personnel',
    label: 'Service Member Pay & Family Retention',
    readinessDelta: 4,
    budgetDelta: 5,
    note: 'Raises enlisted pay, barracks quality, and technical specialist retention.',
  },
];

export interface PeerBenchmark {
  eraName: string;
  avgApproval: number;
  avgGdp: number;
  avgInflation: number;
  enactmentRatePct: number;
}

export const HISTORICAL_BENCHMARKS: PeerBenchmark[] = [
  {
    eraName: 'Post-WWII Expansion Cohort',
    avgApproval: 57,
    avgGdp: 3.4,
    avgInflation: 2.5,
    enactmentRatePct: 68,
  },
  {
    eraName: '1970s Stagflation & Reset Era',
    avgApproval: 45,
    avgGdp: 2.1,
    avgInflation: 7.4,
    enactmentRatePct: 49,
  },
  {
    eraName: '1990s Tech & Surplus Decade',
    avgApproval: 55,
    avgGdp: 3.6,
    avgInflation: 2.6,
    enactmentRatePct: 58,
  },
  {
    eraName: 'Modern Polarized Era (2009–2025)',
    avgApproval: 46,
    avgGdp: 2.3,
    avgInflation: 3.3,
    enactmentRatePct: 44,
  },
];

export function buildAdministrationMarkdownDossier(params: {
  profile: PresidentProfile;
  scenarioTitle: string;
  metrics: NationalMetrics;
  initialMetrics: NationalMetrics;
  history: TermHistoryEntry[];
  records: LegislativeRecordItem[];
  headlines: NewsHeadlineItem[];
}): string {
  const {
    profile,
    scenarioTitle,
    metrics,
    initialMetrics,
    history,
    records,
    headlines,
  } = params;

  const lines: string[] = [
    `# Executive Term — Administration Dossier`,
    ``,
    `- **President:** ${profile.name}`,
    `- **Scenario:** ${scenarioTitle}`,
    `- **Term Progress:** ${history.length} of ${profile.termLength} months completed`,
    profile.motto ? `- **Motto:** "${profile.motto}"` : '',
    ``,
    `## Metrics Summary (Inauguration → Current)`,
    `- **Public Approval:** ${initialMetrics.approval.toFixed(1)}% → ${metrics.approval.toFixed(1)}%`,
    `- **Congress Support:** ${initialMetrics.congressSupport.toFixed(1)}% → ${metrics.congressSupport.toFixed(1)}%`,
    `- **GDP Growth:** ${initialMetrics.gdpGrowth.toFixed(1)}% → ${metrics.gdpGrowth.toFixed(1)}%`,
    `- **Inflation (CPI):** ${initialMetrics.inflation.toFixed(1)}% → ${metrics.inflation.toFixed(1)}%`,
    `- **Unemployment:** ${initialMetrics.unemployment.toFixed(1)}% → ${metrics.unemployment.toFixed(1)}%`,
    `- **National Debt:** $${initialMetrics.nationalDebtTrillions.toFixed(2)}T → $${metrics.nationalDebtTrillions.toFixed(2)}T`,
    `- **Diplomatic Standing:** ${initialMetrics.diplomaticStanding.toFixed(0)}/100 → ${metrics.diplomaticStanding.toFixed(0)}/100`,
    ``,
    `## Legislative & Executive Record (${records.length})`,
    ...records.map(
      (r) =>
        `- **${formatMonthCalendar(r.month, profile.startingYear).shortDate}** [${r.recordType} · ${r.outcomeStatus}]: **${r.title}** — ${r.summary}`
    ),
    ``,
    `## Month-by-Month Turning Points (${history.length})`,
    ...history.map(
      (h) =>
        `### ${formatMonthCalendar(h.month, profile.startingYear).shortDate}: ${h.outcome.newspaperHeadline}\n${h.outcome.outcomeNarrative}\n`
    ),
    ``,
    `## Key Media Wire Headlines (${Math.min(15, headlines.length)})`,
    ...headlines
      .slice(-15)
      .reverse()
      .map((n) => `- *${n.outlet}* (${n.tone}): ${n.headline}`),
  ];

  return lines.filter((line) => line !== undefined).join('\n');
}

export function evaluateCabinetIdeologySpread(cabinet: CabinetMember[]) {
  const buckets = {
    Pragmatist: 0,
    Populist: 0,
    Hawk: 0,
    Progressive: 0,
    Conservative: 0,
  };
  for (const m of cabinet) {
    const l = m.leaning.toLowerCase();
    if (/hawk|deterrence|security|strategic/.test(l)) buckets.Hawk += 1;
    else if (/populist|labor|worker/.test(l)) buckets.Populist += 1;
    else if (/progressive|reform|equity|green/.test(l)) buckets.Progressive += 1;
    else if (/conservative|fiscal|supply|market|constitutional/.test(l))
      buckets.Conservative += 1;
    else buckets.Pragmatist += 1;
  }
  const avgLoyalty =
    cabinet.length > 0
      ? cabinet.reduce((sum, m) => sum + m.loyalty, 0) / cabinet.length
      : 0;
  const avgCompetence =
    cabinet.length > 0
      ? cabinet.reduce((sum, m) => sum + m.competence, 0) / cabinet.length
      : 0;
  const strainedCount = cabinet.filter((m) => m.status === 'Strained').length;
  const cautiousCount = cabinet.filter((m) => m.status === 'Cautious').length;

  return {
    buckets,
    avgLoyalty,
    avgCompetence,
    strainedCount,
    cautiousCount,
  };
}
