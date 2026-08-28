import { describe, expect, it } from "vitest";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import {
  formatMerchantAcademyLabReport,
  MERCHANT_LAB_CITIZEN_ID,
  MERCHANT_LAB_PLATFORM_ID,
  MERCHANT_LAB_TOP_UP_MINOR,
  runMerchantAcademyLabJourney,
} from "../helpers/merchant-academy-lab-journey";

describe("Merchant (Akademi) laboratuvar halkası", () => {
  it("wallet-top-up CREDIT → akademi DEBIT → sınav → mühür; split not_configured; emanet sızmaz", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeTruthy();
    const journey = await runMerchantAcademyLabJourney();

    expect(journey.cleared.applied).toBe(true);
    expect(journey.cleared.status).toBe("CLEARED");
    expect(journey.replayCleared.applied).toBe(false);

    expect(journey.chain.paytrCredit.purpose).toBe("wallet-top-up");
    expect(journey.chain.paytrCredit.direction).toBe("CREDIT");
    expect(journey.chain.paytrCredit.amountMinor).toBe(MERCHANT_LAB_TOP_UP_MINOR);
    expect(journey.chain.paytrCredit.userId).toBe(MERCHANT_LAB_CITIZEN_ID);

    expect(journey.chain.academyDebit.purpose).toBe("academy-purchase");
    expect(journey.chain.academyDebit.direction).toBe("DEBIT");
    expect(journey.chain.academyDebit.amountMinor).toBe(seed!.seedAmountMinor);
    expect(journey.academy.purchase.status).toBe("SETTLED");

    expect(journey.witness.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.witness.hashVerified).toBe(true);
    expect(journey.witness.publicVerifyStatus).toBe("found");
    expect(journey.witness.verifyHref).toContain(journey.witness.certificateHash);
    expect(journey.academyVisa.stamp.certificateHash).toBe(journey.witness.certificateHash);

    expect(journey.split.beginHold).toEqual({ ok: false, reason: "not_configured" });
    expect(journey.split.settle).toEqual({ ok: false, reason: "not_configured" });

    expect(journey.balances.citizen).toBe(MERCHANT_LAB_TOP_UP_MINOR - seed!.seedAmountMinor);
    expect(journey.balances.platform).toBe(seed!.seedAmountMinor);
    expect(journey.balances.citizen + journey.balances.platform).toBe(MERCHANT_LAB_TOP_UP_MINOR);
    expect(MERCHANT_LAB_PLATFORM_ID).toBe("00000000-0000-4000-8000-000000000001");

    const report = formatMerchantAcademyLabReport(journey);
    expect(report).toContain("wallet-top-up");
    expect(report).toContain("academy-purchase");
    expect(report).toContain("not_configured");
    expect(report).not.toContain("escrow-hold");
  });
});
