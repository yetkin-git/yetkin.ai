# Tedavi Raporu — Faz 3 (Akademi Nakit Kapanışı & Freelancer Cüzdan Döngüsü)

| Alan | Değer |
|------|--------|
| Tarih | 17 Ağustos 2026 |
| Yazar | Baş yazılım mimarı (Cursor) |
| Gövde | `d:\yetkin_rail` |
| Tespit SSOT | `docs/01_TESPIT_RAPORU.md` |
| Anayasa | `docs/ANAYASA.md` |
| Ops | `docs/07_OPS_RUNBOOK.md` |
| Kapsam | Faz 2 commit, T3 akademi nakit dumanı, T4 GoTrue/text-id onarımı, T4 emanet/cüzdan denemesi |
| Dışarıda | Faz 4 DevLabs/Studio gümrük dumanı, 13. oda, Redis, Socket, GİB, çekim, sahte bakiye, sahte `phase`, mock checkout |

Ürün kodu bu dilimde **yeni oda açmadı.** `wallets.amount_minor` doğrudan yazılmadı. `PAYTR_ALLOW_MOCK_CHECKOUT` açılmadı. `GET /api/health` JSON `phase` taşımıyor. Sahte CREDIT yok.

---

## 1. Faz 2 commit

```
80383f1 chore(kernel): fix T3/T4 loop scripts and verify T2 backbone
```

Önceki HEAD: `d07aa68` (`chore(kernel): restore T0 seals, track CI and seed devlabs catalog`).

| Dosya / küme | Neden |
|--------------|--------|
| `scripts/ops-t3-academy-loop.ts` + academy surface | GoTrue `email_confirmed_at` / `public.users` `$1::text`; PayTR HMAC döngü |
| `scripts/ops-t4-freelancer-loop.ts` + freelancer surface | Aynı GoTrue/text-id kilitleri; OPEN → EscrowHold → release yüzeyi |
| `package.json` `ops:t3-academy-loop` / `ops:t4-freelancer-loop` | ops sicili |
| `scripts/verify-atomic-seals.ts` | T3/T4 surface dosyaları kilit listesinde |
| `lib/kernel/db.ts` + `scripts/ops-migrate-lib.ts` | Direct `uselibpqcompat=true`; soğuk Prisma ısınması |
| `lib/kernel/jobs/inngest-guard.ts` + serve rotası | Cloud yokken `INNGEST_DEV=1` yerel duman; üretimde bypass yok |
| `lib/kernel/ledger/wallet-read.ts` + dashboard pulse/strip | Settlement cüzdan `$queryRaw`; ikinci bakiye yok |
| `app/api/freelancer/jobs/[id]/accept/route.ts` | Katalog `escrow:hold` bps HTTP’den motora |
| `.env.example` + `docs/07_OPS_RUNBOOK.md` | `INNGEST_DEV` şablona yazılmaz; T3/T4 ops cümleleri |
| `docs/03_TEDAVI_RAPORU_FAZ2.md` | Faz 2 kalkan kaydı |

**Bilerek bu commit’e alınmayanlar:** logout rotası, kabuk/ikon, tarihsel tespit silmeleri, Anayasa envanter yolu, Studio storage CORS yaması, e2e spec kaymaları, `.env.local`.

Push yapılmadı.

---

## 2. Akademi nakit kapanışı (T3)

Önkoşul: `npm run dev` `:3000`, `PAYTR_SANDBOX=1`, mock kapalı. Auth e-posta hız tavanı Faz 2’de kırmızıyı basmıştı.

### 2.1 Hız tavanı ve bağlı yüzey

İlk T3 denemesi (tavan hâlâ kapalı):

```
→ health HTTP 200 db=ok paytr=configured
ops:t3-academy-loop BAŞARISIZ: Kayıt açılamadı: email rate limit exceeded
```

Sahte bakiye yok. `GET /api/health` **200**, `phase` yok; `checks.inngest = unconfigured` (Cloud sicili boş — dürüst). `GET /academy` **200**, `rail-temel` listeleniyor.

Tavan açıldıktan sonra (aynı komut):

```
→ oturum yeni vatandaş 0cad8d8f… (e-posta SQL onay)
→ katalog kilidi 25000 minor (tohum ile eşit)
ops:t3-academy-loop BAŞARISIZ: Cüzdan yükleme 503: {"ok":false,"error":"Gecersiz istek veya magaza aktif degil"}
```

