# yetkin.ai — Kapsamlı Tespit Raporu

> **Denetim türü:** Yalnızca okuma ve analiz. Bu rapor hazırlanırken hiçbir ürün dosyası değiştirilmedi.
> **Kapsam:** `app/` (60 sayfa rotası, 132 API rotası), `components/` (224 `.tsx`), `lib/` (18 modül klasörü), `prisma/`, `scripts/`, yapılandırma dosyaları ve build/lint çıktıları.
> **Tarih:** 21 Kasım 2026 · **Next.js:** 16.3.1 (kurulu) · **Node:** ≥20.19.0

---

## 0. Yönetici Özeti

### Sağlık & Ticari Hazırlık Skoru: **6.4 / 10**

| Alan | Puan | Kısa gerekçe |
|---|---:|---|
| **Mühendislik disiplini** | **9.0 / 10** | `tsc --noEmit` temiz, 1905 test / 358 dosya geçti, `next build` başarılı, `verify:api-auth --check` sapmasız, `verify:no-secrets` ve `verify:boundaries` yeşil. Bu seviye nadirdir. |
| **Güvenlik & yetkilendirme** | **8.5 / 10** | 132 rotanın tamamı `export const auth` taşıyor, kenar K6 haritası disk ile birebir; JWT fail-closed, nonce CSP `strict-dynamic`, HMAC webhook, SSRF blocklist, IDOR mühürleri. Eksik: dağıtık hız tavanı yok. |
| **Mimari bütünlük** | **5.0 / 10** | Mükemmel mühür katmanının altında **canlı ürün ile kod tabanı koptu**: `/academy` diskte yok ama 321 yönlendirme kuralı, sitemap politikası, JSON-LD halkası, 19 API rotası ve 171 modüllük `lib/academy` hâlâ ona bağlı. |
| **Ticari mantık / CRO** | **5.5 / 10** | Fiyat dürüstlüğü ve kota/paywall mimarisi örnek niteliğinde; ancak ana sayfa CTA'ları giriş duvarına çarpıyor, ödeme dönüşünde dönüşüm sinyali kayboluyor, sosyal kanıt tamamen yok, "Seviye Testi" vaadinin ürün karşılığı yok. |
| **Teknik SEO** | **7.5 / 10** | Kanonik/OG disiplini güçlü, 64 girişlik sitemap doğru üretiliyor, JSON-LD grafı sağlam (tek dilli olduğu için `hreflang` doğru şekilde yok); fakat 450+ satır kurs şeması kapalı ölü halka, `/sozluk` ve `/tetkik` sitemap'te ama iç bağlantısı sıfır. |
| **Performans** | **6.5 / 10** | Immutable cache, `compress`, `fra1`, nonce/`connection()` TTFB kararları doğru; buna karşılık 163 KB tek CSS dosyası, 4.1 MB istemci chunk'ı, `components/` katmanında 144/224 `"use client"` ve 1.6 GB `public/` yükü var. |

### En kritik üç bulgu

1. **[KRİTİK] Akademi slug'ları 301 ile 410'a yönleniyor.** `nextConfig.redirects()` toplam 341 kural üretiyor; **321'i** `/academy`'yi hedefliyor. `/academy` diskte yok ve kenar onu kesiyor: `decideEdgeAction('/academy', false) → {"kind":"frozen-410"}`. Yani eski bağlantı ve SEO otoritesi **kalıcı yönlendirme ile çöpe** gidiyor.
2. **[KRİTİK] Ana sayfa CTA'ları oturumsuz ziyaretçiyi giriş duvarına çarpıyor.** `/hibe` ve `/e-ticaret` `PROTECTED_KERNEL_PATHS` içinde; doğrulandı: `decideEdgeAction('/hibe', false) → auth-307 → /login`. Ana sayfa `bench`/`chain`/`tracks` bölümleri bu iki adrese **5 doğrudan bağlantı** veriyor ve hiçbirinde `next` parametresi taşınmıyor — kullanıcı giriş sonrası hedefe dönemiyor.
3. **[KRİTİK] Ödeme dönüşünde dönüşüm ölçümü ve masa yönlendirmesi kayıp.** Tüm tarayıcı ödemeleri tek dönüş adresine (`/cuzdan`) düşüyor; `?masa=` parametresini **hiçbir kod üretmiyor** (0 eşleşme) ama `/kasa/donus` onu okuyor. `/cuzdan`'da `trackPurchase` **yok** — tek davranış `router.refresh()` (`wallet-top-up-form.tsx:247-250`). Sonuç: GA4 `purchase` gerçek ödemelerde hiç tetiklenmiyor.

---

## 1. Mimari Bütünlük ve Modül Senkronizasyonu

### 1.1 Haritalama — canlı yüzey

Kök `proxy.ts` (Next 16 `middleware` yerine) tek kenar girişi. Yönlendirme kararı merkezî `lib/kernel/security/edge-guard.ts` içinde; `next.config.ts` yalnız kanonik/SEO yönlendirmelerini taşıyor.

```
/                        → (public)/page.tsx        marka iniş, index:true
/tezgah                  → AppShell + TezgahWorkbench (misafir 3 üretim/gün)
/hibe                    → (kernel)  🔒 requirePageSession
/e-ticaret               → (kernel)  🔒 requirePageSession
/career                  → iki kipli: oturumsuz PublicCareerPanel, oturumlu tam kokpit
/vize, /vize/[id]        → kamu kanıt (YetkinCV + Akademi mührü), oturumsuz 200
/dashboard               → oturumsuz PublicHomePanel, oturumlu CommandCenter
/junior, /junior/ders/*  → bayrak + allowlist kapılı
/academy                 → ❌ DİSKTE YOK (kenar 410)
```

### 1.2 [KRİTİK] `/academy` — canlı kod ile ölü kayıt defteri kopukluğu

**Kanıt:** `app/academy` ve `app/(public)/academy` **yok** (`Test-Path` → `False`). `next build` rota tablosunda `/academy` **hiç görünmüyor** (0 eşleşme).

Buna rağmen `/academy`'ye bağlı yaşayan katmanlar:

| Dosya | Satır | Bağ |
|---|---:|---|
| `lib/dronlar/kayit.ts` | 55–62 | `path: "/academy"`, `kapali: true`, 7 hop |
| `lib/copy/seo.ts` | 131–138 | `PAGE_SEO.academy` (title/description/path) |
| `lib/copy/seo.ts` | 561–563 | `sitemapRoutePolicy`: `/academy/*` → priority 0.8 |
| `lib/copy/seo.ts` | 325 | `ROBOTS_DISALLOW_PATHS` içinde `/academy`, `/academy/*/oyna` |
| `lib/kernel/security/edge-guard.ts` | 222–239 | `isAcademyCurriculumPlayerPath`, `isAcademyFreePreviewPlayerPath` |
| `lib/academy/public-surface-gate.ts` | 26–50 | `ADULT_VITRINE_SLUGS`, `academySlugVerdict` |
| `lib/academy/retired-storefront.ts` | 156–162 | 106 slug → **`/academy`** 301 |
| `app/api/academy/**` | 19 rota | catalog, courses, exam, purchase, listen, pdf… |
| `lib/copy/json-ld.ts` | 255–437 | `courseJsonLd`, `educationalOccupationalProgramJsonLd` |
| `proxy.ts` | 77–88 | `/media/academy/audio/*` imza kapısı |
| `next.config.ts` | 183–198 | wav→mp3, `/academy/courses/:slug`, `/verify` → `/vize` |

**Ölçü:** `lib/academy` = **2.711 KB / 366 dosya / 171 tekil modül**. Bunların yalnız **51'i** `lib/academy` dışından referans alıyor (doğrulandı: `app`, `components`, `lib`, `packages` içinde arama). **120 modül (≈%70)** yalnız kendi içinde veya hiç kullanılmıyor.

> **Nüans:** Bu 51 modülün bir kısmı gerçekten canlı — `/career` ve `/vize` Akademi mührünü ve sertifika doğrulamasını gösteriyor (`lib/academy/load.ts` → `loadPublicAcademyVerifyByHash`, `app/(public)/vize/[id]/page.tsx:14`). Yani Akademi **satış/vitrin yüzeyi** kapalı, **kanıt/doğrulama yüzeyi** açık. Silme kararı bu ayrımı korumalı.

`app/api/academy` = 50 KB / 19 rota — bunların `catalog`, `courses`, `purchase`, `exam`, `pdf`, `listen` gibi satış yüzeyleri handler'a ulaşmadan 410/harici kapıya düşüyor; `certificates/[hash]` (`auth = "public"`) ve `exemption-preview` ise `/vize` doğrulamasının arkasında anlamlı.

**[YÜKSEK] Somut kullanıcı etkisi — 301 → 410 zinciri:**
```
/academy/01_office_ai
  → next.config.ts:160  { source: "/academy/01_office_ai", destination: "/academy", statusCode: 301 }
  → proxy.ts:177        decideEdgeAction("/academy") → frozen-410
  → HTTP 410 Gone
```
Google 301 gördüğü URL'yi tarar, hedefte 410 bulur ve **kalıcı yönlendirme sinyalini de yönlendirme hedefini de düşürür**. Doğrulandı: `nextConfig.redirects()` toplam **341 kural** üretiyor, bunların **321'i** `/academy`'yi hedefliyor (`106 slug × 3 kural = 318` + `/ogren` + `/academy/courses/:slug` + 1). `next.config.ts:180-181` yorumu "API 410" derken istemci tarafının da 410 olduğunu hesaba katmıyor.

