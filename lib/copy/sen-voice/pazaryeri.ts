/** Rail SEN aksı — Yetkinİlan (pazaryeri) odası. Müze sen-voice kopyalanmaz. */
export const PAZARYERI_SEN = {
  catalog: {
    eyebrow: "Yetkinİlan",
    title: "Yetkinİlan",
    description:
      "Dijital üründe anında teslim / anında bakiyeden transfer (Settlement). Hizmette emanet korumasında kilit (Escrow Hold); teslimat onayında aktarım.",
    stallCta: "Tezgâhı yönet",
    ordersCta: "Siparişler",
    live: (count: number) => `Canlı sicil — ${count} ilan`,
    unbound: "Liste henüz yüklenemedi — örnek düzen",
  },
  stats: {
    vitrineLabel: "Vitrin",
    instantLabel: "Anında",
    instantValue: "Settlement",
    instantHint: "dijital teslim",
    escrowLabel: "Emanet",
    escrowValue: "Hold",
    escrowHint: "teslimat onayında aktarım",
  },
  list: {
    emptyHint:
      "Vitrin henüz boş. Kartlar örnek düzendir; dijital anında settlement, hizmet emanet kilit. Emlak/vasıta bu turda derinleşmez.",
    openCta: "İlanı aç",
    stallCta: "Tezgâha ekle",
    lockInstant: "Anında teslim",
    lockEscrow: "Emanet kilit",
    lockOffer: "Teklife açık",
    lockDoped: "Dopingli",
  },
  paths: {
    settlementTitle: "Dijital ürün — anında teslim",
    settlementEyebrow: "Settlement",
    escrowTitle: "Hizmet / ilan — emanet kilit",
    escrowEyebrow: "Escrow Hold",
    settlementSteps: (lockMinutes: number) =>
      [
        {
          key: "lock" as const,
          label: "Fiyat kilidi",
          detail: `Katalog tutarı ${lockMinutes} dakika mühürlenir. Süre dolunca kilit düşer.`,
        },
        {
          key: "settle" as const,
          label: "Anında teslim / anında bakiyeden transfer (Settlement)",
          detail:
            "Bakiye debit; net satıcıya, platform payı hazineye geçer. Emanet (escrow) yoktur. PAID ve CLEARED aynı anda kapanır.",
        },
        {
          key: "cleared" as const,
          label: "Sipariş CLEARED",
          detail: "Teslim anında tamam. Hold / teslim onayı beklenmez.",
        },
      ] as const,
    escrowSteps: (lockMinutes: number, holdPercent: number) =>
      [
        {
          key: "lock" as const,
          label: "Fiyat kilidi",
          detail: `Katalog tutarı ${lockMinutes} dakika mühürlenir. Süre dolunca kilit düşer.`,
        },
        {
          key: "hold" as const,
          label: "Emanet korumasında kilit (Escrow Hold)",
          detail: `Tutar cüzdanda kilitlenir (PENDING). Satıcı henüz almaz. Platform payı %${holdPercent} teslimat onayında ayrılır.`,
        },
        {
          key: "release" as const,
          label: "Teslimat onayında aktarım",
          detail:
            "Alıcı teslimi onaylayınca net satıcı cüzdanına geçer (CLEARED). İade CANCELLED; emanet çözülür.",
        },
      ] as const,
  },
  product: {
    catalogCta: "Vitrine dön",
    noSale: "Bu ürün şu an satışa kapalı.",
    loginLead: "Satın almak için",
    loginCta: "giriş yap",
    ownedSettlement: "Sipariş alındı. Anında teslim — bakiyeden transfer (Settlement) mühürlendi.",
    ownedEscrow: "Sipariş alındı. Tutar emanet korumasında kilitli; teslimat onayında aktarım.",
    sellerTitle: "Satıcı tezgâhı",
    sellerBody: "Bu ilan kendi tezgâhta.",
    offerTitle: "Doğrulanmış teklif",
    offerBody: "Satıcı onaylarsa teklif tutarı kapora olarak emanete kilitlenir.",
    purchaseSettlementEyebrow: "Anında teslim",
    purchaseEscrowEyebrow: "Emanet kilit",
    doped: "Dopingli",
    offerOpen: "Teklife açık",
  },
  stall: {
    eyebrow: "Yetkinİlan",
    title: "Tezgâhı yönet",
    description:
      "Kategori ödeme modelini seçer. Dijital: anında settlement. Hizmet: emanet hold / teslimat onayında aktarım.",
    newTitle: "Yeni ilan",
    backCta: "Vitrine dön",
    titleLabel: "Başlık",
    summaryLabel: "Özet",
    categoryLabel: "Kategori",
    priceLabel: "Fiyat (₺)",
    offerAllowed: "Teklife açık",
    tkgmLabel: "TKGM ada / parsel",
    insuranceLabel: "Sigorta kancası (Quick / Hepiyi)",
    digitalOption: "Dijital ürün (anında teslim)",
    serviceOption: "Hizmet / ilan (emanet kilit)",
    realEstateOption: "Emlak (TKGM / emanet)",
    vehicleOption: "Vasıta (sigorta / emanet)",
    modelSettlement:
      "Bu ilanda anında teslim / anında bakiyeden transfer (Settlement) işletilir. Emanet yoktur. Sipariş PAID ve CLEARED aynı anda kapanır.",
    modelEscrow:
      "Bu ilanda emanet korumasında kilit (Escrow Hold) işletilir. Tutar PENDING kalır; teslimat onayında CLEARED aktarım. İade CANCELLED.",
    submit: "Tezgâha koy",
    pending: "Listeleniyor…",
    fail: "İlan açılamadı.",
    unbound: "Liste henüz yüklenemedi. Vitrin Yetkinİlan odasındadır.",
  },
  orders: {
    eyebrow: "Yetkinİlan",
    title: "Siparişler",
    description:
      "Dijital: anında teslim / bakiyeden transfer (Settlement). Hizmet: emanet kilit; teslimat onayında aktarım. Durumlar vatandaşa PENDING / PAID / CLEARED / CANCELLED olarak dürüst yansır.",
    empty: "Sipariş yok. Vitrin ürünleri Yetkinİlan odasındadır.",
    unbound: "Liste henüz yüklenemedi.",
    backCta: "Vitrine dön",
    buy: "Alış",
    sell: "Satış",
  },
  purchase: {
    cta: "Cüzdandan satın al",
    locking: (lockMinutes: number) => `Fiyat kilidi alınıyor — ${lockMinutes} dakika geçerli.`,
    settling: "Settlement: bakiyeden transfer, emanet yok.",
    holding: "Emanet kilitleniyor… Anında settlement yoktur.",
    lockFail: "Fiyat kilidi alınamadı.",
    buyFail: "Satın alma tamamlanamadı.",
    received: "Sipariş alındı.",
  },
  delivery: {
    confirm: "Teslimi onayla ve aktar",
    confirming: "Aktarılıyor…",
    refund: "İade",
    refunding: "İade…",
    fail: "Teslim işlemi yazılamadı.",
    refundFail: "İade yazılamadı.",
  },
  offer: {
    amountLabel: "Teklif (₺)",
    submit: "Teklif gönder",
    pending: "Gönderiliyor…",
    received: "Teklif alındı.",
    fail: "Teklif yazılamadı.",
    accept: "Onayla — emaneti kilitle",
    reject: "Reddet",
    deciding: "İşleniyor…",
    decideFail: "Teklif kararı yazılamadı.",
  },
  doping: {
    cta: "Doping satın al (öne çıkar)",
    pending: "Kesiliyor…",
    fail: "Doping alınamadı.",
  },
} as const;
