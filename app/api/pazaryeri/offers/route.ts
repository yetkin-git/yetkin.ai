import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { decideMarketplaceOffer, submitMarketplaceOffer } from "@/lib/pazaryeri/offer-engine";
import { createOfferInputSchema, decideOfferInputSchema } from "@/lib/pazaryeri/schemas";
import { createPrismaPazaryeriPorts } from "@/lib/pazaryeri/runtime";

export const auth = "session" as const;

export async function POST(request: Request) {
  try {
    const user = await requireSession(request);
    const body: unknown = await request.json();
    const createParsed = createOfferInputSchema.safeParse(body);
    if (createParsed.success) {
      const ports = createPrismaPazaryeriPorts();
      const result = await submitMarketplaceOffer(ports, {
        productId: createParsed.data.productId,
        buyerUserId: user.id,
        amountMinor: createParsed.data.amountMinor,
      });
      return jsonOk({ applied: result.applied, offer: result.offer }, result.applied ? 201 : 200);
    }
    const decideParsed = decideOfferInputSchema.safeParse(body);
    if (!decideParsed.success) {
      return jsonFail("Teklif gövdesi geçersiz.", 400);
    }
    const ports = createPrismaPazaryeriPorts();
    const result = await decideMarketplaceOffer(ports, {
      offerId: decideParsed.data.offerId,
      actorUserId: user.id,
      decision: decideParsed.data.decision,
    });
    return jsonOk({ applied: result.applied, offer: result.offer, order: result.order });
  } catch (error) {
    return jsonFromUnknown(error);
  }
}
