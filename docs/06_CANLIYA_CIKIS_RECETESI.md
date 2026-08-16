# 06 — Canlıya çıkış operasyon reçetesi

| Alan | Değer |
|------|--------|
| Tür | Operatör kontrol listesi (insan SSOT) |
| Tarih | 17 Ağustos 2026 |
| Gövde | `yetkin_rail` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Depo | `docs/08_STORAGE_CONTRACT.md` |
| Nihai mühür | `docs/06_NIHAI_CANLIYA_CIKIS_RAPORU.md` |
| Seremoni | `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md` |
| Faz 4 | `docs/05_TEDAVI_RAPORU_FAZ4.md` |

Ürün kodu bu dosyayı import etmez. Credential icat edilmez; değerler bu belgeye **yazılmaz.** Boş anahtar = dürüst kapalı yüzey. Kutusu yeşil olmayan adım “şimdilik aç” ile geçilmez.

`GET /api/health` JSON `phase` **taşımaz.** Sahte CREDIT, `wallets.amount_minor` UPDATE, `PAYTR_ALLOW_MOCK_CHECKOUT=true`, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `SUPABASE_SERVICE_ROLE_KEY` **yasaktır.**

Sıra kilitlidir. 1 → 2 → 3 → 4 → 5. Hosting build (5) migrasyon ve CORS yeşil olmadan Studio görsel debit iddia etmez.

---

## 0. Önkoşul — tek süreç, yasak anahtar yok

- [ ] Hosting **tek Node süreci** (`npm start` / `next start`). İkinci replica yok. Redis yok. Hız tavanı süreç-içi bellek (`docs/07_OPS_RUNBOOK.md` §7).
- [ ] `.env` / hosting secrets içinde **yok:** `SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `REDIS_URL`, `PAYTR_ALLOW_MOCK_CHECKOUT`.
- [ ] `NODE_ENV=production`.
- [ ] `NEXT_PUBLIC_APP_URL` = canlı origin (path / trailing slash yok). HTTPS.
- [ ] Node `>=20.19.0`.

---

## 1. Supabase Direct Postgres migrasyonları

```
npm run ops:migrate
```

(`ops:init` aynı betik.) Ayrıntı: `docs/07_OPS_RUNBOOK.md` §2 ve §2.1.

- [ ] Dashboard → Database → Connection string → **Direct connection**.
- [ ] `DIRECT_URL` **ve** runtime `DATABASE_URL` = `postgresql://postgres:<şifre>@db.<ref>.supabase.co:5432/postgres`.
- [ ] Host yalnız `db.<ref>.supabase.co`. `pooler.supabase.com` **yasak** (her port).
- [ ] Port **5432**. `:6543` görürsen **dur.**
- [ ] Direct host yalnız AAAA ise: IPv4 add-on **veya** operatör makinesinde IPv6 `::/0`. Yol C (`:6543`) yasak.
- [ ] `Test-NetConnection db.<ref>.supabase.co -Port 5432` → `TcpTestSucceeded : True`.
- [ ] `npm run ops:migrate` **exit 0.** Post-apply: `studio_digital_assets_data_base64_max_chars` tavan **2097152**, `http_idempotency_records` unique `(user_id, route, key)`, D2.1–D2.3 halkası.
- [ ] `supabase/storage/studio-assets.sql` bu komutta **yoktur.** Bucket ayrı (aşağı §3 öncesi SQL Editor).

Havuz veya 6543 ile “migrate oldu” denmez. P1001 yeşil boyanmaz.

---

## 2. PayTR Mağaza Panel — aktivasyon ve sandbox/live

Kod iframe HMAC ve `merchant_oid` alfa-numerik sicili `c3cd33e` ile mühürlüdür. Get-token **001** (`Gecersiz istek veya magaza aktif degil`) mağaza paneli işidir; kod CREDIT icat etmez.

### 2.1 Panel

- [ ] PayTR Mağaza Panel’e giriş. Mağaza **aktif** (onaylı). 001 duruyorsa bu kutu boş kalır.
- [ ] Entegrasyon / API: `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` üretim secrets’a yazılır. Değer bu belgeye yazılmaz.
- [ ] Bildirim / Callback URL: `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr` (tam URL, `auth = "webhook"`).
- [ ] `merchant_ok_url` / `merchant_fail_url` uygulama kökeninde kalır (açık yön yok).
- [ ] Yükleme bandı ₺10–₺20.000. Webhook `total_amount === amountMinor` değilse clearing yok.

### 2.2 Sandbox → live toggle

| Ortam | `PAYTR_SANDBOX` | `PAYTR_ALLOW_MOCK_CHECKOUT` | iframe `test_mode` |
|-------|-----------------|------------------------------|--------------------|
| Geliştirme / mağaza testi | `1` | **boş** | `1` |
| Canlı üretim | **boş / yazılmaz** | **boş / yazılmaz** | `0` |

