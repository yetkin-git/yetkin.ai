import type { OsChannelKind } from "@/lib/commerce/os-rules";

export type OsProductView = {
  id: string;
  storeId: string;
  title: string;
  sku: string;
  category: string;
  priceMinor: number;
  approvedStockQty: number;
  criticalStockQty: number;
  critical: boolean;
  highStock: boolean;
  adEligible: boolean;
  variantId: string | null;
  pendingDraft: { id: string; quantity: number } | null;
};

export type OsChannelView = {
  kind: OsChannelKind;
  label: string;
  needsKey: boolean;
  status: "DISCONNECTED" | "CONNECTED" | "ERROR";
  hint: string;
  lastError: string;
  lastSyncedAt: string | null;
};

export type OsInboxView = {
  id: string;
  kind: "ORDER" | "QUESTION" | "EXPERT_TASK" | "STOCK_ALERT" | "CUSTOMER_QUESTION" | "PRODUCT_REVIEW";
  channelLabel: string;
  title: string;
  body: string;
  priority: number;
  orderStatus: "OPEN" | "CANCELLED" | "RETURNED" | null;
  messageStatus: "OPEN" | "DRAFT" | "ANSWERED" | "PENDING_CREDENTIALS" | null;
  productId: string | null;
  productTitle: string | null;
  replyBody: string;
  replySentAt: string | null;
  createdAt: string;
  canSuggest: boolean;
  canSend: boolean;
  deskStatus: "OPEN" | "IN_PROGRESS" | "DELIVERED" | null;
  deskNote: string;
};

export type OsExportSupport = {
  productCount: number;
  approvedUnits: number;
  pricedStockLabel: string | null;
  lines: OsGrantLine[];
  note: string;
};

export type OsGrantLine = {
  title: string;
  source: string;
  remainingDays: number;
  statusLabel: string;
};

export type OsStoreLink = {
  id: string;
  name: string;
  slug: string;
};

export type EcommerceLicenseBand = {
  /** Açık ve süresi dolmamış mağaza lisansı. */
  active: boolean;
  /** Lisanssız olduğu biliniyorsa pazaryeri «Bağla» kapısı açılır. Okunamadıysa kapı susar. */
  gate: boolean;
  /** Katalog `commerce / monthly` satırının kompakt tutarı, sonuna ` / Ay` eklenir. Satır yoksa null. */
  priceLabel: string | null;
  activateHref: string;
};

export type OsCockpitView = {
  products: OsProductView[];
  channels: OsChannelView[];
  inbox: OsInboxView[];
  stores: OsStoreLink[];
  grants: { ok: true; lines: OsGrantLine[] } | { ok: false; message: string };
  exportSupport: OsExportSupport;
};
