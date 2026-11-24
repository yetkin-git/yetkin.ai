import { TEZGAH_DELIVERY_SIGNATURE } from "@/lib/tezgah/delivery-signature";
import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const ch = line[index] ?? "";
    if (inQuotes) {
      if (ch === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

/** Arşivdeki CSV'den tabloyu yeniden kurar (BOM + imza satırı toleranslı). */
export function parsePazaryeriCsvTable(csv: string): { columns: string[]; rows: string[][] } | null {
  const text = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  if (!text) {
    return null;
  }
  const lines = text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !line.startsWith(`# ${TEZGAH_DELIVERY_SIGNATURE}`) && !line.startsWith("# "));
  if (lines.length < 2) {
    return null;
  }
  const columns = splitCsvLine(lines[0] ?? "").map((cell) => cell.replace(/^'/, ""));
  if (columns.length < 4) {
    return null;
  }
  const rows = lines.slice(1).map((line) => splitCsvLine(line).map((cell) => cell.replace(/^'/, "")));
  if (rows.some((row) => row.length !== columns.length)) {
    return null;
  }
  return { columns, rows };
}

export function pazaryeriTableToBlocks(input: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  title?: string;
}): DocumentBlock[] {
  const blocks: DocumentBlock[] = [
    { kind: "h1", text: input.title?.trim() || "Pazaryeri Kataloğu" },
    {
      kind: "p",
      text: "Başlık tavanı kodda kesilir. Barkod boş kalır. Fiyat ve stok yalnız senin girdiğin değerlerdir.",
    },
  ];
  if (input.columns.length === 0 || input.rows.length === 0) {
    blocks.push({ kind: "p", text: "Katalog satırı yok." });
    return blocks;
  }
  blocks.push({
    kind: "table",
    headers: input.columns,
    rows: input.rows.map((row) => input.columns.map((_, index) => row[index] ?? "")),
  });
  return blocks;
}

export function buildPazaryeriDocx(input: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  title?: string;
}): Uint8Array {
  return buildDocxDocument(pazaryeriTableToBlocks(input));
}

export function buildPazaryeriPdf(input: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  title?: string;
}): Uint8Array {
  return buildPlainPdf(pazaryeriTableToBlocks(input));
}

export function buildPazaryeriDocxFromCsv(csv: string, title?: string): Uint8Array {
  const table = parsePazaryeriCsvTable(csv);
  if (!table) {
    return buildDocxDocument([{ kind: "p", text: "Pazaryeri kataloğu okunamadı." }]);
  }
  return buildPazaryeriDocx({ ...table, title });
}

export function buildPazaryeriPdfFromCsv(csv: string, title?: string): Uint8Array {
  const table = parsePazaryeriCsvTable(csv);
  if (!table) {
    return buildPlainPdf([{ kind: "p", text: "Pazaryeri kataloğu okunamadı." }]);
  }
  return buildPazaryeriPdf({ ...table, title });
}
