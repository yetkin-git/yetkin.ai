/**
 * Canlı anlatım metni — ekrandaki cümle/adım, TTS zaman damgasına bağlanır.
 *
 * Kelime saati (`academyListenReadingDurationSec`) cue uzunluğunu üretir;
 * gerçek WAV süresi gelince oranlanır. Anons + nezaket + başlık lead-in’dir;
 * o aralıkta cümle yanmaz. Kod çiti konuşulmaz, cue almaz.
 *
 * Gemini TTS her dilimin başına sessiz pre-roll koyar. Bu süre kelime saatine
 * `audioLeadInSec` olarak eklenir; yeşil vurgu hoparlörün o anki cümlesine oturur.
 */

import {
  cleanAcademySpokenTextForTts,
  parseAcademyLessonActText,
  spokenAcademyLessonBody,
} from "@/lib/academy/lesson-body";
import {
  ACADEMY_LESSON_LISTEN_CHUNK_CHARS,
  ACADEMY_LESSON_LISTEN_FIRST_CHUNK_CHARS,
  academyLessonListenPreparedTurns,
  academyListenPlaybackRateForSpeaker,
  academyListenReadingDurationSec,
  splitSpokenTextForTts,
  type AcademyStudioSpeechSpeaker,
} from "@/archived/lib/academy-studio/lesson-listen";
import type { AcademyLessonBlock } from "@/lib/academy/lesson-media";

/** Gemini native-audio dilim başı sessizliği (saniye). */
export const ACADEMY_TTS_AUDIO_LEAD_IN_SEC = 0.4;

export type AcademyTranscriptCueKind = "text" | "params" | "steps";

export type AcademyTranscriptCueUnit = "heading" | "sentence" | "row" | "step";

export type AcademyTranscriptCue = {
  id: string;
  blockOffset: number;
  kind: AcademyTranscriptCueKind;
  unit: AcademyTranscriptCueUnit;
  unitIndex: number;
  text: string;
  start: number;
  end: number;
};

export type AcademyTranscriptTrack = {
  lessonKey: string;
  leadInSec: number;
  audioLeadInSec: number;
  spokenDuration: number;
  bodyDuration: number;
  cues: AcademyTranscriptCue[];
};

export type AcademyTranscriptTextUnit = {
  unit: "heading" | "sentence";
  unitIndex: number;
  text: string;
};

