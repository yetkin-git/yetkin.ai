/**
 * Teknik ölçü şeması. 3 ortografik görünüş (ön / yan / üst) SVG yerelde üretilir.
 * Dış çizim aracı yok. Kullanıcı metni escapeHtml ile kaçar; script üretilmez.
 */

import { escapeHtml, oneLine } from "@/lib/tezgah/pro/text";

export const TECHNICAL_DRAWING_FILENAME = "olcu-semasi.svg";
export const TECHNICAL_DRAWING_DXF_FILENAME = "olcu-semasi.dxf";
export const TECHNICAL_DRAWING_PDF_FILENAME = "teknik-foy.pdf";
export const TECHNICAL_DRAWING_ZIP_FILENAME = "uretim-paketi.zip";
export const TECHNICAL_DRAWING_NOTE_FILENAME = "URETIM_NOTU.md";
export const TECHNICAL_DRAWING_DEFAULT_TOLERANCE = "±0.5 mm";

export type TechnicalDrawingInput = {
  productName: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  material: string;
  steps: string;
  /** Genel tolerans notu; boşsa varsayılan ±0.5 mm. */
  tolerance?: string;
};

export type TechnicalDrawingPack = {
  filename: typeof TECHNICAL_DRAWING_FILENAME;
  svg: string;
  summary: string;
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
};

export function stepLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => oneLine(line, 72))
    .filter((line) => line.length >= 2)
    .slice(0, 6);
}

export function readTolerance(raw: string | undefined): string {
  const cleaned = oneLine(raw ?? "", 24);
  if (cleaned.length < 2) {
    return TECHNICAL_DRAWING_DEFAULT_TOLERANCE;
  }
  return cleaned;
}

/** Hacim cm³ ve kargo desisi (W×H×D cm / 3000). */
export function computeVolumeAndDesi(
  widthMm: number,
  heightMm: number,
  depthMm: number,
): { volumeCm3: number; desi: number } {
  const wCm = widthMm / 10;
  const hCm = heightMm / 10;
  const dCm = depthMm / 10;
  const volumeCm3 = Math.round(wCm * hCm * dCm * 100) / 100;
  const desi = Math.round(((wCm * hCm * dCm) / 3000) * 1000) / 1000;
  return { volumeCm3, desi };
}

/** Çizim ölçeği 1:N — görünüşler paftaya sığacak en büyük N. */
export function chooseScaleRatio(widthMm: number, heightMm: number, depthMm: number): number {
  const candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
  const maxFrontW = 240;
  const maxFrontH = 170;
  const maxDepth = 150;
  for (const ratio of candidates) {
    const pxPerMm = 1 / ratio;
    if (
      widthMm * pxPerMm <= maxFrontW &&
      heightMm * pxPerMm <= maxFrontH &&
      depthMm * pxPerMm <= maxDepth
    ) {
      return ratio;
    }
  }
  return 1000;
}

function dimH(x1: number, x2: number, y: number, label: string, color = "#0f766e"): string {
  const mid = Math.round((x1 + x2) / 2);
  return [
    `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1.4"/>`,
    `<line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}" stroke="${color}" stroke-width="1.4"/>`,
    `<line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}" stroke="${color}" stroke-width="1.4"/>`,
    `<polygon points="${x1},${y} ${x1 + 7},${y - 3.5} ${x1 + 7},${y + 3.5}" fill="${color}"/>`,
    `<polygon points="${x2},${y} ${x2 - 7},${y - 3.5} ${x2 - 7},${y + 3.5}" fill="${color}"/>`,
    `<text x="${mid}" y="${y + 16}" text-anchor="middle" font-size="12" font-family="system-ui,sans-serif" fill="${color}">${label}</text>`,
  ].join("");
}

function dimV(x: number, y1: number, y2: number, label: string, color = "#0f766e"): string {
  const mid = Math.round((y1 + y2) / 2);
  return [
    `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${color}" stroke-width="1.4"/>`,
    `<line x1="${x - 5}" y1="${y1}" x2="${x + 5}" y2="${y1}" stroke="${color}" stroke-width="1.4"/>`,
    `<line x1="${x - 5}" y1="${y2}" x2="${x + 5}" y2="${y2}" stroke="${color}" stroke-width="1.4"/>`,
    `<polygon points="${x},${y1} ${x - 3.5},${y1 + 7} ${x + 3.5},${y1 + 7}" fill="${color}"/>`,
    `<polygon points="${x},${y2} ${x - 3.5},${y2 - 7} ${x + 3.5},${y2 - 7}" fill="${color}"/>`,
    `<text x="${x + 10}" y="${mid + 4}" font-size="12" font-family="system-ui,sans-serif" fill="${color}">${label}</text>`,
  ].join("");
}

