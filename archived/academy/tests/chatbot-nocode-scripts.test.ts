import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("04_chatbot_nocode canlı sınav yolu", () => {
  it("altı ders müfredatta durur; ders 1 karaoke katmanındadır", () => {
    const lessons = curriculumForCourseSlug("04_chatbot_nocode");
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.key).toBe("04_chatbot_nocode-1");
    expect(hasAcademyLessonCues("04_chatbot_nocode-1")).toBe(true);
    expect(isAcademyLessonAudioSealed("04_chatbot_nocode", "04_chatbot_nocode-1")).toBe(true);
    expect(academyCitizenPlayerLayer("04_chatbot_nocode", "04_chatbot_nocode-1").kind).toBe(
      "article+karaoke",
    );
  });
});
