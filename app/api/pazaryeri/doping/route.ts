import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { purchaseMarketplaceDoping } from "@/lib/pazaryeri/doping-engine";
import { pazaryeriDopingInputSchema } from "@/lib/pazaryeri/schemas";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = pazaryeriDopingInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("Doping gövdesi geçersiz.", 400);
    }
    const ports = createPrismaPazaryeriPorts();
    const listed =
      (await ports.pazaryeri.getProduct(parsed.data.productId)) ??
      (await ports.pazaryeri.getProductBySlug(parsed.data.productId));
    const result = await purchaseMarketplaceDoping(ports, {
      productId: listed?.id ?? parsed.data.productId,
      sellerUserId: user.id,
    });
    return jsonOk({
      applied: result.applied,
      product: result.product,
      doping: result.doping,
    });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