function scaleBar(x: number, y: number, scaleRatio: number): string {
  const barMm = scaleRatio <= 10 ? 100 : scaleRatio <= 50 ? 200 : 500;
  const barPx = Math.max(40, Math.round(barMm / scaleRatio));
  const segments = 4;
  const seg = barPx / segments;
  const ticks = Array.from({ length: segments + 1 }, (_, i) => {
    const tx = x + Math.round(i * seg);
    return `<line x1="${tx}" y1="${y}" x2="${tx}" y2="${y + 8}" stroke="#142033" stroke-width="1.2"/>`;
  }).join("");
  return [
    `<text x="${x}" y="${y - 6}" font-size="11" font-family="system-ui,sans-serif" fill="#3d4d63">Ölçek 1:${scaleRatio} · Cetvel ${barMm} mm</text>`,
    `<line x1="${x}" y1="${y + 4}" x2="${x + barPx}" y2="${y + 4}" stroke="#142033" stroke-width="2"/>`,
    ticks,
    `<text x="${x}" y="${y + 22}" font-size="10" font-family="system-ui,sans-serif" fill="#3d4d63">0</text>`,
    `<text x="${x + barPx}" y="${y + 22}" text-anchor="end" font-size="10" font-family="system-ui,sans-serif" fill="#3d4d63">${barMm}</text>`,
  ].join("");
}

function titleBlock(input: {
  x: number;
  y: number;
  name: string;
  scaleRatio: number;
  tolerance: string;
  materialLine: string;
  dims: string;
}): string {
  const { x, y, name, scaleRatio, tolerance, materialLine, dims } = input;
  return [
    `<rect x="${x}" y="${y}" width="280" height="108" fill="#f8fafc" stroke="#1e3a5f" stroke-width="1.5"/>`,
    `<line x1="${x}" y1="${y + 28}" x2="${x + 280}" y2="${y + 28}" stroke="#1e3a5f" stroke-width="1"/>`,
    `<text x="${x + 10}" y="${y + 18}" font-size="12" font-family="system-ui,sans-serif" fill="#142033">Teknik Çizim Anteti</text>`,
    `<text x="${x + 10}" y="${y + 46}" font-size="11" font-family="system-ui,sans-serif" fill="#142033">Parça: ${name}</text>`,
    `<text x="${x + 10}" y="${y + 64}" font-size="11" font-family="system-ui,sans-serif" fill="#3d4d63">Ölçü: ${dims} · Ölçek 1:${scaleRatio}</text>`,
    `<text x="${x + 10}" y="${y + 82}" font-size="11" font-family="system-ui,sans-serif" fill="#3d4d63">Tolerans: ${escapeHtml(tolerance)}</text>`,
    `<text x="${x + 10}" y="${y + 98}" font-size="10" font-family="system-ui,sans-serif" fill="#3d4d63">${materialLine} · yetkin.ai / AI Tezgâh</text>`,
  ].join("");
}

