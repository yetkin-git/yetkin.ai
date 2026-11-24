import { timingSafeEqual } from "node:crypto";
import type { SessionUser } from "@/lib/kernel/auth/ids";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { CommerceCredentialSealError, openCommerceCredential, supplierHint } from "@/lib/commerce/credential-seal";
import type { MarketplaceRepository } from "@/lib/commerce/marketplace-repository";
import { COMMERCE_CHANNEL, type CommerceChannelName, type MarketplaceCredentialRow } from "@/lib/commerce/marketplace-types";
import type { CommerceRepository } from "@/lib/commerce/repository";
import {
  deleteTrendyolCredential,
  deleteTrendyolListing,
  getTrendyolCredential,
  listTrendyolListings,
  putTrendyolCredential,
  putTrendyolListing,
} from "@/lib/commerce/marketplace-service";
import type { CommerceResult } from "@/lib/commerce/types";
import { liveStoreLicense } from "@/lib/commerce/store-license";
import { readHepsiburadaOrderPackages } from "@/lib/commerce/hepsiburada-client";
import { intakeHepsiburadaPackages, type HepsiburadaPorts } from "@/lib/commerce/hepsiburada-sync";
import { readTrendyolOrderPackages } from "@/lib/commerce/trendyol-client";
import { intakeTrendyolPackages, type TrendyolPorts } from "@/lib/commerce/trendyol-sync";

export type MarketplaceHandlerDeps = {
  requireSession: (request?: Request) => Promise<SessionUser>;
  commerce: () => CommerceRepository;
  marketplace: () => MarketplaceRepository;
  env: NodeJS.ProcessEnv;
  /**
   * Lisans kapısı (P0.4). Klasik kimlik masası da kokpit kadar kapalıdır:
   * lisansı olmayan kullanıcı kimlik yazamaz. Verilmezse `env` üzerinden
   * varsayılan okuma yapılır.
   */
  license?: { allowsOutgoing: (storeId: string, now: Date) => Promise<boolean> };
};

function timingSafeTextEqual(left: string, right: string): boolean {
  if (left.length === 0 || right.length === 0) {
    return false;
  }
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function readBasic(header: string): { username: string; password: string } | null {
  const match = /^Basic\s+([A-Za-z0-9+/=_-]+)$/i.exec(header.trim());
  if (!match?.[1]) {
    return null;
  }
  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const split = decoded.indexOf(":");
  if (split <= 0 || split >= decoded.length - 1) {
    return null;
  }
  return { username: decoded.slice(0, split), password: decoded.slice(split + 1) };
}

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
  deps: MarketplaceHandlerDeps,
  request: Request,
  run: (user: SessionUser) => Promise<CommerceResult<Record<string, unknown>>>,
) {
  const requestId = resolveRequestId(request);
  try {
    const user = await deps.requireSession(request);
    return fromResult(await run(user), request, requestId);
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export function getTrendyolCredentialRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  return withSession(deps, request, (user) =>
    getTrendyolCredential(deps.commerce(), deps.marketplace(), user.id, storeId, channel),
  );
}

export function putTrendyolCredentialRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  return withSession(deps, request, async (user) => {
    const body = await readBody(request);
    if (!body.ok) {
      return { ok: false, status: 400, error: body.error };
    }
    return putTrendyolCredential(
      deps.commerce(),
      deps.marketplace(),
      deps.env,
      user.id,
      storeId,
      body.value,
      channel,
      deps.license ?? liveStoreLicense,
    );
  });
}

export function deleteTrendyolCredentialRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  return withSession(deps, request, (user) =>
    deleteTrendyolCredential(deps.commerce(), deps.marketplace(), user.id, storeId, channel),
  );
}

export function getTrendyolListingsRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  return withSession(deps, request, (user) =>
    listTrendyolListings(deps.commerce(), deps.marketplace(), user.id, storeId, channel),
  );
}

export function putTrendyolListingRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  return withSession(deps, request, async (user) => {
    const body = await readBody(request);
    if (!body.ok) {
      return { ok: false, status: 400, error: body.error };
    }
    return putTrendyolListing(deps.commerce(), deps.marketplace(), user.id, storeId, body.value, channel);
  });
}

export function deleteTrendyolListingRoute(
  deps: MarketplaceHandlerDeps,
  request: Request,
  storeId: string,
  channel: CommerceChannelName = COMMERCE_CHANNEL,
) {
  const variantId = new URL(request.url).searchParams.get("variantId") ?? "";
  return withSession(deps, request, (user) =>
    deleteTrendyolListing(deps.commerce(), deps.marketplace(), user.id, storeId, variantId, channel),
  );
}

