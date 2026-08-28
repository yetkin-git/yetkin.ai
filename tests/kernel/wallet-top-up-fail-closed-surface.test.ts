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

  it("mock checkout bakiyeye düşmez; PENDING aynı istekte kapanır; iframe basılmaz", () => {
    const route = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    expect(route).toContain("shouldFailCloseMockTopUp");
    expect(route).toContain("wallet.top_up.mock_no_credit");
    const mockAt = route.indexOf("shouldFailCloseMockTopUp(checkout.mockCheckout)");
    expect(mockAt).toBeGreaterThan(-1);
    const mockBranch = route.slice(mockAt);
    const mockReturn = mockBranch.indexOf("return {");
    expect(mockReturn).toBeGreaterThan(-1);
    expect(mockBranch.slice(0, mockReturn)).toContain("failPaymentOrder");
    expect(mockBranch.slice(0, mockReturn)).toContain("wallet.top_up.mock_no_credit");
    expect(mockBranch.slice(0, mockReturn)).not.toContain("clearSuccessfulPaymentOrder");
    expect(mockBranch).toContain("mockCheckout: true");
    expect(mockBranch.slice(mockReturn, mockReturn + 400)).not.toContain("iframeUrl");
    expect(route).toContain("wallet.top_up.pending");

    const form = readSrc("components/kernel/wallet-top-up-form.tsx");
    expect(form).toContain("mockCheckout");
    expect(form).toContain("copy.mockNoCredit");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    expect(modal).toContain("mockCheckout");
    expect(modal).toContain("copy.mockNoCredit");
    expect(modal).not.toContain("CREDIT yaz");
  });

  it("form checkout hatasında Idempotency-Key döndürür (failed_oid yeni niyet)", () => {
    const form = readSrc("components/kernel/wallet-top-up-form.tsx");
    const errorBranch = form.slice(form.indexOf("if (!envelope.ok || !iframe)"));
    expect(errorBranch).toContain("idempotency.rotate()");
  });
});
