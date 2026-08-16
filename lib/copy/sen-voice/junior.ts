/** Rail SEN aksı — junior odası. Müze sen-voice kopyalanmaz. */
export const JUNIOR_SEN = {
  eyebrow: "Genç meydan",
  title: "Genç meydan",
  description: "Yaş kapısı ve okul izi. Harçlık yetişkin cüzdanı değildir. 18 yaş altı ebeveyn onayı ister.",
  guardianCta: "Ebeveyn kalkanı",
  auth: "Meydan oturum ister. MEB izi vitrini aşağıdadır.",
  unboundBadge: "Liste henüz yüklenemedi",
  unboundBody: "Bağlantı tamamlanınca yaş kapısı burada çalışır.",
  gateTitle: "Yaş kapısı",
  pendingTitle: "Ebeveyn onayı bekleniyor",
  pendingBody: (guardianUserId: string) =>
    `Vekâlet ${guardianUserId} hesabında. Onay sonrası MEB izi ve harçlık açılır.`,
  parentLink: "Ebeveyn paneli",
  parent: {
    eyebrow: "Ebeveyn kalkanı",
    title: "Ebeveyn paneli",
    description: "Vekâlet onayı, haftalık harçlık tavanı ve aktarım. Çocuk bakiyesi yetişkin cüzdanına yazılmaz.",
    backCta: "Genç meydana dön",
    shieldTitle: "Kalkan açık",
    shieldBody:
      "Vekâlet onayı, haftalık tavan ve harçlık aktarımı bu panelde. Çocuk bakiyesi yetişkin cüzdanına yazılmaz.",
    unbound: "Liste henüz yüklenemedi.",
    wardsTitle: "Bağlı gençler",
  },
} as const;
