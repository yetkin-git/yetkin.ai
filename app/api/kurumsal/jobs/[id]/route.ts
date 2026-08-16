import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaKurumsalPorts();
    const posting = await ports.kurumsal.getPosting(id);
    if (!posting) {
      return jsonFail("İlan bulunamadı.", 404);
    }
    return jsonOk({ posting });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
