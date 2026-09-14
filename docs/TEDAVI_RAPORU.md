# TEDAVİ RAPORU — yetkin.ai: Belge operasyonu + Kernel paketi + Dron kaydı + Yazma hop’ları

| Alan | Değer |
|------|-------|
| Tarih | 13 Eylül 2026 |
| Hazırlayan | Senior Software Architect / Sistem Analisti ajanı |
| Girdi | `docs/TESPIT_RAPORU.md` + CEO yapısal kararları (K-1…K-4 uygulandı; K-5 Split idari, K-6 canlı yayın kilidi runbook’a işlendi) |
| Hedef | Sürü-dron uyum puanı **58 → ≥75** |
| Sonuç puan | **76/100** |
| Yöntem | Sıfır varsayım. Her iddia dosya yoluna bağlıdır. |

---

## 0. Yönetici özeti

Tedavi, Tespit’teki dört yapısal kararı koda ve belgelere işledi:

1. **K-1:** “Shared Kernel paketi yoktur ve çıkarılmaz” yasağı kalktı. `@yetkin/kernel` workspace paketi çıktı; Dron bu paketi tüketir.
2. **K-2:** Mühürlü ders sayısı tüm bağlayıcı belgelerde **1** (`01_office_ai-1`).
3. **K-3:** Video katmanı **terk** edildi (Anayasa, Manifesto, Pedagoji, Runbook).
4. **K-4:** Motor 2 **keşif** fazına alındı.

Ayrıca: `rooms.ssot.ts` iptal edilip `lib/dronlar/kayit.ts` SSOT oldu; `npm run dron:new` scaffold’u kuruldu; **6 yazma hop’u** `/api/v1` siciline girdi (hedef en az 5). Dron hâlâ `publishFrozenUntilFaz1Close: true` donuk laboratuvardır — bu tedavi canlı mağaza açmaz.

---

## 1. BELGE VE ANAYASA OPERASYONU

### 1.1 Operasyonel yük temizliği

| Belge | Ne değişti | Kanıt |
|-------|------------|--------|
| `.system_docs/ANAYASA.md` | B katmanı sadeleşti. API-First: yeni yetenek önce v1 hop. Oda kaydı `lib/dronlar/kayit.ts`. Mühürlü ders **1**. Video terk. Motor 2 keşif. | “Yeni yetenek önce v1 hop’tur”, “mühürlü ders sayısı … **1**” |
| `.system_docs/MANIFESTO.md` | SKU sayıları / env / 403 kodları vizyondan çıktı. Paket çıkarılır. SEN aksı varsayılan B2C; dron başına locale edilebilir. | “Shared Kernel `@yetkin/kernel` olarak çıkar” |
| `.system_docs/PEDAGOJI.md` | Mühürlü yayın 1 ders. Video terk. SOP `docs/ops/akademi-bake-elkitabi.md`. | “Mühürlü yayın 1 derstir.” |
| `.system_docs/DRON_CLIENT_SPEC.md` | “Shared Kernel paketi yoktur ve çıkarılmaz” **silindi**. Hedef: `@yetkin/kernel` + API-First hop sicili. | §1 “Shared Kernel: `@yetkin/kernel` npm workspace paketidir.” |
| `.system_docs/README.md` | İnce kapak; sayılar linkte. | Motor 2 keşif, paket tüketimi |
| `README.md` (kök) | Aynı yasak cümlesi kaldırıldı. | “saf kernel paketi Amiral ve Dron arasında paylaşılır” |
| `.system_docs/STORAGE_CONTRACT.md` | Zaten 1 mühürlü ders; çelişki kapanır. | “**1** MP3 — `01_office_ai-1`” |

### 1.2 OPS_RUNBOOK dört parça

İndeks: `.system_docs/OPS_RUNBOOK.md`.

| Parça | Dosya |
|-------|--------|
| Veritabanı / bağlama | `.system_docs/ops/ops-db.md` |
| PayTR | `.system_docs/ops/ops-paytr.md` |
| Inngest | `.system_docs/ops/ops-inngest.md` |
| Dron | `.system_docs/ops/ops-dron.md` |

