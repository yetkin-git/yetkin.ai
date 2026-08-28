/**
 * Akademi kurs + katalog + müfredat sınavı tohumu.
 * Kaynak sicil: `lib/academy/seed.ts` (SQL: render-academy-course-seed-sql.ts).
 *
 *   npx prisma db seed
 */

import { resolve } from "node:path";
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  ACADEMY_COURSE_SEEDS,
  ACADEMY_LEGACY_PURGE_CATALOG_UNITS,
  ACADEMY_LEGACY_PURGE_COURSE_IDS,
  ACADEMY_SEED_CURRENCY,
  ACADEMY_SEED_COURSE_IDS,
  ACADEMY_SEED_MODULE_KEY,
} from "@/lib/academy/seed";
import { serializeAcademyExamQuestions } from "@/lib/academy/exam";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

function withPgLibpqSslCompat(url: string): string {
  if (/[?&]uselibpqcompat=/i.test(url)) {
    return url;
  }
  return url.includes("?") ? `${url}&uselibpqcompat=true` : `${url}?uselibpqcompat=true`;
}

async function main(): Promise<void> {
  const url = (process.env.DIRECT_URL ?? process.env.DATABASE_URL)?.trim();
  if (!url) {
    throw new Error("DIRECT_URL veya DATABASE_URL tanımlı değil.");
  }

  const pool = new Pool({
    connectionString: withPgLibpqSslCompat(url),
    max: 4,
    connectionTimeoutMillis: 15_000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const row of ACADEMY_COURSE_SEEDS) {
      const existing = await prisma.priceCatalogEntry.findUnique({
        where: {
          moduleKey_unitKey: {
            moduleKey: ACADEMY_SEED_MODULE_KEY,
            unitKey: row.catalogUnitKey,
          },
        },
        select: { updatedBy: true, amountMinor: true },
      });

      const amountMinor =
        existing?.updatedBy != null ? existing.amountMinor : row.seedAmountMinor;

      await prisma.priceCatalogEntry.upsert({
        where: {
          moduleKey_unitKey: {
            moduleKey: ACADEMY_SEED_MODULE_KEY,
            unitKey: row.catalogUnitKey,
          },
        },
        create: {
          id: row.catalogEntryId,
          moduleKey: ACADEMY_SEED_MODULE_KEY,
          unitKey: row.catalogUnitKey,
          unitType: "MINOR",
          amountMinor: row.seedAmountMinor,
          currencyCode: ACADEMY_SEED_CURRENCY,
          isActive: true,
          minMinor: row.seedMinMinor,
          maxMinor: row.seedMaxMinor,
          description: `Akademi kurs birim fiyatı — ${row.title} (S11-A).`,
        },
        update: {
          amountMinor,
          currencyCode: ACADEMY_SEED_CURRENCY,
          isActive: true,
          minMinor: row.seedMinMinor,
          maxMinor: row.seedMaxMinor,
          description: `Akademi kurs birim fiyatı — ${row.title} (S11-A).`,
        },
      });

      await prisma.academyCourse.upsert({
        where: { id: row.id },
        create: {
          id: row.id,
          slug: row.slug,
          title: row.title,
          summary: row.summary,
          catalogUnitKey: row.catalogUnitKey,
          globalRank: row.globalRank,
          localRank: row.localRank,
          trendScore: row.trendScore,
          isPublished: true,
        },
        update: {
          slug: row.slug,
          title: row.title,
          summary: row.summary,
          catalogUnitKey: row.catalogUnitKey,
          globalRank: row.globalRank,
          localRank: row.localRank,
          trendScore: row.trendScore,
          isPublished: true,
        },
      });

      await prisma.academyExam.upsert({
        where: { courseId: row.id },
        create: {
          id: row.exam.id,
          courseId: row.id,
          title: row.exam.title,
          passScore: row.exam.passScore,
          questionsJson: serializeAcademyExamQuestions(row.exam.questions),
        },
        update: {
          title: row.exam.title,
          passScore: row.exam.passScore,
          questionsJson: serializeAcademyExamQuestions(row.exam.questions),
        },
      });
    }

    // HARD RESET — eski RAIL / jenerik tohumları FK sırasıyla tamamen düşür (DELETE/PURGE).
    const legacyCourseIds = [...ACADEMY_LEGACY_PURGE_COURSE_IDS];
    const seedCourseIds = [...ACADEMY_SEED_COURSE_IDS];
    const seedCatalogUnits = ACADEMY_COURSE_SEEDS.map((row) => row.catalogUnitKey);
    const purgeCourseIds = {
      OR: [{ id: { in: legacyCourseIds } }, { id: { notIn: seedCourseIds } }],
    };
    const purgeByCourseId = {
      OR: [{ courseId: { in: legacyCourseIds } }, { courseId: { notIn: seedCourseIds } }],
    };

    await prisma.academyCertificate.deleteMany({ where: purgeByCourseId });
    await prisma.academyExamAttempt.deleteMany({
      where: { exam: { course: purgeCourseIds } },
    });
    await prisma.academyLessonCompletion.deleteMany({ where: purgeByCourseId });
    await prisma.academyPurchase.deleteMany({ where: purgeByCourseId });
    await prisma.academyExam.deleteMany({ where: purgeByCourseId });
    await prisma.academyCourse.deleteMany({ where: purgeCourseIds });
    await prisma.priceCatalogEntry.deleteMany({
      where: {
        moduleKey: ACADEMY_SEED_MODULE_KEY,
        OR: [
          { unitKey: { in: [...ACADEMY_LEGACY_PURGE_CATALOG_UNITS] } },
          {
            unitKey: { startsWith: "course:" },
            NOT: { unitKey: { in: seedCatalogUnits } },
          },
        ],
      },
    });

    process.stdout.write(
      `OK academy seed: ${ACADEMY_COURSE_SEEDS.length} Matrix SKU; legacy hard-purge ${ACADEMY_LEGACY_PURGE_COURSE_IDS.length}\n`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`academy seed failed: ${message}\n`);
  process.exit(1);
});
