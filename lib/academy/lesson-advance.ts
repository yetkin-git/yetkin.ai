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
 * Ders bitti ve otomatik geçiş yalnız `HTMLAudioElement.ended`.
 * İlk cue sonu, floor saniye ve duvar saati bu kapıyı açmaz.
 * `currentTime` mühürlü sürenin gerisindeyse erken `ended` dersi bitirmez.
 */
export function academyLessonAudioEndedIsComplete(input: {
  ended: boolean;
  currentTime: number;
  sealedDurationSec: number;
}): boolean {
  if (input.ended !== true) {
    return false;
  }
  const currentTime = Number.isFinite(input.currentTime) ? Math.max(0, input.currentTime) : 0;
  const sealed = Number.isFinite(input.sealedDurationSec) ? input.sealedDurationSec : 0;
  if (sealed <= 0) {
    return true;
  }
  return currentTime + 1.5 >= sealed;
}

/**
 * Nefes zamanlayıcısı saati eşitledikten sonra üst kata haber.
 *
 * Asıl kapı hâlâ `academyLessonAudioEndedIsComplete`: `ended` ve mühüre 1,5 sn.
 * Bu kapı, kaset `ended` demiş ve nefes saati iki tarafı da doldurmuşsa açılır.
 * Erken saniye, `ended` yokken ve nefes zorlanmadan saat eşitliği dersi bitirmez.
 */
export function academyLessonSealMayNotify(input: {
  audioEnded: boolean;
  currentTime: number;
  sealedDurationSec: number;
  forceBreath: boolean;
  clockElapsedSec: number;
  clockDurationSec: number;
  playbackStarted: boolean;
}): boolean {
  if (
    !shouldSealProgressAfterDialogueEnded({
      playbackStarted: input.playbackStarted,
      reachedEnd: true,
    })
  ) {
    return false;
  }
  if (
    academyLessonAudioEndedIsComplete({
      ended: input.audioEnded,
      currentTime: input.currentTime,
      sealedDurationSec: input.sealedDurationSec,
    })
  ) {
    return true;
  }
  if (input.forceBreath !== true || input.audioEnded !== true) {
    return false;
  }
  return hasAcademyLessonPlaybackReachedEnd({
    currentTime: input.clockElapsedSec,
    durationSec: input.clockDurationSec,
  });
}

/**
 * Erken `ended` bir kez dosyanın ulaşılabilen sonuna sarar.
 * Tek +0,2 sn, mühür 1,5 sn gerideyse susar. Sarma kalmadıysa null —
 * çağıran nefes zamanlayıcısını kurar.
 */
export function academyLessonFalseEndSeekSec(input: {
  reportedSec: number;
  fileDurationSec: number;
  alreadyRetried: boolean;
}): number | null {
  if (input.alreadyRetried) {
    return null;
  }
  const reported = Number.isFinite(input.reportedSec) ? Math.max(0, input.reportedSec) : 0;
  const file =
    Number.isFinite(input.fileDurationSec) && input.fileDurationSec > 0 ? input.fileDurationSec : 0;
  if (!(file > reported + 0.25)) {
    return null;
  }
  const nearEnd = Math.max(0, file - 0.05);
  return Math.min(file, Math.max(reported + 0.2, nearEnd));
}

/**
 * Tamamlama cevabındaki açık ders listesi, sayfadaki eski `open` bayrağının önüne geçer.
 */
export function mergeAcademyPlayerLessonGates<T extends { key: string; open: boolean; completed: boolean }>(
  pageLessons: readonly T[],
  serverLessons: readonly { key: string; open?: boolean; completed?: boolean }[] | null | undefined,
): T[] {
  if (!serverLessons || serverLessons.length === 0) {
    return pageLessons.map((lesson) => ({ ...lesson }));
  }
  const byKey = new Map(serverLessons.map((row) => [row.key, row]));
  return pageLessons.map((lesson) => {
    const row = byKey.get(lesson.key);
    if (!row) {
      return { ...lesson };
    }
    return {
      ...lesson,
      open: typeof row.open === "boolean" ? row.open : lesson.open,
      completed: typeof row.completed === "boolean" ? row.completed : lesson.completed,
    };
  });
}

/**
 * Oynatıcı saati son karede mi?
 * Ekran `mm:ss` floor saniye kullanır; 08:05 / 08:05, kaset 485,06 / 485,50 olsa da bitti sayılır.
 * Tek başına ders bitirme kapısı değildir. Nefes saati eşitleyince
 * `academyLessonSealMayNotify` bu eşitliği üst kata haber için kullanır.
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
  lessons: readonly { key: string; open?: boolean }[];
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
  const next = nextAcademyPlayerLesson(input.lessons, input.endedLessonKey);
  if (!next || next.open !== true) {
    return null;
  }
  return next.key;
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
  if (!next?.open) {
    return false;
  }
  void current;
  return true;
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
