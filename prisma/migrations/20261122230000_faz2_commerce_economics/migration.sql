-- Faz 2 — E-Ticaret ekonomi katmanı (kâr / kargo / kampanya / paket / özet / radar).
-- stock_ledgers'a ciro yazılmaz. Her tablo FORCE RLS + rls_deny_unscoped.

CREATE TYPE "CommerceCampaignVerdict" AS ENUM ('SAFE', 'THIN', 'LOSS');
CREATE TYPE "CommerceBundleType" AS ENUM ('TWO', 'THREE');
CREATE TYPE "CommerceBundleStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'DISMISSED');
CREATE TYPE "CommerceActionKind" AS ENUM ('REPRICE', 'BUNDLE', 'RESTOCK', 'LOWER_AD', 'PAUSE_SKU');
CREATE TYPE "CommerceActionStatus" AS ENUM ('SUGGESTED', 'APPLIED', 'DISMISSED');
CREATE TYPE "CommerceGapSource" AS ENUM ('OWN_CATALOG', 'GRANT_CALL', 'TETKIK', 'MARKETPLACE_TREND');
CREATE TYPE "CommerceSuggestionStatus" AS ENUM ('NEW', 'SEEN', 'DISMISSED', 'CONVERTED');

CREATE TABLE "commerce_unit_economics" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "cost_minor" INTEGER NOT NULL,
  "desi_grams" INTEGER NOT NULL,
  "vat_bps" INTEGER NOT NULL DEFAULT 2000,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commerce_unit_economics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "commerce_unit_economics_variant_id_store_id_key"
  ON "commerce_unit_economics"("variant_id", "store_id");

