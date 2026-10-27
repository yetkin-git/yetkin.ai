import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { NumberOpsScene } from "@/components/junior/player/math-scenes";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState, type SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

function bookletSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12);
}

function bareSpokenInteger(word: string): number | null {
  const match = /^(\d+)[,.!?…]*$/u.exec(word);
  return match ? Number(match[1]) : null;
}

function pilot() {
  const playback = resolveJuniorPlayback("jr_06_mat-2");
  expect(playback.engine).toBe("pilot");
  if (playback.engine !== "pilot") {
    throw new Error("jr_06_mat-2 pilot kapısında değil.");
  }
  return playback.timeline;
}

describe("jr_06_mat-2 asal çarpan sözleşmesi", () => {
  it("not kartının her cümlesi grafik transkriptindedir", () => {
    const example = juniorBookletCopy("jr_06_mat-2").example;
    const film = pilot().cues.map((cue) => cue.text).join(" ");
    const sentences = bookletSentences(example);
    expect(sentences.length).toBeGreaterThan(3);
    for (const sentence of sentences) {
      expect(film, sentence).toContain(sentence);
    }
  });

  it("12'nin dalları ve 7'nin damgası kelime startMs değerine kilitlidir ve liste boşalmaz", () => {
    const timeline = pilot();
    const cue = timeline.cues.find((row) => row.text.includes("2 çarpı 2 çarpı 3"));
    expect(cue).toBeDefined();
    const tree = cue!.keyframes.find((frame) => frame.hook === "showTree");
    const stamp = cue!.keyframes.find((frame) => frame.hook === "stampSeven");
    expect(tree).toBeDefined();
    expect(stamp).toBeDefined();
    const branches = (tree!.params.composite as { branches: Array<{ value: number; atMs: number }> }).branches;
    const nodes = (stamp!.params.prime as { nodes: Array<{ value: number; atMs: number }> }).nodes;
    expect(branches.map((branch) => branch.value)).toEqual([2, 2, 3]);
    expect(nodes.map((node) => node.value)).toEqual([1, 7]);

    const words = cue!.words ?? [];
    branches.forEach((branch, index) => {
      const wordIndex = words.findIndex((word) => word.startMs === branch.atMs);
      expect(wordIndex).toBeGreaterThanOrEqual(0);
      expect(bareSpokenInteger(words[wordIndex]!.word)).toBe(branch.value);
      if (index < 2) {
        expect(words[wordIndex + 1]?.word).toMatch(/^çarpı/u);
      } else {
        expect(words[wordIndex + 1]?.word).toMatch(/^şeklinde/u);
      }
    });
    const sevenIndex = words.findIndex((word) => word.startMs === nodes[1]!.atMs);
    expect(bareSpokenInteger(words[sevenIndex]!.word)).toBe(7);
    expect(words[sevenIndex + 1]?.word).toMatch(/^asaldır/u);

    const atTree = reduceSceneState(timeline, tree!.atMs);
    expect(atTree.primeFactor.visible).toBe(true);
    expect(atTree.primeFactor.composite?.factors).toEqual([2, 2, 3]);
    expect(atTree.primeFactor.composite?.branches).toHaveLength(3);
    expect(atTree.primeFactor.composite?.product).toBe("2 × 2 × 3");
    expect(atTree.primeFactor.prime).toBeNull();

    const atStamp = reduceSceneState(timeline, stamp!.atMs);
    expect(atStamp.primeFactor.composite?.factors).toEqual([2, 2, 3]);
    expect(atStamp.primeFactor.prime?.factors).toEqual([1, 7]);
    expect(atStamp.primeFactor.prime?.stamp).toBe("asal");
    expect(atStamp.primeFactor.prime?.nodes).toHaveLength(2);
    expect(atStamp.primeFactor.composite).not.toHaveProperty("stamp");

    const scaled = lockTimelineToExactAudioMs(timeline, timeline.audio.durationMs + 1_000);
    const scaledCue = scaled.cues.find((row) => row.id === cue!.id);
    const scaledBranches = (
      scaledCue?.keyframes.find((frame) => frame.hook === "showTree")?.params.composite as {
        branches: Array<{ value: number; atMs: number }>;
      }
    ).branches;
    for (const branch of scaledBranches) {
      const word = scaledCue?.words?.find((row) => row.startMs === branch.atMs);
      expect(bareSpokenInteger(word?.word ?? "")).toBe(branch.value);
    }
  });

  it("boş kart kardeşin asal tablosunu basmaz; 7 damgası 12'nin çarpanından gelmez", () => {
    const timeline = pilot();
    const early = reduceSceneState(timeline, 400);
    expect(early.primeFactor.visible).toBe(false);
    expect(early.layout).toBe("prime-factor-tree");
    const hidden = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: early, currentTimeMs: early.elapsedMs }),
    );
    expect(hidden).toContain('data-junior-graphic-op="none"');
    expect(hidden).not.toContain("çizim yok");
    expect(hidden).not.toContain("2 × 2 × 3");
    expect(hidden).not.toContain(">11<");

    const swapped: SceneGraphState = {
      ...early,
      layout: "prime-factor-tree",
      primeFactor: {
        visible: true,
        composite: null,
        prime: {
          number: 11,
          factors: [1, 11],
          stamp: "asal",
          nodes: [
            { value: 1, atMs: 0 },
            { value: 11, atMs: 0 },
          ],
        },
      },
    };
    const other = renderToStaticMarkup(
      createElement(GraphicOpStage, { state: swapped, currentTimeMs: 10 }),
    );
    expect(other).toContain("11");
    expect(other).toContain("asal");
    expect(other).not.toContain("2 × 2 × 3");
    expect(other).not.toContain(">7<");

    const legacy = renderToStaticMarkup(
      createElement(NumberOpsScene, {
        beat: 5,
        caption: "7 asaldır.",
        captionTrail: ["7 asaldır. Çarpanları sadece 1 ve 7'dir."],
      }),
    );
    expect(legacy).toContain("çizim yok");
    expect(legacy).not.toContain("2 × 2 × 3");
    expect(legacy).not.toContain(">11<");
    expect(legacy).not.toContain("EBOB = 4");
  });

  it("grafiği olmayan ders pilot kapısına girmez", () => {
    expect(resolveJuniorPlayback("jr_06_mat-2").engine).toBe("pilot");
    expect(resolveJuniorPlayback("jr_06_mat-1").engine).toBe("pilot");
    expect(resolveJuniorPlayback("jr_06_mat-4").engine).toBe("sealed");
  });
});