İndeks hâlâ T3, SMTP skipped, mühürlü yayın **1**, `RAIL_V1_HOPS` **13 kayıt**, PayTR callback + kanonik `/api/payments/webhooks/paytr` taşır. `LIVE_BROADCAST_SHUTDOWN` tarihi **13 Eylül 2026, açık (`true`)** (K-6). Closed Testing **uyku** (`ops-dron.md`).

Yüzey testleri (`faz1-operating-picture-surface`, `legal-launch-surface`) indeks string’leriyle kilitlidir; indeks inceltilirken bu iğneler korundu.

---

## 2. KERNEL PAKETLEŞTİRMESİ (ADIM 1)

### 2.1 `@yetkin/kernel`

Konum: `packages/kernel/` (`package.json` name `@yetkin/kernel`, `private: true`, v1.0.0).

**Paket içeriği (Prisma/Supabase yok — `scripts/verify-kernel-package.ts` tarar):**

| Dilim | Dosyalar |
|-------|----------|
| Para | `src/money/` (`amountMinor`, currency, yetersiz bakiye) |
| Katalog kimliği | `src/catalog-ids/` (SKU, pathway, listing doors, need-based) |
| HTTP sözleşme | `src/http/` (zarf, Idempotency-Key, `RAIL_V1_HOPS_META`) |
| Özet | `src/crypto/sha256.ts` (`SHA256_HEX_PATTERN` + parse; `createHash` Amiral’de) |
| Codegen DTO | `src/generated/v1.ts` (`npm run generate:v1-client`) |

Amiral `lib/kernel/{money,catalog-ids,http/v1-hops-meta,http/v1-envelope,http/idempotency-key,crypto/sha256}` bu paketi **re-export** eder. Zod/OpenAPI/handler Prisma bağı Amiral’de kalır (`lib/kernel/http/v1-contract.ts`).

### 2.2 Dron tüketimi

- `apps/rail-is/package.json`: `"@yetkin/kernel": "file:../../packages/kernel"`
- `apps/rail-is/src/api/hops.ts`: `RAIL_V1_HOPS_META` paketten; allowlist meta ile eşleşir
- `apps/rail-is/src/contract/v1.ts`: tipler `@yetkin/kernel/generated/v1`
- `apps/rail-is/src/generated/v1.ts`: ince re-export (kopya DTO sicili yok)
- `apps/rail-is/metro.config.js`: paket kökünü `watchFolders` + `extraNodeModules`
- `next.config.ts`: `transpilePackages: ["@yetkin/kernel"]`

Kök `package.json`: `"workspaces": ["packages/*"]`, bağımlılık `"@yetkin/kernel": "*"`.

### 2.3 CI kapısı

`verify:v1-contract-artifacts` zinciri:

1. `generate-openapi-v1.ts --check`
2. `generate-rail-v1-dron-types.ts --check` (hedef `packages/kernel/src/generated/v1.ts`)
3. `verify-kernel-package.ts` (paket adı, Dron bağımlılığı, hops import, Prisma/Supabase/`@/` yasağı)

`.github/workflows/ci.yml` `rail-is` işi `file:` paket için kök `package-lock.json` önbelleğini de okur.

**Bilerek yapılmayan:** genel npm registry yayını, semver changelog, `@yetkin/dron-sdk`. Paket hâlâ aynı git commit’e bağlıdır; kırıcı değişiklik major + 426 kuralı belgede durur, otomatik sürüm botu yoktur.

---

## 3. DRON KAYIT DEFTERİ VE SCAFFOLD (ADIM 2)

### 3.1 SSOT

- **Canlı sicil:** `lib/dronlar/kayit.ts` — `VERTICAL_ROOMS`, `FROZEN_DISK_ROOMS`, `DRON_KAYIT`, `DronBayrakları.isKapali(id)`
- **Uyumluluk:** `lib/kernel/rooms.ssot.ts` `@deprecated` re-export. Yeni kod `kayit.ts` okur.
- **eslint / verify-boundaries / modules.ts / vitest.aliases:** `lib/dronlar/kayit.ts` okur.

`DronBayrakları.isKapali(id)`:

- Donmuş disk odası → kapalı
- Bilinmeyen id → kapalı
- `bayrakEnv` (`DRON_FREELANCER_OPEN`) veya `DRON_<ID>_OPEN` → 1/true/open açar, 0/false/closed kapatır
- Aksi halde satırın `kapali` alanı

