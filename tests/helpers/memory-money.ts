import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import type {
  AppendLedgerCommand,
  LedgerEntryRecord,
  LedgerStore,
  WalletSnapshot,
} from "@/lib/kernel/ledger/types";
import type { EscrowHoldRecord, EscrowStore } from "@/lib/kernel/escrow/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  FreelancerAcceptWritePorts,
  FreelancerBidRecord,
  FreelancerContractMessageRecord,
  FreelancerContractRecord,
  FreelancerDisputeRecord,
  FreelancerEnginePorts,
  FreelancerJobRecord,
  FreelancerPulse,
  FreelancerSquadMemberRecord,
  FreelancerSquadRecord,
  FreelancerStore,
} from "@/lib/freelancer/types";

export type MemoryWalletSeed = {
  userId: string;
  amountMinor: number;
  currencyCode?: CurrencyCode;
};

function uniqueViolation(target: string): Error {
  const error = new Error(`Unique constraint failed on the ${target}`);
  Object.assign(error, { code: "P2002", meta: { target } });
  return error;
}

type LedgerMemoryState = {
  wallets: Array<[string, WalletSnapshot]>;
  entries: Array<[string, LedgerEntryRecord]>;
};

export type MemoryLedgerStore = LedgerStore & {
  snapshot(userId: string, currencyCode?: CurrencyCode): WalletSnapshot;
  capture(): LedgerMemoryState;
  restore(state: LedgerMemoryState): void;
};

export function createMemoryLedgerStore(seeds: MemoryWalletSeed[]): MemoryLedgerStore {
  const wallets = new Map<string, WalletSnapshot>();
  const entries = new Map<string, LedgerEntryRecord>();

  for (const seed of seeds) {
    const currencyCode = seed.currencyCode ?? SETTLEMENT_CURRENCY;
    const key = `${seed.userId}:${currencyCode}`;
    wallets.set(key, {
      id: `wallet-${key}`,
      userId: seed.userId,
      currencyCode,
      amountMinor: toAmountMinor(seed.amountMinor),
    });
  }

  return {
    snapshot(userId, currencyCode = SETTLEMENT_CURRENCY) {
      const wallet = wallets.get(`${userId}:${currencyCode}`);
      if (!wallet) {
        throw new Error("Cüzdan yok.");
      }
      return { ...wallet };
    },
    capture() {
      return {
        wallets: [...wallets.entries()].map(([key, value]) => [key, { ...value }]),
        entries: [...entries.entries()].map(([key, value]) => [key, { ...value }]),
      };
    },
    restore(state) {
      wallets.clear();
      entries.clear();
      for (const [key, value] of state.wallets) {
        wallets.set(key, { ...value });
      }
      for (const [key, value] of state.entries) {
        entries.set(key, { ...value });
      }
    },
    async lockWallet(userId, currencyCode) {
      const wallet = wallets.get(`${userId}:${currencyCode}`);
      if (!wallet) {
        throw new Error("Cüzdan kilitlenemedi.");
      }
      return { ...wallet };
    },
    async findByIdempotencyKey(key) {
      return entries.get(key) ?? null;
    },
    async insertEntry(_wallet, command: AppendLedgerCommand, nextBalance: AmountMinor) {
      if (entries.has(command.idempotencyKey)) {
        throw uniqueViolation("idempotencyKey");
      }
      const key = `${command.userId}:${command.currencyCode}`;
      const wallet = wallets.get(key);
      if (!wallet) {
        throw new Error("Cüzdan yok.");
      }
      entries.set(command.idempotencyKey, {
        id: command.idempotencyKey,
        walletId: wallet.id,
        userId: command.userId,
        amountMinor: command.amountMinor,
        currencyCode: command.currencyCode,
        direction: command.direction,
        label: command.label,
        purpose: command.purpose,
        idempotencyKey: command.idempotencyKey,
        createdAt: new Date(),
      });
      wallets.set(key, { ...wallet, amountMinor: nextBalance });
    },
  };
}

type EscrowMemoryState = {
  byId: Array<[string, EscrowHoldRecord]>;
  byRef: Array<[string, string]>;
};

