import { describe, expect, it } from "vitest";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_MEDIA_PRODUCTION_QUEUE,
  ACADEMY_MEDIA_SEALED_AUDIO,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
} from "@/lib/academy/pilot-sku";
import {
  academyLessonAudioObjectPath,
  academyMediaReleaseCacheKey,
} from "@/lib/academy/media-release-seal";

describe("akademi medya mühür sicili", () => {
  it("mühürlü ses 1. ve 2. bölüm pilottur; growth SKU amiral compact makaledir", () => {
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toEqual(["01_office_ai"]);
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": ["01_office_ai-1", "01_office_ai-2"],
    });
    expect(ACADEMY_MEDIA_PRODUCTION_QUEUE).toEqual({
      "01_office_ai": ["01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6"],
    });
    expect([...ACADEMY_GROWTH_SKU_SLUGS]).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(ACADEMY_GROWTH_SKU_SLUGS).toContain("01_office_ai");
    expect(academyLessonAudioObjectPath("sample-course", "sample-course-1")).toBe(
      "academy/audio/sample-course/sample-course-1.wav",
    );
    expect(academyMediaReleaseCacheKey("sample-course", "sample-course-1")).toBe(
      "media-release:sample-course:sample-course-1",
    );
  });
});
