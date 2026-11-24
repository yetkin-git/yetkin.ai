import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** TKDK IPARD kırsal yatırım dosyası. Tedbir ve uygun harcama başlığı ayrıdır. */
export const TKDK_IPARD: GrantInstitutionTemplate = {
  id: "tkdk-ipard",
  title: "TKDK IPARD Kırsal Yatırım Dosyası",
  sections: [
    { id: "konu", title: "Kırsal Yatırım Konusu", required: true },
    { id: "tedbir", title: "IPARD Tedbiri", required: true },
    { id: "harcama", title: "Uygun Harcama Başlıkları", required: true },
    { id: "cevre", title: "Çevresel Etki", required: true },
  ],
  requiredFields: [
    { id: "yatirim", label: "Kırsal yatırım konusu", required: true },
    { id: "tedbir", label: "İlgili IPARD tedbiri", required: true },
    { id: "harcama", label: "Uygun harcama başlığı", required: true },
    { id: "cevre", label: "Çevresel etki notu", required: true },
  ],
  workPackages: [
    { id: "yer", name: "Yatırım yeri", successMeasure: "Kırsal faaliyet yazılır." },
    { id: "insaat", name: "Yatırım uygulaması", successMeasure: "Harcama başlığı yazılır." },
    { id: "isletme", name: "İşletmeye alma", successMeasure: "Üretim adımı yazılır." },
    { id: "cevre", name: "Çevre önlemi", successMeasure: "Önlem cümlesi yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: kırsal konu, tedbir ve çevresel etki yazılır.",
};
