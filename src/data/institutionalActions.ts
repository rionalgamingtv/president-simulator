import {
  CapitolWhipOption,
  FedConsultOption,
  InstitutionalState,
  JudicialNominationOption,
} from '../types/game';

export const SOTU_THEMES: {
  id: string;
  title: string;
  subtitle: string;
  defaultRemarks: string;
}[] = [
  {
    id: 'economic_renewal',
    title: 'Cost-of-Living Relief & Industrial Renewal',
    subtitle: 'Targets working households, manufacturing investment, and price stability.',
    defaultRemarks:
      'Tonight, our mandate is straightforward: lower everyday costs for working families, rebuild domestic supply chains, and reward productive work across every state.',
  },
  {
    id: 'bipartisan_accord',
    title: 'Institutional Unity & Bipartisan Compact',
    subtitle: 'Extends an olive branch across the aisle to break legislative gridlock.',
    defaultRemarks:
      'The challenges before this Republic do not carry party labels. I am asking Democrats and Republicans in this chamber to pass shared priorities without brinkmanship.',
  },
  {
    id: 'peace_strength',
    title: 'Peace Through Strength & Allied Deterrence',
    subtitle: 'Projects military readiness, alliance reliability, and strategic resolve.',
    defaultRemarks:
      'America’s alliances remain the bedrock of global stability. We will modernize our deterrence, defend vital sea lanes, and stand firmly with our democratic partners.',
  },
  {
    id: 'fiscal_discipline',
    title: 'Fiscal Credibility & Debt Stabilization',
    subtitle: 'Signals deficit restraint to bond markets, seniors, and deficit hawks.',
    defaultRemarks:
      'True national strength requires fiscal honesty. Together, this Congress and my administration will curb runaway borrowing while protecting the earned security of retirees.',
  },
];

export const CAPITOL_WHIP_OPTIONS: CapitolWhipOption[] = [
  {
    id: 'whip_permitting',
    title: 'Bipartisan Energy & Infrastructure Permitting Deal',
    caucusTarget: 'Moderate Swing-District & Senate Centrists',
    summary:
      'Accelerate federal permitting reviews for grid transmission, domestic factories, and regional highways in exchange for guaranteed bipartisan floor votes.',
    congressDelta: 5.5,
    approvalDelta: 0.8,
    debtDeltaTrillions: 0.08,
    inflationDelta: -0.05,
    tradeoffLabel: '+5.5% Congress · +0.8% Approval · +$0.08T Debt',
  },
  {
    id: 'whip_district_earmarks',
    title: 'Targeted District Appropriations & Farm Belt Package',
    caucusTarget: 'Appropriations Chairs & Rural Caucuses',
    summary:
      'Unlock supplemental water, port, and rural broadband grants across pivotal House districts to flip undecided committee members.',
    congressDelta: 7.5,
    approvalDelta: 0.4,
    debtDeltaTrillions: 0.22,
    inflationDelta: 0.1,
    tradeoffLabel: '+7.5% Congress · +$0.22T Debt · +0.10% Inflation',
  },
  {
    id: 'whip_fiscal_offset',
    title: 'Accept Pay-Go Deficit Brake & Spending Caps',
    caucusTarget: 'Fiscal Hawks & Deficit Moderates',
    summary:
      'Concede enforceable discretionary spending caps and agency efficiency audits to bring fiscal conservatives into your legislative coalition.',
    congressDelta: 6.0,
    approvalDelta: -0.4,
    debtDeltaTrillions: -0.15,
    inflationDelta: -0.1,
    tradeoffLabel: '+6.0% Congress · -$0.15T Debt · -0.4% Approval',
  },
  {
    id: 'whip_defense_rider',
    title: 'Attach Domestic Shipyard & Defense Readiness Rider',
    caucusTarget: 'Armed Services Hawks & Labor Unions',
    summary:
      'Pair your next executive legislative push with multi-year naval procurement guarantees in key industrial states.',
    congressDelta: 6.5,
    approvalDelta: 0.5,
    debtDeltaTrillions: 0.18,
    inflationDelta: 0.05,
    tradeoffLabel: '+6.5% Congress · +0.5% Approval · +$0.18T Debt',
  },
];

