import { ensureAcademySealedStorageSigner } from "@/lib/academy/academy-sealed-storage";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  issueAcademyLessonAudioGrant,
  type AcademyLessonAudioGrant,
} from "@/lib/academy/lesson-audio-issue";
import { resolveAcademyMediaRead, type AcademyStorageSigner } from "@/lib/academy/lesson-audio-grant";
import { isAcademySalesFunnelLessonKey } from "@/lib/academy/purchase-path";

export type AcademyFreePreviewAudioGrant = AcademyLessonAudioGrant;

/**
 * Satış vitrini (ders 1) için kısa ömürlü ses adresi.
 * Ders 2+ bu haritaya girmez. Giriş şartı yoktur.
 * `local`: kenar imzası. `storage`: özel kovanın 4 saatlik adresi.
 * Üretimde okuma anahtarı boşsa storage geçerlidir.
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
    const issued = await issueAcademyLessonAudioGrant(
      courseSlug,
      lessonKey,
      nowMs,
      env,
      storageSigner,
    );
    if (!issued) {
      continue;
    }
    grants[lessonKey] = issued;
  }
  return grants;
}
