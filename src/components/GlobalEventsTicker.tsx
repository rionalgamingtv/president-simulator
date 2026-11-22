import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Pause, Play } from 'lucide-react';
import {
  InstitutionalState,
  MilitaryCommandState,
  MonthlyBriefing,
  NationalMetrics,
  NewsHeadlineItem,
  TurnOutcome,
  WorkspaceTab,
} from '../types/game';
import { formatMonthCalendar } from '../data/historicalPresidents';

interface TickerItem {
  id: string;
  tag: string;
  text: string;
  targetTab: WorkspaceTab;
  tone: 'alert' | 'gold' | 'normal';
}

interface GlobalEventsTickerProps {
  currentMonth: number;
  startingYear?: number;
  metrics: NationalMetrics;
  military: MilitaryCommandState;
  institutions: InstitutionalState;
  newsFeed: NewsHeadlineItem[];
  briefing: MonthlyBriefing;
  latestOutcome: TurnOutcome | null;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

export const GlobalEventsTicker: React.FC<GlobalEventsTickerProps> = ({
  currentMonth,
  startingYear,
  metrics,
  military,
  institutions,
  newsFeed,
  briefing,
  latestOutcome,
  onNavigateTab,
}) => {
  const calendarLabel = formatMonthCalendar(currentMonth, startingYear);
  const [isPaused, setIsPaused] = useState(false);
  const [wireCycle, setWireCycle] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setWireCycle((c) => c + 1);
    }, 18000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const tickerItems = useMemo<TickerItem[]>(() => {
    const items: TickerItem[] = [];

    if (latestOutcome) {
      items.push({
        id: `outcome-${latestOutcome.month}`,
        tag: `${latestOutcome.newspaperOutlet.toUpperCase()}`,
        text: latestOutcome.newspaperHeadline,
        targetTab: 'news',
        tone: 'gold',
      });
    }

    const recentNews = [...newsFeed].slice(-4).reverse();
    for (const n of recentNews) {
      items.push({
        id: n.id,
        tag: `${n.outlet.toUpperCase()} · ${n.category.toUpperCase()}`,
        text: n.headline,
        targetTab: n.category === 'defense' ? 'military' : 'news',
        tone: n.tone === 'critical' ? 'alert' : 'normal',
      });
    }

    for (const op of military.operations.slice(0, 2)) {
      items.push({
        id: `op-${op.id}`,
        tag: `PENTAGON · ${op.region.toUpperCase()}`,
        text: `${op.name} (${op.posture}): ${op.statusNote}`,
        targetTab: 'military',
        tone: op.posture === 'Active Strike' ? 'alert' : 'normal',
      });
    }

    items.push({
      id: `fed-m${currentMonth}`,
      tag: 'GLOBAL MARKETS & FED',
      text: `Fed Funds ${institutions.fedFundsRate.toFixed(2)}% (${institutions.fedStance}) · U.S. GDP ${metrics.gdpGrowth.toFixed(1)}% · CPI ${metrics.inflation.toFixed(1)}% · Diplomatic Index ${metrics.diplomaticStanding.toFixed(0)}/100`,
      targetTab: 'news',
      tone: metrics.inflation >= 5 ? 'alert' : 'normal',
    });

    const dynamicGlobalPool: TickerItem[] = [
      {
        id: 'dyn-brussels',
        tag: 'BRUSSELS WIRE',
        text:
          metrics.diplomaticStanding >= 60
            ? 'EU Trade Commissioners signal openness to harmonized trans-Atlantic green-tech tariffs.'
            : 'European Parliament trade committee delays reciprocal industrial subsidy framework pending Washington talks.',
        targetTab: 'news',
        tone: 'normal',
      },
      {
        id: 'dyn-strait',
        tag: 'MARITIME WATCH',
        text:
          military.defconLevel <= 3
            ? `Elevated naval insurance premiums reported across Indo-Pacific corridors under DEFCON ${military.defconLevel}.`
            : 'Commercial container transit through Strait of Malacca and Suez routes running on normal schedules.',
        targetTab: 'military',
        tone: military.defconLevel <= 3 ? 'alert' : 'normal',
      },
      {
        id: 'dyn-energy',
        tag: 'GENEVA ENERGY DESK',
        text:
          metrics.inflation >= 4.2
            ? 'Brent crude futures edge higher on supply discipline ahead of next ministerial production quota review.'
            : 'Refined LNG spot cargoes ease in Asian and European hubs following mild seasonal inventory builds.',
        targetTab: 'news',
        tone: 'normal',
      },
      {
        id: 'dyn-cyber',
        tag: 'CYBER COMMAND',
        text: `Allied infrastructure threat posture held at ${military.cyberPosture}; joint telemetry active with G7 clearinghouses.`,
        targetTab: 'military',
        tone: military.cyberPosture === 'Active Shield' ? 'gold' : 'normal',
      },
      {
        id: 'dyn-tokyo',
        tag: 'TOKYO & FRANKFURT',
        text:
          metrics.gdpGrowth >= 2.2
            ? 'Sovereign bond desks price steady U.S. expansion and resilient dollar liquidity across G10 pairs.'
            : 'Central bank governors warn sluggish global manufacturing output requires coordinated fiscal restraint.',
        targetTab: 'news',
        tone: 'normal',
      },
      {
        id: 'dyn-intel',
        tag: 'FOREIGN BRIEF',
        text: briefing.foreignIssue,
        targetTab: 'military',
        tone: 'gold',
      },
    ];

    const rotatedOffset = wireCycle % dynamicGlobalPool.length;
    const rotatedGlobals = [
      ...dynamicGlobalPool.slice(rotatedOffset),
      ...dynamicGlobalPool.slice(0, rotatedOffset),
    ];

    items.push(...rotatedGlobals.slice(0, 4));

    return items;
  }, [
    briefing.foreignIssue,
    currentMonth,
    institutions.fedFundsRate,
    institutions.fedStance,
    latestOutcome,
    metrics.diplomaticStanding,
    metrics.gdpGrowth,
    metrics.inflation,
    military.cyberPosture,
    military.defconLevel,
    military.operations,
    newsFeed,
    wireCycle,
  ]);

