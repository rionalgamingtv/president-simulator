import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  createWindowsInstallerZip,
  resolveSafeAppOrigin,
} from './server/windowsInstaller.ts';

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('[Executive Term UnhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Executive Term UncaughtException]', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-3.1-flash-lite';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your API key in the Settings > Secrets panel.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isRetryableModelError(err: unknown): boolean {
  const status = Number((err as { status?: number })?.status);
  if (Number.isInteger(status) && status >= 400 && status < 500 && status !== 429 && status !== 408) {
    return false;
  }
  return true;
}

async function withRetry<T>(
  fn: (signal: AbortSignal, attempt: number) => Promise<T>,
  maxRetries = 1,
  externalSignal?: AbortSignal
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (externalSignal?.aborted) {
      throw new Error('Request cancelled by client.');
    }

    const controller = new AbortController();
    const timeoutMs = attempt === 0 ? 18000 : 21000;
    let timedOut = false;

    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        fn(controller.signal, attempt),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
            reject(
              new Error(
                'Simulation model request timed out. Retrying or please try again.'
              )
            );
          }, timeoutMs);
        }),
      ]);
    } catch (err: unknown) {
      lastError = timedOut
        ? new Error(
            'Simulation model request timed out. Retrying or please try again.'
          )
        : err;
      if (externalSignal?.aborted) {
        throw lastError;
      }
      if (!isRetryableModelError(err)) {
        throw err;
      }
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, 400 * Math.pow(2, attempt)));
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    }
  }
  throw lastError;
}

function extractBalancedJsonObject(input: string): string | null {
  const start = input.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const ch = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return input.slice(start, i + 1);
      }
    }
  }
  return null;
}

function stripTrailingCommasOutsideStrings(input: string): string {
  return input.replace(/,\s*([}\]])/g, '$1');
}

