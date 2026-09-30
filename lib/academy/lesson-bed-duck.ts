/**
 * Lyria 3.5 dip müzik ducking — konuşurken dipte, nefes payında 3–5 sn yükselir.
 * İzleme anında harici API yok; mühürlü bed MP3 + bake parça saati.
 */

import {
  ACADEMY_OFF101_BED_HARD_MIX_LESSON_KEYS,
  academyLessonBedIsHardMixed,
} from "@/lib/academy/lesson-audio";

/** Lyria 3.5 atmosferi — ders konusuna göre döner. Tek şablon yatak yasak. */
export const ACADEMY_BED_MOODS = ["ambient", "lo-fi", "upbeat"] as const;

export type AcademyBedMood = (typeof ACADEMY_BED_MOODS)[number];

export const ACADEMY_OFF201_LESSON_BED_MOOD = {
  "01_office_ai_ileri-1": "ambient",
  "01_office_ai_ileri-2": "lo-fi",
  "01_office_ai_ileri-3": "upbeat",
  "01_office_ai_ileri-4": "ambient",
  "01_office_ai_ileri-5": "lo-fi",
  "01_office_ai_ileri-6": "upbeat",
} as const satisfies Record<string, AcademyBedMood>;

/** OFF-101 Lyria atmosferi. Tek şablon yatak yok; ders konusu döner. */
export const ACADEMY_OFF101_LESSON_BED_MOOD = {
  "01_office_ai-1": "ambient",
  "01_office_ai-2": "lo-fi",
  "01_office_ai-3": "upbeat",
  "01_office_ai-5": "ambient",
  "01_office_ai-6": "lo-fi",
  "01_office_ai-g1": "upbeat",
  "01_office_ai-w1": "ambient",
  "01_office_ai-k1": "lo-fi",
} as const satisfies Record<string, AcademyBedMood>;

/**
 * EC-102 yatak haritası.
 * Ders 1, 2, 5: naylon gitar ve hafif piyano.
 * Ders 3, 4, 6: lo-fi synth ve odak ritmi.
 */
export const ACADEMY_EC102_LESSON_BED_KIND = {
  "02_ecommerce_ai-1": "nylon-piano",
  "02_ecommerce_ai-2": "nylon-piano",
  "02_ecommerce_ai-3": "lofi-synth",
  "02_ecommerce_ai-4": "lofi-synth",
  "02_ecommerce_ai-5": "nylon-piano",
  "02_ecommerce_ai-6": "lofi-synth",
} as const;

export type AcademyEc102BedKind = (typeof ACADEMY_EC102_LESSON_BED_KIND)[keyof typeof ACADEMY_EC102_LESSON_BED_KIND];

export function academyEc102BedKind(lessonKey: string): AcademyEc102BedKind | null {
  const key = lessonKey.trim();
  return ACADEMY_EC102_LESSON_BED_KIND[key as keyof typeof ACADEMY_EC102_LESSON_BED_KIND] ?? null;
}

export function academyLessonBedMood(lessonKey: string): AcademyBedMood {
  const key = lessonKey.trim();
  const ec102 = academyEc102BedKind(key);
  if (ec102 === "nylon-piano") {
    return "ambient";
  }
  if (ec102 === "lofi-synth") {
    return "lo-fi";
  }
  const off201 = ACADEMY_OFF201_LESSON_BED_MOOD[key as keyof typeof ACADEMY_OFF201_LESSON_BED_MOOD];
  if (off201) {
    return off201;
  }
  const off101 = ACADEMY_OFF101_LESSON_BED_MOOD[key as keyof typeof ACADEMY_OFF101_LESSON_BED_MOOD];
  return off101 ?? "ambient";
}

