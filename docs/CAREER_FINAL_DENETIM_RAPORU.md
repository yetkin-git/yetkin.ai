# CAREER_FINAL_DENETIM_RAPORU — Kariyer / YetkinCV / Kurumsal Ekosistemi Yeniden Denetimi

**Denetim kapsamı:** `app/career`, `app/(public)/uzmanlar`, `app/(public)/kurumsal`, `app/(public)/ilan`, `app/(public)/vize`, `app/api/career`, `app/api/kurumsal`, `app/api/ilan`, `components/career`, `components/kurumsal`, `lib/career`, `lib/sales`, `prisma/schema/{career,b2b,kernel}.prisma`, `prisma/migrations/*`, ilgili `lib/kernel/payments|ledger|security` yüzeyleri, `tests/career`, `tests/sales`, `tests/kurumsal`.

**Denetim tarihi:** 24 Kasım 2026
**Rol:** Baş Denetçi (Principal Auditor) / CTO
**Yöntem:** Önceki raporun (`CAREER_TESPIT_RAPORU.md`) ve tedavi raporunun (`CAREER_TEDAVI_RAPORU.md`) her iddiası `dosya:satır` üzerinden yeniden açıldı. **Hiçbir "yapıldı" beyanı kabul edilmedi**; iddia çalıştırılmış kanıtla veya kod okumasıyla sınandı. Bulunan kusurlar raporlanmakla bırakılmadı — **bizzat kodlanarak kapatıldı** ve regresyon mührüyle kilitlendi.

**Bu oturumun tek cümlelik hükmü:** Tedavi raporunun kapattığını söylediği K1–K4 ve Y1–Y9 bulgularının **büyük çoğunluğu gerçekten kapalıdır**; ancak tedavi sürecinin kendisi **beş yeni P0 kusuru** üretmiştir — ikisi **para kaybı**, biri **ürünün tamamen çalışmaması**, biri **satılamayan ürün**, biri **kazanılamayan rozet**. Bu beş kusur bu raporla kapatılmıştır.

---

## 0. Doğrulama Kapıları — Bu Oturumda Çalıştırılmış Sonuçlar

Tüm komutlar `d:\yetkin.ai` kökünde, `main` dalında, bu oturumun düzeltmeleri **uygulandıktan sonra** koşuldu.

| # | Kapı | Komut | Sonuç | Kanıt |
|---|---|---|---|---|
| 1 | Tip | `npx tsc --noEmit` | **PASS** | `error TS` satırı yok (`TSC_EXIT=0`) |
| 2 | Sen aksi | `npm run verify:sen-axis` | **PASS** | `verify:sen-axis OK — 725 dosya, 46 siz kaçağı tarandı` |
| 3 | Sınırlar | `npm run verify:boundaries` | **PASS** | `verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, … web-only yazma sayımı kapalı` |
| 4 | API yetki | `npm run verify:api-auth -- --check` | **PASS** | `OK — 175 route. {"session":110,"public":28,"closed":11,"cron":2,"admin":16,"webhook":8}` |
| 5 | RLS | `npm run verify:rls-status` | **PASS (statik)** | `OK — FORCE RLS + owner SELECT + kapsamsız deny`; tüm kariyer/kurumsal tablolar sicilde |
| 6 | Sır | `npm run verify:no-secrets` | **PASS** | `OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok` |
| 7 | IDOR | `npm run verify:idor-seals` | **PASS** | `Test Files 5 passed (5) / Tests 17 passed (17)` |
| 8 | Kariyer+Kurumsal test | `npx vitest run tests/career tests/sales/kurumsal-screening.test.ts tests/sales/employer-verify-and-bands.test.ts` | **PASS** | `Test Files 28 passed (28) / Tests 155 passed (155)` |
| 9 | Build | `npx next build` | **PASS** | `BUILD_EXIT=0`; yeni rotalar manifestte |
| 10 | **Tam suite** (ek) | `npx vitest run` | **PASS** | `Test Files 415 passed (415) / Tests 2393 passed (2393)` |

### 0.1 Kapı sonuçlarının dürüst yorumu