- [ ] Geliştirme dumanı: `PAYTR_SANDBOX=1`, mock **kapalı.** Get-token 001 ise mağaza henüz aktif değil — mock açılmaz.
- [ ] Canlıya geçiş: panelde test/sandbox kapatılır; hosting’den `PAYTR_SANDBOX` **silinir** (`1` / `true` bırakılmaz).
- [ ] `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde yok. `assertPaytrProductionSafety` `NODE_ENV=production` iken sandbox veya mock görürse **throw.**
- [ ] `GET /api/health` → `checks.paytr = configured`. JSON `phase` yok.
- [ ] İlk canlı yükleme küçük tutar; `LedgerEntry` CREDIT yalnız onaylı webhook + valör. `wallets.amount_minor` doğrudan UPDATE **yok.**

S43: nakit PayTR ile girer, 12 odada harcanır, bankaya çıkış/çekim yoktur.

---

## 3. Supabase Storage CORS — `studio-assets`

Kod CORS yazmaz. Dashboard yazar; duman `npm run ops:storage-cors`. Sözleşme: `docs/08_STORAGE_CONTRACT.md`.

### 3.1 Bucket (migrate’den sonra, CORS’tan önce)

- [ ] Dashboard → SQL Editor → `supabase/storage/studio-assets.sql` uygula.
- [ ] Bucket adı `studio-assets`, `public = false`. Path `{userId}/{generationId}.{png|jpg|webp}`.
- [ ] RLS: `auth.uid()` klasör sahibi. `service_role` JS anahtarı **yok.**

### 3.2 CORS (yalnız app origin + PUT)

Dashboard → Storage → Configuration (veya `studio-assets`) → CORS:

| Alan | Zorunlu değer |
|------|----------------|
| Allowed Origins | yalnız `NEXT_PUBLIC_APP_URL` origin (ör. `https://ornek.tld`). Path / trailing slash yok |
| Allowed Methods | **PUT** (preflight OPTIONS örtük) |
| Allowed Headers | `content-type`, `x-upsert` |

**Yasak:** `Access-Control-Allow-Origin: *`, ek origin, GET / HEAD / POST / PATCH / DELETE / TRACE / CONNECT, kamu GET, CDN.

- [ ] Joker `*` yok.
- [ ] Yetkisiz kök (`https://evil.example`) yansımaz.
- [ ] `npm run ops:storage-cors` **exit 0** — Rail origin PUT, joker yok, yetkisiz kök kapalı.
- [ ] Yeşil olmadan imzalı PUT / görsel debit **bağlanmaz.**

---

## 4. Üretim ortamı `.env` checklist

Hosting secrets (Vercel / VM / panel). Git’e `.env` yazılmaz (`verify:no-secrets`). Şablon: `.env.example`. Müze `.env` kopyalanmaz.

### 4.1 Zorunlu — boşsa fail-closed veya dürüst kapalı

| Anahtar | Canlı kural |
|---------|-------------|
| `DATABASE_URL` | Direct `db.<ref>.supabase.co:5432` session. `:6543` yasak. |
| `DIRECT_URL` | Aynı Direct URI (`ops:migrate`). |
| `NEXT_PUBLIC_APP_URL` | Canlı HTTPS origin. |
| `NEXT_PUBLIC_SUPABASE_URL` | Proje URL. Boşsa giriş dürüst kapalı. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `publishable`. `service_role` **yazılmaz.** |
| `SUPER_ADMIN_USER_ID` | İlk vatandaş UUID. Hazine sentinel (`00000000-0000-4000-8000-000000000001`) **yazılmaz.** Boşsa kimse admin değildir. |
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | Panel sicili. |
| `INNGEST_EVENT_KEY` | Inngest Cloud event. |
| `INNGEST_SIGNING_KEY` | Inngest Cloud imza. **Çift anahtar.** Biri boşsa `/api/jobs/inngest` **503.** |
| `DEVLABS_KEY_PEPPER` | HMAC kasa biberi. Üretimde **zorunlu;** boşsa kod varsayılanı yalnız geliştirme — canlıda yasak. |
| `GEMINI_API_KEY` (veya `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`) | En az bir sağlayıcı. Ham SDK dikeyde yasak; tek kapı `invokeLlm` / `generateImage`. |

### 4.2 Kenar JWT — ES256 JWKS

- [ ] Asıl yol: `{NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json` (ES256 / RS256). Kod: `supabaseJwksUrl`.
- [ ] `SUPABASE_JWT_SECRET` canlıda **boş bırakılabilir** (HS256 yedek kapalı). Doluysa yalnız HS256 yedek; çerez varlığı ipucu değildir.
- [ ] Boş sırda HS256 token düşer. Kimlik gerçeği handler `getUser`.

