import {
  DeployableMilitaryUnit,
  MilitaryCommandState,
  MilitaryServiceBranch,
  MilitaryServiceMember,
  RegionalTheaterDefinition,
  RegionalTheaterId,
  TheaterSecurityEventDefinition,
  TheaterUnitAssignment,
  TheaterUnitPosture,
} from '../types/game';

export const REGIONAL_THEATERS: RegionalTheaterDefinition[] = [
  {
    id: 'americas',
    name: 'Western Hemisphere & Americas',
    commandCode: 'NORTHCOM / SOUTHCOM',
    hqLabel: 'Miami & Colorado Springs',
    strategicSummary:
      'Homeland airspace approaches, Caribbean & Panama transit corridors, Arctic northern passages, and hemispheric stability.',
    mapPin: { x: 185, y: 170 },
    sectorBox: { x: 52, y: 42, width: 255, height: 295 },
    labelAnchor: { x: 180, y: 318 },
    countries: [
      'United States',
      'Canada',
      'Mexico',
      'Brazil',
      'Venezuela',
      'Cuba',
      'Colombia',
      'Panama',
      'Argentina',
      'Chile',
      'Peru',
      'Haiti',
      'Arctic',
    ],
    maxUnits: 4,
  },
  {
    id: 'europe',
    name: 'European & Black Sea Theater',
    commandCode: 'EUCOM',
    hqLabel: 'Stuttgart & Naples',
    strategicSummary:
      'NATO Eastern Flank deterrence, Baltic-Black Sea maritime corridors, missile defense shields, and transatlantic cohesion.',
    mapPin: { x: 448, y: 108 },
    sectorBox: { x: 382, y: 44, width: 158, height: 112 },
    labelAnchor: { x: 461, y: 66 },
    countries: [
      'United Kingdom',
      'Germany',
      'France',
      'Poland',
      'Ukraine',
      'Russia',
      'Eastern Europe',
      'European Union',
      'Ukraine & Eastern Flank',
      'Italy',
      'Spain',
      'Norway',
      'Sweden',
      'Finland',
      'Baltics',
      'Turkey',
    ],
    maxUnits: 4,
  },
  {
    id: 'middle_east',
    name: 'Middle East & Red Sea Corridor',
    commandCode: 'CENTCOM',
    hqLabel: 'Bahrain & Tampa Forward',
    strategicSummary:
      'Strait of Hormuz energy chokepoint, Red Sea commercial shipping escorts, Gulf coalition defense, and air defense umbrellas.',
    mapPin: { x: 528, y: 182 },
    sectorBox: { x: 472, y: 156, width: 122, height: 84 },
    labelAnchor: { x: 533, y: 230 },
    countries: [
      'Iran',
      'Saudi Arabia',
      'Saudi Arabia & Gulf Coalition',
      'Israel',
      'Red Sea / Yemen',
      'Yemen',
      'Iraq',
      'Syria',
      'Jordan',
      'UAE',
      'Qatar',
      'Bahrain',
      'Egypt',
      'Oman',
    ],
    maxUnits: 4,
  },
  {
    id: 'indo_pacific',
    name: 'Indo-Pacific & First Island Chain',
    commandCode: 'INDOPACOM',
    hqLabel: 'Honolulu & Yokosuka',
    strategicSummary:
      'Taiwan Strait & South China Sea freedom of navigation, Korean Peninsula deterrence, and semiconductor sea lanes.',
    mapPin: { x: 705, y: 162 },
    sectorBox: { x: 598, y: 64, width: 228, height: 242 },
    labelAnchor: { x: 712, y: 292 },
    countries: [
      'China',
      'Taiwan',
      'Taiwan Strait',
      'South China Sea',
      'Japan',
      'South Korea',
      'Japan & South Korea',
      'North Korea',
      'India',
      'Vietnam',
      'Philippines',
      'Australia',
      'Indonesia',
      'Singapore',
      'Thailand',
    ],
    maxUnits: 4,
  },
  {
    id: 'africa_atlantic',
    name: 'Africa & South Atlantic Approaches',
    commandCode: 'AFRICOM',
    hqLabel: 'Djibouti & Atlantic Fleet',
    strategicSummary:
      'Sahel counter-extremism partnerships, Horn of Africa maritime security, and West African critical mineral sea routes.',
    mapPin: { x: 432, y: 238 },
    sectorBox: { x: 356, y: 166, width: 112, height: 158 },
    labelAnchor: { x: 412, y: 312 },
    countries: [
      'Nigeria',
      'Kenya',
      'South Africa',
      'Ethiopia',
      'Somalia',
      'Morocco',
      'Algeria',
      'Djibouti',
      'Sudan',
      'Libya',
      'Ghana',
      'Senegal',
    ],
    maxUnits: 4,
  },
];

