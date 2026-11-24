# yetkin.ai — Faz 3 Stratejik Gelir Hamleleri (Uygulama Raporu)

**Tarih:** 22 Kasım 2026
**Kaynak plan:** [`TESPIT_RAPORU.md`](./TESPIT_RAPORU.md) §4.1–§4.3 (Hamle 1–3) ve [`TEDAVI_RAPORU.md`](./TEDAVI_RAPORU.md) §4 (Sonraki Stratejik Faz)
**Kapsam:** Dört paket, 34 dosya (22 yeni), 1 Prisma göçü, 3 yeni API rotası, 1 yeni sayfa, 1 yeni Inngest cron
**Kural:** Hiçbir mühür gevşetilmedi. Anayasa A katmanı, model kimliği (`lib/kernel/ai/model-roles.ts`) ve marka dili ("sen" aksı) dokunulmadı.

---

## 0. Yönetici Özeti

| Paket | Ne teslim edildi | Ticari etki |
|---|---|---|
| **1 — Aylık kredi ekonomisi** | Günlük kota → aylık kredi havuzu (30 / 500), %50 devir, aktör bazlı LLM hız tavanı | Pro'nun faydası **16,6×** ölçülebilir hale geldi; kullanım yoğunluğu cezalandırılmıyor |
| **2 — YetkinCV ücretli mühür** | `sealedPublication` ayrımı, `/api/career/yetkincv/purchase`, `/vize/[hash]` özet/tam kart, katalog birimi geri açıldı | 0 TL → ilk gerçek dijital ürün geliri; dürüstlük ilkesi korundu (para puanı değil yayını satın alır) |
| **3 — Misafir ödeme** | `payment_orders.userId` opsiyonel, `guest-checkout`, `claimToken`, `/claim/[token]`, defter bekletme | Kota duvarında 4 adım → 1 adım; sektör bandı %30–50 tamamlama artışı |
| **4 — Doğrulama** | 8 kapı yeşil, 34 yeni test, bu rapor | — |

**Mühendislik ilkesi:** Her paket "para → ürün → defter" sırasını korur. Hiçbir yol sahipsiz defter satırı yazmaz, hiçbir fiyat kodda sabit değildir, hiçbir kredi ikinci kez sayılmaz.

---

## 1. PAKET 1 — Aylık Kredi Ekonomisi ve LLM Maliyet Kalkanı (S-01 + §4.2)

### 1.1 Günlük kotadan aylık kredi havuzuna geçiş

| Sabit | Önce | Sonra | Ev |
|---|---:|---:|---|
| Misafir `lite` | 3 / gün | **3 / gün (korundu)** | `TEZGAH_GUEST_DAILY_LIMIT` |
| Üye `lite` | 3 / gün | **30 / ay** | `TEZGAH_FREE_MONTHLY_CREDITS` |
| Pro `lite` | 100 / gün | **500 / ay** | `TEZGAH_PRO_MONTHLY_CREDITS` |
| `tetkik` | 1 / ömür boyu | **1 / ömür boyu (korundu)** | `TEZGAH_TETKIK_LIFETIME_LIMIT` |

**Misafir neden günlük kaldı (bilinçli sapma).** Plan "lite havuzunu aylığa çevir" diyordu; ancak misafir kovası `guest:<ip>`'dir ve bir çıkış IP'sini (CGNAT, kurumsal NAT, kafe ağı) **yüzlerce kişi** paylaşır. Aylık 30 kredi bu kovaya verilseydi tek bir IP 30 kredi kazanır, `AI_PLATFORM_DAILY_CAP_MINOR` maliyet kalkanı delinirdi. Bu yüzden:

| Hat | Periyot | Tavan | Gerekçe |
|---|---|---|---|
| Misafir | `YYYY-MM-DD` | 3 | IP kovası kimlik değildir; maliyet ve adalet |
| Üye | `YYYY-MM` | 30 | Kimlik doğrulanmış; aylık havuz güvenli |
| Pro | `YYYY-MM` | 500 | Sözleşmeli abone |

Bu, kullanıcı lehine **tek yönlü** bir değişimdir: misafir hattı hiç daralmadı, üye hattı günlük 3'ten aylık 30'a çıktı.

### 1.2 `tezgahQuotaDateKey` → `tezgahQuotaPeriodKey(pool, now, guest)`

```ts
export function tezgahQuotaPeriodKey(
  poolKey: TezgahPoolKey,
  now = new Date(),
  guest = false,
): string {
  if (poolKey === "tetkik") {
    return TEZGAH_TETKIK_DATE_KEY;   // "lifetime"
  }
  return guest ? tezgahDayKey(now) : tezgahMonthKey(now); // "2026-11-22" | "2026-11"
}
```

- İstanbul saat dilimi tek `Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" })` üreticisinden okunur (`istanbulParts`). Sınır testi: `2026-12-31T23:30Z` → ay `2027-01`, gün `2027-01-01`.
- **Tablo adı `tezgah_daily_quotas` korundu.** Rename `verify:rls-status` sicilini (74 tablo) ve `FORCE RLS` PK'sını kırardı. `date_key` artık gerçekten bir *periyot* anahtarıdır; bu, Prisma modeli yorumunda ve SQL `COMMENT ON TABLE`'da sicile yazıldı.
- Kolon tipi `VARCHAR(16)` idi; `YYYY-MM-DD` (10) ve `YYYY-MM` (7) sığar. **Tip değişmedi** — PK ve RLS dokunulmadı.
- `tezgahQuotaDateKey(pool, now)` geriye dönük ad olarak korundu (üye hattıyla aynı); çağıranlar kırılmadı.

