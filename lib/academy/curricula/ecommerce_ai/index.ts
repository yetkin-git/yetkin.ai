import type { CurriculumModule, Section } from "../types";

export const ecommerceAiSections: Section[] = [];

export const ecommerceAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-ECOMMERCE-AI-102",
  title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
  instructor: "Eğitmen",
  category: "KATMAN 1.2 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
  targetAudience: [
    "Pazaryeri satıcıları",
    "KOBİ sahipleri",
    "E-ticaret operasyon sorumluları",
    "Dropshipping girişimcileri",
    "Evden satış yapanlar",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım ekran rehberliği, sıfır kodlama, satış ve verimlilik odaklı pratik çözümler",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Kore",
    style: "Canlı diyalog ve sen dili, sakin ekran rehberliği",
    gender: "female",
  },
  sections: ecommerceAiSections,
};
