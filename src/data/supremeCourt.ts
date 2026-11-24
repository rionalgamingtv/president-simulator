import { InstitutionalState, PartyId, VoterBlocs } from '../types/game';

export type JusticeAlignment = 'conservative' | 'swing' | 'progressive';

export interface SupremeCourtJustice {
  id: string;
  seatNumber: number;
  name: string;
  role: 'Chief Justice' | 'Associate Justice';
  philosophy:
    | 'Strict Originalist'
    | 'Textualist'
    | 'Institutional Centrist'
    | 'Pragmatic Constitutionalist'
    | 'Living Constitutionalist';
  alignment: JusticeAlignment;
  appointedYear: number;
  retirementRisk: 'Low' | 'Moderate' | 'Imminent';
  swingSensitivity: number; // 0-100: likelihood of siding with pragmatic briefs
}

export interface DocketCase {
  id: string;
  caseName: string;
  docketNumber: string;
  issueArea: string;
  summary: string;
  administrationGoal: string;
  leaningBonusForGov: 'conservative' | 'progressive' | 'neutral';
  briefStrategies: {
    id: string;
    label: string;
    legalArgument: string;
    swingShift: number; // shifts swing votes toward uphold
    congressDelta: number;
    approvalDelta: number;
  }[];
  upheldImpact: {
    approvalDelta: number;
    congressDelta: number;
    gdpDelta: number;
    headline: string;
    rulingSummary: string;
  };
  struckDownImpact: {
    approvalDelta: number;
    congressDelta: number;
    gdpDelta: number;
    headline: string;
    rulingSummary: string;
  };
}

export interface JudicialNomineeProfile {
  id: string;
  name: string;
  currentRole: string;
  philosophy: SupremeCourtJustice['philosophy'];
  alignment: JusticeAlignment;
  bipartisanAppeal: number; // -12 to +14
  summary: string;
  conservativeReaction: string;
  progressiveReaction: string;
  blocImpacts: Partial<VoterBlocs>;
}

export interface JudiciaryHearingQuestion {
  id: string;
  senatorName: string;
  committeeRole: string;
  question: string;
  responses: {
    id: string;
    label: string;
    quote: string;
    confirmationBonus: number;
    approvalDelta: number;
  }[];
}

export const INITIAL_SUPREME_COURT_BENCH: SupremeCourtJustice[] = [
  {
    id: 'sc-1',
    seatNumber: 1,
    name: 'Chief Justice John Harlan',
    role: 'Chief Justice',
    philosophy: 'Institutional Centrist',
    alignment: 'swing',
    appointedYear: 2005,
    retirementRisk: 'Moderate',
    swingSensitivity: 68,
  },
  {
    id: 'sc-2',
    seatNumber: 2,
    name: 'Justice Clarence Whitaker',
    role: 'Associate Justice',
    philosophy: 'Strict Originalist',
    alignment: 'conservative',
    appointedYear: 1994,
    retirementRisk: 'Imminent',
    swingSensitivity: 12,
  },
  {
    id: 'sc-3',
    seatNumber: 3,
    name: 'Justice Samuel Caldwell',
    role: 'Associate Justice',
    philosophy: 'Strict Originalist',
    alignment: 'conservative',
    appointedYear: 2006,
    retirementRisk: 'Imminent',
    swingSensitivity: 15,
  },
  {
    id: 'sc-4',
    seatNumber: 4,
    name: 'Justice Sonia Morales',
    role: 'Associate Justice',
    philosophy: 'Living Constitutionalist',
    alignment: 'progressive',
    appointedYear: 2009,
    retirementRisk: 'Moderate',
    swingSensitivity: 25,
  },
  {
    id: 'sc-5',
    seatNumber: 5,
    name: 'Justice Elena Kagan-Mercer',
    role: 'Associate Justice',
    philosophy: 'Pragmatic Constitutionalist',
    alignment: 'progressive',
    appointedYear: 2010,
    retirementRisk: 'Low',
    swingSensitivity: 42,
  },
  {
    id: 'sc-6',
    seatNumber: 6,
    name: 'Justice Neil Prescott',
    role: 'Associate Justice',
    philosophy: 'Textualist',
    alignment: 'conservative',
    appointedYear: 2017,
    retirementRisk: 'Low',
    swingSensitivity: 34,
  },
  {
    id: 'sc-7',
    seatNumber: 7,
    name: 'Justice Brett Kensington',
    role: 'Associate Justice',
    philosophy: 'Institutional Centrist',
    alignment: 'swing',
    appointedYear: 2018,
    retirementRisk: 'Low',
    swingSensitivity: 62,
  },
  {
    id: 'sc-8',
    seatNumber: 8,
    name: 'Justice Amy Barrett-Cole',
    role: 'Associate Justice',
    philosophy: 'Textualist',
    alignment: 'conservative',
    appointedYear: 2020,
    retirementRisk: 'Low',
    swingSensitivity: 48,
  },
  {
    id: 'sc-9',
    seatNumber: 9,
    name: 'Justice Ketanji Brooks',
    role: 'Associate Justice',
    philosophy: 'Living Constitutionalist',
    alignment: 'progressive',
    appointedYear: 2022,
    retirementRisk: 'Low',
    swingSensitivity: 28,
  },
];

