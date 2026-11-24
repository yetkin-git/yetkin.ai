/**
 * Tarayıcı-içi üretim zarflarının **sunucu** doğrulaması (O8).
 *
 * `technical-drawing` ve `saas-builder` istemcide üretilir; bu yüzden gelen
 * `outputContent` istemci beyanıdır. Arşive yazmadan önce zarfın kendi
 * `kind` mührü, yapısal alanları ve boyutu burada denetlenir. Doğrulanmayan
 * içerik **reddedilir**; "güven ama doğrulama" yoktur.
 *
 * Güvenlik sınırı:
 * - SVG çıktısında `<script`, `javascript:`, `on*=` olayı ve `<foreignObject>` yasak.
 * - SaasBuilder HTML'i **bizim şablonumuzdur** ve bilinçli olarak `<script>` taşır;
 *   bu yüzden orada yasak liste değil, kaynak allowlist'i uygulanır (yalnız `https:`
 *   dış betik + gömülü kod). Şablon dışı kabuk kabul edilmez.
 * - Tüm zarf türlerinde boyut tavanı vardır; veritabanı Text kolonu şişirilmez.
 */

import {
  parseSaasBuilderArchive,
  SAAS_BUILDER_ARCHIVE_KIND,
} from "@/lib/tezgah/pro/saas-builder";
import {
  parseStudioPhotoArchive,
  STUDIO_PHOTO_ARCHIVE_KIND,
} from "@/lib/tezgah/pro/studio-photo";
import {
  parseTechnicalDrawingArchive,
  TECHNICAL_DRAWING_ARCHIVE_KIND,
} from "@/lib/tezgah/pro/technical-drawing-export";

/** İstemciden gelen tek zarfın metin tavanı. */
export const TEZGAH_OUTPUT_CONTENT_MAX = 400_000;

/** Görsel zarfı base64 + kılavuz taşır; metin zarfından büyüktür. */
export const TEZGAH_OUTPUT_IMAGE_CONTENT_MAX = 3_000_000;

export const TEZGAH_ARCHIVE_TOOL_KEYS = [
  "technical-drawing",
  "saas-builder",
  "studio-photo",
] as const;

export type TezgahArchiveToolKey = (typeof TEZGAH_ARCHIVE_TOOL_KEYS)[number];

export type TezgahArchiveVerdict =
  | { ok: true }
  | { ok: false; error: string };

const SCRIPT_TAG = /<\s*script\b/i;
const EVENT_HANDLER = /\son[a-z]+\s*=/i;
const JAVASCRIPT_URL = /javascript\s*:/i;
const FOREIGN_OBJECT = /<\s*foreignObject\b/i;
const DATA_HTML = /data\s*:\s*text\/html/i;

/** Üretilen SVG'de kabuk kaçırma denemesi var mı? */
export function svgCarriesScript(svg: string): boolean {
  return (
    SCRIPT_TAG.test(svg) ||
    EVENT_HANDLER.test(svg) ||
    JAVASCRIPT_URL.test(svg) ||
    FOREIGN_OBJECT.test(svg)
  );
}

const STUDIO_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function contentCapFor(toolKey: TezgahArchiveToolKey): number {
  return toolKey === "studio-photo"
    ? TEZGAH_OUTPUT_IMAGE_CONTENT_MAX
    : TEZGAH_OUTPUT_CONTENT_MAX;
}

function checkTechnicalDrawing(content: string): TezgahArchiveVerdict {
  const archive = parseTechnicalDrawingArchive(content);
  if (!archive) {
    return { ok: false, error: `Teknik çizim zarfı geçersiz (${TECHNICAL_DRAWING_ARCHIVE_KIND}).` };
  }
  if (archive.kind !== TECHNICAL_DRAWING_ARCHIVE_KIND) {
    return { ok: false, error: "Teknik çizim zarf türü uyuşmuyor." };
  }
  if (svgCarriesScript(archive.svg)) {
    return { ok: false, error: "Teknik çizim SVG'si betik taşıyor." };
  }
  if (!archive.svg.trimEnd().endsWith("</svg>")) {
    return { ok: false, error: "Teknik çizim SVG'si kapalı değil." };
  }
  if (!archive.dxf.trim().endsWith("EOF")) {
    return { ok: false, error: "Teknik çizim DXF'si tamamlanmamış." };
  }
  if (archive.steps.length > 6) {
    return { ok: false, error: "Teknik çizim montaj adımı tavanı aşıldı." };
  }
  for (const value of [archive.widthMm, archive.heightMm, archive.depthMm]) {
    if (!Number.isInteger(value) || value < 1 || value > 10_000) {
      return { ok: false, error: "Teknik çizim ölçüsü aralık dışında." };
    }
  }
  return { ok: true };
}

