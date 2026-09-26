import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 6 — canlı indeks dersi. Modülün kapanış dersidir.
 * Sınav yolu `lesson-index.ts` içindedir. Bu ders mühürlü sestedir.
 */
export const officeAi2Section6: Section = {
  sectionNumber: 6,
  lessonKey: "01_office_ai_ileri-6",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Üç Dosyada Yan Yana Sayı Denetimi",
  targetDurationMinutes: 11,
  estimatedWordCount: 1431,
  pedagogicalObjective:
    "Ofis çalışanının tabloyu, yazılı notu ve uzun belgeyi yan yana denetlemesini ve uyuşmayan sayıyı tek sayfalık karar notuna koymamasını göstermek. Sıra: şirket politikası, veri sınıfı, aktarım yolu. İki sayının ortası yeni sayıdır ve nota girmez. Ad, telefon, kimlik numarası ve IBAN nota girmez.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-6"),
};
