import "server-only";
import "@/lib/academy/lesson-json-disk";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { academyPlayerMediaLessonKeys } from "@/lib/academy/preview-lock";
import {
  readAcademyLessonJson,
  type AcademyLessonMediaPrime,
} from "@/lib/academy/lesson-json-store";

export type { AcademyLessonMediaPrime };

/**
 * Yalnız bu kursun cue ve timings JSON'u. Diğer SKU dosyaları istemci paketine girmez.
 */
export function loadAcademyLessonMediaPrime(
  slug: string,
  options: { paywallLocked?: boolean; openLessonKeys?: readonly string[] | null } = {},
): AcademyLessonMediaPrime {
  const keys = academyPlayerMediaLessonKeys({
    keys: [
      ...curriculumLessonKeysForSlug(slug),
      ...(slug.trim() === "01_office_ai" ? ["01_office_ai-0"] : []),
    ],
    paywallLocked: options.paywallLocked === true,
    openLessonKeys: options.openLessonKeys,
  });
  const cues: Record<string, unknown> = {};
  const timings: Record<string, unknown> = {};
  for (const key of keys) {
    const cue = readAcademyLessonJson("lesson-cues", key);
    const timing = readAcademyLessonJson("lesson-audio-timings", key);
    if (cue != null) {
      cues[key] = cue;
    }
    if (timing != null) {
      timings[key] = timing;
    }
  }
  return { cues, timings };
}
