import "server-only";

import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import {
  inspectAcademyCareerVisaForListing,
  LISTING_ACCESS_VISA_DENIED,
  type ListingVisaGateCode,
} from "@/lib/career/visa-gate";
import type { CareerPortfolioItemRecord, CareerVisaStampRecord } from "@/lib/career/types";
import type { ListingVisaSubject } from "@/lib/career/listing-visa-scope";
import { findPassportStampsForUser } from "@/lib/kernel/passport/load";

export async function loadCareerBoard(userId: string): Promise<{
  stamps: CareerVisaStampRecord[];
  portfolio: CareerPortfolioItemRecord[];
} | null> {
  try {
    const ports = createPrismaCareerPorts();
    /** Yetkilendirilmiş ilk okuma: eksik vize / yarım portföy / hash bağı sessizce onarılır. */
    await syncCareerVisaStamps(ports, { userId });
    const [stamps, portfolio] = await Promise.all([
      findPassportStampsForUser(userId),
      ports.career.listPortfolioForUser(userId),
    ]);
    return { stamps, portfolio };
  } catch {
    return null;
  }
}

export type ListingVisaAccess = {
  allowed: boolean;
  code: ListingVisaGateCode;
  message: string;
};

/**
 * Teklif kapısı okuması — heal etmez; `/career` heal SSOT'tur.
 * HTTP `assertAcademyCareerVisaForListing` ile aynı kararı üretir (canlı kanıt + dikey kapsam).
 */
export async function loadListingVisaAccess(
  userId: string,
  listing: ListingVisaSubject,
): Promise<ListingVisaAccess> {
  try {
    const ports = createPrismaCareerPorts();
    const decision = await inspectAcademyCareerVisaForListing(
      ports.career,
      userId,
      listing,
      ports.proofs,
    );
    if (decision.ok) {
      return { allowed: true, code: "ok", message: "" };
    }
    return { allowed: false, code: decision.code, message: decision.message };
  } catch {
    return { allowed: false, code: "denied", message: LISTING_ACCESS_VISA_DENIED };
  }
}
