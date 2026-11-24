-- YetkinHibe Faz 2B — başvuru, evrak kasası, ajans müşterisi.
-- Idempotent. Sahiplik user_id. hibe_client_id müşteri kartıdır, RLS sahibi değildir.

CREATE TABLE IF NOT EXISTS "hibe_clients" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "company_name" VARCHAR(160) NOT NULL,
  "nace_group" VARCHAR(8) NOT NULL,
  "province_code" VARCHAR(8) NOT NULL,
  "audience" VARCHAR(40) NOT NULL,
  "employee_count" INTEGER NOT NULL,
  "company_age_years" INTEGER NOT NULL,
  "rd_maturity_level" VARCHAR(20) NOT NULL,
  "export_active" BOOLEAN NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hibe_clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hibe_applications" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "hibe_client_id" TEXT,
  "grant_call_id" VARCHAR(120) NOT NULL,
  "dossier_id" TEXT,
  "title" VARCHAR(300) NOT NULL,
  "phase" VARCHAR(40) NOT NULL,
  "next_deadline_at" TIMESTAMPTZ(6),
  "notes" VARCHAR(2000),
  "last_reminder_days" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hibe_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "hibe_documents" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "application_id" TEXT NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "category" VARCHAR(40) NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "file_url" VARCHAR(500),
  "reference_code" VARCHAR(80),
  "reviewer_note" VARCHAR(1000),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hibe_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "hibe_clients_user_id_created_at_idx" ON "hibe_clients"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "hibe_applications_user_id_updated_at_idx" ON "hibe_applications"("user_id", "updated_at");
CREATE INDEX IF NOT EXISTS "hibe_applications_next_deadline_at_idx" ON "hibe_applications"("next_deadline_at");
CREATE INDEX IF NOT EXISTS "hibe_documents_user_id_updated_at_idx" ON "hibe_documents"("user_id", "updated_at");
CREATE INDEX IF NOT EXISTS "hibe_documents_application_id_updated_at_idx" ON "hibe_documents"("application_id", "updated_at");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_clients_user_id_fkey') THEN
    ALTER TABLE "hibe_clients"
      ADD CONSTRAINT "hibe_clients_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_user_id_fkey') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_hibe_client_id_fkey') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_hibe_client_id_fkey"
      FOREIGN KEY ("hibe_client_id") REFERENCES "hibe_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_grant_call_id_fkey') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_grant_call_id_fkey"
      FOREIGN KEY ("grant_call_id") REFERENCES "yetkinhibe_grant_calls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_dossier_id_fkey') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_dossier_id_fkey"
      FOREIGN KEY ("dossier_id") REFERENCES "hibe_dossiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_documents_user_id_fkey') THEN
    ALTER TABLE "hibe_documents"
      ADD CONSTRAINT "hibe_documents_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_documents_application_id_fkey') THEN
    ALTER TABLE "hibe_documents"
      ADD CONSTRAINT "hibe_documents_application_id_fkey"
      FOREIGN KEY ("application_id") REFERENCES "hibe_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_phase_check') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_phase_check"
      CHECK ("phase" IN ('APPLICATION_APPROVAL', 'INTERIM_REPORT', 'INVOICE_SGK', 'AUDITOR_VISIT', 'PAYOUT'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_applications_reminder_check') THEN
    ALTER TABLE "hibe_applications"
      ADD CONSTRAINT "hibe_applications_reminder_check"
      CHECK ("last_reminder_days" IS NULL OR "last_reminder_days" IN (7, 3, 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_documents_category_check') THEN
    ALTER TABLE "hibe_documents"
      ADD CONSTRAINT "hibe_documents_category_check"
      CHECK ("category" IN ('VERGI_LEVHASI', 'SGK_HIZMET', 'FATURA_MAKBUZ', 'TEKNIK_RAPOR', 'DIGER'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_documents_status_check') THEN
    ALTER TABLE "hibe_documents"
      ADD CONSTRAINT "hibe_documents_status_check"
      CHECK ("status" IN ('approved', 'pending', 'missing', 'rejected'));
  END IF;
END $$;

-- FORCE ROW LEVEL SECURITY + rls_deny_unscoped. Kullanıcı tablolarında rls_own_user_id.
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'hibe_clients',
    'hibe_applications',
    'hibe_documents'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
       AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
       AND NOT EXISTS (
         SELECT 1 FROM pg_policies
         WHERE schemaname = 'public' AND tablename = tbl AND policyname = 'rls_deny_unscoped'
       ) THEN
      EXECUTE format(
        'CREATE POLICY rls_deny_unscoped ON public.%I FOR SELECT TO anon, authenticated USING (false)',
        tbl
      );
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'yetkin_apply_rls_owner_policies'
  ) THEN
    PERFORM public.yetkin_apply_rls_owner_policies('hibe_clients');
    PERFORM public.yetkin_apply_rls_owner_policies('hibe_applications');
    PERFORM public.yetkin_apply_rls_owner_policies('hibe_documents');
  END IF;
END $$;
