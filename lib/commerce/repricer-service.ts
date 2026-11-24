/**
 * Kanal fiyat kuralı, rakip beslemesi ve kâr korumalı uygulama.
 * Rakip fiyatı satıcı veya entegrasyon gönderir; dış site okunmaz.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import { defaultsForChannel, type EconomicsChannel } from "@/lib/commerce/economics-defaults";
import {
  intField,
  loadShippingTariffs,
  loadUnitEconomics,
  MISSING,
  requireOwnedStore,
  resolveChannelEconomics,
} from "@/lib/commerce/economics-service";
import { cargoForWeight, type ShippingBand } from "@/lib/commerce/profit";
import {
  computeChannelFloorPrice,
  evaluateRepriceDecision,
  isPriceChannel,
  isRepriceStrategy,
  readIngestQuotes,
  type IngestQuote,
  type PriceChannel,
  type RepriceDecision,
  type RepriceStrategy,
} from "@/lib/commerce/repricer";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { getPrisma } from "@/lib/kernel/db";

type PushJob = {
  channel: "TRENDYOL" | "HEPSIBURADA";
  variantId: string;
  onHandQty: number;
  priceMinor: number;
};

function economicsChannelOf(channel: PriceChannel): EconomicsChannel {
  if (channel === "TRENDYOL" || channel === "HEPSIBURADA" || channel === "OWN_STORE") {
    return channel;
  }
  // Akakçe ve Cimri komisyon kanalı değildir; satışın kendi mağaza maliyeti geçerlidir.
  return "OWN_STORE";
}

async function resolveFloor(
  storeId: string,
  variantId: string,
  channel: PriceChannel,
  minMarginBps: number,
  manualFloorMinor: number | null,
): Promise<{ ok: true; floor: number } | { ok: false; error: string }> {
  const unit = await loadUnitEconomics(storeId, variantId);
  if (!unit) {
    return { ok: false, error: "Birim maliyet yok. Önce maliyet ve desi kaydet." };
  }
  const economics = await resolveChannelEconomics(storeId, economicsChannelOf(channel)).catch(() =>
    defaultsForChannel(economicsChannelOf(channel)),
  );
  const tariffs = await loadShippingTariffs(storeId);
  const bands: ShippingBand[] = tariffs.map((row) => ({
    bandMinGrams: row.bandMinGrams,
    bandMaxGrams: row.bandMaxGrams,
    priceMinor: row.priceMinor,
    effectiveFrom: row.effectiveFrom,
  }));
  const cargo = cargoForWeight(bands, unit.desiGrams) ?? economics.cargoMinorPerOrder;
  const floor = computeChannelFloorPrice({
    costMinor: unit.costMinor,
    vatBps: unit.vatBps,
    costIncludesVat: unit.costIncludesVat === true,
    commissionBps: economics.commissionBps,
    cargoMinor: cargo,
    returnRateBps: economics.returnRateBps,
    adCostMinorPerOrder: economics.adCostMinorPerOrder,
    minMarginBps,
    manualFloorMinor,
  });
  if (floor == null) {
    return { ok: false, error: "Bu maliyet yapısında hedef marj imkânsız. Marjı veya maliyeti gözden geçir." };
  }
  return { ok: true, floor };
}

function ruleView(row: {
  id: string;
  variantId: string;
  channel: PriceChannel;
  basePriceMinor: number;
  minMarginBps: number;
  manualFloorMinor: number | null;
  strategy: RepriceStrategy;
  stepMinor: number;
  autoApply: boolean;
  activePriceMinor: number;
  computedFloorMinor: number | null;
  lastRepricedAt: Date | null;
}) {
  return {
    id: row.id,
    variantId: row.variantId,
    channel: row.channel,
    basePriceMinor: row.basePriceMinor,
    basePriceLabel: formatTryMinor(row.basePriceMinor),
    minMarginBps: row.minMarginBps,
    manualFloorMinor: row.manualFloorMinor,
    strategy: row.strategy,
    stepMinor: row.stepMinor,
    autoApply: row.autoApply,
    activePriceMinor: row.activePriceMinor,
    activePriceLabel: formatTryMinor(row.activePriceMinor),
    computedFloorMinor: row.computedFloorMinor,
    computedFloorLabel: row.computedFloorMinor == null ? null : formatTryMinor(row.computedFloorMinor),
    lastRepricedAt: row.lastRepricedAt ? row.lastRepricedAt.toISOString() : null,
  };
}

export async function saveChannelPriceRule(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return commerceFail(422, "İstek geçersiz.");
  }
  const body = raw as Record<string, unknown>;
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "repricer");
  if (denied) {
    return denied;
  }
  const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";
  if (!isPriceChannel(body.channel) || !variantId) {
    return commerceFail(422, "Varyant veya kanal geçersiz.");
  }
  if (!isRepriceStrategy(body.strategy)) {
    return commerceFail(422, "Strateji geçersiz.");
  }
  const basePriceMinor = intField(body.basePriceMinor, 1, 2_147_483_647);
  const minMarginBps = body.minMarginBps == null ? 800 : intField(body.minMarginBps, 0, 10_000);
  const stepMinor = body.stepMinor == null ? 100 : intField(body.stepMinor, 0, 2_147_483_647);
  const manualFloorMinor = body.manualFloorMinor == null ? null : intField(body.manualFloorMinor, 1, 2_147_483_647);
  if (basePriceMinor == null || minMarginBps == null || stepMinor == null || (body.manualFloorMinor != null && manualFloorMinor == null)) {
    return commerceFail(422, "Fiyat, marj veya adım geçersiz.");
  }
  const prisma = getPrisma();
  const variant = await prisma.commerceVariant.findFirst({
    where: { id: variantId, storeId },
    select: { id: true, onHandQty: true },
  });
  if (!variant) {
    return commerceFail(404, "Varyant bulunamadı.");
  }
  const floor = await resolveFloor(storeId, variantId, body.channel, minMarginBps, manualFloorMinor);
  if (!floor.ok) {
    return commerceFail(422, floor.error);
  }
  const now = new Date();
  const existing = await prisma.commerceChannelPriceRule.findUnique({
    where: { storeId_variantId_channel: { storeId, variantId, channel: body.channel } },
  });
  const activePriceMinor = Math.max(existing?.activePriceMinor ?? basePriceMinor, floor.floor);
  const row = await prisma.commerceChannelPriceRule.upsert({
    where: { storeId_variantId_channel: { storeId, variantId, channel: body.channel } },
    create: {
      id: randomUUID(),
      storeId,
      variantId,
      channel: body.channel,
      basePriceMinor,
      minMarginBps,
      manualFloorMinor,
      strategy: body.strategy,
      stepMinor,
      autoApply: body.autoApply === true,
      activePriceMinor,
      computedFloorMinor: floor.floor,
      updatedAt: now,
    },
    update: {
      basePriceMinor,
      minMarginBps,
      manualFloorMinor,
      strategy: body.strategy,
      stepMinor,
      autoApply: body.autoApply === true,
      activePriceMinor,
      computedFloorMinor: floor.floor,
      updatedAt: now,
    },
  });
  const pushes: PushJob[] = [];
  if (existing && existing.activePriceMinor < floor.floor) {
    await applyLivePrice(storeId, variantId, body.channel, floor.floor, variant.onHandQty, pushes);
  }
  await flushPushes(storeId, pushes);
  return {
    ok: true,
    data: {
      rule: ruleView(row),
      message: `Kanal kuralı yazıldı. Kâr korumalı taban ${formatTryMinor(floor.floor)}.`,
    },
  };
}

export async function listRepricerDesk(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const [rules, quotes, logs] = await Promise.all([
    prisma.commerceChannelPriceRule.findMany({
      where: { storeId },
      orderBy: [{ variantId: "asc" }, { channel: "asc" }],
      take: 500,
    }),
    prisma.commerceCompetitorQuote.findMany({
      where: { storeId },
      orderBy: { observedAt: "desc" },
      take: 40,
    }),
    prisma.commerceRepriceLog.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);
  return {
    ok: true,
    data: {
      rules: rules.map(ruleView),
      quotes: quotes.map((row) => ({
        id: row.id,
        variantId: row.variantId,
        channel: row.channel,
        competitorName: row.competitorName,
        competitorUrl: row.competitorUrl,
        competitorPriceMinor: row.competitorPriceMinor,
        competitorPriceLabel: formatTryMinor(row.competitorPriceMinor),
        observedAt: row.observedAt.toISOString(),
      })),
      logs: logs.map((row) => ({
        id: row.id,
        variantId: row.variantId,
        channel: row.channel,
        previousPriceMinor: row.previousPriceMinor,
        previousPriceLabel: formatTryMinor(row.previousPriceMinor),
        competitorPriceMinor: row.competitorPriceMinor,
        competitorPriceLabel: row.competitorPriceMinor == null ? null : formatTryMinor(row.competitorPriceMinor),
        floorPriceMinor: row.floorPriceMinor,
        floorPriceLabel: formatTryMinor(row.floorPriceMinor),
        newPriceMinor: row.newPriceMinor,
        newPriceLabel: formatTryMinor(row.newPriceMinor),
        decision: row.decision,
        createdAt: row.createdAt.toISOString(),
      })),
      message: "Rekabet masası okundu.",
    },
  };
}

async function applyLivePrice(
  storeId: string,
  variantId: string,
  channel: PriceChannel,
  priceMinor: number,
  onHandQty: number,
  pushes: PushJob[],
): Promise<void> {
  const prisma = getPrisma();
  if (channel === "OWN_STORE") {
    await prisma.commerceVariant.update({
      where: { id: variantId },
      data: { amountMinor: priceMinor, updatedAt: new Date() },
    });
    return;
  }
  if (channel !== "TRENDYOL" && channel !== "HEPSIBURADA") {
    return;
  }
  const updated = await prisma.commerceChannelListing.updateMany({
    where: { storeId, variantId, channel },
    data: { priceMinor, syncStatus: "PENDING", lastError: "" },
  });
  if (updated.count > 0) {
    pushes.push({ channel, variantId, onHandQty, priceMinor });
  }
}

async function flushPushes(storeId: string, pushes: PushJob[]): Promise<void> {
  if (pushes.length === 0) {
    return;
  }
  const { publishChannelListingPrice } = await import("@/lib/commerce/trendyol-publish");
  for (const job of pushes) {
    await publishChannelListingPrice({
      storeId,
      variantId: job.variantId,
      channel: job.channel,
      onHandAfter: job.onHandQty,
      amountMinor: job.priceMinor,
    });
  }
}

async function writeDecision(input: {
  storeId: string;
  variantId: string;
  channel: PriceChannel;
  onHandQty: number;
  previousPriceMinor: number;
  floorPriceMinor: number;
  competitorPriceMinor: number | null;
  decision: RepriceDecision;
  strategy: RepriceStrategy;
  stepMinor: number;
  pushes: PushJob[];
  alwaysLog: boolean;
}): Promise<void> {
  const sealed = Math.max(input.decision.newPriceMinor, input.floorPriceMinor);
  const changed = sealed !== input.previousPriceMinor;
  const prisma = getPrisma();
  if (!input.alwaysLog && !changed) {
    if (input.decision.decision !== "COMPETITOR_BELOW_FLOOR_ALERT") {
      return;
    }
    const last = await prisma.commerceRepriceLog.findFirst({
      where: { storeId: input.storeId, variantId: input.variantId, channel: input.channel },
      orderBy: { createdAt: "desc" },
      select: { decision: true, newPriceMinor: true },
    });
    if (last?.decision === "COMPETITOR_BELOW_FLOOR_ALERT" && last.newPriceMinor === sealed) {
      return;
    }
  }
  const now = new Date();
  await prisma.commerceChannelPriceRule.update({
    where: { storeId_variantId_channel: { storeId: input.storeId, variantId: input.variantId, channel: input.channel } },
    data: { activePriceMinor: sealed, computedFloorMinor: input.floorPriceMinor, lastRepricedAt: now, updatedAt: now },
  });
  await prisma.commerceRepriceLog.create({
    data: {
      id: randomUUID(),
      storeId: input.storeId,
      variantId: input.variantId,
      channel: input.channel,
      previousPriceMinor: input.previousPriceMinor,
      competitorPriceMinor: input.competitorPriceMinor,
      floorPriceMinor: input.floorPriceMinor,
      newPriceMinor: sealed,
      decision: input.decision.decision,
    },
  });
  if (changed) {
    await applyLivePrice(input.storeId, input.variantId, input.channel, sealed, input.onHandQty, input.pushes);
  }
}

export async function ingestCompetitorQuotes(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "competitorFeed");
  if (denied) {
    return denied;
  }
  const parsed = readIngestQuotes(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const prisma = getPrisma();
  const resolved: Array<IngestQuote & { variantId: string; onHandQty: number }> = [];
  for (const quote of parsed.quotes) {
    const variant = quote.variantId
      ? await prisma.commerceVariant.findFirst({
          where: { id: quote.variantId, storeId },
          select: { id: true, onHandQty: true },
        })
      : await prisma.commerceVariant.findFirst({
          where: { storeId, sku: quote.sku },
          select: { id: true, onHandQty: true },
        });
    if (!variant) {
      return commerceFail(404, "Varyant bulunamadı.");
    }
    resolved.push({ ...quote, variantId: variant.id, onHandQty: variant.onHandQty });
  }
  const now = new Date();
  await prisma.commerceCompetitorQuote.createMany({
    data: resolved.map((quote) => ({
      id: randomUUID(),
      storeId,
      variantId: quote.variantId,
      channel: quote.channel,
      competitorName: quote.competitorName,
      competitorUrl: quote.competitorUrl,
      competitorPriceMinor: quote.competitorPriceMinor,
      observedAt: now,
    })),
  });

  const groups = new Map<string, { quote: (typeof resolved)[number]; priceMinor: number }>();
  for (const quote of resolved) {
    const key = `${quote.variantId}:${quote.channel}`;
    const current = groups.get(key);
    if (!current || quote.competitorPriceMinor < current.priceMinor) {
      groups.set(key, { quote, priceMinor: quote.competitorPriceMinor });
    }
  }

  const pushes: PushJob[] = [];
  const decisions: Array<Record<string, unknown>> = [];
  for (const group of groups.values()) {
    const rule = await prisma.commerceChannelPriceRule.findUnique({
      where: {
        storeId_variantId_channel: {
          storeId,
          variantId: group.quote.variantId,
          channel: group.quote.channel,
        },
      },
    });
    if (!rule?.autoApply || rule.computedFloorMinor == null) {
      continue;
    }
    let decision: RepriceDecision;
    try {
      decision = evaluateRepriceDecision({
        basePriceMinor: rule.basePriceMinor,
        floorPriceMinor: rule.computedFloorMinor,
        competitorPriceMinor: group.priceMinor,
        strategy: rule.strategy,
        stepMinor: rule.stepMinor,
      });
    } catch (error) {
      return commerceFail(422, error instanceof Error ? error.message : "Rekabet kararı kurulamadı.");
    }
    await writeDecision({
      storeId,
      variantId: rule.variantId,
      channel: rule.channel,
      onHandQty: group.quote.onHandQty,
      previousPriceMinor: rule.activePriceMinor,
      floorPriceMinor: rule.computedFloorMinor,
      competitorPriceMinor: group.priceMinor,
      decision,
      strategy: rule.strategy,
      stepMinor: rule.stepMinor,
      pushes,
      alwaysLog: true,
    });
    decisions.push({
      variantId: rule.variantId,
      channel: rule.channel,
      decision: decision.decision,
      newPriceMinor: Math.max(decision.newPriceMinor, rule.computedFloorMinor),
      newPriceLabel: formatTryMinor(Math.max(decision.newPriceMinor, rule.computedFloorMinor)),
      alert: decision.alert,
    });
  }
  await flushPushes(storeId, pushes);
  return {
    ok: true,
    data: {
      stored: resolved.length,
      decisions,
      message:
        decisions.length > 0
          ? `${resolved.length} rakip fiyatı yazıldı. ${decisions.length} kanal fiyatı güncellendi.`
          : `${resolved.length} rakip fiyatı yazıldı.`,
    },
  };
}

const REPRICE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Son 24 saatteki en düşük rakip kuruşu. Pencere dışı ve geçersiz tutar sayılmaz. */
export function lowestObservedCompetitorMinor(
  quotes: readonly { competitorPriceMinor: number; observedAt: Date }[],
  since: Date,
): number | null {
  const sinceMs = since.getTime();
  let lowest: number | null = null;
  for (const quote of quotes) {
    if (quote.observedAt.getTime() < sinceMs) {
      continue;
    }
    if (!Number.isInteger(quote.competitorPriceMinor) || quote.competitorPriceMinor < 1) {
      continue;
    }
    if (lowest == null || quote.competitorPriceMinor < lowest) {
      lowest = quote.competitorPriceMinor;
    }
  }
  return lowest;
}

