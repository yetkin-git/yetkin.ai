/**
 * Sipariş masası HTTP kompozisyonu. Yazmalar Idempotency-Key ister.
 */

import {
  bulkPrepareLabels,
  listFulfillmentOrders,
  patchFulfillmentStatus,
  patchLabelSettings,
} from "@/lib/commerce/fulfillment-service";
import { isFulfillmentStatus } from "@/lib/commerce/fulfillment-rules";
import type { ProfitHandlerDeps } from "@/lib/commerce/profit-handlers";
import type { CommerceResult } from "@/lib/commerce/types";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";

async function readBody(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  try {
    const value: unknown = await request.json();
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: "İstek geçersiz." };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: "İstek geçersiz." };
  }
}

async function withWrite(
  deps: ProfitHandlerDeps,
  request: Request,
  route: string,
  run: (user: SessionUser, body: unknown) => Promise<CommerceResult<Record<string, unknown>>>,
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await deps.requireSession(request);
    const idempotency = requireRailV1IdempotencyKey(request, requestId);
    if (!idempotency.ok) {
      return idempotency.response;
    }
    const body = await readBody(request);
    if (!body.ok) {
      return jsonFail(body.error, 400, requestId, request);
    }
    return settleHttpIdempotency(
      {
        store: deps.idempotency(),
        userId: user.id,
        route,
        key: idempotency.key,
        requestHash: hashIdempotencyPayload(body.value),
        requestId,
        request,
      },
      async () => {
        const result = await run(user, body.value);
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

export function getFulfillmentOrders(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  const requestId = resolveRequestId(request);
  return (async () => {
    try {
      const user = await deps.requireSession(request);
      const statusParam = new URL(request.url).searchParams.get("status");
      const status = statusParam && isFulfillmentStatus(statusParam) ? statusParam : null;
      if (statusParam && !status) {
        return jsonFail("Durum süzgeci geçersiz.", 422, requestId, request);
      }
      const result = await listFulfillmentOrders(user.id, storeId, status);
      if (!result.ok) {
        return jsonFail(result.error, result.status, requestId, request);
      }
      return jsonOk(result.data, 200, requestId, request);
    } catch (error) {
      return jsonFromUnknown(error, 400, requestId, request);
    }
  })();
}

export function patchOrderStatus(
  deps: ProfitHandlerDeps,
  request: Request,
  storeId: string,
  orderId: string,
) {
  return withWrite(deps, request, `/api/commerce/stores/${storeId}/orders/${orderId}/status`, (user, body) =>
    patchFulfillmentStatus(user.id, storeId, orderId, body),
  );
}

export function postBulkLabel(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withWrite(deps, request, `/api/commerce/stores/${storeId}/orders/bulk-label`, (user, body) =>
    bulkPrepareLabels(user.id, storeId, body),
  );
}

export function patchStoreLabelSettings(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withWrite(deps, request, `/api/commerce/stores/${storeId}/label-settings`, (user, body) =>
    patchLabelSettings(user.id, storeId, body),
  );
}
