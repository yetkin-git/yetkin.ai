# FAZ 03 RAPORU — Ödeme-Lisans Alarmı, Paylaşımlı Hız Tavanı, Doğrudan Oturum

**Proje:** yetkin.ai (Pragmatik Monolit + `@yetkin/kernel` + tek native istemci `apps/rail-is`)
**Tarih:** 3 Kasım 2026
**Dayanak:** `docs/02_TEDAVI_RAPORU.md` danışmanlık 4.1–4.3 ve `docs/01_TESPIT_RAPORU.md` F-06 / F-09 çevresi
**Kapsam:** CLEARED ödeme ile lisans sapması alarmı, hız tavanı deposunun hazırlık kapısı, `DIRECT_URL` doğrudan oturum hostu. Müşteri kataloğu, satın alma ve cüzdan satırına yazılmadı. Canlı `payment_anomalies` tablosuna satır eklenmedi (eksik lisans 0; yazan yol birim testte).
**Sınır:** Bağlantı dizgisi, mağaza anahtarı, JWT, proje ref'i ve müşteri kimliği bu belgeye yazılmadı. Vercel üretim paneli açılmadı. Commit oluşturulmadı. Diskteki `DIRECT_URL` satırı bu makinede runbook biçimine çekildi; değer burada yok.

---

## 0. Sonuç

| İş | Durum | Kanıt |
|---|---|---|
| CLEARED lisans sapma alarmı | Değerlendirici + 15 dk Inngest işi + günde bir cron + yalnız okuma betiği | `ops:audit-license-gap` → CLEARED lisans **2**, eksik **0**, iade ile kapanmış **0**, yol **direct**. Log `license.gap.scan` / `matched` |
| Hız tavanı deposu | Hazırlık, env'i okuyor. Bu makine beklenen tek süreç modu. Vercel üretimde paylaşılan depo yoksa derleme bloğu | `ops:runtime-readiness` çıkış **0**. `rateLimitStore=in-process-single-node hosting=unspecified`. Hız tavanı için UYARI satırı yok |
| `DIRECT_URL` | Doğrudan oturum `:5432`. Runtime havuzu `:6543` ayrı kaldı | `DIRECT_URL host=supabase-direct port=5432 session-mode direct-ok`. `DATABASE_URL host=supabase-pooler port=6543 transaction-pooler runtime-ok` |
| Hayalet envanter | Doğrudan oturumda çalıştı | `ops:ghost-wallet-holds` → PENDING **0**, çıkış **0** |
| Mühür | Tip, lint hatası, test, rota haritası, sınır, PayTR mühürü | `tsc` temiz. Lint **0 error / 9 warning**. Vitest **411 dosya / 2023 test**. `verify:api-auth --check` **78 rota** (cron **2**). `verify:boundaries` yeşil. `verify:paytr-reconciliation-seals` yeşil |

Kalan hazırlık uyarısı hız tavanı değildir. `TRUSTED_PROXY_HOPS=1`; Cloudflare+Vercel reçetesi 2. PayTR kökü bu makinede hâlâ `localhost`, sandbox açık. İkisi de Faz 03 kapsamının dışında duruyor ve canlı tahsilat öncesi kapanmalı.

---

## ADIM 1 — Ödeme ↔ lisans sapma alarmı (P1)

Faz 02 kancayı dört girişe kaydetti: webhook, Inngest, cron, `ops:reconcile-paytr-pending --apply`. Kanca unutulursa veya kanca içinde throw olursa CLEARED ve cüzdan CREDIT yazılır, kurs veya Junior paketi açılmaz. `ops:audit-academy-ledger` akademi DEBIT ile `academy_purchases` eşleşmesini ölçer ve elle çalışır. Bu tur, lisans niyetinin kendisini ölçer.

Ölçülen evren `payment_orders.status = CLEARED` ve niyet:

