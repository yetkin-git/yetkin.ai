-- Junior yıllık paket ve seçmeli ders kotası.
-- Çocuk e-postası yok. Kartın tamamı yok. Oyun puanı ve cüzdan bu tabloya bağlanmaz.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.

ALTER TABLE "junior_profiles"
  ADD COLUMN "selected_electives" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- PostgreSQL CHECK alt sorgu kabul etmez. Kota en fazla üç olduğu için
-- aynı kısa ad, üç gözün ikili karşılaştırmasıyla elenir.
ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_elective_quota"
  CHECK (
    cardinality("selected_electives") <= 3
    AND (
      cardinality("selected_electives") < 2
      OR "selected_electives"[1] IS DISTINCT FROM "selected_electives"[2]
    )
    AND (
      cardinality("selected_electives") < 3
      OR (
        "selected_electives"[1] IS DISTINCT FROM "selected_electives"[3]
        AND "selected_electives"[2] IS DISTINCT FROM "selected_electives"[3]
      )
    )
    AND "selected_electives" <@ ARRAY[
      'jr_06_ing',
      'jr_06_alm',
      'jr_06_fra',
      'jr_06_siyer',
      'jr_06_kod',
      'jr_06_arp'
    ]::TEXT[]
  );

CREATE TYPE "JuniorSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE');

CREATE TABLE "junior_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "JuniorSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "plan_code" TEXT NOT NULL,
    "list_price_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT NOT NULL,
    "card_last4" VARCHAR(4) NOT NULL,
    "invoice_name" TEXT NOT NULL,
    "invoice_tckn" VARCHAR(11) NOT NULL,
    "invoice_phone" VARCHAR(16) NOT NULL,
    "invoice_address" TEXT NOT NULL,
    "elective_quota" INTEGER NOT NULL DEFAULT 3,
    "activated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "junior_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "junior_subscriptions_user_id_key" ON "junior_subscriptions"("user_id");
CREATE INDEX "junior_subscriptions_user_id_status_idx" ON "junior_subscriptions"("user_id", "status");

ALTER TABLE "junior_subscriptions"
  ADD CONSTRAINT "junior_subscriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "junior_subscriptions"
  ADD CONSTRAINT "junior_subscriptions_shape"
  CHECK (
    "plan_code" = 'junior-yearly'
    AND "list_price_minor" = 549900
    AND "currency_code" = 'TRY'
    AND "provider" = 'iyzico-test'
    AND char_length("provider_ref") BETWEEN 8 AND 80
    AND "card_last4" ~ '^[0-9]{4}$'
    AND char_length(btrim("invoice_name")) BETWEEN 3 AND 80
    AND "invoice_tckn" ~ '^[1-9][0-9]{10}$'
    AND "invoice_phone" ~ '^[0-9]{10,13}$'
    AND char_length(btrim("invoice_address")) BETWEEN 10 AND 240
    AND "elective_quota" = 3
    AND (
      "status" = 'PENDING'
      OR (
        "status" = 'ACTIVE'
        AND "activated_at" IS NOT NULL
        AND "expires_at" IS NOT NULL
        AND "expires_at" > "activated_at"
      )
    )
  );
