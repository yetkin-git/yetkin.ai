/** PCM mührü olan tek ders. Zaman çizelgesi bu dosyada durmaz. */
export const JUNIOR_PILOT_PLAYBACK_LESSON_KEY = "jr_06_mat-5" as const;

/**
 * Pilot grafik kapısı. Mat-5 mühürlü PCM saatidir.
 * Diğer anahtarlar aynı işlem sözlüğünün grafik saatidir; PCM mührü değildir.
 */
export const JUNIOR_PILOT_PLAYBACK_LESSON_KEYS = [
  JUNIOR_PILOT_PLAYBACK_LESSON_KEY,
  "jr_06_mat-6",
  "jr_06_mat-7",
  "jr_06_mat-11",
  "jr_06_mat-12",
  "jr_06_mat-13",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_mat-27",
  "jr_06_mat-30",
  "jr_06_mat-31",
  "jr_06_mat-32",
  "jr_06_mat-33",
  "jr_06_mat-34",
  "jr_06_mat-35",
  "jr_06_mat-36",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-21",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;

export type JuniorPilotPlaybackLessonKey = (typeof JUNIOR_PILOT_PLAYBACK_LESSON_KEYS)[number];

const GRAPH_CLOCK_LESSON_KEYS = [
  "jr_06_mat-6",
  "jr_06_mat-7",
  "jr_06_mat-11",
  "jr_06_mat-12",
  "jr_06_mat-13",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_mat-27",
  "jr_06_mat-30",
  "jr_06_mat-31",
  "jr_06_mat-32",
  "jr_06_mat-33",
  "jr_06_mat-34",
  "jr_06_mat-35",
  "jr_06_mat-36",
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
