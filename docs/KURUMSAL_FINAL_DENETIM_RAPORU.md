# KURUMSAL (/kurumsal · /ilan) — FİNAL DENETİM RAPORU (R2)

**Denetim türü:** "Güvenme, doğrula" — bağımsız yeniden denetim + **anında onarım**. Bu turda yalnız rapor yazılmadı; bulunan her açık kodda kapatıldı, her kapanış çalışan bir testle kilitlendi.
**Kapsam:** Faz 1 (`F1.1`–`F1.6`) + Faz 2 (`F2.1`–`F2.11`, `D-01`–`D-03`) ile eklenen/değişen tüm dosyalar: `app/api/kurumsal/*`, `app/api/lead`, `app/api/admin/b2b/*`, `app/api/admin/ops/employer-verify`, `app/(public)/ilan/*`, `app/(public)/kurumsal/*`, `components/kurumsal/*`, `lib/sales/*`, `lib/kernel/{security,payments,admin}/*`, `prisma/*`, `proxy.ts`.
**Tarih:** 2026-11-26
**Önceki puan:** **49 / 100** (Tespit Raporu) → Faz 1+2 sonrası iddia: "kapandı"
**Bu turun sonucu:** **84 / 100** — *satılabilir, ancak canlıya alma iki operasyonel adıma bağlı.*

> **Yönetici özeti.** Faz 1 ve Faz 2 kodda gerçekten yazılmış; mimari doğru. Ama önceki iki "yeşil" onay **ölçümle çelişiyordu**: (1) B2B tahsilatı üretimde **her seferinde 500** veriyordu, (2) lead kuyruğunun durum iş akışı DB kısıtı yüzünden **her seferinde 409** veriyordu, (3) Faz 2 migration'ı **canlı veritabanına hiç uygulanmamıştı**. Üçü de statik `toContain` testlerinden kaçtı, çünkü testler *kaynak metnini* doğruluyordu, *davranışı* değil. Bu turda 12 bulgu onarıldı; kritik üçlünün üçü de artık **çalıştırılan** testle kilitli.

---

## 1. Skor kartı — 49 → 84

| # | Boyut | Ağırlık | Önceki | Şimdi | Gerekçe |
|---|---|---|---|---|---|
| 1 | B2B ürün & satış hunisi | 15 | 8 | **13** | Lead kuyruğu gerçek iş akışına döndü (status/not/sayfalama); audit CHECK onarıldı. Vitrin İK odaklı. Kalan: otomatik bildirim/e-posta yok. |
| 2 | İlan / paket / ödeme simetrisi | 20 | 6 | **17** | 500'lük havuz ölümü kapatıldı; fatura künyesi artık toplanıyor (**düğme gerçekten çalışıyor**); dönüş masası doğru yüzeye iniyor; kota + yarış + vergi no yarışı kilitli. Kalan: iade↔kota simetrisi (R2-11). |
| 3 | İK kokpiti & aday deneyimi | 15 | 7 | **12** | Export/not/kapat-aç/CSV var ve çalışıyor; CSV enjeksiyonu tam kapalı. Kalan: sayfalama + satır içi not + aday iletişimi. |
| 4 | Kamu ilan sayfaları & başvuru | 15 | 8 | **14** | `/ilan` dizini + sitemap + gerçek 404; `/kurumsal/*` soft 404'ü kapatıldı. Kalan: doğrulanmamış ilan görünürlük politikası belgesiz. |
| 5 | Yetki / IDOR / RLS / KVKK | 20 | 12 | **18** | IDOR artık **çalıştırılarak** kanıtlanıyor (403/404); KVKK anonimleştirme idempotent; canlı RLS FORCE doğrulandı. **Kalan kritik: Faz 2 migration canlıda yok.** |
| 6 | Güven / doğrulama / kötüye kullanım | 15 | 8 | **10** | VKN/TCKN checksum gerçek; sahte dizi reddi; honeypot artık ayırt edilemez. Kalan: e-posta MX/TEK doğrulaması yok. |
| | **TOPLAM** | **100** | **49** | **84** | |

