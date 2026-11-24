import React, { useEffect, useMemo, useState } from 'react';
import {
  Atom,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Flame,
  Gavel,
  Globe,
  HardHat,
  HeartPulse,
  Landmark,
  Search,
  Shield,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  ExecutedPowerRecord,
  ExecutivePowerCategory,
  ExecutivePowerDefinition,
  NationalMetrics,
} from '../types/game';
import {
  EXECUTIVE_POWER_CATEGORIES,
  EXECUTIVE_POWERS,
  NEW_EXPANSION_POWERS_COUNT,
} from '../data/executivePowers';

interface ExecutivePowersHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: number;
  metrics: NationalMetrics;
  executedPowers: ExecutedPowerRecord[];
  onExecutePower: (power: ExecutivePowerDefinition) => void;
}

type ScopeFilter = 'all' | 'new_200' | 'core_50';
type ReadinessFilter = 'all' | 'ready' | 'cooldown' | 'invoked';
type InstrumentFilter = 'All' | ExecutivePowerDefinition['instrumentType'];
type SortOption =
  | 'number_asc'
  | 'new_first'
  | 'approval_desc'
  | 'gdp_desc'
  | 'congress_desc'
  | 'cooldown_asc';

const PAGE_SIZE = 24;

const INSTRUMENTS: ExecutivePowerDefinition['instrumentType'][] = [
  'Executive Order',
  'Policy Directive',
  'Emergency Action',
  'Diplomatic Order',
  'White House Proclamation',
];

function getCategoryIcon(category: ExecutivePowerCategory) {
  switch (category) {
    case 'Cabinet & Bureaucracy':
      return <Landmark className="h-4 w-4 text-[#132238]" aria-hidden="true" />;
    case 'Economic & Fiscal':
      return <Zap className="h-4 w-4 text-emerald-700" aria-hidden="true" />;
    case 'National Security':
      return <Shield className="h-4 w-4 text-blue-700" aria-hidden="true" />;
    case 'Congress & Judiciary':
      return <Gavel className="h-4 w-4 text-amber-700" aria-hidden="true" />;
    case 'Legacy & Media':
      return <Globe className="h-4 w-4 text-purple-700" aria-hidden="true" />;
    case 'Science, Space & Energy':
      return <Atom className="h-4 w-4 text-sky-700" aria-hidden="true" />;
    case 'Healthcare & Public Welfare':
      return <HeartPulse className="h-4 w-4 text-rose-700" aria-hidden="true" />;
    case 'Infrastructure & Housing':
      return <Building2 className="h-4 w-4 text-orange-700" aria-hidden="true" />;
    case 'Trade, Labor & Education':
      return <HardHat className="h-4 w-4 text-teal-700" aria-hidden="true" />;
    case 'Intelligence & Cyber Command':
      return <Cpu className="h-4 w-4 text-indigo-700" aria-hidden="true" />;
  }
}

function formatPowerImpacts(power: ExecutivePowerDefinition): string[] {
  const parts: string[] = [];
  const m = power.metricImpacts;
  if (typeof m.approval === 'number' && m.approval !== 0) {
    parts.push(`${m.approval > 0 ? '+' : ''}${m.approval.toFixed(1)}% Approval`);
  }
  if (typeof m.congressSupport === 'number' && m.congressSupport !== 0) {
    parts.push(
      `${m.congressSupport > 0 ? '+' : ''}${m.congressSupport.toFixed(1)}% Congress`
    );
  }
  if (typeof m.gdpGrowth === 'number' && m.gdpGrowth !== 0) {
    parts.push(`${m.gdpGrowth > 0 ? '+' : ''}${m.gdpGrowth.toFixed(1)}% GDP`);
  }
  if (typeof m.inflation === 'number' && m.inflation !== 0) {
    parts.push(`${m.inflation > 0 ? '+' : ''}${m.inflation.toFixed(1)}% Inflation`);
  }
  if (typeof m.unemployment === 'number' && m.unemployment !== 0) {
    parts.push(
      `${m.unemployment > 0 ? '+' : ''}${m.unemployment.toFixed(1)}% Unemp.`
    );
  }
  if (typeof m.diplomaticStanding === 'number' && m.diplomaticStanding !== 0) {
    parts.push(
      `${m.diplomaticStanding > 0 ? '+' : ''}${m.diplomaticStanding.toFixed(
        1
      )} Diplomacy`
    );
  }
  if (
    typeof m.nationalDebtTrillions === 'number' &&
    m.nationalDebtTrillions !== 0
  ) {
    parts.push(
      `${m.nationalDebtTrillions > 0 ? '+' : ''}$${m.nationalDebtTrillions.toFixed(
        2
      )}T Debt`
    );
  }
  if (
    typeof power.forceReadinessDelta === 'number' &&
    power.forceReadinessDelta !== 0
  ) {
    parts.push(
      `${power.forceReadinessDelta > 0 ? '+' : ''}${power.forceReadinessDelta.toFixed(
        1
      )} Readiness`
    );
  }
  return parts;
}

