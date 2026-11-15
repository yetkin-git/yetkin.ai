import { canSendInngestEvents } from "@/lib/kernel/jobs/inngest-guard";
import { logEvent } from "@/lib/kernel/observability/log";
import { trendyolStockEventId } from "@/lib/commerce/trendyol-sync";

/** `applied` stok hareketinden sonra Trendyol yansısı. `replay` buraya gelmez. Testte kuyruk açılmaz. */
export async function publishAppliedTrendyolStock(input: {
  storeId: string;
  variantId: string;
  onHandAfter: number;
  amountMinor: number | null;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  const env = input.env ?? process.env;
  if (env.NODE_ENV === "test" || input.amountMinor == null || !canSendInngestEvents(env)) {
    return;
  }
  const { createPrismaMarketplaceRepository } = await import("@/lib/commerce/marketplace-prisma");
  const listing = await createPrismaMarketplaceRepository().findListingByVariant(input.storeId, input.variantId);
  if (!listing) {
    return;
  }
  const { inngest, INNGEST_EVENTS } = await import("@/lib/kernel/jobs/inngest");
  await inngest.send({
    name: INNGEST_EVENTS.TRENDYOL_STOCK_PUSH_REQUESTED,
    id: trendyolStockEventId(listing.id, input.onHandAfter, input.amountMinor),
    data: {
      listingId: listing.id,
      storeId: input.storeId,
      onHandAfter: input.onHandAfter,
      amountMinor: input.amountMinor,
    },
  });
}

export function logTrendyolEnqueueFailure(error: unknown): void {
  logEvent({
    level: "error",
    event: "commerce.trendyol.stock-push.enqueue-failed",
    errorName: error instanceof Error ? error.name : "unknown",
    applied: false,
  });
}
