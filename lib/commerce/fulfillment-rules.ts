/**
 * Sipariş durum makinesi, depo toplama ve etiket taslağı. Veritabanı yok.
 */

export const FULFILLMENT_CHANNELS = ["TRENDYOL", "HEPSIBURADA", "OWN_STORE"] as const;

export type FulfillmentChannel = (typeof FULFILLMENT_CHANNELS)[number];

export const FULFILLMENT_STATUSES = ["NEW", "PREPARED", "SHIPPED", "DELIVERED", "CANCELED"] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export type FulfillmentItem = {
  sku: string;
  title: string;
  variant: string;
  quantity: number;
};

export type FulfillmentDraft = {
  storeId: string;
  channel: FulfillmentChannel;
  externalOrderNo: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  cargoCompany: string;
  cargoTrackingCode: string;
  items: FulfillmentItem[];
  totalMinor: number;
  status: "NEW" | "CANCELED";
  now: Date;
};

const NEXT: Record<FulfillmentStatus, readonly FulfillmentStatus[]> = {
  NEW: ["PREPARED", "CANCELED"],
  PREPARED: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};

export function isFulfillmentChannel(value: string): value is FulfillmentChannel {
  return value === "TRENDYOL" || value === "HEPSIBURADA" || value === "OWN_STORE";
}

export function isFulfillmentStatus(value: string): value is FulfillmentStatus {
  return (FULFILLMENT_STATUSES as readonly string[]).includes(value);
}

export function fulfillmentChannelLabel(channel: FulfillmentChannel): string {
  if (channel === "TRENDYOL") {
    return "Trendyol";
  }
  if (channel === "HEPSIBURADA") {
    return "Hepsiburada";
  }
  return "Kendi siten";
}

export function fulfillmentStatusLabel(status: FulfillmentStatus): string {
  switch (status) {
    case "NEW":
      return "Sipariş geldi";
    case "PREPARED":
      return "Hazırlandı";
    case "SHIPPED":
      return "Kargoya verildi";
    case "DELIVERED":
      return "Teslim edildi";
    case "CANCELED":
      return "İptal";
  }
}

export function canTransitionFulfillment(from: FulfillmentStatus, to: FulfillmentStatus): boolean {
  return NEXT[from].includes(to);
}

export type StatusMove =
  | { ok: true; shippedAt: Date | null; labelPrintedAt: Date | null }
  | { ok: false; error: string };

/** `NEW` → `PREPARED` → `SHIPPED`. Kargoya verme takip kodu ister. */
export function planFulfillmentStatus(input: {
  from: FulfillmentStatus;
  to: FulfillmentStatus;
  cargoTrackingCode: string;
  now: Date;
  labelPrintedAt: Date | null;
  shippedAt: Date | null;
}): StatusMove {
  if (!canTransitionFulfillment(input.from, input.to)) {
    return { ok: false, error: "Bu sipariş bu adıma geçemez." };
  }
  const tracking = input.cargoTrackingCode.trim();
  if (input.to === "SHIPPED" && tracking.length < 4) {
    return { ok: false, error: "Kargo takip kodu gerekli." };
  }
  return {
    ok: true,
    shippedAt: input.to === "SHIPPED" ? input.now : input.shippedAt,
    labelPrintedAt: input.to === "PREPARED" ? (input.labelPrintedAt ?? input.now) : input.labelPrintedAt,
  };
}

export type PickLine = {
  sku: string;
  title: string;
  variant: string;
  quantity: number;
};

/** Depocunun aynı SKU'yu tek satırda görmesi için toplar. */
export function buildPickList(orders: readonly { items: readonly FulfillmentItem[] }[]): PickLine[] {
  const map = new Map<string, PickLine>();
  for (const order of orders) {
    for (const item of order.items) {
      const sku = item.sku.trim();
      const variant = item.variant.trim();
      const key = `${sku}\u0000${variant}`;
      const current = map.get(key);
      const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0;
      if (!sku || quantity < 1) {
        continue;
      }
      if (current) {
        current.quantity += quantity;
      } else {
        map.set(key, {
          sku,
          title: item.title.trim() || sku,
          variant,
          quantity,
        });
      }
    }
  }
  return [...map.values()].sort((left, right) => left.sku.localeCompare(right.sku, "tr"));
}

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= max ? text : text.slice(0, max);
}

export function readFulfillmentItems(value: unknown): FulfillmentItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: FulfillmentItem[] = [];
  for (const row of value) {
    if (row == null || typeof row !== "object" || Array.isArray(row)) {
      continue;
    }
    const record = row as Record<string, unknown>;
    const sku = typeof record.sku === "string" ? clip(record.sku, 64) : "";
    const quantity = record.quantity;
    if (!sku || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) {
      continue;
    }
    items.push({
      sku,
      title: typeof record.title === "string" ? clip(record.title, 200) : sku,
      variant: typeof record.variant === "string" ? clip(record.variant, 80) : "",
      quantity,
    });
  }
  return items;
}

