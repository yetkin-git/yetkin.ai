import { describe, expect, it } from "vitest";
import {
  assertJuniorProgressShape,
  createMemoryJuniorStore,
} from "@/lib/junior/memory-port";

describe("junior_progress bellek kuralı", () => {
  it("quiz modunu kabul eder; tanımsız modu junior_progress_shape ile reddeder", async () => {
    expect(() =>
      assertJuniorProgressShape({
        mode: "quiz",
        score: 80,
        xpAwarded: 10,
        lessonKey: "jr_06_mat-1",
      }),
    ).not.toThrow();

    const store = createMemoryJuniorStore();
    const saved = await store.recordOutcome({
      progress: {
        userId: "parent",
        profileId: "child",
        lessonKey: "jr_06_mat-1",
        mode: "quiz",
        praised: "Payı doğru söyledin.",
        missing: "Paydayı da söyle.",
        advice: "Bir kez daha anlat.",
        score: 80,
        xpAwarded: 10,
      },
      points: 10,
      badges: [],
    });
    expect(saved.progress.mode).toBe("quiz");

    expect(() =>
      assertJuniorProgressShape({
        mode: "listen",
        score: 80,
        xpAwarded: 10,
        lessonKey: "jr_06_mat-1",
      }),
    ).toThrow("junior_progress_shape");
    expect(() =>
      assertJuniorProgressShape({
        mode: "quiz",
        score: 101,
        xpAwarded: 10,
        lessonKey: "jr_06_mat-1",
      }),
    ).toThrow("junior_progress_shape");
  });
});
