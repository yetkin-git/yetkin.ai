# Tespit Raporu — `yetkin.ai` × `yetkin_rail` karşılaştırma

| Alan | Değer |
|------|--------|
| Faz | Tespit Promptu #1 — yapı / mimari / kodlanmış bileşen envanteri |
| Tarih | 16 Ağustos 2026 (disk taraması, ~22:20) |
| Prototip (müze) | `d:\yetkin_rail\yetkin.ai` — ayrı Next uygulaması, ayrı `.git`, Rail git’ine **girmez** (`.gitignore`) |
| Gövde | `d:\yetkin_rail` (Rail) |
| Yöntem | Disk sayımı + `package.json` / Prisma / App Router / `lib/` / kenar / mühür betikleri / anayasa. Müze `.env.local` okunmadı. |
| Anayasa | `docs/ANAYASA.md` |
| Teslimat | Yalnız bu dosya. Ürün kodu, şema, env **değiştirilmedi.** |

Aynı gün `docs/01_tespit_raporu.md` durur. ANAYASA envanter SSOT satırı hâlâ `docs/tespit_raporu_v1.md` gösterir; **o dosya diskte yoktur.** Bu belge Tespit #1 teslimatıdır.

---

## 0. Yönetici özeti

`yetkin_rail`, `yetkin.ai` monolitinın düzenlenmiş kopyası **değildir.** Müze **ilham ve yasak listesidir** (S9-B): TypeScript import grafı, Next tracing ve HTTP yolu `/yetkin.ai` dışındadır. Kör kopya anayasaya aykırıdır.

Ölçek farkı kasıtlıdır. Müze ~130 düğümlük evrensel bina; Rail **12 dikey oda + 4 çekirdek sığınak.** Yüzey kabaca müzenin **%11–%25**’i. Bu bir gecikme değil, tavan kararıdır.

Kritik teşhis: **yeniden yazma “başlanmamış” değildir.** Omurga (kimlik, tek cüzdan, append-only defter, emanet, fiyat kilidi, PayTR, LLM gümrüğü, RLS, oda duvarı, kenar JWKS/CSP, HTTP idempotency, Studio imzalı depo, dashboard BFF) **kodda durur.** On iki odanın her birinde mutlu yol motoru + API + sayfa vardır. Beş dikey (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) anayasada canlıya-çıkış mührü olarak işaretlenmiştir.

“Eksik” tek kova değildir. Üç kova vardır:

1. **Bilinçli kesim** — anayasa / şema / `.env.example` yasağı. Geri açılmaz.
2. **Oda var, içerik ince** — kariyer SWOT ormanı, 15 Studio peronu, kurumsal CRM, canlı devlet API’si. Çoğu onay ister; varsayılan **hayır.**
3. **Üretim ve belge kalkanı** — seremoni markdown yok; Anayasa’nın işaret ettiği envanter dosyası yok; CI taslağı var ama git takibi belirsiz; hız tavanı tek süreç; Studio bucket `ops:migrate` dışında.

**Tek cümlelik strateji:** *12 odayı şişirme; testlerin okuduğu belge mühürlerini kapat; omurgayı gerçek Postgres/Auth/PayTR/Inngest/Storage’a dürüst bağla; öğrenme–kanıt–kazanç döngüsünün içeriğini üretimde kanıtla.*

---

## 1. Dizin yapısı

Her iki gövde de `src/` kullanmaz. Uygulama `app/` + `lib/` + `components/` + kök `proxy.ts` (Next 16; kök `middleware.ts` yok).

### 1.1 Kök ağaç

| Öğün | `yetkin.ai` (müze) | `yetkin_rail` |
|------|-------------------|---------------|
| `package.json` adı | `yetkin.ai` `1.0.0` | `yetkin-rail` `0.1.0` |
| README üretim alanı | `https://yetkin.ai` | “mühürlü emek işletim sistemi” |
| `app/` | ~46 üst öğün (oda + kesilmiş yüzey) | 12 oda + `(auth)` `(kernel)` `(public)` `api` `auth` |
| `lib/` üst klasör | **90** | **16** (12 oda + `kernel` + `copy` + `showcase` + `ui`) |
| `components/` | oda ormanı + paylaşılan | 12 oda + `shell` `auth` `kernel` `theme` `ui` `showcase` |
| `hooks/` | **37** dosya | **yok** (kasıtlı; sunucu-ağır gövde) |
| `prisma/` | tek `schema.prisma` (~342 KB) + **210** migrasyon klasörü | `schema/*.prisma` **13** dosya + **13** migrasyon |
| `server/` | chess / anket / arena Socket.IO | **yok** |
| `middleware/` | klasör var | **yok** |
| Kenar | `proxy.ts` | `proxy.ts` |
| İşler | `lib/inngest/` **25** dosya | `lib/kernel/jobs/inngest.ts` + `lib/arena/jobs.ts` (**6** işlev) |
| Test | `tests/` 603 vitest + 11 spec | `tests/` **117** vitest + **12** spec |
| CI | `.github/workflows/ci.yml` + `staging-deploy.yml` | `.github/workflows/ci.yml` (ince; Docker/Playwright yok) |
| Docker | `docker-compose.dev.yml` | **yok** |
| `docs/` | pratikte şirket Word dosyaları (README’deki `01_GENEL_YAPI_TESPIT_RAPORU.md` diskte yok) | Anayasa + ops + depo sözleşmesi + bu tespit |
| Git | müze kendi `.git` | Rail kök `.git`; `yetkin.ai/` ignore |

Rail `app/` üstü: `(auth)`, `(kernel)`, `(public)`, `academy`, `api`, `arena`, `auth`, `career`, `dashboard`, `devlabs`, `freelancer`, `hibe`, `junior`, `kurumsal`, `pazaryeri`, `social`, `studio`.

