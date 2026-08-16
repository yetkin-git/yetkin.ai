import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { refundMarketplaceOrder } from "@/lib/pazaryeri/engine";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaPazaryeriPorts();
    const result = await refundMarketplaceOrder(ports, {
      orderId: id,
      actorUserId: user.id,
    });
    return jsonOk({ applied: result.applied, order: result.order });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
