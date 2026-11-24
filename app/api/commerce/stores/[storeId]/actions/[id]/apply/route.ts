import { postActionApply } from "@/lib/commerce/profit-handlers";
import { liveProfitDeps } from "@/lib/commerce/profit-live";

export const auth = "session" as const;

const deps = liveProfitDeps();

export async function POST(
  request: Request,
  context: { params: Promise<{ storeId: string; id: string }> },
) {
  const { storeId, id } = await context.params;
  return postActionApply(deps, request, storeId, id);
}
