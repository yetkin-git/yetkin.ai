import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

describe("vatandaş oynatıcı katmanı — tek sözleşme", () => {
  it("mühürsüz compact ders article döner", () => {
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1")).toEqual({
      kind: "article",
    });
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-3")).toEqual({
      kind: "article",
    });
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

  it("yayın 5 SKU × 6 derste iki karaoke katmanı vardır", () => {
    const karaokeKeys = ACADEMY_GROWTH_SKU_SLUGS.flatMap((slug) =>
      curriculumForCourseSlug(slug)
        .filter((lesson) => academyCitizenPlayerLayer(slug, lesson.key).kind === "article+karaoke")
        .map((lesson) => lesson.key),
    );
    expect(karaokeKeys).toEqual(["01_office_ai-1", "01_office_ai-2"]);
  });
});
