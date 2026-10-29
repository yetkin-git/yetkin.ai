# Ops — Veritabanı ve bağlama

Anayasa: `.system_docs/ANAYASA.md`. İndeks: `.system_docs/OPS_RUNBOOK.md`.

Müze dizini (`yetkin_muze/`) OPS yasağıdır: `.env` kopyalanmaz; git, indeks, webpack ve import dışıdır. Kamu markası `yetkin.ai`. Redis varsayılan yoktur.

## 1. Env

`cp .env.example .env.local` — Dashboard değerleriyle doldur. Git’e `.env` / `.env.local` yazılmaz.

| Anahtar | Zorunluluk | Not |
|---------|------------|-----|
| `DATABASE_URL` | runtime | Vercel: Supabase **transaction pooler** `:6543`. Direct `:5432` Vercel'de yasak. |
| `DIRECT_URL` | `ops:migrate` | `db.<ref>.supabase.co:5432`. Host `pooler.supabase.com` ve port **6543** migrasyonda yasak. |
| `NEXT_PUBLIC_APP_URL` | auth yön | Redirect URLs kökeni. |
| `SITE_MAINTENANCE_FREEZE` | isteğe bağlı | `"true"` / `"1"` = ürün 503. **Canlı yayın:** `LIVE_BROADCAST_SHUTDOWN` env (13 Eylül 2026 itibarıyla varsayılan kapalı). Acil kapatma: env `true` + deploy. |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | auth | `service_role` yazılmaz. |
| `SUPABASE_JWT_SECRET` | kenar HS256 yedek | Boşsa ES256 JWKS. |
| `SUPER_ADMIN_USER_ID` | admin | Auth UUID. Üretimde `yapinet360@gmail.com` hesabının id’si yazılır. Üretimde boşsa hiçbir hesap (yerleşik kutu dahil) Super Admin olmaz (T-03, fail-closed). Doluysa yerleşik kutu yalnız bu UUID ile eşleşen oturumda açılır. Başka bir adres için `CANONICAL_SUPER_ADMIN_EMAIL` ile birlikte dolu olmalıdır. |
| `PLATFORM_TREASURY_USER_ID` | hazine sentinel | Super Admin olarak **yazılmaz**. |
| `NOTICE_SMTP_HOST` / `NOTICE_MAIL_FROM` | bildirim | İkisi boşsa dürüst atlanır (`SMTP skipped`), nakit durmaz. |
| `ACADEMY_EXAM_SITTING_SECRET` | sınav MAC | Üretimde ≥16 karakter. |
| `RAIL_DRON_ORIGINS` | dron CORS | Üretimde boş = saf native. Ayrıntı `ops-dron.md`. |
| `SHADOW_DATABASE_URL` | isteğe bağlı | Prisma migrate diff. |
| `RATE_LIMIT_REDIS_REST_URL` / `_TOKEN` | kenar kota | İkisi dolu = Upstash REST. Kısmi = fail-closed. İkisi boş = süreç-içi bellek (lab). Müze `REDIS_URL` değildir. |

PayTR ve Inngest anahtarları kendi parçalarındadır.

## 2. `ops:migrate` host kuralları

```
npm run ops:migrate
```

1. `DIRECT_URL` (yoksa `DATABASE_URL`) okunur.
2. Host **`db.<ref>.supabase.co:5432`**. `pooler.supabase.com` ve port **6543** migrasyonda YASAK.
3. `prisma migrate deploy`.
4. Kilitli SQL sırası (handle_new_user, FORCE RLS, katalog tohumu, akademi kurs tohumu, freelancer tohumu).
5. Post-apply mühür yoksa fail-closed.

Uygulama `DATABASE_URL` Vercel'de **transaction pooler `:6543`** ister. `DIRECT_URL` Direct `:5432` kalır.

### 2.1 Direct Port (`:5432`) — yalnız migrate

