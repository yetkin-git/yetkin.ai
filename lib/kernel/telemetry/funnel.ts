/**
 * GA4 olayları. Kimlik yoksa veya pencere yoksa no-op. PayTR ve defter bu dosyaya girmez.
 *
 * Huni olayları (`view_item`, `purchase`, …) sorgu dizesi taşımaz: kasa pasaportu `?p=`
 * sırdır. `page_view` kampanya parametresini tutar; pasaport ve oturum anahtarları düşer.
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
  /** Defter veya sipariş kimliği. GA4 aynı `transaction_id`yi ikinci kez saymaz. */
  transactionId?: string | null;
};

const BLOCKED_PAGE_QUERY_KEYS = new Set([
  "p",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "code",
  "state",
  "email",
  "password",
  "session",
  "secret",
  "sig",
  "signature",
  "jwt",
]);

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

/** Kampanya sorgusu kalır. Pasaport (`p`) ve oturum anahtarları düşer. */
export function publicPageQuery(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) {
    return "";
  }
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return "";
  }
  const next = new URLSearchParams();
  for (const [key, value] of params) {
    const normalized = key.trim().toLowerCase();
    if (!normalized || BLOCKED_PAGE_QUERY_KEYS.has(normalized) || value.length > 160) {
      continue;
    }
    next.append(key, value);
  }
  const query = next.toString();
  return query ? `?${query}` : "";
}

function transactionId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const id = value.trim();
  if (!/^[A-Za-z0-9_-]{4,80}$/u.test(id)) {
    return null;
  }
  return id;
}

function publicReferrer(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const raw = document.referrer;
  if (!raw) {
    return undefined;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }
    return `${url.origin}${url.pathname}${publicPageQuery(url.search)}`;
  } catch {
    return undefined;
  }
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
  const txn = transactionId(item.transactionId);
  if (txn) {
    params.transaction_id = txn;
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

/**
 * Kanonik `gtag('event', name, params)`.
 * Düz `{ event }` nesnesi itilmez; o biçim GTM içindir ve bu üründe GTM yoktur.
 */
export function emitGa4Event(name: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || !readGaMeasurementId()) {
    return;
  }
  const path = pagePath();
  const payload: Record<string, unknown> = { ...params };
  if (path && typeof payload.page_path !== "string") {
    payload.page_path = path;
  }
  const key = [
    name,
    String(payload.item_id ?? ""),
    String(payload.lesson_key ?? ""),
    String(payload.page_path ?? ""),
    String(payload.transaction_id ?? ""),
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
    target.gtag("event", name, payload);
  } catch {
    // ölçüm kapalı; kullanıcı akışı devam eder
  }
}

function emit(name: Ga4FunnelEventName, params: Record<string, unknown>): void {
  emitGa4Event(name, params);
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
    transactionId: item.transactionId ?? null,
  };
  emit(GA4_FUNNEL_EVENT.purchase, eventParams(merged, true));
}

/** App Router geçişi. İlk belge dahil her rota `page_view` olur; `config` otomatik göndermez. */
export function trackPageView(pathname: string, search = ""): void {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return;
  }
  const page_path = `${pathname}${publicPageQuery(search)}`;
  const params: Record<string, unknown> = { page_path };
  if (typeof document !== "undefined") {
    const title = document.title?.trim() ?? "";
    if (title) {
      params.page_title = title;
    }
    const referrer = publicReferrer();
    if (referrer) {
      params.page_referrer = referrer;
    }
  }
  if (typeof window !== "undefined") {
    const origin = window.location?.origin;
    if (typeof origin === "string" && origin.length > 0) {
      try {
        const protocol = new URL(origin).protocol;
        if (protocol === "https:" || protocol === "http:") {
          params.page_location = `${origin}${page_path}`;
        }
      } catch {
        // köken yoksa yol yeter
      }
    }
  }
  emitGa4Event("page_view", params);
}
