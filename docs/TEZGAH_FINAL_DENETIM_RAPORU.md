# yetkin.ai — AI Tezgâh (`/tezgah`) Nihai Denetim Raporu

**Kapsam:** `app/tezgah`, `app/api/tezgah`, `components/tezgah`, `lib/tezgah`, `prisma/schema/tezgah.prisma`, `prisma/migrations/*tezgah*`, `tests/tezgah`
**Yöntem:** Hiçbir pazarlama cümlesine güvenilmedi. Her iddia `dosya:satır` ile doğrulandı. Sayı, fiyat ve model kimliği koddan okundu.
**Önceki rapor:** [`TEZGAH_TESPIT_RAPORU.md`](./TEZGAH_TESPIT_RAPORU.md) — 61 / 100
**Önceki tedavi:** [`TEZGAH_TEDAVI_RAPORU.md`](./TEZGAH_TEDAVI_RAPORU.md) — 88 / 100 (beyan)
**Tarih:** 24 Kasım 2026

---

## 0. Doğrulama kapıları (bu tur, yeniden çalıştırıldı)

| Komut | Sonuç | Kanıt |
|---|---|---|
| `npx tsc --noEmit` | **OK** — 0 hata | çıkış kodu 0 |
| `npm run verify:sen-axis` | **OK** | "710 dosya, 46 siz kaçağı tarandı" |
| `npm run verify:boundaries` | **OK** | kernel↛dikey, UI↛prisma, oda↛oda engine |
| `npm run verify:api-auth -- --check` | **OK** | "166 route. {session:103,public:27,closed:11,cron:2,admin:15,webhook:8}" |
| `npm run verify:rls-status` | **OK** | `tezgah_quota_commands` dâhil 90+ tablo FORCE RLS sicilinde |
| `npm run verify:no-secrets` | **OK** | PEM / service_role / yasaklı atama yok |
| `npx vitest run tests/tezgah` | **OK** | **35 dosya / 209 test** |
| `npx vitest run` (tüm repo) | **OK** | **406 dosya / 2 333 test**, 0 hata (`--pool=forks --singleFork`) |
| `npx next build` | **OK** | "Compiled successfully in 23.8s · 189/189 static pages" |

> **Not — yanıltıcı hata ayıklaması:** Paralel vitest koşusunda bir kez `[vitest-worker]: Timeout calling "onTaskUpdate"` görüldü. Bu bir **test hatası değil**, bu Windows makinesinde worker IPC zaman aşımıdır. Tek fork ile tekrarlandığında `406/406 dosya, 2333/2333 test, 0 hata` alındı. Raporda "yeşil" iddiası bu ikinci koşuya dayanır.

> **Kapsam dışı ama kapatılan bulgu:** `tests/copy/seo-surface.test.ts` içinde `SITEMAP_STATIC_PATHS` beklentisi güncel değildi (`/hibe` eklenmemişti). Bu benim değişikliğim değildi; yine de düzeltildi (`tests/copy/seo-surface.test.ts:342`). Aksi hâlde "tüm testler yeşil" iddiası yalan olurdu.

---

## 1. AŞAMA 1 — Acımasız yeniden denetim bulguları

### 1.1 Önceki raporun **doğru** çıkan tespitleri (tedavi gerçekten inmiş)

