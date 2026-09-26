import { describe, expect, it } from "vitest";
import officeAi1Cues from "@/lib/academy/lesson-cues/01_office_ai-1.json" with { type: "json" };
import officeAi5Cues from "@/lib/academy/lesson-cues/01_office_ai-5.json" with { type: "json" };
import officeAi6Cues from "@/lib/academy/lesson-cues/01_office_ai-6.json" with { type: "json" };
import officeAi1Timings from "@/lib/academy/lesson-audio-timings/01_office_ai-1.json" with { type: "json" };
import officeAi5Timings from "@/lib/academy/lesson-audio-timings/01_office_ai-5.json" with { type: "json" };
import officeAi6Timings from "@/lib/academy/lesson-audio-timings/01_office_ai-6.json" with { type: "json" };
import { punchcardsFromSealedJson } from "@/lib/academy/punchcard-from-sealed-json";
import {
  dronAcademyPunchcardsForLesson,
  dronLessonDeliveryLabel,
} from "../../apps/rail-is/src/ui/academy-punchcards";

describe("Dron punchcard — web timings JSON türevi", () => {
  it("1. ders saatleri timings JSON ile birebir türetilir", () => {
    const derived = punchcardsFromSealedJson(officeAi1Timings, officeAi1Cues);
    const dron = dronAcademyPunchcardsForLesson("01_office_ai-1");
    expect(dron).toEqual(derived);
    expect(dron).toHaveLength(8);
    expect(dron[0]).toMatchObject({ id: "cue-01", label: "GİRİŞ KÖPRÜSÜ", start: 2, end: 39.64 });
    expect(dron.at(-1)?.end).toBe(691.84);
    expect(dronLessonDeliveryLabel("01_office_ai-1")).toBe("Sesli anlatım");
  });

  it("5. ders HOŞ GELDİN rozeti 18 sn auto-hide taşır; kaset sonu timings’dir", () => {
    const derived = punchcardsFromSealedJson(officeAi5Timings, officeAi5Cues);
    const dron = dronAcademyPunchcardsForLesson("01_office_ai-5");
    expect(dron).toEqual(derived);
    expect(dron.find((card) => card.label === "HOŞ GELDİN")?.end).toBe(55.8);
    expect(dron.at(-1)?.end).toBe(553);
  });

  it("6. ders timings’den türetilir; sesli anlatım", () => {
    const derived = punchcardsFromSealedJson(officeAi6Timings, officeAi6Cues);
    const dron = dronAcademyPunchcardsForLesson("01_office_ai-6");
    expect(dron).toEqual(derived);
    expect(dron).toHaveLength(8);
    expect(dron.at(-1)?.end).toBe(506.04);
    expect(dron.find((card) => card.label === "HOŞ GELDİN")?.end).toBe(58.2);
    expect(dronLessonDeliveryLabel("01_office_ai-6")).toBe("Sesli anlatım");
  });

  it("KVKK kaseti mühürlü; Dron sesli anlatım taşır", () => {
    const dron = dronAcademyPunchcardsForLesson("01_office_ai-k1");
    expect(dron).toHaveLength(8);
    expect(dron.at(-1)?.end).toBe(702);
    expect(dronLessonDeliveryLabel("01_office_ai-k1")).toBe("Sesli anlatım");
  });

  it("amiral 9 dersin 9’u türetilmiş punchcard ve sesli anlatım taşır", () => {
    const keys = [
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-6",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-k1",
    ] as const;
    for (const key of keys) {
      const cards = dronAcademyPunchcardsForLesson(key);
      expect(cards.length).toBeGreaterThan(0);
      expect(dronLessonDeliveryLabel(key)).toBe("Sesli anlatım");
    }
  });
});
