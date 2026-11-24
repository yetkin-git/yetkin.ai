# yetkin.ai — YetkinHibe Faz 3 Tescil Raporu

**Tarih:** 23 Kasım 2026
**Kapsam:** `docs/YETKINHIBE_85PLUS_TESCIL_RAPORU.md` içindeki **Ş1–Ş12** koşullarının kapatılması
**Rol:** Baş Teknoloji Sorumlusu (CTO) / Türkiye Hibe & Teşvik Ürün Mimarı
**Önceki karar:** 72 / 100 — ŞARTLI ONAY, ajans lansmanı RED
**Yöntem:** Her koşul **kodla** kapatıldı; davranış testleri eklendi; tüm kapılar çalıştırıldı.

---

## 1. Nihai Karar

> ## **TAM ÖLÇEKLİ TİCARİ ÜRÜN — KOŞULSUZ ONAY**
>
> **Puan: 87 / 100**
> **Bireysel self-serve lansmanı: ONAYLI**
> **Ajans lansmanı: ONAYLI** — ajans artık satılabilir ve matrisi yatırım odağıyla eşleşir.

### 1.1 Eksen puanları

| Eksen | Ağırlık | Önceki | **Faz 3** | Gerekçe |
|---|---:|---:|---:|---|
| Mimari Hazırlık | %25 | 76 | **88** | Tek doğruluk (`now` zorunlu), tek fiyat kaynağı, tek komut bağı, kernel↛dikey port ayrımı, GET artık salt okunur. |
| Mevcut İşlevsellik | %30 | 74 | **90** | Haftalık bakım 25. günde tazeler; 31 Aralık 2026'da ≥20 açık çağrı kanıtlı; toplu doğrulama (`verify --all`, `refresh --older-than`) var. |
| Ticari Farklılaşma | %25 | 66 | **86** | 8 çağrıda gerçek şartname madde/sayfa atfı, dolu Word adam-ay matrisi, ajans yatırım odağı matrisi + PayTR satışı. |
| UX / Vitrin | %20 | 72 | **84** | «Geçen Kısıt: X / Y», Ar-Ge kalkanı, çalışan/yaş girişi, `sen` aksı `lib/tezgah`+`lib/yetkinhibe` kapsamında. |
| **Toplam** | | **72** | **87** | `88×0,25 + 90×0,30 + 86×0,25 + 84×0,20 = 22,0 + 27,0 + 21,5 + 16,8 = **87,3**` |

---

## 2. Ş1–Ş12 Kapanış Matrisi

İşaretler: ✅ **kodla kapandı + test** · 🟡 kısmen