function parseGeminiJson(rawText?: string) {
  let text = (rawText ?? '').trim();
  if (!text) {
    throw new Error('Simulation engine returned an empty response.');
  }
  if (text.startsWith('```')) {
    text = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const extracted = extractBalancedJsonObject(text) ?? text;
    try {
      parsed = JSON.parse(extracted);
    } catch {
      parsed = JSON.parse(stripTrailingCommasOutsideStrings(extracted));
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Simulation engine returned an unexpected JSON structure.');
  }
  return parsed as Record<string, any>;
}

async function generateGeminiJson(
  ai: GoogleGenAI,
  request: Parameters<GoogleGenAI['models']['generateContent']>[0],
  externalSignal?: AbortSignal
) {
  return withRetry(
    async (signal) => {
      const response = await ai.models.generateContent({
        ...request,
        config: {
          maxOutputTokens: 4096,
          ...(request.config ?? {}),
          abortSignal: signal,
        },
      });
      return parseGeminiJson(response.text);
    },
    1,
    externalSignal
  );
}

function toNum(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function pickEnum<T extends string>(
  val: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof val === 'string' && (allowed as readonly string[]).includes(val)
    ? (val as T)
    : fallback;
}

const VALID_CABINET_IDS = [
  'chief_of_staff',
  'state',
  'defense',
  'treasury',
  'nsa',
  'justice',
  'labor',
  'press_secretary',
] as const;

function normalizeSuggestedDirectives(
  briefingObj: Record<string, any>,
  rootObj: Record<string, any>,
  monthLabel: string,
  context: {
    domesticIssue?: string;
    economicIssue?: string;
    foreignIssue?: string;
  }
) {
  const candidates = [
    briefingObj?.suggestedDirectives,
    briefingObj?.suggested_directives,
    briefingObj?.staffOptionMemos,
    briefingObj?.staffMemos,
    briefingObj?.directives,
    briefingObj?.options,
    rootObj?.suggestedDirectives,
    rootObj?.suggested_directives,
  ];
  const rawList = candidates.find((c) => Array.isArray(c) && c.length > 0) || [];

  const domesticText =
    String(context.domesticIssue || '').trim() ||
    'Congressional caucus negotiations and agency implementation bottlenecks require executive direction.';
  const economicText =
    String(context.economicIssue || '').trim() ||
    'Treasury and market analysts are watching growth, price stability, and household borrowing costs.';
  const foreignText =
    String(context.foreignIssue || '').trim() ||
    'Allied capitals and defense planners await a coordinated posture from Washington.';

  const fallbacks = [
    {
      role: 'Chief of Staff',
      title: 'Bipartisan Legislative & Agency Push',
      policyDraft: `Convene House and Senate committee leaders to advance a targeted domestic compromise addressing ${domesticText.replace(/\.$/, '')}, backed by clear agency milestones for ${monthLabel}.`,
      speechDraft:
        'Families expect results, not gridlock. We are bringing leaders together to deliver practical progress on the priorities that matter most this month.',
    },
    {
      role: 'Treasury Secretary',
      title: 'Treasury Stability & Growth Package',
      policyDraft: `Direct the Treasury and OMB to pair targeted cost-relief measures with disciplined fiscal offsets in response to current pressures: ${economicText.replace(/\.$/, '')}.`,
      speechDraft:
        'A strong economy depends on steady stewardship and lowering everyday costs. Today we are taking measured steps to protect jobs and growth.',
    },
    {
      role: 'National Security Advisor',
      title: 'Allied Deterrence & Strategic Outreach',
      policyDraft: `Coordinate an immediate diplomatic and defense readiness directive with key allies to stabilize active theaters regarding ${foreignText.replace(/\.$/, '')}.`,
      speechDraft:
        'America is strongest when we stand shoulder to shoulder with our allies, project steady deterrence, and keep diplomatic channels firmly open.',
    },
  ];

  const normalized: Array<{
    role: string;
    title: string;
    policyDraft: string;
    speechDraft: string;
  }> = [];
  const seenTitles = new Set<string>();

  for (let i = 0; i < rawList.length && normalized.length < 3; i++) {
    const d = rawList[i];
    if (!d || typeof d !== 'object') continue;
    const fb = fallbacks[normalized.length] || fallbacks[0];
    const role = String(
      d.role || d.advisor || d.sender || d.department || fb.role
    ).trim();
    const title = String(
      d.title || d.subject || d.name || d.headline || ''
    ).trim();
    let policyDraft = String(
      d.policyDraft ||
        d.policy_draft ||
        d.policy ||
        d.directive ||
        d.draft ||
        d.action ||
        ''
    ).trim();
    let speechDraft = String(
      d.speechDraft ||
        d.speech_draft ||
        d.speech ||
        d.messaging ||
        d.remarks ||
        ''
    ).trim();

    if (!title && !policyDraft && !speechDraft) continue;

    const finalTitle = title || fb.title;
    if (!policyDraft) {
      policyDraft = `Execute "${finalTitle}" in coordination with the ${role || fb.role}, setting measurable implementation steps and congressional outreach for ${monthLabel}.`;
    }
    if (!speechDraft) {
      speechDraft = `Today our administration is moving forward with ${finalTitle} to deliver clear, accountable results for the nation.`;
    }

    const dedupeKey = finalTitle.toLowerCase();
    if (seenTitles.has(dedupeKey)) continue;
    seenTitles.add(dedupeKey);

    normalized.push({
      role: role || fb.role,
      title: finalTitle,
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

function normalizeInitialBriefingResponse(raw: Record<string, any>) {
  if (!raw.initialMetrics || !raw.initialBriefing) {
    throw new Error('Initial briefing payload was incomplete.');
  }
  const m = raw.initialMetrics || {};
  const b = raw.initialBlocs || {};
  const mil = raw.initialMilitary || {};
  const inst = raw.initialInstitutions || {};
  const br = raw.initialBriefing || {};

  const domesticIssue = String(br.domesticIssue || '');
  const economicIssue = String(br.economicIssue || '');
  const foreignIssue = String(br.foreignIssue || '');

  return {
    scenarioTitle: String(raw.scenarioTitle || 'Custom National Mandate'),
    initialMetrics: {
      approval: toNum(m.approval, 50),
      congressSupport: toNum(m.congressSupport, 50),
      gdpGrowth: toNum(m.gdpGrowth, 2.2),
      inflation: toNum(m.inflation, 3.1),
      unemployment: toNum(m.unemployment, 4.3),
      diplomaticStanding: toNum(m.diplomaticStanding, 62),
      nationalDebtTrillions: toNum(m.nationalDebtTrillions, 34.5),
      houseSeats: Math.round(toNum(m.houseSeats, 218)),
      senateSeats: Math.round(toNum(m.senateSeats, 50)),
    },
    initialBlocs: {
      workingClass: toNum(b.workingClass, 49),
      suburbanModerates: toNum(b.suburbanModerates, 50),
      techFinance: toNum(b.techFinance, 51),
      seniors: toNum(b.seniors, 48),
      youngVoters: toNum(b.youngVoters, 50),
    },
    initialNews: Array.isArray(raw.initialNews)
      ? raw.initialNews.slice(0, 5).map((item: any) => ({
          outlet: String(item?.outlet || 'National Wire'),
          category: pickEnum(
            item?.category,
            ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
            'politics'
          ),
          headline: String(item?.headline || 'Administration Opens First Month'),
          summary: String(item?.summary || ''),
          tone: pickEnum(
            item?.tone,
            ['positive', 'neutral', 'critical'] as const,
            'neutral'
          ),
        }))
      : [],
    initialMilitary: {
      defconLevel: Math.max(1, Math.min(5, Math.round(toNum(mil.defconLevel, 4)))),
      forceReadiness: toNum(mil.forceReadiness, 84),
      defenseBudgetBillions: toNum(mil.defenseBudgetBillions, 886),
      cyberPosture: pickEnum(
        mil.cyberPosture,
        ['Normal', 'Elevated', 'Active Shield'] as const,
        'Elevated'
      ),
      intelThreatLevel: pickEnum(
        mil.intelThreatLevel,
        ['Guarded', 'Elevated', 'High', 'Severe'] as const,
        'Elevated'
      ),
      intelSummary: String(mil.intelSummary || 'Global theaters under routine monitoring.'),
      operations: Array.isArray(mil.operations)
        ? mil.operations.slice(0, 3).map((op: any) => ({
            name: String(op?.name || 'Operation Sentinel'),
            region: String(op?.region || 'Global'),
            posture: pickEnum(
              op?.posture,
              ['Deterrence', 'Active Strike', 'Humanitarian', 'Cyber Defense', 'Standby'] as const,
              'Deterrence'
            ),
            personnelCount: String(op?.personnelCount || '12,000'),
            statusNote: String(op?.statusNote || 'Operating under standard ROE.'),
          }))
        : [],
    },
    initialInstitutions: {
      fedFundsRate: toNum(inst.fedFundsRate, 4.75),
      fedStance: pickEnum(
        inst.fedStance,
        ['Hawkish', 'Neutral', 'Accommodative'] as const,
        'Neutral'
      ),
      fedChairNote: String(inst.fedChairNote || 'Monitoring inflation expectations closely.'),
      judiciaryClimate: pickEnum(
        inst.judiciaryClimate,
        ['Favorable', 'Split', 'Hostile'] as const,
        'Split'
      ),
      pendingCourtNote: String(inst.pendingCourtNote || 'Executive authority petitions queued on docket.'),
    },
    initialBriefing: {
      title: String(br.title || 'Inaugural Executive Agenda'),
      situationSummary: String(br.situationSummary || ''),
      domesticIssue,
      economicIssue,
      foreignIssue,
      urgentDilemma: String(br.urgentDilemma || ''),
      suggestedDirectives: normalizeSuggestedDirectives(br, raw, 'Month 1', {
        domesticIssue,
        economicIssue,
        foreignIssue,
      }),
    },
  };
}

function normalizeTurnResponse(
  raw: Record<string, any>,
  currentMonth: number,
  scandalTarget?: { id: string; name: string; roleTitle: string } | null
) {
  const root =
    raw.outcome && typeof raw.outcome === 'object'
      ? raw
      : raw.result && typeof raw.result === 'object'
      ? raw.result
      : raw.data && typeof raw.data === 'object'
      ? raw.data
      : raw;

  const rawOutcome =
    root.outcome && typeof root.outcome === 'object'
      ? root.outcome
      : root.turnOutcome && typeof root.turnOutcome === 'object'
      ? root.turnOutcome
      : root.newspaperHeadline || root.outcomeNarrative || root.metricDeltas
      ? root
      : null;
  if (!rawOutcome || typeof rawOutcome !== 'object') {
    throw new Error('Simulation engine response missed required outcome fields.');
  }
  const o = rawOutcome;
  const md = o.metricDeltas || {};
  const vd = o.voterBlocDeltas || {};
  const mu = root.militaryUpdates || root.military_updates || {};
  const iu = root.institutionalUpdates || root.institutional_updates || {};
  const vp = root.vicePresidentUpdate || root.vice_president_update || {};
  const nb = root.nextBriefing || root.next_briefing || {};

  return {
    outcome: {
      newspaperOutlet: String(o.newspaperOutlet || 'The Capital Chronicle'),
      newspaperHeadline: String(o.newspaperHeadline || 'White House Sets New Course'),
      newspaperSubhead: String(o.newspaperSubhead || 'Markets and lawmakers weigh executive action.'),
      outcomeNarrative: String(o.outcomeNarrative || ''),
      advisorReactions: Array.isArray(o.advisorReactions)
        ? o.advisorReactions.slice(0, 4).map((r: any) => ({
            speaker: String(r?.speaker || 'Senior Advisor'),
            role: String(r?.role || 'Cabinet'),
            quote: String(r?.quote || ''),
            stance: pickEnum(
              r?.stance,
              ['supportive', 'skeptical', 'critical'] as const,
              'skeptical'
            ),
          }))
        : [],
      newsWire: Array.isArray(o.newsWire)
        ? o.newsWire.slice(0, 5).map((n: any) => ({
            outlet: String(n?.outlet || 'Capitol Wire'),
            category: pickEnum(
              n?.category,
              ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
              'politics'
            ),
            headline: String(n?.headline || 'Administration Update'),
            summary: String(n?.summary || ''),
            tone: pickEnum(
              n?.tone,
              ['positive', 'neutral', 'critical'] as const,
              'neutral'
            ),
          }))
        : [],
      metricDeltas: {
        approval: toNum(md.approval, 0),
        congressSupport: toNum(md.congressSupport, 0),
        gdpGrowth: toNum(md.gdpGrowth, 0),
        inflation: toNum(md.inflation, 0),
        unemployment: toNum(md.unemployment, 0),
        diplomaticStanding: toNum(md.diplomaticStanding, 0),
        nationalDebtTrillions: toNum(md.nationalDebtTrillions, 0),
      },
      voterBlocDeltas: {
        workingClass: toNum(vd.workingClass, 0),
        suburbanModerates: toNum(vd.suburbanModerates, 0),
        techFinance: toNum(vd.techFinance, 0),
        seniors: toNum(vd.seniors, 0),
        youngVoters: toNum(vd.youngVoters, 0),
      },
      ...(o.midtermSeatShift && typeof o.midtermSeatShift === 'object'
        ? {
            midtermSeatShift: {
              houseDelta: Math.round(toNum(o.midtermSeatShift.houseDelta, 0)),
              senateDelta: Math.round(toNum(o.midtermSeatShift.senateDelta, 0)),
              summary: String(o.midtermSeatShift.summary || ''),
            },
          }
        : {}),
      collapseTriggered: Boolean(o.collapseTriggered),
      ...(o.collapseReason ? { collapseReason: String(o.collapseReason) } : {}),
      legislativeRecord: o.legislativeRecord
        ? {
            recordType: pickEnum(
              o.legislativeRecord.recordType,
              ['Legislation', 'Executive Order', 'Treaty', 'Institutional'] as const,
              'Executive Order'
            ),
            title: String(o.legislativeRecord.title || `Month ${currentMonth} Directive`),
            summary: String(o.legislativeRecord.summary || ''),
            outcomeStatus: pickEnum(
              o.legislativeRecord.outcomeStatus,
              ['Enacted', 'Compromise', 'Blocked'] as const,
              'Enacted'
            ),
          }
        : undefined,
      ...(o.milestone && typeof o.milestone === 'object' && o.milestone.title
        ? {
            milestone: {
              category: pickEnum(
                o.milestone.category,
                ['Political', 'Economic', 'Security', 'Constitutional'] as const,
                'Political'
              ),
              title: String(o.milestone.title),
              description: String(o.milestone.description || ''),
            },
          }
        : {}),
    },
    cabinetUpdates: Array.isArray(root.cabinetUpdates)
      ? root.cabinetUpdates
          .filter((u: any) =>
            (VALID_CABINET_IDS as readonly string[]).includes(String(u?.id))
          )
          .map((u: any) => ({
            id: u.id,
            loyaltyDelta: toNum(u.loyaltyDelta, 0),
            currentCounsel: String(u.currentCounsel || ''),
          }))
      : [],
    vicePresidentUpdate: {
      loyaltyDelta: toNum(vp.loyaltyDelta, 0),
      popularityDelta: toNum(vp.popularityDelta, 0),
      currentCounsel: String(vp.currentCounsel || ''),
    },
    militaryUpdates: {
      defconLevel: Math.max(1, Math.min(5, Math.round(toNum(mu.defconLevel, 4)))),
      readinessDelta: toNum(mu.readinessDelta, 0),
      defenseBudgetDeltaBillions: toNum(mu.defenseBudgetDeltaBillions, 0),
      cyberPosture: pickEnum(
        mu.cyberPosture,
        ['Normal', 'Elevated', 'Active Shield'] as const,
        'Elevated'
      ),
      intelThreatLevel: pickEnum(
        mu.intelThreatLevel,
        ['Guarded', 'Elevated', 'High', 'Severe'] as const,
        'Elevated'
      ),
      intelSummary: String(mu.intelSummary || ''),
      operations: Array.isArray(mu.operations)
        ? mu.operations.slice(0, 3).map((op: any) => ({
            name: String(op?.name || 'Joint Operation'),
            region: String(op?.region || 'Global'),
            posture: pickEnum(
              op?.posture,
              ['Deterrence', 'Active Strike', 'Humanitarian', 'Cyber Defense', 'Standby'] as const,
              'Deterrence'
            ),
            personnelCount: String(op?.personnelCount || '10,000'),
            statusNote: String(op?.statusNote || ''),
          }))
        : [],
    },
    institutionalUpdates: {
      fedRateDelta: toNum(iu.fedRateDelta, 0),
      fedStance: pickEnum(
        iu.fedStance,
        ['Hawkish', 'Neutral', 'Accommodative'] as const,
        'Neutral'
      ),
      fedChairNote: String(iu.fedChairNote || ''),
      judiciaryClimate: pickEnum(
        iu.judiciaryClimate,
        ['Favorable', 'Split', 'Hostile'] as const,
        'Split'
      ),
      pendingCourtNote: String(iu.pendingCourtNote || ''),
    },
    nextBriefing: (() => {
      const domesticIssue = String(
        nb.domesticIssue || 'Congressional floor negotiations and agency oversight continue.'
      );
      const economicIssue = String(
        nb.economicIssue || 'Markets and Treasury officials are monitoring growth and price stability.'
      );
      const foreignIssue = String(
        nb.foreignIssue || 'Diplomatic and security missions remain on active watch.'
      );
      return {
        title: String(nb.title || `Month ${currentMonth + 1} National Briefing`),
        situationSummary: String(
          nb.situationSummary ||
            o.newspaperSubhead ||
            'White House senior staff compiled the next monthly briefing following recent executive actions.'
        ),
        domesticIssue,
        economicIssue,
        foreignIssue,
        urgentDilemma: String(
          nb.urgentDilemma ||
            'Decide how to sustain legislative momentum while managing emerging fiscal and geopolitical pressures.'
        ),
        suggestedDirectives: normalizeSuggestedDirectives(
          nb,
          root,
          `Month ${currentMonth + 1}`,
          {
            domesticIssue,
            economicIssue,
            foreignIssue,
          }
        ),
      };
    })(),
    ...(scandalTarget
      ? {
          cabinetScandal: {
            departmentId: pickEnum(
              root.cabinetScandal?.departmentId,
              VALID_CABINET_IDS,
              scandalTarget.id as (typeof VALID_CABINET_IDS)[number]
            ),
            memberName: String(
              root.cabinetScandal?.memberName || scandalTarget.name
            ),
            roleTitle: String(
              root.cabinetScandal?.roleTitle || scandalTarget.roleTitle
            ),
            outlet: String(
              root.cabinetScandal?.outlet || 'The Washington Chronicle'
            ),
            headline: String(
              root.cabinetScandal?.headline ||
                `Ethics Inquiry Targets ${scandalTarget.roleTitle} ${scandalTarget.name}`
            ),
            allegationSummary: String(
              root.cabinetScandal?.allegationSummary ||
                `Leaked inspector-general memos allege undisclosed contractor conflicts involving ${scandalTarget.roleTitle} ${scandalTarget.name}, prompting urgent White House and Capitol Hill demands for action.`
            ),
            severity: pickEnum(
              root.cabinetScandal?.severity,
              ['Moderate', 'Severe', 'Critical'] as const,
              'Severe'
            ),
            congressPressure: String(
              root.cabinetScandal?.congressPressure ||
                'House Oversight and Senate committee chairs are threatening immediate subpoenas unless the White House responds.'
            ),
          },
        }
      : {}),
  };
}

function formatErrorResponse(err: unknown) {
  const message =
    err instanceof Error ? err.message : 'Unexpected simulation engine error.';
  const rawStatus = Number((err as { status?: number })?.status);
  // Avoid emitting 502/503/504 directly because reverse proxies with
  // error interception replace those statuses with HTML warmup/error pages.
  const status =
    Number.isInteger(rawStatus) &&
    rawStatus >= 400 &&
    rawStatus <= 599 &&
    rawStatus !== 502 &&
    rawStatus !== 503 &&
    rawStatus !== 504
      ? rawStatus
      : 500;
  return { status, error: message };
}

async function runJsonWithKeepAlive(
  res: express.Response,
  fn: (signal: AbortSignal) => Promise<unknown>
) {
  let headersFlushed = false;
  let closed = false;
  const abortController = new AbortController();

  const safeWriteChunk = (chunk: string) => {
    if (closed || res.writableEnded || res.destroyed) return;
    try {
      res.write(chunk);
    } catch {
      closed = true;
    }
  };

  const flushKeepAliveHeaders = () => {
    if (headersFlushed || closed || res.writableEnded || res.destroyed) return;
    headersFlushed = true;
    try {
      res.status(200);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();
    } catch {
      closed = true;
    }
  };

  const initialFlushTimer = setTimeout(() => {
    flushKeepAliveHeaders();
    safeWriteChunk('    ');
  }, 350);

  const keepAliveTimer = setInterval(() => {
    if (closed || res.writableEnded || res.destroyed) return;
    flushKeepAliveHeaders();
    safeWriteChunk('    ');
  }, 1500);

  const onClose = () => {
    closed = true;
    clearTimeout(initialFlushTimer);
    clearInterval(keepAliveTimer);
    abortController.abort();
  };
  res.on('close', onClose);

  try {
    const payload = await fn(abortController.signal);
    clearTimeout(initialFlushTimer);
    clearInterval(keepAliveTimer);
    res.off('close', onClose);
    if (closed || res.writableEnded || res.destroyed) return;
    const serialized = JSON.stringify(payload ?? {});
    if (headersFlushed) {
      res.end(serialized);
    } else {
      res
        .status(200)
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .setHeader('Cache-Control', 'no-cache, no-transform')
        .setHeader('X-Accel-Buffering', 'no')
        .send(serialized);
    }
  } catch (err) {
    clearTimeout(initialFlushTimer);
    clearInterval(keepAliveTimer);
    res.off('close', onClose);
    console.error('[Executive Term API Error]', err);
    if (closed || res.writableEnded || res.destroyed) return;
    const { status, error } = formatErrorResponse(err);
    if (headersFlushed) {
      try {
        res.end(JSON.stringify({ error }));
      } catch {
        // Socket already closed
      }
    } else {
      res.status(status).json({ error });
    }
  }
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_NAME });
  });

  app.get('/api/download/windows-installer', (req, res) => {
    try {
      const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
      const protocol = forwardedProto || req.protocol || 'https';
      const host = req.get('host');
      const requestOrigin = host ? `${protocol}://${host}` : undefined;
      const requestedOrigin =
        typeof req.query.origin === 'string' ? req.query.origin : undefined;

      const appOrigin = resolveSafeAppOrigin(
        requestedOrigin,
        process.env.APP_URL || requestOrigin
      );
      const autoStartOnLogin = req.query.autostart === '1';
      const publicDir = path.resolve(__dirname, 'public');
      const zipBuffer = createWindowsInstallerZip(
        appOrigin,
        publicDir,
        autoStartOnLogin
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="ExecutiveTerm-Windows11-Setup.zip"'
      );
      res.setHeader('Cache-Control', 'no-store');
      res.send(zipBuffer);
    } catch (err) {
      const { status, error } = formatErrorResponse(err);
      res.status(status).json({ error });
    }
  });

function resolvePartyLabel(profile: {
  party?: string;
  coalition?: string;
}): 'Democratic' | 'Independent' | 'Republican' {
  if (profile?.party === 'democratic') return 'Democratic';
  if (profile?.party === 'independent') return 'Independent';
  if (profile?.party === 'republican') return 'Republican';
  if (profile?.coalition === 'center_right') return 'Republican';
  if (profile?.coalition === 'independent_populist') return 'Independent';
  return 'Democratic';
}

function formatServerCalendarLabel(
  month: number,
  startingYear?: number
): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const idx = Math.max(0, Number(month || 1) - 1);
  if (typeof startingYear === 'number' && Number.isFinite(startingYear)) {
    const year = Math.round(startingYear) + Math.floor(idx / 12);
    return `${months[idx % 12]} ${year} (Month ${month})`;
  }
  return `Month ${month}`;
}

  app.post('/api/generate-initial-briefing', async (req, res) => {
    await runJsonWithKeepAlive(res, async (signal) => {
      const { profile, customPremise } = req.body || {};
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const rawYear = Number(profile?.startingYear);
      const startingYear =
        Number.isFinite(rawYear) && rawYear >= 2000 && rawYear <= 2026
          ? Math.round(rawYear)
          : undefined;

      const climateDescriptions: Record<string, string> = {
        standard: 'Balanced Cycle (standard partisan scrutiny and legislative friction)',
        mandate: 'Landslide Mandate (decisive electoral victory, strong Congressional political capital)',
        hardball: 'Partisan Hardball (deeply polarized Capitol, hostile opposition subpoenas, minimal margin for error)',
        honeymoon: 'Bipartisan Honeymoon (cross-aisle Senate cooperation and constructive treaty window)',
        populist_wave: 'Populist Upheaval (anti-establishment anger, working-class mobilization, corporate & trade skepticism)',
        tech_disruption: 'AI & Market Volatility (rapid AI automation booms, grid strain, white-collar anxiety, fierce tech regulation fights)',
      };
      const climateLabel =
        climateDescriptions[String(profile?.difficultyMode || 'standard')] ||
        climateDescriptions.standard;
      const difficultyPrompts: Record<string, string> = {
        easy: 'Easy (Favorable Tailwinds — constructive press, cooperative floor whips, softer initial headwinds)',
        medium: 'Medium (Realistic Presidency — balanced economic & congressional friction)',
        hard: 'Hard (Brutal Crucible — sharp inflation/deficit tension, skeptical electorate, aggressive opposition oversight)',
      };
      const gameDiffLabel =
        difficultyPrompts[String(profile?.gameDifficulty || 'medium')] ||
        difficultyPrompts.medium;

      const prompt = `
Create an inaugural Month 1 National Briefing for a newly inaugurated President in a realistic political simulation.

President Profile:
- Name: ${profile?.name || 'President Jordan Mercer'}
- Political Party: ${partyLabel}
- Coalition: ${profile?.coalition || 'center_left'}
- Background: ${profile?.background || 'governor'}
- Difficulty Setting: ${gameDiffLabel}
- Political Climate Posture: ${climateLabel}
${profile?.governingDoctrine ? `- Historical / Governing Doctrine: ${profile.governingDoctrine}` : ''}
${startingYear ? `- Inauguration Timeline: January ${startingYear} (anchor debt in trillions, Fed Funds rate, inflation, unemployment, defense budget, technology context, and news outlets authentically to ${startingYear}!).` : ''}
- Custom National Scenario Premise: ${customPremise || 'A nation facing moderate inflation, infrastructure decay, and delicate trade negotiations.'}
${partyLabel === 'Independent' ? '- Party Context: Governing as an Independent outside either major party whip; Congress requires cross-aisle coalition building between Democratic and Republican caucuses.' : `- Party Context: Reflect ${partyLabel} Party priorities, intraparty caucus tensions, and opposition pushback in Congress and the press.`}

Return a single JSON object matching this exact shape (keep prose crisp, 1-2 sentences per field, using realistic numbers for ${startingYear || 'the modern era'}):
{
  "scenarioTitle": "short title",
  "initialMetrics": { "approval": 50, "congressSupport": 51, "gdpGrowth": 2.1, "inflation": 3.4, "unemployment": 4.2, "diplomaticStanding": 64, "nationalDebtTrillions": 34.8, "houseSeats": 220, "senateSeats": 51 },
  "initialBlocs": { "workingClass": 49, "suburbanModerates": 51, "techFinance": 50, "seniors": 48, "youngVoters": 52 },
  "initialNews": [ { "outlet": "string", "category": "economy|foreign|domestic|defense|politics", "headline": "string", "summary": "1 sentence", "tone": "positive|neutral|critical" } ] (4 items),
  "initialMilitary": {
    "defconLevel": 4, "forceReadiness": 84, "defenseBudgetBillions": 886,
    "cyberPosture": "Normal|Elevated|Active Shield",
    "intelThreatLevel": "Guarded|Elevated|High|Severe",
    "intelSummary": "1 sentence",
    "operations": [ { "name": "string", "region": "string", "posture": "Deterrence|Active Strike|Humanitarian|Cyber Defense|Standby", "personnelCount": "string", "statusNote": "1 sentence" } ] (2 items)
  },
  "initialInstitutions": {
    "fedFundsRate": 4.75, "fedStance": "Hawkish|Neutral|Accommodative", "fedChairNote": "1 sentence",
    "judiciaryClimate": "Favorable|Split|Hostile", "pendingCourtNote": "1 sentence"
  },
  "initialBriefing": {
    "title": "string", "situationSummary": "2 sentences", "domesticIssue": "1 sentence", "economicIssue": "1 sentence", "foreignIssue": "1 sentence", "urgentDilemma": "1-2 sentences",
    "suggestedDirectives": [ { "role": "string", "title": "string", "policyDraft": "2 sentences", "speechDraft": "1-2 sentences" } ] (3 items)
  }
}`;

      return await withRetry(
        async (attemptSignal) => {
          const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
              abortSignal: attemptSignal,
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              systemInstruction:
                'You are a grounded, non-partisan political, military, and macroeconomic simulation engine. Return valid JSON only.',
              responseMimeType: 'application/json',
            },
          });
          return normalizeInitialBriefingResponse(parseGeminiJson(response.text));
        },
        1,
        signal
      );
    });
  });

  app.post('/api/replace-cabinet', async (req, res) => {
    await runJsonWithKeepAlive(res, async () => {
      const {
        profile,
        vicePresident,
        currentMember,
        replacementDirection,
        metrics,
      } = req.body || {};
      const ai = getAIClient();

      const senateSeats = Number(metrics?.senateSeats ?? 50);
      const houseSeats = Number(metrics?.houseSeats ?? 218);
      const congressSupport = Number(metrics?.congressSupport ?? 50);
      const approval = Number(metrics?.approval ?? 48);
      const partyLabel = resolvePartyLabel(profile);

      const prompt = `
President ${profile?.name || 'Jordan Mercer'} (Political Party: ${partyLabel}, Coalition: ${profile?.coalition}, Vice President ${vicePresident?.name || 'N/A'}) is nominating a replacement for ${currentMember?.roleTitle || 'Cabinet Secretary'} (currently ${currentMember?.name}).
Player's nominee preference / direction: "${replacementDirection || 'Appoint a seasoned, Senate-confirmable specialist aligned with current administration priorities.'}"
Congressional Context:
- Administration Political Party: ${partyLabel}
- Senate Coalition Seats: ${senateSeats}/100
- House Coalition Seats: ${houseSeats}/435
- Congressional Support: ${congressSupport}%
- Presidential Approval: ${approval}%

Party & Senate Dynamics:
- ${partyLabel === 'Independent' ? 'As an Independent White House without an automatic majority party whip, confirmation depends heavily on bipartisan Senate credibility across both Democratic and Republican caucuses.' : `Model confirmation reactions across the ${partyLabel} caucus (moderates vs. ideological wing) and the opposition party in the Senate.`}

Generate a realistic replacement Cabinet nominee and evaluate how Senate & Congressional leadership react:
- bipartisanAppeal: integer from -12 (highly polarizing/unqualified/hyper-partisan) to +12 (broad bipartisan consensus/respected specialist/moderate compromise).
- loyalty: integer 60-94.
- competence: integer 62-95.
- Provide BOTH a confirmation headline/committee summary (if confirmed) AND a rejection headline/committee summary (if voted down) so the roll-call outcome matches cleanly.`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a political simulation engine modeling U.S. Cabinet nominations and Senate confirmation votes. Evaluate bipartisan appeal honestly based on the player nominee prompt.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              leaning: { type: Type.STRING },
              loyalty: { type: Type.INTEGER },
              competence: { type: Type.INTEGER },
              bipartisanAppeal: { type: Type.INTEGER },
              currentCounsel: { type: Type.STRING },
              confirmHeadline: { type: Type.STRING },
              rejectHeadline: { type: Type.STRING },
              confirmCommitteeNote: { type: Type.STRING },
              rejectCommitteeNote: { type: Type.STRING },
            },
            required: [
              'name',
              'leaning',
              'loyalty',
              'competence',
              'bipartisanAppeal',
              'currentCounsel',
              'confirmHeadline',
              'rejectHeadline',
              'confirmCommitteeNote',
              'rejectCommitteeNote',
            ],
          },
        },
      });
      const appeal = Math.max(-12, Math.min(12, Number(parsed.bipartisanAppeal || 0)));

      const supportShift = (congressSupport - 50) * 0.14;
      const approvalShift = (approval - 48) * 0.08;
      const appealShift = appeal * 0.65;
      const rawYea = Math.round(senateSeats + supportShift + approvalShift + appealShift);
      const senateYea = Math.max(28, Math.min(82, rawYea));
      const senateNay = 100 - senateYea;

      const vpCanBreakTie = Number(vicePresident?.loyalty ?? 70) >= 30;
      const vpTieBreakerUsed = senateYea === 50 && vpCanBreakTie;
      const approved = senateYea >= 51 || vpTieBreakerUsed;

      const houseSupportPercent = Math.max(
        22,
        Math.min(
          85,
          Math.round((houseSeats / 435) * 100 + appeal * 1.1 + (congressSupport - 50) * 0.25)
        )
      );

      const voteMarginLabel = vpTieBreakerUsed
        ? `Confirmed 50–50 (VP ${vicePresident?.name || 'Tie-Break'})`
        : approved
        ? `Confirmed ${senateYea}–${senateNay}`
        : `Rejected ${senateYea}–${senateNay}`;

      const congressDelta = approved
        ? appeal >= 5
          ? 2.0
          : senateYea <= 52
          ? -1.0
          : 0.5
        : -3.5;

      const approvalDelta = approved
        ? appeal >= 5
          ? 0.8
          : 0.2
        : -1.6;

      const nomineeName = String(parsed.name || 'Acting Nominee');
      const leaning = String(parsed.leaning || 'Consensus Pragmatist');
      const currentCounsel = String(
        parsed.currentCounsel ||
          'Ready to execute administration priorities and stabilize agency operations.'
      );
      const confirmHeadline = String(
        parsed.confirmHeadline ||
          `Senate Confirms ${nomineeName} as ${currentMember?.roleTitle || 'Cabinet Secretary'}`
      );
      const rejectHeadline = String(
        parsed.rejectHeadline ||
          `Senate Rejects Nomination of ${nomineeName} for ${currentMember?.roleTitle || 'Cabinet Secretary'}`
      );
      const confirmCommitteeNote = String(
        parsed.confirmCommitteeNote ||
          'Bipartisan floor votes cleared the nomination after committee hearings.'
      );
      const rejectCommitteeNote = String(
        parsed.rejectCommitteeNote ||
          'Defections across moderate and opposition caucuses stalled floor confirmation.'
      );

      return {
        departmentId: currentMember?.id,
        roleTitle: currentMember?.roleTitle,
        previousName: currentMember?.name,
        nomineeName,
        leaning,
        loyalty: Math.max(40, Math.min(96, Number(parsed.loyalty || 80))),
        competence: Math.max(50, Math.min(96, Number(parsed.competence || 82))),
        currentCounsel,
        approved,
        senateYea,
        senateNay,
        houseSupportPercent,
        vpTieBreakerUsed,
        voteMarginLabel,
        confirmationHeadline: approved ? confirmHeadline : rejectHeadline,
        committeeSummary: approved ? confirmCommitteeNote : rejectCommitteeNote,
        congressDelta,
        approvalDelta,
      };
    });
  });

  app.post('/api/replace-joint-chiefs', async (req, res) => {
    await runJsonWithKeepAlive(res, async () => {
      const { profile, currentJcs, replacementDirection, metrics } = req.body || {};
      const ai = getAIClient();

      const senateSeats = Number(metrics?.senateSeats ?? 50);
      const houseSeats = Number(metrics?.houseSeats ?? 218);
      const congressSupport = Number(metrics?.congressSupport ?? 50);
      const approval = Number(metrics?.approval ?? 48);
      const partyLabel = resolvePartyLabel(profile);

      const prompt = `
President ${profile?.name || 'Jordan Mercer'} (Political Party: ${partyLabel}) is nominating a permanent Chair of the Joint Chiefs of Staff to succeed ${currentJcs?.name || 'Acting Chair'}.
Player's nominee preference / doctrine / background: "${replacementDirection || 'Appoint a seasoned combat-tested general or admiral with strong bipartisan credibility and strategic deterrence expertise.'}"
Congressional Context:
- Senate Coalition Seats: ${senateSeats}/100
- House Coalition Seats: ${houseSeats}/435
- Congressional Support: ${congressSupport}%
- Presidential Approval: ${approval}%

Generate a realistic military nominee and evaluate how the Senate Armed Services Committee and Congress react:
- name: full military name with rank (e.g., General Marcus Vance, Admiral Elena Rostova)
- branch: military branch (Army, Navy, Air Force, Marine Corps, Space Force)
- doctrine: strategic doctrine (e.g., Forward Deterrence, Coalition Integration, Decisive Air-Land Strike, Maritime Dominance)
- loyalty: integer 60-95
- competence: integer 65-98
- bipartisanAppeal: integer from -12 to +12
- currentCounsel: 1 sentence on defense priorities
- confirmHeadline: Senate confirmation headline
- rejectHeadline: Senate rejection headline
- confirmCommitteeNote: Senate Armed Services confirmation summary
- rejectCommitteeNote: Senate Armed Services rejection summary
`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a military and political simulation engine modeling U.S. Senate Armed Services Committee confirmation votes for the Chair of the Joint Chiefs of Staff. Return valid JSON only.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              branch: { type: Type.STRING },
              doctrine: { type: Type.STRING },
              loyalty: { type: Type.INTEGER },
              competence: { type: Type.INTEGER },
              bipartisanAppeal: { type: Type.INTEGER },
              currentCounsel: { type: Type.STRING },
              confirmHeadline: { type: Type.STRING },
              rejectHeadline: { type: Type.STRING },
              confirmCommitteeNote: { type: Type.STRING },
              rejectCommitteeNote: { type: Type.STRING },
            },
            required: [
              'name',
              'branch',
              'doctrine',
              'loyalty',
              'competence',
              'bipartisanAppeal',
              'currentCounsel',
              'confirmHeadline',
              'rejectHeadline',
              'confirmCommitteeNote',
              'rejectCommitteeNote',
            ],
          },
        },
      });

      const appeal = Math.max(-12, Math.min(12, Number(parsed.bipartisanAppeal || 0)));
      const supportShift = (congressSupport - 50) * 0.14;
      const approvalShift = (approval - 48) * 0.08;
      const appealShift = appeal * 0.65;
      const rawYea = Math.round(senateSeats + supportShift + approvalShift + appealShift);
      const senateYea = Math.max(30, Math.min(88, rawYea));
      const senateNay = 100 - senateYea;
      const approved = senateYea >= 51;

      const nomineeName = String(parsed.name || 'General Arthur Sterling');
      const branch = String(parsed.branch || 'Joint Services');
      const doctrine = String(parsed.doctrine || 'Forward Deterrence');
      const loyalty = Math.max(40, Math.min(96, Number(parsed.loyalty || 85)));
      const competence = Math.max(50, Math.min(98, Number(parsed.competence || 88)));
      const currentCounsel = String(parsed.currentCounsel || 'Readiness and force posture are secure across all regional commands.');
      const confirmHeadline = String(parsed.confirmHeadline || `Senate Confirms ${nomineeName} as Chair of the Joint Chiefs of Staff`);
      const rejectHeadline = String(parsed.rejectHeadline || `Senate Rejects Nomination of ${nomineeName} for Joint Chiefs Chair`);
      const confirmCommitteeNote = String(parsed.confirmCommitteeNote || 'Armed Services Committee voted overwhelmingly to confirm the nominee.');
      const rejectCommitteeNote = String(parsed.rejectCommitteeNote || 'Bipartisan skepticism in committee stalled the confirmation vote.');

      const congressDelta = approved ? (appeal >= 5 ? 1.5 : 0.5) : -2.5;
      const approvalDelta = approved ? 0.6 : -1.2;

      return {
        approved,
        senateYea,
        senateNay,
        voteMarginLabel: approved ? `Confirmed ${senateYea}–${senateNay}` : `Rejected ${senateYea}–${senateNay}`,
        nomineeName,
        branch,
        doctrine,
        loyalty,
        competence,
        currentCounsel,
        confirmationHeadline: approved ? confirmHeadline : rejectHeadline,
        committeeSummary: approved ? confirmCommitteeNote : rejectCommitteeNote,
        congressDelta,
        approvalDelta,
      };
    });
  });

  app.post('/api/simulate-turn', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      blocs,
      cabinet,
      military,
      institutions,
      currentBriefing,
      policyDirective,
      personalAction,
      publicMessaging,
      recentHistory,
      reelectionCampaign,
    } = req.body || {};

    const cleanPolicy =
      typeof policyDirective === 'string' ? policyDirective.trim() : '';
    const cleanPersonal =
      typeof personalAction === 'string' ? personalAction.trim() : '';

    if (!cleanPolicy && !cleanPersonal) {
      return res.status(400).json({
        error:
          'Please write an executive policy directive or choose an unscripted presidential action before advancing the month.',
      });
    }

    await runJsonWithKeepAlive(res, async (signal) => {
      const ai = getAIClient();
      const isMidterm = currentMonth === 24 && profile?.termLength === 48;
      const isFinalMonth = currentMonth >= (profile?.termLength || 48);
      const validCabinetList = Array.isArray(cabinet)
        ? cabinet.filter(
            (c: { id?: string; name?: string; roleTitle?: string }) =>
              c && typeof c.id === 'string' && typeof c.name === 'string'
          )
        : [];
      const diffKey = String(profile?.gameDifficulty || 'medium');
      const scandalRollChance =
        diffKey === 'easy'
          ? cleanPersonal.length > 0
            ? 0.14
            : 0.1
          : diffKey === 'hard'
          ? cleanPersonal.length > 0
            ? 0.38
            : 0.3
          : cleanPersonal.length > 0
          ? 0.28
          : 0.22;
      const shouldTriggerScandal =
        !isFinalMonth &&
        currentMonth >= 2 &&
        validCabinetList.length > 0 &&
        Math.random() < scandalRollChance;
      const scandalTarget = shouldTriggerScandal
        ? validCabinetList[Math.floor(Math.random() * validCabinetList.length)]
        : null;

      const historySummary = Array.isArray(recentHistory)
        ? recentHistory
            .slice(-4)
            .map(
              (h: {
                month: number;
                outcome?: { newspaperHeadline?: string };
                policyDirective?: string;
              }) =>
                `Month ${h.month}: Directive="${(h.policyDirective || '').slice(0, 140)}" -> Headline="${h.outcome?.newspaperHeadline || ''}"`
            )
            .join('\n')
        : 'First month in office.';

      const cabinetSummary = Array.isArray(cabinet)
        ? cabinet
            .map(
              (c: { id: string; roleTitle: string; name: string; leaning?: string; loyalty: number }) =>
                `${c.id} (${c.roleTitle}): ${c.name} [${c.leaning || ''}], loyalty ${c.loyalty}%`
            )
            .join(' | ')
        : '';

      const opsSummary = Array.isArray(military?.operations)
        ? military.operations
            .map(
              (o: { name: string; region: string; posture: string }) =>
                `${o.name} [${o.region}, ${o.posture}]`
            )
            .join('; ')
        : 'Standard peacetime readiness';

      const jcs = military?.jointChiefsChair
        ? `${military.jointChiefsChair.name} (${military.jointChiefsChair.branch}, ${military.jointChiefsChair.doctrine})`
        : 'Joint Chiefs Chair';

      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const partyLabel = resolvePartyLabel(profile);

      const turnClimateLabels: Record<string, string> = {
        standard: 'Balanced Cycle',
        mandate: 'Landslide Mandate (high political capital, strong Congressional leverage)',
        hardball: 'Partisan Hardball (polarized Congress, aggressive oversight, fierce opposition media)',
        honeymoon: 'Bipartisan Honeymoon (cross-aisle dealmaking appetite in Senate & House)',
        populist_wave: 'Populist Upheaval (anti-establishment wave, working-class urgency, institution skepticism)',
        tech_disruption: 'AI & Market Volatility (rapid AI workforce shifts, gigawatt grid strain, tech policy battles)',
      };
      const turnClimateText =
        turnClimateLabels[String(profile?.difficultyMode || 'standard')] ||
        turnClimateLabels.standard;
      const turnDifficultyLabels: Record<string, string> = {
        easy: 'Easy (Favorable Tailwinds — constructive legislative dealmaking, forgiving voter mood, softer negative shocks)',
        medium: 'Medium (Realistic Presidency — balanced trade-offs and credible congressional resistance)',
        hard: 'Hard (Brutal Crucible — hyper-critical media, tough floor resistance, sharper inflation/approval penalties for missteps)',
      };
      const turnDifficultyText =
        turnDifficultyLabels[diffKey] || turnDifficultyLabels.medium;

      const isHistoricalEra = Boolean(
        profile?.historicalScenarioId ||
          (typeof profile?.startingYear === 'number' && profile.startingYear < 2000)
      );
      const historicalGuidance = isHistoricalEra
        ? `\n- HISTORICAL SCENARIO ACCURACY MODE (${profile?.startingYear || 'Historical Era'}): Keep ALL news outlets, geopolitical crises, technologies, congressional coalitions, military doctrines, and economic magnitudes strictly authentic to ${calendarDateLabel} (zero modern anachronisms like internet/AI/modern outlets if set in the 20th century!). Explicitly reflect historical turning points or counter-factual divergence relative to the real-world benchmark.${profile?.historicalBenchmarkNote ? ` Benchmark context: ${profile.historicalBenchmarkNote}` : ''}`
        : '';

      const prompt = `
Simulate ${calendarDateLabel} of a ${profile?.termLength || 48}-month presidential administration.

PRESIDENT, VICE PRESIDENT & POLITICAL CONTEXT:
- President: ${profile?.name} (Political Party: ${partyLabel}, Coalition: ${profile?.coalition}, former ${profile?.background})${profile?.governingDoctrine ? `\n- President's Governing Style / Doctrine: ${profile.governingDoctrine}` : ''}
- Difficulty Setting: ${turnDifficultyText}
- Political Climate Posture: ${turnClimateText}${historicalGuidance}
- Party Dynamics: ${partyLabel === 'Independent' ? 'Governing as an Independent without an automatic House/Senate party whip; major bills require cross-aisle deals with both Democratic and Republican caucuses, while partisan media may attack from both flanks.' : `Governing as a ${partyLabel} President; reflect intraparty ${partyLabel} caucus alignment/defections, opposition party pushback in Congress, and partisan/independent voter reactions.`}
- Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'} (${vicePresident?.leaning || 'Moderate'}, loyalty ${vicePresident?.loyalty || 80}%)
- Scenario: ${scenarioTitle}
- Current Date / Month: ${calendarDateLabel} of ${profile?.termLength || 48}${profile?.startingYear ? ` (Keep macroeconomic scale, technology, geopolitics, and news references authentic to this ${profile.startingYear}+ timeline!)` : ''}
- Is Midterm Election Month (Month 24): ${isMidterm ? 'YES - calculate realistic midterm seat shifts based on approval and economy!' : 'NO'}
- Is Final Month of Term: ${isFinalMonth ? 'YES' : 'NO'}
- Re-Election Campaign Status: ${reelectionCampaign?.decision === 'running' ? `RUNNING FOR RE-ELECTION against ${reelectionCampaign.opponentName} (${reelectionCampaign.opponentParty}), projected vote ${reelectionCampaign.projectedVoteShare}% (${reelectionCampaign.battlegroundEdge}). Weave campaign trail dynamics, opponent contrast, swing-state polling, and election stakes into outcomes and briefings.` : reelectionCampaign?.decision === 'declined' ? 'DECLINED RE-ELECTION — President is completing the remainder of the current term without running a campaign; reflect legacy-focused governing and post-partisanship.' : 'Undecided on re-election bid.'}

CURRENT STATE BEFORE THIS TURN:
- Approval: ${metrics?.approval}% | Congress Support: ${metrics?.congressSupport}%
- House Seats: ${metrics?.houseSeats}/435 | Senate Seats: ${metrics?.senateSeats}/100
- GDP Growth: ${metrics?.gdpGrowth}% | Inflation: ${metrics?.inflation}% | Unemployment: ${metrics?.unemployment}%
- National Debt: $${metrics?.nationalDebtTrillions}T | Diplomatic Standing: ${metrics?.diplomaticStanding}/100
- Voter Blocs: Working Class ${blocs?.workingClass}%, Suburban Moderates ${blocs?.suburbanModerates}%, Tech & Finance ${blocs?.techFinance}%, Seniors ${blocs?.seniors}%, Young Voters ${blocs?.youngVoters}%
- Appointed Cabinet & Senior Advisors: ${cabinetSummary}
- Military & Intelligence: Chair of Joint Chiefs ${jcs}, DEFCON ${military?.defconLevel}, Readiness ${military?.forceReadiness}%, Cyber ${military?.cyberPosture}, Threat ${military?.intelThreatLevel}, Active Ops: ${opsSummary}
- Federal Reserve & Judiciary: Fed Funds ${institutions?.fedFundsRate}% (${institutions?.fedStance}), Courts ${institutions?.judiciaryClimate}

RECENT HISTORY:
${historySummary}

THIS MONTH'S BRIEFING PRESENTED TO THE PRESIDENT:
Title: ${currentBriefing?.title}
Summary: ${currentBriefing?.situationSummary}
Urgent Dilemma: ${currentBriefing?.urgentDilemma}

THE PRESIDENT'S FREE-FORM POLICY DIRECTIVE (including any military or cabinet orders):
"${cleanPolicy || 'No formal legislative or military directive issued this month; President prioritized off-the-clock / unscripted actions.'}"

THE PRESIDENT'S PERSONAL / OFF-THE-CLOCK / UNSCRIPTED ACTION (sports, nightlife, travel, stunts, or controversies):
"${cleanPersonal || 'Standard White House schedule; no unusual off-the-clock outings.'}"

THE PRESIDENT'S PUBLIC MESSAGING / SPEECH:
"${(publicMessaging || 'No formal public address issued.').trim()}"

EVALUATION RULES:
1. Judge BOTH official policy directives AND personal/off-the-clock actions on realism, second-order economic/political trade-offs, Congressional feasibility, military escalation/de-escalation consequences, cultural optics, Ethics/Oversight scrutiny, and alignment with the appointed Vice President, Cabinet, Joint Chiefs Chair, and Press Secretary.
2. ALWAYS MAKE NEWS & CONGRESSIONAL REACTION FOR EVERY ACTION (never ignore or gloss over personalAction): whether the President executes legislation, military orders, sports outings, or extreme personal/vice controversies (such as hiring prostitutes, smoking crack / substance abuse, illicit parties, bribes, or reckless stunts):
   - Cover the exact action squarely in the front-page newspaperHeadline, newsWire (3 distinct stories), and explicit Congressional reaction (House & Senate leadership reactions in outcomeNarrative / advisorReactions, plus an Oversight/Ethics/Censure legislativeRecord when scandalous).
   - Keep all coverage strictly non-explicit (no pornographic or graphic substance instructions), written in sharp Washington investigative journalism / political-thriller style (Secret Service visitor logs, whistleblower tips, Ethics Committee inquiries, bipartisan condemnation, and polling fallout).
   - Reflect genuine populist/cultural upside for relatable stunts (diners, sports arenas) alongside criticism if crises are ignored, or severe scandal/oversight fallout for vice/ethics breaches.
3. Keep metricDeltas realistic for a single month:
   - approval delta usually between -8 and +7 (extreme moves up to -14/+11)
   - congressSupport delta between -9 and +8
   - gdpGrowth delta between -0.8 and +0.6
   - inflation delta between -0.7 and +0.8
   - unemployment delta between -0.5 and +0.6
   - diplomaticStanding delta between -10 and +8
   - nationalDebtTrillions delta between -0.15 and +0.45
   - voterBlocDeltas between -10 and +9 per bloc
4. Keep every field crisp and tight so simulation stays snappy:
   - outcomeNarrative: 2 concise paragraphs (~90 words total)
   - advisorReactions: 2 items (1 sentence each)
   - newsWire: 3 items (1 sentence summary each)
   - cabinetUpdates: 3 most affected IDs from [chief_of_staff, state, defense, treasury, nsa, justice, labor, press_secretary]
    - nextBriefing: concise Month ${currentMonth + 1} briefing + EXACTLY 3 complete advisor suggestedDirectives (Staff Option Memos), each with non-empty role, title, policyDraft, and speechDraft

Return ONLY a single JSON object matching this exact schema:
{
  "outcome": {
    "newspaperOutlet": "string",
    "newspaperHeadline": "string",
    "newspaperSubhead": "string",
    "outcomeNarrative": "string (~90 words)",
    "advisorReactions": [{ "speaker": "string", "role": "string", "quote": "1 sentence", "stance": "supportive|skeptical|critical" }],
    "newsWire": [{ "outlet": "string", "category": "economy|foreign|domestic|defense|politics", "headline": "string", "summary": "1 sentence", "tone": "positive|neutral|critical" }],
    "metricDeltas": { "approval": number, "congressSupport": number, "gdpGrowth": number, "inflation": number, "unemployment": number, "diplomaticStanding": number, "nationalDebtTrillions": number },
    "voterBlocDeltas": { "workingClass": number, "suburbanModerates": number, "techFinance": number, "seniors": number, "youngVoters": number },
    ${isMidterm ? '"midtermSeatShift": { "houseDelta": integer, "senateDelta": integer, "summary": "1 sentence" },' : ''}
    "collapseTriggered": boolean,
    "collapseReason": "string (only if collapseTriggered is true)",
    "legislativeRecord": { "recordType": "Legislation|Executive Order|Treaty|Institutional", "title": "string", "summary": "1 sentence", "outcomeStatus": "Enacted|Compromise|Blocked" },
    "milestone": { "category": "Political|Economic|Security|Constitutional", "title": "string", "description": "1 sentence" }
  },
  "cabinetUpdates": [{ "id": "chief_of_staff|state|defense|treasury|nsa|justice|labor|press_secretary", "loyaltyDelta": number, "currentCounsel": "1 sentence" }],
  "vicePresidentUpdate": { "loyaltyDelta": number, "popularityDelta": number, "currentCounsel": "1 sentence" },
  "militaryUpdates": {
    "defconLevel": 1-5, "readinessDelta": number, "defenseBudgetDeltaBillions": number,
    "cyberPosture": "Normal|Elevated|Active Shield", "intelThreatLevel": "Guarded|Elevated|High|Severe",
    "intelSummary": "1 sentence",
    "operations": [{ "name": "string", "region": "string", "posture": "Deterrence|Active Strike|Humanitarian|Cyber Defense|Standby", "personnelCount": "string", "statusNote": "1 sentence" }]
  },
  "institutionalUpdates": {
    "fedRateDelta": number, "fedStance": "Hawkish|Neutral|Accommodative", "fedChairNote": "1 sentence",
    "judiciaryClimate": "Favorable|Split|Hostile", "pendingCourtNote": "1 sentence"
  },
  "nextBriefing": {
    "title": "string", "situationSummary": "2 sentences", "domesticIssue": "1 sentence", "economicIssue": "1 sentence", "foreignIssue": "1 sentence", "urgentDilemma": "1-2 sentences",
    "suggestedDirectives": [{ "role": "string", "title": "string", "policyDraft": "2 sentences", "speechDraft": "1-2 sentences" }]
  }${
    scandalTarget
      ? `,
  "cabinetScandal": {
    "departmentId": "${scandalTarget.id}",
    "memberName": "${scandalTarget.name}",
    "roleTitle": "${scandalTarget.roleTitle}",
    "outlet": "string",
    "headline": "breaking ethics/scandal headline about ${scandalTarget.name}",
    "allegationSummary": "2 sentences detailing a grounded political/financial/ethics/leak scandal (non-explicit)",
    "severity": "Moderate|Severe|Critical",
    "congressPressure": "1 sentence on Oversight Committee reaction"
  }`
      : ''
  }
}`;

      return await withRetry(
        async (attemptSignal) => {
          const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
              abortSignal: attemptSignal,
              maxOutputTokens: 4096,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              systemInstruction:
                'You are the simulation engine for Executive Term, a political, economic, cabinet, and military simulator. Always include both "outcome" and "nextBriefing" (with exactly 3 complete "suggestedDirectives" staff option memos) in a single valid JSON object.',
              responseMimeType: 'application/json',
            },
          });
          return normalizeTurnResponse(
            parseGeminiJson(response.text),
            currentMonth,
            scandalTarget
              ? {
                  id: scandalTarget.id,
                  name: scandalTarget.name,
                  roleTitle: scandalTarget.roleTitle,
                }
              : null
          );
        },
        1,
        signal
      );
    });
  });

  app.post('/api/evaluate-term', async (req, res) => {
    await runJsonWithKeepAlive(res, async () => {
      const {
        profile,
        scenarioTitle,
        metrics,
        blocs,
        history,
        reelectionCampaign,
      } = req.body || {};
      const ai = getAIClient();

      const keyTurns = Array.isArray(history)
        ? history
            .slice(-28)
            .map(
              (h: {
                month: number;
                policyDirective?: string;
                outcome?: { newspaperHeadline?: string };
              }) =>
                `M${h.month}: ${h.outcome?.newspaperHeadline || ''} (${(h.policyDirective || '').slice(0, 100)})`
            )
            .join('\n')
        : '';

      const partyLabel = resolvePartyLabel(profile);

      const prompt = `
Write a Presidential Legacy Evaluation for ${profile?.name} (Political Party: ${partyLabel}, Coalition: ${profile?.coalition}, former ${profile?.background}${profile?.startingYear ? `, inaugurated Jan ${profile.startingYear}` : ''}) who governed through "${scenarioTitle}" for ${history?.length || 0} months.
${profile?.governingDoctrine ? `Governing Doctrine: ${profile.governingDoctrine}` : ''}
${profile?.historicalBenchmarkNote ? `Historical Scenario Benchmark (grade how well the administration matched or surpassed real history): ${profile.historicalBenchmarkNote}` : ''}
Re-Election Decision: ${reelectionCampaign?.decision === 'running' ? `Ran an active re-election campaign against ${reelectionCampaign.opponentName} (${reelectionCampaign.opponentParty}) with projected vote share ${reelectionCampaign.projectedVoteShare}%.` : reelectionCampaign?.decision === 'declined' ? 'Voluntarily declined to seek re-election and completed the remaining term focused on governance and legacy.' : 'Did not launch a re-election campaign.'}

Final Metrics:
- Approval: ${metrics?.approval}% | Congress Support: ${metrics?.congressSupport}%
- GDP Growth: ${metrics?.gdpGrowth}% | Inflation: ${metrics?.inflation}% | Unemployment: ${metrics?.unemployment}%
- Debt: $${metrics?.nationalDebtTrillions}T | Diplomatic Standing: ${metrics?.diplomaticStanding}/100
- House: ${metrics?.houseSeats}/435 | Senate: ${metrics?.senateSeats}/100
- Blocs: Working Class ${blocs?.workingClass}%, Moderates ${blocs?.suburbanModerates}%, Tech/Finance ${blocs?.techFinance}%, Seniors ${blocs?.seniors}%, Young ${blocs?.youngVoters}%

Key Term Moments:
${keyTurns}

Produce a historical letter grade (A+, A, A-, B+, B, B-, C+, C, D, or F), an authoritative legacy title, a 2-paragraph historian essay, 3 defining achievements, 2-3 major missteps, and a re-election / historical standing verdict.`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a distinguished presidential historian writing an objective, incisive assessment of an administration.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              historicalGrade: { type: Type.STRING },
              legacyTitle: { type: Type.STRING },
              historianEssay: { type: Type.STRING },
              definingAchievements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              majorMissteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              reelectionVerdict: { type: Type.STRING },
            },
            required: [
              'historicalGrade',
              'legacyTitle',
              'historianEssay',
              'definingAchievements',
              'majorMissteps',
              'reelectionVerdict',
            ],
          },
        },
      });
      return {
        historicalGrade: String(parsed.historicalGrade || 'B'),
        legacyTitle: String(parsed.legacyTitle || 'A Consequential Transition'),
        historianEssay: String(parsed.historianEssay || ''),
        definingAchievements: Array.isArray(parsed.definingAchievements)
          ? parsed.definingAchievements.map(String)
          : [],
        majorMissteps: Array.isArray(parsed.majorMissteps)
          ? parsed.majorMissteps.map(String)
          : [],
        reelectionVerdict: String(
          parsed.reelectionVerdict || 'Historians continue to debate the term’s ultimate trajectory.'
        ),
      };
    });
  });

  app.post('/api/synthesize-library', async (req, res) => {
    await runJsonWithKeepAlive(res, async () => {
      const {
        profile,
        vicePresident,
        scenarioTitle,
        currentMonth,
        initialMetrics,
        metrics,
        legislativeRecords,
        history,
      } = req.body || {};

      const ai = getAIClient();

      const timeline = Array.isArray(history)
        ? history
            .slice(-28)
            .map(
              (h: {
                month: number;
                outcome?: { newspaperHeadline?: string };
                policyDirective?: string;
              }) =>
                `M${h.month}: ${h.outcome?.newspaperHeadline || ''} — ${(h.policyDirective || '').slice(0, 110)}`
            )
            .join('\n')
        : 'Administration just inaugurated.';

      const bills = Array.isArray(legislativeRecords)
        ? legislativeRecords
            .slice(-20)
            .map(
              (r: {
                month: number;
                recordType: string;
                title: string;
                outcomeStatus: string;
              }) => `M${r.month} [${r.recordType} - ${r.outcomeStatus}]: ${r.title}`
            )
            .join('\n')
        : 'None recorded yet.';

      const partyLabel = resolvePartyLabel(profile);

      const prompt = `
Prepare a cumulative Presidential Library Retrospective for President ${profile?.name} (Political Party: ${partyLabel}, VP ${vicePresident?.name || 'N/A'}${profile?.startingYear ? `, inaugurated Jan ${profile.startingYear}` : ''}) governing through "${scenarioTitle}" as of ${formatServerCalendarLabel(currentMonth, profile?.startingYear)} of ${profile?.termLength || 48}.
${profile?.governingDoctrine ? `Administration Doctrine: ${profile.governingDoctrine}` : ''}
${profile?.historicalBenchmarkNote ? `Historical Scenario Benchmark: ${profile.historicalBenchmarkNote}` : ''}

Inauguration Baseline vs. Current Standing:
- Approval: ${initialMetrics?.approval}% -> ${metrics?.approval}%
- GDP Growth: ${initialMetrics?.gdpGrowth}% -> ${metrics?.gdpGrowth}%
- Inflation: ${initialMetrics?.inflation}% -> ${metrics?.inflation}%
- Unemployment: ${initialMetrics?.unemployment}% -> ${metrics?.unemployment}%
- National Debt: $${initialMetrics?.nationalDebtTrillions}T -> $${metrics?.nationalDebtTrillions}T
- House/Senate: ${metrics?.houseSeats}/435 House, ${metrics?.senateSeats}/100 Senate

Achieved Legislative & Executive Records:
${bills}

Chronological Headlines & Directives:
${timeline}

Write an authoritative, cumulative Presidential Library exhibition synthesis covering the administration's overarching theme, long-term summary, economic arc, foreign policy & security arc, and institutional legacy.`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are the Chief Archivist and Historian of a Presidential Library. Write balanced, incisive, museum-grade historical synthesis independent of single-month news noise.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              administrationTheme: { type: Type.STRING },
              longTermSummary: { type: Type.STRING },
              economicArc: { type: Type.STRING },
              foreignPolicyArc: { type: Type.STRING },
              institutionalLegacy: { type: Type.STRING },
            },
            required: [
              'administrationTheme',
              'longTermSummary',
              'economicArc',
              'foreignPolicyArc',
              'institutionalLegacy',
            ],
          },
        },
      });
      return {
        generatedAtMonth: currentMonth,
        administrationTheme: String(
          parsed.administrationTheme || 'An Administration Defined by Rapid Change'
        ),
        longTermSummary: String(parsed.longTermSummary || ''),
        economicArc: String(parsed.economicArc || ''),
        foreignPolicyArc: String(parsed.foreignPolicyArc || ''),
        institutionalLegacy: String(parsed.institutionalLegacy || ''),
      };
    });
  });

  app.post('/api/public-statement', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      cabinet,
      currentBriefing,
      statement,
      venue,
    } = req.body || {};

    const cleanStatement =
      typeof statement === 'string' ? statement.trim() : '';
    if (!cleanStatement) {
      return res.status(400).json({
        error: 'Please enter a public statement before addressing the press.',
      });
    }

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const cleanVenue = pickEnum(
        venue,
        ['Press Podium', 'Oval Office Address', 'Social Media Post', 'Press Gaggle'] as const,
        'Press Podium'
      );

      const keyAdvisors = Array.isArray(cabinet)
        ? cabinet
            .slice(0, 8)
            .map(
              (c: { roleTitle: string; name: string; leaning?: string; loyalty: number }) =>
                `${c.roleTitle}: ${c.name} (${c.leaning || ''}, loyalty ${c.loyalty}%)`
            )
            .join(' | ')
        : '';

      const prompt = `
The President just issued a standalone public statement and needs immediate reactions from Congress, White House advisors, and the news media.

CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (Political Party: ${partyLabel}, former ${profile?.background || 'governor'})
- Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'} (${vicePresident?.leaning || 'Moderate'})
- House / Senate Balance: House ${metrics?.houseSeats ?? 218}/435 | Senate ${metrics?.senateSeats ?? 50}/100
- Scenario & Date: ${scenarioTitle || 'Active Term'} · ${calendarDateLabel}
- Current Approval: ${metrics?.approval ?? 50}% | Congress Support: ${metrics?.congressSupport ?? 50}% | Diplomatic Standing: ${metrics?.diplomaticStanding ?? 60}/100
- Current National Context: ${currentBriefing?.title || ''} — ${currentBriefing?.urgentDilemma || ''}
- Appointed Advisors: ${keyAdvisors}
- Statement Venue: ${cleanVenue}
- President's Exact Statement: "${cleanStatement}"

INSTRUCTIONS:
1. Evaluate the statement honestly—whether it addresses policy, the economy, foreign affairs, Congress, sports, pop culture, humor, personal life, or an unscripted controversy (keep any controversial coverage non-explicit, written in sharp White House press-room style).
2. ALWAYS generate breaking news AND Congressional reaction:
   - leadOutlet & leadHeadline & mediaSummary (1-2 sentences summarizing immediate press/market/Hill reaction)
   - congressReaction: how House & Senate Majority and Opposition leaders react, with oversightStatus, censureRisk, chamberSummary, majorityLeaderQuote, oppositionLeaderQuote, and caucusReactionNote
   - advisorResponses: 2-3 direct quotes from appointed advisors with stance ("supportive", "skeptical", or "critical")
   - mediaReactions: 2-3 breaking news wire items with outlet, category ("economy|foreign|domestic|defense|politics"), headline, 1-sentence summary, and tone ("positive|neutral|critical")
   - metricDeltas: approval (-3.5 to +3.5), congressSupport (-3.0 to +3.0), diplomaticStanding (-3.0 to +3.0)
   - voterBlocDeltas: between -4 and +4 per bloc

Return ONLY a single JSON object matching this shape:
{
  "leadOutlet": "string",
  "leadHeadline": "string",
  "mediaSummary": "1-2 sentences",
  "congressReaction": {
    "oversightStatus": "No Action|Bipartisan Applause|Partisan Criticism|Ethics Inquiry|Subpoena Threat|Censure Resolution|Impeachment Inquiry",
    "censureRisk": "None|Low|Elevated|Severe",
    "chamberSummary": "1-2 sentences on Capitol Hill response",
    "majorityLeaderQuote": "1-2 sentences",
    "oppositionLeaderQuote": "1-2 sentences",
    "caucusReactionNote": "1 sentence"
  },
  "advisorResponses": [{ "speaker": "string", "role": "string", "quote": "1-2 sentences", "stance": "supportive|skeptical|critical" }],
  "mediaReactions": [{ "outlet": "string", "category": "economy|foreign|domestic|defense|politics", "headline": "string", "summary": "1 sentence", "tone": "positive|neutral|critical" }],
  "metricDeltas": { "approval": number, "congressSupport": number, "diplomaticStanding": number },
  "voterBlocDeltas": { "workingClass": number, "suburbanModerates": number, "techFinance": number, "seniors": number, "youngVoters": number }
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded political, Congressional, and media simulation engine modeling immediate White House press, Capitol Hill, and advisor responses. Return valid, concise JSON only.',
          responseMimeType: 'application/json',
        },
      });
      const md = parsed.metricDeltas || {};
      const vd = parsed.voterBlocDeltas || {};
      const cr = parsed.congressReaction || {};
      const clampDelta = (v: unknown, lim: number) =>
        Math.max(-lim, Math.min(lim, toNum(v, 0)));

      const leadOutlet = String(parsed.leadOutlet || 'The Washington Chronicle');
      const leadHeadline = String(
        parsed.leadHeadline || 'White House Remarks Spark Immediate Capitol Reaction'
      );
      const mediaSummary = String(
        parsed.mediaSummary ||
          'Reporters and lawmakers weighed the President’s unscripted remarks across cable networks and financial desks.'
      );
      const parsedMedia = Array.isArray(parsed.mediaReactions)
        ? parsed.mediaReactions.slice(0, 3).map((n: any) => ({
            outlet: String(n?.outlet || 'Associated Press'),
            category: pickEnum(
              n?.category,
              ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
              'politics'
            ),
            headline: String(n?.headline || 'Press Analyzes Presidential Remarks'),
            summary: String(n?.summary || ''),
            tone: pickEnum(
              n?.tone,
              ['positive', 'neutral', 'critical'] as const,
              'neutral'
            ),
          }))
        : [];
      if (parsedMedia.length === 0) {
        parsedMedia.push({
          outlet: leadOutlet,
          category: 'politics' as const,
          headline: leadHeadline,
          summary: mediaSummary,
          tone: 'neutral' as const,
        });
      }

      return {
        venue: cleanVenue,
        statement: cleanStatement,
        leadOutlet,
        leadHeadline,
        mediaSummary,
        congressReaction: {
          oversightStatus: pickEnum(
            cr.oversightStatus,
            [
              'No Action',
              'Bipartisan Applause',
              'Partisan Criticism',
              'Ethics Inquiry',
              'Subpoena Threat',
              'Censure Resolution',
              'Impeachment Inquiry',
            ] as const,
            'Partisan Criticism'
          ),
          censureRisk: pickEnum(
            cr.censureRisk,
            ['None', 'Low', 'Elevated', 'Severe'] as const,
            'None'
          ),
          chamberSummary: String(
            cr.chamberSummary ||
              'House and Senate caucuses reacted swiftly along party and committee lines following the President’s remarks.'
          ),
          majorityLeaderQuote: String(
            cr.majorityLeaderQuote ||
              'Lawmakers are reviewing the administration’s latest public position carefully.'
          ),
          oppositionLeaderQuote: String(
            cr.oppositionLeaderQuote ||
              'These remarks underscore why Congress must hold the White House accountable.'
          ),
          caucusReactionNote: String(
            cr.caucusReactionNote ||
              'Swing-district lawmakers calibrated their public statements ahead of floor votes.'
          ),
        },
        advisorResponses: Array.isArray(parsed.advisorResponses)
          ? parsed.advisorResponses.slice(0, 3).map((r: any) => ({
              speaker: String(r?.speaker || 'White House Press Secretary'),
              role: String(r?.role || 'Senior Advisor'),
              quote: String(r?.quote || ''),
              stance: pickEnum(
                r?.stance,
                ['supportive', 'skeptical', 'critical'] as const,
                'skeptical'
              ),
            }))
          : [],
        mediaReactions: parsedMedia,
        metricDeltas: {
          approval: clampDelta(md.approval, 3.5),
          congressSupport: clampDelta(md.congressSupport, 3.0),
          diplomaticStanding: clampDelta(md.diplomaticStanding, 3.0),
        },
        voterBlocDeltas: {
          workingClass: clampDelta(vd.workingClass, 4),
          suburbanModerates: clampDelta(vd.suburbanModerates, 4),
          techFinance: clampDelta(vd.techFinance, 4),
          seniors: clampDelta(vd.seniors, 4),
          youngVoters: clampDelta(vd.youngVoters, 4),
        },
      };
    });
  });

  app.post('/api/unscripted-action', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      cabinet,
      currentBriefing,
      action,
      visibility,
    } = req.body || {};

    const cleanAction = typeof action === 'string' ? action.trim() : '';
    if (!cleanAction) {
      return res.status(400).json({
        error: 'Please enter an unscripted action before executing.',
      });
    }

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const cleanVisibility = pickEnum(
        visibility,
        ['public', 'off_record'] as const,
        'public'
      );
      const leakedToPress = true;

      const keyAdvisors = Array.isArray(cabinet)
        ? cabinet
            .slice(0, 8)
            .map(
              (c: { roleTitle: string; name: string; leaning?: string; loyalty: number }) =>
                `${c.roleTitle}: ${c.name} (${c.leaning || ''}, loyalty ${c.loyalty}%)`
            )
            .join(' | ')
        : '';

      const prompt = `
