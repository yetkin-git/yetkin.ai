# Ops Runbook (indeks)

İnsan ops SSOT indeksi. Anayasa: `.system_docs/ANAYASA.md`. Ürün kodu bu dosyayı import etmez. Credential icat edilmez.

**Canlı reçete:** 2 aktif oda + askıdaki Akademi (Panel, Kariyer; Akademi kenar 410). AI Tezgâh canlıdır (`/tezgah`). Çekirdek yetenekler `/profil`, `/cuzdan`, `/pasaport`, `/admin`. Freelancer kamu yüzeyi **410**. OFF-101 sınav yolu `01_office_ai-1` ile başlar; ayrıntı `ops/ops-db.md`. Motor 2 keşif fazındadır.

`LIVE_BROADCAST_SHUTDOWN` üretim kilidi 13 Eylül 2026 itibarıyla **kapalı** (varsayılan `false`; acil kapatma env `true|1`). `SITE_MAINTENANCE_FREEZE` ayrı bakım bayrağıdır.

## §1 Env

`.env.example` → `.env.local`. Git’e `.env` yazılmaz. Anahtar tablosu `ops/ops-db.md` §1. `NEXT_PUBLIC_APP_URL` auth yönün kökenidir.

## §2 Migrate

`npm run ops:migrate`. Host kuralı `ops/ops-db.md` §2. Havuz `:6543` migrasyonda geçilmez.

### §2.1 Operatör sıfır-hata

Direct Port protokolü fail-closed: db.<ref>.supabase.co:5432. Havuz pooler.supabase.com ve port 6543 migrasyonda geçilmez (P1001 yeşil boyanmaz). Direct host çoğu projede yalnız AAAA (IPv6) yayınlar. Operatör makinesinde IPv6 varsayılan rota yoksa getaddrinfo ENOENT / P1001 durur. Yol A: Supabase IPv4 add-on (Direct host A kaydı). Yol B: makinede IPv6 bağını ve ::/0 rotasını aç; Test-NetConnection db.<ref>.supabase.co -Port 5432. Yol C yasak: DIRECT_URL = *.pooler.supabase.com:6543. Runtime DATABASE_URL Vercel'de transaction pooler :6543 kullanır.

Metin `scripts/ops-migrate-lib.ts` içindeki `DIRECT_PORT_OPERATOR_PROTOCOL` ile aynı cümleleri taşır.

## §3 Super Admin

`SUPER_ADMIN_USER_ID` üretimde `yapinet360@gmail.com` hesabının kimliğidir. Boşsa hiç kimse Super Admin olmaz. Canlı kontrol ve kurtarma `ops/ops-db.md` §3, §3.1, §3.2.

## §4 PayTR

Merchant ≠ Split. Bildirim URL: `https://yetkin.ai/api/paytr/callback`. Kanonik handler: `/api/payments/webhooks/paytr`. Ayrıntı [`ops/ops-paytr.md`](ops/ops-paytr.md). Canlı tanık: 18 Eylül 2026, ₺15,00 CLEARED.

Akademi makbuzu `academy-receipt-mail.ts` üzerinden SMTP env’ine bağlıdır. SMTP boşsa **SMTP skipped**; nakit durmaz.

Faz 0: Akademi Canlı T3 Testi Prosedürü `ops/ops-db.md` içindedir. Akademi vitrini askıdadır; prosedür kodda durur, kamu satış cümlesi basılmaz.

## §5 Inngest

Çift anahtar, valör, emanet TTL. Ayrıntı [`ops/ops-inngest.md`](ops/ops-inngest.md).

### §5.1 503 çıkış

İmza veya olay anahtarı boşsa Inngest serve açılmaz; uç 503 döner. Sahte yeşil basılmaz. `npm run ops:runtime-readiness` bu çıkışı okur.

## §6 Dron

CORS, hop sicili, Closed Testing, 426. Ayrıntı [`ops/ops-dron.md`](ops/ops-dron.md).

v1 hop SSOT: `RAIL_V1_HOPS`, **33 kayıt** (`@yetkin/kernel` hop meta + gövde Zod). Yazma hop’ları dron Bearer ile tüketilebilir; native IAP yoktur. Cüzdan yükleme HMAC `/kasa` pasaportudur. AI Tezgâh native v1 kapsamı dışındadır (web-only); sicilde Tezgâh hop’u yoktur.

