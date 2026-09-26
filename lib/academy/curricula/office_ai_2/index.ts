import type { CurriculumModule, Section } from "../types";
import { academyCourseSealedDurationMinutes } from "@/lib/academy/lesson-audio";
import { ACADEMY_OFF201_LESSON_TTS_VOICE } from "@/lib/academy/instructors";
import { OFFICE_AI_2_MODULE_CODE, OFFICE_AI_2_SLUG } from "./planned";
import { officeAi2Section1 } from "./section_1";
import { officeAi2Section2 } from "./section_2";
import { officeAi2Section3 } from "./section_3";
import { officeAi2Section4 } from "./section_4";
import { officeAi2Section5 } from "./section_5";
import { officeAi2Section6 } from "./section_6";

export {
  OFFICE_AI_2_AUDIO_PENDING,
  OFFICE_AI_2_LESSON_PLAN,
  OFFICE_AI_2_MODULE_CODE,
  OFFICE_AI_2_SLUG,
  OFFICE_AI_2_STATUS,
} from "./planned";
export {
  officeAi2Section1,
  officeAi2Section2,
  officeAi2Section3,
  officeAi2Section4,
  officeAi2Section5,
  officeAi2Section6,
};

/**
 * OFF-201 canlı modül.
 * `curricula/index.ts` bu diziyi `CURRICULUM_DRAFTS_BY_SLUG` ve sınav indeksine yazar.
 * Ders 3–5 mühürlü sestir. Ders 1, 2 ve 6 yeniden fırın kuyruğundadır.
 * `estimatedTotalMinutes` mühürlü altı dersin timings toplamıdır.
 */
export const officeAi2Sections: Section[] = [
  officeAi2Section1,
  officeAi2Section2,
  officeAi2Section3,
  officeAi2Section4,
  officeAi2Section5,
  officeAi2Section6,
];

export const officeAi2MasteryModule: CurriculumModule = {
  moduleCode: OFFICE_AI_2_MODULE_CODE,
  title: "İleri Ofis Yapay Zekâ",
  instructor: "Eğitmen",
  category: "Ofis ve verimlilik — ileri",
  targetAudience: [
    "OFF-101 bitirmiş ofis çalışanları",
    "Yönetici asistanları",
    "Rapor ve toplantı yükü olan ekipler",
  ],
  methodology:
    "Sen dili, dört parçalı istem (rol, görev, biçim, kısıt), şirket politikası önce, maskeli veri, sıfır kod.",
  estimatedTotalMinutes: academyCourseSealedDurationMinutes(OFFICE_AI_2_SLUG),
  voiceConfig: {
    voice: "Kore · Puck · Fenrir · Aoede · Leda · Zephyr",
    style: "Ders başına ayrı karakter. Gözde bu kursta konuşmaz.",
    gender: "mixed",
    lessonVoices: ACADEMY_OFF201_LESSON_TTS_VOICE,
  },
  sections: officeAi2Sections,
};

/** @deprecated Canlı ad `OFFICE_AI_2_SLUG`. */
export const OFFICE_AI_2_DRAFT_SLUG = OFFICE_AI_2_SLUG;
