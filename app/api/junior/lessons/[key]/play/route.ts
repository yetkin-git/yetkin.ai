import { requireSession } from "@/lib/kernel/auth/session";
import { GENERIC_INTERNAL_ERROR, jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { RAIL_V1_JUNIOR_LESSON_MISSING } from "@/lib/kernel/http/v1-contract";
import { JUNIOR_MEDIA_UNAVAILABLE, issueJuniorLessonMedia } from "@/lib/junior/media-grant";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { buildJuniorLessonPlayData } from "@/lib/junior/play-wire";
import { canonicalJuniorLessonKey } from "@/lib/junior/lesson-key-alias";
import { openJuniorLessonPlay } from "@/lib/junior/service";

export const auth = "session" as const;

/**
 * Ders gövdesi ve medya adresi. Hop `junior-lesson-play` aynı kalır.
 * Pilot dersin metni mühürlü konuşmadır. Bilye ve dedektif sahnesi cevapta yoktur.
 * Kilitli ders, paket kararı geçmeden adres taşımaz. İmza yoksa kamu yola düşülmez.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> },
) {
  try {
    const user = await requireSession(request);
    const { key } = await context.params;
    const lessonKey = canonicalJuniorLessonKey(key);
    const profileId = new URL(request.url).searchParams.get("profileId");
    const opened = await openJuniorLessonPlay(createPrismaJuniorStore(), {
      userId: user.id,
      profileId,
      lessonKey,
      actor: {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.emailConfirmedAt,
      },
    });
    if (!opened.ok) {
      return jsonFail(opened.error, opened.status, undefined, request);
    }
    const grant = issueJuniorLessonMedia({
      lessonKey,
      entitled: opened.catalogAccess === "locked",
    });
    if (opened.catalogAccess === "locked" && grant.kind !== "signed") {
      return jsonFail(JUNIOR_MEDIA_UNAVAILABLE, 503, undefined, request);
    }
    if (grant.kind !== "public" && grant.kind !== "signed") {
      return jsonFail(RAIL_V1_JUNIOR_LESSON_MISSING, 404, undefined, request);
    }
    const data = buildJuniorLessonPlayData({
      lessonKey,
      catalogAccess: opened.catalogAccess,
      lesson: opened.lesson,
      media: grant.urls,
      progress: opened.progress,
    });
    if (!data) {
      return jsonFail(GENERIC_INTERNAL_ERROR, 500, undefined, request);
    }
    return jsonOk(data, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
