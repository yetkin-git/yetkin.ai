import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — vatandaş bildirim asgarisi (T-02). Resend yok. */
export const NOTICE_SEN = {
  fromName: YETKIN_BRAND,
  bidReceived: {
    subject: "İlanına teklif geldi",
    body: "Bir usta ilanına teklif verdi. Tezgâhta teklifi gör ve kabul veya reddet.",
  },
  bidAccepted: {
    subject: "Teklifin kabul edildi",
    body: "İşveren teklifini kabul etti. Emanet kilitlendi. Teslimi tezgâhta yaz.",
  },
  deliveryPosted: {
    subject: "Teslim mesajı düştü",
    body: "Sözleşmeye teslim kanıtı yazıldı. Tezgâhta incele; onaylarsan emanet çözülür.",
  },
  escrowReleased: {
    subject: "Emanet çözüldü",
    body: "Emanet serbest bırakıldı. Usta payı platform cüzdanına yazılmaz; ödeme kuruluşu dağıtır.",
  },
  escrowTtlApproaching: {
    subject: "Emanet süresi yaklaşıyor",
    body: "Emanet kilidinin süresi dolmak üzere. Teslimi tamamla veya iade yolunu tezgâhta aç; aksi halde kilit iade edilir.",
  },
} as const;
