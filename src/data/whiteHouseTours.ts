import { VoterBlocs } from '../types/game';

export type TourScreeningPosture = 'standard' | 'tightened';

export interface WhiteHouseTourGroup {
  id: string;
  name: string;
  routeLabel: string;
  targetGroupsLabel: string;
  summary: string;
  securityNote: string;
  approvalBoost: number;
  readinessCost: number;
  blocImpacts: Partial<VoterBlocs>;
  headline: string;
  pressSummary: string;
}

export interface ScheduledWhiteHouseTourRecord {
  id: string;
  month: number;
  groupId: string;
  groupName: string;
  routeLabel: string;
  posture: TourScreeningPosture;
  approvalDelta: number;
  readinessDelta: number;
  headline: string;
}

export const WHITE_HOUSE_TOUR_GROUPS: WhiteHouseTourGroup[] = [
  {
    id: 'civic_youth',
    name: 'Public School & Civic Youth Groups',
    routeLabel: 'East Wing Colonnade & State Dining Room',
    targetGroupsLabel: 'Young Voters · Suburban Families',
    summary:
      'Welcomes high school civics classes and university fellows for guided history briefings along the State Floor.',
    securityNote:
      'Standard magnetometer screening along the East Wing visitor entrance with minimal West Wing disruption.',
    approvalBoost: 1.4,
    readinessCost: 1.5,
    blocImpacts: {
      youngVoters: 2.2,
      suburbanModerates: 1.2,
    },
    headline: 'President Opens East Wing to Nationwide Student Civic Tours',
    pressSummary:
      'Hundreds of student delegations toured the State Floor as the White House emphasized civic openness, drawing mild Secret Service staffing adjustments.',
  },
  {
    id: 'veterans_families',
    name: 'Veterans & Gold Star Families',
    routeLabel: 'Rose Garden, Cross Hall & Portrait Gallery',
    targetGroupsLabel: 'Seniors · Working Class',
    summary:
      'Hosts service members, veterans organizations, and Gold Star families for an honor-guard walkthrough and Rose Garden reception.',
    securityNote:
      'Honor guard ceremonial escort and Rose Garden perimeter access require temporary reallocation of Uniformed Division details.',
    approvalBoost: 1.8,
    readinessCost: 1.8,
    blocImpacts: {
      seniors: 2.4,
      workingClass: 1.6,
    },
    headline: 'Veterans and Gold Star Families Hosted for White House Tour',
    pressSummary:
      'The administration drew warm coverage after hosting veterans delegations in the Rose Garden while maintaining heightened perimeter patrols.',
  },
  {
    id: 'labor_unions',
    name: 'Trade Union & Manufacturing Delegations',
    routeLabel: 'Grand Foyer, Blue Room & South Lawn Pavilion',
    targetGroupsLabel: 'Working Class · Industrial Trades',
    summary:
      'Invites regional union stewards, builders, and plant workers for a working-class heritage tour and South Lawn photo opportunity.',
    securityNote:
      'Chartered motorcoach arrivals near the South Lawn require additional sweep teams and temporary readiness drawdowns.',
    approvalBoost: 1.6,
    readinessCost: 2.0,
    blocImpacts: {
      workingClass: 2.8,
    },
    headline: 'Trade Union Workers Tour White House Ahead of Industrial Agenda',
    pressSummary:
      'Manufacturing and building trades delegates praised White House hospitality during a South Lawn tour, though security liaisons noted extra screening demands.',
  },
  {
    id: 'chamber_founders',
    name: 'Small Business & Chamber Leaders',
    routeLabel: 'Roosevelt Room, Cabinet Viewing & State Parlors',
    targetGroupsLabel: 'Tech & Finance · Suburban Moderates',
    summary:
      'Provides Main Street business owners, founders, and local chamber chairs a close-up look at West Wing economic history.',
    securityNote:
      'High-access West Wing corridor passage increases Secret Service vetting load and draws down executive protection reserve readiness.',
    approvalBoost: 1.5,
    readinessCost: 2.2,
    blocImpacts: {
      techFinance: 2.4,
      suburbanModerates: 1.5,
    },
    headline: 'Main Street Founders & Business Leaders Tour West Wing',
    pressSummary:
      'Local chamber representatives welcomed direct West Wing access, even as Secret Service planners logged tighter protective rotations.',
  },
  {
    id: 'rural_coops',
    name: 'Rural & Agricultural Cooperative Families',
    routeLabel: 'Jacqueline Kennedy Garden & State Parlors',
    targetGroupsLabel: 'Working Class · Seniors',
    summary:
      'Welcomes family farmers, 4-H leaders, and rural electric cooperative representatives for seasonal garden and residence tours.',
    securityNote:
      'Extended open-air South Grounds tour routes require additional Uniformed Division observation posts.',
    approvalBoost: 1.7,
    readinessCost: 1.6,
    blocImpacts: {
      workingClass: 1.8,
      seniors: 1.8,
    },
    headline: 'Farm & Heartland Families Welcomed at White House Open House',
    pressSummary:
      'Rural cooperative delegations highlighted grassroots goodwill following the residence tour, paired with modest perimeter staffing strain.',
  },
  {
    id: 'open_lottery',
    name: 'Open Public Lottery & Press Walk-Through',
    routeLabel: 'Full State Floor, Briefing Room & North Lawn',
    targetGroupsLabel: 'Broad Public · Suburban, Youth & Seniors',
    summary:
      'Expands general public lottery passes across the residence and James S. Brady Briefing Room for maximum public transparency.',
    securityNote:
      'High-volume public foot traffic across North and South approaches temporarily stretches Secret Service readiness.',
    approvalBoost: 2.2,
    readinessCost: 3.0,
    blocImpacts: {
      suburbanModerates: 2.0,
      youngVoters: 1.5,
      seniors: 1.2,
    },
    headline:
      'White House Expands Open Public Lottery Tours Despite Security Strain',
    pressSummary:
      'Record public foot traffic boosted administration favorability across demographics while prompting security officials to trim readiness reserves.',
  },
];

