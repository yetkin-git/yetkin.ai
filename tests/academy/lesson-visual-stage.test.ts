import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_BAKED_MICRO_VIDEO_KEYS } from "@/lib/academy/baked-micro-videos";
import { academyCinemaActiveCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS,
  academyCinemaCueSlidePublicPathFromSlide,
  listAcademyCinemaCueSlides,
} from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyLessonVideoShouldRender,
} from "@/lib/academy/lesson-playback";
import {
  ACADEMY_VEO_SCENE_DURATION_MAX_SEC,
  ACADEMY_VEO_SCENE_DURATION_MIN_SEC,
  academyCinemaCueSlidePublicPath,
  academyCinemaCueSlideSrcOrFallback,
  academyCinemaEyeFallbackPublicPath,
  academyVisualCardHoldSec,
  academyVisualStageActiveCard,
  academyVisualStageCardsMatchCues,
  academyVisualStageCinemaKind,
  academyVisualStageIsInWindow,
  academyVisualStageMotion,
  academyVisualStageNextCard,
  hasAcademyLessonVisualStage,
  isAcademyVeoSceneDurationSec,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import {
  ACADEMY_KARAOKE_CAPTION_MAX_CHARS,
  ACADEMY_KARAOKE_CAPTION_MAX_WORDS,
  academyKaraokeCaptionsCompact,
  academyTeleprompterActiveLineIndex,
  buildAcademyTeleprompterFlow,
  loadAcademyTeleprompterFlow,
  splitAcademyKaraokeCaptionBlocks,
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
  it("mühürlü karaoke derslerde göz katmanı bağlar; amiral 6/6 mühürlüdür", () => {
    expect(hasAcademyLessonVisualStage("01_office_ai-1")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-2")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-3")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-1")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-2")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-3")).toBe(true);
    expect(loadAcademyLessonVisualStage("01_office_ai-3")?.cards).toHaveLength(5);
    expect(academyVisualStageCardsMatchCues("01_office_ai-4")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-5")).toBe(true);
    expect(academyVisualStageCardsMatchCues("01_office_ai-6")).toBe(true);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-3")).toBe(true);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-4")).toBe(true);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-5")).toBe(true);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-6")).toBe(true);
  });

  it("1. bölüm cue geçişlerine 8 sn punch + cue hold kartı bağlar; sahte arayüz yok", () => {
    const stage = loadAcademyLessonVisualStage("01_office_ai-1");
    expect(stage).not.toBeNull();
    expect(stage?.cards).toHaveLength(5);
    expect(stage?.cards[0]?.cueId).toBe("cue-01");
    expect(stage?.cards[0]?.startSec).toBe(0);
    expect(stage?.cards[0]?.durationSec).toBe(8);
    expect(stage?.cards[0]?.endSec).toBeGreaterThan(8);
    expect(academyVisualCardHoldSec(stage!.cards[0]!)).toBeGreaterThan(0);
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
    expect(stage?.cards[0]?.src).toBe("/academy/cinema/01_office_ai-1-cue-1.jpg");
    expect(stage?.cards[0]?.posterSrc).toBe("/academy/cinema/01_office_ai-1-eye.jpg");

    const lesson = curriculumForCourseSlug("01_office_ai").find((row) => row.key === "01_office_ai-1");
    expect(lesson).toBeDefined();
    expect(lesson?.videoUrl).toBeUndefined();
    expect(lesson?.diagrams).toEqual([]);
    expect(lesson?.microVideos).toEqual([]);
    expect(academyLessonVideoShouldRender(lesson?.videoUrl)).toBe(false);
    expect(stage?.posterSrc.endsWith(".jpg")).toBe(true);

    expect(academyVisualStageIsInWindow(stage!, 0)).toBe(true);
    expect(academyVisualStageIsInWindow(stage!, 7.9)).toBe(true);
    expect(academyVisualStageIsInWindow(stage!, 8)).toBe(true);
    const cue2Start = stage!.cards[1]!.startSec;
    expect(cue2Start).toBeGreaterThan(8);
    expect(academyVisualStageIsInWindow(stage!, cue2Start - 0.01)).toBe(false);
    expect(academyVisualStageIsInWindow(stage!, cue2Start)).toBe(true);
    expect(academyVisualStageActiveCard(stage!, 3)?.cueId).toBe("cue-01");
    expect(academyVisualStageActiveCard(stage!, 12)?.cueId).toBe("cue-01");
    expect(academyVisualStageActiveCard(stage!, cue2Start + 0.5)?.cueId).toBe("cue-02");
    expect(academyVisualStageNextCard(stage!, 3)?.cueId).toBe("cue-02");
    expect(academyVisualStageNextCard(stage!, cue2Start + 0.5)?.cueId).toBe(stage!.cards[2]?.cueId);
    expect(academyVisualStageMotion(stage!, 0, false)).toBe("idle");
    expect(academyVisualStageMotion(stage!, 3, true)).toBe("punch");
    expect(academyVisualStageMotion(stage!, 8, true)).toBe("hold");
    expect(academyVisualStageMotion(stage!, 8, false)).toBe("rest");
    expect(academyVisualStageMotion(stage!, 40, true)).toBe("hold");
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
    expect(eye).toContain("onError");
    expect(eye).toContain("fallbackSrc");
    expect(eye).toContain("decoding=\"async\"");
    expect(eye).toContain("data-academy-cinema-preload");
    expect(eye).toContain("academyVisualStageNextCard");
    expect(eye).not.toContain("new Image()");
    expect(media).toContain('preload={playing ? "auto" : "metadata"}');
    expect(eye).toContain("loadAcademyTeleprompterFlow");
    expect(eye).not.toContain("LessonCinemaIntroScene");
    expect(eye).not.toContain("LessonCinemaExcelScene");
    expect(eye).not.toContain("LessonCinemaMailScene");
    expect(eye).not.toContain("LessonCinemaPromptScene");
    expect(eye).not.toContain("academy-player-eye-canvas");
    expect(eye).not.toContain("data-academy-cinema-canvas");
    expect(css).toContain("academy-player-eye-layer");
    expect(css).toContain("academy-player-teleprompter");
    const karaokeOverlayAt = css.indexOf(".academy-player-karaoke .academy-teleprompter--overlay {");
    const karaokeAudioAt = css.indexOf(".academy-player-karaoke .academy-player-audio-bar {");
    expect(karaokeOverlayAt).toBeGreaterThan(0);
    expect(karaokeAudioAt).toBeGreaterThan(karaokeOverlayAt);
    const karaokeOverlay = css.slice(karaokeOverlayAt, karaokeAudioAt);
    expect(karaokeOverlay).toContain("overflow-y: auto");
    expect(karaokeOverlay).toContain("max-height: 100%");
    expect(karaokeOverlay).toContain("padding-block: 0.7rem");
    expect(karaokeOverlay).toContain("mask-image: none");
    expect(karaokeOverlay).toContain("padding: 1.45rem 1.5rem");
    expect(karaokeOverlay).toContain("line-height: 1.62");
    expect(karaokeOverlay).toContain("padding-block: 0.22em");
    expect(karaokeOverlay).not.toContain("transparent 0%, #000 18%");
    expect(css).toContain("academy-player-media-card");
    expect(css).toContain("academy-eye-kenburns");
    expect(css).toContain('[data-motion="hold"]');
    expect(css).toContain('[data-motion="rest"]');
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
    expect(timed.some((line) => line.text.includes("Ayda kırk saat"))).toBe(true);
    expect(timed.some((line) => line.text.includes("AIDA kırk"))).toBe(false);
    expect(timed.some((line) => line.text.includes("Ama senin aklından geçeni bilemez"))).toBe(true);
    expect(timed.some((line) => line.text.includes("aklindan geçeni okuyamaz"))).toBe(false);
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
    expect(eye?.cards[0]?.endSec).toBeGreaterThan(8);
    expect(eye?.cards[0]?.kind).toBe("nano");
    expect(eye?.cards[0]?.src).toBe("/academy/cinema/01_office_ai-2-cue-1.jpg");
    expect(academyVisualStageCinemaKind(eye!)).toBe("canvas");
    expect(academyVisualStageCardsMatchCues("01_office_ai-2")).toBe(true);
    expect(academyVisualStageIsInWindow(eye!, 0)).toBe(true);
    expect(academyVisualStageIsInWindow(eye!, 8)).toBe(true);
    expect(academyVisualStageActiveCard(eye!, 3)?.cueId).toBe("cue-01");
    expect(academyVisualStageMotion(eye!, 8, true)).toBe("hold");
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
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-3")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-3")).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-3");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-3"));
    expect(paragraphs.length).toBe(12);
    expect(prose).toMatch(/Ef iki/u);
    expect(prose).toMatch(/artı doksan/iu);
    expect(prose).toMatch(/Ofis üç yüz altmış beş/u);
    expect(prose).not.toMatch(/\bF2\b/u);
    expect(prose).not.toMatch(/\+90/u);
    expect(prose).not.toMatch(/Office 365/u);

    expect(hasAcademyLessonCues("01_office_ai-3")).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-3");
    const cueScript = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueScript).toMatch(/\bF2\b/u);
    expect(cueScript).toMatch(/\+90/u);
    expect(cueScript).toMatch(/Office 365/u);
    expect(cueScript).not.toMatch(/Ef iki/u);
    expect(cueScript).not.toMatch(/artı doksan/iu);
    expect(cueScript).not.toMatch(/Ofis üç yüz altmış beş/u);
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

  it("4. bölüm spoken script ve beş sahne cue 3. bölüm ritmini taşır", () => {
    expect(isAcademySpokenScriptLessonKey("01_office_ai-4")).toBe(true);
    const prose = loadAcademySpokenScriptProse("01_office_ai-4");
    const words = academySpokenScriptWordCount(prose);
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(900);
    expect(prose).not.toMatch(/```/u);
    expect(prose).toMatch(/Dünyanın en kusursuz tablosuna da sahip olsan/u);
    expect(prose).toMatch(/Kendi taslağın cebinde olmadan beşinci bölüme geçme/u);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-4")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-4")).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-4");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-4"));
    expect(paragraphs.length).toBe(12);
    expect(prose).toMatch(/Vörd/u);
    expect(prose).not.toMatch(/\bWord\b/u);

    expect(hasAcademyLessonCues("01_office_ai-4")).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-4");
    const cueScript = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueScript).toMatch(/\bWord\b/u);
    expect(cueScript).not.toMatch(/Vörd/u);
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 40,
      section: "Giriş & Köprü",
      text: "Dünyanın en kusursuz tablosuna da sahip olsan, doğru dille sunamazsan masanda rakam yığını kalır.",
    });
    expect(cues[4]).toMatchObject({
      start: 340,
      end: 420,
      section: "Kapanış & Saha Görevi",
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(420);
    expect(academyVisualStageCardsMatchCues("01_office_ai-4")).toBe(true);
  });

  it("4. bölüm ve sonrası karaoke altyazısını 3–4 satırlık bloğa sıkıştırır", () => {
    expect(academyKaraokeCaptionsCompact("01_office_ai-3")).toBe(false);
    expect(academyKaraokeCaptionsCompact("01_office_ai-4")).toBe(true);
    expect(academyKaraokeCaptionsCompact("01_office_ai-5")).toBe(true);
    expect(academyKaraokeCaptionsCompact("01_office_ai-6")).toBe(true);
    expect(academyKaraokeCaptionsCompact("03_social_media_ai-1")).toBe(true);
    expect(academyKaraokeCaptionsCompact("03_social_media_ai-6")).toBe(true);
    expect(academyKaraokeCaptionsCompact("04_chatbot_nocode-1")).toBe(true);
    expect(academyKaraokeCaptionsCompact("04_chatbot_nocode-6")).toBe(true);
    expect(academyKaraokeCaptionsCompact("05_prompt_practice-1")).toBe(true);
    expect(academyKaraokeCaptionsCompact("05_prompt_practice-6")).toBe(true);
    expect(ACADEMY_KARAOKE_CAPTION_MAX_WORDS).toBe(36);
    expect(ACADEMY_KARAOKE_CAPTION_MAX_CHARS).toBe(220);

    const long =
      "Yeni bir Word belgesi açarsın. Sayfa bembeyaz. Sol üstte imleç tık tık yanar. Yönetici der: altmış gündür ödemeyen müşteriye diplomatik ihtar. Ya da genel müdür için bir sayfalık bilgi notu. El klavyeye gider. Beyin kilitlenir. Cümleye nasıl başlarım. Sayın yetkili mi. İlgili makama mı. Altta rica mı. Arz mı. Sert yazarsan üç yıllık ilişki bozulur. Patron kızar. Yumuşak yazarsan para yine gelmez. Muhasebe seni suçlar.";
    const blocks = splitAcademyKaraokeCaptionBlocks(long);
    expect(blocks.length).toBeGreaterThan(1);
    expect(blocks.join(" ")).toBe(long);
    expect(blocks.every((block) => block.split(" ").length <= ACADEMY_KARAOKE_CAPTION_MAX_WORDS + 8)).toBe(
      true,
    );

    const draft = buildAcademyTeleprompterFlow(loadAcademyLessonCues("01_office_ai-4"));
    const live = loadAcademyTeleprompterFlow("01_office_ai-4");
    expect(live.length).toBeGreaterThan(draft.length);
    expect(live[0]?.start).toBe(0);
    expect(live.at(-1)?.end).toBeGreaterThan(360);
    expect(live.every((line, index) => index === 0 || line.start >= live[index - 1]!.end)).toBe(true);
    const oversize = live.filter((line) => {
      const packed = /[.!?…]\s+\S/u.test(line.text);
      if (!packed) {
        return false;
      }
      const words = line.text.split(/\s+/u).filter((part) => part.length > 0).length;
      return line.text.length > ACADEMY_KARAOKE_CAPTION_MAX_CHARS || words > ACADEMY_KARAOKE_CAPTION_MAX_WORDS;
    });
    expect(oversize).toEqual([]);
  });

  it("5. bölüm spoken script ve beş sahne cue 4. bölüm ritmini taşır", () => {
    expect(isAcademySpokenScriptLessonKey("01_office_ai-5")).toBe(true);
    const prose = loadAcademySpokenScriptProse("01_office_ai-5");
    const words = academySpokenScriptWordCount(prose);
    expect(words).toBeGreaterThanOrEqual(600);
    expect(words).toBeLessThanOrEqual(950);
    expect(prose).not.toMatch(/```/u);
    expect(prose).toMatch(/Dünyanın en kusursuz raporunu da yazsan/u);
    expect(prose).toMatch(/Kendi konunun slayt iskeletini görmeden altıncı bölüme geçme/u);
    expect(isAcademyLessonAudioSealed("01_office_ai", "01_office_ai-5")).toBe(true);
    expect(hasAcademyLessonVisualStage("01_office_ai-5")).toBe(true);
    const paragraphs = loadAcademySpokenScriptParagraphs("01_office_ai-5");
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs("01_office_ai-5"));
    expect(paragraphs.length).toBe(12);
    expect(prose).toMatch(/Pauer Point/u);
    expect(prose).toMatch(/Tims/u);
    expect(prose).toMatch(/Alt Ef on bir/u);
    expect(prose).not.toMatch(/\bPowerPoint\b/u);
    expect(prose).not.toMatch(/\bTeams\b/u);
    expect(prose).not.toMatch(/Alt\+F11/u);

    expect(hasAcademyLessonCues("01_office_ai-5")).toBe(true);
    const cues = loadAcademyLessonCues("01_office_ai-5");
    const cueScript = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueScript).toMatch(/\bPowerPoint\b/u);
    expect(cueScript).toMatch(/\bTeams\b/u);
    expect(cueScript).toMatch(/Alt\+F11/u);
    expect(cueScript).toMatch(/\bCopilot\b/u);
    expect(cueScript).toMatch(/\bGamma\b/u);
    expect(cueScript).not.toMatch(/Pauer Point/u);
    expect(cueScript).not.toMatch(/\bTims\b/u);
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 40,
      section: "Giriş & Köprü",
      text: "Dünyanın en kusursuz raporunu da yazsan, karar verici on sayfa okumaz.",
    });
    expect(cues[4]).toMatchObject({
      start: 340,
      end: 420,
      section: "Kapanış & Saha Görevi",
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(420);
    expect(academyVisualStageCardsMatchCues("01_office_ai-5")).toBe(true);
  });

  it.each([
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
    expect(isAcademyLessonAudioSealed("01_office_ai", lessonKey)).toBe(true);
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

  it("30 derste cue-1..cue-4 slayt yolunu eşler; Tur 3 JPG diskte, yoksa 1-eye fallback", () => {
    expect(ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS).toHaveLength(30);

    for (const lessonKey of ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS) {
      expect(hasAcademyLessonVisualStage(lessonKey)).toBe(true);
      expect(academyVisualStageCardsMatchCues(lessonKey)).toBe(true);
      const stage = loadAcademyLessonVisualStage(lessonKey);
      const playback = loadAcademyLessonPlaybackCues(lessonKey);
      expect(stage).not.toBeNull();
      expect(stage?.posterSrc).toBe(academyCinemaEyeFallbackPublicPath(lessonKey));
      expect(existsSync(join(ROOT, "public", stage!.posterSrc.slice(1)))).toBe(true);
      expect(playback.length).toBeGreaterThanOrEqual(4);
      expect(stage?.cards.map((card) => card.cueId).slice(0, 4)).toEqual([
        "cue-01",
        "cue-02",
        "cue-03",
        "cue-04",
      ]);
      expect(stage?.cards).toHaveLength(playback.length);

      for (const card of stage!.cards) {
        const cuePath = academyCinemaCueSlidePublicPath(lessonKey, card.cueId);
        const diskCue = join(ROOT, "public", cuePath.slice(1));
        expect(card.src).toBe(cuePath);
        expect(card.posterSrc).toBe(stage!.posterSrc);
        expect(card.durationSec).toBe(8);
        expect(card.endSec).toBe(playback.find((cue) => cue.id === card.cueId)?.end);
        expect(academyVisualCardHoldSec(card)).toBeGreaterThan(0);
        expect(existsSync(diskCue)).toBe(true);
        expect(
          academyCinemaCueSlideSrcOrFallback(
            lessonKey,
            card.cueId,
            stage!.posterSrc,
            existsSync(diskCue),
          ),
        ).toBe(cuePath);
      }
    }
  });

  it("Tur 3 katalog 120+ cue slayt JPG üretir ve diskte durur", () => {
    const slides = listAcademyCinemaCueSlides();
    expect(slides.length).toBeGreaterThanOrEqual(120);
    const cueCore = slides.filter((slide) => slide.cueIndex >= 1 && slide.cueIndex <= 4);
    expect(cueCore).toHaveLength(120);
    for (const slide of slides) {
      const diskCue = join(ROOT, "public", academyCinemaCueSlidePublicPathFromSlide(slide).slice(1));
      expect(existsSync(diskCue)).toBe(true);
    }
  });
});
