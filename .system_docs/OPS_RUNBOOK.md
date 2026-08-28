# 07 — Ops Runbook

İnsan ops SSOT. Anayasa: `.system_docs/ANAYASA.md`. Ürün kodu bu dosyayı import etmez; ajan ve operatör buradan bağlar. Credential icat edilmez. Boş anahtar = dürüst kapalı yüzey.

**Canlı reçete (A7):** Çalışan 4 oda (Akademi, Kariyer, Freelancer, Dashboard) + 4 sığınak (`/profil`, `/cuzdan`, `/pasaport`, `/admin`). “Çalışan 4 oda” **nakit iddiası taşımaz** — Freelancer: ilan/teklif/mesajlaşma çalışır; lisanslı split henüz bağlı değilse accept **503**. 410 envanteri `archived/` ve kenar 410’dadır; canlı `lib/` / `components/` tavanında donmuş oda yoktur. Vatandaş/Studio nesne deposu yoktur; akademi ders sesi `lesson-audios` istisnası `.system_docs/STORAGE_CONTRACT.md`. Hayalet altyapı adımları **ARŞİV / 410 (GEÇERSİZ)** bölümündedir — canlı bağlama değildir.

Müze dizini (`yetkin_muze/`) OPS yasağıdır (tarihsel etiket S9-B Anayasa maddesi değildir): `.env` kopyalanmaz; git, indeks, webpack ve import dışıdır. Kör kopya yasaktır. Kamu markası `yetkin.ai`. GİB, Turnstile, ads, OAuth şişmesi, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, `SUPABASE_SERVICE_ROLE_KEY` Rail kodunda yoktur. Socket.IO ürün yüzeyi yoktur. Redis varsayılan yoktur; paylaşılan rate-limit/sayaç için §7 ve §16.

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
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | yükleme | Üçlü birlikte dolu olmalı. Üretimde `PAYTR_SANDBOX` ve `PAYTR_ALLOW_MOCK_CHECKOUT` yasak (throw). |
| `PAYTR_WEBHOOK_IP_ALLOWLIST` | isteğe bağlı | Virgüllü PayTR Destek bildirim IP’leri. Boş = yalnız HMAC (lab). Doluysa yabancı IP 403, CREDIT yok. |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | işler | Üretimde imza veya event anahtarı boşsa serve fail-closed. |
| `NOTICE_SMTP_HOST` / `NOTICE_MAIL_FROM` | bildirim | Beş vatandaş e-postası. İkisi de boşsa dürüst atlanır; nakit durmaz. Resend yok. |
| `NOTICE_SMTP_PORT` / `_USER` / `_PASS` | bildirim | Port boşsa 587 + STARTTLS; 465 örtük TLS. |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | LLM | En az bir sağlayıcı. Ham SDK dikeyde yasak. |
| `RAIL_DRON_ORIGINS` | dron CORS | Yalnız `/api/v1`. Virgüllü origin allowlist. **Üretim / Closed Testing / TestFlight: boş bırak** — CORS başlığı yok (saf native Bearer). Joker `*` yasak. İstemci: `.system_docs/DRON_CLIENT_SPEC.md`. Native env: `apps/rail-is/.env.example`. Kapalı test: §15. |
| `E2E_BASE_URL` | Playwright | Doluysa mevcut sunucuya vurur (`next dev` ikinci kez açılmaz). Boşsa spec kendi `127.0.0.1:3000` sürecini yönetir. |
| `AI_PLATFORM_DAILY_CAP_MINOR` | bütçe | Boşsa kod varsayılanı. |
| `SHADOW_DATABASE_URL` | isteğe bağlı | Prisma migrate diff. |

---

## 2. `ops:migrate` host kuralları

```
npm run ops:migrate
```

(`ops:init` aynı betik.)

1. `DIRECT_URL` (yoksa `DATABASE_URL`) okunur. Tanımsızsa fail: `.system_docs/OPS_RUNBOOK.md`.
2. Host **`db.<ref>.supabase.co:5432`**. `pooler.supabase.com` ve port **6543** migrasyonda YASAK (`FOR UPDATE` / `$transaction` kilidi düşer). Biçim ve TCP ön kontrolü §2.1.
3. `prisma migrate deploy` — şema + `http_idempotency_records` + D2 halkası (`20260816020000_academy_lesson_completions`, `20260816030000_d2_2_curriculum_seal_certificate_hash`, `20260816040000_d2_3_corporate_job_offers`) + P3 donmuş oda DROP (`20260822010000_drop_frozen_room_tables`). Disk klasörleri yoksa fail-closed.
4. Yedi SQL, kilitli sıra (yeni tablo icat edilmez; idempotent upsert):

   1. `20260814010000_handle_new_user_auth_sync.sql` — `handle_new_user` AFTER INSERT
   2. `20260814020000_enforce_rls_all_tables.sql` — FORCE RLS
   3. `20260814030000_rls_user_scoped_policies.sql` — sahip yalnız SELECT
   4. `20260814040000_price_catalog_definitions.sql` — katalog tohumu (`updated_by` doluysa tutar ezilmez)
   5. `20260814090000_academy_course_seed.sql` — `rail-temel`, raylı sinyal ve `yz-icerik-gorsel-uretim`
   6. `20260814100000_handle_user_email_update.sql` — `handle_user_email_update` AFTER UPDATE
   7. `20260814110000_freelancer_job_seed.sql`

