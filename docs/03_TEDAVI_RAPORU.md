# 03 — Tedavi Raporu (Paket 2: Akademi vitrin temizliği ve yönlendirmeler)

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Makam | Cursor ajanı (Grok 4.6) — Tedavi Aşaması, Paket 2 |
| Kanon | Yerel çalışma ağacı (`D:/yetkin.ai`) — CEO / SUPER ADMIN: 5 compact SKU |
| Kapsam | T2 (vitrin 5 SKU, ses rozeti dürüstlüğü) + eski URL 301/410 |
| Durum | Yerel kod kapatıldı. Canlı `yetkin.ai` bu PR deploy + tohum SQL uygulanana kadar eski 13+ yüzü basmaya devam eder. |
| Girdi | `/docs/01_TESPIT_RAPORU.md`, `/docs/02_TEDAVI_RAPORU.md`, SUPER ADMIN: eski kurslara ait **sıfır** ödeme/satın alma kaydı |
| Çıktı | Kod değişikliği + bu rapor |

**Okuma notu:** Paket 1 yayın dürüstlüğü ve Freelancer küçültmeyi kapadı. Bu paket Akademi vitrinini 5 compact SKU’ya indirir. SUPER ADMIN, PayTR henüz canlı onayda olduğu için veritabanında eski kurslara ait gerçekleşmiş ödeme/satın alma kaydı **bulunmadığını** doğruladı. Lisans koruma / bekletme süreci **açılmaz**; vitrin kesimi doğrudan uygulanır.

---

## 0. Yönetici özeti

1. **Vitrin SSOT mühürlendi.** Katalog, Prisma `listPublishedCourses`, BFF merge ve `GET /api/academy/courses` yalnız `ACADEMY_GROWTH_SKU_SLUGS` basar: `01_office_ai` … `05_prompt_practice`. Eski Python / Full-Stack / sızma / Ads / Canva / masterclass kartı ızgaraya giremez.
2. **Ses vaadi dürüst (A5).** “Sesli anlatım” rozeti yalnız mühürlü 2 WAV’lı amiral SKU’da (`01_office_ai-1`, `-2`). Diğer dört compact SKU “Makale / Pratik” basar. “Seslendirmeli İçerik” metni kopyada yoktur.
3. **Eski URL: tarayıcı 301, API 410.** `/academy/python-temel`, `/oyna` ve `/academy/courses/{eski-slug}` kalıcı olarak `/academy` kataloguna döner. Satın alma / GET BFF eski slug için HTTP 410.
4. **Lisans bekletmesi yok.** SUPER ADMIN nüfus sayımı: sıfır SETTLED. Eski satır `is_published=false` + fiyat `is_active=false`. DROP şart değildir; bekletme de şart değildir.

---

## 1. Adım 1 — Vitrin 5 compact SKU (T2)

### 1.1 Overlay + yayın bayrağı

Canlı DB’de eski kurs `isPublished=true` kalsa bile vitrine girmez (kod katmanı). Tohum SQL ayrıca bayrağı kapatır.

| Katman | Tedavi |
|--------|--------|
| Tohum | `ACADEMY_CATALOG_SEEDS` yalnız 5 growth slug |
| Katalog BFF | `mergePublishedAcademyCatalog` + `filterAcademyGrowthCatalog` |
| Prisma | `listPublishedCourses` growth filtresi (hayalet yayın satırı düşer) |
| Sayfa | `app/academy/page.tsx` + `CourseList` `filterAcademyPilotCatalog` |
| API liste | `GET /api/academy/courses` merge (tohumda olmayan slug yok) |

Eski satır için `UPDATE is_published = false` / `is_active = false`. SUPER ADMIN sıfır satın alma doğruladığı için iletişim planı / lisans bekletmesi **yoktur**. Satır DROP edilmez (FK ve geri alınabilirlik); yeni satış ve vitrin kapanır.

### 1.2 Ses rozeti — yalnız amiral

`academyCourseHasSealedAudio` SSOT: `ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"] = ["01_office_ai-1", "01_office_ai-2"]`.

