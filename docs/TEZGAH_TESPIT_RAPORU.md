# yetkin.ai — AI Tezgâh (`/tezgah`) Modülü ve 8 Üretim Masası Derinlemesine Tespit Raporu

**Kapsam:** `app/tezgah`, `app/api/tezgah`, `components/tezgah`, `lib/tezgah`, `prisma/schema/tezgah.prisma`, `prisma/migrations/*tezgah*`, `tests/tezgah`
**Yöntem:** Hiçbir kaynak dosya değiştirilmedi. Her bulgu `dosya:satır` ile kanıtlandı. Sayı ve fiyat koddan okundu, belgeden kopyalanmadı.
**Tarih:** 23 Kasım 2026

---

## 0. Yürütülen Doğrulama Kapıları (kanıt)

| Komut | Sonuç | Kanıt / not |
|---|---|---|
| `npx tsc --noEmit` | **OK** (0 hata) | çıkış kodu 0 |
| `npm run verify:sen-axis` | **OK** | "686 dosya, 46 siz kaçağı tarandı" |
| `npm run verify:boundaries` | **OK** | "kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine…" |
| `npm run verify:api-auth -- --check` | **OK** | "164 route. {session:101, public:27, closed:11, cron:2, admin:15, webhook:8}" |
| `npm run verify:rls-status` | **OK** | 90+ tablo FORCE RLS sicilinde; `tezgah_outputs`, `tezgah_daily_quotas`, `tezgah_credit_balances`, `tezgah_subscriptions`, `tetkik_reports`, `tetkik_domain_claims` listede |
| `npm run verify:no-secrets` | **OK** | "PEM / service_role JWT / yasaklı .env.example ataması / git .env yok" |
| `npx vitest run tests/tezgah` | **OK** | **22 dosya / 130 test geçti**, 9.89s |

**Yorum:** Tüm kapılar yeşil. Bu, mimarinin "kabuk" tarafının sağlam olduğunu doğrular; aşağıdaki bulgular **kapıların ölçmediği davranış** katmanındadır (kota iadesi, arşiv, kredi hattı, teslim formatı). Yeşil test yanılsaması bu raporda ayrıca bir bulgu olarak işaretlendi.

---

## 1. Yönetici Özeti, Genel Puan Kartı ve 8 Masa Karşılaştırması

### 1.1 Tek cümlelik teşhis

> AI Tezgâh, Türkiye'de eşi olmayan **dürüst mühür mimarisine** (deterministik skor + kod kalkanı + kota defteri + SSRF pinleme) sahip olgun bir iskelet; ama **satın alma sonrası kredi hattı kırık**, **"Son Üretimlerim" arşivi fiilen bir vitrin etiketi**, ve 8 masadan yalnız **4'ü yapısal teslimat dosyası** (HTML/CSV/SVG/ZIP) üretiyor — 3'ü yalnız Markdown, 1'i yalnız `window.print()`. Yani ürün "profesyonel iş istasyonu" değil, "çok iyi mühendislikle korunmuş bir metin atölyesi".

### 1.2 Genel puan kartı — **61 / 100**

| Eksen | Ağırlık | Puan | Ağırlıklı | Gerekçe (kanıt) |
|---|---|---|---|---|
| Mimari hazırlık | %25 | **17 / 25** | 17.0 | SSRF pinleme, kota defteri, RLS mührü, sınır kapıları örnek düzeyde. Ama idempotency ücretsiz/Pro hatta çalışmıyor (`lib/tezgah/quota.ts:169-197`), Pro iadesi no-op (`:841-850`), arşiv okuma ucu yok (`app/api/tezgah/outputs/route.ts:30-42`). |
| Mevcut işlevsellik | %30 | **18 / 30** | 18.0 | 8 masadan **4'ü yapısal teslimat** üretiyor: `dukkan` HTML, `pazaryeri` CSV, `technical-drawing` SVG, `saas-builder` ZIP. `proposal`/`reklam`/`studio-photo` yalnız Markdown (`studio-photo` hiç dosya üretmiyor, `lib/tezgah/pro/studio-photo.ts:1-3`); `tetkik` yalnız `window.print()`. Arşiv yeniden açılamıyor. |
| Ticari farklılaşma | %25 | **14 / 25** | 14.0 | `tetkik` + `dukkan` + `technical-drawing` gerçekten farklılaştırıcı (deterministik ölçüm, mühür, XSS-sız HTML, ölçülü SVG). Ama `reklam` bütçe/ROAS/A-B iskeleti yok, `pazaryeri` 8 ürün tavanlı (`lib/tezgah/pazaryeri/copy.ts:9`), hiçbir masada PNG/JPG/DXF/PDF teslimatı yok. |
| UX / Vitrin | %20 | **12 / 20** | 12.0 | Sekme şeridi, tembel yüzeyler, yazdırma, dürüst uyarı metinleri güçlü. Ama üye kotası "gece yarısı yenilenir" diyor (`components/tezgah/upgrade-card.tsx:101,138`) — aylık havuzla çelişiyor; arşiv tıklanabilir değil. |
| **TOPLAM** | **100** | — | **61 / 100** | |

### 1.3 8 masa karşılaştırma tablosu

| # | Masa | Motor | Teslimat | Çapraz köprü | Puan |
|---|---|---|---|---|---|
| 1 | `proposal` Müşteri Teklif Yazıcı | LLM (`textEasy`, 900 token) | `.md` / `.txt` | Yalnız CV mührü bağlantısı | **58** |
| 2 | `tetkik` Web Site Analizi | **Gerçek fetch + 13 sinyallik deterministik skor** + LLM anlatım | Ekran + `window.print()` | → `dukkan`, → `saas-builder`, kamu `/tetkik/[hash]` | **78** |
| 3 | `dukkan` Dijital Dükkan | **Kod şablonu (LLM yok)** | `dijital-dukkan.html` | Yok | **72** |
| 4 | `reklam` Reklam Paketi | LLM + **kod mührü** (30/90 karakter, para/metrik kalkanı) | `.md` / `.txt` | Yok | **60** |
| 5 | `pazaryeri` Katalog Fabrikası | LLM + **kod CSV** (formül enjeksiyonu kalkanı) | `pazaryeri-katalog.csv` | **→ `commerce_products` (Master SKU)** | **66** |
| 6 | `studio-photo` Görsel Stüdyo | **Hiç motor yok** — saf kural tablosu | `.md` (yalnız prompt metni) | Yok | **38** |
| 7 | `technical-drawing` Teknik Çizim | **Kod SVG üreteci** | `olcu-semasi.svg` | Yok | **62** |
| 8 | `saas-builder` Mini SaaS | **Kod üreteci (4 sabit widget)** | `mini-saas.zip` (5 dosya) | Yok | **68** |

---

## 2. 8 Alt Masanın Ayrıntılı Teknik İncelemesi

> Her masa için: **(a)** gerçek motor, **(b)** çıktı formatı ve indirme, **(c)** halüsinasyon/güvenlik riski, **(d)** çapraz modül köprüsü, **(e)** puan.

---

### 2.1 `proposal` — Müşteri Teklif Yazıcı

**(a) Gerçek motor.** Saf LLM. `lib/tezgah/engine.ts:102-126` → `invokeLlm({ role: "LITE_STREAM", model: resolveProductModel("textEasy"), temperature: 0.4, maxOutputTokens: 900, maxAttempts: 1, timeoutMs: 25_000 })`. Prompt `lib/tezgah/prompts.ts:64-72` dört başlık dayatır (`## Teklif`, `## Kapsam`, `## Teslimat adımları`). Çıktı `clipMarkdown` ile 6.000 karakterde kesilir (`engine.ts:25,53-59`) ve `withTezgahDeliverySignature` ile imzalanır (`engine.ts:153-154`).

**(b) Çıktı / indirme.** Sadece markdown. UI'da `components/tezgah/workbench.tsx:1463-1480` iki düğme: `${fileStem}.md` ve `${fileStem}.txt`. **DOCX ve PDF yok** — oysa aynı repoda `buildDocxDocument` ve `buildPlainPdf` hazır duruyor ve yalnız hibe masasında kullanılıyor (`components/tezgah/grant-project-report.tsx:295-299`). Yani "teklif" müşteriye gönderilebilir bir dosya üretmiyor.

