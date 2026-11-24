/**
 * Teknik çizim teslimatı: ASCII DXF, teknik föy PDF, üretim ZIP ve arşiv zarfı.
 * Kullanıcı metni DXF TEXT / PDF / MD yollarında temizlenir; script üretilmez.
 */

import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";
import { buildStoreZip } from "@/lib/tezgah/pro/zip";
import {
  TECHNICAL_DRAWING_DXF_FILENAME,
  TECHNICAL_DRAWING_FILENAME,
  TECHNICAL_DRAWING_NOTE_FILENAME,
  TECHNICAL_DRAWING_PDF_FILENAME,
  TECHNICAL_DRAWING_ZIP_FILENAME,
  type TechnicalDrawingPack,
} from "@/lib/tezgah/pro/technical-drawing";
import { oneLine } from "@/lib/tezgah/pro/text";

export const TECHNICAL_DRAWING_ARCHIVE_KIND = "technical-drawing-v1" as const;

export type TechnicalDrawingArchive = {
  kind: typeof TECHNICAL_DRAWING_ARCHIVE_KIND;
  productName: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  material: string;
  steps: string[];
  tolerance: string;
  scaleRatio: number;
  volumeCm3: number;
  desi: number;
  summary: string;
  svg: string;
  dxf: string;
};