5. Post-apply mühür yoksa fail-closed: donmuş 23 tablo DROP (Studio `data_base64` CHECK **artık beklenmez** — tablo düşmüştür), `http_idempotency_records` unique `(user_id, route, key)`, D2.1 `academy_lesson_completions`, D2.2 `curriculum_seal` + `certificate_hash`, D2.3 `corporate_job_offers`. Bucket SQL / Studio CORS bu zincirin parçası değildir.

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

Post-apply: donmuş tablolar DROP + `http_idempotency_records` unique. Yeşil olmadan “şema bağlı” denmez.

Node `pg` 8.22 `sslmode=require` değerini `verify-full` sayar. Supabase Direct host özel **Root 2021 CA** kullanır; Prisma CLI (libpq) aynı URI ile bağlanır, Node `pg` `self-signed certificate in certificate chain` ile düşer. `ops:migrate` SQL istemcisi ve runtime `Pool` `uselibpqcompat=true` ekler — şifreleme açık kalır, özel CA Mozilla demetine düşmez. URI’yi havuza çevirmek veya `NODE_TLS_REJECT_UNAUTHORIZED=0` yazmak yasaktır.

---

## 3. Super Admin UUID

1. `/register` ile ilk vatandaş hesabını aç.
2. Supabase Dashboard → Authentication → Users → UUID kopyala.
3. `.env.local` içine `SUPER_ADMIN_USER_ID=<uuid>` yaz. **Hazine sentinel’i yazma:** `00000000-0000-4000-8000-000000000001`.
4. `npm run dev` yeniden. Boş env = kimse admin değildir (`isSuperAdminUser` UUID eşitliği).
5. Katalog PATCH (`/api/admin/catalog`) kenarda `auth = "admin"` ister: doğrulanmış JWT **ve** bu UUID. Boş env = kimse admin değildir (`isSuperAdminUser` / `requireSuperAdmin` tek merkez). Handler aynı UUID’yi ikinci kez doğrular. Kod sabiti satış fiyatı yok; Super Admin satırı `ops:migrate` ile ezilmez (`updated_by` korunur).

---

## 4. PayTR — iki port (Merchant ≠ Pazaryeri Split)

PayTR tek düğme değildir. Anayasa S43 iki kapıyı ayırır. Birinin açılması diğerini yeşile boyamaz.

| Port | Vatandaş adı | Ne döner? | Kod | İdari kapı |
|------|----------------|-----------|-----|------------|
| **Merchant Port** | Akademi / üye işyeri (iFrame API) | Cüzdan CREDIT → kurs DEBIT → sınav → mühür | `paymentsPort.merchant`, `/api/wallet/top-up`, webhook | Mağaza paneli + `PAYTR_MERCHANT_ID/KEY/SALT` üçlüsü |
| **Pazaryeri Split Port** | Freelancer emaneti | `beginHold` / `settle`; usta IBAN’ına kuruluş dağıtır | `paymentsPort.split` (`marketplace-split.ts`) | Alt satıcı onboard + lisanslı Pazaryeri sözleşmesi. Gün 0 **kasıtlı stub** (`not_configured` → kabul 503) |