- **Kapı 5 hâlâ "canlı DB'de FORCE RLS açık" demek değildir.** Script kendi başlığında statik olduğunu yazar (`scripts/verify-rls-status.ts:3-4`). Doğrulanan şey **sicil ↔ Prisma model eşitliği**dir. Bu oturumda da `pg_class.relrowsecurity` sorgulanmadı; `--live` yolu kodda hazırdır ama `DATABASE_URL` olmadan **SKIP** eder (bkz. §5).
- **Kapı 9'un ilk koşusu kritik bir şeyi kanıtladı:** yeni eklenen `POST /api/kurumsal/satin-al` ve `POST /api/admin/ops/employer-verify` rotaları **derlenmiş manifestte** görünür (`/api/kurumsal/satin-al`, `/api/admin/ops/employer-verify`). Yani bu rotalar kâğıt üzerinde değil, çalışan üretim yüzeyidir.
- **Kapı 10 bu oturumda ilk kez tam suite koştu.** 415 dosya / 2393 test yeşil. Bu, düzeltmelerimin kariyer dışındaki 2400 testi kırmadığını kanıtlar.
- Yeşil kapılar bu raporun P0 bulgularının **hiçbirini** çürütmez. Beş bulgunun dördü iş kuralı/para hatasıdır; kapılar "kod kırılmadı" der, "ürün doğru" demez. Nitekim **sınav hiç açılmıyordu** ve `tsc`, `verify:api-auth`, `verify:boundaries` ve 131 kariyer testi bu sırada **yeşildi**.

---

## 1. Bu Oturumda Kapatılan P0 Bulguları

> Aşağıdaki beş bulgu önceki iki raporda **yok**. Hepsi tedavi sürecinin yan etkisi veya gözden kaçmış bağlantı noktasıdır. Her biri kod + test ile kapatıldı.

### P0-M1 — **YetkinCV yayını ve kurumsal paket bedeli "cüzdan yüklemesi" sayılıyordu; ürün nakit iadeye açıktı**

**Bu raporun en pahalı bulgusu.** İki ürün de PayTR ile gerçekten tahsil ediliyordu, ama `PaymentOrderPurpose` enum'unda karşılıkları **yoktu**. Zincir şöyle kırılıyordu:

1. `classifyPaymentOrderPurpose("career-license:yetkincv-publication")` → `null`.
2. `ledgerCreditLineForOrder` sınıflayamadığı niyeti **"wallet-top-up"** sayıp CREDIT'i **"Cüzdan yükleme"** etiketiyle yazıyordu → ürün geliri ölçülemiyor, defterde ürün yok.
3. `isActivatedProductRefundBlocked` → `false`, SQL iade kovası (`prisma-wallet-card-refund.ts:56-70`) bu `purpose`'ı **elemiyordu** → müşteri **satın aldığı yayını** self-servis **nakit iadeye** konu edebiliyordu. Ürün elde kalıyor, para geri gidiyor.

**Çalıştırılmış kanıt (düzeltme öncesi):**

```text
classify=null
line=wallet-top-up
refundBlocked=false
```

**Düzeltme (çalıştırılmış kanıt, sonrası):**

```text
career-license:yetkincv-publication | kind=CAREER_PUBLICATION | ledger=career-publication | refundBlocked=true
kurumsal-license:job-screening-pack | kind=KURUMSAL_SCREENING | ledger=kurumsal-screening | refundBlocked=true
wallet-top-up                     | kind=WALLET_TOPUP       | ledger=wallet-top-up      | refundBlocked=false
```

**Değişen dosyalar:**

