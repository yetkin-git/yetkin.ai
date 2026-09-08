import type { CurriculumModule, Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

export const promptPracticeSections: Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];

export const promptPracticeMasteryModule: CurriculumModule = {
  moduleCode: "CURR-PROMPT-PRACTICE-105",
  title: "Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)",
  instructor: "Gözde (Kıdemli Yapay Zekâ ve İstem Mimarisi Eğitmeni)",
  category: "KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)",
  targetAudience: [
    "Günlük işlerinde yapay zekâyı en yüksek verimle kullanmak isteyen beyaz yakalılar",
    "Girişimciler",
    "Öğrenciler",
    "Profesyoneller",
  ],
  methodology: "Canlı diyalog ve doğrudan sen hitabı, uygulamalı prompt şablonları, rol tanımlama, bağlam kurma, Few-Shot yönlendirme, Chain-of-Thought (düşünce zinciri) mantığı, sıfır kodlama, TTS dostu akıcı anlatım",
  estimatedTotalMinutes: 44,
  voiceConfig: {
    voice: "Callirrhoe",
    style: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
    gender: "female",
  },
  sections: promptPracticeSections,
};