**[ORTA] Sitemap'te var olmayan yol üretme riski:** `sitemapRoutePolicy("/academy")` → priority **1.0** döner (`seo.ts:541`). Bugün `SITEMAP_STATIC_PATHS` içinde `/academy` yok, ancak politika tablosu hâlâ onu en yüksek öncelikli sayfa sayıyor. `courseEntries` dizisi `sitemap.ts:58`'de boş bırakılmış — yani ölü ama niyeti canlı.

**[ORTA] Ölü SEO/şema katmanı (yalnız testlerde yaşıyor):**

| Sembol | Üretim ithalatçısı | Test kullanımı |
|---|---|---:|
| `courseJsonLd` | **yok** | 8 |
| `educationalOccupationalProgramJsonLd` | **yok** | 4 |
| `academyCourseBreadcrumbs` | **yok** | 3 |
| `ACADEMY_LANDING_FAQ` | yalnız `sem-keywords.ts` (kendi dosyası) | 2 |
| `academyCourseSeoOverride` | yalnız `json-ld.ts` (ölü) | 6 |
| `OFFICE_AI_SEO` + 5 kardeş kurs sabiti | yalnız `json-ld.ts` + `seo.ts` (ikisi de ölü) | 51 |
| `OFFICE_AI_COURSE_FAQ` | **yok** | — |
| `OFFICE_AI_LESSON_TEASERS` | **yok** | — |
| `publicAcademyProofCounts` | **yok** | 0 |

**Doğrulanmış kapalı küme:** 6 kurs SEO sabiti yalnız `json-ld.ts` ve `seo.ts` tarafından okunuyor; bu iki dosyanın kurs dalı ise yalnız `courseJsonLd`/`educationalOccupationalProgramJsonLd` içinden erişiliyor; o iki fonksiyonun **hiçbir ithalatçısı yok**. Yani 450+ satırlık kurs SEO/şema katmanı kendi kendini besleyen kapalı bir ölü halka. Buna karşılık `tests/copy/seo-surface.test.ts` (1.400+ satır) bu halkayı **doğruluyor** — testler var olmayan bir ürünü mühürlüyor.

### 1.3 [YÜKSEK] Tasarım dili ve kabuk tutarsızlığı

Kamu yüzeyi **iki ayrı kabuk** kullanıyor:

- `(public)/layout.tsx` → düz `<div>` + `LegalSiteFooter` (sabit taban çubuğu)
- `app/career/layout.tsx`, `app/tezgah/layout.tsx`, `app/junior/layout.tsx` → `AppShell` (koyu sol ray + `ShellChrome`)
- `(kernel)/layout.tsx`, `app/dashboard/layout.tsx` → `AppShell` (aynı)

**Sonuç:** `/` → `/tezgah` geçişinde kullanıcı tamamen farklı bir gezinme modeline düşüyor. `/tezgah` birincil CTA hedefi olduğu için bu, ilk tıklamada yaşanan deneyim. `AppShellSwitch` (`app-shell-switch.tsx:39-64`) `academyPlayer`, `juniorLesson`, `juniorVitrine`, `tezgah`, `commerce` için 5 farklı padding profili tutuyor — kamusal sayfaların hiçbiri bu geçişi köprülemiyor.

**[İYİLEŞTİRME]** `app/(public)/page.tsx` kendi `<header>`'ını (satır 33–62) elle kuruyor: `BrandIcon` + 4 `Link` + `HomeAccountNav`. Aynı navigasyon `components/shell/header-bar.tsx:66-84` içinde (`/uzmanlar`, `/kurumsal`, `/fiyatlandirma`) **tekrar** yazılmış. İki liste farklı: ana sayfada `/uzmanlar` yok, kabukta `/rehber` yok.

### 1.4 [YÜKSEK] Yetim (orphan) ve çıkmaz sokak sayfalar

| Sayfa | İç bağlantı (app+components) | Durum |
|---|---:|---|
| `/sozluk` | **0** | Sitemap priority 0.8, 30 terim, hiçbir yerden erişilemiyor |
| `/tetkik` | **0** | Sitemap priority 0.8, ana sayfa bench'te `/tezgah?tool=tetkik` var ama sayfaya bağ yok |
| `/rehber` | 1 | Yalnız ana sayfa header'ında (satır 57) |
| `/uzmanlar` | 1 | Yalnız `header-bar.tsx:67` (yalnız AppShell içinde) |
| `/magaza/[slug]` | 0 (kamu) / 2 (oturumlu panel) | Sayfa ve slug kapısı var; sitemap dışı. Kamu keşfi yok, panelden üretiliyor |
| `/young` | 0 | `DronBayrakları.isKapali("young")` → **her koşulda `notFound()`** (`young/page.tsx:17-19`); `DRON_YOUNG_OPEN` set edilse de `DRON_KAYIT` satırı `kapali: true` |
| `/p`, `/p/[id]`, `/verify`, `/verify/[hash]` | — | `next.config` 301 + sayfa içi `permanentRedirect` — **çift yönlendirme katmanı**; `next.config` `/p/[id]` ve `/verify/[hash]` kurallarını **taşımıyor** (`source: "/p/:id"` var, `/p/[id]` yok) |

**[ORTA] `/young` ölü kod kanıtı:** `lib/dronlar/kayit.ts:125-134` satırında `kapali: true` + `bayrakEnv: DRON_YOUNG_OPEN`. `DronBayrakları.isKapali` (satır 206-212) env açıksa `false` döner, yani sayfa açılabilir; ama içerik `YOUNG_SCHOOL_SEGMENT.subjects` üzerinden "İçerik kartı henüz yok." basıyor (`young/page.tsx:32`) ve sitemap/robots'ta yok. Yayına alınmış bir sayfa değil, yer tutucu.

### 1.5 [ORTA] State yönetimi tutarsızlıkları

- **`/dashboard` çift kipli:** oturumsuz `PublicHomePanel`, oturumlu `CommandCenter` (`app/dashboard/page.tsx:19-23`). Ama `/dashboard` `PROTECTED_KERNEL_PATHS` içinde **değil** — `isPublicKernelVitrinePath` (edge-guard:250) onu muaf tutuyor. Yani iki farklı ürün tek URL'de; `/` zaten marka inişi olduğu için oturumsuz `/dashboard` **kopya ana sayfa** işlevi görüyor ve `robots` ile kapatılmış durumda (`ROBOTS_DISALLOW_PATHS`).
- **`/career` çift kipli** (aynı desen), ama bu bilinçli ve SEO'ya doğru bağlanmış: `PRODUCT_ROOM_PATHS = ["/career"]`, `index:true`. `/dashboard` için aynı özen gösterilmemiş.
- **`searchParams` bekleyişi:** Next 16'da `searchParams` Promise. `app/(public)/fiyatlandirma/page.tsx` `async` ve doğru; `app/(public)/kasa/page.tsx:21` de doğru. Ancak `app/(public)/magaza/[slug]/page.tsx:21` `generateMetadata` içinde her istekte `loadPublicStorefront` çağırıyor ve `page.tsx:34` aynı sorguyu **tekrar** yapıyor → çift DB okuması (bkz. §5.3).

---

## 2. Ticari Mantık ve Dönüşüm (CRO)

### 2.1 Değer önerisi netliği — güçlü

`lib/copy/sen-voice/public.ts:6-8`:
> "İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa."

Alt metin 4 somut iş vaat ediyor (belge üretimi, e-ticaret stok/sipariş, hibe bulma, yetkinlik testi). `app/(public)/page.tsx:71-75` H1'i basıyor, `:76-78` açıklamayı veriyor, `:77-82` birincil/ikincil CTA. **Yapı doğru:** badge → H1 → açıklama → CTA → güven kartı → zincir → araçlar → hibe widget → çözüm yolları → SSS.

`data-home-value-chain`, `data-home-bench`, `data-home-grant` test kancaları var — CRO ölçümü düşünülmüş.

### 2.2 [KRİTİK] Birincil CTA oturumsuz ziyaretçiyi giriş duvarına çarpıyor

**Kanıt zinciri:**

1. `app/(public)/page.tsx:77-79` — `LinkButton href="/tezgah"` → `copy.primaryCta` = **"Ücretsiz Hemen Dene (Kayıt Gerekmez)"** (`public.ts:15`).
2. `/tezgah` **korumalı değil** (`PROTECTED_KERNEL_PATHS` içinde yok) → misafir sayfayı görür. ✅ CTA tutuyor.
3. **Ama** `public.ts:74,90,101,117,123` beş ayrı yerde oturumsuz ziyaretçiyi korumalı sayfalara yolluyor:

| Kaynak | Satır | href | Kenar kararı |
|---|---:|---|---|
| `bench` (Hibe Proje Dosyası) | 74 | `/hibe` | `auth-307` → `/login` |
| `chain` adım 2 (Hibe & teşvik) | 90 | `/hibe` | `auth-307` → `/login` |
| `chain` adım 4 (E-ticareti yönet) | 101 | `/e-ticaret` | `auth-307` → `/login` |
| `tracks` (E-Ticaret Yönetimi) | 117 | `/e-ticaret` | `auth-307` → `/login` |
| `tracks` (Hibe & Teşvik Bulucu) | 123 | `/hibe` | `auth-307` → `/login` |

4. `lib/kernel/security/edge-guard.ts:42-52` — `PROTECTED_KERNEL_PATHS` `/hibe` ve `/e-ticaret` **içeriyor**.
5. `edge-guard.ts:321-328` — oturumsuzsa `{ kind: "auth-307", to: "/login" }`.

**Doğrulandı** (`decideEdgeAction(path, sessionVerified=false)`):

```
/hibe          → {"kind":"auth-307","to":"/login"}   ❌
/e-ticaret     → {"kind":"auth-307","to":"/login"}   ❌
/tezgah        → {"kind":"next"}                     ✅
/career        → {"kind":"next"}                     ✅
/vize          → {"kind":"next"}                     ✅
/sozluk        → {"kind":"next"}                     ✅
/tetkik        → {"kind":"next"}                     ✅
```

