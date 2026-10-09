-- Junior fatura alanları düz TCKN, telefon ve adres tutmaz.
-- Kolon `jinv1:` mührü taşır. Sağlayıcı kernel PayTR hattıdır.
-- Liste fiyatı katalogdadır; CHECK sabit kuruş kilidini bırakır.
-- Aynı merchant_oid `applied_merchant_oids` içinde durur ve süreyi yeniden uzatmaz.

ALTER TABLE "junior_subscriptions" DROP CONSTRAINT "junior_subscriptions_shape";

ALTER TABLE "junior_subscriptions"
  ALTER COLUMN "invoice_tckn" TYPE TEXT,
  ALTER COLUMN "invoice_phone" TYPE TEXT;

ALTER TABLE "junior_subscriptions"
  ADD COLUMN "applied_merchant_oids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "junior_subscriptions"
SET
  "provider" = 'paytr',
  "invoice_tckn" = 'jinv1:redacted',
  "invoice_phone" = 'jinv1:redacted',
  "invoice_address" = 'jinv1:redacted',
  "applied_merchant_oids" = ARRAY["provider_ref"]
WHERE "invoice_tckn" !~ '^jinv1:';

UPDATE "junior_subscriptions"
SET "applied_merchant_oids" = ARRAY["provider_ref"]
WHERE cardinality("applied_merchant_oids") = 0
  AND "provider_ref" <> '';

ALTER TABLE "junior_subscriptions"
  ADD CONSTRAINT "junior_subscriptions_shape"
  CHECK (
    "plan_code" = 'junior-yearly'
    AND "list_price_minor" > 0
    AND "currency_code" = 'TRY'
    AND "provider" = 'paytr'
    AND "provider_ref" ~ '^[A-Z0-9]{8,64}$'
    AND "card_last4" ~ '^[0-9]{4}$'
    AND char_length(btrim("invoice_name")) BETWEEN 3 AND 80
    AND "invoice_tckn" LIKE 'jinv1:%'
    AND "invoice_tckn" !~ '^[0-9]{11}$'
    AND "invoice_phone" LIKE 'jinv1:%'
    AND "invoice_phone" !~ '^[0-9]+$'
    AND "invoice_address" LIKE 'jinv1:%'
    AND "provider_ref" = ANY("applied_merchant_oids")
    AND "elective_quota" = 3
    AND "grade_switch_rights" IN (0, 1)
    AND (
      "status" = 'PENDING'
      OR (
        "status" = 'ACTIVE'
        AND "activated_at" IS NOT NULL
        AND "expires_at" IS NOT NULL
        AND "expires_at" > "activated_at"
      )
    )
  );