export const CONSTITUTIONAL_DOCKET_CASES: DocketCase[] = [
  {
    id: 'case-tariffs',
    caseName: 'National Manufacturers Coalition v. United States',
    docketNumber: 'No. 25-412',
    issueArea: 'Executive Trade & Emergency Tariff Authority',
    summary:
      'Challenges the President’s power to impose sweeping national-security tariffs without prior floor ratification by Congress.',
    administrationGoal: 'Preserve broad Article II trade & emergency tariff discretion.',
    leaningBonusForGov: 'neutral',
    briefStrategies: [
      {
        id: 'narrow-statute',
        label: 'Narrow Statutory Delegation',
        legalArgument:
          'Anchor tariffs strictly inside historical Trade Expansion Act text rather than claiming unbounded executive authority.',
        swingShift: 2,
        congressDelta: 1.0,
        approvalDelta: 0.4,
      },
      {
        id: 'broad-art2',
        label: 'Broad Article II Commander-in-Chief',
        legalArgument:
          'Assert inherent constitutional foreign-commerce powers whenever supply chains touch national security.',
        swingShift: -1,
        congressDelta: -1.8,
        approvalDelta: 0.9,
      },
      {
        id: 'sunset-compromise',
        label: 'Time-Limited Emergency Framework',
        legalArgument:
          'Concede 180-day judicial review benchmarks in exchange for upholding immediate emergency duties.',
        swingShift: 3,
        congressDelta: 1.5,
        approvalDelta: 0.2,
      },
    ],
    upheldImpact: {
      approvalDelta: 1.8,
      congressDelta: 1.2,
      gdpDelta: 0.1,
      headline: 'Supreme Court Upholds Executive Emergency Tariff Powers in Closely Watched Ruling',
      rulingSummary:
        'A majority affirmed statutory trade authority while reminding the White House that permanent duties require ongoing congressional reporting.',
    },
    struckDownImpact: {
      approvalDelta: -2.4,
      congressDelta: -1.5,
      gdpDelta: 0.2,
      headline: 'High Court Curtails Unilateral Tariff Authority, Citing Major Questions Doctrine',
      rulingSummary:
        'The Court ruled that sweeping macroeconomic tariffs require clear, explicit congressional authorization.',
    },
  },
  {
    id: 'case-ai-preemption',
    caseName: 'State Attorneys General Alliance v. Dept. of Commerce',
    docketNumber: 'No. 25-689',
    issueArea: 'AI Compute Oversight & Federal Preemption',
    summary:
      'States sued to block federal preemption of state-level AI safety mandates and frontier model compute reporting rules.',
    administrationGoal: 'Establish unified national AI compute and safety standards.',
    leaningBonusForGov: 'progressive',
    briefStrategies: [
      {
        id: 'interstate-commerce',
        label: 'Interstate Commerce Clause Standard',
        legalArgument:
          'Demonstrate that frontier compute clusters operate across interstate fiber backbones requiring uniform national rules.',
        swingShift: 2,
        congressDelta: 0.8,
        approvalDelta: 0.6,
      },
      {
        id: 'cooperative-federalism',
        label: 'Cooperative State-Federal Carveout',
        legalArgument:
          'Preserve federal compute licensing while allowing states to enforce localized consumer-fraud statutes.',
        swingShift: 3,
        congressDelta: 1.4,
        approvalDelta: 0.5,
      },
      {
        id: 'full-preemption',
        label: 'Absolute Federal Preemption',
        legalArgument:
          'Argue that any state regulation fragments national AI competitiveness and defense readiness.',
        swingShift: 0,
        congressDelta: -1.2,
        approvalDelta: 0.3,
      },
    ],
    upheldImpact: {
      approvalDelta: 1.5,
      congressDelta: 1.4,
      gdpDelta: 0.3,
      headline: 'Supreme Court Clears Unified Federal AI Compute Framework Over State Objections',
      rulingSummary:
        'Justices sided with federal commerce uniformity, energizing major technology investment and national standards.',
    },
    struckDownImpact: {
      approvalDelta: -1.6,
      congressDelta: -1.2,
      gdpDelta: -0.2,
      headline: 'Justices Reject Federal AI Preemption, Preserving Patchwork of 50 State Laws',
      rulingSummary:
        'The Court held that Congress has not spoken clearly enough to displace state consumer-protection sovereignty.',
    },
  },
  {
    id: 'case-agency-power',
    caseName: 'Heartland Energy Partners v. Regulatory Agencies',
    docketNumber: 'No. 25-804',
    issueArea: 'Administrative Rulemaking & Grid Permitting',
    summary:
      'Tests whether federal agencies can accelerate clean-grid and industrial permitting using broad statutory mandates.',
    administrationGoal: 'Defend executive agency regulatory and permitting flexibility.',
    leaningBonusForGov: 'progressive',
    briefStrategies: [
      {
        id: 'textual-anchor',
        label: 'Strict Statutory Text Anchor',
        legalArgument:
          'Cite word-for-word provisions in existing energy statutes without invoking broad agency deference.',
        swingShift: 2,
        congressDelta: 1.0,
        approvalDelta: 0.3,
      },
      {
        id: 'scientific-deference',
        label: 'Technical Agency Expertise',
        legalArgument:
          'Emphasize engineering realities of grid reliability where generalist courts lack technical capacity.',
        swingShift: 1,
        congressDelta: -0.4,
        approvalDelta: 0.7,
      },
      {
        id: 'expedited-review',
        label: 'Fast-Track Judicial Review Offer',
        legalArgument:
          'Propose automatic 90-day court review windows for permitted grid corridors to satisfy procedural due process.',
        swingShift: 3,
        congressDelta: 1.2,
        approvalDelta: 0.5,
      },
    ],
    upheldImpact: {
      approvalDelta: 1.4,
      congressDelta: 1.1,
      gdpDelta: 0.2,
      headline: 'High Court Upholds Federal Grid & Agency Rulemaking Authority',
      rulingSummary:
        'A pragmatic majority validated the agency permitting framework under explicit statutory text.',
    },
    struckDownImpact: {
      approvalDelta: -1.9,
      congressDelta: -1.4,
      gdpDelta: -0.1,
      headline: 'Supreme Court Reins In Federal Agency Discretion in Landmark Administrative Ruling',
      rulingSummary:
        'The bench curtailed executive rulemaking, sending major permitting reforms back to Capitol Hill.',
    },
  },
  {
    id: 'case-war-powers',
    caseName: 'Constitutional Accountability Project v. National Security Council',
    docketNumber: 'No. 25-931',
    issueArea: 'Covert Cyber Deterrence & War Powers Limits',
    summary:
      'Reviews whether overseas defensive cyber operations and naval interdictions trigger mandatory War Powers reporting clocks.',
    administrationGoal: 'Protect executive speed in cyber and maritime deterrence.',
    leaningBonusForGov: 'conservative',
    briefStrategies: [
      {
        id: 'political-question',
        label: 'Non-Justiciable Political Question',
        legalArgument:
          'Argue that operational theater pacing is constitutionally committed to the President and Congress, not courts.',
        swingShift: 2,
        congressDelta: -1.0,
        approvalDelta: 0.5,
      },
      {
        id: 'classified-reporting',
        label: 'Gang-of-Eight Classified Briefing Pledge',
        legalArgument:
          'Affirm real-time classified congressional briefings while preserving tactical operational secrecy.',
        swingShift: 3,
        congressDelta: 1.6,
        approvalDelta: 0.8,
      },
      {
        id: 'inherent-self-defense',
        label: 'Inherent Self-Defense Mandate',
        legalArgument:
          'Claim uninterrupted executive duty to neutralize active foreign cyber threats before congressional votes.',
        swingShift: 1,
        congressDelta: -0.8,
        approvalDelta: 0.7,
      },
    ],
    upheldImpact: {
      approvalDelta: 1.3,
      congressDelta: 0.8,
      gdpDelta: 0,
      headline: 'Supreme Court Preserves Executive Speed in Cyber & Maritime Deterrence',
      rulingSummary:
        'The Court declined to impose rigid litigation injunctions on active defense deployments.',
    },
    struckDownImpact: {
      approvalDelta: -1.7,
      congressDelta: 1.0,
      gdpDelta: 0,
      headline: 'Supreme Court Mandates Strict 60-Day War Powers Clock for Cyber & Naval Ops',
      rulingSummary:
        'Justices ruled that persistent offensive cyber or blockade deployments require explicit congressional authorization.',
    },
  },
];

