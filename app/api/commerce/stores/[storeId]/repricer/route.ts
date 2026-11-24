import { getRepricerDesk } from "@/lib/commerce/repricer-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return getRepricerDesk(deps, request, storeId);
}
