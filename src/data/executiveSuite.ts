import {
  AdminSuiteState,
  GovernanceFocus,
  InstitutionalState,
  NationalMetrics,
  VoterBlocs,
} from '../types/game';

export function createDefaultAdminSuiteState(): AdminSuiteState {
  return {
    governanceFocus: 'balanced',
    pressAccessMode: 'rotation',
    vpAssignment: 'senate_whip',
    cyberDefenseMode: 'grid_shield',
    triadPosture: 'standard',
    intelFocusRegion: 'indo_pacific',
    defenseProcurementFocus: 'drones_munitions',
    activeSanctions: [],
    actionLog: [],
  };
}

export const GOVERNANCE_FOCUS_OPTIONS: {
  id: GovernanceFocus;
  label: string;
  effectSummary: string;
  monthlyApprovalMod: number;
  monthlyCongressMod: number;
  monthlyGdpMod: number;
  monthlyDiplomacyMod: number;
}[] = [
  {
    id: 'balanced',
    label: 'Balanced Governing',
    effectSummary: 'Steady baseline across legislative, economic, and security desks.',
    monthlyApprovalMod: 0,
    monthlyCongressMod: 0,
    monthlyGdpMod: 0,
    monthlyDiplomacyMod: 0,
  },
  {
    id: 'legislative',
    label: 'Legislative Blitz',
    effectSummary: '+1.2% Congress Support/mo, -0.3% Diplomatic bandwidth.',
    monthlyApprovalMod: 0.2,
    monthlyCongressMod: 1.2,
    monthlyGdpMod: 0,
    monthlyDiplomacyMod: -0.3,
  },
  {
    id: 'economic',
    label: 'Economic War Room',
    effectSummary: '+0.1% GDP momentum/mo, sharper market confidence.',
    monthlyApprovalMod: 0.3,
    monthlyCongressMod: 0,
    monthlyGdpMod: 0.1,
    monthlyDiplomacyMod: 0,
  },
  {
    id: 'foreign',
    label: 'Global Diplomacy Tour',
    effectSummary: '+1.4 Diplomatic Standing/mo, -0.4% domestic Congress focus.',
    monthlyApprovalMod: 0.1,
    monthlyCongressMod: -0.4,
    monthlyGdpMod: 0,
    monthlyDiplomacyMod: 1.4,
  },
  {
    id: 'campaign',
    label: 'Public Campaigning',
    effectSummary: '+0.9% Public Approval/mo, -0.6% Congress dealmaking.',
    monthlyApprovalMod: 0.9,
    monthlyCongressMod: -0.6,
    monthlyGdpMod: 0,
    monthlyDiplomacyMod: 0,
  },
];

export interface PardonCandidate {
  id: string;
  recipient: string;
  category: string;
  summary: string;
  approvalDelta: number;
  congressDelta: number;
  diplomaticDelta: number;
  blocDeltas: Partial<VoterBlocs>;
  headline: string;
  tradeoffNote: string;
}