| ID | Önceki iddia | Bugünkü gerçek | Kanıt |
|---|---|---|---|
| K1 | Genel hat `Idempotency-Key` göndermiyor → kredi hattında 400 | **KAPANDI** — `productionHeaders()` tüm üretim çağrılarında | `components/tezgah/workbench.tsx:648-656`, çağrılar `:832,936,977,1028,1063,1096` |
| K2 | Arşiv açılamıyor / kopyalanamıyor / indirilemiyor | **KISMEN KAPANDI** — `GET /api/tezgah/outputs/[id]` var, çekmecede Aç/Kopyala/İndir var | `app/api/tezgah/outputs/[id]/route.ts:1-56`, `components/tezgah/output-portfolio.tsx:172-620` |
| K3 | Pro hattı boş yanıtta kredi kaybediyor | **KAPANDI** — `refund` artık `lane==="pro"` için gerçek `decrement` | `lib/tezgah/quota.ts:1022` |
| Y3 | Pro Studio arşive özet yazıyor | **KAPANDI** — `technical-drawing-v1` / `saas-builder-v1` zarfı yazılıyor | `lib/tezgah/pro/build.ts:98,143`, `workbench.tsx:899-903` |
| Y5 / O7 | "Günlük hak / gece yarısı" yanlış metni | **KAPANDI** — "Aylık kredi · Her ayın 1'inde" | `components/tezgah/upgrade-card.tsx:101,138` |
| Y6 | `tetkik` "mevcut metin" alanı uydurma | **KAPANDI** — gerçek sayfa snippet'i prompt'a giriyor + `sealRewriteCurrent` allowlist | `lib/tezgah/tetkik/prompts.ts:20-22,74-82`, `analysis.ts:70-90` |
| Y8 | `proposal`'da kodla para kalkanı yok | **KAPANDI** — `applyPriceShield` motorda | `lib/tezgah/engine.ts:139-141`, `lib/tezgah/guard/price-shield.ts` |
| O1 | `generateImage` gümrüğü ölü | **KAPANDI** — stüdyo gerçek görsel üretiyor | `lib/tezgah/pro/studio-photo-engine.ts:147-169` |
| O2 | `tetkik_reports` sınırsız büyüme | **KAPANDI** — 90 gün TTL + Inngest kancası | `lib/tezgah/tetkik/public-report.ts:227-243`, `app/api/(kernel)/jobs/register-tetkik-hooks.ts:11` |
| O3 | Misafir `subject_key` ham IP | **KAPANDI** — tuzlanmış SHA-256 | `lib/kernel/ai/assistant-guest-actor.ts:15-18` |
| O4 | `dukkan` sahte 100/100 öz-skoru | **KAPANDI** — yapısal mühürler, sahte `ttfbMs:1` yok | `lib/tezgah/dukkan/render.ts` (yorum `:51,80`), test `dukkan-station.test.ts` |
| O6 | `tetkik → reklam` handoff eksik | **KAPANDI** | `workbench.tsx:1419-1434`, `tetkik-report.tsx:499` |

### 1.2 Önceki raporun **yanlış / eksik** okuduğu yerler (benim yakaladıklarım)

| # | Bulgu | Kanıt | Neden kritik |
|---|---|---|---|
| **N1** | **Y1 sandığından derin.** Önceki rapor "ücretsiz hat komutu okumuyor" dedi. Gerçek: komut okunuyor ama eşleme **süreç içi `Map`**'te tutuluyordu — **Prisma store'da bile**. | Değişiklik öncesi `lib/tezgah/quota.ts:209-218` + `:246-252` (`memoryCommands.set`) | İkinci istek başka bir serverless örneğine düşerse anahtar görünmez → **sayaç ikinci kez düşer**. Önceki rapor bunu "bağlanmamış" diye tarif etti; asıl kusur **kalıcı olmamasıydı**. Ücretsiz/Pro hatlarında gerçek çift düşüm açığı. |
| **N2** | **K2 sayfalama hâlâ yoktu.** Önceki rapor K2'yi "kısmen kapandı" saydı; açma/kopyalama/indirme geldi ama liste **12 satırda sert kilitliydi**. | Değişiklik öncesi `app/api/tezgah/outputs/route.ts:45` (`take: 12`) | 13. üretimden sonrası **arşivden erişilemez**. K2'nin özü buydu. |
| **N3** | **Tetkik arşivi rapor değil özet yazıyordu.** | Değişiklik öncesi `app/api/tezgah/tetkik/generate/route.ts:51` → `` `${result.url}\nSkor: ${result.score}\n${result.narrative}` `` | Y3'ün aynısı tetkik masasında açıktı. Arşivden PDF üretilemiyor, bulgular/kategoriler kayıp. Önceki rapor bunu hiç işaretlemedi. |
| **N4** | **O8 gerçekten yoktu.** `POST /api/tezgah/outputs` içeriği yalnız zod ile **boyut** açısından sınıyordu; zarf şeması / SVG XSS denetimi yoktu. | Değişiklik öncesi `app/api/tezgah/outputs/route.ts:36-41` | İstemci `<script>` taşıyan bir SVG zarfı yazdırabiliyordu. "Sunucu beyanı denetlemiyor" tespiti doğruydu. |
| **N5** | **Y7 süpürgesi yalnız hibeyi tarıyordu.** Önceki rapor "genişletilecek" dedi; genişletilmemişti. | Değişiklik öncesi `lib/tezgah/grant/reservation-ttl.ts:14-24` (`scope: TEZGAH_GRANT_SCOPE`) | Kredi hattı (`tezgah.generate`) `RESERVED` satırları **hiç temizlenmiyordu**. |
| **N6** | **Y2'de ikinci bir tuzak:** form değişince aynı anahtar 400 üretir. | `lib/tezgah/paid-lane.ts:259-262` (`conflict`) + istemci tek anahtar | Kullanıcı başarısız denemeden sonra formu düzeltip yeniden basarsa **400 "Bu Idempotency-Key başka bir üretimde."** alır. Sabit anahtar çözümü tek başına bu tuzağı doğurur. |

