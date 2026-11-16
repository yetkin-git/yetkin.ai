-- Çalışma odası durumu esnafın gelen kutu kaydına da yazılır.
-- Teslimat gövdesi görev satırında durur. Kamu ilanı açılmaz.

CREATE TYPE "CareerDeskTaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DELIVERED');

ALTER TABLE "career_desk_tasks"
  ADD COLUMN "status" "CareerDeskTaskStatus" NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "delivery_tool" VARCHAR(40) NOT NULL DEFAULT '',
  ADD COLUMN "delivery_filename" VARCHAR(80) NOT NULL DEFAULT '',
  ADD COLUMN "delivery_summary" VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN "delivery_body" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "commerce_inbox_entries"
  ADD COLUMN "expert_status" VARCHAR(16) NOT NULL DEFAULT '',
  ADD COLUMN "expert_note" VARCHAR(240) NOT NULL DEFAULT '';

UPDATE "commerce_inbox_entries"
SET "expert_status" = 'OPEN'
WHERE "kind" = 'EXPERT_TASK'
  AND "expert_status" = '';
