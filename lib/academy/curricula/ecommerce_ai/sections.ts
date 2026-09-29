import type { Section } from "../types";
import { countAcademyMarkdownWords } from "@/lib/academy/word-count";
import { ecommerceSpokenMarkdown } from "./spoken-body";

function ecommerceSection(input: {
  sectionNumber: number;
  lessonKey: string;
  title: string;
  targetDurationMinutes: number;
  pedagogicalObjective: string;
}): Section {
  const contentMarkdown = ecommerceSpokenMarkdown(input.lessonKey);
  return {
    sectionNumber: input.sectionNumber,
    lessonKey: input.lessonKey,
    isPreviewAllowed: false,
    isLocked: true,
    title: input.title,
    targetDurationMinutes: input.targetDurationMinutes,
    estimatedWordCount: countAcademyMarkdownWords(contentMarkdown),
    pedagogicalObjective: input.pedagogicalObjective,
    contentMarkdown,
  };
}

export const section1: Section = ecommerceSection({
  sectionNumber: 1,
  lessonKey: "02_ecommerce_ai-1",
  title: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
  targetDurationMinutes: 12.1,
  pedagogicalObjective:
    "Bu derste trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});

export const section2: Section = ecommerceSection({
  sectionNumber: 2,
  lessonKey: "02_ecommerce_ai-2",
  title: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
  targetDurationMinutes: 12.9,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});

export const section3: Section = ecommerceSection({
  sectionNumber: 3,
  lessonKey: "02_ecommerce_ai-3",
  title: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
  targetDurationMinutes: 8.8,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});

export const section4: Section = ecommerceSection({
  sectionNumber: 4,
  lessonKey: "02_ecommerce_ai-4",
  title: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
  targetDurationMinutes: 12.2,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});

export const section5: Section = ecommerceSection({
  sectionNumber: 5,
  lessonKey: "02_ecommerce_ai-5",
  title: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
  targetDurationMinutes: 11.5,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});

export const section6: Section = ecommerceSection({
  sectionNumber: 6,
  lessonKey: "02_ecommerce_ai-6",
  title: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
  targetDurationMinutes: 14.4,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
