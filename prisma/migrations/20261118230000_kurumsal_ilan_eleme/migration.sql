-- Kurumsal ilan ve aday eleme.
-- Sahte şirket, sahte ilan ve sahte aday INSERT edilmez.
-- test_score boş doğar; değer yalnız sunucu sınavından yazılır.
-- FORCE RLS. PostgREST yazma politikası üretilmez.

CREATE TYPE "KurumsalJobVertical" AS ENUM ('ECOMMERCE', 'GRANT', 'MARKETING', 'OFFICE', 'SOFTWARE');

CREATE TYPE "KurumsalJobApplicationStatus" AS ENUM ('PENDING_TEST', 'TESTED', 'SHORTLISTED', 'REJECTED');

CREATE TABLE "kurumsal_job_postings" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "vertical" "KurumsalJobVertical" NOT NULL,
    "description" VARCHAR(4000) NOT NULL,
    "min_score" INTEGER NOT NULL DEFAULT 70,
    "shortlist_limit" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kurumsal_job_postings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "kurumsal_job_postings_min_score_band" CHECK ("min_score" >= 0 AND "min_score" <= 100),
    CONSTRAINT "kurumsal_job_postings_shortlist_limit_band" CHECK ("shortlist_limit" >= 1 AND "shortlist_limit" <= 50)
);

CREATE TABLE "kurumsal_job_applications" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "candidate_user_id" TEXT,
    "candidate_name" VARCHAR(120) NOT NULL,
    "candidate_email" VARCHAR(160) NOT NULL,
    "cv_summary" VARCHAR(6000) NOT NULL,
    "test_score" INTEGER,
    "certificate_code" VARCHAR(64),
    "status" "KurumsalJobApplicationStatus" NOT NULL DEFAULT 'PENDING_TEST',
    "sitting_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kurumsal_job_applications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "kurumsal_job_applications_score_band" CHECK ("test_score" IS NULL OR ("test_score" >= 0 AND "test_score" <= 100))
);

CREATE UNIQUE INDEX "kurumsal_job_postings_slug_key" ON "kurumsal_job_postings"("slug");
CREATE INDEX "kurumsal_job_postings_owner_user_id_created_at_idx" ON "kurumsal_job_postings"("owner_user_id", "created_at");
CREATE UNIQUE INDEX "kurumsal_job_applications_sitting_id_key" ON "kurumsal_job_applications"("sitting_id");
CREATE UNIQUE INDEX "kurumsal_job_applications_job_id_candidate_user_id_key" ON "kurumsal_job_applications"("job_id", "candidate_user_id");
CREATE INDEX "kurumsal_job_applications_job_id_test_score_idx" ON "kurumsal_job_applications"("job_id", "test_score");

ALTER TABLE "kurumsal_job_postings"
  ADD CONSTRAINT "kurumsal_job_postings_owner_user_id_fkey"
  FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kurumsal_job_applications"
  ADD CONSTRAINT "kurumsal_job_applications_job_id_fkey"
  FOREIGN KEY ("job_id") REFERENCES "kurumsal_job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kurumsal_job_applications"
  ADD CONSTRAINT "kurumsal_job_applications_candidate_user_id_fkey"
  FOREIGN KEY ("candidate_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "kurumsal_job_applications"
  ADD CONSTRAINT "kurumsal_job_applications_sitting_id_fkey"
  FOREIGN KEY ("sitting_id") REFERENCES "yetkin_cv_sittings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "kurumsal_job_postings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_job_postings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_job_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_job_applications" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY['kurumsal_job_postings', 'kurumsal_job_applications']
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

DO $$
DECLARE
  existing record;
  v_amount integer := 290000;
  v_min integer := 1;
  v_max integer := 50000000;
  v_description text := 'Kurumsal İlan ve Otomatik Aday Eleme Paketi. Tutar katalog satırındadır. Satın alma tek başına aday puanı basmaz.';
  catalog_id text;
  old_minor integer;
  ledger_id text := 'pcl_open_kurumsal_job_screening_pack';
BEGIN
  IF v_amount <= 0 OR v_amount < v_min OR v_amount > v_max THEN
    RAISE EXCEPTION 'katalog tutarı bant dışında: kurumsal/job-screening-pack';
  END IF;

  SELECT e.id AS id, e.amount_minor AS amount_minor, e.updated_by AS updated_by
    INTO existing
    FROM "price_catalog_entries" e
    WHERE e.module_key = 'kurumsal'
      AND e.unit_key = 'job-screening-pack';

  IF NOT FOUND THEN
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
    ) VALUES (
      'cat_kurumsal_job_screening_pack',
      'kurumsal',
      'job-screening-pack',
      'MINOR',
      v_amount,
      'TRY',
      true,
      v_min,
      v_max,
      v_description,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
    catalog_id := 'cat_kurumsal_job_screening_pack';
    old_minor := 0;
  ELSIF existing.updated_by IS NOT NULL THEN
    RETURN;
  ELSIF existing.amount_minor IS DISTINCT FROM v_amount THEN
    UPDATE "price_catalog_entries"
    SET
      "amount_minor" = v_amount,
      "unit_type" = 'MINOR',
      "currency_code" = 'TRY',
      "is_active" = true,
      "min_minor" = v_min,
      "max_minor" = v_max,
      "description" = v_description,
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = existing.id;
    catalog_id := existing.id;
    old_minor := existing.amount_minor;
  ELSE
    UPDATE "price_catalog_entries"
    SET
      "unit_type" = 'MINOR',
      "currency_code" = 'TRY',
      "is_active" = true,
      "min_minor" = v_min,
      "max_minor" = v_max,
      "description" = v_description,
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = existing.id
      AND "updated_by" IS NULL;
    RETURN;
  END IF;

  INSERT INTO "price_catalog_decision_ledger" (
    "id",
    "catalog_entry_id",
    "module_key",
    "unit_key",
    "unit_type",
    "reason_code",
    "reason",
    "old_minor",
    "new_minor",
    "currency_code",
    "actor_user_id",
    "created_at"
  )
  SELECT
    ledger_id,
    catalog_id,
    'kurumsal',
    'job-screening-pack',
    'MINOR',
    'ADMIN_MANUAL',
    'Kurumsal eleme paketi katalog açılışı. Tutar amount_minor kuruştur. Super Admin yazdıysa bu tohum ezmez.',
    old_minor,
    v_amount,
    'TRY',
    'migration:20261118230000',
    CURRENT_TIMESTAMP
  WHERE NOT EXISTS (
    SELECT 1 FROM "price_catalog_decision_ledger" d WHERE d.id = ledger_id
  );
END $$;
