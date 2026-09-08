import { describe, expect, it } from "vitest";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { loadAcademySpokenScriptParagraphs } from "@/lib/academy/spoken-scripts";
import {
  ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MIN_SEC,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";

describe("TTS nefes dilimleyici", () => {
  it("3–5 sn penceresinde noktalama sınırından böler; 42 sn’lik dev blok üretmez", () => {
    expect(ACADEMY_TTS_BREATH_CHUNK_MIN_SEC).toBe(3);
    expect(ACADEMY_TTS_BREATH_CHUNK_MAX_SEC).toBe(5);
    expect(ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC).toBeLessThanOrEqual(8);

    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-1");
    expect(paragraphs.length).toBe(19);
    const lessonTwo = loadAcademySpokenScriptParagraphs("01_office_ai-2");
    expect(lessonTwo.length).toBe(12);
    const lessonThree = loadAcademySpokenScriptParagraphs("01_office_ai-3");
    expect(lessonThree.length).toBe(12);
    const lessonFour = loadAcademySpokenScriptParagraphs("01_office_ai-4");
    expect(lessonFour.length).toBe(12);
    const lessonFive = loadAcademySpokenScriptParagraphs("01_office_ai-5");
    expect(lessonFive.length).toBe(12);
    const lessonSix = loadAcademySpokenScriptParagraphs("01_office_ai-6");
    expect(lessonSix.length).toBe(12);
    const allParagraphs = [...paragraphs, ...lessonTwo, ...lessonThree, ...lessonFour, ...lessonFive, ...lessonSix];
    const chunks = allParagraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(chunks.length).toBeGreaterThan(allParagraphs.length);
    expect(chunks.join(" ")).toBe(allParagraphs.join(" "));

    const oversize = chunks.filter(
      (chunk) => academyDialogueReadingDurationSec(chunk, "egitmen") > ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC + 0.05,
    );
    expect(oversize).toEqual([]);
    expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
  });

  it("kısa metni tek parça bırakır", () => {
    expect(splitAcademyTtsBreathChunks("Merhaba. Ben Gözde.")).toEqual(["Merhaba. Ben Gözde."]);
  });
});
