import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 4 — canlı indeks dersi.
 * Sınav yolu `lesson-index.ts` içindedir. Bu ders mühürlü sestedir.
 */
export const officeAi2Section4: Section = {
  sectionNumber: 4,
  lessonKey: "01_office_ai_ileri-4",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Uzun Belge ve Sayfa Kontrolü",
  targetDurationMinutes: 10,
  estimatedWordCount: 1255,
  pedagogicalObjective:
    "Ofis çalışanının uzun belgeden maddeyi sayfa numarasıyla çıkarmasını ve yapay zekânın atladığı maddeyi o sayfayı açarak denetlemesini göstermek. Sıra: şirket politikası, veri sınıfı, aktarım yolu. «Tam analiz» cümlesi sayfa kontrolünün yerini tutmaz. Ad, kimlik numarası ve IBAN kişisel hesaba gitmez.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-4"),
};
