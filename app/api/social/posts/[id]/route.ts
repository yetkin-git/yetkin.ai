import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { getProofFeedItemDto } from "@/lib/social/engine";
import { createPrismaSocialPorts } from "@/lib/social/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaSocialPorts();
    const item = await getProofFeedItemDto(ports, id);
    return jsonOk({ item });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