The President just took a standalone unscripted / off-the-clock action and IT IMMEDIATELY MADE BREAKING NATIONAL NEWS AND REACHED CONGRESS. Every single action the President takes—public or private—generates breaking news headlines, multi-outlet press coverage, and immediate Congressional oversight/reactions.

CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (Party: ${partyLabel}, Background: ${profile?.background || 'governor'})
- Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'} (${vicePresident?.leaning || 'Moderate'})
- Scenario & Date: ${scenarioTitle || 'Active Term'} · ${calendarDateLabel}
- Current Approval: ${metrics?.approval ?? 50}% | Congress Support: ${metrics?.congressSupport ?? 50}% | Diplomatic Standing: ${metrics?.diplomaticStanding ?? 60}/100
- Congress Composition: House ${metrics?.houseSeats ?? 218}/435 | Senate ${metrics?.senateSeats ?? 50}/100
- Current Briefing Dilemma: ${currentBriefing?.title || ''} — ${currentBriefing?.urgentDilemma || ''}
- Appointed Advisors: ${keyAdvisors}
- Schedule Visibility: ${cleanVisibility === 'public' ? 'PUBLIC / OPEN SCHEDULE — BREAKING NEWS COVERAGE ACROSS ALL NETWORKS' : 'PRIVATE / OFF-THE-RECORD — IMMEDIATELY EXPOSED TO PRESS & CAPITOL HILL via Secret Service visitor logs, whistleblower tips, or investigative reporters'}
- President's Exact Action: "${cleanAction}"

