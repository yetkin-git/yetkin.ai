/**
 * Canlı Prompt Terminali — seste komut verilirken gerçek istem daktilo animasyonuyla açılır.
 * Harf harf yazma dayatması yoktur (PEDAGOJI.md §E.7).
 * Kod SSOT; izlemede harici API yok. PEDAGOJI.md §E.7.
 */

import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";

export const ACADEMY_PROMPT_CHARS_PER_SEC = 22 as const;

export type AcademyPromptTyping = {
  visible: string;
  full: string;
  started: boolean;
  done: boolean;
};

export function academyCinemaCueId(cueIndex: number): string {
  return `cue-${String(cueIndex).padStart(2, "0")}`;
}

export function academyPromptCueStart(lessonKey: string, cueIndex: number): number | undefined {
  const cueId = academyCinemaCueId(cueIndex);
  const cue = loadAcademyLessonPlaybackCues(lessonKey).find((row) => row.id === cueId);
  return cue?.start;
}

export function academyPromptTypedText(input: {
  prompt: string;
  currentTime?: number;
  cueStart?: number;
  reducedMotion?: boolean;
  charsPerSec?: number;
}): AcademyPromptTyping {
  const full = input.prompt;
  if (!full) {
    return { visible: "", full, started: false, done: true };
  }
  if (input.reducedMotion === true || input.currentTime == null || input.cueStart == null) {
    return { visible: full, full, started: true, done: true };
  }
  const elapsed = input.currentTime - input.cueStart;
  if (elapsed < 0) {
    return { visible: "", full, started: false, done: false };
  }
  const rate = input.charsPerSec ?? ACADEMY_PROMPT_CHARS_PER_SEC;
  const count = Math.min(full.length, Math.floor(elapsed * rate));
  return {
    visible: full.slice(0, count),
    full,
    started: true,
    done: count >= full.length,
  };
}

export function academyOfficeChromeFromFileName(fileName: string | undefined): "excel" | "word" {
  return /\.docx?$/iu.test(fileName ?? "") ? "word" : "excel";
}

/** Vatandaş Lisanı — ham `.docx` uzantısı görsel stage’e basılmaz (PEDAGOJI §E.2). */
const ACADEMY_CITIZEN_DOCX_LABELS: Readonly<Record<string, string>> = {
  "Sozlesme_Kaya_Gida.docx": "Sözleşme Belgesi (Word)",
  "Yonetici_Ozeti.docx": "Yönetici Özeti (Word)",
  "Belge1.docx": "Word Dosyası",
  "Mart_2026_tahsilat_notlari.docx": "Tahsilat Notları (Word)",
  "Yönetici raporu.docx": "Yönetici Raporu (Word)",
};

const ACADEMY_CITIZEN_XLSX_LABELS: Readonly<Record<string, string>> = {
  "Kitap1.xlsx": "Kitap1 (Excel)",
  "Tahsilat_Mart_2026.xlsx": "Tahsilat Mart 2026 (Excel)",
  "Tahsilat_Hata_Avi.xlsx": "Tahsilat Hata Avı (Excel)",
  "Musteri_Liste_Maske.xlsx": "Müşteri Liste Maske (Excel)",
  "Cuma_30_Dakika.xlsx": "Cuma 30 Dakika (Excel)",
};

const ACADEMY_CITIZEN_PPTX_LABELS: Readonly<Record<string, string>> = {
  "Yonetim_Sunumu.pptx": "Yönetim Sunumu (PowerPoint)",
  "Yonetim_Ozeti.pptx": "Yönetim Özeti (PowerPoint)",
};

export function academyCitizenDocxLabel(fileName: string | undefined): string | null {
  if (!fileName || !/\.docx?\b/iu.test(fileName)) {
    return null;
  }
  return ACADEMY_CITIZEN_DOCX_LABELS[fileName] ?? "Word Dosyası";
}

/** Titlebar / ataş / punchcard — ham `xlsx` / `docx` / `pptx` vatandaş yüzüne basılmaz. */
export function academyCitizenOfficeFileLabel(fileName: string | undefined): string | null {
  if (!fileName) {
    return null;
  }
  const docx = academyCitizenDocxLabel(fileName);
  if (docx) {
    return docx;
  }
  if (/\.xlsx\b/iu.test(fileName)) {
    return ACADEMY_CITIZEN_XLSX_LABELS[fileName] ?? "Excel tablosu";
  }
  if (/\.pptx\b/iu.test(fileName)) {
    return ACADEMY_CITIZEN_PPTX_LABELS[fileName] ?? "PowerPoint sunusu";
  }
  return null;
}
