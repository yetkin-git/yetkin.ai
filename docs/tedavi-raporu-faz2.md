# yetkin.ai — Tedavi Raporu (FAZ 2)

> **Kapsam:** `docs/tespit-raporu.md` içindeki **P2 (SEO & İç Keşif), P3 (Performans &
> Operasyonel Güvence) ve P4 (Viral Büyüme Döngüsü)** maddeleri (6 başlık).
> **Dayanak:** Hiçbir sayı, fiyat veya model kimliği belgeden kopyalanmadı; her değer
> koddan okundu ya da komut çıktısından ölçüldü.
> **Tarih:** 21 Kasım 2026 · **Node:** 26.10.0 · **Next.js:** 16.3.1 (kurulu) / `^16.3.0` (alt sınır)
> **Durum:** ✅ Tüm doğrulama komutları 0 hata ile geçti.

---

## 0. Yönetici Özeti

| Doğrulama | Faz 1 sonu | **Faz 2 sonu** |
|---|---|---|
| `npx tsc --noEmit` | 0 hata | ✅ **0 hata** |
| `npx eslint .` | 0 error, 0 warning | ✅ **0 error, 0 warning** |
| `npm test` (`vitest run`) | 1918 / 359 dosya | ✅ **1969 / 853 dosya** (+51 test) |
| `verify:api-auth --check` | 132 route, sapma yok | ✅ **132 route, sapma yok** |
| `verify:no-secrets` | OK | ✅ **OK** |
| `verify:boundaries` | OK | ✅ **OK** |
| `ops:runtime-readiness` | çıkış 0 (lab) | ✅ **çıkış 0 (lab)**, üretimde yeni kapı |
| `verify:academy-curriculum` | OK | ✅ **OK** |
| `verify:junior-content` / `verify:junior-sync` | OK | ✅ **OK** |
| `verify:public-size` | OK | ✅ **OK** (55,6 MB) |
| `verify:paytr-reconciliation-seals` | OK | ✅ **OK** (22 test) |
| `npx next build` | exit 0 | ✅ **exit 0** |
| `test:frozen` (410 envanteri) | 21 dosya kırık / 34 test | ✅ **aynı 21 dosya / 34 test** (yeni kırık yok) |

**Altı tedavi kapandı:** yetim sayfalar bağlandı, ölü vitrin kodu arşivlendi, Tezgâh kod
bölündü, CSS modülerleşti, statik içerik önbelleklendi, hız tavanı üretim kapısı oldu ve
`/vize` kartı paylaşılabilir hâle geldi.

**Ölçülen kazanç (özet):**

```
/tezgah  ilk yükleme istemci ağırlığı : 1.009,8 KB → 976,9 KB   (%3,3; ağır önizlemeler artık ayrı chunk)
/tezgah  sayfa manifest chunk sayısı  : 15 → 16 (ağır 4 yüzey manifestten ÇIKTI, istek üzerine iner)
app/globals.css                       : 7.013 satır / 163,6 KB → 6.704 satır / 151,1 KB
token + animasyon katmanı             : 0 → 364 satır ayrı dosya (1,4 KB + 5,7 KB)
@keyframes ana dosyada                : 27 → 0
sitemap statik çekirdek               : 19 → 19 (ikisi artık footer'dan sızmıyor, açık kayıt)
sitemap toplam giriş                  : 64 → 64 (+N aktif vitrin; DB'siz ortamda 0)
iç bağlantısı 0 olan kamu sayfası     : 2 (/sozluk, /tetkik) → 0
```

---

## 1. [P2 — SEO & İÇ KEŞİF] Yetim Sayfalar Bağlandı, Sitemap Kapsamı Tamamlandı

### 1.1 Sorun (kanıt)

`lib/copy/seo.ts:251` `SITEMAP_STATIC_PATHS` gönderiminde `/sozluk` ve `/tetkik` **0.8**
öncelikle duruyordu (`sitemapRoutePolicy`, `seo.ts:368`). Buna karşılık `app` + `components`
ağacında bu iki yola **tek bir** `<Link href>` yoktu. Google için sitemap sinyali ile iç
bağlantı sinyali çelişiyordu: yetim sayfa tespiti indekslemeyi geciktirir.

Ek olarak `/hakkimizda` ve `/iletisim` site haritasına yalnız `LEGAL_SITE_PATHS`
(`legal-launch.ts:452` → `LEGAL_FOOTER_LINKS`) üzerinden **dolaylı** giriyordu. Footer'dan
bir satır çıksa iki kamu sayfası site haritasından sessizce düşerdi.

`/magaza/[slug]` ise kamuya açık, `index` engellenmemiş, ama site haritasında **hiç** yoktu;
keşif yalnız oturumlu panelden (`app/(kernel)/e-ticaret/page.tsx`, `lib/career/action-plan.ts`)
yürüyordu.

