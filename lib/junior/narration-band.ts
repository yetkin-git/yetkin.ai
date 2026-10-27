import { JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";

/**
 * Kilitli `packages/junior-content/timelines/jr_06_mat-6.timeline.json` ölçüsü.
 * Karakter saati bu sayının yerine geçmez. Kaset yeniden fırınlanmadan süre uzamaz.
 * Test, JSON `audio.durationMs` ile bu sabiti aynı tutar.
 */
export const JUNIOR_MAT6_LOCKED_NARRATION_MS = 142_204 as const;

export const JUNIOR_SHORT_NARRATION_LESSON_KEY = "jr_06_mat-6" as const;

export const JUNIOR_NARRATION_BELOW_BAND_FLAG = "below_narration_band" as const;

export type JuniorNarrationBandWarning = {
  flag: typeof JUNIOR_NARRATION_BELOW_BAND_FLAG;
  lessonKey: string;
  measuredDurationMs: number;
  minDurationMs: number;
  shortfallMs: number;
};

/**
 * Ölçülmüş kaset 180 sn bandının altındaysa uyarı döner.
 * Karakter saati bu uyarıyı kapatmaz. Oynatıcı kapanmaz; kart yeşil tam ders demez.
 */
export function juniorNarrationBandWarning(
  lessonKey: string,
  measuredDurationMs: number,
): JuniorNarrationBandWarning | null {
  const key = lessonKey.trim();
  if (!key) {
    return null;
  }
  if (!Number.isFinite(measuredDurationMs) || measuredDurationMs <= 0) {
    return null;
  }
  if (measuredDurationMs >= JUNIOR_NARRATION_MIN_MS) {
    return null;
  }
  return {
    flag: JUNIOR_NARRATION_BELOW_BAND_FLAG,
    lessonKey: key,
    measuredDurationMs,
    minDurationMs: JUNIOR_NARRATION_MIN_MS,
    shortfallMs: JUNIOR_NARRATION_MIN_MS - measuredDurationMs,
  };
}