Hedef URI: `postgresql://postgres:<şifre>@db.<ref>.supabase.co:5432/postgres?sslmode=require`

Direct host çoğu projede yalnız AAAA yayınlar. Yol A: IPv4 add-on. Yol B: makinede IPv6. Yol C yasak: `DIRECT_URL` = `*.pooler.supabase.com:6543`.

`npm run ops:migrate` biçimi mühürler. TCP 5432 ön kontrolü vardır. `NODE_TLS_REJECT_UNAUTHORIZED=0` yasaktır.

### 2.2 Vercel runtime — Transaction pooler (`:6543`)

```
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:<PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
```

Kullanıcı **`postgres.<PROJECT_REF>`**. Prisma 7 adapter `$transaction` + `FOR UPDATE` aynı TCP'de kalır. Serverless havuz `max=1`.

## 3. Super Admin

İki kolon vardır. Oturum kapısı `isSuperAdminActor` / `assertSuperAdminActor` ikisine de bakar. Akademi ödeme duvarı aynı kapıyı kullanır (`hasAcademyAdminBypass`); ayrı e-posta kümesi yoktur. Vatandaş test hesabı `yetkin.vision@gmail.com` hiçbir kolonda admin değildir.

1. `/register` ile hesabı aç. Confirm email açık olmalı. Kanonik adres `yapinet360@gmail.com`.
2. Supabase Dashboard → Users → UUID kopyala.
3. `SUPER_ADMIN_USER_ID=<uuid>` üretimde zorunludur (T-03). Hazine sentinel’i yazma.
4. Üretimde (`NODE_ENV=production`) yerleşik kanonik kutu `yapinet360@gmail.com` ayrı durur. Sığınak yalnız oturumda `email_confirmed_at` dolu, `id` geçerli bir Supabase kullanıcı kimliği ve `SUPER_ADMIN_USER_ID` ile birebir eşleşiyorsa açılır. `SUPER_ADMIN_USER_ID` boşsa bu kutu da kapalıdır (T-03). Boş e-posta env’si başka bir adresi varsayılan yapmaz. Başka bir adres ancak `CANONICAL_SUPER_ADMIN_EMAIL` ve `SUPER_ADMIN_USER_ID` ikisi birden dolu ve oturum ikisiyle de eşleşirken yetkilidir; aksi hâlde admin yoktur ve akademi duvarı da açılmaz. Geliştirmede e-posta env boşsa veya vatandaş test adresine çekilmişse kod `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT` (`yapinet360@gmail.com`) kullanır; doğrulanmış kanonik e-posta veya UUID yeter.
5. `SUPER_ADMIN_USER_ID` boş veya yalnız boşluksa UUID kolonu kimseyi admin yapmaz (`isSuperAdminUser`). Üretimde bu, yerleşik kanonik kutu dahil bütün adresleri kapatır (T-03). Üretim derlemesindeki `ops:runtime-readiness` kapısı boş bırakılmasını engeller. Geliştirmede doğrulanmış kanonik e-posta kolonu ayrı kalır.
6. `assertSuperAdminActor` e-postayı ve kullanıcı kimliğini birlikte okur. Geçerli Supabase kullanıcı kimliği ister (`isSupabaseUserId`). E-posta eşleşse de kimlik UUID biçiminde değilse kapı kapanır. `assertSuperAdminUserId` diye bir fonksiyon yoktur.

## 6. Redirect URLs

Supabase Redirect URLs, `lib/kernel/auth/redirects.ts` sicili ile birebir: `/auth/callback`, `/sifre-yenile`. Site URL: `NEXT_PUBLIC_APP_URL`.

## 7. HTTP hız tavanı — Redis REST portu

`RateLimitPort` arayüzü (`lib/kernel/security/rate-limit-port.ts`). Bağlayıcı `rate-limit-runtime.ts`:

