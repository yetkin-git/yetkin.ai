/**
 * Lyria 3.5 dip müzik ducking — konuşurken dipte, nefes payında 3–5 sn yükselir.
 * İzleme anında harici API yok; mühürlü bed MP3 + bake parça saati.
 */

export const ACADEMY_BED_SPEECH_GAIN = 0.12;
export const ACADEMY_BED_BREATH_GAIN = 0.46;
/** Gelecek Ders Köprüsü son kelimesi bittiği an — Lyria zirve kazancı. */
export const ACADEMY_BED_OUTRO_PEAK_GAIN = 0.7;
/** Nefes payı yükseliş penceresi (saniye). */
export const ACADEMY_BED_BREATH_MIN_SEC = 3;
export const ACADEMY_BED_BREATH_MAX_SEC = 5;
/** Oynatıcı hacim süzgeci — 3–5 sn bandının ortası. */
export const ACADEMY_BED_DUCK_TAU_SEC = 4;
/** Gelecek Ders Köprüsü son 3 sn — dip müzik 0.46’ya yükselir. */
export const ACADEMY_BED_OUTRO_LIFT_SEC = 3;
/** Logo + özet + checklist üstünde coşkulu kapanış jeneriği. */
export const ACADEMY_BED_OUTRO_HOLD_SEC = 3;
/** Zirveden sessizliğe yumuşak iniş. */
export const ACADEMY_BED_OUTRO_FADE_SEC = 1.5;
/** Konuşma bittikten sonra logo + özet üstünde hold + fade-out. */
export const ACADEMY_BED_OUTRO_TAIL_SEC = ACADEMY_BED_OUTRO_HOLD_SEC + ACADEMY_BED_OUTRO_FADE_SEC;

const BED_OUTRO_LESSON_KEYS = ["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-g1", "01_office_ai-w1"] as const;

export function academyBedOutroTailSec(lessonKey: string): number {
  return (BED_OUTRO_LESSON_KEYS as readonly string[]).includes(lessonKey.trim())
    ? ACADEMY_BED_OUTRO_TAIL_SEC
    : 0;
}

export function academyBedSpeechEndSec(pieces: readonly AcademyBedSpeechWindow[]): number {
  const windows = academyBedSpeechWindows(pieces);
  if (windows.length === 0) {
    return 0;
  }
  return windows.reduce((end, row) => Math.max(end, row.end), 0);
}

export type AcademyBedSpeechWindow = {
  start: number;
  end: number;
  cueId?: string;
};

/** CEBİNE KOY pekiştirme durağında 0.46. Giriş 0–2 sn konuşmasız (nefes kazancı); konuşma 2.0’de 0.12. */
export const ACADEMY_BED_LIFT_CUE_IDS = ["cue-07"] as const;

export function academyBedIsLiftCue(cueId: string | undefined): boolean {
  return cueId != null && (ACADEMY_BED_LIFT_CUE_IDS as readonly string[]).includes(cueId);
}

export function academyBedSpeechWindows(
  pieces: readonly AcademyBedSpeechWindow[],
): readonly AcademyBedSpeechWindow[] {
  return pieces.filter((piece) => piece.end > piece.start);
}

function clamp01(value: number): number {
  if (!(Number.isFinite(value))) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) {
    return x >= edge1 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function academyBedIsSpeech(
  currentTime: number,
  pieces: readonly AcademyBedSpeechWindow[],
): boolean {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return academyBedSpeechWindows(pieces).some((piece) => t >= piece.start && t < piece.end);
}

/**
 * Konuşma içinde dip kazanç; parça aralığında (nefes) 3–5 sn süzgeçle yükselir.
 */
export function academyBedDuckGain(
  currentTime: number,
  pieces: readonly AcademyBedSpeechWindow[],
): number {
  const windows = academyBedSpeechWindows(pieces);
  if (windows.length === 0) {
    return ACADEMY_BED_SPEECH_GAIN;
  }
  const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const speaking = academyBedIsSpeech(t, windows);
  const last = windows[windows.length - 1]!;
  if (speaking) {
    const piece = windows.find((row) => t >= row.start && t < row.end);
    if (!piece) {
      return ACADEMY_BED_SPEECH_GAIN;
    }
    if (academyBedIsLiftCue(piece.cueId)) {
      return ACADEMY_BED_BREATH_GAIN;
    }
    if (piece.end === last.end && piece.start === last.start) {
      const liftFrom = Math.max(piece.start, piece.end - ACADEMY_BED_OUTRO_LIFT_SEC);
      if (t >= liftFrom) {
        const u = smoothstep(liftFrom, piece.end, t);
        return ACADEMY_BED_SPEECH_GAIN + (ACADEMY_BED_BREATH_GAIN - ACADEMY_BED_SPEECH_GAIN) * u;
      }
    }
    const fromStart = t - piece.start;
    if (fromStart < ACADEMY_BED_BREATH_MIN_SEC) {
      const u = smoothstep(0, ACADEMY_BED_BREATH_MIN_SEC, fromStart);
      return ACADEMY_BED_BREATH_GAIN + (ACADEMY_BED_SPEECH_GAIN - ACADEMY_BED_BREATH_GAIN) * u;
    }
    return ACADEMY_BED_SPEECH_GAIN;
  }
  if (t >= last.end) {
    const intoOutro = t - last.end;
    if (intoOutro >= ACADEMY_BED_OUTRO_TAIL_SEC) {
      return 0;
    }
    if (intoOutro < ACADEMY_BED_OUTRO_HOLD_SEC) {
      return ACADEMY_BED_OUTRO_PEAK_GAIN;
    }
    const u = smoothstep(0, ACADEMY_BED_OUTRO_FADE_SEC, intoOutro - ACADEMY_BED_OUTRO_HOLD_SEC);
    return ACADEMY_BED_OUTRO_PEAK_GAIN * (1 - u);
  }
  const previous = [...windows].reverse().find((row) => row.end <= t);
  if (!previous) {
    return ACADEMY_BED_BREATH_GAIN;
  }
  const intoGap = t - previous.end;
  const rise = Math.min(ACADEMY_BED_BREATH_MAX_SEC, Math.max(ACADEMY_BED_BREATH_MIN_SEC, ACADEMY_BED_DUCK_TAU_SEC));
  const u = smoothstep(0, rise, intoGap);
  return ACADEMY_BED_SPEECH_GAIN + (ACADEMY_BED_BREATH_GAIN - ACADEMY_BED_SPEECH_GAIN) * u;
}

export function academyBedDuckLerp(currentGain: number, targetGain: number, deltaSec: number): number {
  const tau = ACADEMY_BED_DUCK_TAU_SEC;
  const dt = Number.isFinite(deltaSec) && deltaSec > 0 ? deltaSec : 0;
  const alpha = 1 - Math.exp(-dt / tau);
  return currentGain + (targetGain - currentGain) * clamp01(alpha);
}
