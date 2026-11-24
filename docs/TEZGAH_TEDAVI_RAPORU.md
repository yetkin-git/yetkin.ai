# yetkin.ai — AI Tezgâh Tedavi Raporu

**Kapsam:** Masa 1–8 (`proposal`, `tetkik`, `dukkan`, `reklam`, `pazaryeri`, `studio-photo`, `technical-drawing`, `saas-builder`) — tespit §2.1–§2.8, §3.6 Y3, §4.4 F2.1 / F2.7, K2 arşiv uyumu.
**Kaynak tespit:** [`TEZGAH_TESPIT_RAPORU.md`](./TEZGAH_TESPIT_RAPORU.md)
**Tarih:** 24 Kasım 2026

---

## 0. Kapı sonuçları (bu tur — Masa 8 `saas-builder`)

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | **OK** |
| `npm run verify:sen-axis` | **OK** — 709 dosya, 46 siz kaçağı |
| `npm run verify:boundaries` | **OK** |
| `npm run verify:api-auth -- --check` | **OK** — 166 route (`session:103`) |
| `npm run verify:rls-status` | **OK** — `tezgah_outputs` FORCE RLS listede |
| `npm run verify:no-secrets` | **OK** |
| `npx vitest run tests/tezgah` | **OK** — **30 dosya / 169 test** |
| `npx next build` | **OK** |

Marka dili (`verify:sen-axis`) ve mühürler gevşetilmedi. SaaS önizleme iframe `sandbox="allow-scripts"` (same-origin yok); kullanıcı metni `escapeHtml` / `JSON.stringify`; `readApiUrl` yalnız `https:` + kimlik bilgisiz URL.

---

## 1. Yönetici özeti

| Masa | Tespit puanı | Tedavi sonrası | Tek cümle |
|---|---|---|---|
| 1 · `proposal` | **58 / 100** | **≈ 82 / 100** | Para kalkanı + DOCX/PDF + kredi Idempotency + YetkinCV/Hibe köprüleri |
| 2 · `tetkik` | **78 / 100** | **≈ 92 / 100** | Gerçek sayfa snippet + robots/sitemap + PDF + reklam handoff + 90g TTL + misafir IP hash |
| 3 · `dukkan` | **72 / 100** | **≈ 89 / 100** | Dürüst mühür + 12 sektör + paket/SSS + zip + reklam/e-ticaret köprüsü + arşiv `.html` |
| 4 · `reklam` | **60 / 100** | **≈ 88 / 100** | 3’lü A/B matris + Google/Meta CSV + DOCX/PDF + bütçe %60/%25/%15 + dukkan/studio-photo köprüsü |
| 5 · `pazaryeri` | **66 / 100** | **≈ 88 / 100** | 25 ürün + opsiyonel fiyat/stok + taksonomi + DOCX/PDF + `commerce_products` aktarım + studio/reklam köprüsü |
| 6 · `studio-photo` | **38 / 100** | **≈ 86 / 100** | `generateImage` + kota/iade + dürüst standart + PNG/ZIP + pazaryeri/reklam köprüsü |
| 7 · `technical-drawing` | **62 / 100** | **≈ 89 / 100** | 3 görünüş + ölçek/tolerans/antet + DXF/PDF/ZIP + Y3 arşiv + saas/pazaryeri köprüsü |
| 8 · `saas-builder` | **68 / 100** | **≈ 89 / 100** | 8 iş aracı + feature→kod + Y3 `saas-builder-v1` + kod sekmeleri/zip + dukkan/e-ticaret köprüsü |

---

## 2. Masa 1 — `proposal` (önceki tur / kilitli durum)

Tespit §2.1 ve F1.1 / F1.9 / F1.10 kapatıldı; kanıt `tests/tezgah/proposal-station.test.ts` (9 test).

| Bulgu | Tedavi | Kanıt |
|---|---|---|
| K1 — kredi hattında Idempotency-Key yok | `productionHeaders()` / `productionIdempotency` | `components/tezgah/workbench.tsx` |
| Y8 — para/süre uydurma | `lib/tezgah/guard/price-shield.ts` → motor mühürü | `applyPriceShield` |
| F1.10 — yalnız `.md`/`.txt` | `buildProposalDocx` / `buildProposalPdf` | `lib/tezgah/proposal/document.ts` |
| Köprü zayıf | YetkinCV + Hibe ön-dolgu | `lib/tezgah/proposal/bridges.ts` |

**Kalan (bilinçli sonraki faz):** streaming (O10), 3-mod teklif (F2.8), iş zinciri Job kavramı (F2.1).

---

## 3. Masa 2 — `tetkik` (önceki tur / kilitli durum)

### 3.1 Y6 — Halüsinasyon kapatma (gerçek sayfa metni)

