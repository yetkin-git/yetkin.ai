import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { WEB_ONLY_WRITE_ROUTES } from "@/lib/kernel/http/web-only-write-routes";
import {
  buildRadarBundle,
  collectGrantCallSignals,
  collectMarketplaceTrendSignals,
  collectTetkikSignals,
  parseRadarFeed,
  poolSeedHref,
  RADAR_SOURCE_BADGE,
  suggestionsFromSignals,
} from "@/lib/commerce/radar-signals";
import {
  parsePlatformTetkikRow,
  toPlatformGrantCall,
} from "@/lib/kernel/market-demand/platform-demand-port";

const ROOT = process.cwd();
const OWNER = "11111111-1111-4111-8111-111111111111";
const STORE = "22222222-2222-4222-8222-222222222222";
const KEY = "550e8400-e29b-41d4-a716-4466554400b3";

const mocks = vi.hoisted(() => ({
  storeFindFirst: vi.fn(),
  productFindMany: vi.fn(),
  quoteFindMany: vi.fn(),
  ruleFindMany: vi.fn(),
  feedFindMany: vi.fn(),
  feedCreate: vi.fn(),
  signalDelete: vi.fn(),
  signalCreate: vi.fn(),
  signalFindMany: vi.fn(),
  suggestionUpdate: vi.fn(),
  suggestionCreate: vi.fn(),
  suggestionFindMany: vi.fn(),
}));

const platform = vi.hoisted(() => ({
  readGrants: vi.fn(),
  readTetkik: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    commerceStore: { findFirst: mocks.storeFindFirst },
    commerceProduct: { findMany: mocks.productFindMany },
    commerceCompetitorQuote: { findMany: mocks.quoteFindMany },
    commerceChannelPriceRule: { findMany: mocks.ruleFindMany },
    commerceDemandFeed: { findMany: mocks.feedFindMany, create: mocks.feedCreate },
    commerceCatalogGapSignal: {
      deleteMany: mocks.signalDelete,
      create: mocks.signalCreate,
      findMany: mocks.signalFindMany,
    },
    commerceProductSuggestion: {
      updateMany: mocks.suggestionUpdate,
      create: mocks.suggestionCreate,
      findMany: mocks.suggestionFindMany,
    },
  }),
}));

vi.mock("@/lib/kernel/market-demand/platform-demand-port", async () => {
  const actual = await vi.importActual<typeof import("@/lib/kernel/market-demand/platform-demand-port")>(
    "@/lib/kernel/market-demand/platform-demand-port",
  );
  return {
    ...actual,
    readPlatformGrantCalls: platform.readGrants,
    readPlatformTetkikHits: platform.readTetkik,
  };
});

function priced(category: string, basePriceMinor: number) {
  return {
    id: `p-${category}-${basePriceMinor}`,
    category,
    basePriceMinor,
    status: "ACTIVE",
    variants: [{ amountMinor: basePriceMinor, unitEconomics: { costMinor: 1_000 } }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  platform.readGrants.mockResolvedValue([]);
  platform.readTetkik.mockResolvedValue([]);
  mocks.storeFindFirst.mockResolvedValue({ id: STORE });
  mocks.productFindMany.mockResolvedValue([]);
  mocks.quoteFindMany.mockResolvedValue([]);
  mocks.ruleFindMany.mockResolvedValue([]);
  mocks.feedFindMany.mockResolvedValue([]);
  mocks.signalDelete.mockResolvedValue({ count: 0 });
  mocks.suggestionUpdate.mockResolvedValue({ count: 0 });
  mocks.signalFindMany.mockResolvedValue([]);
  mocks.suggestionFindMany.mockResolvedValue([]);
  mocks.signalCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => ({
    computedAt: new Date("2026-11-23T12:00:00.000Z"),
    ...args.data,
  }));
  mocks.suggestionCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => args.data);
  mocks.feedCreate.mockImplementation(async (args: { data: Record<string, unknown> }) => args.data);
});

