-- Veli aydınlatması append-only kanıt tablosu.
-- Profil bağı boş olabilir. Eski profiller düşmez. updated_at yoktur.
-- junior_subscriptions ve list_price_minor = 549900 kilidi bu dosyada durur.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yoktur.

ALTER TABLE "junior_profiles"
  ADD COLUMN "active_consent_id" TEXT;

ALTER TABLE "junior_profiles"
  ALTER COLUMN "birth_year" DROP NOT NULL;

ALTER TABLE "junior_profiles" DROP CONSTRAINT "junior_profiles_shape";

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_shape"
  CHECK (
    "grade" BETWEEN 5 AND 12
    AND char_length(btrim("nickname")) BETWEEN 2 AND 20
    AND "nickname" !~ '@'
    AND (
      "birth_year" BETWEEN 1990 AND 2035
      OR (
        "birth_year" IS NULL
        AND "nickname" = 'Kapalı'
        AND "selected" = false
        AND "active_consent_id" IS NULL
        AND cardinality("selected_electives") = 0
      )
    )
  );

CREATE TABLE "junior_guardian_consents" (
    "id" TEXT NOT NULL,
    "guardian_user_id" TEXT NOT NULL,
    "profile_id" TEXT,
    "consent_version" TEXT NOT NULL,
    "notice_sha256" CHAR(64) NOT NULL,
    "guardian_declared_adult" BOOLEAN NOT NULL,
    "guardian_birth_year" INTEGER NOT NULL,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "erased_at" TIMESTAMP(3),

    CONSTRAINT "junior_guardian_consents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "junior_guardian_consents_guardian_user_id_created_at_idx"
  ON "junior_guardian_consents"("guardian_user_id", "created_at");

CREATE INDEX "junior_guardian_consents_profile_id_idx"
  ON "junior_guardian_consents"("profile_id");

CREATE UNIQUE INDEX "junior_profiles_active_consent_id_key"
  ON "junior_profiles"("active_consent_id");

ALTER TABLE "junior_guardian_consents"
  ADD CONSTRAINT "junior_guardian_consents_guardian_user_id_fkey"
  FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "junior_guardian_consents"
  ADD CONSTRAINT "junior_guardian_consents_profile_id_fkey"
  FOREIGN KEY ("profile_id") REFERENCES "junior_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_active_consent_id_fkey"
  FOREIGN KEY ("active_consent_id") REFERENCES "junior_guardian_consents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "junior_guardian_consents"
  ADD CONSTRAINT "junior_guardian_consents_shape"
  CHECK (
    "guardian_declared_adult" = true
    AND "consent_version" ~ '^junior-notice-[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    AND "notice_sha256" ~ '^[0-9a-f]{64}$'
    AND "guardian_birth_year" BETWEEN 1900 AND 2100
    AND ("erased_at" IS NULL OR "profile_id" IS NULL)
  );

CREATE OR REPLACE FUNCTION yetkin_junior_guardian_consent_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'junior_guardian_consents is append-only';
  END IF;

  IF OLD.erased_at IS NOT NULL THEN
    RAISE EXCEPTION 'junior_guardian_consents is append-only';
  END IF;

  IF NEW.erased_at IS NULL OR NEW.profile_id IS NOT NULL THEN
    RAISE EXCEPTION 'junior_guardian_consents is append-only';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.guardian_user_id IS DISTINCT FROM OLD.guardian_user_id
    OR NEW.consent_version IS DISTINCT FROM OLD.consent_version
    OR NEW.notice_sha256 IS DISTINCT FROM OLD.notice_sha256
    OR NEW.guardian_declared_adult IS DISTINCT FROM OLD.guardian_declared_adult
    OR NEW.guardian_birth_year IS DISTINCT FROM OLD.guardian_birth_year
    OR NEW.consent_at IS DISTINCT FROM OLD.consent_at
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'junior_guardian_consents is append-only';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS junior_guardian_consents_append_only ON junior_guardian_consents;
CREATE TRIGGER junior_guardian_consents_append_only
  BEFORE UPDATE OR DELETE ON junior_guardian_consents
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_junior_guardian_consent_append_only();