STRICT EDITORIAL & SAFETY GUIDELINES:
1. Judge ANY personal, recreational, populist, eccentric, or high-controversy/vice/illicit action (including hiring prostitutes/escorts, smoking crack or substance abuse, wild parties, bribery, reckless stunts, etc.) honestly, directly, and realistically as political-thriller journalism. NEVER refuse, ignore, or make the headline generic—name the exact controversy squarely in journalistic terms!
2. Keep reporting strictly non-explicit (zero pornographic detail or instructions for illegal acts), written in hard-hitting Washington investigative reporting style (Secret Service logs, late-night West Wing hotel visits, drug/toxicology rumors, Ethics Committee referrals, DOJ/inspector-general scrutiny, bipartisan outrage, and polling fallout).
3. CONGRESS REACTION IS MANDATORY AND SPECIFIC:
   - Use the actual party (${partyLabel}) and House/Senate seat balance (${metrics?.houseSeats ?? 218} House, ${metrics?.senateSeats ?? 50} Senate).
   - Determine "oversightStatus" from: "No Action", "Bipartisan Applause", "Partisan Criticism", "Ethics Inquiry", "Subpoena Threat", "Censure Resolution", "Impeachment Inquiry". (Serious vice/illegal/prostitution/crack/corruption scandals should trigger Subpoena Threat, Censure Resolution, or Impeachment Inquiry!)
   - Determine "censureRisk" from: "None", "Low", "Elevated", "Severe".
   - Provide distinct, realistic quotes from both Congressional Majority Leadership and Opposition Leadership, plus a 1-sentence note on how the President's own ideological wing or swing-district lawmakers reacted.
