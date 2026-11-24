import {
  BackgroundId,
  CabinetDepartment,
  CoalitionId,
  PartyId,
} from '../types/game';

export interface HistoricalPresidentOption {
  id: string;
  orderLabel: string;
  name: string;
  party: string;
  partyId: PartyId;
  yearsInOffice: string;
  priorRole: string;
  coalition: CoalitionId;
  background: BackgroundId;
  governingDoctrine: string;
  summary: string;
  recommendedTicket: {
    vpId: string;
    jcsId: string;
    cabinet: Record<CabinetDepartment, string>;
  };
}

export interface CustomEraBlueprint {
  id: string;
  year: number;
  title: string;
  eraTag: string;
  summary: string;
  premise: string;
}

function pres(
  id: string,
  orderLabel: string,
  name: string,
  party: string,
  partyId: PartyId,
  yearsInOffice: string,
  priorRole: string,
  coalition: CoalitionId,
  background: BackgroundId,
  governingDoctrine: string,
  summary: string,
  vpId: string,
  jcsId: string,
  cabinet: Record<CabinetDepartment, string>
): HistoricalPresidentOption {
  return {
    id,
    orderLabel,
    name,
    party,
    partyId,
    yearsInOffice,
    priorRole,
    coalition,
    background,
    governingDoctrine,
    summary,
    recommendedTicket: { vpId, jcsId, cabinet },
  };
}

