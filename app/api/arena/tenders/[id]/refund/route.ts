import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { refundArenaTender } from "@/lib/arena/engine";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaArenaPorts();
    const tender = await refundArenaTender(ports, {
      tenderId: id,
      actorUserId: user.id,
    });
    return jsonOk({ tender });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