**Ticari etki:** Ana sayfadaki **5 çözüm yolu bağlantısının 5'i** kayıt/giriş ekranına düşüyor. "Kayıt Gerekmez" vaadi ilk bölümde tutulurken ikinci bölümde kırılıyor. `/hibe` sayfası da aynı sorunu taşıyor: `hibit` widget'ı sonuç gösterdikten sonra `LinkButton href="/hibe"` (`grant-eligibility-widget.tsx:186`) — kullanıcı ücretsiz skoru görüp "proje dosyasını aç" diyor, **giriş ekranı** görüyor.

**[İYİLEŞTİRME] Ek tutarsızlık:** `public.ts:19` `levelCta: "10 Dakikada Yetkinlik Testine Gir"` ve `:106` `tracksCta: "Ücretsiz Seviye Testine Gir"` — **ikisinin de üretim kullanımı 0** (ana sayfa bunları basmıyor). "Seviye Testi" `public-vitrine.ts:88-90` içinde ise **ücretsiz paket özelliği olarak listeleniyor**. Karşılık gelen bir "seviye testi" rotası yok (`app` altında `seviye|test|level` dizini yok; tek eşleşme `app/api/ilan/[slug]/sinav`). YetkinCV (`/career`) bu işi kısmen karşılıyor ama fiyat kartında ayrı bir "Seviye Testi" satırı olarak duruyor.

### 2.3 [YÜKSEK] Ödeme dönüşü — masa bilgisi ve dönüşüm sinyali kayıp

**A) `?masa=` parametresini hiçbir kod üretmiyor.**

```
app/(public)/kasa/donus/page.tsx:22   const rawDesk = query.masa;   // okuyor
kasa-return-panel.tsx:34-38           kasaReturnHref(desk)          // yönlendiriyor
```
Üretim tarafında `masa=` araması: **0 eşleşme** (`app`, `components`, `lib`, `scripts`). `buildPaytrDronCheckoutReturnUrl` (`wallet-checkout-passport.ts:158-171`) yalnız `sonuc` ve `kurs` yazıyor; `kurs` regex'i `/^[a-z0-9_]+$/` ve **`kasaReturnDesk` bu değeri tanımıyor** (`kasa-return-panel.tsx:27-35` yalnız `e-ticaret|eticaret|commerce|lisans|hibe|grant|dosya` kabul ediyor) → her durumda `"tezgah"` döner.

**Sonuç:** E-Ticaret lisansı veya hibe dosyası satın alan kullanıcı ödeme sonrası `/tezgah`'a düşüyor, satın aldığı ürünün ekranına değil.

**B) Tarayıcı ödemelerinin tamamı tek dönüş adresine gidiyor.**

```
lib/kernel/payments/paytr/checkout.ts:36    PAYTR_MERCHANT_WALLET_RETURN_PATH = "/cuzdan"
checkout.ts:385-388                          buildPaytrMerchantBrowserReturnUrl → `${base}/cuzdan`
```
Kullananlar: `lib/tezgah/checkout.ts:143`, `lib/commerce/subscription-checkout.ts:216`, `lib/junior/checkout-paytr.ts:184`. Üçü de `merchantOkUrl = merchantFailUrl = /cuzdan`. Yani Tezgâh Pro, kredi paketi, e-ticaret lisansı ve junior paketi ödemesi **cüzdan sayfasına** iniyor.

**C) `trackPurchase` ana akışta hiç çalışmıyor.**

```
components/kernel/kasa-return-panel.tsx:62   trackPurchase({ itemId: kasaReturnDesk(desk) })
```
Bu çağrı **yalnız** `/kasa/donus` sayfasında. `/cuzdan` dönüşünde `trackPurchase` **yok** — doğrulandı: `app/(kernel)/cuzdan/page.tsx` + `components/kernel/wallet-top-up-form.tsx` içinde 0 eşleşme. Cüzdan sayfasındaki tek dönüş davranışı `wallet-top-up-form.tsx:247-250`:

```tsx
onReturn={() => { setIframeUrl(null); router.refresh(); }}
```
Yani ödeme başarılı olduğunda yalnız sayfa yenileniyor; **hiçbir GA4 `purchase` olayı, hiçbir SEM dönüşümü gönderilmiyor.** `tests/kernel/ga4-funnel.test.ts:95` ise yalnız `kasa-return-panel.tsx` dosyasında `trackPurchase` **metnini** arıyor — davranışı değil.

**Ticari etki:** GA4 `purchase` olayı gerçek ödemelerin çoğunda tetiklenmiyor → **reklam kampanyaları ROI'siz görünür, dönüşüm optimizasyonu körleşir.** Bu, para harcanan bir platformda doğrudan ciro kaybıdır.

### 2.4 Fiyatlandırma ve paywall mimarisi — örnek niteliğinde

`lib/pricing/showcase-price.ts:44-56` ve `public-vitrine.ts:41-64` dürüstlük kuralını kodla zorluyor:

```ts
// public-vitrine.ts:57-64
href: live ? input.href : null,       // katalog satırı yoksa bağlantı YOK
honesty: price.honesty,
```
- Tutar yalnız `PriceCatalogEntry.amountMinor > 0 && isActive` iken "live" (`showcase-price.ts:86-96`).
- Katalog satırı yoksa `PUBLIC_COMMERCE_PLANNED_LABEL` basılıyor ve **CTA basılmıyor**.
- `app/(public)/fiyatlandirma/page.tsx:96-110` `planned` kartlarda butonu "Talebinizi bırakın" yapıyor.

To Hum: `prisma/migrations/20261118160000_launch_price_catalog/migration.sql:26-78` — `commerce/monthly` 1.490,00 TL, `tezgah/pro` 590,00 TL, `tezgah/credit-pack` 190,00 TL, `grant-dossier` 1.490,00 TL, `academy/team-seat` 4.900,00 TL. KDV dahil beyanı `legal-launch.ts:352` ile tutarlı.

**Kota/paywall mantığı sağlam:** `lib/tezgah/quota.ts` — misafir 3/gün, üye 3/gün (`catalog.ts:33-34`), tetkik ömür boyu 1 (`:36`), İstanbul gün anahtarı (`quota.ts:170-184`), `tryConsume` atomik `updateMany` + `usedCount < limit` (`:134-141`). Kredi hattı `beginTezgahCreditHold` → `commitTezgahCredit` ile idempotent (`paid-lane.ts:189-332`).

**[ORTA] Ödeme sonrası yetki tanımı anlık — doğrulandı:** `paid-lane.ts:368-378`
```ts
const catalog = await liveCatalogAmount(TEZGAH_PRO_MODULE, TEZGAH_PRO_UNIT);
if (catalog == null || catalog !== input.amountMinor) {
  return { applied: false, reason: "catalog" };   // tutar katalogla eşleşmezse yetki YOK
}
```
Tutar kilidi doğru; `readTezgahProActive` (`paid-lane.ts:73-80`) `status === "ACTIVE" && expiresAt > now` ile kontrol ediyor. **Ücretli özelliğe ödeme yapmadan erişim yolu bulunamadı.** Paywall gerçek.

**[İYİLEŞTİRME]** `app/(kernel)/cuzdan/page.tsx:61-64` `paymentsReady={isPaymentsPortConfigured() || isPaytrMockCheckoutAllowed()}` — mock checkout üretimde `true` ise `checkout` throw ediyor (`lib/tezgah/checkout.ts`), yani buton açık görünüp hata verir. Savunma var ama UX kırılgan.

### 2.5 Eksik ticari güven unsurları

| Unsur | Durum | Kanıt |
|---|---|---|
| **Sosyal kanıt / referans** | ❌ **Yok** | `referans\|testimonial\|müşteri yorum\|trustpilot` araması yalnız `lib/copy/guides.ts` (metin içi) ve junior içerik dosyalarında eşleşiyor. Hiçbir sayfada müşteri logosu, yorum, vaka çalışması veya sayı yok. |
| KVKK / Gizlilik | ✅ Güçlü | `lib/copy/legal-launch.ts:180-410` — 5 bölüm, veri sorumlusu, saklama, m.11 |
| Kullanım koşulları | ✅ | `LEGAL_SECTION_TITLES.terms`, `:369-406` |
| Mesafeli satış / ön bilgilendirme | ✅ | `:316-365` — B.5 dijital ifa istisnası, B.7 hakem heyeti |
| Çerez politikası + onay bandı | ✅ | `cookie-consent-banner.tsx`, `COOKIE_CONSENT_COPY` |
| İletişim / destek | ✅ | `/iletisim` — e-posta, WhatsApp `0551 675 16 74`, künye |
| SSS | ✅ | `HOME_LANDING_FAQ` (4), `CAREER_LANDING_FAQ` (3), `GUIDE_FAQ` (3), `VIZE_LANDING_FAQ` (2) |
| **Geri bildirim mekanizması** | ⚠️ Kısmi | `/iletisim` var; ürün içi geri bildirim/puanlama/NPS yok. `feedback\|geri bildirim` üretim kodunda yalnız `grant-eligibility-widget` hata metninde |
| **Fiyat karşılaştırma tablosu** | ⚠️ Zayıf | `fiyatlandirma/page.tsx` 6 kart `md:grid-cols-2` — özellik satırları kart başına düz metin (`featureLines` cümle bölme, `:21-27`); yan yana karşılaştırma yok |
| **Kurumsal referans / sertifika** | ❌ | `ORGANIZATION_SAME_AS = [LEGAL_WHATSAPP_HREF]` (`json-ld.ts:34`) — tek sosyal kanal WhatsApp |
| **İade/iptal kolaylığı** | ✅ | `WalletRefundButton`, `LEGAL_WALLET_UNUSED_BALANCE_PARAGRAPH` |
| **Şeffaf SLA** | ⚠️ | `/iletisim`: "genelde 1 iş günü" — bağlayıcı değil |

