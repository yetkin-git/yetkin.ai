import { deleteBundle } from "@/lib/commerce/profit-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ storeId: string; id: string }> },
) {
  const { storeId, id } = await context.params;
  return deleteBundle(deps, request, storeId, id);
}
