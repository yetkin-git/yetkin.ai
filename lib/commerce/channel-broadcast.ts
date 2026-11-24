import { CHANNEL_STOCK_ADAPTERS, type ChannelFetch, type ChannelPushOutcome } from "@/lib/commerce/channel-adapters";
import type { OsChannelKind } from "@/lib/commerce/os-rules";
import { sellableQty } from "@/lib/commerce/inventory-gate";
import { effectiveSku } from "@/lib/commerce/stock-sync";
import { logEvent } from "@/lib/kernel/observability/log";

export type BroadcastChannel = {
  id: string;
  kind: OsChannelKind;
  status: "DISCONNECTED" | "CONNECTED" | "ERROR";
  apiKey: string | null;
};

/** Yayın için varyant görünümü. Her varyant kendi SKU'su ve stoğuyla gider. */
export type BroadcastVariant = {
  id?: string;
  sku: string;
  onHandQty: number;
  safetyBuffer?: number;
  status?: string;
  barcode?: string | null;
};

/** Yayın için ürün görünümü. `variants` yoksa ürün alanları olduğu gibi kullanılır. */
export type BroadcastProduct = {
  id: string;
  storeId: string;
  sku: string;
  approvedStockQty: number;
  variants?: readonly BroadcastVariant[];
};

export type BroadcastDeps = {
  loadProduct: (productId: string) => Promise<BroadcastProduct | null>;
  loadChannels: (storeId: string) => Promise<BroadcastChannel[]>;
  fetchImpl: ChannelFetch;
  mark: (channelId: string, outcome: ChannelPushOutcome) => Promise<void>;
  /** Kanal ilanındaki pazaryeri barkodu. Kayıt yoksa null. */
  loadRemoteBarcode?: (storeId: string, channel: OsChannelKind, variantId: string) => Promise<string | null>;
};

/** Kanala gidecek satır: varyant SKU'su + **o varyantın** satılabilir adedi. */
export type BroadcastLine = {
  sku: string;
  quantity: number;
  barcode: string | null;
  variantId: string | null;
};

/**
 * Pazaryerine giden kod.
 * Sıra: ilanın `remoteBarcode` kaydı, yoksa varyant barkodu, yoksa sku.
 */
export function resolveMarketplaceCode(input: {
  remoteBarcode?: string | null;
  barcode?: string | null;
  sku: string;
}): string {
  const remote = input.remoteBarcode?.trim() ?? "";
  if (remote) {
    return remote;
  }
  const barcode = input.barcode?.trim() ?? "";
  if (barcode) {
    return barcode;
  }
  return input.sku.trim();
}

/**
 * Yayın satırları.
 *
 * Her aktif varyant kendi SKU'su ve kendi satılabilir adediyle gider (`onHand − güvenlik payı`).
 * Tek bir SKU'ya ürün toplamını yazmak, çok bedenli üründe pazaryerinde yanlış bedeni
 * şişirir. SKU'su boş varyant atlanır; hiç aktif varyant yoksa ürün alanlarına düşülür.
 */
export function broadcastLines(product: BroadcastProduct): BroadcastLine[] {
  const variants = product.variants ?? [];
  const active = variants.filter((row) => (row.status ?? "ACTIVE") === "ACTIVE");
  const lines: BroadcastLine[] = [];
  for (const row of active) {
    const sku = row.sku.trim();
    if (!sku) {
      continue;
    }
    const barcode = row.barcode?.trim() || null;
    lines.push({
      sku,
      quantity: Math.max(0, sellableQty(row.onHandQty, row.safetyBuffer ?? 0)),
      barcode,
      variantId: row.id ?? null,
    });
  }
  if (lines.length > 0) {
    return lines;
  }
  const sku = effectiveSku(product.sku, variants);
  if (!sku) {
    return [];
  }
  return [{ sku, quantity: Math.max(0, product.approvedStockQty), barcode: null, variantId: null }];
}

const SEVERITY: Record<ChannelPushOutcome["status"], number> = {
  PUSHED: 0,
  PENDING_CREDENTIALS: 1,
  FAILED: 2,
};

/** Bir kanalın satır sonuçlarını tek sonuca indirger: en kötü durum kazanır. */
export function mergeOutcomes(kind: OsChannelKind, outcomes: readonly ChannelPushOutcome[]): ChannelPushOutcome {
  if (outcomes.length === 0) {
    return { kind, status: "PUSHED", detail: "Gönderilecek satır yok." };
  }
  const worst = outcomes.reduce((left, right) => (SEVERITY[right.status] > SEVERITY[left.status] ? right : left));
  return {
    kind,
    status: worst.status,
    detail: `${outcomes.length} varyant satırı. ${worst.detail}`,
  };
}

/**
 * Satışı yapan kanal hariç, bağlı kanallara **tüm aktif varyantların** kendi
 * SKU ve stoğunu iletir. Anahtarsız kanal başarı sayılmaz.
 */
export async function broadcastStockToChannels(
  productId: string,
  excludeChannel: OsChannelKind | null,
  deps: BroadcastDeps,
): Promise<ChannelPushOutcome[]> {
  const product = await deps.loadProduct(productId);
  if (!product) {
    return [];
  }
  const lines = broadcastLines(product);
  if (lines.length === 0) {
    return [];
  }
  const channels = await deps.loadChannels(product.storeId);
  const outcomes: ChannelPushOutcome[] = [];
  for (const channel of channels) {
    if (channel.status !== "CONNECTED" || channel.kind === excludeChannel) {
      continue;
    }
    const adapter = CHANNEL_STOCK_ADAPTERS[channel.kind];
    const perLine: ChannelPushOutcome[] = [];
    for (const line of lines) {
      const remote =
        line.variantId && deps.loadRemoteBarcode
          ? await deps.loadRemoteBarcode(product.storeId, channel.kind, line.variantId)
          : null;
      const barcode = resolveMarketplaceCode({
        remoteBarcode: remote,
        barcode: line.barcode,
        sku: line.sku,
      });
      try {
        perLine.push(
          await adapter.push({
            sku: line.sku,
            barcode,
            quantity: line.quantity,
            apiKey: channel.apiKey,
            fetchImpl: deps.fetchImpl,
          }),
        );
      } catch (error) {
        logEvent({
          level: "warn",
          event: "commerce.os.stock_broadcast",
          action: channel.kind,
          reason: "push_threw",
          errorName: error instanceof Error ? error.name : "Error",
        });
        perLine.push({ kind: channel.kind, status: "FAILED", detail: "Kanal isteği tamamlanmadı." });
      }
    }
    const outcome = mergeOutcomes(channel.kind, perLine);
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
