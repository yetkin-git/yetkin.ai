-- YetkinHibe Faz 2: şartname metni ve kuralları.
-- Kolonlar yoksa eklenir. Mevcut satırlar NULL kalır. Atıf, metin yokken üretilmez.

ALTER TABLE "yetkinhibe_grant_calls"
  ADD COLUMN IF NOT EXISTS "specification_text" TEXT;

ALTER TABLE "yetkinhibe_grant_calls"
  ADD COLUMN IF NOT EXISTS "rules_json" JSONB;
