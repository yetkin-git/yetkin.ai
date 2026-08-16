import "server-only";

import { createPrismaCareerPorts } from "@/lib/career/runtime";
import { syncCareerVisaStamps } from "@/lib/career/engine";
import { hasValidAcademyCareerVisa } from "@/lib/career/visa-gate";
import type { CareerPortfolioItemRecord, CareerVisaStampRecord } from "@/lib/career/types";
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

/** Teklif kapısı okuması — heal etmez; `/career` heal SSOT'tur. */
export async function loadHasAcademyCareerVisa(userId: string): Promise<boolean> {
  try {
    const ports = createPrismaCareerPorts();
    const stamps = await ports.career.listStampsForUser(userId);
    return hasValidAcademyCareerVisa(stamps);
  } catch {
    return false;
  }
}
