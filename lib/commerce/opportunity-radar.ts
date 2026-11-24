/**
 * Motor 2 — Çok kaynaklı "Ne satılır?" radarı.
 * OWN_CATALOG, MARKETPLACE_TREND, TETKIK ve GRANT_CALL.
 * Skorlar kayıtlı sinyal, rakip fiyatı ve platform satırından gelir. Yeterli veri yoksa uydurma yapmaz.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import { MISSING, requireOwnedStore } from "@/lib/commerce/economics-service";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import {
  RADAR_MIN_ACTIVE_PRODUCTS,
  RADAR_SOURCES,
  buildRadarBundle,
  categoryPriceAnchors,
  expandRadarFeeds,
  materializeRadarFeed,
  parseRadarFeed,
  reviveRadarFeed,
  poolSeedHref,
  suggestionsFromSignals,
  type GapSignal,
  type GrantObservation,
  type MarketplaceObservation,
  type RadarFeedInput,
  type RadarSource,
  type RadarSuggestion,
  type TetkikObservation,
} from "@/lib/commerce/radar-signals";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { getPrisma } from "@/lib/kernel/db";
import {
  readPlatformGrantCalls,
  readPlatformTetkikHits,
  type PlatformGrantCall,
  type PlatformTetkikHit,
} from "@/lib/kernel/market-demand/platform-demand-port";

export {
  RADAR_MIN_ACTIVE_PRODUCTS,
  PRICE_BAND_STEP_MINOR,
  collectOwnCatalogGaps,
  suggestionsFromSignals,
} from "@/lib/commerce/radar-signals";

type PricedProduct = { category: string; basePriceMinor: number; status: string };

function sourcesFor(signalIds: readonly string[], sourceById: ReadonlyMap<string, RadarSource>): RadarSource[] {
  const found = new Set<RadarSource>();
  for (const id of signalIds) {
    const source = sourceById.get(id);
    if (source) {
      found.add(source);
    }
  }
  return RADAR_SOURCES.filter((source) => found.has(source));
}

function presentSignal(row: {
  id: string;
  category: string;
  priceBandMinor: number;
  demandIndex: number;
  supplyGap: number;
  source: RadarSource;
  computedAt?: Date;
}) {
  return {
    id: row.id,
    category: row.category,
    priceBandMinor: row.priceBandMinor,
    priceBandLabel: formatTryMinor(row.priceBandMinor),
    demandIndex: row.demandIndex,
    supplyGap: row.supplyGap,
    source: row.source,
    ...(row.computedAt ? { computedAt: row.computedAt.toISOString() } : {}),
  };
}

function presentSuggestion(
  row: {
    id: string;
    title: string;
    category: string;
    targetPriceMinor: number;
    rationale: string;
    signalIds: string[];
    status?: string;
  },
  sourceById: ReadonlyMap<string, RadarSource>,
  preset?: RadarSuggestion,
) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    targetPriceMinor: row.targetPriceMinor,
    targetPriceLabel: formatTryMinor(row.targetPriceMinor),
    rationale: row.rationale,
    sources: preset?.sources ?? sourcesFor(row.signalIds, sourceById),
    ...(row.status ? { status: row.status } : {}),
    seedHref:
      preset?.seedHref ??
      poolSeedHref({ title: row.title, category: row.category, targetPriceMinor: row.targetPriceMinor }),
  };
}

function grantsFromPlatform(rows: readonly PlatformGrantCall[]): GrantObservation[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    tags: row.tags,
    supportRatioBps: row.supportRatioBps,
    minSupportMinor: row.minSupportMinor,
    maxSupportMinor: row.maxSupportMinor,
    open: true,
  }));
}

function tetkikFromPlatform(rows: readonly PlatformTetkikHit[]): TetkikObservation[] {
  return rows.map((row) => ({
    id: row.id,
    host: row.host,
    pageTitle: row.pageTitle,
    score: row.score,
    stage: row.stage,
    text: row.text,
  }));
}

function feedsFromRows(rows: readonly { source: string; payloadJson: string }[]): RadarFeedInput[] {
  const feeds: RadarFeedInput[] = [];
  for (const row of rows) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.payloadJson);
    } catch {
      continue;
    }
    const feed = reviveRadarFeed(parsed);
    if (feed && feed.source === row.source) {
      feeds.push(feed);
    }
  }
  return feeds;
}

function observationsFromQuotes(
  rows: readonly {
    competitorPriceMinor: number;
    variant: { amountMinor: number | null; product: { category: string; basePriceMinor: number } };
  }[],
): MarketplaceObservation[] {
  const observations: MarketplaceObservation[] = [];
  for (const row of rows) {
    const category = row.variant.product.category.trim();
    if (!category || row.competitorPriceMinor <= 0) {
      continue;
    }
    const ownPriceMinor =
      row.variant.amountMinor != null && row.variant.amountMinor > 0
        ? row.variant.amountMinor
        : row.variant.product.basePriceMinor;
    observations.push({
      category,
      ownPriceMinor: ownPriceMinor > 0 ? ownPriceMinor : 0,
      competitorPriceMinor: row.competitorPriceMinor,
      quoteCount: 1,
      competitiveRuleCount: 0,
    });
  }
  return observations;
}

function observationsFromRules(
  rows: readonly {
    activePriceMinor: number;
    basePriceMinor: number;
    variant: { product: { category: string } };
  }[],
): MarketplaceObservation[] {
  const observations: MarketplaceObservation[] = [];
  for (const row of rows) {
    const category = row.variant.product.category.trim();
    const price = row.activePriceMinor > 0 ? row.activePriceMinor : row.basePriceMinor;
    if (!category || price <= 0) {
      continue;
    }
    observations.push({
      category,
      ownPriceMinor: row.basePriceMinor > 0 ? row.basePriceMinor : 0,
      competitorPriceMinor: price,
      quoteCount: 0,
      competitiveRuleCount: 1,
    });
  }
  return observations;
}

export async function scanOpportunityRadar(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "radar");
  if (denied) {
    return denied;
  }
  const prisma = getPrisma();
  const products = await prisma.commerceProduct.findMany({
    where: { storeId },
    select: {
      id: true,
      category: true,
      basePriceMinor: true,
      status: true,
      variants: { select: { amountMinor: true, unitEconomics: { select: { costMinor: true } } } },
    },
    take: 200,
  });

  const activeWithCost = products.filter(
    (row) =>
      row.status === "ACTIVE" &&
      row.variants.some((variant) => variant.unitEconomics != null && (variant.amountMinor ?? 0) > 0),
  );
  const priced: PricedProduct[] = activeWithCost.map((row) => ({
    category: row.category,
    basePriceMinor:
      row.basePriceMinor > 0
        ? row.basePriceMinor
        : row.variants.find((variant) => (variant.amountMinor ?? 0) > 0)?.amountMinor ?? 0,
    status: row.status,
  }));

  const [quotes, rules, feedRows, grantRows, tetkikRows] = await Promise.all([
    prisma.commerceCompetitorQuote.findMany({
      where: { storeId },
      orderBy: { observedAt: "desc" },
      take: 200,
      select: {
        competitorPriceMinor: true,
        variant: {
          select: {
            amountMinor: true,
            product: { select: { category: true, basePriceMinor: true } },
          },
        },
      },
    }),
    prisma.commerceChannelPriceRule.findMany({
      where: { storeId, strategy: { not: "FIXED" } },
      take: 200,
      select: {
        activePriceMinor: true,
        basePriceMinor: true,
        variant: { select: { product: { select: { category: true } } } },
      },
    }),
    prisma.commerceDemandFeed.findMany({
      where: { storeId, source: { in: ["MARKETPLACE_TREND", "TETKIK", "GRANT_CALL"] } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { source: true, payloadJson: true },
    }),
    readPlatformGrantCalls(new Date()),
    readPlatformTetkikHits(),
  ]);

  const feeds = feedsFromRows(feedRows);
  const expanded = expandRadarFeeds(feeds);
  const gaps = buildRadarBundle({
    catalog: priced,
    marketplace: [...observationsFromQuotes(quotes), ...observationsFromRules(rules), ...expanded.marketplace],
    tetkik: [...tetkikFromPlatform(tetkikRows), ...expanded.tetkik],
    grants: [...grantsFromPlatform(grantRows), ...expanded.grants],
    extraAnchors: expanded.anchors,
  });
  if (gaps.length === 0) {
    return {
      ok: true,
      data: {
        signals: [],
        suggestions: [],
        honest: true,
        message:
          activeWithCost.length < RADAR_MIN_ACTIVE_PRODUCTS
            ? "Analiz için en az 3 aktif ürün ve maliyet verisi gerekir."
            : "Katalogda boş fiyat bandı bulunamadı. Daha fazla kategori veya fiyat çeşitliliği ekle.",
      },
    };
  }

  await prisma.commerceCatalogGapSignal.deleteMany({ where: { storeId } });
  await prisma.commerceProductSuggestion.updateMany({
    where: { storeId, status: "NEW" },
    data: { status: "DISMISSED" },
  });

  const signalRows = await Promise.all(gaps.map((gap) => createSignal(storeId, gap)));
  const suggestionInputs = suggestionsFromSignals(
    signalRows.map((row, index) => ({
      id: row.id,
      category: row.category,
      priceBandMinor: row.priceBandMinor,
      demandIndex: row.demandIndex,
      supplyGap: row.supplyGap,
      source: row.source,
      evidence: gaps[index]?.evidence ?? {},
    })),
  );
  const suggestionRows = await Promise.all(
    suggestionInputs.map((item) =>
      prisma.commerceProductSuggestion.create({
        data: {
          id: randomUUID(),
          storeId,
          title: item.title.slice(0, 200),
          category: item.category.slice(0, 80),
          targetPriceMinor: item.targetPriceMinor,
          rationale: item.rationale.slice(0, 500),
          signalIds: item.signalIds,
          status: "NEW",
        },
      }),
    ),
  );
  const sourceById = new Map(signalRows.map((row) => [row.id, row.source as RadarSource]));

  return {
    ok: true,
    data: {
      signals: signalRows.map((row) => presentSignal(row)),
      suggestions: suggestionRows.map((row, index) =>
        presentSuggestion(row, sourceById, suggestionInputs[index]),
      ),
      message: `${suggestionRows.length} fırsat önerisi üretildi.`,
    },
  };
}

async function createSignal(storeId: string, gap: GapSignal) {
  return getPrisma().commerceCatalogGapSignal.create({
    data: {
      id: randomUUID(),
      storeId,
      category: gap.category.slice(0, 80),
      priceBandMinor: gap.priceBandMinor,
      demandIndex: gap.demandIndex,
      supplyGap: gap.supplyGap,
      source: gap.source,
      evidenceJson: JSON.stringify(gap.evidence),
    },
  });
}

export async function ingestRadarFeed(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const parsed = parseRadarFeed(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const prisma = getPrisma();
  const rows = await prisma.commerceProduct.findMany({
    where: { storeId, status: "ACTIVE" },
    select: {
      category: true,
      basePriceMinor: true,
      status: true,
      variants: { select: { amountMinor: true } },
    },
    take: 200,
  });
  const products = rows.map((row) => ({
    category: row.category,
    status: row.status,
    basePriceMinor:
      row.basePriceMinor > 0
        ? row.basePriceMinor
        : row.variants.find((variant) => (variant.amountMinor ?? 0) > 0)?.amountMinor ?? 0,
  }));
  const gaps = materializeRadarFeed(parsed.value, products);
  if (gaps.length === 0) {
    const anchor = categoryPriceAnchors(products).some((row) => row.category === parsed.value.category);
    const priced = parsed.value.priceBandMinor != null && parsed.value.priceBandMinor > 0;
    if (parsed.value.source !== "MARKETPLACE_TREND" && !anchor && !priced) {
      return commerceFail(422, "Bu kategori için kayıtlı fiyat bandı yok.");
    }
    return commerceFail(422, "Kayıtlı kanıt sinyal üretmedi. Talep endeksi uydurulmaz.");
  }
  const gap = gaps[0]!;
  const feed = await prisma.commerceDemandFeed.create({
    data: {
      id: randomUUID(),
      storeId,
      source: parsed.value.source,
      category: parsed.value.category.slice(0, 80),
      payloadJson: JSON.stringify(parsed.value),
    },
  });
  const signal = await createSignal(storeId, gap);
  return {
    ok: true,
    data: {
      id: signal.id,
      feedId: feed.id,
      source: signal.source,
      category: signal.category,
      priceBandMinor: signal.priceBandMinor,
      priceBandLabel: formatTryMinor(signal.priceBandMinor),
      demandIndex: signal.demandIndex,
      supplyGap: signal.supplyGap,
      message: "Talep sinyali radara yazıldı.",
    },
  };
}

export async function listOpportunityRadar(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const suggestions = await prisma.commerceProductSuggestion.findMany({
    where: { storeId, status: { in: ["NEW", "SEEN"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const linkedIds = [...new Set(suggestions.flatMap((row) => row.signalIds))].slice(0, 80);
  const recent = await prisma.commerceCatalogGapSignal.findMany({
    where: { storeId },
    orderBy: { computedAt: "desc" },
    take: 80,
  });
  const seen = new Set(recent.map((row) => row.id));
  const missing = linkedIds.filter((id) => !seen.has(id));
  const extra =
    missing.length === 0
      ? []
      : await prisma.commerceCatalogGapSignal.findMany({
          where: { storeId, id: { in: missing } },
        });
  const signals = [...recent, ...extra];
  if (signals.length === 0 && suggestions.length === 0) {
    return {
      ok: true,
      data: {
        signals: [],
        suggestions: [],
        honest: true,
        message: "Analiz için en az 3 aktif ürün ve maliyet verisi gerekir.",
      },
    };
  }
  const sourceById = new Map(signals.map((row) => [row.id, row.source as RadarSource]));
  return {
    ok: true,
    data: {
      signals: signals.map((row) => presentSignal(row)),
      suggestions: suggestions.map((row) => presentSuggestion(row, sourceById)),
    },
  };
}
