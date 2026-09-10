import type { CurriculumModule, Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

export const socialMediaAiSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];

export const socialMediaAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
  title: "Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut)",
  instructor: "Deniz (Kıdemli Sosyal Medya ve Görsel Fabrika Eğitmeni)",
  category: "KATMAN 1.3 — Sosyal Medya, Görsel ve Video Otomasyonu (Uçtan Uca Dijital İçerik Fabrikası)",
  targetAudience: [
    "İçerik üreticileri",
    "Sosyal medya yöneticileri",
    "KOBİ sahipleri",
    "Dijital pazarlamacılar",
    "E-ticaret markaları",
    "Müşterilerine yeni nesil video içerik hizmeti satmak isteyen ajans girişimcileri",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım iş akışı rehberliği, sıfır kodlama (No-code), Midjourney, Canva AI, ElevenLabs, HeyGen, Runway, Kling ve CapCut ile entegre endüstriyel üretim hattı",
  estimatedTotalMinutes: 51.5,
  voiceConfig: {
    voice: "Zephyr",
    style: "Genç, pratik, modern ajans ve sosyal medya dili",
    gender: "male",
  },
  sections: socialMediaAiSections,
};
