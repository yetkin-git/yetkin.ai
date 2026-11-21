-- P0: sipariş amacı, kart iadesi kapsamı ve e-ticaret deneme / yenileme alanları.
-- Eski purpose dizgileri durur. order_purpose dört ticari niyeti mühürler.

CREATE TYPE "PaymentOrderPurpose" AS ENUM (
  'WALLET_TOPUP',
  'TEZGAH_PRO',
  'TEZGAH_CREDIT',
  'COMMERCE_LICENSE'
);

ALTER TABLE "payment_orders"
  ADD COLUMN "order_purpose" "PaymentOrderPurpose";

ALTER TYPE "CommerceSubscriptionStatus" ADD VALUE 'TRIALING';
ALTER TYPE "CommerceSubscriptionStatus" ADD VALUE 'PAST_DUE';
ALTER TYPE "CommerceSubscriptionStatus" ADD VALUE 'CANCELED';

ALTER TABLE "commerce_subscriptions"
  ADD COLUMN "trial_ends_at" TIMESTAMP(3),
  ADD COLUMN "current_period_end" TIMESTAMP(3),
  ADD COLUMN "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paytr_utoken" VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN "paytr_ctoken" VARCHAR(128) NOT NULL DEFAULT '',
  ADD COLUMN "dunning_attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "last_dunning_at" TIMESTAMP(3),
  ADD COLUMN "trial_pending" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "trial_questions_used" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "trial_optimizations_used" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "commerce_subscriptions"
  DROP CONSTRAINT IF EXISTS "commerce_subscriptions_active_expiry";

ALTER TABLE "commerce_subscriptions"
  ADD CONSTRAINT "commerce_subscriptions_active_expiry"
  CHECK (
    "status"::text NOT IN ('ACTIVE', 'TRIALING', 'PAST_DUE')
    OR "expires_at" IS NOT NULL
  );

ALTER TABLE "commerce_subscriptions"
  ADD CONSTRAINT "commerce_subscriptions_dunning_nonneg"
  CHECK ("dunning_attempts" >= 0 AND "trial_questions_used" >= 0 AND "trial_optimizations_used" >= 0);

CREATE INDEX "commerce_subscriptions_renewal_idx"
  ON "commerce_subscriptions" ("status", "current_period_end");

CREATE TABLE "commerce_trial_consumptions" (
  "id" TEXT NOT NULL,
  "merchant_key" VARCHAR(11) NOT NULL,
  "store_id" TEXT NOT NULL,
  "consumed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "commerce_trial_consumptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "commerce_trial_consumptions_merchant_key_key"
  ON "commerce_trial_consumptions" ("merchant_key");

CREATE INDEX "commerce_trial_consumptions_store_idx"
  ON "commerce_trial_consumptions" ("store_id");

ALTER TABLE "commerce_trial_consumptions"
  ADD CONSTRAINT "commerce_trial_consumptions_store_fkey"
  FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_trial_consumptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commerce_trial_consumptions" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'commerce_trial_consumptions'
         AND policyname = 'rls_deny_unscoped'
     ) THEN
    CREATE POLICY rls_deny_unscoped ON public.commerce_trial_consumptions
      FOR SELECT TO anon, authenticated
      USING (false);
  END IF;
END $$;
