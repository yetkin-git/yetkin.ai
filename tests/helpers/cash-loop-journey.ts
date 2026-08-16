import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  clearSuccessfulPaymentOrder,
  type PaymentOrderSnapshot,
  type PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  releaseFreelancerContract,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { issueCareerVisaStamp, type CareerVisaIssueResult } from "@/lib/career/engine";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";
import type {
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerEnginePorts,
  FreelancerJobRecord,
} from "@/lib/freelancer/types";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
  type MemoryLedgerStore,
} from "./memory-money";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "./memory-career";

export const CASH_LOOP_CLIENT_ID = "e2e-cash-loop-client";
export const CASH_LOOP_FREELANCER_ID = "e2e-cash-loop-worker";
export const CASH_LOOP_PLATFORM_ID = PLATFORM_TREASURY_USER_ID;
export const CASH_LOOP_TOP_UP_MINOR = 100_000;
export const CASH_LOOP_GROSS_MINOR = 10_000;
export const CASH_LOOP_MERCHANT_OID = "wallet-top-up-e2e-cash-loop";

export type CashLoopJourneyResult = {
  ports: FreelancerEnginePorts & { ledger: MemoryLedgerStore };
  merchantOid: string;
  cleared: { applied: boolean; status: string };
  job: FreelancerJobRecord;
  bid: FreelancerBidRecord;
  contract: FreelancerContractRecord;
  holdAfterAccept: EscrowHoldRecord | null;
  released: FreelancerContractRecord;
  holdAfterRelease: EscrowHoldRecord | null;
  visa: CareerVisaIssueResult;
  holdBps: number;
  holdMinor: number;
  netMinor: number;
};

function memoryPaymentOrders(initial: PaymentOrderSnapshot): PaymentOrderStore {
  let row = { ...initial };
  return {
    async findByMerchantOid(merchantOid) {
      return merchantOid === row.merchantOid ? { ...row } : null;
    },
    async markPaid(id, _at) {
      row = { ...row, id, status: "PAID" };
      return { ...row };
    },
    async markCleared(id, _at) {
      row = { ...row, id, status: "CLEARED" };
      return { ...row };
    },
    async markFailed(id, _at) {
      row = { ...row, id, status: "FAILED" };
      return { ...row };
    },
    async listUnclearedPaid() {
      return row.status === "PAID" ? [{ ...row }] : [];
    },
  };
}

/**
 * T4 bellek nakit döngüsü:
 * PayTR mock/sandbox sonrası CREDIT (clearing) → freelancer emanet → RELEASE → kariyer vizesi.
 * Canlı Auth/Postgres istemez. Studio katalog satırı gerekmez (oda izolasyonu).
 * Checkout token CREDIT yazmaz; para yalnız clearSuccessfulPaymentOrder ile girer.
 */
export async function runCashLoopJourney(): Promise<CashLoopJourneyResult> {
  const ledger = createMemoryLedgerStore([
    { userId: CASH_LOOP_CLIENT_ID, amountMinor: 0 },
    { userId: CASH_LOOP_FREELANCER_ID, amountMinor: 0 },
    { userId: CASH_LOOP_PLATFORM_ID, amountMinor: 0 },
  ]);
  const orders = memoryPaymentOrders({
    id: "po-e2e-cash-loop",
    userId: CASH_LOOP_CLIENT_ID,
    merchantOid: CASH_LOOP_MERCHANT_OID,
    amountMinor: CASH_LOOP_TOP_UP_MINOR,
    currencyCode: "TRY",
    status: "PENDING",
    createdAt: new Date("2026-08-15T21:00:00.000Z"),
  });
  const cleared = await clearSuccessfulPaymentOrder(
    { ledger, orders },
    CASH_LOOP_MERCHANT_OID,
    new Date("2026-08-15T21:01:00.000Z"),
    { expectedAmountMinor: CASH_LOOP_TOP_UP_MINOR },
  );

  const ports = withMemoryAcceptAtomic({
    ledger,
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
  const job = await createFreelancerJob(ports, {
    clientId: CASH_LOOP_CLIENT_ID,
    title: "T4 nakit döngüsü — emanet mühürü",
    brief: "Kayıt sonrası yükleme, kabul, serbest bırakma ve kariyer vizesi.",
    budgetMinor: CASH_LOOP_GROSS_MINOR,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: CASH_LOOP_FREELANCER_ID,
    amountMinor: CASH_LOOP_GROSS_MINOR,
    coverNote: "Teslim mühürlü.",
  });
  const { contract } = await acceptFreelancerBid(ports, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: CASH_LOOP_CLIENT_ID,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: CASH_LOOP_PLATFORM_ID,
  });
  const holdAfterAccept = await ports.escrow.findById(contract.escrowHoldId);
  const released = await releaseFreelancerContract(ports, {
    contractId: contract.id,
    actorUserId: CASH_LOOP_CLIENT_ID,
    platformUserId: CASH_LOOP_PLATFORM_ID,
  });
  const holdAfterRelease = await ports.escrow.findById(contract.escrowHoldId);

  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: "FREELANCER_RELEASE",
      sourceId: released.id,
      userId: CASH_LOOP_FREELANCER_ID,
      actorUserIds: [CASH_LOOP_FREELANCER_ID, CASH_LOOP_CLIENT_ID],
      title: job.title,
      issuedAt: released.releasedAt ?? new Date("2026-08-15T21:02:00.000Z"),
      certificateHash: null,
    },
  ]);
  const visa = await issueCareerVisaStamp(
    { career: createMemoryCareerStore(), proofs },
    {
      sourceKind: "FREELANCER_RELEASE",
      sourceId: released.id,
      actorUserId: CASH_LOOP_CLIENT_ID,
    },
  );

  return {
    ports,
    merchantOid: CASH_LOOP_MERCHANT_OID,
    cleared: { applied: cleared.applied, status: cleared.order.status },
    job,
    bid,
    contract,
    holdAfterAccept,
    released,
    holdAfterRelease,
    visa,
    holdBps: HOLD_BPS_DEFAULT,
    holdMinor: contract.holdMinor,
    netMinor: contract.netMinor,
  };
}
