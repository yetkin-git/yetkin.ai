import type { CurriculumModule, Section } from "../types";

export const socialMediaAiSections: Section[] = [];

export const socialMediaAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
  title: "Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut)",
  instructor: "Eğitmen",
  category: "KATMAN 1.3 — Sosyal Medya, Görsel ve Video Otomasyonu (Uçtan Uca Dijital İçerik Fabrikası)",
  targetAudience: [
    "İçerik üreticileri",
    "Sosyal medya yöneticileri",
    "KOBİ sahipleri",
    "Dijital pazarlamacılar",
    "E-ticaret markaları",
    "Müşterilerine yeni nesil video içerik hizmeti satmak isteyen ajans girişimcileri",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım iş akışı rehberliği, sıfır kodlama, Midjourney, Canva AI, ElevenLabs, HeyGen, Runway, Kling ve CapCut ile entegre üretim hattı",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Zephyr",
    style: "Genç, pratik, modern ajans ve sosyal medya dili",
    gender: "male",
  },
  sections: socialMediaAiSections,
};
