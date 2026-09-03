import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  EARNINGS_CLIENT_ID,
  EARNINGS_CORP_OWNER_ID,
  EARNINGS_PLATFORM_ID,
  EARNINGS_START_MINOR,
  EARNINGS_WORKER_ID,
  runEarningsBridgeJourney,
} from "../helpers/earnings-bridge";

describe("D2.3 kazanç köprüsü e2e", () => {
  it("freelancer teslim + kurumsal mühür aynı EscrowHold/BPS motorunu kullanır; usta CREDIT yok", async () => {
    const journey = await runEarningsBridgeJourney();

    expect(journey.freelancer.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.freelancer.contract.holdBps).toBe(HOLD_BPS_DEFAULT);
    expect(journey.freelancer.contract.holdMinor).toBe(2_500);
    expect(journey.freelancer.contract.netMinor).toBe(22_500);
    expect(journey.freelancer.released?.status).toBe("RELEASED");
    expect(journey.freelancer.visa?.applied).toBe(true);
    expect(journey.freelancer.clientBalance).toBe(EARNINGS_START_MINOR);
    expect(journey.freelancer.workerBalance).toBe(0);
    expect(journey.freelancer.platformBalance).toBe(0);

    expect(journey.kurumsal.holdAfterSeal?.status).toBe("PENDING");
    expect(journey.kurumsal.posting.escrowHoldId).toBe(journey.kurumsal.holdAfterSeal?.id);
    expect(journey.kurumsal.posting.holdBps).toBe(HOLD_BPS_DEFAULT);
    expect(journey.kurumsal.posting.holdMinor).toBe(2_500);
    expect(journey.kurumsal.posting.netMinor).toBe(22_500);
    expect(journey.kurumsal.ledgerAfterOffer).toBe(journey.kurumsal.ledgerAfterSeal);
    expect(journey.kurumsal.offer.status).toBe("ACCEPTED");
    expect(journey.kurumsal.awarded.awardedUserId).toBe(EARNINGS_WORKER_ID);
    expect(journey.kurumsal.released?.status).toBe("RELEASED");
    expect(journey.kurumsal.visa?.applied).toBe(true);
    expect(journey.kurumsal.ownerBalance).toBe(EARNINGS_START_MINOR);
    expect(journey.kurumsal.workerBalance).toBe(0);
    expect(journey.kurumsal.platformBalance).toBe(0);

    expect(journey.freelancer.contract.holdBps).toBe(journey.kurumsal.posting.holdBps);
    expect(EARNINGS_CLIENT_ID).not.toBe(EARNINGS_CORP_OWNER_ID);
    expect(EARNINGS_PLATFORM_ID).toMatch(/^00000000-0000-4000-8000-000000000001$/);
  });
});
