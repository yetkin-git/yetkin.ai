-- Studio nesne depo metadata (T2-2).
-- data_base64 CHECK 2097152 durur. Kör DROP yok.
-- Storage RLS / bucket bu dosyada yoktur (supabase/storage/studio-assets.sql; ops:migrate yedisine eklenmez).

ALTER TABLE "studio_digital_assets"
  ADD COLUMN "storage_kind" TEXT NOT NULL DEFAULT 'inline-base64',
  ADD COLUMN "bucket" TEXT,
  ADD COLUMN "object_path" TEXT,
  ADD COLUMN "byte_size" INTEGER,
  ADD COLUMN "storage_confirmed_at" TIMESTAMP(3);

ALTER TABLE "studio_digital_assets"
  ADD CONSTRAINT "studio_digital_assets_storage_kind_allowed"
  CHECK ("storage_kind" IN ('inline-base64', 'object-store'));

ALTER TABLE "studio_digital_assets"
  ADD CONSTRAINT "studio_digital_assets_byte_size_max"
  CHECK ("byte_size" IS NULL OR ("byte_size" > 0 AND "byte_size" <= 1572864));

CREATE UNIQUE INDEX "studio_digital_assets_object_path_key"
  ON "studio_digital_assets"("object_path")
  WHERE "object_path" IS NOT NULL;
