import { HEPSIBURADA_LISTING_BASE, hepsiburadaStockPath } from "@/lib/commerce/hepsiburada-client";
import type { OsChannelKind } from "@/lib/commerce/os-rules";
import { TRENDYOL_API_BASE, trendyolHeaders, trendyolPriceStockPath } from "@/lib/commerce/trendyol-client";

export const AMAZON_STOCK_URL = "https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/stock";
export const AMAZON_REPLY_URL = "https://sellingpartnerapi-eu.amazon.com/messaging/v1/messages";
export const N11_STOCK_URL = "https://api.n11.com/ms/product/tasks/price-stock-update";
export const N11_REPLY_URL = "https://api.n11.com/ms/product/questions/answer";
export const HEPSIBURADA_REPLY_URL = "https://mpop.hepsiburada.com/api/questions/answer";

export type ChannelFetch = (url: string, init: RequestInit) => Promise<Response>;

export type ChannelPushStatus = "PUSHED" | "PENDING_CREDENTIALS" | "FAILED";

export type ChannelPushOutcome = {
  kind: OsChannelKind;
  status: ChannelPushStatus;
  detail: string;
};

export type ChannelStockPush = {
  sku: string;
  quantity: number;
  apiKey: string | null;
  fetchImpl: ChannelFetch;
};

export type ChannelReplyPush = {
  externalMessageId: string;
  body: string;
  apiKey: string | null;
  fetchImpl: ChannelFetch;
};

export interface ChannelStockAdapter {
  readonly kind: OsChannelKind;
  push(input: ChannelStockPush): Promise<ChannelPushOutcome>;
}

export interface ChannelReplyAdapter {
  readonly kind: OsChannelKind;
  pushReply(input: ChannelReplyPush): Promise<ChannelPushOutcome>;
}

type ParsedKey = { sellerId: string; apiKey: string; apiSecret: string };

function parseTriple(apiKey: string): ParsedKey | null {
  const parts = apiKey.split(":");
  if (parts.length !== 3 || parts.some((part) => part.length < 4)) {
    return null;
  }
  return { sellerId: parts[0] ?? "", apiKey: parts[1] ?? "", apiSecret: parts[2] ?? "" };
}

function pending(kind: OsChannelKind): ChannelPushOutcome {
  return { kind, status: "PENDING_CREDENTIALS", detail: "PENDING_CREDENTIALS" };
}

function pushed(kind: OsChannelKind, detail: string): ChannelPushOutcome {
  return { kind, status: "PUSHED", detail };
}

function failed(kind: OsChannelKind, detail: string): ChannelPushOutcome {
  return { kind, status: "FAILED", detail };
}

async function postJson(
  kind: OsChannelKind,
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  fetchImpl: ChannelFetch,
  headers?: Headers,
): Promise<ChannelPushOutcome> {
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: headers ?? new Headers({ authorization: `Bearer ${apiKey}`, "content-type": "application/json" }),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      return failed(kind, `HTTP ${response.status}`);
    }
    return pushed(kind, "Stok iletildi.");
  } catch {
    return failed(kind, "Kanal isteği tamamlanmadı.");
  }
}

async function postReply(
  kind: OsChannelKind,
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  fetchImpl: ChannelFetch,
  headers?: Headers,
): Promise<ChannelPushOutcome> {
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: headers ?? new Headers({ authorization: `Bearer ${apiKey}`, "content-type": "application/json" }),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      return failed(kind, `HTTP ${response.status}`);
    }
    return pushed(kind, "Yanıt iletildi.");
  } catch {
    return failed(kind, "Kanal isteği tamamlanmadı.");
  }
}

export class OwnStoreAdapter implements ChannelStockAdapter, ChannelReplyAdapter {
  readonly kind = "OWN_STORE" as const;

  push(_input: ChannelStockPush): Promise<ChannelPushOutcome> {
    return Promise.resolve(pushed(this.kind, "Vitrin merkez stoğu."));
  }

  pushReply(_input: ChannelReplyPush): Promise<ChannelPushOutcome> {
    return Promise.resolve(pushed(this.kind, "Vitrin yanıtı kayda geçti."));
  }
}

export class TrendyolAdapter implements ChannelStockAdapter, ChannelReplyAdapter {
  readonly kind = "TRENDYOL" as const;

  push(input: ChannelStockPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    const parsed = parseTriple(input.apiKey);
    const supplierId = parsed && /^\d{4,20}$/.test(parsed.sellerId) ? parsed.sellerId : "";
    const url = supplierId
      ? `${TRENDYOL_API_BASE}${trendyolPriceStockPath(supplierId)}`
      : `${TRENDYOL_API_BASE}/integration/inventory/sellers/products/price-and-inventory`;
    const headers =
      parsed && supplierId ? trendyolHeaders(supplierId, parsed.apiKey, parsed.apiSecret) : undefined;
    return postJson(
      this.kind,
      url,
      input.apiKey,
      { items: [{ barcode: input.sku, quantity: input.quantity }] },
      input.fetchImpl,
      headers,
    );
  }