export function academyLessonBedPrompt(mood: AcademyBedMood): string {
  const tone =
    mood === "upbeat"
      ? "Light upbeat office pulse, soft kick, muted pluck, forward but not loud."
      : mood === "lo-fi"
        ? "Lo-fi study bed, warm tape hiss barely present, dusty keys, slow swing, soft synth."
        : "Corporate ambient air, soft piano, muted guitar, light brushed percussion, gentle analog pad, soft lo-fi synth.";
  return `Instrumental only, no vocals, no lyrics, no humming, no choir. Calm focus-enhancing bed. ${tone} About ninety seconds, loop-friendly, gentle edges so it can repeat under a spoken lesson. Stays quiet under speech and swells politely in 3 to 5 second breath gaps. No melody that fights the narrator. 44.1 kHz stereo.`;
}

const ACADEMY_EC102_NYLON_PIANO_PROMPT =
  "Instrumental only, no vocals, no lyrics, no humming, no choir. Calm focus-enhancing bed. Nylon guitar and light piano, soft brushes, warm room, no drums that fight speech. About ninety seconds, loop-friendly, gentle edges so it can repeat under a spoken lesson. Stays quiet under speech and swells politely in 3 to 5 second breath gaps. No melody that fights the narrator. 44.1 kHz stereo.";

const ACADEMY_EC102_LOFI_SYNTH_PROMPT =
  "Instrumental only, no vocals, no lyrics. Calm focus bed. Soft synthesizer pads and a quiet steady pulse, warm electric piano, light shaker, gentle tempo. About ninety seconds, loop-friendly, soft edges so it can repeat under spoken narration. Stays quiet under the voice and rises slightly in short pauses. 44.1 kHz stereo.";

/** Ders anahtarı EC-102 yatak haritasındaysa o promptu, değilse mood şablonunu okur. */
export function academyLessonBedPromptForLesson(lessonKey: string): string {
  const kind = academyEc102BedKind(lessonKey);
  if (kind === "nylon-piano") {
    return ACADEMY_EC102_NYLON_PIANO_PROMPT;
  }
  if (kind === "lofi-synth") {
    return ACADEMY_EC102_LOFI_SYNTH_PROMPT;
  }
  return academyLessonBedPrompt(academyLessonBedMood(lessonKey));
}

/**
 * Hard-mix yatak kazancı. Konuşma dosyasının içinde kalır; ayrı audio etiketi yok.
 * Kulakla duyulur dip: anlatımı bastırmaz, sessiz dipte kaybolmaz.
 */
export const ACADEMY_BED_HARD_MIX_DB = -18;
/**
 * Hard-mix giriş bandı. İlk 3–5 sn yalnız müzik (crescendo).
 * Mühür ortası 4.00 sn. Konuşma bu saniyeden sonra girer; yatak -18 dB’ye iner.
 */
export const ACADEMY_BED_INTRO_MIN_SEC = 3;
export const ACADEMY_BED_INTRO_MAX_SEC = 5;
export const ACADEMY_BED_INTRO_SEC = 4;
/** OFF-101 hard-mix girişi. Bant alt ucu: 3.00 sn yalnız müzik. */
export const ACADEMY_OFF101_BED_INTRO_SEC = ACADEMY_BED_INTRO_MIN_SEC;
/** Giriş crescendo tepesi. Konuşma yokken yatak duyulur; 0 dB’ye yapışmaz. */
export const ACADEMY_BED_INTRO_PEAK_DB = -8;
/** Giriş tabanı. Crescendo buradan tepeye çıkar, sonra -18 dB duck. */
export const ACADEMY_BED_INTRO_FLOOR_DB = -20;
/** Konuşma girerken yatak iniş rampası. Nefes payı ile aynı aile. */
export const ACADEMY_BED_INTRO_DUCK_SEC = 0.4;

export function academyBedIntroSec(lessonKey: string): number {
  const key = lessonKey.trim();
  if ((ACADEMY_OFF101_BED_HARD_MIX_LESSON_KEYS as readonly string[]).includes(key)) {
    return ACADEMY_OFF101_BED_INTRO_SEC;
  }
  return academyLessonBedIsHardMixed(key) ? ACADEMY_BED_INTRO_SEC : 0;
}

