import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { channelItemCode, TrendyolAdapter } from "@/lib/commerce/channel-adapters";
import { broadcastStockToChannels, resolveMarketplaceCode } from "@/lib/commerce/channel-broadcast";
import { campaignPreviewInput } from "@/lib/commerce/campaign-preview";
import {
  formatTripleCredential,
  webhookSecretFromBroadcastKey,
} from "@/lib/commerce/channel-credentials";
import { collectChannelWebhookSecrets } from "@/lib/commerce/channel-webhook";
import { sealCommerceCredential } from "@/lib/commerce/credential-seal";
import { simulateCampaign } from "@/lib/commerce/profit";
import { simulationBroadcastNote } from "@/lib/commerce/os-service";
import { syncPendingChannelListings } from "@/lib/commerce/pending-listing-sync";
import { planSetMemberDraws } from "@/lib/commerce/set-stock";
import { bundleMembersAttribute } from "@/lib/commerce/set-catalog";
import {
  criticalRestockVariantId,
  resolveInboundVariant,
  restockTargetNote,
} from "@/lib/commerce/stock-sync";

const ROOT = process.cwd();
const ENV = {
  NODE_ENV: "test",
  COMMERCE_CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 9).toString("base64"),
} as NodeJS.ProcessEnv;

describe("N1 — yayın kimliği ve barkod", () => {
  it("üçlü mühür metni satıcı:anahtar:sır biçimindedir", () => {
    expect(
      formatTripleCredential({ supplierId: "27380001", apiKey: "api-key-1", apiSecret: "api-secret-1" }),
    ).toBe("27380001:api-key-1:api-secret-1");
  });

  it("webhook sırrı üçlünün API anahtarıdır", () => {
    const storeId = "store-seal";
    const triple = "27380001:trendyol-api-key-1:secret-value-1";
    const seal = sealCommerceCredential(triple, "apiKey", storeId, ENV, "TRENDYOL");
    const secrets = collectChannelWebhookSecrets({
      env: ENV,
      storeId,
      ownerUserId: "owner-1",
      kind: "TRENDYOL",
      simOwner: "",
      apiKeySeal: seal,
    });
    expect(secrets.ok).toBe(true);
    if (!secrets.ok) {
      return;
    }
    expect(secrets.secrets).toContain("trendyol-api-key-1");
    expect(secrets.secrets).not.toContain(triple);
    expect(webhookSecretFromBroadcastKey(triple)).toBe("trendyol-api-key-1");
    expect(webhookSecretFromBroadcastKey("plain-api-key")).toBe("plain-api-key");
  });

  it("barkod sırası uzak kayıt, yerel barkod, sku", () => {
    expect(resolveMarketplaceCode({ remoteBarcode: "868111", barcode: "868222", sku: "SKU-1" })).toBe("868111");
    expect(resolveMarketplaceCode({ remoteBarcode: "  ", barcode: "868222", sku: "SKU-1" })).toBe("868222");
    expect(resolveMarketplaceCode({ barcode: null, sku: "SKU-1" })).toBe("SKU-1");
    expect(channelItemCode({ sku: "SKU-1", barcode: "868111" })).toBe("868111");
  });

  it("Trendyol yayını üçlü kimlik ve uzak barkodla gider", async () => {
    const bodies: Array<Record<string, unknown>> = [];
    let auth = "";
    let url = "";
    const outcomes = await broadcastStockToChannels("prod-1", null, {
      loadProduct: async () => ({
        id: "prod-1",
        storeId: "store-1",
        sku: "TISORT",
        approvedStockQty: 4,
        variants: [
          { id: "v-xl", sku: "TISORT-XL", onHandQty: 2, safetyBuffer: 0, status: "ACTIVE", barcode: "8680000000012" },
        ],
      }),
      loadChannels: async () => [
        {
          id: "ty",
          kind: "TRENDYOL",
          status: "CONNECTED",
          apiKey: "27380001:api-key-value:api-secret-value",
        },
      ],
      loadRemoteBarcode: async () => "TY-REMOTE-XL",
      fetchImpl: async (target, init) => {
        url = target;
        auth = new Headers(init.headers).get("authorization") ?? "";
        bodies.push(JSON.parse(String(init.body)) as Record<string, unknown>);
        return new Response("{}", { status: 200 });
      },
      mark: async () => undefined,
    });
    expect(outcomes[0]?.status).toBe("PUSHED");
    expect(url).toContain("/sellers/27380001/");
    expect(auth.startsWith("Basic ")).toBe(true);
    expect(bodies).toEqual([{ items: [{ barcode: "TY-REMOTE-XL", quantity: 2 }] }]);
    const direct = await new TrendyolAdapter().push({
      sku: "TISORT-XL",
      barcode: "8680000000012",
      quantity: 2,
      apiKey: "27380001:api-key-value:api-secret-value",
      fetchImpl: async () => new Response("{}", { status: 200 }),
    });
    expect(direct.status).toBe("PUSHED");
  });
});

