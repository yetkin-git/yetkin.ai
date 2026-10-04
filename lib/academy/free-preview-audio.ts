import { ensureAcademySealedStorageSigner } from "@/lib/academy/academy-sealed-storage";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonBedIsHardMixed,
  academyLessonBedPlaybackSrc,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import {
  resolveAcademyMediaRead,
  withAcademyAudioGrant,
  type AcademyStorageSigner,
} from "@/lib/academy/lesson-audio-grant";
import { isAcademySalesFunnelLessonKey } from "@/lib/academy/purchase-path";

export type AcademyFreePreviewAudioGrant = {
  src: string;
  bedSrc: string | null;
};

/**
 * Satış vitrini (ders 1) için kısa ömürlü ses adresi.
 * Ders 2+ bu haritaya girmez. Giriş şartı yoktur.
 * `local`: kenar imzası. `storage`: özel kovanın 4 saatlik adresi.
 * İmza üretilemezse ders haritaya girmez; başka dersin sesi konmaz.
 */
export async function loadAcademyFreePreviewAudioGrants(
  courseSlug: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
  storageSigner?: AcademyStorageSigner,
): Promise<Record<string, AcademyFreePreviewAudioGrant>> {
  if (resolveAcademyMediaRead(env) === "storage" && storageSigner === undefined) {
    ensureAcademySealedStorageSigner();
  }
  const grants: Record<string, AcademyFreePreviewAudioGrant> = {};
  for (const lessonKey of curriculumLessonKeysForSlug(courseSlug)) {
    if (!isAcademySalesFunnelLessonKey(lessonKey)) {
      continue;
    }
    const src = await withAcademyAudioGrant(
      academyLessonAudioPlaybackSrc(courseSlug, lessonKey),
      nowMs,
      env,
      storageSigner,
    );
    if (!src) {
      continue;
    }
    const bedNeeded =
      isAcademyLessonBedSealed(courseSlug, lessonKey) && !academyLessonBedIsHardMixed(lessonKey);
    const bedSrc = bedNeeded
      ? await withAcademyAudioGrant(
          academyLessonBedPlaybackSrc(courseSlug, lessonKey),
          nowMs,
          env,
          storageSigner,
        )
      : null;
    if (bedNeeded && !bedSrc) {
      continue;
    }
    grants[lessonKey] = { src, bedSrc };
  }
  return grants;
}
