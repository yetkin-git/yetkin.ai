import { describe, expect, it } from "vitest";
import {
  assertJuniorDailySceneVariety,
  assertJuniorExampleRepeatLimit,
  assertJuniorNoCliche,
  juniorTextHasCliche,
  stripJuniorCliches,
} from "@/lib/junior/content-rules";
import { microLessonPlan, microStepBadge, MICRO_LESSON_MAX_MS, MICRO_LESSON_MIN_MS } from "@/lib/junior/micro-lesson";
import {
  completeMicroStep,
  holdMicroStep,
  microProgressStorageKey,
  readMicroProgress,
  resumeCursor,
  writeMicroProgress,
} from "@/lib/junior/micro-progress";
import { JUNIOR_FEN_1_SCENARIO } from "@/lib/junior/content/fen/1";
import { juniorMicroQuestion, juniorMicroQuestionIsGeneric } from "@/lib/junior/micro-question";
import {
  JUNIOR_STAR_PULSE_MS,
  juniorCuePauses,
  juniorPauseKind,
  juniorPlayerTimeline,
  juniorMarkerAt,
  juniorMarkerCrossings,
  juniorStarCrossings,
  juniorStarShouldGlow,
  type JuniorPlayerTimeline,
} from "@/lib/junior/player-clock";
import { juniorLessonFromScenario } from "@/lib/junior/scenario";

function timelineOf(durationMs: number): JuniorPlayerTimeline {
  const windows = [];
  let cursor = 0;
  let index = 0;
  while (cursor < durationMs) {
    const endMs = Math.min(durationMs, cursor + 8_000);
    windows.push({
      index,
      text: `Cümle ${index} burada biter.`,
      startMs: cursor,
      endMs,
      noteStart: index,
      noteEnd: index + 1,
    });
    cursor = endMs;
    index += 1;
  }
  return { durationMs, pieces: [], windows };
}

