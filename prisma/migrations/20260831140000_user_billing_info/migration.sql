-- Kullanıcı fatura künyesi — Bireysel / Kurumsal. User satırı şişmez; 1:1 profil.
-- Tip-özel zorunlu alanlar CHECK ile mühürlenir. PostgREST yazmaz; Prisma yazar.

CREATE TYPE "BillingInvoiceType" AS ENUM ('INDIVIDUAL', 'CORPORATE');

CREATE TABLE "user_billing_info" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invoice_type" "BillingInvoiceType" NOT NULL,
    "full_name" TEXT,
    "tckn" VARCHAR(11),
    "company_title" TEXT,
    "tax_office" TEXT,
    "vkn" VARCHAR(10),
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_billing_info_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_billing_info_user_id_key" ON "user_billing_info"("user_id");

ALTER TABLE "user_billing_info"
  ADD CONSTRAINT "user_billing_info_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_billing_info"
  ADD CONSTRAINT "user_billing_info_fields_by_type"
  CHECK (
    (
      "invoice_type" = 'INDIVIDUAL'
      AND "full_name" IS NOT NULL AND length(btrim("full_name")) > 0
      AND length(btrim("address")) > 0
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
      AND "full_name" IS NULL
      AND "tckn" IS NULL
    )
  );
