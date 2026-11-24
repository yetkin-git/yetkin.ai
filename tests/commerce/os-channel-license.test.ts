import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { openCommerceCredential } from "@/lib/commerce/credential-seal";
import { createMemoryCommerceRepository } from "@/lib/commerce/memory-repository";
import { connectChannel, syncCatalog } from "@/lib/commerce/os-service";
import { OS_CHANNEL_CATALOG, channelComingSoon } from "@/lib/commerce/os-rules";

const mocks = vi.hoisted(() => ({
  subscriptionFindUnique: vi.fn(),
  salesChannelUpsert: vi.fn(),
  salesChannelFindMany: vi.fn(),
  salesChannelUpdateMany: vi.fn(),
  listingUpdateMany: vi.fn(),
  credentialUpsert: vi.fn(),
  credentialDeleteMany: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    commerceSubscription: { findUnique: mocks.subscriptionFindUnique },
    salesChannel: {
      upsert: mocks.salesChannelUpsert,
      findMany: mocks.salesChannelFindMany,
      updateMany: mocks.salesChannelUpdateMany,
    },
    commerceChannelListing: { updateMany: mocks.listingUpdateMany },
    commerceMarketplaceCredential: {
      upsert: mocks.credentialUpsert,
      deleteMany: mocks.credentialDeleteMany,
    },
  }),
}));

const ROOT = process.cwd();
const OWNER = "44444444-4444-4444-8444-444444444444";
const FUTURE = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

function subscriptionRow(over: Record<string, unknown>) {
  return {
    id: "sub-1",
    storeId: "store-pool",
    ownerUserId: OWNER,
    status: "ACTIVE",
    listPriceMinor: 9900,
    appliedMerchantOids: [],
    expiresAt: FUTURE,
    trialEndsAt: null,
    currentPeriodEnd: FUTURE,
    cancelAtPeriodEnd: false,
    paytrUtoken: "",
    paytrCtoken: "",
    dunningAttempts: 0,
    lastDunningAt: null,
    trialPending: false,
    trialQuestionsUsed: 0,
    trialOptimizationsUsed: 0,
    createdAt: new Date("2026-11-01T00:00:00Z"),
    updatedAt: new Date("2026-11-01T00:00:00Z"),
    ...over,
  };
}

beforeEach(() => {
  vi.stubEnv("COMMERCE_CREDENTIAL_ENCRYPTION_KEY", Buffer.alloc(32, 7).toString("base64"));
  mocks.subscriptionFindUnique.mockReset();
  mocks.salesChannelUpsert.mockReset().mockResolvedValue({});
  mocks.salesChannelFindMany.mockReset();
  mocks.salesChannelUpdateMany.mockReset().mockResolvedValue({ count: 0 });
  mocks.listingUpdateMany.mockReset().mockResolvedValue({ count: 0 });
  mocks.credentialUpsert.mockReset().mockResolvedValue({});
  mocks.credentialDeleteMany.mockReset().mockResolvedValue({ count: 0 });
});

