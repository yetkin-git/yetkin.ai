/** Sınav oturumu sicili — havuz 30–50, çekim 10, süre duvar saati. */

export const ACADEMY_EXAM_DRAW_COUNT = 10 as const;
export const ACADEMY_EXAM_DURATION_MS = 30 * 60 * 1_000;
export const ACADEMY_EXAM_POOL_MIN = 30 as const;
export const ACADEMY_EXAM_POOL_MAX = 50 as const;
/** Gönderim ağ gecikmesi — süre dolduktan sonra kısa lütuf. */
export const ACADEMY_EXAM_SUBMIT_GRACE_MS = 15_000;

export function formatAcademyExamRemaining(ms: number): { mm: string; ss: string } {
  const clamped = Math.max(0, Math.trunc(ms));
  const totalSec = Math.ceil(clamped / 1_000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return {
    mm: String(minutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
  };
}
