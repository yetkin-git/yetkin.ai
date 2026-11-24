import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AmazonAdapter,
  HepsiburadaAdapter,
  N11Adapter,
  OwnStoreAdapter,
  TrendyolAdapter,
  type ChannelPushOutcome,
} from "@/lib/commerce/channel-adapters";
import { broadcastLines, broadcastStockToChannels, type BroadcastChannel } from "@/lib/commerce/channel-broadcast";
import { sellableQty } from "@/lib/commerce/inventory-gate";
import {
  commitChannelEvent,
  newLedgerId,
  planChannelSale,
  planVariantSale,
  type ChannelCommitInput,
  type StockInboxInsert,
  type StockLedgerSnap,
  type StockProductLock,
  type StockUnitOfWork,
  type VariantMovementInput,
} from "@/lib/commerce/channel-stock-engine";
import { postCommerceChannelWebhook, type ChannelWebhookDeps } from "@/lib/commerce/channel-webhook-handler";
import { sealCommerceCredential } from "@/lib/commerce/credential-seal";
import { signedChannelWebhookRequest, type ChannelWebhookPayload } from "@/lib/commerce/channel-webhook";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";

const ROOT = process.cwd();
const SECRET = "channel-secret-value";

type MemoryVariant = {
  id: string;
  sku: string;
  barcode: string | null;
  onHandQty: number;
  safetyBuffer: number;
  status: string;
  amountMinor: number | null;
};

type ProductState = {
  id: string;
  storeId: string;
  sku: string;
  criticalStockQty: number;
  variants: MemoryVariant[];
};

function approvedTotal(product: ProductState): number {
  return product.variants.reduce((sum, row) => sum + row.onHandQty, 0);
}

/**
 * Bellek UoW — gerçek Prisma işlemcisiyle **aynı** sözleşme:
 * satış, SKU/barkod ile çözülen tek varyanttan düşer; ürün toplamı varyant
 * toplamına senkronlanır. İlk varyanta dağıtım yoktur.
 */