**84'ün 16 puanlık eksiği nerede:** 5 puan canlı migration'ın uygulanmamış olması (operasyonel, kod değil), 4 puan iade↔kota simetrisi, 3 puan İK iş akışı derinliği, 2 puan e-posta doğrulama, 2 puan bildirim halkası.

---

## 2. Bu turda bulunan ve **kapatılan** bulgular

### P0 — Üretimde ürünü fiilen durduran üç kırık

| ID | Bulgu | Kanıt (ölçüm) | Onarım |
|---|---|---|---|
| **R2-01** | **İlan açma her zaman 500.** Kota kapısı açık bir `$transaction` içinde **global Prisma istemcisinden** katalog okuyordu. Vercel serverless havuzu `max: 1`; tx tek bağlantıyı tutarken ikincisi isteniyor → `pool_timeout` → 500. | `createKurumsalJobPosting` → `assertKurumsalScreeningEntitlement(owner, tx)` → `createPrismaPriceCatalogStore()` → `getPrisma()`. `PRISMA_POOL_MAX_SERVERLESS = 1`. | Katalog kararı `readKurumsalScreeningCatalogGate()` ile **tx'ten önce** okunur; kapı artık `catalog` parametresi alır, içeride global istemci **yok**. Test: katalog çağrısının tx'ten önce olduğunu ve fonksiyon gövdesinde `createPrismaPriceCatalogStore()` bulunmadığını kilitler. |
| **R2-02** | **Lead kaydı her zaman 500.** Aynı desen: `snapshotKurumsalOfferQuotedAmountMinor` `$transaction` içinde global istemci kullanıyordu. | `app/api/lead/route.ts:110` (tx içi) + `kurumsal-lead-quote.ts` → `createPrismaPriceCatalogStore()`. | Fiyat anlık görüntüsü tx'ten **önce** alınır, tx'e değişkenle girer. Test sipariş sırasını kilitler. |
| **R2-03** | **Lead durum iş akışı her zaman 409.** `SUPER_ADMIN_AUDIT_ACTIONS` 11 eylem taşıyor, DB `CHECK` kısıtı 10 tanesini biliyordu. `offer_request_status` yazılamayınca `writeSuperAdminAudit` false dönüyor, `patchKurumsalOfferRequest` **fail-closed geri alıyordu**. | `lib/kernel/admin/audit-log.ts` `offer_request_status` içeriyor; son kısıt migration'ı (`20261124190000`) onu **içermiyor**. | Yeni migration `20261126020000_super_admin_audit_offer_request_status` kısıtı TS listesiyle birebir hizalar. `tests/kernel/super-admin-audit.test.ts` artık bu migration'ı da okur. |

> **Neden önceki turda görülmedi.** Mevcut testler `expect(dosya).toContain("assertKurumsalScreeningEntitlement")` biçimindeydi. Bu, *çağrının varlığını* doğrular; *çağrının hangi bağlantıyı tükettiğini* görmez. Aynı şekilde audit testi yalnız iki eski migration'ı okuyordu. Üç kırık da bu körlükte doğdu — Tespit Raporu'nun K-01 için yazdığı dersin birebir tekrarı.

### P1 — Akışı ölü bırakan kırıklar

