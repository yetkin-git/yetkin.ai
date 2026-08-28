import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADMIN_EMPTY_LABEL,
  ADMIN_UNSET_LABEL,
  HOLD_BPS_BAND_LABEL,
  catalogFloorMinor,
  catalogModuleLabel,
  catalogUnitTypeLabel,
  countCatalogBpsEntries,
  countCatalogModules,
  formatCatalogBand,
  formatCatalogBps,
  formatCatalogValue,
  groupCatalogEntriesByModule,
  isHoldBpsInCodeBand,
} from "@/lib/kernel/admin/display";
import type { SealedCatalogEntry } from "@/lib/kernel/admin/types";
import {
  ADMIN_ACADEMY_SHELTER_PATH,
  ADMIN_DASHBOARD_SHELTER_PATH,
  ADMIN_FREELANCER_SHELTER_PATH,
  ADMIN_SURFACE_PATH,
  CATALOG_WRITE_PATH,
} from "@/lib/kernel/admin/types";
import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SAMPLE: SealedCatalogEntry = {
  id: "cat_studio_generation_text",
  moduleKey: "studio",
  unitKey: "generation:text",
  unitType: "MINOR",
  amountMinor: 100 as SealedCatalogEntry["amountMinor"],
  currencyCode: "TRY",
  isActive: true,
  minMinor: 100 as SealedCatalogEntry["minMinor"],
  maxMinor: null,
  description: "Studio metin üretim tabanı",
  updatedBy: null,
  updatedAt: new Date("2026-08-14T17:03:00.000Z"),
};

const BPS_SAMPLE: SealedCatalogEntry = {
  ...SAMPLE,
  id: "cat_kernel_hold",
  moduleKey: "freelancer",
  unitKey: "escrow:hold",
  unitType: "BPS",
  amountMinor: 1000 as SealedCatalogEntry["amountMinor"],
  minMinor: 1000 as SealedCatalogEntry["minMinor"],
  maxMinor: 1500 as SealedCatalogEntry["maxMinor"],
  description: "Platform hold",
};

