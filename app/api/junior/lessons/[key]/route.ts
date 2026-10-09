import { jsonFail, jsonOk } from "@/lib/kernel/http/json";
import { RAIL_V1_JUNIOR_LESSON_MISSING } from "@/lib/kernel/http/v1-contract";
import { isJuniorCoverKey, juniorCoverSrc } from "@/lib/junior/covers";
import {
  juniorCourseByLessonKey,
  juniorLessonAccess,
  juniorLessonByKey,
} from "@/lib/junior/catalog";
import { juniorLessonAudioSrc } from "@/lib/junior/voice";

export const auth = "public" as const;

/**
 * Junior tekil okuma hop'u.
 * Kart, kilit kararı, ses yolu ve sahne kimliği. Anlatış metni bu zarfta yoktur.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  const { key } = await context.params;
  const lessonKey = key.trim();
  if (!isJuniorCoverKey(lessonKey)) {
    return jsonFail(RAIL_V1_JUNIOR_LESSON_MISSING, 404, undefined, request);
  }
  const lesson = juniorLessonByKey(lessonKey);
  const course = juniorCourseByLessonKey(lessonKey);
  const access = juniorLessonAccess(lessonKey);
  if (!lesson || !course || access === "missing") {
    return jsonFail(RAIL_V1_JUNIOR_LESSON_MISSING, 404, undefined, request);
  }
  return jsonOk(
    {
      card: {
        lessonKey: lesson.key,
        title: lesson.title,
        subject: course.subject,
        access,
        scene: lesson.scene,
        audioPath: juniorLessonAudioSrc(lesson.key),
        coverPath: juniorCoverSrc(lesson.key),
      },
    },
    200,
    undefined,
    request,
  );
}
