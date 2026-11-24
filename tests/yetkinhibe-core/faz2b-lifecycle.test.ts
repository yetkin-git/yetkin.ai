import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_OPENABLE_UNITS } from "@/lib/kernel/admin/catalog-write";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { grantDossierHref } from "@/lib/commerce/os-growth";
import { selectVerifiedGrantRibbon } from "@/lib/commerce/grant-ribbon";
import { matchAgencyClientsToCatalog, type AgencyClientCard } from "@/lib/yetkinhibe/agency-match";
import {
  deadlineReminder,
  daysUntilDeadline,
  hibeDocumentStatusLabel,
  nextGrantLifecyclePhase,
  phaseAdvanceError,
} from "@/lib/yetkinhibe/grant-lifecycle";
import { HIBE_TABS } from "@/lib/yetkinhibe/os-brief";
import { isAgencyMode, parseGrantProfileModeParam } from "@/lib/yetkinhibe/grant-profile-mode";
import {
  companyProfileBrief,
  openCallsForCompanyProfile,
  radarGrantText,
  type RadarCompanyProfile,
} from "@/lib/yetkinhibe/radar-profile";
import { prefillFromStore } from "@/lib/yetkinhibe/store-prefill";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

const NOW = new Date("2026-11-16T09:00:00.000Z");
const OPEN: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
  eligibleRegionCodes: ["34"],
  audiences: ["mevcut_kobi"],
  nacePrefixes: ["47"],
};

function call(overrides: Partial<GrantBriefCall> = {}): GrantBriefCall {
  return {
    id: "cagri-47",
    title: "Perakende çağrısı",
    sourceLabel: "KOSGEB",
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    status: "ACTIVE",
    remainingDays: 40,
    poolAmountMinor: null,
    maxSupportMinor: 100,
    supportRatioBps: 5000,
    sourceVerifiedAt: "2026-11-10T00:00:00.000Z",
    eligibility: { ...OPEN },
    ...overrides,
  };
}

