-- Kanal webhook stok köprüsü.
-- CHANNEL_SALE miktarı negatiftir. İade satırı 0 olabilir (durum mührü).
-- Onaylı stok yine 0'ın altına inemez.

ALTER TABLE "stock_ledgers" DROP CONSTRAINT "stock_ledgers_quantity_positive";

ALTER TABLE "stock_ledgers"
  ADD CONSTRAINT "stock_ledgers_quantity_signed"
  CHECK (
    ("type"::text = 'CHANNEL_SALE' AND "quantity" < 0)
    OR ("type"::text = 'RETURN_RESTOCK' AND "quantity" >= 0)
    OR ("type"::text IN ('INBOUND_DRAFT', 'INBOUND_APPROVED') AND "quantity" > 0)
  );

ALTER TABLE "stock_ledgers"
  ADD COLUMN "external_order_id" VARCHAR(64) NOT NULL DEFAULT '';

CREATE INDEX "stock_ledgers_store_id_channel_external_order_id_idx"
  ON "stock_ledgers"("store_id", "channel", "external_order_id");

ALTER TYPE "CommerceInboxKind" ADD VALUE 'STOCK_ALERT';

CREATE TYPE "CommerceInboxOrderStatus" AS ENUM ('OPEN', 'CANCELLED', 'RETURNED');

ALTER TABLE "commerce_inbox_entries"
  ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "order_status" "CommerceInboxOrderStatus";

ALTER TABLE "commerce_inbox_entries"
  ADD CONSTRAINT "commerce_inbox_entries_priority_non_negative"
  CHECK ("priority" >= 0);
