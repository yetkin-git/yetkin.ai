import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_DIALOGUE_MS_PER_WORD,
  ACADEMY_SPOKEN_HIGHLIGHT_LAG_SEC,
  ACADEMY_TELEPROMPTER_FOCUS_RATIO,
  academyActiveCodeLineIndex,
  academyLessonStageFrame,
  academySpokenHighlightElapsedSec,
  academySpokenSentenceAtElapsed,
  academySpokenParagraphAtElapsed,
  academyTeleprompterProgress,
  academyTeleprompterTranslateY,
  buildAcademyTeleprompterCues,
  splitAcademySpokenParagraphs,
  splitAcademySpokenSentences,
  activeAcademyDialogueTurnIndex,
  academyDialogueReadingDurationSec,
  academyDialogueSpokenElapsedSec,
  academyDialogueSpeechRate,
  academyDialogueWordCount,
  buildAcademyDialogueTimeline,
  parseDialogueLine,
} from "@/lib/academy/dialogue-timeline";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE as INSTRUCTOR_RATE } from "@/lib/academy/instructors";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonAudioPublicPath,
  academyPlayerClockDurationSec,
  ACADEMY_SEALED_AUDIO_CACHE_V,
} from "@/lib/academy/lesson-audio";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { shouldSealProgressAfterDialogueEnded } from "@/lib/academy/lesson-advance";

