/**
 * Junior ders ilerleme motoru — Hızlı Araçlar / karne yerel SSOT.
 * İzleme yüzdesi `micro-progress` ile kalır; bu katman etkinlik, simülasyon,
 * soru bankası puanı ve rozet eşiğini tek kayıtta tutar.
 */

import { migrateJuniorLessonStores } from "@/lib/junior/lesson-key-alias";

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
  /** Pilot ders 1 defalık ücretsiz Dinle ve Anlat deneme hakkı kullanıldı mı? */
  trialTellUsed?: boolean;
  /** Pilot ders 1 defalık ücretsiz Konu Kontrolü (Test) deneme hakkı kullanıldı mı? */
  trialQuizUsed?: boolean;
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
  trialTellUsed: false,
  trialQuizUsed: false,
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

function windowStorage(kind: "local" | "session"): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

/** Profil varsa kalıcı iz. Misafir sayaçları oturumda durur; eski anonim iz yeni oturumu şişirmez. */
function scoreStorage(profileId: string): Pick<Storage, "getItem" | "setItem"> | null {
  return windowStorage(profileId.trim() ? "local" : "session");
}

function durableTrialStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  return windowStorage("local");
}

function isGuestSessionStore(
  profileId: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null,
): boolean {
  return !profileId.trim() && storage != null && storage === windowStorage("session");
}

/**
 * Misafir sayaçları oturum kaydındandır. «Bir kez» deneme kilidi kalıcı kayıttadır.
 * Eski anonim oyunun puanı yeni oturuma taşınmaz.
 */
export function guestSessionProgress(
  sessionRecord: JuniorLessonProgress,
  durableRecord: JuniorLessonProgress,
): JuniorLessonProgress {
  const completedGames = sessionRecord.completedGames;
  const badgeUnlocked = completedGames.length >= JUNIOR_BADGE_UNLOCK_THRESHOLD;
  return {
    completedGames,
    activityScore: sessionRecord.activityScore,
    quizScore: sessionRecord.quizScore,
    badgeUnlocked,
    badgeCelebrated: badgeUnlocked && sessionRecord.badgeCelebrated,
    trialTellUsed: Boolean(sessionRecord.trialTellUsed || durableRecord.trialTellUsed),
    trialQuizUsed: Boolean(sessionRecord.trialQuizUsed || durableRecord.trialQuizUsed),
  };
}

function guestDurableTrialRecord(progress: JuniorLessonProgress): JuniorLessonProgress {
  return {
    ...EMPTY,
    completedGames: [],
    trialTellUsed: Boolean(progress.trialTellUsed),
    trialQuizUsed: Boolean(progress.trialQuizUsed),
  };
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
      trialTellUsed: Boolean(value.trialTellUsed),
      trialQuizUsed: Boolean(value.trialQuizUsed),
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
  storage: Pick<Storage, "getItem" | "setItem"> | null,
): JuniorLessonProgress {
  migrateJuniorLessonStores(storage);
  migrateJuniorLessonStores(durableTrialStorage());
  const key = juniorLessonProgressStorageKey(profileId, lessonKey);
  let next = progress;
  if (isGuestSessionStore(profileId, storage)) {
    const durable = durableTrialStorage();
    const previous = durable ? parseProgress(durable.getItem(key)) : { ...EMPTY, completedGames: [] };
    next = guestSessionProgress(progress, previous);
    if (durable) {
      try {
        durable.setItem(key, JSON.stringify(guestDurableTrialRecord(next)));
      } catch {
        /* gizli pencere veya dolu disk izi düşürmez */
      }
    }
  }
  if (storage) {
    try {
      storage.setItem(key, JSON.stringify(next));
    } catch {
      /* gizli pencere veya dolu disk izi düşürmez */
    }
  }
  emitProgress(profileId, lessonKey, next, justUnlockedBadge);
  return next;
}

export function readLessonProgress(
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): JuniorLessonProgress {
  migrateJuniorLessonStores(storage);
  migrateJuniorLessonStores(durableTrialStorage());
  if (!storage) {
    return { ...EMPTY, completedGames: [] };
  }
  const parsed = parseProgress(storage.getItem(juniorLessonProgressStorageKey(profileId, lessonKey)));
  if (!isGuestSessionStore(profileId, storage)) {
    return parsed;
  }
  const durable = durableTrialStorage();
  const trials = durable
    ? parseProgress(durable.getItem(juniorLessonProgressStorageKey(profileId, lessonKey)))
    : { ...EMPTY, completedGames: [] };
  return guestSessionProgress(parsed, trials);
}

export function writeLessonProgress(
  profileId: string,
  lessonKey: string,
  progress: JuniorLessonProgress,
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
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
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
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
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
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
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
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
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  if (current.badgeCelebrated) {
    return current;
  }
  return persist(profileId, lessonKey, { ...current, badgeCelebrated: true }, false, storage);
}

export function hasUsedJuniorTrialTell(
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): boolean {
  return Boolean(readLessonProgress(profileId, lessonKey, storage).trialTellUsed);
}

export function markJuniorTrialTellUsed(
  profileId: string,
  lessonKey: string,
   storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  if (current.trialTellUsed) {
    return current;
  }
  return persist(profileId, lessonKey, { ...current, trialTellUsed: true }, false, storage);
}

export function hasUsedJuniorTrialQuiz(
  profileId: string,
  lessonKey: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): boolean {
  return Boolean(readLessonProgress(profileId, lessonKey, storage).trialQuizUsed);
}

export function markJuniorTrialQuizUsed(
  profileId: string,
  lessonKey: string,
  score: number,
  storage: Pick<Storage, "getItem" | "setItem"> | null = scoreStorage(profileId),
): JuniorLessonProgress {
  const current = readLessonProgress(profileId, lessonKey, storage);
  const quizScore = clampPercent(score) ?? current.quizScore;
  return persist(
    profileId,
    lessonKey,
    { ...current, quizScore, trialQuizUsed: true },
    false,
    storage,
  );
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
