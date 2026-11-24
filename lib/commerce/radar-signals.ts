/**
 * Fırsat radarı — saf sinyal toplama (DB yok).
 * Talep endeksi, arama hacmi ve fiyat yalnız kayıtlı kanıttan hesaplanır.
 * Kanıt yoksa boş dizi; uydurma yok.
 */

import { formatTryMinor } from "@/lib/commerce/storefront";
import { COMMERCE_INT_MAX } from "@/lib/commerce/types";

export const RADAR_MIN_ACTIVE_PRODUCTS = 3;

/** Fiyat bandı genişliği: 5.000 kuruş = 50 TL. */
export const PRICE_BAND_STEP_MINOR = 5_000;

export const RADAR_SOURCES = ["OWN_CATALOG", "MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"] as const;

export type RadarSource = (typeof RADAR_SOURCES)[number];

export const RADAR_SOURCE_BADGE: Record<RadarSource, string> = {
  OWN_CATALOG: "Katalog Boşluğu",
  MARKETPLACE_TREND: "Pazaryeri Trendi",
  TETKIK: "Tetkik Talebi",
  GRANT_CALL: "Hibe Uyumu",
};

export type GapSignal = {
  category: string;
  priceBandMinor: number;
  demandIndex: number;
  supplyGap: number;
  source: RadarSource;
  evidence: Record<string, unknown>;
};

export type MarketplaceObservation = {
  category: string;
  ownPriceMinor: number;
  competitorPriceMinor: number;
  /** Bu gözlemdeki kayıtlı rakip fiyat adedi. */
  quoteCount: number;
  /** FIXED olmayan rekabet kuralı adedi. */
  competitiveRuleCount: number;
};

export type TetkikObservation = {
  id: string;
  host: string;
  pageTitle: string;
  /** Kayıtlı tetkik skoru, 0–100. */
  score: number;
  stage: "shop" | "ads" | "ready" | "unknown";
  text: string;
};

export type GrantObservation = {
  id: string;
  title: string;
  summary: string;
  tags: readonly string[];
  supportRatioBps: number;
  minSupportMinor: number;
  maxSupportMinor: number;
  open: boolean;
};

export type RadarFeedSource = Exclude<RadarSource, "OWN_CATALOG">;

export type RadarFeedInput = {
  source: RadarFeedSource;
  category: string;
  priceBandMinor: number | null;
  marketplace: {
    competitorPriceMinor: number;
    ownPriceMinor: number;
    quoteCount: number;
    competitiveRuleCount: number;
  } | null;
  tetkik: { score: number; pageTitle: string; host: string } | null;
  grant: {
    title: string;
    summary: string;
    tags: string[];
    supportRatioBps: number;
    minSupportMinor: number;
    maxSupportMinor: number;
  } | null;
};

function bandOf(priceMinor: number): number {
  return Math.floor(priceMinor / PRICE_BAND_STEP_MINOR) * PRICE_BAND_STEP_MINOR;
}

function clampIndex(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor((sorted.length - 1) / 2)] ?? 0;
}

