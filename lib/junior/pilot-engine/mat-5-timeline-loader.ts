import timelineJson from "@/packages/junior-content/timelines/jr_06_mat-1.timeline.json";
import mat6TimelineJson from "@/packages/junior-content/timelines/jr_06_mat-2.timeline.json";
import {
  JR_06_MAT_1_PRODUCTION,
  JR_06_MAT_2_PRODUCTION,
  JUNIOR_PILOT_PLAYBACK_LESSON_KEY,
} from "@/lib/junior/pilot-engine/playback-key";
import { readAcousticTimeline } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * Oynatıcı saati. Konuşma yazarı `mat-1.choreography.ts` dir.
 * Saat, tek istek fırınının PCM kaydıdır. Üretim durumu locked / ready.
 * Konuşma eşitliği `assertSealedPilotTimeline` ile `verify:junior-content` kapısındadır.
 * Taslak hece saati (`MAT_5_DRAFT_TIMELINE`) bu dosyayı okumaz.
 * Eski grafik modülleri oynatıcıya girmez. Mühür betiği `graph-timeline-fallback.ts` okur.
 */
const parsedMat5Timeline = timelineJsonSchema.parse(timelineJson);
if (
  parsedMat5Timeline.lessonKey !== JUNIOR_PILOT_PLAYBACK_LESSON_KEY ||
  parsedMat5Timeline.production?.status !== JR_06_MAT_1_PRODUCTION.status ||
  parsedMat5Timeline.production?.readiness !== JR_06_MAT_1_PRODUCTION.readiness
) {
  throw new Error("jr_06_mat-1 üretim durumu locked/ready değil.");
}
/** Canlı anahtar `jr_06_mat-1`. */
export const JR_06_MAT_1_TIMELINE: TimelineJSON = parsedMat5Timeline;
/** @deprecated Yanlış numara. `JR_06_MAT_1_TIMELINE` kullan. */
export const JR_06_MAT_5_TIMELINE = JR_06_MAT_1_TIMELINE;

/**
 * `jr_06_mat-2` oynatıcı saati. Konuşma yazarı `mat-6.choreography.ts` dir.
 * Saat, tek istek fırınının PCM kaydıdır. Üretim durumu locked / ready.
 */
const parsedMat6Timeline = timelineJsonSchema.parse(mat6TimelineJson);
if (
  parsedMat6Timeline.lessonKey !== "jr_06_mat-2" ||
  parsedMat6Timeline.production?.status !== JR_06_MAT_2_PRODUCTION.status ||
  parsedMat6Timeline.production?.readiness !== JR_06_MAT_2_PRODUCTION.readiness
) {
  throw new Error("jr_06_mat-2 üretim durumu locked/ready değil.");
}
/** Canlı anahtar `jr_06_mat-2`. */
export const JR_06_MAT_2_TIMELINE: TimelineJSON = parsedMat6Timeline;
/** @deprecated Yanlış numara. `JR_06_MAT_2_TIMELINE` kullan. */
export const JR_06_MAT_6_TIMELINE = JR_06_MAT_2_TIMELINE;

/**
 * Kilitli kaset. `jr_06_mat-1` ve `jr_06_mat-2` statik JSON'dur.
 * Diğer dersler kayıtlı akustik okuyucunun kilitli dosyasıdır.
 * Okuyucu yoksa grafik saate düşülmez.
 */
export function getPilotTimelineForLesson(lessonKey: string): TimelineJSON | null {
  if (lessonKey === JUNIOR_PILOT_PLAYBACK_LESSON_KEY) {
    return JR_06_MAT_1_TIMELINE;
  }
  if (lessonKey === "jr_06_mat-2") {
    return JR_06_MAT_2_TIMELINE;
  }
  return readAcousticTimeline(lessonKey);
}

/**
 * Sunucu bileşeni (`app/junior/ders/[lessonKey]/page.tsx`) için timeline yükleyici.
 * Yalnız kilitli kaseti çözer. Eski grafik modülü bu yolda import edilmez.
 */
export async function loadPilotTimelineForLesson(lessonKey: string): Promise<TimelineJSON | null> {
  return getPilotTimelineForLesson(lessonKey.trim());
}