Vatandaş kimliği GoTrue `signUp` + yazılabilir `email_confirmed_at` ile açıldı (`confirmed_at` üretilmiş kolona yazılmadı). Kimlik `.env.local` `E2E_T3_*` olarak git dışı saklandı. Katalog kilidi Super Admin SSOT / tohum **25000** minor.

### 2.2 PayTR get-token — dürüst kırmızı (001)

PayTR iframe `get-token` yanıtı **001**: «Gecersiz istek veya magaza aktif degil». Resmi anlam: `merchant_id` iletilmedi **veya** mağaza aktif değil. Sicil dolu (`checks.paytr = configured`); mock açılmadı.

Sunucu günlüğü (sır yok; oid öneki):

| requestId (kısa) | merchantOid öneki | amountMinor | Sonuç |
|------------------|-------------------|-------------|--------|
| `61183aa0…` | `wallet-top-up-` (eski) | 25000 | `wallet.top_up.checkout_failed` / `pay_api_error` |
| `387db291…` | `wallet-top-up-` | 25000 | aynı |
| `bd352a82…` | `wallettopup` (alfa-numerik) | 25000 | aynı 001 |

Webhook HMAC bu dilimde **çağrılmadı** (token yok). `PaymentOrder` PENDING satırları get-token öncesi doğabilir; **CLEARED yok.** `LedgerEntry` CREDIT yok. Sertifika hash basılmadı. `/academy/dogrula/[hash]` nakit mührü **yok.**

Bu **bağlı sistemin dürüst kırmızısıdır**, sahte yeşil değildir.

### 2.3 Çekirdek hizalama (çalışma ağacı; 80383f1 sonrası)

T3 001’i kapatmadı; yine de get-token gövdesi resmi iFrame sözleşmesine çekildi (CREDIT icat edilmedi):

| Önce | Sonra |
|------|--------|
| Direct-tarzı hash (`payment_type` + `installment_count` + `non_3d`) | iFrame hash: `merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode` |
| `payment_amount` ondalık `"250.00"` | kuruş tam sayı `"25000"` (sepet birim fiyatı hâlâ `formatPaytrPaymentAmount` / `.toFixed(2)` sınır katmanı) |
| `merchant_oid` `wallet-top-up-` (tire) | `wallettopup` + hex; PayTR «alfa numerik» |

`tests/kernel/paytr.test.ts` **9/9**. Bu yama **80383f1 içinde değildir**; çalışma ağacında durur. 001, oid/hash hizasından sonra da aynı kaldı — mağaza aktivasyonu veya panel sicili operatör işidir.

---

## 3. Kazanç halkası (T4)

### 3.1 GoTrue / text-id tuzakları

`scripts/ops-t4-freelancer-loop.ts` T3 ile aynı kilitlere alındı (80383f1):

1. `confirmed_at = COALESCE(confirmed_at, NOW())` **yok.** Yalnız `email_confirmed_at` (`is_generated = NEVER`).
2. `public.users WHERE id = $1::text` (`::uuid` dökümü yok).
3. `persistPair` kayıt hemen ardından (SQL patlarsa hız tavanı dolmadan aynı çift).

`tests/freelancer/t4-freelancer-loop-surface.test.ts` bu üç kilidi okur. Sahte `UPDATE wallets` / `SET amount_minor` yok.

### 3.2 Canlı koşu

```
npm run ops:t4-freelancer-loop
```

| Adım | Sonuç |
|------|--------|
| `GET /api/health` | 200, `db=ok`, `paytr=configured` |
| Tek bakiye şema mührü | **geçti** — `wallets.amount_minor`; User/module ikinci kolon yok; `module_wallets` / `holding_pools` yok |
| Katalog hold | **1000 bps** (Super Admin SSOT) |
| Satıcı oturumu | T3 vatandaşı `0cad8d8f…` (GoTrue giriş; tuzak yok) |
| Müşteri kaydı | **email rate limit exceeded** |
| İlan / teklif / EscrowHold / teslim / release | **koşulmadı** |

