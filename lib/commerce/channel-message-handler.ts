import { commitChannelMessage, type ChannelMessageUnit } from "@/lib/commerce/channel-message-engine";
import { parseChannelMessagePayload } from "@/lib/commerce/channel-message";
import {
  channelKindFromSlug,
  channelWebhookAuthorized,
  collectChannelWebhookSecrets,
} from "@/lib/commerce/channel-webhook";
import type { OsChannelKind } from "@/lib/commerce/os-rules";
import { CommerceCredentialSealError } from "@/lib/commerce/credential-seal";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";

export type ChannelMessageDeps = {
  env: NodeJS.ProcessEnv;
  findStore: (storeId: string) => Promise<{ id: string; ownerUserId: string } | null>;
  findChannel: (storeId: string, kind: OsChannelKind) => Promise<{ apiKeySeal: string } | null>;
  messages: ChannelMessageUnit;
};

export async function postCommerceChannelMessage(deps: ChannelMessageDeps, request: Request, slug: string) {
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
  const parsed = parseChannelMessagePayload(parsedJson);
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
    const committed = await commitChannelMessage(deps.messages, { ...parsed.payload, channel: kind });
    if (!committed.ok) {
      return jsonFail(committed.error, committed.status, requestId, request);
    }
    return jsonOk(
      {
        replayed: committed.replayed,
        entryId: committed.entryId,
        eventType: committed.eventType,
        productId: committed.productId,
        linked: committed.linked,
      },
      200,
      requestId,
      request,
    );
  } catch (error) {
    if (error instanceof CommerceCredentialSealError) {
      return jsonFail("Kimlik kasası kapalı.", 503, requestId, request);
    }
    return jsonFromUnknown(error, 400, requestId, request);
  }
}
