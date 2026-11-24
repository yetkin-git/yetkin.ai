import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** KOSGEB iş planı iskeleti. Pazar, SWOT, rekabet ve istihdam ayrı başlıktır. */
export const KOSGEB_IS_PLANI: GrantInstitutionTemplate = {
  id: "kosgeb-is-plani",
  title: "KOSGEB İş Planı",
  sections: [
    { id: "pazar", title: "Pazar Analizi", required: true },
    { id: "swot", title: "SWOT", required: true },
    { id: "rekabet", title: "Rekabet Üstünlüğü", required: true },
    { id: "istihdam", title: "İstihdam ve Sürdürülebilirlik Taahhüdü", required: true },
  ],
  requiredFields: [
    { id: "pazar-musteri", label: "Hedef müşteri ve ihtiyaç", required: true },
    { id: "swot-kuvvet", label: "Güçlü yön ve zayıf yön", required: true },
    { id: "rekabet-fark", label: "Rakipten ayrışan yetkinlik", required: true },
    { id: "istihdam-taahhut", label: "İstihdam ve sürdürülebilirlik taahhüdü", required: true },
  ],
  workPackages: [
    { id: "pazar", name: "Pazar doğrulama", successMeasure: "Müşteri ihtiyacı yazılır." },
    { id: "kurulum", name: "Kapasite kurulumu", successMeasure: "Yatırım kalemi gerekçesi yazılır." },
    { id: "istihdam", name: "İstihdam planı", successMeasure: "Rol ve sorumluluk yazılır." },
    { id: "surdurme", name: "Sürdürülebilirlik", successMeasure: "İşletmenin devam koşulu yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: pazar, istihdam ve işletmenin devamı birlikte yazılır.",
};
