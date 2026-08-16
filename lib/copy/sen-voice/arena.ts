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
    trackValue: "Güvenli kuyruk",
    trackHint: "Turlar sırayla kapanır",
  },
  unbound: "Liste henüz yüklenemedi — örnek düzen",
  create: {
    eyebrow: "Ödüllü çağrılar",
    title: "İhale aç",
    description: "Ödül havuzu açılışta emanete kilitlenir. Tur kapanışı arka planda güvenle işlenir.",
    backCta: "Arenaya dön",
  },
} as const;