  const loopItems = [...tickerItems, ...tickerItems];

  return (
    <section
      aria-label="Real-time simulated global events ticker"
      className="sticky bottom-3 z-20 rounded-xl border border-[#23395B] bg-[#132238] text-stone-100 shadow-lg overflow-hidden"
    >
      <div className="flex items-center">
        <div className="flex items-center gap-2 border-r border-white/15 bg-[#0D1829] px-3.5 py-2.5 shrink-0">
          <Globe className="h-3.5 w-3.5 text-[#C99A3B]" aria-hidden="true" />
          <span className="font-mono-num text-[11px] font-bold tracking-wide text-[#C99A3B] whitespace-nowrap">
            GLOBAL WIRE · {calendarLabel.shortDate.toUpperCase()}
          </span>
        </div>

        <div
          className="ticker-container relative flex-1 overflow-hidden py-2.5"
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
                onClick={() => onNavigateTab(item.targetTab)}
                className="inline-flex items-center gap-2 text-left text-xs whitespace-nowrap hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#C99A3B]"
              >
                <span
                  className={`font-mono-num font-bold ${
                    item.tone === 'alert'
                      ? 'text-red-300'
                      : item.tone === 'gold'
                      ? 'text-[#E3B857]'
                      : 'text-sky-300'
                  }`}
                >
                  [{item.tag}]
                </span>
                <span className="text-stone-100">{item.text}</span>
                <span className="pl-3 text-white/25" aria-hidden="true">
                  /
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={
            isPaused ? 'Resume global events ticker' : 'Pause global events ticker'
          }
          className="flex items-center gap-1.5 border-l border-white/15 bg-[#0D1829] px-3.5 py-2.5 text-[11px] font-semibold text-stone-200 hover:bg-[#1A2E4B] hover:text-white whitespace-nowrap shrink-0"
        >
          {isPaused ? (
            <>
              <Play className="h-3 w-3 text-[#C99A3B]" aria-hidden="true" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-3 w-3 text-[#C99A3B]" aria-hidden="true" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
