import { requireSession } from "@/lib/kernel/auth/session";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { addHibeDocument, hibeWriteResult, updateHibeDocument } from "@/lib/yetkinhibe/application-service";
import { HIBE_DOCUMENT_CATEGORIES, HIBE_DOCUMENT_STATUSES } from "@/lib/yetkinhibe/grant-lifecycle";
import { z } from "zod";

export const auth = "session" as const;

const ROUTE = "/api/yetkinhibe/applications/[id]/documents";

const createSchema = z.strictObject({
  title: z.string().trim().min(2).max(200),
  category: z.enum(HIBE_DOCUMENT_CATEGORIES),
  status: z.enum(HIBE_DOCUMENT_STATUSES).optional(),
  fileUrl: z.string().trim().max(500).nullable().optional(),
  referenceCode: z.string().trim().max(80).nullable().optional(),
  reviewerNote: z.string().trim().max(1000).nullable().optional(),
});

const patchSchema = z.strictObject({
  documentId: z.string().trim().min(8).max(80),
  status: z.enum(HIBE_DOCUMENT_STATUSES),
  fileUrl: z.string().trim().max(500).nullable().optional(),
  referenceCode: z.string().trim().max(80).nullable().optional(),
  reviewerNote: z.string().trim().max(1000).nullable().optional(),
});

async function gate(request: Request, requestId: string) {
  const session = await requireSession(request);
  const idempotency = requireRailV1IdempotencyKey(request, requestId);
  if (!idempotency.ok) {
    return { ok: false as const, response: idempotency.response };
  }
  const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeMatchUser, session.id);
  if (!limited.allowed) {
    return { ok: false as const, response: rateLimitedJsonResponse(limited, request) };
  }
  return { ok: true as const, session, key: idempotency.key };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = resolveRequestId(request);
  try {
    const { id } = await context.params;
    const opened = await gate(request, requestId);
    if (!opened.ok) {
      return opened.response;
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Evrak kaydı geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: opened.session.id,
        route: ROUTE,
        key: opened.key,
        requestHash: hashIdempotencyPayload({ id, op: "create", ...parsed.data }),
        requestId,
        request,
      },
      () =>
        hibeWriteResult(async () => {
          const created = await addHibeDocument(opened.session.id, id, parsed.data);
          return { id: created.id, status: created.status };
        }),
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestId = resolveRequestId(request);
  try {
    const { id } = await context.params;
    const opened = await gate(request, requestId);
    if (!opened.ok) {
      return opened.response;
    }
    const raw: unknown = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonFail("Evrak güncellemesi geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: createPrismaHttpIdempotencyStore(),
        userId: opened.session.id,
        route: `${ROUTE}:patch`,
        key: opened.key,
        requestHash: hashIdempotencyPayload({ id, op: "patch", ...parsed.data }),
        requestId,
        request,
      },
      () =>
        hibeWriteResult(async () => {
          const updated = await updateHibeDocument(opened.session.id, id, parsed.data);
          return { id: updated.id, status: updated.status };
        }),
    );
  } catch (error) {
    return jsonFromUnknown(error, 500, requestId, request);
  }
}
