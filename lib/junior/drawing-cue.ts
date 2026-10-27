import {
  isJuniorPilotPlaybackLesson,
} from "@/lib/junior/pilot-engine/playback-key";

/** Anlatının çizim daveti. Ekranda sahne yoksa cümle üretilmez. */
export const JUNIOR_DRAW_CUE = "Hadi şimdi ekrandaki çizime birlikte bakalım!";

/**
 * Özet tahtasında kalan dersler bu kümeye girmez.
 * Grafik saat, PCM çifti, seçmeli motif ve bağlanan dört vektör sahnesi girer.
 */
const BOUND_VECTOR_LESSONS = new Set(["jr_06_mat-26", "jr_06_fen-24"]);

const ELECTIVE_DRAWING = /^jr_06_(?:ing|alm|fra|siyer|kod|arp)-\d+$/u;

export function juniorLessonShowsDrawing(lessonKey: string): boolean {
  const key = lessonKey.trim();
  if (ELECTIVE_DRAWING.test(key)) {
    return true;
  }
  if (isJuniorPilotPlaybackLesson(key) || BOUND_VECTOR_LESSONS.has(key)) {
    return true;
  }
  return false;
}

export function juniorDrawCue(lessonKey: string): string | null {
  return juniorLessonShowsDrawing(lessonKey) ? JUNIOR_DRAW_CUE : null;
}
