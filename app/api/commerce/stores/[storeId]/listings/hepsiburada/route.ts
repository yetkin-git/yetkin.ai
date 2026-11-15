import {
  deleteTrendyolListingRoute,
  getTrendyolListingsRoute,
  putTrendyolListingRoute,
} from "@/lib/commerce/marketplace-handlers";
import { liveMarketplaceHandlerDeps } from "@/lib/commerce/trendyol-live";

export const auth = "session" as const;

const deps = liveMarketplaceHandlerDeps();
const CHANNEL = "HEPSIBURADA" as const;

export async function GET(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return getTrendyolListingsRoute(deps, request, storeId, CHANNEL);
}

export async function PUT(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return putTrendyolListingRoute(deps, request, storeId, CHANNEL);
}

export async function DELETE(request: Request, context: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await context.params;
  return deleteTrendyolListingRoute(deps, request, storeId, CHANNEL);
}
