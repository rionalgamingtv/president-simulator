import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollText,
  X,
  Search,
  ArrowDownUp,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileSignature,
} from 'lucide-react';
import {
  LegislativeRecordItem,
  PresidentProfile,
  TermHistoryEntry,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';

interface ExecutiveOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PresidentProfile;
  scenarioTitle: string;
  legislativeRecords: LegislativeRecordItem[];
  history: TermHistoryEntry[];
}

type EoStatusFilter = 'all' | LegislativeRecordItem['outcomeStatus'];

interface EnrichedExecutiveOrder {
  eoNumber: string;
  month: number;
  calendarDate: string;
  title: string;
  summary: string;
  outcomeStatus: LegislativeRecordItem['outcomeStatus'];
  approvalImpact: number;
  directiveText?: string;
  pressHeadline?: string;
  pressOutlet?: string;
}

export const ExecutiveOrdersModal: React.FC<ExecutiveOrdersModalProps> = ({
  isOpen,
  onClose,
  profile,
  scenarioTitle,
  legislativeRecords,
  history,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EoStatusFilter>('all');
  const [newestFirst, setNewestFirst] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const executiveOrders = useMemo<EnrichedExecutiveOrder[]>(() => {
    const historyByMonth = new Map<number, TermHistoryEntry>();
    for (const h of history) {
      historyByMonth.set(h.month, h);
    }

    // Collect Executive Order records from legislativeRecords, and supplement from history if needed
    const rawOrders: LegislativeRecordItem[] = legislativeRecords.filter(
      (r) => r.recordType === 'Executive Order'
    );

    const seenMonths = new Set(rawOrders.map((r) => `${r.month}-${r.title}`));
    for (const h of history) {
      const rec = h.outcome.legislativeRecord;
      if (rec && rec.recordType === 'Executive Order') {
        const key = `${h.month}-${rec.title}`;
        if (!seenMonths.has(key)) {
          seenMonths.add(key);
          rawOrders.push({
            id: `eo-hist-${h.month}`,
            month: h.month,
            recordType: 'Executive Order',
            title: rec.title,
            summary: rec.summary,
            outcomeStatus: rec.outcomeStatus,
            approvalImpact: h.outcome.metricDeltas.approval,
          });
        }
      }
    }

    const chronological = [...rawOrders].sort((a, b) => a.month - b.month);
    return chronological.map((rec, idx) => {
      const h = historyByMonth.get(rec.month);
      const cal = formatMonthCalendar(rec.month, profile.startingYear);
      return {
        eoNumber: `EO ${14201 + idx}`,
        month: rec.month,
        calendarDate: cal.shortDate,
        title: rec.title,
        summary: rec.summary,
        outcomeStatus: rec.outcomeStatus,
        approvalImpact: rec.approvalImpact,
        directiveText: h?.policyDirective,
        pressHeadline: h?.outcome.newspaperHeadline,
        pressOutlet: h?.outcome.newspaperOutlet,
      };
    });
  }, [legislativeRecords, history, profile.startingYear]);

  const stats = useMemo(() => {
    let enacted = 0;
    let compromise = 0;
    let blocked = 0;
    let netApproval = 0;
    for (const eo of executiveOrders) {
      if (eo.outcomeStatus === 'Enacted') enacted += 1;
      else if (eo.outcomeStatus === 'Compromise') compromise += 1;
      else blocked += 1;
      netApproval += eo.approvalImpact;
    }
    return {
      total: executiveOrders.length,
      enacted,
      compromise,
      blocked,
      netApproval,
    };
  }, [executiveOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = executiveOrders.filter((eo) => {
      if (statusFilter !== 'all' && eo.outcomeStatus !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = [
          eo.eoNumber,
          eo.title,
          eo.summary,
          eo.directiveText || '',
          eo.pressHeadline || '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return newestFirst ? [...list].reverse() : list;
  }, [executiveOrders, searchQuery, statusFilter, newestFirst]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="executive-orders-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 bg-[#F7F6F2] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <FileSignature
                className="h-3.5 w-3.5 text-[#132238]"
                aria-hidden="true"
              />
              <span>
                Federal Register · {profile.name} Administration ({scenarioTitle})
              </span>
            </div>
            <h2
              id="executive-orders-modal-title"
              className="mt-1 font-display text-2xl font-bold text-[#132238]"
            >
              Executive Orders Signed This Term
            </h2>
            <p className="mt-0.5 text-xs text-stone-600">
              Unilateral presidential proclamations &amp; executive actions
              enacted, modified, or blocked during the current term.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Executive Orders modal"
            className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary Strip & Filter Controls */}
        <div className="border-b border-stone-200 bg-white px-6 py-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
              <span className="block text-[11px] font-medium text-stone-500">
                Total Signed
              </span>
              <span className="font-mono-num text-xl font-bold text-[#132238]">
                {stats.total}
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
              <span className="block text-[11px] font-medium text-stone-500">
                In Force (Enacted)
              </span>
              <span className="font-mono-num text-xl font-bold text-emerald-700">
                {stats.enacted}
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
              <span className="block text-[11px] font-medium text-stone-500">
                Enjoined / Blocked
              </span>
              <span className="font-mono-num text-xl font-bold text-red-700">
                {stats.blocked}
              </span>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5">
              <span className="block text-[11px] font-medium text-stone-500">
                Cumulative Approval Shift
              </span>
              <span
                className={`font-mono-num text-xl font-bold ${
                  stats.netApproval >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {stats.netApproval >= 0 ? '+' : ''}
                {stats.netApproval.toFixed(1)}%
              </span>
            </div>
          </div>

          {executiveOrders.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search EO number, title, or directive text..."
                  aria-label="Search executive orders"
                  className="w-full rounded-lg border border-stone-300 bg-white py-1.5 pl-8 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#132238] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-0.5">
                  {(['all', 'Enacted', 'Compromise', 'Blocked'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          statusFilter === st
                            ? 'bg-white text-[#132238] shadow-sm'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {st === 'all' ? 'All' : st}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setNewestFirst((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <ArrowDownUp className="h-3 w-3" aria-hidden="true" />
                  <span>{newestFirst ? 'Newest First' : 'Oldest First'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Executive Orders List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5 bg-[#F7F6F2]/50">
          {executiveOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center space-y-2.5">
              <ScrollText
                className="mx-auto h-7 w-7 text-stone-400"
                aria-hidden="true"
              />
              <h3 className="font-display text-lg font-semibold text-stone-900">
                No Executive Orders Signed Yet
              </h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-stone-600">
                Directives you issue that rely on unilateral presidential
                authority (classified as Executive Orders) will be numbered and
                archived here for quick inspection during your term.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-center space-y-2">
              <p className="text-xs font-medium text-stone-600">
                No Executive Orders match your current search or filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-xs font-semibold text-[#132238] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((eo) => {
              const StatusIcon =
                eo.outcomeStatus === 'Enacted'
                  ? CheckCircle2
                  : eo.outcomeStatus === 'Compromise'
                  ? Scale
                  : AlertTriangle;

              const statusBadge =
                eo.outcomeStatus === 'Enacted'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : eo.outcomeStatus === 'Compromise'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-red-200 bg-red-50 text-red-800';

              return (
                <article
                  key={`${eo.eoNumber}-${eo.month}`}
                  className="rounded-xl border border-stone-200 bg-white p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-[#132238] px-2 py-0.5 font-mono-num font-bold text-white">
                          {eo.eoNumber}
                        </span>
                        <span className="font-mono-num font-semibold text-stone-600">
                          Month {String(eo.month).padStart(2, '0')} ·{' '}
                          {eo.calendarDate}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${statusBadge}`}
                        >
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          <span>{eo.outcomeStatus}</span>
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-stone-900">
                        {eo.title}
                      </h3>
                    </div>

                    <div className="text-right font-mono-num text-xs shrink-0">
                      <span className="block text-[11px] text-stone-500">
                        Approval Impact
                      </span>
                      <span
                        className={`font-bold ${
                          eo.approvalImpact >= 0
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }`}
                      >
                        {eo.approvalImpact >= 0 ? '+' : ''}
                        {eo.approvalImpact.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-stone-800">
                    {eo.summary}
                  </p>

                  {eo.directiveText && (
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        Signed Order Text
                      </span>
                      <p className="text-xs leading-relaxed text-stone-700 whitespace-pre-line">
                        {eo.directiveText}
                      </p>
                    </div>
                  )}

                  {eo.pressHeadline && (
                    <p className="text-[11px] text-stone-500">
                      <strong className="text-stone-700">
                        {eo.pressOutlet || 'Press Reaction'}:
                      </strong>{' '}
                      &ldquo;{eo.pressHeadline}&rdquo;
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-3.5 text-xs text-stone-500">
          <span>
            Showing {filteredOrders.length} of {executiveOrders.length}{' '}
            Executive Orders
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
