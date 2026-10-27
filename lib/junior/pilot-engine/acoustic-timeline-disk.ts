/**
 * Node disk okuyucusu. İstemci bileşenleri bu dosyayı import etmez.
 * Kayıt, modül yüklenince bir kez yapılır.
 * Yalnız `production.status = locked` ve `readiness = ready` dosyası oynatıcıya girer.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { registerAcousticTimelineReader } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

const LESSON_KEY = /^jr_06_[a-z0-9_]+-\d+$/u;

export function readAcousticTimelineFile(lessonKey: string): TimelineJSON | null {
  const key = lessonKey.trim();
  if (!LESSON_KEY.test(key)) {
    return null;
  }
  const path = join(process.cwd(), "packages", "junior-content", "timelines", `${key}.timeline.json`);
  if (!existsSync(path)) {
    return null;
  }
  const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
  if (timeline.lessonKey !== key) {
    throw new Error(`${key} timeline dosyası başka dersi taşıyor.`);
  }
  if (timeline.production?.status !== "locked" || timeline.production.readiness !== "ready") {
    return null;
  }
  return timeline;
}

registerAcousticTimelineReader(readAcousticTimelineFile);
