/** Rail SEN aksı — arena odası. Müze sen-voice kopyalanmaz. */
export const ARENA_SEN = {
  eyebrow: "Ödüllü çağrılar",
  title: "Ödüllü çağrılar",
  description: "İhale aç, ödül havuzunu emanete kilitle, teslimi al ve kazananı sen dağıt.",
  openCta: "İhale aç",
  liveHint: (count: number) => `${count} açık ihale emanette kilitli.`,
  emptyHint: "Açık havuz yok. Vitrin kartları sahte emanete kilitlemez.",
  stats: {
    openLabel: "Açık ihale",
    poolLabel: "Havuz",
    poolValue: "emanet",
    trackLabel: "Takip",
    trackValue: "Tur sırası",
    trackHint: "Tur kapanışı kuyruk anahtarları açıkken işlenir; aksi halde tur bu ekranda durur.",
  },
  unbound: "Liste henüz yüklenemedi — örnek düzen",
  detail: {
    submissionsTitle: "Teslimler",
    submissionsEmpty: "Henüz teslim yok.",
    submissionsHidden: "Teslim metinleri yalnız ihale sahibine açıktır. Başkasının teslimi bu ekranda yok.",
    awardsTitle: "Ödüller",
    submitTitle: "Teslim et",
    refundTitle: "İade",
  },
  create: {
    eyebrow: "Ödüllü çağrılar",
    title: "İhale aç",
    description:
      "Ödül havuzu açılışta emanete kilitlenir. Tur kapanışı kuyruk anahtarları açıkken işlenir; sahte kapanış yok.",
    backCta: "Arenaya dön",
  },
} as const;
