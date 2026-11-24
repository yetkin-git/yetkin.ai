import { postRadarScan } from "@/lib/commerce/profit-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return postRadarScan(deps, request, storeId);
}
