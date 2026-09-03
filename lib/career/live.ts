import type { CareerEnginePorts } from "@/lib/career/engine";
import type {
  CareerPortfolioItemRecord,
  CareerPulse,
} from "@/lib/career/types";
import {
  bindLivePassportStamps,
  type LivePassportStamp,
} from "@/lib/kernel/passport/live";

export type LiveCareerStamp = LivePassportStamp;

export type LiveCareerBoard = {
  stamps: LiveCareerStamp[];
  portfolio: CareerPortfolioItemRecord[];
};

/**
 * Vize defteri / nabız / Dron teli — yalnız canlı mühür.
 * Heal (sync) bu fonksiyonun işi değildir; çağıran yetkilendirilmiş okuma basar.
 */
export async function projectLiveCareerBoard(
  ports: CareerEnginePorts,
  userId: string,
): Promise<LiveCareerBoard> {
  const [stamps, portfolio] = await Promise.all([
    ports.career.listStampsForUser(userId),
    ports.career.listPortfolioForUser(userId),
  ]);
  if (stamps.length === 0) {
    return {
      stamps: [],
      portfolio: [],
    };
  }
  const sealed = await ports.proofs.listSealedProofs(userId);
  const live = bindLivePassportStamps(stamps, sealed, userId);
  const liveIds = new Set(live.map((stamp) => stamp.id));
  return {
    stamps: live,
    portfolio: portfolio.filter((item) => liveIds.has(item.visaStampId)),
  };
}

export function careerPulseFromLiveBoard(board: LiveCareerBoard): CareerPulse {
  return {
    visaCount: board.stamps.length,
    portfolioCount: board.portfolio.length,
    lastVisaTitle: board.stamps[0]?.title ?? null,
  };
}

