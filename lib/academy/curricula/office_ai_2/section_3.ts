import type { Section } from "../types";
import { officeAi2SpokenMarkdown } from "./spoken-body";

/**
 * OFF-201 Ders 3 — canlı indeks dersi.
 * Sınav yolu `lesson-index.ts` içindedir. Bu ders mühürlü sestedir.
 */
export const officeAi2Section3: Section = {
  sectionNumber: 3,
  lessonKey: "01_office_ai_ileri-3",
  isPreviewAllowed: false,
  isLocked: true,
  title: "Excel Formül ve Grafik",
  targetDurationMinutes: 8,
  estimatedWordCount: 1098,
  pedagogicalObjective:
    "Ofis çalışanının tablodaki toplamı toplama formülüyle hücreye kilitlemesini ve grafiği formülün okuduğu hücrelerden seçmesini göstermek. Sıra: şirket politikası, veri sınıfı, aktarım yolu. Yapay zekânın yazdığı düz sayı ve uydurma formül masaya konmaz. Ham tablo kişisel hesaba gitmez.",
  contentMarkdown: officeAi2SpokenMarkdown("01_office_ai_ileri-3"),
};