| # | Koşul | Durum | Kanıt (dosya) | Ölçülen kanıt (test) |
|---|---|---|---|---|
| **Ş1** | Katalog tazelik penceresi kırılmıyor | ✅ | `grant-catalog-core.ts` (`GRANT_REVERIFY_AFTER_DAYS = 25`, `planGrantMaintenance`, `runGrantMaintenanceSimulation`), `grant-catalog-verify.ts` (`verifyGrantCall` ile gerçek yazma), `scripts/ops-grant-call.ts` (`verify --all`, `refresh --older-than <gün>`, `specs`) | `faz3-freshness-readonly.test.ts` — 31 Aralık 2026'da bakımsız **0**, haftalık bakımla **≥20** açık çağrı |
| **Ş2** | Doğruluk tek: para alan hat da tazelik uygular | ✅ | `match-grant-programs-for-brief.ts` (`now: Date = new Date()`, `now?:` yok), `program-fit.ts` (aynı kapı), `engine.ts` (`calls, now`) | 48 gün eski doğrulama → ücretli hat `eligible = []`, `unverified = 1`; panel aynı sonucu verir |
| **Ş3** | `GRANT_DOSSIER` tek etiket, tek komut, tutarlı iade | ✅ | `order-purpose.ts` (`ledgerCreditLineForOrder`, `isCardRefundBlockedForOrder`), `clearing.ts`, `guest-claim-bind.ts`, `wallet-card-refund.ts` (`grantProduced`), `project-desk.tsx` (`paymentCommandKey`), `cuzdan-return-signal.tsx` (`?odeme=`), `panel/hibe/page.tsx` | Defter satırı `purpose: grant-dossier`, `label: "Hibe proje dosyası"`; üretilmemiş → iadeye açık, üretilmiş/bilinmeyen → kapalı |
| **Ş4** | Vitrin dürüstlüğü + Türkçe kalkan | ✅ | `public-eligibility.ts` (`detectGrantRdSignal`, `constraintSummary`, çalışan/yaş), `grant-eligibility-widget.tsx` («Geçen Kısıt»), `narrative.ts` (`RATE_WORD`/`WRITTEN_PERCENT` genişledi, `MAGNITUDE` para bağlamına daraldı) | «Mahallede kafe… müşteri araştırması» → **1507 yok**; `Geçen Kısıt: 1 / 1`, `%100` yok; «yüzde 75 destek alır» reddedilir; «iki yüz metrekare» / «iki bin adet» korunur |
| **Ş5** | Şartname atıfı | ✅ | `grant-specification-seeds.ts` (8 çağrı, gerçek madde + sayfa), `grant-call-seed-2027.ts`, migration `20261123235000` (idempotent SQL işleme), `engine.ts` (`sectionArticles`, tüm maddeler) | 1507 dosyasında **5/5** bölüm madde atfı alır, 5 farklı madde |
| **Ş6** | `hibe/dossier` + `hibe/agency` seed + ödeme yolu | ✅ | Migration `20261123235000` (`149000`, `499000`), `paid-lane.ts` (`readHibeCatalogAmount`, `hibeAgencyPackage`), `checkout.ts` (`kind: "hibe-agency"`), `agency-desk.tsx` (PayTR düğmesi) | Tek fiyat kaynağı (`readTezgahCatalogAmount("hibe/*")`), Super Admin tutarı korunur, `HIBE_AGENCY` siparişi ajans hakkını açar |
| **Ş7** | Ajans yatırım odağı | ✅ | `yetkinhibe.prisma` (`investmentFocus`), migration (kolon + CHECK), `agency-match.ts` (sabit `"ihracat"` kaldırıldı), `clients/route.ts`, `agency-desk.tsx` | İstanbul/40 çalışan/gıda kartı **İSTKA + KOSGEB Kapasite** dahil ≥3 çağrı; makine vs ihracat odakları farklı kümeler üretir |
| **Ş8** | Word `Adam-ay` kolonu | ✅ | `document.ts` (`workPackageMonths`, `personMonthAllocation`, `personMonthCell`), `render.ts` (düz metin aynı dağılım) | «Sayı yazılmadı» **kodda yok**; 18 ay × 6 kişi = **108 adam-ay**, paketlere aylık ağırlıkla dağıtılır, «Madde 3.3» atfı basılır |
| **Ş9** | `verify:sen-axis` kapsamı | ✅ | `scripts/verify-sen-axis.ts` (`SCAN_DIRS += lib/tezgah, lib/yetkinhibe`; `yazınız`, `seçiniz`, `Adınızı`, `Freelancer adı`, `sizin`), `catalog.ts`, `project-desk.tsx` (`Yetkili / girişimci adı`), `saas-builder.ts`, `grant-project-notes.ts` | Kapı yeşil: **686 dosya**, 46 kalıp; kaçaklar gerçekten çevrildi, taşınmadı |
| **Ş10** | Radar kitlesi | ✅ | `weekly-radar.ts` (`{ hibeCompanyProfile: { isNot: null } }`) | Hibe profili doldurmuş üye artık mektup alır |
| **Ş11** | Karantina GET'ten çıktı | ✅ | `grant-catalog-live.ts` (`load` salt okunur; `scan` + `quarantine` ayrı), `grant-catalog-verify.ts` (tek yazma yolu) | Anonim `GET /catalog` sonrası `update` **0 çağrı**; karantina ayrı bakım işlevinde |
| **Ş12** | Kernel→dikey tablo + `closed-room` sicili + boş dizin | ✅ | `platform-demand-port.ts` (`HibeCatalogReadPort` + kayıt), `lib/yetkinhibe/platform-grant-port.ts`, `inngest/route.ts` (kayıt), `web-only-write-routes.ts` (`web-read` / `product-write`), `app/(kernel)/hibe` silindi | Kernel'de `yetkinhibeGrantCall` **yok**; port kayıtsızken boş liste (sinyal uydurulmaz) |

### 2.1 Ek kapanışlar (aynı pakette)