export const HISTORICAL_PRESIDENTS: HistoricalPresidentOption[] = [
  pres(
    'trump',
    '45th & 47th President',
    'Donald Trump',
    'Republican',
    'republican',
    '2017–2021 · 2025–',
    'Real Estate & Media Executive',
    'independent_populist',
    'executive',
    'America First tariffs, sweeping deregulation, border enforcement, energy dominance, and populist disruption.',
    'Disruptive outsider executive wielding bilateral trade pressure, deregulation, and populist media leverage.',
    'vp_vance',
    'jcs_caine',
    {
      chief_of_staff: 'cos_wiles',
      treasury: 'tres_bessent',
      state: 'state_rubio',
      defense: 'def_hegseth',
      nsa: 'nsa_waltz',
      justice: 'doj_bondi',
      labor: 'lab_chavez_deremer',
      press_secretary: 'press_leavitt',
    }
  ),
  pres(
    'biden',
    '46th President',
    'Joe Biden',
    'Democratic',
    'democratic',
    '2021–2025',
    'Vice President & U.S. Senator',
    'center_left',
    'senator',
    'Middle-out industrial policy, bipartisan Senate infrastructure & chip deals, pro-union investment, and NATO unity.',
    'Veteran Senate negotiator pairing semiconductor and grid industrial bills with allied deterrence.',
    'vp_harris',
    'jcs_cq_brown',
    {
      chief_of_staff: 'cos_klain',
      treasury: 'tres_yellen',
      state: 'state_blinken',
      defense: 'def_austin',
      nsa: 'nsa_sullivan',
      justice: 'doj_garland',
      labor: 'lab_walsh',
      press_secretary: 'press_psaki',
    }
  ),
  pres(
    'obama',
    '44th President',
    'Barack Obama',
    'Democratic',
    'democratic',
    '2009–2017',
    'U.S. Senator from Illinois',
    'center_left',
    'senator',
    'Deliberative crisis stabilization, healthcare & clean-energy expansion, multilateral diplomacy, and measured regulation.',
    'Analytical institutional steward balancing macroeconomic stimulus, allied pacts, and modern coalition politics.',
    'vp_biden',
    'jcs_dempsey',
    {
      chief_of_staff: 'cos_emanuel',
      treasury: 'tres_geithner',
      state: 'state_h_clinton',
      defense: 'def_gates',
      nsa: 'nsa_donilon',
      justice: 'doj_holder',
      labor: 'lab_perez',
      press_secretary: 'press_earnest',
    }
  ),
  pres(
    'w_bush',
    '43rd President',
    'George W. Bush',
    'Republican',
    'republican',
    '2001–2009',
    'Governor of Texas',
    'center_right',
    'governor',
    'Compassionate conservatism, broad tax relief, forward homeland & military defense, and decisive crisis action.',
    'Wartime executive pairing domestic tax cuts and Medicare reform with high-tempo national security posture.',
    'vp_cheney',
    'jcs_myers',
    {
      chief_of_staff: 'cos_card',
      treasury: 'tres_paulson',
      state: 'state_rice',
      defense: 'def_rumsfeld',
      nsa: 'nsa_hadley',
      justice: 'doj_ashcroft',
      labor: 'lab_chao',
      press_secretary: 'press_perino',
    }
  ),
  pres(
    'clinton',
    '42nd President',
    'Bill Clinton',
    'Democratic',
    'democratic',
    '1993–2001',
    'Governor of Arkansas',
    'center_left',
    'governor',
    'Triangulation between parties, deficit-cutting fiscal credibility, free-trade expansion, and tech-boom investment.',
    'Agile Third-Way negotiator blending balanced-budget compacts with working-family tax credits.',
    'vp_gore',
    'jcs_shalikashvili',
    {
      chief_of_staff: 'cos_panetta',
      treasury: 'tres_rubin',
      state: 'state_albright',
      defense: 'def_perry',
      nsa: 'nsa_berger',
      justice: 'doj_reno',
      labor: 'lab_reich',
      press_secretary: 'press_mccurry',
    }
  ),
  pres(
    'hw_bush',
    '41st President',
    'George H. W. Bush',
    'Republican',
    'republican',
    '1989–1993',
    'Vice President & CIA Director',
    'technocratic_reformist',
    'commander',
    'Prudent multilateral coalition-building, disciplined global statecraft, bipartisan deficit deals, and steady governance.',
    'Veteran diplomat and former intelligence chief built for coalition warfare and treaty architecture.',
    'vp_quayle',
    'jcs_powell',
    {
      chief_of_staff: 'cos_sununu',
      treasury: 'tres_brady',
      state: 'state_baker',
      defense: 'def_cheney',
      nsa: 'nsa_scowcroft',
      justice: 'doj_thornburgh',
      labor: 'lab_dole',
      press_secretary: 'press_fitzwater',
    }
  ),
  pres(
    'reagan',
    '40th President',
    'Ronald Reagan',
    'Republican',
    'republican',
    '1981–1989',
    'Governor of California',
    'center_right',
    'governor',
    'Supply-side tax cuts, regulatory rollback, peace-through-strength defense buildup, and optimistic national messaging.',
    'Communicator-in-chief championing broad tax relief, rapid military deterrence, and Cold War strength.',
    'vp_ghw_bush',
    'jcs_vessey',
    {
      chief_of_staff: 'cos_james_baker',
      treasury: 'tres_regan',
      state: 'state_shultz',
      defense: 'def_weinberger',
      nsa: 'nsa_powell_n',
      justice: 'doj_meese',
      labor: 'lab_brock',
      press_secretary: 'press_brady',
    }
  ),
  pres(
    'carter',
    '39th President',
    'Jimmy Carter',
    'Democratic',
    'democratic',
    '1977–1981',
    'Governor of Georgia',
    'technocratic_reformist',
    'governor',
    'Outsider ethics reform, energy conservation, human-rights diplomacy, and anti-inflation discipline.',
    'Detail-driven former governor emphasizing transparency, clean energy transition, and Camp David mediation.',
    'vp_mondale',
    'jcs_jones',
    {
      chief_of_staff: 'cos_jordan',
      treasury: 'tres_blumenthal',
      state: 'state_vance',
      defense: 'def_harold_brown',
      nsa: 'nsa_brzezinski',
      justice: 'doj_bell',
      labor: 'lab_marshall_r',
      press_secretary: 'press_powell_j',
    }
  ),
  pres(
    'ford',
    '38th President',
    'Gerald Ford',
    'Republican',
    'republican',
    '1974–1977',
    'House Minority Leader & Vice President',
    'center_right',
    'senator',
    'Institutional healing, congressional compromise, veto restraint against inflation, and Cold War continuity.',
    'Capitol Hill consensus-builder focused on restoring public trust and checking federal spending.',
    'vp_rockefeller',
    'jcs_gs_brown',
    {
      chief_of_staff: 'cos_cheney',
      treasury: 'tres_simon',
      state: 'state_kissinger',
      defense: 'def_rumsfeld',
      nsa: 'nsa_scowcroft',
      justice: 'doj_levi',
      labor: 'lab_usery',
      press_secretary: 'press_nessen',
    }
  ),
  pres(
    'nixon',
    '37th President',
    'Richard Nixon',
    'Republican',
    'republican',
    '1969–1974',
    'Vice President & U.S. Senator',
    'center_right',
    'senator',
    'Triangular détente abroad paired with pragmatic domestic centralization and silent-majority appeal.',
    'Master strategist of realpolitik diplomacy balancing law-and-order rhetoric with pragmatic domestic deals.',
    'vp_agnew',
    'jcs_moorer',
    {
      chief_of_staff: 'cos_haldeman',
      treasury: 'tres_shultz',
      state: 'state_rogers',
      defense: 'def_laird',
      nsa: 'nsa_kissinger_n',
      justice: 'doj_richardson_j',
      labor: 'lab_shultz',
      press_secretary: 'press_klein',
    }
  ),
];

