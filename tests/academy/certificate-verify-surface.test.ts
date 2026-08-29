import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("akademi kamu sertifika doğrulama yüzeyi", () => {
  it("iniş oturum istemez; hash formu SHA-256'ya kilitler", () => {
    const landing = readSrc("app/academy/dogrula/page.tsx");
    const form = readSrc("components/academy/certificate-verify-form.tsx");
    const hashPage = readSrc("app/academy/dogrula/[hash]/page.tsx");
    const api = readSrc("app/api/academy/certificates/[hash]/route.ts");
    expect(existsSync(join(ROOT, "app/academy/dogrula/page.tsx"))).toBe(true);
    expect(landing).toContain("CertificateVerifyForm");
    expect(landing).toContain("SEN_VOICE");
    expect(landing).not.toContain("getSession");
    expect(landing).not.toContain("requireSession");
    expect(form).toContain("isAcademyVerifyHash");
    expect(form).toContain("academyVerifyPath");
    expect(form).not.toContain("userId");
    expect(hashPage).toContain("loadPublicAcademyVerifyByHash");
    expect(hashPage).toContain("CertificateVerifyQr");
    expect(api).toContain('export const auth = "public"');
    expect(api).toContain("resolvePublicAcademyCertificate");
    expect(api).toContain("ServiceUnavailableError");
    expect(api).toContain("prismaErrorLabel");
    expect(SEN_VOICE.academy.verify.landingTitle).toBe("Sertifika doğrula");
    expect(SEN_VOICE.academy.verify.submitCta).toBe("Özeti doğrula");
  });

  it("sicil listesi iptal belgesini mühürlü diploma diye basmaz", () => {
    const list = readSrc("components/academy/certificate-list.tsx");
    const seal = readSrc("components/academy/certificate-seal.tsx");
    expect(list).toContain("revoked={Boolean(certificate.revokedAt)}");
    expect(seal).toContain("revoked = false");
    expect(seal).toContain("careerAllowed");
    expect(seal).toContain("ACADEMY_SEN.verify.revoked");
  });
});
