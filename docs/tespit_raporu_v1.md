# Tespit Raporu v1 — `yetkin.ai` × `yetkin_rail`

| Alan | Değer |
|------|--------|
| Faz | **1 — Tespit ve karşılaştırma** (ürün kodu değişmedi) |
| Tarih | 16 Ağustos 2026 |
| Gövde | `d:\yetkin_rail` (Rail) + iç içe müze `d:\yetkin_rail\yetkin.ai` |
| Yöntem | Disk envanteri, `package.json`, Prisma çok dosyalı şema, App Router, `lib/`, kenar (`proxy.ts`), mühür betikleri, test yüzeyi, ops belgeler, müze `domain-registry` |
| Önceki envanter | `docs/Tespit_Raporu.md` (aynı gün, ~05:05). **Bu v1 güncel SSOT’tur.** Aşağıdaki sapmalar o dosyayı geçersiz kılar: Anayasa / runbook / storage belgesi **diskte vardır**; akademi müfredat oynatıcısı **kodda vardır**; Prisma model sayısı **46**; `page.tsx` **40**; `route.ts` **86**. |
| Bilinçli sınır | Tedavi/uygulama yok. Teslimat yalnız bu dosyadır. |

---

## 0. Yönetici özeti

`yetkin_rail`, `yetkin.ai` monolitinın düzenlenmiş kopyası değildir. Müze **ilham ve yasak listesidir** (S9-B): TypeScript, Next tracing, ESLint import grafı ve HTTP yolu `/yetkin.ai` dışındadır. Rail, **on iki dikey oda + dört çekirdek sığınak** üzerine kurulmuş, nakit ve LLM’i tek gümrükten geçiren bir yeniden yazımdır.

Ölçek farkı kasıtlıdır (~%11–%18 yüzey). Omurga (kimlik, defter, emanet, fiyat kilidi, PayTR, LLM gümrüğü, RLS, oda duvarları, kenar JWKS/CSP, HTTP idempotency, Studio imzalı nesne depo, dashboard BFF) **yazılmış ve mühürlenmiş** durumdadır. Beş dikey mutlu yol (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) motor + API + sayfa + test taşır. Akademi D2 halkası (ders tamamlama, müfredat mührü, sertifika hash) kodda durur.

**Asıl boşluk üç kovadır; “eksik” demek tek başına yanıltır:**

1. **Bilinçli kesim** — anayasa / şema başlığı / `.env.example` yasağı. Geri açılmaz (satranç, anket, lonca, tarım, talent, Redis, Socket, GİB, çekim, 15 Studio peronu, DevLabs exec).
2. **Rail kapsamına giren ürün derinliği** — kariyer SWOT/CV ormanı, kurumsal CRM, yasal alt sayfalar, VIDEO/TTS factory, canlı devlet API’si. Çoğu onay ister; varsayılan **hayır**.
3. **Üretim ve belge kalkanı** — seremoni dosyaları yok; Rail kökünde `.git` yok; hız tavanı tek süreç; Studio bucket `ops:migrate` dışında.

**Tek cümlelik strateji:** *12 odayı şişirme; kalan belge mühürlerini kapat; omurgayı gerçek Postgres/Auth/PayTR/Inngest/Storage’a dürüst bağla; öğrenme–kanıt–kazanç döngüsünün içeriğini üretimde kanıtla.*

---

## 1. Yöntem ve sınır

- Rail kökü `d:\yetkin_rail`. `src/` yoktur. Uygulama `app/`, `lib/`, `components/`, `proxy.ts`.
- Müze `d:\yetkin.ai` **yoktur**. Prototip `d:\yetkin_rail\yetkin.ai` altında durur (ayrı `.git`, remote `yetkin-vision/yetkin.ai`).
- `node_modules/`, `.next/`, `test-results/` envanter dışı.
- Ürün kodunda `TODO` / `FIXME` / `HACK` taraması boştur. “Henüz bağlanmadı / yüklenemedi” dürüst kapalı yüzey dilidir, yarım iş işareti değildir.
- Bu adımda hiçbir `app/`, `lib/`, `prisma/` dosyası değiştirilmedi.

---

## 2. Sistem tespiti — `yetkin_rail`

### 2.1 Kimlik ve yığın

| Alan | Değer |
|------|--------|
| `package.json` adı | `yetkin-rail` `0.1.0` — “mühürlü emek işletim sistemi” |
| Çalışma zamanı | Node `>=20.19.0` |
| Gövde | Next.js `^16.2.9` App Router, React `^19.2.7`, Tailwind 4 |
| Veri | Prisma `^7.8.0` + `@prisma/adapter-pg`, Postgres |
| Kimlik | Supabase Auth (`@supabase/ssr ^0.12.4`, `@supabase/supabase-js ^2.112.3`) |
| İşler | Inngest `^4.11.0`, uygulama id `yetkin-rail` |
| Sözleşme | Zod 4, jose (kenar JWT) |
| LLM | `@google/genai`; tek kapı `invokeLlm` / `generateImage` |
| Test | Vitest 115 `*.test.ts`, Playwright 12 `*.spec.ts` |
| Kenar | Tek `proxy.ts` (Next 16). Kök `middleware.ts` **yok** |
| Sürüm kontrolü | **Rail kökünde `.git` yok.** Müze kendi git’ini taşır. |

Bu bir mahkeme/dava yönetim ürünü değildir. En yakın “başvuru” yüzeyi freelancer ilanı, kurumsal mühürlü iş, Arena ihale ve hibe **rehber kaydı**dır. Hibe canlı devlet API’si değildir (`catalog-not-live-government-api`).

### 2.2 Dizin mimarisi

