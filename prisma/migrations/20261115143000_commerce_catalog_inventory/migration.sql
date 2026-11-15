-- Yetkin Commerce Aşama 1: mağaza, Master SKU, append-only stok defteri.
-- Fiyat amount_minor. Para birimi TRY. Sahiplik owner_user_id (RLS sicilinde yok).
-- Cüzdan, sipariş, kanal kimliği ve pazaryeri çağrısı bu dosyada yoktur.
-- FORCE RLS burada da basılır. Event trigger varsa politika ikinci kez açılmaz.

-- CreateEnum
CREATE TYPE "CommerceStoreStatus" AS ENUM ('DRAFT', 'ACTIVE');

-- CreateEnum
CREATE TYPE "CommerceProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommerceVariantStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PASSIVE');

-- CreateEnum
CREATE TYPE "CommerceCatalogSource" AS ENUM ('MANUAL', 'MANUAL_CSV', 'TEZGAH_PAZARYERI');

-- CreateEnum
CREATE TYPE "InventoryDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('INBOUND', 'SALE', 'ADJUSTMENT', 'RETURN');

-- CreateTable
CREATE TABLE "commerce_stores" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(48) NOT NULL,
    "status" "CommerceStoreStatus" NOT NULL DEFAULT 'DRAFT',
    "currency_code" CHAR(3) NOT NULL DEFAULT 'TRY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_products" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "attributes" JSONB NOT NULL DEFAULT '[]',
    "other_note" VARCHAR(500) NOT NULL DEFAULT '',
    "listing_market" VARCHAR(32),
    "source" "CommerceCatalogSource" NOT NULL,
    "status" "CommerceProductStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_variants" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" VARCHAR(64) NOT NULL,
    "barcode" VARCHAR(14),
    "amount_minor" INTEGER,
    "on_hand_qty" INTEGER NOT NULL DEFAULT 0,
    "safety_buffer" INTEGER NOT NULL DEFAULT 0,
    "status" "CommerceVariantStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "direction" "InventoryDirection" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "on_hand_after" INTEGER NOT NULL,
    "note" VARCHAR(500) NOT NULL DEFAULT '',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commerce_stores_slug_key" ON "commerce_stores"("slug");

-- CreateIndex
CREATE INDEX "commerce_stores_owner_user_id_created_at_idx" ON "commerce_stores"("owner_user_id", "created_at");

-- CreateIndex
CREATE INDEX "commerce_products_store_id_status_created_at_idx" ON "commerce_products"("store_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_products_id_store_id_key" ON "commerce_products"("id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_variants_store_id_sku_key" ON "commerce_variants"("store_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "commerce_variants_id_store_id_key" ON "commerce_variants"("id", "store_id");

-- CreateIndex
CREATE INDEX "commerce_variants_product_id_idx" ON "commerce_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transactions_idempotency_key_key" ON "inventory_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "inventory_transactions_variant_id_created_at_idx" ON "inventory_transactions"("variant_id", "created_at");

-- CreateIndex
CREATE INDEX "inventory_transactions_store_id_created_at_idx" ON "inventory_transactions"("store_id", "created_at");

-- AddForeignKey
ALTER TABLE "commerce_stores" ADD CONSTRAINT "commerce_stores_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_products" ADD CONSTRAINT "commerce_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_variants" ADD CONSTRAINT "commerce_variants_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce_variants" ADD CONSTRAINT "commerce_variants_product_id_store_id_fkey" FOREIGN KEY ("product_id", "store_id") REFERENCES "commerce_products"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_store_id_fkey" FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Mağaza mühürleri
ALTER TABLE "commerce_stores"
  ADD CONSTRAINT "commerce_stores_currency_try"
  CHECK ("currency_code" = 'TRY');

ALTER TABLE "commerce_stores"
  ADD CONSTRAINT "commerce_stores_slug_shape"
  CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Varyant mühürleri
ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_on_hand_non_negative"
  CHECK ("on_hand_qty" >= 0);

ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_safety_buffer_non_negative"
  CHECK ("safety_buffer" >= 0);

ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_amount_minor_non_negative"
  CHECK ("amount_minor" IS NULL OR "amount_minor" >= 0);

ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_active_price_barcode"
  CHECK (
    "status"::text <> 'ACTIVE'
    OR ("amount_minor" IS NOT NULL AND "barcode" IS NOT NULL)
  );

ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_barcode_shape"
  CHECK (
    "barcode" IS NULL
    OR (
      "barcode" ~ '^[0-9]+$'
      AND char_length("barcode") IN (8, 12, 13, 14)
    )
  );

ALTER TABLE "commerce_variants"
  ADD CONSTRAINT "commerce_variants_sku_shape"
  CHECK (
    char_length("sku") BETWEEN 1 AND 64
    AND "sku" ~ '^[A-Z0-9][A-Z0-9._-]*$'
  );

-- Dolu barkod mağazada tektir. Boş taslaklar çakışmaz.
CREATE UNIQUE INDEX "commerce_variants_store_barcode_uidx"
  ON "commerce_variants" ("store_id", "barcode")
  WHERE "barcode" IS NOT NULL;

-- Defter mühürleri. updated_at yoktur. Açılış stoku 0 bir hareket değildir.
ALTER TABLE "inventory_transactions"
  ADD CONSTRAINT "inventory_transactions_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "inventory_transactions"
  ADD CONSTRAINT "inventory_transactions_type_direction"
  CHECK (
    (
      "type"::text IN ('INBOUND', 'RETURN')
      AND "direction"::text = 'IN'
    )
    OR (
      "type"::text = 'SALE'
      AND "direction"::text = 'OUT'
    )
    OR (
      "type"::text = 'ADJUSTMENT'
      AND "direction"::text IN ('IN', 'OUT')
      AND char_length("note") >= 2
    )
  );

CREATE OR REPLACE FUNCTION yetkin_forbid_inventory_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'inventory_transactions is append-only';
END;
$$;

DROP TRIGGER IF EXISTS inventory_transactions_append_only ON inventory_transactions;
CREATE TRIGGER inventory_transactions_append_only
  BEFORE UPDATE OR DELETE ON inventory_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_forbid_inventory_mutation();

-- FORCE RLS. owner_user_id sahiplik sicilinde olmadığı için deny-unscoped.
-- INSERT / UPDATE / DELETE politikası üretilmez. Yeni GRANT açılmaz.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'commerce_stores',
    'commerce_products',
    'commerce_variants',
    'inventory_transactions'
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
