import { postEconomics } from "@/lib/commerce/profit-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return postEconomics(deps, request, storeId);
}
