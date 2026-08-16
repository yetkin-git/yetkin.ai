import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D2.1 müfredat oynatıcı yüzeyi", () => {
  it("mutlu yola curriculum ekler; müze curriculum kopyası yoktur", () => {
    expect(ACADEMY_HAPPY_PATH).toContain("curriculum");
    expect(existsSync(join(ROOT, "app/academy/[slug]/oyna/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/api/academy/courses/[id]/curriculum/route.ts"))).toBe(true);
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).not.toContain("[slug]/curriculum");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).not.toContain("yetkin.ai");
    expect(readSrc("app/api/academy/courses/[id]/curriculum/route.ts")).toContain(
      'export const auth = "session" as const',
    );
    expect(readSrc("app/api/academy/courses/[id]/curriculum/route.ts")).toContain(
      "completeAcademyLesson",
    );
    expect(readSrc("lib/academy/exam-engine.ts")).toContain("assertAcademyCurriculumComplete");
    expect(readSrc("lib/academy/exam-engine.ts")).toContain("isAcademyCurriculumComplete");
    expect(curriculumForCourseSlug("rail-temel").length).toBeGreaterThanOrEqual(3);
    expect(curriculumForCourseSlug("rayli-sinyal-emniyet").length).toBeGreaterThanOrEqual(3);
  });
});
