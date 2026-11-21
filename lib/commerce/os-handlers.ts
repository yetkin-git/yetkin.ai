import type { SessionUser } from "@/lib/kernel/auth/ids";
import { hashIdempotencyPayload, settleHttpIdempotency, type HttpIdempotencyStore } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  approveInbound,
  connectChannel,
  draftInbound,
  dropExpertTask,
  importPoolProduct,
  recordQuestion,
  sendChannelReply,
  simulateTrendyolQuestion,
  simulateTrendyolUnitSale,
  suggestReply,
  syncCatalog,
} from "@/lib/commerce/os-service";
import type { CommerceResult } from "@/lib/commerce/types";
import { commerceSimulationAllowed } from "@/lib/commerce/simulation-gate";

const ROUTE = "/api/commerce/os";

export type OsHandlerDeps = {
  requireSession: (request?: Request) => Promise<SessionUser>;
  repository: () => CommerceRepository;
  idempotency: () => HttpIdempotencyStore;
};

function recordOf(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readQty(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

async function runAction(
  repo: CommerceRepository,
  userId: string,
  body: Record<string, unknown>,
  httpKey: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const action = body.action;
  if (action === "pool") {
    return importPoolProduct(
      repo,
      userId,
      {
        title: typeof body.title === "string" ? body.title : "",
        category: typeof body.category === "string" ? body.category : "",
        description: typeof body.description === "string" ? body.description : "",
      },
      httpKey,
    );
  }
  if (action === "stock-draft") {
    const productId = typeof body.productId === "string" ? body.productId : "";
    const quantity = readQty(body.quantity);
    if (!productId || quantity == null) {
      return { ok: false, status: 422, error: "Ürün ve adet gerekli." };
    }
    return draftInbound(userId, productId, quantity, httpKey);
  }
  if (action === "stock-approve") {
    const productId = typeof body.productId === "string" ? body.productId : "";
    const draftId = typeof body.draftId === "string" ? body.draftId : "";
    if (!productId || !draftId) {
      return { ok: false, status: 422, error: "Taslak gerekli." };
    }
    return approveInbound(repo, userId, productId, draftId);
  }
  if (action === "channel") {
    const kind = typeof body.kind === "string" ? body.kind : "";
    return connectChannel(repo, userId, kind, body.connect === true, body.apiKey);
  }
  if (action === "sync") {
    return syncCatalog(userId);
  }
  if (action === "question") {
    const productId = typeof body.productId === "string" ? body.productId : "";
    const channel = typeof body.channel === "string" ? body.channel : "";
    if (!productId) {
      return { ok: false, status: 422, error: "Ürün gerekli." };
    }
    return recordQuestion(userId, productId, channel, body.body, body.customerLabel);
  }
  if (action === "reply" || action === "reply-draft") {
    const entryId = typeof body.entryId === "string" ? body.entryId : "";
    if (!entryId) {
      return { ok: false, status: 422, error: "Soru gerekli." };
    }
    return suggestReply(userId, entryId);
  }
  if (action === "reply-send") {
    const entryId = typeof body.entryId === "string" ? body.entryId : "";
    if (!entryId) {
      return { ok: false, status: 422, error: "Soru gerekli." };
    }
    return sendChannelReply(userId, entryId);
  }
  if (action === "simulate-sale" || action === "simulate-question") {
    if (!commerceSimulationAllowed()) {
      return { ok: false, status: 403, error: "Simülasyon bu ortamda kapalı." };
    }
    const productId = typeof body.productId === "string" ? body.productId : "";
    return action === "simulate-sale"
      ? simulateTrendyolUnitSale(userId, productId || null)
      : simulateTrendyolQuestion(userId, productId || null);
  }
  if (action === "expert") {
    const productId = typeof body.productId === "string" ? body.productId : "";
    const taskKind = typeof body.taskKind === "string" ? body.taskKind : "";
    if (!productId) {
      return { ok: false, status: 422, error: "Ürün gerekli." };
    }
    return dropExpertTask(userId, productId, taskKind);
  }
  return { ok: false, status: 422, error: "Kokpit işlemi geçersiz." };
}

export async function postOsCockpit(deps: OsHandlerDeps, request: Request) {
  const requestId = resolveRequestId(request);
  try {
    const user = await deps.requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return jsonFail("İstek geçersiz.", 400, requestId, request);
    }
    const body = recordOf(payload);
    if (!body) {
      return jsonFail("İstek geçersiz.", 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: deps.idempotency(),
        userId: user.id,
        route: ROUTE,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(body),
        requestId,
        request,
      },
      async () => {
        const result = await runAction(deps.repository(), user.id, body, idempotency.key);
        if (!result.ok) {
          return { status: result.status, body: { error: result.error } };
        }
        return { status: 200, body: result.data };
      },
    );
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
