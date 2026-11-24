import { VoterBlocs } from '../types/game';

export type TradePostureId =
  | 'open_accord'
  | 'targeted_tariffs'
  | 'broad_wall'
  | 'friend_shoring';

export interface TradeCorridor {
  id: string;
  name: string;
  partners: string;
  annualVolumeLabel: string;
  keyImports: string;
  keyExports: string;
  currentFrictionNote: string;
}

export interface TradePostureOption {
  id: TradePostureId;
  label: string;
  tariffRateLabel: string;
  shortNote: string;
  gdpDelta: number;
  inflationDelta: number;
  debtDeltaTrillions: number; // negative = tariff revenue reduces deficit
  diplomaticDelta: number;
  approvalDelta: number;
  retaliationRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  blocImpacts: Partial<VoterBlocs>;
}

export const TRADE_CORRIDORS: TradeCorridor[] = [
  {
    id: 'indo_pacific',
    name: 'Indo-Pacific Tech & Manufacturing Corridor',
    partners: 'China, Taiwan, South Korea, Japan',
    annualVolumeLabel: '$1.35T Annual Two-Way Trade',
    keyImports: 'Semiconductors, consumer electronics, EV batteries, solar cells',
    keyExports: 'Soybeans, LNG, civilian aircraft, semiconductor tooling',
    currentFrictionNote:
      'Industrial overcapacity and advanced chip export controls keep retaliatory tension elevated.',
  },
  {
    id: 'transatlantic',
    name: 'Transatlantic Digital & Aerospace Pact',
    partners: 'European Union & United Kingdom',
    annualVolumeLabel: '$1.18T Annual Two-Way Trade',
    keyImports: 'Pharmaceuticals, precision machinery, luxury autos',
    keyExports: 'Cloud services, LNG, defense aerospace, agricultural goods',
    currentFrictionNote:
      'Digital services taxes and green steel subsidies require careful diplomatic balancing.',
  },
  {
    id: 'north_america',
    name: 'North American Manufacturing & Auto Compact',
    partners: 'Canada & Mexico (USMCA)',
    annualVolumeLabel: '$1.58T Annual Two-Way Trade',
    keyImports: 'Auto sub-assemblies, crude energy, fresh produce, lumber',
    keyExports: 'Refined fuels, industrial machinery, corn, financial services',
    currentFrictionNote:
      'Rules-of-origin audits and cross-border supply chains anchor domestic factory employment.',
  },
  {
    id: 'critical_minerals',
    name: 'Critical Minerals & Battery Alliance',
    partners: 'Australia, Chile, Indonesia, Sub-Saharan Partners',
    annualVolumeLabel: '$410B Strategic Mineral Flows',
    keyImports: 'Lithium, cobalt, copper, rare-earth magnet inputs',
    keyExports: 'Mining equipment, refining capital, clean-grid engineering',
    currentFrictionNote:
      'Securing non-adversarial mineral refining dictates long-term defense and EV competitiveness.',
  },
  {
    id: 'global_energy',
    name: 'Global Energy & Agri-Export Lanes',
    partners: 'India, Mercosur, Gulf & Maritime Allies',
    annualVolumeLabel: '$690B Commodity & Energy Flows',
    keyImports: 'Textiles, generic pharmaceuticals, specialty inputs',
    keyExports: 'Liquefied natural gas, wheat, defense hardware, grain',
    currentFrictionNote:
      'Maritime chokepoints and farm export tariffs directly shape swing-state farm incomes.',
  },
];

export const TRADE_POSTURE_OPTIONS: TradePostureOption[] = [
  {
    id: 'open_accord',
    label: 'Open Trade Accord',
    tariffRateLabel: '0%–4% Avg Tariff',
    shortNote: 'Lower consumer import costs and expand agricultural & services export access.',
    gdpDelta: 0.25,
    inflationDelta: -0.22,
    debtDeltaTrillions: 0.04,
    diplomaticDelta: 2.2,
    approvalDelta: 0.4,
    retaliationRisk: 'Low',
    blocImpacts: { techFinance: 2, suburbanModerates: 1, workingClass: -1 },
  },
  {
    id: 'targeted_tariffs',
    label: 'Targeted 25% Sector Tariffs',
    tariffRateLabel: '25% Strategic Rate',
    shortNote: 'Shield domestic steel, EVs, and legacy chips while keeping consumer staples untaxed.',
    gdpDelta: 0.05,
    inflationDelta: 0.12,
    debtDeltaTrillions: -0.06,
    diplomaticDelta: -1.1,
    approvalDelta: 0.9,
    retaliationRisk: 'Moderate',
    blocImpacts: { workingClass: 2, suburbanModerates: 1 },
  },
  {
    id: 'broad_wall',
    label: '60% Broad Tariff Wall',
    tariffRateLabel: '60% Universal Duty',
    shortNote: 'Aggressive customs revenue and reshoring pressure, risking consumer inflation & farm retaliation.',
    gdpDelta: -0.22,
    inflationDelta: 0.45,
    debtDeltaTrillions: -0.16,
    diplomaticDelta: -3.4,
    approvalDelta: -0.3,
    retaliationRisk: 'Severe',
    blocImpacts: { workingClass: 3, techFinance: -3, suburbanModerates: -2, seniors: -1 },
  },
  {
    id: 'friend_shoring',
    label: 'Export Controls & Friend-Shoring',
    tariffRateLabel: '12% Allied Compact',
    shortNote: 'Restrict dual-use frontier tech to rivals while subsidizing allied supply-chain hubs.',
    gdpDelta: 0.14,
    inflationDelta: 0.04,
    debtDeltaTrillions: -0.02,
    diplomaticDelta: 1.4,
    approvalDelta: 0.8,
    retaliationRisk: 'Moderate',
    blocImpacts: { techFinance: 2, workingClass: 1, youngVoters: 1 },
  },
];