describe("B3 sinyal üreticileri", () => {
  it("pazaryeri trendi rakip fiyat payından ve boş banttan gelir", () => {
    const signals = collectMarketplaceTrendSignals(
      [
        {
          category: "Mutfak",
          ownPriceMinor: 20_000,
          competitorPriceMinor: 12_000,
          quoteCount: 3,
          competitiveRuleCount: 0,
        },
        {
          category: "Mutfak",
          ownPriceMinor: 20_000,
          competitorPriceMinor: 22_000,
          quoteCount: 1,
          competitiveRuleCount: 0,
        },
      ],
      [],
    );
    expect(signals.map((row) => row.source)).toEqual(["MARKETPLACE_TREND", "MARKETPLACE_TREND"]);
    expect(signals[0]?.priceBandMinor).toBe(10_000);
    expect(signals[0]?.demandIndex).toBe(75);
    expect(signals[0]?.evidence.quoteCount).toBe(3);
    expect(signals[1]?.demandIndex).toBe(25);
    expect(collectMarketplaceTrendSignals([], [])).toEqual([]);
  });

  it("rekabet kuralının fiyat düşüşü kayıtlı hareket olarak sinyal olur", () => {
    const signals = collectMarketplaceTrendSignals(
      [
        {
          category: "Mutfak",
          ownPriceMinor: 20_000,
          competitorPriceMinor: 21_000,
          quoteCount: 0,
          competitiveRuleCount: 2,
        },
      ],
      [{ category: "Mutfak", priceMinor: 22_000 }],
    );
    expect(signals).toHaveLength(1);
    expect(signals[0]?.source).toBe("MARKETPLACE_TREND");
    expect(signals[0]?.evidence.competitiveRuleCount).toBe(2);
    expect(signals[0]?.supplyGap).toBeGreaterThan(0);
    expect(signals[0]?.demandIndex).toBe(100);
  });

  it("tetkik yalnız vitrin aşamasını ve kategori kelimesini sayar", () => {
    const anchors = [{ category: "Mutfak", priceBandMinor: 15_000 }];
    const signals = collectTetkikSignals(
      [
        {
          id: "t1",
          host: "mutfak.example",
          pageTitle: "Mutfak dükkanı",
          score: 40,
          stage: "shop",
          text: "Mutfak dükkanı",
        },
        {
          id: "t2",
          host: "elektronik.example",
          pageTitle: "Elektronik",
          score: 80,
          stage: "shop",
          text: "Elektronik",
        },
        {
          id: "ads",
          host: "mutfak.example",
          pageTitle: "Mutfak reklam",
          score: 10,
          stage: "ads",
          text: "Mutfak reklam",
        },
      ],
      anchors,
    );
    expect(signals).toHaveLength(1);
    expect(signals[0]?.source).toBe("TETKIK");
    expect(signals[0]?.category).toBe("Mutfak");
    expect(signals[0]?.demandIndex).toBe(50);
    expect(signals[0]?.supplyGap).toBe(60);
    expect(signals[0]?.evidence.matchedCount).toBe(1);
    expect(collectTetkikSignals([], anchors)).toEqual([]);
  });

  it("hibe çağrısı destek oranını kullanır; kapalı ve etiketsiz çağrı düşer", () => {
    const anchors = [{ category: "Mutfak", priceBandMinor: 15_000 }];
    const signals = collectGrantCallSignals(
      [
        {
          id: "g1",
          title: "Mutfak destek",
          summary: "",
          tags: ["Mutfak"],
          supportRatioBps: 5_000,
          minSupportMinor: 0,
          maxSupportMinor: 0,
          open: true,
        },
        {
          id: "closed",
          title: "Mutfak kapalı",
          summary: "",
          tags: ["Mutfak"],
          supportRatioBps: 8_000,
          minSupportMinor: 0,
          maxSupportMinor: 0,
          open: false,
        },
        {
          id: "zero",
          title: "Mutfak",
          summary: "",
          tags: ["Mutfak"],
          supportRatioBps: 0,
          minSupportMinor: 0,
          maxSupportMinor: 0,
          open: true,
        },
        {
          id: "other",
          title: "Yazılım",
          summary: "yazılım çağrısı",
          tags: ["yazilim"],
          supportRatioBps: 9_000,
          minSupportMinor: 0,
          maxSupportMinor: 0,
          open: true,
        },
      ],
      anchors,
    );
    expect(signals).toHaveLength(1);
    expect(signals[0]?.source).toBe("GRANT_CALL");
    expect(signals[0]?.demandIndex).toBe(50);
    expect(signals[0]?.priceBandMinor).toBe(15_000);
    expect(signals[0]?.evidence.minSupportMinor).toBe(0);
  });

  it("dört kaynak aynı taramada öneriye ve gerekçeye yazılır", () => {
    const bundle = buildRadarBundle({
      catalog: [
        { category: "Mutfak", basePriceMinor: 10_000, status: "ACTIVE" },
        { category: "Mutfak", basePriceMinor: 10_200, status: "ACTIVE" },
        { category: "Mutfak", basePriceMinor: 25_000, status: "ACTIVE" },
        { category: "Mutfak", basePriceMinor: 25_200, status: "ACTIVE" },
      ],
      marketplace: [
        {
          category: "Mutfak",
          ownPriceMinor: 25_000,
          competitorPriceMinor: 15_000,
          quoteCount: 2,
          competitiveRuleCount: 1,
        },
      ],
      tetkik: [
        {
          id: "t1",
          host: "mutfak.example",
          pageTitle: "Mutfak",
          score: 40,
          stage: "shop",
          text: "Mutfak vitrin",
        },
      ],
      grants: [
        {
          id: "g1",
          title: "KOSGEB Mutfak",
          summary: "",
          tags: ["mutfak"],
          supportRatioBps: 4_000,
          minSupportMinor: 100_000,
          maxSupportMinor: 200_000,
          open: true,
        },
      ],
    });
    expect(new Set(bundle.map((row) => row.source))).toEqual(
      new Set(["OWN_CATALOG", "MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"]),
    );
    const suggestions = suggestionsFromSignals(bundle.map((row, index) => ({ ...row, id: `sig-${index}` })));
    const rationale = suggestions.map((row) => row.rationale).join(" ");
    expect(rationale).toContain("Katalog Boşluğu");
    expect(rationale).toContain("Pazaryeri Trendi");
    expect(rationale).toContain("Web Tetkik Talebi");
    expect(rationale).toContain("Hibe Çağrı Uyumu");
    expect(suggestions[0]?.sources).toEqual(
      expect.arrayContaining(["OWN_CATALOG", "MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"]),
    );
    expect(suggestions[0]?.signalIds.length).toBeGreaterThan(1);
    expect(suggestions[0]?.seedHref).toBe(
      poolSeedHref({
        title: suggestions[0]!.title,
        category: suggestions[0]!.category,
        targetPriceMinor: suggestions[0]!.targetPriceMinor,
      }),
    );
    expect(rationale).not.toContain("kuruş");
    expect(suggestions[0]?.title).toContain("₺");
  });

  it("platform satırı bozuksa veya destek oranı yoksa sinyal olmaz", () => {
    expect(parsePlatformTetkikRow({ id: "x", host: "a.example", score: 40, payloadJson: "{" })).toBeNull();
    const hit = parsePlatformTetkikRow({
      id: "x",
      host: "mutfak.example",
      score: 40,
      payloadJson: JSON.stringify({
        pageTitle: "Mutfak",
        opportunities: ["vitrin"],
        action: { stage: "shop" },
      }),
    });
    expect(hit?.stage).toBe("shop");
    expect(hit?.score).toBe(40);
    expect(
      toPlatformGrantCall({
        id: "g",
        title: "Çağrı",
        summary: "",
        tags: [],
        minSupportMinor: 0,
        maxSupportMinor: 0,
        supportRatioBps: 0,
      }),
    ).toBeNull();
  });
});

