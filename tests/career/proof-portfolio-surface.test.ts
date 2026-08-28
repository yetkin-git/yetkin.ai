import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { ACADEMY_COURSE_TITLES } from "@/lib/academy/course-titles";
import {
  careerStampContractHref,
  careerStampCourseHref,
} from "@/lib/career/stamp-surface";
import { buildCareerVisaScopeBoard } from "@/lib/career/visa-scope-board";
import type { CareerVisaStampRecord } from "@/lib/career/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const MUSEUM_ROUTE_NOISE = ["zihinsel-prova", "cv-analiz", "cv-builder"];
const MUSEUM_ROUTE_DIRS = [
  "app/career/swot",
  "app/career/zihinsel-prova",
  "app/career/cv-analiz",
  "app/career/cv-builder",
  "app/career/prova",
];

const DEAD_CAREER_TOOLS = [
  "components/career/career-tools-section.tsx",
  "components/career/swot-radar-card.tsx",
  "components/career/interview-practice-card.tsx",
  "components/career/premium-report-modal.tsx",
  "components/career/career-compass-panel.tsx",
  "components/career/growth-mini-badges.tsx",
  "lib/career/swot-radar.ts",
  "lib/career/interview-practice.ts",
  "lib/career/premium-report.ts",
  "lib/career/compass.ts",
  "lib/career/growth.ts",
];

function stamp(
  partial: Partial<CareerVisaStampRecord> &
    Pick<CareerVisaStampRecord, "sourceKind" | "title"> & { courseSlug?: string | null },
): CareerVisaStampRecord & { courseSlug?: string | null } {
  const issuedAt = partial.issuedAt ?? new Date("2026-08-01T12:00:00.000Z");
  return {
    id: partial.id ?? "stamp_1",
    userId: partial.userId ?? "user_1",
    sourceKind: partial.sourceKind,
    sourceId: partial.sourceId ?? "src_1",
    moduleId: partial.moduleId ?? (partial.sourceKind === "FREELANCER_RELEASE" ? "freelancer" : "academy"),
    title: partial.title,
    visaKey: partial.visaKey ?? "visa:1",
    issuedAt,
    createdAt: partial.createdAt ?? issuedAt,
    certificateHash: partial.certificateHash ?? null,
    courseSlug: partial.courseSlug,
  };
}

describe("kariyer kanıt portföyü yüzeyi", () => {
  it("vize defteri + vize-ilan tabelası birincil yoldur; SWOT/pusula canlı tavan değildir", () => {
    expect(existsSync(join(ROOT, "components/career/visa-ledger.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "components/career/visa-scope-board.tsx"))).toBe(true);
    for (const file of DEAD_CAREER_TOOLS) {
      expect(existsSync(join(ROOT, file)), file).toBe(false);
    }
    const page = readSrc("app/career/page.tsx");
    const ledger = readSrc("components/career/visa-ledger.tsx");
    const copy = readSrc("lib/copy/sen-voice/career.ts");
    expect(page).toContain("VisaLedger");
    expect(page).toContain("VisaScopeBoard");
    expect(page).not.toContain("CareerCompassPanel");
    expect(page).not.toContain("CareerToolsSection");
    expect(page).not.toContain("buildCareerCompass");
    expect(page).not.toContain("buildSwotRadar");
    expect(page).toContain("SEN_VOICE");
    expect(page).not.toContain("PortfolioList");
    expect(page).not.toContain("showcase");
    expect(page).not.toContain("tone=\"amber\"");
    expect(ledger).toContain("careerStampVerifyHref");
    expect(ledger).toContain("careerStampCourseHref");
    expect(ledger).toContain("careerStampContractHref");
    expect(ledger).toContain("certificateHash");
    expect(ledger).toContain("openCourseCta");
    expect(ledger).toContain("openContractCta");
    expect(ledger).not.toContain("Vitrine");
    expect(ledger).not.toContain("CAREER_SHOWCASE");
    expect(copy).toContain("Vize ve Geçiş Defteri");
    expect(copy).toContain("Vize-ilan tabelası");
    expect(copy).toContain("openCourseCta");
    expect(copy).toContain("openContractCta");
    expect(copy).not.toContain("örnek düzen");
    expect(copy).not.toContain("Vitrin");
    expect(copy).not.toContain("premiumModal");
    expect(SEN_VOICE.career.ledgerTitle).toBe("Vize ve Geçiş Defteri");
    expect(SEN_VOICE.career.proofsTitle).toBe("Vize ve Geçiş Defteri");
    expect(SEN_VOICE.career.title).toBe("Vize ve Geçiş Defteri");
    expect(SEN_VOICE.career.verifyCta).toBe("Özeti doğrula");
    expect(SEN_VOICE.career.scope.title).toBe("Bu vize hangi ilanları açar?");
    for (const noise of MUSEUM_ROUTE_NOISE) {
      expect(page.toLowerCase()).not.toContain(noise);
      expect(ledger.toLowerCase()).not.toContain(noise);
    }
    for (const dir of MUSEUM_ROUTE_DIRS) {
      expect(existsSync(join(ROOT, dir))).toBe(false);
    }
    expect(existsSync(join(ROOT, "app/career/error.tsx"))).toBe(true);
    expect(readSrc("app/career/error.tsx")).toContain("retry");
    expect(readSrc("app/career/error.tsx")).toContain("/career");
    expect(page).not.toContain('href="/career/swot"');
    expect(page).not.toContain("yetkin.ai");
  });

  it("liyakat defteri damga → Akademi dersi / Freelancer sözleşme href üretir", () => {
    const knownSlug = Object.keys(ACADEMY_COURSE_TITLES)[0] as keyof typeof ACADEMY_COURSE_TITLES;
    const knownTitle = ACADEMY_COURSE_TITLES[knownSlug];
    expect(knownTitle).toBeTruthy();

    const academyStamp = stamp({
      sourceKind: "ACADEMY_CERTIFICATE",
      title: knownTitle,
      sourceId: "cert_1",
    });
    expect(careerStampCourseHref(academyStamp)).toBe(`/academy/${knownSlug}`);
    expect(careerStampContractHref(academyStamp)).toBeNull();

    const releaseStamp = stamp({
      sourceKind: "FREELANCER_RELEASE",
      title: "Teslim",
      sourceId: "contract_abc",
    });
    expect(careerStampContractHref(releaseStamp)).toBe("/freelancer/contracts/contract_abc");
    expect(careerStampCourseHref(releaseStamp)).toBeNull();
  });

  it("vize-ilan tabelası damgayı dikey kapıya bağlar; SWOT vize basmaz", () => {
    const doors = buildCareerVisaScopeBoard([]);
    expect(doors.length).toBeGreaterThan(0);
    expect(doors.every((door) => door.open === false)).toBe(true);

    const uxTitle = "UX Araştırma, Wireframing ve Figma Temelleri";
    const held = buildCareerVisaScopeBoard([
      stamp({ sourceKind: "ACADEMY_CERTIFICATE", title: uxTitle, courseSlug: "ux-temel" }),
    ]);
    const uxDoor = held.find((door) => door.pathwayId === "uiux-tasarim-sistemleri");
    expect(uxDoor?.open).toBe(true);
    expect(uxDoor?.courses.some((course) => course.slug === "ux-temel" && course.held)).toBe(true);
  });
});