| Dosya | Değişiklik |
|---|---|
| `lib/kernel/payments/order-purpose.ts` | `PAYMENT_ORDER_PURPOSE.CAREER_PUBLICATION` + `KURUMSAL_SCREENING`; `LEGACY_PURPOSE` iki dizgi eşlemesi; `classifyPaymentOrderPurpose` iki yeni kod; `CAREER_PUBLICATION_LEDGER_PURPOSE` = `"career-publication"`, `KURUMSAL_SCREENING_LEDGER_PURPOSE` = `"kurumsal-screening"`; `ledgerCreditLineForOrder` iki dal; `isActivatedProductRefundBlocked` iki kod (iade kapalı) |
| `lib/kernel/ledger/credit-purposes.ts` | `LEDGER_PRODUCT_CREDIT_PURPOSES` iki yeni etiket — **eksik olsaydı `appendLedgerEntry` fırlatır, para alınır ama sipariş CLEARED olmazdı** |
| `lib/kernel/payments/prisma-wallet-card-refund.ts` | `listClearedOrders` SQL'i iki niyeti hem `purpose` hem `order_purpose` üzerinden eler (uygulama kapısı tek başına yetmez; gerçek infaz SQL'dedir) |
| `lib/kernel/payments/clearing.ts` | İşlem bildirimi bu iki niyeti `product_paid` sayar (`wallet_cleared` değil) |
| `prisma/schema/kernel.prisma` | `enum PaymentOrderPurpose` iki yeni değer |
| `prisma/migrations/20261124180000_career_kurumsal_payment_purpose/migration.sql` | **Yeni** — `ALTER TYPE … ADD VALUE IF NOT EXISTS` ×2 |

**Mühür:** `tests/career/reaudit-p0-seals.test.ts` → `P0-M1` (6 test). Defter etiketinin `wallet-top-up` **olmadığını**, iade kapısının **kapalı** olduğunu ve SQL kovasının aynı niyetleri elediğini kilitler.

---

### P0-M2 — **Kurumsal paket satılamıyordu: kapı kapanmış, anahtar üretilmemişti**

Önceki raporun **K2** bulgusu "ödeme kapısı yok" diyordu; tedavi `assertKurumsalScreeningEntitlement` ekleyip ilan açmayı **402 ile kapattı**. Ama lisans **yalnız CLEARED bir sipariş** ile doğuyor ve o siparişi üreten **rota yoktu** (`app/api/kurumsal/` altında tek dosya: `ilanlar/route.ts`).

Sonuç: kapı kapanmış, anahtar hiç üretilmemişti → **ürün pratikte hiç satılamıyordu**. Üstelik vitrin etiketi katalogda gerçek bir tutar varken hâlâ **"Kurumsal Tanımlama"** (ön talep) basıyordu.

**Düzeltme:**

| Dosya | Değişiklik |
|---|---|
| `app/api/kurumsal/satin-al/route.ts` | **Yeni** — `placeSingleCatalogPurchase` ile `kurumsal/job-screening-pack` tahsilatı. Tutar istekten okunmaz (katalogdan). `session` + `checkoutUser` hız sınırı + `Idempotency-Key` + kasa rızası zorunlu. Katalog kapalıysa 422 + dürüst ön talep yönlendirmesi |
| `lib/kernel/http/web-only-write-routes.ts` | `product-kurumsal-screening-purchase` sicil satırı (`product-write`) |
| `lib/sales/kurumsal-offers.ts` | `jobScreening` artık **katalogdan** okunur: satır aktifse `honesty: "live"` + gerçek tutar; yoksa ön talep. Sabit "Kurumsal Tanımlama" yalanı kalktı |

**Kapı gevşetilmedi:** `assertKurumsalScreeningEntitlement` + `PaymentRequiredError` yerinde (`lib/sales/kurumsal-screening-load.ts:121-130`). Test bunu ayrıca doğrular.

**Mühür:** `reaudit-p0-seals.test.ts` → `P0-M2` (3 test).

---

### P0-S1 — **YetkinCV sınavı hiç açılmıyordu (strictObject + `action` çakışması)**

Önceki tedavi, O8 için Zod `strictObject` şemaları ekledi. Ama istemci gövdeye bir **yönlendirme anahtarı** koyuyor:

```68:68:components/career/yetkincv-station.tsx
      const data = await post({ action: "start", roleId, verticalId, cvText });
```

`strictObject` bilinmeyen anahtarı reddeder. Yani **her `start` isteği** düşüyordu.

**Çalıştırılmış kanıt (düzeltme öncesi):**

```text
START={"ok":false,"error":"Hedef pozisyon ve uzmanlık listeden seçilir."}
SUBMIT={"ok":false,"error":"İstek gövdesi okunamadı."}
```

Bu, ekosistemin **amiral gemisi ürününün tamamen ölü** olduğu anlamına gelir: sınav açılmaz → mühür doğmaz → `/vize` kartı yok → dizin boş → B2B eleme puanı yok. Buna rağmen `tsc`, `verify:api-auth`, `verify:boundaries` ve **131 kariyer testi yeşildi**; çünkü testler parser'ı `action` **olmadan** çağırıyordu.