export const JUDICIAL_NOMINEES: JudicialNomineeProfile[] = [
  {
    id: 'nom-vance-elena',
    name: 'Judge Elena Vance (D.C. Circuit)',
    currentRole: 'Chief Judge, U.S. Court of Appeals for the D.C. Circuit',
    philosophy: 'Institutional Centrist',
    alignment: 'swing',
    bipartisanAppeal: 12,
    summary:
      'Widely respected administrative-law consensus jurist confirmed 84–14 to the D.C. Circuit; praised by bar associations across party lines.',
    conservativeReaction: 'Moderate GOP senators signal openness based on judicial restraint.',
    progressiveReaction: 'Democrats praise clean ethics record and predictable institutional respect.',
    blocImpacts: { suburbanModerates: 3, techFinance: 2 },
  },
  {
    id: 'nom-thorne',
    name: 'Judge Marcus Thorne (Fifth Circuit)',
    currentRole: 'Appellate Judge & Former State Solicitor General',
    philosophy: 'Strict Originalist',
    alignment: 'conservative',
    bipartisanAppeal: -3,
    summary:
      'Principled textualist and originalist with dozens of landmark opinions constraining federal agency overreach and defending constitutional federalism.',
    conservativeReaction: 'Senate conservatives rally enthusiastically behind a generational anchor.',
    progressiveReaction: 'Progressive caucuses vow unified floor opposition over regulatory precedent.',
    blocImpacts: { workingClass: 2, seniors: 2, youngVoters: -2 },
  },
  {
    id: 'nom-subramanian',
    name: 'Judge Priya Subramanian (Ninth Circuit)',
    currentRole: 'Federal Appellate Judge & Former Civil Rights Litigator',
    philosophy: 'Pragmatic Constitutionalist',
    alignment: 'progressive',
    bipartisanAppeal: 2,
    summary:
      'Sharp technology and civil-rights jurist noted for deeply researched statutory opinions balancing consumer rights with innovation.',
    conservativeReaction: 'Fiscal conservatives question her broad view of Commerce Clause powers.',
    progressiveReaction: 'Majority caucus celebrates historic bench representation and legal rigor.',
    blocImpacts: { youngVoters: 4, workingClass: 1, techFinance: 1 },
  },
  {
    id: 'nom-callahan',
    name: 'David Callahan, Esq.',
    currentRole: 'Former U.S. Solicitor General',
    philosophy: 'Textualist',
    alignment: 'conservative',
    bipartisanAppeal: 7,
    summary:
      'Argued 42 cases before the Supreme Court; prized for razor-sharp statutory clarity and strong Article II executive experience.',
    conservativeReaction: 'Business and judicial conservatives applaud his appellate credentials.',
    progressiveReaction: 'Centrist senators respect his institutional decorum despite doctrinal disputes.',
    blocImpacts: { techFinance: 3, suburbanModerates: 1 },
  },
];

