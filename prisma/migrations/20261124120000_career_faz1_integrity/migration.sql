-- Faz 1 kariyer bütünlüğü: CareerCv, iletişim talebi, şık sırası, tezgâh hash.
-- FORCE RLS + rls_deny_unscoped. Sahip kolonu user_id / talent_user_id.
-- PostgREST yazma politikası üretilmez.

-- YetkinCV oturumu: sunucuda karıştırılmış şık sırası (istemci doğru indeksi görmez).
ALTER TABLE "yetkin_cv_sittings"
  ADD COLUMN IF NOT EXISTS "choice_order" JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN "yetkin_cv_sittings"."choice_order" IS
  'Soru kimliği → şık permütasyonu. Submit sırasında görüntülenen indeks orijinale eşlenir.';

-- Tezgâh portföy kanıtı: çıktı içeriğinin SHA-256 özeti (dürüstlük mühürü).
ALTER TABLE "career_portfolio_items"
  ADD COLUMN IF NOT EXISTS "output_hash" VARCHAR(64);

COMMENT ON COLUMN "career_portfolio_items"."output_hash" IS
  'Tezgâh çıktısının SHA-256 özeti. Vize damgası değildir; portföy kanıt bütünlüğüdür.';

-- Yapılandırılmış CV (K3). user_id unique. CV metni burada tutulur.
CREATE TABLE IF NOT EXISTS "career_cvs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" VARCHAR(120) NOT NULL DEFAULT '',
    "headline" VARCHAR(200) NOT NULL DEFAULT '',
    "city" VARCHAR(40) NOT NULL DEFAULT '',
    "summary" VARCHAR(4000) NOT NULL DEFAULT '',
    "experiences" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "educations" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "skills" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "languages" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "links" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "contact_opt_in_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_cvs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "career_cvs_user_id_key" ON "career_cvs"("user_id");
CREATE INDEX IF NOT EXISTS "career_cvs_city_idx" ON "career_cvs"("city");

ALTER TABLE "career_cvs"
  DROP CONSTRAINT IF EXISTS "career_cvs_user_id_fkey";
ALTER TABLE "career_cvs"
  ADD CONSTRAINT "career_cvs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- KVKK uyumlu iletişim talebi (Y9). Aday e-postası HTML'e basılmaz.
CREATE TABLE IF NOT EXISTS "career_contact_requests" (
    "id" TEXT NOT NULL,
    "talent_user_id" TEXT NOT NULL,
    "requester_name" VARCHAR(120) NOT NULL,
    "requester_email" VARCHAR(160) NOT NULL,
    "message" VARCHAR(2000) NOT NULL,
    "seal_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_contact_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "career_contact_requests_talent_user_id_created_at_idx"
  ON "career_contact_requests"("talent_user_id", "created_at");

ALTER TABLE "career_contact_requests"
  DROP CONSTRAINT IF EXISTS "career_contact_requests_talent_user_id_fkey";
ALTER TABLE "career_contact_requests"
  ADD CONSTRAINT "career_contact_requests_talent_user_id_fkey"
  FOREIGN KEY ("talent_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "career_cvs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_cvs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "career_contact_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_contact_requests" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    FOREACH tbl IN ARRAY ARRAY['career_cvs', 'career_contact_requests']
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

    -- career_cvs: sahip SELECT (user_id)
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'career_cvs' AND policyname = 'rls_own_user_id'
    ) THEN
      EXECUTE $pol$
        CREATE POLICY rls_own_user_id ON public.career_cvs
        FOR SELECT TO authenticated
        USING (user_id = public.yetkin_auth_user_id())
      $pol$;
    END IF;

    -- career_contact_requests: talent sahibi SELECT (talent_user_id sahiplik kolonları listesinde değil;
    -- deny politikası kalır; uygulama service_role/Prisma ile okur)
  END IF;
END $$;
