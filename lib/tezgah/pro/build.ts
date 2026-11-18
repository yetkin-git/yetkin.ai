/**
 * Üç uzman tezgâhının tek kapısı. Kota ve cüzdan yoktur.
 * Çıktı tarayıcıda üretilir.
 */

import type { ProStudioToolId } from "@/lib/tezgah/catalog";
import type { SaasPlatformId, SaasWidgetId, StudioBackgroundId, StudioMarketId } from "@/lib/tezgah/pro/options";
import { buildSaasWidget, readApiUrl, readCounterDeadline, SAAS_ZIP_FILENAME } from "@/lib/tezgah/pro/saas-builder";
import { buildStudioPhoto, STUDIO_PHOTO_FILENAME } from "@/lib/tezgah/pro/studio-photo";
import { buildTechnicalDrawing, TECHNICAL_DRAWING_FILENAME } from "@/lib/tezgah/pro/technical-drawing";
import { readWholeNumber } from "@/lib/tezgah/pro/text";

export type ProStudioPack = {
  tool: ProStudioToolId;
  filename: string;
  summary: string;
  body: string;
  markdown: string;
  svg: string | null;
  html: string | null;
  react: string | null;
  installGuide: string | null;
  zip: Uint8Array | null;
};

export type ProStudioResult = { ok: true; pack: ProStudioPack } | { ok: false; error: string };

const MARKETS = new Set<StudioMarketId>(["trendyol", "amazon", "both"]);
const BACKGROUNDS = new Set<StudioBackgroundId>(["white", "colored"]);
const WIDGETS = new Set<SaasWidgetId>(["cargo", "order", "counter", "api"]);
const SAAS_PLATFORMS = new Set<SaasPlatformId>(["html", "wordpress", "react"]);

function text(values: Record<string, string>, name: string): string {
  return (values[name] ?? "").trim();
}

export function buildProStudio(tool: string, values: Record<string, string>): ProStudioResult {
  if (tool === "studio-photo") {
    const widthPx = readWholeNumber(text(values, "widthPx"), 8000);
    const heightPx = readWholeNumber(text(values, "heightPx"), 8000);
    const market = text(values, "market");
    const background = text(values, "background");
    const galleryCount = readWholeNumber(text(values, "galleryCount"), 8);
    if (
      widthPx === null ||
      heightPx === null ||
      galleryCount === null ||
      galleryCount < 3 ||
      !MARKETS.has(market as StudioMarketId) ||
      !BACKGROUNDS.has(background as StudioBackgroundId)
    ) {
      return { ok: false, error: "Piksel ölçüleri 1 ile 8000 arasında tam sayı olmalı." };
    }
    const pack = buildStudioPhoto({
      productName: text(values, "productName"),
      features: text(values, "features"),
      market: market as StudioMarketId,
      widthPx,
      heightPx,
      background: background as StudioBackgroundId,
      overlay: text(values, "overlay") === "evet",
      galleryCount,
    });
    if (!pack) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    return {
      ok: true,
      pack: {
        tool: "studio-photo",
        filename: STUDIO_PHOTO_FILENAME,
        summary: pack.summary,
        body: pack.markdown,
        markdown: pack.markdown,
        svg: null,
        html: null,
        react: null,
        installGuide: null,
        zip: null,
      },
    };
  }
  if (tool === "technical-drawing") {
    const widthMm = readWholeNumber(text(values, "widthMm"), 10000);
    const heightMm = readWholeNumber(text(values, "heightMm"), 10000);
    const depthMm = readWholeNumber(text(values, "depthMm"), 10000);
    if (widthMm === null || heightMm === null || depthMm === null) {
      return { ok: false, error: "Milimetre ölçüleri 1 ile 10000 arasında tam sayı olmalı." };
    }
    const pack = buildTechnicalDrawing({
      productName: text(values, "productName"),
      widthMm,
      heightMm,
      depthMm,
      material: text(values, "material"),
      steps: values.steps ?? "",
    });
    if (!pack) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    return {
      ok: true,
      pack: {
        tool: "technical-drawing",
        filename: TECHNICAL_DRAWING_FILENAME,
        summary: pack.summary,
        body: pack.svg,
        markdown: pack.summary,
        svg: pack.svg,
        html: null,
        react: null,
        installGuide: null,
        zip: null,
      },
    };
  }
  if (tool === "saas-builder") {
    const widget = text(values, "widget");
    const platform = text(values, "platform");
    const detail = text(values, "detail");
    if (!WIDGETS.has(widget as SaasWidgetId) || !SAAS_PLATFORMS.has(platform as SaasPlatformId)) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    if (widget === "counter" && !readCounterDeadline(detail)) {
      return { ok: false, error: "Bitiş tarihini YYYY-AA-GG olarak yaz." };
    }
    if (widget === "api" && !readApiUrl(detail)) {
      return { ok: false, error: "Betik adresi https ile başlamalı." };
    }
    const pack = buildSaasWidget({
      widget: widget as SaasWidgetId,
      platform: platform as SaasPlatformId,
      title: text(values, "title"),
      detail,
      feature: text(values, "feature"),
    });
    if (!pack || pack.html.length > 20000) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    return {
      ok: true,
      pack: {
        tool: "saas-builder",
        filename: SAAS_ZIP_FILENAME,
        summary: pack.summary,
        body: pack.html,
        markdown: pack.summary,
        svg: null,
        html: pack.html,
        react: pack.react,
        installGuide: pack.installGuide,
        zip: pack.zip,
      },
    };
  }
  return { ok: false, error: "Tezgâh bulunamadı." };
}
