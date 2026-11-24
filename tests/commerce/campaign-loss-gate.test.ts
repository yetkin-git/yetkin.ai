import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storeFindFirst: vi.fn(),
  variantFindFirst: vi.fn(),
  unitFindUnique: vi.fn(),
  channelFindUnique: vi.fn(),
  campaignCreate: vi.fn(),
  invokeLlm: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    commerceStore: { findFirst: mocks.storeFindFirst },
    commerceVariant: { findFirst: mocks.variantFindFirst },
    commerceUnitEconomics: { findUnique: mocks.unitFindUnique },
    commerceChannelEconomics: { findUnique: mocks.channelFindUnique },
    commerceCampaignSimulation: { create: mocks.campaignCreate },
  }),
}));

vi.mock("@/lib/kernel/ai/llm-gateway", () => ({
  invokeLlm: mocks.invokeLlm,
}));

const OWNER = "11111111-1111-4111-8111-111111111111";
const STORE = "store-loss";

describe("N6 — zarar yazan kampanya kaydı", () => {
  beforeEach(() => {
    mocks.storeFindFirst.mockReset().mockResolvedValue({ id: STORE });
    mocks.variantFindFirst.mockReset().mockResolvedValue({ id: "v-1", amountMinor: 10_000 });
    mocks.unitFindUnique.mockReset().mockResolvedValue({
      costMinor: 9_000,
      desiGrams: 1_000,
      vatBps: 2_000,
    });
    mocks.channelFindUnique.mockReset().mockResolvedValue(null);
    mocks.campaignCreate.mockReset();
    mocks.invokeLlm.mockReset();
  });

  it("LOSS simülasyonu 422 döner; metin üretilmez ve satır yazılmaz", async () => {
    const { saveStoreCampaign } = await import("@/lib/commerce/campaign-engine");
    const result = await saveStoreCampaign(OWNER, STORE, {
      variantId: "v-1",
      channel: "TRENDYOL",
      discountBps: 5_000,
    });
    expect(result).toEqual({
      ok: false,
      status: 422,
      error: "Bu indirim zarar yazıyor. Kampanya kaydedilmedi.",
    });
    expect(mocks.campaignCreate).not.toHaveBeenCalled();
    expect(mocks.invokeLlm).not.toHaveBeenCalled();
  });
});
