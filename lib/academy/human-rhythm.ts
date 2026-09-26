/**
 * İnsani anlatım ritmi — üst süre tavanı yoktur.
 * Konuşma hızı `ACADEMY_INSTRUCTOR_SPEECH_RATE` (0.93 — doğal temponun %7 yavaşı).
 * Cümle ve paragraf nefesi 0.4 sn. Teknik kural / örnek geçişi 1.5–2.0 sn bandının ortasıdır.
 * Slayt değişince görsel, yeni cümleden 1.5 sn önce açılır.
 */

/** Cümle ve paragraf arası nefes. Kural ve slayt geçişi bunu ezer. */
export const ACADEMY_TTS_BREATH_PAUSE_SEC = 0.4;

/** Teknik kural ve örnek geçişi — 1.5–2.0 sn bandının ortası. */
export const ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MIN_SEC = 1.5;
export const ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MAX_SEC = 2;
export const ACADEMY_TTS_RULE_EXAMPLE_PAUSE_SEC =
  (ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MIN_SEC + ACADEMY_TTS_RULE_EXAMPLE_PAUSE_MAX_SEC) / 2;

/** Ekran görseli değişince, yeni cümle başlamadan önce bakma payı. */
export const ACADEMY_TTS_VISUAL_HOLD_SEC = 1.5;

export type AcademyBakeChunkGap = {
  /** Dilimler arasına konan sessizlik. */
  pauseSec: number;
  /**
   * Sonraki slayt, konuşmadan bu kadar önce açılır.
   * Cue saati parça başından bu kadar geri çekilir.
   */
  visualLeadSec: number;
};

export function academyBakeChunkGap(input: {
  prevCueId: string;
  nextCueId: string;
  prevParagraphIndex: number;
  nextParagraphIndex: number;
  breathPauseSec?: number;
}): AcademyBakeChunkGap {
  const breath = input.breathPauseSec ?? ACADEMY_TTS_BREATH_PAUSE_SEC;
  const newCue = input.prevCueId !== input.nextCueId;
  const newParagraph = newCue || input.prevParagraphIndex !== input.nextParagraphIndex;
  let pauseSec = breath;
  if (newParagraph) {
    pauseSec = Math.max(pauseSec, ACADEMY_TTS_RULE_EXAMPLE_PAUSE_SEC);
  }
  if (newCue) {
    pauseSec = Math.max(pauseSec, ACADEMY_TTS_VISUAL_HOLD_SEC);
  }
  return {
    pauseSec,
    visualLeadSec: newCue ? ACADEMY_TTS_VISUAL_HOLD_SEC : 0,
  };
}
