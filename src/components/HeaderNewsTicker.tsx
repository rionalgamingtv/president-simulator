import React, { useMemo, useState } from 'react';
import { Newspaper, Pause, Play } from 'lucide-react';
import {
  GamePhase,
  NewsHeadlineItem,
  TermHistoryEntry,
  WorkspaceTab,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';

interface HeaderNewsTickerProps {
  phase: GamePhase;
  history: TermHistoryEntry[];
  newsFeed: NewsHeadlineItem[];
  startingYear?: number;
  onSelectTab: (tab: WorkspaceTab) => void;
}

interface DeskHeadlineSnippet {
  id: string;
  tag: string;
  headline: string;
  snippet: string;
  tone: 'positive' | 'neutral' | 'critical';
  clickable: boolean;
}

const HISTORICAL_ARCHIVE_SNIPPETS: DeskHeadlineSnippet[] = [
  {
    id: 'arch-1972',
    tag: '1972 ARCHIVE · AP WIRE',
    headline: 'Nixon Arrives in Beijing for Historic Talks',
    snippet: 'Diplomats weigh strategic realignment and arms control.',
    tone: 'neutral',
    clickable: false,
  },
  {
    id: 'arch-1981',
    tag: '1981 ARCHIVE · WSJ DESK',
    headline: 'White House Pushes Sweeping Tax & Monetary Tightening',
    snippet: 'Treasury and Fed coordinate to break stagflation.',
    tone: 'neutral',
    clickable: false,
  },
  {
    id: 'arch-1993',
    tag: '1993 ARCHIVE · WASHINGTON CHRONICLE',
    headline: 'Trade Accord & Deficit Reduction Package Clear Congress',
    snippet: 'Markets rally as bipartisan coalition backs budget framework.',
    tone: 'positive',
    clickable: false,
  },
  {
    id: 'arch-2009',
    tag: '2009 ARCHIVE · REUTERS',
    headline: 'Emergency Stimulus & Bank Stress Tests Launched',
    snippet: 'Administration races to stabilize credit and manufacturing.',
    tone: 'neutral',
    clickable: false,
  },
  {
    id: 'arch-2020',
    tag: '2020 ARCHIVE · CAPITOL WIRE',
    headline: 'Bipartisan Relief Bill Advances Amid Supply Shock',
    snippet: 'Treasury deploys emergency liquidity across main street.',
    tone: 'critical',
    clickable: false,
  },
];

function trimSnippet(text: string, maxLen = 78): string {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return '';
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export const HeaderNewsTicker: React.FC<HeaderNewsTickerProps> = ({
  phase,
  history,
  newsFeed,
  startingYear,
  onSelectTab,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const items = useMemo<DeskHeadlineSnippet[]>(() => {
    if (phase === 'TITLE_SETUP') {
      return HISTORICAL_ARCHIVE_SNIPPETS;
    }

    const combined: DeskHeadlineSnippet[] = [];
    const seenHeadlines = new Set<string>();

    // Lead with the newest breaking wire headlines so every player action appears immediately
    const recentWire = [...newsFeed].slice(-10).reverse();
    for (const item of recentWire) {
      const headline = item.headline.trim();
      if (!headline || seenHeadlines.has(headline.toLowerCase())) continue;
      seenHeadlines.add(headline.toLowerCase());

      const cal = formatMonthCalendar(item.month, startingYear);
      combined.push({
        id: item.id,
        tag: `${cal.shortDate.toUpperCase()} · ${item.outlet.toUpperCase()}`,
        headline,
        snippet: trimSnippet(item.summary),
        tone: item.tone,
        clickable: phase !== 'CAREER_END',
      });
    }

    // Fill remaining ticker slots with recent monthly front-page history headlines
    const recentHistory = [...history].slice(-6).reverse();
    for (const entry of recentHistory) {
      const headline = entry.outcome.newspaperHeadline.trim();
      if (!headline || seenHeadlines.has(headline.toLowerCase())) continue;
      seenHeadlines.add(headline.toLowerCase());

      const cal = formatMonthCalendar(entry.month, startingYear);
      const snippet = trimSnippet(
        entry.outcome.newspaperSubhead || entry.outcome.outcomeNarrative
      );
      combined.push({
        id: `hist-m${entry.month}`,
        tag: `${cal.shortDate.toUpperCase()} · ${entry.outcome.newspaperOutlet.toUpperCase()}`,
        headline,
        snippet,
        tone:
          entry.outcome.metricDeltas.approval >= 0.8
            ? 'positive'
            : entry.outcome.metricDeltas.approval <= -1.2
            ? 'critical'
            : 'neutral',
        clickable: phase !== 'CAREER_END',
      });
    }

    if (combined.length === 0) {
      return HISTORICAL_ARCHIVE_SNIPPETS;
    }

    return combined.slice(0, 12);
  }, [phase, history, newsFeed, startingYear]);

  const loopItems = [...items, ...items];

  return (
    <div
      aria-label="Active news desk headline ticker"
      className="border-t border-stone-200 bg-[#0F1C2E] text-stone-100"
    >
      <div className="mx-auto flex max-w-[1320px] items-center">
        <div className="flex items-center gap-2 border-r border-white/15 bg-[#0A1320] px-4 py-1.5 shrink-0">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <Newspaper
            className="h-3.5 w-3.5 text-[#E3B857]"
            aria-hidden="true"
          />
          <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider text-[#E3B857] whitespace-nowrap">
            News Desk
          </span>
        </div>

        <div
          className="ticker-container relative flex-1 overflow-hidden py-1.5"
          aria-live="off"
        >
          <div
            className={`animate-ticker flex w-max items-center gap-6 px-4 ${
              isPaused ? 'ticker-paused' : ''
            }`}
          >
            {loopItems.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                disabled={!item.clickable}
                onClick={() => {
                  if (item.clickable) onSelectTab('news');
                }}
                className={`inline-flex items-center gap-2 text-left text-[11px] whitespace-nowrap transition-colors ${
                  item.clickable
                    ? 'hover:text-white cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                <span
                  className={`font-mono-num font-bold ${
                    item.tone === 'critical'
                      ? 'text-red-300'
                      : item.tone === 'positive'
                      ? 'text-emerald-300'
                      : 'text-[#E3B857]'
                  }`}
                >
                  [{item.tag}]
                </span>
                <span className="font-semibold text-white">
                  {item.headline}
                </span>
                {item.snippet && (
                  <span className="text-stone-300">— {item.snippet}</span>
                )}
                <span className="pl-2 text-white/25" aria-hidden="true">
                  •
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? 'Resume news desk ticker' : 'Pause news desk ticker'}
          className="flex items-center gap-1 border-l border-white/15 bg-[#0A1320] px-3 py-1.5 text-[10px] font-semibold text-stone-300 hover:bg-[#162740] hover:text-white whitespace-nowrap shrink-0"
        >
          {isPaused ? (
            <>
              <Play className="h-3 w-3 text-[#E3B857]" aria-hidden="true" />
              <span>Play</span>
            </>
          ) : (
            <>
              <Pause className="h-3 w-3 text-[#E3B857]" aria-hidden="true" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
