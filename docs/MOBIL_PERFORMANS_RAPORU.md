# Mobil Performans Raporu — LCP srcset & TTFB sıkılaştırması

| Alan | Değer |
|------|--------|
| Tarih | 11 Eylül 2026 |
| Kapsam | SpeedVitals mobil: ~1,5 s TTFB + ~3,5 s LCP. Vitrin kapakları 1280×720 tek dosya indirmesin; `01_office_ai` AVIF LCP olsun. |
| Yöntem | Disk bayt ölçümü, `http://localhost:3000` DOM `currentSrc`, `vitest` yüzey, `main` → Vercel Production, canlı `Link` / `Cache-Control` başlıkları. Tahmin yok. |
| Skor iddiası | SpeedVitals yeniden koşulmadı. TTFB/LCP milisaniye uydurulmaz. |

Bu rapor `docs/` altındadır. `/docs` build fixture değildir.

---

## Adım 1 — Mobil responsive görsel

### 1.1 Tespit (kesin)

`CourseCoverImage` `unoptimized` + tek `<source srcSet={avif}>` basıyordu. `sizes` ipucuydu; tarayıcı 1280×720 AVIF/WebP indiriyordu. Katalog `listing-card` mobilde 100vw kartta tam boy dosyayı çekiyordu.

Ana sayfa `getSession()` HTML kabuğundan önce `await` ediliyordu. Oturum yokken bile Supabase turu TTFB’ye girer.

### 1.2 `sizes` sözleşmesi

| Yüzey | `sizes` | Gerekçe |
|-------|---------|---------|
| Katalog kartı (`course-card` → `listing-card`) | `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` | İstenen katalog ızgarası; `md:grid-cols-3`, amiral `md:col-span-2` |
| Ana sayfa sinema şeridi | `(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw` | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` — mobilde 100vw LCP’yi şişirir |

SSOT: `ACADEMY_COURSE_COVER_SIZES` / `ACADEMY_HOME_CINEMA_COVER_SIZES` (`lib/academy/course-cover.ts`).

### 1.3 Srcset (640 / 960 / 1280)

Fırın: `npx tsx scripts/optimize-academy-course-covers.ts` — Sharp, WebP q70 / AVIF q62.

| Kök | 640w AVIF | 960w AVIF | 1280 AVIF |
|-----|-----------|-----------|-----------|
| `01_office_ai-1-eye` | 16 900 B (16,5 KB) | 29 057 B (28,4 KB) | 43 205 B (42,2 KB) |
| `02_ecommerce_ai-1-eye` | 11 325 B (11,1 KB) | 20 039 B (19,6 KB) | 29 773 B (29,1 KB) |
| `03_social_media_ai-reels-1-eye` | 17 066 B (16,7 KB) | 30 557 B (29,8 KB) | 45 051 B (44,0 KB) |
| `04_chatbot_nocode-1-eye` | 15 304 B (14,9 KB) | 27 975 B (27,3 KB) | 40 845 B (39,9 KB) |
| `05_prompt_practice-1-eye` | 18 175 B (17,7 KB) | 31 909 B (31,2 KB) | 47 275 B (46,2 KB) |

Mobil LCP adayı (`01_office_ai` 640w AVIF) 16,5 KB; 1280 AVIF 42,2 KB. Cloudflare `/academy/cinema/:path*` `immutable` 1 yıl — yeni `-640w` / `-960w` URL’leri cache kırmaz, yeni anahtar basar.

`unoptimized` durur: Early Hints `/_next/image` sorgu dizesine kaymaz.

### 1.4 LCP kartı `01_office_ai`

| Kanal | Değer |
|-------|--------|
| Katalog | `featured` → `coverPriority` → `loading="eager"` `fetchPriority="high"`; `img src` AVIF |
| Ana sayfa | `index === 0` (SKU sırası `01_office_ai`); yalnız ilk kart eager/high; ikincisi lazy (LCP rekabeti kesildi) |
| `<head>` preload | `imageSrcSet` + `imageSizes` = ana sayfa ızgarası |
| Kenar `Link` | aynı `imagesrcset` / `imagesizes` — Cloudflare 103 Early Hints |

### 1.5 TTFB (ana sayfa)

`getSession` `components/public/home-account-nav.tsx` içinde `<Suspense>` arkasındadır. Ana sayfa senkron RSC: kapak HTML’i oturum turunu beklemez. Misafir fallback = Giriş/Kayıt (SpeedVitals oturumsuz).

### 1.6 Lab DOM (`http://localhost:3000`)