/** Konuşma saati. Hard-mix dosyasında ilk saniyeler yalnız müziktir. */
export function academyBedSpeechClockSec(lessonKey: string, mediaSec: number): number {
  const t = Number.isFinite(mediaSec) ? Math.max(0, mediaSec) : 0;
  return Math.max(0, t - academyBedIntroSec(lessonKey));
}

/** Konuşma altı dip — lineer kazanç `10^(dB/20)`. Anlatımı bastırmaz. Ayrı yatak etiketi içindir. */
export const ACADEMY_BED_SPEECH_DB = -25;
/** EC-102 Puck anlatımının altı. Lyria yatak ayrı etikette bu seviyede durur. */
export const ACADEMY_EC102_BED_SPEECH_DB = -22;
/** Nefes payı — konuşmadan 3 dB açık, hâlâ dipte. */
export const ACADEMY_BED_BREATH_DB = -22;
/** İlk konuşma 0. saniyede açılırsa yatak bu sürede 0’dan dipe yükselir. */
export const ACADEMY_BED_ENGAGE_SEC = 1.5;

export function academyBedDbToLinear(db: number): number {
  return 10 ** (db / 20);
}

export const ACADEMY_BED_SPEECH_GAIN = academyBedDbToLinear(ACADEMY_BED_SPEECH_DB);
export const ACADEMY_BED_BREATH_GAIN = academyBedDbToLinear(ACADEMY_BED_BREATH_DB);
export const ACADEMY_EC102_BED_SPEECH_GAIN = academyBedDbToLinear(ACADEMY_EC102_BED_SPEECH_DB);

/** EC-102 yatak konuşma altında -22 dB. Diğer kurslar -25 dB kalır. */
export function academyBedSpeechGainForLesson(lessonKey: string): number {
  return academyEc102BedKind(lessonKey) ? ACADEMY_EC102_BED_SPEECH_GAIN : ACADEMY_BED_SPEECH_GAIN;
}
/** Gelecek Ders Köprüsü son kelimesi bittiği an — Lyria zirve kazancı. */
export const ACADEMY_BED_OUTRO_PEAK_GAIN = 0.7;
/** Nefes payı yükseliş penceresi (saniye). */
export const ACADEMY_BED_BREATH_MIN_SEC = 3;
export const ACADEMY_BED_BREATH_MAX_SEC = 5;
/** Oynatıcı hacim süzgeci — 3–5 sn bandının ortası. */
export const ACADEMY_BED_DUCK_TAU_SEC = 4;
/** Gelecek Ders Köprüsü son 3 sn — dip müzik nefes payına (-22 dB) yükselir. */
export const ACADEMY_BED_OUTRO_LIFT_SEC = 3;
/** Logo + özet + checklist üstünde coşkulu kapanış jeneriği. */
export const ACADEMY_BED_OUTRO_HOLD_SEC = 3;
/** Zirveden sessizliğe yumuşak iniş. */
export const ACADEMY_BED_OUTRO_FADE_SEC = 1.5;
/** Konuşma bittikten sonra logo + özet üstünde hold + fade-out. */
export const ACADEMY_BED_OUTRO_TAIL_SEC = ACADEMY_BED_OUTRO_HOLD_SEC + ACADEMY_BED_OUTRO_FADE_SEC;
/** Ses kasedi bittikten sonra dip müzik fade-out + otomatik geçiş öncesi nefes payı. */
export const ACADEMY_OUTRO_BREATH_MS = 2_500;
export const ACADEMY_OUTRO_BREATH_SEC = ACADEMY_OUTRO_BREATH_MS / 1000;

const BED_OUTRO_LESSON_KEYS = ["01_office_ai-0", "01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"] as const;

export function academyBedOutroTailSec(lessonKey: string): number {
  return (BED_OUTRO_LESSON_KEYS as readonly string[]).includes(lessonKey.trim())
    ? ACADEMY_BED_OUTRO_TAIL_SEC
    : 0;
}

