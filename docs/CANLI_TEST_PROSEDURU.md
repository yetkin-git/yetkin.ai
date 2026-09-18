# Canlı Nakit Tanığı — Faz 0 Operatör Prosedürü

| Alan | Değer |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Amaç | Gerçek kartla PayTR `CLEARED` tanığı almak. A5: tanık yokken «para akıyor» denmez. |
| Kapsam | Cüzdan yükleme (kart → `payment_orders` + `ledger_entries` + `wallets`) → `01_office_ai` satın alma → sınav → `/academy/dogrula/[hash]` |
| Dayanak | `.system_docs/ops/ops-db.md` §13.1 · `lib/kernel/payments/wallet-top-up.ts` · `docs/ops/DURUM.md` |

Bu belge **nasıl yapılacağını** yazar. Çalıştırılabilir nakit SSOT koddur; bu dosya operatör el kitabıdır.

---

## 0. ₺1 notu (kod gerçeği)

CEO talimatı «1 TL’lik CLEARED» ruhunu ister: en küçük gerçek kart çekimi.

Kod tabanı bundan büyüktür:

| Sabit | Değer | Anlam |
|-------|-------|--------|
| `WALLET_TOP_UP_MIN_MINOR` | `1000` | **₺10** |
| `WALLET_TOP_UP_MAX_MINOR` | `2_000_000` | ₺20.000 |
| `ACADEMY_CATALOG_PRICE_MINOR["01_office_ai"]` | `89_000` | Kurs listesi **₺890** (KDV dahil) |

**₺1 (`amountMinor = 100`) denemesi beklenen şekilde reddedilir** — `assertWalletTopUpAmountMinor` bandı Anayasa A1 tamsayı kilididir, yayın engeli değildir. Faz 0’ın «küçük tutarlı CLEARED» tanığı **₺10 gerçek kart**tır.

Kursu ₺1’e indirme. Fiyat kilidi Super Admin satırıdır; tanık için fiyatı bozma.

---

## 1. Ön koşullar (hepsi yeşil olmadan kart çekilmez)

Operatör + Super Admin çift göz.

1. Üretim `https://yetkin.ai` ayakta. `GET /api/health` → `ok: true`, `checks.db = ok`, `checks.payments = configured`.
2. Vercel Production secret store:
   - `PAYTR_MERCHANT_ID` / `PAYTR_MERCHANT_KEY` / `PAYTR_MERCHANT_SALT` = **canlı** mağaza üçlüsü (test mağaza yazılmaz).
   - `PAYTR_SANDBOX` **boş** (silinmiş).
   - `PAYTR_ALLOW_MOCK_CHECKOUT` **boş**. Üretimde `true` ise checkout throw eder; CREDIT yazmaz.
3. PayTR paneli → Bildirim URL: `https://yetkin.ai/api/paytr/callback` (aynı handler: `/api/payments/webhooks/paytr`).
4. Test vatandaşı: gerçek e-posta + telefon. Super Admin hesabıyla kart çekme — kimlik karışmasın. `E2E_T3_EMAIL` lab hesabı kullanılacaksa o hesabın üretimde var olduğunu doğrula.
5. `npm run ops:t3-academy-loop` **bu prosedürün yerine geçmez.** T3 döngüsü HMAC gövdesini handler’a basar; canlı kart tanığı değildir.
6. Mock / sandbox / sahte `wallets.amount_minor` yazımı yasaktır.

---

## 2. Adım adım — ₺10 CLEARED tanığı

### 2.1 Bakiye öncesi fotoğraf

Test vatandaşıyla `https://yetkin.ai/cuzdan` aç. Ekrandaki bakiyeyi not et (`B0`, kuruş).

SQL (Super Admin / ops, üretim read-only):

```sql
SELECT w.user_id, w.amount_minor, w.currency_code
FROM wallets w
JOIN users u ON u.id = w.user_id
WHERE u.email = '<test-vatandas-email>';
```

`B0` bu satırdaki `amount_minor`’dır. Satır yoksa ilk yüklemede cüzdan doğar.

### 2.2 Kart çekimi

1. `/cuzdan` → yükleme formu.
2. Tutar: **10** (₺). Kod ₺10 altını reddeder.
3. Yasal tikler: mesafeli sözleşme + anında ifa. Fatura bilgisi dolu.
4. PayTR iframe açılır. **Gerçek kart** ile 3D Secure tamamla.
5. Dönüş URL’sini bekle. Ekranda «yüklendi» tek başına tanık değildir.

### 2.3 Webhook ve üçlü teyit

PayTR Bildirim URL’si HMAC ile gelir. Operatör **üç tabloda aynı tutarı** görür:

```sql
-- 1) Sipariş CLEARED
SELECT merchant_oid, status, amount_minor, currency_code, paid_at, cleared_at
FROM payment_orders
WHERE user_id = '<user-id>'
ORDER BY created_at DESC
LIMIT 5;
-- Beklenen: status = 'CLEARED', amount_minor = 1000, currency_code = 'TRY'

-- 2) Defter CREDIT (append-only)
SELECT id, direction, amount_minor, purpose, idempotency_key, created_at
FROM ledger_entries
WHERE user_id = '<user-id>'
ORDER BY created_at DESC
LIMIT 5;
-- Beklenen: direction = 'CREDIT', amount_minor = 1000, payment_orders satırıyla aynı tutar

-- 3) Cüzdan artışı
SELECT amount_minor FROM wallets WHERE user_id = '<user-id>';
-- Beklenen: amount_minor = B0 + 1000
```

