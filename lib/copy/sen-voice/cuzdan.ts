export const CUZDAN_SEN = {
  eyebrow: "Güvenli dijital cüzdan",
  title: "Cüzdan",
  description: "Tek nakit defter: Akademi eğitim tahsilatı bu bakiyeden okunur.",
  balanceLabel: "Ana Bakiye",
  balanceHintLive: "TRY cüzdan SSOT",
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
  topUpAuth: "Kart yüklemesi oturum ister. Sahte bakiye yazılmaz.",
  paymentsUnconfigured: "Ödeme henüz bağlanmadı",
  paymentsUnconfiguredBody:
    "Ödeme henüz bağlanmadı / pasif. Kart tahsilatı bağlı değil. Sahte bakiye yazılmaz. Hesabıma dön veya sonra yeniden dene.",
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
  auth: "Defter dökümü oturum ister. Sahte hareket basılmaz.",
  unboundBadge: "Liste henüz yüklenemedi — örnek düzen",
  unboundBody:
    "Veritabanı bağlanınca gerçek hesap hareketleri burada durur. Uydurma bakiye veya sahte hareket yok.",
  kasaTitle: "Güvenli ödeme",
  kasaLead:
    "Kart bilgisi PayTR’nin güvenli ödeme penceresinde girilir. Bu sayfa oturum çerezi istemez; kısa ömürlü ödeme bağlantısı yeter.",
  kasaInvalid:
    "Bu ödeme bağlantısı geçersiz veya süresi doldu. Uygulamaya dönüp yeniden dene.",
  kasaReturnOk: "Ödemeniz Onaylanıyor, Akademiye Yönlendiriliyorsunuz...",
  kasaReturnCta: "Akademiye Dön / Eğitimi Başlat",
  kasaReturnFail: "Kart işlemi tamamlanmadı. Akademiye dönüp yeniden deneyebilirsin.",
  kasaReturnFailCta: "Akademiye Dön",
} as const;