**[YÜKSEK]** Ücretli bir B2B/B2C platformunda **tek bir müşteri referansı, logo duvarı, kullanım sayısı veya vaka çalışması bulunmuyor.** Fiyat dürüstlüğü ve yasal şeffaflık örnek düzeydeyken sosyal kanıt tamamen eksik — dönüşümde en büyük tek engel.

---

## 3. Hata, Kusur ve Güvenlik Taraması

### 3.1 Build / lint / tip durumu (çalıştırıldı)

```bash
npx tsc --noEmit          → ✅ 0 hata (64 sn)
npx next build            → ✅ başarılı (129 sn, exit 0)
npx vitest run            → ✅ 1905 test / 358 dosya geçti (120 sn)
npx tsx scripts/verify-api-auth.ts --check    → ✅ 132 route, sapma yok
npx tsx scripts/verify-no-secrets.ts          → ✅ OK
npx tsx scripts/verify-boundaries.ts          → ✅ OK
npx eslint .              → ❌ 3 error, 3 warning
```

**[YÜKSEK] Lint kırık — CI bu komutu koşarsa kırmızı:**

| Dosya | Satır | Kural | Önem |
|---|---:|---|---|
| `components/kernel/admin-ai-model-desk.tsx` | **245** | `react/no-unescaped-entities` — kaçırılmamış `'` | [ORTA] |
| `tests/ui/rehber-workflow-surface.test.ts` | **31, 39** | `@next/next/no-assign-module-variable` | [ORTA] |
| `components/junior/animated-simulations.tsx` | 719 | `react-hooks/exhaustive-deps` — `tabs` her render'da değişiyor | [ORTA] |
| `components/junior/player/scene-plate.tsx` | 70 | `@next/next/no-img-element` | [DÜŞÜK] |
| `components/legal/secure-payment-marks.tsx` | 51 | `@next/next/no-img-element` | [DÜŞÜK] |

`package.json:11` `"lint": "eslint ."` tanımlı ama `build` zincirinde (`:10`) **çağrılmıyor** — bu yüzden `next build` yeşil geçiyor. Repo'da lint kapısı yok.

### 3.2 TODO / FIXME / mock / hardcoded secret taraması

**Sonuç: temiz.** `TODO|FIXME|HACK|XXX|@ts-ignore|@ts-expect-error` aramasında üretim kodunda yalnız:

- `lib/tezgah/tetkik/revision.ts:102-105` — `90XXXXXXXXXX` placeholder. **Bilinçli**: üretilen öneri metninde kullanıcıya "kendi hattınızı yazın" diyor. `tests/tezgah/tetkik-revision.test.ts:49` bunu mühürlüyor. ✅
- `lib/kernel/identity/billing-info.ts:15,173` — `05XX XXX XX XX` telefon format ipucu. ✅
- `lib/academy/lesson-body.ts:764` — ders gövdesinde `TODO|FIXME` **filtreleyen** regex. ✅ Savunma amaçlı.

**Hardcoded anahtar:** `sk_live_`, PEM private key, `api_key = "..."` araması → yalnız `scripts/verify-no-secrets.ts` dedektörü ve `lib/kernel/telemetry/ga4-data-client.ts:192,200` (PEM **format doğrulaması**). Gerçek sır yok. `verify:no-secrets` yeşil.

**`.env.example`:** 300+ satır, tüm değerler boş, yorumlar üretim reçetesini anlatıyor (`PAYTR_SANDBOX="1"` lab satırı açıkça "üretime kopyalanmaz" notlu). ✅

### 3.3 [İYİLEŞTİRME] Test amaçlı / demo veri üretim yüzeyinde

- `lib/tezgah/catalog.ts:170-177` `ECOMMERCE_CATEGORY_CHIPS` — ürün kategorisi çipleri, UI verisi. ✅
- `lib/freelancer/listing-face.ts` → `partitionFreelancerBoardJobs` "example board" örnek ilanlar basıyor (`app/freelancer/page.tsx:66-88`). `/freelancer` kenarda **her koşulda 410** (`FREELANCER_PUBLIC_SURFACE_LOCKED = true`, `circuit-breakers.ts:38`), yani erişilemez. ✅ Erişilemez ama ölü UI kodu.
- `app/(public)/magaza/[slug]/page.tsx:52-56` — "Rafta henüz satılabilir ürün yok" boş durumu var. ✅

### 3.4 Hata yakalama, boş durum, yükleme durumu

**Hata sınırları (error boundaries):** 8 adet — `app/error.tsx`, `(kernel)/cuzdan`, `(public)/fiyatlandirma`, `(public)/kasa`, `career`, `dashboard`, `freelancer`, `junior`, `tezgah`.

**[ORTA] `global-error.tsx` yok.** Kök `layout.tsx` seviyesinde bir çökme (CSP nonce, `cookies()`, `JsonLd`) olduğunda Next'in varsayılan beyaz ekranı görünür; markalı/kopya uyumlu bir kurtarma yok.

**[ORTA] `error.tsx` `retry` prop'u sürüm sınırında.** `app/error.tsx:11-17` `retry: () => void` kullanıyor. Next dokümanı: `retry` **`v16.3.0`'da stable**, `unstable_retry` `v16.2.0`'da eklenmiş (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md:331-332`). `package.json:131` `"next": "^16.2.9"` — **16.2.x kurulursa prop `undefined` olur ve "Tekrar dene" butonu sessizce çalışmaz.** Kurulu sürüm 16.3.1 (doğrulandı) olduğu için bugün çalışıyor; `^` aralığı bu riski taşıyor. Minimum `"next": "^16.3.0"` olmalı.

**[ORTA] `error.tsx:34` `onClick={() => retry()}`** — `retry` undefined ise `TypeError`. Aynı desen `room-error.tsx` üzerinden 4 dosyada daha.

**Yükleme durumları:** 11 `loading.tsx` var — kök, `(auth)`, `(kernel)`, `legal`, `vize/[id]`, `career`, `dashboard`, `freelancer` (+3 alt). Kök `app/loading.tsx` tüm ağacı sardığı için `notFound()` durum kodunu 404'e çeviremiyor; bu bilinçli olarak `proxy.ts:203-218` ile kenarda çözülmüş (`missingPublicSurfacePath`). ✅ Bu, Next 16 soft-404 tuzağına karşı doğru mimari.

**Boş durumlar:** Sistematik — `magaza/[slug]` ("Rafta henüz satılabilir ürün yok"), `uzmanlar` (`directory.status === "empty"` → kilitli önizleme + "Sahte profil üretilmez"), `vize/[id]` (`missing`, `invalid-format`), `cuzdan` (`board === null` → `unboundBadge`), `profil` (`board === null` / `profile === null`), `fiyatlandirma` (planned kart).

**[İYİLEŞTİRME] Form validasyonları:** `register-form.tsx` güçlü — `withWatchdog` timeout (`:32-46`), `ageConfirmed` zorunlu (`:143-147`), `role="alert"` (`:308-310`), `role="status"` (`:318`), resend akışı (`:196-222`). `grant-eligibility-widget.tsx:41-45` boş alan kontrolü + hata temizleme. `workbench.tsx:153-200` `fieldReady` alan bazlı doğrulama (telefon 10-12 hane, ölçü 1-8000 px, çalışan ≤100.000). **Bu kalite seviyesi tüm formlarda değil:** `components/kurumsal/offer-form.tsx` yalnız sunucu tarafı doğrulamaya güveniyor (`app/api/lead/route.ts:37-44`); istemci tarafı `clip` yok, kullanıcı 120 karakter üstü firma adı yazarsa sessizce kırpılır.

### 3.5 Yetkilendirme / kimlik doğrulama

**[İYİ] 132 API rotasının tamamı sınıflandırılmış.**

```
{"session":73, "public":25, "closed":11, "cron":2, "admin":13, "webhook":8, "hybrid":0, "internal":0}
```
`verify-api-auth --check` disk ile birebir. `lib/kernel/security/route-auth-map.ts` üretilmiş ve güncel — bu, Next.js projelerinde nadir görülen bir disiplin.

**Kenar K6 kapısı** (`edge-api-auth.ts:146-209`):
- `public` / `webhook` / `closed` imzasız geçer (webhook HMAC'i handler'da). ✅
- `session` → doğrulanmış JWT yoksa `401`. ✅
- `admin` → `isSuperAdminActor` değilse `403`. ✅
- `cron` → `Bearer ${CRON_SECRET}`, boş sır `503`, yanlış başlık `401`. ✅
- Haritada olmayan `/api/*` → `404` (fail-closed). ✅

**[KRİTİK DEĞİL ama YÜKSEK] `public` sınıfındaki 25 rota LLM/DB maliyeti taşıyor.** Örnek: `/api/tezgah/generate` (`auth = "public"`, `route.ts:15`) misafire açık ve `generateTezgahOutput` çağırıyor. Koruma: `llmIp` 20/10dk (`http-rate-limit.ts:29`) + günlük 3 üretim kotası (`quota.ts`). **Ancak** `llmIp` anahtarı IP'dir ve `TRUSTED_PROXY_HOPS` yanlış yapılandırılırsa spoof edilebilir. `env.example:307-310` bunu doğru anlatıyor (`TRUSTED_PROXY_HOPS="2"` öneriliyor) ama **varsayılan 1** (`resolveTrustedForwardedIp`), yani Cloudflare+Vercel arkasında XFF'nin ilk değeri kullanılıyorsa kota atlatılabilir.