| SKU | Kart | Antre |
|-----|------|-------|
| `01_office_ai` | “Sesli anlatım” | “Sesli anlatım — amiral hat” |
| `02_ecommerce_ai` … `05_prompt_practice` | “Makale / Pratik” | “Yazılı compact — makale ve pratik” |

Kasa özeti zaten mühürlü SKU’da ses, diğerinde yazılı compact (`academyCardOfferPaths`).

---

## 2. Adım 2 — Eski URL yönlendirmeleri

### 2.1 301 / 410 ayrımı

| Yüzey | Davranış |
|-------|----------|
| HTML `/academy/{eski-slug}` ve `/oyna` | `next.config.ts` **301** → `/academy` |
| HTML `/academy/courses/{eski-slug}` | Aynı haritada **301** → `/academy` (tek hop; genel courses alias’ından önce) |
| Compact SKU `/academy/courses/{01…05}` | Genel alias **301** → `/academy/{slug}` |
| Bilinmeyen slug (haritada yok) | `dynamicParams = false` → **404** (boş müfredat 200 yok) |
| `GET /api/academy/courses/{id}` eski slug | **410** `GoneError` — “Bu eğitim yayından kalktı. Güncel katalog /academy adresindedir.” |
| `purchase` / fiyat kilidi eski SKU | Motor **410** (yayın bayrağı true kalsa bile retired listesi keser) |

Harita: canlı 13+ (python / fullstack / security / ai-agent / masterclass’lar) + kanon 06–13 (ingest yok) + alias `siber-guvenlik`. Beş compact slug haritada **yoktur**.

App Router yedek: `app/academy/courses/[slug]/page.tsx` retired / vitrin-dışı slug’ı doğrudan `/academy`’ye kalıcı yönlendirir.

### 2.2 Nüfus sayımı — CLEARED

Paket 1’de “deploy öncesi lisans sayımı” bloklayıcıydı. SUPER ADMIN 8 Eylül 2026: PayTR canlı onayda; eski kurslara ait gerçekleşmiş ödeme/satın alma **yok**. Bekletme süreci açılmaz.

---

## 3. Doğrulama

Yerel Vitest (Paket 2 yüzeyi + Proof dumanı): 13 dosya / 90 test geçti.

| Paket | Dosyalar | Sonuç |
|-------|----------|--------|
| Vitrin / 301 / ses | `storefront-vitrine`, `course-seed-surface`, `catalog-canon-ingest`, `seo-surface`, `citizen-surface`, `purchase-flow`, `media-release-seal`, `ops-migrate-logic` | 8 dosya / 47 test |
| Proof dumanı (T1’i bloklamaz) | `exam-flow`, `exam-sitting`, `certificate-verify`, `enrolment-cta`, `curriculum-content` | 5 dosya / 43 test |

Öne çıkan kilitler:

- `tests/academy/storefront-vitrine.test.ts` — 5 SKU, 301 haritası (antre + oyna + courses alias), ses yalnız `01_office_ai`
- `tests/academy/purchase-flow.test.ts` — `python-temel` kilit 410
- `tests/academy/course-seed-surface.test.ts` — SQL’de purchase/certificate DELETE yok
- `tests/kernel/ops-migrate-logic.test.ts` — `academyLegacyUnpublish`

Playwright e2e ve yerel tarayıcı bu oturumda yok (dev sunucusu açık değil). Canlı tarayıcı doğrulaması aşağıda.

### 3.1 Canlı `yetkin.ai` (8 Eylül 2026, bu oturum)

| Yüzey | Sonuç |
|-------|--------|
| `GET /academy/python-temel` | **200** — hâlâ “Python ile Programlama…”, ₺890, “Ses” satırları |
| `GET /sitemap.xml` | **200** (Tespit’teki 500 kapanmış) ama `lastmod` 31 Ağustos; loc’larda `ai-agent-*`, `python-*`, `fullstack-*`, `security-*`, Ads/Canva/LinkedIn masterclass |
| Compact 5 SKU loc | Sitemap’te **yok** |

