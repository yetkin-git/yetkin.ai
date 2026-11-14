import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota } from "@/lib/tezgah/quota";
import { fetchPublicHomepage, type FetchPublicHomepageDeps } from "@/lib/tezgah/tetkik/fetch-html";
import { inspectTetkikUrl, TetkikAccessError } from "@/lib/tezgah/tetkik/guard";
import { guardTetkikNarrative } from "@/lib/tezgah/tetkik/narrative";
import { parseHomepageHtml } from "@/lib/tezgah/tetkik/parse-html";
import { clipTetkikNarrative, tetkikSystemPrompt, tetkikUserPrompt } from "@/lib/tezgah/tetkik/prompts";
import { TETKIK_REJECTED_MESSAGE } from "@/lib/tezgah/tetkik/rubric";
import { tetkikGenerateRequestSchema, type TetkikGenerateRequest } from "@/lib/tezgah/tetkik/schema";
import { scoreTetkik } from "@/lib/tezgah/tetkik/score";
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
      status: 400 | 429 | 503;
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

export async function generateTetkikReport(
  input: {
    actorId: string;
    guest: boolean;
    request: TetkikGenerateRequest;
  },
  deps: GenerateTetkikDeps = {},
): Promise<TetkikGenerateResult> {
  const parsed = tetkikGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  const open = () => peekTezgahQuota(input.actorId, input.guest, now);
  if (!parsed.success) {
    const quota = open();
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const inspected = inspectTetkikUrl(parsed.data.url);
  if (!inspected.ok) {
    const quota = open();
    return {
      ok: false,
      error: TETKIK_REJECTED_MESSAGE,
      status: 400,
      remaining: quota.remaining,
      limit: quota.limit,
      guest: input.guest,
    };
  }

  const slot = consumeTezgahQuota(input.actorId, input.guest, now);
  if (!slot.allowed) {
    return {
      ok: false,
      error: input.guest ? TEZGAH_GUEST_QUOTA_MESSAGE : TEZGAH_MEMBER_QUOTA_MESSAGE,
      status: 429,
      remaining: 0,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  const restore = (error: string, status: 400 | 503): TetkikGenerateResult => {
    const restored = refundTezgahQuota(input.actorId, input.guest, now);
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
  const agency = parsed.data.agencyName ? plain(parsed.data.agencyName, 80) : "";
  const cover = {
    businessName: plain(parsed.data.businessName, 80),
    freelancerName: plain(parsed.data.freelancerName, 80),
    agencyName: agency.length >= 2 ? agency : null,
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
        recordUsage: false,
      },
    },
    deps,
  );

  const narrative = clipTetkikNarrative(guardTetkikNarrative(llm?.text ?? "", scored.score));
  if (narrative.length < 12) {
    return restore(TEZGAH_FAIL_MESSAGE, 503);
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
