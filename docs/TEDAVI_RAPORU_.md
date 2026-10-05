# TEDAVİ RAPORU — Paket 1: Junior güvenliği, hijyen ve çekirdek onarımı

Tarih: 5 Ekim 2026  
Kaynak: `docs/TESPIT_RAPORU.md` (CEO ve SUPER_ADMIN onayı)  
Kapsam: J-1, J-2, J-3, J-4, H-1, H-2, H-3, J-11, Y-3, Y-4 ve `.tmp/basligin-probe` ses artıkları.

Bu paket Junior'ı açmaz. Kapıyı kilitler, sahte kasayı üretim yolundan çıkarır, konu testi kaydının veritabanı kuralını onarır ve kırmızı doğrulamayı yeşile çeker.

---

## 1. Ne değişti

### 1.1 Junior kapısı (J-1, J-10)

Tek bayrak: `DRON_JUNIOR_OPEN`. Tanımsız, boş, `0`, `false` ve `closed` kapalıdır. Yalnız `1`, `true` veya `open` açar. Varsayılan kapalıdır.

Tam kilit `isJuniorSurfaceLocked` içindedir (`lib/kernel/compliance/circuit-breakers.ts`):

- `JUNIOR_PRODUCTION_LOCKED` dururken bayrak tek başına yüzeyi açmaz.
- Bayrak kapalıyken de yüzey açılmaz.
- İkisi birden kalkmadan Junior sayfası ve API'si açılmaz.

Kapalıyken:

| Yüzey | Yanıt |
|-------|--------|
| `/junior` ve altı (kenar, `edge-guard.ts`) | **410 Gone** |
| `/api/junior-pilot/*` (kenar, `edge-api-auth.ts`) | **410 Gone** — oturumdan önce |
| Aynı API rotalarının gövdesi (`juniorLockedResponse`) | **503** — kenar atlanırsa da kilit |

Yedi rota da gövdede kilit okur: `checkout`, `electives`, `grade`, `practice`, `profiles`, `quiz`, `tell`. Ödeme rotası bu kilidin dışındadır diye bir istisna yoktur.

Açmak için ileride iki iş birden gerekir: sabiti kaldırmak ve `DRON_JUNIOR_OPEN=1`. Bu paket ikisini de açmaz.

### 1.2 Test kasası (J-2)

`completeJuniorCheckout` kart, TCKN ve deneme POS okumaz. Her çağrı **503** ve `not_configured` döner. Gerçek PayTR mağaza hattı yazılana kadar bu böyledir.

`chargeJuniorTestPos` kasadan çıkarılmıştır. İşlev vitest içinde durur; `NODE_ENV=production` iken `not_configured` döner.

Kasa formu kart numarası, güvenlik kodu ve T.C. kimlik alanı basmaz. Ekran "ödeme hattı kapalı" der.

### 1.3 `junior_progress` ve quiz (J-3)

Yeni migrasyon: `prisma/migrations/20261005140000_junior_progress_quiz_mode`.

`junior_progress_shape` artık `speak`, `write`, `practice` ve `quiz` kabul eder. Skor, XP ve ders anahtarı aralığı aynıdır.

`lib/junior/memory-port.ts` aynı kuralı `assertJuniorProgressShape` ile uygular. Bellek deposu `quiz` yazar; `listen` ve 100 üstü skor `junior_progress_shape` ile düşer. Bunu `tests/kernel/junior-progress-shape.test.ts` kilitler.

Postgres denemesi: `tests/kernel/junior-progress-db.pg.test.ts`. Quiz satırının yazılmasını ve bozuk modun `23514` / `junior_progress_shape` ile düşmesini bekler. Bu dosya `test:pg` kovasına girer; `npm run test:all` onu koşmaz. Bu oturumda `127.0.0.1:5432` kapalıydı. Laboratuvar ayağa kalkınca:

```text
npm run test:pg -- tests/kernel/junior-progress-db.pg.test.ts
```

Yeni migrasyon laboratuvar veritabanına basılmadan bu deneme geçmez.

### 1.4 Migrasyon kilidi (J-4)

Elle `EXPECTED_PRISMA_MIGRATIONS` listesi kalktı. Sıra, `prisma/migrations` altındaki klasör adından türer (`expectedPrismaMigrations`).

Güvenlik kalıbı: `^\d{14}_[a-z0-9_]+$`, içi boş olmayan `migration.sql`, bilinen halka migrasyonlarının diskte durması. `20261005093000_junior_paytr_grade_switch` ve quiz migrasyonu bu okumaya kendiliğinden girer. Yeni klasör, ad kalıbını ve SQL dosyasını bozmadan zincire eklenir. Bozuk ad apply planına issue yazar.

