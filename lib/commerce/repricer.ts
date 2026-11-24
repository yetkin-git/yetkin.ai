/**
 * Kanal bazlı taban fiyat ve rekabet kararı.
 * Tutarlar kuruş, oranlar baz puan. Float yok. Dış site kazıması yok.
 */

import {
  profitablePriceMinor,
  type BreakEvenPriceInput,
} from "@/lib/commerce/profit";

export const PRICE_CHANNELS = ["TRENDYOL", "HEPSIBURADA", "OWN_STORE", "AKAKCE", "CIMRI"] as const;

export type PriceChannel = (typeof PRICE_CHANNELS)[number];

export const REPRICE_STRATEGIES = ["FIXED", "UNDERCUT_STEP", "MATCH_LOWEST"] as const;

export type RepriceStrategy = (typeof REPRICE_STRATEGIES)[number];

export const REPRICE_DECISIONS = [
  "UNDERCUT",
  "MATCHED",
  "HOLD_AT_FLOOR",
  "COMPETITOR_BELOW_FLOOR_ALERT",
  "REVERT_TO_BASE",
] as const;

export type RepriceDecisionKind = (typeof REPRICE_DECISIONS)[number];

/** Rakip tabanın altındayken satıcıya giden cümle. Fiyat tabanda kalır. */
export const BELOW_FLOOR_ALERT =
  "Rakip tabanının altına indi, tekli üründe zarar etme; 2'li paket önerisini değerlendir";

export const PRICE_CHANNEL_LABELS: Record<PriceChannel, string> = {
  TRENDYOL: "Trendyol",
  HEPSIBURADA: "Hepsiburada",
  OWN_STORE: "Kendi mağazam",
  AKAKCE: "Akakçe",
  CIMRI: "Cimri",
};

export type ChannelFloorInput = {
  costMinor: number;
  vatBps?: number;
  costIncludesVat?: boolean;
  commissionBps: number;
  cargoMinor: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
  /** Hedef minimum net kâr, baz puan. 800 = %8. */
  minMarginBps: number;
  manualFloorMinor?: number | null;
};

export type RepriceDecision = {
  decision: RepriceDecisionKind;
  newPriceMinor: number;
  alert: string | null;
};

export function isPriceChannel(value: unknown): value is PriceChannel {
  return typeof value === "string" && (PRICE_CHANNELS as readonly string[]).includes(value);
}

export function isRepriceStrategy(value: unknown): value is RepriceStrategy {
  return typeof value === "string" && (REPRICE_STRATEGIES as readonly string[]).includes(value);
}