export const JUDICIARY_HEARING_QUESTIONS: JudiciaryHearingQuestion[] = [
  {
    id: 'hq-precedent',
    senatorName: 'Sen. Arthur Pendelton',
    committeeRole: 'Judiciary Chair / Senior Negotiator',
    question:
      'Will your nominee pledge robust adherence to stare decisis on settled economic and civil precedents, even when personally disagreeing with the original reasoning?',
    responses: [
      {
        id: 'stare-decisis-firm',
        label: 'Commit to Institutional Stare Decisis',
        quote:
          'Settled precedent creates stability for American families and markets; overturning precedent requires extraordinary, rare justification.',
        confirmationBonus: 7,
        approvalDelta: 0.9,
      },
      {
        id: 'text-over-precedent',
        label: 'Prioritize Constitutional Text Above All',
        quote:
          'A justice’s oath is to the written Constitution itself, not to flawed prior opinions when text and history are unmistakable.',
        confirmationBonus: -2,
        approvalDelta: 0.4,
      },
      {
        id: 'case-by-case',
        label: 'Decline Hypotheticals (Ginsburg Rule)',
        quote:
          'As a sitting nominee, it would compromise judicial impartiality to pre-judge future cases before reading full appellate briefs.',
        confirmationBonus: 3,
        approvalDelta: 0.2,
      },
    ],
  },
  {
    id: 'hq-exec-power',
    senatorName: 'Sen. Rachel Montoya',
    committeeRole: 'Ranking Constitutional Subcommittee Member',
    question:
      'Where do you draw the constitutional line when a President invokes national emergency statutes to bypass deadlocked congressional appropriations?',
    responses: [
      {
        id: 'congress-first',
        label: 'Affirm Congress Holds the Power of the Purse',
        quote:
          'Article I vests spending and legislative authority squarely in Congress; emergency clauses must never become a blank check.',
        confirmationBonus: 8,
        approvalDelta: 0.8,
      },
      {
        id: 'unitary-exec',
        label: 'Defend Decisive Article II Emergency Latitude',
        quote:
          'The Framers created a single energetic executive precisely so the nation can act decisively when crises outpace legislative calendars.',
        confirmationBonus: -3,
        approvalDelta: 0.3,
      },
      {
        id: 'youngstown-test',
        label: 'Apply Justice Jackson’s Youngstown Framework',
        quote:
          'Presidential power is at its zenith with congressional backing and at its lowest ebb when defying an explicit legislative statute.',
        confirmationBonus: 6,
        approvalDelta: 0.7,
      },
    ],
  },
];