**Düzeltme (`lib/career/yetkincv.ts`):**

```ts
export const yetkinCvStartSchema = z.strictObject({
  action: z.literal("start").optional(),
  roleId: z.enum(yetkinCvRoleIds),
  …
```

`action` **doğrulanır**, yok sayılmaz: `action: "submit"` gönderen bir `start` isteği yine reddedilir.

**Çalıştırılmış kanıt (sonrası):**

```text
START_WITH_ACTION=true
SUBMIT_WITH_ACTION=true
SUBMIT_NO_ACTION=true
WRONG_ACTION_REJECTED=true
```

**Mühür:** `reaudit-p0-seals.test.ts` → `P0-S1` (5 test). İstemcinin gerçek gövdesini, geriye dönük uyumu ve "yanlış action yine reddedilir" kuralını birlikte kilitler.

---

### P0-M3 — **290 TL'lik yayın ürünü hiç satılamıyordu: rota vardı, çağıran yoktu**

`POST /api/career/yetkincv/purchase` yazılmış, katalog birimi açılmış, PayTR kancası bağlanmış (`lib/career/register-paytr-license-hook.ts`), hatta `license_gap` taraması bu niyeti izliyordu. **Ama hiçbir istemci bu rotayı çağırmıyordu.** CTA yalnız bir sayfa bağlantısı basıyordu:

```32:32:components/career/yetkincv-publication-cta.tsx   // düzeltme öncesi
  const href = (signedIn ? "/career#yetkincv" : `/register?next=%2Fcareer%23yetkincv`) as Route;
```

Yani kullanıcı "Yayını aç" diyor, kariyer sayfasına düşüyor, orada ödeme başlatan hiçbir düğme yok. **Ürün sıfır gelir üretiyordu** — K2'nin kariyer tarafındaki ikizi.

**Düzeltme (`components/career/yetkincv-publication-cta.tsx`):** CTA artık gerçek tahsilat başlatır — kasa rızası onay kutusu, `Idempotency-Key`, `POST /api/career/yetkincv/purchase`, PayTR iframe. `settled` dönerse (idempotent tekrar) sayfa tazelenir ve **ikinci kez ücret alınmaz**. `published` prop'u ikinci satın almayı kapatır. Misafirde ödeme yerine giriş bağlantısı basılır (mühür bir hesaba bağlıdır).

`app/(public)/vize/[id]/page.tsx` artık `published={seal.published}` geçirir.

**Mühür:** `reaudit-p0-seals.test.ts` → `P0-M3` (3 test).

---

### P0-V1 — **İşveren doğrulama rozeti hiçbir zaman kazanılamıyordu**

`/ilan/[slug]` sayfası `robots: index` kararını `job.verifiedEmployerAt != null` üzerinden verir (`app/(public)/ilan/[slug]/page.tsx:45-48`); doğrulanmamış ilan **noindex** + "Kurumsal kimlik doğrulaması beklemede" şeridi alır. Ama bu kolonu **yazan tek bir yol yoktu** (grep: yalnız `create` sırasında `null` yazımı ve okuma). Yani Y1 düzeltmesi bir **kilit** kurdu ve **anahtarını üretmedi**: hiçbir ilan arama motoruna giremiyordu.

**Düzeltme:**

| Dosya | Değişiklik |
|---|---|
| `app/api/(kernel)/admin/ops/employer-verify/route.ts` | **Yeni** — süper yönetici mührü. `verifiedEmployerAt` yazar; vergi/MERSİS biçimi geçmezse **reddeder** (uydurma rozet yok); `writeSuperAdminAudit` yazılamazsa işlem **geri alınır** (fail-closed) |
| `lib/kernel/admin/ops-desk.ts` | `parseKurumsalEmployerVerifyBody` — gerekçe 8–500 karakter zorunlu, bilinmeyen anahtar reddi |
| `lib/kernel/admin/audit-log.ts` | `SUPER_ADMIN_AUDIT_ACTIONS` += `"employer_verify"` |
| `prisma/migrations/20261124190000_super_admin_audit_employer_verify/migration.sql` | **Yeni** — `super_admin_audit_logs_action_known` CHECK kısıtı TS listesiyle hizalanır |
| `lib/kernel/http/web-only-write-routes.ts` | `admin-ops-employer-verify` sicil satırı |