describe("B3 radar taraması ve besleme ucu", () => {
  it("tarama dört kaynağı gerçek source etiketiyle yazar", async () => {
    mocks.productFindMany.mockResolvedValue([
      priced("Mutfak", 10_000),
      priced("Mutfak", 10_200),
      priced("Mutfak", 25_000),
      priced("Mutfak", 25_200),
    ]);
    mocks.quoteFindMany.mockResolvedValue([
      {
        competitorPriceMinor: 15_000,
        variant: { amountMinor: 25_000, product: { category: "Mutfak", basePriceMinor: 25_000 } },
      },
    ]);
    mocks.ruleFindMany.mockResolvedValue([
      {
        activePriceMinor: 15_000,
        basePriceMinor: 25_000,
        variant: { product: { category: "Mutfak" } },
      },
    ]);
    platform.readTetkik.mockResolvedValue([
      {
        id: "t1",
        host: "mutfak.example",
        score: 40,
        pageTitle: "Mutfak dükkanı",
        stage: "shop",
        text: "Mutfak dükkanı",
      },
    ]);
    platform.readGrants.mockResolvedValue([
      {
        id: "g1",
        title: "KOSGEB Mutfak",
        summary: "",
        tags: ["mutfak"],
        minSupportMinor: 0,
        maxSupportMinor: 0,
        supportRatioBps: 5_000,
      },
    ]);
    const { scanOpportunityRadar } = await import("@/lib/commerce/opportunity-radar");
    const result = await scanOpportunityRadar(OWNER, STORE);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const created = mocks.signalCreate.mock.calls.map(
      (call) => (call[0] as { data: { source: string } }).data.source,
    );
    expect(new Set(created)).toEqual(new Set(["OWN_CATALOG", "MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"]));
    const suggestions = result.data.suggestions as Array<{ rationale: string; sources: string[]; seedHref: string }>;
    const rationale = suggestions.map((row) => row.rationale).join(" ");
    expect(rationale).toContain("Pazaryeri Trendi");
    expect(rationale).toContain("Web Tetkik Talebi");
    expect(rationale).toContain("Hibe Çağrı Uyumu");
    expect(suggestions[0]?.sources).toEqual(expect.arrayContaining(["MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"]));
    expect(suggestions[0]?.seedHref.startsWith("/panel/e-ticaret?")).toBe(true);
    expect(suggestions[0]?.seedHref).toContain("sekme=havuz");
    expect(suggestions[0]?.seedHref).toContain("hedefFiyat=");
    expect(mocks.signalDelete).toHaveBeenCalled();
  });

  it("beslenen hibe çağrısı platform boşken taramaya girer", async () => {
    mocks.productFindMany.mockResolvedValue([priced("Mutfak", 10_000)]);
    mocks.feedFindMany.mockResolvedValue([
      {
        source: "GRANT_CALL",
        payloadJson: JSON.stringify({
          source: "GRANT_CALL",
          category: "Tekstil",
          priceBandMinor: 20_000,
          marketplace: null,
          tetkik: null,
          grant: {
            title: "Tekstil çağrısı",
            summary: "",
            tags: ["Tekstil"],
            supportRatioBps: 6_000,
            minSupportMinor: 0,
            maxSupportMinor: 0,
          },
        }),
      },
    ]);
    const { scanOpportunityRadar } = await import("@/lib/commerce/opportunity-radar");
    const result = await scanOpportunityRadar(OWNER, STORE);
    expect(result.ok).toBe(true);
    const created = mocks.signalCreate.mock.calls.map(
      (call) => (call[0] as { data: { source: string; category: string; demandIndex: number } }).data,
    );
    expect(created.some((row) => row.source === "GRANT_CALL" && row.category === "Tekstil" && row.demandIndex === 60)).toBe(
      true,
    );
    expect(created.some((row) => row.source === "OWN_CATALOG")).toBe(false);
  });

  it("besleme ucu istemcinin talep endeksini yok sayar ve Idempotency-Key ister", async () => {
    const { postRadarSignals } = await import("@/lib/commerce/profit-handlers");
    const idempotency = createMemoryHttpIdempotencyStore();
    const deps = {
      requireSession: async () => ({ id: OWNER, email: "owner@example.com" }),
      idempotency: () => idempotency,
    };
    const body = {
      source: "MARKETPLACE_TREND",
      category: "Mutfak",
      competitorPriceMinor: 15_000,
      ownPriceMinor: 25_000,
      quoteCount: 2,
      demandIndex: 999,
      supplyGap: 1,
    };
    const missing = await postRadarSignals(
      deps,
      new Request(`http://localhost/api/commerce/stores/${STORE}/radar/signals`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      STORE,
    );
    expect(missing.status).toBe(400);

    const request = () =>
      new Request(`http://localhost/api/commerce/stores/${STORE}/radar/signals`, {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": KEY },
        body: JSON.stringify(body),
      });
    const first = await postRadarSignals(deps, request(), STORE);
    expect(first.status).toBe(200);
    const payload = (await first.json()) as { data: { demandIndex: number; source: string } };
    expect(payload.data.source).toBe("MARKETPLACE_TREND");
    expect(payload.data.demandIndex).not.toBe(999);
    expect(payload.data.demandIndex).toBe(100);
    const stored = mocks.feedCreate.mock.calls[0]?.[0] as { data: { payloadJson: string } };
    expect(stored.data.payloadJson).not.toContain("999");
    const evidence = JSON.parse(
      (mocks.signalCreate.mock.calls[0]?.[0] as { data: { evidenceJson: string } }).data.evidenceJson,
    ) as { quoteCount: number };
    expect(evidence.quoteCount).toBe(2);

    const second = await postRadarSignals(deps, request(), STORE);
    expect(second.status).toBe(200);
    expect(mocks.feedCreate).toHaveBeenCalledTimes(1);
  });

  it("başka mağazanın radarına yazmaz", async () => {
    mocks.storeFindFirst.mockResolvedValue(null);
    const { postRadarSignals } = await import("@/lib/commerce/profit-handlers");
    const response = await postRadarSignals(
      {
        requireSession: async () => ({ id: OWNER, email: "owner@example.com" }),
        idempotency: () => createMemoryHttpIdempotencyStore(),
      },
      new Request(`http://localhost/api/commerce/stores/${STORE}/radar/signals`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": "550e8400-e29b-41d4-a716-4466554400b4",
        },
        body: JSON.stringify({
          source: "TETKIK",
          category: "Mutfak",
          tetkikScore: 40,
          priceBandMinor: 15_000,
        }),
      }),
      STORE,
    );
    expect(response.status).toBe(404);
    expect(mocks.feedCreate).not.toHaveBeenCalled();
  });

  it("OWN_CATALOG ve kanıtsız gövde reddedilir", () => {
    expect(parseRadarFeed({ source: "OWN_CATALOG", category: "Mutfak" }).ok).toBe(false);
    expect(parseRadarFeed({ source: "MARKETPLACE_TREND", category: "Mutfak", demandIndex: 80 }).ok).toBe(false);
    expect(parseRadarFeed({ source: "GRANT_CALL", category: "Mutfak", supportRatioBps: 0 }).ok).toBe(false);
  });
});

