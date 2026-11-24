import { getFulfillmentOrders } from "@/lib/commerce/fulfillment-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  return context.params.then(({ storeId }) => getFulfillmentOrders(deps, request, storeId));
}
