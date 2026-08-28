import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  CASH_LOOP_CLIENT_ID,
  CASH_LOOP_FREELANCER_ID,
  CASH_LOOP_GROSS_MINOR,
  CASH_LOOP_PLATFORM_ID,
  CASH_LOOP_TOP_UP_MINOR,
  runCashLoopJourney,
} from "../helpers/cash-loop-journey";

describe("T4 nakit döngüsü — PayTR clearing → emanet; release donuk", () => {
  it("sıfır bakiyeden CREDIT ve emanet hold basar; usta hakedişi yazılmaz", async () => {
    const journey = await runCashLoopJourney();

    expect(journey.cleared.applied).toBe(true);
    expect(journey.cleared.status).toBe("CLEARED");
    expect(journey.job.status).toBe("OPEN");
    expect(journey.contract.status).toBe("FUNDED");
    expect(journey.payoutFrozen).toBe(false);
    expect(journey.released?.status).toBe("RELEASED");
    expect(journey.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.holdBps).toBe(HOLD_BPS_DEFAULT);
    expect(journey.holdMinor + journey.netMinor).toBe(CASH_LOOP_GROSS_MINOR);

    expect(journey.ports.ledger.snapshot(CASH_LOOP_CLIENT_ID).amountMinor).toBe(
      CASH_LOOP_TOP_UP_MINOR,
    );
    expect(journey.ports.ledger.snapshot(CASH_LOOP_FREELANCER_ID).amountMinor).toBe(0);
    expect(journey.ports.ledger.snapshot(CASH_LOOP_PLATFORM_ID).amountMinor).toBe(0);
    expect(journey.visa?.applied).toBe(true);
  });
});