export function buildTechnicalDrawing(input: TechnicalDrawingInput): TechnicalDrawingPack | null {
  const productName = oneLine(input.productName, 80);
  const material = oneLine(input.material, 80);
  if (productName.length < 2) {
    return null;
  }
  if (
    input.widthMm < 1 ||
    input.heightMm < 1 ||
    input.depthMm < 1 ||
    input.widthMm > 10000 ||
    input.heightMm > 10000 ||
    input.depthMm > 10000
  ) {
    return null;
  }

  const steps = stepLines(input.steps);
  const tolerance = readTolerance(input.tolerance);
  const scaleRatio = chooseScaleRatio(input.widthMm, input.heightMm, input.depthMm);
  const px = 1 / scaleRatio;
  const w = Math.max(14, Math.round(input.widthMm * px));
  const h = Math.max(14, Math.round(input.heightMm * px));
  const d = Math.max(14, Math.round(input.depthMm * px));
  const { volumeCm3, desi } = computeVolumeAndDesi(input.widthMm, input.heightMm, input.depthMm);

  const frontX = 48;
  const frontY = 88;
  const gap = 56;
  const sideX = frontX + w + gap + 36;
  const sideY = frontY;
  const topX = frontX;
  const topY = frontY + h + gap + 28;

  const name = escapeHtml(productName);
  const materialLine =
    material.length >= 2
      ? `Malzeme / kalınlık: ${escapeHtml(material)}`
      : "Malzeme / kalınlık: belirtilmedi";
  const dimsLabel = `${input.widthMm} × ${input.heightMm} × ${input.depthMm} mm`;
  const stepBlock =
    steps.length === 0
      ? `<text x="640" y="172" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">Montaj adımı yazılmadı.</text>`
      : steps
          .map(
            (step, index) =>
              `<text x="640" y="${172 + index * 22}" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">${index + 1}. ${escapeHtml(step)}</text>`,
          )
          .join("");

  const sheetW = 960;
  const sheetH = 720;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetW} ${sheetH}" width="${sheetW}" height="${sheetH}" role="img" aria-labelledby="olcu-baslik">`,
    `<title id="olcu-baslik">${name} ölçü şeması — ön / yan / üst</title>`,
    `<rect width="${sheetW}" height="${sheetH}" fill="#ffffff"/>`,
    `<text x="24" y="28" font-size="18" font-family="system-ui,sans-serif" fill="#142033">${name}</text>`,
    `<text x="24" y="50" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">3 görünüşlü ortografik ölçü şeması · Genel tolerans ${escapeHtml(tolerance)} · Desi ${desi}</text>`,
    scaleBar(24, 62, scaleRatio),
    `<text x="${frontX}" y="${frontY - 10}" font-size="13" font-family="system-ui,sans-serif" fill="#142033">Ön Görünüş (Genişlik × Yükseklik)</text>`,
    `<rect x="${frontX}" y="${frontY}" width="${w}" height="${h}" fill="#f4f7fb" stroke="#1e3a5f" stroke-width="2" data-view="front"/>`,
    dimH(frontX, frontX + w, frontY + h + 18, `${input.widthMm} mm`),
    dimV(frontX + w + 18, frontY, frontY + h, `${input.heightMm} mm`),
    `<text x="${sideX}" y="${sideY - 10}" font-size="13" font-family="system-ui,sans-serif" fill="#142033">Yan Görünüş (Derinlik × Yükseklik)</text>`,
    `<rect x="${sideX}" y="${sideY}" width="${d}" height="${h}" fill="#eef6f4" stroke="#1e3a5f" stroke-width="2" data-view="side" data-depth-mm="${input.depthMm}"/>`,
    dimH(sideX, sideX + d, sideY + h + 18, `${input.depthMm} mm`),
    dimV(sideX + d + 18, sideY, sideY + h, `${input.heightMm} mm`),
    `<text x="${topX}" y="${topY - 10}" font-size="13" font-family="system-ui,sans-serif" fill="#142033">Üst Görünüş (Genişlik × Derinlik)</text>`,
    `<rect x="${topX}" y="${topY}" width="${w}" height="${d}" fill="#f7f4fb" stroke="#1e3a5f" stroke-width="2" data-view="top" data-depth-mm="${input.depthMm}"/>`,
    dimH(topX, topX + w, topY + d + 18, `${input.widthMm} mm`),
    dimV(topX + w + 18, topY, topY + d, `${input.depthMm} mm`),
    `<text x="640" y="100" font-size="15" font-family="system-ui,sans-serif" fill="#142033">Malzeme &amp; Kalınlık Özeti</text>`,
    `<text x="640" y="122" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">${materialLine}</text>`,
    `<text x="640" y="148" font-size="15" font-family="system-ui,sans-serif" fill="#142033">Montaj / İşlem Adımları</text>`,
    stepBlock,
    `<text x="640" y="330" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">Genel tolerans notu: ${escapeHtml(tolerance)}</text>`,
    `<text x="640" y="350" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">Hacim ${volumeCm3} cm³ · Kargo desi (W×H×D)/3000 = ${desi}</text>`,
    titleBlock({
      x: 640,
      y: 560,
      name,
      scaleRatio,
      tolerance,
      materialLine,
      dims: dimsLabel,
    }),
    `</svg>`,
  ].join("");

  return {
    filename: TECHNICAL_DRAWING_FILENAME,
    svg,
    summary: `Ölçü şeması: ${productName}. ${dimsLabel}. Ön/yan/üst · 1:${scaleRatio}. ${TECHNICAL_DRAWING_FILENAME}.`,
    productName,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    depthMm: input.depthMm,
    material,
    steps,
    tolerance,
    scaleRatio,
    volumeCm3,
    desi,
  };
}
