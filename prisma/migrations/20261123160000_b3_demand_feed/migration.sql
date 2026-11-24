-- B3 — dış / platform talep kanıtı. Tarama bu tabloyu silmez.
-- İstemci talep endeksi yazamaz. FORCE RLS + rls_deny_unscoped.

CREATE TABLE IF NOT EXISTS "commerce_demand_feeds" (
  "id" TEXT NOT NULL,
  "store_id" TEXT NOT NULL,
  "source" "CommerceGapSource" NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "payload_json" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commerce_demand_feeds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "commerce_demand_feeds_store_id_source_created_at_idx"
  ON "commerce_demand_feeds" ("store_id", "source", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'commerce_demand_feeds_store_fkey'
  ) THEN
    ALTER TABLE "commerce_demand_feeds"
      ADD CONSTRAINT "commerce_demand_feeds_store_fkey"
      FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['commerce_demand_feeds']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
       AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND policyname = 'rls_deny_unscoped'
      ) THEN
        EXECUTE format(
          'CREATE POLICY rls_deny_unscoped ON public.%I FOR SELECT TO anon, authenticated USING (false)',
          t
        );
      END IF;
    END IF;
  END LOOP;
END $$;
