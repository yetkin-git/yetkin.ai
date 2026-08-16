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
import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";

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
    expect(page).toContain("Forbidden");
    expect(page).toContain("AuthNeeded");
    expect(page).not.toContain("fetch(");
    expect(page).not.toContain("yetkin.ai");
  });

  it("okuma Super Admin kilidinden sonra findMany; yazma ayrı PATCH motoruna gider", () => {
    const load = readSrc("lib/kernel/admin/load.ts");
    const list = readSrc("components/kernel/admin-catalog-list.tsx");
    const page = readSrc("app/(kernel)/admin/page.tsx");
    const form = readSrc("components/kernel/admin-catalog-amount-form.tsx");
    const write = readSrc("lib/kernel/admin/catalog-write.ts");
    const route = readSrc("app/api/(kernel)/admin/catalog/route.ts");
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("isSuperAdminUser(userId)");
    expect(load).toContain("prisma.priceCatalogEntry.findMany");
    expect(load).toContain("DATABASE_URL");
    expect(load).not.toContain("findActiveEntry");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(list).toContain("AdminCatalogAmountForm");
    expect(list).toContain("Fiyat değiştir");
    expect(page).toContain("amountMinor");
    expect(form).toContain("onSubmit");
    expect(form).toContain('method: "PATCH"');
    expect(form).toContain("CATALOG_WRITE_PATH");
    expect(form).not.toContain("runCatalogPatch");
    expect(form).not.toContain("getPrisma");
    expect(form).not.toContain("@/lib/kernel/admin/catalog-write");
    expect(write).toContain("assertHoldBps");
    expect(write).toContain("updatedBy");
    expect(write).toContain("assertSuperAdminUserId");
    expect(write).toContain("toAmountMinor");
    expect(route).toContain('export const auth = "admin"');
    expect(route).toContain("export async function PATCH");
    expect(route).toContain("requireSuperAdmin");
    expect(route).toContain("runCatalogPatch");
    expect(`${page}\n${list}\n${form}`).not.toContain("/api/admin/pricing");
  });
});
