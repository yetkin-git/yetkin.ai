# MASTER PLAN TESPİT RAPORU 3
## Canlıya Çıkış (Go-Live) & Ticari Hazırlık Denetimi

| Alan | Değer |
|---|---|
| **Rapor Kimliği** | `docs/MASTER_PLAN_TESPIT_RAPORU3.md` |
| **Rol** | Ürün Mimarı (Product Architect) · B2B Ticari Stratejist (Growth & Monetization Lead) · Full-Stack Sistem Denetçisi |
| **Tarih** | 18 Kasım 2026 |
| **Kapsam** | Canlı kod tabanı (`app/`, `components/`, `lib/`, `prisma/`, `supabase/`, `packages/kernel/`, `proxy.ts`, `.system_docs/`), `yetkin_muze/`, `.env.example` |
| **Yöntem** | Statik kod envanteri + rota haritalama + göç (migration) okuma + **çalıştırılmış doğrulama** (aşağıdaki kapılar) + karşılaştırmalı regresyon analizi (`MASTER_PLAN_TESPIT_RAPORU.md`, 17 Kasım) |
| **Kural** | **Hiçbir kaynak dosya değiştirilmedi.** Yalnız okuma, doğrulama ve bu dosyanın yazımı. |
| **Kaynak kod değişikliği** | Yok (0 dosya). Yalnız `.tmp/` altında iki geçici ölçüm betiği çalıştırıldı. |

### Yürütülen doğrulama kapıları (bu oturumda gerçekten koşuldu)

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | **Temiz** (0 hata) |
| `npx vitest run` | **471 dosya / 2.411 test — hepsi geçti** (146 sn) |
| `npx tsx scripts/verify-api-auth.ts --check` | **OK — 130 rota** (`session:73 · public:24 · closed:11 · cron:2 · admin:12 · webhook:8`) |
| `npx tsx scripts/verify-rls-status.ts` | **OK — 65 tablo** FORCE RLS + kapsamsız deny |
| `npx tsx scripts/verify-boundaries.ts` | **OK** — kernel↛dikey, oda↛oda, katalog ON CONFLICT mühürü |
| RLS sicili ↔ Prisma @@map karşılaştırması | **65 = 65, sapma yok** |
| `.env.example` ↔ `process.env.*` karşılaştırması | **Kullanılan 108 anahtarın tamamı beyan edilmiş** (eksik yok) |

### Ölçülen baz (18 Kasım 2026)

| Boyut | İlk rapor (17 Kasım) | **Bugün** | Değişim |
|---|---|---|---|
| Sayfa (`page.tsx`) | 59 | **70** | +11 |
| API rotası (`route.ts`) | 117 | **130** | +13 |
| `lib/**/*.ts` | 1.092 | **1.132** | +40 |
| Bileşen (`.tsx`) | 249 | **267** | +18 |
| Prisma tablosu | 57 | **65** | +8 |
| Test dosyası / test | 519 / — | **471 / 2.411** | test hacmi korunmuş |
| Prisma göçü | — | **66** (`prisma/migrations`) + **16** (`supabase/migrations`) | |

---

## 0. Yönetici Özeti — Tek Sayfada Gerçek

> **Proje, 17 Kasım'daki "steril kurs sitesi + tezgâh" halinden gerçekten koptu.** Beş sütunlu bir işletim sistemi kuruldu: E-Ticaret OS, YetkinHibe OS (90 günlük hazırlık planı motoruyla), AI Tezgâh (ücretli hattı açık), YetkinCV & Kariyer, Kurumsal İlan & Ağırlıklı Eleme. Fiyat sayfası var. Katalog satırları tohumlanmış. Tezgâh kotası bellekte değil **veritabanında**. AI maliyeti **`recordUsage: true`** ile deftere yazılıyor. İlk raporun üç kritik deliği (fiyat sayfası yok · `commerce:monthly` satırı yok · tezgâh kotası bellekte) **üçü de kapanmış**. Bu, üç günde yapılmış ciddi bir mimari iş.

> **Ama canlıya çıkışı bugün bloke eden üç somut kusur var ve ikisi tek satırlık:**
>
> 1. **`/api/kurumsal/ilanlar` üretimde HTTP 410 dönüyor.** `kurumsal` donmuş oda listesinde olduğu için `isFrozenRoomApi()` bu API'yi de yutuyor. Sayfa yolu muaf, API yolu **muaf değil**. Doğrudan çağrıyla doğrulandı: `GET` ve `POST` → `410 "Bu oda üretimde kapalı."` Bu, bu turun amiral modülünü (**Ağırlıklı Aday Eleme**) tamamen ölü bırakıyor. Kurumsal müşteri ilan açamıyor.
> 2. **Akademi 410, ama kod tabanı hâlâ 20'den fazla yerde `/academy/...` bağlantısı üretiyor.** En kritiği: **her tezgâh çıktısının altındaki "Bu Yetkinliği Sınavla Mühürle →" düğmesi** (`tezgahSealPath`, 10 aracın 10'u) 410'a gidiyor. Ayrıca `/pasaport`, kariyer damga defteri, kamu rozet kartı ve PayTR dönüş paneli.
> 3. **Doğrulanmış Rozet döngüsü yapısal olarak ölü.** `/uzmanlar` dizini yalnız `academy_certificates` + `career_visa_stamps(ACADEMY_CERTIFICATE)` okuyor. Akademi kapandığı için **yeni sertifika üretilemiyor** → dizin sonsuza kadar boş → k-anonimlik eşiği (k≥5) hiç açılmıyor. Oysa `/career` içinde **çalışan bir ikame var: `yetkin_cv_seals`**. Rozet vaadi buraya bağlanmalı.
>
> **Tek cümlelik hüküm:** *Mimari ve güvenlik sınıfının üstünde; ticari vitrin büyük ölçüde kurulmuş; ama iki kenar kapısı yanlış yere bakıyor ve bu yüzden ürünün en yeni sütunu ile en eski büyüme döngüsü aynı anda kapalı.*

**Genel Skor: 60 / 100 · Karar: KOŞULLU ONAY (2 blokaj + 1 ticari çelişki kapatıldıktan sonra GO)**

---

# BÖLÜM 1 — Mimari & Ürün Dönüşümü Karşılaştırması

## 1.1 Beş Sütunlu İşletim Sistemi — gerçekten var mı?

Beş sütunun tamamı **kodda mevcut ve çalışır durumda**. Aşağıdaki tablo her sütunun gerçek sınırını (kim görebilir, ne satıyor, hangi motor) gösteriyor.

| # | Sütun | Yol | Kenar kararı | Oturum | Gelir rayı | Durum |
|---|---|---|---|---|---|---|
| 1 | **E-Ticaret OS** | `/e-ticaret` (+ `/magazam/[storeId]/{urunler,stok,kanallar,lisans}`) | `auth-307` → `/login` | **Zorunlu** | `commerce:monthly` **₺1.490/ay** (tohumlu) · `commerce:agency` ₺7.900 | **Açık**, kokpit gerçek |
| 2 | **YetkinHibe OS** | `/hibe` (4 sekme: `analiz · programlar · proje · arsiv`) | `auth-307` → `/login` | **Zorunlu** | `tezgah:grant-dossier` **₺1.490** (tekil) | **Açık**, 90 günlük plan motoru bağlı |
| 3 | **AI Tezgâh** | `/tezgah` | `next` (anonim) | Opsiyonel | `tezgah:pro` **₺590/ay** · `tezgah:credit-pack` **₺190 / 10 üretim** | **Açık**, tek anonim değer yüzeyi |
| 4 | **YetkinCV & Kariyer** | `/career` (+ `/vize/[id]`, `/uzmanlar`) | `next` (anonim) | Opsiyonel | `career:yetkincv-exam` **₺290** (katalogda var, **kasası yok**) | **Açık**, motor çalışıyor |
| 5 | **Kurumsal İlan & Eleme** | `/kurumsal` + `/kurumsal/ilanlar` + `/ilan/[slug]` | `next` / `next` / `next` | Opsiyonel | `kurumsal:job-screening-pack` **₺2.900** (katalogda var, **kasası yok**) | **KISMEN KIRIK** — sayfa açık, yazma API'si 410 |

### 1.1.1 Sütunlar arası entegrasyon (çift yönlü döngüler)

| Döngü | Kodda var mı? | Kanıt | Değerlendirme |
|---|---|---|---|
| **Tezgâh → Portföy → Kariyer** | **EVET** | `components/tezgah/output-portfolio.tsx` → `POST /api/career/portfolio` → `career_portfolio_items` → `/vize/[id]` | Gerçek ve çalışıyor. İlk raporun KF-2 önerisi uygulanmış. |
| **Tezgâh → E-Ticaret** | **EVET** | `components/tezgah/ecommerce-draft-transfer.tsx`, `tezgahRelocatedOsHref()` (`tool=ecommerce` → `/e-ticaret?sekme=havuz`) | Çalışıyor. |
| **Tezgâh → YetkinHibe** | **EVET** | `tezgahRelocatedOsHref()` (`tool=grant` → `/hibe?sekme=proje`), `master-sku-transfer.tsx` | Çalışıyor. |
| **Hibe → Tezgâh** | **EVET** | `components/hibe/project-desk.tsx` → `/api/tezgah/grant/dossier` (₺1.490, PaidCommand + DEBIT) | Çalışıyor; ücretli hat gerçek. |
| **E-Ticaret → Hibe** | **EVET** | `os-cockpit.tsx:867` `grantDossierHref(storeName)` | Mağaza adı hibe dosyasına ön dolgu olarak geçiyor. |
| **Kurumsal İlan → Aday (YetkinCV)** | **EVET (okuma)** | `lib/career/job-match-load.ts` → `kurumsal_job_postings` + `yetkin_cv_seals` eşleşmesi | Aday tarafı çalışıyor. **İlan açma tarafı 410 (bkz. Bölüm 4 / K-1).** |
| **YetkinCV → Rozet → Uzmanlar** | **HAYIR** | `/uzmanlar` yalnız `academy_certificates` okur; `yetkin_cv_seals` okunmaz | **Kopuk.** Bkz. K-3. |
| **Haftalık Fırsat Radarı** | **EVET** | `lib/kernel/jobs/inngest.ts:492` `weeklyOpportunityRadar`, cron `0 9 * * 1` | KF-3 uygulanmış. Hedef kitle koşulu `tezgahOutputs|certificates|commerceStores` — sertifika kolu ölü. |

### 1.1.2 Kapalı odaların (HTTP 410) durumu

`lib/dronlar/kayit.ts` + `lib/kernel/compliance/circuit-breakers.ts` ile ölçülen gerçek durum:

