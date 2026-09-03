import { describe, expect, it } from "vitest";
import {
  decodeGeminiInlineAudio,
  parsePcmSampleRateFromMime,
  wrapPcmAsWav,
  concatPcmWavBuffers,
  concatPcmWavBuffersSeamless,
  extractPcmFromWav,
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
  tempoStretchPcmWav,
  createSilentPcmWav,
  pcmWavDurationSec,
  boostPcmWavGain,
  resamplePcmWav,
  PCM_WAV_PLAYBACK_SAMPLE_RATE,
} from "@/lib/kernel/ai/pcm-wav";

describe("Gemini TTS PCM → WAV tamponu", () => {
  it("RIFF/WAVE başlığı ekler; disk yok", () => {
    const pcm = Buffer.alloc(8, 1);
    const wav = wrapPcmAsWav(pcm, 24_000);
    expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(wav.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(wav.readUInt32LE(24)).toBe(24_000);
    expect(wav.length).toBe(44 + 8);
    expect(wav.subarray(44).equals(pcm)).toBe(true);
  });

  it("zaten WAV ise yeniden sarmaz", () => {
    const existing = wrapPcmAsWav(Buffer.from("abcd"));
    const again = wrapPcmAsWav(existing);
    expect(again.equals(existing)).toBe(true);
  });

  it("PCM WAV tamponlarını birleştirir; Gemini inline parçalarını tarar", () => {
    const a = wrapPcmAsWav(Buffer.alloc(4, 1), 24_000);
    const b = wrapPcmAsWav(Buffer.alloc(6, 2), 24_000);
    const merged = concatPcmWavBuffers([a, b]);
    expect(merged.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(extractPcmFromWav(merged).length).toBe(10);
    expect(extractPcmFromWav(merged).subarray(0, 4).equals(Buffer.alloc(4, 1))).toBe(true);

    const parts = collectGeminiInlineAudioParts([
      { inlineData: undefined },
      { inlineData: { data: Buffer.alloc(4, 3).toString("base64"), mimeType: "audio/L16;rate=24000" } },
      { inline_data: { data: Buffer.alloc(2, 4).toString("base64"), mime_type: "audio/L16;rate=24000" } },
      { inlineData: { data: "dGV4dA==", mimeType: "text/plain" } },
    ]);
    expect(parts).toHaveLength(2);
    const fromParts = mergeGeminiInlineAudioToWav(parts);
    expect(fromParts.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(extractPcmFromWav(fromParts).length).toBe(6);

    const faded = concatPcmWavBuffersSeamless(
      [wrapPcmAsWav(Buffer.alloc(480, 1), 24_000), wrapPcmAsWav(Buffer.alloc(480, 2), 24_000)],
      5,
    );
    expect(faded.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(extractPcmFromWav(faded).length).toBe(720);
  });

  it("tempoStretchPcmWav %95 süreyi uzatır; %100 aynı kalır", () => {
    const pcm = Buffer.alloc(24_000 * 2);
    const wav = wrapPcmAsWav(pcm, 24_000);
    const same = tempoStretchPcmWav(wav, 1);
    expect(extractPcmFromWav(same).length).toBe(pcm.length);
    const slower = tempoStretchPcmWav(wav, 0.95);
    const outSamples = extractPcmFromWav(slower).length / 2;
    expect(outSamples).toBeGreaterThan(24_000);
    const ratio = outSamples / (24_000 / 0.95);
    expect(ratio).toBeGreaterThan(0.8);
    expect(ratio).toBeLessThan(1.25);
  });

  it("pcmWavDurationSec sessiz tamponu milisaniyeye çevirir", () => {
    expect(pcmWavDurationSec(createSilentPcmWav(600, 24_000))).toBeCloseTo(0.6, 3);
    expect(pcmWavDurationSec(Buffer.alloc(8))).toBe(0);
  });

  it("base64 PCM çözer; mime'den sample rate okur", () => {
    const pcm = Buffer.from([0, 1, 2, 3]);
    expect(decodeGeminiInlineAudio(pcm.toString("base64")).equals(pcm)).toBe(true);
    expect(parsePcmSampleRateFromMime("audio/L16;codec=pcm;rate=24000")).toBe(24_000);
    expect(parsePcmSampleRateFromMime("audio/wav")).toBe(24_000);
  });

  it("boostPcmWavGain tepeyi limiter içinde tutar; resample 48 kHz'e çıkarır", () => {
    const samples = 240;
    const pcm = Buffer.alloc(samples * 2);
    for (let i = 0; i < samples; i += 1) {
      pcm.writeInt16LE(4_000, i * 2);
    }
    const wav = wrapPcmAsWav(pcm, 24_000);
    const boosted = boostPcmWavGain(wav, 8);
    const boostedPcm = extractPcmFromWav(boosted);
    let peak = 0;
    let sum = 0;
    for (let i = 0; i < samples; i += 1) {
      const sample = Math.abs(boostedPcm.readInt16LE(i * 2));
      peak = Math.max(peak, sample);
      sum += sample;
    }
    expect(peak).toBeGreaterThan(4_000);
    expect(peak).toBeLessThanOrEqual(32_767);
    expect(sum / samples).toBeGreaterThan(6_000);

    const resampled = resamplePcmWav(wav, PCM_WAV_PLAYBACK_SAMPLE_RATE);
    expect(resampled.readUInt32LE(24)).toBe(48_000);
    expect(extractPcmFromWav(resampled).length / 2).toBe(samples * 2);
    expect(pcmWavDurationSec(resampled)).toBeCloseTo(pcmWavDurationSec(wav), 3);
  });

  it("extractPcmFromWav fmt sonrası data parçasını yürür", () => {
    const pcm = Buffer.from([1, 0, 2, 0, 3, 0, 4, 0]);
    const wav = wrapPcmAsWav(pcm, 24_000);
    expect(extractPcmFromWav(wav).equals(pcm)).toBe(true);
    const header = Buffer.alloc(46);
    header.write("RIFF", 0);
    header.writeUInt32LE(38 + pcm.length, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(18, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(24_000, 24);
    header.writeUInt32LE(48_000, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.writeUInt16LE(0, 36);
    header.write("data", 38);
    header.writeUInt32LE(pcm.length, 42);
    expect(extractPcmFromWav(Buffer.concat([header, pcm])).equals(pcm)).toBe(true);
  });
});