/** Cümle kesimi — sayı sıra noktası (`3. ders`) küçük harfle devam ettiği için bölünmez. */
export function splitAcademyTranscriptSentences(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  const parts = trimmed
    .split(/(?<=[.!?…])\s+(?=["“«]?[\p{Lu}])/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts : [trimmed];
}

export function academyTranscriptTextUnits(text: string): AcademyTranscriptTextUnit[] {
  const parsed = parseAcademyLessonActText(text);
  const units: AcademyTranscriptTextUnit[] = [];
  let unitIndex = 0;
  if (parsed.heading) {
    units.push({ unit: "heading", unitIndex, text: parsed.heading });
    unitIndex += 1;
  }
  const body = parsed.body || (parsed.heading ? "" : text);
  const paragraphs = body
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  for (const paragraph of paragraphs) {
    for (const sentence of splitAcademyTranscriptSentences(paragraph)) {
      units.push({ unit: "sentence", unitIndex, text: sentence });
      unitIndex += 1;
    }
  }
  return units;
}

function durationForSpoken(text: string, speaker: AcademyStudioSpeechSpeaker = "instructor"): number {
  return academyListenReadingDurationSec(text, academyListenPlaybackRateForSpeaker(speaker));
}

/** TTS dilim sayısı — her dilim Gemini pre-roll taşır. */
export function academyLessonListenTtsSliceCount(
  title: string,
  body: string,
  courseSlug: string,
): number {
  const turns = academyLessonListenPreparedTurns(title, body, courseSlug);
  let count = 0;
  let isFirst = true;
  for (const turn of turns) {
    const maxChars = isFirst
      ? ACADEMY_LESSON_LISTEN_FIRST_CHUNK_CHARS
      : ACADEMY_LESSON_LISTEN_CHUNK_CHARS;
    count += splitSpokenTextForTts(turn.text, maxChars).length;
    isFirst = false;
  }
  return count;
}

export function academyTtsAudioLeadInSec(sliceCount: number): number {
  const n = Number.isFinite(sliceCount) ? Math.max(0, Math.floor(sliceCount)) : 0;
  return n * ACADEMY_TTS_AUDIO_LEAD_IN_SEC;
}

/**
 * Senaryo lead-in: anons + nezaket + enjekte başlık.
 * `spokenDuration - bodyDuration` kullanılmaz — gövde farkı (egzersiz, açılım)
 * orta sahneye aittir; cue’ları bir cümle geciktirmez.
 */
export function academyTranscriptScriptLeadInSec(
  title: string,
  body: string,
  courseSlug: string,
): number {
  const turns = academyLessonListenPreparedTurns(title, body, courseSlug);
  const spokenBody = cleanAcademySpokenTextForTts(spokenAcademyLessonBody(body));
  const needle = spokenBody.slice(0, Math.min(48, spokenBody.length));
  let leadIn = 0;
  for (const turn of turns) {
    if (!needle) {
      leadIn += durationForSpoken(turn.text, turn.speaker);
      continue;
    }
    const index = turn.text.indexOf(needle);
    if (index === 0) {
      return leadIn;
    }
    if (index > 0) {
      const prefix = turn.text.slice(0, index).trim();
      if (prefix) {
        leadIn += durationForSpoken(prefix, turn.speaker);
      }
      return leadIn;
    }
    leadIn += durationForSpoken(turn.text, turn.speaker);
  }
  return leadIn;
}

function pushCue(
  cues: AcademyTranscriptCue[],
  cue: Omit<AcademyTranscriptCue, "start" | "end">,
  offset: number,
): number {
  const duration = durationForSpoken(cue.text);
  if (!(duration > 0)) {
    return offset;
  }
  cues.push({
    ...cue,
    start: offset,
    end: offset + duration,
  });
  return offset + duration;
}

function cuesFromReadingBlocks(blocks: readonly AcademyLessonBlock[]): {
  cues: AcademyTranscriptCue[];
  bodyDuration: number;
} {
  const cues: AcademyTranscriptCue[] = [];
  let offset = 0;
  for (let blockOffset = 0; blockOffset < blocks.length; blockOffset += 1) {
    const block = blocks[blockOffset]!;
    if (block.kind === "text") {
      for (const unit of academyTranscriptTextUnits(block.text)) {
        offset = pushCue(
          cues,
          {
            id: `text:${blockOffset}:${unit.unit}:${unit.unitIndex}`,
            blockOffset,
            kind: "text",
            unit: unit.unit,
            unitIndex: unit.unitIndex,
            text: unit.text,
          },
          offset,
        );
      }
      continue;
    }
    if (block.kind === "params") {
      for (let unitIndex = 0; unitIndex < block.rows.length; unitIndex += 1) {
        const row = block.rows[unitIndex]!;
        offset = pushCue(
          cues,
          {
            id: `params:${blockOffset}:row:${unitIndex}`,
            blockOffset,
            kind: "params",
            unit: "row",
            unitIndex,
            text: `${row.label}: ${row.value}.`,
          },
          offset,
        );
      }
      continue;
    }
    if (block.kind === "steps") {
      for (let unitIndex = 0; unitIndex < block.items.length; unitIndex += 1) {
        const item = block.items[unitIndex]!;
        offset = pushCue(
          cues,
          {
            id: `steps:${blockOffset}:step:${unitIndex}`,
            blockOffset,
            kind: "steps",
            unit: "step",
            unitIndex,
            text: `${unitIndex + 1}. ${item}`,
          },
          offset,
        );
      }
    }
  }
  return { cues, bodyDuration: offset };
}

export function buildAcademyTranscriptTrack(input: {
  lessonKey: string;
  title: string;
  body: string;
  courseSlug: string;
  blocks: readonly AcademyLessonBlock[];
}): AcademyTranscriptTrack {
  const { cues: bodyCues, bodyDuration } = cuesFromReadingBlocks(input.blocks);
  const turns = academyLessonListenPreparedTurns(input.title, input.body, input.courseSlug);
  const spokenDuration = turns.reduce(
    (sum, turn) => sum + durationForSpoken(turn.text, turn.speaker),
    0,
  );
  const leadInSec = academyTranscriptScriptLeadInSec(input.title, input.body, input.courseSlug);
  const audioLeadInSec = academyTtsAudioLeadInSec(
    academyLessonListenTtsSliceCount(input.title, input.body, input.courseSlug),
  );
  const cues = bodyCues.map((cue) => ({
    ...cue,
    start: cue.start + leadInSec,
    end: cue.end + leadInSec,
  }));
  const timelineEnd = cues[cues.length - 1]?.end ?? leadInSec;
  return {
    lessonKey: input.lessonKey,
    leadInSec,
    audioLeadInSec,
    spokenDuration: spokenDuration > 0 ? spokenDuration : timelineEnd,
    bodyDuration,
    cues,
  };
}

/**
 * WAV süresi ile kelime saati aynı orana çekilir; kısa kaset tüm cümleleri yakmaz.
 * `audioLeadInSec` Gemini dilim pre-roll’udur — oran payına eklenir ki vurgu sesin gerisinde kalmasın.
 */
export function academyTranscriptElapsedSec(input: {
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

export function activeAcademyTranscriptCueIndex(
  cues: readonly AcademyTranscriptCue[],
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

export function academyTranscriptCuesForBlock(
  cues: readonly AcademyTranscriptCue[],
  blockOffset: number,
): AcademyTranscriptCue[] {
  return cues.filter((cue) => cue.blockOffset === blockOffset);
}
