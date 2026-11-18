-- Ağırlıklı eleme kolonları.
-- Sahte şirket, sahte ilan ve sahte aday INSERT edilmez.
-- skill_scores ve weighted_score boş doğar; değer yalnız sunucu alt testinden yazılır.
-- job-screening-pack (290000 kuruş) satırı 20261118230000_kurumsal_ilan_eleme içindedir.
-- Bu dosya katalog tutarını ikinci kez yazmaz.
-- FORCE RLS. PostgREST yazma politikası üretilmez.

ALTER TABLE "kurumsal_job_postings"
  ADD COLUMN "criteria_weights" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "kurumsal_job_postings"
  ADD CONSTRAINT "kurumsal_job_postings_criteria_weights_array"
  CHECK (jsonb_typeof("criteria_weights") = 'array');

ALTER TABLE "kurumsal_job_applications"
  ADD COLUMN "skill_scores" JSONB,
  ADD COLUMN "weighted_score" INTEGER;

ALTER TABLE "kurumsal_job_applications"
  ADD CONSTRAINT "kurumsal_job_applications_weighted_band"
  CHECK ("weighted_score" IS NULL OR ("weighted_score" >= 0 AND "weighted_score" <= 100));

CREATE INDEX "kurumsal_job_applications_job_id_weighted_score_idx"
  ON "kurumsal_job_applications"("job_id", "weighted_score");

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
