/** Gemini TTS PCM / WAV tamponu. Disk yok. */

export const GEMINI_TTS_PCM_SAMPLE_RATE = 24_000;
/** Chrome 24 kHz WAV ~1:47'de currentTime dondurur; oynatma 48 kHz ister. */
export const PCM_WAV_PLAYBACK_SAMPLE_RATE = 48_000;
/** Laptop hoparlörü — TTS tepe zaten yakınsa limiter +8 dB RMS yükseltir. */
export const PCM_WAV_GAIN_DB = 8;

type PcmWavAudio = {
  sampleRate: number;
  channels: number;
  bits: number;
  pcm: Buffer;
};

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

function parsePcmWavAudio(wav: Buffer): PcmWavAudio | null {
  const wrapped = wrapPcmAsWav(wav);
  if (!isWavBuffer(wrapped) || wrapped.length < 44) {
    return null;
  }
  let offset = 12;
  let sampleRate = 0;
  let channels = 0;
  let bits = 0;
  let pcm: Buffer | null = null;
  while (offset + 8 <= wrapped.length) {
    const id = wrapped.toString("ascii", offset, offset + 4);
    const size = wrapped.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "fmt " && size >= 16 && start + 16 <= wrapped.length) {
      channels = wrapped.readUInt16LE(start + 2);
      sampleRate = wrapped.readUInt32LE(start + 4);
      bits = wrapped.readUInt16LE(start + 14);
    } else if (id === "data") {
      const end = Math.min(wrapped.length, start + Math.max(0, size));
      pcm = wrapped.subarray(start, end);
      break;
    }
    offset = start + size + (size % 2);
  }
  if (!pcm || !(sampleRate > 0) || !(channels > 0) || !(bits > 0)) {
    return null;
  }
  return { sampleRate, channels, bits, pcm };
}

/** PCM WAV süre (saniye) — fmt/data parçalarını yürür; istemci değil. */
export function pcmWavDurationSec(wav: Buffer): number {
  if (!isWavBuffer(wav)) {
    return 0;
  }
  const parsed = parsePcmWavAudio(wav);
  if (!parsed) {
    return 0;
  }
  const bytesPerSec = parsed.sampleRate * parsed.channels * (parsed.bits / 8);
  return bytesPerSec > 0 ? parsed.pcm.length / bytesPerSec : 0;
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
  return parsePcmWavAudio(wav)?.pcm ?? Buffer.alloc(0);
}

/** +gainDb, tepe limiter. Sessiz TTS'i laptop %50'de gürleştirir. */
export function boostPcmWavGain(wav: Buffer, gainDb = PCM_WAV_GAIN_DB): Buffer {
  const parsed = parsePcmWavAudio(wav);
  if (!parsed || parsed.bits !== 16) {
    return wrapPcmAsWav(wav);
  }
  const linear = 10 ** (gainDb / 20);
  const limit = 32767 * 10 ** (-0.3 / 20);
  const out = Buffer.alloc(parsed.pcm.length);
  const samples = Math.floor(parsed.pcm.length / 2);
  for (let index = 0; index < samples; index += 1) {
    const boosted = parsed.pcm.readInt16LE(index * 2) * linear;
    const limited = limit * Math.tanh(boosted / limit);
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(limited))), index * 2);
  }
  return wrapPcmAsWav(out, parsed.sampleRate, parsed.channels, 16);
}

/** Lineer yeniden örnekleme — 24 kHz Chrome takılmasını 48 kHz ile keser. */
export function resamplePcmWav(wav: Buffer, targetRate = PCM_WAV_PLAYBACK_SAMPLE_RATE): Buffer {
  const parsed = parsePcmWavAudio(wav);
  if (!parsed || parsed.bits !== 16) {
    return wrapPcmAsWav(wav);
  }
  if (!Number.isFinite(targetRate) || targetRate <= 0 || parsed.sampleRate === targetRate) {
    return wrapPcmAsWav(parsed.pcm, parsed.sampleRate, parsed.channels, 16);
  }
  const inFrames = Math.floor(parsed.pcm.length / 2 / parsed.channels);
  if (inFrames <= 0) {
    return wrapPcmAsWav(Buffer.alloc(0), targetRate, parsed.channels, 16);
  }
  const outFrames = Math.max(1, Math.round((inFrames * targetRate) / parsed.sampleRate));
  const out = Buffer.alloc(outFrames * parsed.channels * 2);
  const ratio = parsed.sampleRate / targetRate;
  for (let frame = 0; frame < outFrames; frame += 1) {
    const src = frame * ratio;
    const i0 = Math.min(inFrames - 1, Math.floor(src));
    const i1 = Math.min(inFrames - 1, i0 + 1);
    const frac = src - i0;
    for (let channel = 0; channel < parsed.channels; channel += 1) {
      const s0 = parsed.pcm.readInt16LE((i0 * parsed.channels + channel) * 2);
      const s1 = parsed.pcm.readInt16LE((i1 * parsed.channels + channel) * 2);
      out.writeInt16LE(
        Math.round(s0 + (s1 - s0) * frac),
        (frame * parsed.channels + channel) * 2,
      );
    }
  }
  return wrapPcmAsWav(out, targetRate, parsed.channels, 16);
}

function readInt16Sample(pcm: Buffer, index: number): number {
  const samples = Math.floor(pcm.length / 2);
  if (samples <= 0) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(samples - 1, Math.trunc(index)));
  return pcm.readInt16LE(clamped * 2);
}

