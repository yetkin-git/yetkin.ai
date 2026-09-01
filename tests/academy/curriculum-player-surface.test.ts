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
    expect(catalog).not.toContain("overlayStudioGrowthLearnerBoard");
    expect(catalog).not.toContain("FilterBar");
    expect(catalog).not.toContain("AcademyLevelPathway");

    const antre = readSrc("app/academy/[slug]/page.tsx");
    expect(antre).toContain("PurchaseButton");
    expect(antre).toContain("SettlementSteps");
    expect(antre).toContain("hasAcademyPlayerAccess");
    expect(antre).toContain("hasCommercialAcademyEnrolment");
    expect(antre).toContain("hasAccess");
    expect(antre).toContain("Promise.all");
    expect(antre).not.toContain("hasCommercialAcademyEnrolment(purchase) ||");
    expect(antre).toContain("/oyna");
    expect(antre).not.toContain("FilterBar");
    expect(antre).not.toContain("ProofOfWorkCard");
    expect(antre).not.toContain("AcademyPilotPath");
    expect(antre).toContain("ExamStartGate");

    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(oyna).toContain("requirePageSession");
    expect(oyna).toContain("hasAcademyPlayerAccess");
    expect(oyna).toContain("canAccess");
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
    expect(player).toContain("onDialogueEnded");
    expect(player).toContain("LessonDialogueTranscript");
    expect(player).toContain("copy.notesLabel");
    expect(player).toContain("copy.codeViewerLabel");
    expect(player).toContain("data-academy-lesson-notes");
    expect(player).toContain("data-academy-code-viewer");
    expect(player).toContain("data-academy-quiz-panel");
    expect(player).toContain("<details");
    expect(player).toContain("data-academy-player-layout=\"fit-screen\"");
    expect(player).toContain("academy-player-widescreen");
    expect(player).toContain("LessonSyntaxCode");
    expect(player).not.toContain("<details open");
    expect(oyna).toContain("academy-player-viewport-lock");
    expect(player).toContain("AcademyProgressBar");
    expect(player).toContain("copy.completeCta");
    expect(player).toContain("composeAcademyLessonBlocks");
    expect(player).toContain("academyLessonMediaMeta");
    expect(player).toContain("academyLessonKindLabel");
    expect(player).not.toContain("durationSec={micro?.durationSec ?? 8}");
    expect(player).not.toContain("LessonListenButton");
    expect(player).not.toContain("LessonCodeLab");
    expect(player).not.toContain("LessonDiscussion");
    expect(player).not.toContain("ProofOfWorkCard");
    expect(player).not.toContain("listenPlayback");

    expect(readSrc("lib/academy/load.ts")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("lib/academy/load.ts")).toContain("persistGrant: false");
    expect(readSrc("lib/academy/load.ts")).toContain("cache(");
    expect(readSrc("lib/academy/load.ts")).toContain("Promise.all");
    expect(readSrc("lib/academy/access.ts")).toContain("hasAcademyPlayerAccess");
    expect(readSrc("lib/academy/access.ts")).toContain("hasAcademyAdminBypass");
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

    expect(curriculumForCourseSlug("python-temel")).toHaveLength(6);
    expect(curriculumForCourseSlug("ai-agent-orta")).toHaveLength(6);
    expect(curriculumForCourseSlug("ai-agent-ileri")).toHaveLength(6);
    expect(curriculumForCourseSlug("ai-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("fullstack-temel")).toHaveLength(6);
    expect(curriculumForCourseSlug("fullstack-orta")).toHaveLength(6);
    expect(curriculumForCourseSlug("fullstack-ileri")).toHaveLength(6);
    expect(curriculumForCourseSlug("security-temel")).toHaveLength(6);
    expect(curriculumForCourseSlug("security-orta")).toHaveLength(6);
    expect(curriculumForCourseSlug("security-ileri")).toHaveLength(6);
    expect(curriculumForCourseSlug("excel-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("google-ads-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("meta-ads-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("eticaret-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("canva-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("linkedin-masterclass")).toHaveLength(6);
    expect(curriculumForCourseSlug("ux-temel")).toHaveLength(12);
    expect(curriculumForCourseSlug("python-orta")).toHaveLength(6);
    expect(curriculumForCourseSlug("python-ileri")).toHaveLength(6);

    expect(existsSync(join(ROOT, "components/academy/filter-bar.tsx"))).toBe(false);
    expect(readSrc("lib/academy/catalog-filter.ts")).not.toContain("trendScore");
    expect(readSrc("app/api/academy/courses/[id]/curriculum/route.ts")).not.toContain(
      "proofOfWorkHash: lesson.proofOfWorkHash",
    );
  });
});
