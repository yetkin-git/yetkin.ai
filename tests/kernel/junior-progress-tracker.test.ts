import { describe, expect, it } from "vitest";
import {
  activityKindToGameId,
  badgeProgressCount,
  combinedReportScore,
  JUNIOR_BADGE_UNLOCK_THRESHOLD,
  juniorLessonProgressStorageKey,
  mergeGameComplete,
  readLessonProgress,
  recordActivityScore,
  recordQuizScore,
  simModeToGameId,
  writeLessonProgress,
  type JuniorLessonProgress,
} from "@/lib/junior/progress-tracker";

function memoryStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
    key: (index) => [...map.keys()][index] ?? null,
  };
}

const EMPTY: JuniorLessonProgress = {
  completedGames: [],
  activityScore: null,
  quizScore: null,
  badgeUnlocked: false,
  badgeCelebrated: false,
};

describe("junior progress-tracker", () => {
  it("3 farklı oyun tamamlanınca rozeti açar", () => {
    let state = EMPTY;
    const first = mergeGameComplete(state, "match");
    expect(first.justUnlockedBadge).toBe(false);
    state = first.progress;

    const second = mergeGameComplete(state, "sim-marble");
    expect(second.justUnlockedBadge).toBe(false);
    state = second.progress;

    const third = mergeGameComplete(state, "sim-chicken");
    expect(third.justUnlockedBadge).toBe(true);
    expect(third.progress.badgeUnlocked).toBe(true);
    expect(badgeProgressCount(third.progress)).toBe(JUNIOR_BADGE_UNLOCK_THRESHOLD);
  });

  it("aynı oyunu tekrar işaretlemek eşiği ilerletmez", () => {
    const once = mergeGameComplete(EMPTY, "cloze");
    const twice = mergeGameComplete(once.progress, "cloze");
    expect(twice.progress.completedGames).toEqual(["cloze"]);
    expect(twice.justUnlockedBadge).toBe(false);
  });

  it("etkinlik ve test puanını karne ortalamasına yazar", () => {
    const storage = memoryStorage();
    recordActivityScore("p1", "jr_06_mat-5", 100, storage);
    recordQuizScore("p1", "jr_06_mat-5", 80, storage);
    const progress = readLessonProgress("p1", "jr_06_mat-5", storage);
    expect(progress.activityScore).toBe(100);
    expect(progress.quizScore).toBe(80);
    expect(combinedReportScore(progress)).toBe(90);
  });

  it("LocalStorage anahtarı profil ve dersi ayırır", () => {
    expect(juniorLessonProgressStorageKey("p1", "jr_06_mat-5")).toBe(
      "yetkin.junior.lesson-progress.v1:p1:jr_06_mat-5",
    );
    const storage = memoryStorage();
    writeLessonProgress(
      "p1",
      "jr_06_mat-5",
      { ...EMPTY, completedGames: ["match"], badgeUnlocked: false },
      storage,
    );
    expect(readLessonProgress("p1", "jr_06_mat-5", storage).completedGames).toEqual(["match"]);
    expect(readLessonProgress("p2", "jr_06_mat-5", storage).completedGames).toEqual([]);
  });

  it("kind / sim eşlemesi doğru kimlik üretir", () => {
    expect(activityKindToGameId("match")).toBe("match");
    expect(activityKindToGameId("order")).toBe("puzzle");
    expect(activityKindToGameId("unknown")).toBeNull();
    expect(simModeToGameId("egg")).toBe("sim-egg");
    expect(simModeToGameId("x")).toBeNull();
  });
});