export const DEPLOYABLE_MILITARY_UNITS: DeployableMilitaryUnit[] = [
  // U.S. Army (4 units)
  {
    id: 'unit-82nd-airborne',
    name: '82nd Airborne Division',
    shortCode: '82 ABN',
    branch: 'army',
    unitType: 'Global Rapid-Response Infantry',
    strengthRating: 86,
    diplomacyBonusPct: 3,
    securityBonusPct: 6,
    preferredTheaters: ['europe', 'middle_east', 'africa_atlantic'],
    specialtyNote: '18-hour strategic airlift deployment for crisis deterrence.',
  },
  {
    id: 'unit-1st-armored',
    name: '1st Armored Division',
    shortCode: '1 AD',
    branch: 'army',
    unitType: 'Heavy Mechanized Armor',
    strengthRating: 90,
    diplomacyBonusPct: 2,
    securityBonusPct: 7,
    preferredTheaters: ['europe', 'middle_east'],
    specialtyNote: 'Heavy armored deterrent along contested land borders.',
  },
  {
    id: 'unit-75th-ranger',
    name: '75th Ranger Regiment',
    shortCode: '75 RGR',
    branch: 'army',
    unitType: 'Special Operations Strike',
    strengthRating: 88,
    diplomacyBonusPct: 2,
    securityBonusPct: 7,
    preferredTheaters: ['middle_east', 'africa_atlantic', 'americas'],
    specialtyNote: 'Precision counter-terror and high-value asset interdiction.',
  },
  {
    id: 'unit-army-cyber',
    name: 'Army Cyber Command',
    shortCode: 'ARCYBER',
    branch: 'army',
    unitType: 'Cyber & Electronic Warfare',
    strengthRating: 84,
    diplomacyBonusPct: 4,
    securityBonusPct: 5,
    preferredTheaters: ['europe', 'indo_pacific', 'americas'],
    specialtyNote: 'Shields allied grids and counters state-sponsored intrusions.',
  },

  // U.S. Marine Corps (4 units)
  {
    id: 'unit-1st-marines',
    name: '1st Marine Division',
    shortCode: '1 MARDIV',
    branch: 'marines',
    unitType: 'Amphibious Expeditionary Ground',
    strengthRating: 88,
    diplomacyBonusPct: 3,
    securityBonusPct: 6,
    preferredTheaters: ['indo_pacific', 'americas'],
    specialtyNote: 'Littoral island defense and forward amphibious assault.',
  },
  {
    id: 'unit-iii-mef',
    name: 'III Marine Expeditionary Force',
    shortCode: 'III MEF',
    branch: 'marines',
    unitType: 'Indo-Pacific Air-Ground Task Force',
    strengthRating: 91,
    diplomacyBonusPct: 4,
    securityBonusPct: 6,
    preferredTheaters: ['indo_pacific'],
    specialtyNote: 'Okinawa-based rapid littoral denial across the First Island Chain.',
  },
  {
    id: 'unit-26th-meu',
    name: '26th Marine Expeditionary Unit',
    shortCode: '26 MEU',
    branch: 'marines',
    unitType: 'Maritime Crisis Response',
    strengthRating: 85,
    diplomacyBonusPct: 4,
    securityBonusPct: 5,
    preferredTheaters: ['middle_east', 'europe', 'africa_atlantic'],
    specialtyNote: 'Embassy reinforcement, NEO evacuations, and amphibious raids.',
  },
  {
    id: 'unit-marsoc',
    name: 'Marine Forces Special Operations Command',
    shortCode: 'MARSOC',
    branch: 'marines',
    unitType: 'Marine Raider Detachments',
    strengthRating: 87,
    diplomacyBonusPct: 3,
    securityBonusPct: 6,
    preferredTheaters: ['africa_atlantic', 'middle_east', 'indo_pacific'],
    specialtyNote: 'Partner-force training and austere maritime reconnaissance.',
  },

  // U.S. Navy (4 units)
  {
    id: 'unit-csg-7',
    name: 'Carrier Strike Group 7 (USS Ronald Reagan)',
    shortCode: 'CSG-7',
    branch: 'navy',
    unitType: 'Nuclear Carrier Strike Group',
    strengthRating: 96,
    diplomacyBonusPct: 5,
    securityBonusPct: 7,
    preferredTheaters: ['indo_pacific', 'middle_east'],
    specialtyNote: 'Flagship power projection, carrier air wing, and sea-lane assurance.',
  },
  {
    id: 'unit-csg-12',
    name: 'Carrier Strike Group 12 (USS Gerald R. Ford)',
    shortCode: 'CSG-12',
    branch: 'navy',
    unitType: 'Next-Gen Carrier Strike Group',
    strengthRating: 97,
    diplomacyBonusPct: 5,
    securityBonusPct: 7,
    preferredTheaters: ['europe', 'middle_east', 'americas'],
    specialtyNote: 'High-sortie carrier air supremacy for allied assurance.',
  },
  {
    id: 'unit-5th-fleet',
    name: 'U.S. 5th Fleet (Bahrain)',
    shortCode: '5TH FLT',
    branch: 'navy',
    unitType: 'Aegis Surface & Escort Fleet',
    strengthRating: 90,
    diplomacyBonusPct: 4,
    securityBonusPct: 6,
    preferredTheaters: ['middle_east', 'africa_atlantic'],
    specialtyNote: 'Protects Strait of Hormuz & Bab el-Mandeb tanker corridors.',
  },
  {
    id: 'unit-subron-15',
    name: 'Submarine Squadron 15',
    shortCode: 'SUBRON 15',
    branch: 'navy',
    unitType: 'Fast-Attack & Guided-Missile Submarines',
    strengthRating: 92,
    diplomacyBonusPct: 2,
    securityBonusPct: 8,
    preferredTheaters: ['indo_pacific', 'europe'],
    specialtyNote: 'Stealth undersea deterrence and intelligence surveillance.',
  },

  // U.S. Coast Guard (4 units)
  {
    id: 'unit-uscgc-bertholf',
    name: 'USCGC Bertholf (WMSL-750)',
    shortCode: 'WMSL-750',
    branch: 'coast_guard',
    unitType: 'National Security Cutter',
    strengthRating: 80,
    diplomacyBonusPct: 5,
    securityBonusPct: 4,
    preferredTheaters: ['indo_pacific', 'americas'],
    specialtyNote: 'Rules-based maritime diplomacy and illegal-fishing interdiction.',
  },
  {
    id: 'unit-uscgc-polar-star',
    name: 'USCGC Polar Star (WAGB-10)',
    shortCode: 'WAGB-10',
    branch: 'coast_guard',
    unitType: 'Heavy Polar Icebreaker',
    strengthRating: 78,
    diplomacyBonusPct: 4,
    securityBonusPct: 4,
    preferredTheaters: ['americas', 'europe'],
    specialtyNote: 'Secures Arctic sea lanes and high-latitude sovereignty patrols.',
  },
  {
    id: 'unit-msrt-east',
    name: 'Maritime Security Response Team East',
    shortCode: 'MSRT-E',
    branch: 'coast_guard',
    unitType: 'Tactical Maritime Counter-Terror',
    strengthRating: 82,
    diplomacyBonusPct: 3,
    securityBonusPct: 5,
    preferredTheaters: ['americas', 'africa_atlantic', 'middle_east'],
    specialtyNote: 'High-risk vessel boarding, port defense, and contraband seizure.',
  },
  {
    id: 'unit-cg-district-7',
    name: 'Coast Guard District 7 (Miami)',
    shortCode: 'CG D7',
    branch: 'coast_guard',
    unitType: 'Caribbean & Atlantic Maritime Command',
    strengthRating: 79,
    diplomacyBonusPct: 5,
    securityBonusPct: 4,
    preferredTheaters: ['americas', 'africa_atlantic'],
    specialtyNote: 'Counter-narcotics interception and regional partner coast guard liaison.',
  },
];