| Önce | Sonra |
|---|---|
| Prompt: *"Sana site HTML'i verilmez"* → `copyRewrites[].current` uydurma | `parse-html` → `title` / `metaDescription` / `h1` / `ctaTexts` snippet |
| UI "Mevcut durum" model uydurması basabilirdi | `sealRewriteCurrent` allowlist dışı metni `"Sayfada tanımlı değil"` yapar |

### 3.2 O2 / O6 / O3

- `robots.txt` / `sitemap.xml` (skor dışı sinyal)
- Reklam handoff + PDF
- 90 gün TTL + misafir IP hash

Kanıt: `tests/tezgah/tetkik-station.test.ts` (5 test).

---

## 4. Masa 3 — `dukkan` (bu tur)

Tespit §2.3 (72/100), §3.11 **O4**, §4.4 **F2.3** / **F2.1**, **K2** arşiv uyumu.

### 4.1 O4 — Sahte 100/100 öz-skorunun kaldırılması

| Önce | Sonra |
|---|---|
| `inspectDukkanDelivery` → `scoreHomepageHtml(..., { https: true, ttfbMs: 1 })` ile yapay 100 | Yapısal mühürler: Viewport / XSS / WhatsApp+Tel / Semantik SEO |
| API + UI `score: 100`, eyebrow `Öz-skor 100 / 100` | `seals[]` + eyebrow **Yapısal kontrol mühürleri**; `ttfbMs: 1` kodda yok |

**Rozet metni (UI):**  
`Mobil Uyumlu (Viewport) ✓ • Sıfır Script / XSS Korumalı ✓ • WhatsApp & Telefon Dönüşüm Hattı ✓ • Semantik SEO Başlık Yapısı ✓`

**Dosyalar:** `lib/tezgah/dukkan/render.ts`, `engine.ts`, `copy.ts` (`DUKKAN_STRUCTURAL_SEALS`), `components/tezgah/dukkan-preview.tsx`

### 4.2 F2.3 — 12 sektör + vitrin paketleri / SSS + zip

| Madde | Uygulama |
|---|---|
| 12 sektör | E-Ticaret/Butik, Klinik/Sağlık, Kafe/Restoran, Mali Müşavir/Hukuk, İnşaat/Mimarlık, Eğitim/Akademi, Güzellik/Bakım, Oto Servis, Emlak, Teknik Servis, Lojistik/Nakliye, Yazılım/Ajans |
| İsteğe bağlı paketler | `Ad \| Kısa açıklama \| Fiyat etiketi` (en çok 6) — kullanıcı fiyatını basar, sistem uydurmaz |
| Çalışma saatleri / SSS | `hours` + `Soru \| Cevap` (en çok 5) |
| Teslimat | `dijital-dukkan.html` + `dijital-dukkan.zip` (`index.html` + `YAYINLAMA_REHBERI.md`) |
| XSS | Tüm kullanıcı girdileri `escapeHtml`; `<script>` / `on*=` / `javascript:` reddedilir |

**Dosyalar:** `copy.ts`, `schema.ts`, `render.ts` (`buildDukkanPack` / `buildDukkanZip`), `catalog.ts` alanları, API `zipBase64` + `guide`

### 4.3 F2.1 / K2 — Çapraz köprü + arşiv

| Köprü | Hedef |
|---|---|
| **Bu Dükkan İçin Reklam Paketi Oluştur** | `/tezgah?tool=reklam` + `businessName` / `sector` / `place` / `offer` (hizmet özeti) — `dukkanReklamHandoffHref` |
| **E-Ticaret Mağazası Aç** | `/panel/e-ticaret` |
| Arşiv | `recordSignedTezgahOutput` HTML yazar; çekmecede **Aç / Kopyala / .html İndir** (`output-portfolio.tsx`, `data-dukkan-archive-html`) |

### 4.4 Testler

`tests/tezgah/dukkan-station.test.ts` — 4 test:

1. 12 sektör + sahte `100/100` / `ttfbMs: 1` yok  
2. Paket/SSS XSS (`<script>`, `onerror=`) engeli  
3. Zip içinde `index.html` + `YAYINLAMA_REHBERI.md`  
4. Reklam handoff + e-ticaret köprüsü + arşiv `.html` mührü  

Mevcut `dukkan-engine` / `dukkan-score` / `dukkan-xss` / `surface` / `reklam-engine` buna göre güncellendi.

### 4.5 Puan gerekçesi (dukkan 72 → ~89)

| Eksen | Kazanç | Not |
|---|---|---|
| Dürüstlük (O4) | +5 | Sahte hız/100 kalktı; yapısal mühür |
| Vitrin derinliği (F2.3) | +6 | 12 sektör + paket/SSS + zip kaynak paketi |
| Çapraz köprü (F2.1) | +4 | → reklam (ön-dolgulu) + → e-ticaret |
| Arşiv (K2 uyumu) | +2 | HTML kaydı + çekmeceden `.html` indirme |
| XSS / mühür | 0 | gevşetilmedi |

