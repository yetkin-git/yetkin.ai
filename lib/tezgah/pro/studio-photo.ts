/**
 * Görsel stüdyo. Fotoğraf dosyası işlemez.
 * Pazaryeri kuralı, galeri sırası, alt metin ve düzenleme talimatı üretir.
 */

import type { StudioBackgroundId, StudioMarketId } from "@/lib/tezgah/pro/options";
import { oneLine } from "@/lib/tezgah/pro/text";

export const STUDIO_PHOTO_FILENAME = "gorsel-studyo.md";

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
  market: StudioMarketId;
  widthPx: number;
  heightPx: number;
  background: StudioBackgroundId;
  overlay: boolean;
  galleryCount: number;
};

export type StudioRule = {
  market: "Trendyol" | "Amazon";
  label: string;
  pass: boolean;
  detail: string;
};

export type StudioPhotoPack = {
  filename: typeof STUDIO_PHOTO_FILENAME;
  prompt: string;
  rules: StudioRule[];
  gallery: { slot: number; role: string; ratio: string; background: string }[];
  altTexts: { slot: number; text: string }[];
  markdown: string;
  summary: string;
};

function ratioClose(width: number, height: number, targetWidth: number, targetHeight: number): boolean {
  const actual = width / height;
  const target = targetWidth / targetHeight;
  return Math.abs(actual - target) / target <= 0.02;
}

function slotRatio(market: StudioMarketId, index: number): string {
  if (index === 0) {
    if (market === "amazon") {
      return "1:1";
    }
    if (market === "both") {
      return "Trendyol 2:3, Amazon 1:1 ayrı kare";
    }
    return "2:3";
  }
  return index % 2 === 0 ? "2:3" : "1:1";
}

function slotBackground(index: number): string {
  return index === 0 || index === 2 || index === 4 ? "Beyaz #FFFFFF" : "Nötr, yazısız";
}

function altText(name: string, role: string, features: string, slot: number): string {
  const feature = features.split(/[.,\n]/)[0]?.trim() ?? "";
  const body = feature
    ? `${name}, ${role.toLocaleLowerCase("tr-TR")}, ${feature}`
    : `${name}, ${role.toLocaleLowerCase("tr-TR")}`;
  return oneLine(`${slot}. ${body}`, 125);
}

export function buildStudioPhoto(input: StudioPhotoInput): StudioPhotoPack | null {
  const productName = oneLine(input.productName, 80);
  const features = oneLine(input.features, 400);
  if (productName.length < 2 || features.length < 2) {
    return null;
  }
  if (input.galleryCount < 3 || input.galleryCount > 8) {
    return null;
  }
  const white = input.background === "white";
  const rules: StudioRule[] = [];
  if (input.market === "trendyol" || input.market === "both") {
    rules.push(
      {
        market: "Trendyol",
        label: "Beyaz fon",
        pass: white,
        detail: white ? "Ana kare beyaz fon olarak işaretli." : "Ana kare beyaz fon değil. Trendyol ana görseli #FFFFFF ister.",
      },
      {
        market: "Trendyol",
        label: "2:3 oran",
        pass: ratioClose(input.widthPx, input.heightPx, 2, 3),
        detail: `Ölçülen kare ${input.widthPx}×${input.heightPx}. Hedef 1200×1800.`,
      },
      {
        market: "Trendyol",
        label: "Çözünürlük",
        pass: input.widthPx >= 1200 && input.heightPx >= 1800,
        detail: "Kısa kenar eşiği 1200 px, uzun kenar eşiği 1800 px.",
      },
      {
        market: "Trendyol",
        label: "Yazısız ana kare",
        pass: !input.overlay,
        detail: input.overlay ? "Ana karede metin var. Logo ve yazı kalkmalı." : "Ana karede metin yok.",
      },
    );
  }
  if (input.market === "amazon" || input.market === "both") {
    const longSide = Math.max(input.widthPx, input.heightPx);
    rules.push(
      {
        market: "Amazon",
        label: "Saf beyaz fon",
        pass: white,
        detail: white
          ? "Fon beyaz işaretli. Amazon ana görseli RGB 255,255,255 ister."
          : "Fon beyaz değil. Amazon ana görseli saf beyaz ister.",
      },
      {
        market: "Amazon",
        label: "Kare oran",
        pass: ratioClose(input.widthPx, input.heightPx, 1, 1),
        detail: `Ölçülen kare ${input.widthPx}×${input.heightPx}. Hedef 1:1.`,
      },
      {
        market: "Amazon",
        label: "Zoom eşiği",
        pass: longSide >= 1000,
        detail: "Uzun kenar en az 1000 px olmalı.",
      },
      {
        market: "Amazon",
        label: "Zoom önerisi",
        pass: longSide >= 1600,
        detail: "1600 px ve üstü zoom için önerilen uzun kenardır.",
      },
      {
        market: "Amazon",
        label: "Yazısız ana kare",
        pass: !input.overlay,
        detail: input.overlay
          ? "Ana karede metin, logo veya filigran var. Amazon ana görseli bunları kabul etmez."
          : "Ana karede metin yok.",
      },
    );
  }
  const gallery = Array.from({ length: input.galleryCount }, (_, index) => {
    const role = GALLERY_ROLES[index] ?? "Ek kare";
    return {
      slot: index + 1,
      role,
      ratio: slotRatio(input.market, index),
      background: slotBackground(index),
    };
  });
  const altTexts = gallery.map((slot) => ({
    slot: slot.slot,
    text: altText(productName, slot.role, features, slot.slot),
  }));
  const prompt = [
    `Ürün fotoğrafı düzenleme talimatı. Ürün: ${productName}.`,
    `Özellikler: ${features}.`,
    "Ana karede ürün ortada dursun, kadrajın büyük bölümünü doldursun, metin logo ve filigran olmasın.",
    white
      ? "Fon saf beyaz #FFFFFF kalsın."
      : "Mevcut fon renkli. Ana kare için fonu saf beyaza #FFFFFF çevir.",
    input.market === "amazon"
      ? "Amazon ana karesi kare olsun, uzun kenar en az 1600 px olsun."
      : input.market === "trendyol"
        ? "Trendyol ana karesi 1200×1800 px, oran 2:3 olsun."
        : "Trendyol için 1200×1800 ve Amazon için ayrı kare 1600 px üret.",
  ].join(" ");
  const passed = rules.filter((rule) => rule.pass).length;
  const failed = rules.length - passed;
  const summary = `Görsel stüdyo: ${productName}. ${STUDIO_PHOTO_FILENAME}. ${passed} geçti, ${failed} kaldı.`;
  const markdown = [
    "## Görsel stüdyo",
    `Ürün: ${productName}.`,
    `Özellikler: ${features}.`,
    "",
    "## Düzenleme talimatı",
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
  return {
    filename: STUDIO_PHOTO_FILENAME,
    prompt,
    rules,
    gallery,
    altTexts,
    markdown,
    summary,
  };
}
