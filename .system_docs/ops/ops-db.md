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
| `RATE_LIMIT_REDIS_REST_URL` / `_TOKEN` | kenar kota | İkisi dolu = Upstash REST. Kısmi = fail-closed. İkisi boşsa `KV_REST_API_URL` / `_TOKEN` yedek (ikisi dolu). İkisi de boş = süreç-içi bellek (lab). Müze `REDIS_URL` değildir. |
| `KV_REST_API_URL` / `_TOKEN` | kenar kota yedek | Vercel KV / Upstash entegrasyonu. Yalnız `RATE_LIMIT_*` boşken kullanılır; kısmi RATE_LIMIT ile karıştırılmaz. |

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

### 3.1 Canlı kontrol listesi

Üretim paneline bakılır. Değer bu dosyaya, bilete ve sohbete yazılmaz. Tanımlı, trim sonrası boş olmayan dizedir (`filled`). `npm run ops:runtime-readiness` üretim anlık görüntüsünde `superAdmin=configured` veya `superAdmin=uuid-unset` yazar. Kimlik basmaz.

| Değişken | Tanımlı | Boş |
|----------|---------|-----|
| `SUPER_ADMIN_USER_ID` | Yerleşik kutu yalnız bu kimlikle açılır. Başka adres `CANONICAL_SUPER_ADMIN_EMAIL` ile birlikte dolu olmalıdır. | Üretimde hiçbir hesap admin değildir. `/admin` ve `auth = "admin"` rotaları kapanır. Karar `isSuperAdminActor`. Hazırlık kapısı T-03 ile çıkar. |
| `CANONICAL_SUPER_ADMIN_EMAIL` | Üretimde bu adres ve `SUPER_ADMIN_USER_ID` birlikte eşleşirse kutu açılır. `CITIZEN_TEST_ACCOUNT_EMAIL` yazılsa da admin olmaz. | Üretimde varsayılan adrese düşmez. Yerleşik kutu `builtInRecoveryOpen` ile yalnız `SUPER_ADMIN_USER_ID` eşleşince açılır. |
| `JUNIOR_BETA_ALLOWLIST` | Doğrulanmış postalar kilitli dersi izler (`isJuniorAuditActor`). Kapalı kasada sipariş açmaz. | Yalnız süper yönetici denetim aktörüdür. |
| `JUNIOR_CHECKOUT_OPEN` | `1`, `true` veya `open` kasayı açar. Denetim aktörü açık kasada da nakit satırı yazmaz. | `isJuniorCheckoutLocked` kapalıdır. Checkout niyeti `reason: "money"` döner. |
| `PAYTR_WEBHOOK_IP_ALLOWLIST` | İsteğe bağlı. Doluysa kod resmi hostları bununla birleştirir. | Resmi host birleşimi durur. Ayrıntı `ops-paytr.md`. |

### 3.2 Kurtarma — yönetim yüzeyi kilitli

Kilit kasıtlıdır (T-03, fail-closed). Kurtarma ikinci bir kapı açmaz. `SUPER_ADMIN_USER_ID` auth kullanıcı kimliğine bağlanır ve süreç yeniden başlar.

Belirti Production’dadır (`NODE_ENV=production` veya `VERCEL_ENV=production`). `/admin` ve admin API 403 döner. Hazırlık raporu `superAdmin=uuid-unset` ya da T-03 cümlesidir. Süreç günlüğü `[super-admin]` ile iki durumdan birini söyler: değişken boştur, ya da oturum kimliği `SUPER_ADMIN_USER_ID` ile aynı değildir. Günlük kimliği yazmaz. Operatör de yazmaz.

1. Supabase Dashboard → Authentication → Users. Kutu, `CANONICAL_SUPER_ADMIN_EMAIL` tanımlıysa o adrestir. Değilse `CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT` (`lib/kernel/auth/super-admin.ts`, bölüm 3 adım 1). `auth.users.id` kopyalanır. Bu değer git’e, bu dosyaya ve bilete girmez.
2. Vercel → Project → Settings → Environment Variables → Production. `SUPER_ADMIN_USER_ID` o kimliğe çekilir. Kutu yerleşik adres değilse `CANONICAL_SUPER_ADMIN_EMAIL` de aynı doğrulanmış adrese çekilir. `PLATFORM_TREASURY_USER_ID` bu alana yazılmaz.
3. Production yeniden deploy edilir. Süreç ortamı açılışta okur. Preview ve Development ayrıdır.
4. Oturumda `email_confirmed_at` dolu olmalıdır. Yerleşik kutuda token bu alanı taşımasa da kimlik `SUPER_ADMIN_USER_ID` ile aynıysa `builtInUserIdBound` açar. Başka adreste bu yedek yoktur.
5. O kutu ile `/admin` açılır. Vatandaş oturumu 403 kalır. Operatör makinesindeki üretim anlık görüntüsünde `npm run ops:runtime-readiness` `superAdmin=configured` yazar.
6. Hesap yeniden açıldıysa yeni `auth.users.id` yazılır ve yeniden deploy edilir. Eski kimlik Production’da kalmaz. Rastgele bir kimlik ikinci admin açmaz.
7. Yanlış kimlik, o oturum için boş değişkenle aynı kilittir. Dashboard’daki kimlik geri yazılır ve yeniden deploy edilir. Değişkeni boşaltmak yüzeyi yeniden kilitler. Bu kurtarma değil, güvenli kapanıştır.