| Niyet | Açık lisans |
|---|---|
| `academy-license:{slug}` | Aynı kullanıcı + kurs slug için `academy_purchases` satırı |
| `junior-license:yearly` | `junior_subscriptions.applied_merchant_oids` içinde sipariş numarası ve durum `ACTIVE` |
| `wallet-top-up` ve diğerleri | Lisans değildir. Sayıma girmez |

Karar `lib/kernel/payments/license-gap.ts` içindedir. Kernel Akademi ve Junior import etmez. Koltuk satırlarını sahip odalar okur: `lib/academy/license-gap-read.ts`, `lib/junior/license-gap-read.ts`. Kompozisyon `app/api/(kernel)/payments/license-gap-runtime.ts`.

Sapma nedenleri:

- `missing_purchase` — akademi slug'ı için satın alma yok
- `unparsed_purpose` — önek var, slug yok
- `missing_subscription` — Junior sipariş numarası pakete işlenmemiş
- `subscription_inactive` — numara işlenmiş, paket `ACTIVE` değil

`SUCCEEDED` kart iadesi alarm sayılmaz. Para geri dönmüş bir CLEARED sipariş `compensated` olarak ayrılır; eksik sayısı sıfırsa log `refunded_unlicensed` ve seviye info. İade yolda (`PENDING` / `ACCEPTED`) veya hiç yoksa satır eksik lisansa girer.

Sayı > 0 iken:

- Her sapma için `logEvent` seviye **error**, olay `license.gap`
- Tarama özeti seviye **error**, olay `license.gap.scan`, neden `missing_license`
- Zamanlanmış yol `payment_anomalies.kind = license_gap` yazar. Parmak izi aynı siparişi ikinci kez satır yapmaz. Cüzdan, defter ve lisans düzeltilmez

Sayı 0 iken özet seviye info, neden `matched`.

Üç yüzey aynı değerlendiriciyi kullanır:

| Yüzey | Zaman | Yazma |
|---|---|---|
| Inngest `license-gap-scan` | `TZ=Europe/Istanbul`, on beş dakikada bir | Anomali + log |
| `GET /api/cron/license-gap` | `vercel.json` `15 3 * * *` UTC, günde bir | Anomali + log. Eksik > 0 ise HTTP **500** |
| `npm run ops:audit-license-gap` | Elle | Yalnız okuma. Eksik > 0 ise çıkış **1** ve aynı error logu. Anomali insert yok |

Hobby planı günde birden sık cron ifadesini dağıtımda reddeder. On beş dakikalık ifadeyi `vercel.json` dosyasına yazmak bir sonraki Hobby dağıtımını düşürür. On beş dakika Inngest takvimindedir. Inngest anahtarı yokken yedek, günde bir Vercel cron'udur. Yetki mevcut valör cron'u ile aynıdır: `Authorization: Bearer ${CRON_SECRET}`. Sır boşsa 503, başlık tutmazsa 401. Oturum rotayı açmaz. Rota `auth = "cron"`, kenar haritasında ve web-only sicilinde.

Bu makinede okuma:

```
license.gap.scan action=0 reason=matched
ops:audit-license-gap — CLEARED lisans 2 · eksik 0 · iade ile kapanmış 0 (direct)
ops:audit-license-gap OK — yazma yok.
```

İkinci koşu `direct` dedi. İlk koşu, disk henüz havuz oturumundayken `pooler` demişti; sayı aynıydı (2 / 0 / 0). Canlı tabloya `license_gap` satırı basılmadı çünkü eksik yoktu ve betik yazmıyor. Insert ve mükerrer parmak izi `tests/kernel/license-gap.test.ts` bellek deposunda kilitli.

Kapı (üretim, bu turda panel açılmadı): bir hafta `license.gap.scan` nedeni `matched`, eksik sayı 0. Sayı sıfırdan sapınca error log ve, cron'da, HTTP 500.

---

## ADIM 2 — Hız tavanı paylaşılan depo (P1)

`lib/kernel/security/rate-limit-runtime.ts` zaten üç bağlayıcı taşıyordu:

