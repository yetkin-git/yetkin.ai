import type { MetadataRoute } from "next";
import { YETKIN_BRAND } from "@/lib/copy/brand";

/**
 * S-04 — PWA manifesti (`/manifest.webmanifest`).
 *
 * Önce manifest hiç yoktu: "Ana ekrana ekle" akışı tanımsız, paylaşımda gri kutu
 * görünüyordu. Varlıklar zaten repoda duruyordu — `app/icon.svg` (marka SVG) ve
 * `app/apple-icon.png` (180×180) — yani "yapılmış işin yarısı görünmüyordu".
 *
 * Next.js dosya kuralı: `app/manifest.ts` otomatik olarak `/manifest.webmanifest`
 * rotasına bağlanır ve `app/layout.tsx` içine `<link rel="manifest">` basılır.
 *
 * Kararlar:
 * - `display: "browser"`: bu bir kurumsal **iş aracıdır**, oyun değil. `standalone`
 *   vaadi (tam ekran, adres çubuğu yok) bugün karşılanmıyor; yalan vaat yazılmaz.
 * - `start_url: "/"` ve `scope: "/"`: kamu iniş sayfası tek giriş noktası.
 * - `background_color` / `theme_color` = zemin tokenı (`--background: #eef2f7`),
 *   `app/layout.tsx` `viewport.themeColor` ile aynı değer.
 * - `icons` yalnız gerçekten var olan dosyaları listeler. Maskable ikon yoksa
 *   `"purpose": "maskable"` yazılmaz.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${YETKIN_BRAND} — yapay zeka iş araçları`,
    short_name: YETKIN_BRAND,
    description:
      "AI Tezgâh, e-ticaret yönetimi, hibe bulucu ve YetkinCV. KOBİ'ler ve profesyoneller için pratik yapay zeka iş araçları.",
    lang: "tr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#eef2f7",
    theme_color: "#eef2f7",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
