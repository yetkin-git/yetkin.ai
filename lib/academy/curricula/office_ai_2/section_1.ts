import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 1 — canlı indeks dersi.
 * Sınav yolu `lesson-index.ts` içindedir. Ses 1, 2 ve 6 yeniden fırın kuyruğundadır; 3–5 mühürlüdür.
 */
export const officeAi2Section1: Section = {
  sectionNumber: 1,
  lessonKey: "01_office_ai_ileri-1",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Dört Parçalı İstem",
  targetDurationMinutes: 8,
  estimatedWordCount: 896,
  pedagogicalObjective:
    "Ofis çalışanının tek bir iş notunu, veri sırasından sonra dört parçalı isteme dökmesini göstermek. Sıra: şirket politikası, veri sınıfı, aktarım yolu. Parçalar: rol, görev, biçim, kısıt. Eksik parça, akıcı ama yanlış cevap üretir.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-1"),
};