Yerel kanon ile canlı yüz **hâlâ sapmalı.** Kapanış: bu PR deploy + tohum SQL (`is_published=false`).

---

## 4. Değişen dosyalar (Paket 2)

Önceki oturumda duran omurga + bu oturumda tek-hop sertleştirme:

- `lib/academy/retired-storefront.ts` — 301 haritası; `/academy/courses/{eski}` eklendi
- `next.config.ts` — retired blok, genel courses alias’ından **önce**
- `app/academy/courses/[slug]/page.tsx` — retired / vitrin-dışı → `/academy`
- `app/academy/[slug]/page.tsx` — yorum
- `lib/academy/engine.ts`, `prisma-store.ts`, `catalog-seed.ts`, `pilot-sku.ts`
- `lib/copy/sen-voice/academy.ts`
- `components/academy/course-card.tsx`, `course-hero-actions.tsx`
- `app/api/academy/courses/route.ts`, `app/api/academy/courses/[id]/route.ts`
- `prisma/seed.ts`, `scripts/render-academy-course-seed-sql.ts`, `supabase/migrations/20260814090000_academy_course_seed.sql`
- `scripts/ops-migrate-lib.ts`
- ilgili yüzey testleri

---

## 5. Stratejik değerlendirme

### 5.1 SEN OLSAYDIN NE YAPARDIN?

**Soru:** Vitrin 5 compact SKU’ya indikten sonra, PayTR Merchant canlı onayı geldiği an ilk test ödemesi (`T1 — CLEARED` tanığı) için teknik kontrol listesi hazır mı?

**Cevap: Evet. Liste kodda ve OPS §4’te duruyor; yeni motor yazılmaz. İlk tanık Akademi SKU’su değil, Super Admin cüzdan iFrame’idir.**

Hazır kontrol listesi (sıra icat etme; sır basma):

