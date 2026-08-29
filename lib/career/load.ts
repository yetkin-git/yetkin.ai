import "server-only";

import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import {
  careerPulseFromLiveBoard,
  projectLiveCareerBoard,
  type LiveCareerBoard,
} from "@/lib/career/live";
import {
  inspectAcademyCareerVisaForListing,
  LISTING_ACCESS_VISA_DENIED,
  type ListingVisaGateCode,
} from "@/lib/career/visa-gate";
import type { CareerPulse } from "@/lib/career/types";
import type { ListingVisaSubject } from "@/lib/career/listing-visa-scope";

export async function loadCareerBoard(userId: string): Promise<LiveCareerBoard | null> {
  try {
    const ports = createPrismaCareerPorts();
    /** Yetkilendirilmiş ilk okuma: eksik vize / yarım portföy / hash bağı sessizce onarılır. */
    await syncCareerVisaStamps(ports, { userId });
    return await projectLiveCareerBoard(ports, userId);
  } catch {
    return null;
  }
}

/** Nabız / kokpit — heal yazmaz; yalnız canlı mühür sayar. */
export async function loadCareerLivePulse(userId: string): Promise<(CareerPulse & { live: true }) | null> {
  try {
    const ports = createPrismaCareerPorts();
    const board = await projectLiveCareerBoard(ports, userId);
    return { ...careerPulseFromLiveBoard(board), live: true };
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
