import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { linkedInAddCertificationUrl } from "@/lib/career/badge-share";
import {
  PUBLIC_TALENT_ALIAS_PATH,
  PUBLIC_TALENT_PATH,
  parsePublicTalentId,
  publicTalentAliasPath,
  publicTalentCardHasIdentityLeak,
  publicTalentPath,
  toPublicTalentCard,
} from "@/lib/career/public-talent";
import { CANONICAL_SITE_ORIGIN, PAGE_SEO } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import type { LiveCareerStamp } from "@/lib/career/live";

const ROOT = process.cwd();
const STAMP_ID = "stamp_public_1";
const HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function liveStamp(partial: Partial<LiveCareerStamp> = {}): LiveCareerStamp {
  const issuedAt = partial.issuedAt ?? new Date("2026-08-01T12:00:00.000Z");
  return {
    id: partial.id ?? STAMP_ID,
    userId: partial.userId ?? "user_secret",
    sourceKind: partial.sourceKind ?? "ACADEMY_CERTIFICATE",
    sourceId: partial.sourceId ?? "cert_secret",
    moduleId: partial.moduleId ?? "academy",
    title: partial.title ?? "Ofis Yapay Zekâ",
    visaKey: partial.visaKey ?? "visa:1",
    issuedAt,
    createdAt: partial.createdAt ?? issuedAt,
    certificateHash: partial.certificateHash ?? HASH,
    courseSlug: partial.courseSlug ?? "01_office_ai",
  };
}

describe("kamu yetkinlik kartı ve mühür paylaşımı", () => {
  it("kanonik yol /vize; /p alias aynı id'ye iner", () => {
    expect(PUBLIC_TALENT_PATH).toBe("/vize");
    expect(PUBLIC_TALENT_ALIAS_PATH).toBe("/p");
    expect(publicTalentPath(STAMP_ID)).toBe(`/vize/${STAMP_ID}`);
    expect(publicTalentAliasPath(STAMP_ID)).toBe(`/p/${STAMP_ID}`);
    expect(parsePublicTalentId("bad")).toBeNull();
    expect(parsePublicTalentId(STAMP_ID)).toBe(STAMP_ID);
    expect(PAGE_SEO.publicTalent.path).toBe("/vize");
  });

  it("kamuya açık kart userId / e-posta / sourceId sızdırmaz", () => {
    const featured = liveStamp();
    const card = toPublicTalentCard(featured, [featured], [
      { title: "Proje kanıtı", visaStampId: STAMP_ID },
    ]);
    expect(card.featured.title).toBe("Ofis Yapay Zekâ");
    expect(card.proofs).toEqual([{ title: "Proje kanıtı", visaStampId: STAMP_ID }]);
    expect(publicTalentCardHasIdentityLeak(card)).toBe(false);
    expect(JSON.stringify(card)).not.toContain("user_secret");
    expect(JSON.stringify(card)).not.toContain("cert_secret");
  });

  it("LinkedIn sertifika formu vatandaş kimliği taşımaz; CV rehberi SEN basar", () => {
    const url = linkedInAddCertificationUrl({
      name: "Ofis Yapay Zekâ",
      certUrl: `${CANONICAL_SITE_ORIGIN}/academy/dogrula/${HASH}`,
      certId: HASH,
      issuedAt: new Date("2026-08-01T12:00:00.000Z"),
    });
    expect(url).toContain("linkedin.com/profile/add");
    expect(url).toContain("startTask=CERTIFICATION_NAME");
    expect(url).toContain("Ofis");
    expect(url).toContain("organizationName=yetkin.ai");
    expect(url).not.toMatch(/userId|e-posta|holder/i);
    expect(CAREER_SEN.badge.cvCta).toBe("CV'ne Mühür Ekle");
    expect(CAREER_SEN.badge.linkedInCta).toBe("LinkedIn Yetkinlik Onayına Bağla");
  });

  it("Kariyer odası ve kamu kartı yüzeyleri bağlıdır", () => {
    const page = readSrc("app/career/page.tsx");
    const config = readSrc("next.config.ts");
    const alias = readSrc("app/(public)/p/[id]/page.tsx");
    expect(existsSync(join(ROOT, "app/(public)/vize/[id]/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/(public)/vize/page.tsx"))).toBe(true);
    expect(page).toContain("EmployerGateway");
    expect(page).toContain("SealShareGuides");
    expect(page).toContain("publicTalentCta");
    expect(config).toContain('source: "/p"');
    expect(config).toContain('destination: "/vize"');
    expect(config).toContain('source: "/p/:id"');
    expect(config).toContain('destination: "/vize/:id"');
    expect(alias).toContain("permanentRedirect");
    expect(alias).toContain("publicTalentPath");
    expect(readSrc("app/(public)/vize/[id]/page.tsx")).not.toContain("requirePageSession");
    expect(readSrc("app/(public)/vize/[id]/page.tsx")).not.toContain("email");
    expect(readSrc("lib/career/public-talent-load.ts")).toContain("toPublicTalentCard");
    expect(readSrc("lib/career/public-talent-load.ts")).not.toContain("recordPublicTalentCardHit");
    expect(readSrc("app/(public)/vize/[id]/page.tsx")).toContain("recordPublicTalentCardHit");
  });
});
