import { canSendInngestEvents } from "@/lib/kernel/jobs/inngest-guard";
import { logEvent } from "@/lib/kernel/observability/log";
import { hepsiburadaStockEventId } from "@/lib/commerce/hepsiburada-sync";
import { trendyolStockEventId } from "@/lib/commerce/trendyol-sync";

/** `applied` stok hareketinden sonra kanal yansıları. `replay` buraya gelmez. Testte kuyruk açılmaz. */
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
  const listings = await createPrismaMarketplaceRepository().listVariantListings(input.storeId, input.variantId);
  if (listings.length === 0) {
    return;
  }
  const { inngest, INNGEST_EVENTS } = await import("@/lib/kernel/jobs/inngest");
  for (const listing of listings) {
    const hepsiburada = listing.channel === "HEPSIBURADA";
    try {
      await inngest.send({
        name: hepsiburada
          ? INNGEST_EVENTS.HEPSIBURADA_STOCK_PUSH_REQUESTED
          : INNGEST_EVENTS.TRENDYOL_STOCK_PUSH_REQUESTED,
        id: hepsiburada
          ? hepsiburadaStockEventId(listing.id, input.onHandAfter, input.amountMinor)
          : trendyolStockEventId(listing.id, input.onHandAfter, input.amountMinor),
        data: {
          listingId: listing.id,
          storeId: input.storeId,
          onHandAfter: input.onHandAfter,
          amountMinor: input.amountMinor,
        },
      });
    } catch (error) {
      logEvent({
        level: "error",
        event: hepsiburada
          ? "commerce.hepsiburada.stock-push.enqueue-failed"
          : "commerce.trendyol.stock-push.enqueue-failed",
        errorName: error instanceof Error ? error.name : "unknown",
        applied: false,
      });
    }
  }
}

export function logTrendyolEnqueueFailure(error: unknown): void {
  logEvent({
    level: "error",
    event: "commerce.trendyol.stock-push.enqueue-failed",
    errorName: error instanceof Error ? error.name : "unknown",
    applied: false,
  });
}
