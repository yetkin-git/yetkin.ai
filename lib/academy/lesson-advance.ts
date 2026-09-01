/**
 * Ders bitimi geçişi — LocalStorage tercih + sıradaki ders + dürüst geri sayım.
 *
 * Ses `ended` olayına bağlıdır. Müfredat kilidi (open) ayrı durur: kilitli
 * sıradaki ders, tamamlama POST'u ile açılır.
 *
 * İsteğe bağlı mikro-ödev «Ödevi Geç» akışı ses bitimini beklemez: ders
 * mühürlenir (kanıt varsa) ve sıradaki Canlı Sahne + TTS hemen başlar.
 */

export const ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY =
  "yetkin-rail.academy.lesson-auto-advance" as const;

/** Geri sayım duvar saati — setTimeout kayması yok. */
export const ACADEMY_LESSON_AUTO_ADVANCE_MS = 5_000;

/** İlk ziyarette manuel kart; tercih localStorage'da saklanır. */
export const ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT = false;

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
  return Boolean(current?.open && !current.completed);
}
