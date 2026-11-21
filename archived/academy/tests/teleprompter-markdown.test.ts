import { describe, expect, it } from "vitest";
import { buildAcademyDialogueTimeline } from "@/lib/academy/dialogue-timeline";

const SYNTHETIC_MARKDOWN = `
## Açılış

Eğitmen: Merhaba, bu örnek bir diyalog satırıdır.

Ece: Devam edelim.

## Kapanış

Eğitmen: Özet: sentetik teleprompter metni.
`;

describe("teleprompter markdown (sentetik)", () => {
  it("sentetik markdown diyalog zaman çizelgesi üretir", () => {
    const timeline = buildAcademyDialogueTimeline(SYNTHETIC_MARKDOWN, "sample-course");
    expect(timeline.turns.length).toBeGreaterThan(0);
    expect(timeline.turns.some((turn) => turn.text.length > 0)).toBe(true);
  });
});
