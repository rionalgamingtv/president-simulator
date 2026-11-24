import React, { useState } from 'react';
import { Shield, Sparkles, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MilitaryCommandState, PresidentProfile } from '../types/game';

interface NominateJcsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PresidentProfile;
  military: MilitaryCommandState;
  isSubmitting: boolean;
  onNominate: (direction: string) => Promise<void>;
}

const PRESET_DIRECTIONS = [
  'Appoint a hawkish, forward-deterrence combat veteran with strong bipartisan support in the Senate Armed Services Committee.',
  'Select a coalition-oriented strategic planner with deep experience in Indo-Pacific naval readiness and alliance integration.',
  'Nominate a tech-forward cyber and space defense specialist focused on modernization and unmanned systems.',
  'Choose a seasoned logistical commander who prioritized troops welfare, supply chain resilience, and fiscal restraint.',
];

export const NominateJcsModal: React.FC<NominateJcsModalProps> = ({
  isOpen,
  onClose,
  military,
  isSubmitting,
  onNominate,
}) => {
  const [direction, setDirection] = useState(PRESET_DIRECTIONS[0]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nominate-jcs-title"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (isSubmitting) return;
          await onNominate(direction);
        }}
        className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#132238]">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Senate Armed Services Confirmation</span>
            </div>
            <h3
              id="nominate-jcs-title"
              className="mt-1 font-display text-xl font-bold text-stone-900"
            >
              Nominate Permanent Chair of the Joint Chiefs
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close JCS nomination modal"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-stone-700">
          <p className="text-xs leading-relaxed text-stone-600">
            Current Chair position is held in an interim capacity (
            <strong className="text-stone-800">
              {military.jointChiefsChair.name}
            </strong>
            ). Specify your nominee profile or doctrine to submit to the Senate
            Armed Services Committee for roll-call confirmation.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-800">
              Select or Write Nominee Profile &amp; Doctrine:
            </label>
            <div className="space-y-1.5">
              {PRESET_DIRECTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDirection(preset)}
                  className={`w-full rounded-lg border p-2.5 text-left text-xs transition-colors ${
                    direction === preset
                      ? 'border-[#132238] bg-stone-50 font-medium text-stone-900 ring-1 ring-[#132238]/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="custom-jcs-dir"
              className="block text-xs font-semibold text-stone-800"
            >
              Custom Nominee Direction
            </label>
            <textarea
              id="custom-jcs-dir"
              rows={2}
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !direction.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E3557] disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Senate Committee Vote...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Submit Nomination to Senate</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
