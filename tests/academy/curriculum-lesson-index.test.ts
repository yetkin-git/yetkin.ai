import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import {
  CURRICULUM_LESSON_COUNT_BY_SLUG,
  curriculumLessonCountForSlug,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("müfredat ders indeksi (katalog grafı)", () => {
  it("indeks taslak uzunluğu ve slug-n anahtarlarıyla örtüşür", () => {
    const slugs = Object.keys(CURRICULUM_DRAFTS_BY_SLUG);
    expect(Object.keys(CURRICULUM_LESSON_COUNT_BY_SLUG).sort()).toEqual([...slugs].sort());
    for (const slug of slugs) {
      const drafts = CURRICULUM_DRAFTS_BY_SLUG[slug]!;
      expect(curriculumLessonCountForSlug(slug), slug).toBe(drafts.length);
      expect(curriculumLessonKeysForSlug(slug), slug).toEqual(drafts.map((lesson) => lesson.key));
    }
  });

  it("katalog isteği müfredat gövdesini ve curriculum.ts barrel’ını çekmez", () => {
    const page = readSrc("app/academy/page.tsx");
    const catalogLoad = readSrc("lib/academy/load-catalog.ts");
    const continueBoard = readSrc("lib/academy/continue-board.ts");
    const index = readSrc("lib/academy/curricula/lesson-index.ts");

    expect(page).not.toContain("@/lib/academy/curriculum");
    expect(page).not.toContain("@/lib/academy/curricula\"");
    expect(page).not.toContain("CURRICULUM_DRAFTS_BY_SLUG");
    expect(page).toContain("@/lib/academy/load-catalog");
    expect(page).toContain("@/lib/academy/curricula/lesson-index");

    expect(catalogLoad).not.toContain("@/lib/academy/curriculum");
    expect(catalogLoad).not.toContain("CURRICULUM_DRAFTS_BY_SLUG");
    expect(catalogLoad).toContain("curriculumLessonCountForSlug");

    expect(continueBoard).not.toContain("@/lib/academy/curriculum");
    expect(continueBoard).toContain("curriculumLessonKeysForSlug");

    expect(index).not.toContain("CURRICULUM_DRAFTS_BY_SLUG");
    expect(index).not.toContain("@/lib/academy/curriculum");
    expect(index).not.toContain("composePedagogicalLessonBody");

    const published = readSrc("lib/academy/published-catalog.ts");
    const catalogSeed = readSrc("lib/academy/catalog-seed.ts");
    const examEngine = readSrc("lib/academy/exam-engine.ts");
    expect(page).not.toContain("@/lib/academy/exam-pools");
    expect(catalogLoad).not.toContain("@/lib/academy/exam-pools");
    expect(catalogLoad).not.toContain("@/lib/academy/seed\"");
    expect(published).not.toContain("@/lib/academy/exam-pools");
    expect(published).not.toContain("@/lib/academy/seed\"");
    expect(published).toContain("@/lib/academy/catalog-seed");
    expect(catalogSeed).not.toContain("@/lib/academy/exam-pools");
    expect(catalogSeed).not.toContain("@/lib/academy/proof-of-work");
    expect(readSrc("lib/academy/seed.ts")).toContain("@/lib/academy/exam-pools");
    expect(examEngine).toContain("@/lib/academy/seed");
    expect(examEngine).toContain("resolveAcademyExamFromSeed");
  });
});
