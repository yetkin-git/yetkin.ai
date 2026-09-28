/**
 * Ses kalite kapısı. 300 Hz–1 kHz gövde payı ve bütünleşik LUFS.
 * Tarak filtreli tempo bu payı %30'un altına düşürür; kapı mühürden önce durur.
 */

import { readPcmWavLayout } from "@/lib/kernel/ai/pcm-wav";
import { measureIntegratedLufs } from "@/lib/academy/tts-loudnorm";

/** Ham konuşmada bu bant ~%35'tir. Kapı %30. */
export const ACADEMY_SPEECH_BAND_SHARE_MIN = 0.3;
export const ACADEMY_SPEECH_LUFS_TARGET = -16;
export const ACADEMY_SPEECH_LUFS_TOLERANCE = 2.5;
const FFT_N = 4096;
const ANALYZE_MAX_SEC = 8;

export type AcademySpeechQuality = {
  bandShare: number;
  integratedLufs: number;
};

function fftRadix2(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; (j & bit) !== 0; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = re[i] ?? 0;
      re[i] = re[j] ?? 0;
      re[j] = tr;
      const ti = im[i] ?? 0;
      im[i] = im[j] ?? 0;
      im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wlenRe = Math.cos(ang);
    const wlenIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      const half = len >> 1;
      for (let j = 0; j < half; j += 1) {
        const even = i + j;
        const odd = even + half;
        const oddRe = re[odd] ?? 0;
        const oddIm = im[odd] ?? 0;
        const vRe = oddRe * wRe - oddIm * wIm;
        const vIm = oddRe * wIm + oddIm * wRe;
        const uRe = re[even] ?? 0;
        const uIm = im[even] ?? 0;
        re[even] = uRe + vRe;
        im[even] = uIm + vIm;
        re[odd] = uRe - vRe;
        im[odd] = uIm - vIm;
        const nextRe = wRe * wlenRe - wIm * wlenIm;
        wIm = wRe * wlenIm + wIm * wlenRe;
        wRe = nextRe;
      }
    }
  }
}

/** 300 Hz–1 kHz güç / toplam güç. En fazla 8 saniye, Hann pencereli FFT. */
export function speechBandEnergyShare(wav: Buffer): number {
  const layout = readPcmWavLayout(wav);
  if (!layout || layout.sampleRate <= 0) {
    return 0;
  }
  const frameBytes = layout.channels * 2;
  const frames = Math.floor(layout.pcm.length / frameBytes);
  const cap = Math.min(frames, Math.floor(layout.sampleRate * ANALYZE_MAX_SEC));
  if (cap < FFT_N) {
    return 0;
  }
  const mono = new Float64Array(cap);
  for (let frame = 0; frame < cap; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < layout.channels; channel += 1) {
      sum += layout.pcm.readInt16LE((frame * layout.channels + channel) * 2);
    }
    mono[frame] = sum / layout.channels / 32768;
  }
  let band = 0;
  let total = 0;
  const re = new Float64Array(FFT_N);
  const im = new Float64Array(FFT_N);
  const hop = FFT_N >> 1;
  for (let start = 0; start + FFT_N <= cap; start += hop) {
    for (let i = 0; i < FFT_N; i += 1) {
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FFT_N - 1));
      re[i] = (mono[start + i] ?? 0) * hann;
      im[i] = 0;
    }
    fftRadix2(re, im);
    const nyquist = FFT_N >> 1;
    for (let bin = 1; bin < nyquist; bin += 1) {
      const hz = (bin * layout.sampleRate) / FFT_N;
      const power = (re[bin] ?? 0) ** 2 + (im[bin] ?? 0) ** 2;
      total += power;
      if (hz >= 300 && hz < 1000) {
        band += power;
      }
    }
  }
  return total > 0 ? band / total : 0;
}

export function measureAcademySpeechQuality(wav: Buffer): AcademySpeechQuality {
  return {
    bandShare: speechBandEnergyShare(wav),
    integratedLufs: measureIntegratedLufs(wav),
  };
}

/** Kapı geçmezse fırın mühür yazmaz. */
export function assertAcademySpeechQuality(wav: Buffer): AcademySpeechQuality {
  const quality = measureAcademySpeechQuality(wav);
  const percent = (quality.bandShare * 100).toFixed(1);
  if (quality.bandShare < ACADEMY_SPEECH_BAND_SHARE_MIN) {
    throw new Error(
      `Ses kalite kapısı: 300 Hz–1 kHz payı %${percent}. Alt sınır %${ACADEMY_SPEECH_BAND_SHARE_MIN * 100}.`,
    );
  }
  const delta = Math.abs(quality.integratedLufs - ACADEMY_SPEECH_LUFS_TARGET);
  if (delta > ACADEMY_SPEECH_LUFS_TOLERANCE) {
    throw new Error(
      `Ses kalite kapısı: LUFS ${quality.integratedLufs.toFixed(1)}. Hedef ${ACADEMY_SPEECH_LUFS_TARGET} ±${ACADEMY_SPEECH_LUFS_TOLERANCE}.`,
    );
  }
  return quality;
}
