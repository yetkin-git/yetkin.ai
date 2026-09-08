import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { attachAcademyLessonActHeading } from "@/lib/academy/lesson-body";
import {
  academyLessonResourceItems,
  academyLessonShortSummary,
} from "@/lib/academy/lesson-description";

const SYNTHETIC_BODY = [
  attachAcademyLessonActHeading(
    "giris",
    "Bu derste tutarı kuruş cinsinden sabitlemeyi öğreneceksin. İkinci bakiyeyi reddedeceğiz.",
  ),
  attachAcademyLessonActHeading("mantik", "Gel, kayda bakalım. Vaka: iki ekran sapar."),
].join("\n\n");

describe("ders açıklaması özeti", () => {
  it("sentetik gövdeden kısa özet üretir; tam gövdeyi kopyalamaz", () => {
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    const summary = academyLessonShortSummary(SYNTHETIC_BODY);
    expect(summary.length).toBeGreaterThan(20);
    expect(summary.length).toBeLessThan(SYNTHETIC_BODY.length);
    expect(summary).not.toContain("```");
    expect(summary).toContain("kuruş");
  });

  it("şema ve laboratuvar kaynak listesini basar", () => {
    const resources = academyLessonResourceItems({
      diagrams: [{ afterParagraph: 1, title: "Akış", caption: "", diagramKey: "flow" }],
      hasLab: true,
    });
    expect(resources.map((row) => row.label)).toEqual(["Akış", "Kod laboratuvarı"]);
  });
});