Kalan ~11 puan: canlı alt alan adı yayınlama (F2.3 tam “gerçek host”), tek Job zinciri (`tetkik→dukkan→reklam`) henüz ürünleşmedi.

---

## 5. Dokunulan dosya özeti (Masa 3)

**Yeni:** `lib/tezgah/dukkan/bridges.ts`, `tests/tezgah/dukkan-station.test.ts`

**Güncellenen:** `copy.ts`, `schema.ts`, `render.ts`, `engine.ts`, `reklam/copy.ts` (12 sektör ilgileri), `catalog.ts`, `app/api/tezgah/dukkan/generate/route.ts`, `dukkan-preview.tsx`, `workbench.tsx`, `output-portfolio.tsx`, `lib/commerce/os-growth.ts` (`eticaret`), ilgili testler, bu rapor.

---

## 6. Masa 4 — `reklam` (bu tur)

Tespit §2.4 (60/100), §4.4 **F2.5** (Ads Manager dışa aktarım + A/B matris + bütçe aralığı), **F2.1** çapraz köprü, **K2** arşiv uyumu.

### 6.1 F2.5 — A/B kampanya varyant matrisi

| Madde | Uygulama |
|---|---|
| Varyant A | Sorun & Çözüm Açısı |
| Varyant B | Güven & Uzmanlık Açısı |
| Varyant C | Net Teklif & Hızlı Aksiyon Açısı |
| Google | Başlık ≤ 30, Açıklama ≤ 90 — deterministik kırpma (`clipReklamUnits`) |
| Meta | Ana Metin, Başlık, Görsel Brif, Negatif Anahtar Kelime Önerileri |
| Bütçe | `%60 Soğuk Test / %25 Yeniden Pazarlama / %15 Kazanan Ölçekleme` — tutar yalnız kullanıcı girdiyse; yoksa yüzde |
| Kalkan | `METRIC` + `inventsMoney` + yabancı CTA — **gevşetilmedi**; eksik varyant → kota iadesi |

**Dosyalar:** `lib/tezgah/reklam/{copy,schema,prompts,guard,types,engine}.ts`

### 6.2 F2.5 / K2 — Google Ads CSV, Meta Ads CSV, Word/PDF

| Teslimat | Dosya / sütunlar |
|---|---|
| `google-ads-kampanya.csv` | Campaign, Ad Group, Headline 1–3, Description 1–2, Keywords |
| `meta-ads-kampanya.csv` | Campaign Name, Ad Set Name, Ad Name, Primary Text, Headline, Call To Action, Creative Brief |
| Word / PDF | `buildReklamDocx` / `buildReklamPdf` |
| CSV mühür | Formül enjeksiyonu kaçışı + UTF-8 BOM + teslim imzası |
| Arşiv | `tezgah_outputs` markdown kaydı; çekmeceden .md / Word / PDF / Google CSV / Meta CSV |

**Dosyalar:** `csv.ts`, `document.ts`, `components/tezgah/reklam-preview.tsx`, `output-portfolio.tsx`, `app/api/tezgah/reklam/generate/route.ts`

### 6.3 F2.1 — Çapraz köprüler

| Köprü | Hedef |
|---|---|
| **Bu Kampanya İçin Dijital Dükkan Kur** | `/tezgah?tool=dukkan` + işletme adı / sektör / yer / teklif özeti |
| **Reklam Görseli Hazırla (studio-photo)** | `/tezgah?tool=studio-photo` + ürün adı + görsel brief özeti |

**Dosya:** `lib/tezgah/reklam/bridges.ts`

### 6.4 Testler

`tests/tezgah/reklam-station.test.ts` — 4 test:

1. 3 varyantlı A/B matrisi + 30/90 karakter sınırı + bütçe dağılımı  
2. Sahte ROAS/tıklama/para iddiasının `guard` tarafından reddi  
3. Google/Meta CSV formül enjeksiyonu (`=SUM(...)`) kaçışı + UTF-8 BOM + DOCX/PDF  
4. `dukkan` / `studio-photo` handoff + arşiv indirme mührü  

Mevcut `reklam-engine` / `pazaryeri-engine` / `surface` / `workbench-split-surface` buna göre güncellendi.

### 6.5 Puan gerekçesi (reklam 60 → ~88)

| Eksen | Kazanç | Not |
|---|---|---|
| A/B derinlik (F2.5) | +10 | 3 stratejik açı × Google/Meta alanları |
| Ads dışa aktarım (F2.5) | +10 | Google + Meta CSV (formül kaçışlı) |
| Teslimat (DOCX/PDF) | +4 | Müşteriye gönderilebilir dosya |
| Bütçe dağılımı | +2 | Kod hesabı; ROAS vaadi yok |
| Çapraz köprü (F2.1) | +2 | → dukkan + → studio-photo |
| Arşiv (K2) | +2 | CSV/DOCX/PDF çekmeceden yeniden iner |
| Metrik kalkanı | 0 | gevşetilmedi |

