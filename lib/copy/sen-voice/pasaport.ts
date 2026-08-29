/** Rail SEN aksı — pasaport sığınağı. Müze sen-voice kopyalanmaz. */
export const PASAPORT_SEN = {
  eyebrow: "Vatandaş kanıt sığınağı",
  title: "Pasaport",
  description:
    "Damgayı Kariyer basar; bu sığınak mühürlü sicilini taşır. Salt okunur — vize eklenmez.",
  auth: "Pasaport sicili oturum ister. Sahte vize basılmaz.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Sicil şu an okunamadı. Biraz sonra yenile; uydurma mühür basılmaz.",
  stats: {
    totalLabel: "Toplam Mühür",
    totalHintLive: "Toplam Mühür",
    totalHintPending: "Bağlanınca sicil dolar",
    guest: "Oturum yok",
    latestLabel: "Son Vize",
    latestHintLive: "Son Vize",
    latestHintEmpty: "Uydurma başlık yok",
    sourceLabel: "Kaynak",
    sourceHint: "Akademi veya Freelancer kökeni",
    waiting: "Bekleniyor",
  },
  honestyTitle: "Salt okunur sığınak",
  honestyBody:
    "Bu odada vize ekleme veya düzenleme formu yoktur. Sertifika Akademi sınavından, teslim mührü freelancer serbest bırakmasından doğar; Kariyer damgayı basar. Pasaport yalnız kanıt sığınağıdır.",
  list: {
    title: "Mühür Defteri & Liyakat Sicili",
    eyebrow: "Salt okunur sicil",
    intro:
      "Akademi sertifikaları ve Freelancer teslim mühürleri burada listelenir. Damgayı Kariyer basar; bu defter yalnız taşır.",
    empty:
      "Henüz mühür yok. Akademi sertifikası ve freelancer teslim mührü Kariyer odasında damgaya dönüşür; uydurma vize basılmaz.",
    sealed: "Mühürlü",
    doorHint: "Bu vize ile açılan kapı: Freelancer Nitelikli Teklif",
    copyVisa: "Vize anahtarını kopyala",
    hashLabel: "SHA-256 içerik özeti",
    verifyCta: "Doğrula",
    openContractCta: "Teslim sözleşmesini aç",
  },
  careerCta: "Kariyer Planlama & Yol Haritası",
  academyCta: "Akademiye git",
  freelancerCta: "Freelancer tezgâhı",
  verifyCta: "Sertifika doğrula",
} as const;
