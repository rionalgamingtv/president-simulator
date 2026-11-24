import React, { useMemo, useState } from 'react';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  Lock,
  Medal,
  Search,
  Shield,
  Star,
  UserPlus,
  X,
} from 'lucide-react';
import {
  MilitaryMedalAwardRecord,
  MilitaryMedalDefinition,
  MilitaryPromotionRecord,
  MilitaryServiceBranch,
  MilitaryServiceMember,
} from '../types/game';
import {
  canAwardMedalToMember,
  getEligibleMedalsForMember,
  getMedalDisplayName,
  getServiceRankInfo,
  getServiceRankLadder,
  getTopEligibleMedalForMember,
  MAX_RANK_GRADE_INDEX,
  MILITARY_MEDALS,
  MILITARY_NAME_POOL,
  MILITARY_SERVICES,
  SERVICE_ORDER,
} from '../data/militaryPromotions';

interface MilitaryPromotionPanelProps {
  currentMonth: number;
  roster: MilitaryServiceMember[];
  promotionHistory: MilitaryPromotionRecord[];
  medalHistory: MilitaryMedalAwardRecord[];
  currentJcsChairName: string;
  onPromoteMember: (
    memberId: string,
    targetGradeIndex: number,
    note?: string
  ) => void;
  onBatchPromoteMembers: (memberIds: string[]) => void;
  onRecruitPersonnel: (
    service: MilitaryServiceBranch,
    startingGradeIndex: number
  ) => void;
  onAppointFourStarAsJcs: (member: MilitaryServiceMember) => void;
  onAwardMedal: (
    memberId: string,
    medal: MilitaryMedalDefinition,
    citation?: string
  ) => void;
  onBatchAwardTopPerformers: (memberIds: string[]) => void;
}

type TierFilter =
  | 'all'
  | 'recruit'
  | 'enlisted_all'
  | 'commanding_officers'
  | 'flag_officers'
  | 'four_star'
  | 'high_performers';

const PAGE_SIZE = 12;