Kalan ~12 puan: canlı Ads API yükleme, hedef kitle büyüklüğü tahmini (bilinçli yok), tek Job zinciri (`tetkik→dukkan→reklam`) henüz ürünleşmedi.

### 6.6 Dokunulan dosya özeti (Masa 4)

**Yeni:** `lib/tezgah/reklam/{types,csv,document,bridges}.ts`, `components/tezgah/reklam-preview.tsx`, `tests/tezgah/reklam-station.test.ts`

**Güncellenen:** `copy.ts`, `schema.ts`, `prompts.ts`, `guard.ts`, `engine.ts`, `catalog.ts`, `app/api/tezgah/reklam/generate/route.ts`, `workbench.tsx`, `output-portfolio.tsx`, `reklam-engine` / `pazaryeri-engine` / `surface` / `workbench-split-surface` testleri, bu rapor.

---

## 7. Masa 5 — `pazaryeri` (bu tur)

Tespit §2.5 (**66 / 100**), §3.11 **O5**, §4.4 **F2.4** / **F2.1**, **K2** arşiv uyumu.

### 7.1 O5 / F2.4 — 25 ürün + opsiyonel fiyat/stok

| Madde | Uygulama |
|---|---|
| Tavan | `PAZARYERI_MAX_PRODUCTS = 25` (`copy.ts`); `PAZARYERI_IMPORT_MAX_ROWS = 25` (`validate.ts`) |
| Girdi | Düz ad **veya** `Ürün Adı \| Marka \| Fiyat (TL) \| Stok`; ayrıca `Fiyat:` / `Stok:` / `Marka:` satırları |
| Fiyat/stok | Yalnız kullanıcı girdiyse CSV + `commerce_products` taslağına yazar; LLM uydurmaz |
| Kalkan | `inventsMoney` + `keptBullet` + barkod atımı **korundu** |
| Token | `PAZARYERI_MAX_OUTPUT_TOKENS = 3200` (25 satıra sığacak şekilde) |

**Dosyalar:** `lib/tezgah/pazaryeri/{copy,parse,schema,engine,csv,prompts}.ts`

### 7.2 O5 / F2.4 — Taksonomi eşlemesi

| Madde | Uygulama |
|---|---|
| Sözlük | `taxonomy.ts` — Trendyol / Hepsiburada / Amazon TR ana yolları (deterministik skor) |
| CSV sütunu | `Pazaryeri Kategori` (`PAZARYERI_TAXONOMY_COLUMN`) |
| Önizleme | Tablo + Word/PDF aynı sütunu taşır |
| Aktarım | Bridge eşleşen yolu `commerce_products.category` olarak tercih eder |

### 7.3 F2.4 / K2 — E-Ticaret havuzu + Word/PDF + arşiv

| Madde | Uygulama |
|---|---|
| Bridge | `catalogTableToDraftImport` → `amountMinor` / `onHandQty` / kategori |
| Taslak kuralı | Barkod boş kalır; fiyat/stok isteğe bağlı (`validate.ts`); stok fişi açılmaz |
| Teslimat | CSV + `buildPazaryeriDocx` / `buildPazaryeriPdf` |
| Arşiv | `tezgah_outputs` CSV kaydı; çekmeceden `.csv` / `.docx` / `.pdf` |

**Dosyalar:** `lib/commerce/{pazaryeri-bridge,validate,service}.ts`, `lib/tezgah/pazaryeri/document.ts`, `pazaryeri-preview.tsx`, `output-portfolio.tsx`

### 7.4 F2.1 — Çapraz köprüler

| Köprü | Hedef |
|---|---|
| **Bu Ürünler İçin Görsel Hazırla (studio-photo)** | `/tezgah?tool=studio-photo` + `market` + ilk ürün adı |
| **Bu Katalog İçin Reklam Paketi Oluştur** | `/tezgah?tool=reklam` + marka/kategori + öne çıkan ürünler |
| Master SKU | Mevcut `MasterSkuTransfer` → `commerce_products` (25 satıra yükseldi) |

**Dosya:** `lib/tezgah/pazaryeri/bridges.ts`

### 7.5 Testler

`tests/tezgah/pazaryeri-station.test.ts` — 4 test:

1. 25 ürün toplu üretim + kullanıcı fiyat/stok koruması + uydurma fiyat engeli  
2. Taksonomi kategori eşlemesi (Trendyol / HB / Amazon + eşleşmezse boş)  
3. CSV formül enjeksiyonu + UTF-8 BOM + DOCX/PDF + arşiv mühürleri  
4. E-Ticaret 25 satır aktarım + `studio-photo` / `reklam` köprüleri  

