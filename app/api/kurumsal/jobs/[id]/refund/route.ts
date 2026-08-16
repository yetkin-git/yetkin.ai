import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { refundCorporateJobPosting } from "@/lib/kurumsal/engine";
import { createPrismaKurumsalPorts } from "@/lib/kurumsal/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaKurumsalPorts();
    const posting = await refundCorporateJobPosting(ports, {
      postingId: id,
      actorUserId: user.id,
    });
    return jsonOk({ posting });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