### 1.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `lib/copy/sen-voice/public.ts` | `home.resourcesKicker` / `resourcesTitle` / `resourcesLead` + `resources[]` (4 satır: `/sozluk`, `/tetkik`, `/rehber`, `/uzmanlar`; her satırda `title`, `body`, `href`, `cta`). |
| `app/(public)/page.tsx` | `<section data-home-resources aria-labelledby="home-resources-heading">` — çözüm yollarından **sonra**, SSS'ten **önce**. Semantik `h2` + `ul/li` + `h3`; yasal footer'a bağlı değil. |
| `lib/copy/seo.ts` | `SITEMAP_STATIC_PATHS`'e `PAGE_SEO.about.path` (`/hakkimizda`) ve `PAGE_SEO.contact.path` (`/iletisim`) **açık kayıt** olarak eklendi. |
| `lib/copy/seo.ts` | `sitemapRoutePolicy`'ye `/magaza/*` kuralı: `weekly / 0.4` (yasal bandın üstünde, ürün odalarının altında). |
| `lib/commerce/storefront-sitemap.ts` | **Yeni.** `listPublicStorefrontSlugs()` — tek sorgu, `ACTIVE` mağaza, rafta satılabilir satır (`sellableQty > 0`) şartı, `take: 2000` tavanı, hata hâlinde `[]`. |
| `app/sitemap.ts` | `storefrontSitemapEntries()` + ortak `seen` filtresi. DB/şema/bağlantı hatasında yükleyici boş dizi döner; `try/catch` zaten statik girişlere düşer. |

**Neden `resources` footer'a eklenmedi:** `/sozluk` ve `/tetkik` **yasal metin değildir**.
`LEGAL_FOOTER_LINKS` bir hukuk sicilidir; oraya ürün sayfası koymak sicili bozar ve
`tests/kernel/legal-launch-surface.test.ts` yasal yüzey sözleşmesini kilitler. Bu yüzden
ayrı, semantik bir keşif bölümü kuruldu.

### 1.3 Öncesi / sonrası (ölçüm)

```
SITEMAP_STATIC_PATHS            : 10 → 12   (/hakkimizda, /iletisim açık kayıt)
sitemap toplam giriş (DB'siz)   : 64 → 64   (+0 vitrin; DB'de aktif vitrin yoksa dürüst 0)
sitemap /hakkimizda, /iletisim  : var (footer sızıntısı) → var (açık kayıt, footer'dan bağımsız)
sitemap /magaza/*               : 0 → N (aktif + satılabilir vitrin sayısı, tavan 2000)
/sozluk iç bağlantısı           : 0 → 1 (ana sayfa Kaynaklar)
/tetkik iç bağlantısı           : 0 → 1 (ana sayfa Kaynaklar)
/rehber iç bağlantısı           : 1 (header) → 2 (header + Kaynaklar)
/uzmanlar iç bağlantısı         : 1 (yalnız AppShell) → 2 (AppShell + ana sayfa)
```

Ölçüm komutu (`npx tsx --conditions=react-server` ile `app/sitemap.ts` çağrısı):

```
entries=64  magaza=0  staticCore=19
hasAbout=true  hasContact=true  hasSozluk=true  hasTetkik=true
```

**Fail-safe kanıtı:** `DATABASE_URL` erişilemez bir adrese çevrilip site haritası
üretildiğinde giriş sayısı **64** kalır, `/magaza` **0** olur, hiçbir istisna sızmaz
(`tests/commerce/storefront-sitemap.test.ts` — 5 test: DB hatası, DB tanımsız, boş raf,
fiyatsız varyant, stok güvenlik payı).

### 1.4 Test değişiklikleri

- **Yeni** `tests/ui/home-resources-surface.test.ts` (7 test): bölümün varlığı, semantik sıra
  (tracks → resources → FAQ), 4 hedefin doğrudan bağ olması, footer bağımsızlığı,
  `SITEMAP_STATIC_PATHS` açık kaydı, `/magaza` politikası, canlı site haritası kapsamı.
- **Yeni** `tests/commerce/storefront-sitemap.test.ts` (5 test): yükleyici davranışı.
- **Güncellendi** `tests/copy/seo-surface.test.ts`: `SITEMAP_STATIC_PATHS` derin eşitliği
  iki yeni yolu içerecek şekilde.

---

## 2. [P2 — MİMARİ TEMİZLİK] Ölü Vitrin Bileşenleri Arşivlendi

### 2.1 Sorun (kanıt)

`components/academy` altında 6 dosya vardı. Referans taraması (canlı `app`/`components`/`lib`
ağacı) üçünün **hiçbir canlı rota** tarafından import edilmediğini gösterdi:

```
course-card.tsx        15.014 B   yalnız course-list.tsx import ediyordu
course-list.tsx        11.108 B   yalnız tests/ui/academy-vitrine-shelves.test.ts
begin-checkout-link.tsx   954 B   yalnız course-card.tsx
```

Üçü de yalnız **arşivlenmiş** `/academy` odasına hizmet ediyordu (`archived/academy/app/page.tsx`,
`.../ileri/page.tsx`, `.../[slug]/page.tsx`). `/academy` diskte yok ve kenar 410 basıyor.