```
d:\yetkin_rail\
├── app\                 App Router: (auth) (kernel) (public) + 12 oda + api
├── components\          oda UI + shell + theme + ui primitives (~127 TS/TSX)
├── docs\                Anayasa.md, 07_OPS_RUNBOOK.md, 08_STORAGE_CONTRACT.md,
│                        Tespit_Raporu.md, bu dosya
├── generated\           prisma client + route-auth-map (gitignore)
├── lib\                 kernel (106) + 12 oda + copy + dashboard + showcase + ui
├── middleware\          api-auth.ts (yeniden ihracat)
├── prisma\schema\       13 .prisma (kernel + 12 oda + base)
├── prisma\migrations\   13 uygulama migrasyonu
├── public\              yalnız favicon.ico
├── scripts\             ops:migrate + 8 verify mühürü + storage CORS
├── supabase\            7 kilitli SQL + storage/studio-assets.sql
├── tests\               kernel + oda + e2e + bellek portları
├── yetkin.ai\           müze (build dışı, S9-B)
├── proxy.ts             tek edge girişi
├── next.config.ts       ince alias + müze tracing exclude
├── eslint.config.mjs    §2.8 oda duvarı + müze import yasağı
└── .env.example         service_role / Redis / GİB yok
```

**Yok (kasıtlı veya henüz):** `src/`, `hooks/`, `workers/`, `Dockerfile`, `docker-compose.yml`, Rail `.github/`, `middleware.ts`, PWA, geist font paketi, Sentry SDK, Resend, Redis, Socket.IO.

`lib/` üst klasör (16): `academy`, `arena`, `career`, `copy`, `dashboard`, `devlabs`, `freelancer`, `hibe`, `junior`, `kernel`, `kurumsal`, `pazaryeri`, `showcase`, `social`, `studio`, `ui`.

Oda kalıbı: `engine.ts` + `prisma-store.ts` + `runtime.ts` + `load.ts` + `schemas.ts` + `types.ts` + `index.ts`. Çapraz oda konuşması HTTP veya kernel sözleşmesidir. ESLint §2.8 çekirdeğin dikey motor import etmesini ve freelancer ↛ kurumsal/kariyer duvarını kilitler.

### 2.3 Veri akışı

```
Vatandaş
  → proxy.ts (müze 404, /kayit 308, JWKS/HS256 JWT, nonce CSP, bellek hız tavanı)
  → App Router sayfa / API
  → requireSession | requirePageSession | requireSuperAdmin
  → dikey engine (Zod girdi)
  → kernel: katalog kilidi / EscrowHold / LedgerEntry / invokeLlm|generateImage
  → Prisma (postgres rolü yazar) + RLS (anon yalnız SELECT)
  → Inngest (PayTR valör 30 dk, emanet TTL, Arena tur)
  → PayTR webhook (HMAC; total_amount === amountMinor)
```

S43: nakit PayTR ile girer, 12 odada harcanır, bankaya çıkış yoktur. `/api/wallet/withdraw` açılmaz.

### 2.4 Çekirdek omurga — ne duruyor

| Yetenek | Kanıt | Not |
|---------|-------|-----|
| Kimlik | Supabase e-posta/şifre, PKCE `/auth/callback`, cookie/Bearer `getUser` | Turnstile, OAuth şişmesi, `LOCAL_MOCK_AUTH` yok |
| Kenar | `proxy.ts`: müze 404, `/kayit` 308, JWKS/HS256, nonce CSP, K6 `auth` kind, cookie yenileme | Fail-closed; çerez varlığı yetmez |
| Para | `Wallet` + append-only `LedgerEntry`; User’da bakiye kolonu yok; birim `amountMinor` | `amountKurus` kolon adı yasak |
| Emanet | `EscrowHold` kilit (ikinci bakiye değil), TTL, dikey iade kancası | Composition root `register-escrow-hooks.ts` |
| Ödeme | PayTR iframe ₺10–₺20.000; webhook tutar eşitliği; valör Inngest 30 dk | Çekim yok |
| Fiyat | Super Admin katalog SSOT; 15 dk `CheckoutPriceLock`; kod sabiti satış fiyatı yok | 7 `REQUIRED_CATALOG_DEFINITIONS` |
| LLM | `invokeLlm` / `generateImage`; 8 kanonik rol; bütçe kalkanı | Ham SDK dikeyde yasak (`verify:ai-gateway`) |
| RLS | FORCE RLS + sahip yalnız SELECT; yazma Prisma postgres rolü | `SUPABASE_SERVICE_ROLE_KEY` JS/env’de yok |
| İşler | Inngest: PayTR clearing, emanet TTL, Arena tur | Socket/Redis yok |
| Idempotency | Defter `idempotencyKey` + HTTP `Idempotency-Key` + `HttpIdempotencyRecord` | Kritik yazmalar: top-up, akademi satın al, freelancer kabul |
| Hız tavanı | Süreç-içi bellek: cüzdan yükleme + auth IP | Çok instance paylaşılmaz |
| Sağlık | `GET /api/health` DB ping; down = 503; JSON `phase` taşımaz | |
| Admin | Katalog PATCH; kenar `auth = "admin"` + env UUID | Üye / moderasyon / çekim paneli yok |
| Studio depo | İmzalI PUT (`studio-assets`); Prisma hash/mime/path | Eski `inline-base64` okunur; kör DROP yok |
| Kokpit | Tek BFF `/api/dashboard/pulse` | Kernel dikey tablo sorgulamaz |

**Katalog sicili (7 anahtar):** `studio:generation:text`, `studio:generation:image`, `kurumsal:job-posting:floor`, `arena:tender-pool:floor`, `pazaryeri:listing:floor`, `pazaryeri:listing:asset-floor`, `pazaryeri:doping:boost`. Akademi kurs fiyatları SQL seed’de (`rail-temel` + ikinci tohum), bu dizide değil.

**Inngest işlevleri:** `paytr-clearing-scan` (cron `*/30`), `paytr-clearing-single`, `escrow-timeout-scan` (cron `0 */6`), `escrow-refunded-notify`, `arena-tender-round-scan` (cron `*/15`), `arena-tender-round-tick`. Üretimde boş `INNGEST_SIGNING_KEY` / `INNGEST_EVENT_KEY` → serve 503.

