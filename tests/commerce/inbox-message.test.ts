import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCareerDeskPackage,
  commitCareerDesk,
  type CareerDeskMemory,
} from "@/lib/career/desk-brief";
import { deliverChannelReply } from "@/lib/commerce/channel-adapters";
import { signedChannelMessageRequest, type ChannelMessagePayload } from "@/lib/commerce/channel-message";
import { postCommerceChannelMessage, type ChannelMessageDeps } from "@/lib/commerce/channel-message-handler";
import type { ChannelMessageInsert, ChannelMessageRow, ChannelMessageUnit } from "@/lib/commerce/channel-message-engine";
import { adPackageHref, grantDossierHref, isAdEligibleStock } from "@/lib/commerce/os-growth";
import { composeCardReply, replyPrompt, type ReplyCard } from "@/lib/commerce/reply-facts";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";

const ROOT = process.cwd();
const SECRET = "channel-secret-value";

type ProductLink = { id: string; storeId: string; sku: string; externalProductId: string };

function memoryUnit(products: ProductLink[]): { rows: ChannelMessageRow[]; unit: ChannelMessageUnit } {
  const rows: Array<ChannelMessageRow & { key: string }> = [];
  const unit: ChannelMessageUnit = {
    async findByKey(key) {
      return rows.find((row) => row.key === key) ?? null;
    },
    async findProduct(storeId, sku, externalProductId) {
      const hit = products.find(
        (product) =>
          product.storeId === storeId &&
          ((sku.length > 0 && product.sku === sku) ||
            (externalProductId.length > 0 && product.externalProductId === externalProductId)),
      );
      return hit ? { id: hit.id } : null;
    },
    async insert(row: ChannelMessageInsert) {
      if (rows.some((item) => item.key === row.idempotencyKey)) {
        const error = new Error("unique") as Error & { code: string };
        error.code = "P2002";
        throw error;
      }
      const saved = {
        id: `msg-${rows.length + 1}`,
        productId: row.productId,
        eventType: row.eventType,
        externalMessageId: row.externalMessageId,
        key: row.idempotencyKey,
      };
      rows.push(saved);
      return saved;
    },
  };
  return { rows, unit };
}

function deps(
  unit: ChannelMessageUnit,
  env: NodeJS.ProcessEnv = { ...process.env, COMMERCE_WEBHOOK_SECRET_TRENDYOL: SECRET },
): ChannelMessageDeps {
  return {
    env,
    findStore: async (storeId) => (storeId === "store-1" ? { id: "store-1", ownerUserId: "user-1" } : null),
    findChannel: async () => ({ apiKeySeal: "" }),
    messages: unit,
  };
}

function message(over: Partial<ChannelMessagePayload> = {}): ChannelMessagePayload {
  return {
    storeId: "store-1",
    sku: "KALEM",
    externalProductId: "",
    externalMessageId: "TY-Q-1",
    eventType: "CUSTOMER_QUESTION",
    body: "Ölçüsü nedir?",
    customerLabel: "Ayşe",
    ...over,
  };
}

const CARD: ReplyCard = {
  title: "Bez çanta",
  description: "Fiyat 199 TL. Elde yıkanır.",
  otherNote: "",
  attributes: [
    { column: "Ölçü", value: "30 cm" },
    { column: "Özellik", value: "pamuk" },
  ],
  approvedStockQty: 12,
  criticalStockQty: 4,
};

describe("gelen kutu soru ve yorum", () => {
  it("aynı mesaj kimliği ikinci kez satır açmaz ve SKU ile karta bağlar", async () => {
    const memory = memoryUnit([{ id: "prod-1", storeId: "store-1", sku: "KALEM", externalProductId: "REMOTE-9" }]);
    const hook = deps(memory.unit);
    const first = await postCommerceChannelMessage(
      hook,
      signedChannelMessageRequest({ channel: "trendyol", secret: SECRET, payload: message() }),
      "trendyol",
    );
    const second = await postCommerceChannelMessage(
      hook,
      signedChannelMessageRequest({ channel: "trendyol", secret: SECRET, payload: message() }),
      "trendyol",
    );
    const firstBody = (await first.json()) as { ok: boolean; data: { replayed: boolean; productId: string; linked: boolean } };
    const secondBody = (await second.json()) as { ok: boolean; data: { replayed: boolean; entryId: string } };
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(firstBody.data.replayed).toBe(false);
    expect(firstBody.data.linked).toBe(true);
    expect(firstBody.data.productId).toBe("prod-1");
    expect(secondBody.data.replayed).toBe(true);
    expect(secondBody.data.entryId).toBe("msg-1");
    expect(memory.rows).toHaveLength(1);
  });

  it("dış ürün kimliğiyle bağlar, imzasızı yazmaz", async () => {
    const memory = memoryUnit([{ id: "prod-2", storeId: "store-1", sku: "DIGER", externalProductId: "REMOTE-9" }]);
    const hook = deps(memory.unit);
    const linked = await postCommerceChannelMessage(
      hook,
      signedChannelMessageRequest({
        channel: "trendyol",
        secret: SECRET,
        payload: message({ sku: "", externalProductId: "REMOTE-9", eventType: "PRODUCT_REVIEW", externalMessageId: "TY-R-1" }),
      }),
      "trendyol",
    );
    const linkedBody = (await linked.json()) as { data: { productId: string; eventType: string } };
    expect(linkedBody.data.productId).toBe("prod-2");
    expect(linkedBody.data.eventType).toBe("PRODUCT_REVIEW");
    const denied = await postCommerceChannelMessage(
      hook,
      signedChannelMessageRequest({ channel: "trendyol", secret: "yanlis-sirr", payload: message({ externalMessageId: "TY-Q-2" }) }),
      "trendyol",
    );
    expect(denied.status).toBe(401);
    expect(memory.rows).toHaveLength(1);
  });

  it("rota imza ister", () => {
    expect(ROUTE_AUTH_MAP["/api/commerce/webhooks/[channel]/messages"]).toBe("webhook");
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/webhooks/[channel]/messages" && row.status === "hmac",
      ),
    ).toBe(true);
    const route = readFileSync(join(ROOT, "app/api/commerce/webhooks/[channel]/messages/route.ts"), "utf8");
    expect(route).toContain('auth = "webhook"');
  });
});

