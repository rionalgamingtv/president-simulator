import {
  EmergencyAlertEvent,
  NationalMetrics,
  StabilityMetricKey,
  StabilitySeverity,
  StabilityThresholdStatus,
} from '../types/game';

export const STABILITY_THRESHOLDS = {
  inflationMax: 15.0,
  debtTrillionsMax: 45.0,
  approvalMin: 20.0,
} as const;

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

const SEVERITY_RANK: Record<StabilitySeverity, number> = {
  Nominal: 0,
  Elevated: 1,
  Severe: 2,
  Critical: 3,
};

export function evaluateInstitutionalStability(metrics: NationalMetrics): {
  overallSeverity: StabilitySeverity;
  statuses: StabilityThresholdStatus[];
  breachedKeys: StabilityMetricKey[];
} {
  // 1. Inflation (CPI) — Breach > 15.0%
  const inf = metrics.inflation;
  const infBreached = inf > STABILITY_THRESHOLDS.inflationMax;
  const infSeverity: StabilitySeverity = infBreached
    ? 'Critical'
    : inf >= 10.0
    ? 'Severe'
    : inf >= 4.5
    ? 'Elevated'
    : 'Nominal';
  const infProximity = clamp(
    Math.round((inf / STABILITY_THRESHOLDS.inflationMax) * 100),
    0,
    100
  );
  const infMargin = infBreached
    ? `Breached by +${(inf - STABILITY_THRESHOLDS.inflationMax).toFixed(1)}%`
    : `${(STABILITY_THRESHOLDS.inflationMax - inf).toFixed(1)}% below breach`;

  const inflationStatus: StabilityThresholdStatus = {
    metricKey: 'inflation',
    label: 'Inflation (CPI)',
    currentValue: inf,
    formattedValue: `${inf.toFixed(1)}%`,
    thresholdLabel: `> ${STABILITY_THRESHOLDS.inflationMax.toFixed(1)}%`,
    historicalReference: '1980 CPI Peak: 14.8%',
    severity: infSeverity,
    breached: infBreached,
    proximityPct: infProximity,
    marginLabel: infMargin,
  };

  // 2. National Debt — Breach > $45.00T
  const debt = metrics.nationalDebtTrillions;
  const debtBreached = debt > STABILITY_THRESHOLDS.debtTrillionsMax;
  const debtSeverity: StabilitySeverity = debtBreached
    ? 'Critical'
    : debt >= 42.0
    ? 'Severe'
    : debt >= 39.0
    ? 'Elevated'
    : 'Nominal';
  const debtProximity = clamp(
    Math.round(
      ((debt - 30.0) / (STABILITY_THRESHOLDS.debtTrillionsMax - 30.0)) * 100
    ),
    0,
    100
  );
  const debtMargin = debtBreached
    ? `Breached by +$${(debt - STABILITY_THRESHOLDS.debtTrillionsMax).toFixed(2)}T`
    : `$${(STABILITY_THRESHOLDS.debtTrillionsMax - debt).toFixed(2)}T headroom`;

  const debtStatus: StabilityThresholdStatus = {
    metricKey: 'nationalDebtTrillions',
    label: 'Federal Debt',
    currentValue: debt,
    formattedValue: `$${debt.toFixed(2)}T`,
    thresholdLabel: `> $${STABILITY_THRESHOLDS.debtTrillionsMax.toFixed(1)}T`,
    historicalReference: 'Post-WWII Sovereign Ceiling',
    severity: debtSeverity,
    breached: debtBreached,
    proximityPct: debtProximity,
    marginLabel: debtMargin,
  };

  // 3. Public Approval — Breach < 20.0%
  const app = metrics.approval;
  const appBreached = app < STABILITY_THRESHOLDS.approvalMin;
  const appSeverity: StabilitySeverity = appBreached
    ? 'Critical'
    : app < 28.0
    ? 'Severe'
    : app < 38.0
    ? 'Elevated'
    : 'Nominal';
  const appProximity = clamp(
    Math.round(
      ((60.0 - app) / (60.0 - STABILITY_THRESHOLDS.approvalMin)) * 100
    ),
    0,
    100
  );
  const appMargin = appBreached
    ? `Breached by -${(STABILITY_THRESHOLDS.approvalMin - app).toFixed(1)}%`
    : `${(app - STABILITY_THRESHOLDS.approvalMin).toFixed(1)}% above floor`;

  const approvalStatus: StabilityThresholdStatus = {
    metricKey: 'approval',
    label: 'Public Approval',
    currentValue: app,
    formattedValue: `${app.toFixed(1)}%`,
    thresholdLabel: `< ${STABILITY_THRESHOLDS.approvalMin.toFixed(1)}%`,
    historicalReference: '1952 Truman Low: 22.0%',
    severity: appSeverity,
    breached: appBreached,
    proximityPct: appProximity,
    marginLabel: appMargin,
  };

  const statuses = [inflationStatus, debtStatus, approvalStatus];
  const breachedKeys = statuses
    .filter((s) => s.breached)
    .map((s) => s.metricKey);

  let overallSeverity: StabilitySeverity = 'Nominal';
  for (const s of statuses) {
    if (SEVERITY_RANK[s.severity] > SEVERITY_RANK[overallSeverity]) {
      overallSeverity = s.severity;
    }
  }

  return { overallSeverity, statuses, breachedKeys };
}

