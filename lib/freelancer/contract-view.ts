import {
  railV1AcceptDataSchema,
  railV1ClientJobBidsViewSchema,
  railV1ContractsDataSchema,
  railV1ReleaseDataSchema,
  type ClientJobBidsView,
  type FreelancerContractView,
  type RailV1AcceptData,
  type RailV1Contract,
  type RailV1ReleaseData,
  type RailV1VisaStamp,
} from "@/lib/kernel/http/v1-contract";
import type { FreelancerBidRecord, FreelancerContractRecord, FreelancerStore } from "@/lib/freelancer/types";

function iso(value: Date): string {
  return value.toISOString();
}

function isoOrNull(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

/**
 * Yayınlanmış Tezgâh satırı. Mesaj gövdesi / artifact / hold kaydı yok.
 * `deliveredAt` yalnız DELIVERY zaman damgasıdır.
 */
export function toFreelancerContractWire(contract: FreelancerContractRecord): RailV1Contract {
  return {
    id: contract.id,
    jobId: contract.jobId,
    bidId: contract.bidId,
    clientId: contract.clientId,
    freelancerId: contract.freelancerId,
    escrowHoldId: contract.escrowHoldId,
    status: contract.status,
    currencyCode: contract.currencyCode,
    grossMinor: contract.grossMinor,
    holdMinor: contract.holdMinor,
    netMinor: contract.netMinor,
    holdBps: contract.holdBps,
    fundedAt: iso(contract.fundedAt),
    releasedAt: isoOrNull(contract.releasedAt),
    refundedAt: isoOrNull(contract.refundedAt),
    createdAt: iso(contract.createdAt),
    updatedAt: iso(contract.updatedAt),
  };
}

export function toFreelancerContractViewWire(
  contract: FreelancerContractRecord,
  deliveredAt: Date | null,
): FreelancerContractView {
  return {
    ...toFreelancerContractWire(contract),
    deliveredAt: isoOrNull(deliveredAt),
  };
}

type VisaStampDates = {
  id: string;
  userId: string;
  sourceKind: RailV1VisaStamp["sourceKind"];
  sourceId: string;
  visaKey: string;
  moduleId: string;
  title: string;
  certificateHash: string | null;
  issuedAt: Date;
  createdAt: Date;
};

export function toRailV1VisaStampWire(stamp: VisaStampDates): RailV1VisaStamp {
  return {
    id: stamp.id,
    userId: stamp.userId,
    sourceKind: stamp.sourceKind,
    sourceId: stamp.sourceId,
    visaKey: stamp.visaKey,
    moduleId: stamp.moduleId,
    title: stamp.title,
    certificateHash: stamp.certificateHash,
    issuedAt: iso(stamp.issuedAt),
    createdAt: iso(stamp.createdAt),
  };
}

/** GET owner teklif listesi. bidderId yok; bidId accept gövdesi ile aynı addır. */
export function toOwnerBidsWire(bids: readonly FreelancerBidRecord[]): ClientJobBidsView {
  const data = {
    bids: bids.map((bid) => ({
      bidId: bid.id,
      amountMinor: bid.amountMinor,
      coverNote: bid.coverNote,
      createdAt: iso(bid.createdAt),
    })),
  };
  const parsed = railV1ClientJobBidsViewSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Teklif görünümü üretilemedi.");
  }
  return parsed.data;
}

/** POST accept ack. deliveredAt / visaStamp yok; Tezgâh GET view şeması değildir. */
export function toFreelancerAcceptWire(contract: FreelancerContractRecord): RailV1AcceptData {
  const data = { contract: toFreelancerContractWire(contract) };
  const parsed = railV1AcceptDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Kabul görünümü üretilemedi.");
  }
  return parsed.data;
}

/** POST release ack. deliveredAt yok; Tezgâh GET view şeması değildir. */
export function toFreelancerReleaseWire(
  contract: FreelancerContractRecord,
  visaStamp: VisaStampDates | null,
): RailV1ReleaseData {
  const data = {
    contract: toFreelancerContractWire(contract),
    visaStamp: visaStamp ? toRailV1VisaStampWire(visaStamp) : null,
  };
  const parsed = railV1ReleaseDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Hak ediş görünümü üretilemedi.");
  }
  return parsed.data;
}

export async function listFreelancerContractViews(
  store: FreelancerStore,
  userId: string,
): Promise<FreelancerContractView[]> {
  const records = await store.listContractsForUser(userId);
  const latest = await store.listLatestDeliveryAtByContractIds(records.map((row) => row.id));
  const contracts = records.map((record) =>
    toFreelancerContractViewWire(record, latest.get(record.id) ?? null),
  );
  const parsed = railV1ContractsDataSchema.safeParse({ contracts });
  if (!parsed.success) {
    throw new Error("Sözleşme görünümü üretilemedi.");
  }
  return parsed.data.contracts;
}
