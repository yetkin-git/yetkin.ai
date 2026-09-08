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

  it("müfredat bitince antre ExamStartGate yutağına iner", () => {
    const keys = curriculumLessonKeysForSlug("01_office_ai");
    expect(keys).toHaveLength(6);
    const board = resolveAcademyContinueBoard({
      courseId: "ac_01_office_ai",
      courseSlug: "01_office_ai",
      courseTitle: "Ofiste Yapay Zekâ",
      completedLessonKeys: keys,
      hasCertificate: false,
    });
    expect(board?.phase).toBe("exam");
    expect(board?.href).toBe(academyExamStartGateHref("01_office_ai"));
    expect(board?.href).toContain("?gate=exam#academy-exam-gate");
  });
});
