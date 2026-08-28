-- PSP emanet hold'u cüzdan satırına çivi çakmaz.
-- wallet_id isteğe bağlı (yalnız tarihsel/merchant artık). psp_payment_id PSP kimliğidir.

ALTER TABLE "escrow_holds" DROP CONSTRAINT "escrow_holds_wallet_id_fkey";

ALTER TABLE "escrow_holds" ALTER COLUMN "wallet_id" DROP NOT NULL;

ALTER TABLE "escrow_holds" ADD COLUMN IF NOT EXISTS "psp_payment_id" TEXT;

UPDATE "escrow_holds"
SET "psp_payment_id" = "reference_key"
WHERE "psp_payment_id" IS NULL;

ALTER TABLE "escrow_holds"
  ADD CONSTRAINT "escrow_holds_wallet_id_fkey"
  FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "escrow_holds_psp_payment_id_idx"
  ON "escrow_holds"("psp_payment_id");
