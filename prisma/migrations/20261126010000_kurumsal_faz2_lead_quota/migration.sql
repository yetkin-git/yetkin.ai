-- Kurumsal Faz 2: lead kuyruğu durumları + fiyat anlık görüntüsü + taxNumber indeksi.
-- Yeni tablo yok; mevcut `kurumsal_offer_requests` ve `kurumsal_job_postings` kolonları.
-- RLS zaten FORCE; event trigger yeni tabloda otomatik mühürler — burada ALTER yeter.

CREATE TYPE "KurumsalOfferRequestStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'WON',
  'LOST'
);

ALTER TABLE "kurumsal_offer_requests"
  ADD COLUMN IF NOT EXISTS "status" "KurumsalOfferRequestStatus" NOT NULL DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS "handled_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "handled_by" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "admin_note" VARCHAR(1000) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "quoted_amount_minor" INTEGER;

CREATE INDEX IF NOT EXISTS "kurumsal_offer_requests_status_created_at_idx"
  ON "kurumsal_offer_requests" ("status", "created_at");

CREATE INDEX IF NOT EXISTS "kurumsal_offer_requests_email_package_key_created_at_idx"
  ON "kurumsal_offer_requests" ("email", "package_key", "created_at");

CREATE INDEX IF NOT EXISTS "kurumsal_job_postings_owner_user_id_tax_number_idx"
  ON "kurumsal_job_postings" ("owner_user_id", "tax_number");

CREATE INDEX IF NOT EXISTS "kurumsal_job_postings_tax_number_idx"
  ON "kurumsal_job_postings" ("tax_number");

-- Mevcut tabloların RLS mührü bozulmasın (idempotent yeniden FORCE).
ALTER TABLE "kurumsal_offer_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_offer_requests" FORCE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'kurumsal_offer_requests'
      AND policyname = 'rls_deny_unscoped'
  ) THEN
    CREATE POLICY rls_deny_unscoped ON "kurumsal_offer_requests"
      FOR SELECT USING (false);
  END IF;
END $$;

ALTER TABLE "kurumsal_job_postings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_job_postings" FORCE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'kurumsal_job_postings'
      AND policyname = 'rls_deny_unscoped'
  ) THEN
    CREATE POLICY rls_deny_unscoped ON "kurumsal_job_postings"
      FOR SELECT USING (false);
  END IF;
END $$;
