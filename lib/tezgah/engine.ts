import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  TEZGAH_FAIL_MESSAGE,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
} from "@/lib/tezgah/catalog";
import { withTezgahDeliverySignature } from "@/lib/tezgah/delivery-signature";
import { applyPriceShield } from "@/lib/tezgah/guard/price-shield";
import { tezgahSystemPrompt, tezgahUserPrompt } from "@/lib/tezgah/prompts";
import { recordSignedTezgahOutputWithMeta } from "@/lib/tezgah/record-output";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import {
  tezgahGenerateRequestSchema,
  type TezgahGenerateRequest,
} from "@/lib/tezgah/schema";

/** Bütçe kalkanına sığan tek çağrı tavanı (e-ticaret / genel). */
export const TEZGAH_MAX_OUTPUT_TOKENS = 900;
/** Teklif masası: uzun yapısal çıktı için yükseltilmiş tavan. */
export const TEZGAH_PROPOSAL_MAX_OUTPUT_TOKENS = 1_600;
export const TEZGAH_MODEL_ROLE = "LITE_STREAM" as const;

const TEZGAH_MARKDOWN_CAP = 6_000;
const TEZGAH_PROPOSAL_MARKDOWN_CAP = 12_000;

export type TezgahGenerateResult =
  | {
      ok: true;
      tool: TezgahGenerateRequest["tool"];
      markdown: string;
      outputId: string | null;
      /** 4.4: oturumlu kullanıcının ilk kalıcı çıktısı. Misafirde her zaman false. */
      firstOutput: boolean;
      remaining: number;
      limit: number;
      guest: boolean;
    }
  | {
      ok: false;
      error: string;
      status: 400 | 402 | 429 | 503;
      remaining: number;
      limit: number;
      guest: boolean;
    };

export type GenerateTezgahDeps = InvokeLlmDeps & {
  now?: () => Date;
  invoke?: typeof invokeLlm;
};

function clipMarkdown(text: string, cap: number): string {
  const trimmed = text.replace(/\u0000/g, "").trim();
  if (trimmed.length <= cap) {
    return trimmed;
  }
  return trimmed.slice(0, cap).trim();
}

function proposalAllowedSource(request: Extract<TezgahGenerateRequest, { tool: "proposal" }>): string {
  return `${request.jobPost}\n${request.expertise}`;
}

export async function generateTezgahOutput(
  input: {
    actorId: string;
    guest: boolean;
    request: TezgahGenerateRequest;
    commandKey?: string | null;
  },
  deps: GenerateTezgahDeps = {},
): Promise<TezgahGenerateResult> {
  const parsed = tezgahGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  if (!parsed.success) {
    const open = await peekTezgahQuota(input.actorId, input.guest, now, "lite");
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: open.remaining,
      limit: open.limit,
      guest: input.guest,
    };
  }

  const command =
    input.commandKey != null && input.commandKey.length > 0
      ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) }
      : null;
  const slot = await consumeTezgahQuota(input.actorId, input.guest, now, command, "lite");
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

  const isProposal = parsed.data.tool === "proposal";
  const maxOutputTokens = isProposal ? TEZGAH_PROPOSAL_MAX_OUTPUT_TOKENS : TEZGAH_MAX_OUTPUT_TOKENS;
  const markdownCap = isProposal ? TEZGAH_PROPOSAL_MARKDOWN_CAP : TEZGAH_MARKDOWN_CAP;

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: TEZGAH_MODEL_ROLE,
      model: await resolveProductModel("textEasy"),
      system: tezgahSystemPrompt(parsed.data),
      user: tezgahUserPrompt(parsed.data),
      temperature: 0.4,
      maxOutputTokens,
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

  let markdown = clipMarkdown(llm?.text ?? "", markdownCap);
  if (parsed.data.tool === "proposal" && markdown) {
    markdown = applyPriceShield(markdown, proposalAllowedSource(parsed.data));
    markdown = clipMarkdown(markdown, markdownCap);
  }
  if (!markdown) {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane, "lite", {
      hold: slot.hold,
      command,
    });
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
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

  const delivered = isProposal ? withTezgahDeliverySignature(markdown) : markdown;
  const title =
    parsed.data.tool === "ecommerce" ? parsed.data.productName : parsed.data.expertise || "Müşteri teklifi";
  const recorded = await recordSignedTezgahOutputWithMeta({
    userId: input.actorId,
    guest: input.guest,
    toolKey: parsed.data.tool,
    title,
    inputSummary: tezgahUserPrompt(parsed.data),
    outputContent: delivered,
  });
  const outputId = recorded.id;

  return {
    ok: true,
    tool: parsed.data.tool,
    markdown: delivered,
    outputId,
    /**
     * 4.4 — aktivasyon sinyali. `true` yalnız oturumlu kullanıcının **ilk**
     * kalıcı Tezgâh çıktısında döner; istemci bunu `tezgah_first_output`
     * olayına çevirir (`components/tezgah/workbench.tsx`).
     */
    firstOutput: recorded.firstForUser,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