**AI roller (tavan 8):** `EXECUTIVE_BRAIN`, `DEEP_RESEARCH`, `FAST_STREAM`, `LITE_STREAM`, `IMAGE_GEN`, `VIDEO_GEN`, `VOICE_TTS`, `OPEN_LOCAL`. Factory yalnız metin + görsel. `VIDEO_GEN` / `VOICE_TTS` anahtar vardır, üretim kapısı yoktur. `sovereign` sağlayıcı sahte metin basmaz; “yapılandırılmadı” fırlatır.

### 2.5 On iki oda + dört sığınak

Kaynak: `lib/kernel/modules.ts`.

| Oda | Vatandaş yolu | Mutlu yol (kodda) | `lib/` dosya | Derinlik notu |
|-----|----------------|-------------------|--------------|----------------|
| Dashboard | `/dashboard` | 12 nabız + cüzdan şeridi + oda şeridi; tek BFF | 15 | Müze fırsat / PropTech kokpiti yok |
| Studio | `/studio` | Metin + IMAGE_GEN; jeton debit; taslak; imzalı depo; Base64 tavan 2 097 152 | 12 | 15 müze peronu yok |
| Akademi | `/academy` | Katalog → kilit → settlement → **müfredat** → sınav ≥70 → SHA256 sertifika → `/academy/dogrula/[hash]` | 13 | 2 tohum kurs; `/oyna` oynatıcı var |
| Kariyer | `/career` | Akademi sertifikası veya freelancer RELEASE ile atomik vize + portföy | 8 | SWOT / CV builder / prova yok |
| Freelancer | `/freelancer` | İlan → teklif → emanet kabul → mesaj → teslim/iade; 2 turlu tahkim; squad `shareBps` | 14 | En derin nakit oda |
| DevLabs | `/devlabs` | Proje → üret → anayasal linter (`eval`/`child_process` yasak) → artifact; HMAC kasa `yrk_` | 10 | Exec / SaaS / sandbox yok |
| Kurumsal | `/kurumsal` | Şirket + mühürlü ilan + teklif + ödül/serbest/iade | 9 | CRM / fatura yok |
| Hibe | `/hibe` | Tohum katalog + etiket eşleştirme + rehber kayıt | 9 | Canlı KOSGEB yok |
| Arena | `/arena` | İhale emaneti + HTTP/Inngest tur tiki | 10 | Socket yok |
| Pazaryeri | `/yetkinilan` (disk `pazaryeri/`) | Dijital anında settlement vs hizmet/emlak/vasıta emanet; teklif; doping | 12 | TKGM/sigorta kanca alanı, canlı API değil |
| Junior | `/junior` | Yaş 10–17, ebeveyn, harçlık **Wallet satırı değil**; 2 statik MEB izi | 9 | LMS / mentor yok |
| Social | `/social` (YetkinX) | Mühürlü kanıt akışı + ACK/SHARE; tıklama tuzağı denylist | 11 | Boost / X-YouTube yok |

Çekirdek sığınaklar (oda sayılmaz, sağ hub): `/profil`, `/cuzdan`, `/pasaport`, `/admin`.

**İnce alias tavanı** (`next.config.ts`): `/kariyer`→`/career`, `/ogren`→`/academy`, `/yetkinx`→`/social`, `/corporate`→`/kurumsal`, `/profile`→`/profil`, `/passport`→`/pasaport`, `/market`→`/yetkinilan`, `/giris`→`/login`, `/kayit`→`/register` (kenarda ayrıca 308). Rewrite: `/yetkinilan` → `/pazaryeri`. KAPAT-oda yönlendirmesi yazılmaz. `/yetkin.ai` 404.

### 2.6 Sayfa ve API yüzeyi

**40 `page.tsx`.** Grup `(auth)` / `(kernel)` / `(public)` URL’de görünmez.

Vatandaş sayfaları: `/`, `/legal`, `/login`, `/register`, `/sifremi-unuttum`, `/sifre-yenile`, `/admin`, `/cuzdan`, `/pasaport`, `/profil`, `/dashboard`, `/studio`, `/academy` + `[slug]` + `oyna` + `certificates` + `dogrula/[hash]`, `/career`, `/freelancer` + `new` + `jobs/[id]` + `contracts/[id]`, `/devlabs` + `projeler/[id]`, `/kurumsal` + `ilan/yeni` + `ilan/[id]`, `/hibe` + `[slug]`, `/arena` + `yeni` + `[id]`, `/pazaryeri` + `[slug]` + `siparisler` + `tezgah`, `/junior` + `ebeveyn`, `/social` + `[id]`.

**34 `loading.tsx`** (oda kabukları + kök). **1 `error.tsx`** (yalnız kök). Müze ~148 oda-oda error presine karşı kasıtlı sadeleşme.

**86 `route.ts`.** Örnekler:

- Kamu / webhook / admin: `/api/health`, `/api/jobs/inngest`, `/api/payments/webhooks/paytr`, `/api/admin/catalog`, `/auth/callback`
- Oturum: akademi (courses/lock/purchase/curriculum/exam/certificates), freelancer (jobs/bids/accept/contracts/messages/release/refund/dispute/squad), studio (drafts/generate/images/sign-upload/confirm), pazaryeri (products/lock/purchase/stall/orders/offers/doping), kurumsal (company/jobs/offers/award/release/refund), arena, career, hibe, junior, social, dashboard pulse, wallet top-up, profile, session

Her handler `export const auth` taşır; `verify:api-auth` sicili okur.

### 2.7 Prisma — 46 model, 13 migrasyon

Çok dosyalı şema (`prisma.config.ts` → `prisma/schema`). Client `generated/prisma`. Para her yerde `amountMinor` + `currencyCode`. Çapraz oda FK’leri kernel emanet/kilit/usage için **string**dir; çekirdek dikey tablo sorgulamaz.

**Kernel:** User, Wallet, LedgerEntry, EscrowHold, PaymentOrder, PriceCatalogEntry, CheckoutPriceLock, AiTokenUsage, HttpIdempotencyRecord.

**Dikey:** AcademyCourse/Purchase/Exam/Attempt/Certificate/LessonCompletion; FreelancerJob/Bid/Contract/Dispute/Message/Squad/Member; StudioDraft/Generation/DigitalAsset; MarketplaceProduct/Order/Offer/Doping; CareerVisaStamp/PortfolioItem; DevLabsProject/ApiKey/Artifact; CorporateCompany/JobPosting/JobOffer; GrantProgram/Application; ArenaTender/Submission/Award; JuniorProfile/Allowance; ProofFeedItem/Interaction.

