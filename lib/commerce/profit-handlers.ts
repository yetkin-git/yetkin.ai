/**
 * Kâr motorları HTTP kompozisyonu — thin route.ts dosyaları burayı çağırır.
 */

import type { SessionUser } from "@/lib/kernel/auth/ids";
import { hashIdempotencyPayload, settleHttpIdempotency, type HttpIdempotencyStore } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { acceptBundle, dismissBundle, listBundles, proposeBundles } from "@/lib/commerce/bundle-engine";
import { listStoreCampaigns, saveStoreCampaign, simulateStoreCampaign } from "@/lib/commerce/campaign-engine";
import { applyProfitAction, buildOrLoadTodayBrief } from "@/lib/commerce/daily-brief";
import { upsertStoreEconomics } from "@/lib/commerce/economics-service";
import { ingestRadarFeed, listOpportunityRadar, scanOpportunityRadar } from "@/lib/commerce/opportunity-radar";
import type { CommerceResult } from "@/lib/commerce/types";

export type ProfitHandlerDeps = {
  requireSession: (request?: Request) => Promise<SessionUser>;
  idempotency: () => HttpIdempotencyStore;
};

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

function fromResult(result: CommerceResult<Record<string, unknown>>, request: Request, requestId?: string) {
  if (!result.ok) {
    return jsonFail(result.error, result.status, requestId, request);
  }
  return jsonOk(result.data, 200, requestId, request);
}

async function withSession(
  deps: ProfitHandlerDeps,
  request: Request,
  run: (user: SessionUser) => Promise<CommerceResult<Record<string, unknown>>>,
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await deps.requireSession(request);
    return fromResult(await run(user), request, requestId);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

async function withPost(
  deps: ProfitHandlerDeps,
  request: Request,
  route: string,
  run: (user: SessionUser, body: unknown, key: string) => Promise<CommerceResult<Record<string, unknown>>>,
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
        const result = await run(user, body.value, idempotency.key);
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

/** Simülasyon yazmaz; Idempotency-Key yine istenir (hızlı slider için tekrar güvenli). */
export function postEconomics(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/economics`, (user, body) =>
    upsertStoreEconomics(user.id, storeId, body),
  );
}

export function postCampaignSimulate(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/campaigns/simulate`, (user, body) =>
    simulateStoreCampaign(user.id, storeId, body),
  );
}

export function postCampaign(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/campaigns`, (user, body) =>
    saveStoreCampaign(user.id, storeId, body),
  );
}

export function getCampaigns(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => listStoreCampaigns(user.id, storeId));
}

export function postBundlesPropose(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/bundles/propose`, (user) =>
    proposeBundles(user.id, storeId),
  );
}

export function getBundles(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => listBundles(user.id, storeId));
}

export function postBundleAccept(deps: ProfitHandlerDeps, request: Request, storeId: string, id: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/bundles/${id}/accept`, (user) =>
    acceptBundle(user.id, storeId, id),
  );
}

export function deleteBundle(deps: ProfitHandlerDeps, request: Request, storeId: string, id: string) {
  const requestId = resolveRequestId(request);
  return (async () => {
    try {
      const user = await deps.requireSession(request);
      const idempotency = requireRailV1IdempotencyKey(request, requestId);
      if (!idempotency.ok) {
        return idempotency.response;
      }
      return settleHttpIdempotency(
        {
          store: deps.idempotency(),
          userId: user.id,
          route: `/api/commerce/stores/${storeId}/bundles/${id}`,
          key: idempotency.key,
          requestHash: hashIdempotencyPayload({ storeId, id, op: "dismiss" }),
          requestId,
          request,
        },
        async () => {
          const result = await dismissBundle(user.id, storeId, id);
          if (!result.ok) {
            return { status: result.status, body: { error: result.error } };
          }
          return { status: 200, body: result.data };
        },
      );
    } catch (error) {
      return jsonFromUnknown(error, 400, requestId, request);
    }
  })();
}

export function getBriefToday(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => buildOrLoadTodayBrief(user.id, storeId));
}

export function postActionApply(deps: ProfitHandlerDeps, request: Request, storeId: string, id: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/actions/${id}/apply`, (user) =>
    applyProfitAction(user.id, storeId, id),
  );
}

export function postRadarScan(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/radar/scan`, (user) =>
    scanOpportunityRadar(user.id, storeId),
  );
}

export function postRadarSignals(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/radar/signals`, (user, body) =>
    ingestRadarFeed(user.id, storeId, body),
  );
}

export function getRadar(deps: ProfitHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => listOpportunityRadar(user.id, storeId));
}
