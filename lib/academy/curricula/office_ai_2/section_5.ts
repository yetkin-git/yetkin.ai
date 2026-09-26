import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 5 — canlı indeks dersi.
 * Sınav yolu `lesson-index.ts` içindedir. Bu ders mühürlü sestedir.
 */
export const officeAi2Section5: Section = {
  sectionNumber: 5,
  lessonKey: "01_office_ai_ileri-5",
  isPreviewAllowed: false,
  isLocked: true,
  title: "E-Posta Sınıflandırma ve Yanıt Taslağı",
  targetDurationMinutes: 11,
  estimatedWordCount: 1418,
  pedagogicalObjective:
    "Ofis çalışanının karmaşık bir iş postasını üç sınıfa ayırmasını ve her iş için şirket kuralına uygun yanıt taslağı yazmasını göstermek. Sınıflar: bilgi, şikayet, kişisel veri talebi. Sıra: şirket politikası, veri sınıfı, aktarım yolu. Ad, telefon, IBAN ve kimlik numarası taslağa girmez. Taslak gönderilmez.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-5"),
};
