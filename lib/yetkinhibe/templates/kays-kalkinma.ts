import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** Kalkınma ajansı KAYS dosyası. Bölgesel katma değer ve ajans önceliği ayrıdır. */
export const KAYS_KALKINMA: GrantInstitutionTemplate = {
  id: "kays-kalkinma",
  title: "Kalkınma Ajansı KAYS Dosyası",
  sections: [
    { id: "katma", title: "Bölgesel Katma Değer", required: true },
    { id: "istihdam", title: "İstihdam Etkisi", required: true },
    { id: "oncelik", title: "Ajans Öncelik Ekseni", required: true },
    { id: "surdur", title: "Sürdürülebilirlik", required: true },
  ],
  requiredFields: [
    { id: "bolge", label: "Yararlanılacak bölge", required: true },
    { id: "katma", label: "Bölgeye katma değer", required: true },
    { id: "oncelik", label: "Ajans öncelik ekseni", required: true },
    { id: "istihdam", label: "Yerel istihdam etkisi", required: true },
  ],
  workPackages: [
    { id: "tespit", name: "Bölgesel ihtiyaç", successMeasure: "İhtiyaç cümlesi yazılır." },
    { id: "uygulama", name: "Yatırım uygulaması", successMeasure: "Faaliyet yazılır." },
    { id: "istihdam", name: "Yerel istihdam", successMeasure: "Rol yazılır." },
    { id: "yaygin", name: "Bölgede yaygınlaşma", successMeasure: "Devam koşulu yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: bölgesel katma değer, öncelik ekseni ve istihdam etkisi yazılır.",
};
