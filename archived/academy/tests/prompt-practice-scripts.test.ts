import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { PROMPT_PRACTICE_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-prompt";

describe("05_prompt_practice canlı sınav yolu", () => {
  it("altı ders müfredatta durur; ders 1 karaoke katmanındadır", () => {
    const lessons = curriculumForCourseSlug("05_prompt_practice");
    expect(lessons).toHaveLength(6);
    expect(lessons[0]?.key).toBe("05_prompt_practice-1");
    expect(hasAcademyLessonCues("05_prompt_practice-1")).toBe(true);
    expect(isAcademyLessonAudioSealed("05_prompt_practice", "05_prompt_practice-1")).toBe(true);
    expect(academyCitizenPlayerLayer("05_prompt_practice", "05_prompt_practice-1").kind).toBe(
      "article+karaoke",
    );
  });

  it("sınav havuzu vatandaş dilindedir", () => {
    const blob = PROMPT_PRACTICE_EXAM_QUESTIONS.map(
      (question) => `${question.prompt} ${question.choices.join(" ")}`,
    ).join("\n");
    expect(blob).not.toMatch(/halüsinasyon|LLM|Few-Shot|Chain-of-Thought|prompt mühendisliği/iu);
  });
});
