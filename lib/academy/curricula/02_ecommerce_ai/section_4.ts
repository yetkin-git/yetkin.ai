import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 4. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section4: Section = ecommerceSection({
  sectionNumber: 4,
  lessonKey: "02_ecommerce_ai-4",
  title: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
  targetDurationMinutes: 12.2,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