### 1.5 Sınır ve atomik mühür (H-1, H-2)

- `ACADEMY_MODULE_KEY` artık `lib/kernel/catalog/academy-module-key.ts`. Akademi tipleri onu yeniden ihraç eder. `course-publish.ts` dikey odayı import etmez.
- Site haritası `lib/kernel/db` dosyasını import etmez. Yayın slug okuması `lib/kernel/catalog/published-academy-slugs.ts` sınırındadır.
- `verify:atomic-seals`, cüzdan yükleme rotasında `requireRailV1IdempotencyKey` arar.

İkisi de bu oturumda yeşil:

```text
verify:boundaries OK
verify:atomic-seals OK
```

### 1.6 Yüzey testleri ve CI (H-3)

`npm run test:all`: **1595 geçti, 0 kaldı** (344 dosya).

`package.json` içindeki `test` ile `test:all` aynı komuttur: `vitest run`. CI'daki `npm run test` artık yüzey testlerini dışarıda bırakmaz. Gece `test:surface` durur.

Onarılan yüzeyler:

| Test | Onarım |
|------|--------|
| `write-path-edge-surface` | `/junior/ebeveyn` yine 410 |
| `ops-migrate-surface`, `three-ring-e2e-surface` | Kaynak `assertApplyPortReachable` arar |
| `saha-pilotu-surface` | Sayı sabiti yok; disk listesi ve iki Junior migrasyonu |
| `cash-loop-catalog-migrate-surface` | Katalog SQL adı, freelancer tohum adından önce geçiyor |
| `boundaries-surface` | `lib/showcase` paylaşılmış katman listesinden çıktı (klasör yok; vitrin `components/showcase`) |
| `lesson-media-surface` | Saat cümlesi güncel oynatıcıya eşitlendi |
| `earnings-bridge` | Kurumsal ilan öznesi chatbot vize kapısına açık yazıldı |

### 1.7 Hijyen (J-11, Y-3, Y-4)

- `tests/junior/*` → `tests/_archived-junior/`. Varsayılan vitest ve `tsconfig` bu klasörü dışlar.
- `scripts/verify-junior-guardianship-seals.ts` emekli. Çalıştırılırsa çıkar ve başarısız döner. Canlı mühür: `npm run verify:junior-pilot-seals`. Eski npm adı da bu yeni mührü çağırır.
- Yeni mühür bayrağı, 410 kenarını, yedi rotadaki kilidi, `not_configured` kasayı, formda PAN/CVC/TCKN yokluğunu, quiz CHECK'ini ve diskten türeyen migrasyon listesini okur. Bu oturumda yeşil.
- `.tmp/basligin-probe` altındaki `.bak` MP3 ve WAV dosyaları silindi.

---

## 2. Bu paketin bilerek yapmadığı işler

Tespit raporundaki şu maddeler duruyor. Satış ve çocuk verisi bunlar bitmeden açılmamalı.

| Madde | Durum |
|-------|--------|
| Ücretli derslerin konu testleri (J-5) | Yazılmadı. Satış zaten kilitli. |
| "%100 Uygun", "Maarif Mührü", fiyat bandı cümleleri (J-7) | Ekranda duruyor. |
| Aydınlatma, açık rıza kaydı, silme, TCKN'nin tek evi (J-8) | Yok. |
| Süper Admin salt-okunur inceleme (J-9) | Yok. Kilit herkese 410/503. |
| Soru bankasını gerçek kaynak yapmak (P1-3) | Yok. |
| Yazarak anlatış yedek yolu (P1-4) | API hâlâ yalnız `speak`. |
| Gerçek PayTR Merchant, defter, webhook | Yok. Kasa `not_configured`. |

`ANAYASA.md` B6 hâlâ "ders listesi ziyaretçiye açıktır" der. Kod artık bayrak kapalıyken listeyi de 410 yapar. Cümle, oda açılacağı gün belgeyle birlikte güncellenmeli. Bu pakette anayasa metnine dokunulmadı.

---

## 3. Doğrulama

| Komut | Sonuç |
|-------|--------|
| `npm run verify:boundaries` | OK |
| `npm run verify:atomic-seals` | OK |
| `npm run verify:junior-pilot-seals` | OK |
| `npm run test:all` | 1595 / 1595 |
| `tests/kernel/junior-progress-db.pg.test.ts` | Yazıldı. Laboratuvar Postgres kapalı; koşulmadı. |

