/** Rail SEN aksı — kariyer odası. Mühürden türetilen salt okuma vize projeksiyonu. */
export const CAREER_SEN = {
  eyebrow: "Kariyer",
  title: "Kariyer",
  description:
    "Mühründen türetilen vize ve teklif kapıları. Pasaport damgaları listeler; damgayı burası basar. Hedef rol, yetenek haritası veya mülakat oyunu yok.",
  auth: "Kariyer sayfasını görmek için giriş yap.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Kariyer bilgilerin şu an yüklenemedi. Biraz sonra sayfayı yenile.",
  ledgerTitle: "Vize defteri",
  proofsTitle: "Vize defteri",
  visasTitle: "Vize damgaları",
  proofEmpty:
    "Henüz bir vizen yok. Akademi'de bir eğitimi tamamla veya Freelancer'da bir iş teslim et — mühür burada görünür.",
  academyCta: "Akademiye git",
  freelancerCta: "Freelancer'a git",
  passportCta: "Pasaport",
  sealed: "Onaylı",
  hashLabel: "SHA-256 içerik özeti",
  hashNote: "İçerik özetidir; imza değildir.",
  proofLine: "Portföy kaydı",
  issuedLabel: "Veriliş tarihi",
  verifyCta: "Sertifikayı doğrula",
  openCourseCta: "Eğitime git",
  openContractCta: "Sözleşmeyi aç",
  copyVisa: "Belge anahtarını kopyala",
  copyHash: "Özeti kopyala",
  copied: "Kopyalandı",
  copyFail: "Kopyalanamadı",
  footnote:
    "Vize yalnız Akademi sınavı ve Freelancer tesliminden türer. Elle basılmaz. Pasaport listeler; damgayı Kariyer basar. İptal edilmiş Akademi belgesi burada görünmez.",
  footnotePassportCta: "Pasaportu aç",
  footnoteVerifyCta: "Sertifika doğrula",
  footnoteAcademyCta: "Akademiye git",
  ledger: {
    eyebrow: "Vize defteri",
    title: "Vize ve geçiş defteri",
    lead: "Mührün burada vizeye dönüşür. Paylaştığın kart doğrulanabilir bir belgedir. Sahte rozet eklenmez.",
  },
  scope: {
    eyebrow: "Teklif kapıları",
    title: "Vize-ilan tabelası",
    lead: "Açık kapı, mührünün hangi işe teklif vereceğini gösterir. Kapı elle açılmaz.",
    open: "Kapı açık",
    closed: "Kapı kapalı",
    held: "Belgen var",
    missing: "Belge yok",
  },
} as const;
