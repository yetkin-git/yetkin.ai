/** Uzman tezgâh seçenekleri. İstemci katalog ile motor aynı listeyi okur. */

/** Sahne = hedef pazaryeri/reklam standardı. Kullanıcı piksel uydurmaz. */
export const STUDIO_SCENES = [
  {
    value: "trendyol-white",
    label: "Trendyol 2:3 Beyaz Fon",
    aspectRatio: "2:3",
    widthPx: 1200,
    heightPx: 1800,
    background: "white",
    marketLabel: "Trendyol",
  },
  {
    value: "amazon-white",
    label: "Amazon 1:1 Saf Beyaz Fon",
    aspectRatio: "1:1",
    widthPx: 1600,
    heightPx: 1600,
    background: "white",
    marketLabel: "Amazon",
  },
  {
    value: "lifestyle",
    label: "Yaşam Tarzı Stüdyo",
    aspectRatio: "4:5",
    widthPx: 1080,
    heightPx: 1350,
    background: "colored",
    marketLabel: "Yaşam Tarzı",
  },
  {
    value: "ad-square",
    label: "Reklam Karesi",
    aspectRatio: "1:1",
    widthPx: 1080,
    heightPx: 1080,
    background: "colored",
    marketLabel: "Reklam",
  },
] as const;

/** @deprecated Sahne listesi kullanılır; köprü uyumu için tutulur. */
export const STUDIO_MARKETS = [
  { value: "trendyol", label: "Trendyol" },
  { value: "amazon", label: "Amazon" },
  { value: "both", label: "Trendyol ve Amazon" },
] as const;

/** @deprecated Sahne listesi kullanılır. */
export const STUDIO_BACKGROUNDS = [
  { value: "white", label: "Beyaz fon" },
  { value: "colored", label: "Renkli veya sahne" },
] as const;

/** @deprecated Sahne listesi kullanılır. */
export const STUDIO_OVERLAYS = [
  { value: "hayir", label: "Yok" },
  { value: "evet", label: "Var" },
] as const;

export const STUDIO_GALLERY_COUNTS = [
  { value: "3", label: "3 kare" },
  { value: "4", label: "4 kare" },
  { value: "5", label: "5 kare" },
  { value: "6", label: "6 kare" },
  { value: "7", label: "7 kare" },
  { value: "8", label: "8 kare" },
] as const;

/** 8 mikro-SaaS iş aracı — F2.7 kataloğu. */
export const SAAS_WIDGETS = [
  { value: "cargo", label: "Kargo & Desi Hesaplayıcı" },
  { value: "margin", label: "Kâr Marjı, KDV & Pazaryeri Komisyon Hesaplayıcı" },
  { value: "quote", label: "Müşteri Hızlı Fiyat / Paket Hesaplayıcı" },
  { value: "order", label: "Sipariş & WhatsApp Ön Talep Formu" },
  { value: "booking", label: "Randevu & Ön Görüşme Talep Bileşeni" },
  { value: "counter", label: "Kampanya Geri Sayım & Stok Uyarı Şeridi" },
  { value: "faq", label: "Etkileşimli SSS & Müşteri Karar Asistanı" },
  { value: "api", label: "Canlı JSON / Duyuru Veri Kartı" },
] as const;

export const SAAS_PLATFORMS = [
  { value: "html", label: "Genel HTML / Hazır E-Ticaret" },
  { value: "wordpress", label: "WordPress" },
  { value: "react", label: "React / Next.js" },
] as const;

export type StudioSceneId = (typeof STUDIO_SCENES)[number]["value"];
export type StudioMarketId = (typeof STUDIO_MARKETS)[number]["value"];
export type StudioBackgroundId = (typeof STUDIO_BACKGROUNDS)[number]["value"];
export type SaasWidgetId = (typeof SAAS_WIDGETS)[number]["value"];
export type SaasPlatformId = (typeof SAAS_PLATFORMS)[number]["value"];

export function studioSceneById(id: string): (typeof STUDIO_SCENES)[number] | null {
  return STUDIO_SCENES.find((scene) => scene.value === id) ?? null;
}

/** Pazaryeri köprüsünden gelen market → sahne. */
export function studioSceneFromMarket(market: string): StudioSceneId {
  if (market === "amazon") {
    return "amazon-white";
  }
  if (market === "ad-square" || market === "reklam") {
    return "ad-square";
  }
  if (market === "lifestyle") {
    return "lifestyle";
  }
  return "trendyol-white";
}

export function saasWidgetById(id: string): (typeof SAAS_WIDGETS)[number] | null {
  return SAAS_WIDGETS.find((widget) => widget.value === id) ?? null;
}
