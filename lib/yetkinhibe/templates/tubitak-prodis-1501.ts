import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** TÜBİTAK 1501 sanayi Ar-Ge iskeleti. KOBİ 1507 başlıklarından ayrıdır. */
export const TUBITAK_PRODIS_1501: GrantInstitutionTemplate = {
  id: "tubitak-prodis-1501",
  title: "TÜBİTAK 1501 Proje Dosyası",
  sections: [
    { id: "ozgun", title: "Özgün Değer", required: true },
    { id: "trl", title: "Teknoloji Hazırlık Seviyesi", required: true },
    { id: "matris", title: "İş Paketi Adam-Ay Matrisi", required: true },
    { id: "basari", title: "Başarı Ölçütleri", required: true },
    { id: "altyapi", title: "Sanayi Kuruluşu Ar-Ge Altyapısı", required: true },
  ],
  requiredFields: [
    { id: "ozgun-fark", label: "Özgün değer ve mevcut çözümden fark", required: true },
    { id: "trl-baslangic", label: "Başlangıç teknoloji hazırlık seviyesi", required: true },
    { id: "adam-ay", label: "İş paketi ve adam-ay matrisi", required: true },
    { id: "olcut", label: "Ölçülebilir başarı ölçütü", required: true },
    { id: "sanayi-altyapi", label: "Sanayi kuruluşunun Ar-Ge altyapısı", required: true },
  ],
  workPackages: [
    { id: "kavram", name: "Özgün değer tanımı", successMeasure: "Teknik fark yazılır." },
    { id: "gelistirme", name: "Sanayi geliştirme", successMeasure: "İş paketi çıktısı yazılır." },
    { id: "dogrulama", name: "Doğrulama", successMeasure: "Başarı ölçütü yazılır." },
    { id: "aktarim", name: "Sonuç aktarımı", successMeasure: "Kullanım senaryosu yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: özgün değer, hazırlık seviyesi ve sanayi altyapısı birlikte yazılır.",
};
