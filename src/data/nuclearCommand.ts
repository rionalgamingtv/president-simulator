import {
  MilitaryCommandState,
  NationalMetrics,
  NewsHeadlineItem,
  VoterBlocs,
} from '../types/game';

export type NuclearTargetCategory = 'country' | 'state';
export type NuclearStrikeProfileId = 'tactical' | 'strategic' | 'triad';

export interface UsStateTarget {
  code: string;
  name: string;
  region: string;
}

export interface NuclearStrikeProfile {
  id: NuclearStrikeProfileId;
  label: string;
  delivery: string;
  yieldLabel: string;
  description: string;
}

export interface NuclearStrikeRecord {
  id: string;
  month: number;
  targetCategory: NuclearTargetCategory;
  targetName: string;
  profileId: NuclearStrikeProfileId;
  profileLabel: string;
  requireCongressApproval: boolean;
  congressApproved: boolean | null;
  executed: boolean;
  senateYea: number | null;
  senateNay: number | null;
  houseYea: number | null;
  houseNay: number | null;
  warPowersStatus:
    | 'Congressional Authorization Passed'
    | 'Blocked by Congress'
    | 'Unilateral Executive Strike (Bypassed Congress)';
  headline: string;
  summary: string;
  majorityLeaderQuote: string;
  oppositionLeaderQuote: string;
  cabinetLoyaltyDelta: number;
  metricDeltas: {
    approval: number;
    congressSupport: number;
    diplomaticStanding: number;
    gdpGrowth: number;
    inflation: number;
    forceReadiness: number;
  };
  blocDeltas: Partial<VoterBlocs>;
  mediaHeadline: NewsHeadlineItem;
}

export const US_STATES: UsStateTarget[] = [
  { code: 'AL', name: 'Alabama', region: 'South' },
  { code: 'AK', name: 'Alaska', region: 'Pacific' },
  { code: 'AZ', name: 'Arizona', region: 'Southwest' },
  { code: 'AR', name: 'Arkansas', region: 'South' },
  { code: 'CA', name: 'California', region: 'West Coast' },
  { code: 'CO', name: 'Colorado', region: 'Mountain West' },
  { code: 'CT', name: 'Connecticut', region: 'Northeast' },
  { code: 'DE', name: 'Delaware', region: 'Mid-Atlantic' },
  { code: 'DC', name: 'District of Columbia', region: 'Capital' },
  { code: 'FL', name: 'Florida', region: 'South' },
  { code: 'GA', name: 'Georgia', region: 'South' },
  { code: 'HI', name: 'Hawaii', region: 'Pacific' },
  { code: 'ID', name: 'Idaho', region: 'Mountain West' },
  { code: 'IL', name: 'Illinois', region: 'Midwest' },
  { code: 'IN', name: 'Indiana', region: 'Midwest' },
  { code: 'IA', name: 'Iowa', region: 'Midwest' },
  { code: 'KS', name: 'Kansas', region: 'Plains' },
  { code: 'KY', name: 'Kentucky', region: 'South' },
  { code: 'LA', name: 'Louisiana', region: 'South' },
  { code: 'ME', name: 'Maine', region: 'Northeast' },
  { code: 'MD', name: 'Maryland', region: 'Mid-Atlantic' },
  { code: 'MA', name: 'Massachusetts', region: 'Northeast' },
  { code: 'MI', name: 'Michigan', region: 'Midwest' },
  { code: 'MN', name: 'Minnesota', region: 'Midwest' },
  { code: 'MS', name: 'Mississippi', region: 'South' },
  { code: 'MO', name: 'Missouri', region: 'Midwest' },
  { code: 'MT', name: 'Montana', region: 'Mountain West' },
  { code: 'NE', name: 'Nebraska', region: 'Plains' },
  { code: 'NV', name: 'Nevada', region: 'West' },
  { code: 'NH', name: 'New Hampshire', region: 'Northeast' },
  { code: 'NJ', name: 'New Jersey', region: 'Mid-Atlantic' },
  { code: 'NM', name: 'New Mexico', region: 'Southwest' },
  { code: 'NY', name: 'New York', region: 'Northeast' },
  { code: 'NC', name: 'North Carolina', region: 'South' },
  { code: 'ND', name: 'North Dakota', region: 'Plains' },
  { code: 'OH', name: 'Ohio', region: 'Midwest' },
  { code: 'OK', name: 'Oklahoma', region: 'Plains' },
  { code: 'OR', name: 'Oregon', region: 'West Coast' },
  { code: 'PA', name: 'Pennsylvania', region: 'Mid-Atlantic' },
  { code: 'RI', name: 'Rhode Island', region: 'Northeast' },
  { code: 'SC', name: 'South Carolina', region: 'South' },
  { code: 'SD', name: 'South Dakota', region: 'Plains' },
  { code: 'TN', name: 'Tennessee', region: 'South' },
  { code: 'TX', name: 'Texas', region: 'South' },
  { code: 'UT', name: 'Utah', region: 'Mountain West' },
  { code: 'VT', name: 'Vermont', region: 'Northeast' },
  { code: 'VA', name: 'Virginia', region: 'Mid-Atlantic' },
  { code: 'WA', name: 'Washington', region: 'West Coast' },
  { code: 'WV', name: 'West Virginia', region: 'Appalachia' },
  { code: 'WI', name: 'Wisconsin', region: 'Midwest' },
  { code: 'WY', name: 'Wyoming', region: 'Mountain West' },
];