describe("admin katalog yüzeyi", () => {
  it("modül etiketini oda sicilinden okur; BPS yüzdeye çevirir", () => {
    expect(catalogModuleLabel("studio")).toBe("Studio");
    expect(catalogModuleLabel("pazaryeri")).toBe("Yetkinİlan");
    expect(catalogModuleLabel("unknown-module")).toBe("unknown-module");
    expect(catalogUnitTypeLabel("MINOR")).toBe("Minor");
    expect(catalogUnitTypeLabel("BPS")).toBe("Hold bps");
    expect(formatCatalogBps(1000)).toBe("1000 bps (%10)");
    expect(formatCatalogBps(1500)).toBe("1500 bps (%15)");
    expect(formatCatalogBps(1250)).toBe("1250 bps (%12.50)");
    expect(HOLD_BPS_BAND_LABEL).toBe(`${HOLD_BPS_MIN}–${HOLD_BPS_MAX} bps`);
    expect(isHoldBpsInCodeBand(1000)).toBe(true);
    expect(isHoldBpsInCodeBand(1500)).toBe(true);
    expect(isHoldBpsInCodeBand(999)).toBe(false);
    expect(isHoldBpsInCodeBand(1501)).toBe(false);
    expect(ADMIN_EMPTY_LABEL).toBe("Henüz katalog satırı yok");
    expect(ADMIN_UNSET_LABEL).toBe("—");
    expect(ADMIN_SURFACE_PATH).toBe("/admin");
    expect(CATALOG_WRITE_PATH).toBe("/api/admin/catalog");
    expect(ADMIN_DASHBOARD_SHELTER_PATH).toBe("/dashboard");
    expect(ADMIN_ACADEMY_SHELTER_PATH).toBe("/academy");
    expect(ADMIN_FREELANCER_SHELTER_PATH).toBe("/freelancer");
  });

  it("tabanı minMinor yoksa amountMinor kabul eder; uydurma tavan yazmaz", () => {
    expect(catalogFloorMinor(SAMPLE)).toBe(100);
    expect(formatCatalogValue("MINOR", SAMPLE.amountMinor, "TRY")).toMatch(/₺/);
    expect(formatCatalogValue("MINOR", null, "TRY")).toBe(ADMIN_UNSET_LABEL);
    expect(formatCatalogBand(SAMPLE)).toContain("→");
    expect(formatCatalogBand(SAMPLE)).toContain(ADMIN_UNSET_LABEL);
    expect(formatCatalogValue("BPS", BPS_SAMPLE.amountMinor, "TRY")).toBe("1000 bps (%10)");
    expect(countCatalogModules([SAMPLE, BPS_SAMPLE])).toBe(2);
    expect(countCatalogBpsEntries([SAMPLE, BPS_SAMPLE])).toBe(1);
    const groups = groupCatalogEntriesByModule([SAMPLE, { ...SAMPLE, id: "b", unitKey: "generation:image" }]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries).toHaveLength(2);
  });

  it("SUPER_ADMIN_USER_ID eşleşmezse reddeder; boş env kimseyi admin yapmaz", () => {
    const previous = process.env.SUPER_ADMIN_USER_ID;
    try {
      process.env.SUPER_ADMIN_USER_ID = "11111111-1111-4111-8111-111111111111";
      expect(isSuperAdminUser("11111111-1111-4111-8111-111111111111")).toBe(true);
      expect(isSuperAdminUser("22222222-2222-4222-8222-222222222222")).toBe(false);
      process.env.SUPER_ADMIN_USER_ID = "  ";
      expect(isSuperAdminUser("11111111-1111-4111-8111-111111111111")).toBe(false);
      delete process.env.SUPER_ADMIN_USER_ID;
      expect(isSuperAdminUser("11111111-1111-4111-8111-111111111111")).toBe(false);
    } finally {
      if (previous == null) {
        delete process.env.SUPER_ADMIN_USER_ID;
      } else {
        process.env.SUPER_ADMIN_USER_ID = previous;
      }
    }
  });

  it("sayfa RoomSeal taşımaz; oturum + Super Admin kilidi ile katalog çeker", () => {
    const page = readSrc("app/(kernel)/admin/page.tsx");
    expect(page).not.toContain("RoomSeal");
    expect(page).toContain("loadAdminCatalogBoard");
    expect(page).toContain("resolveSuperAdminAccess");
    expect(page).toContain("AdminCatalogList");
    expect(page).toContain("AdminPriceDecisionLedger");
    expect(page).toContain("AdminAuditChambers");
    expect(page).toContain("AdminShelterActions");
    expect(page).toContain("Forbidden");
    expect(page).toContain("AuthNeeded");
    expect(page).toContain("SEN_VOICE.admin");
    expect(page).not.toContain("örnek düzen");
    expect(page).not.toContain('tone="amber"');
    expect(page).not.toContain("unbound");
    expect(page).toContain("loadSoft");
    expect(page).toContain("showEmptyActions={false}");
    expect(page).not.toContain("fetch(");
    expect(page).not.toContain("yetkin.ai");
  });

  it("okuma Super Admin kilidinden sonra findMany; yazma ayrı PATCH motoruna gider", () => {
    const load = readSrc("lib/kernel/admin/load.ts");
    const list = readSrc("components/kernel/admin-catalog-list.tsx");
    const page = readSrc("app/(kernel)/admin/page.tsx");
    const form = readSrc("components/kernel/admin-catalog-amount-form.tsx");
    const dialog = readSrc("components/kernel/admin-confirm-dialog.tsx");
    const shelter = readSrc("components/kernel/admin-shelter-actions.tsx");
    const audit = readSrc("components/kernel/admin-audit-chambers.tsx");
    const write = readSrc("lib/kernel/admin/catalog-write.ts");
    const route = readSrc("app/api/(kernel)/admin/catalog/route.ts");
    const sen = readSrc("lib/copy/sen-voice/admin.ts");
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("isSuperAdminUser(userId)");
    expect(load).toContain("prisma.priceCatalogEntry.findMany");
    expect(load).toContain("prisma.priceCatalogDecisionLedger.findMany");
    expect(load).toContain("DATABASE_URL");
    expect(load).not.toContain("findActiveEntry");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(list).toContain("AdminCatalogAmountForm");
    expect(list).toContain("Fiyat değiştir");
    expect(list).toContain("ADMIN_SEN");
    expect(list).toContain("showEmptyActions");
    expect(list).toContain('variant="primary"');
    expect(list).not.toContain('tone="amber"');
    expect(list).not.toContain("örnek düzen");
    expect(list).not.toContain("unbound");
    expect(list).toContain("ADMIN_DASHBOARD_SHELTER_PATH");
    expect(list).toContain("ADMIN_ACADEMY_SHELTER_PATH");
    expect(list).toContain("ADMIN_FREELANCER_SHELTER_PATH");
    expect(list).toContain("ACADEMY_CURRICULUM_REVISIONS_PATH");
    expect(shelter).toContain("ADMIN_FREELANCER_SHELTER_PATH");
    expect(shelter).toContain("ACADEMY_CURRICULUM_REVISIONS_PATH");
    expect(audit).toContain("copy.audit");
    expect(audit).toContain('variant="primary"');
    expect(audit).toContain("ADMIN_ACADEMY_SHELTER_PATH");
    expect(sen).toContain("amountMinor");
    expect(sen).toContain("loadSoft");
    expect(sen).toContain("ledgerTitle");
    expect(sen).toContain("reasonCodes");
    expect(sen).toContain("academyCta");
    expect(sen).toContain("freelancerCta");
    expect(sen).toContain("audit:");
    expect(sen).toContain("confirm");
    expect(sen).toContain("pending:");
    expect(ADMIN_SEN.confirm.amountTitle).toContain("güncelle");
    expect(ADMIN_SEN.dashboardCta).toBe("Panele dön");
    expect(ADMIN_SEN.audit.title).toContain("ilan");
    expect(page).toContain("SEN_VOICE.admin");
    expect(page).toContain("honestyBody");
    expect(form).toContain("onSubmit");
    expect(form).toContain("AdminConfirmDialog");
    expect(form).toContain("pendingLabel");
    expect(form).toContain('method: "PATCH"');
    expect(form).toContain("CATALOG_WRITE_PATH");
    expect(form).toContain("unitKey");
    expect(form).toContain("reasonCode");
    expect(form).not.toContain("runCatalogPatch");
    expect(form).not.toContain("getPrisma");
    expect(form).not.toContain("@/lib/kernel/admin/catalog-write");
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain("pendingLabel");
    expect(write).toContain("assertHoldBps");
    expect(write).toContain("assertAmountWithinCatalogBand");
    expect(write).toContain("assertCatalogWriteAmountWithinBand");
    expect(write).toContain("reasonCode");
    expect(write).toContain("updatedBy");
    expect(write).toContain("assertSuperAdminActor");
    expect(write).toContain("toAmountMinor");
    expect(route).toContain('export const auth = "admin"');
    expect(route).toContain("export async function PATCH");
    expect(route).toContain("requireSuperAdmin");
    expect(route).toContain("runCatalogPatch");
    expect(`${page}\n${list}\n${form}`).not.toContain("/api/admin/pricing");
  });

  it("müfredat revizyon yüzeyi SEN + sığınak CTA + onay modalı taşır", () => {
    const revisionsPage = readSrc("app/(kernel)/admin/curriculum-revisions/page.tsx");
    const approve = readSrc("archived/components/academy-studio/curriculum-revision-approve-button.tsx");
    const board = readSrc("archived/components/academy-studio/curriculum-revision-board.tsx");
    expect(revisionsPage).toContain("ACADEMY_SEN.revisions");
    expect(revisionsPage).toContain("RevisionShelterActions");
    expect(revisionsPage).toContain("ADMIN_SURFACE_PATH");
    expect(revisionsPage).toContain("ADMIN_ACADEMY_SHELTER_PATH");
    expect(revisionsPage).toContain("ADMIN_DASHBOARD_SHELTER_PATH");
    expect(revisionsPage).toContain("ADMIN_FREELANCER_SHELTER_PATH");
    expect(revisionsPage).toContain("ACADEMY_STUDIO_GONE.revisions");
    expect(revisionsPage).not.toContain("listPendingAcademyCurriculumRevisions");
    expect(revisionsPage).not.toContain("CurriculumRevisionBoard");
    expect(revisionsPage).not.toContain("örnek düzen");
    expect(revisionsPage).not.toContain('tone="amber"');
    expect(revisionsPage).not.toContain("unbound");
    expect(approve).toContain("AdminConfirmDialog");
    expect(approve).toContain("confirmOpen");
    expect(approve).toContain("pendingLabel");
    expect(approve).toContain("ACADEMY_CURRICULUM_REVISIONS_API");
    expect(board).toContain("CurriculumRevisionApproveButton");
    expect(board).toContain("RevisionEmptyActions");
    expect(board).toContain("emptyHint");
    expect(board).toContain("ADMIN_FREELANCER_SHELTER_PATH");
    expect(board).toContain('variant="primary"');
  });
});
