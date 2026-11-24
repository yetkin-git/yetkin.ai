import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { GEMINI_HYDROGEN_MODEL } from "@/lib/kernel/ai/model-roles";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  TEZGAH_FAIL_MESSAGE,
  TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE,
  TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
  TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE,
} from "@/lib/tezgah/catalog";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import { parseTetkikAnalysisCard } from "@/lib/tezgah/tetkik/analysis";
import { claimTetkikDomain, isTetkikDomainClaimed } from "@/lib/tezgah/tetkik/domain-claim";
import { fetchPublicHomepage, type FetchPublicHomepageDeps } from "@/lib/tezgah/tetkik/fetch-html";
import { inspectTetkikUrl, TetkikAccessError } from "@/lib/tezgah/tetkik/guard";
import { guardTetkikNarrative } from "@/lib/tezgah/tetkik/narrative";
import { parseHomepageHtml, pageSnippetFromParsed } from "@/lib/tezgah/tetkik/parse-html";
import { clipTetkikNarrative, tetkikSystemPrompt, tetkikUserPrompt } from "@/lib/tezgah/tetkik/prompts";
import { TETKIK_REJECTED_MESSAGE } from "@/lib/tezgah/tetkik/rubric";
import { tetkikGenerateRequestSchema, type TetkikGenerateRequest } from "@/lib/tezgah/tetkik/schema";
import { scoreTetkik } from "@/lib/tezgah/tetkik/score";
import { normalizeTetkikSiteAddress, tetkikHostKey } from "@/lib/tezgah/tetkik/site-address";
import { probeTechSeoFiles } from "@/lib/tezgah/tetkik/tech-seo";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

/** Yönetici karnesi JSON'u 900 tokena sığmaz. Skor yine kodda kalır. */
export const TETKIK_MAX_OUTPUT_TOKENS = 2_400;
/** Derin analiz rolü. Çağrı anı `resolveProductModel("textDeep")` okur. */
export const TETKIK_MODEL_ROLE = "DEEP_RESEARCH" as const;
/** Kod varsayılanı. Boş yuva bu kimliğe düşer. */
export const TETKIK_MODEL_ID = GEMINI_HYDROGEN_MODEL;

const TETKIK_POOL = "tetkik" as const;

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

/** Marka: isteğe bağlı girdi → `<title>` → alan adı. */
function detectBrand(given: string, pageTitle: string, finalUrl: string): string {
  const name = plain(given, 80);
  if (name.length >= 2) {
    return name;
  }
  const title = plain(pageTitle, 80);
  if (title.length >= 2) {
    return title;
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
  const open = () => peekTezgahQuota(input.actorId, input.guest, now, TETKIK_POOL);
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

  const host = tetkikHostKey(inspected.url.toString()) ?? tetkikHostKey(parsed.data.url);
  if (!host) {
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

  // Kilit 1: ömür boyu hesap/IP hakkı (Pro/kredi peek'te aşılır).
  const preview = await open();
  if (!preview.allowed) {
    return {
      ok: false,
      error:
        preview.error ??
        (input.guest ? TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE : TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE),
      status: preview.status ?? 429,
      remaining: 0,
      limit: preview.limit,
      guest: input.guest,
    };
  }

  // Kilit 2: global domain — yalnız ücretsiz hat.
  if (preview.lane === "free" && (await isTetkikDomainClaimed(host))) {
    return {
      ok: false,
      error: TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE,
      status: 402,
      remaining: preview.remaining,
      limit: preview.limit,
      guest: input.guest,
    };
  }

  const slot = await consumeTezgahQuota(
    input.actorId,
    input.guest,
    now,
    input.commandKey ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) } : null,
    TETKIK_POOL,
  );
  if (!slot.allowed) {
    return {
      ok: false,
      error:
        slot.error ??
        (input.guest ? TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE : TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE),
      status: slot.status ?? 429,
      remaining: 0,
      limit: slot.limit,
      guest: input.guest,
    };
  }

  const restore = async (error: string, status: 400 | 402 | 503): Promise<TetkikGenerateResult> => {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane, TETKIK_POOL, {
      hold: slot.hold,
      command: input.commandKey
        ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) }
        : null,
    });
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
  const pageSnippet = pageSnippetFromParsed(parsedHtml);
  const techSeoProbes = await probeTechSeoFiles(page.finalUrl, deps);
  const scored = scoreTetkik(parsedHtml, {
    https: page.finalUrl.startsWith("https:"),
    ttfbMs: page.ttfbMs,
    htmlBytes: page.htmlBytes,
    techSeo: techSeoProbes,
  });
  const pageTitle = plain(parsedHtml.title, 120);
  const cover = {
    businessName: detectBrand(parsed.data.businessName ?? "", pageTitle, page.finalUrl),
    freelancerName: "",
    agencyName: null as string | null,
  };
  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: TETKIK_MODEL_ROLE,
      model: await resolveProductModel("textDeep"),
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
        pageSnippet,
        techSeo: scored.techSeo,
      }),
      temperature: 0.2,
      maxOutputTokens: TETKIK_MAX_OUTPUT_TOKENS,
      responseJson: true,
      maxAttempts: 1,
      timeoutMs: 45_000,
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

  const rawText = llm?.text ?? "";
  const analysis = parseTetkikAnalysisCard(rawText, scored.score, pageSnippet);
  const narrativeSource = analysis
    ? [analysis.summary, ...analysis.findings.map((finding) => `${finding.title}: ${finding.actionFix}`)].join(
        "\n",
      )
    : rawText;
  const narrative = clipTetkikNarrative(guardTetkikNarrative(narrativeSource, scored.score));
  if (narrative.length < 12) {
    return restore(TEZGAH_FAIL_MESSAGE, 503);
  }

  if (slot.lane === "free") {
    const claim = await claimTetkikDomain(host, input.actorId, now);
    if (claim === "claimed") {
      return restore(TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE, 402);
    }
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

  const brand = analysis?.detectedBrand?.trim() || cover.businessName;

  return {
    ok: true,
    tool: "tetkik",
    score: scored.score,
    maxScore: scored.maxScore,
    disclaimer: scored.disclaimer,
    measuredAt: now.toISOString(),
    url: page.finalUrl,
    businessName: brand,
    freelancerName: cover.freelancerName,
    agencyName: cover.agencyName,
    pageTitle,
    ttfbMs: page.ttfbMs,
    htmlBytes: page.htmlBytes,
    checks: scored.checks,
    opportunities: scored.opportunities,
    action: scored.action,
    techSeo: scored.techSeo,
    pageSnippet,
    narrative: narrative.length >= 12 ? narrative : analysis?.summary ?? "",
    analysis: analysis ?? null,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
