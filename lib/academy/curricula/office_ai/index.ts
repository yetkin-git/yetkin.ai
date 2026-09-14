import type { CurriculumModule, Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

export const officeAiSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];

export const officeAiMasteryModule: CurriculumModule = {
  moduleCode: "CURR-OFFICE-AI-101",
  title: "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu)",
  instructor: "Eğitmen",
  category: "KATMAN 1.1 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
  targetAudience: [
    "Beyaz yakalı ofis çalışanları",
    "Muhasebe ve finans uzmanları",
    "İnsan kaynakları uzmanları",
    "Yönetici asistanları",
    "Kamu personeli",
    "KOBİ çalışanları",
    "İş hayatına hazırlanan üniversite öğrencileri",
  ],
  methodology: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği, sıfır kodlama, yüksek verim odaklı pratik ofis çözümleri.",
  estimatedTotalMinutes: 56.5,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği",
    gender: "female",
  },
  sections: officeAiSections,
};