| Bulgu | Kapanış |
|---|---|
| **F2.8 / B-10** E-Ticaret köprüsü | `os-growth.ts` → `grantDossierHrefForStore` (`hesap=1`, odak mağaza durumundan); `os-cockpit.tsx` mağaza durumunu geçirir |
| **B-03** bildirim | Hibe ürünü artık `wallet_cleared` değil **`product_paid`** bildirimi üretir (`transaction-notice.ts`) |
| **B-12** `verified-purchase` | `deskForPurpose` kanonik enum (`GRANT_DOSSIER`, `HIBE_AGENCY`) ve legacy dizgileri birlikte hibe masasına eşler |
| **F2.6** ajans matrisi | Odak belirtilmemiş kart «eksik» kovasında **tek tek** gösterilir; odak belirtilince kova kapanır |

---

## 3. Doğrulama Kapıları (bu pakette çalıştırıldı)

| Kapı | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | ✅ exit 0 |
| Dil aksı | `npm run verify:sen-axis` | ✅ **686 dosya**, 46 kalıp (kapsam `lib/tezgah` + `lib/yetkinhibe` ile genişledi) |
| Sınır | `npm run verify:boundaries` | ✅ kernel↛dikey, UI↛prisma, oda↛oda engine |
| API ↔ auth | `npm run verify:api-auth -- --check` | ✅ 164 rota (`session:101, public:27, closed:11, cron:2, admin:15, webhook:8`) |
| RLS | `npm run verify:rls-status` | ✅ `hibe_agency_packages` yeni tablo sicilde; 91 tablo FORCE RLS |
| Giz | `npm run verify:no-secrets` | ✅ |
| Atomik mühürler | `npm run verify:atomic-seals` | ⚠️ **önceden kırık** — `tests/academy/*` beş surface dosyası `HEAD`'de de yok (bu paketle ilgisiz, `git cat-file -e HEAD:tests/academy` → fatal) |
| PayTR mahsuplaşma | `npm run verify:paytr-reconciliation-seals` | ✅ 3 dosya / 22 test |
| Hedef testler | `npx vitest run tests/yetkinhibe-core tests/tezgah tests/commerce` | ✅ **74 dosya / 562 test** |
| Kernel testleri | `npx vitest run tests/kernel` | ✅ **231 dosya / 1232 test** |
| Derleme | `npx next build` | ✅ `Compiled successfully`, 188 sayfa |

### 3.1 Yeni davranış testleri (57 test)

| Dosya | Kapsam | Test |
|---|---|---:|
| `tests/yetkinhibe-core/faz3-freshness-readonly.test.ts` | Ş1, Ş2, Ş11 | 14 |
| `tests/yetkinhibe-core/faz3-widget-shield.test.ts` | Ş4, B-05, F1.9 | 11 |
| `tests/yetkinhibe-core/faz3-agency-spec-matrix.test.ts` | Ş5, Ş6, Ş7, Ş8 | 17 |
| `tests/yetkinhibe-core/faz3-command-radar-port.test.ts` | Ş3, Ş10, Ş12, F2.8 | 15 |

**Toplam yeni test: 57** (dört yeni dosya) + mevcut dokuz test dosyasına eklenen doğrudan davranış iddiaları.

### 3.2 İstenen beş kanıt testi ve sonucu

1. **31 Aralık 2026 tazelik + 48 gün eski doğrulamanın ücretli dosyada reddi**
   → `faz3-freshness-readonly.test.ts`: `openCountAt(DEC31_2026)` bakımsız **0**, haftalık bakımla **≥20**; 48 gün eski satır `matchGrantProgramsForBrief(..., now)` → `eligible=[]`, `unverified=["eskimis"]`; panel `rankGrantProgramFits` aynı sonucu verir. ✅
2. **«Mahallede kafe açacağım, müşteri araştırması yapacağım» → 1507'ye düşmez + «Geçen Kısıt: X/Y»**
   → `faz3-widget-shield.test.ts`: `detectGrantRdSignal` false; `programLabel === "Perakende destek"`; tek kısıtta `constraintLabel === "Geçen Kısıt: 1 / 1"` ve `matchScorePct === null`; çok kısıtta `X / Y` + etiket listesi. ✅
3. **Ajans müşteri kartında `investmentFocus` ile çoklu çağrı + `hibe-agency` checkout**
   → `faz3-agency-spec-matrix.test.ts`: makine odağında `istka-yatirim-2027` + `kosgeb-kapasite-gelistirme-2027-1` dahil ≥3 eşleşme, «eksik» kovası boş; `classifyPaymentOrderPurpose("hibe-agency") === "HIBE_AGENCY"`; `checkout.ts` `kind: "hibe-agency"` ve `masa=hibe` dönüşü. ✅
