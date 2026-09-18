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
import {
  ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH,
  academyVisualCinematicFrameSrc,
  academyVisualStageBackdropTheme,
} from "@/lib/academy/excel-workspace";

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
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
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
    expect(player).toContain("karaokeCues={karaoke.cues}");
    expect(player).toContain('data-academy-player-stack="visual-karaoke-transport"');
    expect(player).toContain('data-academy-directing="punchcard"');
    expect(eye).toContain("academy-player-widescreen");
    expect(eye).toContain("<LessonKaraokeStrip");
    expect(player).toContain("LessonCinemaEyeLayer");
    expect(player).toContain("LessonPromptConsole");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-captions-toggle");
    expect(eye).toContain("data-academy-karaoke-overlay");
    expect(eye).toContain("academy-player-karaoke-overlay");
    const css = readSrc("app/globals.css");
    expect(css).toMatch(
      /\.academy-player-karaoke-overlay\s*\{[^}]*overflow:\s*visible/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-overlay\s*\{[^}]*padding:\s*0\.9rem 0\.85rem 0\.7rem/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*overflow:\s*visible/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*line-height:\s*1\.5/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*font-size:\s*1rem/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*overflow:\s*visible/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\[data-state="active"\]\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).not.toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*max-height:\s*3em/s,
    );
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
    expect(tabs).toContain("LessonSelfCheck");
    expect(tabs).toContain('"self-check"');
    expect(tabs).toContain("data-academy-study-panel=\"self-check\"");

    expect(existsSync(join(ROOT, "components/academy/course-audio-preview.tsx"))).toBe(false);
  });

  it("Ders 4 PowerPoint slayt tuvali 16:9 contain kilitler; dikey ezilmez", () => {
    const pptx = readSrc("components/academy/lesson-pptx-workspace.tsx");
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const css = readSrc("app/globals.css");
    expect(eye).toContain("LessonPptxWorkspace");
    expect(pptx).toContain("academy-pptx-canvas aspect-video");
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*object-fit:\s*contain/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*height:\s*auto/s);
    expect(css).toMatch(/(?:^|\n)\.academy-pptx-win\s*\{[^}]*height:\s*auto/s);
    expect(css).toMatch(/\.academy-pptx-canvas-wrap\s*\{[^}]*align-items:\s*center/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*min-height:\s*4\.35rem/s);
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi-grid\s*\{[^}]*align-items:\s*center/s,
    );
  });

  it("Ders 4/6 Excel tahsilat karesini sızdırmaz; CEBİNE KOY ve SIFIR KUTU kartı kutu içinde kalır", () => {
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const css = readSrc("app/globals.css");
    const excel = readSrc("lib/academy/excel-workspace.ts");
    const slide = readSrc("components/academy/lesson-slide-workspace.tsx");
    const outlook = readSrc("components/academy/lesson-outlook-workspace.tsx");

    expect(academyVisualCinematicFrameSrc("01_office_ai-1")).toBe(ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH);
    expect(academyVisualCinematicFrameSrc("01_office_ai-2")).toBe(ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH);
    expect(academyVisualCinematicFrameSrc("01_office_ai-3")).toBeNull();
    expect(academyVisualCinematicFrameSrc("01_office_ai-4")).toBeNull();
    expect(academyVisualStageBackdropTheme("01_office_ai-3")).toBe("pptx");
    expect(academyVisualStageBackdropTheme("01_office_ai-4")).toBe("outlook");
    expect(excel).toContain("academyVisualStageBackdropTheme");
    expect(eye).toContain("data-academy-stage-theme={stageTheme}");
    expect(eye).toContain("academy-player-eye-backdrop--desk");
    expect(eye).toContain("excelBackdrop");
    expect(css).toContain('[data-academy-stage-theme="pptx"]');
    expect(css).toContain('[data-academy-stage-theme="outlook"]');
    expect(css).toContain("academy-player-eye-backdrop--desk");
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*padding:\s*clamp\(/s);
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*word-break:\s*break-word/s);
    expect(css).toMatch(/\.academy-outlook-group\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.academy-outlook-group\s*\{[^}]*padding:\s*clamp\(/s);
    expect(css).toMatch(/\.academy-outlook-group\s*\{[^}]*min-height:\s*3\.6rem/s);
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(outlook).toContain("ACADEMY_OUTLOOK_DUMP_MAILS.map");
    expect(outlook).toContain("academy-outlook-list-head");
    expect(css).toMatch(/\.academy-excel-checklist\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.academy-excel-checklist\s*\{[^}]*padding:\s*clamp\(/s);
    expect(slide).toContain("overflow-hidden");
    expect(outlook).toContain("overflow-hidden");
  });

  it("Ders 7 Gmail tuvali sahneyi doldurur; Gemini kenar çubuğu siyah boş kutu değildir", () => {
    const gmail = readSrc("components/academy/lesson-gmail-workspace.tsx");
    const css = readSrc("app/globals.css");
    const ssot = readSrc("lib/academy/gmail-workspace.ts");

    expect(academyVisualStageBackdropTheme("01_office_ai-g1")).toBe("gmail");
    expect(academyVisualCinematicFrameSrc("01_office_ai-g1")).toBeNull();
    expect(gmail).toContain("academy-outlook-body--gmail");
    expect(gmail).toContain("academy-outlook-canvas--compact");
    expect(gmail).toContain("academy-outlook-body--carry");
    expect(gmail).toContain("ACADEMY_GMAIL_INBOX_HEAD");
    expect(gmail).toContain("ACADEMY_GMAIL_ACTION_HEAD");
    expect(gmail).toContain("gmailTagClass");
    expect(gmail).toContain('host="gmail"');
    expect(gmail).toContain("pane === \"live\" || pane === \"after\"");
    expect(ssot).toContain("Gelen Kutusu · son 24 saat");
    expect(ssot).toContain("Aksiyon listesi · kutu yerinde");
    expect(css).toContain(".academy-gmail-copilot");
    expect(css).toContain(".academy-gmail-desk .academy-outlook-body--gmail");
    expect(css).toMatch(
      /\.academy-gmail-desk\.academy-outlook-desk--live \.academy-outlook-body--carry[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/s,
    );
    expect(css).toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas--compact[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/s,
    );
    expect(css).toMatch(/\.academy-gmail-copilot\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(/\.academy-gmail-copilot\s*\{[^}]*background:\s*#152536/s);
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-gmail-copilot\s*\{[^}]*height:\s*auto/s,
    );
    expect(css).toMatch(
      /\.academy-player-waiter:not\(\.academy-player-compare\) \.academy-gmail-desk \.academy-outlook-row[\s\S]*?min-height:\s*3\.1rem/s,
    );
    expect(css).not.toMatch(
      /\.academy-player-waiter \.academy-outlook-win,\s*\.academy-player-waiter \.academy-pptx-win\s*\{[^}]*height:\s*auto/s,
    );
  });

  it("Paket 8: oynatıcı dikey nefes + oynatma listesi 9 ders tavanı", () => {
    const oyna = readSrc("app/academy/[slug]/oyna/page.tsx");
    const player = readSrc("components/academy/curriculum-player.tsx");
    const css = readSrc("app/globals.css");
    const skeleton = readSrc("components/academy/academy-room-skeleton.tsx");

    expect(oyna).toContain("px-4 py-0 sm:px-6");
    expect(oyna).not.toContain("pt-3 pb-8");
    expect(skeleton).toContain("px-4 py-4 sm:px-6");
    expect(skeleton).not.toContain("pt-3 pb-8");

    expect(css).toContain("--academy-player-ceiling-breath: 1.5rem");
    expect(css).toContain("--academy-player-study-gap: 0.5rem");
    expect(css).toMatch(
      /\.academy-player-shell\[data-academy-player-layout="document"\]\s*\{[^}]*padding-top:\s*var\(--academy-player-ceiling-breath\)/s,
    );
    expect(css).toMatch(
      /\.academy-player-shell\[data-academy-player-layout="document"\]\s*\{[^}]*padding-bottom:\s*1rem/s,
    );
    expect(css).toMatch(
      /\.academy-player-shell\[data-academy-player-layout="document"\] \.academy-player-main\s*\{[^}]*gap:\s*var\(--academy-player-study-gap\)/s,
    );
    expect(css).toMatch(
      /\.academy-player-shell\[data-academy-player-layout="document"\] \.academy-player-study\s*\{[^}]*margin-top:\s*0/s,
    );
    expect(css).toContain("margin-top: calc(1rem - var(--academy-player-ceiling-breath))");
    expect(player).toContain("gap-[var(--academy-player-study-gap,0.5rem)]");
    expect(css).toContain("--academy-playlist-max-h: calc(100dvh - 5.5rem)");
    expect(css).toContain("--academy-playlist-item-pad-y: clamp(0.4rem, 1vh, 0.75rem)");
    expect(css).toContain("--academy-playlist-item-gap: clamp(0.4rem, 1vh, 0.75rem)");
    expect(css).toMatch(
      /\.academy-player-shell\[data-academy-player-layout="document"\] \.academy-playlist\s*\{[^}]*max-height:\s*var\(--academy-playlist-max-h\)/s,
    );
    expect(css).toMatch(
      /\.academy-player-rail-item\s*\{[^}]*padding-block:\s*var\(--academy-playlist-item-pad-y/s,
    );

    expect(player).toContain("academy-playlist");
    expect(player).toContain("academy-player-playlist-list");
    expect(player).toContain("lg:gap-[var(--academy-playlist-item-gap)]");
    expect(player).toContain("lg:max-h-[var(--academy-playlist-max-h)]");
    expect(player).toContain("lg:min-h-[var(--academy-stage-max-h)]");
    expect(player).not.toContain("lg:max-h-[var(--academy-stage-max-h)]");
    expect(player).not.toContain("lg:space-y-2");
    expect(player).not.toContain("px-3.5 py-2.5");
  });
});
