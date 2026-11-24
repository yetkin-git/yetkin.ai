import { patchOrderStatus } from "@/lib/commerce/fulfillment-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export function PATCH(request: Request, context: { params: Promise<{ storeId: string; orderId: string }> }) {
  return context.params.then(({ storeId, orderId }) => patchOrderStatus(deps, request, storeId, orderId));
}