describe("mikro-ders ve sert durak", () => {
  it("defter, cümle kur ve söz sende defter kartı açar; gövdedeki kurmak açmaz", () => {
    expect(juniorPauseKind("Şimdi defterine yaz.")).toBe("notebook");
    expect(juniorPauseKind("Bir cümle kur.")).toBe("notebook");
    expect(juniorPauseKind("Söz sende.")).toBe("notebook");
    expect(juniorPauseKind("Şimdi sıra sende.")).toBe("turn");
    expect(juniorPauseKind("Olumsuz bir cümle kurmak istediğinde doesn't kullanırsın.")).toBeNull();
  });

  it("dikkat cümlesinin başında durur ve özet kapısına kadar gövdeyi tutar", () => {
    const note = [
      "Merhaba arkadaşım.",
      "Tuzaklara Düşme! Birlikte bakalım.",
      "2 çarpı 3, 6 eder.",
      "Bugün Neler Öğrendik? Üslü ifade tekrarlı çarpımdır.",
    ].join(" ");
    const timeline = juniorPlayerTimeline(note, [], 4);
    const plan = microLessonPlan("jr_06_mat-1", timeline);
    const attention = plan.pauses.find((pause) => pause.kind === "attention");
    expect(attention).toBeTruthy();
    expect(attention?.attentionText).toContain("Birlikte bakalım");
    expect(attention?.attentionText).toContain("6 eder");
    expect(attention?.attentionText?.includes("Bugün Neler Öğrendik")).toBe(false);
    expect(attention!.attentionUntilMs).toBeGreaterThan(attention!.endMs);
    expect(attention!.endMs).toBeGreaterThan(0);
  });

  it("yönlendirme cümlesinin bitişinde durak üretir", () => {
    const note = "Merhaba arkadaşım. Defterine yaz. Sonra bu cümleyle devam ederiz.";
    const timeline = juniorPlayerTimeline(note, [], 3);
    const pauses = juniorCuePauses(timeline);
    expect(pauses.some((pause) => pause.kind === "notebook")).toBe(true);
    expect(pauses[0]?.endMs).toBeGreaterThan(0);
  });

  it("7,5 dakikalık kaseti 2 ile 4 dakika arasındaki adımlara böler", () => {
    const plan = microLessonPlan("jr_06_mat-1", timelineOf(450_000));
    expect(plan.steps.length).toBeGreaterThanOrEqual(2);
    for (const step of plan.steps) {
      const span = step.endMs - step.startMs;
      expect(span).toBeGreaterThanOrEqual(MICRO_LESSON_MIN_MS);
      expect(span).toBeLessThanOrEqual(MICRO_LESSON_MAX_MS);
    }
    expect(plan.steps[0]?.startMs).toBe(0);
    expect(plan.steps[0]?.title).toBe("🎯 1. Bölüm: Kavram");
    expect(plan.steps[1]?.title).toBe("💡 2. Bölüm: Örnek & Taktik");
    expect(plan.steps.every((step) => step.title === microStepBadge(step.index))).toBe(true);
    expect(plan.steps.every((step) => !step.title.includes("Mikro ders"))).toBe(true);
    expect(plan.steps[plan.steps.length - 1]?.endMs).toBe(450_000);
    expect(plan.pauses.some((pause) => pause.kind === "turn")).toBe(true);
  });

  it("yıldız geçişi defter durağını kesmez ve kısa pencerede parıldar", () => {
    const pauses = [
      { endMs: 1_000, kind: "notebook" as const },
      { endMs: 4_000, kind: "turn" as const },
      { endMs: 9_000, kind: "attention" as const },
    ];
    expect(juniorStarCrossings(pauses, 3_500, 4_100, 20_000).map((pause) => pause.endMs)).toEqual([4_000]);
    expect(juniorStarCrossings(pauses, 4_100, 3_000, 20_000)).toEqual([]);
    expect(JUNIOR_STAR_PULSE_MS).toBeGreaterThanOrEqual(3_000);
    expect(JUNIOR_STAR_PULSE_MS).toBeLessThanOrEqual(5_000);
    expect(juniorStarShouldGlow(4_000, 4_000 + JUNIOR_STAR_PULSE_MS)).toBe(true);
    expect(juniorStarShouldGlow(4_000, 4_000 + JUNIOR_STAR_PULSE_MS + 1)).toBe(false);
    expect(juniorMarkerCrossings(pauses, 3_500, 4_100, 20_000).map((pause) => pause.endMs)).toEqual([4_000]);
    expect(juniorMarkerCrossings(pauses, 500, 9_100, 20_000).map((pause) => pause.endMs)).toEqual([
      1_000, 4_000, 9_000,
    ]);
    expect(juniorMarkerAt(pauses, 3_900)).toEqual(pauses[0]);
    expect(juniorMarkerAt(pauses, 4_000)?.kind).toBe("turn");
    expect(juniorMarkerAt(pauses, 500)).toBeNull();
  });

  it("jr_06_fen-1 yıldız sorusu senaryodan gelir ve kaset cümlesine yazılmaz", () => {
    const question = "Güneş sistemindeki gezegenleri kendi cümlelerinle sırayla tekrarla.";
    expect(juniorMicroQuestion(JUNIOR_FEN_1_SCENARIO)).toBe(question);
    expect(juniorMicroQuestionIsGeneric("Bu parçayı kendi cümlenle söyle.")).toBe(true);
    expect(juniorMicroQuestionIsGeneric("Şimdi bunu kendi cümlenle tek bir cümleyle söyle.")).toBe(true);
    const lesson = juniorLessonFromScenario(JUNIOR_FEN_1_SCENARIO);
    expect(lesson.listenText.includes(question)).toBe(false);
    expect(lesson.mebNote.includes(question)).toBe(false);
  });

  it("tamamlanan adımı yeşil izde tutar ve kalınan karttan döner", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    expect(microProgressStorageKey("young", "profil", "yks-1")).toContain("yetkin.young.micro.v1");
    const held = holdMicroStep({ completed: [0], holding: null }, 1);
    writeMicroProgress("junior", "profil", "jr_06_mat-1", held, storage);
    const read = readMicroProgress("junior", "profil", "jr_06_mat-1", storage);
    expect(resumeCursor(read, 3)).toEqual({ stepIndex: 1, holding: true, done: false });
    const done = completeMicroStep(read, 1);
    writeMicroProgress("junior", "profil", "jr_06_mat-1", done, storage);
    expect(resumeCursor(readMicroProgress("junior", "profil", "jr_06_mat-1", storage), 3)).toEqual({
      stepIndex: 2,
      holding: false,
      done: false,
    });
  });
});

describe("pedagoji guardrail", () => {
  it("klişeyi siler ve üçüncü tekrarı düşürür", () => {
    expect(juniorTextHasCliche("Aferin sana! Devam edelim.")).toBe(true);
    expect(stripJuniorCliches("Şurası aklında kalsın tamam mı: Denk kesir miktarı değiştirmez.")).toBe(
      "Denk kesir miktarı değiştirmez.",
    );
    expect(stripJuniorCliches("Bu çok önemli bir dönüm noktasıdır.")).toContain("çok önemli bir dönüm");
    expect(() => assertJuniorNoCliche("Bak burası çok önemli. Bunu unutma.")).toThrow(/Klişe/);
    expect(() => assertJuniorNoCliche("Bu çok önemli bir dönüm noktasıdır.")).not.toThrow();
    const sentence = "Mutfakta 4 elmayı iki tabağa böl ve farkı söyle.";
    expect(() => assertJuniorExampleRepeatLimit(`${sentence} ${sentence}`)).not.toThrow();
    expect(() => assertJuniorExampleRepeatLimit(`${sentence} ${sentence} ${sentence}`)).toThrow(/üçüncü/);
    expect(() => assertJuniorExampleRepeatLimit("2 üssü 3 eder. Sonra 2 üssü 3 yine. Ve 2 üssü 3 üçüncü.")).toThrow(
      /sayısal/,
    );
  });

  it("en az üç günlük sahne ister", () => {
    expect(() => assertJuniorDailySceneVariety("Odanda lego kulesi kur. Mutfakta bardağa bak.")).not.toThrow();
    expect(() => assertJuniorDailySceneVariety("Yalnızca sayıyı söyle.")).toThrow(/çeşitliliği/);
  });
});
