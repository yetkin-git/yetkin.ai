import type { CurriculumModule, Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

export const ecommerceAiSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];

export const ecommerceAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-ECOMMERCE-AI-102",
  title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
  instructor: "Gözde (Kıdemli E-Ticaret & Yapay Zekâ Eğitmeni)",
  category: "KATMAN 1.2 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
  targetAudience: [
    "Pazaryeri satıcıları",
    "KOBİ sahipleri",
    "E-ticaret operasyon sorumluları",
    "Dropshipping girişimcileri",
    "Evden satış yapanlar",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım ekran rehberliği, sıfır kodlama, satış ve verimlilik odaklı pratik çözümler",
  estimatedTotalMinutes: 85.5,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, sakin ekran rehberliği",
    gender: "female",
  },
  sections: ecommerceAiSections,
};
