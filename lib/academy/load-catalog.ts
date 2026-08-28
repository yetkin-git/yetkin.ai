import "server-only";

/**
 * Katalog BFF — müfredat gövdesi / curriculum.ts / exam-engine / exam-pools yok.
 * Kart alanları `published-catalog` → `catalog-seed`. Ders adedi `lesson-index`.
 */

import { cache } from "react";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import type { AcademyCourseRecord, AcademyCourseWithPrice } from "@/lib/academy/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { ensurePrismaQueryEngine, withDbReadTimeout } from "@/lib/kernel/db";
import {
  mergePublishedAcademyCatalog,
  overlaySeedCatalogPrice,
  publishedCoursesFromSeed,
} from "@/lib/academy/published-catalog";
import {
  pickAcademyContinueBoard,
  resolveAcademyContinueBoard,
  type AcademyContinueBoard,
} from "@/lib/academy/continue-board";
import {
  EMPTY_ACADEMY_CATALOG_LEARNER_BOARD,
  type AcademyCatalogLearnerBoard,
  type AcademyCatalogLearnerStatus,
} from "@/lib/academy/catalog-learner";
import { academyCatalogSeedMatch } from "@/lib/academy/catalog-seed";
import { curriculumLessonCountForSlug } from "@/lib/academy/curricula/lesson-index";
import { hasCommercialAcademyEnrolment } from "@/lib/academy/enrolment";

export type { AcademyCourseWithPrice };
export type { AcademyContinueBoard };
export type { AcademyCatalogLearnerBoard };

/** Vitrin soğuk start — tohum kartlar 800ms içinde basılır; DB bekletmez. */
export const ACADEMY_CATALOG_READ_TIMEOUT_MS = 800;

function courseSlugFromCatalog(
  courseId: string,
  extra: ReadonlyMap<string, AcademyCourseRecord>,
): string | undefined {
  const seed = academyCatalogSeedMatch(courseId);
  if (seed) {
    return seed.slug;
  }
  return extra.get(courseId)?.slug;
}

export const loadPublishedCourses = cache(async function loadPublishedCourses(): Promise<
  AcademyCourseWithPrice[]
> {
  const seeded = publishedCoursesFromSeed();
  try {
    return await withDbReadTimeout(
      (async () => {
        await ensurePrismaQueryEngine();
        const ports = createPrismaAcademyPorts();
        const courses = await ports.academy.listPublishedCourses();
        const seedSlugs = new Set(seeded.map((row) => row.slug));
        const relevant = courses.filter((course) => seedSlugs.has(course.slug));
        const unitKeys = [...new Set(relevant.map((course) => course.catalogUnitKey))];
        const entries =
          unitKeys.length > 0
            ? await ports.catalog.listActiveEntries(ACADEMY_MODULE_KEY, unitKeys)
            : [];
        const byUnit = new Map(entries.map((entry) => [entry.unitKey, entry] as const));
        const live = relevant.map((course) => {
          const entry = byUnit.get(course.catalogUnitKey);
          return overlaySeedCatalogPrice({
            ...course,
            priceMinor: entry?.amountMinor ?? null,
            currencyCode: entry?.currencyCode ?? SETTLEMENT_CURRENCY,
            purchasable: Boolean(entry) && course.isPublished,
          });
        });
        return mergePublishedAcademyCatalog(live, seeded);
      })(),
      ACADEMY_CATALOG_READ_TIMEOUT_MS,
      "academy.catalog",
    );
  } catch {
    return seeded;
  }
});

