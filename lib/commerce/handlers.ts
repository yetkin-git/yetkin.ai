import type { SessionUser } from "@/lib/kernel/auth/ids";
import { hashIdempotencyPayload, settleHttpIdempotency, type HttpIdempotencyStore } from "@/lib/kernel/http/idempotency";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  createCommerceProduct,
  createCommerceStore,
  createCommerceVariant,
  getCommerceProduct,
  getCommerceStore,
  importCsvCatalog,
  importPazaryeriCatalog,
  listCommerceInventory,
  listCommerceProducts,
  listCommerceStores,
  patchCommerceProduct,
  patchCommerceStore,
  patchCommerceVariant,
  postCommerceInventory,
} from "@/lib/commerce/service";
import type { CommerceResult } from "@/lib/commerce/types";

export type CommerceHandlerDeps = {
  requireSession: (request?: Request) => Promise<SessionUser>;
  repository: () => CommerceRepository;
  idempotency: () => HttpIdempotencyStore;
  /** Canlı yol ikinci mağazayı plan sınırına sokar. Bellek testleri bu kapıyı taşımaz. */
  guardNewStore?: (userId: string) => Promise<{ ok: true } | Extract<CommerceResult<Record<string, unknown>>, { ok: false }>>;
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
  deps: CommerceHandlerDeps,
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
  deps: CommerceHandlerDeps,
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

export function getStores(deps: CommerceHandlerDeps, request: Request) {
  return withSession(deps, request, (user) => listCommerceStores(deps.repository(), user.id));
}

export function postStore(deps: CommerceHandlerDeps, request: Request) {
  return withPost(deps, request, "/api/commerce/stores", async (user, body) => {
    if (deps.guardNewStore) {
      const gate = await deps.guardNewStore(user.id);
      if (!gate.ok) {
        return gate;
      }
    }
    return createCommerceStore(deps.repository(), user.id, body);
  });
}

export function getStore(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => getCommerceStore(deps.repository(), user.id, storeId));
}

export function patchStore(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, async (user) => {
    const body = await readBody(request);
    if (!body.ok) {
      return { ok: false, status: 400, error: body.error };
    }
    return patchCommerceStore(deps.repository(), user.id, storeId, body.value);
  });
}

export function getProducts(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withSession(deps, request, (user) => listCommerceProducts(deps.repository(), user.id, storeId));
}

export function postProduct(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/products`, (user, body, key) =>
    createCommerceProduct(deps.repository(), user.id, storeId, body, key),
  );
}

export function getProduct(deps: CommerceHandlerDeps, request: Request, storeId: string, productId: string) {
  return withSession(deps, request, (user) => getCommerceProduct(deps.repository(), user.id, storeId, productId));
}

export function patchProduct(deps: CommerceHandlerDeps, request: Request, storeId: string, productId: string) {
  return withSession(deps, request, async (user) => {
    const body = await readBody(request);
    if (!body.ok) {
      return { ok: false, status: 400, error: body.error };
    }
    return patchCommerceProduct(deps.repository(), user.id, storeId, productId, body.value);
  });
}

export function postVariant(deps: CommerceHandlerDeps, request: Request, storeId: string, productId: string) {
  return withPost(
    deps,
    request,
    `/api/commerce/stores/${storeId}/products/${productId}/variants`,
    (user, body, key) => createCommerceVariant(deps.repository(), user.id, storeId, productId, body, key),
  );
}

export function patchVariant(deps: CommerceHandlerDeps, request: Request, storeId: string, variantId: string) {
  return withSession(deps, request, async (user) => {
    const body = await readBody(request);
    if (!body.ok) {
      return { ok: false, status: 400, error: body.error };
    }
    return patchCommerceVariant(deps.repository(), user.id, storeId, variantId, body.value);
  });
}

export function getInventory(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  const variantId = new URL(request.url).searchParams.get("variantId") ?? undefined;
  return withSession(deps, request, (user) => listCommerceInventory(deps.repository(), user.id, storeId, variantId));
}

export function postInventory(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/inventory`, (user, body, key) =>
    postCommerceInventory(deps.repository(), user.id, storeId, body, key),
  );
}

export function postPazaryeriImport(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/imports/pazaryeri`, (user, body, key) =>
    importPazaryeriCatalog(deps.repository(), user.id, storeId, body, key),
  );
}

export function postCsvImport(deps: CommerceHandlerDeps, request: Request, storeId: string) {
  return withPost(deps, request, `/api/commerce/stores/${storeId}/imports/csv`, (user, body, key) =>
    importCsvCatalog(deps.repository(), user.id, storeId, body, key),
  );
}