Kenar: `isFrozenRoomApi` ve `isFrozenShellPagePath` kayıtlı kapalı dronun `/api/<id>` ve `/<id>` yüzeyini **410** basar. Freelancer kamu kilidi hem sabit (`FREELANCER_PUBLIC_SURFACE_LOCKED`) hem bayrak ile durur.

### 3.2 Scaffold

```
npm run dron:new -- --id=ornek-dron
```

`scripts/dron-new.ts`:

1. kebab-case doğrular; donmuş/kayıtlı id reddeder
2. `VERTICAL_ROOMS` + `DRON_KAYIT` satırı ekler (`kapali: true`, `bayrakEnv: DRON_<ID>_OPEN`)
3. `lib/<id>/index.ts` + `lib/<id>/schema.prisma.tmpl` (canlı `prisma/schema`’ya yazmaz)
4. `app/api/<id>/pulse/route.ts` örnek session GET

Açmak: `DRON_<ID>_OPEN=1`. v1 hop ayrıca `packages/kernel/src/http/v1-hops-meta.ts` + Zod bind ister (sessiz hop yoktur).

**Adım 2’nin bilinçli eksiği:** `ROUTE_AUTH_MAP` hâlâ `verify:api-auth` taramasından üretilir, kayıttan türetilmez. Scaffold v1 hop + test üretmez. Stajyer “hello-dron” iskeletini 1 günde açar; yayın hop’u ayrı PR’dır.

---

## 4. YAZMA HOP’LARININ AÇILMASI (ADIM 3 — veri dilimi)

### 4.1 Sicil: 8 → 13 hop (6 yazma)

SSOT: `packages/kernel/src/http/v1-hops-meta.ts`. Zod: `lib/kernel/http/v1-contract.ts`. Kenar: `v1-hop-gate.ts` (GET\|POST\|PATCH).

| id | Method | v1 path | Dron | Idempotency |
|----|--------|---------|------|-------------|
| health | GET | `/api/v1/health` | açık | hayır |
| academy-certificate | GET | `/api/v1/academy/certificates/{hash}` | açık | hayır |
| academy-pulse | GET | `/api/v1/academy/pulse` | açık | hayır |
| **academy-purchase** | POST | `/api/v1/academy/courses/{id}/purchase` | **açık** (IAP yok; cüzdan DEBIT) | evet |
| **academy-lock** | POST | `/api/v1/academy/courses/{id}/lock` | açık | evet |
| **academy-curriculum** | POST | `/api/v1/academy/courses/{id}/curriculum` | açık | evet |
| **academy-exam** | POST | `/api/v1/academy/courses/{id}/exam` | açık | evet |
| auth-session | GET | `/api/v1/auth/session` | açık | hayır |
| wallet-strip | GET | `/api/v1/dashboard/wallet-strip` | açık | hayır |
| career-pulse | GET | `/api/v1/career/pulse` | açık | hayır |
| career-visas | GET | `/api/v1/career/visas` | açık | hayır |
| **career-portfolio** | POST | `/api/v1/career/portfolio` | açık | evet |
| **profile-patch** | PATCH | `/api/v1/profile` | açık | evet |

`dronForbidden` listesi **boştur**. Native IAP hâlâ yoktur; satın alma Rail cüzdanı DEBIT’tir. `RAIL_V1_HOP_DRON_FORBIDDEN` sabiti IAP yasağı için durur, sıfır hop’a bağlıdır.

Freelancer hop’ları sicilde yoktur (Split + kamu 410). DTO’lar OpenAPI `components.schemas` içinde bilinçli durur; `paths` ve Marketplace tag yayınlanmaz.

### 4.2 Handler kalkanı

Yazma handler’ları `requireSession` + `requireRailV1IdempotencyKey` + `settleHttpIdempotency`. Web UI (`purchase-button`, `curriculum-player`, `exam-panel`, `display-name-form`) `useIdempotencyKey` basar.

Dron istemci: `lockAcademyCourse`, `purchaseAcademyCourse`, `completeAcademyLesson`, `submitAcademyExam`, `syncCareerPortfolio`, `patchProfile` (`apps/rail-is/src/api/client.ts`).

### 4.3 Bilinçli olarak taşınmayanlar

