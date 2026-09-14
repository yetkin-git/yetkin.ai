import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

describe("05_prompt_practice nihai iskelet — taze ingest bekler", () => {
  it("ders gövdesi, cue ve spoken script boştur", () => {
    const lessons = curriculumForCourseSlug("05_prompt_practice");
    expect(lessons).toEqual([]);
    expect(isAcademySpokenScriptLessonKey("05_prompt_practice-1")).toBe(false);
    expect(hasAcademyLessonCues("05_prompt_practice-1")).toBe(false);
    expect(isAcademyLessonAudioSealed("05_prompt_practice", "05_prompt_practice-1")).toBe(false);
    expect(academyCitizenPlayerLayer("05_prompt_practice", "05_prompt_practice-1")).toEqual({ kind: "article" });
  });
});