export const CUSTOM_ERA_BLUEPRINTS: CustomEraBlueprint[] = [
  {
    id: 'era_2000',
    year: 2000,
    title: '2000 · Dot-Com Peak & Surplus Crossroads',
    eraTag: 'Tech Bubble · Budget Surplus Debate',
    summary:
      'Projected federal surpluses spark a fierce battle between broad tax cuts and debt retirement just as Nasdaq volatility begins.',
    premise:
      'Year 2000. The federal ledger posts a rare projected surplus while Nasdaq tech valuations wobble, California electricity markets face deregulation blackouts, and Congress debates permanent normal trade relations with China.',
  },
  {
    id: 'era_2001',
    year: 2001,
    title: '2001 · Tech Bust & Homeland Shock',
    eraTag: 'Slowdown · Security Inflection',
    summary:
      'Cooling business investment tips the economy toward recession as urgent homeland intelligence and defense realignments dominate Washington.',
    premise:
      'Year 2001. Following the dot-com unwind, manufacturing orders drop, airline and energy sectors wobble, and heightened transnational intelligence threats force immediate decisions on homeland defense, tax stimulus, and allied coalitions.',
  },
  {
    id: 'era_2003',
    year: 2003,
    title: '2003 · Wartime Budgets & Allied Rift',
    eraTag: 'Middle East Deployment · Fiscal Turn',
    summary:
      'Major overseas force deployments strain coalition diplomacy at the UN while domestic tax-cut and Medicare debates split Congress.',
    premise:
      'Year 2003. Heavy U.S. troop deployments in the Middle East test transatlantic NATO unity and push defense outlays sharply higher, even as domestic employment lags and Congress clashes over stimulus tax cuts and prescription drug reform.',
  },
  {
    id: 'era_2008',
    year: 2008,
    title: '2008 · Global Financial Meltdown',
    eraTag: 'Banking Freeze · Housing Crash',
    summary:
      'Subprime mortgage contagion freezes interbank lending, threatening major investment banks, automakers, and household savings.',
    premise:
      'Year 2008. Falling home values trigger cascading subprime defaults, regional and Wall Street banks face acute liquidity runs, oil prices spike past $100 a barrel, and automakers warn of imminent bankruptcy without emergency Treasury intervention.',
  },
  {
    id: 'era_2010',
    year: 2010,
    title: '2010 · Post-Crash Recovery & Debt Friction',
    eraTag: '9.6% Unemployment · Tea Party Wave',
    summary:
      'Stubborn joblessness collides with sovereign debt fears in Europe and sharp congressional backlash over federal stimulus and healthcare.',
    premise:
      'Year 2010. Unemployment hovers above 9% despite stabilizing credit markets, Eurozone sovereign debt fears rattle Wall Street, and fierce midterm opposition challenges federal fiscal deficits, healthcare implementation, and financial regulation.',
  },
  {
    id: 'era_2014',
    year: 2014,
    title: '2014 · Shale Boom & Hybrid Deterrence',
    eraTag: 'Energy Surge · Eastern Europe Crisis',
    summary:
      'U.S. shale output transforms global oil markets as Eastern European territorial aggression and cyber intrusions challenge allied security.',
    premise:
      'Year 2014. Surging U.S. shale production drives domestic energy independence and lowers fuel costs, while sudden territorial seizures in Eastern Europe, Middle East instability, and state-backed cyber attacks test NATO sanctions and deterrence.',
  },
  {
    id: 'era_2017',
    year: 2017,
    title: '2017 · Populist Trade & Deregulation Reset',
    eraTag: 'Tariff Leverage · Industrial Heartland',
    summary:
      'Manufacturing-belt pressure upends consensus on multilateral trade deals, corporate tax rates, and border enforcement.',
    premise:
      'Year 2017. Tight labor markets coincide with deep industrial-belt frustration over offshoring, triggering fierce White House and congressional clashes over sweeping tariff leverage, NAFTA renegotiation, corporate tax overhaul, and judicial appointments.',
  },
  {
    id: 'era_2020',
    year: 2020,
    title: '2020 · Pandemic Lockdown & Supply Shock',
    eraTag: 'Public Health Crisis · Emergency Liquidity',
    summary:
      'Sudden nationwide shutdowns halt commerce, spike unemployment, and force historic fiscal relief and vaccine mobilization.',
    premise:
      'Year 2020. A fast-moving global respiratory pandemic forces emergency travel restrictions and state lockdowns, wiping out service payrolls overnight, straining hospital supply chains, and demanding trillion-dollar bipartisan relief and emergency Fed credit facilities.',
  },
  {
    id: 'era_2022',
    year: 2022,
    title: '2022 · Inflation Surge & Energy Sanctions',
    eraTag: '8.5% CPI · Rate-Hike Squeeze',
    summary:
      'Pent-up post-pandemic demand and a major European land war push inflation past 8%, forcing rapid Fed tightening and supply-chain reshoring.',
    premise:
      'Year 2022. Headline inflation tops 8% amid clogged ports and soaring food and diesel prices, a full-scale war in Eastern Europe triggers sweeping allied energy sanctions, and the Federal Reserve launches its sharpest rate-hike cycle in four decades.',
  },
  {
    id: 'era_2024',
    year: 2024,
    title: '2024 · High-Rate Resilience & AI Capex',
    eraTag: '7% Mortgages · Election-Year Standstill',
    summary:
      'Steady job growth clashes with high borrowing costs, municipal border & housing strain, and rapid AI data-center power demand.',
    premise:
      'Year 2024. The U.S. economy outperforms global peers in GDP growth, yet 7% mortgage rates lock up starter housing, municipal budgets strain under border and housing costs, and hyperscale AI data centers collide with an aging electric grid.',
  },
  {
    id: 'era_2026',
    year: 2026,
    title: '2026 · Sovereign Debt, AI Labor & Chip Choke Points',
    eraTag: '$36T+ Debt · Indo-Pacific Friction',
    summary:
      'High Treasury yields, rapid white-collar AI disruption, and contested semiconductor sea lanes test a razor-thin Capitol majority.',
    premise:
      'Year 2026. Rising 10-year Treasury yields and $36T+ national debt restrict fiscal room just as generative AI reshapes white-collar labor and maritime friction near Taiwan threatens advanced semiconductor packaging.',
  },
];

