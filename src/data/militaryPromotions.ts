import {
  MilitaryMedalAwardRecord,
  MilitaryMedalDefinition,
  MilitaryRankInfo,
  MilitaryRankTier,
  MilitaryServiceBranch,
  MilitaryServiceMember,
} from '../types/game';

export interface ServiceMetadata {
  id: MilitaryServiceBranch;
  label: string;
  shortLabel: string;
  departmentLabel: string;
  enlistedLabel: string;
  officerLabel: string;
  units: string[];
  specialties: string[];
}

export const MILITARY_SERVICES: Record<MilitaryServiceBranch, ServiceMetadata> = {
  army: {
    id: 'army',
    label: 'U.S. Army',
    shortLabel: 'Army',
    departmentLabel: 'Department of the Army',
    enlistedLabel: 'Soldiers (E-1 to E-9)',
    officerLabel: 'Commanding Officers (O-1 to O-10)',
    units: [
      '82nd Airborne Division',
      '101st Airborne Division (Air Assault)',
      '1st Armored Division',
      '3rd Infantry Division',
      '1st Cavalry Division',
      '10th Mountain Division',
      '75th Ranger Regiment',
      '4th Infantry Division',
      'Army Cyber Command',
      'XVIII Airborne Corps',
    ],
    specialties: [
      'Infantry Operations',
      'Armor & Mechanized Cavalry',
      'Field Artillery',
      'Special Forces',
      'Army Aviation',
      'Combat Engineering',
      'Military Intelligence',
      'Cyber & Signal Corps',
      'Air Defense Artillery',
      'Quartermaster & Logistics',
    ],
  },
  marines: {
    id: 'marines',
    label: 'U.S. Marine Corps',
    shortLabel: 'Marines',
    departmentLabel: 'Headquarters Marine Corps',
    enlistedLabel: 'Marines (E-1 to E-9)',
    officerLabel: 'Commanding Officers (O-1 to O-10)',
    units: [
      '1st Marine Division',
      '2nd Marine Division',
      '3rd Marine Division',
      'I Marine Expeditionary Force',
      'II Marine Expeditionary Force',
      'III Marine Expeditionary Force',
      'Marine Forces Special Operations Command',
      '1st Marine Aircraft Wing',
      '26th Marine Expeditionary Unit',
      'Marine Barracks Washington',
    ],
    specialties: [
      'Rifleman & Assault Infantry',
      'Force Reconnaissance',
      'Marine Raider Operations',
      'Expeditionary Aviation',
      'Amphibious Assault',
      'Artillery Fire Direction',
      'Signals Intelligence',
      'Ground Supply & Logistics',
      'Combat Air Control',
      'Armored Reconnaissance',
    ],
  },
  navy: {
    id: 'navy',
    label: 'U.S. Navy',
    shortLabel: 'Navy',
    departmentLabel: 'Department of the Navy',
    enlistedLabel: 'Sailors (E-1 to E-9)',
    officerLabel: 'Commanding Officers (O-1 to O-10)',
    units: [
      'Carrier Strike Group 7 (USS Ronald Reagan)',
      'Carrier Strike Group 12 (USS Gerald R. Ford)',
      'U.S. 5th Fleet (Bahrain)',
      'U.S. 6th Fleet (Naples)',
      'U.S. 7th Fleet (Yokosuka)',
      'Submarine Squadron 15',
      'Naval Special Warfare Group 2',
      'Destroyer Squadron 21',
      'Fleet Cyber Command (10th Fleet)',
      'Naval Air Force Pacific',
    ],
    specialties: [
      'Surface Warfare',
      'Submarine Nuclear Propulsion',
      'Naval Aviation & Strike Fighter',
      'Special Warfare (SEAL)',
      'Aegis Ballistic Missile Defense',
      'Cryptologic & Cyber Warfare',
      'Naval Intelligence',
      'Fleet Logistics & Replenishment',
      'Explosive Ordnance Disposal',
      'Marine Engineering',
    ],
  },
  coast_guard: {
    id: 'coast_guard',
    label: 'U.S. Coast Guard',
    shortLabel: 'Coast Guard',
    departmentLabel: 'U.S. Coast Guard Command',
    enlistedLabel: 'Coast Guardsmen (E-1 to E-9)',
    officerLabel: 'Commanding Officers (O-1 to O-10)',
    units: [
      'Coast Guard District 1 (Boston)',
      'Coast Guard District 5 (Portsmouth)',
      'Coast Guard District 7 (Miami)',
      'Coast Guard District 11 (Alameda)',
      'Coast Guard District 14 (Honolulu)',
      'Coast Guard District 17 (Juneau)',
      'Maritime Security Response Team East',
      'USCGC Bertholf (WMSL-750)',
      'USCGC Polar Star (WAGB-10)',
      'Atlantic Area Tactical Law Enforcement',
    ],
    specialties: [
      'Maritime Interdiction & Boarding',
      'Search & Rescue Aviation',
      'National Security Cutter Command',
      'Polar Icebreaking Operations',
      'Port Security & Counter-Narcotics',
      'Maritime Cyber Readiness',
      'Boatswain Mate Operations',
      'Marine Safety & Inspection',
      'Tactical Law Enforcement',
      'Aviation Survival & Rescue',
    ],
  },
};

