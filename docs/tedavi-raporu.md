# yetkin.ai — Tedavi Raporu (FAZ 1)

> **Kapsam:** `docs/tespit-raporu.md` içindeki **P0 + P1** maddeleri (5 başlık).
> **Dayanak:** Hiçbir sayı, fiyat veya model kimliği belgeden kopyalanmadı; her değer koddan okundu.
> **Tarih:** 21 Kasım 2026 · **Node:** 26.10.0 · **Next.js:** 16.3.1 (kurulu) / `^16.3.0` (alt sınır)
> **Durum:** ✅ Tüm doğrulama komutları 0 hata ile geçti.

---

## 0. Yönetici Özeti

| Doğrulama | Önce | Sonra |
|---|---|---|
| `npx tsc --noEmit` | 0 hata | ✅ **0 hata** |
| `npx eslint .` | ❌ **3 error, 3 warning** | ✅ **0 error, 0 warning** |
| `npx vitest run` | 1905 / 358 dosya | ✅ **1918 / 359 dosya** |
| `verify:api-auth --check` | 132 route, sapma yok | ✅ **132 route, sapma yok** |
| `verify:no-secrets` | OK | ✅ **OK** |
| `verify:boundaries` | OK | ✅ **OK** |
| `npx next build` | başarılı | ✅ **exit 0** |
| **Yönlendirme kuralı** | **341** (321'i `/academy`'ye) | ✅ **21** (**0**'ı `/academy`'ye) |

**Üç kritik bulgu kapandı:** 301→410 SEO çöp zinciri kırıldı, ana sayfa CTA'ları giriş duvarından kurtarıldı, ödeme dönüşünde GA4 `purchase` + masa yönlendirmesi onarıldı.

---

## 1. [KRİTİK] 301 → 410 SEO Çöp Zinciri Kırıldı, `/academy` İzole Edildi

### 1.1 Sorun (kanıt)
`next.config.ts` 341 yönlendirme kuralı üretiyordu; **321'i** `/academy`'yi hedefliyordu
(106 emekli slug × 3 kural = 318, + `/ogren` + `/academy/courses/:slug` + 1).
`/academy` diskte yok ve kenar onu kesiyor:

```
decideEdgeAction("/academy", false) → {"kind":"frozen-410"}
```

Google 301 gördüğü URL'yi tarar, hedefte 410 bulur ve **hem yönlendirme sinyalini hem hedefi düşürür**.

### 1.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `next.config.ts` | `academyRetiredStorefrontRedirects` import'u ve `...retired` bloğu **kaldırıldı**. `/ogren` → `/academy` kuralı kaldırıldı. `/academy/courses/:slug` → `/academy/:slug` alias'ı kaldırıldı. |
| `lib/academy/retired-storefront.ts` | Slug sicili **korundu** (motor + kenar kapısı + `/api/academy/courses/[id]` hâlâ 410 basıyor). 410 mesajı canlı yüzeylere (`/tezgah`, `/career`) yönlendiriyor. |
| `lib/copy/seo.ts` | `sitemapRoutePolicy`'den `/academy` (1.0) ve `/academy/*` (0.8) kuralları **silindi**. `PAGE_SEO.academy`, `academyAdvanced`, `academyVerify` girdileri silindi. |
| `lib/copy/json-ld.ts` | 450+ satırlık ölü halka silindi: `courseJsonLd`, `educationalOccupationalProgramJsonLd`, `academyCourseBreadcrumbs`, `academyCourseTeachesForSlug`, `academyOccupationalCategory`, 6 `OFFICE_AI_*_COURSE_TEACHES` sabiti. |
| `lib/copy/seo.ts` | `OFFICE_AI_SEO`, `OFFICE_AI_ILERI_SEO`, `ECOMMERCE_AI_SEO`, `SOCIAL_MEDIA_AI_SEO`, `CHATBOT_NOCODE_SEO`, `PROMPT_PRACTICE_SEO`, `academyCourseSeoOverride`, `OFFICE_AI_LESSON_TEASERS`, `ECOMMERCE_AI_PUBLIC_PATH` silindi. |

