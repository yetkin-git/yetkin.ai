import { postVariant } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string; productId: string }> },
) {
  const { storeId, productId } = await context.params;
  return postVariant(deps, request, storeId, productId);
}
