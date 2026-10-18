import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { BodyScene, ScienceSceneArt } from "@/components/junior/player/science-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
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

function expectNoOrgans(html: string) {
  expect(html).toContain("çizim yok");
  expect(html).not.toContain("Duyu organları");
  expect(html).not.toContain(">Göz<");
  expect(html).not.toContain(">Kulak<");
  expect(html).not.toContain("Kemik destekler");
}

describe("jr_06_fen-37/38 biyoçeşitlilik ve yakıt sözleşmesi", () => {
  it("not cümleleri grafik transkriptindedir ve organ sahnesi açılmaz", () => {
    for (const lessonKey of ["jr_06_fen-37", "jr_06_fen-38"] as const) {
      const example = juniorBookletCopy(lessonKey).example;
      const film = pilot(lessonKey).cues.map((cue) => cue.text).join(" ");
      const sentences = bookletSentences(example);
      expect(sentences.length).toBeGreaterThan(2);
      for (const sentence of sentences) {
        expect(film, `${lessonKey} ${sentence}`).toContain(sentence);
      }
    }
    expect(resolveJuniorPlayback("jr_06_fen-16").engine).toBe("sealed");
  });

  it("tür sayıları ve yakıt litreleri grafik parametresidir", () => {
    const habitatTimeline = pilot("jr_06_fen-37");
    const habitatCue = habitatTimeline.cues.find((row) =>
      row.keyframes.some((keyframe) => keyframe.op === "SHOW_HABITAT"),
    );
    expect(habitatCue).toBeDefined();
    const habitatFrame = habitatCue!.keyframes.find((keyframe) => keyframe.op === "SHOW_HABITAT");
    expect(habitatFrame).toBeDefined();
    const habitatParams = habitatFrame!.params as {
      birds: number;
      plants: number;
      birdsLost: number;
      threats: string[];
      protection: string;
      marks: TimedNumber[];
    };
    expect(habitatParams.birds).toBe(12);
    expect(habitatParams.plants).toBe(30);
    expect(habitatParams.birdsLost).toBe(4);
    expect(habitatParams.threats).toEqual(["Ağaçların yarısı kesilirse", "Dereye bırakılan atık"]);
    expect(habitatParams.protection).toBe("dereyi temiz tutan");
    expect(habitatCue!.text).toContain(habitatParams.threats[0]);
    expect(habitatCue!.text).toContain(habitatParams.protection);
    expectMarksLocked(habitatCue!.words ?? [], habitatParams.marks);

    const habitatState = reduceSceneState(habitatTimeline, habitatFrame!.atMs);
    expect(habitatState.layout).toBe("habitat");
    expect(habitatState.habitat.birds).toBe(12);
    expect(habitatState.habitat.plants).toBe(30);
    const habitatDrawn = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: habitatState, currentTimeMs: habitatState.elapsedMs }),
    );
    expect(habitatDrawn).toContain("12 kuş türü");
    expect(habitatDrawn).toContain("30 bitki türü");
    expect(habitatDrawn).toContain("4 tür ayrılır");
    expect(habitatDrawn).toContain("Dereye bırakılan atık");
    expect(habitatDrawn).not.toContain("Göz");
    expect(habitatDrawn).not.toContain("Kulak");
    expect(habitatDrawn).not.toContain("Kemik");

    const fuelTimeline = pilot("jr_06_fen-38");
    const fuelCue = fuelTimeline.cues.find((row) => row.keyframes.some((keyframe) => keyframe.op === "SHOW_FUEL"));
    expect(fuelCue).toBeDefined();
    const fuelFrame = fuelCue!.keyframes.find((keyframe) => keyframe.op === "SHOW_FUEL");
    expect(fuelFrame).toBeDefined();
    const fuelParams = fuelFrame!.params as {
      distanceKm: number;
      fuelLitres: number;
      walkKm: number;
      cleanStack: string;
      dirtyStack: string;
      alternate: string;
      marks: TimedNumber[];
    };
    expect(fuelParams.distanceKm).toBe(10);
    expect(fuelParams.fuelLitres).toBe(2);
    expect(fuelParams.walkKm).toBe(1);
    expect(fuelParams.cleanStack).toBe("filtreli baca");
    expect(fuelParams.dirtyStack).toBe("filtresiz baca");
    expect(fuelParams.alternate).toBe("Güneş paneli");
    expect(fuelCue!.text).toContain("filtreli baca");
    expect(fuelCue!.text).toContain("Güneş paneli");
    expectMarksLocked(fuelCue!.words ?? [], fuelParams.marks);

    const fuelState = reduceSceneState(fuelTimeline, fuelFrame!.atMs);
    const fuelDrawn = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: fuelState, currentTimeMs: fuelState.elapsedMs }),
    );
    expect(fuelDrawn).toContain("10 km");
    expect(fuelDrawn).toContain("2 litre");
    expect(fuelDrawn).toContain("1 km yürüyüş");
    expect(fuelDrawn).toContain("filtresiz baca");
    expect(fuelDrawn).not.toContain("Duyu");
    expect(fuelDrawn).not.toContain("Kemik");

    const scaled = lockTimelineToExactAudioMs(fuelTimeline, fuelTimeline.audio.durationMs + 1_000);
    const scaledCue = scaled.cues.find((row) => row.id === fuelCue!.id);
    const scaledMarks = scaledCue?.keyframes.find((keyframe) => keyframe.op === "SHOW_FUEL")?.params
      .marks as TimedNumber[];
    for (const mark of scaledMarks) {
      expect(scaledCue?.words?.some((word) => word.startMs === mark.atMs)).toBe(true);
    }
  });

  it("gözlemlemek organ çizmez; boş grafikte çizim yoktur", () => {
    const observe = renderToStaticMarkup(
      createElement(BodyScene, {
        beat: 5,
        caption: "Bir orman fotoğrafını gözlemlemek, tür sayısının neden önemli olduğunu gösterir.",
      }),
    );
    expectNoOrgans(observe);

    const smoke = renderToStaticMarkup(
      createElement(BodyScene, {
        beat: 4,
        caption: "Bacadan çıkan dumanı gözlemlemek, enerjinin bedelini görünür kılar.",
      }),
    );
    expectNoOrgans(smoke);

    const neutral = renderToStaticMarkup(
      createElement(ScienceSceneArt, {
        scene: "body",
        beat: 3,
        lessonKey: "jr_06_fen-37",
        caption: "Parkta yalnız tek bir çim türü varsa çeşitlilik azalmıştır.",
      }),
    );
    expectNoOrgans(neutral);

    const fuelLesson = renderToStaticMarkup(
      createElement(ScienceSceneArt, {
        scene: "body",
        beat: 3,
        lessonKey: "jr_06_fen-38",
        caption: "Kısa yolu yürümek yakıtı azaltır.",
      }),
    );
    expectNoOrgans(fuelLesson);

    const sense = renderToStaticMarkup(
      createElement(BodyScene, {
        beat: 4,
        caption: "Göz görmeyi sağlar. Kulak sesi alır.",
      }),
    );
    expect(sense).toContain("Duyu organları");
    expect(sense).toContain(">Göz<");
    expect(sense).toContain(">Kulak<");
    expect(sense).not.toContain("çizim yok");

    const timeline = pilot("jr_06_fen-37");
    const early = reduceSceneState(timeline, 400);
    expect(early.habitat.visible).toBe(false);
    expect(early.habitat.birds).toBe(0);
    const hidden = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: early, currentTimeMs: early.elapsedMs }),
    );
    expect(hidden).toContain('data-junior-graphic-op="none"');
    expect(hidden).not.toContain("çizim yok");
    expect(hidden).not.toContain("12 kuş türü");

    const swapped: SceneGraphState = {
      ...early,
      layout: "habitat",
      habitat: {
        visible: true,
        birds: 3,
        plants: 8,
        birdsLost: 1,
        threats: ["yangın"],
        protection: "alanı bırakmak",
        marks: [{ slot: "birds", value: 3, atMs: 0 }],
      },
    };
    const other = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: swapped, currentTimeMs: 10 }),
    );
    expect(other).toContain("3 kuş türü");
    expect(other).toContain("yangın");
    expect(other).not.toContain("12 kuş türü");
    expect(other).not.toContain("30 bitki türü");
    expect(other).not.toContain("Göz");
  });
});
