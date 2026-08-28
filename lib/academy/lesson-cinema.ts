/**
 * Ders sinema kaynağı — HTML5 / HLS / MP4 veya Dynamic Canvas.
 * Bake yoksa tuval dürüst görsel anlatımdır; sahte siyah kutu değildir.
 */

import {
  isAcademyHlsBaked,
  isAcademyMicroVideoBaked,
} from "@/lib/academy/baked-micro-videos";
import {
  academyMicroVideoPublicSources,
  type AcademyMicroVideoPublicSources,
} from "@/lib/academy/lesson-media";

export type AcademyCinemaKind = "hls" | "html5" | "canvas";

export type AcademyCinemaSource = AcademyMicroVideoPublicSources & {
  kind: AcademyCinemaKind;
};

export function resolveAcademyCinemaSource(assetKey: string): AcademyCinemaSource {
  const sources = academyMicroVideoPublicSources(assetKey);
  if (isAcademyHlsBaked(assetKey)) {
    return { kind: "hls", ...sources };
  }
  if (isAcademyMicroVideoBaked(assetKey)) {
    return { kind: "html5", ...sources };
  }
  return { kind: "canvas", ...sources };
}

export function academyCinemaCanPlayNativeHls(video: Pick<HTMLVideoElement, "canPlayType">): boolean {
  const hls = video.canPlayType("application/vnd.apple.mpegurl");
  return hls === "probably" || hls === "maybe";
}

export function academyCinemaDurationSec(input: {
  spokenDuration: number;
  microDurationSec: number;
}): number {
  const spoken = Number.isFinite(input.spokenDuration) ? Math.max(0, input.spokenDuration) : 0;
  const micro = Number.isFinite(input.microDurationSec) ? Math.max(0, input.microDurationSec) : 0;
  return Math.max(spoken, micro, 8);
}

export function formatAcademyCinemaClock(seconds: number): string {
  const clamped = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const whole = Math.floor(clamped);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

/** Altyazı cue — TTS senkron motoru arşivdedir; oynatıcı yalnız metin + süre okur. */
export type AcademyCinemaCaptionCue = {
  text: string;
  start: number;
  end: number;
};

function cinemaCaptionElapsedSec(input: {
  currentTime: number;
  audioDuration: number;
  spokenDuration: number;
  audioLeadInSec?: number;
}): number {
  const currentTime = Number.isFinite(input.currentTime) ? Math.max(0, input.currentTime) : 0;
  const audioDuration = Number.isFinite(input.audioDuration) ? input.audioDuration : 0;
  const spokenDuration = Number.isFinite(input.spokenDuration) ? input.spokenDuration : 0;
  const audioLeadInSec = Number.isFinite(input.audioLeadInSec) ? Math.max(0, input.audioLeadInSec) : 0;
  const spokenWithLeadIn = spokenDuration + audioLeadInSec;
  if (audioDuration > 0 && spokenWithLeadIn > 0) {
    return (currentTime / audioDuration) * spokenWithLeadIn;
  }
  return currentTime + audioLeadInSec;
}

function activeCinemaCaptionCueIndex(
  cues: readonly AcademyCinemaCaptionCue[],
  elapsedSec: number,
): number | null {
  if (cues.length === 0) {
    return null;
  }
  if (!Number.isFinite(elapsedSec)) {
    return null;
  }
  const first = cues[0]!;
  if (elapsedSec < first.start) {
    return null;
  }
  const last = cues[cues.length - 1]!;
  if (elapsedSec >= last.end) {
    return cues.length - 1;
  }
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index]!;
    if (elapsedSec >= cue.start && elapsedSec < cue.end) {
      return index;
    }
  }
  return cues.length - 1;
}

export function academyCinemaCaptionText(input: {
  cues: readonly AcademyCinemaCaptionCue[];
  currentTime: number;
  audioDuration: number;
  spokenDuration: number;
  audioLeadInSec: number;
}): string {
  const elapsed = cinemaCaptionElapsedSec({
    currentTime: input.currentTime,
    audioDuration: input.audioDuration,
    spokenDuration: input.spokenDuration,
    audioLeadInSec: input.audioLeadInSec,
  });
  const index = activeCinemaCaptionCueIndex(input.cues, elapsed);
  if (index == null) {
    return "";
  }
  return input.cues[index]?.text ?? "";
}

export function academyCinemaSeekAudioSeconds(input: {
  visualTime: number;
  visualDuration: number;
  audioDuration: number;
}): number {
  const visualDuration = input.visualDuration > 0 ? input.visualDuration : 0;
  const audioDuration = input.audioDuration > 0 ? input.audioDuration : 0;
  if (visualDuration <= 0 || audioDuration <= 0) {
    return Math.max(0, input.visualTime);
  }
  return Math.max(0, Math.min(audioDuration, (input.visualTime / visualDuration) * audioDuration));
}
