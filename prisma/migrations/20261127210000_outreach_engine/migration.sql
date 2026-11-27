-- Otonom B2B outreach motoru. Super Admin onay kuyruğu.
-- Sahiplik kolonu yoktur; FORCE RLS + kapsamsız SELECT deny.
-- PostgREST yazma politikası üretilmez. Gönderim yalnız sunucudaki Inngest işindedir.
--
-- Ayrı gönderen alan adı (`OUTREACH_FROM_EMAIL`) env'de tutulur; bu tabloya yazılmaz.
-- Değer boşsa gönderim fail-closed durur (kod: lib/kernel/outreach/sender.ts).
-- Günlük tavan 15–20 bandı DB CHECK ile kilitlidir; 15 varsayılandır.

CREATE TYPE "OutreachVertical" AS ENUM ('KURUMSAL', 'ETICARET', 'HIBE');

CREATE TYPE "OutreachDraftStatus" AS ENUM (
    'PENDING_APPROVAL',
    'APPROVED',
    'SENT',
    'REJECTED',
    'FAILED'
);

CREATE TABLE "outreach_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "daily_limit" INTEGER NOT NULL DEFAULT 15,
    "send_hour_trt" INTEGER NOT NULL DEFAULT 9,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outreach_settings_key_key" ON "outreach_settings"("key");

-- Tek anahtar adı: ikinci bir bayrak icat edilmez.
ALTER TABLE "outreach_settings"
  ADD CONSTRAINT "outreach_settings_key_known"
  CHECK ("key" = 'OUTREACH_ENGINE_ENABLED');

-- Günlük tavan 15–20. Dışı yazılırsa satır düşer; kod da aynı bandı okur.
ALTER TABLE "outreach_settings"
  ADD CONSTRAINT "outreach_settings_daily_limit_band"
  CHECK ("daily_limit" >= 15 AND "daily_limit" <= 20);

-- 09:00 TRT varsayılanı korunur; gece yarısı ve sonrası yasaktır.
ALTER TABLE "outreach_settings"
  ADD CONSTRAINT "outreach_settings_send_hour_band"
  CHECK ("send_hour_trt" >= 6 AND "send_hour_trt" <= 18);

ALTER TABLE "outreach_settings"
  ADD CONSTRAINT "outreach_settings_updated_by_uuid"
  CHECK (
    "updated_by" IS NULL
    OR "updated_by" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

-- Motor kapalı doğar. Açmak Super Admin eylemidir ve denetim mührü ister.
INSERT INTO "outreach_settings" ("id", "key", "is_enabled", "daily_limit", "send_hour_trt", "updated_at")
VALUES ('outreach-engine', 'OUTREACH_ENGINE_ENABLED', false, 15, 9, CURRENT_TIMESTAMP);

CREATE TABLE "outreach_campaign_drafts" (
    "id" TEXT NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "recipient_email" VARCHAR(160) NOT NULL,
    "sector" VARCHAR(80) NOT NULL,
    "vertical" "OutreachVertical" NOT NULL,
    "source_url" VARCHAR(300),
    "subject" VARCHAR(180) NOT NULL,
    "body_text" TEXT NOT NULL,
    "status" "OutreachDraftStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "error_message" VARCHAR(500) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outreach_campaign_drafts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outreach_campaign_drafts_status_created_at_idx"
  ON "outreach_campaign_drafts"("status", "created_at");

CREATE INDEX "outreach_campaign_drafts_recipient_email_status_idx"
  ON "outreach_campaign_drafts"("recipient_email", "status");

ALTER TABLE "outreach_campaign_drafts"
  ADD CONSTRAINT "outreach_campaign_drafts_email_shape"
  CHECK ("recipient_email" ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');

ALTER TABLE "outreach_campaign_drafts"
  ADD CONSTRAINT "outreach_campaign_drafts_body_present"
  CHECK (length(btrim("body_text")) >= 20);

ALTER TABLE "outreach_campaign_drafts"
  ADD CONSTRAINT "outreach_campaign_drafts_approved_by_uuid"
  CHECK (
    "approved_by" IS NULL
    OR "approved_by" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

-- SENT damgası olmadan `sent_at` yazılmaz; tersi de doğrudur.
ALTER TABLE "outreach_campaign_drafts"
  ADD CONSTRAINT "outreach_campaign_drafts_sent_at_status"
  CHECK (
    ("status" = 'SENT' AND "sent_at" IS NOT NULL)
    OR ("status" <> 'SENT' AND "sent_at" IS NULL)
  );

CREATE TABLE "outreach_suppressions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "reason" VARCHAR(40) NOT NULL DEFAULT 'unsubscribe',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outreach_suppressions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outreach_suppressions_email_key" ON "outreach_suppressions"("email");

ALTER TABLE "outreach_suppressions"
  ADD CONSTRAINT "outreach_suppressions_email_shape"
  CHECK ("email" ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$');

ALTER TABLE "outreach_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outreach_settings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "outreach_campaign_drafts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outreach_campaign_drafts" FORCE ROW LEVEL SECURITY;
ALTER TABLE "outreach_suppressions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outreach_suppressions" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY[
      'outreach_settings',
      'outreach_campaign_drafts',
      'outreach_suppressions'
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

-- Süper yönetici eylem mührü — outreach eylemleri.
ALTER TABLE "super_admin_audit_logs" DROP CONSTRAINT IF EXISTS "super_admin_audit_logs_action_known";

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
    'b2b_send',
    'ai_model_bind',
    'employer_verify',
    'offer_request_status',
    'outreach_switch',
    'outreach_draft',
    'outreach_send'
  ));
