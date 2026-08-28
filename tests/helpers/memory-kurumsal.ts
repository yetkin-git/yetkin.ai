import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { KurumsalEnginePorts, KurumsalMoneyWritePorts } from "@/lib/kurumsal/engine";
import type {
  CorporateCompanyRecord,
  CorporateJobOfferRecord,
  CorporateJobPostingRecord,
  KurumsalPulse,
  KurumsalStore,
} from "@/lib/kurumsal/types";
import {
  createSerializedUnitOfWork,
  type MemoryEscrowStore,
  type MemoryLedgerStore,
} from "./memory-money";

type KurumsalMemoryState = {
  companies: Array<[string, CorporateCompanyRecord]>;
  postings: Array<[string, CorporateJobPostingRecord]>;
  offers: Array<[string, CorporateJobOfferRecord]>;
};

export type MemoryKurumsalStore = KurumsalStore & {
  failNextPostingInsert(): void;
  capture(): KurumsalMemoryState;
  restore(state: KurumsalMemoryState): void;
};

export function createMemoryKurumsalStore(): MemoryKurumsalStore {
  const companies = new Map<string, CorporateCompanyRecord>();
  const postings = new Map<string, CorporateJobPostingRecord>();
  const offers = new Map<string, CorporateJobOfferRecord>();
  let failPosting = false;

  return {
    failNextPostingInsert() {
      failPosting = true;
    },
    capture() {
      return {
        companies: [...companies.entries()].map(([key, value]) => [key, { ...value }]),
        postings: [...postings.entries()].map(([key, value]) => [key, { ...value }]),
        offers: [...offers.entries()].map(([key, value]) => [key, { ...value }]),
      };
    },
    restore(state) {
      companies.clear();
      postings.clear();
      offers.clear();
      for (const [key, value] of state.companies) {
        companies.set(key, { ...value });
      }
      for (const [key, value] of state.postings) {
        postings.set(key, { ...value });
      }
      for (const [key, value] of state.offers) {
        offers.set(key, { ...value });
      }
    },
    async insertCompany(company) {
      companies.set(company.id, company);
      return { ...company };
    },
    async getCompany(id) {
      const row = companies.get(id);
      return row ? { ...row } : null;
    },
    async getCompanyByUserId(userId) {
      const row = [...companies.values()].find((company) => company.userId === userId);
      return row ? { ...row } : null;
    },
    async updateCompany(id, patch) {
      const row = companies.get(id);
      if (!row) {
        throw new Error("Şirket yok.");
      }
      const next = { ...row, ...patch };
      companies.set(id, next);
      return { ...next };
    },
    async insertPosting(posting) {
      if (failPosting) {
        failPosting = false;
        throw new Error("İlan yazımı düştü.");
      }
      postings.set(posting.id, posting);
      return { ...posting };
    },
    async getPosting(id) {
      const row = postings.get(id);
      return row ? { ...row } : null;
    },
    async getPostingByEscrowHoldId(escrowHoldId) {
      const row = [...postings.values()].find((item) => item.escrowHoldId === escrowHoldId);
      return row ? { ...row } : null;
    },
    async listPostingsByOwner(userId) {
      return [...postings.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async listSealedPostings() {
      return [...postings.values()]
        .filter((row) => row.status === "SEALED")
        .map((row) => ({ ...row }));
    },
    async insertOffer(offer) {
      const dup = [...offers.values()].find(
        (row) => row.postingId === offer.postingId && row.bidderId === offer.bidderId,
      );
      if (dup) {
        const error = new Error("Unique constraint failed on the postingId_bidderId");
        Object.assign(error, { code: "P2002", meta: { target: "postingId_bidderId" } });
        throw error;
      }
      offers.set(offer.id, offer);
      return { ...offer };
    },
    async getOffer(id) {
      const row = offers.get(id);
      return row ? { ...row } : null;
    },
    async getOfferByPostingAndBidder(postingId, bidderId) {
      const row = [...offers.values()].find(
        (item) => item.postingId === postingId && item.bidderId === bidderId,
      );
      return row ? { ...row } : null;
    },
    async listOffersForPosting(postingId) {
      return [...offers.values()]
        .filter((row) => row.postingId === postingId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async updateOffer(id, patch) {
      const row = offers.get(id);
      if (!row) {
        throw new Error("Teklif yok.");
      }
      const next = { ...row, ...patch };
      offers.set(id, next);
      return { ...next };
    },
    async updatePosting(id, patch) {
      const row = postings.get(id);
      if (!row) {
        throw new Error("İlan yok.");
      }
      const next = { ...row, ...patch };
      postings.set(id, next);
      return { ...next };
    },
    async pulseForUser(userId) {
      const own = [...postings.values()].filter((row) => row.userId === userId);
      const pendingEscrowMinor = own
        .filter((row) => row.status === "SEALED" || row.status === "AWARDED")
        .reduce((sum, row) => sum + row.grossMinor, 0);
      const pulse: KurumsalPulse = {
        companiesOwned: [...companies.values()].filter(
          (company) => company.userId === userId && company.status === "ACTIVE",
        ).length,
        sealedPostings: own.filter((row) => row.status === "SEALED").length,
        awardedPostings: own.filter((row) => row.status === "AWARDED").length,
        releasedPostings: own.filter((row) => row.status === "RELEASED").length,
        pendingEscrowMinor: toAmountMinor(pendingEscrowMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function withMemoryKurumsalAtomic<
  T extends {
    ledger: MemoryLedgerStore;
    escrow: MemoryEscrowStore;
    kurumsal: MemoryKurumsalStore;
  },
>(ports: T): T & Pick<KurumsalEnginePorts, "runMoneyAtomic"> {
  const uow = createSerializedUnitOfWork();
  return {
    ...ports,
    async runMoneyAtomic<R>(work: (tx: KurumsalMoneyWritePorts) => Promise<R>): Promise<R> {
      return uow.run([ports.ledger, ports.escrow, ports.kurumsal], () =>
        work({
          ledger: ports.ledger,
          escrow: ports.escrow,
          kurumsal: ports.kurumsal,
        }),
      );
    },
  };
}
