/**
 * Vatandaş oynatıcı sözleşmesi — tek kabuk, iki katman.
 * Varsayılan: compact makale. Karaoke yalnız mühürlü WAV + cue JSON.
 * Kelime-saati (`buildAcademyDialogueTimeline`) bu katmana girmez.
 */

import {
  academyLessonAudioPlaybackSrc,
  academySealedAudioDurationSec,
} from "@/lib/academy/lesson-audio";
import {
  loadAcademyTeleprompterFlow,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

export type AcademyCitizenArticleLayer = {
  kind: "article";
};

export type AcademyCitizenKaraokeLayer = {
  kind: "article+karaoke";
  lessonKey: string;
  audioSrc: string;
  cues: readonly AcademyTeleprompterLine[];
  durationSec: number;
};

export type AcademyCitizenPlayerLayer = AcademyCitizenArticleLayer | AcademyCitizenKaraokeLayer;

export function academyCitizenPlayerLayer(
  courseSlug: string,
  lessonKey: string,
): AcademyCitizenPlayerLayer {
  if (!isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return { kind: "article" };
  }
  const cues = loadAcademyTeleprompterFlow(lessonKey);
  if (cues.length === 0) {
    return { kind: "article" };
  }
  return {
    kind: "article+karaoke",
    lessonKey,
    audioSrc: academyLessonAudioPlaybackSrc(courseSlug, lessonKey),
    cues,
    durationSec: academySealedAudioDurationSec(courseSlug, lessonKey),
  };
}

export function isAcademyCitizenKaraokeLayer(
  layer: AcademyCitizenPlayerLayer,
): layer is AcademyCitizenKaraokeLayer {
  return layer.kind === "article+karaoke";
}