| Yetenek | Durum | Neden |
|---------|--------|-------|
| `POST /api/wallet/top-up` | web-only BFF | PayTR iFrame / çerez oturumu; native’de `/cuzdan` Linking köprüsü durur |
| Freelancer bid/accept/release | kenar 410 | K-5 Split idari; Tespit sırası “Split ile” |
| Curriculum/exam **GET** | web BFF | Yazma hop’u POST; okuma RSC/`lib/` veya `academy-pulse` |
| Admin / catalog PATCH | web-only | Super Admin yüzeyi; dron sözleşmesi değil |

`verify:api-auth`: **53 rota** (session 31, public 17, admin 2, webhook 3). Hop sayısı 13; kapsama hâlâ dar ama **kritik yazma boşluğu kapandı**.

---

## 5. UYUM PUANI (Tespit §3.1 aynı ağırlıklar)

Ağırlık: sözleşme %20, auth %15, ödeme %20, veri %20, paket %15, dikey-maliyet %5, ölçek %5.

| Boyut | Tespit | Tedavi | Gerekçe |
|-------|--------|--------|---------|
| Sözleşme-first altyapı | 85 | **90** | 13 hop, yazma Idempotency, OpenAPI+codegen CI, PATCH kapısı |
| Kimlik | 70 | **70** | Değişmedi: cihaz/oturum yok, admin tek UUID, refresh Supabase SDK’da |
| Ödeme | 55 | **63** | Purchase hop açık (cüzdan DEBIT). Hâlâ tek PSP, Split stub, top-up hop yok, IAP yok |
| Veri paylaşımı | 45 | **80** | 6 yazma + 7 okuma. Dron satın al / kilitle / ders bitir / sınav / portföy / profil konuşur. 13/53 ≈ %25 kapsama; kritik yol %15’ten çıktı |
| Kernel paketlenmesi | 20 | **85** | Paket var, Dron tüketir, CI `--check`. Registry/changelog yok |
| Dikey açma maliyeti | 35 | **80** | Kayıt + `dron:new` + bayrak. Hop/Zod/ROUTE_AUTH_MAP el işi kaldı |
| Çalışma-zamanı ölçeği | 40 | **40** | In-memory rate-limit, Redis yok, çok instance varsayımı duruyor |

**Ağırlıklı toplam: 76/100** (hedef ≥75, karşılandı).

Hesap: 90×0.20 + 70×0.15 + 63×0.20 + 80×0.20 + 85×0.15 + 80×0.05 + 40×0.05 = 18 + 10.5 + 12.6 + 16 + 12.75 + 4 + 2 = **75.85 → 76**.

---

## 6. DOĞRULAMA

Çalıştırılan kapılar (bu tedavi oturumu):

- `npm run verify:v1-contract-artifacts` — OpenAPI, generated v1, kernel paket mührü OK
- `npm run typecheck:rail-is` — OK
- `npm run verify:api-auth` — 53 rota OK
- Vitest: v1 sözleşme, hop-gate, runtime-shield, kanonikleştirme, faz1 belge, rail-is lab, boundaries, idempotency, dron protokol, IDOR exam/portfolio, visa-stamp, profile-identity, legal-launch, visa-gate, need-based-mapping — ilgili senaryolar yeşil

`npm run test:surface` içinde **önceden kirli ağaçtan** kalan iki kilit hâlâ kırmızı olabilir ve bu tedavinin çıktısı değildir:

- `saha-pilotu-surface` / `cash-loop-catalog-migrate-surface`: SQL 8→9 (`20260912220000_academy_sterile_vitrine.sql`) ve Prisma klasör 32→33. Tedavi migration eklemedi.

Tarayıcı E2E bu oturumda koşulmadı (dev sunucusu + oturumlu vatandaş yok). Yazma hop’ları handler + yüzey + Zod + OpenAPI ile kilitlendi.

---

## 7. SEN OLSAYDIN NE YAPARDIN?

### 7.1 Bu dönüşümden sonra temel %100 doğru mu?

**Hayır — doğru yöne kilitlenmiş, %100 değil.**

Doğru olan: Anayasa ile kod artık aynı cümleyi söylüyor (paket çıkarılır, API-First yazma, mühürlü ders 1, video terk, Motor 2 keşif). Finansal SSOT, fail-closed, Zod→OpenAPI zinciri duruyor. Dron artık “yalnız okuyan vitrin” değil; cüzdanı doluysa eğitimi alıp ders bitirip sınav verip portföy senkronlayabilir.