describe("N2 — PENDING ilan taraması", () => {
  it("SYNCED, PENDING ve FAILED sayılır", async () => {
    const pushed: string[] = [];
    const result = await syncPendingChannelListings({
      listPending: async () => [
        { id: "l-1", storeId: "s", channel: "TRENDYOL", variantId: "v-1" },
        { id: "l-2", storeId: "s", channel: "HEPSIBURADA", variantId: "v-2" },
        { id: "l-3", storeId: "s", channel: "TRENDYOL", variantId: "v-3" },
        { id: "l-4", storeId: "s", channel: "TRENDYOL", variantId: "v-4" },
      ],
      readVariant: async (_storeId, variantId) => {
        if (variantId === "v-4") {
          return { onHandQty: 1, amountMinor: null };
        }
        return { onHandQty: 3, amountMinor: 18_223 };
      },
      push: async (listing) => {
        pushed.push(listing.id);
        if (listing.id === "l-2") {
          return "FAILED";
        }
        if (listing.id === "l-3") {
          return "PENDING";
        }
        return "SYNCED";
      },
    });
    expect(pushed).toEqual(["l-1", "l-2", "l-3"]);
    expect(result).toEqual({ scanned: 4, synced: 1, pending: 2, failed: 1 });
  });

  it("inngest 15 dakikalık taramayı taşır", () => {
    const jobs = readFileSync(join(ROOT, "lib/kernel/jobs/inngest.ts"), "utf8");
    expect(jobs).toContain('id: "commerce-pending-listing-sync"');
    expect(jobs).toContain("TZ=Europe/Istanbul */15 * * * *");
    expect(jobs).toContain("runPendingChannelListingSync");
  });
});