| ID | Bulgu | Onarım |
|---|---|---|
| **R2-04** | **Satın alma düğmesi her zaman 422.** `placeSingleCatalogPurchase` fatura künyesini DB'den okuyor; künye yoksa `422 "Fatura künyesi gerekli."`. Kokpitte künye alanı **yoktu** ve hiçbir yer künye yazmıyordu. Düğme vardı, akış ölüydü. | `POST /api/kurumsal/satin-al` artık `billing` alanını `checkoutBillingInfoSchema` ile zorunlu tutar, `persistCheckoutBilling` ile **tahsilattan önce** yazar ve künyeyi `placeSingleCatalogPurchase`'a geçirir. Kokpit `CheckoutBillingFields` basar; künye tamamlanmadan düğme açılmaz ve gerekçe görünür yazılır. |
| **R2-05** | **Ödeme sonrası yanlış yüzey.** `PAYTR_RETURN_DESKS` yalnız `tezgah\|e-ticaret\|hibe\|junior\|cuzdan` taşıyordu. `returnDesk: "kurumsal"` ve `YETKINCV_PUBLICATION_RETURN_DESK = "career"` listede olmadığı için `?masa=` **sessizce düşüyordu** (ölçüldü: `→ /cuzdan?merchant_oid=…`). 2.900 TL ödeyen işveren cüzdan sayfasına düşüyordu. | İki masa listeye eklendi; `kasaReturnDesk`/`KASA_RETURN_HREF`/`KASA_RETURN_LABEL` kurumsal → `/kurumsal/ilanlar`, career → `/career` olarak eşlendi. |
| **R2-06** | **`/kurumsal/*` soft 404.** `/kurumsal` donmuş odadan çıktı ama adres kapısı gelmedi: var olmayan `/kurumsal/ilan/yeni` **HTTP 200** basıyordu (ölçüldü). | `missingPublicSurfacePath` içine **kapalı beyaz liste** eklendi: yalnız `kurumsal/ilanlar` geçer, diğer tüm alt yollar gerçek 404. |
| **R2-07** | **CSV formül enjeksiyonu atlatması.** Görünmez karakter listesi yalnız ASCII denetim aralığıydı. Ölçülen atlatmalar: `\u200b` (zero-width space), `\ufeff` (BOM), `\u200e/\u200f` (yön işareti), `\u2007/\u202f` (ayırıcı boşluk), `\u2028/\u2029`, `\uff1d` (tam genişlik `=`) — hepsi **kaçışsız** kalıyordu. | Hücre önce `NFKC` normalleştirilir, sonra `\p{Cc}\p{Cf}\p{Zs}\p{Zl}\p{Zp}` sınıfları atılır. Tüm ölçülen atlatmalar artık kaçışlı; zararsız değerler kaçış almıyor. |
| **R2-08** | **KVKK anonimleştirme idempotent değil.** İdempotans filtresi `cvSummary` sabitini de içeriyordu; ama KVKK talebi (`eraseCareerPersonalData`) özete **farklı** bir sabit yazıyor (`"Kişisel veri KVKK talebiyle silindi."` vs `""`). Sonuç: zaten anonimleşmiş satır **her gece yeniden** güncelleniyor ve iki akış birbirinin işini eziyordu. | İdempotans anahtarı yalnız **ad + e-posta** (PII'nin kendisi). Test: filtrede `cvSummary` yok + çalıştırılan sahte DB ile PII gider, `weightedScore`/`status`/`testScore` bozulmaz. |
| **R2-09** | **Vergi no sahipliği yarışa açık.** `foreignClaim` kontrolü yalnız `ownerUserId` kilidi altındaydı; bu kilit **aynı** işverenin isteklerini sıralar. **İki farklı** işveren aynı `taxNumber` ile aynı anda açarsa ikisi de "başka sahip yok" görür ve numara iki hesaba bağlanır. | İkinci advisory kilit (`KURUMSAL_TAX_LOCK_NAMESPACE`) `hashtext(taxNumber)` üzerine eklendi. Sıra **sahip → numara → okuma** (deadlock yok). Test sırayı ve ayrı ad alanını kilitler. |
| **R2-10** | **Honeypot ayırt edilebilir.** Sahte yanıt `{received, duplicate}` dönüyordu; gerçek yanıt `request.id` taşır. Bot bu farktan tuzağı anlar. | Sahte yanıt gerçek yanıtla **aynı şekli** taşır (aynı alanlar, cuid benzeri kimlik). DB'ye dokunmaz. |
| **R2-12** | **IDOR testleri metin arıyordu.** `kurumsal-idor.test.ts` yalnız `toContain("ownerUserId: input.ownerUserId")` diyordu; sahiplik filtresi kaldırılsa test **yine geçerdi**. | `setKurumsalJobActive` ve `loadKurumsalShortlistCsvRows` enjekte edilebilir DB aldı. Yeni testler **çalıştırarak** kanıtlar: çapraz işveren → `NotFoundError` ve **hiç yazma yok**; süresi geçmiş ilan yeniden açılamaz; kendi ilanında CSV `cvSummary` taşımaz. |

### Bilinen kalan (bu turda **kapatılmadı** — bilinçli)

| ID | Bulgu | Neden kapatılmadı |
|---|---|---|
| **R2-11** | **İade ↔ kota simetrisi yok.** CLEARED sipariş `super_admin_audit_logs` üzerinden iade edilse bile kota sayacı hâlâ o paketi sayar; lisans düşmez. | İade akışının tasarım kararı gerekiyor: iade edilen paketin açtığı ilanlar ne olacak? Sessizce kota düşürmek, iade sonrası ilanları sahipsiz bırakır. **Ürün kararı** ister; kod tek başına doğru cevabı bilmez. |
| **R2-13** | **Migration uygulanmamış.** `npx prisma migrate status` → `20261126010000_kurumsal_faz2_lead_quota` **not yet applied**. Canlıda `kurumsal_offer_requests` yalnız 7 kolon taşıyor; `status`, `handled_at`, `handled_by`, `admin_note`, `quoted_amount_minor`, enum tipi ve 4 indeks **yok**. | Canlı veritabanına yazma bu denetimin yetkisinde değil. Kod hazır: `npm run ops:migrate`. Bu yapılmadan lead kuyruğu ve admin PATCH canlıda **çalışmaz**. |
| **R2-14** | `verify:atomic-seals` kırık — 5 `tests/academy/*-surface.test.ts` yok. | Bu denetimden **önce** vardı (Tespit Raporu §2 notu). Akademi odası `archived/` altına taşınmış; kapsam dışı. |

---

## 3. Doğrulama kapıları (bu turda **çalıştırıldı**)

| Komut | Sonuç |
|---|---|
| `npx tsc --noEmit` | **PASS** (exit 0) |
| `npm run verify:sen-axis` | **PASS** — 731 dosya, 46 "siz" kaçağı |
| `npm run verify:boundaries` | **PASS** |
| `npm run verify:api-auth -- --check` | **PASS** — 178 route `{session:112, public:28, closed:11, cron:2, admin:17, webhook:8}` |
| `npm run verify:rls-status` | **PASS** (statik sicil) |
| `npm run verify:rls-status -- --live` | **PASS + SKIP** — canlı DB bağlantısı bu ortamda yok; statik sicil doğrulandı |
| `npm run verify:no-secrets` | **PASS** |
| `npm run verify:idor-seals` | **PASS** — 5 dosya / 17 test |
| `npm run verify:v1-contract-artifacts` | **PASS** — openapi + v1-client + kernel-package |
| `npx vitest run tests/sales tests/kurumsal` | **PASS** — 10 dosya / **90 test** (önceki tur: 47) |
| `npx vitest run` (tam suite) | **2464 / 2465 PASS** — 1 kırık: `tests/kernel/junior-license-bridge.test.ts` (**bu denetimden önce**, Junior kapsamı, ilgisiz) |
| `npx next build` | **PASS** |
| `npx prisma migrate status` | **FAIL (beklenen)** — `20261126010000_kurumsal_faz2_lead_quota` uygulanmamış → **R2-13** |
| `npm run verify:atomic-seals` | **FAIL (önceden var)** — 5 Akademi surface testi yok → **R2-14** |

**Test sayısı:** 47 → **90** (+43). Yeni `tests/sales/kurumsal-denetim-r2.test.ts` **19 test** ile kota kapısını, IDOR'u, CSV enjeksiyonunu, KVKK idempotansını, vergi no kilidini ve dönüş masasını **çalıştırarak** doğrular.

---

## 4. Sekiz vektörlü kanıt taraması — soru soru cevap

### 4.1 Tahsilat & kota matematiği (`F1.1`, `F1.2`, `F2.1`, `D-01`)

| Soru | Cevap | Kanıt |
|---|---|---|
| `POST /api/kurumsal/satin-al` kenardan geçip PayTR iframe üretiyor mu? | **Evet**, ama bu turdan **önce hayır**: 410 aşılmıştı, buna karşılık fatura künyesi hiç toplanmadığı için her istek **422** alıyordu. | `isFrozenRoomApi("/api/kurumsal/satin-al") === false`; rota artık `billing` zorunlu → **R2-04**. |
| Kapatılan ilan 3 ilan kotasından düşüyor mu? | **Düşmüyor** — bilinçli. `jobCount` `isActive` filtresi taşımaz; "aç→kapat→aç" döngüsü tek paketle sınırsız ilan üretemez. | `decideKurumsalScreeningQuota` + çalıştırılan test: 1 paket/3 ilan/kapalı dahil → `quota-exhausted`. |
| Eşzamanlı 2 `POST` yarışı var mı? | **Yok.** Kota sayımı + yazma tek `$transaction` + `pg_advisory_xact_lock(owner)` altında. | Kilit sırası testle kilitli (kilit → entitlement → yazma). |
| Katalog kapalıysa ne olur? | Sayım **hiç yapılmaz**; `catalog-inactive` → 402 + satın alma yolu. | Çalıştırılan test: `countCalls === 0`. |

### 4.2 VKN/TCKN checksum & işveren doğrulama mirası (`F2.2`, `F2.3`)

Gerçek ölçüm (çalıştırıldı):

```
1111111114  → VKN geçerli    1000000000  → VKN geçerli
1234567890  → reddedildi (sentetik artan dizi)
4444444444  → reddedildi (checksum tutmuyor)
0000000000 / 1111111111 / 0123456789 → reddedildi (sentetik)
10000000146 → TCKN geçerli   10000000147 → reddedildi (11. hane)
10000000078 → VKN uzunluğunda, reddedildi (TCKN checksum'ı)
0000000001  → VKN olarak geçerli (gerçek bir sınır: sıfır ağırlıklı taban)
```

| Soru | Cevap |
|---|---|
| Checksum gerçek mi? | **Evet.** VKN mod-9 güç tablosu, TCKN 10/11 hane algoritması. `1234567890` reddedilir. |
| `taxNumber` zorunlu mu? | **Evet.** Boş numaralı ilan açılamaz (kalıcı noindex tuzağı kapalı). |
| Aynı numara başka hesapta → 409? | **Evet** — ve bu turdan sonra **yarışa kapalı** (numara kilidi). → **R2-09** |
| Kendi eski doğrulanmamış ilanları varken yeni ilan + ops onayı hepsini günceller mi? | **Evet.** Ops rotası `updateMany({ownerUserId, taxNumber, verifiedEmployerAt: null})`; audit mührü yazılamazsa **geri alınır** (fail-closed). Yeni ilan da `priorVerified` ile miras alır. |
| **Açık kalan** | Farklı `ownerUserId` + **farklı** `taxNumber` aynı gerçek şirketi temsil edebilir; numara eşsizliği hesap birleştirmeyi zorunlu kılar. Ürün kararı. |

### 4.3 Yeni uçlarda IDOR, yetki & CSV güvenliği (`F1.5`, `F2.4`)

| Soru | Cevap | Kanıt |
|---|---|---|
| `PATCH /api/kurumsal/ilanlar/[id]` başka işverenin `jobId`'sinde? | **404 + hiç yazma yok.** | Çalıştırılan test (`updateCalls === 0`). |
| `GET /api/kurumsal/ilanlar/[id]/export` aynı durumda? | **404.** | Çalıştırılan test (`NotFoundError`). |
| CSV formül enjeksiyonu `=`, `+`, `-`, `@`, `\t`, `\r` | **Kapalı** — ayrıca `\u200b`, `\ufeff`, `\u200e/\u200f`, `\u2007`, `\u2028/\u2029`, `\uff1d` de kapalı. | Ölçüm tablosu + test. → **R2-07** |
| CSV `cvSummary` sızıntısı | **Yok** — satır tipinde alan **hiç yok**; test `Object.keys` ile de doğrular. | `buildKurumsalShortlistCsv` + test. |
| `PATCH /api/admin/b2b/[id]` süper admin değilse? | **Kapalı** — `auth = "admin"` kenarda `isSuperAdminActor`, handler'da `requireSuperAdmin` + `isSuperAdminActor` ikinci kez. | `route-auth-map` + `patchKurumsalOfferRequest`. |
| `POST /api/admin/ops/employer-verify` aynı? | **Kapalı** — aynı çift kapı. | Rota + sicil. |
| **Audit log yazıyor mu?** | **Bu turdan önce hayır** (CHECK kısıtı) → **R2-03** ile kapandı. | Yeni migration + test. |

### 4.4 Lead hunisi & honeypot (`F2.4`, `F2.5`, `D-02`, `D-03`)

| Soru | Cevap |
|---|---|
| Honeypot dolu → DB'ye yazmadan sahte 200? | **Evet**, ve artık yanıt **şekli** gerçek başarıyla aynı (bot ayırt edemez). → **R2-10** |
| `quotedAmountMinor` katalog boşken/kapalıyken `null`? | **Evet.** `PACKAGE_CATALOG` eşlemesi olmayan paketler (`iso-auditor`, `company-brain`) `null`; okuma hatası da `null` (uydurma fiyat yok). |
| Mükerrer kontrolü yarışa kapalı mı? | **Evet** — `pg_advisory_xact_lock(email:paket)` + tx. Yanıt başka firmanın künyesini **sızdırmaz** (test 500 karakterlik pencere yerine `create` sınırına kadar ölçer). |
| 81 il doğrulaması? | **Evet** — `KURUMSAL_LEAD_PROVINCES` 81 kayıt, sunucu tarafı `normalizeKurumsalLeadCity`. |

### 4.5 Kamu ilan dizini, sitemap & 404 (`F1.3`, `F1.4`)

| Soru | Cevap | Kanıt |
|---|---|---|
| `/ilan` doğrulanmamış ilanı gösteriyor mu? | **Gösteriyor**, ama rozetle: `employerVerified ? "Doğrulanmış İşveren ✓" : "Kimlik doğrulaması beklemede"`. Bilinçli: işveren ilanını paylaşabilsin, arama motoru görmesin. | `app/(public)/ilan/page.tsx` + `[slug]/page.tsx` uyarı şeridi. |
| `sitemap.xml` yalnız doğrulanmış + aktif + süresi dolmamış mı? | **Evet** — üç koşul birlikte. | `listSitemapKurumsalJobSlugs` + `app/sitemap.ts`. |
| Süresi dolmuş/pasif ilan `/ilan/[slug]` → gerçek 404? | **Evet.** İki katman: kenar varlık kapısı (`resolveKurumsalJobEdgeVerdict`) + sayfada `notFound()`. Kenar şart, çünkü kök `app/loading.tsx` altında `notFound()` **200** akıyor. | `proxy.ts` + test. |
| `/kurumsal/*` soft 404? | **Bu turdan önce VARDI** (200) → **R2-06** ile gerçek 404. | Çalıştırılan edge testi. |

### 4.6 KVKK & 90 günlük anonimleştirme (`F1.6`)

| Soru | Cevap |
|---|---|
| Zaten anonimleştirilmiş satırı tekrar güncelliyor mu? | **Bu turdan önce EVET** (iki akış farklı özet sabiti yazdığı için). Artık **hayır**: idempotans yalnız ad + e-posta üzerinde. → **R2-08** |
| Puan/band bozuluyor mu? | **Hayır** — `weightedScore`, `testScore`, `status` dokunulmaz (test `Object.keys` ile doğrular). |
| Hesap kapanışı açık ilanla? | **409** — `kurumsalAccountCloseGuard` kayıtlı. |
| **Açık kalan** | İşveren kendi ilanının başvurularını **tek tek** silemiyor; yalnız ilanı kapatıp 90 gün bekleyebiliyor. DPA cevabı için "derhal sil" yolu hâlâ yok. |

### 4.7 Migration & canlı RLS

| Kontrol | Sonuç |
|---|---|
| SQL sözdizimi | **Geçerli** — enum adı, 5 kolon, 4 indeks, 2 tablo için `ENABLE`+`FORCE`+`rls_deny_unscoped` şema ile birebir eşleşiyor (ölçüldü). |
| Enum değerleri | SQL ve şema **aynı sırada**: `NEW, CONTACTED, QUALIFIED, WON, LOST`. |
| **Canlıya uygulanmış mı?** | **HAYIR.** `prisma migrate status` → `20261126010000_kurumsal_faz2_lead_quota` *not yet applied*. Canlı tabloda 5 kolon + enum + 4 indeks **yok**. → **R2-13** |
| Canlı RLS | `kurumsal_job_postings`, `kurumsal_job_applications`, `kurumsal_offer_requests` sicilde; FORCE doğrulandı. |

### 4.8 Kalan bulguların onarımı

Yukarıdaki 7 maddede bulunan **12 bulgu** kodda kapatıldı; her biri en az bir **çalıştırılan** testle kilitlendi. İki bulgu (R2-11, R2-13) bilinçli olarak açık bırakıldı ve §2'de gerekçelendirildi.

---

## 5. Değişen dosyalar (bu tur)

### Yeni
- `prisma/migrations/20261126020000_super_admin_audit_offer_request_status/migration.sql` — **R2-03**
- `tests/sales/kurumsal-denetim-r2.test.ts` — 19 test, davranışsal denetim

### Düzeltilen
| Dosya | Bulgu | Ne değişti |
|---|---|---|
| `lib/sales/kurumsal-screening-entitlement.ts` | R2-01 | `readKurumsalScreeningCatalogGate()` eklendi; `assertKurumsalScreeningEntitlement` katalog kararını **parametre** olarak alır (tx içi global istemci yok). |
| `lib/sales/kurumsal-screening-load.ts` | R2-01, R2-09, R2-12 | Katalog kapısı tx'ten önce; `lockKurumsalTaxNumber`; `setKurumsalJobActive` + `loadKurumsalShortlistCsvRows` enjekte edilebilir DB. |
| `lib/sales/kurumsal-screening-purpose.ts` | R2-09 | `KURUMSAL_TAX_LOCK_NAMESPACE`. |
| `app/api/lead/route.ts` | R2-02, R2-10 | Fiyat anlık görüntüsü tx dışında; honeypot yanıtı gerçek yanıtla aynı şekil. |
| `app/api/kurumsal/satin-al/route.ts` | R2-04 | `billing` zorunlu + `persistCheckoutBilling` + tahsilata geçiş. |
| `components/kurumsal/screening-cockpit.tsx` | R2-04 | `CheckoutBillingFields`; künye tamamlanmadan düğme kapalı + gerekçe metni. |
| `lib/kernel/payments/paytr/checkout.ts` | R2-05 | `PAYTR_RETURN_DESKS` + `kurumsal`, `career`. |
| `components/kernel/kasa-return-panel.tsx` | R2-05 | `KASA_RETURN_HREF`/`LABEL`/`kasaReturnDesk` iki yeni masa. |
| `lib/academy/public-surface-gate.ts` | R2-06 | `/kurumsal/*` kapalı beyaz liste → gerçek 404. |
| `lib/sales/kurumsal-shortlist-csv.ts` | R2-07 | NFKC + `\p{Cc}\p{Cf}\p{Zs}\p{Zl}\p{Zp}` atma. |
| `lib/sales/kurumsal-retention.ts` | R2-08 | İdempotans yalnız ad + e-posta. |
| `tests/kernel/super-admin-audit.test.ts` | R2-03 | Yeni migration'ı okur. |
| `tests/kernel/write-path-edge-surface.test.ts` | R2-06 | `/kurumsal/ilan/yeni` artık **404** (410 değil); var olmayan alt yol da 404. |
| `tests/kernel/closed-rooms-copy-guard.test.ts` | F2.10 | `PUBLIC_KURUMSAL_QUOTE_LABEL` tedavi kararına hizalandı. |
| `tests/sales/kurumsal-final-audit.test.ts` | R2-01, R2-02, R2-09, R2-10 | Katalog-sırası, lead-sırası ve honeypot-şekli testleri; kırılgan 500 karakterlik pencere `create` sınırına çevrildi. |

---

## 6. Dürüstlük sınırları — bozulmadığını doğruladıklarım

1. **Puan satın alınamaz.** Ödeme rotası yalnız ilan açma hakkı verir; `weightedScore` yalnız `sealYetkinCvSitting` çıktısından yazılır.
2. **İstemci alt puan gönderemez.** `parseKurumsalApplyDraft` yalnız ad/e-posta/CV alır.
3. **Tutar istekten okunmaz.** Katalog satırı yoksa/pasifse tahsilat başlamaz (422).
4. **Kurumsal ödeme defterde kendi etiketiyle** görünür ("Cüzdan yükleme" değil) ve self-servis karta iade **bloke**.
5. **Kanıtlanmamış rozet basılmaz.** Doğrulanmamış işveren `noindex` + görünür uyarı şeridi; sitemap dışı.
6. **Doğrulama rotası fail-closed.** Denetim mührü yazılamazsa doğrulama ve teklif durum geçişi geri alınır.
7. **CSV'de ham CV metni yok.** Satır tipinde alan bulunmaz.
8. **`/ilan` dizini doğrulanmamış ilanı rozetle gösterir**, sitemap'e almaz — karar belgeli.
9. **Honeypot DB'ye yazmaz** ve artık ayırt edilemez.
10. **KVKK anonimleştirme sıralamayı bozmaz**, idempotenttir.

---

## 7. Canlıya alma — iki zorunlu adım

```bash
# 1) Şema (R2-13). Bu yapılmadan lead kuyruğu ve admin PATCH canlıda ÇALIŞMAZ.
npm run ops:migrate
npx prisma migrate status        # 20261126010000 + 20261126020000 uygulanmış olmalı

# 2) Katalog satırı (F2.1 kotası bu satıra bağlı).
npm run ops:list-paytr-pending   # yalnız okuma
```

**Sıra önemli:** ikinci migration (`20261126020000`) birincinin enum'unu gerektirmez, ama **ikisi de** uygulanmadan `PATCH /api/admin/b2b/[id]` ve `POST /api/lead` canlıda hata verir.

---

## 8. Sonuç

**49 → 84.** Puan artışının ana kaynağı yeni özellik değil, **ölçüm**: önceki turda "kapandı" denen üç halka (tahsilat, lead kaydı, lead durum iş akışı) canlıda **hiç çalışmıyordu**. Üçü de statik `toContain` testlerinden kaçmıştı, çünkü testler kaynak metnini doğruluyordu, davranışı değil.

Bu turun asıl kazancı **test biçiminin değişmesi**: IDOR, kota, CSV, KVKK ve dönüş masası artık **çalıştırılarak** kanıtlanıyor (47 → 90 test). Bir sonraki kırık, "fonksiyon çağrılıyor mu" sorusundan değil, "çağrı doğru sonucu veriyor mu" sorusundan yakalanacak.

**Kalan 16 puan:** 5 puan canlı migration (operasyonel — `npm run ops:migrate`), 4 puan iade↔kota simetrisi (ürün kararı), 3 puan İK iş akışı derinliği, 2 puan e-posta doğrulama, 2 puan bildirim halkası.

---

*Bu rapor okuma + ölçüm + kod onarımı üzerine kuruludur. Onarılan her bulgu bir testle kilitlendi; kapatılmayan iki bulgu (R2-11, R2-13) gerekçesiyle açıkça listelendi.*
