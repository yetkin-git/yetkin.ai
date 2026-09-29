import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonBedIsHardMixed,
  academyLessonBedPlaybackSrc,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import { withAcademyAudioGrant } from "@/lib/academy/lesson-audio-grant";
import { isAcademySalesFunnelLessonKey } from "@/lib/academy/purchase-path";

export type AcademyFreePreviewAudioGrant = {
  src: string;
  bedSrc: string | null;
};

/**
 * Satış vitrini (ders 1) için kısa ömürlü ses adresi.
 * Ders 2+ bu haritaya girmez. İmzasız dosya kenarda 403 kalır.
 */
export async function loadAcademyFreePreviewAudioGrants(
  courseSlug: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
): Promise<Record<string, AcademyFreePreviewAudioGrant>> {
  const grants: Record<string, AcademyFreePreviewAudioGrant> = {};
  for (const lessonKey of curriculumLessonKeysForSlug(courseSlug)) {
    if (!isAcademySalesFunnelLessonKey(lessonKey)) {
      continue;
    }
    const src = await withAcademyAudioGrant(
      academyLessonAudioPlaybackSrc(courseSlug, lessonKey),
      nowMs,
      env,
    );
    if (!src) {
      continue;
    }
    const bedSrc =
      isAcademyLessonBedSealed(courseSlug, lessonKey) && !academyLessonBedIsHardMixed(lessonKey)
        ? await withAcademyAudioGrant(academyLessonBedPlaybackSrc(courseSlug, lessonKey), nowMs, env)
        : null;
    grants[lessonKey] = { src, bedSrc };
  }
  return grants;
}
