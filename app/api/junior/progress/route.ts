import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { RAIL_V1_CLIENT_SCHEMA } from "@/lib/kernel/http/v1-client-flags";
import { juniorLessonStatus } from "@/lib/junior/chain";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import { isJuniorProfileClosed } from "@/lib/junior/guardian-notice";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import type { JuniorProgressRow } from "@/lib/junior/ports";
import { buildJuniorWeeklyReport } from "@/lib/junior/report";
import type { JuniorLessonStatus } from "@/lib/junior/types";

export const auth = "session" as const;

type ProgressEntry = {
  lessonKey: string;
  title: string;
  modes: string[];
  bestScore: number;
  updatedAt: string;
  status: JuniorLessonStatus;
};

/** Ders bazlı toplama. Sıra `updatedAt` azalan; eşitlikte ders anahtarı. */
function foldProgress(
  rows: readonly JuniorProgressRow[],
  lessonTitle: (lessonKey: string) => string,
): ProgressEntry[] {
  const byLesson = new Map<string, ProgressEntry>();
  for (const row of rows) {
    const stamp = row.createdAt.toISOString();
    const entry = byLesson.get(row.lessonKey);
    if (!entry) {
      byLesson.set(row.lessonKey, {
        lessonKey: row.lessonKey,
        title: lessonTitle(row.lessonKey),
        modes: [row.mode],
        bestScore: row.score,
        updatedAt: stamp,
        status: "fresh",
      });
      continue;
    }
    if (!entry.modes.includes(row.mode)) {
      entry.modes.push(row.mode);
    }
    entry.bestScore = Math.max(entry.bestScore, row.score);
    if (stamp > entry.updatedAt) {
      entry.updatedAt = stamp;
    }
  }
  return [...byLesson.values()]
    .map((entry) => ({ ...entry, status: juniorLessonStatus(rows, entry.lessonKey) }))
    .sort((left, right) =>
      left.updatedAt === right.updatedAt
        ? left.lessonKey.localeCompare(right.lessonKey)
        : left.updatedAt < right.updatedAt
          ? 1
          : -1,
    );
}

/**
 * `GET /api/v1/junior/progress` — öğrenci ilerlemesi.
 *
 * `junior_progress` yazımı vardı; okuma boardu yoktu. Native istemci
 * "kaldığın yer" ekranını bu hop'la çizer.
 *
 * Dürüstlük kuralları:
 * - Seçili profil yoksa `profileId: null` ve boş `lessons` döner. Uydurma ilerleme basılmaz.
 * - Her satırda `status` tek evden (`juniorLessonStatus`) okunur; istemci kendi kararını vermez.
 * - Ders anahtarı katalogda yoksa satır yine döner (geçmiş kayıt silinmez) ama `title`
 *   boş kalır; uydurma başlık basılmaz.
 * - Puan ve XP yazılmaz: bu bir **okuma** hop'udur (A4 — puan sunucuda kalır).
 */
export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const store = createPrismaJuniorStore();
    const profiles = await store.listProfiles(user.id);
    const open = profiles.filter((row) => !isJuniorProfileClosed(row));
    const requestedId = new URL(request.url).searchParams.get("profileId")?.trim() ?? "";
    const selected =
      (requestedId ? open.find((row) => row.id === requestedId) : undefined) ??
      open.find((row) => row.selected) ??
      open[0] ??
      null;

    const profileRows = profiles.map((row) => ({
      id: row.id,
      nickname: row.nickname,
      grade: row.grade,
      selected: row.selected,
    }));

    const rows = selected ? await store.listProgress(user.id, selected.id) : [];
    const xp = selected ? await store.getXp(user.id, selected.id) : null;
    const lessons = foldProgress(rows, (lessonKey) => juniorLessonByKey(lessonKey)?.title ?? "");
    const weeklyReport = selected
      ? buildJuniorWeeklyReport(rows, {
          profileId: selected.id,
          lessonTitle: (lessonKey) => juniorLessonByKey(lessonKey)?.title ?? "Ders",
        })
      : null;

    return jsonOk(
      {
        profileId: selected?.id ?? null,
        profiles: profileRows,
        xp: { points: xp?.points ?? 0, badges: xp?.badges ?? [] },
        lessons,
        totals: {
          started: lessons.length,
          done: lessons.filter((entry) => entry.status === "done").length,
          going: lessons.filter((entry) => entry.status === "going").length,
        },
        weeklyReport,
        clientSchema: {
          timelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.timelineSchemaVersion,
          minTimelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.minTimelineSchemaVersion,
        },
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AuthRequiredError") {
      return jsonFromUnknown(error, 401, requestId, request);
    }
    return jsonFail("İlerleme kaydı okunamadı.", 503, requestId, request);
  }
}