| Env | Port |
|---|---|
| `RATE_LIMIT_REDIS_REST_URL` + `RATE_LIMIT_REDIS_REST_TOKEN` dolu | Upstash REST `INCR` + `EXPIRE NX` |
| Yalnız biri dolu | Fail-closed. İstek reddedilir. Belleğe düşülmez |
| İkisi boş | Süreç-içi bellek. Tek Node için doğru tavan |

Eksik olan bağlayıcı değil, hazırlık siciliydi. `inspectSafeDefaultOps` depoyu env'e bakmadan `in-process-single-node` yazıyor ve Vercel görününce uyarı basıyordu. Çok örnekte gerçek tavan `limit × örnek` oluyordu; uyarı engelleyici değildi.

Bu tur `classifyRateLimitStore` tek kaynaktır. Hem port seçimi hem `ops:runtime-readiness` onu okur.

| Mod | Hazırlık satırı | Üretim (`NODE_ENV=production` ve Vercel) |
|---|---|---|
| `redis-rest` | Paylaşılan depo. Çok örnek aynı sayacı okur. UYARI yok | Blok yok |
| `fail-closed-partial` | URL ve token birlikte dolu olmalı | Blok |
| `in-process-single-node` ve hosting belirsiz | **Beklenen mod: tek süreç** | Blok yok. Bu, tek `next start` |
| `in-process-single-node` ve hosting Vercel | UYARI + "sessiz delik" | Blok. Paylaşılan depo ikisi birden dolu olmalı |

Bu makinede Redis çifti boş ve `VERCEL` set değil. Koşu:

```
rateLimitStore=in-process-single-node hosting=unspecified
beklenen mod: tek süreç (in-process-single-node). Vercel öncesi paylaşılan depo ikisi birden dolu olmalı.
```

Çıkış 0. Hız tavanı için `UYARI` ve `sessiz delik` satırı yok. Upstash kimliği bu turda icat edilmedi. Paylaşılan depo, iki değişken dolunca mevcut REST portuna bağlanır; hazırlık o anda `redis-rest` yazar ve Vercel uyarısını keser. Birim test bunu kilitler.

Tek örnek zorlaması Vercel'de `maxConcurrency` ile yapılmadı. Serverless örnek sayısını o bayrak kapatmaz. Zorlama, üretim derlemesinin paylaşılan depo olmadan Vercel'e çıkmamasıdır. Bu makine Vercel süreci olmadığı için beklenen mod tek süreçtir.

---

## ADIM 3 — `DIRECT_URL` ve doğrudan oturum (P2)

Runbook: `DIRECT_URL` = `db.<ref>.supabase.co:5432`. `DATABASE_URL` Vercel'de transaction pooler `:6543`. Havuz hostu ve `:6543` migrasyon, kilit ve hayalet envanterde geçmez.

Tur başı, Faz 02 ile aynı borçtu: diskteki `DIRECT_URL` havuz hostu, port 5432 (session pooler). Hazırlık bunu `forbidden-pooler` / `direct-fail` diye görüyordu. `ops:ghost-wallet-holds` havuzu reddediyordu.

Eklenen yönlendirme şifre icat etmez. Havuz kullanıcısı `postgres.<ref>` ise hedef `db.<ref>.supabase.co:5432` ve kullanıcı `postgres` olur. `:6543`, `pgbouncer` ve Prisma havuz parametreleri bu URL'de kalmaz. Düz `postgres` kullanıcı adından ref çıkmaz; fonksiyon null döner.

| Yer | Davranış |
|---|---|
| `toSupabaseDirectSessionUrl` | Türetme. Session pooler fonksiyonu (`toSupabaseSessionPoolerUrl`) hâlâ aynı hostta `:5432`'ye çeker ve doğrudan host icat etmez |
| `resolveHostedDirectSessionUrl` | DDL / hayalet hedefi. Disk zaten doğrudan oturumsa aynen döner |
| `ops:migrate` | Tercih havuzsa önce türetilen doğrudan oturumu dener. TCP düşerse mevcut session havuz `:5432` yedeği durur. `:6543` apply hedefi olmaz |
| `ops:ghost-wallet-holds` | Yalnız doğrudan oturum. Havuz yedeği yok |
| `openDirectPgClient` | AAAA, olmazsa A. Bağlantı zaman aşımı 8 saniye. TLS adı orijinal hostta kalır |
| `npm run ops:direct-session` | Sınıfı basar, dizgiyi basmaz. `--apply` bağlantı açılırsa disk satırını yazar |
| `ops:hosted-apply-preflight` | Disk hâlâ havuzsa durur ve `--apply` yolunu söyler |

