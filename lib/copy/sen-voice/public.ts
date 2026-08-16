/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: "Yetkin Rail",
    title: "Güvenli emek platformu",
    description: "On iki oda, tek cüzdan. Paran, işin ve üretimin aynı güvenli hesapta durur.",
    enterCta: "Anasayfaya gir",
    loginCta: "Giriş",
    trustEyebrow: "Nasıl korunursun",
    trustTitle: "Güven taahhüdü",
    trust: [
      "Kimliğin güvenli oturumla mühürlenir",
      "Tutarlar Türk Lirası (₺) olarak gösterilir",
      "Emanet kilidi bakiyeni ayrı bir hesap gibi göstermez",
      "Her yapay zekâ üretimi tek kapıdan geçer",
    ],
    roomsKicker: "On iki asil oda",
    legalCta: "Hukuk",
    registerCta: "Kayıt",
  },
  error: {
    eyebrow: "Yetkin Rail",
    title: "Bir şeyler ters gitti",
    description: "Sayfa yüklenemedi. Tekrar dene veya ana sayfaya dön.",
    retry: "Tekrar dene",
    homeCta: "Ana sayfa",
    codeLabel: "Kod:",
  },
  notFound: {
    eyebrow: "404",
    title: "Sayfa bulunamadı",
    description: "Bu adres Yetkin Rail’de yok. Ana sayfaya dön.",
    homeCta: "Ana sayfa",
  },
} as const;
