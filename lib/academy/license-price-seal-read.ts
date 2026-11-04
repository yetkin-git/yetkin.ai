import "server-only";

import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { getPrisma } from "@/lib/kernel/db";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

/**
 * Satıştaki lisansın aktif `PriceCatalogEntry.amountMinor` değeri.
 * Satır yoksa, kapalıysa veya MINOR değilse `null`. Tohum bu okumaya girmez.
 */
export async function readActiveAcademyLicenseAmountMinor(slug: string): Promise<number | null> {
  const course = await getPrisma().academyCourse.findUnique({
    where: { slug },
    select: { catalogUnitKey: true },
  });
  if (!course?.catalogUnitKey) {
    return null;
  }
  const entry = await createPrismaPriceCatalogStore().findActiveEntry(
    ACADEMY_MODULE_KEY,
    course.catalogUnitKey,
  );
  if (!entry || entry.unitType !== "MINOR") {
    return null;
  }
  return entry.amountMinor;
}