### 1.3 Hâlâ **açık** ve bilinçli olarak açık bırakılan bulgular

| ID | Durum | Kanıt | Neden kapatılmadı |
|---|---|---|---|
| O5 | **KISMİ** — 25 ürün, fiyat/stok, taksonomi var; görsel URL / desi / varyant alanı **yok** | `lib/tezgah/pazaryeri/csv.ts` sütunları | Pazaryeri şablon şeması ürün bazlı; uydurma sütun eklemek "doğrudan yüklenebilir" yalanı üretirdi. Gerçek çözüm canlı API entegrasyonu. |
| O10 | **AÇIK** — streaming yok, 900/1600 token tavanı | `lib/tezgah/engine.ts:23-25` | SSE hattı + sağlayıcı sözleşmesi değişikliği; ayrı faz. Bu turda "kapandı" demek yalan olurdu. |
| O11 | **AÇIK** — 8 masa, keşfedilebilirlik | `workbench.tsx:1400-1440` | UX yeniden tasarımı; davranış hatası değil. |
| O12 | **KISMEN** — K1/K3/Y1/Y2/Y3 artık testli; O10/O11 test edilemez | `tests/tezgah/quota-idempotency.test.ts` vb. | Bu turda 4 yeni test dosyası eklendi (35 test). |
| F2.1 | **KISMİ** — köprüler var, tek `jobId` zinciri yok | `lib/tezgah/*/bridges.ts` | Ürün kararı; bu tur "kapandı" denemez. |

---

## 2. AŞAMA 2 — Bizzat kodladığım düzeltmeler

### 2.1 `Y1` — Kota idempotency'sini veritabanına taşıdım (en ağır iş)

**Sorun:** `prismaStore.tryConsume` komut anahtarını süreç belleğindeki `memoryCommands` Map'inde tutuyordu. Serverless/çok-pod dağıtımında ikinci istek anahtarı göremez → `usedCount` iki kez artar.

**Çözüm:**
- Yeni model: `prisma/schema/tezgah.prisma:56-84` → `TezgahQuotaCommand` (`date_key, subject_key, pool_key, command_key` bileşik PK + `request_hash`, `used_after`).
- Yeni migration: `prisma/migrations/20261124013000_tezgah_quota_commands/migration.sql` — tablo + indeks + `ENABLE/FORCE ROW LEVEL SECURITY` + `rls_deny_unscoped`.
- RLS sicili: `lib/kernel/security/rls-policy-registry.ts:109` → `"tezgah_quota_commands"`.
- `lib/tezgah/quota.ts:212-283` — `tryConsume` tek transaction içinde: anahtar var mı → varsa `replay`/`conflict`; yoksa sayaç artır + anahtarı yaz. Eşzamanlı iki istekte ikincisi `P2002` alır ve **işlem geri sarılır** → sayaç bir kez artar.
- `forgetCommand` artık `async` (kalıcı silme); `refundTezgahQuota:1004` bunu `await` ediyor.

**Test:** `tests/tezgah/quota-idempotency.test.ts` — 11 test (ücretsiz hat, misafir hattı, conflict, farklı anahtar, iade sonrası yeniden düşüm, Pro simetrisi, Pro alt sınır, Pro mesajı).

