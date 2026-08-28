import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { parseCurrencyCode, SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type {
  CorporateCompanyRecord,
  CorporateJobOfferRecord,
  CorporateJobPostingRecord,
  KurumsalPulse,
  KurumsalStore,
} from "@/lib/kurumsal/types";

function toCompany(row: {
  id: string;
  userId: string;
  legalName: string;
  tradeName: string | null;
  jurisdiction: string;
  taxId: string | null;
  status: CorporateCompanyRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): CorporateCompanyRecord {
  return { ...row };
}

function toPosting(row: {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  brief: string;
  budgetMinor: number;
  currencyCode: string;
  workbenchKind: CorporateJobPostingRecord["workbenchKind"];
  escrowHoldId: string;
  status: CorporateJobPostingRecord["status"];
  awardedUserId: string | null;
  awardedDevLabsProjectId: string | null;
  holdBps: number;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  sealedAt: Date;
  awardedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CorporateJobPostingRecord {
  return {
    ...row,
    budgetMinor: toAmountMinor(row.budgetMinor),
    currencyCode: parseCurrencyCode(row.currencyCode),
    grossMinor: toAmountMinor(row.grossMinor),
    holdMinor: toAmountMinor(row.holdMinor),
    netMinor: toAmountMinor(row.netMinor),
  };
}

function toOffer(row: {
  id: string;
  postingId: string;
  bidderId: string;
  coverNote: string;
  status: CorporateJobOfferRecord["status"];
  createdAt: Date;
  updatedAt: Date;
}): CorporateJobOfferRecord {
  return { ...row };
}

export type KurumsalWriteDb = Pick<
  PrismaClient,
  "corporateCompany" | "corporateJobPosting" | "corporateJobOffer"
>;

export function bindKurumsalStore(db: KurumsalWriteDb): KurumsalStore {
  return {
    async insertCompany(company) {
      const row = await db.corporateCompany.create({
        data: {
          id: company.id,
          userId: company.userId,
          legalName: company.legalName,
          tradeName: company.tradeName,
          jurisdiction: company.jurisdiction,
          taxId: company.taxId,
          status: company.status,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        },
      });
      return toCompany(row);
    },
    async getCompany(id) {
      const row = await db.corporateCompany.findUnique({ where: { id } });
      return row ? toCompany(row) : null;
    },
    async getCompanyByUserId(userId) {
      const row = await db.corporateCompany.findUnique({ where: { userId } });
      return row ? toCompany(row) : null;
    },
    async updateCompany(id, patch) {
      const row = await db.corporateCompany.update({ where: { id }, data: patch });
      return toCompany(row);
    },
    async insertPosting(posting) {
      const row = await db.corporateJobPosting.create({
        data: {
          id: posting.id,
          companyId: posting.companyId,
          userId: posting.userId,
          title: posting.title,
          brief: posting.brief,
          budgetMinor: posting.budgetMinor,
          currencyCode: posting.currencyCode,
          workbenchKind: posting.workbenchKind,
          escrowHoldId: posting.escrowHoldId,
          status: posting.status,
          awardedUserId: posting.awardedUserId,
          awardedDevLabsProjectId: posting.awardedDevLabsProjectId,
          holdBps: posting.holdBps,
          grossMinor: posting.grossMinor,
          holdMinor: posting.holdMinor,
          netMinor: posting.netMinor,
          sealedAt: posting.sealedAt,
          awardedAt: posting.awardedAt,
          releasedAt: posting.releasedAt,
          refundedAt: posting.refundedAt,
          createdAt: posting.createdAt,
          updatedAt: posting.updatedAt,
        },
      });
      return toPosting(row);
    },
    async getPosting(id) {
      const row = await db.corporateJobPosting.findUnique({ where: { id } });
      return row ? toPosting(row) : null;
    },
    async getPostingByEscrowHoldId(escrowHoldId) {
      const row = await db.corporateJobPosting.findUnique({ where: { escrowHoldId } });
      return row ? toPosting(row) : null;
    },
    async listPostingsByOwner(userId) {
      const rows = await db.corporateJobPosting.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toPosting);
    },
    async listSealedPostings() {
      const rows = await db.corporateJobPosting.findMany({
        where: { status: "SEALED" },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toPosting);
    },
    async insertOffer(offer) {
      const row = await db.corporateJobOffer.create({
        data: {
          id: offer.id,
          postingId: offer.postingId,
          bidderId: offer.bidderId,
          coverNote: offer.coverNote,
          status: offer.status,
          createdAt: offer.createdAt,
          updatedAt: offer.updatedAt,
        },
      });
      return toOffer(row);
    },
    async getOffer(id) {
      const row = await db.corporateJobOffer.findUnique({ where: { id } });
      return row ? toOffer(row) : null;
    },
    async getOfferByPostingAndBidder(postingId, bidderId) {
      const row = await db.corporateJobOffer.findUnique({
        where: { postingId_bidderId: { postingId, bidderId } },
      });
      return row ? toOffer(row) : null;
    },
    async listOffersForPosting(postingId) {
      const rows = await db.corporateJobOffer.findMany({
        where: { postingId },
        orderBy: { createdAt: "asc" },
      });
      return rows.map(toOffer);
    },
    async updateOffer(id, patch) {
      const row = await db.corporateJobOffer.update({ where: { id }, data: patch });
      return toOffer(row);
    },
    async updatePosting(id, patch) {
      const row = await db.corporateJobPosting.update({ where: { id }, data: patch });
      return toPosting(row);
    },
    async pulseForUser(userId) {
      const [companiesOwned, sealedPostings, awardedPostings, releasedPostings, sealedRows] =
        await Promise.all([
          db.corporateCompany.count({ where: { userId, status: "ACTIVE" } }),
          db.corporateJobPosting.count({ where: { userId, status: "SEALED" } }),
          db.corporateJobPosting.count({ where: { userId, status: "AWARDED" } }),
          db.corporateJobPosting.count({ where: { userId, status: "RELEASED" } }),
          db.corporateJobPosting.findMany({
            where: { userId, status: { in: ["SEALED", "AWARDED"] } },
            select: { grossMinor: true },
          }),
        ]);
      const pendingEscrowMinor = sealedRows.reduce((sum, row) => sum + row.grossMinor, 0);
      const pulse: KurumsalPulse = {
        companiesOwned,
        sealedPostings,
        awardedPostings,
        releasedPostings,
        pendingEscrowMinor: toAmountMinor(pendingEscrowMinor),
        currencyCode: SETTLEMENT_CURRENCY,
      };
      return pulse;
    },
  };
}

export function createPrismaKurumsalStore(): KurumsalStore {
  return bindKurumsalStore(getPrisma());
}
