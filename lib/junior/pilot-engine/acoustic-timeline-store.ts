/**
 * Akustik timeline okuyucusu.
 * JSON dosyaları bu modülde statik import edilmez. İstemci paketi bütün ders saatlerini taşımaz.
 * Sunucu disk okuyucusunu kaydeder. Oynatıcı, sunucunun verdiği prop ile saati kullanır.
 */

import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

type AcousticTimelineReader = (lessonKey: string) => TimelineJSON | null;

let reader: AcousticTimelineReader | null = null;

export function registerAcousticTimelineReader(next: AcousticTimelineReader): void {
  reader = next;
}

export function isLockedTimeline(timeline: TimelineJSON | null | undefined): timeline is TimelineJSON {
  return timeline?.production?.status === "locked" && timeline.production.readiness === "ready";
}

/** Kayıtlı okuyucu yoksa veya dosya kilitli değilse `null`. */
export function readAcousticTimeline(lessonKey: string): TimelineJSON | null {
  const timeline = reader?.(lessonKey.trim()) ?? null;
  if (!isLockedTimeline(timeline) || timeline.lessonKey !== lessonKey.trim()) {
    return null;
  }
  return timeline;
}