- Health `checks.payments=configured` yalnız **Merchant** üçlüsünün dolu olduğunu söyler. Split hazır değildir.
- Merchant açık, split kapalı: akademi halkası dönebilir; freelancer kabul 503 kalır. Bu doğrudur.
- Wallet-escrow, split gelene kadar “geçici iç banka” olarak **yeniden büyütülmez.**
- Sahte CREDIT, admin bakiye, `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde yasaktır.

P1 saha hazırlığı **Merchant** üçlüsü + Bildirim URL’dir (§4.1–4.3). Split ayrı kapıdır (P2); bu bölüm onu açmaz.

Merchant kanonik bildirim yolu: **`{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr`**. `/api/paytr/callback` diye ikinci ağız yoktur; panel bu kanonik HTTPS URL’yi ister.

### 4.1 `.env` canlı üçlü — Merchant Port

Laboratuvar şablonu (`.env.example`) `PAYTR_SANDBOX="1"` taşır; **üretim reçetesi değildir.** Canlı mağaza paneli → Destek / Entegrasyon bilgileri:

1. `.env` / secret store içine **canlı** (test değil) değerleri yaz:
   - `PAYTR_MERCHANT_ID=<mağaza no>`
   - `PAYTR_MERCHANT_KEY=<canlı key>`
   - `PAYTR_MERCHANT_SALT=<canlı salt>`
2. Üretimde `PAYTR_SANDBOX` **boş** (sil veya `""`). `"1"` / `"true"` runtime’da **throw** eder; sandbox sessizce yok sayılmaz.
3. `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde boş. `"true"` throw eder. CREDIT yazmaz.
4. `NEXT_PUBLIC_APP_URL` üretimde `https://` genel köken (localhost yasak). `merchant_ok_url` / `merchant_fail_url` bu kökene bağlıdır; CREDIT yazmaz.
5. İsteğe bağlı: `PAYTR_WEBHOOK_IP_ALLOWLIST` — PayTR Destek’ten alınan bildirim IP’leri, virgülle. Boş bırakılırsa yalnız HMAC durur (lab kırılmaz). Doluysa listede olmayan kaynak HTTP 403, defter yazılmaz.
6. Süreç yeniden (`next start` / platform secret sync). Anahtar varlığı ≠ mağaza canlılığı: `GET /api/health` `checks.payments=configured` yalnız üçlünün dolu olduğunu söyler.

Canlı ve test anahtar çiftini karıştırma. Preview ortamına canlı üçlü koyma; Preview’da üçlü boş kalır (dürüst `missing_credentials`).

### 4.2 PayTR Mağaza Paneli — Bildirim URL

PayTR üye işyeri paneli (iFrame API):

1. Mağaza **aktif** ve **iFrame yetkisi** açık olmalı. “Gecersiz istek veya magaza aktif degil” get-token’ı kırar; CREDIT doğmaz.
2. **Bildirim URL / Callback URL** alanına birebir yaz: `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr` örneğin `https://ornek.tld/api/payments/webhooks/paytr`.
3. Sitede SSL varsa protokol **HTTPS** olmak zorundadır. Entegrasyon sonrası SSL açıldıysa paneli HTTP’de bırakma — callback sessiz kesilir.
4. Bu URL’ye üyelik / Basic Auth / WAF “bot fight” / JWT **konmaz**. Route `auth = "webhook"`: kenar JWT istemez. Challenge, PayTR’nin POST’unu yutar; bakiye boş kalır.
5. `merchant_ok_url` / `merchant_fail_url` uygulama `/cuzdan` dönüşüdür. PayTR resmi: müşteri dönüşü CREDIT yazmaz. Bakiye yalnız Bildirim URL HMAC + clearing ile doğar.

### 4.3 Runtime kalkan

- HMAC: `merchant_oid + merchant_salt + status + total_amount`, timing-safe. Geçersiz imza **HTTP 403**, `invalid_signature`. CREDIT yok.
- Üçlü env eksik: **HTTP 400**, `missing_credentials`. CREDIT yok.
- Üretimde sandbox/mock: throw + log (`paytr.production_safety`) + webhook **403** `production_safety`.
- Aynı `merchant_oid` tekrarında tekil CREDIT: `payment_orders FOR UPDATE` + `LedgerEntry.idempotency_key` unique (`wallet-top-up:{oid}`) + `CLEARED` kısa devre.
- `total_amount === amountMinor` değilse clearing yok. Cüzdan yükleme `no_installment=1` (tek çekim).
- Valör tarayıcı PSP doğrulaması olmadan **PENDING** siparişe CREDIT yazmaz; adayları kör **credit etmez**. Başarısız / timeout emir `markFailed` ile kapanır.
- Clearing throw → Inngest `payments/paytr.clearing-requested`. `inngest.send` düşerse `"OK"` dönülmez (HTTP 500); PayTR tekrarlar.
- Üretim `user_ip` loopback / RFC1918 ise get-token fail-closed. Kenar `x-forwarded-for` gerçek müşteri IPv4 basmalı.

İlk canlı tanık (ekran görüntüsü değil): `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT `wallet-top-up:{oid}` + cüzdan `amount_minor`. Band ₺10–₺20.000. Elle SQL CREDIT yasak.

---

## 5. Inngest imzası

- Uygulama id: `yetkin-rail`. Serve yolu: `/api/jobs/inngest` (`auth = "webhook"`).
- Cloud: `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (çift anahtar).
- Üretimde **ikisinden biri** boşsa `serve()` açılmaz. `/api/jobs/inngest` GET/POST/PUT **503** (`Inngest Cloud anahtarları tanımlı değil.`). Sahte event gövdesi handler'a inmez; imza doğrulaması çalışmaz çünkü serve bağlanmaz.
- `INNGEST_DEV` üretimde bypass etmez. Geliştirmede boş Cloud anahtarı yerel Inngest Dev'e aittir; üretim kilidini açmaz.
- Geliştirme dumanı: Cloud yoksa `.env.local` içinde `INNGEST_DEV=1` (şablona atama yok). Aksi halde `serve()` çağrılmaz — SDK 500 yerine 503. `GET /api/health` `checks.inngest` yalnız Cloud sicilidir (boş anahtar = `unconfigured`).
- İşler: PayTR valör (30 dk, `take: 50`), emanet TTL (14 gün PENDING iade), emanet TTL yaklaşım (48 saat kala, hold başına bir kez). **`paytr-clearing-scan`:** `isPaymentsPortConfigured()` false ise **no-op** — DB tarama yok (0 hit), dürüst `paytr.clearing.scan.noop` log, sahte PENDING avı yok. Donmuş oda (Arena tur) yeni iş açılmaz. Socket yok.

### 5.1 Üretim 503 çıkış (Inngest + PayTR webhook)

Fail-closed **doğru** cevaptır; üretimde unutulması yanlıştır. HTTP 200 health, Inngest'in hazır olduğu anlamına **gelmez** — DB ping statüsü belirler; `checks.inngest` ayrı sicildir.

Operatör, secret sync sonrası (sır icat etme):

```
npm run ops:runtime-readiness
```

`NODE_ENV=production` iken Inngest çifti, PayTR üçlüsü veya `DATABASE_URL` boşsa çıkış **1**. Geliştirmede tablo basılır, çıkış 0. Betik anahtar **değeri basmaz**. Prebuild zincirinde yoktur.

**Inngest 503 çıkış sırası:**

1. Inngest Cloud → App `yetkin-rail` → Event Key + Signing Key kopyala.
2. Üretim secret store: `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (ikisi de dolu). `INNGEST_DEV` yazılmaz.
3. Süreç yeniden (`next start` / platform secret sync).
4. `GET /api/health` → `checks.inngest = "configured"`. Yalnız `ok: true` yetmez.
5. `GET /api/jobs/inngest` üretimde **503 değil** (Inngest put/handshake 200 ailesi). Hâlâ 503 ise anahtar trim/boş veya yanlış app.
6. Cloud dashboard'da serve URL: `{NEXT_PUBLIC_APP_URL}/api/jobs/inngest`. Cron (valör 30 dk, emanet TTL) senkron.
7. Başlangıç logu `ops.inngest.fail_closed` görünüyorsa hâlâ boş sır — adım 2.

**PayTR webhook körlüğü (CREDIT yok; 503 değil, 400 `missing_credentials`):**

1. Canlı üçlü §4.1. `PAYTR_SANDBOX` / mock üretimde yok.
2. Panel Bildirim URL: `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr`.
3. `GET /api/health` → `checks.payments = "configured"`. Mağaza canlılığı bu alan **değildir**; get-token `başarılı` ayrı idari kapıdır.
4. Başlangıç logu `ops.paytr.unconfigured` varsa üçlü boş.

SMTP boş üretim bloğu **değildir**; beş bildirim atlanır (`citizen.notice.mail.skipped` / `smtp_unconfigured`), nakit durmaz. Partial SMTP (yalnız host veya yalnız from) de atlanır — TCP denemesi yok.

Webhook clearing hata verip Inngest'e defer ederken `INNGEST_EVENT_KEY` boşsa SDK'ya inilmez: **503** `deferred_unacked` / `inngest_unconfigured` (PayTR yeniden dener). Sahte ACK yok.

### 5.2 Hayalet emanet envanteri

```
npm run ops:ghost-wallet-holds
npm run ops:ghost-wallet-holds -- --strict
```

`wallet_id IS NOT NULL` PENDING + ledger `escrow-hold:{ref}` DEBIT sayımı. **CREDIT / REFUNDED / RELEASED yazılmaz** — motor fail-closed (`EscrowWalletFundedHoldError`). Temizlik = Super Admin incelemesi, otomatik bakiye düzeltme değil.

### 5.3 P3 donmuş oda DROP

Disk: `prisma/migrations/20260822010000_drop_frozen_room_tables/migration.sql` — 23 `DROP TABLE IF EXISTS … CASCADE`. Hosted apply disk planı bu SQL'i mühürler. Migrate **yalnız** Super Admin `ops:migrate` / hosted apply kararıyla; bu runbook paneli açmaz.

`_prisma_migrations` satırı boş gövdeyle applied ise Prisma dosya değişikliğini yeniden koşmaz — yeni DROP migrasyonu gerekir.

---

## 6. Redirect URLs

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs, `lib/kernel/auth/redirects.ts` sicili ile birebir:

- `{NEXT_PUBLIC_APP_URL}/auth/callback`
- `{NEXT_PUBLIC_APP_URL}/sifre-yenile`

PKCE `?code=` `/auth/callback` üzerinde `exchangeCodeForSession`. Kayıt `emailRedirectTo` ve şifre sıfırlama `redirectTo` bu iki URL’den üretilir. Açık yön (open redirect) yok; `next` yalnız allowlist path.

Site URL: `NEXT_PUBLIC_APP_URL`.

---

## 7. Tek süreç hız tavanı (ve paylaşılan store kapısı)

HTTP hız tavanı (`lib/kernel/security/http-rate-limit.ts`) **varsayılan** süreç-içi bellek `Map`’tir: cüzdan yükleme IP/kullanıcı + auth IP. Çok instance / serverless paylaşılmaz.

**Dürüst tavan (gün 0):** tek Node süreci (tek VM / tek `next start`). İkinci replica aynı IP kotasını görmez — sessiz delik.

**Altyapı kapısı (Faz 2):** Paylaşılan store (Redis vb.) Anayasa mutlak yasağı değildir. Yatay ölçekte rate-limit / sayaç için OPS kararıyla eklenebilir. Ürün yüzeyi olarak Socket.IO veya “Redis çünkü ölçek” sloganı açılmaz — ihtiyaç, ölçüm ve fail-closed sözleşmesi yazılır.

LLM bütçe kalkanı ayrıdır (kullanıcı/günlük token); o da süreç/DB karışımıdır, küme kotası değildir.

---

## 8. Sağlık ve gözlem

`GET /api/health` DB ping. Down veya `DATABASE_URL` yok = **503**. JSON `phase` **taşımaz**. Nakit ve kritik mutasyon `requestId` + yapılandırılmış log (`txn.notice.*`, `citizen.notice.*`). Vatandaş e-posta asgarisi beş olaydır (teklif geldi, kabul, teslim, emanet çözüldü, TTL yaklaşıyor). Resend yok; `NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` boşsa SMTP atlanır.

---

## 9. Katalog (canlı)

Katalog birimleri `REQUIRED_CATALOG_DEFINITIONS` + SQL tohum. Kod sabiti satış fiyatı yok; Super Admin satırı `ops:migrate` ile ezilmez (`updated_by` korunur).

**Vatandaş/Studio nesne deposu yoktur.** Studio bucket, imzalı PUT, Dashboard `studio-assets.sql`, Storage CORS ve `studio_digital_assets_data_base64_max_chars` CHECK canlı reçete değildir — `STORAGE_CONTRACT.md` + **ARŞİV / 410 (GEÇERSİZ)**. Akademi ders TTS (`lesson-audios`) dar istisnadır; operatör Studio bucket açmaz.

---

## 10. HTTP idempotency

Kritik yazmalar `Idempotency-Key` (UUID) ister: `POST /api/wallet/top-up`, akademi satın alma, freelancer kabul. Aynı anahtar ikinci finansal emir doğurmaz. Tablo `http_idempotency_records`. Cüzdan `merchantOid` anahtardan türetilir (`Date.now` çift PENDING üretmez).

`/api/v1` lab yazmaları (teklif, serbest bırakma, iade) aynı kalkanı `requireRailV1IdempotencyKey` ile handler’da zorunlu kılar. GET hop’lara anahtar dayatılmaz. Dron kimliği Bearer’dır; çerez v1’e sızmaz. İstemci kuralı: `.system_docs/DRON_CLIENT_SPEC.md`.


---

## 11. Sırlar ve prebuild

`verify:no-secrets` prebuild zincirindedir. PEM, `sk_live_`, `service_role` JWT, dolu yasaklı `.env.example` anahtarları fail-closed. `SUPABASE_SERVICE_ROLE_KEY` Rail JS/env’de yoktur.

---

## 12. Odalar (dürüst vatandaş yolları)

**Canlı mutlu yol:** `/academy` (`rail-temel`), `/career`, `/freelancer`, `/dashboard` + sığınaklar `/profil`, `/cuzdan`, `/pasaport`, `/admin`. Kenar yazma kabukları oturum ister. S43 banka çekimi kapalıdır.

**410 (donmuş — mutlu yol değildir):** `/studio`, `/yetkinilan` (ve diğer donmuş oda sayfa/API’leri) kenarda **HTTP 410** HTML/JSON döner. Operatör bunları “bağlandı / duman yeşili” saymaz. Envanter: `archived/` + `proxy` / `app/api/_gone`.

T3 akademi nakit döngüsü (canlı Direct `:5432` + onaylı vatandaş): `npm run ops:t3-academy-loop`. Sahte bakiye ve mock checkout yok. PayTR sandbox get-token + HMAC webhook → `LedgerEntry` CREDIT / `CLEARED`, sonra `rail-temel` kilit / satın alma / müfredat / sınav / `/academy/dogrula/[hash]`.

T4 kazanç halkası (canlı Direct `:5432` + akademi vizesi olan satıcı + müşteri nakit): `npm run ops:t4-freelancer-loop`. Vizesiz teklif HTTP 403. OPEN ilan → katalog `escrow:hold` bps → `accept` — **PayTR Pazaryeri Split stub iken HTTP 503** (Merchant açık olsa bile). Split gelmeden “freelancer nakit halkası yeşil” denmez. Sahte bakiye ve ikinci bakiye kolonu yok.

---

## 13. İlk bağlama sırası

1. `.env.example` → `.env.local`
2. `DATABASE_URL` + `DIRECT_URL` (`db.<ref>.supabase.co:5432`) — §2.1 Direct Port protokolü
3. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Direct TCP `:5432` yeşil (IPv6 rota veya IPv4 add-on; havuz yok)
5. `npm run ops:migrate` — bucket SQL / Studio CORS **yok** (`STORAGE_CONTRACT.md`)
6. `/register` → UUID → `SUPER_ADMIN_USER_ID` → süreç yeniden
7. PayTR webhook + Inngest **çift** anahtar (`INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`) + Redirect URLs
8. Bildirim SMTP (`NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM`) — boşsa e-posta atlanır; halka yine döner. Resend yok.
9. `npm run ops:runtime-readiness` (üretimde çıkış 0). `GET /api/health` 200 **ve** `checks.inngest = configured`. `/api/jobs/inngest` üretimde 503 değil.

---

## 14. Canlıya çıkış mührü

**Asil sicil (A7):** Çalışan 4 oda (Akademi, Kariyer, Freelancer, Dashboard) + 4 sığınak; 410 envanteri `archived/` + kenar 410. “Beş dikey oda”, Yetkinİlan/Studio/DevLabs canlı ürün cümlesi **yasaktır**. Kenar JWKS/CSP kodda mühürlüdür. Bu dosya insan ops SSOT’tur. D3 **üç halka** (öğrenme → kanıt → kazanç) kodda mühürlüdür ve fail-closed’dır; kazanç halkası split stub iken accept **503** kalır. Günlük mühür raporları `/docs` altındadır; yokluğu ops bağını kırmaz. `GET /api/health` JSON `phase` taşımaz; sahte `phase` yazılmaz.

Kurumsal altıncı vitrin diye açılmaz. On üçüncü oda yasaktır. S43 çekim kapalıdır. Üretimde `PAYTR_SANDBOX` / mock checkout / boş `INNGEST_SIGNING_KEY` / boş `INNGEST_EVENT_KEY` fail-closed.

Tek süreç hız tavanı (§7) ölçeklenmeden ikinci instance açma.

---

## 15. Closed Testing / TestFlight (`apps/rail-is`)

Play Closed Testing ve Apple TestFlight, mağaza üretim yayını değildir. Dron halkası (accept DEBIT → teslim → release CREDIT) laboratuvarda mühürlüdür; paket ikinci bir nakit kapısı açmaz. İstemci kuralı: `.system_docs/DRON_CLIENT_SPEC.md`. Faz 2 kapanış: `docs/19_FAZ2_NIHAI_KAPANIS_RAPORU.md`.

Native env (`apps/rail-is/.env.example`) yalnız `EXPO_PUBLIC_RAIL_API_BASE` + `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Amiral `.env.local` pakete kopyalanmaz. `service_role` yoktur.

### 15.1 `RAIL_DRON_ORIGINS` — üretimde boş (saf native Bearer)

Amiral secret store / üretim `.env` içinde `RAIL_DRON_ORIGINS=""` (veya anahtar yok). Boş allowlist = `/api/v1` cevaplarında CORS başlığı **yazılmaz**. Native `fetch` Origin basmaz; kimlik yalnız `Authorization: Bearer`. Çerez v1’e sızmaz (`Cookie` yok sayılır, `Set-Cookie` yazılmaz). `Access-Control-Allow-Credentials` yoktur.

| Durum | Davranış |
|-------|----------|
| Boş / tanımsız | Saf native. CORS yok. Closed Testing ve canlı mağaza varsayılanı. |
| Virgüllü `https://…` origin | Yalnız laboratuvar web-view / Expo origin. Üretime kopyalanmaz. |
| `*` veya path’li URL | Parse düşer; yansımaz. Joker yasak. |

Closed Testing sırasında “API tarayıcıdan açılmıyor” şikâyeti CORS açma gerekçesi **değildir**. Dron native Bearer konuşur. Laboratuvar allowlist’ini Play/TestFlight secret’ına taşımak anayasa ihlalidir.

### 15.2 Cüzdan yükleme — IAP yok; web `/cuzdan` köprüsü

Dron cüzdan **okur** (`GET /api/v1/dashboard/wallet-strip`). Yükleme native PayTR, native IAP, Play Billing veya App Store IAP **değildir**. Hop allowlist’te top-up yoktur.

1. Vatandaş “Cüzdanı web’de yükle” (veya kabul 409) basar.
2. Sistem tarayıcısı `{EXPO_PUBLIC_RAIL_API_BASE}/cuzdan` açar (`Linking.openURL`). In-app WebView / Expo Web ürünü yoktur.
3. PayTR iFrame + Bildirim URL Amiral’de durur (§4). CREDIT yalnız HMAC + clearing ile doğar.
4. **Bearer ≠ çerez.** `/cuzdan` tarayıcı oturumu isteyebilir. Mağaza inceleme metni “uygulama içinde yüklendi” demez.
5. Vatandaş uygulamaya dönünce `AppState === active` Tezgâh + wallet-strip (owner ise teklif listesi) yeniden okunur. Yerel bakiye uydurulmaz.
6. Yetersiz bakiyede `POST …/accept` **409**; ilan OPEN kalır; aynı köprü. Sahte yeşil yok.

İnceleme cümlesi (kilitli): uygulama cüzdan yüklemez; DEBIT mevcut Amiral bakiyesindendir; yükleme sistem tarayıcısında `/cuzdan` (PayTR). IAP SKU, store product id veya “kolay top-up hop” eklemek Closed Testing “düzeltmesi” değildir.

### 15.3 HTTP 426 — sürüm güncelleme zorunluluğu

Kenar `/api/v1` (health ve `OPTIONS` hariç) `X-Rail-Min-Version` ister. Bugün `RAIL_API_MIN_VERSION = 1` ve `RAIL_API_VERSION = 1`. Dron kilit ekranı: **“Lütfen uygulamayı güncelleyiniz”** (`dron-stale-lock`). Zarf `data: null`. Boş home / sahte liste **yasak**.

| HTTP | Ne zaman | Vatandaş / zarf | Operatör |
|------|----------|-----------------|----------|
| 400 | Başlık yok veya geçersiz | `"Sürüm başlığı gerekli."` / `"Sürüm başlığı geçersiz."` | Paket regress; 426 değildir. |
| 401 | Bearer yok / çerez-only / JWT fail | `"Oturum gerekli."` | Refresh; olmazsa giriş. Sürüm değil. |
| 426 | İstemci `< minVersion` | `"Bu uygulama güncel değil. yetkin.ai uygulamasını mağazadan güncelle."` | **Eski APK/IPA.** Mağaza yeni build. |
| 426 | İstemci `> apiVersion` | `"Bu sunucu henüz o sözleşmeyi konuşmuyor."` | **Sunucu geride.** Amiral’i yükselt; minVersion’ı düşürme. |

**Operasyonel sıra (426 görüldüğünde):**

1. Zarfı oku: `ok: false`, `error`, `requestId`, `apiVersion: "1"`, `data: null`. HTML / boş kart değilse protokol duruyor.
2. 400/401 ile karıştırma. Başlık eksikse paket; oturumsa JWT. `RAIL_DRON_ORIGINS` doldurmak 426’yı çözmez.
3. **Client-stale** (eski istemci): Play Closed Testing / TestFlight’a yeni binary bas. Eski build’i “geçici allow” ile `RAIL_API_MIN_VERSION` düşürerek yeşil boyama. Tester’a mağazadan güncelle de; APK yan yükleme ikinci gerçek değildir.
4. **Server-stale** (istemci gelecek sürüm konuşuyor): Amiral’i o sözleşmeyi konuşacak şekilde yayınla. İstemci başlığını sessizce `1`’e çekmek sahte uyumluluktur.
5. `minVersion` yükseltmesi bilinçli sözleşmedir: eski Closed Testing build kilit ekranı **almalıdır**. Bu beklenen fail-closed’dır; “bozuk uygulama” ticket’ı değildir.
6. Güncelleme sonrası duman: giriş → `GET /api/v1/auth/session` 200 → wallet-strip `live` → bir yazma hop’u (teklif veya accept) UUID ile. 426 kaybolmadan “nakit çalışıyor” denmez.
7. Eski binary duruyorsa kilit ekranı durur. Parse fail boş Tezgâh değildir.

Sözleşme büyüyünce (yeni zorunlu hop / kırıcı DTO) `RAIL_API_MIN_VERSION` yükselir; runbook bu cümleyi yalanlamaz. EAS sihirle 426 çözmez.

### 15.4 Kapalı teste sürmeden (kilitli)

1. Amiral üretim/staging: `RAIL_DRON_ORIGINS` boş; `PAYTR_SANDBOX` / mock checkout yok; Inngest çift anahtar.
2. Dron env: üç `EXPO_PUBLIC_*` dolu; `service_role` yok.
3. İnceleme notu: emanet vardır; IAP yoktur; yükleme web `/cuzdan`; vizesiz teklif 403; iade/sohbet native’de yok.
4. Hâlâ kapalı (paket kapsamı değil): `GET /api/v1/freelancer/jobs/{id}`, `GET …/messages`, dron `refund` / `dispute` / top-up / native IAP, `POST …/deliver`, 13. oda, S43 çekim.

---

## 16. Anayasadan taşınan operasyon tavanları (Faz 2)

Bu maddeler güvenlik kırmızı çizgisi değildir; altyapı / ürün tavanıdır. Anayasa kısa kalsın diye burada durur. Donmuş oda kilitleri ve Studio depo talimatları **ARŞİV / 410** bölümündedir — canlı reçete değildir.

### 16.1 LLM rol tavanı

8 kanonik rol tavanı kodda mühürlüdür (`verify:ai-gateway` / constitution surfaces). `VOICE_TTS` yalnız Akademi dinleme (`generateSpeech`); `VIDEO_GEN` fail-closed. Ham SDK dikeyde yasaktır.

### 16.2 SEN aksı

`npm run verify:sen-axis` marka/dil taramasıdır. Prebuild derleme kapısında **yoktur**. `verify:grep-seals` / `verify:nightly` kovasındadır. Ürün kalitesi ≠ mali/yasal kırmızı çizgi.

---

## 17. V1 hop vs web-only yazma envanteri (Faz 2)

SSOT hop listesi: `lib/kernel/http/v1-contract.ts` (`RAIL_V1_HOPS`, 16 kayıt). Amiral çerezle `/api/...`, Dron Bearer ile `/api/v1/...` aynı handler’ı konuşur. Aşağıdaki ayrım **bilinçlidir**.

### 17.1 V1 hop sicilinde (Amiral + Dron protokolü)

| Hop id | Method | Yazma? | Not |
|--------|--------|--------|-----|
| health | GET | hayır | public |
| academy-certificate | GET | hayır | public hash doğrulama |
| academy-pulse | GET | hayır | Bearer |
| **academy-purchase** | **POST** | **evet** | Idempotency. **Amiral + lab (kanonik `/api/...`).** Dron `/api/v1` kenarda **403** (`RAIL_V1_HOP_DRON_FORBIDDEN`); handler defense-in-depth aynı. `nativeStore: "forbidden"`, `RAIL_V1_DRON_FORBIDDEN_HOP_IDS`. Native IAP yasak. |
| auth-session | GET | hayır | |
| wallet-strip | GET | hayır | top-up hop değildir |
| freelancer-jobs | GET | hayır | |
| client-job-bids | GET | hayır | owner secrets |
| **freelancer-bid** | **POST** | **evet** | Diyar B |
| **freelancer-accept** | **POST** | **evet** | Diyar B; split yoksa 503 |
| freelancer-contracts | GET | hayır | |
| **freelancer-delivery** | **POST** | **evet** | messages |
| **freelancer-release** | **POST** | **evet** | |
| **freelancer-refund** | **POST** | **evet** | |
| career-pulse | GET | hayır | |
| career-visas | GET | hayır | |

### 17.2 Bilinçli web-only (Diyar A / Amiral çerez — v1 hop değil)

Akademi pedagoji ve kanıt yazmaları native drona açılmaz (IAP / mühür iade riski):

| Uç | Method | Gerekçe |
|----|--------|---------|
| `/api/academy/courses/[id]/exam` | GET/POST | Sınav oturumu + puan — Diyar A |
| `/api/academy/courses/[id]/listen` | POST | TTS pedagoji — Diyar A |
| `/api/academy/courses/[id]/lock` | POST | Fiyat kilidi — Amiral tahsilat öncesi |
| `/api/academy/courses/[id]/curriculum` | POST | Ders tamamla — Diyar A |
| `/api/academy/reviews` | POST | Ders yorumu |
| `/api/academy/certificates` | GET | Kendi listesi (public hash hop ayrı) |
| `/api/career/portfolio` | GET | Portföy oturum kilidi; v1’de pulse/visas var, portfolio hop yok |

### 17.3 Kernel / admin web-only (dron dışı)

| Uç | Method | Not |
|----|--------|-----|
| `/api/wallet/top-up` | POST | PayTR; v1 hop değildir — web `/cuzdan` |
| `/api/payments/webhooks/paytr` | POST | PSP callback |
| `/api/profile` | PATCH | |
| `/api/auth/password` / `logout` | POST | |
| `/api/ai/chat` | POST | |
| `/api/admin/*` | PATCH/POST | Super Admin |
| `/api/freelancer/jobs` | POST | İlan oluşturma — lab hop’ta yok; PO onayı |
| `/api/freelancer/squad` | POST | |
| `/api/freelancer/**/dispute` | POST | |
| `/api/jobs/inngest` | — | Inngest serve |

**Kabul cümlesi:** Dış sözleşme = 16 hop + bu web-only listesi; ikisi de bilinçli. Diyar A native mağaza submit yok.

---

## ARŞİV / 410 (GEÇERSİZ)

**Durum:** Canlı bağlama reçetesi değildir. Operatör bunları provision etmez, Dashboard’da çalıştırmaz, “eksik adım” ticket’ı açmaz. Studio/DevLabs/Junior/Yetkinİlan HTTP **410**. Disk: `archived/` + kenar 410. Sözleşme: `.system_docs/STORAGE_CONTRACT.md` (vatandaş/Studio depo yok; akademi `lesson-audios` istisnası canlıdır, bu arşiv listesinde değildir).

### A.1 Env (donmuş)

| Anahtar | Not |
|---------|-----|
| `DEVLABS_KEY_PEPPER` | DevLabs 410. Boşsa tarihsel kod varsayılanı; `ops:runtime-readiness` üretim bloğu **değildir**. Canlı `.env` tablosunda yoktur. |

### A.2 Studio nesne depo (ölü talimat)

Aşağıdakiler **geçersizdir** — canlı §9 / §13’te yoktur:

- Bucket `studio-assets`; imzalı PUT (`STUDIO_STORAGE_BACKEND = "object-store"`); path `{userId}/{generationId}.{png|jpg|webp}`
- Dashboard SQL Editor: `supabase/storage/studio-assets.sql`
- Storage CORS: origin = `NEXT_PUBLIC_APP_URL`; metod yalnız PUT; `npm run ops:storage-cors`
- CHECK `studio_digital_assets_data_base64_max_chars` tavan **2097152**; decoded **1572864**. P3 sonrası tablo DROP — post-apply bu CHECK’i **beklemez**
- Katalog hayalet birimleri `studio:generation:image`, `devlabs:generation:code` — 410 odanın tarihsel tohumu; canlı mutlu yol değildir

### A.3 Junior / EİDS / Yetkinİlan (donmuş kilit — “yapılacak iş” değil)

Junior 410; production vekâlet / harç donuk (`assertJuniorProductionOpen` / `test:frozen`). Yetkinİlan emlak/vasıta: teklif ve emanet bağlanmaz; EİDS’siz kamu ilan açılmaz. Bunlar backlog ticket’ı değildir — **kapalı yüzey**.

### A.4 Tarihsel mutlu yol (yasak cümle)

Yanlış: vatandaş yolları `/yetkinilan`, `/studio` “omurga bağlandı”. Doğru: kenar **410** HTML/JSON. Yanlış: “beş dikey oda (Akademi, Freelancer, Yetkinİlan, Studio, DevLabs)”. Doğru: **çalışan 4 oda + 4 sığınak**; 410 envanteri `archived/` + kenar.
