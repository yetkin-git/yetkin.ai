import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

describe("04_chatbot_nocode nihai iskelet — taze ingest bekler", () => {
  it("ders gövdesi, cue ve spoken script boştur", () => {
    const lessons = curriculumForCourseSlug("04_chatbot_nocode");
    expect(lessons).toEqual([]);
    expect(isAcademySpokenScriptLessonKey("04_chatbot_nocode-1")).toBe(false);
    expect(hasAcademyLessonCues("04_chatbot_nocode-1")).toBe(false);
    expect(isAcademyLessonAudioSealed("04_chatbot_nocode", "04_chatbot_nocode-1")).toBe(false);
    expect(academyCitizenPlayerLayer("04_chatbot_nocode", "04_chatbot_nocode-1")).toEqual({ kind: "article" });
  });
});
