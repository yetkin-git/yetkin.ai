-- Junior kasası PayTR deneme mührüne geçer. Iyzico deneme sağlayıcısı kalkar.
-- Abonelik açıkken profil ve paket bir kez sınıf değiştirir. Hak 1 başlar, harcanınca 0 olur.
-- Kartın tamamı yine yazılmaz. provider_ref PayTR sipariş numarasıdır: yalnız harf ve rakam.

ALTER TABLE "junior_profiles"
  ADD COLUMN "grade_switch_rights" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "junior_profiles"
  ADD CONSTRAINT "junior_profiles_grade_switch_rights"
  CHECK ("grade_switch_rights" IN (0, 1));

ALTER TABLE "junior_subscriptions"
  ADD COLUMN "grade_switch_rights" INTEGER NOT NULL DEFAULT 1;

UPDATE "junior_subscriptions"
SET
  "provider" = 'paytr-test',
  "provider_ref" = 'JRMIG' || "card_last4" || upper(substr(md5("id"), 1, 12))
WHERE "provider" <> 'paytr-test'
   OR "provider_ref" !~ '^[A-Z0-9]{8,64}$';

ALTER TABLE "junior_subscriptions" DROP CONSTRAINT "junior_subscriptions_shape";

ALTER TABLE "junior_subscriptions"
  ADD CONSTRAINT "junior_subscriptions_shape"
  CHECK (
    "plan_code" = 'junior-yearly'
    AND "list_price_minor" = 549900
    AND "currency_code" = 'TRY'
    AND "provider" = 'paytr-test'
    AND "provider_ref" ~ '^[A-Z0-9]{8,64}$'
    AND "card_last4" ~ '^[0-9]{4}$'
    AND char_length(btrim("invoice_name")) BETWEEN 3 AND 80
    AND "invoice_tckn" ~ '^[1-9][0-9]{10}$'
    AND "invoice_phone" ~ '^[0-9]{10,13}$'
    AND char_length(btrim("invoice_address")) BETWEEN 10 AND 240
    AND "elective_quota" = 3
    AND "grade_switch_rights" IN (0, 1)
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
