import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

describe("03_social_media_ai nihai iskelet — taze ingest bekler", () => {
  it("ders gövdesi, cue ve spoken script boştur", () => {
    const lessons = curriculumForCourseSlug("03_social_media_ai");
    expect(lessons).toEqual([]);
    expect(isAcademySpokenScriptLessonKey("03_social_media_ai-1")).toBe(false);
    expect(hasAcademyLessonCues("03_social_media_ai-1")).toBe(false);
    expect(isAcademyLessonAudioSealed("03_social_media_ai", "03_social_media_ai-1")).toBe(false);
    expect(academyCitizenPlayerLayer("03_social_media_ai", "03_social_media_ai-1")).toEqual({ kind: "article" });
  });
});