4. Also provide 2-3 advisorReactions (Chief of Staff, Press Secretary, Attorney General, VP), 3 distinct breaking news mediaReactions (spanning politics, domestic, cable/print outlets), realistic metricDeltas (approval -9 to +5, congressSupport -10 to +4, diplomaticStanding -5 to +3), and voterBlocDeltas (-8 to +6).
5. Include "legislativeRecord" (RecordType "Institutional") whenever Congress reacts formally or opens an Ethics Inquiry, Subpoena, Censure Resolution, or Impeachment Inquiry, and "milestone" if historic/scandalous.

Return ONLY a single JSON object matching this exact schema:
{
  "leadOutlet": "string",
  "leadHeadline": "string",
  "mediaSummary": "1-2 sentences",
  "congressReaction": {
    "oversightStatus": "No Action|Bipartisan Applause|Partisan Criticism|Ethics Inquiry|Subpoena Threat|Censure Resolution|Impeachment Inquiry",
    "censureRisk": "None|Low|Elevated|Severe",
    "chamberSummary": "1-2 sentences on House & Senate floor/committee response",
    "majorityLeaderQuote": "1-2 sentences",
    "oppositionLeaderQuote": "1-2 sentences",
    "caucusReactionNote": "1 sentence on intraparty / swing-member reaction"
  },
  "advisorResponses": [{ "speaker": "string", "role": "string", "quote": "1-2 sentences", "stance": "supportive|skeptical|critical" }],
  "mediaReactions": [{ "outlet": "string", "category": "economy|foreign|domestic|defense|politics", "headline": "string", "summary": "1 sentence", "tone": "positive|neutral|critical" }],
  "metricDeltas": { "approval": number, "congressSupport": number, "diplomaticStanding": number },
  "voterBlocDeltas": { "workingClass": number, "suburbanModerates": number, "techFinance": number, "seniors": number, "youngVoters": number },
  "legislativeRecord": { "recordType": "Institutional", "title": "string", "summary": "1 sentence", "outcomeStatus": "Enacted|Compromise|Blocked" },
  "milestone": { "category": "Political|Constitutional", "title": "string", "description": "1 sentence" }
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded political, Constitutional oversight, and Washington journalism simulation engine. Model Congressional ethics/censure/partisan reactions and press fallout to any presidential action in crisp, non-explicit, PG-13 reporting style. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const md = parsed.metricDeltas || {};
      const vd = parsed.voterBlocDeltas || {};
      const cr = parsed.congressReaction || {};
      const clampDelta = (v: unknown, lim: number) =>
        Math.max(-lim, Math.min(lim, toNum(v, 0)));

      return {
        action: cleanAction,
        visibility: cleanVisibility,
        leakedToPress,
        leadOutlet: String(parsed.leadOutlet || 'The Washington Chronicle'),
        leadHeadline: String(
          parsed.leadHeadline || 'Capitol Hill Reacts to Unscripted Presidential Move'
        ),
        mediaSummary: String(
          parsed.mediaSummary ||
            'Lawmakers, reporters, and White House aides scrambled to respond following the President’s unscheduled actions.'
        ),
        congressReaction: {
          oversightStatus: pickEnum(
            cr.oversightStatus,
            [
              'No Action',
              'Bipartisan Applause',
              'Partisan Criticism',
              'Ethics Inquiry',
              'Subpoena Threat',
              'Censure Resolution',
              'Impeachment Inquiry',
            ] as const,
            'Partisan Criticism'
          ),
          censureRisk: pickEnum(
            cr.censureRisk,
            ['None', 'Low', 'Elevated', 'Severe'] as const,
            'Low'
          ),
          chamberSummary: String(
            cr.chamberSummary ||
              'House and Senate leaders issued immediate statements weighing oversight and political fallout.'
          ),
          majorityLeaderQuote: String(
            cr.majorityLeaderQuote ||
              'The President’s schedule raises serious questions that leadership is reviewing with committee chairs.'
          ),
          oppositionLeaderQuote: String(
            cr.oppositionLeaderQuote ||
              'The American people expect seriousness in the Oval Office, and Congress intends to exercise full oversight.'
          ),
          caucusReactionNote: String(
            cr.caucusReactionNote ||
              'Swing-district lawmakers kept their distance while party loyalists urged focus on pending legislation.'
          ),
        },
        advisorResponses: Array.isArray(parsed.advisorResponses)
          ? parsed.advisorResponses.slice(0, 3).map((r: any) => ({
              speaker: String(r?.speaker || 'White House Chief of Staff'),
              role: String(r?.role || 'Senior Advisor'),
              quote: String(r?.quote || ''),
              stance: pickEnum(
                r?.stance,
                ['supportive', 'skeptical', 'critical'] as const,
                'skeptical'
              ),
            }))
          : [],
        mediaReactions: Array.isArray(parsed.mediaReactions)
          ? parsed.mediaReactions.slice(0, 3).map((n: any) => ({
              outlet: String(n?.outlet || 'Associated Press'),
              category: pickEnum(
                n?.category,
                ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
                'politics'
              ),
              headline: String(
                n?.headline || 'Capitol Hill Debates Presidential Conduct'
              ),
              summary: String(n?.summary || ''),
              tone: pickEnum(
                n?.tone,
                ['positive', 'neutral', 'critical'] as const,
                'neutral'
              ),
            }))
          : [],
        metricDeltas: {
          approval: Math.max(-9, Math.min(5, toNum(md.approval, 0))),
          congressSupport: Math.max(-10, Math.min(4, toNum(md.congressSupport, 0))),
          diplomaticStanding: Math.max(-5, Math.min(3, toNum(md.diplomaticStanding, 0))),
        },
        voterBlocDeltas: {
          workingClass: clampDelta(vd.workingClass, 8),
          suburbanModerates: clampDelta(vd.suburbanModerates, 8),
          techFinance: clampDelta(vd.techFinance, 8),
          seniors: clampDelta(vd.seniors, 8),
          youngVoters: clampDelta(vd.youngVoters, 8),
        },
        ...(parsed.legislativeRecord && parsed.legislativeRecord.title
          ? {
              legislativeRecord: {
                recordType: 'Institutional' as const,
                title: String(parsed.legislativeRecord.title),
                summary: String(parsed.legislativeRecord.summary || ''),
                outcomeStatus: pickEnum(
                  parsed.legislativeRecord.outcomeStatus,
                  ['Enacted', 'Compromise', 'Blocked'] as const,
                  'Enacted'
                ),
              },
            }
          : {}),
        ...(parsed.milestone && parsed.milestone.title
          ? {
              milestone: {
                category: pickEnum(
                  parsed.milestone.category,
                  ['Political', 'Constitutional'] as const,
                  'Political'
                ),
                title: String(parsed.milestone.title),
                description: String(parsed.milestone.description || ''),
              },
            }
          : {}),
      };
    });
  });

  app.post('/api/situation-room', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      cabinet,
      military,
      scenarioType,
      targetCountry,
      orderSummary,
      seekCongressAuthorization,
      theaterContext,
    } = req.body || {};

    const cleanOrder =
      typeof orderSummary === 'string' ? orderSummary.trim() : '';
    const cleanCountry =
      typeof targetCountry === 'string' && targetCountry.trim()
        ? targetCountry.trim()
        : 'Global Flashpoint';

    if (!cleanOrder) {
      return res.status(400).json({
        error: 'Please enter a Situation Room order or select a war/peace scenario first.',
      });
    }

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const allowedScenarios = [
        'Start War / Request AUMF',
        'End War / Peace Treaty',
        'Targeted Strikes & No-Fly Zone',
        'Naval Blockade & Sanctions',
        'Covert & Cyber Operation',
        'Allied Deterrence Surge',
        'Custom Crisis Scenario',
      ] as const;
      const cleanScenarioType = pickEnum(
        scenarioType,
        allowedScenarios,
        'Custom Crisis Scenario'
      );

      const currentOpsText = Array.isArray(military?.operations) && military.operations.length > 0
        ? military.operations
            .map(
              (o: { name: string; region: string; posture: string; personnelCount: string }) =>
                `${o.name} [${o.posture}, ${o.region}, ${o.personnelCount}]`
            )
            .join(' | ')
        : 'None (garrison peacetime posture)';

      const cabinetText = Array.isArray(cabinet)
        ? cabinet
            .filter((c: { id: string }) =>
              ['defense', 'state', 'nsa', 'chief_of_staff', 'press_secretary', 'treasury'].includes(c.id)
            )
            .map(
              (c: { id: string; roleTitle: string; name: string; leaning?: string; loyalty: number }) =>
                `${c.id} (${c.roleTitle}): ${c.name} [${c.leaning || ''}, loyalty ${c.loyalty}%]`
            )
            .join(' | ')
        : '';

      const jcs = military?.jointChiefsChair
        ? `${military.jointChiefsChair.name} (${military.jointChiefsChair.branch}, ${military.jointChiefsChair.doctrine})`
        : 'Joint Chiefs Chair';

      const theaterLine = theaterContext
        ? `- Regional Theater Force Posture (${theaterContext.theaterName || theaterContext.commandCode}): ${
            Array.isArray(theaterContext.assignedUnitNames) &&
            theaterContext.assignedUnitNames.length > 0
              ? `${theaterContext.assignedUnitNames.join(', ')} (${theaterContext.deterrenceLabel}; Security Success Odds ${theaterContext.operationSuccessProbabilityPct}%, Diplomacy Bonus +${theaterContext.diplomacyOddsBonusPct}%)`
              : `No forward-deployed combat units assigned (${theaterContext.deterrenceLabel}; baseline odds ${theaterContext.operationSuccessProbabilityPct}%)`
          }`
        : '';

      const prompt = `
The President convened an urgent National Security Council session in the White House Situation Room to execute a major military, war, or peace decision.

CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (Party: ${partyLabel}, Background: ${profile?.background || 'governor'})
- Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'} (${vicePresident?.leaning || 'Moderate'})
- Scenario & Date: ${scenarioTitle || 'Active Term'} · ${calendarDateLabel}
- Current Approval: ${metrics?.approval ?? 50}% | Congress Support: ${metrics?.congressSupport ?? 50}% | Diplomatic Standing: ${metrics?.diplomaticStanding ?? 60}/100
- Congress Composition: House ${metrics?.houseSeats ?? 218}/435 | Senate ${metrics?.senateSeats ?? 50}/100
- Current Defense Posture: DEFCON ${military?.defconLevel ?? 4}, Readiness ${military?.forceReadiness ?? 85}%, Defense Budget $${military?.defenseBudgetBillions ?? 886}B, Cyber ${military?.cyberPosture || 'Elevated'}, Threat ${military?.intelThreatLevel || 'Elevated'}
- Active Operations Before Order: ${currentOpsText}
- Chair of Joint Chiefs: ${jcs}
- Key National Security Cabinet: ${cabinetText}
${theaterLine}

SITUATION ROOM DECISION:
- Scenario Type: ${cleanScenarioType}
- Target Country / Theater: ${cleanCountry}
- Formal Congressional AUMF / Treaty Vote Requested: ${seekCongressAuthorization ? 'YES' : 'NO (Executive / Commander-in-Chief Action)'}
- President's Exact Order: "${cleanOrder}"

RULES FOR REALISTIC SIMULATION:
1. Respond with grounded geopolitical realism—whether starting a war against ${cleanCountry}, ending an active war / signing a peace treaty, imposing a blockade, ordering strikes, or executing a custom crisis scenario. Factor in whether U.S. combat/naval units are already forward-deployed in that regional theater (reference specific assigned units if present, or note the logistics delay if unassigned):
   - CONGRESS RESPONSE: Model Capitol Hill's reaction using the President's actual party (${partyLabel}) and House/Senate seat count (${metrics?.houseSeats ?? 218} House, ${metrics?.senateSeats ?? 50} Senate). If starting war WITHOUT Congress, model sharp War Powers Resolution pushback alongside hawkish allies; if requesting AUMF or negotiating a peace treaty, estimate Senate & House vote margins and include quotes from both Majority and Opposition leaders.
   - CABINET & JOINT CHIEFS RESPONSES: Provide 3-4 realistic quotes from the actual appointed Defense Secretary, Secretary of State, NSA, Chief of Staff, or Joint Chiefs Chair reflecting their doctrines/leanings, with stance ("supportive"|"skeptical"|"critical") and loyaltyDelta (-10 to +8). Include "departmentId" when speaking as defense, state, nsa, chief_of_staff, treasury, or press_secretary.
   - MEDIA REACTIONS: Breaking front-page outlet/headline/summary + 3 wire items covering defense, diplomacy, domestic politics, and markets/oil/inflation.
   - MILITARY OPERATIONS UPDATE:
     * If STARTING WAR or launching a major offensive/blockade/strike against ${cleanCountry}, lower DEFCON appropriately (typically DEFCON 2 or 3, or 1 for extreme escalation), update threat level & budget billions, and ADD or UPGRADE the active operation in "operations" (e.g. "Operation ... (${cleanCountry})" with realistic personnel count & "Active Strike" or "Deterrence" posture).
     * If ENDING A WAR, ordering troop withdrawal, or signing a Peace Treaty with ${cleanCountry}, raise DEFCON toward 4 or 5, lower threat level appropriately, and REMOVE concluded combat operations or transition them to "Humanitarian" / "Standby" withdrawal status (or empty array if all wars ended).
2. Keep metricDeltas realistic for a major geopolitical decision:
   - approval (-8 to +8), congressSupport (-9 to +8), diplomaticStanding (-15 to +14), gdpGrowth (-0.7 to +0.5), inflation (-0.4 to +0.9), nationalDebtTrillions (-0.05 to +0.45), voterBlocDeltas (-8 to +8).
3. Include "legislativeRecord" if an AUMF, War Powers measure, Sanctions Bill, or Peace Treaty occurred, and "milestone" for historic declarations of war or peace treaties.

Return ONLY a single JSON object matching this exact schema:
{
  "leadOutlet": "string",
  "leadHeadline": "string",
  "mediaSummary": "1-2 sentences",
  "congressResponse": {
    "chamberSummary": "1-2 sentences",
    "warPowersStatus": "AUMF Authorized|Pending AUMF Vote|War Powers Challenge|Peace Treaty Ratified|Bipartisan Backing|Constitutional Standoff",
    "senateVoteEstimate": "e.g. 64-36 Yea",
    "houseVoteEstimate": "e.g. 258-177 Yea",
    "majorityLeaderQuote": "1-2 sentences",
    "oppositionLeaderQuote": "1-2 sentences"
  },
  "cabinetResponses": [
    { "departmentId": "defense|state|nsa|chief_of_staff|treasury|press_secretary", "speaker": "string", "role": "string", "quote": "1-2 sentences", "stance": "supportive|skeptical|critical", "loyaltyDelta": number }
  ],
  "mediaReactions": [
    { "outlet": "string", "category": "economy|foreign|domestic|defense|politics", "headline": "string", "summary": "1 sentence", "tone": "positive|neutral|critical" }
  ],
  "militaryUpdates": {
    "defconLevel": 1-5,
    "readinessDelta": number,
    "defenseBudgetDeltaBillions": number,
    "cyberPosture": "Normal|Elevated|Active Shield",
    "intelThreatLevel": "Guarded|Elevated|High|Severe",
    "intelSummary": "1-2 sentences",
    "operations": [
      { "name": "string", "region": "string", "posture": "Deterrence|Active Strike|Humanitarian|Cyber Defense|Standby", "personnelCount": "string", "statusNote": "1 sentence" }
    ]
  },
  "metricDeltas": { "approval": number, "congressSupport": number, "diplomaticStanding": number, "gdpGrowth": number, "inflation": number, "nationalDebtTrillions": number },
  "voterBlocDeltas": { "workingClass": number, "suburbanModerates": number, "techFinance": number, "seniors": number, "youngVoters": number },
  "legislativeRecord": { "recordType": "Legislation|Executive Order|Treaty|Institutional", "title": "string", "summary": "1 sentence", "outcomeStatus": "Enacted|Compromise|Blocked" },
  "milestone": { "category": "Security|Constitutional|Political", "title": "string", "description": "1 sentence" }
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded geopolitical, War Powers, and national security simulation engine. Model military escalations, wars, peace treaties, Congressional AUMF politics, Cabinet counsel, and global media accurately. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });
      const md = parsed.metricDeltas || {};
      const vd = parsed.voterBlocDeltas || {};
      const cr = parsed.congressResponse || {};
      const mu = parsed.militaryUpdates || {};
      const clampDelta = (v: unknown, lim: number) =>
        Math.max(-lim, Math.min(lim, toNum(v, 0)));

      return {
        scenarioType: cleanScenarioType,
        targetCountry: cleanCountry,
        orderSummary: cleanOrder,
        leadOutlet: String(parsed.leadOutlet || 'Reuters World Desk'),
        leadHeadline: String(
          parsed.leadHeadline ||
            `White House Situation Room Acts on ${cleanCountry}`
        ),
        mediaSummary: String(
          parsed.mediaSummary ||
            `Capitol Hill, Pentagon planners, and foreign capitals reacted immediately to the President's directive regarding ${cleanCountry}.`
        ),
        congressResponse: {
          chamberSummary: String(
            cr.chamberSummary ||
              'Congressional leaders convened emergency briefings on War Powers authority and regional fallout.'
          ),
          warPowersStatus: pickEnum(
            cr.warPowersStatus,
            [
              'AUMF Authorized',
              'Pending AUMF Vote',
              'War Powers Challenge',
              'Peace Treaty Ratified',
              'Bipartisan Backing',
              'Constitutional Standoff',
            ] as const,
            'Pending AUMF Vote'
          ),
          senateVoteEstimate: String(cr.senateVoteEstimate || '52–48 Projected'),
          houseVoteEstimate: String(cr.houseVoteEstimate || '221–214 Projected'),
          majorityLeaderQuote: String(
            cr.majorityLeaderQuote ||
              'We will review the Commander-in-Chief’s legal rationale and operational timeline in closed committee session.'
          ),
          oppositionLeaderQuote: String(
            cr.oppositionLeaderQuote ||
              'The Constitution vests the power to declare war in Congress, and the White House owes lawmakers full transparency.'
          ),
        },
        cabinetResponses: Array.isArray(parsed.cabinetResponses)
          ? parsed.cabinetResponses.slice(0, 4).map((r: any) => ({
              ...(r?.departmentId &&
              ['defense', 'state', 'nsa', 'chief_of_staff', 'treasury', 'press_secretary', 'justice', 'labor'].includes(
                String(r.departmentId)
              )
                ? { departmentId: String(r.departmentId) }
                : {}),
              speaker: String(r?.speaker || 'National Security Advisor'),
              role: String(r?.role || 'Situation Room Principal'),
              quote: String(r?.quote || ''),
              stance: pickEnum(
                r?.stance,
                ['supportive', 'skeptical', 'critical'] as const,
                'skeptical'
              ),
              loyaltyDelta: clampDelta(r?.loyaltyDelta, 10),
            }))
          : [],
        mediaReactions: Array.isArray(parsed.mediaReactions)
          ? parsed.mediaReactions.slice(0, 3).map((n: any) => ({
              outlet: String(n?.outlet || 'Associated Press'),
              category: pickEnum(
                n?.category,
                ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
                'defense'
              ),
              headline: String(
                n?.headline || `Pentagon & Hill Respond on ${cleanCountry}`
              ),
              summary: String(n?.summary || ''),
              tone: pickEnum(
                n?.tone,
                ['positive', 'neutral', 'critical'] as const,
                'neutral'
              ),
            }))
          : [],
        militaryUpdates: {
          defconLevel: Math.max(
            1,
            Math.min(5, Math.round(toNum(mu.defconLevel, military?.defconLevel ?? 4)))
          ),
          readinessDelta: clampDelta(mu.readinessDelta, 12),
          defenseBudgetDeltaBillions: clampDelta(mu.defenseBudgetDeltaBillions, 120),
          cyberPosture: pickEnum(
            mu.cyberPosture,
            ['Normal', 'Elevated', 'Active Shield'] as const,
            military?.cyberPosture || 'Elevated'
          ),
          intelThreatLevel: pickEnum(
            mu.intelThreatLevel,
            ['Guarded', 'Elevated', 'High', 'Severe'] as const,
            military?.intelThreatLevel || 'Elevated'
          ),
          intelSummary: String(
            mu.intelSummary ||
              `Situation Room tracking live developments in ${cleanCountry}.`
          ),
          operations: Array.isArray(mu.operations)
            ? mu.operations.slice(0, 5).map((op: any) => ({
                name: String(op?.name || `Operation ${cleanCountry}`),
                region: String(op?.region || cleanCountry),
                posture: pickEnum(
                  op?.posture,
                  [
                    'Deterrence',
                    'Active Strike',
                    'Humanitarian',
                    'Cyber Defense',
                    'Standby',
                  ] as const,
                  'Deterrence'
                ),
                personnelCount: String(op?.personnelCount || '18,000'),
                statusNote: String(op?.statusNote || ''),
              }))
            : undefined,
        },
        metricDeltas: {
          approval: clampDelta(md.approval, 8),
          congressSupport: clampDelta(md.congressSupport, 9),
          diplomaticStanding: clampDelta(md.diplomaticStanding, 15),
          gdpGrowth: clampDelta(md.gdpGrowth, 0.7),
          inflation: clampDelta(md.inflation, 0.9),
          nationalDebtTrillions: clampDelta(md.nationalDebtTrillions, 0.45),
        },
        voterBlocDeltas: {
          workingClass: clampDelta(vd.workingClass, 8),
          suburbanModerates: clampDelta(vd.suburbanModerates, 8),
          techFinance: clampDelta(vd.techFinance, 8),
          seniors: clampDelta(vd.seniors, 8),
          youngVoters: clampDelta(vd.youngVoters, 8),
        },
        ...(parsed.legislativeRecord && parsed.legislativeRecord.title
          ? {
              legislativeRecord: {
                recordType: pickEnum(
                  parsed.legislativeRecord.recordType,
                  ['Legislation', 'Executive Order', 'Treaty', 'Institutional'] as const,
                  'Executive Order'
                ),
                title: String(parsed.legislativeRecord.title),
                summary: String(parsed.legislativeRecord.summary || ''),
                outcomeStatus: pickEnum(
                  parsed.legislativeRecord.outcomeStatus,
                  ['Enacted', 'Compromise', 'Blocked'] as const,
                  'Enacted'
                ),
              },
            }
          : {}),
        ...(parsed.milestone && parsed.milestone.title
          ? {
              milestone: {
                category: pickEnum(
                  parsed.milestone.category,
                  ['Political', 'Economic', 'Security', 'Constitutional'] as const,
                  'Security'
                ),
                title: String(parsed.milestone.title),
                description: String(parsed.milestone.description || ''),
              },
            }
          : {}),
      };
    });
  });

  app.post('/api/impeachment', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      strategy,
      defenseStatement,
      recentHistory,
    } = req.body || {};

    const approval = toNum(metrics?.approval, 4);
    if (approval >= 5) {
      return res.status(400).json({
        error:
          'Impeachment proceedings can only be triggered when public approval drops below 5.0%.',
      });
    }

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const cleanStrategy = pickEnum(
        strategy,
        ['contest', 'deal'] as const,
        'contest'
      );
      const cleanDefense =
        typeof defenseStatement === 'string' ? defenseStatement.trim() : '';

      const houseSeats = Math.max(120, Math.min(315, Math.round(toNum(metrics?.houseSeats, 218))));
      const senateSeats = Math.max(30, Math.min(70, Math.round(toNum(metrics?.senateSeats, 50))));
      const congressSupport = toNum(metrics?.congressSupport, 20);

      // Compute realistic House & Senate impeachment vote ranges based on approval < 5%, Congress support, and seat margin
      const baseOppositionHouse = 435 - houseSeats;
      const partyDefectionRateHouse =
        cleanStrategy === 'deal'
          ? Math.max(0.08, (25 - congressSupport) * 0.009)
          : Math.max(0.18, (35 - congressSupport) * 0.011);
      const computedHouseYea = Math.max(
        180,
        Math.min(
          435,
          Math.round(
            baseOppositionHouse + houseSeats * partyDefectionRateHouse + (5 - approval) * 5
          )
        )
      );
      const houseImpeached = computedHouseYea >= 218;
      const computedHouseNay = 435 - computedHouseYea;

      const baseOppositionSenate = 100 - senateSeats;
      const partyDefectionRateSenate =
        cleanStrategy === 'deal'
          ? Math.max(0.12, (28 - congressSupport) * 0.008)
          : Math.max(0.24, (38 - congressSupport) * 0.011);
      const rawSenateYea = houseImpeached
        ? Math.max(
            42,
            Math.min(
              100,
              Math.round(
                baseOppositionSenate +
                  senateSeats * partyDefectionRateSenate +
                  (5 - approval) * 1.4
              )
            )
          )
        : 0;
      const senateConvicted = houseImpeached && rawSenateYea >= 67;
      const rawSenateNay = houseImpeached ? 100 - rawSenateYea : 0;

      const historySummary = Array.isArray(recentHistory)
        ? recentHistory
            .slice(-4)
            .map(
              (h: {
                month: number;
                outcome?: { newspaperHeadline?: string };
                policyDirective?: string;
              }) =>
                `Month ${h.month}: ${(h.policyDirective || '').slice(0, 120)} -> ${h.outcome?.newspaperHeadline || ''}`
            )
            .join('\n')
        : 'Severe loss of national confidence.';

      const prompt = `
The House of Representatives has brought Articles of Impeachment after President ${profile?.name || 'Jordan Mercer'} (${partyLabel}) fell to a historic ${approval.toFixed(1)}% public approval rating in ${calendarDateLabel} (${scenarioTitle || 'Active Term'}).

CONSTITUTIONAL & VOTE CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (${partyLabel}) | Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'}
- Current Approval: ${approval.toFixed(1)}% | Congress Support: ${congressSupport.toFixed(1)}%
- President's House Coalition: ${houseSeats}/435 | Senate Coalition: ${senateSeats}/100
- Defense Strategy Chosen: ${cleanStrategy === 'deal' ? 'STRIKE SURVIVAL DEAL & CONCESSIONS WITH CONGRESSIONAL LEADERS' : 'CONTEST TRIAL ON CONSTITUTIONAL MERITS'}
- President's Statement to Congress: "${cleanDefense || 'No formal written defense submitted.'}"
- House Impeachment Vote Outcome: ${computedHouseYea} Yea – ${computedHouseNay} Nay (${houseImpeached ? 'IMPEACHED BY HOUSE' : 'HOUSE REJECTED ARTICLES'})
- Senate Trial Outcome (67 required to convict): ${houseImpeached ? `${rawSenateYea} Guilty – ${rawSenateNay} Not Guilty (${senateConvicted ? 'CONVICTED & REMOVED FROM OFFICE' : 'ACQUITTED — SURVIVES IN OFFICE'})` : 'N/A (No Senate trial needed)'}
- Recent Events:
${historySummary}

Write a realistic, dramatic, non-explicit Constitutional impeachment dossier matching the exact vote counts above.
Return ONLY a single JSON object:
{
  "articlesTitle": "e.g. Article I: Neglect of Constitutional Duty & Breakdown of Governance",
  "articlesSummary": "2 sentences summarizing the specific articles drawn from recent events",
  "chiefJusticeNote": "1 sentence on the Supreme Court Chief Justice presiding over the Senate trial (or House Clerk note if House rejected)",
  "majorityLeaderQuote": "1-2 sentences",
  "oppositionLeaderQuote": "1-2 sentences",
  "leadOutlet": "string",
  "leadHeadline": "string",
  "verdictSummary": "2-3 sentences explaining the roll-call outcome and immediate national aftermath",
  "approvalDelta": number (e.g. +2.5 to +5.5 if acquitted/survived, -1 to -3 if convicted),
  "congressDelta": number (e.g. -6 to +4)
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a Constitutional historian and Capitol Hill journalist simulating a U.S. presidential impeachment and Senate trial with strict adherence to the supplied roll-call vote totals. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      return {
        articlesTitle: String(
          parsed.articlesTitle ||
            'Article I: Breakdown of Public Trust & Executive Neglect'
        ),
        articlesSummary: String(
          parsed.articlesSummary ||
            `Citing historic single-digit public approval (${approval.toFixed(1)}%) and bipartisan alarm over administration stewardship, House managers brought formal Articles of Impeachment.`
        ),
        houseImpeached,
        houseYea: computedHouseYea,
        houseNay: computedHouseNay,
        senateConvicted,
        senateYea: rawSenateYea,
        senateNay: rawSenateNay,
        chiefJusticeNote: String(
          parsed.chiefJusticeNote ||
            (houseImpeached
              ? 'The Chief Justice of the United States presided over the Senate chamber in full formal session.'
              : 'The Speaker announced the failure of the impeachment resolution on the House floor.')
        ),
        majorityLeaderQuote: String(
          parsed.majorityLeaderQuote ||
            'Every member of this chamber voted their conscience under an extraordinary constitutional test.'
        ),
        oppositionLeaderQuote: String(
          parsed.oppositionLeaderQuote ||
            'No president can govern without a basic measure of public confidence and constitutional accountability.'
        ),
        leadOutlet: String(parsed.leadOutlet || 'The Washington Chronicle'),
        leadHeadline: String(
          parsed.leadHeadline ||
            (senateConvicted
              ? `Senate Convicts President ${profile?.name || ''} (${rawSenateYea}–${rawSenateNay}); Presidency Ends`
              : houseImpeached
              ? `Senate Acquits President ${profile?.name || ''} (${rawSenateYea}–${rawSenateNay}) in Historic Trial`
              : `House Narrowly Rejects Impeachment Articles (${computedHouseYea}–${computedHouseNay})`)
        ),
        verdictSummary: String(
          parsed.verdictSummary ||
            (senateConvicted
              ? `With ${rawSenateYea} Senators voting Guilty—surpassing the two-thirds constitutional threshold—President ${profile?.name || ''} was removed from office.`
              : `Falling short of the 67-vote Senate conviction threshold, President ${profile?.name || ''} survived removal in a deeply fractured Capitol.`)
        ),
        approvalDelta: Math.max(-4, Math.min(6, toNum(parsed.approvalDelta, senateConvicted ? -2 : 3.5))),
        congressDelta: Math.max(-8, Math.min(5, toNum(parsed.congressDelta, senateConvicted ? -5 : -2))),
      };
    });
  });

  app.post('/api/fire-official', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      metrics,
      cabinet,
      military,
      targetCategory,
      targetId,
      targetName,
      roleTitle,
      reason,
    } = req.body || {};

    const cleanCategory = pickEnum(
      targetCategory,
      ['vp', 'cabinet', 'white_house', 'military', 'agency_official'] as const,
      'cabinet'
    );
    const cleanName =
      typeof targetName === 'string' && targetName.trim()
        ? targetName.trim()
        : 'Senior Official';
    const cleanRole =
      typeof roleTitle === 'string' && roleTitle.trim()
        ? roleTitle.trim()
        : 'White House Official';
    const cleanReason =
      typeof reason === 'string' && reason.trim()
        ? reason.trim()
        : 'Presidential decision to overhaul leadership and administration direction.';

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const approval = toNum(metrics?.approval, 48);
      const congressSupport = toNum(metrics?.congressSupport, 48);
      const houseSeats = toNum(metrics?.houseSeats, 218);
      const senateSeats = toNum(metrics?.senateSeats, 50);

      const categoryGuidance =
        cleanCategory === 'vp'
          ? `CRITICAL CONSTITUTIONAL CONTEXT: Under the U.S. Constitution (Article II & the 25th Amendment), a President has NO legal authority to unilaterally fire an elected Vice President. Ordering the Vice President to resign / attempting to oust Vice President ${cleanName} (current loyalty: ${toNum(vicePresident?.loyalty, 70)}%) triggers an extraordinary constitutional showdown and forced resignation crisis, leaving the Vice Presidency VACANT until Congress confirms a 25th Amendment nominee and temporarily stripping the administration of VP Senate tie-breaking power.`
          : cleanCategory === 'military'
          ? `PENTAGON & CIVIL-MILITARY CONTEXT: Firing Chair of the Joint Chiefs of Staff ${cleanName} (${military?.jointChiefsChair?.branch || 'Joint Chiefs'}, doctrine: ${military?.jointChiefsChair?.doctrine || 'Active'}) triggers immediate Senate & House Armed Services oversight demands, Pentagon leadership churn, and allied defense scrutiny. Model a forceReadinessDelta between -7 and -1.`
          : cleanCategory === 'cabinet'
          ? `SENATE-CONFIRMED CABINET CONTEXT: Firing ${cleanRole} ${cleanName} moves the department under an Acting Secretary. Evaluate whether Congress viewed ${cleanName} as competent or controversial, and whether Senate leaders demand oversight hearings on replacement.`
          : cleanCategory === 'white_house'
          ? `WEST WING STAFF CONTEXT: ${cleanRole} ${cleanName} serves at the President's pleasure without Senate confirmation. Evaluate West Wing morale, press narrative of White House turmoil or decisive reset, and congressional reaction.`
          : `EXECUTIVE / WHITE HOUSE OFFICIAL CONTEXT: Dismissing ${cleanRole} (${cleanName}) — especially sensitive legal/intelligence roles like White House Counsel, FBI Director, or CIA Director — can spark Congressional Judiciary/Intelligence subpoenas, institutional pushback, or media praise/criticism depending on the stated reason.`;

      const prompt = `
In ${calendarDateLabel} (${scenarioTitle || 'Active Term'}), President ${profile?.name || 'Jordan Mercer'} (${partyLabel}, Approval: ${approval.toFixed(1)}%, Congress Support: ${congressSupport.toFixed(1)}%, House: ${houseSeats}/435, Senate: ${senateSeats}/100) has decided to FIRE / OUST ${cleanRole}: ${cleanName}.
Stated Presidential Reason: "${cleanReason}"

${categoryGuidance}

Active Cabinet Snapshot:
${Array.isArray(cabinet) ? cabinet.map((c: { roleTitle?: string; name?: string; loyalty?: number }) => `- ${c.roleTitle}: ${c.name} (loyalty ${c.loyalty}%)`).join('\n') : 'Standard cabinet'}

Simulate the immediate political, institutional, media, and Congressional fallout (keep all content strictly PG-13 and realistic).
Return ONLY a single JSON object:
{
  "constitutionalNote": "1 concise sentence on constitutional/institutional implications (required for VP, military, or legal/intel officials; brief administrative note otherwise)",
  "leadOutlet": "string",
  "leadHeadline": "string",
  "mediaSummary": "2-3 sentences describing the firing and immediate White House aftermath",
  "congressResponse": {
    "status": "Backlash" | "Hearings Demanded" | "Divided" | "Supportive",
    "summary": "2 sentences on Capitol Hill reaction across both parties",
    "majorityLeaderQuote": "1-2 sentences",
    "oppositionLeaderQuote": "1-2 sentences"
  },
  "mediaReactions": [
    {
      "outlet": "string",
      "category": "politics" | "defense" | "domestic" | "foreign" | "economy",
      "headline": "string",
      "summary": "1-2 sentences",
      "tone": "positive" | "neutral" | "critical"
    },
    {
      "outlet": "string",
      "category": "politics" | "defense" | "domestic" | "foreign" | "economy",
      "headline": "string",
      "summary": "1-2 sentences",
      "tone": "positive" | "neutral" | "critical"
    }
  ],
  "loyaltyShock": integer between 2 and 16 (how much remaining Cabinet loyalty dips from fear/turmoil),
  "metricDeltas": {
    "approval": number (-6.5 to +2.5),
    "congressSupport": number (-12 to +3),
    "diplomaticStanding": number (-6 to +1.5),
    "forceReadiness": number (-8 to 0, non-zero mainly for military/defense/NSA ousters)
  }
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a U.S. constitutional governance and Washington political simulation engine evaluating presidential firings of Vice Presidents, Cabinet Secretaries, Military Chiefs, and White House officials. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const defaultApproval =
        cleanCategory === 'vp'
          ? -3.8
          : cleanCategory === 'military'
          ? -2.2
          : cleanCategory === 'cabinet'
          ? -1.2
          : -0.6;
      const defaultCongress =
        cleanCategory === 'vp'
          ? -8.5
          : cleanCategory === 'military'
          ? -4.5
          : cleanCategory === 'cabinet'
          ? -2.8
          : -1.5;

      const rawDeltas = parsed.metricDeltas || {};
      const approvalDelta = Math.max(
        -8,
        Math.min(3, toNum(rawDeltas.approval, defaultApproval))
      );
      const congressDelta = Math.max(
        -14,
        Math.min(4, toNum(rawDeltas.congressSupport, defaultCongress))
      );
      const diplomaticDelta = Math.max(
        -8,
        Math.min(2, toNum(rawDeltas.diplomaticStanding, cleanCategory === 'vp' || cleanCategory === 'military' ? -2.0 : -0.5))
      );
      const readinessDelta =
        cleanCategory === 'military' || targetId === 'defense' || targetId === 'nsa'
          ? Math.max(-8, Math.min(0, toNum(rawDeltas.forceReadiness, cleanCategory === 'military' ? -4 : -1)))
          : 0;

      const rawReactions = Array.isArray(parsed.mediaReactions)
        ? parsed.mediaReactions
        : [];
      const mediaReactions = rawReactions.slice(0, 3).map((item: Record<string, unknown>, idx: number) => ({
        id: `fire-news-${Date.now()}-${idx}`,
        month: toNum(currentMonth, 1),
        outlet: String(item.outlet || (idx === 0 ? 'Capitol Dispatch' : 'The Washington Chronicle')),
        category: pickEnum(
          item.category,
          ['politics', 'defense', 'domestic', 'foreign', 'economy'] as const,
          cleanCategory === 'military' ? 'defense' : 'politics'
        ),
        headline: String(
          item.headline ||
            `${cleanRole} ${cleanName} Ousted in Sudden White House Shakeup`
        ),
        summary: String(
          item.summary ||
            `President ${profile?.name || ''} dismissed ${cleanName} citing ${cleanReason}.`
        ),
        tone: pickEnum(
          item.tone,
          ['positive', 'neutral', 'critical'] as const,
          'critical'
        ),
      }));

      if (mediaReactions.length === 0) {
        mediaReactions.push({
          id: `fire-news-${Date.now()}-0`,
          month: toNum(currentMonth, 1),
          outlet: String(parsed.leadOutlet || 'The Washington Chronicle'),
          category: cleanCategory === 'military' ? 'defense' : 'politics',
          headline: String(
            parsed.leadHeadline ||
              `President Dismisses ${cleanRole} ${cleanName}`
          ),
          summary: String(
            parsed.mediaSummary ||
              `${cleanName} departed the administration immediately following orders from the Oval Office.`
          ),
          tone: 'critical',
        });
      }

      const rawCongress = parsed.congressResponse || {};
      const status = String(
        rawCongress.status ||
          (cleanCategory === 'vp' ? 'Constitutional Crisis' : 'Hearings Demanded')
      );

      return {
        targetCategory: cleanCategory,
        targetId: typeof targetId === 'string' ? targetId : undefined,
        targetName: cleanName,
        roleTitle: cleanRole,
        reason: cleanReason,
        constitutionalNote: String(
          parsed.constitutionalNote ||
            (cleanCategory === 'vp'
              ? 'Under Article II and the 25th Amendment, forcing out an elected Vice President creates a severe constitutional vacancy until Congress confirms a successor.'
              : cleanCategory === 'military'
              ? 'Dismissing the Chair of the Joint Chiefs triggers immediate Armed Services Committee oversight and interim Joint Staff continuity.'
              : 'Department operations shift to an Acting official pending permanent leadership.')
        ),
        leadOutlet: String(parsed.leadOutlet || 'The Washington Chronicle'),
        leadHeadline: String(
          parsed.leadHeadline ||
            (cleanCategory === 'vp'
              ? `Constitutional Crisis: Vice President ${cleanName} Forced Out by White House`
              : `President Dismisses ${cleanRole} ${cleanName} in Administration Shakeup`)
        ),
        mediaSummary: String(
          parsed.mediaSummary ||
            `President ${profile?.name || ''} terminated ${cleanName} as ${cleanRole}, reshaping West Wing leadership amid intense Capitol scrutiny.`
        ),
        congressResponse: {
          status,
          summary: String(
            rawCongress.summary ||
              'Lawmakers across both chambers convened emergency caucus briefings to assess the institutional and policy fallout.'
          ),
          majorityLeaderQuote: String(
            rawCongress.majorityLeaderQuote ||
              'We expect an immediate briefing from the White House on continuity of leadership and statutory oversight.'
          ),
          oppositionLeaderQuote: String(
            rawCongress.oppositionLeaderQuote ||
              'Abrupt purges at the highest levels of government undermine institutional stability and public trust.'
          ),
        },
        mediaReactions,
        loyaltyShock: Math.max(
          2,
          Math.min(
            18,
            Math.round(
              toNum(
                parsed.loyaltyShock,
                cleanCategory === 'vp' ? 12 : cleanCategory === 'cabinet' ? 6 : 4
              )
            )
          )
        ),
        metricDeltas: {
          approval: Number(approvalDelta.toFixed(1)),
          congressSupport: Number(congressDelta.toFixed(1)),
          diplomaticStanding: Number(diplomaticDelta.toFixed(1)),
          forceReadiness: readinessDelta,
        },
      };
    });
  });

  app.post('/api/nominate-vp', async (req, res) => {
    await runJsonWithKeepAlive(res, async () => {
      const { profile, currentVpName, nomineeDirection, metrics } = req.body || {};
      const ai = getAIClient();

      const senateSeats = toNum(metrics?.senateSeats, 50);
      const houseSeats = toNum(metrics?.houseSeats, 218);
      const congressSupport = toNum(metrics?.congressSupport, 48);
      const approval = toNum(metrics?.approval, 48);
      const partyLabel = resolvePartyLabel(profile);

      const prompt = `
