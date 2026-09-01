import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_DIALOGUE_MS_PER_WORD,
  activeAcademyDialogueTurnIndex,
  academyDialogueReadingDurationSec,
  academyDialogueSpokenElapsedSec,
  academyDialogueSpeechRate,
  academyDialogueWordCount,
  buildAcademyDialogueTimeline,
  parseDialogueLine,
} from "@/lib/academy/dialogue-timeline";
import { ACADEMY_INSTRUCTOR_SPEECH_RATE as INSTRUCTOR_RATE } from "@/lib/academy/instructors";
import { academyLessonAudioPublicPath } from "@/lib/academy/lesson-audio";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { shouldSealProgressAfterDialogueEnded } from "@/lib/academy/lesson-advance";

describe("Çift-AI DialogueTurn zaman çizelgesi", () => {
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

  it("Maya ve Ece %95, Koray ve Can %100 tempo mührünü taşır", () => {
    expect(INSTRUCTOR_RATE).toBe(0.95);
    expect(academyDialogueSpeechRate("maya")).toBe(0.95);
    expect(academyDialogueSpeechRate("ece")).toBe(0.95);
    expect(academyDialogueSpeechRate("koray")).toBe(1);
    expect(academyDialogueSpeechRate("can")).toBe(1);
    expect(academyDialogueSpeechRate("can", "security-temel")).toBe(1);
    expect(academyDialogueSpeechRate("ece", "security-temel")).toBe(0.95);
    expect(academyDialogueSpeechRate("can", "security-orta")).toBe(0.98);
    expect(academyDialogueSpeechRate("ece", "security-orta")).toBe(0.95);
    expect(academyDialogueSpeechRate("can", "security-ileri")).toBe(0.96);
    expect(academyDialogueSpeechRate("ece", "security-ileri")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "excel-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "excel-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "google-ads-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "google-ads-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "meta-ads-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "meta-ads-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "eticaret-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "eticaret-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "canva-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "canva-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("tarik", "linkedin-masterclass")).toBe(1);
    expect(academyDialogueSpeechRate("gozde", "linkedin-masterclass")).toBe(0.95);
    expect(academyDialogueSpeechRate("koray", "ai-agent-orta")).toBe(0.98);
    expect(academyDialogueSpeechRate("koray", "fullstack-orta")).toBe(0.98);
    expect(academyDialogueSpeechRate("koray", "fullstack-ileri")).toBe(0.96);
    expect(academyDialogueSpeechRate("maya", "fullstack-ileri")).toBe(0.95);
    expect(academyDialogueSpeechRate("maya", "ai-agent-orta")).toBe(0.95);
    expect(academyDialogueSpeechRate("koray", "ai-agent-ileri")).toBe(0.96);
    expect(academyDialogueSpeechRate("maya", "ai-agent-ileri")).toBe(0.95);
    expect(academyDialogueWordCount("bir iki üç dört")).toBe(4);
    expect(academyDialogueReadingDurationSec("bir iki üç dört", "koray")).toBeCloseTo(
      (4 * ACADEMY_DIALOGUE_MS_PER_WORD) / 1000,
      5,
    );
    expect(academyDialogueReadingDurationSec("bir iki üç dört", "maya")).toBeCloseTo(
      (4 * ACADEMY_DIALOGUE_MS_PER_WORD) / 1000 / 0.95,
      5,
    );
  });

  it("python-temel-1 DialogueTurn akışı 8 sn sahte kaset değildir", () => {
    const lesson = curriculumForCourseSlug("python-temel")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body);
    expect(timeline.turns.length).toBeGreaterThanOrEqual(8);
    expect(timeline.turns[0]?.speaker).toBe("koray");
    expect(timeline.turns.some((turn) => turn.speaker === "maya")).toBe(true);
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
    expect(timeline.turns.length).toBeGreaterThanOrEqual(8);
    expect(timeline.turns[0]?.speaker).toBe("can");
    expect(timeline.turns.some((turn) => turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("security-orta-1 Can/Ece DialogueTurn akışı Orta tempo mührünü taşır", () => {
    const lesson = curriculumForCourseSlug("security-orta")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "security-orta");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(8);
    expect(timeline.turns[0]?.speaker).toBe("can");
    expect(timeline.turns.some((turn) => turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("security-ileri-1 Can/Ece DialogueTurn akışı İleri tempo mührünü taşır", () => {
    const lesson = curriculumForCourseSlug("security-ileri")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "security-ileri");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(8);
    expect(timeline.turns[0]?.speaker).toBe("can");
    expect(timeline.turns.some((turn) => turn.speaker === "ece")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("excel-masterclass-1 Tarık/Gözde DialogueTurn akışı 8 sn sahte kaset değildir", () => {
    const lesson = curriculumForCourseSlug("excel-masterclass")[0]!;
    const timeline = buildAcademyDialogueTimeline(lesson.body, "excel-masterclass");
    expect(timeline.turns.length).toBeGreaterThanOrEqual(8);
    expect(timeline.turns[0]?.speaker).toBe("tarik");
    expect(timeline.turns.some((turn) => turn.speaker === "gozde")).toBe(true);
    expect(timeline.turns.every((turn) => turn.text.length > 0)).toBe(true);
    expect(timeline.spokenDuration).toBeGreaterThan(60);
  });

  it("WAV süresi kelime saatine oranlanır", () => {
    expect(
      academyDialogueSpokenElapsedSec({ currentTime: 10, audioDuration: 20, spokenDuration: 40 }),
    ).toBe(20);
    expect(
      academyDialogueSpokenElapsedSec({ currentTime: 5, audioDuration: 0, spokenDuration: 40 }),
    ).toBe(5);
  });

  it("mühürlü ses yolu canlı TTS tetiklemez", () => {
    expect(academyLessonAudioPublicPath("python-temel", "python-temel-1")).toBe(
      `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/python-temel/python-temel-1.wav`,
    );
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
