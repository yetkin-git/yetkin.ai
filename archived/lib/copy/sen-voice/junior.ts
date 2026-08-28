/** Rail SEN aksı — junior odası. Müze sen-voice kopyalanmaz. */
export const JUNIOR_SEN = {
  eyebrow: "Genç meydan",
  title: "Genç meydan",
  description: "Yaş kapısı ve okul izi. Harçlık yetişkin cüzdanı değildir. 18 yaş altı iki taraflı vekâlet ister.",
  guardianCta: "Ebeveyn kalkanı",
  auth: "Meydan oturum ister. MEB izi vitrini aşağıdadır.",
  unboundBadge: "Liste henüz yüklenemedi",
  unboundBody: "Bağlantı tamamlanınca yaş kapısı burada çalışır.",
  gateTitle: "Yaş kapısı",
  pendingTitle: "Vekâlet askıda",
  pendingBody:
    "Onaylanmamış bağ. Karşı taraf davet token'ını kendi oturumuyla onaylamadan harçlık ve MEB izi açılmaz.",
  inviteTitle: "Davet token'ı",
  inviteCreate: "Davet oluştur",
  inviteAccept: "Token ile bağla",
  inviteCreateFail: "Davet oluşturulamadı.",
  inviteAcceptFail: "Davet kabul edilmedi.",
  inviteCreating: "Oluşturuluyor…",
  inviteTokenLabel: "Karşı tarafın davet token'ı",
  inviteOnce:
    "Ham token yalnız bu anda görünür. Hash saklanır. Süre dolunca veya kullanınca geçerliğini yitirir.",
  invitePending: (prefix: string) => `Askıda davet ${prefix}… Karşı onay yok; harçlık kapalı.`,
  parentLink: "Ebeveyn paneli",
  frozenBadge: "Pasif",
  frozenTitle: "Junior üretimde kapalı",
  frozenBody:
    "Veli doğrulaması ve hukuki altyapı tamamlanmadan meydan, harçlık aktarımı ve vitrin yayını dondurulur.",
  parent: {
    eyebrow: "Ebeveyn kalkanı",
    title: "Ebeveyn paneli",
    description:
      "İki taraflı davet, haftalık harçlık tavanı ve aktarım. Askıdaki bağdan nakit akmaz. Çocuk bakiyesi yetişkin cüzdanına yazılmaz.",
    backCta: "Genç meydana dön",
    shieldTitle: "Kalkan açık",
    shieldBody:
      "Vekâlet yalnız davet token'ı ve iki tarafın onayı ile ACTIVE olur. Askıdaki hesaplar maskeli; harçlık yok.",
    pendingTitle: "Askıda vekâlet daveti",
    unbound: "Liste henüz yüklenemedi.",
    wardsTitle: "Bağlı gençler",
    noWards: "ACTIVE vekâlet bağı yok.",
  },
} as const;
