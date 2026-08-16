import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession(request);
    const { id } = await context.params;
    const ports = createPrismaPazaryeriPorts();
    const product = (await ports.pazaryeri.getProduct(id)) ?? (await ports.pazaryeri.getProductBySlug(id));
    if (!product) {
      return jsonFail("Ürün bulunamadı.", 404);
    }
    return jsonOk({ product });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
