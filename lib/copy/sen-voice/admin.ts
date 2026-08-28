/** Rail SEN aksı — admin sığınağı. Müze sen-voice kopyalanmaz. */
export const ADMIN_SEN = {
  eyebrow: "Platform idaresi",
  title: "Admin",
  description:
    "Fiyat birimleri PriceCatalogEntry sicilinden okunur. Satış fiyatı kod sabiti değildir. Super Admin amountMinor değerini tamsayı olarak günceller.",
  auth: "Admin kataloğu oturum ister. Sahte fiyat basılmaz.",
  forbidden:
    "Bu sığınak Super Admin kilidine bağlıdır. SUPER_ADMIN_USER_ID eşleşmezse katalog okunmaz.",
  /** Katalog okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft:
    "Katalog şu an okunamadı. Bağlantı kurulunca PriceCatalogEntry satırları burada durur; uydurma fiyat basılmaz.",
  stats: {
    catalogLabel: "Katalog",
    catalogHintLive: (seedCount: number) => `Ops tohumu ${seedCount} birim bekler`,
    catalogHintPending: "Bağlanınca sicil dolar",
    guest: "Oturum yok",
    locked: "Kilitli",
    moduleLabel: "Modül",
    moduleHint: "moduleKey grupları",
    waiting: "Bekleniyor",
    holdLabel: "Hold bandı",
    holdHintLive: (bpsCount: number) => `${bpsCount} BPS satırı — kod tavanı %10–15`,
    holdHintPending: "S11-A kod kilidi, veri değil",
  },
  honestyTitle: "Fiyat veridir",
  honestyBody: (band: string) =>
    `Super Admin amountMinor günceller; updatedBy oturum kimliğidir. Her zam gerekçe kodu ve açıklama ile PriceCatalogDecisionLedger satırına düşer. Platform payı kodda ${band} bandındadır — katalog satırı o tavanı aşamaz. Gayri-admin istek 403 döner.`,
  catalogEyebrow: "PriceCatalogEntry sicili",
  catalogTitle: "Fiyat kataloğu",
  catalogIntro:
    "Satırlar PriceCatalogEntry kayıtlarıdır. amountMinor tamsayıdır; Super Admin gerekçeyle günceller. Sessiz zam yok.",
  emptyBody:
    "Ops tohumu uygulanınca birimler burada durur. Uydurma fiyat basılmaz.",
  /** Quiet Luxury denetim paneli — müfredat / ilan / sığınak yönleri. */
  audit: {
    eyebrow: "Denetim odaları",
    title: "Müfredat, ilan ve sığınak",
    body: "Müfredat revizyon kuyruğu, Akademi kataloğu ve Freelancer ilan tahtası buradan açılır. Fiyat yazımı yalnız Super Admin kataloğundadır.",
  },
  statusActive: "Aktif",
  statusInactive: "Kapalı",
  statusOutOfBand: "Kod tavanı dışı",
  unitCount: (n: number) => `${n} birim`,
  amountSave: "Kaydet",
  amountSaving: "…",
  amountFail: "Fiyat güncellenemedi.",
  amountLabel: "amountMinor",
  reasonLabel: "Güncelleme gerekçesi",
  reasonCodeLabel: "Gerekçe kodu",
  reasonNoteLabel: "Açıklama",
  reasonNotePlaceholder: "Neden güncellendiğini yazın",
  reasonFail: "Gerekçe kodu ve açıklama zorunludur.",
  reasonCodes: {
    ADMIN_MANUAL: "Yönetici kararı",
    MACRO_INDEX_ADJUSTMENT: "Makro endeks ayarı",
    PROMOTION: "Promosyon",
    CORRECTION: "Düzeltme",
  },
  ledgerEyebrow: "PriceCatalogDecisionLedger",
  ledgerTitle: "Fiyat karar defteri",
  ledgerIntro: "Son zamlar gerekçeli satır olarak durur. Sessiz zam yok.",
  ledgerEmpty: "Henüz karar satırı yok.",
  ledgerFromTo: "Eski → yeni",
  revisionsCta: "Müfredat revizyonları",
  dashboardCta: "Panele dön",
  academyCta: "Akademi kataloğu",
  freelancerCta: "İlan tahtası",
  confirm: {
    eyebrow: "Onay",
    amountTitle: "Fiyatı güncelle?",
    amountBody: (unitKey: string, from: string, to: string, reasonCode: string) =>
      `${unitKey}: amountMinor ${from} → ${to} (${reasonCode}). PriceCatalogEntry ve karar defteri yazılır.`,
    amountConfirm: "Güncelle",
    amountCancel: "Vazgeç",
    closeLabel: "Kapat",
    pending: "…",
  },
} as const;
