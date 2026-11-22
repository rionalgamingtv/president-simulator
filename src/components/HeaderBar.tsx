import React from 'react';
import { LogOut } from 'lucide-react';
import {
  GamePhase,
  NewsHeadlineItem,
  TermHistoryEntry,
  WorkspaceTab,
} from '../types/game';
import { PWAInstallControl } from './PWAInstallControl';
import { HeaderNewsTicker } from './HeaderNewsTicker';

interface HeaderBarProps {
  phase: GamePhase;
  activeTab: WorkspaceTab;
  history: TermHistoryEntry[];
  newsFeed: NewsHeadlineItem[];
  startingYear?: number;
  onSelectTab: (tab: WorkspaceTab) => void;
  onReturnToSetup: () => void;
  onOpenResign?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  phase,
  activeTab,
  history,
  newsFeed,
  startingYear,
  onSelectTab,
  onReturnToSetup,
  onOpenResign,
}) => {
  const inGame = phase !== 'TITLE_SETUP';

  const navItems: { id: WorkspaceTab; label: string }[] =
    phase === 'CAREER_END'
      ? [
          { id: 'briefing', label: 'Legacy Dossier' },
          { id: 'policy_archive', label: 'Policy Archive' },
          { id: 'library', label: 'Presidential Library' },
        ]
      : [
          { id: 'briefing', label: 'Briefing Desk' },
          { id: 'news', label: 'News & Polls' },
          { id: 'cabinet', label: 'Cabinet' },
          { id: 'military', label: 'Situation Room' },
          { id: 'policy_archive', label: 'Policy Archive' },
          { id: 'library', label: 'Presidential Library' },
        ];

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-3.5">
        <button
          type="button"
          onClick={onReturnToSetup}
          className="font-display text-lg font-bold tracking-tight text-[#132238] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238]"
        >
          Executive Term
        </button>

        {inGame ? (
          <nav
            aria-label="Administration views"
            className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-stone-600"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132238] ${
                    isActive
                      ? 'text-[#132238] font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-[#132238]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav
            aria-label="Overview sections"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
          >
            <a
              href="#candidate-profile"
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
            >
              Candidate Profile
            </a>
            <a
              href="#starting-scenarios"
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
            >
              Scenarios
            </a>
            <a
              href="#how-it-works"
              className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2.5 shrink-0">
          {phase === 'PLAYING' && onOpenResign && (
            <button
              type="button"
              onClick={onOpenResign}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 transition-colors hover:bg-red-100 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Resign</span>
            </button>
          )}
          <PWAInstallControl variant="header" />
        </div>
      </div>

      {inGame && (
        <nav
          aria-label="Mobile administration views"
          className="flex md:hidden items-center gap-2 overflow-x-auto border-t border-stone-100 px-4 py-2"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#132238] text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      <HeaderNewsTicker
        phase={phase}
        history={history}
        newsFeed={newsFeed}
        startingYear={startingYear}
        onSelectTab={onSelectTab}
      />
    </header>
  );
};