| Oda | Yol | `kapali` | Kenar sonucu | Not |
|---|---|---|---|---|
| `dashboard` | `/dashboard` | false | `next` (kamu vitrin) | ✅ |
| **`academy`** | `/academy` | **true** | **410** | **Bilinçli kapatma** (kullanıcı kararı: beğenilmeyen iş + BTK Akademi rekabeti). Ama 20+ bağlantı hâlâ buraya gidiyor. |
| `career` | `/career` | false | `next` (kamu vitrin) | ✅ |
| `freelancer` | `/freelancer` | true (+ `MARKETPLACE_SPLIT_LIVE=false` üçlü kilit) | **410** | ✅ Doğru karar, A2 korunuyor. |
| `tezgah` | `/tezgah` | false | `next` | ✅ |
| `junior` | `/junior` | false (`DRON_JUNIOR_ROOM_OPEN` boş) | `next` (vitrine) — kasa izin listesinde | ⚠️ Sıfır gelir, yüksek bakım. |
| `young` | `/young` | true | **410** | ✅ |
| `yetkinhibe` | `/hibe` | false | **`auth-307`** | ⚠️ Oturum zorunlu (vitrin değil) |
| Donmuş disk | `/studio · /devlabs · /kurumsal/* · /arena · /yetkinilan · /social` | — | **410** | `kurumsal` ve `kurumsal/ilanlar` muaf; **API muaf değil** |

**Doğrulama:** `decideEdgeAction(p, false)` canlı çalıştırıldı → `/academy`, `/academy/02_ecommerce_ai`, `/academy/01_office_ai/seviye`, `/academy/dogrula` hepsi `frozen-410`.

### 1.1.3 Navigasyon tutarlılığı — **kısmen tutarsız**

| Sorun | Kanıt | Etki |
|---|---|---|
| **Header'da E-Ticaret ve Hibe yok** | `components/shell/header-bar.tsx` yalnız `Uzmanlar · Kurumsal · Fiyatlar` basıyor | İki ana sütun header'dan erişilemiyor; yalnız sidebar'da (`sidebar-nav.tsx` `yetkinhibe` + `COMMERCE_NAV`), sidebar ise oturum gerektiren kabukta. |
| **Ana sayfadaki 3 kahraman düğmesinden 2'si `/login`'e düşüyor** | `app/(public)/page.tsx:66-72` → `/tezgah` ✅ · `/e-ticaret` ❌ · `/hibe` ❌ | Ziyaretçi, H1'de okuduğu iki ürünü **göremiyor**. |
| **`tracks` kartlarının 2'si `/login`'e düşüyor** | `lib/copy/sen-voice/public.ts` `tracks[]` → E-Ticaret, YetkinHibe | Aynı sorun ikinci kez. |
| **`Uzmanlar` dizini kalıcı boş** | `talent-directory-load.ts` yalnız `academyCertificate` okur | Navigasyonda vaat var, içerik yok. |
| **Kapanan oda adı hâlâ "Akademi" olarak sidebar'da** | `kayit.ts` `academy` satırı `vitrin: true` | `isKapali` true olduğu için `VERTICAL_ROOMS`'tan düşer → sidebar'da görünmez. ✅ Doğru davranış. |

---

## 1.2 Anayasa A1–A5 & Güvenlik Denetimi

### 1.2.1 RLS / FORCE RLS ve göç bütünlüğü — **sınıfının üstünde**

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Prisma tablosu sayısı | **65** | `prisma/schema/*.prisma` (11 dosya) `@@map` taraması |
| `RLS_FORCE_TABLES` sicili | **65** | `lib/kernel/security/rls-policy-registry.ts` |
| Sicil ↔ şema sapması | **0** | Betikle karşılaştırıldı: `model missing RLS: []`, `RLS extra: []` |
| `verify:rls-status` | **OK** | 65 tablonun tamamı FORCE + `rls_deny_unscoped` |
| Yeni tablolar (bu tur) | **8/8 FORCE** | `tezgah_outputs`, `tetkik_reports`, `tezgah_daily_quotas`, `tezgah_subscriptions`, `tezgah_credit_balances`, `kurumsal_offer_requests`, `weekly_radar_deliveries`, `kurumsal_job_postings`, `kurumsal_job_applications`, `yetkin_cv_sittings`, `yetkin_cv_seals` — hepsinde `ENABLE` + `FORCE` + `DROP/CREATE POLICY rls_deny_unscoped` |
| CREATE TABLE otomatik mühürü | **Var** | `supabase/migrations/20260814020000…` event trigger `yetkin_auto_enable_rls_on_create` — yeni tablo doğar doğmaz FORCE RLS alır |
| PostgREST yazma yasağı | **Var** | `POSTGREST_WRITE_POLICY_FORBIDDEN = true`; INSERT/UPDATE/DELETE politikası üretilmiyor |
| `tezgah_outputs` sahiplik politikası | **Ekstra titiz** | `tezgah_outputs_select_own / insert_own / update_own / delete_own` + kapsamsız deny |

**Değerlendirme:** RLS disiplini ilk rapordan bu yana **gevşememiş, güçlenmiş**. Migration bütünlüğü korunmuş; 11 yeni göçün tamamı kendi RLS'ini getiriyor.

### 1.2.2 Dürüst yüzey kuralları — A5 denetimi

| Kural | Durum | Kanıt / Aykırı örnek |
|---|---|---|
| **Sahte veri / sahte ilan yok** | **KORUNMUŞ** | `kurumsal_ilan_eleme` göçü yorumu: *"Sahte şirket, sahte ilan ve sahte aday INSERT edilmez. `test_score` boş doğar."* `/ilan/[slug]` bulunamazsa "Sahte ilan basılmaz." basıyor. `tezgah_outputs` misafire yazılmıyor (`userId: input.guest ? null : …`). |
| **Dinamik katalog fiyatları (A1)** | **KORUNMUŞ ve güçlendirilmiş** | Tutar **hiçbir yerde kod sabiti değil**. `lib/pricing/public-vitrine.ts` + `showcase-price.ts` `PriceCatalogEntry` okur; satır yoksa `"Yakında / Katalogda Açılıyor"` veya `"Ön Talep"` basılır, **uydurma tutar yazılmaz**. `20261118160000_launch_price_catalog` tohumu `updated_by IS NOT NULL` ise **ezmiyor**; her açılış `price_catalog_decision_ledger`'a `ADMIN_MANUAL` + gerekçe yazıyor. `verify:boundaries` bunu ayrıca mühürlüyor. |
| **SHA-256 doğrulama mührü** | **KORUNMUŞ** | `yetkin_cv_seals.certificate_hash` UNIQUE + `cv_digest`; `/vize/[id]` `parseSha256Hex` ile biçim doğrular, oturum istemez; `passportAcademyVerifyHref` geçersiz hex'te `null` döner (uydurma bağ yok). `sealYetkinCvSitting` puanı **akademi sınav motoruyla çapraz doğrular** — uyuşmazsa mühür basmaz. CV metni tabloda tutulmuyor (yalnız digest + sinyaller). |
| **Token / maliyet kontrolü** | **KISMEN DÜZELMİŞ** | İlk raporun R2 bulgusu: 12 yüzeyde `recordUsage: false`. Bugün: **`false` yalnız 4 yerde** (`social-generate.ts` ×2, `assistant-chat.ts`, `dispute-engine.ts`, `junior/service.ts:1135`). Tezgâhın **7 sunucu aracının tamamı `true`**: `tezgah/engine.ts:117`, `grant/engine.ts:325`, `reklam/engine.ts:124`, `pazaryeri/engine.ts:211`, `tetkik/engine.ts:187`, `career/coach.ts:113,162`, `commerce/os-service.ts:498`. **Ücretli hattın birim ekonomisi ölçülebilir hale geldi.** |
| **Kota kalıcılığı** | **DÜZELMİŞ** | İlk raporun R1 bulgusu (`Map` bellekte) kapandı: `lib/tezgah/quota.ts` artık `tezgah_daily_quotas` tablosu + `$transaction` + `updateMany({ usedCount: { lt: limit } })` atomik tüketim + unique violation yakalama. Bellek deposu **yalnız test** (`NODE_ENV=test || VITEST`). |
| **Katalog kapatma dürüstlüğü** | **KORUNMUŞ** | Satır yoksa: `readCommerceMonthlyAmount → null` → `placeCommerceSubscriptionOrder` 422; `generatePaidGrantDossier` 422 `TEZGAH_GRANT_DOSSIER_CLOSED`; `peekTezgahQuota` `TEZGAH_CATALOG_CLOSED_MESSAGE` basıyor. Fail-closed. |

### 1.2.3 A5 ihlali: **tek SKU, üç farklı hikâye**

Bu, raporun en ciddi **ticari dürüstlük** bulgusudur.

| SKU | `/fiyatlandirma` ne diyor? | `/kurumsal` ne diyor? | Gerçek |
|---|---|---|---|
| `academy:team-seat` ₺4.900 | "Ön Talep / Kurumsal Başvuru" (`honesty: "planned"`) | **`data-price-honesty="live"` + "4.900"** | Katalog satırı **aktif**; kasası **yok** |
| `commerce:agency` ₺7.900 | "Ön Talep" (`planned`) | **`live` + "7.900"** | Katalog satırı **aktif**; kasası **yok** |
| `kurumsal:job-screening-pack` ₺2.900 | "Ön Talep" (`planned`) | **`live` + "2.900"** | Katalog satırı **aktif**; kasası **yok**, üstelik entitlement kapısı da yok |
| `career:yetkincv-exam` ₺290 | "Ön Talep" (`planned`) | **`live`** (`loadKurumsalOfferPrices`) | Katalog satırı **aktif**; sınav **tamamen ücretsiz ve sınırsız** |

**Sonuç:** Aynı anda (a) "bu paketler ön taleptir, karttan çekilmez" ve (b) "canlı tutar şu" deniyor. Üçüncü olarak sınav ücretsiz çalışıyor. **A5 (Dürüst Kapalı Yüzey) ihlali.** Düzeltmesi kod değil, karar: ya kasa bağlanır (o zaman `live` doğru olur), ya `honesty: "planned"` üç yüzeyde birden basılır.

---

# BÖLÜM 2 — Ticari Hazırlık (Monetization & Conversion) Puanlaması

## 2.0 Skor tablosu

