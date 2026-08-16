# Tedavi Raporu — Faz 2 (T2 Omurga Bağlantısı & Akademi Dumanı)

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Gövde | `d:\yetkin_rail` |
| Tespit SSOT | `docs/01_TESPIT_RAPORU.md` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Kapsam | Faz 1 commit, T2 omurga doğrulama, Akademi canlı duman denemesi |
| Dışarıda | Faz 3 freelancer/cüzdan döngüsü, 13. oda, Redis, Socket, GİB, çekim, sahte bakiye, sahte `phase` |

Ürün kodu bu dilimde **yeni oda açmadı.** Sahte bakiye yazılmadı. `GET /api/health` JSON `phase` taşımıyor. Mock checkout açılmadı.

---

## 1. Faz 1 commit

T0 seremoni dosyaları (`docs/tedavi_raporu_11_nihai_canliya_gecis_muhuru.md`, `docs/07_tedavi_raporu_d3_nihai_muhur.md`) çalışma ağacında zaten HEAD ile aynıydı — geri yüklemenin git deltası yok. Commit, kalkanı uzakta görünür kılar.

```
d07aa68 chore(kernel): restore T0 seals, track CI and seed devlabs catalog
```

Önceki HEAD: `1d9e9b7` (`feat(infra): T0 belge kalkanı ve git altyapısı kuruldu`).

| Dosya | Neden |
|-------|--------|
| `.github/workflows/ci.yml` | ince CI takibi (`verify:prebuild` + typecheck) |
| `lib/kernel/pricing/catalog-definitions.ts` | `devlabs` / `generation:code` sicil, `seedAmountMinor = 150` |
| `supabase/migrations/20260814040000_price_catalog_definitions.sql` | aynı anahtar, 8. SQL dosyası yok; `ON CONFLICT` Super Admin tutarını korur |
| `prisma/migrations/20260817010000_devlabs_generation_code_catalog/migration.sql` | Prisma tohumu, aynı `updated_by` kuralı |
| `tests/kernel/catalog-definitions.test.ts` | motor sabitleri sicil + SQL ile kilitli |
| `docs/07_OPS_RUNBOOK.md` | §9 katalog satırına `devlabs:generation:code` |
| `docs/02_TEDAVI_RAPORU_FAZ1.md` | Faz 1 kalkan kaydı |

**Bilerek bu commit’e alınmayanlar:** T3/T4 ops betikleri, cüzdan okuma yaması, logout rotası, Anayasa envanter yolu, tarihsel tespit silmeleri, `generated/prisma`, `.env.local`.

Push yapılmadı. Uzak `main` kalkanı ancak push sonrası CI’da koşar.

---

## 2. T2 omurga — dürüst kapalı / bağlı

`.env.local` okundu; değerler bu rapora **yazılmaz.** Müze `.env` kopyalanmadı. Yasaklı anahtarlar (`SUPABASE_SERVICE_ROLE_KEY`, `LOCAL_MOCK_AUTH`, `MAINTENANCE_MODE`, Redis) **yok.**

### 2.1 Env sicili (var/yok — sır yok)