export const PARDON_CANDIDATES: PardonCandidate[] = [
  {
    id: 'pardon_nonviolent',
    recipient: 'Clemency Batch (18 Nonviolent Drug Sentences)',
    category: 'Criminal Justice Reform',
    summary:
      'Commute outdated mandatory-minimum federal sentences following unanimous Justice Department clemency board review.',
    approvalDelta: 1.4,
    congressDelta: -0.6,
    diplomaticDelta: 0.2,
    blocDeltas: { youngVoters: 3, workingClass: 1, seniors: -1 },
    headline: 'White House Commutes 18 Federal Sentences Under Clemency Review',
    tradeoffNote: '+1.4% Approval · +3 Young Voters · -0.6% Congress Support',
  },
  {
    id: 'pardon_whistleblower',
    recipient: 'Daniel Reyes (Defense Procurement Whistleblower)',
    category: 'Transparency & Oversight',
    summary:
      'Pardon a retired analyst prosecuted for exposing inflated Pentagon subcontracts to congressional investigators.',
    approvalDelta: 1.8,
    congressDelta: 1.1,
    diplomaticDelta: -0.8,
    blocDeltas: { suburbanModerates: 2, youngVoters: 2, techFinance: -1 },
    headline: 'President Pardons Pentagon Whistleblower, Drawing Hill Praise',
    tradeoffNote: '+1.8% Approval · +1.1% Congress · -0.8 Diplomacy',
  },
  {
    id: 'pardon_veteran',
    recipient: 'Sgt. Maj. Thomas Vance (Decorated Combat Veteran)',
    category: 'Military Clemency',
    summary:
      'Grant full pardon for a post-deployment firearms licensing violation after bipartisan Veterans Affairs committee petitions.',
    approvalDelta: 1.6,
    congressDelta: 1.4,
    diplomaticDelta: 0,
    blocDeltas: { workingClass: 2, seniors: 2, suburbanModerates: 1 },
    headline: 'Bipartisan Lawmakers Welcome Presidential Pardon for Decorated Veteran',
    tradeoffNote: '+1.6% Approval · +1.4% Congress · +2 Working Class & Seniors',
  },
  {
    id: 'pardon_tech_founder',
    recipient: 'Elena Novak (Fintech & Crypto Founder)',
    category: 'Financial Sector',
    summary:
      'Pardon a prominent software founder convicted of unregistered securities structuring in a bid to court capital markets.',
    approvalDelta: -1.5,
    congressDelta: -1.8,
    diplomaticDelta: 0,
    blocDeltas: { techFinance: 4, youngVoters: -2, workingClass: -3 },
    headline: 'Controversial Fintech Pardon Sparks Oversight Hearings on Wall Street Influence',
    tradeoffNote: '+4 Tech & Finance · -1.5% Approval · -1.8% Congress',
  },
  {
    id: 'pardon_political_ally',
    recipient: 'Former Campaign Strategist Arthur Hale',
    category: 'Executive Ally',
    summary:
      'Pardon a longtime political confidant convicted of false statements during a past campaign finance probe.',
    approvalDelta: -3.2,
    congressDelta: -3.5,
    diplomaticDelta: -0.5,
    blocDeltas: { suburbanModerates: -4, youngVoters: -3, workingClass: -1 },
    headline: 'Ethics Watchdogs Condemn Presidential Pardon of Former Strategist',
    tradeoffNote: 'Severe Ethics Risk: -3.2% Approval · -3.5% Congress',
  },
  {
    id: 'pardon_cyber_researcher',
    recipient: 'Marcus Lin (Civic Security Researcher)',
    category: 'Cyber & Infrastructure',
    summary:
      'Pardon an independent researcher charged under legacy computer-access statutes after responsibly disclosing a municipal water-grid flaw.',
    approvalDelta: 1.1,
    congressDelta: 0.4,
    diplomaticDelta: 0.5,
    blocDeltas: { techFinance: 3, youngVoters: 2 },
    headline: 'White House Grants Clemency to Grid-Vulnerability Researcher',
    tradeoffNote: '+1.1% Approval · +3 Tech & Finance · +0.5 Diplomacy',
  },
];

export interface ProclamationOption {
  id: string;
  title: string;
  focus: string;
  approvalDelta: number;
  congressDelta: number;
  diplomaticDelta: number;
  blocDeltas: Partial<VoterBlocs>;
  headline: string;
}

export const PROCLAMATION_OPTIONS: ProclamationOption[] = [
  {
    id: 'proc_veterans',
    title: 'National Veterans & Military Families Tribute',
    focus: 'Veterans healthcare & deployment readiness recognition',
    approvalDelta: 0.9,
    congressDelta: 0.7,
    diplomaticDelta: 0.3,
    blocDeltas: { seniors: 2, workingClass: 2 },
    headline: 'President Signs National Veterans Tribute Proclamation at Arlington',
  },
  {
    id: 'proc_manufacturing',
    title: 'American Manufacturing & Trades Week',
    focus: 'Domestic factories, apprenticeships & regional supply chains',
    approvalDelta: 0.8,
    congressDelta: 0.5,
    diplomaticDelta: 0,
    blocDeltas: { workingClass: 3, suburbanModerates: 1 },
    headline: 'White House Launches American Manufacturing & Apprenticeship Week',
  },
  {
    id: 'proc_innovation',
    title: 'National Science, Energy & AI Frontier Day',
    focus: 'University R&D, grid engineering & domestic labs',
    approvalDelta: 0.7,
    congressDelta: 0.4,
    diplomaticDelta: 0.6,
    blocDeltas: { techFinance: 2, youngVoters: 2 },
    headline: 'Administration Proclaims National Science & Energy Frontier Day',
  },
  {
    id: 'proc_small_biz',
    title: 'Main Street & Small Business Charter',
    focus: 'Local credit access & regulatory paperwork simplification',
    approvalDelta: 0.9,
    congressDelta: 0.8,
    diplomaticDelta: 0,
    blocDeltas: { suburbanModerates: 2, workingClass: 1, techFinance: 1 },
    headline: 'President Honors Main Street Entrepreneurs in Rose Garden Proclamation',
  },
];

export interface CampDavidRetreatOption {
  id: string;
  title: string;
  guestList: string;
  summary: string;
  congressDelta: number;
  approvalDelta: number;
  diplomaticDelta: number;
  debtDeltaTrillions: number;
  headline: string;
}

