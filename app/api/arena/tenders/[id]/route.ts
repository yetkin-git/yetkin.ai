import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaArenaPorts();
    const tender = await ports.arena.getTender(id);
    if (!tender) {
      return jsonFail("İhale bulunamadı.", 404);
    }
    const [submissions, awards] = await Promise.all([
      ports.arena.listSubmissionsForTender(id),
      ports.arena.listAwardsForTender(id),
    ]);
    return jsonOk({ tender, submissions, awards });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