Müze `app/` üstünde Rail’de **olmayan** (ve çoğunlukla **açılmaması gereken**) kökler: `agency`, `anket`, `bina`, `chess`, `destek`, `fatura`, `fiyatlandirma`, `liyakat-arz`, `loncalar`, `maintenance`, `meydan`, `onboarding`, `senior`, `seref-kursusu`, `talent`, `tarim`, `u`, `verify`, `verify-email`, `yardim`, `yetkin-ilan` (Rail rewrite `/yetkinilan` → `/pazaryeri`), `yetkinx`.

### 1.2 Rail oda kalıbı (tekrarlanan, sürdürülebilir)

Her dikey `lib/<oda>/` altında kabaca aynı dilimleri taşır:

`index.ts` (mutlu yol sabiti + public API) · `types.ts` · `schemas.ts` (Zod) · `engine.ts` · `runtime.ts` · `load.ts` · `prisma-store.ts` · gerektiğinde `fsm.ts` / `escrow-refund.ts`.

Bugünkü dosya listesi:

| Oda | `lib/<oda>/` dosyaları |
|-----|------------------------|
| academy | `index`, `types`, `schemas`, `engine`, `exam`, `exam-engine`, `curriculum`, `curriculum-engine`, `certificate-verify`, `seed`, `load`, `runtime`, `prisma-store` |
| freelancer | `index`, `types`, `schemas`, `engine`, `fsm`, `dispute-engine`, `arbitration`, `messages`, `squad-engine`, `escrow-refund`, `seed`, `load`, `runtime`, `prisma-store` |
| studio | `index`, `types`, `schemas`, `engine`, `image-engine`, `billing`, `storage`, `signed-upload`, `citizen-storage`, `load`, `runtime`, `prisma-store` |
| pazaryeri | `index`, `types`, `schemas`, `engine`, `fsm`, `offer-engine`, `doping-engine`, `category`, `escrow-refund`, `load`, `runtime`, `prisma-store` |
| career | `index`, `types`, `engine`, `visa-gate`, `prisma-proofs`, `load`, `runtime`, `prisma-store` — **`schemas.ts` yok** (en ince oda kalıbı) |
| devlabs | `index`, `types`, `schemas`, `engine`, `bench`, `constitutional-linter`, `keys`, `load`, `runtime`, `prisma-store` |
| kurumsal | `index`, `types`, `schemas`, `engine`, `fsm`, `escrow-refund`, `load`, `runtime`, `prisma-store` |
| arena | `index`, `types`, `schemas`, `engine`, `fsm`, `jobs`, `escrow-refund`, `load`, `runtime`, `prisma-store` |
| hibe | `index`, `types`, `schemas`, `engine`, `catalog`, `match`, `load`, `runtime`, `prisma-store` |
| junior | `index`, `types`, `schemas`, `engine`, `age-gate`, `meb-catalog`, `load`, `runtime`, `prisma-store` |
| social | `index`, `types`, `schemas`, `engine`, `dto-map`, `proof-feed.dto`, `moderation`, `prisma-proofs`, `load`, `runtime`, `prisma-store` |
| dashboard | nabız dilimleri (`*-pulse.ts`) + `wallet-strip` + `ribbon-order` — **engine/prisma-store yok** (BFF montajı) |

Çekirdek `lib/kernel/`: `admin`, `ai`, `auth`, `crypto`, `escrow`, `health`, `http`, `identity`, `jobs`, `ledger`, `money`, `observability`, `passport`, `payments`, `pricing`, `security`.

Oda duvarı ESLint §2.8 ile kilitli: çekirdek ↛ dikey; dikey ↛ başka dikey `engine` / `runtime` / `prisma-store`. Çapraz konuşma HTTP veya kernel sözleşmesi. Freelancer ↛ kurumsal/kariyer (EARNINGS_WALL).

---

## 2. Mimari karşılaştırma

### 2.1 Paylaşılan fikir

Öğrenme → kanıt → kazanç. Next.js 16 App Router, React 19, Prisma 7, Postgres, Supabase Auth, Inngest, Zod 4, PayTR, SEN / Quiet Luxury kopyası. Kenar `proxy.ts`.

### 2.2 Kırılan çizgiler (kopyalanmamalı)

