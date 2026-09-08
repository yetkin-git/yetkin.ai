import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { mergePublishedAcademyCatalog, overlaySeedCatalogPrice } from "@/lib/academy/published-catalog";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaAcademyPorts();
    const courses = await ports.academy.listPublishedCourses();
    const withPrice = await Promise.all(
      courses.map(async (course) => {
        const entry = await ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, course.catalogUnitKey);
        return overlaySeedCatalogPrice({
          ...course,
          priceMinor: entry?.amountMinor ?? null,
          currencyCode: entry?.currencyCode ?? SETTLEMENT_CURRENCY,
          purchasable: Boolean(entry) && course.isPublished,
        });
      }),
    );
    return jsonOk({ courses: mergePublishedAcademyCatalog(withPrice) });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
