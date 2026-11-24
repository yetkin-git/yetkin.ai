-- Faz 4 — kanal fiyat kuralı, rakip beslemesi, rekabet günlüğü.
-- Girdi KDV bayrağı, ilan fiyatı, kargo baremi tekilliği.
-- Yeni tablolar FORCE RLS + rls_deny_unscoped. Dış site kazıması yok.

ALTER TABLE "commerce_unit_economics"
  ADD COLUMN IF NOT EXISTS "cost_includes_vat" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "commerce_channel_listings"
  ADD COLUMN IF NOT EXISTS "price_minor" INTEGER;

-- Aynı bantta eski satırlar varsa en güncel effective_from kalır.
DELETE FROM "commerce_shipping_tariffs" AS older
USING "commerce_shipping_tariffs" AS newer
WHERE older.store_id = newer.store_id
  AND older.carrier = newer.carrier
  AND older.band_min_grams = newer.band_min_grams
  AND older.band_max_grams = newer.band_max_grams
  AND (
    older.effective_from < newer.effective_from
    OR (older.effective_from = newer.effective_from AND older.id < newer.id)
  );

CREATE UNIQUE INDEX IF NOT EXISTS "commerce_shipping_tariff_band_uidx"
  ON "commerce_shipping_tariffs" ("store_id", "carrier", "band_min_grams", "band_max_grams");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommercePriceChannel') THEN
    CREATE TYPE "CommercePriceChannel" AS ENUM ('TRENDYOL', 'HEPSIBURADA', 'OWN_STORE', 'AKAKCE', 'CIMRI');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommerceRepriceStrategy') THEN
    CREATE TYPE "CommerceRepriceStrategy" AS ENUM ('FIXED', 'UNDERCUT_STEP', 'MATCH_LOWEST');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommerceRepriceDecision') THEN
    CREATE TYPE "CommerceRepriceDecision" AS ENUM (
      'UNDERCUT',
      'MATCHED',
      'HOLD_AT_FLOOR',
      'COMPETITOR_BELOW_FLOOR_ALERT',
      'REVERT_TO_BASE'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "commerce_channel_price_rules" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "channel" "CommercePriceChannel" NOT NULL,
  "base_price_minor" INTEGER NOT NULL,
  "min_margin_bps" INTEGER NOT NULL DEFAULT 800,
  "manual_floor_minor" INTEGER,
  "strategy" "CommerceRepriceStrategy" NOT NULL DEFAULT 'FIXED',
  "step_minor" INTEGER NOT NULL DEFAULT 100,
  "auto_apply" BOOLEAN NOT NULL DEFAULT false,
  "active_price_minor" INTEGER NOT NULL,
  "computed_floor_minor" INTEGER,
  "last_repriced_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commerce_channel_price_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "commerce_channel_price_rules_store_id_variant_id_channel_key"
  ON "commerce_channel_price_rules" ("store_id", "variant_id", "channel");

CREATE INDEX IF NOT EXISTS "commerce_channel_price_rules_store_id_auto_apply_idx"
  ON "commerce_channel_price_rules" ("store_id", "auto_apply");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_channel_price_rules_store_fkey'
  ) THEN
    ALTER TABLE "commerce_channel_price_rules"
      ADD CONSTRAINT "commerce_channel_price_rules_store_fkey"
      FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_channel_price_rules_variant_fkey'
  ) THEN
    ALTER TABLE "commerce_channel_price_rules"
      ADD CONSTRAINT "commerce_channel_price_rules_variant_fkey"
      FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "commerce_competitor_quotes" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "channel" "CommercePriceChannel" NOT NULL,
  "competitor_name" VARCHAR(120) NOT NULL,
  "competitor_url" VARCHAR(500) NOT NULL DEFAULT '',
  "competitor_price_minor" INTEGER NOT NULL,
  "observed_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_competitor_quotes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commerce_competitor_quotes_store_id_variant_id_channel_observed_at_idx"
  ON "commerce_competitor_quotes" ("store_id", "variant_id", "channel", "observed_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_competitor_quotes_store_fkey'
  ) THEN
    ALTER TABLE "commerce_competitor_quotes"
      ADD CONSTRAINT "commerce_competitor_quotes_store_fkey"
      FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_competitor_quotes_variant_fkey'
  ) THEN
    ALTER TABLE "commerce_competitor_quotes"
      ADD CONSTRAINT "commerce_competitor_quotes_variant_fkey"
      FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "commerce_reprice_logs" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "channel" "CommercePriceChannel" NOT NULL,
  "previous_price_minor" INTEGER NOT NULL,
  "competitor_price_minor" INTEGER,
  "floor_price_minor" INTEGER NOT NULL,
  "new_price_minor" INTEGER NOT NULL,
  "decision" "CommerceRepriceDecision" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_reprice_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commerce_reprice_logs_store_id_created_at_idx"
  ON "commerce_reprice_logs" ("store_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_reprice_logs_store_fkey'
  ) THEN
    ALTER TABLE "commerce_reprice_logs"
      ADD CONSTRAINT "commerce_reprice_logs_store_fkey"
      FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_reprice_logs_variant_fkey'
  ) THEN
    ALTER TABLE "commerce_reprice_logs"
      ADD CONSTRAINT "commerce_reprice_logs_variant_fkey"
      FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commerce_channel_price_rules',
    'commerce_competitor_quotes',
    'commerce_reprice_logs'
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
