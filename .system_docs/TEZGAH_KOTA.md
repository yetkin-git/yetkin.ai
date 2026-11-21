# Tezgâh kota — çift kilit

AI Tezgâh ücretsiz hakkı maliyet sınıfına göredir. Para bu sayaçta durmaz. Tahsilat defter DEBIT satırıdır. Tablo `tezgah_daily_quotas`.

Kod evi `lib/tezgah/catalog.ts` ve `lib/tezgah/quota.ts`.

## Havuzlar

| Havuz | Sayaç | Kim kullanır |
|-------|-------|----------------|
| `tetkik` | Ömür boyu 1. `dateKey` değeri `lifetime` dir. Günlük yenilenmez. | Web Site Analizi |
| `lite` | Günlük 3. Gün İstanbul gece yarısında döner. | Teklif, reklam, pazaryeri, hibe, e-ticaret |
| `free_template` | Sayılmaz. Sınırsız. | Dijital dükkân |
| `local` | İstemci. Sunucu sayacı yok. | Pro Studio: görsel, teknik çizim, mini SaaS |

Misafir ve üye `lite` tavanı aynıdır: günde 3 (`TEZGAH_GUEST_DAILY_LIMIT`, `TEZGAH_MEMBER_DAILY_LIMIT`). Tetkik tavanı `TEZGAH_TETKIK_LIFETIME_LIMIT = 1`.

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

Ücretli hat (`pro` / `credit`) `Idempotency-Key` ister. Anahtar UUID’dir. Aynı anahtar aynı gövdeyi tekrar tahsil etmez. Ücretsiz sayaç bu anahtarı zorunlu tutmaz; ücretli üretim tutar.

## Rozet

Sekmeye göre (`tezgahPoolQuotaLine`):

* Tetkik: `Kalan ücretsiz analiz hakkınız: 1 / 1`
* Lite: `Günlük ücretsiz hakkınız: X / 3`
* Kota düşmeyen araç: `Ücretsiz kullanım (Kota düşmez)`

Hak bitince tetkik rozeti `0 / 1 — Pro veya Kredi gerekli` der.
