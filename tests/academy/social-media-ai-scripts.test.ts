import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("03_social_media_ai canlı sınav yolu", () => {
  it("altı ders müfredatta durur; ders 1 karaoke katmanındadır", () => {
    const lessons = curriculumForCourseSlug("03_social_media_ai");
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.key).toBe("03_social_media_ai-1");
    expect(hasAcademyLessonCues("03_social_media_ai-1")).toBe(true);
    expect(isAcademyLessonAudioSealed("03_social_media_ai", "03_social_media_ai-1")).toBe(true);
    expect(academyCitizenPlayerLayer("03_social_media_ai", "03_social_media_ai-1").kind).toBe(
      "article+karaoke",
    );
  });
});