**(c) Halüsinasyon / güvenlik.** XSS riski **yok**: `Deliverable` satır satır React metni basar, `dangerouslySetInnerHTML` yok (`workbench.tsx:532-563`). **Ama halüsinasyon kalkanı yok**: `reklam` ve `pazaryeri` masalarında para/metrik süzgeci kodda (`lib/tezgah/reklam/guard.ts:12-13`, `lib/tezgah/pazaryeri/engine.ts:45-64`) iken `proposal` yolunda **tek bir süzgeç çalışmıyor** — model "50.000 TL", "2 hafta", "3 revizyon" yazarsa doğrudan müşteriye gider. Prompt'ta "Ücret ve süre uydurma" yalnız rica (`prompts.ts:70`); kodla mühürlenmemiş. **Bu, modülün en yüksek ticari riskidir: yanlış fiyat taşıyan teklif.**

**(d) Dönüşüm köprüsü.** Yok. `cta` kendine dönüyor (`catalog.ts:270-273`, `href: "/tezgah"`). Tek köprü `tezgahSealPath` → `/career#yetkincv` (`catalog.ts:848-862`). Teklif → YetkinCV portföy kanıtı, teklif → hibe dosyası, teklif → e-ticaret ürünü köprüsü **yok**.

**(e) Puan: 58 / 100.** İyi metin, dürüst imza, XSS-sız render; ama dosya teslimatı yok, para kalkanı yok, kredi hattında **tamamen kırık** (bkz. K1).

---

### 2.2 `tetkik` — Web Site Analizi

