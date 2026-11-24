import { createHmac, timingSafeEqual } from "node:crypto";
import { webhookSecretFromBroadcastKey } from "@/lib/commerce/channel-credentials";
import { CommerceCredentialSealError, openCommerceCredential } from "@/lib/commerce/credential-seal";
import type { OsChannelKind } from "@/lib/commerce/os-rules";

export const CHANNEL_SLUGS = {
  "own-store": "OWN_STORE",
  trendyol: "TRENDYOL",
  hepsiburada: "HEPSIBURADA",
  amazon: "AMAZON",
  n11: "N11",
} as const;

export type ChannelSlug = keyof typeof CHANNEL_SLUGS;

export const CHANNEL_ORDER_EVENTS = ["ORDER_CREATED", "ORDER_CANCELLED", "ORDER_RETURNED"] as const;

export type ChannelOrderEvent = (typeof CHANNEL_ORDER_EVENTS)[number];

export const OVERSELL_ALERT = "Aşırı Satış / Stok Tükendi Uyarısı";
export const CRITICAL_STOCK_ALERT = "Kritik stok uyarısı";

export type ChannelWebhookPayload = {
  storeId: string;
  sku: string;
  externalOrderId: string;
  eventType: ChannelOrderEvent;
  quantity: number;
  customerLabel: string;
  /** Pazaryeri barkodu (varsa). Stok düşümü bu varyantı hedefler — ürün toplamı değil. */
  barcode?: string;
};

const ORDER_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export function isOsChannelWebhookBody(value: unknown): boolean {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const eventType = (value as { eventType?: unknown }).eventType;
  return eventType === "ORDER_CREATED" || eventType === "ORDER_CANCELLED" || eventType === "ORDER_RETURNED";
}

export function channelKindFromSlug(slug: string): OsChannelKind | null {
  if (!Object.prototype.hasOwnProperty.call(CHANNEL_SLUGS, slug)) {
    return null;
  }
  return CHANNEL_SLUGS[slug as ChannelSlug];
}

export function commerceWebhookSignature(secret: string, rawBody: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function channelWebhookAuthorized(
  secrets: readonly string[],
  rawBody: string,
  signatureHeader: string,
  secretHeader: string,
): boolean {
  const signature = signatureHeader.trim().toLowerCase();
  const presented = secretHeader.trim();
  if (!signature && !presented) {
    return false;
  }
  for (const secret of secrets) {
    if (!secret) {
      continue;
    }
    if (signature && safeEqual(commerceWebhookSignature(secret, rawBody), signature)) {
      return true;
    }
    if (presented && safeEqual(presented, secret)) {
      return true;
    }
  }
  return false;
}

export function collectChannelWebhookSecrets(input: {
  env: NodeJS.ProcessEnv;
  storeId: string;
  ownerUserId: string;
  kind: OsChannelKind;
  simOwner: string;
  apiKeySeal: string;
}): { ok: true; secrets: string[] } | { ok: false; closed: boolean } {
  const secrets: string[] = [];
  if (input.apiKeySeal.startsWith("ccred1:")) {
    try {
      const opened = openCommerceCredential(input.apiKeySeal, "apiKey", input.storeId, input.env, input.kind);
      const secret = webhookSecretFromBroadcastKey(opened).trim();
      if (secret) {
        secrets.push(secret);
      }
    } catch (error) {
      if (!(error instanceof CommerceCredentialSealError)) {
        throw error;
      }
      if (/yok|32 bayt/.test(error.message)) {
        return { ok: false, closed: true };
      }
    }
  }
  const named = input.env[`COMMERCE_WEBHOOK_SECRET_${input.kind}`]?.trim() ?? "";
  const shared = input.env.COMMERCE_OS_WEBHOOK_SECRET?.trim() ?? "";
  if (named) {
    secrets.push(named);
  }
  if (shared) {
    secrets.push(shared);
  }
  return { ok: true, secrets };
}

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

export function parseChannelWebhookPayload(
  value: unknown,
): { ok: true; payload: ChannelWebhookPayload } | { ok: false; error: string } {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const row = value as Record<string, unknown>;
  const storeId = text(row.storeId, 64);
  const sku = text(row.sku, 64);
  const externalOrderId = text(row.externalOrderId, 64);
  const eventType = row.eventType;
  const quantity = row.quantity;
  if (!storeId || !sku || !externalOrderId || !ORDER_ID.test(externalOrderId)) {
    return { ok: false, error: "Sipariş fişi eksik." };
  }
  if (eventType !== "ORDER_CREATED" && eventType !== "ORDER_CANCELLED" && eventType !== "ORDER_RETURNED") {
    return { ok: false, error: "Olay tipi geçersiz." };
  }
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
    return { ok: false, error: "Adet 1 ile 1000000 arasında olmalıdır." };
  }
  const label = text(row.customerLabel, 80) ?? "Kanal siparişi";
  const barcode = typeof row.barcode === "string" ? text(row.barcode, 40) : null;
  return {
    ok: true,
    payload: {
      storeId,
      sku,
      externalOrderId,
      eventType,
      quantity,
      customerLabel: label,
      ...(barcode ? { barcode } : {}),
    },
  };
}

export function signedChannelWebhookRequest(input: {
  channel: ChannelSlug;
  secret: string;
  payload: ChannelWebhookPayload;
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
  return new Request(`https://yetkin.ai/api/commerce/webhooks/${input.channel}`, {
    method: "POST",
    headers,
    body: raw,
  });
}
