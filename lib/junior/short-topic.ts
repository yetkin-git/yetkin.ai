import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";

/** 180 sn altı kilitli kaset. Kart bu cümleyi basar; mühür boşluğu açılmaz. */
export const JUNIOR_SHORT_TOPIC_LABEL = "Kısa Konu / Özet Ders" as const;

const LESSON_KEY = /^jr_06_[a-z0-9_]+-\d+$/u;
const durationCache = new Map<string, number | null>();

/**
 * Kilitli timeline başlığındaki `audio.durationMs`.
 * Dosyanın tamamı okunmaz. Kayıt yoksa `null`.
 */
export function juniorLockedCassetteDurationMs(lessonKey: string): number | null {
  const key = lessonKey.trim();
  const cached = durationCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (!LESSON_KEY.test(key)) {
    durationCache.set(key, null);
    return null;
  }
  const path = join(process.cwd(), "packages", "junior-content", "timelines", `${key}.timeline.json`);
  if (!existsSync(path)) {
    durationCache.set(key, null);
    return null;
  }
  const head = readFileSync(path).subarray(0, 1200).toString("utf8");
  const match = /"durationMs"\s*:\s*(\d+)/u.exec(head);
  const durationMs = match ? Number(match[1]) : null;
  const value = durationMs !== null && Number.isInteger(durationMs) && durationMs > 0 ? durationMs : null;
  durationCache.set(key, value);
  return value;
}

/** Ölçülen kaset mühür tabanının altındaysa vitrin etiketi. */
export function juniorShortTopicLabel(lessonKey: string): string | null {
  const durationMs = juniorLockedCassetteDurationMs(lessonKey);
  if (durationMs === null || durationMs >= JUNIOR_NARRATION_MIN_MS) {
    return null;
  }
  return JUNIOR_SHORT_TOPIC_LABEL;
}
