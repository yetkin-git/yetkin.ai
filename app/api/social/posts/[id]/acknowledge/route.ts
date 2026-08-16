import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { interactWithProof } from "@/lib/social/engine";
import { createPrismaSocialPorts } from "@/lib/social/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaSocialPorts();
    const result = await interactWithProof(ports, {
      userId: user.id,
      itemId: id,
      kind: "ACKNOWLEDGE",
    });
    return jsonOk({ applied: result.applied });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
