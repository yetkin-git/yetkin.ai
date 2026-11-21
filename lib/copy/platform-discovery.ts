/**
 * Platform keşif bağları — yasal footer sicilinden (`LEGAL_FOOTER_LINKS`) ayrıdır.
 * Kamu tabanı ve ürün vitrin şeridinde "Platform & Keşif" satırını besler.
 */
export const PLATFORM_DISCOVERY_NAV_LABEL = "Platform & Keşif" as const;

export const PLATFORM_DISCOVERY_LINKS = [
  {
    href: "/rehber",
    label: "Nasıl Çalışır?",
    title: "Görsel iş akışı ve süreç şeması",
  },
  {
    href: "/fiyatlandirma",
    label: "Fiyatlandırma",
    title: "Fiyatlandırma",
  },
  {
    href: "/tetkik",
    label: "Ücretsiz Site Tetkiki",
    title: "Ücretsiz site tetkiki",
  },
  {
    href: "/sozluk",
    label: "Sözlük",
    title: "Sözlük",
  },
] as const;
