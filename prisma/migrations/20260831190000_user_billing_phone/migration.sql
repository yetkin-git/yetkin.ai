-- Fatura künyesine PayTR user_phone için zorunlu cep. Sahte 05000000000 yazılmaz; biçim uygulama katmanında.

ALTER TABLE "user_billing_info" ADD COLUMN "phone" VARCHAR(16) NOT NULL DEFAULT '';

ALTER TABLE "user_billing_info" ALTER COLUMN "phone" DROP DEFAULT;

ALTER TABLE "user_billing_info" DROP CONSTRAINT IF EXISTS "user_billing_info_fields_by_type";

ALTER TABLE "user_billing_info"
  ADD CONSTRAINT "user_billing_info_fields_by_type"
  CHECK (
    (
      "invoice_type" = 'INDIVIDUAL'
      AND "full_name" IS NOT NULL AND length(btrim("full_name")) > 0
      AND length(btrim("address")) > 0
      AND length(btrim("phone")) > 0
      AND ("tckn" IS NULL OR "tckn" ~ '^[1-9][0-9]{10}$')
      AND "company_title" IS NULL
      AND "tax_office" IS NULL
      AND "vkn" IS NULL
    )
    OR
    (
      "invoice_type" = 'CORPORATE'
      AND "company_title" IS NOT NULL AND length(btrim("company_title")) > 0
      AND "tax_office" IS NOT NULL AND length(btrim("tax_office")) > 0
      AND "vkn" ~ '^[0-9]{10}$'
      AND length(btrim("address")) > 0
      AND length(btrim("phone")) > 0
      AND "full_name" IS NULL
      AND "tckn" IS NULL
    )
  );