const PROFILE: RadarCompanyProfile = {
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "47",
  investmentFocus: "makine_techizat",
  employeeCount: 12,
  companyAgeYears: 4,
  rdMaturityLevel: "NONE",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

function client(id: string, overrides: Partial<AgencyClientCard> = {}): AgencyClientCard {
  return {
    id,
    companyName: `Müşteri ${id}`,
    naceGroup: "47",
    provinceCode: "34",
    audience: "mevcut_kobi",
    employeeCount: 12,
    companyAgeYears: 4,
    rdMaturityLevel: "NONE",
    exportActive: false,
    ...overrides,
  };
}

describe("Faz 2B yaşam döngüsü", () => {
  it("fazı yalnız bir sonraki adıma geçirir", () => {
    expect(nextGrantLifecyclePhase("APPLICATION_APPROVAL")).toBe("INTERIM_REPORT");
    expect(nextGrantLifecyclePhase("PAYOUT")).toBeNull();
    expect(phaseAdvanceError("APPLICATION_APPROVAL", "PAYOUT")).toMatch(/atlanamaz/);
    expect(phaseAdvanceError("APPLICATION_APPROVAL", "INTERIM_REPORT")).toBeNull();
  });

  it("uyarıyı 7, 3 ve 1 gün kala üretir", () => {
    const deadline = new Date("2026-11-23T09:00:00.000Z");
    expect(daysUntilDeadline(deadline, NOW)).toBe(7);
    expect(deadlineReminder(deadline, NOW)?.days).toBe(7);
    expect(deadlineReminder(deadline, new Date("2026-11-20T09:00:00.000Z"))?.days).toBe(3);
    expect(deadlineReminder(deadline, new Date("2026-11-22T09:00:00.000Z"))?.severity).toBe("critical");
    expect(deadlineReminder(deadline, new Date("2026-11-18T09:00:00.000Z"))).toBeNull();
  });

  it("evrak durum etiketlerini yazar", () => {
    expect(hibeDocumentStatusLabel("approved")).toBe("Onaylı");
    expect(hibeDocumentStatusLabel("pending")).toBe("Bekliyor");
    expect(hibeDocumentStatusLabel("missing")).toBe("Eksik");
    expect(hibeDocumentStatusLabel("rejected")).toBe("Red");
  });

  it("sahte yaşam döngüsü üreticisi yoktur", async () => {
    const mod = await import("@/lib/yetkinhibe/grant-lifecycle");
    expect(Object.keys(mod)).not.toContain("buildGrantLifecycleState");
  });
});

describe("Faz 2B ajans matrisi ve radar", () => {
  it("yirmi müşteriyi açık çağrıyla eşler ve yatırım kısıtını dışarıda bırakır", () => {
    const clients = Array.from({ length: 20 }, (_, index) => client(`musteri-${index + 1}`));
    const focused = call({
      id: "yatirim",
      title: "Yatırım kısıtlı",
      eligibility: { ...OPEN, investmentFocus: ["arge"] },
    });
    const matrix = matchAgencyClientsToCatalog(clients, [call(), focused], NOW);
    expect(matrix).toHaveLength(20);
    expect(matrix[0]?.eligible.map((row) => row.grantId)).toEqual(["cagri-47"]);
    expect(matrix[0]?.incomplete.map((row) => row.grantId)).toEqual(["yatirim"]);
    expect(isAgencyMode(parseGrantProfileModeParam("agency"))).toBe(true);
  });

  it("radarı il, NACE, kitle ve ölçeğe göre süzer", () => {
    const wide = call();
    const otherNace = call({
      id: "yazilim",
      title: "Yazılım çağrısı",
      eligibility: { ...OPEN, nacePrefixes: ["62"] },
    });
    const tooBig = call({
      id: "buyuk",
      title: "Büyük ölçek",
      eligibility: { ...OPEN, minEmployeeCount: 50, maxEmployeeCount: 250 },
    });
    const unverified = call({ id: "dogrulanmamis", sourceVerifiedAt: null });
    const rows = openCallsForCompanyProfile(PROFILE, [wide, otherNace, tooBig, unverified], NOW);
    expect(rows.map((row) => row.grantId)).toEqual(["cagri-47"]);
    expect(companyProfileBrief({ ...PROFILE, naceGroup: "99" })).toBeNull();
    expect(radarGrantText(null, false, [wide], NOW)).toMatch(/profilin kayıtlı değil/);
    expect(radarGrantText(PROFILE, true, [otherNace], NOW)).toMatch(/uyan doğrulanmış açık çağrı yok/);
  });

  it("bildirim bağlantısı hibe masasına gider", () => {
    const source = readFileSync(join(process.cwd(), "lib", "jobs", "weekly-radar.ts"), "utf8");
    const panel = readFileSync(join(process.cwd(), "lib", "yetkinhibe", "radar-profile.ts"), "utf8");
    expect(source).toContain("HIBE_PANEL_PATH");
    expect(panel).toContain('"/panel/hibe"');
    expect(source).not.toContain("/tezgah");
    expect(source).not.toContain("take: 3");
  });
});

describe("Faz 2B fiyat, mağaza ve şerit", () => {
  it("hibe dosya ve ajans birimleri katalogda açılır", () => {
    expect(CATALOG_OPENABLE_UNITS.some((row) => row.moduleKey === "hibe" && row.unitKey === "dossier")).toBe(true);
    expect(CATALOG_OPENABLE_UNITS.some((row) => row.moduleKey === "hibe" && row.unitKey === "agency")).toBe(true);
  });

  it("mağaza kategorisi ve ölçeği profil alanına döner", () => {
    const small = prefillFromStore({ storeName: "Moda Evi", categories: ["Giyim", "Giyim"] });
    expect(small.nace).toBe("13");
    expect(small.isletme).toBe("esnaf");
    expect(small.yatirim).toBe("ihracat");
    const wide = prefillFromStore({
      storeName: "Market",
      categories: Array.from({ length: 25 }, () => "Perakende"),
    });
    expect(wide.isletme).toBe("kobi");
    expect(wide.nace).toBe("47");
    expect(prefillFromStore({ storeName: "Boş", categories: [] }).scaleLabel).toMatch(/uydurulmadı/);
    expect(grantDossierHref("Market", "store-1234")).toContain("store=store-1234");
    expect(grantDossierHref("Market", "store-1234")).toContain("sekme=analiz");
    expect(grantDossierHref("Market")).toContain("sekme=proje");
  });

  it("doğrulanmamış hibe satırını şeride almaz", () => {
    const lines = selectVerifiedGrantRibbon(
      [
        {
          title: "Doğrulandı",
          sourceLabel: "KOSGEB",
          remainingDays: 10,
          status: "ACTIVE",
          sourceVerifiedAt: "2026-11-10T00:00:00.000Z",
        },
        {
          title: "Doğrulanmadı",
          sourceLabel: "KOSGEB",
          remainingDays: 10,
          status: "ACTIVE",
          sourceVerifiedAt: null,
        },
      ],
      NOW,
    );
    expect(lines.map((row) => row.title)).toEqual(["Doğrulandı"]);
  });
});

describe("Faz 2B mühür yüzeyi", () => {
  it("yazma rotaları oturum ve Idempotency-Key taşır", () => {
    const root = process.cwd();
    const files = [
      "app/api/yetkinhibe/applications/route.ts",
      "app/api/yetkinhibe/applications/[id]/phase/route.ts",
      "app/api/yetkinhibe/applications/[id]/documents/route.ts",
      "app/api/yetkinhibe/clients/route.ts",
    ];
    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source).toContain('export const auth = "session"');
      expect(source).toContain("requireRailV1IdempotencyKey");
      expect(source).toContain("requireSession");
    }
  });

  it("yeni tablolar RLS sicilinde ve migration mühürlüdür", () => {
    for (const table of ["hibe_applications", "hibe_documents", "hibe_clients"]) {
      expect(RLS_FORCE_TABLES).toContain(table);
    }
    const sql = readFileSync(
      join(process.cwd(), "prisma", "migrations", "20261123220000_yetkinhibe_faz2_lifecycle", "migration.sql"),
      "utf8",
    );
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
    expect(sql).toContain("yetkin_apply_rls_owner_policies");
    expect(sql).not.toContain("FOR INSERT");
  });

  it("kokpit başvuru ve ajans sekmelerini taşır", () => {
    expect(HIBE_TABS).toEqual(["analiz", "programlar", "proje", "arsiv", "basvuru", "ajans"]);
    const cockpit = readFileSync(join(process.cwd(), "components", "hibe", "os-cockpit.tsx"), "utf8");
    expect(cockpit).toContain("Başvurularım & Evraklar");
    expect(cockpit).toContain("Ajans Modu");
    const inngest = readFileSync(join(process.cwd(), "lib", "kernel", "jobs", "inngest.ts"), "utf8");
    expect(inngest).toContain('id: "hibe-lifecycle-reminders"');
  });
});
