export const OS_TABS = ["havuz", "kanallar", "siparis", "buyume"] as const;

export type OsTab = (typeof OS_TABS)[number];

export const OS_CHANNEL_CATALOG = [
  { kind: "OWN_STORE", label: "Kendi Web Sitesi", needsKey: false },
  { kind: "TRENDYOL", label: "Trendyol", needsKey: true },
  { kind: "HEPSIBURADA", label: "Hepsiburada", needsKey: true },
  { kind: "AMAZON", label: "Amazon", needsKey: true },
  { kind: "N11", label: "N11", needsKey: true },
] as const;

export type OsChannelKind = (typeof OS_CHANNEL_CATALOG)[number]["kind"];

export const POOL_STORE_NAME = "E-Ticaret Havuzu";

export function parseOsTab(value: string | undefined): OsTab {
  if (value === "kanallar" || value === "siparis" || value === "buyume") {
    return value;
  }
  return "havuz";
}

export function isOsChannelKind(value: string): value is OsChannelKind {
  return OS_CHANNEL_CATALOG.some((row) => row.kind === value);
}

export function channelNeedsKey(kind: OsChannelKind): boolean {
  return OS_CHANNEL_CATALOG.find((row) => row.kind === kind)?.needsKey === true;
}

/** 0 eşik uyarıyı kapatır. Taslak stok bu hesaba girmez. */
export function isCriticalStock(approved: number, critical: number): boolean {
  return critical > 0 && approved <= critical;
}

/** Eşik varsa eşiğin üstü yüksektir. Eşik yoksa 10 ve üstü. */
export function isHighStock(approved: number, critical: number): boolean {
  if (approved <= 0) {
    return false;
  }
  if (critical > 0) {
    return approved > critical;
  }
  return approved >= 10;
}

export function pickPoolStore<T extends { name: string }>(stores: readonly T[]): T | null {
  if (stores.length === 0) {
    return null;
  }
  return stores.find((store) => store.name === POOL_STORE_NAME) ?? stores[0] ?? null;
}

/** Taslak onaylı adedi değiştirmez. Onay, satış ve iade defter matematiği. */
export function nextApprovedQty(
  current: number,
  type: "INBOUND_DRAFT" | "INBOUND_APPROVED" | "CHANNEL_SALE" | "RETURN_RESTOCK",
  quantity: number,
): number | null {
  if (!Number.isInteger(current) || current < 0 || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  if (type === "INBOUND_DRAFT") {
    return current;
  }
  if (type === "INBOUND_APPROVED" || type === "RETURN_RESTOCK") {
    const next = current + quantity;
    return next <= 2_147_483_647 ? next : null;
  }
  return current >= quantity ? current - quantity : null;
}
