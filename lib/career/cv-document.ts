/**
 * Türkçe karakterli A4 CV PDF/DOCX üretimi.
 * Mevcut yetkinhibe glif motoru ve OOXML üreticisini kullanır.
 */

import type { CareerCvView } from "@/lib/career/cv-model";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";

export function careerCvToBlocks(cv: CareerCvView): DocumentBlock[] {
  const blocks: DocumentBlock[] = [
    { kind: "h1", text: cv.fullName || "Özgeçmiş" },
  ];
  if (cv.headline) {
    blocks.push({ kind: "p", text: cv.headline });
  }
  const meta = [cv.city].filter((row) => row.trim().length > 0);
  if (meta.length > 0) {
    blocks.push({ kind: "p", text: meta.join(" · ") });
  }
  if (cv.summary) {
    blocks.push({ kind: "h2", text: "Özet" });
    blocks.push({ kind: "p", text: cv.summary });
  }
  if (cv.experiences.length > 0) {
    blocks.push({ kind: "h2", text: "Deneyim" });
    for (const row of cv.experiences) {
      const head = [row.title, row.company, row.period].filter(Boolean).join(" — ");
      blocks.push({ kind: "p", text: head });
      if (row.detail) {
        blocks.push({ kind: "p", text: row.detail });
      }
    }
  }
  if (cv.educations.length > 0) {
    blocks.push({ kind: "h2", text: "Eğitim" });
    for (const row of cv.educations) {
      blocks.push({
        kind: "p",
        text: [row.school, row.degree, row.period].filter(Boolean).join(" — "),
      });
    }
  }
  if (cv.skills.length > 0) {
    blocks.push({ kind: "h2", text: "Yetkinlikler" });
    blocks.push({ kind: "p", text: cv.skills.join(", ") });
  }
  if (cv.languages.length > 0) {
    blocks.push({ kind: "h2", text: "Diller" });
    blocks.push({
      kind: "p",
      text: cv.languages.map((row) => (row.level ? `${row.name} (${row.level})` : row.name)).join(", "),
    });
  }
  if (cv.links.length > 0) {
    blocks.push({ kind: "h2", text: "Bağlantılar" });
    for (const row of cv.links) {
      blocks.push({ kind: "p", text: `${row.label}: ${row.url}` });
    }
  }
  return blocks;
}

export function buildCareerCvPdf(cv: CareerCvView): Uint8Array {
  return buildPlainPdf(careerCvToBlocks(cv));
}

export function buildCareerCvDocx(cv: CareerCvView): Uint8Array {
  return buildDocxDocument(careerCvToBlocks(cv));
}

export function careerCvFilename(cv: CareerCvView, ext: "pdf" | "docx"): string {
  const stem = (cv.fullName || "ozgecmis")
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9çğıöşüı]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "ozgecmis";
  return `${stem}.${ext}`;
}
