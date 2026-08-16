export const CUZDAN_SEN = {
  eyebrow: "Güvenli dijital cüzdan",
  title: "Cüzdan",
  description: "Tek nakit defter: bakiye Wallet satırından, hareketler LedgerEntry’den okunur. Banka çekimi kapalıdır.",
  balanceLabel: "Ana Bakiye",
  balanceHintLive: "TRY cüzdan SSOT",
  balanceHintGuest: "12 odada kullanıma hazır",
  balanceGuestValue: "Oturum yok",
  historyLabel: "Şeffaf İşlem Geçmişi",
  historyHintLive: (take: number) => `Son ${take} satır`,
  historyHintGuest: "Her hareket kayda geçer",
  historyGuestValue: "Silinemez",
  currencyLabel: "Para Birimi (₺)",
  currencyValue: "Türk Lirası",
  currencyHint: "Tutarlar ₺ olarak gösterilir",
  topUpTitle: "Kart ile yükle",
  closedLoopTitle: "Para girer, çıkmaz",
  closedLoopBody:
    "Bakiye hesapta güvende; 12 odada harcanır. Banka çekimi (S43) kapalı; bu odada havale veya PayTR çekim yüzeyi yok.",
  auth: "Defter dökümü oturum ister. Sahte hareket basılmaz.",
  unboundBadge: "Liste henüz yüklenemedi — örnek düzen",
  unboundBody:
    "Veritabanı bağlanınca gerçek LedgerEntry satırları burada durur. Uydurma bakiye veya sahte hareket yok.",
} as const;
