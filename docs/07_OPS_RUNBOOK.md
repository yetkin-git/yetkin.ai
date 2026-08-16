# 07 — Ops Runbook

İnsan ops SSOT. Anayasa: `docs/ANAYASA.md`. Ürün kodu bu dosyayı import etmez; ajan ve operatör buradan bağlar. Credential icat edilmez. Boş anahtar = dürüst kapalı yüzey.

Müze (`yetkin.ai`) `.env` kopyalanmaz. Redis, GİB, Socket, Turnstile, ads, OAuth şişmesi, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `SUPABASE_SERVICE_ROLE_KEY` Rail kodunda yoktur.

---

## 1. Env

`cp .env.example .env.local` — Dashboard değerleriyle doldur. Git’e `.env` / `.env.local` yazılmaz (`verify:no-secrets`).

| Anahtar | Zorunluluk | Not |
|---------|------------|-----|
| `DATABASE_URL` | runtime | Postgres **session-mode** (port 5432 veya session pooler). Transaction-mode `:6543` yasak. |
| `DIRECT_URL` | `ops:migrate` | `db.<ref>.supabase.co:5432`. Host `pooler.supabase.com` yasak. |
| `NEXT_PUBLIC_APP_URL` | auth yön | Redirect URLs kökeni. |
| `NEXT_PUBLIC_SUPABASE_URL` | auth | Boşsa giriş/kayıt dürüst kapalı. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | auth | `anon` / `publishable`. `service_role` yazılmaz. |
| `SUPABASE_JWT_SECRET` | kenar HS256 yedek | Boşsa ES256 JWKS ile doğrulanır; HS256 token fail-closed düşer. |
| `SUPER_ADMIN_USER_ID` | admin | Auth kullanıcı UUID. Boşsa kimse admin değildir. |
| `PLATFORM_TREASURY_USER_ID` | hazine sentinel | SQL ile aynı; Super Admin olarak **yazılmaz**. Varsayılan `00000000-0000-4000-8000-000000000001`. |
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | yükleme | Üretimde `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` yasak. |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | işler | Üretimde imza veya event anahtarı boşsa serve fail-closed. |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | LLM | En az bir sağlayıcı. Ham SDK dikeyde yasak. |
| `DEVLABS_KEY_PEPPER` | kasa | Üretimde zorunlu; boşsa kod varsayılanı yalnız geliştirme. |
| `E2E_BASE_URL` | Playwright | Doluysa mevcut sunucuya vurur (`next dev` ikinci kez açılmaz). Boşsa spec kendi `127.0.0.1:3000` sürecini yönetir. |
| `AI_PLATFORM_DAILY_CAP_MINOR` | bütçe | Boşsa kod varsayılanı. |
| `SHADOW_DATABASE_URL` | isteğe bağlı | Prisma migrate diff. |

---

## 2. `ops:migrate` host kuralları

```
npm run ops:migrate
```

(`ops:init` aynı betik.)

1. `DIRECT_URL` (yoksa `DATABASE_URL`) okunur. Tanımsızsa fail: `docs/07_OPS_RUNBOOK.md`.
2. Host **`db.<ref>.supabase.co:5432`**. `pooler.supabase.com` ve port **6543** migrasyonda YASAK (`FOR UPDATE` / `$transaction` kilidi düşer). Biçim ve TCP ön kontrolü §2.1.
3. `prisma migrate deploy` — şema + Studio `data_base64` CHECK + `http_idempotency_records` + D2 halkası (`20260816020000_academy_lesson_completions`, `20260816030000_d2_2_curriculum_seal_certificate_hash`, `20260816040000_d2_3_corporate_job_offers`). Disk klasörleri yoksa fail-closed.
4. Yedi SQL, kilitli sıra (yeni tablo icat edilmez; idempotent upsert):

   1. `20260814010000_handle_new_user_auth_sync.sql` — `handle_new_user` AFTER INSERT
   2. `20260814020000_enforce_rls_all_tables.sql` — FORCE RLS
   3. `20260814030000_rls_user_scoped_policies.sql` — sahip yalnız SELECT
   4. `20260814040000_price_catalog_definitions.sql` — katalog tohumu (`updated_by` doluysa tutar ezilmez)
   5. `20260814090000_academy_course_seed.sql` — `rail-temel` ve raylı sinyal
   6. `20260814100000_handle_user_email_update.sql` — `handle_user_email_update` AFTER UPDATE
   7. `20260814110000_freelancer_job_seed.sql`

