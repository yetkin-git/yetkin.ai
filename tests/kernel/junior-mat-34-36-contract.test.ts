import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { CircleGeoScene } from "@/components/junior/player/math-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type SceneGraphState, type TimedNumber } from "@/lib/junior/pilot-engine/state-reducer";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

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

function circleFrame(timeline: TimelineJSON) {
  const cue = timeline.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === "SHOW_CIRCLE"));
  expect(cue).toBeDefined();
  const frame = cue!.keyframes.find((keyframe) => keyframe.op === "SHOW_CIRCLE");
  expect(frame).toBeDefined();
  return { cue: cue!, frame: frame! };
}

function expectMarksLocked(
  words: ReadonlyArray<{ word: string; startMs: number }>,
  marks: readonly TimedNumber[],
) {
  for (const mark of marks) {
    const word = words.find((row) => row.startMs === mark.atMs);
    expect(word, `${mark.slot} ${mark.value}`).toBeDefined();
    if (mark.token) {
      expect(wordStem(word!.word)).toBe(mark.token);
    } else {
      expect(bareSpokenInteger(word!.word)).toBe(mark.value);
    }
  }
}

describe("jr_06_mat-20/35/36 çember sözleşmesi", () => {
  it("üç dersin not cümleleri grafik transkriptindedir", () => {
    for (const lessonKey of ["jr_06_mat-20", "jr_06_mat-21", "jr_06_mat-22"] as const) {
      const example = juniorBookletCopy(lessonKey).example;
      const film = pilot(lessonKey).cues.map((cue) => cue.text).join(" ");
      const sentences = bookletSentences(example);
      expect(sentences.length).toBeGreaterThan(2);
      for (const sentence of sentences) {
        expect(film, `${lessonKey} ${sentence}`).toContain(sentence);
      }
      expect(resolveJuniorPlayback(lessonKey).engine).toBe("pilot");
    }
    expect(resolveJuniorPlayback("jr_06_mat-4").engine).toBe("pilot");
  });

  it("yarıçap, çap, pi ve 2πr çevre grafik parametresidir ve kelime saatine kilitlidir", () => {
    const timeline = pilot("jr_06_mat-20");
    const { cue, frame } = circleFrame(timeline);
    const params = frame.params as {
      radius: number;
      diameter: number;
      pi: number;
      circumference: number;
      unit: string;
      formula: string;
      relation: string;
      marks: TimedNumber[];
    };
    expect(params.radius).toBe(5);
    expect(params.diameter).toBe(10);
    expect(params.pi).toBe(3.14);
    expect(params.circumference).toBe(31.4);
    expect(params.unit).toBe("cm");
    expect(params.formula).toBe("2πr");
    expect(params.relation).toBe("R = 2r");
    expectMarksLocked(cue.words ?? [], params.marks);

    const atFrame = reduceSceneState(timeline, frame.atMs);
    expect(atFrame.layout).toBe("circle-measure");
    expect(atFrame.circle.visible).toBe(true);
    expect(atFrame.circle.radius).toBe(5);
    expect(atFrame.circle.diameter).toBe(10);
    expect(atFrame.circle.pi).toBe(3.14);
    expect(atFrame.circle.circumference).toBe(31.4);
    expect(atFrame.circle.formula).toBe("2πr");
    expect(atFrame.circle.relation).toBe("R = 2r");
    expect(atFrame.circle.unit).toBe("cm");

    const drawn = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: atFrame, currentTimeMs: atFrame.elapsedMs }),
    );
    expect(drawn).toContain("r = 5");
    expect(drawn).toContain("R = 2r");
    expect(drawn).toContain("R = 10");
    expect(drawn).toContain("π = 3,14");
    expect(drawn).toContain("2πr = 31,4 cm");

    const scaled = lockTimelineToExactAudioMs(timeline, timeline.audio.durationMs + 1_000);
    const scaledCue = scaled.cues.find((row) => row.id === cue.id);
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_CIRCLE")?.params
      .marks as TimedNumber[];
    for (const mark of scaledMarks) {
      const word = scaledCue?.words?.find((row) => row.startMs === mark.atMs);
      expect(word, mark.slot).toBeDefined();
    }
  });

  it("indirgeyici eksik çapı 2r diye doldurmaz; başka yarıçap 31,4 basmaz", () => {
    const timeline = pilot("jr_06_mat-20");
    const early = reduceSceneState(timeline, 400);
    expect(early.layout).toBe("circle-measure");
    expect(early.circle.visible).toBe(false);
    expect(early.circle.circumference).toBe(0);
    const hidden = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: early, currentTimeMs: early.elapsedMs }),
    );
    expect(hidden).toContain('data-junior-graphic-op="none"');
    expect(hidden).not.toContain("çizim yok");
    expect(hidden).not.toContain("31,4");
    expect(hidden).not.toContain("R = 2r");

    const partial: TimelineJSON = {
      ...timeline,
      cues: [
        {
          ...timeline.cues[0]!,
          keyframes: [
            {
              atMs: 0,
              op: "SHOW_CIRCLE",
              params: { radius: 5 },
            },
          ],
        },
      ],
    };
    const onlyRadius = reduceSceneState(partial, 10);
    expect(onlyRadius.circle.radius).toBe(5);
    expect(onlyRadius.circle.diameter).toBe(0);
    expect(onlyRadius.circle.pi).toBe(0);
    expect(onlyRadius.circle.circumference).toBe(0);
    expect(onlyRadius.circle.formula).toBe("");

    const swapped: SceneGraphState = {
      ...early,
      layout: "circle-measure",
      circle: {
        ...early.circle,
        visible: true,
        radius: 7,
        diameter: 14,
        pi: 3,
        circumference: 42,
        unit: "cm",
        formula: "2πr",
        relation: "R = 2r",
      },
    };
    const other = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: swapped, currentTimeMs: 10 }),
    );
    expect(other).toContain("r = 7");
    expect(other).toContain("2πr = 42 cm");
    expect(other).not.toContain("31,4");
    expect(other).not.toContain("r = 5");

    const legacy = renderToStaticMarkup(createElement(CircleGeoScene, { beat: 6 }));
    expect(legacy).toContain("çizim yok");
    expect(legacy).not.toContain("çap = 2r");
    expect(legacy).not.toContain("31,4");

    const stage = readFileSync(join(process.cwd(), "components/junior/pilot-player/GraphicOpStage.tsx"), "utf8");
    expect(stage).not.toContain("31.4");
    expect(stage).not.toContain("31,4");
    expect(stage).not.toContain("R = 2r");
    const legacySource = readFileSync(join(process.cwd(), "components/junior/player/math-scenes.tsx"), "utf8");
    expect(legacySource).not.toContain("çap = 2r");
  });

  it("tekerlek turu ve merkez açı kendi parametresini basar", () => {
    const wheel = pilot("jr_06_mat-21");
    const wheelHit = circleFrame(wheel);
    const wheelParams = wheelHit.frame.params as {
      radius: number;
      diameter: number;
      circumference: number;
      turns: number;
      distance: number;
      unit: string;
      marks: TimedNumber[];
    };
    expect(wheelParams.radius).toBe(1);
    expect(wheelParams.diameter).toBe(2);
    expect(wheelParams.circumference).toBe(6.28);
    expect(wheelParams.turns).toBe(2);
    expect(wheelParams.distance).toBe(12.56);
    expect(wheelParams.unit).toBe("m");
    expectMarksLocked(wheelHit.cue.words ?? [], wheelParams.marks);
    const wheelState = reduceSceneState(wheel, wheelHit.frame.atMs);
    const wheelDrawn = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: wheelState, currentTimeMs: wheelState.elapsedMs }),
    );
    expect(wheelDrawn).toContain("r = 1");
    expect(wheelDrawn).toContain("2πr = 6,28 m");
    expect(wheelDrawn).toContain("2 tur = 12,56 m");
    expect(wheelDrawn).not.toContain("31,4");

    const arc = pilot("jr_06_mat-22");
    const arcHit = circleFrame(arc);
    const arcParams = arcHit.frame.params as {
      centralAngle: number;
      arcMeasure: number;
      fullTurn: number;
      semicircle: number;
      slice: number;
      parts: number;
      marks: TimedNumber[];
    };
    expect(arcParams.centralAngle).toBe(90);
    expect(arcParams.arcMeasure).toBe(90);
    expect(arcParams.fullTurn).toBe(360);
    expect(arcParams.semicircle).toBe(180);
    expect(arcParams.slice).toBe(60);
    expect(arcParams.parts).toBe(6);
    expectMarksLocked(arcHit.cue.words ?? [], arcParams.marks);
    const arcState = reduceSceneState(arc, arcHit.frame.atMs);
    expect(arcState.circle.radius).toBe(0);
    expect(arcState.circle.circumference).toBe(0);
    const arcDrawn = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: arcState, currentTimeMs: arcState.elapsedMs }),
    );
    expect(arcDrawn).toContain("merkez açı = 90°");
    expect(arcDrawn).toContain("yay = 90°");
    expect(arcDrawn).toContain("tam tur = 360°");
    expect(arcDrawn).toContain("pay = 6");
    expect(arcDrawn).not.toContain("31,4");
    expect(arcDrawn).not.toContain("2πr");
  });
});
