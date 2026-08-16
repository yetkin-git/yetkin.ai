import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEVLABS_CODE_UNIT_KEY, DEVLABS_MODULE_KEY } from "@/lib/devlabs/types";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";

describe("S35 katalog tanımları", () => {
  it("Studio, DevLabs, Kurumsal, Arena ve Pazaryeri taban birimlerini taşır", () => {
    const keys = REQUIRED_CATALOG_DEFINITIONS.map((row) => `${row.moduleKey}:${row.unitKey}`);
    expect(keys).toContain("studio:generation:text");
    expect(keys).toContain("studio:generation:image");
    expect(keys).toContain(`${DEVLABS_MODULE_KEY}:${DEVLABS_CODE_UNIT_KEY}`);
    expect(keys).toContain("kurumsal:job-posting:floor");
    expect(keys).toContain("arena:tender-pool:floor");
    expect(keys).toContain("pazaryeri:listing:floor");
    expect(keys).toContain("pazaryeri:listing:asset-floor");
    expect(keys).toContain("pazaryeri:doping:boost");
    for (const row of REQUIRED_CATALOG_DEFINITIONS) {
      expect(row.currencyCode).toBe("TRY");
      expect(row.unitType).toBe("MINOR");
      expect(row.seedAmountMinor).toBeGreaterThan(0);
    }
  });

  it("ops SQL tohumu sicil anahtarları ve Yetkinİlan metni ile hizalıdır", () => {
    const dir = join(process.cwd(), "supabase", "migrations");
    const file = readdirSync(dir).find((name) => name.endsWith("price_catalog_definitions.sql"));
    expect(file).toBeTruthy();
    const sql = readFileSync(join(dir, file!), "utf8");
    for (const row of REQUIRED_CATALOG_DEFINITIONS) {
      expect(sql).toContain(`'${row.moduleKey}'`);
      expect(sql).toContain(`'${row.unitKey}'`);
      expect(sql).toContain(String(row.seedAmountMinor));
      expect(sql).toContain(row.description);
    }
    expect(sql).toContain("Yetkinİlan");
    expect(sql).toMatch(/ON CONFLICT \(module_key, unit_key\) DO UPDATE/);
    expect(sql).toMatch(/price_catalog_entries\.updated_by IS NOT NULL/);
    expect(sql).toMatch(/THEN price_catalog_entries\.amount_minor/);
    expect(sql).toMatch(/updated_by = price_catalog_entries\.updated_by/);
    expect(sql).not.toMatch(/^\s*amount_minor\s*=\s*EXCLUDED\.amount_minor\s*,?\s*$/m);
  });

  it("Prisma görsel tohumu aynı birimi Super Admin updated_by kuralıyla basar", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma", "migrations", "20260815221500_studio_generation_image_catalog", "migration.sql"),
      "utf8",
    );
    const image = REQUIRED_CATALOG_DEFINITIONS.find((row) => row.unitKey === "generation:image");
    expect(image).toBeTruthy();
    expect(image?.seedAmountMinor).toBe(250);
    expect(image?.seedMinMinor).toBe(250);
    expect(sql).toContain("'generation:image'");
    expect(sql).toContain(String(image!.seedAmountMinor));
    expect(sql).toContain(image!.description);
    expect(sql).toMatch(/ON CONFLICT \("module_key", "unit_key"\) DO UPDATE/);
    expect(sql).toMatch(/"price_catalog_entries"\."updated_by" IS NOT NULL/);
    expect(sql).toMatch(/THEN "price_catalog_entries"\."amount_minor"/);
    expect(sql).toMatch(/"updated_by" = "price_catalog_entries"\."updated_by"/);
    expect(sql).not.toMatch(/^\s*"amount_minor"\s*=\s*EXCLUDED\."amount_minor"\s*,?\s*$/m);
  });

  it("Prisma DevLabs tohumu motor anahtarını Super Admin updated_by kuralıyla basar", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma", "migrations", "20260817010000_devlabs_generation_code_catalog", "migration.sql"),
      "utf8",
    );
    const code = REQUIRED_CATALOG_DEFINITIONS.find(
      (row) => row.moduleKey === DEVLABS_MODULE_KEY && row.unitKey === DEVLABS_CODE_UNIT_KEY,
    );
    expect(code).toBeTruthy();
    expect(code?.seedAmountMinor).toBe(150);
    expect(code?.seedMinMinor).toBe(150);
    expect(sql).toContain(`'${DEVLABS_MODULE_KEY}'`);
    expect(sql).toContain(`'${DEVLABS_CODE_UNIT_KEY}'`);
    expect(sql).toContain(String(code!.seedAmountMinor));
    expect(sql).toContain(code!.description);
    expect(sql).toMatch(/ON CONFLICT \("module_key", "unit_key"\) DO UPDATE/);
    expect(sql).toMatch(/"price_catalog_entries"\."updated_by" IS NOT NULL/);
    expect(sql).toMatch(/THEN "price_catalog_entries"."amount_minor"/);
    expect(sql).toMatch(/"updated_by" = "price_catalog_entries"."updated_by"/);
    expect(sql).not.toMatch(/^\s*"amount_minor"\s*=\s*EXCLUDED\."amount_minor"\s*,?\s*$/m);
  });
});
