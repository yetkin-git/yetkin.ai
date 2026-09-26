/**
 * Vatandaş oynatıcı sözleşmesi — tek kabuk, iki katman.
 * Varsayılan: compact makale. Karaoke mühürlü WAV ya da fırınlanmış üretim kaseti + cue JSON.
 * Sahne: tam boy canlı ekran + punchcard rozeti. Konuşma metni videonun altındaki
 * sabit yükseklikli kelime şeridinde currentTime ile akar; görsele paragraf
 * binmez, kelime şeridi overlay değildir. Kelime-saati (`buildAcademyDialogueTimeline`) bu katmana girmez.
 */

import {
  academyLessonAudioPlaybackSrc,
  academyNarrationDurationSec,
  isAcademyLessonNarrationReady,
} from "@/lib/academy/lesson-audio";
import { isAcademyPlayerArchiveLesson } from "@/lib/academy/lesson-playback";
import {
  loadAcademyTeleprompterFlow,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";

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
  if (isAcademyPlayerArchiveLesson(lessonKey) || !isAcademyLessonNarrationReady(courseSlug, lessonKey)) {
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
    durationSec: academyNarrationDurationSec(courseSlug, lessonKey),
  };
}

export function isAcademyCitizenKaraokeLayer(
  layer: AcademyCitizenPlayerLayer,
): layer is AcademyCitizenKaraokeLayer {
  return layer.kind === "article+karaoke";
}
