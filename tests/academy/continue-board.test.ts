import { describe, expect, it } from "vitest";
import {
  isAcademyContinueResumeStrip,
  pickAcademyContinueBoard,
  resolveAcademyContinueBoard,
} from "@/lib/academy/continue-board";
import { parseAcademyContinueDismissed } from "@/lib/academy/continue-dismiss";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";

describe("akademi devam paneli çözümleyicisi", () => {
  it("mühürlü belgede panel basmaz", () => {
    expect(
      resolveAcademyContinueBoard({
        courseId: "c1",
        courseSlug: "python-temel",
        completedLessonKeys: [],
        hasCertificate: true,
      }),
    ).toBeNull();
  });

  it("yarım müfredatta /oyna ve lesson fazı döner", () => {
    const keys = curriculumLessonKeysForSlug("python-temel");
    const first = keys[0]!;
    const board = resolveAcademyContinueBoard({
      courseId: "c1",
      courseSlug: "python-temel",
      courseTitle: "Rail Temel",
      completedLessonKeys: [first],
      hasCertificate: false,
    });
    expect(board).not.toBeNull();
    expect(board!.phase).toBe("lesson");
    expect(board!.href).toBe("/academy/python-temel/oyna");
    expect(board!.completedCount).toBe(1);
    expect(board!.totalCount).toBe(keys.length);
    expect(board!.nextLessonKey).toBe(keys[1]!);
  });

  it("müfredat bitince sınav fazı ve kurs href döner", () => {
    const keys = curriculumLessonKeysForSlug("python-temel");
    const board = resolveAcademyContinueBoard({
      courseId: "c1",
      courseSlug: "python-temel",
      completedLessonKeys: keys,
      hasCertificate: false,
    });
    expect(board!.phase).toBe("exam");
    expect(board!.href).toBe("/academy/python-temel");
    expect(board!.nextLessonKey).toBeNull();
  });

  it("pick: önce yarım ders, sonra sınav; başlanmamış satın alma şerit basmaz", () => {
    const a = resolveAcademyContinueBoard({
      courseId: "a",
      courseSlug: "python-temel",
      completedLessonKeys: [],
      hasCertificate: false,
    })!;
    const b = resolveAcademyContinueBoard({
      courseId: "b",
      courseSlug: "python-temel",
      completedLessonKeys: [curriculumLessonKeysForSlug("python-temel")[0]!],
      hasCertificate: false,
    })!;
    const keys = curriculumLessonKeysForSlug("python-temel");
    const c = resolveAcademyContinueBoard({
      courseId: "c",
      courseSlug: "python-temel",
      completedLessonKeys: keys,
      hasCertificate: false,
    })!;
    expect(pickAcademyContinueBoard([a, b, c])?.courseId).toBe("b");
    expect(pickAcademyContinueBoard([a, c])?.courseId).toBe("c");
    expect(pickAcademyContinueBoard([a])).toBeNull();
    expect(pickAcademyContinueBoard([])).toBeNull();
    expect(isAcademyContinueResumeStrip(a)).toBe(false);
    expect(isAcademyContinueResumeStrip(b)).toBe(true);
    expect(isAcademyContinueResumeStrip(c)).toBe(true);
    expect(isAcademyContinueResumeStrip(null)).toBe(false);
  });

  it("gizlenen şerit sicili bozuk JSON’u yok sayar", () => {
    expect(parseAcademyContinueDismissed(null)).toEqual([]);
    expect(parseAcademyContinueDismissed("{")).toEqual([]);
    expect(parseAcademyContinueDismissed('["python-temel",""]')).toEqual(["python-temel"]);
  });
});
