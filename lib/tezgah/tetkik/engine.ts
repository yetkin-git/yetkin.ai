import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import { fetchPublicHomepage, type FetchPublicHomepageDeps } from "@/lib/tezgah/tetkik/fetch-html";
import { inspectTetkikUrl, TetkikAccessError } from "@/lib/tezgah/tetkik/guard";
import { guardTetkikNarrative } from "@/lib/tezgah/tetkik/narrative";
import { parseHomepageHtml } from "@/lib/tezgah/tetkik/parse-html";
import { clipTetkikNarrative, tetkikSystemPrompt, tetkikUserPrompt } from "@/lib/tezgah/tetkik/prompts";
import { TETKIK_REJECTED_MESSAGE } from "@/lib/tezgah/tetkik/rubric";
import { tetkikGenerateRequestSchema, type TetkikGenerateRequest } from "@/lib/tezgah/tetkik/schema";
import { scoreTetkik } from "@/lib/tezgah/tetkik/score";
import { normalizeTetkikSiteAddress } from "@/lib/tezgah/tetkik/site-address";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

/** Kapak raporu 900 tokena sığmaz. Skor yine kodda kalır. */
export const TETKIK_MAX_OUTPUT_TOKENS = 1_600;
export const TETKIK_MODEL_ROLE = "LITE_STREAM" as const;

export type TetkikGenerateResult =
  | ({
      ok: true;
      remaining: number;
      limit: number;
      guest: boolean;
    } & TetkikReport)
  | {
      ok: false;
      error: string;
      status: 400 | 402 | 429 | 503;
      remaining: number;
      limit: number;
      guest: boolean;
    };

export type GenerateTetkikDeps = InvokeLlmDeps &
  FetchPublicHomepageDeps & {
    now?: () => Date;
    invoke?: typeof invokeLlm;
  };

function plain(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function coverTitle(given: string, finalUrl: string): string {
  const name = plain(given, 80);
  if (name.length >= 2) {
    return name;
  }
  try {
    const host = new URL(finalUrl).hostname.replace(/\.$/, "").replace(/^www\./, "");
    const label = plain(host, 80);
    if (label.length >= 2) {
      return label;
    }
  } catch {
    // başlık yedeklenir
  }
  return "Web sitesi";
}

export async function generateTetkikReport(
  input: {
    actorId: string;
    guest: boolean;
    request: TetkikGenerateRequest;
    commandKey?: string | null;
  },
  deps: GenerateTetkikDeps = {},
): Promise<TetkikGenerateResult> {
  const parsed = tetkikGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  const open = () => peekTezgahQuota(input.actorId, input.guest, now);
  if (!parsed.success) {
    const quota = await open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const inspected = inspectTetkikUrl(normalizeTetkikSiteAddress(parsed.data.url) ?? parsed.data.url);
  if (!inspected.ok) {
    const quota = await open();
    return {
      ok: false,
      error: TETKIK_REJECTED_MESSAGE,
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const slot = await consumeTezgahQuota(
    input.actorId,
    input.guest,
    now,
    input.commandKey ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) } : null,
  );
  if (!slot.allowed) {
    return {
      ok: false,
      error: slot.error ?? (input.guest ? TEZGAH_GUEST_QUOTA_MESSAGE : TEZGAH_MEMBER_QUOTA_MESSAGE),
      status: slot.status ?? 429,
      remaining: 0,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  const restore = async (error: string, status: 400 | 503): Promise<TetkikGenerateResult> => {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane);
    return {
      ok: false,
      error,
      status,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  };

  let page;
  try {
    page = await fetchPublicHomepage(inspected.url, deps);
  } catch (error) {
    if (error instanceof TetkikAccessError && error.kind === "rejected") {
      return restore(TETKIK_REJECTED_MESSAGE, 400);
    }
    return restore(TEZGAH_FAIL_MESSAGE, 503);
  }

  const parsedHtml = parseHomepageHtml(page.html);
  const scored = scoreTetkik(parsedHtml, {
    https: page.finalUrl.startsWith("https:"),
    ttfbMs: page.ttfbMs,
    htmlBytes: page.htmlBytes,
  });
  const cover = {
    businessName: coverTitle(parsed.data.businessName ?? "", page.finalUrl),
    freelancerName: "",
    agencyName: null as string | null,
  };
  const pageTitle = plain(parsedHtml.title, 120);
  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: TETKIK_MODEL_ROLE,
      system: tetkikSystemPrompt(scored.score),
      user: tetkikUserPrompt({
        score: scored.score,
        url: page.finalUrl,
        businessName: cover.businessName,
        freelancerName: cover.freelancerName,
        agencyName: cover.agencyName,
        pageTitle,
        ttfbMs: page.ttfbMs,
        htmlBytes: page.htmlBytes,
        checks: scored.checks,
        opportunities: scored.opportunities,
        actionTitle: scored.action.title,
        actionBody: scored.action.body,
      }),
      temperature: 0.2,
      maxOutputTokens: TETKIK_MAX_OUTPUT_TOKENS,
      maxAttempts: 1,
      timeoutMs: 25_000,
      rateLimit: {
        identifier: input.actorId,
        scope: "tezgah",
        limit: 8,
        windowMs: 60_000,
      },
      billing: {
        userId: input.guest ? null : input.actorId,
        source: AI_TOKEN_SOURCES.TEZGAH,
        recordUsage: true,
      },
    },
    deps,
  );

  const narrative = clipTetkikNarrative(guardTetkikNarrative(llm?.text ?? "", scored.score));
  if (narrative.length < 12) {
    return restore(TEZGAH_FAIL_MESSAGE, 503);
  }

  const paid = await settleTezgahSlot(input.actorId, slot);
  if (!paid.ok) {
    return {
      ok: false,
      error: paid.error,
      status: paid.status,
      remaining: slot.remaining,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  return {
    ok: true,
    tool: "tetkik",
    score: scored.score,
    maxScore: scored.maxScore,
    disclaimer: scored.disclaimer,
    measuredAt: now.toISOString(),
    url: page.finalUrl,
    businessName: cover.businessName,
    freelancerName: cover.freelancerName,
    agencyName: cover.agencyName,
    pageTitle,
    ttfbMs: page.ttfbMs,
    htmlBytes: page.htmlBytes,
    checks: scored.checks,
    opportunities: scored.opportunities,
    action: scored.action,
    narrative,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
