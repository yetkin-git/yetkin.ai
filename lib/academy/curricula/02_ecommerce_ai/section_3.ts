import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 3. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section3: Section = ecommerceSection({
  sectionNumber: 3,
  lessonKey: "02_ecommerce_ai-3",
  title: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
  targetDurationMinutes: 8.8,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
