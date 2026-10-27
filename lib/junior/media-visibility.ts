/**
 * Junior medya görünürlüğü.
 * Ücretsiz ilk ders kapısı ve her kartın arşive alınmamış ilk konusu kamu `/media/junior/...` yolunda kalır.
 * Kilitli ses `private/junior/` önekine gider; tahmin edilebilir ses adresi üretilmez.
 * Katalog kapağı her ders için `media/junior/covers/{ders}.jpg` adresindedir.
 */

import {
  JUNIOR_ARCHIVED_OPENER_KEYS,
  JUNIOR_ELECTIVE_PUBLIC_OPENERS,
  JUNIOR_ELECTIVE_SLUGS,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_FREE_OPENER_OVERRIDE,
  JUNIOR_PILOT_SLUGS,
} from "@/lib/junior/limits";

export const JUNIOR_LOCKED_MEDIA_PREFIX = "private/junior";

const COURSE_SLUGS = new Set<string>([...JUNIOR_PILOT_SLUGS, ...JUNIOR_ELECTIVE_SLUGS]);

/** `{slug}-1` kapısı başka anahtara taşındıysa eski dosya sırası kamu önizlemede kalmaz. */
const DISPLACED_FILE_OPENERS = new Set(
  Object.entries(JUNIOR_FREE_OPENER_OVERRIDE).flatMap(([slug, opener]) => {
    const fileFirst = `${slug}-1`;
    return opener === fileFirst ? [] : [fileFirst];
  }),
);

const OVERRIDE_OPENERS = new Set(Object.values(JUNIOR_FREE_OPENER_OVERRIDE));

/**
 * Ücretsiz ilk ders kapısı (`JUNIOR_FREE_LESSON_KEY`) ve çekirdek kartın arşive alınmamış ilk konusu.
 * Matematik açılışı `JUNIOR_FREE_LESSON_KEY` (`jr_06_mat-1`) dir. İngilizce 1. hafta `JUNIOR_FREE_OPENER_OVERRIDE` içindedir.
 * Diğer çekirdek kartlar `{slug}-1` ile açılır. Mühürsüz seçmeli açılış kamu önizlemesi değildir.
 * Katalogdaki `juniorFreeLessonKeys` ile aynı kümeyi verir.
 */
export function juniorLessonMediaIsPublicPreview(lessonKey: string): boolean {
  const key = lessonKey.trim();
  const elective = /^(jr_[a-z0-9_]+)-\d+$/u.exec(key);
  if (elective && (JUNIOR_ELECTIVE_SLUGS as readonly string[]).includes(elective[1] ?? "")) {
    return (JUNIOR_ELECTIVE_PUBLIC_OPENERS as readonly string[]).includes(key);
  }
  if (key === JUNIOR_FREE_LESSON_KEY) {
    return true;
  }
  if (JUNIOR_ARCHIVED_OPENER_KEYS.includes(key) || DISPLACED_FILE_OPENERS.has(key)) {
    return false;
  }
  if (OVERRIDE_OPENERS.has(key)) {
    return true;
  }
  const match = /^(jr_[a-z0-9_]+)-1$/u.exec(key);
  if (!match) {
    return false;
  }
  return COURSE_SLUGS.has(match[1] ?? "");
}

export function juniorLockedMediaObjectKey(
  kind: "audio" | "warmup" | "covers",
  fileName: string,
): string {
  return `${JUNIOR_LOCKED_MEDIA_PREFIX}/${kind}/${fileName}`;
}