  pushReply(input: ChannelReplyPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    const parsed = parseTriple(input.apiKey);
    const supplierId = parsed && /^\d{4,20}$/.test(parsed.sellerId) ? parsed.sellerId : "";
    const url = supplierId
      ? `${TRENDYOL_API_BASE}/integration/qna/sellers/${encodeURIComponent(supplierId)}/questions/${encodeURIComponent(input.externalMessageId)}/answers`
      : `${TRENDYOL_API_BASE}/integration/qna/sellers/questions/answers`;
    const headers =
      parsed && supplierId ? trendyolHeaders(supplierId, parsed.apiKey, parsed.apiSecret) : undefined;
    return postReply(this.kind, url, input.apiKey, { text: input.body }, input.fetchImpl, headers);
  }
}

export class HepsiburadaAdapter implements ChannelStockAdapter, ChannelReplyAdapter {
  readonly kind = "HEPSIBURADA" as const;

  push(input: ChannelStockPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    const parsed = parseTriple(input.apiKey);
    const merchantId =
      parsed && /^[A-Za-z0-9]{4,40}$/.test(parsed.sellerId) && /\d{4}$/.test(parsed.sellerId) ? parsed.sellerId : "";
    const url = merchantId
      ? `${HEPSIBURADA_LISTING_BASE}${hepsiburadaStockPath(merchantId)}`
      : `${HEPSIBURADA_LISTING_BASE}/listings/merchantid/stock-uploads`;
    const headers =
      parsed && merchantId
        ? new Headers({
            authorization: `Basic ${Buffer.from(`${parsed.apiKey}:${parsed.apiSecret}`, "utf8").toString("base64")}`,
            "content-type": "application/json",
          })
        : undefined;
    return postJson(
      this.kind,
      url,
      input.apiKey,
      { merchantSku: input.sku, availableStock: input.quantity },
      input.fetchImpl,
      headers,
    );
  }

  pushReply(input: ChannelReplyPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    const parsed = parseTriple(input.apiKey);
    const headers =
      parsed
        ? new Headers({
            authorization: `Basic ${Buffer.from(`${parsed.apiKey}:${parsed.apiSecret}`, "utf8").toString("base64")}`,
            "content-type": "application/json",
          })
        : undefined;
    return postReply(
      this.kind,
      HEPSIBURADA_REPLY_URL,
      input.apiKey,
      { issueNumber: input.externalMessageId, answer: input.body },
      input.fetchImpl,
      headers,
    );
  }
}

export class AmazonAdapter implements ChannelStockAdapter, ChannelReplyAdapter {
  readonly kind = "AMAZON" as const;

  push(input: ChannelStockPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    return postJson(this.kind, AMAZON_STOCK_URL, input.apiKey, { sku: input.sku, quantity: input.quantity }, input.fetchImpl);
  }

  pushReply(input: ChannelReplyPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    return postReply(
      this.kind,
      AMAZON_REPLY_URL,
      input.apiKey,
      { messageId: input.externalMessageId, text: input.body },
      input.fetchImpl,
    );
  }
}

export class N11Adapter implements ChannelStockAdapter, ChannelReplyAdapter {
  readonly kind = "N11" as const;

  push(input: ChannelStockPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    return postJson(this.kind, N11_STOCK_URL, input.apiKey, { sku: input.sku, quantity: input.quantity }, input.fetchImpl);
  }

  pushReply(input: ChannelReplyPush): Promise<ChannelPushOutcome> {
    if (!input.apiKey) {
      return Promise.resolve(pending(this.kind));
    }
    return postReply(
      this.kind,
      N11_REPLY_URL,
      input.apiKey,
      { questionId: input.externalMessageId, answer: input.body },
      input.fetchImpl,
    );
  }
}

export const CHANNEL_STOCK_ADAPTERS: Record<OsChannelKind, ChannelStockAdapter> = {
  OWN_STORE: new OwnStoreAdapter(),
  TRENDYOL: new TrendyolAdapter(),
  HEPSIBURADA: new HepsiburadaAdapter(),
  AMAZON: new AmazonAdapter(),
  N11: new N11Adapter(),
};

export const CHANNEL_REPLY_ADAPTERS: Record<OsChannelKind, ChannelReplyAdapter> = {
  OWN_STORE: CHANNEL_STOCK_ADAPTERS.OWN_STORE as OwnStoreAdapter,
  TRENDYOL: CHANNEL_STOCK_ADAPTERS.TRENDYOL as TrendyolAdapter,
  HEPSIBURADA: CHANNEL_STOCK_ADAPTERS.HEPSIBURADA as HepsiburadaAdapter,
  AMAZON: CHANNEL_STOCK_ADAPTERS.AMAZON as AmazonAdapter,
  N11: CHANNEL_STOCK_ADAPTERS.N11 as N11Adapter,
};

export function deliverChannelReply(kind: OsChannelKind, input: ChannelReplyPush): Promise<ChannelPushOutcome> {
  return CHANNEL_REPLY_ADAPTERS[kind].pushReply(input);
}
