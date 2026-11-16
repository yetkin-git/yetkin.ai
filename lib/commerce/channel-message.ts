import type { ChannelSlug } from "@/lib/commerce/channel-webhook";
import { commerceWebhookSignature } from "@/lib/commerce/channel-webhook";
import type { OsChannelKind } from "@/lib/commerce/os-rules";

export const CHANNEL_MESSAGE_EVENTS = ["CUSTOMER_QUESTION", "PRODUCT_REVIEW"] as const;

export type ChannelMessageEvent = (typeof CHANNEL_MESSAGE_EVENTS)[number];

export type ChannelMessagePayload = {
  storeId: string;
  externalMessageId: string;
  eventType: ChannelMessageEvent;
  body: string;
  sku: string;
  externalProductId: string;
  customerLabel: string;
};

const MESSAGE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > max) {
    return null;
  }
  return trimmed;
}

export function messageIdempotencyKey(channel: OsChannelKind, storeId: string, externalMessageId: string): string {
  return `msg:${channel}:${storeId}:${externalMessageId}`;
}

export function parseChannelMessagePayload(
  value: unknown,
): { ok: true; payload: ChannelMessagePayload } | { ok: false; error: string } {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const row = value as Record<string, unknown>;
  const storeId = text(row.storeId, 64);
  const externalMessageId = text(row.externalMessageId, 64);
  const body = text(row.body, 2000);
  const eventType = row.eventType;
  if (!storeId || !externalMessageId || !MESSAGE_ID.test(externalMessageId) || !body || body.length < 2) {
    return { ok: false, error: "Mesaj fişi eksik." };
  }
  if (eventType !== "CUSTOMER_QUESTION" && eventType !== "PRODUCT_REVIEW") {
    return { ok: false, error: "Olay tipi geçersiz." };
  }
  const sku = text(row.sku, 64) ?? "";
  const externalProductId = text(row.externalProductId, 64) ?? "";
  if (!sku && !externalProductId) {
    return { ok: false, error: "Ürün kimliği eksik." };
  }
  const fallback = eventType === "PRODUCT_REVIEW" ? "Yorum" : "Müşteri";
  const customerLabel = text(row.customerLabel, 80) ?? fallback;
  return {
    ok: true,
    payload: { storeId, externalMessageId, eventType, body, sku, externalProductId, customerLabel },
  };
}

export function signedChannelMessageRequest(input: {
  channel: ChannelSlug;
  secret: string;
  payload: ChannelMessagePayload;
  simOwner?: string;
}): Request {
  const raw = JSON.stringify(input.payload);
  const headers = new Headers({
    "content-type": "application/json",
    "x-commerce-signature": commerceWebhookSignature(input.secret, raw),
  });
  if (input.simOwner) {
    headers.set("x-commerce-sim-owner", input.simOwner);
  }
  return new Request(`https://yetkin.ai/api/commerce/webhooks/${input.channel}/messages`, {
    method: "POST",
    headers,
    body: raw,
  });
}
