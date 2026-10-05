/**
 * Ders sesinin kısa ömürlü adresi.
 * Tam oynatıcı bunu sayfa çizilirken üretir. Grant kapısı süre dolunca aynı üretimi yeniler.
 * Fon yatağı boşsa anlatım adresi durur. Yatak yok diye anlatım düşmez.
 * `local`: kenar imzası. `storage`: özel kovanın 4 saatlik adresi.
 * Üretimde okuma anahtarı boşsa storage geçerlidir.
 */

import "@/lib/academy/lesson-json-disk";
import { ensureAcademySealedStorageSigner } from "@/lib/academy/academy-sealed-storage";
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
import {
  academyPrepStripForSlug,
  isAcademyPrepStripAudioSealed,
  isAcademyPrepStripKey,
} from "@/lib/academy/prep-strip";
import { isAcademyLessonAudioSealed, isAcademyTtsCassetteRevoked } from "@/lib/academy/pilot-sku";

export type AcademyLessonAudioGrant = {
  src: string;
  bedSrc: string | null;
};

export function academyLessonAudioEligible(courseSlug: string, lessonKey: string): boolean {
  if (isAcademyTtsCassetteRevoked(lessonKey)) {
    return false;
  }
  if (isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return true;
  }
  const strip = academyPrepStripForSlug(courseSlug);
  return (
    isAcademyPrepStripKey(lessonKey) &&
    isAcademyPrepStripAudioSealed(courseSlug) &&
    strip?.key === lessonKey
  );
}

/**
 * Bir dersin anlatım ve yatak adresi.
 * Anlatım üretilemezse `null`. Yatak üretilemezse, `allowMissingBed` açıkken anlatım kalır.
 */
export async function issueAcademyLessonAudioGrant(
  courseSlug: string,
  lessonKey: string,
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
  storageSigner?: AcademyStorageSigner,
  options: { allowMissingBed?: boolean } = {},
): Promise<AcademyLessonAudioGrant | null> {
  const src = await withAcademyAudioGrant(
    academyLessonAudioPlaybackSrc(courseSlug, lessonKey),
    nowMs,
    env,
    storageSigner,
  );
  if (!src) {
    return null;
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
  if (bedNeeded && !bedSrc && options.allowMissingBed !== true) {
    return null;
  }
  return { src, bedSrc };
}

/**
 * Tam oynatıcı. Yalnız verilen açık dersler imzalanır.
 * Ders 2 ve sonrası da girer. Fon yatağı boşsa anlatım haritada kalır.
 */
export async function loadAcademyOynaAudioGrants(
  courseSlug: string,
  lessonKeys: readonly string[],
  nowMs: number = Date.now(),
  env: Record<string, string | undefined> = process.env,
  storageSigner?: AcademyStorageSigner,
): Promise<Record<string, AcademyLessonAudioGrant>> {
  if (resolveAcademyMediaRead(env) === "storage" && storageSigner === undefined) {
    ensureAcademySealedStorageSigner();
  }
  const seen = new Set<string>();
  const pending: Array<Promise<{ key: string; grant: AcademyLessonAudioGrant | null }>> = [];
  for (const lessonKey of lessonKeys) {
    const key = lessonKey.trim();
    if (!key || seen.has(key) || !academyLessonAudioEligible(courseSlug, key)) {
      continue;
    }
    seen.add(key);
    pending.push(
      issueAcademyLessonAudioGrant(courseSlug, key, nowMs, env, storageSigner, {
        allowMissingBed: true,
      }).then((grant) => ({ key, grant })),
    );
  }
  const grants: Record<string, AcademyLessonAudioGrant> = {};
  for (const row of await Promise.all(pending)) {
    if (row.grant) {
      grants[row.key] = row.grant;
    }
  }
  return grants;
}
