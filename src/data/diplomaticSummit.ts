import {
  DiplomaticSummitChoice,
  DiplomaticSummitOutcome,
  DiplomaticSummitPower,
  DiplomaticSummitRound,
  DiplomaticSummitTone,
  NationalMetrics,
} from '../types/game';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const SUMMIT_FOREIGN_POWERS: DiplomaticSummitPower[] = [
  {
    id: 'china',
    country: 'China',
    summitTitle: 'Camp David Strategic Stability & Trade Summit',
    counterpartName: 'Premier Li Wei',
    counterpartTitle: 'Head of Delegation, Beijing',
    postureLabel: 'Strategic Rival',
    coreIssue:
      'Maritime hotline protocols in the South China Sea, fentanyl precursor enforcement, and reciprocal tariff guardrails.',
    baseTrust: 34,
    baseWalkoutRiskPct: 24,
    secondaryMetricLabel: 'Trade & Supply-Chain Stability',
  },
  {
    id: 'eu',
    country: 'European Union',
    summitTitle: 'Transatlantic Industrial & Security Compact',
    counterpartName: 'President Elena Lindholm',
    counterpartTitle: 'European Council & Commission Chair',
    postureLabel: 'Key Ally',
    coreIssue:
      'Harmonizing clean-tech subsidies, NATO burden-sharing commitments, and joint digital trade rules.',
    baseTrust: 58,
    baseWalkoutRiskPct: 9,
    secondaryMetricLabel: 'Allied Economic Coordination',
  },
  {
    id: 'japan_korea',
    country: 'Japan & South Korea',
    summitTitle: 'Pacific Deterrence & Semiconductor Accord',
    counterpartName: 'Prime Minister Kenji Takahashi',
    counterpartTitle: 'Trilateral Allied Envoy, Tokyo–Seoul',
    postureLabel: 'Key Ally',
    coreIssue:
      'Extended nuclear deterrence assurances, resilient chip fabrication supply chains, and joint naval patrols.',
    baseTrust: 62,
    baseWalkoutRiskPct: 7,
    secondaryMetricLabel: 'Indo-Pacific Deterrence & Chips',
  },
  {
    id: 'india',
    country: 'India',
    summitTitle: 'New Delhi–Washington Defense & Tech Dialogue',
    counterpartName: 'Prime Minister Vikram Deshmukh',
    counterpartTitle: 'Prime Minister of India',
    postureLabel: 'Competitive Partner',
    coreIssue:
      'Jet-engine co-production, Indian Ocean maritime surveillance, and agricultural tariff compromises.',
    baseTrust: 50,
    baseWalkoutRiskPct: 13,
    secondaryMetricLabel: 'Emerging Market Growth Corridor',
  },
  {
    id: 'gulf_coalition',
    country: 'Saudi Arabia & Gulf Coalition',
    summitTitle: 'Red Sea Security & Energy Stabilization Summit',
    counterpartName: 'Crown Prince Tariq Al-Mansoor',
    counterpartTitle: 'Gulf Cooperation Council Chair',
    postureLabel: 'Competitive Partner',
    coreIssue:
      'Crude output stability to cool global inflation, Red Sea shipping escorts, and bilateral defense guarantees.',
    baseTrust: 44,
    baseWalkoutRiskPct: 17,
    secondaryMetricLabel: 'Global Energy & CPI Inflation Relief',
  },
  {
    id: 'ukraine_flank',
    country: 'Ukraine & Eastern Flank',
    summitTitle: 'Eastern Security Guarantee & Reconstruction Forum',
    counterpartName: 'President Olena Kovalenko',
    counterpartTitle: 'Joint Eastern Flank Delegation',
    postureLabel: 'Key Ally',
    coreIssue:
      'Long-term air defense replenishment, Black Sea grain corridor protection, and frozen-asset reconstruction financing.',
    baseTrust: 55,
    baseWalkoutRiskPct: 12,
    secondaryMetricLabel: 'Alliance Credibility & Deterrence',
  },
];

