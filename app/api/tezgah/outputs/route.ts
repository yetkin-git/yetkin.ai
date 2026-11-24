import { z } from "zod";
import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { getPrisma } from "@/lib/kernel/db";
import {
  TEZGAH_OUTPUT_IMAGE_CONTENT_MAX,
  inspectTezgahArchive,
} from "@/lib/tezgah/pro/archive-guard";
import { recordSignedTezgahOutput } from "@/lib/tezgah/record-output";

/**
 * Tezgâh arşivi. Okuma ve tarayıcı-içi üretim kaydı oturum ister.
 * Sunucu araçları kendi üretim yolunda yazar. Cüzdan yazılmaz.
 *
 * O8: `technical-drawing` / `saas-builder` / `studio-photo` zarfları istemcide
 * üretilir. Bu yüzden `outputContent` **sunucuda** şema, boyut ve XSS açısından
 * doğrulanır (`inspectTezgahArchive`). Doğrulanmayan içerik arşive yazılmaz.
 *
 * Boyut tavanı burada **en geniş** zarfa göre verilir; araca özel tavanı
 * `inspectTezgahArchive` uygular. Aksi hâlde görsel zarfı (base64 PNG + kılavuz)
 * zod aşamasında reddedililirdi.
 */
export const auth = "session" as const;

const saveSchema = z.strictObject({
  toolKey: z.enum(["studio-photo", "technical-drawing", "saas-builder"]),
  title: z.string().trim().min(1).max(160),
  inputSummary: z.string().trim().max(500),
  outputContent: z.string().trim().min(1).max(TEZGAH_OUTPUT_IMAGE_CONTENT_MAX),
});

/** Arşiv sayfası boyu. Sınırlı ve sabit: istemci keyfî sayfa açamaz. */
const ARCHIVE_PAGE_SIZE = 12;
/** Sayfa imleci `cuid:ISO` biçimindedir; başka her şey yok sayılır. */
const ARCHIVE_CURSOR = /^([A-Za-z0-9_-]{8,80}):(\d{4}-\d{2}-\d{2}T[\d:.]+Z)$/;

function readCursor(raw: string | null): { id: string; createdAt: Date } | null {
  const match = ARCHIVE_CURSOR.exec((raw ?? "").trim());
  if (!match) {
    return null;
  }
  const created = new Date(match[2] ?? "");
  if (Number.isNaN(created.getTime())) {
    return null;
  }
  return { id: match[1] ?? "", createdAt: created };
}

function cursorFor(row: { id: string; createdAt: Date }): string {
  return `${row.id}:${row.createdAt.toISOString()}`;
}

/**
 * Arşiv listesi. K2 — sayfalama vardır: ilk 12 satırla kilitlenmez.
 * İmleç `(createdAt, id)` çiftidir; aynı saniyedeki satırlar da kararlı sıralanır.
 */
export async function GET(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const cursor = readCursor(new URL(request.url).searchParams.get("cursor"));
    const rows = await getPrisma().tezgahOutput.findMany({
      where: {
        userId: user.id,
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      // Bir fazla satır oku: "daha var mı" sorusu tek sorguda yanıtlanır.
      take: ARCHIVE_PAGE_SIZE + 1,
      select: { id: true, toolKey: true, title: true, createdAt: true },
    });
    const page = rows.slice(0, ARCHIVE_PAGE_SIZE);
    const last = page[page.length - 1];
    return jsonOk(
      {
        outputs: page.map((row) => ({
          id: row.id,
          toolKey: row.toolKey,
          title: row.title,
          createdAt: row.createdAt.toISOString(),
        })),
        nextCursor: rows.length > ARCHIVE_PAGE_SIZE && last ? cursorFor(last) : null,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.llmUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const parsed = saveSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonFail("Çıktı kaydı eksik.", 400, requestId, request);
    }
    const verdict = inspectTezgahArchive(parsed.data.toolKey, parsed.data.outputContent);
    if (!verdict.ok) {
      return jsonFail(verdict.error, 422, requestId, request);
    }
    const outputId = await recordSignedTezgahOutput({
      userId: user.id,
      guest: false,
      toolKey: parsed.data.toolKey,
      title: parsed.data.title,
      inputSummary: parsed.data.inputSummary,
      outputContent: parsed.data.outputContent,
    });
    if (!outputId) {
      return jsonFail("Çıktı arşive yazılamadı.", 503, requestId, request);
    }
    return jsonOk({ outputId }, 200, requestId, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