| Anahtar | Durum | Okuma |
|---------|--------|--------|
| `DATABASE_URL` / `DIRECT_URL` | dolu, **aynı** Direct URI | host `db.<ref>.supabase.co`, port **5432**, `sslmode=require`, havuz yok |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | yerel köken |
| `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | dolu | `anon` JWT; `service_role` yok |
| `SUPABASE_JWT_SECRET` | **boş** | HS256 yedek kapalı; kenar ES256 JWKS |
| `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` | dolu | sandbox nakit girişi mümkün |
| `PAYTR_SANDBOX` | `1` | T3 sandbox; üretimde yasak |
| `PAYTR_ALLOW_MOCK_CHECKOUT` | boş | mock checkout kapalı |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | **boş** | Cloud sicili yok |
| `INNGEST_DEV` | `1` (yalnız `.env.local`) | şablona yazılmaz; üretimde bypass etmez |
| `SUPER_ADMIN_USER_ID` | dolu UUID | hazine sentinel’i değil |
| `PLATFORM_TREASURY_USER_ID` | sentinel varsayılanı | Super Admin olarak yazılmamış |
| LLM | en az bir sağlayıcı dolu | gümrük kapısı; dikey SDK yok |
| `DEVLABS_KEY_PEPPER` | boş | geliştirme varsayılanı; üretimde zorunlu |

Direct host DNS: **yalnız AAAA** (IPv6). IPv4 A kaydı yok. Bu makinede TCP `:5432` açıldı (Yol B — IPv6 rota var). Havuz (`pooler.supabase.com` / `:6543`) kullanılmadı.

### 2.2 `ops:migrate` + katalog upsert

Komut: `npm run ops:migrate`. Çıkış **0**.

| Adım | Sonuç |
|------|--------|
| Direct Port ön kontrol | TCP `:5432` açık |
| `prisma migrate deploy` | 14 migrasyon; **uygulanan:** `20260817010000_devlabs_generation_code_catalog` |
| Yedi SQL (kilitli sıra) | auth sync → FORCE RLS → owner SELECT → **katalog upsert** → akademi tohumu → e-posta senkronu → freelancer tohumu |
| Post-apply mühür | Studio CHECK 2097152, idempotency unique, D2.1–D2.3, akademi 2 yayında kurs, freelancer 2 OPEN ilan |

Katalog SQL 8. dosya değildir. `cat_devlabs_generation_code` 4. kilitli dosyanın `ON CONFLICT (module_key, unit_key)` upsert’ine eklendi. Super Admin `updated_by` doluysa tutar ezilmez. `EXPECTED_SQL` yedisi duruyor.

`uselibpqcompat=true` Node `pg` 8.22 / Supabase Direct CA için; `NODE_TLS_REJECT_UNAUTHORIZED=0` yazılmadı.

### 2.3 Inngest kancası

Kod: uygulama id `yetkin-rail`, serve `/api/jobs/inngest`, `auth = "webhook"`. Üretimde çift anahtar boşsa `serve()` açılmaz (503). `INNGEST_DEV` üretimde `false`.

Bu ortamda Cloud anahtarları boş, `INNGEST_DEV=1`, `NODE_ENV=development`:

| Yüzey | Sonuç |
|-------|--------|
| `GET /api/health` `checks.inngest` | **`unconfigured`** — yalnız Cloud sicili; dürüst |
| `GET /api/jobs/inngest` | **200** — yerel Dev dumanı; sahte Cloud yeşili değil |

İşler (kodda): PayTR valör 30 dk `take: 50`, emanet TTL, Arena tur. Socket yok. Akademi mutlu yolu valör taramasına bağlı değildir: webhook handler önce süreç içi `clearSuccessfulPaymentOrder` dener.

### 2.4 PayTR kancası

| Kilit | Kod | Bu ortam |
|-------|-----|----------|
| Webhook | `{APP_URL}/api/payments/webhooks/paytr`, `auth = "webhook"` | yerel köken |
| HMAC | `merchant_oid` + `status` + `total_amount` | imza boş değil |
| Tutar | `total_amount === amountMinor` değilse clearing yok | — |
| Üretim | `assertPaytrProductionSafety` — sandbox/mock throw | `NODE_ENV=development` + sandbox `1` |
| Mock | `PAYTR_ALLOW_MOCK_CHECKOUT` boş | T3 mock ile yeşil boyanmaz |

Canlı `get-token` bu dilimde **çağrılmadı** (vatandaş kaydı Auth hız tavanında durdu). Sahte CREDIT yazılmadı.

### 2.5 Supabase Auth kancası

| Kilit | Sonuç |
|-------|--------|
| JWKS | `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` → ES256 / P-256 anahtar |
| HS256 yedek | `SUPABASE_JWT_SECRET` boş → HS256 token fail-closed |
| Kimlik gerçeği | handler `getUser`; çerez varlığı yetmez |
| `/login` | form açık (`type=password`); “Giriş henüz bağlanmadı” **yok** |
| Redirect sicili | `lib/kernel/auth/redirects.ts`: `/auth/callback`, `/sifre-yenile`; açık yön yok |
| Dashboard Redirect URLs | kod sicili duruyor; panel tıklaması bu raporda doğrulanmadı |

`handle_new_user` AFTER INSERT uygulandı (`ops:migrate`). Prisma `User.id` text’tir; Auth UUID `::text` yazılır.

---

## 3. Akademi dumanı

Hedef: `ac_rail_temel` satın al → oyna → sınav ≥70 → SHA256 → `/academy/dogrula/[hash]`. Sahte bakiye yok. Bağlı değilse fail-closed.

### 3.1 Bağlı yüzey (oturumsuz GET)

`npm run dev` → Ready. `GET /api/health` **200**, `phase` yok.

| Yüzey | HTTP | Kanıt |
|-------|------|--------|
| `/academy` | 200 | **Canlı sicil**; `rail-temel` görünür; “Liste henüz yüklenemedi” yok; “Yayında kurs yok” yok |
| `/academy/dogrula/not-a-hash` | 200 | SHA256 biçim metni (geçersiz hash dürüst reddi) |
| `/login` | 200 | şifre alanı; unbound kopyası yok |

Katalog tohumu Postgres’te duruyor. Oda vitrini yalan söylemiyor.

### 3.2 Nakit mutlu yol — fail-closed

```
npm run ops:t3-academy-loop
```

| Deneme | Durma noktası | Bakiye yazıldı mı |
|--------|----------------|-------------------|
| 1 | `auth.users.confirmed_at` üretilmiş kolon; `UPDATE … confirmed_at = NOW()` yasak | hayır |
| 2 | `public.users.id` text; `WHERE id = $1::uuid` → `text = uuid` | hayır |
| 3 | düzeltmelerden sonra `signUp`: **email rate limit exceeded** | hayır |

Auth e-posta hız tavanı (önceki başarısız kayıtlardan) üçüncü denemeyi kesti. `wallets.amount_minor` UPDATE yok. Mock checkout yok. `LedgerEntry` CREDIT yok. Sertifika hash basılmadı.

Bu **bağlı sistemin dürüst kırmızısıdır**, sahte yeşil değildir. Öğrenme halkasının nakit kanıtı (PayTR sandbox token → HMAC webhook → SETTLED satın alma → müfredat → sınav → doğrulama) **tamamlanmadı.**

### 3.3 Betik onarımı (T3 ops, yeni oda değil)

`scripts/ops-t3-academy-loop.ts` + yüzey testi:

1. E-posta onayı yalnız yazılabilir `email_confirmed_at` (`is_generated = NEVER`). `confirmed_at` üretilmiş kolona yazılmaz.
2. `public.users` sorgusu `$1::text` (şema string FK).
3. Vatandaş e-posta/şifre `signUp` hemen ardından `.env.local`’e yazılır (git dışı); sonraki SQL adımı patlarsa hız tavanı dolmadan aynı vatandaşla devam edilir.

`tests/academy/t3-academy-loop-surface.test.ts` bu üç kilidi okur. **1/1 geçti.**

Aynı `confirmed_at` / `::uuid` kalıbı `scripts/ops-t4-freelancer-loop.ts` içinde duruyor. Faz 3’ten önce düzeltilmezse kazanç halkası aynı yerde düşer.

### 3.4 Disk yüzeyi (canlı nakit değil)

```
npx vitest run tests/kernel/catalog-definitions.test.ts tests/kernel/ops-migrate-surface.test.ts tests/kernel/inngest-serve-guard.test.ts tests/kernel/inngest-serve-guard-surface.test.ts tests/academy/t3-academy-loop-surface.test.ts
```

**18/18 geçti** (son koşuda academy surface ayrıca 1/1). Bellek e2e nakit yolu bu raporun canlı kanıtı **sayılmaz.**

---

## 4. Bilinçli yapılmayanlar

- 13. oda, Redis, Socket, GİB, çekim, Turnstile, DevLabs exec
- `PAYTR_ALLOW_MOCK_CHECKOUT=true` veya cüzdan `UPDATE`
- `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` / sahte `phase`
- Auth `service_role` ile kullanıcı basma
- Faz 3 freelancer emanet döngüsü (öğrenme halkası nakit kanıtı kapanmadan)
- Bu dilimde ikinci git commit / push

---

## 5. Kalan risk (Faz 2 kapanışı)

1. **Akademi nakit dumanı açık.** Omurga bağlı; vatandaş kaydı Auth SMTP hız tavanında durdu. Hız tavanı düşünce `npm run ops:t3-academy-loop` (dev sunucusu + `PAYTR_SANDBOX=1` + mock kapalı).
2. **Inngest Cloud yok.** Valör/TTL/Arena tur üretimde işlemez. Yerel `INNGEST_DEV=1` Cloud yeşili değildir. `checks.inngest = unconfigured` doğru kalır.
3. **Dashboard Redirect URLs** panelde kod sicili ile birebir doğrulanmadı.
4. **T4 betiği** aynı GoTrue / text-id tuzaklarını taşır.
5. **Push yok.** `d07aa68` yalnız yerel `master`.
6. Direct host IPv4 A kaydı yok; IPv6’siz operatör makinesi P1001 görür.

---

## Karar özeti

| Sıra | İş | Durum |
|------|-----|--------|
| 1 | Faz 1 commit | **tamam** — `d07aa68` |
| 2 | `.env.local` dürüst sicil | **bağlı** — Direct `:5432`, Auth, PayTR sandbox; mock/yasak anahtar yok |
| 3 | `ops:migrate` + DevLabs katalog satırı | **tamam** — migrasyon uygulandı, yedi SQL yeşil |
| 4 | Inngest / PayTR / Auth kancaları | **gözden geçirildi** — Cloud Inngest boş (dürüst); JWKS ES256 canlı; PayTR sicil dolu |
| 5 | Akademi vitrin | **canlı sicil** — `rail-temel` listeleniyor |
| 6 | Akademi nakit mutlu yol | **fail-closed** — Auth e-posta hız tavanı; sahte bakiye yok |

Faz 2 omurgayı bağlar ve öğrenme vitrinini kanıtlar. Nakit halkasının uçtan uca SHA256 mührü bu raporun tarihi itibarıyla **basılmadı.**
