import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { listMarketplaceProduct } from "@/lib/pazaryeri/engine";
import { createProductInputSchema } from "@/lib/pazaryeri/schemas";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function GET(request: Request) {
  try {
    await requireSession(request);
    const ports = createPrismaPazaryeriPorts();
    const products = await ports.pazaryeri.listListedProducts();
    return jsonOk({ products });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const parsed = createProductInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonFail("İlan alanları geçersiz.", 400);
    }
    const ports = createPrismaPazaryeriPorts();
    const product = await listMarketplaceProduct(ports, {
      sellerUserId: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      kind: parsed.data.kind,
      category: parsed.data.category,
      amountMinor: parsed.data.amountMinor,
      isOfferAllowed: parsed.data.isOfferAllowed,
      tkgmBlockParcel: parsed.data.tkgmBlockParcel,
      insuranceQuoteHook: parsed.data.insuranceQuoteHook,
    });
    return jsonOk({ product }, 201);
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
