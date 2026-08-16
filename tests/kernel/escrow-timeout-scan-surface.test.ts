import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("K7 emanet TTL çekirdek sınırı", () => {
  it("inngest tarayıcısı dikey Prisma modellerini yazmaz; yalnız EscrowHold+Ledger ve kanca/olay basar", () => {
    const source = readSrc("lib/kernel/jobs/inngest.ts");
    expect(source).toContain("runEscrowTimeoutRefunds");
    expect(source).toContain("INNGEST_EVENTS.ESCROW_REFUNDED");
    expect(source).toContain("escrowRefundedNotify");
    expect(source).toContain("notify-vertical-hooks");
    expect(source).not.toContain("freelancerContract");
    expect(source).not.toContain("corporateJobPosting");
    expect(source).not.toContain("arenaTender");
    expect(source).not.toContain("marketplaceOrder");
  });

  it("çekirdek kanca portu purpose+holdId imzası taşır; dikey tablo adı yoktur", () => {
    const hooks = readSrc("lib/kernel/escrow/refund-hooks.ts");
    expect(hooks).toContain("registerEscrowRefundHook");
    expect(hooks).toContain("onEscrowRefunded");
    expect(hooks).toContain("purpose");
    expect(hooks).toContain("holdId");
    expect(hooks).not.toContain("freelancerContract");
    expect(hooks).not.toContain("corporateJobPosting");
    expect(hooks).not.toContain("arenaTender");
    expect(hooks).not.toContain("marketplaceOrder");
  });

  it("kompozisyon kökü API dilimindedir; dört dikey kancayı kaydeder", () => {
    const route = readSrc("app/api/(kernel)/jobs/inngest/route.ts");
    expect(route).toContain("registerVerticalEscrowRefundHooks");
    const bindings = readSrc("app/api/(kernel)/jobs/register-escrow-hooks.ts");
    expect(bindings).toContain("FREELANCER_ESCROW_REFUND_PURPOSE");
    expect(bindings).toContain("KURUMSAL_ESCROW_REFUND_PURPOSE");
    expect(bindings).toContain("ARENA_ESCROW_REFUND_PURPOSE");
    expect(bindings).toContain("PAZARYERI_ESCROW_REFUND_PURPOSE");
    expect(bindings).toContain("registerEscrowTimeoutGuard");
  });

  it("public/favicon.ico kenar 404 kirliliğini keser", () => {
    const favicon = join(ROOT, "public/favicon.ico");
    expect(existsSync(favicon)).toBe(true);
    expect(statSync(favicon).size).toBeGreaterThan(16);
  });
});
