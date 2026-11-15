-- Yetkin Commerce Aşama 2: Trendyol kimlik kasası, ilan eşlemesi, paket+satır fişi.
-- Düz supplierId, apiKey ve apiSecret kolonu yoktur. Mühür ccred1:.
-- Uzak stok on_hand_qty üzerine yazılmaz. Kargo etiketi bu dosyada yoktur.
-- FORCE RLS. owner_user_id sahiplik sicilinde olmadığı için deny-unscoped.
-- INSERT / UPDATE / DELETE politikası üretilmez. Yeni GRANT açılmaz.

-- CreateEnum
CREATE TYPE "CommerceChannel" AS ENUM ('TRENDYOL');

-- CreateEnum
CREATE TYPE "CommerceListingSyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "CommerceWebhookReceiptStatus" AS ENUM ('APPLIED', 'STOCK_SHORT');

-- CreateTable
CREATE TABLE "commerce_marketplace_credentials" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "channel" "CommerceChannel" NOT NULL,
    "supplier_hint" VARCHAR(4) NOT NULL,
    "supplier_seal" TEXT NOT NULL,
    "api_key_seal" TEXT NOT NULL,
    "api_secret_seal" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_marketplace_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_channel_listings" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "channel" "CommerceChannel" NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "barcode" VARCHAR(14) NOT NULL,
    "remote_barcode" VARCHAR(40) NOT NULL,
    "remote_product_id" VARCHAR(64),
    "sync_status" "CommerceListingSyncStatus" NOT NULL DEFAULT 'PENDING',
    "last_error" VARCHAR(500) NOT NULL DEFAULT '',
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_channel_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_marketplace_webhook_receipts" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "channel" "CommerceChannel" NOT NULL,
    "external_order_id" VARCHAR(64) NOT NULL,
    "line_id" VARCHAR(64) NOT NULL,
    "status" "CommerceWebhookReceiptStatus" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" VARCHAR(500) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_marketplace_webhook_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commerce_credentials_store_channel_uidx" ON "commerce_marketplace_credentials"("store_id", "channel");

-- CreateIndex
CREATE INDEX "commerce_credentials_hint_idx" ON "commerce_marketplace_credentials"("channel", "supplier_hint");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_listings_variant_channel_uidx" ON "commerce_channel_listings"("variant_id", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_listings_remote_barcode_uidx" ON "commerce_channel_listings"("store_id", "channel", "remote_barcode");

-- CreateIndex
CREATE INDEX "commerce_listings_store_status_idx" ON "commerce_channel_listings"("store_id", "channel", "sync_status");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_webhook_receipts_line_uidx" ON "commerce_marketplace_webhook_receipts"("store_id", "channel", "external_order_id", "line_id");

-- CreateIndex
CREATE INDEX "commerce_webhook_receipts_store_idx" ON "commerce_marketplace_webhook_receipts"("store_id", "created_at");

-- AddForeignKey
ALTER TABLE "commerce_marketplace_credentials" ADD CONSTRAINT "commerce_credentials_store_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_channel_listings" ADD CONSTRAINT "commerce_listings_store_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_channel_listings" ADD CONSTRAINT "commerce_listings_variant_fkey" FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_marketplace_webhook_receipts" ADD CONSTRAINT "commerce_receipts_store_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_marketplace_webhook_receipts" ADD CONSTRAINT "commerce_receipts_variant_fkey" FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Kimlik mührü. Düz anahtar yazılamaz.
ALTER TABLE "commerce_marketplace_credentials"
  ADD CONSTRAINT "commerce_credentials_hint_shape"
  CHECK ("supplier_hint" ~ '^[0-9]{4}$');

ALTER TABLE "commerce_marketplace_credentials"
  ADD CONSTRAINT "commerce_credentials_supplier_seal"
  CHECK ("supplier_seal" LIKE 'ccred1:%');

ALTER TABLE "commerce_marketplace_credentials"
  ADD CONSTRAINT "commerce_credentials_api_key_seal"
  CHECK ("api_key_seal" LIKE 'ccred1:%');

ALTER TABLE "commerce_marketplace_credentials"
  ADD CONSTRAINT "commerce_credentials_api_secret_seal"
  CHECK ("api_secret_seal" LIKE 'ccred1:%');

-- İlan mührü. Kopyalanan SKU ve barkod Aşama 1 şeklindedir.
ALTER TABLE "commerce_channel_listings"
  ADD CONSTRAINT "commerce_listings_sku_shape"
  CHECK (
    char_length("sku") BETWEEN 1 AND 64
    AND "sku" ~ '^[A-Z0-9][A-Z0-9._-]*$'
  );

ALTER TABLE "commerce_channel_listings"
  ADD CONSTRAINT "commerce_listings_barcode_shape"
  CHECK (
    "barcode" ~ '^[0-9]+$'
    AND char_length("barcode") IN (8, 12, 13, 14)
  );

ALTER TABLE "commerce_channel_listings"
  ADD CONSTRAINT "commerce_listings_remote_barcode_shape"
  CHECK (char_length("remote_barcode") BETWEEN 1 AND 40);

ALTER TABLE "commerce_channel_listings"
  ADD CONSTRAINT "commerce_listings_remote_product_shape"
  CHECK (
    "remote_product_id" IS NULL
    OR char_length("remote_product_id") BETWEEN 1 AND 64
  );

-- Fiş mührü. updated_at yoktur. Tane paket artı satırdır.
ALTER TABLE "commerce_marketplace_webhook_receipts"
  ADD CONSTRAINT "commerce_receipts_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "commerce_marketplace_webhook_receipts"
  ADD CONSTRAINT "commerce_receipts_ids_present"
  CHECK (
    char_length("external_order_id") BETWEEN 1 AND 64
    AND char_length("line_id") BETWEEN 1 AND 64
  );

-- FORCE RLS. Yazma politikası üretilmez.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'commerce_marketplace_credentials',
    'commerce_channel_listings',
    'commerce_marketplace_webhook_receipts'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
       AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
       AND NOT EXISTS (
         SELECT 1
         FROM pg_policies
         WHERE schemaname = 'public'
           AND tablename = tbl
           AND policyname = 'rls_deny_unscoped'
       ) THEN
      EXECUTE format(
        'CREATE POLICY rls_deny_unscoped ON public.%I FOR SELECT TO anon, authenticated USING (false)',
        tbl
      );
    END IF;
  END LOOP;
END $$;
