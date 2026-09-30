import { describe, expect, it } from "vitest";
import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";
import { academyCourseSealedDurationSec } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { loadAcademySpokenScriptParagraphs } from "@/lib/academy/spoken-scripts";
import { academyTtsPieceCachePaths, academyTtsPieceFingerprint } from "@/lib/academy/tts-piece-cache";
import {
  ACADEMY_TTS_PACE_NOTE,
  ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE,
  buildAcademyTtsStudioContents,
} from "@/lib/academy/tts-studio-prompt";
import {
  ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MAX_SEC,
  ACADEMY_TTS_BREATH_CHUNK_MIN_SEC,
  ACADEMY_TTS_BREATH_PAUSE_TAG,
  ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  ACADEMY_TTS_RPM_GAP_MS,
  academyLessonRequestTargetForCourse,
  academyTtsLessonRequestBudget,
  assertAcademyTtsLessonRequestBudget,
  injectAcademyTtsBreathPauses,
  packAcademyTtsLessonRequests,
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
    expect(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX).toBe(12);
    expect(academyTtsLessonRequestBudget(12).inTargetBand).toBe(true);
    expect(academyTtsLessonRequestBudget(12).withinHardMax).toBe(true);
    expect(academyTtsLessonRequestBudget(9).withinHardMax).toBe(false);
    expect(academyTtsLessonRequestBudget(13).withinHardMax).toBe(false);
    expect(() => assertAcademyTtsLessonRequestBudget(16, false)).toThrow(/TTS istek bandı/u);
    expect(() => assertAcademyTtsLessonRequestBudget(11, false)).not.toThrow();
    expect(() => assertAcademyTtsLessonRequestBudget(4, false, 40)).not.toThrow();
    expect(() => assertAcademyTtsLessonRequestBudget(0, false)).toThrow(/TTS istek yok/u);

    const officeOne = loadAcademySpokenScriptParagraphs("01_office_ai-1");
    expect(officeOne).toHaveLength(15);
    const officeTwo = loadAcademySpokenScriptParagraphs("01_office_ai-2");
    expect(officeTwo).toHaveLength(14);
    const officeThree = loadAcademySpokenScriptParagraphs("01_office_ai-3");
    expect(officeThree).toHaveLength(14);
    expect(loadAcademySpokenScriptParagraphs("01_office_ai-4")).toEqual([]);
    const officeFive = loadAcademySpokenScriptParagraphs("01_office_ai-5");
    expect(officeFive).toHaveLength(14);
    const officeSix = loadAcademySpokenScriptParagraphs("01_office_ai-6");
    expect(officeSix).toHaveLength(18);
    const officeG1 = loadAcademySpokenScriptParagraphs("01_office_ai-g1");
    expect(officeG1).toHaveLength(18);
    const officeW1 = loadAcademySpokenScriptParagraphs("01_office_ai-w1");
    expect(officeW1).toHaveLength(19);
    const officeK1 = loadAcademySpokenScriptParagraphs("01_office_ai-k1");
    expect(officeK1).toHaveLength(14);
    expect(academyLessonRequestTargetForCourse(8)).toBe(10);
    expect(academyLessonRequestTargetForCourse(6)).toBe(12);
    const officeRequests = packAcademyTtsLessonRequests(officeOne, 10);
    expect(officeRequests.length).toBe(10);
    expect(officeRequests.map((block) => block.text).join(" ")).toBe(
      officeOne.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph)).join(" "),
    );
    for (const key of [
      "02_ecommerce_ai-1",
      "02_ecommerce_ai-2",
      "02_ecommerce_ai-3",
      "02_ecommerce_ai-4",
      "02_ecommerce_ai-5",
      "02_ecommerce_ai-6",
    ]) {
      expect(loadAcademySpokenScriptParagraphs(key).length, key).toBeGreaterThan(0);
    }
    const leftoverKeys = [
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

  it("8 kaset 10’ar parça, 6. ders 1.75 sn geçiş ve kurs toplamı mühürlü timings ile kilitlenir", () => {
    const pieceCounts: Record<string, number> = {
      "01_office_ai-1": 13,
      "01_office_ai-2": 10,
      "01_office_ai-3": 11,
      "01_office_ai-5": 11,
      "01_office_ai-6": 10,
      "01_office_ai-g1": 11,
      "01_office_ai-w1": 11,
      "01_office_ai-k1": 12,
    };
    for (const [key, count] of Object.entries(pieceCounts)) {
      const timings = loadAcademySealedAudioTimings(key);
      expect(timings?.pieces, key).toHaveLength(count);
      expect(timings?.pauseSec, key).toBe(0.4);
    }
    const six = loadAcademySealedAudioTimings("01_office_ai-6");
    expect(six).not.toBeNull();
    expect(six!.durationSec).toBe(526.723);
    expect(six!.cacheV).toBe(529723);
    const breathGaps = six!.pieces.slice(1).map((piece, index) =>
      Number((piece.start - six!.pieces[index]!.end).toFixed(3)),
    );
    expect(breathGaps).toHaveLength(9);
    expect(breathGaps.every((gap) => gap === 1.75)).toBe(true);
    expect(Math.abs(academyCourseSealedDurationSec("01_office_ai") - 4880.862)).toBeLessThanOrEqual(0.01);
  });

  it("OFF-101 sekiz dersi metin düşürmeden 10’ar isteğe paketler", () => {
    const keys = [
      "01_office_ai-1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-6",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-k1",
    ];
    let total = 0;
    for (const key of keys) {
      const paragraphs = loadAcademySpokenScriptParagraphs(key);
      const packed = packAcademyTtsLessonRequests(paragraphs, academyLessonRequestTargetForCourse(8));
      expect(packed, key).toHaveLength(10);
      expect(packed.map((block) => block.text).join(" "), key).toBe(
        paragraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph)).join(" "),
      );
      total += packed.length;
    }
    expect(total).toBe(80);
  });

  it("parça önbelleği aynı metni aynı yola kilitler", () => {
    const fingerprint = academyTtsPieceFingerprint({
      model: "gemini-3.8-flash-tts",
      voice: "Callirrhoe",
      speechRate: 0.93,
      text: "Merhaba. Ben Gözde.",
    });
    const again = academyTtsPieceFingerprint({
      model: "gemini-3.8-flash-tts",
      voice: "Callirrhoe",
      speechRate: 0.93,
      text: "Merhaba. Ben Gözde.",
    });
    const other = academyTtsPieceFingerprint({
      model: "gemini-3.8-flash-tts",
      voice: "Callirrhoe",
      speechRate: 0.93,
      text: "Merhaba. Ben Aylin.",
    });
    expect(again).toBe(fingerprint);
    expect(other).not.toBe(fingerprint);
    const acoustic = academyTtsPieceFingerprint({
      model: "gemini-3.8-flash-tts",
      voice: "Callirrhoe",
      speechRate: 0.93,
      text: "Merhaba. Ben Gözde.",
      acoustic: "studio-grade natural voice, close-mic, clean acoustic environment, no reverb, crisp presence",
    });
    expect(acoustic).not.toBe(fingerprint);
    const paths = academyTtsPieceCachePaths({
      root: "D:/yetkin.ai",
      courseSlug: "01_office_ai",
      lessonKey: "01_office_ai-1",
      index: 0,
      fingerprint,
    });
    expect(paths.wav).toContain(`00-${fingerprint}.wav`);
    expect(paths.mp3).toContain(`00-${fingerprint}.mp3`);
    expect(paths.wav).toContain("piece-cache");
  });

  it("stüdyo direktifi transkriptin üstünde kalır", () => {
    const spoken = "Merhaba. Ben Gözde.";
    const contents = buildAcademyTtsStudioContents(spoken);
    expect(ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE).toBe(
      "studio-grade natural voice, close-mic, clean acoustic environment, no reverb, crisp presence",
    );
    expect(contents).toContain(ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE);
    expect(contents).toContain(ACADEMY_TTS_PACE_NOTE);
    expect(ACADEMY_TTS_PACE_NOTE).toBe("Pace: calm, natural, clear accent.");
    expect(contents.indexOf("#### TRANSCRIPT")).toBeLessThan(contents.indexOf(spoken));
    expect(contents.endsWith(spoken)).toBe(true);
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