**Dürüstlük sınırı korundu:** otomatik sicil sorgusu yoktur; operatör numarayı resmî kaynaktan karşılaştırır ve gerekçeyi yazar. Numara biçimsel olarak geçersizse rozet basılmaz.

---

## 2. Bu Oturumda Kapatılan P1 Bulguları

### P1-1 — Kamuya açık doğrulama ucu, HMAC uyuşmazken `valid: true` diyordu

```typescript
// düzeltme öncesi — lib/career/yetkincv-store.ts
// Geçerli mühür = satır var. hmacValid ayrı alan; imzasız eski satırda false.
return { valid: true, … hmacValid: hmac.valid, … };
```

Bu, üçüncü taraf işverene **bozulmuş veya hiç imzalanmamış** bir kaydı "geçerli mühür" diye sunuyordu. `valid` alanını okuyup `hmacValid`'a bakmayan her istemci yanılırdı — ki doğru okuma biçimi tam olarak `valid`'dır.

**Düzeltme:** `valid: hmac.valid`. Ayrıca `signatureState: "signed" | "unsigned" | "tampered"` eklendi; eski (Faz 2 öncesi) satırlar artık `valid: false` + `unsigned` olarak **dürüstçe** raporlanır — sessizce "geçerli" sayılmaz. `GET /api/career/verify/[hash]` bu alanı istemciye taşır.

### P1-2 — Kurumsal başvurular ücretsiz sınav hakkını sessizce tüketiyordu

Deneme sayacı `verticalKey` bazında **tüm** `yetkin_cv_sittings` satırlarını sayıyordu (`lib/career/yetkincv-store.ts:126-140`). Kurumsal başvuru oturumları da aynı `verticalKey` altına yazıldığı için **üç şirket başvurusu = ücretsiz sınav hakkı bitti**.

**Düzeltme:** sayaç yalnız **serbest** oturumları sayar:

```ts
kurumsalApplication: { is: null },
```

### P1-3 — Kurumsal teslim cap'i banka eşitti; tek yeni soru teslimi kırardı

`yetkinCvSubmitSchema` cevap listesini `max(12)` ile sınırlıyordu. Kurumsal yol ilanın seçtiği **tüm** becerilerin sorularını sorar ve bu sayı bugün **tam 12**. Bankaya bir soru eklemek teslimi sessizce `"Cevap listesi geçersiz."` ile kırardı.

**Düzeltme:** `YETKINCV_SUBMIT_ANSWERS_MAX = 16` (başlık payı) + regresyon testi bank ≤ cap ilişkisini kilitler.

### P1-4 — `GET/POST /api/career/portfolio` hız sınırı taşımıyordu

Diğer tüm kariyer rotaları `HTTP_RATE_LIMITS.careerUser` kullanırken bu rota sınırsızdı (her çağrı `syncCareerVisaStamps` + `projectLiveCareerBoard` yazar/okur).

**Düzeltme:** `GET` ve `POST` aynı kovaya alındı; `jsonFromUnknown` çağrılarına `requestId` eklendi.

### P1-5 — Kariyer → YetkinCV çatı hiyerarşisi kodda uygulanmış, testte kalmıştı

`lib/dronlar/kayit.ts` kariyer odasını `label: "Kariyer"` / `blurb: "YetkinCV, vize ve açık ilanlar"` olarak taşıyor (çatı = Kariyer, ürün = YetkinCV), ama `tests/kernel/constitution-surfaces.test.ts:68-70` hâlâ eski metni bekliyordu ve **kırmızıydı**. Yani hiyerarşi "yapıldı" denmiş, sözleşmesi güncellenmemişti.

**Düzeltme:** test hem `label` hem `blurb` üzerinden yeni hiyerarşiyi kilitler.

---

## 3. Önceki Raporun Bulguları — Kanıtla Yeniden Denetim

Aşağıdaki her satır bu oturumda **koddan yeniden doğrulandı**, tedavi raporunun beyanına güvenilmedi.

### 3.1 Kritik (K1–K4)