Migrasyon adları faz izi taşır (`faz5_init` … `faz10_yetkinilan`) + D2 yamaları (`academy_lesson_completions`, `curriculum_seal_certificate_hash`, `corporate_job_offers`). `GET /api/health` JSON’u `phase` **taşımaz**; faz yorum ve klasör adıdır, runtime bayrağı değildir.

### 2.8 Mühürler, test, ops SQL

**Prebuild:** `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`.

**Build:** `prisma generate && verify:prebuild && next build`.

**`ops:migrate`:** Direct `:5432` (`db.<ref>.supabase.co`). Havuz `:6543` yasak. Prisma deploy + kilitli yedi SQL (auth sync, FORCE RLS, sahip SELECT, katalog tohumu, akademi seed, e-posta update, freelancer seed). **`studio-assets.sql` bu listede yoktur** — Dashboard SQL Editor adımı.

**Playwright (`tests/e2e/`, proje `kapi`, `tr-TR`):** kayıt 308, auth UX, API kenar 401, legal, dashboard pulse, cash-loop (bellek), akademi/freelancer/yetkinilan/studio/devlabs vitrin, studio tavan HTTP.

E2E çoğu **yüzey / bellek** kanıtıdır; canlı Auth + gerçek PayTR dumanı ayrı ops adımıdır.

### 2.9 Doküman SSOT — bugünkü disk

| Beklenen yol | Disk | Durum |
|--------------|------|--------|
| `docs/ANAYASA.md` | `docs/Anayasa.md` | Windows’ta aynı dosya. Linux CI / case-sensitive FS’te `constitution-surfaces.test.ts` kırılır |
| `docs/07_OPS_RUNBOOK.md` | var | Ops ve test yeşil yol |
| `docs/08_STORAGE_CONTRACT.md` | var | İmzalI PUT sözleşmesi |
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | **yok** | `ops-migrate-surface.test.ts` dosyayı **okur** |
| `docs/07_tedavi_raporu_d3_nihai_muhur.md` | **yok** | Runbook §14 + yüzey testleri referans |
| `docs/01_tespit_raporu.md` | yok; `Tespit_Raporu.md` var | Anayasa “envanter SSOT” diye bunu gösterir |
| `docs/tespit_raporu_v1.md` | bu dosya | Faz 1 teslimatı |

`docs/Tespit_Raporu.md` hâlâ “Anayasa/07/08 diskte yok” der. **Bu iddia 16 Ağustos 05:06 itibarıyla yanlıştır.** Kalan belge P0’ı seremoni dosyaları ve Anayasa dosya adı büyük/küçük harf riskidir.

---

## 3. Sistem tespiti — `yetkin.ai` (müze / prototip)

Kaynak erişilebilir: `d:\yetkin_rail\yetkin.ai`. Ayrı Next uygulaması, ayrı `.git` (`main`, origin’den 26 commit önde, çalışma ağacı kirli). README üretim alanı `https://yetkin.ai`. Müze `docs/` klasörü diskte **boş**; tarihsel raporlar eski `d:\yetkin.ai` yolundaydı.

### 3.1 Mimari

Modüler App Router monolit. Katmanlar: `app/` + `components/` + `hooks/` → `lib/<domain>/` → Prisma/Postgres → `proxy.ts` / Supabase → `server/` Socket.IO (satranç 3001, anket 3002, arena) + Redis/Upstash.

SSOT: `lib/bina/domain-registry.ts` — **18 asil domain + 112 alt peron = 130 düğüm** (`EXPECTED_BINA_ROUTE_COUNT = 130`).

**18 asil domain (sicil sırası):** dashboard, devlabs (Studio birleşimi; yüzey hâlâ `/studio/*`), academy, career, freelancer, kurumsal (+ `/hibe`), loncalar, arena, junior, talent, social, anket, profil (+ pasaport), admin, chess, cüzdan, pazaryeri, tarım.

Launch’ta dondurulmuş (kod silinmez): `/chess`, `/anket`, `/loncalar`, `/tarim`. Nav “12 asil” ile BINA 18’i aynı anda yaşar — Rail’in kesme gerekçesinin kaynağı budur.

### 3.2 Yığın farkı

| Katman | Müze | Rail |
|--------|------|------|
| Next / React | 16.2 / 19.2 | aynı |
| TypeScript | ^6 | ^5.9 |
| Prisma | 7, tek `schema.prisma`, `amountKurus` | 7, çok dosya, **`amountMinor`** |
| Supabase SSR / js | ^0.12 / ^2.108 | ^0.12.4 / **^2.112.3** |
| Inngest işçisi | 23 dosya (PayTR, GİB, holding, chess, anket…) | 6 işlev (PayTR + emanet + Arena) |
| Realtime | Socket.IO + Redis + PM2 | HTTP + Inngest |
| Auth ekstra | Turnstile, OAuth, MFA, `SERVICE_ROLE_KEY` | anon + JWT; service_role yok |
| UI | lucide, geist, dnd-kit, 37 `hooks/` | yerel SVG, sistem font, `hooks/` yok |
| Deploy | Vercel + VPS soketleri; `docker-compose.dev.yml`; `.github/workflows` | Rail’de Docker/CI yok |
| Prebuild | ~20 verify (PII, holding, socket, amount-kurus, launch-gate…) | 8 verify + surface + typecheck |

### 3.3 Ürün ve iş akışları (müze)

- Öğren → kanıt → kazan: LMS, kariyer CV/SWOT/prova/roadmap, pasaport çocukları
- Para: triple-balance, holding havuzu, merit-swap, GİB kuyruğu, admin çekim
- İş: freelancer squad/milestone, kurumsal CRM/fatura/twin IK, Arena düello
- Studio ormanı: ads, 3D, talk, canvas, photo, avatar, convert, invoice, flow, brand, dijital twin…
- DevLabs: SaaS, Builder, Blueprint, Codex, Commerce, Forge, Native, Engine, sandbox, webhook
- PropTech: 5 aşamalı lead CRM, müzayede, FX, sigorta
- Hibe: KOSGEB scraper, wizard, Success-Fee, KDV kredi
- Junior meydan, Talent haritası, satranç/anket soketleri, tarım

