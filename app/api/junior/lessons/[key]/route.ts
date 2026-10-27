import { jsonFail, jsonOk } from "@/lib/kernel/http/json";
import { RAIL_V1_JUNIOR_LESSON_MISSING } from "@/lib/kernel/http/v1-contract";
import { isJuniorCoverKey } from "@/lib/junior/covers";
import { canonicalJuniorLessonKey } from "@/lib/junior/lesson-key-alias";
import { juniorCourseByLessonKey, juniorLessonAccess, juniorLessonByKey } from "@/lib/junior/catalog";
import { issueJuniorLessonMedia } from "@/lib/junior/media-grant";

export const auth = "public" as const;

/**
 * Junior tekil okuma hop'u.
 * Kart ve kilit kararı. Anlatış metni bu zarfta yoktur.
 * Ücretsiz konuda kamu medya adresi döner. Kilitli konuda adres yoktur.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  const lessonKey = canonicalJuniorLessonKey(key);
  if (!isJuniorCoverKey(lessonKey)) {
    return jsonFail(RAIL_V1_JUNIOR_LESSON_MISSING, 404, undefined, request);
  }
  const lesson = juniorLessonByKey(lessonKey);
  const course = juniorCourseByLessonKey(lessonKey);
  const access = juniorLessonAccess(lessonKey);
  if (!lesson || !course || access === "missing") {
    return jsonFail(RAIL_V1_JUNIOR_LESSON_MISSING, 404, undefined, request);
  }
  const grant = issueJuniorLessonMedia({ lessonKey, entitled: false });
  const urls = grant.kind === "public" ? grant.urls : null;
  return jsonOk(
    {
      card: {
        lessonKey: lesson.key,
        title: lesson.title,
        subject: course.subject,
        access,
        scene: lesson.scene,
        audioPath: urls?.audioUrl ?? null,
        warmupPath: urls?.warmupUrl ?? null,
        coverPath: urls?.coverUrl ?? null,
      },
    },
    200,
    undefined,
    request,
  );
}
