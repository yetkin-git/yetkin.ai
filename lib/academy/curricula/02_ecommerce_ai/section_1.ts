import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 1. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section1: Section = ecommerceSection({
  sectionNumber: 1,
  lessonKey: "02_ecommerce_ai-1",
  title: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
  targetDurationMinutes: 12.1,
  pedagogicalObjective:
    "Bu derste trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
