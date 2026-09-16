import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_BAKED_MICRO_VIDEO_KEYS } from "@/lib/academy/baked-micro-videos";
import {
  ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS,
  listAcademyCinemaCueSlides,
} from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues, loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import {
  ACADEMY_VEO_SCENE_DURATION_MAX_SEC,
  ACADEMY_VEO_SCENE_DURATION_MIN_SEC,
  academyCinemaEyeFallbackPublicPath,
  academyVisualCardHoldSec,
  academyVisualStageActiveCard,
  academyVisualStageCardsMatchCues,
  academyVisualStageIsInWindow,
  academyVisualStageMotion,
  academyVisualStageNextCard,
  hasAcademyLessonVisualStage,
  isAcademyVeoSceneDurationSec,
  loadAcademyLessonVisualStage,
  type AcademyLessonVisualCard,
} from "@/lib/academy/lesson-visual-stage";
import {
  ACADEMY_KARAOKE_CAPTION_MAX_CHARS,
  ACADEMY_KARAOKE_CAPTION_MAX_WORDS,
  academyKaraokeCaptionsCompact,
  splitAcademyKaraokeCaptionBlocks,
} from "@/lib/academy/lesson-teleprompter-flow";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const POSTER = join(ROOT, "public/academy/cinema/01_office_ai-1-eye.jpg");

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SYNTHETIC_CARDS: readonly AcademyLessonVisualCard[] = [
  {
    cueId: "cue-01",
    kind: "nano",
    startSec: 0,
    durationSec: 8,
    endSec: 45,
    src: "/academy/cinema/01_office_ai-1-cue-1.jpg",
    posterSrc: "/academy/cinema/01_office_ai-1-eye.jpg",
  },
  {
    cueId: "cue-02",
    kind: "nano",
    startSec: 45,
    durationSec: 8,
    endSec: 90,
    src: "/academy/cinema/01_office_ai-1-cue-2.jpg",
    posterSrc: "/academy/cinema/01_office_ai-1-eye.jpg",
  },
];