| Katman | Müze | Rail |
|--------|------|------|
| Yüzey tavanı | 18 asil domain + 112 alt peron = **130 düğüm** (`lib/bina/domain-registry.ts`) | **12 oda** (`lib/kernel/modules.ts`) + 4 sığınak |
| Nakit | `amountKurus` + `User.balanceKurus` / `escrowKurus` + modül kasaları + `merit-swap:` | **`amountMinor` + tek `Wallet` + append-only `LedgerEntry`**. User’da bakiye kolonu yok |
| Emanet | bakiye benzeri ikinci kasa izi | `EscrowHold` **kilit**; ikinci bakiye değil |
| Realtime | Socket.IO (satranç 3001, anket 3002, arena) + Redis/Upstash | HTTP + Inngest. Redis **yok** |
| Auth ekstra | Turnstile, OAuth, MFA, **`SUPABASE_SERVICE_ROLE_KEY`** | `anon` + vatandaş JWT. `service_role` JS/env’de **yok** |
| LLM | geniş rol/alias ormanı (tarım agronomist vb. tarihçe) | Tek kapı `invokeLlm` / `generateImage`; **8 kanonik rol** |
| DevLabs | saas / builder / codex / commerce / sandbox **exec** | **Linter’dır, runner değildir.** `eval` / `child_process` / sandbox yok |
| Studio | 20+ alt klasör (ads, 3D, talk, canvas, photo, avatar, fatura…) | Tek tezgâh: metin + IMAGE_GEN + imzalı depo |
| Hibe | KOSGEB scraper, wizard, Success-Fee, KDV kredi | Tohum katalog + eşleştirme; `catalog-not-live-government-api` |
| Cüzdan çıkış | admin withdrawals, GİB / e-arşiv | **S43 kapalı döngü:** nakit PayTR ile girer, 12 odada harcanır, bankaya çıkış yok |
| Prebuild | ~20 verify (PII, holding, socket, amount-kurus, launch-gate…) | 8 verify + surface + typecheck |
| UI yığını | lucide, geist, dnd-kit, `@bprogress`, 37 hook | yerel SVG, sistem font |
| TypeScript | `^6.0.3` | `^5.9.2` (Rail’e 6 zorunlu değil) |
| Env | yüzlerce anahtar (Redis, ads vault, MFA, GİB, cron, merit seal…) | kısa şablon; boş anahtar = dürüst kapalı yüzey |
| Mock / bakım | `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `app/maintenance` | yok |
| CSP | müze kenarı + launch-gate | istek başı nonce; üretimde `unsafe-eval` yok; `next.config` statik CSP yazmaz |

### 2.3 Rail çekirdek omurga — duran yetenekler

| Yetenek | Kanıt | Not |
|---------|-------|-----|
| Kimlik | e-posta/şifre, PKCE `/auth/callback`, cookie/Bearer `getUser` | Turnstile / OAuth şişmesi yok |
| Kenar | `proxy.ts`: müze 404, `/kayit` 308, JWKS/HS256, nonce CSP, bellek hız tavanı | Çerez varlığı yetmez |
| Para | `Wallet` + `LedgerEntry`; birim `amountMinor` | `amountKurus` kolon adı yasak |
| Emanet | `EscrowHold` + TTL + dikey iade kancası | Kompozisyon kökü `register-escrow-hooks.ts` |
| Ödeme | PayTR iframe; webhook tutar eşitliği; valör Inngest 30 dk | `/api/wallet/withdraw` **yok** |
| Fiyat | Super Admin katalog SSOT; 15 dk `CheckoutPriceLock` | 7 `REQUIRED_CATALOG_DEFINITIONS` |
| LLM | `lib/kernel/ai`; 8 rol; bütçe kalkanı | Ham SDK dikeyde yasak (`verify:ai-gateway`) |
| RLS | FORCE RLS + sahip yalnız SELECT; yazma Prisma postgres rolü | |
| İşler | 6 Inngest: PayTR scan/single, emanet TTL/notify, Arena tur scan/tick | uygulama id `yetkin-rail`, serve `/api/jobs/inngest` |
| Idempotency | defter anahtarı + HTTP `Idempotency-Key` + `HttpIdempotencyRecord` | unique `(user_id, route, key)` |
| Hız tavanı | süreç-içi bellek | ikinci replica kotayı görmez |
| Sağlık | `GET /api/health` DB ping; down = 503 | JSON `phase` taşımaz |
| Admin | katalog PATCH; kenar `auth = "admin"` + env UUID | üye / moderasyon / çekim paneli yok |
| Studio depo | imzalı PUT (`studio-assets`); Prisma hash/mime/path | eski `inline-base64` okunur; kör DROP yok |
| Kokpit | tek BFF `/api/dashboard/pulse` | kernel dikey tablo sorgulamaz |
| Prebuild | `verify:prebuild` = no-secrets → amount-minor → ai-gateway → rls-status → api-auth → boundaries → sen-axis → atomic-seals → test:surface → typecheck | `build` = `prisma generate && verify:prebuild && next build` |

**Katalog sicili (7 anahtar):** `studio:generation:text`, `studio:generation:image`, `kurumsal:job-posting:floor`, `arena:tender-pool:floor`, `pazaryeri:listing:floor`, `pazaryeri:listing:asset-floor`, `pazaryeri:doping:boost`. Akademi kurs fiyatları SQL seed’dedir (`ac_rail_temel`, `ac_ray_sinyal`), bu dizide değil.

**AI roller (tavan 8):** `EXECUTIVE_BRAIN`, `DEEP_RESEARCH`, `FAST_STREAM`, `LITE_STREAM`, `IMAGE_GEN`, `VIDEO_GEN`, `VOICE_TTS`, `OPEN_LOCAL`. Factory yalnız metin + görsel. `VIDEO_GEN` / `VOICE_TTS` anahtar vardır, üretim kapısı yoktur.

**İnce alias** (`next.config.ts`): `/kariyer`→`/career`, `/ogren`→`/academy`, `/yetkinx`→`/social`, `/corporate`→`/kurumsal`, `/profile`→`/profil`, `/passport`→`/pasaport`, `/market`→`/yetkinilan`, `/giris`→`/login`, `/kayit`→`/register`. Rewrite: `/yetkinilan` → `/pazaryeri`. KAPAT-oda yönlendirmesi yazılmaz.

### 2.4 Ölçek tablosu (bugünkü disk)

| Ölçüt | `yetkin.ai` | `yetkin_rail` | Oran |
|--------|-------------|---------------|------|
| Anayasal yüzey | 18 domain + 130 düğüm | 12 oda + 4 sığınak | ~1/3 asil oda; düğümde çok daha dar |
| `page.tsx` | 158 | **40** | ~%25 |
| `app/**/route.ts` | 559 | **87** | ~%16 |
| `loading.tsx` | 151 | **34** | — |
| `error.tsx` | 148 | **1** (yalnız kök) | kasıtlı ince |
| `layout.tsx` | 30 | **14** | — |
| Prisma model | **248** | **46** | ~%19 |
| Prisma enum | **181** | **39** | — |
| Prisma migrasyon | 210 | 13 uygulama + 7 kilitli SQL + 1 storage SQL | — |
| `lib/` TS/TSX | 2291 | **261** | ~%11 |
| `components/` TS/TSX | 1111 | **127** | ~%11 |
| React `hooks/` | 37 | 0 | kasıtlı |
| Vitest `*.test.ts` | 603 | **117** | ~%19 |
| Playwright `*.spec.ts` | 11 | **12** | sayı yakın, kapsam dar |
| Inngest | 25 dosya | 6 işlev | — |
| CI | ci + staging-deploy | ince `verify:prebuild` | müze kopyası değil |
| Docker | compose var | yok | şart değil |

---

## 3. Rail — kodlanmış bileşenler (mevcut durum)

### 3.1 On iki oda — mutlu yol (kodda)

Kaynak: `lib/kernel/modules.ts` + her odanın `index.ts`.

| Oda | Vatandaş yolu | Mutlu yol | Derinlik |
|-----|----------------|-----------|----------|
| Dashboard | `/dashboard` | 12 nabız + cüzdan şeridi; tek BFF | müze fırsat / PropTech kokpiti yok |
| Studio | `/studio` | taslak → LLM debit; IMAGE_GEN; imzalı depo; Base64 tavan 2 097 152 | 15+ müze peronu yok |
| Akademi | `/academy` | katalog → kilit → settlement → **müfredat** → sınav ≥70 → SHA256 sertifika → `/academy/dogrula/[hash]` | 2 tohum kurs; `/oyna` **var** |
| Kariyer | `/career` | akademi sertifikası veya freelancer RELEASE ile atomik vize + portföy | SWOT / CV builder / prova **yok** (kasıtlı dar) |
| Freelancer | `/freelancer` | ilan → teklif → emanet kabul → mesaj → teslim/iade; 2 turlu tahkim; squad `shareBps` | en derin nakit oda |
| DevLabs | `/devlabs` | proje → üret → anayasal linter → artifact; HMAC kasa `yrk_` | exec / SaaS / sandbox yok |
| Kurumsal | `/kurumsal` | şirket + mühürlü ilan + teklif + ödül/serbest/iade | CRM / fatura yok |
| Hibe | `/hibe` | tohum katalog + etiket eşleştirme + rehber kayıt | canlı KOSGEB yok |
| Arena | `/arena` | ihale emaneti + HTTP/Inngest tur tiki | Socket yok (`http+inngest`) |
| Pazaryeri | `/yetkinilan` (disk `pazaryeri/`) | dijital anında settlement vs hizmet/emlak/vasıta emanet; teklif; doping | TKGM/sigorta canlı API değil |
| Junior | `/junior` | yaş 10–17, ebeveyn, harçlık **Wallet satırı değil**; 2 statik MEB izi | LMS / mentor yok |
| Social | `/social` (YetkinX) | mühürlü kanıt akışı + ACK/SHARE; tıklama tuzağı denylist | boost / X-YouTube yok |

Çekirdek sığınaklar (oda **sayılmaz**): `/profil`, `/cuzdan`, `/pasaport`, `/admin`.

### 3.2 Prisma — 46 model

**Kernel (9):** User, Wallet, LedgerEntry, EscrowHold, PaymentOrder, PriceCatalogEntry, CheckoutPriceLock, AiTokenUsage, HttpIdempotencyRecord.

**Dikey:** AcademyCourse / Purchase / Exam / Attempt / Certificate / LessonCompletion; FreelancerJob / Bid / Contract / Dispute / Message / Squad / Member; StudioDraft / Generation / DigitalAsset; MarketplaceProduct / Order / Offer / Doping; CareerVisaStamp / PortfolioItem; DevLabsProject / ApiKey / Artifact; CorporateCompany / JobPosting / JobOffer; GrantProgram / Application; ArenaTender / Submission / Award; JuniorProfile / Allowance; ProofFeedItem / Interaction.

Para her yerde `amountMinor` + `currencyCode`. Çapraz oda FK’leri kernel emanet/kilit/usage için **string**dir; çekirdek dikey tablo sorgulamaz.

### 3.3 Vatandaş sayfaları (40)

`/`, `/legal`, `/login`, `/register`, `/sifremi-unuttum`, `/sifre-yenile`, `/admin`, `/cuzdan`, `/pasaport`, `/profil`, `/dashboard`, `/studio`, `/academy` + `[slug]` + `oyna` + `certificates` + `dogrula/[hash]`, `/career`, `/freelancer` + `new` + `jobs/[id]` + `contracts/[id]`, `/devlabs` + `projeler/[id]`, `/kurumsal` + `ilan/yeni` + `ilan/[id]`, `/hibe` + `[slug]`, `/arena` + `yeni` + `[id]`, `/pazaryeri` (marka `/yetkinilan`) + `[slug]` + `siparisler` + `tezgah`, `/junior` + `ebeveyn`, `/social` + `[id]`.

### 3.4 API yüzeyi (87 `route.ts`)

Çekirdek: `/api/health`, `/api/jobs/inngest`, `/api/payments/webhooks/paytr`, `/api/admin/catalog`, `/api/auth/session`, `/api/auth/logout`, `/api/profile`, `/api/wallet/top-up`, `/auth/callback`.

Dashboard: `/api/dashboard/pulse`, `wallet-strip`, `freelancer-pulse`.

Akademi: courses (+ lock/purchase/curriculum/exam), certificates, pulse.  
Freelancer: jobs (+ bids/accept), contracts (+ messages/release/refund/dispute), squad, dispute.  
Studio: drafts, generate, generations, images, storage sign-upload/confirm, pulse.  
Pazaryeri: products (+ lock/purchase), stall, orders (+ confirm/refund), offers, doping, pulse.  
Kurumsal: company, jobs (+ offers/award/release/refund), pulse.  
Arena: tenders (+ submissions/award/refund), pulse.  
Kariyer: visas, portfolio, pulse.  
Hibe: programs, match, applications, pulse.  
Junior: profile, parent, allowance, pulse.  
DevLabs: projects (+ generate/keys/revoke), pulse.  
Social: feed, posts (+ acknowledge/share), pulse.

Her handler `export const auth` taşır; `verify:api-auth` sicili okur.

### 3.5 Test ve ops

- Vitest odalara bölünmüş: `tests/{academy,arena,auth,career,copy,dashboard,devlabs,freelancer,hibe,junior,kernel,kurumsal,pazaryeri,social,studio,ui}` + `helpers` + `shims`.
- Playwright: akademi, freelancer, studio, DevLabs, Yetkinİlan, kayıt, nakit döngüsü, dashboard nabız, legal, kenar auth, Studio tavan HTTP.
- Ops betikleri: `ops:migrate`, `ops:storage-cors`, `ops:t3-academy-loop`, `ops:t4-freelancer-loop`.
- Mühür: `verify-no-secrets`, `amount-minor`, `ai-gateway`, `rls-status`, `api-auth`, `atomic-seals`, `boundaries`, `sen-axis`.

### 3.6 Doküman SSOT — bugünkü `docs/`

| Yol | Disk |
|-----|------|
| `docs/ANAYASA.md` | var |
| `docs/07_OPS_RUNBOOK.md` | var |
| `docs/08_STORAGE_CONTRACT.md` | var |
| `docs/01_tespit_raporu.md` | var (aynı gün önceki envanter) |
| `docs/01_tespit_raporu_karsilastirma.md` | **bu dosya** |
| `docs/tespit_raporu_v1.md` | **yok** — Anayasa “Envanter SSOT” satırı ölü |
| `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | **yok** — Anayasa + runbook + `ops-migrate-surface.test.ts` okur |
| `docs/07_tedavi_raporu_d3_nihai_muhur.md` | **yok** — Anayasa + runbook §14 |