describe("kanal bağlama lisans kapısı (sunucu)", () => {
  it("lisanssız bağlantı 403 döner ve kanal yazılmaz", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(null);
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "TRENDYOL", true, "trendyol-api-key-1", "27380001", "secret-value-1");
    expect(result).toEqual({ ok: false, status: 403, error: "Kanal bağlamak için aktif lisans gerekir." });
    expect(mocks.salesChannelUpsert).not.toHaveBeenCalled();
    expect(mocks.credentialUpsert).not.toHaveBeenCalled();
  });

  it("süresi dolmuş lisans da 403 alır", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(
      subscriptionRow({ status: "ACTIVE", expiresAt: PAST, currentPeriodEnd: PAST }),
    );
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "HEPSIBURADA", true, "hepsi-api-key-1", "HB00001234", "secret-value-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
    expect(mocks.salesChannelUpsert).not.toHaveBeenCalled();
    expect(mocks.credentialUpsert).not.toHaveBeenCalled();
  });

  it("aktif lisansla bağlantı kurulur, anahtar mühürlenir ve pazaryeri kasasına da yazılır", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(subscriptionRow({ status: "ACTIVE" }));
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "TRENDYOL", true, "trendyol-api-key-1", "27380001", "secret-value-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("CONNECTED");
      expect(result.data.hint).toBe("trendyol-api-key-1".slice(-4));
      expect(result.data.message).toBe("Kanal bağlandı. Sipariş çekme bu kimlikle çalışır.");
    }
    expect(mocks.salesChannelUpsert).toHaveBeenCalledTimes(1);
    const call = mocks.salesChannelUpsert.mock.calls[0]?.[0] as {
      where: { storeId_kind: { storeId: string } };
      create: { apiKeySeal: string; status: string };
    };
    expect(call.create.status).toBe("CONNECTED");
    expect(call.create.apiKeySeal.startsWith("ccred1:")).toBe(true);
    expect(openCommerceCredential(call.create.apiKeySeal, "apiKey", call.where.storeId_kind.storeId, process.env, "TRENDYOL")).toBe(
      "27380001:trendyol-api-key-1:secret-value-1",
    );
    // P0.3 — sipariş çeken cron `commerce_marketplace_credentials` okur; aynı satır yazıldı.
    expect(mocks.credentialUpsert).toHaveBeenCalledTimes(1);
    const vault = mocks.credentialUpsert.mock.calls[0]?.[0] as {
      where: { storeId_channel: { channel: string } };
      create: { supplierHint: string; supplierSeal: string; apiKeySeal: string; apiSecretSeal: string };
    };
    expect(vault.where.storeId_channel.channel).toBe("TRENDYOL");
    expect(vault.create.supplierHint).toBe("0001");
    expect(vault.create.supplierSeal.startsWith("ccred1:")).toBe(true);
    expect(vault.create.apiSecretSeal.startsWith("ccred1:")).toBe(true);
  });

  it("P0.3 — tek parça anahtar reddedilir; üç parça zorunlu", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(subscriptionRow({ status: "ACTIVE" }));
    const repo = createMemoryCommerceRepository();
    const single = await connectChannel(repo, OWNER, "TRENDYOL", true, "trendyol-api-key-1");
    expect(single.ok).toBe(false);
    if (!single.ok) {
      expect(single.status).toBe(422);
      expect(single.error).toBe("Satıcı ID gerekli.");
    }
    expect(mocks.salesChannelUpsert).not.toHaveBeenCalled();
    const badShape = await connectChannel(repo, OWNER, "TRENDYOL", true, "trendyol-api-key-1", "ABC", "secret-value-1");
    expect(badShape.ok).toBe(false);
  });

  it("eski `satıcı:anahtar:sır` tek alanı da aynı kasaya yazar", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(subscriptionRow({ status: "ACTIVE" }));
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "HEPSIBURADA", true, "HB00001234:hb-api-key:hb-api-secret");
    expect(result.ok).toBe(true);
    expect(mocks.credentialUpsert).toHaveBeenCalledTimes(1);
    const vault = mocks.credentialUpsert.mock.calls[0]?.[0] as { create: { supplierHint: string } };
    expect(vault.create.supplierHint).toBe("1234");
  });

  it("bağlantı kesme lisans olmadan da çalışır ve pazaryeri kimliğini siler", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(null);
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "TRENDYOL", false, undefined);
    expect(result).toEqual({ ok: true, data: { status: "DISCONNECTED", message: "Kanal bağlantısı kesildi." } });
    expect(mocks.salesChannelUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.credentialDeleteMany).toHaveBeenCalledTimes(1);
  });

  it("vitrin kanalı bağlama da lisans ister", async () => {
    mocks.subscriptionFindUnique.mockResolvedValue(null);
    const repo = createMemoryCommerceRepository();
    const result = await connectChannel(repo, OWNER, "OWN_STORE", true, undefined);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
    }
  });
});

describe("yakında kanallar", () => {
  it("Amazon ve N11 bağlanamaz: 422 'Bu kanal yakında.' ve lisans sorgusu yapılmaz", async () => {
    const repo = createMemoryCommerceRepository();
    for (const kind of ["AMAZON", "N11"]) {
      const result = await connectChannel(repo, OWNER, kind, true, "key-value-1234");
      expect(result).toEqual({ ok: false, status: 422, error: "Bu kanal yakında." });
    }
    expect(mocks.subscriptionFindUnique).not.toHaveBeenCalled();
  });

  it("kataloğ yakında bayraklarını ve yardımcıyı tutarlı verir", () => {
    expect(channelComingSoon("AMAZON")).toBe(true);
    expect(channelComingSoon("N11")).toBe(true);
    expect(channelComingSoon("TRENDYOL")).toBe(false);
    expect(channelComingSoon("HEPSIBURADA")).toBe(false);
    expect(channelComingSoon("OWN_STORE")).toBe(false);
    const flags = Object.fromEntries(OS_CHANNEL_CATALOG.map((row) => [row.kind, row.comingSoon]));
    expect(flags).toEqual({
      OWN_STORE: false,
      TRENDYOL: false,
      HEPSIBURADA: false,
      AMAZON: true,
      N11: true,
    });
    expect(OS_CHANNEL_CATALOG.find((row) => row.kind === "AMAZON")?.label).toBe("Amazon");
  });
});

describe("katalog eşitleme dürüstlüğü", () => {
  it("eşitleme yanıtı güncellemenin kuyruğa alındığını söyler", async () => {
    mocks.salesChannelFindMany.mockResolvedValue([{ id: "ch-1", kind: "TRENDYOL" }]);
    mocks.salesChannelUpdateMany.mockResolvedValue({ count: 1 });
    mocks.listingUpdateMany.mockResolvedValue({ count: 0 });
    const result = await syncCatalog(OWNER);
    expect(result).toEqual({
      ok: true,
      data: {
        synced: 1,
        message: "Güncelleme kuyruğa alındı; periyodik senkronizasyonda işlenecek.",
      },
    });
  });

  it("os-service ürün ve simülasyon sorgularında varyant sınırı taşımaz", () => {
    const source = readFileSync(join(ROOT, "lib/commerce/os-service.ts"), "utf8");
    expect(source).not.toMatch(/variants:\s*\{[^}]*take:\s*1/);
    expect(source).toContain("commerceLicenseActive(subscription, new Date())");
    expect(source).toContain('"Kanal bağlamak için aktif lisans gerekir."');
    expect(source).not.toContain("Katalog eşitleme kaydı bağlı kanallara düştü.");
  });
});
