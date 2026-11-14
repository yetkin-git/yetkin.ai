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
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota } from "@/lib/tezgah/quota";

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
      status: 400 | 429 | 503;
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
  },
  deps: GenerateDukkanDeps = {},
): Promise<DukkanGenerateResult> {
  const parsed = dukkanGenerateRequestSchema.safeParse(input.request);
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
  const draft = readDukkanDraft(parsed.data);
  if (!draft) {
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

  const restore = (): DukkanGenerateResult => {
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
