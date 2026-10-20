/**
 * Junior ders ilerleme motoru — Hızlı Araçlar / karne yerel SSOT.
 * İzleme yüzdesi `micro-progress` ile kalır; bu katman etkinlik, simülasyon,
 * soru bankası puanı ve rozet eşiğini tek kayıtta tutar.
 */

export const JUNIOR_LESSON_PROGRESS_EVENT = "yetkin.junior.lesson-progress" as const;
export const JUNIOR_BADGE_UNLOCK_THRESHOLD = 3 as const;

export type JuniorProgressGameId =
  | "match"
  | "cloze"
  | "puzzle"
  | "sim-marble"
  | "sim-balance"
  | "sim-chicken"
  | "sim-egg"
  | "sim-exponent-tower"
  | "sim-ops-priority"
  | "sim-distribute-area"
  | "sim-problem-steps";

export type JuniorLessonProgress = {
  completedGames: JuniorProgressGameId[];
  /** Etkinlik stüdyosu son kontrol yüzdesi (0–100). */
  activityScore: number | null;
  /** Soru bankası son test yüzdesi (0–100). */
  quizScore: number | null;
  badgeUnlocked: boolean;
  /** Rozet popup'ı bir kez gösterildi. */
  badgeCelebrated: boolean;
};

export type JuniorLessonProgressEventDetail = {
  profileId: string;
  lessonKey: string;
  progress: JuniorLessonProgress;
  justUnlockedBadge: boolean;
};

export type MarkGameCompleteResult = {
  progress: JuniorLessonProgress;
  justUnlockedBadge: boolean;
};

const EMPTY: JuniorLessonProgress = {
  completedGames: [],
  activityScore: null,
  quizScore: null,
  badgeUnlocked: false,
  badgeCelebrated: false,
};

const GAME_IDS = new Set<string>([
  "match",
  "cloze",
  "puzzle",
  "sim-marble",
  "sim-balance",
  "sim-chicken",
  "sim-egg",
  "sim-exponent-tower",
  "sim-ops-priority",
  "sim-distribute-area",
  "sim-problem-steps",
]);

export function juniorLessonProgressStorageKey(profileId: string, lessonKey: string): string {
  const profile = profileId.trim() || "anon";
  const lesson = lessonKey.trim() || "ders";
  return `yetkin.junior.lesson-progress.v1:${profile}:${lesson}`;
}

function storageOrNull(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function clampPercent(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function parseProgress(raw: string | null): JuniorLessonProgress {
  if (!raw) {
    return { ...EMPTY, completedGames: [] };
  }
  try {
    const value = JSON.parse(raw) as Partial<JuniorLessonProgress>;
    const completedGames = Array.isArray(value.completedGames)
      ? [...new Set(value.completedGames.filter((id): id is JuniorProgressGameId => GAME_IDS.has(id)))]
      : [];
    const badgeUnlocked =
      Boolean(value.badgeUnlocked) || completedGames.length >= JUNIOR_BADGE_UNLOCK_THRESHOLD;
    return {
      completedGames,
      activityScore: clampPercent(value.activityScore),
      quizScore: clampPercent(value.quizScore),
      badgeUnlocked,
      badgeCelebrated: Boolean(value.badgeCelebrated),
    };
  } catch {
    return { ...EMPTY, completedGames: [] };
  }
}

function emitProgress(
  profileId: string,
  lessonKey: string,
  progress: JuniorLessonProgress,
  justUnlockedBadge: boolean,
): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<JuniorLessonProgressEventDetail>(JUNIOR_LESSON_PROGRESS_EVENT, {
      detail: { profileId, lessonKey, progress, justUnlockedBadge },
    }),
  );
}

function persist(
  profileId: string,
  lessonKey: string,
  progress: JuniorLessonProgress,
  justUnlockedBadge: boolean,
  storage: Pick<Storage, "setItem"> | null,
): JuniorLessonProgress {
  if (storage) {
    try {
      storage.setItem(juniorLessonProgressStorageKey(profileId, lessonKey), JSON.stringify(progress));
    } catch {
      /* gizli pencere veya dolu disk izi düşürmez */
    }
  }
  emitProgress(profileId, lessonKey, progress, justUnlockedBadge);
  return progress;
}

