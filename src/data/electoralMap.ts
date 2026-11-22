import {
  BattlegroundStateProjection,
  NationalMetrics,
  PartyId,
  ReelectionCampaignState,
  VoterBlocs,
} from '../types/game';

interface StateTemplate {
  code: string;
  name: string;
  electoralVotes: number;
  primaryBlocKey: keyof VoterBlocs;
  primaryBlocLabel: string;
  partisanLeanDem: number; // baseline lean (>0 leans Dem, <0 leans Rep)
  weights: Record<keyof VoterBlocs, number>;
}

const BATTLEGROUND_TEMPLATES: StateTemplate[] = [
  {
    code: 'PA',
    name: 'Pennsylvania',
    electoralVotes: 19,
    primaryBlocKey: 'workingClass',
    primaryBlocLabel: 'Working Class & Industrial Counties',
    partisanLeanDem: 0.4,
    weights: {
      workingClass: 0.4,
      suburbanModerates: 0.3,
      seniors: 0.15,
      youngVoters: 0.1,
      techFinance: 0.05,
    },
  },
  {
    code: 'MI',
    name: 'Michigan',
    electoralVotes: 15,
    primaryBlocKey: 'workingClass',
    primaryBlocLabel: 'Auto & Union Households',
    partisanLeanDem: 1.0,
    weights: {
      workingClass: 0.38,
      suburbanModerates: 0.27,
      youngVoters: 0.2,
      seniors: 0.1,
      techFinance: 0.05,
    },
  },
  {
    code: 'WI',
    name: 'Wisconsin',
    electoralVotes: 10,
    primaryBlocKey: 'suburbanModerates',
    primaryBlocLabel: 'Suburban Swing & Dairy Belt',
    partisanLeanDem: 0.2,
    weights: {
      suburbanModerates: 0.36,
      workingClass: 0.34,
      seniors: 0.15,
      youngVoters: 0.1,
      techFinance: 0.05,
    },
  },
  {
    code: 'NC',
    name: 'North Carolina',
    electoralVotes: 16,
    primaryBlocKey: 'techFinance',
    primaryBlocLabel: 'Research Triangle & Metro Suburbs',
    partisanLeanDem: -1.6,
    weights: {
      suburbanModerates: 0.3,
      techFinance: 0.25,
      seniors: 0.2,
      youngVoters: 0.15,
      workingClass: 0.1,
    },
  },
  {
    code: 'GA',
    name: 'Georgia',
    electoralVotes: 16,
    primaryBlocKey: 'youngVoters',
    primaryBlocLabel: 'Atlanta Metro & Young Turnout',
    partisanLeanDem: -0.7,
    weights: {
      youngVoters: 0.3,
      suburbanModerates: 0.3,
      techFinance: 0.2,
      workingClass: 0.1,
      seniors: 0.1,
    },
  },
  {
    code: 'AZ',
    name: 'Arizona',
    electoralVotes: 11,
    primaryBlocKey: 'seniors',
    primaryBlocLabel: 'Sunbelt Retirees & Maricopa Independents',
    partisanLeanDem: -0.9,
    weights: {
      seniors: 0.3,
      suburbanModerates: 0.35,
      youngVoters: 0.15,
      techFinance: 0.1,
      workingClass: 0.1,
    },
  },
  {
    code: 'NV',
    name: 'Nevada',
    electoralVotes: 6,
    primaryBlocKey: 'workingClass',
    primaryBlocLabel: 'Service & Hospitality Workforce',
    partisanLeanDem: 0.6,
    weights: {
      workingClass: 0.38,
      youngVoters: 0.22,
      suburbanModerates: 0.2,
      seniors: 0.12,
      techFinance: 0.08,
    },
  },
  {
    code: 'OH',
    name: 'Ohio',
    electoralVotes: 17,
    primaryBlocKey: 'workingClass',
    primaryBlocLabel: 'Manufacturing & Senior Voters',
    partisanLeanDem: -4.2,
    weights: {
      workingClass: 0.42,
      seniors: 0.26,
      suburbanModerates: 0.2,
      techFinance: 0.07,
      youngVoters: 0.05,
    },
  },
];

