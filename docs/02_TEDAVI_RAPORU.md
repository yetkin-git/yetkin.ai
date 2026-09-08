# 02 — Tedavi Raporu (Paket 1: Yayın sapması ve Freelancer hizalaması)

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Makam | Cursor ajanı (Grok 4.6) — Tedavi Aşaması, Paket 1 |
| Kanon | Yerel çalışma ağacı (`D:/yetkin.ai`) — CEO / SUPER ADMIN kararı: 5 compact SKU, Akademi-first |
| Kapsam | T0 (sitemap, ana sayfa kopyası, hukuk yürürlük) + T3 (Freelancer küçültme) |
| Durum | Yerel kod kapatıldı. Canlı `yetkin.ai` bu PR deploy edilene kadar eski yüzü basmaya devam eder. |
| Girdi | `/docs/01_TESPIT_RAPORU.md` |
| Çıktı | Kod değişikliği + bu rapor |

**Okuma notu:** Bu paket Akademi vitrinindeki eski 13 kursu kesmez. O iş Paket 2’dir. Burada yalnız yayın dürüstlüğü (T0) ve Freelancer’ın arka plana çekilmesi (T3) vardır.

---

## 0. Yönetici özeti

1. **T0 kapatıldı (yerel).** `sitemap.ts` katalog tohumu / Prisma overlay’den koparıldı; statik yüzey her zaman üretilir, kurs satırları fail-closed. Ana sayfa “Ödeme henüz bağlanmadı” iddiasını bırakır; PayTR Merchant onay + iFrame altyapısı dürüst kopyası basılır. Hukuk yürürlük SSOT’u 5 Eylül 2026 / `2026-09-05` kasa rızası ile hizalıdır.
2. **T3 kapatıldı (yerel).** Freelancer ana CTA’dan düştü (410/gone eşit düğme kalktı, dipnot “Platform örneği · emanet kapalı”, sitemap önceliği 0.4, yan menü blurb arka plan). Beş hazine tohum ilanı silinmedi; organik tahtadan ayrıldı ve “Platform örneği / Emanet kapalı” (kabul 503) damgası taşır.
3. **Canlı henüz eski.** 8 Eylül 2026 itibarıyla `GET https://yetkin.ai/sitemap.xml` hâlâ **500**; ana sayfa hâlâ “ödeme henüz bağlanmadı”; hukuk hâlâ 31 Ağustos. Tedavi, deploy ile tamamlanır.

---

## 1. Adım 1 — T0 yayın sapması

### 1.1 `sitemap.xml` 500

**Canlı (tedavi öncesi, hâlâ):** `GET https://yetkin.ai/sitemap.xml` → 500. robots.txt Sitemap satırı bu adresi gösterir; SEO ve PayTR mağaza incelemesi kördür.

**Kök neden (yerel analiz):** `app/sitemap.ts` `publishedCoursesFromSeed()` → katalog tohumu / fiyat / seviye zincirini yüklüyordu. Modül değerlendirme veya kapak çözümü throw ederse Next.js metadata sitemap’i **tüm** `/sitemap.xml` yanıtını 500 yapar. Canlıdaki eski katalog + yeni sitemap import’u bu sınıfa girer.

**Tedavi:**

| Önce | Sonra |
|------|--------|
| `publishedCoursesFromSeed()` + `filterAcademyGrowthCatalog` | Yalnız `ACADEMY_GROWTH_SKU_SLUGS` (`01_office_ai` … `05_prompt_practice`) |
| Tek throw = boş 500 | Kurs bloğu try/catch; dış try/catch statik yasal/oda URL’lerini yine basar |
| `lastModified` 31 Ağustos (HEAD) | `2026-09-05` |

Dosya: `app/sitemap.ts`. Fiyat, Prisma overlay ve müfredat gövdesi sitemap’e girmez.

**Doğrulama (yerel):** `tests/copy/seo-surface.test.ts` + `tests/kernel/legal-launch-surface.test.ts` — sitemap 5 compact SKU, yasal yollar, `https://yetkin.ai` mutlak `loc`. Canlı 500, deploy sonrası kapanır.

### 1.2 Ana sayfa ödeme kopyası

**Canlı (hâlâ):** H1 “Güvenli kariyer ve iş platformu”; güven maddesi “Ödeme henüz bağlanmadı / pasif — sahte bakiye yazılmaz”; üç basamaklı merdiven (Akademi → Kanıt → İlan/İş).

**Yerel (kanon, bu paket):**

