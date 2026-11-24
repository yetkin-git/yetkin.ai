/**
 * Görsel stüdyo paket üretimi (istemci-güvenli).
 * Gerçek görsel üretimi sunucu motorundadır (`studio-photo-engine.ts`).
 * Kullanıcı piksel iddiası kabul edilmez; hedef pazaryeri standardı sahneden gelir.
 */

import {
  STUDIO_SCENES,
  studioSceneById,
  type StudioSceneId,
} from "@/lib/tezgah/pro/options";
import { oneLine } from "@/lib/tezgah/pro/text";
import { buildStoreZip } from "@/lib/tezgah/pro/zip";

export const STUDIO_PHOTO_FILENAME = "gorsel-studyo.md";
export const STUDIO_PHOTO_IMAGE_FILENAME = "urun-gorseli.png";
export const STUDIO_PHOTO_ZIP_FILENAME = "studyo-paketi.zip";
export const STUDIO_PHOTO_GUIDE_FILENAME = "galeri-kilavuzu.md";
export const STUDIO_PHOTO_ALT_FILENAME = "seo-alt-metinleri.md";
export const STUDIO_PHOTO_ARCHIVE_KIND = "studio-photo-v1" as const;

const GALLERY_ROLES = [
  "Ana görsel",
  "Detay yakın plan",
  "Ölçü ve oran",
  "Kullanım",
  "Paket ve içerik",
  "Varyant",
  "Doku",
  "Ölçek",
] as const;

export type StudioPhotoInput = {
  productName: string;
  features: string;
  scene: StudioSceneId;
  galleryCount: number;
};

export type StudioRule = {
  market: string;
  label: string;
  pass: boolean;
  detail: string;
};

export type StudioPhotoPack = {
  filename: typeof STUDIO_PHOTO_FILENAME;
  imageFilename: typeof STUDIO_PHOTO_IMAGE_FILENAME;
  zipFilename: typeof STUDIO_PHOTO_ZIP_FILENAME;
  guideFilename: typeof STUDIO_PHOTO_GUIDE_FILENAME;
  prompt: string;
  scene: StudioSceneId;
  sceneLabel: string;
  aspectRatio: string;
  targetWidthPx: number;
  targetHeightPx: number;
  standardLabel: string;
  producedWidthPx: number | null;
  producedHeightPx: number | null;
  rules: StudioRule[];
  gallery: { slot: number; role: string; ratio: string; background: string }[];
  altTexts: { slot: number; text: string }[];
  markdown: string;
  guideMarkdown: string;
  altMarkdown: string;
  summary: string;
};

export type StudioPhotoArchive = {
  kind: typeof STUDIO_PHOTO_ARCHIVE_KIND;
  productName: string;
  scene: StudioSceneId;
  sceneLabel: string;
  mimeType: string;
  imageBase64: string;
  markdown: string;
  guideMarkdown: string;
  altMarkdown: string;
  targetWidthPx: number;
  targetHeightPx: number;
  aspectRatio: string;
  standardLabel: string;
  producedWidthPx: number | null;
  producedHeightPx: number | null;
  altTexts: { slot: number; text: string }[];
};

function ratioClose(width: number, height: number, targetWidth: number, targetHeight: number): boolean {
  const actual = width / height;
  const target = targetWidth / targetHeight;
  return Math.abs(actual - target) / target <= 0.02;
}

function slotRatio(scene: (typeof STUDIO_SCENES)[number], index: number): string {
  if (index === 0) {
    return scene.aspectRatio;
  }
  return index % 2 === 0 ? scene.aspectRatio : "1:1";
}

function slotBackground(scene: (typeof STUDIO_SCENES)[number], index: number): string {
  if (index === 0) {
    return scene.background === "white" ? "Beyaz #FFFFFF" : "Nötr stüdyo, yazısız";
  }
  return index % 2 === 0 ? "Beyaz #FFFFFF" : "Nötr, yazısız";
}

function altText(name: string, role: string, features: string, slot: number): string {
  const feature = features.split(/[.,\n]/)[0]?.trim() ?? "";
  const body = feature
    ? `${name}, ${role.toLocaleLowerCase("tr-TR")}, ${feature}`
    : `${name}, ${role.toLocaleLowerCase("tr-TR")}`;
  return oneLine(`${slot}. ${body}`, 125);
}