### 4.3 Inngest Cloud

- [ ] Uygulama id `yetkin-rail`. Serve `{NEXT_PUBLIC_APP_URL}/api/jobs/inngest`.
- [ ] Cloud’da **çift** anahtar bağlı; `INNGEST_DEV` üretimde **yok** (bypass etmez).
- [ ] `GET /api/health` → `checks.inngest = configured`.
- [ ] İşler: PayTR valör (30 dk), emanet TTL, Arena tur. Socket yok.

### 4.4 Redirect URLs

Supabase Dashboard → Authentication → URL Configuration, `lib/kernel/auth/redirects.ts` ile birebir:

- [ ] Site URL = `NEXT_PUBLIC_APP_URL`
- [ ] `{NEXT_PUBLIC_APP_URL}/auth/callback`
- [ ] `{NEXT_PUBLIC_APP_URL}/sifre-yenile`

### 4.5 İsteğe bağlı / kod varsayılanı

| Anahtar | Not |
|---------|-----|
| `PLATFORM_TREASURY_USER_ID` | Sentinel; Super Admin olarak yazılmaz. Varsayılan şablondaki UUID. |
| `AI_PLATFORM_DAILY_CAP_MINOR` | Boşsa kod varsayılanı 500000. |
| `NEXT_PUBLIC_SETTLEMENT_CURRENCY` | `TRY`. |
| `SHADOW_DATABASE_URL` | Yalnız migrate diff; canlı sırası değil. |
| `E2E_BASE_URL` | Üretim secrets’a yazılmaz. |

### 4.6 Yasak anahtarlar (sicilde durmaz)

`SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `REDIS_URL`, `PAYTR_SANDBOX` (üretim), `PAYTR_ALLOW_MOCK_CHECKOUT`, `INNGEST_DEV`, `API_CORS_ALLOWED_ORIGINS`.

---

## 5. Vercel / Cloudflare / Hosting + build

Build komutu (package.json):

```
npm run build
```

Eşdeğer: `prisma generate && npm run verify:prebuild && next build`.

Start: `npm start` (`next start`).

- [ ] Build komutu `npm run build`. Prebuild kırmızıysa artifact **yayınlanmaz.**
- [ ] `verify:prebuild` zinciri: `no-secrets` → `amount-minor` → `ai-gateway` → `rls-status` → `api-auth` → `boundaries` → `sen-axis` → `atomic-seals` → `test:surface` → `typecheck`. Hepsi **exit 0.**
- [ ] Hosting **tek uzun ömürlü Node süreci.** Vercel serverless / Fluid çok replica, Cloudflare Workers, ikinci VM **yasak** (hız tavanı paylaşılmaz; Prisma `$transaction` / `FOR UPDATE` transaction-mode pooler’da düşer).
- [ ] Cloudflare yalnız TLS / DNS / proxy olabilir; origin yine tek `next start`. Workers bu gövdeyi taşımaz.
- [ ] Vercel kullanılacaksa: tek instance, `DATABASE_URL` Direct `:5432` (pooler `:6543` yok), build = `npm run build`, start = `npm start`. Replica çoğaltılmaz.
- [ ] Üretim CSP: istek başına nonce. `unsafe-eval` yok. `next.config` statik CSP yazmaz.
- [ ] Deploy sonrası `GET /api/health` **200**, `checks.db = ok`, `supabaseAuth = configured`, `inngest = configured`, `paytr = configured`. Gövde `phase` taşımaz.
- [ ] `/api/jobs/inngest` üretimde **503 değil.**

CI (`.github/workflows/ci.yml`) aynı `verify:prebuild` zincirini `main` push / PR’da koşar. Yeşil CI, PayTR mağaza veya CORS Dashboard yeşili **değildir.**

---

## 6. Son duman (debit iddiası yoksa dur)

- [ ] `/register` → UUID → `SUPER_ADMIN_USER_ID` → süreç yeniden.
- [ ] Oturumsuz `POST /api/studio/generate` ve `POST /api/devlabs/projects` → **401.**
- [ ] Boş cüzdanda Studio/DevLabs generate → **400** yetersiz bakiye; LLM çağrılmaz; sahte CREDIT yok.
- [ ] PayTR mağaza aktif + CORS yeşil + Inngest configured olmadan “canlı nakit aktı” / “imzalı PUT bağlandı” **denmez.**

---

## Bu reçete ne değildir

- 13. oda, Redis, Socket, GİB, çekim, Turnstile, DevLabs exec/sandbox runner açılmaz.
- Health veya dashboard’a `phase` yazılmaz.
- `ops:migrate` yeşili “Studio bağlı” demek değildir — bucket + CORS ayrıdır.
- Prebuild yeşili mağaza paneli aktivasyonu değildir.
