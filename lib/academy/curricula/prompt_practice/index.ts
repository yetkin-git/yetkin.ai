import { ACADEMY_COURSE_TITLES, PROMPT_PRACTICE_SUBTITLE } from "@/lib/academy/course-titles";
import { academyCourseVoiceSeal } from "@/lib/academy/instructors";
import type { CurriculumModule, Section } from "../types";

export const promptPracticeSections: Section[] = [];

export const promptPracticeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-PROMPT-PRACTICE-105",
  title: ACADEMY_COURSE_TITLES["05_prompt_practice"],
  instructor: "Gözde",
  category: `Katman 1 — ${PROMPT_PRACTICE_SUBTITLE}`,
  targetAudience: [
    "Günlük işlerinde sohbet kutusunu düzenli kullanmak isteyenler",
    "Öğrenciler",
    "Serbest çalışanlar",
  ],
  methodology: "Sen dili, uygulamalı istem, rol + bağlam + biçim, sıfır kodlama",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    courseMasterVoice: academyCourseVoiceSeal("05_prompt_practice").courseMasterVoice,
    style: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
    gender: academyCourseVoiceSeal("05_prompt_practice").gender,
  },
  sections: promptPracticeSections,
};