// Total EV = 538. Battlegrounds above sum to 110 EV.
// Remaining 428 EV split between base Democratic (226 EV) and base Republican (202 EV).
export function computeElectoralForecast(
  party: PartyId,
  metrics: NationalMetrics,
  blocs: VoterBlocs,
  campaign: ReelectionCampaignState
): {
  incumbentBaseEV: number;
  challengerBaseEV: number;
  incumbentTotalEV: number;
  challengerTotalEV: number;
  tossupEV: number;
  states: BattlegroundStateProjection[];
} {
  const incumbentBaseEV =
    party === 'democratic' ? 226 : party === 'republican' ? 219 : 180;
  const challengerBaseEV =
    party === 'democratic' ? 202 : party === 'republican' ? 209 : 248;

  const econAdjustment =
    (metrics.gdpGrowth - 2.1) * 1.1 - Math.max(0, metrics.inflation - 2.9) * 1.2;
  const nationalAdjustment =
    (metrics.approval - 49) * 0.42 +
    econAdjustment +
    campaign.campaignMomentum * 0.24;

  const states: BattlegroundStateProjection[] = BATTLEGROUND_TEMPLATES.map(
    (tpl) => {
      const blocScore =
        blocs.workingClass * tpl.weights.workingClass +
        blocs.suburbanModerates * tpl.weights.suburbanModerates +
        blocs.techFinance * tpl.weights.techFinance +
        blocs.seniors * tpl.weights.seniors +
        blocs.youngVoters * tpl.weights.youngVoters;

      const blocAdjustment = (blocScore - 50) * 0.35;
      const partyDirectionalLean =
        party === 'democratic'
          ? tpl.partisanLeanDem
          : party === 'republican'
          ? -tpl.partisanLeanDem
          : tpl.partisanLeanDem * 0.2;

      const rawMargin =
        partyDirectionalLean + nationalAdjustment + blocAdjustment;
      const margin = Number(Math.max(-18, Math.min(18, rawMargin)).toFixed(1));

      const status: BattlegroundStateProjection['status'] =
        margin >= 4.5
          ? 'Likely Incumbent'
          : margin >= 1.4
          ? 'Lean Incumbent'
          : margin > -1.4
          ? 'Toss-Up'
          : margin > -4.5
          ? 'Lean Challenger'
          : 'Likely Challenger';

      const blocVal = blocs[tpl.primaryBlocKey];
      const headlineNote =
        margin >= 1.4
          ? `${tpl.primaryBlocLabel} backing (${blocVal.toFixed(
              0
            )}%) keeps your coalition ahead.`
          : margin <= -1.4
          ? `Slippage among ${tpl.primaryBlocLabel.toLowerCase()} (${blocVal.toFixed(
              0
            )}%) favors the challenger.`
          : `Razor-thin margin driven by ${tpl.primaryBlocLabel.toLowerCase()} (${blocVal.toFixed(
              0
            )}%).`;

      return {
        code: tpl.code,
        name: tpl.name,
        electoralVotes: tpl.electoralVotes,
        primaryBlocKey: tpl.primaryBlocKey,
        primaryBlocLabel: tpl.primaryBlocLabel,
        margin,
        status,
        headlineNote,
      };
    }
  );

  let incumbentBattlegroundEV = 0;
  let challengerBattlegroundEV = 0;
  let tossupEV = 0;

  for (const s of states) {
    if (s.margin >= 1.4) {
      incumbentBattlegroundEV += s.electoralVotes;
    } else if (s.margin <= -1.4) {
      challengerBattlegroundEV += s.electoralVotes;
    } else {
      tossupEV += s.electoralVotes;
    }
  }

  return {
    incumbentBaseEV,
    challengerBaseEV,
    incumbentTotalEV: incumbentBaseEV + incumbentBattlegroundEV,
    challengerTotalEV: challengerBaseEV + challengerBattlegroundEV,
    tossupEV,
    states,
  };
}