**[YÜKSEK] Dağıtık hız tavanı yoksa maliyet koruması tek örneğe bağlı.** `rate-limit-runtime.ts:22-37`:
```ts
if (restUrl && token) return "redis-rest";
if (restUrl || token) return "fail-closed-partial";
return "in-process-single-node";   // ← varsayılan
```
`RATE_LIMIT_REDIS_REST_URL` ve `_TOKEN` boşsa **her Vercel örneği kendi belleğinde** sayıyor. Serverless'ta N örnek = N × 20 istek/10dk LLM. `env.example:313-315` bunu belgeliyor ama **üretimde dolu olduğunu doğrulayan bir kontrol yok** — `ops:runtime-readiness` yalnız Inngest/PayTR/SMTP kontrol ediyor (`instrumentation.ts:22-85`), rate-limit'i kontrol etmiyor.

**[İYİ] IDOR / origin / CSP mühürleri:**
- `origin-guard.ts` — çerezli web yazmalarında `Origin` / `Sec-Fetch-Site` fail-closed (`proxy.ts:260-271`).
- CSP nonce + `strict-dynamic`, `style-src 'unsafe-inline'` bilinçli istisna (`edge-guard.ts:112-120`) — gerekçe yorumda doğru açıklanmış.
- `wallet-checkout-passport.ts` — HMAC + TTL + `timingSafeEqual` (`:68-74`), `ServiceUnavailableError` üretimde fail-closed (`:47`).
- `verify:idor-seals` — 6 test dosyası (freelancer job board, party forbidden, direct offers, academy exam purchase, career portfolio).
- SSRF: `lib/tezgah/tetkik/guard.ts` — `BlockList` ile RFC1918/loopback/link-local/CGNAT + IPv4-mapped IPv6 (`:76-102`), `metadata.google.internal` (`:112`), scheme=`https` zorunlu, port 443 (`:136-139`), DNS sonrası **tekrar** kontrol (`resolveTetkikHost:161-180`). **Bu, örnek niteliğinde bir SSRF savunması.**