- `RATE_LIMIT_REDIS_REST_URL` + `RATE_LIMIT_REDIS_REST_TOKEN` dolu → Upstash REST `INCR` + `EXPIRE NX`.
- Yalnız biri dolu → **fail-closed** (tüm istek reddedilir; belleğe düşülmez).
- İkisi boş → süreç-içi bellek (Vitest / tek süreç lab).

Redis 5xx veya ağ hatası belleğe düşmez. Müze `REDIS_URL` / `ioredis` bu yüzeye girmez. Çok instance üretimde REST çiftini doldur.

## 8. Sağlık

`GET /api/health` DB ping. Down = **503**. JSON `phase` taşımaz. Vatandaş e-posta: freelancer beşlisi + Akademi satın alma makbuzu (`academy-receipt-mail.ts`). `NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` boşsa SMTP atlanır.

## 9. Katalog

Kod sabiti satış fiyatı yok; Super Admin satırı `ops:migrate` ile ezilmez (`updated_by` korunur). Vatandaş/Studio nesne deposu yoktur. Akademi `lesson-audios` dar istisnadır; `lesson-audios.sql` migrate kilit listesinde değildir — ayrı provision, gün 0 zorunlu bucket değildir.

## 10. HTTP idempotency

Kritik yazmalar `Idempotency-Key` (UUID) ister. Tablo `http_idempotency_records`.

## 11. Sırlar

`verify:no-secrets` prebuild zincirindedir. `SUPABASE_SERVICE_ROLE_KEY` Rail JS/env’de yoktur.

## 12. Odalar

**Canlı mutlu yol:** `/academy`, `/career`, `/dashboard`, `/vize` + çekirdek yetenekler. Freelancer kamu 410. Junior 410. Dron T3 Akademi halkası bağlıdır; Tezgâh izole durur.

T3 akademi nakit döngüsü: `npm run ops:t3-academy-loop`. T4 kazanç halkası lab’dır; Split stub iken accept 503.

## 13. İlk bağlama sırası

1. `.env.example` → `.env.local`
2. `DATABASE_URL` (pooler `:6543`) + `DIRECT_URL` (`db.<ref>.supabase.co:5432`)
3. Supabase URL + anon
4. Direct TCP `:5432` yeşil — yalnız migrate
5. `npm run ops:migrate`
6. `/register` → `SUPER_ADMIN_USER_ID` ve kanonik e-posta (`yapinet360@gmail.com` varsayılanı)
7. PayTR + Inngest (kendi parçaları) + Redirect URLs
8. Bildirim SMTP — gün 0 operatör zorunluluğu. Boşsa nakit durmaz.
9. `ACADEMY_EXAM_SITTING_SECRET` ≥16
10. `npm run ops:runtime-readiness` (üretimde çıkış 0)

## 13.1 Faz 0: Akademi Canlı T3 Testi Prosedürü

Reklam bu prosedür yeşil olmadan basılmaz.

1. PayTR canlı merchant üçlüsü. Bildirim URL: `https://yetkin.ai/api/paytr/callback`.
2. Küçük tutarlı gerçek kart ile cüzdan yükleme. Tanık: `PaymentOrder=CLEARED` + ledger CREDIT.
   **18 Eylül 2026 — ₺15,00 PayTR CLEARED canlı kart tanığı alındı (Bakiye ₺10,00 -> ₺25,00, CREDIT defter kaydı oluşturuldu).** Sicil: `ops-paytr.md`.
3. `01_office_ai` satın alma. Tanık: `AcademyPurchase=SETTLED`. SMTP boşsa makbuz `SMTP skipped`.
4. Ders okuma mühürleri + sınav. Baraj ≥70.
5. Sertifika doğrulama: `/academy/dogrula/[hash]` anonim sekmede. `sealStatus=valid`.

## 14. Canlıya çıkış mührü

Motor 4 / Kamu Vitrini 3 Oda. S43 çekim kapalıdır. Üretimde sandbox / boş Inngest anahtarı fail-closed. İkinci instance öncesi `RATE_LIMIT_REDIS_REST_*` dolu olmalı; kısmi config fail-closed.