export const THEATER_SECURITY_EVENTS: TheaterSecurityEventDefinition[] = [
  // Americas
  {
    id: 'evt-americas-caribbean',
    theaterId: 'americas',
    title: 'Caribbean Maritime Trafficking & Canal Approach Surge',
    category: 'Maritime Security',
    threatSummary:
      'Transnational smuggling flotillas and drone reconnaissance threaten Panama Canal transit lanes and Gulf shipping.',
    baseSuccessPct: 56,
    recommendedBranches: ['coast_guard', 'navy'],
    successRewards: { diplomaticDelta: 1.4, approvalDelta: 0.9, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.1, approvalDelta: -0.9, readinessDelta: -2 },
  },
  {
    id: 'evt-americas-arctic',
    theaterId: 'americas',
    title: 'High-Arctic Airspace & Sea-Lane Incursion',
    category: 'Air Defense',
    threatSummary:
      'Long-range bomber probes and ice-capable research vessels test NORAD northern approaches near Alaska and Greenland.',
    baseSuccessPct: 52,
    recommendedBranches: ['coast_guard', 'army'],
    successRewards: { diplomaticDelta: 1.6, approvalDelta: 1.0, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.4, approvalDelta: -0.8, readinessDelta: -2 },
  },

  // Europe
  {
    id: 'evt-europe-baltic',
    theaterId: 'europe',
    title: 'Baltic Subsea Cable & Eastern Flank Deterrence Test',
    category: 'Counter-Proliferation',
    threatSummary:
      'Hybrid electronic jamming and shadow-fleet sabotage threaten NATO Baltic energy interconnects and border garrisons.',
    baseSuccessPct: 50,
    recommendedBranches: ['army', 'navy'],
    successRewards: { diplomaticDelta: 2.1, approvalDelta: 0.8, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -2.0, approvalDelta: -1.1, readinessDelta: -2 },
  },
  {
    id: 'evt-europe-blacksea',
    theaterId: 'europe',
    title: 'Black Sea Grain & Missile Defense Corridor',
    category: 'Air Defense',
    threatSummary:
      'Coordinated drone salvos and naval minefields imperil allied grain exports and port infrastructure along the Eastern Flank.',
    baseSuccessPct: 48,
    recommendedBranches: ['navy', 'army'],
    successRewards: { diplomaticDelta: 2.4, approvalDelta: 1.0, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -2.2, approvalDelta: -1.2, readinessDelta: -3 },
  },

  // Middle East
  {
    id: 'evt-mideast-redsea',
    theaterId: 'middle_east',
    title: 'Bab el-Mandeb & Red Sea Commercial Shipping Escort',
    category: 'Maritime Security',
    threatSummary:
      'Anti-ship ballistic missiles and unmanned surface craft threaten global container traffic through the Red Sea.',
    baseSuccessPct: 49,
    recommendedBranches: ['navy', 'marines'],
    successRewards: { diplomaticDelta: 1.9, approvalDelta: 1.1, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.8, approvalDelta: -1.3, readinessDelta: -3 },
  },
  {
    id: 'evt-mideast-hormuz',
    theaterId: 'middle_east',
    title: 'Strait of Hormuz Tanker Seizure Deterrence',
    category: 'Counter-Proliferation',
    threatSummary:
      'Fast-attack patrol swarms attempt to interdict allied crude carriers passing through the Strait of Hormuz.',
    baseSuccessPct: 47,
    recommendedBranches: ['navy', 'army'],
    successRewards: { diplomaticDelta: 2.2, approvalDelta: 1.2, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -2.3, approvalDelta: -1.4, readinessDelta: -3 },
  },

  // Indo-Pacific
  {
    id: 'evt-pac-taiwan',
    theaterId: 'indo_pacific',
    title: 'First Island Chain Gray-Zone Blockade Drill',
    category: 'Maritime Security',
    threatSummary:
      'Massed maritime militia and air-defense exclusion zones test freedom of navigation along critical semiconductor lanes.',
    baseSuccessPct: 46,
    recommendedBranches: ['navy', 'marines'],
    successRewards: { diplomaticDelta: 2.5, approvalDelta: 1.1, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -2.4, approvalDelta: -1.3, readinessDelta: -3 },
  },
  {
    id: 'evt-pac-korea',
    theaterId: 'indo_pacific',
    title: 'Korean Peninsula Ballistic Missile & Cyber Escalation',
    category: 'Air Defense',
    threatSummary:
      'Simultaneous ICBM telemetry tests and cyber disruptions target allied command networks in Seoul and Tokyo.',
    baseSuccessPct: 51,
    recommendedBranches: ['army', 'navy'],
    successRewards: { diplomaticDelta: 2.0, approvalDelta: 1.0, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.9, approvalDelta: -1.0, readinessDelta: -2 },
  },

  // Africa & South Atlantic
  {
    id: 'evt-africa-horn',
    theaterId: 'africa_atlantic',
    title: 'Horn of Africa Piracy & Embassy Contingency',
    category: 'Maritime Security',
    threatSummary:
      'Renewed deep-water hijacking syndicates and coastal instability threaten humanitarian corridors and diplomatic missions.',
    baseSuccessPct: 55,
    recommendedBranches: ['marines', 'coast_guard'],
    successRewards: { diplomaticDelta: 1.7, approvalDelta: 0.8, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.4, approvalDelta: -0.9, readinessDelta: -2 },
  },
  {
    id: 'evt-africa-gulfguinea',
    theaterId: 'africa_atlantic',
    title: 'Gulf of Guinea Port Security & Mineral Transit Shield',
    category: 'Border Stability',
    threatSummary:
      'Armed maritime raiders target offshore energy platforms and critical mineral export terminals along the Atlantic rim.',
    baseSuccessPct: 54,
    recommendedBranches: ['coast_guard', 'marines'],
    successRewards: { diplomaticDelta: 1.6, approvalDelta: 0.7, readinessDelta: 1 },
    failurePenalties: { diplomaticDelta: -1.3, approvalDelta: -0.8, readinessDelta: -2 },
  },
];

