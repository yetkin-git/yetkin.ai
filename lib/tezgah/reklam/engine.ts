import "server-only";

import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { withTezgahDeliverySignature } from "@/lib/tezgah/delivery-signature";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import {
  REKLAM_FILE_STEM,
  REKLAM_GOOGLE_CSV_FILENAME,
  REKLAM_META_CSV_FILENAME,
} from "@/lib/tezgah/reklam/copy";
import { buildGoogleAdsCsv, buildMetaAdsCsv } from "@/lib/tezgah/reklam/csv";
import { renderReklamMarkdown, sealReklamPackage } from "@/lib/tezgah/reklam/guard";
import { reklamSystemPrompt, reklamUserPrompt } from "@/lib/tezgah/reklam/prompts";
import {
  readReklamDraft,
  reklamGenerateRequestSchema,
  type ReklamGenerateRequest,
} from "@/lib/tezgah/reklam/schema";
import type { ReklamPackage } from "@/lib/tezgah/reklam/types";

/** Üç varyantlı matris için tavan. Karakter sınırı kodda mühürlenir. */
export const REKLAM_MAX_OUTPUT_TOKENS = 2_400;
export const REKLAM_MODEL_ROLE = "LITE_STREAM" as const;

export type ReklamGenerateResult =
  | {
      ok: true;
      tool: "reklam";
      markdown: string;
      pack: ReklamPackage;
      googleCsv: string;
      metaCsv: string;
      filename: typeof REKLAM_FILE_STEM;
      googleCsvFilename: typeof REKLAM_GOOGLE_CSV_FILENAME;
      metaCsvFilename: typeof REKLAM_META_CSV_FILENAME;
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

export type GenerateReklamDeps = InvokeLlmDeps & {
  now?: () => Date;
  invoke?: typeof invokeLlm;
};

/**
 * Reklam A/B kampanya matrisi. Günlük hak tezgâh havuzundadır.
 * Zorunlu parça eksikse veya kalkan kırılırsa hak geri yazılır.
 * Cüzdana yazılmaz. ROAS/CTR/CPC vaadi üretilmez.
 */
export async function generateReklamPackage(
  input: {
    actorId: string;
    guest: boolean;
    request: ReklamGenerateRequest;
    commandKey?: string | null;
  },
  deps: GenerateReklamDeps = {},
): Promise<ReklamGenerateResult> {
  const parsed = reklamGenerateRequestSchema.safeParse(input.request);
  const now = deps.now?.() ?? new Date();
  const open = () => peekTezgahQuota(input.actorId, input.guest, now, "lite");
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

  const draft = readReklamDraft(parsed.data);
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

  const restore = async (): Promise<ReklamGenerateResult> => {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane, "lite", {
      hold: slot.hold,
      command: input.commandKey
        ? { key: input.commandKey, requestHash: tezgahRequestHash(input.request) }
        : null,
    });
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
      model: await resolveProductModel("textEasy"),
      system: reklamSystemPrompt(),
      user: reklamUserPrompt(draft),
      temperature: 0.4,
      maxOutputTokens: REKLAM_MAX_OUTPUT_TOKENS,
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

  const pack = sealReklamPackage(llm?.text ?? "", draft);
  const sealed = pack ? renderReklamMarkdown(pack) : null;
  const markdown = sealed ? withTezgahDeliverySignature(sealed) : null;
  if (!pack || !markdown) {
    return restore();
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
    tool: "reklam",
    markdown,
    pack,
    googleCsv: buildGoogleAdsCsv(pack),
    metaCsv: buildMetaAdsCsv(pack),
    filename: REKLAM_FILE_STEM,
    googleCsvFilename: REKLAM_GOOGLE_CSV_FILENAME,
    metaCsvFilename: REKLAM_META_CSV_FILENAME,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
