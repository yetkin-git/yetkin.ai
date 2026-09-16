import { describe, expect, it } from "vitest";
import {
  academyExamStartGateHref,
  resolveAcademyContinueBoard,
} from "@/lib/academy/continue-board";
import { parseAcademyContinueDismissed } from "@/lib/academy/continue-dismiss";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";

describe("akademi devam paneli", () => {
  it("boş müfredatta devam kartı basılmaz", () => {
    const keys = curriculumLessonKeysForSlug("sample-course");
    expect(keys).toEqual([]);
    expect(
      resolveAcademyContinueBoard({
        courseId: "course-1",
        courseSlug: "sample-course",
        courseTitle: "Örnek Kurs",
        completedLessonKeys: [],
        hasCertificate: false,
      }),
    ).toBeNull();
  });

  it("dismiss parse boş ve geçerli slug'ları ayıklar", () => {
    expect(parseAcademyContinueDismissed('["sample-course",""]')).toEqual(["sample-course"]);
  });

  it("müfredat doluyken devam kartı ilk derse iner", () => {
    const keys = curriculumLessonKeysForSlug("01_office_ai");
    expect(keys).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-4",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    const board = resolveAcademyContinueBoard({
      courseId: "ac_01_office_ai",
      courseSlug: "01_office_ai",
      courseTitle: "Ofiste Yapay Zekâ",
      completedLessonKeys: [],
      hasCertificate: false,
    });
    expect(board?.phase).toBe("lesson");
    expect(board?.nextLessonKey).toBe("01_office_ai-1");
    expect(board?.href).toBe("/academy/01_office_ai/oyna");
    expect(academyExamStartGateHref("01_office_ai")).toContain("?gate=exam#academy-exam-gate");
  });
});
