import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const VERTICALS = [
  {
    name: "pazaryeri",
    runtime: "archived/lib/pazaryeri/runtime.ts",
    engine: "archived/lib/pazaryeri/engine.ts",
    store: "archived/lib/pazaryeri/prisma-store.ts",
    bind: "bindPazaryeriStore(tx)",
  },
  {
    name: "junior",
    runtime: "archived/lib/junior/runtime.ts",
    engine: "archived/lib/junior/engine.ts",
    store: "archived/lib/junior/prisma-store.ts",
    bind: "bindJuniorStore(tx)",
  },
  {
    name: "arena",
    runtime: "archived/lib/arena/runtime.ts",
    engine: "archived/lib/arena/engine.ts",
    store: "archived/lib/arena/prisma-store.ts",
    bind: "bindArenaStore(tx)",
  },
  {
    name: "kurumsal",
    runtime: "archived/lib/kurumsal/runtime.ts",
    engine: "archived/lib/kurumsal/engine.ts",
    store: "archived/lib/kurumsal/prisma-store.ts",
    bind: "bindKurumsalStore(tx)",
  },
  {
    name: "devlabs",
    runtime: "archived/lib/devlabs/runtime.ts",
    engine: "archived/lib/devlabs/bench.ts",
    store: "archived/lib/devlabs/prisma-store.ts",
    bind: "bindDevLabsStore(tx)",
  },
] as const;

describe("P0 nakit Unit of Work yüzeyi — beş dikey", () => {
  it("runtime'lar tx-bound ledger kullanır; çıplak createPrismaLedgerStore yazmaz", () => {
    for (const vertical of VERTICALS) {
      const runtime = readSrc(vertical.runtime);
      const engine = readSrc(vertical.engine);
      const store = readSrc(vertical.store);
      expect(runtime, vertical.runtime).toContain("prisma.$transaction");
      expect(runtime, vertical.runtime).toContain("bindLedgerStore(tx)");
      expect(runtime, vertical.runtime).toContain("runMoneyAtomic");
      expect(runtime, vertical.runtime).toContain(vertical.bind);
      expect(runtime, vertical.runtime).not.toContain("createPrismaLedgerStore()");
      expect(engine, vertical.engine).toContain("runMoneyAtomic");
      expect(store, vertical.store).toContain(vertical.bind.replace("(tx)", ""));
    }
  });

  it("çekirdek ledger store FOR UPDATE'i tx-bound bind'a bağlar", () => {
    const ledger = readSrc("lib/kernel/ledger/prisma-store.ts");
    expect(ledger).toContain("FOR UPDATE");
    expect(ledger).toContain("bindLedgerStore");
    expect(ledger).toContain("Çıplak PrismaClient");
  });
});