export function computeInitialSummitMetrics(
  power: DiplomaticSummitPower,
  metrics: NationalMetrics,
  stateSecCompetence: number
): { startingTrust: number; baseWalkoutRiskPct: number } {
  const standingShift = Math.round((metrics.diplomaticStanding - 55) * 0.25);
  const secShift = Math.round((stateSecCompetence - 65) * 0.2);

  const startingTrust = clamp(
    power.baseTrust + standingShift + secShift,
    20,
    82
  );
  const baseWalkoutRiskPct = clamp(
    power.baseWalkoutRiskPct -
      Math.round((metrics.diplomaticStanding - 55) * 0.15) -
      Math.round((stateSecCompetence - 65) * 0.12),
    4,
    45
  );

  return { startingTrust, baseWalkoutRiskPct };
}

export function buildSummitRound1(
  power: DiplomaticSummitPower,
  startingTrust: number
): DiplomaticSummitRound {
  const isRival = power.postureLabel === 'Strategic Rival';
  return {
    roundNumber: 1,
    stageTitle: 'Round 1 · Opening Bilateral Protocol',
    counterpartPrompt: isRival
      ? `${power.counterpartName} arrives with a cautious diplomatic team: "Our capital expects concrete guardrails before discussing ${power.coreIssue.toLowerCase()} How does Washington intend to set the tone today?"`
      : `${power.counterpartName} opens the closed-door session (starting trust ${startingTrust}/100): "We welcome this summit on ${power.coreIssue.toLowerCase()}, though our parliament expects tangible reciprocity from Washington."`,
    choices: [
      {
        id: 'r1_mutual_framework',
        label: 'Propose Confidence-Building Guardrails First',
        tone: 'conciliatory',
        description:
          'Open with direct crisis hotlines, working-group milestones, and shared deference to sovereign red lines.',
        trustDelta: isRival ? 12 : 10,
        walkoutRiskDelta: -5,
        standingBonus: 1.4,
        approvalDelta: 0.2,
        gdpDelta: 0.04,
        inflationDelta: 0,
      },
      {
        id: 'r1_reciprocal_compact',
        label: 'Table a Structured Reciprocal Package',
        tone: 'pragmatic',
        description:
          'Pair clear security benchmarks with targeted market access and joint verification schedules.',
        trustDelta: 9,
        walkoutRiskDelta: -2,
        standingBonus: 1.8,
        approvalDelta: 0.4,
        gdpDelta: 0.08,
        inflationDelta: power.id === 'gulf_coalition' ? -0.06 : 0,
      },
      {
        id: 'r1_leverage_opening',
        label: 'Lead With Sanctions & Deterrence Leverage',
        tone: 'assertive',
        description:
          'Signal immediate readiness to tighten export controls or tariffs unless core U.S. demands are met upfront.',
        trustDelta: isRival ? -7 : -4,
        walkoutRiskDelta: isRival ? 14 : 9,
        standingBonus: 0.9,
        approvalDelta: 0.7,
        gdpDelta: -0.02,
        inflationDelta: 0.03,
      },
    ],
  };
}

export function buildSummitRound2(
  power: DiplomaticSummitPower,
  round1Tone: DiplomaticSummitTone,
  currentTrust: number
): DiplomaticSummitRound {
  const isRival = power.postureLabel === 'Strategic Rival';
  const counterpartPrompt =
    round1Tone === 'assertive'
      ? `${power.counterpartName} stiffens across the table (Trust ${currentTrust}/100): "Pressure tactics will not produce signatures in our capital. Offer a balanced mechanism on ${power.coreIssue.toLowerCase()}, or we scale back the communiqué."`
      : round1Tone === 'conciliatory'
      ? `${power.counterpartName} leans forward (Trust ${currentTrust}/100): "Your tone lowers tensions, but critics at home warn against vague pledges. What enforcement or economic incentive anchors this deal?"`
      : `${power.counterpartName} reviews the draft annex (Trust ${currentTrust}/100): "Our negotiators see a viable framework, provided we settle compliance timelines and dispute arbitration cleanly."`;

  return {
    roundNumber: 2,
    stageTitle: 'Round 2 · Core Deadlock Bargaining',
    counterpartPrompt,
    choices: [
      {
        id: 'r2_verify_phased',
        label: 'Lock In Phased Verification & Dispute Panel',
        tone: 'pragmatic',
        description:
          'Condition each U.S. concession on verifiable quarterly milestones reviewed by joint technical inspectors.',
        trustDelta: 11,
        walkoutRiskDelta: -4,
        standingBonus: 2.1,
        approvalDelta: 0.5,
        gdpDelta: 0.07,
        inflationDelta: power.id === 'gulf_coalition' ? -0.08 : -0.02,
      },
      {
        id: 'r2_economic_sweetener',
        label: 'Extend Targeted Tariff & Export Relief',
        tone: 'conciliatory',
        description:
          'Offer selective tariff suspensions and strategic financing to win swift signature from their delegation.',
        trustDelta: isRival ? 14 : 13,
        walkoutRiskDelta: -7,
        standingBonus: 1.7,
        approvalDelta: -0.3,
        gdpDelta: 0.12,
        inflationDelta: -0.05,
      },
      {
        id: 'r2_firm_ultimatum',
        label: 'Hold Hard Red Lines Without Concessions',
        tone: 'assertive',
        description:
          'Refuse tariff or security concessions and demand unilateral compliance before finalizing the communiqué.',
        trustDelta: -9,
        walkoutRiskDelta: isRival ? 18 : 13,
        standingBonus: 0.4,
        approvalDelta: 0.6,
        gdpDelta: -0.04,
        inflationDelta: 0.04,
      },
    ],
  };
}

