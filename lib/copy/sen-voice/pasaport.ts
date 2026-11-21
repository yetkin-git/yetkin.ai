/** Rail SEN aksı — uzmanlık portföyü. Müze sen-voice kopyalanmaz. Rota `/pasaport` durur. */
export const PASAPORT_SEN = {
  eyebrow: "Uzmanlık Portföyü",
  title: "Uzmanlık Portföyü",
  description:
    "YetkinCV Onaylı Yetenek Rozeti burada listelenir. Salt okunur — rozet eklenmez. Teklif Kapısı Kariyer’de açılır.",
  auth: "Uzmanlık Portföyü oturum ister. Sahte rozet basılmaz.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Sicil şu an okunamadı. Biraz sonra yenile; uydurma rozet basılmaz.",
  stats: {
    totalLabel: "YetkinCV Onaylı Yetenek Rozeti",
    totalHintLive: "Toplam rozet",
    totalHintPending: "Bağlanınca sicil dolar",
    guest: "Oturum yok",
    latestLabel: "Son rozet",
    latestHintLive: "Son YetkinCV Onaylı Yetenek Rozeti",
    latestHintEmpty: "Uydurma başlık yok",
    sourceLabel: "Kaynak",
    sourceHint: "YetkinCV ve kamu kanıtı",
    waiting: "Bekleniyor",
  },
  honestyTitle: "Salt okunur portföy",
  honestyBody:
    "Bu sayfada rozet ekleme veya düzenleme formu yoktur. YetkinCV puanı Kariyer (/career) sayfasında oluşur. Kamu kanıtı /vize/[id] adresindedir. Uzmanlık Portföyü yalnız kanıt listesidir.",
  list: {
    title: "YetkinCV Onaylı Yetenek Rozeti",
    eyebrow: "Salt okunur sicil",
    intro:
      "YetkinCV puanı ve kamu kanıtı burada listelenir. Rozeti Kariyer basar; bu defter yalnız taşır.",
    empty:
      "Henüz rozet yok. YetkinCV puanı Kariyer (/career) sayfasında YetkinCV Onaylı Yetenek Rozetine dönüşür. Kamu kanıtı /vize adresindedir. Uydurma rozet basılmaz.",
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
      "Henüz teslim rozeti yok. YetkinCV kanıtı Kariyer’de ve /vize adresinde görünür; uydurma rozet basılmaz.",
  },
  careerCta: "Kariyer",
  academyCta: "YetkinCV'yi aç",
  freelancerCta: "Freelancer tezgâhı",
  certificatesCta: "Sertifikalarım",
  freelancerBoardCta: "Freelancer İlan Panosu",
  verifyCta: "Kamu kanıtı",
} as const;
