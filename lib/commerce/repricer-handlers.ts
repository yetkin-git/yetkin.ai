/**
 * Rekabet masası ve CSV alışverişi — ince route dosyaları burayı çağırır.
 */

import { exportStoreEconomicsCsv, importStoreEconomicsCsv } from "@/lib/commerce/economics-transfer";
import { ingestCompetitorQuotes, listRepricerDesk, saveChannelPriceRule } from "@/lib/commerce/repricer-service";
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

async function withPost(
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

export function postRepricerRule(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/repricer/rules`, (user, body) =>
    saveChannelPriceRule(user.id, storeId, body),
  );
}

export function getRepricerDesk(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  const requestId = resolveRequestId(request);
  return (async () => {
    try {
      const user = await deps.requireSession(request);
      const result = await listRepricerDesk(user.id, storeId);
      if (!result.ok) {
        return jsonFail(result.error, result.status, requestId, request);
      }
      return jsonOk(result.data, 200, requestId, request);
    } catch (error) {
      return jsonFromUnknown(error, 400, requestId, request);
    }
  })();
}

export function postCompetitorIngest(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/competitors/ingest`, (user, body) =>
    ingestCompetitorQuotes(user.id, storeId, body),
  );
}

export function getEconomicsCsv(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  const requestId = resolveRequestId(request);
  return (async () => {
    try {
      const user = await deps.requireSession(request);
      const result = await exportStoreEconomicsCsv(user.id, storeId);
      if (!result.ok) {
        return jsonFail(result.error, result.status, requestId, request);
      }
      return new Response(result.data.csv, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${result.data.filename}"`,
          "x-request-id": requestId,
        },
      });
    } catch (error) {
      return jsonFromUnknown(error, 400, requestId, request);
    }
  })();
}

export function postEconomicsCsv(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/economics/import-csv`, (user, body) =>
    importStoreEconomicsCsv(user.id, storeId, body),
  );
}
