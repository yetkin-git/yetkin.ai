-- Yetkin Commerce Aşama 3: vitrin hattı, Hepsiburada kanalı, mağaza başı aylık lisans.
-- WhatsApp 905 ile 12 hanedir. Boş kolon sipariş bağlantısı basmaz.
-- Abonelik owner_user_id taşır. user_id değildir; PostgREST sahiplik politikası açılmaz.
-- FORCE RLS. INSERT / UPDATE / DELETE politikası üretilmez.

ALTER TYPE "CommerceChannel" ADD VALUE 'HEPSIBURADA';

ALTER TABLE "commerce_stores" ADD COLUMN "whatsapp_e164" VARCHAR(12);

ALTER TABLE "commerce_stores"
  ADD CONSTRAINT "commerce_stores_whatsapp_e164"
  CHECK ("whatsapp_e164" IS NULL OR "whatsapp_e164" ~ '^905[0-9]{9}$');

CREATE TYPE "CommerceSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE');

CREATE TABLE "commerce_subscriptions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "status" "CommerceSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "list_price_minor" INTEGER NOT NULL,
    "applied_merchant_oids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "commerce_subscriptions_store_id_key" ON "commerce_subscriptions"("store_id");

CREATE INDEX "commerce_subscriptions_owner_status_idx" ON "commerce_subscriptions"("owner_user_id", "status");

ALTER TABLE "commerce_subscriptions" ADD CONSTRAINT "commerce_subscriptions_store_fkey" FOREIGN KEY ("store_id") REFERENCES "commerce_stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_subscriptions" ADD CONSTRAINT "commerce_subscriptions_owner_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commerce_subscriptions"
  ADD CONSTRAINT "commerce_subscriptions_price_positive"
  CHECK ("list_price_minor" > 0);

ALTER TABLE "commerce_subscriptions"
  ADD CONSTRAINT "commerce_subscriptions_active_expiry"
  CHECK ("status"::text <> 'ACTIVE' OR "expires_at" IS NOT NULL);

ALTER TABLE "commerce_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commerce_subscriptions" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (
       SELECT 1
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'commerce_subscriptions'
         AND policyname = 'rls_deny_unscoped'
     ) THEN
    CREATE POLICY rls_deny_unscoped ON public.commerce_subscriptions
      FOR SELECT TO anon, authenticated
      USING (false);
  END IF;
END $$;
