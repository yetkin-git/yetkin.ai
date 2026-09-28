/**
 * TTS parça önbelleği.
 * Ham Gemini WAV ayrı saklanır. DSP sürümü işlenmiş parmak izindedir.
 * DSP değişince API çağrılmaz; ham önbellek yeniden işlenir.
 */

import { createHash } from "node:crypto";
import { join } from "node:path";

/** İşlenmiş parça sürümü. WSOLA atempo=0.93 + EBU R128. Ham önbellek bu sürümden bağımsızdır. */
export const ACADEMY_TTS_DSP_REV = "wsola-atempo-0.93-loudnorm-r128-v1" as const;

export type AcademyTtsPieceFingerprintInput = {
  model: string;
  voice: string;
  speechRate: number;
  text: string;
  /** Stüdyo akustik direktifi. Doluysa eski kaset önbelleği kaçırılır. */
  acoustic?: string;
  dspRev?: string;
};

export type AcademyTtsRawPieceFingerprintInput = {
  model: string;
  voice: string;
  text: string;
  acoustic?: string;
};

function hashParts(parts: readonly string[]): string {
  return createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 20);
}

/** Ham Gemini çıktısı. Tempo ve seviye bu parmak izine girmez. */
export function academyTtsRawPieceFingerprint(input: AcademyTtsRawPieceFingerprintInput): string {
  return hashParts([input.model, input.voice, input.text, input.acoustic?.trim() ?? ""]);
}

export function academyTtsPieceFingerprint(input: AcademyTtsPieceFingerprintInput): string {
  return hashParts([
    input.model,
    input.voice,
    String(input.speechRate),
    input.text,
    input.acoustic?.trim() ?? "",
    input.dspRev ?? ACADEMY_TTS_DSP_REV,
  ]);
}

export function academyTtsPieceCachePaths(input: {
  root?: string;
  courseSlug: string;
  lessonKey: string;
  index: number;
  fingerprint: string;
}): { dir: string; wav: string; mp3: string } {
  const root = input.root ?? process.cwd();
  const dir = join(root, "media-bake", "academy", "piece-cache", input.courseSlug, input.lessonKey);
  const stem = `${String(input.index).padStart(2, "0")}-${input.fingerprint}`;
  return {
    dir,
    wav: join(dir, `${stem}.wav`),
    mp3: join(dir, `${stem}.mp3`),
  };
}

export function academyTtsRawPieceCachePaths(input: {
  root?: string;
  courseSlug: string;
  lessonKey: string;
  index: number;
  fingerprint: string;
}): { dir: string; wav: string } {
  const root = input.root ?? process.cwd();
  const dir = join(root, "media-bake", "academy", "raw-cache", input.courseSlug, input.lessonKey);
  const stem = `${String(input.index).padStart(2, "0")}-${input.fingerprint}`;
  return {
    dir,
    wav: join(dir, `${stem}.wav`),
  };
}
