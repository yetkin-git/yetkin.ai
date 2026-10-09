# 07 — Ops Runbook (indeks)

İnsan ops SSOT indeksi. Anayasa: `.system_docs/ANAYASA.md`. Ürün kodu bu dosyayı import etmez. Credential icat edilmez.

**Canlı reçete:** Motor 4 / Kamu Vitrini 3 Oda (Panel, Akademi, Kariyer) + çekirdek yetenekler (`/profil`, `/cuzdan`, `/pasaport`, `/admin`). Freelancer motor sicilinde durur; kamu yüzeyi **410**. Akademi mühürlü yayın **6** eğitimdir: OFF-101 (`01_office_ai`), OFF-201 (`01_office_ai_ileri`), EC-102 (`02_ecommerce_ai`), SM-103 (`03_social_media_ai`), BOT-104 (`04_chatbot_nocode`), PR-105 (`05_prompt_practice`). OFF-101 sınav yolu `01_office_ai-1`, `01_office_ai-k1`, `01_office_ai-2`, `01_office_ai-3`, `01_office_ai-5`, `01_office_ai-g1`, `01_office_ai-w1`, `01_office_ai-6` dersleridir; `01_office_ai-4` yayın klasöründe durmaz. Dron T3 Akademi yüzeyi bağlıdır; Tezgâh donuk. Video katmanı yerel ısınma kasetidir (`public/media/academy/micro/*-warmup.mp4`). Motor 2 keşif fazındadır.

`LIVE_BROADCAST_SHUTDOWN` üretim kilidi 13 Eylül 2026 itibarıyla **kapalı** (varsayılan `false`; acil kapatma env `true|1`). `SITE_MAINTENANCE_FREEZE` ayrı bakım bayrağıdır.

## Junior — kapalı beta

Junior müstakil odadır. `DRON_KAYIT` satırıdır. `FROZEN_DISK_ROOMS` listesinde değildir. `/junior` ders listesi ve her dersin ilk konusu ziyaretçiye açıktır. Kenar bu adreslere 410 basmaz. Eski `/junior/ebeveyn` 410 kalır.

Kapı `canEnterJunior` (`lib/kernel/security/junior-gate.ts`). Kenar, sayfa ve API bu fonksiyonu okur.

| Ne | Varsayılan | Açmak |
|----|------------|--------|
| Ders listesi ve ilk konu | Açık | Kapatılmaz. `DRON_JUNIOR_OPEN=0` bütün adresi 410 yapmaz. |
| İkinci konu, anlatış, konu testi, profil masası | Kapalı beta | Doğrulanmış süper yönetici (`yapinet360@gmail.com`) girer. Ek test postaları `JUNIOR_BETA_ALLOWLIST` (virgül veya boşluk). Posta doğrulanmış olmalıdır. `yetkin.vision@gmail.com` listeye yazılsa da girmez. |
| Her oturumlu veliye profil masası | Kapalı | `DRON_JUNIOR_OPEN=1`. İkinci konu yine yıllık paket ister. Kasa açılmaz. |
| Kasa | Bayrak boşken kapalı | `JUNIOR_CHECKOUT_OPEN=1` ödeme kapısını açar. Üç tik (mesafeli satış, anında ifa, veli aydınlatması) yoksa PayTR çağrılmaz. Üretimde `PAYTR_SANDBOX` satışı açmaz; canlı üçlü gerekir. Köprü durur: CLEARED `junior-license:yearly` yıllık paketi yazar. Denetim hesabı nakit satırı yazmaz. |

Denetim nakit satırı yazmaz. Süper yönetici kendi test profilini açar; ikinci konuyu, anlatışı ve testi o profilde görür. Başka velinin çocuğuna yazamaz. Super Admin (yapinet360@gmail.com) platformdaki tüm kilitli dersleri, anlatışları ve testleri denetim amacıyla izleyebilir; fakat ders metinlerini paneller üzerinden doğrudan yazamaz (metinler kod dosyasıdır) ve kapalı kasayı açamaz.

Geri alma: `JUNIOR_BETA_ALLOWLIST` ve `DRON_JUNIOR_OPEN` değerlerini sil veya boşalt. Yeniden dağıt. Liste ve ilk konu durur. Profil masası ve ikinci konu yine yalnız süper yöneticiye kalır. Kasaya dokunulmaz.

Sohbet widget'ı `/junior` ve alt yollarda basılmaz.

Fiyat `price_catalog_entries` satırı `cat_junior_yearly` (`module_key=junior`, `unit_key=yearly`). Kodda tutar sabiti yoktur. Satır yoksa vitrin tutar uydurmaz.

## Parçalar