Bu makinede türetme bağlandı (`connect=ok`). `--apply` disk satırını yazdı. Sonraki hazırlık:

```
DATABASE_URL host=supabase-pooler port=6543 transaction-pooler runtime-ok
DIRECT_URL host=supabase-direct port=5432 session-mode direct-ok
```

`ops:ghost-wallet-holds` doğrudan oturumda bitti. Wallet-funded PENDING **0**, ledger `escrow-hold` DEBIT PENDING **0**. CREDIT / RELEASE yazılmadı.

`ops:audit-license-gap` ikinci koşuda yolu `direct` diye yazdı. Okuma sorgusu açıldı.

Vercel panelindeki `DIRECT_URL` bu turda görülmedi. Orası hâlâ operatör secret store'udur. Bu makinenin dosyası runbook biçimindedir. Runtime `DATABASE_URL` transaction `:6543` olarak duruyor; uygulama havuzu ile DDL oturumu birbirine yapışık değil.

---

## ADIM 4 — Temizlik ve mühür

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | Temiz |
| `npm run lint` | **0 error**, 9 warning. Uyarılar Faz 02'de de duran hook / `<img>` satırları |
| `npx vitest run` | **411 dosya / 2023 test**, hepsi geçti. Faz 02 409 / 2013 idi |
| `npm run verify:api-auth -- --check` | **78 rota**. cron 2 (`paytr-reconcile`, `license-gap`) |
| `npm run verify:boundaries` | Yeşil. Junior koltuk okuması `lib/junior` içinde. Kernel dikeyi import etmiyor |
| `npm run verify:paytr-reconciliation-seals` | Yeşil |

Yeni testler: `tests/kernel/license-gap.test.ts` (eşleşme, iki sapma, pasif paket, iade, anomali + error log + mükerrer parmak izi), `tests/kernel/license-gap-surface.test.ts` (Inngest on beş dakika, Hobby cron günde bir, rota haritası, amaç dizgisi, doğrudan oturum betikleri). Hız tavanı ve doğrudan URL birim testleri mevcut dosyalara eklendi.

Canlı Next süreci açılmadı. Cron HTTP'si kenar haritası, `auth = "cron"` ve yüzey testi ile kilitlendi. Tarayıcı akışı yok; bu turda değişen yüzey operatör betiği ve hazırlık çıktısıdır.

Commit yok. Ürün diff'i bu turda alarm, hazırlık kapısı, doğrudan oturum yönlendirmesi ve bu belgedir. `.env.local` içindeki `DIRECT_URL` satırı yerel operatör dosyasıdır; depoya girmez.

---

## ADIM 5 — Danışmanlık

### 5.1 Sen olsaydın canlı operatör kullanımına açmadan önce ilk üç adım ne olurdu?

1. **Üretim env'ini bu kapılarla aynı hizaya getirip bir kez dağıt.** Vercel Production'a `RATE_LIMIT_REDIS_REST_URL` ve `RATE_LIMIT_REDIS_REST_TOKEN` ikisini birlikte koy. Koymadan derleme artık bloklar; bu kasıt. Aynı panelde `SUPER_ADMIN_USER_ID` dolu olsun, `NEXT_PUBLIC_APP_URL` https genel kök olsun, `DIRECT_URL` bu makinedeki gibi doğrudan `:5432` kalsın, `DATABASE_URL` transaction `:6543` kalsın. Dağıtımdan sonra Inngest bulutunda `license-gap-scan` görünsün ve ilk log `matched` olsun. Inngest kapalıysa yedek `15 3 * * *` cron'u ve elle `CRON_SECRET` çağrısıdır. Hobby'de on beş dakikayı `vercel.json`'a yazmam.