export function computeTourProjection(
  group: WhiteHouseTourGroup,
  posture: TourScreeningPosture,
  intelThreatLevel: 'Guarded' | 'Elevated' | 'High' | 'Severe'
): {
  approvalDelta: number;
  readinessDelta: number;
  blocImpacts: Partial<VoterBlocs>;
  postureSummary: string;
} {
  const threatPenaltyMultiplier =
    intelThreatLevel === 'Severe'
      ? 1.3
      : intelThreatLevel === 'High'
      ? 1.15
      : 1.0;

  if (posture === 'tightened') {
    const approvalDelta = Number(
      Math.max(0.6, group.approvalBoost - 0.3).toFixed(1)
    );
    const readinessCost = Number(
      (group.readinessCost * 0.6 * threatPenaltyMultiplier).toFixed(1)
    );
    const scaledBlocs: Partial<VoterBlocs> = {};
    (Object.keys(group.blocImpacts) as (keyof VoterBlocs)[]).forEach((key) => {
      const val = group.blocImpacts[key];
      if (typeof val === 'number') {
        scaledBlocs[key] = Number((val * 0.8).toFixed(1));
      }
    });
    return {
      approvalDelta,
      readinessDelta: -readinessCost,
      blocImpacts: scaledBlocs,
      postureSummary:
        'Tightened perimeter screening trims readiness loss by 40% while slightly moderating public warmth due to longer security checkpoints.',
    };
  }

  const readinessCost = Number(
    (group.readinessCost * threatPenaltyMultiplier).toFixed(1)
  );
  return {
    approvalDelta: Number(group.approvalBoost.toFixed(1)),
    readinessDelta: -readinessCost,
    blocImpacts: { ...group.blocImpacts },
    postureSummary:
      'Standard public welcome delivers full approval and voter-bloc goodwill with normal Secret Service tour staffing.',
  };
}
