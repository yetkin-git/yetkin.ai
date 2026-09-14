# TESPİT RAPORU — yetkin.ai: Canlı Sistem → Amiral Gemisi + Sürü Dron

| Alan | Değer |
|------|-------|
| Tarih | 13 Eylül 2026 |
| Hazırlayan | Senior Software Architect / Sistem Analisti ajanı |
| Kapsam | Canlı `yetkin.ai` codebase'i (Next.js monolit + `apps/rail-is` dron) |
| Hedef mimari | Amiral Gemisi + Sürü Dron (Shared Kernel / API-First Core) |
| Kaynak doğrulama | `.system_docs/` (7 belge) + `app/`, `lib/`, `prisma/schema/`, `proxy.ts`, `instrumentation.ts`, `eslint.config.mjs`, `.env.example`, `apps/rail-is`, `tests/` (307 dosya) doğrudan okundu |

> Yöntem notu: Bu rapor dosya taraması + kod okumasıyla üretildi. Varsayım cümlesi yok; her bulgunun arkasında dosya yolu var. Belge numaraları rapor içinde `[K1]`, `[A2]` gibi atıflarla izlenebilir.

---

## 0. Yönetici Özeti (30 saniyelik okuma)

1. **Canlı sistem nedir?** Disiplinli, fail-closed kültürlü, **pragmatik bir modüler monolit**. Tek Next.js deploy, tek Postgres, tek Prisma client. Finansal çekirdek (`amountMinor`, append-only defter, PayTR Merchant) sağlam. 53 API rotası, 8 hop'luk dar bir `/api/v1` dron sözleşmesi, donuk bir Expo dronu (`publishFrozenUntilFaz1Close: true`).
2. **Monolit mi, ayrışık mı?** **%80 disiplinli monolit.** ESLint import duvarları (kernel ↛ dikey, dikey ↛ dikey engine, UI ↛ Prisma) gerçek ve çalışıyor. Ama Shared Kernel bir **npm paketi değil** — aynı repoda `lib/kernel/` klasörü. Sürü dronlar bugün bu çekirdeği `npm install` ile tüketemez; HTTP ile dar bir alt kümeyi tüketebilir.
3. **Sürüye hazır mıyız?** **58/100.** Sözleşme altyapısı (Zod → OpenAPI → dron tipi codegen, zarf, idempotency, sürüm kapısı) hedef mimarinin en zor kısmını zaten çözmüş. Eksik: kernel paketleşmesi, v1'in yazma hop'larını kapsaması, oda kayıt mekanizması, paylaşılan rate-limit, Split.
4. **En sert bulgu:** `.system_docs/DRON_CLIENT_SPEC.md` içindeki **"Shared Kernel paketi yoktur ve çıkarılmaz"** cümlesi ile bu projenin **"Shared Kernel / API-First" hedefi doğrudan çelişiyor.** Biri değişmek zorunda. Bu rapor paketin çıkarılmasını öneriyor (gerekçe §3–§4).
5. **En acil tutarsızlık:** Mühürlü ders sayısı belgelerde çelişiyor — PEDAGOJI/README "30 mühürlü" derken STORAGE_CONTRACT/OPS_RUNBOOK "1 mühürlü (`01_office_ai-1`), 29 bake bekler" diyor. Tedavi fazından önce tek sayı ilan edilmeli.

---

## 1. MEVCUT DURUM ANALİZİ

### 1.1 Dizin yapısı (canlı iskelet)

```
yetkin.ai/                          # Tek deploy: Next.js 16 App Router (Vercel)
├── app/                            # Sayfalar + API (route group'lu)
│   ├── api/
│   │   ├── (kernel)/               # health, auth/*, wallet/top-up, admin/*, ai/chat, jobs/inngest, payments/webhooks/paytr, profile/*
│   │   ├── academy/                # courses/* (purchase/lock/exam/curriculum/listen/pdf), pulse, certificates, reviews, discussion
│   │   ├── career/                 # pulse, visas, portfolio
│   │   ├── freelancer/             # jobs, bids, contracts, messages, release/refund/dispute, squad, direct-offers
│   │   ├── dashboard/              # pulse, wallet-strip
│   │   ├── client/jobs/[id]/bids   # işveren teklif listesi
│   │   ├── paytr/callback          # PayTR panel alias (kanonik webhook ile aynı handler)
│   │   └── _gone/[...path]         # donmuş oda 410 yakalayıcı
│   ├── (public)/, (auth)/, (kernel)/, academy/, career/  # vitrin: Panel + Akademi + Kariyer + /vize kanıt URL'si
├── components/                     # RSC/istemci UI (Prisma importu yasak — eslint duvarı)
├── lib/
│   ├── kernel/   (~250 dosya)      # auth, payments, ledger, escrow, pricing, ai-gateway, http, security, jobs, notice, health, compliance, passport
│   ├── academy/  (engine, runtime, exam, curricula, tts, media-seal)
│   ├── career/   (visa-scope, proofs, portfolio)
│   ├── freelancer/ (motor, messages, contract-view, runtime)
│   ├── dashboard/, copy/, ui/, showcase/
├── prisma/schema/                  # base + kernel + academy + career + freelancer (dosya-bazlı dilim)
├── proxy.ts                        # TEK edge girişi (Next 16; kök middleware.ts yok)
├── instrumentation.ts              # boot: DNS, Prisma engine, prod readiness warn'ları
├── supabase/migrations/            # RLS + handle_new_user + katalog tohumu
├── apps/rail-is/                   # Expo native dron — DONUK LAB (mağaza yok)
├── archived/                       # 8 donmuş oda (studio, devlabs, kurumsal, hibe, arena, pazaryeri, junior, social)
├── yetkin_muze/                    # müze — build/index/import dışı
├── tests/ (307 dosya) + scripts/   # vitest + verify:* + ops:* + generate:*
└── .system_docs/ (7 belge)         # Anayasa, Manifesto, Pedagoji, Ops Runbook, Storage, Dron Spec, README
```

**Sayısal fotoğraf:**

| Gösterge | Değer | Kaynak |
|----------|-------|--------|
| API rotası (`route.ts`) | 53 | `app/api/**/route.ts` glob |
| Yayınlanmış v1 hop | 8 (7 GET + 1 POST) | `lib/kernel/http/v1-contract.ts` + `v1-hops-meta.ts` |
| Prisma dilimi | 5 dosya (kernel/academy/career/freelancer/base) | `prisma/schema/` |
| Kernel dosyası | ~250 (`lib/kernel/**`) | glob |
| Test dosyası | 307 | `tests/**/*.test.ts` glob |
| Kamu vitrini | 3 oda (Panel, Akademi, Kariyer) + `/vize` kanıt URL'si | `circuit-breakers.ts` |
| Kilitli yüzey | Freelancer (410) + 8 donmuş oda (410) | `circuit-breakers.ts`, `proxy.ts` |
| Dron durumu | Donuk lab; mağaza/TestFlight yok | `apps/rail-is/package.json` → `publishFrozenUntilFaz1Close: true` |

