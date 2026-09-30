import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { ecommerceAiSections } from "@/lib/academy/curricula/ecommerce_ai";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("02_ecommerce_ai-3 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-3")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-3")).toBe(true);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-3").kind).toBe("article+karaoke");
    const lesson = ecommerceAiSections.find((section) => section.lessonKey === "02_ecommerce_ai-3");
    expect(lesson?.contentMarkdown).toContain("Kendine çok iyi bak.");
    expect(lesson?.contentMarkdown).not.toContain("Kendinize");
    expect(lesson?.contentMarkdown).not.toContain("### ");
  });
});