**(a) Gerçek motor.** **Bu masa modülün en olgun parçası ve sorudaki "sadece URL tahmini mi?" sorusunun cevabı net biçimde hayır.**
- Gerçek HTTP: `lib/tezgah/tetkik/fetch-html.ts:99-192` — `https` zorunlu, `redirect: "manual"`, en çok 3 sıçrama (`rubric.ts:8`), 1,5 MB gövde tavanı (`:10`), 8 sn zaman aşımı (`:7`), HTML dışı içerik reddi (`:190-192`).
- **SSRF sertleştirmesi gerçek:** `lib/tezgah/tetkik/guard.ts:6-38` IPv4/IPv6 özel ağ blok listesi (metadata host'ları dahil `:120-121`), `:189-203` DNS TOCTOU kapatma notu ve fail-closed sözü, `lib/tezgah/tetkik/fetch-html.ts:126-147` **doğrulanan IP'yi `dispatcher`'a sabitleme** (DNS rebinding kapanır), `guard.ts:222-227` `pinnableTetkikAddresses` fail-closed.
- Gerçek ölçüm: `lib/tezgah/tetkik/parse-html.ts:118-193` title/meta/h1 sırası/viewport/lang/wa.me/tel/mailto/form/CTA/img alt; `score.ts:123-150` 13 madde **deterministik** puanlanır (100 üzerinden); TTFB ve HTML boyutu gerçek ölçümden gelir (`engine.ts:206-210`).
- LLM yalnız **anlatım** yazar: `engine.ts:218-254`, `responseJson: true`, `TETKIK_MAX_OUTPUT_TOKENS = 2_400` (`:29`).

**(b) Çıktı / indirme.** Kart + kopyala + `window.print()` (`components/tezgah/tetkik-report.tsx:320-325`). **Sunucu tarafı PDF/DOCX yok.** Ayrıca kamuya açık paylaşım: `app/api/tezgah/tetkik/publish/route.ts` → `tetkik_reports` tablosu → `/tetkik/[hash]` (`app/(public)/tetkik/[hash]/page.tsx`).

**(c) Risk.** İki gerçek risk:
1. **Uydurma "mevcut metin".** `lib/tezgah/tetkik/prompts.ts:15` açıkça **"Sana site HTML'i verilmez"** diyor; modele yalnız 13 maddelik skor + etiketler gidiyor (`prompts.ts:42-76`). Buna rağmen şema `copyRewrites[].current` ("mevcut zayıf metin") istiyor (`analysis.ts:17-22`) ve UI bunu "**Mevcut durum**" başlığıyla basıyor (`tetkik-report.tsx:177`). Model sayfanın H1'ini hiç görmediği için bu alan **kaçınılmaz olarak uydurma**; kalkan (`narrative.ts:10-24`) yalnız para/trafik/skor çelişkisini yakalar, "bu sizin başlığınız" iddiasını yakalayamaz.
2. `tetkik_reports` **anonim, sahipliksiz ve süresiz** büyür (`public-report.ts:130-166`); IP başına 8/10 dk (`lib/kernel/security/http-rate-limit.ts:42`) ile üçüncü taraf siteler ücretsiz taranabilir. `robots.txt`/`sitemap.xml` kontrolü yok — "SEO taraması" adı 13 sinyalin ötesine geçmiyor (`rubric.ts:23-36`).

**(d) Köprü.** **En iyi köprü burada:** eksik → `dukkan` yeniden kurulum (`workbench.tsx:1360-1374`), eksik → `saas-builder` kod paketi (`:1381-1393`), kamu paylaşım sayfasından `/tezgah` ve `/uzmanlar` CTA'sı. Hibe köprüsü yok.

**(e) Puan: 78 / 100.** Gerçek ölçüm + gerçek SSRF + gerçek köprü. Eksiği: uydurma "mevcut metin", PDF yok, robots/sitemap yok, anonim depo sınırsız.

---

### 2.3 `dukkan` — Sektörel Dijital Dükkan

**(a) Gerçek motor.** **LLM yok — deterministik HTML şablonu.** `lib/tezgah/dukkan/engine.ts:38-42` açıkça "Şablon basımı. AI maliyeti yoktur; ortak kota düşmez." 6 sektör × 5 ton matrisi koddan gelir (`lib/tezgah/dukkan/copy.ts:16-136`), tüm cümleler sektör sözlüğünden (`copy.ts:21-27` vb.), kullanıcıdan yalnız işletme adı / yer / WhatsApp / 3-5 hizmet / ton alınır (`dukkan/schema.ts:22-38`).

**(b) Çıktı / indirme.** **Gerçekten yayınlanabilir tek dosyalık HTML.** `renderDukkanHtml` tam `<style>` + WhatsApp/tel/CTA + form üretir (`dukkan/render.ts:62-143`); 500 KB altı, `<script>`/`javascript:`/`on*=` içermez (`render.ts:36-48`); kendi kendini tetkik rubriğiyle 100 puan doğrular. İndirme `dijital-dukkan.html` (`components/tezgah/dukkan-preview.tsx:34`). Önizleme iframe sandbox'ı **`allow-scripts` içermez** (`:7,30`).

**(c) Risk.** XSS tarafı örnek düzeyde: `escapeHtml` + `javascript:` ve `on*=` nötralizasyonu (`dukkan/escape.ts:5-16`), `fitPlainWindow` başlık/açıklamayı düz metne kilitler (`render.ts:15-28`), renkler hex mühründe (`:8,50-55`), WhatsApp `^905\d{9}$` (`:63-65`). Tek zayıflık: **öz-skor 100 iddiası** kendi rubriğinde sahte `ttfbMs: 1` ve `https: true` ile hesaplanıyor (`render.ts:44`) — canlı sitede 100 olmayabilir; pazarlama dili olarak riskli (`score: 100` sabiti `engine.ts:18,108`).

**(d) Köprü.** Yok (`catalog.ts:441` `cta: null`). Dükkan → kendi domaininde yayınlama, dükkan → e-ticaret ürün havuzu, dükkan → reklam paketi otomatik zinciri **yok**; kullanıcı elle sekmeye geçer. `tetkik`ten gelen handoff yalnız işletme adını doldurur (`workbench.tsx:1358-1374`).

**(e) Puan: 72 / 100.** Gerçek dosya, XSS-sız, ücretsiz. Eksiği: statik 6 sektör, ürün/fiyat yok, yayınlama/hosting yok, köprüsüz, "100/100" şişirmesi.

---

### 2.4 `reklam` — Otonom Reklam Paketi

**(a) Gerçek motor.** LLM + **kod mührü**. `lib/tezgah/reklam/engine.ts:107-131` `textEasy`, 900 token, temp 0.4. Mühür `reklam/guard.ts:135-196`: Google başlığı ≤30, açıklaması ≤90 (`copy.ts:11-12`), tam 3 kanca, ≥3 anahtar kelime, görsel brifin üç satırı (Kadraj / Görsel üstü yazı / Gösterilmeyecek). Eksik parça varsa `null` → **kota iade** (`engine.ts:133-138`).

**(b) Çıktı / indirme.** Markdown (`.md` / `.txt`). **Meta Ads Manager / Google Ads Editor formatı (CSV/JSON) yok**; kullanıcı elle panele yapıştırır.

**(c) Risk — bu masada kalkan gerçek.** `guard.ts:12-13` `METRIC` regex'i gösterim/tıklama/erişim/CPC/CPM/CTR/ROAS yasağı; `:24-42` `moneyTokens` + `inventsMoney` yalnız kullanıcının verdiği teklifteki parayı geçirir; `:44-53` `foreignCta` yabancı amaç çağrısını atar; `copy.ts:26-27` "erişim, tıklama ve satış sayısı vaadi yoktur" feragatı **kodla** eklenir. Yani ROAS/bütçe halüsinasyonu **engellenmiş**, sorudaki şüphe bu masada karşılanmıyor. Eksik: **bütçe önerisi, ROAS hesabı, hedef kitle büyüklüğü, A/B matrisi (3 kanca dışında varyant yok), Meta/Google reklam formatları (responsive search ad, PMax asset group) yok** — bunlar zaten bilinçli olarak LLM'e yazdırılmıyor, dolayısıyla ürün de sunmuyor.

**(d) Köprü.** Yok (`cta: null`, `catalog.ts:482`). Reklam → dükkan vitrini, reklam → pazaryeri kampanyası, reklam → hibe pazarlama bölümü köprüsü yok. `tetkik` "4. Aşama — Reklam Paketi" diyor (`tetkik/score.ts:108-116`) ama handoff **kodda yok**; kullanıcı elle sekme değiştirir.

**(e) Puan: 60 / 100.** Dürüstlük ve mühür mükemmel; ticari derinlik (bütçe/ROAS/A-B/format dışa aktarım) sıfır.

---

### 2.5 `pazaryeri` — Pazaryeri Katalog Fabrikası

**(a) Gerçek motor.** LLM yalnız **başlık + satış metni** yazar; CSV, sütunlar, tavan ve boş fiyat **kodda**. `lib/tezgah/pazaryeri/engine.ts:186-219` (LLM), `:82-118` `sealRows` (sıra numarası eşleşmezse `null`), `:71-80` `keptBullet` (barkod/stok/8+ haneli sayı ve uydurma para atılır), `pazaryeri/csv.ts:40-48` `csvCell` (`=`, `+`, `-`, `@`, `\t` → başında `'`) ve UTF-8 BOM (`:103`). Başlık tavanı pazaryerine göre: Trendyol 100 / Hepsiburada 150 / Amazon 200 (`copy.ts:13-17`).

**(b) Çıktı / indirme.** Tablo önizleme + `pazaryeri-katalog.csv` (`pazaryeri-preview.tsx:70`). Barkod/Fiyat/Stok sütunları **bilinçli boş** (`csv.ts:96-98`).

**(c) Risk.** CSV formül enjeksiyonu kapatılmış (`csv.ts:11,43-45`); uydurma fiyat `inventsMoney` ile atılır (`engine.ts:56-64`); stok/barkod `keptBullet` ile atılır. Kalan riskler: (i) `Kategori` kullanıcıdan serbest metin, pazaryeri taksonomisine **eşlenmiyor** (`parse.ts:82-88`) → yüklemede reddedilir; (ii) 8 ürün tavanı (`copy.ts:9`) "fabrika" adıyla çelişir; (iii) görsel URL'si, varyant, desi/ağırlık zorunlu alanları yok → pazaryeri şablonuna **doğrudan yüklenebilir dosya değil**, yarı mamul.

**(d) Köprü — var ve gerçek.** `MasterSkuTransfer` (`components/tezgah/master-sku-transfer.tsx:134-150`) → `POST /api/commerce/stores/[storeId]/imports/pazaryeri` (`app/api/commerce/stores/[storeId]/imports/pazaryeri/route.ts:10`) → `importPazaryeriCatalog` (`lib/commerce/service.ts:967-979`, `source: "TEZGAH_PAZARYERI"`, `maxRows: 8`). Dönüşüm `catalogTableToDraftImport` (`lib/commerce/pazaryeri-bridge.ts:15-90`) ile **taslak** olarak yazılır: `sku: null, barcode: null, amountMinor: null, onHandQty: 0` (`:83-88`). Yani köprü **çalışıyor ama "taslak" seviyesinde** — fiyat/stok girilmeden satışa çıkmaz.

**(e) Puan: 66 / 100.** Modülün en iyi çapraz köprüsü; eksiği taksonomi eşleme, 8 ürün, görsel/fiyat/stok alanları.

---

### 2.6 `studio-photo` — Görsel & Ürün Stüdyosu

**(a) Gerçek motor.** **Hiç yok.** Dosyanın ilk satırı bunu itiraf ediyor: *"Görsel stüdyo. Fotoğraf dosyası işlemez."* (`lib/tezgah/pro/studio-photo.ts:2`). Yapılan iş: pazaryeri kural tablosu (Trendyol beyaz fon / 2:3 / 1200×1800 / yazısız; Amazon saf beyaz / 1:1 / 1600 px zoom) (`:92-158`), galeri sırası (`:159-170`), alt metin (`:168-171`) ve **İngilizce bile değil, Türkçe düz bir düzenleme talimatı cümlesi** (`:172-186`). Çıktı `markdown` (`:188-205`).

**(b) Çıktı / indirme.** `.md` — başka hiçbir şey. `build.ts:66-80` açıkça `svg: null, html: null, react: null, zip: null` (`:75-79`). **PNG/JPG/WEBP üretilmiyor, yüklenen fotoğraf işlenmiyor, arka plan silinmiyor, ölçeklenmiyor.**

**(c) Risk.** Güvenlik riski yok (dosya yok). Asıl risk **pazarlama**: "Görsel & Ürün Stüdyosu" adı, "Beyaz fon", "Zoom eşiği" gibi kural kartları bir görsel üretimi izlenimi veriyor; kullanıcı çıktı olarak bir düzyazı paragrafı alıyor. Halüsinasyon riski de var: kural tablosu **kullanıcının beyan ettiği** piksel ölçüsünü "ölçülen kare" diye sunuyor (`:105-106` "Ölçülen kare 640×900") — oysa hiçbir dosya ölçülmedi.

**(d) Köprü.** Yok. Pazaryeri kataloğuna görsel bağlama, e-ticaret ürününe varyant görseli, `technical-drawing` ile ortak ölçü köprüsü yok.

**(e) Puan: 38 / 100.** Dürüst ama boş. Repo'da **`generateImage` gümrük kapısı hazır ve tamamen kullanılmıyor**: tanım `lib/kernel/ai/llm-gateway.ts:402-412`, sağlayıcı `lib/kernel/ai/providers/gemini.ts:187`; çağrı sayısı **sıfır** (tüm repoda yalnız bu iki tanım). Yani "gerçek görsel API'si bağlı mı?" → **Hayır; bağlanabilir ama bağlı değil.** Bu, modülün en büyük tek fırsatı.

---

### 2.7 `technical-drawing` — Teknik Çizim & Ölçü Şeması

**(a) Gerçek motor.** **Kod SVG üreteci** (LLM yok). `lib/tezgah/pro/technical-drawing.ts:32-90`: mm girdisinden ölçek (`:49`), gövde `rect` (`:71`), **genişlik ölçü çizgisi + oku + "120 mm" etiketi** (`:71-76`), **yükseklik ölçü çizgisi + oku + etiket** (`:77-79`), malzeme satırı (`:55`), 6 adede kadar montaj adımı (`:24-30`, `:56-63`).

**(b) Çıktı / indirme.** `olcu-semasi.svg` (`:7`). Önizleme `sandbox=""` iframe (`components/tezgah/pro-studio-preview.tsx:98-104`) — en sıkı sandbox. İndirme `.svg` (`:138-142`).

**(c) Risk.** XSS yok: tüm kullanıcı metni `escapeHtml` (`pro/text.ts:3-11`), test bunu kilitliyor (`tests/tezgah/pro-studio.test.ts:62-77` "Raf <script>" → `&lt;script&gt;`). **Ama çizim eksik:** derinlik (`depthMm`) çizilmiyor, yalnız **metin olarak** yazılıyor (`:70` "Derinlik 40 mm"). Tek görünüş var (önden); **yan görünüş, üst görünüş, kesit, ölçek cetveli, tolerans, parça listesi, delik/bağlantı geometrisi yok.** DXF/PDF/DWG yok. Yani "gerçek ölçülendirilmiş vektörel çizim" → **kısmen evet (SVG), üretim dosyası olarak hayır.**

**(d) Köprü.** Yok. Marangoz/mobilya üreticisi için pazaryeri (ölçü alanı) veya e-ticaret (desi hesabı) köprüsü yok; `saas-builder`'ın kargo desi hesabıyla bile bağlanmamış.

**(e) Puan: 62 / 100.** Gerçek vektör, güvenli, indirilebilir; ama 3. boyut çizilmiyor, çok görünüşlü teknik resim standardı yok.

---

### 2.8 `saas-builder` — Mini SaaS & Kod Üretici

**(a) Gerçek motor.** **Kod üreteci, LLM yok.** 4 sabit widget: `cargo` (desi/beden hesabı), `order` (sipariş notu formu), `counter` (geri sayım), `api` (JSON okuyucu) — `lib/tezgah/pro/options.ts:28-33`, kaynaklar `pro/saas-builder.ts:145-383`. Her widget için **üç taşıma biçimi**: çalışan `index.html`, `widget.js`, `App.jsx` (React) (`:420-429`). ZIP gerçek: sıkıştırmasız store ZIP, CRC32 doğrulamalı, deterministik tarih (`lib/tezgah/pro/zip.ts:49-110`), testte geri okunuyor (`pro-studio.test.ts:96-107`).

**(b) Çıktı / indirme.** `mini-saas.zip` (5 dosya: index.html, widget.js, App.jsx, KURULUM_REHBERI.md, README.txt) + canlı önizleme. Önizleme `sandbox="allow-scripts"` (same-origin yok) → güvenli (`pro-studio-preview.tsx:114-120`).

**(c) Risk.** Üretilen `<script>` bizim şablonumuz; kullanıcı metni `escapeHtml` ile kaçıyor (`saas-builder.ts:155-156, 258-259, 316, 360-361`); React tarafı `JSON.stringify` (`:227, 284, 380`) — script breakout yok. `readApiUrl` yalnız `https:`, credential'sız, ≤300 karakter (`:140-152`); `http://` reddediliyor (test: `pro-studio.test.ts:137`). SSRF **yok** (fetch kullanıcının tarayıcısında çalışır, sunucumuzda değil). **Bozuk kod riski var ama başka yerde:** `feature` (kullanıcının serbestçe yazdığı "İstediğin özellik") **üretilen kodu hiç etkilemiyor** — yalnız kurulum rehberine basılıyor (`saas-builder.ts:77`, `:418`). Kullanıcı "stok takip paneli" yazıp `cargo` seçerse **desi hesabı** alır. Bu, ürünün "istediğini üretir" vaadinin koddaki karşılığının olmamasıdır.

**(d) Köprü.** Yok. Üretilen bileşen kullanıcının sitesine gider; yetkin.ai içinde hiçbir modüle (E-Ticaret vitrinine, dükkan sayfasına) enjekte edilmez. `tetkik`ten gelen handoff yalnız başlık/detail doldurur (`workbench.tsx:1381-1393`).

**(e) Puan: 68 / 100.** Gerçek çalışan kod + gerçek ZIP + dürüst kurulum rehberi. Eksiği: 4 sabit şablon, serbest metnin kodu yönlendirmemesi, backend/persistence yok, sandbox'ta **çalışan** izole önizleme yalnız HTML için (React için "kopyala" var, çalıştırma yok).

---

## 3. Ortak Altyapı, Kredi/Ödeme Hunisi ve Güvenlik Bulguları

### 3.0 Doğru olanlar (kanıtla)

| Konu | Kanıt | Durum |
|---|---|---|
| `tezgah_outputs` şeması | `prisma/schema/tezgah.prisma:7-19`; migration DDL `prisma/migrations/20261117230000_tezgah_outputs/migration.sql:6-20` | Doğru: `user_id` FK + CASCADE, `(user_id, created_at)` indeksi, para kolonu yok |
| `FORCE ROW LEVEL SECURITY` | aynı migration `:25-26`; `lib/kernel/security/rls-policy-registry.ts:108-111` | Açık |
| Sahip politikaları | migration `:47-83` — SELECT/INSERT/UPDATE/DELETE `user_id::text = yetkin_auth_user_id()` | 4 politika, doğru |
| Kapsamsız deny | migration `:87-96` — `anon` için `USING (false)` | Fail-closed |
| Kota tabloları | `20261118143000_faz3_tezgah_scale/migration.sql:70-93` — FORCE RLS + `rls_deny_unscoped` | PostgREST'e kapalı, Prisma BYPASSRLS yazar — bilinçli |
| Tetkik depo | `20261118013000_tetkik_reports/migration.sql:17-23`; `20261120140000_tezgah_quota_pools/migration.sql:25-32` | Deny-all, doğru |
| Aylık kredi havuzu sabitleri | `lib/tezgah/catalog.ts:48` (ücretsiz **30**), `:60` (Pro **500**), `:40` (misafir günlük **3**), `:72` (tetkik ömür boyu **1**), `:114` (kredi paketi **10**) | Sorudaki "30/30" yalnız ücretsiz hat için doğru; Pro 500 |
| Aylık devir | `catalog.ts:66-69` + `quota.ts:328-341` + `quota.ts:441` | Deterministik, cron'a bağımlı değil, zincirlemez |
| LLM boş yanıt iadesi | `engine.ts:129-139`, `tetkik/engine.ts:185-194`, `reklam/engine.ts:96-105`, `pazaryeri/engine.ts:181-191`, `grant/engine.ts:258-268` | Ücretsiz hatta **çalışıyor** |
| Rate-limit | `lib/kernel/security/http-rate-limit.ts:42` (tetkik 8/10dk), `:51` (tezgah 30/10dk), engine içi 8/60sn (`engine.ts:113-118`) | İki katman, doğru |
| PayTR huni | `lib/tezgah/checkout.ts:105-232` + `paid-lane.ts:380-531` + `register-paytr-license-hook.ts:13-46` | Uçtan uca: sipariş → katalog fiyatı → iframe → `CLEARED` → Pro uzatma / 10 kredi |
| Misafir ödeme + hesap sahiplenme | `app/api/tezgah/guest-checkout/route.ts:20-70` sınırları, `lib/tezgah/guest-checkout.ts`, `lib/tezgah/guest-claim-bind.ts` | Var ve testli (`tests/tezgah/faz3-gelir.test.ts` 29 test) |
| Tutar isteğe kapalı | `checkout.ts:68-79,117-121` — `amountFor(kind)` katalogdan | Fiyat manipülasyonu yok |

---

### 3.1 `[KRİTİK]` K1 — Kredi paketi satın alan kullanıcı **Müşteri Teklif Yazıcı**'yı kullanamıyor

**Kanıt:**
- Genel hat istemcide **Idempotency-Key göndermiyor**: `components/tezgah/workbench.tsx:990-994`
  ```ts
  const response = await fetch("/api/tezgah/generate", withRailApiVersion({
    method: "POST",
    headers: { "content-type": "application/json" },   // ← yalnız content-type
    body: JSON.stringify(payload),
  }));
  ```
  Oysa diğer altı masa `productionHeaders()` kullanıyor (`:643-649`, çağrılar `:805, 830, 866, 901, 933, 961`).
- Sunucu, kredi hattında anahtar yoksa **400** döner: `lib/tezgah/quota.ts:786-799` → `"Ücretli üretim Idempotency-Key ister."` (Pro hattı için `:662-674`).
- Kredi hattına giriş: ücretsiz 30 kredi bittiğinde `readTezgahCreditRemaining` > 0 ise (`quota.ts:755-772`).

**Sonuç:** Bir kullanıcı 10 kredi paketi satın alır → 30 ücretsiz kredisi biter → **teklif üretmeye bastığında 400** alır ve ürün ona hiç üretim vermez. Ödeme hunisinin tam dönüşüm anında kırılan tek nokta. Aynı hata `ecommerce` yolunda da var (`schema.ts:9-14`).

**Tedavi:** `workbench.tsx:993` → `headers: productionHeaders()`; ayrıca sunucuda `commandKey` yoksa ücretsiz hat davranışını koruyup kredi hattı için tek kullanımlık anahtar üretme yerine **400 yerine ücretsiz hata döndür**.

---

### 3.2 `[KRİTİK]` K2 — "Son Üretimlerim" arşivi açılamıyor, kopyalanamıyor, indirilemiyor

**Kanıt:**
- Liste ucu yalnız **meta** döner: `app/api/tezgah/outputs/route.ts:30-42` → `select: { id, toolKey, title, createdAt }` (`:34`). **`outputContent` hiçbir okuma ucundan dönmüyor** (repoda `/api/tezgah/outputs/[id]` rotası yok — `app/api/tezgah` ağacı yalnız `outputs/route.ts`).
- Drawer yalnız başlık + tarih + "Kamu Portföyüme Ekle" basar: `components/tezgah/output-portfolio.tsx:95-119`. Yeniden aç / kopyala / indir düğmesi yok.
- Arşiv yalnız **ilk 12** satır (`route.ts:33`), sayfalama yok.

**Sonuç:** Pazarlama dilinde "Son Üretimlerim arşivi" var; üründe **bir daha erişilemeyen** satırlar var. Kullanıcı bir teklifi kaybederse yeniden üretmek zorunda ve **kredi öder**.

**Tedavi:** `GET /api/tezgah/outputs/[id]` (sahiplik kontrolü `userId`), drawer'da "Aç / Kopyala / İndir" (toolKey'e göre doğru MIME), sayfalama.

