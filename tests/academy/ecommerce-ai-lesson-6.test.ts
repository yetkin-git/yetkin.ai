import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("02_ecommerce_ai-6 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-6")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-6")).toBe(true);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-6").kind).toBe("article+karaoke");
  });

  it("cümle saati Kaan dalgasına kilitlidir ve marka ekranda durur", () => {
    const timings = loadAcademySealedAudioTimings("02_ecommerce_ai-6");
    expect(timings?.durationSec).toBe(1006.012);
    expect(timings?.cacheV).toBe(1006012);
    expect(timings?.pauseSec).toBe(0.4);
    const strip = loadAcademyKaraokeStrip("02_ecommerce_ai-6");
    expect(strip.length).toBe(368);
    expect(strip.length).toBe(timings?.pieces.length);
    expect(strip[0]).toMatchObject({ text: "Merhaba, ben Kaan.", start: 0, end: 1.577 });
    expect(strip[1]).toMatchObject({
      text: "Bugün bu modülün son dersindeyiz.",
      start: 2.582,
      end: 4.379,
    });
    expect(strip.find((line) => line.text.includes("PttAVM"))).toMatchObject({
      text: "Pazaryerin Trendyol da olur, Hepsiburada da, Amazon da, N11 de, ÇiçekSepeti de, PttAVM de, Getir de, Pazarama da.",
      start: 148.372,
      end: 157.218,
    });
    expect(strip.some((line) => /Pe te te|En on bir|Piti avm|Es i o/u.test(line.text))).toBe(false);
    expect(strip.find((line) => line.text.includes("Arama Motoru Optimizasyonu (SEO)'ydu"))).toMatchObject({
      start: 814.424,
      end: 818.526,
    });
    expect(strip.at(-1)).toMatchObject({ text: "Selamlar.", start: 1005.26, end: 1006.012 });
    const cues = loadAcademyLessonCues("02_ecommerce_ai-6");
    expect(cues.at(-1)?.end).toBe(1006.012);
    for (let index = 1; index < strip.length; index += 1) {
      expect(strip[index]!.start).toBeGreaterThanOrEqual(strip[index - 1]!.end);
    }
  });
});
