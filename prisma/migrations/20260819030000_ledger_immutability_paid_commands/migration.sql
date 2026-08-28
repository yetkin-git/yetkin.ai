-- Faz 1 tedavi: defter DB invariantları + ücretli komut rezervasyonu.
-- ledger_entries append-only. Wallet bakiyesi defter insert ile aynı CTE'de CAS edilir.
-- FORCE RLS event trigger yeni tabloya ENABLE+FORCE basar.

ALTER TABLE "wallets"
  ADD CONSTRAINT "wallets_amount_minor_non_negative"
  CHECK ("amount_minor" >= 0);

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_amount_minor_positive"
  CHECK ("amount_minor" > 0);

CREATE UNIQUE INDEX "wallets_id_user_id_currency_code_key"
  ON "wallets"("id", "user_id", "currency_code");

ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_wallet_id_fkey";
ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_user_id_fkey";

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_wallet_user_currency_fkey"
  FOREIGN KEY ("wallet_id", "user_id", "currency_code")
  REFERENCES "wallets" ("id", "user_id", "currency_code")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION yetkin_forbid_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries is append-only';
END;
$$;

DROP TRIGGER IF EXISTS ledger_entries_append_only ON ledger_entries;
CREATE TRIGGER ledger_entries_append_only
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_forbid_ledger_mutation();

CREATE TYPE "PaidCommandStatus" AS ENUM ('RESERVED', 'PROVIDER_DONE', 'SETTLED', 'FAILED');

CREATE TABLE "paid_command_reservations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "command_key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "status" "PaidCommandStatus" NOT NULL,
    "estimated_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "provider_json" TEXT,
    "result_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "paid_command_reservations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "paid_command_reservations_estimated_minor_non_negative"
      CHECK ("estimated_minor" >= 0)
);

CREATE UNIQUE INDEX "paid_command_reservations_user_id_scope_command_key_key"
  ON "paid_command_reservations"("user_id", "scope", "command_key");

CREATE INDEX "paid_command_reservations_user_id_created_at_idx"
  ON "paid_command_reservations"("user_id", "created_at");

ALTER TABLE "paid_command_reservations"
  ADD CONSTRAINT "paid_command_reservations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