| ID | Tedavi beyanı | **Denetim sonucu** | Kanıt |
|---|---|---|---|
| **K1** | Cevap anahtarı dağıtıldı | **GERÇEKTEN KAPALI** | Bank 25→**60** soru (5×12); `correctIndex` dağılımı her dikeyde `[3,3,3,3]`, `maxShare=0.25` (eşik 0.40). "Hep ikinci şık" stratejisi 8 soruluk oturumda **25 / 25 / 37 / 25 / 12** üretir (100 değil). Şık sırası oturum başına deterministik Fisher–Yates ile karışır, `correctIndex` kamu sorusuna hiç gitmez |
| **K2** | `job-screening-pack` entitlement → 402 | **YARIM KAPALIYDI → bu oturumda kapatıldı** | Kapı gerçekten vardı (`assertKurumsalScreeningEntitlement`) ama **lisans üreten rota yoktu** → ürün satılamıyordu. **P0-M2** |
| **K3** | `CareerCv` modeli + editör | **KAPALI** | `prisma/schema/career.prisma:52-72` (`CareerCv`, 11 alan + `contactOptInAt`); `lib/career/cv-model.ts` alan doğrulaması; `components/career/career-cv-editor.tsx` gerçek form; `PUT /api/career/cv` |
| **K4** | Yalnız `sealedPublication` dizine girer | **KAPALI** | `lib/career/talent-directory-load.ts:77` → `where: { sealedPublication: true }`. Ücretsiz mühür `/vize` sayfası ayrıca `noindex` (`app/(public)/vize/[id]/page.tsx:111`) |

### 3.2 Yüksek (Y1–Y9)

| ID | Denetim sonucu | Kanıt |
|---|---|---|
| **Y1** | **KAPALI** (rozet yolu bu oturumda eklendi — **P0-V1**) | `parseKurumsalJobDraft` vergi no doğrular (`lib/sales/kurumsal-screening.ts:449`); doğrulanmamış ilan `robots: index:false` + uyarı şeridi; **başvuru e-postası oturum e-postasıyla eşleşmek zorunda** (`lib/sales/kurumsal-screening-load.ts:350-356`) → başkası adına başvuru kapalı |
| **Y2** | **KAPALI** | `outputHash = sha256(outputContent)` (`lib/career/tezgah-portfolio.ts:34`); kamu kartında tezgâh kanıtı **ayrı ve etiketli** bölüm, sahte `visaStampId: featuredLive.id` bağı kaldırıldı (`lib/career/public-talent-load.ts:79-89`) |
| **Y3** | **KAPALI** | 3 deneme / 30 gün (`YETKINCV_MAX_ATTEMPTS`); oturumda 8 rastgele soru; `start`/`submit` hız sınırlı (`app/api/career/yetkincv/route.ts:21`) |
| **Y4** | **KAPALI — ama "valid" alanı yalan söylüyordu** → **P1-1** | `lib/career/seal-hmac.ts` HMAC-SHA256 + `timingSafeEqual`; `GET /api/career/verify/[hash]` public + rate-limit; `scripts/verify-career-seal.ts` sunucuya sormadan doğrular |
| **Y5** | **KAPALI** | `buildCareerCvPdf` / `buildCareerCvDocx` (`lib/career/cv-document.ts:65,69`), Türkçe glif motoru (`lib/yetkinhibe/plain-pdf.ts` — `ÇĞİÖŞÜ` tabloda); `GET /api/career/cv/export?format=pdf\|docx`; editörde "PDF İndir"/"DOCX İndir" |
| **Y6** | **KAPALI** | `CareerVisaSourceKind.YETKINHIBE_PROJECT`; `attachHibeApplicationAsCareerProof` IDOR korumalı (`proof.userId !== userId` → 403); `POST /api/career/hibe-proof` idempotent |
| **Y7** | **KAPALI** | `eraseCareerPersonalData` (`lib/career/cv-privacy.ts`) — CV, mühür, oturum, portföy, iletişim silinir; kurumsal başvuruda ad/e-posta/CV **anonimleştirilir** (sıralama bozulmaz). `DELETE /api/career/privacy` |
| **Y8** | **KAPALI** | `buildJobPostingJsonLd` (`lib/copy/json-ld.ts:319`) → `/ilan/[slug]`; `buildTalentDirectoryJsonLd` (`ItemList` + `Person` + `hasCredential`) → `/uzmanlar`; `buildCredentialJsonLd` → `/vize/[id]` |
| **Y9** | **KAPALI** | Rıza kaydı `contactOptInAt`; iletişim formu e-posta **hiç basmaz** (`app/api/career/contact/route.ts`), rıza yoksa **403**; görüşme daveti `PENDING/ACCEPTED/DECLINED` |