Müşteri ikinci `signUp` Auth SMTP tavanında durdu. T3 vatandaşının akademi vizesi yok (sınav basılmadı); vize yolu da aynı PayTR get-token 001’e çarpardı. **EscrowHold PENDING yazılmadı. Hakediş CREDIT yazılmadı.** S43 çekim yüzeyi açılmadı.

### 3.3 S43 / defter (bu dilimde kanıtlanan)

| Kural | Kanıt |
|-------|--------|
| Tek bakiye `amountMinor` | Canlı `information_schema`: yasak kolon yok |
| Append-only defter | T3/T4 betikleri `UPDATE wallets` içermez; CREDIT yalnız `clearSuccessfulPaymentOrder` / emanet motoru |
| Sahte CREDIT yok | PayTR token yok → webhook yok → clearing yok |
| Kapalı döngü | `/api/wallet/withdraw` yok; bu dilimde çekim icat edilmedi |
| Emanet ikinci bakiye değil | Hold yazılmadan duruldu; kilit kolonu yok |

Nakit mutlu yol (Hold → teslim → Release net/hold CREDIT + `FREELANCER_RELEASE`) **tamamlanmadı.**

---

## 4. Disk yüzeyi (canlı nakit değil)

Faz 2 commit öncesi: T2/T3/T4 ilgili **39/39** (9 dosya). PayTR iframe + oid sonrası: `paytr.test.ts` **9/9**, `http-idempotency.test.ts` **6/6**, T3/T4 surface **1+1**. Bellek e2e nakit yolu bu raporun canlı kanıtı **sayılmaz.**

---

## 5. Bilinçli yapılmayanlar

- 13. oda, Redis, Socket, GİB, çekim, Turnstile, DevLabs exec
- `PAYTR_ALLOW_MOCK_CHECKOUT=true` veya `wallets.amount_minor` UPDATE
- `LOCAL_MOCK_AUTH` / `MAINTENANCE_MODE` / sahte `phase`
- Auth `service_role` ile kullanıcı basma
- PayTR mağaza panelinden aktivasyon (operatör; kod icat etmez)
- Faz 4 Studio/DevLabs üretim gümrüğü dumanı
- Bu dilimde ikinci git commit / push (PayTR iframe/oid yaması commit edilmedi)

---

## 6. Kalan risk (Faz 3 kapanışı)

1. **Akademi SHA256 nakit mührü basılmadı.** Omurga ve vitrin bağlı; get-token 001. Operatör: PayTR panelinde mağazanın iFrame API için **aktif** olduğunu doğrula (sicil/key/salt eşleşmesi; sandbox mağaza). Sonra `npm run ops:t3-academy-loop`.
2. **T4 emanet halkası açık.** GoTrue tuzakları kodda kapalı; müşteri kaydı hız tavanı + aynı PayTR 001. Tavan düşünce ve token yeşil olunca `npm run ops:t4-freelancer-loop`.
3. **Inngest Cloud yok.** `checks.inngest = unconfigured` doğru kalır. Valör/TTL üretimde işlemez.
4. **PayTR iframe/oid yaması commit edilmedi.** Çalışma ağacında durur; 80383f1 yalnızca T3/T4 betik + T2 omurga mühürleridir.
5. **Push yok.** `80383f1` yalnız yerel `master`.
6. Logout / storage CORS / tarihsel tespit silmeleri hâlâ çalışma ağacında (bu fazın konusu değil).

---

## Karar özeti

| Sıra | İş | Durum |
|------|-----|--------|
| 1 | Faz 2 commit | **tamam** — `80383f1` |
| 2 | T3 Auth + katalog kilidi | **bağlı** — vatandaş + 25000 minor kilit |
| 3 | T3 PayTR → SETTLED → sınav → SHA256 | **fail-closed** — get-token 001; sahte CREDIT yok |
| 4 | T4 GoTrue / text-id | **tamam** (kod + surface); canlı satıcı girişi yeşil |
| 5 | T4 EscrowHold → release | **fail-closed** — müşteri `signUp` hız tavanı; nakit kapısı aynı 001 |
| 6 | S43 / tek bakiye | **şema mührü yeşil**; nakit salımı yok |

Faz 3 öğrenme ve kazanç halkalarının **kod kapısını** bağlar. Nakit SHA256 ve emanet RELEASE mührü bu raporun tarihi itibarıyla **basılmadı.**
