import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { lockMarketplaceProductPrice } from "@/lib/pazaryeri/engine";
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
    const listed = (await ports.pazaryeri.getProduct(id)) ?? (await ports.pazaryeri.getProductBySlug(id));
    const result = await lockMarketplaceProductPrice(ports, {
      productId: listed?.id ?? id,
      userId: user.id,
    });
    return jsonOk({ product: result.product, lock: result.lock });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
