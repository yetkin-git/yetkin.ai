import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { purchaseMarketplaceProduct } from "@/lib/pazaryeri/engine";
import { purchaseProductInputSchema } from "@/lib/pazaryeri/schemas";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSession(request);
    const { id } = await context.params;
    const parsed = purchaseProductInputSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Satın alma gövdesi geçersiz.", 400);
    }
    const ports = createPrismaPazaryeriPorts();
    const listed = (await ports.pazaryeri.getProduct(id)) ?? (await ports.pazaryeri.getProductBySlug(id));
    const result = await purchaseMarketplaceProduct(ports, {
      productId: listed?.id ?? id,
      userId: user.id,
      lockId: parsed.data.lockId,
    });
    return jsonOk({
      applied: result.applied,
      order: result.order,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
