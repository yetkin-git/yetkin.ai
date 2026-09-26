import type { CurriculumModule, Section } from "../types";

export const promptPracticeSections: Section[] = [];

export const promptPracticeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-PROMPT-PRACTICE-105",
  title: "Günlük İşler İçin İstem Yazma",
  instructor: "Gözde",
  category: "Katman 1 — günlük iş için istem",
  targetAudience: [
    "Günlük işlerinde sohbet kutusunu düzenli kullanmak isteyenler",
    "Öğrenciler",
    "Serbest çalışanlar",
  ],
  methodology: "Sen dili, uygulamalı istem, rol + bağlam + biçim, sıfır kodlama",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
    gender: "female",
  },
  sections: promptPracticeSections,
};
