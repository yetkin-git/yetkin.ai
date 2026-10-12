import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogSqlPreservesOperatorPrice } from "../../scripts/ops-migrate-lib";

const SQL = readFileSync(
  join(process.cwd(), "supabase", "migrations", "20261005160000_junior_yearly_price_seed.sql"),
  "utf8",
);

describe("Junior yıllık fiyat tohumu (T-11)", () => {
  it("yeniden tohum operatörün is_active kararını ezmez", () => {
    const updateBlock = SQL.slice(SQL.indexOf("DO UPDATE"));
    expect(updateBlock).toContain("is_active = price_catalog_entries.is_active,");
    expect(updateBlock).not.toMatch(/is_active\s*=\s*true/);
  });

  it("ekleme yolu yeni satırı aktif başlatır; mevcut kapalı satırı açmaz", () => {
    const values = SQL.slice(SQL.indexOf("VALUES"), SQL.indexOf("ON CONFLICT"));
    expect(values).toMatch(/'TRY',\s*true,/);
  });

  it("operatör tutarı koruması ve tutar tohumu değişmedi", () => {
    expect(catalogSqlPreservesOperatorPrice(SQL)).toBe(true);
    expect(SQL).not.toMatch(/^\s*amount_minor\s*=\s*EXCLUDED\.amount_minor\s*,?\s*$/m);
    expect(SQL).toContain("549900");
  });
});
