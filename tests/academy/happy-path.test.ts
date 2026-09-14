import { describe, expect, it } from "vitest";
import {
  E2E_ACADEMY_BUYER_ID,
  E2E_ACADEMY_PLATFORM_ID,
  E2E_ACADEMY_START_MINOR,
  runAcademyCashJourney,
} from "../helpers/academy-cash-journey";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";

describe("akademi mutlu yol (katalog → kilit → settlement → müfredat → sınav → sertifika)", () => {
  it("sentetik kurs cüzdandan düşer, hazine alır, emanet yoktur, replay debit etmez", async () => {
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai"]);
    const journey = await runAcademyCashJourney();

    expect(journey.firstApplied).toBe(true);
    expect(journey.replayApplied).toBe(false);
    expect(journey.purchase.status).toBe("SETTLED");
    expect(journey.purchase.amountMinor).toBe(journey.seedAmountMinor);
    expect(journey.buyerBalanceAfter).toBe(E2E_ACADEMY_START_MINOR - journey.seedAmountMinor);
    expect(journey.platformBalanceAfter).toBe(journey.seedAmountMinor);
    expect(journey.certificate).not.toBeNull();
    expect(journey.certificate?.score).toBe(100);
    expect(journey.certificate?.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.ledger.snapshot(E2E_ACADEMY_PLATFORM_ID).amountMinor).toBe(
      journey.seedAmountMinor,
    );
    expect(journey.ledger.snapshot(E2E_ACADEMY_BUYER_ID).amountMinor).toBe(
      E2E_ACADEMY_START_MINOR - journey.seedAmountMinor,
    );
  });
});