export const CAMP_DAVID_OPTIONS: CampDavidRetreatOption[] = [
  {
    id: 'cd_bipartisan_budget',
    title: 'Bipartisan Appropriations & Debt Summit',
    guestList: 'House Speaker, Senate Majority & Minority Leaders',
    summary:
      'Spend a private weekend at Camp David hammering out fiscal guardrails and committee floor calendars.',
    congressDelta: 3.4,
    approvalDelta: 0.8,
    diplomaticDelta: 0.5,
    debtDeltaTrillions: -0.05,
    headline: 'Quiet Camp David Weekend Yields Bipartisan Congressional Framework',
  },
  {
    id: 'cd_swing_moderates',
    title: 'Bipartisan Swing-District Problem Solvers Retreat',
    guestList: '24 Moderate House & Senate Swing-State Members',
    summary:
      'Build a durable legislative center on permitting, energy, and workforce bills.',
    congressDelta: 2.8,
    approvalDelta: 1.2,
    diplomaticDelta: 0,
    debtDeltaTrillions: 0,
    headline: 'Moderate Lawmakers Emerge From Camp David Talks With Joint Agenda',
  },
  {
    id: 'cd_allied_sherpas',
    title: 'Transatlantic & Indo-Pacific Security Conclave',
    guestList: 'G7 Ambassadors, NATO SecGen & Defense Chiefs',
    summary:
      'Align allied sanctions, maritime escort rotas, and defense burden-sharing privately.',
    congressDelta: 0.8,
    approvalDelta: 0.6,
    diplomaticDelta: 3.6,
    debtDeltaTrillions: 0,
    headline: 'Camp David Allied Conclave Produces Unified Deterrence Compact',
  },
];

export interface SpinStrategyOption {
  id: string;
  label: string;
  description: string;
  approvalDelta: number;
  congressDelta: number;
  headlinePrefix: string;
}

export const SPIN_STRATEGIES: SpinStrategyOption[] = [
  {
    id: 'spin_own_pivot',
    label: 'Own & Pivot to Jobs',
    description:
      'Acknowledge short-term friction and aggressively refocus cable/print interviews on household wages and long-term results.',
    approvalDelta: 1.1,
    congressDelta: 0.5,
    headlinePrefix: 'White House Pivots Message Toward Long-Term Economic Gains',
  },
  {
    id: 'spin_release_data',
    label: 'Release Supporting Treasury Dossier',
    description:
      'Publish granular CEA & OMB technical projections backing the administration’s latest decision.',
    approvalDelta: 0.8,
    congressDelta: 1.1,
    headlinePrefix: 'OMB Releases Technical Projections Defending Executive Strategy',
  },
  {
    id: 'spin_bipartisan_call',
    label: 'Challenge Congress to Counter-Propose',
    description:
      'Put the spotlight back on Capitol Hill leadership by inviting a concrete legislative alternative within 14 days.',
    approvalDelta: 1.3,
    congressDelta: -0.7,
    headlinePrefix: 'President Challenges Capitol Critics to Put Alternative Bill on Floor',
  },
];

export const SPEECH_FRAMES: {
  id: string;
  label: string;
  template: (month: number, metrics: NationalMetrics) => string;
}[] = [
  {
    id: 'unifying',
    label: 'Unifying & Steady',
    template: (m, metrics) =>
      `In Month ${m}, our focus remains straightforward: protecting the ${metrics.gdpGrowth.toFixed(
        1
      )}% growth families rely on while bringing everyday costs down and governing for every state.`,
  },
  {
    id: 'populist',
    label: 'Main Street Populist',
    template: () =>
      `Working Americans have waited long enough while entrenched interests stall progress. Today we are putting paychecks, domestic factories, and household security first.`,
  },
  {
    id: 'fiscal',
    label: 'Fiscal Credibility',
    template: (_m, metrics) =>
      `With inflation at ${metrics.inflation.toFixed(
        1
      )}% and debt at $${metrics.nationalDebtTrillions.toFixed(
        1
      )}T, serious leadership requires discipline—investing where growth multiplies and cutting waste without excuses.`,
  },
  {
    id: 'deterrence',
    label: 'Strength & Alliances',
    template: () =>
      `Peace is preserved through unmistakable readiness and trusted allies. Adversaries should never mistake democratic debate for hesitation.`,
  },
];

