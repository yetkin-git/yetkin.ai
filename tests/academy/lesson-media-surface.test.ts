import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  ACADEMY_MEDIA_PUBLIC_ROOT,
  ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC,
  ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC,
  academyDiagramPublicPath,
  academyMicroVideoPublicSources,
  composeAcademyLessonBlocks,
  isAcademyMicroVideoDurationSec,
} from "@/lib/academy/lesson-media";
import {
  ACADEMY_SEALED_DIAGRAM_KEYS,
  academySealedDiagramByKey,
  renderSealedDiagramSvgByKey,
} from "@/archived/lib/academy-studio/sealed-diagrams";
import { ACADEMY_BAKED_MICRO_VIDEO_KEYS } from "@/lib/academy/baked-micro-videos";
import { ACADEMY_LESSON_LISTEN_MAX_CHARS } from "@/archived/lib/academy-studio/lesson-listen";
import { academyLessonHasPractice } from "@/lib/academy/lesson-body";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("akademi mikro-video ve şema mimarisi", () => {
  it("compact amiral derste mühürlü şema/mikro-video yuvası yoktur", () => {
    const seenDiagrams = new Set<string>();
    let lessonCount = 0;
    for (const row of ACADEMY_COURSE_SEEDS) {
      const lessons = curriculumForCourseSlug(row.slug);
      expect(lessons.length).toBeGreaterThan(0);
      for (const lesson of lessons) {
        lessonCount += 1;
        expect(lesson.diagrams, lesson.key).toEqual([]);
        expect(lesson.microVideos, lesson.key).toEqual([]);
        expect(LESSON_PRACTICE[lesson.key], lesson.key).toBeUndefined();
        expect(academyLessonHasPractice(lesson.body), lesson.key).toBe(false);
        const blocks = composeAcademyLessonBlocks(lesson);
        expect(blocks.some((block) => block.kind === "text")).toBe(true);
        expect(blocks.some((block) => block.kind === "micro-video")).toBe(false);
        expect(blocks.some((block) => block.kind === "diagram")).toBe(false);
      }
    }
    expect(ACADEMY_COURSE_SEEDS.map((row) => row.slug)).toEqual(["01_office_ai", "02_ecommerce_ai", "03_social_media_ai", "04_chatbot_nocode", "05_prompt_practice"]);
    expect(lessonCount).toBe(ACADEMY_COURSE_SEEDS.length * 6);
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    expect(ACADEMY_SEALED_DIAGRAM_KEYS.length).toBeGreaterThanOrEqual(1);
    void seenDiagrams;
  });

  it("statik /media/academy path bağlar; sayfa API video üretmez", () => {
    const first = ACADEMY_SEALED_DIAGRAM_KEYS[0]!;
    expect(academyDiagramPublicPath(first)).toBe(`${ACADEMY_MEDIA_PUBLIC_ROOT}/diagrams/${first}.svg`);
    const sources = academyMicroVideoPublicSources(first);
    expect(sources.webm.endsWith(".webm")).toBe(true);
    expect(sources.mp4.endsWith(".mp4")).toBe(true);
    expect(sources.hls.endsWith(".m3u8")).toBe(true);
    expect(sources.poster.endsWith(".poster.svg")).toBe(true);
    expect(sources.webm.startsWith(ACADEMY_MEDIA_PUBLIC_ROOT)).toBe(true);

    for (const key of ACADEMY_SEALED_DIAGRAM_KEYS) {
      const diagram = join(ROOT, "public", "media", "academy", "diagrams", `${key}.svg`);
      const poster = join(ROOT, "public", "media", "academy", "micro", `${key}.poster.svg`);
      const loop = join(ROOT, "public", "media", "academy", "micro", `${key}.loop.svg`);
      expect(existsSync(diagram), diagram).toBe(true);
      expect(existsSync(poster), poster).toBe(true);
      expect(existsSync(loop), loop).toBe(true);
      const svg = renderSealedDiagramSvgByKey(key, { animate: false });
      expect(svg, key).toContain("<svg");
      const normalize = (s: string) => s.replace(/\r\n/g, "\n").trim();
      expect(normalize(readSrc(`public/media/academy/diagrams/${key}.svg`))).toBe(normalize(svg));
      expect(normalize(readSrc(`public/media/academy/micro/${key}.poster.svg`))).toBe(normalize(svg));
    }

    const player = readSrc("components/academy/curriculum-player.tsx");
    expect(player).not.toContain("MicroVideoCard");
    expect(player).not.toContain("DiagramCard");
    expect(player).not.toContain("LessonParamBox");
    expect(player).not.toContain("LessonStepsCard");
    expect(player).not.toContain("LessonCodeLab");
    expect(player).not.toContain("academy-lesson-figure");
    expect(player).not.toContain("academyDiagramPublicPath");
    expect(player).not.toContain("autoPlay");
    expect(player).not.toContain("durationSec={micro?.durationSec ?? 8}");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("onTimeUpdate");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("current !== next");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain(
      "Math.abs(audio.currentTime - clockRef.current.lastAudioTime) < 0.04",
    );
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain('type="audio/wav"');
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("academyLessonAudioPlaybackSrc");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("key={audioSrc}");
    expect(readSrc("next.config.ts")).toContain("audio/wav");
    expect(readSrc("next.config.ts")).toContain("/media/academy/audio/:path*");
    expect(readSrc("proxy.ts")).toContain("favicon.ico|media/");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("academyPlayerClockDurationSec");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("data-academy-audio-preparing");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain('data-academy-clock="currentTime"');
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("buildAcademyDialogueTimeline");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("academy-player-audio-bar");
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("academy-dialogue-stage");
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("academy-dialogue-text");
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("<video");
    expect(readSrc("components/academy/lesson-visual-stage.tsx")).toContain("data-academy-teleprompter-stage");
    expect(player).not.toContain("scrollIntoView");
    expect(player).not.toContain("academy-listen-focus");
    expect(player).not.toContain("generateVideo");
    expect(player).not.toContain("generateVideos");
    expect(player).not.toContain("/api/academy/video");
    expect(player).not.toContain("invokeLlm");
    expect(readSrc("lib/academy/curriculum.ts")).not.toContain("generateVideo");
    expect(readSrc("lib/academy/lesson-media.ts")).not.toContain("fetch(");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).not.toContain("generateVideo");
    expect(Array.isArray(ACADEMY_BAKED_MICRO_VIDEO_KEYS)).toBe(true);
    expect(ACADEMY_SEN.visual.diagramEyebrow).toBe("Teknik şema");
    expect(ACADEMY_SEN.visual.videoEyebrow).toBe("Mikro-video");
    expect(ACADEMY_SEN.visual.paramsEyebrow).toBe("Parametre");
    expect(ACADEMY_SEN.visual.stepsEyebrow).toBe("Teknik adım");
    expect(ACADEMY_SEN.visual.codeEyebrow).toBe("Örnek kayıt");
    expect(ACADEMY_SEN.visual.videoMeta(6)).toBe("6 sn · sessiz döngü");
    expect(ACADEMY_SEN.player.notesLabel).toBe("Ders Notları / Transkript");
    expect(ACADEMY_SEN.player.codeViewerLabel).toBe("Kod");
    expect(ACADEMY_SEN.player.codeCalloutTitle).toBe("💡 KOD BİLMEYENLER İÇİN NOT");
    expect(ACADEMY_SEN.player.codeCalloutHref).toBe("/academy/05_prompt_practice");
    expect(ACADEMY_SEN.player.codeCalloutModule).toBe("Pratik Prompt Mühendisliği");
    expect(ACADEMY_SEN.player.codeCalloutHref).not.toContain("python-temel");
    expect(ACADEMY_SEN.player.codeCalloutLead).toContain("JSON");
    expect(readSrc("app/globals.css")).toContain("academy-player-code-callout");
    expect(readSrc("app/globals.css")).toMatch(
      /\.academy-player-code-callout\s*\{[^}]*var\(--surface-muted\)/s,
    );
    expect(ACADEMY_SEN.player.audioPreparing).toBe("Ders Ses Medyası Hazırlanıyor");
    expect(readSrc("app/globals.css")).toContain("academy-listen-focus");
    expect(readSrc("app/globals.css")).toContain("academy-listen-cockpit");
    expect(readSrc("app/globals.css")).toContain("academy-dialogue-player");
    expect(readSrc("app/globals.css")).toContain("academy-player-widescreen");
    expect(readSrc("app/globals.css")).toContain("aspect-ratio: 16 / 9");
    expect(player).toContain("academy-player-widescreen");
    expect(player).toContain("academy-cinema-stage");
    expect(player).not.toContain("max-height: 14rem");
  }, 20_000);
});
