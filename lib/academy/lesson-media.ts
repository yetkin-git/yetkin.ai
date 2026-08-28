/**
 * Ders görseli — mikro-video 5–8 sn, şema kamu yolu.
 */

import {
  classifyAcademyLessonChunk,
  splitAcademyLessonChunks,
  type AcademyLessonSegment,
} from "@/lib/academy/lesson-body";

export const ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC = 5 as const;
export const ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC = 8 as const;
export const ACADEMY_MEDIA_PUBLIC_ROOT = "/media/academy" as const;

export type AcademyLessonVisualCopy = {
  diagramKey: string;
  diagramTitle: string;
  diagramCaption: string;
  videoTitle: string;
  videoCaption: string;
  durationSec: number;
};

export type AcademyLessonDiagramSlot = {
  afterParagraph: number;
  title: string;
  caption: string;
  diagramKey: string;
};

export type AcademyLessonMicroVideoSlot = {
  afterParagraph: number;
  title: string;
  caption: string;
  durationSec: number;
  assetKey: string;
};

export type AcademyLessonMediaFields = {
  diagrams: readonly AcademyLessonDiagramSlot[];
  microVideos: readonly AcademyLessonMicroVideoSlot[];
};

export type AcademyLessonBlock =
  | { kind: "text"; text: string }
  | { kind: "micro-video"; title: string; caption: string; durationSec: number; assetKey: string }
  | { kind: "diagram"; title: string; caption: string; diagramKey: string }
  | Extract<AcademyLessonSegment, { kind: "params" | "steps" | "code" | "exercise" }>;

export type AcademyLessonBodyBlock = AcademyLessonBlock;
export type AcademyMicroVideoDurationSec = number;

export function isAcademyMicroVideoDurationSec(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC &&
    value <= ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC
  );
}

export function academyDiagramPublicPath(diagramKey: string): string {
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/diagrams/${diagramKey}.svg`;
}

export type AcademyMicroVideoPublicSources = {
  webm: string;
  mp4: string;
  poster: string;
  loop: string;
  hls: string;
};

export function academyMicroVideoPublicSources(assetKey: string): AcademyMicroVideoPublicSources {
  return {
    webm: `${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/${assetKey}.webm`,
    mp4: `${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/${assetKey}.mp4`,
    poster: `${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/${assetKey}.poster.svg`,
    loop: `${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/${assetKey}.loop.svg`,
    hls: `${ACADEMY_MEDIA_PUBLIC_ROOT}/micro/${assetKey}.m3u8`,
  };
}

export function attachAcademyLessonVisuals<T extends { key: string }>(
  lesson: T,
  visual: AcademyLessonVisualCopy,
): T & AcademyLessonMediaFields {
  return {
    ...lesson,
    diagrams: [
      {
        afterParagraph: 1,
        title: visual.diagramTitle,
        caption: visual.diagramCaption,
        diagramKey: visual.diagramKey,
      },
    ],
    microVideos: [
      {
        afterParagraph: 0,
        title: visual.videoTitle,
        caption: visual.videoCaption,
        durationSec: visual.durationSec,
        assetKey: visual.diagramKey,
      },
    ],
  };
}

export function composeAcademyLessonBlocks(input: {
  body: string;
  microVideos?: readonly AcademyLessonMicroVideoSlot[];
  diagrams?: readonly AcademyLessonDiagramSlot[];
}): AcademyLessonBlock[] {
  const blocks: AcademyLessonBlock[] = [];
  let textIndex = -1;
  for (const chunk of splitAcademyLessonChunks(input.body)) {
    const segment = classifyAcademyLessonChunk(chunk);
    if (segment.kind === "text") {
      textIndex += 1;
      blocks.push({ kind: "text", text: segment.text });
      for (const video of input.microVideos ?? []) {
        if (video.afterParagraph === textIndex) {
          blocks.push({
            kind: "micro-video",
            title: video.title,
            caption: video.caption,
            durationSec: video.durationSec,
            assetKey: video.assetKey,
          });
        }
      }
      for (const diagram of input.diagrams ?? []) {
        if (diagram.afterParagraph === textIndex) {
          blocks.push({
            kind: "diagram",
            title: diagram.title,
            caption: diagram.caption,
            diagramKey: diagram.diagramKey,
          });
        }
      }
      continue;
    }
    blocks.push(segment);
  }
  return blocks;
}
