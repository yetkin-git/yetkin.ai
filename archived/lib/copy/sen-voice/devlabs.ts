/** Rail SEN aksı — DevLabs odası. Müze sen-voice kopyalanmaz. */
export const DEVLABS_SEN = {
  catalog: {
    eyebrow: "Yazılım tezgâhı",
    title: "DevLabs konsolu",
    description:
      "Projeyi, anahtar kasasını ve kod tezgâhını burada yönet. Kod tezgâhta üretilir ve denetlenir; sunucuda kod çalıştırılmaz (exec yoktur).",
    auth: "Anahtar kasası oturum ister.",
    unbound: "Liste henüz yüklenemedi",
    unboundBody: "Kasa önizlemesi düzeni gösterir. Bağlantı tamamlanınca projeler burada durur.",
    empty: "Henüz proje yok. Soldan güvenli bir deneme projesi aç; anahtar kasası önek tutar.",
    newProject: "Yeni proje",
    consoleTitle: "Proje konsolu",
    sandboxLabel: "Güvenli deneme alanı",
    vaultCta: "Anahtar kasası",
    loginLead: "Anahtar kasası için",
    loginCta: "oturum",
    loginTail: "gerekir.",
  },
  stats: {
    projectLabel: "Proje",
    benchLabel: "Deneme alanı",
    benchValue: "Güvenli",
    vaultLabel: "Kasa",
    vaultValue: "Korumalı",
    vaultHint: "anahtar bir kez görünür",
  },
  honesty: {
    title: "Yazılım tezgâhı sözleşmesi",
    eyebrow: "İcra dürüstlüğü",
    steps: [
      {
        key: "no-exec" as const,
        label: "Exec Yoktur / Çalıştırma Yapılmaz",
        detail:
          "Kod tezgâhta üretilir ve denetlenir; sunucuda kod çalıştırılmaz (exec yoktur).",
      },
      {
        key: "vault" as const,
        label: "Güvenli HMAC Anahtar Kasası",
        detail:
          "API anahtarı yalnız bir kez gösterilir (yrk_ öneki); veritabanında yalnız hash saklanır.",
      },
      {
        key: "flow" as const,
        label: "Üretim Akışı",
        detail: "Proje Oluştur → Üret (Generate) → Linter / Denetle → Çıktı Kasa / Artifact.",
      },
    ],
  },
  flow: {
    eyebrow: "Üretim akışı",
    title: "Tezgâh basamakları",
    steps: [
      { key: "project" as const, label: "Proje Oluştur" },
      { key: "generate" as const, label: "Üret (Generate)" },
      { key: "lint" as const, label: "Linter / Denetle" },
      { key: "artifact" as const, label: "Çıktı Kasa / Artifact" },
    ],
  },
  vitrine: {
    integrations: [
      { label: "Konsol", hint: "Proje yüzeyi" },
      { label: "Kasa", hint: "Anahtar koruması" },
      { label: "Önek", hint: "Görünen iz" },
      { label: "Kuyruk", hint: "İşler sırayla yürür" },
    ],
    sandboxEyebrow: "Deneme alanı",
    sandboxTitle: "Güvenli tezgâh",
    sandboxBody: "Proje ve anahtar kasası bu odada durur. Kod tezgâhı sade tutulur. Exec yoktur.",
    sandboxPreview: `alan: güvenli deneme
yazım: yalnızca Yetkin defteri
anahtar: korumalı önek
icra: exec yoktur`,
    vaultEyebrow: "Önizleme",
    vaultTitle: "Kasa konsolu",
    vaultBody: "Düz metin bir kez gösterilir. Sonra yalnızca kısa iz kalır. Veritabanında yalnız hash saklanır.",
    vaultPreview: "yrk_live_••••8f2a",
    lineEyebrow: "Önizleme",
    lineTitle: "Güvenli hat",
    lineBody: "Proje açma ve anahtar basma/iptal bu odada yürür. Sahte dış ödeme vaadi yoktur.",
    linePreview: "Anahtar bas · iptal et",
  },
  vault: {
    issueTitle: "Anahtar bas",
    issueEyebrow: "Kasa",
    issueHint:
      "API anahtarı yalnız bir kez gösterilir (yrk_ öneki); veritabanında yalnız hash saklanır.",
    listTitle: "Kasa",
    listEyebrow: "Anahtar kasası",
    empty: "Anahtar yok. Soldan basılan anahtar burada önek olarak durur.",
    onceBanner: "Düz metin yalnız bu anda görünür. Kopyala, sonra gizle. Yenilenmez.",
    onceLead: "Düz metin bir kez gösterilir:",
    copy: "Anahtarı kopyala",
    copied: "Anahtar kopyalandı.",
    copyFail: "Panoya kopyalanamadı — anahtarı elle kopyala.",
    hide: "Anahtarı gizle",
    hidden: (prefix: string) =>
      `Anahtar gizlendi. Bundan sonra yalnız önek görünür: ${prefix}…`,
    issueCta: "Anahtar bas",
    issuing: "Basılıyor…",
    issueFail: "Anahtar basılamadı.",
    nameLabel: "Anahtar adı",
    revoke: "Anahtarı iptal et",
    revoking: "İptal…",
    revoked: "İptal edildi",
    active: "Aktif",
    cancelled: "İptal",
  },
  bench: {
    title: "Kod tezgâhı",
    eyebrow: "S59-A · exec yok",
    needKey: "Önce aktif bir kasa anahtarı bas; artifact anahtara bağlanır.",
    keyLabel: "Kasa anahtarı",
    placeholder: "Üretilecek kodu tarif et. Exec yok; çıktı linter + SHA256 artifact olur.",
    lintHint: "Anayasal linter: float/kuruş, çiğ SQL, güvenlik. Kod çalıştırılmaz (exec yoktur).",
    cta: "Kod üret",
    pending: "Üretiliyor…",
    fail: "Kod üretimi tamamlanamadı.",
  },
  artifacts: {
    title: "Artifact mühürleri",
    linterOk: "yeşil",
    linterFail: "ihlal",
  },
  project: {
    eyebrow: "DevLabs · Güvenli deneme",
    back: "Konsola dön",
    descriptionSuffix:
      "Kod tezgâhta üretilir ve denetlenir; sunucuda kod çalıştırılmaz (exec yoktur).",
  },
  create: {
    name: "Ad",
    summary: "Özet",
    cta: "Güvenli deneme projesi aç",
    pending: "Açılıyor…",
    fail: "Proje açılamadı.",
  },
} as const;

export type DevLabsHonestyStepKey = (typeof DEVLABS_SEN.honesty.steps)[number]["key"];
export type DevLabsFlowStepKey = (typeof DEVLABS_SEN.flow.steps)[number]["key"];