### 1.2 Veritabanı şeması (tek Postgres, dosya-dilimli Prisma)

**Çekirdek (`kernel.prisma`) — finansal SSOT:**

| Model | Rol | Kilit tasarım kararı |
|-------|-----|----------------------|
| `User` | Kimlik aynası (Auth UUID, Prisma id üretmez) | Tüm dikeylerin FK hub'ı — aynı zamanda en büyük bağlılık noktası (§1.4) |
| `Wallet` | Tek nakit SSOT (`userId+currencyCode` unique) | `amountMinor >= 0` CHECK; bakiye yalnız defter CTE'si ile değişir |
| `LedgerEntry` | Append-only defter | `idempotency_key` unique; UPDATE/DELETE trigger-yasaklı; CASCADE yok |
| `EscrowHold` | Emanet kilidi (bakiye DEĞİL) | `referenceKey` unique + `pspPaymentId`; `walletId` nullable (PSP hold cüzdana çivi çakmaz) |
| `PaymentOrder` | PSP siparişi | `merchantOid` unique; 6502 kasa rızası satırda mühürlü (`consentVersion` + 2 tik) |
| `PaymentAnomaly` | Mutabakat sapma kaydı | `user_id` yok (sipariş bulunamayabilir); CREDIT yazmaz |
| `PriceCatalogEntry` + `DecisionLedger` | Dinamik fiyat SSOT + gerekçeli zam defteri | Kodda satış fiyatı sabiti yok; `updated_by` doluysa migrate ezmez |
| `CheckoutPriceLock` | 15 dk kilit | Süresi bitmiş kilitle debit yok |
| `AiTokenUsage` | LLM gümrük defteri | `costMinor` aynı nakit birim |
| `HttpIdempotencyRecord` | Replay kalkanı | Unique `(user_id, route, key)` |
| `PaidCommandReservation` | Ücretli dış yan etki rezervi | İkinci bakiye değil |
| `FunnelDailyCounter` | Huni Adım 6 sayacı | Gün × adım satırı; hit başına şişmez |

**Dikey dilimler:**