2. **Yedi gün sapma sıfır.** Her gün `npm run ops:audit-license-gap` ve `payment_anomalies` içinde `license_gap`. Sayı sıfırdan büyükse lisansı elle tamamlama; önce kanca loguna bak (`academy.license.fulfill_skipped` / `junior.license.debit_skipped`). İade `SUCCEEDED` ise alarm susar. İade yoksa müşteri kursuz ve paralıdır. Bu hafta bitmeden ikinci operatör, yeni oda veya vitrin açmam.

3. **Kenar dürüstlüğü.** `TRUSTED_PROXY_HOPS=2` ancak Cloudflare gerçekten Vercel'in önündeyse. Değilse 1 doğru kalır ve uyarı yalan söyler; reçeteyi uydurma. PayTR sandbox ve localhost kökü canlı tahsilatta durmasın. İlk gerçek ödeme laboratuvar tutarı olsun. Ardından aynı gün audit tekrar 0 eksik desin.

### 5.2 Platform kurgusu canlı trafik ve Sürü Dron için ne kadar dirençli?

Kurgu duruyor: tek Next gövdesi, tek Prisma, tek Supabase Auth, ince kernel, oda kaydı + bayrak + `/api/v1`. Bu tur o kurguyu bölmedi.

Bugün daha dirençli olan halka ödeme ile lisans arasındaki sessizliktir. Kanca Faz 02'de kapanmıştı. Faz 03 sapmayı görünür yaptı. Bu makinede 2 CLEARED lisans siparişi, 0 eksik. Alarm, kancanın unutulduğu bir sonraki girişte de aynı yarayı gösterir.

Hız tavanı bu makinede tek süreç için doğrudur ve hazırlık bunu beklenen mod diye yazar. İkinci Vercel örneği, Redis çifti dolmadan derlenmez. Çift dolunca sayaç paylaşılan depodadır ve REST hatasında belleğe düşmez, isteği reddeder. Canlı çok örnek direnci, o iki değişken üretime yazılınca başlar. Bu turda değişken icat edilmedi.

Doğrudan oturum bu makinede açılıyor. Hayalet envanter ve lisans sayımı oradan okudu. Runtime havuzu `:6543` olarak kaldı. DDL ile uygulama havuzu birbirine karışmıyor.

Sürü Dron hâlâ ayrı servis değildir ve olmamalıdır. Defter tek. Native istemci `apps/rail-is` Akademi zamanlama dosyalarına bakmaya devam ediyor. Üçüncü istemci aynı bağı miras alır. Kuyruk hâlâ Inngest'tir. Anahtar bu makinede dolu (`inngestServeMode=cloud`). Anahtar üretimde boşsa valör ve on beş dakikalık alarm Inngest'e binmez; günde bir cron kalır. On kat siparişte ilk ölçülecek yer havuz ve `FOR UPDATE` olmaya devam eder. Bu tur onu yüklemedi.

Kısa hüküm: dürüst bir ödemenin kursuz kalması artık kör değildir. Kötü niyetli trafiğin hız tavanını örnek sayısıyla delmesi, Vercel üretim kapısının arkasındadır ve Redis yazılınca kapanır. İkinci bağımsız istemci ve ikinci operatör için platform henüz hazır değildir.

### 5.3 Faz 04 — Super Admin Operasyon Konsolu v1

Konsol yeni oda değildir. Mevcut süper yönetici kapısı (`SUPER_ADMIN_USER_ID`, fail-closed) ve `super_admin_audit_logs` üstüne oturur. İlk sürüm üç masa, bu sıra:

1. **Olay masası, yalnız okuma.** CLEARED lisans sapması (`license_gap` ve audit betiğinin saydığı satır), `payment_anomalies`, PENDING yaşı, hayalet hold sayısı. E-posta araması serbest metin günlüğü değildir. Kimlik maskelenir. Bu masa Faz 03 alarmının insan yüzüdür. Yazma yok, denetim satırı da yok. Bakmak defteri değiştirmez.

