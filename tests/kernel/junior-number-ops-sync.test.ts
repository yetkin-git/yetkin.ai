import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NumberOpsScene } from "@/components/junior/player/math-scenes";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import {
  juniorPlayerStepAnchors,
  juniorPlayerTimeline,
  scaleJuniorPlayerTimeline,
} from "@/lib/junior/player-clock";
import {
  detectDivisibilityBoard,
  detectNumberOpsMode,
  numberOpsFactorSubject,
  positiveFactors,
  spokenFactorProduct,
  stickyNumberOpsMode,
} from "@/lib/junior/scene-sync";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";

function pieceStartMs(
  collapsedStart: number,
  windows: readonly { startMs: number; endMs: number; noteStart: number; noteEnd: number }[],
): number {
  const at = collapsedStart + 1;
  const window = windows.find((row) => at >= row.noteStart && at < row.noteEnd) ?? windows[0];
  if (!window) {
    return 0;
  }
  const span = window.endMs - window.startMs;
  const ratio = (at - window.noteStart) / Math.max(1, window.noteEnd - window.noteStart);
  return window.startMs + ratio * span;
}

describe("jr_06_mat-5 çarpan sahnesi", () => {
  const lesson = juniorLessonByKey("jr_06_mat-5");
  const note = juniorLessonNote(lesson?.mebNote ?? "", lesson?.lifeUse ?? "");
  const timeline = scaleJuniorPlayerTimeline(
    juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), lesson?.steps?.length ?? 12),
    320_020,
  );

  function trailUntil(needle: string): string[] {
    const found = timeline.pieces.findIndex((piece) => piece.text.includes(needle));
    expect(found).toBeGreaterThanOrEqual(0);
    return timeline.pieces.slice(0, found + 1).map((piece) => piece.text);
  }

  it("24 sayısına bakalım cümlesi tek başına problem kipidir; iz 6'nın çarpanlarında kalır", () => {
    expect(detectNumberOpsMode("24 sayısına bakalım.")).toBeNull();
    const trail = trailUntil("24 sayısına bakalım");
    expect(stickyNumberOpsMode(trail)).toBe("factor");
    expect(numberOpsFactorSubject(trail)).toBe(6);
    expect(positiveFactors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    expect(note).not.toContain("2 çarpı 12");
    expect(note).not.toContain("48");
    const html = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 5,
        caption: "24 sayısına bakalım.",
        captionTrail: trail,
      }),
    );
    expect(html).not.toContain("4 × 7 = 28");
    expect(html).not.toContain("4 sıra × 7 kitap");
    expect(html).toContain("6 sayısının çarpanları kalansız böler.");
    for (const factor of [1, 2, 3, 6]) {
      expect(html).toContain(`>${factor}<`);
    }
  });

  it("adım 6 civarında konuşulan çarpımlar 24'e bağlanır", () => {
    expect(spokenFactorProduct("Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür: 2 çarpı 12, 24 eder.")).toEqual({
      left: 2,
      right: 12,
      product: 24,
    });
    expect(spokenFactorProduct("6 sayısı 3'e tam bölündüğü için 24 de 3'e tam bölünür: 3 çarpı 8, 24 eder.")).toEqual({
      left: 3,
      right: 8,
      product: 24,
    });
    expect(spokenFactorProduct("24'ün bir katı 48'dir çünkü 24 çarpı 2, 48 eder.")).toEqual({
      left: 24,
      right: 2,
      product: 48,
    });
    const listed = trailUntil("24 sayısı 2'ye tam bölünür");
    expect(stickyNumberOpsMode(listed)).toBe("factor");
    expect(numberOpsFactorSubject(listed)).toBe(6);
    const equation = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 5,
        caption: "Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür: 2 çarpı 12, 24 eder.",
        captionTrail: ["6'nın çarpanları 1, 2, 3 ve 6."],
      }),
    );
    expect(equation).toContain("2 × 12 = 24");
    expect(equation).not.toContain("4 × 7 = 28");
  });

  it("12 adımın sahne kipi ses cümlesiyle aynı konuda kalır", () => {
    expect(lesson?.steps).toHaveLength(12);
    const anchors = juniorPlayerStepAnchors(lesson?.steps ?? [], timeline);
    expect(anchors.map((anchor) => anchor.beat)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const stepSix = anchors.find((anchor) => anchor.beat === 5);
    expect(stepSix?.text).toContain("24 sayı");
    expect(stepSix && stepSix.startMs).toBeGreaterThan(80_000);
    expect(stepSix && stepSix.startMs).toBeLessThan(150_000);
    const stepTen = anchors.find((anchor) => anchor.beat === 9);
    expect(stepTen && stepTen.startMs).toBeGreaterThan(220_000);

    const trail: string[] = [];
    let sawFactor = false;
    for (const piece of timeline.pieces) {
      trail.push(piece.text);
      const mode = stickyNumberOpsMode(trail);
      if (mode === "factor") {
        sawFactor = true;
      }
      if (sawFactor) {
        expect(mode).toBe("factor");
      }
      const at = pieceStartMs(piece.collapsedStart, timeline.windows);
      if (at >= (stepSix?.startMs ?? 0) && piece.text.includes("2'ye tam bölünür")) {
        expect(stickyNumberOpsMode(trail)).toBe("factor");
      }
    }

    expect(numberOpsFactorSubject(trailUntil("6'nın çarpanları"))).toBe(6);
    expect(note).not.toContain("okul bahçesinde 24 kişiyi");
    expect(note).not.toContain("24 kişiyi");
    expect(numberOpsFactorSubject(["okul bahçesinde 24 kişiyi eşit sıraya diz."])).toBe(24);
    expect(numberOpsFactorSubject(trailUntil("12'nin çarpanıdır"))).toBe(12);

    const recap = lesson?.steps?.slice(9) ?? [];
    expect(recap[0]).toContain("Çarpan, sayıyı kalansız böler");
    expect(recap[1]).toContain("2, 5 ve 10 için son rakama bakılır");
    expect(recap[2]).toContain("24, 2'ye ve 3'e bölünür");
  });

  it("DivisibilityBoard 2, 5, 10 son basamak ve 3, 9 rakam toplama rozetlerini anlık yakar", () => {
    const trail = trailUntil("24 sayısına bakalım");
    expect(detectDivisibilityBoard("Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür.")).toMatchObject({
      kind: "last-digit",
      subject: 24,
      bracketed: "2[4]",
      badges: ["✓ 2'ye Bölünür", "✗ 5'e Bölünmez"],
    });
    expect(detectDivisibilityBoard("15 sayısının son rakamı 5 olduğu için 15 sayısı 5'e bölünür.")).toMatchObject({
      kind: "last-digit",
      subject: 15,
      bracketed: "1[5]",
      badges: ["✓ 5'e Bölünür"],
    });
    expect(detectDivisibilityBoard("30 sayısının sonu 0 olduğu için 30 hem 2'ye, hem 5'e, hem de 10'a tam bölünür!")).toMatchObject({
      kind: "last-digit",
      subject: 30,
      bracketed: "3[0]",
      badges: ["✓ 2'ye Bölünür", "✓ 5'e Bölünür", "✓ 10'a Bölünür"],
    });
    expect(detectDivisibilityBoard("3 kuralı rakamları topla der; 24 için 2 artı 4 eşittir 6 eder.")).toMatchObject({
      kind: "digit-sum",
      subject: 24,
      sumExpression: "2 + 4 = 6",
      badges: ["✓ 3'e Bölünür"],
    });

    const htmlLastDigit = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 6,
        caption: "15 sayısının son rakamı 5 olduğu için 15 sayısı 5'e bölünür.",
        captionTrail: trail,
      }),
    );
    expect(htmlLastDigit).toContain('data-junior-divisibility-board="last-digit"');
    expect(htmlLastDigit).toContain("2[4]");
    expect(htmlLastDigit).toContain("1[5]");
    expect(htmlLastDigit).toContain("3[0]");
    expect(htmlLastDigit).toContain("✓ 2&#x27;ye Bölünür");
    expect(htmlLastDigit).toContain("✓ 5&#x27;e Bölünür");

    const htmlDigitSum = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 7,
        caption: "3 kuralı rakamları topla der; 24 için 2 artı 4 eşittir 6 eder.",
        captionTrail: trail,
      }),
    );
    expect(htmlDigitSum).toContain('data-junior-divisibility-board="digit-sum"');
    expect(htmlDigitSum).toContain("2 + 4 = 6");
    expect(htmlDigitSum).toContain("✓ 3&#x27;e Bölünür");
  });
});