| Boyut | Ağırlık | Puan | Gerekçe (kısa) |
|---|---|---|---|
| **A. Değer önerisi & vitrinde netlik (5 saniye)** | 25 | **15** | H1 artık tek cümle ("E-Ticaret ve YetkinHibe. İki işletim sistemi, tek hesap.") ✅ · `/fiyatlandirma` var ✅ · ama 3 kahraman CTA'nın 2'si login duvarı ❌ · `₺1.490` iki farklı SKU'da tekrar ❌ |
| **B. Müşteri kazanım & büyüme döngüleri** | 25 | **14** | Tezgâh anonim + kalıcı ✅ · Hibe widget ana sayfada, LLM'siz ✅ · Tetkik kamuya açık kalıcı rapor ✅ · Rozet→Uzmanlar döngüsü **yapısal ölü** ❌ · Misafir e-posta yakalama **yok** ❌ |
| **C. Ödeme, tahsilat & katalog bütünlüğü** | 25 | **14** | PayTR 3DS + idempotency + append-only defter + karar defteri: **fintech kalitesi** ✅ · 8 SKU tohumlu ✅ · **4 SKU'nun kasası yok** (₺15.600) ❌ · Ödeme dönüşü yanlış sayfaya düşüyor ❌ |
| **D. Güven, dürüstlük & güvenlik (A1–A5)** | 25 | **17** | RLS 65/65 FORCE ✅ · `AmountMinor` + ledger immutability ✅ · SSRF/CSP/origin guard ✅ · 2.411 test yeşil ✅ · A5 SKU çelişkisi ❌ · 20+ ölü `/academy` bağı ❌ |
| **GENEL** | **100** | **60** | **"Motor 9/10, vitrin 7/10, vitrinin kapıları 4/10."** |

---

## 2.1 Değer Önerisi & Vitrinde Netlik

### 2.1.1 5 saniye testi — **kısmen geçti, ama tıklama testinde düşüyor**

Ana sayfa H1 (`lib/copy/sen-voice/public.ts:7`):

> **"E-Ticaret ve YetkinHibe. İki işletim sistemi, tek hesap."**

Bu, 17 Kasım'daki *"Yetkinliğini Mühürle. Yapay Zekâ Tezgâhıyla Üret. Rozet, Plan ve Canlı Vitrin."* cümlesinden **çok daha iyi**: tek cümle, iki ürün, tek hesap. ✅

**Ama ziyaretçi H1'de okuduğu iki ürünü tıklayınca göremiyor:**

```
[1] H1: "E-Ticaret ve YetkinHibe"
     │
     ├─ Düğme 1: "AI Tezgâhını Ücretsiz Dene (Kayıtsız)"  → /tezgah   ✅ ANONİM DEĞER
     ├─ Düğme 2: "E-Ticaret İşletim Sistemi"              → /e-ticaret ❌ auth-307 → /login
     └─ Düğme 3: "YetkinHibe İşletim Sistemi"             → /hibe      ❌ auth-307 → /login
```

Doğrulandı: `decideEdgeAction("/e-ticaret", false)` = `{kind:"auth-307", to:"/login"}`, `decideEdgeAction("/hibe", false)` = aynı. `PROTECTED_KERNEL_PATHS` içinde ikisi de var.

Aynı sorun ikinci kez "beş işletim sistemi" kartlarında: 5 karttan **E-Ticaret** ve **YetkinHibe** login'e, **Uzmanlar** kalıcı boş sayfaya gidiyor. Yalnız **AI Tezgâh** ve **Kariyer** gerçek anonim değer veriyor.

**Tespit:** Vaat netleşti ama **kanıt hâlâ tek yüzeyde** (tezgâh). "İki işletim sistemi" diyen bir H1'in altında iki işletim sisteminin de kayıt duvarı arkasında olması, ilk raporun T1 bulgusunun **ürün adı değişerek tekrarı**.

### 2.1.2 `/fiyatlandirma` — var, dürüst, ama merdiven eksik

Sayfa `loadPublicPricingVitrine()` üzerinden **6 kart** basıyor; her kart `data-price-honesty` taşıyor:

| Kart | Vitrin tutarı | Honesty | Kasa |
|---|---|---|---|
| Ücretsiz Başlangıç | **₺0** | `live` | ✅ `/tezgah` |
| AI Tezgâh Pro | **₺590 / Ay** | `live` (satır tohumlu) | ✅ `POST /api/tezgah/checkout` |
| E-Ticaret İşletme Lisansı | **₺1.490 / Ay** | `live` | ✅ `POST /api/commerce/stores/[id]/subscription` |
| YetkinHibe Tam Proje Dosyası | **₺1.490** | `live` | ✅ `POST /api/tezgah/grant/dossier` |
| YetkinCV Uygulamalı Sınav | **"Ön Talep"** | `planned` | ❌ yok (oysa sınav ücretsiz çalışıyor) |
| Kurumsal & Ajans | **"Ön Talep"** | `planned` | ❌ yok (₺2.900 / ₺4.900 / ₺7.900 satılamıyor) |

**Kullanıcının listelediği merdiven** (₺0 · ₺290 · ₺590 · ₺1.490 · ₺2.900 · ₺4.900 · ₺7.900) katalogda **birebir mevcut** — bu iyi haber. Ama:

| Kusur | Ayrıntı |
|---|---|
| **₺1.490 çakışması** | `commerce:monthly` **ve** `tezgah:grant-dossier` aynı tutarda. Merdivende iki basamak tek sayıya düşüyor; alıcı "hangisi 1.490?" diye soruyor. Öneri: hibe dosyası ₺1.290 veya lisans ₺1.590. |
| **₺290 görünmüyor** | YetkinCV kartı "Ön Talep" basıyor, sayı yok. Merdivenin ikinci basamağı **görünmez**. |
| **₺2.900 / ₺4.900 / ₺7.900 görünmüyor** | Üçü tek "Kurumsal & Ajans Paketleri" kartında eritilmiş. Alıcı hangi paketin hangi fiyatı olduğunu göremiyor. |
| **Kredi paketi yok** | `tezgah:credit-pack` ₺190 / 10 üretim vitrine hiç girmemiş. Düşük bariyerli ilk nakit basamağı eksik. |

### 2.1.3 Sosyal kanıt ve sayısal kanıt

- **Sosyal kanıt:** Hâlâ **yok**. `testimonial|yorum|referans|müşteri` taraması `lib/copy/sen-voice/public.ts` içinde boş. Bu, canlıya çıkışta **en görünür eksik**.
- **Sayısal kanıt:** `/tezgah` meta açıklaması "Misafire günde 3 üretim" diyor — **gerçek** (`TEZGAH_GUEST_DAILY_LIMIT = 3`). ✅ Ama "N mühürlü ders" bandı hâlâ basılmıyor; artık gerekmiyor (Akademi kapandı), ama **"N üretim yapıldı · N tetkik raporu · N YetkinCV mührü"** gibi gerçek sayaçlar `tezgah_outputs`, `tetkik_reports`, `yetkin_cv_seals` tablolarından okunabilir.
- **Karşılaştırma (BTK Akademi):** Sayfada yok. Kullanıcının kendi notu bunu netleştiriyor: *"BTK Akademi ücretsiz eğitim veriyor, ücretsiz eğitim verenlere karşı rekabet anlamsız."* Bu artık bir **konumlandırma kararı** olmalı: *"Eğitim satmıyoruz; üretim ve işletim satıyoruz."* Sayfa bu cümleyi henüz kurmuyor.

---

## 2.2 Müşteri Kazanım & Büyüme Döngüleri (Growth Loops)

### 2.2.1 Ücretsiz araçlar → kayıt → ödeme hunisi

```
AŞAMA 0 — ANONİM (bugün gerçekten çalışıyor)
  ✅ AI Tezgâh          3 üretim/gün (misafir)   → DB kotası, çok-instance tutarlı
  ✅ Hibe Uygunluk      SINIRSIZ, LLM'siz, ana sayfada  → POST /api/tezgah/grant/match [public]
  ✅ Web Tetkik         SINIRSIZ, deterministik, kalıcı kamu raporu
                        → POST /api/tezgah/tetkik/publish [public] → /tetkik/[hash] (index:false, follow:true)
  ✅ Kariyer paneli     /career oturumsuz açılıyor (PublicCareerPanel)
  ❌ Seviye testi       YOK — Akademi kapandı, yerine bir şey konmadı
  ❌ E-posta yakalama   YOK — misafir çıktı yalnız tarayıcıda, buharlaşıyor

AŞAMA 1 — ÜCRETLİ ÇIKTI KÖPRÜSÜ
  ✅ Tezgâh Pro         ₺590/ay · katalogdan okunur · PayTR 3DS · Idempotency-Key
  ✅ 10 üretim kredisi  ₺190 · perCreditMinor 19 TL/üretim
  ✅ Hibe tam dosyası   ₺1.490 · PaidCommandReservation + defter DEBIT + DOCX

AŞAMA 2 — İŞLETİM LİSANSI
  ✅ E-Ticaret lisansı  ₺1.490/ay · 422 fail-closed · mağaza başına
  ❌ Ajans paketi       ₺7.900 · kasa yok
  ❌ Ekip rozeti        ₺4.900 · kasa yok
  ❌ Aday eleme         ₺2.900 · kasa yok + entitlement kapısı yok + API 410
```

### 2.2.2 Çift yönlü döngü testi: Birey ↔ Şirket

| Yön | Beklenen | Gerçek | Durum |
|---|---|---|---|
| **Birey → Şirket** (YetkinCV mührü → ilana başvuru → ağırlıklı puan) | Aday `/career`'de mührü alır, `/ilan/[slug]`'dan başvurur, işveren ağırlıklı puanı görür | `sealYetkinCvSitting` ✅ · `POST /api/ilan/[slug]/sinav` ✅ · `rankJobApplications` ✅ | **Çalışıyor** |
| **Şirket → Birey** (ilan aç → aday havuzu) | İşveren `/kurumsal`'da ilan açar | `POST /api/kurumsal/ilanlar` → **410** | **KIRIK** |
| **Şirket → Birey** (ağırlıklı eleme kokpiti) | `/kurumsal/ilanlar` kısa listeyi gösterir | Sayfa açılır ama `jobs` yalnız `GET /api/kurumsal/ilanlar` ile tazelenir → **410** | **KIRIK** |
| **Şirket → Hibe** (KOBİ uygunluk → 90 günlük plan → dosya) | `/kurumsal` → `/hibe?sekme=analiz` → plan → ₺1.490 dosya | `roadmap-cards.tsx` bağı ✅, `master-plan.ts` 3 aşama ✅, `paid-dossier.ts` ✅ | **Çalışıyor** (oturumlu) |
| **Birey → Şirket** (portföy → kamu kartı → işveren görür) | `tezgah_output` → "Kamu Portföyüme Ekle" → `/vize/[id]` | `output-portfolio.tsx` ✅, `career_portfolio_items` ✅ | **Çalışıyor** |

