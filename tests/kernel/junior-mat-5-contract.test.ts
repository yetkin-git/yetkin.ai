import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DetectiveBoardStage } from "@/components/junior/pilot-player/DetectiveBoardStage";
import { FactorMultipleStage } from "@/components/junior/pilot-player/FactorMultipleStage";
import {
  JuniorPilotPlayer,
  resolveCaptionSentenceWindow,
} from "@/components/junior/pilot-player/JuniorPilotPlayer";
import { MarbleTrayStage } from "@/components/junior/pilot-player/MarbleTrayStage";
import { juniorBookletCopy } from "@/lib/junior/booklet";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import {
  MAT_5_AUTHORED_CUES,
  buildCueTimingFromBounds,
  parseMarkedCueText,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import {
  JR_06_MAT_5_TIMELINE,
  loadPilotTimelineForLesson,
} from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { reduceSceneState, type SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";
import type { TimelineJSON, WordTimestamp } from "@/lib/junior/pilot-engine/schema";
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

describe("jr_06_mat-1 pilot sözleşmesi", () => {
  it("Ders Notu hero kartı sahne cümlesi değil pedagojik ana soruyu taşır", () => {
    const booklet = juniorBookletCopy("jr_06_mat-1");
    expect(booklet.heroQuestion).toBe(
      "Bir sayının çarpanı ve katı nedir; bölünebilirliği uzun bölme yapmadan nasıl anlarız?",
    );
    expect(booklet.heroFocus).toBe(
      "Yedi kural (2, 3, 4, 5, 6, 9 ve 10) ile çarpan ve kat: uzun bölme yapmadan karar verme.",
    );
    expect(booklet.heroFocus).toContain("4, 5, 6");
    expect(booklet.heroQuestion).not.toContain("beşer beşer");
    expect(booklet.concept).toContain("beşer beşer");
    expect(booklet.recap).toHaveLength(3);
    expect(booklet.recap[0]).toContain("Çarpan sayıya eşit ya da küçüktür");
    expect(booklet.recap[1]).toContain("4 için son iki basamak yeter");
    expect(booklet.recap[2]).toContain("hem 2'ye hem 3'e aynı anda");
  });

  it("not kartı örneğinin her cümlesi film transkriptinde durur", () => {
    const example = juniorBookletCopy("jr_06_mat-1").example;
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
    const life = juniorLessonByKey("jr_06_mat-1")?.lifeUse ?? "";
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
    expect(html).toContain("Kalansız Böler (≤ Sayı)");
    expect(html).toContain("Katlanarak Büyür (≥ Sayı)");
    expect(html).not.toContain("Böler &amp; Küçültür");
    expect(html).not.toContain("Çarpar &amp; Büyütür");
    expect(html).toContain('data-junior-factor-panel="multiplier"');
    expect(html).toContain('data-junior-factor-panel="multiple"');
    expect(html).toContain("overflow-y-auto");
    expect(html).toContain("min-h-0");
    expect(html).not.toContain("min-h-[22rem]");
    expect(html).not.toContain("min-h-[11rem]");
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

  it("ÇARPAN kartı Çarpanı kelimesinin startMs anında açılır", () => {
    const cue = cueById("cue-03");
    const spec = MAT_5_AUTHORED_CUES.find((row) => row.id === "cue-03");
    expect(spec?.markedText).toBe(cue.markedText);
    expect(cue.markedText).toContain("sayının {@showConceptCallout} Çarpanı");
    expect(cue.markedText).toContain("{@groupBy5} beşer");

    const carpan = cue.words?.find((word) => word.word === "Çarpanı");
    const kalan = cue.words?.find((word) => word.word === "kalan");
    const iste = cue.words?.find((word) => word.word === "İşte");
    expect(carpan).toBeDefined();
    expect(kalan).toBeDefined();
    expect(iste).toBeDefined();
    expect(iste!.startMs).toBeLessThan(kalan!.startMs);
    expect(kalan!.startMs).toBeLessThan(carpan!.startMs);

    const callout = cue.keyframes.find((keyframe) => keyframe.hook === "showConceptCallout");
    expect(callout?.atMs).toBe(carpan?.startMs);
    const parsed = parseMarkedCueText(spec!.markedText);
    expect(parsed.hookWordIndices.showConceptCallout).toBe(parsed.words.indexOf("Çarpanı"));

    const rebuilt = buildCueTimingFromBounds(spec!, cue.startMs, cue.endMs - cue.startMs, cue.words);
    expect(rebuilt.keyframes.find((keyframe) => keyframe.hook === "showConceptCallout")?.atMs).toBe(
      carpan?.startMs,
    );

    const kalanMid = Math.round((kalan!.startMs + kalan!.endMs) / 2);
    const duringKalan = reduceSceneState(JR_06_MAT_5_TIMELINE, kalanMid);
    expect(duringKalan.activeWord?.word).toBe("kalan");
    expect(duringKalan.callout).toBeNull();

    const atCarpan = reduceSceneState(JR_06_MAT_5_TIMELINE, carpan!.startMs);
    expect(atCarpan.activeWord?.word).toBe("Çarpanı");
    expect(atCarpan.callout?.badge).toBe("ÇARPAN (= BÖLEN)");

    const justBefore = reduceSceneState(JR_06_MAT_5_TIMELINE, carpan!.startMs - 1);
    expect(justBefore.callout).toBeNull();
    expect(justBefore.activeWord?.word).not.toBe("Çarpanı");
    const sayinin = cue.words?.find((word) => word.word === "sayının");
    if (sayinin && carpan!.startMs - 1 >= sayinin.startMs && carpan!.startMs - 1 <= sayinin.endMs) {
      expect(justBefore.activeWord?.word).toBe("sayının");
    } else {
      expect(justBefore.activeWordIndex).toBe(-1);
    }
  });

  it("0:35 saniyesinde amber kelime dışarıdadır", () => {
    const cue = cueById("cue-03");
    const ne = cue.words?.find((word) => word.word === "ne");
    const disarida = cue.words?.find((word) => word.word === "dışarıda");
    expect(ne).toBeDefined();
    expect(disarida).toBeDefined();
    expect(ne!.startMs).toBeLessThan(33_000);
    const spokenMid = Math.round((disarida!.startMs + disarida!.endMs) / 2);
    expect(spokenMid).toBeGreaterThan(34_500);
    expect(spokenMid).toBeLessThan(37_000);
    expect(reduceSceneState(JR_06_MAT_5_TIMELINE, spokenMid).activeWord?.word).toBe("dışarıda");
    expect(reduceSceneState(JR_06_MAT_5_TIMELINE, 35_881).activeWord?.word).toBe("dışarıda");
    expect(reduceSceneState(JR_06_MAT_5_TIMELINE, ne!.startMs + 20).activeWord?.word).toBe("ne");
    expect(cueById("cue-01").words?.[0]?.startMs).toBeLessThan(400);
  });

  it("150 ms ve uzun sessizlikte amber kelime indeksi -1 olur", () => {
    const cue = cueById("cue-03");
    const olur = cue.words?.find((word) => word.word === "olur?");
    const two = cue.words?.find((word) => word.word === "2");
    expect(olur).toBeDefined();
    expect(two).toBeDefined();
    expect(two!.startMs - olur!.endMs).toBeGreaterThanOrEqual(150);
    const gapMid = Math.round((olur!.endMs + two!.startMs) / 2);
    const silence = reduceSceneState(JR_06_MAT_5_TIMELINE, gapMid);
    expect(silence.activeWordIndex).toBe(-1);
    expect(silence.activeWord).toBeNull();
    expect(reduceSceneState(JR_06_MAT_5_TIMELINE, olur!.endMs).activeWord?.word).toBe("olur?");
    expect(reduceSceneState(JR_06_MAT_5_TIMELINE, olur!.endMs + 1).activeWordIndex).toBe(-1);

    const shortGap = captionProbe([
      { word: "bir", startMs: 0, endMs: 100 },
      { word: "sayı", startMs: 150, endMs: 300 },
    ]);
    expect(reduceSceneState(shortGap, 100).activeWord?.word).toBe("bir");
    expect(reduceSceneState(shortGap, 101).activeWordIndex).toBe(-1);
    expect(reduceSceneState(shortGap, 120).activeWordIndex).toBe(-1);
    expect(reduceSceneState(shortGap, 150).activeWord?.word).toBe("sayı");

    const mediumGap = captionProbe([
      { word: "hiç", startMs: 0, endMs: 100 },
      { word: "kalan", startMs: 250, endMs: 400 },
    ]);
    expect(reduceSceneState(mediumGap, 100).activeWord?.word).toBe("hiç");
    expect(reduceSceneState(mediumGap, 101).activeWordIndex).toBe(-1);
    expect(reduceSceneState(mediumGap, 249).activeWordIndex).toBe(-1);
    expect(reduceSceneState(mediumGap, 250).activeWord?.word).toBe("kalan");

    const longGap = captionProbe([
      { word: "bırakmadan", startMs: 0, endMs: 400 },
      { word: "tam", startMs: 1_620, endMs: 1_800 },
    ]);
    expect(reduceSceneState(longGap, 400).activeWord?.word).toBe("bırakmadan");
    expect(reduceSceneState(longGap, 401).activeWordIndex).toBe(-1);
    expect(reduceSceneState(longGap, 1_000).activeWordIndex).toBe(-1);
    expect(reduceSceneState(longGap, 1_620).activeWord?.word).toBe("tam");

    const lastWord = captionProbe([{ word: "diyoruz.", startMs: 0, endMs: 400 }]);
    expect(reduceSceneState(lastWord, 400).activeWord?.word).toBe("diyoruz.");
    expect(reduceSceneState(lastWord, 401).activeWordIndex).toBe(-1);
    expect(reduceSceneState(lastWord, 520).activeWordIndex).toBe(-1);
  });

  it("0 ms açılışında 'Sahne hazırlanıyor' yerine Dedektif Masası konsept görseli ve uzun sekanslarda cümle bazlı altyazı penceresi gösterir", async () => {
    const playerHtml = renderToStaticMarkup(
      createElement(JuniorPilotPlayer, { timeline: JR_06_MAT_5_TIMELINE }),
    );
    expect(playerHtml).not.toContain("Sahne hazırlanıyor");
    expect(playerHtml).toContain("BÖLÜNEBİLME DEDEKTİFLERİ MASASI");
    expect(playerHtml).toContain("data-junior-detective-welcome-desk");

    const cue13 = cueById("cue-13");
    const cue14 = cueById("cue-14");
    const words13 = cue13.words ?? [];
    const words14 = cue14.words ?? [];
    expect(words13.length).toBeGreaterThan(30);
    expect(words14.length).toBeGreaterThan(40);

    const lastIdx13 = words13.length - 1;
    const win13End = resolveCaptionSentenceWindow(
      words13,
      lastIdx13,
      words13[lastIdx13]!.startMs + 10,
    );
    expect(win13End.words.some((item) => item.originalIndex === lastIdx13)).toBe(true);
    expect(win13End.words.length).toBeLessThanOrEqual(18);

    const lastIdx14 = words14.length - 1;
    const win14End = resolveCaptionSentenceWindow(
      words14,
      lastIdx14,
      words14[lastIdx14]!.startMs + 10,
    );
    expect(win14End.words.some((item) => item.originalIndex === lastIdx14)).toBe(true);
    expect(win14End.words.length).toBeLessThanOrEqual(18);

    const dynamicMat5 = await loadPilotTimelineForLesson("jr_06_mat-1");
    expect(dynamicMat5?.lessonKey).toBe("jr_06_mat-1");
  });

  it("rakam kutusu ChromeOS'ta düz zemin, sistem fontu ve kontrastlı renk taşır", () => {
    const factorCue = cueById("cue-04");
    const shown = reduceSceneState(JR_06_MAT_5_TIMELINE, factorCue.endMs - 50);
    const factorHtml = renderToStaticMarkup(
      createElement(FactorMultipleStage, { state: shown, currentTimeMs: factorCue.endMs - 50 }),
    );
    expect(factorHtml).toContain('data-junior-digit-box="hero"');
    expect(factorHtml).toContain("background-color:#06b6d4");
    expect(factorHtml).toContain("color:#020617");
    expect(factorHtml).toContain("color-scheme:light");
    expect(factorHtml).toContain("font-family:system-ui, sans-serif");
    expect(factorHtml).toContain('data-junior-digit-box="factor"');
    expect(factorHtml).toContain("background-color:#0f172a");
    expect(factorHtml).toContain("color:#a5f3fc");
    expect(factorHtml).toContain("color-scheme:dark");

    const trapCue = cueById("cue-11");
    const atTrap = reduceSceneState(JR_06_MAT_5_TIMELINE, trapCue.endMs - 50);
    const trapHtml = renderToStaticMarkup(createElement(DetectiveBoardStage, { state: atTrap }));
    expect(trapHtml).toContain('data-junior-digit-box="tile"');
    expect(trapHtml).toContain('data-junior-digit-box="sum"');
    expect(trapHtml).toContain('data-junior-digit-box="sum-total"');
    expect(trapHtml).toContain("background-color:#9f1239");
    expect(trapHtml).toContain("color:#ffe4e6");
    expect(trapHtml).toContain("font-family:system-ui, sans-serif");
  });
});

function captionProbe(words: readonly WordTimestamp[]): TimelineJSON {
  const endMs = Math.max(...words.map((word) => word.endMs), 1);
  return {
    schemaVersion: "2.0.0",
    lessonKey: "jr_06_mat-1",
    title: "Altyazı sondası",
    grade: 6,
    subject: "Matematik",
    teacher: { name: "Selim", voice: "Fenrir", atempo: 0.94 },
    audio: { publicPath: "/media/junior/audio/probe.mp3", durationMs: endMs + 5_000, sampleRateHz: 48_000 },
    chapters: [{ id: "ch-1", title: "Sonda", startMs: 0, endMs: endMs + 5_000 }],
    cues: [
      {
        id: "cue-probe",
        chapterId: "ch-1",
        startMs: 0,
        endMs: endMs + 5_000,
        pauseAfterMs: 0,
        text: words.map((word) => word.word).join(" "),
        words: [...words],
        keyframes: [],
      },
    ],
  };
}
