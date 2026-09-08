import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("sertifika sığınağı — oturum, köprü, SEN", () => {
  it("Sertifikalarım requirePageSession bağlar; misafir AuthNeeded basmaz", () => {
    const page = readSrc("app/academy/certificates/page.tsx");
    const guard = readSrc("lib/kernel/security/edge-guard.ts");
    expect(page).toContain("requirePageSession");
    expect(page).not.toContain("getSession");
    expect(page).not.toContain("AuthNeeded");
    expect(guard).toContain("isAcademyCertificatesPath");
    expect(guard).toContain('"/academy/certificates"');
  });

  it("header Pasaport, Kariyer ve kamu doğrulama köprülerini basar", () => {
    const page = readSrc("app/academy/certificates/page.tsx");
    expect(page).toContain("PASSPORT_SURFACE_PATH");
    expect(page).toContain("CAREER_STAMP_SURFACE_PATH");
    expect(page).toContain('"/academy/dogrula"');
    expect(page).toContain("copy.passportCta");
    expect(page).toContain("copy.careerBridgeCta");
    expect(page).toContain("copy.verifyPublicCta");
    expect(SEN_VOICE.academy.certificates.passportCta).toBe("Pasaport");
    expect(SEN_VOICE.academy.certificates.careerBridgeCta).toBe("Kariyer");
    expect(SEN_VOICE.academy.certificates.verifyPublicCta).toBe("Kamu Doğrulama");
  });

  it("liste kartı kamu doğrulama QR'si ve oturumlu holderName taşır", () => {
    const page = readSrc("app/academy/certificates/page.tsx");
    const list = readSrc("components/academy/certificate-list.tsx");
    const publicHash = readSrc("app/academy/dogrula/[hash]/page.tsx");
    expect(page).toContain("loadAcademyHolderName");
    expect(page).toContain("holderName={holderName}");
    expect(list).toContain("CertificateVerifyQr");
    expect(list).toContain("holderName={holderName}");
    expect(list).toContain("!revoked");
    expect(publicHash).toContain("CertificateVerifyQr");
    expect(publicHash).toContain("copy.privacy");
    expect(publicHash).not.toContain("holderName=");
    expect(publicHash).not.toContain("loadAcademyHolderName");
  });

  it("sertifika kopyası SEN üçlüsünü basar; mühür/vize kalıntısı yok", () => {
    const copy = SEN_VOICE.academy.certificates;
    expect(copy.sealed).toBe("Doğrulanmış Rozet");
    expect(copy.careerVisaLead).toContain("Doğrulanmış Rozet");
    expect(copy.careerVisaLead).toContain("Pasaport Vize Damgası");
    expect(copy.careerVisaLead).toContain("Erişim Hakkı");
    expect(copy.careerVisaLead).not.toContain("Mühür");
    expect(copy.careerVisaLead).not.toMatch(/vizeye/i);
    expect(copy.sealed).not.toBe("Onaylı");
  });
});
