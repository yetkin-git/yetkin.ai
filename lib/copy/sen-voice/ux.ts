/** Rail SEN aksı — odalar arası köprü, hızlı yükleme, teslimat kahraman kartı. */

export const UX_SEN = {
  topUp: {
    title: "Hızlı bakiye yükleme",
    eyebrow: "Kart · PayTR",
    close: "Kapat",
    shortfall: (gap: string) => `Bu işlem için ${gap} eksik.`,
    bandHint: (min: string, max: string) => `Kart yükleme bandı ${min} – ${max}.`,
    minLift: (suggested: string) => `Eksik tutar bant altına düşüyor. Kart ${suggested} yükler.`,
    capHint: (max: string) => `Tek seferde en fazla ${max} yüklenir.`,
    balance: (amount: string) => `Canlı bakiye ${amount}.`,
    required: (amount: string) => `İşlem tutarı ${amount} (KDV dahil).`,
    amountLabel: "Yükleme tutarı (₺)",
    amountLocked: "Yükleme tutarı eğitim fiyatına kilitlidir; PayTR sepeti bu kuruşu taşır.",
    submit: "Kart ile yükle",
    pending: "Hazırlanıyor…",
    iframeTitle: "Güvenli ödeme",
    waitingClearing:
      "Kart tahsil edildiyse valör bekleniyor. CREDIT yalnız Bildirim URL sonrası bakiyeye düşer; bu ekran canlı bakiyeyi izler.",
    funded: "Bakiye mühürlendi. İşlem yeniden deneniyor.",
    fail: "Yükleme başlatılamadı.",
    timeout: "Valör henüz bakiyeye düşmedi. Sahte bakiye yazılmaz. Cüzdanı aç veya bu ekranda kal.",
    cuzdanCta: "Cüzdanı aç",
    trigger: "Eksik tutarı yükle",
    mockNoCredit:
      "Yerel mock bakiyeye düşmez. CREDIT yalnız Bildirim URL sonrası bakiyeye yazılır.",
    sandboxHint: "Deneme tahsilatı sahte bakiye basmaz; valör beklenir.",
  },
  bridge: {
    dismiss: "Kapat",
    kicker: "Sonraki adım",
    examPassed: {
      title: "Yetkinlik kazandın",
      body: "Sertifikan ve yetkinliğin Kariyer sayfasına işlendi.",
      cta: "Sertifikanı gör",
    },
    examHref: "/academy/certificates",
    examCareerHref: "/career",
    purchaseAcademy: {
      title: "Eğitim kütüphanene eklendi",
      body: "Dersler açıldı. Belge sınav barajından sonra basılır.",
      cta: "Derse başla",
    },
    bidAccepted: {
      title: "Teklif kabul edildi",
      body: "Bütçe güvenli ödemeye alındı. Teslim onayından sonra bakiyene geçer.",
      cta: "Sözleşmeyi aç",
    },
    bidSent: {
      title: "Teklif alındı",
      body: "İşveren tezgâhta görür.",
    },
    topUpSettled: {
      title: "Bakiye mühürlendi",
      body: "Kart tahsili bakiyeye düştü.",
      cta: "Kokpite dön",
    },
    topUpHref: "/dashboard",
    deliveryPosted: {
      title: "Teslim kanıtı yazıldı",
      body: "İşveren inceleme kartını sözleşmenin üstünde görür.",
    },
    released: {
      title: "Teslim onaylandı",
      body: "Teslim onaylandı. Platform cüzdanına usta payı yazılmaz.",
      cta: "Sözleşmeye dön",
    },
    revisionSent: {
      title: "Revizyon talebi yazıldı",
      body: "Usta tezgâhta görür.",
    },
  },
  delivery: {
    eyebrow: "İnceleme bekleniyor",
    title: "Teslimat inceleme ve onay",
    inspect: "Teslim edilen işi incele",
    noArtifact: "Bağlantı yok — teslim notu aşağıda.",
    gross: "Toplam tutar",
    platform: (percent: number) => `Platform payı (%${percent})`,
    net: "Ustaya net",
    release: (net: string) => `İşi onayla — ${net} henüz yazılmaz; teslim onayından sonra hesabına geçer.`,
    releasing: "Onay yazılıyor…",
    revision: "Revizyon İstiyorum",
    revisionPending: "Yazılıyor…",
    revisionPlaceholder: "Revizyon notu — ne düzeltilmeli?",
    revisionDefault: "Revizyon talep edildi.",
    revisionExhausted:
      "Revizyon hakkı bitti. Teslimatı onayla.",
    freelancerWait: "Teslim incelemede. İşveren onayı bekleniyor.",
    fail: "İşlem başarısız.",
    freezeBanner:
      "Onaydan sonra tutar hesabına geçer. Platform cüzdanına usta payı yazılmaz.",
    releaseFrozen: (net: string) =>
      `İşi onayla — ${net} henüz yazılmaz; teslim onayından sonra hesabına geçer.`,
  },
  http: {
    network: "Ağ yanıt vermedi. Yeniden dene.",
    generic: "İşlem tamamlanamadı.",
    forbidden: "Bu kapı kapalı.",
    sessionExpired: "Oturum süresi doldu.",
    sessionTitle: "Oturum gerekli",
    sessionBody: "Bu yazma oturum ister. Giriş yap, sonra aynı adımı tekrarla.",
    loginCta: "Giriş yap",
    originDenied: "Çapraz kökenli yazma reddedildi.",
    originTitle: "Köken reddedildi",
    originBody: "Bu yazma aynı siteden gelmedi. Sayfayı yenile.",
    serviceUnavailable: "Hizmet geçici olarak kapalı.",
    serviceUnavailableBody: "Sahte başarı yazılmaz. Biraz sonra yeniden dene veya ana yüzeye dön.",
  },
} as const;

export function railCitizenHttpError(status: number, message?: string | null): string {
  if (status === 401) {
    return UX_SEN.http.sessionExpired;
  }
  if (status === 403 && message === UX_SEN.http.originDenied) {
    return UX_SEN.http.originDenied;
  }
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  if (status === 403) {
    return UX_SEN.http.forbidden;
  }
  if (status === 503) {
    return UX_SEN.http.serviceUnavailable;
  }
  return UX_SEN.http.generic;
}

export function citizenHttpToastKind(
  status: number,
  message?: string | null,
): "session" | "origin" | "silent" {
  if (status === 401) {
    return "session";
  }
  if (status === 403 && message === UX_SEN.http.originDenied) {
    return "origin";
  }
  return "silent";
}