Geliştirmede doğrulanmış kanonik e-posta UUID beklemez. Bu bölüm üretim içindir.

## 6. Redirect URLs

Supabase Redirect URLs, `lib/kernel/auth/redirects.ts` sicili ile birebir: `/auth/callback`, `/sifre-yenile`. Site URL: `NEXT_PUBLIC_APP_URL`.

## 7. HTTP hız tavanı — Redis REST portu

`RateLimitPort` arayüzü (`lib/kernel/security/rate-limit-port.ts`). Bağlayıcı `rate-limit-runtime.ts`:

- `RATE_LIMIT_REDIS_REST_URL` + `RATE_LIMIT_REDIS_REST_TOKEN` dolu → Upstash REST `INCR` + `EXPIRE NX`.
- RATE_LIMIT ikisi boş + `KV_REST_API_URL` + `KV_REST_API_TOKEN` dolu → aynı REST yolu (Vercel KV yedeği).
- Yalnız biri dolu (RATE_LIMIT veya KV) → **fail-closed** (tüm istek reddedilir; belleğe düşülmez). Kısmi RATE_LIMIT, KV ile tamamlanmaz.
- Her iki çift de boş → süreç-içi bellek (Vitest / tek süreç lab).

Redis 5xx veya ağ hatası belleğe düşmez; tek istisna tek tıkla RET kovası (`outreach-unsubscribe-click`) — o kova süreç-içi pencereye iner, gerçek Redis sayacı doluysa yine reddedilir. Müze `REDIS_URL` / `UPSTASH_REDIS_REST_*` / `ioredis` bu yüzeye girmez. Çok instance üretimde RATE_LIMIT veya KV REST çiftini doldur.

## 8. Sağlık

`GET /api/health` DB ping. Down = **503**. JSON `phase` taşımaz. Vatandaş e-posta: freelancer beşlisi + Akademi satın alma makbuzu (`academy-receipt-mail.ts`). `NOTICE_SMTP_HOST` + `NOTICE_MAIL_FROM` boşsa SMTP atlanır.

## 9. Katalog

Kod sabiti satış fiyatı yok; Super Admin satırı `ops:migrate` ile ezilmez (`updated_by` korunur). Vatandaş/Studio nesne deposu yoktur. Akademi `lesson-audios` dar istisnadır; `lesson-audios.sql` migrate kilit listesinde değildir — ayrı provision, gün 0 zorunlu bucket değildir.

## 10. HTTP idempotency

Kritik yazmalar `Idempotency-Key` (UUID) ister. Tablo `http_idempotency_records`.

## 11. Sırlar

`verify:no-secrets` prebuild zincirindedir. `SUPABASE_SERVICE_ROLE_KEY` Rail JS/env’de yoktur.

## 12. Odalar

**Canlı mutlu yol:** `/tezgah`, `/career`, `/dashboard`, `/vize` + çekirdek yetenekler. Akademi kamu 410 (askıda; kod ve mühür durur). Freelancer kamu 410. Junior açıktır; kenar `/junior` için 410 basmaz. AI Tezgâh canlıdır. Dron T3 Akademi halkası kodda durur.

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

2 aktif oda + askıdaki Akademi. AI Tezgâh canlı. S43 çekim kapalıdır. Üretimde sandbox / boş Inngest anahtarı fail-closed. İkinci instance öncesi `RATE_LIMIT_REDIS_REST_*` dolu olmalı; kısmi config fail-closed.

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

8 kanonik rol tavanı kodda mühürlüdür (`AI_MODEL_ROLE_KEYS`). `VIDEO_GEN` mühürlü-ölüdür; ısınma klibi yerel dosyadır. Ürün masasının 6 yuvası (`ai_product_model_settings`) bu tavanın yerine geçmez. Ayrıntı `AI_MODEL_YONETIMI.md`. `verify:sen-axis` prebuild’de yoktur.

