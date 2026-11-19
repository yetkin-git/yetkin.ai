-- Tezgâh maliyet havuzları: lite (günlük), tetkik (ömür boyu).
-- Mevcut satırlar lite havuzuna taşınır. Global tetkik domain kilidi eklenir.
-- PostgREST okuması kapalıdır. Yazma politikası üretilmez. Prisma BYPASSRLS yazar.

ALTER TABLE "tezgah_daily_quotas"
  ADD COLUMN IF NOT EXISTS "pool_key" VARCHAR(32) NOT NULL DEFAULT 'lite';

ALTER TABLE "tezgah_daily_quotas"
  ALTER COLUMN "date_key" TYPE VARCHAR(16);

ALTER TABLE "tezgah_daily_quotas"
  DROP CONSTRAINT IF EXISTS "tezgah_daily_quotas_pkey";

ALTER TABLE "tezgah_daily_quotas"
  ADD CONSTRAINT "tezgah_daily_quotas_pkey"
  PRIMARY KEY ("date_key", "subject_key", "pool_key");

CREATE TABLE IF NOT EXISTS "tetkik_domain_claims" (
    "host" VARCHAR(253) NOT NULL,
    "claimed_by_subject_key" VARCHAR(180) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tetkik_domain_claims_pkey" PRIMARY KEY ("host")
);

ALTER TABLE "tetkik_domain_claims" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tetkik_domain_claims" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tetkik_domain_claims";
CREATE POLICY "rls_deny_unscoped" ON "tetkik_domain_claims"
  FOR SELECT TO anon, authenticated
  USING (false);
