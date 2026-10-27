import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { gradeJuniorActivityRail, publicJuniorActivityRail } from "@/lib/junior/activity-rail";
import {
  MAT_5_AUTHORED_CUES,
  MAT_5_DRAFT_TIMELINE,
  mat5SingleRequestListenText,
  parseMarkedCueText,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import { JR_06_MAT_5_TIMELINE, getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { reduceSceneState } from "@/lib/junior/pilot-engine/state-reducer";
import {
  assertSealedPilotTimeline,
  pilotTimelineUsesDraftClock,
} from "@/lib/junior/pilot-engine/timeline-seal";

describe("JuniorCinemaEngine v2 Pilot (jr_06_mat-1)", () => {
  it("14 sekansı tek TTS bloğunda birleştirir ve fırın tek generateContent çağırır", () => {
    const block = mat5SingleRequestListenText();
    expect(MAT_5_AUTHORED_CUES).toHaveLength(14);
    expect(block.split("[pause]")).toHaveLength(14);
    for (const cue of MAT_5_AUTHORED_CUES) {
      expect(block).toContain(parseMarkedCueText(cue.markedText).cleanText);
    }
    const bake = readFileSync(join(process.cwd(), "scripts/bake-junior-pilot-tts.ts"), "utf8");
    expect(bake.match(/models\.generateContent/g)).toHaveLength(1);
    expect(bake).toContain("mat5SingleRequestListenText");
    expect(bake).toContain("singleShot: true");
    expect(bake).toContain("alignSingleWavToMat5Cues");
    expect(bake).toContain("sealMat5SentenceBreaths");
    expect(bake).toContain("API çağrı sayısı:");
  });

  it("14 sekansı, 5 bölümü ve açılış PCM saatini eksiksiz yükler", () => {
    const timeline = getPilotTimelineForLesson("jr_06_mat-1");
    expect(timeline).not.toBeNull();
    expect(getPilotTimelineForLesson("jr_06_mat-4")).toBeNull();

    expect(JR_06_MAT_5_TIMELINE.lessonKey).toBe("jr_06_mat-1");
    expect(JR_06_MAT_5_TIMELINE.teacher.voice).toBe("Fenrir");
    expect(JR_06_MAT_5_TIMELINE.teacher.atempo).toBe(0.94);
    expect(JR_06_MAT_5_TIMELINE.chapters).toHaveLength(5);
    expect(JR_06_MAT_5_TIMELINE.cues).toHaveLength(14);
    expect(JR_06_MAT_5_TIMELINE.audio.durationMs).toBeGreaterThan(240_000);
    expect(JR_06_MAT_5_TIMELINE.audio.durationMs).toBeLessThan(720_000);
    expect(JR_06_MAT_5_TIMELINE.cues[0]?.endMs).toBe(14_340);
    expect(JR_06_MAT_5_TIMELINE.cues[0]?.endMs).toBe(JR_06_MAT_5_TIMELINE.cues[1]?.startMs);

    // Yapay storySpine veya kalıp papağan cümlesi bulunmamalı
    const fullText = JR_06_MAT_5_TIMELINE.cues.map((c) => c.text).join(" ");
    expect(fullText).not.toContain("yüksek sesle say");
    expect(fullText).not.toContain("Girişteki sahneyi aklında tut");
    expect(fullText.toLocaleLowerCase("tr-TR")).toContain("bölünebilme dedektifleri");

    const pilot = resolveJuniorPlayback("jr_06_mat-1");
    const sealed = resolveJuniorPlayback("jr_06_mat-4");
    expect(pilot.engine).toBe("pilot");
    expect(sealed.engine).toBe("sealed");
    if (pilot.engine === "pilot") {
      expect(pilot.timeline).toBe(JR_06_MAT_5_TIMELINE);
    }
    expect(pilotTimelineUsesDraftClock(JR_06_MAT_5_TIMELINE, MAT_5_DRAFT_TIMELINE)).toBe(false);
    expect(() => assertSealedPilotTimeline(JR_06_MAT_5_TIMELINE)).not.toThrow();
    expect(() =>
      assertSealedPilotTimeline({
        ...JR_06_MAT_5_TIMELINE,
        cues: JR_06_MAT_5_TIMELINE.cues.map((cue, index) =>
          index === 0 ? { ...cue, text: "kopuk konuşma" } : cue,
        ),
      }),
    ).toThrow(/yazarlıktan koptu/);

    const player = readFileSync(join(process.cwd(), "components/junior/vector-player.tsx"), "utf8");
    expect(player).toContain("resolveJuniorPlayback");
    expect(player).not.toContain("LegacyVectorPlayer");
    expect(player).toContain('playback.engine === "pilot"');
  });

  it("reduceSceneState zaman akışına göre sahne durumunu deterministik olarak katlar", () => {
    // 1) cue-01 sonu: 12 cam bilye masada
    const cue1End = JR_06_MAT_5_TIMELINE.cues[0]!.endMs - 50;
    const state1 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue1End);
    expect(state1.layout).toBe("marble-tray");
    expect(state1.marblesSpawned).toBe(true);
    expect(state1.marbleCount).toBe(12);

    // 2) cue-03 sonu: 5'erli gruplamada kalan 2 bilye ve Çarpan callout'u
    const cue3End = JR_06_MAT_5_TIMELINE.cues[2]!.endMs - 50;
    const state3 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue3End);
    expect(state3.marbleGroup.groupSize).toBe(5);
    expect(state3.marbleGroup.remainder).toBe(2);
    expect(state3.callout?.badge).toContain("ÇARPAN");

    // 3) cue-05 sonu: Çarpan ağacı (1,2,3,6) + Kat kulesi (6,12,18,24)
    const cue5End = JR_06_MAT_5_TIMELINE.cues[4]!.endMs - 50;
    const state5 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue5End);
    expect(state5.layout).toBe("factor-vs-multiple");
    expect(state5.factorTree.factors).toEqual([1, 2, 3, 6]);
    expect(state5.multipleTower.visible).toBe(true);
    expect(state5.multipleTower.comparisonLeft).toContain("Çarpan");

    // 4) cue-06 sonu: Son basamak dedektifi 24 sayısını inceler, büyüteç 4'te
    const cue6 = JR_06_MAT_5_TIMELINE.cues.find((cue) => cue.id === "cue-06");
    expect(cue6).toBeDefined();
    const cue6End = cue6!.endMs - 50;
    const state6 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue6End);
    expect(state6.layout).toBe("detective-last-digit");
    expect(state6.detective.value).toBe(24);
    expect(state6.detective.highlightedDigit).toBe("4");
    expect(state6.detective.magnifyingGlass).toBe(true);
    expect(state6.detective.verdicts.some((v) => v.rule === 2 && v.pass)).toBe(true);

    // 5) cue-09 sonu: Rakam toplama dedektifi 2 + 4 = 6
    const cue9 = JR_06_MAT_5_TIMELINE.cues.find((cue) => cue.id === "cue-09");
    expect(cue9).toBeDefined();
    const cue9End = cue9!.endMs - 50;
    const state9 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue9End);
    expect(state9.layout).toBe("detective-digit-sum");
    expect(state9.detective.digitSum?.expression).toBe("2 + 4 = 6");
    expect(state9.detective.verdicts.some((v) => v.rule === 3 && v.pass)).toBe(true);

    // 6) cue-13: 116 sayısında son iki basamak ve 100 ÷ 4 gerekçesi
    const cue13 = JR_06_MAT_5_TIMELINE.cues.find((cue) => cue.id === "cue-13");
    expect(cue13).toBeDefined();
    const state13 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue13!.endMs - 50);
    expect(state13.layout).toBe("detective-last-digit");
    expect(state13.detective.value).toBe(116);
    expect(state13.detective.highlightedTarget).toBe("last-two");
    expect(state13.detective.verdicts.some((verdict) => verdict.rule === 4 && verdict.pass)).toBe(true);
    expect(cue13!.text).toContain("100 bölü 4");
    expect(cue13!.text).toContain("son iki basamak");

    // 7) cue-14: 24 hem 2 hem 3 olduğu için 6
    const cue14 = JR_06_MAT_5_TIMELINE.cues.find((cue) => cue.id === "cue-14");
    expect(cue14).toBeDefined();
    const state14 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue14!.endMs - 50);
    expect(state14.detective.verdicts.some((verdict) => verdict.rule === 6 && verdict.pass)).toBe(true);
    expect(cue14!.text).toContain("çifte koşul");
    expect(state14.callout?.text).toContain("15");

    // 8) cue-12 sonu: Özet kartları ve Sıra Sende görevi
    const cue12 = JR_06_MAT_5_TIMELINE.cues.find((cue) => cue.id === "cue-12");
    expect(cue12).toBeDefined();
    const cue12End = cue12!.endMs - 50;
    const state12 = reduceSceneState(JR_06_MAT_5_TIMELINE, cue12End);
    expect(state12.layout).toBe("summary-board");
    expect(state12.summaryCards).toHaveLength(5);
    expect(state12.echoPrompt).toContain("24 ve 30");
  });

  it("jr_06_mat-1 Bölünebilme Dedektifleri etkinliklerini (eşleştirme, boşluk doldurma, dedektif bulmacası) doğrular", () => {
    const rail = publicJuniorActivityRail("jr_06_mat-1");
    expect(rail).toHaveLength(3);

    const match = rail[0]!;
    const cloze = rail[1]!;
    const order = rail[2]!;
    expect(match.kind).toBe("match");
    expect(cloze.kind).toBe("cloze");
    expect(order.kind).toBe("order");

    if (match.kind === "match") {
      expect(match.left.map((l) => l.label)).toEqual([
        "2, 5 ve 10 Kuralları",
        "3 ve 9 Kuralları",
        "Çarpan (= Bölen)",
        "Kat",
        "4 Kuralı",
        "6 Kuralı",
      ]);
    }
    if (cloze.kind === "cloze") {
      expect(cloze.gaps).toHaveLength(5);
      expect(cloze.wordBank).toEqual(["5", "3", "çarpanları", "4", "6"]);
    }
    if (order.kind === "order") {
      expect(order.tiles.map((t) => t.label)).toEqual(["24", "15", "30", "18", "116"]);
      expect(order.puzzle?.rockets.map((r) => r.label)).toEqual([
        "2'ye Bölünenler",
        "4'e Bölünenler",
        "5'e Bölünenler",
        "10'a Bölünenler",
        "3'e Bölünenler",
        "6'ya Bölünenler",
        "9'a Bölünenler",
      ]);
    }

    const perfect = gradeJuniorActivityRail("jr_06_mat-1", [
      {
        id: match.id,
        matches: { m1: "r1", m2: "r2", m3: "r3", m4: "r4", m5: "r5", m6: "r6" },
      },
      {
        id: cloze.id,
        clozes: { g1: "5", g2: "3", g3: "çarpanları", g4: "4", g5: "6" },
      },
      {
        id: order.id,
        placements: { n24: "r4", n15: "r5", n30: "r6", n18: "r9", n116: "r4" },
      },
    ]);
    expect(perfect?.score).toBe(100);
    expect(perfect?.correct).toBe(3);
    expect(perfect?.notes.every((n) => n.ok)).toBe(true);

    const multiRocket = gradeJuniorActivityRail("jr_06_mat-1", [
      {
        id: match.id,
        matches: { m1: "r1", m2: "r2", m3: "r3", m4: "r4", m5: "r5", m6: "r6" },
      },
      {
        id: cloze.id,
        clozes: { g1: "5", g2: "3", g3: "çarpanları", g4: "4", g5: "6" },
      },
      {
        id: order.id,
        placements: {
          n24: "r2,r3,r4,r6",
          n15: "r5,r3",
          n30: "r2,r5,r10,r3,r6",
          n18: "r2,r3,r6,r9",
          n116: "r2,r4",
        },
      },
    ]);
    expect(multiRocket?.score).toBe(100);
    expect(multiRocket?.correct).toBe(3);
    expect(multiRocket?.notes.every((n) => n.ok)).toBe(true);
  });
});
