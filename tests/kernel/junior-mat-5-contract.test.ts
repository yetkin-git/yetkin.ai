import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DetectiveBoardStage } from "@/components/junior/pilot-player/DetectiveBoardStage";
import { FactorMultipleStage } from "@/components/junior/pilot-player/FactorMultipleStage";
import { MarbleTrayStage } from "@/components/junior/pilot-player/MarbleTrayStage";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import { JR_06_MAT_5_TIMELINE } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { reduceSceneState, type SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";
import { detectDivisibilityBoard } from "@/lib/junior/scene-sync";

function pilotTranscript(): string {
  return JR_06_MAT_5_TIMELINE.cues.map((cue) => cue.text).join(" ");
}

function bookletSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12);
}

/** «6,» «12,» «24» gibi düz sayı sözcüğü. «6'yı» eşleşmez. */
function bareSpokenInteger(word: string): number | null {
  const match = /^(\d+)[,.!?…]*$/u.exec(word);
  return match ? Number(match[1]) : null;
}

function cueById(id: string) {
  const cue = JR_06_MAT_5_TIMELINE.cues.find((row) => row.id === id);
  expect(cue).toBeDefined();
  return cue!;
}

describe("jr_06_mat-5 pilot sözleşmesi", () => {
  it("Ders Notu hero kartı sahne cümlesi değil pedagojik ana soruyu taşır", () => {
    const booklet = juniorBookletCopy("jr_06_mat-5");
    expect(booklet.heroQuestion).toBe(
      "Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız?",
    );
    expect(booklet.heroFocus).toBe(
      "Bölünebilme dedektifleri (2, 3, 4, 5, 6, 9, 10) ile sayılara tek bakışta karar verme yöntemleri.",
    );
    expect(booklet.heroQuestion).not.toContain("beşer beşer");
    expect(booklet.concept).toContain("beşer beşer");
  });

  it("not kartı örneğinin her cümlesi film transkriptinde durur", () => {
    const example = juniorBookletCopy("jr_06_mat-5").example;
    const film = pilotTranscript();
    const sentences = bookletSentences(example);
    expect(sentences.length).toBeGreaterThan(3);
    for (const sentence of sentences) {
      expect(film, sentence).toContain(sentence);
    }
    for (const claim of ["2 çarpı 12", "3 çarpı 8", "48", "24 çarpı 2"]) {
      expect(example).not.toContain(claim);
      expect(film).not.toContain(claim);
    }
  });

  it("yaşam paragrafının her cümlesi film transkriptindedir", () => {
    const life = juniorLessonByKey("jr_06_mat-5")?.lifeUse ?? "";
    const film = pilotTranscript();
    const sentences = bookletSentences(life);
    expect(sentences.length).toBeGreaterThan(2);
    for (const sentence of sentences) {
      expect(film, sentence).toContain(sentence);
    }
    expect(life).not.toContain("okul bahçesinde 24 kişiyi");
    expect(film).not.toContain("okul bahçesinde 24 kişiyi");
    expect(life).not.toContain("24 kişiyi");
  });

  it("cue-05 kat kulesi söylenen sayının startMs değerine kilitlidir ve boş listeye düşmez", () => {
    const cue = cueById("cue-05");
    const frame = cue.keyframes.find((keyframe) => keyframe.op === "BUILD_MULTIPLE_TOWER");
    expect(frame).toBeDefined();
    const multiples = frame!.params.multiples as Array<{ step: number; value: number; atMs: number }>;
    expect(multiples.map((step) => step.value)).toEqual([6, 12, 18, 24]);
    for (const value of [6, 12, 18, 24]) {
      const word = cue.words?.find((row) => bareSpokenInteger(row.word) === value);
      expect(word, String(value)).toBeDefined();
      expect(multiples.find((step) => step.value === value)?.atMs).toBe(word!.startMs);
    }

    const atBuild = reduceSceneState(JR_06_MAT_5_TIMELINE, frame!.atMs);
    expect(atBuild.multipleTower.visible).toBe(true);
    expect(atBuild.multipleTower.base).toBe(6);
    expect(atBuild.multipleTower.multiples.map((step) => step.value)).toEqual([6, 12, 18, 24]);

    const scaled = lockTimelineToExactAudioMs(
      JR_06_MAT_5_TIMELINE,
      JR_06_MAT_5_TIMELINE.audio.durationMs + 1_000,
    );
    const scaledCue = scaled.cues.find((row) => row.id === "cue-05");
    const scaledFrame = scaledCue?.keyframes.find((keyframe) => keyframe.op === "BUILD_MULTIPLE_TOWER");
    const scaledSteps = scaledFrame?.params.multiples as Array<{ value: number; atMs: number }>;
    for (const value of [6, 12, 18, 24]) {
      const word = scaledCue?.words?.find((row) => bareSpokenInteger(row.word) === value);
      expect(scaledSteps.find((step) => step.value === value)?.atMs).toBe(word?.startMs);
    }

    const painted = reduceSceneState(JR_06_MAT_5_TIMELINE, cue.endMs - 50);
    const html = renderToStaticMarkup(
      createElement(FactorMultipleStage, {
        state: {
          ...painted,
          multipleTower: { ...painted.multipleTower, base: 7 },
        },
        currentTimeMs: painted.elapsedMs,
      }),
    );
    expect(html).toContain("7 × 1");
    expect(html).not.toContain("6 × 1");
  });

  it("24 sayısı 5'e bölünmez; eski tahta 5'e bölünür damgası basmaz", () => {
    expect(
      detectDivisibilityBoard("Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür."),
    ).toMatchObject({
      kind: "last-digit",
      subject: 24,
      onesDigit: "4",
      badges: ["✓ 2'ye Bölünür", "✗ 5'e Bölünmez"],
    });
    const badges = detectDivisibilityBoard(
      "Son rakamı 4'tür ve çifttir, bu yüzden 24 sayısı 2'ye bölünür.",
    )?.badges.join(" ");
    expect(badges).not.toContain("5'e Bölünür");
  });

  it("bilye tepsi sayısı ve kutu adedi parametreden gelir", () => {
    const early = reduceSceneState(JR_06_MAT_5_TIMELINE, 1_000);
    expect(early.marblesSpawned).toBe(false);
    const hidden = renderToStaticMarkup(createElement(MarbleTrayStage, { state: early }));
    expect(hidden).not.toContain("TOPLAM: 12 CAM BİLYE");
    expect(hidden).not.toContain("opacity: 1");

    const custom: SceneGraphState = {
      ...early,
      marblesSpawned: true,
      marbleCount: 8,
      marbleGroup: {
        total: 8,
        groupSize: 2,
        groups: 3,
        remainder: 0,
        highlightRemainder: null,
        equation: "",
      },
    };
    const html = renderToStaticMarkup(createElement(MarbleTrayStage, { state: custom }));
    expect(html).toContain("TOPLAM: 8 CAM BİLYE");
    expect(html).not.toContain("TOPLAM: 12 CAM BİLYE");
    expect(html.match(/Kutu \(2\)/g)).toHaveLength(3);
  });

  it("14 tuzağı ve dedektif tahtası state rakamını basar", () => {
    const cue = cueById("cue-11");
    const atTrap = reduceSceneState(JR_06_MAT_5_TIMELINE, cue.endMs - 50);
    expect(atTrap.layout).toBe("trap-vs-truth");
    expect(atTrap.detective.value).toBe(14);
    expect(atTrap.detective.digits).toEqual(["1", "4"]);
    const trap = renderToStaticMarkup(createElement(DetectiveBoardStage, { state: atTrap }));
    expect(trap).toContain("14 sayısının sonu 4");
    expect(trap).toContain("1 + 4 = 5");

    const beforeHook = reduceSceneState(JR_06_MAT_5_TIMELINE, cue.startMs + 20);
    expect(beforeHook.layout).toBe("trap-vs-truth");
    expect(beforeHook.detective.revealed).toBe(false);
    const hidden = renderToStaticMarkup(createElement(DetectiveBoardStage, { state: beforeHook }));
    expect(hidden).not.toContain("14 sayısının sonu 4");
    expect(hidden).not.toContain("1 + 4 = 5");
    expect(hidden).not.toContain("3'e Bölünmez");
    expect(hidden).not.toContain("anlatıcı söyleyince");
    expect(hidden).not.toContain("Karar damgası");
    expect(hidden).not.toContain("örnekten sonra");
    expect(hidden).not.toContain("söylenince basılacak");

    const factorCue = cueById("cue-04");
    const beforePairs = reduceSceneState(JR_06_MAT_5_TIMELINE, factorCue.startMs + 20);
    expect(beforePairs.factorTree.visible).toBe(false);
    expect(beforePairs.factorTree.pairs).toEqual([]);
    const hiddenPairs = renderToStaticMarkup(
      createElement(FactorMultipleStage, { state: beforePairs, currentTimeMs: factorCue.startMs + 20 }),
    );
    expect(hiddenPairs).not.toContain("1 × 6 = 6");
    expect(hiddenPairs).not.toContain("2 × 3 = 6");
    const pairFrame = factorCue.keyframes.find((keyframe) => keyframe.op === "SHOW_FACTOR_TREE");
    expect(pairFrame).toBeDefined();
    const shownPairs = reduceSceneState(JR_06_MAT_5_TIMELINE, pairFrame!.atMs);
    expect(shownPairs.factorTree.visible).toBe(true);
    expect(shownPairs.factorTree.pairs).toEqual(["1 × 6 = 6", "2 × 3 = 6"]);

    const swapped: SceneGraphState = {
      ...atTrap,
      detective: {
        ...atTrap.detective,
        value: 28,
        digits: ["2", "8"],
        digitSum: {
          active: true,
          digits: [2, 8],
          expression: "2 + 8 = 10",
          sum: 10,
        },
      },
    };
    const other = renderToStaticMarkup(createElement(DetectiveBoardStage, { state: swapped }));
    expect(other).toContain("28 sayısının sonu 8");
    expect(other).toContain("2 + 8 = 10");
    expect(other).not.toContain("14 sayısının sonu 4");
  });
});