Mevcut `pazaryeri-engine` / `surface` / `phase1` buna göre güncellendi.

### 7.6 Puan gerekçesi (pazaryeri 66 → ~88)

| Eksen | Kazanç | Not |
|---|---|---|
| Kapasite (O5 / F2.4) | +6 | 8 → 25 ürün |
| Fiyat/stok yapısal giriş | +5 | Kullanıcı değeri CSV + havuza; LLM uydurmaz |
| Taksonomi | +5 | Pazaryeri kategori yolu deterministik |
| Teslimat (DOCX/PDF) + arşiv (K2) | +4 | Çekmeceden `.csv` / `.docx` / `.pdf` |
| Çapraz köprü (F2.1) | +2 | → studio-photo + → reklam |
| Para/barkod kalkanı | 0 | gevşetilmedi |

Kalan ~12 puan: canlı Trendyol/HB API yüklemesi, görsel URL / desi / varyant şablon alanları, 50 ürün tavanı (F2.4 tam vizyon) henüz ürünleşmedi.

### 7.7 Dokunulan dosya özeti (Masa 5)

**Yeni:** `lib/tezgah/pazaryeri/{taxonomy,document,bridges}.ts`, `tests/tezgah/pazaryeri-station.test.ts`

**Güncellenen:** `copy.ts`, `parse.ts`, `csv.ts`, `engine.ts`, `prompts.ts`, `catalog.ts`, `pazaryeri-preview.tsx`, `workbench.tsx`, `output-portfolio.tsx`, `lib/commerce/{pazaryeri-bridge,validate,service}.ts`, `lib/copy/sen-voice/magazam.ts`, `pazaryeri-engine` / `surface` testleri, bu rapor.

---

## 8. Masa 6 — `studio-photo` (bu tur)

Tespit §2.6 (**38 / 100**), §3.11 **O1**, §4.3 **F1.11**, §4.4 **F2.1**, **K2** arşiv uyumu.

### 8.1 O1 / F1.11 — `generateImage` gümrüğü bağlandı

| Madde | Uygulama |
|---|---|
| Motor | `lib/tezgah/pro/studio-photo-engine.ts` → `generateImage` (`llm-gateway`) |
| Rota | `POST /api/tezgah/studio-photo` — `auth = "session"`, `Idempotency-Key`, `guardTezgahGenerateRate` |
| Kota | Havuz `lite` (eski `local` ücretsiz yanılsama kalktı); boş/hata → `refundTezgahQuota` |
| Oran | Sahne → `aspectRatio` (`2:3` / `1:1` / `4:5`) Gemini `imageConfig`’e iletilir |
| Prompt | Marka/telif/metin basımı yasaklı stüdyo promptu; kullanıcı XSS/ölçü iddiası yok |

**Dosyalar:** `studio-photo-engine.ts`, `studio-photo-schema.ts`, `app/api/tezgah/studio-photo/route.ts`, `llm-gateway.ts`, `providers/gemini.ts`

### 8.2 Dürüst standart + PNG/ZIP teslimat (O1 / K2)

| Önce | Sonra |
|---|---|
| Kullanıcı `widthPx`/`heightPx` beyanı → *"Ölçülen kare"* | **Hedef Pazaryeri Standardı** (sahne sabitleri) + PNG IHDR’dan üretilen piksel |
| Yalnız markdown talimat | Canlı önizleme + **Görseli İndir (.png)** + **Stüdyo Paketi (.zip)** + **Kılavuz (.md)** |
| Arşiv yok / metin | `tezgah_outputs` JSON zarfı (`studio-photo-v1`); çekmeceden `.png` / `.zip` / `.md` |

Sahneler: Trendyol 2:3 Beyaz Fon · Amazon 1:1 Saf Beyaz Fon · Yaşam Tarzı Stüdyo · Reklam Karesi.

**Dosyalar:** `studio-photo.ts`, `options.ts`, `pro-studio-preview.tsx`, `output-portfolio.tsx`, `record-output.ts` (BODY_CAP 3MB)

### 8.3 F2.1 — Çapraz köprüler

| Köprü | Hedef |
|---|---|
| **Pazaryeri Kataloğuna Ekle (pazaryeri)** | `/tezgah?tool=pazaryeri` + market + ürün satırı |
| **Bu Görselle Reklam Paketi Oluştur (reklam)** | `/tezgah?tool=reklam` + ürün adı + görsel konsepti |

**Dosya:** `lib/tezgah/pro/studio-photo-bridges.ts`

### 8.4 Testler

`tests/tezgah/studio-photo-station.test.ts` — 4 test:

1. `generateImage` doğru `aspectRatio` + PNG/base64  
2. Sağlayıcı hatasında kota iadesi  
3. *"Ölçülen kare"* yok; **Hedef Pazaryeri Standardı** var  
4. `.png`/`.zip` + `pazaryeri`/`reklam` köprüleri + rota mühürleri  

