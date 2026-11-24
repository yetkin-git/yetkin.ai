-- Faz 5 — sipariş operasyon masası, etiket göndericisi, plan kodu.
-- Stok defterine ciro yazılmaz. Yeni tablo FORCE RLS + rls_deny_unscoped.
-- Mevcut mağaza planı GROWTH kalır. Katalog tohumu Super Admin tutarını ezmez.

DO $$ BEGIN
  CREATE TYPE "CommercePlanCode" AS ENUM ('STARTER', 'GROWTH', 'SCALE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CommerceFulfillmentChannel" AS ENUM ('TRENDYOL', 'HEPSIBURADA', 'OWN_STORE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CommerceFulfillmentStatus" AS ENUM ('NEW', 'PREPARED', 'SHIPPED', 'DELIVERED', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "commerce_stores" ADD COLUMN IF NOT EXISTS "logo_url" VARCHAR(500);
ALTER TABLE "commerce_stores" ADD COLUMN IF NOT EXISTS "sender_title" VARCHAR(120);
ALTER TABLE "commerce_stores" ADD COLUMN IF NOT EXISTS "sender_phone" VARCHAR(20);
ALTER TABLE "commerce_stores" ADD COLUMN IF NOT EXISTS "sender_address" VARCHAR(400);
ALTER TABLE "commerce_stores" ADD COLUMN IF NOT EXISTS "plan_code" "CommercePlanCode" NOT NULL DEFAULT 'GROWTH';

CREATE TABLE IF NOT EXISTS "commerce_fulfillment_orders" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "channel" "CommerceFulfillmentChannel" NOT NULL,
  "external_order_no" VARCHAR(64) NOT NULL,
  "customer_name" VARCHAR(120) NOT NULL DEFAULT '',
  "customer_phone" VARCHAR(20) NOT NULL DEFAULT '',
  "shipping_address" VARCHAR(500) NOT NULL DEFAULT '',
  "cargo_company" VARCHAR(40) NOT NULL DEFAULT '',
  "cargo_tracking_code" VARCHAR(64) NOT NULL DEFAULT '',
  "items_json" JSONB NOT NULL,
  "total_minor" INTEGER NOT NULL DEFAULT 0,
  "status" "CommerceFulfillmentStatus" NOT NULL DEFAULT 'NEW',
  "label_printed_at" TIMESTAMP(3),
  "shipped_at" TIMESTAMP(3),
  "sla_deadline_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_fulfillment_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "commerce_fulfillment_orders_store_id_channel_external_order_no_key"
  ON "commerce_fulfillment_orders"("store_id", "channel", "external_order_no");

CREATE INDEX IF NOT EXISTS "commerce_fulfillment_orders_store_id_status_created_at_idx"
  ON "commerce_fulfillment_orders"("store_id", "status", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_fulfillment_orders_store_fkey'
  ) THEN
    ALTER TABLE "commerce_fulfillment_orders"
      ADD CONSTRAINT "commerce_fulfillment_orders_store_fkey"
      FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commerce_fulfillment_orders'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
       AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = 'rls_deny_unscoped'
      ) THEN
        EXECUTE format(
          'CREATE POLICY rls_deny_unscoped ON public.%I FOR SELECT TO anon, authenticated USING (false)',
          t
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- Üç kademe açılış tutarı. Satır yoksa yazılır. Super Admin (updated_by) tutarı ezilmez.
DO $$
DECLARE
  seed record;
  existing record;
  v_id text;
  v_unit text;
  v_amount integer;
  v_description text;
  catalog_id text;
  old_minor integer;
  v_existing_id text;
  ledger_id text;
BEGIN
  FOR seed IN
    SELECT *
    FROM (
      VALUES
        (
          'cat_commerce_starter',
          'starter',
          199000,
          'E-Ticaret Başlangıç aylık planı. 1 mağaza, 1 pazaryeri, 250 SKU.'
        ),
        (
          'cat_commerce_growth',
          'growth',
          399000,
          'E-Ticaret Büyüme aylık planı. 3 mağaza, rekabet motoru, set ve radar.'
        ),
        (
          'cat_commerce_scale',
          'scale',
          799000,
          'E-Ticaret Kurumsal aylık planı. Sınırsız mağaza ve SKU, toplu etiket.'
        )
    ) AS v(id, unit_key, amount_minor, description)
  LOOP
    v_id := seed.id;
    v_unit := seed.unit_key;
    v_amount := seed.amount_minor;
    v_description := seed.description;

    SELECT e.id AS id, e.amount_minor AS amount_minor, e.updated_by AS updated_by
      INTO existing
      FROM "price_catalog_entries" e
      WHERE e.module_key = 'commerce'
        AND e.unit_key = v_unit;

    IF NOT FOUND THEN
      INSERT INTO "price_catalog_entries" (
        "id", "module_key", "unit_key", "unit_type", "amount_minor", "currency_code",
        "is_active", "min_minor", "max_minor", "description", "created_at", "updated_at"
      ) VALUES (
        v_id, 'commerce', v_unit, 'MINOR', v_amount, 'TRY',
        true, 1, 50000000, v_description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
      catalog_id := v_id;
      old_minor := 0;
    ELSIF existing.updated_by IS NOT NULL THEN
      CONTINUE;
    ELSIF existing.amount_minor IS DISTINCT FROM v_amount THEN
      v_existing_id := existing.id;
      UPDATE "price_catalog_entries"
      SET "amount_minor" = v_amount,
          "is_active" = true,
          "description" = v_description,
          "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = v_existing_id;
      catalog_id := v_existing_id;
      old_minor := existing.amount_minor;
    ELSE
      CONTINUE;
    END IF;

    ledger_id := 'pcl_open_commerce_' || v_unit;
    INSERT INTO "price_catalog_decision_ledger" (
      "id", "catalog_entry_id", "module_key", "unit_key", "unit_type",
      "reason_code", "reason", "old_minor", "new_minor", "currency_code",
      "actor_user_id", "created_at"
    )
    SELECT
      ledger_id, catalog_id, 'commerce', v_unit, 'MINOR',
      'ADMIN_MANUAL',
      'Faz 5 plan açılışı. Tutar amount_minor kuruştur. Super Admin yazdıysa bu tohum ezmez.',
      old_minor, v_amount, 'TRY',
      'migration:20261123180000', CURRENT_TIMESTAMP
    WHERE NOT EXISTS (
      SELECT 1 FROM "price_catalog_decision_ledger" d WHERE d.id = ledger_id
    );
  END LOOP;
END $$;
