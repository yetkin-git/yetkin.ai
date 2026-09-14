import type { CurriculumModule, Section } from "../types";

export const chatbotNocodeSections: Section[] = [];

export const chatbotNocodeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-CHATBOT-NOCODE-104",
  title: "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)",
  instructor: "Eğitmen",
  category: "KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)",
  targetAudience: [
    "KOBİ'ye kurulum satacak freelancer adayları",
    "Yeni mezunlar",
    "Ajans çalışanları",
    "Teknik meraklı işletme personeli",
  ],
  methodology: "Canlı diyalog ve sen dili, adım adım görsel akış tasarımı, sıfır kodlama, randevu ve teslim seti odaklı uygulamalar",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Puck",
    style: "Teknik, net, otomasyon odaklı erkek sesi; adım adım görsel akış rehberliği",
    gender: "male",
  },
  sections: chatbotNocodeSections,
};