### 2.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `components/academy/course-card.tsx` | → `archived/academy/components/course-card.tsx` |
| `components/academy/course-list.tsx` | → `archived/academy/components/course-list.tsx` |
| `components/academy/begin-checkout-link.tsx` | → `archived/academy/components/begin-checkout-link.tsx` |
| `tests/ui/academy-vitrine-shelves.test.ts` | → `archived/academy/tests/academy-vitrine-shelves.test.ts` (ölü vitrini render eden tek canlı test) |
| `vitest.frozen.config.ts` | Taşınan üç ad arşive çözülür (`ARCHIVED_ACADEMY_COMPONENTS`); kalan üç bileşen canlı ağaca düşer. |
| `archived/academy/tests/*.test.ts` (5 dosya) | `readSrc("components/academy/course-card.tsx")` → `readSrc("archived/academy/components/…")` |

### 2.3 Dokunulmayan canlı zincir (doğrulandı)

| Dosya / sembol | Neden korundu |
|---|---|
| `lib/academy/load.ts` → `loadPublicAcademyVerifyByHash` | `/vize/[id]` sertifika doğrulaması |
| `lib/academy/pilot-sku.ts` | `lib/pricing/showcase-price.ts` vitrin fiyatı |
| `lib/academy/production-standard.ts` + `production-seal-manifest.ts` | `verify:academy-curriculum`, `verify:academy-pedagogy-seals` |
| `components/academy/course-cover-image.tsx` | `components/showcase/listing-card.tsx` (kamu listeleme kartı) |
| `components/academy/certificate-share-actions.tsx` | `/vize`, `/career`, `/pasaport` |
| `components/academy/certificate-verify-qr.tsx` | `components/career/public-talent-board.tsx` |

`app/(public)/vize/[id]/page.tsx` hâlâ `loadPublicAcademyVerifyByHash` çağırıyor; 410 kenar
kapısı (`isFrozenShellPagePath("/academy")`) yerinde.

### 2.4 Öncesi / sonrası

```
components/academy dosya sayısı     : 6 → 3
components/academy toplam bayt      : 32.517 B → 5.441 B  (−27.076 B / −%83)
taşınan üç dosya (arşivde duruyor)  : 27.076 B (course-card 15.014 + course-list 11.108 + begin-checkout-link 954)
canlı test dosyası (ölü vitrin)     : 1 → 0 (arşive taşındı, `test:frozen` kapsamında)
test:frozen yeni kırık dosya        : 0
```

---

## 3. [P3 — PERFORMANS] `workbench.tsx` Kod Bölme ve Inline CSS Temizliği

### 3.1 Sorun (kanıt)

`components/tezgah/workbench.tsx` **1.425 satır** tek `"use client"` dosyasıydı ve 10 aracın
yanı sıra 5 ağır önizleme/rapor bileşenini **statik** import ediyordu:

```
DukkanPreview            → components/tezgah/dukkan-preview.tsx
PazaryeriPreview         → components/tezgah/pazaryeri-preview.tsx  (+ MasterSkuTransfer)
ProStudioPreview         → components/tezgah/pro-studio-preview.tsx
TetkikReportView         → components/tezgah/tetkik-report.tsx      (18,5 KB)
GrantProjectReportView   → components/tezgah/grant-project-report.tsx (13,6 KB)
```

Tek sekme açan kullanıcı beşinin kodunu da indiriyordu. Ayrıca `app/tezgah/layout.tsx:6-25`
içinde 20 satırlık ham `<style>` bloğu React ağacındaydı; her istekte HTML gövdesine
yeniden basılıyordu.

### 3.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `components/tezgah/workbench.tsx` | 5 ağır yüzey `next/dynamic(() => import(...))` ile tembel; her birine `loading` iskeleti. `ssr: false` bilinçli: bu bloklar yalnız istemci durumundan (`shop`, `catalog`, `pro`, `report`) doğar. |
| `components/tezgah/surface-skeleton.tsx` | **Yeni.** `TezgahSurfaceSkeleton` — `role="status"`, `aria-live="polite"`, `data-tezgah-surface-skeleton`, CSS animasyonu yok (`prefers-reduced-motion` bedeli doğmaz). |
| `app/tezgah/layout.tsx` | Inline `<style>` **kaldırıldı**; kabuk yalnız içerik basar. |
| `app/globals.css` | `@media print` bloğu `[data-tezgah-chrome]` seçicisiyle **aynen** korundu (tek global bildirim). |

### 3.3 Öncesi / sonrası (gerçek `next build` çıktısı üzerinden ölçüm)

Ölçüm: `tezgah/page_client-reference-manifest.js` içindeki chunk kümesi + `.next/static/chunks`
boyutları.

```
/tezgah istemci dosya sayısı     : 15 → 16
/tezgah istemci toplam bayt      : 1.009,8 KB → 976,9 KB   (−32,9 KB / −%3,3)
workbench ana chunk              : 69,5 KB → 44,2 KB       (−25,3 KB / −%36)
tüm .next/static/chunks          : 4.204,6 KB / 82 → 4.240,8 KB / 91 (yeni lazy chunk'lar ayrı dosya)
```

**Ağır yüzeylerin sayfa manifestinden çıktığı doğrulandı** (chunk adları üretim çıktısından):

