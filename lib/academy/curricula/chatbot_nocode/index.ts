import type { CurriculumModule, Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

export const chatbotNocodeSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];

export const chatbotNocodeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-CHATBOT-NOCODE-104",
  title: "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)",
  instructor: "Gözde (Kıdemli Yapay Zekâ ve Otomasyon Eğitmeni)",
  category: "KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)",
  targetAudience: [
    "Hiç kodlama bilmeyen KOBİ sahipleri",
    "Klinik yöneticileri",
    "E-ticaret satıcıları",
    "Ajans sahipleri ve serbest çalışanlar",
    "Müşterilerine yapay zekâ destekli diyalog sistemleri satmak isteyen girişimciler",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım görsel akış (Visual Flow) tasarımı, sıfır kodlama (No-code), doğrudan randevu, kurşun toplama (Lead Generation) ve satış kapatma odaklı uygulamalar",
  estimatedTotalMinutes: 53,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, adım adım görsel akış rehberliği",
    gender: "female",
  },
  sections: chatbotNocodeSections,
};
