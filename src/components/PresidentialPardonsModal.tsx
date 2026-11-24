import React, { useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { CLEMENCY_PETITIONS, ClemencyPetition } from '../data/pardons';
import { NationalMetrics, VoterBlocs } from '../types/game';

interface PresidentialPardonsModalProps {
  currentMonth: number;
  metrics: NationalMetrics;
  onResolvePetition: (result: {
    petitionTitle: string;
    actionLabel: string;
    approvalDelta: number;
    congressDelta: number;
    justiceLoyaltyDelta: number;
    blocImpacts: Partial<VoterBlocs>;
    headline: string;
    newsTone: 'positive' | 'neutral' | 'critical';
  }) => void;
  onClose: () => void;
}

export const PresidentialPardonsModal: React.FC<PresidentialPardonsModalProps> = ({
  currentMonth,
  onResolvePetition,
  onClose,
}) => {
  const [selectedPetitionId, setSelectedPetitionId] = useState<string>(
    CLEMENCY_PETITIONS[0].id
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    CLEMENCY_PETITIONS[0].options[0].id
  );
  const [grantedHistory, setGrantedHistory] = useState<string[]>([]);

  const activePetition =
    CLEMENCY_PETITIONS.find((p) => p.id === selectedPetitionId) ||
    CLEMENCY_PETITIONS[0];
  const activeOption =
    activePetition.options.find((o) => o.id === selectedOptionId) ||
    activePetition.options[0];

  const handleExecuteClemency = () => {
    onResolvePetition({
      petitionTitle: activePetition.applicantName,
      actionLabel: activeOption.actionLabel,
      approvalDelta: activeOption.approvalDelta,
      congressDelta: activeOption.congressDelta,
      justiceLoyaltyDelta: activeOption.justiceLoyaltyDelta,
      blocImpacts: activeOption.blocImpacts,
      headline: activeOption.mediaHeadline,
      newsTone: activeOption.newsTone,
    });
    setGrantedHistory((prev) => [...prev, activePetition.id]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Presidential Pardons & Clemency Board"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[#132238] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#C99A3B]">
              <Scale className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C99A3B]">
                Executive Clemency &amp; Justice Review · Month {currentMonth}
              </p>
              <h2 className="font-display text-xl font-bold text-white">
                Presidential Pardons &amp; Sentence Commutations
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Petition Sidebar */}
          <div className="md:col-span-5 border-r border-stone-200 bg-stone-50 p-5 overflow-y-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
              Pending Clemency Petitions ({CLEMENCY_PETITIONS.length})
            </p>
            <div className="space-y-2">
              {CLEMENCY_PETITIONS.map((pet) => {
                const picked = selectedPetitionId === pet.id;
                const isGranted = grantedHistory.includes(pet.id);
                return (
                  <button
                    key={pet.id}
                    type="button"
                    onClick={() => {
                      setSelectedPetitionId(pet.id);
                      setSelectedOptionId(pet.options[0].id);
                    }}
                    className={`w-full rounded-xl border p-3.5 text-left transition-colors flex flex-col justify-between ${
                      picked
                        ? 'border-[#132238] bg-white ring-1 ring-[#132238]'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#8B1E24]">
                          {pet.category}
                        </span>
                        {isGranted && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-stone-900">
                        {pet.applicantName}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600 line-clamp-2">
                        {pet.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Petition Detail & Action Panel */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <span className="inline-block rounded bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                  {activePetition.category}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-stone-900">
                  {activePetition.applicantName}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700 bg-stone-50 rounded-xl p-4 border border-stone-200">
                  {activePetition.summary}
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <ShieldCheck className="h-4 w-4 text-[#132238]" aria-hidden="true" />
                  <span>Department of Justice &amp; Stakeholder Assessment</span>
                </div>
                <p className="text-xs leading-relaxed text-stone-600">
                  {activePetition.backgroundNote}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-stone-900">
                  Executive Decision &amp; Clemency Action:
                </label>
                <div className="space-y-2.5">
                  {activePetition.options.map((opt) => {
                    const picked = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors flex items-start gap-3 ${
                          picked
                            ? 'border-[#132238] bg-[#132238]/[0.03] ring-1 ring-[#132238]'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            picked
                              ? 'border-[#132238] bg-[#132238] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {picked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-bold text-stone-900">
                            {opt.actionLabel}
                          </p>
                          <p className="text-xs leading-relaxed text-stone-600">
                            {opt.description}
                          </p>
                          <div className="pt-2 flex flex-wrap items-center gap-3 font-mono-num text-[11px] font-semibold">
                            <span
                              className={
                                opt.approvalDelta >= 0
                                  ? 'text-emerald-700'
                                  : 'text-red-700'
                              }
                            >
                              {opt.approvalDelta >= 0 ? '+' : ''}
                              {opt.approvalDelta}% Approval
                            </span>
                            <span
                              className={
                                opt.congressDelta >= 0
                                  ? 'text-emerald-700'
                                  : 'text-red-700'
                              }
                            >
                              {opt.congressDelta >= 0 ? '+' : ''}
                              {opt.congressDelta}% Congress
                            </span>
                            <span
                              className={
                                opt.justiceLoyaltyDelta >= 0
                                  ? 'text-emerald-700'
                                  : 'text-red-700'
                              }
                            >
                              {opt.justiceLoyaltyDelta >= 0 ? '+' : ''}
                              {opt.justiceLoyaltyDelta} DOJ Loyalty
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteClemency}
                className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3557]"
              >
                <span>Sign Executive Clemency Order</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