/** Katalog sekmeleri — aldıklarım / durum rozetleri (Devam Et · Tamamlandı). */
export const loadAcademyCatalogLearnerBoard = cache(async function loadAcademyCatalogLearnerBoard(
  userId: string,
): Promise<AcademyCatalogLearnerBoard> {
  try {
    return await withDbReadTimeout(
      (async () => {
        await ensurePrismaQueryEngine();
        const ports = createPrismaAcademyPorts();
        const [purchases, certificates] = await Promise.all([
          ports.academy.listPurchasesForUser(userId),
          ports.academy.listCertificatesForUser(userId),
        ]);
        const commercial = purchases.filter((row) => hasCommercialAcademyEnrolment(row));
        if (commercial.length === 0) {
          return EMPTY_ACADEMY_CATALOG_LEARNER_BOARD;
        }
        const courseIds = [...new Set(commercial.map((row) => row.courseId))];
        const missingIds = courseIds.filter((id) => !academyCatalogSeedMatch(id));
        const extra = new Map<string, AcademyCourseRecord>();
        if (missingIds.length > 0) {
          const rows = await Promise.all(missingIds.map((id) => ports.academy.getCourse(id)));
          for (const course of rows) {
            if (course) {
              extra.set(course.id, course);
            }
          }
        }
        const completedCourseIds = new Set(
          certificates.filter((row) => !row.revokedAt).map((row) => row.courseId),
        );
        const statusBySlug: Record<string, AcademyCatalogLearnerStatus> = {};
        const ownedSlugs: string[] = [];
        for (const courseId of courseIds) {
          const slug = courseSlugFromCatalog(courseId, extra);
          if (!slug) {
            continue;
          }
          ownedSlugs.push(slug);
          statusBySlug[slug] = completedCourseIds.has(courseId) ? "completed" : "continue";
        }
        return {
          ownedSlugs: [...new Set(ownedSlugs)],
          statusBySlug,
        };
      })(),
      ACADEMY_CATALOG_READ_TIMEOUT_MS,
      "academy.learner",
    );
  } catch {
    return EMPTY_ACADEMY_CATALOG_LEARNER_BOARD;
  }
});

/** Satın alınmış, henüz mühürlenmemiş eğitimde kaldığı yer — katalog / kokpit CTA. */
export const loadAcademyContinueBoard = cache(async function loadAcademyContinueBoard(
  userId: string,
): Promise<AcademyContinueBoard | null> {
  try {
    return await withDbReadTimeout(
      (async () => {
        await ensurePrismaQueryEngine();
        const ports = createPrismaAcademyPorts();
        const [purchases, certificates] = await Promise.all([
          ports.academy.listPurchasesForUser(userId),
          ports.academy.listCertificatesForUser(userId),
        ]);
        const commercial = purchases.filter((row) => hasCommercialAcademyEnrolment(row));
        if (commercial.length === 0) {
          return null;
        }
        const certByPurchase = new Map(certificates.map((row) => [row.purchaseId, row] as const));
        const pending = commercial.filter((purchase) => {
          const certificate = certByPurchase.get(purchase.id);
          return !(certificate && !certificate.revokedAt);
        });
        const missingIds = [
          ...new Set(
            pending.map((purchase) => purchase.courseId).filter((id) => !academyCatalogSeedMatch(id)),
          ),
        ];
        const extra = new Map<string, AcademyCourseRecord>();
        if (missingIds.length > 0) {
          const rows = await Promise.all(missingIds.map((id) => ports.academy.getCourse(id)));
          for (const course of rows) {
            if (course) {
              extra.set(course.id, course);
            }
          }
        }
        const ready: Array<{
          purchaseId: string;
          courseId: string;
          courseSlug: string;
          courseTitle: string;
        }> = [];
        for (const purchase of pending) {
          const seed = academyCatalogSeedMatch(purchase.courseId);
          const course = seed
            ? { id: seed.id, slug: seed.slug, title: seed.title }
            : extra.get(purchase.courseId);
          if (!course || !academyCatalogSeedMatch(course.slug)) {
            continue;
          }
          ready.push({
            purchaseId: purchase.id,
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
          });
        }
        const completionsByPurchase = await Promise.all(
          ready.map((row) => ports.academy.listLessonCompletionsByPurchase(row.purchaseId)),
        );
        const boards: AcademyContinueBoard[] = [];
        for (let index = 0; index < ready.length; index += 1) {
          const row = ready[index];
          if (!row) {
            continue;
          }
          const completions = completionsByPurchase[index] ?? [];
          const board = resolveAcademyContinueBoard({
            courseId: row.courseId,
            courseSlug: row.courseSlug,
            courseTitle: row.courseTitle,
            completedLessonKeys: completions.map((item) => item.lessonKey),
            hasCertificate: false,
          });
          if (board) {
            boards.push(board);
          }
        }
        return pickAcademyContinueBoard(boards);
      })(),
      ACADEMY_CATALOG_READ_TIMEOUT_MS,
      "academy.continue",
    );
  } catch {
    return null;
  }
});

export function publishedLessonCount(slug: string): number {
  return curriculumLessonCountForSlug(slug);
}