**`/`**

- Yanıt `Link`: `</academy/cinema/01_office_ai-1-eye.avif>; rel=preload; as=image; type="image/avif"; imagesrcset="…640w…960w…1280w"; imagesizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"`
- İlk kart: `src=/academy/cinema/01_office_ai-1-eye.avif`, `fetchpriority=high`, `loading=eager`
- Dar viewport `currentSrc`: `01_office_ai-1-eye-640w.avif` (16 900 B, `Content-Type: image/avif`, `Cache-Control: public, max-age=31536000, immutable`)
- Kart 2–5: `loading=lazy` `fetchPriority=low`; `currentSrc` 640w AVIF

**`/academy`**

- Amiral kapak `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
- `fetchpriority=high` `loading=eager` `src` AVIF
- Lab `currentSrc`: `01_office_ai-1-eye-960w.avif` (kart 100vw)

---

## Adım 2 — Production

Kod kümesi `main`’e alındı. Canlı doğrulama bu tablodadır.

| Alan | Değer |
|------|--------|
| SHA | *(push sonrası doldurulur)* |
| Vercel | *(GitHub `vercel[bot]` status)* |
| `GET https://yetkin.ai/` `Link` | *(ölçülür)* |
| `GET …/01_office_ai-1-eye-640w.avif` | *(CF-Cache-Status / Cache-Control / Content-Type)* |

---

## Adım 3 — Dosya listesi

| Dosya | Değişiklik |
|-------|------------|
| `lib/academy/course-cover.ts` | `sizes` SSOT, srcset yardımcıları, preload `imagesrcset` |
| `components/academy/course-cover-image.tsx` | AVIF+WebP `srcSet`; LCP `src` AVIF; eager+high |
| `components/academy/course-card.tsx` | `coverSizes={ACADEMY_COURSE_COVER_SIZES}` `coverPriority={featured}` |
| `components/showcase/listing-card.tsx` | katalog `sizes` varsayılanı |
| `components/public/home-account-nav.tsx` | `getSession` Suspense |
| `app/(public)/page.tsx` | senkron kabuk; LCP preload srcset; yalnız index 0 eager |
| `next.config.ts` | `/` `Link` `imagesrcset` + `imagesizes` |
| `scripts/optimize-academy-course-covers.ts` | 640/960/1280 fırın |
| `public/academy/cinema/*-{640,960}w.{avif,webp}` + kanon AVIF/WebP | yeni varlıklar |
| `tests/academy/course-cover-surface.test.ts` | srcset + sizes + preload kilidi |
| `tests/ui/public-home-cta-surface.test.ts` | nav Suspense yüzeyi |
| `tests/copy/sen-axis-surface.test.ts` | yeni nav dosyası |

Yerel birim: `npx vitest run tests/academy/course-cover-surface.test.ts tests/ui/public-home-cta-surface.test.ts tests/ui/brand-mark-surface.test.ts tests/copy/sen-axis-surface.test.ts tests/copy/seo-surface.test.ts tests/academy/citizen-surface.test.ts` → **26/26 geçti**.

Tekrar üretmek: `npx tsx scripts/optimize-academy-course-covers.ts`

---

## Beklenen etki (ölçülmedi)

- Mobil katalog/ana sayfa LCP görseli 1280 AVIF (~42 KB) yerine 640w (~16,5 KB) veya 960w (~28 KB) seçebilir.
- Ana sayfa TTFB, oturum turunu ilk HTML baytından çıkarır.
- SpeedVitals 1,5 s / 3,5 s iddiası bu raporda kapanmaz; canlı koşu ayrıca yapılır.
