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
import { broadcastStockToChannels, type BroadcastChannel } from "@/lib/commerce/channel-broadcast";
import {
  commitChannelEvent,
  newLedgerId,
  planChannelSale,
  type ChannelCommitInput,
  type StockInboxInsert,
  type StockLedgerSnap,
  type StockUnitOfWork,
} from "@/lib/commerce/channel-stock-engine";
import { postCommerceChannelWebhook, type ChannelWebhookDeps } from "@/lib/commerce/channel-webhook-handler";
import { sealCommerceCredential } from "@/lib/commerce/credential-seal";
import { signedChannelWebhookRequest, type ChannelWebhookPayload } from "@/lib/commerce/channel-webhook";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";

const ROOT = process.cwd();
const SECRET = "channel-secret-value";

type ProductState = {
  id: string;
  storeId: string;
  sku: string;
  approvedStockQty: number;
  criticalStockQty: number;
  variantSkus: string[];
};

function createBridge(product: ProductState, delayMs = 0) {
  const ledgers: Array<StockLedgerSnap & { channel: string }> = [];
  const inbox: StockInboxInsert[] = [];
  const seen: number[] = [];
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

  const uow: StockUnitOfWork = {
    async lockProductBySku(storeId, sku) {
      if (product.storeId !== storeId) {
        return null;
      }
      if (product.sku !== sku && !product.variantSkus.includes(sku)) {
        return null;
      }
      return {
        id: product.id,
        storeId: product.storeId,
        sku: product.sku || sku,
        approvedStockQty: product.approvedStockQty,
        criticalStockQty: product.criticalStockQty,
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
    async setApprovedStock(_productId, quantity) {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      product.approvedStockQty = quantity;
      seen.push(quantity);
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
    commit(input: ChannelCommitInput) {
      return withLock(`${input.storeId}:${input.sku}`, () => commitChannelEvent(uow, input));
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
                approvedStockQty: bridge.product.approvedStockQty,
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

const FANOUT: BroadcastChannel[] = [
  { id: "hb", kind: "HEPSIBURADA", status: "CONNECTED", apiKey: "hb-live-key" },
  { id: "n11", kind: "N11", status: "CONNECTED", apiKey: null },
  { id: "own", kind: "OWN_STORE", status: "CONNECTED", apiKey: null },
  { id: "amz", kind: "AMAZON", status: "DISCONNECTED", apiKey: "amazon-key" },
];

describe("kanal webhook stok köprüsü", () => {
  it("aynı externalOrderId ve olay ikinci kez stoğu düşürmez", async () => {
    const bridge = createBridge({
      id: "prod-1",
      storeId: "store-1",
      sku: "KALEM",
      approvedStockQty: 5,
      criticalStockQty: 0,
      variantSkus: [],
    });
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
    const request = signedChannelWebhookRequest({ channel: "trendyol", secret: SECRET, payload: payload() });
    const first = await postCommerceChannelWebhook(deps, request, "trendyol");
    const replayRequest = signedChannelWebhookRequest({ channel: "trendyol", secret: SECRET, payload: payload() });
    const second = await postCommerceChannelWebhook(deps, replayRequest, "trendyol");
    const firstBody = (await first.json()) as { ok: boolean; data: { replayed: boolean; stockAfter: number; ledgerId: string } };
    const secondBody = (await second.json()) as { ok: boolean; data: { replayed: boolean; stockAfter: number; ledgerId: string; broadcast: unknown[] } };
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(firstBody.data.replayed).toBe(false);
    expect(secondBody.data.replayed).toBe(true);
    expect(secondBody.data.ledgerId).toBe(firstBody.data.ledgerId);
    expect(secondBody.data.broadcast).toEqual([]);
    expect(bridge.product.approvedStockQty).toBe(4);
    expect(bridge.ledgers.filter((row) => row.type === "CHANNEL_SALE")).toHaveLength(1);
    expect(bridge.ledgers[0]?.quantity).toBe(-1);
    expect(bridge.ledgers[0]?.externalOrderId).toBe("TY-1001");
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("hepsiburada.com");
    expect(marks.find((row) => row.id === "n11")?.outcome.status).toBe("PENDING_CREDENTIALS");
    expect(marks.find((row) => row.id === "own")?.outcome.status).toBe("PUSHED");
    expect(marks.some((row) => row.id === "amz")).toBe(false);
    expect(bridge.inbox.some((row) => row.kind === "ORDER" && row.orderStatus === "OPEN")).toBe(true);
  });

  it("imzasız isteği 401 ile reddeder; mühürlü anahtar geçer", async () => {
    const bridge = createBridge({
      id: "prod-1",
      storeId: "store-1",
      sku: "KALEM",
      approvedStockQty: 3,
      criticalStockQty: 0,
      variantSkus: [],
    });
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
        payload: payload({ externalOrderId: "TY-SEAL" }),
      }),
      "trendyol",
    );
    expect(accepted.status).toBe(200);
    expect(bridge.product.approvedStockQty).toBe(2);
  });

  it("eşzamanlı satışlar stoğu eksiye indirmez", async () => {
    const bridge = createBridge(
      {
        id: "prod-1",
        storeId: "store-1",
        sku: "KALEM",
        approvedStockQty: 5,
        criticalStockQty: 1,
        variantSkus: [],
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
    expect(bridge.product.approvedStockQty).toBe(0);
    expect(bridge.seen.every((qty) => qty >= 0)).toBe(true);
    expect(bridge.ledgers.map((row) => row.quantity)).toEqual([-3, -3]);
    expect(bridge.inbox.some((row) => row.customerLabel === "Aşırı Satış / Stok Tükendi Uyarısı" && row.priority === 100)).toBe(
      true,
    );
  });

  it("kritik eşiğe inen satış uyarı düşer, iade stoğu geri yazar", async () => {
    const bridge = createBridge({
      id: "prod-1",
      storeId: "store-1",
      sku: "KALEM",
      approvedStockQty: 8,
      criticalStockQty: 5,
      variantSkus: ["KALEM"],
    });
    const sale = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "KALEM",
      channel: "N11",
      eventType: "ORDER_CREATED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(sale.ok && sale.stockAfter).toBe(4);
    expect(bridge.inbox.some((row) => row.customerLabel === "Kritik stok uyarısı" && row.priority === 80)).toBe(true);
    const returned = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "KALEM",
      channel: "N11",
      eventType: "ORDER_RETURNED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(returned.ok && returned.orderStatus).toBe("RETURNED");
    expect(bridge.product.approvedStockQty).toBe(8);
    expect(bridge.ledgers.some((row) => row.type === "RETURN_RESTOCK" && row.quantity === 4)).toBe(true);
    const order = bridge.inbox.find((row) => row.kind === "ORDER");
    expect(order?.orderStatus).toBe("RETURNED");
    const again = await bridge.commit({
      storeId: "store-1",
      actorUserId: "user-1",
      sku: "KALEM",
      channel: "N11",
      eventType: "ORDER_RETURNED",
      quantity: 4,
      externalOrderId: "N11-9",
      customerLabel: "Müşteri",
    });
    expect(again.ok && again.replayed).toBe(true);
    expect(bridge.product.approvedStockQty).toBe(8);
    expect(planChannelSale(1, 5, 4).stockAfter).toBe(0);
    expect(planChannelSale(1, 5, 4).exhausted).toBe(true);
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
    expect(sql).toContain("stock_ledgers_quantity_signed");
    expect(sql).toContain("external_order_id");
    expect(ui).toContain("Örnek Kanal Siparişi Simüle Et (Trendyol -1 Adet)");
    expect(ui).toContain('action: "simulate-sale"');
  });
});
