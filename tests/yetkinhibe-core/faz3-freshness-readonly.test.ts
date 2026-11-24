import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GRANT_REVERIFY_AFTER_DAYS,
  GRANT_VERIFICATION_MAX_AGE_MS,
  applyGrantMaintenance,
  isGrantVerificationFresh,
  planGrantMaintenance,
  runGrantMaintenanceSimulation,
  type GrantCatalogRowInput,
  type YetkinhibeGrantCatalogEntry,
} from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog, quarantineGrantCalls } from "@/lib/yetkinhibe/grant-catalog-live";
import {
  GRANT_CALL_SEEDS_2027,
  GRANT_SEED_VERIFIED_AT,
  type GrantCallSeed,
} from "@/lib/yetkinhibe/grant-call-seed-2027";
import {
  grantBriefCriteria,
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { rankGrantProgramFits } from "@/lib/yetkinhibe/program-fit";
import { loadYetkinhibeGrantCatalog as loadLive } from "@/lib/yetkinhibe/grant-catalog-live";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

const ROOT = process.cwd();
const DAY_MS = 24 * 60 * 60 * 1000;

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/** 31 Aralık 2026 12:00 UTC — B-01'de devrilme anı olarak işaretlenen tarih. */
const DEC31_2026 = new Date("2026-12-31T12:00:00.000Z");
const SEED_VERIFIED = new Date(GRANT_SEED_VERIFIED_AT);

const OPEN_ELIGIBILITY: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
};

const BRIEF: GrantProgramBrief = {
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "10",
  investmentFocus: "makine_techizat",
  employeeCount: 40,
  companyAgeYears: 5,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

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
    specificationText: seed.specificationText ?? null,
    rulesJson: seed.rulesJson ?? null,
  };
}

function toBriefCall(entry: YetkinhibeGrantCatalogEntry, overrides: Partial<GrantBriefCall> = {}): GrantBriefCall {
  return {
    id: entry.id,
    title: entry.title,
    sourceLabel: entry.sourceLabel,
    officialInfoUrl: entry.officialInfoUrl,
    status: entry.status,
    remainingDays: entry.remainingDays,
    poolAmountMinor: entry.poolAmountMinor,
    maxSupportMinor: entry.maxSupportMinor,
    supportRatioBps: entry.supportRatioBps,
    sourceVerifiedAt: entry.sourceVerifiedAt,
    eligibility: entry.eligibility,
    source: entry.source,
    dataVersion: entry.dataVersion ?? null,
    specificationText: entry.specificationText ?? null,
    rulesJson: entry.rulesJson ?? null,
    ...overrides,
  };
}

/** Katalog satırlarını saf bakım simülasyonuna sokar (DB yok). */
function maintenanceRows(atVerification: Date) {
  return GRANT_CALL_SEEDS_2027.map((seed) => ({
    id: seed.id,
    applicationOpensAt: new Date(seed.applicationOpensAt),
    applicationDeadline: new Date(seed.applicationDeadline),
    sourceVerifiedAt: atVerification,
  }));
}

function openCountAt(at: Date, verifiedAt: Date): number {
  const rows = maintenanceRows(verifiedAt);
  let count = 0;
  for (const seed of GRANT_CALL_SEEDS_2027) {
    const row = rows.find((item) => item.id === seed.id);
    if (!row) {
      continue;
    }
    const status = at > row.applicationDeadline ? "CLOSED" : at < row.applicationOpensAt ? "UPCOMING" : "ACTIVE";
    if (status === "CLOSED" || status === "UPCOMING") {
      continue;
    }
    if (isGrantVerificationFresh(row.sourceVerifiedAt, at)) {
      count += 1;
    }
  }
  return count;
}