### 3.3 Orta (O1–O9)

| ID | Denetim sonucu | Kanıt |
|---|---|---|
| **O1** | **KAPALI** | İl filtresi artık `CareerCv.city`'den beslenir (`lib/career/talent-directory-load.ts:102-110`) |
| **O2** | **KAPALI** | `TALENT_DIRECTORY_TAKE_MAX = 200`, varsayılan 40, `page/pageSize` (`:16-48`); sınırsız `findMany` yok |
| **O3** | **KAPALI** | `yetkincv`, `visas`, `swot`, `pulse`, `desk`, `portfolio` (bu oturumda) hepsi `applyHttpRateLimit` taşır |
| **O4** | **KAPALI** | Kokpitte `data-candidate-claim-label="unverified"` + "Aday beyanı (doğrulanmamış metin)" (`components/kurumsal/screening-cockpit.tsx:401-403`) |
| **O5** | **KAPALI** | `isUniqueConflict` → `P2002` yakalanıp mevcut mühür döner (`lib/career/yetkincv-store.ts:294-310`) |
| **O6** | **KISMİ** — `--live` yolu kodda var, bu oturumda **SKIP** | `DATABASE_URL` yok. Canlı `pg_class.relrowsecurity` kanıtı **hâlâ yok** (§5) |
| **O7** | **KAPALI** | `listTezgahPortfolioForUser` (`lib/career/tezgah-portfolio.ts:66-75`); `/career` "Portföy Çıktıları" kartı (`app/career/page.tsx:212-222`) |
| **O8** | **KAPALI** | `yetkinCvStartSchema`/`yetkinCvSubmitSchema` Zod strict (bu oturumda `action` uyumu düzeltildi — **P0-S1**) |
| **O9** | **KAPALI** | `QUALIFIED_NOT_SHORTLISTED` bandı + `/career` durum kartı (`lib/career/application-status.ts`) |

---

## 4. Değişen Dosyalar

**Yeni dosyalar (5):**

| Dosya | Amaç |
|---|---|
| `app/api/kurumsal/satin-al/route.ts` | **P0-M2** — kurumsal paket PayTR tahsilatı |
| `app/api/(kernel)/admin/ops/employer-verify/route.ts` | **P0-V1** — işveren kimlik doğrulama mührü |
| `prisma/migrations/20261124180000_career_kurumsal_payment_purpose/migration.sql` | **P0-M1** — enum genişletme |
| `prisma/migrations/20261124190000_super_admin_audit_employer_verify/migration.sql` | **P0-V1** — denetim eylemi kısıtı |
| `tests/career/reaudit-p0-seals.test.ts` | 24 regresyon mührü |

**Değişen dosyalar (14):** `lib/career/yetkincv.ts`, `lib/career/yetkincv-store.ts`, `components/career/yetkincv-publication-cta.tsx`, `app/(public)/vize/[id]/page.tsx`, `app/api/career/verify/[hash]/route.ts`, `app/api/career/portfolio/route.ts`, `lib/kernel/payments/order-purpose.ts`, `lib/kernel/ledger/credit-purposes.ts`, `lib/kernel/payments/prisma-wallet-card-refund.ts`, `lib/kernel/payments/clearing.ts`, `lib/sales/kurumsal-offers.ts`, `lib/kernel/admin/audit-log.ts`, `lib/kernel/admin/ops-desk.ts`, `lib/kernel/http/web-only-write-routes.ts`, `prisma/schema/kernel.prisma`, `lib/kernel/http/openapi-v1.json` (üretilmiş), `tests/kernel/super-admin-audit.test.ts`, `tests/kernel/constitution-surfaces.test.ts`. `lib/kernel/security/route-auth-map.ts` (üretilmiş).

---

## 5. Denetimin Sınırları (dürüstlük beyanı)

