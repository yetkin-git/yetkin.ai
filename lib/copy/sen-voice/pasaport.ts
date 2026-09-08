/** Rail SEN aksı — pasaport sığınağı. Müze sen-voice kopyalanmaz. */
export const PASAPORT_SEN = {
  eyebrow: "Vatandaş kanıt sığınağı",
  title: "Pasaport",
  description:
    "Doğrulanmış Rozetin Pasaport Vize Damgası olarak burada listelenir. Salt okunur — damga eklenmez. Teklif Kapısı Kariyer’de açılır.",
  auth: "Pasaport sicili oturum ister. Sahte damga basılmaz.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Sicil şu an okunamadı. Biraz sonra yenile; uydurma damga basılmaz.",
  stats: {
    totalLabel: "Pasaport Vize Damgası",
    totalHintLive: "Toplam damga",
    totalHintPending: "Bağlanınca sicil dolar",
    guest: "Oturum yok",
    latestLabel: "Son damga",
    latestHintLive: "Son Pasaport Vize Damgası",
    latestHintEmpty: "Uydurma başlık yok",
    sourceLabel: "Kaynak",
    sourceHint: "Akademi sınavı kökeni",
    waiting: "Bekleniyor",
  },
  honestyTitle: "Salt okunur sığınak",
  honestyBody:
    "Bu odada damga ekleme veya düzenleme formu yoktur. Sertifika Akademi sınavından doğar; Kariyer damgayı basar. Pasaport yalnız kanıt sığınağıdır.",
  list: {
    title: "Pasaport Vize Damgası",
    eyebrow: "Salt okunur sicil",
    intro:
      "Akademi sertifikaları burada listelenir. Damgayı Kariyer basar; bu defter yalnız taşır.",
    empty:
      "Henüz damga yok. Akademi sertifikası Kariyer odasında Pasaport Vize Damgasına dönüşür; uydurma damga basılmaz.",
    sealed: "Doğrulanmış Rozet",
    doorHint: "Teklif Kapısı",
    copyVisa: "Damga anahtarını kopyala",
    hashLabel: "SHA-256 içerik özeti",
    verifyCta: "Doğrula",
    openContractCta: "Teslim sözleşmesini aç",
    openCourseCta: "Eğitime git",
  },
  growth: {
    title: "Büyüme Beşlisi Geçiş Karnesi",
    eyebrow: "Teklif Kapısı",
    intro:
      "Beş compact yetkinlik. Kazanılan damga ilgili uzmanlık belgesini açar; kazanılmamış sayfa kilitli kalır — uydurma damga basılmaz.",
    locked: "Henüz damga yok / Kilitli",
    held: "Erişim Hakkı açık",
  },
  freelancerStrip: {
    title: "Sertifika damgası",
    empty:
      "Henüz teslim damgası yok. Akademi belgesi Kariyer’de görünür; uydurma damga basılmaz.",
  },
  careerCta: "Kariyer",
  academyCta: "Akademiye git",
  freelancerCta: "Freelancer tezgâhı",
  certificatesCta: "Sertifikalarım",
  freelancerBoardCta: "Freelancer İlan Panosu",
  verifyCta: "Sertifika doğrula",
} as const;
