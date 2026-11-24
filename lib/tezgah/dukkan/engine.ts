import "server-only";

import { TEZGAH_FAIL_MESSAGE } from "@/lib/tezgah/catalog";
import {
  DUKKAN_FILENAME,
  DUKKAN_STRUCTURAL_SEALS,
  DUKKAN_ZIP_FILENAME,
  type DukkanSealId,
} from "@/lib/tezgah/dukkan/copy";
import {
  buildDukkanPack,
  inspectDukkanDelivery,
  type DukkanSealResult,
} from "@/lib/tezgah/dukkan/render";
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
      guide: string;
      zipBase64: string;
      seals: DukkanSealResult[];
      filename: typeof DUKKAN_FILENAME;
      zipFilename: typeof DUKKAN_ZIP_FILENAME;
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
  renderPack?: (draft: DukkanDraft) => {
    html: string;
    guide: string;
    zip: Uint8Array;
    zipFilename: typeof DUKKAN_ZIP_FILENAME;
  };
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Şablon basımı. AI maliyeti yoktur; ortak kota düşmez.
 * Yapısal mühürler geçmezse ya da sayfa 500 KB ve üstündeyse üretim reddedilir.
 * Sahte 100/100 hız skoru yoktur. Cüzdana yazılmaz.
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

  const renderPack = deps.renderPack ?? buildDukkanPack;
  let pack: {
    html: string;
    guide: string;
    zip: Uint8Array;
    zipFilename: typeof DUKKAN_ZIP_FILENAME;
  };
  try {
    pack = renderPack(draft);
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
  const inspected = inspectDukkanDelivery(pack.html);
  if (!inspected.ok) {
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
    html: pack.html,
    guide: pack.guide,
    zipBase64: bytesToBase64(pack.zip),
    seals: inspected.seals,
    filename: DUKKAN_FILENAME,
    zipFilename: pack.zipFilename,
    remaining: open.remaining,
    limit: open.limit,
    guest: input.guest,
  };
}

export function dukkanSealLabels(): readonly { id: DukkanSealId; label: string }[] {
  return DUKKAN_STRUCTURAL_SEALS;
}
