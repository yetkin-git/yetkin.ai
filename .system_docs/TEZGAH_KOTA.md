# Tezgâh kota — çift kilit

AI Tezgâh ücretsiz hakkı maliyet sınıfına göredir. Para bu sayaçta durmaz. Tahsilat defter DEBIT satırıdır. Tablo `tezgah_daily_quotas` (adı tarihsel; `date_key` bir **periyot** anahtarıdır).

Kod evi `lib/tezgah/catalog.ts` ve `lib/tezgah/quota.ts`.

## Havuzlar ve periyotlar (Faz 3 / S-01)

| Havuz | Periyot anahtarı | Tavan | Kim kullanır |
|-------|------------------|-------|----------------|
| `tetkik` | `lifetime` | Ömür boyu 1 | Web Site Analizi |
| `lite` (misafir) | `YYYY-MM-DD` (İstanbul günü) | Günde 3 | Teklif, reklam, pazaryeri, hibe, e-ticaret |
| `lite` (üye) | `YYYY-MM` (İstanbul ayı) | Ayda 30 | Aynı araçlar, oturumlu |
| `lite` (Pro) | `YYYY-MM` | Ayda 500 | Tezgâh Pro aboneliği |
| `free_template` | — | Sayılmaz | Dijital dükkân |
| `local` | — | Sunucu sayacı yok | Pro Studio: görsel, teknik çizim, mini SaaS |

Tek üretici: `tezgahQuotaPeriodKey(pool, now, guest)`. Eski ad `tezgahQuotaDateKey(pool, now)` üye hattıyla aynıdır (geriye dönük uyum).

**Misafir neden günlük kalır:** misafir kovası `guest:<ip>`'dir. Bir çıkış IP'sini (CGNAT, kurumsal NAT, kafe) yüzlerce kişi paylaşır; aylık 30 kredi bu kovaya verilseydi tek kişi 30 kredi kazanır, maliyet kalkanı delinirdi.

## Aylık devir (Faz 3 / S-01)

Kullanılmayan aylık kredinin **%50'si** sonraki aya taşınır, taban havuzun **%50'siyle** sınırlıdır.

| Önceki ay | Taban | Artık | Devir |
|---|---:|---:|---:|
| 0 kullanıldı | 30 | 30 | **15** (tavan) |
| 1 kullanıldı | 30 | 29 | 14 |
| 30 kullanıldı | 30 | 0 | 0 |
| Hiç satır yok | 30 | — | **0** (bedava kredi yok) |

- Devir **okuma anında deterministik** hesaplanır (`tezgahRolloverCredits`). Cron beklenmez.
- Devir **zincirleme birikmez**: önceki ayın *kendi* tabanı okunur, devredilen kredi "kullanılmamış" sayılmaz.
- `tetkik` ömür boyudur; devir yoktur.
- Inngest `tezgah-credit-rollover` (ayın 1'i 00:05 İstanbul) **ikinci bakiye yazmaz**: ölçüm yapar, sıfır kullanımlı satırı temizler ve doygunluk alarmı basar (`lib/tezgah/credit-rollover.ts`).

## Kilit 1 — ömür boyu hak

Aktörün (üye kimliği veya misafir IP kovası) ücretsiz tetkik hakkı bir kezdir. Hak bitince Pro veya kredi duvarı gelir. Hak düşmez; ertesi gün geri gelmez.

## Kilit 2 — domain

`TetkikDomainClaim` aynı hostu platform genelinde bir kez ücretsiz açar. Anahtar `tetkikHostKey`: `www.` düşer, sondaki nokta düşer, küçük harf yazılır. Tablo `tetkik_domain_claims`.

`lane === "pro"` veya `lane === "credit"` iki kilidi de aşar. Bu hatlarda claim yazılmaz.

## Sıra

Web Site Analizi (`lib/tezgah/tetkik/engine.ts`):

1. `peek` — kilit 1. Hak yoksa duvar (ücretsiz hatta 429).
2. Domain kontrolü — ücretsiz hatta host daha önce alınmışsa 402. Hak düşmez.
3. `consume` — sayaç bir artar.
4. Model çağrısı. Hata olursa `refund`. Hak geri gelir.
5. Başarıda ücretsiz hat `claim` yazar, sonra `settle`.

Yarışta claim kapanırsa `refund` çalışır ve domain mesajı 402 döner: «Bu web sitesi için ücretsiz analiz hakkı daha önce kullanıldı.»

Ücretli hat (`pro` / `credit`) `Idempotency-Key` ister. Anahtar UUID'dir. Aynı anahtar aynı gövdeyi tekrar tahsil etmez.

Ücretsiz sayaç da **idempotenttir**: istemci anahtar gönderirse aynı `Idempotency-Key` + aynı gövde ikinci kez **sayılmaz**, farklı gövde `400` çakışma döner. Eşleme süreç belleğinde değil, veritabanında (`tezgah_quota_commands`) tutulur — bu yüzden ikinci istek başka bir örneğe düşse bile çift düşüm olmaz (`lib/tezgah/quota.ts` → `prismaStore.tryConsume`). Üretim başarısız olursa `refund` komut anahtarını siler; aynı niyet yeniden denenebilir.

## Hız tavanı (Faz 3 / S-01)

Kenar `llmIp` (20/10dk) **IP başına** sayar; bir çıkış IP'sini paylaşan yüzlerce kullanıcı aynı kovayı tüketir. Bu yüzden üretim rotaları ayrıca **aktör başına** `tezgahGenerateUser` (30/10dk) kapısına girer (`lib/tezgah/generate-guard.ts`).

İki kapı birbirinin yerine geçmez:

| Kapı | Ölçtüğü | Koruduğu |
|---|---|---|
| `consumeTezgahQuota` | kullanım/kredi | ürün adaleti ve gelir |
| `tezgahGenerateUser` | hız | `AI_PLATFORM_DAILY_CAP_MINOR` maliyet kalkanı, CGNAT adaleti |

## Rozet

Sekmeye ve hatta göre (`tezgahPoolQuotaLine` / `...ForLane`):

- Tetkik: `Kalan ücretsiz analiz hakkın: 1 / 1`
- Lite (üye): `Kalan kredi: 27 / 30`
- Lite (Pro): `Pro — aylık 500 kredi · kalan 487`
- Lite (misafir): `Bugünkü ücretsiz hakkın: 2 / 3`
- Kota düşmeyen araç: `Ücretsiz kullanım (Kota düşmez)`

Hak bitince tetkik rozeti `0 / 1 — Pro veya Kredi gerekli` der. Üye hattı "yeni krediler ayın 1'inde" cümlesini basar; Pro hattı "ücretsiz kredi" cümlesini **hiç** basmaz.