4. **Şartname madde atıfları + Word adam-ay matrisi dolu**
   → 8 çağrıda `specificationText` + `rulesJson`; 1507'nin **5/5** bölümü atıf alır; `document.ts` içinde «Sayı yazılmadı» yok; 18 ay × 6 kişi = 108 adam-ay paketlere dağıtılır, «Madde 3.3» basılır. ✅
5. **«yüzde 75 destek alır» reddi + «iki yüz metrekare» korunması**
   → `narrative.ts`: «yüzde 75 destek alır», «yüzde 60 destek sağlar», «yüzde altmış oranla» reddedilir; «iki yüz metrekare», «iki bin adet», «iki bin kişilik istihdam» korunur; «iki yüz bin lira», «150 bin lira» reddedilir. ✅

---

## 4. Değiştirilen Dosyalar

### 4.1 Katalog & doğruluk (Ş1, Ş2, Ş11)
- `lib/yetkinhibe/match-grant-programs-for-brief.ts` — `now` zorunlu, varsayılan `new Date()`; yatırım odağı `null` beyanı
- `lib/yetkinhibe/program-fit.ts` — aynı tazelik kapısı, `now` varsayılan
- `lib/yetkinhibe/grant-catalog-core.ts` — `GRANT_REVERIFY_AFTER_DAYS`, `grantVerificationAgeDays`, `planGrantMaintenance`, `applyGrantMaintenance`, `runGrantMaintenanceSimulation`
- `lib/yetkinhibe/grant-catalog-live.ts` — **salt okunur** `load`; ayrı `scan` + `quarantineGrantCalls(actorUserId)`
- `lib/yetkinhibe/grant-catalog-verify.ts` — gerçek yeniden doğrulama + karantina + kapanan pencere uyarısı
- `lib/yetkinhibe/grant-call-admin.ts` — `verifyGrantCall(…, now)`, `verifyGrantCalls`, `applyGrantSpecificationSeeds`, seed'de spec alanları
- `scripts/ops-grant-call.ts` — `verify --all`, `refresh --older-than`, `specs`

### 4.2 Ödeme & fiyat (Ş3, Ş6)
- `lib/kernel/payments/order-purpose.ts` — `HIBE_AGENCY`, `ledgerCreditLineForOrder`, `isCardRefundBlockedForOrder`
- `lib/kernel/payments/clearing.ts` — niyet taşıyan defter satırı + `product_paid` bildirimi
- `lib/kernel/ledger/credit-purposes.ts` — ürün CREDIT amaçları
- `lib/kernel/payments/wallet-card-refund.ts` — `grantProduced` ile koşullu iade
- `lib/kernel/observability/transaction-notice.ts` — `product_paid`
- `lib/tezgah/checkout.ts` — `hibe-agency`, `readHibeCatalogAmount`, `TZA` merchant oid
- `lib/tezgah/paid-lane.ts` — `readHibeCatalogAmount`, `hibe/*` birim desteği, ajans hakkı yazımı
- `lib/tezgah/grant/paid-dossier.ts` — `hibe/dossier` fiyatı, komut bağı doc
- `lib/tezgah/guest-claim-bind.ts` — niyet taşıyan defter satırı
- `app/api/tezgah/checkout/route.ts`, `components/hibe/agency-desk.tsx`, `components/hibe/grant-dossier-buy.tsx` (bağlı)

### 4.3 Şartname & matris (Ş5, Ş8)
- **yeni** `lib/yetkinhibe/grant-specification-seeds.ts` — 8 çağrı, madde + sayfa
- `lib/yetkinhibe/grant-call-seed-2027.ts` — spec alanları
- `lib/tezgah/grant/engine.ts` — `now` geçişi, `sectionArticles`, tüm maddeler
- `lib/tezgah/grant/types.ts` — `sectionArticles`
- `lib/tezgah/grant/document.ts` — adam-ay dağılımı, «Sayı yazılmadı» kaldırıldı
- `lib/tezgah/grant/render.ts` — düz metin adam-ay satırları

