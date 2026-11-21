-- Ürün model yuvaları. Tek satır id=product. Sahiplik kolonu yoktur.
-- FORCE RLS. PostgREST yazma politikası üretilmez. anon/authenticated SELECT USING false.
-- Boş kolon kod varsayılanıdır. Akademi mühür katmanları bu tabloyu okumaz.

CREATE TABLE "ai_product_model_settings" (
    "id" TEXT NOT NULL DEFAULT 'product',
    "text_easy_model_id" TEXT,
    "text_deep_model_id" TEXT,
    "image_easy_model_id" TEXT,
    "image_deep_model_id" TEXT,
    "voice_easy_model_id" TEXT,
    "voice_deep_model_id" TEXT,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_product_model_settings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_id_product"
  CHECK ("id" = 'product');

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_text_easy_model_id_shape"
  CHECK (
    "text_easy_model_id" IS NULL
    OR "text_easy_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_text_deep_model_id_shape"
  CHECK (
    "text_deep_model_id" IS NULL
    OR "text_deep_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_image_easy_model_id_shape"
  CHECK (
    "image_easy_model_id" IS NULL
    OR "image_easy_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_image_deep_model_id_shape"
  CHECK (
    "image_deep_model_id" IS NULL
    OR "image_deep_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_voice_easy_model_id_shape"
  CHECK (
    "voice_easy_model_id" IS NULL
    OR "voice_easy_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_voice_deep_model_id_shape"
  CHECK (
    "voice_deep_model_id" IS NULL
    OR "voice_deep_model_id" ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$'
  );

ALTER TABLE "ai_product_model_settings"
  ADD CONSTRAINT "ai_product_model_settings_updated_by_uuid"
  CHECK (
    "updated_by" IS NULL
    OR "updated_by" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

ALTER TABLE "ai_product_model_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_product_model_settings" FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'ai_product_model_settings'
        AND policyname = 'rls_deny_unscoped'
    ) THEN
      EXECUTE
        'CREATE POLICY rls_deny_unscoped ON public.ai_product_model_settings FOR SELECT TO anon, authenticated USING (false)';
    END IF;
  END IF;
END $$;

ALTER TABLE "super_admin_audit_logs" DROP CONSTRAINT "super_admin_audit_logs_action_known";

ALTER TABLE "super_admin_audit_logs"
  ADD CONSTRAINT "super_admin_audit_logs_action_known"
  CHECK ("action" IN (
    'catalog_publish',
    'catalog_price',
    'license_grant',
    'manual_refund',
    'certificate_revoke',
    'room_flag',
    'b2b_switch',
    'b2b_send',
    'ai_model_bind'
  ));
