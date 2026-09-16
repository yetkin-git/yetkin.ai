# PERFORMANS RAPORU — yetkin.ai Amiral hız mühürü

Tarih: 2026-09-16  
Kaynak: Pingdom Website Speed Test — canlı `https://yetkin.ai/`  
Hedef: **B 84 → A 95+**  
İlkeler: Sıfır Risk (HTML `no-store` korunur) · Kenar güvenlik başlıkları aynı

---

## Canlı taban (operasyon öncesi)

| Ölçüt | Değer |
|-------|--------|
| Pingdom puan | **B 84** |
| Gzip / Brotli | **F 0** — «Bileşenleri gzip ile sıkıştırın» |
| Expires / Cache-Control | **B 89** — «Son kullanma tarihi başlıklarını ekleyin» |
| HTTP istek | **C 72** — 13 istek |
| Kenar | Cloudflare → Vercel (`TRUSTED_PROXY_HOPS=2`) |

Canlı `curl` (IST, `Accept-Encoding: gzip` / `br`) 16 Eylül 2026:

| Gövde | Content-Encoding | Cache-Control |
|-------|------------------|---------------|
| HTML `/` | gzip **ve** br | `private, no-store` (kişiselleştirilmiş kabuk; doğru) |
| `/_next/static/*` JS/CSS | gzip | `public, max-age=31536000, immutable` (zaten vardı) |
| `/icon.svg`, `/apple-icon.png`, `/favicon.ico`, `/paytr-logo.svg` | svg/ico gzip; PNG sıkıştırılmaz | **`max-age=14400`** — Pingdom B 89 kaynağı |
| `/academy/cinema/*`, mühürlü MP3 | (binary) | immutable (zaten vardı) |
| `/cdn-cgi/.../email-decode.min.js` | Cloudflare Email Obfuscation | 13. istek |

Pingdom F 0, müzakeresiz (`Accept-Encoding` yok) gövdeyi «sıkıştırılmamış» sayar. Kenar Gzip+Brotli açıktır; HTML 52.8 KB → gzip 8.4 KB. Yine de `compress: true` mühürlendi ki `next start` ve öz-barındırma da sıkıştırsın.

13 istek dökümü (ana sayfa, modern tarayıcı): HTML + 1 CSS + 8 JS chunk + `icon.svg` + `apple-icon.png` + Cloudflare e-posta decode.

Font HTTP isteği **yok** — `app/globals.css` sistem yığını (`Segoe UI` / `ui-sans-serif`); `next/font` ve `@font-face` yok.

---

## ADIM 1 — Gzip / Brotli (P0)

Kod:

- `next.config.ts` → **`compress: true`** (Next.js varsayılanı açık mühür; Vercel kenarı Gzip+Brotli müzakere eder).
- `proxy.ts` matcher: hash’li ikon, cinema/public görseller, font ve MP3/MP4 kenar worker’dan çıkarıldı. Statik gövde Cloudflare/Vercel CDN sıkıştırmasına ve cache’ine düşer; JWT/CSP worker’ı Range/ikon gecikmesi üretmez.

Cloudflare (canlı doğrulandı, gösterge paneli dokunulmadı):

| Ayar | Canlı durum | SUPER ADMIN |
|------|-------------|-------------|
| Brotli | `Content-Encoding: br` | Speed → Optimization → Brotli **On** kalsın |
| Gzip | `Content-Encoding: gzip` | Varsayılan; kapatılmasın |
| Email Address Obfuscation | Ana sayfaya `email-decode.min.js` basıyordu | İsteğe bağlı **Off** — kod artık JSON-LD `@` kaçışı ve `mailto:` `%40` ile decode script’ini tetiklemez |
| Rocket Loader | CSP nonce ile çakışır | **Off** kalsın |

---

## ADIM 2 — Cache-Control / Expires (P1)

`next.config.ts` `headers()` — HTML **hariç**:

