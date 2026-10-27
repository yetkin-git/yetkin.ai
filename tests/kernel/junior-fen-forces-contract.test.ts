import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { ForceScene, SpeedScene } from "@/components/junior/player/science-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import "@/lib/junior/pilot-engine/acoustic-timeline-disk";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type SceneGraphState, type TimedNumber } from "@/lib/junior/pilot-engine/state-reducer";
import type { TimelineJSON, VisualKeyframe } from "@/lib/junior/pilot-engine/schema";

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

describe("kuvvet ve sürat sözleşmesi", () => {
  it("not cümleleri grafik transkriptindedir; iletken ve üreme dersi bu ailede değildir", () => {
    for (const lessonKey of ["jr_06_fen-9", "jr_06_fen-10", "jr_06_fen-21"] as const) {
      const example = juniorBookletCopy(lessonKey).example;
      const film = pilot(lessonKey).cues.map((cue) => cue.text).join(" ");
      const sentences = bookletSentences(example);
      expect(sentences.length).toBeGreaterThan(2);
      for (const sentence of sentences) {
        expect(film, `${lessonKey} ${sentence}`).toContain(sentence);
      }
    }
    expect(resolveJuniorPlayback("jr_06_fen-19").engine).toBe("pilot");
    expect(resolveJuniorPlayback("jr_06_fen-20").engine).toBe("pilot");
    expect(resolveJuniorPlayback("jr_06_fen-22").engine).toBe("pilot");
    expect(resolveJuniorPlayback("jr_06_fen-16").engine).toBe("pilot");
  });

  it("newton, sürat ve yer değiştirme grafik parametresidir", () => {
    const force = frameOf(pilot("jr_06_fen-9"), "SHOW_FORCE");
    const forceParams = force.frame.params as {
      sameA: number;
      sameB: number;
      sameResult: number;
      oppositeResult: number;
      balanceA: number;
      balanceResult: number;
      unbalancedResult: number;
      marks: TimedNumber[];
    };
    expect(forceParams.sameA).toBe(5);
    expect(forceParams.sameB).toBe(3);
    expect(forceParams.sameResult).toBe(8);
    expect(forceParams.oppositeResult).toBe(3);
    expect(forceParams.balanceA).toBe(6);
    expect(forceParams.balanceResult).toBe(0);
    expect(forceParams.unbalancedResult).toBe(6);
    expect(force.cueText).toContain("dengelenmiştir");
    expectMarksLocked(force.words, forceParams.marks);
    const forceDrawn = draw(reduceSceneState(pilot("jr_06_fen-9"), force.frame.atMs));
    expect(forceDrawn).toContain("5 N + 3 N = 8 N sağa");
    expect(forceDrawn).toContain("7 N − 4 N = 3 N sağa");
    expect(forceDrawn).toContain("6 N ve 6 N Bileşke 0");
    expect(forceDrawn).toContain("8 N − 2 N = 6 N sağa");
    expect(forceDrawn).not.toContain("120 m");

    const speed = frameOf(pilot("jr_06_fen-10"), "SHOW_SPEED");
    const speedParams = speed.frame.params as {
      distance: number;
      time: number;
      speed: number;
      spanDistance: number;
      otherSpeed: number;
      marks: TimedNumber[];
    };
    expect(speedParams.distance).toBe(120);
    expect(speedParams.time).toBe(40);
    expect(speedParams.speed).toBe(3);
    expect(speedParams.spanDistance).toBe(30);
    expect(speedParams.otherSpeed).toBe(5);
    expectMarksLocked(speed.words, speedParams.marks);
    const speedDrawn = draw(reduceSceneState(pilot("jr_06_fen-10"), speed.frame.atMs));
    expect(speedDrawn).toContain("120 m ÷ 40 s = 3 m/s");
    expect(speedDrawn).toContain("10 s → 30 m");
    expect(speedDrawn).toContain("20 s → 60 m");
    expect(speedDrawn).toContain("100 m ÷ 20 s = 5 m/s");
    expect(speedDrawn).not.toContain("yer değiştirme");

    const path = frameOf(pilot("jr_06_fen-21"), "SHOW_SPEED");
    const pathParams = path.frame.params as {
      path: number;
      displacement: number;
      pathSum: number;
      displacementNet: number;
      straight: number;
      marks: TimedNumber[];
    };
    expect(pathParams.path).toBe(400);
    expect(pathParams.displacement).toBe(0);
    expect(pathParams.pathSum).toBe(110);
    expect(pathParams.displacementNet).toBe(50);
    expect(pathParams.straight).toBe(120);
    expectMarksLocked(path.words, pathParams.marks);
    const pathDrawn = draw(reduceSceneState(pilot("jr_06_fen-21"), path.frame.atMs));
    expect(pathDrawn).toContain("alınan yol 400 m");
    expect(pathDrawn).toContain("yer değiştirme 0 m");
    expect(pathDrawn).toContain("alınan yol 110 m");
    expect(pathDrawn).toContain("yer değiştirme 50 m doğu");
    expect(pathDrawn).toContain("düz 120 m");
    expect(pathDrawn).not.toContain("m/s");

    const scaled = lockTimelineToExactAudioMs(pilot("jr_06_fen-10"), pilot("jr_06_fen-10").audio.durationMs + 900);
    const scaledCue = scaled.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === "SHOW_SPEED"));
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_SPEED")?.params.marks as TimedNumber[];
    expectMarksLocked(scaledCue?.words, scaledMarks);
  });

  it("indirgeyici newton ve sürati kendisi hesaplamaz; eski sahne sayı basmaz", () => {
    const timeline = pilot("jr_06_fen-9");
    const early = reduceSceneState(timeline, 400);
    expect(early.force.visible).toBe(false);
    expect(draw(early)).toContain('data-junior-graphic-op="none"');
    expect(draw(early)).not.toContain("çizim yok");

    const partial: TimelineJSON = {
      ...timeline,
      cues: [
        {
          ...timeline.cues[0]!,
          keyframes: [{ atMs: 0, op: "SHOW_FORCE", params: { sameA: 5, sameB: 3, unit: "N" } }],
        },
      ],
    };
    const onlyPair = reduceSceneState(partial, 10);
    expect(onlyPair.force.sameA).toBe(5);
    expect(onlyPair.force.sameB).toBe(3);
    expect(onlyPair.force.sameResult).toBe(0);
    expect(onlyPair.force.showBalance).toBe(false);
    expect(draw(onlyPair)).not.toContain("8 N");
    expect(draw(onlyPair)).not.toContain("Bileşke");

    const speedPartial: TimelineJSON = {
      ...pilot("jr_06_fen-10"),
      cues: [
        {
          ...pilot("jr_06_fen-10").cues[0]!,
          keyframes: [{ atMs: 0, op: "SHOW_SPEED", params: { distance: 120, time: 40, distanceUnit: "m", timeUnit: "s" } }],
        },
      ],
    };
    const onlyTrip = reduceSceneState(speedPartial, 10);
    expect(onlyTrip.speed.distance).toBe(120);
    expect(onlyTrip.speed.time).toBe(40);
    expect(onlyTrip.speed.speed).toBe(0);
    expect(draw(onlyTrip)).toContain("120 m ÷ 40 s = 0");
    expect(draw(onlyTrip)).not.toContain("3 m/s");

    const legacyForce = renderToStaticMarkup(createElement(ForceScene, { beat: 7 }));
    const legacySpeed = renderToStaticMarkup(
      createElement(SpeedScene, { beat: 6, caption: "120 metre yolu 40 saniyede" }),
    );
    expect(legacyForce).toContain("çizim yok");
    expect(legacySpeed).toContain("çizim yok");
    expect(legacyForce).not.toContain("6 N");
    expect(legacySpeed).not.toContain("120 m");
  });
});
