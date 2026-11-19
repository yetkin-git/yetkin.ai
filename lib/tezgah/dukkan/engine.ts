import "server-only";

import { TEZGAH_FAIL_MESSAGE } from "@/lib/tezgah/catalog";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import { inspectDukkanDelivery, renderDukkanHtml } from "@/lib/tezgah/dukkan/render";
import {
  dukkanGenerateRequestSchema,
  readDukkanDraft,
  type DukkanDraft,
  type DukkanGenerateRequest,
} from "@/lib/tezgah/dukkan/schema";

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
 * Şablon basımı. AI maliyeti yoktur; ortak kota düşmez.
 * Öz-skor 100 değilse ya da sayfa 500 KB ve üstündeyse üretim reddedilir.
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
  void input.actorId;
  void input.commandKey;
  void deps.now;
  const open = { remaining: 1, limit: 1 };
  const parsed = dukkanGenerateRequestSchema.safeParse(input.request);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: open.remaining,
      limit: open.limit,
      guest: input.guest,
    };
  }
  const draft = readDukkanDraft(parsed.data);
  if (!draft) {
    return {
      ok: false,
      error: "Alanları kısa ve net doldur.",
      status: 400,
      remaining: open.remaining,
      limit: open.limit,
      guest: input.guest,
    };
  }

  const render = deps.render ?? renderDukkanHtml;
  let html = "";
  try {
    html = render(draft);
  } catch {
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: open.remaining,
      limit: open.limit,
      guest: input.guest,
    };
  }
  if (!inspectDukkanDelivery(html).ok) {
    return {
      ok: false,
      error: TEZGAH_FAIL_MESSAGE,
      status: 503,
      remaining: open.remaining,
      limit: open.limit,
      guest: input.guest,
    };
  }

  return {
    ok: true,
    tool: "dukkan",
    html,
    score: 100,
    filename: DUKKAN_FILENAME,
    remaining: open.remaining,
    limit: open.limit,
    guest: input.guest,
  };
}