function foldToken(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textHasToken(haystack: string, token: string): boolean {
  if (!token) {
    return false;
  }
  return ` ${foldToken(haystack)} `.includes(` ${token} `);
}

/**
 * Kendi katalog dağılımından boşluk sinyali.
 * Yoğun kategorilerde seyrek fiyat bandı = fırsat (supplyGap pozitif).
 */
export function collectOwnCatalogGaps(
  products: readonly { category: string; basePriceMinor: number; status: string }[],
): GapSignal[] {
  const active = products.filter(
    (row) => row.status === "ACTIVE" && row.basePriceMinor > 0 && row.category.trim().length > 0,
  );
  if (active.length < RADAR_MIN_ACTIVE_PRODUCTS) {
    return [];
  }

  const byCategory = new Map<string, number[]>();
  for (const row of active) {
    const list = byCategory.get(row.category) ?? [];
    list.push(row.basePriceMinor);
    byCategory.set(row.category, list);
  }

  const signals: GapSignal[] = [];
  for (const [category, prices] of byCategory) {
    if (prices.length < 2) {
      continue;
    }
    const bands = new Map<number, number>();
    let min = prices[0]!;
    let max = prices[0]!;
    for (const price of prices) {
      min = Math.min(min, price);
      max = Math.max(max, price);
      const band = bandOf(price);
      bands.set(band, (bands.get(band) ?? 0) + 1);
    }
    const span = Math.max(PRICE_BAND_STEP_MINOR, max - min);
    const expectedBands = Math.max(2, Math.floor(span / PRICE_BAND_STEP_MINOR) + 1);
    for (let band = bandOf(min); band <= bandOf(max); band += PRICE_BAND_STEP_MINOR) {
      const count = bands.get(band) ?? 0;
      if (count > 0) {
        continue;
      }
      const demandIndex = Math.min(100, Math.round((prices.length / active.length) * 100));
      const supplyGap = Math.min(100, Math.round((1 / expectedBands) * 100) + 20);
      signals.push({
        category,
        priceBandMinor: band,
        demandIndex,
        supplyGap,
        source: "OWN_CATALOG",
        evidence: {
          categoryProductCount: prices.length,
          emptyBand: band,
          categoryMinMinor: min,
          categoryMaxMinor: max,
        },
      });
    }
  }
  return signals.sort((a, b) => b.supplyGap - a.supplyGap || b.demandIndex - a.demandIndex);
}

/**
 * Rakip fiyat gözlemi ve FIXED olmayan rekabet kuralı.
 * Talep yoğunluğu, kategorideki kayıtlı gözlem payıdır.
 * Arz açığı, katalogda boş bant ya da rakibin kayıtlı olarak daha ucuz olmasıdır.
 */
export function collectMarketplaceTrendSignals(
  observations: readonly MarketplaceObservation[],
  catalog: readonly { category: string; priceMinor: number }[],
): GapSignal[] {
  type Bucket = {
    quoteCount: number;
    ruleCount: number;
    competitorPrices: number[];
    ownPrices: number[];
  };
  const byCategory = new Map<string, Map<number, Bucket>>();
  const categoryQuoteTotal = new Map<string, number>();
  const categoryRuleTotal = new Map<string, number>();

  for (const row of observations) {
    const category = row.category.trim();
    const quotes = Math.max(0, Math.trunc(row.quoteCount));
    const rules = Math.max(0, Math.trunc(row.competitiveRuleCount));
    if (!category || row.competitorPriceMinor <= 0 || (quotes === 0 && rules === 0)) {
      continue;
    }
    const band = bandOf(row.competitorPriceMinor);
    let bands = byCategory.get(category);
    if (!bands) {
      bands = new Map();
      byCategory.set(category, bands);
    }
    const bucket = bands.get(band) ?? { quoteCount: 0, ruleCount: 0, competitorPrices: [], ownPrices: [] };
    bucket.quoteCount += quotes;
    bucket.ruleCount += rules;
    bucket.competitorPrices.push(row.competitorPriceMinor);
    if (row.ownPriceMinor > 0) {
      bucket.ownPrices.push(row.ownPriceMinor);
    }
    bands.set(band, bucket);
    categoryQuoteTotal.set(category, (categoryQuoteTotal.get(category) ?? 0) + quotes);
    categoryRuleTotal.set(category, (categoryRuleTotal.get(category) ?? 0) + rules);
  }

  const occupied = new Map<string, Set<number>>();
  const catalogPrices = new Map<string, number[]>();
  for (const row of catalog) {
    const category = row.category.trim();
    if (!category || row.priceMinor <= 0) {
      continue;
    }
    const set = occupied.get(category) ?? new Set<number>();
    set.add(bandOf(row.priceMinor));
    occupied.set(category, set);
    const list = catalogPrices.get(category) ?? [];
    list.push(row.priceMinor);
    catalogPrices.set(category, list);
  }

  const signals: GapSignal[] = [];
  for (const [category, bands] of byCategory) {
    const totalQuotes = categoryQuoteTotal.get(category) ?? 0;
    const totalRules = categoryRuleTotal.get(category) ?? 0;
    const ownMedian = median(catalogPrices.get(category) ?? []);
    const filled = occupied.get(category) ?? new Set<number>();
    for (const [band, bucket] of bands) {
      const parts: number[] = [];
      if (totalQuotes > 0 && bucket.quoteCount > 0) {
        parts.push((bucket.quoteCount / totalQuotes) * 100);
      }
      if (totalRules > 0 && bucket.ruleCount > 0) {
        parts.push((bucket.ruleCount / totalRules) * 100);
      }
      if (parts.length === 0) {
        continue;
      }
      const demandIndex = clampIndex(parts.reduce((sum, part) => sum + part, 0) / parts.length);
      if (demandIndex <= 0) {
        continue;
      }
      const compMedian = median(bucket.competitorPrices);
      const baseline = ownMedian > 0 ? ownMedian : median(bucket.ownPrices);
      const movement =
        baseline > 0 && compMedian > 0 && compMedian < baseline
          ? clampIndex(((baseline - compMedian) / baseline) * 100)
          : 0;
      const empty = filled.has(band) ? 0 : 100;
      const supplyGap = clampIndex(Math.max(empty, movement));
      if (supplyGap <= 0) {
        continue;
      }
      signals.push({
        category,
        priceBandMinor: band,
        demandIndex,
        supplyGap,
        source: "MARKETPLACE_TREND",
        evidence: {
          quoteCount: bucket.quoteCount,
          competitiveRuleCount: bucket.ruleCount,
          competitorMedianMinor: compMedian,
          ownMedianMinor: baseline,
          bandOccupied: filled.has(band),
        },
      });
    }
  }
  return signals.sort((a, b) => b.supplyGap - a.supplyGap || b.demandIndex - a.demandIndex);
}

/** Mağazanın kayıtlı kategori fiyatı. Hibe tutarı ürün fiyatı yerine geçmez. */
export function categoryPriceAnchors(
  products: readonly { category: string; basePriceMinor: number; status: string }[],
): { category: string; priceBandMinor: number }[] {
  const byCategory = new Map<string, number[]>();
  for (const row of products) {
    const category = row.category.trim();
    if (row.status !== "ACTIVE" || row.basePriceMinor <= 0 || !category) {
      continue;
    }
    const list = byCategory.get(category) ?? [];
    list.push(row.basePriceMinor);
    byCategory.set(category, list);
  }
  const anchors: { category: string; priceBandMinor: number }[] = [];
  for (const [category, prices] of byCategory) {
    anchors.push({ category, priceBandMinor: bandOf(median(prices)) });
  }
  return anchors;
}

/**
 * Vitrin (`shop`) tetkikleri, mağaza kategorisiyle kelime eşleşirse sinyal olur.
 * Talep payı, eşleşen raporun kayıtlı vitrin tetkikleri içindeki payıdır.
 * Arz açığı, 100 − ortalama kayıtlı tetkik skorudur.
 */
export function collectTetkikSignals(
  records: readonly TetkikObservation[],
  anchors: readonly { category: string; priceBandMinor: number }[],
): GapSignal[] {
  const shop = records.filter(
    (row) => row.stage === "shop" && Number.isInteger(row.score) && row.score >= 0 && row.score <= 100,
  );
  if (shop.length === 0 || anchors.length === 0) {
    return [];
  }
  const signals: GapSignal[] = [];
  for (const anchor of anchors) {
    const token = foldToken(anchor.category);
    if (token.length < 3 || anchor.priceBandMinor < 0) {
      continue;
    }
    const matched = shop.filter((row) => textHasToken(`${row.host} ${row.pageTitle} ${row.text}`, token));
    if (matched.length === 0) {
      continue;
    }
    const demandIndex = Math.max(1, clampIndex((matched.length / shop.length) * 100));
    const average = matched.reduce((sum, row) => sum + row.score, 0) / matched.length;
    const supplyGap = clampIndex(100 - average);
    if (supplyGap <= 0) {
      continue;
    }
    signals.push({
      category: anchor.category,
      priceBandMinor: bandOf(anchor.priceBandMinor),
      demandIndex,
      supplyGap,
      source: "TETKIK",
      evidence: {
        matchedCount: matched.length,
        shopReportCount: shop.length,
        averageScore: Math.round(average),
        hosts: matched.map((row) => row.host).filter((host) => host.length > 0).slice(0, 5),
      },
    });
  }
  return signals.sort((a, b) => b.supplyGap - a.supplyGap || b.demandIndex - a.demandIndex);
}

/**
 * Açık hibe çağrısı, etiket ya da başlık mağaza kategorisiyle eşleşirse sinyal olur.
 * Talep endeksi kayıtlı destek oranıdır (baz puan / 100). Çağrı tutarı satış fiyatı değildir.
 */
export function collectGrantCallSignals(
  records: readonly GrantObservation[],
  anchors: readonly { category: string; priceBandMinor: number }[],
): GapSignal[] {
  const open = records.filter(
    (row) => row.open && Number.isInteger(row.supportRatioBps) && row.supportRatioBps > 0 && row.supportRatioBps <= 10_000,
  );
  if (open.length === 0 || anchors.length === 0) {
    return [];
  }
  const signals: GapSignal[] = [];
  for (const anchor of anchors) {
    const token = foldToken(anchor.category);
    if (token.length < 3 || anchor.priceBandMinor < 0) {
      continue;
    }
    const matched = open.filter(
      (row) =>
        row.tags.some((tag) => foldToken(tag) === token) || textHasToken(`${row.title} ${row.summary}`, token),
    );
    if (matched.length === 0) {
      continue;
    }
    const best = matched.reduce((left, right) => (left.supportRatioBps >= right.supportRatioBps ? left : right));
    const demandIndex = clampIndex(best.supportRatioBps / 100);
    if (demandIndex <= 0) {
      continue;
    }
    signals.push({
      category: anchor.category,
      priceBandMinor: bandOf(anchor.priceBandMinor),
      demandIndex,
      supplyGap: demandIndex,
      source: "GRANT_CALL",
      evidence: {
        callId: best.id,
        title: best.title.slice(0, 180),
        supportRatioBps: best.supportRatioBps,
        minSupportMinor: best.minSupportMinor,
        maxSupportMinor: best.maxSupportMinor,
        tagMatch: best.tags.some((tag) => foldToken(tag) === token),
      },
    });
  }
  return signals.sort((a, b) => b.supplyGap - a.supplyGap || b.demandIndex - a.demandIndex);
}

export function buildRadarBundle(input: {
  catalog: readonly { category: string; basePriceMinor: number; status: string }[];
  marketplace: readonly MarketplaceObservation[];
  tetkik: readonly TetkikObservation[];
  grants: readonly GrantObservation[];
  extraAnchors?: readonly { category: string; priceBandMinor: number }[];
}): GapSignal[] {
  const anchors = new Map<string, number>();
  for (const anchor of input.extraAnchors ?? []) {
    if (anchor.category.trim() && anchor.priceBandMinor >= 0) {
      anchors.set(anchor.category, bandOf(anchor.priceBandMinor));
    }
  }
  for (const anchor of categoryPriceAnchors(input.catalog)) {
    anchors.set(anchor.category, anchor.priceBandMinor);
  }
  const anchorList = [...anchors.entries()].map(([category, priceBandMinor]) => ({ category, priceBandMinor }));
  const catalogPrices = input.catalog
    .filter((row) => row.status === "ACTIVE" && row.basePriceMinor > 0 && row.category.trim().length > 0)
    .map((row) => ({ category: row.category, priceMinor: row.basePriceMinor }));
  const groups = [
    collectOwnCatalogGaps(input.catalog).slice(0, 5),
    collectMarketplaceTrendSignals(input.marketplace, catalogPrices).slice(0, 5),
    collectTetkikSignals(input.tetkik, anchorList).slice(0, 5),
    collectGrantCallSignals(input.grants, anchorList).slice(0, 5),
  ];
  return groups.flat().slice(0, 20);
}

function readInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

function readCategory(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const category = value.trim();
  if (category.length < 2 || category.length > 80) {
    return null;
  }
  return category;
}

function readText(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : text.slice(0, max);
}

/**
 * Besleme gövdesi. `demandIndex` ve `supplyGap` okunmaz; skor sunucuda hesaplanır.
 */
export function parseRadarFeed(body: unknown): { ok: true; value: RadarFeedInput } | { ok: false; error: string } {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const raw = body as Record<string, unknown>;
  if (raw.source !== "MARKETPLACE_TREND" && raw.source !== "TETKIK" && raw.source !== "GRANT_CALL") {
    return { ok: false, error: "Kaynak MARKETPLACE_TREND, TETKIK veya GRANT_CALL olmalı." };
  }
  const category = readCategory(raw.category);
  if (!category) {
    return { ok: false, error: "Kategori gerekli." };
  }
  const priceBandMinor =
    raw.priceBandMinor == null ? null : readInt(raw.priceBandMinor, 0, COMMERCE_INT_MAX);
  if (raw.priceBandMinor != null && priceBandMinor == null) {
    return { ok: false, error: "Fiyat bandı geçersiz." };
  }
  const feed: RadarFeedInput = {
    source: raw.source,
    category,
    priceBandMinor,
    marketplace: null,
    tetkik: null,
    grant: null,
  };
  if (raw.source === "MARKETPLACE_TREND") {
    const competitorPriceMinor = readInt(raw.competitorPriceMinor, 1, COMMERCE_INT_MAX);
    if (competitorPriceMinor == null) {
      return { ok: false, error: "Rakip fiyatı gerekli." };
    }
    const ownPriceMinor = raw.ownPriceMinor == null ? 0 : readInt(raw.ownPriceMinor, 0, COMMERCE_INT_MAX);
    if (ownPriceMinor == null) {
      return { ok: false, error: "Kendi fiyatın geçersiz." };
    }
    const quoteCount = raw.quoteCount == null ? 1 : readInt(raw.quoteCount, 0, 1_000);
    const competitiveRuleCount =
      raw.competitiveRuleCount == null ? 0 : readInt(raw.competitiveRuleCount, 0, 1_000);
    if (quoteCount == null || competitiveRuleCount == null || (quoteCount === 0 && competitiveRuleCount === 0)) {
      return { ok: false, error: "Kayıtlı rakip fiyatı veya rekabet kuralı gerekli." };
    }
    feed.marketplace = { competitorPriceMinor, ownPriceMinor, quoteCount, competitiveRuleCount };
  }
  if (raw.source === "TETKIK") {
    const score = readInt(raw.tetkikScore, 0, 100);
    if (score == null) {
      return { ok: false, error: "Tetkik skoru gerekli." };
    }
    feed.tetkik = {
      score,
      pageTitle: readText(raw.pageTitle, 180) || category,
      host: readText(raw.host, 253),
    };
  }
  if (raw.source === "GRANT_CALL") {
    const supportRatioBps = readInt(raw.supportRatioBps, 1, 10_000);
    if (supportRatioBps == null) {
      return { ok: false, error: "Destek oranı kayıtlı değil." };
    }
    const title = readText(raw.title, 180) || category;
    const summary = readText(raw.summary, 500);
    const tags: string[] = [];
    if (raw.tags != null) {
      if (!Array.isArray(raw.tags)) {
        return { ok: false, error: "Etiket listesi geçersiz." };
      }
      for (const tag of raw.tags) {
        const text = readText(tag, 40);
        if (text) {
          tags.push(text);
        }
      }
    }
    if (!tags.some((tag) => foldToken(tag) === foldToken(category)) && !textHasToken(`${title} ${summary}`, foldToken(category))) {
      tags.push(category);
    }
    const minSupportMinor = raw.minSupportMinor == null ? 0 : readInt(raw.minSupportMinor, 0, COMMERCE_INT_MAX);
    const maxSupportMinor = raw.maxSupportMinor == null ? 0 : readInt(raw.maxSupportMinor, 0, COMMERCE_INT_MAX);
    if (minSupportMinor == null || maxSupportMinor == null) {
      return { ok: false, error: "Destek tutarı geçersiz." };
    }
    feed.grant = { title, summary, tags: tags.slice(0, 12), supportRatioBps, minSupportMinor, maxSupportMinor };
  }
  return { ok: true, value: feed };
}

/** Taramada saklanan kanıt. Talep endeksi alanı yok sayılır; skor yeniden hesaplanır. */
export function reviveRadarFeed(value: unknown): RadarFeedInput | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const category = readCategory(raw.category);
  const priceBandMinor = raw.priceBandMinor == null ? null : readInt(raw.priceBandMinor, 0, COMMERCE_INT_MAX);
  if (!category || (raw.priceBandMinor != null && priceBandMinor == null)) {
    return null;
  }
  if (raw.source === "MARKETPLACE_TREND") {
    if (raw.marketplace == null || typeof raw.marketplace !== "object" || Array.isArray(raw.marketplace)) {
      return null;
    }
    const row = raw.marketplace as Record<string, unknown>;
    const competitorPriceMinor = readInt(row.competitorPriceMinor, 1, COMMERCE_INT_MAX);
    const ownPriceMinor = readInt(row.ownPriceMinor, 0, COMMERCE_INT_MAX);
    const quoteCount = readInt(row.quoteCount, 0, 1_000);
    const competitiveRuleCount = readInt(row.competitiveRuleCount, 0, 1_000);
    if (
      competitorPriceMinor == null ||
      ownPriceMinor == null ||
      quoteCount == null ||
      competitiveRuleCount == null ||
      (quoteCount === 0 && competitiveRuleCount === 0)
    ) {
      return null;
    }
    return {
      source: "MARKETPLACE_TREND",
      category,
      priceBandMinor,
      marketplace: { competitorPriceMinor, ownPriceMinor, quoteCount, competitiveRuleCount },
      tetkik: null,
      grant: null,
    };
  }
  if (raw.source === "TETKIK") {
    if (raw.tetkik == null || typeof raw.tetkik !== "object" || Array.isArray(raw.tetkik)) {
      return null;
    }
    const row = raw.tetkik as Record<string, unknown>;
    const score = readInt(row.score, 0, 100);
    if (score == null) {
      return null;
    }
    return {
      source: "TETKIK",
      category,
      priceBandMinor,
      marketplace: null,
      tetkik: {
        score,
        pageTitle: readText(row.pageTitle, 180) || category,
        host: readText(row.host, 253),
      },
      grant: null,
    };
  }
  if (raw.source === "GRANT_CALL") {
    if (raw.grant == null || typeof raw.grant !== "object" || Array.isArray(raw.grant)) {
      return null;
    }
    const row = raw.grant as Record<string, unknown>;
    const supportRatioBps = readInt(row.supportRatioBps, 1, 10_000);
    const minSupportMinor = readInt(row.minSupportMinor, 0, COMMERCE_INT_MAX);
    const maxSupportMinor = readInt(row.maxSupportMinor, 0, COMMERCE_INT_MAX);
    if (supportRatioBps == null || minSupportMinor == null || maxSupportMinor == null) {
      return null;
    }
    const tags = Array.isArray(row.tags)
      ? row.tags.map((tag) => readText(tag, 40)).filter((tag) => tag.length > 0).slice(0, 12)
      : [];
    return {
      source: "GRANT_CALL",
      category,
      priceBandMinor,
      marketplace: null,
      tetkik: null,
      grant: {
        title: readText(row.title, 180) || category,
        summary: readText(row.summary, 500),
        tags: tags.length > 0 ? tags : [category],
        supportRatioBps,
        minSupportMinor,
        maxSupportMinor,
      },
    };
  }
  return null;
}

