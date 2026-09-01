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
  it("her yayında derste mühürlü şema + 5–8 sn mikro-video yuvası vardır", () => {
    const seenDiagrams = new Set<string>();
    let lessonCount = 0;
    for (const row of ACADEMY_COURSE_SEEDS) {
      const lessons = curriculumForCourseSlug(row.slug);
      expect(lessons.length).toBeGreaterThan(0);
      for (const lesson of lessons) {
        lessonCount += 1;
        expect(lesson.diagrams, lesson.key).toHaveLength(1);
        expect(lesson.microVideos, lesson.key).toHaveLength(1);
        const diagram = lesson.diagrams[0]!;
        const video = lesson.microVideos[0]!;
        expect(academySealedDiagramByKey(diagram.diagramKey), diagram.diagramKey).not.toBeNull();
        expect(video.assetKey).toBe(diagram.diagramKey);
        expect(isAcademyMicroVideoDurationSec(video.durationSec)).toBe(true);
        expect(video.durationSec).toBeGreaterThanOrEqual(ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC);
        expect(video.durationSec).toBeLessThanOrEqual(ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC);
        seenDiagrams.add(diagram.diagramKey);
        const blocks = composeAcademyLessonBlocks(lesson);
        expect(blocks.some((block) => block.kind === "text")).toBe(true);
        expect(blocks.some((block) => block.kind === "micro-video")).toBe(true);
        expect(blocks.some((block) => block.kind === "diagram")).toBe(true);
        expect(blocks.some((block) => block.kind === "params"), lesson.key).toBe(true);
        expect(blocks.some((block) => block.kind === "steps"), lesson.key).toBe(true);
        expect(blocks.some((block) => block.kind === "code"), lesson.key).toBe(true);
        expect(academyLessonHasPractice(lesson.body), lesson.key).toBe(true);
        expect(LESSON_PRACTICE[lesson.key], lesson.key).toBeTruthy();
        expect(lesson.body.length, lesson.key).toBeLessThanOrEqual(ACADEMY_LESSON_LISTEN_MAX_CHARS);
        const firstVisual = blocks.find(
          (block) => block.kind === "micro-video" || block.kind === "diagram",
        );
        expect(firstVisual?.kind).toBe("micro-video");
        const kinds = blocks.map((block) => block.kind);
        expect(kinds.slice(0, 4), lesson.key).toEqual(["text", "micro-video", "text", "diagram"]);
        expect(kinds.at(-1), lesson.key).toBe("exercise");
        expect(blocks.some((block) => block.kind === "exercise"), lesson.key).toBe(true);
      }
    }
    expect(lessonCount).toBe(132);
    expect(seenDiagrams.size).toBeGreaterThanOrEqual(6);
    expect(ACADEMY_SEALED_DIAGRAM_KEYS.length).toBeGreaterThanOrEqual(6);
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
      expect(readSrc(`public/media/academy/diagrams/${key}.svg`)).toBe(svg);
      expect(readSrc(`public/media/academy/micro/${key}.poster.svg`)).toBe(svg);
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
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("<audio");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("data-academy-audio-preparing");
    expect(readSrc("components/academy/lesson-media-player.tsx")).toContain("copy.audioPreparing");
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("<video");
    expect(readSrc("components/academy/lesson-media-player.tsx")).not.toContain("data-academy-cinema-canvas");
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
    expect(ACADEMY_SEN.player.audioPreparing).toBe("Ders Ses Medyası Hazırlanıyor");
    expect(readSrc("app/globals.css")).toContain("academy-listen-focus");
    expect(readSrc("app/globals.css")).toContain("academy-listen-cockpit");
    expect(readSrc("app/globals.css")).toContain("academy-dialogue-player");
  }, 20_000);
});