**[ORTA] SSRF'de TOCTOU penceresi:** `inspectTetkikUrl` DNS çözümünden önce çağrılıyor, `resolveTetkikHost` ayrı bir `lookup` yapıyor, `fetchPublicHomepage` ise üçüncü kez çözecek. DNS rebinding ile `resolveTetkikHost` public görüp `fetch` private IP'ye gidebilir. Yorum (`guard.ts:126`) "yönlendirmeden önce de çağrılır" diyor ama IP pinleme (`lookup` sonucunu `fetch`'e sabitleme) yok.

**[İYİLEŞTİRME] `/api/lead` e-posta doğrulaması:** `lead/route.ts:37-39` `EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Yeterli ama `z.email()` (`zod` 4.4.3 kurulu) daha katı olurdu; ayrıca `packageKey` `isKurumsalOfferPackage` ile doğrulanıyor ✅.

### 3.6 [ORTA] React hooks kusuru — gerçek render riski

`components/junior/animated-simulations.tsx:719` eslint: *"The 'tabs' logical expression could make the dependencies of useEffect Hook (at line 728) change on every render."*

Bu sadece bir uyarı değil: `tabs` her render'da yeni referans üretirse `useEffect` her render'da yeniden çalışır. Junior ders oynatıcısında animasyon/simülasyon bileşeni olduğu için **CPU döngüsü ve görsel titreme** riski taşır. Düzeltme: `useMemo`.

---

## 4. Teknik SEO ve İçerik Altyapısı

### 4.1 Güçlü yanlar (doğrulandı)

- **Kanonik disiplini:** `pageMetadata()` (`seo.ts:571-622`) her kamu sayfasına `alternates.canonical` + OG `url` + `locale: tr_TR` + Twitter card basıyor. Kök `layout.tsx:19-23` bilinçli olarak `alternates` **taşımıyor** — gerekçe yorumda doğru: çocuk rotalar ana sayfa kanoniğini miras alırdı.
- **`metadataBase`** tek yerde (`layout.tsx:25`), `CANONICAL_SITE_ORIGIN` sabiti (`seo.ts:8`) sitemap ile aynı.
- **OG görselleri:** 3 `opengraph-image.tsx` (kök, `/junior`, `/vize/[id]`) + 3 `twitter-image.tsx`. `isGeneratedOgImagePath` (`seo.ts:57-59`) yalnız üretilen rotalarda `width/height` basıyor — statik kapakta ölçü uydurmama kararı doğru.
- **`robots.ts`:** iki modlu (canlı / `LIVE_BROADCAST_SHUTDOWN`), sitemap referansı sabit.
- **Sitemap `lastmod`:** `readSitemapLastModified()` + `SITE_CONTENT_REVISED_AT` sabiti (`seo.ts:72`) — istek saati basmama kararı doğru; `dynamic = "force-dynamic"` (`sitemap.ts:51`) ile tutarlı.
- **JSON-LD:** `serializeJsonLd` (`json-ld.ts:59-68`) `<` → `\u003c` ve `@` → `\u0040` kaçışı yapıyor (Cloudflare email obfuscation çakışmasını önlemek için). `siteGraphJsonLd` Organization + WebSite grafını kök layout'ta basıyor (`layout.tsx:75`).
- **`hreflang`:** Site tek dilli (TR). `og:locale = tr_TR`, `inLanguage: "tr-TR"` (`json-ld.ts:98`), `<html lang="tr">` (`layout.tsx:69`). Çok dillilik **yok**, dolayısıyla `hreflang` eksikliği doğru tercih. ✅
- **`keywords`:** yalnız ana sayfa ve `/junior`'da (`seo.ts:37, 219`) — spam sinyali üretmiyor.

### 4.2 Sitemap — doğrulanmış çıktı ve tek gerçek eksik

Sitemap çalıştırılarak üretildi (`npx tsx -e "import sitemap from './app/sitemap'; ..."`). **Sonuç: 64 giriş.**

```
Statik + yasal (19): / /rehber /career /tezgah /fiyatlandirma /kurumsal /vize
                     /uzmanlar /sozluk /tetkik /legal /legal/junior-veli
                     /legal/gizlilik /legal/cerez /legal/iade
                     /legal/mesafeli-satis /legal/kullanim /hakkimizda /iletisim
Sözlük (30)        : /sozluk/muhur … /sozluk/xp
Rehber (15)        : /rehber/trendyol-urun-aciklamasi … /rehber/sosyal-medya-icerik-plani
```

✅ `/hakkimizda` ve `/iletisim` **sitemap'te var** — `sitemap.ts:42-46` `LEGAL_SITE_PATHS`'ı ekliyor ve `LEGAL_FOOTER_LINKS` (`legal-launch.ts:443-444`) bu iki yolu taşıyor. Bu doğru davranış. **Ancak** bu dolaylı yoldan geliyor: `SITEMAP_STATIC_PATHS` (`seo.ts:275-287`) onları yazmıyor, yasal footer listesinden sızıyorlar. Bakım riski: `/hakkimizda` footer'dan çıkarılırsa sitemap'ten sessizce düşer.

**Tek gerçek sitemap eksiği: `/magaza/[slug]`.** Dinamik vitrinler (`public-surface-gate.ts:68-118` slug biçimini doğruluyor, `storefront-load.ts` içeriği okuyor) sitemap'e girmiyor. Kamuya açık, `index` engellenmemiş (`ROBOTS_DISALLOW_PATHS` içinde `/magaza` yok). İç bağlantı **var** — `/magaza/[slug]` üç yerde üretiliyor:
- `app/(kernel)/e-ticaret/page.tsx:55` → `const storefrontPath = \`/magaza/${store.value.slug}\``
- `lib/career/action-plan.ts:444` → `const storeHref = live.activeStore ? \`/magaza/${live.activeStore.slug}\` : null`

Yani keşif **oturumlu** panelden yürüyor, kamu taramasından değil. Sitemap/`ItemList` şeması eklendiğinde index hızlanır.

**[ORTA] `/sozluk` ve `/tetkik` iç bağlantısızlığı** (§1.4): sitemap priority **0.8** ile en yüksek ikinci kademede olmalarına rağmen siteden **0** bağlantı alıyorlar. Google için sitemap + iç bağlantı sinyali çelişiyor; "yetim sayfa" tespiti indekslemeyi geciktirir.

### 4.3 [YÜKSEK] Ölü şema katmanı ve içerik borcu

`courseJsonLd` (`json-ld.ts:255-377`) 122 satırlık Course + CourseInstance + Offer + Syllabus üretiyor. `educationalOccupationalProgramJsonLd` (`:386-437`) 51 satır. İkisinin de **üretim kullanımı 0**. `/academy` sayfası olmadığı için hiçbir yerde basılamıyorlar.

Buna karşılık `/junior` **canlı ve doğru**: `juniorLandingJsonLd()` doğrudan `app/junior/page.tsx:74`'te çağrılıyor, `juniorPublicLessonJsonLd` ise `app/junior/ders/[lessonKey]/page.tsx:95,160` içinde basılıyor. `juniorOnlineCourseJsonLd` (`json-ld.ts:445-487`) `lib/junior/seo.ts` üzerinden bu iki zincire bağlı — yani **Junior şeması sağlam.**

**SEO borcu özeti:** Semantik HTML ve şema altyapısı üst düzey; ancak **en büyük şema yatırımı (kurs) hedef sayfası olmadığı için kapalı bir ölü halkada duruyor.**

### 4.4 [ORTA] Semantik HTML

- **`h1` hiyerarşisi:** Kamu sayfalarının çoğu `PublicHero` (`public-hero.tsx:23-27`) veya `PageHeader` (`page-header.tsx:52-80`) üzerinden **tek `h1`** basıyor. ✅
- **`h1` içermeyen sayfalar:** `app/(kernel)/cuzdan`, `/profil`, `/pasaport`, `/hibe`, `/e-ticaret`, `/dashboard`, `/tezgah` — hepsi `PageHeader` (h1 üretir) kullanıyor ✅.
- **`alt` etiketleri:** Yalnız 2 `<img>` var ve ikisi de `alt` taşıyor (`secure-payment-marks.tsx:51`, `course-cover-image.tsx:37,52`). `next/image` kullanımı **1 dosya** — geri kalan görseller CSS `background` veya SVG.
- **Favicon:** `public/favicon.ico` **var** (doğrulandı); `app/favicon.ico` yok, `public/`'den servis ediliyor ve `next.config.ts:289` immutable cache basıyor. ✅
- **`aria`:** 177 `aria-label`, 30 `role="alert"|"status"` — erişilebilirlik ciddiye alınmış.
- **Atlanmış başlık seviyesi:** `app/(public)/fiyatlandirma/page.tsx` — h1 (`:129`) → h2 (`:155, 181`) → h3 (kart başlıkları `:89`) ✅ doğru sıra. `app/(public)/page.tsx` — h1 (`:72`) → h2 (`:99, 135, 164`) → h3 (`:110, 143, 173`) ✅.

### 4.5 [ORTA] Canonical çakışması riski — `/dashboard` ve `/vize`

- `/vize` ve `/vize/[id]` **aynı** `pageMetadata` tabanını kullanıyor (`vize/page.tsx:17`, `vize/[id]/page.tsx:82-113`). `[id]` bulunamadığında `path: PAGE_SEO.publicTalent.path` (`:113`) → **`/vize/[id]` sayfası `/vize` kanoniği basıyor.** Bu doğru davranış (bulunamayan kart kanonik listeye işaret eder) ama aynı zamanda `robots: index` kalıyor; **soft-404 sinyali**. Sitemap'e girmiyor, ama Google keşfederse "bulunamadı" sayfasını indeksleyebilir. `noindex` daha doğru olurdu.
- `/tetkik/[hash]` doğru yapılmış: `robots: { index: false, follow: true }` (`tetkik/[hash]/page.tsx:23`).

### 4.6 [İYİLEŞTİRME] Çok dillilik

Site tek dilli (TR). `app/en/*` yalnız `next.config.ts:159-178` içinde 4 adet 301 kuralı olarak yaşıyor — eski `/en` öneki temizlenmiş. ✅ Tutarlı. Gelecekte EN eklenecekse `pageMetadata` `alternates.languages` alanı taşımıyor (`seo.ts:592`) — hazır değil.

---

## 5. Hız ve Performans

### 5.1 Doğru kararlar (doğrulandı)

- `next.config.ts:50` `compress: true`, `:51` `poweredByHeader: false`
- `:86-89` `images.formats = ["image/avif","image/webp"]`, `minimumCacheTTL: 31536000`
- `:14-19` `IMMUTABLE_STATIC_CACHE` — medya/ikon için `max-age=31536000, immutable`
- `vercel.json` `regions: ["fra1"]` — tek bölge, TTFB tutarlı
- `layout.tsx:58-61` `RequestBoundCsp` + `connection()` — dinamik HTML, kenar cache yok (CSP nonce bedeli bilinçli kabul edilmiş)
- `proxy.ts:328-332` matcher statik gövdeyi (`_next/static`, `_next/image`, `media/`, fontlar) worker dışında tutuyor
- `instrumentation.ts:7-8` — Prisma ısınması **yok**, gerekçe doğru (kamu HTML TTFB'si)
- `@font-face` / `next/font` **yok** — sistem font yığını (`globals.css` `"Segoe UI"`), render-blocking font isteği sıfır. `tests/kernel/performance-headers-surface.test.ts:82-83` bunu mühürlüyor. ✅

### 5.2 [YÜKSEK] CSS tek dosyada 163 KB

```
app/globals.css → 7.013 satır / 163,6 KB / 869 seçici / 24 @media / 7 !important
```

Bu dosya **her** sayfada yükleniyor. Tailwind 4 `@import "tailwindcss"` (`:1`) ile başlıyor ama geri kalanı elle yazılmış özel CSS. 163 KB sıkıştırılmamış ≈ ~20-25 KB Brotli, yani kritik yolda ~1 ek RTT değerinde. **Daha önemlisi:** 7.013 satır tek dosyada = bakım borcu; ölü seçici tespiti imkânsız.

**Öneri:** `@layer` ile bölmek, `:root` token'larını ayrı dosyaya almak, kullanılmayan seçicileri `postcss` ile ayıklamak.

### 5.3 [YÜKSEK] İstemci chunk toplamı 4,1 MB / 153 `"use client"`

```
.next/static/chunks → 4.162 KB / 80 dosya
En büyük 5:  558 KB · 405 KB · 277 KB · 230 KB · 223 KB
"use client" → 153 / 320 .tsx (%48 birleşik)
               144 / 224 components .tsx (%64)
```

**Dikkat çeken nokta:** `app/` altında 96 `.tsx`'in yalnız **9'u** istemci (%9) — sayfa katmanı doğru kurgulanmış. Buna karşılık `components/` altında **144/224 (%64)** istemci. Yani mimari disiplin sayfa seviyesinde korunmuş, bileşen seviyesinde kaybolmuş.

**En ağır istemci bileşenleri ve gerekçeleri:**

| Bileşen | Boyut | Değerlendirme |
|---|---:|---|
| `components/tezgah/workbench.tsx` | **1.400+ satır** | Tüm 10 aracı, 4 önizleme türünü (`DukkanPreview`, `PazaryeriPreview`, `ProStudioPreview`, `TetkikReportView`) ve `GrantDetailWizard`'ı tek `"use client"` dosyada topluyor. `app/tezgah/page.tsx:41-44` `<Suspense>` ile sarıyor ✅ ama **tek sekme açan kullanıcı 10 aracın kodunu indiriyor.** |
| `components/junior/animated-simulations.tsx` | — | §3.6 hooks kusuru + ağır animasyon |
| `components/shell/user-hub.tsx` | 12,9 KB | Her AppShell sayfasında |
| `components/kernel/admin-ai-model-desk.tsx` | — | Yalnız `/admin`'de, sorun değil |

**Öneri:** `workbench.tsx` içindeki her araç `next/dynamic` ile tembel yüklenmeli; `DukkanPreview`/`PazaryeriPreview`/`ProStudioPreview`/`TetkikReportView` yalnız o sekme açıldığında indirilmeli. Tahmini kazanç: ilk yüklemede **%40-60 chunk azalması**.

**[İYİLEŞTİRME] `tezgah/layout.tsx` içinde `<style>` bloğu** (`:6-25`) — 20 satır ham CSS React ağacında. `globals.css`'e taşınmalı; şu hâliyle her `/tezgah` isteğinde inline `<style>` basılıyor.

### 5.4 [YÜKSEK] Medya ağırlığı ve `next/image` yokluğu

```
public/ toplam → 1.614 MB / 530 dosya
├── public/media/junior/  → 1.558,5 MB / 309 dosya   (CDN'de, .vercelignore ile hariç ✅)
├── public/academy/cinema →   35,4 MB / 207 dosya    (17 dosya > 300 KB)
└── public/media/academy  →   19,2 MB / 8 dosya
```

**En büyük tek dosyalar:** 17,55 MB (`jr_06_fen-2.mp3`), 16,77 MB, 16,75 MB, 16,42 MB. Bunlar `.vercelignore:17-19` ve `next.config.ts:29-35` ile CDN'e taşınmış — **doğru mimari**. ✅

**Sorun:** `public/academy/cinema/` 207 JPG, **35,4 MB** ve 17 tanesi 300 KB üzeri (en büyük 425,8 KB). Bu dosyalar `/academy/cinema/:path*` ile `immutable` cache alıyor (`next.config.ts:273-275`) ama:
- `next/image` yalnız **1** dosyada kullanılıyor → optimizasyon yok
- `/academy` sayfası olmadığı için bu 35 MB **hiçbir canlı sayfada kullanılmıyor** — dağıtım paketinde taşınıyor, okunmuyor. **Ölü ağırlık.**

**[ORTA] `public/media/junior/` yerel kopyası:** `.gitignore` ve `.vercelignore` ile hariç, ama **disk üzerinde 1,5 GB** duruyor. Geliştirici makinesinde `next dev` bu klasörü taramaz (matcher dışı) ✅; yine de repo klonlama ve CI süresini etkiler.

**[ORTA] LCP görseli:** `app/(public)/page.tsx` hiç `<Image>` kullanmıyor — ana sayfa LCP'si **metin** (H1). `HomeAccountNav` yorumu (`:6-8`) "LCP AVIF" diyor ama sayfada AVIF yok. Yorum gerçek kodla uyuşmuyor — yanıltıcı.

### 5.5 [ORTA] N+1 ve önbellekleme

**[ORTA] `app/(public)/magaza/[slug]/page.tsx:21-33 + :36`** — `generateMetadata` ve `page` **aynı** `loadPublicStorefront(slug)` çağrısını yapıyor. React `cache()` sarmalayıcısı yok (`lib/commerce/storefront-load.ts` içinde kontrol edilmeli). Her vitrin isteği **2 DB sorgusu**.

**[İYİ] `lib/pricing/public-vitrine.ts:73-77`** — `Promise.all` ile 3 katalog satırı **paralel** okunuyor. ✅

**[İYİ] `app/dashboard/page.tsx:28-34`** — 5 kaynak `Promise.all` ile paralel, her biri `.catch()` ile fail-safe. ✅

**[ORTA] `app/career/page.tsx:64-81`** — `loadCareerActionStores` içinde `for` döngüsü var ama DB çağrısı döngü dışında (`listCommerceStores` tek çağrı), içinde dizi kuruyor. ✅ N+1 yok.

**[ORTA] `readEcommerceLicenseBand`** (`lib/commerce/os-license-band.ts:8-33`) — `pickPoolStore` sonrası `loadOwnerLicense` tek çağrı. ✅

**[YÜKSEK] Cache stratejisi yok.** `app` altında tek bir `revalidate` tanımı bile yok (`grep` → yalnız `dynamic = "force-dynamic"` 10 dosyada). Sitemap, `/sozluk`, `/rehber/[slug]`, `/legal/[slug]` gibi **tamamen statik** içerikler dahil her şey istek anında render ediliyor. `(public)/layout.tsx` + kök `layout.tsx` `cookies()` çağırdığı için (`layout.tsx:68`) tüm ağaç dinamik. **Kazanç fırsatı:** bu 4 sayfa grubu `"use cache"` veya `revalidate = 3600` ile statikleştirilebilir; TTFB belirgin düşer.

### 5.6 [ORTA] Bloklayıcı scriptler

- **PayTR iframeResizer** (`paytr-checkout-iframe.tsx:45-58`) — `document.createElement("script")` + `async = true` ✅ render-blocking değil.
- **GA4** (`Ga4Bootstrap`) — çerez onayına bağlı (`layout.tsx:79`), onay yoksa yüklenmiyor ✅. KVKK uyumu ve performans birlikte doğru çözülmüş.
- **`NavigationProgressBar`** (`layout.tsx:76`) — her sayfada; `"use client"` bileşen, Suspense yok. Küçük ama kritik yolda.

### 5.7 [İYİLEŞTİRME] Gereksiz `"use client"` adayları

`components/shell/navigation-progress-bar.tsx`, `components/shell/header-breadcrumb.tsx` (3,4 KB, yalnız `usePathname`), `components/legal/cookie-consent-banner.tsx` (2,3 KB). `usePathname` istemci gerektirir; ama `header-breadcrumb` sunucuda prop olarak `pathname` alabilir.

---

## 6. Ticari ve Ürünselleştirme Önerileri (öncelik sırası)

### P0 — Yayın güvenliği (1-3 gün)

**1. 301 → 410 zincirini kır.**
- **Seçenek A (hızlı):** `lib/academy/retired-storefront.ts:156-162` hedefini `/` veya `/career` yap. SEO otoritesi yaşayan bir sayfaya akar.
- **Seçenek B (doğru):** `next.config.ts:181` `...retired` bloğunu **kaldır**; `/academy/*` doğrudan 410 kalsın. Google 410'u 404'ten hızlı işler ve yönlendirme sinyali üretmez.
- **Öneri:** B. Ardından `retiredAcademyVerifyPath` (`edge-guard.ts:152-159`) `/vize/:hash` yönlendirmesini **koru** — o çalışıyor ve değerli.

**2. Ana sayfa CTA'larını gerçek ürün yüzeylerine bağla.**
- `public.ts:74,90,123` (`/hibe`) → ücretsiz `GrantEligibilityWidget` zaten ana sayfada; bağlantı `#home-grant` çapasına dönmeli veya `/hibe` **korumasız vitrin** moduna alınmalı (oturumsuz önizleme + girişte tam kokpit).
- `public.ts:101,117` (`/e-ticaret`) → `buildCitizenRegisterHref("/e-ticaret")` ile **kayıt formuna `next` parametreli** git; kullanıcı giriş yaptığında hedefe düşsün. Bugün hedef kayboluyor (`/login` çıplak).

**3. Ödeme dönüşünü düzelt.**
- `buildPaytrMerchantBrowserReturnUrl` (`checkout.ts:385-388`) `desk` parametresi almalı: `buildPaytrMerchantBrowserReturnUrl(origin, "e-ticaret")`.
- `tezgah/checkout.ts`, `commerce/subscription-checkout.ts`, `junior/checkout-paytr.ts` çağrılarına masa ilet.
- `/cuzdan` dönüş sayfasına `trackPurchase` ekle **veya** tüm tarayıcı ödemelerini `/kasa/donus?sonuc=ok&masa=...`'a çevir (`emitPaytrIframeReturnIfEmbedded` zaten `/kasa/donus`'u tanıyor, `iframe-embed.ts:18`).

### P1 — Dönüşüm altyapısı (1 hafta)

**4. Sosyal kanıt katmanı kur.** (§2.5 — en büyük tek eksik)
- Ana sayfaya 3 müşteri referansı + 1 vaka çalışması (`data-home-social-proof` test kancası).
- `/vize` dizininden **gerçek** doğrulanmış rozet sayısını ana sayfaya taşı (`publicAcademyProofCounts` zaten yazılmış, kullanılmıyor — `showcase-price.ts:32-45`).
- `/uzmanlar` eşiği dolduğunda "N doğrulanmış uzman" sayısını ana sayfada göster.
- **Uydurma yasak:** mevcut kod kültürü (§"Sahte profil üretilmez", `uzmanlar/page.tsx:28-34`) bunu gerektiriyor. Sayaç yoksa bölüm basılmamalı.

**5. Fiyatlandırmayı karşılaştırılabilir yap.**
- `fiyatlandirma/page.tsx:159-178` — 6 kartı `md:grid-cols-2` yerine **özellik matrisi** (satırlar: Tezgâh kotası, DOCX/ZIP, pazaryeri kanalı, hibe dosyası, YetkinCV, destek). Bugün `featureLines` (`:21-27`) cümleleri nokta ile bölüyor — satırlar hizasız.
- "Seviye Testi" satırını (`public-vitrine.ts:88-90`) **kaldır** veya gerçek ürün karşılığına bağla (`/career` YetkinCV). Bugün karşılığı yok.

**6. `?masa=` + GA4 purchase tek akışa indir** (madde 3 ile birlikte) ve `tests/kernel/ga4-funnel.test.ts:95`'i **davranış testine** çevir — dosyada metin aramak yerine `/cuzdan` dönüşünde `purchase` olayının tetiklendiğini doğrula.

### P2 — SEO ve keşif (1 hafta)

**7. Yetim sayfaları bağla.**
- `/sozluk`: ana sayfa `tracks` altına veya footer'a "Sözlük" ekle; `lib/copy/legal-launch.ts:437-450` `LEGAL_FOOTER_LINKS`'e girmemeli (yasal değil) — bunun yerine `(public)/page.tsx` içine bir "Kaynaklar" bölümü.
- `/tetkik`: `app/(public)/page.tsx:157-161` `GrantEligibilityWidget`'ın hemen altına "Siteniz kaç puan?" kartı; `tetkik` CTA'sı zaten `/tezgah?tool=tetkik` üzerinden dolaylı var, doğrudan bağlantı ekle.
- `/magaza/[slug]`: sitemap'e `loadPublicStorefront` listesiyle ekle **veya** `ROBOTS_DISALLOW_PATHS`'a al.

**8. Ölü şema katmanını temizle veya canlandır.**
- `/academy` geri gelmeyecekse `courseJsonLd` + `educationalOccupationalProgramJsonLd` + `academyCourseSeoOverride` + `OFFICE_AI_*_SEO` (450 satır) ve onları doğrulayan **8 test dosyası** silinmeli. `tests/copy/seo-surface.test.ts` 1.400+ satır — büyük kısmı ölü ürünü mühürlüyor.
- `lib/academy` 2.711 KB / 171 modül: **51'i canlı, 120'si dış referanssız.** Canlı kalanlar (`load.ts` `/vize` doğrulaması için, `pilot-sku`, `production-seal`, `off201-catalog-slot`) ayrılmalı, satış yüzeyine ait olanlar `archived/`'e taşınmalı. **Dikkat:** `/vize` sertifika doğrulaması bu kütüphaneye bağlı — toptan silme o sayfayı kırar.

**9. `hreflang` hazırlığı.** Bugün gerekli değil; EN planlanıyorsa `pageMetadata`'ya `alternates.languages` alanı eklenmeli (`seo.ts:592`).

### P3 — Performans (1-2 hafta)

**10. `workbench.tsx` böl.** 1.400 satır → 10 araç ayrı dosya + `next/dynamic`. Hedef: `/tezgah` ilk yüklemesinde %40-60 chunk azalması.

**11. `globals.css` böl.** 7.013 satır → Tailwind `@layer` + token dosyası + sayfa bazlı CSS modülleri. Hedef: kritik CSS < 40 KB.

**12. Statik içeriği cache'le.** `/sozluk`, `/sozluk/[terim]`, `/rehber/[slug]`, `/legal/[slug]`, `/sitemap.xml` için `revalidate = 3600` veya `"use cache"`. Bu sayfalar `cookies()` kullanmıyor; bugün gereksiz yere dinamik.

**13. `next/image`'a geç.** `academy/cinema` 35 MB'ı `/academy` ile birlikte sil veya `next/image` ile sun. `secure-payment-marks.tsx:51` → `<Image>`.

**14. Dağıtık hız tavanını zorunlu kıl.** `RATE_LIMIT_REDIS_REST_URL`/`_TOKEN` boşsa `ops:runtime-readiness` **exit 1** vermeli. Aksi hâlde LLM maliyet koruması örnek sayısıyla çarpılır (§3.5).

### P4 — Ürün genişleme (vadeli)

**15. Junior'ı büyüt — en hazır varlık.** `docs` ve `lib/junior` (1.558 MB medya, 5 branş, akustik altyapı, veli onayı) tam ürün. `DRON_JUNIOR_ROOM_OPEN` ile açılıyor ama `robots: index:false` (`junior/page.tsx:35`). Veli arama niyeti ("6. sınıf matematik dersleri") yüksek hacimli; **index açılıp `/junior/ders/[lessonKey]` sitemap'e eklenirse** organik trafik kanalı doğar. Marka ayrımı (`JUNIOR_SEO_BRAND`, `JUNIOR_TITLE_TEMPLATE`) zaten hazır.

**16. YetkinCV'yi B2B çekirdeğe çevir.** `/kurumsal` (`kurumsal-screening.ts` 15,7 KB + `kurumsal-screening-load.ts` 15,4 KB) ağırlıklı puanlama, kısa liste, ilan bazlı baraj — tam bir ATS. Bugün "self-servis talep formu" (`offer-form.tsx` → `/api/lead` → DB). **Ürünleştirme:** koltuk bazlı abonelik (`price_catalog_entries` `academy/team-seat` 4.900 TL zaten var) + `/kurumsal/ilanlar` kokpiti. Türkiye'de KOBİ İK pazarı büyük ve rakip zayıf.

**17. Hibe modülünü ayrı ürün yap.** `lib/yetkinhibe` + KOSGEB/TÜBİTAK/ihracat eksenleri (`grant-brief-axes.ts`) + proje dosyası üretimi (`grant-project-report`). Katalogda 1.490 TL. **KOSGEB başvuru dönemlerinde** talep patlaması olur — kampanya takvimi kurulmalı.

**18. Growth döngüsü: `/vize`'yi viral yap.** Her YetkinCV/Akademi mührü paylaşılabilir kamu kartı üretiyor (`/vize/[id]` + OG image). **Eksik:** paylaşım CTA'sı kartın kendisinde yok — `public-talent-board.tsx` içine LinkedIn "Add to profile" + WhatsApp + kopyala bağlantı eklenmeli (`SealShareGuides` var ama `/career` oturumlu tarafında). Her mühür = 1 organik backlink fırsatı.

**19. Kurumsal güven sayfası.** §2.5'te referans yok. B2B satışta (`/kurumsal`, 4.900-7.900 TL aralığı) referanssız kapanış zor. 3 pilot müşteri + 1 vaka çalışması, fiyat sayfasından daha çok dönüşüm getirir.

---

## 7. Bulgu Dizini (Tedavi Raporu için)

| # | Önem | Bulgu | Dosya | Satır |
|---|---|---|---|---|
| 1 | `[KRİTİK]` | 106 retired slug 301 → `/academy` → 410 (**341 kuralın 321'i**) | `next.config.ts` + `lib/academy/retired-storefront.ts` | 181 / 156-162 |
| 2 | `[KRİTİK]` | Ana sayfa 5 CTA korumalı sayfaya gidiyor | `lib/copy/sen-voice/public.ts` | 74, 90, 101, 117, 123 |
| 3 | `[KRİTİK]` | `?masa=` hiç üretilmiyor; tüm ödemeler `/cuzdan`'a düşüyor | `lib/kernel/payments/paytr/checkout.ts` | 36, 385-388 |
| 4 | `[KRİTİK]` | `trackPurchase` yalnız `/kasa/donus`'ta → GA4 purchase kayıp | `components/kernel/kasa-return-panel.tsx` | 62 |
| 5 | `[YÜKSEK]` | `/academy` diskte yok; 171 modülün 120'si dış referanssız | `app/api/academy/**`, `lib/academy/**` | — |
| 6 | `[YÜKSEK]` | 450+ satır kurs SEO/JSON-LD kapalı ölü halka (0 ithalatçı) | `lib/copy/seo.ts`, `lib/copy/json-ld.ts` | 355-520 / 255-437 |
| 7 | `[YÜKSEK]` | Lint kırık: 3 error, 3 warning; build zincirinde lint yok | `package.json`, `admin-ai-model-desk.tsx` | 10-11 / 245 |
| 8 | `[YÜKSEK]` | `next: "^16.2.9"` — `retry` prop 16.3.0'da stable | `package.json` | 131 |
| 9 | `[YÜKSEK]` | `workbench.tsx` 1.400 satır tek client bileşen | `components/tezgah/workbench.tsx` | — |
| 10 | `[YÜKSEK]` | `globals.css` 163 KB / 7.013 satır, her sayfada | `app/globals.css` | 1-7013 |
| 11 | `[YÜKSEK]` | Sosyal kanıt / referans / vaka çalışması yok | tüm `app/` | — |
| 12 | `[YÜKSEK]` | `in-process-single-node` varsayılan hız tavanı | `lib/kernel/security/rate-limit-runtime.ts` | 36-37 |
| 13 | `[ORTA]` | `components/academy` 6 dosyasının 3'ü ölü (course-card, course-list, begin-checkout-link) + course-cover-image fiilen erişilemez | `components/academy/**` | — |
| 14 | `[ORTA]` | `/sozluk` ve `/tetkik` iç bağlantısı 0, sitemap priority 0.8 | `app/(public)/page.tsx` | — |
| 15 | `[ORTA]` | `/magaza/[slug]` sitemap dışı (kamu keşfi yok) | `app/sitemap.ts` | 55-77 |
| 16 | `[ORTA]` | `/dashboard` çift kipli + oturumsuz kopya ana sayfa | `app/dashboard/page.tsx` | 17-23 |
| 17 | `[ORTA]` | `animated-simulations` hooks deps her render'da değişiyor | `components/junior/animated-simulations.tsx` | 719, 728 |
| 18 | `[ORTA]` | `global-error.tsx` yok | `app/` | — |
| 19 | `[ORTA]` | `magaza/[slug]` aynı DB sorgusunu 2 kez yapıyor | `app/(public)/magaza/[slug]/page.tsx` | 21-33, 36 |
| 20 | `[ORTA]` | Hiçbir sayfada `revalidate` / `"use cache"` yok — statik içerik dinamik | `app/**` | — |
| 21 | `[ORTA]` | SSRF DNS TOCTOU — IP pinleme yok | `lib/tezgah/tetkik/guard.ts` | 126-180 |
| 22 | `[ORTA]` | "Seviye Testi" fiyat kartında, ürün karşılığı yok | `lib/pricing/public-vitrine.ts` | 88-90 |
| 23 | `[ORTA]` | `/vize/[id]` bulunamadığında `index` kalıyor (soft-404) | `app/(public)/vize/[id]/page.tsx` | 110-115 |
| 24 | `[ORTA]` | 35 MB `academy/cinema` JPG kullanılmıyor, pakette taşınıyor | `public/academy/cinema/` | — |
| 25 | `[ORTA]` | `tezgah/layout.tsx` inline `<style>` bloğu | `app/tezgah/layout.tsx` | 6-25 |
| 26 | `[ORTA]` | `/young` her koşulda `notFound()` (kapali:true) | `app/young/page.tsx` | 17-19 |
| 27 | `[ORTA]` | `offer-form.tsx` istemci doğrulaması yok | `components/kurumsal/offer-form.tsx` | — |
| 28 | `[İYİLEŞTİRME]` | `levelCta` / `tracksCta` / `freeLessonCta` kullanılmıyor | `lib/copy/sen-voice/public.ts` | 19, 20, 106 |
| 29 | `[İYİLEŞTİRME]` | İki ayrı kabuk (public vs AppShell), iki ayrı header listesi | `app/(public)/page.tsx`, `header-bar.tsx` | 33-62 / 66-84 |
| 30 | `[İYİLEŞTİRME]` | `HomeAccountNav` yorumu "LCP AVIF" diyor, AVIF yok | `components/public/home-account-nav.tsx` | 6-8 |
| 31 | `[İYİLEŞTİRME]` | `/p/[id]`, `/verify/[hash]` çift yönlendirme katmanı | `app/(public)/p/[id]/page.tsx`, `app/verify/[hash]/page.tsx` | — |
| 32 | `[İYİLEŞTİRME]` | `next/image` yalnız 1 dosyada | `components/**` | — |

---

## 8. Ek: Doğrulama Komutları ve Çıktıları

```bash
$ npx tsc --noEmit
(çıktı yok — 0 hata, 64 sn)

$ npx next build
✓ Compiled successfully
Route table: /academy YOK, 57 sayfa + 132 API rotası
exit_code: 0, elapsed 128.8 sn

$ npx vitest run
Test Files  358 passed (358)
Tests       1905 passed (1905)
Duration    120.14s

$ npx tsx scripts/verify-api-auth.ts --check
verify:api-auth --check OK — 132 route.
{"session":73,"public":25,"closed":11,"cron":2,"admin":13,"webhook":8,"hybrid":0,"internal":0}

$ npx tsx scripts/verify-no-secrets.ts
verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok.

$ npx tsx scripts/verify-boundaries.ts
verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine...

$ npx eslint .
✖ 6 problems (3 errors, 3 warnings)
```

**Ölçüm özeti:**
```
app/ sayfa rotası           : 57
app/api rotası              : 132
components/ .tsx            : 224 (144'ü "use client" → %64)
app/ .tsx                   : 96 (9'u "use client" → %9)
lib/academy                 : 2.711 KB / 366 dosya / 171 modül (51'i dış referanslı, 120'si değil)
public/ toplam              : 1.614 MB / 530 dosya
.next/static/chunks         : 4.162 KB / 80 dosya
app/globals.css              : 163,6 KB / 7.013 satır / 869 seçici
Sitemap girişi              : 64 (19 statik/yasal + 30 sözlük + 15 rehber)
Redirect kuralı             : 341 (321'i /academy'yi hedefliyor)
Test                        : 1.905 / 358 dosya
```