2. **Üç yazma, hepsi gerekçe + append-only denetim.** Katalog yayın (`catalog_publish` zaten var), lisans bağışı (`license_grant` zaten var), sertifika iptali (betik var, HTTP yok). Dördüncü yazma olarak yalnız `license_gap` satırından, tutarı siparişe eşit kart iadesi. Serbest tutar yok. Her yazma `super_admin_audit_logs` eylemi taşır. UPDATE hâlâ tetikte düşer.

3. **Yetki.** V1'de ikinci rol tablosu yok. Kapı tek UUID. Konsol, UUID boşken kimseyi admin yapmaz. "Destek" rolü, iade yetkisi ve veli adına çocuk profili bu sürüme girmez. Onlar ay 6'daki yetki tablosunun işidir. Konsol `CRON_SECRET` veya service role taşımaz.

Öncelik bu sıradadır çünkü nakit anomaliden lisansa ve denetime giden yol, kullanıcı aramasından daha sık yanar. Arama, bu üç masa oturunca gelir.

### 5.4 Önümüzdeki 3–6 ay

Hedef aynı: tek gövde, N istemci, tek defter.

**Ay 1 — Zincirin üretimi.** Bu turun üstüne Redis çifti, dağıtılmış cron, yedi gün eksik lisans 0, panelde süper yönetici UUID, `DIRECT_URL` doğrudan `:5432` (bu makinede bitti; üretim secret store ayrı). Kapı: `ops:runtime-readiness` üretim anlık görüntüsünde `rateLimitStore=redis-rest` ve `direct-ok`.

**Ay 2 — Konsol v1.** Bölüm 5.3'teki üç masa. Kapı: bir nakit sapmasından iadeye ve denetim satırına panelden, on dakika. Betik hâlâ durur. Betik, konsolun gizli ikinci yolu olmaz. İkisi de aynı denetim tablosuna yazar.

**Ay 3 — İstemci bağımsızlığı.** `apps/rail-is` içinden `lib/academy` zamanlama ve punchcard bağı kalkar. Sözleşme kernel veya ayrı içerik paketinde durur. Native CI'ya `tsc` yanında gerçek derleme eklenir. Kapı: `verify:boundaries` istemci ağacından `lib/` importunu kırar.

**Ay 4 — Yük.** Eşzamanlı checkout, webhook, valör. Havuz ve `FOR UPDATE` ölçülür. Kuyruğa dead-letter ve elle yeniden oynatma. Metrikler: PENDING yaşı, `license.gap.scan`, anomali, iade, checkout p95. Kapı: drift 0, eksik lisans 0.

**Ay 5 — Sürü, paket olarak.** Junior zaten ayrı içerik paketi ve kapalı vitrin satırıdır. Hop, bayrak ve kendi CI'ı ile sürüm. Freelancer vitrini Anayasa B5 kapıları yeşil olmadan açılmaz.

**Ay 6 — İkinci operatör ve tatbikat.** Yetki tablosu eklenebilir. `SUPER_ADMIN_USER_ID` kurtarma kapısı fail-closed kalır. DB geri yükleme, PayTR kesintisi, Inngest kesintisi ve tek bölge kaybı runbook'tan bir kez çalışır. RTO / RPO yazılır. Lisans alarmı bu tatbikatta kasıtlı bir eksik satırla değil, sahne verisiyle doğrulanır. Canlı müşteri satırı test verisi yapılmaz.

Beş ilke durur:

1. Tek defter, tek `amountMinor`.
2. Bağlı olmayan kanal sahte onay basmaz.
3. Hız tavanı ikinci örnekte süreç içi bellek olmaz.
4. DDL doğrudan oturumdadır. Runtime havuzu `:6543` ayrıdır.
5. Operatör eylemi append-only denetime yazılır. Konsol ikinci bakiye icat etmez.
