-- YetkinCV oturumu ve SHA-256 mührü. CV metni kolonu yoktur.
-- Katalog satırı career/yetkincv-exam. Super Admin tutarı (updated_by dolu) ezilmez.

CREATE TABLE "yetkin_cv_sittings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_key" VARCHAR(32) NOT NULL,
    "vertical_key" VARCHAR(32) NOT NULL,
    "cv_digest" VARCHAR(64) NOT NULL,
    "cv_signals" JSONB NOT NULL,
    "question_ids" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yetkin_cv_sittings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "yetkin_cv_seals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sitting_id" TEXT NOT NULL,
    "role_key" VARCHAR(32) NOT NULL,
    "vertical_key" VARCHAR(32) NOT NULL,
    "score" INTEGER NOT NULL,
    "skill_breakdown" JSONB NOT NULL,
    "cv_digest" VARCHAR(64) NOT NULL,
    "cv_signals" JSONB NOT NULL,
    "certificate_hash" VARCHAR(64) NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yetkin_cv_seals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "yetkin_cv_seals_score_band" CHECK ("score" >= 0 AND "score" <= 100)
);

CREATE UNIQUE INDEX "yetkin_cv_seals_sitting_id_key" ON "yetkin_cv_seals"("sitting_id");
CREATE UNIQUE INDEX "yetkin_cv_seals_certificate_hash_key" ON "yetkin_cv_seals"("certificate_hash");
CREATE INDEX "yetkin_cv_sittings_user_id_created_at_idx" ON "yetkin_cv_sittings"("user_id", "created_at");
CREATE INDEX "yetkin_cv_seals_user_id_issued_at_idx" ON "yetkin_cv_seals"("user_id", "issued_at");

ALTER TABLE "yetkin_cv_sittings"
  ADD CONSTRAINT "yetkin_cv_sittings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "yetkin_cv_seals"
  ADD CONSTRAINT "yetkin_cv_seals_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "yetkin_cv_seals"
  ADD CONSTRAINT "yetkin_cv_seals_sitting_id_fkey"
  FOREIGN KEY ("sitting_id") REFERENCES "yetkin_cv_sittings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "yetkin_cv_sittings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yetkin_cv_sittings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "yetkin_cv_seals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "yetkin_cv_seals" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY['yetkin_cv_sittings', 'yetkin_cv_seals']
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
  v_amount integer := 29000;
  v_min integer := 1;
  v_max integer := 50000000;
  v_description text := 'YetkinCV Uygulamalı Sınav ve SHA-256 mühürlü CV paketi. Tutar katalog satırındadır. Satın alma tek başına puan basmaz.';
  catalog_id text;
  old_minor integer;
  ledger_id text := 'pcl_open_career_yetkincv_exam';
BEGIN
  IF v_amount <= 0 OR v_amount < v_min OR v_amount > v_max THEN
    RAISE EXCEPTION 'katalog tutarı bant dışında: career/yetkincv-exam';
  END IF;

  SELECT e.id AS id, e.amount_minor AS amount_minor, e.updated_by AS updated_by
    INTO existing
    FROM "price_catalog_entries" e
    WHERE e.module_key = 'career'
      AND e.unit_key = 'yetkincv-exam';

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
      'cat_career_yetkincv_exam',
      'career',
      'yetkincv-exam',
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
    catalog_id := 'cat_career_yetkincv_exam';
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
    'career',
    'yetkincv-exam',
    'MINOR',
    'ADMIN_MANUAL',
    'YetkinCV sınav paketi katalog açılışı. Tutar amount_minor kuruştur. Super Admin yazdıysa bu tohum ezmez.',
    old_minor,
    v_amount,
    'TRY',
    'migration:20261118183000',
    CURRENT_TIMESTAMP
  WHERE NOT EXISTS (
    SELECT 1 FROM "price_catalog_decision_ledger" d WHERE d.id = ledger_id
  );
END $$;
