import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyLessonResourceItems,
  academyLessonShortSummary,
} from "@/lib/academy/lesson-description";

describe("ders açıklaması özeti", () => {
  it("python-temel-1 girişinden kısa özet üretir; tam gövdeyi kopyalamaz", () => {
    const lesson = curriculumForCourseSlug("python-temel")[0]!;
    const summary = academyLessonShortSummary(lesson.body);
    expect(summary.length).toBeGreaterThan(40);
    expect(summary.length).toBeLessThan(lesson.body.length / 2);
    expect(summary).not.toContain("```");
  });

  it("şema ve laboratuvar kaynak listesini basar", () => {
    const resources = academyLessonResourceItems({
      diagrams: [{ afterParagraph: 1, title: "Akış", caption: "", diagramKey: "flow" }],
      hasLab: true,
    });
    expect(resources.map((row) => row.label)).toEqual(["Akış", "Kod laboratuvarı"]);
  });
});
