import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_LINE } from "@/lib/copy/legal-launch";

/**
 * Akademi satın alma makbuzu — Vatandaş Lisanı (TESPIT E5).
 * Tekil sen dili zorunludur; `verify:sen-axis` taramasından geçer.
 * Resmi ve çoğul hitap bu dosyaya giremez.
 * Fatura dili `/legal/mesafeli-satis` B.6 ile aynıdır: bu e-posta
 * bilgilendirme makbuzudur, otomatik e-Arşiv paneli değildir.
 */
export const ACADEMY_RECEIPT_SEN = {
  fromName: YETKIN_BRAND,
  footer: LEGAL_SUPPORT_LINE,
  subjectPrefix: "Eğitim makbuzun",
  settledLine: "Eğitimin hesabına tanımlandı. Makbuzun aşağıda.",
  fieldCourse: "Eğitim",
  fieldAmount: "Tutar (KDV dahil)",
  fieldDate: "Tarih",
  fieldReference: "İşlem Numarası",
  licenseLead: "Lisansın 365 gün geçerli. Eğitime buradan başla:",
  invoiceNote:
    "Fatura kayıtlı e-postana iletilir; bu e-posta bilgilendirme makbuzudur. Otomatik e-Arşiv paneli değildir.",
  queryHint: "Bu numarayla destekten sorgulayabilirsin.",
} as const;

export function academyReceiptGreeting(receiptName: string): string {
  const name = receiptName.trim();
  return name.length > 0 ? `Merhaba ${name},` : "Merhaba,";
}

export function academyReceiptSubject(courseTitle: string): string {
  const title = courseTitle.trim();
  return `${ACADEMY_RECEIPT_SEN.subjectPrefix}: ${title.length > 0 ? title : "Eğitim"}`;
}
