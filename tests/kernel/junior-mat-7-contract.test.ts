import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { NumberOpsScene } from "@/components/junior/player/math-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type SceneGraphState, type TimedNumber } from "@/lib/junior/pilot-engine/state-reducer";

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

function pilot() {
  const playback = resolveJuniorPlayback("jr_06_mat-7");
  expect(playback.engine).toBe("pilot");
  if (playback.engine !== "pilot") {
    throw new Error("jr_06_mat-7 pilot kapısında değil.");
  }
  return playback.timeline;
}

describe("jr_06_mat-7 ortak bölen sözleşmesi", () => {
  it("not kartının her cümlesi grafik transkriptindedir", () => {
    const example = juniorBookletCopy("jr_06_mat-7").example;
    const film = pilot().cues.map((cue) => cue.text).join(" ");
    const sentences = bookletSentences(example);
    expect(sentences.length).toBeGreaterThan(3);
    for (const sentence of sentences) {
      expect(film, sentence).toContain(sentence);
    }
  });

  it("8, 12, EBOB 4 ve EKOK 24 grafik parametresidir ve kelime saatine kilitlidir", () => {
    const timeline = pilot();
    const cue = timeline.cues.find((row) =>
      row.keyframes.some((keyframe) => keyframe.op === "SHOW_COMMON_DIVISOR"),
    );
    expect(cue).toBeDefined();
    const frame = cue!.keyframes.find((keyframe) => keyframe.op === "SHOW_COMMON_DIVISOR");
    expect(frame).toBeDefined();
    const params = frame!.params as {
      left: number;
      right: number;
      gcd: number;
      lcm: number;
      leftDivisors: number[];
      marks: TimedNumber[];
    };
    expect(params.left).toBe(8);
    expect(params.right).toBe(12);
    expect(params.gcd).toBe(4);
    expect(params.lcm).toBe(24);
    expect(params.leftDivisors).toEqual([1, 2, 4, 8]);
    expect(params.marks.length).toBeGreaterThan(8);

    const words = cue!.words ?? [];
    for (const mark of params.marks) {
      const word = words.find((row) => row.startMs === mark.atMs);
      expect(word, `${mark.slot} ${mark.value}`).toBeDefined();
      if (mark.token) {
        expect(wordStem(word!.word)).toBe(mark.token);
      } else {
        expect(bareSpokenInteger(word!.word)).toBe(mark.value);
      }
    }

    const atFrame = reduceSceneState(timeline, frame!.atMs);
    expect(atFrame.commonDivisor.visible).toBe(true);
    expect(atFrame.commonDivisor.left).toBe(8);
    expect(atFrame.commonDivisor.right).toBe(12);
    expect(atFrame.commonDivisor.gcd).toBe(4);
    expect(atFrame.commonDivisor.lcm).toBe(24);
    expect(atFrame.commonDivisor.leftDivisors).toEqual([1, 2, 4, 8]);
    expect(atFrame.commonDivisor.rightDivisors).toEqual([1, 2, 3, 4, 6, 12]);
    expect(atFrame.commonDivisor.marks).toHaveLength(params.marks.length);

    const scaled = lockTimelineToExactAudioMs(timeline, timeline.audio.durationMs + 1_000);
    const scaledCue = scaled.cues.find((row) => row.id === cue!.id);
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_COMMON_DIVISOR")
      ?.params.marks as TimedNumber[];
    for (const mark of scaledMarks) {
      const word = scaledCue?.words?.find((row) => row.startMs === mark.atMs);
      expect(word).toBeDefined();
    }
  });

  it("sabit EBOB bloğu dersi beslemez; boş grafikte çizim yoktur", () => {
    const timeline = pilot();
    const early = reduceSceneState(timeline, 400);
    expect(early.commonDivisor.visible).toBe(false);
    expect(early.commonDivisor.gcd).toBe(0);
    const hidden = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: early, currentTimeMs: early.elapsedMs }),
    );
    expect(hidden).toContain('data-junior-graphic-op="none"');
    expect(hidden).not.toContain("çizim yok");
    expect(hidden).not.toContain("EBOB = 4");
    expect(hidden).not.toContain("EKOK = 24");

    const swapped: SceneGraphState = {
      ...early,
      layout: "common-divisor",
      commonDivisor: {
        visible: true,
        left: 9,
        right: 15,
        leftDivisors: [1, 3, 9],
        rightDivisors: [1, 3, 5, 15],
        commonDivisors: [1, 3],
        gcd: 3,
        leftMultiples: [9, 18],
        rightMultiples: [15, 30],
        lcm: 45,
        marks: [
          { slot: "gcd", value: 3, atMs: 0 },
          { slot: "lcm", value: 45, atMs: 0 },
          { slot: "left-div", value: 1, atMs: 0 },
          { slot: "left-div", value: 3, atMs: 0 },
          { slot: "left-div", value: 9, atMs: 0 },
        ],
      },
    };
    const other = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: swapped, currentTimeMs: 10 }),
    );
    expect(other).toContain("EBOB = 3");
    expect(other).toContain("EKOK = 45");
    expect(other).not.toContain("EBOB = 4");
    expect(other).not.toContain("EKOK = 24");

    const legacy = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 4,
        caption: "8 ve 12 için en büyük ortak bölen 4'tür.",
        captionTrail: ["Ortak bölen iki sayıyı birden böler. EBOB ve EKOK ayrıdır."],
      }),
    );
    expect(legacy).toContain("çizim yok");
    expect(legacy).not.toContain("EBOB = 4");
    expect(legacy).not.toContain("EKOK = 24");
  });
});