---

## 4. Eksikler ve farklar (üç kova)

### Kova 1 — bilinçli kesim (tekrar açılmamalı)

| Modül / yapı | Müze konumu | Rail gerekçesi |
|--------------|-------------|----------------|
| Chess + `chess.js` + socket:3001 | `app/chess`, `server/chess-socket-server.ts` | kesilmiş oda; 13. oda değil |
| Anket / kamuoyu + socket:3002 | `app/anket`, `lib/kamuoyu/` | k-anonimlik yığını |
| Lonca / meclis | `app/loncalar`, `lib/loncalar/` | 13. oda yasağı |
| Tarım | `app/tarim` | AI rol patlaması gümrüğü kirletmişti |
| Talent | `app/talent` | 12 oda sicilinde yok |
| Redis / Socket.IO | `lib/redis/`, `server/*` | Arena = HTTP + Inngest |
| `SUPABASE_SERVICE_ROLE_KEY` | müze `.env.example` | RLS + Prisma yazma çizgisi |
| GİB / e-arşiv / çekim | şema + `app/admin/withdrawals` | S43 |
| Reklam / Turnstile / OAuth şişmesi | `lib/ads/`, `studio/yetkin-ads` | env yasağı |
| DevLabs exec / SaaS / Builder / Codex / Commerce / sandbox | `app/devlabs/{saas,builder,codex,…}` | “linter’dır, runner değildir” |
| Social boost / X-YouTube | müze social ormanı | DTO yasağı |
| VIDEO_GEN / VOICE_TTS factory | müze `forge/media-engine` | rol var, factory yok |
| 130 BINA + onlarca alias | `lib/bina/domain-registry.ts` | ince alias tavanı |
| `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` | müze env / `app/maintenance` | dürüst kapalı yüzey |
| Liyakat takası / holding / `merit-swap:` | `lib/merit/`, modül kasaları | ikinci nakit yazıcı yasağı |
| `hooks/` (37) | `yetkin.ai/hooks/` | sunucu-ağır gövde |
| `User.balanceKurus` | müze şema | User’da bakiye kolonu yasak |

