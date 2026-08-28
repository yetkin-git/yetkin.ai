import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Faz 1 defter immutability ve cüzdan CAS yüzeyi", () => {
  it("migration append-only trigger, CHECK ve RESTRICT taşır", () => {
    const sql = readSrc(
      "prisma/migrations/20260819030000_ledger_immutability_paid_commands/migration.sql",
    );
    expect(sql).toContain("wallets_amount_minor_non_negative");
    expect(sql).toContain("ledger_entries_amount_minor_positive");
    expect(sql).toContain("ledger_entries is append-only");
    expect(sql).toContain("BEFORE UPDATE OR DELETE ON ledger_entries");
    expect(sql).toContain("ON DELETE RESTRICT");
    expect(sql).toContain("paid_command_reservations");
  });

  it("Prisma şema composite FK Restrict ve cüzdan unique taşır", () => {
    const schema = readSrc("prisma/schema/kernel.prisma");
    expect(schema).toContain("@@unique([id, userId, currencyCode])");
    expect(schema).toContain("onDelete: Restrict");
    expect(schema).toContain("model PaidCommandReservation");
    expect(schema).toContain("model LedgerEntry");
  });

  it("Prisma ledger insert defter+cüzdan CTE CAS kullanır", () => {
    const store = readSrc("lib/kernel/ledger/prisma-store.ts");
    expect(store).toContain("INSERT INTO ledger_entries");
    expect(store).toContain("UPDATE wallets");
    expect(store).toContain("amount_minor = ${wallet.amountMinor}");
    expect(store).toContain("Defter ve cüzdan atomik yazılamadı.");
    expect(store).toContain("FOR UPDATE");
  });

  it("ops:migrate post-apply defter trigger, CHECK, RESTRICT ve rezerv tablosunu mühürler", () => {
    const lib = readSrc("scripts/ops-migrate-lib.ts");
    expect(lib).toContain("assertLedgerImmutability");
    expect(lib).toContain("assertPaidCommandReservations");
    expect(lib).toContain("ledger_entries_append_only");
    expect(lib).toContain("paid_command_reservations");
    expect(lib).toContain("LEDGER_WALLET_RESTRICT_FK");
    expect(lib).toContain("LEDGER_USER_RESTRICT_FK");
    expect(lib).toContain("inspectLedgerMigrationSql");
    expect(lib).toContain("paid_command_reservations_estimated_minor_non_negative");
  });
});
