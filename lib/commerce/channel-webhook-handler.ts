import type { ChannelPushOutcome } from "@/lib/commerce/channel-adapters";
import type { ChannelCommitInput, ChannelCommitResult } from "@/lib/commerce/channel-stock-engine";
import {
  channelKindFromSlug,
  channelWebhookAuthorized,
  collectChannelWebhookSecrets,
  parseChannelWebhookPayload,
} from "@/lib/commerce/channel-webhook";
import type { OsChannelKind } from "@/lib/commerce/os-rules";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { CommerceCredentialSealError } from "@/lib/commerce/credential-seal";

export type ChannelWebhookDeps = {
  env: NodeJS.ProcessEnv;
  findStore: (storeId: string) => Promise<{ id: string; ownerUserId: string } | null>;
  findChannel: (storeId: string, kind: OsChannelKind) => Promise<{ apiKeySeal: string } | null>;
  commit: (input: ChannelCommitInput) => Promise<ChannelCommitResult>;
  broadcast: (productId: string, excludeChannel: OsChannelKind) => Promise<ChannelPushOutcome[]>;
};

function wire(result: ChannelCommitResult, broadcast: ChannelPushOutcome[]) {
  if (!result.ok) {
    return null;
  }
  return {
    replayed: result.replayed,
    ledgerId: result.ledgerId,
    externalOrderId: result.externalOrderId,
    eventType: result.eventType,
    stockAfter: result.stockAfter,
    oversell: result.oversell,
    orderStatus: result.orderStatus,
    broadcast: broadcast.map((row) => ({ channel: row.kind, status: row.status })),
  };
}

export async function postCommerceChannelWebhook(deps: ChannelWebhookDeps, request: Request, slug: string) {
  const requestId = resolveRequestId(request);
  const kind = channelKindFromSlug(slug);
  if (!kind) {
    return jsonFail("Kanal geçersiz.", 404, requestId, request);
  }
  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  if (raw.length < 2 || raw.length > 20_000) {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw) as unknown;
  } catch {
    return jsonFail("İstek geçersiz.", 400, requestId, request);
  }
  const parsed = parseChannelWebhookPayload(parsedJson);
  if (!parsed.ok) {
    return jsonFail(parsed.error, 422, requestId, request);
  }
  try {
    const store = await deps.findStore(parsed.payload.storeId);
    if (!store) {
      return jsonFail("Yetkisiz.", 401, requestId, request);
    }
    const channel = await deps.findChannel(store.id, kind);
    const secrets = collectChannelWebhookSecrets({
      env: deps.env,
      storeId: store.id,
      ownerUserId: store.ownerUserId,
      kind,
      simOwner: request.headers.get("x-commerce-sim-owner")?.trim() ?? "",
      apiKeySeal: channel?.apiKeySeal ?? "",
    });
    if (!secrets.ok) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    const allowed = channelWebhookAuthorized(
      secrets.secrets,
      raw,
      request.headers.get("x-commerce-signature") ?? "",
      request.headers.get("x-commerce-webhook-secret") ?? "",
    );
    if (!allowed) {
      return jsonFail("Yetkisiz.", 401, requestId, request);
    }
    const committed = await deps.commit({
      storeId: store.id,
      actorUserId: store.ownerUserId,
      sku: parsed.payload.sku,
      channel: kind,
      eventType: parsed.payload.eventType,
      quantity: parsed.payload.quantity,
      externalOrderId: parsed.payload.externalOrderId,
      customerLabel: parsed.payload.customerLabel,
    });
    if (!committed.ok) {
      return jsonFail(committed.error, committed.status, requestId, request);
    }
    const broadcast =
      committed.replayed || !committed.productId ? [] : await deps.broadcast(committed.productId, kind);
    const body = wire(committed, broadcast);
    if (!body) {
      return jsonFail("Sipariş işlenmedi.", 422, requestId, request);
    }
    return jsonOk(body, 200, requestId, request);
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
