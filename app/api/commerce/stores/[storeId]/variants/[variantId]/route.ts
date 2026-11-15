import { patchVariant } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ storeId: string; variantId: string }> },
) {
  const { storeId, variantId } = await context.params;
  return patchVariant(deps, request, storeId, variantId);
}
