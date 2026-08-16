import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
  type MemoryLedgerStore,
} from "./memory-money";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";
import type {
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerEnginePorts,
  FreelancerJobRecord,
} from "@/lib/freelancer/types";

export const E2E_CASH_CLIENT_ID = "e2e-freelancer-client";
export const E2E_CASH_FREELANCER_ID = "e2e-freelancer-worker";
export const E2E_CASH_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const E2E_CASH_GROSS_MINOR = 10_000;
export const E2E_CASH_CLIENT_START_MINOR = 100_000;

export type FreelancerCashJourneyResult = {
  ports: FreelancerEnginePorts & { ledger: MemoryLedgerStore };
  job: FreelancerJobRecord;
  bid: FreelancerBidRecord;
  contract: FreelancerContractRecord;
  holdAfterAccept: EscrowHoldRecord | null;
  holdAfterRelease: EscrowHoldRecord | null;
  released: FreelancerContractRecord;
  holdBps: number;
  holdMinor: number;
  netMinor: number;
};

function world(clientBalance = E2E_CASH_CLIENT_START_MINOR) {
  const ledger = createMemoryLedgerStore([
    { userId: E2E_CASH_CLIENT_ID, amountMinor: clientBalance },
    { userId: E2E_CASH_FREELANCER_ID, amountMinor: 0 },
    { userId: E2E_CASH_PLATFORM_ID, amountMinor: 0 },
  ]);
  const escrow = createMemoryEscrowStore();
  const freelancer = createMemoryFreelancerStore();
  return withMemoryAcceptAtomic({ ledger, escrow, freelancer });
}

/**
 * O9 bellek nakit yolu: ilan → teklif → fiyat kilidi + emanet hold → release.
 * Canlı Postgres ve Auth istemez.
 */
export async function runFreelancerCashJourney(): Promise<FreelancerCashJourneyResult> {
  const ports = world();
  const job = await createFreelancerJob(ports, {
    clientId: E2E_CASH_CLIENT_ID,
    title: "E2E nakit yolu — landing mühürü",
    brief: "Playwright bellek yolculuğu: ilan, kilit, emanet, serbest bırakma.",
    budgetMinor: E2E_CASH_GROSS_MINOR,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: E2E_CASH_FREELANCER_ID,
    amountMinor: E2E_CASH_GROSS_MINOR,
    coverNote: "Teslim 5 gün, mühürlü.",
  });
  const { contract } = await acceptFreelancerBid(ports, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: E2E_CASH_CLIENT_ID,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: E2E_CASH_PLATFORM_ID,
  });
  const holdAfterAccept = await ports.escrow.findById(contract.escrowHoldId);
  const released = await releaseFreelancerContract(ports, {
    contractId: contract.id,
    actorUserId: E2E_CASH_CLIENT_ID,
    platformUserId: E2E_CASH_PLATFORM_ID,
  });
  const holdAfterRelease = await ports.escrow.findById(contract.escrowHoldId);
  return {
    ports,
    job,
    bid,
    contract,
    holdAfterAccept,
    holdAfterRelease,
    released,
    holdBps: HOLD_BPS_DEFAULT,
    holdMinor: contract.holdMinor,
    netMinor: contract.netMinor,
  };
}
