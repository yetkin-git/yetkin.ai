-- Faz 3: kalıcı tezgâh kotası, Pro süresi, kredi sayacı, kurumsal teklif, radar teslimi.
-- Kota ve kredi sayacı cüzdan değildir. Tahsilat ledger_entries DEBIT satırındadır.
-- PostgREST okuması kapalıdır. Yazma politikası üretilmez. Prisma BYPASSRLS yazar.

CREATE TABLE "tezgah_daily_quotas" (
    "date_key" VARCHAR(10) NOT NULL,
    "subject_key" VARCHAR(180) NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tezgah_daily_quotas_pkey" PRIMARY KEY ("date_key", "subject_key")
);

CREATE TABLE "tezgah_subscriptions" (
    "user_id" TEXT NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "list_price_minor" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "applied_merchant_oids" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tezgah_subscriptions_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "tezgah_credit_balances" (
    "user_id" TEXT NOT NULL,
    "remaining" INTEGER NOT NULL DEFAULT 0,
    "unit_minor" INTEGER NOT NULL DEFAULT 0,
    "applied_merchant_oids" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tezgah_credit_balances_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "kurumsal_offer_requests" (
    "id" TEXT NOT NULL,
    "company_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "package_key" VARCHAR(40) NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "note" VARCHAR(500) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kurumsal_offer_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "kurumsal_offer_requests_created_at_idx" ON "kurumsal_offer_requests"("created_at");

CREATE TABLE "weekly_radar_deliveries" (
    "user_id" TEXT NOT NULL,
    "week_key" VARCHAR(10) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_radar_deliveries_pkey" PRIMARY KEY ("user_id", "week_key")
);

ALTER TABLE "tezgah_subscriptions"
  ADD CONSTRAINT "tezgah_subscriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tezgah_credit_balances"
  ADD CONSTRAINT "tezgah_credit_balances_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "weekly_radar_deliveries"
  ADD CONSTRAINT "weekly_radar_deliveries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tezgah_daily_quotas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_daily_quotas" FORCE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_subscriptions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_credit_balances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tezgah_credit_balances" FORCE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_offer_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kurumsal_offer_requests" FORCE ROW LEVEL SECURITY;
ALTER TABLE "weekly_radar_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "weekly_radar_deliveries" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tezgah_daily_quotas";
CREATE POLICY "rls_deny_unscoped" ON "tezgah_daily_quotas"
  FOR SELECT TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tezgah_subscriptions";
CREATE POLICY "rls_deny_unscoped" ON "tezgah_subscriptions"
  FOR SELECT TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "tezgah_credit_balances";
CREATE POLICY "rls_deny_unscoped" ON "tezgah_credit_balances"
  FOR SELECT TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "kurumsal_offer_requests";
CREATE POLICY "rls_deny_unscoped" ON "kurumsal_offer_requests"
  FOR SELECT TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "rls_deny_unscoped" ON "weekly_radar_deliveries";
CREATE POLICY "rls_deny_unscoped" ON "weekly_radar_deliveries"
  FOR SELECT TO anon, authenticated
  USING (false);
