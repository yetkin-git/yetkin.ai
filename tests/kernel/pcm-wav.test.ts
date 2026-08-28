import { describe, expect, it } from "vitest";
import {
  decodeGeminiInlineAudio,
  parsePcmSampleRateFromMime,
  wrapPcmAsWav,
  concatPcmWavBuffers,
  extractPcmFromWav,
  collectGeminiInlineAudioParts,
  mergeGeminiInlineAudioToWav,
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
  });

  it("base64 PCM çözer; mime'den sample rate okur", () => {
    const pcm = Buffer.from([0, 1, 2, 3]);
    expect(decodeGeminiInlineAudio(pcm.toString("base64")).equals(pcm)).toBe(true);
    expect(parsePcmSampleRateFromMime("audio/L16;codec=pcm;rate=24000")).toBe(24_000);
    expect(parsePcmSampleRateFromMime("audio/wav")).toBe(24_000);
  });
});
