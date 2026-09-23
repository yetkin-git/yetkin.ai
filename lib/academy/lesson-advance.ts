/**
 * Ders bitimi geçişi — LocalStorage tercih + sıradaki ders + dürüst geri sayım.
 *
 * Ses `ended` olayına bağlıdır. Müfredat kilidi (open) ayrı durur: kilitli
 * sıradaki ders, tamamlama POST'u ile açılır.
 *
 * İsteğe bağlı mikro-ödev «Ödevi Geç» akışı ses bitimini beklemez: ders
 * mühürlenir (kanıt varsa) ve sıradaki Canlı Sahne + TTS hemen başlar.
 *
 * Kaset bitince 2.5 sn outro nefes payı dolmadan otomatik geçiş yok.
 */

import { ACADEMY_OUTRO_BREATH_MS } from "@/lib/academy/lesson-bed-duck";

export { ACADEMY_OUTRO_BREATH_MS, ACADEMY_OUTRO_BREATH_SEC } from "@/lib/academy/lesson-bed-duck";

export const ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY = "academy_autoplay_enabled" as const;

/** Geri sayım duvar saati — setTimeout kayması yok. */
export const ACADEMY_LESSON_AUTO_ADVANCE_MS = 5_000;

/** İlk ziyarette otomatik geçiş açık; tercih localStorage'da saklanır. */
export const ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT = true;

/**
 * Ödev atlandığında dinleme başlatılsın mı?
 * Otomatik Geçiş kapalı olsa bile «Ödevi Geç / Devam Et» devam eder.
 */
export function shouldStartListenAfterChallengeSkip(_autoAdvanceEnabled = false): boolean {
  void _autoAdvanceEnabled;
  return true;
}

/** TTS fallback (kota / sessiz WAV) — otomatik ders geçişi yok; vatandaş CTA bekler. */
export function shouldAutoAdvanceAfterListenEnded(input: {
  autoAdvanceEnabled: boolean;
  fallback: boolean;
}): boolean {
  return input.autoAdvanceEnabled && !input.fallback;
}

/** Ses kasedi bitti / son saniye: nefes payı dolmadan ders bitmez. */
export function hasAcademyOutroBreathElapsed(
  intoBreathMs: number,
  breathMs = ACADEMY_OUTRO_BREATH_MS,
): boolean {
  if (!Number.isFinite(intoBreathMs) || intoBreathMs < 0) {
    return false;
  }
  return intoBreathMs >= breathMs;
}

/**
 * `ended` / son saniye — saat kuyruğu varsa o kadar, yoksa en az 2.5 sn.
 * Nefes zaten işliyorsa kalan süre kısalır; kuyruk 80 ms kalsa bile 2.5 sn’ye şişmez.
 */
export function academyOutroBreathRemainMs(input: {
  elapsedSec: number;
  durationSec: number;
  intoBreathMs?: number;
  breathMs?: number;
}): number {
  const elapsed = Number.isFinite(input.elapsedSec) ? input.elapsedSec : 0;
  const duration = Number.isFinite(input.durationSec) && input.durationSec > 0 ? input.durationSec : 0;
  const remainClockMs = Math.max(0, (duration - elapsed) * 1000);
  const breathMs = input.breathMs ?? ACADEMY_OUTRO_BREATH_MS;
  const intoBreathMs = Number.isFinite(input.intoBreathMs) ? Math.max(0, input.intoBreathMs!) : 0;
  const remainBreathMs = Math.max(0, breathMs - intoBreathMs);
  return Math.max(remainBreathMs, remainClockMs);
}

/** Otomatik geçiş — kaset bitti + nefes payı doldu. */
export function shouldAutoAdvanceAfterOutroBreath(input: {
  autoAdvanceEnabled: boolean;
  fallback: boolean;
  intoBreathMs: number;
  tailMs?: number;
}): boolean {
  if (
    !shouldAutoAdvanceAfterListenEnded({
      autoAdvanceEnabled: input.autoAdvanceEnabled,
      fallback: input.fallback,
    })
  ) {
    return false;
  }
  const waitMs = Math.max(ACADEMY_OUTRO_BREATH_MS, input.tailMs ?? ACADEMY_OUTRO_BREATH_MS);
  return hasAcademyOutroBreathElapsed(input.intoBreathMs, waitMs);
}

/**
 * Diyalog zaman çizelgesi bittiğinde ilerleme mühürlenir.
 * 8 sn sahte sinema veya oynatılmamış kaset mühür basmaz.
 */
export function shouldSealProgressAfterDialogueEnded(input: {
  playbackStarted: boolean;
  reachedEnd: boolean;
}): boolean {
  return input.playbackStarted && input.reachedEnd;
}

/**
 * Oynatıcı saati son karede mi?
 * Ekran `mm:ss` floor saniye kullanır; 08:05 / 08:05, kaset 485,06 / 485,50 olsa da bitti sayılır.
 * Native `ended` kaçarsa `currentTime >= durationSec` yedeği aynı kapıdan geçer.
 */
export function hasAcademyLessonPlaybackReachedEnd(input: {
  currentTime: number;
  durationSec: number;
}): boolean {
  const currentTime = input.currentTime;
  const durationSec = input.durationSec;
  if (
    !Number.isFinite(currentTime) ||
    !Number.isFinite(durationSec) ||
    durationSec <= 0 ||
    currentTime < 0
  ) {
    return false;
  }
  if (currentTime >= durationSec) {
    return true;
  }
  const shownNow = Math.floor(currentTime);
  const shownEnd = Math.floor(durationSec);
  if (shownEnd <= 0) {
    return false;
  }
  return shownNow >= shownEnd;
}