export const FEATURED_US_STATE_NAMES = [
  'California',
  'Texas',
  'New York',
  'Florida',
  'Illinois',
  'Virginia',
  'Ohio',
  'Nevada',
];

export const FOREIGN_NUCLEAR_TARGETS = [
  'Russia',
  'China',
  'North Korea',
  'Iran',
  'Syria',
  'Venezuela',
  'Cuba',
  'Belarus',
  'Ukraine',
  'Pakistan',
  'India',
  'United Kingdom',
  'France',
  'Germany',
  'Japan',
  'South Korea',
  'Saudi Arabia',
  'Brazil',
  'Mexico',
  'Canada',
];

export const NUCLEAR_STRIKE_PROFILES: NuclearStrikeProfile[] = [
  {
    id: 'tactical',
    label: 'Tactical Low-Yield Strike',
    delivery: 'B61-12 Precision Gravity / Cruise',
    yieldLabel: '50 kt',
    description:
      'Localized tactical warhead targeting hardened military installations or command bunkers.',
  },
  {
    id: 'strategic',
    label: 'Strategic ICBM / SLBM Salvo',
    delivery: 'Minuteman III / Trident II D5',
    yieldLabel: '475 kt',
    description:
      'High-yield strategic warhead strike on major military-industrial infrastructure.',
  },
  {
    id: 'triad',
    label: 'Full Nuclear Triad First Strike',
    delivery: 'ICBM + SLBM + B-2 / B-21 Wings',
    yieldLabel: 'Multi-Megaton',
    description:
      'Maximum strategic nuclear exchange posture targeting broad command, missile, and population centers.',
  },
];