Eksik olan, Tespit §4 Adım 3’ün **geri kalanı**:

1. **Cüzdan yükleme hop değil.** Dron nakit giremez; web `/cuzdan` köprüsü Bearer≠çerez sürtünmesini taşıyor. Satın alma hop’u “cüzdanı dolu varsay” demektir.
2. **Paket aynı commit’e göbekli.** `@yetkin/kernel` workspace’tir; ayrı deploy / semver botu yoktur. Amiral+dron hâlâ birlikte kesilir. Hedef mimarinin “sessizce kıramaz” vaadi CI `--check` ile yumuşatıldı, koparılmadı.
3. **Kayıt defteri tam otomasyon değil.** eslint sicilden türer; `ROUTE_AUTH_MAP` ve v1 hop hâlâ el işi. Scaffold kapalı doğan iskelet üretir, yayın üretmez.
4. **Dron donuk.** `publishFrozenUntilFaz1Close: true`. Hop sicili açık olsa da mağaza/Closed Testing yok.
5. **Ölçek katmanı aynı.** In-memory rate-limit çok instance’da yalan söyler.

Bu nedenle puan 100 değil 76: kanat takıldı, uçak hâlâ pistte.

### 7.2 Faz 2’de ilk iş ne olmalı? Kör nokta var mı?

**İlk iş (sıra zorunlu):** PayTR Merchant + Inngest + SMTP + exam sitting **ops yeşili** (`ops:runtime-readiness` çıkış 0) duruyorsa, Dron’u çözmeden önce **cüzdan yükleme halkasını** kapat:

1. Ya `POST /api/v1/dashboard/wallet-top-up` (Bearer + Idempotency, PayTR token’ı drona; iFrame native WebView’siz) — IAP yasağına dokunmadan,
2. Ya da web köprüsünü **tek oturum pasaportu** ile protokole bağla (magic-link / one-time code; “tarayıcıda tekrar giriş” yok).

Bundan önce `publishFrozenUntilFaz1Close: false` **yapılmaz**. Aksi halde mağaza, yükleyemeyen bir satın alma hop’u pazarlar (A5 dürüst yüzey ihlali).

**Hemen ardından:** Redis rate-limit port implementasyonu (`rate-limit-port.ts` arayüzü Tespit’te vardı). Sürü = çok instance; bellek sayacı sürünün antitezidir.

**Kör noktalar (hâlâ açık):**

| Kör nokta | Neden kritik |
|-----------|----------------|
| Cüzdan top-up hop yok | Yazma hop’ları “para varsay”; dron nakit giremez |
| Split (K-5) idari | Freelancer bid/accept hop’u bilinçli kapalı; Tezgâh Faz 2’dir |
| `LIVE_BROADCAST_SHUTDOWN = true` | Üretim 503 kilidi; “canlı platform” iddiası runbook tarihiyle duruyor |
| User God Model | Tüm dikey FK `User` hub; ikinci Postgres henüz yok — Faz 3’e kadar taşır, unutulursa sürü şişer |
| Curriculum/exam GET hop yok | Dron oyuncu durumunu `pulse` özetinden okur; tam müfredat gövdesi web BFF |
| Admin rol matriksi yok | Tek Super Admin UUID; ikinci operatör yok |
| Kernel semver yok | Paket var, yayın yok; 426 penceresi disiplinle değil umutla durur |
| Closed Testing uyku | Hop’lar laboratuvar; sahada yeşil halka yok |

**Yapmayacağım (Tespit ile aynı):** mikroservis bölünmesi, GraphQL, video diriltme, User hub’ını bu fazda dağıtma.

**Faz 2 kapanış cümlesi:** Tedavi, sürünün **sözleşme ve yazma omurgasını** kurdu. Sürü henüz **canlı bir ürün ağı değil** — bir Amiral, bir donuk Dron, paylaşılan saf paket ve 13 hop. Sonraki aşamanın ilk yeşili: dron içinden yükleme→satın alma→ders→sınav→vize halkası, Redis’li kenar, ve ancak o zaman `publishFrozenUntilFaz1Close: false`.
