/**
 * PENDING ilan taraması.
 *
 * REPRICE ve stok hareketi ilanı PENDING yapar ve olayı kuyruğa koyar.
 * Olay düşerse bu tarama aynı Trendyol / Hepsiburada itmesini yeniden dener
 * ve sonucu SYNCED ya da FAILED yazar.
 */

import "server-only";

import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { getPrisma } from "@/lib/kernel/db";
import { liveHepsiburadaPorts } from "@/lib/commerce/hepsiburada-live";
import {
  markHepsiburadaListingFailed,
  pushHepsiburadaListingStock,
} from "@/lib/commerce/hepsiburada-sync";
import { liveTrendyolPorts } from "@/lib/commerce/trendyol-live";
import { markTrendyolListingFailed, pushTrendyolListingStock } from "@/lib/commerce/trendyol-sync";

export type PendingListingRow = {
  id: string;
  storeId: string;
  channel: "TRENDYOL" | "HEPSIBURADA";
  variantId: string;
  priceMinor?: number | null;
};

export type PendingListingSyncResult = {
  scanned: number;
  synced: number;
  pending: number;
  failed: number;
};

const SCAN_LIMIT = 100;

export async function syncPendingChannelListings(deps: {
  listPending: () => Promise<PendingListingRow[]>;
  readVariant: (
    storeId: string,
    variantId: string,
  ) => Promise<{ onHandQty: number; amountMinor: number | null } | null>;
  push: (
    listing: PendingListingRow,
    variant: { onHandQty: number; amountMinor: number },
  ) => Promise<"SYNCED" | "PENDING" | "FAILED">;
}): Promise<PendingListingSyncResult> {
  const listings = await deps.listPending();
  let synced = 0;
  let pending = 0;
  let failed = 0;
  for (const listing of listings) {
    const variant = await deps.readVariant(listing.storeId, listing.variantId);
    if (!variant) {
      pending += 1;
      continue;
    }
    const amountMinor = channelListingSaleMinor(listing, variant.amountMinor);
    if (amountMinor == null) {
      pending += 1;
      continue;
    }
    const status = await deps.push(listing, { onHandQty: variant.onHandQty, amountMinor });
    if (status === "SYNCED") {
      synced += 1;
    } else if (status === "FAILED") {
      failed += 1;
    } else {
      pending += 1;
    }
  }
  return { scanned: listings.length, synced, pending, failed };
}

export async function runPendingChannelListingSync(): Promise<PendingListingSyncResult> {
  const prisma = getPrisma();
  const trendyol = liveTrendyolPorts();
  const hepsiburada = liveHepsiburadaPorts();
  return syncPendingChannelListings({
    listPending: async () => {
      const rows = await prisma.commerceChannelListing.findMany({
        where: { syncStatus: "PENDING", channel: { in: ["TRENDYOL", "HEPSIBURADA"] } },
        select: { id: true, storeId: true, channel: true, variantId: true, priceMinor: true },
        orderBy: { updatedAt: "asc" },
        take: SCAN_LIMIT,
      });
      return rows.flatMap((row) =>
        row.channel === "TRENDYOL" || row.channel === "HEPSIBURADA"
          ? [
              {
                id: row.id,
                storeId: row.storeId,
                channel: row.channel,
                variantId: row.variantId,
                priceMinor: row.priceMinor,
              },
            ]
          : [],
      );
    },
    readVariant: (storeId, variantId) =>
      prisma.commerceVariant.findFirst({
        where: { id: variantId, storeId },
        select: { onHandQty: true, amountMinor: true },
      }),
    push: async (listing, variant) => {
      const data = {
        listingId: listing.id,
        storeId: listing.storeId,
        onHandAfter: variant.onHandQty,
        amountMinor: variant.amountMinor,
      };
      try {
        if (listing.channel === "HEPSIBURADA") {
          const result = await pushHepsiburadaListingStock(hepsiburada, data);
          return result.syncStatus;
        }
        const result = await pushTrendyolListingStock(trendyol, data);
        return result.syncStatus;
      } catch (error) {
        const message = error instanceof Error ? error.message : "İlan eşitlemesi tamamlanmadı.";
        if (listing.channel === "HEPSIBURADA") {
          await markHepsiburadaListingFailed(hepsiburada, { ...data, message });
        } else {
          await markTrendyolListingFailed(trendyol, { ...data, message });
        }
        return "FAILED";
      }
    },
  });
}
