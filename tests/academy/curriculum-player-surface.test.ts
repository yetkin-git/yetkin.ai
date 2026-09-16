import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PILOT_SKU_SLUG,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D2.1 müfredat oynatıcı yüzeyi — makale varsayılan + mühürlü karaoke", () => {
  it("mutlu yol vitrin → kasa → müfredat durur; dinle/TTS kapıları 410", () => {
    expect(ACADEMY_HAPPY_PATH).toEqual([
      "catalog",
      "price-lock",
      "settle",
      "curriculum",
      "exam",
      "certificate",
    ]);
    expect(existsSync(join(ROOT, "app/academy/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/academy/[slug]/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/academy/[slug]/oyna/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "app/api/academy/courses/[id]/curriculum/route.ts"))).toBe(true);

    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    expect(oyna).toContain("CurriculumPlayer");
    expect(oyna).toContain("loadAcademyCurriculum");
    expect(oyna).toContain("cinema");
    expect(oyna).not.toContain("LessonListenButton");
    expect(oyna).not.toContain("academy-player-viewport-lock");
    expect(oyna).not.toContain("-mt-8");
    expect(oyna).not.toContain("max-w-none");

    const frame = readSrc("components/ui/page-header.tsx");
    expect(frame).toContain("cinema?: boolean");
    expect(frame).toContain("widthOverride");
    expect(frame).toContain('cinema && "max-w-none"');
    expect(frame).toContain('!widthOverride && "max-w-6xl"');

    expect(readSrc("lib/academy/lesson-listen.ts")).toContain("ACADEMY_LESSON_LISTEN_ENABLED = false");
    expect(readSrc("app/api/academy/courses/[id]/listen/route.ts")).toContain("410");
    expect(readSrc("app/api/academy/generateSpeech/route.ts")).toContain("410");
  });

  it("mühür yokken karaoke katmanı basılmaz", () => {
    let karaokeCount = 0;
    let articleCount = 0;
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      const lessons = curriculumForCourseSlug(slug);
      if (slug === "01_office_ai") {
        expect(lessons).toHaveLength(9);
      } else {
        expect(lessons).toEqual([]);
      }
      const layer = academyCitizenPlayerLayer(slug, `${slug}-1`);
      if (layer.kind === "article+karaoke") {
        karaokeCount += 1;
        expect(slug).toBe("01_office_ai");
      } else {
        articleCount += 1;
        expect(layer.kind).toBe("article");
        expect(isAcademyLessonAudioSealed(slug, `${slug}-1`)).toBe(false);
      }
    }
    expect(karaokeCount).toBe(1);
    expect(articleCount).toBe(0);
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1").kind).toBe("article");
    expect(ACADEMY_PILOT_SKU_SLUG).toBeNull();
  });

  it("CurriculumPlayer makale kabuğuna sekmeleri bağlar; karaoke currentTime ile mühürlü derse kilitlenir", () => {
    const player = readSrc("components/academy/curriculum-player.tsx");
    expect(player).toContain("export function CurriculumPlayer");
    expect(player).toMatch(/from\s+"@\/components\/academy\/lesson-study-tabs"/);
    expect(player).toMatch(/from\s+"@\/lib\/academy\/citizen-player-layer"/);
    expect(player).toContain("<LessonStudyTabs");
    expect(player).toContain("lg:items-start");
    expect(player).toContain("lg:self-start");
    expect(player).toContain("line-clamp-2");
    expect(player).toContain("academyCitizenPlayerLayer");
    expect(player).toContain("copy.modeArticle");
    expect(player).not.toContain("data-academy-article-notice");
    expect(player).not.toContain("copy.articleNotice");
    expect(player).not.toContain("Bu ders okuma metnidir");
    expect(player).not.toContain("Ses kaseti yoktur");
    expect(player).toContain("data-academy-lesson-delivery");
    expect(player).toContain("data-academy-hybrid=\"media-then-study\"");
    expect(player).toContain('kind === "article+karaoke"');
    expect(player).toContain("<LessonMediaPlayer");
    expect(player).not.toContain("<LessonTeleprompter");
    expect(player).toContain("<LessonKaraokeStrip");
    expect(player).toContain("karaoke.cues");
    expect(player).toContain('data-academy-player-stack="visual-karaoke-transport"');
    expect(player).toContain('data-academy-directing="punchcard"');
    expect(player).toContain("academy-player-widescreen");
    expect(player).toContain("LessonCinemaEyeLayer");
    expect(player).toContain("loadAcademyLessonVisualStage");
    expect(player).toContain("onSpokenElapsedChange={setMediaElapsed}");
    expect(player).toContain("currentTime={mediaElapsed}");
    expect(player).toContain("completeLesson");
    expect(player).toContain("autoAdvanceNextLesson");
    expect(player).toContain("academyPlayerAutoAdvanceTargetKey");
    expect(player).toContain("playbackStartedKeyRef");
    expect(player).not.toContain("autoAdvanceNextLesson(nextKey)");
    expect(player).toContain("nextAcademyPlayerLesson(lessonsRef.current, lessonKey)");
    expect(player).toContain("{ advance: shouldAdvance }");
    expect(player).toContain("hasAcademyLessonPlaybackReachedEnd");
    expect(player).toContain("endedLessonKeyRef");
    expect(player).toContain("selectLesson");
    expect(player).toContain("idempotency.rotate");
    expect(player).toContain("activeClockDurationSec");
    expect(player).toContain("data-academy-autoplay-toggle");
    expect(player).toContain("readAcademyLessonAutoAdvanceFromStorage");
    expect(player).toContain("writeAcademyLessonAutoAdvanceToStorage");
    expect(player).toContain("shouldAutoAdvanceAfterListenEnded");
    expect(player).toContain("copy.autoAdvance");
    expect(player).toContain("autoStart={autoStartPlayback}");
    expect(player).not.toContain("autoPlay");
    expect(player).toContain("role=\"switch\"");
    expect(player).toContain("academy-player-autoplay");
    expect(readSrc("app/globals.css")).toContain("academy-player-autoplay-track");
    expect(readSrc("lib/academy/lesson-advance.ts")).toContain("academy_autoplay_enabled");
    expect(ACADEMY_SEN.player.autoAdvance).toBe("Otomatik Geçiş");
    expect(player).toContain("isAcademyPlayerExamReady");
    expect(player).toContain("academyExamStartGateHref");
    expect(player).toContain("examLaunchCta");
    expect(player).toContain("data-academy-exam-launch");
    expect(player).toContain('variant="success"');
    expect(player).not.toContain("buildAcademyDialogueTimeline");
    expect(player).not.toContain("ACADEMY_DIALOGUE_MS_PER_WORD");
    expect(player).not.toContain("CourseAudioPreview");
    expect(player).not.toContain("LessonDialogueTranscript");
    expect(player).not.toContain("LessonListenButton");
    expect(player).not.toContain("generateSpeech");
    expect(player).not.toContain("python-");

    const media = readSrc("components/academy/lesson-media-player.tsx");
    expect(media).not.toContain("buildAcademyDialogueTimeline");
    expect(media).toContain('data-academy-clock="currentTime"');
    expect(media).toContain("audio.currentTime");
    expect(media).toContain("onSpokenElapsedChangeRef.current?.(elapsed)");
    expect(media).toContain('addEventListener("timeupdate"');
    expect(media).toContain("pushSpokenClock");
    expect(media).toContain("autoStart");
    expect(media).toContain("autoStartTriedRef");
    expect(media).toContain("playSealedAudio");
    expect(media).toContain("onCanPlay");
    expect(media).toContain("hasAcademyLessonPlaybackReachedEnd");
    expect(media).toContain("armOutroEndTimeout");
    expect(media).toContain("notifyEnded");
    expect(media).toContain("onEndedRef.current?.(lessonKeyRef.current)");
    expect(media).not.toContain("autoPlay");

    const tabs = readSrc("components/academy/lesson-study-tabs.tsx");
    expect(tabs).toContain("export function LessonStudyTabs");
    expect(tabs).toContain("AcademyMarkdownRenderer");
    expect(tabs).toContain("data-academy-study-tabs");
    expect(tabs).toContain("academy-player-study");
    expect(tabs).toContain("overflow-y-auto");
    expect(tabs).toContain("min-h-[18rem]");
    const karaokeAt = player.indexOf("academy-player-karaoke");
    const studyAt = player.indexOf("<LessonStudyTabs");
    expect(karaokeAt).toBeGreaterThan(0);
    expect(studyAt).toBeGreaterThan(karaokeAt);
    expect(tabs).toContain("academyExamStartGateHref");
    expect(tabs).toContain("examLaunchCta");

    expect(existsSync(join(ROOT, "components/academy/course-audio-preview.tsx"))).toBe(false);
  });
});
