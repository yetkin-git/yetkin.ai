-- Faz 3 — Stratejik gelir hamleleri (S-01 kredi ekonomisi, §4.3 YetkinCV yayın mührü, §4.1 misafir ödeme).
--
-- Üç şema değişikliği, tek göç:
--
-- 1. `tezgah_daily_quotas` — günlük kotadan **aylık kredi havuzuna** geçiş.
--    Tablo adı tarihsel kalır (rename FORCE RLS sicilini ve `verify:rls-status`
--    mührünü kırar; 74 tablo kaydı tek tek yeniden yazılırdı). Değişen tek şey
--    `date_key`'in anlamı: üye `lite` havuzu artık `YYYY-MM` yazar.
--    Kolon `VARCHAR(16)` idi; `YYYY-MM-DD` (10) ve `YYYY-MM` (7) sığar. **Tip
--    değişmez** — bu bilinçlidir, RLS ve PK dokunulmaz.
--
-- 2. `yetkin_cv_seals` — ücretli **yayın** mührü. Sınav/puan/SWOT/plan ücretsiz
--    kalır; `sealed_publication` yalnız kamuya açık kartı ve dizin görünürlüğünü açar.
--
-- 3. `payment_orders` — **misafir ödeme**. `user_id` opsiyonel olur; `guest_email`,
--    tek kullanımlık `claim_token`, son kullanma ve fatura künyesi eklenir.
--    `appendLedgerEntry` sahipsiz CREDIT kabul etmez; defter `claim` anında yazılır.
--
-- RLS: yeni kolonlar yeni tablo doğurmaz. FORCE RLS zaten açıktır; sahiplik kolonu
-- `user_id` misafir satırında NULL'dır ve `rls_own_user_id` politikası `NULL = sub`
-- eşleşmediği için satırı **göstermez** (fail-closed). Kapsamsız deny politikası
-- eklenmez: `payment_orders` ve `yetkin_cv_seals` zaten owner politikası taşıyor.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Aylık kredi havuzu — tablo yorumu (davranış değişikliği sicile yazılır)
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE "tezgah_daily_quotas" IS
  'AI Tezgâh üretim sayacı. Tablo adı tarihseldir; date_key bir PERİYOT anahtarıdır. '
  'Üye lite havuzu = YYYY-MM (aylık kredi: ücretsiz 30, Pro 500), misafir lite = YYYY-MM-DD '
  '(günlük 3; IP kovası paylaşıldığı için aylık havuza bağlanmaz), tetkik = lifetime (1). '
  'Aylık devir %50, taban havuzun %50siyle sınırlı; okuma anında deterministik hesaplanır. '
  'Para, cüzdan ve defter bu tabloda yoktur.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. YetkinCV ücretli mühür / kamuya açık yayın
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "yetkin_cv_seals"
  ADD COLUMN IF NOT EXISTS "sealed_publication" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "publication_paid_merchant_oid" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(3);

COMMENT ON COLUMN "yetkin_cv_seals"."sealed_publication" IS
  'Kamuya açık kariyer kartı + uzman dizini görünürlüğü. Ücretsiz mühürde false; '
  'sınav/puan/SWOT/plan ücretsiz kalır. Para yayını satın alır, puanı değil.';

COMMENT ON COLUMN "yetkin_cv_seals"."publication_paid_merchant_oid" IS
  'Yayını açan CLEARED PayTR siparişi. Aynı merchantOid ikinci kez ücret almaz.';

CREATE INDEX IF NOT EXISTS "yetkin_cv_seals_sealed_publication_published_at_idx"
  ON "yetkin_cv_seals" ("sealed_publication", "published_at");

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Misafir ödeme — payment_orders
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "payment_orders"
  ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "payment_orders"
  ADD COLUMN IF NOT EXISTS "guest_email" VARCHAR(320),
  ADD COLUMN IF NOT EXISTS "claim_token" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "claim_token_expires_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "claim_token_used_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "guest_billing_json" TEXT;

COMMENT ON COLUMN "payment_orders"."user_id" IS
  'Faz 3 / §4.1: misafir ödemede NULL. Sahiplik bağlanana kadar defter CREDIT yazılmaz.';

COMMENT ON COLUMN "payment_orders"."claim_token" IS
  'Tek kullanımlık hesap sahiplenme anahtarı (/claim/[token]). CLEARED ve userId NULL iken üretilir.';
COMMENT ON COLUMN "payment_orders"."guest_billing_json" IS
  'Misafir fatura künyesi (JSON). Claim anında user_billing_info satırına dönüşür. TCKN/VKN düz metindir; kolon append-only değildir.';

-- Misafir satırı userId olmadan da bulunabilsin: e-posta + durum indeksi.
CREATE INDEX IF NOT EXISTS "payment_orders_guest_email_created_at_idx"
  ON "payment_orders" ("guest_email", "created_at");
CREATE INDEX IF NOT EXISTS "payment_orders_status_idx"
  ON "payment_orders" ("status");

-- Claim token tekilliği: aynı token iki siparişi açmaz. Partial unique — NULL çok olabilir.
CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_claim_token_key"
  ON "payment_orders" ("claim_token")
  WHERE "claim_token" IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RLS sürekliliği — yeni kolon yeni tablo değildir; FORCE RLS korunur.
--    Bu blok yalnız üç tablonun FORCE RLS'inin yerinde olduğunu doğrular ve
--    kapsamsız deny politikasını **payment_orders** için üretmez (owner politikası
--    zaten var: user_id NULL satır kimseye görünmez).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "tezgah_daily_quotas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_daily_quotas" FORCE ROW LEVEL SECURITY;
ALTER TABLE "yetkin_cv_seals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yetkin_cv_seals" FORCE ROW LEVEL SECURITY;
ALTER TABLE "payment_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_orders" FORCE ROW LEVEL SECURITY;
