/** Uzman tezgâh seçenekleri. İstemci katalog ile motor aynı listeyi okur. */

export const STUDIO_MARKETS = [
  { value: "trendyol", label: "Trendyol" },
  { value: "amazon", label: "Amazon" },
  { value: "both", label: "Trendyol ve Amazon" },
] as const;

export const STUDIO_BACKGROUNDS = [
  { value: "white", label: "Beyaz fon" },
  { value: "colored", label: "Renkli veya sahne" },
] as const;

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

export const SAAS_WIDGETS = [
  { value: "cargo", label: "Kargo desi ve beden hesabı" },
  { value: "order", label: "Özel sipariş formu" },
  { value: "counter", label: "Kampanya sayacı" },
  { value: "api", label: "API entegrasyon betiği" },
] as const;

export type StudioMarketId = (typeof STUDIO_MARKETS)[number]["value"];
export type StudioBackgroundId = (typeof STUDIO_BACKGROUNDS)[number]["value"];
export type SaasWidgetId = (typeof SAAS_WIDGETS)[number]["value"];
