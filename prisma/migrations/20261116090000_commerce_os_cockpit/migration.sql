-- E-Ticaret kokpiti: merkez kart alanları, stok defteri, satış kanalı, gelen kutu.
-- Fiyat amount_minor / base_price_minor. Düz API anahtarı yazılmaz.
-- FORCE RLS. PostgREST yazma politikası üretilmez.

ALTER TABLE "commerce_products"
  ADD COLUMN "sku" VARCHAR(64) NOT NULL DEFAULT '',
  ADD COLUMN "base_price_minor" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "approved_stock_qty" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "critical_stock_qty" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "commerce_products"
  ADD CONSTRAINT "commerce_products_sku_shape"
  CHECK (
    "sku" = ''
    OR (
      char_length("sku") BETWEEN 1 AND 64
      AND "sku" ~ '^[A-Z0-9][A-Z0-9._-]*$'
    )
  );

ALTER TABLE "commerce_products"
  ADD CONSTRAINT "commerce_products_base_price_non_negative"
  CHECK ("base_price_minor" >= 0);

ALTER TABLE "commerce_products"
  ADD CONSTRAINT "commerce_products_approved_stock_non_negative"
  CHECK ("approved_stock_qty" >= 0);

ALTER TABLE "commerce_products"
  ADD CONSTRAINT "commerce_products_critical_stock_non_negative"
  CHECK ("critical_stock_qty" >= 0);

CREATE TYPE "StockLedgerType" AS ENUM (
  'INBOUND_DRAFT',
  'INBOUND_APPROVED',
  'CHANNEL_SALE',
  'RETURN_RESTOCK'
);

CREATE TYPE "SalesChannelKind" AS ENUM (
  'OWN_STORE',
  'TRENDYOL',
  'HEPSIBURADA',
  'AMAZON',
  'N11'
);

CREATE TYPE "SalesChannelStatus" AS ENUM (
  'DISCONNECTED',
  'CONNECTED',
  'ERROR'
);

CREATE TYPE "CommerceInboxKind" AS ENUM (
  'ORDER',
  'QUESTION',
  'EXPERT_TASK'
);

CREATE TABLE "stock_ledgers" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "actor_user_id" TEXT NOT NULL,
  "type" "StockLedgerType" NOT NULL,
  "channel" "SalesChannelKind" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "stock_after" INTEGER NOT NULL,
  "note" VARCHAR(500) NOT NULL DEFAULT '',
  "idempotency_key" TEXT NOT NULL,
  "settles_ledger_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "stock_ledgers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sales_channels" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "kind" "SalesChannelKind" NOT NULL,
  "status" "SalesChannelStatus" NOT NULL DEFAULT 'DISCONNECTED',
  "api_key_hint" VARCHAR(4) NOT NULL DEFAULT '',
  "api_key_seal" TEXT NOT NULL DEFAULT '',
  "last_error" VARCHAR(500) NOT NULL DEFAULT '',
  "last_synced_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "sales_channels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commerce_inbox_entries" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "product_id" TEXT,
  "channel" "SalesChannelKind" NOT NULL,
  "kind" "CommerceInboxKind" NOT NULL,
  "external_ref" VARCHAR(64) NOT NULL DEFAULT '',
  "customer_label" VARCHAR(80) NOT NULL DEFAULT '',
  "body" VARCHAR(2000) NOT NULL,
  "reply_body" VARCHAR(2000) NOT NULL DEFAULT '',
  "reply_sent_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "commerce_inbox_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stock_ledgers_idempotency_key_key" ON "stock_ledgers"("idempotency_key");
CREATE UNIQUE INDEX "stock_ledgers_settles_ledger_id_key" ON "stock_ledgers"("settles_ledger_id");
CREATE INDEX "stock_ledgers_product_id_created_at_idx" ON "stock_ledgers"("product_id", "created_at");
CREATE INDEX "stock_ledgers_store_id_created_at_idx" ON "stock_ledgers"("store_id", "created_at");

CREATE UNIQUE INDEX "sales_channels_store_id_kind_key" ON "sales_channels"("store_id", "kind");
CREATE INDEX "sales_channels_store_id_status_idx" ON "sales_channels"("store_id", "status");

CREATE INDEX "commerce_inbox_entries_store_id_created_at_idx" ON "commerce_inbox_entries"("store_id", "created_at");

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_quantity_positive" CHECK ("quantity" > 0);

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_stock_after_non_negative" CHECK ("stock_after" >= 0);

ALTER TABLE "sales_channels"
  ADD CONSTRAINT "sales_channels_connected_seal"
  CHECK (
    "status"::text <> 'CONNECTED'
    OR "kind"::text = 'OWN_STORE'
    OR "api_key_seal" LIKE 'ccred1:%'
  );

ALTER TABLE "commerce_inbox_entries"
  ADD CONSTRAINT "commerce_inbox_entries_body_len"
  CHECK (char_length("body") BETWEEN 2 AND 2000);

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_store_id_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "commerce_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_actor_user_id_fkey"
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_settles_ledger_id_fkey"
  FOREIGN KEY ("settles_ledger_id") REFERENCES "stock_ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sales_channels"
  ADD CONSTRAINT "sales_channels_store_id_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_inbox_entries"
  ADD CONSTRAINT "commerce_inbox_entries_store_id_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_inbox_entries"
  ADD CONSTRAINT "commerce_inbox_entries_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "commerce_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION yetkin_forbid_stock_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'stock_ledgers is append-only';
END;
$$;

DROP TRIGGER IF EXISTS stock_ledgers_append_only ON stock_ledgers;
CREATE TRIGGER stock_ledgers_append_only
  BEFORE UPDATE OR DELETE ON stock_ledgers
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_forbid_stock_ledger_mutation();

ALTER TABLE "stock_ledgers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_ledgers" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sales_channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales_channels" FORCE ROW LEVEL SECURITY;
ALTER TABLE "commerce_inbox_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commerce_inbox_entries" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY[
      'stock_ledgers',
      'sales_channels',
      'commerce_inbox_entries'
    ]
    LOOP
      IF NOT EXISTS (
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
  END IF;
END $$;
