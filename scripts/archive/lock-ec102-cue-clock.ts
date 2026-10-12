/**
 * EC-102 rozetini bölüm başlığının tamamı yapar ve cue saatini Zephyr parça sınırına kilitler.
 *   npx tsx scripts/lock-ec102-cue-clock.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sealEcommerceCueClock, type AcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";

const ROOT = process.cwd();

type CueRow = {
  id: string;
  start: number;
  end: number;
  text: string;
  section: string;
  paragraphs?: string[];
};

function fullBadge(section: string): string {
  return section.replace(/\s+/gu, " ").trim().toLocaleUpperCase("tr-TR");
}

function main(): void {
  const badges: string[] = [];
  for (let lesson = 1; lesson <= 6; lesson += 1) {
    const key = `02_ecommerce_ai-${lesson}`;
    const cuePath = join(ROOT, "lib", "academy", "lesson-cues", `${key}.json`);
    const timingPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${key}.json`);
    const cues = JSON.parse(readFileSync(cuePath, "utf8")) as CueRow[];
    for (const cue of cues) {
      cue.text = fullBadge(cue.section);
      badges.push(cue.text);
    }
    const mp3Path = join(ROOT, "public", "media", "academy", "audio", "02_ecommerce_ai", `${key}.mp3`);
    const timings = JSON.parse(readFileSync(timingPath, "utf8")) as AcademySealedAudioTimings;
    const sealed = existsSync(mp3Path) ? sealEcommerceCueClock(cues, timings) : cues;
    if (!existsSync(mp3Path)) {
      process.stdout.write(`${key} saat korundu: yayın MP3 yok\n`);
    }
    writeFileSync(cuePath, `${JSON.stringify(sealed, null, 2)}\n`, "utf8");
    const last = sealed[sealed.length - 1];
    process.stdout.write(
      `${key} süre=${timings.durationSec} son=${last?.end} rozet=${sealed.length}\n`,
    );
    for (let index = 1; index < sealed.length; index += 1) {
      const previous = sealed[index - 1]!;
      const current = sealed[index]!;
      if (current.start < previous.end - 0.001) {
        throw new Error(`${key} iç içe saat: ${previous.id} ${previous.end} > ${current.id} ${current.start}`);
      }
    }
    if (!last || Math.abs(last.end - timings.durationSec) > 0.001) {
      throw new Error(`${key} son cue ses süresine kilitli değil`);
    }
  }
  const slidesPath = join(ROOT, "lib", "academy", "curricula", "ecommerce_ai", "cinema-slides.ts");
  let slides = readFileSync(slidesPath, "utf8");
  let index = 0;
  slides = slides.replace(/headline: ".*"/gu, () => {
    const badge = badges[index];
    index += 1;
    if (!badge) {
      throw new Error("Sinema başlığı cue rozetinden fazla");
    }
    return `headline: ${JSON.stringify(badge)}`;
  });
  if (index !== badges.length) {
    throw new Error(`Sinema başlığı ${index}, rozet ${badges.length}`);
  }
  writeFileSync(slidesPath, slides, "utf8");
  process.stdout.write(`sinema başlık ${index}\n`);
}

main();