---

### 3.3 `[KRİTİK]` K3 — Pro hattı LLM boş yanıtında **kredi kaybediyor**; hata mesajı tersini söylüyor

**Kanıt:**
- Pro hattı sayacı **önce artırıyor**: `lib/tezgah/quota.ts:600-612` `activeStore().tryConsume(...)`; dönen snapshot `lane: "pro"` (`:629-640`).
- İade fonksiyonu Pro/kredi hattında **derhal peek'e düşüyor**: `quota.ts:841-850`
  ```ts
  if (poolKey === "free_template" || lane !== "free") {
    return peekTezgahQuota(actorId, guest, now, poolKey);  // sayaç DEĞİŞMEZ
  }
  ```
  Yani `tryConsume` ile artırılan Pro sayacı **geri alınmıyor**.
- Kullanıcıya yine de şu mesaj basılıyor: `catalog.ts:116-117` `"Üretim tamamlanamadı. Hakkınız duruyor; biraz sonra yeniden deneyin."`

**Sonuç:** Aylık 500 kredi ödeyen Pro kullanıcı, sağlayıcı hatasında kredisini kaybeder ve ekran ona "hakkınız duruyor" der. Dürüstlük mührü burada deliniyor. `quota.ts:840` yorumu ("Pro ve kredi hattında sayaç değişmez") **kendi kodunun tersini** anlatıyor.

