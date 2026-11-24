import React, { useMemo, useState } from 'react';
import {
  X,
  History,
  AlertTriangle,
  ShieldAlert,
  Landmark,
  TrendingUp,
  Globe2,
  CheckCircle2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  HISTORICAL_EVENT_CATEGORIES,
  HISTORICAL_EVENTS,
} from '../data/historicalEvents';
import {
  HistoricalEventCategory,
  HistoricalEventItem,
  HistoricalEventOption,
  ResolvedHistoricalEventRecord,
} from '../types/game';

interface HistoricalEventsModalProps {
  currentMonth: number;
  scenarioId: string;
  resolvedEvents: ResolvedHistoricalEventRecord[];
  initialSelectedEventId?: string | null;
  onResolveEvent: (
    event: HistoricalEventItem,
    option: HistoricalEventOption,
    alsoStageDraft: boolean
  ) => void;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<
  HistoricalEventCategory,
  React.ComponentType<{ className?: string }>
> = {
  constitutional: Landmark,
  security: ShieldAlert,
  economic: TrendingUp,
  geopolitical: Globe2,
};

export const HistoricalEventsModal: React.FC<HistoricalEventsModalProps> = ({
  currentMonth,
  scenarioId,
  resolvedEvents,
  initialSelectedEventId,
  onResolveEvent,
  onClose,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | HistoricalEventCategory
  >('all');
  const [alsoStageDraft, setAlsoStageDraft] = useState(true);

  const sortedEvents = useMemo(() => {
    return [...HISTORICAL_EVENTS].sort((a, b) => {
      const aMatch = a.linkedScenarioIds.includes(scenarioId) ? 1 : 0;
      const bMatch = b.linkedScenarioIds.includes(scenarioId) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return a.year - b.year;
    });
  }, [scenarioId]);

  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return sortedEvents;
    return sortedEvents.filter((e) => e.category === categoryFilter);
  }, [sortedEvents, categoryFilter]);

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    if (initialSelectedEventId) return initialSelectedEventId;
    const matched = sortedEvents.find((e) =>
      e.linkedScenarioIds.includes(scenarioId)
    );
    return matched ? matched.id : sortedEvents[0].id;
  });

  const activeEvent =
    HISTORICAL_EVENTS.find((e) => e.id === selectedEventId) ||
    filteredEvents[0] ||
    HISTORICAL_EVENTS[0];

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    activeEvent.options[0].id
  );

  const activeOption =
    activeEvent.options.find((o) => o.id === selectedOptionId) ||
    activeEvent.options[0];

  const resolvedMap = useMemo(() => {
    const map = new Map<string, ResolvedHistoricalEventRecord>();
    for (const r of resolvedEvents) {
      map.set(r.eventId, r);
    }
    return map;
  }, [resolvedEvents]);

  const activeResolution = resolvedMap.get(activeEvent.id);

  const handleSelectEvent = (evt: HistoricalEventItem) => {
    setSelectedEventId(evt.id);
    setSelectedOptionId(evt.options[0].id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="historical-events-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#F7F6F2] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#C99A3B]">
              <History className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="historical-events-title"
                className="font-display text-xl font-bold"
              >
                Landmark Historical Events &amp; Crisis Flashpoints
              </h2>
              <p className="text-xs text-stone-300">
                Month {currentMonth} · Confront defining moments like Watergate,
                9/11, Cuban Missile Crisis, 1973 Oil Shock, and 2008 Crash
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close historical events"
            className="rounded-lg p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-6 py-3">
          <div className="flex flex-wrap gap-1.5">
            {HISTORICAL_EVENT_CATEGORIES.map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#132238] text-white'
                      : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <span className="font-mono-num text-xs font-semibold text-stone-500">
            {resolvedEvents.length} of {HISTORICAL_EVENTS.length} Flashpoints
            Addressed
          </span>
        </div>

        {/* Split Pane */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          {/* Left Event List */}
          <div className="overflow-y-auto border-b border-stone-200 bg-white p-4 lg:col-span-4 lg:border-b-0 lg:border-r space-y-2.5">
            {filteredEvents.map((evt) => {
              const isSelected = activeEvent.id === evt.id;
              const isLinked = evt.linkedScenarioIds.includes(scenarioId);
              const resolved = resolvedMap.get(evt.id);
              const Icon = CATEGORY_ICONS[evt.category];

              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => handleSelectEvent(evt)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'border-[#132238] bg-[#132238]/[0.04] ring-1 ring-[#132238]'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono-num text-[11px] font-semibold text-[#8B1E24]">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {evt.historicalDate}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isLinked && !resolved && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                          Era Match
                        </span>
                      )}
                      {resolved && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          M{resolved.monthResolved}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-1 font-display text-sm font-bold text-stone-900">
                    {evt.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                    {evt.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Decision Dossier */}
          <div className="overflow-y-auto p-6 lg:col-span-8 space-y-5">
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono-num text-xs font-bold uppercase tracking-wider text-[#8B1E24]">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeEvent.historicalDate} · {activeEvent.severity} Crisis
                </span>
                {activeEvent.linkedScenarioIds.includes(scenarioId) && (
                  <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                    Active Timeline Flashpoint
                  </span>
                )}
              </div>

              <h3 className="font-display text-2xl font-bold text-stone-900">
                {activeEvent.title}
              </h3>

              <p className="text-sm leading-relaxed text-stone-700">
                {activeEvent.summary}
              </p>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-600">
                <span className="font-bold text-stone-800">
                  Real-World Historical Precedent:{' '}
                </span>
                {activeEvent.historicalPrecedent}
              </div>
            </div>

            {activeResolution && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <span>
                    Previously Addressed in Month{' '}
                    {activeResolution.monthResolved}: {activeResolution.decision}
                  </span>
                </div>
                <p className="text-emerald-800">{activeResolution.headline}</p>
              </div>
            )}

            {/* Response Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Select Executive Crisis Response
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {activeEvent.options.map((opt) => {
                  const selected = activeOption.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-[#132238] bg-white ring-2 ring-[#132238]'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-stone-900">
                          {opt.label}
                        </span>
                        <span className="rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          {opt.stanceTag}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                        {opt.description}
                      </p>

                      {/* Preview Metric Tradeoffs */}
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-2.5 font-mono-num text-[11px] font-semibold">
                        <span
                          className={
                            opt.metricDeltas.approval >= 0
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }
                        >
                          Approval {opt.metricDeltas.approval >= 0 ? '+' : ''}
                          {opt.metricDeltas.approval}%
                        </span>
                        <span className="text-stone-300">·</span>
                        <span
                          className={
                            opt.metricDeltas.congressSupport >= 0
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }
                        >
                          Congress{' '}
                          {opt.metricDeltas.congressSupport >= 0 ? '+' : ''}
                          {opt.metricDeltas.congressSupport}%
                        </span>
                        <span className="text-stone-300">·</span>
                        <span
                          className={
                            opt.metricDeltas.diplomaticStanding >= 0
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }
                        >
                          Diplomacy{' '}
                          {opt.metricDeltas.diplomaticStanding >= 0 ? '+' : ''}
                          {opt.metricDeltas.diplomaticStanding}
                        </span>
                        {Math.abs(opt.metricDeltas.gdpGrowth) > 0.01 && (
                          <>
                            <span className="text-stone-300">·</span>
                            <span
                              className={
                                opt.metricDeltas.gdpGrowth >= 0
                                  ? 'text-emerald-700'
                                  : 'text-red-700'
                              }
                            >
                              GDP {opt.metricDeltas.gdpGrowth >= 0 ? '+' : ''}
                              {opt.metricDeltas.gdpGrowth}%
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Directive Preview + Action Footer */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-stone-700">
                <FileText
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-stone-900">
                    Executive Order &amp; Public Address Draft
                  </p>
                  <p className="mt-1 text-stone-600">
                    {activeOption.policyDraft}
                  </p>
                  <p className="mt-1 italic text-stone-500">
                    “{activeOption.speechDraft}”
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={alsoStageDraft}
                    onChange={(e) => setAlsoStageDraft(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-[#132238]"
                  />
                  <span>
                    Stage directive into Month {currentMonth} Policy Desk for AI
                    fallout simulation
                  </span>
                </label>

                <button
                  type="button"
                  disabled={Boolean(activeResolution)}
                  onClick={() =>
                    onResolveEvent(activeEvent, activeOption, alsoStageDraft)
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>
                    {activeResolution
                      ? 'Already Executed This Term'
                      : `Execute Crisis Decision (${activeEvent.year})`}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
