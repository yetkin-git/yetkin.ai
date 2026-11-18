-- Tezgâh üretim arşivi ve kamu portföyüne tezgâh kanıtı.
-- Para, cüzdan ve defter bu tabloda yoktur.
-- Okuma ve yazma politikası yalnız satır sahibine açıktır.
-- PostgREST GRANT'i SELECT'tir; sunucu yazması oturum sahibi user_id ile Prisma'dan geçer.

CREATE TABLE "tezgah_outputs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tool_key" VARCHAR(40) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "input_summary" VARCHAR(500) NOT NULL,
    "output_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tezgah_outputs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tezgah_outputs_user_id_created_at_idx"
  ON "tezgah_outputs"("user_id", "created_at");

ALTER TABLE "tezgah_outputs"
  ADD CONSTRAINT "tezgah_outputs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tezgah_outputs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_outputs" FORCE ROW LEVEL SECURITY;

ALTER TABLE "career_portfolio_items" ALTER COLUMN "visa_stamp_id" DROP NOT NULL;

ALTER TABLE "career_portfolio_items"
  ADD COLUMN "body" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "tool_key" VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN "source_key" VARCHAR(80);

CREATE UNIQUE INDEX "career_portfolio_items_source_key_key"
  ON "career_portfolio_items"("source_key");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'yetkin_auth_user_id'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS tezgah_outputs_select_own ON public.tezgah_outputs';
    EXECUTE $pol$
      CREATE POLICY tezgah_outputs_select_own
        ON public.tezgah_outputs
        FOR SELECT
        TO authenticated
        USING (user_id::text = public.yetkin_auth_user_id())
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS tezgah_outputs_insert_own ON public.tezgah_outputs';
    EXECUTE $pol$
      CREATE POLICY tezgah_outputs_insert_own
        ON public.tezgah_outputs
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id::text = public.yetkin_auth_user_id())
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS tezgah_outputs_update_own ON public.tezgah_outputs';
    EXECUTE $pol$
      CREATE POLICY tezgah_outputs_update_own
        ON public.tezgah_outputs
        FOR UPDATE
        TO authenticated
        USING (user_id::text = public.yetkin_auth_user_id())
        WITH CHECK (user_id::text = public.yetkin_auth_user_id())
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS tezgah_outputs_delete_own ON public.tezgah_outputs';
    EXECUTE $pol$
      CREATE POLICY tezgah_outputs_delete_own
        ON public.tezgah_outputs
        FOR DELETE
        TO authenticated
        USING (user_id::text = public.yetkin_auth_user_id())
    $pol$;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'tezgah_outputs'
         AND policyname = 'rls_deny_unscoped'
     ) THEN
    CREATE POLICY rls_deny_unscoped ON public.tezgah_outputs
      FOR SELECT TO anon
      USING (false);
  END IF;
END $$;
