import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decideEdgeApiAuth } from "@/lib/kernel/security/edge-api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import {
  GrantCatalogUnavailableError,
  mapGrantCallRow,
} from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import { GET } from "@/app/api/yetkinhibe/grant/catalog/route";

vi.mock("@/lib/yetkinhibe/grant-catalog-live", () => ({
  loadYetkinhibeGrantCatalog: vi.fn(),
}));

const CATALOG_URL = "http://localhost/api/yetkinhibe/grant/catalog";
const CATALOG_PATH = "/api/yetkinhibe/grant/catalog";
const NOW = new Date("2026-11-09T09:00:00.000Z");

function oneEntry() {
  return [
    mapGrantCallRow(
      {
        id: "route-test-cagri",
        sourceKey: "KOSGEB",
        sourceLabel: "KOSGEB",
        title: "Rota testi",
        summary: "Özet.",
        poolAmountMinor: 1000000,
        minSupportMinor: 100,
        maxSupportMinor: 200,
        supportRatioBps: 5000,
        applicationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
        applicationDeadline: new Date("2026-12-31T23:59:59.000Z"),
        eligibilityJson: {},
        requiredDocuments: [],
        tags: [],
        officialInfoUrl: "https://www.kosgeb.gov.tr/",
        sourceVerifiedAt: null,
      },
      NOW,
    ),
  ];
}

describe("YetkinHibe katalog rotası (GET)", () => {
  beforeEach(() => {
    vi.mocked(loadYetkinhibeGrantCatalog).mockReset();
  });

  it("okunabilen kataloğu zarf içinde 200 ile döner", async () => {
    vi.mocked(loadYetkinhibeGrantCatalog).mockResolvedValue(oneEntry());

    const response = await GET(new Request(CATALOG_URL));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.calls).toHaveLength(1);
    expect(body.data.calls[0].id).toBe("route-test-cagri");
  });

  it("katalog okunamazsa 503 döner ve veri göndermez (sabit katalog yok)", async () => {
    vi.mocked(loadYetkinhibeGrantCatalog).mockRejectedValue(
      new GrantCatalogUnavailableError("empty"),
    );

    const response = await GET(new Request(CATALOG_URL));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.data).toBeNull();
  });

  it("beklenmeyen hata 500 döner ve ayrıntı sızdırmaz", async () => {
    vi.mocked(loadYetkinhibeGrantCatalog).mockRejectedValue(new Error("iç ayrıntı"));

    const response = await GET(new Request(CATALOG_URL));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("iç ayrıntı");
  });
});

describe("YetkinHibe kapalı oda kenarı", () => {
  const envBackup = process.env.DRON_YETKINHIBE_OPEN;

  beforeEach(() => {
    delete process.env.DRON_YETKINHIBE_OPEN;
  });

  afterEach(() => {
    if (envBackup === undefined) {
      delete process.env.DRON_YETKINHIBE_OPEN;
    } else {
      process.env.DRON_YETKINHIBE_OPEN = envBackup;
    }
  });

  it("oda açıkken katalog yolu kenara düşer", () => {
    expect(
      decideEdgeApiAuth({ pathname: CATALOG_PATH, method: "GET", sessionHint: false }),
    ).toEqual({ kind: "next" });
  });

  it("katalog yolu kenar haritasında public olarak kayıtlı", () => {
    expect(ROUTE_AUTH_MAP[CATALOG_PATH]).toBe("public");
  });
});
