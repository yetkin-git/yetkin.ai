/**
 * Ücretsiz Web Speech (Tarayıcıda oku) — Aşama 2 dürüstlüğü.
 *
 * Chrome tek utterance'ı ~15 sn sonra keser. Küçük cümle kuyruğu tam metni
 * sırayla okutur; soğuk şablon başlıkları seslendirilmez.
 */

import { stripAcademyColdTemplateHeadings } from "@/lib/academy/lesson-study";

/** Chrome ~15 sn tavanının altında kalsın diye 160 karakter. */
export const ACADEMY_WEB_SPEECH_CHUNK_CHARS = 160;

export function prepareAcademyWebSpeechText(raw: string): string {
  return stripAcademyColdTemplateHeadings(raw)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`>[\]|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitOversizedChunk(chunk: string, maxLen: number): string[] {
  if (chunk.length <= maxLen) {
    return [chunk];
  }
  const words = chunk.split(" ");
  const parts: string[] = [];
  let buf = "";
  for (const word of words) {
    const next = buf ? `${buf} ${word}` : word;
    if (next.length > maxLen && buf) {
      parts.push(buf);
      buf = word;
    } else {
      buf = next;
    }
  }
  if (buf) {
    parts.push(buf);
  }
  return parts;
}

export function chunkAcademyWebSpeechText(
  text: string,
  maxLen = ACADEMY_WEB_SPEECH_CHUNK_CHARS,
): string[] {
  const cleaned = prepareAcademyWebSpeechText(text);
  if (!cleaned) {
    return [];
  }
  const sentences = cleaned.split(/(?<=\p{L}[.!?…])\s+/u);
  const chunks: string[] = [];
  let buf = "";
  for (const sentence of sentences) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (buf && next.length > maxLen) {
      chunks.push(...splitOversizedChunk(buf, maxLen));
      buf = sentence;
    } else {
      buf = next;
    }
  }
  if (buf) {
    chunks.push(...splitOversizedChunk(buf, maxLen));
  }
  return chunks;
}
