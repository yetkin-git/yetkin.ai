import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO } from "@/lib/copy/seo";

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
    expect(landing).toContain("CertificateVerifyNav");
    expect(landing).toContain("SEN_VOICE");
    expect(landing).not.toContain("getSession");
    expect(landing).not.toContain("requireSession");
    expect(form).toContain("isAcademyVerifyHash");
    expect(form).toContain("academyVerifyPath");
    expect(form).not.toContain("userId");
    expect(hashPage).toContain("loadPublicAcademyVerifyByHash");
    expect(hashPage).toContain("CertificateVerifyQr");
    expect(hashPage).toContain("CertificateVerifyNav");
    expect(api).toContain('export const auth = "public"');
    expect(api).toContain("resolvePublicAcademyCertificate");
    expect(api).toContain("ServiceUnavailableError");
    expect(api).toContain("prismaErrorLabel");
    expect(SEN_VOICE.academy.verify.landingTitle).toBe("Sertifika doğrula");
    expect(SEN_VOICE.academy.verify.submitCta).toBe("Özeti doğrula");
    expect(SEN_VOICE.academy.verify.privacy).toContain("Vatandaş kimliği bu sayfada gösterilmez");
    expect(SEN_VOICE.academy.verify.homeCta).toBe("Ana sayfa");
    expect(SEN_VOICE.academy.verify.academyCta).toBe("Akademi");
    expect(SEN_VOICE.academy.verify.careerCta).toBe("Kariyer");
    expect(SEN_VOICE.academy.verify.privacyA4).toBe(
      "Vatandaş kimliği Anayasa A4 uyarınca bu sayfada gizlenir",
    );
    expect(SEN_VOICE.academy.certificates.sealed).toBe("Doğrulanmış Rozet");
    expect(SEN_VOICE.academy.certificates.careerVisaLead).toContain("Erişim Hakkı");
  });

  it("belge vitrini ana sayfa, akademi ve kariyer köprülerini basar", () => {
    const nav = readSrc("components/academy/certificate-verify-nav.tsx");
    expect(nav).toContain('href="/"');
    expect(nav).toContain('href="/academy"');
    expect(nav).toContain('href="/career"');
    expect(nav).toContain("copy.homeCta");
    expect(nav).toContain("copy.academyCta");
    expect(nav).toContain("copy.careerCta");
  });

  it("üçlü köprü yalnız header aksiyonunda basılır; kart altında mükerrer yok", () => {
    const landing = readSrc("app/academy/dogrula/page.tsx");
    const hashPage = readSrc("app/academy/dogrula/[hash]/page.tsx");
    expect(landing.match(/<CertificateVerifyNav/g)?.length).toBe(1);
    expect(landing.match(/actions=\{<CertificateVerifyNav \/>\}/g)?.length).toBe(1);
    expect(landing).not.toContain("CertificateVerifyNav className");
    expect(hashPage.match(/<CertificateVerifyNav/g)?.length).toBe(6);
    expect(hashPage.match(/actions=\{<CertificateVerifyNav \/>\}/g)?.length).toBe(6);
    expect(hashPage).not.toContain("CertificateVerifyNav className");
    expect(hashPage).not.toContain('className="mt-4 flex flex-wrap items-center gap-2"');
  });

  it("iniş SEO ve özet kapsamı mühür kalıntısı taşımaz", () => {
    expect(PAGE_SEO.academyVerify.description).toContain("sicil bütünlük kaydı");
    expect(PAGE_SEO.academyVerify.description).toContain("Müfredat özeti");
    expect(PAGE_SEO.academyVerify.description).toContain("Uydurma geçerli damga basılmaz");
    expect(PAGE_SEO.academyVerify.description).not.toContain("Uydurma mühür");
    expect(SEN_VOICE.academy.verify.curriculumSealLabel).toBe("Müfredat özeti");
    expect(SEN_VOICE.academy.verify.validBody).toContain("sicil bütünlük kaydıdır");
    expect(SEN_VOICE.academy.verify.missingBody).toContain("Uydurma geçerli damga basılmaz");
  });

  it("sicil listesi iptal belgesini mühürlü diploma diye basmaz", () => {
    const list = readSrc("components/academy/certificate-list.tsx");
    const seal = readSrc("components/academy/certificate-seal.tsx");
    expect(list).toContain("Boolean(certificate.revokedAt)");
    expect(list).toContain("revoked={revoked}");
    expect(list).toContain("CertificateVerifyQr");
    expect(seal).toContain("revoked = false");
    expect(seal).toContain("careerAllowed");
    expect(seal).toContain("CertificateShareActions");
    expect(seal).toContain("ACADEMY_SEN.verify.revoked");
    expect(seal).toContain("ACADEMY_SEN.verify.privacyA4");
    expect(seal).not.toContain("ACADEMY_SEN.proof.anonymousHolder");
  });
});