### 8.5 Puan gerekçesi (studio-photo 38 → ~86)

| Eksen | Kazanç | Not |
|---|---|---|
| Gerçek motor (O1 / F1.11) | +28 | Metin talimatı → `generateImage` PNG |
| Dürüstlük | +8 | Sahte "ölçülen kare" kalktı; hedef standart + IHDR |
| Teslimat + arşiv (K2) | +8 | PNG/ZIP + çekmeceden yeniden indirme |
| Çapraz köprü (F2.1) | +4 | → pazaryeri + → reklam |
| Kota/iade | 0 | gevşetilmedi; lite havuz + iade |

Kalan ~14 puan: çoklu galeri karesinin her biri için ayrı `generateImage`, DXF/PSD paket, canlı pazaryeri yükleme henüz yok.

### 8.6 Dokunulan dosya özeti (Masa 6)

**Yeni:** `studio-photo-engine.ts`, `studio-photo-schema.ts`, `studio-photo-bridges.ts`, `app/api/tezgah/studio-photo/route.ts`, `tests/tezgah/studio-photo-station.test.ts`

**Güncellenen:** `studio-photo.ts`, `options.ts`, `build.ts`, `zip.ts`, `catalog.ts`, `workbench.tsx`, `pro-studio-preview.tsx`, `output-portfolio.tsx`, `pazaryeri/bridges.ts`, `reklam/bridges.ts`, `llm-gateway.ts`, `gemini.ts`, `types.ts`, `record-output.ts`, `web-only-write-routes.ts`, `http-rate-limit.ts`, ilgili testler, bu rapor.

---

## 9. Masa 7 — `technical-drawing` (bu tur)

Tespit §2.7 (**62 / 100**), §3.6 **Y3**, §4.4 **F2.6** / **F2.1**, **K2** arşiv uyumu.

### 9.1 F2.6 — 3 görünüşlü ortografik motor

| Önce | Sonra |
|---|---|
| Tek ön görünüş; `depthMm` yalnız metin | **Ön** (W×H) + **Yan** (D×H) + **Üst** (W×D); derinlik gerçek `rect` + ölçü oku |
| Ölçek/tolerans/antet yok | Ölçek `1:N` + cetvel, genel tolerans (varsayılan `±0.5 mm`), malzeme & kalınlık, montaj adımları, sağ alt antet bloğu |
| Yalnız `.svg` | `.svg` + ASCII `.dxf` + teknik föy `.pdf` + `uretim-paketi.zip` (`URETIM_NOTU.md` dahil) |

**Dosyalar:** `lib/tezgah/pro/technical-drawing.ts`, `technical-drawing-export.ts`

### 9.2 Y3 & K2 — arşive asıl çizim

| Önce | Sonra |
|---|---|
| `outputContent = markdown` (tek satır özet) | `technical-drawing-v1` JSON zarfı (`svg` + `dxf` + ölçüler) |
| Çekmeceden yeniden açılamıyordu | Önizleme iframe (`sandbox=""`) + `.svg` / `.dxf` / `.pdf` indirme |

**Dosyalar:** `lib/tezgah/pro/build.ts`, `components/tezgah/workbench.tsx`, `output-portfolio.tsx`

### 9.3 F2.1 — Çapraz köprüler

| Köprü | Hedef |
|---|---|
| **Kargo & Desi Hesaplayıcı Oluştur (saas-builder)** | `/tezgah?tool=saas-builder` + `widget=cargo` + parça adı / W×H×D ön-dolgu |
| **Pazaryeri Kataloğuna Ekle (pazaryeri)** | `/tezgah?tool=pazaryeri` + ürün satırı (ölçü + malzeme) |

**Dosya:** `lib/tezgah/pro/technical-drawing-bridges.ts` · UI: `pro-studio-preview.tsx`

### 9.4 Testler

`tests/tezgah/technical-drawing-station.test.ts` — 4 test:

1. 3 görünüş + `depthMm` geometrisi + XSS (`<script>`) engeli  
2. Geçerli `.dxf` (`SECTION`/`ENTITIES`/`EOF`) + `.pdf` (`%PDF-`) + zip 4 dosya  
3. Arşiv zarfı özet değil; çekmeceden svg/dxf/pdf yeniden kurulum  
4. `saas-builder` / `pazaryeri` köprüleri + `sandbox=""` mühürü  

### 9.5 Puan gerekçesi (technical-drawing 62 → ~89)

| Eksen | Kazanç | Not |
|---|---|---|
| 3 görünüş + derinlik geometrisi (F2.6) | +12 | Yan/üst + ölçü okları |
| DXF/PDF/ZIP üretim paketi | +8 | CAD + teknik föy + desi |
| Arşiv Y3/K2 | +4 | Özet → gerçek zarf + çekmece indirme |
| Çapraz köprü (F2.1) | +3 | → saas-builder desi + → pazaryeri |
| XSS / sandbox | 0 | gevşetilmedi |

