import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_WORD_CLAUSE_CARDS,
  ACADEMY_WORD_COPY_FRAGMENTS,
  ACADEMY_WORD_FILE_LABEL,
  ACADEMY_WORD_FILE_NAME,
  ACADEMY_WORD_NATIVE_TOOL,
  ACADEMY_WORD_SAMPLE_LOCK,
  ACADEMY_WORD_UPLOAD_PROMPT,
  ACADEMY_WORD_WINDOW_TITLE,
  academyWordStageKind,
} from "@/lib/academy/word-workspace";
import { ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT } from "@/lib/academy/lesson-beat-visual";
import { academyCitizenDocxLabel, academyCitizenOfficeFileLabel } from "@/lib/academy/prompt-console";

const ROOT = process.cwd();

describe("Word doğrudan dosya yükleme tuvali", () => {
  it("ataş, kopuk parça ve riskli madde kartları durur", () => {
    expect(ACADEMY_WORD_WINDOW_TITLE).toBe("Word");
    expect(ACADEMY_WORD_NATIVE_TOOL).toBe("Doğrudan Dosya Yükleme");
    expect(ACADEMY_WORD_FILE_NAME).toBe("Sozlesme_Kaya_Gida.docx");
    expect(ACADEMY_WORD_FILE_LABEL).toBe("Sözleşme Belgesi (Word)");
    expect(ACADEMY_WORD_FILE_LABEL).not.toMatch(/\.docx/iu);
    expect(academyCitizenDocxLabel(ACADEMY_WORD_FILE_NAME)).toBe(ACADEMY_WORD_FILE_LABEL);
    expect(academyCitizenDocxLabel("Yonetici_Ozeti.docx")).toBe("Yönetici Özeti (Word)");
    expect(academyCitizenDocxLabel("Mart_2026_tahsilat_notlari.docx")).toBe("Tahsilat Notları (Word)");
    expect(academyCitizenDocxLabel("Tahsilat_Mart_2026.xlsx")).toBeNull();
    expect(academyCitizenOfficeFileLabel("Tahsilat_Mart_2026.xlsx")).toBe("Tahsilat Mart 2026 (Excel)");
    expect(ACADEMY_WORD_COPY_FRAGMENTS.map((frag) => frag.page)).toEqual(["syf 4", "syf 11", "syf 18"]);
    expect(ACADEMY_WORD_CLAUSE_CARDS.map((card) => card.label)).toEqual([
      "CEZAİ ŞART",
      "DİLEKÇE HİTAP",
      "RAPOR MADDESİ",
    ]);
    expect(ACADEMY_WORD_CLAUSE_CARDS.map((card) => card.tone)).toEqual(["acil", "bekle", "arsiv"]);
    expect(ACADEMY_WORD_UPLOAD_PROMPT).toMatch(/cezai şart maddelerini/u);
    expect(ACADEMY_WORD_UPLOAD_PROMPT).toMatch(/Uydurma madde ekleme/u);
    expect(ACADEMY_WORD_SAMPLE_LOCK).toBe("Örnek oran ve sayfalar; kendi dosyandaki sayıyı koy.");
    expect(ACADEMY_WORD_UPLOAD_PROMPT).toBe(ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT);
  });

  it("sahne türü: parça parça copy, ataş attach, yerinde analysis", () => {
    expect(academyWordStageKind({ section: "GİRİŞ KÖPRÜSÜ" })).toBe("copy");
    expect(academyWordStageKind({ section: "PARÇA PARÇA" })).toBe("copy");
    expect(academyWordStageKind({ section: "HOŞ GELDİN" })).toBe("attach");
    expect(academyWordStageKind({ section: "ATAŞ YÜKLE", hideReply: true })).toBe("attach");
    expect(academyWordStageKind({ section: "TEK DOSYAYLA ANALİZ" })).toBe("analysis");
    expect(academyWordStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("copy");
    expect(academyWordStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("analysis");
  });

  it("16:9 Word penceresi siyah boşluk bırakmaz; ataş ve madde kartları dolgundur", () => {
    const word = readFileSync(join(ROOT, "components/academy/lesson-word-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(word).toContain("applyAcademyOfficeWinFit");
    expect(word).toContain("data-academy-office-win-fit");
    expect(word).toContain("data-academy-word-canvas");
    expect(word).toContain("data-academy-word-copy-panel");
    expect(word).toContain("data-academy-word-upload");
    expect(word).toContain("LessonAiDesk");
    expect(word).toContain("LessonOfficeCopilotRibbon");
    expect(word).toContain('host="word"');
    expect(word).toContain("ACADEMY_WORD_COPY_FRAGMENTS.map");
    expect(word).toContain("ACADEMY_WORD_CLAUSE_CARDS.map");
    expect(word).toContain("ACADEMY_WORD_FILE_LABEL");
    expect(word).toContain("ACADEMY_WORD_SAMPLE_LOCK");
    expect(word).toContain("Ataş · {fileLabel}");
    expect(word).not.toMatch(/Ataş · \{slide\.fileName/u);
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-word-desk \.academy-outlook-canvas--compact[\s\S]*?background:\s*#122033/s,
    );
    expect(css).toMatch(
      /\.academy-word-desk \.academy-word-copy[\s\S]*?background:\s*#122033/s,
    );
    expect(css).not.toMatch(
      /\.academy-word-desk \.academy-outlook-canvas[\s\S]{0,220}background:\s*#000(?:000)?/s,
    );
    expect(css).toMatch(/\.academy-word-attach-chip\s*\{[^}]*color:\s*#34d399/s);
    expect(css).toMatch(
      /\.academy-player-waiter:not\(\.academy-player-compare\) \.academy-word-desk \.academy-outlook-row[\s\S]*?min-height:\s*3\.1rem/s,
    );
  });
});