function supplierShape(channel: CommerceChannelName, supplierId: string): boolean {
  if (channel === "HEPSIBURADA") {
    return /^[A-Za-z0-9]{4,40}$/.test(supplierId) && /\d{4}$/.test(supplierId);
  }
  return /^\d{4,20}$/.test(supplierId);
}

export async function authenticateChannelWebhook(
  ports: Pick<TrendyolPorts, "commerce" | "marketplace" | "env">,
  request: Request,
  supplierId: string,
  channel: CommerceChannelName,
): Promise<{ storeId: string; ownerUserId: string; supplierId: string } | null> {
  const apiKeyHeader = request.headers.get("x-api-key")?.trim() ?? "";
  const basic = apiKeyHeader ? null : readBasic(request.headers.get("authorization") ?? "");
  const token =
    apiKeyHeader.length > 0
      ? { apiKey: apiKeyHeader, apiSecret: null as string | null }
      : basic
        ? { apiKey: basic.username, apiSecret: basic.password }
        : null;
  if (!token || !supplierShape(channel, supplierId)) {
    return null;
  }
  const rows = await ports.marketplace.listCredentialsByHint(supplierHint(supplierId), channel);
  let match: MarketplaceCredentialRow | null = null;
  for (const row of rows) {
    let openedSupplier = "";
    let apiKey = "";
    let apiSecret = "";
    try {
      openedSupplier = openCommerceCredential(row.supplierSeal, "supplier", row.storeId, ports.env, channel);
      apiKey = openCommerceCredential(row.apiKeySeal, "apiKey", row.storeId, ports.env, channel);
      apiSecret = openCommerceCredential(row.apiSecretSeal, "apiSecret", row.storeId, ports.env, channel);
    } catch (error) {
      if (error instanceof CommerceCredentialSealError && /yok|32 bayt/.test(error.message)) {
        throw error;
      }
      continue;
    }
    const supplierOk = timingSafeTextEqual(openedSupplier, supplierId);
    const keyOk = timingSafeTextEqual(apiKey, token.apiKey);
    const secretOk = token.apiSecret == null ? true : timingSafeTextEqual(apiSecret, token.apiSecret);
    if (supplierOk && keyOk && secretOk) {
      match = row;
    }
  }
  if (!match) {
    return null;
  }
  const store = await ports.commerce.findStoreById(match.storeId);
  if (!store) {
    return null;
  }
  return { storeId: store.id, ownerUserId: store.ownerUserId, supplierId };
}

export function authenticateTrendyolWebhook(
  ports: TrendyolPorts,
  request: Request,
  supplierId: string,
) {
  return authenticateChannelWebhook(ports, request, supplierId, COMMERCE_CHANNEL);
}

export async function postTrendyolWebhook(ports: TrendyolPorts, request: Request) {
  const requestId = resolveRequestId(request);
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  const packages = readTrendyolOrderPackages(payload);
  const supplierId = packages[0]?.supplierId ?? "";
  if (!supplierId) {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  try {
    const matched = await authenticateChannelWebhook(ports, request, supplierId, COMMERCE_CHANNEL);
    if (!matched) {
      return jsonFail("Yetkisiz.", 401, requestId, request);
    }
    const own = packages.filter((pkg) => pkg.supplierId === matched.supplierId);
    const lines = await intakeTrendyolPackages(ports, matched.storeId, matched.ownerUserId, own);
    if (lines.some((line) => line.outcome !== "skipped" && line.status === "STOCK_SHORT")) {
      return jsonFail("STOCK_SHORT", 409, requestId, request);
    }
    return jsonOk({ accepted: true, lines: lines.length }, 200, requestId, request);
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function postHepsiburadaWebhook(ports: HepsiburadaPorts, request: Request) {
  const requestId = resolveRequestId(request);
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  const packages = readHepsiburadaOrderPackages(payload);
  const merchantId = packages[0]?.merchantId ?? "";
  if (!merchantId) {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  try {
    const matched = await authenticateChannelWebhook(ports, request, merchantId, "HEPSIBURADA");
    if (!matched) {
      return jsonFail("Yetkisiz.", 401, requestId, request);
    }
    const own = packages.filter((pkg) => pkg.merchantId === matched.supplierId);
    const lines = await intakeHepsiburadaPackages(ports, matched.storeId, matched.ownerUserId, own);
    if (lines.some((line) => line.outcome !== "skipped" && line.status === "STOCK_SHORT")) {
      return jsonFail("STOCK_SHORT", 409, requestId, request);
    }
    return jsonOk({ accepted: true, lines: lines.length }, 200, requestId, request);
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
