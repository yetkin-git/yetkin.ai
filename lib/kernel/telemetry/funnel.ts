/**
 * Akademi dönüşüm hunisi — GA4 olayları.
 * Kimlik yoksa veya pencere yoksa no-op. PayTR ve defter bu dosyaya girmez.
 * Sorgu dizesi gönderilmez (kasa pasaportu `?p=` taşır).
 */

import { readGaMeasurementId } from "@/lib/kernel/telemetry/measurement-id";

export const GA4_FUNNEL_EVENT = {
  viewItem: "view_item",
  playFreePreview: "play_free_preview",
  beginCheckout: "begin_checkout",
  paytrIframeLoaded: "paytr_iframe_loaded",
  purchase: "purchase",
} as const;

export type Ga4FunnelEventName = (typeof GA4_FUNNEL_EVENT)[keyof typeof GA4_FUNNEL_EVENT];

export type Ga4FunnelItem = {
  itemId?: string | null;
  itemName?: string | null;
  valueMinor?: number | null;
  currency?: string | null;
  lessonKey?: string | null;
};

const CHECKOUT_MEMORY_KEY = "yetkin:ga4:checkout";
const DEDUPE_MS = 1_200;
const recent = new Map<string, number>();

type GtagFn = (...args: unknown[]) => void;

function integerMinor(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }
  return value;
}

function pagePath(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const path = window.location?.pathname;
  if (typeof path !== "string" || !path.startsWith("/")) {
    return undefined;
  }
  return path;
}

function allow(key: string): boolean {
  const now = Date.now();
  const prev = recent.get(key);
  if (prev != null && now - prev < DEDUPE_MS) {
    return false;
  }
  recent.set(key, now);
  return true;
}

function rememberCheckout(item: Ga4FunnelItem): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const itemId = item.itemId?.trim() ?? "";
  if (!itemId) {
    return;
  }
  try {
    sessionStorage.setItem(
      CHECKOUT_MEMORY_KEY,
      JSON.stringify({
        itemId,
        itemName: item.itemName?.trim() || null,
        valueMinor: integerMinor(item.valueMinor),
        currency: item.currency?.trim() || null,
      }),
    );
  } catch {
    // gizli pencere
  }
}

function recallCheckout(): Ga4FunnelItem | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(CHECKOUT_MEMORY_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    const row = parsed as {
      itemId?: unknown;
      itemName?: unknown;
      valueMinor?: unknown;
      currency?: unknown;
    };
    if (typeof row.itemId !== "string" || row.itemId.trim() === "") {
      return null;
    }
    return {
      itemId: row.itemId,
      itemName: typeof row.itemName === "string" ? row.itemName : null,
      valueMinor: integerMinor(row.valueMinor),
      currency: typeof row.currency === "string" ? row.currency : null,
    };
  } catch {
    return null;
  }
}

function eventParams(item: Ga4FunnelItem, ecommerce: boolean): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  const path = pagePath();
  if (path) {
    params.page_path = path;
  }
  const itemId = item.itemId?.trim() ?? "";
  if (itemId) {
    params.item_id = itemId;
  }
  const itemName = item.itemName?.trim() ?? "";
  if (itemName) {
    params.item_name = itemName;
  }
  const currency = item.currency?.trim() ?? "";
  if (currency) {
    params.currency = currency;
  }
  const minor = integerMinor(item.valueMinor);
  if (minor != null) {
    params.value_minor = minor;
    params.value = minor / 100;
  }
  const lessonKey = item.lessonKey?.trim() ?? "";
  if (lessonKey) {
    params.lesson_key = lessonKey;
  }
  if (ecommerce && itemId) {
    const entry: Record<string, unknown> = { item_id: itemId, quantity: 1 };
    if (itemName) {
      entry.item_name = itemName;
    }
    if (minor != null) {
      entry.price = minor / 100;
    }
    params.items = [entry];
  }
  return params;
}

function emit(name: Ga4FunnelEventName, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || !readGaMeasurementId()) {
    return;
  }
  const key = [
    name,
    String(params.item_id ?? ""),
    String(params.lesson_key ?? ""),
    String(params.page_path ?? ""),
  ].join(":");
  if (!allow(key)) {
    return;
  }
  // Ölçüm asla çağıran akışı kırmaz: eklenti/vekil `gtag`ı ezmiş veya
  // `dataLayer`ı dondurmuş olabilir. Hata yutulur, olay düşer.
  try {
    const target = window as Window & { dataLayer?: unknown[]; gtag?: GtagFn };
    if (!Array.isArray(target.dataLayer)) {
      target.dataLayer = [];
    }
    const queue = target.dataLayer;
    if (typeof target.gtag !== "function") {
      target.gtag = function gtag(...args: unknown[]) {
        queue.push(args);
      };
    }
    target.gtag("event", name, params);
  } catch {
    // ölçüm kapalı; kullanıcı akışı devam eder
  }
}

export function trackViewItem(item: Ga4FunnelItem): void {
  emit(GA4_FUNNEL_EVENT.viewItem, eventParams(item, true));
}

export function trackPlayFreePreview(item: Ga4FunnelItem): void {
  emit(GA4_FUNNEL_EVENT.playFreePreview, eventParams(item, false));
}

export function trackBeginCheckout(item: Ga4FunnelItem): void {
  rememberCheckout(item);
  emit(GA4_FUNNEL_EVENT.beginCheckout, eventParams(item, true));
}

export function trackPaytrIframeLoaded(): void {
  const params: Record<string, unknown> = {};
  const path = pagePath();
  if (path) {
    params.page_path = path;
  }
  emit(GA4_FUNNEL_EVENT.paytrIframeLoaded, params);
}

export function trackPurchase(item: Ga4FunnelItem = {}): void {
  const memory = recallCheckout();
  const merged: Ga4FunnelItem = {
    itemId: item.itemId?.trim() || memory?.itemId,
    itemName: item.itemName ?? memory?.itemName,
    valueMinor: item.valueMinor ?? memory?.valueMinor,
    currency: item.currency ?? memory?.currency,
  };
  emit(GA4_FUNNEL_EVENT.purchase, eventParams(merged, true));
}
