import React, { useState } from 'react';
import {
  UserCheck,
  RefreshCw,
  MessageSquarePlus,
  X,
  Landmark,
  CheckCircle2,
  XCircle,
  Search,
  UserX,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Newspaper,
  Building2,
  Handshake,
} from 'lucide-react';
import {
  CabinetConfirmationResult,
  CabinetDepartment,
  CabinetHarmonyOutcome,
  CabinetMember,
  FireOfficialRequest,
  FireTargetCategory,
  MilitaryCommandState,
  NationalMetrics,
  OfficialDismissalResult,
  PartyId,
  VicePresidentProfile,
  VpNominationResult,
} from '../types/game';
import { getPartyMeta } from '../data/scenarios';
import { CABINET_ROSTER_OPTIONS, VP_CANDIDATES } from '../data/appointees';
import { getCabinetHarmonySummary } from '../data/cabinetHarmony';
import { CabinetHarmonyModal } from './CabinetHarmonyModal';

interface CabinetViewProps {
  party?: PartyId;
  currentMonth: number;
  vicePresident: VicePresidentProfile;
  cabinet: CabinetMember[];
  military: MilitaryCommandState;
  metrics: NationalMetrics;
  isReplacingId: CabinetDepartment | null;
  isFiringOfficial: boolean;
  isNominatingVp: boolean;
  lastConfirmation: CabinetConfirmationResult | null;
  lastVpConfirmation: VpNominationResult | null;
  latestDismissalResult: OfficialDismissalResult | null;
  latestHarmonyOutcome: CabinetHarmonyOutcome | null;
  harmonyMeetingMonths: Partial<Record<CabinetDepartment, number>>;
  dismissedOtherOfficials: string[];
  errorMsg: string | null;
  onDismissConfirmation: () => void;
  onDismissVpConfirmation: () => void;
  onDismissDismissalResult: () => void;
  onDismissHarmonyOutcome: () => void;
  onCompleteHarmonyMeeting: (outcome: CabinetHarmonyOutcome) => void;
  onReplaceCabinet: (
    member: CabinetMember,
    replacementDirection: string
  ) => Promise<void>;
  onNominateVp: (nomineeDirection: string) => Promise<void>;
  onFireOfficial: (req: FireOfficialRequest) => Promise<void>;
  onDraftFromCounsel: (roleLabel: string, name: string, counsel: string) => void;
}

const WHITE_HOUSE_ROLE_IDS = new Set<CabinetDepartment>([
  'chief_of_staff',
  'nsa',
  'press_secretary',
]);

const OTHER_WHITE_HOUSE_OFFICIALS: {
  id: string;
  roleTitle: string;
  defaultName: string;
  office: string;
  note: string;
}[] = [
  {
    id: 'wh_counsel',
    roleTitle: 'White House Counsel',
    defaultName: 'Margaret Sullivan',
    office: 'Office of the White House Counsel',
    note: 'Chief legal adviser to the President on executive privilege, pardons, and ethics.',
  },
  {
    id: 'omb_director',
    roleTitle: 'Director of Management & Budget (OMB)',
    defaultName: 'David Park',
    office: 'Office of Management and Budget',
    note: 'Oversees federal budget requests, regulatory review, and agency funding.',
  },
  {
    id: 'comms_director',
    roleTitle: 'White House Communications Director',
    defaultName: 'Rachel Vasquez',
    office: 'West Wing Communications',
    note: 'Directs national messaging strategy, speechwriting, and broadcast surrogates.',
  },
  {
    id: 'dpc_director',
    roleTitle: 'Domestic Policy Council Director',
    defaultName: 'Dr. Leonard Brooks',
    office: 'Domestic Policy Council',
    note: 'Coordinates healthcare, housing, education, and regulatory initiatives.',
  },
  {
    id: 'cia_director',
    roleTitle: 'Director of the Central Intelligence Agency',
    defaultName: 'William Caldwell',
    office: 'Central Intelligence Agency',
    note: 'Leads foreign intelligence collection, covert operations, and daily threat briefs.',
  },
  {
    id: 'fbi_director',
    roleTitle: 'Director of the Federal Bureau of Investigation',
    defaultName: 'Christopher Vance',
    office: 'Federal Bureau of Investigation',
    note: 'Serves a statutory 10-year term; firing triggers sharp Judiciary oversight.',
  },
];

const QUICK_FIRE_REASONS = [
  'Fundamental policy disagreements and failure to execute presidential directives.',
  'Loss of confidence over repeated West Wing leaks and public mixed messaging.',
  'Departmental mismanagement and poor coordination during high-stakes negotiations.',
  'Administration reset to install leadership aligned with the second-half agenda.',
];

interface PendingFireTarget {
  targetCategory: FireTargetCategory;
  targetId?: string;
  targetName: string;
  roleTitle: string;
  warningText: string;
}

