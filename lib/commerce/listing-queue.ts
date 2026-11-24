/**
 * Set ve stok hareketinden sonra üye ilanlarını PENDING yapar ve itme olayını kurar.
 * Satış kuruşu ilanın kendi fiyatıdır; ilan fiyatı boşsa varyant tutarı geçerlidir.
 */

import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import type { MarketplaceRepository } from "@/lib/commerce/marketplace-repository";

export type QueuedVariantPush = {
  variantId: string;
  onHandAfter: number;
  /** İlan fiyatı doluysa satış kuruşu; boşsa varyant tutarı. */
  amountMinor: number | null;
  /** Varyant tutarı. Kardeş ilanın fiyatı boşsa itme buna düşer. */
  variantAmountMinor?: number | null;
};

export async function queueVariantListingPushes(input: {
  storeId: string;
  pushes: readonly QueuedVariantPush[];
  listVariantListings: MarketplaceRepository["listVariantListings"];
  markListing: MarketplaceRepository["markListing"];
  publish: (push: {
    variantId: string;
    onHandAfter: number;
    amountMinor: number | null;
    variantAmountMinor: number | null;
  }) => Promise<void>;
}): Promise<string[]> {
  const published: string[] = [];
  for (const push of input.pushes) {
    const listings = await input.listVariantListings(input.storeId, push.variantId);
    if (listings.length === 0) {
      continue;
    }
    for (const listing of listings) {
      await input.markListing(listing.id, {
        syncStatus: "PENDING",
        lastError: "",
        lastSyncedAt: listing.lastSyncedAt,
      });
    }
    const priced = listings.find((row) => typeof row.priceMinor === "number" && row.priceMinor > 0);
    const fallback = push.variantAmountMinor !== undefined ? push.variantAmountMinor : push.amountMinor;
    const salePriceMinor = channelListingSaleMinor(priced ?? null, fallback);
    await input.publish({
      variantId: push.variantId,
      onHandAfter: push.onHandAfter,
      amountMinor: salePriceMinor,
      variantAmountMinor: fallback,
    });
    published.push(push.variantId);
  }
  return published;
}

export async function enqueueMovedStock(
  marketplace: Pick<MarketplaceRepository, "listVariantListings" | "markListing">,
  storeId: string,
  pushes: readonly QueuedVariantPush[],
): Promise<void> {
  if (pushes.length === 0) {
    return;
  }
  await queueVariantListingPushes({
    storeId,
    pushes,
    listVariantListings: (storeIdArg, variantId) => marketplace.listVariantListings(storeIdArg, variantId),
    markListing: (listingId, patch) => marketplace.markListing(listingId, patch),
    publish: async (push) => {
      const { publishAppliedTrendyolStock } = await import("@/lib/commerce/trendyol-publish");
      await publishAppliedTrendyolStock({
        storeId,
        variantId: push.variantId,
        onHandAfter: push.onHandAfter,
        amountMinor: push.amountMinor,
        variantAmountMinor: push.variantAmountMinor,
      });
    },
  });
}