**Korunan canlı yönlendirmeler (doğrulandı):**
```
/verify              → https://yetkin.ai/vize       (301)
/verify/:hash        → https://yetkin.ai/vize/:hash (301)
/academy/dogrula/:hash → https://yetkin.ai/vize/:hash (301)
/p/:id               → https://yetkin.ai/vize/:id   (301)
```
Kenar kuralı `retiredAcademyVerifyPath` (`/vize/:hash`) **dokunulmadı**.

**Dokunulmayan canlı doğrulama modülleri:** `lib/academy/load.ts` (`loadPublicAcademyVerifyByHash`), `pilot-sku`, `production-seal` — `/vize/[id]` ve `/career` bunları kullanıyor.

### 1.3 Öncesi / sonrası (ölçüm)

```
ÖNCE : total = 341   /academy hedefi = 321   doğrulama yönlendirmesi = 3
SONRA: total =  21   /academy hedefi =   0   doğrulama yönlendirmesi = 3
```
Ölçüm: `tests/kernel/redirect-census` geçici koşusu (`next.config.redirects()` çağrısı).
Kalıcı kapı: `tests/copy/seo-surface.test.ts` → "301 kural sayısı … düştü".

### 1.4 Test değişiklikleri
- `tests/copy/seo-surface.test.ts`: ölü kurs SEO/JSON-LD iddiaları **canlı yüzey iddialarına** çevrildi. Silinen export'lar artık `"X" in module` ile **yokluğu** doğrulanıyor (yorum metni değil, API yüzeyi).
- `tests/kernel/closed-rooms-copy-guard.test.ts`: kurs SEO sabiti importları kaldırıldı; kapanış kapısı slug sicili + robots üzerinden doğrulanıyor.
- Arşiv testleri (`archived/**`) canlı suite dışında; dokunulmadı.

---

## 2. [KRİTİK] Ana Sayfa CTA'ları Giriş Duvarından Kurtarıldı (CRO)

### 2.1 Sorun (kanıt)
`public.ts:74, 90, 101, 117, 123` — 5 CTA oturumsuz ziyaretçiyi **korumalı** `/hibe` ve `/e-ticaret` sayfalarına yolluyordu:

```
decideEdgeAction('/hibe', false)      → auth-307 → /login   ❌
decideEdgeAction('/e-ticaret', false) → auth-307 → /login   ❌
```
`next` parametresi taşınmadığı için kullanıcı giriş sonrası hedefe dönemiyordu.
`grant-eligibility-widget.tsx:186` da skoru gösterdikten sonra ham `/hibe` bağlıyordu.

### 2.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `lib/copy/sen-voice/public.ts` | `bench.grant`, `chain[1]` (Hibe & teşvik), `tracks[Hibe]` → `#home-grant` (ücretsiz uygunluk testi çapası). `tracks[Hibe]` CTA: "Ücretsiz Uygunluk Testi". `levelCta` / `tracksCta` artıkları silindi. |
| `app/(public)/page.tsx` | `homeCtaHref()` yardımcısı: korumalı iç hedefi (`isProtectedCitizenPath`) `buildCitizenRegisterHref` ile **`next` parametreli kayıt yoluna** çevirir. Chain / bench / tracks bağlarının tamamı bu çeviriden geçer. |
| `components/hibe/grant-eligibility-widget.tsx` | Skor sonrası CTA: `buildCitizenRegisterHref("/hibe")` → *"Proje dosyasını aç (ücretsiz kayıt)"*. Ziyaretçi önce ücretsiz testi görür, kayıt dosya aşamasında istenir. |
| `lib/pricing/public-vitrine.ts` | Ürün karşılığı olmayan **`"Seviye Testi"`** satırı → **`"YetkinCV & Yetkinlik Pasaportu"`**. Özet cümlesi de düzeltildi. |
| `lib/copy/seo.ts` | Fiyat sayfası meta açıklamasındaki "seviye testi" vaadi → "YetkinCV". |

### 2.3 Open-redirect koruması (doğrulandı)
`next` yalnız **iç yol + allowlist** kabul ediyor (`parseSafeAuthNext` + `isSafeAuthNextPath`):