- H1: “Yetkinliğini kanıtlayan yapay zekâ eğitimleri”
- Ana CTA: yalnız “Eğitimleri İncele” → `/academy`
- Güven: “PayTR Merchant onayı sürecindedir. PayTR iFrame altyapısı hazırdır; kart numarası platformda tutulmaz”
- “Ödeme henüz bağlanmadı / pasif” kamu inişinden silindi

Dürüstlük sınırı: Merchant paneli onayı bitmeden “cüzdan yüklemesi iFrame ile alınır” (tahsilat varmış gibi) yazılmaz. iFrame **altyapısı** hazırdır; canlı kart çekimi onay tamamına bağlıdır. Split / emanet 503 kopyası (`lib/kernel/payments/port.ts`, cüzdan, Akademi `purchase.closed`) durur — o yollar hâlâ bağlanmamıştır.

Dosyalar: `lib/copy/sen-voice/public.ts`, `lib/copy/seo.ts`.

### 1.3 Yasal yürürlük — 5 Eylül 2026

**Canlı (hâlâ):** `/legal/gizlilik` “Yürürlük: 31 Ağustos 2026”.

**Yerel SSOT (zaten Tedavi 01 kanonu; bu pakette mühürlendi):**

| Kaynak | Değer |
|--------|--------|
| `LEGAL_UPDATED_LABEL` | `Yürürlük: 5 Eylül 2026` |
| `CHECKOUT_LEGAL_CONSENT_VERSION` | `2026-09-05` |
| Sitemap `lastModified` | `2026-09-05` |

Sayfalar `LEGAL_UPDATED_LABEL` basar: `/legal`, `/legal/[slug]`, `/iletisim`. Test: `tests/kernel/legal-launch-surface.test.ts`.

---

## 2. Adım 2 — T3 Freelancer küçültme

İlan / teklif / sözleşme / uyuşmazlık **kodu silinmedi.** Oda HTTP 410 değildir. Yüzey ağırlığı düştü.

### 2.1 Ana yönlendirmeden çıkarma

| Yüzey | Tedavi |
|-------|--------|
| Ana sayfa dipnot | “Platform örneği · emanet kapalı” — kahraman değil |
| 410 / gone CTA | Freelancer eşit düğme kalktı; kalan: Ana sayfa + Akademi + Kariyer |
| Yan menü blurb | “Arka plan · emanet kapalı” |
| Sitemap öncelik | `/freelancer` 0.9 → **0.4** (Akademi 1.0, Kariyer 0.9) |
| SEO açıklama | Arka plan + tohum örnek + kabul 503 |

Oturumlu kabukta oda hâlâ vardır (işveren/usta tezgâhı). Kamu kahramanı Akademi’dir.

### 2.2 Beş tohum ilan — yayından ayırma, kod durur

`FREELANCER_JOB_SEEDS` ve SQL tohumu durur (`fj_rail_icon_set` … `fj_yetkin_acik_deneme`). Bid/accept route’ları durur.

| Önce | Sonra |
|------|--------|
| Rozet “Örn. Görev” | **Platform örneği / Emanet kapalı** |
| Beş tohum “Açık ilan” sayacı ve ızgarada | Organik tahta ayrı; tohumlar “Platform örnekleri” bölümünde |
| Kart CTA “İncele / Teklif Ver” (tohum) | “Örneği incele” |
| Detay | `exampleBanner`: gerçek işveren işi değil; kabul 503 |

`partitionFreelancerBoardJobs` (`lib/freelancer/listing-face.ts`) organik / sistem ayırır. `isFreelancerSystemListing` kimlikleri silmez.

---

## 3. Değişen dosyalar (Paket 1)

- `app/sitemap.ts`
- `app/freelancer/page.tsx`
- `app/freelancer/jobs/[id]/page.tsx`
- `lib/copy/sen-voice/public.ts`
- `lib/copy/sen-voice/freelancer.ts`
- `lib/copy/seo.ts`
- `lib/kernel/rooms.ssot.ts`
- `lib/kernel/http/frozen-410-html.ts`
- `lib/freelancer/listing-face.ts`
- `components/freelancer/job-card.tsx`
- `components/shell/frozen-room-gone-page.tsx`
- ilgili yüzey testleri (`tests/copy`, `tests/freelancer`, `tests/kernel`, `tests/ui`, `tests/e2e`)

Yerel doğrulama: 13 test dosyası / 67 test geçti (Paket 1 yüzeyi). Playwright e2e bu oturumda koşturulmadı; spec kopyası hizalandı.

---

## 4. Stratejik değerlendirme

### 4.1 SEN OLSAYDIN NE YAPARDIN?

**Eski canlı 13 kursu (Python / Full-Stack / sızma / Canva / Ads …) kesip 5 compact SKU’ya düşürmenin en güvenli yolu: vitrini kes, lisansı öldürme.**