## 18. KVKK m.11

Ürün içi self-serve silme yoktur. Talepler `destek@yetkin.ai` üzerinden Super Admin tarafından manuel yürütülür. Defter satırları append-only’dir; nakit sicili silinmez.

İstisna — Junior çocuk profili (5 Ekim 2026, SUPER_ADMIN imzası): hesabın sahibi, kendi `junior_profiles` alt ağacını silebilir. Silinen küme ilerleme satırları, `mode = quiz` konu denemeleri ve oyun puanıdır. Profil takma adı `Kapalı` olur, doğum yılı boşalır, seçim kapanır, rıza satırının profil bağı kopar. Rıza kanıtı (`guardian_user_id`, `notice_sha256`), `junior_subscriptions`, `user_billing_info`, `payment_orders` ve `ledger_entries` silinmez. Oda kilidi açık değilken silme rotası 503 döner. Kilitliyken talep yine `destek@yetkin.ai` üzerinden yürür.

## 19. Akademi TTS bağları — ev değişti

TTS bağları `.system_docs/AKADEMI_URETIM_ANAYASASI.md` içindeki «Akademi TTS bağları» altındadır. Bu başlık operatörün eski yer imini boş bırakmamak için durur. İçerik orada.

## 20. Tezgâh kota ve ürün modeli

| Tablo | Ne |
|-------|-----|
| `tezgah_daily_quotas` | `poolKey`: `lite` (İstanbul günü), `tetkik` (`dateKey=lifetime`), `free_template` sayılmaz. Para yoktur. |
| `tetkik_domain_claims` | Host başına bir ücretsiz Web Site Analizi. Pro ve kredi aşar. |
| `ai_product_model_settings` | Tek satır `id=product`. Altı yuva. Akademi mührünü okumaz. |

PostgREST bu üç tabloyu vatandaşa açmaz. Ayrıntı `TEZGAH_KOTA.md` ve `AI_MODEL_YONETIMI.md`.

## 21. Nesne depo (dürüst kesit)

**Durum:** Bu fazda **vatandaş ürün deposu yoktur.** Studio imzalı PUT, `studio-assets` bucket, Dashboard yükleme paneli ve Storage CORS canlı reçete değildir. Studio sayfa/API HTTP **410**; Prisma Studio tabloları DROP; motor `archived/lib/studio/storage.ts`.

**Akademi ses gerçeği:** Mühür diskte durur; kamu sayfası 410 olduğu için ses teslimi vitrinde yoktur. OFF-101 (`01_office_ai`), OFF-201 (`01_office_ai_ileri`), EC-102 (`02_ecommerce_ai`), SM-103 (`03_social_media_ai`), BOT-104 (`04_chatbot_nocode`), PR-105 (`05_prompt_practice`) kasetleri silinmez. OFF-101 sınav yolu 8 derstir (`01_office_ai-1`, `k1`, `2`, `3`, `5`, `g1`, `w1`, `6`). `01_office_ai-4` yayın klasöründe MP3 durmaz. Fırın modeli `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` okur. Yayın dosyası `public/media/academy/audio/{slug}/{key}.mp3` yolundadır; kenar kısa ömürlü imza olmadan 403 döner. İzin `GET /api/academy/courses/[id]/audio-grant` ile verilir. Akademi sayfası 410 iken bu izin vitrin vaadi değildir. `generateSpeech` ve `listen` kapıları **410**. Prisma `AcademyAudioCache` şemada durabilir; locator yayın vaadi değildir. `lesson-audios` bucket provision yayın vaadi değildir. `lesson-audios.sql` migrate kilit listesinde değildir.

| Madde | Bu faz |
|-------|--------|
| Vatandaş / Studio object store | Yok (410) |
| `lesson-audios` / yayın yolu | MP3: `public/media/academy/audio/{slug}/{key}.mp3`. Oturumsuz indirme yok. |
| Kör `data_base64` gövde | Yasak. Akademi sesi Base64 kolonunda durmaz. |
| `service_role` JS anahtarı | Yok |
| `ops:migrate` | Studio bucket SQL taşımaz. |

Çapraz yollar: `archived/lib/studio/storage.ts`, `lib/academy/media-release-seal.ts`. Anayasa: `.system_docs/ANAYASA.md`. Ops: `.system_docs/OPS_RUNBOOK.md` §9.

## ARŞİV / 410 (GEÇERSİZ)

Studio, DevLabs ve Yetkinİlan HTTP **410**. Junior bu listede değildir; açık betadadır. Disk: `archived/` + kenar 410. Operatör donmuş odaları provision etmez.
