import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { reduceSceneState as packageReduce } from "@yetkin/junior-graphic/runtime";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { FractionBarsScene, FractionPieScene, NumberLineScene } from "@/components/junior/player/math-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type TimedNumber } from "@/lib/junior/pilot-engine/state-reducer";
import type { TimelineJSON, VisualKeyframe } from "@/lib/junior/pilot-engine/schema";

const FRACTION_KEYS = ["jr_06_mat-11", "jr_06_mat-12", "jr_06_mat-13"] as const;

function bookletSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12);
}

function wordStem(word: string): string {
  return word.replace(/[.!?…,;:]+$/u, "");
}

function bareSpokenInteger(word: string): number | null {
  const match = /^(\d+)[,.!?…]*$/u.exec(word);
  return match ? Number(match[1]) : null;
}

function pilot(lessonKey: string): TimelineJSON {
  const playback = resolveJuniorPlayback(lessonKey);
  expect(playback.engine).toBe("pilot");
  if (playback.engine !== "pilot") {
    throw new Error(`${lessonKey} pilot kapısında değil.`);
  }
  return playback.timeline;
}

function frameOf(timeline: TimelineJSON, op: string): { cueText: string; words: TimelineJSON["cues"][number]["words"]; frame: VisualKeyframe } {
  const cue = timeline.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === op));
  expect(cue).toBeDefined();
  const frame = cue!.keyframes.find((keyframe) => keyframe.op === op);
  expect(frame).toBeDefined();
  return { cueText: cue!.text, words: cue!.words, frame: frame! };
}

function expectMarksLocked(
  words: ReadonlyArray<{ word: string; startMs: number }> | undefined,
  marks: readonly TimedNumber[],
) {
  for (const mark of marks) {
    const word = words?.find((row) => row.startMs === mark.atMs);
    expect(word, `${mark.slot} ${mark.value}`).toBeDefined();
    if (mark.token) {
      expect(wordStem(word!.word)).toBe(mark.token);
    } else {
      expect(bareSpokenInteger(word!.word)).toBe(mark.value);
    }
  }
}

function draw(state: ReturnType<typeof reduceSceneState>): string {
  return renderToStaticMarkup(
    createElement(GraphicOpStage, { state, currentTimeMs: state.elapsedMs }),
  );
}