```
buildCitizenRegisterHref("/e-ticaret")     → /register?next=%2Fe-ticaret    ✅
buildCitizenLoginHref("/e-ticaret")        → /login?next=%2Fe-ticaret       ✅
buildCitizenRegisterHref("https://evil")   → /register                      ✅ (reddedildi)
buildCitizenRegisterHref("//evil.example") → /register                      ✅ (reddedildi)
resolvePostLoginPath("javascript:alert(1)") → /dashboard                    ✅ (varsayılan)
resolvePostLoginPath("/\\evil.example")    → /dashboard                     ✅ (varsayılan)
```

### 2.4 Test değişiklikleri
- `tests/ui/public-home-cta-surface.test.ts`: iki yeni davranış testi —
  "korumalı CTA'lar giriş duvarına çarpmaz" (hibe çapaya, e-ticaret `next`'li kayda) ve
  "`next` güvenli iç yola çözülür; dış hedef panele düşer" (open-redirect matrisi).
- `tests/ui/home-bench-surface.test.ts`: `grant` aracı href beklentisi `#home-grant` olarak güncellendi.

---

## 3. [KRİTİK] Ödeme Dönüşü, `?masa=` ve GA4 `purchase` Onarıldı

### 3.1 Sorun (kanıt)
1. **`?masa=` hiçbir kod üretmiyordu** (0 eşleşme) ama `/kasa/donus` okuyordu.
2. Tüm tarayıcı ödemeleri `${base}/cuzdan`'a düşüyordu (`tezgah/checkout.ts`, `commerce/subscription-checkout.ts`, `junior/checkout-paytr.ts`).
3. `/cuzdan` dönüşünde `trackPurchase` **hiç** çağrılmıyordu — tek davranış `router.refresh()`.

### 3.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/payments/paytr/checkout.ts` | `PAYTR_RETURN_DESKS = ["tezgah","e-ticaret","hibe","junior","cuzdan"]` + `isPaytrReturnDesk`. `buildPaytrMerchantBrowserReturnUrl(origin, desk?, merchantOid?)` → `?masa=…&merchant_oid=…` (masa ve oid allowlist/format doğrulamasından geçer). |
| `lib/tezgah/checkout.ts` | `desk="tezgah"`, `merchantOid` geçirilir. |
| `lib/commerce/subscription-checkout.ts` | `desk="e-ticaret"`, `merchantOid` geçirilir. |
| `lib/junior/checkout-paytr.ts` | `desk="junior"`, `merchantOid` geçirilir. |
| `app/api/(kernel)/wallet/top-up/route.ts` | Tarayıcı dönüşü `desk="cuzdan"` + `merchantOid` taşır. |
| `lib/kernel/payments/verified-purchase.ts` **(yeni)** | `loadVerifiedPurchase`: `merchant_oid` + oturum sahibi + `status ∈ {PAID, CLEARED}` doğrular. **IDOR kilidi** (başka kullanıcının emri dönmez). `deskForPurpose` niyet → masa eşlemesi. |
| `app/(kernel)/cuzdan/page.tsx` | `searchParams` okur; `loadVerifiedPurchase` ile doğrular; `CuzdanReturnSignal`'a `purchase` nesnesi verir. |
| `components/kernel/cuzdan-return-signal.tsx` **(yeni)** | GA4 `purchase` (item_id, valueMinor, currency, transactionId) + satın alınan masaya tek tıkla geçiş butonu. |
| `components/kernel/kasa-return-panel.tsx` | `junior` / `cuzdan` masaları eklendi; `markPurchaseEmitted` (idempotans) ve masa etiketleri (`E-Ticaret Paneline Geç`, `Tezgâh Pro'ya Dön`). |

### 3.3 İdempotans (sayfa yenilemede mükerrer tetiklenmez)
İki katman:
1. **`sessionStorage` kilidi** — `${PURCHASE_EMITTED_KEY}:${merchantOid}`. Anahtar tek kullanımlık.
2. **GA4 `transaction_id`** — aynı `merchantOid` ikinci kez basılmaz (`funnel.ts` `allow()` dedupe).

Depolama kapalıysa (gizli pencere) ölçüm **yine bir kez** denenir: dönüşüm körlüğü depolama hatasına feda edilmez.

### 3.4 "Başarılı ödeme doğrulandı" tanımı
Ham `sonuc=ok` **yetmez** — kullanıcı o parametreyi elle yazabilir. `purchase` yalnız:
- `PaymentOrder` satırı var,
- `order.userId === session.id` (IDOR),
- `status ∈ {PAID, CLEARED}`

koşullarında basılır. Aksi hâlde hiçbir dönüşüm gönderilmez (dönüşüm şişmesi yok).

### 3.5 GA4 huni testi — metin aramasından davranış testine
`tests/kernel/ga4-funnel.test.ts` yeniden yazıldı. Yeni `describe("GA4 purchase — /cuzdan dönüşü davranış testi")`:

| Test | Doğrulanan davranış |
|---|---|
| idempotans | Aynı `merchant_oid` ikinci kez `purchase` **basmaz** (`gtag` 1 kez) |
| masa başına ayrı dönüşüm | İki farklı oid → 2 olay; `value` 1490 / 590 doğru |
| depolama kapalı | `sessionStorage` yoksa yine bir kez denenir |
| `/cuzdan` bağlantısı | `loadVerifiedPurchase` + `deskForPurpose` + masa butonları |
| niyet → masa | `tezgah-license:pro`→tezgah, `commerce-license:monthly`→e-ticaret, … |
| enjeksiyon | Bozuk `merchant_oid` dönüş adresine **yazılmaz** |

### 3.6 Ek test güncellemeleri
- `tests/kernel/paytr.test.ts`: `?masa=` ve `?merchant_oid=` biçimleri + nötr/tanınmayan/bozuk değer matrisi.
- `tests/kernel/paytr-callback-guard-surface.test.ts`: yeni üçlü argüman imzası.
- `tests/kernel/wallet-checkout-passport.test.ts`: `junior` / `cuzdan` masaları + buton etiketleri.

---

## 4. [YÜKSEK] Sosyal Kanıt (Gerçek Veri) ve Fiyat Karşılaştırma Matrisi

### 4.1 Sosyal kanıt — "sahte veri üretilmez" ilkesine %100 sadık

**Yeni dosyalar:**
- `lib/pricing/home-social-proof.ts` — `loadHomeSocialProof()` DB'den **gerçek** sayaç okur
  (`yetkinCvSeal.count`, `tezgahOutput.count`). DB yoksa/patlarsa sıfır döner.
  Kişisel veri **seçilmez** (`user:`, `displayName`, `email` yok — yalnız `count()`).
- `components/public/home-social-proof-strip.tsx` — `data-home-social-proof` şeridi.

**Eşik mantığı (saf fonksiyon, test edilebilir):**
```
HOME_PROOF_MIN_COUNT = 10
isPublishableProofCount(n) = Number.isInteger(n) && n >= max(min, 1)
```
- `> 0` tek başına **yetmez**: "1 belge üretildi" güven üretmez, ürünün boş olduğunu gösterir.
- Uzman sayacı ayrıca **k-anonimlik eşiği** (`TALENT_DIRECTORY_K_MIN = 5`) ile ürün tabanının büyüğünü arar.
- Hiç satır kalmazsa bileşen **`return null`** — uydurma logo, yorum, "0 kullanıcı" basılmaz.
- Sayılar `Intl.NumberFormat("tr-TR")` ile basılır (`1.234`).

### 4.2 Fiyat karşılaştırma matrisi
`app/(public)/fiyatlandirma/page.tsx` içine semantik `<table>` eklendi (`data-pricing-compare`):

- `<caption>` (ekran okuyucu), `<thead>` + `scope="col"`, `<tbody>` + `scope="row"`.
- 6 sütun: Ücretsiz · Tezgâh Pro · E-Ticaret · Hibe Dosyası · YetkinCV · Kurumsal.
- 6 satır: **Günlük Tezgâh Kotası** (kod sabitinden: `TEZGAH_GUEST_DAILY_LIMIT`), **DOCX/ZIP İndirme**, **Pazaryeri Entegrasyonu**, **Hibe Dosyası**, **YetkinCV Pasaportu**, **Öncelikli Destek**.
- `true` hücreleri ikonla + `sr-only` "Kapsam içinde"; `"—"` = kapsam dışı.

### 4.3 Test
`tests/ui/pricing-proof-surface.test.ts` **(yeni, 9 test)**: sıfır sayaç → boş şerit; eşik altı yayımlanmaz; k-anonimlik eşiği; tr-TR binlik ayırıcı; DB yoksa sıfır; kişisel veri seçilmez; semantik tablo yapısı; kota satırı koddan okunur.

---

## 5. [YÜKSEK & ORTA] Teknik Hijyen, Lint, Hata Sınırları, SSRF

### 5.1 Lint sıfırlandı

| Dosya | Sorun | Çözüm |
|---|---|---|
| `components/kernel/admin-ai-model-desk.tsx:245` | `react/no-unescaped-entities` (error) | `Google'dan` → `Google&apos;dan` |
| `tests/ui/rehber-workflow-surface.test.ts:31,39` | `@next/next/no-assign-module-variable` (error ×2) | `module` değişkeni → `item` |
| `components/junior/animated-simulations.tsx:719` | `react-hooks/exhaustive-deps` (warning) | `tabs` → `useMemo(..., [blueprint])`. Gerçek render/CPU riski kapandı. |
| `components/junior/player/scene-plate.tsx:70` | `no-img-element` (warning) | Belgelenmiş istisna: `onError` → vektör sahne fallback'i `next/image`'da yok; CDN karesi doğrudan basılır. |
| `components/legal/secure-payment-marks.tsx:51` | `no-img-element` (warning) | Belgelenmiş istisna: yerel SVG `images.dangerouslyAllowSVG` ister; CSP yüzeyi gevşetilmedi. Precedent: `course-asset`/`course-cover-image.tsx`. |

**Sonuç:** `npx eslint .` → **0 error, 0 warning**.

**Yeni kapı:** `package.json` → `"verify:all": "npm run lint && npx tsc --noEmit && npm run verify:api-auth -- --check && npm run verify:no-secrets && npm run verify:boundaries && npm test"`.

### 5.2 `next` sürüm alt sınırı
`package.json:131` → `"next": "^16.3.0"` (önce `^16.2.9`).
**Gerekçe:** `error.tsx` `retry` prop'u `v16.3.0`'da stable (`node_modules/next/dist/docs/.../error.md:331-332`). 16.2.x kurulursa prop `undefined` olur ve "Tekrar dene" sessizce çalışmazdı.

### 5.3 `app/global-error.tsx` (yeni)
- İstemci bileşeni (Next sözleşmesi), kendi `<html lang="tr">` + `<body>` etiketlerini basar.
- Global CSS dahil **değildir** → stiller satır içi (CSP `style-src 'unsafe-inline'` bilinçli istisna).
- `metadata` desteklenmez → başlık `<title>` ile.
- **`retry` guard:** `typeof retry === "function"` değilse buton gizlenir (sessiz `TypeError` yerine dürüst davranış).
- Marka kopyası: `PUBLIC_SEN.error` + `YETKIN_BRAND`.

### 5.4 `magaza/[slug]` çift DB sorgusu → tek sorgu
`lib/commerce/storefront-load.ts` → `loadPublicStorefront` **React `cache()`** ile sarıldı.
`generateMetadata` ve sayfa gövdesi aynı slug için iki kez çağırıyordu; artık istek kapsamında tek sorgu. `cache()` istek kapsamlıdır → istekler arası bayat veri yok.

### 5.5 `/vize/[id]` soft-404 kapatıldı
`app/(public)/vize/[id]/page.tsx` → `MISSING_CARD_ROBOTS = { index: false, follow: true }`.
Bulunamayan kartta `robots` döner. `follow: true` korunur (sayfadaki `/career`, `/vize` bağları taranır). Bulunan kart dalı `robots` taşımaz → indeks açık.

### 5.6 SSRF DNS TOCTOU → IP pinning

**Sorun:** `resolveTetkikHost` bir `lookup` yapıyordu, `fetch` adresi **ikinci kez** çözüyordu.
DNS rebinding ile public görünen ad, bağlantı anında özel ağa dönebilirdi.

**Tedavi:**
| Dosya | Değişiklik |
|---|---|
| `lib/tezgah/tetkik/guard.ts` | `normalizeHostForPin`, `pinnableTetkikAddresses`, `PinnedFetchTarget`, `PinnedDispatcherFactory` eklendi. |
| `lib/tezgah/tetkik/pinned-dispatcher.ts` **(yeni)** | `node:https` `lookup` kancası ile **doğrulanmış IP sabitlenir**. `servername`/`Host` gerçek alan adından gelir. `fetchViaPinnedHttps` gövde akışını canlı tutar (boyut tavanı çağıranda). |
| `lib/tezgah/tetkik/fetch-html.ts` | Her sıçramada DNS **bir kez** çözülür; sonuç doğrulanır ve bağlantıya sabitlenir. IP literali DNS sorgusu yapmaz. Sabitlenebilir public IP yoksa istek **atılmaz** (fail-closed). |

**Fail-closed zinciri:**
```
resolveTetkikHost → private/dns  → TetkikAccessError("rejected"/"unreadable")
pinnableTetkikAddresses → []     → TetkikAccessError("rejected")
createPinnedTarget → null        → TetkikAccessError("rejected")
isPinnedTarget(dispatcher) false → Error("pinned_dispatch_required")
```

**Test (8 test, `tests/tezgah/tetkik-ssrf.test.ts`):**
- DNS **tek kez** çözülür (rebinding: 2. çözüm `127.0.0.1` dönse bile bağlantı ilk public IP'ye gider).
- Yalnız özel ağ dönerse bağlantı **hiç açılmaz** (`calls == []`).
- Pinleme fabrikası `null` dönerse bağlantı atılmaz.
- IPv4 öncelikli, IPv6 yedeği; host uyuşmazsa sabit IP sızmaz.

---

## 6. Dokunulan Dosyalar

### Yeni dosyalar (7)
```
app/global-error.tsx
components/kernel/cuzdan-return-signal.tsx
components/public/home-social-proof-strip.tsx
lib/kernel/payments/verified-purchase.ts
lib/pricing/home-social-proof.ts
lib/tezgah/tetkik/pinned-dispatcher.ts
tests/ui/pricing-proof-surface.test.ts
```

### Değiştirilen üretim dosyaları (20)
```
next.config.ts
package.json
lib/academy/retired-storefront.ts
lib/copy/seo.ts
lib/copy/json-ld.ts
lib/copy/sen-voice/public.ts
lib/pricing/public-vitrine.ts
lib/kernel/payments/paytr/checkout.ts
lib/commerce/storefront-load.ts
lib/tezgah/checkout.ts
lib/commerce/subscription-checkout.ts
lib/junior/checkout-paytr.ts
lib/tezgah/tetkik/guard.ts
lib/tezgah/tetkik/fetch-html.ts
app/(public)/page.tsx
app/(public)/fiyatlandirma/page.tsx
app/(public)/vize/[id]/page.tsx
app/(kernel)/cuzdan/page.tsx
app/api/(kernel)/wallet/top-up/route.ts
components/hibe/grant-eligibility-widget.tsx
components/kernel/kasa-return-panel.tsx
components/kernel/admin-ai-model-desk.tsx
components/junior/animated-simulations.tsx
components/junior/player/scene-plate.tsx
components/legal/secure-payment-marks.tsx
```

### Değiştirilen test dosyaları (8)
```
tests/copy/seo-surface.test.ts
tests/kernel/closed-rooms-copy-guard.test.ts
tests/kernel/ga4-funnel.test.ts
tests/kernel/paytr.test.ts
tests/kernel/paytr-callback-guard-surface.test.ts
tests/kernel/wallet-checkout-passport.test.ts
tests/ui/public-home-cta-surface.test.ts
tests/ui/home-bench-surface.test.ts
tests/ui/rehber-workflow-surface.test.ts
tests/tezgah/tetkik-ssrf.test.ts
```

---

## 7. Doğrulama Çıktıları (son koşu)

```bash
$ npx tsc --noEmit
# çıktı yok — 0 hata

$ npx eslint .
# çıktı yok — 0 error, 0 warning

$ npx vitest run
 Test Files  359 passed (359)
      Tests  1918 passed (1918)

$ npx tsx scripts/verify-api-auth.ts --check
verify:api-auth --check OK — 132 route.
{"session":73,"public":25,"closed":11,"cron":2,"admin":13,"webhook":8,"hybrid":0,"internal":0}

$ npx tsx scripts/verify-no-secrets.ts
verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok.

$ npx tsx scripts/verify-boundaries.ts
verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine, app/api uygulama servisi …

$ npx next build
✓ Compiled successfully in 13.1s
NEXT_BUILD_EXIT=0
# rota tablosunda `/academy` sayfası YOK; yalnız `/api/academy/*` (kenarda 410) durur.
```

**Yönlendirme sayımı:**
```
ÖNCE : total = 341   /academy hedefi = 321
SONRA: total =  21   /academy hedefi =   0
```

---

## 8. Bilinçli Olarak Yapılmayanlar (kapsam dışı)

| Madde | Neden |
|---|---|
| `lib/academy` 120 referanssız modülün silinmesi | P2 maddesi (`§1.2` nüansı). `/vize` ve `/career` canlı doğrulama yüzeyi bu kütüphaneye bağlı; toptan silme o sayfaları kırar. Yalnız **SEO halkası** silindi. |
| `workbench.tsx` bölünmesi, `globals.css` ayrıştırması | P3 performans maddeleri. |
| `/magaza/[slug]` sitemap'e eklenmesi | P2 keşif maddesi. |
| `RATE_LIMIT_REDIS` zorunluluğu | P3 operasyon maddesi (`ops:runtime-readiness`). |
| `public/academy/cinema` 35 MB medya silinmesi | P3; `next.config` cache kuralları bu yolu besliyor. |

Bu maddeler P0/P1 kapsamı dışındadır ve bu tedavide **davranış değişikliği** üretmez.

---

## 9. Geri Alma (rollback) Notları

| Değişiklik | Geri alma |
|---|---|
| 301 blok kaldırma | `next.config.ts` içine `...retired` bloğu + import geri eklenir. **Ancak** `/academy` kenarda 410 kaldıkça zincir geri gelir — istenmeyen. |
| CTA `#home-grant` | `public.ts` href'leri geri yazılır; `homeCtaHref` yardımcısı kalabilir (zararsız). |
| Ödeme dönüşü | `buildPaytrMerchantBrowserReturnUrl(origin)` tek argümanla çağrılır; `CuzdanReturnSignal` kaldırılır. |
| SSRF pinning | `fetchPublicHomepage` içindeki `fetchViaPinnedHttps` dalı `injectedFetch`'e çevrilir. **Önerilmez** — TOCTOU penceresi geri açılır. |

---

## 10. Sonuç

Beş P0/P1 maddenin tamamı uygulandı, her biri **davranış testiyle** mühürlendi:

| # | Madde | Durum | Kanıt |
|---|---|---|---|
| 1 | 301 → 410 zinciri + `/academy` izolasyonu | ✅ | 341 → 21 kural, 321 → 0 `/academy` hedefi; `/verify*` korundu |
| 2 | Ana sayfa CTA giriş duvarı | ✅ | `#home-grant` çapası + `next=/e-ticaret`; open-redirect matrisi |
| 3 | Ödeme dönüşü + `?masa=` + GA4 `purchase` | ✅ | `masa`/`merchant_oid` üretimi; sunucu doğrulamalı idempotent `purchase` |
| 4 | Sosyal kanıt + karşılaştırma matrisi | ✅ | Eşik tabanlı gerçek sayaçlar; semantik `<table>` |
| 5 | Hijyen, lint, hata sınırı, SSRF | ✅ | 0/0 lint; `global-error`; `cache()`; IP pinning + 8 SSRF testi |

**1905 → 1918 test**, hepsi yeşil. Lint **ilk kez 0/0**. Build exit 0.