export const DEFAULT_TRADE_STANCES: Record<string, TradePostureId> = {
  indo_pacific: 'targeted_tariffs',
  transatlantic: 'open_accord',
  north_america: 'open_accord',
  critical_minerals: 'friend_shoring',
  global_energy: 'open_accord',
};

export function summarizeTradePackage(
  stances: Record<string, TradePostureId>
): {
  gdpDelta: number;
  inflationDelta: number;
  debtDeltaTrillions: number;
  diplomaticDelta: number;
  approvalDelta: number;
  blocImpacts: Partial<VoterBlocs>;
  retaliationSummary: string;
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  headline: string;
  newsTone: 'positive' | 'neutral' | 'critical';
} {
  let gdpDelta = 0;
  let inflationDelta = 0;
  let debtDeltaTrillions = 0;
  let diplomaticDelta = 0;
  let approvalDelta = 0;
  const blocImpacts: Partial<VoterBlocs> = {
    workingClass: 0,
    suburbanModerates: 0,
    techFinance: 0,
    seniors: 0,
    youngVoters: 0,
  };

  let wallCount = 0;
  let targetedCount = 0;
  let openCount = 0;

  for (const corridor of TRADE_CORRIDORS) {
    const postureId = stances[corridor.id] || 'open_accord';
    const opt =
      TRADE_POSTURE_OPTIONS.find((o) => o.id === postureId) ||
      TRADE_POSTURE_OPTIONS[0];

    gdpDelta += opt.gdpDelta * 0.45;
    inflationDelta += opt.inflationDelta * 0.45;
    debtDeltaTrillions += opt.debtDeltaTrillions * 0.5;
    diplomaticDelta += opt.diplomaticDelta * 0.45;
    approvalDelta += opt.approvalDelta * 0.45;

    (Object.keys(opt.blocImpacts) as (keyof VoterBlocs)[]).forEach((k) => {
      blocImpacts[k] = (blocImpacts[k] || 0) + (opt.blocImpacts[k] || 0);
    });

    if (postureId === 'broad_wall') wallCount += 1;
    else if (postureId === 'targeted_tariffs') targetedCount += 1;
    else if (postureId === 'open_accord') openCount += 1;
  }

  // Clamp voter bloc shifts per enactment
  (Object.keys(blocImpacts) as (keyof VoterBlocs)[]).forEach((k) => {
    blocImpacts[k] = Math.max(-6, Math.min(6, Math.round((blocImpacts[k] || 0) * 0.55)));
  });

  const overallRisk: 'Low' | 'Moderate' | 'High' | 'Severe' =
    wallCount >= 2
      ? 'Severe'
      : wallCount === 1 || targetedCount >= 3
      ? 'High'
      : targetedCount >= 1
      ? 'Moderate'
      : 'Low';

  const retaliationSummary =
    wallCount >= 2
      ? 'Trading partners imposed immediate retaliatory agricultural and LNG counter-tariffs across key ports.'
      : wallCount === 1
      ? 'Targeted foreign ministries announced WTO dispute filings and selective farm-export countermeasures.'
      : openCount >= 3
      ? 'Allied trade ministries welcomed predictable rules, lifting export orders and stabilizing import prices.'
      : 'Corridor partners calibrated limited customs reciprocity while friend-shoring investment accelerated.';

  const headline =
    wallCount >= 2
      ? 'White House Unleashes Sweeping Tariff Wall, Triggering Global Retaliation Warnings'
      : wallCount === 1
      ? 'President Imposes Aggressive Corridor Tariffs as Customs Revenue Rises'
      : openCount >= 3
      ? 'Administration Seals Multi-Corridor Trade Accords to Ease Consumer Inflation'
      : 'White House Realigns Strategic Trade & Friend-Shoring Supply Chains';

  const newsTone: 'positive' | 'neutral' | 'critical' =
    overallRisk === 'Severe'
      ? 'critical'
      : gdpDelta > 0.25 && inflationDelta <= 0.1
      ? 'positive'
      : 'neutral';

  return {
    gdpDelta: Number(gdpDelta.toFixed(2)),
    inflationDelta: Number(inflationDelta.toFixed(2)),
    debtDeltaTrillions: Number(debtDeltaTrillions.toFixed(2)),
    diplomaticDelta: Number(diplomaticDelta.toFixed(1)),
    approvalDelta: Number(approvalDelta.toFixed(1)),
    blocImpacts,
    retaliationSummary,
    overallRisk,
    headline,
    newsTone,
  };
}
