import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

/** Ticaret Bakanlığı ihracat dosyası. Ülke, kanal ve döviz kazandırıcı faaliyet ayrıdır. */
export const TICARET_IHRACAT: GrantInstitutionTemplate = {
  id: "ticaret-ihracat",
  title: "Ticaret Bakanlığı İhracat Dosyası",
  sections: [
    { id: "pazar", title: "İhracat Pazarı", required: true },
    { id: "ulke", title: "Hedef Ülke", required: true },
    { id: "doviz", title: "Döviz Kazandırıcı Faaliyet", required: true },
    { id: "kanal", title: "E-ihracat Kanalı", required: true },
  ],
  requiredFields: [
    { id: "ulke-adi", label: "Hedef ülke", required: true },
    { id: "urun", label: "İhraç edilecek ürün veya hizmet", required: true },
    { id: "kanal", label: "Satış veya fuar kanalı", required: true },
    { id: "faaliyet", label: "Döviz kazandırıcı faaliyetin tanımı", required: true },
  ],
  workPackages: [
    { id: "pazar", name: "Hedef pazar seçimi", successMeasure: "Ülke ve alıcı tipi yazılır." },
    { id: "hazirlik", name: "İhracat hazırlığı", successMeasure: "Ürün uyarlaması yazılır." },
    { id: "kanal", name: "Kanal ve tanıtım", successMeasure: "Kanal adı yazılır." },
    { id: "siparis", name: "Sipariş süreci", successMeasure: "Teslim adımı yazılır." },
  ],
  successCriteriaLabel: "Başarı ölçütü: hedef ülke, kanal ve döviz kazandırıcı faaliyet yazılır.",
};