### Kova 2 — oda var, derinlik müzenin gerisinde (ürün kararı — kör taşıma değil)

| Oda | Rail’de olan | Müze’den gelmeyen (ayrı onay; varsayılan hayır) |
|-----|----------------|--------------------------------------------------|
| Career | kanıt → vize → portföy | `/career/cv-builder`, `swot`, `prova`, `roadmap`, `cv-analiz`, `zihinsel-prova`, `/senior` |
| Academy | satın al + oynatıcı + sınav + sertifika (2 kurs) | `vision`, `corporate-qualification`, `suspended-education`, müzayede/telif, onlarca ders |
| Studio | metin + IMAGE_GEN + imzalı depo | ads, 3D, talk, canvas, photo, avatar, convert, invoice, flow, brand, dijital twin, CAD… |
| DevLabs | kasa + generate + linter | saas/builder/codex/commerce/sandbox/forge/native/engine |
| Kurumsal | şirket + mühür + teklif | CRM, fatura, görevler, Twin IK, `/kurumsal/hibe` |
| Hibe | katalog + rehber | `/hibe/olustur` wizard, scraper, Success-Fee — **kapalı tutulmalı** |
| Pazaryeri | dijital/hizmet/RE/araç + teklif + doping | 5 aşamalı PropTech, sigorta API, TKGM canlı |
| Junior | yaş + veli + harçlık | `meydan`, mentor, MEB üretim LMS |
| Dashboard | 12 nabız BFF | `firsat`, `yetkin-panel`, kokpit içi Yetkin İlan ormanı |
| Admin | katalog | üyeler, moderation, support, withdrawals, ads-config, suspensions |
| Pasaport | vize projeksiyonu | `/pasaport/rozetler`, `liyakat`, `dogrula` çocukları |
| Legal | tek `/legal` dürüst metin | ayrı mesafeli satış / iade URL’leri |
| Auth UX | login/register/şifre | `verify-email`, `onboarding`, Turnstile |
| Profil | kimlik + görünen ad | `siparislerim`, `ayarlar`, KYC |