Under the 25th Amendment (Section 2) of the U.S. Constitution, President ${profile?.name || 'Jordan Mercer'} (${partyLabel}) is nominating a new Vice President to replace ${currentVpName || 'Vacant Office'}.
Player's VP Nominee Direction: "${nomineeDirection || 'Nominate a broadly respected consensus governing partner capable of winning majority confirmation in BOTH the House and Senate.'}"

Congressional Context:
- House Coalition: ${houseSeats}/435 (218 needed)
- Senate Coalition: ${senateSeats}/100 (51 needed — no sitting VP tie-break if vacant!)
- Congressional Support: ${congressSupport.toFixed(1)}%
- Presidential Approval: ${approval.toFixed(1)}%

Generate a realistic Vice Presidential nominee and score bipartisanAppeal (-12 polarizing to +12 consensus).
Return ONLY valid JSON:
{
  "name": "string",
  "formerTitle": "string",
  "leaning": "string",
  "loyalty": integer 65-95,
  "popularity": integer 40-80,
  "bipartisanAppeal": integer -12 to 12,
  "traitSummary": "short 4-7 word governance trait",
  "currentCounsel": "1-2 sentences of opening VP counsel",
  "confirmHeadline": "string",
  "rejectHeadline": "string",
  "confirmCommitteeNote": "2 sentences",
  "rejectCommitteeNote": "2 sentences"
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a U.S. constitutional simulation engine modeling 25th Amendment Section 2 Vice Presidential confirmations requiring majorities in BOTH the House and Senate. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const appeal = Math.max(-12, Math.min(12, toNum(parsed.bipartisanAppeal, 2)));
      const supportShift = (congressSupport - 50) * 0.14;
      const approvalShift = (approval - 48) * 0.08;
      const senateYea = Math.max(
        28,
        Math.min(84, Math.round(senateSeats + supportShift + approvalShift + appeal * 0.65))
      );
      const senateNay = 100 - senateYea;
      const houseYea = Math.max(
        130,
        Math.min(
          330,
          Math.round(houseSeats + supportShift * 2.8 + approvalShift * 2.0 + appeal * 2.5)
        )
      );
      const houseNay = 435 - houseYea;

      // 25th Amendment Section 2 requires BOTH houses by majority vote!
      const approved = senateYea >= 51 && houseYea >= 218;
      const nomineeName = String(parsed.name || 'Sen. Consensus Nominee');
      const voteMarginLabel = approved
        ? `Confirmed · Senate ${senateYea}–${senateNay}, House ${houseYea}–${houseNay}`
        : `Rejected · Senate ${senateYea}–${senateNay}, House ${houseYea}–${houseNay}`;

      return {
        previousName: String(currentVpName || 'Vacant Office'),
        nomineeName,
        formerTitle: String(parsed.formerTitle || 'Senior Public Servant'),
        leaning: String(parsed.leaning || 'Bipartisan Institutionalist'),
        loyalty: Math.max(50, Math.min(95, Math.round(toNum(parsed.loyalty, 82)))),
        popularity: Math.max(35, Math.min(85, Math.round(toNum(parsed.popularity, 56)))),
        traitSummary: String(parsed.traitSummary || '25th Amendment Consensus Partner'),
        currentCounsel: String(
          parsed.currentCounsel ||
            'Ready to rebuild bipartisan Senate working relationships and restore steady executive leadership.'
        ),
        approved,
        senateYea,
        senateNay,
        houseYea,
        houseNay,
        voteMarginLabel,
        confirmationHeadline: approved
          ? String(parsed.confirmHeadline || `Congress Confirms ${nomineeName} as Vice President Under 25th Amendment`)
          : String(parsed.rejectHeadline || `Congress Rejects Vice Presidential Nominee ${nomineeName}`),
        committeeSummary: approved
          ? String(parsed.confirmCommitteeNote || 'Both the House and Senate voted by majority to confirm the 25th Amendment nominee.')
          : String(parsed.rejectCommitteeNote || 'Without majorities in both chambers under the 25th Amendment, the nomination fell short.'),
        congressDelta: approved ? (appeal >= 5 ? 3.5 : 1.5) : -4.0,
        approvalDelta: approved ? (appeal >= 5 ? 2.0 : 0.8) : -2.0,
      };
    });
  });

  app.post('/api/press-conference/questions', async (req, res) => {
    const {
      profile,
      scenarioTitle,
      currentMonth,
      metrics,
      history,
      newsFeed,
      legislativeRecords,
      diplomaticMissions,
      currentBriefing,
    } = req.body || {};

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );

      const recentHistory = Array.isArray(history)
        ? history
            .slice(-3)
            .map(
              (h: any) =>
                `M${h.month}: Policy "${String(h.policyDirective || '').slice(0, 120)}" -> Headline "${h.outcome?.newspaperHeadline || ''}"`
            )
            .join(' | ')
        : 'None yet (opening month of term).';

      const recentHeadlines = Array.isArray(newsFeed)
        ? newsFeed
            .slice(-8)
            .map(
              (n: any) =>
                `[${n.outlet} · ${n.category} · M${n.month}] ${n.headline}`
            )
            .join(' | ')
        : 'No prior wire stories yet.';

      const recentLaws = Array.isArray(legislativeRecords)
        ? legislativeRecords
            .slice(-4)
            .map(
              (r: any) =>
                `M${r.month} (${r.recordType}, ${r.outcomeStatus}): ${r.title}`
            )
            .join(' | ')
        : 'None yet.';

      const activeEnvoys = Array.isArray(diplomaticMissions)
        ? diplomaticMissions
            .filter((d: any) => d.status === 'In Progress')
            .slice(0, 3)
            .map(
              (d: any) =>
                `${d.envoyName} to ${d.targetCountry} (${d.missionTitle})`
            )
            .join(' | ')
        : '';

      const reporterPool = [
        { reporterName: 'Elena Vance', outlet: 'The Washington Chronicle', beat: 'politics' },
        { reporterName: 'Marcus Thorne', outlet: 'Financial Ledger Times', beat: 'economy' },
        { reporterName: 'Nadia Al-Mansoor', outlet: 'Global Wire Bureau', beat: 'foreign' },
        { reporterName: 'David Kowalski', outlet: 'Capitol Broadcast Network', beat: 'domestic' },
        { reporterName: 'Simone Mercer', outlet: 'Defense Capitol Dispatch', beat: 'defense' },
        { reporterName: 'Julian Brooks', outlet: 'Associated Press', beat: 'politics' },
        { reporterName: 'Claire Takahashi', outlet: 'Pacific Economic Review', beat: 'economy' },
        { reporterName: 'Samuel Okafor', outlet: 'Diplomatic Observer', beat: 'foreign' },
      ];
      const shuffled = [...reporterPool].sort(() => Math.random() - 0.5).slice(0, 4);
      const randomNonce = Math.floor(Math.random() * 1000000);

      const prompt = `
Generate 3 sharp, realistic, randomly varied White House Press Corps questions for a live presidential press conference in the James S. Brady Briefing Room.

RANDOMIZATION SEED: ${randomNonce}
SUGGESTED PRESS CORPS SEATS (mix beats cleanly):
${shuffled.map((r, i) => `${i + 1}. ${r.reporterName} (${r.outlet}, beat: ${r.beat})`).join('\n')}

ADMINISTRATION & NATIONAL CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (${partyLabel}, former ${profile?.background || 'governor'})
- Scenario & Date: ${scenarioTitle || 'Active Term'} · ${calendarDateLabel} (Month ${currentMonth || 1})
- Metrics: Approval ${metrics?.approval ?? 50}% | Congress Support ${metrics?.congressSupport ?? 50}% | GDP Growth ${metrics?.gdpGrowth ?? 2.2}% | Inflation ${metrics?.inflation ?? 3.1}% | Unemployment ${metrics?.unemployment ?? 4.3}% | Debt $${metrics?.nationalDebtTrillions ?? 34.5}T | Diplomacy ${metrics?.diplomaticStanding ?? 60}/100
- Current Briefing Dilemma: ${currentBriefing?.title || ''} — ${currentBriefing?.urgentDilemma || ''}
- Recent Term Decisions: ${recentHistory}
- Recent News Headlines: ${recentHeadlines}
- Recent Legislative/Executive Actions: ${recentLaws}
- Active Diplomatic Envoys: ${activeEnvoys || 'None currently deployed.'}

INSTRUCTIONS:
1. Write exactly 3 distinct journalist questions grounded directly in the recent headlines, policy decisions, economic/diplomatic metrics, or briefing dilemma above.
2. Each question must feel spontaneous, specific, and pointed—the kind of tough follow-up White House correspondents actually ask (1-2 sentences, ending with a clear question mark).
3. Include a brief "contextRef" string (under 10 words, plain text) naming the recent event, headline, or metric behind the question.
4. Vary beats across the 3 questions (do not ask 3 questions on the exact same topic).

Return ONLY a JSON object matching:
{
  "questions": [
    {
      "reporterName": "string",
      "outlet": "string",
      "beat": "economy|foreign|domestic|defense|politics",
      "question": "string",
      "contextRef": "string"
    }
  ]
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a White House Press Corps question generator. Ground every question in the specific recent events, metrics, and headlines provided. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const rawQuestions = Array.isArray(parsed.questions)
        ? parsed.questions.slice(0, 3)
        : [];

      if (rawQuestions.length === 0) {
        throw new Error('Unable to generate press corps questions right now.');
      }

      const questions = rawQuestions.map((q: any, idx: number) => ({
        id: `pc-q-${currentMonth || 1}-${Date.now()}-${idx}`,
        reporterName: String(
          q?.reporterName || shuffled[idx]?.reporterName || 'White House Correspondent'
        ),
        outlet: String(
          q?.outlet || shuffled[idx]?.outlet || 'National Press Wire'
        ),
        beat: pickEnum(
          q?.beat,
          ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
          (shuffled[idx]?.beat as 'economy' | 'foreign' | 'domestic' | 'defense' | 'politics') || 'politics'
        ),
        question: String(
          q?.question ||
            'Mr. President, how do you respond to critics of your administration’s recent policy direction?'
        ),
        contextRef: String(
          q?.contextRef || `Month ${currentMonth || 1} White House Briefing`
        ),
      }));

      return { questions };
    });
  });

  app.post('/api/press-conference/answer', async (req, res) => {
    const {
      profile,
      scenarioTitle,
      currentMonth,
      metrics,
      cabinet,
      questionItem,
      answer,
    } = req.body || {};

    const cleanAnswer = typeof answer === 'string' ? answer.trim() : '';
    if (!cleanAnswer) {
      return res.status(400).json({
        error: 'Please enter your response to the journalist before answering.',
      });
    }
    if (!questionItem || typeof questionItem.question !== 'string') {
      return res.status(400).json({
        error: 'Missing journalist question context.',
      });
    }

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );

      const keyAdvisors = Array.isArray(cabinet)
        ? cabinet
            .slice(0, 5)
            .map(
              (c: { roleTitle: string; name: string; status?: string }) =>
                `${c.roleTitle}: ${c.name} (${c.status || 'Aligned'})`
            )
            .join(' | ')
        : '';

      const prompt = `
The President just answered a journalist's live question during a televised White House Press Conference. Evaluate the President's exact spoken answer and generate the resulting approval impact and news headlines.

CONTEXT:
- President: ${profile?.name || 'Jordan Mercer'} (${partyLabel})
- Scenario & Date: ${scenarioTitle || 'Active Term'} · ${calendarDateLabel} (Month ${currentMonth || 1})
- Current Metrics: Approval ${metrics?.approval ?? 50}% | Congress Support ${metrics?.congressSupport ?? 50}% | Inflation ${metrics?.inflation ?? 3.1}% | GDP Growth ${metrics?.gdpGrowth ?? 2.2}% | Diplomacy ${metrics?.diplomaticStanding ?? 60}/100
- Key Cabinet: ${keyAdvisors}
- Journalist: ${questionItem.reporterName} (${questionItem.outlet}, beat: ${questionItem.beat})
- Question Context: ${questionItem.contextRef || 'Recent administration events'}
- Journalist's Exact Question: "${questionItem.question}"
- President's Exact Answer: "${cleanAnswer}"

EVALUATION GUIDELINES:
1. Judge the President's answer strictly on political substance, clarity, credibility, tone, and responsiveness to the specific question:
   - "Commanding Response": Clear, specific, empathetic/statesmanlike, directly answers the question with credible policy or reassurance (+1.5 to +4.0 approval).
   - "Measured Clarification": Reasonable, calm, steady communication without major new commitments (+0.4 to +1.8 approval).
   - "Combative Pushback": Attacks the press/critics or doubles down aggressively; energizes base while alienating moderates (-1.2 to +1.2 approval).
   - "Evasive Pivot": Dodges the core question with vague talking points (-0.5 to -2.2 approval).
   - "Damaging Gaffe": Contradictory, dismissive of public hardship, factually implausible, hostile/incoherent, or provocative blunder (-1.8 to -4.0 approval).
2. Generate 2-3 crisp, realistic breaking news headlines ("mediaReactions") directly quoting or reacting to what the President actually said in this answer.
3. Provide a 1-sentence "reporterFollowUp" capturing the immediate press-room reaction from ${questionItem.reporterName} or the press corps.

Return ONLY a single JSON object matching this exact schema:
{
  "verdictLabel": "Commanding Response|Measured Clarification|Combative Pushback|Evasive Pivot|Damaging Gaffe",
  "leadHeadline": "string",
  "mediaSummary": "1-2 sentences analyzing how voters, markets, and Capitol Hill judged the President's answer",
  "reporterFollowUp": "1 concise sentence from the briefing room",
  "approvalDelta": number,
  "congressDelta": number,
  "diplomaticDelta": number,
  "voterBlocDeltas": {
    "workingClass": number,
    "suburbanModerates": number,
    "techFinance": number,
    "seniors": number,
    "youngVoters": number
  },
  "mediaReactions": [
    {
      "outlet": "string",
      "category": "economy|foreign|domestic|defense|politics",
      "headline": "string",
      "summary": "1 sentence",
      "tone": "positive|neutral|critical"
    }
  ]
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded White House political press simulation engine. Evaluate the President’s spoken answer to a specific journalist question fairly and realistically, returning valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const clampDelta = (v: unknown, lim: number) =>
        Number(Math.max(-lim, Math.min(lim, toNum(v, 0))).toFixed(1));

      const vd = parsed.voterBlocDeltas || {};
      const verdictLabel = pickEnum(
        parsed.verdictLabel,
        [
          'Commanding Response',
          'Measured Clarification',
          'Combative Pushback',
          'Evasive Pivot',
          'Damaging Gaffe',
        ] as const,
        'Measured Clarification'
      );

      const leadHeadline = String(
        parsed.leadHeadline ||
          `President Addresses ${questionItem.outlet} Question at Brady Briefing`
      );
      const mediaSummary = String(
        parsed.mediaSummary ||
          'Broadcast networks and Capitol Hill aides parsed the President’s live briefing remarks immediately after the exchange.'
      );
      const reporterFollowUp = String(
        parsed.reporterFollowUp ||
          `${questionItem.reporterName} jotted down the exchange as neighboring correspondents shouted follow-ups.`
      );

      const defaultCategory = pickEnum(
        questionItem.beat,
        ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
        'politics'
      );

      const parsedMedia = Array.isArray(parsed.mediaReactions)
        ? parsed.mediaReactions.slice(0, 3).map((n: any) => ({
            outlet: String(n?.outlet || questionItem.outlet || 'Associated Press'),
            category: pickEnum(
              n?.category,
              ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
              defaultCategory
            ),
            headline: String(n?.headline || leadHeadline),
            summary: String(n?.summary || mediaSummary),
            tone: pickEnum(
              n?.tone,
              ['positive', 'neutral', 'critical'] as const,
              'neutral'
            ),
          }))
        : [];

      if (parsedMedia.length === 0) {
        parsedMedia.push({
          outlet: String(questionItem.outlet || 'National Press Wire'),
          category: defaultCategory,
          headline: leadHeadline,
          summary: mediaSummary,
          tone:
            verdictLabel === 'Commanding Response'
              ? 'positive'
              : verdictLabel === 'Damaging Gaffe' || verdictLabel === 'Evasive Pivot'
              ? 'critical'
              : 'neutral',
        });
      }

      return {
        verdictLabel,
        leadHeadline,
        mediaSummary,
        reporterFollowUp,
        approvalDelta: clampDelta(parsed.approvalDelta, 4.0),
        congressDelta: clampDelta(parsed.congressDelta, 2.5),
        diplomaticDelta: clampDelta(parsed.diplomaticDelta, 2.0),
        voterBlocDeltas: {
          workingClass: clampDelta(vd.workingClass, 4),
          suburbanModerates: clampDelta(vd.suburbanModerates, 4),
          techFinance: clampDelta(vd.techFinance, 4),
          seniors: clampDelta(vd.seniors, 4),
          youngVoters: clampDelta(vd.youngVoters, 4),
        },
        mediaReactions: parsedMedia,
      };
    });
  });

  app.post('/api/state-of-the-union', async (req, res) => {
    const {
      profile,
      vicePresident,
      scenarioTitle,
      currentMonth,
      yearNumber,
      metrics,
      themeTitle,
      customRemarks,
    } = req.body || {};

    const cleanTheme =
      typeof themeTitle === 'string' && themeTitle.trim()
        ? themeTitle.trim()
        : 'National Renewal & Institutional Accountability';
    const cleanRemarks =
      typeof customRemarks === 'string' && customRemarks.trim()
        ? customRemarks.trim()
        : 'We stand before a Joint Session of Congress ready to deliver results for every American household.';

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const partyLabel = resolvePartyLabel(profile);
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );

      const prompt = `
President ${profile?.name || 'Jordan Mercer'} (${partyLabel}) just delivered the Year ${yearNumber || 1} State of the Union Address to a Joint Session of Congress.

CONTEXT:
- Date & Scenario: ${calendarDateLabel} · ${scenarioTitle || 'Active Term'}
- Vice President: ${vicePresident?.name || 'Sen. Claire Bennett'}
- House / Senate Balance: House ${metrics?.houseSeats ?? 218}/435 | Senate ${metrics?.senateSeats ?? 50}/100
- Current Metrics: Approval ${metrics?.approval ?? 50}% | Congress Support ${metrics?.congressSupport ?? 50}% | GDP Growth ${metrics?.gdpGrowth ?? 2.2}% | Inflation ${metrics?.inflation ?? 3.1}% | Unemployment ${metrics?.unemployment ?? 4.3}% | Debt $${metrics?.nationalDebtTrillions ?? 34.5}T | Diplomacy ${metrics?.diplomaticStanding ?? 60}/100
- Keynote Theme: ${cleanTheme}
- President's Signature Remarks: "${cleanRemarks}"

INSTRUCTIONS:
Evaluate the speech honestly given the administration's live economic/political standing, chamber balance, and message tone.
Return ONLY a JSON object matching:
{
  "chamberReception": "Standing Ovation & Bipartisan Applause|Respectful Partisan Divide|Rowdy Heckling & Tense Floor|Frosty Reception",
  "leadOutlet": "string",
  "leadHeadline": "string",
  "mediaSummary": "2 sentences summarizing television reception, market reaction, and House/Senate chamber atmosphere",
  "speakerReaction": "1-2 sentences quoting Majority / House leadership",
  "oppositionRebuttal": "1-2 sentences quoting the official Opposition televised rebuttal",
  "approvalDelta": number,
  "congressDelta": number,
  "diplomaticDelta": number,
  "voterBlocDeltas": {
    "workingClass": number,
    "suburbanModerates": number,
    "techFinance": number,
    "seniors": number,
    "youngVoters": number
  },
  "mediaReactions": [
    {
      "outlet": "string",
      "category": "economy|foreign|domestic|defense|politics",
      "headline": "string",
      "summary": "1 sentence",
      "tone": "positive|neutral|critical"
    }
  ]
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded White House & Congressional State of the Union speech simulation engine. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const clampDelta = (v: unknown, lim: number) =>
        Number(Math.max(-lim, Math.min(lim, toNum(v, 0))).toFixed(1));
      const vd = parsed.voterBlocDeltas || {};

      const leadOutlet = String(
        parsed.leadOutlet || 'The Washington Chronicle'
      );
      const leadHeadline = String(
        parsed.leadHeadline ||
          `President ${profile?.name || 'Mercer'} Outlines ${cleanTheme} in Joint Session Address`
      );
      const mediaSummary = String(
        parsed.mediaSummary ||
          'Lawmakers and prime-time broadcast analysts weighed the President’s annual priorities against economic and legislative realities.'
      );

      const parsedMedia = Array.isArray(parsed.mediaReactions)
        ? parsed.mediaReactions.slice(0, 3).map((n: any) => ({
            outlet: String(n?.outlet || 'Associated Press'),
            category: pickEnum(
              n?.category,
              ['economy', 'foreign', 'domestic', 'defense', 'politics'] as const,
              'politics'
            ),
            headline: String(n?.headline || leadHeadline),
            summary: String(n?.summary || mediaSummary),
            tone: pickEnum(
              n?.tone,
              ['positive', 'neutral', 'critical'] as const,
              'neutral'
            ),
          }))
        : [];

      if (parsedMedia.length === 0) {
        parsedMedia.push({
          outlet: leadOutlet,
          category: 'politics' as const,
          headline: leadHeadline,
          summary: mediaSummary,
          tone: 'neutral' as const,
        });
      }

      return {
        yearNumber: Number(yearNumber || 1),
        themeTitle: cleanTheme,
        customRemarks: cleanRemarks,
        chamberReception: String(
          parsed.chamberReception || 'Respectful Partisan Divide'
        ),
        leadOutlet,
        leadHeadline,
        mediaSummary,
        speakerReaction: String(
          parsed.speakerReaction ||
            'Chamber leaders acknowledged the President’s priorities while signaling tough committee negotiations ahead.'
        ),
        oppositionRebuttal: String(
          parsed.oppositionRebuttal ||
            'Opposition leaders delivered a televised rebuttal urging tighter spending discipline and greater accountability.'
        ),
        approvalDelta: clampDelta(parsed.approvalDelta, 4.5),
        congressDelta: clampDelta(parsed.congressDelta, 4.0),
        diplomaticDelta: clampDelta(parsed.diplomaticDelta, 2.5),
        voterBlocDeltas: {
          workingClass: clampDelta(vd.workingClass, 4),
          suburbanModerates: clampDelta(vd.suburbanModerates, 4),
          techFinance: clampDelta(vd.techFinance, 4),
          seniors: clampDelta(vd.seniors, 4),
          youngVoters: clampDelta(vd.youngVoters, 4),
        },
        mediaReactions: parsedMedia,
      };
    });
  });

  app.post('/api/situation-room/intel-brief', async (req, res) => {
    const {
      profile,
      scenarioTitle,
      currentMonth,
      metrics,
      military,
      diplomaticMissions,
    } = req.body || {};

    await runJsonWithKeepAlive(res, async () => {
      const ai = getAIClient();
      const calendarDateLabel = formatServerCalendarLabel(
        currentMonth,
        profile?.startingYear
      );
      const opsSummary =
        Array.isArray(military?.operations) && military.operations.length > 0
          ? military.operations
              .map((o: any) => `${o.name} (${o.region} · ${o.posture})`)
              .join('; ')
          : 'No active overseas combat deployments';
      const envoySummary =
        Array.isArray(diplomaticMissions) && diplomaticMissions.length > 0
          ? diplomaticMissions
              .map(
                (m: any) =>
                  `${m.envoyName} in ${m.targetCountry} (${m.status})`
              )
              .join('; ')
          : 'No active envoy deployments';

      const prompt = `
Prepare a classified Presidential Daily Brief (PDB) for President ${profile?.name || 'Jordan Mercer'} in the White House Situation Room.

CONTEXT:
- Date & Scenario: ${calendarDateLabel} · ${scenarioTitle || 'Active Term'}
- DEFCON Level: ${military?.defconLevel ?? 4} | Force Readiness: ${military?.forceReadiness ?? 80}% | Cyber Posture: ${military?.cyberPosture || 'Normal'}
- Diplomatic Standing: ${metrics?.diplomaticStanding ?? 60}/100 | Approval: ${metrics?.approval ?? 50}%
- Active Military Operations: ${opsSummary}
- Active Diplomatic Envoys: ${envoySummary}

Return ONLY valid JSON:
{
  "threatLevel": "Guarded|Elevated|High|Severe",
  "executiveSummary": "2-3 authoritative intelligence sentences assessing global flashpoints, cyber threats, and alliance posture.",
  "flashpoints": [
    {
      "region": "string (e.g., Indo-Pacific / Taiwan Strait)",
      "severity": "Watch|Elevated|Critical",
      "assessment": "1-2 sentences of specific actionable intelligence"
    }
  ],
  "recommendedActionTitle": "short 4-7 word action title",
  "recommendedTargetCountry": "specific country or flashpoint name",
  "recommendedScenarioType": "Targeted Strikes & No-Fly Zone|Naval Blockade & Sanctions|Covert & Cyber Operation|Allied Deterrence Surge|End War / Peace Treaty",
  "recommendedOrderText": "2 sentences ready to execute in the Situation Room"
}`;

      const parsed = await generateGeminiJson(ai, {
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are a grounded National Security Council & CIA Presidential Daily Brief simulation engine. Return valid JSON only.',
          responseMimeType: 'application/json',
        },
      });

      const validThreat = pickEnum(
        parsed.threatLevel,
        ['Guarded', 'Elevated', 'High', 'Severe'] as const,
        'Elevated'
      );

      const validScenario = pickEnum(
        parsed.recommendedScenarioType,
        [
          'Targeted Strikes & No-Fly Zone',
          'Naval Blockade & Sanctions',
          'Covert & Cyber Operation',
          'Allied Deterrence Surge',
          'End War / Peace Treaty',
        ] as const,
        'Covert & Cyber Operation'
      );

      const flashpoints = Array.isArray(parsed.flashpoints)
        ? parsed.flashpoints.slice(0, 3).map((fp: any) => ({
            region: String(fp?.region || 'Eastern Mediterranean'),
            severity: pickEnum(
              fp?.severity,
              ['Watch', 'Elevated', 'Critical'] as const,
              'Elevated'
            ),
            assessment: String(
              fp?.assessment ||
                'Heightened naval and signals activity detected near allied shipping lanes.'
            ),
          }))
        : [
            {
              region: 'Indo-Pacific Maritime Corridor',
              severity: 'Elevated' as const,
              assessment:
                'Increased naval patrols and cyber probing reported across allied regional ports.',
            },
          ];

      return {
        threatLevel: validThreat,
        executiveSummary: String(
          parsed.executiveSummary ||
            'Intelligence agencies report elevated strategic friction across maritime and cyber domains, recommending targeted allied deterrence.'
        ),
        flashpoints,
        recommendedActionTitle: String(
          parsed.recommendedActionTitle || 'Authorize Cyber & Maritime Deterrence'
        ),
        recommendedTargetCountry: String(
          parsed.recommendedTargetCountry || 'Red Sea / Yemen'
        ),
        recommendedScenarioType: validScenario,
        recommendedOrderText: String(
          parsed.recommendedOrderText ||
            'Direct USCYBERCOM and regional naval commands to reinforce allied maritime corridors and disrupt adversary command-and-control nodes while minimizing escalation.'
        ),
      };
    });
  });

  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use(
    '/api',
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      const { status, error } = formatErrorResponse(err);
      res.status(status).json({ error });
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      appType: 'spa',
      plugins: [
        {
          name: 'disable-vite-hmr-client',
          enforce: 'post',
          transform(code: string, id: string) {
            if (id.includes('vite/dist/client/client.mjs')) {
              const updated = code.replace(
                /const transport = normalizeModuleRunnerTransport\(\(\(\) => \{[\s\S]*?\}\)\(\)\);/,
                'const transport = normalizeModuleRunnerTransport({ async connect() {}, async disconnect() {}, send() {} });'
              );
              if (updated !== code) {
                return { code: updated, map: null };
              }
            }
            return null;
          },
        },
      ],
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Executive Term server listening on http://0.0.0.0:${PORT}`);
  });
  server.requestTimeout = 180000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.on('error', (err) => {
    console.error('[Executive Term Server Error]', err);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