/** Oynatıcı kuyruğu — markalı outro veya en az 2.5 sn nefes payı. */
export function academyPlayerOutroTailSec(lessonKey: string): number {
  return Math.max(academyBedOutroTailSec(lessonKey), ACADEMY_OUTRO_BREATH_SEC);
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

/** CEBİNE KOY pekiştirme durağında -22 dB. Giriş 0–2 sn konuşmasız (nefes kazancı); konuşma 3 sn içinde -25 dB. */
export const ACADEMY_BED_LIFT_CUE_IDS = ["cue-07"] as const;

export function academyBedIsLiftCue(cueId: string | undefined): boolean {
  return cueId != null && (ACADEMY_BED_LIFT_CUE_IDS as readonly string[]).includes(cueId);
}

export function academyBedSpeechWindows(
  pieces: readonly AcademyBedSpeechWindow[],
): readonly AcademyBedSpeechWindow[] {
  return pieces.filter((piece) => piece.end > piece.start);
}

/** Konuşma 0’da başlıyorsa yatak sert açılmaz; 1.5 sn içinde dipe oturur. */
function engageBedFade(gain: number, fromStart: number, pieceStart: number, firstStart: number): number {
  if (pieceStart > 0.05 || firstStart > 0.05 || fromStart >= ACADEMY_BED_ENGAGE_SEC) {
    return gain;
  }
  return gain * smoothstep(0, ACADEMY_BED_ENGAGE_SEC, fromStart);
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

/** Nefes payı boyunca dip kazancı: mevcut → 0 (2.5 sn). */
export function academyOutroBreathFadeGain(intoBreathSec: number, fromGain: number): number {
  const from = Number.isFinite(fromGain) && fromGain > 0 ? fromGain : 0;
  if (!Number.isFinite(intoBreathSec) || intoBreathSec <= 0) {
    return from;
  }
  if (intoBreathSec >= ACADEMY_OUTRO_BREATH_SEC) {
    return 0;
  }
  return from * (1 - smoothstep(0, ACADEMY_OUTRO_BREATH_SEC, intoBreathSec));
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
  speechGain: number = ACADEMY_BED_SPEECH_GAIN,
): number {
  const windows = academyBedSpeechWindows(pieces);
  if (windows.length === 0) {
    return speechGain;
  }
  const t = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  const speaking = academyBedIsSpeech(t, windows);
  const last = windows[windows.length - 1]!;
  if (speaking) {
    const piece = windows.find((row) => t >= row.start && t < row.end);
    if (!piece) {
      return speechGain;
    }
    if (academyBedIsLiftCue(piece.cueId)) {
      return ACADEMY_BED_BREATH_GAIN;
    }
    if (piece.end === last.end && piece.start === last.start) {
      const liftFrom = Math.max(piece.start, piece.end - ACADEMY_BED_OUTRO_LIFT_SEC);
      if (t >= liftFrom) {
        const u = smoothstep(liftFrom, piece.end, t);
        return speechGain + (ACADEMY_BED_BREATH_GAIN - speechGain) * u;
      }
    }
    const fromStart = t - piece.start;
    if (fromStart < ACADEMY_BED_BREATH_MIN_SEC) {
      const u = smoothstep(0, ACADEMY_BED_BREATH_MIN_SEC, fromStart);
      const dipped = ACADEMY_BED_BREATH_GAIN + (speechGain - ACADEMY_BED_BREATH_GAIN) * u;
      return engageBedFade(dipped, fromStart, piece.start, windows[0]?.start ?? piece.start);
    }
    return speechGain;
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
  return speechGain + (ACADEMY_BED_BREATH_GAIN - speechGain) * u;
}

export function academyBedDuckLerp(currentGain: number, targetGain: number, deltaSec: number): number {
  const tau = ACADEMY_BED_DUCK_TAU_SEC;
  const dt = Number.isFinite(deltaSec) && deltaSec > 0 ? deltaSec : 0;
  const alpha = 1 - Math.exp(-dt / tau);
  return currentGain + (targetGain - currentGain) * clamp01(alpha);
}