export function buildSummitRound3(
  power: DiplomaticSummitPower,
  currentTrust: number,
  walkoutRiskPct: number
): DiplomaticSummitRound {
  const strained = currentTrust < 46 || walkoutRiskPct >= 28;
  return {
    roundNumber: 3,
    stageTitle: 'Round 3 · Final Joint Communiqué',
    counterpartPrompt: strained
      ? `Drafting teams are deadlocked late into the night (Trust ${currentTrust}/100 · Walkout Risk ${walkoutRiskPct}%). ${power.counterpartName} awaits your final instruction before cameras enter the Treaty Room.`
      : `Delegations have cleared most bracketed text (Trust ${currentTrust}/100 · Walkout Risk ${walkoutRiskPct}%). ${power.counterpartName} asks how ambitious a joint statement you are prepared to sign.`,
    choices: [
      {
        id: 'r3_ambitious_treaty',
        label: 'Sign Full Strategic Summit Accord',
        tone: 'pragmatic',
        description:
          'Commit both capitals to a comprehensive bilateral pact with public diplomatic standing guarantees.',
        trustDelta: 10,
        walkoutRiskDelta: strained ? 9 : 2,
        standingBonus: 2.8,
        approvalDelta: 0.8,
        gdpDelta: 0.1,
        inflationDelta: power.id === 'gulf_coalition' ? -0.07 : 0,
      },
      {
        id: 'r3_interim_communique',
        label: 'Adopt Face-Saving Interim Framework',
        tone: 'conciliatory',
        description:
          'Lock in lower-risk technical agreements now and defer divisive disputes to working-level envoys.',
        trustDelta: 7,
        walkoutRiskDelta: -8,
        standingBonus: 1.6,
        approvalDelta: 0.3,
        gdpDelta: 0.04,
        inflationDelta: 0,
      },
      {
        id: 'r3_walk_away_firm',
        label: 'Decline Signature & Issue Solo Press Statement',
        tone: 'assertive',
        description:
          'End talks without concessions to protect domestic leverage, accepting lower diplomatic momentum.',
        trustDelta: -6,
        walkoutRiskDelta: -10,
        standingBonus: -1.8,
        approvalDelta: 0.9,
        gdpDelta: -0.03,
        inflationDelta: 0.02,
      },
    ],
  };
}

