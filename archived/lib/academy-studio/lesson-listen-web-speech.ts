/**
 * Akademi dinle — tarayıcı içi Web Speech yedek hoparlör.
 * Gemini TTS AbortError / ağ zaman aşımında stüdyo WAV yoksa duyulur ses basar.
 * Client-safe: GEMINI yok.
 */

import { ACADEMY_LESSON_LISTEN_LANGUAGE, academyLessonListenPreparedTurns } from "@/archived/lib/academy-studio/lesson-listen";

export const ACADEMY_WEB_SPEECH_CHUNK_CHARS = 220;

export function canUseAcademyWebSpeech(
  synth: { speak?: unknown } | null | undefined = typeof globalThis === "undefined"
    ? undefined
    : (globalThis as { speechSynthesis?: { speak?: unknown } }).speechSynthesis,
): boolean {
  return Boolean(synth && typeof (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance === "function");
}

export function academyListenWebSpeechScript(title: string, body: string, courseSlug?: string): string {
  return academyLessonListenPreparedTurns(title, body, courseSlug)
    .map((turn) => turn.text.replace(/\s+/gu, " ").trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

export function splitAcademyWebSpeechChunks(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  const sentences = trimmed.split(/(?<=[.!?…])\s+/u).filter((part) => part.length > 0);
  const pieces = sentences.length > 0 ? sentences : [trimmed];
  const chunks: string[] = [];
  let buffer = "";
  for (const piece of pieces) {
    const parts = piece.length <= ACADEMY_WEB_SPEECH_CHUNK_CHARS
      ? [piece]
      : piece.match(new RegExp(`.{1,${ACADEMY_WEB_SPEECH_CHUNK_CHARS}}`, "gu")) ?? [piece];
    for (const part of parts) {
      if (!buffer) {
        buffer = part;
        continue;
      }
      if (buffer.length + 1 + part.length <= ACADEMY_WEB_SPEECH_CHUNK_CHARS) {
        buffer = `${buffer} ${part}`;
        continue;
      }
      chunks.push(buffer);
      buffer = part;
    }
  }
  if (buffer) {
    chunks.push(buffer);
  }
  return chunks;
}

export function academyWebSpeechSliceFromOffset(text: string, fromSec: number, durationSec: number): string {
  if (!(durationSec > 0) || !(fromSec > 0) || !text) {
    return text;
  }
  const ratio = Math.max(0, Math.min(1, fromSec / durationSec));
  const index = Math.min(text.length, Math.floor(text.length * ratio));
  const sliced = text.slice(index).trim();
  return sliced.length > 0 ? sliced : text;
}

export function pickAcademyWebSpeechVoice(
  voices: readonly { lang: string; default?: boolean }[],
  lang: string = ACADEMY_LESSON_LISTEN_LANGUAGE,
): { lang: string; default?: boolean } | null {
  const wanted = lang.toLowerCase().slice(0, 2);
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(wanted)) ??
    voices.find((voice) => voice.default) ??
    voices[0] ??
    null
  );
}
