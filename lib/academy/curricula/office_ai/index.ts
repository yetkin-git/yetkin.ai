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
export { OFFICE_AI_PREP_STRIP, OFFICE_AI_PREP_STRIP_KEY } from "./prep";
export {
  OFFICE_AI_PLANNED_LESSONS,
  officeAiPlannedLessonByKey,
} from "./planned";
export {
  OFF_102_EXAM_PASS_SCORE,
  OFF_102_EXAM_POOL_MAX,
  OFF_102_EXAM_POOL_MIN,
  OFF_102_MODULE_CODE_ALTERNATIVE,
  OFF_102_MODULE_CODE_DRAFT,
  OFF_102_MODULE_CODE_RETIRED,
  OFF_102_PREREQUISITE_LESSON_COUNT,
  OFF_102_PREREQUISITE_SKU_SLUG,
  OFF_102_SKU_SLUG_DRAFT,
  OFF_102_TITLE_DRAFT,
  OFF_201_ECOMMERCE_COLLISION_CODE,
  OFF_201_EXAM_PASS_SCORE,
  OFF_201_EXAM_POOL_MAX,
  OFF_201_EXAM_POOL_MIN,
  OFF_201_MODULE_CODE,
  OFF_201_PREREQUISITE_LESSON_COUNT,
  OFF_201_PREREQUISITE_SKU_SLUG,
  OFF_201_SATELLITE_KEYS,
  OFF_201_SKU_SLUG_DRAFT,
  OFF_201_TITLE_DRAFT,
  assertOff102DraftIntegrity,
  assertOff201DraftIntegrity,
  off102DraftLessonsFromSatellites,
  off201DraftLessonsFromSatellites,
} from "./off-102";
export type { Off102DraftLesson, Off201DraftLesson } from "./off-102";
export type {
  OfficeAiPlannedLesson,
  OfficeAiPlannedLessonLane,
  OfficeAiPlannedLessonStatus,
} from "./planned";

/** 101 kanonu — 8 ana ders. Ders 0 (`prep.ts`) bu diziye girmez. `section4` arşivdir; sınav yoluna girmez. */
export const officeAiSections: Section[] = [
  section1,
  sectionK1,
  section2,
  section3,
  section5,
  sectionG1,
  sectionW1,
  section6,
];

export const officeAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-OFFICE-AI-101",
  title: "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Verimliliği)",
  instructor: "Eğitmen",
  category: "Ofis ve verimlilik",
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
