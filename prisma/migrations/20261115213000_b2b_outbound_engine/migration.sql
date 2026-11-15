-- B2B fırsat motoru. Super Admin kuyruğu. Sahiplik kolonu yoktur.
-- FORCE RLS. PostgREST yazma politikası üretilmez. anon/authenticated SELECT USING false.
-- B2B_OUTBOUND_ENABLED kapalı doğar. Günlük tavan 15'tir ve çek ile kilitlidir.

CREATE TYPE "B2bLeadChannel" AS ENUM ('WEB_TETKIK', 'TUBITAK_HIBE');

CREATE TYPE "B2bLeadStatus" AS ENUM ('QUEUED', 'DRAFT_READY', 'SEND_LOCK', 'SENT', 'FAILED');

CREATE TABLE "b2b_outbound_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "daily_limit" INTEGER NOT NULL DEFAULT 15,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_outbound_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_outbound_settings_key_key" ON "b2b_outbound_settings"("key");

ALTER TABLE "b2b_outbound_settings"
  ADD CONSTRAINT "b2b_outbound_settings_key_known"
  CHECK ("key" = 'B2B_OUTBOUND_ENABLED');

ALTER TABLE "b2b_outbound_settings"
  ADD CONSTRAINT "b2b_outbound_settings_daily_limit_15"
  CHECK ("daily_limit" = 15);

ALTER TABLE "b2b_outbound_settings"
  ADD CONSTRAINT "b2b_outbound_settings_updated_by_uuid"
  CHECK (
    "updated_by" IS NULL
    OR "updated_by" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

INSERT INTO "b2b_outbound_settings" ("id", "key", "enabled", "daily_limit", "updated_at")
VALUES ('b2b-outbound', 'B2B_OUTBOUND_ENABLED', false, 15, CURRENT_TIMESTAMP);

CREATE TABLE "b2b_outbound_daily_counters" (
    "day" DATE NOT NULL,
    "sent_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "b2b_outbound_daily_counters_pkey" PRIMARY KEY ("day"),
    CONSTRAINT "b2b_outbound_daily_counters_sent_band"
      CHECK ("sent_count" >= 0 AND "sent_count" <= 15)
);

CREATE TABLE "b2b_lead_campaign_items" (
    "id" TEXT NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "website_url" VARCHAR(300),
    "sector" VARCHAR(80) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "channel" "B2bLeadChannel" NOT NULL,
    "status" "B2bLeadStatus" NOT NULL DEFAULT 'QUEUED',
    "score" INTEGER,
    "note" VARCHAR(500) NOT NULL DEFAULT '',
    "findings_json" TEXT NOT NULL DEFAULT '',
    "subject" VARCHAR(180) NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "actor_user_id" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "b2b_lead_campaign_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "b2b_lead_campaign_items_status_created_at_idx"
  ON "b2b_lead_campaign_items"("status", "created_at");

CREATE INDEX "b2b_lead_campaign_items_created_at_idx"
  ON "b2b_lead_campaign_items"("created_at");

ALTER TABLE "b2b_lead_campaign_items"
  ADD CONSTRAINT "b2b_lead_campaign_items_actor_user_id_uuid"
  CHECK ("actor_user_id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');

ALTER TABLE "b2b_lead_campaign_items"
  ADD CONSTRAINT "b2b_lead_campaign_items_email_shape"
  CHECK ("email" ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');

ALTER TABLE "b2b_lead_campaign_items"
  ADD CONSTRAINT "b2b_lead_campaign_items_score_band"
  CHECK ("score" IS NULL OR ("score" >= 0 AND "score" <= 100));

ALTER TABLE "b2b_outbound_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "b2b_outbound_settings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "b2b_outbound_daily_counters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "b2b_outbound_daily_counters" FORCE ROW LEVEL SECURITY;
ALTER TABLE "b2b_lead_campaign_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "b2b_lead_campaign_items" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY[
      'b2b_outbound_settings',
      'b2b_outbound_daily_counters',
      'b2b_lead_campaign_items'
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

ALTER TABLE "super_admin_audit_logs" DROP CONSTRAINT "super_admin_audit_logs_action_known";

ALTER TABLE "super_admin_audit_logs"
  ADD CONSTRAINT "super_admin_audit_logs_action_known"
  CHECK ("action" IN (
    'catalog_publish',
    'catalog_price',
    'license_grant',
    'manual_refund',
    'certificate_revoke',
    'room_flag',
    'b2b_switch',
    'b2b_send'
  ));
