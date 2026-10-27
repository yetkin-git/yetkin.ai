/** PCM mührü olan tek ders. Zaman çizelgesi bu dosyada durmaz. */
export const JUNIOR_PILOT_PLAYBACK_LESSON_KEY = "jr_06_mat-1" as const;

/**
 * CEO mührü. Oynatıcı dosyası bu durumu taşır.
 * Projeksiyon betiği kilitli dosyanın üzerine yazmaz.
 */
/** `jr_06_mat-1` CEO mührü. Ad, canlı ders anahtarıyla aynıdır. */
export const JR_06_MAT_1_PRODUCTION = {
  status: "locked",
  readiness: "ready",
} as const;

/**
 * @deprecated Yanlış numara. İçerik `jr_06_mat-1` dir. `JR_06_MAT_1_PRODUCTION` kullan.
 * Eski ad, bir sonraki fırının yanlış dersi kilitlememesi için yeni sabitle aynı nesnedir.
 */
export const JR_06_MAT_5_PRODUCTION = JR_06_MAT_1_PRODUCTION;

/** `jr_06_mat-2` CEO mührü. Oynatıcı, fırınlanmış zaman çizelgesindeki bu durumu okur. */
export const JR_06_MAT_2_PRODUCTION = {
  status: "locked",
  readiness: "ready",
} as const;

/**
 * @deprecated Yanlış numara. İçerik `jr_06_mat-2` dir. `JR_06_MAT_2_PRODUCTION` kullan.
 */
export const JR_06_MAT_6_PRODUCTION = JR_06_MAT_2_PRODUCTION;

/**
 * Pilot grafik kapısı. Mat-5 mühürlü PCM saatidir.
 * Diğer anahtarlar aynı işlem sözlüğünün grafik saatidir; PCM mührü değildir.
 */
export const JUNIOR_PILOT_PLAYBACK_LESSON_KEYS = [
  JUNIOR_PILOT_PLAYBACK_LESSON_KEY,
  "jr_06_mat-2",
  "jr_06_mat-3",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-19",
  "jr_06_mat-18",
  "jr_06_mat-6",
  "jr_06_mat-14",
  "jr_06_mat-15",
  "jr_06_mat-16",
  "jr_06_mat-17",
  "jr_06_mat-20",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-21",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;

export type JuniorPilotPlaybackLessonKey = (typeof JUNIOR_PILOT_PLAYBACK_LESSON_KEYS)[number];

const GRAPH_CLOCK_LESSON_KEYS = [
  "jr_06_mat-3",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-19",
  "jr_06_mat-18",
  "jr_06_mat-6",
  "jr_06_mat-14",
  "jr_06_mat-15",
  "jr_06_mat-16",
  "jr_06_mat-17",
  "jr_06_mat-20",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-21",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;

export function isJuniorPilotPlaybackLesson(
  lessonKey: string,
): lessonKey is JuniorPilotPlaybackLessonKey {
  return (JUNIOR_PILOT_PLAYBACK_LESSON_KEYS as readonly string[]).includes(lessonKey);
}

/** Ünlü tahmini saat. Oynatıcı, ses dosyası gelince bu saati ölçekler. */
export function isJuniorGraphClockLesson(lessonKey: string): boolean {
  return (GRAPH_CLOCK_LESSON_KEYS as readonly string[]).includes(lessonKey);
}
