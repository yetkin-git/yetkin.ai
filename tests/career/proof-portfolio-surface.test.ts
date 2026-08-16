import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const MUSEUM_NOISE = ["swot", "zihinsel-prova", "cv-analiz", "cv-builder", "yetkin.ai"];

describe("kariyer kanıt portföyü yüzeyi", () => {
  it("yalın kanıt kartı vizeleri ve SHA256 doğrulama bağını taşır; müze peronları yoktur", () => {
    expect(existsSync(join(ROOT, "components/career/proof-list.tsx"))).toBe(true);
    const page = readSrc("app/career/page.tsx");
    const proof = readSrc("components/career/proof-list.tsx");
    const copy = readSrc("lib/copy/sen-voice/career.ts");
    expect(page).toContain("ProofList");
    expect(page).toContain("SEN_VOICE");
    expect(page).not.toContain("PortfolioList");
    expect(proof).toContain("passportAcademyVerifyHref");
    expect(proof).toContain("certificateHash");
    expect(copy).toContain("Kanıt portföyü");
    expect(SEN_VOICE.career.proofsTitle).toBe("Kanıt portföyü");
    expect(SEN_VOICE.career.verifyCta).toBe("Mührü doğrula");
    for (const noise of MUSEUM_NOISE) {
      expect(page.toLowerCase()).not.toContain(noise);
      expect(proof.toLowerCase()).not.toContain(noise);
      expect(copy.toLowerCase()).not.toContain(noise);
    }
  });
});