export const ExecutivePowersHub: React.FC<ExecutivePowersHubProps> = ({
  isOpen,
  onClose,
  currentMonth,
  metrics,
  executedPowers,
  onExecutePower,
}) => {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<
    ExecutivePowerCategory | 'All'
  >('All');
  const [instrumentFilter, setInstrumentFilter] =
    useState<InstrumentFilter>('All');
  const [readinessFilter, setReadinessFilter] =
    useState<ReadinessFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('number_asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [lastInvokedBanner, setLastInvokedBanner] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const executedMap = useMemo(() => {
    const map = new Map<string, { count: number; lastMonth: number }>();
    for (const ep of executedPowers) {
      const existing = map.get(ep.powerId) || { count: 0, lastMonth: 0 };
      map.set(ep.powerId, {
        count: existing.count + 1,
        lastMonth: Math.max(existing.lastMonth, ep.month),
      });
    }
    return map;
  }, [executedPowers]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<ExecutivePowerCategory, number>();
    for (const cat of EXECUTIVE_POWER_CATEGORIES) counts.set(cat, 0);
    for (const p of EXECUTIVE_POWERS) {
      if (scopeFilter === 'new_200' && !p.isNewExpansion) continue;
      if (scopeFilter === 'core_50' && p.isNewExpansion) continue;
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return counts;
  }, [scopeFilter]);

  const filteredPowers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = EXECUTIVE_POWERS.filter((p) => {
      if (scopeFilter === 'new_200' && !p.isNewExpansion) return false;
      if (scopeFilter === 'core_50' && p.isNewExpansion) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (instrumentFilter !== 'All' && p.instrumentType !== instrumentFilter) {
        return false;
      }

      const status = executedMap.get(p.id);
      const monthsSinceLast = status ? currentMonth - status.lastMonth : 999;
      const onCooldown = monthsSinceLast < p.cooldownMonths;

      if (readinessFilter === 'ready' && onCooldown) return false;
      if (readinessFilter === 'cooldown' && !onCooldown) return false;
      if (readinessFilter === 'invoked' && !status) return false;

      if (q) {
        const numberTag = `#${p.number}`;
        return (
          p.title.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.instrumentType.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          numberTag.includes(q)
        );
      }
      return true;
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'new_first': {
          const aNew = a.isNewExpansion ? 1 : 0;
          const bNew = b.isNewExpansion ? 1 : 0;
          if (bNew !== aNew) return bNew - aNew;
          return a.number - b.number;
        }
        case 'approval_desc':
          return (
            (b.metricImpacts.approval || 0) - (a.metricImpacts.approval || 0) ||
            a.number - b.number
          );
        case 'gdp_desc':
          return (
            (b.metricImpacts.gdpGrowth || 0) -
              (a.metricImpacts.gdpGrowth || 0) || a.number - b.number
          );
        case 'congress_desc':
          return (
            (b.metricImpacts.congressSupport || 0) -
              (a.metricImpacts.congressSupport || 0) || a.number - b.number
          );
        case 'cooldown_asc':
          return a.cooldownMonths - b.cooldownMonths || a.number - b.number;
        case 'number_asc':
        default:
          return a.number - b.number;
      }
    });

    return sorted;
  }, [
    scopeFilter,
    selectedCategory,
    instrumentFilter,
    readinessFilter,
    sortBy,
    searchQuery,
    executedMap,
    currentMonth,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPowers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedPowers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPowers.slice(start, start + PAGE_SIZE);
  }, [filteredPowers, safePage]);

  const handleInvoke = (power: ExecutivePowerDefinition) => {
    onExecutePower(power);
    setLastInvokedBanner(
      `Executed #${power.number} · ${power.title} (${power.instrumentType})`
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-powers-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-6 py-4 bg-stone-50">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
              <Sparkles
                className="h-3.5 w-3.5 text-[#132238]"
                aria-hidden="true"
              />
              <span>
                Executive Expansion Suite · {EXECUTIVE_POWERS.length} Total
                Features ({NEW_EXPANSION_POWERS_COUNT} New)
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">
                Month {String(currentMonth).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">
                Approval {metrics.approval.toFixed(1)}%
              </span>
            </div>
            <h2
              id="executive-powers-title"
              className="mt-0.5 font-display text-xl font-bold text-stone-900"
            >
              Executive Powers &amp; National Instruments Command Center
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-stone-200/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'catalog'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Features Catalog ({EXECUTIVE_POWERS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'history'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Executed Log ({executedPowers.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close executive powers modal"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200/70 hover:text-stone-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {lastInvokedBanner && (
          <div className="flex items-center justify-between gap-3 border-b border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2
                className="h-4 w-4 text-emerald-700 shrink-0"
                aria-hidden="true"
              />
              <span>{lastInvokedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastInvokedBanner(null)}
              className="text-emerald-800 hover:text-emerald-950 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body */}
        {activeTab === 'catalog' ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Scope, Search & Secondary Filters */}
            <div className="space-y-3 border-b border-stone-200 px-6 py-3.5 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setScopeFilter('all');
                      setPage(1);
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      scopeFilter === 'all'
                        ? 'bg-white text-[#132238] shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Features ({EXECUTIVE_POWERS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScopeFilter('new_200');
                      setPage(1);
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      scopeFilter === 'new_200'
                        ? 'bg-white text-[#132238] shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    New 200 Features (#51–250)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScopeFilter('core_50');
                      setPage(1);
                    }}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      scopeFilter === 'core_50'
                        ? 'bg-white text-[#132238] shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Core Pack (#1–50)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[230px]">
                    <Search
                      className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search #51, title, policy..."
                      className="w-full rounded-lg border border-stone-300 bg-stone-50/60 py-1.5 pl-9 pr-3 text-xs text-stone-900 focus:border-[#132238] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Filter by instrument type"
                    value={instrumentFilter}
                    onChange={(e) => {
                      setInstrumentFilter(e.target.value as InstrumentFilter);
                      setPage(1);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
                  >
                    <option value="All">All Instruments</option>
                    {INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by availability"
                    value={readinessFilter}
                    onChange={(e) => {
                      setReadinessFilter(e.target.value as ReadinessFilter);
                      setPage(1);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="ready">Ready to Invoke</option>
                    <option value="cooldown">On Cooldown</option>
                    <option value="invoked">Previously Invoked</option>
                  </select>

                  <select
                    aria-label="Sort executive features"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setPage(1);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
                  >
                    <option value="number_asc">Catalog Order (#1–250)</option>
                    <option value="new_first">New 200 First (#51–250)</option>
                    <option value="approval_desc">Highest Approval Gain</option>
                    <option value="gdp_desc">Highest GDP Impact</option>
                    <option value="congress_desc">Highest Congress Gain</option>
                    <option value="cooldown_asc">Shortest Cooldown</option>
                  </select>
                </div>
              </div>

              {/* 10 Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setPage(1);
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === 'All'
                      ? 'bg-[#132238] text-white'
                      : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  All Domains (
                  {scopeFilter === 'new_200'
                    ? 200
                    : scopeFilter === 'core_50'
                    ? 50
                    : EXECUTIVE_POWERS.length}
                  )
                </button>
                {EXECUTIVE_POWER_CATEGORIES.map((cat) => {
                  const count = categoryCounts.get(cat) || 0;
                  if (count === 0 && scopeFilter === 'core_50') return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setPage(1);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#132238] text-white'
                          : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Powers Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
              {filteredPowers.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-semibold text-stone-800">
                    No executive features match your current filters
                  </p>
                  <p className="text-xs text-stone-500">
                    Reset search or category filters to browse all 250 powers.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setScopeFilter('all');
                      setSelectedCategory('All');
                      setInstrumentFilter('All');
                      setReadinessFilter('all');
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 font-mono-num">
                    <span>
                      Showing {(safePage - 1) * PAGE_SIZE + 1}–
                      {Math.min(
                        safePage * PAGE_SIZE,
                        filteredPowers.length
                      )}{' '}
                      of {filteredPowers.length} matching features
                    </span>
                    <span>
                      Page {safePage} of {totalPages}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pagedPowers.map((power) => {
                      const status = executedMap.get(power.id);
                      const monthsSinceLast = status
                        ? currentMonth - status.lastMonth
                        : 999;
                      const onCooldown = monthsSinceLast < power.cooldownMonths;
                      const remainingCooldown = onCooldown
                        ? power.cooldownMonths - monthsSinceLast
                        : 0;
                      const impactList = formatPowerImpacts(power);

                      return (
                        <article
                          key={power.id}
                          className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-[#132238]/40"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {getCategoryIcon(power.category)}
                                <span className="truncate font-medium text-stone-700">
                                  {power.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-num font-semibold text-stone-900">
                                  #{power.number}
                                </span>
                                {power.isNewExpansion && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-semibold text-amber-700">
                                      New
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-display text-base font-bold text-stone-900 leading-snug">
                                {power.title}
                              </h3>
                              <p className="mt-0.5 text-xs font-medium text-stone-600">
                                {power.subtitle}
                              </p>
                            </div>

                            <p className="text-xs leading-relaxed text-stone-600">
                              {power.description}
                            </p>

                            <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px]">
                              <div className="text-stone-500">
                                <span>{power.instrumentType}</span>
                                <span aria-hidden="true"> · </span>
                                <span className="font-mono-num">
                                  {power.cooldownMonths}m cooldown
                                </span>
                              </div>
                              <p className="text-stone-700 leading-snug">
                                {power.effectSummary}
                              </p>
                              {impactList.length > 0 && (
                                <p className="font-mono-num font-semibold text-[#132238]">
                                  {impactList.join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                            <div className="text-[11px] font-mono-num text-stone-500">
                              {status ? (
                                <span className="text-emerald-700 font-medium">
                                  Executed {status.count}x (M{status.lastMonth})
                                </span>
                              ) : (
                                <span>Ready · Unused</span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={onCooldown}
                              onClick={() => handleInvoke(power)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:bg-stone-300 disabled:text-stone-600 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                            >
                              <Flame
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              <span>
                                {onCooldown
                                  ? `Cooldown (${remainingCooldown}m)`
                                  : 'Invoke Power'}
                              </span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-45"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Previous</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pNum = idx + 1;
                          return (
                            <button
                              key={pNum}
                              type="button"
                              onClick={() => setPage(pNum)}
                              className={`min-w-[32px] rounded-md px-2.5 py-1 font-mono-num text-xs font-semibold transition-colors ${
                                pNum === safePage
                                  ? 'bg-[#132238] text-white'
                                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-45"
                      >
                        <span>Next</span>
                        <ChevronRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <h3 className="font-display text-lg font-bold text-stone-900">
                  Executed Executive Features Log ({executedPowers.length})
                </h3>
                <p className="text-xs text-stone-600">
                  Historical record of all executive instruments invoked during
                  this presidential term.
                </p>
              </div>

              {executedPowers.length === 0 ? (
                <div className="py-12 text-center space-y-2 rounded-xl border border-stone-200 bg-white p-8">
                  <p className="text-sm font-semibold text-stone-800">
                    No executive features invoked yet
                  </p>
                  <p className="text-xs text-stone-500">
                    Browse the Features Catalog tab and invoke any of the{' '}
                    {EXECUTIVE_POWERS.length} executive instruments to shape
                    your administration.
                  </p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {executedPowers.map((ep, idx) => (
                    <li
                      key={ep.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                        <div className="flex items-center gap-2 font-mono-num">
                          <span className="font-semibold text-stone-800">
                            #{executedPowers.length - idx}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Month {String(ep.month).padStart(2, '0')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-semibold text-[#132238]">
                            {ep.category}
                          </span>
                        </div>
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-600"
                          aria-hidden="true"
                        />
                      </div>

                      <h4 className="text-sm font-bold text-stone-900">
                        {ep.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-stone-600">
                        {ep.summary}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-6 py-4 bg-stone-50">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-mono-num">
            <span>{EXECUTIVE_POWERS.length} Total Features</span>
            <span aria-hidden="true">·</span>
            <span>{executedMap.size} Unique Invoked</span>
            <span aria-hidden="true">·</span>
            <span>{executedPowers.length} Total Invocations</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap"
          >
            Close Command Center
          </button>
        </div>
      </div>
    </div>
  );
};