**Tedavi:** Pro hattı için de `decrement` yapan bir `refund` dalı; kredi hattında `hold`'u serbest bırakan `release` yolu (bkz. Y7).

---

### 3.4 `[YÜKSEK]` Y1 — `Idempotency-Key` ücretsiz/Pro hatta çift düşümü engellemiyor

**Kanıt:** `consumeTezgahQuota` komut anahtarını **yalnızca kredi hattında** kullanıyor (`quota.ts:678-713`, `:802-837`). Ücretsiz hat `activeStore().tryConsume(...)` çağrısı komutu hiç okumaz (`quota.ts:720-739`), Pro hat da aynı (`:612`). `memoryStore.tryConsume`/`prismaStore.tryConsume` imzalarında `command` yok (`:126-132`, `:170-197`).

**Sonuç:** Aynı `Idempotency-Key` ile iki kez gelen istek **iki kredi** düşer. Tek koruma istemci `pending` state'i (`workbench.tsx:772`), yani ağ yeniden denemesi / ikinci sekme / curl çift tıklama korumasız. buna karşılık `paid_command_reservations` tablosu ve `classifyExistingPaidCommand` (`lib/kernel/ai/paid-command.ts:182-196`) repoda **hazır** — ücretsiz hatta bağlanmamış.

### 3.5 `[YÜKSEK]` Y2 — İstemci her denemede yeni UUID üretiyor

**Kanıt:** `workbench.tsx:643-649`:
```ts
function productionHeaders(): HeadersInit {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (signedIn) { headers["Idempotency-Key"] = crypto.randomUUID(); }
```
Her çağrıda **yeni** anahtar. Yani "aynı niyetin tekrarı" asla aynı anahtarla gitmiyor; sunucudaki `requestHash` çakışma koruması (`paid-lane.ts:258-262`) pratikte hiç tetiklenmiyor. `useIdempotencyKey` hook'u repoda var (`output-portfolio.tsx:31`) ama üretim çağrılarında kullanılmıyor.

### 3.6 `[YÜKSEK]` Y3 — Pro Studio arşive **teslimatı değil özeti** yazıyor

**Kanıt:** `workbench.tsx:810-812`
```ts
outputContent: (built.pack.markdown || built.pack.body || built.pack.summary).slice(0, 20_000),
```
- `technical-drawing`: `build.ts:105-112` → `markdown: pack.summary` (`:108`), `body: pack.svg` (`:107`). `markdown` dolu olduğu için **SVG değil tek satırlık özet** arşive yazılır.
- `saas-builder`: `build.ts:147` → `markdown: pack.summary`. **HTML/JSX/ZIP yazılmaz.**
- `studio-photo`: `.md` yazılır (`build.ts:72-75`) — doğru olan tek masa.

**Sonuç:** İki masanın teslimatı arşivde kaybolur; K2 ile birleşince geri dönüşü yoktur.

### 3.7 `[YÜKSEK]` Y4 — `grant` ve `ecommerce` masaları workbench'te **ölü kod**

**Kanıt:**
- Sekme şeridi yalnız 8 masayı basar: `catalog.ts:162-172` `TEZGAH_DESK_TOOL_IDS` ve `workbench.tsx:1167`.
- `?tool=grant` ve `?tool=ecommerce` sayfa düzeyinde yönlendirilir: `lib/tezgah/catalog.ts:708-718` + `app/tezgah/page.tsx:15-18` (`redirect`).
- `resolveTezgahDeskTool` desk olmayanı varsayılana düşürür: `catalog.ts:722-728`.
- Buna rağmen workbench içinde `const grant = active.id === "grant"` (`:758`) ve `active.id === "ecommerce" && signedIn` (`:1482`) dalları, `GrantDetailWizard`, `GrantProjectReportView`, `EcommerceDraftTransfer` **hiç çalışmaz** (~600 satır).

**Sonuç:** Bakım yükü + yanlış güvenlik hissi. Ayrıca `/api/tezgah/grant/generate` **canlı ve public** (`route-map:150`) ama `/tezgah`'tan erişilemez — UI'sız LLM maliyet yüzeyi (bkz. O9).

### 3.8 `[YÜKSEK]` Y5 — Üye kota yenileme metni **yanlış**

**Kanıt:** `components/tezgah/upgrade-card.tsx:101` başlık `"Günlük hak"`; `:138` paragraf `"Ücretsiz hakkın İstanbul gece yarısında yenilenir."`
Gerçek: üye `lite` havuzu **aylık** (`catalog.ts:89-91` `"Yeni krediler ayın 1'inde…"`, `quota.ts:244-247` `tezgahMonthKey`).
**Sonuç:** Kullanıcı gece yarısı 30 kredi bekler; ayın 1'ine kadar bekler. Ürünün en hassas dürüstlük iddiasında somut yanlış bilgi.

