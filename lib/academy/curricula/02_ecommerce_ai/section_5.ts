import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 5. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section5: Section = ecommerceSection({
  sectionNumber: 5,
  lessonKey: "02_ecommerce_ai-5",
  title: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
  targetDurationMinutes: 11.5,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
