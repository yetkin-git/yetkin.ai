import "server-only";

import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { inspectDukkanDelivery, renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  dukkanGenerateRequestSchema,
  readDukkanDraft,
  type DukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";

export type DukkanGenerateResult =
  | {
      ok: true;
      tool: "dukkan";
      html: string;
      score: 100;
      filename: typeof DUKKAN_FILENAME;
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

export type GenerateDukkanDeps = {
  now?: () => Date;
  render?: (draft: DukkanDraft) => string;
};

/**
 * Şablon basımı. Günlük hak tetkikle aynı havuzdadır.
 * Öz-skor 100 değilse ya da sayfa 500 KB ve üstündeyse hak geri yazılır.
 * Cüzdana yazılmaz.
 */
export async function generateDukkanPage(
  input: {
    actorId: string;
    guest: boolean;
    request: DukkanGenerateRequest;
    commandKey?: string | null;
  },
  deps: GenerateDukkanDeps = {},
): Promise<DukkanGenerateResult> {
  const parsed = dukkanGenerateRequestSchema.safeParse(input.request);
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
  const draft = readDukkanDraft(parsed.data);
  if (!draft) {
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

  const restore = async (): Promise<DukkanGenerateResult> => {
    const restored = await refundTezgahQuota(input.actorId, input.guest, now, slot.lane);
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: restored.remaining,
      limit: restored.limit,
      guest: input.guest,
    };
  };

  const render = deps.render ?? renderDukkanHtml;
  let html = "";
  try {
    html = render(draft);
  } catch {
    return restore();
  }
  if (!inspectDukkanDelivery(html).ok) {
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
    tool: "dukkan",
    html,
    score: 100,
    filename: DUKKAN_FILENAME,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
