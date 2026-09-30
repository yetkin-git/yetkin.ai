import type { Section } from "../types";
import { ecommerceSection } from "./spoken-body";

/** EC-102 ders 6. Konuşma gövdesi spoken-scripts dosyasındadır. API isteği yok. */
export const section6: Section = ecommerceSection({
  sectionNumber: 6,
  lessonKey: "02_ecommerce_ai-6",
  title: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
  targetDurationMinutes: 14.4,
  pedagogicalObjective:
    "Bu derste yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı işlenir. Konuşma gövdesi spoken-scripts dosyasından okunur.",
});