function formatMetricDeltaPill(label: string, val?: number, suffix = '') {
  const num = Number(val || 0);
  if (Math.abs(num) < 0.01) return null;
  const isPositive = num > 0;
  return (
    <span
      key={label}
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono-num text-[11px] font-semibold ${
        isPositive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {label} {num > 0 ? `+${num}` : num}
      {suffix}
    </span>
  );
}

export const CabinetView: React.FC<CabinetViewProps> = ({
  party,
  currentMonth,
  vicePresident,
  cabinet,
  military,
  metrics,
  isReplacingId,
  isFiringOfficial,
  isNominatingVp,
  lastConfirmation,
  lastVpConfirmation,
  latestDismissalResult,
  latestHarmonyOutcome,
  harmonyMeetingMonths,
  dismissedOtherOfficials,
  errorMsg,
  onDismissConfirmation,
  onDismissVpConfirmation,
  onDismissDismissalResult,
  onDismissHarmonyOutcome,
  onCompleteHarmonyMeeting,
  onReplaceCabinet,
  onNominateVp,
  onFireOfficial,
  onDraftFromCounsel,
}) => {
  const partyMeta = getPartyMeta(party);
  const [nominateTarget, setNominateTarget] = useState<CabinetMember | null>(
    null
  );
  const [directionInput, setDirectionInput] = useState('');
  const [nomineeSearch, setNomineeSearch] = useState('');

  const [showNominateVpModal, setShowNominateVpModal] = useState(false);
  const [vpDirectionInput, setVpDirectionInput] = useState('');
  const [vpSearch, setVpSearch] = useState('');

  const [fireTarget, setFireTarget] = useState<PendingFireTarget | null>(null);
  const [fireReasonInput, setFireReasonInput] = useState(QUICK_FIRE_REASONS[0]);

  const [harmonyTarget, setHarmonyTarget] = useState<CabinetMember | null>(
    null
  );

  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customOfficialName, setCustomOfficialName] = useState('');
  const [customFireReason, setCustomFireReason] = useState('');

  const harmonySummary = getCabinetHarmonySummary(cabinet);
  const strainedOrCautious = cabinet.filter(
    (m) =>
      !m.name.toLowerCase().startsWith('acting ') &&
      (m.status === 'Strained' || m.status === 'Cautious')
  );

  const isVpVacant = vicePresident.id === 'vp_vacant';
  const isJcsInterim = military.jointChiefsChair.name
    .toLowerCase()
    .startsWith('acting ');

  const openFireModal = (target: PendingFireTarget) => {
    setFireTarget(target);
    setFireReasonInput(QUICK_FIRE_REASONS[0]);
  };

  const handleConfirmFire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fireTarget || isFiringOfficial) return;
    const target = fireTarget;
    const reason =
      fireReasonInput.trim() ||
      'Presidential directive to overhaul executive branch leadership.';
    setFireTarget(null);
    await onFireOfficial({
      targetCategory: target.targetCategory,
      targetId: target.targetId,
      targetName: target.targetName,
      roleTitle: target.roleTitle,
      reason,
    });
  };

  const handleConfirmReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominateTarget) return;
    const target = nominateTarget;
    const dir = directionInput.trim();
    setNominateTarget(null);
    setDirectionInput('');
    setNomineeSearch('');
    await onReplaceCabinet(target, dir);
  };

  const handleConfirmNominateVp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNominatingVp) return;
    const dir = vpDirectionInput.trim();
    setShowNominateVpModal(false);
    setVpDirectionInput('');
    setVpSearch('');
    await onNominateVp(dir);
  };

  const handleRenominateCompromise = () => {
    if (!lastConfirmation) return;
    const target = cabinet.find(
      (c) => c.id === lastConfirmation.departmentId
    );
    if (!target) return;
    setDirectionInput(
      'Appoint a broadly respected bipartisan moderate with strong committee credibility who can win crossover Senate votes.'
    );
    setNominateTarget(target);
  };

  const handleCustomOfficialFire = (e: React.FormEvent) => {
    e.preventDefault();
    const role = customRoleTitle.trim();
    const name = customOfficialName.trim();
    if (!role || !name) return;
    openFireModal({
      targetCategory: 'agency_official',
      targetId: `custom_${role.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      targetName: name,
      roleTitle: role,
      warningText: `Dismissing ${role} (${name}) from the executive branch takes effect immediately and will trigger West Wing press coverage and potential Congressional scrutiny.`,
    });
    if (customFireReason.trim()) {
      setFireReasonInput(customFireReason.trim());
    }
    setCustomRoleTitle('');
    setCustomOfficialName('');
    setCustomFireReason('');
  };

  const narrowSenate = metrics.senateSeats <= 50 || metrics.congressSupport < 46;

  return (
    <main className="mx-auto max-w-[1320px] px-6 py-7 space-y-6">
      {/* Breaking Dismissal Fallout Banner */}
      {latestDismissalResult && (
        <section
          aria-live="polite"
          className="rounded-xl border border-red-300 bg-red-50/75 p-6 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-red-200 pb-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold text-red-800">
                  Executive Dismissal Executed · {latestDismissalResult.leadOutlet} ·{' '}
                  <span className="font-mono-num">
                    Congress: {latestDismissalResult.congressResponse.status}
                  </span>
                </p>
                <h3 className="mt-0.5 font-display text-xl font-bold text-stone-900">
                  {latestDismissalResult.leadHeadline}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissDismissalResult}
              aria-label="Dismiss firing outcome"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-white/80 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-stone-800">
            {latestDismissalResult.mediaSummary}
          </p>

          {latestDismissalResult.constitutionalNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-950">
              <strong className="font-semibold">Institutional Note:</strong>{' '}
              {latestDismissalResult.constitutionalNote}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#132238]">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Capitol Hill Reaction</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                {latestDismissalResult.congressResponse.summary}
              </p>
              <div className="space-y-1.5 pt-1 text-xs text-stone-600">
                <p>
                  <strong className="text-stone-800">Majority Leadership:</strong> “
                  {latestDismissalResult.congressResponse.majorityLeaderQuote}”
                </p>
                <p>
                  <strong className="text-stone-800">Opposition Leadership:</strong> “
                  {latestDismissalResult.congressResponse.oppositionLeaderQuote}”
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Immediate Impact &amp; Cabinet Morale</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formatMetricDeltaPill(
                  'Approval',
                  latestDismissalResult.metricDeltas.approval,
                  '%'
                )}
                {formatMetricDeltaPill(
                  'Congress',
                  latestDismissalResult.metricDeltas.congressSupport,
                  '%'
                )}
                {formatMetricDeltaPill(
                  'Diplomacy',
                  latestDismissalResult.metricDeltas.diplomaticStanding
                )}
                {formatMetricDeltaPill(
                  'Readiness',
                  latestDismissalResult.metricDeltas.forceReadiness,
                  '%'
                )}
                <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono-num text-[11px] font-semibold text-amber-900">
                  Cabinet Loyalty -{latestDismissalResult.loyaltyShock}%
                </span>
              </div>
              <p className="text-xs text-stone-600">
                Target removed: <strong>{latestDismissalResult.targetName}</strong> (
                {latestDismissalResult.roleTitle}). Stated reason: “
                {latestDismissalResult.reason}”
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 25th Amendment VP Confirmation Result */}
      {lastVpConfirmation && (
        <section
          aria-live="polite"
          className={`rounded-xl border p-6 space-y-4 ${
            lastVpConfirmation.approved
              ? 'border-emerald-200 bg-emerald-50/75'
              : 'border-red-200 bg-red-50/80'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/80 pb-4">
            <div className="flex items-start gap-3">
              {lastVpConfirmation.approved ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
              )}
              <div>
                <p
                  className={`text-xs font-semibold ${
                    lastVpConfirmation.approved
                      ? 'text-emerald-800'
                      : 'text-red-800'
                  }`}
                >
                  25th Amendment Confirmation Vote ·{' '}
                  <span className="font-mono-num">
                    {lastVpConfirmation.voteMarginLabel}
                  </span>
                </p>
                <h3 className="mt-0.5 font-display text-xl font-bold text-stone-900">
                  {lastVpConfirmation.confirmationHeadline}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissVpConfirmation}
              aria-label="Dismiss VP confirmation result"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-white/70 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-stone-800">
            {lastVpConfirmation.committeeSummary}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs font-mono-num">
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex justify-between">
                <span className="text-stone-600">Senate Floor (51 needed)</span>
                <span className="font-bold text-stone-900">
                  {lastVpConfirmation.senateYea} Yea – {lastVpConfirmation.senateNay} Nay
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3">
              <div className="flex justify-between">
                <span className="text-stone-600">House Floor (218 needed)</span>
                <span className="font-bold text-stone-900">
                  {lastVpConfirmation.houseYea} Yea – {lastVpConfirmation.houseNay} Nay
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vice President Spotlight */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-stone-500">
                Office of the Vice President · President of the Senate
              </p>
              {isVpVacant && (
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                  25th Amendment Vacancy
                </span>
              )}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#132238]">
              {isVpVacant
                ? vicePresident.name
                : `Vice President ${vicePresident.name}`}
            </h2>
            <p className="mt-0.5 text-xs text-stone-600">
              {vicePresident.formerTitle} · {vicePresident.leaning} ·{' '}
              <span className="font-mono-num">{vicePresident.traitSummary}</span>
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="block text-stone-500">Administration Loyalty</span>
              <span className="font-mono-num text-lg font-semibold text-stone-900">
                {vicePresident.loyalty}%
              </span>
            </div>
            <div>
              <span className="block text-stone-500">National Favorability</span>
              <span className="font-mono-num text-lg font-semibold text-stone-900">
                {vicePresident.popularity}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold text-stone-500">
              Vice Presidential Counsel &amp; Senate Whip Note
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-800">
              “{vicePresident.currentCounsel}”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isVpVacant && (
              <button
                type="button"
                onClick={() =>
                  onDraftFromCounsel(
                    'Vice President',
                    vicePresident.name,
                    vicePresident.currentCounsel
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Assign VP &amp; Draft</span>
              </button>
            )}

            <button
              type="button"
              disabled={isNominatingVp}
              onClick={() => setShowNominateVpModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 whitespace-nowrap"
            >
              {isNominatingVp ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>
                {isNominatingVp
                  ? 'Confirming VP...'
                  : isVpVacant
                  ? 'Nominate New VP (25th Amend.)'
                  : 'Replace VP (25th Amend.)'}
              </span>
            </button>

            <button
              type="button"
              disabled={isVpVacant || isFiringOfficial}
              onClick={() =>
                openFireModal({
                  targetCategory: 'vp',
                  targetId: 'vice_president',
                  targetName: vicePresident.name,
                  roleTitle: 'Vice President',
                  warningText:
                    'Constitutional Warning: Under Article II and the 25th Amendment, a President cannot legally fire an elected Vice President outright. Issuing a public dismissal demand will spark a constitutional crisis and force the VP out—leaving the Vice Presidency vacant and disabling Senate 50–50 tie-break votes until both the House and Senate confirm a replacement.',
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-45 whitespace-nowrap"
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isVpVacant ? 'VP Vacant' : 'Fire / Force Out VP'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Congressional Confirmation Roll-Call Result */}
      {lastConfirmation && (
        <section
          aria-live="polite"
          className={`rounded-xl border p-6 space-y-4 ${
            lastConfirmation.approved
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-red-200 bg-red-50/80'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/80 pb-4">
            <div className="flex items-start gap-3">
              {lastConfirmation.approved ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
              )}
              <div>
                <p
                  className={`text-xs font-semibold ${
                    lastConfirmation.approved
                      ? 'text-emerald-800'
                      : 'text-red-800'
                  }`}
                >
                  Congressional Confirmation Roll Call ·{' '}
                  <span className="font-mono-num">
                    {lastConfirmation.voteMarginLabel}
                  </span>
                </p>
                <h3 className="mt-0.5 font-display text-xl font-bold text-stone-900">
                  {lastConfirmation.confirmationHeadline}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissConfirmation}
              aria-label="Dismiss confirmation result"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-white/70 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <p className="text-sm leading-relaxed text-stone-800">
                {lastConfirmation.committeeSummary}
              </p>
              <p className="text-xs text-stone-600">
                {lastConfirmation.approved
                  ? `${lastConfirmation.nomineeName} has been sworn in as ${lastConfirmation.roleTitle}, succeeding ${lastConfirmation.previousName}.`
                  : `${lastConfirmation.nomineeName} failed to secure Congressional approval. ${lastConfirmation.previousName} remains in office as ${lastConfirmation.roleTitle}.`}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono-num">
                <span className="text-stone-600">Senate Floor Vote</span>
                <span className="font-bold text-stone-900">
                  {lastConfirmation.senateYea} Yea – {lastConfirmation.senateNay} Nay
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-red-200">
                <div
                  className="h-full bg-emerald-700"
                  style={{ width: `${lastConfirmation.senateYea}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-stone-600 font-mono-num pt-1">
                <span>
                  House Support: {lastConfirmation.houseSupportPercent}%
                </span>
                <span
                  className={
                    lastConfirmation.congressDelta >= 0
                      ? 'text-emerald-700 font-semibold'
                      : 'text-red-700 font-semibold'
                  }
                >
                  Congress {lastConfirmation.congressDelta >= 0 ? '+' : ''}
                  {lastConfirmation.congressDelta.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {!lastConfirmation.approved && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleRenominateCompromise}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Nominate Bipartisan Compromise Candidate</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Cabinet Harmony Outcome Banner */}
      {latestHarmonyOutcome && (
        <section
          aria-live="polite"
          className={`rounded-xl border p-5 space-y-3 ${
            latestHarmonyOutcome.loyaltyDelta >= 0
              ? 'border-emerald-200 bg-emerald-50/70'
              : 'border-amber-200 bg-amber-50/80'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Handshake
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  latestHarmonyOutcome.loyaltyDelta >= 0
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-stone-600">
                  Oval Office 1-on-1 Session · Month{' '}
                  <span className="font-mono-num">
                    {latestHarmonyOutcome.month}
                  </span>
                </p>
                <h3 className="font-display text-lg font-bold text-stone-900">
                  {latestHarmonyOutcome.headline}
                </h3>
                <p className="text-xs leading-relaxed text-stone-800">
                  {latestHarmonyOutcome.summary}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismissHarmonyOutcome}
              aria-label="Dismiss Cabinet Harmony outcome"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-white/70 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 font-mono-num text-[11px]">
            <span className="rounded-md border border-stone-200 bg-white px-2.5 py-0.5 font-semibold text-stone-800">
              {latestHarmonyOutcome.previousStatus} →{' '}
              {latestHarmonyOutcome.newStatus}
            </span>
            <span className="rounded-md border border-stone-200 bg-white px-2.5 py-0.5 font-semibold text-stone-800">
              Loyalty {latestHarmonyOutcome.loyaltyDelta >= 0 ? '+' : ''}
              {latestHarmonyOutcome.loyaltyDelta}% ({latestHarmonyOutcome.newLoyalty}%)
            </span>
            {formatMetricDeltaPill(
              'Approval',
              latestHarmonyOutcome.approvalDelta,
              '%'
            )}
            {formatMetricDeltaPill(
              'Congress',
              latestHarmonyOutcome.congressDelta,
              '%'
            )}
          </div>
        </section>
      )}

      {/* Cabinet & Senior White House Advisors */}
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Executive Branch Leadership · 1-on-1 Cabinet Harmony, Dismissal &amp; Nominations
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Cabinet &amp; Senior White House Advisors
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700">
              <Landmark className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
              <span>Senate Coalition:</span>
              <span className="font-mono-num font-bold text-stone-900">
                {metrics.senateSeats} / 100
              </span>
            </div>
            <span className="text-stone-300" aria-hidden="true">|</span>
            <div className="text-stone-700">
              <span>House:</span>{' '}
              <span className="font-mono-num font-bold text-stone-900">
                {metrics.houseSeats} / 435
              </span>
            </div>
            <span className="text-stone-300" aria-hidden="true">|</span>
            <div className="text-stone-700">
              <span>Congress Support:</span>{' '}
              <span className="font-mono-num font-bold text-stone-900">
                {metrics.congressSupport.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Cabinet Harmony Desk */}
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Handshake
                className="mt-0.5 h-4 w-4 shrink-0 text-[#132238]"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Cabinet Harmony &amp; One-on-One Briefings
                </h3>
                <p className="text-xs text-stone-600">
                  Hold one closed-door Oval Office session per official each month to mend{' '}
                  <span className="font-semibold text-amber-800">Cautious</span> or{' '}
                  <span className="font-semibold text-red-700">Strained</span> relationships. Pushing toxic officials carries a risk of exposing hidden scandals.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono-num">
              <span className="text-stone-700">
                Avg Loyalty:{' '}
                <strong className="text-stone-900">
                  {harmonySummary.avgLoyalty}%
                </strong>
              </span>
              <span className="text-stone-300" aria-hidden="true">|</span>
              <span className="text-emerald-700 font-semibold">
                {harmonySummary.alignedCount} Aligned
              </span>
              <span className="text-amber-700 font-semibold">
                {harmonySummary.cautiousCount} Cautious
              </span>
              <span className="text-red-700 font-semibold">
                {harmonySummary.strainedCount} Strained
              </span>
            </div>
          </div>

          {strainedOrCautious.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-stone-500">
                Priority 1-on-1 Sessions:
              </span>
              {strainedOrCautious.map((m) => {
                const alreadyMet = harmonyMeetingMonths[m.id] === currentMonth;
                const isToxic = m.status === 'Strained' || m.loyalty < 45;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={alreadyMet}
                    onClick={() => setHarmonyTarget(m)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-45 ${
                      isToxic
                        ? 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                        : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {m.name} ({m.status}
                      {isToxic ? ' · Scandal Risk' : ''})
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-medium text-emerald-800">
              All confirmed Cabinet officials are currently Aligned. You can still hold a routine 1-on-1 sync on any official’s card below.
            </p>
          )}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-900"
          >
            {errorMsg}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cabinet.map((member) => {
            const isReplacing = isReplacingId === member.id;
            const isWhiteHouseStaff = WHITE_HOUSE_ROLE_IDS.has(member.id);
            const isActing = member.name.toLowerCase().startsWith('acting ');
            const metThisMonth = harmonyMeetingMonths[member.id] === currentMonth;
            const statusClass =
              member.status === 'Aligned'
                ? 'text-emerald-700'
                : member.status === 'Cautious'
                ? 'text-amber-700'
                : 'text-red-700';

            return (
              <article
                key={member.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs font-medium text-stone-500">
                          {member.roleTitle}
                        </p>
                      </div>
                      <h3 className="mt-0.5 font-display text-lg font-bold text-stone-900">
                        {member.name}
                      </h3>
                      <p className="text-xs text-stone-600">{member.leaning}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold ${statusClass}`}>
                        {member.status}
                      </span>
                      <span className="text-[10px] font-medium text-stone-500">
                        {isWhiteHouseStaff ? 'White House Staff' : 'Senate-Confirmed'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-stone-600">
                        <span>Loyalty</span>
                        <span className="font-mono-num font-semibold text-stone-900">
                          {member.loyalty}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full bg-[#132238]"
                          style={{ width: `${member.loyalty}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-stone-600">
                        <span>Competence</span>
                        <span className="font-mono-num font-semibold text-stone-900">
                          {member.competence}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full bg-emerald-700"
                          style={{ width: `${member.competence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-stone-200 bg-white p-3.5">
                    <p className="text-[11px] font-semibold text-stone-500">
                      Current Counsel
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-700">
                      “{member.currentCounsel}”
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onDraftFromCounsel(
                          member.roleTitle,
                          member.name,
                          member.currentCounsel
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#132238] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap"
                    >
                      <MessageSquarePlus
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      <span>Counsel</span>
                    </button>

                    <button
                      type="button"
                      disabled={isReplacingId !== null}
                      onClick={() => setNominateTarget(member)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50 whitespace-nowrap"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          isReplacing ? 'animate-spin' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>{isReplacing ? 'Voting...' : 'Nominate'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isActing || metThisMonth}
                    onClick={() => setHarmonyTarget(member)}
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-45 ${
                      member.status === 'Strained'
                        ? 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                        : member.status === 'Cautious'
                        ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                        : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {isActing
                        ? 'Confirm Nominee First'
                        : metThisMonth
                        ? '1-on-1 Held This Month'
                        : 'Hold 1-on-1 Meeting'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isActing || isFiringOfficial}
                    onClick={() =>
                      openFireModal({
                        targetCategory: isWhiteHouseStaff ? 'white_house' : 'cabinet',
                        targetId: member.id,
                        targetName: member.name,
                        roleTitle: member.roleTitle,
                        warningText: isWhiteHouseStaff
                          ? `${member.roleTitle} serves directly at your pleasure without Senate confirmation, though dismissing ${member.name} will rattle West Wing morale and trigger press scrutiny.`
                          : `Firing ${member.roleTitle} ${member.name} moves the department under an Acting Secretary, lowers loyalty across the Cabinet, and invites Senate oversight hearings.`,
                      })
                    }
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-45"
                  >
                    <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isActing ? 'Acting Caretaker' : `Fire ${member.name.split(' ').slice(-1)[0]}`}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Other White House, Defense & Executive Branch Officials */}
      <section className="rounded-xl border border-stone-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-medium text-stone-500">
              West Wing Directors · Intelligence &amp; Legal Chiefs · Pentagon Command
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-stone-900">
              Other White House &amp; Executive Officials
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Joint Chiefs Chair Card */}
          <article className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-stone-500">
                  Pentagon · Joint Chiefs of Staff
                </span>
                {isJcsInterim && (
                  <span className="text-[11px] font-semibold text-amber-700">
                    Interim
                  </span>
                )}
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-stone-900">
                {military.jointChiefsChair.name}
              </h3>
              <p className="text-xs text-stone-600">
                {military.jointChiefsChair.branch} · {military.jointChiefsChair.doctrine}
              </p>
            </div>
            <button
              type="button"
              disabled={isJcsInterim || isFiringOfficial}
              onClick={() =>
                openFireModal({
                  targetCategory: 'military',
                  targetId: 'joint_chiefs_chair',
                  targetName: military.jointChiefsChair.name,
                  roleTitle: 'Chair of the Joint Chiefs of Staff',
                  warningText: `Relieving ${military.jointChiefsChair.name} as Chair of the Joint Chiefs triggers immediate Armed Services Committee oversight and temporarily lowers U.S. force readiness.`,
                })
              }
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-45"
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isJcsInterim ? 'Acting Vice Chair Serving' : 'Fire Joint Chiefs Chair'}</span>
            </button>
          </article>

          {OTHER_WHITE_HOUSE_OFFICIALS.map((off) => {
            const wasFired = dismissedOtherOfficials.includes(off.id);
            return (
              <article
                key={off.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-stone-500">
                      {off.office}
                    </span>
                    {wasFired && (
                      <span className="text-[11px] font-semibold text-amber-700">
                        Dismissed
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-stone-900">
                    {wasFired ? `Acting ${off.roleTitle}` : off.defaultName}
                  </h3>
                  <p className="text-xs font-medium text-stone-700">
                    {off.roleTitle}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">
                    {off.note}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={wasFired || isFiringOfficial}
                  onClick={() =>
                    openFireModal({
                      targetCategory: 'agency_official',
                      targetId: off.id,
                      targetName: off.defaultName,
                      roleTitle: off.roleTitle,
                      warningText: `Dismissing ${off.roleTitle} (${off.defaultName}) removes them immediately and sparks media coverage plus potential Congressional committee hearings.`,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-45"
                >
                  <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{wasFired ? 'Ousted / Acting Official' : `Fire ${off.roleTitle}`}</span>
                </button>
              </article>
            );
          })}
        </div>

        {/* Custom White House / Executive Official Dismissal Form */}
        <form
          onSubmit={handleCustomOfficialFire}
          className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3"
        >
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              Fire Any Other White House or Executive Branch Official
            </h3>
            <p className="text-xs text-stone-600">
              Name any West Wing aide, speechwriter, special envoy, U.S. Attorney, or agency head to dismiss directly.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              value={customRoleTitle}
              onChange={(e) => setCustomRoleTitle(e.target.value)}
              placeholder="Role Title (e.g. Special Envoy / Speechwriter)"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
            <input
              type="text"
              value={customOfficialName}
              onChange={(e) => setCustomOfficialName(e.target.value)}
              placeholder="Official's Name (e.g. Jonathan Miller)"
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={customFireReason}
                onChange={(e) => setCustomFireReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
              />
              <button
                type="submit"
                disabled={
                  !customRoleTitle.trim() ||
                  !customOfficialName.trim() ||
                  isFiringOfficial
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-45 whitespace-nowrap"
              >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Fire Official</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Nominate Replacement Cabinet Modal */}
      {nominateTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="replace-cabinet-title"
        >
          <form
            onSubmit={handleConfirmReplace}
            className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  Senate Advice &amp; Consent · Confirmation Vote
                </p>
                <h3
                  id="replace-cabinet-title"
                  className="mt-1 font-display text-xl font-bold text-stone-900"
                >
                  Nominate New {nominateTarget.roleTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNominateTarget(null);
                  setNomineeSearch('');
                }}
                aria-label="Cancel nomination"
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-mono-num">
                <span className="text-stone-600">Senate Coalition Seats</span>
                <span className="font-bold text-stone-900">
                  {metrics.senateSeats} / 100 (51 needed, or 50 + VP tie-break)
                </span>
              </div>
              <div className="flex items-center justify-between font-mono-num">
                <span className="text-stone-600">Congressional Support</span>
                <span className="font-bold text-stone-900">
                  {metrics.congressSupport.toFixed(0)}%
                </span>
              </div>
              <p className="pt-1 text-stone-600 leading-relaxed">
                {partyMeta.id === 'independent'
                  ? 'As an Independent White House without an automatic party-line caucus, securing confirmation requires bipartisan cross-aisle consensus.'
                  : narrowSenate
                  ? `Senate margins are tight for your ${partyMeta.label} coalition. Nominate a bipartisan consensus pick or moderate specialist to secure Congressional approval.`
                  : `Your ${partyMeta.label} coalition currently holds working floor strength, though polarizing picks can still trigger defections.`}
              </p>
            </div>

            <p className="text-xs text-stone-600">
              Replacing <strong>{nominateTarget.name}</strong> requires a
              majority Senate confirmation vote. If Congress rejects your
              nominee, {nominateTarget.name} stays in office and Congressional
              support declines.
            </p>

            {/* Quick-Pick Real-Life Nominees (50 options) */}
            {CABINET_ROSTER_OPTIONS[nominateTarget.id] &&
              (() => {
                const deptPool =
                  CABINET_ROSTER_OPTIONS[nominateTarget.id].candidates;
                const nq = nomineeSearch.trim().toLowerCase();
                const filteredPool = nq
                  ? deptPool.filter(
                      (c) =>
                        c.name.toLowerCase().includes(nq) ||
                        c.leaning.toLowerCase().includes(nq) ||
                        c.bio.toLowerCase().includes(nq)
                    )
                  : deptPool;
                return (
                  <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-stone-800">
                        Quick-Pick from {deptPool.length} Real-Life Nominees
                      </span>
                      <span className="font-mono-num text-[11px] text-stone-500">
                        {filteredPool.length} shown
                      </span>
                    </div>
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={nomineeSearch}
                        onChange={(e) => setNomineeSearch(e.target.value)}
                        placeholder="Search real-life nominees..."
                        className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {filteredPool.map((cand) => (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() =>
                            setDirectionInput(
                              `Nominate real-life leader ${cand.name} (${cand.leaning}): ${cand.bio}`
                            )
                          }
                          className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-left hover:border-[#132238] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900">
                              {cand.name}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {cand.leaning}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-stone-600 line-clamp-1">
                            {cand.bio}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

            <div>
              <label
                htmlFor="nominee-direction"
                className="block text-xs font-semibold text-stone-800"
              >
                Nominee Profile or Policy Mandate
              </label>
              <textarea
                id="nominee-direction"
                rows={3}
                value={directionInput}
                onChange={(e) => setDirectionInput(e.target.value)}
                placeholder="Click a real-life nominee above or describe a custom nominee profile..."
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNominateTarget(null);
                  setNomineeSearch('');
                }}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Submit to Congress</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 25th Amendment VP Nomination Modal */}
      {showNominateVpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nominate-vp-title"
        >
          <form
            onSubmit={handleConfirmNominateVp}
            className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-stone-500">
                  25th Amendment, Section 2 · Majority in House &amp; Senate
                </p>
                <h3
                  id="nominate-vp-title"
                  className="mt-1 font-display text-xl font-bold text-stone-900"
                >
                  Nominate New Vice President
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNominateVpModal(false);
                  setVpSearch('');
                }}
                aria-label="Cancel VP nomination"
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Under the 25th Amendment, filling a Vice Presidential vacancy requires majority confirmation in <strong>both</strong> the Senate (51+ votes) and the House (218+ votes).
            </p>

            {(() => {
              const q = vpSearch.trim().toLowerCase();
              const filteredVp = q
                ? VP_CANDIDATES.filter(
                    (v) =>
                      v.name.toLowerCase().includes(q) ||
                      v.formerTitle.toLowerCase().includes(q) ||
                      v.leaning.toLowerCase().includes(q) ||
                      v.bio.toLowerCase().includes(q)
                  )
                : VP_CANDIDATES;
              return (
                <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-stone-800">
                      Quick-Pick from {VP_CANDIDATES.length} Real-Life VP Candidates
                    </span>
                    <span className="font-mono-num text-[11px] text-stone-500">
                      {filteredVp.length} shown
                    </span>
                  </div>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={vpSearch}
                      onChange={(e) => setVpSearch(e.target.value)}
                      placeholder="Search real-life Vice Presidents & leaders..."
                      className="w-full rounded-md border border-stone-300 bg-white pl-8 pr-2.5 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                    {filteredVp.map((cand) => (
                      <button
                        key={cand.id}
                        type="button"
                        onClick={() =>
                          setVpDirectionInput(
                            `Nominate ${cand.name} (${cand.formerTitle} · ${cand.leaning}): ${cand.bio}`
                          )
                        }
                        className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-left hover:border-[#132238] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            {cand.name}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {cand.leaning}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-stone-600 line-clamp-1">
                          {cand.formerTitle} · {cand.bio}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div>
              <label
                htmlFor="vp-nominee-direction"
                className="block text-xs font-semibold text-stone-800"
              >
                VP Nominee Profile
              </label>
              <textarea
                id="vp-nominee-direction"
                rows={3}
                value={vpDirectionInput}
                onChange={(e) => setVpDirectionInput(e.target.value)}
                placeholder="Click a real-life candidate above or describe a custom VP nominee..."
                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNominateVpModal(false);
                  setVpSearch('');
                }}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
              >
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Submit to House &amp; Senate</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fire Official Confirmation Modal */}
      {fireTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fire-official-title"
        >
          <form
            onSubmit={handleConfirmFire}
            className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs font-semibold text-red-700">
                    Presidential Dismissal Order
                  </p>
                  <h3
                    id="fire-official-title"
                    className="mt-0.5 font-display text-xl font-bold text-stone-900"
                  >
                    Fire {fireTarget.roleTitle}: {fireTarget.targetName}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFireTarget(null)}
                aria-label="Cancel dismissal"
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
              {fireTarget.warningText}
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-stone-800">
                Stated Reason for Dismissal
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_FIRE_REASONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFireReasonInput(preset)}
                    className={`rounded-md border px-3 py-1.5 text-left text-xs transition-colors ${
                      fireReasonInput === preset
                        ? 'border-[#132238] bg-[#132238]/5 font-semibold text-stone-900'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={fireReasonInput}
                onChange={(e) => setFireReasonInput(e.target.value)}
                placeholder="Enter official White House statement or reason for termination..."
                className="w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFireTarget(null)}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFiringOfficial}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Execute Dismissal</span>
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Cabinet Harmony 1-on-1 Mini-Game Modal */}
      {harmonyTarget && (
        <CabinetHarmonyModal
          member={harmonyTarget}
          currentMonth={currentMonth}
          onClose={() => setHarmonyTarget(null)}
          onComplete={(outcome) => {
            setHarmonyTarget(null);
            onCompleteHarmonyMeeting(outcome);
          }}
        />
      )}
    </main>
  );
};