| Kaynak | Cache-Control |
|--------|----------------|
| `/_next/static/:path*` | `public, max-age=31536000, immutable` |
| `/_next/image/:path*` | aynı |
| `/media/academy/audio/:path*` | aynı + `audio/mpeg` + `Accept-Ranges` |
| `/academy/cinema/:path*` | aynı |
| `/media/:path*` | aynı |
| `/icon.svg`, `/apple-icon.png`, `/favicon.ico` | aynı (eski 4 saat kuralı kırıldı) |
| `/:all*(ico\|png\|jpg\|jpeg\|gif\|webp\|avif\|svg\|woff\|woff2\|ttf\|otf\|mp3\|mp4)` | aynı |

`images.minimumCacheTTL: 31536000` — `next/image` optimize gövdesi.

HTML `/` `private, no-store` durur: `HomeAccountNav` oturum kabuğu cache’lenmez.

---

## ADIM 3 — HTTP istek (P1)

| Değişiklik | Etki |
|------------|------|
| Yasal footer + colophon `prefetch={false}` | Sabit alt nav görünürde 6–7 RSC prefetch’i LCP ile yarışmaz |
| JSON-LD e-posta `\u0040` | Cloudflare decode script’i JSON-LD’den tetiklenmez; schema.org hâlâ `@` okur |
| `mailto:` `destek%40yetkin.ai` | Footer `title` e-posta taşımaz; decode.js düşer (~1 istek) |
| Sistem fontu | Font import eklenmedi; Google Fonts yok |
| JS chunk | Next 16 Turbopack üretim parçaları framework omurgası; birleştirme public API’si yok. Kök `NavigationProgressBar` durur (rota göstergesi). Ana CTA (`/academy`, `/login`, `/register`) prefetch açık |

Beklenen ana sayfa isteği: Cloudflare decode kalkınca **12**; yasal prefetch kesilince Pingdom «network idle» sayımı düşer.

---

## SUPER ADMIN — yayın ve doğrulama

1. Bu commit üretimde (Vercel) yeşil olsun; Cloudflare cache’si hash’li `/_next/static` için zaten HIT.
2. Pingdom’u **`https://yetkin.ai/`** için yeniden çalıştır (aynı sonda konumu).
3. Gösterge: Brotli On, Rocket Loader Off, Email Obfuscation Off (opsiyonel; kod zaten decode’u keser).
4. Beklenen: Gzip uyarısı A’ya çekilir (müzakereli gzip/br); Expires A (`max-age=31536000` ikon+statik); istek sayısı C 72 → A/B. Toplam **A 95+** hedefi bu üç kuralın toplamıdır.
5. HTML’in `no-store` kalması bilinçlidir; Pingdom HTML’i «expires yok» diye kısmen kırabilir — statik gövde notu yeter.

Doğrulama komutları (yayın sonrası):

```bash
curl -sI -H "Accept-Encoding: gzip" https://yetkin.ai/ | findstr /i "content-encoding cache-control"
curl -sI -H "Accept-Encoding: gzip" https://yetkin.ai/icon.svg | findstr /i "content-encoding cache-control"
curl -sI -H "Accept-Encoding: gzip" https://yetkin.ai/favicon.ico | findstr /i "cache-control"
```

`icon.svg` / `favicon.ico` için beklenen: `Content-Encoding: gzip` ve `Cache-Control: public, max-age=31536000, immutable`.

---

## Dokunan dosyalar

- `next.config.ts` — `compress`, immutable headers, `minimumCacheTTL`
- `proxy.ts` — statik uzantı matcher
- `lib/copy/json-ld.ts` — JSON-LD e-posta kaçışı
- `components/legal/legal-site-footer.tsx` — prefetch / mailto
- `components/legal/legal-colophon-strip.tsx` — prefetch / mailto
- `tests/kernel/performance-headers-surface.test.ts`
- `tests/copy/seo-surface.test.ts`
