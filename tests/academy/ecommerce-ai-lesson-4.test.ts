import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";

describe("02_ecommerce_ai-4 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-4")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-4")).toBe(true);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-4").kind).toBe("article+karaoke");
  });

  it("cümle saati Kaan dalgasına kilitlidir ve marka ekranda durur", () => {
    const timings = loadAcademySealedAudioTimings("02_ecommerce_ai-4");
    expect(timings?.durationSec).toBe(811.728);
    expect(timings?.cacheV).toBe(811728);
    expect(timings?.pauseSec).toBe(0.4);
    const strip = loadAcademyKaraokeStrip("02_ecommerce_ai-4");
    expect(strip.length).toBe(253);
    expect(strip.length).toBe(timings?.pieces.length);
    expect(strip[0]).toMatchObject({ text: "Merhaba, ben Kaan.", start: 0, end: 1.521 });
    expect(strip[1]).toMatchObject({
      text: "Şimdi bugün kasaya beraber bakalım.",
      start: 2.151,
      end: 4.051,
    });
    expect(strip.find((line) => line.text.includes("PttAVM"))).toMatchObject({
      text: "Pazaryerin Trendyol da olur, Hepsiburada da, Amazon da, N11 de, ÇiçekSepeti de, PttAVM de, Getir de, Pazarama da.",
      start: 65.92,
      end: 74.475,
    });
    expect(strip.some((line) => /Pe te te|En on bir|Piti avm|Es i o/u.test(line.text))).toBe(false);
    expect(strip.at(-1)).toMatchObject({ text: "Selamlar.", start: 811.03, end: 811.728 });
    const cues = loadAcademyLessonCues("02_ecommerce_ai-4");
    expect(cues.at(-1)?.end).toBe(811.728);
    for (let index = 1; index < strip.length; index += 1) {
      expect(strip[index]!.start).toBeGreaterThanOrEqual(strip[index - 1]!.end);
    }
  });
});