export function expandRadarFeeds(feeds: readonly RadarFeedInput[]): {
  marketplace: MarketplaceObservation[];
  tetkik: TetkikObservation[];
  grants: GrantObservation[];
  anchors: { category: string; priceBandMinor: number }[];
} {
  const marketplace: MarketplaceObservation[] = [];
  const tetkik: TetkikObservation[] = [];
  const grants: GrantObservation[] = [];
  const anchors: { category: string; priceBandMinor: number }[] = [];
  feeds.forEach((feed, index) => {
    if (feed.priceBandMinor != null && feed.priceBandMinor > 0) {
      anchors.push({ category: feed.category, priceBandMinor: feed.priceBandMinor });
    }
    if (feed.source === "MARKETPLACE_TREND" && feed.marketplace) {
      marketplace.push({
        category: feed.category,
        ownPriceMinor: feed.marketplace.ownPriceMinor,
        competitorPriceMinor: feed.marketplace.competitorPriceMinor,
        quoteCount: feed.marketplace.quoteCount,
        competitiveRuleCount: feed.marketplace.competitiveRuleCount,
      });
    }
    if (feed.source === "TETKIK" && feed.tetkik) {
      tetkik.push({
        id: `feed-tetkik-${index}`,
        host: feed.tetkik.host,
        pageTitle: feed.tetkik.pageTitle,
        score: feed.tetkik.score,
        stage: "shop",
        text: `${feed.category} ${feed.tetkik.pageTitle}`,
      });
    }
    if (feed.source === "GRANT_CALL" && feed.grant) {
      grants.push({
        id: `feed-grant-${index}`,
        title: feed.grant.title,
        summary: feed.grant.summary,
        tags: feed.grant.tags,
        supportRatioBps: feed.grant.supportRatioBps,
        minSupportMinor: feed.grant.minSupportMinor,
        maxSupportMinor: feed.grant.maxSupportMinor,
        open: true,
      });
    }
  });
  return { marketplace, tetkik, grants, anchors };
}