export const QUICK_MILESTONE_YEARS = [
  2000, 2001, 2003, 2008, 2010, 2014, 2017, 2020, 2022, 2024, 2026,
] as const;

export function getEraOverviewForYear(year: number): {
  year: number;
  eraLabel: string;
  macroSnapshot: string;
  defaultPremise: string;
} {
  const y = Math.max(2000, Math.min(2026, Math.round(year)));
  const exact = CUSTOM_ERA_BLUEPRINTS.find((b) => b.year === y);
  if (exact) {
    return {
      year: y,
      eraLabel: exact.eraTag,
      macroSnapshot: exact.summary,
      defaultPremise: exact.premise,
    };
  }

  if (y <= 2002) {
    return {
      year: y,
      eraLabel: 'Post-Dot-Com Transition · Early 2000s',
      macroSnapshot:
        'Debt sits near $5.8T–$6.2T, tech capital spending is resetting, and homeland security & corporate governance reforms dominate Capitol Hill.',
      defaultPremise: `Year ${y}. Markets are digesting the post-dot-com corporate downturn and accounting scandals while rising defense commitments, tax policy debates, and domestic energy prices challenge a narrowly divided Congress.`,
    };
  }
  if (y <= 2007) {
    return {
      year: y,
      eraLabel: 'Housing Expansion & Wartime Commitments · Mid-2000s',
      macroSnapshot:
        'Debt climbs from $7T–$9T, Fed policy tightens against rising home & oil prices, and overseas coalition stability weighs on public approval.',
      defaultPremise: `Year ${y}. Sustained overseas troop deployments, rising crude oil prices, federal disaster & entitlement costs, and accelerating subprime mortgage leverage create growing macroeconomic and political vulnerabilities.`,
    };
  }
  if (y <= 2013) {
    return {
      year: y,
      eraLabel: 'Post-2008 Recovery & Fiscal Standoffs',
      macroSnapshot:
        'Near-zero Fed funds rates, elevated unemployment, debt-ceiling brinkmanship, and fierce debates over financial regulation and stimulus.',
      defaultPremise: `Year ${y}. Household deleveraging and sluggish wage recovery following the Great Recession clash with fierce congressional debt-ceiling standoffs, Eurozone contagion worries, and deep partisan polarization.`,
    };
  }
  if (y <= 2016) {
    return {
      year: y,
      eraLabel: 'Shale Expansion & Digital Geopolitics',
      macroSnapshot:
        'Steady ~2% GDP growth, low inflation, surging domestic oil/gas output, and rising cyber, trade, and European security flashpoints.',
      defaultPremise: `Year ${y}. Low inflation and falling energy prices support steady job creation, yet manufacturing towns feel left behind by globalization while cyber espionage, Middle East turbulence, and Pacific maritime disputes intensify.`,
    };
  }
  if (y <= 2019) {
    return {
      year: y,
      eraLabel: 'Late-Cycle Boom & Tariff Friction',
      macroSnapshot:
        'Unemployment under 4%, corporate tax cuts, widening federal deficits, and aggressive bilateral tariff escalations.',
      defaultPremise: `Year ${y}. Tight labor markets and deregulation lift equity valuations, while aggressive trade tariffs with China, border policy battles, and Fed rate sensitivity split congressional coalitions.`,
    };
  }
  if (y <= 2023) {
    return {
      year: y,
      eraLabel: 'Pandemic Aftermath, Inflation & Industrial Reshoring',
      macroSnapshot:
        'Supply-chain bottlenecks, elevated CPI, rapid Fed tightening, and historic industrial & clean-energy legislation.',
      defaultPremise: `Year ${y}. Supply-chain bottlenecks, geopolitical energy shocks, and persistent inflation squeeze household budgets while competing proposals for domestic semiconductor reshoring, deficit reduction, and alliance aid divide Congress.`,
    };
  }
  return {
    year: y,
    eraLabel: 'High-Debt AI Era · Mid-2020s',
    macroSnapshot:
      'Debt above $35T, elevated Treasury yields, rapid AI capital expenditure, housing affordability pressure, and multipolar deterrence.',
    defaultPremise: `Year ${y}. Elevated borrowing costs and $35T+ sovereign debt constrain fiscal flexibility while AI infrastructure demand strains the electric grid, housing costs pinch younger voters, and Indo-Pacific tensions test supply chains.`,
  };
}

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatMonthCalendar(
  monthNumber: number,
  startingYear?: number
): {
  shortDate: string;
  fullDate: string;
  calendarYear?: number;
} {
  const idx = Math.max(0, monthNumber - 1);
  const termYear = Math.floor(idx / 12) + 1;
  const monthIdx = idx % 12;

  if (typeof startingYear === 'number' && Number.isFinite(startingYear)) {
    const calendarYear = Math.round(startingYear) + Math.floor(idx / 12);
    const abbr = MONTH_ABBR[monthIdx];
    return {
      shortDate: `${abbr} ${calendarYear}`,
      fullDate: `${abbr} ${calendarYear} · Term Yr ${termYear}`,
      calendarYear,
    };
  }

  return {
    shortDate: `M${String(monthNumber).padStart(2, '0')}`,
    fullDate: `Year ${termYear}, Month ${monthIdx + 1}`,
  };
}