5. Post-apply mühür yoksa fail-closed: `studio_digital_assets_data_base64_max_chars` (tavan **2097152** = `STUDIO_IMAGE_DATA_BASE64_MAX_CHARS`), `http_idempotency_records` unique `(user_id, route, key)`, D2.1 `academy_lesson_completions`, D2.2 `curriculum_seal` + `certificate_hash`, D2.3 `corporate_job_offers`.

Uygulama `DATABASE_URL` **session-mode** ister. Runtime da 6543 yasaktır.

### 2.1 Direct Port (`:5432`) — operatör sıfır-hata protokolü

Kod metni (`DIRECT_PORT_OPERATOR_PROTOCOL`): Direct Port protokolü fail-closed: `db.<ref>.supabase.co:5432`. Havuz `pooler.supabase.com` ve port 6543 ile geçilmez (P1001 yeşil boyanmaz). Direct host çoğu projede yalnız AAAA (IPv6) yayınlar. Operatör makinesinde IPv6 varsayılan rota yoksa `getaddrinfo ENOENT` / `P1001` durur. Yol A: Supabase IPv4 add-on (Direct host A kaydı). Yol B: makinede IPv6 bağını ve `::/0` rotasını aç; `Test-NetConnection db.<ref>.supabase.co -Port 5432`. Yol C yasak: `DATABASE_URL` veya `DIRECT_URL` = `*.pooler.supabase.com:6543`.

**Hedef URI (Direct, session):** `postgresql://postgres:<şifre>@db.<ref>.supabase.co:5432/postgres`

Bu URI hem `DIRECT_URL` (migrasyon) hem runtime `DATABASE_URL` içindir. `aws-*.pooler.supabase.com` **her portta** yasaktır.

#### Adım 0 — URI biçimi

1. Dashboard → Project Settings → Database → Connection string → **URI** → **Direct connection**.
2. Host yalnız `db.<project-ref>.supabase.co`. `pooler.supabase.com` görünürse yanlış kopya — dur.
3. Port **5432**. `:6543` görürsen dur. Transaction-mode pooler `FOR UPDATE` düşürür.
4. `.env.local` içine `DIRECT_URL` ve `DATABASE_URL` olarak **aynı Direct URI** yaz.

`npm run ops:migrate` biçimi `parseDirectConnectionUrl` ile mühürler. Pooler veya 6543 → fail-closed.

#### Adım 1 — DNS (A / AAAA)

PowerShell:

```
Resolve-DnsName db.<ref>.supabase.co
```

| Sonuç | Anlam | Sonraki |
|-------|--------|---------|
| Yalnız AAAA (IPv6) | Direct varsayılanı | Adım 2 |
| A (IPv4) + AAAA | IPv4 add-on açık | Adım 3 |
| Kayıt yok | Yanlış ref | URI'yi Dashboard'dan yeniden kopyala |

Pooler hostunun IPv4 A kaydı olsa bile **kullanılmaz**.

#### Adım 2 — IPv6 rota yoksa Direct bağlanmaz

Windows'ta IPv6 kapalı veya `::/0` yoksa AAAA-only host `P1001` / `getaddrinfo ENOENT` üretir. Bu fail-closed'dır.

**Yol A (önerilen):** Supabase Dashboard → Database → **IPv4 add-on** — Direct host'a A kaydı eklenir. Kod değişmez.

**Yol B:** Makinede IPv6:

1. `Get-NetAdapterBinding -ComponentID ms_tcpip6` → Enabled True.
2. `Get-NetRoute -AddressFamily IPv6` içinde `::/0` varsayılan rota.
3. VPN IPv6'yı düşürüyorsa split-tunnel veya IPv6'yı VPN dışında tut.

**Yol C yasak:** `DATABASE_URL` / `DIRECT_URL` = `*.pooler.supabase.com:6543`. Betik reddeder.

#### Adım 3 — TCP 5432

```
Test-NetConnection db.<ref>.supabase.co -Port 5432
```

`TcpTestSucceeded : True` değilse güvenlik duvarı / VPN / hâlâ IPv6 yok. Port **6543** deneme.

Betik `prisma migrate deploy` öncesi aynı TCP ön kontrolünü çalıştırır. Timeout / ENOENT → bu protokolü tekrarla.

