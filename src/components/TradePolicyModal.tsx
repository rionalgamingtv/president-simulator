import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Globe,
  Ship,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  TRADE_CORRIDORS,
  TRADE_POSTURE_OPTIONS,
  TradePostureId,
  summarizeTradePackage,
} from '../data/tradeWar';
import { NationalMetrics, VoterBlocs } from '../types/game';

interface TradePolicyModalProps {
  currentMonth: number;
  metrics: NationalMetrics;
  currentStances: Record<string, TradePostureId>;
  lastTradeActionMonth: number | null;
  onEnactTradePackage: (result: {
    stances: Record<string, TradePostureId>;
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
  }) => void;
  onClose: () => void;
}

export const TradePolicyModal: React.FC<TradePolicyModalProps> = ({
  currentMonth,
  metrics,
  currentStances,
  lastTradeActionMonth,
  onEnactTradePackage,
  onClose,
}) => {
  const [draftStances, setDraftStances] =
    useState<Record<string, TradePostureId>>(currentStances);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const preview = useMemo(
    () => summarizeTradePackage(draftStances),
    [draftStances]
  );

  const alreadyEnactedThisMonth = lastTradeActionMonth === currentMonth;

  const handleEnact = () => {
    if (alreadyEnactedThisMonth) return;
    onEnactTradePackage({
      stances: draftStances,
      ...preview,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trade, Tariffs and Supply Chain Strategy Desk"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#F7F6F2] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#132238] text-[#C99A3B]">
              <Ship className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500">
                U.S. Trade Representative · Month {currentMonth} · Current CPI{' '}
                <strong className="font-mono-num text-stone-900">
                  {metrics.inflation.toFixed(1)}%
                </strong>
              </p>
              <h2 className="font-display text-xl font-bold text-stone-900">
                Tariffs, Trade War &amp; Supply Chain Strategy
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trade Strategy Desk"
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Projection Strip */}
        <div className="border-b border-stone-200 bg-white px-6 py-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <span className="block text-xs text-stone-500">Projected GDP</span>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 font-mono-num text-base font-bold ${
                  preview.gdpDelta >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {preview.gdpDelta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {preview.gdpDelta >= 0 ? '+' : ''}
                {preview.gdpDelta.toFixed(2)}%
              </span>
            </div>

            <div>
              <span className="block text-xs text-stone-500">CPI Inflation</span>
              <span
                className={`mt-0.5 block font-mono-num text-base font-bold ${
                  preview.inflationDelta <= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {preview.inflationDelta >= 0 ? '+' : ''}
                {preview.inflationDelta.toFixed(2)}%
              </span>
            </div>

            <div>
              <span className="block text-xs text-stone-500">Debt / Customs</span>
              <span
                className={`mt-0.5 block font-mono-num text-base font-bold ${
                  preview.debtDeltaTrillions <= 0
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {preview.debtDeltaTrillions >= 0 ? '+' : ''}$
                {preview.debtDeltaTrillions.toFixed(2)}T
              </span>
            </div>

            <div>
              <span className="block text-xs text-stone-500">Diplomacy</span>
              <span
                className={`mt-0.5 block font-mono-num text-base font-bold ${
                  preview.diplomaticDelta >= 0
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}
              >
                {preview.diplomaticDelta >= 0 ? '+' : ''}
                {preview.diplomaticDelta.toFixed(1)}
              </span>
            </div>

            <div>
              <span className="block text-xs text-stone-500">
                Retaliation Risk
              </span>
              <span
                className={`mt-0.5 block text-sm font-bold ${
                  preview.overallRisk === 'Severe'
                    ? 'text-red-700'
                    : preview.overallRisk === 'High'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {preview.overallRisk} Exposure
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-stone-600">
            <strong className="text-stone-800">Projected Partner Response:</strong>{' '}
            {preview.retaliationSummary}
          </p>
        </div>

        {/* Corridors Matrix */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {TRADE_CORRIDORS.map((corridor) => {
            const activePostureId = draftStances[corridor.id] || 'open_accord';
            return (
              <section
                key={corridor.id}
                className="rounded-xl border border-stone-200 bg-white p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Globe className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                      <span>{corridor.partners}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num font-medium text-stone-700">
                        {corridor.annualVolumeLabel}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-base font-bold text-stone-900">
                      {corridor.name}
                    </h3>
                  </div>

                  <p className="max-w-md text-xs text-stone-600">
                    {corridor.currentFrictionNote}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs text-stone-600 sm:grid-cols-2">
                  <p>
                    <strong className="text-stone-800">Imports:</strong>{' '}
                    {corridor.keyImports}
                  </p>
                  <p>
                    <strong className="text-stone-800">Exports:</strong>{' '}
                    {corridor.keyExports}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {TRADE_POSTURE_OPTIONS.map((opt) => {
                    const selected = activePostureId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setDraftStances((prev) => ({
                            ...prev,
                            [corridor.id]: opt.id,
                          }))
                        }
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selected
                            ? 'border-[#132238] bg-[#132238] text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-900 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{opt.label}</span>
                        </div>
                        <p
                          className={`mt-0.5 font-mono-num text-[11px] font-semibold ${
                            selected ? 'text-[#C99A3B]' : 'text-stone-500'
                          }`}
                        >
                          {opt.tariffRateLabel}
                        </p>
                        <p
                          className={`mt-1.5 text-[11px] leading-snug ${
                            selected ? 'text-stone-200' : 'text-stone-600'
                          }`}
                        >
                          {opt.shortNote}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            {alreadyEnactedThisMonth ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <span>
                  Trade Proclamation already enacted in Month {currentMonth}. Advance to the next month to adjust tariffs again.
                </span>
              </>
            ) : (
              <span>
                Enacting updates federal customs duties, consumer prices, and trading-partner relations immediately.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={alreadyEnactedThisMonth}
              onClick={handleEnact}
              className="rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 whitespace-nowrap shrink-0"
            >
              {alreadyEnactedThisMonth
                ? 'Enacted This Month'
                : 'Sign Trade & Tariff Proclamation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
