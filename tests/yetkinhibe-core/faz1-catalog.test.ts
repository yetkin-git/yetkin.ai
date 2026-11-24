import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isGrantVerificationFresh,
  isMatchableGrantCall,
  partitionGrantCatalogRows,
  type GrantCatalogRowInput,
} from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import {
  GRANT_CALL_SEEDS_2027,
  GRANT_SEED_VERIFIED_AT,
  type GrantCallSeed,
} from "@/lib/yetkinhibe/grant-call-seed-2027";

const NOW = new Date("2026-11-23T12:00:00.000Z");

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  revisionCreate: vi.fn(),
}));

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({
    yetkinhibeGrantCall: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
    hibeGrantCallRevision: { create: mocks.revisionCreate },
  }),
}));

function seedRow(seed: GrantCallSeed): GrantCatalogRowInput {
  return {
    id: seed.id,
    sourceKey: seed.sourceKey,
    sourceLabel: seed.sourceKey,
    title: seed.title,
    summary: seed.summary,
    poolAmountMinor: seed.poolAmountMinor,
    minSupportMinor: seed.minSupportMinor,
    maxSupportMinor: seed.maxSupportMinor,
    supportRatioBps: seed.supportRatioBps,
    applicationOpensAt: new Date(seed.applicationOpensAt),
    applicationDeadline: new Date(seed.applicationDeadline),
    eligibilityJson: seed.eligibility,
    requiredDocuments: seed.requiredDocuments,
    tags: seed.tags,
    officialInfoUrl: seed.officialInfoUrl,
    publicationUrl: seed.publicationUrl,
    sourceVerifiedAt: new Date(GRANT_SEED_VERIFIED_AT),
  };
}

function liveRow(id: string, officialInfoUrl: string) {
  return {
    id,
    sourceKey: "KOSGEB",
    source: { label: "KOSGEB" },
    title: "Açık çağrı başlığı yeter",
    summary: "Özet metni katalog satırını taşır.",
    poolAmountMinor: null,
    minSupportMinor: 0,
    maxSupportMinor: 100_000_00,
    supportRatioBps: 6000,
    applicationOpensAt: new Date("2026-11-20T21:00:00.000Z"),
    applicationDeadline: new Date("2027-06-30T20:59:00.000Z"),
    eligibilityJson: {
      eligibleSectorCodes: null,
      minEmployeeCount: null,
      maxEmployeeCount: null,
      minCompanyAgeYears: null,
      maxCompanyAgeYears: null,
      requiresRdActivity: false,
      requiresExportActivity: false,
      requiresKobiStatus: false,
      requiresPatentOrUtilityModel: false,
    },
    requiredDocuments: [],
    tags: [],
    officialInfoUrl,
    publicationUrl: null,
    sourceVerifiedAt: new Date(GRANT_SEED_VERIFIED_AT),
    isPublished: true,
    dataVersion: 3,
  };
}

describe("YetkinHibe Faz 1 katalog", () => {
  it("32 açık çağrı ve en az 8 kurum servis edilir; TKDK dahildir", () => {
    const partitioned = partitionGrantCatalogRows(GRANT_CALL_SEEDS_2027.map(seedRow), NOW);
    expect(GRANT_CALL_SEEDS_2027).toHaveLength(32);
    expect(partitioned.invalidIds).toEqual([]);
    expect(partitioned.served).toHaveLength(32);
    const sources = new Set(partitioned.served.map((row) => row.source));
    expect(sources.size).toBeGreaterThanOrEqual(8);
    expect(sources.has("TKDK_IPARD")).toBe(true);
    for (const row of partitioned.served) {
      expect(isMatchableGrantCall(row)).toBe(true);
      expect(isGrantVerificationFresh(row.sourceVerifiedAt, NOW)).toBe(true);
    }
  });

  it("tek bozuk satır bellekte elenir; kalıcı karantina yalnız bakım yolunda", async () => {
    const good = liveRow("saglam", "https://www.kosgeb.gov.tr/");
    const bad = liveRow("bozuk", "http://ornek.test/ilan");
    mocks.findMany.mockResolvedValue([good, bad]);
    mocks.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
      where.id === "bozuk" ? bad : null,
    );
    mocks.update.mockResolvedValue({ ...bad, isPublished: false, dataVersion: 4 });
    mocks.revisionCreate.mockResolvedValue({ id: "rev" });

    // Ş11 — GET/okuma yolu salt okunur: bozuk satır yalnız bellekte elenir.
    const served = await loadYetkinhibeGrantCatalog(NOW);
    expect(served.map((row) => row.id)).toEqual(["saglam"]);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revisionCreate).not.toHaveBeenCalled();

    // Kalıcı karantina ayrı bakım işlevindedir.
    const { quarantineGrantCalls } = await import("@/lib/yetkinhibe/grant-catalog-live");
    const quarantined = await quarantineGrantCalls(["bozuk"]);
    expect(quarantined.quarantined).toEqual(["bozuk"]);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "bozuk" },
      data: { isPublished: false, dataVersion: 4 },
    });
    expect(mocks.revisionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        callId: "bozuk",
        dataVersion: 4,
        action: "QUARANTINE",
      }),
    });
  });
});

beforeEach(() => {
  mocks.findMany.mockReset();
  mocks.findUnique.mockReset();
  mocks.update.mockReset();
  mocks.revisionCreate.mockReset();
});
