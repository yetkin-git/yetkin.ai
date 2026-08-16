import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaAcademyPorts } from "@/lib/academy/runtime";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaAcademyPorts();
    const course = (await ports.academy.getCourse(id)) ?? (await ports.academy.getCourseBySlug(id));
    if (!course) {
      return jsonFail("Kurs bulunamadı.", 404);
    }
    const entry = await ports.catalog.findActiveEntry(ACADEMY_MODULE_KEY, course.catalogUnitKey);
    return jsonOk({
      course: {
        ...course,
        priceMinor: entry?.amountMinor ?? null,
        currencyCode: entry?.currencyCode ?? null,
        purchasable: Boolean(entry) && course.isPublished,
      },
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
