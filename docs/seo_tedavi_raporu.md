# yetkin.ai — Academy ve Office AI SEO Tedavi Raporu

- **Tarih:** 20 Eylül 2026
- **Kapsam:** `https://yetkin.ai/academy/01_office_ai` (amiral SKU) + global indeks hijyeni
- **Dayanak:** `/docs/seo_tespit_raporu.md` (CEO onaylı) — bu rapor onun tedavi fazıdır
- **İlke:** Sicil/sertifika başlığı (`course.title` SSOT) değişmedi; satın alma duvarı delinmedi; sahte yıldız/yorum basılmadı; `keywords` meta eklenmedi

---

## ADIM 1: Meta Etiket ve Title Rewrite (P0) ✅

### 1.1 `generateMetadata` — `01_office_ai` özel dalı

**Dosya:** `app/academy/[slug]/page.tsx` (`generateMetadata`), sabitler `lib/copy/seo.ts` (`OFFICE_AI_SEO`)

| Meta | Önce | Sonra |
|---|---|---|
| `title` (ham) | `İş Hayatında ve Ofiste Yapay Zekâ (...) · Akademi` — 91 kr | `Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika` — **52 kr** |
| `title` (final, template sonrası) | 103 kr 🔴 kesilir | **64 kr** ✅ kesintisiz |
| `description` | 177 kr özellik listesi, CTA yok | **170 kr** fayda + kapsam + belge + CTA ✅ |
| H1 (gövde `PageHeader`) | Title ile birebir aynı (81 kr) | `Ofiste Yapay Zekâ: Excel'den E-Postaya 9 Derste Verimlilik` — **58 kr**, kullanıcı dili ✅ |

Yeni description:

> 9 derste Excel, Word, PowerPoint ve Gmail'de yapay zekâ: KVKK-safe tablo, yönetim özeti, slayt ve Cuma 30 rutini. Sesli anlatım + 70+ barajlı sınavla sertifikanı mühürle.

Kapsanan niyet dizgileri: `excel yapay zeka eğitimi` (title başında tam eşleşme), `ChatGPT`, `Sertifika`, `9 ders`, `70+ baraj`, `Sesli anlatım`. Breadcrumb ve JSON-LD `name` hâlâ sicil başlığını (`board.course.title`) taşır — diploma/sicil metni ile SEO metni ayrıştı, SSOT korundu. Diğer SKU'lar eski dalı (`${course.title} · Akademi` + `course.summary`) kullanmaya devam eder.

### 1.2 SEM anahtar kelimeler

**Dosya:** `lib/copy/sem-keywords.ts` (`SEM_LANDING_KEYWORDS`)

Eklenen 4 niyet dizgisi: `excel yapay zeka eğitimi`, `ofiste chatgpt`, `word yapay zeka`, `yapay zeka sertifikasi`. Tümü antre yüzeyinde (H1/H2/meta/SSS/rehber) birebir geçer; tutarlılık `tests/copy/seo-surface.test.ts` ile kilitlidir (ilk 5 küresel anahtar kelime ana sayfa/vitrin testini aynen geçmeye devam eder).

---

## ADIM 2: Zengin Veri — Schema.org / JSON-LD (P0) ✅

### 2.1 `courseJsonLd` genişletmesi

**Dosya:** `lib/copy/json-ld.ts`

| Alan | Önce | Sonra |
|---|---|---|
| `offers` | ❌ yok | ✅ `Offer` — tohum fiyatı dinamik (`ACADEMY_CATALOG_PRICE_MINOR`: 89000 kr → `"890"`), `priceCurrency: TRY`, `availability: InStock`, kurs URL'i |
| `educationalCredentialAwarded` | Düz string | ✅ Tip'li `EducationalOccupationalCredential` (`name: yetkin.ai Ofis Yapay Zekâ Sertifikası`, `credentialCategory: certificate`, `recognizedBy: #organization`) |
| `teaches` | ❌ yok | ✅ 9 yetkinlik (`OFFICE_AI_COURSE_TEACHES`: Excel veri temizliği, KVKK maskeleme, Yönetim özeti, Sunum hazırlama, …) |
| `hasPart` | ❌ yok | ✅ 9 ders (`CreativeWork` + `position` + ders adı) |
| `syllabusSections` | ❌ yok | ✅ 3 modül (`Syllabus`: Modül 1/2/3, ders `timeRequired` süreleriyle) |
| `timeRequired` | ❌ yok | ✅ Toplam müfredat süresi (ISO 8601, örn. ders sürelerinden `PT…H…M`) |