describe("kesir ve sayı doğrusu sözleşmesi", () => {
  it("not cümleleri grafik transkriptindedir", () => {
    for (const lessonKey of [...FRACTION_KEYS, "jr_06_mat-27"] as const) {
      const example = juniorBookletCopy(lessonKey).example;
      const film = pilot(lessonKey).cues.map((cue) => cue.text).join(" ");
      const sentences = bookletSentences(example);
      expect(sentences.length).toBeGreaterThan(2);
      for (const sentence of sentences) {
        expect(film, `${lessonKey} ${sentence}`).toContain(sentence);
      }
    }
    expect(resolveJuniorPlayback("jr_06_mat-14").engine).toBe("sealed");
    expect(resolveJuniorPlayback("jr_06_mat-18").engine).toBe("sealed");
  });

  it("aynı payda, denk kesir ve çarpma grafik parametresidir", () => {
    const same = frameOf(pilot("jr_06_mat-11"), "SHOW_FRACTION");
    const sameParams = same.frame.params as { resultNumerator: number; resultDenominator: number; parts: number; filled: number; marks: TimedNumber[] };
    expect(sameParams.resultNumerator).toBe(3);
    expect(sameParams.resultDenominator).toBe(4);
    expect(sameParams.parts).toBe(8);
    expect(sameParams.filled).toBe(3);
    expect(same.cueText).toContain("sabit kalır");
    expectMarksLocked(same.words, sameParams.marks);
    const sameState = reduceSceneState(pilot("jr_06_mat-11"), same.frame.atMs);
    expect(sameState.layout).toBe("fraction");
    expect(sameState.fraction.leftNumerator).toBe(1);
    expect(sameState.fraction.rightNumerator).toBe(2);
    expect(sameState.fraction.differenceNumerator).toBe(2);
    expect(packageReduce(pilot("jr_06_mat-11"), same.frame.atMs).fraction).toEqual(sameState.fraction);
    const sameDrawn = draw(sameState);
    expect(sameDrawn).toContain("sonuç 3/4");
    expect(sameDrawn).toContain("8 dilimde 3");
    expect(sameDrawn).toContain("sabit kalır");
    expect(sameDrawn).not.toContain("2/6");

    const equiv = frameOf(pilot("jr_06_mat-12"), "SHOW_FRACTION");
    const equivParams = equiv.frame.params as {
      equivalentNumerator: number;
      equivalentDenominator: number;
      resultNumerator: number;
      marks: TimedNumber[];
    };
    expect(equivParams.equivalentNumerator).toBe(2);
    expect(equivParams.equivalentDenominator).toBe(4);
    expect(equivParams.resultNumerator).toBe(3);
    expect(equiv.cueText).toContain("ortak payda");
    expectMarksLocked(equiv.words, equivParams.marks);
    const equivDrawn = draw(reduceSceneState(pilot("jr_06_mat-12"), equiv.frame.atMs));
    expect(equivDrawn).toContain("denk 2/4");
    expect(equivDrawn).toContain("sonuç 3/4");
    expect(equivDrawn).toContain("fark 1/4");
    expect(equivDrawn).not.toContain("3000");

    const product = frameOf(pilot("jr_06_mat-13"), "SHOW_FRACTION");
    const productParams = product.frame.params as { quotient: number; productNumerator: number; marks: TimedNumber[] };
    expect(productParams.productNumerator).toBe(6);
    expect(productParams.quotient).toBe(2);
    expect(product.cueText).toContain("ters çevirirsek");
    expectMarksLocked(product.words, productParams.marks);
    const productDrawn = draw(reduceSceneState(pilot("jr_06_mat-13"), product.frame.atMs));
    expect(productDrawn).toContain("sonuç 1/4");
    expect(productDrawn).toContain("çarpım 6/4");
    expect(productDrawn).toContain("sade 3/2");
    expect(productDrawn).toContain("bölüm 2");

    const scaled = lockTimelineToExactAudioMs(pilot("jr_06_mat-12"), pilot("jr_06_mat-12").audio.durationMs + 1_000);
    const scaledCue = scaled.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === "SHOW_FRACTION"));
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_FRACTION")?.params.marks as TimedNumber[];
    expectMarksLocked(scaledCue?.words, scaledMarks);
  });

  it("sayı doğrusu 250 cm, 3 km ve 40 mm değerini state'ten basar", () => {
    const line = frameOf(pilot("jr_06_mat-27"), "SHOW_NUMBER_LINE");
    const params = line.frame.params as { focus: number; focusLabel: string; relations: string[]; marks: TimedNumber[] };
    expect(params.focus).toBe(250);
    expect(params.focusLabel).toBe("250 cm = 2,5 m");
    expect(params.relations).toContain("3 km = 3000 m");
    expect(params.relations).toContain("40 mm = 4 cm");
    expectMarksLocked(line.words, params.marks);
    const state = reduceSceneState(pilot("jr_06_mat-27"), line.frame.atMs);
    expect(state.layout).toBe("number-line");
    expect(state.numberLine.focus).toBe(250);
    const drawn = draw(state);
    expect(drawn).toContain("250 cm = 2,5 m");
    expect(drawn).toContain("3 km = 3000 m");
    expect(drawn).toContain("40 mm = 4 cm");
    expect(drawn).not.toContain("3/4");
  });

  it("indirgeyici eksik payı tamamlamaz; eski sahne sayı basmaz", () => {
    const timeline = pilot("jr_06_mat-12");
    const early = reduceSceneState(timeline, 400);
    expect(early.fraction.visible).toBe(false);
    expect(draw(early)).toContain('data-junior-graphic-op="none"');
    expect(draw(early)).not.toContain("çizim yok");

    const partial: TimelineJSON = {
      ...timeline,
      cues: [
        {
          ...timeline.cues[0]!,
          keyframes: [{ atMs: 0, op: "SHOW_FRACTION", params: { leftNumerator: 1, leftDenominator: 2 } }],
        },
      ],
    };
    const onlyLeft = reduceSceneState(partial, 10);
    expect(onlyLeft.fraction.leftNumerator).toBe(1);
    expect(onlyLeft.fraction.leftDenominator).toBe(2);
    expect(onlyLeft.fraction.resultNumerator).toBe(0);
    expect(onlyLeft.fraction.equivalentNumerator).toBe(0);
    expect(draw(onlyLeft)).not.toContain("denk");

    const legacyPie = renderToStaticMarkup(
      createElement(FractionPieScene, { beat: 6, caption: "Bir bölü 2 çarpı bir bölü 2" }),
    );
    const legacyBars = renderToStaticMarkup(
      createElement(FractionBarsScene, { beat: 6, caption: "1/4 + 2/4" }),
    );
    const legacyLine = renderToStaticMarkup(
      createElement(NumberLineScene, { beat: 4, caption: "250 santimetre 2,5 metre" }),
    );
    expect(legacyPie).toContain("çizim yok");
    expect(legacyBars).toContain("çizim yok");
    expect(legacyLine).toContain("çizim yok");
    expect(legacyBars).not.toContain("Paydalar toplanmaz");
    expect(legacyLine).not.toContain("250 cm = 2 m 50 cm");
    expect(legacyPie).not.toContain("1/2");
  });
});