export function materializeRadarFeed(
  feed: RadarFeedInput,
  catalog: readonly { category: string; basePriceMinor: number; status: string }[],
): GapSignal[] {
  const expanded = expandRadarFeeds([feed]);
  return buildRadarBundle({
    catalog,
    marketplace: expanded.marketplace,
    tetkik: expanded.tetkik,
    grants: expanded.grants,
    extraAnchors: expanded.anchors,
  }).filter((row) => row.source === feed.source && row.category === feed.category);
}

export type RadarSuggestion = {
  title: string;
  category: string;
  targetPriceMinor: number;
  /** TL metni — kullanıcıya basılan fiyat. Ham kuruş yok. */
  targetPriceLabel: string;
  rationale: string;
  signalIds: string[];
  sources: RadarSource[];
  /** Kokpit Ürün & Stok Havuzu'na ön-doldurmalı bağlantı. */
  seedHref: string;
};

/**
 * Radar önerisi → kokpit havuzu bağlantısı (P1.5, §M2-3).
 *
 * Eski bağlantı `/tezgah?tool=ecommerce&seed=<json>` idi; `/tezgah` bu parametreyi
 * görünce 307 ile `/panel/e-ticaret?sekme=havuz`'a atıyor ve `seed` hiç okunmuyordu.
 * Yeni bağlantı doğrudan hedef sayfaya gider ve havuz formunun okuduğu adlandırılmış
 * alanları taşır: `taslakBaslik`, `taslakKategori`, `hedefFiyat`.
 */