function assertNonNegInt(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} negatif olmayan tam sayı olmalıdır.`);
  }
}

/**
 * Kâr korumalı taban.
 * Kapalı form `minMarginBps` hedefini sağlar; manuel taban varsa ikisinin büyüğü yazılır.
 * Denklem imkânsızsa ve manuel taban yoksa `null` (uydurma fiyat yok).
 */
export function computeChannelFloorPrice(input: ChannelFloorInput): number | null {
  const mathInput: BreakEvenPriceInput = {
    cogsMinor: input.costMinor,
    commissionBps: input.commissionBps,
    cargoMinor: input.cargoMinor,
    returnBps: input.returnRateBps,
    adCostMinor: input.adCostMinorPerOrder,
    vatBps: input.vatBps,
    targetMarginBps: input.minMarginBps,
    costIncludesVat: input.costIncludesVat === true,
  };
  const math = profitablePriceMinor(mathInput);
  const manual =
    input.manualFloorMinor != null && input.manualFloorMinor > 0 ? input.manualFloorMinor : null;
  if (math == null) {
    return manual;
  }
  if (manual == null) {
    return math;
  }
  return Math.max(math, manual);
}

/**
 * Rakip fiyatına göre yeni fiyat.
 * Rakip bazın üstündeyse baz fiyata dönülür.
 * Rakip tabanın altındaysa fiyat tabanda kalır ve uyarı üretilir.
 * Aksi halde strateji uygulanır ve sonuç tabanın altına inemez.
 */
export function evaluateRepriceDecision(input: {
  basePriceMinor: number;
  floorPriceMinor: number;
  competitorPriceMinor: number | null;
  strategy: RepriceStrategy;
  stepMinor: number;
}): RepriceDecision {
  assertNonNegInt(input.basePriceMinor, "Baz fiyat");
  assertNonNegInt(input.floorPriceMinor, "Taban fiyat");
  assertNonNegInt(input.stepMinor, "Adım");
  if (input.basePriceMinor < 1) {
    throw new Error("Baz fiyat en az 1 kuruş olmalıdır.");
  }
  if (input.floorPriceMinor < 1) {
    throw new Error("Taban fiyat en az 1 kuruş olmalıdır.");
  }
  const floor = input.floorPriceMinor;
  const base = input.basePriceMinor;

  if (input.competitorPriceMinor == null) {
    return base < floor
      ? { decision: "HOLD_AT_FLOOR", newPriceMinor: floor, alert: null }
      : { decision: "REVERT_TO_BASE", newPriceMinor: base, alert: null };
  }
  assertNonNegInt(input.competitorPriceMinor, "Rakip fiyat");
  if (input.competitorPriceMinor < 1) {
    throw new Error("Rakip fiyat en az 1 kuruş olmalıdır.");
  }
  const competitor = input.competitorPriceMinor;

  if (competitor > base) {
    return base < floor
      ? { decision: "HOLD_AT_FLOOR", newPriceMinor: floor, alert: null }
      : { decision: "REVERT_TO_BASE", newPriceMinor: base, alert: null };
  }

  if (competitor < floor) {
    return {
      decision: "COMPETITOR_BELOW_FLOOR_ALERT",
      newPriceMinor: floor,
      alert: BELOW_FLOOR_ALERT,
    };
  }

  if (input.strategy === "FIXED") {
    return base < floor
      ? { decision: "HOLD_AT_FLOOR", newPriceMinor: floor, alert: null }
      : { decision: "REVERT_TO_BASE", newPriceMinor: base, alert: null };
  }

  if (input.strategy === "MATCH_LOWEST") {
    return { decision: "MATCHED", newPriceMinor: Math.max(competitor, floor), alert: null };
  }

  const target = competitor - input.stepMinor;
  if (target < floor) {
    return { decision: "HOLD_AT_FLOOR", newPriceMinor: floor, alert: null };
  }
  return { decision: "UNDERCUT", newPriceMinor: target, alert: null };
}

export type IngestQuote = {
  variantId: string;
  sku: string;
  channel: PriceChannel;
  competitorName: string;
  competitorUrl: string;
  competitorPriceMinor: number;
};

function minorFromDecimalText(value: string): number | null {
  const text = value.trim().replace(/\s/g, "").replace("₺", "").replace(/tl/i, "");
  if (!text) {
    return null;
  }
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, frac = ""] = normalized.split(".");
  if (!whole || whole.length > 9) {
    return null;
  }
  const minor = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

function priceMinorOf(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 2_147_483_647) {
    return value;
  }
  if (typeof value === "string") {
    return minorFromDecimalText(value);
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

/**
 * Satıcının veya entegrasyonun gönderdiği fiyat.
 * JSON-LD Offer / Product okunur. URL fetch edilmez.
 */
export function priceMinorFromMerchantNode(node: unknown): number | null {
  const record = asRecord(node);
  if (!record) {
    return null;
  }
  if ("priceMinor" in record) {
    const direct = priceMinorOf(record.priceMinor);
    if (direct) {
      return direct;
    }
  }
  const offer = asRecord(record.offers) ?? record;
  const fromPrice = priceMinorOf(offer.price);
  if (fromPrice) {
    return fromPrice;
  }
  const spec = asRecord(offer.priceSpecification);
  return spec ? priceMinorOf(spec.price) : null;
}

function quoteFromRecord(row: Record<string, unknown>, fallbackChannel: PriceChannel | null): IngestQuote | null {
  const channel = isPriceChannel(row.channel) ? row.channel : fallbackChannel;
  const variantId = typeof row.variantId === "string" ? row.variantId.trim() : "";
  const sku = typeof row.sku === "string" ? row.sku.trim() : "";
  const competitorName = typeof row.competitorName === "string" ? row.competitorName.trim().slice(0, 120) : "";
  const competitorUrl = typeof row.competitorUrl === "string" ? row.competitorUrl.trim().slice(0, 500) : "";
  const competitorPriceMinor = priceMinorOf(row.competitorPriceMinor) ?? priceMinorFromMerchantNode(row);
  if (!channel || !competitorName || competitorPriceMinor == null) {
    return null;
  }
  if (!variantId && !sku) {
    return null;
  }
  if (competitorUrl && !/^https?:\/\//i.test(competitorUrl)) {
    return null;
  }
  return { variantId, sku, channel, competitorName, competitorUrl, competitorPriceMinor };
}

/** Tekil gövde, `quotes` listesi veya JSON-LD düğümü. En fazla 100 fiyat. */
export function readIngestQuotes(body: unknown): { ok: true; quotes: IngestQuote[] } | { ok: false; error: string } {
  const record = asRecord(body);
  if (!record) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const collected: IngestQuote[] = [];
  const fallback = isPriceChannel(record.channel) ? record.channel : null;
  const single = quoteFromRecord(record, fallback);
  if (single) {
    collected.push(single);
  }
  if (Array.isArray(record.quotes)) {
    for (const item of record.quotes) {
      const row = asRecord(item);
      if (!row) {
        return { ok: false, error: "Rakip fiyat satırı geçersiz." };
      }
      const quote = quoteFromRecord(row, fallback);
      if (!quote) {
        return { ok: false, error: "Rakip fiyat satırı eksik." };
      }
      collected.push(quote);
    }
  }
  const feed = asRecord(record.feed);
  if (feed) {
    const feedChannel = isPriceChannel(feed.channel) ? feed.channel : fallback;
    const items = Array.isArray(feed.items) ? feed.items : [];
    for (const item of items) {
      const row = asRecord(item);
      if (!row) {
        return { ok: false, error: "Besleme satırı geçersiz." };
      }
      const quote = quoteFromRecord({ ...row, channel: row.channel ?? feedChannel }, feedChannel);
      if (!quote) {
        return { ok: false, error: "Besleme satırı eksik." };
      }
      collected.push(quote);
    }
  }
  const jsonLd = record.jsonLd;
  if (jsonLd != null) {
    const nodes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    for (const node of nodes) {
      const row = asRecord(node);
      if (!row) {
        continue;
      }
      const price = priceMinorFromMerchantNode(row);
      const sku = typeof row.sku === "string" ? row.sku.trim() : "";
      const variantId = typeof row.variantId === "string" ? row.variantId.trim() : "";
      const name =
        (typeof row.seller === "string" ? row.seller : "") ||
        (typeof asRecord(row.seller)?.name === "string" ? String(asRecord(row.seller)?.name) : "") ||
        "Rakip";
      if ((!sku && !variantId) || price == null || !fallback) {
        return { ok: false, error: "JSON-LD fiyatı kanal, SKU ve tutar ister." };
      }
      collected.push({
        variantId,
        sku,
        channel: fallback,
        competitorName: name.slice(0, 120),
        competitorUrl: typeof row.url === "string" && /^https?:\/\//i.test(row.url) ? row.url.slice(0, 500) : "",
        competitorPriceMinor: price,
      });
    }
  }
  if (collected.length === 0) {
    return { ok: false, error: "Kaydedilecek rakip fiyat yok." };
  }
  if (collected.length > 100) {
    return { ok: false, error: "Tek istekte en fazla 100 rakip fiyat alınır." };
  }
  return { ok: true, quotes: collected };
}
