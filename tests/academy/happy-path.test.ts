import { describe, expect, it } from "vitest";
import {
  E2E_ACADEMY_BUYER_ID,
  E2E_ACADEMY_PLATFORM_ID,
  E2E_ACADEMY_START_MINOR,
  runAcademyCashJourney,
} from "../helpers/academy-cash-journey";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";

describe("akademi mutlu yol (katalog → kilit → settlement → müfredat → sınav → sertifika)", () => {
  it("tohum kursu cüzdandan düşer, hazine alır, emanet yoktur, replay debit etmez", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed?.id).toBe("ac_python_temel");
    const journey = await runAcademyCashJourney();

    expect(journey.firstApplied).toBe(true);
    expect(journey.replayApplied).toBe(false);
    expect(journey.purchase.status).toBe("SETTLED");
    expect(journey.purchase.amountMinor).toBe(journey.seedAmountMinor);
    expect(journey.buyerBalanceAfter).toBe(E2E_ACADEMY_START_MINOR - journey.seedAmountMinor);
    expect(journey.platformBalanceAfter).toBe(journey.seedAmountMinor);
    expect(journey.certificate).not.toBeNull();
    expect(journey.certificate?.userId).toBe(E2E_ACADEMY_BUYER_ID);
    expect(journey.certificate?.courseId).toBe(seed?.id);
    expect(journey.certificate?.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.certificate?.curriculumSeal).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.ledger.snapshot(E2E_ACADEMY_PLATFORM_ID).amountMinor).toBe(
      journey.seedAmountMinor,
    );
  });
});