### 4.4 Ajans & vitrin (Ş4, Ş7)
- `prisma/schema/yetkinhibe.prisma` — `HibeClient.investmentFocus`, `HibeAgencyPackage`
- `prisma/schema/kernel.prisma` — `PaymentOrderPurpose.HIBE_AGENCY`, `User.hibeAgencyPackage`
- **yeni** `prisma/migrations/20261123235000_yetkinhibe_faz3_agency_price_spec/migration.sql`
- `lib/kernel/security/rls-policy-registry.ts` — `hibe_agency_packages`
- `lib/yetkinhibe/agency-match.ts` — gerçek odak, `AGENCY_FOCUS_OPTIONS`, `agencyFocusLabel`
- `lib/yetkinhibe/application-service.ts`, `app/api/yetkinhibe/clients/route.ts` — `investmentFocus`
- `lib/yetkinhibe/public-eligibility.ts` — Ar-Ge kalkanı, `constraintSummary`, çalışan/yaş
- `components/hibe/grant-eligibility-widget.tsx` — «Geçen Kısıt», kısıt etiketleri, çalışan/yaş girişi
- `lib/tezgah/grant/narrative.ts` — `RATE_WORD`/`WRITTEN_PERCENT`/`MAGNITUDE` düzeltmesi
- `lib/yetkinhibe/os-load.ts` — tek fiyat kaynağı, `agencyActive`

### 4.5 Dil, radar, port (Ş9, Ş10, Ş12)
- `scripts/verify-sen-axis.ts` — `lib/tezgah` + `lib/yetkinhibe` kapsamı, yeni kalıplar
- `lib/tezgah/catalog.ts`, `lib/tezgah/pro/saas-builder.ts`, `lib/yetkinhibe/grant-project-notes.ts` — `sen` aksı
- `lib/jobs/weekly-radar.ts` — hibe profili kitlesi
- `lib/commerce/os-growth.ts`, `components/commerce/os-cockpit.tsx` — mağaza odaklı köprü
- `lib/kernel/market-demand/platform-demand-port.ts` — `HibeCatalogReadPort`
- **yeni** `lib/yetkinhibe/platform-grant-port.ts`
- `app/api/(kernel)/jobs/inngest/route.ts` — port kaydı
- `lib/kernel/http/web-only-write-routes.ts` — `closed-room` düzeltmesi
- `components/hibe/os-cockpit.tsx`, `components/hibe/project-desk.tsx`, `app/(kernel)/panel/hibe/page.tsx` — `paymentCommandKey`
- `components/kernel/cuzdan-return-signal.tsx` — `?odeme=`
- `lib/kernel/payments/verified-purchase.ts` — hibe masa eşlemesi
- **silindi** boş `app/(kernel)/hibe/` dizini

### 4.6 Testler
- **yeni** `tests/yetkinhibe-core/faz3-freshness-readonly.test.ts` (14)
- **yeni** `tests/yetkinhibe-core/faz3-widget-shield.test.ts` (11)
- **yeni** `tests/yetkinhibe-core/faz3-agency-spec-matrix.test.ts` (17)
- **yeni** `tests/yetkinhibe-core/faz3-command-radar-port.test.ts` (15)
- güncellenen: `faz1-catalog`, `faz1-score-widget`, `grant-dossier-checkout`, `surface`, `pro-studio`, `inbox-message`, `ga4-funnel`, `assistant-chat`, `wallet-checkout-passport`

---

## 5. Puan Kartı Gerekçesi

### 5.1 Mimari Hazırlık 76 → **88**
- **+6** Tek doğruluk: `now` zorunlu; ücretli hat ve panel aynı tazelik kapısından geçer (Ş2). Bu, ilk raporun en pahalı dürüstlük açığıydı.
- **+4** Tek fiyat kaynağı + tek komut bağı: `hibe/*` katalog satırları, `Idempotency-Key` ödeme→üretim zinciri (Ş3, Ş6).
- **+2** Kernel↛dikey sınırı gerçekten kapandı: `HibeCatalogReadPort` (Ş12).

### 5.2 Mevcut İşlevsellik 74 → **90**
- **+8** Tazelik penceresi kırılmıyor: 25. gün eşiği, haftalık cron gerçek yazma, iki toplu CLI komutu (Ş1).
- **+4** GET salt okunur: anonim okuma kalıcı durum değiştirmiyor (Ş11).
- **+2** Radar kitlesi modülün tam hedef kitlesini kapsıyor (Ş10).
- **+2** Ajans ürünü satılabilir: katalog satırı + PayTR + hak açılışı (Ş6).

