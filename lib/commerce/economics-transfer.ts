/**
 * Varyant maliyeti ve kanal fiyatının CSV ile toplu alışverişi.
 * Stok deftere yazılmaz. Kanal fiyatı kâr tabanının altına inmez.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import { parseEconomicsCsv, renderEconomicsCsv, type EconomicsCsvRow } from "@/lib/commerce/economics-csv";
import {
  loadShippingTariffs,
  MISSING,
  requireOwnedStore,
  resolveChannelEconomics,
} from "@/lib/commerce/economics-service";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { cargoForWeight, DEFAULT_VAT_BPS, type ShippingBand } from "@/lib/commerce/profit";
import { computeChannelFloorPrice, PRICE_CHANNELS, type PriceChannel } from "@/lib/commerce/repricer";
import { publishAppliedTrendyolStock } from "@/lib/commerce/trendyol-publish";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { getPrisma } from "@/lib/kernel/db";

export function economicsImportMessage(units: number, rules: number, queued: boolean): string {
  const base = `${units} maliyet ve ${rules} kanal fiyatı güncellendi.`;
  return queued
    ? `${base} pazaryeri eşitleme kuyruğuna alındı.`
    : `${base} yerel fiyat güncellendi; periyodik eşitlemede pazaryerine aktarılacak.`;
}

function economicsChannel(channel: PriceChannel) {
  if (channel === "TRENDYOL" || channel === "HEPSIBURADA" || channel === "OWN_STORE") {
    return channel;
  }
  return "OWN_STORE" as const;
}

export async function exportStoreEconomicsCsv(
  userId: string,
  storeId: string,
): Promise<CommerceResult<{ csv: string; filename: string }>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const variants = await prisma.commerceVariant.findMany({
    where: { storeId },
    orderBy: { sku: "asc" },
    take: 1000,
    include: {
      product: { select: { title: true } },
      unitEconomics: true,
      channelPriceRules: true,
    },
  });
  const rows: EconomicsCsvRow[] = [];
  for (const variant of variants) {
    const byChannel = new Map(variant.channelPriceRules.map((rule) => [rule.channel, rule]));
    for (const channel of PRICE_CHANNELS) {
      const rule = byChannel.get(channel);
      rows.push({
        sku: variant.sku,
        title: variant.product.title,
        stockQty: variant.onHandQty,
        costMinor: variant.unitEconomics?.costMinor ?? null,
        vatBps: variant.unitEconomics?.vatBps ?? null,
        costIncludesVat: variant.unitEconomics?.costIncludesVat === true,
        desiGrams: variant.unitEconomics?.desiGrams ?? null,
        channel,
        basePriceMinor: rule?.basePriceMinor ?? null,
        activePriceMinor: rule?.activePriceMinor ?? null,
        minMarginBps: rule?.minMarginBps ?? null,
        manualFloorMinor: rule?.manualFloorMinor ?? null,
        strategy: rule?.strategy ?? null,
        stepMinor: rule?.stepMinor ?? null,
        autoApply: rule?.autoApply === true,
      });
    }
  }
  return {
    ok: true,
    data: { csv: renderEconomicsCsv(rows), filename: "maliyet-kanal.csv" },
  };
}

export async function importStoreEconomicsCsv(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "csv");
  if (denied) {
    return denied;
  }
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return commerceFail(422, "İstek geçersiz.");
  }
  const csv = (raw as { csv?: unknown }).csv;
  if (typeof csv !== "string" || csv.trim().length === 0) {
    return commerceFail(422, "CSV metni yok.");
  }
  const parsed = parseEconomicsCsv(csv);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const prisma = getPrisma();
  const skus = [...new Set(parsed.rows.map((row) => row.sku))];
  const variants = await prisma.commerceVariant.findMany({
    where: { storeId, sku: { in: skus } },
    select: { id: true, sku: true, onHandQty: true, amountMinor: true },
  });
  const bySku = new Map(variants.map((row) => [row.sku, row]));
  for (const sku of skus) {
    if (!bySku.has(sku)) {
      return commerceFail(404, "Varyant bulunamadı.");
    }
  }
  const tariffs = await loadShippingTariffs(storeId);
  const bands: ShippingBand[] = tariffs.map((row) => ({
    bandMinGrams: row.bandMinGrams,
    bandMaxGrams: row.bandMaxGrams,
    priceMinor: row.priceMinor,
    effectiveFrom: row.effectiveFrom,
  }));
  const economics = {
    TRENDYOL: await resolveChannelEconomics(storeId, "TRENDYOL"),
    HEPSIBURADA: await resolveChannelEconomics(storeId, "HEPSIBURADA"),
    OWN_STORE: await resolveChannelEconomics(storeId, "OWN_STORE"),
  };
  const grouped = new Map<string, EconomicsCsvRow[]>();
  for (const row of parsed.rows) {
    const bucket = grouped.get(row.sku) ?? [];
    bucket.push(row);
    grouped.set(row.sku, bucket);
  }
  const now = new Date();
  let units = 0;
  let rules = 0;
  const queued = new Map<string, { onHandAfter: number; amountMinor: number | null; variantAmountMinor: number | null }>();
  try {
  await prisma.$transaction(async (tx) => {
    for (const [sku, bucket] of grouped) {
      const variant = bySku.get(sku);
      if (!variant) {
        continue;
      }
      const variantId = variant.id;
      const costRow = bucket.find((row) => row.costMinor != null && row.desiGrams != null && row.desiGrams >= 1);
      if (costRow?.costMinor != null && costRow.desiGrams != null) {
        const vatBps = costRow.vatBps ?? DEFAULT_VAT_BPS;
        if (vatBps < 0 || vatBps > 10_000) {
          throw new Error("KDV oranı geçersiz.");
        }
        await tx.commerceUnitEconomics.upsert({
          where: { variantId_storeId: { variantId, storeId } },
          create: {
            id: randomUUID(),
            storeId,
            variantId,
            costMinor: costRow.costMinor,
            desiGrams: costRow.desiGrams,
            vatBps,
            costIncludesVat: costRow.costIncludesVat,
            updatedAt: now,
          },
          update: {
            costMinor: costRow.costMinor,
            desiGrams: costRow.desiGrams,
            vatBps,
            costIncludesVat: costRow.costIncludesVat,
            updatedAt: now,
          },
        });
        units += 1;
      }
      for (const row of bucket) {
        if (!row.channel || row.basePriceMinor == null || row.basePriceMinor < 1) {
          continue;
        }
        const channelEconomics = economics[economicsChannel(row.channel)];
        const cargo = row.desiGrams != null ? (cargoForWeight(bands, row.desiGrams) ?? channelEconomics.cargoMinorPerOrder) : channelEconomics.cargoMinorPerOrder;
        const floor = computeChannelFloorPrice({
          costMinor: row.costMinor ?? costRow?.costMinor ?? 0,
          vatBps: row.vatBps ?? costRow?.vatBps ?? DEFAULT_VAT_BPS,
          costIncludesVat: row.costIncludesVat || costRow?.costIncludesVat === true,
          commissionBps: channelEconomics.commissionBps,
          cargoMinor: cargo,
          returnRateBps: channelEconomics.returnRateBps,
          adCostMinorPerOrder: channelEconomics.adCostMinorPerOrder,
          minMarginBps: row.minMarginBps ?? 800,
          manualFloorMinor: row.manualFloorMinor,
        });
        if (floor == null) {
          throw new Error("Bu maliyet yapısında hedef marj imkânsız.");
        }
        const active = Math.max(row.activePriceMinor ?? row.basePriceMinor, floor);
        await tx.commerceChannelPriceRule.upsert({
          where: { storeId_variantId_channel: { storeId, variantId, channel: row.channel } },
          create: {
            id: randomUUID(),
            storeId,
            variantId,
            channel: row.channel,
            basePriceMinor: row.basePriceMinor,
            minMarginBps: row.minMarginBps ?? 800,
            manualFloorMinor: row.manualFloorMinor,
            strategy: row.strategy ?? "FIXED",
            stepMinor: row.stepMinor ?? 100,
            autoApply: row.autoApply,
            activePriceMinor: active,
            computedFloorMinor: floor,
            updatedAt: now,
          },
          update: {
            basePriceMinor: row.basePriceMinor,
            minMarginBps: row.minMarginBps ?? 800,
            manualFloorMinor: row.manualFloorMinor,
            strategy: row.strategy ?? "FIXED",
            stepMinor: row.stepMinor ?? 100,
            autoApply: row.autoApply,
            activePriceMinor: active,
            computedFloorMinor: floor,
            updatedAt: now,
          },
        });
        rules += 1;
        if (row.channel === "TRENDYOL" || row.channel === "HEPSIBURADA") {
          const updated = await tx.commerceChannelListing.updateMany({
            where: { storeId, variantId, channel: row.channel },
            data: { priceMinor: active, syncStatus: "PENDING", lastError: "" },
          });
          if (updated.count > 0) {
            const salePriceMinor = channelListingSaleMinor({ priceMinor: active }, variant.amountMinor);
            queued.set(variantId, {
              onHandAfter: variant.onHandQty,
              amountMinor: salePriceMinor,
              variantAmountMinor: variant.amountMinor,
            });
          }
        }
        if (row.channel === "OWN_STORE") {
          await tx.commerceVariant.update({
            where: { id: variantId },
            data: { amountMinor: active, updatedAt: now },
          });
        }
      }
    }
  });
  } catch (error) {
    queued.clear();
    const message = error instanceof Error ? error.message : "CSV yazılamadı.";
    if (message === "KDV oranı geçersiz." || message === "Bu maliyet yapısında hedef marj imkânsız.") {
      return commerceFail(422, message);
    }
    throw error;
  }
  for (const [variantId, push] of queued) {
    await publishAppliedTrendyolStock({
      storeId,
      variantId,
      onHandAfter: push.onHandAfter,
      amountMinor: push.amountMinor,
      variantAmountMinor: push.variantAmountMinor,
    });
  }
  return {
    ok: true,
    data: { units, rules, queued: queued.size, message: economicsImportMessage(units, rules, queued.size > 0) },
  };
}
