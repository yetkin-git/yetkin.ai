import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import {
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_PILOT_SKU_SLUG,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";

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

  it("beş SKU × 6 ders karaoke katmanıdır; mühürsüz article kalmaz", () => {
    let karaokeCount = 0;
    let articleCount = 0;
    for (const slug of ACADEMY_GROWTH_SKU_SLUGS) {
      const lessons = curriculumForCourseSlug(slug);
      expect(lessons).toHaveLength(6);
      for (const lesson of lessons) {
        const layer = academyCitizenPlayerLayer(slug, lesson.key);
        if (layer.kind === "article+karaoke") {
          karaokeCount += 1;
          expect([
            "01_office_ai-1",
            "01_office_ai-2",
            "01_office_ai-3",
            "01_office_ai-4",
            "01_office_ai-5",
            "01_office_ai-6",
            "02_ecommerce_ai-1",
            "02_ecommerce_ai-2",
            "02_ecommerce_ai-3",
            "02_ecommerce_ai-4",
            "02_ecommerce_ai-5",
            "02_ecommerce_ai-6",
            "03_social_media_ai-1",
            "03_social_media_ai-2",
            "03_social_media_ai-3",
            "03_social_media_ai-4",
            "03_social_media_ai-5",
            "03_social_media_ai-6",
            "04_chatbot_nocode-1",
            "04_chatbot_nocode-2",
            "04_chatbot_nocode-3",
            "04_chatbot_nocode-4",
            "04_chatbot_nocode-5",
            "04_chatbot_nocode-6",
            "05_prompt_practice-1",
            "05_prompt_practice-2",
            "05_prompt_practice-3",
            "05_prompt_practice-4",
            "05_prompt_practice-5",
            "05_prompt_practice-6",
          ]).toContain(lesson.key);
          expect(isAcademyLessonAudioSealed(slug, lesson.key)).toBe(true);
          expect(layer.audioSrc).toContain(`/media/academy/audio/${slug}/${lesson.key}.mp3`);
          expect(layer.cues.length).toBeGreaterThan(0);
          expect(layer.cues).toEqual(loadAcademyTeleprompterFlow(lesson.key));
          expect(layer.durationSec).toBeGreaterThan(330);
        } else {
          articleCount += 1;
          expect(layer.kind).toBe("article");
          expect(isAcademyLessonAudioSealed(slug, lesson.key)).toBe(false);
        }
      }
    }
    expect(karaokeCount).toBe(30);
    expect(articleCount).toBe(0);
    expect(academyCitizenPlayerLayer("01_office_ai", "01_office_ai-6").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-2").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-3").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-4").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-5").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-6").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("03_social_media_ai", "03_social_media_ai-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("04_chatbot_nocode", "04_chatbot_nocode-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("05_prompt_practice", "05_prompt_practice-1").kind).toBe("article+karaoke");
    expect(academyCitizenPlayerLayer("05_prompt_practice", "05_prompt_practice-6").kind).toBe("article+karaoke");
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
    expect(player).toContain("data-academy-hybrid=\"media-then-study\"");
    expect(player).toContain('kind === "article+karaoke"');
    expect(player).toContain("<LessonMediaPlayer");
    expect(player).toContain("<LessonTeleprompter");
    expect(player).toContain("overlay");
    expect(player).toContain("academy-player-widescreen");
    expect(player).toContain("LessonCinemaEyeLayer");
    expect(player).toContain("loadAcademyLessonVisualStage");
    expect(player).toContain("onSpokenElapsedChange={setMediaElapsed}");
    expect(player).toContain("elapsedSec={mediaElapsed}");
    expect(player).toContain("completeLesson");
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
