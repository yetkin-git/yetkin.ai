import {
  deleteTrendyolCredentialRoute,
  getTrendyolCredentialRoute,
  putTrendyolCredentialRoute,
} from "@/lib/commerce/marketplace-handlers";
import { liveMarketplaceHandlerDeps } from "@/lib/commerce/trendyol-live";

export const auth = "session" as const;

const deps = liveMarketplaceHandlerDeps();

export async function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return getTrendyolCredentialRoute(deps, request, storeId);
}

export async function PUT(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return putTrendyolCredentialRoute(deps, request, storeId);
}

export async function DELETE(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return deleteTrendyolCredentialRoute(deps, request, storeId);
}