Akademi müfredat oynatıcısı **eksik değildir.** `ACADEMY_HAPPY_PATH` `curriculum` adımı içerir; `app/academy/[slug]/oyna` durur. İnce olan **içerik hacmi**dir (2 tohum), motor değil.

### Kova 3 — platform boşlukları (oda değil)

| Boşluk | Durum | Etki |
|--------|--------|------|
| Seremoni markdown | `tedavi_raporu_11` ve `07_tedavi_raporu_d3` yok | `ops-migrate-surface.test.ts` `readSrc` ile dosyayı açar; yoksa test **patlar**. Prebuild kırmızı olabilir |
| Envanter SSOT yolu | Anayasa `tespit_raporu_v1.md` | ölü link; Linux CI / ajan kafa karışıklığı |
| İnce CI | `.github/workflows/ci.yml` diskte var (Node 20.19 + `verify:prebuild`) | git takibi bu tespit anında belirsiz; müze staging-deploy **kopyalanmamalı** |
| Docker | yok | şart değil |
| VIDEO/TTS factory | rol vaadi, kapı yok | kopya “üretir” derse yalan |
| `FAST_STREAM` / `LITE_STREAM` | rol adı “akış”; çağrı senkron | stream UI yok |
| İşlem e-postası | Auth SMTP Supabase; nakit yalnız `txn.notice.*` log | anlaşmazlık/sertifika vatandaşa kör |
| Gözlem SDK | `requestId` + yapılandırılmış log | Sentry/OTel yok |
| Hız tavanı | bellek içi | ikinci replica sessiz delik; Redis eklenmemeli |
| PayTR tarama | `take: 50` / 30 dk | hacimde backlog; metrik yok |
| Defter sayfalama | tavan var; cursor yok | “tüm hareketler” yalanı söylenmemeli |
| Tek `error.tsx` | kök | oda izolasyonu ince (148 kopya istenmez) |
| Studio bucket SQL | `ops:migrate` listesinde yok | Dashboard adımı atlanırsa görsel 4xx/503 |
| Kariyer `schemas.ts` | kalıpta yok | Zod girişi diğer odalara göre ince; yeni peron değil |
| Font / PWA | yok | Quiet Luxury için zorunlu değil |

### Rail’de duran, müzede “fazla” olan (korunacak kazanç)

1. Çekirdek ↛ dikey; dikey ↛ dikey motor.
2. Tek nakit SSOT. Escrow kilit, ikinci bakiye değil.
3. String FK; kernel oda tablosu bilmez.
4. Dürüst kapalı ürün (boş env / boş DB yalan bakiye basmaz).
5. Marka ≠ disk (`pazaryeri/` vs `/yetkinilan`).
6. 12 oda tavanı; 13. yasak.
7. Kenar ince, fail-closed JWT + nonce CSP.
8. DevLabs linter’dır, runner değildir.
9. Kapalı döngü cüzdan (S43).
10. Müze build/trace/import dışı.

---

## 5. Kritik riskler ve bağımlılıklar

“Hata” ile “bilinçli kesim” karıştırılmamalı.

### P0 — kalkan ve bağlama

1. **Seremoni dosyaları yok.** `tests/kernel/ops-migrate-surface.test.ts` `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` içeriğini okur (`npm run ops:migrate`, bucket SQL, `phase` yasağı). Runbook `docs/07_tedavi_raporu_d3_nihai_muhur.md` ister. Dosya yoksa surface / `verify:prebuild` kırmızı. Bu ürün motoru kazası değil, **testlerin istediği insan SSOT** kazasıdır.
2. **Anayasa envanter yolu ölü.** `docs/tespit_raporu_v1.md` yok. Ajan ve operatör iki “01” dosyası + hayalet v1 arasında kaybolur.
3. **Studio bucket `ops:migrate` dışında.** Doğru (yedi SQL şişmez). Yanlış: Dashboard SQL Editor + CORS atlanırsa görsel üretim 4xx/503 — “Studio bozuk” sanılır.
4. **Inngest imza.** Üretimde boş `INNGEST_SIGNING_KEY` veya `INNGEST_EVENT_KEY` → serve **503** (doğru). Cloud bağlanmadan valör/TTL/Arena tur çalışmaz; `PENDING` birikir.
5. **Hız tavanı tek süreç.** İkinci instance sessiz delik. Redis eklenmemeli.
6. **Postgres oturum kipi.** `DATABASE_URL` / `DIRECT_URL` = `db.<ref>.supabase.co:5432`. Transaction pooler `:6543` `FOR UPDATE` / `$transaction` kilidini düşürür. Müze host’u (S13-A) yasak.

### P1 — nakit, depo, gözlem

7. Nesne depo fail-closed: bağlı değilse “nesne depo bağlı değil”. Dürüst, ama ops atlanırsa yanlış teşhis.
8. Eski `inline-base64` satırlar kör DROP edilmez; yedek şişebilir.
9. Nakit bildirimi yalnız log. Vatandaş e-posta kör.
10. HTTP idempotency evrensel tarama değil. Yeni nakit ucu sicili unutabilir.
11. Admin = tek env UUID. Boş env = kimse admin değil (doğru). UUID sızıntısı hâlâ tek sır.
12. PayTR: üretimde sandbox/mock fail-closed. Webhook HMAC + `total_amount === amountMinor`.

### P2 — ürün ve ajan tuzağı

