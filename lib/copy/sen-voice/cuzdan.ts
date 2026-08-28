export const CUZDAN_SEN = {
  eyebrow: "Güvenli dijital cüzdan",
  title: "Cüzdan",
  description: "Tek nakit defter: Akademi tahsilatı Wallet satırından okunur. Platform cüzdanından banka çekimi yoktur.",
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
    "Ödeme henüz bağlanmadı / pasif. Kart tahsilatı bağlı değil. Sahte bakiye yazılmaz. Kokpite dön veya sonra yeniden dene.",
  paymentsUnconfiguredCta: "Kokpite dön",
  topUpBand: (min: string, max: string) =>
    `Aralık: ${min} – ${max}. Kart ödemesi güvenli ödeme altyapısıyla alınır.`,
  closedLoopTitle: "Çekim yok, kuruluş dağıtır",
  closedLoopBody:
    "Cüzdan Akademi tahsilatı içindir. Freelancer bedeli lisanslı ödeme kuruluşunda dağılır. Bu odada havale veya karttan çekim yüzeyi yok.",
  sandboxHint:
    "Deneme ödemesi: bakiye ancak banka bildirimi geldikten sonra görünür. Önizleme bakiyeyi artırmaz.",
  auth: "Defter dökümü oturum ister. Sahte hareket basılmaz.",
  unboundBadge: "Liste henüz yüklenemedi — örnek düzen",
  unboundBody:
    "Veritabanı bağlanınca gerçek LedgerEntry satırları burada durur. Uydurma bakiye veya sahte hareket yok.",
} as const;
