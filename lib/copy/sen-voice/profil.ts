/** Rail SEN aksı — kimlik sığınağı. Müze sen-voice kopyalanmaz. */
export const PROFIL_SEN = {
  eyebrow: "Kimlik",
  title: "Profil",
  description:
    "Bu hesap kime ait, kimlik kartından okunur. Görünen adını güncellersin; e-posta oturum katmanında kalır. Liyakat özeti Pasaport sicilinden salt okunur.",
  stats: {
    nameLabel: "Görünen ad",
    nameHintSet: "Kartta görünür",
    nameHintEmpty: "Boş gelebilir; buradan yazılır",
    localeLabel: "Dil",
    localeHint: "Dil ve saat dilimin",
    joinedLabel: "Kayıt",
    joinedHintLive: "Kayıt yılı",
    joinedHintPending: "Kart bağlanınca yıl görünür",
    guest: "Oturum yok",
    waiting: "Bekleniyor",
  },
  auth: "Kimlik kartı oturum ister. Sahte profil basılmaz.",
  /** Sicil okunamadığında vatandaşa dürüst, gürültüsüz mesaj — geliştirici rozeti yok. */
  loadSoft: "Kimlik şu an okunamadı. Biraz sonra yenile; uydurma ad basılmaz. Oturum e-postası dürüsttür.",
  missingSoft:
    "Oturum var; kimlik kartı henüz oluşmadı. Kart dolunca adın burada durur. E-posta oturumdan gösterilir.",
  passportCta: "Pasaport sığınağı",
  walletCta: "Cüzdanı aç",
  careerCta: "Mücevher vitrini",
  verifyCta: "Sertifika doğrula",
  dashboardCta: "Anasayfaya dön",
  honestyTitle: "Kimlik dürüstlüğü",
  honestyBody:
    "Görünen ad kimlik kartına yazılır; e-posta oturumla senkron kalır. Şifre bu kartta durmaz. Freelancer vitrini ve KYC buraya eklenmez. Vize damgası Kariyer basar; burada yalnız özet okunur.",
  card: {
    title: "Kimlik kartı",
    eyebrow: "Hesap",
    intro: "Görünen ad oturum sahibine aittir. E-posta oturumdan gelir; bu form onu yazmaz.",
    name: "Görünen ad",
    email: "E-posta",
    locale: "Dil",
    timeZone: "Saat dilimi",
    createdAt: "Kayıt tarihi",
  },
  merit: {
    title: "Liyakat özeti",
    eyebrow: "Kanıt özeti",
    intro:
      "Mühür sayısı ve vize kökeni Pasaport sicilinden gelir. Burada damga basılmaz; uydurma rozet yok.",
    loadSoft: "Liyakat sicili şu an okunamadı. Biraz sonra yenile; uydurma mühür basılmaz.",
    empty: "Henüz mühür yok. Akademi veya Freelancer kanıtı damgaya dönüşünce burada özetlenir.",
    countLabel: "Toplam mühür",
    latestLabel: "Son vize",
    sourcesLabel: "Köken",
    verifyCta: "Son mührü doğrula",
  },
} as const;
