import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Kilitli akustik timeline'ın konuşulan kaseti.
 * Senaryo birleşimi çizim, numaralı özet ve mühür cümlesi ekleyebilir.
 * Çocuğun dinlediği ve altyazıda gördüğü yazı cue metnidir.
 * Grafik saati (timeline JSON'u olmayan ders) bu kasete girmez.
 */

export function collapseJuniorSpeech(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function juniorCueCassette(cues: readonly { text: string }[]): string {
  return collapseJuniorSpeech(cues.map((cue) => collapseJuniorSpeech(cue.text)).join(" "));
}

type TimelineCueFile = {
  lessonKey?: string;
  production?: { status?: string; readiness?: string };
  cues?: { text?: string }[];
};

export function readLockedJuniorCueCassette(lessonKey: string): string | null {
  const key = lessonKey.trim();
  if (!/^jr_06_[a-z0-9_]+-\d+$/u.test(key)) {
    return null;
  }
  const path = join(process.cwd(), "packages", "junior-content", "timelines", `${key}.timeline.json`);
  if (!existsSync(path)) {
    return null;
  }
  const timeline = JSON.parse(readFileSync(path, "utf8")) as TimelineCueFile;
  if (timeline.lessonKey !== key) {
    return null;
  }
  if (timeline.production?.status !== "locked" || timeline.production.readiness !== "ready") {
    return null;
  }
  const cues = (timeline.cues ?? []).flatMap((cue) => {
    const text = cue.text?.trim() ?? "";
    return text.length > 0 ? [{ text }] : [];
  });
  if (cues.length === 0) {
    return null;
  }
  return juniorCueCassette(cues);
}
