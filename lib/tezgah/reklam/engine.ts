import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota } from "@/lib/tezgah/quota";
import { REKLAM_FILE_STEM } from "@/lib/tezgah/reklam/copy";
import { sealReklamMarkdown } from "@/lib/tezgah/reklam/guard";
import { reklamSystemPrompt, reklamUserPrompt } from "@/lib/tezgah/reklam/prompts";
import {
  readReklamDraft,
  reklamGenerateRequestSchema,
  type ReklamGenerateRequest,
} from "@/lib/tezgah/reklam/schema";

/** Tek çağrı tavanı. Google karakter sınırı bu tavanın dışında, kodda mühürlenir. */
export const REKLAM_MAX_OUTPUT_TOKENS = 900;
export const REKLAM_MODEL_ROLE = "LITE_STREAM" as const;

export type ReklamGenerateResult =
  | {
      ok: true;
      tool: "reklam";
      markdown: string;
      filename: typeof REKLAM_FILE_STEM;
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

export type GenerateReklamDeps = InvokeLlmDeps & {
  now?: () => Date;
  invoke?: typeof invokeLlm;
};

/**
 * Reklam metni. Günlük hak tezgâh havuzundadır.
 * Google başlığı veya açıklaması sınırı aşarsa, ya da mühür bozulursa hak geri yazılır.
 * Cüzdana yazılmaz.
 */
export async function generateReklamPackage(
  input: {
    actorId: string;
    guest: boolean;
    request: ReklamGenerateRequest;
  },
  deps: GenerateReklamDeps = {},
): Promise<ReklamGenerateResult> {
  const parsed = reklamGenerateRequestSchema.safeParse(input.request);
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

  const draft = readReklamDraft(parsed.data);
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

  const restore = (): ReklamGenerateResult => {
    const restored = refundTezgahQuota(input.actorId, input.guest, now);
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  };

  const invoke = deps.invoke ?? invokeLlm;
  const llm = await invoke(
    {
      role: REKLAM_MODEL_ROLE,
      system: reklamSystemPrompt(),
      user: reklamUserPrompt(draft),
      temperature: 0.4,
      maxOutputTokens: REKLAM_MAX_OUTPUT_TOKENS,
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

  const markdown = sealReklamMarkdown(llm?.text ?? "", draft);
  if (!markdown) {
    return restore();
  }

  return {
    ok: true,
    tool: "reklam",
    markdown,
    filename: REKLAM_FILE_STEM,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