## 14.1 GA4 ölçüm vanası

`NEXT_PUBLIC_GA_ID` boş, boşluklu, `GTM-` veya `UA-` ise etiket yüklenmez. Geçerli biçim `G-` ve ardından 4–32 harf/rakam. Kimlik yokken sayfa, kasa ve PayTR aynı kalır.

`NEXT_PUBLIC_*` derleme anında istemciye gömülür. Vercel paneline yazmak ışığı açmaz. Değer, Production derlemesinin içinde olmalıdır. Kayıttan sonra `main` yeniden deploy edilir.

Sıra bozulmaz:

1. Çerez ve aydınlatma (`lib/copy/legal-launch.ts`) ile admin huni cümlesi (`lib/copy/sen-voice/admin.ts`) Google Analytics (GA4) ölçümünü birinci taraf dönüşüm ve performans takibi olarak söyler. Reklam ve yeniden hedefleme yoktur. Bu cümleler durmadan Production kimliği yazılmaz.
2. Kimlik repoya girmez. `.env.example` boş string kalır. `.env.production` git dışıdır; çalışma ağacında dosya yoktur. Geliştirme değeri yalnız `.env.local` içindedir. Üretim değeri yalnız Vercel Production env'dedir.
3. Vercel → Project → Settings → Environment Variables → Production → ad `NEXT_PUBLIC_GA_ID`, değer `G-…`. Preview ve Development bu adımı açmaz.
4. `git push origin main` Production derlemesini tetikler. Ayrı Vercel CLI çağrısı gerekmez. Push'tan önceki yerel mühür: `npx tsc --noEmit`, `npx vitest run`, `npm run verify:boundaries`, `npm run verify:api-auth -- --check`, `npm run build`.
5. Ready olduktan sonra canlı sayfada `googletagmanager` script'i aranır. Olay adları: `view_item`, `play_free_preview`, `begin_checkout`, `paytr_iframe_loaded`, `purchase`.
6. Işık yandıktan sonra 14 gün ürün kodu değişmez. Ölçüm bu pencerede okunur.

## 16. LLM rol tavanı ve SEN aksı

8 kanonik rol tavanı kodda mühürlüdür. `VIDEO_GEN` fail-closed (video katmanı terk). `verify:sen-axis` prebuild’de yoktur.

## 18. KVKK m.11

Ürün içi self-serve silme yoktur. Talepler `destek@yetkin.ai` üzerinden Super Admin tarafından manuel yürütülür. Defter satırları append-only’dir; nakit sicili silinmez.

İstisna — Junior çocuk profili (5 Ekim 2026, SUPER_ADMIN imzası): hesabın sahibi, kendi `junior_profiles` alt ağacını silebilir. Silinen küme ilerleme satırları, `mode = quiz` konu denemeleri ve oyun puanıdır. Profil takma adı `Kapalı` olur, doğum yılı boşalır, seçim kapanır, rıza satırının profil bağı kopar. Rıza kanıtı (`guardian_user_id`, `notice_sha256`), `junior_subscriptions`, `user_billing_info`, `payment_orders` ve `ledger_entries` silinmez. Oda kilidi açık değilken silme rotası 503 döner. Kilitliyken talep yine `destek@yetkin.ai` üzerinden yürür.

## 19. Akademi TTS bağları

Pedagoji ilkedir. Bake kapısı: `lib/academy/production-standard.ts`. Yayın listesi `lib/academy/pilot-sku.ts` içindeki `ACADEMY_MEDIA_SEALED_AUDIO` nesnesindedir. `01_office_ai-4` sınav yolunda yoktur.

## ARŞİV / 410 (GEÇERSİZ)

Studio/DevLabs/Junior/Yetkinİlan HTTP **410**. Disk: `archived/` + kenar 410. Operatör bunları provision etmez.
