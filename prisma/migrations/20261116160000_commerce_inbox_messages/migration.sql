-- Gelen kutu: müşteri sorusu, ürün yorumu, yanıt durumu.
-- Kariyer çalışma odası görevi kamu ilanı değildir.
-- FORCE RLS. PostgREST yazma politikası üretilmez.

ALTER TYPE "CommerceInboxKind" ADD VALUE 'CUSTOMER_QUESTION';
ALTER TYPE "CommerceInboxKind" ADD VALUE 'PRODUCT_REVIEW';

CREATE TYPE "CommerceInboxMessageStatus" AS ENUM (
  'OPEN',
  'DRAFT',
  'ANSWERED',
  'PENDING_CREDENTIALS'
);

ALTER TABLE "commerce_inbox_entries"
  ADD COLUMN "message_status" "CommerceInboxMessageStatus" NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "idempotency_key" TEXT;

CREATE UNIQUE INDEX "commerce_inbox_entries_idempotency_key_key"
  ON "commerce_inbox_entries"("idempotency_key");

CREATE TYPE "CareerDeskTaskKind" AS ENUM (
  'PHOTO_STUDIO',
  'MARKETPLACE_SEO',
  'ADS_MANAGEMENT',
  'SITE_EDIT'
);

CREATE TABLE "career_desk_tasks" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "product_id" TEXT NOT NULL,
  "inbox_entry_id" TEXT NOT NULL,
  "kind" "CareerDeskTaskKind" NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "brief" VARCHAR(2000) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "career_desk_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "career_desk_tasks_inbox_entry_id_key"
  ON "career_desk_tasks"("inbox_entry_id");

CREATE UNIQUE INDEX "career_desk_tasks_owner_product_kind_uidx"
  ON "career_desk_tasks"("user_id", "product_id", "kind");

CREATE INDEX "career_desk_tasks_user_id_created_at_idx"
  ON "career_desk_tasks"("user_id", "created_at");

ALTER TABLE "career_desk_tasks"
  ADD CONSTRAINT "career_desk_tasks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "career_desk_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "career_desk_tasks" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'career_desk_tasks'
        AND policyname = 'rls_deny_unscoped'
    ) THEN
      CREATE POLICY rls_deny_unscoped ON public.career_desk_tasks
        FOR SELECT TO anon, authenticated USING (false);
    END IF;
  END IF;
END $$;
