import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { findPassportStampsForUser } from "@/lib/kernel/passport/load";
import { projectLivePassportStamps } from "@/lib/kernel/passport/live";
import { createPrismaProofReadPort } from "@/lib/kernel/proof/prisma-read";
import {
  parsePublicTalentId,
  toPublicTalentCard,
  type PublicTalentResolution,
} from "@/lib/career/public-talent";

/**
 * Kamuya açık yetkinlik kartı. Oturum yok.
 * Damga canlı değilse (iptal / düşmüş mühür) missing — varlık sızdırılmaz.
 */
export async function loadPublicTalentCard(rawId: string): Promise<PublicTalentResolution | null> {
  const id = parsePublicTalentId(rawId);
  if (!id) {
    return { status: "invalid-format" };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return null;
  }

  try {
    const prisma = getPrisma();
    const featured = await prisma.careerVisaStamp.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        sourceKind: true,
        sourceId: true,
        visaKey: true,
        moduleId: true,
        title: true,
        certificateHash: true,
        issuedAt: true,
        createdAt: true,
      },
    });
    if (!featured) {
      return { status: "missing" };
    }

    const stamps = await findPassportStampsForUser(featured.userId);
    const live = await projectLivePassportStamps(stamps, createPrismaProofReadPort(), featured.userId);
    const featuredLive = live.find((stamp) => stamp.id === id);
    if (!featuredLive) {
      return { status: "missing" };
    }

    const liveIds = live.map((stamp) => stamp.id);
    const portfolio =
      liveIds.length === 0
        ? []
        : await prisma.careerPortfolioItem.findMany({
            where: { userId: featured.userId, visaStampId: { in: liveIds } },
            orderBy: { createdAt: "desc" },
            select: { title: true, visaStampId: true },
          });

    return {
      status: "found",
      card: toPublicTalentCard(featuredLive, live, portfolio),
    };
  } catch {
    return null;
  }
}