1. **Canlı veritabanına bağlanılmadı.** "FORCE RLS açık", "kaç mühür yayınlı", "kaç kurumsal lisans satıldı" gibi **veri durumu** soruları cevaplanmadı. Yalnız **kod ve şema durumu** denetlendi. `verify:rls-status` statiktir; `--live` bu oturumda `DATABASE_URL` olmadığı için SKIP.
2. **Göçler uygulanmadı.** İki yeni migration yazıldı ve içerikleri testle kilitlendi, ancak `prisma migrate deploy` çalıştırılmadı. Üretimde **uygulanmaları gerekir**; özellikle `20261124180000` olmadan `order_purpose` yeni değerleri taşıyamaz ve CLEARED yazımı patlar.
3. **Tarayıcı/e2e koşulmadı.** CTA'nın PayTR iframe'i, `/career` sınav akışı ve `/ilan` başvuru formu kod düzeyinde doğrulandı; gerçek tarayıcıda uçtan uca denenmedi.
4. **`npx next build` PASS**, tam suite **2393/2393 PASS**. Ancak bu oturum öncesi `constitution-surfaces` ve `verify-v1-contract` testleri kırmızıydı; ikincisi `openapi-v1.json` yeniden üretilerek, birincisi hiyerarşi sözleşmesi güncellenerek kapatıldı. Bu iki kırıklık **bu oturumdan önce** de vardı (tedavi raporunun "tüm kapılar yeşil" beyanı bu iki test için yanlıştı).
5. **Puan kartı verilmedi.** Önceki rapor "89/100" diyordu. Bu denetim, o puanın dayandığı iki ürünün (290 TL yayın, kurumsal paket) **hiç satılamadığını** ve sınavın **hiç açılmadığını** gösterdi. Puan vermek yerine ölçülebilir durum raporlandı: 5 P0 + 5 P1 kapatıldı, 10 kapı yeşil, 2393 test yeşil.

---

## 6. Kalan İş (bu oturumda kapatılmayanlar)

| # | İş | Neden kapatılmadı |
|---|---|---|
| 1 | `prisma migrate deploy` (2 yeni göç) | Canlı DB erişimi yok; üretim penceresi operatör kararı |
| 2 | `verify:rls-status --live` | `DATABASE_URL` gerekir |
| 3 | Kurumsal teklif formu (`/api/lead`) → lisans üretimi | Bugün yalnız `kurumsal_offer_requests` satırı açar; satışın elle operatör köprüsü gerektirmesi tasarım tercihi olarak bırakıldı (self-servis kasa **P0-M2** ile açıldı) |
| 4 | Aday bildirim hattı (kısa liste / baraj altı e-posta) | O9'un bant kısmı kapalı; bildirim gönderimi ayrı iş (mail altyapısı + şablon) |
| 5 | Dizin materyalize hücresi (`directory_cells`) | O2 sayfalama ile kapandı; 1.000 satır p95 ölçümü canlı DB ister |

---

## 7. Kapanış

Önceki iki raporun en tehlikeli ortak yanı şuydu: **"yapıldı" beyanları yeşil kapılarla destekleniyordu, ama kapılar ürünü değil kodu ölçüyordu.** Bu oturumun kanıtı bunun en net örneğidir — sınav hiç açılmazken `tsc`, `verify:boundaries`, `verify:api-auth` ve 131 kariyer testi yeşildi.

Bu raporla:

- **K1–K4** ve **Y1–Y9** kod düzeyinde **kapalı** (Y4'ün yalan söyleyen `valid` alanı dahil).
- **O1–O5, O7–O9** kapalı; **O6** canlı DB kanıtı bekliyor (bilinçli SKIP).
- Tedavi sürecinin ürettiği **5 P0** ve **5 P1** kusur kapatıldı; her biri `tests/career/reaudit-p0-seals.test.ts` içinde **24 mühürle** kilitlendi.
- 10 doğrulama kapısı yeşil; **415 test dosyası / 2393 test** geçiyor; `next build` temiz.

Geriye kalan tek zorunlu adım **göçlerin üretimde uygulanmasıdır**; onsuz yeni ödeme niyetleri DB'ye yazılamaz ve kapatılan para hatası yeniden açılır.
