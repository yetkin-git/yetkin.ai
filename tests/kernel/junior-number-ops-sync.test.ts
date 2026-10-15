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
    juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), lesson?.steps.length ?? 12),
    320_020,
  );

  function trailUntil(needle: string): string[] {
    const found = timeline.pieces.findIndex((piece) => piece.text.includes(needle));
    expect(found).toBeGreaterThanOrEqual(0);
    return timeline.pieces.slice(0, found + 1).map((piece) => piece.text);
  }

  it("24 sayısını ele alalım cümlesi tek başına problem kipidir; iz 24'ün çarpanlarında kalır", () => {
    expect(detectNumberOpsMode("24 sayısını ele alalım.")).toBeNull();
    const trail = trailUntil("24 sayısını ele alalım");
    expect(stickyNumberOpsMode(trail)).toBe("factor");
    expect(numberOpsFactorSubject(trail)).toBe(24);
    expect(positiveFactors(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
    const html = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 5,
        caption: "24 sayısını ele alalım.",
        captionTrail: trail,
      }),
    );
    expect(html).not.toContain("4 × 7 = 28");
    expect(html).not.toContain("4 sıra × 7 kitap");
    expect(html).toContain("24 sayısının çarpanları kalansız böler.");
    for (const factor of [1, 2, 3, 4, 6, 8, 12, 24]) {
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
    const listed = trailUntil("24'ün çarpanları");
    expect(stickyNumberOpsMode(listed)).toBe("factor");
    expect(numberOpsFactorSubject(listed)).toBe(24);
    const equation = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 5,
        caption: "Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür: 2 çarpı 12, 24 eder.",
        captionTrail: trailUntil("2 çarpı 12, 24"),
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
    expect(stepSix?.text).toContain("24 sayısını");
    expect(stepSix && stepSix.startMs).toBeGreaterThan(80_000);
    expect(stepSix && stepSix.startMs).toBeLessThan(100_000);

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
      if (at >= (stepSix?.startMs ?? 0) && piece.text.includes("24'ün çarpanları")) {
        expect(numberOpsFactorSubject(trail)).toBe(24);
        expect(positiveFactors(numberOpsFactorSubject(trail))).toEqual([1, 2, 3, 4, 6, 8, 12, 24]);
      }
    }

    expect(numberOpsFactorSubject(trailUntil("6'nın çarpanları"))).toBe(6);
    expect(numberOpsFactorSubject(trailUntil("24 kişiyi"))).toBe(24);
    expect(numberOpsFactorSubject(trailUntil("12'nin çarpanıdır"))).toBe(12);

    const recap = lesson?.steps.slice(9) ?? [];
    expect(recap[0]).toContain("Çarpan, sayıyı kalansız böler");
    expect(recap[1]).toContain("2, 5 ve 10 için son rakama bakılır");
    expect(recap[2]).toContain("24, 2'ye ve 3'e bölünür");
  });
});
