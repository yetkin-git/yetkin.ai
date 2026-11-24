import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";

/** 5x7 glif. Satır değeri 5 bitin düşük uçudur. */
const G: Record<string, readonly number[]> = {
  " ": [0, 0, 0, 0, 0, 0, 0],
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  Ç: [14, 17, 16, 16, 17, 14, 4],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 14],
  Ğ: [10, 14, 17, 16, 23, 17, 14],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  İ: [4, 0, 14, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  Ö: [10, 0, 14, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [14, 17, 16, 14, 1, 17, 14],
  Ş: [10, 14, 17, 16, 14, 1, 14],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  Ü: [10, 0, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  "0": [14, 17, 19, 21, 25, 17, 14],
  "1": [4, 12, 4, 4, 4, 4, 14],
  "2": [14, 17, 1, 6, 8, 16, 31],
  "3": [14, 17, 1, 6, 1, 17, 14],
  "4": [2, 6, 10, 18, 31, 2, 2],
  "5": [31, 16, 30, 1, 1, 17, 14],
  "6": [6, 8, 16, 30, 17, 17, 14],
  "7": [31, 1, 2, 4, 8, 8, 8],
  "8": [14, 17, 17, 14, 17, 17, 14],
  "9": [14, 17, 17, 15, 1, 2, 12],
  ".": [0, 0, 0, 0, 0, 6, 6],
  ",": [0, 0, 0, 0, 6, 4, 8],
  ":": [0, 6, 6, 0, 6, 6, 0],
  ";": [0, 6, 6, 0, 6, 4, 8],
  "-": [0, 0, 0, 31, 0, 0, 0],
  "/": [1, 2, 4, 4, 4, 8, 16],
  "(": [2, 4, 8, 8, 8, 4, 2],
  ")": [8, 4, 2, 2, 2, 4, 8],
  "%": [19, 19, 2, 4, 8, 25, 25],
  "?": [14, 17, 1, 2, 4, 0, 4],
  "!": [4, 4, 4, 4, 4, 0, 4],
  "'": [6, 6, 4, 0, 0, 0, 0],
  "+": [0, 4, 4, 31, 4, 4, 0],
  "₺": [14, 4, 31, 4, 31, 4, 4],
};

const BOX: readonly number[] = [31, 17, 17, 17, 17, 17, 31];

function glyph(ch: string): readonly number[] {
  if (ch === " ") {
    return G[" "] ?? BOX;
  }
  const key = /[a-zçğıöşüı]/i.test(ch) ? ch.toLocaleUpperCase("tr") : ch;
  return G[key] ?? G[ch] ?? BOX;
}

type Page = string[];

function wrap(text: string, width: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return [""];
  }
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const piece = word.length > width ? word.slice(0, width) : word;
    const next = current.length === 0 ? piece : `${current} ${piece}`;
    if (next.length <= width) {
      current = next;
      continue;
    }
    if (current.length > 0) {
      lines.push(current);
    }
    current = piece;
  }
  if (current.length > 0) {
    lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

/** İndirilebilir PDF. Türkçe glifler sayfaya çizilir. */
export function buildPlainPdf(blocks: readonly DocumentBlock[]): Uint8Array {
  const pages: Page[] = [[]];
  let y = 800;
  const margin = 48;
  const bottom = 48;

  function ensure(height: number): void {
    if (y - height >= bottom) {
      return;
    }
    pages.push(["0 0 0 rg", "0.15 w"]);
    y = 800;
  }

  function paintText(text: string, scale: number, width: number): void {
    const pixel = 1.15 * scale;
    const advance = 6 * pixel;
    const lineHeight = 10 * pixel;
    for (const line of wrap(text, width)) {
      ensure(lineHeight + 2);
      const baseline = y - 7 * pixel;
      let x = margin;
      for (const ch of line) {
        const rows = glyph(ch);
        rows.forEach((bits, row) => {
          for (let col = 0; col < 5; col += 1) {
            if ((bits & (1 << (4 - col))) === 0) {
              continue;
            }
            const rx = (x + col * pixel).toFixed(2);
            const ry = (baseline + (6 - row) * pixel).toFixed(2);
            pages[pages.length - 1]?.push(`${rx} ${ry} ${pixel.toFixed(2)} ${pixel.toFixed(2)} re f`);
          }
        });
        x += advance;
      }
      y -= lineHeight;
    }
    y -= 4;
  }

  function paintTable(headers: readonly string[], rows: readonly (readonly string[])[]): void {
    const cols = Math.max(headers.length, 1);
    const tableWidth = 500;
    const colWidth = tableWidth / cols;
    const rowHeight = 16;
    const all = [headers, ...rows];
    for (const row of all) {
      ensure(rowHeight + 2);
      const top = y;
      pages[pages.length - 1]?.push(`${margin} ${top - rowHeight} ${tableWidth} ${rowHeight} re S`);
      for (let index = 1; index < cols; index += 1) {
        const x = margin + index * colWidth;
        pages[pages.length - 1]?.push(`${x.toFixed(2)} ${top - rowHeight} m ${x.toFixed(2)} ${top} l S`);
      }
      const saved = y;
      y = top - 2;
      row.forEach((value, index) => {
        const text = (value || "—").slice(0, 28);
        const pixel = 1;
        let x = margin + index * colWidth + 2;
        const baseline = y - 10;
        for (const ch of text) {
          const bitsRows = glyph(ch);
          bitsRows.forEach((bits, glyphRow) => {
            for (let col = 0; col < 5; col += 1) {
              if ((bits & (1 << (4 - col))) === 0) {
                continue;
              }
              pages[pages.length - 1]?.push(
                `${(x + col * pixel).toFixed(2)} ${(baseline + (6 - glyphRow) * pixel).toFixed(2)} 1 1 re f`,
              );
            }
          });
          x += 6;
        }
      });
      y = saved - rowHeight - 2;
    }
    y -= 6;
  }

  pages[0]?.push("0 0 0 rg");
  pages[0]?.push("0.15 w");
  for (const block of blocks) {
    if (block.kind === "table") {
      paintTable(block.headers, block.rows);
      continue;
    }
    if (!block.text.trim()) {
      continue;
    }
    if (block.kind === "h1") {
      paintText(block.text, 1.7, 42);
    } else if (block.kind === "h2") {
      paintText(block.text, 1.25, 56);
    } else {
      paintText(block.text, 1, 78);
    }
  }
  if ((pages[0]?.length ?? 0) <= 2) {
    paintText("Hibe proje dosyası", 1.4, 42);
  }

  const pageIds = pages.map((_, index) => 4 + index * 2);
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  const catalog = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const pageTree = `2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>\nendobj\n`;
  const chunks: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  function add(source: string): void {
    offsets.push(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    chunks.push(source);
  }
  add(catalog);
  add(pageTree);
  for (let index = 0; index < pages.length; index += 1) {
    const payload = `${pages[index]?.join("\n") ?? ""}\n`;
    const contentId = 3 + index * 2;
    const pageId = contentId + 1;
    add(`${contentId} 0 obj\n<< /Length ${payload.length} >>\nstream\n${payload}endstream\nendobj\n`);
    add(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentId} 0 R >>\nendobj\n`,
    );
  }
  const startxref = chunks.join("").length;
  const size = offsets.length;
  const xref = [
    `xref\n0 ${size}\n`,
    "0000000000 65535 f \n",
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`,
  ];
  chunks.push(xref.join(""));
  return new TextEncoder().encode(chunks.join(""));
}
