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
} as const;
