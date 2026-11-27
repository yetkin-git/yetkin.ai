import {
  createOutreachDrafts,
  updateOutreachSettings,
  blockOutreachEmail,
} from "@/lib/kernel/outreach/write";
import { listOutreachSeeds, manualSeed } from "@/lib/kernel/outreach/generate";
import { loadOutreachBoard } from "@/lib/kernel/outreach/load";
import {
  isOutreachVertical,
  parseOutreachSettingsPatch,
  OUTREACH_GENERATE_BATCH_MAX,
} from "@/lib/kernel/outreach/policy";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { BadRequestError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";

export const auth = "admin" as const;
/** Gemini taslağı sırayla üretilir; 10 hedef için 60 sn yetmez. */
export const maxDuration = 180;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Kokpit tahtası. Gönderen alan adı ve kapalı sebebi burada görünür. */
export async function GET(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const board = await loadOutreachBoard(session);
    if (board.access !== "ok") {
      throw new BadRequestError("Kokpit okunamadı.");
    }
    return jsonOk({ board: board.board }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

/**
 * Taslak üretimi (AI) veya elle hedef ekleme.
 * `items` boşsa sunucu kendi hedef havuzundan seçer.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) {
      throw new BadRequestError("İstek gövdesi yok.");
    }
    if (!isOutreachVertical(body.vertical)) {
      throw new BadRequestError("Hedef dikey seçilmedi.");
    }

    if (Array.isArray(body.items)) {
      const seeds = body.items
        .slice(0, OUTREACH_GENERATE_BATCH_MAX)
        .map((row) =>
          isRecord(row)
            ? manualSeed({
                companyName: typeof row.companyName === "string" ? row.companyName : "",
                recipientEmail: typeof row.recipientEmail === "string" ? row.recipientEmail : "",
                sector: typeof row.sector === "string" ? row.sector : "",
                sourceUrl: typeof row.sourceUrl === "string" ? row.sourceUrl : null,
              })
            : null,
        )
        .filter((seed): seed is NonNullable<typeof seed> => seed !== null);
      if (seeds.length === 0) {
        throw new BadRequestError("Elle eklenen hedef kurumsal adres taşımıyor.");
      }
      const result = await createOutreachDrafts({
        actorUserId: session.id,
        vertical: body.vertical,
        seeds,
      });
      return jsonOk(result, 200, undefined, request);
    }

    const seeds = await listOutreachSeeds({ vertical: body.vertical });
    if (seeds.length === 0) {
      throw new BadRequestError("Havuzda uygun kurumsal hedef yok. Kuyruk ve teklif talepleri boş.");
    }
    const result = await createOutreachDrafts({
      actorUserId: session.id,
      vertical: body.vertical,
      seeds,
    });
    return jsonOk(result, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}

/** Ayar yaması (şalter, tavan, saat) veya kara listeye alma. */
export async function PATCH(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) {
      throw new BadRequestError("İstek gövdesi yok.");
    }
    if (body.action === "block") {
      if (typeof body.email !== "string") {
        throw new BadRequestError("Engellenecek adres yok.");
      }
      await blockOutreachEmail(session.id, body.email);
      return jsonOk({ blocked: body.email.trim().toLowerCase() }, 200, undefined, request);
    }
    const parsed = parseOutreachSettingsPatch(body);
    if (!parsed.ok) {
      throw new BadRequestError(parsed.reason);
    }
    await updateOutreachSettings({ actorUserId: session.id, ...parsed.value });
    return jsonOk({ settings: parsed.value }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