**Sonuç:** Döngünün **birey ayağı çalışıyor, şirket ayağı 410'a çarpıyor.** Yani "çift yönlü döngü" bugün **tek yönlü**.

### 2.2.3 Kalıcılık ve elde tutma (retention)

| Mekanizma | Durum | Kanıt |
|---|---|---|
| Tezgâh çıktısı kalıcı | **EVET (üye)** | `POST /api/tezgah/outputs` → `tezgah_outputs`; `TezgahHistoryDrawer` son 12 üretimi basıyor |
| Çıktı → portföy | **EVET** | `PortfolioAddButton` → `career_portfolio_items` → `/vize/[id]` |
| Çıktı → mühür köprüsü | **KIRIK** | `tezgahSealPath()` → `/academy/...` → 410 |
| Haftalık ritüel | **EVET** | `weeklyOpportunityRadar` (Pzt 09:00), `weekly_radar_deliveries` ile tekrar koruması |
| Bildirim | Kısmi | SMTP env'e bağlı; `NOTICE_SMTP_HOST` boşsa `ops.smtp.honest_skip` logu, mail gitmiyor |

### 2.2.4 Viral döngüler

| Döngü | Durum | Kanıt |
|---|---|---|
| **Teslimat filigranı (GL-1)** | **UYGULANMIŞ** | `lib/tezgah/delivery-signature.ts`; `dukkan/render.ts:135` HTML'e `https://yetkin.ai/tezgah` bağı; `pazaryeri/csv.ts:104` CSV sonuna `# ${TEZGAH_DELIVERY_SIGNATURE}` |
| **Rozet paylaşımı (GL-2)** | Kısmi | `components/career/seal-share-guides.tsx` WhatsApp + X + LinkedIn ✅; rozete özel `opengraph-image` **yok** |
| **Tetkik raporu paylaşımı (GL-3)** | **UYGULANMIŞ** | `tetkik_reports` + `/tetkik/[hash]` kalıcı kamu sayfası + `/tezgah` ve `/uzmanlar` CTA'ları |
| **Hibe → Uzman köprüsü (GL-4)** | Kısmi | Widget sonucu `/hibe`'ye gidiyor (login); `/uzmanlar` boş olduğu için uzman ayağı yok |
| **Sözlük SEO (GL-5)** | **UYGULANMIŞ** | `lib/copy/glossary.ts` **30 terim** + `/sozluk/[terim]` `generateStaticParams` + `Article` JSON-LD; sitemap'e giriyor |

---

## 2.3 Ödeme, Tahsilat ve Katalog Bütünlüğü

### 2.3.1 Sağlam olan (korunmalı)

| Alan | Kanıt |
|---|---|
| PayTR 3DS + iFrame | `lib/kernel/payments/paytr/checkout.ts` — `merchant_ok_url` normalize, `payment_amount` yalnız sınırda `.toFixed(2)` |
| Idempotency | `MerchantOid` SHA-256 türevi: `TZP/TZC` (tezgâh), `CM<storeId><digest>` (lisans); `paidCommandReservations.userId_scope_commandKey` UNIQUE |
| Defter | `appendLedgerEntry` + `yetkin_forbid_ledger_mutation()` trigger (append-only); `amount_minor > 0` CHECK; `Wallet.amount_minor >= 0` CHECK |
| Mutabakat | `paytrClearingScan` (*/30 dk), `ledgerReconciliationScan` (02:20), `paytr-reconcile` cron |
| Kanca kaydı | `registerPaytrValorLicenseHooks()` üç yerde: `webhooks/paytr`, `jobs/inngest`, `cron/paytr-reconcile` — serverless'ta her rota kendi örneğinde kaydediyor ✅ |
| Tezgâh ücretli hat | `beginTezgahCreditHold` (RESERVED) → `commitTezgahCredit` (kredi düş + DEBIT + SETTLED), replay'de ikinci tahsilat yok ✅ |
| Katalog mühürü | `verify:boundaries` "katalog ON CONFLICT Super Admin tutarını korur" ✅ |

### 2.3.2 Kırık / eksik adımlar

| # | Adım | Kusur | Şiddet |
|---|---|---|---|
| **P1** | **4 SKU'nun kasası yok** | `academy:team-seat` ₺4.900 · `commerce:agency` ₺7.900 · `kurumsal:job-screening-pack` ₺2.900 · `career:yetkincv-exam` ₺290 → **toplam ₺15.600 katalogda duruyor, hiçbiri tahsil edilemiyor.** Arama: bu dört `unitKey` için hiçbir `route.ts` `checkout / place…Order` çağırmıyor. | **YÜKSEK (gelir)** |
| **P2** | **Aday eleme entitlement kapısı yok** | `KURUMSAL_SCREENING_UNIT` sabiti **yalnız kendisi, fiyat etiketi ve katalog yazıcısı** tarafından okunuyor. `createKurumsalJobPosting` ücret/limit kontrolü yapmıyor. Yani kasa açılsa bile **hiçbir şey kilitlenmez**; bugün ise herkes sınırsız ücretsiz ilan açar (API 410 düzeltilirse). | **YÜKSEK** |
| **P3** | **YetkinCV sınavı sınırsız ücretsiz** | `POST /api/career/yetkincv` gövdesinde ödeme/entitlement kontrolü yok; `startYetkinCvSitting` doğrudan oturum açıyor. ₺290 katalog satırı ölü. | **ORTA (gelir kaçağı)** |
| **P4** | **Ödeme dönüşü yanlış sayfaya düşüyor** | Tezgâh ve Ticaret ödemeleri `buildPaytrMerchantBrowserReturnUrl()` → `/cuzdan` (cüzdan yükleme ekranı). Kullanıcı "Tezgâh Pro ₺590" ödeyip **"Cüzdan Yükleme"** ekranına düşüyor. `KasaReturnPanel` ise `ok` ise 3 sn sonra `/academy/<slug>` veya `/academy`'ye push ediyor → **410**. | **ORTA (algı)** |
| **P5** | **Hepsiburada webhook sırrı beyan edilmemiş** | `channel-webhook.ts:110` `COMMERCE_WEBHOOK_SECRET_${kind}` okuyor; `.env.example`'da yalnız `COMMERCE_WEBHOOK_SECRET_TRENDYOL` + `COMMERCE_OS_WEBHOOK_SECRET` var. HB için tek yol paylaşılan sır. | DÜŞÜK |
| **P6** | **`tezgah:pro` geri ödemesi yok** | Pro aylık; `wallet_card_refunds` yolu var ama abonelik iptali/iadesi akışı yok. | DÜŞÜK |

---

# BÖLÜM 3 — `yetkin_muze` ve Faz 2/3 Potansiyel Değerlendirmesi

## 3.1 Müzeden yeni sisteme kazandırılan varlıklar

| Elmas | Müze kaynağı | Canlı karşılığı | Durum |
|---|---|---|---|
| **E1 · Kamu fiyat vitrini** (dürüstlük etiketli) | `lib/pricing/public-pricing-vitrine.ts` | `lib/pricing/public-vitrine.ts` + `lib/pricing/showcase-price.ts` + `app/(public)/fiyatlandirma/page.tsx` | ✅ **KAZANDIRILDI** — `live/planned` etiketi birebir korunmuş, üstelik `PriceCatalogEntry`'ye bağlanmış (müzede statikti) |
| **E2 · Anonim hibe kancası** | `components/hibe/grant-idea-validator-widget.tsx` | `components/hibe/grant-eligibility-widget.tsx` — **ana sayfada**, `POST /api/tezgah/grant/match` [public], LLM yok | ✅ **KAZANDIRILDI** (müzeden daha iyi: gerçek doğrulanmış çağrı kataloğuna bağlı) |
| **E3 · Hazır iş kataloğu** | `lib/matchmaking/opportunity-pool.json` | `lib/matchmaking/opportunity-pool.json` (9.253 bayt) + `opportunity-pool.ts` → `lib/jobs/weekly-radar.ts` | ✅ **KAZANDIRILDI** (radarın yakıtı) |
| **E4 · SEO yüzey sicili** | `lib/seo/surface-routes.ts` | `lib/copy/guides.ts` (**15 rehber**) + `lib/copy/glossary.ts` (**30 terim**) + `app/sitemap.ts` | ✅ **KAZANDIRILDI** — 45 programatik sayfa; sitemap `generateStaticParams` ile besleniyor |
| **E5 · SWOT / Yol haritası** | `lib/career/swot-engine.ts`, `roadmap-engine.ts` | `lib/career/swot.ts` (4.795) + `roadmap.ts` (4.911) + `components/career/swot-roadmap-card.tsx` | ✅ **KAZANDIRILDI** — merit/passport bağı sökülmüş, `CareerEvidence` üzerinden çalışıyor |
| **E6 · Türkçe kopya / sözlük** | `lib/copy/platform-glossary.ts` (150+ terim) | `lib/copy/glossary.ts` — **30 terim** | ⚠️ **KISMİ** — 150'nin 30'u taşınmış |
| **E7 · Markalı e-posta HTML** | `templates/email-*.html` (3 × ~6,5 KB) | `lib/kernel/notice/` — **HTML şablonu yok**; `smtp.ts` `html` alanını destekliyor ama **hiçbir çağıran doldurmuyor** | ❌ **TAŞINMADI** |
| **E8 · k-anonimlik** | `lib/talent/k-anonymity.ts` | `lib/career/k-anonymity.ts` (`TALENT_DIRECTORY_K_MIN = 5`) + `talent-directory.ts` | ✅ **KAZANDIRILDI** (ama veri kaynağı ölü — bkz. K-3) |
| **E9 · Reklam blueprint** | `lib/studio/yetkin-ads/*` | `lib/tezgah/reklam/` (5 dosya: copy/engine/guard/prompts/schema) | ⚠️ **KISMİ** — metin üretimi var, **bütçe planı + kreatif paket yok** |
| **E10 · Kurumsal Beyin (RAG)** | `lib/kurumsal/*` (81 dosya) | — | ⏸️ **PLANLI ERTELEME** (doğru karar) |
| **D5 · Strateji runbook'ları** | `yetkin_muze/docs/03…12` | `.system_docs/OPS_RUNBOOK.md` ile çapraz | ➖ Okunmuş, kod olarak taşınmaz |

**Skor: 8 elmasın 6'sı tam, 2'si kısmi, 1'i taşınmadı.** İlk raporun "düşük efor / yüksek etki" matrisindeki **6 maddenin tamamı** hayata geçmiş. Bu, planın en başarılı kısmı.

### 3.1.1 Müzede kalması gerekenler — karar korunmuş mu?

