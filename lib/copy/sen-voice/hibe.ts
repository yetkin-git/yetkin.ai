/** Rail SEN aksı — hibe odası. Müze sen-voice kopyalanmaz. */
export const HIBE_SEN = {
  eyebrow: "Hibe ve teşvik",
  title: "Hibe eşleştirme",
  description:
    "KOSGEB / TÜBİTAK derlemesi ve profil eşleştirme. Bu katalog canlı devlet başvurusu değildir; rehberlik sunar, sahte “anında devlet bağlantısı” vaadi yoktur.",
  metricsTitle: "Eşleşme sicili",
  matchedLabel: "Eşleşen program",
  openGuideLabel: "Açık rehber",
  catalogLabel: "Katalog",
  catalogValue: "bilgi kaydı",
  catalogHint: "Resmi başvuru bu ekrandan yapılmaz",
  sessionHint: "oturum",
  guestHint: "giriş yok",
  matchTitle: "Resmi eşleştirme",
  openGuidesTitle: "Açık rehberlerin",
  openGuidesBody: (count: number) => `${count} kayıt. Detay program sayfasındadır.`,
  unbound: "Liste henüz yüklenemedi — örnek düzen",
  corporateLead: "Kurumsal profil",
  corporateHint: "ayrı odadır; hibe rehberi şirket panelini değiştirmez.",
} as const;