#### Adım 4 — migrate

```
npm run ops:migrate
```

Post-apply: CHECK 2097152 + `http_idempotency_records` unique. Yeşil olmadan “şema bağlı” denmez.

---

## 3. Super Admin UUID

1. `/register` ile ilk vatandaş hesabını aç.
2. Supabase Dashboard → Authentication → Users → UUID kopyala.
3. `.env.local` içine `SUPER_ADMIN_USER_ID=<uuid>` yaz. **Hazine sentinel’i yazma:** `00000000-0000-4000-8000-000000000001`.
4. `npm run dev` yeniden. Boş env = kimse admin değildir (`isSuperAdminUser` UUID eşitliği).
5. Katalog PATCH (`/api/admin/catalog`) kenarda `auth = "admin"` ister: doğrulanmış JWT **ve** bu UUID. Boş env = kimse admin değildir (`isSuperAdminUser` / `requireSuperAdmin` tek merkez). Handler aynı UUID’yi ikinci kez doğrular. Kod sabiti satış fiyatı yok; Super Admin satırı `ops:migrate` ile ezilmez (`updated_by` korunur).

---

## 4. PayTR webhook

- URL: `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr`
- Route `auth = "webhook"` — kenar JWT istemez; imza `merchant_oid` + `status` + `total_amount` HMAC.
- Yükleme bandı ₺10–₺20.000. Defter tutarı `amountMinor` (TRY minor). Webhook `total_amount === amountMinor` değilse clearing yok.
- Valör tarayıcı PSP doğrulaması olmadan **PENDING** siparişe CREDIT yazmaz; adayları kör **credit etmez**. Başarısız / timeout emir `markFailed` ile kapanır.
- Üretim: `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` **yasak** (`assertPaytrProductionSafety`).
- Merchant panel Callback: tam webhook URL. `merchant_ok_url` / `merchant_fail_url` uygulama kökeninde kalır.

---

## 5. Inngest imzası