Kalan ~11 puan: kesit/delik geometrisi, DWG, otomatik parça listesi BOM, CNC takım yolu henüz yok.

### 9.6 Dokunulan dosya özeti (Masa 7)

**Yeni:** `technical-drawing-export.ts`, `technical-drawing-bridges.ts`, `tests/tezgah/technical-drawing-station.test.ts`

**Güncellenen:** `technical-drawing.ts`, `build.ts`, `catalog.ts`, `pro-studio-preview.tsx`, `workbench.tsx`, `output-portfolio.tsx`, `pro-studio.test.ts`, bu rapor.

---

## 10. Masa 8 — `saas-builder` (bu tur)

Tespit §2.8 (**68 / 100**), §3.6 **Y3**, §4.4 **F2.7** / **F2.1**, **K2** arşiv uyumu.

### 10.1 F2.7 — 8 iş aracı + feature → kod yönlendirme

| Önce | Sonra |
|---|---|
| 4 sabit widget (`cargo` / `order` / `counter` / `api`) | **8 mikro-SaaS:** `cargo`, `margin`, `quote`, `order`, `booking`, `counter`, `faq`, `api` |
| `feature` yalnız kurulum rehberinde | `feature` HTML (`data-saas-feature` + etiketler), `widget.js` (`FEATURE=…`) ve `App.jsx` (`JSON.stringify`) içine gömülür |
| Şablon elle seçilirdi | Kullanıcı bileşeni açıkça değiştirmediyse `guessSaasWidgetFromFeature` anahtar kelimelerden seçer |

**Dosyalar:** `lib/tezgah/pro/options.ts`, `saas-builder.ts`, `catalog.ts`, `components/tezgah/workbench.tsx`

### 10.2 Y3 & K2 — arşive asıl kod zarfı

| Önce | Sonra |
|---|---|
| `outputContent = markdown` (tek satır özet) | `saas-builder-v1` JSON zarfı (`html`, `widgetJs`, `reactJsx`, `guide`) |
| Çekmeceden yeniden açılamıyordu | Canlı önizleme (`sandbox="allow-scripts"`) + `.html` / `.jsx` / `mini-saas.zip` indirme |

**Dosyalar:** `lib/tezgah/pro/build.ts`, `workbench.tsx`, `output-portfolio.tsx`

### 10.3 Çoklu kod sekmesi + zip

Önizlemede **HTML (`index.html`)**, **Gömülebilir JS (`widget.js`)**, **React (`App.jsx`)** sekmeleri; tek tıkla kopya; `mini-saas.zip` (5 dosya).

**Dosya:** `components/tezgah/pro-studio-preview.tsx`

### 10.4 F2.1 — Çapraz köprüler

| Köprü | Hedef |
|---|---|
| **Dijital Dükkan Vitrinine Geç (dukkan)** | `/tezgah?tool=dukkan` + başlık / özellik / hizmet özeti ön-dolgulu |
| **E-Ticaret Mağaza Kokpitini Aç** | `/panel/e-ticaret` |

**Dosya:** `lib/tezgah/pro/saas-builder-bridges.ts` · UI: `pro-studio-preview.tsx`

### 10.5 Güvenlik mühürleri (gevşetilmedi)

- Kullanıcı metni: `escapeHtml` (HTML) / `JSON.stringify` (JS/React)
- `readApiUrl`: yalnız `https:`, kimlik bilgisiz, ≤300 karakter (`http://` / `javascript:` reddedilir)
- Önizleme iframe: `sandbox="allow-scripts"` (same-origin yok)

### 10.6 Testler

`tests/tezgah/saas-builder-station.test.ts` — 4 test:

1. 8 widget + `feature` yönlendirme + otomatik şablon seçici  
2. XSS (`<script>`) + güvensiz URL engeli  
3. `saas-builder-v1` arşiv zarfı + çekmeceden `.zip`/`.html`/`.jsx`  
4. `dukkan` / E-Ticaret köprüleri + kod sekmeleri  

### 10.7 Puan gerekçesi (saas-builder 68 → ~89)

| Eksen | Kazanç | Not |
|---|---|---|
| 8 iş aracı kataloğu (F2.7) | +8 | Marj / fiyat / randevu / SSS eklendi |
| feature → çalışan kod | +6 | Rehberden çıktıya; otomatik şablon seçici |
| Arşiv Y3/K2 | +4 | Özet → tam zarf + çekmece indirme |
| Kod sekmeleri + zip UX | +2 | HTML/JS/React + mini-saas.zip |
| Çapraz köprü (F2.1) | +1 | → dukkan (ön-dolgulu) + → e-ticaret |
| XSS / URL / sandbox | 0 | gevşetilmedi |

