import {
  CabinetDepartment,
  CabinetHarmonyChoice,
  CabinetHarmonyOutcome,
  CabinetHarmonyRound,
  CabinetHarmonyScenario,
  CabinetHarmonyTone,
  CabinetMember,
  CabinetScandalEvent,
} from '../types/game';

interface DepartmentHarmonyTemplate {
  briefingContext: string;
  strainedOpening: string;
  cautiousOpening: string;
  alignedOpening: string;
  policyArea: string;
  scandalOutlet: string;
  scandalHeadline: (name: string) => string;
  scandalAllegation: (name: string, role: string) => string;
  scandalSeverity: CabinetScandalEvent['severity'];
  congressPressure: string;
}

const DEPARTMENT_TEMPLATES: Record<CabinetDepartment, DepartmentHarmonyTemplate> = {
  chief_of_staff: {
    briefingContext:
      'West Wing staff coordination, legislative scheduling, and backchannel leak control.',
    strainedOpening:
      'Mr. President, senior deputies are getting contradicting guidance directly from outside advisers. If the chain of command keeps fracturing, I cannot stop Capitol Hill leaks or hold our legislative calendar together.',
    cautiousOpening:
      'We have enough discipline to manage the weekly calendar, but several domestic deputies feel sidelined when major announcements drop without West Wing vetting.',
    alignedOpening:
      'The West Wing staff is locked in behind your agenda, though a quick alignment check on floor priorities will help us keep senior aides synced before next month.',
    policyArea: 'West Wing sign-off protocols and senior staff authority',
    scandalOutlet: 'The Washington Chronicle',
    scandalHeadline: (name) =>
      `Private West Wing Recordings Link ${name} to Backchannel Donor Access`,
    scandalAllegation: (name, role) =>
      `Following a heated Oval Office confrontation, internal scheduling logs surfaced showing ${role} ${name} quietly arranged off-calendar meetings for mega-donors seeking regulatory waivers.`,
    scandalSeverity: 'Severe',
    congressPressure:
      'House Oversight Committee has threatened immediate subpoenas for West Wing visitor and calendar records.',
  },
  state: {
    briefingContext:
      'Allied diplomacy, treaty coordination, and ambassadorial backchannels.',
    strainedOpening:
      'Allied foreign ministers are asking whether Foggy Bottom still speaks for the White House. When public statements undercut our envoys mid-negotiation, partners start hedging directly with rivals.',
    cautiousOpening:
      'Our embassy cables show cautious goodwill abroad, though career diplomats need clearer assurance that treaty commitments will not shift overnight.',
    alignedOpening:
      'Our embassies are executing cleanly, and a brief strategic sync on upcoming bilateral summits will keep State and the Oval Office word-for-word aligned.',
    policyArea: 'diplomatic backchannel autonomy and summit messaging',
    scandalOutlet: 'Global Wire Bureau',
    scandalHeadline: (name) =>
      `Leaked Diplomatic Cables Reveal ${name} Approved Undisclosed Arms Waiver`,
    scandalAllegation: (name, role) =>
      `Friction inside Foggy Bottom spilled into public view after documents showed ${role} ${name} signed off on an undisclosed defense export exception tied to a former consulting client.`,
    scandalSeverity: 'Critical',
    congressPressure:
      'Senate Foreign Relations leadership demanded an emergency classified briefing and threatened to freeze ambassador confirmations.',
  },
  defense: {
    briefingContext:
      'Pentagon readiness, combatant command posture, and procurement discipline.',
    strainedOpening:
      'The Joint Staff is frustrated by shifting force directives without clear rules of engagement. Keeping readiness credible requires mutual trust between the Commander-in-Chief and the E-Ring.',
    cautiousOpening:
      'Combatant commanders are executing current deployments, though budget uncertainty and rapid posture tweaks have left senior brass seeking clearer long-range guidance.',
    alignedOpening:
      'Readiness metrics are solid across commands, and reviewing procurement milestones together will keep the Pentagon and White House moving in lockstep.',
    policyArea: 'rules of engagement and defense procurement priorities',
    scandalOutlet: 'Defense Capitol Dispatch',
    scandalHeadline: (name) =>
      `Pentagon Audit Ties ${name} to No-Bid Logistics Contract Conflict`,
    scandalAllegation: (name, role) =>
      `An internal Inspector General memo leaked amid leadership tensions, alleging ${role} ${name} overruled career procurement officers on a $2.4B defense contract involving a prior board affiliation.`,
    scandalSeverity: 'Critical',
    congressPressure:
      'Senate Armed Services Chair called the procurement disclosures unacceptable and scheduled sworn testimony.',
  },
  treasury: {
    briefingContext:
      'Bond market credibility, inflation signaling, and fiscal discipline.',
    strainedOpening:
      'Fixed-income desks are already pricing in policy incoherence between Treasury and your economic team. Every off-the-cuff fiscal promise moves yields before I can brief Fed leadership.',
    cautiousOpening:
      'Markets remain orderly for now, though bond traders are watching our deficit trajectory closely and want tighter coordination on tax and tariff messaging.',
    alignedOpening:
      'Treasury auctions are clearing cleanly, and aligning our fiscal talking points ahead of next quarter will reinforce market confidence.',
    policyArea: 'deficit benchmarks and market-sensitive fiscal guidance',
    scandalOutlet: 'Financial Ledger Times',
    scandalHeadline: (name) =>
      `Ethics Filing Discrepancy Surfaces Around ${name} Ahead of Bond Auction`,
    scandalAllegation: (name, role) =>
      `Tensions at Treasury boiled over into a press leak revealing ${role} ${name} held delayed blind-trust divestments in regional bank derivatives during emergency liquidity talks.`,
    scandalSeverity: 'Severe',
    congressPressure:
      'Senate Finance Committee opened an expedited ethics review and warned of market confidence fallout.',
  },
  nsa: {
    briefingContext:
      'Intelligence coordination, covert cyber posture, and NSC interagency clearances.',
    strainedOpening:
      'Sir, the Situation Room process only works when intelligence caveats reach your desk unfiltered. Bypassing NSC deputies for ad-hoc briefings risks blind spots in an acute crisis.',
    cautiousOpening:
      'Interagency intel sharing is holding, though CIA and Pentagon liaisons want tighter boundaries around who sees sensitive covert assessments.',
    alignedOpening:
      'The NSC principals committee is running smoothly, and calibrating our threat warning cadence today will keep every desk synchronized.',
    policyArea: 'NSC intelligence vetting and covert cyber escalation protocols',
    scandalOutlet: 'Capitol Intelligence Monitor',
    scandalHeadline: (name) =>
      `Whistleblower Complaint Accuses ${name} of Mishandling Classified Signal`,
    scandalAllegation: (name, role) =>
      `An Inspector General whistleblower disclosure broke publicly today, alleging ${role} ${name} retained unredacted intercepts on an unauthorized device while feuding with West Wing staff.`,
    scandalSeverity: 'Critical',
    congressPressure:
      'House and Senate Intelligence Committees issued joint demands for an immediate damage assessment.',
  },
  justice: {
    briefingContext:
      'Rule-of-law independence, federal prosecutions, and judicial confirmations.',
    strainedOpening:
      'Main Justice career prosecutors are threatening resignations if White House political staff keep floating charging expectations publicly. Independence is what shields both the Department and your presidency.',
    cautiousOpening:
      'Our litigation docket is manageable, though federal judges and Judiciary senators are scrutinizing every signal coming out of the West Wing.',
    alignedOpening:
      'Justice and the White House Counsel are well coordinated on appellate defense, and a quick check-in on confirmation priorities will keep the pipeline moving.',
    policyArea: 'DOJ firewall boundaries and judicial nominee vetting',
    scandalOutlet: 'Federal Legal Journal',
    scandalHeadline: (name) =>
      `DOJ Watchdog Links ${name} to Quiet Intervention in Enforcement Probe`,
    scandalAllegation: (name, role) =>
      `Following a tense Oval Office exchange, Justice Department sources disclosed emails showing ${role} ${name} privately pressured U.S. Attorneys to delay a politically sensitive subpoena.`,
    scandalSeverity: 'Severe',
    congressPressure:
      'Senate Judiciary Committee demanded full email preservation and emergency oversight testimony.',
  },
  labor: {
    briefingContext:
      'Union mediation, workforce transition grants, and wage-price stability.',
    strainedOpening:
      'Organized labor leaders feel burned after backing your coalition only to be cut out of trade and automation decisions. If wildcat strikes hit key ports or transit lines, my leverage is already depleted.',
    cautiousOpening:
      'Union locals are patient for the moment, though manufacturing councils want tangible reassurance that wage protections remain a core White House priority.',
    alignedOpening:
      'Labor talks across logistics and manufacturing are steady, and aligning on apprenticeship benchmarks will strengthen our industrial rollout.',
    policyArea: 'collective bargaining mediation and industrial transition terms',
    scandalOutlet: 'Metro Labor Gazette',
    scandalHeadline: (name) =>
      `Audit Exposes Undisclosed Union Fund Ties Involving ${name}`,
    scandalAllegation: (name, role) =>
      `Ruptured talks spilled into public view after labor watchdogs uncovered steering of federal workforce grant funds by ${role} ${name} toward a politically allied training consortium.`,
    scandalSeverity: 'Moderate',
    congressPressure:
      'House Education & Workforce Committee scheduled immediate oversight hearings on federal grant allocations.',
  },
  press_secretary: {
    briefingContext:
      'James S. Brady Briefing Room credibility, press corps access, and narrative discipline.',
    strainedOpening:
      'The podium becomes untenable when I am forced to walk back surprise statements I found out about from reporters five minutes before airtime. Either I am in the loop, or the press corps smells chaos.',
    cautiousOpening:
      'We are holding the daily briefing room together, though network correspondents are pressing hard on mixed signals between cabinet agencies.',
    alignedOpening:
      'The briefing room narrative is disciplined right now, and locking in this month’s core message frame will keep reporters focused on our achievements.',
    policyArea: 'podium messaging coordination and advance notice on policy pivots',
    scandalOutlet: 'National Press Wire',
    scandalHeadline: (name) =>
      `Leaked Off-Record Transcripts Catch ${name} Briefing Against Oval Office`,
    scandalAllegation: (name, role) =>
      `Bitter internal friction boiled over after White House correspondents published background transcripts showing ${role} ${name} disparaging senior administration policy behind closed doors.`,
    scandalSeverity: 'Moderate',
    congressPressure:
      'West Wing credibility took a sharp hit as opposition leaders seized on the transcripts during floor debate.',
  },
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function statusFromLoyalty(loyalty: number): CabinetMember['status'] {
  if (loyalty >= 65) return 'Aligned';
  if (loyalty >= 45) return 'Cautious';
  return 'Strained';
}

export function getCabinetHarmonySummary(cabinet: CabinetMember[]) {
  const activeMembers = cabinet.filter(
    (m) => !m.name.toLowerCase().startsWith('acting ')
  );
  const alignedCount = cabinet.filter((m) => m.status === 'Aligned').length;
  const cautiousCount = cabinet.filter((m) => m.status === 'Cautious').length;
  const strainedCount = cabinet.filter((m) => m.status === 'Strained').length;
  const actingCount = cabinet.length - activeMembers.length;

  const avgLoyalty =
    cabinet.length > 0
      ? Math.round(
          cabinet.reduce((acc, m) => acc + m.loyalty, 0) / cabinet.length
        )
      : 0;

  return {
    alignedCount,
    cautiousCount,
    strainedCount,
    actingCount,
    avgLoyalty,
    needsInterventionCount: cautiousCount + strainedCount,
  };
}

export function buildHarmonyScenario(
  member: CabinetMember
): CabinetHarmonyScenario {
  const tpl = DEPARTMENT_TEMPLATES[member.id];
  const isToxic = member.status === 'Strained' || member.loyalty < 45;
  const baseScandalRiskPct = isToxic
    ? member.loyalty < 30
      ? 35
      : 28
    : member.status === 'Cautious'
    ? 8
    : 0;

  const startingRapport = clamp(Math.round(member.loyalty * 0.85 + 8), 18, 88);

  const officialOpening =
    member.status === 'Strained'
      ? tpl.strainedOpening
      : member.status === 'Cautious'
      ? tpl.cautiousOpening
      : tpl.alignedOpening;

  const lastName = member.name.split(' ').slice(-1)[0];

  const round1Choices: CabinetHarmonyChoice[] = [
    {
      id: 'r1_listen',
      label: 'Acknowledge Friction & Invite Candor',
      tone: 'empathetic',
      toneLabel: 'Empathetic',
      promptQuote: `“${lastName}, lay it all on the table. Tell me where my West Wing has undercut your team on ${tpl.policyArea}, and let’s fix the process together.”`,
      rapportDelta: isToxic ? 16 : 12,
      scandalRiskDelta: isToxic ? -10 : -4,
      approvalDelta: 0,
      congressDelta: 0.4,
      officialResponse: isToxic
        ? `“I appreciate finally having this room without aides listening in. Frankly, morale inside my department has been hanging by a thread—but if you mean that, we can rebuild trust.”`
        : `“Thank you, Mr. President. Having direct clarity from you settles most of the noise my deputies have been hearing.”`,
      riskHint: '+Rapport · Lowers leak/scandal risk',
    },
    {
      id: 'r1_compromise',
      label: 'Offer Concrete Policy & Access Bargain',
      tone: 'pragmatic',
      toneLabel: 'Pragmatic',
      promptQuote: `“Give me disciplined execution on this month’s core directive, and I’ll guarantee you direct sign-off on ${tpl.policyArea}.”`,
      rapportDelta: 13,
      scandalRiskDelta: isToxic ? -4 : 0,
      approvalDelta: 0.4,
      congressDelta: 0.6,
      officialResponse: `“That is a workable deal. If my senior staff is back inside the decision loop before press rollouts, I can deliver full departmental backing.”`,
      riskHint: '+Rapport · +Hill/Public coordination',
    },
    {
      id: 'r1_directive',
      label: 'Reassert Chain of Command Calmly',
      tone: 'directive',
      toneLabel: 'Directive',
      promptQuote: `“I value your expertise, ${lastName}, but there is only one elected executive. I need your agency aligned behind the agenda without public caveats.”`,
      rapportDelta: isToxic ? 2 : 6,
      scandalRiskDelta: isToxic ? 6 : 2,
      approvalDelta: 0.3,
      congressDelta: 0,
      officialResponse: isToxic
        ? `“Understood, sir—though issuing orders without fixing why career staff are nervous only pushes dissent deeper into backchannels.”`
        : `“Clear enough, Mr. President. I’ll pass that discipline straight down to my undersecretaries.”`,
      riskHint: 'Modest Rapport · Slight tension if Strained',
    },
    {
      id: 'r1_confront',
      label: 'Demand Loyalty & Press Over Leaks',
      tone: 'confrontational',
      toneLabel: 'Confrontational',
      promptQuote: `“Let’s cut the hedging. Whispers out of your building are hurting this administration, and I expect total loyalty—or I’ll find someone else.”`,
      rapportDelta: -14,
      scandalRiskDelta: isToxic ? 18 : 10,
      approvalDelta: -0.4,
      congressDelta: -0.5,
      officialResponse: isToxic
        ? `“Careful how hard you push that door, Mr. President. People in my building keep receipts when the West Wing turns adversarial.”`
        : `“That tone isn’t necessary, sir. I’ve defended this administration on the Hill—questioning my loyalty puts everyone on edge.”`,
      riskHint: '-Rapport · High risk of exposing hidden scandal',
    },
  ];

  return {
    memberId: member.id,
    memberName: member.name,
    roleTitle: member.roleTitle,
    leaning: member.leaning,
    currentLoyalty: member.loyalty,
    currentStatus: member.status,
    startingRapport,
    isToxic,
    baseScandalRiskPct,
    meetingTitle: `Oval Office 1-on-1 · ${member.roleTitle}`,
    briefingContext: tpl.briefingContext,
    round1: {
      roundNumber: 1,
      topic: 'Opening Posture & Departmental Grievances',
      officialOpening,
      choices: round1Choices,
    },
  };
}

export function buildHarmonyRound2(
  scenario: CabinetHarmonyScenario,
  round1Tone: CabinetHarmonyTone,
  currentRapport: number
): CabinetHarmonyRound {
  const tpl = DEPARTMENT_TEMPLATES[scenario.memberId];
  const lastName = scenario.memberName.split(' ').slice(-1)[0];

  const round2Opening =
    round1Tone === 'confrontational'
      ? `“Before we close, let’s be blunt: my deputies are already fielding calls from reporters and oversight staff. How do you want our working relationship structured from tomorrow morning onward?”`
      : round1Tone === 'empathetic'
      ? `“That clears the air on process. Now we still have to decide how we handle ${tpl.policyArea} when outside critics try to split us apart next week.”`
      : round1Tone === 'pragmatic'
      ? `“On the substance, we are close to an understanding. Give me the closing commitment I can take back to my senior leadership team.”`
      : `“We hear your mandate, Mr. President. Before I step out, clarify how much latitude my office has when tough trade-offs hit Congress.”`;

  const choices: CabinetHarmonyChoice[] = [
    {
      id: 'r2_alliance',
      label: 'Seal Joint Front & Weekly Oval Check-Ins',
      tone: 'empathetic',
      toneLabel: 'Bridge-Building',
      promptQuote: `“Starting Monday, you have a standing 15-minute Friday slot with me—no staff filters—and my full backing when critics come after your department.”`,
      rapportDelta: currentRapport < 45 ? 18 : 14,
      scandalRiskDelta: scenario.isToxic ? -8 : -4,
      approvalDelta: 0.4,
      congressDelta: 0.5,
      officialResponse: `“With direct access and clear backing, I’ll shut down the backchannel chatter myself and put our full team behind your next push.”`,
      riskHint: 'Strongest status recovery · De-escalates scandal exposure',
    },
    {
      id: 'r2_charter',
      label: 'Codify Clear Policy Guardrails Together',
      tone: 'pragmatic',
      toneLabel: 'Structured Deal',
      promptQuote: `“Let’s draft a clean two-page sign-off memo on ${tpl.policyArea} tonight so neither the West Wing nor your career staff gets blindsided.”`,
      rapportDelta: 12,
      scandalRiskDelta: -3,
      approvalDelta: 0.5,
      congressDelta: 0.8,
      officialResponse: `“Put it in writing and every assistant secretary will follow it. Clarity beats speeches every time in Washington.”`,
      riskHint: '+Rapport · Strongest Congressional stability',
    },
    {
      id: 'r2_mandate',
      label: 'Set Strict 30-Day Alignment Benchmark',
      tone: 'directive',
      toneLabel: 'Firm Benchmark',
      promptQuote: `“Take the latitude you need internally, ${lastName}, but in thirty days I expect unified messaging and measurable results on the Hill.”`,
      rapportDelta: scenario.isToxic ? 4 : 7,
      scandalRiskDelta: scenario.isToxic ? 5 : 2,
      approvalDelta: 0.4,
      congressDelta: 0.3,
      officialResponse: `“Fair enough. Judge us by thirty-day deliverables, and keep West Wing comms from freelancing on our turf.”`,
      riskHint: 'Moderate gain · Keeps pressure on toxic relationships',
    },
    {
      id: 'r2_ultimatum',
      label: 'Issue Final Ultimatum & Threaten Audit',
      tone: 'confrontational',
      toneLabel: 'Hard Ultimatum',
      promptQuote: `“If I see one more unauthorized leak or half-hearted defense on television, I’m opening an internal compliance review and replacing you by Friday.”`,
      rapportDelta: -16,
      scandalRiskDelta: scenario.isToxic ? 20 : 12,
      approvalDelta: -0.6,
      congressDelta: -0.8,
      officialResponse: `“If you are threatening a compliance war inside your own Cabinet, don’t be shocked by what comes flying back out into the press.”`,
      riskHint: 'Severe rapport drop · Maximum hidden-scandal trigger risk',
    },
  ];

  return {
    roundNumber: 2,
    topic: 'Closing Alignment & Operational Compact',
    officialOpening: round2Opening,
    choices,
  };
}

export function evaluateHarmonyMeeting(params: {
  scenario: CabinetHarmonyScenario;
  member: CabinetMember;
  month: number;
  round1Choice: CabinetHarmonyChoice;
  round2Choice: CabinetHarmonyChoice;
}): CabinetHarmonyOutcome {
  const { scenario, member, month, round1Choice, round2Choice } = params;
  const tpl = DEPARTMENT_TEMPLATES[member.id];

  const finalRapport = clamp(
    scenario.startingRapport +
      round1Choice.rapportDelta +
      round2Choice.rapportDelta,
    5,
    100
  );

  // Scandal exposure risk only non-trivial when toxic OR player turns confrontational
  const rawRisk =
    scenario.baseScandalRiskPct +
    round1Choice.scandalRiskDelta +
    round2Choice.scandalRiskDelta;
  const scandalRiskPct = clamp(Math.round(rawRisk), 0, 72);

  // Deterministic/probability roll for exposing hidden scandal
  const scandalTriggered =
    scandalRiskPct > 0 && Math.random() * 100 < scandalRiskPct;

  let loyaltyDelta = Math.round(
    (round1Choice.rapportDelta + round2Choice.rapportDelta) * 0.72
  );
  // Bonus boost if both choices were constructive and member was Strained/Cautious
  if (
    round1Choice.rapportDelta >= 12 &&
    round2Choice.rapportDelta >= 12 &&
    member.status !== 'Aligned'
  ) {
    loyaltyDelta += 6;
  }

  if (scandalTriggered) {
    loyaltyDelta = Math.min(loyaltyDelta, -8);
  }

  const newLoyalty = clamp(member.loyalty + loyaltyDelta, 15, 98);
  const newStatus = statusFromLoyalty(newLoyalty);

  const approvalDelta = Number(
    (
      round1Choice.approvalDelta +
      round2Choice.approvalDelta +
      (scandalTriggered ? -1.4 : 0)
    ).toFixed(1)
  );
  const congressDelta = Number(
    (
      round1Choice.congressDelta +
      round2Choice.congressDelta +
      (scandalTriggered ? -1.6 : 0)
    ).toFixed(1)
  );

  let revealedScandal: CabinetScandalEvent | null = null;
  if (scandalTriggered) {
    revealedScandal = {
      id: `scandal-harmony-${member.id}-${month}-${Date.now()}`,
      month,
      departmentId: member.id,
      memberName: member.name,
      roleTitle: member.roleTitle,
      outlet: tpl.scandalOutlet,
      headline: tpl.scandalHeadline(member.name),
      allegationSummary: tpl.scandalAllegation(member.name, member.roleTitle),
      severity: tpl.scandalSeverity,
      congressPressure: tpl.congressPressure,
    };
  }

  const improved =
    (member.status === 'Strained' && newStatus !== 'Strained') ||
    (member.status === 'Cautious' && newStatus === 'Aligned');

  const headline = revealedScandal
    ? `Closed-Door Meeting Backfires: Hidden ${member.roleTitle} Scandal Leaks to Press`
    : improved
    ? `Oval Office 1-on-1 Resolves Friction With ${member.roleTitle} ${member.name}`
    : newStatus === 'Aligned'
    ? `${member.name} Reaffirms Alignment After Oval Office Strategy Session`
    : `Tensions Persist Following Oval Office Session With ${member.name}`;

  const summary = revealedScandal
    ? `During a high-risk 1-on-1 confrontation (${scandalRiskPct}% exposure risk), friction inside ${member.roleTitle} spilled into the open—exposing a hidden ${revealedScandal.severity.toLowerCase()} scandal that demands your immediate Oval Office decision.`
    : improved
    ? `Direct Oval Office dialogue shifted ${member.name} from ${member.status} to ${newStatus} (${member.loyalty}% → ${newLoyalty}% loyalty), stabilizing ${tpl.briefingContext.toLowerCase()}`
    : loyaltyDelta >= 0
    ? `${member.name} left the meeting on steadier footing (${member.loyalty}% → ${newLoyalty}% loyalty; status: ${newStatus}).`
    : `Confrontational pressure widened the rift with ${member.name} (${member.loyalty}% → ${newLoyalty}% loyalty; status: ${newStatus}).`;

  const updatedCounsel = revealedScandal
    ? `Under acute press and Congressional scrutiny after internal conflicts leaked during our Oval Office session.`
    : newStatus === 'Aligned'
    ? `Fully aligned after our Oval Office 1-on-1; my team is moving in lockstep on ${tpl.policyArea}.`
    : newStatus === 'Cautious'
    ? `Holding steady after our 1-on-1 check-in, though my senior staff still expects follow-through on ${tpl.policyArea}.`
    : `Trust remains severely strained after our last meeting; clear policy guardrails are urgently needed on ${tpl.policyArea}.`;

  return {
    memberId: member.id,
    memberName: member.name,
    roleTitle: member.roleTitle,
    month,
    previousStatus: member.status,
    newStatus,
    previousLoyalty: member.loyalty,
    newLoyalty,
    loyaltyDelta: newLoyalty - member.loyalty,
    approvalDelta,
    congressDelta,
    finalRapport,
    scandalRiskPct,
    headline,
    summary,
    updatedCounsel,
    revealedScandal,
  };
}
