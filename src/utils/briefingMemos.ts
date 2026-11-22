import { AdvisorSuggestion, MonthlyBriefing } from '../types/game';

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function buildContextualFallbackMemos(
  briefing: Partial<MonthlyBriefing>,
  month?: number
): AdvisorSuggestion[] {
  const monthLabel = month && month > 0 ? `Month ${month}` : 'this month';
  const domestic =
    cleanText(briefing.domesticIssue) ||
    'Congressional caucus negotiations and agency implementation bottlenecks require White House direction.';
  const economic =
    cleanText(briefing.economicIssue) ||
    'Treasury and market analysts are watching growth, price stability, and household borrowing costs.';
  const foreign =
    cleanText(briefing.foreignIssue) ||
    'Allied capitals and security planners await a clear posture from Washington.';

  return [
    {
      role: 'Chief of Staff',
      title: 'Bipartisan Legislative & Agency Push',
      policyDraft: `Convene House and Senate committee leaders to advance a targeted domestic compromise addressing ${domestic.replace(/\.$/, '')}, backed by clear agency delivery milestones for ${monthLabel}.`,
      speechDraft: `Families expect results, not gridlock. We are bringing leaders together to deliver practical progress on the priorities that matter most this month.`,
    },
    {
      role: 'Treasury Secretary',
      title: 'Treasury Stability & Growth Package',
      policyDraft: `Direct the Treasury and OMB to pair targeted cost-relief measures with disciplined fiscal offsets in response to current pressures: ${economic.replace(/\.$/, '')}.`,
      speechDraft: `A strong economy depends on steady stewardship and lowering everyday costs. Today we are taking measured, responsible steps to protect jobs and growth.`,
    },
    {
      role: 'National Security Advisor',
      title: 'Allied Deterrence & Strategic Outreach',
      policyDraft: `Coordinate an immediate diplomatic and defense readiness directive with key allies to stabilize active theaters and reinforce deterrence regarding ${foreign.replace(/\.$/, '')}.`,
      speechDraft: `America is strongest when we stand shoulder to shoulder with our allies, project steady deterrence, and keep diplomatic channels firmly open.`,
    },
  ];
}

export function ensureStaffOptionMemos(
  briefing: Partial<MonthlyBriefing> | null | undefined,
  month?: number
): AdvisorSuggestion[] {
  const safeBriefing = briefing || {};
  const rawList = Array.isArray(safeBriefing.suggestedDirectives)
    ? safeBriefing.suggestedDirectives
    : [];

  const fallbacks = buildContextualFallbackMemos(safeBriefing, month);
  const normalized: AdvisorSuggestion[] = [];
  const seenTitles = new Set<string>();

  for (let i = 0; i < rawList.length && normalized.length < 3; i++) {
    const item = rawList[i] as Partial<AdvisorSuggestion> | null | undefined;
    if (!item || typeof item !== 'object') continue;

    const fb = fallbacks[normalized.length] || fallbacks[0];
    const role = cleanText(item.role) || fb.role;
    const title = cleanText(item.title) || fb.title;
    let policyDraft = cleanText(item.policyDraft);
    let speechDraft = cleanText(item.speechDraft);

    if (!policyDraft && !speechDraft && !cleanText(item.title)) {
      continue;
    }

    if (!policyDraft) {
      policyDraft = `Execute the "${title}" directive in coordination with the ${role}, focusing on measurable implementation and congressional outreach for ${month ? `Month ${month}` : 'this month'}.`;
    }
    if (!speechDraft) {
      speechDraft = `Today our administration is moving forward with ${title} to deliver clear, accountable results for the American people.`;
    }

    const dedupeKey = title.toLowerCase();
    if (seenTitles.has(dedupeKey)) continue;
    seenTitles.add(dedupeKey);

    normalized.push({
      role,
      title,
      policyDraft,
      speechDraft,
    });
  }

  for (const fb of fallbacks) {
    if (normalized.length >= 3) break;
    if (!seenTitles.has(fb.title.toLowerCase())) {
      seenTitles.add(fb.title.toLowerCase());
      normalized.push(fb);
    }
  }

  return normalized.slice(0, 3);
}

export function normalizeMonthlyBriefing(
  briefing: Partial<MonthlyBriefing> | null | undefined,
  month?: number
): MonthlyBriefing {
  const safe = briefing || {};
  return {
    title:
      cleanText(safe.title) ||
      (month ? `Month ${month} National Briefing` : 'National Executive Briefing'),
    situationSummary:
      cleanText(safe.situationSummary) ||
      'White House senior staff compiled this monthly briefing summarizing domestic, economic, and security developments.',
    domesticIssue:
      cleanText(safe.domesticIssue) ||
      'Congressional negotiations and domestic agency implementation remain underway.',
    economicIssue:
      cleanText(safe.economicIssue) ||
      'Treasury and market analysts are tracking growth, inflation, and borrowing conditions.',
    foreignIssue:
      cleanText(safe.foreignIssue) ||
      'Diplomatic envoys and defense planners are monitoring allied and regional developments.',
    urgentDilemma:
      cleanText(safe.urgentDilemma) ||
      'Balance immediate legislative consensus, economic stability, and national security priorities.',
    suggestedDirectives: ensureStaffOptionMemos(safe, month),
  };
}
