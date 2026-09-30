import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 2. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section2: Section = ecommerceSection({
  sectionNumber: 2,
  lessonKey: "02_ecommerce_ai-2",
  title: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
  targetDurationMinutes: 12.9,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
