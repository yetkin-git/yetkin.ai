import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_BAKED_MICRO_VIDEO_KEYS } from "@/lib/academy/baked-micro-videos";
import { academyCinemaActiveCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyLessonVideoShouldRender,
} from "@/lib/academy/lesson-playback";
import {
  ACADEMY_VEO_SCENE_DURATION_MAX_SEC,
  ACADEMY_VEO_SCENE_DURATION_MIN_SEC,
  academyVisualStageActiveCard,
  academyVisualStageCardsMatchCues,
  academyVisualStageCinemaKind,
  academyVisualStageIsInWindow,
  academyVisualStageMotion,
  hasAcademyLessonVisualStage,
  isAcademyVeoSceneDurationSec,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import {
  academyTeleprompterActiveLineIndex,
  buildAcademyTeleprompterFlow,
  loadAcademyTeleprompterFlow,
} from "@/lib/academy/lesson-teleprompter-flow";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  academySpokenScriptWordCount,
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";
import { ACADEMY_TTS_PARAGRAPH_PAUSE_SEC } from "@/lib/academy/media-release-seal";
import { collapseAcademyLessonProse } from "@/lib/academy/lesson-body";

const ROOT = process.cwd();
const POSTER = join(ROOT, "public/academy/cinema/01_office_ai-1-eye.jpg");

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("01_office_ai göz katmanı ve 2. bölüm cue taslağı", () => {
  it("mühürlü karaoke derslerde göz katmanı bağlar; kuyruk dersinde karaoke basılmaz", () => {
    expect(hasAcademyLessonVisualStage("01_office_ai-1")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-2")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-1")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-2")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-3")).toBe(true);
    expect(loadAcademyLessonVisualStage("01_office_ai-3")?.cards).toHaveLength(5);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-3")).toBe(false);
  });

  it("1. bölüm cue geçişlerine 8 sn medya kartı bağlar; sahte arayüz yok", () => {
    const stage = loadAcademyLessonVisualStage("01_office_ai-1");
    expect(stage).not.toBeNull();
    expect(stage?.cards).toHaveLength(5);
    expect(stage?.cards[0]?.cueId).toBe("cue-01");
    expect(stage?.cards[0]?.startSec).toBe(0);
    expect(stage?.cards[0]?.durationSec).toBe(8);
    expect(stage?.cards[0]?.kind).toBe("nano");
    expect(isAcademyVeoSceneDurationSec(stage!.cards[0]!.durationSec)).toBe(true);
    expect(stage!.cards[0]!.durationSec).toBeGreaterThanOrEqual(ACADEMY_VEO_SCENE_DURATION_MIN_SEC);
    expect(stage!.cards[0]!.durationSec).toBeLessThanOrEqual(ACADEMY_VEO_SCENE_DURATION_MAX_SEC);
    expect(academyVisualStageCinemaKind(stage!)).toBe("canvas");
    expect(academyVisualStageCardsMatchCues("01_office_ai-1")).toBe(true);
    expect(ACADEMY_BAKED_MICRO_VIDEO_KEYS).not.toContain("office-ai-time-thieves");

    expect(existsSync(POSTER)).toBe(true);
    expect(readFileSync(POSTER).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    expect(stage?.posterSrc).toBe("/academy/cinema/01_office_ai-1-eye.jpg");

    const lesson = curriculumForCourseSlug("01_office_ai").find((row) => row.key === "01_office_ai-1");
    expect(lesson).toBeDefined();
    expect(lesson?.videoUrl).toBeUndefined();
    expect(lesson?.diagrams).toEqual([]);
    expect(lesson?.microVideos).toEqual([]);
    expect(academyLessonVideoShouldRender(lesson?.videoUrl)).toBe(false);
    expect(stage?.posterSrc.endsWith(".jpg")).toBe(true);

    expect(academyVisualStageIsInWindow(stage!, 0)).toBe(true);
    expect(academyVisualStageIsInWindow(stage!, 7.9)).toBe(true);
    expect(academyVisualStageIsInWindow(stage!, 8)).toBe(false);
    const cue2Start = stage!.cards[1]!.startSec;
    expect(cue2Start).toBeGreaterThan(8);
    expect(academyVisualStageIsInWindow(stage!, cue2Start - 0.01)).toBe(false);
    expect(academyVisualStageIsInWindow(stage!, cue2Start)).toBe(true);
    expect(academyVisualStageActiveCard(stage!, 3)?.cueId).toBe("cue-01");
    expect(academyVisualStageActiveCard(stage!, 12)).toBeNull();
    expect(academyVisualStageActiveCard(stage!, cue2Start + 0.5)?.cueId).toBe("cue-02");
    expect(academyVisualStageMotion(stage!, 0, false)).toBe("idle");
    expect(academyVisualStageMotion(stage!, 3, true)).toBe("punch");
    expect(academyVisualStageMotion(stage!, 8, true)).toBe("rest");
    expect(academyVisualStageMotion(stage!, 40, true)).toBe("rest");
    expect(academyVisualStageMotion(stage!, cue2Start, true)).toBe("punch");

    const player = readSrc("components/academy/curriculum-player.tsx");
    const media = readSrc("components/academy/lesson-media-player.tsx");
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const css = readSrc("app/globals.css");
    expect(player).toContain("academyCitizenPlayerLayer");
    expect(player).toContain("<LessonTeleprompter");
    expect(player).toContain("LessonCinemaEyeLayer");
    expect(player).toContain("loadAcademyLessonVisualStage");
    expect(player).toContain("captions={false}");
    expect(player).toContain("academy-player-widescreen");
    expect(player).toContain("overlay");
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(media).not.toContain("LessonCinemaEyeLayer");
    expect(media).not.toContain("loadAcademyLessonVisualStage");
    expect(media).toContain('data-academy-clock="currentTime"');
    expect(player).not.toContain("from-black/90");
    expect(player).not.toContain("academy-cinema-cue-rail");
    expect(eye).toContain("data-academy-teleprompter-stage");
    expect(eye).toContain("data-academy-eye-layer");
    expect(eye).toContain("scrollIntoView");
    expect(eye).toContain("LessonCinemaMediaCard");
    expect(eye).toContain("loadAcademyTeleprompterFlow");
    expect(eye).not.toContain("LessonCinemaIntroScene");
    expect(eye).not.toContain("LessonCinemaExcelScene");
    expect(eye).not.toContain("LessonCinemaMailScene");
    expect(eye).not.toContain("LessonCinemaPromptScene");
    expect(eye).not.toContain("academy-player-eye-canvas");
    expect(eye).not.toContain("data-academy-cinema-canvas");
    expect(css).toContain("academy-player-eye-layer");
    expect(css).toContain("academy-player-teleprompter");
    expect(css).toContain("academy-player-media-card");
    expect(css).toContain("academy-eye-kenburns");
    expect(css).toContain("academy-eye-scene-in");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("rgba(212, 175, 122");
    expect(css).toContain("academy-player-visual-scrim");
    expect(css).not.toContain("academy-player-eye-excel");
    expect(css).not.toContain("academy-player-eye-outlook");
    expect(player).not.toContain("generateVideo");
    expect(player).not.toContain("veo-3.0");
    expect(readSrc("lib/kernel/ai/types.ts")).toContain("generateVideo?: never");
  });

  it("teleprompter akışı currentTime ile cümle vurgular; cue paragrafları markdown ile kilitli", () => {
    const cues = loadAcademyLessonCues("01_office_ai-1");
    expect(cues[0]?.paragraphs?.length).toBeGreaterThanOrEqual(3);
    const flow = buildAcademyTeleprompterFlow(cues);
    expect(flow).toHaveLength(19);
    expect(flow[0]?.start).toBe(0);
    expect(flow[0]?.text.startsWith("Merhaba.")).toBe(true);
    expect(flow.at(-1)?.end).toBe(450);
    expect(academyTeleprompterActiveLineIndex(flow, 0)).toBe(0);
    expect(academyTeleprompterActiveLineIndex(flow, 44.9)?.toString()).toMatch(/^\d+$/u);
    const at45 = academyTeleprompterActiveLineIndex(flow, 45);
    expect(at45).not.toBeNull();
    expect(flow[at45!]?.cueId).toBe("cue-02");

    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-1");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-1"));
    expect(paragraphs.length).toBe(19);
    const fromCues = collapseAcademyLessonProse(cues.flatMap((cue) => cue.paragraphs ?? []).join(" "));
    const fromMd = collapseAcademyLessonProse(
      readSrc("lib/academy/spoken-scripts/01_office_ai-1.md")
        .replace(/<!--[\s\S]*?-->/gu, " ")
        .replace(/\s+/gu, " ")
        .trim(),
    );
    expect(fromCues).toBe(fromMd);
    expect(ACADEMY_TTS_PARAGRAPH_PAUSE_SEC).toBeGreaterThanOrEqual(0.3);
    expect(ACADEMY_TTS_PARAGRAPH_PAUSE_SEC).toBeLessThanOrEqual(0.5);

    const timed = loadAcademyTeleprompterFlow("01_office_ai-1");
    expect(timed.length).toBeGreaterThanOrEqual(19);
    expect(timed[0]?.start).toBe(0);
    expect(timed.at(-1)?.end).toBeGreaterThan(400);
    expect(timed.every((line, index) => index === 0 || line.start >= timed[index - 1]!.end)).toBe(true);
  });

  it("2. bölüm spoken script ve beş sahne cue taslağı 1. bölüm ritmini taşır", () => {
    expect(isAcademySpokenScriptLessonKey("01_office_ai-2")).toBe(true);
    const prose = loadAcademySpokenScriptProse("01_office_ai-2");
    const words = academySpokenScriptWordCount(prose);
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(900);
    expect(prose).not.toMatch(/```/u);
    expect(prose).toMatch(/Excel'de formül ezberleme baskısı/u);
    expect(prose).toMatch(/Kendi hücrende çalışan formülü/u);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-2")).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-2");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-2"));
    expect(paragraphs.length).toBe(12);

    expect(hasAcademyLessonCues("01_office_ai-2")).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-2");
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 40,
      section: "Giriş & Köprü",
      text: "Excel'de formül ezberleme baskısı bugünden itibaren masadan kalkıyor.",
    });
    expect(cues[4]).toMatchObject({
      start: 340,
      end: 420,
      section: "Kapanış & Saha Görevi",
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(420);

    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: 420,
        spokenDuration: 420,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;

    expect(at(0)).toBe("cue-01");
    expect(at(39.9)).toBe("cue-01");
    expect(at(40)).toBe("cue-02");
    expect(at(110)).toBe("cue-03");
    expect(at(230)).toBe("cue-04");
    expect(at(340)).toBe("cue-05");
    expect(at(419.9)).toBe("cue-05");

    const section = readFileSync(join(ROOT, "lib/academy/curricula/office_ai/section_2.ts"), "utf8");
    expect(section).not.toContain("cue-01");
    expect(readSrc("lib/academy/curriculum.ts")).not.toContain("lesson-visual-stage");

    const eye = loadAcademyLessonVisualStage("01_office_ai-2");
    expect(eye).not.toBeNull();
    expect(eye?.posterSrc).toBe("/academy/cinema/01_office_ai-1-eye.jpg");
    expect(eye?.cards).toHaveLength(5);
    expect(eye?.cards[0]?.cueId).toBe("cue-01");
    expect(eye?.cards[0]?.startSec).toBe(0);
    expect(eye?.cards[0]?.durationSec).toBe(8);
    expect(eye?.cards[0]?.kind).toBe("nano");
    expect(academyVisualStageCinemaKind(eye!)).toBe("canvas");
    expect(academyVisualStageCardsMatchCues("01_office_ai-2")).toBe(true);
    expect(academyVisualStageIsInWindow(eye!, 0)).toBe(true);
    expect(academyVisualStageIsInWindow(eye!, 8)).toBe(false);
    expect(academyVisualStageActiveCard(eye!, 3)?.cueId).toBe("cue-01");
  });

  it("3. bölüm spoken script ve beş sahne cue 2. bölüm ritmini taşır", () => {
    expect(isAcademySpokenScriptLessonKey("01_office_ai-3")).toBe(true);
    const prose = loadAcademySpokenScriptProse("01_office_ai-3");
    const words = academySpokenScriptWordCount(prose);
    expect(words).toBeGreaterThanOrEqual(700);
    expect(words).toBeLessThanOrEqual(900);
    expect(prose).not.toMatch(/```/u);
    expect(prose).toMatch(/hücredeki veri çöpse sonuç da çöptür/u);
    expect(prose).toMatch(/Kendi verini pırıl pırıl görmeden dördüncü bölüme geçme/u);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-3")).toBe(false);
    expect(hasAcademyLessonVisualStage("01_office_ai-3")).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-3");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-3"));
    expect(paragraphs.length).toBe(12);

    expect(hasAcademyLessonCues("01_office_ai-3")).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-3");
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 40,
      section: "Giriş & Köprü",
      text: "Dünyanın en kusursuz formülünü de yazsan, hücredeki veri çöpse sonuç da çöptür.",
    });
    expect(cues[4]).toMatchObject({
      start: 340,
      end: 420,
      section: "Kapanış & Saha Görevi",
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(420);

    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: 420,
        spokenDuration: 420,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;

    expect(at(0)).toBe("cue-01");
    expect(at(39.9)).toBe("cue-01");
    expect(at(40)).toBe("cue-02");
    expect(at(110)).toBe("cue-03");
    expect(at(230)).toBe("cue-04");
    expect(at(340)).toBe("cue-05");
    expect(at(419.9)).toBe("cue-05");

    const section = readFileSync(join(ROOT, "lib/academy/curricula/office_ai/section_3.ts"), "utf8");
    expect(section).not.toContain("cue-01");
  });

  it.each([
    ["01_office_ai-4", "Dünyanın en kusursuz tablosuna da sahip olsan", "Kendi taslağın cebinde olmadan beşinci bölüme geçme"],
    ["01_office_ai-5", "Dünyanın en kusursuz raporunu da yazsan", "Kendi konunun slayt iskeletini görmeden altıncı bölüme geçme"],
    ["01_office_ai-6", "Bugün ofisin son kalesi konuşacak", "Sınava girmeden önce kendi gelen kutunu üç kovaya ayır"],
  ] as const)("%s spoken script ve beş sahne cue 3. bölüm ritmini taşır", (lessonKey, hook, close) => {
    expect(isAcademySpokenScriptLessonKey(lessonKey)).toBe(true);
    const prose = loadAcademySpokenScriptProse(lessonKey);
    const words = academySpokenScriptWordCount(prose);
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(950);
    expect(prose).not.toMatch(/```/u);
    expect(prose).toMatch(new RegExp(hook.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
    expect(prose).toMatch(new RegExp(close.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
    expect(isAcademyLessonAudioSealed("01_office_ai", lessonKey)).toBe(false);
    expect(hasAcademyLessonVisualStage(lessonKey)).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs(lessonKey);
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs(lessonKey));
    expect(paragraphs.length).toBe(12);

    expect(hasAcademyLessonCues(lessonKey)).toBe(true);
    const cues = loadAcademyLessonCues(lessonKey);
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]?.start).toBe(0);
    expect(cues[0]?.end).toBe(40);
    expect(cues[4]).toMatchObject({
      start: 340,
      end: 420,
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(420);

    const eye = loadAcademyLessonVisualStage(lessonKey);
    expect(eye?.posterSrc).toBe("/academy/cinema/01_office_ai-1-eye.jpg");
    expect(eye?.cards).toHaveLength(5);
    expect(academyVisualStageCardsMatchCues(lessonKey)).toBe(true);
  });
});
