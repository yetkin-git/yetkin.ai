import type { CurriculumModule, Section } from "../types";
import {
  PARENT_TEACHER_AI_MODULE_CODE_DRAFT,
  PARENT_TEACHER_AI_SLUG_DRAFT,
} from "./planned";
import { parentTeacherAiSection1 } from "./section_1";
import { parentTeacherAiSection2 } from "./section_2";
import { parentTeacherAiSection3 } from "./section_3";
import { parentTeacherAiSection4 } from "./section_4";
import { parentTeacherAiSection5 } from "./section_5";
import { parentTeacherAiSection6 } from "./section_6";

export {
  PARENT_TEACHER_AI_EXAM_PASS_SCORE,
  PARENT_TEACHER_AI_LESSON_PLAN,
  PARENT_TEACHER_AI_MODULE_CODE_DRAFT,
  PARENT_TEACHER_AI_SLUG_DRAFT,
  PARENT_TEACHER_AI_STATUS,
} from "./planned";
export {
  parentTeacherAiSection1,
  parentTeacherAiSection2,
  parentTeacherAiSection3,
  parentTeacherAiSection4,
  parentTeacherAiSection5,
  parentTeacherAiSection6,
};

/**
 * Öğretmen ve veli (18+) taslak modülü.
 * Canlı kayıt `CURRICULUM_DRAFTS_BY_SLUG` ve sınav indeksi bu diziyi okumaz.
 * Gömülmeye hazır kopya `PHASE2_CURRICULUM_DRAFTS_BY_SLUG` içindedir.
 * Çocuk hesabı açılmaz. Ses fırını bu iskelette yoktur.
 * `estimatedTotalMinutes` mühürlü ses değildir; bölüm hedef dakikalarının toplamıdır.
 */
export const parentTeacherAiSections: Section[] = [
  parentTeacherAiSection1,
  parentTeacherAiSection2,
  parentTeacherAiSection3,
  parentTeacherAiSection4,
  parentTeacherAiSection5,
  parentTeacherAiSection6,
];

export const parentTeacherAiModule: CurriculumModule = {
  moduleCode: PARENT_TEACHER_AI_MODULE_CODE_DRAFT,
  title: "Öğretmen ve Veliler İçin Yapay Zekâ Okuryazarlığı (18+)",
  instructor: "Eğitmen",
  category: "Okul ve ev — yetişkin okuryazarlık",
  targetAudience: [
    "18 yaşını doldurmuş öğretmenler",
    "18 yaşını doldurmuş veliler",
  ],
  methodology:
    "Sen dili, dört parçalı istem, okul politikası önce, kimliği çıkarılmış kısa örnek, sıfır kod. Çocuk hesabı açılmaz.",
  estimatedTotalMinutes: 55,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Sakin ev ve okul masası, tek iş, dört parçalı istem",
    gender: "female",
  },
  sections: parentTeacherAiSections,
};

export const PARENT_TEACHER_AI_DRAFT_SLUG = PARENT_TEACHER_AI_SLUG_DRAFT;
