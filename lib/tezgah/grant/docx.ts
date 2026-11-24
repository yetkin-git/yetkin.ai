import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { grantReportBlocks } from "@/lib/tezgah/grant/document";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";

const PAIR = /^(.{2,80}?):\s+(\S.*)$/;

/** Düz metni başlık ve ardışık "alan: değer" tablosuna çevirir. */
export function markdownToBlocks(markdown: string): DocumentBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: DocumentBlock[] = [];
  let headingUsed = false;
  let tableHeaders: string[] | null = null;
  let tableRows: string[][] = [];

  function flushTable(): void {
    if (!tableHeaders) {
      return;
    }
    blocks.push({ kind: "table", headers: ["Alan", "Değer"], rows: [[tableHeaders[0] ?? "", tableHeaders[1] ?? ""], ...tableRows] });
    tableHeaders = null;
    tableRows = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushTable();
      continue;
    }
    const pair = PAIR.exec(trimmed);
    if (pair?.[1] && pair[2] && !trimmed.startsWith("http")) {
      if (!tableHeaders) {
        tableHeaders = [pair[1], pair[2]];
      } else {
        tableRows.push([pair[1], pair[2]]);
      }
      continue;
    }
    flushTable();
    if (!headingUsed) {
      blocks.push({ kind: "h1", text: trimmed });
      headingUsed = true;
      continue;
    }
    if (trimmed.length <= 80 && !trimmed.includes("http")) {
      blocks.push({ kind: "h2", text: trimmed });
      continue;
    }
    blocks.push({ kind: "p", text: trimmed });
  }
  flushTable();
  return blocks;
}

/** Sıkıştırmasız DOCX. Düz metin başlık ve tabloya ayrılır. */
export function buildGrantDossierDocx(markdown: string): Uint8Array {
  return buildDocxDocument(markdownToBlocks(markdown));
}

export function buildGrantReportDocx(report: GrantProjectReport): Uint8Array {
  return buildDocxDocument(grantReportBlocks(report));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return Buffer.from(binary, "binary").toString("base64");
}

export function grantDossierDocxBase64(markdown: string): string {
  return bytesToBase64(buildGrantDossierDocx(markdown));
}

export function grantReportDocxBase64(report: GrantProjectReport): string {
  return bytesToBase64(buildGrantReportDocx(report));
}