| Parça | Dosya | İçerik |
|-------|--------|--------|
| Veritabanı ve bağlama | [`ops/ops-db.md`](ops/ops-db.md) | Env, Direct Port, Super Admin, migrate, katalog, RLS, sağlık, T3, KVKK, TTS bağları |
| PayTR | [`ops/ops-paytr.md`](ops/ops-paytr.md) | Merchant ≠ Split, Bildirim URL, HMAC, `TRUSTED_PROXY_HOPS`. Canlı tanık: 18 Eylül 2026, ₺15,00 CLEARED |
| Inngest | [`ops/ops-inngest.md`](ops/ops-inngest.md) | Çift anahtar, valör, emanet TTL, 503 çıkış |
| Dron | [`ops/ops-dron.md`](ops/ops-dron.md) | CORS, hop sicili, Closed Testing (T3), 426 |

Akademi makbuzu `academy-receipt-mail.ts` üzerinden SMTP env’ine bağlıdır. SMTP boşsa **SMTP skipped**; nakit durmaz.

Faz 0: Akademi Canlı T3 Testi Prosedürü `ops-db.md` içindedir. PayTR Bildirim URL: `https://yetkin.ai/api/paytr/callback`. Kanonik handler: `/api/payments/webhooks/paytr`.

v1 hop SSOT: `RAIL_V1_HOPS`, **17 kayıt** (`@yetkin/kernel` hop meta + Amiral Zod). Yazma hop’ları dron Bearer ile tüketilebilir; native IAP yoktur. Cüzdan yükleme HMAC `/kasa` pasaportudur.

Closed Testing reçetesi T3 B2C (`ops-dron.md`). Tezgâh yüzeyi izole; Split ayrı idari kapıdır. Mağaza binary: `apps/rail-is/eas.json` (CI eas yok). İnceleme: `.system_docs/DRON_CLIENT_SPEC.md` + `.system_docs/ops/ops-dron.md`.

## Akademi mastering WAV — yedek ve kurtarma

`media-bake/` git dışıdır (`.gitignore`: `/media-bake/`). Vercel paketine girmez; kök `.gitignore` yorumu boyutu yaklaşık 1,5 GB diye işaretler. Yayın türevi `public/media/academy/audio/{slug}/{key}.mp3` repodadır. Mastering WAV kaybolursa yayın MP3’ten kayıpsız geri dönülmez. Yeniden fırın `ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS` çağırır ve ücretlidir.

| Ne | Yol | Kayıp |
|----|-----|--------|
| Mastering WAV | `media-bake/academy/audio/{slug}/{key}.wav` (`academyLessonAudioDiskPath`) | Ücretli TTS olmadan yerine konmaz |
| Konuşma yedeği (MP3) | `media-bake/academy/speech-master/{slug}/{key}.mp3` | WAV yoksa hard-mix buraya, o da yoksa yayın MP3 kopyasına düşer |
| Önbellek | `piece-cache`, `raw-cache`, `raw-dump`, `ab-sample`, `dry-run-receipts` | Fırın artığı; master sayılmaz |
| Yayın | `public/media/academy/audio/{slug}/{key}.mp3` | Git’te durur; WAV’ın yerine geçmez |

`public/media/academy/audio/**/*.wav` de git dışıdır. Canlı kaset MP3’tür.

**Yedek.** Disk silme, makine değişimi veya `git clean` öncesi tüm `media-bake/` ağacı repo dışına kopyalanır. Hedef operatörün harici diski veya şifreli bulutudur. Git’e ve Vercel statik dosyasına konmaz. En az iki kopya durur: çalışan makine ve saha dışı kopya. Öncelik `academy/audio/**/*.wav` dosyalarıdır. `speech-master` ikinci sıradadır. Önbellek klasörleri isteğe bağlıdır.

Kopya öncesi boyut ve dosya sayısı not edilir. Windows ölçümü:

```powershell
Get-ChildItem -Path media-bake -Recurse -File | Measure-Object -Property Length -Sum
```

Kopya sonrası bir mastering WAV’ın SHA-256 özeti kaynak ve hedefte aynı olmalıdır:

```powershell
Get-FileHash -Algorithm SHA256 .\media-bake\academy\audio\<slug>\<key>.wav
```

**Kurtarma.** Fırın ve hard-mix süreçleri durur. Ağaç aynı göreli yollarla repo kökündeki `media-bake/` altına geri konur. `academy/audio/{slug}/{key}.wav` dosyası `academyLessonAudioDiskPath` ile açılır. Yayın MP3’ü yeniden basılacaksa kaynak bu WAV’dır (`scripts/hard-mix-academy-bed.ts`). WAV duruyorsa yeni TTS fırını açılmaz. WAV yoksa ve yalnız yayın MP3 duruyorsa hard-mix onu `speech-master` altına kopyalar; bu, mastering kaybını kapatmaz.