describe("akademi göz katmanı — 01_office_ai-1 Excel punchcard", () => {
  it("1. ders cue ve göz katmanını basar; vitrin 1-eye kapağı durur", () => {
    expect(hasAcademyLessonCues("01_office_ai-1")).toBe(true);
    expect(loadAcademyLessonPlaybackCues("01_office_ai-1")).toHaveLength(8);
    expect(hasAcademyLessonVisualStage("01_office_ai-1")).toBe(true);
    expect(loadAcademyLessonVisualStage("01_office_ai-1")?.cards).toHaveLength(8);
    expect(loadAcademyLessonVisualStage("01_office_ai-1")?.cards[0]?.kind).toBe("veo");
    expect(isAcademySpokenScriptLessonKey("01_office_ai-1")).toBe(true);
    expect(existsSync(POSTER)).toBe(true);
    expect(academyCinemaEyeFallbackPublicPath("01_office_ai-1")).toBe(
      "/media/01_office_ai_01_frame_01.png",
    );

    expect(curriculumForCourseSlug("01_office_ai")).toHaveLength(9);
    expect(ACADEMY_BAKED_MICRO_VIDEO_KEYS).toContain("01_office_ai-1-warmup");
    expect(ACADEMY_BAKED_MICRO_VIDEO_KEYS).not.toContain("office-ai-time-thieves");
  });

  it("33 ders anahtarı durur; Excel slayt 1. 2. 5. 6. ve k1, pptx slayt 3., outlook slayt 4., gmail g1, word w1 açılır", () => {
    expect(ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS).toHaveLength(33);
    expect(listAcademyCinemaCueSlides()).toHaveLength(72);
    expect(
      listAcademyCinemaCueSlides().every(
        (slide) =>
          slide.lessonKey === "01_office_ai-1" ||
          slide.lessonKey === "01_office_ai-2" ||
          slide.lessonKey === "01_office_ai-3" ||
          slide.lessonKey === "01_office_ai-4" ||
          slide.lessonKey === "01_office_ai-5" ||
          slide.lessonKey === "01_office_ai-6" ||
          slide.lessonKey === "01_office_ai-g1" ||
          slide.lessonKey === "01_office_ai-w1" ||
          slide.lessonKey === "01_office_ai-k1",
      ),
    ).toBe(true);
    for (const lessonKey of ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS) {
      if (
        lessonKey === "01_office_ai-1" ||
        lessonKey === "01_office_ai-2" ||
        lessonKey === "01_office_ai-3" ||
        lessonKey === "01_office_ai-4" ||
        lessonKey === "01_office_ai-5" ||
        lessonKey === "01_office_ai-6" ||
        lessonKey === "01_office_ai-g1" ||
        lessonKey === "01_office_ai-w1" ||
        lessonKey === "01_office_ai-k1"
      ) {
        expect(hasAcademyLessonVisualStage(lessonKey)).toBe(true);
      } else {
        expect(hasAcademyLessonVisualStage(lessonKey)).toBe(false);
      }
      expect(academyVisualStageCardsMatchCues(lessonKey)).toBe(true);
      const poster = academyCinemaEyeFallbackPublicPath(lessonKey);
      expect(existsSync(join(ROOT, "public", poster.slice(1))), poster).toBe(true);
    }
  });

  it("sentetik kartta 8 sn punch + hold hareketi durur", () => {
    const stage = { lessonKey: "synthetic", posterSrc: SYNTHETIC_CARDS[0]!.posterSrc, cards: SYNTHETIC_CARDS };
    expect(isAcademyVeoSceneDurationSec(8)).toBe(true);
    expect(ACADEMY_VEO_SCENE_DURATION_MIN_SEC).toBe(8);
    expect(ACADEMY_VEO_SCENE_DURATION_MAX_SEC).toBe(8);
    expect(academyVisualCardHoldSec(SYNTHETIC_CARDS[0]!)).toBe(37);
    expect(academyVisualStageIsInWindow(stage, 0)).toBe(true);
    expect(academyVisualStageIsInWindow(stage, 44.9)).toBe(true);
    expect(academyVisualStageIsInWindow(stage, 45)).toBe(true);
    expect(academyVisualStageActiveCard(stage, 3)?.cueId).toBe("cue-01");
    expect(academyVisualStageActiveCard(stage, 45.5)?.cueId).toBe("cue-02");
    expect(academyVisualStageNextCard(stage, 3)?.cueId).toBe("cue-02");
    expect(academyVisualStageMotion(stage, 0, false)).toBe("idle");
    expect(academyVisualStageMotion(stage, 3, true)).toBe("punch");
    expect(academyVisualStageMotion(stage, 8, true)).toBe("hold");
    expect(academyVisualStageMotion(stage, 8, false)).toBe("rest");
  });

  it("5. bölüm ve sonrası karaoke altyazısını 3–4 satırlık bloğa sıkıştırır", () => {
    expect(academyKaraokeCaptionsCompact("01_office_ai-3")).toBe(false);
    expect(academyKaraokeCaptionsCompact("01_office_ai-4")).toBe(false);
    expect(academyKaraokeCaptionsCompact("01_office_ai-5")).toBe(true);
    expect(academyKaraokeCaptionsCompact("03_social_media_ai-1")).toBe(true);
    expect(academyKaraokeCaptionsCompact("04_chatbot_nocode-1")).toBe(true);
    expect(academyKaraokeCaptionsCompact("05_prompt_practice-1")).toBe(true);
    expect(ACADEMY_KARAOKE_CAPTION_MAX_WORDS).toBe(36);
    expect(ACADEMY_KARAOKE_CAPTION_MAX_CHARS).toBe(220);
    const long =
      "Yeni bir Word belgesi açarsın. Sayfa bembeyaz. Sol üstte imleç tık tık yanar. Yönetici der: altmış gündür ödemeyen müşteriye diplomatik ihtar. Ya da genel müdür için bir sayfalık bilgi notu. El klavyeye gider. Beyin kilitlenir. Cümleye nasıl başlarım. Sayın yetkili mi. İlgili makama mı. Altta rica mı. Arz mı. Sert yazarsan üç yıllık ilişki bozulur. Patron kızar. Yumuşak yazarsan para yine gelmez. Muhasebe seni suçlar.";
    const blocks = splitAcademyKaraokeCaptionBlocks(long);
    expect(blocks.length).toBeGreaterThan(1);
    expect(blocks.join(" ")).toBe(long);
  });

  it("oynatıcı kabuğu göz katmanı ve punchcard sahne sözleşmesini taşır", () => {
    const player = readSrc("components/academy/curriculum-player.tsx");
    const media = readSrc("components/academy/lesson-media-player.tsx");
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const css = readSrc("app/globals.css");
    expect(player).toContain("academyCitizenPlayerLayer");
    expect(player).not.toContain("<LessonTeleprompter");
    expect(player).toContain('data-academy-directing="punchcard"');
    expect(player).toContain("LessonCinemaEyeLayer");
    expect(player).toContain("LessonKaraokeStrip");
    expect(player).toContain("karaoke.cues");
    expect(player).toContain("loadAcademyLessonVisualStage");
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(media).not.toContain("LessonCinemaEyeLayer");
    expect(media).toContain('data-academy-clock="currentTime"');
    expect(eye).toContain("data-academy-teleprompter-stage");
    expect(eye).toContain("data-academy-eye-layer");
    expect(eye).toContain("data-academy-punchcard");
    expect(eye).toContain("data-academy-punchcard-dock");
    expect(eye).toContain('data-academy-canvas="full"');
    expect(eye).toContain('data-academy-waiter-ratio={String(ACADEMY_GOLDEN_WAITER_RATIO)}');
    expect(eye).toContain('data-academy-compare="split"');
    expect(eye).toContain("academyCompareDockPrompt");
    expect(eye).toContain("data-academy-eye-canvas");
    expect(eye).toContain("academy-player-widescreen-frame");
    expect(eye).toContain("academy-player-eye-stack");
    expect(eye).toContain("data-academy-prompt-dock");
    expect(eye).toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-clock-cue");
    expect(css).toContain("academy-player-compare");
    expect(css).toContain("academy-player-compare-prompt");
    expect(eye).toContain("LessonExcelWorkspace");
    expect(eye).toContain("LessonPptxWorkspace");
    expect(eye).toContain("LessonOutlookWorkspace");
    expect(eye).toContain("LessonGmailWorkspace");
    expect(eye).toContain("LessonWordWorkspace");
    expect(eye).toContain("academyExcelFocusZoomActive");
    expect(eye).toContain("currentTime={currentTime}");
    expect(eye).toContain("pane=\"after\" currentTime={currentTime}");
    expect(eye).toContain("LessonCinemaMediaCard");
    expect(eye).toContain("data-academy-intro");
    expect(eye).toContain("data-academy-outro");
    expect(eye).toContain('data-academy-veo={card?.kind === "veo" && !veoPunchLive ? "warmup" : undefined}');
    expect(css).toContain("academy-player-eye-layer");
    expect(css).toContain("academy-player-eye-stack");
    expect(css).toContain("academy-player-eye-canvas");
    expect(css).toContain("academy-player-widescreen-frame");
    expect(css).toContain("container-name: academy-eye");
    expect(css).toContain("academy-player-intro--outro");
    expect(css).toContain("academy-player-outro-summary");
    expect(css).toContain("academy-excel-mouse-layer");
    expect(css).toContain("academy-player-punchcard");
    expect(css).toContain("academy-player-punchcard-dock");
    expect(css).toContain("academy-player-waiter");
    expect(css).toContain("academy-excel-cell--a1");
    expect(css).toContain("academy-player-teleprompter");
    expect(css).toContain("academy-player-karaoke-strip");
    expect(css).toContain("academy-player-karaoke-word");
    expect(css).toContain("academy-eye-kenburns");
    expect(css).toMatch(/\.academy-player-media-card\s*\{[^}]*inset:\s*0/s);
    expect(css).toMatch(/\.academy-player-punchcard-dock\s*\{[^}]*right:\s*0\.7rem/s);
    expect(css).toMatch(/\.academy-player-waiter\s*\{[^}]*inset:\s*3\.15rem 0\.7rem 3\.55rem/s);
    expect(css).toContain("academy-office-win-fit");
    expect(css).toContain("height: max-content");
    expect(css).toContain(".academy-player-waiter.academy-player-compare");
    expect(player).not.toContain("generateVideo");
    expect(readSrc("lib/kernel/ai/types.ts")).toContain("generateVideo?: never");
  });
});