describe("B3 rota ve kokpit sözleşmesi", () => {
  it("oturum, Idempotency yazımı ve kaynak rozetleri kayıtlıdır", () => {
    const route = readFileSync(
      join(ROOT, "app/api/commerce/stores/[storeId]/radar/signals/route.ts"),
      "utf8",
    );
    const panel = readFileSync(join(ROOT, "components/commerce/profit-engines-panel.tsx"), "utf8");
    expect(route).toContain('export const auth = "session"');
    expect(ROUTE_AUTH_MAP["/api/commerce/stores/[storeId]/radar/signals"]).toBe("session");
    expect(
      WEB_ONLY_WRITE_ROUTES.some(
        (row) => row.method === "POST" && row.path === "/api/commerce/stores/[storeId]/radar/signals",
      ),
    ).toBe(true);
    expect(panel).toContain("data-radar-source");
    expect(panel).toContain("formatTryMinor");
    expect(panel).toContain("seedHref");
    expect(panel).toContain("RADAR_SOURCE_BADGE");
    expect(RADAR_SOURCE_BADGE.MARKETPLACE_TREND).toBe("Pazaryeri Trendi");
    expect(RADAR_SOURCE_BADGE.TETKIK).toBe("Tetkik Talebi");
    expect(RADAR_SOURCE_BADGE.GRANT_CALL).toBe("Hibe Uyumu");
    expect(RADAR_SOURCE_BADGE.OWN_CATALOG).toBe("Katalog Boşluğu");
  });
});