| Yapı | Karar | Bugünkü durum |
|---|---|---|
| Studio peronları (522 dosya) | Taşınmayacak | ✅ Taşınmamış; `next.config.ts` `outputFileTracingExcludes`'ta `lib/studio/**` |
| DevLabs / Codex | Taşınmayacak | ✅ `lib/devlabs/**` hariç tutulmuş |
| Pazaryeri / ilan motoru | Taşınmayacak | ✅ `EIDS_PUBLIC_LISTING_LOCKED = true`, `/yetkinilan` 410 |
| Satranç / anket / lonca / tarım / arena / YetkinX | Taşınmayacak | ✅ Hiçbiri canlıda yok; `FROZEN_DISK_ROOM_CATALOG` içinde 410 |
| `lib/merit` paralel para | Taşınmayacak (A1 çelişkisi) | ✅ Yok |
| 248 modelli tek `schema.prisma` | Taşınmayacak | ✅ 11 modül dosyası, 65 tablo |
| `lib/junior` derinliği | Dondurulacak | ⚠️ Yeni özellik yazılmamış ama **kayıt defterinde `kapali: false`** ve `packages/junior-content` hâlâ `transpilePackages`'ta |

---

## 3.2 Faz 2 (ISO & Kalite Doküman Denetçisi) ve Faz 3 (Şirket Beyni) — ne zaman başlamalı?

Her iki modül `/kurumsal` sayfasında **dürüst ön talep** olarak duruyor (`components/kurumsal/roadmap-cards.tsx`); `KURUMSAL_OFFER_PACKAGES` içinde `iso-auditor` ve `company-brain` anahtarları var ve `POST /api/lead` bunları `kurumsal_offer_requests` tablosuna yazıyor. **Doğru kurgu.**

### 3.2.1 Faz 2 — ISO ve Kalite Doküman Denetçisi

| Alan | Değer |
|---|---|
| **Ne yapar** | Prosedür ve talimatlar arasındaki **revizyon çelişkisini** tarar. Deterministik çelişki motoru + LLM anlatımı. |
| **Teknik ön koşullar** | (a) Belge yükleme → R2 (`R2_BUCKET_NAME` env hazır) · (b) metin çıkarma (PDF/DOCX) · (c) revizyon grafiği + çelişki motoru · (d) `iso_documents` + `iso_findings` tablosu, **FORCE RLS zorunlu** · (e) tenant izolasyonu (şirket = `owner_user_id`) |
| **Efor** | **4–6 hafta** (1 geliştirici) |
| **Ne zaman başlamalı** | **Canlıya çıkış + 60–90 gün** |
| **Tetikleyici (biri yeterli)** | 1. `kurumsal_offer_requests` içinde `packageKey='iso-auditor'` **≥ 12 kayıt** 2. **≥ 3** ödeyen kurumsal hesap (ekip rozeti veya aday eleme) 3. Haftalık aktif KOBİ sayısı **≥ 20** |
| **Neden bu eşik** | Modülün değeri "dokümanım var" değil, "**200 sayfa prosedürüm var**" ön kabulüne bağlı. Bu ancak gerçek kurumsal müşteri geldikten sonra doğrulanır. Ön talep toplamadan yazmak = ikinci bir "beğenilmeyen iş". |
| **Satış fiyatı** | Yeni SKU: `kurumsal:iso-auditor` — tek seferlik denetim ₺4.900 + aylık izleme ₺990. **Kod sabiti değil, `PriceCatalogEntry`.** |
| **A5 riski** | Belge denetimi **"uygundur"** gibi bir uygunluk beyanı üretmemeli; yalnız **çelişki listesi** ve **eksik kanıt** üretmeli. Aksi halde üçüncü taraf sertifikasyon vaadi doğar. |

### 3.2.2 Faz 3 — Şirket Beyni (Toplantı & Karar Hafızası)

| Alan | Değer |
|---|---|
| **Ne yapar** | Toplantı kaydı/dökümünden yönetici özeti, alınan kararlar, kişi bazlı aksiyon. |
| **Teknik ön koşullar** | (a) vektör DB (pgvector) · (b) embedding hattı · (c) **çok kiracılı izolasyon** + RLS genişletmesi · (d) ses/video transkript (R2 + STT) · (e) `AiTokenUsage` maliyet defteri (var) · (f) KVKK: ses kaydı = **özel nitelikli veri değil ama yüksek riskli** → açık rıza + saklama süresi |
| **Efor** | **10–14 hafta** (ayrı ürün turu) |
| **Ne zaman başlamalı** | **Canlıya çıkış + 6 ay** |
| **Tetikleyici (hepsi gerekli)** | 1. MRR **≥ ₺50.000** 2. **≥ 5** kurumsal hesap, her biri ayda ≥ 10 toplantı 3. Faz 2 ISO modülü **yayında ve ödeyen müşterisi var** 4. Aylık AI maliyeti brüt marjın **%25'ini** geçmiyor (bugün ölçülebilir: `ai_token_usages`) |
| **Neden bu kadar geç** | Yüksek ARPU vaat ediyor ama **en yüksek hukuki yüzey**: toplantı kaydı, kişisel veri, üçüncü kişilerin sesi. Erken açmak, ürünün geri kalanını KVKK riskiyle rehin alır. |
| **Ara adım (öneri)** | Faz 3'ten önce **deterministik** bir "Karar Defteri" çıkarılabilir: toplantı notu **metin** olarak girilir, LLM kararları çıkarır, `kurumsal_decision_log` tablosuna yazılır. Ses/vektör yok → 2 hafta, düşük risk. Bu, "Şirket Beyni"nin satılabilir ilk yarısıdır. |

---

# BÖLÜM 4 — Kalan Riskler, Kırık Bağlantı ve Kör Nokta Tespiti

> **"Kritik engel bulunmadı" DENEMEZ.** İki blokaj ve bir düzine kör nokta tespit edildi.

## 4.1 BLOKAJLAR (canlıya çıkışı durduran)

### 🔴 K-1 · `/api/kurumsal/ilanlar` üretimde HTTP 410 — **Ağırlıklı Aday Eleme tamamen ölü**

| Alan | Değer |
|---|---|
| **Kanıt** | `isFrozenRoomApi()` çalıştırıldı → `/api/kurumsal/ilanlar` **`true`**. `decideEdgeApiAuth()` → `{kind:"deny", status:410, error:"Bu oda üretimde kapalı."}` (GET **ve** POST). |
| **Kök neden** | `FROZEN_DISK_ROOMS` içinde `"kurumsal"` var. `circuit-breakers.ts` **sayfa** yolunu muaf tutuyor (`isKurumsalSalesPage`, `isKurumsalOpsPage` → `false`), ama `edge-api-auth.ts` `isFrozenRoomApi()` içinde `FROZEN_SHELL_ROOM_IDS` döngüsü `/api/${id}` önekini **muafsız** 410 yapıyor. |
| **Etki** | `components/kurumsal/screening-cockpit.tsx:127` `POST /api/kurumsal/ilanlar` → 410. **İşveren ilan açamaz.** `/kurumsal/ilanlar` sayfası açılır ama `GET` de 410 olduğu için boş kalır. Bu turun amiral modülü canlıda **çalışmıyor**. |
| **Neden test yakalamadı** | `tests/kernel/circuit-breakers-surface.test.ts:60-62` yalnız **sayfa** yolunu (`isFrozenShellPagePath`) sınıyor. `isFrozenRoomApi("/api/kurumsal/…")` için tek bir assertion yok. `verify:api-auth --check` yalnız "rota → auth kind" haritasını karşılaştırıyor, **donmuş önek çakışmasını** değil. |
| **Düzeltme (1 dosya)** | `isFrozenRoomApi()` içine `isKurumsalSalesPage / isKurumsalOpsPage` muadili bir API muafiyeti: `path === "/api/kurumsal/ilanlar"` → atla. + `tests/kernel/edge-api-auth.test.ts`'e regresyon assertion'ı. |
| **Şiddet** | **BLOKAJ** |

### 🔴 K-2 · Akademi 410, ama kod tabanı hâlâ `/academy/*` bağı üretiyor

| Kaynak | Hedef | Kaç yerde | Etki |
|---|---|---|---|
| **`lib/tezgah/catalog.ts` `tezgahSealPath()`** | 10 aracın **10'u** → `/academy/…` | 1 fonksiyon, 10 araç | **Her tezgâh çıktısının altındaki "Bu Yetkinliği Sınavla Mühürle →" düğmesi 410.** En yüksek trafikli ölüm bağı. (`TEZGAH_SEAL_PATHS` = 10 satır) |
| `lib/kernel/passport/types.ts` | `ACADEMY_STAMP_SURFACE_PATH = "/academy"` · `ACADEMY_CERTIFICATES_SURFACE_PATH` | `app/(kernel)/pasaport/page.tsx:35,102`, `components/kernel/passport-stamp-list.tsx:211` | Pasaport sayfasında 2 ölü düğme |
| `lib/career/stamp-surface.ts` `careerStampCourseHref()` | `/academy/<slug>` | `components/career/visa-ledger.tsx:69`, `components/career/public-talent-board.tsx:53` | Kariyer damga defterinde ve **kamu rozet kartında** ölü bağ |
| `components/kernel/identity-merit-summary.tsx:103` | `/academy/dogrula` | 1 | Profilde ölü bağ |
| `components/kernel/kasa-return-panel.tsx:14-15,37-42` | `ok` → `/academy/<slug>`, fail → `/academy` | 2 | **Ödeme dönüşü 3 sn sonra 410'a push ediyor** |
| `app/(kernel)/profil/page.tsx`, `app/academy/*` | kendi içi | — | 410 zaten, sorun değil |

**Doğrulandı:** `isFrozenShellPagePath('/academy/02_ecommerce_ai') === true`.

**Ek:** `/academy/dogrula/[hash]` de 410. Basılı/eski sertifikalardaki doğrulama adresi ölü. `/vize/[hash]` akademi sertifikalarını hâlâ çözüyor (`loadPublicAcademyVerifyByHash`), yani **doğru adres var, eski adres ölü** — yönlendirme (301) veya metin düzeltmesi gerekir.

