import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 2 — canlı indeks dersi.
 * Sınav yolu `lesson-index.ts` içindedir.
 * OFF-201 6/6 mühürlüdür. Kore ve Gemini 3.1 Flash TTS kaseti yayındadır. Yeniden fırın kuyruğu boştur. Satış AÇIKTIR.
 */
export const officeAi2Section2: Section = {
  sectionNumber: 2,
  lessonKey: "01_office_ai_ileri-2",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Toplantı Notu ve Eylem Listesi",
  targetDurationMinutes: 8,
  estimatedWordCount: 1033,
  pedagogicalObjective:
    "Ofis çalışanının dağınık bir toplantı notundan kim, ne, ne zaman çıkarmasını ve çakışan saati ayrı satırda işaretlemesini göstermek. Sıra: şirket politikası, veri sınıfı, aktarım yolu. Ham not kişisel hesaba gitmez. Eksik sahip ve eksik tarih uydurulmaz.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-2"),
};