```
3attfbd-_2y6z.js   (DukkanPreview)          NOT in page manifest
0jzetoqlpbkby.js   (TetkikReportView)       NOT in page manifest
24qps2wadgl0v.js   (GrantProjectReportView) NOT in page manifest
2w6s9ni8c6ss0.js   (GrantProjectReportView) NOT in page manifest
26ixr5o-m01lh.js   (PazaryeriPreview)       NOT in page manifest
3uql39zt1fi6l.js   (workbench gövdesi)      IN page manifest
```

Yani ilk boyamada artık yalnız Tezgâh gövdesi + ortak kabuk iner; rapor/önizleme kodları
**kullanıcı o aracı çalıştırdığında** indirilir.

> **Nüans (dürüst not):** Toplam istemci ağırlığı yalnız %3,3 düştü, çünkü iki büyük ortak
> chunk (276,8 KB ve 229,5 KB) React/Next çalışma zamanı + ortak UI katmanıdır ve her sayfada
> iner. Tespit raporundaki "%40-60 azalma" tahmini bu ortak tabanı hesaba katmamıştı.
> Gerçek kazanç **ilk yüklemede indirilen araç-özel kodda**: workbench gövdesi %36 küçüldü ve
> 5 ağır yüzey tamamen manifest dışına çıktı.

### 3.4 Test değişiklikleri

- **Yeni** `tests/tezgah/workbench-split-surface.test.ts` (7 test): her ağır yüzey için
  statik import **yokluğu** + dinamik yükleme **varlığı**, `loading` iskelet sayısı (=5),
  iskeletin erişilebilirlik sözleşmesi, `layout.tsx`'te inline `<style>` yokluğu, global
  `@media print` kuralının korunduğu.

---

## 4. [P3 — PERFORMANS] `globals.css` Modülerleştirme ve Statik İçerik Önbellekleme

### 4.1 Sorun (kanıt)

`app/globals.css` **7.013 satır / 163,6 KB** tek parçaydı ve `:root` token bloğu dosyanın
**iki ayrı yerinde** duruyordu (satır 7 ve 6.933). 27 `@keyframes` bloğu 7.000 satıra
serpiştirilmişti. Her sayfada inen tek dosyada ölü seçici tespiti imkânsızdı.

`app` altında tek bir `revalidate` tanımı yoktu; `/sozluk`, `/sozluk/[terim]`,
`/rehber/[slug]` ve `/legal/[slug]` tamamen dosya sabitlerinden beslenmesine rağmen her
istekte aynı kayıt çözümü yeniden yapılıyordu.

### 4.2 Tedavi — stil katmanları

| Dosya | İçerik |
|---|---|
| `app/styles/tokens.css` | **Yeni.** İki `:root` bloğu tek dosyada (33 + 5 satır). Hiçbir token adı veya değeri değişmedi. |
| `app/styles/animations.css` | **Yeni.** 27 `@keyframes` bloğu (kaynak sırası korunarak). |
| `app/globals.css` | `@import "tailwindcss"` → `@import "./styles/tokens.css"` → `@import "./styles/animations.css"` → `@source` → kurallar. Tailwind **ilk sırada** kalır (katman sırası bozulmaz). |

`prefers-reduced-motion` muafiyetleri (`animation: none`) ilgili sınıfların yanında,
`globals.css` içinde bırakıldı — davranış birebir aynı.

### 4.3 Tedavi — içerik önbelleği

| Dosya | İçerik |
|---|---|
| `lib/content/cache.ts` | **Yeni.** `createContentCache<T>()`: süreç içi `Map` + TTL (3.600 sn) + **single-flight** (aynı anahtarı bekleyen N istek tek hesaplama yapar) + hata önbelleğe alınmaz. |
| `lib/content/public-content.ts` | **Yeni.** `loadGlossaryTerms`, `loadGlossaryTerm`, `loadPublicGuides`, `loadPublicGuide`, `loadLegalSection` — sayfalar bu yükleyicileri kullanır. |
| `app/(public)/sozluk/page.tsx` | `GLOSSARY_TERMS.map` → `await loadGlossaryTerms()` (sayfa `async`). |
| `app/(public)/sozluk/[terim]/page.tsx` | `glossaryTerm()` → `await loadGlossaryTerm()`. |
| `app/(public)/rehber/[slug]/page.tsx` | `publicGuide()` → `await loadPublicGuide()`. |
| `app/(public)/legal/[slug]/page.tsx` | `legalSectionBySlug()` → `await loadLegalSection()`. |

**Neden tam sayfa ISR değil:** Kök `app/layout.tsx` nonce CSP için `cookies()` + `connection()`
çağırır. Bu yüzden ağaç istek kapsamlıdır ve bu sayfalar için "tam sayfa statikleştirme"
nonce'u dondururdu. Kazanılabilir katman **veri** katmanıdır; HTML gövdesi istek anında
nonce ile üretilmeye devam eder. `"use cache"` direktifi `cacheComponents` ister ve
`next.config.ts` bu amiral gemisinde kapalıdır — bu yüzden düşük riskli `Map` + TTL seçildi.

### 4.4 Öncesi / sonrası