### 3.9 `[YÜKSEK]` Y6 — `tetkik` "Mevcut metin" alanı kaçınılmaz uydurma

**Kanıt:** `lib/tezgah/tetkik/prompts.ts:15` `"Sana site HTML'i verilmez."` → modele yalnız skor/madde listesi gider (`:51-76`). Şema `copyRewrites[].current` zorunlu (`analysis.ts:17-22`). UI bunu `"Mevcut durum"` başlığıyla basar (`tetkik-report.tsx:177`). Kalkan yalnız para/trafik/skor çelişkisini süzer (`narrative.ts:9-24`, `analysis.ts:130-143`).
**Sonuç:** "Sitenizde şu yazıyor" diye gösterilen cümle modelin uydurması olabilir. Bu, `dukkan`'ın XSS mührü kadar ciddiye alınması gereken bir **güven** bulgusudur.

### 3.10 `[YÜKSEK]` Y7 — Kredi hattında başarısız üretim `RESERVED` rezerv sızdırıyor

**Kanıt:** `lib/tezgah/paid-lane.ts:211-250` `beginTezgahCreditHold` → `RESERVED` satırı. Boş yanıtta `refundTezgahQuota` no-op (K3). Rezervi kapatmanın tek yolu `commitTezgahCredit` (`:273-357`). TTL temizliği **yalnız grant** için var: `lib/tezgah/grant/reservation-ttl.ts:7-24` (`scope: TEZGAH_GRANT_SCOPE`).
**Sonuç:** Her başarısız üretim `paid_command_reservations`'ta kalıcı `RESERVED`/`PROVIDER_DONE` satırı bırakır; kredi düşmez ama tablo şişer ve aynı anahtar "retry" sınıflanır (`paid-command.ts:195`). Üstelik `settleTezgahSlot` başarısız olursa (`engine.ts:141-152`) üretim **yapılmış** ama kullanıcıya hata dönülür ve iade yoktur.

---

### 3.11 `[ORTA]` bulgular

| ID | Bulgu | Kanıt |
|---|---|---|
| O1 | **`generateImage` gümrük kapısı ölü.** Görsel üretimi altyapısı var, çağrı sıfır. `studio-photo` bu yüzden metin. | `lib/kernel/ai/llm-gateway.ts:404`; sağlayıcı `providers/gemini.ts:187`; çağrı yok (grep: yalnız 2 tanım) |
| O2 | **`tetkik_reports` sınırsız anonim büyüme + üçüncü taraf tarama.** Temizlik işi yok, sahiplik yok, `robots.txt`/`sitemap.xml` yok. | `tetkik/public-report.ts:130-166`; `app/api/tezgah/tetkik/publish/route.ts:25`; `rubric.ts:23-36` |
| O3 | **Misafir `subject_key` ham IP saklıyor**, saklama/silme politikası yok. | `lib/kernel/ai/assistant-guest-quota.ts:99-109`; `prisma/schema/tezgah.prisma:45-51` |
| O4 | **`dukkan` "100/100" öz-skoru** kendi rubriğinde sahte `ttfbMs: 1` + `https: true` ile hesaplanıyor. | `dukkan/render.ts:44`; sabit `score: 100` `dukkan/engine.ts:18,108` |
| O5 | **`pazaryeri` yarı mamul.** Kategori taksonomi eşlemesi yok; 8 ürün tavanı; görsel/fiyat/stok yok. | `pazaryeri/parse.ts:82-88`; `copy.ts:9`; `csv.ts:96-98` |
| O6 | **`tetkik` köprüsü eksik:** `score.ts` "4. Aşama — Reklam Paketi" diyor ama `reklam`'a handoff yok. | `tetkik/score.ts:108-116`; `workbench.tsx:1356-1396` (yalnız dukkan/saas) |
| O7 | **Kopya tutarsızlığı:** `TEZGAH_CATALOG_CLOSED_MESSAGE` ("Günlük hak") + üye kartındaki gece yarısı cümlesi. | `catalog.ts:95-96`; `upgrade-card.tsx:101,138` |
| O8 | **Pro Studio sunucu doğrulaması yok.** `buildProStudio` istemcide çalışır; arşive yazılan içerik istemci beyanıdır. `POST /api/tezgah/outputs` yalnız 3 `toolKey` kabul eder ama içeriği denetlemez. | `workbench.tsx:788-816`; `app/api/tezgah/outputs/route.ts:19-24` |
| O9 | **UI'sız canlı kota tüketen rotalar:** `/api/tezgah/grant/generate`, `/api/tezgah/generate` (`ecommerce`). | `route-auth-map:150,148`; `catalog.ts:708-718` |
| O10 | **Akış (streaming) yok.** 900 token + 25 sn tavanı; `clipMarkdown` 6.000 karakter kesme. Uzun teklif sessizce kesilebilir. | `engine.ts:20-25,53-59,110-112` |
| O11 | **Sekme başına 8 masa × 2 sütun düzeni; arşiv drawer katlanmış `<details>`.** Keşfedilebilirlik düşük; 8 masanın 5'i ilk ekranda görünmüyor (mobilde yatay kaydırma). | `workbench.tsx:1161-1199` |
| O12 | **Test yanılsaması:** 130 test yeşil; K1/K3/Y1/Y2/Y3'ün hiçbiri test kapsamında değil (kota testleri `command` parametresini hiç geçmiyor). | `tests/tezgah/quota.test.ts:110-113` (refund yalnız `"free"`) |
| O13 | **Kota belgesi ile kod arasında yol sapması.** Belge hız kapısını `lib/tezgah/guarded` diye gösteriyor; gerçek dosya `lib/tezgah/generate-guard.ts`. Belgenin "ücretsiz sayaç Idempotency-Key zorunlu tutmaz" cümlesi doğru — yani Y1 bilinçli bir tasarım değil, eksik uygulama. | `.system_docs/TEZGAH_KOTA.md:63-67`; `lib/tezgah/generate-guard.ts:23-29` |

---

### 3.12 Kredi / ödeme hunisi — uçtan uca harita

```
Kota okuma      /api/tezgah/quota        → peekTezgahQuota (hak düşmez)        ✅ public, oturum opsiyonel
Ücretsiz üretim /api/tezgah/*/generate   → consume (ücretsiz 30/ay, misafir 3/gün) ⚠️ idempotency yok (Y1)
Kota doldu      quota.ts:755-800         → kredi varsa kredi hattı, yoksa paywall ✅
Kredi hattı     quota.ts:802-835         → hold + Idempotency zorunlu           ❌ istemci header göndermiyor (K1)
Ödeme vitrini   /api/tezgah/offers       → katalog satırı yoksa open:false       ✅ uydurma fiyat yok
Ödeme           /api/tezgah/checkout     → PayTR iframe, tutar katalogdan       ✅ idempotency + rıza zorunlu
Misafir ödeme   /api/tezgah/guest-checkout→ e-posta + künye + /claim/[token]    ✅ 5/10dk IP tavanı
CLEARED         register-paytr-license-hook → fulfillTezgahOrder                 ✅ Pro 30 gün uzatma / +10 kredi
Başarısız üretim restore()               → ücretsiz hat iade                     ✅
                                          Pro hattı iade                          ❌ (K3)
                                          kredi hattı hold serbest bırakma        ❌ (Y7)
Arşiv           /api/tezgah/outputs      → yalnız meta, 12 satır                 ❌ (K2)
```

**Huni yorumu:** Para **alma** tarafı (PayTR, katalog, rıza, claim, defter, idempotency) sahiden iyi kurulmuş. Para **harcama** tarafı (kredi hattı + iade + arşiv) üç yerde kopuk. Yani ürün "para almayı biliyor, harcatmayı beceremiyor".

---

## 4. 85+ / 100 İçin Faz 1 & Faz 2 Geliştirme Planı

### 4.1 Hedef skor dağılımı

| Eksen | Bugün | Faz 1 sonu | Faz 2 sonu |
|---|---|---|---|
| Mimari hazırlık (25) | 17 | 21 | 24 |
| Mevcut işlevsellik (30) | 18 | 24 | 28 |
| Ticari farklılaşma (25) | 14 | 19 | 23 |
| UX / Vitrin (20) | 12 | 17 | 19 |
| **Toplam** | **61** | **81** | **94** |

