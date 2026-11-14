import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  TEZGAH_FAIL_MESSAGE,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
} from "@/lib/tezgah/catalog";
import { tezgahSystemPrompt, tezgahUserPrompt } from "@/lib/tezgah/prompts";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota } from "@/lib/tezgah/quota";
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
      remaining: number;
      limit: number;
      guest: boolean;
    }
  | {
      ok: false;
      error: string;
      status: 400 | 429 | 503;
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
  },
  deps: GenerateTezgahDeps = {},
): Promise<TezgahGenerateResult> {
  const parsed = tezgahGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  if (!parsed.success) {
    const open = peekTezgahQuota(input.actorId, input.guest, now);
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: open.remaining,
      limit: open.limit,
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
        recordUsage: false,
      },
    },
    deps,
  );

  const markdown = clipMarkdown(llm?.text ?? "");
  if (!markdown) {
    const restored = refundTezgahQuota(input.actorId, input.guest, now);
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  }

  return {
    ok: true,
    tool: parsed.data.tool,
    markdown,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
