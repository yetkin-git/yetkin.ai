import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  careerCvFromCoachText,
  emptyCareerCv,
  parseCareerCvDraft,
} from "@/lib/career/cv-model";
import { buildCareerCvDocx, buildCareerCvPdf, careerCvToBlocks } from "@/lib/career/cv-document";
import { parseTalentCity, projectTalentDirectory } from "@/lib/career/talent-directory";

describe("CareerCv model ve dışa aktarım (K3, Y5, O1)", () => {
  it("CareerCv taslağını doğrular ve AI koç metnini aktarır", () => {
    const parsed = parseCareerCvDraft({
      fullName: "Ayşe Yılmaz",
      headline: "E-ticaret operasyon",
      city: "İstanbul",
      summary: "Stok ve sipariş yönetiyorum.",
      skills: ["stok", "pazaryeri"],
      experiences: [],
      educations: [],
      languages: [],
      links: [],
      contactOptIn: true,
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.city).toBe("İstanbul");
      expect(parsed.value.contactOptIn).toBe(true);
    }
    const fromCoach = careerCvFromCoachText({
      fullName: "Ayşe",
      cvText: "ğüşıöçİı Türkçe karakterli özet metni burada.",
    });
    expect(fromCoach.summary).toContain("ğüşıöçİı");
  });

  it("Türkçe karakterli PDF ve DOCX üretir", () => {
    const cv = {
      ...emptyCareerCv(),
      fullName: "Çağrı Şölen",
      headline: "Ofis & Veri",
      city: "İzmir",
      summary: "ğüşıöç İı KVKK uyumlu rapor.",
      skills: ["Excel", "KVKK"],
    };
    const blocks = careerCvToBlocks(cv);
    expect(blocks.some((row) => row.kind === "h1" && row.text.includes("Çağrı"))).toBe(true);
    const pdf = buildCareerCvPdf(cv);
    const docx = buildCareerCvDocx(cv);
    expect(pdf.byteLength).toBeGreaterThan(40);
    expect(docx.byteLength).toBeGreaterThan(40);
    expect(String.fromCharCode(docx[0]!, docx[1]!)).toBe("PK");
    expect(String.fromCharCode(pdf[0]!, pdf[1]!, pdf[2]!, pdf[3]!)).toBe("%PDF");
  });

  it("il filtresi CareerCv city alanıyla çalışır (O1)", () => {
    expect(parseTalentCity("İstanbul")).toEqual({ kind: "province", name: "İstanbul" });
    const cityFilter = parseTalentCity("İstanbul");
    const sources = Array.from({ length: 5 }, (_, index) => ({
      userKey: `u-ist-${index}`,
      stampId: `stampist${index}xx`,
      displayName: `Ada ${index}`,
      title: "E-Ticaret · Kurumsal",
      issuedAt: new Date(`2026-11-0${index + 1}T10:00:00Z`),
      courseSlug: "ecommerce",
      portfolioTitle: null,
      city: "İstanbul",
      sourceKind: "YETKINCV_SEAL" as const,
    })).concat([
      {
        userKey: "u-ank",
        stampId: "stampank00xx",
        displayName: "Can",
        title: "E-Ticaret · Kurumsal",
        issuedAt: new Date("2026-11-08T11:00:00Z"),
        courseSlug: "ecommerce",
        portfolioTitle: null,
        city: "Ankara",
        sourceKind: "YETKINCV_SEAL" as const,
      },
    ]);
    const view = projectTalentDirectory(sources, { vertical: null, city: cityFilter });
    expect(view.status).toBe("listed");
    if (view.status === "listed") {
      // Ankara satırı city filtresinde düşer; k-anonim eşik için 5 İstanbul kalır.
      expect(view.experts).toHaveLength(5);
      expect(view.experts.every((row) => row.stampId.startsWith("stampist"))).toBe(true);
    }
    const load = readFileSync(join(process.cwd(), "lib/career/talent-directory-load.ts"), "utf8");
    expect(load).toContain("careerCv.findMany");
    expect(load).toContain("cityByUser");
  });

  it("Prisma CareerCv modeli ve migration FORCE RLS taşır", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema/career.prisma"), "utf8");
    expect(schema).toContain("model CareerCv");
    expect(schema).toContain("contactOptInAt");
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261124120000_career_faz1_integrity/migration.sql"),
      "utf8",
    );
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "career_cvs"');
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("rls_deny_unscoped");
  });
});