13. Çekirdek döngü iskeleti var; **içerik ince** (2 kurs). Motoru şişirmek içeriği çoğaltmaz.
14. Müze klasörü workspace’i şişirir (2291 lib dosyası). Import yasak mühürlü; ajan “şuradan kopyala” tuzağı sürekli.
15. Müze GİB + çekim + holding modelleri Rail şemasına **taşınamaz.** `amountKurus` geri getirilemez.

### Bağımlılık haritası (omurga sırası)

```
Supabase Auth (anon + JWT/JWKS)
  → Postgres Direct :5432 (Prisma yazma + RLS okuma)
    → ops:migrate (13 migrasyon + 7 SQL)
      → Studio bucket SQL (Dashboard, ops listesi dışı)
        → PayTR webhook HMAC
          → Inngest Cloud (çift anahtar)
            → öğrenme–kanıt–kazanç dumanı
```

Bu zincirde bir halka boşsa ürün “oda eksik” değil, **dürüst kapalı** kalmalıdır. Sahte bakiye, sahte sertifika, sahte `phase` yazılmaz.

---

## 6. Bu taşıma/yeniden yazma sürecinde SEN OLSAYDIN NE YAPARDIN?

Mimari, teknoloji ve dosya yapısı için en iyi pratik öneriler.

Müze’yi “daha düzenli kopyala”mazdım. 12 oda + çekirdek kararı **doğru ve bitmiş bir mimari seçimdir.** 130 düğümü geri doldurmak üç kişilik ekibi tekrar `yetkin.ai` karmaşasına götürür. Rail’in kazancı **az yüzey, tek gümrük, fail-closed dürüstlük.** Bunu bozan her “müze’den de şunu alalım” talebini bu raporun Kova 1 tablosundan geçirirdim.

### Mimari

- **Tek süreç, tek nakit gümrüğü, 12 oda tavanı** kalır. Mikroservise şimdi bölmek nakit gümrüğünü çoğaltır; `User` üzerindeki Prisma `@relation` listesi kolon şişmesi değil, okunurluk borcudur — şimdi bölünmez.
- Çapraz oda konuşması yalnız HTTP veya kernel sözleşmesi. Freelancer motorunun kurumsal tabloyu “kısayoldan” görmesi yasak kalır.
- Arena realtime’ı geri getirmezdim. HTTP + Inngest yeterli ve anayasal.
- Redis / Socket.IO / chess.js bu gövdeye **eklenmez.** Hız tavanı ikinci replica açılana kadar bellek içi dürüst kalsın.
- DevLabs’i runner yapmazdım. Generate → linter → artifact çizgisi korunur.

### Teknoloji

- Yığın (Next 16, React 19, Prisma 7, Zod 4, Inngest, jose, pg adapter) **tutulur.** Müze TypeScript 6, lucide, geist, dnd-kit, `@bprogress` Rail’e zorunlu değildir.
- Para tipi `amountMinor` + `currencyCode` SSOT kalır. `amountKurus` geri gelmez.
- LLM yalnız `invokeLlm` / `generateImage`. VIDEO/TTS için ya dürüst kopya (“kapı yok”) ya da ayrı onaylı factory — gizlice “üretir” yazılmaz.
- `SUPABASE_SERVICE_ROLE_KEY` asla eklenmez. Storage vatandaş JWT + anon.
- İnce CI: `npm run verify:prebuild` yeter. Müze `staging-deploy.yml` / k6 chess spike / Redis compose kopyalanmaz. Docker şart değil.

### Dosya yapısı

- `src/` açılmaz. `app/` + `lib/<oda>/` + `lib/kernel/` + `components/<oda>/` kalıbı **zaten sürdürülebilir çekirdektir.** Çoğaltılacak şey yeni oda klasörü değil, **içerik ve üretim bağlarıdır.**
- Prisma çok dosyalı şema (`prisma/schema/*.prisma`) müzenin 342 KB tek dosyasından üstündür; yeni oda = yeni `*.prisma` + kendi migrasyonu, kernel’e model yığılmaz.
- Müze `yetkin.ai/` workspace’te durabilir (ilham) ama import/trace dışı kalır. Ajan kuralı: müze dosyasından fonksiyon kesilmez.
- `docs/` insan SSOT’tur; ürün kodu import etmez. Testlerin `readSrc("docs/…")` yaptığı yollar **diskte gerçekten durmalıdır** — aksi halde mühür yalan söyler.
- Kariyer’e müze `swot` / `cv-builder` ağacı açılmaz. Oda kalıbındaki `schemas.ts` inceliği bir sprint konusu olabilir; 7 alt rota konusu değildir.

### Yapacağım iş dört cümle

**Kalkan belgelerini testlerin okuduğu yola kilitle, ince CI’yi Rail git’ine bağla, omurgayı üretime dürüst bağla, oda derinliğini nakit döngüsüne göre sıraya diz.**

Kova 1’i backlog’a yazmazdım. Chess, Redis, GİB, 15 Studio peronu, DevLabs exec “sonra yaparız” listesi değildir; **yasak listesidir.**

Bu sıra bitmeden kariyer SWOT, üçüncü Studio peronu veya kurumsal CRM açmazdım. Temiz mimari, eksik peronu doldurmakla değil, **tavanı ve gümrüğü korumakla** kurulur.

Neden bu sıra? Çünkü `verify:prebuild` belge yokluğunda kırmızıya döner; kırmızı prebuild üzerine özellik yığmak müzenin “130 düğüm yeşil boyanmış monolit” hastalığının küçük ölçeklisidir.

---

## 7. Bu rapora göre, bir sonraki aşamada somut olarak ilk hangi modülü/dosyayı kodlamalı veya düzeltmeliyiz?