export function createDefaultTheaterAssignments(): TheaterUnitAssignment[] {
  return [
    {
      unitId: 'unit-csg-7',
      theaterId: 'indo_pacific',
      posture: 'Forward Presence',
      assignedMonth: 1,
    },
    {
      unitId: 'unit-82nd-airborne',
      theaterId: 'europe',
      posture: 'Deterrence Patrol',
      assignedMonth: 1,
    },
    {
      unitId: 'unit-5th-fleet',
      theaterId: 'middle_east',
      posture: 'Forward Presence',
      assignedMonth: 1,
    },
  ];
}

export function resolveCountryToTheater(
  countryOrRegion: string
): RegionalTheaterDefinition {
  const norm = countryOrRegion.trim().toLowerCase();
  if (!norm) return REGIONAL_THEATERS[3]; // default Indo-Pacific

  for (const theater of REGIONAL_THEATERS) {
    if (
      theater.name.toLowerCase().includes(norm) ||
      theater.countries.some(
        (c) =>
          c.toLowerCase() === norm ||
          norm.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(norm)
      )
    ) {
      return theater;
    }
  }

  // Keyword heuristics for custom typed nations/regions
  if (
    /pacific|asia|korea|china|taiwan|japan|india|vietnam|philippines|australia|malaysia|indonesia|myanmar|thailand|strait/.test(
      norm
    )
  ) {
    return REGIONAL_THEATERS[3];
  }
  if (
    /iran|iraq|syria|yemen|red sea|saudi|gulf|israel|gaza|lebanon|jordan|qatar|oman|bahrain|middle east|hormuz/.test(
      norm
    )
  ) {
    return REGIONAL_THEATERS[2];
  }
  if (
    /europe|ukraine|russia|nato|germany|france|uk|britain|poland|baltic|black sea|belarus|nordic|italy|spain|eu/.test(
      norm
    )
  ) {
    return REGIONAL_THEATERS[1];
  }
  if (
    /africa|sahel|somalia|nigeria|kenya|sudan|congo|ethiopia|djibouti|atlantic|guinea|morocco|libya/.test(
      norm
    )
  ) {
    return REGIONAL_THEATERS[4];
  }
  if (
    /america|canada|mexico|cuba|venezuela|brazil|colombia|panama|haiti|caribbean|arctic|greenland|latin/.test(
      norm
    )
  ) {
    return REGIONAL_THEATERS[0];
  }

  return REGIONAL_THEATERS[1]; // Default fallback to Europe
}

