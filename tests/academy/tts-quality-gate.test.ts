import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { tempoStretchPcmWav, wrapPcmAsWav } from "@/lib/kernel/ai/pcm-wav";
import { masterAcademySpeechWav } from "@/lib/academy/tts-loudnorm";
import {
  ACADEMY_SPEECH_BAND_SHARE_MIN,
  ACADEMY_SPEECH_LUFS_TARGET,
  assertAcademySpeechQuality,
  speechBandEnergyShare,
} from "@/lib/academy/tts-quality-gate";
import { synthesizeSpeechShapedWav } from "@/lib/academy/tts-ab-sample";

function bassHeavySpeechWav(): Buffer {
  const sampleRate = 24_000;
  const frames = sampleRate * 2;
  const pcm = Buffer.alloc(frames * 2);
  const partials = [
    { hz: 120, amp: 0.7 },
    { hz: 180, amp: 0.55 },
    { hz: 450, amp: 0.45 },
    { hz: 595, amp: 0.4 },
    { hz: 800, amp: 0.28 },
  ];
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    let sample = 0;
    for (const partial of partials) {
      sample += partial.amp * Math.sin(2 * Math.PI * partial.hz * t);
    }
    const clamped = Math.max(-1, Math.min(1, sample * 0.35));
    pcm.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  return wrapPcmAsWav(pcm, sampleRate);
}

describe("akademi ses kalite kapısı", () => {
  it("konuşma biçimli dalga loudnorm sonrası bant payını ve LUFS hedefini tutar", () => {
    const processed = masterAcademySpeechWav(synthesizeSpeechShapedWav());
    const quality = assertAcademySpeechQuality(processed);
    expect(quality.bandShare).toBeGreaterThanOrEqual(ACADEMY_SPEECH_BAND_SHARE_MIN);
    expect(quality.integratedLufs).toBeGreaterThan(ACADEMY_SPEECH_LUFS_TARGET - 2.5);
    expect(quality.integratedLufs).toBeLessThan(ACADEMY_SPEECH_LUFS_TARGET + 2.5);
  });

  it("hizasız tempo germe 300 Hz–1 kHz payını çökertir", () => {
    const raw = bassHeavySpeechWav();
    const rawShare = speechBandEnergyShare(raw);
    const stretched = tempoStretchPcmWav(raw, 0.93);
    const stretchedShare = speechBandEnergyShare(stretched);
    expect(rawShare).toBeGreaterThan(ACADEMY_SPEECH_BAND_SHARE_MIN);
    expect(stretchedShare).toBeLessThan(rawShare * 0.5);
    expect(stretchedShare).toBeLessThan(ACADEMY_SPEECH_BAND_SHARE_MIN);
  });

  it("fırın betiği tempo DSP ve tanh kırpıcı çağırmaz", () => {
    const bake = readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8");
    expect(bake).not.toContain("tempoStretchPcmWav");
    expect(bake).not.toContain("boostPcmWavGain");
    expect(bake).toContain("masterAcademySpeechWav");
    expect(bake).toContain("assertAcademySpeechQuality");
  });
});
