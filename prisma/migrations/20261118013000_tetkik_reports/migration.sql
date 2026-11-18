-- Anonim tetkik anlık görüntüsü. Üye, cüzdan ve defter yoktur.
-- PostgREST okuması kapalıdır. Paylaşım sayfası sunucu Prisma'sından hash ile okur.

CREATE TABLE "tetkik_reports" (
    "id" TEXT NOT NULL,
    "host" VARCHAR(253) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "score" INTEGER NOT NULL,
    "payload_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tetkik_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tetkik_reports_created_at_idx" ON "tetkik_reports"("created_at");

ALTER TABLE "tetkik_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tetkik_reports" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tetkik_reports";
CREATE POLICY "rls_deny_unscoped" ON "tetkik_reports"
  FOR SELECT TO anon, authenticated
  USING (false);