function solaTimeStretchInt16(pcm: Buffer, rate: number): Buffer {
  const inSamples = Math.floor(pcm.length / 2);
  if (inSamples < 8) {
    return Buffer.from(pcm);
  }
  const window = 1152;
  const hopOut = 288;
  const hopIn = hopOut * rate;
  const outSamples = Math.max(1, Math.round(inSamples / rate));
  const acc = new Float64Array(outSamples + window);
  const weights = new Float64Array(outSamples + window);
  let inPos = 0;
  let outPos = 0;
  while (outPos < outSamples) {
    for (let i = 0; i < window; i += 1) {
      const dest = outPos + i;
      if (dest >= acc.length) {
        break;
      }
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (window - 1));
      acc[dest] = (acc[dest] ?? 0) + readInt16Sample(pcm, inPos + i) * hann;
      weights[dest] = (weights[dest] ?? 0) + hann;
    }
    inPos += hopIn;
    outPos += hopOut;
    if (inPos >= inSamples) {
      break;
    }
  }
  const out = Buffer.alloc(outSamples * 2);
  for (let i = 0; i < outSamples; i += 1) {
    const weight = weights[i] ?? 0;
    const sample = weight > 1e-6 ? (acc[i] ?? 0) / weight : 0;
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample))), i * 2);
  }
  return out;
}

/** Konuşma hızı — 0.95 = %5 yavaşlatma. Süre uzar; perde SOLA ile korunur. */
export function tempoStretchPcmWav(wav: Buffer, rate: number): Buffer {
  const parsed = parsePcmWavAudio(wav);
  if (!parsed) {
    return wrapPcmAsWav(wav);
  }
  if (!Number.isFinite(rate) || rate <= 0 || Math.abs(rate - 1) < 0.0005) {
    return wrapPcmAsWav(parsed.pcm, parsed.sampleRate, parsed.channels, parsed.bits);
  }
  return wrapPcmAsWav(solaTimeStretchInt16(parsed.pcm, rate), parsed.sampleRate, parsed.channels, parsed.bits);
}

export function concatPcmWavBuffers(parts: readonly Buffer[]): Buffer {
  if (parts.length === 0) {
    return wrapPcmAsWav(Buffer.alloc(0));
  }
  if (parts.length === 1) {
    return wrapPcmAsWav(parts[0]!);
  }
  let sampleRate = GEMINI_TTS_PCM_SAMPLE_RATE;
  let channels = 1;
  const pcms: Buffer[] = [];
  for (const part of parts) {
    const parsed = parsePcmWavAudio(part);
    if (parsed) {
      sampleRate = parsed.sampleRate;
      channels = parsed.channels;
      pcms.push(parsed.pcm);
    } else {
      pcms.push(extractPcmFromWav(wrapPcmAsWav(part, sampleRate)));
    }
  }
  return wrapPcmAsWav(Buffer.concat(pcms), sampleRate, channels);
}

/** Dilim birleşiminde tık ve ton sıçramasını eşit-güç çapraz solukla yumuşatır. */
export function concatPcmWavBuffersSeamless(
  parts: readonly Buffer[],
  crossfadeMs = 120,
): Buffer {
  if (parts.length <= 1 || !(crossfadeMs > 0)) {
    return concatPcmWavBuffers(parts);
  }
  let sampleRate = GEMINI_TTS_PCM_SAMPLE_RATE;
  const pcms: Buffer[] = [];
  for (const part of parts) {
    const parsed = parsePcmWavAudio(part);
    if (parsed) {
      sampleRate = parsed.sampleRate;
      pcms.push(parsed.pcm);
    } else {
      pcms.push(extractPcmFromWav(wrapPcmAsWav(part, sampleRate)));
    }
  }
  const fadeSamples = Math.max(1, Math.round((sampleRate * crossfadeMs) / 1000));
  let acc = pcms[0] ?? Buffer.alloc(0);
  for (let index = 1; index < pcms.length; index += 1) {
    acc = crossfadeInt16Pcm(acc, pcms[index]!, fadeSamples);
  }
  return wrapPcmAsWav(acc, sampleRate, 1, 16);
}

function crossfadeInt16Pcm(left: Buffer, right: Buffer, fadeSamples: number): Buffer {
  const leftSamples = Math.floor(left.length / 2);
  const rightSamples = Math.floor(right.length / 2);
  if (leftSamples <= 0) {
    return Buffer.from(right);
  }
  if (rightSamples <= 0) {
    return Buffer.from(left);
  }
  const overlap = Math.min(fadeSamples, leftSamples, rightSamples);
  const out = Buffer.alloc((leftSamples + rightSamples - overlap) * 2);
  left.copy(out, 0, 0, (leftSamples - overlap) * 2);
  for (let i = 0; i < overlap; i += 1) {
    const t = overlap <= 1 ? 1 : i / (overlap - 1);
    const a = Math.cos((t * Math.PI) / 2);
    const b = Math.sin((t * Math.PI) / 2);
    const mixed =
      left.readInt16LE((leftSamples - overlap + i) * 2) * a + right.readInt16LE(i * 2) * b;
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(mixed))), (leftSamples - overlap + i) * 2);
  }
  right.copy(out, leftSamples * 2, overlap * 2);
  return out;
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
