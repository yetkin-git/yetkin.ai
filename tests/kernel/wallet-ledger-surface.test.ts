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
});
