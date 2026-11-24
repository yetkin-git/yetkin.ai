import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_LINE } from "@/lib/copy/legal-launch";

/** Rail SEN aksı — vatandaş bildirim asgarisi (T-02). Resend yok. */
export const NOTICE_SEN = {
  fromName: YETKIN_BRAND,
  footer: LEGAL_SUPPORT_LINE,
  bidReceived: {
    subject: "İlanına teklif geldi",
    body: "Bir usta ilanına teklif verdi. Tezgâhta teklifi gör ve kabul veya reddet.",
  },
  bidAccepted: {
    subject: "Teklifin kabul edildi",
    body: "İşveren teklifini kabul etti. Teslimi tezgâhta yaz.",
  },
  deliveryPosted: {
    subject: "Teslim mesajı düştü",
    body: "Sözleşmeye teslim kanıtı yazıldı. Tezgâhta incele.",
  },
  escrowReleased: {
    subject: "Teslim onaylandı",
    body: "Teslim onaylandı. Platform cüzdanına usta payı yazılmaz.",
  },
  escrowTtlApproaching: {
    subject: "Süre yaklaşıyor",
    body: "Süre dolmak üzere. Teslimi tamamla veya iade yolunu tezgâhta aç.",
  },
  /**
   * Commerce günlük kâr özeti (P0.6). Konu satırı sabittir; gövdeye özet cümlesi
   * ve bağlantı `mail.ts` içinde eklenir. Burada rakam yok — rakam koddan gelir.
   */
  commerceDailyBrief: {
    subject: "Sabah kâr özetin hazır",
    body: "Dünkü fiyat, stok ve kâr tablon hazır.",
    panelLabel: "E-Ticaret paneline git",
  },
} as const;
