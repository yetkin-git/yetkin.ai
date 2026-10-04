import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

describe("02_ecommerce_ai-5 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-5")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-5")).toBe(true);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-5").kind).toBe("article+karaoke");
  });

  it("cümle saati Kaan dalgasına kilitlidir ve marka ekranda durur", () => {
    const timings = loadAcademySealedAudioTimings("02_ecommerce_ai-5");
    expect(timings?.durationSec).toBe(819.052);
    expect(timings?.cacheV).toBe(819052);
    expect(timings?.pauseSec).toBe(0.4);
    const strip = loadAcademyKaraokeStrip("02_ecommerce_ai-5");
    expect(strip.length).toBe(282);
    expect(strip.length).toBe(timings?.pieces.length);
    expect(strip[0]).toMatchObject({ text: "Merhaba, ben Kaan.", start: 0, end: 1.954 });
    expect(strip[1]).toMatchObject({
      text: "Çayın yanındaysan bırak soğumasın.",
      start: 2.102,
      end: 4.186,
    });
    expect(strip.find((line) => line.text.includes("PttAVM"))).toMatchObject({
      text: "Pazaryerin Trendyol da olur, Hepsiburada da, Amazon da, N11 de, ÇiçekSepeti de, PttAVM de, Getir de, Pazarama da.",
      start: 539.857,
      end: 549.008,
    });
    expect(strip.some((line) => /Pe te te|En on bir|Piti avm|Es i o/u.test(line.text))).toBe(false);
    expect(strip.find((line) => line.text.includes("Arama Motoru Optimizasyonu (SEO)'dur"))).toMatchObject({
      start: 65.605,
      end: 69.309,
    });
    expect(strip.at(-1)).toMatchObject({ text: "Selamlar.", start: 818.288, end: 819.052 });
    const cues = loadAcademyLessonCues("02_ecommerce_ai-5");
    expect(cues.at(-1)?.end).toBe(819.052);
    for (let index = 1; index < strip.length; index += 1) {
      expect(strip[index]!.start).toBeGreaterThanOrEqual(strip[index - 1]!.end);
    }
  });
});