export function draftFromMarketplacePackage(input: {
  storeId: string;
  channel: FulfillmentChannel;
  externalOrderNo: string;
  statusText: string | null;
  lines: readonly { barcode: string; quantity: number }[];
  now: Date;
}): FulfillmentDraft {
  const status = (input.statusText ?? "").toLowerCase();
  const canceled = /cancel|iptal|return|iade|unsupplied/.test(status);
  return {
    storeId: input.storeId,
    channel: input.channel,
    externalOrderNo: clip(input.externalOrderNo, 64),
    customerName: "Kanal siparişi",
    customerPhone: "",
    shippingAddress: "",
    cargoCompany: fulfillmentChannelLabel(input.channel),
    cargoTrackingCode: "",
    items: input.lines.map((line) => ({
      sku: clip(line.barcode, 64),
      title: clip(line.barcode, 200),
      variant: "",
      quantity: line.quantity,
    })),
    totalMinor: 0,
    status: canceled ? "CANCELED" : "NEW",
    now: input.now,
  };
}

export function draftFromChannelEvent(input: {
  storeId: string;
  channel: string;
  externalOrderId: string;
  sku: string;
  variantSku: string;
  quantity: number;
  customerLabel: string;
  eventType: "ORDER_CREATED" | "ORDER_CANCELLED" | "ORDER_RETURNED";
  now: Date;
}): FulfillmentDraft | null {
  if (!isFulfillmentChannel(input.channel)) {
    return null;
  }
  return {
    storeId: input.storeId,
    channel: input.channel,
    externalOrderNo: clip(input.externalOrderId, 64),
    customerName: clip(input.customerLabel, 120) || "Kanal siparişi",
    customerPhone: "",
    shippingAddress: "",
    cargoCompany: fulfillmentChannelLabel(input.channel),
    cargoTrackingCode: "",
    items: [
      {
        sku: clip(input.variantSku || input.sku, 64),
        title: clip(input.sku, 200),
        variant: clip(input.variantSku, 80),
        quantity: input.quantity,
      },
    ],
    totalMinor: 0,
    status: input.eventType === "ORDER_CREATED" ? "NEW" : "CANCELED",
    now: input.now,
  };
}

export type CargoNotice = {
  queued: true;
  channel: FulfillmentChannel;
  trackingCode: string;
  message: string;
};

/** Pazaryeri kargo bildirimi bu kayıtla tetiklenir. Dış çağrı uydurulmaz. */
export function queueCargoNotice(channel: FulfillmentChannel, trackingCode: string): CargoNotice {
  const code = trackingCode.trim();
  if (channel === "OWN_STORE") {
    return {
      queued: true,
      channel,
      trackingCode: code,
      message: "Takip kodun kayda alındı. Kendi siten pazaryeri bildirimi beklemez.",
    };
  }
  const label = fulfillmentChannelLabel(channel);
  return {
    queued: true,
    channel,
    trackingCode: code,
    message: `Takip kodun kayda alındı. ${label} kargo bildirimi bu kodla tetiklendi.`,
  };
}

export function slaDeadline(now: Date): Date {
  return new Date(now.getTime() + 48 * 60 * 60 * 1000);
}

const HTTPS_LOGO = /^https:\/\/[^\s]{8,480}$/;

export function parseLabelSettings(raw: unknown):
  | { ok: true; logoUrl: string | null; senderTitle: string; senderPhone: string; senderAddress: string }
  | { ok: false; error: string } {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const body = raw as Record<string, unknown>;
  const title = typeof body.senderTitle === "string" ? clip(body.senderTitle, 120) : "";
  const phone = typeof body.senderPhone === "string" ? clip(body.senderPhone, 20) : "";
  const address = typeof body.senderAddress === "string" ? clip(body.senderAddress, 400) : "";
  if (title.length < 2) {
    return { ok: false, error: "Gönderici unvanı gerekli." };
  }
  let logoUrl: string | null = null;
  if (typeof body.logoUrl === "string" && body.logoUrl.trim()) {
    const candidate = body.logoUrl.trim();
    if (!HTTPS_LOGO.test(candidate)) {
      return { ok: false, error: "Logo adresi https ile başlamalı." };
    }
    logoUrl = candidate;
  }
  return { ok: true, logoUrl, senderTitle: title, senderPhone: phone, senderAddress: address };
}