export function evaluateDiplomaticSummit(params: {
  power: DiplomaticSummitPower;
  month: number;
  startingTrust: number;
  baseWalkoutRiskPct: number;
  choices: DiplomaticSummitChoice[];
}): DiplomaticSummitOutcome {
  const { power, month, startingTrust, baseWalkoutRiskPct, choices } = params;

  const trustSum = choices.reduce((acc, c) => acc + c.trustDelta, 0);
  const riskSum = choices.reduce((acc, c) => acc + c.walkoutRiskDelta, 0);
  const finalTrust = clamp(startingTrust + trustSum, 10, 100);
  const walkoutRiskPct = clamp(
    Math.round(baseWalkoutRiskPct + riskSum),
    2,
    70
  );

  const finalChoice = choices[choices.length - 1];
  const declinedSignature = finalChoice?.id === 'r3_walk_away_firm';

  // Roll walkout only if the player pushed for an accord while walkout risk remained elevated
  const walkedOut =
    !declinedSignature &&
    walkoutRiskPct >= 16 &&
    Math.random() * 100 < walkoutRiskPct;

  if (walkedOut) {
    return {
      id: `summit-${power.id}-m${month}-${Date.now()}`,
      powerId: power.id,
      country: power.country,
      summitTitle: power.summitTitle,
      counterpartName: power.counterpartName,
      month,
      verdict: 'Summit Walkout',
      walkedOut: true,
      finalTrust: clamp(finalTrust - 14, 8, 90),
      walkoutRiskPct,
      diplomaticDelta: -3.2,
      approvalDelta: -1.1,
      gdpDelta: -0.08,
      inflationDelta: 0.05,
      headline: `${power.country} Delegation Walks Out of ${power.summitTitle}`,
      summary: `Sharp disagreements over ${power.coreIssue.toLowerCase()} triggered a premature walkout by ${power.counterpartName} (${walkoutRiskPct}% brinkmanship risk). Allied capitals urged renewed back-channel calm.`,
    };
  }

  if (declinedSignature) {
    return {
      id: `summit-${power.id}-m${month}-${Date.now()}`,
      powerId: power.id,
      country: power.country,
      summitTitle: power.summitTitle,
      counterpartName: power.counterpartName,
      month,
      verdict: 'Stalled Talks',
      walkedOut: false,
      finalTrust,
      walkoutRiskPct,
      diplomaticDelta: -1.2,
      approvalDelta: 0.9,
      gdpDelta: -0.02,
      inflationDelta: 0.02,
      headline: `President Declines Unfavorable Terms at ${power.country} Summit`,
      summary: `Talks adjourned without a joint treaty after the White House refused last-minute concessions on ${power.coreIssue.toLowerCase()}. Hawks praised the firm posture while foreign ministries noted stalled momentum.`,
    };
  }

  const standingRaw = choices.reduce((acc, c) => acc + c.standingBonus, 0);
  const approvalRaw = choices.reduce((acc, c) => acc + c.approvalDelta, 0);
  const gdpRaw = choices.reduce((acc, c) => acc + c.gdpDelta, 0);
  const inflationRaw = choices.reduce((acc, c) => acc + c.inflationDelta, 0);

  const breakthrough =
    finalTrust >= 70 && finalChoice?.id === 'r3_ambitious_treaty';

  const diplomaticDelta = Number(
    clamp(standingRaw + (breakthrough ? 1.2 : 0), 1.5, 7.5).toFixed(1)
  );
  const approvalDelta = Number(clamp(approvalRaw, -0.8, 2.2).toFixed(1));
  const gdpDelta = Number(clamp(gdpRaw, -0.1, 0.35).toFixed(2));
  const inflationDelta = Number(clamp(inflationRaw, -0.25, 0.15).toFixed(2));

  const verdict: DiplomaticSummitOutcome['verdict'] = breakthrough
    ? 'Historic Breakthrough Treaty'
    : 'Constructive Joint Communiqué';

  const treatyTitle = breakthrough
    ? `${power.country} Strategic Accord (${power.summitTitle})`
    : `${power.country} Bilateral Framework Communiqué`;

  return {
    id: `summit-${power.id}-m${month}-${Date.now()}`,
    powerId: power.id,
    country: power.country,
    summitTitle: power.summitTitle,
    counterpartName: power.counterpartName,
    month,
    verdict,
    walkedOut: false,
    finalTrust,
    walkoutRiskPct,
    diplomaticDelta,
    approvalDelta,
    gdpDelta,
    inflationDelta,
    treatyTitle,
    headline: breakthrough
      ? `Historic Breakthrough: U.S. & ${power.country} Sign ${power.summitTitle}`
      : `U.S. and ${power.country} Issue Joint Communiqué After High-Stakes Summit`,
    summary: breakthrough
      ? `Three rounds of disciplined diplomacy with ${power.counterpartName} lifted trust to ${finalTrust}/100, securing binding commitments on ${power.coreIssue.toLowerCase()} (+${diplomaticDelta.toFixed(1)} Diplomatic Standing).`
      : `Patient bargaining with ${power.counterpartName} yielded an actionable bilateral framework on ${power.coreIssue.toLowerCase()} (+${diplomaticDelta.toFixed(1)} Diplomatic Standing).`,
  };
}
