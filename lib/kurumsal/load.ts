import "server-only";

import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";
import type { CorporateCompanyRecord, CorporateJobOfferRecord, CorporateJobPostingRecord } from "@/lib/kurumsal/types";

export async function loadOwnerCompany(userId: string): Promise<CorporateCompanyRecord | null> {
  try {
    const ports = createPrismaKurumsalPorts();
    return await ports.kurumsal.getCompanyByUserId(userId);
  } catch {
    return null;
  }
}

export async function loadOwnerPostings(userId: string): Promise<CorporateJobPostingRecord[] | null> {
  try {
    const ports = createPrismaKurumsalPorts();
    return await ports.kurumsal.listPostingsByOwner(userId);
  } catch {
    return null;
  }
}

export async function loadJobPostingBoard(postingId: string): Promise<{
  posting: CorporateJobPostingRecord;
  company: CorporateCompanyRecord | null;
  offers: CorporateJobOfferRecord[];
} | null> {
  try {
    const ports = createPrismaKurumsalPorts();
    const posting = await ports.kurumsal.getPosting(postingId);
    if (!posting) {
      return null;
    }
    const [company, offers] = await Promise.all([
      ports.kurumsal.getCompany(posting.companyId),
      ports.kurumsal.listOffersForPosting(posting.id),
    ]);
    return { posting, company, offers };
  } catch {
    return null;
  }
}

export async function loadSealedPostings(): Promise<CorporateJobPostingRecord[] | null> {
  try {
    const ports = createPrismaKurumsalPorts();
    return await ports.kurumsal.listSealedPostings();
  } catch {
    return null;
  }
}