```
app/globals.css            : 7.013 satır / 163,6 KB → 6.704 satır / 151,1 KB
app/styles/tokens.css      : yok → 46 satır / 1,4 KB
app/styles/animations.css  : yok → 318 satır / 5,7 KB
@keyframes ana dosyada     : 27 → 0
:root bloğu ana dosyada    : 2 → 0
kayıt çözümü (/sozluk ana) : her istek → süreç içi 3.600 sn + single-flight
```

**Tek doğruluk kaynağı:** `@import` sırası Tailwind katmanını korur; sınıf adları ve token
değerleri birebir aynıdır (testlerle kilitli).

### 4.5 Test değişiklikleri

- **Yeni** `tests/helpers/style-bundle.ts`: `readStyleBundle()` — üç stil katmanını tek bütün
  olarak okur. `app/globals.css` dosyasını okuyan **5 canlı test** bu yardımcıya geçti
  (`room-floor-surface`, `public-home-cta-surface`, `citizen-surface`,
  `performance-headers-surface`, `junior-stage-containment`).
- **Yeni** `tests/kernel/content-cache.test.ts` (11 test): TTL, single-flight, hata
  önbelleğe alınmaz, anahtar izolasyonu, sızan kimlik yok, sayfa bağlantıları, CSP nonce
  dinamiğinin bozulmadığı.
- 24 arşiv testi (`archived/academy/tests/*`) `app/globals.css` yerine `readStyleBundle()`
  okur — `test:frozen` yeni kırık **üretmedi**.

---

## 5. [P3 — OPERASYONEL GÜVENCE] Dağıtık Hız Tavanı ve Form Sınırları

### 5.1 Sorun (kanıt)

`lib/kernel/security/rate-limit-runtime.ts:36-40` — `RATE_LIMIT_REDIS_REST_URL` ve `_TOKEN`
ikisi de boşsa `in-process-single-node` moduna **sessizce** düşüyordu.
`scripts/ops-runtime-readiness-lib.ts` bunu yalnız "UYARI" satırı olarak basıyor, çıkış
kodu **0** kalıyordu. Vercel'de her serverless örnek kendi sayacını tuttuğu için gerçek
limit **limit × örnek** oluyordu; LLM maliyet koruması ve form/IP hız tavanı delinirken
dağıtım "yeşil" görünüyordu.

`components/kurumsal/offer-form.tsx` istemci tarafında **hiç** doğrulama taşımıyordu; sunucu
(`app/api/lead/route.ts`) değerleri `clip(value, max)` ile **sessizce kırpıyordu** — kullanıcı
300 karakterlik firma adının 120'ye kesildiğini görmüyordu.

### 5.2 Tedavi — hız tavanı üretim kapısı

| Dosya | Değişiklik |
|---|---|
| `scripts/ops-runtime-readiness-lib.ts` | **Yeni** `rateLimitProductionBlocks(env)`. Yalnız `NODE_ENV=production` **veya** `VERCEL_ENV=production` altında çalışır (Vercel build alt süreci `NODE_ENV` atamayabilir). Çift dolu → geçer; **kısmi** → blok; **çift boş** → blok. |
| Aynı dosya | `SafeDefaultOps.rateLimitSingleNodeAck` + OPS-5 tablosunda `singleNodeAck=evet/hayır`. `rateLimitStoreLines` mesajları "Derleme düşmez" → "ÜRETİMDE BUILD DÜŞER" olarak düzeltildi (artık yalan söylemiyor). |
| `scripts/ops-runtime-readiness.ts` | Başlık sözleşmesi güncellendi (kapı üretimde çıkış 1). |
| `instrumentation.ts` | `ops.rate_limit.store_not_shared` çalışma zamanı olayı (kısmi → `status: 503`, boş → `200`). Kabul bayrağı Vercel Production'da **sayılmaz**. |
| `lib/kernel/env.ts` | `RATE_LIMIT_SINGLE_NODE_ACK` şeması. |
| `.env.example` | Üretim kapısı + kabul bayrağı, gerekçesiyle belgelendi. |
| `lib/kernel/security/rate-limit-runtime.ts` | Yalnız biçim (boş satır), davranış değişmedi. |

**Tek süreçli bilinçli kurulum kaçış yolu:** `RATE_LIMIT_SINGLE_NODE_ACK=1`. Bu **adı
konmuş** bir kabuldür (sessiz varsayılan değil) ve OPS-5 tablosunda görünür. Vercel
Production'da blok açmaz — orada replica sayısı sabit değildir.

**Test ve geliştirme ortamları bozulmadı:** kapı yalnız üretim bayraklarında çalışır;
`NODE_ENV=test|development` ve bayraksız ortam için ayrı test var.

### 5.3 Tedavi — form sınırları

| Dosya | Değişiklik |
|---|---|
| `components/kurumsal/offer-form.tsx` | `OFFER_FORM_LIMITS` (120/160/80/500) — **sunucu `clip()` sayılarıyla birebir**. `validateOfferForm()` saf doğrulayıcı (sunucu `EMAIL_RE` ve `>=2` kuralıyla aynı). Alanlarda `maxLength` + `aria-invalid` + satır içi hata; `role="alert"` / `role="status"`; not alanında canlı karakter sayacı. |

Kullanıcı artık **sessiz kırpılma** görmüyor: `maxLength` girişi sınırda tutar, sınır ihlali
görünür mesaja dönüşür ve gönderim engellenir.