### 4.2 Ortak kural seti (iki fazda da geçerli)

1. **Kod mühürler, model konuşmaz.** Bugün `reklam` ve `pazaryeri`'de çalışan ilke (`reklam/guard.ts`, `pazaryeri/engine.ts:71-118`) `proposal`'ya da uygulanır. Yeni hiçbir masa "LLM çıktısını doğrudan teslim" etmez.
2. **Her masa bir dosya üretir.** Teslimat tanımı: indirilebilir, açılabilir, yazdırılabilir dosya. Ekran çıktısı teslimat sayılmaz.
3. **Her üretim arşivden geri açılır.** Kaydet → aç → indir üçlüsü tek sözleşme.
4. **Kota tek kaynak.** `consume`/`refund`/`release` üçlüsü her hat için simetrik.
5. **UI'ı olmayan rota canlı kalmaz.** Ya sekme, ya rota kapanır.

---

### 4.3 Faz 1 — "Huni Onarımı + Teslim Dosyası" (4–6 hafta, P0)

**Hedef skor: 61 → 81. Tek cümle: Para harcanabilir hale gelir ve her masa gerçek dosya verir.**

| # | İş | Dosya | Kabul ölçütü |
|---|---|---|---|
| F1.1 | **K1 onarımı:** genel hatta `productionHeaders()` | `components/tezgah/workbench.tsx:993` | Kredi paketi olan kullanıcı `proposal` üretir; 400 yok. Yeni test: kredi hattı + header |
| F1.2 | **Y1:** `tryConsume`'a `command` (commandKey + requestHash) ekle; aynı anahtar ikinci kez sayılmaz | `lib/tezgah/quota.ts:169-197, 600-740` | Aynı UUID ile 2 çağrı → 1 kredi. `tests/tezgah/quota.test.ts` yeni blok |
| F1.3 | **Y2:** istemci anahtarı `useIdempotencyKey` ile tut, başarıda `rotate()` | `workbench.tsx:643-649, 990-996` | Ağ hatası sonrası yeniden dene → tek üretim |
| F1.4 | **K3:** Pro hattı `refund` (decrement) + kredi hattı `release` | `quota.ts:841-872`, `paid-lane.ts` yeni `releaseTezgahCredit` | Pro boş yanıt → kredi aynı; test |
| F1.5 | **Y7:** `RESERVED` TTL taramasını `tezgah.generate` scope'una genişlet | `lib/tezgah/grant/reservation-ttl.ts:14-24` | 15 dk sonra `FAILED`; iade edilmiş kredi |
| F1.6 | **K2:** `GET /api/tezgah/outputs/[id]` + drawer'da Aç/Kopyala/İndir + sayfalama | `app/api/tezgah/outputs/[id]/route.ts` (yeni), `output-portfolio.tsx:95-119` | Arşivden dükkan HTML'i ve SVG indirilebilir |
| F1.7 | **Y3:** `outputContent` her masa için **asıl teslimat** (SVG, ZIP base64, HTML) | `workbench.tsx:810`, `components/tezgah/pro-studio-preview.tsx` | Teknik çizim arşivden SVG olarak iner |
| F1.8 | **Y5/O7:** metin onarımı — "Günlük hak" → "Aylık kredi", gece yarısı → ayın 1'i | `upgrade-card.tsx:101-138` | `catalog.ts:90` metniyle birebir |
| F1.9 | **`proposal` para kalkanı:** `reklam/guard.ts` mantığını paylaşılan bir `priceShield` modülüne çıkar | `lib/tezgah/guard/price.ts` (yeni), `engine.ts:153-154` | "50.000 TL" içeren sahte ücret cümlesi düşer; test |
| F1.10 | **`proposal` DOCX+PDF:** `grant/docx.ts` + `plain-pdf.ts` yolunu teklife bağla | `components/tezgah/workbench.tsx:1463-1480` | `teklif.docx` / `teklif.pdf` iner |
| F1.11 | **`studio-photo` gerçek üretim:** `generateImage` gümrünü bağla; fotoğraf yükle → beyaz fon/2:3 kırpma/ölçek → PNG indir | `lib/tezgah/pro/studio-photo.ts`, `lib/kernel/ai/llm-gateway.ts:404` | Kullanıcı 1200×1800 PNG indirir; kural tablosu **ölçülen** dosyadan |
| F1.12 | **Y4/O9:** ölü `grant`/`ecommerce` dallarını workbench'ten çıkar; UI'sız rotaları kapat veya sekmeye bağla | `workbench.tsx:758,1482`, `route-auth-map` | Kod −600 satır, rota haritası temiz |
| F1.13 | **Y6:** `tetkik` HTML'ini **snippet** olarak modele ver (title/h1/CTA metni, kırpılmış) | `lib/tezgah/tetkik/prompts.ts:15,42-76` | `copyRewrites[].current` gerçek sayfa metni; prompt "uydurma" yasağı |
| F1.14 | **O2/O3:** `tetkik_reports` 90 gün TTL temizliği; `guest` IP'yi hash'le | `public-report.ts:130`, `assistant-guest-quota.ts:106` | Cron + `subject_key` = `guest:sha256(ip)` |

**Faz 1 çıkış kapısı:** `verify:*` hepsi yeşil + yeni testler (idempotency, iade, arşiv, priceShield) + `npx vitest run tests/tezgah` ≥ 150 test.

---

### 4.4 Faz 2 — "Profesyonel İş İstasyonu + Çapraz Dönüşüm" (6–10 hafta, P1)

**Hedef skor: 81 → 94. Tek cümle: Masalar birbirinin girdisi olur ve üretim dosyası müşteriye satılabilir hale gelir.**

| # | İş | Neden / kanıt |
|---|---|---|
| F2.1 | **Tek "İş" (Job) kavramı.** `tetkik → dukkan → reklam → teknik çizim` tek `jobId` altında zincirlenir; her adım öncekinin çıktısını girdi alır. | Bugün köprü elle sekme değiştirme: `workbench.tsx:1360-1394` |
| F2.2 | **`tetkik` → `reklam` otomatik handoff.** `score.ts` zaten "4. Aşama — Reklam" diyor; kodda yok. | `tetkik/score.ts:108-116` |
| F2.3 | **`dukkan` → gerçek yayın.** Alt alan adı (`isim.yetkin.site`) veya Vercel/Netlify deploy + `dukkan` içine ürün listesi. | `dukkan` bugün sadece indirilebilir dosya (`dukkan/render.ts:62`) |
| F2.4 | **`pazaryeri` → tam katalog.** 8 → 50 ürün, fiyat/stok/görsel alanları, pazaryeri kategori ID eşlemesi, Trendyol/Hepsiburada **API** yüklemesi. | `copy.ts:9`; `commerce/pazaryeri-bridge.ts:83-88` (null fiyat) |
| F2.5 | **`reklam` → Ads Manager dışa aktarım.** Google Ads Editor CSV, Meta Ads CSV, A/B varyant matrisi (3 kanca × 2 gövde), bütçe aralığı **koddan** (ROAS vaadi yok). | `reklam/guard.ts:135-196` bugün yalnız markdown |
| F2.6 | **`technical-drawing` → üretim dosyası.** Ön/yan/üst görünüş, kesit, ölçek cetveli, tolerans, parça listesi; **DXF + PDF** çıktısı; derinliğin gerçekten çizilmesi. | `technical-drawing.ts:70` derinlik yalnız metin |
| F2.7 | **`saas-builder` → serbest bileşen.** `feature` serbest metnini **gerçekten** kod üretimine sokan LLM+kod hibrid yol (LLM yalnız iskelet seçer, kod şablonu basar), React sandbox (StackBlitz/Sandpack) ve gerçek çalıştırma. | `saas-builder.ts:77,418` bugün `feature` sadece rehberde |
| F2.8 | **`proposal` → 3 mod.** Teklif / sözleşme eki / fatura öncesi kapsam; DOCX+PDF; müşteri onay linki. | `catalog.ts:270-273` bugün `cta` kendine |
| F2.9 | **YetkinCV köprüsü derinleşir.** Üretilen teslimat (teklif/dükkan/çizim) portföy kartında **dosya olarak** görünür, sadece 280 karakter özet değil. | `lib/career/tezgah-portfolio.ts:5-13` `BODY_CAP = 280` |
| F2.10 | **YetkinHibe köprüsü.** `proposal`'daki proje tanımı → `grant` brief ön dolgu; `grant` çıktısı → `proposal` ek dosyası. | Bugün hiç yok |
| F2.11 | **Arşiv = "Portföy".** Filtre (masa/tarih), etiket, dışa aktarma (tümü ZIP), silme, arama. | K2 sonrası doğal adım |
| F2.12 | **Akış (streaming).** Üretim SSE ile akar; 900 token tavanı masaya göre yükselir. | `engine.ts:110-112` 25 sn sessiz bekleme |
| F2.13 | **Gözlemlenebilirlik.** Masa başına: üretim/dakika, iade oranı, kredi hattı dönüşümü, arşiv açma oranı, dosya indirme oranı. | Bugün yalnız `firstOutput` ve kota duvarı olayı (`workbench.tsx:1035-1041, 1143-1153`) |