E2E specleri (11) çekim talebi, socket filosu, anket oy’u, pazar checkout’u kapsar — Rail specleri vitrin + bellek nakit döngüsüdür.

---

## 4. Karşılaştırma tablosu

| Ölçüt | `yetkin.ai` | `yetkin_rail` | Oran |
|--------|-------------|---------------|------|
| Anayasal yüzey | 18 domain + 130 düğüm | 12 oda + 4 sığınak | ~1/3 |
| `page.tsx` | 158 | 40 | ~%25 |
| `app/**/route.ts` | 559 | 86 | ~%15 |
| Prisma modelleri | 248 | 46 | ~%19 |
| Prisma enum | 181 | 39 | — |
| Prisma migrasyon | 210 | 13 uygulama + 7 SQL + 1 storage SQL | — |
| `loading.tsx` | 151 | 34 | — |
| `error.tsx` | ~148 | 1 | — |
| `lib/` üst klasör | 90 | 16 | — |
| `lib/` TS/TSX | 2291 | 260 | ~%11 |
| `components/` TS/TSX | 1111 | 127 | ~%11 |
| Vitest `*.test.ts` | 603 | 115 | ~%19 |
| Playwright spec | 11 | 12 | ~eşit sayı, dar kapsam |
| Inngest | 23 | 6 işlev | — |
| React `hooks/` | 37 | 0 | kasıtlı |
| Git | kendi repo | Rail kökü **reposuz** | risk |
| CI / Docker | var | yok | boşluk |

**Paylaşılan fikir:** öğrenme → kanıt → kazanç; PayTR; emanet; SEN / Quiet Luxury; aynı Next/React/Prisma kuşağı.

**Bilinçli sadeleştirmeler (kopyalanmamalı):**

| Müze | Rail |
|------|------|
| Triple-balance + holding + merit-swap | Tek Wallet + LedgerEntry |
| 23 Inngest + 3 Socket + Redis | HTTP + 6 Inngest |
| 42 dosyalık auth yığını | İnce session / password / super-admin |
| Super Admin e-posta + IP allowlist | Env UUID eşitliği |
| Resend işlem maili | `txn.notice.*` log |
| `amountKurus` | `amountMinor` (UI “kuruş”) |
| 130 BINA + onlarca alias | İnce alias tavanı |
| DevLabs runner / sandbox | Linter; **exec yoktur** |

---

## 5. Eksikler — üç kova

### 5.1 Bilinçli kesim — tekrar açılmamalı

| Modül | Müze konumu | Gerekçe |
|-------|-------------|---------|
| Chess + `chess.js` + socket:3001 | `app/chess`, `server/chess-socket-server.ts` | Ayrı işletim yüzeyi |
| Anket / kamuoyu + socket:3002 | `app/anket`, `lib/kamuoyu/` | k-anonimlik yığını |
| Lonca / meclis | `app/loncalar`, `lib/loncalar/` | 13. oda yasağı |
| Tarım | `app/tarim` | AI rol patlaması gümrüğü kirletmişti |
| Talent | `app/talent` | Sicilde yok |
| Redis / Socket.IO | `lib/redis/`, `server/*` | Arena = HTTP + Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | müze env | RLS + Prisma yazma çizgisi |
| GİB / çekim | `gib-invoice-queue`, `app/admin/withdrawals` | S43 hukuk dürüstlüğü |
| Reklam / Turnstile / OAuth şişmesi | `lib/ads/`, `studio/yetkin-ads` | Env yasağı |
| DevLabs exec / SaaS / Builder / Codex | `app/devlabs/{sandbox,codex,saas,…}` | “Exec asla” |
| Social boost / X-YouTube | `youtube-client`, `linkedin-client` | DTO yasağı |
| VIDEO_GEN / VOICE_TTS factory | müze `forge/media-engine` | Rail’de rol var, factory yok |
| 130 BINA | `lib/bina/domain-registry.ts` | İnce alias |
| `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` | müze env | Dürüst kapalı yüzey |
| Liyakat takası / holding | `lib/merit/`, `ModuleWallet*` | İkinci nakit yazıcı yasağı |
| `hooks/` (37) | `yetkin.ai/hooks/` | Sunucu-ağır gövde |

### 5.2 Oda var, derinlik müzenin gerisinde (ürün kararı — kör taşıma değil)

| Oda | Rail’de olan | Müze’den gelmeyen (ayrı onay) |
|-----|----------------|-------------------------------|
| Career | Kanıt → vize → portföy | `cv-builder`, `swot`, `prova`, `roadmap`, `cv-analiz` |
| Academy | Satın al + **oynatıcı** + sınav + sertifika (2 kurs) | `vision`, `corporate-qualification`, müzayede/telif, AI kürsüsü, onlarca ders |
| Studio | Metin + IMAGE_GEN + imzalı depo | 15+ peron |
| DevLabs | Kasa + generate + linter | saas/builder/codex/commerce/sandbox — **varsayılan hayır** |
| Kurumsal | Şirket + mühür + teklif | CRM, fatura, görevler, Twin IK |
| Hibe | Katalog + rehber | `olustur` wizard, scraper, Success-Fee — **kapalı tutulmalı** |
| Pazaryeri | Dijital/hizmet/RE/araç + teklif + doping | 5 aşamalı PropTech, sigorta API, TKGM canlı |
| Junior | Yaş + veli + harçlık | `meydan`, mentor, MEB üretim |
| Dashboard | 12 nabız BFF | `firsat`, `yetkin-panel` |
| Admin | Katalog | üyeler, moderation, support, withdrawals |
| Pasaport | Vize projeksiyonu | rozetler, liyakat, doğrula çocukları |
| Legal | Tek `/legal` dürüst metin | mesafeli satış / iade / ön bilgilendirme ayrı sayfalar |
| Auth UX | login/register/şifre | `verify-email`, `onboarding`, Turnstile |
| Profil | Kimlik + görünen ad | siparişlerim, ayarlar, KYC |