Üçü de yeşil değilse tanık **alınmamıştır**. PENDING takılırsa 2 saat kuralını bekle; FAILED ise kartı tekrar çekme — önce anomaly / HMAC log.

Tanık kaydı (bu kesite işlenir, Anayasa’ya sayı basılmaz): `merchant_oid`, `cleared_at`, `amount_minor = 1000`, operatör adı, tarih.

---

## 3. Adım adım — `01_office_ai` SETTLED satın alma

Cüzdan `B0 + 1000` iken katalog **₺890** ister. Boş kalan fark için ikinci bir kart çekimi (₺890 − cüzdan) iframe’den doğar; bant içidir.

1. `https://yetkin.ai/academy/01_office_ai` antre.
2. Satın al. Fiyat kilidi vitrindeki `amountMinor` ile birebir. Tikler + fatura.
3. Cüzdan yetiyorsa kart açılmaz; yetmiyorsa PayTR iframe kalanı çeker (yine gerçek kart, yine `CLEARED`).

```sql
SELECT id, status, amount_minor, currency_code, settled_at
FROM academy_purchases
WHERE user_id = '<user-id>'
  AND course_id = (SELECT id FROM academy_courses WHERE slug = '01_office_ai');
-- Beklenen: status = 'SETTLED', amount_minor = 89000
```

Cüzdan: `amount_minor` kurs tutarı kadar düşer. Ledger’da satın alma DEBIT satırı durur. CREDIT satırı (kart) ile net bakiye mutabık.

---

## 4. Sınav ve mühür (T3 kapanışı)

1. 9 dersin tamamını izle / tamamla (`academy_lesson_completions` 9/9).
2. Antrede sınav. Baraj kod SSOT: `ACADEMY_EXAM_PASS_SCORE = 70`.
3. Sertifika hash’i doğar. Ödeme tutarı mühür yükünde **yoktur**.
4. **Anonim / oturumsuz** sekmede: `https://yetkin.ai/academy/dogrula/<hash>` → `sealStatus=valid`.

Bu adım nakit tanığını tamamlar: para CLEARED, lisans SETTLED, mühür kamuya açık.

---

## 5. Bitti sayılır / sayılmaz

| Koşul | Hüküm |
|-------|--------|
| `payment_orders.status = CLEARED` + `ledger_entries` CREDIT + `wallets.amount_minor` artışı, aynı `amount_minor` | **P0-1 nakit tanığı kapanır** |
| `academy_purchases.status = SETTLED` amiral SKU | Lisans tanığı |
| `/dogrula` oturumsuz `valid` | Mühür tanığı |
| Sandbox iframe, mock token, SQL ile bakiye yazma, T3 HMAC simülasyonu | **Tanık değildir** |
| Yalnız ekran «başarılı» metni | **Tanık değildir** |

Yeşil olunca `docs/ops/DURUM.md` «PayTR canlı tanık» satırı **Bu kesitte yok** cümlesinden operatör teyidine çevrilir (tarih + `merchant_oid` son 6 karakter; tam OID Anayasa’ya basılmaz).

**18 Eylül 2026:** P0-1 yeşil. Kesit satırı operatör teyidine çevrildi. Ayrıntı §7.

---

## 6. Güvenlik ve temizlik

- Test kartı gerçekse ₺10 + olası ₺890 çekimi şirket kartı / muhasebe fişi ile izlenir. İade PayTR panelinden; defter satırı silinmez (append-only).
- Test vatandaşının kişisel verisi KVKK sınıfındadır. Log’a kart PAN yazılmaz.
- Bu prosedür reklam/satış basma izni değildir; yalnız «para hattı tanıksız» P0’ını kapatır. Reklam ayrı CEO kararıdır.

---

## 7. Tanık kaydı — P0-1 kapandı (18 Eylül 2026)

Super Admin canlı ortamda (PayTR iframe + 3D Secure) gerçek kart çekimini tamamladı.

| Alan | Teyit |
|------|--------|
| Tarih | 18 Eylül 2026 |
| Ortam | Üretim `yetkin.ai` — canlı mağaza, sandbox/mock yok |
| Kanal | PayTR iframe + 3D Secure |
| Bakiye öncesi | ₺10,00 (`amount_minor = 1000`) |
| Bakiye sonrası | ₺25,00 (`amount_minor = 2500`) |
| CLEARED tutar | **₺15,00** (`amount_minor = 1500`) — ₺10 tabanının üstünde, geçerlidir |
| Defter | 3 → 4 satır; CREDIT kaydı düştü |
| `merchant_oid` | Tam OID bu belgeye basılmaz (A5 / KVKK) |
| Hüküm | **P0-1 nakit tanığı kapandı.** `docs/ops/DURUM.md` satırı operatör teyidine çevrildi. |

Lisans tanığı (`academy_purchases` SETTLED) ve anonim `/dogrula` bu kaydın dışındadır; P0-1 kapanışı için zorunlu değildir.
