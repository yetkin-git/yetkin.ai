import type { ListingVisaLockId } from "@/lib/kernel/catalog-ids";
import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type { InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import type { AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";
import type { EscrowStore } from "@/lib/kernel/escrow/types";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import type { MarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";

export type FreelancerJobStatus = "OPEN" | "AWARDED" | "CANCELLED";
export type FreelancerJobVisibility = "PUBLIC" | "DIRECT";
export type FreelancerBidStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";
export type FreelancerContractStatus = "FUNDED" | "RELEASED" | "REFUNDED" | "DISPUTED";

export type FreelancerDisputeRoundStatus =
  | "ROUND_ONE_OPEN"
  | "ROUND_ONE_SUBMITTED"
  | "ROUND_TWO_SUBMITTED"
  | "AI_REPORT_READY"
  | "SETTLED"
  | "HUMAN_REVIEW";

export type FreelancerContractMessageKind = "TEXT" | "DELIVERY" | "REVISION";
export type FreelancerSquadKind = "PROJECT_EPHEMERAL";
export type FreelancerSquadStatus = "FORMING" | "ACTIVE" | "DISBANDED";

export type FreelancerJobRecord = {
  id: string;
  clientId: string;
  title: string;
  brief: string;
  budgetMinor: AmountMinor;
  currencyCode: CurrencyCode;
  visaPathwayId: ListingVisaLockId;
  /** PUBLIC = açık tahta; DIRECT = yalnız davetli ustanın tezgâhı. */
  visibility: FreelancerJobVisibility;
  inviteeId: string | null;
  /** Davetli ustaya sunulan teslim süresi (gün). */
  dueDays: number | null;
  status: FreelancerJobStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerBidRecord = {
  id: string;
  jobId: string;
  bidderId: string;
  amountMinor: AmountMinor;
  currencyCode: CurrencyCode;
  coverNote: string;
  status: FreelancerBidStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerContractRecord = {
  id: string;
  jobId: string;
  bidId: string;
  clientId: string;
  freelancerId: string;
  escrowHoldId: string;
  status: FreelancerContractStatus;
  currencyCode: CurrencyCode;
  grossMinor: AmountMinor;
  holdMinor: AmountMinor;
  netMinor: AmountMinor;
  holdBps: number;
  fundedAt: Date;
  releasedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerDisputeRecord = {
  id: string;
  contractId: string;
  initiatorUserId: string;
  clientId: string;
  freelancerId: string;
  partyAClaim: string;
  partyBRebuttal: string | null;
  roundStatus: FreelancerDisputeRoundStatus;
  employerRefundBps: number | null;
  rationale: string | null;
  arbitrationReady: boolean;
  reportJson: string | null;
  clientApprovedAt: Date | null;
  freelancerApprovedAt: Date | null;
  rejectedByUserId: string | null;
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerContractMessageRecord = {
  id: string;
  contractId: string;
  userId: string;
  clientId: string;
  freelancerId: string;
  kind: FreelancerContractMessageKind;
  body: string;
  artifactUrl: string | null;
  createdAt: Date;
};

export type FreelancerSquadRecord = {
  id: string;
  contractId: string;
  userId: string;
  clientId: string;
  kind: FreelancerSquadKind;
  status: FreelancerSquadStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FreelancerSquadMemberRecord = {
  id: string;
  squadId: string;
  userId: string;
  shareBps: number;
  createdAt: Date;
};

export type FreelancerPulse = {
  openJobsPosted: number;
  fundedAsClient: number;
  fundedAsFreelancer: number;
  releasedAsFreelancer: number;
  pendingEscrowMinor: AmountMinor;
  currencyCode: CurrencyCode;
};

export type FreelancerStore = {
  insertJob(job: FreelancerJobRecord): Promise<FreelancerJobRecord>;
  getJob(id: string): Promise<FreelancerJobRecord | null>;
  /** Açık tahta — yalnız PUBLIC + OPEN. DIRECT teklifler buraya düşmez. */
  listOpenJobs(): Promise<FreelancerJobRecord[]>;
  /** Davetli ustanın tezgâhındaki Özel İş Teklifleri (DIRECT + OPEN). */
  listDirectOffersForInvitee(inviteeId: string): Promise<FreelancerJobRecord[]>;
  listJobsByClient(clientId: string): Promise<FreelancerJobRecord[]>;
  updateJob(id: string, patch: Partial<Pick<FreelancerJobRecord, "status" | "updatedAt">>): Promise<FreelancerJobRecord>;
  insertBid(bid: FreelancerBidRecord): Promise<FreelancerBidRecord>;
  getBid(id: string): Promise<FreelancerBidRecord | null>;
  getBidByJobAndBidder(jobId: string, bidderId: string): Promise<FreelancerBidRecord | null>;
  listBidsForJob(jobId: string): Promise<FreelancerBidRecord[]>;
  updateBid(id: string, patch: Partial<Pick<FreelancerBidRecord, "status" | "updatedAt">>): Promise<FreelancerBidRecord>;
  rejectOtherBids(jobId: string, acceptedBidId: string, now: Date): Promise<void>;
  insertContract(contract: FreelancerContractRecord): Promise<FreelancerContractRecord>;
  getContract(id: string): Promise<FreelancerContractRecord | null>;
  getContractByJobId(jobId: string): Promise<FreelancerContractRecord | null>;
  getContractByEscrowHoldId(escrowHoldId: string): Promise<FreelancerContractRecord | null>;
  listContractsForUser(userId: string): Promise<FreelancerContractRecord[]>;
  updateContract(
    id: string,
    patch: Partial<
      Pick<FreelancerContractRecord, "status" | "releasedAt" | "refundedAt" | "updatedAt">
    >,
  ): Promise<FreelancerContractRecord>;
  insertDispute(dispute: FreelancerDisputeRecord): Promise<FreelancerDisputeRecord>;
  getDispute(id: string): Promise<FreelancerDisputeRecord | null>;
  getDisputeByContractId(contractId: string): Promise<FreelancerDisputeRecord | null>;
  updateDispute(
    id: string,
    patch: Partial<
      Pick<
        FreelancerDisputeRecord,
        | "partyBRebuttal"
        | "roundStatus"
        | "employerRefundBps"
        | "rationale"
        | "arbitrationReady"
        | "reportJson"
        | "clientApprovedAt"
        | "freelancerApprovedAt"
        | "rejectedByUserId"
        | "settledAt"
        | "updatedAt"
      >
    >,
  ): Promise<FreelancerDisputeRecord>;
  insertMessage(message: FreelancerContractMessageRecord): Promise<FreelancerContractMessageRecord>;
  listMessagesForContract(contractId: string): Promise<FreelancerContractMessageRecord[]>;
  /**
   * Teslim türevi — yalnız `kind=DELIVERY` için contractId → max(createdAt).
   * Gövde / artifactUrl / userId dönmez.
   */
  listLatestDeliveryAtByContractIds(contractIds: readonly string[]): Promise<Map<string, Date>>;
  insertSquad(squad: FreelancerSquadRecord): Promise<FreelancerSquadRecord>;
  getSquad(id: string): Promise<FreelancerSquadRecord | null>;
  getSquadByContractId(contractId: string): Promise<FreelancerSquadRecord | null>;
  updateSquad(
    id: string,
    patch: Partial<Pick<FreelancerSquadRecord, "status" | "updatedAt">>,
  ): Promise<FreelancerSquadRecord>;
  replaceSquadMembers(
    squadId: string,
    members: FreelancerSquadMemberRecord[],
  ): Promise<FreelancerSquadMemberRecord[]>;
  listSquadMembers(squadId: string): Promise<FreelancerSquadMemberRecord[]>;
  pulseForUser(userId: string): Promise<FreelancerPulse>;
  /**
   * OPEN → AWARDED şartlı. 1 satır = bu kabul kazandı; 0 = başka yazıcı veya ilan kapalı.
   * Prisma: `updateMany` aynı transaction'da satır kilidi tutar.
   */
  claimJobForAward(jobId: string, now: Date): Promise<boolean>;
  /**
   * FUNDED → RELEASED veya REFUNDED şartlı. 1 satır = bu settle kazandı.
   * Prisma: `updateMany` WHERE status = FUNDED.
   */
  claimFundedContract(
    id: string,
    patch: Partial<
      Pick<FreelancerContractRecord, "status" | "releasedAt" | "refundedAt" | "updatedAt">
    >,
  ): Promise<FreelancerContractRecord | null>;
  /**
   * Oturum userId `public.users` satırında mı. Yoksa ilan FK (P2003) 500 basmaz.
   * Bellek store her zaman true.
   */
  hasUser?(userId: string): Promise<boolean>;
};

export type FreelancerLlmInvoker = (
  input: InvokeLlmInput,
  deps?: InvokeLlmDeps,
) => Promise<LlmGatewayResult | null>;

/** Teklif kabul yazma birimi — PSP hold + EscrowHold kilit kaydı + sözleşme. Rail DEBIT yok. */
export type FreelancerAcceptWritePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  freelancer: FreelancerStore;
  marketplace?: MarketplaceSplitPort;
};

export type FreelancerAcceptResult = {
  /** Bu çağrı hold+sözleşme çiftini yeni yazdı. */
  applied: boolean;
  /** Hold vardı, sözleşme yoktu — çift aynı birimde tamamlandı (yetim onarım). */
  healed: boolean;
  contract: FreelancerContractRecord;
};

export type FreelancerEnginePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  freelancer: FreelancerStore;
  marketplace?: MarketplaceSplitPort;
  /**
   * EscrowHold kilit kaydı + FreelancerContract (+ ilan/teklif) tek atomik birim.
   * Üçüncü kişi işinde ledger DEBIT yoktur. Prisma: `$transaction`. Bellek: anlık görüntü + rollback.
   */
  runAcceptAtomic<T>(work: (tx: FreelancerAcceptWritePorts) => Promise<T>): Promise<T>;
  /**
   * CREDIT çözülüşü (release / refund) tek atomik birim — hold kilidi + defter + sözleşme CAS.
   * Prisma: `$transaction`. Bellek: kuyruk + anlık görüntü.
   */
  runReleaseAtomic<T>(work: (tx: FreelancerAcceptWritePorts) => Promise<T>): Promise<T>;
  usage?: AiTokenUsageStore;
  invokeLlm?: FreelancerLlmInvoker;
  llmDeps?: InvokeLlmDeps;
};