function createBridge(product: ProductState, delayMs = 0) {
  const ledgers: Array<StockLedgerSnap & { channel: string }> = [];
  const inbox: StockInboxInsert[] = [];
  const seen: number[] = [];
  const movements: VariantMovementInput[] = [];
  const tails = new Map<string, Promise<unknown>>();

  function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const prev = tails.get(key) ?? Promise.resolve();
    const run = prev.then(fn, fn);
    tails.set(
      key,
      run.then(
        () => undefined,
        () => undefined,
      ),
    );
    return run;
  }

  function pick(sku: string, barcode?: string | null): MemoryVariant | null {
    if (barcode) {
      const byBarcode = product.variants.find((row) => row.barcode === barcode);
      if (byBarcode) {
        return byBarcode;
      }
    }
    const bySku = product.variants.find((row) => row.sku === sku);
    if (bySku) {
      return bySku;
    }
    return product.variants.find((row) => row.sku === product.sku) ?? null;
  }

  const uow: StockUnitOfWork = {
    async lockProductBySku(storeId, sku, barcode): Promise<StockProductLock | null> {
      if (product.storeId !== storeId) {
        return null;
      }
      const variant = pick(sku, barcode);
      if (!variant && product.sku !== sku) {
        return null;
      }
      return {
        id: product.id,
        storeId: product.storeId,
        sku: product.sku || sku,
        criticalStockQty: product.criticalStockQty,
        variant: variant
          ? {
              id: variant.id,
              sku: variant.sku,
              barcode: variant.barcode,
              onHandQty: variant.onHandQty,
              safetyBuffer: variant.safetyBuffer,
              status: variant.status,
              amountMinor: variant.amountMinor,
            }
          : null,
      };
    },
    async findByIdempotency(key) {
      return ledgers.find((row) => row.idempotencyKey === key) ?? null;
    },
    async findSale(_storeId, channel, externalOrderId) {
      return (
        ledgers.find(
          (row) => row.externalOrderId === externalOrderId && row.type === "CHANNEL_SALE" && row.channel === channel,
        ) ?? null
      );
    },
    async sumRestocked(_storeId, _channel, externalOrderId) {
      return ledgers
        .filter((row) => row.externalOrderId === externalOrderId && row.type === "RETURN_RESTOCK")
        .reduce((sum, row) => sum + Math.max(0, row.quantity), 0);
    },
    async insertLedger(row) {
      const snap: StockLedgerSnap & { channel: string } = {
        id: newLedgerId(),
        type: row.type,
        quantity: row.quantity,
        stockAfter: row.stockAfter,
        note: row.note,
        idempotencyKey: row.idempotencyKey,
        externalOrderId: row.externalOrderId,
        channel: row.channel,
      };
      ledgers.push(snap);
      return snap;
    },
    async applyVariantMovement(input) {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      const index = product.variants.findIndex((row) => row.id === input.variantId);
      const variant = product.variants[index];
      if (!variant) {
        return { outcome: "missing", onHandAfter: 0, productStockAfter: 0, sellableAfter: 0 };
      }
      const available =
        input.direction === "OUT" ? sellableQty(variant.onHandQty, variant.safetyBuffer) : Number.MAX_SAFE_INTEGER;
      if (input.quantity > available) {
        return {
          outcome: "rejected",
          onHandAfter: variant.onHandQty,
          productStockAfter: 0,
          sellableAfter: sellableQty(variant.onHandQty, variant.safetyBuffer),
        };
      }
      movements.push(input);
      variant.onHandQty =
        input.direction === "IN" ? variant.onHandQty + input.quantity : variant.onHandQty - input.quantity;
      const total = approvedTotal(product);
      seen.push(total);
      return {
        outcome: "applied",
        onHandAfter: variant.onHandQty,
        productStockAfter: total,
        sellableAfter: sellableQty(variant.onHandQty, variant.safetyBuffer),
      };
    },
    async insertInbox(row) {
      inbox.push(row);
    },
    async findOrder(_storeId, _channel, externalOrderId) {
      const row = [...inbox].reverse().find((item) => item.kind === "ORDER" && item.externalRef === externalOrderId);
      return row ? { id: row.externalRef, orderStatus: row.orderStatus } : null;
    },
    async updateOrder(id, status) {
      const row = [...inbox].reverse().find((item) => item.kind === "ORDER" && item.externalRef === id);
      if (row) {
        row.orderStatus = status;
      }
    },
  };

  return {
    product,
    ledgers,
    inbox,
    seen,
    movements,
    stockOf(sku: string): number {
      return product.variants.find((row) => row.sku === sku)?.onHandQty ?? -1;
    },
    approved: () => approvedTotal(product),
    commit(input: ChannelCommitInput) {
      return withLock(`${input.storeId}:${input.sku}:${input.barcode ?? ""}`, () => commitChannelEvent(uow, input));
    },
  };
}

function payload(over: Partial<ChannelWebhookPayload> = {}): ChannelWebhookPayload {
  return {
    storeId: "store-1",
    sku: "KALEM",
    externalOrderId: "TY-1001",
    eventType: "ORDER_CREATED",
    quantity: 1,
    customerLabel: "Ayşe",
    ...over,
  };
}

function depsFor(
  bridge: ReturnType<typeof createBridge>,
  fetchImpl: (url: string, init: RequestInit) => Promise<Response>,
  marks: Array<{ id: string; outcome: ChannelPushOutcome }>,
  channels: BroadcastChannel[],
  env: NodeJS.ProcessEnv = { ...process.env, COMMERCE_WEBHOOK_SECRET_TRENDYOL: SECRET },
  apiKeySeal = "",
): ChannelWebhookDeps {
  return {
    env,
    findStore: async (storeId) => (storeId === "store-1" ? { id: "store-1", ownerUserId: "user-1" } : null),
    findChannel: async () => ({ apiKeySeal }),
    commit: (input) => bridge.commit(input),
    broadcast: (productId, excludeChannel) =>
      broadcastStockToChannels(productId, excludeChannel, {
        loadProduct: async (id) =>
          id === bridge.product.id
            ? {
                id: bridge.product.id,
                storeId: bridge.product.storeId,
                sku: bridge.product.sku,
                approvedStockQty: bridge.approved(),
                variants: bridge.product.variants.map((row) => ({
                  sku: row.sku,
                  onHandQty: row.onHandQty,
                  safetyBuffer: row.safetyBuffer,
                  status: row.status,
                  barcode: row.barcode,
                })),
              }
            : null,
        loadChannels: async () => channels,
        fetchImpl,
        mark: async (channelId, outcome) => {
          marks.push({ id: channelId, outcome });
        },
      }),
  };
}