ALTER TABLE "commerce_unit_economics"
  ADD CONSTRAINT "commerce_unit_economics_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_unit_economics"
  ADD CONSTRAINT "commerce_unit_economics_variant_fkey"
  FOREIGN KEY ("variant_id", "store_id") REFERENCES "commerce_variants"("id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_shipping_tariffs" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "carrier" VARCHAR(40) NOT NULL,
  "band_min_grams" INTEGER NOT NULL,
  "band_max_grams" INTEGER NOT NULL,
  "price_minor" INTEGER NOT NULL,
  "effective_from" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commerce_shipping_tariffs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_shipping_tariffs_store_id_carrier_effective_from_idx"
  ON "commerce_shipping_tariffs"("store_id", "carrier", "effective_from");

ALTER TABLE "commerce_shipping_tariffs"
  ADD CONSTRAINT "commerce_shipping_tariffs_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_channel_economics" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "channel" "SalesChannelKind" NOT NULL,
  "commission_bps" INTEGER NOT NULL,
  "cargo_minor_per_order" INTEGER NOT NULL,
  "return_rate_bps" INTEGER NOT NULL DEFAULT 0,
  "ad_cost_minor_per_order" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "commerce_channel_economics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "commerce_channel_economics_store_id_channel_key"
  ON "commerce_channel_economics"("store_id", "channel");

ALTER TABLE "commerce_channel_economics"
  ADD CONSTRAINT "commerce_channel_economics_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_campaign_simulations" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "channel" "SalesChannelKind" NOT NULL,
  "list_price_minor" INTEGER NOT NULL,
  "discount_bps" INTEGER NOT NULL,
  "net_minor" INTEGER NOT NULL,
  "margin_bps" INTEGER NOT NULL,
  "break_even_bps" INTEGER NOT NULL,
  "verdict" "CommerceCampaignVerdict" NOT NULL,
  "title" VARCHAR(120) NOT NULL DEFAULT '',
  "body" VARCHAR(500) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_campaign_simulations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_campaign_simulations_store_id_created_at_idx"
  ON "commerce_campaign_simulations"("store_id", "created_at");

ALTER TABLE "commerce_campaign_simulations"
  ADD CONSTRAINT "commerce_campaign_simulations_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_bundle_proposals" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "type" "CommerceBundleType" NOT NULL,
  "member_variant_ids" TEXT[],
  "single_price_minor" INTEGER NOT NULL,
  "suggested_price_minor" INTEGER NOT NULL,
  "net_minor" INTEGER NOT NULL,
  "margin_bps" INTEGER NOT NULL,
  "cargo_saved_minor" INTEGER NOT NULL,
  "rationale" VARCHAR(500) NOT NULL,
  "status" "CommerceBundleStatus" NOT NULL DEFAULT 'PROPOSED',
  "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accepted_product_id" TEXT,
  "sales_copy" VARCHAR(1000) NOT NULL DEFAULT '',
  CONSTRAINT "commerce_bundle_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_bundle_proposals_store_id_status_computed_at_idx"
  ON "commerce_bundle_proposals"("store_id", "status", "computed_at");

ALTER TABLE "commerce_bundle_proposals"
  ADD CONSTRAINT "commerce_bundle_proposals_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_daily_briefs" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "day_key" VARCHAR(10) NOT NULL,
  "payload_json" TEXT NOT NULL,
  "net_minor" INTEGER NOT NULL,
  "loss_sku_count" INTEGER NOT NULL,
  "summary_text" VARCHAR(800) NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_daily_briefs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "commerce_daily_briefs_store_id_day_key_key"
  ON "commerce_daily_briefs"("store_id", "day_key");

ALTER TABLE "commerce_daily_briefs"
  ADD CONSTRAINT "commerce_daily_briefs_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_profit_actions" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "brief_id" TEXT NOT NULL,
  "kind" "CommerceActionKind" NOT NULL,
  "variant_id" TEXT,
  "params_json" TEXT NOT NULL,
  "expected_gain_minor" INTEGER NOT NULL,
  "status" "CommerceActionStatus" NOT NULL DEFAULT 'SUGGESTED',
  "applied_at" TIMESTAMP(3),
  "rationale" VARCHAR(300) NOT NULL DEFAULT '',
  CONSTRAINT "commerce_profit_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_profit_actions_store_id_status_idx"
  ON "commerce_profit_actions"("store_id", "status");

ALTER TABLE "commerce_profit_actions"
  ADD CONSTRAINT "commerce_profit_actions_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_profit_actions"
  ADD CONSTRAINT "commerce_profit_actions_brief_fkey"
  FOREIGN KEY ("brief_id") REFERENCES "commerce_daily_briefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_catalog_gap_signals" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "price_band_minor" INTEGER NOT NULL,
  "demand_index" INTEGER NOT NULL,
  "supply_gap" INTEGER NOT NULL,
  "source" "CommerceGapSource" NOT NULL,
  "evidence_json" TEXT NOT NULL,
  "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_catalog_gap_signals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_catalog_gap_signals_store_id_computed_at_idx"
  ON "commerce_catalog_gap_signals"("store_id", "computed_at");

ALTER TABLE "commerce_catalog_gap_signals"
  ADD CONSTRAINT "commerce_catalog_gap_signals_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "commerce_product_suggestions" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "target_price_minor" INTEGER NOT NULL,
  "rationale" VARCHAR(500) NOT NULL,
  "signal_ids" TEXT[],
  "status" "CommerceSuggestionStatus" NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_product_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "commerce_product_suggestions_store_id_status_created_at_idx"
  ON "commerce_product_suggestions"("store_id", "status", "created_at");

ALTER TABLE "commerce_product_suggestions"
  ADD CONSTRAINT "commerce_product_suggestions_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FORCE RLS + rls_deny_unscoped (idempotent)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commerce_unit_economics',
    'commerce_shipping_tariffs',
    'commerce_channel_economics',
    'commerce_campaign_simulations',
    'commerce_bundle_proposals',
    'commerce_daily_briefs',
    'commerce_profit_actions',
    'commerce_catalog_gap_signals',
    'commerce_product_suggestions'
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
