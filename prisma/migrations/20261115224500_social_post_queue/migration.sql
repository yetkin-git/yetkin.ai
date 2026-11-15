-- Sosyal yayın kuyruğu. Super Admin. Sahiplik kolonu yoktur.
-- FORCE RLS. PostgREST yazma politikası üretilmez. anon/authenticated SELECT USING false.

CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'X');

CREATE TYPE "SocialPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'FAILED');

CREATE TYPE "SocialModule" AS ENUM ('AI_TEZGAH', 'COMMERCE', 'TUBITAK_1507', 'WEB_TETKIK', 'CAREER_COACH');

CREATE TABLE "social_post_queue_items" (
    "id" TEXT NOT NULL,
    "module" "SocialModule" NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "image_prompt" VARCHAR(500) NOT NULL DEFAULT '',
    "target_url" VARCHAR(300) NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',
    "external_post_id" VARCHAR(200),
    "last_error" VARCHAR(500) NOT NULL DEFAULT '',
    "actor_user_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_post_queue_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "social_post_queue_items_status_created_at_idx"
  ON "social_post_queue_items"("status", "created_at");

CREATE INDEX "social_post_queue_items_created_at_idx"
  ON "social_post_queue_items"("created_at");

ALTER TABLE "social_post_queue_items"
  ADD CONSTRAINT "social_post_queue_items_actor_user_id_uuid"
  CHECK ("actor_user_id" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');

ALTER TABLE "social_post_queue_items"
  ADD CONSTRAINT "social_post_queue_items_target_url_yetkin"
  CHECK ("target_url" ~ '^https://yetkin\.ai($|[/?].*)$');

ALTER TABLE "social_post_queue_items"
  ADD CONSTRAINT "social_post_queue_items_image_url_https"
  CHECK ("image_url" IS NULL OR "image_url" ~ '^https://');

ALTER TABLE "social_post_queue_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_post_queue_items" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'social_post_queue_items'
        AND policyname = 'rls_deny_unscoped'
    ) THEN
      CREATE POLICY rls_deny_unscoped ON public.social_post_queue_items
        FOR SELECT TO anon, authenticated USING (false);
    END IF;
  END IF;
END $$;