function checkSaasBuilder(content: string): TezgahArchiveVerdict {
  const archive = parseSaasBuilderArchive(content);
  if (!archive) {
    return { ok: false, error: `Mini SaaS zarfı geçersiz (${SAAS_BUILDER_ARCHIVE_KIND}).` };
  }
  if (archive.kind !== SAAS_BUILDER_ARCHIVE_KIND) {
    return { ok: false, error: "Mini SaaS zarf türü uyuşmuyor." };
  }
  // Şablon dışı kabuk: gömülü `<script>` bizim motorumuzdan gelmeli, yani
  // `widget.js` dosyasıyla aynı gövdeyi taşımalı. Dış `http:` betik yasaktır.
  if (/\bsrc\s*=\s*["']?\s*http:/i.test(archive.html)) {
    return { ok: false, error: "Mini SaaS HTML'i şifresiz dış betik yüklüyor." };
  }
  if (DATA_HTML.test(archive.html) || JAVASCRIPT_URL.test(archive.html)) {
    return { ok: false, error: "Mini SaaS HTML'i veri URL'siyle betik kaçırıyor." };
  }
  if (FOREIGN_OBJECT.test(archive.html)) {
    return { ok: false, error: "Mini SaaS HTML'i yabancı nesne taşıyor." };
  }
  if (archive.html.length > 20_000) {
    return { ok: false, error: "Mini SaaS bileşeni boyut tavanını aşıyor." };
  }
  if (archive.feature.length > 300) {
    return { ok: false, error: "Mini SaaS özellik metni tavanı aşıldı." };
  }
  return { ok: true };
}

function checkStudioPhoto(content: string): TezgahArchiveVerdict {
  const archive = parseStudioPhotoArchive(content);
  if (!archive) {
    return { ok: false, error: `Görsel stüdyo zarfı geçersiz (${STUDIO_PHOTO_ARCHIVE_KIND}).` };
  }
  if (archive.kind !== STUDIO_PHOTO_ARCHIVE_KIND) {
    return { ok: false, error: "Görsel stüdyo zarf türü uyuşmuyor." };
  }
  if (!STUDIO_MIME.has(archive.mimeType)) {
    return { ok: false, error: "Görsel stüdyo MIME türü kabul edilmiyor." };
  }
  const base64 = archive.imageBase64.replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    return { ok: false, error: "Görsel stüdyo base64 gövdesi bozuk." };
  }
  if (base64.length < 32) {
    return { ok: false, error: "Görsel stüdyo görseli boş." };
  }
  return { ok: true };
}

/**
 * Zarfı araca göre doğrular. `false` dönerse arşive **yazılmaz**.
 * Bilinmeyen araç reddedilir; bu rota yalnız tarayıcı-içi üç masayı kabul eder.
 */
export function inspectTezgahArchive(
  toolKey: string,
  content: string,
): TezgahArchiveVerdict {
  if (content.length === 0) {
    return { ok: false, error: "Çıktı içeriği boş." };
  }
  if (!(TEZGAH_ARCHIVE_TOOL_KEYS as readonly string[]).includes(toolKey)) {
    return { ok: false, error: "Bu araç tarayıcı arşivine yazılamaz." };
  }
  const key = toolKey as TezgahArchiveToolKey;
  if (content.length > contentCapFor(key)) {
    return { ok: false, error: "Çıktı içeriği boyut tavanını aşıyor." };
  }
  switch (key) {
    case "technical-drawing":
      return checkTechnicalDrawing(content);
    case "saas-builder":
      return checkSaasBuilder(content);
    case "studio-photo":
      return checkStudioPhoto(content);
  }
}
