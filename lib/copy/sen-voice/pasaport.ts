/** Rail SEN aksı — uzmanlık portföyü. Müze sen-voice kopyalanmaz. Rota `/pasaport` durur. */
export const PASAPORT_SEN = {
  eyebrow: "Uzmanlık Portföyü",
  title: "Uzmanlık Portföyü",
  description:
    "Doğrulanmış Freelancer Rozeti burada listelenir. Salt okunur — rozet eklenmez. Teklif Kapısı Kariyer’de açılır.",
  auth: "Uzmanlık Portföyü oturum ister. Sahte rozet basılmaz.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Sicil şu an okunamadı. Biraz sonra yenile; uydurma rozet basılmaz.",
  stats: {
    totalLabel: "Doğrulanmış Freelancer Rozeti",
    totalHintLive: "Toplam rozet",
    totalHintPending: "Bağlanınca sicil dolar",
    guest: "Oturum yok",
    latestLabel: "Son rozet",
    latestHintLive: "Son Doğrulanmış Freelancer Rozeti",
    latestHintEmpty: "Uydurma başlık yok",
    sourceLabel: "Kaynak",
    sourceHint: "Akademi sınavı kökeni",
    waiting: "Bekleniyor",
  },
  honestyTitle: "Salt okunur portföy",
  honestyBody:
    "Bu sayfada rozet ekleme veya düzenleme formu yoktur. Sertifika Akademi sınavından doğar; Kariyer rozeti basar. Uzmanlık Portföyü yalnız kanıt listesidir.",
  list: {
    title: "Doğrulanmış Freelancer Rozeti",
    eyebrow: "Salt okunur sicil",
    intro:
      "Akademi sertifikaları burada listelenir. Rozeti Kariyer basar; bu defter yalnız taşır.",
    empty:
      "Henüz rozet yok. Akademi sertifikası Kariyer sayfasında Doğrulanmış Freelancer Rozetine dönüşür; uydurma rozet basılmaz.",
    sealed: "Doğrulanmış Rozet",
    doorHint: "Teklif Kapısı",
    copyVisa: "Rozet anahtarını kopyala",
    hashLabel: "SHA-256 içerik özeti",
    verifyCta: "Doğrula",
    openContractCta: "Teslim sözleşmesini aç",
    openCourseCta: "Eğitime git",
  },
  growth: {
    title: "Büyüme Beşlisi Geçiş Karnesi",
    eyebrow: "Teklif Kapısı",
    intro:
      "Beş compact yetkinlik. Kazanılan rozet ilgili uzmanlık belgesini açar; kazanılmamış sayfa kilitli kalır — uydurma rozet basılmaz.",
    locked: "Henüz rozet yok / Kilitli",
    held: "Erişim Hakkı açık",
  },
  freelancerStrip: {
    title: "Sertifika rozeti",
    empty:
      "Henüz teslim rozeti yok. Akademi belgesi Kariyer’de görünür; uydurma rozet basılmaz.",
  },
  careerCta: "Kariyer",
  academyCta: "Akademiye git",
  freelancerCta: "Freelancer tezgâhı",
  certificatesCta: "Sertifikalarım",
  freelancerBoardCta: "Freelancer İlan Panosu",
  verifyCta: "Sertifika doğrula",
} as const;
