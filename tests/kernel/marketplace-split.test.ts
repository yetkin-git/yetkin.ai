import { describe, expect, it } from "vitest";
import {
  buildMarketplaceSplitIntent,
  DEFAULT_MARKETPLACE_SPLIT_PROVIDER,
  paytrMarketplaceSplitPort,
  settleMarketplaceSplit,
} from "@/lib/kernel/payments/marketplace-split";

describe("Pazaryeri split portu", () => {
  it("PayTR Pazaryeri gün 0 beginHold ve settle not_configured döner; intent usta cüzdanına yazmaz", async () => {
    const hold = await paytrMarketplaceSplitPort.beginHold({
      buyerUserId: "alici-1",
      artisanUserId: "usta-1",
      referenceKey: "freelancer:job-1",
      grossMinor: 10_000,
      holdBps: 1000,
      currencyCode: "TRY",
    });
    expect(hold).toEqual({ ok: false, reason: "not_configured" });
    const intent = buildMarketplaceSplitIntent({
      referenceKey: "freelancer:contract-1",
      legs: [
        { role: "artisan", userId: "usta-1", amountMinor: 9_000 },
        { role: "platform", userId: "hazine", amountMinor: 1_000 },
      ],
    });
    expect(intent.providerId).toBe(DEFAULT_MARKETPLACE_SPLIT_PROVIDER);
    expect(intent.status).toBe("recorded_pending_psp");
    const result = await settleMarketplaceSplit(intent, paytrMarketplaceSplitPort);
    expect(result).toEqual({ ok: false, reason: "not_configured" });
  });
});