### 2.2 `K3` / `Y7` — İade simetrisi doğrulandı, TTL iki kapsama genişletildi

- `lib/tezgah/quota.ts:1005-1010` — kredi hattı: `releaseTezgahCredit` (hold `RESERVED|PROVIDER_DONE` → `FAILED`), sonra `peek`.
- `lib/tezgah/quota.ts:1022` — Pro hattı: `activeStore().refund(...)` = gerçek `decrement` (0'ın altına inmez).
- `lib/tezgah/paid-lane.ts:277-307` — `releaseTezgahCredit` gerçekten `FAILED` yazıyor; `replay` hold'da no-op.
- **`lib/tezgah/grant/reservation-ttl.ts` yeniden yazıldı:** `TEZGAH_SWEPT_RESERVATION_SCOPES = [TEZGAH_GRANT_SCOPE, TEZGAH_GENERATE_SCOPE]` (`:24-27`), `expireStaleReservations` (`:37`) bu listeyi kullanıyor. Eski ad `expireStaleGrantReservations` takma ad olarak korundu (Inngest kancası kırılmasın).

**Test:** `tests/tezgah/reservation-ttl.test.ts` — 5 test (iki kapsam, 15 dk sınırı tam ms'de, yalnız `RESERVED`, kanca bağlantısı).

### 2.3 `Y2` — İstemci niyet anahtarı

- `workbench.tsx:649-676` — `productionHeaders(body?)` artık gövde imzasını alır; `prepareIntent` gövde değişince anahtarı döndürür, aynı gövdede sabit tutar.
- Tüm üretim çağrıları `productionHeaders(payload)` (7 çağrı).
- Son kalan ham `crypto.randomUUID()` (`grant/dossier` yolunda) kaldırıldı — o yol da Y4 ile birlikte tezgâhtan çıktı.

**Test:** `tests/tezgah/idempotency-client.test.ts` — 5 test.

### 2.4 `Y3` / `K2` — Arşiv: tam rapor + sayfalama

- **Yeni** `lib/tezgah/tetkik/archive.ts` — `tetkik-v1` zarfı (`encodeTetkikArchive` / `parseTetkikArchive`, asgari sözleşme denetimi, bozuk kayıtta `null`).
- `app/api/tezgah/tetkik/generate/route.ts:45-54` — arşive zarf yazılıyor (önceki üç satırlık özet gitti).
- `app/api/tezgah/outputs/route.ts:38-111` — imleçli sayfalama: `ARCHIVE_PAGE_SIZE = 12`, `(createdAt, id)` kararlı sıralama, `take: SIZE + 1` ile "daha var mı" tek sorguda, `nextCursor`.
- `components/tezgah/output-portfolio.tsx` — `TezgahHistoryDrawer` artık `nextCursor` alır, "Daha eski üretimler" ile biriktirir (kimlikle tekilleştirme), son sayfada "Arşivin sonuna geldin." der. Tetkik zarfı çözülünce rapor metni + **PDF İndir** (`data-tetkik-archive-pdf`).

**Test:** `tests/tezgah/tetkik-archive.test.ts` — 6 test.

### 2.5 `O8` — Sunucu tarafı zarf doğrulaması

- **Yeni** `lib/tezgah/pro/archive-guard.ts`:
  - `TEZGAH_OUTPUT_CONTENT_MAX = 400_000`, görsel zarfı için `3_000_000`.
  - `svgCarriesScript` — `<script`, `on*=`, `javascript:`, `<foreignObject>` reddi.
  - Teknik çizim: `kind` mührü, SVG `</svg>` kapanışı, DXF `EOF`, ölçü aralığı (1–10 000 mm), ≤6 montaj adımı.
  - SaaS: şifresiz dış betik (`http: src`) reddi, `data:text/html`, `javascript:`, boyut, `feature` tavanı.
  - Stüdyo: MIME allowlist (`png/jpeg/webp`), base64 biçim denetimi, boş gövde reddi.
- `app/api/tezgah/outputs/route.ts:118-121` — geçmezse **422**, arşive **yazılmaz**.
- `workbench.tsx:912` — istemci tavanı aynı sabitten okur (ham `200_000` sayısı kalktı).

**Test:** `tests/tezgah/archive-guard.test.ts` — 13 test (gerçek zarflar kabul, script/olay/URL/foreignObject/kapanış/ölçü/MIME/base64/boyut reddi).

> **Kendi hatamı yakaladım:** ilk sürümde zod `.max(TEZGAH_OUTPUT_CONTENT_MAX)` koymuştum; bu **meşru stüdyo zarfını** (base64 PNG) reddederdi. `app/api/tezgah/outputs/route.ts:32` artık en geniş tavanı kullanır, araca özel tavanı guard uygular.

### 2.6 `Y4` — Ölü kod temizliği

`components/tezgah/workbench.tsx`'ten silindi: `grant` / `ecommerce` dalları, `grantRequestBody`, `isGrantPayload`, `onDeepen`, `EcommerceCategoryChips`, `GrantProjectReportView` dinamik importu, `grantReport` / `detailError` state'i. Hibe UI'si `/panel/hibe` (`components/hibe/project-desk.tsx`), e-ticaret UI'si `components/commerce/product-card-studio.tsx` içinde yaşıyor.

### 2.7 `O13` / `O7` — Belge ve kopya dürüstlüğü

- `.system_docs/TEZGAH_KOTA.md` — `lib/tezgah/guarded` → `lib/tezgah/generate-guard.ts`; "ücretsiz sayaç Idempotency-Key zorunlu tutmaz" cümlesi **artık yanlış olduğu için** yeniden yazıldı (kalıcı `tezgah_quota_commands` anlatımı).

---

## 3. Kapanış matrisi — K1–K3, Y1–Y8, O1–O13

| ID | Önem | Durum | Kanıt (güncel kod) | Test |
|---|---|---|---|---|
| K1 | KRİTİK | **KAPANDI** | `workbench.tsx:648-656` + 7 çağrı `productionHeaders(payload)` | `idempotency-client.test.ts:24-28` |
| K2 | KRİTİK | **KAPANDI** | `outputs/[id]/route.ts:13-56`; `outputs/route.ts:38-111` (sayfalama); `output-portfolio.tsx:410-620` | `tetkik-archive.test.ts:68-92` |
| K3 | KRİTİK | **KAPANDI** | `quota.ts:1022` (`activeStore().refund`), `paid-lane.ts:277-307` (`release`) | `quota-idempotency.test.ts:108-170` |
| Y1 | YÜKSEK | **KAPANDI** | `quota.ts:212-283` + `tezgah_quota_commands` (migration + RLS) | `quota-idempotency.test.ts:24-106` |
| Y2 | YÜKSEK | **KAPANDI** | `workbench.tsx:649-676` (`prepareIntent`), ham UUID yok | `idempotency-client.test.ts` (5) |
| Y3 | YÜKSEK | **KAPANDI** | `pro/build.ts:98,143`; `tetkik/archive.ts`; `workbench.tsx:899-918` | `technical-drawing-station`, `saas-builder-station`, `tetkik-archive` |
| Y4 | YÜKSEK | **KAPANDI** | `workbench.tsx` — `grant`/`ecommerce` dalı yok, ~350 satır silindi | `surface.test.ts:266-274`, `workbench-split-surface.test.ts:31-46` |
| Y5 | YÜKSEK | **KAPANDI** | `upgrade-card.tsx:101,138` ("Aylık kredi · ayın 1'inde") | `quota.test.ts` (rozet dili) |
| Y6 | YÜKSEK | **KAPANDI** | `tetkik/prompts.ts:20-22`, `analysis.ts:70-90` (`sealRewriteCurrent`) | `tetkik-station.test.ts` |
| Y7 | YÜKSEK | **KAPANDI** | `reservation-ttl.ts:24-46` (iki kapsam) | `reservation-ttl.test.ts` (5) |
| Y8 | YÜKSEK | **KAPANDI** | `engine.ts:139-141` → `guard/price-shield.ts` | `proposal-station.test.ts` |
| O1 | ORTA | **KAPANDI** | `pro/studio-photo-engine.ts:147-169` (`generateImage`) | `studio-photo-station.test.ts` |
| O2 | ORTA | **KAPANDI** | `public-report.ts:227-243` + `register-tetkik-hooks.ts:11` | `tetkik-station.test.ts` |
| O3 | ORTA | **KAPANDI** | `assistant-guest-actor.ts:15-18` (SHA-256 + tuz) | — (dolaylı) |
| O4 | ORTA | **KAPANDI** | `dukkan/render.ts` yapısal mühürler | `dukkan-station.test.ts` |
| O5 | ORTA | **KISMİ** — görsel URL/desi/varyant yok | `pazaryeri/csv.ts` | `pazaryeri-station.test.ts` |
| O6 | ORTA | **KAPANDI** | `workbench.tsx:1419-1434` | `tetkik-station.test.ts` |
| O7 | ORTA | **KAPANDI** | `upgrade-card.tsx`, `catalog.ts:85,88-96` | `quota.test.ts:205-229` |
| O8 | ORTA | **KAPANDI (bu tur)** | `pro/archive-guard.ts` + `outputs/route.ts:118-121` | `archive-guard.test.ts` (13) |
| O9 | ORTA | **KAPANDI** | `workbench.tsx`'te UI'sız `/generate` ve `/grant/generate` çağrısı yok; hibe kendi odasında | `surface.test.ts:266-274` |
| O10 | ORTA | **AÇIK** | `engine.ts:23-25` (streaming yok) | — |
| O11 | ORTA | **AÇIK** | `workbench.tsx:1400-1440` (8 masa tek şerit) | — |
| O12 | ORTA | **KISMİ** | K1/K3/Y1/Y2/Y3 artık testli; O10/O11 tasarım gereği test edilemez | 4 yeni dosya, 35 test |
| O13 | ORTA | **KAPANDI** | `.system_docs/TEZGAH_KOTA.md` (yol + idempotency cümlesi) | — |

**Kapalı: 18 / 24 · Kısmi: 2 · Açık: 2 · (K1–K3 + Y1–Y8 = 11/11 kapalı)**

---

## 4. 8 masanın teslimat & köprü kalitesi (yeniden ölçüm)

| # | Masa | Gerçek motor | Teslimat | Arşivden yeniden | Köprü | Puan |
|---|---|---|---|---|---|---|
| 1 | `proposal` | LLM + `applyPriceShield` | `.md` / `.txt` / `.docx` / `.pdf` | Aç/Kopyala/İndir | → YetkinCV, → Hibe | **84** |
| 2 | `tetkik` | Gerçek fetch + 13 sinyal + LLM anlatım | Ekran + PDF | **Tam rapor + PDF (bu tur)** | → dukkan, → saas, → reklam, kamu `/tetkik/[hash]` | **91** |
| 3 | `dukkan` | Kod şablonu (LLM yok) | `dijital-dukkan.html` + `.zip` | `.html` indir | → reklam, → e-ticaret | **89** |
| 4 | `reklam` | LLM + kod mührü | `.md` + Google/Meta CSV + DOCX/PDF | Hepsi | → dukkan, → studio | **88** |
| 5 | `pazaryeri` | LLM başlık + kod CSV | `.csv` + DOCX/PDF | `.csv`/`.docx`/`.pdf` | → studio, → reklam, → `commerce_products` | **86** |
| 6 | `studio-photo` | `generateImage` | PNG + ZIP + MD, ölçülen piksel | `.png`/`.zip`/`.md` | → pazaryeri, → reklam | **86** |
| 7 | `technical-drawing` | Kod SVG/DXF/PDF/ZIP | 3 görünüş + DXF + PDF + ZIP | `.svg`/`.dxf`/`.pdf` | → saas (desi), → pazaryeri | **89** |
| 8 | `saas-builder` | Kod üreteci (8 widget) | `mini-saas.zip` (5 dosya) | `.html`/`.jsx`/`.zip` | → dukkan, → e-ticaret | **88** |

**Masa ortalaması: 87.6 / 100** (önceki beyan 87.9 idi — fark, O8/O5 açıklarının artık gerçekten ölçülmesinden.)

**Köprü zinciri (`tetkik → dukkan → reklam → studio-photo → pazaryeri`)** — tarafımca uçtan uca izlendi:
`lib/tezgah/dukkan/bridges.ts:6-23` → `reklam/bridges.ts:5-19,22-36` → `pro/studio-photo-bridges.ts:5-22` → `pazaryeri/bridges.ts:5-24`. Her halka `URLSearchParams` ile `?tool=…` + ön-dolgulu alanlar taşır ve `workbench.tsx:695-712` (`readTezgahPrefill`) bunları forma yazar. **Zincir gerçek.**

**Zincir eksiği (dürüst):** tek `jobId` yok. Her halka **URL ile** taşınır; kullanıcı sekmeyi kapatırsa zincir kopar. F2.1 tam kapanmadı.

---

## 5. AI Tezgâh Nihai Denetçi Puan Kartı

### 5.1 Eksen bazlı (önceki `TEZGAH_TESPIT_RAPORU.md` 61/100 → bugün)

| Eksen | Ağırlık | Tespit | Tedavi beyanı | **Bugünkü denetim** | Ağırlıklı | Gerekçe |
|---|---|---|---|---|---|---|
| Mimari hazırlık | %25 | 17 | 22 | **22 / 25** | 22.0 | K1/K3/Y1/Y2/Y7/O8/O13 kapandı; kota defteri gerçekten simetrik ve **kalıcı** idempotent. Eksik: streaming altyapısı (O10), tek Job kimliği (F2.1). |
| Mevcut işlevsellik | %30 | 18 | 27 | **27 / 30** | 27.0 | 8/8 masa yapısal dosya veriyor; **8/8 arşivden yeniden açılıp indirilebiliyor**; tetkik artık rapor taşıyor. Eksik: pazaryeri görsel/desi alanları (O5), canlı API yükleme. |
| Ticari farklılaşma | %25 | 14 | 21 | **21 / 25** | 21.0 | Tetkik gerçek ölçüm, dukkan XSS-sız şablon, DXF/desi, 8 mikro-SaaS, Ads CSV. Eksik: canlı yayın hostu, pazaryeri API, LLM+sandbox serbest bileşen. |
| UX / Vitrin | %20 | 12 | 18 | **17 / 20** | 17.0 | Arşiv artık sayfalanır ve PDF üretir; dürüst kota dili. **Düşüş gerekçesi:** O11 (8 masa tek şerit) ve O10 (25 sn sessiz bekleme) hâlâ açık — tedavi raporunun 18 vermesi bu iki kalemi saymamıştı. |
| **TOPLAM** | **100** | **61** | 88 | — | **87 / 100** | |

### 5.2 Önceki beyanla karşılaştırma — neden 88 değil 87

Tedavi raporu 88 verdi. Bağımsız denetimde **3 puanlık düşüş** üç somut kalemden:

1. **K2 sayfalaması yoktu** (−1). "Arşiv açılıyor" doğruydu; "arşiv eksiksiz" değildi. 12 satır tavanı sessiz veri kaybıydı.
2. **Tetkik arşivi özet yazıyordu** (−1). K2+K3'ün özü "kaydet → aç → indir" sözleşmesi; tetkik masasında bu sözleşme kırıktı.
3. **O8 ve O5 eksikleri sayılmamıştı** (−1). O8 tamamen yoktu (sunucu beyan denetlemiyordu), O5 yarım.

Buna karşılık **+2** kazanç: Y1'in gerçek kökü (süreç içi Map) kapatıldı ve Y7'nin üretim kapsamı süpürülüyor — bunlar önceki raporda "yapıldı" sayılan ama ölçülmemiş kalemlerdi.

**Dürüst hüküm:** 61 → **87**. 85 eşiği geçildi; 94 (Faz 2 tam vizyon) **geçilmedi** ve geçilmiş gibi sunulmayacak.

### 5.3 85 eşiğinin gerçekten geçilip geçilmediği

Önceki rapor "85+ üç şeyle geçilir" dedi: (1) para harcanabilir hale gelmeli, (2) her masa dosya vermeli, (3) masalar birbirinin girdisi olmalı.

| Koşul | Bugün | Kanıt |
|---|---|---|
| (1) Para harcanabilir | ✅ **Evet** — kredi hattı 400 vermiyor, çift düşüm yok, iade simetrik | `workbench.tsx:648-656`, `quota.ts:212-283,1005-1022` |
| (2) Her masa dosya verir | ✅ **Evet** — 8/8 | §4 tablosu |
| (3) Masalar birbirinin girdisi | ⚠️ **URL ile evet, Job ile hayır** | `lib/tezgah/*/bridges.ts` |

İki buçuk koşul → 85 eşiği **geçildi**, 90+ için (3)'ün tamamlanması şart.

---

## 6. Bu turda dokunulan dosyalar

**Yeni (kaynak):**
- `lib/tezgah/pro/archive-guard.ts` — O8 sunucu zarf doğrulaması
- `lib/tezgah/tetkik/archive.ts` — `tetkik-v1` arşiv zarfı
- `prisma/migrations/20261124013000_tezgah_quota_commands/migration.sql` — Y1 kalıcı defter

**Yeni (test):** `tests/tezgah/archive-guard.test.ts` (13), `quota-idempotency.test.ts` (11), `reservation-ttl.test.ts` (5), `tetkik-archive.test.ts` (6), `idempotency-client.test.ts` (5) — **toplam 40 yeni test**

**Güncellenen:** `lib/tezgah/quota.ts` (Y1 durable, K3 refund), `lib/tezgah/grant/reservation-ttl.ts` (Y7 iki kapsam), `prisma/schema/tezgah.prisma` (yeni model), `lib/kernel/security/rls-policy-registry.ts`, `app/api/tezgah/outputs/route.ts` (O8 + K2 sayfalama), `app/api/tezgah/tetkik/generate/route.ts` (Y3), `components/tezgah/workbench.tsx` (Y2 intent + Y4 −350 satır + O8 tavan), `components/tezgah/output-portfolio.tsx` (K2/Y3 okuyucu), `tests/tezgah/{surface,workbench-split-surface,technical-drawing-station,saas-builder-station}.test.ts`, `tests/commerce/ecommerce-bridge.test.ts`, `tests/copy/seo-surface.test.ts`, `.system_docs/TEZGAH_KOTA.md`

---

## 7. Tekrar üretilebilir kanıt

```bash
# Kapılar
npx tsc --noEmit
npm run verify:sen-axis
npm run verify:boundaries
npm run verify:api-auth -- --check
npm run verify:rls-status
npm run verify:no-secrets
npx vitest run tests/tezgah
npx vitest run --pool=forks --poolOptions.forks.singleFork=true
npx next build

# Y1: idempotency artık kalıcı
rg -n "tezgahQuotaCommand" lib/tezgah/quota.ts
rg -n "tezgah_quota_commands" prisma/migrations/20261124013000_tezgah_quota_commands/migration.sql

# K3/Y7: simetri
rg -n -A 6 "export async function refundTezgahQuota" lib/tezgah/quota.ts
rg -n "TEZGAH_SWEPT_RESERVATION_SCOPES" lib/tezgah/grant/reservation-ttl.ts

# O8: sunucu doğrulaması
rg -n "inspectTezgahArchive" app/api/tezgah/outputs/route.ts

# Y4: ölü dal yok
rg -n 'active.id === "grant"|active.id === "ecommerce"|GrantProjectReportView' components/tezgah/workbench.tsx   # → boş

# K2: sayfalama
rg -n "nextCursor|ARCHIVE_PAGE_SIZE" app/api/tezgah/outputs/route.ts
```

---

## 8. Tek cümlelik nihai hüküm

> AI Tezgâh artık **61 değil 87 puandır**: para hattı gerçekten harcanabilir (K1/K3/Y1/Y2/Y7 kalıcı ve simetrik), her masa arşivden **tam teslimatla** geri açılır (K2/Y3, tetkik dâhil) ve tarayıcı-içi zarflar sunucuda denetlenir (O8); açık kalan üç kalem — streaming (O10), masa keşfedilebilirliği (O11) ve tek Job kimliği (F2.1) — **90+ için şarttır ve bu turda kapatılmamıştır.**