describe("ürün kartından yanıt", () => {
  it("özellik, ölçü, kullanım ve stoğu alır; fiyatı yemez", async () => {
    const prompt = replyPrompt(CARD, "Kaç para ve kaç günde gelir?");
    expect(prompt.user).toContain("30 cm");
    expect(prompt.user).toContain("pamuk");
    expect(prompt.user).toContain("Elde yıkanır");
    expect(prompt.user).toContain("Onaylı stok 12 adet");
    expect(prompt.user).not.toContain("199");
    expect(prompt.system).toContain("uydurma");
    const text = await composeCardReply(CARD, "Kaç para?", async () => "Bu ürün 199 TL, yarın kargoda.");
    expect(text).toContain("30 cm");
    expect(text).toContain("Elde yıkanır");
    expect(text).not.toMatch(/199|₺|kuruş/i);
    expect(text.toLowerCase()).not.toContain("tl");
  });

  it("kimlik yoksa kanal başarısı basmaz", async () => {
    let called = 0;
    const pending = await deliverChannelReply("TRENDYOL", {
      externalMessageId: "TY-Q-1",
      body: "Ölçü 30 cm.",
      apiKey: null,
      fetchImpl: async () => {
        called += 1;
        return new Response("{}", { status: 200 });
      },
    });
    expect(pending.status).toBe("PENDING_CREDENTIALS");
    expect(called).toBe(0);
    const failed = await deliverChannelReply("TRENDYOL", {
      externalMessageId: "TY-Q-1",
      body: "Ölçü 30 cm.",
      apiKey: "seller-key-value",
      fetchImpl: async () => new Response("no", { status: 503 }),
    });
    expect(failed.status).toBe("FAILED");
    const pushed = await deliverChannelReply("OWN_STORE", {
      externalMessageId: "local-1",
      body: "Ölçü 30 cm.",
      apiKey: null,
      fetchImpl: async () => {
        throw new Error("vitrin dışarı çıkmaz");
      },
    });
    expect(pushed.status).toBe("PUSHED");
  });
});

describe("kariyer çalışma odası aktarımı", () => {
  it("görev paketini odaya yazar, kamu ilanı açmaz", () => {
    const pack = buildCareerDeskPackage({
      kind: "PHOTO_STUDIO",
      productTitle: "Bez çanta",
      sku: "BEZ",
      approvedStockQty: 12,
    });
    const memory: CareerDeskMemory = { tasks: [], inbox: [], freelancerJobs: [] };
    const first = commitCareerDesk(memory, {
      id: "task-1",
      inboxEntryId: "inbox-1",
      userId: "user-1",
      productId: "prod-1",
      pack,
    });
    const second = commitCareerDesk(memory, {
      id: "task-2",
      inboxEntryId: "inbox-2",
      userId: "user-1",
      productId: "prod-1",
      pack,
    });
    expect(pack.href).toBe("/career#calisma-odasi");
    expect(pack.brief).toContain("Fotoğraf & Görsel Stüdyo");
    expect(pack.freelancerJob).toBeNull();
    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(second.freelancerJob).toBeNull();
    expect(memory.tasks).toHaveLength(1);
    expect(memory.inbox).toHaveLength(1);
    expect(memory.freelancerJobs).toEqual([]);
    const service = readFileSync(join(ROOT, "lib/commerce/os-service.ts"), "utf8");
    expect(service).toContain("careerDeskTask.create");
    expect(service).not.toContain("freelancerJob");
  });

  it("reklam eşiği üç kattır ve hibe adresi dosya hazırlayıcıya gider", () => {
    expect(isAdEligibleStock(15, 5)).toBe(true);
    expect(isAdEligibleStock(14, 5)).toBe(false);
    expect(isAdEligibleStock(30, 0)).toBe(false);
    const href = adPackageHref({ storeName: "E-Ticaret Havuzu", title: "Bez çanta", sku: "BEZ", approvedStockQty: 15 });
    expect(href).toContain("tool=reklam");
    expect(href).toContain("Bez");
    expect(href).not.toMatch(/tl|kuruş|₺/i);
    expect(grantDossierHref("E-Ticaret Havuzu")).toContain("tool=hibe");
    expect(grantDossierHref("E-Ticaret Havuzu")).toContain("investmentFocus=ihracat");
  });
});