export function computeBenchBreakdown(
  bench: SupremeCourtJustice[],
  party?: PartyId
): {
  conservative: number;
  swing: number;
  progressive: number;
  summaryLabel: string;
  derivedClimate: InstitutionalState['judiciaryClimate'];
} {
  const conservative = bench.filter((j) => j.alignment === 'conservative').length;
  const swing = bench.filter((j) => j.alignment === 'swing').length;
  const progressive = bench.filter((j) => j.alignment === 'progressive').length;

  let summaryLabel = `${conservative}C · ${swing}S · ${progressive}P`;
  if (conservative >= 5) summaryLabel = `${conservative}–${9 - conservative} Conservative Lean`;
  else if (progressive >= 5) summaryLabel = `${progressive}–${9 - progressive} Progressive Lean`;
  else summaryLabel = `${conservative}C / ${swing} Swing / ${progressive}P`;

  let derivedClimate: InstitutionalState['judiciaryClimate'] = 'Split';
  if (party === 'republican') {
    derivedClimate =
      conservative >= 5 ? 'Favorable' : progressive >= 5 ? 'Hostile' : 'Split';
  } else if (party === 'democratic') {
    derivedClimate =
      progressive >= 5 ? 'Favorable' : conservative >= 5 ? 'Hostile' : 'Split';
  } else {
    derivedClimate = swing >= 2 || Math.abs(conservative - progressive) <= 1 ? 'Split' : 'Hostile';
  }

  return { conservative, swing, progressive, summaryLabel, derivedClimate };
}
