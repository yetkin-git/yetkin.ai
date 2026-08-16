import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaPazaryeriPorts();
    const order = await ports.pazaryeri.getOrder(id);
    if (!order) {
      return jsonFail("Sipariş bulunamadı.", 404);
    }
    if (order.userId !== user.id && order.sellerUserId !== user.id) {
      return jsonFail("Sipariş bu oturuma ait değil.", 403);
    }
    return jsonOk({ order });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
