import { describe, expect, it } from "vitest";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { loadAcademySpokenScriptParagraphs } from "@/lib/academy/spoken-scripts";
import {
  ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MIN_SEC,
  ACADEMY_TTS_BREATH_PAUSE_TAG,
  ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  ACADEMY_TTS_RPM_GAP_MS,
  academyTtsLessonRequestBudget,
  assertAcademyTtsLessonRequestBudget,
  injectAcademyTtsBreathPauses,
  splitAcademyTtsBreathChunks,
  stripAcademyTtsBreathPauses,
} from "@/lib/academy/tts-breath-chunks";

describe("TTS nefes dilimleyici", () => {
  it("anlamlı paragraf bloğuna paketler; 3–5 sn mikro dilim ve 82 istek üretmez", () => {
    expect(ACADEMY_TTS_BREATH_CHUNK_MIN_SEC).toBe(18);
    expect(ACADEMY_TTS_BREATH_CHUNK_MAX_SEC).toBe(70);
    expect(ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC).toBeLessThanOrEqual(80);
    expect(ACADEMY_TTS_RPM_GAP_MS).toBe(6_500);
    expect(60_000 / ACADEMY_TTS_RPM_GAP_MS).toBeLessThan(10);
    expect(ACADEMY_TTS_LESSON_REQUEST_MIN).toBe(10);
    expect(ACADEMY_TTS_LESSON_REQUEST_MAX).toBe(12);
    expect(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX).toBe(15);
    expect(academyTtsLessonRequestBudget(12).inTargetBand).toBe(true);
    expect(academyTtsLessonRequestBudget(15).withinHardMax).toBe(true);
    expect(academyTtsLessonRequestBudget(16).withinHardMax).toBe(false);
    expect(() => assertAcademyTtsLessonRequestBudget(16, false)).toThrow(/TTS istek tavanı/u);
    expect(() => assertAcademyTtsLessonRequestBudget(19, true)).not.toThrow();

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
    const ecommerceOne = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-1");
    expect(ecommerceOne.length).toBe(12);
    const ecommerceTwo = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-2");
    expect(ecommerceTwo.length).toBe(12);
    const ecommerceThree = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-3");
    expect(ecommerceThree.length).toBe(12);
    const ecommerceFour = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-4");
    expect(ecommerceFour.length).toBe(12);
    const ecommerceFive = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-5");
    expect(ecommerceFive.length).toBe(12);
    const ecommerceSix = loadAcademySpokenScriptParagraphs("02_ecommerce_ai-6");
    expect(ecommerceSix.length).toBe(12);
    const socialOne = loadAcademySpokenScriptParagraphs("03_social_media_ai-1");
    expect(socialOne.length).toBe(12);
    const socialSix = loadAcademySpokenScriptParagraphs("03_social_media_ai-6");
    expect(socialSix.length).toBe(12);
    const chatbotOne = loadAcademySpokenScriptParagraphs("04_chatbot_nocode-1");
    expect(chatbotOne.length).toBe(12);
    const chatbotSix = loadAcademySpokenScriptParagraphs("04_chatbot_nocode-6");
    expect(chatbotSix.length).toBe(12);
    const promptOne = loadAcademySpokenScriptParagraphs("05_prompt_practice-1");
    expect(promptOne.length).toBe(12);
    const promptSix = loadAcademySpokenScriptParagraphs("05_prompt_practice-6");
    expect(promptSix.length).toBe(12);

    const lessonThreeChunks = lessonThree.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(lessonThreeChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(lessonThreeChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const lessonFourChunks = lessonFour.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(lessonFourChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(lessonFourChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const lessonFiveChunks = lessonFive.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(lessonFiveChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(lessonFiveChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);

    const ecommerceOneChunks = ecommerceOne.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceOneChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceOneChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const ecommerceTwoChunks = ecommerceTwo.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceTwoChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceTwoChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const ecommerceThreeChunks = ecommerceThree.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceThreeChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceThreeChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const ecommerceFourChunks = ecommerceFour.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceFourChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceFourChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const ecommerceFiveChunks = ecommerceFive.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceFiveChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceFiveChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const ecommerceSixChunks = ecommerceSix.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(ecommerceSixChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(ecommerceSixChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);

    const allParagraphs = [...paragraphs, ...lessonTwo, ...lessonThree, ...lessonFour, ...lessonFive, ...lessonSix, ...ecommerceOne, ...ecommerceTwo, ...ecommerceThree, ...ecommerceFour, ...ecommerceFive, ...ecommerceSix];
    const chunks = allParagraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(chunks.length).toBeGreaterThanOrEqual(allParagraphs.length);
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

  it("cümle geçişlerine [pause] koyar; teleprompter metnini kirletmez", () => {
    const spoken = "Merhaba. Ben Gözde. Kahveni al.";
    const withPause = injectAcademyTtsBreathPauses(spoken);
    expect(withPause).toBe(`Merhaba. ${ACADEMY_TTS_BREATH_PAUSE_TAG} Ben Gözde. ${ACADEMY_TTS_BREATH_PAUSE_TAG} Kahveni al.`);
    expect(stripAcademyTtsBreathPauses(withPause)).toBe(spoken);
    expect(injectAcademyTtsBreathPauses(withPause)).toBe(withPause);
  });
});
