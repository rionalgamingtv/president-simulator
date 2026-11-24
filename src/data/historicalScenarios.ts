import {
  ScenarioDefinition,
} from '../types/game';
import { DEFAULT_CABINET } from './scenarios';

export const HISTORICAL_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'hist_1933_depression',
    title: '1933 · The Great Depression',
    subtitle: 'Bank runs, 24.9% unemployment, and the First Hundred Days',
    eraLabel: 'March 1933 · Banking & Relief Emergency',
    historicalEraTag: '1930s Economic Crisis',
    isHistorical: true,
    historicalYear: 1933,
    recommendedPresidentId: 'fdr',
    historicalBenchmarkNote:
      'Real-world 1933 benchmark: Proclamation of the national Bank Holiday, Emergency Banking Act, Glass-Steagall & FDIC deposit insurance, Civilian Conservation Corps (CCC), FERA relief, and abandoning strict gold convertibility to break deflation.',
    historicalKeyEvents: [
      'National Bank Holiday & Deposit Guarantees',
      '24.9% Unemployment & Industrial Relief',
      'Dust Bowl Farm Credit Collapse',
    ],
    description:
      'Over 4,000 banks have failed, industrial output has been cut in half, and 13 million Americans are out of work. Restoring financial confidence without shattering congressional unity is your immediate test.',
    imageUrl: '/src/assets/images/hist_1933_depression_1795458701547.jpg',
    initialMetrics: {
      approval: 58,
      congressSupport: 72,
      gdpGrowth: -1.2,
      inflation: -5.1,
      unemployment: 24.9,
      diplomaticStanding: 58,
      nationalDebtTrillions: 0.02,
      houseSeats: 313,
      senateSeats: 59,
    },
    initialBlocs: {
      workingClass: 66,
      suburbanModerates: 55,
      techFinance: 31,
      seniors: 52,
      youngVoters: 61,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 5,
      forceReadiness: 62,
      defenseBudgetBillions: 1,
      cyberPosture: 'Normal',
      intelThreatLevel: 'Guarded',
      intelSummary:
        'Domestic civil distress in farm belts and Bonus Army encampments outweighs overseas military alerts, though Manchuria and Weimar instability unsettle diplomatic cables.',
      jointChiefsChair: {
        name: 'Gen. Douglas MacArthur',
        branch: 'U.S. Army',
        doctrine: 'Hemispheric Defense & Domestic Order',
      },
      operations: [
        {
          id: 'op-1933-1',
          name: 'Asiatic Fleet Yangtze Patrol',
          region: 'East Asia',
          posture: 'Standby',
          personnelCount: '18,000',
          statusNote:
            'Protecting treaty-port shipping amid Japanese expansion in northern China.',
        },
        {
          id: 'op-1933-2',
          name: 'Panama Canal Garrison',
          region: 'Latin America',
          posture: 'Deterrence',
          personnelCount: '12,000',
          statusNote:
            'Routine lock security under tight interwar War Department appropriations.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 3.5,
      fedStance: 'Neutral',
      fedChairNote:
        'Federal Reserve discount windows face gold-hoarding pressure as state governors declare emergency banking moratoriums.',
      judiciaryClimate: 'Hostile',
      pendingCourtNote:
        'Conservative Supreme Court majority ("Four Horsemen") skeptical of broad federal commerce regulation.',
    },
    initialNews: [
      {
        id: 'n-1933-1',
        month: 1,
        outlet: 'New York Herald Tribune',
        category: 'economy',
        headline: 'Thirty-Eight States Lock Bank Doors Ahead of Inauguration',
        summary:
          'Depositor queues stretch down Wall Street and Main Street as gold outflows strain Reserve ratios.',
        tone: 'critical',
      },
      {
        id: 'n-1933-2',
        month: 1,
        outlet: 'Chicago Daily News',
        category: 'domestic',
        headline: 'National Jobless Rate Hits 24.9% Across Steel and Rail Hubs',
        summary:
          'Municipal relief chests in Detroit, Pittsburgh, and Cleveland report zero remaining cash.',
        tone: 'critical',
      },
      {
        id: 'n-1933-3',
        month: 1,
        outlet: 'Des Moines Register',
        category: 'politics',
        headline: 'Prairie Farm Foreclosure Auctions Blocked by Local Crowds',
        summary:
          'Agricultural governors urge immediate federal mortgage refinancing and parity relief.',
        tone: 'neutral',
      },
      {
        id: 'n-1933-4',
        month: 1,
        outlet: 'Washington Evening Star',
        category: 'foreign',
        headline: 'Geneva & London Economic Envoys Await U.S. Gold-Standard Signal',
        summary:
          'European ministries warn that currency devaluations could deepen global tariff walls.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'March 1933: The Banking Freeze & First Hundred Days',
      situationSummary:
        'With state bank holidays paralyzing payrolls and nearly one in four American workers unemployed, deflation has locked farms, factories, and credit into a downward spiral. The newly seated 73rd Congress awaits your emergency legislative program.',
      domesticIssue:
        'City mayors and prairie governors report municipal relief funds exhausted, risking widespread hunger and unrest before spring planting.',
      economicIssue:
        'Consumer prices fell 5.1% year-over-year while solvent and insolvent banks alike face ruinous cash runs without federal inspection and deposit backing.',
      foreignIssue:
        'Britain and France press for debt-war reparations talks in London even as nationalist regimes in Europe and East Asia rearm.',
      urgentDilemma:
        'Will you invoke the Trading with the Enemy Act for a national Bank Holiday paired with emergency deposit insurance and public works, or pursue orthodox budget austerity to reassure gold-standard bondholders?',
      suggestedDirectives: [
        {
          role: 'Treasury Secretary',
          title: 'Emergency Bank Holiday & Federal Deposit Backstop',
          policyDraft:
            'Proclaim an immediate four-day national Bank Holiday, dispatch Treasury examiners to reopen solvent institutions under federal liquidity lines, and send Congress an Emergency Banking and Deposit Insurance Act separating commercial and investment banking.',
          speechDraft:
            'It is safer to keep your money in a reopened bank than under the mattress—together we are restoring soundness to American credit from Main Street up.',
        },
        {
          role: 'Labor & Relief Advisor',
          title: 'Civilian Conservation Corps & Direct Work Relief',
          policyDraft:
            'Establish the Civilian Conservation Corps to enroll 250,000 unemployed young men in forestry and flood control while authorizing $500M in matching federal relief grants to hard-hit states.',
          speechDraft:
            'Our greatest primary task is to put people to work; this nation asks for action, and action now.',
        },
        {
          role: 'Fiscal Conservative Counsel',
          title: 'Economy Act Cuts & Balanced Regular Budget',
          policyDraft:
            'Enact a 15% federal payroll and departmental consolidation cut while backing the Reconstruction Finance Corporation with strict collateral standards to reassure Treasury bond desks.',
          speechDraft:
            'Disciplined public credit is the bedrock upon which private enterprise can safely rehire millions of workers.',
        },
      ],
    },
  },
  {
    id: 'hist_1941_arsenal',
    title: '1941 · Arsenal of Democracy',
    subtitle: 'Lend-Lease convoys, war mobilization, and two-ocean peril',
    eraLabel: '1941 · Pre-War Industrial Mobilization',
    historicalEraTag: '1940s Global Mobilization',
    isHistorical: true,
    historicalYear: 1941,
    recommendedPresidentId: 'fdr',
    historicalBenchmarkNote:
      'Real-world 1941 benchmark: Passage of Lend-Lease (H.R. 1776), Atlantic Charter summit, freezing Japanese assets & oil embargo, converting Detroit auto lines into aircraft/tank production, and two-ocean naval readiness.',
    historicalKeyEvents: [
      'Lend-Lease Aid Across North Atlantic',
      'Detroit & Shipyard Defense Conversion',
      'Pacific Oil Embargo & Two-Ocean Deterrence',
    ],
    description:
      'Britain stands nearly alone in Europe while U-boats prowl the Atlantic and Tokyo eyes Southeast Asian oil fields. Mobilizing heavy industry while overcoming isolationist resistance demands razor-sharp statecraft.',
    imageUrl: '/src/assets/images/hist_1941_arsenal_1795458702034.jpg',
    initialMetrics: {
      approval: 64,
      congressSupport: 61,
      gdpGrowth: 17.7,
      inflation: 5.0,
      unemployment: 9.9,
      diplomaticStanding: 72,
      nationalDebtTrillions: 0.05,
      houseSeats: 267,
      senateSeats: 66,
    },
    initialBlocs: {
      workingClass: 68,
      suburbanModerates: 61,
      techFinance: 52,
      seniors: 58,
      youngVoters: 63,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 2,
      forceReadiness: 74,
      defenseBudgetBillions: 14,
      cyberPosture: 'Elevated',
      intelThreatLevel: 'High',
      intelSummary:
        'Kriegsmarine wolfpacks threaten North Atlantic supply lanes while decoded Magic cables warn of impending Japanese moves in Indochina and the Pacific.',
      jointChiefsChair: {
        name: 'Gen. George C. Marshall',
        branch: 'U.S. Army',
        doctrine: 'Two-Ocean Mobilization & Allied Logistics',
      },
      operations: [
        {
          id: 'op-1941-1',
          name: 'North Atlantic Neutrality Patrol',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '95,000',
          statusNote:
            'Escorting supply convoys toward Iceland amid U-boat contacts.',
        },
        {
          id: 'op-1941-2',
          name: 'Pacific Fleet Forward Basing',
          region: 'Indo-Pacific',
          posture: 'Deterrence',
          personnelCount: '130,000',
          statusNote:
            'Fleet anchored at Pearl Harbor on heightened air-patrol alert.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 1.0,
      fedStance: 'Accommodative',
      fedChairNote:
        'Federal Reserve pegs low Treasury borrowing yields to finance emergency shipyard and aircraft plant expansions.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Reconstituted Court upholds broad federal wage-hour and defense mobilization authorities.',
    },
    initialNews: [
      {
        id: 'n-1941-1',
        month: 1,
        outlet: 'Associated Press Wire',
        category: 'foreign',
        headline: 'London Pleads for Destroyers and Merchant Hulls Amid Blitz',
        summary:
          'Whitehall warns dollar reserves are exhausted as German U-boats sink 300,000 tons monthly.',
        tone: 'critical',
      },
      {
        id: 'n-1941-2',
        month: 1,
        outlet: 'Detroit Free Press',
        category: 'economy',
        headline: 'Willow Run & River Rouge Re-Tooling Sparks Boom—and Bottlenecks',
        summary:
          'Aluminum and machine-tool shortages clash with civilian automobile output schedules.',
        tone: 'neutral',
      },
      {
        id: 'n-1941-3',
        month: 1,
        outlet: 'Washington Post',
        category: 'politics',
        headline: 'Isolationist Senators Vow Filibuster Over Lend-Lease Powers',
        summary:
          'Midwestern lawmakers warn convoy escorts risk pulling America into a European war.',
        tone: 'critical',
      },
      {
        id: 'n-1941-4',
        month: 1,
        outlet: 'Honolulu Star-Bulletin',
        category: 'defense',
        headline: 'Pacific Fleet Drills Intensify as Tokyo Moves Into Indochina',
        summary:
          'Navy planners debate fuel-oil sanctions against Japan versus diplomatic backchannels.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '1941: Arsenal of Democracy & Two-Ocean Alert',
      situationSummary:
        'Defense orders have ignited a 17.7% industrial boom, yet Britain is weeks away from running out of hard currency for munitions and Japan is massing forces near French Indochina. Congress remains fiercely split between interventionists and non-interventionists.',
      domesticIssue:
        'Steel, rubber, and aluminum bottlenecks require deciding whether to mandate civilian factory conversion under the Office of Production Management.',
      economicIssue:
        'Rapid mobilization has pushed inflation to 5.0%, prompting Treasury and price-control aides to seek selective anti-profiteering ceilings.',
      foreignIssue:
        'Downing Street requests immediate Lend-Lease credit and Atlantic escort protection up to Iceland while Tokyo demands lifting scrap-iron restrictions.',
      urgentDilemma:
        'Do you push through full Lend-Lease aid and Atlantic naval escorts alongside mandatory war-production tooling, or pace rearmament to preserve isolationist support on Capitol Hill?',
      suggestedDirectives: [
        {
          role: 'Secretary of War',
          title: 'Enact Lend-Lease & Convert Heavy Industry',
          policyDraft:
            'Sign the Lend-Lease supply authorization for Britain and allied democracies, extend U.S. Navy Atlantic patrols to Greenland/Iceland, and direct the Office of Production Management to prioritize military aircraft and Liberty ship steel.',
          speechDraft:
            'We must be the great arsenal of democracy; sending planes and ships now keeps the flames of war far from our own shores.',
        },
        {
          role: 'Secretary of State',
          title: 'Pacific Oil Embargo & Asset Freeze',
          policyDraft:
            'Freeze Japanese dollar assets in U.S. banks, embargo aviation fuel and crude oil exports pending withdrawal from Indochina, and reinforce Philippine and Hawaiian radar and fighter wings.',
          speechDraft:
            'American resources will not fuel aggression across the Pacific while free nations defend their sovereignty.',
        },
        {
          role: 'Economic Stabilization Chief',
          title: 'Price Control Board & Voluntary Defense Bonds',
          policyDraft:
            'Create an Office of Price Administration to curb defense inflation at 5%, launch nationwide Defense Savings Bonds, and mediate union-management no-strike pledges in defense plants.',
          speechDraft:
            'Every family on the home front shares in building an economy strong enough to outproduce any tyranny.',
        },
      ],
    },
  },
  {
    id: 'hist_1947_cold_war',
    title: '1947 · Dawn of the Cold War',
    subtitle: 'Marshall Plan, containment doctrine, and 14.4% postwar inflation',
    eraLabel: '1947 · Containment & Divided Congress',
    historicalEraTag: '1940s Cold War Origins',
    isHistorical: true,
    historicalYear: 1947,
    recommendedPresidentId: 'truman',
    historicalBenchmarkNote:
      'Real-world 1947 benchmark: Truman Doctrine aid to Greece & Turkey, Marshall Plan European Recovery Program, National Security Act creating CIA/DoD, and navigating the 80th Republican Congress over Taft-Hartley & inflation.',
    historicalKeyEvents: [
      'Truman Doctrine & European Aid',
      '14.4% Postwar Price-Control Inflation',
      '80th Congress & Taft-Hartley Labor Clash',
    ],
    description:
      'Britain can no longer fund Greece and Turkey, Western Europe faces winter famine, and Moscow consolidates Eastern Europe—just as a hostile 80th Congress demands tax cuts and labor curbs amid 14.4% domestic inflation.',
    imageUrl: '/src/assets/images/hist_1947_cold_war_dawn_1795458703709.jpg',
    initialMetrics: {
      approval: 49,
      congressSupport: 41,
      gdpGrowth: -0.9,
      inflation: 14.4,
      unemployment: 3.9,
      diplomaticStanding: 76,
      nationalDebtTrillions: 0.26,
      houseSeats: 188,
      senateSeats: 45,
    },
    initialBlocs: {
      workingClass: 55,
      suburbanModerates: 46,
      techFinance: 41,
      seniors: 48,
      youngVoters: 51,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 76,
      defenseBudgetBillions: 13,
      cyberPosture: 'Elevated',
      intelThreatLevel: 'High',
      intelSummary:
        'Rapid postwar demobilization has thinned U.S. European divisions even as Soviet pressure mounts on Berlin, Greece, and the Dardanelles.',
      jointChiefsChair: {
        name: 'Gen. Omar Bradley',
        branch: 'U.S. Army',
        doctrine: 'Containment Deterrence & Joint Command',
      },
      operations: [
        {
          id: 'op-1947-1',
          name: 'U.S. Constabulary Germany & Berlin',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '115,000',
          statusNote:
            'Guarding Allied occupation zones and rail corridors into Berlin.',
        },
        {
          id: 'op-1947-2',
          name: 'Sixth Task Fleet Mediterranean',
          region: 'Middle East & Levant',
          posture: 'Deterrence',
          personnelCount: '24,000',
          statusNote:
            'Showing the flag near Athens and Istanbul to deter Soviet pressure.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 1.25,
      fedStance: 'Neutral',
      fedChairNote:
        'Treasury-Fed bond yield peg restricts rapid rate hikes even as lifting wartime price controls sends CPI to 14.4%.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Court largely defers to executive foreign affairs while scrutinizing domestic labor injunctions.',
    },
    initialNews: [
      {
        id: 'n-1947-1',
        month: 1,
        outlet: 'New York Times',
        category: 'foreign',
        headline: 'London Notifies Washington It Must Halt Aid to Greece and Turkey',
        summary:
          'Whitehall cites severe sterling exhaustion, leaving an immediate security vacuum in the Aegean.',
        tone: 'critical',
      },
      {
        id: 'n-1947-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Meat and Housing Costs Propel Postwar Inflation Past 14%',
        summary:
          'Millions of demobilized veterans face acute apartment shortages and soaring grocery bills.',
        tone: 'critical',
      },
      {
        id: 'n-1947-3',
        month: 1,
        outlet: 'Washington Star',
        category: 'politics',
        headline: 'Republican-Led 80th Congress Readies Taft-Hartley Labor Bill',
        summary:
          'Speaker Martin and Senator Taft press for union curbs and deep income-tax reductions.',
        tone: 'neutral',
      },
      {
        id: 'n-1947-4',
        month: 1,
        outlet: 'Paris Diplomatic Wire',
        category: 'foreign',
        headline: 'Coal Shortages and Bread Rations Fuel Communist Gains in Europe',
        summary:
          'Allied ministers warn Western European democracies could collapse without massive dollar credits.',
        tone: 'critical',
      },
    ],
    initialBriefing: {
      title: '1947: Marshall Plan & The Containment Crossroads',
      situationSummary:
        'With Britain pulling back from Greece and Western Europe facing economic ruin, State Department planners urge a historic multi-billion-dollar reconstruction pledge. At home, a Republican-majority 80th Congress clashes with the White House over inflation, tax cuts, and union power.',
      domesticIssue:
        'The Taft-Hartley labor restriction bill is headed toward your desk, threatening a decisive break with either congressional moderates or organized labor.',
      economicIssue:
        'Ending wartime rationing triggered a 14.4% consumer price spike while peacetime factory retooling briefly dipped GDP by 0.9%.',
      foreignIssue:
        'Urgent $400M military-economic aid for Greece and Turkey—and a broader European Recovery Program—require winning over bipartisan isolationist leaders like Senator Vandenberg.',
      urgentDilemma:
        'Will you stake your presidency on a bold European Marshall Plan and National Security reorganization while fighting domestic price spikes, or prioritize domestic tax-and-budget cuts at home?',
      suggestedDirectives: [
        {
          role: 'Secretary of State',
          title: 'Truman Doctrine & European Marshall Plan',
          policyDraft:
            'Address Congress jointly to authorize $400M in emergency aid to Greece and Turkey alongside a multi-year European Recovery Program conditioned on cross-European economic integration.',
          speechDraft:
            'It must be the policy of the United States to support free peoples who are resisting attempted subjugation by armed minorities or outside pressures.',
        },
        {
          role: 'Defense & Intelligence Advisor',
          title: 'National Security Act & Air-Naval Deterrence',
          policyDraft:
            'Unify the War and Navy Departments into a single Defense establishment, charter the Central Intelligence Agency and National Security Council, and reinforce Mediterranean naval patrols.',
          speechDraft:
            'Modern peace requires unified intelligence, strategic airpower, and clear resolve before crises turn into war.',
        },
        {
          role: 'Labor & Domestic Counsel',
          title: 'Veto Taft-Hartley & Launch Housing-Price Compact',
          policyDraft:
            'Veto punitive union restrictions to rally working-class voters while urging voluntary grain conservation, veterans housing credit, and selective Treasury debt retirement to cool 14% inflation.',
          speechDraft:
            'We did not win the peace abroad to roll back collective bargaining and price stability for American families at home.',
        },
      ],
    },
  },
  {
    id: 'hist_1962_cold_war',
    title: '1962 · The Cuban Missile Brink',
    subtitle: 'ExComm nuclear standoff, Berlin tension, and Apollo Moonshot',
    eraLabel: 'October 1962 · 1960s Cold War Crisis',
    historicalEraTag: '1960s Cold War Brink',
    isHistorical: true,
    historicalYear: 1962,
    recommendedPresidentId: 'jfk',
    historicalBenchmarkNote:
      'Real-world 1962 benchmark: Naval quarantine of Cuba rather than immediate airstrikes, ExComm secret backchannel resolving Jupiter missiles in Turkey in exchange for Soviet MRBM withdrawal, hotlines & Partial Test Ban diplomacy, alongside Apollo acceleration.',
    historicalKeyEvents: [
      'U-2 Discovery of Soviet MRBMs in Cuba',
      'Naval Quarantine vs. Airstrike Dilemma',
      'Apollo Moonshot & Civil Rights Pressure',
    ],
    description:
      'High-altitude U-2 imagery confirms Soviet medium-range nuclear missiles under assembly 90 miles from Florida. With DEFCON raised and military brass split between invasion and blockade, one miscalculation risks global nuclear exchange.',
    imageUrl: '/src/assets/images/hist_1962_missile_brink_1795458704050.jpg',
    initialMetrics: {
      approval: 66,
      congressSupport: 54,
      gdpGrowth: 6.1,
      inflation: 1.2,
      unemployment: 5.5,
      diplomaticStanding: 68,
      nationalDebtTrillions: 0.3,
      houseSeats: 262,
      senateSeats: 64,
    },
    initialBlocs: {
      workingClass: 62,
      suburbanModerates: 64,
      techFinance: 58,
      seniors: 56,
      youngVoters: 71,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 2,
      forceReadiness: 91,
      defenseBudgetBillions: 52,
      cyberPosture: 'Active Shield',
      intelThreatLevel: 'Severe',
      intelSummary:
        'Photoreconnaissance confirms 24+ R-12 missile launch pads in Cuba while Soviet freighters approach Caribbean exclusion lines and Berlin brigades go on alert.',
      jointChiefsChair: {
        name: 'Gen. Maxwell D. Taylor',
        branch: 'U.S. Army',
        doctrine: 'Flexible Response & ExComm Calibration',
      },
      operations: [
        {
          id: 'op-1962-1',
          name: 'Caribbean Naval Quarantine Fleet',
          region: 'Latin America',
          posture: 'Deterrence',
          personnelCount: '180,000',
          statusNote:
            'Carrier strike groups and destroyers enforcing 500-mile maritime perimeter around Cuba.',
        },
        {
          id: 'op-1962-2',
          name: 'USAFE & Berlin Brigade Alert',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '240,000',
          statusNote:
            'NATO armor and SAC airborne bombers staged against retaliatory pressure in West Berlin.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 2.75,
      fedStance: 'Neutral',
      fedChairNote:
        'Treasury and Fed hold stable 2.75% credit conditions supporting 6.1% expansion and industrial investment.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Warren Court advancing landmark civil rights and reapportionment protections amid Southern resistance.',
    },
    initialNews: [
      {
        id: 'n-1962-1',
        month: 1,
        outlet: 'CBS Evening Wire',
        category: 'defense',
        headline: 'White House Halts Campaign Travel Amid Urgent Cabinet Sessions',
        summary:
          'Pentagon sources report heavy troop movements toward Florida bases as OAS ambassadors convene.',
        tone: 'critical',
      },
      {
        id: 'n-1962-2',
        month: 1,
        outlet: 'New York Times',
        category: 'foreign',
        headline: 'U.S. Presents Photographic Evidence of Offensive Missiles in Cuba',
        summary:
          'Ambassador Stevenson challenges Moscow at the UN Security Council over clandestine deployment.',
        tone: 'critical',
      },
      {
        id: 'n-1962-3',
        month: 1,
        outlet: 'Houston Chronicle',
        category: 'domestic',
        headline: 'NASA Expands Cape Canaveral Launch Complex for Apollo Lunar Effort',
        summary:
          'Aerospace contractors race to close Soviet orbital heavy-lift lead before decade end.',
        tone: 'positive',
      },
      {
        id: 'n-1962-4',
        month: 1,
        outlet: 'Atlanta Constitution',
        category: 'politics',
        headline: 'Southern Caucus Warns Against Civil Rights Enforcement & Tax Cuts',
        summary:
          'Federal marshals in Mississippi sharpen congressional friction over domestic legislative priorities.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'October 1962: ExComm & The Thirteen Days Brink',
      situationSummary:
        'Soviet ballistic missile sites in Cuba are days from operational status while two dozen Soviet vessels steam toward the Caribbean. Joint Chiefs hawks press for immediate surprise airstrikes and invasion; diplomatic advisors urge a calibrated blockade and backchannel swap.',
      domesticIssue:
        'Midterm voters are watching closely as civil rights enforcement in the South splits your congressional caucus.',
      economicIssue:
        'Growth is humming at 6.1% with 1.2% inflation, creating an opening for a growth-oriented income tax cut once the security crisis stabilizes.',
      foreignIssue:
        'Khrushchev warns any boarding of Soviet ships equals piracy, and NATO allies fear Moscow will retaliate against West Berlin.',
      urgentDilemma:
        'Will you impose a strict naval quarantine backed by private backchannel diplomacy (including aging Turkish missile concessions), or order immediate surgical airstrikes on the Cuban launch pads?',
      suggestedDirectives: [
        {
          role: 'ExComm Crisis Group',
          title: 'Naval Quarantine & Secret Jupiter Backchannel',
          policyDraft:
            'Establish a UN/OAS-backed naval quarantine blocking offensive weapons into Cuba, raise SAC readiness to deter Berlin retaliation, and open a secret Kremlin backchannel pledging non-invasion and quiet withdrawal of obsolete Turkish Jupiter missiles once Cuban sites are dismantled.',
          speechDraft:
            'It shall be the policy of this Nation to regard any nuclear missile launched from Cuba against any nation in the Western Hemisphere as an attack by the Soviet Union.',
        },
        {
          role: 'Joint Chiefs Hardline Option',
          title: 'Preemptive Airstrikes & Amphibious Readiness',
          policyDraft:
            'Authorize low-level tactical air sorties to destroy operational Cuban MRBM pads before fueling completes, placing airborne divisions in Georgia on immediate deployment orders.',
          speechDraft:
            'We will not permit secret nuclear batteries to become operational ninety miles from American shores.',
        },
        {
          role: 'Space & Economic Council',
          title: 'Apollo Surge & New Frontier Tax Reform',
          policyDraft:
            'Accelerate Saturn V heavy-lift funding at Cape Canaveral while transmitting an across-the-board corporate and personal tax-rate reduction bill to sustain 6% expansion and lower unemployment below 5%.',
          speechDraft:
            'We choose to go to the Moon and build an economy second to none—not because it is easy, but because it is hard.',
        },
      ],
    },
  },
  {
    id: 'hist_1965_great_society',
    title: '1965 · Great Society & Escalation',
    subtitle: 'Voting Rights & Medicare triumph vs. Vietnam commitment trap',
    eraLabel: '1965 · Domestic Transformation & War',
    historicalEraTag: '1960s Social & War Crossroads',
    isHistorical: true,
    historicalYear: 1965,
    recommendedPresidentId: 'lbj',
    historicalBenchmarkNote:
      'Real-world 1965 benchmark: Enacting the Voting Rights Act of 1965, Medicare & Medicaid, and Elementary/Secondary Education Act with the 89th Congress—versus the fateful decision to commit ground combat divisions in Vietnam without raising war taxes.',
    historicalKeyEvents: [
      'Voting Rights Act After Selma',
      'Medicare & Great Society Floor Blitz',
      'Vietnam Ground Troop Escalation Decision',
    ],
    description:
      'Commanding huge 89th Congress majorities, you stand on the threshold of passing Voting Rights and Medicare—yet Pentagon cables demand 100,000+ ground troops in Southeast Asia that could devour your domestic budget and fracture the nation.',
    imageUrl: '/src/assets/images/hist_1965_great_society_1795458704904.jpg',
    initialMetrics: {
      approval: 65,
      congressSupport: 69,
      gdpGrowth: 6.5,
      inflation: 1.6,
      unemployment: 4.5,
      diplomaticStanding: 61,
      nationalDebtTrillions: 0.32,
      houseSeats: 295,
      senateSeats: 68,
    },
    initialBlocs: {
      workingClass: 67,
      suburbanModerates: 62,
      techFinance: 55,
      seniors: 66,
      youngVoters: 64,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 86,
      defenseBudgetBillions: 51,
      cyberPosture: 'Elevated',
      intelThreatLevel: 'High',
      intelSummary:
        'Saigon instability threatens collapse without major U.S. combat units, while intelligence warns North Vietnamese regular regiments are moving south.',
      jointChiefsChair: {
        name: 'Gen. Earle Wheeler',
        branch: 'U.S. Army',
        doctrine: 'Graduated Pressure & Expeditionary Commitment',
      },
      operations: [
        {
          id: 'op-1965-1',
          name: 'MACV Southeast Asia Advisory',
          region: 'Indo-Pacific',
          posture: 'Active Strike',
          personnelCount: '54,000',
          statusNote:
            'Rolling Thunder air sorties underway; Marine landings at Da Nang awaiting ground expansion orders.',
        },
        {
          id: 'op-1965-2',
          name: 'USAREUR & Seventh Army',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '250,000',
          statusNote:
            'Maintaining NATO conventional deterrence along the Fulda Gap.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 4.0,
      fedStance: 'Neutral',
      fedChairNote:
        'Fed Chair Martin warns "Guns and Butter" deficit spending without a tax surcharge risks igniting multi-year inflation.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Supreme Court strongly receptive to Voting Rights and constitutional civil rights enforcement.',
    },
    initialNews: [
      {
        id: 'n-1965-1',
        month: 1,
        outlet: 'New York Times',
        category: 'domestic',
        headline: 'Selma Marchers Reach Montgomery as White House Drafts Voting Bill',
        summary:
          'Bipartisan Senate whip counts accelerate toward abolishing literacy tests and deploying federal registrars.',
        tone: 'positive',
      },
      {
        id: 'n-1965-2',
        month: 1,
        outlet: 'Life Magazine Wire',
        category: 'politics',
        headline: 'House Ways & Means Clears Medicare Hospital Insurance Package',
        summary:
          'Senior advocates hail landmark health security while fiscal hawks demand payroll-tax offsets.',
        tone: 'positive',
      },
      {
        id: 'n-1965-3',
        month: 1,
        outlet: 'Saigon Bureau Dispatch',
        category: 'defense',
        headline: 'Pentagon Seeks 100,000 Additional Ground Troops in Vietnam',
        summary:
          'Senior advisors clash quietly over open-ended escalation versus negotiated diplomatic exit.',
        tone: 'critical',
      },
      {
        id: 'n-1965-4',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Fed Chair Warns Overheating If War Spending Joins Great Society',
        summary:
          'Tight 4.5% unemployment leaves little slack for simultaneous domestic and military surges.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '1965: Great Society Mandate vs. Vietnam Crossroads',
      situationSummary:
        'Your landslide 89th Congress gives you a once-in-a-generation window to pass the Voting Rights Act, Medicare, and federal education aid. At the exact same moment, military commanders request sweeping combat troop deployments to South Vietnam.',
      domesticIssue:
        'Civil rights leaders demand immediate passage of federal voting-registrar legislation with ironclad enforcement across recalcitrant states.',
      economicIssue:
        'With unemployment at 4.5%, funding both Great Society programs and war escalation without a tax increase risks sparking a decade-long inflation spiral.',
      foreignIssue:
        'MACV warns Saigon could fall within months absent major U.S. infantry divisions, while Under Secretary George Ball warns against an unwinnable land war.',
      urgentDilemma:
        'Can you enact the historic Great Society agenda while either negotiating an early diplomatic cap in Southeast Asia or financing war outlays honestly via tax offsets?',
      suggestedDirectives: [
        {
          role: 'Domestic Legislative Whip',
          title: 'Pass Voting Rights Act & Medicare Package',
          policyDraft:
            'Address a joint session of Congress demanding immediate passage of the Voting Rights Act of 1965 and the Social Security Amendments establishing Medicare and Medicaid with full payroll financing.',
          speechDraft:
            'Every American citizen must have an equal right to vote—and no senior should face old age stripped of dignity by medical ruin.',
        },
        {
          role: 'State & Diplomatic Dissent',
          title: 'Cap Troop Levels & Launch Geneva Peace Track',
          policyDraft:
            'Hold U.S. deployments strictly to coastal enclave defense, reject open-ended search-and-destroy escalation, and empower allied neutral intermediaries to press Hanoi and Saigon toward a coalition settlement.',
          speechDraft:
            'Strength means knowing what we can achieve with diplomacy before committing a generation of young Americans to endless jungle warfare.',
        },
        {
          role: 'Pentagon & Budget Command',
          title: 'Authorize Combat Surge Paired With War Tax Surcharge',
          policyDraft:
            'Approve 100,000 combat reinforcements for South Vietnam while honestly requesting a temporary 5% corporate and upper-income surtax to prevent inflation from eroding Great Society gains.',
          speechDraft:
            'If we ask our forces to hold the line abroad, Congress must fund that commitment openly without mortgaging stability at home.',
        },
      ],
    },
  },
  {
    id: 'hist_1973_watergate',
    title: '1973 · Watergate & Oil Embargo',
    subtitle: 'Oval Office tapes subpoena, Saturday Night Massacre, and 1973 OPEC shock',
    eraLabel: '1973 · Constitutional & Energy Crisis',
    historicalEraTag: '1970s Constitutional Crisis',
    isHistorical: true,
    historicalYear: 1973,
    recommendedPresidentId: 'nixon',
    historicalBenchmarkNote:
      'Real-world 1973 benchmark: Senate Watergate Committee televised hearings, Special Prosecutor Archibald Cox subpoena of Oval Office tapes, Saturday Night Massacre backlash, War Powers Resolution, and the October OPEC oil embargo.',
    historicalKeyEvents: [
      'Watergate Tapes & Special Prosecutor Subpoena',
      '1973 OPEC Oil Embargo & 55 MPH Rationing',
      'Senate Ervin Hearings & Executive Privilege',
    ],
    description:
      'Revelations of a secret Oval Office taping system collide with Special Prosecutor subpoenas, televised Senate hearings, and an Arab oil embargo doubling gasoline prices overnight.',
    imageUrl: '/src/assets/images/hist_1973_watergate_1795465833615.jpg',
    initialMetrics: {
      approval: 39,
      congressSupport: 41,
      gdpGrowth: 5.6,
      inflation: 6.2,
      unemployment: 4.9,
      diplomaticStanding: 64,
      nationalDebtTrillions: 0.47,
      houseSeats: 192,
      senateSeats: 42,
    },
    initialBlocs: {
      workingClass: 42,
      suburbanModerates: 35,
      techFinance: 48,
      seniors: 44,
      youngVoters: 28,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 79,
      defenseBudgetBillions: 77,
      cyberPosture: 'Normal',
      intelThreatLevel: 'High',
      intelSummary:
        'Yom Kippur War airlift triggers Soviet airborne alert in the Eastern Mediterranean alongside domestic Justice Department turmoil.',
      jointChiefsChair: {
        name: 'Adm. Thomas H. Moorer',
        branch: 'U.S. Navy',
        doctrine: 'Strategic Deterrence & Rapid Airlift',
      },
      operations: [
        {
          id: 'op-1973-1',
          name: 'Operation Nickel Grass Airlift',
          region: 'Middle East & Levant',
          posture: 'Deterrence',
          personnelCount: '38,000',
          statusNote:
            'Resupplying regional allies while Sixth Fleet tracks Soviet naval deployments.',
        },
        {
          id: 'op-1973-2',
          name: 'USAREUR Détente Readiness',
          region: 'Europe & North Atlantic',
          posture: 'Standby',
          personnelCount: '220,000',
          statusNote:
            'Maintaining NATO posture under post-Vietnam volunteer transition.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 8.75,
      fedStance: 'Hawkish',
      fedChairNote:
        'Fed Chair Arthur Burns faces surging oil-shock inflation while wage-price controls unravel.',
      judiciaryClimate: 'Hostile',
      pendingCourtNote:
        'Federal Judge Sirica and appellate courts demand immediate compliance with grand jury tape subpoenas.',
    },
    initialNews: [
      {
        id: 'n-1973-1',
        month: 1,
        outlet: 'Washington Post',
        category: 'politics',
        headline: 'Special Prosecutor Demands Nine Oval Office Tapes Amid Senate Probe',
        summary:
          'Attorney General Richardson warns a firing order over executive privilege would trigger Justice resignations.',
        tone: 'critical',
      },
      {
        id: 'n-1973-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'OPEC Embargo Halts Crude Shipments, Sparking Service-Station Queues',
        summary:
          'Heating oil and industrial fuel costs surge as Phase IV price freezes strain refineries.',
        tone: 'critical',
      },
      {
        id: 'n-1973-3',
        month: 1,
        outlet: 'CBS Evening Wire',
        category: 'domestic',
        headline: 'Televised Ervin Committee Testimony Grips Morning & Evening Viewers',
        summary:
          'Key lawmakers in both parties warn stonewalling could ignite formal House Judiciary impeachment inquiries.',
        tone: 'critical',
      },
      {
        id: 'n-1973-4',
        month: 1,
        outlet: 'New York Times',
        category: 'foreign',
        headline: 'Shuttle Diplomacy Begins to Untangle Sinai Ceasefire and Oil Boycott',
        summary:
          'European NATO allies break with Washington over overflight rights amid domestic energy shortages.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '1973: The Watergate Tapes & OPEC Energy Crisis',
      situationSummary:
        'Special Prosecutor Archibald Cox refuses to accept edited summaries of White House recordings, demanding the original Oval Office tapes. Simultaneously, an Arab oil embargo has sent crude prices soaring and split NATO allies.',
      domesticIssue:
        'House Judiciary Committee members warn that firing the Special Prosecutor will trigger an immediate constitutional crisis and impeachment resolution.',
      economicIssue:
        'OPEC supply cuts threaten to push inflation past 8% while slowing industrial output into stagflation.',
      foreignIssue:
        'Superpower nuclear alerts during Middle East ceasefire talks demand delicate shuttle diplomacy to lift the oil boycott.',
      urgentDilemma:
        'Will you surrender the contested Oval Office tapes and pledge full cooperation to restore institutional trust, or assert absolute executive privilege and dismiss the Special Prosecutor?',
      suggestedDirectives: [
        {
          role: 'White House Counsel',
          title: 'Release Unedited Tapes & Protect Independent Counsel',
          policyDraft:
            'Comply fully with the federal court subpoena by turning over unedited White House recordings to Judge Sirica, guarantee the Special Prosecutor complete investigative independence, and address the nation pledging full institutional transparency.',
          speechDraft:
            'No president stands above the courts or the Constitution; the truth belongs to the American people.',
        },
        {
          role: 'Executive Privilege Hardliners',
          title: 'Fire Special Prosecutor & Assert Confidentiality',
          policyDraft:
            'Invoke strict executive privilege over all Oval Office tapes, order the Justice Department to dismiss Special Prosecutor Cox immediately, and direct White House aides to contest congressional subpoenas in appellate court.',
          speechDraft:
            'Confidential national-security deliberations in the Oval Office cannot be dismantled without crippling every future presidency.',
        },
        {
          role: 'Energy & Diplomacy Council',
          title: 'Project Independence & Shuttle Ceasefire Push',
          policyDraft:
            'Establish a Federal Energy Office with nationwide 55 MPH speed limits and refinery allocation rules while dispatching shuttle envoys to secure a Sinai disengagement lifting the OPEC oil embargo.',
          speechDraft:
            'By conserving fuel at home and brokering steady peace abroad, we will end foreign energy blackmail.',
        },
      ],
    },
  },
  {
    id: 'hist_1979_stagflation',
    title: '1979 · Oil Shock & Volcker Crisis',
    subtitle: '11.3% inflation, gas lines, and the Tehran hostage standoff',
    eraLabel: '1979 · Late-1970s Stagflation Crucible',
    historicalEraTag: '1970s Stagflation & Crisis',
    isHistorical: true,
    historicalYear: 1979,
    recommendedPresidentId: 'carter',
    historicalBenchmarkNote:
      'Real-world 1979 benchmark: Appointing Paul Volcker to crush double-digit CPI via tight money, deregulating domestic energy/airlines/trucking, navigating the Iran hostage crisis without catastrophic escalation, and Camp David diplomacy.',
    historicalKeyEvents: [
      'Second OPEC Oil Shock & Gas Lines',
      '11.3% Inflation & Volcker Rate Shock',
      'Tehran Embassy Crisis & SALT II Fight',
    ],
    description:
      'The Iranian Revolution has triggered a second global oil shock, pushing inflation past 11%, sparking endless gas lines, and sinking approval to 33%. Tough monetary medicine and high-stakes diplomacy will define your survival.',
    imageUrl: '/src/assets/images/hist_1979_stagflation_1795458704643.jpg',
    initialMetrics: {
      approval: 33,
      congressSupport: 46,
      gdpGrowth: 3.2,
      inflation: 11.3,
      unemployment: 5.8,
      diplomaticStanding: 48,
      nationalDebtTrillions: 0.83,
      houseSeats: 277,
      senateSeats: 58,
    },
    initialBlocs: {
      workingClass: 36,
      suburbanModerates: 31,
      techFinance: 29,
      seniors: 38,
      youngVoters: 41,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 73,
      defenseBudgetBillions: 116,
      cyberPosture: 'Normal',
      intelThreatLevel: 'Severe',
      intelSummary:
        'Revolutionary upheaval in Iran destabilizes Persian Gulf crude lanes while Soviet buildup along Afghan borders threatens Southwest Asia.',
      jointChiefsChair: {
        name: 'Gen. David C. Jones',
        branch: 'U.S. Air Force',
        doctrine: 'Rapid Deployment & Strategic Triad Parity',
      },
      operations: [
        {
          id: 'op-1979-1',
          name: 'Indian Ocean Carrier Task Force',
          region: 'Middle East & Levant',
          posture: 'Deterrence',
          personnelCount: '28,000',
          statusNote:
            'Standing watch in the Arabian Sea protecting Strait of Hormuz tanker lanes.',
        },
        {
          id: 'op-1979-2',
          name: 'NATO Pershing Readiness Watch',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '295,000',
          statusNote:
            'Countering Soviet SS-20 intermediate missile deployments across Eastern Europe.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 11.2,
      fedStance: 'Hawkish',
      fedChairNote:
        'Incoming Fed leadership prepares historic monetary tightening above 13% to break entrenched double-digit inflation expectations.',
      judiciaryClimate: 'Split',
      pendingCourtNote:
        'Courts weigh executive emergency energy pricing powers and foreign asset freezes.',
    },
    initialNews: [
      {
        id: 'n-1979-1',
        month: 1,
        outlet: 'Washington Post',
        category: 'economy',
        headline: 'Odd-Even Gasoline Rationing Hits Coastlines as CPI Reaches 11.3%',
        summary:
          'Crude prices double following Iranian export halts, squeezing commuters and trucking fleets.',
        tone: 'critical',
      },
      {
        id: 'n-1979-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Dollar Slides in Zurich as Bond Desks Demand Aggressive Fed Resolve',
        summary:
          'Gold surges past $400/oz amid fears Washington lacks will to curb deficit and wage spirals.',
        tone: 'critical',
      },
      {
        id: 'n-1979-3',
        month: 1,
        outlet: 'CBS Evening Wire',
        category: 'foreign',
        headline: 'Tehran Unrest and SALT II Treaty Split Senate Foreign Relations',
        summary:
          'Defense hawks question Soviet compliance while allies fret over Persian Gulf stability.',
        tone: 'critical',
      },
      {
        id: 'n-1979-4',
        month: 1,
        outlet: 'Detroit News',
        category: 'domestic',
        headline: 'Auto Sales Plunge as Consumers Pivot Toward Fuel-Efficient Imports',
        summary:
          'Industrial union leaders warn major Midwest assembly plants face imminent layoffs.',
        tone: 'critical',
      },
    ],
    initialBriefing: {
      title: '1979: The Energy Shock, Inflation & Confidence Crisis',
      situationSummary:
        'Soaring crude oil prices, 11.3% inflation, and long lines at neighborhood gas stations have triggered a national crisis of confidence. Meanwhile, Tehran turbulence and Soviet missile deployments squeeze diplomatic bandwidth.',
      domesticIssue:
        'Commuter anger over odd-even fuel rationing and declining auto sales threatens deep defections among working-class and suburban voters.',
      economicIssue:
        'Backing aggressive Federal Reserve tightening will stabilize the dollar and crush inflation over time—but risks triggering a painful pre-election recession.',
      foreignIssue:
        'Protecting Persian Gulf oil transit and securing Senate support for SALT II require navigating fierce anti-détente backlash.',
      urgentDilemma:
        'Will you swallow bitter anti-inflation medicine—supporting Fed monetary restraint and decontrolling domestic oil prices—or shield short-term jobs with price caps and fiscal relief?',
      suggestedDirectives: [
        {
          role: 'Treasury & Fed Liaison',
          title: 'Back Volcker Tightening & Phased Energy Decontrol',
          policyDraft:
            'Publicly affirm Federal Reserve independence to tighten money supply against 11.3% CPI, phase out domestic crude price controls to spur U.S. drilling, and pair a windfall-profits levy with synthetic/solar R&D.',
          speechDraft:
            'There are no painless shortcuts out of double-digit inflation—we will restore sound money and American energy independence.',
        },
        {
          role: 'National Security Advisor',
          title: 'Persian Gulf Rapid Deployment & Diplomatic Freeze',
          policyDraft:
            'Freeze hostile foreign financial assets, establish a Rapid Deployment Joint Task Force for the Arabian Sea, and coordinate European allies on energy-sharing reserves.',
          speechDraft:
            'Any outside attempt to choke the Persian Gulf will be repelled by every necessary means.',
        },
        {
          role: 'Domestic & Transport Advisor',
          title: 'Airline-Trucking Deregulation & Fuel Conservation',
          policyDraft:
            'Accelerate freight trucking and rail deregulation to lower supply-chain shipping costs while deploying federal mass-transit grants and strategic petroleum releases.',
          speechDraft:
            'Breaking regulatory bottlenecks lets competition lower freight costs while conserving every barrel of fuel.',
        },
      ],
    },
  },
  {
    id: 'hist_1989_iron_curtain',
    title: '1989 · Fall of the Iron Curtain',
    subtitle: 'Berlin Wall collapse, Malta Summit, and German reunification',
    eraLabel: '1989 · End of the Cold War',
    historicalEraTag: '1989–91 Geopolitical Pivot',
    isHistorical: true,
    historicalYear: 1989,
    recommendedPresidentId: 'hw_bush',
    historicalBenchmarkNote:
      'Real-world 1989–90 benchmark: Prudent restraint as the Berlin Wall falls without gloating that could provoke a Soviet military backlash, securing Two-Plus-Four German reunification inside NATO, S&L thrift bailout, and the Americans with Disabilities Act.',
    historicalKeyEvents: [
      'Collapse of the Berlin Wall & Eastern Bloc',
      'Two-Plus-Four German NATO Reunification',
      'Savings & Loan Bailout & Deficit Compromise',
    ],
    description:
      'Crowds are tearing down the Berlin Wall across live global television while Gorbachev’s reforms strain Moscow’s hardliners. Steering Germany into NATO without triggering a Kremlin coup—while fixing the $150B thrift collapse—defines the post-Cold War century.',
    imageUrl: '/src/assets/images/hist_1989_iron_curtain_1795465834509.jpg',
    initialMetrics: {
      approval: 61,
      congressSupport: 51,
      gdpGrowth: 3.7,
      inflation: 4.8,
      unemployment: 5.3,
      diplomaticStanding: 81,
      nationalDebtTrillions: 2.86,
      houseSeats: 175,
      senateSeats: 45,
    },
    initialBlocs: {
      workingClass: 54,
      suburbanModerates: 65,
      techFinance: 62,
      seniors: 59,
      youngVoters: 53,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 4,
      forceReadiness: 87,
      defenseBudgetBillions: 299,
      cyberPosture: 'Normal',
      intelThreatLevel: 'Elevated',
      intelSummary:
        'Warsaw Pact command structures are dissolving rapidly while 380,000 Soviet troops remain stationed inside East Germany.',
      jointChiefsChair: {
        name: 'Gen. Colin L. Powell',
        branch: 'U.S. Army',
        doctrine: 'Overwhelming Force & Post-Cold War Base Drawdown',
      },
      operations: [
        {
          id: 'op-1989-1',
          name: 'EUCOM Berlin & Rhine Readiness',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '310,000',
          statusNote:
            'Monitoring Soviet Group of Forces in East Germany during peaceful transition.',
        },
        {
          id: 'op-1989-2',
          name: 'SOUTHCOM Panama Canal Watch',
          region: 'Latin America',
          posture: 'Standby',
          personnelCount: '22,000',
          statusNote:
            'Heightened vigilance around Panama Canal Zone amid Noriega tensions.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 8.5,
      fedStance: 'Hawkish',
      fedChairNote:
        'Fed Chair Alan Greenspan balances soft-landing rate policy against S&L banking insolvencies.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Conservative Court coalition aligned on deregulation and federal treaty authority.',
    },
    initialNews: [
      {
        id: 'n-1989-1',
        month: 1,
        outlet: 'CNN Breaking Desk',
        category: 'foreign',
        headline: 'East Berliners Breach Checkpoint Crossings Atop Crumbling Wall',
        summary:
          'Bonn and Washington coordinate urgently as Moscow warns against hasty border or alliance upheavals.',
        tone: 'positive',
      },
      {
        id: 'n-1989-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Thrift Insolvency Tab Tops $150B as Deficit Hawks Clash on Taxes',
        summary:
          'Treasury urges Resolution Trust rescue even as lawmakers argue over Gramm-Rudman budget caps.',
        tone: 'critical',
      },
      {
        id: 'n-1989-3',
        month: 1,
        outlet: 'New York Times',
        category: 'politics',
        headline: 'Capitol Hill Urges Dramatic Peace Dividend Defense Cuts',
        summary:
          'Democratic committee chairs press to redirect Pentagon funds toward domestic infrastructure and debt.',
        tone: 'neutral',
      },
      {
        id: 'n-1989-4',
        month: 1,
        outlet: 'Washington Post',
        category: 'foreign',
        headline: 'London and Paris Quietly Question Pace of German Reunification',
        summary:
          'White House diplomacy works to reassure Thatcher and Mitterrand while engaging Gorbachev at Malta.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'November 1989: Berlin Wall Falls & The Post-Cold War Order',
      situationSummary:
        'The Berlin Wall has opened after 28 years, unleashing euphoria across Europe alongside acute geopolitical danger: hundreds of thousands of Soviet troops remain in East Germany while London and Paris fear a resurgent unified Germany.',
      domesticIssue:
        'Congress demands a massive "peace dividend" defense drawdown while the Americans with Disabilities Act awaits final bipartisan floor action.',
      economicIssue:
        'Collapsing Savings & Loan thrifts require an urgent federal deposit rescue that threatens to blow past statutory deficit ceilings.',
      foreignIssue:
        'Securing Soviet assent to a unified Germany anchored inside NATO—without humiliating Gorbachev before Moscow hardliners—requires supreme diplomatic restraint.',
      urgentDilemma:
        'Do you champion quiet, respectful Two-Plus-Four reunification inside NATO with Gorbachev, push aggressive defense budget cuts to balance the thrift bailout, or stage celebratory victory summits?',
      suggestedDirectives: [
        {
          role: 'Secretary of State & NSC',
          title: 'Two-Plus-Four German Reunification & Malta Summit',
          policyDraft:
            'Convene Two-Plus-Four talks backing Chancellor Kohl for rapid German reunification inside NATO, couple assurances on troop caps with economic credits for Moscow, and avoid triumphalist rhetoric that could destabilize Gorbachev.',
          speechDraft:
            'A Europe whole and free is emerging—not through triumphalism over any nation, but through peaceful self-determination.',
        },
        {
          role: 'Treasury Secretary',
          title: 'Resolution Trust S&L Cleanup & Budget Accord',
          policyDraft:
            'Establish the Resolution Trust Corporation to resolve insolvent thrifts, enact bipartisan deficit-reduction caps trading modest defense reductions for spending discipline, and protect FDIC depositors.',
          speechDraft:
            'Cleaning up failed thrifts and putting federal deficits on a downward path secures American growth for the new decade.',
        },
        {
          role: 'Domestic Policy Advisor',
          title: 'Sign Americans with Disabilities Act & Clean Air Pact',
          policyDraft:
            'Broker bipartisan Senate passage of the landmark Americans with Disabilities Act alongside market-based Clean Air Act acid-rain cap-and-trade reforms.',
          speechDraft:
            'Let the shameful wall of exclusion in our own workplaces and public spaces come tumbling down as well.',
        },
      ],
    },
  },
  {
    id: 'hist_2001_911',
    title: '2001 · 9/11 & Homeland Crucible',
    subtitle: 'Ground Zero response, AUMF coalition, and Patriot Act vs. liberties',
    eraLabel: 'September 2001 · National Emergency',
    historicalEraTag: 'Post-9/11 Security Crucible',
    isHistorical: true,
    historicalYear: 2001,
    recommendedPresidentId: 'w_bush',
    historicalBenchmarkNote:
      'Real-world 2001 benchmark: Grounding civil aviation and reopening Wall Street safely, passing the bipartisan 9/11 AUMF and Victim Compensation Fund, NATO Article 5 coalition in Afghanistan, establishing TSA/Homeland Security, and balancing surveillance powers against constitutional safeguards.',
    historicalKeyEvents: [
      'September 11 Attacks & Ground Zero Rally',
      'Bipartisan AUMF & NATO Article 5 Coalition',
      'Aviation Security, Anthrax & Patriot Act Debate',
    ],
    description:
      'Following the deadliest terrorist attacks on American soil, commercial aviation is grounded, financial markets are halted, and the nation looks to the Oval Office for steadiness, justice, and constitutional balance.',
    imageUrl: '/src/assets/images/hist_2001_911_1795465833820.jpg',
    initialMetrics: {
      approval: 86,
      congressSupport: 84,
      gdpGrowth: 1.0,
      inflation: 2.8,
      unemployment: 5.0,
      diplomaticStanding: 88,
      nationalDebtTrillions: 5.8,
      houseSeats: 221,
      senateSeats: 49,
    },
    initialBlocs: {
      workingClass: 82,
      suburbanModerates: 87,
      techFinance: 79,
      seniors: 88,
      youngVoters: 76,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 2,
      forceReadiness: 92,
      defenseBudgetBillions: 348,
      cyberPosture: 'Active Shield',
      intelThreatLevel: 'Severe',
      intelSummary:
        'NORAD combat air patrols guard major cities while intelligence links Al-Qaeda networks sheltered by the Taliban regime in Afghanistan.',
      jointChiefsChair: {
        name: 'Gen. Richard B. Myers',
        branch: 'U.S. Air Force',
        doctrine: 'Global Counterterror & Special Operations Integration',
      },
      operations: [
        {
          id: 'op-2001-1',
          name: 'Operation Noble Eagle CAP',
          region: 'North America',
          posture: 'Active Strike',
          personnelCount: '45,000',
          statusNote:
            '24/7 fighter air patrols protecting U.S. airspace and critical infrastructure.',
        },
        {
          id: 'op-2001-2',
          name: 'CENTCOM Carrier & SOF Staging',
          region: 'Middle East & Levant',
          posture: 'Deterrence',
          personnelCount: '68,000',
          statusNote:
            'Carrier air wings and special forces staging in the Arabian Sea and Central Asia.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 3.0,
      fedStance: 'Accommodative',
      fedChairNote:
        'Federal Reserve floods interbank clearing lines with liquidity to ensure orderly NYSE reopening.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Courts weigh war-powers detention limits and emergency electronic surveillance warrants.',
    },
    initialNews: [
      {
        id: 'n-2001-1',
        month: 1,
        outlet: 'Associated Press Wire',
        category: 'defense',
        headline: 'Congress Passes Near-Unanimous Force Resolution as NATO Invokes Article 5',
        summary:
          'Allied leaders pledge airspace, intelligence, and special forces support following World Trade Center and Pentagon attacks.',
        tone: 'neutral',
      },
      {
        id: 'n-2001-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Airline Industry Seeks Emergency Stabilization as Markets Prepare Reopening',
        summary:
          'Travel, insurance, and hospitality sectors brace for sharp consumer pullbacks despite Fed rate cuts.',
        tone: 'critical',
      },
      {
        id: 'n-2001-3',
        month: 1,
        outlet: 'New York Times',
        category: 'domestic',
        headline: 'Rescue Crews Work Round the Clock at Lower Manhattan & Pentagon Sites',
        summary:
          'Federal emergency grants surge to New York and Virginia alongside nationwide blood and volunteer drives.',
        tone: 'neutral',
      },
      {
        id: 'n-2001-4',
        month: 1,
        outlet: 'Washington Post',
        category: 'politics',
        headline: 'Senate Negotiates Anti-Terror Surveillance Package With Sunset Clauses',
        summary:
          'Civil liberties advocates and DOJ negotiators debate wiretap oversight and domestic intelligence sharing.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: 'September 2001: National Emergency & Coalition Counterterror Response',
      situationSummary:
        'With commercial flights grounded and nearly 3,000 lives lost at the World Trade Center, the Pentagon, and Shanksville, national unity stands at historic highs. Your decisions this month set the precedent for homeland security, allied strategy, and civil liberties for decades.',
      domesticIssue:
        'Lawmakers seek an immediate aviation security overhaul, NYC recovery aid, and anti-terror intelligence reform with or without civil-liberties sunset limits.',
      economicIssue:
        'Reopening Wall Street without triggering systemic airline insolvencies or a deep 2001–02 downturn requires tight Fed-Treasury coordination.',
      foreignIssue:
        'Delivering an ultimatum to the Taliban to surrender Al-Qaeda leaders while locking in NATO, Pakistani, and UN backing.',
      urgentDilemma:
        'Will you anchor the response in a tight NATO-backed Afghanistan operation with judicial Patriot Act sunsets, or authorize expansive unilateral executive surveillance and broader regional preemption?',
      suggestedDirectives: [
        {
          role: 'Defense & NSC Coalition Team',
          title: 'Focused Taliban Ultimatum & NATO Article 5 Campaign',
          policyDraft:
            'Issue a strict ultimatum to Kabul to hand over Al-Qaeda leadership, launch focused special-operations and precision air coordination alongside Northern Alliance and NATO allies, and reject unrelated regional entanglements.',
          speechDraft:
            'We will dismantle the terror network that struck our shores alongside a united coalition of free nations—with discipline, resolve, and moral clarity.',
        },
        {
          role: 'Justice & Homeland Security',
          title: 'Aviation TSA Overhaul & Sunset-Guarded Patriot Act',
          policyDraft:
            'Federalize airport cockpit and baggage screening under a new Transportation Security Administration, establish a Cabinet-level Homeland Security office, and include four-year congressional sunset clauses on FISA surveillance expansions.',
          speechDraft:
            'We will protect every traveler and every city while safeguarding the constitutional freedoms that define America.',
        },
        {
          role: 'Treasury & Fed Coordination',
          title: 'Airline Stabilization, NYC Relief & Liquidity Shield',
          policyDraft:
            'Enact a $15B airline stabilization and victim compensation package paired with $20B in Lower Manhattan rebuilding grants and coordinated Federal Reserve emergency liquidity.',
          speechDraft:
            'America’s markets and skies will reopen stronger than ever—terror cannot break the engine of our free economy.',
        },
      ],
    },
  },
  {
    id: 'hist_2008_crash',
    title: '2008 · Global Financial Crash',
    subtitle: 'Lehman contagion, Detroit rescue, and the Great Recession stimulus',
    eraLabel: '2008–09 · Great Recession Emergency',
    historicalEraTag: '2000s Financial Meltdown',
    isHistorical: true,
    historicalYear: 2008,
    recommendedPresidentId: 'obama',
    historicalBenchmarkNote:
      'Real-world 2008–09 benchmark: Coordinating Treasury TARP bank stress tests, rescuing General Motors & Chrysler to avert 1M+ Midwest layoffs, enacting the $787B Recovery Act stimulus, and passing Dodd-Frank Wall Street safeguards.',
    historicalKeyEvents: [
      'Credit Freeze & Bank Stress Tests',
      'Detroit Auto Rescue vs. Liquidation',
      'Recovery Act Stimulus & Foreclosure Crisis',
    ],
    description:
      'Interbank lending is frozen, home foreclosures are surging across every state, and Detroit’s Big Three automakers face cash exhaustion within weeks. Preventing a second Great Depression tests every lever of Treasury and Capitol leadership.',
    imageUrl: '/src/assets/images/hist_2008_crash_1795465834897.jpg',
    initialMetrics: {
      approval: 54,
      congressSupport: 61,
      gdpGrowth: -2.8,
      inflation: 0.1,
      unemployment: 7.8,
      diplomaticStanding: 62,
      nationalDebtTrillions: 10.6,
      houseSeats: 257,
      senateSeats: 58,
    },
    initialBlocs: {
      workingClass: 60,
      suburbanModerates: 56,
      techFinance: 48,
      seniors: 51,
      youngVoters: 68,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 4,
      forceReadiness: 82,
      defenseBudgetBillions: 621,
      cyberPosture: 'Elevated',
      intelThreatLevel: 'Elevated',
      intelSummary:
        'Economic shockwaves rattle European and Asian allies while ongoing overseas deployments strain defense rotation readiness.',
      jointChiefsChair: {
        name: 'Adm. Michael G. Mullen',
        branch: 'U.S. Navy',
        doctrine: 'Strategic Reset & Whole-of-Government Stability',
      },
      operations: [
        {
          id: 'op-2008-1',
          name: 'CENTCOM Stability & Drawdown',
          region: 'Middle East & Levant',
          posture: 'Active Strike',
          personnelCount: '165,000',
          statusNote:
            'Rebalancing force posture while securing Gulf energy transit.',
        },
        {
          id: 'op-2008-2',
          name: 'Pacific Seventh Fleet Patrol',
          region: 'Indo-Pacific',
          posture: 'Deterrence',
          personnelCount: '52,000',
          statusNote:
            'Reassuring regional treaty partners amid global financial turmoil.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 0.25,
      fedStance: 'Accommodative',
      fedChairNote:
        'Fed Chair Ben Bernanke holds rates near zero with emergency credit facilities to prevent systemic bank failure.',
      judiciaryClimate: 'Split',
      pendingCourtNote:
        'Courts examine executive TARP authority and federal bankruptcy restructuring powers.',
    },
    initialNews: [
      {
        id: 'n-2008-1',
        month: 1,
        outlet: 'Financial Times Wire',
        category: 'economy',
        headline: 'Monthly Job Losses Top 600,000 as Credit Markets Remain Locked',
        summary:
          'Small business payroll lines and municipal bond auctions stall from California to Ohio.',
        tone: 'critical',
      },
      {
        id: 'n-2008-2',
        month: 1,
        outlet: 'Detroit Free Press',
        category: 'domestic',
        headline: 'GM and Chrysler Warn Bridge Cash Exhausts Before Quarter End',
        summary:
          'Midwest governors warn unmanaged auto liquidation could shatter 1.2 million supply-chain jobs.',
        tone: 'critical',
      },
      {
        id: 'n-2008-3',
        month: 1,
        outlet: 'Washington Post',
        category: 'politics',
        headline: 'Senate Moderate Trio Demands Tighter Cap on Stimulus Outlays',
        summary:
          'GOP opposition unites against spending scale while progressive blocs push for $1T+ infrastructure.',
        tone: 'neutral',
      },
      {
        id: 'n-2008-4',
        month: 1,
        outlet: 'Bloomberg Desk',
        category: 'economy',
        headline: 'G20 Finance Chiefs Call Emergency Summit to Prevent Beggar-Thy-Neighbor Tariffs',
        summary:
          'Allies urge synchronized fiscal stimulus and transparent bank stress tests.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '2008–09: Systemic Banking Freeze & Recovery Stimulus',
      situationSummary:
        'The economy is contracting at a -2.8% pace with unemployment climbing fast toward 10%. Major banks sit on toxic mortgage assets, Detroit automakers face imminent collapse, and voter fury over Wall Street bailouts threatens congressional support.',
      domesticIssue:
        'Millions of underwater homeowners face foreclosure while state budgets slash teacher and firefighter payrolls.',
      economicIssue:
        'Restoring interbank confidence via stress tests and passing an infrastructure/tax-cut Recovery Act without sparking a debt-ceiling revolt.',
      foreignIssue:
        'G20 partners urge coordinated global stimulus and reject protectionist trade walls.',
      urgentDilemma:
        'Will you pair a bold $800B Recovery Act and conditioned Detroit restructuring with transparent bank stress tests, or let distressed auto and financial giants liquidate to appease deficit hawks?',
      suggestedDirectives: [
        {
          role: 'Treasury & Economic Team',
          title: 'Recovery Act Stimulus & Transparent Bank Stress Tests',
          policyDraft:
            'Push an $800B American Recovery package blending middle-class payroll tax relief, state fiscal aid, and clean-grid infrastructure while launching mandatory public Treasury bank stress tests.',
          speechDraft:
            'This is not about rescuing Wall Street bonuses—it is about saving Main Street jobs, teachers, and factories across every state.',
        },
        {
          role: 'Auto Task Force',
          title: 'Conditioned Detroit Auto Restructuring Rescue',
          policyDraft:
            'Extend bridge financing to General Motors and Chrysler strictly conditioned on executive shakeups, debt-to-equity haircuts, union cost restructuring, and next-generation fuel-efficiency investments.',
          speechDraft:
            'We will not stand by and watch the heart of American manufacturing disappear when tough restructuring can save a million jobs.',
        },
        {
          role: 'Financial Reform Counsel',
          title: 'Dodd-Frank Safeguards & Homeowner Modification',
          policyDraft:
            'Submit comprehensive Wall Street derivatives clearing, capital reserve, and Consumer Financial Protection Bureau legislation alongside HAMP mortgage refinancing relief.',
          speechDraft:
            'Never again will reckless leverage on Wall Street put ordinary families’ homes and savings at risk.',
        },
      ],
    },
  },
  {
    id: 'hist_1981_reaganomics',
    title: '1981 · Morning & Supply-Side Reset',
    subtitle: '10.3% inflation, Kemp-Roth tax cuts, and PATCO standoff',
    eraLabel: '1981 · Supply-Side & Cold War Turn',
    historicalEraTag: '1980s Economic & Defense Reset',
    isHistorical: true,
    historicalYear: 1981,
    recommendedPresidentId: 'reagan',
    historicalBenchmarkNote:
      'Real-world 1981 benchmark: Passing the Economic Recovery Tax Act (Kemp-Roth 25% income tax cut) with bipartisan Boll Weevil Democrats, backing Fed Chair Volcker’s 19% interest-rate inflation cure, breaking the PATCO air-traffic strike, and launching the peace-through-strength defense buildup.',
    historicalKeyEvents: [
      'Kemp-Roth Tax Cuts & Spending Reallocation',
      'Volcker Tight Money vs. Stagflation',
      'PATCO Air Traffic Control Strike Showdown',
    ],
    description:
      'Inflation still exceeds 10% while prime interest rates approach 20% and Soviet SS-20 missiles deploy in Europe. Passing sweeping supply-side tax cuts through a Democratic House while backing painful Volcker tightening tests political nerve.',
    imageUrl: '/src/assets/images/hist_1981_reaganomics_1795553366583.jpg',
    initialMetrics: {
      approval: 58,
      congressSupport: 54,
      gdpGrowth: 2.5,
      inflation: 10.3,
      unemployment: 7.4,
      diplomaticStanding: 62,
      nationalDebtTrillions: 0.99,
      houseSeats: 192,
      senateSeats: 53,
    },
    initialBlocs: {
      workingClass: 53,
      suburbanModerates: 61,
      techFinance: 64,
      seniors: 56,
      youngVoters: 49,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 78,
      defenseBudgetBillions: 171,
      cyberPosture: 'Normal',
      intelThreatLevel: 'High',
      intelSummary:
        'Soviet forces remain entrenched in Afghanistan while Warsaw Pact exercises rattle Solidarity-era Poland.',
      jointChiefsChair: {
        name: 'Gen. David C. Jones',
        branch: 'U.S. Air Force',
        doctrine: 'Strategic Modernization & Peace Through Strength',
      },
      operations: [
        {
          id: 'op-1981-1',
          name: 'EUCOM Dual-Track Pershing Watch',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '315,000',
          statusNote:
            'Preparing NATO intermediate-range missile modernization alongside arms-control talks.',
        },
        {
          id: 'op-1981-2',
          name: 'Sixth Fleet Gulf of Sidra Patrol',
          region: 'Middle East & Levant',
          posture: 'Deterrence',
          personnelCount: '29,000',
          statusNote:
            'Asserting freedom-of-navigation rights across contested Mediterranean waters.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 16.5,
      fedStance: 'Hawkish',
      fedChairNote:
        'Fed Chair Paul Volcker holds overnight rates above 16% to break the back of decade-long inflation expectations.',
      judiciaryClimate: 'Split',
      pendingCourtNote:
        'White House prepares first Supreme Court appointment amid major deregulation and labor rulings.',
    },
    initialNews: [
      {
        id: 'n-1981-1',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'White House Sends Three-Year 25% Tax-Rate Cut to Democratic House',
        summary:
          'Treasury argues marginal tax relief will ignite capital investment once inflation cools.',
        tone: 'neutral',
      },
      {
        id: 'n-1981-2',
        month: 1,
        outlet: 'Washington Post',
        category: 'domestic',
        headline: 'Air Traffic Controllers Union Threatens Nationwide Walkout Over Pay',
        summary:
          'FAA readies military backup controllers as White House weighs strict federal no-strike enforcement.',
        tone: 'critical',
      },
      {
        id: 'n-1981-3',
        month: 1,
        outlet: 'New York Times',
        category: 'economy',
        headline: 'Housing Starts Plunge as 16% Fed Funds Rate Squeezes Construction',
        summary:
          'Midwest governors urge White House to lean on Volcker for early rate relief.',
        tone: 'critical',
      },
      {
        id: 'n-1981-4',
        month: 1,
        outlet: 'Defense Monitor',
        category: 'defense',
        headline: 'Pentagon Seeks B-1 Bomber Revival and 600-Ship Navy Expansion',
        summary:
          'Defense hawks argue restoring deterrence requires multi-year procurement growth.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '1981: Supply-Side Tax Gamble, Volcker Squeeze & PATCO',
      situationSummary:
        'You enter the Oval Office facing 10.3% inflation, 16.5% Fed rates squeezing construction, and an opposition House led by Speaker Tip O’Neill. Simultaneously, air traffic controllers threaten an illegal federal strike while defense planners urge rapid Cold War modernization.',
      domesticIssue:
        'PATCO air traffic controllers threaten a nationwide airport shutdown unless granted steep wage hikes and shorter hours.',
      economicIssue:
        'Passing deep Kemp-Roth income tax cuts while backing Volcker’s tight money risks steep near-term deficits and recession before recovery takes hold.',
      foreignIssue:
        'Restoring NATO deterrence against Soviet SS-20 missiles while keeping European allies united behind arms-control leverage.',
      urgentDilemma:
        'Will you hold firm behind Kemp-Roth tax cuts, Volcker’s rate discipline, and a 48-hour PATCO back-to-work ultimatum, or compromise with House Democrats and unions to soften short-term pain?',
      suggestedDirectives: [
        {
          role: 'Treasury & Legislative Whip',
          title: 'Enact Kemp-Roth Tax Cuts & Back Volcker Tightening',
          policyDraft:
            'Coalition-whip House conservative Democrats to pass the three-year 25% individual tax reduction and business depreciation overhaul while publicly defending Federal Reserve independence to crush 10% inflation.',
          speechDraft:
            'Government is not the solution to our problem; government is the problem. Together we will unleash American enterprise and restore sound money.',
        },
        {
          role: 'Transportation & Labor',
          title: 'Enforce Federal No-Strike Law on PATCO',
          policyDraft:
            'Give striking federal air traffic controllers 48 hours to return to duty under oath, deploy military and supervisory controllers to keep 75% of commercial flights moving, and replace non-compliant strikers.',
          speechDraft:
            'There is no strike against the public safety—those who violate their federal oath forfeit their posts.',
        },
        {
          role: 'Pentagon & NSC',
          title: '600-Ship Navy & Zero-Option INF Deterrence',
          policyDraft:
            'Launch multi-year conventional and strategic defense modernization while offering Moscow a "Zero Option" treaty eliminating all intermediate nuclear missiles in Europe.',
          speechDraft:
            'Peace comes through unmistakable strength—and credible strength opens the door to real arms reductions.',
        },
      ],
    },
  },
  {
    id: 'hist_1993_clinton_gridlock',
    title: '1993 · Deficit & NAFTA Crossroads',
    subtitle: 'Bond vigilantes, razor-thin budget vote, and North American trade',
    eraLabel: '1993 · Post-Cold War Domestic Pivot',
    historicalEraTag: '1990s Deficit & Trade Pivot',
    isHistorical: true,
    historicalYear: 1993,
    recommendedPresidentId: 'clinton',
    historicalBenchmarkNote:
      'Real-world 1993 benchmark: Choosing a credibility-first deficit-reduction budget passing by Vice President Gore’s tie-break to drop 10-year Treasury yields, forging a bipartisan coalition to ratify NAFTA despite union opposition, and expanding EITC & Brady gun safety.',
    historicalKeyEvents: [
      'Tie-Break Deficit Reduction vs. Stimulus',
      'NAFTA Ratification & Rust Belt Backlash',
      'Healthcare Reform & Post-Cold War Peacekeeping',
    ],
    description:
      'With the Cold War over and voters demanding an "economy, stupid" focus, soaring deficits frighten bond desks just as your own party’s labor base battles you over NAFTA ratification.',
    imageUrl: '/src/assets/images/hist_1993_nafta_deficit_1795553367400.jpg',
    initialMetrics: {
      approval: 49,
      congressSupport: 52,
      gdpGrowth: 2.7,
      inflation: 3.0,
      unemployment: 7.1,
      diplomaticStanding: 75,
      nationalDebtTrillions: 4.41,
      houseSeats: 258,
      senateSeats: 57,
    },
    initialBlocs: {
      workingClass: 54,
      suburbanModerates: 51,
      techFinance: 48,
      seniors: 50,
      youngVoters: 58,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 5,
      forceReadiness: 84,
      defenseBudgetBillions: 291,
      cyberPosture: 'Normal',
      intelThreatLevel: 'Elevated',
      intelSummary:
        'Balkan ethnic conflict and Somalia humanitarian operations test post-Cold War peacekeeping limits amid domestic base closures.',
      jointChiefsChair: {
        name: 'Gen. John Shalikashvili',
        branch: 'U.S. Army',
        doctrine: 'Base Force Drawdown & Multilateral Peacekeeping',
      },
      operations: [
        {
          id: 'op-1993-1',
          name: 'Operation Provide Promise & Adriatic Watch',
          region: 'Europe & North Atlantic',
          posture: 'Humanitarian',
          personnelCount: '22,000',
          statusNote:
            'Airlifting relief into Sarajevo while enforcing UN no-fly restrictions.',
        },
        {
          id: 'op-1993-2',
          name: 'Somalia UNOSOM Logistics',
          region: 'Sub-Saharan Africa',
          posture: 'Humanitarian',
          personnelCount: '18,000',
          statusNote:
            'Securing port relief convoys amid rising Mogadishu faction clashes.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 3.0,
      fedStance: 'Neutral',
      fedChairNote:
        'Fed Chair Alan Greenspan signals privately that credible multi-year deficit reduction will allow long-term interest rates to fall sharply.',
      judiciaryClimate: 'Split',
      pendingCourtNote:
        'Centrist Supreme Court coalition open to federal commerce and civil rights statutes.',
    },
    initialNews: [
      {
        id: 'n-1993-1',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Bond Traders Warn Stimulus Spending Without Deficit Cuts Will Spike Yields',
        summary:
          'Treasury advisors urge scrapping middle-class tax cuts in favor of a $500B deficit plan.',
        tone: 'critical',
      },
      {
        id: 'n-1993-2',
        month: 1,
        outlet: 'Detroit Free Press',
        category: 'politics',
        headline: 'Industrial Unions Mobilize Fiercely Against NAFTA Ratification Vote',
        summary:
          'House Democratic whips warn White House must rely on Republican votes to pass trade pact.',
        tone: 'critical',
      },
      {
        id: 'n-1993-3',
        month: 1,
        outlet: 'Washington Post',
        category: 'domestic',
        headline: 'White House Task Force Drafts Sweeping Universal Health Security Plan',
        summary:
          'Small-business groups and insurers brace for employer-mandate clash in Congress.',
        tone: 'neutral',
      },
      {
        id: 'n-1993-4',
        month: 1,
        outlet: 'New York Times',
        category: 'foreign',
        headline: 'Balkan Siege & Russian Reform Crisis Test Early Foreign Policy Focus',
        summary:
          'Allied capitals look for decisive U.S. leadership without open-ended ground quagmires.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '1993: Bond Market Reckoning, Budget Tie-Break & NAFTA',
      situationSummary:
        'Although unemployment sits at 7.1%, Fed Chair Greenspan and Treasury advisors warn that only a bold $500B deficit-reduction budget will bring down 30-year mortgage rates and spark private-sector hiring. Meanwhile, NAFTA ratification forces a painful split with organized labor.',
      domesticIssue:
        'Should you invest maximum political capital in an ambitious universal healthcare overhaul right away, or build incremental bipartisan wins like Family Leave, EITC, and crime/Brady reform?',
      economicIssue:
        'Pivoting from campaign stimulus to strict deficit reduction risks angering progressives, while raising upper-bracket taxes guarantees unified GOP opposition.',
      foreignIssue:
        'Passing NAFTA with labor/environmental side agreements while calibrating humanitarian deployments in Bosnia and Somalia.',
      urgentDilemma:
        'Will you stake your presidency on a disciplined deficit-reduction budget and bipartisan NAFTA passage to unleash low long-term rates, or prioritize union-backed public works stimulus?',
      suggestedDirectives: [
        {
          role: 'Treasury & NEC',
          title: 'Credibility-First $500B Deficit Reduction & EITC',
          policyDraft:
            'Assemble a multi-year $500B deficit-reduction budget pairing modest spending caps and upper-income rate adjustments with an expanded Earned Income Tax Credit to reward working families.',
          speechDraft:
            'Cutting the deficit will bring down interest rates, ignite private-sector jobs, and lift millions of working parents out of poverty.',
        },
        {
          role: 'Trade & State Coalition',
          title: 'Pass NAFTA With Labor & Environmental Side Accords',
          policyDraft:
            'Negotiate enforceable labor and environmental side agreements with Mexico and Canada and build a bipartisan House-Senate coalition to ratify NAFTA.',
          speechDraft:
            'America cannot retreat behind walls in a global economy—we will compete, export, and write the rules of fair North American trade.',
        },
        {
          role: 'Domestic Policy Council',
          title: 'Incremental Healthcare Portability & Crime-Brady Accord',
          policyDraft:
            'Prioritize bipartisan insurance portability for pre-existing conditions alongside the Brady waiting-period bill and 100,000 community police grants rather than an all-or-nothing overhaul.',
          speechDraft:
            'Real progress comes when both parties deliver practical security for families’ healthcare and neighborhoods.',
        },
      ],
    },
  },
  {
    id: 'hist_2020_pandemic',
    title: '2020 · Pandemic Lockdown & Warp Speed',
    subtitle: 'COVID-19 emergency, CARES trillions, and vaccine race',
    eraLabel: 'March 2020 · Global Health Emergency',
    historicalEraTag: '2020 Pandemic Crucible',
    isHistorical: true,
    historicalYear: 2020,
    recommendedPresidentId: 'trump',
    historicalBenchmarkNote:
      'Real-world 2020 benchmark: Launching Operation Warp Speed public-private vaccine acceleration in record months, enacting the $2.2T bipartisan CARES Act (PPP loans & stimulus checks), coordinating Fed emergency credit lines, and managing state-federal reopening tensions.',
    historicalKeyEvents: [
      'COVID-19 Shutdowns & Hospital Strain',
      '$2.2T Bipartisan CARES Act & PPP Loans',
      'Operation Warp Speed Vaccine Acceleration',
    ],
    description:
      'A novel coronavirus has shut down major cities, sent jobless claims into the millions overnight, and pushed hospitals toward ventilator shortages. Balancing historic emergency liquidity, vaccine sprints, and reopening pressures defines the year.',
    imageUrl: '/src/assets/images/hist_2020_pandemic_1795553368492.jpg',
    initialMetrics: {
      approval: 47,
      congressSupport: 58,
      gdpGrowth: -3.4,
      inflation: 1.4,
      unemployment: 8.1,
      diplomaticStanding: 52,
      nationalDebtTrillions: 23.6,
      houseSeats: 199,
      senateSeats: 53,
    },
    initialBlocs: {
      workingClass: 52,
      suburbanModerates: 44,
      techFinance: 51,
      seniors: 49,
      youngVoters: 38,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 4,
      forceReadiness: 83,
      defenseBudgetBillions: 738,
      cyberPosture: 'Elevated',
      intelThreatLevel: 'High',
      intelSummary:
        'USNS Mercy and Comfort deploy to coastal cities while military readiness adapts to quarantine protocols and global supply freeze.',
      jointChiefsChair: {
        name: 'Gen. Mark A. Milley',
        branch: 'U.S. Army',
        doctrine: 'Defense Support of Civil Authorities & Deterrence',
      },
      operations: [
        {
          id: 'op-2020-1',
          name: 'NORTHCOM Hospital Ships & FEMA Logistics',
          region: 'North America',
          posture: 'Humanitarian',
          personnelCount: '42,000',
          statusNote:
            'National Guard testing sites, PPE airlifts, and hospital-ship surge support.',
        },
        {
          id: 'op-2020-2',
          name: 'Indo-Pacific Deterrence Watch',
          region: 'Indo-Pacific',
          posture: 'Deterrence',
          personnelCount: '58,000',
          statusNote:
            'Preserving Pacific carrier readiness under strict crew health bubbles.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 0.25,
      fedStance: 'Accommodative',
      fedChairNote:
        'Fed Chair Jerome Powell cuts rates to 0–0.25% and launches unprecedented corporate, municipal, and Treasury liquidity facilities.',
      judiciaryClimate: 'Favorable',
      pendingCourtNote:
        'Federal courts weigh emergency public health orders alongside religious-liberty and eviction-moratorium challenges.',
    },
    initialNews: [
      {
        id: 'n-2020-1',
        month: 1,
        outlet: 'Associated Press Wire',
        category: 'domestic',
        headline: 'Record Weekly Jobless Claims Surge as States Halt Indoor Gatherings',
        summary:
          'Main Street restaurants, airlines, and hotels plead for immediate forgivable payroll bridge loans.',
        tone: 'critical',
      },
      {
        id: 'n-2020-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'Congress Races Toward $2.2T Bipartisan CARES Stabilization Package',
        summary:
          'Treasury and Senate negotiators align on PPP small-business loans, direct payments, and unemployment boosts.',
        tone: 'neutral',
      },
      {
        id: 'n-2020-3',
        month: 1,
        outlet: 'Science & Bio Wire',
        category: 'domestic',
        headline: 'Federal Planners Blueprint Public-Private Operation Warp Speed Vaccine Push',
        summary:
          'Pre-manufacturing mRNA candidates in parallel with clinical trials could shave years off timelines.',
        tone: 'positive',
      },
      {
        id: 'n-2020-4',
        month: 1,
        outlet: 'Washington Post',
        category: 'politics',
        headline: 'Governors and White House Clash Over Testing Kits and Reopening Timelines',
        summary:
          'Voters demand clear, unified briefings balancing public health and rapid economic reopening.',
        tone: 'critical',
      },
    ],
    initialBriefing: {
      title: 'Spring 2020: Pandemic Freeze, CARES Relief & Operation Warp Speed',
      situationSummary:
        'With commerce abruptly frozen across major metro hubs and GDP contracting sharply, bipartisan leaders in Congress stand ready for historic relief—yet fierce disputes rage over testing logistics, federal-state authority, and how quickly to reopen workplaces.',
      domesticIssue:
        'Governors demand massive federal testing, PPE supply via Defense Production Act, and clear CDC reopening benchmarks.',
      economicIssue:
        'Without immediate forgivable Paycheck Protection loans and Fed liquidity, millions of small firms face permanent closure.',
      foreignIssue:
        'Securing overseas PPE supply lines and countering opportunistic geopolitical probes while U.S. carriers manage outbreaks.',
      urgentDilemma:
        'Will you pair full Operation Warp Speed vaccine advance-purchasing and bipartisan CARES small-business relief with disciplined federal health coordination, or press for immediate unilateral reopening?',
      suggestedDirectives: [
        {
          role: 'Health & Pentagon Logistics',
          title: 'Launch Operation Warp Speed & DPA Medical Surge',
          policyDraft:
            'Commit $12B+ to pre-purchase and manufacture multiple mRNA and viral-vector vaccine candidates in parallel with Phase 3 trials while invoking the Defense Production Act for rapid diagnostics and ventilators.',
          speechDraft:
            'We are unleashing the full power of American science, industry, and logistics to deliver safe vaccines in months rather than years.',
        },
        {
          role: 'Treasury & Bipartisan Congress',
          title: 'Sign $2.2T CARES Act & PPP Small-Business Lifeline',
          policyDraft:
            'Enact bipartisan Paycheck Protection forgivable payroll loans, direct household relief checks, expanded jobless benefits, and Treasury-Fed liquidity backstops with independent oversight.',
          speechDraft:
            'Workers and small businesses did not cause this shutdown—Washington is standing squarely behind every Main Street payroll until America reopens.',
        },
        {
          role: 'Domestic Task Force',
          title: 'Phased State Reopening & National Testing Compact',
          policyDraft:
            'Distribute rapid point-of-care tests to governors and nursing homes under transparent gating metrics tying phased business reopening to local hospital capacity.',
          speechDraft:
            'Smart, data-driven testing protects our seniors while getting Americans safely back to work and school.',
        },
      ],
    },
  },
  {
    id: 'hist_2022_inflation_ukraine',
    title: '2022 · Inflation Surge & Ukraine Coalition',
    subtitle: '8.5% CPI shock, NATO sanctions unity, and CHIPS reshoring',
    eraLabel: '2022 · Post-COVID Inflation & European War',
    historicalEraTag: '2022 Inflation & Alliance Test',
    isHistorical: true,
    historicalYear: 2022,
    recommendedPresidentId: 'biden',
    historicalBenchmarkNote:
      'Real-world 2022 benchmark: Forging unprecedented NATO & G7 sanctions/intelligence sharing to back Ukraine without triggering direct U.S.-Russia nuclear escalation, releasing Strategic Petroleum Reserve barrels against $5 gas, and enacting the bipartisan CHIPS and Science Act & PACT/IRA bills.',
    historicalKeyEvents: [
      'Full-Scale Invasion of Ukraine & NATO Unity',
      '8.5% CPI Surge & Aggressive Fed Rate Hikes',
      'Bipartisan CHIPS Act & Energy Price Squeeze',
    ],
    description:
      'Headline inflation has hit a 40-year high of 8.5% right as Russia launches a full-scale invasion of Ukraine, spiking global diesel and grain prices while a 50–50 Senate tests every domestic legislative deal.',
    imageUrl: '/src/assets/images/hist_2022_ukraine_inflation_1795553367938.jpg',
    initialMetrics: {
      approval: 42,
      congressSupport: 48,
      gdpGrowth: 1.9,
      inflation: 8.5,
      unemployment: 3.6,
      diplomaticStanding: 74,
      nationalDebtTrillions: 30.4,
      houseSeats: 222,
      senateSeats: 50,
    },
    initialBlocs: {
      workingClass: 41,
      suburbanModerates: 45,
      techFinance: 48,
      seniors: 43,
      youngVoters: 46,
    },
    initialCabinet: DEFAULT_CABINET,
    initialMilitary: {
      defconLevel: 3,
      forceReadiness: 86,
      defenseBudgetBillions: 782,
      cyberPosture: 'Active Shield',
      intelThreatLevel: 'Severe',
      intelSummary:
        'Largest European land war since 1945 threatens NATO eastern borders while allied intelligence sharing guides Ukrainian defense without U.S. boots on the ground.',
      jointChiefsChair: {
        name: 'Gen. Mark A. Milley',
        branch: 'U.S. Army',
        doctrine: 'Allied Deterrence & Escalation Management',
      },
      operations: [
        {
          id: 'op-2022-1',
          name: 'EUCOM Eastern Flank Reinforcement',
          region: 'Europe & North Atlantic',
          posture: 'Deterrence',
          personnelCount: '100,000',
          statusNote:
            'Rotating armored brigades and Patriot batteries across Poland, Romania, and the Baltics.',
        },
        {
          id: 'op-2022-2',
          name: 'Indo-Pacific Semiconductor Corridor Watch',
          region: 'Indo-Pacific',
          posture: 'Deterrence',
          personnelCount: '54,000',
          statusNote:
            'Deterring cross-strait opportunism while reinforcing Tokyo and Seoul alliances.',
        },
      ],
    },
    initialInstitutions: {
      fedFundsRate: 2.5,
      fedStance: 'Hawkish',
      fedChairNote:
        'Fed Chair Powell accelerates 75bp rate hikes to cool 8.5% CPI, lifting mortgage rates past 6%.',
      judiciaryClimate: 'Hostile',
      pendingCourtNote:
        'Conservative Supreme Court majority trims executive agency rulemaking and student-debt relief authority.',
    },
    initialNews: [
      {
        id: 'n-2022-1',
        month: 1,
        outlet: 'Reuters World Desk',
        category: 'foreign',
        headline: 'NATO Allies Freeze Russian Central Bank Reserves as Kyiv Holds Capital',
        summary:
          'Washington coordinates precision artillery, Javelin, and intelligence deliveries across 40+ nations.',
        tone: 'neutral',
      },
      {
        id: 'n-2022-2',
        month: 1,
        outlet: 'Wall Street Journal',
        category: 'economy',
        headline: 'CPI Hits 8.5% as Gasoline Tops $4.80 and Fed Signals Rapid Tightening',
        summary:
          'Household grocery and fuel anxiety weighs heavily on midterm outlook despite 3.6% unemployment.',
        tone: 'critical',
      },
      {
        id: 'n-2022-3',
        month: 1,
        outlet: 'Capitol Dispatch',
        category: 'politics',
        headline: 'Senate Advances Bipartisan CHIPS & Domestic Semiconductor Package',
        summary:
          'Lawmakers back $52B in U.S. fab incentives to break reliance on vulnerable overseas chip supply.',
        tone: 'positive',
      },
      {
        id: 'n-2022-4',
        month: 1,
        outlet: 'Energy Markets Today',
        category: 'economy',
        headline: 'Allies Debate Strategic Oil Releases and LNG Exports to Ease Europe Winter',
        summary:
          'Domestic oil producers weigh capital discipline against White House calls for higher output.',
        tone: 'neutral',
      },
    ],
    initialBriefing: {
      title: '2022: 8.5% Inflation, European Land War & CHIPS Reshoring',
      situationSummary:
        'Tight post-pandemic supply chains and an energy-spiking war in Ukraine have pushed inflation to 8.5%, squeezing family budgets even with 3.6% unemployment. With a 50–50 Senate, you must balance NATO deterrence against escalation risk while enacting domestic anti-inflation and semiconductor bills.',
      domesticIssue:
        'Voters punish the White House for $4.80+ gas and soaring grocery bills, demanding immediate relief without adding inflationary deficit fuel.',
      economicIssue:
        'The Fed’s aggressive 75bp rate hikes risk cooling housing and tech hiring, making deficit-reducing drug-pricing and supply-side CHIPS reforms vital.',
      foreignIssue:
        'Sustaining bipartisan congressional Ukraine aid and European energy solidarity while deterring direct NATO-Russia confrontation.',
      urgentDilemma:
        'Will you coordinate Strategic Petroleum Reserve releases, pass the bipartisan CHIPS Act and deficit-cutting health/energy measures, and arm Ukraine within clear NATO red lines—or pivot toward unilateral price controls and aid caps?',
      suggestedDirectives: [
        {
          role: 'Secretary of State & Defense',
          title: 'NATO Eastern Flank Shield & Calibrated Ukraine Aid',
          policyDraft:
            'Coordinate G7 financial sanctions and allied artillery/air-defense deliveries to Kyiv while deploying 100,000 U.S. deterrence forces along NATO’s eastern border and maintaining strict nuclear deconfliction channels.',
          speechDraft:
            'When dictators pay no price for aggression, they cause more chaos. We will stand with Ukraine and defend every inch of NATO territory without sending American troops into direct combat.',
        },
        {
          role: 'Treasury & Energy',
          title: 'Strategic Reserve Release & Deficit-Lowering Cost Relief',
          policyDraft:
            'Authorize coordinated IEA Strategic Petroleum Reserve releases to stabilize pump prices while passing prescription drug price negotiation and deficit reduction to complement Fed inflation-fighting.',
          speechDraft:
            'Tackling inflation starts with lowering energy and prescription drug costs for families while bringing down the federal deficit.',
        },
        {
          role: 'Commerce & Bipartisan Senate',
          title: 'Sign Bipartisan CHIPS & Science Reshoring Act',
          policyDraft:
            'Secure bipartisan passage of $52B in domestic semiconductor fabrication incentives and regional tech-hub R&D grants to safeguard U.S. defense and industrial supply chains.',
          speechDraft:
            'America invented the semiconductor—now we are bringing chip manufacturing and supply-chain security back home.',
        },
      ],
    },
  },
];