export const DIRECTIVE_CLAUSES: {
  id: string;
  label: string;
  clause: string;
}[] = [
  {
    id: 'paygo',
    label: '+ PAYGO Deficit Offset',
    clause:
      'Include a strict Pay-As-You-Go fiscal offset via unused pandemic/agency unobligated balances so the package remains deficit-neutral.',
  },
  {
    id: 'bipartisan_sunset',
    label: '+ 3-Year Bipartisan Sunset',
    clause:
      'Attach a 3-year statutory sunset and joint GAO performance audit to win moderate Senate swing votes.',
  },
  {
    id: 'buy_american',
    label: '+ Domestic Supply Clause',
    clause:
      'Mandate domestic manufacturing and union prevailing-wage standards for all federal procurement contracts.',
  },
  {
    id: 'ig_oversight',
    label: '+ Inspector General Shield',
    clause:
      'Establish real-time public ledger reporting and independent Inspector General oversight to preempt ethics challenges.',
  },
];

export const AGENCY_QUICK_DISPATCHES: {
  id: string;
  agency: string;
  label: string;
  draft: string;
}[] = [
  {
    id: 'omb_freeze',
    agency: 'OMB',
    label: 'OMB Cost Audit',
    draft:
      'Direct OMB to conduct a 30-day zero-based spending audit across non-defense discretionary accounts.',
  },
  {
    id: 'ftc_antitrust',
    agency: 'FTC / DOJ',
    label: 'Antitrust Price Probe',
    draft:
      'Instruct the FTC and DOJ Antitrust Division to investigate coordinated grocery, freight, and algorithmic pricing markups.',
  },
  {
    id: 'doe_grid',
    agency: 'DOE',
    label: 'Grid Permitting Fast-Track',
    draft:
      'Invoke federal siting authority at the Department of Energy to fast-track interstate high-voltage transmission and baseload power interconnects.',
  },
  {
    id: 'ustr_tariff',
    agency: 'USTR',
    label: 'Targeted Tariff Action',
    draft:
      'Direct the U.S. Trade Representative to adjust Section 301 tariffs—tightening strategic tech controls while exempting critical household inputs.',
  },
];

export interface PreFlightEstimate {
  passageOddsLabel: string;
  inflationSignal: 'Cooling' | 'Neutral' | 'Inflationary';
  debtSignal: 'Deficit-Reducing' | 'Neutral' | 'Debt-Adding';
  marketTone: 'Reassuring' | 'Mixed' | 'Volatile';
  summaryNote: string;
}

export function estimateDirectivePreFlight(
  policyText: string,
  personalText: string,
  speechText: string,
  metrics: NationalMetrics,
  institutions: InstitutionalState
): PreFlightEstimate {
  const combined = `${policyText} ${personalText} ${speechText}`.toLowerCase();
  const hasBipartisan =
    /bipartisan|compromise|sunset|offset|paygo|committee|negotiate|moderate/i.test(
      combined
    );
  const hasSpending =
    /stimulus|subsid|grant|billion|trillion|spending|expand|bailout|tax cut|rebate/i.test(
      combined
    );
  const hasOffset =
    /offset|freeze|cut|paygo|deficit|cap|reallocate|veto/i.test(combined);
  const hasEscalation =
    /strike|war|blockade|tariff|sanction|deploy|emergency|unilateral/i.test(
      combined
    );
  const hasCooling =
    /supply|permitting|antitrust|reserve|energy|export|rate|discipline/i.test(
      combined
    );

  let oddsScore = metrics.congressSupport + (hasBipartisan ? 14 : 0) - (hasEscalation ? 7 : 0);
  if (institutions.judiciaryClimate === 'Hostile' && /executive order/i.test(combined)) {
    oddsScore -= 8;
  }
  const passageOddsLabel =
    oddsScore >= 62
      ? 'High Consensus Odds'
      : oddsScore >= 46
      ? 'Competitive Floor Vote'
      : 'Steep Hill Resistance';

  const inflationSignal: PreFlightEstimate['inflationSignal'] =
    hasCooling && !hasSpending
      ? 'Cooling'
      : hasSpending && !hasOffset
      ? 'Inflationary'
      : 'Neutral';

  const debtSignal: PreFlightEstimate['debtSignal'] =
    hasOffset && !hasSpending
      ? 'Deficit-Reducing'
      : hasSpending && !hasOffset
      ? 'Debt-Adding'
      : 'Neutral';

  const marketTone: PreFlightEstimate['marketTone'] =
    hasEscalation && !hasOffset
      ? 'Volatile'
      : hasCooling || hasOffset
      ? 'Reassuring'
      : 'Mixed';

  const summaryNote = !combined.trim()
    ? 'Draft a policy directive or unscripted action to preview congressional and market sensitivities.'
    : `${passageOddsLabel} based on ${metrics.congressSupport.toFixed(
        0
      )}% Hill support; macro posture reads ${inflationSignal.toLowerCase()} and ${marketTone.toLowerCase()} for bond desks.`;

  return {
    passageOddsLabel,
    inflationSignal,
    debtSignal,
    marketTone,
    summaryNote,
  };
}
