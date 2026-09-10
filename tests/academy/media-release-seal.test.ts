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
  it("mühürlü ses 1–6. bölüm pilottur; growth SKU amiral compact makaledir", () => {
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toEqual([
      "01_office_ai",
      "02_ecommerce_ai",
      "03_social_media_ai",
      "04_chatbot_nocode",
      "05_prompt_practice",
    ]);
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": [
        "01_office_ai-1",
        "01_office_ai-2",
        "01_office_ai-3",
        "01_office_ai-4",
        "01_office_ai-5",
        "01_office_ai-6",
      ],
      "02_ecommerce_ai": [
        "02_ecommerce_ai-1",
        "02_ecommerce_ai-2",
        "02_ecommerce_ai-3",
        "02_ecommerce_ai-4",
        "02_ecommerce_ai-5",
        "02_ecommerce_ai-6",
      ],
      "03_social_media_ai": [
        "03_social_media_ai-1",
        "03_social_media_ai-2",
        "03_social_media_ai-3",
        "03_social_media_ai-4",
        "03_social_media_ai-5",
        "03_social_media_ai-6",
      ],
      "04_chatbot_nocode": [
        "04_chatbot_nocode-1",
        "04_chatbot_nocode-2",
        "04_chatbot_nocode-3",
        "04_chatbot_nocode-4",
        "04_chatbot_nocode-5",
        "04_chatbot_nocode-6",
      ],
      "05_prompt_practice": [
        "05_prompt_practice-1",
        "05_prompt_practice-2",
        "05_prompt_practice-3",
        "05_prompt_practice-4",
        "05_prompt_practice-5",
        "05_prompt_practice-6",
      ],
    });
    expect(ACADEMY_MEDIA_PRODUCTION_QUEUE).toEqual({});
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
