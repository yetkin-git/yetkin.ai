/**
 * Teknik ölçü şeması. SVG yerelde üretilir. Dış çizim aracı yok.
 */

import { escapeHtml, oneLine } from "@/lib/tezgah/pro/text";

export const TECHNICAL_DRAWING_FILENAME = "olcu-semasi.svg";

export type TechnicalDrawingInput = {
  productName: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  material: string;
  steps: string;
};

export type TechnicalDrawingPack = {
  filename: typeof TECHNICAL_DRAWING_FILENAME;
  svg: string;
  summary: string;
};

function stepLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => oneLine(line, 72))
    .filter((line) => line.length >= 2)
    .slice(0, 6);
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
  const scale = Math.min(280 / input.widthMm, 200 / input.heightMm);
  const width = Math.max(12, Math.round(input.widthMm * scale));
  const height = Math.max(12, Math.round(input.heightMm * scale));
  const x = 56;
  const y = 78;
  const name = escapeHtml(productName);
  const materialLine = material.length >= 2 ? `Malzeme: ${escapeHtml(material)}.` : "Malzeme satırı boş.";
  const stepSvg =
    steps.length === 0
      ? `<text x="400" y="132" font-size="13">Adım yazılmadı. Ölçüler milimetredir.</text>`
      : steps
          .map(
            (step, index) =>
              `<text x="400" y="${132 + index * 28}" font-size="13">${index + 1}. ${escapeHtml(step)}</text>`,
          )
          .join("");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 460" width="720" height="460" role="img" aria-labelledby="olcu-baslik">`,
    `<title id="olcu-baslik">${name} ölçü şeması</title>`,
    `<rect width="720" height="460" fill="#ffffff"/>`,
    `<text x="24" y="32" font-size="18" font-family="system-ui,sans-serif" fill="#142033">${name}</text>`,
    `<text x="24" y="54" font-size="12" font-family="system-ui,sans-serif" fill="#3d4d63">Ölçüler milimetredir. Derinlik ${input.depthMm} mm.</text>`,
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#f4f7fb" stroke="#1e3a5f" stroke-width="2"/>`,
    `<line x1="${x}" y1="${y + height + 22}" x2="${x + width}" y2="${y + height + 22}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<line x1="${x}" y1="${y + height + 16}" x2="${x}" y2="${y + height + 28}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<line x1="${x + width}" y1="${y + height + 16}" x2="${x + width}" y2="${y + height + 28}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<text x="${x + Math.round(width / 2)}" y="${y + height + 42}" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="#0f766e">${input.widthMm} mm</text>`,
    `<line x1="${x + width + 22}" y1="${y}" x2="${x + width + 22}" y2="${y + height}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<line x1="${x + width + 16}" y1="${y}" x2="${x + width + 28}" y2="${y}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<line x1="${x + width + 16}" y1="${y + height}" x2="${x + width + 28}" y2="${y + height}" stroke="#0f766e" stroke-width="1.5"/>`,
    `<text x="${x + width + 36}" y="${y + Math.round(height / 2)}" font-size="13" font-family="system-ui,sans-serif" fill="#0f766e">${input.heightMm} mm</text>`,
    `<text x="400" y="78" font-size="16" font-family="system-ui,sans-serif" fill="#142033">Montaj ve kullanım</text>`,
    `<text x="400" y="104" font-size="13" font-family="system-ui,sans-serif" fill="#3d4d63">${materialLine}</text>`,
    stepSvg,
    `</svg>`,
  ].join("");
  return {
    filename: TECHNICAL_DRAWING_FILENAME,
    svg,
    summary: `Ölçü şeması: ${productName}. ${input.widthMm} × ${input.heightMm} × ${input.depthMm} mm. ${TECHNICAL_DRAWING_FILENAME}.`,
  };
}
