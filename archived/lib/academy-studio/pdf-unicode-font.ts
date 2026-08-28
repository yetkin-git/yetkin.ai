/**
 * Noto Sans WOFF → SFNT + Identity-H CIDFont gömme.
 * Helvetica/WinAnsi Türkçe glif kaybını (İ/ğ/ş/…) sıfırlar.
 */

import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type PdfEmbeddedFont = {
  baseFont: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  bbox: [number, number, number, number];
  fontFile: Buffer;
  glyphId: (codePoint: number) => number;
  advance: (glyphId: number) => number;
};

type TableDir = {
  tag: string;
  offset: number;
  compLength: number;
  origLength: number;
};

function readU16(buf: Buffer, offset: number): number {
  return buf.readUInt16BE(offset);
}

function readI16(buf: Buffer, offset: number): number {
  return buf.readInt16BE(offset);
}

function readU32(buf: Buffer, offset: number): number {
  return buf.readUInt32BE(offset);
}

function tagAt(buf: Buffer, offset: number): string {
  return buf.toString("ascii", offset, offset + 4);
}

/** WOFF (zlib tabloları) → TrueType SFNT. */
export function woffToSfnt(woff: Buffer): Buffer {
  if (tagAt(woff, 0) !== "wOFF") {
    throw new Error("WOFF imza yok.");
  }
  const flavor = readU32(woff, 4);
  const numTables = readU16(woff, 12);
  const tables: TableDir[] = [];
  let cursor = 44;
  for (let i = 0; i < numTables; i += 1) {
    tables.push({
      tag: tagAt(woff, cursor),
      offset: readU32(woff, cursor + 4),
      compLength: readU32(woff, cursor + 8),
      origLength: readU32(woff, cursor + 12),
    });
    cursor += 20;
  }

  const decoded = tables.map((table) => {
    const slice = woff.subarray(table.offset, table.offset + table.compLength);
    const data =
      table.compLength < table.origLength ? inflateSync(slice) : Buffer.from(slice);
    if (data.length !== table.origLength) {
      throw new Error(`WOFF tablo boyutu bozuk: ${table.tag}`);
    }
    return { tag: table.tag, data };
  });

  decoded.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));

  const headerSize = 12 + decoded.length * 16;
  let offset = headerSize;
  const entries: { tag: string; offset: number; length: number; data: Buffer }[] = [];
  for (const table of decoded) {
    const aligned = (offset + 3) & ~3;
    offset = aligned;
    entries.push({ tag: table.tag, offset, length: table.data.length, data: table.data });
    offset += table.data.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(decoded.length, 4);
  let entrySelector = 0;
  let searchRange = 16;
  while (searchRange * 2 <= decoded.length * 16) {
    searchRange *= 2;
    entrySelector += 1;
  }
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(decoded.length * 16 - searchRange, 10);

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i]!;
    const pos = 12 + i * 16;
    out.write(entry.tag, pos, 4, "ascii");
    let checksum = 0;
    const padded = Buffer.alloc((entry.data.length + 3) & ~3);
    entry.data.copy(padded);
    for (let j = 0; j < padded.length; j += 4) {
      checksum = (checksum + padded.readUInt32BE(j)) >>> 0;
    }
    out.writeUInt32BE(checksum, pos + 4);
    out.writeUInt32BE(entry.offset, pos + 8);
    out.writeUInt32BE(entry.length, pos + 12);
    entry.data.copy(out, entry.offset);
  }
  return out;
}

function findTable(sfnt: Buffer, tag: string): Buffer {
  const numTables = readU16(sfnt, 4);
  for (let i = 0; i < numTables; i += 1) {
    const pos = 12 + i * 16;
    if (tagAt(sfnt, pos) === tag) {
      const offset = readU32(sfnt, pos + 8);
      const length = readU32(sfnt, pos + 12);
      return sfnt.subarray(offset, offset + length);
    }
  }
  throw new Error(`SFNT tablo yok: ${tag}`);
}