export type MemoryEscrowStore = EscrowStore & {
  failNextHoldInsert(): void;
  skipNextReferenceLookup(): void;
  capture(): EscrowMemoryState;
  restore(state: EscrowMemoryState): void;
};

export function createMemoryEscrowStore(): MemoryEscrowStore {
  const byId = new Map<string, EscrowHoldRecord>();
  const byRef = new Map<string, string>();
  let failHold = false;
  let skipLookup = false;

  return {
    failNextHoldInsert() {
      failHold = true;
    },
    skipNextReferenceLookup() {
      skipLookup = true;
    },
    capture() {
      return {
        byId: [...byId.entries()].map(([key, value]) => [key, { ...value }]),
        byRef: [...byRef.entries()],
      };
    },
    restore(state) {
      byId.clear();
      byRef.clear();
      for (const [key, value] of state.byId) {
        byId.set(key, { ...value });
      }
      for (const [key, value] of state.byRef) {
        byRef.set(key, value);
      }
    },
    async findByReferenceKey(referenceKey) {
      if (skipLookup) {
        skipLookup = false;
        return null;
      }
      const id = byRef.get(referenceKey);
      return id ? (byId.get(id) ?? null) : null;
    },
    async lockByReferenceKey(referenceKey) {
      const id = byRef.get(referenceKey);
      return id ? (byId.get(id) ?? null) : null;
    },
    async findById(id) {
      return byId.get(id) ?? null;
    },
    async insertHold(input) {
      if (failHold) {
        failHold = false;
        throw new Error("Emanet hold yazımı düştü.");
      }
      if (byRef.has(input.referenceKey)) {
        throw uniqueViolation("referenceKey");
      }
      if (byId.has(input.id)) {
        throw uniqueViolation("id");
      }
      const record: EscrowHoldRecord = {
        ...input,
        status: "PENDING",
        createdAt: new Date(),
        releasedAt: null,
        refundedAt: null,
      };
      byId.set(record.id, record);
      byRef.set(record.referenceKey, record.id);
      return { ...record };
    },
    async markReleased(id, at) {
      const hold = byId.get(id);
      if (!hold) {
        throw new Error("Emanet yok.");
      }
      if (hold.status !== "PENDING") {
        throw new Error("Emanet PENDING değilken serbest bırakılamaz.");
      }
      const next: EscrowHoldRecord = { ...hold, status: "RELEASED", releasedAt: at };
      byId.set(id, next);
      return { ...next };
    },
    async markRefunded(id, at) {
      const hold = byId.get(id);
      if (!hold) {
        throw new Error("Emanet yok.");
      }
      if (hold.status !== "PENDING") {
        throw new Error("Emanet PENDING değilken iade edilemez.");
      }
      const next: EscrowHoldRecord = { ...hold, status: "REFUNDED", refundedAt: at };
      byId.set(id, next);
      return { ...next };
    },
    async freezeExpiry(id) {
      const hold = byId.get(id);
      if (!hold) {
        throw new Error("Emanet yok.");
      }
      const next: EscrowHoldRecord = { ...hold, expiresAt: null };
      byId.set(id, next);
      return { ...next };
    },
    async listExpiredPending(now) {
      return [...byId.values()].filter(
        (hold) => hold.status === "PENDING" && hold.expiresAt !== null && hold.expiresAt.getTime() <= now.getTime(),
      );
    },
    async listPendingExpiringSoon(now, until) {
      return [...byId.values()].filter((hold) => {
        if (hold.status !== "PENDING" || hold.expiresAt === null) {
          return false;
        }
        const at = hold.expiresAt.getTime();
        return at > now.getTime() && at <= until.getTime();
      });
    },
  };
}

type FreelancerMemoryState = {
  jobs: Array<[string, FreelancerJobRecord]>;
  bids: Array<[string, FreelancerBidRecord]>;
  contracts: Array<[string, FreelancerContractRecord]>;
  disputes: Array<[string, FreelancerDisputeRecord]>;
  messages: Array<[string, FreelancerContractMessageRecord]>;
  squads: Array<[string, FreelancerSquadRecord]>;
  squadMembers: Array<[string, FreelancerSquadMemberRecord[]]>;
};