Sıra:

1. **Nüfus sayımı (bloklayıcı).** Super Admin, canlı DB’de eski slug’lara (`python-temel`, `fullstack-*`, `security-*`, masterclass’lar) `SETTLED` satın alma veya aktif lisans var mı bakar. Bu ajan gizli env/DB okumaz; sayı sıfır değilse iletişim planı olmadan kesim A5 ihlalidir.
2. **Tek vitrin SSOT.** Zaten yazılmış: `ACADEMY_GROWTH_SKU_SLUGS` + `filterAcademyGrowthCatalog` + `mergePublishedAcademyCatalog` (tohumda olmayan yayındaki hayalet SKU vitrine girmez). Paket 2 yeni motor yazmaz; bu kesiti deploy eder.
3. **Yayın bayrağı, DROP değil.** Eski satır `isPublished=false` veya overlay’den düşer. `PriceCatalogEntry` / lisans / mühür satırı silinmez. Sahip olan vatandaş antreyi okumaya devam eder; vitrin satmaz.
4. **URL dürüstlüğü.** Eski `/academy/{eski-slug}` için 301 → `/academy` (katalog) veya 410 + “bu SKU yayından kalktı”. 200 + boş müfredat yasak. Sitemap zaten yalnız 5 compact slug basar (bu paket).
5. **Kanon 13 ≠ vitrin 5.** `ACADEMY_CANON_SKU_SLUGS` (01–13) müfredat defteridir; 06–13 ingest edilmez. Canlıdaki **üçüncü gerçek** (Python–Ads yığını) ile karıştırılmaz. Paket 2 o yığını keser; 06–13’ü açmaz.

Yapmazdım: müfredat dosyası DROP + lisans CASCADE; “13 kursu bir gecede 5’e indirip eski URL’yi 200 tutma”; Split’i aynı PR’da açma.

### 4.2 SONRAKİ ADIM — Paket 2’ye hazır mıyız?

**Kod olarak evet; operasyon olarak hayır — tek kapı nüfus sayımıdır.**

| Hazır | Eksik |
|-------|--------|
| Yerel vitrin zaten 5 compact SKU | Canlı hâlâ eski 13+ basıyor; Paket 1 deploy’u yok |
| Sitemap 5 slug (bu paket) | Eski slug 301/410 haritası yazılmadı |
| `mergePublishedAcademyCatalog` hayalet keser | Canlı lisans/satın alma sayımı yok |
| Compact müfredat + sınav havuzu 01–05 | 06–13 bilinçli erteleme (T4) |

**Paket 2 açılır** şu üç madde aynı PR’da veya hemen önce kapanırsa:

1. Bu Paket 1 (T0+T3) canlıya çıkar; `sitemap.xml` 200, ana sayfa Merchant kopyası, hukuk 5 Eylül.
2. Super Admin eski SKU lisans sayısını bildirir (sıfır veya grandfather listesi).
3. Eski slug yönlendirme tablosu (301 katalog / 410 dürüst) gözden geçer.

O üçü olmadan Paket 2 “vitrin temizliği” değil, **lisans kopması** riskidir.

Paket 2’nin konusu: canlı Akademi kartlarını 5 compact SKU’ya indirmek, eski katalog kopyasını (Python, sızma, Ads, “Seslendirmeli İçerik” vaadi) kesmek. T1 (PayTR ilk CLEARED) bu paketin parçası değildir; nakit ayrı mühürdür.

---

## 5. SUPER ADMIN’e bildirim

Paket 1 (T0+T3) **yerel kanonda tamam.** Canlı sapma duruyor; kapanış **deploy**’dur.

Lütfen sırayla:

1. Bu çalışma ağacını üretime alın (Paket 1). Ardından dışarıdan doğrulayın:
   - `GET https://yetkin.ai/sitemap.xml` → 200, `loc` mutlak, 5 compact kurs
   - `GET /` → “Ödeme henüz bağlanmadı” yok; Merchant onay / iFrame altyapısı kopyası
   - `GET /legal/gizlilik` → Yürürlük: 5 Eylül 2026
   - `GET /freelancer` → tohumlar “Platform örneği / Emanet kapalı”; organik “Açık ilan” ayrı
2. Paket 2 öncesi: canlı DB’de eski kurs lisans/satın alma sayısı.
3. Split ve Junior çocuk ürünü açılmasın.

Junior kilit ve `MARKETPLACE_SPLIT_LIVE = false` bu pakette değişmedi.

Tedavi Aşaması Paket 1 kapanışı: `/docs/02_TEDAVI_RAPORU.md`.