describe("Tek eğitmen DialogueTurn zaman çizelgesi", () => {
  it("Koray/Maya satırını speaker id ile ayırır", () => {
    expect(parseDialogueLine("Koray: Etiket yoksa durursun.")).toEqual({
      speaker: "koray",
      text: "Etiket yoksa durursun.",
    });
    expect(parseDialogueLine("Maya: Fail-closed kapısı uydurmaz.")).toEqual({
      speaker: "maya",
      text: "Fail-closed kapısı uydurmaz.",
    });
    expect(parseDialogueLine("Can: Kale kapısı varsayılan kapalıdır.")).toEqual({
      speaker: "can",
      text: "Kale kapısı varsayılan kapalıdır.",
    });
    expect(parseDialogueLine("Ece: Parametre bağlanır, ham birleştirme durur.")).toEqual({
      speaker: "ece",
      text: "Parametre bağlanır, ham birleştirme durur.",
    });
    expect(parseDialogueLine("Tarık: Defter boşsa ortalama uydurmazsın.")).toEqual({
      speaker: "tarik",
      text: "Defter boşsa ortalama uydurmazsın.",
    });
    expect(parseDialogueLine("Gözde: ÇAPRAZARA tam eşleşme ister.")).toEqual({
      speaker: "gozde",
      text: "ÇAPRAZARA tam eşleşme ister.",
    });
    expect(parseDialogueLine("Isınma")).toBeNull();
  });

  it("Maya ve Ece Master Voice %93; Koray/Can tempo ayrı durmaz", () => {
    expect(INSTRUCTOR_RATE).toBe(0.93);
    expect(academyDialogueSpeechRate("maya")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("ece")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("koray")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("can")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("can", "security-temel")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("ece", "security-temel")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("can", "security-orta")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("ece", "security-orta")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("can", "security-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("ece", "security-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "excel-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "excel-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "google-ads-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "google-ads-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "meta-ads-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "meta-ads-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "eticaret-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "eticaret-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "canva-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "canva-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("tarik", "linkedin-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("gozde", "linkedin-masterclass")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("koray", "ai-agent-orta")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("koray", "fullstack-orta")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("koray", "fullstack-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("maya", "fullstack-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("maya", "ai-agent-orta")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("koray", "ai-agent-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueSpeechRate("maya", "ai-agent-ileri")).toBe(INSTRUCTOR_RATE);
    expect(academyDialogueWordCount("bir iki üç dört")).toBe(4);
    expect(academyDialogueReadingDurationSec("bir iki üç dört", "koray")).toBeCloseTo(
      (4 * ACADEMY_DIALOGUE_MS_PER_WORD) / 1000 / INSTRUCTOR_RATE,
      5,
    );
    expect(academyDialogueReadingDurationSec("bir iki üç dört", "maya")).toBeCloseTo(
      (4 * ACADEMY_DIALOGUE_MS_PER_WORD) / 1000 / INSTRUCTOR_RATE,
      5,
    );
  });

  it("python-temel-1 DialogueTurn akışı 8 sn sahte kaset değildir", () => {
    const lesson = curriculumForCourseSlug("python-temel")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body);
    expect(timeline.turns.length).toBeGreaterThanOrEqual(4);
    expect(timeline.turns[0]?.speaker).toBe("egitmen");
    expect(timeline.turns.every((turn) => turn.speaker === "egitmen" || turn.speaker === "maya")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
    expect(timeline.spokenDuration).toBeGreaterThan(8);
    expect(activeAcademyDialogueTurnIndex(timeline.turns, 0)).toBe(0);
    expect(activeAcademyDialogueTurnIndex(timeline.turns, timeline.spokenDuration)).toBe(
      timeline.turns.length - 1,
    );
  });

  it("security-temel-1 Can/Ece DialogueTurn akışı 8 sn sahte kaset değildir", () => {
    const lesson = curriculumForCourseSlug("security-temel")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body);
    expect(timeline.turns.length).toBeGreaterThanOrEqual(4);
    expect(timeline.turns[0]?.speaker).toBe("egitmen");
    expect(timeline.turns.every((turn) => turn.speaker === "egitmen" || turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("security-orta-1 Can/Ece DialogueTurn akışı Orta tempo mührünü taşır", () => {
    const lesson = curriculumForCourseSlug("security-orta")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "security-orta");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(4);
    expect(timeline.turns[0]?.speaker).toBe("egitmen");
    expect(timeline.turns.every((turn) => turn.speaker === "egitmen" || turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("security-ileri-1 Can/Ece DialogueTurn akışı İleri tempo mührünü taşır", () => {
    const lesson = curriculumForCourseSlug("security-ileri")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "security-ileri");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(4);
    expect(timeline.turns[0]?.speaker).toBe("egitmen");
    expect(timeline.turns.every((turn) => turn.speaker === "egitmen" || turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("excel-masterclass-1 Tarık/Gözde DialogueTurn akışı 8 sn sahte kaset değildir", () => {
    const lesson = curriculumForCourseSlug("excel-masterclass")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "excel-masterclass");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(4);
    expect(timeline.turns[0]?.speaker).toBe("egitmen");
    expect(timeline.turns.every((turn) => turn.speaker === "egitmen" || turn.speaker === "gozde")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("sahne paragrafları ana bölümde sabit kalır; kod satırı anlatılan tokena kilitlenir", () => {
    const sentences = splitAcademySpokenSentences(
      "Hoş geldiniz. Bu bölümde tempoyu konuşacağız. İlk satırda STOK durur.",
    );
    expect(sentences[0]).toMatch(/Hoş geldiniz/u);
    expect(sentences.length).toBeGreaterThan(1);

    const paragraphs = splitAcademySpokenParagraphs(
      "Hoş geldiniz. Bu bölümde tempoyu konuşacağız. İlk satırda STOK durur. Sözlük bir defterdir. Kapı açıksa sayı çıkar.",
    );
    expect(paragraphs[0]).toMatch(/Hoş geldiniz/u);
    expect(paragraphs[0]!.split(/(?<=[.!?…])\s+/u).length).toBeGreaterThan(1);

    const lesson = curriculumForCourseSlug("ai-agent-temel")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "ai-agent-temel");
    const mid = academySpokenSentenceAtElapsed(timeline.turns, timeline.turns[0]!.end * 0.6);
    expect(mid.sentence.length).toBeGreaterThan(12);
    const earlyParagraph = academySpokenParagraphAtElapsed(timeline.turns, timeline.turns[0]!.start + 0.2);
    const stillEarly = academySpokenParagraphAtElapsed(
      timeline.turns,
      timeline.turns[0]!.start + (timeline.turns[0]!.end - timeline.turns[0]!.start) * 0.08,
    );
    expect(earlyParagraph.paragraph).toBe(stillEarly.paragraph);
    expect(earlyParagraph.paragraph.length).toBeGreaterThan(40);

    const line = academyActiveCodeLineIndex({
      source: 'STOK = {"Ankara": 18}\n\ndef ajan_oku(sehir):\n    return STOK[sehir]',
      spokenText: "İlk satırda STOK adında bir sözlük durur.",
      turnStart: 0,
      turnEnd: 10,
      elapsedSec: 1,
    });
    expect(line).toBe(0);
    const fnLine = academyActiveCodeLineIndex({
      source: 'STOK = {"Ankara": 18}\n\ndef ajan_oku(sehir):\n    return STOK[sehir]',
      spokenText: "Sonra ajan_oku gelir.",
      turnStart: 0,
      turnEnd: 10,
      elapsedSec: 4,
    });
    expect(fnLine).toBe(2);
  });

  it("WAV süresi kelime saatine oranlanır", () => {
    expect(
      academyDialogueSpokenElapsedSec({ currentTime: 10, audioDuration: 20, spokenDuration: 40 }),
    ).toBe(20);
    expect(
      academyDialogueSpokenElapsedSec({ currentTime: 12.345, audioDuration: 100, spokenDuration: 100 }),
    ).toBe(12.345);
    expect(
      academyDialogueSpokenElapsedSec({ currentTime: 5, audioDuration: 0, spokenDuration: 40 }),
    ).toBe(5);
  });

  it("sahne çerçevesi Giriş → Problem → Kod → Özet damgasına göre değişir", () => {
    const lesson = curriculumForCourseSlug("ai-agent-temel")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "ai-agent-temel");
    expect(timeline.turns.some((turn) => /Baraj 70|A\) /.test(turn.text))).toBe(false);

    const fallbackCodes = [{ language: "py", source: "assert True" }] as const;
    const intro = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: 0,
      fallbackCodes,
    });
    expect(intro.heading).toBe("Giriş & Bağlam");
    expect(intro.code).toBeNull();
    expect(intro.caption.length).toBeGreaterThan(20);
    expect(intro.caption.includes("\n\n")).toBe(false);
    expect(intro.codeLineIndex).toBeNull();
    expect(splitAcademySpokenSentences(intro.caption).length).toBeGreaterThan(1);

    const sameParagraph = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: 0,
      elapsedSec: timeline.turns[0]!.start + (timeline.turns[0]!.end - timeline.turns[0]!.start) * 0.08,
    });
    expect(sameParagraph.caption).toBe(intro.caption);

    const laterIntro = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: 0,
      elapsedSec: Math.min(timeline.turns[0]!.end - 0.05, timeline.turns[0]!.start + (timeline.turns[0]!.end - timeline.turns[0]!.start) * 0.85),
    });
    expect(laterIntro.caption.length).toBeGreaterThan(20);
    expect(laterIntro.heading).toBe(intro.heading);

    const cues = buildAcademyTeleprompterCues(timeline.turns);
    expect(cues.length).toBeGreaterThan(8);
    expect(cues.map((cue) => cue.text).join(" ")).toContain(cues[0]!.text);
    const earlyCue = academyTeleprompterProgress(cues, timeline.turns[0]!.start + 0.2);
    const laterCue = academyTeleprompterProgress(
      cues,
      Math.min(
        timeline.turns[0]!.end - 0.05,
        timeline.turns[0]!.start + (timeline.turns[0]!.end - timeline.turns[0]!.start) * 0.85,
      ),
    );
    expect(laterCue.cueIndex).toBeGreaterThan(earlyCue.cueIndex);
    expect(cues[laterCue.cueIndex]!.text).not.toBe(cues[earlyCue.cueIndex]!.text);
    expect(ACADEMY_TELEPROMPTER_FOCUS_RATIO).toBe(0.5);
    const currentCue = academyTeleprompterTranslateY({
      cueTop: 40,
      cueHeight: 80,
      localRatio: 0,
      viewportHeight: 400,
    });
    expect(currentCue).toBe(120);
    expect(
      academyTeleprompterTranslateY({
        cueTop: 40,
        cueHeight: 80,
        localRatio: 1,
        viewportHeight: 400,
        nextCueTop: 140,
      }),
    ).toBe(currentCue);
    expect(
      academyTeleprompterTranslateY({
        cueTop: 140,
        cueHeight: 80,
        localRatio: 0,
        viewportHeight: 400,
      }),
    ).toBe(20);
    const second = cues[1]!;
    const beforeSecond = academyTeleprompterProgress(cues, Math.max(0, second.start - 0.001));
    expect(beforeSecond.cueIndex).toBe(0);
    expect(cues[beforeSecond.cueIndex]!.start).toBeLessThanOrEqual(second.start);
    expect(ACADEMY_SPOKEN_HIGHLIGHT_LAG_SEC).toBeGreaterThan(0);
    expect(academyTeleprompterProgress(cues, second.start).cueIndex).toBe(0);
    expect(
      academyTeleprompterProgress(cues, second.start + ACADEMY_SPOKEN_HIGHLIGHT_LAG_SEC).cueIndex,
    ).toBeGreaterThanOrEqual(1);
    const midCue = cues[Math.min(2, cues.length - 1)]!;
    const midElapsed = (midCue.start + midCue.end) / 2;
    const midProgress = academyTeleprompterProgress(cues, midElapsed);
    const highlightElapsed = academySpokenHighlightElapsedSec(midElapsed);
    expect(cues[midProgress.cueIndex]!.start).toBeLessThanOrEqual(highlightElapsed);
    if (cues[midProgress.cueIndex + 1]) {
      expect(cues[midProgress.cueIndex + 1]!.start).toBeGreaterThan(highlightElapsed);
    }

    const problemIndex = timeline.turns.findIndex((turn) => turn.act === "problem");
    const problem = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: problemIndex,
      fallbackCodes,
    });
    expect(problem.heading).toBe("Problem");
    expect(problem.code).toBeNull();

    const codeIndex = timeline.turns.findIndex((turn) => turn.act === "development");
    const code = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: codeIndex,
      fallbackCodes,
    });
    expect(code.heading).toBe("Kod & Uygulama Mantığı");
    expect(code.code?.source).toMatch(/ajan_oku|STOK/);
    expect(code.codeLineIndex).toBeTypeOf("number");
    expect(code.caption.length).toBeGreaterThan(12);

    const summaryIndex = timeline.turns.findIndex((turn) => turn.act === "conclusion");
    const summary = academyLessonStageFrame({
      turns: timeline.turns,
      activeIndex: summaryIndex,
      fallbackCodes,
    });
    expect(summary.heading).toBe("Özet & Kazanım");
    expect(summary.code).toBeNull();

    const pythonLesson = curriculumForCourseSlug("python-temel")[0]!;
    const pythonTimeline = buildAcademyDialogueTimeline(pythonLesson.body, "python-temel");
    const pythonFallback = [{ language: "py", source: 'musteri_adi = "Ayşe"' }];
    const pythonIntro = academyLessonStageFrame({
      turns: pythonTimeline.turns,
      activeIndex: 0,
      fallbackCodes: pythonFallback,
    });
    expect(pythonIntro.heading).toBe("Giriş & Bağlam");
    expect(pythonIntro.code).toBeNull();
    const pythonDevIndex = pythonTimeline.turns.findIndex((turn) => turn.act === "development");
    expect(pythonDevIndex).toBeGreaterThan(0);
    const pythonDev = academyLessonStageFrame({
      turns: pythonTimeline.turns,
      activeIndex: pythonDevIndex,
      fallbackCodes: pythonFallback,
    });
    expect(pythonDev.heading).toBe("Kod & Uygulama Mantığı");
    expect(pythonDev.code?.source).toBeTruthy();
    const pythonSummaryIndex = pythonTimeline.turns.findIndex((turn) => turn.act === "conclusion");
    const pythonSummary = academyLessonStageFrame({
      turns: pythonTimeline.turns,
      activeIndex: pythonSummaryIndex,
      fallbackCodes: pythonFallback,
    });
    expect(pythonSummary.heading).toBe("Özet & Kazanım");
    expect(pythonSummary.code).toBeNull();
  });

  it("mühürlü ses yolu canlı TTS tetiklemez", () => {
    expect(academyLessonAudioPublicPath("python-temel", "python-temel-1")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/python-temel/python-temel-1.wav`,
    );
    expect(academyLessonAudioPlaybackSrc("python-temel", "python-temel-1")).toBe(
      academyLessonAudioPublicPath("python-temel", "python-temel-1"),
    );
    expect(academyLessonAudioPublicPath("ai-agent-temel", "ai-agent-temel-2")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/ai-agent-temel/ai-agent-temel-2.wav`,
    );
    expect(academyLessonAudioPlaybackSrc("ai-agent-temel", "ai-agent-temel-2")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/ai-agent-temel/ai-agent-temel-2.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-2"]}`,
    );
    expect(academyLessonAudioPlaybackSrc("ai-agent-temel", "ai-agent-temel-3")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/ai-agent-temel/ai-agent-temel-3.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-3"]}`,
    );
    expect(academyLessonAudioPlaybackSrc("ai-agent-temel", "ai-agent-temel-4")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/ai-agent-temel/ai-agent-temel-4.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-4"]}`,
    );
    expect(
      academyPlayerClockDurationSec({ audioDuration: 107, sealedDuration: 420, spokenDuration: 474 }),
    ).toBe(420);
    expect(
      academyPlayerClockDurationSec({ audioDuration: 430, sealedDuration: 420, spokenDuration: 474 }),
    ).toBe(430);
  });

  it("oynatılmamış veya bitmemiş diyalog ilerleme basmaz", () => {
    expect(shouldSealProgressAfterDialogueEnded({ playbackStarted: false, reachedEnd: true })).toBe(
      false,
    );
    expect(shouldSealProgressAfterDialogueEnded({ playbackStarted: true, reachedEnd: false })).toBe(
      false,
    );
    expect(shouldSealProgressAfterDialogueEnded({ playbackStarted: true, reachedEnd: true })).toBe(
      true,
    );
  });
});
