import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { publicTalentCardHasIdentityLeak } from "@/lib/career/public-talent";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Dizin kilidi, iletişim ve KVKK (K4, Y9, Y7)", () => {
  it("dizin yalnız sealedPublication=true mühürleri okur (K4)", () => {
    const load = src("lib/career/talent-directory-load.ts");
    expect(load).toContain("sealedPublication: true");
    const vize = src("app/(public)/vize/[id]/page.tsx");
    expect(vize).toContain("seal.published");
    expect(vize).toContain("MISSING_CARD_ROBOTS");
  });

  it("iletişim formu aday e-postasını yanıta basmaz (Y9)", () => {
    const route = src("app/api/career/contact/route.ts");
    expect(route).toContain("contactOptInAt");
    expect(route).toContain("accepted: true");
    expect(route).not.toMatch(/talentEmail|candidateEmail|user\.email/);
    expect(route).toContain("HTTP_RATE_LIMITS.careerContactIp");
    const leak = publicTalentCardHasIdentityLeak({
      accepted: true,
      requesterName: "Ali",
    });
    expect(leak).toBe(false);
  });

  it("KVKK silme yolu CV/mühür/portföy siler ve başvuruyu anonimleştirir (Y7)", () => {
    const privacy = src("lib/career/cv-privacy.ts");
    expect(privacy).toContain("careerCv.deleteMany");
    expect(privacy).toContain("yetkinCvSeal.deleteMany");
    expect(privacy).toContain("careerPortfolioItem.deleteMany");
    expect(privacy).toContain("kurumsalJobApplication.updateMany");
    expect(privacy).toContain("Anonim aday");
    const route = src("app/api/career/privacy/route.ts");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("DELETE");
    expect(src("components/career/career-privacy-panel.tsx")).toContain("/api/career/privacy");
  });
});