function renderStars(stars: number) {
  if (stars <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-600"
      aria-label={`${stars}-Star Rank`}
    >
      {Array.from({ length: stars }).map((_, idx) => (
        <Star
          key={idx}
          className="h-3 w-3 fill-amber-500 text-amber-600"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export const MilitaryPromotionPanel: React.FC<MilitaryPromotionPanelProps> = ({
  currentMonth,
  roster,
  promotionHistory,
  medalHistory,
  currentJcsChairName,
  onPromoteMember,
  onBatchPromoteMembers,
  onRecruitPersonnel,
  onAppointFourStarAsJcs,
  onAwardMedal,
  onBatchAwardTopPerformers,
}) => {
  const [serviceFilter, setServiceFilter] = useState<
    'all' | MilitaryServiceBranch
  >('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [exactGradeFilter, setExactGradeFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'rank_desc' | 'rank_asc' | 'merit' | 'medals' | 'name'
  >('rank_desc');
  const [page, setPage] = useState(1);
  const [showRankLadder, setShowRankLadder] = useState(false);
  const [ladderService, setLadderService] =
    useState<MilitaryServiceBranch>('army');
  const [recruitService, setRecruitService] =
    useState<MilitaryServiceBranch>('army');

  // Fast-track promotion modal state
  const [inspectMemberId, setInspectMemberId] = useState<string | null>(null);
  const [targetPromoteGrade, setTargetPromoteGrade] = useState<number>(1);
  const [promotionNote, setPromotionNote] = useState('');

  // Service Record & Medal Ceremony modal state
  const [serviceRecordMemberId, setServiceRecordMemberId] = useState<
    string | null
  >(null);
  const [selectedMedalId, setSelectedMedalId] = useState<string>(
    MILITARY_MEDALS[0].id
  );
  const [medalCitationInput, setMedalCitationInput] = useState('');

  // Right-hand ledger tab
  const [ledgerTab, setLedgerTab] = useState<'promotions' | 'medals'>(
    'promotions'
  );

  const inspectedMember = useMemo(
    () => roster.find((m) => m.id === inspectMemberId) || null,
    [roster, inspectMemberId]
  );

  const serviceRecordMember = useMemo(
    () => roster.find((m) => m.id === serviceRecordMemberId) || null,
    [roster, serviceRecordMemberId]
  );

  const stats = useMemo(() => {
    let recruits = 0;
    let enlisted = 0;
    let companyAndFieldOfficers = 0;
    let flagGenerals = 0;
    let fourStars = 0;
    let highPerformers = 0;

    for (const m of roster) {
      if (m.gradeIndex === 0) recruits++;
      if (m.gradeIndex <= 8) enlisted++;
      else if (m.gradeIndex <= 14) companyAndFieldOfficers++;
      else flagGenerals++;
      if (m.gradeIndex === 18) fourStars++;
      if (m.meritScore >= 88) highPerformers++;
    }

    return {
      total: roster.length,
      recruits,
      enlisted,
      companyAndFieldOfficers,
      flagGenerals,
      fourStars,
      highPerformers,
    };
  }, [roster]);

  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = roster.filter((member) => {
      if (serviceFilter !== 'all' && member.service !== serviceFilter) {
        return false;
      }
      if (exactGradeFilter !== null && member.gradeIndex !== exactGradeFilter) {
        return false;
      }
      if (tierFilter === 'recruit' && member.gradeIndex !== 0) return false;
      if (tierFilter === 'enlisted_all' && member.gradeIndex > 8) return false;
      if (
        tierFilter === 'commanding_officers' &&
        (member.gradeIndex < 9 || member.gradeIndex > 14)
      ) {
        return false;
      }
      if (tierFilter === 'flag_officers' && member.gradeIndex < 15) {
        return false;
      }
      if (tierFilter === 'four_star' && member.gradeIndex !== 18) {
        return false;
      }
      if (tierFilter === 'high_performers' && member.meritScore < 88) {
        return false;
      }

      if (q) {
        const rank = getServiceRankInfo(member.service, member.gradeIndex);
        const serviceLabel = MILITARY_SERVICES[member.service].label;
        const medalNames = (member.serviceRecordMedals || [])
          .map((m) => m.medalName)
          .join(' ');
        const haystack =
          `${member.name} ${rank.title} ${rank.abbr} ${rank.payGrade} ${serviceLabel} ${member.unit} ${member.specialty} ${medalNames}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'rank_desc') {
      sorted.sort(
        (a, b) =>
          b.gradeIndex - a.gradeIndex ||
          b.meritScore - a.meritScore ||
          a.name.localeCompare(b.name)
      );
    } else if (sortBy === 'rank_asc') {
      sorted.sort(
        (a, b) =>
          a.gradeIndex - b.gradeIndex ||
          b.meritScore - a.meritScore ||
          a.name.localeCompare(b.name)
      );
    } else if (sortBy === 'merit') {
      sorted.sort(
        (a, b) => b.meritScore - a.meritScore || b.gradeIndex - a.gradeIndex
      );
    } else if (sortBy === 'medals') {
      sorted.sort(
        (a, b) =>
          (b.serviceRecordMedals?.length || b.commendations) -
            (a.serviceRecordMedals?.length || a.commendations) ||
          b.meritScore - a.meritScore
      );
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [roster, serviceFilter, tierFilter, exactGradeFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredRoster.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredRoster.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const eligibleForBatchPromote = useMemo(
    () =>
      filteredRoster
        .filter((m) => m.gradeIndex < MAX_RANK_GRADE_INDEX)
        .slice(0, 5),
    [filteredRoster]
  );

  const eligibleForBatchMedal = useMemo(
    () =>
      filteredRoster
        .filter(
          (m) =>
            m.meritScore >= 86 && getTopEligibleMedalForMember(m) !== null
        )
        .slice(0, 5),
    [filteredRoster]
  );

  const handleServiceTab = (next: 'all' | MilitaryServiceBranch) => {
    setServiceFilter(next);
    if (next !== 'all') {
      setLadderService(next);
      setRecruitService(next);
    }
    setPage(1);
  };

  const handleOpenInspect = (member: MilitaryServiceMember) => {
    setInspectMemberId(member.id);
    setTargetPromoteGrade(
      Math.min(MAX_RANK_GRADE_INDEX, member.gradeIndex + 1)
    );
    setPromotionNote('');
  };

  const handleOpenServiceRecord = (member: MilitaryServiceMember) => {
    setServiceRecordMemberId(member.id);
    const topEligible = getTopEligibleMedalForMember(member);
    setSelectedMedalId(topEligible ? topEligible.id : MILITARY_MEDALS[0].id);
    setMedalCitationInput('');
  };

  const ladderRanks = useMemo(
    () => getServiceRankLadder(ladderService),
    [ladderService]
  );

  return (
    <section
      aria-label="Armed Forces Personnel and Military Promotion Command"
      className="rounded-xl border border-stone-200 bg-white p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium text-stone-500">
            Pentagon Personnel Command · {MILITARY_NAME_POOL.length} Registered Service Names · Army, Marines, Navy &amp; Coast Guard
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-stone-900">
            Military Promotion, Medals &amp; Service Record Board
          </h3>
          <p className="mt-1 text-sm text-stone-600 max-w-3xl">
            Promote soldiers and commanding officers from{' '}
            <span className="font-semibold text-stone-800">E-1 Recruit</span>{' '}
            up to{' '}
            <span className="font-semibold text-stone-800">
              O-10 Four-Star General / Admiral
            </span>
            , inspect official service records, and award commendations and combat medals for high performance scores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRankLadder((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap"
          >
            <Award className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
            <span>
              {showRankLadder
                ? 'Hide Rank Ladders'
                : 'Service Rank Ladders (E-1 to O-10)'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            Active Roster
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-stone-900">
            {stats.total}
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            Enlisted (E-1–E-9)
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-stone-900">
            {stats.enlisted} ({stats.recruits} E-1)
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            Officers (O-1–O-6)
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-stone-900">
            {stats.companyAndFieldOfficers}
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            Flag &amp; General (1★–4★)
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-[#132238]">
            {stats.flagGenerals} ({stats.fourStars} 4★)
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            High Merit (88+)
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-amber-700">
            {stats.highPerformers}
          </span>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-3">
          <span className="block text-[11px] font-medium text-stone-500">
            Promotions / Medals
          </span>
          <span className="mt-0.5 block font-mono-num text-xl font-semibold text-emerald-700">
            {promotionHistory.length} / {medalHistory.length}
          </span>
        </div>
      </div>

      {/* Expandable Rank Ladder Reference */}
      {showRankLadder && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h4 className="font-display text-base font-semibold text-stone-900">
                Official Service Rank Progression (Click any rank to filter roster)
              </h4>
              <p className="text-xs text-stone-600">
                Inspect authentic rank insignia titles from E-1 Recruit through O-10 Four-Star command across all four branches.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-200/70 p-1">
              {SERVICE_ORDER.map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => setLadderService(svc)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    ladderService === svc
                      ? 'bg-white text-[#132238] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {MILITARY_SERVICES[svc].shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            {ladderRanks.map((rank) => {
              const active =
                exactGradeFilter === rank.gradeIndex &&
                (serviceFilter === 'all' || serviceFilter === ladderService);
              return (
                <button
                  key={rank.payGrade}
                  type="button"
                  onClick={() => {
                    setServiceFilter(ladderService);
                    setTierFilter('all');
                    setExactGradeFilter((prev) =>
                      prev === rank.gradeIndex ? null : rank.gradeIndex
                    );
                    setPage(1);
                  }}
                  className={`rounded-lg border p-2.5 text-left transition-colors ${
                    active
                      ? 'border-[#132238] bg-[#132238] text-white'
                      : 'border-stone-200 bg-white hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`font-mono-num font-bold ${
                        active ? 'text-amber-300' : 'text-[#132238]'
                      }`}
                    >
                      {rank.payGrade} · {rank.abbr}
                    </span>
                    {rank.stars > 0 && renderStars(rank.stars)}
                  </div>
                  <p
                    className={`mt-1 text-xs font-semibold leading-snug ${
                      active ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {rank.title}
                  </p>
                  <p
                    className={`mt-0.5 text-[10px] ${
                      active ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {rank.tierLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Service Filter + Enlistment Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => handleServiceTab('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              serviceFilter === 'all'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Services ({roster.length})
          </button>
          {SERVICE_ORDER.map((svc) => {
            const count = roster.filter((m) => m.service === svc).length;
            return (
              <button
                key={svc}
                type="button"
                onClick={() => handleServiceTab(svc)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  serviceFilter === svc
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {MILITARY_SERVICES[svc].shortLabel} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="recruit-branch-select" className="sr-only">
            Select service for new personnel
          </label>
          <select
            id="recruit-branch-select"
            value={recruitService}
            onChange={(e) =>
              setRecruitService(e.target.value as MilitaryServiceBranch)
            }
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
          >
            {SERVICE_ORDER.map((svc) => (
              <option key={svc} value={svc}>
                {MILITARY_SERVICES[svc].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onRecruitPersonnel(recruitService, 0)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 whitespace-nowrap"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Enlist Recruit (E-1)</span>
          </button>

          <button
            type="button"
            onClick={() => onRecruitPersonnel(recruitService, 9)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3557] whitespace-nowrap"
          >
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Commission Officer (O-1)</span>
          </button>
        </div>
      </div>

      {/* Secondary Tier Filters + Search + Sort + Batch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All Ranks' },
              { id: 'high_performers', label: 'High Merit (88+)' },
              { id: 'recruit', label: 'Recruits (E-1)' },
              { id: 'enlisted_all', label: 'Enlisted (E-1–E-9)' },
              { id: 'commanding_officers', label: 'Officers (O-1–O-6)' },
              { id: 'flag_officers', label: 'Generals & Admirals (1★–4★)' },
              { id: 'four_star', label: '4-Star (O-10)' },
            ] as { id: TierFilter; label: string }[]
          ).map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => {
                setTierFilter(tf.id);
                setExactGradeFilter(null);
                setPage(1);
              }}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                tierFilter === tf.id && exactGradeFilter === null
                  ? 'border-[#132238] bg-[#132238] text-white'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
              }`}
            >
              {tf.label}
            </button>
          ))}
          {exactGradeFilter !== null && (
            <button
              type="button"
              onClick={() => {
                setExactGradeFilter(null);
                setPage(1);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900"
            >
              <span>
                Grade:{' '}
                {
                  getServiceRankInfo(
                    serviceFilter === 'all' ? ladderService : serviceFilter,
                    exactGradeFilter
                  ).payGrade
                }
              </span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, rank, unit, medal..."
              className="w-full rounded-lg border border-stone-300 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
            />
          </div>

          <select
            aria-label="Sort personnel roster"
            value={sortBy}
            onChange={(e) => {
              setSortBy(
                e.target.value as
                  | 'rank_desc'
                  | 'rank_asc'
                  | 'merit'
                  | 'medals'
                  | 'name'
              );
              setPage(1);
            }}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:border-[#132238] focus:outline-none"
          >
            <option value="rank_desc">Highest Rank First (4★ → E-1)</option>
            <option value="rank_asc">Recruits First (E-1 → 4★)</option>
            <option value="merit">Highest Performance Merit</option>
            <option value="medals">Most Medals / Citations</option>
            <option value="name">Alphabetical (A–Z)</option>
          </select>

          {eligibleForBatchPromote.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onBatchPromoteMembers(eligibleForBatchPromote.map((m) => m.id))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
            >
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Promote Top {eligibleForBatchPromote.length}</span>
            </button>
          )}

          {eligibleForBatchMedal.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onBatchAwardTopPerformers(
                  eligibleForBatchMedal.map((m) => m.id)
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700 bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 whitespace-nowrap"
            >
              <Medal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Decorate Top {eligibleForBatchMedal.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Split: Roster Table + Orders & Decorations Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          {pageItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-800">
                No military personnel match the active filters.
              </p>
              <p className="text-xs text-stone-600">
                Clear the search query or select a different branch or rank tier.
              </p>
              <button
                type="button"
                onClick={() => {
                  setServiceFilter('all');
                  setTierFilter('all');
                  setExactGradeFilter(null);
                  setSearchQuery('');
                  setPage(1);
                }}
                className="mt-2 rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
              >
                Reset Roster Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                    <th className="px-3.5 py-2.5">Service Member &amp; Rank</th>
                    <th className="px-3.5 py-2.5">Branch, Unit &amp; Medals</th>
                    <th className="px-3.5 py-2.5 text-right">
                      Performance / Service
                    </th>
                    <th className="px-3.5 py-2.5 text-right">
                      Promotion &amp; Medals
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {pageItems.map((member) => {
                    const rank = getServiceRankInfo(
                      member.service,
                      member.gradeIndex
                    );
                    const nextRank =
                      member.gradeIndex < MAX_RANK_GRADE_INDEX
                        ? getServiceRankInfo(
                            member.service,
                            member.gradeIndex + 1
                          )
                        : null;
                    const serviceMeta = MILITARY_SERVICES[member.service];
                    const isFourStar =
                      member.gradeIndex === MAX_RANK_GRADE_INDEX;
                    const isCurrentJcs = currentJcsChairName
                      .toLowerCase()
                      .includes(member.name.toLowerCase());
                    const recordMedals = member.serviceRecordMedals || [];
                    const isHighMerit = member.meritScore >= 88;
                    const eligibleMedals = getEligibleMedalsForMember(member);

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-stone-50/80 transition-colors"
                      >
                        <td className="px-3.5 py-3 align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono-num font-bold text-[#132238]">
                              {rank.payGrade} ({rank.abbr})
                            </span>
                            {renderStars(rank.stars)}
                            <span className="font-semibold text-stone-900 text-sm">
                              {rank.abbr} {member.name}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-stone-500">
                            {rank.title} · {rank.tierLabel}
                            {member.promotedMonth ? (
                              <> · Promoted M{member.promotedMonth}</>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 align-top">
                          <div className="font-semibold text-stone-800">
                            {serviceMeta.label} · {member.status}
                          </div>
                          <div className="mt-0.5 text-[11px] text-stone-600">
                            {member.unit} · {member.specialty}
                          </div>
                          <div className="mt-1 text-[11px] text-stone-500">
                            {recordMedals.length > 0 ? (
                              <>
                                Service Record:{' '}
                                <span className="font-medium text-stone-700">
                                  {recordMedals
                                    .slice(-2)
                                    .map((m) => m.medalAbbr)
                                    .join(', ')}
                                  {recordMedals.length > 2
                                    ? ` (+${recordMedals.length - 2} more)`
                                    : ''}
                                </span>
                              </>
                            ) : (
                              <span>No service decorations recorded yet</span>
                            )}
                          </div>
                        </td>

                        <td className="px-3.5 py-3 align-top text-right font-mono-num whitespace-nowrap">
                          <div
                            className={`font-semibold ${
                              isHighMerit
                                ? 'text-amber-700'
                                : 'text-stone-900'
                            }`}
                          >
                            Merit {member.meritScore} / 99
                            {isHighMerit ? ' · High' : ''}
                          </div>
                          <div className="mt-0.5 text-[11px] text-stone-500">
                            {member.yearsOfService} yrs ·{' '}
                            {Math.max(
                              member.commendations,
                              recordMedals.length
                            )}{' '}
                            awards
                          </div>
                          {eligibleMedals.length > 0 && (
                            <div className="mt-0.5 text-[10px] font-medium text-emerald-700">
                              {eligibleMedals.length} medal tier
                              {eligibleMedals.length > 1 ? 's' : ''} unlocked
                            </div>
                          )}
                        </td>

                        <td className="px-3.5 py-3 align-top text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {nextRank ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onPromoteMember(
                                        member.id,
                                        member.gradeIndex + 1
                                      )
                                    }
                                    className="rounded-md bg-[#132238] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E3557]"
                                  >
                                    Promote → {nextRank.abbr}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenInspect(member)}
                                    className="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                                  >
                                    Fast-Track
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isCurrentJcs}
                                  onClick={() =>
                                    onAppointFourStarAsJcs(member)
                                  }
                                  className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-50"
                                >
                                  <Crown
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                  <span>
                                    {isCurrentJcs
                                      ? 'Current JCS Chair'
                                      : isFourStar
                                      ? 'Tap as JCS Chair'
                                      : 'Max Rank'}
                                  </span>
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenServiceRecord(member)}
                              className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-800 hover:border-[#132238] hover:bg-white"
                            >
                              <Medal className="h-3 w-3 text-amber-600" aria-hidden="true" />
                              <span>
                                Service Record &amp; Medals ({recordMedals.length})
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-stone-600">
            <span className="font-mono-num">
              Showing{' '}
              {filteredRoster.length === 0
                ? 0
                : (safePage - 1) * PAGE_SIZE + 1}
              –{Math.min(safePage * PAGE_SIZE, filteredRoster.length)} of{' '}
              {filteredRoster.length} matching personnel
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous personnel page"
                className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono-num font-semibold text-stone-800">
                Page {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next personnel page"
                className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Official Promotion & Decorations Ledger */}
        <aside className="lg:col-span-4 rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 gap-2">
            <div>
              <h4 className="font-display text-base font-semibold text-stone-900">
                Orders &amp; Citations Ledger
              </h4>
              <p className="text-[11px] text-stone-500">
                Month {currentMonth} · Promotions &amp; Medals
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-stone-200/80 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setLedgerTab('promotions')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  ledgerTab === 'promotions'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Promotions ({promotionHistory.length})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTab('medals')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  ledgerTab === 'medals'
                    ? 'bg-white text-[#132238] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Medals ({medalHistory.length})
              </button>
            </div>
          </div>

          {ledgerTab === 'promotions' ? (
            promotionHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
                <Award className="h-6 w-6 text-stone-400" aria-hidden="true" />
                <p className="text-xs font-semibold text-stone-800">
                  No Promotions Signed Yet
                </p>
                <p className="text-[11px] leading-relaxed text-stone-600 max-w-xs">
                  Promote any E-1 Recruit, NCO, or Commanding Officer on the left. Promotions strengthen Force Readiness and record Senate Flag Confirmations for 1★–4★ ranks.
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto space-y-2.5 pr-1">
                {promotionHistory.slice(0, 30).map((rec) => (
                  <article
                    key={rec.id}
                    className="rounded-lg border border-stone-200 bg-white p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-[#132238]">
                        {MILITARY_SERVICES[rec.service].shortLabel} ·{' '}
                        {rec.promotionType}
                      </span>
                      <span className="font-mono-num text-stone-500">
                        M{rec.month}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-stone-900">
                        {rec.toAbbr} {rec.memberName}
                      </p>
                      {renderStars(rec.stars)}
                    </div>
                    <p className="font-mono-num text-[11px] text-stone-700">
                      {rec.fromPayGrade} ({rec.fromRankTitle}) →{' '}
                      <strong className="text-emerald-800">
                        {rec.toPayGrade} ({rec.toRankTitle})
                      </strong>
                    </p>
                    <p className="text-[11px] leading-snug text-stone-600">
                      {rec.note}
                    </p>
                  </article>
                ))}
              </div>
            )
          ) : medalHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-2">
              <Medal className="h-6 w-6 text-stone-400" aria-hidden="true" />
              <p className="text-xs font-semibold text-stone-800">
                No Presidential Medals Awarded Yet
              </p>
              <p className="text-[11px] leading-relaxed text-stone-600 max-w-xs">
                Open any member&apos;s <strong>Service Record &amp; Medals</strong> or click <strong>Decorate Top 5</strong> to present commendations and medals earned through high performance merit scores.
              </p>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto space-y-2.5 pr-1">
              {medalHistory.slice(0, 30).map((med) => (
                <article
                  key={med.id}
                  className="rounded-lg border border-stone-200 bg-white p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-amber-800">
                      {MILITARY_SERVICES[med.service].shortLabel} ·{' '}
                      {med.medalAbbr}
                    </span>
                    <span className="font-mono-num text-stone-500">
                      M{med.month} · Merit {med.meritScoreAtAward}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-900">
                    {med.medalName}
                  </p>
                  <p className="text-[11px] font-medium text-[#132238]">
                    Awarded to {med.memberRankAbbr} {med.memberName}
                  </p>
                  <p className="text-[11px] leading-snug text-stone-600">
                    {med.citation}
                  </p>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Fast-Track / Direct Rank Promotion Modal */}
      {inspectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fast-track-promote-title"
        >
          {(() => {
            const currentRank = getServiceRankInfo(
              inspectedMember.service,
              inspectedMember.gradeIndex
            );
            const serviceRanks = getServiceRankLadder(inspectedMember.service);
            const availableTargets = serviceRanks.filter(
              (r) => r.gradeIndex > inspectedMember.gradeIndex
            );
            const chosenRank = getServiceRankInfo(
              inspectedMember.service,
              targetPromoteGrade
            );
            const isCommissioning =
              !currentRank.isOfficer && chosenRank.isOfficer;
            const isFlagNomination = chosenRank.stars > 0;

            return (
              <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
                  <div>
                    <p className="text-xs font-medium text-stone-500">
                      {MILITARY_SERVICES[inspectedMember.service].label} ·{' '}
                      {inspectedMember.unit}
                    </p>
                    <h3
                      id="fast-track-promote-title"
                      className="mt-0.5 font-display text-xl font-bold text-stone-900"
                    >
                      Promote {currentRank.abbr} {inspectedMember.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectMemberId(null)}
                    aria-label="Close promotion board dialog"
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 text-xs space-y-1">
                  <p className="font-semibold text-stone-900">
                    Current Rank: {currentRank.payGrade} — {currentRank.title} (
                    {currentRank.abbr})
                  </p>
                  <p className="text-stone-600">
                    Specialty: {inspectedMember.specialty} ·{' '}
                    {inspectedMember.yearsOfService} yrs service · Merit{' '}
                    {inspectedMember.meritScore}/99
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="target-rank-select"
                    className="block text-xs font-semibold text-stone-800"
                  >
                    Select Target Rank (
                    {MILITARY_SERVICES[inspectedMember.service].shortLabel}{' '}
                    Rank System)
                  </label>
                  <select
                    id="target-rank-select"
                    value={targetPromoteGrade}
                    onChange={(e) =>
                      setTargetPromoteGrade(Number(e.target.value))
                    }
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-900 focus:border-[#132238] focus:outline-none"
                  >
                    {availableTargets.map((r) => (
                      <option key={r.gradeIndex} value={r.gradeIndex}>
                        {r.payGrade} · {r.title} ({r.abbr})
                        {r.stars > 0 ? ` — ${r.stars}-Star` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    {isFlagNomination
                      ? `Elevating to ${chosenRank.stars}-Star ${chosenRank.title} requires Presidential nomination and Senate Armed Services Committee confirmation.`
                      : isCommissioning
                      ? `Grants a direct Officer Commission from enlisted ranks into ${chosenRank.title} (${chosenRank.payGrade}).`
                      : `Advances service member through the ${MILITARY_SERVICES[inspectedMember.service].shortLabel} promotion board.`}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="promotion-citation-note"
                    className="block text-xs font-semibold text-stone-800"
                  >
                    Citation / Promotion Justification (optional)
                  </label>
                  <input
                    id="promotion-citation-note"
                    type="text"
                    value={promotionNote}
                    onChange={(e) => setPromotionNote(e.target.value)}
                    placeholder="e.g., Exceptional command leadership during joint readiness exercises."
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setInspectMemberId(null)}
                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPromoteMember(
                        inspectedMember.id,
                        targetPromoteGrade,
                        promotionNote.trim() || undefined
                      );
                      setInspectMemberId(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557]"
                  >
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      Sign Promotion to {chosenRank.abbr} ({chosenRank.payGrade})
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Official Service Record & Medal Presentation Modal */}
      {serviceRecordMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-record-modal-title"
        >
          {(() => {
            const rank = getServiceRankInfo(
              serviceRecordMember.service,
              serviceRecordMember.gradeIndex
            );
            const serviceMeta = MILITARY_SERVICES[serviceRecordMember.service];
            const medalsInRecord =
              serviceRecordMember.serviceRecordMedals || [];
            const selectedMedal =
              MILITARY_MEDALS.find((m) => m.id === selectedMedalId) ||
              MILITARY_MEDALS[0];
            const selectedEligibility = canAwardMedalToMember(
              serviceRecordMember,
              selectedMedal
            );
            const selectedMedalName = getMedalDisplayName(
              selectedMedal,
              serviceRecordMember.service
            );

            return (
              <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-stone-200 bg-white p-6 shadow-2xl space-y-5">
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                      <FileText className="h-3.5 w-3.5 text-[#132238]" aria-hidden="true" />
                      <span>
                        Official Military Service Record · {serviceMeta.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h3
                        id="service-record-modal-title"
                        className="font-display text-2xl font-bold text-stone-900"
                      >
                        {rank.abbr} {serviceRecordMember.name}
                      </h3>
                      {renderStars(rank.stars)}
                    </div>
                    <p className="mt-0.5 text-xs text-stone-600">
                      {rank.payGrade} · {rank.title} · {serviceRecordMember.unit} ·{' '}
                      {serviceRecordMember.specialty}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServiceRecordMemberId(null)}
                    aria-label="Close service record modal"
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Jacket Metrics Strip */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
                    <span className="block text-[11px] text-stone-500">
                      Performance Merit
                    </span>
                    <span
                      className={`font-mono-num text-lg font-bold ${
                        serviceRecordMember.meritScore >= 88
                          ? 'text-amber-700'
                          : 'text-stone-900'
                      }`}
                    >
                      {serviceRecordMember.meritScore} / 99
                    </span>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
                    <span className="block text-[11px] text-stone-500">
                      Years of Service
                    </span>
                    <span className="font-mono-num text-lg font-bold text-stone-900">
                      {serviceRecordMember.yearsOfService} yrs
                    </span>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
                    <span className="block text-[11px] text-stone-500">
                      Recorded Medals
                    </span>
                    <span className="font-mono-num text-lg font-bold text-[#132238]">
                      {medalsInRecord.length}
                    </span>
                  </div>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5">
                    <span className="block text-[11px] text-stone-500">
                      Duty Status
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      {serviceRecordMember.status}
                    </span>
                  </div>
                </div>

                {/* Section 1: Recorded Decorations & Citations */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-base font-semibold text-stone-900">
                      Decorations &amp; Citations in Service Record
                    </h4>
                    <span className="font-mono-num text-xs text-stone-500">
                      {medalsInRecord.length} recorded
                    </span>
                  </div>

                  {medalsInRecord.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-center text-xs text-stone-600">
                      No commendations or medals currently appear in {rank.abbr}{' '}
                      {serviceRecordMember.name}&apos;s service record. Select an eligible decoration below to enter their first citation.
                    </div>
                  ) : (
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {[...medalsInRecord].reverse().map((entry) => (
                        <article
                          key={entry.id}
                          className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#132238]">
                              {entry.medalName} ({entry.medalAbbr})
                            </span>
                            <span className="font-mono-num text-[11px] text-stone-500">
                              {entry.month === 0
                                ? 'Prior Tour'
                                : `Month ${entry.month}`}{' '}
                              · Merit {entry.meritScoreAtAward}/99 ·{' '}
                              {entry.awardedBy}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-stone-700">
                            {entry.citation}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Award Commendation / Medal Board */}
                <div className="border-t border-stone-200 pt-4 space-y-3">
                  <div>
                    <h4 className="font-display text-base font-semibold text-stone-900">
                      Award Commendation or Medal (Performance Merit Eligibility)
                    </h4>
                    <p className="text-xs text-stone-600">
                      Higher decorations unlock automatically as a service member&apos;s performance merit score climbs. Presenting a medal appends the official citation to their service record and boosts Force Readiness.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {MILITARY_MEDALS.map((medal) => {
                      const check = canAwardMedalToMember(
                        serviceRecordMember,
                        medal
                      );
                      const displayName = getMedalDisplayName(
                        medal,
                        serviceRecordMember.service
                      );
                      const isSelected = selectedMedalId === medal.id;
                      const ownedCount = medalsInRecord.filter(
                        (r) => r.medalId === medal.id
                      ).length;

                      return (
                        <button
                          key={medal.id}
                          type="button"
                          onClick={() => setSelectedMedalId(medal.id)}
                          className={`rounded-lg border p-2.5 text-left transition-colors space-y-1 ${
                            isSelected
                              ? 'border-[#132238] bg-stone-50 ring-1 ring-[#132238]'
                              : check.eligible
                              ? 'border-stone-200 bg-white hover:border-stone-400'
                              : 'border-stone-200 bg-stone-50/70 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            <span className="font-mono-num font-bold text-[#132238]">
                              {medal.abbr}
                              {ownedCount > 0 ? ` ×${ownedCount}` : ''}
                            </span>
                            <span
                              className={`font-mono-num font-semibold ${
                                check.eligible
                                  ? 'text-emerald-700'
                                  : 'text-stone-500'
                              }`}
                            >
                              {check.eligible ? (
                                `Merit ${medal.minMeritScore}+`
                              ) : (
                                <span className="inline-flex items-center gap-0.5">
                                  <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                                  {medal.minMeritScore}+
                                </span>
                              )}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-900 leading-snug">
                            {displayName}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {medal.tierLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Medal Details & Citation Input */}
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        Selected: {selectedMedalName} ({selectedMedal.abbr})
                      </span>
                      <span className="font-mono-num text-[11px] font-semibold text-stone-700">
                        +{selectedMedal.readinessBonus.toFixed(2)}% Readiness · +
                        {selectedMedal.meritBoost} Merit
                        {selectedMedal.approvalBonus > 0
                          ? ` · +${selectedMedal.approvalBonus.toFixed(1)}% Approval`
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700">
                      {selectedMedal.description}
                    </p>
                    {!selectedEligibility.eligible && (
                      <p className="text-xs font-semibold text-red-700">
                        Ineligible: {selectedEligibility.reason}
                      </p>
                    )}

                    <div className="space-y-1">
                      <label
                        htmlFor="medal-citation-input"
                        className="block text-xs font-semibold text-stone-800"
                      >
                        Official Citation (recorded permanently in service record)
                      </label>
                      <input
                        id="medal-citation-input"
                        type="text"
                        value={medalCitationInput}
                        onChange={(e) => setMedalCitationInput(e.target.value)}
                        placeholder={`For extraordinary merit and ${serviceRecordMember.specialty} excellence in ${serviceRecordMember.unit}.`}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-[#132238] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setServiceRecordMemberId(null)}
                      className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={!selectedEligibility.eligible}
                      onClick={() => {
                        onAwardMedal(
                          serviceRecordMember.id,
                          selectedMedal,
                          medalCitationInput.trim() || undefined
                        );
                        setMedalCitationInput('');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#132238] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3557] disabled:opacity-45"
                    >
                      <Medal className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        Present {selectedMedalName} &amp; Record Citation
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
};
