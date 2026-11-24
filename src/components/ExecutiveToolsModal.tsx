import React, { useRef, useState } from 'react';
import {
  Award,
  Download,
  FileCheck2,
  Landmark,
  Scale,
  Upload,
  X,
} from 'lucide-react';
import {
  AdminSuiteState,
  SavedCareerState,
} from '../types/game';
import {
  CAMP_DAVID_OPTIONS,
  CampDavidRetreatOption,
  PARDON_CANDIDATES,
  PardonCandidate,
  PROCLAMATION_OPTIONS,
  ProclamationOption,
} from '../data/executiveSuite';

type ToolsTab = 'pardons' | 'proclamations' | 'camp_david' | 'backup';

interface ExecutiveToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: number;
  adminSuite: AdminSuiteState;
  careerSnapshot: SavedCareerState;
  onGrantPardon: (candidate: PardonCandidate) => void;
  onIssueProclamation: (option: ProclamationOption) => void;
  onHostCampDavid: (option: CampDavidRetreatOption) => void;
  onImportCareerJson: (imported: SavedCareerState) => void;
}

export const ExecutiveToolsModal: React.FC<ExecutiveToolsModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  adminSuite,
  careerSnapshot,
  onGrantPardon,
  onIssueProclamation,
  onHostCampDavid,
  onImportCareerJson,
}) => {
  const [activeTab, setActiveTab] = useState<ToolsTab>('pardons');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const pardonUsedThisMonth = adminSuite.lastPardonMonth === currentMonth;
  const procCooldownRemaining =
    typeof adminSuite.lastProclamationMonth === 'number'
      ? Math.max(0, 3 - (currentMonth - adminSuite.lastProclamationMonth))
      : 0;
  const campDavidCooldownRemaining =
    typeof adminSuite.lastCampDavidMonth === 'number'
      ? Math.max(0, 6 - (currentMonth - adminSuite.lastCampDavidMonth))
      : 0;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(careerSnapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-term-month-${currentMonth}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SavedCareerState;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.profile ||
        !parsed.metrics ||
        !parsed.currentBriefing
      ) {
        throw new Error('Invalid Executive Term save file format.');
      }
      onImportCareerJson(parsed);
      setImportSuccess(
        `Restored career for President ${parsed.profile.name} (Month ${parsed.currentMonth}).`
      );
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Unable to parse save file.'
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exec-tools-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              White House Executive Powers &amp; Desk Tools
            </p>
            <h3
              id="exec-tools-title"
              className="mt-1 font-display text-xl font-semibold text-stone-900"
            >
              Pardons, Proclamations, Camp David &amp; Save Backup
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close executive powers modal"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1">
          {[
            { id: 'pardons' as const, label: 'Pardons & Clemency', icon: Scale },
            { id: 'proclamations' as const, label: 'Proclamations', icon: Award },
            { id: 'camp_david' as const, label: 'Camp David Summit', icon: Landmark },
            { id: 'backup' as const, label: 'Career Backup (.json)', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'pardons' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              <span>
                Article II clemency authority. Limit one clemency warrant per
                month.
              </span>
              <span className="font-mono-num font-semibold text-stone-800">
                {pardonUsedThisMonth
                  ? 'Issued This Month'
                  : 'Available This Month'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PARDON_CANDIDATES.map((cand) => (
                <div
                  key={cand.id}
                  className="rounded-lg border border-stone-200 bg-stone-50/70 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-stone-500">
                      {cand.category}
                    </p>
                    <h4 className="text-sm font-semibold text-stone-900">
                      {cand.recipient}
                    </h4>
                    <p className="text-xs leading-relaxed text-stone-600">
                      {cand.summary}
                    </p>
                    <p className="pt-1 font-mono-num text-[11px] text-stone-700">
                      {cand.tradeoffNote}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pardonUsedThisMonth}
                    onClick={() => {
                      onGrantPardon(cand);
                      onClose();
                    }}
                    className="rounded-lg bg-[#132238] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                  >
                    Sign Pardon Warrant
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'proclamations' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              <span>
                Ceremonial Rose Garden proclamations build goodwill across
                targeted coalitions (3-month cooldown).
              </span>
              <span className="font-mono-num font-semibold text-stone-800">
                {procCooldownRemaining > 0
                  ? `Cooldown: ${procCooldownRemaining} mo`
                  : 'Ready'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROCLAMATION_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className="rounded-lg border border-stone-200 bg-stone-50/70 p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-stone-900">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-stone-600">{opt.focus}</p>
                    <p className="font-mono-num text-[11px] text-emerald-800">
                      +{opt.approvalDelta.toFixed(1)}% Approval · +
                      {opt.congressDelta.toFixed(1)}% Congress
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={procCooldownRemaining > 0}
                    onClick={() => {
                      onIssueProclamation(opt);
                      onClose();
                    }}
                    className="rounded-lg bg-[#132238] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                  >
                    Issue Proclamation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'camp_david' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              <span>
                Convene private off-camera leadership negotiations at Camp David
                (6-month cooldown).
              </span>
              <span className="font-mono-num font-semibold text-stone-800">
                {campDavidCooldownRemaining > 0
                  ? `Cooldown: ${campDavidCooldownRemaining} mo`
                  : 'Available'}
              </span>
            </div>
            <div className="space-y-3">
              {CAMP_DAVID_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className="rounded-lg border border-stone-200 bg-stone-50/70 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-lg">
                    <p className="text-[11px] font-medium text-stone-500">
                      Guests: {opt.guestList}
                    </p>
                    <h4 className="text-sm font-semibold text-stone-900">
                      {opt.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-stone-600">
                      {opt.summary}
                    </p>
                    <p className="font-mono-num text-[11px] text-stone-700">
                      Congress +{opt.congressDelta.toFixed(1)}% · Approval +
                      {opt.approvalDelta.toFixed(1)}% · Diplomacy +
                      {opt.diplomaticDelta.toFixed(1)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={campDavidCooldownRemaining > 0}
                    onClick={() => {
                      onHostCampDavid(opt);
                      onClose();
                    }}
                    className="rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45 shrink-0"
                  >
                    Convene Retreat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-stone-600">
              Export your complete presidency (metrics, cabinet, legislative
              archive, milestones, and timeline) as a local JSON file, or
              restore a previously saved career file.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E3557]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export Career Save (.json)</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Restore Career Save (.json)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {importError && (
              <p className="text-xs font-medium text-red-700">{importError}</p>
            )}
            {importSuccess && (
              <p className="text-xs font-medium text-emerald-700">
                {importSuccess}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