/** DXF TEXT / LAYER adları için ASCII-güvenli sadeleştirme. */
function dxfSafe(value: string, max = 80): string {
  return oneLine(value, max)
    .replace(/[<>&"'`\\]/g, "")
    .replace(/[^\x20-\x7EğüşıöçĞÜŞİÖÇ±×°]/gi, "")
    .trim();
}

function pair(code: number, value: string | number): string {
  return `${code}\n${value}\n`;
}

function dxfLine(x1: number, y1: number, x2: number, y2: number, layer = "OUTLINE"): string {
  return (
    pair(0, "LINE") +
    pair(8, layer) +
    pair(10, x1) +
    pair(20, y1) +
    pair(30, 0) +
    pair(11, x2) +
    pair(21, y2) +
    pair(31, 0)
  );
}

function dxfRect(x: number, y: number, w: number, h: number, layer = "OUTLINE"): string {
  return (
    dxfLine(x, y, x + w, y, layer) +
    dxfLine(x + w, y, x + w, y + h, layer) +
    dxfLine(x + w, y + h, x, y + h, layer) +
    dxfLine(x, y + h, x, y, layer)
  );
}

function dxfText(x: number, y: number, height: number, value: string, layer = "DIMS"): string {
  const text = dxfSafe(value, 64) || "-";
  return (
    pair(0, "TEXT") +
    pair(8, layer) +
    pair(10, x) +
    pair(20, y) +
    pair(30, 0) +
    pair(40, height) +
    pair(1, text)
  );
}

/**
 * R12/2000 uyumlu 2D ASCII DXF.
 * Üç görünüş gerçek mm koordinatında: ön (0,0), yan (W+gap,0), üst (0,-(H+gap)).
 */
export function buildTechnicalDrawingDxf(pack: TechnicalDrawingPack): string {
  const gap = Math.max(40, Math.round(Math.max(pack.widthMm, pack.depthMm) * 0.25));
  const frontX = 0;
  const frontY = 0;
  const sideX = pack.widthMm + gap;
  const sideY = 0;
  const topX = 0;
  const topY = -(pack.heightMm + gap);

  const entities =
    dxfRect(frontX, frontY, pack.widthMm, pack.heightMm) +
    dxfText(frontX, frontY + pack.heightMm + 12, 8, `ON ${pack.widthMm}x${pack.heightMm}`) +
    dxfText(frontX + pack.widthMm / 2 - 10, frontY - 8, 6, `${pack.widthMm} mm`) +
    dxfText(frontX + pack.widthMm + 6, frontY + pack.heightMm / 2, 6, `${pack.heightMm} mm`) +
    dxfRect(sideX, sideY, pack.depthMm, pack.heightMm) +
    dxfText(sideX, sideY + pack.heightMm + 12, 8, `YAN ${pack.depthMm}x${pack.heightMm}`) +
    dxfText(sideX + pack.depthMm / 2 - 10, sideY - 8, 6, `${pack.depthMm} mm`) +
    dxfText(sideX + pack.depthMm + 6, sideY + pack.heightMm / 2, 6, `${pack.heightMm} mm`) +
    dxfRect(topX, topY, pack.widthMm, pack.depthMm) +
    dxfText(topX, topY + pack.depthMm + 12, 8, `UST ${pack.widthMm}x${pack.depthMm}`) +
    dxfText(topX + pack.widthMm / 2 - 10, topY - 8, 6, `${pack.widthMm} mm`) +
    dxfText(topX + pack.widthMm + 6, topY + pack.depthMm / 2, 6, `${pack.depthMm} mm`) +
    dxfText(0, pack.heightMm + gap + 30, 10, dxfSafe(pack.productName, 60)) +
    dxfText(0, pack.heightMm + gap + 18, 6, `Tol ${dxfSafe(pack.tolerance, 20)} Olcek 1:${pack.scaleRatio}`);

  return (
    pair(0, "SECTION") +
    pair(2, "HEADER") +
    pair(9, "$ACADVER") +
    pair(1, "AC1015") +
    pair(9, "$INSUNITS") +
    pair(70, 4) +
    pair(0, "ENDSEC") +
    pair(0, "SECTION") +
    pair(2, "TABLES") +
    pair(0, "TABLE") +
    pair(2, "LAYER") +
    pair(70, 2) +
    pair(0, "LAYER") +
    pair(2, "OUTLINE") +
    pair(70, 0) +
    pair(62, 7) +
    pair(6, "CONTINUOUS") +
    pair(0, "LAYER") +
    pair(2, "DIMS") +
    pair(70, 0) +
    pair(62, 3) +
    pair(6, "CONTINUOUS") +
    pair(0, "ENDTAB") +
    pair(0, "ENDSEC") +
    pair(0, "SECTION") +
    pair(2, "ENTITIES") +
    entities +
    pair(0, "ENDSEC") +
    pair(0, "EOF")
  );
}

export function technicalDrawingToBlocks(pack: TechnicalDrawingPack): DocumentBlock[] {
  const stepRows =
    pack.steps.length === 0
      ? [["—", "Montaj adımı yazılmadı"]]
      : pack.steps.map((step, index) => [String(index + 1), step]);
  return [
    { kind: "h1", text: `Teknik Föy — ${pack.productName}` },
    { kind: "p", text: "3 görünüşlü ortografik ölçü şeması (ön / yan / üst). Ölçüler milimetredir." },
    {
      kind: "table",
      headers: ["Alan", "Değer"],
      rows: [
        ["Parça", pack.productName],
        ["Genişlik (W)", `${pack.widthMm} mm`],
        ["Yükseklik (H)", `${pack.heightMm} mm`],
        ["Derinlik (D)", `${pack.depthMm} mm`],
        ["Ölçek", `1:${pack.scaleRatio}`],
        ["Genel tolerans", pack.tolerance],
        ["Malzeme / kalınlık", pack.material || "belirtilmedi"],
        ["Hacim", `${pack.volumeCm3} cm³`],
        ["Kargo desi (W×H×D)/3000", String(pack.desi)],
      ],
    },
    { kind: "h2", text: "Montaj / İşlem Adımları" },
    { kind: "table", headers: ["Adım", "İşlem"], rows: stepRows },
    {
      kind: "p",
      text: "Teslimat: olcu-semasi.svg · olcu-semasi.dxf · teknik-foy.pdf · yetkin.ai / AI Tezgâh",
    },
  ];
}

export function buildTechnicalDrawingPdf(pack: TechnicalDrawingPack): Uint8Array {
  return buildPlainPdf(technicalDrawingToBlocks(pack));
}

export function buildTechnicalDrawingNote(pack: TechnicalDrawingPack): string {
  const steps =
    pack.steps.length === 0
      ? "- Montaj adımı yazılmadı."
      : pack.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return [
    `# Üretim Notu — ${pack.productName}`,
    "",
    `- Ölçü: ${pack.widthMm} × ${pack.heightMm} × ${pack.depthMm} mm`,
    `- Ölçek: 1:${pack.scaleRatio}`,
    `- Genel tolerans: ${pack.tolerance}`,
    `- Malzeme / kalınlık: ${pack.material || "belirtilmedi"}`,
    `- Hacim: ${pack.volumeCm3} cm³`,
    `- Kargo desi (W×H×D)/3000: ${pack.desi}`,
    "",
    "## Montaj / İşlem",
    steps,
    "",
    "## Paket içeriği",
    `- ${TECHNICAL_DRAWING_FILENAME}`,
    `- ${TECHNICAL_DRAWING_DXF_FILENAME}`,
    `- ${TECHNICAL_DRAWING_PDF_FILENAME}`,
    `- ${TECHNICAL_DRAWING_NOTE_FILENAME}`,
    "",
    "Üreten: yetkin.ai / AI Tezgâh — Teknik Çizim masası.",
    "",
  ].join("\n");
}

export function buildTechnicalDrawingZip(input: {
  pack: TechnicalDrawingPack;
  dxf: string;
  pdf: Uint8Array;
}): Uint8Array {
  return buildStoreZip([
    { name: TECHNICAL_DRAWING_FILENAME, text: input.pack.svg },
    { name: TECHNICAL_DRAWING_DXF_FILENAME, text: input.dxf },
    { name: TECHNICAL_DRAWING_PDF_FILENAME, bytes: input.pdf },
    { name: TECHNICAL_DRAWING_NOTE_FILENAME, text: buildTechnicalDrawingNote(input.pack) },
  ]);
}

export function encodeTechnicalDrawingArchive(input: {
  pack: TechnicalDrawingPack;
  dxf: string;
}): string {
  const archive: TechnicalDrawingArchive = {
    kind: TECHNICAL_DRAWING_ARCHIVE_KIND,
    productName: input.pack.productName,
    widthMm: input.pack.widthMm,
    heightMm: input.pack.heightMm,
    depthMm: input.pack.depthMm,
    material: input.pack.material,
    steps: input.pack.steps,
    tolerance: input.pack.tolerance,
    scaleRatio: input.pack.scaleRatio,
    volumeCm3: input.pack.volumeCm3,
    desi: input.pack.desi,
    summary: input.pack.summary,
    svg: input.pack.svg,
    dxf: input.dxf,
  };
  return JSON.stringify(archive);
}

export function parseTechnicalDrawingArchive(raw: string): TechnicalDrawingArchive | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("<svg")) {
    return null;
  }
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<TechnicalDrawingArchive>;
    if (parsed.kind !== TECHNICAL_DRAWING_ARCHIVE_KIND) {
      return null;
    }
    if (
      typeof parsed.svg !== "string" ||
      !parsed.svg.includes("<svg") ||
      typeof parsed.dxf !== "string" ||
      typeof parsed.productName !== "string" ||
      typeof parsed.widthMm !== "number" ||
      typeof parsed.heightMm !== "number" ||
      typeof parsed.depthMm !== "number"
    ) {
      return null;
    }
    return {
      kind: TECHNICAL_DRAWING_ARCHIVE_KIND,
      productName: parsed.productName,
      widthMm: parsed.widthMm,
      heightMm: parsed.heightMm,
      depthMm: parsed.depthMm,
      material: typeof parsed.material === "string" ? parsed.material : "",
      steps: Array.isArray(parsed.steps)
        ? parsed.steps.filter((step): step is string => typeof step === "string").slice(0, 6)
        : [],
      tolerance: typeof parsed.tolerance === "string" ? parsed.tolerance : "±0.5 mm",
      scaleRatio: typeof parsed.scaleRatio === "number" ? parsed.scaleRatio : 1,
      volumeCm3: typeof parsed.volumeCm3 === "number" ? parsed.volumeCm3 : 0,
      desi: typeof parsed.desi === "number" ? parsed.desi : 0,
      summary: typeof parsed.summary === "string" ? parsed.summary : parsed.productName,
      svg: parsed.svg,
      dxf: parsed.dxf,
    };
  } catch {
    return null;
  }
}

/** Arşiv veya düz SVG gövdesinden önizleme SVG'si. */
export function readTechnicalDrawingSvg(raw: string): string | null {
  const archive = parseTechnicalDrawingArchive(raw);
  if (archive) {
    return archive.svg;
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith("<svg") && trimmed.includes("</svg>")) {
    return trimmed;
  }
  return null;
}

export function archiveToTechnicalDrawingPack(
  archive: TechnicalDrawingArchive,
): TechnicalDrawingPack {
  return {
    filename: TECHNICAL_DRAWING_FILENAME,
    svg: archive.svg,
    summary: archive.summary,
    productName: archive.productName,
    widthMm: archive.widthMm,
    heightMm: archive.heightMm,
    depthMm: archive.depthMm,
    material: archive.material,
    steps: archive.steps,
    tolerance: archive.tolerance,
    scaleRatio: archive.scaleRatio,
    volumeCm3: archive.volumeCm3,
    desi: archive.desi,
  };
}

export { TECHNICAL_DRAWING_ZIP_FILENAME };
