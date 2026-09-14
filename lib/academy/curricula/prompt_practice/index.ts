import type { CurriculumModule, Section } from "../types";

export const promptPracticeSections: Section[] = [];

export const promptPracticeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-PROMPT-PRACTICE-105",
  title: "Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)",
  instructor: "Eğitmen",
  category: "KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)",
  targetAudience: [
    "Günlük işlerinde yapay zekâyı sistemli kullanmak isteyenler",
    "Öğrenciler",
    "Serbest çalışanlar",
  ],
  methodology: "Canlı diyalog ve doğrudan sen hitabı, uygulamalı prompt şablonları, rol + bağlam + format, sıfır kodlama",
  estimatedTotalMinutes: 0,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
    gender: "female",
  },
  sections: promptPracticeSections,
};
