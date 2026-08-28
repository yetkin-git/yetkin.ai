import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import {
  FREELANCER_CATALOG_SEEDS,
  FREELANCER_ESCROW_HOLD_UNIT_KEY,
  FREELANCER_JOB_FLOOR_UNIT_KEY,
} from "@/lib/freelancer/seed";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const CASH_TABLES = [
  "wallets",
  "ledger_entries",
  "escrow_holds",
  "payment_orders",
  "career_visa_stamps",
  "freelancer_contracts",
  "freelancer_bids",
];

describe("T4 nakit döngüsü — T2-0 katalog ve migrate kesmez", () => {
  it("görsel katalog tohumu freelancer hold bandını ve nakit tablolarını silmez", () => {
    const image = REQUIRED_CATALOG_DEFINITIONS.find((row) => row.unitKey === "generation:image");
    expect(image?.seedAmountMinor).toBe(250);

    const catalogSql = readSrc("supabase/migrations/20260814040000_price_catalog_definitions.sql");
    expect(catalogSql).toContain("'generation:image'");
    expect(catalogSql).toMatch(/ON CONFLICT \(module_key, unit_key\) DO UPDATE/);
    expect(catalogSql).toMatch(/THEN price_catalog_entries\.amount_minor/);

    const prismaSql = readSrc(
      "prisma/migrations/20260815221500_studio_generation_image_catalog/migration.sql",
    );
    expect(prismaSql).toContain("'generation:image'");
    expect(prismaSql).toMatch(/INSERT INTO/);
    expect(prismaSql).not.toMatch(/\bDELETE FROM\b/i);
    expect(prismaSql).not.toMatch(/\bTRUNCATE\b/i);
    for (const table of CASH_TABLES) {
      expect(prismaSql, table).not.toContain(table);
    }
  });

  it("freelancer SQL tohumu emanet tabanı ve hold BPS basar; sahte bakiye/vize yok", () => {
    const sql = readSrc("supabase/migrations/20260814110000_freelancer_job_seed.sql");
    expect(sql).toContain(FREELANCER_JOB_FLOOR_UNIT_KEY);
    expect(sql).toContain(FREELANCER_ESCROW_HOLD_UNIT_KEY);
    expect(sql).toContain("Sahte kullanıcı / bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok");
    const hold = FREELANCER_CATALOG_SEEDS.find((row) => row.unitKey === FREELANCER_ESCROW_HOLD_UNIT_KEY);
    expect(hold?.seedAmountMinor).toBe(HOLD_BPS_DEFAULT);
    expect(sql).toContain(String(HOLD_BPS_DEFAULT));
    expect(sql).not.toMatch(/INSERT INTO public\.wallets/i);
    expect(sql).not.toMatch(/INSERT INTO public\.career_visa_stamps/i);
    expect(sql).not.toMatch(/INSERT INTO public\.payment_orders/i);
    expect(sql).not.toMatch(/INSERT INTO public\.escrow_holds/i);
  });

  it("ops:migrate sırası katalogdan sonra freelancer tohumunu uygular; sekiz SQL kilitlidir", () => {
    const script = `${readSrc("scripts/ops-migrate.ts")}\n${readSrc("scripts/ops-migrate-lib.ts")}`;
    expect(script).toContain("20260814040000_price_catalog_definitions.sql");
    expect(script).toContain("20260814110000_freelancer_job_seed.sql");
    expect(script.indexOf("price_catalog_definitions.sql")).toBeLessThan(
      script.indexOf("freelancer_job_seed.sql"),
    );
    const dir = join(ROOT, "supabase", "migrations");
    const sqlFiles = readdirSync(dir).filter((name) => name.endsWith(".sql")).sort();
    expect(sqlFiles).toHaveLength(8);
  });

  it("bellek döngüsü helper'ı Studio kataloguna bağlanmaz; clearing + vize taşır", () => {
    const helper = readSrc("tests/helpers/cash-loop-journey.ts");
    expect(helper).toContain("clearSuccessfulPaymentOrder");
    expect(helper).toContain("releaseFreelancerContract");
    expect(helper).toContain("issueCareerVisaStamp");
    expect(helper).toContain("FREELANCER_RELEASE");
    expect(helper).toContain("amountMinor: 0");
    expect(helper).not.toContain("@/lib/studio");
    expect(helper).not.toContain("generation:image");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
