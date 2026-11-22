import {
  BudgetAllocationInput,
  BudgetProjection,
  NationalMetrics,
} from '../types/game';

export const DEFAULT_BUDGET_ALLOCATION: BudgetAllocationInput = {
  defenseShiftPct: 4,
  infrastructureShiftPct: 6,
  taxReliefShiftPct: 4,
  deficitCurbPct: 5,
};

export const BUDGET_PRESETS: {
  id: string;
  label: string;
  subtitle: string;
  allocation: BudgetAllocationInput;
}[] = [
  {
    id: 'balanced_growth',
    label: 'Balanced Infrastructure & Tax Compact',
    subtitle: 'Modest infrastructure and family tax credits offset by spending curbs.',
    allocation: {
      defenseShiftPct: 3,
      infrastructureShiftPct: 8,
      taxReliefShiftPct: 6,
      deficitCurbPct: 7,
    },
  },
  {
    id: 'fiscal_hawk',
    label: 'Austerity & Debt Stabilization Act',
    subtitle: 'Aggressive deficit restraint to cool inflation and calm bond markets.',
    allocation: {
      defenseShiftPct: 0,
      infrastructureShiftPct: -6,
      taxReliefShiftPct: -4,
      deficitCurbPct: 18,
    },
  },
  {
    id: 'industrial_surge',
    label: 'Defense & Domestic Reindustrialization Surge',
    subtitle: 'Heavy defense modernization and grid/manufacturing outlays.',
    allocation: {
      defenseShiftPct: 15,
      infrastructureShiftPct: 14,
      taxReliefShiftPct: 2,
      deficitCurbPct: 0,
    },
  },
  {
    id: 'household_relief',
    label: 'Working-Family Tax & Cost Relief Package',
    subtitle: 'Broad tax cuts and energy rebates aimed at immediate household approval.',
    allocation: {
      defenseShiftPct: -2,
      infrastructureShiftPct: 4,
      taxReliefShiftPct: 16,
      deficitCurbPct: 2,
    },
  },
];

export function computeBudgetProjection(
  input: BudgetAllocationInput,
  metrics: NationalMetrics
): BudgetProjection {
  const def = input.defenseShiftPct;
  const infra = input.infrastructureShiftPct;
  const tax = input.taxReliefShiftPct;
  const curb = input.deficitCurbPct;

  const netStimulus = def * 0.025 + infra * 0.032 + tax * 0.036 - curb * 0.04;
  const debtDeltaTrillions = Number(
    Math.max(-0.9, Math.min(1.6, netStimulus)).toFixed(2)
  );

  const rawGdp =
    infra * 0.024 + tax * 0.018 + def * 0.01 - curb * 0.018;
  const gdpDelta = Number(Math.max(-0.9, Math.min(1.2, rawGdp)).toFixed(2));

  const rawInflation =
    (def * 0.008 + infra * 0.01 + tax * 0.015 - curb * 0.02) +
    (metrics.inflation > 4.5 && debtDeltaTrillions > 0.35 ? 0.12 : 0);
  const inflationDelta = Number(
    Math.max(-0.6, Math.min(0.8, rawInflation)).toFixed(2)
  );

  const rawApproval =
    tax * 0.12 +
    infra * 0.08 +
    def * 0.03 -
    curb * 0.07 -
    (debtDeltaTrillions > 0.8 ? 0.9 : 0);
  const approvalDelta = Number(
    Math.max(-4.0, Math.min(4.0, rawApproval)).toFixed(1)
  );

  // Congress rewards balanced offsets & dislikes extreme deficits or deep cuts
  const deficitPenalty = Math.max(0, debtDeltaTrillions - 0.35) * 3.8;
  const rawCongress =
    curb * 0.14 +
    def * 0.06 +
    infra * 0.05 -
    deficitPenalty -
    (Math.abs(def) + Math.abs(infra) + Math.abs(tax) > 45 ? 1.5 : 0);
  const congressDelta = Number(
    Math.max(-5.0, Math.min(4.5, rawCongress)).toFixed(1)
  );

  const defenseBudgetDeltaBillions = Math.round(def * 4.5);
  const readinessDelta = Math.round(def * 0.32);

  const passageStatus: 'Enacted' | 'Compromise' =
    metrics.congressSupport + congressDelta >= 50 && debtDeltaTrillions <= 0.65
      ? 'Enacted'
      : 'Compromise';

  return {
    debtDeltaTrillions,
    gdpDelta,
    inflationDelta,
    approvalDelta,
    congressDelta,
    defenseBudgetDeltaBillions,
    readinessDelta,
    passageStatus,
    blocDeltas: {
      workingClass: Math.round(tax * 0.14 + infra * 0.12 - curb * 0.08),
      suburbanModerates: Math.round(
        curb * 0.12 + infra * 0.08 - (debtDeltaTrillions > 0.6 ? 2 : 0)
      ),
      techFinance: Math.round(
        curb * 0.15 + infra * 0.06 - (debtDeltaTrillions > 0.5 ? 2 : 0)
      ),
      seniors: Math.round(tax * 0.06 - curb * 0.12 - inflationDelta * 2.5),
      youngVoters: Math.round(infra * 0.14 + tax * 0.08 - def * 0.08),
    },
  };
}
