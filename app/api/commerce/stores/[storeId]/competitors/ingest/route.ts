import { postCompetitorIngest } from "@/lib/commerce/repricer-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return postCompetitorIngest(deps, request, storeId);
}
