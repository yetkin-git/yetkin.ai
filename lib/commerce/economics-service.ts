/**
 * Ekonomi katmanı yazma/okuma — sahiplik findStoreForOwner ile.
 * Para hareketi yok; yalnız maliyet, tarife ve kanal gerçeği.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import {
  defaultsForChannel,
  isEconomicsChannel,
  type EconomicsChannel,
} from "@/lib/commerce/economics-defaults";
import { getPrisma } from "@/lib/kernel/db";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";

const MISSING = "Mağaza bulunamadı.";

function isChannel(value: unknown): value is EconomicsChannel {
  return isEconomicsChannel(value);
}

function intField(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }
  return value;
}

async function requireOwnedStore(userId: string, storeId: string) {
  const store = await getPrisma().commerceStore.findFirst({
    where: { id: storeId, ownerUserId: userId },
    select: { id: true },
  });
  return store;
}

export async function upsertStoreEconomics(
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
  const prisma = getPrisma();
  const now = new Date();
  const result: Record<string, unknown> = {};

  if (body.unit != null) {
    if (typeof body.unit !== "object" || Array.isArray(body.unit)) {
      return commerceFail(422, "Birim maliyet gövdesi geçersiz.");
    }
    const unit = body.unit as Record<string, unknown>;
    const variantId = typeof unit.variantId === "string" ? unit.variantId.trim() : "";
    const costMinor = intField(unit.costMinor, 0, 2_147_483_647);
    const desiGrams = intField(unit.desiGrams, 1, 2_147_483_647);
    const vatBps = unit.vatBps == null ? 2_000 : intField(unit.vatBps, 0, 10_000);
    const costIncludesVat = unit.costIncludesVat === true;
    if (!variantId || costMinor == null || desiGrams == null || vatBps == null) {
      return commerceFail(422, "Varyant, maliyet veya desi geçersiz.");
    }
    const variant = await prisma.commerceVariant.findFirst({
      where: { id: variantId, storeId },
      select: { id: true },
    });
    if (!variant) {
      return commerceFail(404, "Varyant bulunamadı.");
    }
    const row = await prisma.commerceUnitEconomics.upsert({
      where: { variantId_storeId: { variantId, storeId } },
      create: {
        id: randomUUID(),
        storeId,
        variantId,
        costMinor,
        desiGrams,
        vatBps,
        costIncludesVat,
        updatedAt: now,
      },
      update: { costMinor, desiGrams, vatBps, costIncludesVat, updatedAt: now },
    });
    result.unit = {
      variantId: row.variantId,
      costMinor: row.costMinor,
      desiGrams: row.desiGrams,
      vatBps: row.vatBps,
      costIncludesVat: row.costIncludesVat === true,
    };
  }

  if (body.tariff != null) {
    if (typeof body.tariff !== "object" || Array.isArray(body.tariff)) {
      return commerceFail(422, "Kargo tarifesi geçersiz.");
    }
    const tariff = body.tariff as Record<string, unknown>;
    const carrier = typeof tariff.carrier === "string" ? tariff.carrier.trim().slice(0, 40) : "";
    const bandMinGrams = intField(tariff.bandMinGrams, 0, 2_147_483_647);
    const bandMaxGrams = intField(tariff.bandMaxGrams, 1, 2_147_483_647);
    const priceMinor = intField(tariff.priceMinor, 0, 2_147_483_647);
    if (!carrier || bandMinGrams == null || bandMaxGrams == null || priceMinor == null) {
      return commerceFail(422, "Kargo baremi alanları geçersiz.");
    }
    if (bandMaxGrams < bandMinGrams) {
      return commerceFail(422, "Barem üst sınırı alt sınırdan küçük olamaz.");
    }
    // P1.4 — aynı bant (storeId, carrier, bandMin, bandMax) **güncellenir**.
    // Eskiden her kayıt yeni satır açıyordu; zam sonrası eski 39,90 satırı
    // silinmiyor ve motor onu "en ucuz" diye seçmeye devam ediyordu.
    const current = await prisma.commerceShippingTariff.findFirst({
      where: { storeId, carrier, bandMinGrams, bandMaxGrams },
      orderBy: { effectiveFrom: "desc" },
      select: { id: true },
    });
    const row = current
      ? await prisma.commerceShippingTariff.update({
          where: { id: current.id },
          data: { priceMinor, effectiveFrom: now },
        })
      : await prisma.commerceShippingTariff.create({
          data: {
            id: randomUUID(),
            storeId,
            carrier,
            bandMinGrams,
            bandMaxGrams,
            priceMinor,
            effectiveFrom: now,
          },
        });
    result.tariff = {
      id: row.id,
      carrier: row.carrier,
      bandMinGrams: row.bandMinGrams,
      bandMaxGrams: row.bandMaxGrams,
      priceMinor: row.priceMinor,
      effectiveFrom: row.effectiveFrom.toISOString(),
      updated: Boolean(current),
    };
  }

  if (body.channel != null) {
    if (typeof body.channel !== "object" || Array.isArray(body.channel)) {
      return commerceFail(422, "Kanal maliyeti geçersiz.");
    }
    const channelBody = body.channel as Record<string, unknown>;
    if (!isChannel(channelBody.channel)) {
      return commerceFail(422, "Kanal geçersiz.");
    }
    const defaults = defaultsForChannel(channelBody.channel);
    const commissionBps =
      channelBody.commissionBps == null
        ? defaults.commissionBps
        : intField(channelBody.commissionBps, 0, 10_000);
    const cargoMinorPerOrder =
      channelBody.cargoMinorPerOrder == null
        ? defaults.cargoMinorPerOrder
        : intField(channelBody.cargoMinorPerOrder, 0, 2_147_483_647);
    const returnRateBps =
      channelBody.returnRateBps == null
        ? defaults.returnRateBps
        : intField(channelBody.returnRateBps, 0, 10_000);
    const adCostMinorPerOrder =
      channelBody.adCostMinorPerOrder == null
        ? defaults.adCostMinorPerOrder
        : intField(channelBody.adCostMinorPerOrder, 0, 2_147_483_647);
    if (
      commissionBps == null ||
      cargoMinorPerOrder == null ||
      returnRateBps == null ||
      adCostMinorPerOrder == null
    ) {
      return commerceFail(422, "Kanal maliyet alanları geçersiz.");
    }
    const row = await prisma.commerceChannelEconomics.upsert({
      where: { storeId_channel: { storeId, channel: channelBody.channel } },
      create: {
        id: randomUUID(),
        storeId,
        channel: channelBody.channel,
        commissionBps,
        cargoMinorPerOrder,
        returnRateBps,
        adCostMinorPerOrder,
        updatedAt: now,
      },
      update: {
        commissionBps,
        cargoMinorPerOrder,
        returnRateBps,
        adCostMinorPerOrder,
        updatedAt: now,
      },
    });
    result.channel = {
      channel: row.channel,
      commissionBps: row.commissionBps,
      cargoMinorPerOrder: row.cargoMinorPerOrder,
      returnRateBps: row.returnRateBps,
      adCostMinorPerOrder: row.adCostMinorPerOrder,
    };
  }

  if (!result.unit && !result.tariff && !result.channel) {
    return commerceFail(422, "Kaydedilecek maliyet, tarife veya kanal yok.");
  }
  return { ok: true, data: { ...result, message: "Ekonomi kaydı yazıldı." } };
}

export async function resolveChannelEconomics(storeId: string, channel: EconomicsChannel) {
  const row = await getPrisma().commerceChannelEconomics.findUnique({
    where: { storeId_channel: { storeId, channel } },
  });
  if (row) {
    return {
      commissionBps: row.commissionBps,
      cargoMinorPerOrder: row.cargoMinorPerOrder,
      returnRateBps: row.returnRateBps,
      adCostMinorPerOrder: row.adCostMinorPerOrder,
    };
  }
  return defaultsForChannel(channel);
}

export async function loadUnitEconomics(storeId: string, variantId: string) {
  return getPrisma().commerceUnitEconomics.findUnique({
    where: { variantId_storeId: { variantId, storeId } },
  });
}

export async function loadShippingTariffs(storeId: string) {
  // Aynı bant birden çok satırda kalabilir (eski veri). `effectiveFrom` artan
  // sırada verilir; seçim `profit.cargoForWeight` içinde **en güncel** satırdır.
  return getPrisma().commerceShippingTariff.findMany({
    where: { storeId },
    orderBy: [{ carrier: "asc" }, { bandMinGrams: "asc" }, { effectiveFrom: "asc" }],
  });
}

export { requireOwnedStore, isChannel, intField, MISSING };