- Uygulama id: `yetkin-rail`. Serve yolu: `/api/jobs/inngest` (`auth = "webhook"`).
- Cloud: `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (çift anahtar).
- Üretimde **ikisinden biri** boşsa `serve()` açılmaz. `/api/jobs/inngest` GET/POST/PUT **503** (`Inngest Cloud anahtarları tanımlı değil.`). Sahte event gövdesi handler'a inmez; imza doğrulaması çalışmaz çünkü serve bağlanmaz.
- `INNGEST_DEV` üretimde bypass etmez. Geliştirmede boş anahtar yerel Inngest Dev'e aittir; üretim kilidini açmaz.
- İşler: PayTR valör (30 dk, `take: 50`), emanet TTL (14 gün PENDING iade), Arena tur tiki. Socket yok.

---

## 6. Redirect URLs

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, `lib/kernel/auth/redirects.ts` sicili ile birebir:

- `{NEXT_PUBLIC_APP_URL}/auth/callback`
- `{NEXT_PUBLIC_APP_URL}/sifre-yenile`

PKCE `?code=` `/auth/callback` üzerinde `exchangeCodeForSession`. Kayıt `emailRedirectTo` ve şifre sıfırlama `redirectTo` bu iki URL’den üretilir. Açık yön (open redirect) yok; `next` yalnız allowlist path.

Site URL: `NEXT_PUBLIC_APP_URL`.

---

## 7. Tek süreç hız tavanı

HTTP hız tavanı (`lib/kernel/security/http-rate-limit.ts`) **süreç-içi bellek** `Map`’tir: cüzdan yükleme IP/kullanıcı + auth IP. Çok instance / serverless paylaşılmaz.

**Dürüst tavan:** tek Node süreci (tek VM / tek `next start`). İkinci replica aynı IP kotasını görmez — sessiz delik. Paylaşılan store (Redis vb.) bu gövdede yoktur ve T0’da eklenmez. Yatay ölçek öncesi bu cümleyi yalanlama veya store’u taşı.

LLM bütçe kalkanı ayrıdır (kullanıcı/günlük token); o da süreç/DB karışımıdır, küme kotası değildir.

---

## 8. Sağlık ve gözlem

`GET /api/health` DB ping. Down veya `DATABASE_URL` yok = **503**. JSON `phase` **taşımaz**. Nakit ve kritik mutasyon `requestId` + yapılandırılmış log (`txn.notice.*`). Resend yok.

---

## 9. Studio tavanı ve katalog

- Görsel `data_base64` CHECK adı `studio_digital_assets_data_base64_max_chars`; tavan `STUDIO_IMAGE_DATA_BASE64_MAX_CHARS` = **2097152**. Aşım 413; debit yok. Decoded tavan `STUDIO_IMAGE_DECODED_MAX_BYTES` = 1572864.
- Nesne depo: imzalı PUT (`STUDIO_STORAGE_BACKEND = "object-store"`), bucket `studio-assets`, path `{userId}/{generationId}.{png|jpg|webp}`. Prisma hash/mime/size/path; `data_base64` yeni üretimde boş string. `service_role` yok.
- Bucket + `storage.objects` RLS: `supabase/storage/studio-assets.sql` — **Dashboard SQL Editor**. `ops:migrate` kilitli yedi dosyaya eklenmez. Prisma metadata migrasyonu `prisma migrate deploy` ile gelir.
- Storage CORS (Dashboard, kodla yazılmaz): origin = `NEXT_PUBLIC_APP_URL` origin (path yok). Metod **yalnız PUT**. `Access-Control-Allow-Origin: *` ve GET/DELETE/POST/PATCH **yasak**. Doğrulama: `npm run ops:storage-cors` (`assertStudioStorageCorsHeaders`). Kamu GET / CDN yok; tezgâh imzalı GET.
- Katalog birimleri `REQUIRED_CATALOG_DEFINITIONS` + SQL tohum. `studio:generation:image` ops tohumundadır; yoksa görsel üretim vatandaş dilinde 4xx, debit yok.

---

## 10. HTTP idempotency

Kritik yazmalar `Idempotency-Key` (UUID) ister: `POST /api/wallet/top-up`, akademi satın alma, freelancer kabul. Aynı anahtar ikinci finansal emir doğurmaz. Tablo `http_idempotency_records`. Cüzdan `merchantOid` anahtardan türetilir (`Date.now` çift PENDING üretmez).

---

## 11. Sırlar ve prebuild

`verify:no-secrets` prebuild zincirindedir. PEM, `sk_live_`, `service_role` JWT, dolu yasaklı `.env.example` anahtarları fail-closed. `SUPABASE_SERVICE_ROLE_KEY` Rail JS/env’de yoktur.

---

## 12. Odalar (mutlu yol dumanı)

Omurga bağlandıktan sonra vatandaş yolları: `/academy` (`rail-temel`), `/freelancer`, `/yetkinilan`, `/studio`. Kenar yazma kabukları oturum ister. S43 banka çekimi kapalıdır.

---

## 13. İlk bağlama sırası

1. `.env.example` → `.env.local`
2. `DATABASE_URL` + `DIRECT_URL` (`db.<ref>.supabase.co:5432`) — §2.1 Direct Port protokolü
3. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Direct TCP `:5432` yeşil (IPv6 rota veya IPv4 add-on; havuz yok)
5. `npm run ops:migrate`
6. Dashboard SQL Editor: `supabase/storage/studio-assets.sql`
7. Storage CORS: Allowed Origins = `NEXT_PUBLIC_APP_URL` origin; Allowed Methods = PUT; `*` yok. `npm run ops:storage-cors`
8. `/register` → UUID → `SUPER_ADMIN_USER_ID` → süreç yeniden
9. PayTR webhook + Inngest **çift** anahtar (`INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`) + Redirect URLs
10. `GET /api/health` 200 ve `checks.inngest = configured`. `/api/jobs/inngest` üretimde 503 değil.

---

## 14. Canlıya çıkış mührü

Beş dikey oda (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs) ve kenar JWKS/CSP kodda mühürlüdür. Bu dosya insan ops SSOT’tur. Seremoni: `docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`. D3 operatör mührü: `docs/07_tedavi_raporu_d3_nihai_muhur.md` (16 Ağustos 2026). `GET /api/health` JSON `phase` taşımaz; sahte `phase` yazılmaz.

Kurumsal altıncı vitrin diye açılmaz. On üçüncü oda yasaktır. S43 çekim kapalıdır. Üretimde `PAYTR_SANDBOX` / mock checkout / boş `INNGEST_SIGNING_KEY` / boş `INNGEST_EVENT_KEY` fail-closed.

Tek süreç hız tavanı (§7) ölçeklenmeden ikinci instance açma.
