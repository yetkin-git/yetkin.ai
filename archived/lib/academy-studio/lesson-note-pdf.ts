/**
 * Mühürlü ders notu PDF — Noto Sans Unicode gömme (Türkçe İ/ğ/ş/ç/ö/ü sıfır kayıp).
 * Görsel etiket / şema gömülmez.
 */

import type { AcademyLessonNote } from "@/archived/lib/academy-studio/lesson-note";
import { academyProofHashPreview } from "@/lib/academy/lesson-note-paths";
import {
  encodePdfUnicodeLine,
  loadAcademyPdfUnicodeFont,
  pdfScaleWidth,
  type PdfEmbeddedFont,
} from "@/archived/lib/academy-studio/pdf-unicode-font";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;
const FONT_SIZE = 11;
const TITLE_SIZE = 16;
const LEADING = 15;

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/u).filter((word) => word.length > 0);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = words[0]!;
    for (const word of words.slice(1)) {
      if (`${line} ${word}`.length <= maxChars) {
        line = `${line} ${word}`;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

function pdfEscapeName(name: string): string {
  return `/${name.replace(/[^A-Za-z0-9_-]/g, "")}`;
}

function buildToUnicodeCmap(pairs: Array<{ gid: number; cp: number }>): string {
  const unique = new Map<number, number>();
  for (const pair of pairs) {
    if (pair.gid > 0) {
      unique.set(pair.gid, pair.cp);
    }
  }
  const entries = [...unique.entries()].sort((a, b) => a[0] - b[0]);
  const lines = [
    "/CIDInit /ProcSet findresource begin",
    "12 dict begin",
    "begincmap",
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def",
    "/CMapName /Adobe-Identity-UCS def",
    "/CMapType 2 def",
    "1 begincodespacerange",
    "<0000> <FFFF>",
    "endcodespacerange",
  ];
  const chunkSize = 100;
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    lines.push(`${chunk.length} beginbfchar`);
    for (const [gid, cp] of chunk) {
      const src = gid.toString(16).padStart(4, "0").toUpperCase();
      const dst = cp.toString(16).padStart(cp > 0xffff ? 6 : 4, "0").toUpperCase();
      lines.push(`<${src}> <${dst}>`);
    }
    lines.push("endbfchar");
  }
  lines.push("endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end");
  return lines.join("\n");
}

function buildWidthArray(font: PdfEmbeddedFont, usedGids: Iterable<number>): string {
  const widths = [...new Set(usedGids)].filter((gid) => gid > 0).sort((a, b) => a - b);
  if (widths.length === 0) {
    return "[ ]";
  }
  const parts: string[] = [];
  let i = 0;
  while (i < widths.length) {
    const start = widths[i]!;
    const run: number[] = [pdfScaleWidth(font, start)];
    let j = i + 1;
    while (j < widths.length && widths[j] === widths[j - 1]! + 1) {
      run.push(pdfScaleWidth(font, widths[j]!));
      j += 1;
    }
    parts.push(`${start} [${run.join(" ")}]`);
    i = j;
  }
  return `[ ${parts.join(" ")} ]`;
}

function encodeLine(font: PdfEmbeddedFont, line: string, size: number): string {
  const { hex } = encodePdfUnicodeLine(font, line);
  if (!hex) {
    return "";
  }
  return `/F1 ${size} Tf <${hex}> Tj`;
}

export function renderAcademyLessonNotesPdf(
  notes: readonly AcademyLessonNote[],
  extra?: { curriculumProofHash?: string | null },
): Uint8Array {
  if (notes.length === 0) {
    throw new Error("Ders notu yok.");
  }
  const font = loadAcademyPdfUnicodeFont();
  const maxChars = 86;
  type Line = { text: string; size: number; gap: number };
  const lines: Line[] = [];
  const push = (text: string, size = FONT_SIZE, gap = LEADING) => {
    for (const row of wrapText(text, maxChars)) {
      lines.push({ text: row, size, gap: row.length === 0 ? gap * 0.6 : gap });
    }
  };

  for (const [index, note] of notes.entries()) {
    if (index > 0) {
      lines.push({ text: "", size: FONT_SIZE, gap: LEADING * 1.4 });
    }
    push(note.courseTitle, TITLE_SIZE, 22);
    push(`Eğitmen ${note.instructorName}${note.level ? ` · ${note.level}` : ""}`, 12, 18);
    push(note.lessonTitle, 13, 20);
    for (const section of note.sections) {
      push(section.heading, 12, 18);
      push(section.prose, FONT_SIZE, LEADING);
    }
    push("Uygulanan pratik görev", 12, 18);
    push(`Tür: ${note.practice.kind}`, FONT_SIZE, LEADING);
    push(note.practice.brief, FONT_SIZE, LEADING);
    for (const row of note.practice.params) {
      push(`${row.label}: ${row.value}`, FONT_SIZE, LEADING);
    }
    push(note.practice.example, FONT_SIZE, LEADING);
    if (note.curriculumSeal) {
      push(`Müfredat mührü SHA-256: ${note.curriculumSeal}`, 9, 12);
    }
    push(`İş kanıtı SHA-256: ${note.proofOfWorkHash}`, 9, 12);
    push(`Özet: ${academyProofHashPreview(note.proofOfWorkHash)}`, 9, 12);
  }

  if (extra?.curriculumProofHash) {
    push(`Müfredat iş kanıtı SHA-256: ${extra.curriculumProofHash}`, 9, 12);
  }

  const usedPairs: Array<{ gid: number; cp: number }> = [];
  for (const line of lines) {
    usedPairs.push(...encodePdfUnicodeLine(font, line.text).pairs);
  }
  const usedGids = usedPairs.map((pair) => pair.gid);

  const pages: string[] = [];
  let y = PAGE_H - MARGIN;
  let content: string[] = [];
  const flush = () => {
    content.push("ET");
    pages.push(content.join("\n"));
  };
  content.push("BT");
  content.push("0 g");
  content.push(`${MARGIN} ${y} Td`);
  let firstOnPage = true;

  for (const line of lines) {
    if (y - line.gap < MARGIN) {
      flush();
      y = PAGE_H - MARGIN;
      content = ["BT", "0 g", `${MARGIN} ${y} Td`];
      firstOnPage = true;
    }
    if (!firstOnPage) {
      content.push(`0 ${-line.gap} Td`);
    }
    y -= line.gap;
    firstOnPage = false;
    const encoded = encodeLine(font, line.text, line.size);
    if (encoded) {
      content.push(encoded);
    }
  }
  flush();

  const toUnicode = buildToUnicodeCmap(usedPairs);
  const widthArray = buildWidthArray(font, usedGids);
  const fontFile = font.fontFile;
  const [xMin, yMin, xMax, yMax] = font.bbox;
  const fontName = pdfEscapeName(font.baseFont);

  // Object IDs: 1 Catalog, 2 Pages, 3 FontFile2, 4 FontDescriptor, 5 CIDFont, 6 ToUnicode, 7 Type0, then page pairs
  const fontFileId = 3;
  const fontDescId = 4;
  const cidFontId = 5;
  const toUnicodeId = 6;
  const type0Id = 7;
  let nextId = 8;
  const pageIds: number[] = [];
  const contentObjectIds: number[] = [];
  const pageObjectIds: number[] = [];
  for (let i = 0; i < pages.length; i += 1) {
    contentObjectIds.push(nextId);
    nextId += 1;
    pageObjectIds.push(nextId);
    nextId += 1;
  }

  const built: string[] = new Array(nextId - 1).fill("");
  built[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  built[fontFileId - 1] =
    `<< /Length ${fontFile.length} /Length1 ${fontFile.length} >>\nstream\n`;
  // binary stream appended later
  built[fontDescId - 1] =
    `<< /Type /FontDescriptor /FontName ${fontName} /Flags 32 /FontBBox [${xMin} ${yMin} ${xMax} ${yMax}] /ItalicAngle 0 /Ascent ${font.ascent} /Descent ${font.descent} /CapHeight ${font.ascent} /StemV 80 /FontFile2 ${fontFileId} 0 R >>`;
  built[cidFontId - 1] =
    `<< /Type /Font /Subtype /CIDFontType2 /BaseFont ${fontName} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fontDescId} 0 R /DW 1000 /W ${widthArray} /CIDToGIDMap /Identity >>`;
  built[toUnicodeId - 1] =
    `<< /Length ${Buffer.byteLength(toUnicode, "utf8")} >>\nstream\n${toUnicode}\nendstream`;
  built[type0Id - 1] =
    `<< /Type /Font /Subtype /Type0 /BaseFont ${fontName} /Encoding /Identity-H /DescendantFonts [${cidFontId} 0 R] /ToUnicode ${toUnicodeId} 0 R >>`;

  for (let i = 0; i < pages.length; i += 1) {
    const stream = pages[i]!;
    const contentId = contentObjectIds[i]!;
    const pageId = pageObjectIds[i]!;
    pageIds.push(pageId);
    built[contentId - 1] =
      `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`;
    built[pageId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${type0Id} 0 R >> >> /Contents ${contentId} 0 R >>`;
  }
  built[1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n", "latin1")];
  const offsets = [0];
  let cursor = chunks[0]!.length;

  for (let i = 0; i < built.length; i += 1) {
    const id = i + 1;
    offsets.push(cursor);
    if (id === fontFileId) {
      const head = Buffer.from(`3 0 obj\n<< /Length ${fontFile.length} /Length1 ${fontFile.length} >>\nstream\n`, "latin1");
      const tail = Buffer.from("\nendstream\nendobj\n", "latin1");
      chunks.push(head, fontFile, tail);
      cursor += head.length + fontFile.length + tail.length;
      continue;
    }
    const body = Buffer.from(`${id} 0 obj\n${built[i]}\nendobj\n`, "latin1");
    chunks.push(body);
    cursor += body.length;
  }

  const xrefPos = cursor;
  let xref = `xref\n0 ${built.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= built.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${built.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, "latin1"), Buffer.from(trailer, "latin1"));
  return Buffer.concat(chunks);
}

/** Test / mühür: Türkçe örnek dizginin glif kaybı olmadan kodlandığını doğrular. */
export function academyPdfEncodesTurkishSample(): boolean {
  const font = loadAcademyPdfUnicodeFont();
  const sample = "İçerik Eğitmen şğüöçıİŞĞÜÖÇ";
  const { pairs } = encodePdfUnicodeLine(font, sample);
  if (pairs.length !== [...sample].length) {
    return false;
  }
  return pairs.every((pair) => pair.gid > 0);
}