export const SERVICE_ORDER: MilitaryServiceBranch[] = [
  'army',
  'marines',
  'navy',
  'coast_guard',
];

interface RawRankEntry {
  payGrade: string;
  title: string;
  abbr: string;
  tier: MilitaryRankTier;
  tierLabel: string;
  stars: number;
  isOfficer: boolean;
}

const ARMY_RANKS: RawRankEntry[] = [
  { payGrade: 'E-1', title: 'Private (Recruit)', abbr: 'PVT', tier: 'recruit', tierLabel: 'Recruit', stars: 0, isOfficer: false },
  { payGrade: 'E-2', title: 'Private Second Class', abbr: 'PV2', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-3', title: 'Private First Class', abbr: 'PFC', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-4', title: 'Specialist / Corporal', abbr: 'SPC/CPL', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-5', title: 'Sergeant', abbr: 'SGT', tier: 'nco', tierLabel: 'Non-Commissioned Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-6', title: 'Staff Sergeant', abbr: 'SSG', tier: 'nco', tierLabel: 'Non-Commissioned Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-7', title: 'Sergeant First Class', abbr: 'SFC', tier: 'nco', tierLabel: 'Senior NCO', stars: 0, isOfficer: false },
  { payGrade: 'E-8', title: 'Master Sergeant / First Sergeant', abbr: 'MSG/1SG', tier: 'nco', tierLabel: 'Senior NCO', stars: 0, isOfficer: false },
  { payGrade: 'E-9', title: 'Sergeant Major', abbr: 'SGM', tier: 'nco', tierLabel: 'Senior Enlisted Leader', stars: 0, isOfficer: false },
  { payGrade: 'O-1', title: 'Second Lieutenant', abbr: '2LT', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-2', title: 'First Lieutenant', abbr: '1LT', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-3', title: 'Captain', abbr: 'CPT', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-4', title: 'Major', abbr: 'MAJ', tier: 'field_officer', tierLabel: 'Field Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-5', title: 'Lieutenant Colonel', abbr: 'LTC', tier: 'field_officer', tierLabel: 'Field Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-6', title: 'Colonel', abbr: 'COL', tier: 'field_officer', tierLabel: 'Senior Commanding Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-7', title: 'Brigadier General', abbr: 'BG', tier: 'flag_officer', tierLabel: '1-Star General Officer', stars: 1, isOfficer: true },
  { payGrade: 'O-8', title: 'Major General', abbr: 'MG', tier: 'flag_officer', tierLabel: '2-Star General Officer', stars: 2, isOfficer: true },
  { payGrade: 'O-9', title: 'Lieutenant General', abbr: 'LTG', tier: 'flag_officer', tierLabel: '3-Star General Officer', stars: 3, isOfficer: true },
  { payGrade: 'O-10', title: 'General', abbr: 'GEN', tier: 'flag_officer', tierLabel: '4-Star General Officer', stars: 4, isOfficer: true },
];

const MARINES_RANKS: RawRankEntry[] = [
  { payGrade: 'E-1', title: 'Private (Recruit)', abbr: 'Pvt', tier: 'recruit', tierLabel: 'Recruit', stars: 0, isOfficer: false },
  { payGrade: 'E-2', title: 'Private First Class', abbr: 'PFC', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-3', title: 'Lance Corporal', abbr: 'LCpl', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-4', title: 'Corporal', abbr: 'Cpl', tier: 'nco', tierLabel: 'Non-Commissioned Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-5', title: 'Sergeant', abbr: 'Sgt', tier: 'nco', tierLabel: 'Non-Commissioned Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-6', title: 'Staff Sergeant', abbr: 'SSgt', tier: 'nco', tierLabel: 'Staff NCO', stars: 0, isOfficer: false },
  { payGrade: 'E-7', title: 'Gunnery Sergeant', abbr: 'GySgt', tier: 'nco', tierLabel: 'Staff NCO', stars: 0, isOfficer: false },
  { payGrade: 'E-8', title: 'Master Sergeant / First Sergeant', abbr: 'MSgt/1stSgt', tier: 'nco', tierLabel: 'Senior Staff NCO', stars: 0, isOfficer: false },
  { payGrade: 'E-9', title: 'Sergeant Major / Master Gunnery Sergeant', abbr: 'SgtMaj', tier: 'nco', tierLabel: 'Senior Enlisted Leader', stars: 0, isOfficer: false },
  { payGrade: 'O-1', title: 'Second Lieutenant', abbr: '2ndLt', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-2', title: 'First Lieutenant', abbr: '1stLt', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-3', title: 'Captain', abbr: 'Capt', tier: 'junior_officer', tierLabel: 'Company Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-4', title: 'Major', abbr: 'Maj', tier: 'field_officer', tierLabel: 'Field Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-5', title: 'Lieutenant Colonel', abbr: 'LtCol', tier: 'field_officer', tierLabel: 'Field Grade Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-6', title: 'Colonel', abbr: 'Col', tier: 'field_officer', tierLabel: 'Senior Commanding Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-7', title: 'Brigadier General', abbr: 'BGen', tier: 'flag_officer', tierLabel: '1-Star General Officer', stars: 1, isOfficer: true },
  { payGrade: 'O-8', title: 'Major General', abbr: 'MajGen', tier: 'flag_officer', tierLabel: '2-Star General Officer', stars: 2, isOfficer: true },
  { payGrade: 'O-9', title: 'Lieutenant General', abbr: 'LtGen', tier: 'flag_officer', tierLabel: '3-Star General Officer', stars: 3, isOfficer: true },
  { payGrade: 'O-10', title: 'General', abbr: 'Gen', tier: 'flag_officer', tierLabel: '4-Star General Officer', stars: 4, isOfficer: true },
];

const NAVY_COAST_GUARD_RANKS: RawRankEntry[] = [
  { payGrade: 'E-1', title: 'Seaman Recruit', abbr: 'SR', tier: 'recruit', tierLabel: 'Recruit', stars: 0, isOfficer: false },
  { payGrade: 'E-2', title: 'Seaman Apprentice', abbr: 'SA', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-3', title: 'Seaman', abbr: 'SN', tier: 'enlisted', tierLabel: 'Junior Enlisted', stars: 0, isOfficer: false },
  { payGrade: 'E-4', title: 'Petty Officer Third Class', abbr: 'PO3', tier: 'nco', tierLabel: 'Petty Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-5', title: 'Petty Officer Second Class', abbr: 'PO2', tier: 'nco', tierLabel: 'Petty Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-6', title: 'Petty Officer First Class', abbr: 'PO1', tier: 'nco', tierLabel: 'Petty Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-7', title: 'Chief Petty Officer', abbr: 'CPO', tier: 'nco', tierLabel: 'Chief Petty Officer', stars: 0, isOfficer: false },
  { payGrade: 'E-8', title: 'Senior Chief Petty Officer', abbr: 'SCPO', tier: 'nco', tierLabel: 'Senior Chief', stars: 0, isOfficer: false },
  { payGrade: 'E-9', title: 'Master Chief Petty Officer', abbr: 'MCPO', tier: 'nco', tierLabel: 'Master Chief', stars: 0, isOfficer: false },
  { payGrade: 'O-1', title: 'Ensign', abbr: 'ENS', tier: 'junior_officer', tierLabel: 'Junior Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-2', title: 'Lieutenant Junior Grade', abbr: 'LTJG', tier: 'junior_officer', tierLabel: 'Junior Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-3', title: 'Lieutenant', abbr: 'LT', tier: 'junior_officer', tierLabel: 'Junior Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-4', title: 'Lieutenant Commander', abbr: 'LCDR', tier: 'field_officer', tierLabel: 'Senior Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-5', title: 'Commander', abbr: 'CDR', tier: 'field_officer', tierLabel: 'Commanding Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-6', title: 'Captain', abbr: 'CAPT', tier: 'field_officer', tierLabel: 'Senior Commanding Officer', stars: 0, isOfficer: true },
  { payGrade: 'O-7', title: 'Rear Admiral (Lower Half)', abbr: 'RDML', tier: 'flag_officer', tierLabel: '1-Star Flag Officer', stars: 1, isOfficer: true },
  { payGrade: 'O-8', title: 'Rear Admiral (Upper Half)', abbr: 'RADM', tier: 'flag_officer', tierLabel: '2-Star Flag Officer', stars: 2, isOfficer: true },
  { payGrade: 'O-9', title: 'Vice Admiral', abbr: 'VADM', tier: 'flag_officer', tierLabel: '3-Star Flag Officer', stars: 3, isOfficer: true },
  { payGrade: 'O-10', title: 'Admiral', abbr: 'ADM', tier: 'flag_officer', tierLabel: '4-Star Flag Officer', stars: 4, isOfficer: true },
];

const SERVICE_RANK_MAP: Record<MilitaryServiceBranch, RawRankEntry[]> = {
  army: ARMY_RANKS,
  marines: MARINES_RANKS,
  navy: NAVY_COAST_GUARD_RANKS,
  coast_guard: NAVY_COAST_GUARD_RANKS,
};

export const MAX_RANK_GRADE_INDEX = 18; // O-10 (4-Star General / Admiral)

export function getServiceRankLadder(
  service: MilitaryServiceBranch
): MilitaryRankInfo[] {
  const list = SERVICE_RANK_MAP[service] || ARMY_RANKS;
  return list.map((item, gradeIndex) => ({
    gradeIndex,
    ...item,
  }));
}

export function getServiceRankInfo(
  service: MilitaryServiceBranch,
  gradeIndex: number
): MilitaryRankInfo {
  const list = SERVICE_RANK_MAP[service] || ARMY_RANKS;
  const clamped = Math.max(0, Math.min(list.length - 1, gradeIndex));
  return {
    gradeIndex: clamped,
    ...list[clamped],
  };
}

// 40 diverse given names x 40 distinct surnames = 1,600 unique combinations;
// we curate a deterministic 600-name personnel registry (hundreds of names).
const FIRST_NAMES: string[] = [
  'James', 'Marcus', 'Elena', 'Claire', 'David', 'Sarah', 'Daniel', 'Rachel',
  'Michael', 'Katherine', 'Robert', 'Hannah', 'Thomas', 'Victoria', 'William', 'Natalie',
  'Christopher', 'Rebecca', 'Anthony', 'Lauren', 'Matthew', 'Angela', 'Joseph', 'Samantha',
  'Andrew', 'Melissa', 'Benjamin', 'Stephanie', 'Samuel', 'Christine', 'Nathan', 'Jessica',
  'Gabriel', 'Monica', 'Carlos', 'Teresa', 'Jordan', 'Maya', 'Derrick', 'Adriana',
  'Patrick', 'Brianna', 'Kenneth', 'Diana', 'Gregory', 'Valerie', 'Raymond', 'Nicole',
  'Steven', 'Audrey', 'Vincent', 'Keisha', 'Travis', 'Allison', 'Trevor', 'Jacqueline',
  'Owen', 'Lydia', 'Julian', 'Evelyn',
];

const LAST_NAMES: string[] = [
  'Callahan', 'Mercer', 'Vance', 'Kowalski', 'Delgado', 'Whitaker', 'Reyes', 'Thornton',
  'Ramirez', 'Gallagher', 'Alvarez', 'Hensley', 'Donovan', 'Chambers', 'Castellano', 'Bradford',
  'Morrison', 'Nakamura', 'Fitzgerald', 'Patel', 'Serrano', 'Holloway', 'Lindqvist', 'Okafor',
  'McAllister', 'Kensington', 'Santana', 'Benson', 'Halvorsen', 'Zimmerman', 'Harrington', 'Cruz',
  'Fletcher', 'Keller', 'Navarro', 'Buchanan', 'Prescott', 'Montoya', 'Caldwell', 'Sinclair',
  'Brennan', 'Davenport', 'Cortez', 'Lawson', 'Strickland', 'Takahashi', 'Kerrigan', 'Manning',
  'Bautista', 'Pendleton', 'Kessler', 'Whitfield', 'Mendoza', 'Carlisle', 'Hawthorne', 'Solis',
  'Barrett', 'Hollis', 'Abernathy', 'Delacroix',
];

/**
 * Guaranteed pool of 600 unique full names generated deterministically without repetition.
 */
export const MILITARY_NAME_POOL: string[] = (() => {
  const names: string[] = [];
  const seen = new Set<string>();
  // Strided permutation across 60 x 60 = 3,600 pairs so names feel naturally varied
  for (let round = 0; round < 10; round++) {
    for (let i = 0; i < FIRST_NAMES.length; i++) {
      const first = FIRST_NAMES[i];
      const last = LAST_NAMES[(i * 7 + round * 13) % LAST_NAMES.length];
      const full = `${first} ${last}`;
      if (!seen.has(full)) {
        seen.add(full);
        names.push(full);
        if (names.length >= 600) {
          return names;
        }
      }
    }
  }
  return names;
})();

// Grade distribution per service (60 personnel per service = 240 starting personnel across all 4 branches)
// Covers every rank from E-1 Recruit (0) through O-10 4-Star General/Admiral (18)
const GRADE_DISTRIBUTION_PER_SERVICE: number[] = [
  0, 0, 0, 0, 0, // 5 Recruits (E-1)
  1, 1, 1,       // 3 E-2
  2, 2, 2,       // 3 E-3
  3, 3, 3, 3,    // 4 E-4
  4, 4, 4, 4,    // 4 E-5
  5, 5, 5,       // 3 E-6
  6, 6, 6,       // 3 E-7
  7, 7,          // 2 E-8
  8, 8,          // 2 E-9
  9, 9, 9, 9,    // 4 O-1 (Ensign / 2ndLt)
  10, 10, 10,    // 3 O-2
  11, 11, 11, 11,// 4 O-3 (Captain / Lieutenant)
  12, 12, 12,    // 3 O-4 (Major / LCDR)
  13, 13, 13,    // 3 O-5 (LtCol / Commander)
  14, 14, 14,    // 3 O-6 (Colonel / Captain)
  15, 15, 15,    // 3 O-7 (1-Star)
  16, 16, 16,    // 3 O-8 (2-Star)
  17, 17,        // 2 O-9 (3-Star)
  18, 18, 18,    // 3 O-10 (4-Star General / Admiral)
]; // Total = 60 per service -> 240 initial roster members

function estimateYearsForGrade(gradeIndex: number, seed: number): number {
  if (gradeIndex === 0) return 0;
  if (gradeIndex <= 3) return 1 + (gradeIndex - 1) + (seed % 2);
  if (gradeIndex <= 6) return 4 + (gradeIndex - 4) * 2 + (seed % 3);
  if (gradeIndex <= 8) return 14 + (gradeIndex - 7) * 4 + (seed % 4);
  if (gradeIndex <= 11) return 1 + (gradeIndex - 9) * 2 + (seed % 3);
  if (gradeIndex <= 14) return 10 + (gradeIndex - 12) * 4 + (seed % 4);
  return 24 + (gradeIndex - 15) * 3 + (seed % 5);
}

function estimateStatusForGrade(
  gradeIndex: number,
  seed: number
): MilitaryServiceMember['status'] {
  if (gradeIndex >= 15) return 'Command Staff';
  if (gradeIndex >= 12 && seed % 2 === 0) return 'Command Staff';
  if (seed % 3 === 0) return 'Forward Deployed';
  return 'Active Duty';
}

export const MILITARY_MEDALS: MilitaryMedalDefinition[] = [
  {
    id: 'medal_achievement',
    name: 'Service Achievement Medal',
    abbr: 'SAM',
    tier: 'achievement',
    tierLabel: 'Achievement Decoration',
    minMeritScore: 76,
    serviceSpecificNames: {
      army: 'Army Achievement Medal',
      marines: 'Navy and Marine Corps Achievement Medal',
      navy: 'Navy and Marine Corps Achievement Medal',
      coast_guard: 'Coast Guard Achievement Medal',
    },
    eligibilityNote: 'Requires Performance Merit Score ≥ 76',
    description:
      'Recognizes meritorious service or achievement in combat or non-combat duty by enlisted personnel and junior officers.',
    readinessBonus: 0.15,
    approvalBonus: 0,
    meritBoost: 2,
  },
  {
    id: 'medal_commendation',
    name: 'Service Commendation Medal',
    abbr: 'SCM',
    tier: 'commendation',
    tierLabel: 'Commendation Medal',
    minMeritScore: 80,
    serviceSpecificNames: {
      army: 'Army Commendation Medal',
      marines: 'Navy and Marine Corps Commendation Medal',
      navy: 'Navy and Marine Corps Commendation Medal',
      coast_guard: 'Coast Guard Commendation Medal',
    },
    eligibilityNote: 'Requires Performance Merit Score ≥ 80',
    description:
      'Awarded for sustained acts of heroism, meritorious achievement, or exemplary unit readiness leadership.',
    readinessBonus: 0.25,
    approvalBonus: 0.1,
    meritBoost: 2,
  },
  {
    id: 'medal_msm',
    name: 'Meritorious Service Medal',
    abbr: 'MSM',
    tier: 'meritorious',
    tierLabel: 'Meritorious Service',
    minMeritScore: 84,
    eligibilityNote: 'Requires Performance Merit Score ≥ 84',
    description:
      'Conferred for outstanding non-combat meritorious achievement or exceptional operational command service.',
    readinessBonus: 0.3,
    approvalBonus: 0.15,
    meritBoost: 2,
  },
  {
    id: 'medal_bronze_star',
    name: 'Bronze Star Medal',
    abbr: 'BSM',
    tier: 'meritorious',
    tierLabel: 'Combat & Operational Merit',
    minMeritScore: 87,
    eligibilityNote: 'Requires Performance Merit Score ≥ 87',
    description:
      'Awarded for heroic or meritorious achievement or service in a combat zone or forward-deployed theater.',
    readinessBonus: 0.4,
    approvalBonus: 0.2,
    meritBoost: 2,
  },
  {
    id: 'medal_legion_of_merit',
    name: 'Legion of Merit',
    abbr: 'LOM',
    tier: 'distinguished',
    tierLabel: 'Distinguished Command',
    minMeritScore: 90,
    eligibilityNote: 'Requires Performance Merit Score ≥ 90',
    description:
      'Presented for exceptionally meritorious conduct in the performance of outstanding services and senior command achievements.',
    readinessBonus: 0.5,
    approvalBonus: 0.25,
    meritBoost: 2,
  },
  {
    id: 'medal_silver_star',
    name: 'Silver Star Medal',
    abbr: 'SSM',
    tier: 'valor',
    tierLabel: 'Gallantry in Action',
    minMeritScore: 92,
    eligibilityNote: 'Requires Performance Merit Score ≥ 92',
    description:
      'Third-highest military combat decoration awarded for gallantry in action against an enemy of the United States.',
    readinessBonus: 0.6,
    approvalBonus: 0.35,
    meritBoost: 3,
  },
  {
    id: 'medal_service_cross',
    name: 'Distinguished Service Cross',
    abbr: 'DSC/NC',
    tier: 'valor',
    tierLabel: 'Extraordinary Heroism',
    minMeritScore: 95,
    serviceSpecificNames: {
      army: 'Distinguished Service Cross',
      marines: 'Navy Cross',
      navy: 'Navy Cross',
      coast_guard: 'Coast Guard Cross',
    },
    eligibilityNote: 'Requires Performance Merit Score ≥ 95',
    description:
      'Second-highest military decoration for extraordinary heroism while engaged in military operations.',
    readinessBonus: 0.75,
    approvalBonus: 0.5,
    meritBoost: 2,
  },
  {
    id: 'medal_ddsm',
    name: 'Defense Distinguished Service Medal',
    abbr: 'DDSM',
    tier: 'distinguished',
    tierLabel: 'Joint Command Honor',
    minMeritScore: 96,
    eligibilityNote: 'Requires Performance Merit Score ≥ 96',
    description:
      'Highest non-combat defense decoration for exceptionally distinguished performance contributing to national security at the joint command level.',
    readinessBonus: 0.85,
    approvalBonus: 0.5,
    meritBoost: 2,
  },
  {
    id: 'medal_of_honor',
    name: 'Medal of Honor',
    abbr: 'MOH',
    tier: 'highest_honor',
    tierLabel: 'Highest National Decoration',
    minMeritScore: 98,
    eligibilityNote: 'Requires Performance Merit Score ≥ 98',
    description:
      'Presented personally by the President in the name of Congress for conspicuous gallantry and intrepidity at the risk of life above and beyond the call of duty.',
    readinessBonus: 1.2,
    approvalBonus: 0.9,
    meritBoost: 1,
  },
];

export function getMedalDisplayName(
  medal: MilitaryMedalDefinition,
  service: MilitaryServiceBranch
): string {
  return medal.serviceSpecificNames?.[service] || medal.name;
}

export function canAwardMedalToMember(
  member: MilitaryServiceMember,
  medal: MilitaryMedalDefinition
): { eligible: boolean; reason?: string } {
  if (member.meritScore < medal.minMeritScore) {
    return {
      eligible: false,
      reason: `Requires Merit Score ${medal.minMeritScore}+ (currently ${member.meritScore})`,
    };
  }
  const existing = member.serviceRecordMedals || [];
  if (
    medal.id === 'medal_of_honor' &&
    existing.some((m) => m.medalId === 'medal_of_honor')
  ) {
    return {
      eligible: false,
      reason: 'Already awarded the Medal of Honor in service record',
    };
  }
  return { eligible: true };
}

export function getEligibleMedalsForMember(
  member: MilitaryServiceMember
): MilitaryMedalDefinition[] {
  return MILITARY_MEDALS.filter(
    (medal) => canAwardMedalToMember(member, medal).eligible
  );
}

export function getTopEligibleMedalForMember(
  member: MilitaryServiceMember
): MilitaryMedalDefinition | null {
  const eligible = getEligibleMedalsForMember(member);
  if (eligible.length === 0) return null;
  const existingIds = new Set(
    (member.serviceRecordMedals || []).map((r) => r.medalId)
  );
  // Prefer highest-tier medal not yet in their service record; otherwise top eligible
  const unowned = eligible.filter((m) => !existingIds.has(m.id));
  if (unowned.length > 0) return unowned[unowned.length - 1];
  return eligible[eligible.length - 1];
}

function buildBaselineServiceMedals(
  id: string,
  name: string,
  service: MilitaryServiceBranch,
  gradeIndex: number,
  meritScore: number,
  commendations: number,
  unit: string,
  specialty: string
): MilitaryMedalAwardRecord[] {
  if (commendations <= 0 || gradeIndex === 0) return [];
  const rankAbbr = getServiceRankInfo(service, gradeIndex).abbr;
  const candidates = MILITARY_MEDALS.filter(
    (m) => m.id !== 'medal_of_honor' && meritScore >= m.minMeritScore
  );
  const pool =
    candidates.length > 0 ? candidates : [MILITARY_MEDALS[0]];
  const count = Math.min(3, commendations, pool.length);
  const picked = pool.slice(0, count);

  return picked.map((medal, idx) => ({
    id: `init-med-${id}-${medal.id}-${idx}`,
    memberId: id,
    memberName: name,
    memberRankAbbr: rankAbbr,
    service,
    medalId: medal.id,
    medalName: getMedalDisplayName(medal, service),
    medalAbbr: medal.abbr,
    tier: medal.tier,
    month: 0,
    meritScoreAtAward: meritScore,
    citation: `Prior tour citation for ${specialty} excellence with ${unit}.`,
    awardedBy: 'Prior Service Board',
  }));
}

export function createInitialMilitaryRoster(): MilitaryServiceMember[] {
  const roster: MilitaryServiceMember[] = [];
  let nameCursor = 0;

  for (const service of SERVICE_ORDER) {
    const meta = MILITARY_SERVICES[service];
    for (let i = 0; i < GRADE_DISTRIBUTION_PER_SERVICE.length; i++) {
      const gradeIndex = GRADE_DISTRIBUTION_PER_SERVICE[i];
      const name = MILITARY_NAME_POOL[nameCursor % MILITARY_NAME_POOL.length];
      nameCursor++;

      const unit = meta.units[(i + nameCursor) % meta.units.length];
      const specialty =
        meta.specialties[(i * 3 + nameCursor) % meta.specialties.length];
      const meritScore = Math.min(
        99,
        Math.max(
          72,
          74 + ((nameCursor * 11 + gradeIndex * 3) % 24)
        )
      );
      const commendations =
        gradeIndex === 0
          ? 0
          : Math.min(18, Math.floor(gradeIndex * 0.65) + (nameCursor % 3));
      const id = `mil-${service}-${i}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const baselineMedals = buildBaselineServiceMedals(
        id,
        name,
        service,
        gradeIndex,
        meritScore,
        commendations,
        unit,
        specialty
      );

      roster.push({
        id,
        name,
        service,
        gradeIndex,
        specialty,
        unit,
        yearsOfService: estimateYearsForGrade(gradeIndex, nameCursor),
        commendations: Math.max(commendations, baselineMedals.length),
        meritScore,
        status: estimateStatusForGrade(gradeIndex, nameCursor),
        serviceRecordMedals: baselineMedals,
      });
    }
  }

  return roster;
}

export function recruitMilitaryPersonnel(
  existingRoster: MilitaryServiceMember[],
  service: MilitaryServiceBranch,
  startingGradeIndex: number
): MilitaryServiceMember {
  const usedNames = new Set(
    existingRoster.map((m) => m.name.trim().toLowerCase())
  );
  const availableName =
    MILITARY_NAME_POOL.find((n) => !usedNames.has(n.toLowerCase())) ||
    `${FIRST_NAMES[existingRoster.length % FIRST_NAMES.length]} ${
      LAST_NAMES[(existingRoster.length * 3 + 7) % LAST_NAMES.length]
    } Jr.`;

  const meta = MILITARY_SERVICES[service];
  const seed = existingRoster.length + 17;
  const clampedGrade = Math.max(
    0,
    Math.min(MAX_RANK_GRADE_INDEX, startingGradeIndex)
  );
  const id = `mil-${service}-rec-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const meritScore = 80 + (seed % 16);
  const unit = meta.units[(seed * 3) % meta.units.length];
  const specialty = meta.specialties[seed % meta.specialties.length];
  const baselineMedals = buildBaselineServiceMedals(
    id,
    availableName,
    service,
    clampedGrade,
    meritScore,
    clampedGrade === 0 ? 0 : 1,
    unit,
    specialty
  );

  return {
    id,
    name: availableName,
    service,
    gradeIndex: clampedGrade,
    specialty,
    unit,
    yearsOfService: clampedGrade === 0 ? 0 : estimateYearsForGrade(clampedGrade, seed),
    commendations: baselineMedals.length,
    meritScore,
    status: clampedGrade >= 15 ? 'Command Staff' : 'Active Duty',
    serviceRecordMedals: baselineMedals,
  };
}