/** PNG IHDR'dan gerçek piksel. Ölçüm üretilen bayttan; kullanıcı beyanı değil. */
export function readPngDimensions(dataBase64: string): { width: number; height: number } | null {
  const clean = dataBase64.replace(/\s+/g, "");
  if (!clean) {
    return null;
  }
  try {
    let bytes: Uint8Array;
    if (typeof Buffer !== "undefined") {
      bytes = new Uint8Array(Buffer.from(clean, "base64"));
    } else {
      const binary = atob(clean);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
    }
    if (bytes.length < 24) {
      return null;
    }
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
      return null;
    }
    const width = ((bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!) >>> 0;
    const height = ((bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!) >>> 0;
    if (width < 1 || height < 1 || width > 16_000 || height > 16_000) {
      return null;
    }
    return { width, height };
  } catch {
    return null;
  }
}

export function buildStudioPrompt(input: {
  productName: string;
  features: string;
  scene: (typeof STUDIO_SCENES)[number];
}): string {
  const white = input.scene.background === "white";
  const bg = white
    ? "pure solid white studio background RGB 255,255,255, no gradient, no shadow spill on backdrop"
    : "tasteful lifestyle studio set, soft natural light, no readable signage";
  return [
    "Professional e-commerce product studio photograph.",
    `Product only: ${input.productName}.`,
    `Visible traits (describe visually, do not print as text): ${input.features}.`,
    `Framing: product centered, fills most of the frame, aspect ratio ${input.scene.aspectRatio}.`,
    `Backdrop: ${bg}.`,
    "Hard rules: no logos of real brands, no watermarks, no captions, no price tags,",
    "no typography of any kind, no UI chrome, no hands holding phones with screens,",
    "no celebrity likeness, no trademarked characters, no fake packaging claims.",
    "Photorealistic, sharp focus, catalog quality.",
  ].join(" ");
}

export function buildStudioPhoto(
  input: StudioPhotoInput,
  produced?: { widthPx: number; heightPx: number } | null,
): StudioPhotoPack | null {
  const productName = oneLine(input.productName, 80);
  const features = oneLine(input.features, 400);
  const scene = studioSceneById(input.scene);
  if (!scene || productName.length < 2 || features.length < 2) {
    return null;
  }
  if (input.galleryCount < 3 || input.galleryCount > 8) {
    return null;
  }

  const standardLabel = `Hedef Pazaryeri Standardı — ${scene.label} (${scene.widthPx}×${scene.heightPx}, ${scene.aspectRatio})`;
  const producedWidthPx = produced?.widthPx ?? null;
  const producedHeightPx = produced?.heightPx ?? null;
  const white = scene.background === "white";

  const rules: StudioRule[] = [
    {
      market: scene.marketLabel,
      label: white ? "Beyaz / saf beyaz fon" : "Stüdyo sahne",
      pass: true,
      detail: white
        ? `${standardLabel}. Ana kare yazısız beyaz fon hedefiyle üretilir.`
        : `${standardLabel}. Yaşam/reklam sahnesi; ana karede okunabilir yazı basılmaz.`,
    },
    {
      market: scene.marketLabel,
      label: "Hedef oran",
      pass:
        producedWidthPx != null && producedHeightPx != null
          ? ratioClose(producedWidthPx, producedHeightPx, scene.widthPx, scene.heightPx)
          : true,
      detail:
        producedWidthPx != null && producedHeightPx != null
          ? `${standardLabel}. Üretilen görsel ${producedWidthPx}×${producedHeightPx} px.`
          : `${standardLabel}. Üretim bu orana talep edilir.`,
    },
    {
      market: scene.marketLabel,
      label: "Hedef çözünürlük",
      pass:
        producedWidthPx != null && producedHeightPx != null
          ? producedWidthPx >= Math.min(scene.widthPx, 1000) &&
            producedHeightPx >= Math.min(scene.heightPx, 1000)
          : true,
      detail: `Hedef ${scene.widthPx}×${scene.heightPx} px. Sağlayıcı çıktısı hedefe yakın ölçeklenir.`,
    },
    {
      market: scene.marketLabel,
      label: "Yazısız ana kare",
      pass: true,
      detail: "Prompt marka/telif/metin basımını yasaklar; ana karede fiyat veya logo basılmaz.",
    },
  ];

  const gallery = Array.from({ length: input.galleryCount }, (_, index) => {
    const role = GALLERY_ROLES[index] ?? "Ek kare";
    return {
      slot: index + 1,
      role,
      ratio: slotRatio(scene, index),
      background: slotBackground(scene, index),
    };
  });
  const altTexts = gallery.map((slot) => ({
    slot: slot.slot,
    text: altText(productName, slot.role, features, slot.slot),
  }));

  const prompt = buildStudioPrompt({ productName, features, scene });
  const passed = rules.filter((rule) => rule.pass).length;
  const failed = rules.length - passed;
  const summary = `Görsel stüdyo: ${productName}. ${scene.label}. ${STUDIO_PHOTO_FILENAME}. ${passed} geçti, ${failed} kaldı.`;

  const producedLine =
    producedWidthPx != null && producedHeightPx != null
      ? `Üretilen görsel: ${producedWidthPx}×${producedHeightPx} px.`
      : "Üretilen görsel: sunucu yanıtı bekleniyor.";

  const markdown = [
    "## Görsel stüdyo",
    `Ürün: ${productName}.`,
    `Özellikler: ${features}.`,
    `Sahne: ${scene.label}.`,
    standardLabel,
    producedLine,
    "",
    "## Üretim promptu (sunucu)",
    prompt,
    "",
    "## Kural denetimi",
    ...rules.map(
      (rule) => `- ${rule.market} ${rule.label}: ${rule.pass ? "geçti" : "kaldı"}. ${rule.detail}`,
    ),
    "",
    "## Galeri sırası",
    ...gallery.map((slot) => `${slot.slot}. ${slot.role}. Oran ${slot.ratio}. Fon ${slot.background}.`),
    "",
    "## Alt metin",
    ...altTexts.map((alt) => alt.text),
  ].join("\n");

  const guideMarkdown = [
    "# Galeri kılavuzu",
    "",
    standardLabel,
    producedLine,
    "",
    "## Sıra",
    ...gallery.map(
      (slot) =>
        `${slot.slot}. **${slot.role}** — oran ${slot.ratio}, fon ${slot.background}. Ana karede yazı/logo olmasın.`,
    ),
    "",
    "## Not",
    "Bu paket tek ana görsel üretir. Galeri sırası sonraki kareler için çekim/düzenleme planıdır.",
  ].join("\n");

  const altMarkdown = ["# SEO alt metinleri", "", ...altTexts.map((alt) => alt.text)].join("\n");

  return {
    filename: STUDIO_PHOTO_FILENAME,
    imageFilename: STUDIO_PHOTO_IMAGE_FILENAME,
    zipFilename: STUDIO_PHOTO_ZIP_FILENAME,
    guideFilename: STUDIO_PHOTO_GUIDE_FILENAME,
    prompt,
    scene: scene.value,
    sceneLabel: scene.label,
    aspectRatio: scene.aspectRatio,
    targetWidthPx: scene.widthPx,
    targetHeightPx: scene.heightPx,
    standardLabel,
    producedWidthPx,
    producedHeightPx,
    rules,
    gallery,
    altTexts,
    markdown,
    guideMarkdown,
    altMarkdown,
    summary,
  };
}

export function buildStudioPhotoZip(input: {
  imageBytes: Uint8Array;
  pack: StudioPhotoPack;
}): Uint8Array {
  return buildStoreZip([
    { name: STUDIO_PHOTO_IMAGE_FILENAME, bytes: input.imageBytes },
    { name: STUDIO_PHOTO_ALT_FILENAME, text: input.pack.altMarkdown },
    { name: STUDIO_PHOTO_GUIDE_FILENAME, text: input.pack.guideMarkdown },
    { name: STUDIO_PHOTO_FILENAME, text: input.pack.markdown },
  ]);
}

export function encodeStudioPhotoArchive(input: {
  productName: string;
  pack: StudioPhotoPack;
  mimeType: string;
  imageBase64: string;
}): string {
  const archive: StudioPhotoArchive = {
    kind: STUDIO_PHOTO_ARCHIVE_KIND,
    productName: input.productName,
    scene: input.pack.scene,
    sceneLabel: input.pack.sceneLabel,
    mimeType: input.mimeType,
    imageBase64: input.imageBase64,
    markdown: input.pack.markdown,
    guideMarkdown: input.pack.guideMarkdown,
    altMarkdown: input.pack.altMarkdown,
    targetWidthPx: input.pack.targetWidthPx,
    targetHeightPx: input.pack.targetHeightPx,
    aspectRatio: input.pack.aspectRatio,
    standardLabel: input.pack.standardLabel,
    producedWidthPx: input.pack.producedWidthPx,
    producedHeightPx: input.pack.producedHeightPx,
    altTexts: input.pack.altTexts,
  };
  return JSON.stringify(archive);
}

export function parseStudioPhotoArchive(raw: string): StudioPhotoArchive | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<StudioPhotoArchive>;
    if (parsed.kind !== STUDIO_PHOTO_ARCHIVE_KIND) {
      return null;
    }
    if (
      typeof parsed.imageBase64 !== "string" ||
      !parsed.imageBase64 ||
      typeof parsed.markdown !== "string" ||
      typeof parsed.productName !== "string" ||
      !studioSceneById(String(parsed.scene ?? ""))
    ) {
      return null;
    }
    return parsed as StudioPhotoArchive;
  } catch {
    return null;
  }
}

export function base64ToBytes(dataBase64: string): Uint8Array {
  const clean = dataBase64.replace(/\s+/g, "");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(clean, "base64"));
  }
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
