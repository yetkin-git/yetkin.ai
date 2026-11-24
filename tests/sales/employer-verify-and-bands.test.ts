import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { rankJobApplications } from "@/lib/sales/kurumsal-screening";

/** Canlı suite (`tests/kurumsal` donmuş disk dışıdır). Aynı mühürler `tests/kurumsal/employer-verify-and-bands.test.ts`. */

describe("Y1 / F2.1 — işveren doğrulama noindex + rozet", () => {
  it("ilan sayfası doğrulanmamışta robots noindex ve uyarı şeridi basar", () => {
    const page = readFileSync(join(process.cwd(), "app/(public)/ilan/[slug]/page.tsx"), "utf8");
    expect(page).toContain("employerVerified");
    expect(page).toContain("index: false");
    expect(page).toContain("Kurumsal kimlik doğrulaması beklemede");
    expect(page).toContain("Doğrulanmış İşveren ✓");
    expect(page).toContain("buildJobPostingJsonLd");
    expect(page).not.toContain("dangerouslySetInnerHTML");
  });

  it("Prisma taxNumber + verifiedEmployerAt + migration", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema/b2b.prisma"), "utf8");
    expect(schema).toContain("taxNumber");
    expect(schema).toContain("verifiedEmployerAt");
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261124140000_career_faz2_ecosystem/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("tax_number");
    expect(sql).toContain("verified_employer_at");
  });
});

describe("O9 / F2.4 — QUALIFIED_NOT_SHORTLISTED bandı", () => {
  it("barajı geçen ama kontenjan dışı adayı yedek listeye ayırır", () => {
    const ranked = rankJobApplications(
      [
        { id: "a", weightedScore: 95, createdAt: new Date("2026-11-01T10:00:00Z") },
        { id: "b", weightedScore: 90, createdAt: new Date("2026-11-01T11:00:00Z") },
        { id: "c", weightedScore: 85, createdAt: new Date("2026-11-01T12:00:00Z") },
        { id: "d", weightedScore: 50, createdAt: new Date("2026-11-01T09:00:00Z") },
      ],
      70,
      1,
    );
    expect(ranked.map((row) => [row.id, row.band])).toEqual([
      ["a", "SHORTLISTED"],
      ["b", "QUALIFIED_NOT_SHORTLISTED"],
      ["c", "QUALIFIED_NOT_SHORTLISTED"],
      ["d", "BELOW_THRESHOLD"],
    ]);
  });

  it("aday durum kartı band etiketlerini taşır", () => {
    const cards = readFileSync(
      join(process.cwd(), "components/career/application-status-cards.tsx"),
      "utf8",
    );
    expect(cards).toContain("data-application-band");
    const status = readFileSync(join(process.cwd(), "lib/career/application-status.ts"), "utf8");
    expect(status).toContain("QUALIFIED_NOT_SHORTLISTED");
    expect(status).toContain("Barajı geçti — yedek liste");
  });
});

describe("O4 / F2.9 — aday beyanı etiketi", () => {
  it("kokpit CV özeti üzerine doğrulanmamış metin etiketi koyar", () => {
    const cockpit = readFileSync(
      join(process.cwd(), "components/kurumsal/screening-cockpit.tsx"),
      "utf8",
    );
    expect(cockpit).toContain("Aday beyanı (doğrulanmamış metin)");
    expect(cockpit).toContain('data-candidate-claim-label="unverified"');
    expect(cockpit).toContain("Barajı geçti — yedek liste");
  });
});
