import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { academyCinemaActiveCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  ACADEMY_SEALED_AUDIO_DURATION_SEC,
  academyLessonAudioPublicPath,
  academySealedAudioDurationSec,
} from "@/lib/academy/lesson-audio";
import {
  ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
  resolveAcademyLessonPlayerAudioSrc,
} from "@/lib/academy/lesson-playback";
import {
  ACADEMY_MEDIA_SEALED_AUDIO,
  academyMediaSealedWavCount,
  isAcademyCompactLessonKey,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import { academyLessonAudioDiskPath, academyMediaReleaseJobForLesson } from "@/lib/academy/media-release-seal";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import {
  academySpokenScriptWordCount,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";

const ROOT = process.cwd();
const LESSON_KEY = "01_office_ai-1";
const COURSE_SLUG = "01_office_ai";

describe("01_office_ai-1 mühürlü ses pilotu", () => {
  it("yalnız 1. ve 2. bölüm Callirrhoe yuvasına mühürlenir; compact okuma durur", () => {
    expect(ACADEMY_MEDIA_SEALED_AUDIO).toEqual({
      "01_office_ai": ["01_office_ai-1", "01_office_ai-2"],
    });
    expect(academyMediaSealedWavCount()).toBe(2);
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, LESSON_KEY)).toBe(true);
    expect(isAcademyLessonAudioSealed(COURSE_SLUG, "01_office_ai-2")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-1")).toBe(false);
    expect(isAcademyCompactLessonKey(LESSON_KEY)).toBe(true);
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings).not.toBeNull();
    expect(academySealedAudioDurationSec(COURSE_SLUG, LESSON_KEY)).toBe(Math.round(timings!.durationSec));
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC[LESSON_KEY]).toBeGreaterThanOrEqual(420);
    expect(ACADEMY_SEALED_AUDIO_DURATION_SEC["01_office_ai-2"]).toBeGreaterThanOrEqual(360);
  });

  it("stüdyo konuşma metni 7–9 dk bandındadır ve bake turu Callirrhoe basar", () => {
    const prose = loadAcademySpokenScriptProse(LESSON_KEY);
    const words = academySpokenScriptWordCount(prose);
    expect(prose.length).toBeGreaterThan(800);
    expect(words).toBeGreaterThanOrEqual(850);
    expect(words).toBeLessThanOrEqual(1400);
    expect(prose).toMatch(/Her gün mesai saatlerinin en az iki saatinin/u);
    expect(prose).not.toMatch(/```/u);

    const lesson = CURRICULUM_DRAFTS_BY_SLUG[COURSE_SLUG]?.find((row) => row.key === LESSON_KEY);
    expect(lesson).toBeDefined();
    const job = academyMediaReleaseJobForLesson(COURSE_SLUG, lesson!, "gemini-3.1-flash-tts-preview");
    expect(job.turns.length).toBeGreaterThan(1);
    expect(job.turns.every((turn) => turn.spokenText.length < prose.length)).toBe(true);
    expect(job.turns[0]?.voice).toBe("Callirrhoe");
    expect(job.turns[0]?.canonicalCharacterName).toBe("Gözde");
    expect(job.publicPath).toBe(academyLessonAudioPublicPath(COURSE_SLUG, LESSON_KEY));
  });

  it("1. bölüm oynatıcı mühürlü WAV yolunu seçer; 3–6. ofis dersleri demo podcast’te kalır", () => {
    const sealed = resolveAcademyLessonPlayerAudioSrc(
      COURSE_SLUG,
      LESSON_KEY,
      ACADEMY_DEMO_AUDIO_PUBLIC_PATH,
    );
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings).not.toBeNull();
    expect(sealed).toBe(`/media/academy/audio/01_office_ai/01_office_ai-1.wav?v=${timings!.cacheV}`);
    expect(sealed).not.toContain("office-ai-podcast");
    const lesson2 = loadAcademySealedAudioTimings("01_office_ai-2");
    expect(lesson2).not.toBeNull();
    expect(
      resolveAcademyLessonPlayerAudioSrc(COURSE_SLUG, "01_office_ai-2", ACADEMY_DEMO_AUDIO_PUBLIC_PATH),
    ).toBe(`/media/academy/audio/01_office_ai/01_office_ai-2.wav?v=${lesson2!.cacheV}`);
    expect(
      resolveAcademyLessonPlayerAudioSrc(COURSE_SLUG, "01_office_ai-3", ACADEMY_DEMO_AUDIO_PUBLIC_PATH),
    ).toBe(ACADEMY_DEMO_AUDIO_PUBLIC_PATH);
    expect(
      resolveAcademyLessonPlayerAudioSrc("02_ecommerce_ai", "02_ecommerce_ai-1", undefined),
    ).toBeUndefined();

    const player = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    expect(player).toContain("academyLessonAudioPlaybackSrc");
    expect(player).toContain('data-academy-clock="currentTime"');
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(player).not.toContain("academy-cinema-cue-rail");
    expect(player).not.toContain("from-black/90");

    const layer = readFileSync(join(ROOT, "lib/academy/citizen-player-layer.ts"), "utf8");
    expect(layer).toContain("isAcademyLessonAudioSealed");
    expect(layer).toContain("loadAcademyTeleprompterFlow");

    const bake = readFileSync(join(ROOT, "scripts/generate-academy-lesson-audio.ts"), "utf8");
    expect(bake).toContain("--seal");
    expect(bake).toContain("ACADEMY_TTS_PARAGRAPH_PAUSE_SEC");
    expect(bake).toContain("splitAcademyTtsBreathChunks");
    expect(bake).not.toContain("SENTENCE_CHUNK_BUDGET_SEC");
    expect(bake).not.toContain("academy-audio bake KAPALI");
  });

  it("beş sahne cue’su WAV saniyesiyle birebir kilitlenir", () => {
    const cues = loadAcademyLessonCues(LESSON_KEY);
    const spokenDuration = academyLessonCueSpokenDuration(cues);
    expect(spokenDuration).toBe(450);
    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: 450,
        spokenDuration,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;

    expect(at(0)).toBe("cue-01");
    expect(at(44.9)).toBe("cue-01");
    expect(at(45)).toBe("cue-02");
    expect(at(134.9)).toBe("cue-02");
    expect(at(135)).toBe("cue-03");
    expect(at(269.9)).toBe("cue-03");
    expect(at(270)).toBe("cue-04");
    expect(at(374.9)).toBe("cue-04");
    expect(at(375)).toBe("cue-05");
    expect(at(449.9)).toBe("cue-05");
    expect(at(450)).toBe("cue-05");
  });

  it("vatandaş TTS kapısı 410 durur; bake yalnız operatör script’idir", () => {
    const speech = readFileSync(join(ROOT, "app/api/academy/generateSpeech/route.ts"), "utf8");
    const listen = readFileSync(join(ROOT, "app/api/academy/courses/[id]/listen/route.ts"), "utf8");
    expect(speech).toContain("410");
    expect(listen).toContain("410");
  });

  it("diskteki mühürlü WAV Callirrhoe kasetidir ve cue duvar saatine oturur", () => {
    const diskPath = academyLessonAudioDiskPath(COURSE_SLUG, LESSON_KEY, ROOT);
    expect(existsSync(diskPath)).toBe(true);
    const wav = readFileSync(diskPath);
    expect(wav.subarray(0, 4).toString()).toBe("RIFF");
    const duration = pcmWavDurationSec(wav);
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings).not.toBeNull();
    expect(duration).toBeGreaterThan(420);
    expect(duration).toBeLessThan(900);
    expect(Math.abs(duration - timings!.durationSec)).toBeLessThan(0.75);
    expect(timings!.pieces.length).toBeGreaterThan(50);
    expect(timings!.pauseSec).toBe(0.4);
    expect(timings!.pieces.every((piece) => piece.text.trim().length > 0)).toBe(true);
    for (let index = 1; index < timings!.pieces.length; index += 1) {
      const gap = timings!.pieces[index]!.start - timings!.pieces[index - 1]!.end;
      expect(gap).toBeCloseTo(timings!.pauseSec, 2);
    }

    const playback = loadAcademyLessonPlaybackCues(LESSON_KEY);
    expect(playback).toHaveLength(5);
    expect(playback[0]?.start).toBe(0);
    expect(playback[0]?.end).toBe(timings!.pieces.filter((piece) => piece.cueId === "cue-01").at(-1)?.end);
    expect(playback[1]?.start).toBe(timings!.pieces.find((piece) => piece.cueId === "cue-02")?.start);

    const flow = loadAcademyTeleprompterFlow(LESSON_KEY);
    expect(flow).toHaveLength(timings!.pieces.length);
    expect(flow[0]?.text).toBe(timings!.pieces[0]?.text);
    const cue2Line = flow.find((line) => line.cueId === "cue-02");
    expect(cue2Line?.start).toBe(playback[1]?.start);
    expect(cue2Line?.text.startsWith("Soyut tanımları bir kenara bırakalım")).toBe(true);
  });
});

describe("01_office_ai-2 mühürlü ses", () => {
  const LESSON_TWO = "01_office_ai-2";

  it("stüdyo konuşma metni 7–9 dk bandındadır ve bake turu Callirrhoe basar", () => {
    const prose = loadAcademySpokenScriptProse(LESSON_TWO);
    const words = academySpokenScriptWordCount(prose);
    expect(prose.length).toBeGreaterThan(800);
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(900);
    expect(prose).toMatch(/Excel'de formül ezberleme baskısı/u);
    expect(prose).not.toMatch(/```/u);

    const lesson = CURRICULUM_DRAFTS_BY_SLUG[COURSE_SLUG]?.find((row) => row.key === LESSON_TWO);
    expect(lesson).toBeDefined();
    const job = academyMediaReleaseJobForLesson(COURSE_SLUG, lesson!, "gemini-2.5-flash-preview-tts");
    expect(job.turns.length).toBe(12);
    expect(job.turns.every((turn) => turn.spokenText.length < prose.length)).toBe(true);
    expect(job.turns[0]?.voice).toBe("Callirrhoe");
    expect(job.turns[0]?.canonicalCharacterName).toBe("Gözde");
    expect(job.publicPath).toBe(academyLessonAudioPublicPath(COURSE_SLUG, LESSON_TWO));
  });

  it("beş sahne cue’su WAV saniyesiyle birebir kilitlenir", () => {
    const cues = loadAcademyLessonPlaybackCues(LESSON_TWO);
    const timings = loadAcademySealedAudioTimings(LESSON_TWO);
    expect(timings).not.toBeNull();
    const spokenDuration = academyLessonCueSpokenDuration(cues);
    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: timings!.durationSec,
        spokenDuration,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;

    expect(cues).toHaveLength(5);
    expect(at(0)).toBe("cue-01");
    expect(at(Math.max(0, (cues[0]?.end ?? 1) - 0.1))).toBe("cue-01");
    expect(at(cues[1]!.start)).toBe("cue-02");
    expect(at(cues[2]!.start)).toBe("cue-03");
    expect(at(cues[3]!.start)).toBe("cue-04");
    expect(at(cues[4]!.start)).toBe("cue-05");
    expect(at(spokenDuration)).toBe("cue-05");
  });

  it("diskteki mühürlü WAV Callirrhoe kasetidir ve cue duvar saatine oturur", () => {
    const diskPath = academyLessonAudioDiskPath(COURSE_SLUG, LESSON_TWO, ROOT);
    expect(existsSync(diskPath)).toBe(true);
    const wav = readFileSync(diskPath);
    expect(wav.subarray(0, 4).toString()).toBe("RIFF");
    const duration = pcmWavDurationSec(wav);
    const timings = loadAcademySealedAudioTimings(LESSON_TWO);
    expect(timings).not.toBeNull();
    expect(duration).toBeGreaterThan(360);
    expect(duration).toBeLessThan(900);
    expect(Math.abs(duration - timings!.durationSec)).toBeLessThan(0.75);
    expect(timings!.pieces.length).toBe(80);
    expect(timings!.pauseSec).toBe(0.4);
    expect(timings!.pieces.every((piece) => piece.text.trim().length > 0)).toBe(true);
    for (let index = 1; index < timings!.pieces.length; index += 1) {
      const gap = timings!.pieces[index]!.start - timings!.pieces[index - 1]!.end;
      expect(gap).toBeCloseTo(timings!.pauseSec, 2);
    }

    const playback = loadAcademyLessonPlaybackCues(LESSON_TWO);
    expect(playback).toHaveLength(5);
    expect(playback[0]?.start).toBe(0);
    expect(playback[0]?.end).toBe(timings!.pieces.filter((piece) => piece.cueId === "cue-01").at(-1)?.end);
    expect(playback[1]?.start).toBe(timings!.pieces.find((piece) => piece.cueId === "cue-02")?.start);

    const flow = loadAcademyTeleprompterFlow(LESSON_TWO);
    expect(flow).toHaveLength(timings!.pieces.length);
    expect(flow[0]?.text).toBe(timings!.pieces[0]?.text);
    const cue2Line = flow.find((line) => line.cueId === "cue-02");
    expect(cue2Line?.start).toBe(playback[1]?.start);
    expect(cue2Line?.text.startsWith("Yöneticin İzmir şubesinin")).toBe(true);
  });
});
