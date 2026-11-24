import "server-only";

import { generateImage, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import {
  TEZGAH_FAIL_MESSAGE,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
} from "@/lib/tezgah/catalog";
import { tezgahRequestHash } from "@/lib/tezgah/paid-lane";
import { consumeTezgahQuota, peekTezgahQuota, refundTezgahQuota, settleTezgahSlot } from "@/lib/tezgah/quota";
import { studioSceneById } from "@/lib/tezgah/pro/options";
import {
  buildStudioPhoto,
  buildStudioPhotoZip,
  bytesToBase64,
  encodeStudioPhotoArchive,
  readPngDimensions,
  STUDIO_PHOTO_FILENAME,
  STUDIO_PHOTO_GUIDE_FILENAME,
  STUDIO_PHOTO_IMAGE_FILENAME,
  STUDIO_PHOTO_ZIP_FILENAME,
  type StudioPhotoPack,
} from "@/lib/tezgah/pro/studio-photo";
import {
  studioPhotoGenerateRequestSchema,
  type StudioPhotoGenerateRequest,
} from "@/lib/tezgah/pro/studio-photo-schema";

export type StudioPhotoGenerateResult =
  | {
      ok: true;
      tool: "studio-photo";
      pack: StudioPhotoPack;
      mimeType: string;
      imageBase64: string;
      dataUrl: string;
      zipBase64: string;
      archiveContent: string;
      filename: typeof STUDIO_PHOTO_FILENAME;
      imageFilename: typeof STUDIO_PHOTO_IMAGE_FILENAME;
      zipFilename: typeof STUDIO_PHOTO_ZIP_FILENAME;
      guideFilename: typeof STUDIO_PHOTO_GUIDE_FILENAME;
      remaining: number;
      limit: number;
      guest: boolean;
    }
  | {
      ok: false;
      error: string;
      status: 400 | 401 | 402 | 429 | 503;
      remaining: number;
      limit: number;
      guest: boolean;
    };

export type GenerateStudioPhotoDeps = InvokeLlmDeps & {
  now?: () => Date;
  generate?: typeof generateImage;
};

/**
 * Görsel & Ürün Stüdyosu. `generateImage` gümrüğünden geçer.
 * Kota önce düşer; boş/hatalı görselde iade edilir. Cüzdana yazılmaz.
 */
export async function generateStudioPhotoPack(
  input: {
    actorId: string;
    guest: boolean;
    request: StudioPhotoGenerateRequest;
    commandKey?: string | null;
  },
  deps: GenerateStudioPhotoDeps = {},
): Promise<StudioPhotoGenerateResult> {
  const parsed = studioPhotoGenerateRequestSchema.safeParse(input.request);
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

  const scene = studioSceneById(parsed.data.scene);
  if (!scene) {
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

  const restore = async (): Promise<StudioPhotoGenerateResult> => {
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

  const draftPack = buildStudioPhoto({
    productName: parsed.data.productName,
    features: parsed.data.features,
    scene: parsed.data.scene,
    galleryCount: parsed.data.galleryCount,
  });
  if (!draftPack) {
    return restore();
  }

  const generate = deps.generate ?? generateImage;
  const image = await generate(
    {
      role: "IMAGE_GEN",
      prompt: draftPack.prompt,
      aspectRatio: scene.aspectRatio,
      timeoutMs: 90_000,
      maxAttempts: 1,
      rateLimit: {
        identifier: input.actorId,
        scope: "tezgah-studio-photo",
        limit: 4,
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

  const imageBase64 = image?.dataBase64?.trim() ?? "";
  if (!image || !imageBase64) {
    return restore();
  }

  const mimeType = (image.mimeType || "image/png").trim() || "image/png";
  const measured = readPngDimensions(imageBase64);
  const pack =
    buildStudioPhoto(
      {
        productName: parsed.data.productName,
        features: parsed.data.features,
        scene: parsed.data.scene,
        galleryCount: parsed.data.galleryCount,
      },
      measured ? { widthPx: measured.width, heightPx: measured.height } : null,
    ) ?? draftPack;

  const imageBytes = Buffer.from(imageBase64, "base64");
  if (imageBytes.byteLength < 32) {
    return restore();
  }

  const zip = buildStudioPhotoZip({ imageBytes: new Uint8Array(imageBytes), pack });
  const zipBase64 = bytesToBase64(zip);
  const archiveContent = encodeStudioPhotoArchive({
    productName: parsed.data.productName.trim(),
    pack,
    mimeType,
    imageBase64,
  });

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
    tool: "studio-photo",
    pack,
    mimeType,
    imageBase64,
    dataUrl: `data:${mimeType};base64,${imageBase64}`,
    zipBase64,
    archiveContent,
    filename: STUDIO_PHOTO_FILENAME,
    imageFilename: STUDIO_PHOTO_IMAGE_FILENAME,
    zipFilename: STUDIO_PHOTO_ZIP_FILENAME,
    guideFilename: STUDIO_PHOTO_GUIDE_FILENAME,
    remaining: slot.remaining,
    limit: slot.limit,
    guest: input.guest,
  };
}