function parseCmap(cmap: Buffer): Map<number, number> {
  const numTables = readU16(cmap, 2);
  let best: Buffer | null = null;
  let bestScore = -1;
  for (let i = 0; i < numTables; i += 1) {
    const platform = readU16(cmap, 4 + i * 8);
    const encoding = readU16(cmap, 4 + i * 8 + 2);
    const offset = readU32(cmap, 4 + i * 8 + 4);
    const format = readU16(cmap, offset);
    let score = 0;
    if (platform === 3 && encoding === 10 && format === 12) score = 100;
    else if (platform === 0 && format === 12) score = 90;
    else if (platform === 3 && encoding === 1 && format === 4) score = 80;
    else if (platform === 0 && format === 4) score = 70;
    if (score > bestScore) {
      bestScore = score;
      best = cmap.subarray(offset);
    }
  }
  if (!best) {
    throw new Error("cmap alt tablosu yok.");
  }
  const map = new Map<number, number>();
  const format = readU16(best, 0);
  if (format === 4) {
    const segCount = readU16(best, 6) / 2;
    const endCountOffset = 14;
    const startCountOffset = endCountOffset + segCount * 2 + 2;
    const idDeltaOffset = startCountOffset + segCount * 2;
    const idRangeOffsetOffset = idDeltaOffset + segCount * 2;
    for (let i = 0; i < segCount; i += 1) {
      const end = readU16(best, endCountOffset + i * 2);
      const start = readU16(best, startCountOffset + i * 2);
      const idDelta = readI16(best, idDeltaOffset + i * 2);
      const idRangeOffset = readU16(best, idRangeOffsetOffset + i * 2);
      for (let cp = start; cp <= end; cp += 1) {
        let gid = 0;
        if (idRangeOffset === 0) {
          gid = (cp + idDelta) & 0xffff;
        } else {
          const index =
            idRangeOffsetOffset +
            i * 2 +
            idRangeOffset +
            (cp - start) * 2;
          const glyph = readU16(best, index);
          gid = glyph === 0 ? 0 : (glyph + idDelta) & 0xffff;
        }
        if (gid) {
          map.set(cp, gid);
        }
      }
    }
    return map;
  }
  if (format === 12) {
    const nGroups = readU32(best, 12);
    for (let i = 0; i < nGroups; i += 1) {
      const base = 16 + i * 12;
      const start = readU32(best, base);
      const end = readU32(best, base + 4);
      const startGlyph = readU32(best, base + 8);
      for (let cp = start; cp <= end; cp += 1) {
        map.set(cp, startGlyph + (cp - start));
      }
    }
    return map;
  }
  throw new Error(`cmap format desteklenmiyor: ${format}`);
}

function parseHmtx(hmtx: Buffer, numGlyphs: number, numberOfHMetrics: number): number[] {
  const advances: number[] = new Array(numGlyphs).fill(0);
  let last = 0;
  for (let i = 0; i < numberOfHMetrics; i += 1) {
    last = readU16(hmtx, i * 4);
    advances[i] = last;
  }
  for (let i = numberOfHMetrics; i < numGlyphs; i += 1) {
    advances[i] = last;
  }
  return advances;
}

export function loadPdfEmbeddedFontFromSfnt(sfnt: Buffer, baseFont = "NotoSans"): PdfEmbeddedFont {
  const head = findTable(sfnt, "head");
  const hhea = findTable(sfnt, "hhea");
  const maxp = findTable(sfnt, "maxp");
  const hmtx = findTable(sfnt, "hmtx");
  const cmap = findTable(sfnt, "cmap");
  const unitsPerEm = readU16(head, 18);
  const xMin = readI16(head, 36);
  const yMin = readI16(head, 38);
  const xMax = readI16(head, 40);
  const yMax = readI16(head, 42);
  const ascent = readI16(hhea, 4);
  const descent = readI16(hhea, 6);
  const numberOfHMetrics = readU16(hhea, 34);
  const numGlyphs = readU16(maxp, 4);
  const cmapMap = parseCmap(cmap);
  const advances = parseHmtx(hmtx, numGlyphs, numberOfHMetrics);
  return {
    baseFont,
    unitsPerEm,
    ascent,
    descent,
    bbox: [xMin, yMin, xMax, yMax],
    fontFile: sfnt,
    glyphId: (codePoint) => cmapMap.get(codePoint) ?? 0,
    advance: (glyphId) => advances[glyphId] ?? 0,
  };
}

let cached: PdfEmbeddedFont | null = null;

export function loadAcademyPdfUnicodeFont(): PdfEmbeddedFont {
  if (cached) {
    return cached;
  }
  const woffPath = join(
    process.cwd(),
    "node_modules",
    "@digabi",
    "noto-sans",
    "WOFF",
    "NotoSans-Regular.woff",
  );
  const sfnt = woffToSfnt(readFileSync(woffPath));
  cached = loadPdfEmbeddedFontFromSfnt(sfnt, "NotoSans");
  return cached;
}

export function pdfScaleWidth(font: PdfEmbeddedFont, glyphId: number): number {
  return Math.round((font.advance(glyphId) * 1000) / font.unitsPerEm);
}

/** Identity-H hex gösterim dizesi + ToUnicode satırları için glif listesi. */
export function encodePdfUnicodeLine(
  font: PdfEmbeddedFont,
  text: string,
): { hex: string; pairs: Array<{ gid: number; cp: number }> } {
  const pairs: Array<{ gid: number; cp: number }> = [];
  let hex = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp === 10) {
      continue;
    }
    let gid = font.glyphId(cp);
    if (!gid && cp !== 32) {
      gid = font.glyphId(0x3f) || 0;
    }
    pairs.push({ gid, cp });
    hex += gid.toString(16).padStart(4, "0");
  }
  return { hex, pairs };
}