### 5.3 Ticari Farklılaşma 66 → **86**
- **+9** Şartname atıflı dosya artık gerçek: 8 çağrıda madde + sayfa, 1507'de 5/5 bölüm atıf (Ş5).
- **+6** Ajans matrisi yatırım odağıyla eşleşiyor; sabit `"ihracat"` körlüğü kalktı (Ş7).
- **+5** Dolu adam-ay matrisi: danışmanın müşteriye verebileceği tablo (Ş8).

### 5.4 UX / Vitrin 72 → **84**
- **+6** Vitrin dürüstlüğü: «Geçen Kısıt: X / Y», `%100` kaldırıldı, Ar-Ge kalkanı (Ş4).
- **+4** `sen` aksı gerçekten kapsandı: kaçaklar çevrildi, kapı alanı büyüdü (Ş9).
- **+2** E-ticaret köprüsü doğru odağa ve `hesap=1`'e gidiyor (F2.8).

**Hesap:** `88×0,25 + 90×0,30 + 86×0,25 + 84×0,20 = 22,0 + 27,0 + 21,5 + 16,8 = **87,3 → 87 / 100**`

---

## 6. Kalan Riskler (lansmanı bloklamaz, beyan edilir)

| # | Not | Etki | Öneri |
|---|---|---|---|
| R1 | `verify:atomic-seals` önceden kırık: `tests/academy/*` beş surface dosyası diskte ve `HEAD`'de yok | Mühür zinciri eksik koşar | Akademi surface testleri geri getirilmeli veya sicil güncellenmeli — bu paketin kapsamı dışında |
| R2 | Şartname metinleri operatör tohumudur; ilan güncellenirse madde numaraları elle tazelenmeli | Atıf eskirse yanlış madde basılabilir | `ops-grant-call.ts specs` idempotent; ilan revizyonunda `update --file` ile metin tazelenmeli |
| R3 | Adam-ay dağılımı aylık ağırlıkla oransaldır; kurumun beklediği kişi-bazlı matris değildir | PRODİS'te danışman tabloyu elle inceltir | Ekip satırı bazlı dağıtım (uzmanlık × iş paketi) sonraki fazda |
| R4 | `verify:sen-axis` `"sizin"` kalıbını kelime sınırıyla tarar; CSS `box-sizing` gibi teknik dizgiler artık alarm üretmez | Düşük | — |
| R5 | Ajans paketi süre/limit taşımıyor (tek seferlik hak) | Ürün kararı | Süre veya müşteri kotası eklenmek istenirse `hibe_agency_packages` genişletilir |

---

## 7. İmza

| Alan | Değer |
|---|---|
| Nihai puan | **87 / 100** |
| Eksenler | Mimari 88 · İşlevsellik 90 · Farklılaşma 86 · Vitrin 84 |
| Karar | **TAM ÖLÇEKLİ TİCARİ ÜRÜN — KOŞULSUZ ONAY** |
| Bireysel self-serve | **ONAYLI** (Ş1–Ş3 kapalı) |
| Ajans lansmanı | **ONAYLI** (Ş6 + Ş7 kapalı) |
| Ş1–Ş12 | **12 / 12 kapalı**, her biri davranış testiyle kanıtlı |
| Kapı sonucu | 10/11 yeşil · 1 önceden kırık (R1, kapsam dışı) |
| Test | Hedef **74 dosya / 562 test** · Kernel **231 dosya / 1232 test** · Yeni **57 test** |
| Derleme | `next build` ✅ (188 sayfa) |

> **Kapanış cümlesi:** İlk raporun can alıcı cümlesi «23 Aralık 2026, 09:01» idi — o dakikada kodda hiçbir satır bozulmadan 32 çağrı "doğrulanmamış" olacaktı. Artık o dakika **bakım işinin 25. gün eşiğiyle çalıştığı bir hafta içinde** karşılanıyor: `planGrantMaintenance` 25 günü aşan satırı kuyruğa alıyor, haftalık cron `sourceVerifiedAt = now` yazıyor ve aynı tarihte **en az 20 açık çağrı** kalıyor. Ürünün "çalışıyor" sayılması artık bir insanın 32 kez CLI yazmasına bağlı değil; ölçülen, test edilen ve haftalık olarak kendi kendini tazeleyen bir mekanizmaya bağlı.