export function poolSeedHref(input: {
  title: string;
  category: string;
  targetPriceMinor: number;
}): string {
  const params = new URLSearchParams({
    sekme: "havuz",
    taslakBaslik: input.title.slice(0, 200),
    taslakKategori: input.category.slice(0, 80),
    hedefFiyat: String(Math.max(0, Math.trunc(input.targetPriceMinor))),
  });
  return `/panel/e-ticaret?${params.toString()}`;
}

function sourceLine(signal: GapSignal): string {
  const band = formatTryMinor(signal.priceBandMinor);
  if (signal.source === "MARKETPLACE_TREND") {
    const quotes = typeof signal.evidence.quoteCount === "number" ? signal.evidence.quoteCount : 0;
    const rules = typeof signal.evidence.competitiveRuleCount === "number" ? signal.evidence.competitiveRuleCount : 0;
    const parts = [
      quotes > 0 ? `${quotes} kayıtlı rakip fiyatı` : null,
      rules > 0 ? `${rules} rekabet kuralı` : null,
    ].filter((part): part is string => part != null);
    return `Pazaryeri Trendi: ${signal.category} kategorisinde ${parts.join(" ve ")} ${band} bandında.`;
  }
  if (signal.source === "TETKIK") {
    const count = typeof signal.evidence.matchedCount === "number" ? signal.evidence.matchedCount : 0;
    const score = typeof signal.evidence.averageScore === "number" ? signal.evidence.averageScore : null;
    const scoreText = score == null ? "" : ` Ortalama tetkik skoru ${score}.`;
    return `Web Tetkik Talebi: ${signal.category} kategorisi ${count} kayıtlı vitrin tetkikiyle eşleşti.${scoreText}`;
  }
  if (signal.source === "GRANT_CALL") {
    const title =
      typeof signal.evidence.title === "string" && signal.evidence.title.trim().length > 0
        ? signal.evidence.title.trim()
        : signal.category;
    return `Hibe Çağrı Uyumu: ${title}. Destek oranı %${signal.demandIndex}.`;
  }
  return `Katalog Boşluğu: ${signal.category} kategorisinde ${band} bandı boş (arz açığı ${signal.supplyGap}).`;
}

