import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

describe("vatandaş oynatıcı katmanı — tek sözleşme", () => {
  it("02_ecommerce_ai-1 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-1.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(500);
    expect(layer.durationSec).toBeGreaterThanOrEqual(540);
  });

  it("02_ecommerce_ai-2 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-2");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-2.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(500);
    expect(layer.durationSec).toBeGreaterThanOrEqual(540);
  });

  it("02_ecommerce_ai-3 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-3");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-3.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(500);
    expect(layer.durationSec).toBeGreaterThanOrEqual(540);
  });

  it("02_ecommerce_ai-4 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-4");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-4.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(500);
    expect(layer.durationSec).toBeGreaterThanOrEqual(540);
  });

  it("02_ecommerce_ai-5 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-5");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-5.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(500);
    expect(layer.durationSec).toBeGreaterThanOrEqual(500);
  });

  it("02_ecommerce_ai-6 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-6");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("02_ecommerce_ai-6.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(470);
    expect(layer.durationSec).toBeGreaterThanOrEqual(480);
  });

  it("03_social_media_ai-1 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("03_social_media_ai", "03_social_media_ai-1");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("03_social_media_ai-1.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(350);
    expect(layer.durationSec).toBeGreaterThanOrEqual(360);
  });

  it("01_office_ai-1 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-1");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-1.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(400);
    expect(layer.durationSec).toBeGreaterThanOrEqual(420);
  });

  it("01_office_ai-2 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-2");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-2.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(360);
    expect(layer.durationSec).toBeGreaterThanOrEqual(400);
  });

  it("01_office_ai-3 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-3");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-3.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(360);
    expect(layer.durationSec).toBeGreaterThanOrEqual(400);
  });

  it("01_office_ai-4 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-4");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-4.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(360);
    expect(layer.durationSec).toBeGreaterThanOrEqual(400);
  });

  it("01_office_ai-5 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-5");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-5.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(360);
    expect(layer.durationSec).toBeGreaterThanOrEqual(360);
  });

  it("01_office_ai-6 cue + WAV saati ile karaoke katmanı açar", () => {
    const layer = academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("01_office_ai-6.wav");
    expect(layer.cues[0]?.start).toBe(0);
    expect(layer.cues.at(-1)?.end).toBeGreaterThan(330);
    expect(layer.durationSec).toBeGreaterThanOrEqual(330);
  });

  it("yayın 5 SKU × 6 derste otuz karaoke katmanı vardır", () => {
    const karaokeKeys = ACADEMY_GROWTH_SKU_SLUGS.flatMap((slug) =>
      curriculumForCourseSlug(slug)
        .filter((lesson) => academyCitizenPlayerLayer(slug, lesson.key).kind === "article+karaoke")
        .map((lesson) => lesson.key),
    );
    expect(karaokeKeys).toEqual([
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-4",
      "01_office_ai-5",
      "01_office_ai-6",
      "02_ecommerce_ai-1",
      "02_ecommerce_ai-2",
      "02_ecommerce_ai-3",
      "02_ecommerce_ai-4",
      "02_ecommerce_ai-5",
      "02_ecommerce_ai-6",
      "03_social_media_ai-1",
      "03_social_media_ai-2",
      "03_social_media_ai-3",
      "03_social_media_ai-4",
      "03_social_media_ai-5",
      "03_social_media_ai-6",
      "04_chatbot_nocode-1",
      "04_chatbot_nocode-2",
      "04_chatbot_nocode-3",
      "04_chatbot_nocode-4",
      "04_chatbot_nocode-5",
      "04_chatbot_nocode-6",
      "05_prompt_practice-1",
      "05_prompt_practice-2",
      "05_prompt_practice-3",
      "05_prompt_practice-4",
      "05_prompt_practice-5",
      "05_prompt_practice-6",
    ]);
  });
});