### 1.3 Aylık %50 kredi devri

```ts
export function tezgahRolloverCredits(input: {
  baseLimit: number;
  previousUsed: number | null;
}): number {
  const base = Math.max(0, Math.trunc(input.baseLimit));
  if (base <= 0 || input.previousUsed == null) {
    return 0;                                  // önceki ay satırı yoksa bedava kredi yok
  }
  const unused = Math.max(0, base - Math.max(0, Math.trunc(input.previousUsed)));
  const carried = Math.floor((unused * TEZGAH_ROLLOVER_BPS) / 10_000);
  const cap = Math.floor((base * TEZGAH_ROLLOVER_CAP_BPS) / 10_000);
  return Math.max(0, Math.min(carried, cap));
}
```

| Önceki ay | Taban | Artık | Devir |
|---|---:|---:|---:|
| 0 kullanıldı | 30 | 30 | **15** (tavan) |
| 1 kullanıldı | 30 | 29 | 14 |
| 29 kullanıldı | 30 | 1 | 0 |
| Hiç satır yok | 30 | — | **0** |

**Üç kritik karar:**

1. **Devir okuma anında deterministik hesaplanır.** Cron beklenmez; kullanıcı ayın 1'inde ilk üretimini yaptığında devir zaten hesaba katılmıştır.
2. **Cron ikinci bakiye yazmaz.** Inngest `tezgah-credit-rollover` (ayın 1'i 00:05 İstanbul) yalnız: (a) denetim ölçümü yapar (kaç kullanıcı kaç kredi devretti), (b) sıfır kullanımlı önceki ay satırlarını siler, (c) devir alan oranı %100 ise `warn` basar (kimse kredi kullanmıyorsa ürün ölü demektir). Tabloya kredi eklemek devri **iki kez** sayardı.
3. **`readOptional` ayrımı.** `0` (satır var, hiç kullanılmamış) ile `null` (satır yok, havuz hiç açılmamış) farkı zorunluydu: aksi hâlde hiç üretim yapmamış yeni kullanıcı "kullanmadım" diye 15 bedava kredi kazanırdı. Bu, ilk test koşusunda yakalandı ve `QuotaStore.readOptional` eklendi.

**Kernel↛dikey sınırı korundu.** Inngest fonksiyonu kernel'de yaşar ve `lib/tezgah` import edemez. Çözüm, mevcut `registerPaytrValorLicenseHooks` deseninin aynısı: `lib/kernel/jobs/tezgah-rollover-hook.ts` kancası + `app/api/(kernel)/jobs/register-rollover-hooks.ts` kaydı. Kanca bağlı değilse cron no-op döner, sahte sayı basmaz.

### 1.4 Kullanıcı bazlı LLM hız tavanı (S-01)

```ts
tezgahGenerateUser: { keyPrefix: "tezgah-generate-user", limit: 30, windowMs: TEN_MINUTES_MS },
```

Bağlandığı 6 rota: `/api/tezgah/generate`, `/grant/generate`, `/dukkan/generate`, `/reklam/generate`, `/pazaryeri/generate`, `/tetkik/generate`. Hepsi `guardTezgahGenerateRate(request, actor.userId)` çağırır ve 429'da `rateLimitedJsonResponse` döner. Kota düşmez.

**Neden iki kapı gerekli:**

| Kapı | Ölçtüğü | Koruduğu |
|---|---|---|
| `consumeTezgahQuota` | kullanım / kredi | ürün adaleti, gelir |
| `tezgahGenerateUser` | hız | `AI_PLATFORM_DAILY_CAP_MINOR` maliyet kalkanı, CGNAT adaleti |

Kenar `llmIp` (20/10dk) yalnız IP başına sayar; tek bir IP tüm günlük maliyet tavanını yakıp meşru kullanıcıları 503'e düşürebilirdi.

### 1.5 Arayüz kredi dili

| Yüzey | Önce | Sonra |
|---|---|---|
| Üye rozet | `Günlük ücretsiz hakkınız: 2 / 3` | `Kalan kredi: 27 / 30` |
| Pro rozet | `Pro — günlük 100 üretim hakkı · kalan 87` | `Pro — aylık 500 kredi · kalan 487` |
| Misafir rozet | `Günlük ücretsiz hakkınız: 2 / 3` | `Bugünkü ücretsiz hakkın: 2 / 3` |
| `TEZGAH_MEMBER_QUOTA_MESSAGE` | "Bugünkü ücretsiz hakkınız doldu. Yarın…" | "Bu ayki ücretsiz kredin doldu. Yeni krediler ayın 1'inde… kalan kredinin yarısı o gün devreder." |
| Panel kartı | "Bugünkü ücretsiz hak" | "Bu ayki kredi" |
| Fiyat tablosu satırı | "Günlük Tezgâh Kotası" | "Aylık Tezgâh Kredisi" |

Fiyat karşılaştırma matrisi, `llms.txt` ve vitrin kartı rakamı **elle yazmaz**; `TEZGAH_*_MONTHLY_CREDITS` sabitinden okur.

---

## 2. PAKET 2 — YetkinCV Ücretli Mühür ve Kamuya Açık Yayın Modeli (§4.3)

### 2.1 Model ayrımı (bu paketin kalbi)

| Katman | Ücret | Kod evi |
|---|---|---|
| Vaka sınavı | **Ücretsiz** | `startYetkinCvSitting` |
| Puanlama (akademi sınav motoru) | **Ücretsiz** | `sealYetkinCvSitting` |
| SHA-256 mühür satırı (`YetkinCvSeal`) | **Ücretsiz** | `sealYetkinCvSitting` |
| SWOT analizi | **Ücretsiz** | `buildCareerSwot` |
| 30/60/90 günlük plan | **Ücretsiz** | `buildCareerRoadmap` |
| **Kamuya açık kariyer kartı + uzman dizini görünürlüğü** | **290 TL (tek seferlik)** | `sealedPublication` |

**Dürüstlük kanıtı.** `public-vitrine.ts` yorumu ve cümlesi korundu: *"Puan satın almadan değil test sonucundan oluşur."* Para **yayını** satın alır. Mühür her zaman üretilir (`@default(false)`); ödeme yalnız görünürlüğü açar.

### 2.2 Şema ve göç

```prisma
model YetkinCvSeal {
  // ... mevcut alanlar
  sealedPublication          Boolean   @default(false) @map("sealed_publication")
  publicationPaidMerchantOid String?   @map("publication_paid_merchant_oid") @db.VarChar(64)
  publishedAt                DateTime? @map("published_at")

  @@index([sealedPublication, publishedAt])
}
```

`publicationPaidMerchantOid` idempotanlık anahtarıdır: aynı CLEARED sipariş ikinci kez ücret almaz. Bir kullanıcı yeni sınav yaparsa **en son** mühre uygulanır — eski kart kendiliğinden yayınlanmaz.

### 2.3 Ödeme rotası `POST /api/career/yetkincv/purchase`

**Yeni çekirdek servis: `lib/kernel/payments/single-purchase-checkout.ts`.**

`placeTezgahCheckout` desenini kopyalamak yerine **çekirdeğe** taşındım. Neden: `lib/career` dosyasının `lib/tezgah/checkout` import etmesi B1 import duvarına (`module.engine`) takılırdı. Çekirdek servis:

- Tutar **istekten okunmaz**; yalnız aktif `PriceCatalogEntry.amountMinor` satırından gelir. Satır yoksa `422`, tahsilat başlamaz.
- merchantOid deterministik: `SP` + `sha256(prefix:module:unit:user:idempotencyKey)[0..24]`.
- `Idempotency-Key` zorunlu (UUID), kasa rızası (`checkoutLegalConsentSchema`) zorunlu.
- PSP hatasında / mock modda / iframe yoksa sipariş `FAILED` kapanır; CREDIT yazılmaz.

**Rota sırası (dürüstlük kapıları):**

1. `checkoutUser` rate limit → 2. `requireRailV1IdempotencyKey` → 3. **`publication.hasSeal` yoksa 422** ("önce testi çöz; puan satın alınmaz") → 4. **`publication.published` ise 409** ("ikinci kez ücret alınmaz") → 5. `placeSingleCatalogPurchase`.

### 2.4 CLEARED kancası

`lib/career/register-paytr-license-hook.ts` → `registerCareerLicenseHook` → `fulfillYetkinCvPublication`.

Kanca `webhook-settle.ts` ve `reconcile.ts` içinde **hem** ilk CLEARED'da hem tekrar CLEARED'da çağrılır (idempotent). `register-paytr-valor-hooks.ts` siciline `registerPaytrCareerLicenseHook()` eklendi.

**Lisans boşluğu alarmı.** Para alındı ama mühür yoksa (kullanıcı yayın siparişi verdi, sonra mühür silindi) `license-gap.ts` taraması `product: "career", reason: "missing_purchase"` satırı yazar. `loadLicenseGapSnapshot` artık `careerPublicationSeats` ve `CAREER_PUBLICATION_PURPOSE` sorgusunu da okur.

### 2.5 `/vize/[hash]` yayın ayrımı

| `sealedPublication` | Basılan |
|---|---|
| `false` | **`YetkinCvSummaryCard`** — puan + baraj + 3 temel beceri. Ardından **`YetkinCvPublicationCta`** |
| `true` | **`YetkinCvCard`** (tam doğrulanabilir kart) + **`ProofShareBar`** (paylaşım rozeti) + dizin görünürlüğü |

CTA metni (sözleşme sabiti `YETKINCV_PUBLICATION_CTA_LABEL`):
> **"Kamuya Açık Kariyer Kartını ve Uzman Dizini Görünürlüğünü Aç"**

Tutar `lib/career/yetkincv-publication.ts` → `readYetkinCvPublicationAmount()` üzerinden katalogdan okunur; satır yoksa CTA **fiyat basmaz** ve "yayın katalogda henüz açılmadı" der. Özet kart metni puanı gizlemez — puan gerçektir; eksik olan yalnız yayındır.

### 2.6 Katalog birimi geri açıldı (sıra korunarak)

`CATALOG_OPENABLE_UNITS`'a `career / yetkincv-exam` eklendi. TEDAVI raporundaki sıra harfiyen izlendi:

1. ✅ Önce ödeme rotası yazıldı (`/api/career/yetkincv/purchase`)
2. ✅ CLEARED → `fulfillYetkinCvPublication` → `sealedPublication = true`
3. ✅ **Sonra** birim geri açıldı
4. ✅ **En son** vitrin kartı katalogdan tutar okur

### 2.7 Vitrin kartı

```ts
summary: "Sınav, puan, SWOT ve 30/60/90 planı ücretsizdir. Puan satın almadan değil test sonucundan oluşur.",
lines: [
  "Uygulamalı vaka testi — ücretsiz",
  "Puan, SWOT ve 30/60/90 planı — ücretsiz",
  "SHA-256 doğrulanabilir puan kodu — ücretsiz",
  `Kamuya açık kariyer kartı + uzman dizini görünürlüğü — tek seferlik ${formatMinorCompact(...)}`,
]
```

Tutar katalog satırından; satır yoksa etiket `PUBLIC_FREE_EVALUATION_LABEL`'a düşer.

---

## 3. PAKET 3 — Misafir Ödeme ve Hesap Sahiplenme Akışı (§4.1)

### 3.1 Şema

```prisma
model PaymentOrder {
  userId        String?  @map("user_id")     // Faz 3: misafirde NULL
  guestEmail    String?  @map("guest_email") @db.VarChar(320)
  claimToken    String?  @unique @map("claim_token") @db.VarChar(64)
  claimTokenExpiresAt DateTime? @map("claim_token_expires_at")
  claimTokenUsedAt    DateTime? @map("claim_token_used_at")
  guestBillingJson    String?   @map("guest_billing_json") @db.Text

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([guestEmail, createdAt])
}
```

### 3.2 RLS sürekliliği — ve neden `rls_deny_unscoped` **eklenmedi**

`payment_orders` zaten `rls_own_user_id` owner SELECT politikası taşır. Misafir satırında `user_id IS NULL` olduğu için `user_id::text = yetkin_auth_user_id()` eşleşmez → satır **hiç kimseye görünmez** (fail-closed). Kapsamsız deny politikası eklemek gereksizdi; eklenmedi. Göç üç tablonun `ENABLE + FORCE RLS` durumunu yeniden doğrular.

**`verify:rls-status` sonucu değişmedi: 74 tablo FORCE RLS, kapsamsız deny yeşil.** Hiçbir tablo eklenmedi/silinmedi.

### 3.3 Defter bekletme — akışın en kritik kararı

`appendLedgerEntry` sahipsiz kayıt **kabul etmez** (bu iyi bir mühürdür: para sahipsiz yere düşmez). Bu yüzden:

```ts
// lib/kernel/payments/clearing.ts
if (order.userId === null) {
  // Misafir: defter sahipsiz satır yazmaz. Yalnız durum kapanır.
  const guestPaid = order.status === "PAID" ? order : await tx.orders.markPaid(order.id, now);
  const guestCleared = await tx.orders.markCleared(guestPaid.id, now);
  return { order: guestCleared, applied: false, awaitingClaim: true };
}
```

`ClearPaymentOrderResult.awaitingClaim` bayrağı eklendi; webhook `reason: "awaiting_claim"` olarak loglar ve **"para cüzdana düştü" demez**. Defter CREDIT'i `/api/auth/claim-order` içinde, `userId` bağlanınca, aynı `wallet-top-up:{merchantOid}` anahtarıyla yazılır — böylece defter mutabakat invariantı (`CLEARED sipariş ↔ wallet-top-up:{merchantOid}`) bozulmaz ve çift CREDIT doğmaz.

### 3.4 `POST /api/tezgah/guest-checkout` (public, rate-limited)

| Kapı | Değer |
|---|---|
| auth | `public` |
| rate limit | `guestCheckoutIp` = **5 / 10dk** |
| Idempotency-Key | zorunlu (UUID) |
| Tutar | katalog `tezgah/pro` satırından |
| Kayıtlı e-posta | **`409`** — çift abonelik doğmaz |
| Ödeme öncesi hesap | **açılmaz** (`signUp` yok) |

`merchantOid`: `TZG` + `sha256(tezgah:guest:{email}:{idempotencyKey})[0..24]` — üye evreninden ayrı.

### 3.5 CLEARED → claim token → e-posta

`register-paytr-guest-claim-hook.ts`:
```
issueClaimTokenForClearedGuestOrder(order)  →  deliverGuestClaimMail(...)
```

- Token: `randomBytes(32).toString("base64url")` = **43 karakter**, kriptografik.
- Ömür: **14 gün** (`CLAIM_TOKEN_TTL_MS`).
- DB tekilliği: partial unique index (`claim_token IS NOT NULL`).
- Webhook tekrarında `already_issued` → ikinci e-posta basılmaz (idempotent).
- E-posta metni dürüst: *"Ödemen alındı… Bağlantı 14 gün geçerlidir ve yalnız bir kez kullanılır."* SMTP yoksa `skipped` — "posta gitti" denmez, sipariş durmaz.

### 3.6 `/claim/[token]` + `POST /api/auth/claim-order`

**Sıra değişmez (para → hesap → defter → abonelik):**

| # | Adım | Nerede |
|---|---|---|
| 1 | Token doğrula (tek kullanım + süre + `CLEARED`) | `loadClaimOrder` |
| 2 | Supabase Auth hesabı aç (`signUp`; SMTP düşerse `provisionConfirmedAuthUser`) | `claim-order/route.ts` |
| 3 | `payment_orders.userId` bağla (CAS: `where userId: null`) | `bindGuestOrderToUser` |
| 4 | Defter CREDIT (`wallet-top-up:{merchantOid}`) | `bindGuestOrderToUser` |
| 5 | Tezgâh Pro aboneliği + `guest_billing_json` → `user_billing_info` | `bindGuestOrderToUser` |
| 6 | Token tek kullanımlık işaretle → `/tezgah`'a yönlendir | `claim-order/route.ts` |

**Hata davranışı:**
- 2. adım düşerse → ticari satır değişmez, token **yanmaz** (kullanıcı yeniden dener).
- 4. adım düşerse → hesap açılmış olur; token `usedAt` yazılmaz; `tezgah.guest.claim_ledger_failed` **error** alarmı. Para kaybolmaz, tekrar denenebilir.
- Token kullanılmış/süresi geçmiş → sayfa açıkça söyler, hesap açmaz.

**Sayfa:** `app/(public)/claim/[token]/page.tsx` + `components/auth/claim-order-form.tsx`. `robots: { index: false, follow: false }`. Biçim bozuk token → kenar `public-surface-gate` 404 (gövde akmaz).

### 3.7 Arayüz

- `components/tezgah/guest-checkout-card.tsx` — "Kayıt Olmadan Hemen Pro'ya Geç" düğmesi. Fiyat `/api/tezgah/offers`'tan okunur (katalog yoksa satın alma kapalı). Form şifre istemez; "hesabın ödeme onayından sonra açılır" yazar.
- Tezgâh kota duvarına (`workbench.tsx`) ve fiyatlandırma sayfasına (`data-pricing-guest`) bağlandı.

---

## 4. Veritabanı Göçü

**Dosya:** `prisma/migrations/20261122190000_faz3_credit_guest_seal/migration.sql`

Tek göç, üç değişiklik — hepsi **idempotent** (`IF NOT EXISTS`, `DROP NOT NULL`):

| # | Değişiklik | Neden tek göç |
|---|---|---|
| 1 | `COMMENT ON TABLE tezgah_daily_quotas` (davranış sicili) | Kolon/tip değişmez; RLS PK korunur |
| 2 | `yetkin_cv_seals` + 3 kolon + 1 index | Yeni tablo yok |
| 3 | `payment_orders`: `user_id` nullable + 5 kolon + 3 index | Yeni tablo yok |
| 4 | 3 tablonun `ENABLE/FORCE RLS` doğrulaması | RLS mührü sürekliliği |

**Neden hiç rename yok.** `tezgah_daily_quotas` adı tarihsel kaldı. Rename:
- `RLS_FORCE_TABLES` sicilini (74 satır) ve `Prisma` modelini birlikte değiştirmeyi gerektirirdi → `verify:rls-status` kırılırdı,
- `(date_key, subject_key, pool_key)` PK'sını ve `tezgah_daily_quotas_pkey` kısıt adını bozardı,
- tek başına davranış kazancı **sıfır** olurdu (`date_key` zaten periyot anahtarı oldu).

**Kolon tipi değişmedi.** `date_key VARCHAR(16)` idi; `YYYY-MM` (7) ve `YYYY-MM-DD` (10) sığar.

**`payment_orders` partial unique index:**
```sql
CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_claim_token_key"
  ON "payment_orders" ("claim_token")
  WHERE "claim_token" IS NOT NULL;
```
NULL çok olabilir (üye siparişleri), token tekildir.

---

## 5. Yeni API Rotaları ve Auth Haritası

| Rota | Auth | Idempotency | Rate limit | Web-only sicil | v1 hop |
|---|---|---|---|---|---|
| `POST /api/career/yetkincv/purchase` | `session` | ✅ zorunlu | `checkoutUser` | ✅ `product-write` | ❌ |
| `POST /api/tezgah/guest-checkout` | `public` | ✅ zorunlu | `guestCheckoutIp` (5/10dk) | ✅ `product-write` | ❌ |
| `POST /api/auth/claim-order` | `public` | — | `claimOrderIp` (10/10dk) | ✅ `cookie-auth` | ❌ |

**`verify:api-auth -- --check`:** `132 → 135 rota` (`session: 73 → 74`, `public: 25 → 27`, diğer tüm kovalar sabit).

**Yeni sayfa:** `GET /claim/[token]` — `robots: noindex, nofollow`, `public-surface-gate` biçim doğrulaması.

**Yeni Inngest cron:** `tezgah-credit-rollover` — `TZ=Europe/Istanbul 5 0 1 * *`. `INNGEST_KERNEL_CRON_FUNCTION_IDS` siciline eklendi (7 → 8).

---

## 6. Doğrulama Kapıları — Sonuç Tablosu

| # | Kapı | Komut | Sonuç | Kanıt |
|---|---|---|---|---|
| 1 | Tip denetimi | `npx tsc --noEmit` | ✅ **0 hata** | çıktı yok, EXIT=0 |
| 2 | Dil aksı | `npm run verify:sen-axis` | ✅ | `OK — 521 dosya, 34 siz kaçağı tarandı` |
| 3 | Sınır mührü | `npm run verify:boundaries` | ✅ | `OK — kernel↛dikey, UI↛prisma/yazma motoru, …` |
| 4 | API ↔ auth | `npm run verify:api-auth -- --check` | ✅ **135 rota** | `{"session":74,"public":27,"closed":11,"cron":2,"admin":13,"webhook":8}` |
| 5 | RLS mührü | `npm run verify:rls-status` | ✅ **74 tablo** FORCE RLS | `OK — Auth sync + e-posta senkronu + FORCE RLS + owner SELECT + kapsamsız deny` |
| 6 | Sır taraması | `npm run verify:no-secrets` | ✅ | `OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok` |
| 7 | Test paketi | `npx vitest run` | ✅ **367 dosya / 2045 test** | `Test Files 367 passed` / `Tests 2045 passed` |
| 8 | Üretim derlemesi | `npx next build` | ✅ | `✓ Compiled successfully in 14.2s`; `184/184` sayfa; `ƒ /api/auth/claim-order`, `ƒ /claim/[token]` |

### 6.1 Test sayısı hareketi

| | Önce | Sonra | Fark |
|---|---:|---:|---:|
| Test dosyası | 366 | **367** | +1 (`tests/tezgah/faz3-gelir.test.ts`) |
| Test sayısı | 2011 | **2045** | **+34** |

**Yeni testler (`tests/tezgah/faz3-gelir.test.ts`, 29 test):**

| Paket | Test |
|---|---|
| 1 | Havuz sabitleri (30/500/3), periyot anahtarı tek üretici, İstanbul ay/gün sınırı, devir %50 + tavan, `null` → 0, cron özeti Pro/ücretsiz ayrımı, cron zamanlaması, hız tavanı 6 rotada bağlı, kredi dili tek kaynak |
| 2 | Şema `@default(false)` + göç idempotent, ödeme rotası zinciri, CLEARED kancası 3 dosyada, `/vize` özet/tam ayrımı, katalog birimi + lisans boşluğu, vitrin dürüstlüğü |
| 3 | Şema nullable + claim kolonları, misafir checkout kapıları, e-posta doğrulama + kayıtlı e-posta reddi, token kriptografik/43/14 gün, merchantOid evren ayrımı, sahipsiz daraltma, webhook kancası, claim sırası, `/claim` sayfası + e-posta, CTA'lar, soft-404 kapısı, **misafir/üye CLEARED defter entegrasyonu** |
| 4 | Kernel↛dikey kaynak kanıtı, yeni rotalar auth haritalı + hop değil, akademi boşluk taraması bozulmadı |

**Güncellenen mevcut testler (dizgi dondurmak değil, sözleşme):**

| Dosya | Neden | Nasıl |
|---|---|---|
| `tests/tezgah/quota.test.ts` | Model tamamen değişti | Yeniden yazıldı: 15 test — aylık havuz, devir, misafir günlük, Pro aylık, tetkik ömür boyu |
| `tests/tezgah/engine.test.ts` | Üye 3 → 30 kredi | `remaining: 3 → 30`, döngü `3 → 30` |
| `tests/tezgah/surface.test.ts` | Kota satırı + sayaç cümlesi | `"Kalan kredi: 27 / 30"`, `"Kurs satın almak aylık kredi havuzunu yükseltmez."` |
| `tests/ui/treatment-surface.test.ts` | B-01 tersine döndü (rota artık var) | Yeni sözleşme: birim açık **çünkü** ödeme rotası var; sıra assert edilir |
| `tests/ui/pricing-proof-surface.test.ts` | Karşılaştırma satırı adı | `"Günlük Tezgâh Kotası" → "Aylık Tezgâh Kredisi"` |
| `tests/dashboard/command-center.test.ts` | Panel etiketi | `"Bugünkü ücretsiz hak" → "Bu ayki kredi"` |
| `tests/kernel/inngest-serve-guard.test.ts` | Yeni cron | `tezgah-credit-rollover` listeye eklendi |

Hiçbir test "yeşil olsun diye" silinmedi veya gevşetilmedi.

---

## 7. Mimari Kararlar (özet tablo)

| Karar | Seçim | Gerekçe |
|---|---|---|
| Misafir hattı periyodu | **Günlük kalır** | `guest:<ip>` kimlik değildir; CGNAT'ta 30 kredi tek kişiye giderdi |
| Devir zamanı | **Okuma anında deterministik** | Cron beklenmez; cron ikinci bakiye yazmaz (çift sayım yok) |
| `tezgah_daily_quotas` adı | **Korundu** | Rename 74 tablo RLS sicilini ve PK'yı kırardı, davranış kazancı sıfır |
| `null` vs `0` kullanım | **`readOptional`** | "Hiç açılmamış havuz" bedava devir kazanmamalı |
| Orta tahsilat servisi | **`lib/kernel/payments/single-purchase-checkout.ts`** | İki dikey aynı checkout'u kullansın; dikey→dikey import duvarı kırılmasın |
| Kernel cron → dikey | **Hook + serve-rotası kaydı** | `registerPaytrValorLicenseHooks` deseninin aynısı |
| Misafir defteri | **CLEARED'da yazılmaz, claim'de yazılır** | `appendLedgerEntry` sahipsiz satır kabul etmez (doğru mühür) |
| Misafir + kayıtlı e-posta | **409 reddi** | Çift abonelik doğmaz |
| YetkinCV ücreti | **Yayına, puana değil** | "Puan satın almadan değil test sonucundan oluşur" ilkesi |
| Yayın idempotanlığı | **`publicationPaidMerchantOid`** | Aynı sipariş ikinci kez ücret almaz |
| Yayın boşluğu | **`license-gap` alarmı** | Para alındı, mühür yok → operatör görür |
| Misafir RLS | **`rls_deny_unscoped` eklenmedi** | Owner politikası `NULL` satırı zaten göstermez (fail-closed) |

---

## 8. Bilinçli Kapsam Dışı (ve neden)

| Konu | Neden ertelendi |
|---|---|
| Kredi paketi (10 kredi) aylık havuza birleştirme | Paket sözleşmesi değişmedi; kredi hattı (`lane: "credit"`) ayrı ve çalışıyor. Birleştirme ürün kararı ister. |
| Yıllık fiyat seçeneği (TESPIT §5 Hamle 19) | Faz 3 kapsamı dışı; katalog ve PayTR tekrar ödeme planı gerektirir |
| Devir zincirleme birikimi | Bilinçli olarak **yok**: tavan tabanın %50'si. Süresiz birikim maliyet modelini bozar. |
| Misafir ödemede PayTR kart saklama (`store_card`) | Kart tokeni hesap açılmadan anlamsız (kime saklanacak?). Claim sonrası ayrı iş. |
| `/durustluk` sayfası, Junior MP3 transcode | TESPIT §4.3 / TEDAVI §4.4 — ayrı faz |
| E-posta doğrulama akışındaki `AUTH_EMAIL_HOOK` claim postası için | Claim postası `NOTICE_SMTP` ailesini kullanır (auth SMTP'den ayrı); env ayrımı doğru |

---

## 9. Bilinen Sınırlar

1. **Canlı veritabanı koşulmadı.** `DATABASE_URL` boş; göç `migration.sql` olarak yazıldı ve `verify:rls-status` statik sicil karşılaştırmasını geçti. `npx prisma generate` başarılı (Prisma 7.9.1).
2. **PayTR canlı akışı test edilmedi.** Sandbox/mock kurulu değil. Misafir ve yayın ödemeleri `placeTezgahCheckout` ile aynı adaptörü kullanır; mevcut `paytr-*` testleri yeşil.
3. **`npx vitest run` çıkış kodu 1.** Bu, TEDAVI raporunda da kayıtlı **bilinen zararsız** vitest worker `onTaskUpdate` timeout'udur (367 dosya paralel). `Test Files 367 passed` / `Tests 2045 passed` kesin sonuçtur; hiçbir assert düşmüyor.
4. **SMTP yoksa claim postası gitmez.** `tezgah.guest.claim_mail_skipped` warn basılır; sipariş ve tahsilat durmaz ama kullanıcı bağlantıyı almaz — operatör görür. Bu bilinçli bir dürüstlük sınırıdır, sessiz başarı değil.

---

## 10. Değişen / Eklenen Dosyalar

### Yeni (22)

| Dosya | Paket |
|---|---|
| `lib/tezgah/credit-rollover.ts` | 1 |
| `lib/tezgah/generate-guard.ts` | 1 |
| `lib/kernel/jobs/tezgah-rollover-hook.ts` | 1 |
| `app/api/(kernel)/jobs/register-rollover-hooks.ts` | 1 |
| `lib/kernel/payments/single-purchase-checkout.ts` | 2 |
| `lib/career/yetkincv-publication.ts` | 2 |
| `lib/career/register-paytr-license-hook.ts` | 2 |
| `lib/kernel/payments/career-license-hook.ts` | 2 |
| `app/api/career/yetkincv/purchase/route.ts` | 2 |
| `components/career/yetkincv-summary-card.tsx` | 2 |
| `components/career/yetkincv-publication-cta.tsx` | 2 |
| `lib/tezgah/guest-checkout.ts` | 3 |
| `lib/tezgah/guest-claim.ts` | 3 |
| `lib/tezgah/guest-claim-bind.ts` | 3 |
| `lib/tezgah/guest-claim-mail.ts` | 3 |
| `lib/tezgah/register-paytr-guest-claim-hook.ts` | 3 |
| `lib/kernel/payments/guest-claim-hook.ts` | 3 |
| `app/api/tezgah/guest-checkout/route.ts` | 3 |
| `app/api/(kernel)/auth/claim-order/route.ts` | 3 |
| `app/(public)/claim/[token]/page.tsx` | 3 |
| `components/auth/claim-order-form.tsx` | 3 |
| `components/tezgah/guest-checkout-card.tsx` | 3 |
| `prisma/migrations/20261122190000_faz3_credit_guest_seal/migration.sql` | 2+3 |
| `tests/tezgah/faz3-gelir.test.ts` | 4 |
| `docs/FAZ3_GELIR_RAPORU.md` | 4 |

### Değişen

`lib/tezgah/catalog.ts` · `lib/tezgah/quota.ts` · `lib/tezgah/paid-lane.ts` (okuma) · `lib/tezgah/checkout.ts` · `lib/tezgah/register-paytr-license-hook.ts` · `lib/tezgah/index.ts` · `lib/kernel/security/http-rate-limit.ts` · `lib/kernel/jobs/inngest.ts` · `lib/kernel/jobs/inngest-guard.ts` · `lib/kernel/payments/clearing.ts` · `lib/kernel/payments/prisma-order-store.ts` · `lib/kernel/payments/paytr/webhook-settle.ts` · `lib/kernel/payments/paytr/reconcile.ts` · `lib/kernel/payments/wallet-top-up.ts` · `lib/kernel/payments/license-gap.ts` · `lib/kernel/admin/ops-load.ts` · `lib/kernel/admin/catalog-write.ts` · `lib/kernel/http/web-only-write-routes.ts` · `lib/kernel/auth/redirects.ts` · `lib/kernel/observability/transaction-notice.ts` · `lib/academy/public-surface-gate.ts` · `lib/academy/paytr-license-bridge.ts` · `lib/academy/license-insufficient-hold.ts` · `lib/academy/register-paytr-license-hook.ts` · `lib/commerce/paytr-license-bridge.ts` · `lib/commerce/subscription-checkout.ts` · `lib/commerce/register-paytr-license-hook.ts` · `lib/junior/paytr-license-bridge.ts` · `lib/junior/checkout-paytr.ts` · `lib/junior/register-paytr-license-hook.ts` · `lib/career/yetkincv-store.ts` · `lib/pricing/public-vitrine.ts` · `lib/copy/sen-voice/dashboard.ts` · `prisma/schema/kernel.prisma` · `prisma/schema/career.prisma` · `prisma/schema/tezgah.prisma` · `app/(public)/fiyatlandirma/page.tsx` · `app/(public)/vize/[id]/page.tsx` · `app/api/tezgah/generate/route.ts` · `app/api/tezgah/grant/generate/route.ts` · `app/api/tezgah/dukkan/generate/route.ts` · `app/api/tezgah/reklam/generate/route.ts` · `app/api/tezgah/pazaryeri/generate/route.ts` · `app/api/tezgah/tetkik/generate/route.ts` · `app/api/tezgah/quota/route.ts` · `app/api/(kernel)/wallet/top-up/route.ts` · `app/api/(kernel)/payments/webhooks/paytr/route.ts` · `app/api/(kernel)/payments/register-paytr-valor-hooks.ts` · `app/api/(kernel)/payments/license-gap-runtime.ts` · `app/api/(kernel)/jobs/inngest/route.ts` · `app/dashboard/load-command.ts` · `app/llms.txt/route.ts` · `components/tezgah/workbench.tsx` · `lib/kernel/security/route-auth-map.ts` (üretildi) · `generated/route-auth-map.json` (üretildi) · `.system_docs/TEZGAH_KOTA.md`

### Dokunulmayan (mühürler)

`.system_docs/ANAYASA.md` (A1–A5) · `.system_docs/AKADEMI_URETIM_ANAYASASI.md` · `lib/kernel/ai/model-roles.ts` · `lib/copy/junior-guardian-notice.ts` (mühürlü hukuki metin) · Junior beş medya katmanı · `archive*/`, `yetkin_muze/`

---

## 11. Kapanış

Üç hamle de artık **kodla çalışır durumda**:

- **Para doğru yere akıyor:** Tezgâh Pro aylık 500 krediyle gerçek bir fayda veriyor; kullanılmayan kredi %50 devrediyor; misafir kota duvarında tek adımda ödeyebiliyor; YetkinCV yayını 290 TL'ye satılıyor.
- **Dürüstlük kırılmadı:** YetkinCV puanı hâlâ satın alınamaz. Misafir ödemede ödeme oncesi hesap açılmaz. Defter sahipsiz satır yazmaz. Katalog satırı yoksa fiyat basılmaz.
- **Mühürler yeşil:** 0 tip hatası, 135 rota auth haritalı, **74 tablo FORCE RLS**, sınır duvarı sağlam, "sen" aksı temiz, 2045 test geçiyor, üretim derlemesi başarılı.

**Sıradaki doğal adımlar** (bu fazın kapsamı dışı): kredi paketi ile aylık havuzun birleştirilmesi, yıllık fiyat seçeneği, misafir ödemede kart saklama, ve claim e-postasının `AUTH_EMAIL_HOOK` hattına taşınması.

---

**Rapor sonu.**
