import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildKurumsalShortlistCsv,
  kurumsalCsvCell,
} from "@/lib/sales/kurumsal-shortlist-csv";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("kurumsal IDOR mühürleri (F1.5 / O-04)", () => {
  it("PATCH ve export sahiplik filtresi ownerUserId taşır", () => {
    const patch = src("app/api/kurumsal/ilanlar/[id]/route.ts");
    const exportRoute = src("app/api/kurumsal/ilanlar/[id]/export/route.ts");
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(patch).toContain('auth = "session"');
    expect(patch).toContain("setKurumsalJobActive");
    expect(exportRoute).toContain('auth = "session"');
    expect(exportRoute).toContain("loadKurumsalShortlistCsvRows");
    expect(load).toContain("ownerUserId: input.ownerUserId");
    expect(load).toContain("setKurumsalJobActive");
    expect(load).toContain("loadKurumsalShortlistCsvRows");
    expect(load).toContain('throw new NotFoundError("İlan bulunamadı.")');
  });

  it("çapraz işveren PATCH/export yolu NotFound ile kapanır (sahip filtresi)", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    const setAt = load.indexOf("export async function setKurumsalJobActive");
    const exportAt = load.indexOf("export async function loadKurumsalShortlistCsvRows");
    expect(setAt).toBeGreaterThan(-1);
    expect(exportAt).toBeGreaterThan(-1);
    const setBlock = load.slice(setAt, setAt + 800);
    const exportBlock = load.slice(exportAt, exportAt + 700);
    expect(setBlock).toContain("ownerUserId: input.ownerUserId");
    expect(exportBlock).toContain("ownerUserId: input.ownerUserId");
    expect(setBlock).toContain("NotFoundError");
    expect(exportBlock).toContain("NotFoundError");
  });

  it("CSV ham cvSummary taşımaz ve formül enjeksiyonunu kaçırır", () => {
    const csv = buildKurumsalShortlistCsv([
      {
        candidateName: "=CMD()",
        candidateEmail: "+hack@evil.test",
        weightedScore: 88,
        band: "SHORTLISTED",
        certificateCode: "a".repeat(64),
        appliedAt: new Date("2026-11-01T10:00:00.000Z"),
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).not.toContain("cvSummary");
    expect(csv).not.toContain("CV özeti");
    expect(csv).toContain("Mühür doğrulama hash");
    expect(kurumsalCsvCell("=CMD()")).toBe("'=CMD()");
    expect(kurumsalCsvCell("@SUM(1)")).toBe("'@SUM(1)");
    expect(csv).toContain("'=CMD()");
  });
});
