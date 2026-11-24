import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";

const PAIR = /^(.{2,80}?):\s+(\S.*)$/;
const STEP = /^(\d+)\.\s+(.+)$/;
const BULLET = /^[-*]\s+(.+)$/;

/** Teklif markdown'ını başlık, adım tablosu ve onay kutusu bloklarına çevirir. */
export function proposalMarkdownToBlocks(markdown: string): DocumentBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: DocumentBlock[] = [];
  let headingUsed = false;
  let stepRows: string[][] = [];
  let pairHeaders: string[] | null = null;
  let pairRows: string[][] = [];

  function flushSteps(): void {
    if (stepRows.length === 0) {
      return;
    }
    blocks.push({
      kind: "table",
      headers: ["Adım", "Teslimat"],
      rows: stepRows.map((row) => [row[0] ?? "", row[1] ?? ""]),
    });
    stepRows = [];
  }

  function flushPairs(): void {
    if (!pairHeaders) {
      return;
    }
    blocks.push({
      kind: "table",
      headers: ["Alan", "Değer"],
      rows: [[pairHeaders[0] ?? "", pairHeaders[1] ?? ""], ...pairRows],
    });
    pairHeaders = null;
    pairRows = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushSteps();
      flushPairs();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushSteps();
      flushPairs();
      blocks.push({ kind: "h2", text: trimmed.slice(3).trim() });
      headingUsed = true;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushSteps();
      flushPairs();
      blocks.push({ kind: "h1", text: trimmed.slice(2).trim() });
      headingUsed = true;
      continue;
    }
    const step = STEP.exec(trimmed);
    if (step?.[1] && step[2]) {
      flushPairs();
      stepRows.push([step[1], step[2]]);
      continue;
    }
    const bullet = BULLET.exec(trimmed);
    if (bullet?.[1]) {
      flushSteps();
      flushPairs();
      blocks.push({ kind: "p", text: `• ${bullet[1]}` });
      continue;
    }
    const pair = PAIR.exec(trimmed);
    if (pair?.[1] && pair[2] && !trimmed.startsWith("http")) {
      flushSteps();
      if (!pairHeaders) {
        pairHeaders = [pair[1], pair[2]];
      } else {
        pairRows.push([pair[1], pair[2]]);
      }
      continue;
    }
    flushSteps();
    flushPairs();
    if (!headingUsed) {
      blocks.push({ kind: "h1", text: trimmed });
      headingUsed = true;
      continue;
    }
    blocks.push({ kind: "p", text: trimmed });
  }
  flushSteps();
  flushPairs();

  const hasApproval = blocks.some(
    (block) =>
      (block.kind === "h1" || block.kind === "h2" || block.kind === "p") &&
      /onay|imza|teslim\s*tesellüm/i.test(block.text),
  );
  if (!hasApproval) {
    blocks.push({ kind: "h2", text: "Müşteri Onay Kutusu" });
  }
  blocks.push({
    kind: "table",
    headers: ["Alan", "İmza / Tarih"],
    rows: [
      ["Müşteri adı", ""],
      ["Yetkili imza", ""],
      ["Onay tarihi", ""],
    ],
  });
  return blocks;
}

export function buildProposalDocx(markdown: string): Uint8Array {
  return buildDocxDocument(proposalMarkdownToBlocks(markdown));
}

export function buildProposalPdf(markdown: string): Uint8Array {
  return buildPlainPdf(proposalMarkdownToBlocks(markdown));
}
