import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** TÜBİTAK 1507 KOBİ Ar-Ge iskeleti. 1501 sanayi altyapı başlığını taşımaz. */
export const TUBITAK_PRODIS_1507: GrantInstitutionTemplate = {
  id: "tubitak-prodis-1507",
  title: "TÜBİTAK 1507 Proje Dosyası",
  sections: [
    { id: "ozgun", title: "Özgün Değer", required: true },
    { id: "trl", title: "Teknoloji Hazırlık Seviyesi", required: true },
    { id: "matris", title: "İş Paketi Adam-Ay Matrisi", required: true },
    { id: "basari", title: "Başarı Ölçütleri", required: true },
    { id: "kobi", title: "KOBİ Ar-Ge Kapasitesi", required: true },
  ],
  requiredFields: [
    { id: "ozgun-fark", label: "Özgün değer ve KOBİ problemi", required: true },
    { id: "trl-baslangic", label: "Başlangıç teknoloji hazırlık seviyesi", required: true },
    { id: "adam-ay", label: "İş paketi ve adam-ay matrisi", required: true },
    { id: "olcut", label: "Başarı ölçütü", required: true },
    { id: "kobi-kapasite", label: "KOBİ Ar-Ge kapasitesi", required: true },
  ],
  workPackages: [
    { id: "problem", name: "KOBİ problemi", successMeasure: "Çözülen problem yazılır." },
    { id: "gelistirme", name: "Geliştirme paketi", successMeasure: "İş paketi çıktısı yazılır." },
    { id: "test", name: "Test ve ölçüt", successMeasure: "Başarı metni yazılır." },
    { id: "kullanim", name: "İşletmede kullanım", successMeasure: "Kullanım yeri yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: KOBİ kapasitesi, hazırlık seviyesi ve iş paketi birlikte yazılır.",
};