describe("Ş1 — katalog tazelik penceresi kırılmıyor", () => {
  it("bakım eşiği tazelik penceresinden küçüktür (25 gün < 30 gün)", () => {
    expect(GRANT_REVERIFY_AFTER_DAYS).toBe(25);
    expect(GRANT_REVERIFY_AFTER_DAYS * DAY_MS).toBeLessThan(GRANT_VERIFICATION_MAX_AGE_MS);
  });

  it("bakım olmadan 31 Aralık 2026'da katalog sıfırlanır (regresyon kanıtı)", () => {
    // B-01'in ölçümü: 30 gün dolduğu için hiçbir satır açık sayılmaz.
    expect(openCountAt(DEC31_2026, SEED_VERIFIED)).toBe(0);
    const stale = planGrantMaintenance(maintenanceRows(SEED_VERIFIED), DEC31_2026);
    expect(stale.refresh.length).toBe(GRANT_CALL_SEEDS_2027.length);
  });

  it("haftalık bakım 31 Aralık 2026'da en az 20 açık çağrı bırakır", () => {
    const rows = maintenanceRows(SEED_VERIFIED);
    const simulated = runGrantMaintenanceSimulation(rows, SEED_VERIFIED, DEC31_2026, 7);
    expect(simulated.sweeps).toBeGreaterThan(4);
    expect(simulated.reverified).toBeGreaterThan(0);
    const open = simulated.rows.filter(
      (row) =>
        row.applicationDeadline.getTime() >= DEC31_2026.getTime() &&
        row.applicationOpensAt.getTime() <= DEC31_2026.getTime() &&
        isGrantVerificationFresh(row.sourceVerifiedAt, DEC31_2026),
    );
    expect(open.length).toBeGreaterThanOrEqual(20);
  });

  it("bakım tek adımda da eşiği aşan satırı tazeler; kapanan satıra dokunmaz", () => {
    const now = new Date(SEED_VERIFIED.getTime() + 26 * DAY_MS);
    const plan = planGrantMaintenance(maintenanceRows(SEED_VERIFIED), now);
    expect(plan.refresh.length).toBeGreaterThan(0);
    const refreshed = applyGrantMaintenance(maintenanceRows(SEED_VERIFIED), plan, now);
    for (const id of plan.refresh.map((row) => row.id)) {
      const row = refreshed.find((item) => item.id === id);
      expect(row?.sourceVerifiedAt?.toISOString()).toBe(now.toISOString());
    }

    // Kapanmış çağrı tazelenmez: süresi geçmiş satır "açık" diye damgalanmaz.
    const closedRow = {
      id: "kapanmis",
      applicationOpensAt: new Date("2026-01-01T00:00:00.000Z"),
      applicationDeadline: new Date("2026-02-01T00:00:00.000Z"),
      sourceVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const closedPlan = planGrantMaintenance([closedRow], now);
    expect(closedPlan.refresh).toEqual([]);
    expect(closedPlan.closed.map((row) => row.id)).toEqual(["kapanmis"]);
    const applied = applyGrantMaintenance([closedRow], closedPlan, now);
    expect(applied[0]?.sourceVerifiedAt?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("CLI `verify --all` ve `refresh --older-than` komutlarını taşır", () => {
    const cli = readSrc("scripts/ops-grant-call.ts");
    expect(cli).toContain('flag("--all")');
    expect(cli).toContain("verifyGrantCalls");
    expect(cli).toContain('command === "refresh"');
    expect(cli).toContain("--older-than");
    expect(cli).toContain("GRANT_REVERIFY_AFTER_DAYS");
  });

  it("Inngest bakım işi yeniden doğrulamayı çağırır (uyarı logu değil)", () => {
    const job = readSrc("lib/yetkinhibe/grant-catalog-verify.ts");
    expect(job).toContain("verifyGrantCall");
    expect(job).toContain("GRANT_REVERIFY_AFTER_DAYS");
    expect(job).toContain("quarantineGrantCalls");
    expect(readSrc("lib/kernel/jobs/inngest.ts")).toContain('id: "grant-catalog-verify"');
  });
});

describe("Ş2 — ücretli hat tazeliği atlamıyor", () => {
  it("`now` opsiyonel değil; imza varsayılan taşır", () => {
    const source = readSrc("lib/yetkinhibe/match-grant-programs-for-brief.ts");
    expect(source).toContain("now: Date = new Date()");
    expect(source).not.toContain("now?: Date");
    // Eski kaçış dalı (`now` yoksa yalnız null kontrolü) silinmiş olmalı.
    expect(source).not.toContain("now ? isGrantVerificationFresh");
    expect(source).toContain("isGrantVerificationFresh(verifiedAt, now)");
    // Sıralama yüzeyi de aynı kapıdan geçer.
    const fit = readSrc("lib/yetkinhibe/program-fit.ts");
    expect(fit).toContain("isGrantVerificationFresh(text(call.sourceVerifiedAt), now)");
    expect(fit).not.toContain("now?: Date");
  });

  it("engine ücretli dosya çağrısına aktif `now` geçer", () => {
    const engine = readSrc("lib/tezgah/grant/engine.ts");
    // Satır sonu CRLF olabilir; desen boşluk sınıfıyla eşleşir.
    expect(engine).toMatch(/matchGrantProgramsForBrief\([\s\S]*?calls,\s*now,\s*\)/);
    expect(engine).not.toMatch(/matchGrantProgramsForBrief\([\s\S]{0,900}?\bcalls,\s*\)/);
  });

  it("48 gün eski doğrulama ücretli hat eşleşmesinde reddedilir; panel ile aynı sonucu verir", () => {
    // Doğrulama 48 gün önce; `now` 10 Ocak 2027. Tazelik penceresi 30 gün.
    const now = new Date("2027-01-10T12:00:00.000Z");
    const verifiedAt = new Date(now.getTime() - 48 * DAY_MS).toISOString();
    const ageDays = (now.getTime() - new Date(verifiedAt).getTime()) / DAY_MS;
    expect(ageDays).toBe(48);
    expect(isGrantVerificationFresh(verifiedAt, now)).toBe(false);

    const stale: GrantBriefCall = {
      id: "eskimis",
      title: "48 gün eski doğrulama",
      sourceLabel: "KOSGEB",
      officialInfoUrl: "https://www.kosgeb.gov.tr/",
      status: "ACTIVE",
      remainingDays: 40,
      poolAmountMinor: null,
      maxSupportMinor: 100_000_00,
      supportRatioBps: 5000,
      sourceVerifiedAt: verifiedAt,
      eligibility: { ...OPEN_ELIGIBILITY },
    };

    // Ücretli hat (engine) artık `now` geçtiği için satır uygun listeye giremez.
    const dossierMatch = matchGrantProgramsForBrief(BRIEF, [stale], now);
    expect(dossierMatch.eligible).toEqual([]);
    expect(dossierMatch.unverified.map((row) => row.grantId)).toEqual(["eskimis"]);

    // Panel aynı sonucu verir: tek doğruluk.
    const panel = rankGrantProgramFits(BRIEF, [stale], now);
    expect(panel[0]?.eligible).toBe(false);
    expect(panel[0]?.reasons.join(" ")).toContain("doğrulanmadı");

    // Taze satır aynı brifte uygundur: test yalnız tazelikten dolayı kırmızı değil.
    const fresh = { ...stale, sourceVerifiedAt: new Date(now.getTime() - 2 * DAY_MS).toISOString() };
    expect(matchGrantProgramsForBrief(BRIEF, [fresh], now).unverified).toEqual([]);
  });
});

describe("Ş11 — GET okuma yolu yazmıyor", () => {
  const mocks = vi.hoisted(() => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    revisionCreate: vi.fn(),
  }));

  beforeEach(() => {
    mocks.findMany.mockReset();
    mocks.findUnique.mockReset();
    mocks.update.mockReset();
    mocks.revisionCreate.mockReset();
  });

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
      eligibilityJson: { ...OPEN_ELIGIBILITY },
      requiredDocuments: [],
      tags: [],
      officialInfoUrl,
      publicationUrl: null,
      sourceVerifiedAt: SEED_VERIFIED,
      isPublished: true,
      dataVersion: 3,
    };
  }

  it("bozuk satır okuma anında bellekte elenir; DB update çağrılmaz", async () => {
    vi.resetModules();
    vi.doMock("@/lib/kernel/db", () => ({
      getPrisma: () => ({
        yetkinhibeGrantCall: { findMany: mocks.findMany, findUnique: mocks.findUnique, update: mocks.update },
        hibeGrantCallRevision: { create: mocks.revisionCreate },
      }),
    }));
    const { loadYetkinhibeGrantCatalog: load } = await import("@/lib/yetkinhibe/grant-catalog-live");
    mocks.findMany.mockResolvedValue([
      liveRow("saglam", "https://www.kosgeb.gov.tr/"),
      liveRow("bozuk", "http://ornek.test/ilan"),
    ]);

    const served = await load(new Date("2026-11-23T12:00:00.000Z"));
    expect(served.map((row) => row.id)).toEqual(["saglam"]);
    // Okuma yolu kalıcı yazma yapmaz (Ş11 / B-08).
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revisionCreate).not.toHaveBeenCalled();
    vi.doUnmock("@/lib/kernel/db");
    vi.resetModules();
  });

  it("kalıcı karantina ayrı bakım işlevindedir ve revizyon yazar", async () => {
    vi.resetModules();
    vi.doMock("@/lib/kernel/db", () => ({
      getPrisma: () => ({
        yetkinhibeGrantCall: { findMany: mocks.findMany, findUnique: mocks.findUnique, update: mocks.update },
        hibeGrantCallRevision: { create: mocks.revisionCreate },
      }),
    }));
    const { quarantineGrantCalls: quarantine } = await import("@/lib/yetkinhibe/grant-catalog-live");
    mocks.findUnique.mockResolvedValue({ id: "bozuk", isPublished: true, dataVersion: 3 });
    mocks.update.mockResolvedValue({ id: "bozuk", isPublished: false, dataVersion: 4 });
    mocks.revisionCreate.mockResolvedValue({ id: "rev" });

    const result = await quarantine(["bozuk", "unknown", ""]);
    expect(result.quarantined).toEqual(["bozuk"]);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "bozuk" },
      data: { isPublished: false, dataVersion: 4 },
    });
    expect(mocks.revisionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ callId: "bozuk", action: "QUARANTINE", dataVersion: 4 }),
    });
    vi.doUnmock("@/lib/kernel/db");
    vi.resetModules();
  });

  it("okuma modülünde karantina çağrısı yalnız bakım işlevinde durur", () => {
    const live = readSrc("lib/yetkinhibe/grant-catalog-live.ts");
    // Okuma işlevinin gövdesi: imzadan sonraki ilk "}" bloğu.
    const loadStart = live.indexOf("export async function loadYetkinhibeGrantCatalog");
    expect(loadStart).toBeGreaterThan(-1);
    const loadEnd = live.indexOf("export async function scanYetkinhibeGrantCatalog");
    expect(loadEnd).toBeGreaterThan(loadStart);
    const loadBody = live.slice(loadStart, loadEnd);
    // Gövdede karantina **çağrısı** olmamalı (yorum satırı olabilir).
    expect(loadBody).not.toMatch(/await quarantineGrantCalls\(/);
    expect(loadBody).not.toContain(".update(");
    expect(loadBody).not.toContain(".create(");
    // Karantina yalnız bakım işinde çağrılır.
    expect(readSrc("lib/yetkinhibe/grant-catalog-verify.ts")).toContain("await quarantineGrantCalls");
  });
});

describe("Ş1 — tazelik davranışı katalog satırlarında", () => {
  it("tohumun tamamı 31 Aralık 2026'da bakımsız tazelik kapısından düşer", () => {
    const entries = GRANT_CALL_SEEDS_2027.map(seedRow);
    const stale = entries.filter((row) => !isGrantVerificationFresh(row.sourceVerifiedAt, DEC31_2026));
    expect(stale.length).toBe(entries.length);
  });

  it("kriter listesi 11 satır kalır (yatırım odağı beyanı eklendi)", () => {
    const criteria = grantBriefCriteria(BRIEF, { ...OPEN_ELIGIBILITY, investmentFocus: ["ihracat"] });
    expect(criteria.map((row) => row.key)).toContain("investment");
    expect(criteria).toHaveLength(11);
    const focus = criteria.find((row) => row.key === "investment");
    expect(focus?.passed).toBe(false);
  });
});

// `loadYetkinhibeGrantCatalog` ve `loadLive` aynı işlevdir; import adı okunabilirlik içindir.
void loadYetkinhibeGrantCatalog;
void loadLive;
