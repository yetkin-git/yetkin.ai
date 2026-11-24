/**
 * Tarayıcı-içi uzman tezgâhlar. Kota ve cüzdan yoktur.
 * `studio-photo` sunucu motorundadır (`studio-photo-engine.ts`).
 */

import type { ProStudioToolId } from "@/lib/tezgah/catalog";
import type { SaasPlatformId, SaasWidgetId } from "@/lib/tezgah/pro/options";
import { SAAS_WIDGETS } from "@/lib/tezgah/pro/options";
import {
  buildSaasWidget,
  encodeSaasBuilderArchive,
  readApiUrl,
  readCounterDeadline,
  resolveSaasWidgetId,
  SAAS_ZIP_FILENAME,
} from "@/lib/tezgah/pro/saas-builder";
import {
  buildTechnicalDrawing,
  TECHNICAL_DRAWING_FILENAME,
  TECHNICAL_DRAWING_ZIP_FILENAME,
} from "@/lib/tezgah/pro/technical-drawing";
import {
  buildTechnicalDrawingDxf,
  buildTechnicalDrawingPdf,
  buildTechnicalDrawingZip,
  encodeTechnicalDrawingArchive,
} from "@/lib/tezgah/pro/technical-drawing-export";
import { readWholeNumber } from "@/lib/tezgah/pro/text";

export type ProStudioPack = {
  tool: ProStudioToolId;
  filename: string;
  summary: string;
  body: string;
  markdown: string;
  svg: string | null;
  dxf: string | null;
  pdf: Uint8Array | null;
  html: string | null;
  widgetJs: string | null;
  react: string | null;
  installGuide: string | null;
  zip: Uint8Array | null;
  zipFilename: string | null;
  /** saas-builder köprüleri için. */
  saasTitle?: string;
  saasFeature?: string;
  saasDetail?: string;
  saasWidget?: SaasWidgetId;
};

export type ProStudioResult = { ok: true; pack: ProStudioPack } | { ok: false; error: string };

const WIDGETS = new Set<SaasWidgetId>(SAAS_WIDGETS.map((row) => row.value));
const SAAS_PLATFORMS = new Set<SaasPlatformId>(["html", "wordpress", "react"]);

function text(values: Record<string, string>, name: string): string {
  return (values[name] ?? "").trim();
}

export function buildProStudio(tool: string, values: Record<string, string>): ProStudioResult {
  if (tool === "studio-photo") {
    return {
      ok: false,
      error: "Görsel stüdyo sunucuda üretilir. Oturum açıp Stüdyoyu Üret’e bas.",
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
      tolerance: text(values, "tolerance"),
    });
    if (!pack) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    const dxf = buildTechnicalDrawingDxf(pack);
    const pdf = buildTechnicalDrawingPdf(pack);
    const zip = buildTechnicalDrawingZip({ pack, dxf, pdf });
    const archive = encodeTechnicalDrawingArchive({ pack, dxf });
    return {
      ok: true,
      pack: {
        tool: "technical-drawing",
        filename: TECHNICAL_DRAWING_FILENAME,
        summary: pack.summary,
        /** Y3: arşive özet değil asıl çizim zarfı. */
        body: archive,
        markdown: pack.summary,
        svg: pack.svg,
        dxf,
        pdf,
        html: null,
        widgetJs: null,
        react: null,
        installGuide: null,
        zip,
        zipFilename: TECHNICAL_DRAWING_ZIP_FILENAME,
      },
    };
  }
  if (tool === "saas-builder") {
    const feature = text(values, "feature");
    const resolvedWidget = resolveSaasWidgetId(text(values, "widget"), feature);
    const platform = text(values, "platform");
    const detail = text(values, "detail");
    if (!resolvedWidget || !WIDGETS.has(resolvedWidget) || !SAAS_PLATFORMS.has(platform as SaasPlatformId)) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    if (resolvedWidget === "counter" && !readCounterDeadline(detail)) {
      return { ok: false, error: "Bitiş tarihini YYYY-AA-GG olarak yaz." };
    }
    if (resolvedWidget === "api" && !readApiUrl(detail)) {
      return { ok: false, error: "Betik adresi https ile başlamalı." };
    }
    const pack = buildSaasWidget({
      widget: resolvedWidget,
      platform: platform as SaasPlatformId,
      title: text(values, "title"),
      detail,
      feature,
    });
    if (!pack || pack.html.length > 20000) {
      return { ok: false, error: "Alanları kısa ve net doldur." };
    }
    const archive = encodeSaasBuilderArchive(pack);
    return {
      ok: true,
      pack: {
        tool: "saas-builder",
        filename: SAAS_ZIP_FILENAME,
        summary: pack.summary,
        /** Y3/K2: arşive özet değil saas-builder-v1 tam kod zarfı. */
        body: archive,
        markdown: pack.summary,
        svg: null,
        dxf: null,
        pdf: null,
        html: pack.html,
        widgetJs: pack.widgetJs,
        react: pack.react,
        installGuide: pack.installGuide,
        zip: pack.zip,
        zipFilename: SAAS_ZIP_FILENAME,
        saasTitle: pack.title,
        saasFeature: pack.feature,
        saasDetail: pack.detail,
        saasWidget: pack.widget,
      },
    };
  }
  return { ok: false, error: "Tezgâh bulunamadı." };
}
