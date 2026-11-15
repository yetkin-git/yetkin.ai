import { getProducts, postProduct } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return getProducts(deps, request, storeId);
}

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return postProduct(deps, request, storeId);
}