/** S beden 5, XL beden 1 — raporda A2 senaryosunun aynısı. */
function sizeProduct(): ProductState {
  return {
    id: "prod-1",
    storeId: "store-1",
    sku: "TISORT",
    criticalStockQty: 0,
    variants: [
      { id: "v-s", sku: "TISORT-S", barcode: "8680000000011", onHandQty: 5, safetyBuffer: 0, status: "ACTIVE", amountMinor: 25_000 },
      { id: "v-xl", sku: "TISORT-XL", barcode: "8680000000012", onHandQty: 1, safetyBuffer: 0, status: "ACTIVE", amountMinor: 26_000 },
    ],
  };
}

const FANOUT: BroadcastChannel[] = [
  { id: "hb", kind: "HEPSIBURADA", status: "CONNECTED", apiKey: "hb-live-key" },
  { id: "n11", kind: "N11", status: "CONNECTED", apiKey: null },
  { id: "own", kind: "OWN_STORE", status: "CONNECTED", apiKey: null },
  { id: "amz", kind: "AMAZON", status: "DISCONNECTED", apiKey: "amazon-key" },
];

describe("kanal webhook stok köprüsü", () => {
  it("P0.2 — XL satılınca XL düşer, S yerinde kalır; ürün toplamı varyant toplamına eşitlenir", async () => {
    const bridge = createBridge(sizeProduct());
    const urls: string[] = [];
    const marks: Array<{ id: string; outcome: ChannelPushOutcome }> = [];
    const deps = depsFor(
      bridge,
      async (url) => {
        urls.push(url);
        return new Response("{}", { status: 200 });
      },
      marks,
      FANOUT,
    );
    const request = signedChannelWebhookRequest({
      channel: "trendyol",
      secret: SECRET,
      payload: payload({ sku: "TISORT-XL", barcode: "8680000000012", externalOrderId: "TY-XL" }),
    });
    const first = await postCommerceChannelWebhook(deps, request, "trendyol");
    expect(first.status).toBe(200);
    const body = (await first.json()) as {
      ok: boolean;
      data: { replayed: boolean; stockAfter: number; variantId: string; variantSku: string };
    };
    expect(body.data.replayed).toBe(false);
    expect(body.data.variantSku).toBe("TISORT-XL");
    // Stok düşümü doğru bedene yazıldı.
    expect(bridge.stockOf("TISORT-S")).toBe(5);
    expect(bridge.stockOf("TISORT-XL")).toBe(0);
    expect(bridge.approved()).toBe(5);
    expect(body.data.stockAfter).toBe(5);
    // Defter notu varyant kimliğini taşır: iade aynı bedene geri yazar.
    expect(bridge.ledgers[0]?.note).toContain("variant=v-xl");
    expect(bridge.ledgers[0]?.quantity).toBe(-1);
    // Yayın her aktif varyantı kendi SKU'suyla gönderir: S ve XL = 2 satır.
    expect(urls).toHaveLength(2);
    expect(urls.every((url) => url.includes("hepsiburada.com"))).toBe(true);
    expect(marks.find((row) => row.id === "n11")?.outcome.status).toBe("PENDING_CREDENTIALS");
    expect(marks.find((row) => row.id === "own")?.outcome.status).toBe("PUSHED");
    expect(marks.some((row) => row.id === "amz")).toBe(false);
  });

  it("barkod SKU'dan önce gelir; barkod yoksa SKU varyantı çözer", async () => {
    const product = sizeProduct();
    // Barkodu karışık kart: SKU S bedeni gösterir, barkod XL'i işaret eder.
    const bridge = createBridge(product);
    const bySku = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT-S",
      channel: "TRENDYOL",
      eventType: "ORDER_CREATED",
      quantity: 1,
      externalOrderId: "TY-SKU",
      customerLabel: "Müşteri",
    });
    expect(bySku.ok && bySku.variantSku).toBe("TISORT-S");
    const byBarcode = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT-S",
      barcode: "8680000000012",
      channel: "TRENDYOL",
      eventType: "ORDER_CREATED",
      quantity: 1,
      externalOrderId: "TY-BC",
      customerLabel: "Müşteri",
    });
    expect(byBarcode.ok && byBarcode.variantSku).toBe("TISORT-XL");
    expect(bridge.stockOf("TISORT-S")).toBe(4);
    expect(bridge.stockOf("TISORT-XL")).toBe(0);
  });

  it("aynı externalOrderId ve olay ikinci kez stoğu düşürmez", async () => {
    const bridge = createBridge(sizeProduct());
    const deps = depsFor(bridge, async () => new Response("{}", { status: 200 }), [], FANOUT);
    const request = signedChannelWebhookRequest({ channel: "trendyol", secret: SECRET, payload: payload({ sku: "TISORT-S" }) });
    const first = await postCommerceChannelWebhook(deps, request, "trendyol");
    const replayRequest = signedChannelWebhookRequest({
      channel: "trendyol",
      secret: SECRET,
      payload: payload({ sku: "TISORT-S" }),
    });
    const second = await postCommerceChannelWebhook(deps, replayRequest, "trendyol");
    const firstBody = (await first.json()) as { ok: boolean; data: { replayed: boolean; stockAfter: number; ledgerId: string } };
    const secondBody = (await second.json()) as {
      ok: boolean;
      data: { replayed: boolean; stockAfter: number; ledgerId: string; broadcast: unknown[] };
    };
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(firstBody.data.replayed).toBe(false);
    expect(secondBody.data.replayed).toBe(true);
    expect(secondBody.data.ledgerId).toBe(firstBody.data.ledgerId);
    expect(secondBody.data.broadcast).toEqual([]);
    expect(bridge.stockOf("TISORT-S")).toBe(4);
    expect(bridge.ledgers.filter((row) => row.type === "CHANNEL_SALE")).toHaveLength(1);
    expect(bridge.inbox.some((row) => row.kind === "ORDER" && row.orderStatus === "OPEN")).toBe(true);
  });

  it("imzasız isteği 401 ile reddeder; mühürlü anahtar geçer", async () => {
    const bridge = createBridge(sizeProduct());
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      COMMERCE_CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
    };
    const seal = sealCommerceCredential("trendyol-live-key", "apiKey", "store-1", env, "TRENDYOL");
    const deps = depsFor(bridge, async () => new Response("{}", { status: 200 }), [], [], env, seal);
    const denied = await postCommerceChannelWebhook(
      deps,
      new Request("https://yetkin.ai/api/commerce/webhooks/amazon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload({ externalOrderId: "AZ-1" })),
      }),
      "amazon",
    );
    expect(denied.status).toBe(401);
    const accepted = await postCommerceChannelWebhook(
      deps,
      signedChannelWebhookRequest({
        channel: "trendyol",
        secret: "trendyol-live-key",
        payload: payload({ sku: "TISORT-S", externalOrderId: "TY-SEAL" }),
      }),
      "trendyol",
    );
    expect(accepted.status).toBe(200);
    expect(bridge.stockOf("TISORT-S")).toBe(4);
  });

  it("eşzamanlı satışlar aynı bedeni eksiye indirmez", async () => {
    const bridge = createBridge(
      {
        id: "prod-1",
        storeId: "store-1",
        sku: "KALEM",
        criticalStockQty: 1,
        variants: [
          { id: "v-1", sku: "KALEM", barcode: null, onHandQty: 5, safetyBuffer: 0, status: "ACTIVE", amountMinor: 1500 },
        ],
      },
      20,
    );
    const input = (externalOrderId: string): ChannelCommitInput => ({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "KALEM",
      channel: "TRENDYOL",
      eventType: "ORDER_CREATED",
      quantity: 3,
      externalOrderId,
      customerLabel: "Müşteri",
    });
    const [left, right] = await Promise.all([bridge.commit(input("TY-A")), bridge.commit(input("TY-B"))]);
    expect(left.ok && right.ok).toBe(true);
    expect(bridge.stockOf("KALEM")).toBe(0);
    expect(bridge.seen.every((qty) => qty >= 0)).toBe(true);
    expect(bridge.ledgers.map((row) => row.quantity)).toEqual([-3, -2]);
    expect(bridge.inbox.some((row) => row.customerLabel === "Aşırı Satış / Stok Tükendi Uyarısı" && row.priority === 100)).toBe(
      true,
    );
  });

  it("kritik eşiğe inen satış uyarı düşer, iade aynı varyanta geri yazar", async () => {
    const bridge = createBridge({
      id: "prod-1",
      storeId: "store-1",
      sku: "TISORT",
      criticalStockQty: 2,
      variants: [
        { id: "v-s", sku: "TISORT-S", barcode: "8680000000011", onHandQty: 5, safetyBuffer: 0, status: "ACTIVE", amountMinor: 25_000 },
        { id: "v-xl", sku: "TISORT-XL", barcode: "8680000000012", onHandQty: 1, safetyBuffer: 0, status: "ACTIVE", amountMinor: 26_000 },
      ],
    });
    const sale = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT-S",
      channel: "N11",
      eventType: "ORDER_CREATED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(sale.ok && sale.stockAfter).toBe(2);
    expect(bridge.inbox.some((row) => row.customerLabel === "Kritik stok uyarısı" && row.priority === 80)).toBe(true);
    const returned = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT-S",
      channel: "N11",
      eventType: "ORDER_RETURNED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(returned.ok && returned.orderStatus).toBe("RETURNED");
    expect(bridge.stockOf("TISORT-S")).toBe(5);
    expect(bridge.stockOf("TISORT-XL")).toBe(1);
    expect(bridge.ledgers.some((row) => row.type === "RETURN_RESTOCK" && row.quantity === 4)).toBe(true);
    const order = bridge.inbox.find((row) => row.kind === "ORDER");
    expect(order?.orderStatus).toBe("RETURNED");
    const again = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT-S",
      channel: "N11",
      eventType: "ORDER_RETURNED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(again.ok && again.replayed).toBe(true);
    expect(bridge.stockOf("TISORT-S")).toBe(5);
    expect(planChannelSale(1, 5, 4).stockAfter).toBe(0);
    expect(planChannelSale(1, 5, 4).exhausted).toBe(true);
  });

  it("satılan beden hiç eşleşmezse stok yazılmaz; 422 döner", async () => {
    const bridge = createBridge(sizeProduct());
    // Ürün SKU'su çok varyantlı kartta tek başına bedeni belirlemez: dağıtım uydurulmaz.
    const result = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "TISORT",
      channel: "TRENDYOL",
      eventType: "ORDER_CREATED",
      quantity: 1,
      externalOrderId: "TY-AMBIGUOUS",
      customerLabel: "Müşteri",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
    }
    expect(bridge.stockOf("TISORT-S")).toBe(5);
    expect(bridge.stockOf("TISORT-XL")).toBe(1);
    expect(bridge.ledgers).toEqual([]);
  });

  it("anahtarsız kanal HTTP atmaz, anahtarlı kanal gerçek adrese gider", async () => {
    const calls: string[] = [];
    const fetchImpl = async (url: string) => {
      calls.push(url);
      return new Response("{}", { status: 200 });
    };
    const missing = await new N11Adapter().push({ sku: "KALEM", quantity: 3, apiKey: null, fetchImpl });
    expect(missing.status).toBe("PENDING_CREDENTIALS");
    expect(calls).toHaveLength(0);
    const sent = await new N11Adapter().push({ sku: "KALEM", quantity: 3, apiKey: "n11-key", fetchImpl });
    expect(sent.status).toBe("PUSHED");
    expect(calls[0]).toContain("api.n11.com");
    const own = await new OwnStoreAdapter().push({ sku: "KALEM", quantity: 3, apiKey: null, fetchImpl });
    expect(own.status).toBe("PUSHED");
    expect(calls).toHaveLength(1);
    expect(new TrendyolAdapter().kind).toBe("TRENDYOL");
    expect(new HepsiburadaAdapter().kind).toBe("HEPSIBURADA");
    expect(new AmazonAdapter().kind).toBe("AMAZON");
  });

  it("P0.2/A3 — yayın her aktif varyantın kendi SKU'su ve satılabilir stoğuyla gider", async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const outcomes = await broadcastStockToChannels("prod-4", null, {
      loadProduct: async () => ({
        id: "prod-4",
        storeId: "store-1",
        sku: "",
        approvedStockQty: 0,
        variants: [
          { sku: "TISORT-S", onHandQty: 5, safetyBuffer: 1, status: "ACTIVE", barcode: "8680000000011" },
          { sku: "TISORT-XL", onHandQty: 1, safetyBuffer: 0, status: "ACTIVE", barcode: "8680000000012" },
          { sku: "TISORT-M", onHandQty: 4, safetyBuffer: 0, status: "PASSIVE", barcode: "8680000000013" },
        ],
      }),
      loadChannels: async () => [{ id: "n11", kind: "N11", status: "CONNECTED", apiKey: "n11-api-key" }],
      fetchImpl: async (_url, init) => {
        bodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return new Response("{}", { status: 200 });
      },
      mark: async () => undefined,
    });
    expect(outcomes.map((row) => row.status)).toEqual(["PUSHED"]);
    // S: 5−1=4, XL: 1. Pasif beden gönderilmez; toplam tek SKU'ya yığılmaz.
    expect(bodies).toEqual([
      { sku: "TISORT-S", quantity: 4 },
      { sku: "TISORT-XL", quantity: 1 },
    ]);
  });

  it("yayın satırları: aktif varyant yoksa ürün alanlarına düşer", () => {
    expect(
      broadcastLines({
        id: "p",
        storeId: "s",
        sku: "TEK",
        approvedStockQty: 7,
        variants: [],
      }),
    ).toEqual([{ sku: "TEK", quantity: 7, barcode: null, variantId: null }]);
    expect(
      broadcastLines({
        id: "p",
        storeId: "s",
        sku: "",
        approvedStockQty: 9,
        variants: [
          { sku: " ", onHandQty: 9 },
          { sku: "KALEM-B", onHandQty: 3, status: "ACTIVE" },
        ],
      }),
    ).toEqual([{ sku: "KALEM-B", quantity: 3, barcode: null, variantId: null }]);
  });

  it("planVariantSale güvenlik payını satılabilir adetten düşer", () => {
    expect(planVariantSale(5, 1, 4)).toMatchObject({ applied: 4, onHandAfter: 1, sellableAfter: 0, short: false });
    expect(planVariantSale(1, 1, 3)).toMatchObject({ applied: 0, onHandAfter: 1, short: true });
    expect(planVariantSale(6, 0, 2)).toMatchObject({ applied: 2, onHandAfter: 4, sellableAfter: 4, short: false });
  });

  it("rota, şema ve atomik düşüm kapısı durur", () => {
    expect(ROUTE_AUTH_MAP["/api/commerce/webhooks/[channel]"]).toBe("webhook");
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/webhooks/[channel]" && row.status === "hmac",
      ),
    ).toBe(true);
    const route = readFileSync(join(ROOT, "app/api/commerce/webhooks/[channel]/route.ts"), "utf8");
    const prisma = readFileSync(join(ROOT, "lib/commerce/channel-stock-prisma.ts"), "utf8");
    const sql = readFileSync(join(ROOT, "prisma/migrations/20261116140000_commerce_channel_webhook/migration.sql"), "utf8");
    const ui = readFileSync(join(ROOT, "components/commerce/os-cockpit.tsx"), "utf8");
    expect(route).toContain('auth = "webhook"');
    expect(prisma).toContain("$transaction");
    expect(prisma).toContain("FOR UPDATE");
    // Ürün toplamı yazılan hedef değil, varyant toplamının türevi.
    expect(prisma).not.toContain("distributeApprovedTarget");
    expect(prisma).toContain("syncApprovedTotal");
    expect(sql).toContain("stock_ledgers_quantity_signed");
    expect(sql).toContain("external_order_id");
    expect(ui).toContain("Örnek Kanal Siparişi Simüle Et (Trendyol -1 Adet)");
    expect(ui).toContain("SHOW_SIMULATION_CONTROLS");
    expect(ui).toContain('action: "simulate-sale"');
  });
});