**Düzeltme (`Tespit_Raporu.md` sapması):** “akademi müfredat oynatıcısı yok” **artık yanlış**. `ACADEMY_HAPPY_PATH` `curriculum` adımı içerir; `app/academy/[slug]/oyna`, `curriculum-engine`, `AcademyLessonCompletion` ve D2 migrasyonları durur. İnce olan **içerik hacmi**dir (2 tohum), motor değil.

### 5.3 Platform boşlukları (oda değil)

| Boşluk | Durum | Etki |
|--------|--------|------|
| Seremoni markdown | `tedavi_raporu_11` ve `07_tedavi_raporu_d3` yok | Prebuild/surface test fail-closed okur |
| Anayasa dosya adı | `Anayasa.md` vs test `ANAYASA.md` | Linux CI kırığı |
| Rail `.git` | yok | Geçmiş, PR, geri alma, CI yok; müze git’i Rail’i korumaz |
| Rail CI / Docker | yok | Müze `.github` kopyalanmamalı; Rail’in kendi ince pipeline’ı yok |
| VIDEO/TTS factory | Rol vaadi, kapı yok | Kopya “üretir” derse yalan |
| `FAST_STREAM` / `LITE_STREAM` | Rol adı “akış”; çağrı senkron | Stream UI yok |
| İşlem e-postası | Auth SMTP Supabase; nakit yalnız log | Anlaşmazlık/sertifika kör |
| Gözlem SDK | `requestId` + yapılandırılmış log | Sentry/OTel yok |
| Hız tavanı | Bellek içi | İkinci replica kotayı görmez |
| PayTR tarama | `take: 50` / 30 dk | Hacimde backlog; metrik yok |
| Defter sayfalama | `WALLET_LEDGER_TAKE` tavan; cursor yok | Sessiz kesme kopyası kalmalı |
| Tek `error.tsx` | kök | Oda izolasyonu ince (148 kopya istenmez) |
| Font / PWA / provenance | yok | Quiet Luxury için zorunlu değil |

---

## 6. Kritik hatalar / riskler

“Hata” ile “bilinçli kesim” karıştırılmamalı.

### P0 — kalkan ve bağlama

1. **Seremoni dosyaları yok.** `tests/kernel/ops-migrate-surface.test.ts` `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` içeriğini okur. Dosya yoksa surface / prebuild kırmızı. Bu ürün motoru kazası değil, **testlerin istediği insan SSOT** kazasıdır.
2. **Anayasa yolu case-sensitive değil.** Windows yeşil boyar; Linux runner `docs/ANAYASA.md` bulamaz.
3. **Rail kökü git’siz.** Yeniden yazımın tek kanıtı disk anlık görüntüsüdür. Müze dirty tree + PAT riski (iç içe `.git` remote) ayrı hijyen işidir; Rail geçmişi orada durmaz.
4. **Studio bucket `ops:migrate` dışında.** Doğru (yedi SQL şişmez). Yanlış: Dashboard adımı atlanırsa görsel üretim 4xx/503 — “Studio bozuk” sanılır.
5. **Inngest imza.** Üretimde boş anahtar → 503 (doğru). Cloud bağlanmadan valör/TTL çalışmaz; PENDING birikir.
6. **Hız tavanı tek süreç.** İkinci instance sessiz delik. Redis eklenmemeli; ikinci süreç de açılmamalı ta ki paylaşılan tavan kararı verilene kadar.

### P1 — nakit, depo, gözlem, yüzey

7. Nesne depo fail-closed: `createObjectStoreStudioAssetStorage().put` “nesne depo bağlı değil”. Dürüst, ama ops atlanırsa yanlış teşhis.
8. Eski `inline-base64` satırlar kör DROP edilmez (doğru); yedek şişebilir; migrasyon planı belgesiz.
9. Nakit bildirimi yalnız `txn.notice.*`. Vatandaş e-posta kör.
10. HTTP idempotency evrensel tarama değil. Yeni nakit ucu sicili unutabilir (`verify:atomic-seals` kısmen korur).
11. Admin = tek env UUID. Boş env = kimse admin değil (doğru). UUID sızıntısı hâlâ tek sır.
12. Kenarda açık dikey okuma (akademi katalog, Yetkinİlan, sertifika doğrula) kasıtlı SEO; yazma `PROTECTED_WRITE_PATHS`. Yeni path ekleyen ajan kenarı unutmasın.

### P2 — ürün ve sınır

13. Çekirdek döngü iskeleti var; **içerik ince** (2 kurs, dar portföy).
14. Kurumsal ↔ freelancer aynı emanet motoru; uçtan uca canlı e2e ince.
15. `User` üzerindeki onlarca `@relation` kolon şişmesi değil, okunurluk borcu. Mikroservise şimdi bölmek nakit gümrüğünü çoğaltır.
16. Müze klasörü workspace’i şişirir (2291 lib dosyası). Import yasak mühürlü; yine de ajan “şuradan kopyala” tuzağı sürekli.

### Mimari kazançlar (korunmalı)

1. Çekirdek ↛ dikey; dikey ↛ dikey motor (ESLint §2.8 + earnings wall).
2. Tek nakit SSOT. Escrow kilit, ikinci bakiye değil.
3. String FK; kernel oda tablosu bilmez.
4. Dürüst kapalı ürün (boş env / boş DB yalan bakiye basmaz).
5. Marka ≠ disk (`pazaryeri/` vs `/yetkinilan`).
6. 12 oda tavanı; 13. yasak.
7. Kenar ince, fail-closed JWT + nonce CSP (`unsafe-eval` üretimde yok).
8. DevLabs linter’dır, runner değildir.
9. Kapalı döngü cüzdan (S43).
10. Müze build/trace/import dışı.

---

## SEN OLSAYDIN NE YAPARDIN?

