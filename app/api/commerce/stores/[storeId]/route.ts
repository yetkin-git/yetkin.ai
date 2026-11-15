import { getStore, patchStore } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return getStore(deps, request, storeId);
}

export async function PATCH(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return patchStore(deps, request, storeId);
}