Tasarım notları:

- Fiyat **dinamik**: arayan `priceMinor` verirse o kullanılır (antre `board.course.priceMinor`, DB overlay'li); verilmezse tohum haritasından çözülür. Para birimi `board.course.currencyCode`, varsayılan `TRY`.
- Ders listesi **dinamik**: antre `syllabus.lessons` (SSOT) verir; `OFFICE_AI_SYLLABUS_LESSONS` yalnız yedektir ve `lesson-index.ts` sırasıyla birebir örtüşmesi testle kilitlidir (kayma = kırmızı test).
- `aggregateRating`/`review` **bilerek eklenmedi** — gerçek değerlendirme birikmeden sahte yıldız basılmaz.
- Bilinmeyen slug'lar (örn. testteki `python-temel`) için `offers`/`teaches`/`hasPart` düşmez; fonksiyon geriye dönük uyumludur.

### 2.2 Kursa özel görünür SSS + `FAQPage`

**Dosyalar:** `lib/copy/sem-keywords.ts` (`OFFICE_AI_COURSE_FAQ`, `OFFICE_AI_FAQ_HEADING`), `app/academy/[slug]/page.tsx` (`LandingFaq` + `faqPageJsonLd`)

4 soru (görev metniyle birebir): *Excel yapay zeka eğitimi sertifika veriyor mu? / ChatGPT ofis kullanımı için ön koşul var mı? / KVKK'ya uygun mu? Verilerim güvende mi? / Sınav barajı ve süresi nedir?* Yanıtlar SSOT-honesttir: 9 ders + 70+ baraj + 30 dk/10 soru sınav, ön koşul yok + Copilot lisansı gerekmez, KVKK maskeleme (Müşteri A, MASKELİ_IBAN, 3 sahte satır), sertifika → Kariyer + `/academy/dogrula` sicili.

**%100 eşleşme garantisi:** görünür `<LandingFaq items={OFFICE_AI_COURSE_FAQ}>` ile `faqPageJsonLd(OFFICE_AI_COURSE_FAQ)` **aynı sabitten** beslenir; test her `Question.name`/`acceptedAnswer.text` çiftini sabitle karşılaştırır. Gizli markup cezası riski yoktur. SSS başlığı niyet dizgisini H2'de taşır: *Excel yapay zeka eğitimi hakkında sık sorulanlar*.

---

## ADIM 3: İndeks Hijyeni ve Robots Kilitleri (P1) ✅

| İş | Dosya | Sonuç |
|---|---|---|
| Sicil sayfası `noindex` | `lib/academy/certificate-share.ts` (`academyVerifyShareMetadata`) | `robots: { index: false, follow: true }` — 4 `generateMetadata` dalının tümünü kapsar; binlerce SHA URL thin-content indeksi üretmez, paylaşım bağları (`follow`) değer taşır |
| Oynatıcı `disallow` | `lib/copy/seo.ts` (`ROBOTS_DISALLOW_PATHS`) + `app/robots.ts` (otomatik) | `/academy/*/oyna` eklendi |
| Oynatıcı `noindex` | `app/academy/[slug]/oyna/page.tsx` (`export const metadata`) | `robots: { index: false, follow: false }` — robots + oturum duvarı ile **üç katmanlı kilit** |
| Dinamik `lastModified` | `app/sitemap.ts` | Sabit `new Date("2026-09-05")` → dinamik `new Date()` (üretim anı); kurs girdileri hâlâ `ACADEMY_GROWTH_SKU_SLUGS` SSOT'undan, öncelik/sıklık politikası değişmedi |

Doğrulama notu: `/academy/dogrula` **iniş** sayfası indekslenebilir kalır (`PAGE_SEO.academyVerify`, `noindex` yok) — yalnız `[hash]` sicil sayfaları `noindex` yer. `/academy/01_office_ai` taranabilirliği etkilenmez (`Allow: /academy` + sitemap 0.8/weekly aynen durur).

---

## ADIM 4: Açık Müfredat ve Kelime Derinliği (P1) ✅

**Dosya:** `components/academy/office-ai-guide-preview.tsx` (yeni, SSR Server Component — `use client`/hook yok), antreye `CurriculumOutline` sonrasına gömüldü.

**Blok:** ~**1264 kelime**, 4 H2 + 3 H3 + 5 maddelik ordered liste + 2 iç bağlantı (`#satin-al`, `/academy/dogrula`).

| Bölüm | İçerik | Niyet kilidi (H2) |
|---|---|---|
| Ders 1 önizleme | Dağınık tablo → A1 eşiği → Üç Kapı → tür tek-tipleme; ilk %20'lik özet, "önizleme burada biter" beyanıyla | `Excel yapay zeka eğitimi: A1'den temiz tabloya` |
| KVKK 5 altın kural | Ham liste yasağı, maskeleme, 3 sahte satır, 3. Kapı disiplini, "silmek geri almaz" + aydınlatma/VERBIS | `Ofiste ChatGPT kullanımı: KVKK-safe 5 altın kural` |
| Word/Gmail/Slayt | Word ataş (sözleşme/dilekçe/rapor), yönetim özeti, slayt tek-fikir kuralı, e-posta ritüeli, hata avı, Cuma 30 | `Word yapay zeka, Gmail ve PowerPoint: dilekçe, rapor ve slayt` |
| Sınav/Sertifika | 9 ders şartı, 30 dk/10 soru, baraj 70, 365 gün lisans, Kariyer + sicil akışı, ascii yazım notu | `Sertifika ve sınav: 70+ baraj nasıl geçilir?` |

**Duvar beyanı** blokta açıkça yazılıdır: tam ders gövdeleri, ses kasetleri, karaoke akışı ve sınav havuzu ödeme sonrası açılır. Sayfa toplamı: ~400 → **~1650+ kelime** kamuya açık derinlik. 4 amiral niyet dizgisinin tamamı blokta birebir geçer (testle kilitli).

---

## Doğrulama

| Kontrol | Sonuç |
|---|---|
| `npx vitest run tests/copy/seo-surface.test.ts tests/academy/certificate-share-surface.test.ts` | ✅ **28/28 yeşil** (5 yeni tedavi testi dahil) |
| `npm run test` (varsayılan paket) | ✅ **219 dosya / 1045 test yeşil** |
| `tsc --noEmit` (dokunulan dosyalar) | ✅ Dokunulan 10 dosyada **0 hata** |
| Title final uzunluğu | 52 + 12 (template) = **64 kr** ✅ |
| Description uzunluğu | **170 kr** ✅ |
| Rehber kelime sayısı | **1264** ✅ |
| FAQ JSON-LD ↔ HTML eşleşmesi | **4/4 birebir** ✅ |

### Önceden var olan (bu görev dışı) kırmızılar — dokunulmadı

1. `tsc`: `tests/academy/office-ai-bridge-lock.test.ts:130` — in-flight office_ai bridge çalışmasının dosyasında (`git status`: başkası tarafından `M`), bu görevle ilgisiz.
2. `npm run test:all` (surface dahil): 2 hata — `tests/kernel/earnings-bridge.test.ts` (**varsayılan paketten zaten hariç**, `package.json` exclude) ve `tests/kernel/system-docs-contract-surface.test.ts` (`faz2-t3-dron-ring` dosyasının HEAD'teki `docs/DURUM.md` okumasıyla sözleşme çelişmesi; iki dosya da bu görevde dokunulmadı). İkisi de HEAD/çalışma-ağacı öncesinden kırmızıdır.

---

## Dosya Değişim Özeti

| Dosya | Değişim |
|---|---|
| `lib/copy/seo.ts` | `OFFICE_AI_SEO` (title/desc/h1) + `ROBOTS_DISALLOW_PATHS` → `/academy/*/oyna` |
| `lib/copy/sem-keywords.ts` | 4 niyet dizgisi + `OFFICE_AI_COURSE_FAQ` (4 Soru/Yanıt) + `OFFICE_AI_FAQ_HEADING` |
| `lib/copy/json-ld.ts` | `courseJsonLd`: `offers` + tip'li credential + `teaches` + `hasPart` + `syllabusSections` + `timeRequired`; `OFFICE_AI_COURSE_TEACHES` + `OFFICE_AI_SYLLABUS_LESSONS` yedekleri |
| `app/academy/[slug]/page.tsx` | Amiral meta dalı + H1 override + zengin JSON-LD (Course+FAQ+Breadcrumb) + görünür SSS + rehber bloğu |
| `components/academy/office-ai-guide-preview.tsx` | **Yeni** — 1264 kelimelik SSR rehber/önizleme |
| `lib/academy/certificate-share.ts` | Sicil `robots: noindex, follow` |
| `app/academy/[slug]/oyna/page.tsx` | Oynatıcı `robots: noindex, nofollow` |
| `app/sitemap.ts` | Dinamik `lastModified` |
| `tests/copy/seo-surface.test.ts` | Credential/offers/teaches/hasPart + SEM kuyruk + tedavi `describe` (5 test) + robots/sitemap kilitleri |
| `tests/academy/certificate-share-surface.test.ts` | Sicil robots kilidi |

---

## Cursor SEO Vizyonu ve Büyüme Planı

### 1. SEN OLSAYDIN NE YAPARDIN? — 30 günde 10x organik için `/rehber/excel-yapay-zeka-kullanimi` kurgusu

Tek bir "blog yazısı" değil, **huni görevi gören bir pillar (sütun) sayfa + 4 destek makale** kurgulardım. Pillar, antreye link suyu taşıyan ve long-tail'i süpüren yapıdır:

**Pillar: `/rehber/excel-yapay-zeka-kullanimi` (~2500 kelime, `HowTo` + `Article` + `BreadcrumbList` + `FAQPage` şemalı)**

- H1: `Excel'de Yapay Zekâ Kullanımı: 2026 Resimli Rehber (ChatGPT + Copilot + Gemini)` — yıl + araç adları = tazelik ve transactional niyet.
- 7 adımlı `HowTo`: dağınık tabloyu indir (örnek CSV linki) → A1 eşiği → Copilot/ataş/maskeli-özet üç kapısı → temizleme komutu → yönetim özeti → hata avı. Her adımda `HowToStep` şeması + 1 ekran görüntüsü (AVIF, `immutable` boru hattından).
- 3 CTA hunisi: üstte yumuşak ("9 derslik eğitimin ilk ders özeti antrede"), ortada araç ("KVKK-safe 5 kuralı öğren"), altta sert ("70+ barajlı sınavla sertifikanı mühürle → `/academy/01_office_ai`"). Tüm iç linkler slug SSOT'undan (`catalog-ids`), çapa metinleri niyet dizgileriyle (`excel yapay zeka eğitimi`, `ofiste chatgpt`).
- Özgünlük kilidi: ders gövdesinden kopyala-yapıştır YOK; rehber dili "nasıl yapılır", ders dili "sınıfta işlenir". Google duplicate değil complementary içerik görür.

**4 destek makale (her biri ~1200 kelime, pillar'a + antreye link):** `/rehber/kvkk-yapay-zeka-maskeleme` (YMYL-dikkatli, avukat onaylı 1 paragraf), `/rehber/gmail-gemini-aksiyon-listesi`, `/rehber/word-dilekce-yapay-zeka`, `/rehber/powerpoint-slayt-yapay-zeka`. Her biri 1 `FAQPage` (2-3 soru) + pillar'a `isPartOf`.

**30 gün takvimi:** Hafta 1: pillar + `/rehber` segmenti (aşağıdaki önbellek tedavisiyle) + sitemap `/rehber` dalı (`priority 0.7`, `weekly`) + iç linkler. Hafta 2-3: 4 destek makale (haftada 2). Hafta 4: GSC sorgu madenciliği → ilk 10 gösterim/0 tıklama sorgusuna pillar'a 1 paragraf + 1 SSS ekleme. **10x beklentisi dürüst tutulur:** 10x, sıfıra yakın bazdan ilk 90 günde gerçekçidir; 30 günde hedef ilk sayfa değil, *ilk 20 + PAA/FAQ görünürlüğü + huniye tıklama*'dır. Ölçü: GSC'de `excel yapay zeka` kümesinde gösterim, pillar→antre iç-link tıklama oranı, antre satın alma dönüşümü.

**Neden önce `/rehber`, sonra ölçek:** Tespit raporundaki mimari hüküm aynen geçerli — 10-20 makale için `lib/rehber/*.ts` + `generateStaticParams` yeterli; 50+ yazıda MDX'e geçilir. Ön koşul: aşağıdaki önbellek tedavisi yapılmadan `/rehber` yayına alınmaz.

### 2. Platform kurgusu doğru mu? — `await connection()` önbellek tedavisi

**Kısa yanıt:** Evet, kurgu doğru; tek yapısal fren kök layout'taki `connection()`'dır ve tedavisi bellidir.

**Bugünkü bedel:** `app/layout.tsx` → `RequestBoundCsp` → `await connection()` tüm HTML'i `no-store`/dinamik tutar (`vercel.json`: tek bölge `fra1`, Node). Sonuç: `/`, `/academy`, `/academy/01_office_ai` ve gelecekteki `/rehber/*` her istekte origin'e düşer; TTFB + fatura bedeli trafikle lineer büyür. Google tarayabilir ama LCP/TTFB sinyali zayıflar; 10x trafikte bu, sıralama tavanına dönüşür. Mevcutta `force-static`/`revalidate` kullanan tek segment yoktur (tarama: yalnız `freelancer` + 3 API route dinamik beyanlı).

**Önerilen tedavi (3 adım, güvenlikten tavizsiz):**

1. **CSP nonce'unu kökten segmente taşı (P0).** `RequestBoundCsp`'yi `app/layout.tsx`'ten çıkarıp yalnız nonce'a gerçekten ihtiyaç duyan segmentlere koy: `(auth)` + `(kernel)` + `/academy/*/oyna` (ödeme/satın alma scriptleri). `(public)`, `/academy` (antre/vitrin), `/career`, `/rehber` nonce'suz kalır → statik/ISR olabilir. A katmanı `script-src` nonce + `strict-dynamic` durur; hash-CSP'ye sessizce dönülmez (dosyadaki uyarı korunur).
2. **Kamu segmentlerini ISR'a al (P0).** `(public)/layout.tsx` + `academy/layout.tsx` + gelecek `/rehber` layout: `export const revalidate = 3600` (rehber 86400). Antre `generateStaticParams` zaten mühürlü SKU'ya kilitli; ISR ile ilk istekte üretilir, 1 saat kenarda durur. Fiyat değişirse `revalidatePath("/academy/01_office_ai")` (fiyat kataloğu yazma yoluna 1 satır) ile anlık tazelenir — yanlış fiyat riski yoktur.
3. **Kenar önbellek başlıkları (P1).** `proxy.ts`'e kamu `GET` için `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` (HTML), statik medya zaten `immutable`. Bakım modu (`SITE_MAINTENANCE_FREEZE`) ve `LIVE_BROADCAST_SHUTDOWN` önbelleği bypass eder (mevcut 503 mantığı korunur).

**Beklenen kazanç:** kamu TTFB'sinde %50-70 düşüş (fra1 → kenar), origin faturasında lineer rahatlama, LCP'de yeşil bölge. **Yapılmaması gereken:** `connection()`'ı kökte tutup `/rehber`'i agresif ölçeklemek (tedavi öncesi manyetik içerik = performans cezası).

### 3. Tedavi sonrası GSC'ye ilk aksiyon adımı

**Tek ilk adım:** **URL Denetimi → `/academy/01_office_ai` → "Dizine eklenmeyi iste"**, hemen ardından **Site Haritaları → `sitemap.xml`'i yeniden gönder**.

Sıralı ilk-hafta protokolü:

1. **Dizine eklenmeyi iste (D0):** antre URL'si + `/rehber` açılınca pillar URL'si. Canlı testi çalıştır; "Sayfa dizine eklenebilir" + ekran görüntüsünde H1/SSS/rehber görünür olduğunu doğrula (JS'siz içerik kanıtı).
2. **Zengin Sonuç Testi (D0):** `Course` (offers/teaches/hasPart), `FAQPage` (4 soru), `BreadcrumbList` — 3/3 geçer. Hata verirse şema değil, veri düzeltilir (fiyat/URL).
3. **Sitemap yeniden gönder (D0):** `https://yetkin.ai/sitemap.xml` — dinamik `lastModified` ilk kez taze basılır; "Bulunan sayfa" sayısında `/academy/01_office_ai` + `/oyna` dışarıda + `[hash]` dışarıda olduğu doğrulanır.
4. **Kaldırma + parametre (D1):** eski `?gate=exam` varyantları ve `/academy/courses/*` için "URL parametreleri"/"Kaldırma" gerekmez (301 + canonical çalışıyor); yalnız GSC'de "Alternatif sayfa (uygun canonical)" olarak göründükleri teyit edilir.
5. **Ölçüm (D14):** Performans → Sorgular: `excel yapay zeka eğitimi`, `ofiste chatgpt`, `word yapay zeka`, `yapay zeka sertifikasi` — gösterim/tıklama/konum baz alınır; D0 öncesi 28 günle karşılaştırılır. Tıklama gelmiyorsa title/description 2. tur (duygu + sayı testi: "9 Derste" zaten var; sıradaki değişken "Sertifikalı" öne alma).

**Kırmızı çizgiler:** `keywords` meta eklenmez, sahte `aggregateRating` basılmaz, duvar arkası gövde umuma açılmaz, `connection()` dururken `/rehber` ölçeklenmez.

---

*Operasyon tamamlandı. Tüm kod değişiklikleri yukarıdaki tablodadır; testler yeşildir; ölçüm D14'te GSC karşılaştırmasıyla yapılır.*