### 5.4 Öncesi / sonrası

```
üretimde Redis eksik → build             : exit 0 (uyarı) → exit 1 (blok)   ← kapı kapandı
üretimde Redis kısmi → build             : exit 0 (uyarı) → exit 1 (blok)
geliştirme/test Redis eksik → build      : exit 0 → exit 0                 ← bozulmadı
OPS-5 tablosu "Derleme düşmez" iddiası   : yanlıştı → düzeltildi
form istemci doğrulaması                 : yok → maxLength + 6 kural + görünür hata
```

### 5.5 Test değişiklikleri

- **Güncellendi** `tests/kernel/runtime-readiness.test.ts`: "eksik Redis derlemeyi düşürmez"
  testi **tersine çevrildi** ("eksik Redis üretimde derlemeyi düşürür"). DB sınıflandırma
  testlerine `SHARED_RATE_LIMIT` verisi eklendi. **Yeni** iki test: kabul bayrağı matrisi
  (özellikle Vercel Production'da sayılmadığı) ve geliştirme/test muafiyeti.
- **Yeni** `tests/sales/offer-form-surface.test.ts` (8 test): istemci `maxLength` değerlerinin
  sunucu `clip()` değerleriyle **birebir** eşitliği (kaynaktan ayrıştırılarak), 6 doğrulama
  kuralı, normalizasyon uyumu, paket SSOT'u.

---

## 6. [P4 — VİRAL BÜYÜME DÖNGÜSÜ] `/vize/[id]` Kamu Kanıt Kartı Paylaşılabilir

### 6.1 Sorun (kanıt)

`/vize/[id]` her YetkinCV/Akademi mührü için herkese açık (oturumsuz 200) bir kanıt kartı
üretiyor; paylaşım rehberi (`SealShareGuides`) ise yalnız **oturumlu** `/career` tarafındaydı.
Kamu kartının üzerinde tek tıkla paylaşım aksiyonu yoktu. Her mühür = 1 organik backlink
fırsatı; fırsat kullanılmıyordu.

### 6.2 Tedavi

| Dosya | Değişiklik |
|---|---|
| `lib/career/proof-share.ts` | **Yeni.** Saf fonksiyonlar: `absoluteProofCardUrl`, `linkedInProofShareUrl` (`share-offsite`), `whatsAppProofShareUrl` (`wa.me`), `proofShareText`. Kimlik taşımaz. |
| `components/career/proof-share-bar.tsx` | **Yeni.** `ProofShareBar` — `data-proof-share-bar`, `aria-label`, üç aksiyon: **Bağlantıyı Kopyala** (mevcut `copyTextToClipboard` + execCommand yedeği, görsel onay), **LinkedIn'e Ekle**, **WhatsApp ile Paylaş**. Dış bağlar `target="_blank"` + `rel="noopener noreferrer"`. Onay `role="status" aria-live="polite"` ile duyurulur. |
| `components/ui/icons.tsx` | **Yeni** `IconWhatsApp` (mevcut `IconLinkedIn`, `IconCopy`, `IconCheck`, `IconX` yanına). |
| `lib/copy/sen-voice/career.ts` | `publicPage.shareBarTitle`, `shareBarLead`, `shareCopyLink`, `shareCopied`, `shareCopyFail`, `shareLinkedIn`, `shareWhatsApp`, `shareText`, `shareTextNamed(title)`. |
| `app/(public)/vize/[id]/page.tsx` | Çubuk **üç görünümde** de basılır: YetkinCV puan kartı (`seal.verifyPath`), Akademi mührü (`/vize/<hash>`) ve yetenek kartı (`PublicTalentBoard`). |
| `components/career/public-talent-board.tsx` | Öne çıkan rozetin hemen altına `ProofShareBar`; mevcut `SealShareQuickBar` (WhatsApp + X) korundu. |

**Kimlik sızdırmama:** paylaşılan metin yalnız kart başlığını ve mutlak adresi taşır;
`userId`, e-posta, sözleşme numarası ve SHA dizesi metne girmez (test ile kilitli).

### 6.3 Öncesi / sonrası

```
/vize/[id] paylaşım aksiyonu (kamu, oturumsuz) : 0 → 3 (kopyala / LinkedIn / WhatsApp)
/vize/[id] görünüm sayısı çubuk basan          : 0 → 3 (YetkinCV, Akademi mührü, yetenek kartı)
paylaşım bağlantısı üreticisi                  : yalnız oturumlu `SealShareQuickBar` → + kamu `proof-share.ts`
```

### 6.4 Test değişiklikleri

- **Yeni** `tests/career/proof-share-bar-surface.test.ts` (8 test): mutlak adres çevrimi,
  LinkedIn/WhatsApp URL kodlaması (çift parametre yok), boş metin davranışı, kimlik
  sızdırmama, bileşenin üç aksiyonu basması, `target`/`rel` güvenliği, kopyalama onayı ve
  canlı bölge metni, üç kart tipinde bağlanma.

---

## 7. Dokunulan Dosyalar

### 7.1 Yeni dosyalar

| Dosya | Amaç |
|---|---|
| `lib/commerce/storefront-sitemap.ts` | Site haritası için güvenli kamu vitrin listesi |
| `lib/content/cache.ts` | Süreç içi TTL + single-flight içerik önbelleği |
| `lib/content/public-content.ts` | Sözlük / rehber / yasal önbellekli yükleyiciler |
| `lib/career/proof-share.ts` | Kamu kanıt kartı paylaşım URL üreticileri |
| `components/career/proof-share-bar.tsx` | Paylaşım çubuğu (3 aksiyon) |
| `components/tezgah/surface-skeleton.tsx` | Tembel yüzey yükleme iskeleti |
| `app/styles/tokens.css` | Tasarım token katmanı |
| `app/styles/animations.css` | `@keyframes` katmanı |
| `tests/helpers/style-bundle.ts` | Stil katmanlarını tek bütün okuyan test yardımcısı |
| `tests/ui/home-resources-surface.test.ts` | P2 SEO kapısı (7 test) |
| `tests/commerce/storefront-sitemap.test.ts` | Vitrin sitemap yükleyicisi (5 test) |
| `tests/kernel/content-cache.test.ts` | Önbellek + sayfa bağlantısı (11 test) |
| `tests/kernel/academy-dead-code-archive.test.ts` | Ölü kod arşiv kapısı (5 test) |
| `tests/tezgah/workbench-split-surface.test.ts` | Kod bölme + CSS katman kapısı (7 test) |
| `tests/career/proof-share-bar-surface.test.ts` | Paylaşım çubuğu kapısı (8 test) |
| `tests/sales/offer-form-surface.test.ts` | Form sınır uyumu kapısı (8 test) |
| `docs/tedavi-raporu-faz2.md` | Bu rapor |

### 7.2 Değişen dosyalar

| Dosya | Değişiklik |
|---|---|
| `app/(public)/page.tsx` | Kaynaklar & Ücretsiz Araçlar bölümü |
| `app/(public)/sozluk/page.tsx` | Önbellekli yükleyici (async) |
| `app/(public)/sozluk/[terim]/page.tsx` | Önbellekli yükleyici |
| `app/(public)/rehber/[slug]/page.tsx` | Önbellekli yükleyici |
| `app/(public)/legal/[slug]/page.tsx` | Önbellekli yükleyici |
| `app/(public)/vize/[id]/page.tsx` | 3 görünümde paylaşım çubuğu |
| `app/sitemap.ts` | Dinamik vitrin girişleri (fail-safe) |
| `app/globals.css` | `@import` katmanları; token/keyframes çıktı; tezgâh print kuralı içeri |
| `app/tezgah/layout.tsx` | Inline `<style>` kaldırıldı |
| `components/tezgah/workbench.tsx` | 5 yüzey `next/dynamic` + iskelet |
| `components/career/public-talent-board.tsx` | Paylaşım çubuğu bağlandı |
| `components/kurumsal/offer-form.tsx` | İstemci doğrulama + `maxLength` |
| `components/ui/icons.tsx` | `IconWhatsApp` |
| `lib/copy/seo.ts` | `SITEMAP_STATIC_PATHS` + `/magaza` politikası |
| `lib/copy/sen-voice/public.ts` | `resources*` kopyası |
| `lib/copy/sen-voice/career.ts` | Paylaşım çubuğu kopyası |
| `lib/kernel/env.ts` | `RATE_LIMIT_SINGLE_NODE_ACK` |
| `lib/kernel/security/rate-limit-runtime.ts` | Biçim |
| `instrumentation.ts` | `ops.rate_limit.store_not_shared` |
| `scripts/ops-runtime-readiness-lib.ts` | OPS-5 üretim kapısı + tablo düzeltmesi |
| `scripts/ops-runtime-readiness.ts` | Sözleşme güncellemesi |
| `scripts/room-ceiling-lib.ts` | `lib/content` paylaşılan katman kaydı |
| `vitest.frozen.config.ts` | Taşınan 3 bileşen arşiv takma adı |
| `.env.example` | OPS-5 üretim kapısı belgesi |
| `tests/copy/seo-surface.test.ts` | `SITEMAP_STATIC_PATHS` derin eşitliği |
| `tests/kernel/runtime-readiness.test.ts` | OPS-5 kapı testleri (tersine çevrildi + 2 yeni) |
| `tests/kernel/legal-launch-surface.test.ts` | `loadLegalSection` iddiası |
| `tests/ui/room-floor-surface.test.ts` | `readCss()` → stil bütünü |
| `tests/ui/public-home-cta-surface.test.ts` | `readStyleBundle()` |
| `tests/dashboard/citizen-surface.test.ts` | `readStyleBundle()` |
| `tests/kernel/performance-headers-surface.test.ts` | `readStyleBundle()` |
| `tests/kernel/junior-stage-containment.test.ts` | `readStyleBundle()` |

### 7.3 Taşınan dosyalar (arşiv)

```
components/academy/course-card.tsx          → archived/academy/components/
components/academy/course-list.tsx          → archived/academy/components/
components/academy/begin-checkout-link.tsx  → archived/academy/components/
tests/ui/academy-vitrine-shelves.test.ts    → archived/academy/tests/
archived/academy/tests/*.test.ts (5 dosya)  → readSrc yolları arşive çevrildi
archived/academy/tests/*.test.ts (24 dosya) → readStyleBundle() (stil katmanı)
```

---

## 8. Açık Bırakılanlar (bilinçli)

| Konu | Neden dokunulmadı |
|---|---|
| `lib/academy` ölü modül kapanışı (120 modül) | Bu fazda **yalnız `components/academy`** hedeflendi. `lib/academy/curricula/**`, `lesson-*.ts`, `*-workspace.ts` dosyaları arşiv testleri ve `verify:academy-curriculum` tarafından **okunuyor**; toplu taşıma bu kapıları kırardı. Ayrı bir fazın konusu. |
| `/freelancer` ölü yüzey kodu | Kenar `/freelancer` yolunu **her koşulda** `frozen-410` ile kesiyor (`decideEdgeAction` doğrulandı) ama oda kaydı `kapali:true` + `DRON_FREELANCER_OPEN` bayrağıyla **açılabilir** durumda; ayrıca 13 test dosyası `components/freelancer/**` yüzeyini doğruluyor (`tests/freelancer/*`). Bayrak açıldığında ürün canlanacağı için silme kararı ürün kararıdır. |
| `next/image`'a geçiş (35 MB `academy/cinema`) | Tespit P3/13. `/academy` kapalı olduğu için bu görseller hiçbir canlı sayfada kullanılmıyor; taşıma `public/` bütçesini zaten etkilemiyor (`verify:public-size` 55,6 MB, eşik 850 MB). Medya sahipliği ayrı karar. |
| `/vize/[id]` soft-404 `noindex` | Tespit #23. Faz 1'de `MISSING_CARD_ROBOTS` ile **zaten kapatıldı** (`tests/copy/seo-surface.test.ts` kilitli). |
| Junior indeks açılışı (P4/15) | Ürün/pazarlama kararı; `robots` politikası bilinçli kapalı. |

---

## 9. Doğrulama Komutları ve Çıktıları

```bash
$ npx tsc --noEmit
(çıktı yok — 0 hata)

$ npx eslint .
(çıktı yok — 0 error, 0 warning)

$ npx vitest run
Test Files  853 passed (853)
Tests       1969 passed (1969)

$ npx tsx scripts/verify-api-auth.ts --check
verify:api-auth --check OK — 132 route.
{"session":73,"public":25,"closed":11,"cron":2,"admin":13,"webhook":8,"hybrid":0,"internal":0}

$ npx tsx scripts/verify-no-secrets.ts
verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok.

$ npx tsx scripts/verify-boundaries.ts
verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine, …

$ npm run ops:runtime-readiness
OPS-5 Hız tavanı (lansman kararı 19 Ağustos 2026; Faz 2 üretim kapısı):
  rateLimitStore=in-process-single-node hosting=unspecified singleNodeAck=hayır
  ÜRETİMDE (NODE_ENV=production) bu mod BUILD DÜŞÜRÜR: RATE_LIMIT_REDIS_REST_* zorunlu (OPS-5).
exit_code: 0 (lab — beklenen)

$ npm run verify:academy-curriculum
OK: yazılmış eğitimler en az 6 ders ve ders başı 600 kelime. UTF-8 mühür sağlam.

$ npm run verify:junior-content ; npm run verify:junior-sync
verify:junior-sync OK

$ npm run verify:public-size
public/ Vercel paketi: 55.6 MB. OK: public/ boyut bütçesi uyarı eşiğinin altında.

$ npm run verify:paytr-reconciliation-seals
Test Files  3 passed (3) / Tests  22 passed (22)

$ npx vitest run --config vitest.frozen.config.ts
Test Files  21 failed | 154 passed (175)   ← Faz 1 ile AYNI (yeni kırık 0)
Tests       34 failed | 723 passed (755)

$ npx next build
✓ Compiled successfully
exit_code: 0
```

---

## 10. Faz 3 İçin Öneri (öncelik sırası)

1. **`lib/academy` ölü kapanışı** — 120 dış referanssız modül. Arşiv testlerini de
   `archived/academy/` altına alıp canlı `lib/academy` yüzeyini `load.ts`, `pilot-sku.ts`,
   `production-standard.ts`, `certificate-verify.ts` ile sınırlamak. Bu fazda yol açıldı:
   `components/academy` %80 küçüldü; aynı desen `lib/academy` için uygulanabilir.
2. **`/freelancer` kararı** — ya bayrak kapatılıp yüzey tamamen silinir, ya da oda yeniden
   açılır. Bugünkü hâli "kapalı ama test edilen" bir yüzey; iki yön de savunulabilir, ama
   belirsizlik maliyet üretiyor.
3. **Sitemap `lastmod` doğruluğu** — vitrin girişleri şu an editöryal mühür gününü taşıyor.
   Mağaza bazlı `updatedAt` taşınması taranma sıklığını iyileştirir.
4. **`next build` lint kapısı** — build zincirinde `eslint` yok (tespit #7). CI'da
   `verify:all` var; build'in kendisi de lint koşarsa yerel hata kaçağı kapanır.