Mağaza binary: `apps/rail-is/eas.json` (CI eas yok). İnceleme: `.system_docs/DRON_CLIENT_SPEC.md` + `.system_docs/ops/ops-dron.md`.

## §7 Tezgâh kota

AI Tezgâh canlıdır. Havuzlar `tetkik` (ömür boyu 1), `lite` (günlük 3), `free_template` (sınırsız). Çift kilit `TEZGAH_KOTA.md`. Tablolar `tezgah_daily_quotas` ve `tetkik_domain_claims` (`ops/ops-db.md`).

## §8 AI model

Super Admin altı yuva: `textEasy`, `textDeep`, `imageEasy`, `imageDeep`, `voiceEasy`, `voiceDeep`. Tablo `ai_product_model_settings`. Yuva değişimi `ACADEMY_SEALED_MEDIA_MODEL` mühürlerini değiştirmez. Ayrıntı `AI_MODEL_YONETIMI.md`.

## §9 Depolama

Vatandaş ve Studio nesne deposu yoktur. Studio sayfa ve API HTTP **410**. Akademi yayın sesi mühürlü MP3’tür; kenar imza ister. `lesson-audios` migrate kilit listesinde değildir. Ayrıntı `ops/ops-db.md` nesne depo kesiti. `NEXT_PUBLIC_APP_URL` yoksa CORS kontrolü bu bölüme döner.

## §10 Akademi askı

Akademi kamu yüzeyi 410’dur. Mühürlü kaset ve `01_office_ai-1` sınav yolu kodda durur. Satış cümlesi, fiyat ve ses vaadi basılmaz. Üretim rejimi `AKADEMI_URETIM_ANAYASASI.md`. TTS bağları aynı dosyadaki «Akademi TTS bağları» altındadır.

## §11 Junior

Junior açık betadır. `DRON_KAYIT` satırıdır. `FROZEN_DISK_ROOMS` listesinde değildir. `/junior` ders listesi ve her dersin ilk konusu ziyaretçiye açıktır. Kenar bu adreslere 410 basmaz. Eski `/junior/ebeveyn` 410 kalır. Rota açıktır; sol menü izin listesine bağlıdır.

Kapı `canEnterJunior` (`lib/kernel/security/junior-gate.ts`).

| Ne | Varsayılan | Açmak |
|----|------------|--------|
| Ders listesi ve ilk konu | Açık | `/junior` ve `/api/junior/lessons` oda bayrağıyla 410 olmaz. |
| İkinci konu, anlatış, test | Yıllık paket veya denetim | `JUNIOR_BETA_ALLOWLIST`. `yetkin.vision@gmail.com` listeye yazılsa da girmez. |
| 6. sınıf profili | Paket veya `DRON_JUNIOR_OPEN=1` | Kasa açılmaz. İkinci konu yine paket ister. |
| Oda bayrağı | Kayıt açık | `DRON_JUNIOR_ROOM_OPEN=0` ders listesini 410 yapmaz. |
| Kasa | Bayrak boşken kapalı | `JUNIOR_CHECKOUT_OPEN=1`. Üç tik yoksa PayTR çağrılmaz. Denetim hesabı nakit satırı yazmaz. |

Fiyat `cat_junior_yearly`. Satır yoksa vitrin tutar uydurmaz. Sohbet widget’ı `/junior` altında basılmaz.

## §12 Kurtarma

`media-bake/` git dışıdır. Yayın türevi `public/media/academy/audio/{slug}/{key}.mp3` repodadır. Mastering WAV kaybolursa yayın MP3’ten kayıpsız geri dönülmez. Yeniden fırın `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` çağırır ve ücretlidir. Yedek repo dışına, en az iki kopya olarak alınır. Ayrıntı önceki kurtarma notuyla aynıdır: `academyLessonAudioDiskPath`, `scripts/hard-mix-academy-bed.ts`.

Postgres yedeği yalnız lab loopback `yetkin_rail_lab` içindir. Hosted dump bu betikte yoktur. Direct `:5432` `pg_dump --format=custom`; restore ayrı projedir. Betik: `npm run ops:pg-backup-restore`.

## Parçalar

| Parça | Dosya |
|-------|--------|
| Veritabanı | [`ops/ops-db.md`](ops/ops-db.md) |
| PayTR | [`ops/ops-paytr.md`](ops/ops-paytr.md) |
| Inngest | [`ops/ops-inngest.md`](ops/ops-inngest.md) |
| Dron | [`ops/ops-dron.md`](ops/ops-dron.md) |