Kalan ~11 puan: LLM+kod hibrid serbest bileşen (F2.7 tam Sandpack/StackBlitz), sunucu tarafı persistence / backend API, React canlı sandbox çalıştırma henüz yok.

### 10.8 Dokunulan dosya özeti (Masa 8)

**Yeni:** `saas-builder-bridges.ts`, `tests/tezgah/saas-builder-station.test.ts`

**Güncellenen:** `options.ts`, `saas-builder.ts`, `build.ts`, `catalog.ts`, `pro-studio-preview.tsx`, `workbench.tsx`, `output-portfolio.tsx`, `pro-studio.test.ts`, bu rapor.

---

## 11. Sonraki önerilen sıra (modül geneli)

1. K3/Y7 — Pro/kredi iade simetrisi  
2. F2.1 — `tetkik → dukkan → reklam` tek Job kimliği  
3. F2.4 devam — pazaryeri API yükleme / görsel-desi alanları / 50 ürün  
4. F2.7 devam — LLM iskelet seçici + React sandbox çalıştırma  

---

## 12. Tekrar üretilebilir doğrulama

```bash
npx tsc --noEmit
npm run verify:sen-axis
npm run verify:boundaries
npm run verify:api-auth -- --check
npm run verify:rls-status
npm run verify:no-secrets
npx vitest run tests/tezgah
npx next build
```

---

## 13. AI Tezgâh Modülü Genel Final Puan Kartı (61 → 88+ / 100 — 8 Masanın Tam Karşılaştırması)

Tespit §1.2 genel **61 / 100** idi. Sekiz masanın tedavi turları tamamlandı; modül geneli **≈ 88 / 100**.

### 13.1 8 masa — tespit → tedavi

| # | Masa | Tespit | Tedavi | Δ | Birincil kazanç |
|---|---|---|---|---|---|
| 1 | `proposal` | **58** | **≈ 82** | +24 | Para kalkanı + DOCX/PDF + Idempotency + CV/Hibe |
| 2 | `tetkik` | **78** | **≈ 92** | +14 | Snippet mühür + PDF + reklam handoff + TTL |
| 3 | `dukkan` | **72** | **≈ 89** | +17 | Dürüst mühür + 12 sektör + zip + köprü |
| 4 | `reklam` | **60** | **≈ 88** | +28 | A/B + Ads CSV + DOCX/PDF + bütçe mühürü |
| 5 | `pazaryeri` | **66** | **≈ 88** | +22 | 25 ürün + fiyat/stok + Master SKU + köprü |
| 6 | `studio-photo` | **38** | **≈ 86** | +48 | Gerçek `generateImage` + PNG/ZIP + standart |
| 7 | `technical-drawing` | **62** | **≈ 89** | +27 | 3 görünüş + DXF/PDF/ZIP + Y3 arşiv |
| 8 | `saas-builder` | **68** | **≈ 89** | +21 | 8 araç + feature→kod + Y3 + köprü |
| | **Ortalama (masa)** | **≈ 62.8** | **≈ 87.9** | **+25** | |

### 13.2 Modül eksenleri (tespit §1.2 → final)

| Eksen | Ağırlık | Tespit | Final | Ağırlıklı final | Not |
|---|---|---|---|---|---|
| Mimari hazırlık | %25 | 17 / 25 | **22 / 25** | 22.0 | Y3 arşiv mühürleri; K1 Idempotency; RLS/auth/sınır kapıları yeşil. K3 iade simetrisi bilinçli sonraki faz. |
| Mevcut işlevsellik | %30 | 18 / 30 | **27 / 30** | 27.0 | 8/8 masa yapısal teslimat (DOCX/PDF/HTML/CSV/SVG/DXF/PNG/ZIP). Arşiv yeniden açılır. |
| Ticari farklılaşma | %25 | 14 / 25 | **21 / 25** | 21.0 | Tetkik ölçüm + dükkan mühür + Ads CSV + desi/DXF + 8 mikro-SaaS. Job zinciri / canlı host sonraki faz. |
| UX / Vitrin | %20 | 12 / 20 | **18 / 20** | 18.0 | Kod sekmeleri, çekmece indirme, çapraz köprüler, dürüst uyarılar. Streaming / gözlemlenebilirlik kalan. |
| **TOPLAM** | **100** | **61** | — | **≈ 88 / 100** | |

### 13.3 Tek cümlelik final teşhis

> AI Tezgâh, tespit günündeki “çok iyi korunmuş metin atölyesi”nden **sekiz masanın her birinde indirilebilir yapısal teslimat + arşivden yeniden kurulum + çapraz köprü** taşıyan dürüst bir iş istasyonuna çıktı; kalan puan (≈12) bilerek sonraki faza bırakıldı: tek Job kimliği, Pro iade simetrisi, canlı yayın hostu ve LLM+sandbox serbest bileşen.
