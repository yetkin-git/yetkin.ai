import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaAcademyPorts();
    const courses = await ports.academy.listPublishedCourses();
    const withPrice = await Promise.all(
      courses.map(async (course) => {
        const entry = await ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, course.catalogUnitKey);
        return {
          ...course,
          priceMinor: entry?.amountMinor ?? null,
          currencyCode: entry?.currencyCode ?? null,
          purchasable: Boolean(entry) && course.isPublished,
        };
      }),
    );
    return jsonOk({ courses: withPrice });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