/**
 * Taban, güncel maliyet hesabından gelir. Hesap yoksa kayıtlı tabanla karar verilmez.
 * Kayıtlı taban değiştiyse `changed` yazımı ister.
 */
export function nextComputedFloor(
  stored: number | null,
  fresh: number | null,
): { floorMinor: number | null; changed: boolean } {
  if (fresh == null) {
    return { floorMinor: null, changed: false };
  }
  return { floorMinor: fresh, changed: fresh !== stored };
}

export async function runRepricerSweep(): Promise<{ scanned: number; applied: number; alerts: number }> {
  const prisma = getPrisma();
  const now = new Date();
  const since = new Date(now.getTime() - REPRICE_WINDOW_MS);
  const rules = await prisma.commerceChannelPriceRule.findMany({
    where: { autoApply: true },
    orderBy: { lastRepricedAt: { sort: "asc", nulls: "first" } },
    take: 200,
  });
  let applied = 0;
  let alerts = 0;
  const pushes: PushJob[] = [];
  for (const rule of rules) {
    const resolved = await resolveFloor(
      rule.storeId,
      rule.variantId,
      rule.channel,
      rule.minMarginBps,
      rule.manualFloorMinor,
    );
    const nextFloor = nextComputedFloor(rule.computedFloorMinor, resolved.ok ? resolved.floor : null);
    await prisma.commerceChannelPriceRule.update({
      where: { id: rule.id },
      data: {
        lastRepricedAt: now,
        ...(nextFloor.changed ? { computedFloorMinor: nextFloor.floorMinor } : {}),
      },
    });
    if (nextFloor.floorMinor == null) {
      continue;
    }
    const quotes = await prisma.commerceCompetitorQuote.findMany({
      where: {
        storeId: rule.storeId,
        variantId: rule.variantId,
        channel: rule.channel,
        observedAt: { gte: since },
      },
      select: { competitorPriceMinor: true, observedAt: true },
      orderBy: { competitorPriceMinor: "asc" },
      take: 50,
    });
    const competitorPriceMinor = lowestObservedCompetitorMinor(quotes, since);
    if (competitorPriceMinor == null) {
      continue;
    }
    const variant = await prisma.commerceVariant.findFirst({
      where: { id: rule.variantId, storeId: rule.storeId },
      select: { onHandQty: true },
    });
    if (!variant) {
      continue;
    }
    let decision: RepriceDecision;
    try {
      decision = evaluateRepriceDecision({
        basePriceMinor: rule.basePriceMinor,
        floorPriceMinor: nextFloor.floorMinor,
        competitorPriceMinor,
        strategy: rule.strategy,
        stepMinor: rule.stepMinor,
      });
    } catch {
      continue;
    }
    const before = pushes.length;
    await writeDecision({
      storeId: rule.storeId,
      variantId: rule.variantId,
      channel: rule.channel,
      onHandQty: variant.onHandQty,
      previousPriceMinor: rule.activePriceMinor,
      floorPriceMinor: nextFloor.floorMinor,
      competitorPriceMinor,
      decision,
      strategy: rule.strategy,
      stepMinor: rule.stepMinor,
      pushes,
      alwaysLog: false,
    });
    if (pushes.length > before || decision.newPriceMinor !== rule.activePriceMinor) {
      applied += 1;
    }
    if (decision.decision === "COMPETITOR_BELOW_FLOOR_ALERT") {
      alerts += 1;
    }
  }
  const byStore = new Map<string, PushJob[]>();
  for (const job of pushes) {
    const rule = rules.find((row) => row.variantId === job.variantId && row.channel === job.channel);
    const storeId = rule?.storeId;
    if (!storeId) {
      continue;
    }
    const bucket = byStore.get(storeId) ?? [];
    bucket.push(job);
    byStore.set(storeId, bucket);
  }
  for (const [storeId, jobs] of byStore) {
    await flushPushes(storeId, jobs);
  }
  return { scanned: rules.length, applied, alerts };
}
