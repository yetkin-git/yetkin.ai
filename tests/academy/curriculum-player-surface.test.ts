import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D2.1 müfredat oynatıcı yüzeyi — üç ekran + dinle kapalı", () => {
  it("mutlu yol vitrin → kasa → oynatıcı; dinle 410; sınav dondurulmuş", () => {
    expect(ACADEMY_HAPPY_PATH).toEqual([
      "catalog",
      "price-lock",
      "settle",
      "curriculum",
      "exam",
      "certificate",
    ]);
    expect(existsSync(join(ROOT, "app/academy/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/academy/[slug]/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/academy/[slug]/oyna/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/api/academy/courses/[id]/curriculum/route.ts"))).toBe(true);

    const catalog = readSrc("app/academy/page.tsx");
    expect(catalog).toContain("CourseList");
    expect(catalog).toContain("filterAcademyPilotCatalog");
    expect(catalog).not.toContain("FilterBar");
    expect(catalog).not.toContain("AcademyLevelPathway");

    const antre = readSrc("app/academy/[slug]/page.tsx");
    expect(antre).toContain("PurchaseButton");
    expect(antre).toContain("SettlementSteps");
    expect(antre).toContain("hasAcademyPlayerAccess");
    expect(antre).toContain("hasCommercialAcademyEnrolment");
    expect(antre).toContain("/oyna");
    expect(antre).not.toContain("FilterBar");
    expect(antre).not.toContain("ProofOfWorkCard");
    expect(antre).toContain("ExamStartGate");

    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(oyna).toContain("requirePageSession");
    expect(oyna).toContain("hasAcademyPlayerAccess");
    expect(oyna).toContain("hasPurchased");
    expect(oyna).toContain("loadAcademyCurriculum");
    expect(oyna).toContain("CurriculumPlayer");
    expect(oyna).toContain("redirect");
    expect(oyna).not.toContain("yetkin.ai");
    expect(oyna).not.toContain("LessonListenButton");

    const player = readSrc("components/academy/curriculum-player.tsx");
    expect(player).toContain("LessonMediaPlayer");
    expect(player).toContain("completeLesson");
    expect(player).toContain("goToNextLesson");
    expect(player).not.toContain("LessonListenButton");
    expect(player).not.toContain("LessonCodeLab");
    expect(player).not.toContain("LessonDiscussion");
    expect(player).not.toContain("ProofOfWorkCard");
    expect(player).not.toContain("listenPlayback");

    expect(readSrc("lib/academy/load.ts")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("lib/academy/access.ts")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("licenseNote");
    expect(readSrc("lib/academy/purchase-path.ts")).toContain("Eğitimi Satın Al & Öğren");

    expect(readSrc("lib/academy/lesson-listen.ts")).toContain("ACADEMY_LESSON_LISTEN_ENABLED = false");
    expect(existsSync(join(ROOT, "app/api/academy/courses/[id]/listen/route.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "app/api/academy/generateSpeech/route.ts"))).toBe(true);
    const listen = readSrc("app/api/academy/courses/[id]/listen/route.ts");
    expect(listen).toContain('export const auth = "public" as const');
    expect(listen).toContain("ACADEMY_STUDIO_GONE");
    expect(listen).toContain("410");
    expect(listen).not.toContain("prepareAcademyLessonListen");
    const speech = readSrc("app/api/academy/generateSpeech/route.ts");
    expect(speech).toContain("ACADEMY_STUDIO_GONE");
    expect(speech).toContain("410");

    expect(existsSync(join(ROOT, "tests/academy/idor-exam-purchase.test.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "tests/academy/purchase-flow.test.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "tests/academy/access.test.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "tests/academy/happy-path.test.ts"))).toBe(true);

    expect(curriculumForCourseSlug("python-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("ai-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("fullstack-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("ux-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("python-orta")).toHaveLength(0);

    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);
    expect(readSrc("lib/academy/catalog-filter.ts")).not.toContain("trendScore");
    expect(readSrc("app/api/academy/courses/[id]/curriculum/route.ts")).not.toContain(
      "proofOfWorkHash: lesson.proofOfWorkHash",
    );
  });
});