---

### 4.5 Neden 85+ yeterli (ve neden 94 gerçekçi)

| Rakip sınıfı | Bugünkü durum | Faz 2 sonrası yetkin.ai |
|---|---|---|
| Genel LLM sohbet | Metin verir, dosya vermez | 8 masanın her biri **indirilebilir dosya** (DOCX/PDF/HTML/CSV/SVG/ZIP/PNG) üretir |
| Tekil SEO araçları (Ahrefs/SEMrush) | Ölçer, düzeltmez | `tetkik` ölçer **ve** `dukkan` ile düzeltir (tek zincir) |
| Görsel stüdyolar | Görsel üretir, kural bilmez | `studio-photo` pazaryeri kuralını **ölçerek** uygular |
| Pazaryeri entegratörleri | Katalog yükler, metin yazmaz | `pazaryeri` metni yazar **ve** `commerce_products`'a yazar |
| CV/portföy | Ayrı ürün | Tezgâh teslimatı **mühürlü kanıt** olur (`/career#yetkincv`) |

85+ eşiği şu üç şeyle geçilir ve başka hiçbir şeyle geçilemez: **(1) para harcanabilir hale gelmeli (Faz 1), (2) her masa dosya vermeli (Faz 1), (3) masalar birbirinin girdisi olmalı (Faz 2)**. Bugünkü 61 puanın 22'si tam olarak bu üç kalemde kayıp.

---

## 5. Bulgu Özet Tablosu (önem sırasına göre)

| ID | Önem | Bulgu | Kanıt | Faz |
|---|---|---|---|---|
| K1 | KRİTİK | Kredi paketi sonrası `proposal` 400 alıyor (Idempotency-Key gönderilmiyor) | `workbench.tsx:993`, `quota.ts:786-799` | 1 |
| K2 | KRİTİK | Arşiv açılamıyor/kopyalanamıyor/indirilemiyor | `app/api/tezgah/outputs/route.ts:30-42`, `output-portfolio.tsx:95-119` | 1 |
| K3 | KRİTİK | Pro hattı boş yanıtta kredi kaybediyor, mesaj tersini söylüyor | `quota.ts:600-612, 841-850`, `catalog.ts:116` | 1 |
| Y1 | YÜKSEK | Idempotency ücretsiz/Pro hatta çift düşümü engellemiyor | `quota.ts:720-739, 612` | 1 |
| Y2 | YÜKSEK | İstemci her denemede yeni UUID üretiyor | `workbench.tsx:643-649` | 1 |
| Y3 | YÜKSEK | Pro Studio arşive özet yazıyor, teslimatı değil | `workbench.tsx:810`, `pro/build.ts:107-152` | 1 |
| Y4 | YÜKSEK | `grant`+`ecommerce` workbench dalları ölü kod | `catalog.ts:162-172, 708-718`, `workbench.tsx:758, 1482` | 1 |
| Y5 | YÜKSEK | Üye kota yenileme metni yanlış ("gece yarısı") | `upgrade-card.tsx:101,138` | 1 |
| Y6 | YÜKSEK | `tetkik` "mevcut metin" alanı uydurma (HTML modele verilmiyor) | `tetkik/prompts.ts:15`, `analysis.ts:17-22` | 1 |
| Y7 | YÜKSEK | Kredi hattında başarısız üretim `RESERVED` sızıntısı | `paid-lane.ts:211-250`, `reservation-ttl.ts:14-24` | 1 |
| Y8 | YÜKSEK | `proposal`'da kodla para/süre kalkanı yok | `engine.ts:153-154` (karş. `reklam/guard.ts:12-13,37-42`) | 1 |
| O1 | ORTA | Görsel üretim gümrüğü ölü; `studio-photo` metin | `llm-gateway.ts:404` (çağrı yok) | 1 |
| O2 | ORTA | `tetkik_reports` sınırsız anonim büyüme | `public-report.ts:130-166` | 1 |
| O3 | ORTA | Misafir `subject_key` ham IP | `assistant-guest-quota.ts:106` | 1 |
| O4 | ORTA | `dukkan` "100/100" öz-skoru kendi rubriğinde | `dukkan/render.ts:44` | 2 |
| O5 | ORTA | `pazaryeri` yarı mamul (taksonomi, 8 ürün, fiyat/stok) | `parse.ts:82-88`, `copy.ts:9` | 2 |
| O6 | ORTA | `tetkik`→`reklam` handoff eksik | `tetkik/score.ts:108-116` | 2 |
| O7 | ORTA | Kota kopya dili tutarsız | `catalog.ts:95`, `upgrade-card.tsx:101` | 1 |
| O8 | ORTA | Pro Studio sunucu doğrulaması yok | `workbench.tsx:788-816` | 2 |
| O9 | ORTA | UI'sız canlı kota tüketen rotalar | `route-auth-map:148,150` | 1 |
| O10 | ORTA | Streaming yok, 900 token + 6.000 karakter kesme | `engine.ts:20-25,110` | 2 |
| O11 | ORTA | Sekme keşfedilebilirliği düşük | `workbench.tsx:1161-1197` | 1 |
| O12 | ORTA | 130 yeşil test K1/K3/Y1/Y2/Y3'ü kapsamıyor | `tests/tezgah/quota.test.ts:110-113` | 1 |
| O13 | ORTA | Kota belgesinde yol sapması (`lib/tezgah/guarded` yok) | `.system_docs/TEZGAH_KOTA.md:63-67`, `generate-guard.ts:23-29` | 1 |

---

## 6. Ek — Bu raporun tekrar üretilebilir kanıtı

```bash
# Kapılar
npx tsc --noEmit
npm run verify:sen-axis
npm run verify:boundaries
npm run verify:api-auth -- --check
npm run verify:rls-status
npm run verify:no-secrets
npx vitest run tests/tezgah

# K1: genel hat Idempotency-Key göndermiyor
rg -n -A 4 '"/api/tezgah/generate"' components/tezgah/workbench.tsx
rg -n 'Ücretli üretim Idempotency-Key ister' lib/tezgah/quota.ts

# K2: arşiv içeriği hiç dönmüyor
rg -n 'select: \{ id: true, toolKey: true, title: true, createdAt: true \}' app/api/tezgah/outputs/route.ts
Get-ChildItem app/api/tezgah/outputs   # [id] rotası yok

# K3: Pro iadesi no-op — erken dönüş
rg -n -A 4 'export async function refundTezgahQuota' lib/tezgah/quota.ts

# Y3: arşive özet yazılıyor
rg -n -B 2 -A 3 'outputContent: \(built.pack.markdown' components/tezgah/workbench.tsx

# Y4: grant/ecommerce ulaşılamaz
rg -n 'TEZGAH_DESK_TOOL_IDS' lib/tezgah/catalog.ts
rg -n 'active.id === "grant"|active.id === "ecommerce"' components/tezgah/workbench.tsx

# O1: görsel gümrüğü çağrısı yok
rg -n 'generateImage\(' lib app components

# Y6: HTML modele verilmiyor
rg -n "Sana site HTML'i verilmez" lib/tezgah/tetkik/prompts.ts
```

**Rapor sonu.** Kaynak kodda tek bir satır değiştirilmedi; yalnız bu belge yazıldı.
