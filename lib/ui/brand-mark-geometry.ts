/**
 * Yetkin Rail marka geometrisi — favicon, apple-icon ve kabuk RailMark SSOT.
 * Haç/artı yok: iki ivmeli ray (Y-makas) + altın sinyal.
 */

export const BRAND_MARK_VIEWBOX = 32;

export const BRAND_MARK_COLORS = {
  ink: "#0b1220",
  ivory: "#f4f1ea",
  goldOnInk: "#c4a35a",
  goldOnIvory: "#9a7b2f",
} as const;

export const BRAND_MARK_PATHS = {
  leftRail: "M10.4 24.5 L12.9 8.4",
  rightRail: "M16.8 24.5 L23.2 8.6",
  sleeperLow: "M11.6 21.2 L16.4 20.2",
  sleeperMid: "M12.1 17.6 L17.6 16.4",
} as const;

export const BRAND_MARK_SIGNAL = { cx: 23.2, cy: 8.6, r: 1.45 } as const;

export const BRAND_MARK_RAIL_STROKE = 2.7;
export const BRAND_MARK_SLEEPER_STROKE = 1.15;
export const BRAND_MARK_PLATE_RADIUS = 8;

export const BRAND_MARK_RAIL_ENDPOINTS = {
  left: { x1: 10.4, y1: 24.5, x2: 12.9, y2: 8.4 },
  right: { x1: 16.8, y1: 24.5, x2: 23.2, y2: 8.6 },
} as const;

export function buildBrandMarkSvg(): string {
  const { leftRail, rightRail } = BRAND_MARK_PATHS;
  const { cx, cy, r } = BRAND_MARK_SIGNAL;
  const { ink, ivory, goldOnInk, goldOnIvory } = BRAND_MARK_COLORS;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BRAND_MARK_VIEWBOX} ${BRAND_MARK_VIEWBOX}" role="img" aria-label="Yetkin Rail">
  <title>Yetkin Rail</title>
  <style>
    .plate { fill: ${ink}; }
    .rail { fill: none; stroke: ${ivory}; stroke-width: ${BRAND_MARK_RAIL_STROKE}; stroke-linecap: round; stroke-linejoin: round; }
    .signal { fill: ${goldOnInk}; }
    @media (prefers-color-scheme: light) {
      .plate { fill: ${ivory}; }
      .rail { stroke: ${ink}; }
      .signal { fill: ${goldOnIvory}; }
    }
  </style>
  <rect class="plate" width="${BRAND_MARK_VIEWBOX}" height="${BRAND_MARK_VIEWBOX}" rx="${BRAND_MARK_PLATE_RADIUS}"/>
  <path class="rail" d="${leftRail}"/>
  <path class="rail" d="${rightRail}"/>
  <circle class="signal" cx="${cx}" cy="${cy}" r="${r}"/>
</svg>
`;
}