---

## 4. Stratejik görüş

### 4.1 İlk üç teknik adım

Bu temizlikten sonra içerik fırınına geçmem. Sıradaki üç iş:

1. **Çocuk verisi kapısı.** Sürümlü aydınlatma, velinin açık rızası, silme ve dışa aktarma, TCKN'nin yalnız fatura künyesinde durması. Kapı kodu kilitli; hukuk kaydı hâlâ yok.
2. **Para, Akademi'nin defterine.** Fiyat `PriceCatalogEntry` satırı olsun. Abonelik bir lisans satırı olsun. Tahsilat mevcut PayTR mağaza hattından geçsin. Junior'a ikinci bir kasa yazılmasın. Bu bağ kurulmadan `not_configured` kalkmasın.
3. **Kazanım omurgası, ders metninden önce.** `Müfredat → ders → kazanım → soru` veritabanına insin. Matematik 6. sınıf tek yıl, tam konu testi ve kayıtlı cevap ile bitsin. TypeScript dosyasına yeni sınıf yığılmasın.

Neden bu sıra: kilit, satışı durdurur; veli parasını ve çocuk verisini almaya yetmez. Veri modeli yokken öğrenme motoru, kaybolan cevapların üstüne kurulur.

### 4.2 Platform kurgusu

Canlı ad **Pragmatik Monolit + İnce Sözleşme Paketi (`@yetkin/kernel`) + Tek Native İstemci** dir. Eski "Amiral Gemi + Sürü Dron" anlatımı bu kurgunun adı değildir.

Bu tedavi sonrası kurgu Akademi, Kariyer ve cüzdan hattında sağlamdır: tek defter, sınır denetimi yeşil, atomik mühür yeşil, yüzey testleri çekirdek kapıya girdi.

Junior bu kurgunun içine henüz oturmadı. Kilitlendi. Kilit, entegrasyon değildir. Junior hâlâ v1 hop sicilinde yok, fiyat kataloğunda yok, ödeme defterine yazmıyor, native istemci onu tüketemiyor. Bir sonraki oda aynı yan yoldan giderse kurgu yine isteğe bağlı kalır.

Güncel master plan (tespit raporundaki sıra, bu paketin bitirdiği yerden):

| Faz | Hedef | Çıkış |
|-----|--------|--------|
| 0 — bu paket | Kapalı doğan Junior, yeşil `test:all`, yeşil mühürler | Bitti. Quiz'in Postgres turu laboratuvarda ayrıca koşulacak. |
| 1 — yasal ve ticari temel | Rıza, silme, mağaza hattı, fiyat satırı, vitrin cümleleri | Hukuk bakışı ve 15–30 ailelik kapalı beta kararı |
| 2 — kazanım ve içerik hattı | Şema, doğrulayıcı, 4 şıklı soru, kayıtlı cevap | Matematik 6. sınıf tam yıl |
| 3 — öğrenme motoru | Ustalık, aralıklı tekrar, ölçülen anlatış, veli raporu | İnsan etiketli kalibrasyon eşiği |
| 4 — istemci | v1 hop, sonra tek native istemci | İkinci yüzey aynı sözleşmeyle çalışır |

Ölçek kuralı değişmedi: yeni sınıf içerik dosyasıdır, kod değildir. Yeni yetenek önce v1 hop'tur. Para tek defterdedir. Çocuk verisi az, kapalı ve silinebilir olur. Yüksek riskli karar (ders açma) skor cümlesine değil, deterministik kurala bağlanır.

### 4.3 Bir sonraki kritik adım

**Bayrağı açmayın. Junior'ı dağıtıma "açık oda" diye almayın.**

SUPER_ADMIN ve CEO'nun hemen imzalaması gereken üç karar:

1. Ücretli satış, konu testi ve içerik tamamlanana kadar kapalı kalsın.
2. Ödeme, Akademi mağaza hattına ve fiyat kataloğuna bağlansın. Ayrı test kasası bir daha yazılmasın.
3. Dayanağı olmayan Maarif ve fiyat bandı cümleleri yayından kalksın.

Bunların yanında canlı sitenin hangi commit'i çalıştırdığı teyit edilsin. Kod artık kapalı doğuyor; canlı ara sürümde API'nin oturum istediği gözlem, dağıtım bu pakete gelince 410/503'e dönmeli.

Postgres laboratuvarı açıldığında quiz migrasyonu basılıp `junior-progress-db.pg.test.ts` koşulsun. O tur yeşil olmadan konu testi "veritabanına yazıyor" sayılmasın.
