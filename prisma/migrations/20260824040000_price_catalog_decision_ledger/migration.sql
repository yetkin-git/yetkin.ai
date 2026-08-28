-- Faz A: gerekçeli zam defteri. Append-only. Sessiz zam yok.
-- FORCE RLS event trigger CREATE TABLE sonrası ENABLE+FORCE basar.
-- PostgREST yazma politikası yok; Prisma BYPASSRLS yazar.

CREATE TABLE "price_catalog_decision_ledger" (
    "id" TEXT NOT NULL,
    "catalog_entry_id" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "unit_key" TEXT NOT NULL,
    "unit_type" "PriceCatalogUnitType" NOT NULL,
    "reason_code" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "old_minor" INTEGER NOT NULL,
    "new_minor" INTEGER NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "actor_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_catalog_decision_ledger_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "price_catalog_decision_ledger_old_minor_non_negative"
      CHECK ("old_minor" >= 0),
    CONSTRAINT "price_catalog_decision_ledger_new_minor_non_negative"
      CHECK ("new_minor" >= 0),
    CONSTRAINT "price_catalog_decision_ledger_reason_code_check"
      CHECK ("reason_code" IN ('ADMIN_MANUAL', 'MACRO_INDEX_ADJUSTMENT', 'PROMOTION', 'CORRECTION')),
    CONSTRAINT "price_catalog_decision_ledger_reason_len"
      CHECK (char_length("reason") >= 8)
);

CREATE INDEX "price_catalog_decision_ledger_created_at_idx"
  ON "price_catalog_decision_ledger"("created_at");

CREATE INDEX "price_catalog_decision_ledger_catalog_entry_id_created_at_idx"
  ON "price_catalog_decision_ledger"("catalog_entry_id", "created_at");

CREATE INDEX "price_catalog_decision_ledger_module_key_unit_key_created_at_idx"
  ON "price_catalog_decision_ledger"("module_key", "unit_key", "created_at");

CREATE OR REPLACE FUNCTION yetkin_forbid_price_catalog_decision_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'price_catalog_decision_ledger is append-only';
END;
$$;

DROP TRIGGER IF EXISTS price_catalog_decision_ledger_append_only ON price_catalog_decision_ledger;
CREATE TRIGGER price_catalog_decision_ledger_append_only
  BEFORE UPDATE OR DELETE ON price_catalog_decision_ledger
  FOR EACH ROW
  EXECUTE PROCEDURE yetkin_forbid_price_catalog_decision_ledger_mutation();