Müze’yi “daha düzenli kopyala”mazdım. 12 oda + çekirdek kararı doğru. 130 düğümü geri doldurmak üç kişilik ekibi tekrar `yetkin.ai` karmaşasına götürür. Rail’in kazancı **az yüzey, tek gümrük, fail-closed dürüstlük**. Bunu bozan her “müze’den de şunu alalım” talebini bu raporun 5.1 tablosundan geçirirdim.

Yapacağım iş dört cümle: **kalkan belgelerini testlerin okuduğu yola kilitle, Rail’i sürümlendir, omurgayı üretime dürüst bağla, oda derinliğini nakit döngüsüne göre sıraya diz.**

### 1. Anayasayı koda hapsetmeyi bırakmam — `docs/`’u da şişirmem

Kod mühürleri (`verify:*`, ESLint §2.8, Prisma başlıkları) duruyor. İnsan SSOT’un kalan deliği seremoni dosyaları ve `ANAYASA.md` harf kasası. Gemini bir oturumda “talent’ı da ekle” veya `amountKurus` geri getir derse itiraz dayanağı markdown + `verify:*` olmalı, yalnız grep değil.

Minimum set (bundan fazlasını yazmam):

- `docs/ANAYASA.md` — mevcut içeriği **kanonik ada** (Linux-safe) kilitle
- `docs/07_OPS_RUNBOOK.md` / `docs/08_STORAGE_CONTRACT.md` — duruyor; dokunmam, şişirmem
- `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` — seremoni; `phase` yazılmaz; bucket SQL Dashboard adımı dürüst
- `docs/07_tedavi_raporu_d3_nihai_muhur.md` — operatör mührü; ikinci instance / Redis yasağı
- Bu dosya (`tespit_raporu_v1.md`) envanter SSOT; `Tespit_Raporu.md` arşiv

Oda başına wiki **ancak** o oda üretimde nakit taşıyınca. 20 oda raporu yazıp uygulamayı ertelemem.

### 2. Önce git, sonra özellik

Kökte `.git` olmayan bir “işletim sistemi” iddiası operasyonel olarak kördür. Tedavi fazında **Rail’i kendi reposuna** alırdım (müze submodule veya tamamen build-dışı kopya; PAT’li remote taşınmaz). Müze `origin` hijyeni ayrı, kısa, güvenlik işi — ürün peronu değil.

İnce CI: `verify:prebuild` + Playwright `kapi` vitrin. Müze’nin 20’li verify ormanını kör kopyalamam.

### 3. Nakit omurgasını “iskelet tamam” sanmam — dünkü kod P0’larını yeniden açmam

Defter, katalog görseli, SEN, CLS kabukları, pulse BFF, storage imzası **kodda bitti**. Eksiğim üretim kalkanının **bağlanması**:

- Bucket + CORS + `studio-assets.sql` gerçekten uygulandı mı?
- Direct `:5432` (IPv6/IPv4 dürüstlüğü runbook’ta var; havuz yasağı korunmalı)
- Inngest çift anahtar; PayTR webhook HMAC
- Gözlem: para mutasyonunda `requestId` var; Inngest başarısızlığında alarm yok. Escrow kör uçmaz diye varsaymam
- Dashboard nabzı BFF’de kalsın; kernel’e dikey tablo sokmam

### 4. Kenarı ince tutmaya devam

JWT kenarda doğrulanıyor. SEO vitrini kamu. Yazma kabukları listede. CSP’de üretim `unsafe-eval` kapalı. Bunu geri açmam. Redis/Socket “ölçek için” eklemem — önce tek süreç sözleşmesi.

### 5. Quiet Luxury’yi ormanla boğmam

34 `loading.tsx` yeterli. `verify:sen-axis` dursun. Lucide / geist / `@bprogress` zorunlu değil. Oda-oda `error.tsx` açmam — kök kart + SEN kopyası.

### 6. Öğrenme–kanıt–kazanç döngüsünü oda enflasyonu olmadan derinleştirirdim

Müzenin vaadi bu döngü. Rail’de akademi satın alıyor ve oynatıyor, kariyer vize basıyor, freelancer emaneti serbest bırakınca yine vize. Sıram:

1. **İçerik veya köprü — tek yüzey.** Ya ikinci gerçek kurs + oynatıcı dumanı, ya kurumsal ilan → freelancer accept e2e (yeni tablo yok). İkisini bir sprintte şişirmem.
2. Kariyer Kanıt Portföyü’nü **tek çocuk** olarak derinleştiririm; müze `cv-builder` ormanını kör kopyalamam.
3. Yetkinİlan: ilan + teklif var; 5 aşamalı PropTech ve TKGM “canlı” yalanı sonra.
4. Studio 15 peron, DevLabs SaaS/Builder, talent, lonca — **açmazdım** ta ki 1–3 üretimde bir ay nakit taşıyana kadar.

Hibe canlı devlet API’si açmazdım.

### 7. Rol dürüstlüğü

`VIDEO_GEN` / `VOICE_TTS` / `FAST_STREAM` ya factory + UI alır ya kopyadan “üretir / akar” düşer. Üçüncü yol (anahtar var, kapı yok, vaat var) müze hastalığıdır.

### 8. Bağımlılık ve sınır

- Redis, Socket.IO, chess.js **eklemezdim**
- TypeScript 6 zorunlu değil
- Mikroservis **şimdi yok** — tek deploy + oda duvarı
- `User` relation listesi okunurluk borcu; şema bölmek nakit SSOT’u çoğaltır, yapmam
- Performans: kokpit N+1 kapanmış. Ledger cursor “tüm tarih” isteği gelince. PayTR `take: 50` için kuyruk derinliği metriği. AI timeout + 2 deneme iyi

### 9. Güvenlik sırası (özellikten önce)

1. Seremoni + Anayasa yolu (testlerin okuduğu dosyalar)
2. Rail git + sır hijyeni (müze remote, `.env` asla commit)
3. Studio bucket gerçek bağlama
4. PayTR + Inngest üretim imzası
5. Tek süreç hız tavanı dürüstlüğü; ikinci instance yoksa Redis yok
6. Admin UUID log’a yazılmaz

### 10. Ekip protokolü

