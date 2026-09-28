/**
 * OFF-201 A/B örneği. Ham dalga ve loudnorm çıkışı.
 * `--sample-only` mühürsüz çağrı API açmaz; bu fonksiyonu çalıştırır.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { wrapPcmAsWav } from "@/lib/kernel/ai/pcm-wav";
import { masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import { assertAcademySpeechQuality, type AcademySpeechQuality } from "@/lib/academy/tts-quality-gate";

export type AcademyTtsAbSample = {
  lessonKey: string;
  rawPath: string;
  processedPath: string;
  quality: AcademySpeechQuality;
};

/** Gövdesi 300 Hz–1 kHz'de duran kuru konuşma biçimi. API yok. */
export function synthesizeSpeechShapedWav(seconds = 4, sampleRate = 24_000): Buffer {
  const frames = Math.max(1, Math.floor(seconds * sampleRate));
  const pcm = Buffer.alloc(frames * 2);
  const partials = [
    { hz: 140, amp: 0.22 },
    { hz: 220, amp: 0.18 },
    { hz: 480, amp: 0.42 },
    { hz: 700, amp: 0.36 },
    { hz: 920, amp: 0.16 },
    { hz: 1800, amp: 0.05 },
  ];
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    let sample = 0;
    for (const partial of partials) {
      sample += partial.amp * Math.sin(2 * Math.PI * partial.hz * t);
    }
    const edge = Math.min(t, seconds - t);
    const fade = edge < 0.04 ? edge / 0.04 : 1;
    const syll = 0.62 + 0.38 * Math.sin(2 * Math.PI * 3.1 * t);
    const clamped = Math.max(-1, Math.min(1, sample * syll * fade * 0.45));
    pcm.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  return wrapPcmAsWav(pcm, sampleRate);
}

export function writeAcademyTtsAbSample(input: {
  lessonKey?: string;
  root?: string;
  rawWav?: Buffer;
}): AcademyTtsAbSample {
  const lessonKey = input.lessonKey ?? "01_office_ai_ileri-1";
  const root = input.root ?? process.cwd();
  const raw = input.rawWav ?? synthesizeSpeechShapedWav();
  const processed = masterAcademySpeechWav(raw);
  const quality = assertAcademySpeechQuality(processed);
  const dir = join(root, "media-bake", "academy", "ab-sample", lessonKey);
  const rawPath = join(dir, "raw.wav");
  const processedPath = join(dir, "processed.wav");
  mkdirSync(dir, { recursive: true });
  writeFileSync(rawPath, raw);
  writeFileSync(processedPath, processed);
  return { lessonKey, rawPath, processedPath, quality };
}
