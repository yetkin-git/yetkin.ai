/** Rail SEN aksı — kariyer odası. Müze sen-voice kopyalanmaz. */
export const CAREER_SEN = {
  eyebrow: "Kariyer",
  title: "Vize ve Geçiş Defteri",
  description:
    "Kariyer vize basar; CV editörü değildir. Damga Akademi sınavı ve Freelancer tesliminden düşer. Pasaport sığınağı mühürlerini taşır.",
  auth: "Vize defteri oturum ister.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Sicil şu an okunamadı. Biraz sonra yenile; uydurma damga basılmaz.",
  ledgerTitle: "Vize ve Geçiş Defteri",
  /** Geriye dönük alias — ledgerTitle ile aynı. */
  proofsTitle: "Vize ve Geçiş Defteri",
  visasTitle: "Mühürlü vizeler",
  portfolioTitle: "Portföy",
  proofEmpty:
    "Henüz mühür yok. Akademi’de sınavı geç veya Freelancer’da teslimi tamamla — damga otomatik düşer.",
  academyCta: "Akademiye git",
  freelancerCta: "Freelancer tezgâhı",
  passportCta: "Pasaport sığınağı",
  sealed: "Mühürlü",
  hashLabel: "SHA-256 içerik özeti",
  hashNote: "İçerik özetidir; imza değildir.",
  proofLine: "Mühürlü kanıt",
  issuedLabel: "Damga",
  verifyCta: "Özeti doğrula",
  /** Akademi damgası → kurs detayı (slug çözülürse). */
  openCourseCta: "Akademi dersine git",
  /** Freelancer teslim damgası → sözleşme detayı. */
  openContractCta: "Teslim sözleşmesini aç",
  doorHint: "Bu vize ile açılan kapı: Freelancer Nitelikli Teklif",
  copyVisa: "Vize anahtarını kopyala",
  copyHash: "Özeti kopyala",
  copied: "Kopyalandı",
  copyFail: "Kopyalanamadı",
  footnote:
    "Damgayı Kariyer basar; Pasaport sığınağı mühürlerini taşır. İkisi aynı sicilin iki yüzüdür. İptal edilmiş akademi mührü defterde görünmez.",
  footnotePassportCta: "Pasaport sığınağını aç",
  footnoteVerifyCta: "Sertifika doğrula",
  footnoteAcademyCta: "Akademiye git",
  scope: {
    eyebrow: "Vize-ilan tabelası",
    title: "Bu vize hangi ilanları açar?",
    lead:
      "Teklif kapısı dikey kapsama bağlıdır. Aşağıdaki kurslardan biri mühürlenince o dikeyin ilanları açılır. SWOT, mülakat veya pusula vize basmaz.",
    open: "Kapı açık",
    closed: "Kurs eksik",
    missingCta: "Eksik kursu aç",
    freelancerCta: "Açık ilanları gör",
  },
} as const;
