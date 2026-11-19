import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  TEZGAH_FAIL_MESSAGE,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
} from "@/lib/tezgah/catalog";
import { withTezgahDeliverySignature } from "@/lib/tezgah/delivery-signature";
import { tezgahSystemPrompt, tezgahUserPrompt } from "@/lib/tezgah/prompts";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import {
  tezgahGenerateRequestSchema,
  type TezgahGenerateRequest,
} from "@/lib/tezgah/schema";

/** Bütçe kalkanına sığan tek çağrı tavanı. */
export const TEZGAH_MAX_OUTPUT_TOKENS = 900;
export const TEZGAH_MODEL_ROLE = "LITE_STREAM" as const;

const TEZGAH_MARKDOWN_CAP = 6000;

export type TezgahGenerateResult =
  | {
      ok: true;
      tool: TezgahGenerateRequest["tool"];
      markdown: string;
      outputId: string | null;
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

function clipMarkdown(text: string): string {
  const trimmed = text.replace(/\u0000/g, "").trim();
  if (trimmed.length <= TEZGAH_MARKDOWN_CAP) {
    return trimmed;
  }
  return trimmed.slice(0, TEZGAH_MARKDOWN_CAP).trim();
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

  const slot = await consumeTezgahQuota(
    input.actorId,
    input.guest,
    now,
    input.commandKey ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) } : null,
    "lite",
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

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: TEZGAH_MODEL_ROLE,
      system: tezgahSystemPrompt(parsed.data),
      user: tezgahUserPrompt(parsed.data),
      temperature: 0.4,
      maxOutputTokens: TEZGAH_MAX_OUTPUT_TOKENS,
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

  const markdown = clipMarkdown(llm?.text ?? "");
  if (!markdown) {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane, "lite");
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

  const delivered =
    parsed.data.tool === "proposal" ? withTezgahDeliverySignature(markdown) : markdown;
  const title =
    parsed.data.tool === "ecommerce" ? parsed.data.productName : parsed.data.expertise || "Müşteri teklifi";
  const outputId = await recordSignedTezgahOutput({
    userId: input.actorId,
    guest: input.guest,
    toolKey: parsed.data.tool,
    title,
    inputSummary: tezgahUserPrompt(parsed.data),
    outputContent: delivered,
  });

  return {
    ok: true,
    tool: parsed.data.tool,
    markdown: delivered,
    outputId,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