**Yeni oda değil. Yeni Studio peronu değil. Müze dosyası taşımak değil.**

Omurga ve 12 oda mutlu yolu **zaten kodlanmış.** Bir sonraki somut iş, kırılacak yerin motor değil **insan SSOT + üretim bağı** olduğunu kabul etmektir.

### İlk dosya (tek, somut, bu hafta)

**`docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`**

Neden bu dosya, neden bir `lib/` motoru değil?

1. Anayasa satır 11 bu yolu “Canlıya geçiş” SSOT gösterir.
2. `docs/07_OPS_RUNBOOK.md` bu dosyaya link verir.
3. `tests/kernel/ops-migrate-surface.test.ts` dosyayı `readSrc` ile **açmak zorundadır.** Diskte yoksa test fail-closed patlar; `verify:prebuild` ve ince CI kırmızıya döner.
4. İçerik seremonidir, ürün kodu değildir: `npm run ops:migrate`; Studio bucket’ın **Dashboard SQL Editor** adımı olduğu dürüstçe yazılır (`supabase/storage/studio-assets.sql` ops listesinde yoktur); `phase: "11"` **yazılmaz**; Redis yok; Direct `:5432`; Inngest çift anahtar.

Hemen ardından (aynı dilim, hâlâ kod yok):

- **`docs/07_tedavi_raporu_d3_nihai_muhur.md`** — runbook §14 ölü linki kapanır (tek süreç, Redis yok, Direct port, Inngest fail-closed).
- Anayasa “Envanter SSOT” satırı `docs/tespit_raporu_v1.md` (yok) yerine **bu karşılaştırma dosyasına** veya `docs/01_tespit_raporu.md` + bu dosyanın tek kanonik adıyla kilitlenir. `tespit_raporu_v1.md` icat edilmez.

Bu üç belge durmadan `lib/career/engine.ts` veya `app/studio/...` açılmaz.

### İlk kod yüzeyi (T0 belgelerinden sonra — hâlâ yeni oda değil)

İnce CI zaten `d:\yetkin_rail\.github\workflows\ci.yml` olarak duruyor: Ubuntu, Node 20.19, `npm ci`, `verify:prebuild`. Müze workflow kopyası değildir. **İlk git’e alınacak kod yüzeyi bu dosyadır** (ürün motoru değil; kalkan). Playwright / Docker / tam `npm test` eklenmez.

### İlk dikey “modül” (yalnız omurga bağlandıktan sonra)

Ürün kodunda **yeni modül yazılmaz.** On iki oda sicili kapalıdır.

Omurga bağlandıktan sonra (`ops:migrate` + Auth + PayTR + Inngest + Studio bucket) kanıtlanacak **tek** döngü:

**Akademi** — `lib/academy/` + `app/academy/[slug]/oyna` + `app/api/academy/courses/[id]/purchase`.

Neden akademi, neden freelancer veya kariyer değil?

- Öğrenme–kanıt–kazanç halkasının **ilk halkası**dır (öğrenme).
- Mutlu yol en tam kodlanmış dikeylerden biridir (kilit, settlement, müfredat, sınav ≥70, SHA256 belge).
- Tohum kurs `ac_rail_temel` SQL’de durur; ops dumanı `ops:t3-academy-loop` ile tanımlıdır.
- Kariyer vizesi akademi belgesine veya freelancer RELEASE’e dayanır; akademi yeşil değilse kariyer “portföy ormanı” yalanı olur.
- Freelancer daha derin nakittir ama ikinci halkadır (kazanç). Önce öğrenme halkası dürüstçe kapanır.

Akademi’de yapılacak iş **üçüncü kurs motoru yazmak değildir.** Yapılacak iş: canlı veya sandbox’ta `rail-temel` satın al → oyna → sınav → `/academy/dogrula/[hash]`. Motor duruyor; eksik olan **bağlı ortamda duman** ve gerekirse kopya dürüstlüğüdür (VIDEO/TTS “üretir” dememek).

Kariyer `schemas.ts` eksikliği ve SWOT ormanı **üçüncü sıradır.** SWOT taşımak Kova 1/2 ihlalidir.

### Yapılmayacaklar (bu tedavide)

- 13. oda, Socket, Redis, GİB, çekim, Turnstile, OAuth şişmesi
- Studio 15 peron, DevLabs SaaS/Builder/Commerce/sandbox exec
- Hibe canlı kamu API’si, TKGM/sigorta “canlı” yalanı
- Müze `amountKurus` / triple-balance / holding
- `docs/`’a 20 oda raporu yazıp uygulamayı erteleme
- Müze `hooks/` + lucide/geist yığını
- Rail’i mikroservise bölme

### Karar özeti

| Sıra | Somut dosya / modül | Tür |
|------|---------------------|-----|
| 1 | `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` | **ilk düzeltme / yazım** |
| 2 | `docs/07_tedavi_raporu_d3_nihai_muhur.md` + Anayasa SSOT yolu | belge kalkanı |
| 3 | `.github/workflows/ci.yml` git takibi | ince CI (kod yüzeyi, motor değil) |
| 4 | `.env.local` + `ops:migrate` + bucket SQL + PayTR + Inngest | ops, az kod |
| 5 | Akademi dumanı (`lib/academy` + `oyna` + purchase route) | **ilk dikey, yeni kod değil** |

Ben **1** derim. 12 oda mutlu-yol motoru + API + sayfa taşıyor. Bugün eksik olan yeni oda değil; **testlerin okuduğu son belge mühürleri, omurganın üretimde bağlanması ve öğrenme halkasının canlı kanıtıdır.**

---

*Ürün kodu bu tespitte değiştirilmedi. Müze `yetkin.ai/` Rail git’ine girmez; kör kopya yasaktır.*
