import type { CurriculumModule, Section } from "../types";
import { academyCourseSealedDurationMinutes } from "@/lib/academy/lesson-audio";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";
import { sectionG1 } from "./section_g1";
import { sectionW1 } from "./section_w1";
import { sectionK1 } from "./section_k1";

export { section1, section2, section3, section4, section5, section6, sectionG1, sectionW1, sectionK1 };
export {
  OFFICE_AI_PLANNED_LESSONS,
  officeAiPlannedLessonByKey,
} from "./planned";
export type {
  OfficeAiPlannedLesson,
  OfficeAiPlannedLessonLane,
  OfficeAiPlannedLessonStatus,
} from "./planned";

export const officeAiSections: Section[] = [
  section1,
  sectionK1,
  section2,
  section3,
  section5,
  section4,
  sectionG1,
  sectionW1,
  section6,
];

export const officeAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-OFFICE-AI-101",
  title: "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)",
  instructor: "Eğitmen",
  category: "KATMAN 1.1 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
  targetAudience: [
    "Beyaz yakalı ofis çalışanları",
    "Muhasebe ve finans uzmanları",
    "İnsan kaynakları uzmanları",
    "Yönetici asistanları",
    "Kamu personeli",
    "KOBİ çalışanları",
    "İş hayatına hazırlanan üniversite öğrencileri",
  ],
  methodology: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği, sıfır kodlama, yüksek verim odaklı pratik ofis çözümleri.",
  estimatedTotalMinutes: academyCourseSealedDurationMinutes("01_office_ai"),
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği",
    gender: "female",
  },
  sections: officeAiSections,
};
