import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { AnglesScene, AreaScene } from "@/components/junior/player/math-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type SceneGraphState, type TimedNumber } from "@/lib/junior/pilot-engine/state-reducer";
import type { TimelineJSON, VisualKeyframe } from "@/lib/junior/pilot-engine/schema";

const ANGLE_KEYS = ["jr_06_mat-14", "jr_06_mat-15", "jr_06_mat-16", "jr_06_mat-17"] as const;

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

function draw(state: SceneGraphState): string {
  return renderToStaticMarkup(createElement(GraphicOpStage, { state, currentTimeMs: state.elapsedMs }));
}

describe("açı ve alan sözleşmesi", () => {
  it("not cümleleri grafik transkriptindedir", () => {
    for (const lessonKey of [...ANGLE_KEYS, "jr_06_mat-19", "jr_06_mat-18"] as const) {
      const example = juniorBookletCopy(lessonKey).example;
      const film = pilot(lessonKey).cues.map((cue) => cue.text).join(" ");
      const sentences = bookletSentences(example);
      expect(sentences.length).toBeGreaterThan(1);
      for (const sentence of sentences) {
        expect(film, `${lessonKey} ${sentence}`).toContain(sentence);
      }
    }
    expect(resolveJuniorPlayback("jr_06_mat-23").engine).toBe("pilot");
  });

  it("yöndeş, bütünler, köşegen ve iç açı grafik parametresidir", () => {
    const parallel = frameOf(pilot("jr_06_mat-14"), "SHOW_ANGLE");
    const parallelParams = parallel.frame.params as {
      acute: number;
      corresponding: number;
      alternate: number;
      supplementary: number;
      straight: number;
      complement: number;
      adjacentLabel: string;
      marks: TimedNumber[];
    };
    expect(parallelParams.acute).toBe(70);
    expect(parallelParams.corresponding).toBe(70);
    expect(parallelParams.alternate).toBe(70);
    expect(parallelParams.supplementary).toBe(110);
    expect(parallelParams.straight).toBe(180);
    expect(parallelParams.complement).toBe(0);
    expect(parallelParams.adjacentLabel).toBe("bütünler komşu");
    expect(parallel.cueText).toContain("Bütünler komşu");
    expectMarksLocked(parallel.words, parallelParams.marks);
    const parallelDrawn = draw(reduceSceneState(pilot("jr_06_mat-14"), parallel.frame.atMs));
    expect(parallelDrawn).toContain("iç açı 70°");
    expect(parallelDrawn).toContain("yöndeş 70°");
    expect(parallelDrawn).toContain("iç ters 70°");
    expect(parallelDrawn).toContain("bütünler 110°");
    expect(parallelDrawn).toContain("doğru açı 180°");
    expect(parallelDrawn).toContain("bütünler komşu");
    expect(parallelDrawn).not.toContain("tümler");

    const quad = frameOf(pilot("jr_06_mat-15"), "SHOW_ANGLE");
    const quadParams = quad.frame.params as { names: string[]; quadrilateralSum: number; marks: TimedNumber[] };
    expect(quadParams.names).toEqual(["Yamuk", "Paralelkenar"]);
    const quadState = reduceSceneState(pilot("jr_06_mat-15"), quad.frame.atMs);
    expect(quadState.angle.quadrilateralSum).toBe(0);
    expect(quadState.angle.acute).toBe(0);
    expect(quad.cueText).toContain("yamuktur");
    expectMarksLocked(quad.words, quadParams.marks);
    const quadDrawn = draw(reduceSceneState(pilot("jr_06_mat-15"), quad.frame.atMs));
    expect(quadDrawn).toContain("Yamuk");
    expect(quadDrawn).toContain("Paralelkenar");
    expect(quadDrawn).not.toContain("70°");

    const diagonal = frameOf(pilot("jr_06_mat-16"), "SHOW_ANGLE");
    const diagonalParams = diagonal.frame.params as { diagonalLong: number; halfLong: number; halfShort: number; marks: TimedNumber[] };
    expect(diagonalParams.diagonalLong).toBe(10);
    expect(diagonalParams.halfLong).toBe(5);
    expect(diagonalParams.halfShort).toBe(3);
    expectMarksLocked(diagonal.words, diagonalParams.marks);
    const diagonalDrawn = draw(reduceSceneState(pilot("jr_06_mat-16"), diagonal.frame.atMs));
    expect(diagonalDrawn).toContain("köşegen 10 cm");
    expect(diagonalDrawn).toContain("5 cm ve 5 cm");
    expect(diagonalDrawn).toContain("3 cm ve 3 cm");

    const interior = frameOf(pilot("jr_06_mat-17"), "SHOW_ANGLE");
    const interiorParams = interior.frame.params as {
      triangle: number[];
      triangleSum: number;
      triangleMissing: number;
      quadrilateralSum: number;
      quadrilateralMissing: number;
      marks: TimedNumber[];
    };
    expect(interiorParams.triangle).toEqual([50, 60, 70]);
    expect(interiorParams.triangleSum).toBe(180);
    expect(interiorParams.triangleMissing).toBe(70);
    expect(interiorParams.quadrilateralSum).toBe(360);
    expect(interiorParams.quadrilateralMissing).toBe(90);
    expectMarksLocked(interior.words, interiorParams.marks);
    const interiorDrawn = draw(reduceSceneState(pilot("jr_06_mat-17"), interior.frame.atMs));
    expect(interiorDrawn).toContain("üçgen 50° + 60° + 70° = 180°");
    expect(interiorDrawn).toContain("dörtgen 80° + 90° + 100° + 90° = 360°");

    const scaled = lockTimelineToExactAudioMs(pilot("jr_06_mat-14"), pilot("jr_06_mat-14").audio.durationMs + 800);
    const scaledCue = scaled.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === "SHOW_ANGLE"));
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_ANGLE")?.params.marks as TimedNumber[];
    expectMarksLocked(scaledCue?.words, scaledMarks);
  });

  it("alan taban, yükseklik ve dönüm değerini state'ten basar", () => {
    const shape = frameOf(pilot("jr_06_mat-19"), "SHOW_AREA");
    const shapeParams = shape.frame.params as {
      base: number;
      height: number;
      slant: number;
      parallelogram: number;
      triangle: number;
      marks: TimedNumber[];
    };
    expect(shapeParams.base).toBe(8);
    expect(shapeParams.height).toBe(5);
    expect(shapeParams.slant).toBe(6);
    expect(shapeParams.parallelogram).toBe(40);
    expect(shapeParams.triangle).toBe(20);
    expect(shape.cueText).toContain("dik yükseklik değildir");
    expectMarksLocked(shape.words, shapeParams.marks);
    const shapeDrawn = draw(reduceSceneState(pilot("jr_06_mat-19"), shape.frame.atMs));
    expect(shapeDrawn).toContain("taban 8");
    expect(shapeDrawn).toContain("yükseklik 5");
    expect(shapeDrawn).toContain("paralelkenar 40 cm²");
    expect(shapeDrawn).toContain("üçgen 20 cm²");
    expect(shapeDrawn).toContain("eğik 6");
    expect(shapeDrawn).not.toContain("48");

    const units = frameOf(pilot("jr_06_mat-18"), "SHOW_AREA");
    const unitParams = units.frame.params as { squareArea: number; squareCm2: number; donumM2: number; hectareDonum: number; marks: TimedNumber[] };
    expect(unitParams.squareArea).toBe(4);
    expect(unitParams.squareCm2).toBe(40000);
    expect(unitParams.donumM2).toBe(3000);
    expect(unitParams.hectareDonum).toBe(20);
    expectMarksLocked(units.words, unitParams.marks);
    const unitDrawn = draw(reduceSceneState(pilot("jr_06_mat-18"), units.frame.atMs));
    expect(unitDrawn).toContain("4 m²");
    expect(unitDrawn).toContain("40000 cm²");
    expect(unitDrawn).toContain("3 dönüm = 3000 m²");
    expect(unitDrawn).toContain("2 hektar = 20 dönüm");
    expect(unitDrawn).not.toContain("paralelkenar 40");
  });

  it("indirgeyici tümler açıyı ve alanı kendisi doldurmaz; eski sahne sayı basmaz", () => {
    const timeline = pilot("jr_06_mat-14");
    const early = reduceSceneState(timeline, 400);
    expect(early.angle.visible).toBe(false);
    expect(draw(early)).toContain('data-junior-graphic-op="none"');
    expect(draw(early)).not.toContain("çizim yok");

    const partial: TimelineJSON = {
      ...timeline,
      cues: [
        {
          ...timeline.cues[0]!,
          keyframes: [{ atMs: 0, op: "SHOW_ANGLE", params: { acute: 70 } }],
        },
      ],
    };
    const onlyAcute = reduceSceneState(partial, 10);
    expect(onlyAcute.angle.acute).toBe(70);
    expect(onlyAcute.angle.supplementary).toBe(0);
    expect(onlyAcute.angle.complement).toBe(0);
    expect(onlyAcute.angle.straight).toBe(0);
    expect(draw(onlyAcute)).toContain("iç açı 70°");
    expect(draw(onlyAcute)).not.toContain("tümler");
    expect(draw(onlyAcute)).not.toContain("110");

    const areaPartial: TimelineJSON = {
      ...pilot("jr_06_mat-19"),
      cues: [
        {
          ...pilot("jr_06_mat-19").cues[0]!,
          keyframes: [{ atMs: 0, op: "SHOW_AREA", params: { base: 8 } }],
        },
      ],
    };
    const onlyBase = reduceSceneState(areaPartial, 10);
    expect(onlyBase.area.base).toBe(8);
    expect(onlyBase.area.height).toBe(0);
    expect(onlyBase.area.parallelogram).toBe(0);
    expect(onlyBase.area.triangle).toBe(0);

    const legacyAngle = renderToStaticMarkup(
      createElement(AnglesScene, { beat: 6, caption: "70 derece yöndeş bütünler komşu" }),
    );
    const legacyArea = renderToStaticMarkup(createElement(AreaScene, { beat: 6, caption: "taban yükseklik" }));
    expect(legacyAngle).toContain("çizim yok");
    expect(legacyArea).toContain("çizim yok");
    expect(legacyAngle).not.toContain("Tümler 60°");
    expect(legacyAngle).not.toContain("110°");
    expect(legacyArea).not.toContain("1 dönüm = 1000 m²");
  });
});
