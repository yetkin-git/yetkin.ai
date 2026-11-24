import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import { findPassportStampsForUser } from "@/lib/kernel/passport/load";
import type {
  CareerPortfolioItemRecord,
  CareerPulse,
  CareerStampWriteClient,
  CareerStore,
  CareerVisaStampRecord,
} from "@/lib/career/types";

function toStamp(row: {
  id: string;
  userId: string;
  sourceKind: CareerVisaStampRecord["sourceKind"];
  sourceId: string;
  visaKey: string;
  moduleId: string;
  title: string;
  certificateHash: string | null;
  issuedAt: Date;
  createdAt: Date;
}): CareerVisaStampRecord {
  return { ...row };
}

function toItem(row: {
  id: string;
  userId: string;
  visaStampId: string | null;
  title: string;
  createdAt: Date;
}): CareerPortfolioItemRecord {
  if (!row.visaStampId) {
    throw new Error("Mühürsüz portföy satırı vize defterine yazılmaz.");
  }
  return {
    id: row.id,
    userId: row.userId,
    visaStampId: row.visaStampId,
    title: row.title,
    createdAt: row.createdAt,
  };
}

type CareerWriteDb = Pick<PrismaClient, "careerVisaStamp" | "careerPortfolioItem">;

function bindCareerWrites(db: CareerWriteDb): CareerStampWriteClient {
  return {
    async insertStamp(stamp) {
      const row = await db.careerVisaStamp.create({
        data: {
          id: stamp.id,
          userId: stamp.userId,
          sourceKind: stamp.sourceKind,
          sourceId: stamp.sourceId,
          visaKey: stamp.visaKey,
          moduleId: stamp.moduleId,
          title: stamp.title,
          certificateHash: stamp.certificateHash,
          issuedAt: stamp.issuedAt,
          createdAt: stamp.createdAt,
        },
      });
      return toStamp(row);
    },
    async getStampBySource(userId, sourceKind, sourceId) {
      const row = await db.careerVisaStamp.findUnique({
        where: { userId_sourceKind_sourceId: { userId, sourceKind, sourceId } },
      });
      return row ? toStamp(row) : null;
    },
    async setStampCertificateHash(id, certificateHash) {
      const row = await db.careerVisaStamp.update({
        where: { id },
        data: { certificateHash },
      });
      return toStamp(row);
    },
    async insertPortfolioItem(item) {
      const row = await db.careerPortfolioItem.create({
        data: {
          id: item.id,
          userId: item.userId,
          visaStampId: item.visaStampId,
          title: item.title,
          createdAt: item.createdAt,
        },
      });
      return toItem(row);
    },
    async getPortfolioItemByStampId(visaStampId) {
      const row = await db.careerPortfolioItem.findUnique({ where: { visaStampId } });
      return row?.visaStampId ? toItem(row) : null;
    },
  };
}

export function createPrismaCareerStore(): CareerStore {
  const prisma = getPrisma();
  const writes = bindCareerWrites(prisma);
  return {
    ...writes,
    async listStampsForUser(userId) {
      return findPassportStampsForUser(userId);
    },
    async listPortfolioForUser(userId) {
      // O7: tezgâh kanıtları da /career sayacında görünür (visaStampId null olabilir).
      const rows = await prisma.careerPortfolioItem.findMany({
        where: {
          userId,
          OR: [{ visaStampId: { not: null } }, { sourceKey: { startsWith: "tezgah:" } }],
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((row) =>
        row.visaStampId
          ? toItem(row)
          : {
              id: row.id,
              userId: row.userId,
              visaStampId: "",
              title: row.title,
              createdAt: row.createdAt,
            },
      );
    },
    async pulseForUser(userId) {
      const [stamps, portfolioCount] = await Promise.all([
        prisma.careerVisaStamp.findMany({
          where: { userId },
          orderBy: { issuedAt: "desc" },
          select: { title: true },
          take: 100,
        }),
        prisma.careerPortfolioItem.count({
          where: {
            userId,
            OR: [{ visaStampId: { not: null } }, { sourceKey: { startsWith: "tezgah:" } }],
          },
        }),
      ]);
      const pulse: CareerPulse = {
        visaCount: stamps.length,
        portfolioCount,
        lastVisaTitle: stamps[0]?.title ?? null,
      };
      return pulse;
    },
    async runStampPortfolioAtomic(work) {
      return prisma.$transaction((tx) => work(bindCareerWrites(tx)));
    },
  };
}