function suggestionFromSignal(signal: GapSignal & { id: string }): RadarSuggestion {
  const mid = signal.priceBandMinor + Math.floor(PRICE_BAND_STEP_MINOR / 2);
  const title = `${signal.category} — ${formatTryMinor(mid)} bandı`;
  return {
    title,
    category: signal.category,
    targetPriceMinor: mid,
    targetPriceLabel: formatTryMinor(mid),
    rationale: sourceLine(signal).slice(0, 500),
    signalIds: [signal.id],
    sources: [signal.source],
    seedHref: poolSeedHref({ title, category: signal.category, targetPriceMinor: mid }),
  };
}

function mergeSuggestionCards(items: readonly RadarSuggestion[]): RadarSuggestion[] {
  const out: RadarSuggestion[] = [];
  for (const item of items) {
    const existing = out.find((row) => row.category === item.category);
    const incoming = new Set(item.sources);
    if (!existing || incoming.size === 0) {
      out.push({ ...item, sources: [...item.sources], signalIds: [...item.signalIds] });
      continue;
    }
    const combined = new Set([...existing.sources, ...item.sources]);
    if (combined.size === existing.sources.length) {
      out.push({ ...item, sources: [...item.sources], signalIds: [...item.signalIds] });
      continue;
    }
    existing.sources = RADAR_SOURCES.filter((source) => combined.has(source));
    existing.signalIds = [...existing.signalIds, ...item.signalIds];
    existing.rationale = `${existing.rationale} ${item.rationale}`.slice(0, 500);
  }
  return out;
}

export function suggestionsFromSignals(
  signals: readonly (GapSignal & { id: string })[],
): RadarSuggestion[] {
  const picked: (GapSignal & { id: string })[] = [];
  const used = new Set<string>();
  for (const source of RADAR_SOURCES) {
    const hit = signals.find((row) => row.source === source);
    if (!hit || used.has(hit.id)) {
      continue;
    }
    picked.push(hit);
    used.add(hit.id);
  }
  for (const signal of signals) {
    if (picked.length >= 5) {
      break;
    }
    if (used.has(signal.id)) {
      continue;
    }
    picked.push(signal);
    used.add(signal.id);
  }
  return mergeSuggestionCards(picked.map((signal) => suggestionFromSignal(signal))).slice(0, 5);
}
