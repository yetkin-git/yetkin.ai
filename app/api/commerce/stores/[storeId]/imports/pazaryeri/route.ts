import { postPazaryeriImport } from "@/lib/commerce/handlers";
import { liveCommerceDeps } from "@/lib/commerce/live";

export const auth = "session" as const;

const deps = liveCommerceDeps();

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return postPazaryeriImport(deps, request, storeId);
}