export function buildEmergencyAlertForMetric(
  metricKey: StabilityMetricKey,
  metrics: NationalMetrics,
  month: number
): EmergencyAlertEvent {
  if (metricKey === 'inflation') {
    return {
      id: `emergency-inflation-m${month}`,
      month,
      metricKey: 'inflation',
      title: 'Hyperinflationary Price Spiral — CPI Breached 15.0%',
      historicalBenchmark: 'Surpassed the March 1980 Peak (14.8% CPI)',
      triggerValueLabel: `${metrics.inflation.toFixed(1)}%`,
      thresholdLabel: `> ${STABILITY_THRESHOLDS.inflationMax.toFixed(1)}%`,
      briefSummary: `Consumer inflation has surged to ${metrics.inflation.toFixed(1)}%, breaking past the post-war 1980 historical peak. Household purchasing power is eroding rapidly, long-term bond yields are dislocating, and the Federal Reserve warns of unanchored inflation expectations.`,
      institutionalConsequence:
        'Unchecked double-digit inflation freezes mortgage lending, fractures Senate fiscal coalitions, and forces emergency White House stabilization.',
      options: [
        {
          id: 'inf-volcker-shock',
          title: 'Volcker-Scale Monetary & Credit Tightening',
          instrumentLabel: 'Joint White House–Fed Accord',
          description:
            'Endorse an emergency 100bp Federal Reserve rate hike, curtail federal credit guarantees, and freeze non-essential agency procurement.',
          metricDeltas: {
            inflation: -2.6,
            gdpGrowth: -0.7,
            unemployment: 0.5,
            approval: -2.0,
          },
          fedFundsDelta: 1.0,
          fedStance: 'Hawkish',
          tradeoffSummary:
            'Inflation -2.6% · Fed +1.00% · GDP -0.7% · Unemp +0.5% · Approval -2.0%',
        },
        {
          id: 'inf-tariff-price-cap',
          title: 'Emergency Tariff Suspension & Price-Gouging Order',
          instrumentLabel: 'Executive Stabilization Order',
          description:
            'Suspend import duties on food, fuel, and industrial inputs while invoking statutory anti-hoarding and windfall price enforcement.',
          metricDeltas: {
            inflation: -1.9,
            gdpGrowth: -0.2,
            congressSupport: -4.0,
            nationalDebtTrillions: 0.15,
            approval: 1.5,
          },
          tradeoffSummary:
            'Inflation -1.9% · Approval +1.5% · Congress -4.0% · Debt +$0.15T',
        },
        {
          id: 'inf-supply-dpa',
          title: 'Defense Production Supply & Strategic Reserve Surge',
          instrumentLabel: 'DPA Supply Mobilization',
          description:
            'Release strategic energy reserves, waive domestic freight bottlenecks, and deploy Defense Production Act grants to expand core supply.',
          metricDeltas: {
            inflation: -1.6,
            gdpGrowth: 0.3,
            nationalDebtTrillions: 0.35,
            diplomaticStanding: -2.0,
          },
          tradeoffSummary:
            'Inflation -1.6% · GDP +0.3% · Debt +$0.35T · Diplomacy -2.0',
        },
      ],
    };
  }

  if (metricKey === 'nationalDebtTrillions') {
    return {
      id: `emergency-debt-m${month}`,
      month,
      metricKey: 'nationalDebtTrillions',
      title: 'Sovereign Debt Ceiling Crisis — Debt Breached $45.0T',
      historicalBenchmark: 'Exceeded Post-WWII Sovereign Debt Stress Threshold',
      triggerValueLabel: `$${metrics.nationalDebtTrillions.toFixed(2)}T`,
      thresholdLabel: `> $${STABILITY_THRESHOLDS.debtTrillionsMax.toFixed(1)}T`,
      briefSummary: `Gross federal debt has climbed to $${metrics.nationalDebtTrillions.toFixed(2)} trillion, crossing the $45.0T systemic warning line. Primary Treasury dealers report weak auction demand, pushing sovereign debt-service costs sharply higher.`,
      institutionalConsequence:
        'Credit rating desks have placed sovereign outlook on immediate negative watch pending a credible White House deficit-containment order.',
      options: [
        {
          id: 'debt-omb-sequester',
          title: 'OMB Emergency Sequestration & Hiring Freeze',
          instrumentLabel: 'Presidential Impoundment & Freeze',
          description:
            'Order immediate across-the-board discretionary spending rescissions, halt new federal grants, and freeze civilian agency hiring.',
          metricDeltas: {
            nationalDebtTrillions: -1.35,
            gdpGrowth: -0.6,
            approval: -3.5,
            congressSupport: 3.0,
          },
          tradeoffSummary:
            'Debt -$1.35T · Congress +3.0% · GDP -0.6% · Approval -3.5%',
        },
        {
          id: 'debt-fiscal-compact',
          title: 'Bipartisan Deficit Commission & Surtax Package',
          instrumentLabel: 'Emergency Fiscal Compact',
          description:
            'Commit the White House to a fast-tracked statutory debt brake combining temporary corporate/high-income surtaxes and spending caps.',
          metricDeltas: {
            nationalDebtTrillions: -1.65,
            congressSupport: -5.0,
            approval: -2.5,
            inflation: -0.3,
          },
          tradeoffSummary:
            'Debt -$1.65T · Inflation -0.3% · Congress -5.0% · Approval -2.5%',
        },
        {
          id: 'debt-asset-backstop',
          title: 'Treasury Maturity Swap & Federal Asset Monetization',
          instrumentLabel: 'Treasury Stabilization Directive',
          description:
            'Auction non-strategic federal spectrum and reserve leases while restructuring short-term T-bill rollovers with primary dealers.',
          metricDeltas: {
            nationalDebtTrillions: -0.95,
            inflation: 0.3,
            diplomaticStanding: -2.0,
          },
          fedFundsDelta: 0.25,
          tradeoffSummary:
            'Debt -$0.95T · Fed +0.25% · Inflation +0.3% · Diplomacy -2.0',
        },
      ],
    };
  }

  // approval < 20.0
  return {
    id: `emergency-approval-m${month}`,
    month,
    metricKey: 'approval',
    title: 'Governing Legitimacy Crisis — Approval Fell Below 20.0%',
    historicalBenchmark: 'Below Historic Presidential Floor (Truman 22% / Nixon 24%)',
    triggerValueLabel: `${metrics.approval.toFixed(1)}%`,
    thresholdLabel: `< ${STABILITY_THRESHOLDS.approvalMin.toFixed(1)}%`,
    briefSummary: `Public approval has collapsed to ${metrics.approval.toFixed(1)}%, piercing the historic 20% governing legitimacy floor. Coalition lawmakers are distancing themselves publicly, and institutional confidence across agencies is fraying.`,
    institutionalConsequence:
      'Without immediate corrective governance, legislative gridlock deepens and the administration risks falling below the 5.0% impeachment threshold.',
    options: [
      {
        id: 'app-unity-reset',
        title: 'Primetime Accountability Address & West Wing Reset',
        instrumentLabel: 'National Television Address',
        description:
          'Acknowledge missteps directly to the public, overhaul communications leadership, and announce an immediate household relief pivot.',
        metricDeltas: {
          approval: 5.5,
          congressSupport: 3.0,
          diplomaticStanding: 2.0,
        },
        cabinetLoyaltyDelta: -4,
        tradeoffSummary:
          'Approval +5.5% · Congress +3.0% · Diplomacy +2.0 · Cabinet Loyalty -4',
      },
      {
        id: 'app-hill-compromise',
        title: 'Bipartisan Capitol Hill Concession & Relief Accord',
        instrumentLabel: 'Joint Legislative Compromise',
        description:
          'Extend major legislative concessions to swing lawmakers in exchange for passing an immediate bipartisan kitchen-table relief measure.',
        metricDeltas: {
          approval: 4.2,
          congressSupport: 7.0,
          nationalDebtTrillions: 0.25,
        },
        tradeoffSummary:
          'Approval +4.2% · Congress +7.0% · Debt +$0.25T',
      },
      {
        id: 'app-oversight-charter',
        title: 'Independent Ethics & Transparency Charter',
        instrumentLabel: 'Executive Accountability Order',
        description:
          'Empower independent Inspectors General with subpoena-grade disclosure mandates and publish real-time White House decision logs.',
        metricDeltas: {
          approval: 4.6,
          congressSupport: 4.0,
          diplomaticStanding: 3.0,
        },
        tradeoffSummary:
          'Approval +4.6% · Congress +4.0% · Diplomacy +3.0',
      },
    ],
  };
}

export function findNextUnaddressedEmergency(
  metrics: NationalMetrics,
  month: number,
  addressedMonths: Partial<Record<StabilityMetricKey, number>>
): EmergencyAlertEvent | null {
  const { breachedKeys } = evaluateInstitutionalStability(metrics);
  for (const key of breachedKeys) {
    if (addressedMonths[key] !== month) {
      return buildEmergencyAlertForMetric(key, metrics, month);
    }
  }
  return null;
}
