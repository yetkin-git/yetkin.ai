/**
 * Dijital sağlık skoru. Toplam 100. Eksik sinyal puanı düşürür.
 * Model bu tabloyu değiştirmez; anlatım katmanı yalnız dondurulmuş sayıyı okur.
 */

export const TETKIK_MAX_SCORE = 100;
export const TETKIK_TIMEOUT_MS = 8_000;
export const TETKIK_MAX_REDIRECTS = 3;
/** 1,5 MB. Üstü okunmaz; JavaScript çalıştırılmaz. */
export const TETKIK_MAX_HTML_BYTES = 1_572_864;
/** 500 KB altı tam puan. */
export const TETKIK_HTML_BUDGET_BYTES = 500 * 1024;
/** İlk bayt 800 ms altı tam puan. */
export const TETKIK_TTFB_BUDGET_MS = 800;
export const TETKIK_USER_AGENT = "yetkin-tetkik/1 (+https://yetkin.ai/tezgah)";

export const TETKIK_DISCLAIMER =
  "Ölçüm ana sayfanın ilk HTML’idir; sonradan çizilen vitrin bu skora girmez.";

export const TETKIK_REJECTED_MESSAGE =
  "Adres https ile başlamalı ve herkese açık bir site olmalı.";

export const TETKIK_WEIGHTS = {
  title: 8,
  metaDescription: 8,
  h1: 8,
  headingOrder: 6,
  viewport: 10,
  langTr: 4,
  https: 8,
  whatsappOrPhone: 14,
  emailOrForm: 6,
  cta: 10,
  imageAlt: 6,
  ttfb: 6,
  htmlSize: 6,
} as const;

export type TetkikCheckId = keyof typeof TETKIK_WEIGHTS;

export const TETKIK_CHECK_ORDER: readonly TetkikCheckId[] = [
  "title",
  "metaDescription",
  "h1",
  "headingOrder",
  "viewport",
  "langTr",
  "https",
  "whatsappOrPhone",
  "emailOrForm",
  "cta",
  "imageAlt",
  "ttfb",
  "htmlSize",
];

/** İskeletin reklamdan önce kapanması gereken kapıları. */
export const TETKIK_SHOP_GATES: readonly TetkikCheckId[] = [
  "title",
  "h1",
  "headingOrder",
  "viewport",
  "https",
  "htmlSize",
];

export const TETKIK_STRUCTURAL: readonly TetkikCheckId[] = [
  "title",
  "metaDescription",
  "h1",
  "headingOrder",
  "viewport",
  "langTr",
  "https",
  "imageAlt",
  "ttfb",
  "htmlSize",
];

export const TETKIK_CONVERSION: readonly TetkikCheckId[] = ["whatsappOrPhone", "emailOrForm", "cta"];

export const TETKIK_LABELS: Record<TetkikCheckId, string> = {
  title: "Başlık",
  metaDescription: "Meta açıklama",
  h1: "Tek ana başlık",
  headingOrder: "Başlık sırası",
  viewport: "Mobil çerçeve",
  langTr: "Türkçe dil işareti",
  https: "HTTPS",
  whatsappOrPhone: "WhatsApp veya telefon",
  emailOrForm: "E-posta veya form",
  cta: "Belirgin çağrı",
  imageAlt: "Görsel alt metni",
  ttfb: "İlk bayt",
  htmlSize: "Sayfa boyu",
};

export const TETKIK_OPPORTUNITY: Record<TetkikCheckId, string> = {
  title: "Başlık yok ya da vitrin boyunda değil; arama sonucu esnafın adını taşımaz.",
  metaDescription: "Arama açıklaması yok veya boyu uygun değil; sonuç listesinde dükkan tek cümleyle durmuyor.",
  h1: "Sayfada tek bir ana başlık yok; gelen kişi ne sattığını ilk bakışta okuyamaz.",
  headingOrder: "Başlık sırası bozulmuş; sayfa okunurken konu atlanıyor.",
  viewport: "Mobil çerçeve yok; telefon ekranında vitrin taşıyor.",
  langTr: "Sayfa dili Türkçe işaretli değil; arama dükkanı yanlış dilde görür.",
  https: "Adres güvenli https değil; tarayıcı ziyaretçiyi uyarır.",
  whatsappOrPhone: "WhatsApp yok; ilanı gören kişi siteden aramadan çıkıyor.",
  emailOrForm: "E-posta veya form yok; yazmak isteyen kişi kapıda kalır.",
  cta: "Belirgin bir çağrı yok; ziyaretçi sonraki adımı göremez.",
  imageAlt: "Görsellerin bir kısmında alt metin yok; görsel vitrin aramada boş kalır.",
  ttfb: "İlk bayt 800 milisaniyenin üstünde; sayfa açılışı uzuyor.",
  htmlSize: "Sayfa 500 KB üstünde; şişkin HTML telefonu yorar.",
};
