import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { CoursePublishDraft, CoursePublishStore } from "@/lib/kernel/admin/course-publish";

/**
 * Yayın yazımı. `amountMinor` ve `updatedBy` güncellenmez.
 * Denetim satırı eski tutarı yeni tutar olarak aynen yazar; fiyat hareketi yoktur.
 */
export function createPrismaCoursePublishStore(): CoursePublishStore {
  const prisma = getPrisma();
  return {
    async findCourse(slug) {
      const row = await prisma.academyCourse.findUnique({
        where: { slug },
        select: { id: true, slug: true, isPublished: true },
      });
      return row;
    },
    async findCatalog(moduleKey, unitKey) {
      const row = await prisma.priceCatalogEntry.findUnique({
        where: { moduleKey_unitKey: { moduleKey, unitKey } },
        select: {
          id: true,
          moduleKey: true,
          unitKey: true,
          unitType: true,
          amountMinor: true,
          currencyCode: true,
          isActive: true,
          updatedBy: true,
        },
      });
      return row;
    },
    async commit(draft: CoursePublishDraft) {
      await prisma.$transaction(async (tx) => {
        if (draft.insert) {
          await tx.academyCourse.create({
            data: {
              id: draft.insert.id,
              slug: draft.insert.slug,
              title: draft.insert.title,
              summary: draft.insert.summary,
              catalogUnitKey: draft.insert.catalogUnitKey,
              globalRank: draft.insert.globalRank,
              localRank: draft.insert.localRank,
              trendScore: draft.insert.trendScore,
              isPublished: draft.insert.isPublished,
            },
          });
        } else if (draft.courseId) {
          await tx.academyCourse.update({
            where: { id: draft.courseId },
            data: { isPublished: draft.published },
          });
        }
        if (!draft.catalog) {
          return;
        }
        await tx.priceCatalogEntry.update({
          where: { id: draft.catalog.id },
          data: { isActive: draft.catalog.isActive },
        });
        await tx.priceCatalogDecisionLedger.create({
          data: {
            catalogEntryId: draft.catalog.id,
            moduleKey: draft.catalog.moduleKey,
            unitKey: draft.catalog.unitKey,
            unitType: draft.catalog.unitType,
            reasonCode: "ADMIN_MANUAL",
            reason: draft.reason,
            oldMinor: draft.catalog.amountMinor,
            newMinor: draft.catalog.amountMinor,
            currencyCode: draft.catalog.currencyCode,
            actorUserId: draft.actorUserId,
          },
        });
      });
    },
  };
}

/** Nakit niyeti. Satır yoksa veya okuma düşerse satış kapalıdır. */
export async function academyCourseRowIsPublished(slug: string): Promise<boolean> {
  try {
    const row = await getPrisma().academyCourse.findUnique({
      where: { slug },
      select: { isPublished: true },
    });
    return row?.isPublished === true;
  } catch {
    return false;
  }
}
