import { applyAcademySectionPreviewGate } from "@/lib/academy/preview-lock";
import type { CurriculumModule, Section } from "../types";
import { academyCourseVoiceSeal } from "@/lib/academy/instructors";
import { section1, section2, section3, section4, section5, section6 } from "./sections";

export { section1, section2, section3, section4, section5, section6 };

/**
 * EC-102 gövde. Kamu kapısı kapalıdır. Konuşma `lib/academy/spoken-scripts/02_ecommerce_ai-*.md` dosyasındadır.
 * Anlatıcı adı Deniz. Mühürlü karakter `courseMasterVoice` (Puck, erkek). Kadın ses atanmamıştır.
 * İlk ders bayrağı `applyAcademySectionPreviewGate` ile bağlanır.
 */
export const ecommerceAiSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
].map(applyAcademySectionPreviewGate);

export const ECOMMERCE_AI_LESSON_OUTLINE = [
  { key: "02_ecommerce_ai-1", title: section1.title },
  { key: "02_ecommerce_ai-2", title: section2.title },
  { key: "02_ecommerce_ai-3", title: section3.title },
  { key: "02_ecommerce_ai-4", title: section4.title },
  { key: "02_ecommerce_ai-5", title: section5.title },
  { key: "02_ecommerce_ai-6", title: section6.title },
] as const;

const ecommerceSpokenMinutes = ecommerceAiSections.reduce(
  (sum, section) => sum + section.targetDurationMinutes,
  0,
);

export const ecommerceAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-ECOMMERCE-AI-102",
  title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
  instructor: "Deniz",
  category: "KATMAN 1.2 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
  targetAudience: [
    "Pazaryeri satıcıları",
    "KOBİ sahipleri",
    "E-ticaret operasyon sorumluları",
    "Dropshipping girişimcileri",
    "Evden satış yapanlar",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım ekran rehberliği, sıfır kodlama, satış ve verimlilik odaklı pratik çözümler",
  estimatedTotalMinutes: Math.round(ecommerceSpokenMinutes * 10) / 10,
  voiceConfig: {
    courseMasterVoice: academyCourseVoiceSeal("02_ecommerce_ai").courseMasterVoice,
    style: "Canlı diyalog ve sen dili, sakin tezgâh rehberliği",
    gender: academyCourseVoiceSeal("02_ecommerce_ai").gender,
  },
  sections: ecommerceAiSections,
};
