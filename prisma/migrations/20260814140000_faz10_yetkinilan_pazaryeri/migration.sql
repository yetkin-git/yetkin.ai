-- Faz 10 — Yetkinİlan: emlak/vasıta kategorisi, teklif+kapora, doping (S61-A).
-- Canlı migrate ayrı ops adımıdır. Canlı TKGM / sigorta API bu SQL'de yoktur.

-- CreateEnum
CREATE TYPE "MarketplaceProductCategory" AS ENUM ('DIGITAL_GOOD', 'SERVICE', 'REAL_ESTATE', 'VEHICLE');

-- CreateEnum
CREATE TYPE "MarketplaceOfferStatus" AS ENUM ('OPEN', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MarketplaceDopingStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "marketplace_products" ADD COLUMN "category" "MarketplaceProductCategory" NOT NULL DEFAULT 'DIGITAL_GOOD';
ALTER TABLE "marketplace_products" ADD COLUMN "is_doped" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "marketplace_products" ADD COLUMN "is_offer_allowed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "marketplace_products" ADD COLUMN "tkgm_block_parcel" TEXT;
ALTER TABLE "marketplace_products" ADD COLUMN "insurance_quote_hook" TEXT;
ALTER TABLE "marketplace_products" ADD COLUMN "doped_until" TIMESTAMP(3);

UPDATE "marketplace_products"
SET "category" = CASE "kind"
  WHEN 'SERVICE' THEN 'SERVICE'::"MarketplaceProductCategory"
  ELSE 'DIGITAL_GOOD'::"MarketplaceProductCategory"
END;

-- CreateTable
CREATE TABLE "marketplace_offers" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "seller_user_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "MarketplaceOfferStatus" NOT NULL DEFAULT 'OPEN',
    "escrow_hold_id" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_dopings" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" "MarketplaceDopingStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_dopings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketplace_products_category_status_idx" ON "marketplace_products"("category", "status");

-- CreateIndex
CREATE INDEX "marketplace_products_is_doped_status_idx" ON "marketplace_products"("is_doped", "status");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_offers_escrow_hold_id_key" ON "marketplace_offers"("escrow_hold_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_offers_order_id_key" ON "marketplace_offers"("order_id");

-- CreateIndex
CREATE INDEX "marketplace_offers_product_id_status_idx" ON "marketplace_offers"("product_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_offers_user_id_status_idx" ON "marketplace_offers"("user_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_offers_seller_user_id_status_idx" ON "marketplace_offers"("seller_user_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_dopings_product_id_status_idx" ON "marketplace_dopings"("product_id", "status");

-- CreateIndex
CREATE INDEX "marketplace_dopings_user_id_idx" ON "marketplace_dopings"("user_id");

-- CreateIndex
CREATE INDEX "marketplace_dopings_expires_at_idx" ON "marketplace_dopings"("expires_at");

-- AddForeignKey
ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_seller_user_id_fkey" FOREIGN KEY ("seller_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "marketplace_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_dopings" ADD CONSTRAINT "marketplace_dopings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "marketplace_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_dopings" ADD CONSTRAINT "marketplace_dopings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Katalog: emlak/vasıta tavanı (Int32 güvenli ₺20M) + doping tutarı (S11-A, kod sabiti fiyat yok).
INSERT INTO "price_catalog_entries" (
  "id",
  "module_key",
  "unit_key",
  "unit_type",
  "amount_minor",
  "currency_code",
  "is_active",
  "min_minor",
  "max_minor",
  "description",
  "created_at",
  "updated_at"
)
VALUES
  (
    'cat_pazaryeri_listing_asset_floor',
    'pazaryeri',
    'listing:asset-floor',
    'MINOR',
    100000,
    'TRY',
    true,
    10000,
    2000000000,
    'Pazaryeri emlak/vasıta ilan fiyat tabanı / tavanı (S61-A). Tavan Int32 güvenli ₺20M.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'cat_pazaryeri_doping_boost',
    'pazaryeri',
    'doping:boost',
    'MINOR',
    5000,
    'TRY',
    true,
    5000,
    5000,
    'Pazaryeri ilan doping / öne çıkarma ücreti (S61-A, S11-A).',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("module_key", "unit_key") DO UPDATE
SET
  "amount_minor" = EXCLUDED."amount_minor",
  "currency_code" = EXCLUDED."currency_code",
  "is_active" = true,
  "min_minor" = EXCLUDED."min_minor",
  "max_minor" = EXCLUDED."max_minor",
  "description" = EXCLUDED."description",
  "updated_at" = CURRENT_TIMESTAMP;

UPDATE "price_catalog_entries"
SET
  "description" = 'Pazaryeri dijital/hizmet ilan fiyat tabanı / tavanı.',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "module_key" = 'pazaryeri' AND "unit_key" = 'listing:floor';
