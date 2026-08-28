#!/usr/bin/env tsx
/**
 * yetkin.ai Y markasını public/favicon.ico, public/icon.svg, app/icon.svg ve app/apple-icon.png olarak basar.
 * Canlı ağ yok. Geometri SSOT: lib/ui/brand-mark-geometry.ts
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  BRAND_MARK_COLORS,
  BRAND_MARK_GRADIENT,
  BRAND_MARK_LETTER_VERTICES,
  BRAND_MARK_PLATE_RADIUS,
  BRAND_MARK_SHEEN,
  BRAND_MARK_VIEWBOX,
  buildBrandMarkSvg,
  type BrandMarkVertex,
} from "../lib/ui/brand-mark-geometry";

const ROOT = process.cwd();

type RGBA = [number, number, number, number];

const VIOLET = hexToRgba(BRAND_MARK_COLORS.violet);
const VIOLET_MID = hexToRgba(BRAND_MARK_COLORS.violetMid);
const SAFIR = hexToRgba(BRAND_MARK_COLORS.safir);
const LETTER = hexToRgba(BRAND_MARK_COLORS.letter);

function hexToRgba(hex: string): RGBA {
  const n = hex.replace("#", "");
  return [
    Number.parseInt(n.slice(0, 2), 16),
    Number.parseInt(n.slice(2, 4), 16),
    Number.parseInt(n.slice(4, 6), 16),
    255,
  ];
}

function sdRoundedBox(px: number, py: number, hx: number, hy: number, radius: number): number {
  const ax = Math.abs(px) - hx + radius;
  const ay = Math.abs(py) - hy + radius;
  const ox = Math.max(ax, 0);
  const oy = Math.max(ay, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(ax, ay), 0) - radius;
}

function sdPolygon(px: number, py: number, verts: readonly BrandMarkVertex[]): number {
  const first = verts[0];
  if (!first) {
    return Number.POSITIVE_INFINITY;
  }
  let d = (px - first[0]) ** 2 + (py - first[1]) ** 2;
  let sign = 1;
  const count = verts.length;
  for (let i = 0, j = count - 1; i < count; j = i, i += 1) {
    const current = verts[i];
    const previous = verts[j];
    if (!current || !previous) {
      continue;
    }
    const [vix, viy] = current;
    const [vjx, vjy] = previous;
    const ex = vjx - vix;
    const ey = vjy - viy;
    const wx = px - vix;
    const wy = py - viy;
    const denom = ex * ex + ey * ey;
    const t = denom === 0 ? 0 : Math.max(0, Math.min(1, (wx * ex + wy * ey) / denom));
    const bx = wx - ex * t;
    const by = wy - ey * t;
    d = Math.min(d, bx * bx + by * by);
    const c0 = py >= viy;
    const c1 = py < vjy;
    const c2 = ex * wy > ey * wx;
    if ((c0 && c1 && c2) || (!c0 && !c1 && !c2)) {
      sign *= -1;
    }
  }
  return sign * Math.sqrt(d);
}

function mix(a: RGBA, b: RGBA, t: number): RGBA {
  const k = Math.max(0, Math.min(1, t));
  return [
    a[0] + (b[0] - a[0]) * k,
    a[1] + (b[1] - a[1]) * k,
    a[2] + (b[2] - a[2]) * k,
    a[3] + (b[3] - a[3]) * k,
  ];
}

function coverFromSd(sd: number, pixel: number): number {
  return Math.max(0, Math.min(1, 0.5 - sd / pixel));
}

function projectT(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const denom = dx * dx + dy * dy;
  return denom === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / denom));
}

function gradientAt(px: number, py: number): RGBA {
  const { x1, y1, x2, y2 } = BRAND_MARK_GRADIENT;
  const t = projectT(px, py, x1, y1, x2, y2);
  if (t < 0.52) {
    return mix(VIOLET, VIOLET_MID, t / 0.52);
  }
  return mix(VIOLET_MID, SAFIR, (t - 0.52) / 0.48);
}

function sheenOpacityAt(px: number, py: number): number {
  const { x1, y1, x2, y2, stops } = BRAND_MARK_SHEEN;
  const t = projectT(px, py, x1, y1, x2, y2);
  const start = stops[0]?.opacity ?? 0;
  const end = stops[1]?.opacity ?? 0;
  return start + (end - start) * t;
}

function renderMark(size: number): Buffer {
  const samples = size <= 32 ? 5 : 3;
  const pixel = BRAND_MARK_VIEWBOX / size;
  const rgba = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let acc: RGBA = [0, 0, 0, 0];
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = ((x + (sx + 0.5) / samples) / size) * BRAND_MARK_VIEWBOX;
          const py = ((y + (sy + 0.5) / samples) / size) * BRAND_MARK_VIEWBOX;
          const cx = px - BRAND_MARK_VIEWBOX / 2;
          const cy = py - BRAND_MARK_VIEWBOX / 2;
          const plate = coverFromSd(
            sdRoundedBox(cx, cy, BRAND_MARK_VIEWBOX / 2, BRAND_MARK_VIEWBOX / 2, BRAND_MARK_PLATE_RADIUS),
            pixel,
          );
          const letter = coverFromSd(sdPolygon(px, py, BRAND_MARK_LETTER_VERTICES), pixel);
          let color: RGBA = [0, 0, 0, 0];
          color = mix(color, gradientAt(px, py), plate);
          color = mix(color, LETTER, plate * sheenOpacityAt(px, py));
          color = mix(color, LETTER, plate * letter);
          acc = [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2], acc[3] + color[3]];
        }
      }
      const n = samples * samples;
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(acc[0] / n);
      rgba[i + 1] = Math.round(acc[1] / n);
      rgba[i + 2] = Math.round(acc[2] / n);
      rgba[i + 3] = Math.round(acc[3] / n);
    }
  }
  return rgba;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf.readUInt8(i);
    for (let b = 0; b < 8; b += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const payload = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload));
  return Buffer.concat([len, payload, crc]);
}

function encodePng(width: number, height: number, rgba: Buffer): Buffer {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function encodeIco(images: Array<{ width: number; height: number; png: Buffer }>): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries: Buffer[] = [];
  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry[0] = image.width >= 256 ? 0 : image.width;
    entry[1] = image.height >= 256 ? 0 : image.height;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.png.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)]);
}

function writeOut(relative: string, contents: Buffer | string): void {
  const full = join(ROOT, relative);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

const png16 = encodePng(16, 16, renderMark(16));
const png32 = encodePng(32, 32, renderMark(32));
const png180 = encodePng(180, 180, renderMark(180));
const svg = buildBrandMarkSvg();

writeOut("app/icon.svg", svg);
writeOut("public/icon.svg", svg);
writeOut(
  "public/favicon.ico",
  encodeIco([
    { width: 16, height: 16, png: png16 },
    { width: 32, height: 32, png: png32 },
  ]),
);
writeOut("app/apple-icon.png", png180);

process.stdout.write(`generate-brand-icons OK — svg ${svg.length}B, ico 16+32, apple 180\n`);