| # | Kontrol | SSOT / beklenen |
|---|---------|-----------------|
| 1 | Üretim `PAYTR_MERCHANT_ID / KEY / SALT` dolu | `GET /api/health` → `checks.payments=configured` |
| 2 | `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde **boş** | Doluysa throw / 403 `production_safety` |
| 3 | Mağaza paneli: mağaza aktif + **iFrame yetkisi** açık | “Mağaza aktif değil” get-token’ı kırar |
| 4 | Bildirim URL birebir | `https://yetkin.ai/api/paytr/callback` (eşdeğer `/api/payments/webhooks/paytr`) |
| 5 | Callback yoklaması | `GET /api/paytr/callback` → HTTP 200 düz metin `OK` (CREDIT yazmaz) |
| 6 | Callback’e WAF / bot fight / JWT **konmaz** | Challenge POST’u yutar; bakiye boş kalır |
| 7 | `NEXT_PUBLIC_APP_URL` | `https://yetkin.ai` (localhost yasak) |
| 8 | `TRUSTED_PROXY_HOPS=2` | Cloudflare → Vercel; hop 1 çürük `user_ip` |
| 9 | Inngest çifti dolu | `checks.inngest=configured`; defer ACK’sız kalmasın |
| 10 | Split kapalı | `MARKETPLACE_SPLIT_LIVE = false` — aynı turda açılmaz |
| 11 | Tutar | Kod bandı ₺10–₺20.000 (`WALLET_TOP_UP_MIN_MINOR = 1_000`). Sahte ₺0,01 yok. Merchant’ın kabul ettiği **en küçük TRY** (öneri: ₺10) |
| 12 | Oyuncu | Super Admin, gerçek kart, **tek** işlem. Vatandaş A/B yok |
| 13 | Tanık üçlüsü | `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT `wallet-top-up:{oid}` + cüzdan `amount_minor` |
| 14 | Yasaklar | Elle SQL CREDIT yok; başarısız callback’i ikinci kez basma; panoda kart numarası yok |
| 15 | İkinci tur (T1 sonrası) | `01_office_ai` (₺890 tohum) kilit + kasa rızası `2026-09-05` + SETTLED. İlk CLEARED’i SKU’ya bağlama |

Yapmazdım: sandbox’ta “geçti” deyip canlıyı atlamak; ilk tanığı ₺1.290’lık kursa bağlamak; vitrin temizliğini lisans DROP ile yapmak; Merchant onayını Proof denetimine bağlayıp bekletmek.

### 5.2 SONRAKİ ADIM

**Soru:** Vitrin temizliğinden sonra hemen PayTR canlı onayını / T1’i mi bekleyelim, yoksa Proof (sınav + sertifika mühürleme) akışlarını mı son kez denetleyelim?

**Cevap: Seri kapı Proof değildir. Birincil bekleyiş Merchant panel onayıdır. Proof yerelde bu oturumda dumanlandı (43 test); T1’in yerine geçmez ve T1’i bloklamaz.**

| Yol | Ne zaman | Neden |
|-----|----------|--------|
| **Deploy Paket 1+2** | Hemen | Canlı hâlâ `python-temel` 200 ve eski sitemap loc basıyor. A5. |
| **Tohum SQL** | Deploy ile | Eski `is_published=false`. Satın alma kaydı yok; bekletme yok. |
| **PayTR T1** | Panel “iFrame / canlı tahsilat” açıldığı **an** | CLEARED tanığı olmadan satış A5 riskidir. Nakit mühür budur. |
| **Proof (sınav 70 + SHA-256)** | Paralel, yerelde — Merchant beklerken | Havuz 30–50, çekim 10, 30 dk, baraj 70, `/academy/dogrula` kodda duruyor. End-to-end oturum Merchant istemez. “Son kez denetle” diye T1’i sıraya koyma. |

Tavsiye edilen Super Admin sırası:

1. Paket 1 + Paket 2’yi üretime alın. Dışarıdan: sitemap 5 slug, `/academy` yalnız compact kart, `/academy/python-temel` **301**, ses rozeti yalnız Ofis AI.
2. Tohum SQL / `prisma db seed` ile eski `is_published=false`.
3. Merchant onayını beklerken (boş süre): isteğe bağlı canlı Proof dumanı — Super Admin grant ile bir compact SKU, sınav baraj 70, hash `dogrula` 200. Bu T1 değildir.
4. Onay geldiği an **T1:** cüzdan iFrame → CLEARED üçlüsü. Sonra bir `01_office_ai` satın alması.
5. Split ve Junior açılmasın.

Sınav paketini T1’den önce “bitmiş ürün” diye bekletmeyin: belgesiz tahsilat da, tahsilatsız belge de eksiktir; birincil gelir kapısı PayTR’dir. Proof kodu hazırdır; eksik olan canlı CLEARED tanığıdır.

---

## 6. SUPER ADMIN’e bildirim

Paket 2 (T2 + eski URL) **yerel kanonda tamam.** Nüfus sayımı sizin beyanınızla CLEARED; lisans bekletmesi açılmadı. Canlı vitrin hâlâ 13+ basıyorsa nedeni deploy / tohum SQL’dir.

Lütfen sırayla:

1. Paket 1 ile birlikte (veya hemen ardından) üretime alın. Ardından:
   - `GET /academy` → 5 compact kart; Python / sızma / Ads yok
   - `GET /academy/python-temel` → **301** `/academy`
   - `GET /academy/courses/python-temel` → **301** `/academy` (tek hop)
   - Amiral kartta “Sesli anlatım”; diğerlerinde “Makale / Pratik”
   - `GET /sitemap.xml` → yalnız `01_office_ai` … `05_prompt_practice`
2. `ops:migrate` veya seed: eski kurs `is_published=false`.
3. T1 kontrol listesi §5.1 — hazır. Merchant iFrame onayı gelir gelmez Super Admin cüzdan ₺10 bandı, CLEARED tanığı. Sonra Ofis AI.
4. Proof’u T1’in önüne seri kapı koymayın; yerelde geçti.
5. Split ve Junior açılmasın.

`MARKETPLACE_SPLIT_LIVE = false` ve Junior 410 bu pakette değişmedi.

Tedavi Aşaması Paket 2 kapanışı: `/docs/03_TEDAVI_RAPORU.md`.
