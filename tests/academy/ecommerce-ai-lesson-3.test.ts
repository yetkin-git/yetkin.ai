import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { ecommerceAiSections } from "@/lib/academy/curricula/02_ecommerce_ai";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  academyTeleprompterActiveLineIndex,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";

describe("02_ecommerce_ai-3 nihai iskelet", () => {
  it("karaoke ve ses mührü boştur", () => {
    expect(hasAcademyLessonCues("02_ecommerce_ai-3")).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", "02_ecommerce_ai-3")).toBe(true);
    expect(academyCitizenPlayerLayer("02_ecommerce_ai", "02_ecommerce_ai-3").kind).toBe("article+karaoke");
    const lesson = ecommerceAiSections.find((section) => section.lessonKey === "02_ecommerce_ai-3");
    expect(lesson?.contentMarkdown).toContain("Kendine çok iyi bak.");
    expect(lesson?.contentMarkdown).not.toContain("Kendinize");
    expect(lesson?.contentMarkdown).not.toContain("### ");
  });

  it("23. saniyede açılış cümlesi değil, o anın mühürlü cümlesi aktiftir", () => {
    const timings = loadAcademySealedAudioTimings("02_ecommerce_ai-3");
    expect(timings?.durationSec).toBe(577.536);
    const strip = loadAcademyKaraokeStrip("02_ecommerce_ai-3");
    expect(strip.length).toBe(timings?.pieces.length);
    expect(strip[0]).toMatchObject({ text: "Merhaba, ben Kaan.", start: 0, end: 1.379 });
    expect(strip[1]).toMatchObject({
      text: "Yeni bir dersle yine beraberiz!",
      start: 1.781,
      end: 3.557,
    });
    expect(strip.some((line) => line.text === "Merhaba, ben Kaan. Yeni bir dersle yine beraberiz!")).toBe(
      false,
    );

    const at23 = 23;
    const index = academyTeleprompterActiveLineIndex(strip, at23);
    expect(index).not.toBeNull();
    const line = strip[index!]!;
    expect(line.start).toBeLessThanOrEqual(at23);
    expect(line.end).toBeGreaterThan(at23);
    expect(line.end - line.start).toBeLessThan(30);
    expect(line.text).toBe(
      "Bunu alıcı ürünün kendi rengini ve kendi şeklini görsün diye yaptık, bir de yanlış fotoğraf yüzünden geri dönen iadenin önüne geçelim diye.",
    );
    expect(line.start).toBe(20.772);
    expect(line.end).toBe(29.147);
    expect(line.text.startsWith("Merhaba, ben Kaan")).toBe(false);

    const piece = timings!.pieces[index!]!;
    expect(piece.start).toBe(line.start);
    expect(piece.end).toBe(line.end);
  });

  it("uzun açılış penceresi ile cümle penceresi çakışırsa 23. saniyede dar olan kalır", () => {
    const lines = [
      { start: 0, end: 45.317 },
      { start: 20.772, end: 29.147 },
    ];
    expect(academyTeleprompterActiveLineIndex(lines, 23)).toBe(1);
    expect(academyTeleprompterActiveLineIndex(lines, 1)).toBe(0);
  });
});
