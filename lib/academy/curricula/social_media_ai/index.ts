import type { CurriculumModule, Section } from "../types";

export const socialMediaAiSections: Section[] = [];

export const socialMediaAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
  title: "Yapay Zekâ ile Sosyal Medya İçeriği (Görsel ve Kısa Video)",
  instructor: "Deniz",
  category: "Katman 1 — sosyal medya görseli ve kısa video",
  targetAudience: [
    "İçerik üretenler",
    "Sosyal medya işini yürütenler",
    "Küçük işletme sahipleri",
    "Mağaza sahipleri",
  ],
  methodology: "Sen dili, adım adım iş, sıfır kodlama",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Zephyr",
    style: "Sakin ve günlük iş dili",
    gender: "male",
  },
  sections: socialMediaAiSections,
};
