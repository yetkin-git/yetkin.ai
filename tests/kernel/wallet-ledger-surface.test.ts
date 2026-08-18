import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ledgerDirectionLabel, ledgerSignedMinor, WALLET_LEDGER_TAKE } from "@/lib/kernel/ledger/display";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("cüzdan defter yüzeyi", () => {
  it("DEBIT'i çekim diye etiketlemez", () => {
    expect(ledgerDirectionLabel("CREDIT")).toBe("Giriş");
    expect(ledgerDirectionLabel("DEBIT")).toBe("Harcama");
    expect(ledgerDirectionLabel("DEBIT")).not.toBe("Çekim");
    expect(ledgerSignedMinor("CREDIT", 1500)).toBe(1500);
    expect(ledgerSignedMinor("DEBIT", 1500)).toBe(-1500);
    expect(WALLET_LEDGER_TAKE).toBe(50);
  });

  it("sayfa RoomSeal taşımaz; oturum defterini çeker", () => {
    const page = readSrc("app/(kernel)/cuzdan/page.tsx");
    expect(page).not.toContain("RoomSeal");
    expect(page).toContain("loadWalletBoard");
    expect(page).toContain("getSession");
    expect(page).toContain("LedgerHistory");
    expect(page).toContain("WalletTopUpForm");
  });

  it("S43: çekim UI / API / iskeleti açılmaz", () => {
    const page = readSrc("app/(kernel)/cuzdan/page.tsx");
    const load = readSrc("lib/kernel/ledger/load.ts");
    const history = readSrc("components/kernel/ledger-history.tsx");
    const display = readSrc("lib/kernel/ledger/display.ts");
    const combined = `${page}\n${load}\n${history}\n${display}`;
    expect(combined).not.toMatch(/\/api\/wallet\/withdraw/);
    expect(combined).not.toMatch(/\bwithdraw\b/i);
    expect(combined).not.toContain("bank-transfer");
    expect(page).toContain("WalletTopUpForm");
    expect(display).toContain('"Harcama"');
    expect(history).toContain("ledgerDirectionLabel");
    expect(history).not.toContain(">Çekim<");
  });

  it("defter sorgusu yalnız oturum userId ve tarih desc kullanır", () => {
    const load = readSrc("lib/kernel/ledger/load.ts");
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("where: { userId, currencyCode: SETTLEMENT_CURRENCY }");
    expect(load).toContain('createdAt: "desc"');
    expect(load).toContain("DATABASE_URL");
    expect(load).not.toContain("idempotencyKey");
  });

  it("settlement cüzdan okuması $queryRaw + lazy TRY satırı; FOR UPDATE yazma kilidi değildir", () => {
    const read = readSrc("lib/kernel/ledger/wallet-read.ts");
    const db = readSrc("lib/kernel/db.ts");
    expect(read).toContain('import "server-only"');
    expect(read).toContain("$queryRaw");
    expect(read).toContain("ON CONFLICT (user_id, currency_code) DO NOTHING");
    expect(read).toContain("SETTLEMENT_CURRENCY");
    expect(read).toContain("ensureSettlementWallet");
    expect(read).not.toContain("FOR UPDATE");
    expect(db).toContain("ensurePrismaQueryEngine");
    expect(db).toContain("prismaErrorLabel");
    expect(db).toContain("globalThis");
    expect(db).toContain("__yetkinKernelDb");
    expect(db).toContain("$queryRaw`SELECT 1`");
    expect(db).toContain("max: 20");
    expect(db).toContain("connectionTimeoutMillis: 10_000");
    expect(db).toContain("preferIpv6ForDirectHost");
    expect(db).toContain("ENOENT");
    const dns = readSrc("lib/kernel/dns-ipv6-first.ts");
    expect(dns).toContain('setDefaultResultOrder("ipv6first")');
  });

  it("Prisma 7 istemcisi query compiler'dır; binaryTargets ve SQLite yok", () => {
    const schema = readSrc("prisma/schema/base.prisma");
    const nextConfig = readSrc("next.config.ts");
    const instrumentation = readSrc("instrumentation.ts");
    expect(schema).toContain('provider = "prisma-client"');
    expect(schema).toContain('engineType = "client"');
    expect(schema).toContain('runtime = "nodejs"');
    expect(schema).toContain('provider = "postgresql"');
    expect(schema).not.toContain("binaryTargets");
    expect(schema).not.toContain("sqlite");
    expect(nextConfig).toContain("@prisma/adapter-pg");
    expect(nextConfig).toContain("@prisma/client-runtime-utils");
    expect(nextConfig).toContain("query_compiler_fast_bg.postgresql.wasm-base64.js");
    expect(nextConfig).toContain("./generated/prisma/**");
    expect(instrumentation).toContain("preferIpv6ForDirectHost");
    expect(instrumentation).toContain("NEXT_RUNTIME");
    expect(instrumentation).toContain("Müze instrumentation kopyası değildir");
    expect(instrumentation).toContain("ops.inngest.fail_closed");
    expect(instrumentation).not.toContain("node:dns");
  });
});
