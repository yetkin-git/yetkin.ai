/** Rail SEN aksı — Studio odası. Müze sen-voice kopyalanmaz. Donmuş oda kopyası; motor archived. */
const STUDIO_IMAGE_CATALOG_MISSING =
  "Görsel fiyatı katalogda henüz yok. Üretim durur; bakiyeden düşüm yok.";

export const STUDIO_SEN = {
  catalog: {
    eyebrow: "Üretim stüdyosu",
    title: "Üretim stüdyosu",
    description:
      "Taslağı yaz, metin veya görsel üret. Üretim anında bakiyeden transfer (LLM Debit). İkinci yüzey yalnız IMAGE_GEN.",
    walletCta: "cüzdan",
    walletLead: "Jeton yüklemek için",
    auth: "Üretim oturum ister. Jeton bakiyesi cüzdandan okunur.",
    unbound: "Liste henüz yüklenemedi",
    unboundBody: "Motor hazır. Bağlantı tamamlanınca metin üretimi burada dolar.",
    textBench: "Metin üretim tezgâhı",
    canvasBench: "Tuval tezgâhı",
    canvasHint: "Asimetrik stüdyo masası · üretim metni",
    imageBench: "Görsel tezgâh",
    imageHint: "S57-A · yalnız IMAGE_GEN · gümrük factory",
    imageBenchLabel: "Görsel tezgâh (IMAGE_GEN)",
  },
  stats: {
    draftLabel: "Taslak",
    generationLabel: "Üretim",
    debitLabel: "LLM Debit",
    debitValue: "anında",
    debitHint: "bakiyeden transfer",
  },
  debit: {
    title: "Üretim öncesi",
    eyebrow: "LLM Debit",
    steps: [
      {
        key: "debit" as const,
        label: "Üretim anında bakiyeden transfer (LLM Debit)",
        detail:
          "Jeton bakiyeden düşer. Debit üretim anında yazılır; emanet (escrow) yoktur. Katalog tabanı veya token maliyeti — hangisi büyükse o düşer.",
      },
      {
        key: "artifact" as const,
        label: "Üretim kaydı (Artifact)",
        detail: "Görsel/metin çıktısı kişisel kasada saklanır. Artifact debit değildir; kasa satırı üretim kaydıdır.",
      },
      {
        key: "ceiling" as const,
        label: "Tavan / sınır aşımı (413)",
        detail:
          "Sınır aşıldığında bakiyeden düşüm yapılmaz. Tavan 413’te debit yok, artifact satırı yok.",
      },
    ],
  },
  wallet: {
    eyebrow: "Jeton bakiyesi",
    title: "Üretim cüzdanı",
    live: "Canlı Türk Lirası bakiyesi",
    unbound: "Bakiye henüz yüklenmedi",
    walletCta: "Cüzdanı aç",
    textBadge: "Metin üretimi",
    preCheck: (balance: string, floor: string) =>
      `Üretim öncesi kontrol: bakiye ${balance}. Katalog tabanı ${floor}. Yetersizse debit yok.`,
    preCheckUnbound: "Üretim öncesi bakiye kontrol edilir. Yetersizse debit yok.",
    insufficient: "Yetersiz bakiye. Üretim öncesi kontrol debit yazmaz.",
    remaining: (amount: string) => `Kalan bakiye ${amount}.`,
  },
  generate: {
    placeholder: "Ne üretmek istiyorsun? Jeton cüzdandan düşer.",
    imagePlaceholder: "Görsel talebi yaz. Jeton cüzdandan düşer. IMAGE_GEN gümrük kapısı.",
    debitHint: "jeton bakiyeden düşer",
    imageHint: "görsel debiti katalog tabanı veya token maliyeti",
    cta: "Üret",
    imageCta: "Görsel üret",
    pending: "Üretiliyor…",
    debiting: "LLM Debit: bakiyeden transfer…",
    fail: "Üretim tamamlanamadı.",
    imageFail: "Görsel üretimi tamamlanamadı.",
    catalogMissing: STUDIO_IMAGE_CATALOG_MISSING,
    insufficient: "Yetersiz bakiye. Üretim öncesi kontrol debit yazmaz.",
    ceiling: "Sınır aşıldığında bakiyeden düşüm yapılmaz.",
    download: "Çıktıyı indir",
    settled: (debit: string, remaining: string) =>
      `LLM Debit mühürlendi: ${debit} bakiyeden düştü. Kalan bakiye ${remaining}.`,
  },
  drafts: {
    liveTitle: "Metin tezgâhı",
    liveSummary: "Canlı yüzey. Taslak üretilir, jeton bakiyeden düşer.",
    imageTitle: "Görsel taslak",
    imageSummary: "Kart düzeni hazır; görsel motor bu odada ayrı sağlayıcı açmaz.",
    storyTitle: "Medya storyboard",
    storySummary: "Sahne kartları vitrindir. Sahte tam stüdyo vaadi yoktur.",
    historyTitle: "Atölye geçmişi",
    empty: "Henüz taslak veya üretim yok. Şablon seç, tezgâhtan ilk mühürü üret.",
    generationsTitle: "Üretim geçmişi",
    draftsTitle: "Taslaklar",
    succeeded: "Üretildi",
    failed: "Durdu",
  },
  workbench: {
    palette: "Palet",
    promptLabel: "Üretim metni",
    sealedBadge: "Güvenli üretim",
  },
  frozenBridge: {
    studioSettledTitle: "LLM Debit mühürlendi",
    studioSettledBody: "Üretim bakiyeden düştü.",
    generateReadyTitle: "Bakiye yetti",
    generateReadyBody: "Üretime devam et.",
  },
} as const;

export type StudioDebitStepKey = (typeof STUDIO_SEN.debit.steps)[number]["key"];

export function studioGenerateCitizenError(status: number, message?: string): string {
  if (status === 413 || message?.includes("tavanı aşıldı")) {
    return STUDIO_SEN.generate.ceiling;
  }
  if (message?.includes("Yetersiz bakiye")) {
    return STUDIO_SEN.generate.insufficient;
  }
  if (status === 400 && (message?.includes("katalogda henüz yok") || message?.includes("katalogda yok"))) {
    return STUDIO_SEN.generate.catalogMissing;
  }
  return message?.trim() || STUDIO_SEN.generate.fail;
}