export type MemoryFreelancerStore = FreelancerStore & {
  failNextContractInsert(): void;
  skipNextContractLookup(): void;
  skipNextJobClaim(): void;
  capture(): FreelancerMemoryState;
  restore(state: FreelancerMemoryState): void;
};

export function createMemoryFreelancerStore(): MemoryFreelancerStore {
  const jobs = new Map<string, FreelancerJobRecord>();
  const bids = new Map<string, FreelancerBidRecord>();
  const contracts = new Map<string, FreelancerContractRecord>();
  const disputes = new Map<string, FreelancerDisputeRecord>();
  const messages = new Map<string, FreelancerContractMessageRecord>();
  const squads = new Map<string, FreelancerSquadRecord>();
  const squadMembers = new Map<string, FreelancerSquadMemberRecord[]>();
  let failContract = false;
  let skipContractLookups = 0;
  let skipJobClaim = false;

  return {
    failNextContractInsert() {
      failContract = true;
    },
    skipNextContractLookup() {
      skipContractLookups += 1;
    },
    skipNextJobClaim() {
      skipJobClaim = true;
    },
    capture() {
      return {
        jobs: [...jobs.entries()].map(([key, value]) => [key, { ...value }]),
        bids: [...bids.entries()].map(([key, value]) => [key, { ...value }]),
        contracts: [...contracts.entries()].map(([key, value]) => [key, { ...value }]),
        disputes: [...disputes.entries()].map(([key, value]) => [key, { ...value }]),
        messages: [...messages.entries()].map(([key, value]) => [key, { ...value }]),
        squads: [...squads.entries()].map(([key, value]) => [key, { ...value }]),
        squadMembers: [...squadMembers.entries()].map(([key, value]) => [
          key,
          value.map((member) => ({ ...member })),
        ]),
      };
    },
    restore(state) {
      jobs.clear();
      bids.clear();
      contracts.clear();
      disputes.clear();
      messages.clear();
      squads.clear();
      squadMembers.clear();
      for (const [key, value] of state.jobs) {
        jobs.set(key, { ...value });
      }
      for (const [key, value] of state.bids) {
        bids.set(key, { ...value });
      }
      for (const [key, value] of state.contracts) {
        contracts.set(key, { ...value });
      }
      for (const [key, value] of state.disputes) {
        disputes.set(key, { ...value });
      }
      for (const [key, value] of state.messages) {
        messages.set(key, { ...value });
      }
      for (const [key, value] of state.squads) {
        squads.set(key, { ...value });
      }
      for (const [key, value] of state.squadMembers) {
        squadMembers.set(
          key,
          value.map((member) => ({ ...member })),
        );
      }
    },
    async insertJob(job) {
      jobs.set(job.id, job);
      return { ...job };
    },
    async getJob(id) {
      const job = jobs.get(id);
      return job ? { ...job } : null;
    },
    async listOpenJobs() {
      return [...jobs.values()]
        .filter((job) => job.status === "OPEN")
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((job) => ({ ...job }));
    },
    async listJobsByClient(clientId) {
      return [...jobs.values()].filter((job) => job.clientId === clientId).map((job) => ({ ...job }));
    },
    async updateJob(id, patch) {
      const job = jobs.get(id);
      if (!job) {
        throw new Error("İlan yok.");
      }
      const next = { ...job, ...patch };
      jobs.set(id, next);
      return { ...next };
    },
    async claimJobForAward(jobId, now) {
      if (skipJobClaim) {
        skipJobClaim = false;
        const job = jobs.get(jobId);
        if (job && job.status === "OPEN") {
          jobs.set(jobId, { ...job, status: "AWARDED", updatedAt: now });
        }
        return true;
      }
      const job = jobs.get(jobId);
      if (!job || job.status !== "OPEN") {
        return false;
      }
      jobs.set(jobId, { ...job, status: "AWARDED", updatedAt: now });
      return true;
    },
    async claimFundedContract(id, patch) {
      const contract = contracts.get(id);
      if (!contract || contract.status !== "FUNDED") {
        return null;
      }
      const next = { ...contract, ...patch };
      contracts.set(id, next);
      return { ...next };
    },
    async insertBid(bid) {
      bids.set(bid.id, bid);
      return { ...bid };
    },
    async getBid(id) {
      const bid = bids.get(id);
      return bid ? { ...bid } : null;
    },
    async getBidByJobAndBidder(jobId, bidderId) {
      const found = [...bids.values()].find((bid) => bid.jobId === jobId && bid.bidderId === bidderId);
      return found ? { ...found } : null;
    },
    async listBidsForJob(jobId) {
      return [...bids.values()].filter((bid) => bid.jobId === jobId).map((bid) => ({ ...bid }));
    },
    async updateBid(id, patch) {
      const bid = bids.get(id);
      if (!bid) {
        throw new Error("Teklif yok.");
      }
      const next = { ...bid, ...patch };
      bids.set(id, next);
      return { ...next };
    },
    async rejectOtherBids(jobId, acceptedBidId, now) {
      for (const bid of bids.values()) {
        if (bid.jobId === jobId && bid.id !== acceptedBidId && bid.status === "SUBMITTED") {
          bids.set(bid.id, { ...bid, status: "REJECTED", updatedAt: now });
        }
      }
    },
    async insertContract(contract) {
      if (failContract) {
        failContract = false;
        throw new Error("Sözleşme yazımı düştü.");
      }
      if (contracts.has(contract.id)) {
        throw uniqueViolation("id");
      }
      const rows = [...contracts.values()];
      if (rows.some((row) => row.jobId === contract.jobId)) {
        throw uniqueViolation("jobId");
      }
      if (rows.some((row) => row.bidId === contract.bidId)) {
        throw uniqueViolation("bidId");
      }
      if (rows.some((row) => row.escrowHoldId === contract.escrowHoldId)) {
        throw uniqueViolation("escrowHoldId");
      }
      contracts.set(contract.id, contract);
      return { ...contract };
    },
    async getContract(id) {
      const contract = contracts.get(id);
      return contract ? { ...contract } : null;
    },
    async getContractByJobId(jobId) {
      if (skipContractLookups > 0) {
        skipContractLookups -= 1;
        return null;
      }
      const found = [...contracts.values()].find((row) => row.jobId === jobId);
      return found ? { ...found } : null;
    },
    async getContractByEscrowHoldId(escrowHoldId) {
      const found = [...contracts.values()].find((row) => row.escrowHoldId === escrowHoldId);
      return found ? { ...found } : null;
    },
    async listContractsForUser(userId) {
      return [...contracts.values()]
        .filter((row) => row.clientId === userId || row.freelancerId === userId)
        .map((row) => ({ ...row }));
    },
    async updateContract(id, patch) {
      const contract = contracts.get(id);
      if (!contract) {
        throw new Error("Sözleşme yok.");
      }
      const next = { ...contract, ...patch };
      contracts.set(id, next);
      return { ...next };
    },
    async insertDispute(dispute) {
      disputes.set(dispute.id, dispute);
      return { ...dispute };
    },
    async getDispute(id) {
      const row = disputes.get(id);
      return row ? { ...row } : null;
    },
    async getDisputeByContractId(contractId) {
      const found = [...disputes.values()].find((row) => row.contractId === contractId);
      return found ? { ...found } : null;
    },
    async updateDispute(id, patch) {
      const row = disputes.get(id);
      if (!row) {
        throw new Error("Anlaşmazlık yok.");
      }
      const next = { ...row, ...patch };
      disputes.set(id, next);
      return { ...next };
    },
    async insertMessage(message) {
      messages.set(message.id, message);
      return { ...message };
    },
    async listMessagesForContract(contractId) {
      return [...messages.values()]
        .filter((row) => row.contractId === contractId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async listLatestDeliveryAtByContractIds(contractIds) {
      const wanted = new Set(contractIds);
      const latest = new Map<string, Date>();
      for (const row of messages.values()) {
        if (!wanted.has(row.contractId) || row.kind !== "DELIVERY") {
          continue;
        }
        const prev = latest.get(row.contractId);
        if (!prev || row.createdAt.getTime() > prev.getTime()) {
          latest.set(row.contractId, row.createdAt);
        }
      }
      return latest;
    },
    async insertSquad(squad) {
      squads.set(squad.id, squad);
      return { ...squad };
    },
    async getSquad(id) {
      const row = squads.get(id);
      return row ? { ...row } : null;
    },
    async getSquadByContractId(contractId) {
      const found = [...squads.values()].find((row) => row.contractId === contractId);
      return found ? { ...found } : null;
    },
    async updateSquad(id, patch) {
      const row = squads.get(id);
      if (!row) {
        throw new Error("Takım yok.");
      }
      const next = { ...row, ...patch };
      squads.set(id, next);
      return { ...next };
    },
    async replaceSquadMembers(squadId, members) {
      squadMembers.set(
        squadId,
        members.map((member) => ({ ...member })),
      );
      return members.map((member) => ({ ...member }));
    },
    async listSquadMembers(squadId) {
      return (squadMembers.get(squadId) ?? []).map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const ownJobs = [...jobs.values()].filter((job) => job.clientId === userId);
      const ownContracts = [...contracts.values()].filter(
        (row) => row.clientId === userId || row.freelancerId === userId,
      );
      const pendingEscrowMinor = ownContracts
        .filter((row) => row.clientId === userId && row.status === "FUNDED")
        .reduce((sum, row) => sum + row.grossMinor, 0);
      const pulse: FreelancerPulse = {
        openJobsPosted: ownJobs.filter((job) => job.status === "OPEN").length,
        fundedAsClient: ownContracts.filter((row) => row.clientId === userId && row.status === "FUNDED").length,
        fundedAsFreelancer: ownContracts.filter(
          (row) => row.freelancerId === userId && row.status === "FUNDED",
        ).length,
        releasedAsFreelancer: ownContracts.filter(
          (row) => row.freelancerId === userId && row.status === "RELEASED",
        ).length,
        pendingEscrowMinor: toAmountMinor(pendingEscrowMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function withMemoryAcceptAtomic<
  T extends {
    ledger: MemoryLedgerStore;
    escrow: MemoryEscrowStore;
    freelancer: MemoryFreelancerStore;
  },
>(ports: T): T & Pick<FreelancerEnginePorts, "runAcceptAtomic" | "runReleaseAtomic"> & {
  runEscrowAtomic<R>(
    work: (tx: { ledger: MemoryLedgerStore; escrow: MemoryEscrowStore }) => Promise<R>,
  ): Promise<R>;
} {
  let tail = Promise.resolve();
  function enqueue<R>(work: () => Promise<R>): Promise<R> {
    const run = tail.then(work, work);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function runMoneyAtomic<R>(
    work: (tx: FreelancerAcceptWritePorts) => Promise<R>,
  ): Promise<R> {
    return enqueue(async () => {
      const ledgerSnap = ports.ledger.capture();
      const escrowSnap = ports.escrow.capture();
      const freelancerSnap = ports.freelancer.capture();
      try {
        return await work({
          ledger: ports.ledger,
          escrow: ports.escrow,
          freelancer: ports.freelancer,
        });
      } catch (error) {
        ports.ledger.restore(ledgerSnap);
        ports.escrow.restore(escrowSnap);
        ports.freelancer.restore(freelancerSnap);
        throw error;
      }
    });
  }

  return {
    ...ports,
    runAcceptAtomic: runMoneyAtomic,
    runReleaseAtomic: runMoneyAtomic,
    async runEscrowAtomic<R>(
      work: (tx: { ledger: MemoryLedgerStore; escrow: MemoryEscrowStore }) => Promise<R>,
    ): Promise<R> {
      return enqueue(async () => {
        const ledgerSnap = ports.ledger.capture();
        const escrowSnap = ports.escrow.capture();
        try {
          return await work({
            ledger: ports.ledger,
            escrow: ports.escrow,
          });
        } catch (error) {
          ports.ledger.restore(ledgerSnap);
          ports.escrow.restore(escrowSnap);
          throw error;
        }
      });
    },
  };
}