describe("N3 — set üye planı", () => {
  it("her üyeden set adedi kadar, anahtarı üye başına türetir", () => {
    const plan = planSetMemberDraws({
      attributes: [bundleMembersAttribute(["v-a", "v-b", "v-a"])],
      quantity: 2,
      idempotencyKey: "sale-1",
      note: "Kanal",
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) {
      return;
    }
    expect(plan.draws.map((row) => row.variantId)).toEqual(["v-a", "v-b"]);
    expect(plan.draws.every((row) => row.quantity === 2)).toBe(true);
    expect(plan.draws[0]?.idempotencyKey).toBe("sale-1:set:v-a");
  });
});

describe("N4 — hedef varyantlı stok girişi", () => {
  it("en düşük satılabilir beden kazanır ve onay o bedene gider", () => {
    const variantId = criticalRestockVariantId([
      { id: "v-s", onHandQty: 6, safetyBuffer: 0 },
      { id: "v-xl", onHandQty: 0, safetyBuffer: 0 },
    ]);
    expect(variantId).toBe("v-xl");
    const note = restockTargetNote(variantId ?? "");
    const resolved = resolveInboundVariant(
      [
        { id: "v-s", status: "ACTIVE" },
        { id: "v-xl", status: "PASSIVE" },
      ],
      note,
    );
    expect(resolved).toEqual({ ok: true, variant: { id: "v-xl", status: "PASSIVE" } });
    const missing = resolveInboundVariant([{ id: "v-s", status: "ACTIVE" }], note);
    expect(missing).toEqual({ ok: false, reason: "missing-target" });
    const fallback = resolveInboundVariant(
      [
        { id: "v-s", status: "ACTIVE" },
        { id: "v-xl", status: "PASSIVE" },
      ],
      "",
    );
    expect(fallback.ok && fallback.variant.id).toBe("v-s");
    const service = readFileSync(join(ROOT, "lib/commerce/os-service.ts"), "utf8");
    expect(service).toContain("resolveInboundVariant(product.variants, draft.note)");
    expect(service).toContain("Hedef varyant bu üründe yok.");
  });
});

describe("N5 — kampanya istemi TL ve yüzde konuşur", () => {
  it("prompt kuruş ve baz puan sayısını modele vermez", () => {
    const source = readFileSync(join(ROOT, "lib/commerce/campaign-engine.ts"), "utf8");
    expect(source).not.toContain("Satış fiyatı kuruş");
    expect(source).not.toContain("İndirim baz puan");
    expect(source).toContain("Rakamları yalnız TL ve yüzde olarak yaz.");
    expect(source).toContain('sim.verdict === "LOSS"');
  });
});

describe("N6 — kaydırıcı sunucu simülasyonuyla aynı girdiyi kullanır", () => {
  it("kanal komisyonu, düz kargo ve iade oranı birebir gider", () => {
    const channel = {
      commissionBps: 1_500,
      cargoMinorPerOrder: 2_500,
      returnRateBps: 300,
      adCostMinorPerOrder: 100,
    };
    const input = campaignPreviewInput({
      priceMinor: 10_000,
      discountBps: 1_000,
      costMinor: 4_000,
      vatBps: 2_000,
      channel,
    });
    expect(input.commissionBps).toBe(1_500);
    expect(input.cargoMinor).toBe(2_500);
    expect(input.returnBps).toBe(300);
    expect(input.returnBps).not.toBe(800);
    const preview = simulateCampaign(input);
    const server = simulateCampaign({
      priceMinor: 10_000,
      discountBps: 1_000,
      cogsMinor: 4_000,
      commissionBps: channel.commissionBps,
      cargoMinor: channel.cargoMinorPerOrder,
      returnBps: channel.returnRateBps,
      adCostMinor: channel.adCostMinorPerOrder,
      vatBps: 2_000,
    });
    expect(preview).toEqual(server);
  });

  it("kokpit ikinci formu inkâr etmez; simülasyon yalnız PUSHED kanalı sayar", () => {
    const cockpit = readFileSync(join(ROOT, "components/commerce/os-cockpit.tsx"), "utf8");
    expect(cockpit).not.toContain("ikinci bir form yok");
    expect(cockpit).toContain("Mağaza masasının kanal sayfası durur");
    const service = readFileSync(join(ROOT, "lib/commerce/os-service.ts"), "utf8");
    expect(service).not.toContain("Diğer kanallara eşitleme kaydı gitti");
    expect(simulationBroadcastNote({ broadcast: [{ status: "PUSHED" }, { status: "PUSHED" }] })).toBe(
      "2 kanala stok yayını gitti.",
    );
    expect(
      simulationBroadcastNote({ broadcast: [{ status: "PUSHED" }, { status: "FAILED" }] }),
    ).toBe("1 kanal yayını aldı. 1 kanal bekliyor veya reddetti.");
    expect(simulationBroadcastNote({})).toBe("Başka kanala yayın satırı düşmedi.");
  });
});
