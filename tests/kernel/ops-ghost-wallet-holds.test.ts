import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatGhostWalletHoldInventory,
  ghostWalletHoldExitCode,
  inventoryGhostWalletHolds,
  parseGhostHoldCliArgs,
  type GhostHoldQuery,
} from "../../scripts/ops-ghost-wallet-holds-lib";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ops ghost wallet holds", () => {
  it("CLI --strict / --limit parse eder; paket scripti vardır", () => {
    expect(parseGhostHoldCliArgs([])).toEqual({ limit: 50, strict: false });
    expect(parseGhostHoldCliArgs(["--strict", "--limit", "10"])).toEqual({
      limit: 10,
      strict: true,
    });
    expect(() => parseGhostHoldCliArgs(["--limit", "0"])).toThrow(/limit/);
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:ghost-wallet-holds"]).toBe("tsx scripts/ops-ghost-wallet-holds.ts");
    const script = readSrc("scripts/ops-ghost-wallet-holds.ts");
    expect(script).toContain("inventoryGhostWalletHolds");
    expect(script).not.toContain("markReleased");
    expect(script).not.toMatch(/UPDATE\s+escrow_holds/i);
    expect(script).not.toMatch(/INSERT\s+INTO\s+ledger/i);
  });

  it("boş DB envanteri 0; --strict yeşil; CREDIT yazmaz", async () => {
    const db: GhostHoldQuery = {
      async query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string) {
        if (/COUNT/i.test(sql)) {
          return { rows: [{ count: "0" }] as unknown as T[] };
        }
        return { rows: [] as T[] };
      },
    };
    const inv = await inventoryGhostWalletHolds(db, 20);
    expect(inv.walletIdPending).toBe(0);
    expect(inv.ledgerDebitPending).toBe(0);
    expect(inv.uniqueHolds).toBe(0);
    expect(ghostWalletHoldExitCode(inv, true)).toBe(0);
    expect(formatGhostWalletHoldInventory(inv)).toContain("Hayalet yok");
  });

  it("wallet_id PENDING sayımı --strict çıkış 1; temizlik CREDIT değildir", async () => {
    const db: GhostHoldQuery = {
      async query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string) {
        if (/COUNT/i.test(sql) && /wallet_id IS NOT NULL/i.test(sql)) {
          return { rows: [{ count: "1" }] as unknown as T[] };
        }
        if (/COUNT/i.test(sql)) {
          return { rows: [{ count: "0" }] as unknown as T[] };
        }
        if (/wallet_id IS NOT NULL/i.test(sql)) {
          return {
            rows: [
              {
                id: "hold-1",
                reference_key: "job:ghost",
                status: "PENDING",
                wallet_id: "w-1",
                user_id: "u-1",
                gross_minor: 1000,
                created_at: new Date("2026-08-24T00:00:00.000Z"),
              },
            ] as unknown as T[],
          };
        }
        return { rows: [] as T[] };
      },
    };
    const inv = await inventoryGhostWalletHolds(db, 10);
    expect(inv.walletIdPending).toBe(1);
    expect(inv.rows[0]?.source).toBe("wallet_id");
    expect(ghostWalletHoldExitCode(inv, false)).toBe(0);
    expect(ghostWalletHoldExitCode(inv, true)).toBe(1);
    expect(formatGhostWalletHoldInventory(inv)).toContain("Elle CREDIT/REFUNDED yasak");
  });
});