export interface ComputedTheaterUnitDetail {
  assignment: TheaterUnitAssignment;
  unit: DeployableMilitaryUnit;
  rosterMatches: MilitaryServiceMember[];
  isPreferredTheater: boolean;
  diplomacyContribution: number;
  securityContribution: number;
}

export interface TheaterInfluenceSummary {
  theater: RegionalTheaterDefinition;
  assignedUnits: ComputedTheaterUnitDetail[];
  unitCount: number;
  totalStrength: number;
  rosterSynergyCount: number;
  diplomacyOddsBonusPct: number;
  securityOddsBonusPct: number;
  operationSuccessProbabilityPct: number;
  deterrenceLabel: string;
}

const POSTURE_MODIFIERS: Record<
  TheaterUnitPosture,
  { diplomacyMult: number; securityMult: number }
> = {
  'Forward Presence': { diplomacyMult: 1.25, securityMult: 0.95 },
  'Deterrence Patrol': { diplomacyMult: 1.0, securityMult: 1.1 },
  'Rapid Contingency': { diplomacyMult: 0.85, securityMult: 1.3 },
};

export function computeTheaterInfluence(
  theaterId: RegionalTheaterId,
  assignments: TheaterUnitAssignment[],
  militaryRoster: MilitaryServiceMember[] = [],
  military?: MilitaryCommandState
): TheaterInfluenceSummary {
  const theater =
    REGIONAL_THEATERS.find((t) => t.id === theaterId) || REGIONAL_THEATERS[0];

  const matchingAssignments = assignments.filter(
    (a) => a.theaterId === theaterId
  );

  let rawDiplomacy = 0;
  let rawSecurity = 0;
  let totalStrength = 0;
  let rosterSynergyCount = 0;

  const assignedUnits: ComputedTheaterUnitDetail[] = [];

  for (const assignment of matchingAssignments) {
    const unit = DEPLOYABLE_MILITARY_UNITS.find(
      (u) => u.id === assignment.unitId
    );
    if (!unit) continue;

    const rosterMatches = militaryRoster.filter(
      (m) => m.unit.toLowerCase() === unit.name.toLowerCase()
    );
    rosterSynergyCount += rosterMatches.length;

    const avgMerit =
      rosterMatches.length > 0
        ? rosterMatches.reduce((acc, m) => acc + m.meritScore, 0) /
          rosterMatches.length
        : 75;
    const highRankBonus = rosterMatches.some((m) => m.gradeIndex >= 14) ? 1 : 0;
    const medalSynergy = rosterMatches.some(
      (m) => (m.serviceRecordMedals?.length || 0) > 0
    )
      ? 1
      : 0;
    const rosterSynergyBonus =
      rosterMatches.length > 0 && avgMerit >= 80
        ? 1 + highRankBonus + medalSynergy * 0.5
        : highRankBonus;

    const isPreferredTheater = unit.preferredTheaters.includes(theaterId);
    const fitBonus = isPreferredTheater ? 1.5 : 0;
    const postureMod =
      POSTURE_MODIFIERS[assignment.posture] ||
      POSTURE_MODIFIERS['Deterrence Patrol'];

    const diplomacyContribution = Number(
      (
        unit.diplomacyBonusPct * postureMod.diplomacyMult +
        (isPreferredTheater ? 1 : 0) +
        rosterSynergyBonus * 0.6
      ).toFixed(1)
    );
    const securityContribution = Number(
      (
        unit.securityBonusPct * postureMod.securityMult +
        fitBonus +
        rosterSynergyBonus
      ).toFixed(1)
    );

    rawDiplomacy += diplomacyContribution;
    rawSecurity += securityContribution;
    totalStrength += unit.strengthRating;

    assignedUnits.push({
      assignment,
      unit,
      rosterMatches,
      isPreferredTheater,
      diplomacyContribution,
      securityContribution,
    });
  }

  const readinessOffset = military
    ? Math.round((military.forceReadiness - 80) * 0.2)
    : 0;

  const diplomacyOddsBonusPct = Math.min(20, Math.round(rawDiplomacy));
  const securityOddsBonusPct = Math.min(28, Math.round(rawSecurity));
  const operationSuccessProbabilityPct = Math.max(
    30,
    Math.min(95, 52 + securityOddsBonusPct + readinessOffset)
  );

  const deterrenceLabel =
    assignedUnits.length >= 3
      ? 'Dominant Forward Shield'
      : assignedUnits.length === 2
      ? 'Reinforced Deterrence'
      : assignedUnits.length === 1
      ? 'Tripwire Presence'
      : 'Unassigned / Garrison Only';

  return {
    theater,
    assignedUnits,
    unitCount: assignedUnits.length,
    totalStrength,
    rosterSynergyCount,
    diplomacyOddsBonusPct,
    securityOddsBonusPct,
    operationSuccessProbabilityPct,
    deterrenceLabel,
  };
}

export function getBranchShortLabel(branch: MilitaryServiceBranch): string {
  switch (branch) {
    case 'army':
      return 'Army';
    case 'marines':
      return 'Marines';
    case 'navy':
      return 'Navy';
    case 'coast_guard':
      return 'Coast Guard';
  }
}
