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

    const officeOne = loadAcademySpokenScriptParagraphs("01_office_ai-1");
    expect(officeOne).toHaveLength(15);
    const officeTwo = loadAcademySpokenScriptParagraphs("01_office_ai-2");
    expect(officeTwo).toHaveLength(14);
    const officeThree = loadAcademySpokenScriptParagraphs("01_office_ai-3");
    expect(officeThree).toHaveLength(14);
    const officeFour = loadAcademySpokenScriptParagraphs("01_office_ai-4");
    expect(officeFour).toHaveLength(14);
    const officeFive = loadAcademySpokenScriptParagraphs("01_office_ai-5");
    expect(officeFive).toHaveLength(14);
    const officeSix = loadAcademySpokenScriptParagraphs("01_office_ai-6");
    expect(officeSix).toHaveLength(14);
    const officeG1 = loadAcademySpokenScriptParagraphs("01_office_ai-g1");
    expect(officeG1).toHaveLength(14);
    const officeW1 = loadAcademySpokenScriptParagraphs("01_office_ai-w1");
    expect(officeW1).toHaveLength(14);
    const officeK1 = loadAcademySpokenScriptParagraphs("01_office_ai-k1");
    expect(officeK1).toHaveLength(14);
    const officeChunks = officeOne.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(officeChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(officeChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);
    const leftoverKeys = [
      "02_ecommerce_ai-1",
      "02_ecommerce_ai-2",
      "02_ecommerce_ai-3",
      "02_ecommerce_ai-4",
      "02_ecommerce_ai-5",
      "02_ecommerce_ai-6",
      "03_social_media_ai-1",
      "03_social_media_ai-6",
      "04_chatbot_nocode-1",
      "04_chatbot_nocode-6",
      "05_prompt_practice-1",
      "05_prompt_practice-6",
    ];
    for (const key of leftoverKeys) {
      expect(loadAcademySpokenScriptParagraphs(key), key).toEqual([]);
    }

    const syntheticParagraph =
      "Düzensiz tabloyu düzenle. Formülü sor. Raporu yazdır. Gelen kutuyu sıfırla. İstisnayı yakala. Haftalık rutini kur. " +
      "Bu cümle TTS nefes dilimleyicisini sentetik gövdeyle ölçer. Eski stüdyo konuşma metni taze ingest öncesi diskte durmaz. ".repeat(
        40,
      );
    const chunks = splitAcademyTtsBreathChunks(syntheticParagraph);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ")).toBe(syntheticParagraph.trim());
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
    expect(withPause).toBe(
      `Merhaba. ${ACADEMY_TTS_BREATH_PAUSE_TAG} Ben Gözde. ${ACADEMY_TTS_BREATH_PAUSE_TAG} Kahveni al.`,
    );
    expect(stripAcademyTtsBreathPauses(withPause)).toBe(spoken);
    expect(injectAcademyTtsBreathPauses(withPause)).toBe(withPause);
    expect(injectAcademyTtsBreathPauses("1. A1 hücresine sütun adı koy. 2. Birleşikleri çöz.")).toBe(
      `1. A1 hücresine sütun adı koy. ${ACADEMY_TTS_BREATH_PAUSE_TAG} 2. Birleşikleri çöz.`,
    );
    expect(injectAcademyTtsBreathPauses("Hazırsan 2. bölümde buluşalım.")).toBe(
      "Hazırsan 2. bölümde buluşalım.",
    );
  });
});
