import { canSendInngestEvents } from "@/lib/kernel/jobs/inngest-guard";
import { logEvent } from "@/lib/kernel/observability/log";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { hepsiburadaStockEventId } from "@/lib/commerce/hepsiburada-sync";
import { trendyolStockEventId } from "@/lib/commerce/trendyol-sync";

/** `applied` stok hareketinden sonra kanal yansıları. `replay` buraya gelmez. Testte kuyruk açılmaz. */
export async function publishAppliedTrendyolStock(input: {
  storeId: string;
  variantId: string;
  onHandAfter: number;
  /** Olay tutarı. İlan fiyatı boşsa yedek budur. */
  amountMinor: number | null;
  /** Varyant tutarı. İlan fiyatı boş olan kardeş ilan bu kuruşa düşer. */
  variantAmountMinor?: number | null;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  const env = input.env ?? process.env;
  if (env.NODE_ENV === "test" || !canSendInngestEvents(env)) {
    return;
  }
  const { createPrismaMarketplaceRepository } = await import("@/lib/commerce/marketplace-prisma");
  const listings = await createPrismaMarketplaceRepository().listVariantListings(input.storeId, input.variantId);
  if (listings.length === 0) {
    return;
  }
  const { inngest, INNGEST_EVENTS } = await import("@/lib/kernel/jobs/inngest");
  const fallback = input.variantAmountMinor !== undefined ? input.variantAmountMinor : input.amountMinor;
  for (const listing of listings) {
    const saleMinor = channelListingSaleMinor(listing, fallback);
    if (saleMinor == null) {
      continue;
    }
    const hepsiburada = listing.channel === "HEPSIBURADA";
    try {
      await inngest.send({
        name: hepsiburada
          ? INNGEST_EVENTS.HEPSIBURADA_STOCK_PUSH_REQUESTED
          : INNGEST_EVENTS.TRENDYOL_STOCK_PUSH_REQUESTED,
        id: hepsiburada
          ? hepsiburadaStockEventId(listing.id, input.onHandAfter, saleMinor)
          : trendyolStockEventId(listing.id, input.onHandAfter, saleMinor),
        data: {
          listingId: listing.id,
          storeId: input.storeId,
          onHandAfter: input.onHandAfter,
          amountMinor: saleMinor,
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

/** Tek kanalın ilan fiyatını kuyruğa koyar. Testte ve anahtarsız ortamda susar. */
export async function publishChannelListingPrice(input: {
  storeId: string;
  variantId: string;
  channel: "TRENDYOL" | "HEPSIBURADA";
  onHandAfter: number;
  amountMinor: number;
  env?: NodeJS.ProcessEnv;
}): Promise<void> {
  const env = input.env ?? process.env;
  if (env.NODE_ENV === "test" || !canSendInngestEvents(env)) {
    return;
  }
  const { createPrismaMarketplaceRepository } = await import("@/lib/commerce/marketplace-prisma");
  const listings = await createPrismaMarketplaceRepository().listVariantListings(input.storeId, input.variantId);
  const listing = listings.find((row) => row.channel === input.channel);
  if (!listing) {
    return;
  }
  const saleMinor = channelListingSaleMinor(listing, input.amountMinor);
  if (saleMinor == null) {
    return;
  }
  const { inngest, INNGEST_EVENTS } = await import("@/lib/kernel/jobs/inngest");
  const hepsiburada = input.channel === "HEPSIBURADA";
  try {
    await inngest.send({
      name: hepsiburada ? INNGEST_EVENTS.HEPSIBURADA_STOCK_PUSH_REQUESTED : INNGEST_EVENTS.TRENDYOL_STOCK_PUSH_REQUESTED,
      id: hepsiburada
        ? hepsiburadaStockEventId(listing.id, input.onHandAfter, saleMinor)
        : trendyolStockEventId(listing.id, input.onHandAfter, saleMinor),
      data: {
        listingId: listing.id,
        storeId: input.storeId,
        onHandAfter: input.onHandAfter,
        amountMinor: saleMinor,
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

export function logTrendyolEnqueueFailure(error: unknown): void {
  logEvent({
    level: "error",
    event: "commerce.trendyol.stock-push.enqueue-failed",
    errorName: error instanceof Error ? error.name : "unknown",
    applied: false,
  });
}