export const FED_CONSULT_OPTIONS: FedConsultOption[] = [
  {
    id: 'fed_cut',
    title: 'Urge Monetary Easing to Support Growth',
    stanceRequested: 'Accommodative',
    summary:
      'Press the Fed Chair in a closed-door Treasury–Fed briefing to lower borrowing costs and sustain hiring, accepting modestly higher inflation pressure.',
    rateDelta: -0.25,
    gdpDelta: 0.3,
    inflationDelta: 0.25,
    approvalDelta: 0.8,
    chairNote:
      'Following White House growth consultations, the FOMC signaled a cautious 25 bps rate trim while monitoring core price pressures.',
    tradeoffLabel: '-0.25% Fed Rate · +0.3% GDP · +0.25% Inflation',
  },
  {
    id: 'fed_neutral',
    title: 'Affirm Central Bank Independence & Data Hold',
    stanceRequested: 'Neutral',
    summary:
      'Publicly back FOMC independence and steady rates, calming fixed-income desks and reinforcing long-term dollar credibility.',
    rateDelta: 0,
    gdpDelta: 0.05,
    inflationDelta: -0.1,
    approvalDelta: 0.4,
    chairNote:
      'FOMC maintained its benchmark target rate with White House backing for data-dependent central bank independence.',
    tradeoffLabel: '0.00% Rate · -0.10% Inflation · Market Stability',
  },
  {
    id: 'fed_hawkish',
    title: 'Endorse Tighter Rates to Crush Inflation',
    stanceRequested: 'Hawkish',
    summary:
      'Signal full Oval Office tolerance for tighter monetary policy to anchor inflation expectations, trading short-term growth for disinflation.',
    rateDelta: 0.25,
    gdpDelta: -0.25,
    inflationDelta: -0.35,
    approvalDelta: -0.6,
    chairNote:
      'With rare executive backing against inflation, the Federal Reserve nudged rates +25 bps to cool demand.',
    tradeoffLabel: '+0.25% Fed Rate · -0.35% Inflation · -0.25% GDP',
  },
];

export const JUDICIAL_NOMINATION_OPTIONS: JudicialNominationOption[] = [
  {
    id: 'jud_bipartisan',
    title: 'Nominate Consensus Circuit & District Judges',
    summary:
      'Advance a slate of widely respected moderate jurists with strong American Bar Association ratings to clear appellate backlogs.',
    congressCost: 2.5,
    approvalDelta: 0.7,
    shiftsClimateTowardFavorable: true,
    courtNote:
      'Senate confirmed a bipartisan slate of appellate and district judges, easing constitutional friction over executive orders.',
    tradeoffLabel: '-2.5% Congress · +0.7% Approval · Improves Judicial Climate',
  },
  {
    id: 'jud_aligned',
    title: 'Push Ideologically Aligned Appellate & SCOTUS Slate',
    summary:
      'Expend substantial Senate political capital on doctrinal constitutional nominees who strongly back broad executive authority.',
    congressCost: 5.5,
    approvalDelta: -0.5,
    shiftsClimateTowardFavorable: true,
    courtNote:
      'After intense Judiciary Committee hearings, your doctrinal nominees were seated, shifting federal bench alignment in your favor.',
    tradeoffLabel: '-5.5% Congress · -0.5% Approval · Strongest Judicial Shift',
  },
];

export function shiftJudiciaryClimate(
  current: InstitutionalState['judiciaryClimate'],
  towardFavorable: boolean
): InstitutionalState['judiciaryClimate'] {
  if (!towardFavorable) return current;
  if (current === 'Hostile') return 'Split';
  if (current === 'Split') return 'Favorable';
  return 'Favorable';
}
