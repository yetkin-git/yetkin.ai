import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("cüzdan yükleme checkout fail-closed yüzeyi", () => {
  it("get-token 503 yolunda failPaymentOrder aynı istekte PENDING kapatır", () => {
    const route = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    expect(route).toContain("failPaymentOrder");
    expect(route).toContain("createPrismaPaymentOrderStore");
    expect(route).toContain("wallet.top_up.checkout_failed");
    expect(route).toContain("assertPaytrProductionSafety");
    expect(route).toContain("wallet.top_up:before-insert");
    const assertAt = route.indexOf("assertPaytrProductionSafety");
    const createAt = route.indexOf("paymentOrder.create");
    expect(assertAt).toBeGreaterThan(-1);
    expect(createAt).toBeGreaterThan(assertAt);
    const failed = route.slice(route.indexOf("if (!checkout.ok)"));
    const returnIdx = failed.indexOf("return { status: 503");
    expect(returnIdx).toBeGreaterThan(-1);
    expect(failed.slice(0, returnIdx)).toContain("failPaymentOrder");
    expect(failed.slice(0, returnIdx)).not.toContain("clearSuccessfulPaymentOrder");
  });

  it("form checkout hatasında Idempotency-Key döndürür (failed_oid yeni niyet)", () => {
    const form = readSrc("components/kernel/wallet-top-up-form.tsx");
    const errorBranch = form.slice(form.indexOf("if (!body.ok || !body.iframeUrl)"));
    expect(errorBranch).toContain("idempotency.rotate()");
  });
});
