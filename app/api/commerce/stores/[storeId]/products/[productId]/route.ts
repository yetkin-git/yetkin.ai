import { getProduct, patchProduct } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function GET(
  request: Request,
  context: { params: Promise<{ storeId: string; productId: string }> },
) {
  const { storeId, productId } = await context.params;
  return getProduct(deps, request, storeId, productId);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string; productId: string }> },
) {
  const { storeId, productId } = await context.params;
  return patchProduct(deps, request, storeId, productId);
}