| Şiddet | **BLOKAJ** (kullanıcıya görünen 410'a giden buton sayısı: **16+**) |
|---|---|

### 🔴 K-3 · Doğrulanmış Rozet döngüsü yapısal olarak ölü — `/uzmanlar` asla dolmayacak

| Alan | Değer |
|---|---|
| **Kanıt** | `lib/career/talent-directory-load.ts:33-50` yalnız `academyCertificate.findMany({ revokedAt: null })` + `careerVisaStamp.findMany({ sourceKind: "ACADEMY_CERTIFICATE" })` okuyor. |
| **Kilit** | Akademi 410 + **tüm `/api/academy/*` donmuş** (doğrulandı: `isFrozenRoomApi('/api/academy/catalog') = true`) → yeni `academy_certificates` satırı üretilemez → `career_visa_stamps(ACADEMY_CERTIFICATE)` üretilemez → `matched.length` hep 0 → `isDirectorySlicePublished(0)` = false → `emptyTalentDirectory("threshold")`. |
| **Çelişki** | Ana sayfa zinciri hâlâ 3. adımda **"Doğrulanmış Rozet — Sunucu onaylı Doğrulanmış Freelancer Rozetin Kariyer Kartına işlenir"** diyor. `/uzmanlar` CTA'sı **"İlk Onaylı Uzmanlardan Biri Ol → Sınava Gir"** deyip `/tezgah`'a gönderiyor; `/tezgah`'ta sınav yok. |
| **Fırsat** | **`yetkin_cv_seals` çalışıyor** — SHA-256 mühürlü, sunucu sınavlı, `/vize/[id]` kamuya açık. Yani rozetin **gerçek ve çalışan** karşılığı zaten var; yalnız `/uzmanlar` yanlış tabloyu okuyor. |
| **Düzeltme** | `talent-directory-load.ts` içine `yetkinCvSeal` kaynağı ekle (`sourceKind: "YETKINCV_SEAL"`), `career_visa_stamps` bağımlılığını kaldır veya ikinci kaynak yap. + `TALENT_DIRECTORY_EXAM_HREF` → `/career#yetkincv`. |
| **Şiddet** | **BLOKAJ (büyüme)** — aksi halde ana sayfadaki 5 karttan 1'i kalıcı boş sayfa |

---

## 4.2 YÜKSEK ŞİDDET (canlıya çıkabilir, ama para/algı kaybeder)

| # | Bulgu | Kanıt | Etki |
|---|---|---|---|
| **Y-1** | **₺15.600'lık SKU merdiveni tahsil edilemiyor** | `academy:team-seat` ₺4.900 · `commerce:agency` ₺7.900 · `kurumsal:job-screening-pack` ₺2.900 · `career:yetkincv-exam` ₺290 — hiçbirinde checkout çağrısı yok | Katalogda fiyat var, kasa yok. A5 açısından "tahsil edilebilir" izlenimi doğru değil. |
| **Y-2** | **Aday eleme paketinin entitlement kapısı yok** | `KURUMSAL_SCREENING_UNIT` yalnız sabit + fiyat + katalog yazıcısında geçiyor; `createKurumsalJobPosting` ücret/limit kontrolü yapmıyor | K-1 düzeltilirse **herkes sınırsız ücretsiz ilan açar**. Ücretli paket anlamsızlaşır. |
| **Y-3** | **YetkinCV sınavı sınırsız ve ücretsiz** | `POST /api/career/yetkincv` içinde ödeme/entitlement yok | ₺290 SKU ölü; değerli ürün bedava dağıtılıyor. |
| **Y-4** | **A5 SKU çelişkisi: tek SKU, üç hikâye** | `/fiyatlandirma` "Ön Talep" ↔ `/kurumsal` `data-price-honesty="live"` + tutar ↔ gerçek "kasa yok" | Bkz. 1.2.3 |
| **Y-5** | **Ana sayfada 3 kahraman CTA'nın 2'si `/login`** | `decideEdgeAction("/e-ticaret"|"/hibe", false)` = `auth-307` | 5 saniye testi H1'de geçiyor, **ilk tıklamada düşüyor** |
| **Y-6** | **Misafir e-posta yakalama yok** | `recordSignedTezgahOutput` yalnız `guest: false`; `POST /api/lead` yalnız kurumsal teklif | Tezgâh trafiğinin kayıtsız kısmı **kalıcı olarak kayboluyor**. `/tetkik/[hash]` kamuya açık ama e-posta istemiyor. |
| **Y-7** | **Ödeme dönüşü yanlış/ölü sayfaya** | Tezgâh + Ticaret → `/cuzdan` ("Cüzdan Yükleme" ekranı); `KasaReturnPanel` → `/academy` (410) | Tahsilat sonrası güven kırığı |

---

## 4.3 ORTA / DÜŞÜK ŞİDDET

| # | Bulgu | Kanıt | Not |
|---|---|---|---|
| **O-1** | **Sentry / GlitchTip DSN yok** | `.env.example`'da `OBSERVABILITY_DSN` yok; `logEvent` yalnız stdout JSON | Üretim hatası **dışarıdan görünmez**. İlk raporun R9'u kapanmamış. |
| **O-2** | **Sitemap eksikleri** | `SITEMAP_STATIC_PATHS`: home, rehber, career, tezgah, pricing, kurumsal, vize, uzmanlar, sozluk, tetkik. **Yok:** `/ilan/[slug]` (oysa `robots: index:true`), `/magaza/[slug]`, `/hakkimizda`, `/iletisim` | İş ilanları indekslenebilir ama **hiç bildirilmiyor**; mağaza vitrinleri keşfedilmiyor |
| **O-3** | **`/vize/[hash]` sitemap'te yok** | `SITEMAP_STATIC_PATHS` yalnız `/vize` kökünü yazıyor | Her mühür uzun kuyruk sayfa olabilirdi (K-3 düzeltilirse anlamlı olur) |
| **O-4** | **`COMMERCE_WEBHOOK_SECRET_HEPSIBURADA` beyan edilmemiş** | `channel-webhook.ts:110` `${kind}` okuyor; `.env.example`'da yalnız `_TRENDYOL` + `_OS_` | HB imzası paylaşılan sırrâ kalıyor |
| **O-5** | **₺1.490 iki SKU'da** | `commerce:monthly` + `tezgah:grant-dossier` | Merdiven basamakları çakışıyor |
| **O-6** | **Ölü kopya: "Ücretsiz Ders / Seviye Testi"** | `PUBLIC_SEN.home.levelCta`, `freeLessonCta`, `tracksCta` kullanılmıyor ve olmayan ürünü anıyor | Kafa karışıklığı riski |
| **O-7** | **Sözlük 30 terim** (müzede 150+) | `lib/copy/glossary.ts` | Kısmi taşıma |
| **O-8** | **E-posta HTML şablonları taşınmamış** | `lib/kernel/notice/` içinde HTML yok; `smtp.ts` destekliyor | Kayıt doğrulama maili düz metin (marka teması yok) |
| **O-9** | **`/junior` hâlâ `kapali: false`** | `kayit.ts`; robots `disallow`, kasa izin listesinde, `packages/junior-content` transpile'da | Sıfır gelir, devam eden bakım. Yeni özellik yazılmamış (iyi). |
| **O-10** | **Tezgâh ödeme kartı yalnız kota bittiğinde görünüyor** | `workbench.tsx:1016` `showMemberCard` = hata mesajı veya `remaining === 0` | Pro/kredi satın alma yolu **ancak 3 hak tükendikten sonra** görünür. Erken CTA yok. |
| **O-11** | **`tezgahSealPath` kavramı artık anlamsız** | 10/10 araç sınav yolu gösteriyor, sınav yok | K-2'nin kavramsal kökü |
| **O-12** | **`verify:*` betikleri ağırlıkla kaynak-metni grep'liyor** | İlk raporun R12'si | Refactor'da kırılgan. K-1 tam bu yüzden kaçtı: davranış testi yoktu. |

## 4.4 Mobil görünüm riskleri

| Risk | Kanıt | Değerlendirme |
|---|---|---|
| `w-screen` + `[margin-inline:calc(50%-50vw)]` tam-genişlik bantlar | `app/(public)/page.tsx:114,143` (Tezgâh bandı, Hibe widget bandı) | `main` üzerinde `overflow-x-hidden` var → **kırpılma** riski. Scrollbar genişliği olan masaüstünde `100vw` taşma yapar; mobilde genelde sorunsuz. **Orta.** |
| Dokunma hedefleri | `min-h-11` (44 px) header düğmelerinde tutarlı | ✅ İyi |
| Vitrin kartları | `grid md:grid-cols-2` → mobil tek sütun | ✅ |
| `/kurumsal` kokpit | `grid xl:grid-cols-3` → mobil tek sütun | ✅ |
| Tablolar | Sipariş/stok tabloları `overflow-x` sarmalı | Kontrol edilmeli; kod okumasında açık taşma bulunmadı |
| `/tezgah` çalışma masası | Çok sütunlu form; `sm:` kırılımları var | ✅ |

**Karar:** Mobilde **kırıcı bir engel bulunmadı**; iki tam-genişlik bantta görsel kırpılma riski izlenmeli.

---

# BÖLÜM 5 — NİHAİ KARAR (GO / NO-GO) & İLK 14 GÜN BÜYÜME PLANI

## 5.1 Resmî Karar

> # 🟡 KOŞULLU ONAY
>
> **Mimari olarak: ONAY.** RLS 65/65 FORCE, append-only defter, `AmountMinor` markalı tip, katalog karar defteri, SSRF/CSP/origin guard, 130 rota auth haritası, 2.411 yeşil test. Bu, Türkiye'deki B2B SaaS ortalamasının belirgin üstünde bir mühendislik disiplini.
>
> **Ticari olarak: KOŞULLU.** Vitrin kurulmuş, kasaların bir kısmı gerçekten çalışıyor, ama **katalogdaki ₺15.600 tahsil edilemiyor**, **şirket ayağı 410**, **rozet döngüsü ölü**.
>
> **Canlıya çıkış koşulu:** Aşağıdaki **3 blokaj (K-1, K-2, K-3)** kapatılmadan **geniş trafik açılmamalı.** Soft-launch (davetli, ≤ 100 kullanıcı) bugün başlayabilir; çünkü blokajlar ödeme ve veri bütünlüğünü değil, **dönüşümü ve kurumsal satışı** etkiliyor. Para yolu (PayTR 3DS + defter + idempotency) sağlam.
>
> **Tahmini kapatma süresi:** K-1 **1 saat**, K-2 **yarım gün**, K-3 **1–2 gün**. Toplam **≤ 3 iş günü** (tek geliştirici, testlerle birlikte).

### 5.1.1 Gerekçe — neden RET değil

| Kriter | Durum |
|---|---|
| Para güvenliği | ✅ PayTR 3DS, idempotency, append-only defter, mutabakat cron, fail-closed katalog |
| Veri güvenliği | ✅ 65/65 FORCE RLS, kapsamsız deny, PostgREST yazma yasak, IDOR mühürleri |
| Dürüstlük | ⚠️ A5 çelişkisi (Y-4) var ama **fiyat uydurulmuyor**; yalnız etiket tutarsız |
| Teknik borç | ✅ `tsc` temiz, 2.411 test yeşil, `verify:*` kapıları geçiyor |
| Ürün çalışıyor mu | ⚠️ Tezgâh ✅ · Hibe ✅ · Ticaret ✅ · Kariyer ✅ · **Kurumsal ❌** · **Uzmanlar ❌** |
| Geri döndürülebilirlik | ✅ `LIVE_BROADCAST_SHUTDOWN` + `SITE_MAINTENANCE_FREEZE` var |

### 5.1.2 Gerekçe — neden ONAY değil

Üç blokaj **kullanıcıya görünen** kusurlar: 16+ düğme 410'a gidiyor, amiral modül çalışmıyor, ana sayfanın 5 kartından 1'i kalıcı boş. Bunlar "iyileştirme" değil, **vaadin karşılıksız kalması**. Geniş trafik açmadan kapatılmalı.

---

## 5.2 Blokaj kapatma sırası (0–3. gün, trafiği bekletir)

| Sıra | İş | Dosya | Kabul kriteri |
|---|---|---|---|
| **B1** | `/api/kurumsal/ilanlar` 410 muafiyeti | `lib/kernel/security/edge-api-auth.ts` `isFrozenRoomApi()` + `tests/kernel/edge-api-auth.test.ts` | `POST /api/kurumsal/ilanlar` oturumlu → 200; ilan `/ilan/<slug>`'da açılıyor |
| **B2** | Tezgâh mühür köprüsünü `/career#yetkincv`'e çevir | `lib/tezgah/catalog.ts` `TEZGAH_SEAL_PATHS` (10 satır) + `TEZGAH_SEAL_LABEL` | Her çıktının altındaki düğme 200 dönüyor; etiket "Bu Yetkinliği YetkinCV ile Mühürle →" |
| **B3** | Pasaport + kariyer damga bağlarını düzelt | `lib/kernel/passport/types.ts`, `lib/career/stamp-surface.ts`, `identity-merit-summary.tsx`, `passport-stamp-list.tsx`, `visa-ledger.tsx`, `public-talent-board.tsx` | `/academy*` bağı **0**; grep mühürü ekle |
| **B4** | Ödeme dönüş panelini düzelt | `components/kernel/kasa-return-panel.tsx` | `ok` → `/tezgah` (pro/kredi) veya `/e-ticaret` (lisans) veya `/hibe` (dosya); `fail` → geldiği odaya. **`/academy` bağı yok.** |
| **B5** | `/uzmanlar` kaynağını `yetkin_cv_seals`'e bağla | `lib/career/talent-directory-load.ts` + `talent-directory.ts` + `TALENT_DIRECTORY_EXAM_HREF` → `/career#yetkincv` | Mühür sahibi dizinde görünüyor; k≥5 eşiği korunuyor; CTA gerçek sınava gidiyor |
| **B6** | A5 SKU dürüstlüğü | `lib/sales/kurumsal-offers.ts` (fiyatı `planned` işaretle) **veya** 4 SKU'ya kasa bağla | Üç yüzey aynı şeyi söylüyor |
| **B7** | `/academy/dogrula/[hash]` → `/vize/[hash]` 301 | `next.config.ts` | Basılı sertifikadaki adres çalışıyor |

---

## 5.3 İlk 14 Gün — Aksiyona Dönük Büyüme & İlk Nakit Planı

### 5.3.1 Hangi dikeyden başlanmalı? — Karar ve gerekçe

| Aday dikey | Hazırlık | Nakit hızı | Engel |
|---|---|---|---|
| **E-Ticaret esnafı + ajanslar** | **En yüksek** — tezgâhta ürün kartı, katalog CSV, dijital dükkan, reklam paketi; `lib/commerce/*` Trendyol + Hepsiburada gerçek istemcilerle | **₺590 Pro / ₺190 kredi = saniyeler içinde kapanan satış** | Yok (anonim tezgâh açık) |
| **Hibe danışmanları / KOBİ** | Yüksek — ana sayfada ücretsiz uygunluk widget'ı, doğrulanmış çağrı kataloğu, 90 günlük plan | **₺1.490 dosya** (yüksek bilet, daha uzun döngü) | `/hibe` oturum istiyor; widget → `/login` |
| **Kurumsal İK** | Orta — ekran hazır | **₺2.900** | **K-1 blokajı + kasa yok** → bu turda satılamaz |
| **YetkinCV adayları** | Orta — motor hazır | ₺290 | **Kasa yok + sınav ücretsiz** → nakit yok, yalnız trafik |

> ### 🎯 Karar: **İlk 14 günün birincil dikeyi = E-Ticaret esnafı ve e-ticaret ajansları.**
> **İkincil = hibe danışmanları.** Kurumsal İK, K-1 + kasa kapatıldıktan sonra 3. haftaya.
>
> **Neden:** (a) Anonim tezgâh bugün **kırılmadan çalışan tek değer yüzeyi**; (b) çıktı **müşteriye teslim edilebilir** (CSV/HTML/markdown) → teslimat filigranı zaten kodda (`TEZGAH_DELIVERY_SIGNATURE`) → **sıfır reklamla B2B marka teması**; (c) en düşük bariyerli ücretli adım (₺590 / ₺190) **anında tahsil edilebilir**; (d) Ticaret lisansı (₺1.490/ay) aynı kitleye **ikinci** satış.

### 5.3.2 Gün gün plan

#### Gün 1–3 · Blokaj + ölçüm altyapısını aç

| Gün | İş | Çıktı |
|---|---|---|
| 1 | **B1–B7 kapat.** Özellikle B2 (mühür köprüsü) ve B4 (ödeme dönüşü) — bunlar **her oturumda** görülüyor. | 16+ ölü düğme → 0 |
| 2 | **`OBSERVABILITY_DSN` bağla** (Sentry/GlitchTip). Canlıya çıkışta ilk gün hatası görünmezse 14 gün kördü. | Hata toplama açık |
| **2** | **Vitrine ücretsiz kredi paketi ekle** — `tezgah:credit-pack` ₺190 kartını `/fiyatlandirma`'ya ve `/tezgah`'a erken (kota bitmeden) bas. `workbench.tsx:1016` `showMemberCard` koşulunu "her zaman görünür" yap. | İlk nakit basamağı görünür |
| 3 | **`₺1.490` çakışmasını çöz** (hibe dosyası → ₺1.290) — Super Admin katalog PATCH, kod değişmez. Karar defteri satırı düşer. | Merdiven tekilleşti |
| 3 | **Ana sayfa CTA sırası**: birincil tezgâh ✅ · ikincil **"Hibe uygunluğunu ücretsiz gör"** (widget'a kaydır, login değil) · üçüncül **"Kariyer"**. `/e-ticaret` ve `/hibe` düğmeleri **kaldırılır** veya "Giriş sonrası" etiketi alır. | 2 ölü CTA → 0 |

#### Gün 4–7 · İlk 20 sıcak temas + ilk nakit

| Gün | İş | Ölçü |
|---|---|---|
| 4 | **Hedef liste kur (50 firma):** Trendyol/Hepsiburada'da **20–200 ürün** satan, ürün açıklaması zayıf, Instagram'ı aktif Türk KOBİ'leri. Kaynak: `/tetkik` aracıyla **kendi sitelerini tara** → skoru düşük olanlar öncelik. | 50 firma, skorlu |
| 4–5 | **Giden temas (DM + e-posta), kişiselleştirilmiş:** *"Sitenizin dönüşüm skoru 42/100. Ürün açıklamanız Trendyol'da 3 satır. Tezgâhta 90 saniyede 20 ürünün kartını ürettim — ekte CSV."* **Gerçek çıktı ekle.** | 50 temas → ≥ 12 yanıt |
| 5–6 | **Yanıt verene canlı 15 dk demo:** ekran paylaşımı, *kendi ürünüyle* üretim. Sonunda iki teklif: **₺190 / 10 üretim** (dene) veya **₺590/ay Pro**. | ≥ 6 demo |
| 6–7 | **İlk tahsilat hedefi: 5 işlem.** ₺190 × 3 + ₺590 × 2 = **₺1.750**. | İlk nakit |
| 7 | **Hibe kolunu aç:** aynı gün `/hibe`'yi **anonim önizlemeye** al (`/hibe` yerine `/hibe/onizleme` vitrin: uygunluk + program listesi açık, proje dosyası oturum ister). | Widget → gerçek değer, login duvarı yok |

#### Gün 8–11 · Teslimat filigranı döngüsünü çalıştır

| Gün | İş | Neden |
|---|---|---|
| 8 | **Her teslimatın altına imza zaten var** (`TEZGAH_DELIVERY_SIGNATURE` → HTML/CSV). Müşteriye giden her çıktı `yetkin.ai/tezgah` taşıyor. **Bunu satış argümanı yap:** *"Müşteriniz bu dosyayı açtığında markanızı değil aracı görür — ajans olarak siz görünürsünüz."* | Sıfır maliyetli B2B marka teması |
| 9 | **Ajans teklifi (₺1.490/ay Ticaret lisansı + ₺590 Pro):** 10 mağaza yöneten küçük ajanslara **doğrudan** git. Tezgâhta 500 üretim + Trendyol/HB senkronu | MRR rayı |
| 10 | **`/tetkik`'i satış aracı yap:** her tetkik raporu kalıcı URL üretiyor; raporda "4 eksiği kapatan uzman" → `/uzmanlar`. Bu bağ K-3 sonrası **gerçek** | SEO + lead |
| 11 | **Haftalık Fırsat Radarı'nı doğrula:** Pzt 09:00 cron, `NOTICE_SMTP_HOST` dolu mu? Boşsa **ilk gün doldur** — retention motoru buna bağlı | D30 retention |

#### Gün 12–14 · Ölç, karar ver, ölçekle

| Gün | İş |
|---|---|
| 12 | **Huni panosunu oku:** `/admin` → `vitrine_visit → free_lesson(→tezgah_use) → checkout_intent → purchase_settled`. İlk 14 günün gerçek dönüşüm oranı. |
| 13 | **Kaybeden temasları ara:** yanıt vermeyen 38 firmadan 10'una **farklı açı**: hibe uygunluğu (*"firmanız KOSGEB çağrısına %68 uyumlu"*) |
| 14 | **Karar:** (a) Pro abone sayısı ≥ 5 → **tezgâh kotasını 3'ten 2'ye düşür** (ücretli hattı hızlandır); (b) < 5 → **kredi paketini ₺190 → ₺99** dene; (c) kurumsal İK'ya geç (K-1 kapandıysa) |

### 5.3.3 14 günlük nakit hedefi (muhafazakâr)

| Kalem | Adet | Tutar | Toplam |
|---|---|---|---|
| 10 üretim kredisi | 8 | ₺190 | ₺1.520 |
| Tezgâh Pro (aylık) | 4 | ₺590 | ₺2.360 |
| Hibe tam dosyası | 2 | ₺1.490 | ₺2.980 |
| E-Ticaret lisansı (aylık) | 1 | ₺1.490 | ₺1.490 |
| **Toplam tahsilat** | **15 işlem** | | **₺8.350** |
| **Aylık yinelenen (MRR) bileşeni** | Pro 4 + Ticaret 1 | ₺590×4 + ₺1.490 | **₺3.850 MRR** |

> **Not:** Bu sayılar kodun söylediği kapasiteye dayanıyor (fiyatlar katalogdan, kasa gerçek). CAC, dönüşüm oranı ve churn **verisi yok**; bu bir **hedef**, tahmin değil.

### 5.3.4 İlk 14 günde **yapılmayacaklar**

- Kurumsal İK satışı (K-1 + kasa kapatılmadan).
- Ekip rozeti / ajans paketi / aday eleme satışı (kasa yok — Y-1).
- YetkinCV'yi ücretli satmak (önce entitlement kapısı gerekir — Y-3).
- Yeni özellik yazmak. **14 günün tamamı vitrin ve satış.**
- Akademi'yi geri açmak (kullanıcı kararı: BTK Akademi ile ücretsiz eğitim rekabeti anlamsız — **doğru karar, korunmalı**).
- Freelancer odasını açmak (`MARKETPLACE_SPLIT_LIVE = false` — A2 korunuyor).

---

## 5.4 İlk 90 Gün — Blokaj sonrası sıralı yol haritası

| Hafta | Odak | Kabul kriteri |
|---|---|---|
| 1 | Blokaj (B1–B7) + gözlem (O-1) | 0 ölü `/academy` bağı · `/api/kurumsal/ilanlar` 200 · `/uzmanlar` dolabiliyor |
| 2 | Vitrin dürüstlüğü + erken kredi CTA | 3 yüzey aynı SKU hikâyesi · merdiven tekil |
| 3 | **Kurumsal kasa**: `kurumsal:job-screening-pack` checkout + entitlement kapısı (Y-2) | İlan açılışı paketle sınırlı; ₺2.900 tahsil edilebiliyor |
| 4 | **Ekip rozeti + ajans kasası** (Y-1) | ₺4.900 / ₺7.900 tahsil edilebiliyor |
| 5 | **YetkinCV entitlement** (Y-3) | İlk sınav ücretsiz, sonrası ₺290 |
| 6 | Misafir e-posta yakalama (Y-6) | Tezgâh çıktısı indirmek için e-posta; `lead` tablosu |
| 7 | E-posta HTML şablonları (E7/O-8) | Doğrulama maili markalı |
| 8 | Sözlük 30 → 80 terim (E6/O-7) | Programatik SEO genişledi |
| 9 | Rozete özel `opengraph-image` (GL-2) | `/vize/[id]` paylaşım kartı |
| 10 | Mobil bant kırpılması (4.4) + Lighthouse | CLS/LCP ölçülmüş |
| 11–12 | **Faz 2 ISO modülü başlangıç kararı** — tetikleyici kontrolü (≥12 ön talep veya ≥3 ödeyen kurumsal) | Karar dokümante |
| 13 | Fiyat otomasyonu: marj tabanı assert + FX bağlı birim maliyet | Sessiz zam yok, `PriceCatalogDecisionLedger` zorunlu |

---

## 5.5 Karar Matrisi — Ne açık, ne kapalı

| Modül | Karar | Gerekçe |
|---|---|---|
| **AI Tezgâh** (anonim + Pro + kredi) | **AÇIK — birincil satış** | Tek kırılmadan çalışan anonim değer yüzeyi. Kota DB'de, maliyet defterde. |
| **E-Ticaret OS** | **AÇIK** | Kokpit gerçek, lisans katalogdan, Trendyol/HB istemcileri gerçek. |
| **YetkinHibe OS** | **AÇIK** + önizleme vitrini önerilir | 90 günlük plan motoru + doğrulanmış çağrı verisi. |
| **Kariyer + YetkinCV** | **AÇIK** | Mühür gerçek, `/vize` kamuya açık, SWOT/yol haritası çalışıyor. |
| **Uzmanlar dizini** | **AÇIK — ama kaynak değişmeli (K-3)** | `yetkin_cv_seals`'e bağlanmadan kalıcı boş. |
| **Kurumsal İlan & Eleme** | **AÇIK — ama önce K-1** | Sayfa açık, yazma 410. |
| **Akademi (`/academy`)** | **KAPALI (410) — doğru karar** | Kullanıcı kararı: beğenilmeyen iş + BTK Akademi ücretsiz rekabeti. **Yeniden açılması önerilmez.** |
| **Freelancer odası** | **KAPALI (410)** | `MARKETPLACE_SPLIT_LIVE = false`; A2 gereği emanet yoksa iş döngüsü yalan olur. |
| **Junior** | **KAPALI (kasa + izin listesi)** | Sıfır gelir, bakım yükü. Yeni özellik yazılmamalı. |
| **Young** | **KAPALI** | Kullanılmıyor. |
| **ISO Denetçisi (Faz 2)** | **ÖN TALEP** | 60–90 gün sonra, tetikleyiciyle. |
| **Şirket Beyni (Faz 3)** | **ÖN TALEP** | 6 ay sonra, ara adım = deterministik Karar Defteri. |
| **Müzeden Studio / DevLabs / Pazaryeri / Arena / Social** | **TAŞINMAZ** | Karar korunmuş. |
| **PayTR Pazaryeri Split** | **KAPALI** | Lisanslı sözleşme yok; `not_configured` dürüst. |

---

## 6. Sonuç — Masadaki Tek Cümlelik Gerçek

> **Bu proje artık "kurs sitesi" değil; beş sütunlu bir üretim ve işletim sistemidir ve mühendislik tarafı gerçekten sağlamdır.**
>
> İlk raporun üç kritik deliği — fiyat sayfası yok · `commerce:monthly` satırı yok · tezgâh kotası bellekte — **üçü de kapatıldı.** AI maliyeti artık deftere yazılıyor. RLS 65/65 FORCE. Katalog karar defteri çalışıyor. 2.411 test yeşil. Bu, planın başarısıdır ve tesadüf değildir.
>
> **Ama iki kenar kapısı yanlış yere bakıyor ve bu yüzden ürünün en yeni sütunu ile en eski büyüme döngüsü aynı anda kapalı:** `/api/kurumsal/ilanlar` 410 dönüyor (Ağırlıklı Aday Eleme ölü), ve `/uzmanlar` akademi sertifikası okuduğu için asla dolmuyor (rozet döngüsü ölü) — oysa çalışan bir `yetkin_cv_seals` mührü zaten var. Üstüne, her tezgâh çıktısının altındaki "Sınavla Mühürle" düğmesi ve ödeme dönüşü de 410'a gidiyor: **kullanıcıya görünen 16+ ölü düğme.**
>
> **Üç günlük iş, ₺8.000–₺10.000 ilk nakit, ₺3.850 MRR ve tek bir dikey (e-ticaret esnafı + ajans) yeterli.** Yeni özellik gerekmiyor. Gereken şey, yazılmış olanı **doğru kapıya bağlamak.**

---

### Ek — Bu Raporun Doğrulanabilir İddiaları

| İddia | Doğrulama (bu oturumda çalıştırıldı) |
|---|---|
| `/api/kurumsal/ilanlar` 410 | `isFrozenRoomApi('/api/kurumsal/ilanlar')` → `true`; `decideEdgeApiAuth({…, sessionHint:true})` → `{status:410}` (GET+POST) |
| `/academy` ve tüm alt yolları 410 | `isFrozenShellPagePath` → `true` (kök, kurs, `seviye`, `dogrula`, `oyna`) |
| `/api/academy/*` donmuş | `isFrozenRoomApi('/api/academy/catalog')` → `true` |
| Tezgâh mühür yolu 410'a gidiyor | `tezgahSealPath('ecommerce')` → `/academy/02_ecommerce_ai` → `isFrozenShellPagePath = true` |
| `/e-ticaret` ve `/hibe` anonime kapalı | `decideEdgeAction(p, false)` → `{kind:"auth-307", to:"/login"}` |
| Katalog SKU'ları tohumlu | `20261118160000_launch_price_catalog` (6 SKU) + `20261118183000_yetkincv_exam` (₺290) + `20261118230000_kurumsal_ilan_eleme` (₺2.900) |
| Tezgâh kotası DB'de | `lib/tezgah/quota.ts` `tezgahDailyQuota` + `$transaction` + `updateMany({usedCount:{lt:limit}})`; bellek yalnız `VITEST` |
| AI maliyeti yazılıyor | `recordUsage: true` → 14 nokta / `false` → 4 nokta (`social-generate` ×2, `assistant-chat`, `dispute-engine`, `junior:1135`) |
| RLS 65/65 | `verify:rls-status OK`; sicil ↔ `@@map` farkı `0` |
| 130 rota auth haritası | `verify:api-auth --check OK` |
| Boundary mühürleri | `verify:boundaries OK` |
| Sözlük 30 + rehber 15 | `GLOSSARY_TERMS.length = 30`, `PUBLIC_GUIDES.length = 15` |
| `/uzmanlar` yalnız akademi sertifikası okuyor | `talent-directory-load.ts:33-50` `academyCertificate` + `careerVisaStamp(sourceKind:"ACADEMY_CERTIFICATE")` |
| YetkinCV sınavı entitlement'sız | `app/api/career/yetkincv/route.ts` yalnız `requireSession`; ücret kontrolü yok |
| Aday eleme entitlement'ı yok | `KURUMSAL_SCREENING_UNIT` yalnız `kurumsal-screening.ts:10`, `kurumsal-offers.ts:31`, `catalog-write.ts:140` |
| Ödeme dönüşü `/cuzdan` | `checkout.ts:36` `PAYTR_MERCHANT_WALLET_RETURN_PATH = "/cuzdan"`; tezgâh ve ticaret aynı fonksiyonu kullanıyor |
| Kasa dönüşü `/academy`'ye push | `kasa-return-panel.tsx:14-15,37-42` |
| Teslimat filigranı | `lib/tezgah/delivery-signature.ts`; `dukkan/render.ts:135`, `pazaryeri/csv.ts:104` |
| Haftalık radar | `lib/kernel/jobs/inngest.ts:492` cron `TZ=Europe/Istanbul 0 9 * * 1` |
| Test/type kapıları | `vitest run` 471 dosya / **2.411 test geçti**; `tsc --noEmit` **0 hata** |

*Rapor sonu. Kaynak kodu değiştirilmedi; yalnız bu dosya oluşturuldu.*
