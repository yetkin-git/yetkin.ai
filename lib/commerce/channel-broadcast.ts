import { CHANNEL_STOCK_ADAPTERS, type ChannelFetch, type ChannelPushOutcome } from "@/lib/commerce/channel-adapters";
import type { OsChannelKind } from "@/lib/commerce/os-rules";
import { logEvent } from "@/lib/kernel/observability/log";

export type BroadcastChannel = {
  id: string;
  kind: OsChannelKind;
  status: "DISCONNECTED" | "CONNECTED" | "ERROR";
  apiKey: string | null;
};

export type BroadcastDeps = {
  loadProduct: (productId: string) => Promise<{ id: string; storeId: string; sku: string; approvedStockQty: number } | null>;
  loadChannels: (storeId: string) => Promise<BroadcastChannel[]>;
  fetchImpl: ChannelFetch;
  mark: (channelId: string, outcome: ChannelPushOutcome) => Promise<void>;
};

/** Satışı yapan kanal hariç, bağlı kanallara onaylı stoğu iletir. Anahtarsız kanal başarı sayılmaz. */
export async function broadcastStockToChannels(
  productId: string,
  excludeChannel: OsChannelKind | null,
  deps: BroadcastDeps,
): Promise<ChannelPushOutcome[]> {
  const product = await deps.loadProduct(productId);
  if (!product) {
    return [];
  }
  const channels = await deps.loadChannels(product.storeId);
  const outcomes: ChannelPushOutcome[] = [];
  for (const channel of channels) {
    if (channel.status !== "CONNECTED" || channel.kind === excludeChannel) {
      continue;
    }
    const adapter = CHANNEL_STOCK_ADAPTERS[channel.kind];
    const outcome = await adapter.push({
      sku: product.sku,
      quantity: product.approvedStockQty,
      apiKey: channel.apiKey,
      fetchImpl: deps.fetchImpl,
    });
    outcomes.push(outcome);
    logEvent({
      level: outcome.status === "PUSHED" ? "info" : "warn",
      event: "commerce.os.stock_broadcast",
      action: outcome.kind,
      reason: outcome.status,
    });
    try {
      await deps.mark(channel.id, outcome);
    } catch (error) {
      logEvent({
        level: "warn",
        event: "commerce.os.stock_broadcast",
        action: outcome.kind,
        reason: "mark_failed",
        errorName: error instanceof Error ? error.name : "Error",
      });
    }
  }
  return outcomes;
}
