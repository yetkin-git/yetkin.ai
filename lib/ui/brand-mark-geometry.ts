/**
 * yetkin.ai marka geometrisi — favicon, apple-icon ve kabuk BrandIcon SSOT.
 * Sabit kalınlıklı, yatay tepeli geometrik "Y" + mor/mavi yapay-zekâ gradyanı.
 * Ray, haç, altın sinyal ve "Yetkin Rail" mührü yoktur.
 */
import { YETKIN_BRAND } from "@/lib/copy/brand";

export const BRAND_MARK_VIEWBOX = 32;

export const BRAND_MARK_COLORS = {
  violet: "#6d5cff",
  violetMid: "#4b6fff",
  safir: "#1a8cff",
  letter: "#ffffff",
  sheen: "#ffffff",
} as const;

export const BRAND_MARK_GRADIENT = {
  id: "yetkinBrandY",
  x1: 4,
  y1: 2,
  x2: 28,
  y2: 30,
  stops: [
    { offset: 0, color: BRAND_MARK_COLORS.violet },
    { offset: 0.52, color: BRAND_MARK_COLORS.violetMid },
    { offset: 1, color: BRAND_MARK_COLORS.safir },
  ],
} as const;

export const BRAND_MARK_SHEEN = {
  id: "yetkinBrandYSheen",
  x1: 3,
  y1: 1,
  x2: 20,
  y2: 18,
  stops: [
    { offset: 0, color: BRAND_MARK_COLORS.sheen, opacity: 0.2 },
    { offset: 1, color: BRAND_MARK_COLORS.sheen, opacity: 0 },
  ],
} as const;

/** 32px plakada keskin kare; köşe yarıçapı ikon ölçeğinde (32/40) bozulmaz. */
export const BRAND_MARK_PLATE_RADIUS = 7;

/**
 * Optik merkezli Y — yatay kol tepeleri, paralel kol kenarları, uzun gövde.
 * 16px favicon’da harf olarak okunur; ray makasına benzemez.
 */
export const BRAND_MARK_LETTER_VERTICES = [
  [6.81, 6.18],
  [12.03, 6.18],
  [16.0, 12.25],
  [19.97, 6.18],
  [25.19, 6.18],
  [18.18, 16.88],
  [18.18, 25.33],
  [13.82, 25.33],
  [13.82, 16.88],
] as const;

export type BrandMarkVertex = readonly [number, number];

export function verticesToSvgPath(verts: readonly BrandMarkVertex[]): string {
  return `${verts.map((vertex, index) => `${index === 0 ? "M" : "L"}${vertex[0]} ${vertex[1]}`).join(" ")} Z`;
}

export const BRAND_MARK_LETTER_PATH = verticesToSvgPath(BRAND_MARK_LETTER_VERTICES);

export const BRAND_MARK_PATHS = {
  letterY: BRAND_MARK_LETTER_PATH,
} as const;

function gradientStopsMarkup(
  stops: readonly { offset: number; color: string; opacity?: number }[],
): string {
  return stops
    .map((stop) => {
      const offset = `${Math.round(stop.offset * 100)}%`;
      const opacity =
        stop.opacity === undefined ? "" : ` stop-opacity="${stop.opacity}"`;
      return `    <stop offset="${offset}" stop-color="${stop.color}"${opacity}/>`;
    })
    .join("\n");
}

export function buildBrandMarkSvg(): string {
  const { id, x1, y1, x2, y2, stops } = BRAND_MARK_GRADIENT;
  const sheen = BRAND_MARK_SHEEN;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}" role="img" aria-label="${YETKIN_BRAND}">
  <title>${YETKIN_BRAND}</title>
  <defs>
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="userSpaceOnUse">
${gradientStopsMarkup(stops)}
    </linearGradient>
    <linearGradient id="${sheen.id}" x1="${sheen.x1}" y1="${sheen.y1}" x2="${sheen.x2}" y2="${sheen.y2}" gradientUnits="userSpaceOnUse">
${gradientStopsMarkup(sheen.stops)}
    </linearGradient>
  </defs>
  <rect width="${BRAND_MARK_VIEWBOX}" height="${BRAND_MARK_VIEWBOX}" rx="${BRAND_MARK_PLATE_RADIUS}" fill="url(#${id})"/>
  <rect width="${BRAND_MARK_VIEWBOX}" height="${BRAND_MARK_VIEWBOX}" rx="${BRAND_MARK_PLATE_RADIUS}" fill="url(#${sheen.id})"/>
  <path fill="${BRAND_MARK_COLORS.letter}" d="${BRAND_MARK_LETTER_PATH}"/>
</svg>
`;
}
