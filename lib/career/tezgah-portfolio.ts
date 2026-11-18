import "server-only";

import { getPrisma } from "@/lib/kernel/db";

const BODY_CAP = 280;

function excerpt(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= BODY_CAP) {
    return clean;
  }
  return `${clean.slice(0, BODY_CAP).trim()}…`;
}

/**
 * Tezgâh çıktısını kamu portföy satırına bağlar.
 * Vize damgası şart değildir. Kart, sahibin canlı mühründe bu başlığı gösterir.
 * Aynı çıktı ikinci kez eklenmez.
 */
export async function attachTezgahOutputToPortfolio(
  userId: string,
  tezgahOutputId: string,
): Promise<boolean> {
  const prisma = getPrisma();
  const output = await prisma.tezgahOutput.findFirst({
    where: { id: tezgahOutputId, userId },
    select: { id: true, title: true, toolKey: true, outputContent: true },
  });
  if (!output) {
    return false;
  }
  const sourceKey = `tezgah:${output.id}`;
  const existing = await prisma.careerPortfolioItem.findUnique({
    where: { sourceKey },
    select: { id: true, userId: true },
  });
  if (existing) {
    return existing.userId === userId;
  }
  try {
    await prisma.careerPortfolioItem.create({
      data: {
        userId,
        title: output.title,
        body: excerpt(output.outputContent),
        toolKey: output.toolKey,
        sourceKey,
      },
    });
  } catch (error) {
    const raced = await prisma.careerPortfolioItem.findUnique({
      where: { sourceKey },
      select: { userId: true },
    });
    if (raced?.userId === userId) {
      return true;
    }
    throw error;
  }
  return true;
}
