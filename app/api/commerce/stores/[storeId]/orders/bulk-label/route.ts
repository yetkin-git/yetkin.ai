import { postBulkLabel } from "@/lib/commerce/fulfillment-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export function POST(request: Request, context: { params: Promise<{ storeId: string }> }) {
  return context.params.then(({ storeId }) => postBulkLabel(deps, request, storeId));
}
