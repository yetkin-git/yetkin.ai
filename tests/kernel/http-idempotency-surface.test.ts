import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("HTTP Idempotency-Key yazma yüzeyi", () => {
  it("üç nakit rotası başlığı zorunlu kılar ve replay kapısını çağırır", () => {
    const wallet = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    const purchase = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    const accept = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    for (const source of [wallet, purchase, accept]) {
      expect(source).toContain("readIdempotencyKey");
      expect(source).toContain("settleHttpIdempotency");
      expect(source).toContain("hashIdempotencyPayload");
      expect(source).toContain("createPrismaHttpIdempotencyStore");
    }
    expect(wallet).toContain("buildIdempotentMerchantOid");
    expect(wallet).toContain("decideWalletTopUpReuse");
    expect(wallet).not.toContain("buildMerchantOid(");
  });

  it("istemci çift tıklamada aynı Idempotency-Key başlığını basar", () => {
    const walletForm = readSrc("components/kernel/wallet-top-up-form.tsx");
    const purchase = readSrc("components/academy/purchase-button.tsx");
    const accept = readSrc("components/freelancer/accept-bid-button.tsx");
    const hook = readSrc("components/kernel/use-idempotency-key.ts");
    expect(hook).toContain("IDEMPOTENCY_KEY_HEADER");
    expect(hook).toContain("createClientIdempotencyKey");
    for (const source of [walletForm, purchase, accept]) {
      expect(source).toContain("useIdempotencyKey");
      expect(source).toContain("idempotency.headers()");
    }
  });
});
