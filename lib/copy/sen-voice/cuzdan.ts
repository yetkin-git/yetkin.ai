export const CUZDAN_SEN = {
  eyebrow: "Güvenli dijital cüzdan",
  title: "Cüzdan",
  description: "Tek nakit defter: Akademi eğitim tahsilatı bu bakiyeden okunur.",
  balanceLabel: "Ana Bakiye",
  balanceHintLive: "Canlı bakiye",
  balanceHintGuest: "Defter oturum ister",
  balanceGuestValue: "Oturum yok",
  historyLabel: "Şeffaf İşlem Geçmişi",
  historyHintLive: (take: number) => `Son ${take} satır`,
  historyHintGuest: "Her hareket kayda geçer",
  historyGuestValue: "Silinemez",
  currencyLabel: "Para Birimi (₺)",
  currencyValue: "Türk Lirası",
  currencyHint: "Tutarlar ₺ olarak gösterilir",
  topUpTitle: "Kart ile yükle",
  topUpAuth: "Kart yüklemesi oturum ister. Bakiye, banka bildirimi geldikten sonra görünür.",
  paymentsUnconfigured: "Ödeme henüz bağlanmadı",
  paymentsUnconfiguredBody:
    "Ödeme henüz bağlanmadı. Kart tahsilatı şu an kapalı. Bakiye, tahsilat onayından sonra yazılır. Hesabıma dön veya sonra yeniden dene.",
  paymentsUnconfiguredCta: "Hesabıma dön",
  topUpBand: (min: string, max: string) =>
    `Aralık: ${min} – ${max}. Kart ödemesi güvenli ödeme altyapısıyla alınır.`,
  refundTitle: "Kullanılmamış bakiye",
  refundBody:
    "Kurs alımında kullanılmayan bakiye, yüklendiği karta iade edilir. İade kartına işlenmeden defter düşmez.",
  refundCta: "Bakiyemi İade Et",
  refundConfirmEyebrow: "Cüzdan",
  refundConfirmTitle: "Cüzdan Bakiyesi İadesi",
  refundConfirmBody: (amount: string) =>
    `Cüzdanınızdaki ${amount} tutarındaki kullanılmamış bakiye kartınıza iade edilecektir. İadeler PayTR altyapısıyla 1-3 iş günü içerisinde hesabına yansır. İşlemi onaylıyor musunuz?`,
  refundConfirmCancel: "Vazgeç",
  refundConfirmAccept: "Evet, İade Et",
  refundConfirmClose: "Pencereyi kapat",
  refundPending: "İade iletiliyor…",
  refundTiming: "İadeler PayTR altyapısıyla kartınıza 1-3 iş gününde aktarılır",
  refundDone: (amount: string) =>
    `İade işleminiz PayTR/Bankanıza iletilmiştir. Tutar (${amount}) 1-3 iş günü içerisinde kartınıza yansıyacaktır. Cüzdan bakiyeniz sıfırlanmıştır.`,
  refundPartial: (amount: string) =>
    `İade işleminiz PayTR/Bankanıza iletilmiştir. Tutar (${amount}) 1-3 iş günü içerisinde kartınıza yansıyacaktır. Kalan tutar incelemeye alındı. İşlem tamamlandığında tarafınıza bilgi verilecektir.`,
  refundRequested: "İade talebiniz incelemeye alındı. İşlem tamamlandığında tarafınıza bilgi verilecektir.",
  refundFinanceHold: (amount: string) =>
    `${amount} tutarındaki iade talebiniz finans ekibimize iletilmiştir. İnceleme tamamlanıp bakiye sıfırlandığında 'Hesabımı Kapat' adımı aktifleşecektir.`,
  refundFail: "Kart iadesi tamamlanamadı.",
  closedLoopTitle: "Akademi tahsilatı",
  closedLoopBody:
    "Cüzdan Akademi eğitim tahsilatı içindir. Bu odada havale yüzeyi yoktur.",
  sandboxHint:
    "Deneme ödemesi: bakiye ancak banka bildirimi geldikten sonra görünür. Önizleme bakiyeyi artırmaz.",
  auth: "Defter dökümü oturum ister. Hareketler tahsilat kaydından okunur.",
  unboundBadge: "Liste henüz yüklenemedi — örnek düzen",
  unboundBody:
    "Bağlantı kurulunca hesap hareketlerin burada durur. Bakiye tahsilat kaydından okunur.",
  kasaTitle: "Güvenli ödeme",
  kasaLead:
    "Kart bilgisi PayTR’nin güvenli ödeme penceresinde girilir. Bu sayfa oturum çerezi istemez; kısa ömürlü ödeme bağlantısı yeter.",
  kasaInvalid:
    "Bu ödeme bağlantısı geçersiz veya süresi doldu. Uygulamaya dönüp yeniden dene.",
  kasaInvalidCta: "Akademiye dön",
  kasaReturnOk: "Ödemeniz Onaylanıyor, Akademiye Yönlendiriliyorsunuz...",
  kasaReturnCta: "Akademiye Dön / Eğitimi Başlat",
  kasaReturnFail: "Kart işlemi tamamlanmadı. Akademiye dönüp yeniden deneyebilirsin.",
  kasaReturnFailCta: "Akademiye Dön",
} as const;
