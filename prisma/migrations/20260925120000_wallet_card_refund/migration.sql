-- Kullanılmamış cüzdan bakiyesinin karta iade kaydı.
-- Defter satırı (ledger_entries) yalnız SUCCEEDED sonrası DEBIT ile düşer.

CREATE TABLE "wallet_card_refunds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_oid" TEXT,
    "amount_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "status" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "wallet_card_refunds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallet_card_refunds_idempotency_key_key" ON "wallet_card_refunds"("idempotency_key");
CREATE INDEX "wallet_card_refunds_user_id_status_idx" ON "wallet_card_refunds"("user_id", "status");
CREATE INDEX "wallet_card_refunds_merchant_oid_idx" ON "wallet_card_refunds"("merchant_oid");

ALTER TABLE "wallet_card_refunds"
  ADD CONSTRAINT "wallet_card_refunds_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "wallet_card_refunds"
  ADD CONSTRAINT "wallet_card_refunds_merchant_oid_fkey"
  FOREIGN KEY ("merchant_oid") REFERENCES "payment_orders"("merchant_oid") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "wallet_card_refunds"
  ADD CONSTRAINT "wallet_card_refunds_amount_positive"
  CHECK ("amount_minor" > 0);

ALTER TABLE "wallet_card_refunds"
  ADD CONSTRAINT "wallet_card_refunds_status_check"
  CHECK ("status" IN ('PENDING', 'ACCEPTED', 'SUCCEEDED', 'FAILED', 'REQUESTED'));
