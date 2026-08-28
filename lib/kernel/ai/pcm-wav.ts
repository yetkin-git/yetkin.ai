/** Gemini TTS PCM / WAV tamponu. Disk yok. */

export const GEMINI_TTS_PCM_SAMPLE_RATE = 24_000;

export type GeminiInlineAudioPart = {
  data?: string;
  mimeType?: string | null;
};

type GeminiInlineAudioCarrier = {
  inlineData?: { data?: string; mimeType?: string | null };
  inline_data?: { data?: string; mimeType?: string | null; mime_type?: string | null };
};

export function decodeGeminiInlineAudio(data: string): Buffer {
  return Buffer.from(data, "base64");
}

export function parsePcmSampleRateFromMime(mimeType: string | null | undefined): number {
  const match = mimeType?.match(/rate=(\d+)/i);
  if (!match) {
    return GEMINI_TTS_PCM_SAMPLE_RATE;
  }
  const rate = Number.parseInt(match[1] ?? "", 10);
  return Number.isInteger(rate) && rate > 0 ? rate : GEMINI_TTS_PCM_SAMPLE_RATE;
}

function isWavBuffer(bytes: Buffer): boolean {
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WAVE";
}

/** Sessiz PCM WAV — TTS fallback / metin odaklı mod. */
export function createSilentPcmWav(
  durationMs = 600,
  sampleRate = GEMINI_TTS_PCM_SAMPLE_RATE,
): Buffer {
  const ms = Math.max(40, Math.min(5_000, Math.trunc(durationMs)));
  const samples = Math.max(1, Math.floor((sampleRate * ms) / 1000));
  return wrapPcmAsWav(Buffer.alloc(samples * 2), sampleRate);
}

export function wrapPcmAsWav(
  pcm: Buffer,
  sampleRate = GEMINI_TTS_PCM_SAMPLE_RATE,
  channels = 1,
  bitDepth = 16,
): Buffer {
  if (isWavBuffer(pcm)) {
    return pcm;
  }
  const blockAlign = channels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function extractPcmFromWav(wav: Buffer): Buffer {
  const wrapped = wrapPcmAsWav(wav);
  if (wrapped.length < 44) {
    return Buffer.alloc(0);
  }
  const dataSize = wrapped.readUInt32LE(40);
  return wrapped.subarray(44, 44 + Math.max(0, dataSize));
}

export function concatPcmWavBuffers(parts: readonly Buffer[]): Buffer {
  if (parts.length === 0) {
    return wrapPcmAsWav(Buffer.alloc(0));
  }
  if (parts.length === 1) {
    return wrapPcmAsWav(parts[0]!);
  }
  let sampleRate = GEMINI_TTS_PCM_SAMPLE_RATE;
  const pcms: Buffer[] = [];
  for (const part of parts) {
    const wav = wrapPcmAsWav(part, sampleRate);
    if (isWavBuffer(wav) && wav.length >= 28) {
      sampleRate = wav.readUInt32LE(24);
    }
    pcms.push(extractPcmFromWav(wav));
  }
  return wrapPcmAsWav(Buffer.concat(pcms), sampleRate);
}

function audioInlineFromPart(part: GeminiInlineAudioCarrier | null | undefined): GeminiInlineAudioPart | null {
  const camel = part?.inlineData;
  const snake = part?.inline_data;
  const data = camel?.data ?? snake?.data;
  if (!data) {
    return null;
  }
  const mimeType = camel?.mimeType ?? snake?.mimeType ?? snake?.mime_type ?? null;
  if (mimeType && /text\/|application\/json/i.test(mimeType)) {
    return null;
  }
  return { data, mimeType };
}

export function collectGeminiInlineAudioParts(
  parts: ReadonlyArray<GeminiInlineAudioCarrier | null | undefined>,
): GeminiInlineAudioPart[] {
  const collected: GeminiInlineAudioPart[] = [];
  for (const part of parts) {
    const inline = audioInlineFromPart(part);
    if (inline) {
      collected.push(inline);
    }
  }
  return collected;
}

export function mergeGeminiInlineAudioToWav(parts: readonly GeminiInlineAudioPart[]): Buffer {
  const wavs: Buffer[] = [];
  for (const part of parts) {
    const data = part.data;
    if (!data) {
      continue;
    }
    const raw = decodeGeminiInlineAudio(data);
    const rate = parsePcmSampleRateFromMime(part.mimeType);
    wavs.push(wrapPcmAsWav(raw, rate));
  }
  return concatPcmWavBuffers(wavs);
}