- **`academy.prisma`**: `AcademyCourse` (fiyat YOK — katalogda) → `AcademyPurchase` (yalnız `SETTLED`) → `AcademyExam` (1:1, `questionsJson` mühürlü havuz) → `AcademyExamSitting` (HMAC JTI, tek tüketim) → `AcademyExamAttempt` (yalnız `GRADED`, sunucu puan) → `AcademyCertificate` (`certificateHash` + `curriculumSeal`, satın alınamaz, baraj 70). `AcademyLessonCompletion` + `AcademyAudioCache` (locator, Base64 yok).
- **`career.prisma`**: `CareerVisaStamp` (kaynak: akademi sertifikası VEYA freelancer RELEASE) → `CareerPortfolioItem` (vizesiz serbest içerik yok). Para yok — doğru.
- **`freelancer.prisma`**: `FreelancerJob` (OPEN/AWARDED/CANCELLED, `visaPathwayId`) → `FreelancerBid` → `FreelancerContract` (`escrowHoldId` **string FK** — çekirdek freelancer'ı tanımaz, doğru yön) → `FreelancerDispute` (2 tur + AI bilirkişi) + `FreelancerContractMessage` (teslim/revizyon artifact; milestone tablosu yok) + `FreelancerSquad` (ikinci cüzdan yok, `shareBps`).

**Şema hükmü:** Finansal modelleme olgun ve dürüst. `amountMinor` her yerde; çift bakiye yok; emanet bakiye değil referans; rıza satırda. Zayıf nokta: `User` modelindeki ~25 ters ilişki — her yeni dron dikeyi bu hub'a FK ekleyecek ve "çekirdek dikeyi tanımaz" ilkesi Prisma zorunluluğuyla her seferinde delinecek (çözüm §4, Adım 3).

### 1.3 Aktif PayTR entegrasyonu (uçtan uca akış)

**Tek canlı kanal: PayTR Merchant iFrame (Akademi/üye işyeri). Pazaryeri Split = kasıtlı stub.**

```
[Vatandaş /cuzdan] ──POST /api/wallet/top-up──▶ [Amiral]
   │  session + rate-limit + Idempotency-Key(UUID) + consent+billing(Zod)
   │  persistCheckoutBilling → port configured? → settleHttpIdempotency
   │  merchantOid = f(userId, idempotencyKey) [deterministik; Date.now yok]
   │  PaymentOrder PENDING (+rızalar) → user_ip (TRUSTED_PROXY_HOPS=2) → beginCheckout
   ▼
[PayTR get-token] ──token+iframeUrl──▶ [Vatandaş iFrame'de öder]
   │  (merchant_ok/fail_url = /cuzdan dönüşü; CREDIT YAZMAZ)
   ▼
[PayTR POST Bildirim URL] ──/api/paytr/callback = /api/payments/webhooks/paytr──▶ [Amiral]
   │  auth="webhook": edge JWT/Origin/rate-limit atlar; HMAC handler'da
   │  probe/resmi-IP → düz metin 200 "OK" (CREDIT YOK)
   │  IP allowlist → HMAC (merchant_oid+salt+status+total, timing-safe)
   │  success → settlePaytrWebhookSuccess:
   │     PaymentOrder FOR UPDATE + LedgerEntry.idempotency_key wallet-top-up:{oid}
   │     + CLEARED kısa-devre + total_amount==amountMinor eşleşmesi
   ▼
[LedgerEntry CREDIT + PaymentOrder CLEARED] ──▶ [Akademi DEBIT: POST .../purchase]
   │  purchase: lock → price-lock → wallet DEBIT → AcademyPurchase SETTLED
   │  → Inngest makbuz kuyruğu (SMTP yoksa honest-skip; satın alma kesilmez)
 Inngest valör (30 dk) + emanet TTL (14 gün) + TTL uyarısı (48 saat kala)
```

**Doğrulanan güvenlik özellikleri** (`route.ts` + `webhook-settle.ts` + `checkout.ts` + runbook §4):

- Üretimde `PAYTR_SANDBOX`/`PAYTR_ALLOW_MOCK_CHECKOUT` = throw (`paytr.production_safety`).
- Mock checkout CREDIT yazmaz; PENDING aynı istekte FAILED kapanır (takılmaz PENDING yok).
- Mükerrer bildirim → tek CREDIT (DB unique + `FOR UPDATE` + CLEARED kısa-devre).
- Tutar uyuşmazlığı → `PaymentAnomaly` (sessiz kabullenme yok).
- Clearing throw → Inngest defer; Inngest yoksa 500/503 (PayTR tekrarlar; sahte ACK yok).
- `user_ip` loopback/RFC1918/IPv6 → fail-closed (PayTR IPv4 ister).
- `LIVE_BROADCAST_SHUTDOWN` açıkken webhook 503 (CREDIT yok, retry).

**Split tarafı:** `paymentsPort.split` stub → `not_configured` → freelancer `accept` **503**; kamu `/freelancer` + `/api/freelancer/*` + `/api/client/jobs/*` **410** (`FREELANCER_PUBLIC_SURFACE_LOCKED`). Merchant onayı Split izni değil — belgeler ve kod bu ayrımı tutarlı uyguluyor. Doğru, ama Faz 2'nin kritik yolu tamamen idari (Pazaryeri sözleşmesi + alt satıcı onboard) — teknik hazırlık bitmiş sayılır.

### 1.4 Core ↔ modül ayrışması: monolit mi?

**Hüküm: Disiplinli modüler monolit. Mikro-servis değil; mikro-app altyapısı kısmen hazır.**

**Ayrışmanın GERÇEK olduğu kanıtlar:**

| Duvar | Mekanizma | Dosya |
|-------|-----------|-------|
| Kernel ↛ dikey | ESLint `no-restricted-imports` (`@/lib/<oda>` yasak) | `eslint.config.mjs` |
| Dikey ↛ dikey engine/runtime/prisma-store | ESLint oda başına kural | `eslint.config.mjs` |
| freelancer ↛ career (EARNINGS_WALL) | ESLint | `eslint.config.mjs` |
| career/freelancer ↛ academy | ESLint (kimlik `lib/kernel/catalog-ids` üzerinden) | `eslint.config.mjs` |
| UI ↛ Prisma/server-only/engine | ESLint (`app/**` − `app/api/**`, `components/**`) | `eslint.config.mjs` |
| Sözleşme tek elde | `v1-contract.ts` (Zod) → `generate:openapi-v1` → `generate:v1-client` (dron tipi) | `scripts/`, `package.json` |
| Tek edge girişi | `proxy.ts`: 410 kilitleri → hop-gate → sürüm kapısı → Origin guard → rate-limit → auth kind → (v1 rewrite) | `proxy.ts` |

**Birleşik (monolit) kalanlar — dürüst liste:**

1. **Tek deploy, tek süreç.** Web + API aynı Next.js instance. `lib/kernel/security/http-rate-limit.ts` in-memory `Map` — ikinci replica kotayı görmez (runbook §7 bunu açıkça yazıyor: "sessiz delik").
2. **Kernel paket değil, klasör.** `lib/kernel/` ~250 dosya; dron `lib/kernel` import edemez ("HTTP istemcisi `apps/rail-is` içindedir; `lib/kernel` import etmez"). Paylaşılan tipler codegen ile kopyalanıyor (`apps/rail-is/src/contract/v1.ts`), versiyonlu paket ile değil.
3. **Web API-First değil.** Amiral RSC'leri `lib/<modül>` fonksiyonlarını doğrudan çağırıyor (B1 bunu "pragmatik serbestlik" diye meşrulaştırıyor). Sonuç: 53 rota varken v1'de yalnız 8 hop. Sınav, müfredat tamamlama, kilit, dinle, portföy, cüzdan yükleme, profil, admin — hepsi web-only BFF. Yeni bir dron bu yetenekleri HTTP ile tüketemez.
4. **Tek DB, User hub.** Tüm dikeyler `User`'a FK ile bağlı; RLS + IDOR testleri bu hub'ı koruyor ama yeni dikey = yeni FK = hub büyümesi.
5. **Dron donuk.** `apps/rail-is`: 7 GET hop + purchase yasak + Faz 2 throw. Altyapı (Bearer-only, cookie-strip, 401 refresh-once, allowlist, parse-fail=protocol error) kaliteli ama tüketici yok.

**Ayrışma skoru (bu bölümün özeti):** Kod disiplini 85/100, çalışma-zamanı ayrışması 35/100. Sürü mimarisi ikincisini ister — §3'te puanlanıyor.

---

## 2. KILAVUZ DOKÜMANLARIN SORGULANMASI

> Talimat gereği kutsal sayılmadı. Her belge önce hakkıyla övüldü, sonra sertçe eleştirildi. "Güncellenmeli" maddeleri Tedavi fazının girdi listesidir.

### 2.1 ANAYASA.md — hüküm: A Katmanı kalmalı, B Katmanı sürüye göre revize edilmeli

**Güçlü yanlar (korunacak):** A1 (`amountMinor`, tek defter, append-only), A2 (S43 fail-closed, çekim rotası yasağı), A3 (service_role sızdırmazlığı, RLS/IDOR, idempotency), A4 (sunucu puanlı mühür, baraj 70, açık doğrulama), A5 (dürüst yüzey, sahte bakiye yasağı). Bunlar gerçek kırmızı çizgi; teknik borç tartışmasına kurban edilmemeli.

**Sert eleştiri — tek tek maddeler:**

| # | Madde | Sorun | Öneri |
|---|-------|-------|-------|
| B1-a | "Grep polisliğinin sonu" + "katmanlar serbestçe çağırabilir" | İyi niyetli ama **API-First hedefiyle çelişir**: RSC'nin `lib/`'i doğrudan çağırması serbest kalırsa v1 hop sicili hep eksik kalır (bugün 8/53). Serbestlik web içiyle sınırlanmalı; dronların tüketeceği yetenekler v1'e taşınmalı. | B1'e ekle: "Yeni yetenek önce v1 hop olarak açılır; RSC direct-call yalnız okuma/query katmanında serbesttir." |
| B1-b | "Web RSC `load` serbestçe kullanır; `/api/v1` yalnız mobil/dron" | Bu cümle **iki başlı veri erişimini kalıcılaştırıyor** — sürüde her yeni istemci (web dron, mini-app) ya RSC'ye gömülür ya da v1'e alınmak için "ürün kararı" bekler. | "Web de yazma işlemlerinde v1 zarfını konuşur" hedefine çevir; RSC direct-call'ı kademeli daralt. |
| B1-c | Import duvarı "B1 mühendisliği olarak durur" | Duvar `eslint.config.mjs` + `rooms.ssot.ts` + `verify-boundaries.ts` üçlüsüne gömülü ve **statik liste bazlı**. Yeni dron dikeyi = 3 dosyada el değişikliği + yeni kural. Sürüde dikey eklemek "anayasa değişikliği" ağırlığında olmamalı. | Duvarı liste-bazlıdan **kural-bazlıya** çevir: `lib/dronlar/<id>/` konvansiyonu + tek kayıt dosyası + scaffold. |
| B2-a | "Faz 1 kamu vitrini 3 oda; Freelancer 410" | İş kararı olarak doğru (PayTR B2C), ama **mimari belgeye faz takvimi gömmek** belgeyi kronik eskitir. Faz bitince Anayasa değişiyor — Anayasa takvim değildir. | Faz durumunu `docs/` durum dosyasına taşı; Anayasa'da yalnız kilit mekanizması kalsın. |
| B2-b | "Oda tavanı esnektir" vs `rooms.ssot.ts`: "5. oda ürün kararı olmadan eklenmez" | **Belge ile kod çelişiyor.** Anayasa esneklik vaat ederken kod + Manifesto + eslint yeni odayı yasaklıyor/yavaşlatıyor. Sürü = çok oda; bu çelişki çözülmeden sürü kurulamaz. | Tek cümlelik kayıt kuralı yaz (§4 Adım 2); hem belgeyi hem kodu ona hizala. |
| B2-c | 4 sığınak listesi (`/profil`, `/cuzdan`, `/pasaport`, `/admin`) | Sürüde `/cuzdan` ve `/profil` her dronun ihtiyacı — "sığınak" (yan alan) statüsü anlamsızlaşır; bunlar **çekirdek yetenek** (identity, billing) olmalı. | Sığınak kavramını emekli et; identity/billing/passport'u kernel yetenekleri olarak yeniden adlandır. |
| B4 | Pedagoji detayının Anayasa'da olması (karaoke, süre bandı, SKU sayısı) | **Katman ihlali.** Anayasa'nın B katmanı bile olsa; ders süresi anayasa maddesi olamaz. Değişiklik maliyeti yüksek, okunabilirlik düşük. | B4'ü tek cümleye indir ("müfredat standardı PEDAGOJI.md §F'dedir") ve detayı taşı. |
| B5 | Split stub'ın "ayrı faz, ayrı sözleşme" diye süresiz park edilmesi | Doğru tespit, ama **çıkış kriteri yok**: hangi metrik/karar Split'i açar, kim imzalar, teknik todo ne? Park yeri sonsuz garaja dönüşür. | B5'e "Faz 2 açılış kriterleri" checklist'i ekle (sözleşme + onboard + hop geri-yazımı + kapalı test). |

### 2.2 MANIFESTO.md — hüküm: vizyon belgesi operasyona sızmış; ikiye bölünmeli

**Güçlü yanlar:** Tek cümlelik değer önerisi net ("kanıtlanmış yetkinlik"); 3 motorlu gelir haritası dürüst (Motor 1 gün 0, Motor 2/3 Faz 2+); "güven bağırmaz" tasarım duruşu tutarlı.

**Sert eleştiri:**

| # | Madde | Sorun | Öneri |
|---|-------|-------|-------|
| M-1 | Bölüm 2–4'te hop sayıları, SKU slug'ları, env bayrakları (`MARKETPLACE_SPLIT_LIVE`), 403 kodları | **Vizyon belgesine operasyon gömülmüş.** Her deploy/ingest bu belgeyi eskitir; Nitekim STORAGE ile PEDAGOJI arasındaki "1 vs 30 mühürlü ders" çelişkisi bu sızıntının meyvesi. | Manifesto'dan tüm sayı/slug/bayrak/kod sil; "durum" `docs/DURUM.md` (tarihli, haftalık) dosyasına taşınsın. |
| M-2 | Kural 2 (Vize Kapısı): 403 kodları, OPEN bayrağı, `FREELANCER_*_NEED_IDS` | Bu bir **teknik şartname**, manifesto değil. Ürün ekibi manifesto okuyup kod yazamaz; mühendis manifesto okuyup gereksinim çıkaramaz. | Kural 2'yi `docs/specs/freelancer-vize-kapisi.md`'ye taşı; Manifesto'da 3 cümlelik ilke kalsın. |
| M-3 | "Dron Faz 1'de donuk laboratuvardır; Shared Kernel paket çıkarılmaz" | Vizyon belgesi **hedef mimariyi yasaklıyor.** Sürü dron hedefi varken "paket çıkarılmaz" cümlesi manifestoda duramaz — bu, tedavinin 1 numaralı gündem maddesi. | Cümleyi tersine çevir: "Faz 2'de kernel `@yetkin/kernel` paketi olarak çıkar; dronlar onu tüketir." |
| M-4 | "Oda tavanı esnektir" + "13. oda dogmasına takılma" | Savunma dilinde yazılmış; kural koymak yerine eski kavgaları anlatıyor. Yeni CTO/ekip bu cümlelerden ne yapacağını çıkaramaz. | Somut kurala çevir: "Yeni oda/dron = kayıt + sözleşme + bayrak; yasak liste değil, checklist vardır." |
| M-5 | Motor 2 (B2B) "Faz 2+" ama kurumsal oda 410 + `kurumsal` arşivde | Manifesto Motor 2'yi gelir haritasında tutarken kod odayı **arşive** kaldırmış. Ya arşiv kararı erken (kodu dondur, şemayı tut) ya manifesto iyimser. | Karar ver: B2B ilk müşteri profili belli değilse Motor 2'yi "keşif" statüsüne indir. |
| M-6 | SEN aksı + Quiet Luxury'nin manifesto seviyesinde dogma riski | Dil/estetik tercihi vizyon belgesinde; `verify:sen-axis` nightly'de (doğru). Ama manifesto dili "benimsenir" (emir kipi) — B2B dronlarda (kurumsal müşteri) "sen" dili yanlış olabilir. | "Varsayılan B2C sesimiz SEN'dir; dron başına locale edilebilir" diye esnet. |

### 2.3 PEDAGOJI.md — hüküm: içerik standardı güçlü, belge şişkin ve yer yer çelişkili

**Güçlü yanlar:** "Yayın = makale + mühürlü karaoke" net ürün tanımı; üretim sırası disiplini (metin → konuşma → ses → cue → görsel); sıfır re-bake SOP'u (skip preventer, RPM kalkanı, `--seal` kapısı) gerçek saha bilgeliği; "konunun hakkı" ilkesi ezberciliği kırıyor.

**Sert eleştiri:**

| # | Madde | Sorun | Öneri |
|---|-------|-------|-------|
| P-1 | **"30 mühürlü ders" vs STORAGE "1 mühürlü ders" çelişkisi** | En kritik belge tutarsızlığı. Vitrin cümlesi ("5 SKU × 6 ders = 30 mühürlü") ile depo sözleşmesi ("1 mühürlü, 29 bake bekler") aynı anda doğru olamaz. Müşteri/denetçi hangisine inanacak? | 48 saat içinde tek sayı ilan et; SEM/Ads cümlelerini o sayıya kilitle; diğer belgeyi düzelt. |
| P-2 | §E–§F'nin TTS SOP detayları (RPM gap 6500ms, 10–12 istek, fonetik örnekleri) | Bunlar **operatör el kitabı**, pedagoji değil. Pedagoji belgesi 160+ satır; yeni eğitmen/içerikçi aradığını bulamaz. | SOP detayını `docs/ops/akademi-bake-elkitabi.md`'ye taşı; PEDAGOJI'de ilke + bant tablosu kalsın. |
| P-3 | §F "SUPER ADMIN kilit" (45–90 dk, 6–8 ders, 7–12 dk) | Üretim bandı "kilit" ilan edilmiş — ama B4 "sabit ders adedi yayın makalesini kesmez" diyor. **Aynı külliyat içinde kilit + kesmez yan yana.** Hangisi bağlayıcı? | Netleştir: bant = "mühürlü konuşma metni hedefi"; makale = "konunun hakkı". "Kilit" kelimesini "hedef bandı" yap. |
| P-4 | "Kanon 13 başlık vs vitrin 5 SKU" + "06–13 taslak" | Kanon kavramı vitrin gerçeğiyle yarışıyor; dışarıya "13 kursluk platform" izlenimi sızarsa A5 (dürüst yüzey) ihlali olur. | Kanon listesini iç belgeye al; dışarıda yalnız ingest edilmiş SKU konuşulur kuralını yaz. |
| P-5 | Junior odası tartışmasının pedagoji belgesinde olması | `/junior` 410 kararı yasal/ürün kararı; pedagoji belgesinde 1 paragraf hak etmiyor. Belge oda siyasetine bulaşmış. | Sil; tek cümle: "18 yaş altı ürün yoktur (bkz. ANAYASA B2 + circuit-breakers)." |
| P-6 | "Video/WebM yoktur" (×5 tekrar) + "sinematik katman hedefi" | Aynı belgede hem "yoktur" hem "hedef" — okuyucu yol haritasını çıkaramaz. Katman 4 (video) hedef mi, terk mi? | Karar: video 12 ayda yoksa "terk edildi" de; varsa çeyrek hedefi yaz. İkircik SEM'i de mühendisliği de zehirler. |

### 2.4 Yan belgeler (kısa hükümler)

- **OPS_RUNBOOK.md**: En değerli belge (590 satır, gerçek saha reçetesi). Sorunu: **tek dosya**. Dron ekibi, akademi operatörü ve SRE aynı dosyayı okuyor. Tedavide 4 parçaya böl: `ops-db.md`, `ops-paytr.md`, `ops-inngest.md`, `ops-dron.md`. Ayrıca §15 (Closed Testing reçetesi) Faz 2'ye kadar ölü ağırlık — "uyku" başlığına al.
- **STORAGE_CONTRACT.md**: Net ve dürüst. Sorunu: P-1 çelişkisinin bir tarafı. Ayrıca `lesson-audios` bucket'ının provision durumu belirsiz ("migrate kilit listesinde değildir; ayrı provision") — provision yapıldı mı, yapılmadı mı, tek satırda yazılmalı.
- **DRON_CLIENT_SPEC.md**: Teknik olarak en olgun belge (Bearer-only, refresh-1-retry, 401/426 matrisi, allowlist). Sorunu: M-3'teki yasak cümlesi (§7: "Shared Kernel paketi yoktur ve çıkarılmaz") + "hop alt kümesi ürün kararıdır" ifadesi v1 genişlemesini **yasak gibi** okutuyor. Tedavide bu iki cümle hedef mimariye göre yeniden yazılmalı.
- **README.md (sistem_docs)**: İyi kapak. Sorunu: kapak da operasyon taşıyor (oda sayıları, faz cümleleri) — kapak 20 satıra inmeli, gerisi link.

---

## 3. SÜRÜ DRON MİMARİSİNE UYUM TESTİ

### 3.1 Puan: **58/100** — "temel sağlam, kanatlar takılmamış"

| Boyut | Puan | Gerekçe (kanıt) |
|-------|------|-----------------|
| **Sözleşme-first altyapı** | 85/100 | Zod SSOT → OpenAPI + dron tipi codegen (`generate:openapi-v1`, `generate:v1-client`), `--check` ile CI kapısı, zarf guard'ları, `publishedDataPaths` (sessiz alan düşürme yasağı). Bu, sürünün en zor parçası ve **hazır**. |
| **Kimlik (auth)** | 70/100 | Supabase JWT + edge JWKS/HS256 + `requireSession` handler doğrulaması + `auth-session` hop'u. Dron refresh akışı spec'li. Eksik: token yenileme dron SDK'sında değil (Supabase SDK'ya emanet), cihaz/oturum yönetimi yok, admin rolü tek UUID (rol matriksi yok). |
| **Ödeme** | 55/100 | Merchant port olgun (idempotent, HMAC, anomaly, valör). Ama: **tek PSP, tek kanal** (cüzdan yükleme); Split stub; dron purchase yasak (IAP riski doğru yönetilmiş ama alternatifsiz); mikro-app başına fiyat/komisyon modeli yok (katalog var, dron kotası yok). |
| **Veri paylaşımı** | 45/100 | v1 8 hop (7'si okuma). Yazmaların çoğu web-only BFF. Dron `purchase/exam/curriculum/portfolio/top-up` tüketemez. Paylaşım mekanizması HTTP+zarf (doğru) ama **kapsama %15** (8/53). |
| **Kernel paketlenmesi** | 20/100 | `@yetkin/kernel` yok; codegen-kopya ile yetiniliyor. Sürümleme/changelog/bağımlılık yönetimi yok. Dron ile Amiral'in sözleşmesi "aynı commit"e göbekten bağlı — ayrı deploy yapılamaz. |
| **Dikey açma maliyeti** | 35/100 | Yeni oda = `rooms.ssot` + eslint + `verify-boundaries` + circuit-breaker + route-auth-map + hop sicili + test el işçiliği. Scaffold yok, kayıt defteri yok, checklist yok. |
| **Çalışma-zamanı ölçeği** | 40/100 | In-memory rate-limit (çok instance'a kapalı), Redis yok, Inngest/SMTP opsiyonel, tek süreç varsayımı. Sürü = çok instance; bu katman Faz 2'de zorunlu. |

**Ağırlıklı toplam: 58/100.** (Sözleşme %20, auth %15, ödeme %20, veri %20, paket %15, dikey-maliyet %5, ölçek %5.)

### 3.2 Amiral Gemisi'nin dronlara bugün sunabildikleri (hizmet haritası)

| Yetenek | Mekanizma | Dron erişimi | Not |
|---------|-----------|--------------|-----|
| Oturum doğrulama | `GET /api/v1/auth/session` (Bearer) | ✅ açık | Refresh dron tarafında (Supabase SDK) |
| Sağlık | `GET /api/v1/health` (public, başlıksız) | ✅ açık | DB/Auth/Inngest/PayTR sicili |
| Cüzdan okuma | `GET /api/v1/dashboard/wallet-strip` | ✅ açık | `live:false` → "henüz yüklenemedi" (dürüst) |
| Akademi nabız | `GET /api/v1/academy/pulse` | ✅ açık | Satın alma/sınav özeti |
| Kariyer nabız + vizeler | `GET /api/v1/career/pulse`, `/visas` | ✅ açık | Vize kapısının okuma yüzü |
| Mühür doğrulama | `GET /api/v1/academy/certificates/{hash}` (public) | ✅ açık | `userId` sızdırmaz; 400/404 ayrımı temiz |
| Akademi satın alma | `POST .../purchase` | ❌ `dronForbidden` (403 + handler defense-in-depth) | IAP politikası doğru; ama dron kullanıcısı satın alamıyor — web köprüsü (`/cuzdan` Linking) tek yol |
| Cüzdan yükleme | `POST /api/wallet/top-up` | ❌ hop değil (web-only) | Dron: sistem tarayıcısında `/cuzdan` açar; Bearer≠çerez (kullanıcı web'de tekrar giriş yapabilir) |
| Sınav/müfredat/kilit/dinle | web-only BFF | ❌ | Diyar A kilitli; dron eğitim satamaz/bitiremez |
| Freelancer (8 hop) | sicilden düşürüldü; kenar 410 | ❌ | Faz 2'de geri yazılacak; DTO'lar korunuyor (doğru) |
| Sürüm zorunluluğu | `X-Rail-Min-Version` + 426 kilit ekranı | ✅ | Eski binary fail-closed; "sessiz uyumluluk" yok |
| CORS | `RAIL_DRON_ORIGINS` (boş=saf native) | ✅ | Joker yasak, credentials yok — doğru |

**Özet:** Amiral bugün dronlara **kimlik + okuma + kanıt** sunuyor; **para ve yazma** sunmuyor. Sürü dronlar (iş yapan mikro-app'ler) için bu yetmez — §4'teki 3 adım bu boşluğu kapatır.

### 3.3 Kritik yol analizi (sürüye giden yolda ne tıkanır?)

1. **Paket yok → ayrı deploy yok.** Dron ve Amiral aynı commit'in codegen çıktısını paylaşıyor. Amiral deploy'u dron sözleşmesini sessizce değiştirebilir (CI `--check` yakalar ama bu "birlikte deploy" zorunluluğu demek — sürünün antitezi).
2. **Yazma hop'ları yok → dronlar vitrin.** Satın alma/sınav/teklif/kabul/teslim olmadan dron "okuyan vitrin"dir. İlk yazma hop'larının (purchase? bid?) IAP/Split kararlarıyla açılması şart.
3. **Oda kaydı yok → her dron özel proje.** 9. dikeyin maliyeti 4. ile aynı (yüksek). Sürü ekonomisi için marjinal dikey maliyeti düşmeli.

---

## 4. SEN OLSAYDIN NE YAPARDIN? (BEYİN FIRTINASI)

### 4.1 Platform kurgusu doğru mu? — hüküm: teknik omurga doğru, iş kanadı tek motorlu

**Doğru kararlar (alkış):**

- **Finansal SSOT disiplini.** `amountMinor` + append-only + tek Wallet + rıza satırda. Çoğu startup'ın 3. yılında ağlayarak eklediği şey gün 0'da var.
- **Fail-closed kültürü.** `not_configured`/503/410/426 matrisi tutarlı; sahte yeşil yok. Bu kültür sürüde 10 kat değerlenir (dronlar birbirine sahte başarı basamaz).
- **Sözleşme-first tohum.** Zod → OpenAPI → dron tipi zinciri, bu ölçekte bir ekip için lüks değil vizyon. Sürünün temeli atılmış, farkında olmadan.
- **Freelancer'ı 410 ile dondurup motoru silmemek.** Silmek kolaydı; sicili korumak pahalı ve doğruydu. Faz 2 maliyeti yarıya indi.
- **Dron'u erken dondurmak.** 410/404 basan bir uygulamayı mağazaya sürmemek (Closed Testing'i ertelemek) olgun bir karar.

**Hatalı / eksik tasarım kararları (acıtacak liste):**

| # | Karar | Neden hatalı/eksik | Bedeli |
|---|-------|-------------------|--------|
| H-1 | "Shared Kernel paket çıkarılmaz" yasağı | Hedef mimariyle çelişiyor (§0 bulgu 4). Gerekçesi (muhtemelen "erken soyutlama yapma") Faz 1'de doğruydu; sürü hedefi ilan edilince **teknik borca** dönüştü. | Her dron codegen-kopya ile besleniyor; ayrı sürüm/deploy imkânsız. |
| H-2 | RSC direct-call'ın "pragmatik serbestlik" diye meşrulaşması | Kısa vadede hızlı, uzun vadede API-First'in mezarı. 45 rota v1 dışında kaldı çünkü "gerekmedi". | Dron yetenek açlığı (§3.2 tablosu). |
| H-3 | Oda kavramının sayfa-grubu + anayasa-maddesi olarak çifte kilitlenmesi | "Oda" hem URL prefix'i hem Anayasa B2 maddesi hem eslint listesi. Yeni iş fikri = anayasa müzakeresi. Mikro-app paradigması öldü doğmadan. | İnovasyon vergisi: her yeni dikeyde hukukî ağırlıkta süreç. |
| H-4 | `User` hub'ına sınırsız FK | Prisma'nın dayattığı ters ilişkiler `User`'ı God Model'e çeviriyor. 5. dikeyde dosya okunamaz olacak. | Şema kırılganlığı; dikey silmek (arşiv) bile User'a dokunur. |
| H-5 | Gelir tek motorlu (Akademi B2C) + B2B arşivde | Manifesto 3 motor anlatıyor; kod 1 motor çalıştırıyor. Motor 2'nin odası **arşivde** — dondurulmuş değil, taşınmış. | Strateji-kod makası; B2B kararı verilirse sıfırdan dönüş maliyeti. |
| H-6 | Rate-limit'in sonsuz "tek süreç" varsayımı | Runbook dürüstçe yazmış ama yol haritasında Redis/instance planı yok. İlk trafik sıçramasında ya delik (çok instance) ya tavan (tek instance). | Ölçek riski; sürüde her dron ayrı trafik demek. |
| H-7 | 307 test dosyasının bir kısmının donmuş odalara ait olması (`tests/studio/*`, `tests/arena/*`, `tests/pazaryeri/*`…) | Arşiv kodu test de taşıyor; `test` script'i exclude listesiyle ayakta. Suite'in neyi koruduğu bulanık. | CI güven erozyonu; "yeşil" ne demek, kimse tam bilmiyor. |

### 4.2 Baş mimar olsaydım: ilk 3 adım

**ADIM 1 — Kernel'i gerçek Shared Kernel yap (hafta 1–3): `@yetkin/kernel` paketi + sözleşme sürümleme**

- `lib/kernel/{http,security/money,catalog-ids}` → npm workspace paketi `@yetkin/kernel` (pure: Prisma/Supabase bağımlılığı yok; Zod + tip + saf fonksiyon).
- Kalan `lib/kernel` (Prisma store'lar, Supabase, Inngest) Amiral'de kalır (`@yetkin/amiral-kernel` veya `lib/`).
- `apps/rail-is` codegen-kopya yerine paketi `npm install` eder; sözleşme sürümü `package.json`da kilitlenir (`^1.x`).
- Sonuç: Amiral deploy'u dron sözleşmesini **sessizce kıramaz**; kırıcı değişiklik = major sürüm + 426 penceresi. "Paket çıkarılmaz" cümlesi tarihe karışır.
- Kabul kriteri: dron `npm update @yetkin/kernel` ile sözleşme alır; codegen `src/contract/v1.ts` kopyası silinir; CI'da `verify:v1-contract-artifacts` paket sürümünü doğrular.

**ADIM 2 — Dikey açma maliyetini 10× düşür (hafta 2–4): dron kayıt defteri + scaffold**

- `rooms.ssot.ts` statik listesinden **kayıt defterine**: `lib/dronlar/kayit.ts` (id, path, header, hop listesi, bayrak, sahip ekip).
- `npm run dron:new -- --id=<ad>` scaffold'u: `lib/<id>/` iskeleti + prisma dilim şablonu + 1 örnek hop (Zod+handler+test) + eslint'e otomatik düşen kural + dron ekran taslağı.
- Circuit-breaker'lar sabit `true`'dan **bayrak okumaya** (env/DB): `DronBayrakları.isKapali(id)` — yeni dron "kapalı doğar, bayrakla açılır" (mevcut 410 kültürü korunur, mekanizma genelleşir).
- `ROUTE_AUTH_MAP` ve hop sicili kayıttan **türetilir** (el yazımı harita tarihe karışır; `verify:api-auth` türetmeyi doğrular).
- Kabul kriteri: stajyer mühendis 1 günde "hello-dron" açar; PR'da el yapımı eslint/rooms değişikliği yoktur.

**ADIM 3 — Para ve yazmayı dronlara aç (hafta 3–6): ödeme/auth/veri servisleşmesi**

- **Auth:** `auth-session`'a cihaz/oturum bilgisi ekle; dron SDK'sına (`@yetkin/dron-sdk`, Adım 1'in kardeşi) refresh+retry göm (her dron Supabase SDK cambazlığı yapmasın); admin tek-UUID'den rol matriksine (`super_admin`, `katalog_yoneticisi`, `destek_okuma`).
- **Ödeme:** `paymentsPort`'u `PaymentProvider` arayüzünde tut, `MarketplaceSplitPort`'u gerçek implementasyona hazırla (Split sözleşmesi idari; kod arayüzü bugünden sabitlensin); dron-içi satın alma için **web-checkout köprüsünü protokole bağla** (derin link + dönüş senkronu; "tarayıcıda tekrar giriş" sürtünmesini magic-link/oturum-pasaport ile sıfırla); kataloga `dronKota` (dron başına fiyat/komisyon) alanı ekle.
- **Veri:** v1'e ilk 5 yazma hop'unu taşı (önerilen sıra: `academy-purchase` [dron yasağı IAP kararıyla birlikte gözden geçir] → `academy-curriculum` [ders tamamla] → `career-portfolio` [portföy yaz] → `freelancer-bid` + `freelancer-accept` [Split ile]). Her hop: Zod → handler → dron SDK metodu → test.
- **Ölçek:** rate-limit'e Redis portu aç (`rate-limit-port.ts` arayüzü zaten var — implementasyonu yaz); Inngest'i prod zorunluluğu yap (readiness çıkış 1 zaten var, disiplin uygula); SMTP'yi gün-0 Vanguard'a al.
- Kabul kriteri: donuk dron çözülür (`publishFrozenUntilFaz1Close: false`), kapalı testte kayıt→yükleme→satın alma→sınav→vize halkası **dron içinden** (web köprüsü dahil) döner.

**Bilinçli olarak YAPMAYACAĞIM şeyler:** mikro-servise bölünme (operasyonel lüks; monolit deploy + paket sözleşme yeterli), GraphQL geçişi (zarf+REST sürü için yeterli), User hub'ını dağıtık kimliğe çevirme (tek DB faz 3'e kadar taşır), video katmanını diriltme (P-6 kararı verilmeden tek satır yazmam).

---

## 5. SONRAKİ AŞAMA ÖNERİSİ (Tedavi/Dönüşüm — CEO + Super Admin aksiyonları)

### 5.1 Karar masası (CEO — 7 gün içinde, ertelemesiz)

| # | Karar | Seçenekler | Önerim | Neden acil |
|---|-------|-----------|--------|------------|
| K-1 | "Paket çıkarılmaz" yasağı kalkıyor mu? | Kalkar / Kalır | **Kalkar.** M-3 cümlesi silinir, §4 Adım 1 onaylanır. | Kalmaya devam ederse bu raporun hedef mimarisi ölü doğar; sürü kurulamaz. |
| K-2 | Mühürlü ders sayısı kaç? (P-1) | 1 / 30 / arası | **Gerçeği say, ilan et, SEM'i kilitle.** | Reklam + vitrin + denetçi aynı sayıyı görmeli; A5 ihlali riski. |
| K-3 | Video katmanı (Katman 4) hedef mi, terk mi? (P-6) | Hedef (çeyrek ver) / Terk (yaz, kapat) | **12 ay yoksa terk yaz.** | İkircik mühendislik kapasitesini ve pazarlama dilini zehirliyor. |
| K-4 | Motor 2 (B2B) keşif mi, arşiv mi? (M-5) | Keşif (müşteri profili + pilot) / Arşivde kalır (Manifesto'dan düşür) | **Keşfe al, 1 pilot müşteri bul.** | Tek motorlu gelir riski; akademi doygunluğunda ikinci bacak yok. |
| K-5 | Split sözleşmesi açılıyor mu? | Aç (Pazaryeri başvurusu) / Kapat (freelancer 12 ay yok) | **Başvuruyu aç.** | Teknik hazır; idari sıra beklerse Faz 2 takvimi kayar. Dron yazma hop'ları buna bağlı. |
| K-6 | Canlı yayın kilidi (`LIVE_BROADCAST_SHUTDOWN`) durumu? | Açık kalır / Kapatılır (sabit `false` + deploy) | **Runbook'a tarih yaz.** | Kodda üretim 503 kilidi var; "canlı" iddiasıyla çelişiyorsa netleştir. |

### 5.2 Operasyon masası (Super Admin — 14 gün içinde)

1. **Belge operasyonu:** Manifesto'dan operasyon sök (M-1, M-2); `docs/DURUM.md` (haftalık durum) aç; P-1/P-3/P-4 düzeltmelerini PEDAGOJI + STORAGE'a işle; DRON_CLIENT_SPEC §7 yasağını hedef cümleye çevir; OPS_RUNBOOK'u 4 parçaya böl (§2.4).
2. **Ödeme operasyonu:** PayTR canlı üçlü + Bildirim URL + `TRUSTED_PROXY_HOPS=2` + Inngest çift anahtar + SMTP çifti + `ACADEMY_EXAM_SITTING_SECRET` — `ops:runtime-readiness` çıkış 0 + T3 halkası yeşil (runbook §13.1). Reklam bu yeşilden önce açılmaz.
3. **Test hijyeni:** donmuş oda testlerini `tests/` kökünden `tests/donmus/` altına taşı; `test` script'indeki exclude listesini sadeleştir; CI'da "aktif suite" rozetini tanımla (H-7).
4. **Bayrak disiplini:** `FREELANCER_PUBLIC_SURFACE_LOCKED`, `publishFrozenUntilFaz1Close`, `LIVE_BROADCAST_SHUTDOWN` üçlüsünün açılış kriterlerini tek `docs/acilis-kriterleri.md`'de topla (B5).

### 5.3 Tedavi fazı takvimi (öneri)

| Hafta | İş | Sahip | Çıktı |
|-------|----|-------|-------|
| 0 | K-1…K-6 kararları | CEO | İmzalı karar notu (`docs/kararlar/2026-09-tedavi-giris.md`) |
| 1–3 | Adım 1: `@yetkin/kernel` + sözleşme sürümleme | Tech Lead | Paket + dron entegrasyonu + CI kapısı |
| 2–4 | Adım 2: kayıt defteri + scaffold + bayraklar | Tech Lead | `dron:new` + ilk hello-dron |
| 3–6 | Adım 3: auth/ödeme/veri + ilk 5 yazma hop | Ekip | Dron kapalı testi (T3 halkası dron içinden) |
| 6 | Tedavi kapanış raporu | Mimari ajan | `docs/TEDAVI_RAPORU.md` + yeni uyum puanı (hedef ≥75) |

### 5.4 Başarı ölçütü (Tedavi bitince bu raporla karşılaştır)

- Uyum puanı 58 → **≥75** (kernel paketlenmesi + veri paylaşımı boyutları ≥70).
- v1 hop sayısı 8 → **≥13** (5 yazma hop yayında).
- Yeni dron açma maliyeti: 6 dosya el işçiliği → **1 komut + 1 PR**.
- Belge çelişkisi: P-1/M-3/B2-b stillerinde **0 açık çelişki** (gece taraması `verify:belge-tutarlilik` ile).
- Kapalı test: dron içinden kayıt→ödeme→sınav→vize halkası **yeşil**.

---

## Ek: Doğrulama izleri (denetçi için)

- Dizin/API sayımı: `app/api/**/route.ts` (53), `lib/kernel/**/*.ts` (~250), `tests/**/*.test.ts` (307) glob sonuçları.
- Finansal SSOT: `prisma/schema/kernel.prisma` (`Wallet`, `LedgerEntry`, `EscrowHold`, `PaymentOrder`, `PriceCatalog*`).
- PayTR akışı: `app/api/(kernel)/wallet/top-up/route.ts`, `app/api/(kernel)/payments/webhooks/paytr/route.ts`, `lib/kernel/payments/paytr/*`, `lib/kernel/payments/port.ts`.
- Satın alma: `app/api/academy/courses/[id]/purchase/route.ts` (dron-forbidden + idempotency + makbuz kuyruğu).
- Edge: `proxy.ts` (410 → hop-gate → sürüm → origin → rate-limit → auth → rewrite), `lib/kernel/security/edge-api-auth.ts`, `lib/kernel/security/route-auth-map.ts` (53 girdi).
- Sözleşme: `lib/kernel/http/v1-contract.ts` (1012 satır), `v1-hops-meta.ts` (8 hop), `lib/kernel/http/api-v1.ts`.
- Dron: `apps/rail-is/package.json` (`publishFrozenUntilFaz1Close`), `apps/rail-is/src/api/{client,hops}.ts`.
- Kilitler: `lib/kernel/compliance/circuit-breakers.ts`, `lib/kernel/rooms.ssot.ts`, `eslint.config.mjs` (6 duvar).
- Sağlık/boot: `app/api/(kernel)/health/route.ts`, `instrumentation.ts`, `.env.example`.

---

*Rapor sonu. Sonraki adım: §5.1 kararlarının CEO onayı → Tedavi fazı (`TEDAVI_RAPORU.md`).*