function clampNum(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function previewCongressNuclearVote(params: {
  targetCategory: NuclearTargetCategory;
  targetName: string;
  profileId: NuclearStrikeProfileId;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
}): {
  senateYea: number;
  senateNay: number;
  houseYea: number;
  houseNay: number;
  willPass: boolean;
  assessmentLabel: string;
} {
  const { targetCategory, profileId, metrics, military } = params;

  if (targetCategory === 'state') {
    const senateYea = clampNum(
      Math.round(2 + (metrics.congressSupport - 50) * 0.06),
      1,
      8
    );
    const houseYea = clampNum(
      Math.round(8 + (metrics.congressSupport - 50) * 0.2),
      4,
      28
    );
    return {
      senateYea,
      senateNay: 100 - senateYea,
      houseYea,
      houseNay: 435 - houseYea,
      willPass: false,
      assessmentLabel:
        'Bipartisan rejection expected: Congress will block domestic nuclear strikes on a U.S. state.',
    };
  }

  const threatBonus =
    military.intelThreatLevel === 'Severe'
      ? 14
      : military.intelThreatLevel === 'High'
      ? 8
      : military.intelThreatLevel === 'Elevated'
      ? 2
      : -4;
  const defconBonus =
    military.defconLevel === 1
      ? 16
      : military.defconLevel === 2
      ? 10
      : military.defconLevel === 3
      ? 3
      : -6;
  const profilePenalty =
    profileId === 'tactical' ? 0 : profileId === 'strategic' ? -7 : -14;

  const senateBase =
    26 +
    (metrics.senateSeats - 50) * 0.55 +
    (metrics.congressSupport - 50) * 0.42 +
    threatBonus +
    defconBonus +
    profilePenalty;

  const senateYea = clampNum(Math.round(senateBase), 6, 86);
  const houseRatio = clampNum(
    (senateBase + (metrics.houseSeats - 218) * 0.08) / 100,
    0.06,
    0.86
  );
  const houseYea = clampNum(Math.round(houseRatio * 435), 24, 375);
  const willPass = senateYea >= 51 && houseYea >= 218;

  return {
    senateYea,
    senateNay: 100 - senateYea,
    houseYea,
    houseNay: 435 - houseYea,
    willPass,
    assessmentLabel: willPass
      ? 'Hawks & coalition whip indicate narrow majority could pass authorization.'
      : 'Opposition + moderate caucus poised to block authorization on the floor.',
  };
}

export function evaluateNuclearStrike(params: {
  currentMonth: number;
  targetCategory: NuclearTargetCategory;
  targetName: string;
  profileId: NuclearStrikeProfileId;
  requireCongressApproval: boolean;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
}): NuclearStrikeRecord {
  const {
    currentMonth,
    targetCategory,
    targetName,
    profileId,
    requireCongressApproval,
    metrics,
    military,
  } = params;

  const cleanTarget = targetName.trim() || (targetCategory === 'state' ? 'California' : 'North Korea');
  const profile =
    NUCLEAR_STRIKE_PROFILES.find((p) => p.id === profileId) ||
    NUCLEAR_STRIKE_PROFILES[0];

  const severityMult =
    profileId === 'tactical' ? 1.0 : profileId === 'strategic' ? 1.35 : 1.75;

  if (requireCongressApproval) {
    const vote = previewCongressNuclearVote({
      targetCategory,
      targetName: cleanTarget,
      profileId,
      metrics,
      military,
    });

    if (!vote.willPass) {
      const approvalDrop = targetCategory === 'state' ? -11.5 : -4.2;
      const congressDrop = targetCategory === 'state' ? -14.0 : -6.5;
      const diplomacyDrop = targetCategory === 'state' ? -6.0 : -8.5;
      const headline =
        targetCategory === 'state'
          ? `Congress Overwhelmingly Blocks Proposal to Nuke ${cleanTarget}`
          : `Congress Rejects Nuclear Strike Authorization Against ${cleanTarget}`;
      const summary =
        targetCategory === 'state'
          ? `In a historic emergency session (${vote.senateYea}-${vote.senateNay} Senate, ${vote.houseYea}-${vote.houseNay} House), Congress vetoed the proposal to deploy nuclear weapons against ${cleanTarget}. No warheads were launched.`
          : `Capitol Hill voted down the nuclear authorization request targeting ${cleanTarget} (${vote.senateYea}-${vote.senateNay} Senate, ${vote.houseYea}-${vote.houseNay} House), halting launch execution at STRATCOM.`;

      return {
        id: `nuke-${currentMonth}-${Date.now()}`,
        month: currentMonth,
        targetCategory,
        targetName: cleanTarget,
        profileId,
        profileLabel: profile.label,
        requireCongressApproval: true,
        congressApproved: false,
        executed: false,
        senateYea: vote.senateYea,
        senateNay: vote.senateNay,
        houseYea: vote.houseYea,
        houseNay: vote.houseNay,
        warPowersStatus: 'Blocked by Congress',
        headline,
        summary,
        majorityLeaderQuote:
          targetCategory === 'state'
            ? `Using nuclear weapons on American soil in ${cleanTarget} is unthinkable and unconstitutional—Congress has stopped this order cold.`
            : `Both chambers refuse to hand over a blank check for nuclear escalation against ${cleanTarget} while diplomatic and conventional deterrence remain.`,
        oppositionLeaderQuote:
          `Even requesting nuclear authorization against ${cleanTarget} raises urgent questions about command judgment inside the White House.`,
        cabinetLoyaltyDelta: targetCategory === 'state' ? -12 : -5,
        metricDeltas: {
          approval: approvalDrop,
          congressSupport: congressDrop,
          diplomaticStanding: diplomacyDrop,
          gdpGrowth: -0.3,
          inflation: 0.2,
          forceReadiness: -1,
        },
        blocDeltas: {
          suburbanModerates: targetCategory === 'state' ? -10 : -4,
          youngVoters: targetCategory === 'state' ? -11 : -5,
          seniors: targetCategory === 'state' ? -8 : -3,
          techFinance: -4,
        },
        mediaHeadline: {
          id: `news-nuke-blk-${Date.now()}`,
          month: currentMonth,
          outlet: 'Capitol Dispatch',
          category: 'defense',
          headline,
          summary,
          tone: 'critical',
        },
      };
    }

    // Congress APPROVED foreign nuclear strike
    const approvalDelta = Number((-10 * severityMult).toFixed(1));
    const congressDelta = Number((-5 * severityMult).toFixed(1));
    const diplomacyDelta = Number((-28 * severityMult).toFixed(1));
    const gdpDelta = Number((-1.9 * severityMult).toFixed(2));
    const inflationDelta = Number((1.6 * severityMult).toFixed(2));
    const readinessDelta = -Math.round(8 * severityMult);

    const headline = `Congress Authorizes ${profile.label} Against ${cleanTarget}`;
    const summary = `Following an emergency closed-door vote (${vote.senateYea}-${vote.senateNay} Senate, ${vote.houseYea}-${vote.houseNay} House), U.S. Strategic Command executed a ${profile.label} against ${cleanTarget}, triggering DEFCON 1 alert and global market turmoil.`;

    return {
      id: `nuke-${currentMonth}-${Date.now()}`,
      month: currentMonth,
      targetCategory,
      targetName: cleanTarget,
      profileId,
      profileLabel: profile.label,
      requireCongressApproval: true,
      congressApproved: true,
      executed: true,
      senateYea: vote.senateYea,
      senateNay: vote.senateNay,
      houseYea: vote.houseYea,
      houseNay: vote.houseNay,
      warPowersStatus: 'Congressional Authorization Passed',
      headline,
      summary,
      majorityLeaderQuote: `Given the acute threat posture, Congress reluctantly granted statutory authorization for limited strategic action in ${cleanTarget}.`,
      oppositionLeaderQuote: `History will judge this Congress harshly for crossing the nuclear threshold against ${cleanTarget}.`,
      cabinetLoyaltyDelta: -6,
      metricDeltas: {
        approval: approvalDelta,
        congressSupport: congressDelta,
        diplomaticStanding: diplomacyDelta,
        gdpGrowth: gdpDelta,
        inflation: inflationDelta,
        forceReadiness: readinessDelta,
      },
      blocDeltas: {
        suburbanModerates: -Math.round(7 * severityMult),
        youngVoters: -Math.round(9 * severityMult),
        techFinance: -Math.round(8 * severityMult),
        seniors: -Math.round(4 * severityMult),
        workingClass: -Math.round(5 * severityMult),
      },
      mediaHeadline: {
        id: `news-nuke-auth-${Date.now()}`,
        month: currentMonth,
        outlet: 'Global Wire',
        category: 'defense',
        headline,
        summary,
        tone: 'critical',
      },
    };
  }

  // requireCongressApproval === false (UNILATERAL PRESIDENTIAL LAUNCH)
  if (targetCategory === 'state') {
    const headline = `UNILATERAL NUCLEAR STRIKE ON ${cleanTarget.toUpperCase()} WITHOUT CONGRESSIONAL APPROVAL`;
    const summary = `Bypassing Congress entirely, the White House transmitted unilateral nuclear launch codes targeting ${cleanTarget} (${profile.label}). Global markets crashed, NATO convened emergency sessions, and Capitol Hill initiated immediate impeachment proceedings.`;

    return {
      id: `nuke-${currentMonth}-${Date.now()}`,
      month: currentMonth,
      targetCategory: 'state',
      targetName: cleanTarget,
      profileId,
      profileLabel: profile.label,
      requireCongressApproval: false,
      congressApproved: null,
      executed: true,
      senateYea: null,
      senateNay: null,
      houseYea: null,
      houseNay: null,
      warPowersStatus: 'Unilateral Executive Strike (Bypassed Congress)',
      headline,
      summary,
      majorityLeaderQuote: `The President launched a nuclear weapon on ${cleanTarget} without consulting Congress. Both parties are drafting immediate Articles of Impeachment.`,
      oppositionLeaderQuote: `This is the gravest constitutional catastrophe in American history—every branch of government demands immediate removal from office.`,
      cabinetLoyaltyDelta: -28,
      metricDeltas: {
        approval: -38.0,
        congressSupport: -40.0,
        diplomaticStanding: -38.0,
        gdpGrowth: -4.5,
        inflation: 3.4,
        forceReadiness: -24,
      },
      blocDeltas: {
        workingClass: -24,
        suburbanModerates: -28,
        techFinance: -26,
        seniors: -24,
        youngVoters: -30,
      },
      mediaHeadline: {
        id: `news-nuke-dom-${Date.now()}`,
        month: currentMonth,
        outlet: 'Associated Wire',
        category: 'politics',
        headline,
        summary,
        tone: 'critical',
      },
    };
  }

  // Unilateral foreign strike (Checkbox OFF)
  const approvalDelta = Number((-16 * severityMult).toFixed(1));
  const congressDelta = Number((-20 * severityMult).toFixed(1));
  const diplomacyDelta = Number((-34 * severityMult).toFixed(1));
  const gdpDelta = Number((-2.3 * severityMult).toFixed(2));
  const inflationDelta = Number((1.9 * severityMult).toFixed(2));
  const readinessDelta = -Math.round(10 * severityMult);

  const headline = `President Launches Unilateral ${profile.label} on ${cleanTarget} Without Congress`;
  const summary = `Exercising sole nuclear launch authority with Congressional approval bypassed, the White House struck ${cleanTarget} (${profile.yieldLabel}). DEFCON shifted to Level 1 as Capitol Hill erupts over the War Powers bypass.`;

  return {
    id: `nuke-${currentMonth}-${Date.now()}`,
    month: currentMonth,
    targetCategory: 'country',
    targetName: cleanTarget,
    profileId,
    profileLabel: profile.label,
    requireCongressApproval: false,
    congressApproved: null,
    executed: true,
    senateYea: null,
    senateNay: null,
    houseYea: null,
    houseNay: null,
    warPowersStatus: 'Unilateral Executive Strike (Bypassed Congress)',
    headline,
    summary,
    majorityLeaderQuote: `Crossing the nuclear threshold against ${cleanTarget} without even notifying Congressional leadership shatters constitutional War Powers norms.`,
    oppositionLeaderQuote: `Unilateral nuclear action against ${cleanTarget} has triggered a severe constitutional standoff and global escalation.`,
    cabinetLoyaltyDelta: -14,
    metricDeltas: {
      approval: approvalDelta,
      congressSupport: congressDelta,
      diplomaticStanding: diplomacyDelta,
      gdpGrowth: gdpDelta,
      inflation: inflationDelta,
      forceReadiness: readinessDelta,
    },
    blocDeltas: {
      suburbanModerates: -Math.round(10 * severityMult),
      youngVoters: -Math.round(12 * severityMult),
      techFinance: -Math.round(11 * severityMult),
      seniors: -Math.round(6 * severityMult),
      workingClass: -Math.round(7 * severityMult),
    },
    mediaHeadline: {
      id: `news-nuke-uni-${Date.now()}`,
      month: currentMonth,
      outlet: 'Global Wire',
      category: 'defense',
      headline,
      summary,
      tone: 'critical',
    },
  };
}
