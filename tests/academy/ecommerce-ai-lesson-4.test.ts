import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("02_ecommerce_ai-4 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-4")).toBe(false);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-4")).toBe(false);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-4")).toEqual({ kind: "article" });
  });
});