Müze klasörü **ilham ve yasak listesi**. Her “şunu da müze’den alalım” 5.1’den geçer. Aksi halde Rail, 18 domainli ikinci bir monolit olur — sadece daha yeni Next sürümüyle.

---

## Bir sonraki aşamada (Tedavi/Uygulama Fazında) tam olarak ne yapılması gerekiyor?

**Bir sonraki adım yeni oda veya müze peronu taşımak değildir.** Tedavi, kalkanı kapatmak ve omurgayı bağlamak, sonra tek döngüyü kanıtlamaktır.

Aşağıdaki sıra tek PR’lık dilimler halinde, CEO onayıyla:

### Adım T0 — belge ve isim kalkanı (kod yok / az kod) — **önce bu**

1. `docs/ANAYASA.md` yolunu case-sensitive kilitle (`Anayasa.md` → kanonik `ANAYASA.md` veya test + tüm referansları tek ada). `constitution-surfaces.test.ts` Linux’ta da yeşil olsun.
2. `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` yaz: seremoni; `phase` yazılmaz; `ops:migrate` + Dashboard `studio-assets.sql` + CORS adımı dürüst. `ops-migrate-surface` yeşil olsun.
3. `docs/07_tedavi_raporu_d3_nihai_muhur.md` yaz: tek süreç, Redis yok, Direct `:5432`, Inngest çift anahtar. Runbook §14 ölü link olmasın.
4. Anayasa’daki “envanter SSOT” satırını bu dosyaya (`docs/tespit_raporu_v1.md`) çevir; `Tespit_Raporu.md` üstüne “arşiv / sapmalı sayılar” notu.
5. Bu T0 bitmeden Studio’ya üçüncü peron veya kariyer SWOT eklenmez.

### Adım T1 — Rail’i sürümlendir (ops hijyen)

6. Rail köküne git deposu (müze ya `.gitignore` ya submodule; müze remote’dan sır sızmasın).
7. İnce CI: `npm run verify:prebuild` (+ isteğe bağlı `test:e2e` kapi). Müze workflow kör kopyalanmaz.
8. `.env.local` gitignore teyidi; `verify:no-secrets` kırmızı çizgi.

### Adım T2 — omurgayı gerçekten bağla (ops, az kod)

9. `.env.example` → `.env.local`. `DATABASE_URL` + `DIRECT_URL` = `db.<ref>.supabase.co:5432`. Havuz `:6543` yok. IPv6 yoksa IPv4 add-on; P1001’i havuzla “yeşil boyama”.
10. `npm run ops:migrate` (Prisma 13 migrasyon + yedi SQL + D2 post-apply mühürleri).
11. Dashboard SQL Editor: `supabase/storage/studio-assets.sql`. Storage CORS: origin = `NEXT_PUBLIC_APP_URL`; metod yalnız PUT; `*` yasak. `npm run ops:storage-cors`.
12. İlk vatandaş `/register` → UUID → `SUPER_ADMIN_USER_ID` → süreç yeniden.
13. PayTR webhook `/api/payments/webhooks/paytr` + Inngest çift anahtar + Redirect URLs (`/auth/callback`, `/sifre-yenile`).
14. Duman: `GET /api/health` 200 ve Inngest `configured`; Studio görsel (katalog, debit, imzalı GET); akademi `rail-temel` satın al + müfredat + sınav ≥70 + sertifika doğrula.

### Adım T3 — döngü kanıtı (tek yüzey, tek sprint)

15. Canlı veya sandbox e2e: kayıt → yükleme → freelancer emanet → serbest → kariyer vizesi. Spec iskeleti `tests/e2e/cash-loop.spec.ts`; canlı DB ince, bellek yeşili “üretim” sayılmaz.
16. CEO **tek** seçim: (A) akademi içerik/ikinci kurs dumanı **veya** (B) kariyer portföy tek çocuk **veya** (C) kurumsal ilan → freelancer accept köprüsü (yeni tablo yok). Üçünü birden değil.
17. Rol dürüstlüğü yaması: VIDEO/TTS/stream ya kapı ya kopya — yeni peron değil.

### Adım T4 — üretim sertleşmesi (yeni oda yok)

18. Direct `:5432` kalıcı; pooler yasak teyidi.
19. Inngest Cloud bağlı; boş imzada 503.
20. Üç halka tek vatandaş bellek + mümkünse canlı duman (öğrenme → kanıt → kazanç).
21. İkinci instance yoksa Redis **eklenmez**. Resend şart değil; nakit log sicili dürüst kalsın.
22. PayTR `take: 50` için en azından log/metrik; defter UI tavan kopyası “tüm hareketler” yalanı söylemesin.

### Bu tedavide açıkça yapılmayacaklar

- 13. oda, Socket, Redis, GİB, çekim, Turnstile, OAuth şişmesi
- Studio 15 peron, DevLabs SaaS/Builder/Commerce/sandbox exec, VIDEO/TTS factory (T3.17 hariç kopya düzeltmesi)
- Hibe canlı kamu API’si, TKGM/sigorta “canlı” yalanı
- Müze `amountKurus` / triple-balance / holding geri getirme
- `docs/`’a 20 oda raporu yazıp uygulamayı erteleme
- Müze `hooks/` + lucide/geist/dnd-kit yığını
- Rail’i mikroservise bölme

### Karar sorusu (Tedavi’ye giriş)

**A (önerilen):** T0 belge kalkanı + T1 git + T2 omurga bağlama. Motor hazır; kırılacak yer kanonik belge, sürüm ve gerçek bucket/PayTR/Inngest bağıdır.

**B:** Oda-oda derinlik (SWOT, üçüncü Studio peronu, CRM) — seremoni dosyası yokken ve bucket bağlanmamışken müzenin hatasının küçük ölçeklisidir.

Ben **A** derim. 12 oda mutlu-yol motoru + API + sayfa taşıyor. Bugün eksik olan yeni oda değil; **testlerin okuduğu son belge mühürleri, Rail’in sürümlenmesi ve öğrenme–kanıt–kazanç döngüsünün üretimde kanıtıdır.**