export type AcademyPlayerAdvanceLesson = {
  key: string;
  open: boolean;
  completed: boolean;
};

export function parseStoredAcademyLessonAutoAdvance(raw: string | null): boolean {
  if (raw == null) {
    return ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT;
  }
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "on") {
    return true;
  }
  if (value === "0" || value === "false" || value === "off") {
    return false;
  }
  return ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT;
}

export function serializeAcademyLessonAutoAdvance(enabled: boolean): "1" | "0" {
  return enabled ? "1" : "0";
}

export function readAcademyLessonAutoAdvanceFromStorage(): boolean {
  if (typeof window === "undefined") {
    return ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT;
  }
  try {
    return parseStoredAcademyLessonAutoAdvance(
      window.localStorage.getItem(ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY),
    );
  } catch {
    return ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT;
  }
}

export function writeAcademyLessonAutoAdvanceToStorage(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY,
      serializeAcademyLessonAutoAdvance(enabled),
    );
  } catch {
    /* kota / gizli tarama — tercih oturumda kalır */
  }
}

/**
 * Ses/video bittiğinde sıradaki ders. Tercih kapalıysa veya kilit varsa null —
 * oynatıcı son karede kalır.
 */
export function resolveAcademyAutoAdvanceNextLesson<T extends AcademyPlayerAdvanceLesson>(input: {
  autoAdvanceEnabled: boolean;
  fallback?: boolean;
  current: T | null;
  next: T | null;
}): T | null {
  if (
    !shouldAutoAdvanceAfterListenEnded({
      autoAdvanceEnabled: input.autoAdvanceEnabled,
      fallback: input.fallback ?? false,
    })
  ) {
    return null;
  }
  if (!canAdvanceAcademyPlayerLesson(input.current, input.next)) {
    return null;
  }
  return input.next;
}

/**
 * Oynatıcı otomatik geçiş hedefi — her zaman müfredat sırasındaki bir sonraki ders.
 *
 * Sunucu `player.nextLessonKey` ve devam paneli **ilk tamamlanmamış** derse
 * işaret eder (resume). Oynatıcı bunu kullanırsa 1. ders bitince tamamlanmış
 * 2. ders atlanır (1 → 3). Ara ders tamamlanmış olsa da sıra korunur.
 */
export function academyPlayerAutoAdvanceTargetKey(input: {
  autoAdvanceEnabled: boolean;
  fallback?: boolean;
  lessons: readonly { key: string }[];
  endedLessonKey: string;
  /** Devam paneli / API resume işaretçisi — oynatıcı geçişinde yok sayılır. */
  resumeLessonKey?: string | null;
}): string | null {
  if (
    !shouldAutoAdvanceAfterListenEnded({
      autoAdvanceEnabled: input.autoAdvanceEnabled,
      fallback: input.fallback ?? false,
    })
  ) {
    return null;
  }
  void input.resumeLessonKey;
  return nextAcademyPlayerLesson(input.lessons, input.endedLessonKey)?.key ?? null;
}

/** Müfredat sırasındaki bir sonraki ders; atlama yok. */
export function nextAcademyPlayerLesson<T extends { key: string }>(
  lessons: readonly T[],
  activeKey: string,
): T | null {
  const index = lessons.findIndex((lesson) => lesson.key === activeKey);
  if (index < 0 || index + 1 >= lessons.length) {
    return null;
  }
  return lessons[index + 1] ?? null;
}

/** Müfredat sırasındaki bir önceki ders; atlama yok. */
export function prevAcademyPlayerLesson<T extends { key: string }>(
  lessons: readonly T[],
  activeKey: string,
): T | null {
  const index = lessons.findIndex((lesson) => lesson.key === activeKey);
  if (index <= 0) {
    return null;
  }
  return lessons[index - 1] ?? null;
}

/** Duvar saatine göre kalan tam saniye (ceil). 0 = süre bitti. */
export function academyLessonAdvanceRemainingSec(remainingMs: number): number {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 1000);
}

export function canAdvanceAcademyPlayerLesson(
  current: AcademyPlayerAdvanceLesson | null,
  next: AcademyPlayerAdvanceLesson | null,
): boolean {
  if (!next) {
    return false;
  }
  if (next.open) {
    return true;
  }
  if (current?.completed) {
    return true;
  }
  return Boolean(current?.open && !current.completed);
}

/**
 * Dock sınav kapısı — sunucu `curriculumComplete` yenilenmeden önce
 * yerel mühür kümesi 6/6 olunca yeşile döner. Refresh beklenmez.
 */
export function isAcademyPlayerExamReady(input: {
  curriculumComplete: boolean;
  workTasksComplete?: boolean;
  lessons: readonly { key: string; completed: boolean }[];
  completedKeys: ReadonlySet<string>;
}): boolean {
  const fromServer =
    input.curriculumComplete && (input.workTasksComplete ?? input.curriculumComplete);
  if (fromServer) {
    return true;
  }
  if (input.lessons.length === 0) {
    return false;
  }
  return input.lessons.every(
    (lesson) => input.completedKeys.has(lesson.key) || lesson.completed,
  );
}
