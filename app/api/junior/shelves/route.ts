import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { RAIL_V1_CLIENT_SCHEMA } from "@/lib/kernel/http/v1-client-flags";
import { createPrismaJuniorStore } from "@/lib/junior/load";
import { readJuniorHome } from "@/lib/junior/service";

export const auth = "session" as const;

/**
 * `GET /api/v1/junior/shelves` — native okuma kapısı.
 *
 * Ne döner: mühürlü derslerin raf dökümü (çekirdek + seçmeli), profil, XP ve paket.
 * Karar nerede: erişim damgası `readJuniorHome` içinde, tek evde
 * (`stampJuniorPlanAccess` + `juniorPaidElectives`). Bu handler kural kopyalamaz.
 *
 * Paket yoksa raflar **yine döner**; her dersin `access` alanı `locked`/`free` olarak
 * dürüst basılır. Boş raf dönmek "ders yok" demek olurdu — oysa ders var, kilit var.
 *
 * `clientSchema` bloğu şema sürümünü ve native medya TTL'ini taşır. Native istemci
 * `minTimelineSchemaVersion` altındaysa sahneyi boş oynatmak yerine kapıyı kendisi kapatır.
 * Medya adresi bu hop'ta ÜRETİLMEZ: imza yalnız `play` hop'unda, yetki kesinleştikten
 * sonra verilir. Burada yalnız TTL sözleşmesi duyurulur.
 */
export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const home = await readJuniorHome(createPrismaJuniorStore(), user.id);
    return jsonOk(
      {
        profiles: home.profiles,
        selectedId: home.selected?.id ?? null,
        xp: home.xp,
        plan: home.plan,
        courses: home.courses,
        sealedLessonCount: home.courses.reduce((sum, course) => sum + course.lessons.length, 0),
        clientSchema: {
          timelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.timelineSchemaVersion,
          minTimelineSchemaVersion: RAIL_V1_CLIENT_SCHEMA.minTimelineSchemaVersion,
          mediaTtlSec: RAIL_V1_CLIENT_SCHEMA.media.native.ttlSec,
          mediaRefreshAfterSec: RAIL_V1_CLIENT_SCHEMA.media.native.refreshAfterSec,
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
    return jsonFail("Raf listesi okunamadı.", 503, requestId, request);
  }
}
