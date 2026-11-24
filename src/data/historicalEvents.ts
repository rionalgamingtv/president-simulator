import { HistoricalEventCategory, HistoricalEventItem } from '../types/game';

export const HISTORICAL_EVENT_CATEGORIES: {
  id: 'all' | HistoricalEventCategory;
  label: string;
}[] = [
  { id: 'all', label: 'All Flashpoints (12)' },
  { id: 'constitutional', label: 'Constitutional & Ethics' },
  { id: 'security', label: 'Homeland & Military' },
  { id: 'economic', label: 'Economic & Financial' },
  { id: 'geopolitical', label: 'Cold War & Geopolitics' },
];

export const HISTORICAL_EVENTS: HistoricalEventItem[] = [
  {
    id: 'evt_watergate',
    title: 'Watergate Tapes & Special Prosecutor Subpoena',
    historicalDate: 'October 1973',
    year: 1973,
    category: 'constitutional',
    severity: 'Critical',
    linkedScenarioIds: ['hist_1973_watergate'],
    summary:
      'Investigative reporters and the Senate Ervin Committee have uncovered secret Oval Office recording systems. Special Prosecutor Archibald Cox has subpoenaed nine pivotal tapes—triggering an acute confrontation over executive privilege and the rule of law.',
    historicalPrecedent:
      'In October 1973, ordering the firing of Special Prosecutor Cox sparked the "Saturday Night Massacre" resignations and accelerated House impeachment proceedings, whereas full judicial compliance shaped constitutional privilege in United States v. Nixon.',
    options: [
      {
        id: 'watergate_release_tapes',
        label: 'Surrender Full Tapes & Protect Independent Counsel',
        stanceTag: 'Institutional Transparency',
        description:
          'Turn over unedited Oval Office recordings to the federal court, affirm Special Prosecutor independence, and accept short-term embarrassment to safeguard constitutional legitimacy.',
        policyDraft:
          'Comply immediately with federal grand jury subpoenas for unedited White House recordings, issue a binding Justice Department charter guaranteeing Special Prosecutor independence, and waive executive privilege over potential misconduct.',
        speechDraft:
          'No administration is above the law or the courts; by releasing the complete record, we place the Constitution first.',
        metricDeltas: {
          approval: 3.5,
          congressSupport: 6.0,
          gdpGrowth: 0.1,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: 3.0,
        },
        blocImpacts: {
          suburbanModerates: 6,
          youngVoters: 4,
          seniors: 2,
        },
        headline:
          'White House Surrenders Unedited Tapes to Federal Court, Averting Constitutional Rupture',
        newsTone: 'positive',
      },
      {
        id: 'watergate_saturday_massacre',
        label: 'Assert Absolute Privilege & Dismiss Special Prosecutor',
        stanceTag: 'Saturday Night Massacre',
        description:
          'Order the Justice Department to fire the Special Prosecutor and refuse tape subpoenas—provoking senior DOJ resignations, bipartisan fury, and rapid impeachment talk.',
        policyDraft:
          'Assert absolute executive privilege over all Oval Office conversations, dismiss the Special Prosecutor for exceeding mandate, and transfer subpoena resistance directly to White House litigation counsel.',
        speechDraft:
          'Presidential candor and national security consultations cannot survive if every confidential discussion is handed to partisan committees.',
        metricDeltas: {
          approval: -9.5,
          congressSupport: -12.0,
          gdpGrowth: -0.2,
          inflation: 0.2,
          unemployment: 0.1,
          diplomaticStanding: -4.0,
        },
        blocImpacts: {
          suburbanModerates: -10,
          youngVoters: -8,
          workingClass: -5,
          seniors: -4,
        },
        headline:
          'DOJ Brass Resign En Masse as White House Fires Special Prosecutor Over Tapes',
        newsTone: 'critical',
      },
      {
        id: 'watergate_stennis_compromise',
        label: 'Offer Authenticated Transcripts Under Bipartisan Review',
        stanceTag: 'Compromise Protocol',
        description:
          'Propose verified written transcripts authenticated by a respected bipartisan senator rather than raw audio reels, buying negotiating room while leaving open legal challenges.',
        policyDraft:
          'Deliver court-verified written transcripts of contested Oval Office recordings audited by an independent bipartisan Senate verifier while retaining custody of sensitive national-security audio.',
        speechDraft:
          'We are providing the full factual record to the courts while preserving essential national-security confidentiality.',
        metricDeltas: {
          approval: -1.5,
          congressSupport: -2.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: 0.5,
        },
        blocImpacts: {
          suburbanModerates: -2,
          seniors: 2,
          techFinance: 1,
        },
        headline:
          'White House Proposes Senate-Verified Tape Transcripts Amid Skeptical Hill Reaction',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_911',
    title: 'September 11 Attacks & National Airspace Shutdown',
    historicalDate: 'September 11, 2001',
    year: 2001,
    category: 'security',
    severity: 'Historic',
    linkedScenarioIds: ['hist_2001_911'],
    summary:
      'Coordinated hijacked airliners have struck the World Trade Center and the Pentagon while passengers heroically downed Flight 93 in Pennsylvania. Civil aviation is grounded nationwide, Wall Street is closed, and Congress awaits an Authorization for Use of Military Force.',
    historicalPrecedent:
      'On September 11, 2001, the White House grounded 4,500+ flights, rallied NATO Article 5 allies, enacted airline stabilization and NYC recovery funds, and launched focused counterterror operations while sparking lasting debates over executive surveillance.',
    options: [
      {
        id: '911_nato_sunset_coalition',
        label: 'NATO Article 5 Coalition & Sunset-Guarded Homeland Act',
        stanceTag: 'Disciplined Alliance',
        description:
          'Invoke NATO Article 5 for a tightly targeted counterterror campaign in Afghanistan, federalize airport screening via TSA, and anchor surveillance expansions with strict judicial sunsets.',
        policyDraft:
          'Mobilize NATO Article 5 intelligence and special operations against Al-Qaeda sanctuaries, establish the Transportation Security Administration, pass $35B in NYC recovery and airline stabilization, and require 4-year congressional sunsets on FISA wiretaps.',
        speechDraft:
          'We stand united in grief and iron resolve—we will bring the perpetrators to justice alongside our allies while defending the Constitution at home.',
        metricDeltas: {
          approval: 7.5,
          congressSupport: 9.0,
          gdpGrowth: -0.3,
          inflation: 0,
          unemployment: 0.2,
          diplomaticStanding: 6.5,
        },
        blocImpacts: {
          suburbanModerates: 8,
          seniors: 7,
          workingClass: 7,
          youngVoters: 4,
          techFinance: 5,
        },
        defconDelta: -1,
        readinessDelta: 8,
        headline:
          'Bipartisan Congress Backs Focused Coalition Force & Aviation Overhaul With Liberty Safeguards',
        newsTone: 'positive',
      },
      {
        id: '911_broad_preemption',
        label: 'Authorize Sweeping Preemption & Broad Warrantless Powers',
        stanceTag: 'Maximum Executive Posture',
        description:
          'Push an open-ended global war posture and permanent domestic electronic collection authorities, maximizing near-term deterrence at the cost of allied friction and civil-liberties backlash.',
        policyDraft:
          'Declare a sweeping global preemption doctrine with indefinite detention tribunals, expand warrantless metadata collection, and prepare broad regional military contingencies beyond immediate perpetrators.',
        speechDraft:
          'We will make no distinction between terrorists who committed these acts and any regime that harbors or threatens our security.',
        metricDeltas: {
          approval: 4.0,
          congressSupport: 3.5,
          gdpGrowth: -0.4,
          inflation: 0.2,
          unemployment: 0.2,
          diplomaticStanding: -5.5,
        },
        blocImpacts: {
          seniors: 6,
          workingClass: 4,
          youngVoters: -6,
          suburbanModerates: -2,
        },
        defconDelta: -2,
        readinessDelta: 10,
        headline:
          'White House Unveils Sweeping Preemption Doctrine and Permanent Surveillance Authorities',
        newsTone: 'neutral',
      },
      {
        id: '911_law_enforcement_focus',
        label: 'Law Enforcement Extradition & Targeted Covert Strikes',
        stanceTag: 'Measured Retaliation',
        description:
          'Demand UN Security Council extradition enforcement combined with surgical special-operations raids rather than large-scale ground troop commitments.',
        policyDraft:
          'Pair a UN-backed financial freeze and Taliban extradition ultimatum with surgical covert strikes, domestic FAA cockpit hardening, and emergency NYSE liquidity backstops.',
        speechDraft:
          'Justice will be swift, targeted, and relentless—without stumbling into open-ended overseas occupations.',
        metricDeltas: {
          approval: -1.5,
          congressSupport: -3.0,
          gdpGrowth: -0.2,
          inflation: 0,
          unemployment: 0.1,
          diplomaticStanding: 4.0,
        },
        blocImpacts: {
          youngVoters: 5,
          techFinance: 3,
          workingClass: -4,
          seniors: -5,
        },
        readinessDelta: 4,
        headline:
          'President Opts for Surgical Covert Raids and UN Sanctions, Drawing Hawk Criticism',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_cuban_missiles',
    title: 'Cuban Missile Discovery & Caribbean Naval Quarantine',
    historicalDate: 'October 1962',
    year: 1962,
    category: 'geopolitical',
    severity: 'Historic',
    linkedScenarioIds: ['hist_1962_cold_war'],
    summary:
      'U-2 photoreconnaissance has confirmed Soviet medium-range ballistic missile batteries under construction 90 miles from Florida while Soviet cargo vessels steam toward the Caribbean exclusion line.',
    historicalPrecedent:
      'President Kennedy rejected immediate airstrikes and invasion, opting for a UN/OAS naval quarantine paired with a secret backchannel pledge removing obsolete Turkish Jupiter missiles once Cuban pads were dismantled.',
    options: [
      {
        id: 'cmc_quarantine_backchannel',
        label: 'Naval Quarantine & Secret Jupiter Missile Swap',
        stanceTag: 'ExComm Calibration',
        description:
          'Impose a selective Caribbean naval quarantine blocking offensive weapons while quietly offering non-invasion of Cuba and quiet withdrawal of aging Jupiter missiles in Turkey.',
        policyDraft:
          'Proclaim an OAS-backed Caribbean naval quarantine, place SAC deterrence on high alert, and authorize a secret Kremlin channel trading Cuban missile dismantling for a non-invasion pledge and quiet Jupiter withdrawal.',
        speechDraft:
          'Any nuclear missile launched from Cuba against any Western Hemisphere nation will trigger full retaliatory response—yet we keep the door to peace firmly open.',
        metricDeltas: {
          approval: 8.5,
          congressSupport: 6.5,
          gdpGrowth: 0.2,
          inflation: 0,
          unemployment: -0.1,
          diplomaticStanding: 8.0,
        },
        blocImpacts: {
          suburbanModerates: 8,
          youngVoters: 7,
          workingClass: 6,
          seniors: 6,
        },
        defconDelta: -1,
        readinessDelta: 6,
        headline:
          'Soviet Freighters Turn Back From Quarantine Line as Backchannel Pact Averting Nuclear War Holds',
        newsTone: 'positive',
      },
      {
        id: 'cmc_airstrike_invasion',
        label: 'Order Preemptive Dawn Airstrikes on Missile Pads',
        stanceTag: 'Joint Chiefs Hardline',
        description:
          'Launch massive low-level air sorties against Cuban launch sites before fueling completes—risking immediate retaliation against West Berlin or NATO bases.',
        policyDraft:
          'Execute surprise tactical airstrikes across Cuban MRBM sites alongside amphibious landing readiness in Florida and full NATO alert in West Berlin.',
        speechDraft:
          'America will not tolerate clandestine nuclear batteries ninety miles from our coastline.',
        metricDeltas: {
          approval: -4.0,
          congressSupport: -2.0,
          gdpGrowth: -0.6,
          inflation: 0.5,
          unemployment: 0.1,
          diplomaticStanding: -9.5,
        },
        blocImpacts: {
          workingClass: 2,
          suburbanModerates: -6,
          youngVoters: -9,
          techFinance: -7,
        },
        defconDelta: -2,
        readinessDelta: 9,
        headline:
          'Dawn Strikes Hit Cuban Launch Sites; NATO & Berlin Placed on Razor-Edge Nuclear Alert',
        newsTone: 'critical',
      },
      {
        id: 'cmc_un_inspection_only',
        label: 'Refer Crisis Exclusively to UN Security Council Debate',
        stanceTag: 'Pure Diplomatic Track',
        description:
          'Withhold any naval blockade while pursuing UN inspection resolutions—allowing Soviet crews extra time to make Cuban pads operational.',
        policyDraft:
          'Present U-2 imagery to the UN Security Council and request neutral international inspection teams without ordering naval interdiction.',
        speechDraft:
          'Let the verdict of the world community compel immediate withdrawal without naval confrontation.',
        metricDeltas: {
          approval: -6.5,
          congressSupport: -8.0,
          gdpGrowth: -0.1,
          inflation: 0.1,
          unemployment: 0,
          diplomaticStanding: -3.0,
        },
        blocImpacts: {
          seniors: -7,
          workingClass: -6,
          suburbanModerates: -5,
        },
        headline:
          'Critics Slam UN-Only Posture as Soviet Freighters Dock Unimpeded in Havana',
        newsTone: 'critical',
      },
    ],
  },
  {
    id: 'evt_1973_oil_embargo',
    title: 'OPEC Oil Embargo & Nationwide Gas Rationing',
    historicalDate: 'November 1973',
    year: 1973,
    category: 'economic',
    severity: 'Critical',
    linkedScenarioIds: ['hist_1973_watergate', 'hist_1979_stagflation'],
    summary:
      'Arab oil producers have cut exports to the United States in retaliation for Middle East airlifts, quadrupling crude prices and sparking mile-long lines at neighborhood gas stations.',
    historicalPrecedent:
      'The 1973–74 embargo created the Strategic Petroleum Reserve, nationwide 55 MPH limits, fuel efficiency mandates, and intensive shuttle diplomacy to broker disengagement.',
    options: [
      {
        id: 'oil_spr_shuttle',
        label: 'Shuttle Diplomacy + Strategic Reserve & 55 MPH Conservation',
        stanceTag: 'Supply & Diplomacy',
        description:
          'Launch intensive Middle East shuttle diplomacy to lift the boycott while creating a Strategic Petroleum Reserve, 55 MPH conservation, and refinery allocation rules.',
        policyDraft:
          'Dispatch high-level shuttle envoys to broker Sinai/Golan disengagement talks lifting the embargo while enacting a Federal Energy Office, Strategic Petroleum Reserve, and nationwide 55 MPH conservation.',
        speechDraft:
          'By conserving energy together and pursuing tireless diplomacy, America will never surrender its independence to foreign oil.',
        metricDeltas: {
          approval: 3.0,
          congressSupport: 4.5,
          gdpGrowth: 0.2,
          inflation: -0.6,
          unemployment: -0.2,
          diplomaticStanding: 4.5,
        },
        blocImpacts: {
          suburbanModerates: 4,
          workingClass: 3,
          seniors: 3,
        },
        headline:
          'Energy Conservation & Ceasefire Shuttle Talks Ease Crude Shock After Weeks of Gas Lines',
        newsTone: 'positive',
      },
      {
        id: 'oil_strict_ration_freeze',
        label: 'Mandate National Coupon Rationing & Rigid Price Caps',
        stanceTag: 'Wartime Rationing',
        description:
          'Impose mandatory federal gasoline coupon books and freeze pump prices below global spot rates—temporarily soothing commuters but worsening refinery shortages.',
        policyDraft:
          'Institute federal odd-even license rationing coupons and strict wellhead price ceilings across all U.S. refineries.',
        speechDraft:
          'No family will be priced out of getting to work while profiteers exploit a global supply squeeze.',
        metricDeltas: {
          approval: -3.5,
          congressSupport: -3.0,
          gdpGrowth: -0.4,
          inflation: -0.2,
          unemployment: 0.3,
          diplomaticStanding: -1.0,
        },
        blocImpacts: {
          workingClass: 2,
          techFinance: -6,
          suburbanModerates: -4,
        },
        headline:
          'Federal Price Caps Spark Refinery Bottlenecks and Angry Station Queues Nationwide',
        newsTone: 'critical',
      },
      {
        id: 'oil_decontrol_drilling',
        label: 'Decontrol Domestic Oil & Fast-Track Pipeline Leases',
        stanceTag: 'Domestic Supply Surge',
        description:
          'Eliminate domestic crude price caps immediately to spur Texas, Alaska, and offshore production, accepting sharp short-term pump pain for long-run supply.',
        policyDraft:
          'Phase out domestic crude price ceilings immediately, fast-track Alaskan and continental shelf drilling leases, and pair low-income winter heating vouchers.',
        speechDraft:
          'The surest cure for high oil prices is unleashing American energy production at full capacity.',
        metricDeltas: {
          approval: -2.0,
          congressSupport: 1.5,
          gdpGrowth: 0.3,
          inflation: 0.4,
          unemployment: -0.2,
          diplomaticStanding: 1.0,
        },
        blocImpacts: {
          techFinance: 5,
          workingClass: -3,
          youngVoters: -4,
        },
        headline:
          'White House Lifts Domestic Crude Caps to Spur Drilling as Pump Prices Climb Short-Term',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_2008_lehman',
    title: 'Wall Street Credit Freeze & Detroit Auto Collapse',
    historicalDate: 'Fall 2008 – Early 2009',
    year: 2008,
    category: 'economic',
    severity: 'Critical',
    linkedScenarioIds: ['hist_2008_crash'],
    summary:
      'Interbank commercial paper has seized up following major investment bank failures, wiping out trillions in household retirement wealth while GM and Chrysler warn payroll cash runs out within weeks.',
    historicalPrecedent:
      'Transparent bank stress tests paired with conditioned auto restructuring loans and the $787B Recovery Act averted systemic bank collapse and saved over one million Midwest manufacturing jobs.',
    options: [
      {
        id: 'crash_stress_tests_auto',
        label: 'Bank Stress Tests + Conditioned Detroit Rescue & Recovery Bill',
        stanceTag: 'Systemic Stabilization',
        description:
          'Backstop interbank liquidity with transparent public stress tests, rescue GM/Chrysler only under strict executive and debt concessions, and drive a major Recovery stimulus.',
        policyDraft:
          'Launch mandatory Treasury bank stress tests alongside conditioned bridge restructuring loans for GM and Chrysler and an infrastructure/tax-cut Recovery package.',
        speechDraft:
          'We will stabilize the credit system Main Street depends on while demanding real accountability from both Wall Street and Detroit.',
        metricDeltas: {
          approval: 2.5,
          congressSupport: 2.0,
          gdpGrowth: 0.7,
          inflation: -0.1,
          unemployment: -0.5,
          diplomaticStanding: 3.5,
        },
        blocImpacts: {
          workingClass: 6,
          suburbanModerates: 3,
          techFinance: 4,
        },
        headline:
          'Bank Stress Tests & Conditioned Auto Rescue Calm Markets as Recovery Package Clears Floor',
        newsTone: 'positive',
      },
      {
        id: 'crash_let_fail',
        label: 'Refuse Federal Bailouts & Enforce Strict Liquidation',
        stanceTag: 'Free-Market Liquidation',
        description:
          'Reject taxpayer rescue funds for both Wall Street banks and Detroit automakers—winning applause from deficit purists while risking a 1930s-scale credit contraction.',
        policyDraft:
          'Veto emergency bank equity injections and decline Treasury bridge financing for Detroit automakers, directing firms strictly to Chapter 7/11 bankruptcy courts.',
        speechDraft:
          'Taxpayers must never be forced to socialize private corporate losses.',
        metricDeltas: {
          approval: -6.5,
          congressSupport: -4.0,
          gdpGrowth: -1.1,
          inflation: -0.5,
          unemployment: 1.2,
          diplomaticStanding: -4.0,
        },
        blocImpacts: {
          workingClass: -10,
          suburbanModerates: -6,
          techFinance: -5,
        },
        headline:
          'Auto Liquidation & Credit Freeze Spark 1,000-Point Market Plunge and Midwest Layoff Surge',
        newsTone: 'critical',
      },
      {
        id: 'crash_homeowner_first',
        label: 'Direct Homeowner Mortgage Cram-Down & Payroll Tax Holiday',
        stanceTag: 'Main Street First',
        description:
          'Focus rescue capital directly on principal mortgage reductions and a 12-month payroll tax holiday rather than corporate equity lifelines.',
        policyDraft:
          'Establish federal bankruptcy mortgage principal modifications and enact an immediate one-year FICA payroll tax holiday funded via existing TARP balances.',
        speechDraft:
          'Relief must start at the kitchen table—when families keep their homes and paychecks, recovery follows.',
        metricDeltas: {
          approval: 4.5,
          congressSupport: -1.5,
          gdpGrowth: 0.4,
          inflation: 0.2,
          unemployment: -0.3,
          diplomaticStanding: 1.0,
        },
        blocImpacts: {
          workingClass: 7,
          youngVoters: 6,
          techFinance: -5,
        },
        headline:
          'White House Pivots Bailout Funds Toward Direct Mortgage Relief and Payroll Tax Cuts',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_berlin_wall',
    title: 'Fall of the Berlin Wall & German Reunification',
    historicalDate: 'November 1989',
    year: 1989,
    category: 'geopolitical',
    severity: 'Historic',
    linkedScenarioIds: ['hist_1989_iron_curtain'],
    summary:
      'Crowds are dismantling the Berlin Wall live on global television while Soviet forces remain stationed in East Germany. Washington’s next move could lock in a peaceful democratic Europe—or provoke hardliners in Moscow.',
    historicalPrecedent:
      'Refusing to gloat atop the wall preserved Mikhail Gorbachev’s political space to negotiate the Two-Plus-Four Treaty peacefully bringing a unified Germany inside NATO.',
    options: [
      {
        id: 'berlin_quiet_two_plus_four',
        label: 'Restrained Diplomacy & Two-Plus-Four NATO Reunification',
        stanceTag: 'Strategic Restraint',
        description:
          'Avoid triumphalist spectacles in Berlin and partner quietly with Bonn and Moscow to secure peaceful German reunification inside NATO.',
        policyDraft:
          'Open Two-Plus-Four reunification talks backing West Germany inside NATO paired with Soviet troop withdrawal funding and non-triumphalist public messaging.',
        speechDraft:
          'I am glad to see the walls of division fall, and we welcome peaceful dialogue toward a Europe whole and free.',
        metricDeltas: {
          approval: 4.5,
          congressSupport: 4.0,
          gdpGrowth: 0.2,
          inflation: 0,
          unemployment: -0.1,
          diplomaticStanding: 9.0,
        },
        blocImpacts: {
          suburbanModerates: 6,
          techFinance: 4,
          seniors: 4,
        },
        defconDelta: 1,
        headline:
          'Malta & Bonn Diplomacy Unlocks Historic Pathway for Peaceful Unified Germany Inside NATO',
        newsTone: 'positive',
      },
      {
        id: 'berlin_victory_rally',
        label: 'Stage Triumphal Victory Speech at Brandenburg Gate',
        stanceTag: 'Victory Lap',
        description:
          'Fly immediately to Berlin for a triumphant anti-Soviet victory rally—electrifying domestic hawks while cornering Gorbachev against Kremlin hardliners.',
        policyDraft:
          'Stage a major presidential victory address at the Brandenburg Gate demanding immediate unilateral Soviet troop pullouts across Eastern Europe.',
        speechDraft:
          'Freedom has crushed communism—every Soviet division must pack up and leave Central Europe without delay.',
        metricDeltas: {
          approval: 5.5,
          congressSupport: 2.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: -6.5,
        },
        blocImpacts: {
          workingClass: 4,
          seniors: 5,
          suburbanModerates: -2,
        },
        defconDelta: -1,
        headline:
          'Kremlin Hardliners Freeze Arms Talks After Triumphal Berlin Victory Rally',
        newsTone: 'critical',
      },
      {
        id: 'berlin_neutral_germany',
        label: 'Endorse Neutral Non-Aligned Unified Germany',
        stanceTag: 'Neutral Buffer Deal',
        description:
          'Concede NATO membership for a unified Germany to hasten Soviet withdrawal—rattling Paris, London, and NATO defense hawks.',
        policyDraft:
          'Propose a permanently neutral, non-NATO unified Germany in exchange for rapid Soviet troop withdrawal from Central Europe.',
        speechDraft:
          'Peace across Europe requires bridging old military blocs rather than extending them eastward.',
        metricDeltas: {
          approval: -4.5,
          congressSupport: -7.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: -4.5,
        },
        blocImpacts: {
          youngVoters: 3,
          seniors: -6,
          suburbanModerates: -5,
        },
        headline:
          'London and Capitol Hill Alarmed by White House Float of Non-Aligned Neutral Germany',
        newsTone: 'critical',
      },
    ],
  },
  {
    id: 'evt_pentagon_papers',
    title: 'Pentagon Papers Leak & Prior Restraint Showdown',
    historicalDate: 'June 1971',
    year: 1971,
    category: 'constitutional',
    severity: 'High',
    linkedScenarioIds: ['hist_1965_great_society', 'hist_1973_watergate'],
    summary:
      'Major newspapers have begun publishing 7,000 pages of a classified Defense Department history exposing decades of concealed escalations. The Justice Department urges an immediate court injunction blocking further publication.',
    historicalPrecedent:
      'In New York Times Co. v. United States (1971), the Supreme Court struck down prior restraint 6–3, affirming First Amendment press freedom while prompting sharper oversight of classified leaks.',
    options: [
      {
        id: 'papers_declassify_review',
        label: 'Respect Press Freedom & Order Declassification Audit',
        stanceTag: 'First Amendment Fidelity',
        description:
          'Decline prior-restraint injunctions against newspapers while launching an internal classification reform review protecting genuine active operational secrets.',
        policyDraft:
          'Withdraw DOJ prior-restraint injunctions against major newspapers, narrow classification stamps strictly to live tactical intelligence, and brief Senate Foreign Relations openly.',
        speechDraft:
          'An informed citizenry and a free press—even when uncomfortable—are the surest guarantors of democratic accountability.',
        metricDeltas: {
          approval: 3.0,
          congressSupport: 4.5,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: 2.5,
        },
        blocImpacts: {
          youngVoters: 7,
          suburbanModerates: 4,
          techFinance: 3,
        },
        headline:
          'White House Halts Press Injunction Bid, Earning Praise From First Amendment Scholars',
        newsTone: 'positive',
      },
      {
        id: 'papers_injunction_plumbers',
        label: 'Seek Emergency Court Injunction & Leak Task Force',
        stanceTag: 'Secrecy Crackdown',
        description:
          'Pursue Supreme Court prior-restraint orders and empower an aggressive White House special investigations unit to plug leaks—inviting major legal defeat and future scandal risks.',
        policyDraft:
          'File emergency DOJ injunctions barring further newspaper publication of classified history and establish an internal White House leak-investigation unit.',
        speechDraft:
          'No newspaper has the authority to unilaterally declassify diplomatic and military archives.',
        metricDeltas: {
          approval: -4.5,
          congressSupport: -5.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: -2.0,
        },
        blocImpacts: {
          youngVoters: -7,
          suburbanModerates: -4,
          seniors: 2,
        },
        headline:
          'Supreme Court Rejects White House Prior Restraint Bid 6–3 in Landmark Press Ruling',
        newsTone: 'critical',
      },
      {
        id: 'papers_prosecute_leaker_only',
        label: 'Allow Publication While Pursuing Narrow Criminal Charges',
        stanceTag: 'Targeted Enforcement',
        description:
          'Refrain from censoring newspapers while letting the Justice Department prosecute unauthorized removal of classified documents under federal statutes.',
        policyDraft:
          'Decline press injunctions while referring unauthorized removal of Defense Department files to federal prosecutors under existing classification law.',
        speechDraft:
          'We uphold the freedom of the press to publish, even as stewards of classified defense records remain bound by law.',
        metricDeltas: {
          approval: 0.5,
          congressSupport: 1.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: 0.5,
        },
        blocImpacts: {
          suburbanModerates: 2,
          seniors: 2,
          youngVoters: -2,
        },
        headline:
          'DOJ Drops Press Injunctions, Focuses Investigation Strictly on Document Custodians',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_selma_voting',
    title: 'Selma Bridge Confrontation & Voting Rights Act',
    historicalDate: 'March 1965',
    year: 1965,
    category: 'constitutional',
    severity: 'Historic',
    linkedScenarioIds: ['hist_1965_great_society'],
    summary:
      'Televised footage of peaceful voting-rights marchers assaulted on the Edmund Pettus Bridge in Selma, Alabama has shocked the conscience of the nation. Civil rights leaders demand federal protection and immediate voting-rights legislation.',
    historicalPrecedent:
      'President Johnson federalized the Alabama National Guard to protect marchers to Montgomery and delivered his landmark "We Shall Overcome" joint address driving the Voting Rights Act of 1965 into law.',
    options: [
      {
        id: 'selma_guard_vra',
        label: 'Federalize Guard Protection & Push Full Voting Rights Act',
        stanceTag: 'Moral & Legislative Blitz',
        description:
          'Protect Selma-to-Montgomery marchers with federalized troops and address a joint session of Congress demanding abolition of literacy tests and federal ballot registrars.',
        policyDraft:
          'Federalize National Guard units to protect peaceful voting-rights marchers to Montgomery and submit the comprehensive Voting Rights Act outlawing literacy tests with federal enforcement.',
        speechDraft:
          'There is no moral issue, no partisan issue—it is wrong to deny any fellow citizen the right to vote, and we shall overcome.',
        metricDeltas: {
          approval: 5.5,
          congressSupport: 6.0,
          gdpGrowth: 0.1,
          inflation: 0,
          unemployment: -0.1,
          diplomaticStanding: 5.5,
        },
        blocImpacts: {
          youngVoters: 9,
          workingClass: 4,
          suburbanModerates: 6,
        },
        headline:
          'Federalized Guard Shields Montgomery Marchers as Joint Session Rallies Behind Voting Rights Bill',
        newsTone: 'positive',
      },
      {
        id: 'selma_courts_only',
        label: 'Leave Enforcement to Case-by-Case Federal Lawsuits',
        stanceTag: 'Slow Litigation',
        description:
          'Avoid sweeping new voting legislation to appease Southern committee chairs—deeply alienating civil rights coalitions and young voters.',
        policyDraft:
          'Instruct the Justice Department to file county-by-county federal voting suits rather than proposing sweeping statutory preclearance rules.',
        speechDraft:
          'Respecting state judicial processes remains the most durable path toward peaceful registration reform.',
        metricDeltas: {
          approval: -6.0,
          congressSupport: -3.5,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: -4.0,
        },
        blocImpacts: {
          youngVoters: -10,
          suburbanModerates: -6,
          workingClass: -4,
        },
        headline:
          'Civil Rights Leaders Condemn White House Delay After Selma Crackdown',
        newsTone: 'critical',
      },
      {
        id: 'selma_bipartisan_commission',
        label: 'Convene Bipartisan Governors Summit & Gradual Reform',
        stanceTag: 'Incremental Mediation',
        description:
          'Seek a mediated compromise with moderate governors on voluntary ballot standards before deploying federal registrars.',
        policyDraft:
          'Deploy federal marshals for march safety while convening Southern and Northern governors to draft voluntary voter-registration benchmarks.',
        speechDraft:
          'Every state must join in guaranteeing peaceful assembly and lawful ballot access.',
        metricDeltas: {
          approval: -1.5,
          congressSupport: 1.0,
          gdpGrowth: 0,
          inflation: 0,
          unemployment: 0,
          diplomaticStanding: -0.5,
        },
        blocImpacts: {
          youngVoters: -4,
          seniors: 2,
          suburbanModerates: -1,
        },
        headline:
          'Governors Mediation Effort Draws Skepticism From Both Civil Rights Groups and Hardliners',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_1933_bank_holiday',
    title: '1933 National Bank Run & Deposit Insurance Emergency',
    historicalDate: 'March 1933',
    year: 1933,
    category: 'economic',
    severity: 'Historic',
    linkedScenarioIds: ['hist_1933_depression'],
    summary:
      'Depositor panic has forced 38 states to shutter banks as gold reserves drain from the Federal Reserve. Without immediate decisive federal intervention, the entire U.S. payments system faces collapse.',
    historicalPrecedent:
      'Declaring a 4-day Bank Holiday, passing the Emergency Banking Act in 8 hours, and establishing FDIC deposit insurance broke the banking panic and restored positive deposit inflows within one week.',
    options: [
      {
        id: 'bank_holiday_fdic',
        label: 'Proclaim National Bank Holiday & Enact FDIC Insurance',
        stanceTag: 'First Hundred Days',
        description:
          'Close all banks temporarily for Treasury inspection, reopen healthy banks backed by 100% liquidity, and launch FDIC deposit guarantees with a calm Fireside Chat.',
        policyDraft:
          'Invoke emergency banking powers for a 4-day national Bank Holiday, pass the Emergency Banking Act and Glass-Steagall FDIC deposit insurance, and address families directly by radio.',
        speechDraft:
          'I can assure you it is safer to keep your money in a reopened bank than under the mattress.',
        metricDeltas: {
          approval: 7.5,
          congressSupport: 8.5,
          gdpGrowth: 0.9,
          inflation: 0.4,
          unemployment: -0.7,
          diplomaticStanding: 3.0,
        },
        blocImpacts: {
          workingClass: 8,
          seniors: 8,
          suburbanModerates: 7,
          techFinance: 5,
        },
        headline:
          'Reopened Banks Draw Surge of Gold and Currency Deposits Following Fireside Reassurance',
        newsTone: 'positive',
      },
      {
        id: 'bank_gold_austerity',
        label: 'Defend Strict Gold Standard & Slash Federal Outlays',
        stanceTag: 'Orthodox Deflation',
        description:
          'Refuse federal deposit insurance and cut relief spending to balance the budget—deepening bank runs and industrial deflation.',
        policyDraft:
          'Maintain strict gold convertibility, limit Reconstruction Finance loans solely to collateralized railroads/banks, and enact immediate federal budget cuts.',
        speechDraft:
          'Only iron adherence to gold and balanced accounts can preserve long-term currency integrity.',
        metricDeltas: {
          approval: -7.5,
          congressSupport: -6.0,
          gdpGrowth: -1.2,
          inflation: -0.8,
          unemployment: 1.4,
          diplomaticStanding: -1.5,
        },
        blocImpacts: {
          workingClass: -9,
          seniors: -6,
          suburbanModerates: -6,
          techFinance: 3,
        },
        headline:
          'Gold-Standard Austerity Deepens Rural Bank Closures and Industrial Layoffs',
        newsTone: 'critical',
      },
      {
        id: 'bank_nationalize',
        label: 'Nationalize Major Clearinghouse Banks Temporarily',
        stanceTag: 'State Takeover',
        description:
          'Place distressed money-center banks under direct federal receivership—protecting depositors while sparking fierce Wall Street and Senate backlash.',
        policyDraft:
          'Place insolvent money-center clearinghouse banks under temporary Treasury receivership and issue direct postal-savings credit accounts.',
        speechDraft:
          'When private banking fails the public, the federal government must safeguard every worker’s paycheck directly.',
        metricDeltas: {
          approval: -1.5,
          congressSupport: -5.5,
          gdpGrowth: 0.3,
          inflation: 0.3,
          unemployment: -0.3,
          diplomaticStanding: -2.0,
        },
        blocImpacts: {
          workingClass: 5,
          techFinance: -10,
          suburbanModerates: -4,
        },
        headline:
          'Markets Roiled as White House Moves Toward Direct Federal Receivership of Major Banks',
        newsTone: 'critical',
      },
    ],
  },
  {
    id: 'evt_iran_hostage',
    title: 'Tehran Embassy Siege & Hostage Standoff',
    historicalDate: 'November 1979',
    year: 1979,
    category: 'security',
    severity: 'Critical',
    linkedScenarioIds: ['hist_1979_stagflation'],
    summary:
      'Militants have stormed the U.S. Embassy in Tehran, seizing more than fifty American diplomats and staff as hostages. Worldwide television broadcasts daily demonstrations while oil markets convulse.',
    historicalPrecedent:
      'Freezing Iranian assets, halting oil imports, rallying international diplomatic isolation, and navigating rescue versus Algerian-mediated release shaped late-Cold War crisis management.',
    options: [
      {
        id: 'iran_freeze_diplomacy',
        label: 'Freeze Assets, Halt Oil Imports & Pursue Allied Mediation',
        stanceTag: 'Coercive Diplomacy',
        description:
          'Freeze billions in hostile sovereign assets, build a broad international legal coalition, and pursue quiet third-party mediation while preserving hostage lives.',
        policyDraft:
          'Freeze all Iranian sovereign assets in U.S. institutions, halt crude imports, secure UN Security Council condemnation, and open quiet third-party diplomatic mediation.',
        speechDraft:
          'We will never yield to blackmail, and every day those Americans are held, Tehran’s economic and diplomatic isolation will deepen.',
        metricDeltas: {
          approval: 2.0,
          congressSupport: 3.0,
          gdpGrowth: -0.1,
          inflation: 0.2,
          unemployment: 0,
          diplomaticStanding: 4.0,
        },
        blocImpacts: {
          suburbanModerates: 3,
          seniors: 2,
          workingClass: 1,
        },
        readinessDelta: 3,
        headline:
          'White House Freezes Sovereign Assets and Rallies UN Coalition Over Embassy Seizure',
        newsTone: 'neutral',
      },
      {
        id: 'iran_surgical_rescue',
        label: 'Authorize High-Risk Special Operations Rescue Raid',
        stanceTag: 'Direct Extraction',
        description:
          'Order a covert desert helicopter extraction mission inside Tehran—offering dramatic breakthrough potential alongside grave operational risk.',
        policyDraft:
          'Authorize a joint special-operations covert insertion into Tehran to extract embassy hostages after staging desert refueling forward points.',
        speechDraft:
          'America stands ready to use every capability to bring our citizens home safely.',
        metricDeltas: {
          approval: -3.0,
          congressSupport: -2.0,
          gdpGrowth: -0.1,
          inflation: 0.1,
          unemployment: 0,
          diplomaticStanding: -2.5,
        },
        blocImpacts: {
          workingClass: 2,
          seniors: 2,
          suburbanModerates: -4,
        },
        defconDelta: -1,
        readinessDelta: 5,
        headline:
          'Covert Embassy Rescue Attempt Triggers Fierce Debate Over Operational Readiness',
        newsTone: 'critical',
      },
      {
        id: 'iran_naval_blockade',
        label: 'Mine Ports & Impose Full Persian Gulf Naval Blockade',
        stanceTag: 'Naval Escalation',
        description:
          'Deploy carrier groups to blockade Iranian ports directly—spiking global oil prices sharply while threatening wider regional war.',
        policyDraft:
          'Order Sixth and Seventh Fleet carrier groups to enforce a maritime blockade on Iranian exports in the Persian Gulf until all embassy personnel are freed.',
        speechDraft:
          'Not a single tanker will clear contested waters while American diplomats remain captive.',
        metricDeltas: {
          approval: 1.5,
          congressSupport: -1.5,
          gdpGrowth: -0.5,
          inflation: 0.9,
          unemployment: 0.2,
          diplomaticStanding: -5.0,
        },
        blocImpacts: {
          seniors: 3,
          techFinance: -5,
          youngVoters: -4,
        },
        defconDelta: -1,
        readinessDelta: 6,
        headline:
          'Persian Gulf Blockade Sends Global Crude Surging Amid Fears of Wider Conflict',
        newsTone: 'critical',
      },
    ],
  },
  {
    id: 'evt_apollo_11',
    title: 'Apollo Lunar Breakthrough & Technological Race',
    historicalDate: 'July 1969',
    year: 1969,
    category: 'geopolitical',
    severity: 'High',
    linkedScenarioIds: ['hist_1962_cold_war', 'hist_1965_great_society'],
    summary:
      'NASA’s Apollo program stands poised for a historic crewed lunar landing watched by half a billion people worldwide—raising immediate strategic choices over post-Apollo space budgets, international cooperation, and STEM investment.',
    historicalPrecedent:
      'Apollo 11 vaulted American scientific prestige globally and spurred satellite communications, microelectronics, and international orbital cooperation.',
    options: [
      {
        id: 'apollo_stem_international',
        label: 'Launch Reusable Shuttle + International Orbital Science Pact',
        stanceTag: 'Science & Prestige',
        description:
          'Capitalize on lunar triumph by authorizing reusable spacecraft R&D, joint international orbital science missions, and expanded university STEM grants.',
        policyDraft:
          'Authorize post-Apollo reusable orbital vehicle engineering, invite allied scientific payloads, and expand National Science Foundation semiconductor and university research grants.',
        speechDraft:
          'We came in peace for all mankind—and now we turn frontier engineering toward clean energy, communications, and discovery.',
        metricDeltas: {
          approval: 6.0,
          congressSupport: 4.0,
          gdpGrowth: 0.3,
          inflation: 0,
          unemployment: -0.2,
          diplomaticStanding: 7.0,
        },
        blocImpacts: {
          techFinance: 8,
          youngVoters: 7,
          suburbanModerates: 5,
        },
        headline:
          'Global Applause Greets Lunar Triumph as White House Unveils Next-Gen Orbital & STEM Charter',
        newsTone: 'positive',
      },
      {
        id: 'apollo_mars_crash',
        label: 'Commit Immediately to Crash 1980s Crew-to-Mars Program',
        stanceTag: 'Frontier Megaproject',
        description:
          'Propose a massive multi-hundred-billion-dollar Mars expedition immediately—inspiring space enthusiasts while drawing sharp fiscal pushback in Congress.',
        policyDraft:
          'Direct NASA to initiate nuclear-thermal propulsion and heavy-lift architecture for a crewed Mars landing inside fifteen years.',
        speechDraft:
          'Having conquered the Moon, America’s destiny lies on the red plains of Mars.',
        metricDeltas: {
          approval: 2.5,
          congressSupport: -4.5,
          gdpGrowth: 0.2,
          inflation: 0.2,
          unemployment: -0.1,
          diplomaticStanding: 3.0,
        },
        blocImpacts: {
          techFinance: 7,
          youngVoters: 5,
          seniors: -3,
        },
        headline:
          'Ambitious Mars Mandate Thrills Aerospace Hubs While Appropriators Balk at Cost',
        newsTone: 'neutral',
      },
      {
        id: 'apollo_pivot_domestic',
        label: 'Scale Back Manned Spaceflight & Redirect Funds Domestic',
        stanceTag: 'Earth-First Budget',
        description:
          'Declare victory after the Moon landing and wind down major manned space budgets to relieve federal deficits and fund urban renewal.',
        policyDraft:
          'Cap post-Apollo crewed space outlays at baseline satellite maintenance and reallocate $4B annually toward domestic transit and urban housing.',
        speechDraft:
          'Having proved our capability among the stars, let us apply equal urgency to cities and classrooms here on Earth.',
        metricDeltas: {
          approval: 0.5,
          congressSupport: 2.5,
          gdpGrowth: 0,
          inflation: -0.1,
          unemployment: 0,
          diplomaticStanding: -2.0,
        },
        blocImpacts: {
          workingClass: 4,
          techFinance: -6,
          youngVoters: 2,
        },
        headline:
          'NASA Contractors Brace for Layoffs as White House Pivots Space Savings to Domestic Cities',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_desert_storm',
    title: 'Gulf Invasion & Operation Desert Storm Coalition',
    historicalDate: 'January 1991',
    year: 1991,
    category: 'security',
    severity: 'Critical',
    linkedScenarioIds: ['hist_1989_iron_curtain'],
    summary:
      'Armored forces have annexed Kuwait and threaten Persian Gulf oil reserves. With a 34-nation UN-authorized coalition assembled in Saudi Arabia, the Senate has narrowly debated whether to authorize decisive offensive action.',
    historicalPrecedent:
      'Securing UN Security Council authorization, Congressional War Powers votes, broad allied cost-sharing, and clear limited objectives (liberate Kuwait without occupying Baghdad) forged a textbook coalition triumph.',
    options: [
      {
        id: 'gulf_limited_coalition',
        label: 'Launch Coalition Liberation With Strict Limited Objectives',
        stanceTag: 'Powell Doctrine',
        description:
          'Execute overwhelming precision air and armored liberation of Kuwait under UN mandate—then halt once Kuwait is free rather than marching on Baghdad.',
        policyDraft:
          'Execute Desert Storm air and armored operations with overwhelming force to expel invading troops from Kuwait, secure allied cost-sharing, and halt offensive advance once UN mandate is met.',
        speechDraft:
          'Our coalition acts under international law with one clear objective: the liberation of Kuwait, not an endless occupation.',
        metricDeltas: {
          approval: 9.0,
          congressSupport: 6.5,
          gdpGrowth: 0.2,
          inflation: -0.3,
          unemployment: -0.1,
          diplomaticStanding: 7.5,
        },
        blocImpacts: {
          suburbanModerates: 8,
          workingClass: 7,
          seniors: 8,
          techFinance: 6,
        },
        readinessDelta: 6,
        headline:
          '34-Nation Coalition Liberates Kuwait in 100-Hour Ground Campaign, Halts at Border',
        newsTone: 'positive',
      },
      {
        id: 'gulf_march_to_capital',
        label: 'Push Coalition Armor Straight to Regime Change in Capital',
        stanceTag: 'Regime Occupation',
        description:
          'Order U.S. armored corps past the UN mandate to topple the regime directly—fracturing Arab coalition partners and committing years of occupation.',
        policyDraft:
          'Extend armored advance beyond Kuwait toward full capital occupation and regime replacement despite UN mandate expiration.',
        speechDraft:
          'Peace in the Gulf requires removing aggression at its root once and for all.',
        metricDeltas: {
          approval: -3.5,
          congressSupport: -5.5,
          gdpGrowth: -0.3,
          inflation: 0.4,
          unemployment: 0.2,
          diplomaticStanding: -8.0,
        },
        blocImpacts: {
          youngVoters: -7,
          suburbanModerates: -5,
          seniors: 2,
        },
        defconDelta: -1,
        readinessDelta: -4,
        headline:
          'Arab Coalition Splinters as U.S. Armored Columns Push Past UN Mandate Toward Capital',
        newsTone: 'critical',
      },
      {
        id: 'gulf_sanctions_wait',
        label: 'Hold Fire & Rely Strictly on Maritime Embargo Sanctions',
        stanceTag: 'Sanctions Patience',
        description:
          'Keep 500,000 troops on desert standby indefinitely while testing whether naval sanctions alone force withdrawal.',
        policyDraft:
          'Suspend offensive air-ground timelines and maintain defensive Saudi shield plus maritime sanctions enforcement for another year.',
        speechDraft:
          'Giving economic sanctions time to bite avoids risking lives before every peaceful lever is exhausted.',
        metricDeltas: {
          approval: -2.5,
          congressSupport: -1.5,
          gdpGrowth: -0.2,
          inflation: 0.2,
          unemployment: 0.1,
          diplomaticStanding: -1.0,
        },
        blocImpacts: {
          youngVoters: 4,
          seniors: -4,
          workingClass: -3,
        },
        readinessDelta: -3,
        headline:
          'Coalition Fatigue Mounts in Desert Staging Areas as Embargo Enters Seventh Month',
        newsTone: 'neutral',
      },
    ],
  },
  {
    id: 'evt_1987_black_monday',
    title: 'Black Monday 22% Stock Crash & Liquidity Panic',
    historicalDate: 'October 19, 1987',
    year: 1987,
    category: 'economic',
    severity: 'Critical',
    linkedScenarioIds: ['hist_1989_iron_curtain'],
    summary:
      'Programmed trading cascades have triggered a historic 22.6% single-day collapse on the Dow Jones Industrial Average, erasing $500 billion in market value in hours and threatening clearinghouse defaults.',
    historicalPrecedent:
      'Immediate Federal Reserve liquidity pledges paired with calm bipartisan deficit-reduction negotiations prevented the 1987 crash from mutating into a depression.',
    options: [
      {
        id: 'crash87_fed_deficit_summit',
        label: 'Coordinate Fed Liquidity Pledge & Bipartisan Deficit Summit',
        stanceTag: 'Liquidity & Credibility',
        description:
          'Issue a joint Treasury-Fed guarantee keeping clearinghouses liquid while convening congressional leaders to trim structural deficits calmly.',
        policyDraft:
          'Backstop Federal Reserve open-window clearing liquidity, introduce equity circuit breakers via the SEC, and convene a bipartisan Capitol budget-stabilization summit.',
        speechDraft:
          'America’s underlying industrial productivity remains sound—we are ensuring markets stay liquid and orderly.',
        metricDeltas: {
          approval: 4.0,
          congressSupport: 4.5,
          gdpGrowth: 0.3,
          inflation: 0,
          unemployment: -0.1,
          diplomaticStanding: 3.0,
        },
        blocImpacts: {
          techFinance: 7,
          suburbanModerates: 5,
          seniors: 4,
        },
        headline:
          'Joint Fed Liquidity Backstop and SEC Circuit Breakers Halt Wall Street Panic',
        newsTone: 'positive',
      },
      {
        id: 'crash87_close_exchanges',
        label: 'Order Week-Long Stock Exchange Trading Halt',
        stanceTag: 'Market Freeze',
        description:
          'Shut down U.S. stock exchanges entirely for five days—fueling overseas panic selling across Tokyo and London.',
        policyDraft:
          'Direct the SEC to suspend NYSE and NASDAQ equities trading nationwide pending emergency margin investigations.',
        speechDraft:
          'A temporary pause protects retail savers from computerized panic.',
        metricDeltas: {
          approval: -5.5,
          congressSupport: -4.0,
          gdpGrowth: -0.6,
          inflation: 0,
          unemployment: 0.4,
          diplomaticStanding: -4.5,
        },
        blocImpacts: {
          techFinance: -10,
          seniors: -6,
          suburbanModerates: -5,
        },
        headline:
          'Global Selloff Intensifies in London and Tokyo After U.S. Halts Equity Trading',
        newsTone: 'critical',
      },
      {
        id: 'crash87_emergency_tax_cut',
        label: 'Demand Immediate Capital Gains Tax Elimination',
        stanceTag: 'Supply-Side Shock',
        description:
          'Respond to the crash with sweeping capital-gains tax elimination—boosting equity bids briefly while triggering bond-market deficit alarm.',
        policyDraft:
          'Transmit an emergency capital-gains tax elimination bill while resisting deficit-offsetting spending curbs.',
        speechDraft:
          'Slashing taxes on investment is the fastest signal to put capital back to work.',
        metricDeltas: {
          approval: -1.0,
          congressSupport: -3.5,
          gdpGrowth: 0.1,
          inflation: 0.3,
          unemployment: 0,
          diplomaticStanding: 0,
        },
        blocImpacts: {
          techFinance: 5,
          workingClass: -5,
          youngVoters: -3,
        },
        headline:
          'Bond Yields Spike as Capital Gains Push Spurns Bipartisan Deficit Agreement',
        newsTone: 'neutral',
      },
    ],
  },
];
