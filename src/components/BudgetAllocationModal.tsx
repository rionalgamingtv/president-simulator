import React, { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, Coins, X } from 'lucide-react';
import {
  BudgetAllocationInput,
  BudgetProjection,
  MilitaryCommandState,
  NationalMetrics,
} from '../types/game';
import {
  BUDGET_PRESETS,
  computeBudgetProjection,
  DEFAULT_BUDGET_ALLOCATION,
} from '../data/budgetEngine';

interface BudgetAllocationModalProps {
  currentMonth: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  lastBudgetMonth: number | null;
  onEnactBudget: (
    title: string,
    allocation: BudgetAllocationInput,
    projection: BudgetProjection
  ) => void;
  onClose: () => void;
}

function fmtSigned(val: number, suffix = '%', decimals = 1): string {
  const n = Number(val.toFixed(decimals));
  return `${n > 0 ? '+' : ''}${n.toFixed(decimals)}${suffix}`;
}

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  currentMonth,
  metrics,
  military,
  lastBudgetMonth,
  onEnactBudget,
  onClose,
}) => {
  const [allocation, setAllocation] = useState<BudgetAllocationInput>(
    DEFAULT_BUDGET_ALLOCATION
  );
  const [packageTitle, setPackageTitle] = useState(
    `Fiscal Year ${Math.max(1, Math.ceil(currentMonth / 12))} Appropriations & Reconciliation Act`
  );

  const onCooldown =
    lastBudgetMonth !== null && currentMonth - lastBudgetMonth < 6;
  const nextAvailableMonth =
    lastBudgetMonth !== null ? lastBudgetMonth + 6 : currentMonth;

  const projection = useMemo(
    () => computeBudgetProjection(allocation, metrics),
    [allocation, metrics]
  );

  const updateField = (key: keyof BudgetAllocationInput, value: number) => {
    setAllocation((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCooldown) return;
    onEnactBudget(
      packageTitle.trim() || 'Federal Appropriations & Budget Compact',
      allocation,
      projection
    );
    onClose();
  };

  const sliders: {
    key: keyof BudgetAllocationInput;
    label: string;
    description: string;
    min: number;
    max: number;
  }[] = [
    {
      key: 'defenseShiftPct',
      label: 'Defense & Force Readiness',
      description: `Base Pentagon budget: $${military.defenseBudgetBillions.toFixed(0)}B. Raises readiness and military procurement.`,
      min: -15,
      max: 25,
    },
    {
      key: 'infrastructureShiftPct',
      label: 'Infrastructure, Grid & Energy',
      description: 'Boosts medium-term GDP output and working-class/suburban backing.',
      min: -15,
      max: 25,
    },
    {
      key: 'taxReliefShiftPct',
      label: 'Household Tax Credits & Relief',
      description: 'Lifts immediate consumer approval at the cost of higher deficit pressure.',
      min: -15,
      max: 25,
    },
    {
      key: 'deficitCurbPct',
      label: 'Deficit & Discretionary Spending Curb',
      description: 'Reduces borrowing and cools CPI inflation; may weigh on near-term growth.',
      min: 0,
      max: 25,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Coins className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>
                Office of Management &amp; Budget · 6-Month Fiscal Cycle · Month{' '}
                <span className="font-mono-num">{currentMonth}</span>
              </span>
            </div>
            <h3
              id="budget-modal-title"
              className="font-display text-xl font-bold text-white"
            >
              Federal Budget &amp; Appropriations Negotiator
            </h3>
            <p className="text-xs text-stone-300 font-mono-num">
              National Debt ${metrics.nationalDebtTrillions.toFixed(2)}T · GDP{' '}
              {metrics.gdpGrowth.toFixed(1)}% · CPI {metrics.inflation.toFixed(1)}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close federal budget negotiator"
            className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {onCooldown && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">
              An appropriations package was signed in Month{' '}
              <span className="font-mono-num">{lastBudgetMonth}</span>. The next
              6-month federal budget window opens in Month{' '}
              <span className="font-mono-num">{nextAvailableMonth}</span>.
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-stone-700">
              Strategic Fiscal Templates
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={onCooldown}
                  onClick={() => {
                    setAllocation(preset.allocation);
                    setPackageTitle(preset.label);
                  }}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-left transition-colors hover:border-[#132238] hover:bg-white disabled:opacity-50"
                >
                  <p className="text-xs font-bold text-stone-900">
                    {preset.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-stone-600">
                    {preset.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="budget-act-title"
              className="block text-xs font-semibold text-stone-700"
            >
              Appropriations Bill Title
            </label>
            <input
              id="budget-act-title"
              type="text"
              value={packageTitle}
              onChange={(e) => setPackageTitle(e.target.value)}
              disabled={onCooldown}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-[#132238] focus:outline-none disabled:bg-stone-50"
            />
          </div>

          {/* Interactive Pillar Sliders */}
          <div className="space-y-3.5">
            {sliders.map((slider) => {
              const val = allocation[slider.key];
              return (
                <div
                  key={slider.key}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`slider-${slider.key}`}
                      className="text-xs font-bold text-stone-900"
                    >
                      {slider.label}
                    </label>
                    <span
                      className={`font-mono-num text-xs font-bold ${
                        val > 0
                          ? 'text-[#132238]'
                          : val < 0
                          ? 'text-amber-800'
                          : 'text-stone-600'
                      }`}
                    >
                      {val > 0 ? `+${val}%` : `${val}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    {slider.description}
                  </p>
                  <input
                    id={`slider-${slider.key}`}
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={1}
                    disabled={onCooldown}
                    value={val}
                    onChange={(e) =>
                      updateField(slider.key, Number(e.target.value))
                    }
                    className="w-full accent-[#132238] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* Live CBO Fiscal Score */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Calculator className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                <span>Projected Fiscal &amp; Political Impact</span>
              </div>
              <span className="text-xs font-semibold text-stone-700">
                Expected Outcome:{' '}
                <strong className="text-[#132238]">
                  {projection.passageStatus}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 font-mono-num text-xs">
              <div>
                <span className="block text-[11px] text-stone-500">
                  National Debt
                </span>
                <span
                  className={`font-bold ${
                    projection.debtDeltaTrillions <= 0
                      ? 'text-emerald-700'
                      : 'text-amber-800'
                  }`}
                >
                  {fmtSigned(projection.debtDeltaTrillions, 'T', 2)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  GDP Growth
                </span>
                <span
                  className={`font-bold ${
                    projection.gdpDelta >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {fmtSigned(projection.gdpDelta, '%', 2)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Inflation (CPI)
                </span>
                <span
                  className={`font-bold ${
                    projection.inflationDelta <= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {fmtSigned(projection.inflationDelta, '%', 2)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Public Approval
                </span>
                <span
                  className={`font-bold ${
                    projection.approvalDelta >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {fmtSigned(projection.approvalDelta, '%', 1)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Congress Support
                </span>
                <span
                  className={`font-bold ${
                    projection.congressDelta >= 0
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {fmtSigned(projection.congressDelta, '%', 1)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-stone-500">
                  Defense / Readiness
                </span>
                <span className="font-bold text-stone-900">
                  {projection.defenseBudgetDeltaBillions >= 0 ? '+' : ''}
                  ${projection.defenseBudgetDeltaBillions}B ·{' '}
                  {projection.readinessDelta >= 0 ? '+' : ''}
                  {projection.readinessDelta}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={onCooldown}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Federal Budget Package</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