export function readLessonProgress(
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem"> | null = storageOrNull(),
): JuniorLessonProgress {
  if (!storage) {
    return { ...EMPTY, completedGames: [] };
  }
  return parseProgress(storage.getItem(juniorLessonProgressStorageKey(profileId, lessonKey)));
}

export function writeLessonProgress(
  profileId: string,
  lessonKey: string,
  progress: JuniorLessonProgress,
  storage: Pick<Storage, "setItem"> | null = storageOrNull(),
): JuniorLessonProgress {
  return persist(profileId, lessonKey, progress, false, storage);
}

/** Saf birleştirme — test ve sunucusuz hesap. */
export function mergeGameComplete(
  current: JuniorLessonProgress,
  gameId: JuniorProgressGameId,
): MarkGameCompleteResult {
  const completedGames = current.completedGames.includes(gameId)
    ? current.completedGames
    : [...current.completedGames, gameId];
  const wasUnlocked = current.badgeUnlocked || current.completedGames.length >= JUNIOR_BADGE_UNLOCK_THRESHOLD;
  const badgeUnlocked = completedGames.length >= JUNIOR_BADGE_UNLOCK_THRESHOLD;
  const justUnlockedBadge = badgeUnlocked && !wasUnlocked;
  return {
    progress: {
      ...current,
      completedGames,
      badgeUnlocked,
    },
    justUnlockedBadge,
  };
}

export function markGameComplete(
  profileId: string,
  lessonKey: string,
  gameId: JuniorProgressGameId,
  storage: Pick<Storage, "getItem" | "setItem"> | null = storageOrNull(),
): MarkGameCompleteResult {
  const current = readLessonProgress(profileId, lessonKey, storage);
  const result = mergeGameComplete(current, gameId);
  if (
    result.progress.completedGames.length === current.completedGames.length &&
    result.progress.badgeUnlocked === current.badgeUnlocked
  ) {
    return { progress: current, justUnlockedBadge: false };
  }
  persist(profileId, lessonKey, result.progress, result.justUnlockedBadge, storage);
  return result;
}

export function recordActivityScore(
  profileId: string,
  lessonKey: string,
  score: number,
  storage: Pick<Storage, "getItem" | "setItem"> | null = storageOrNull(),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  const activityScore = clampPercent(score);
  if (activityScore === current.activityScore) {
    return current;
  }
  return persist(profileId, lessonKey, { ...current, activityScore }, false, storage);
}

export function recordQuizScore(
  profileId: string,
  lessonKey: string,
  score: number,
  storage: Pick<Storage, "getItem" | "setItem"> | null = storageOrNull(),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  const quizScore = clampPercent(score);
  if (quizScore === current.quizScore) {
    return current;
  }
  return persist(profileId, lessonKey, { ...current, quizScore }, false, storage);
}

export function markBadgeCelebrated(
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null = storageOrNull(),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  if (current.badgeCelebrated) {
    return current;
  }
  return persist(profileId, lessonKey, { ...current, badgeCelebrated: true }, false, storage);
}

/** Rozet eşiğine giden tamamlanan oyun sayısı (üst sınır threshold). */
export function badgeProgressCount(progress: JuniorLessonProgress): number {
  return Math.min(progress.completedGames.length, JUNIOR_BADGE_UNLOCK_THRESHOLD);
}

/** Etkinlik + soru bankası birleşik görünen puan (karne paneli). */
export function combinedReportScore(progress: JuniorLessonProgress): number | null {
  const parts = [progress.activityScore, progress.quizScore].filter(
    (value): value is number => typeof value === "number",
  );
  if (parts.length === 0) {
    return null;
  }
  return Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length);
}

export function activityKindToGameId(kind: string): JuniorProgressGameId | null {
  if (kind === "match") return "match";
  if (kind === "cloze") return "cloze";
  if (kind === "order") return "puzzle";
  return null;
}

export function simModeToGameId(mode: string): JuniorProgressGameId | null {
  if (mode === "marble") return "sim-marble";
  if (mode === "balance") return "sim-balance";
  if (mode === "chicken") return "sim-chicken";
  if (mode === "egg") return "sim-egg";
  if (mode === "exponent-tower") return "sim-exponent-tower";
  if (mode === "ops-priority") return "sim-ops-priority";
  if (mode === "distribute-area") return "sim-distribute-area";
  if (mode === "problem-steps") return "sim-problem-steps";
  return null;
}
