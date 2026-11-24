/**
 * Motor 4 — Günlük kâr özeti, zarar kalkanı ve tek tıkla aksiyon.
 * Sayılar deterministik; AI yalnız özet cümlesi üretebilir (opsiyonel, mühürlü).
 *
 * Para birimi sözleşmesi: depo kuruş tutar, satıcıya giden her metin `formatTryMinor`
 * ile TL basar. Ham kuruş UI'a veya e-postaya sızmaz.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import {
  loadShippingTariffs,
  MISSING,
  requireOwnedStore,
  resolveChannelEconomics,
} from "@/lib/commerce/economics-service";
import {
  BREAK_EVEN_NEAR_BPS,
  DEFAULT_VAT_BPS,
  TARGET_NET_MARGIN_BPS,
  breakEvenDiscountBps,
  calculateUnitNet,
  profitablePriceMinor,
  simulateCampaign,
  type CampaignVerdict,
  type ShippingBand,
} from "@/lib/commerce/profit";
import { readApplied, readVariantId } from "@/lib/commerce/channel-stock-engine";
import { istanbulDayKey } from "@/lib/commerce/day-key";
import { channelListingSaleMinor } from "@/lib/commerce/listing-price";
import { classifyStockMovement } from "@/lib/commerce/return-impact";
import { isCriticalStock } from "@/lib/commerce/os-rules";
import { criticalRestockVariantId, restockTargetNote, sumVariantOnHand } from "@/lib/commerce/stock-sync";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { publishAppliedTrendyolStock } from "@/lib/commerce/trendyol-publish";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { getPrisma } from "@/lib/kernel/db";
import { emitCitizenNotice } from "@/lib/kernel/notice/emit";
import { logEvent } from "@/lib/kernel/observability/log";

export { istanbulDayKey } from "@/lib/commerce/day-key";

type SkuRow = {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  priceMinor: number;
  costMinor: number;
  desiGrams: number;
  vatBps: number;
  costIncludesVat: boolean;
  onHandQty: number;
  approvedStockQty: number;
  criticalStockQty: number;
  netMinor: number;
  marginBps: number;
  breakEvenBps: number;
  verdict: CampaignVerdict;
};

type BriefPayload = {
  dayKey: string;
  lossSkus: SkuRow[];
  thinSkus: SkuRow[];
  nearBreakEven: SkuRow[];
  criticalStock: Array<{
    productId: string;
    title: string;
    approvedStockQty: number;
    criticalStockQty: number;
    variantId: string;
  }>;
  returnImpactMinor: number;
  realizedNetMinor: number;
  netSellableQty: number;
  totals: {
    netMinor: number;
    catalogNetMinor: number;
    realizedNetMinor: number;
    lossSkuCount: number;
    skuCount: number;
    returnImpactMinor: number;
    netSellableQty: number;
    returnedUnits: number;
    cancelledUnits: number;
  };
};

const SET_MEMBER_NOTE = /^Set üyesi:/;
const CHANNEL_TWIN_NOTE = /event=ORDER_/;

export type RawCommerceMove = {
  source: "LEDGER" | "INVENTORY";
  type: string;
  note: string;
  quantity: number;
  variantId: string;
  productId: string;
  channel: string | null;
};

export type SelectedCommerceMove = {
  kind: "SALE" | "RETURN" | "CANCEL";
  quantity: number;
  variantId: string;
  productId: string;
  channel: string | null;
};

export type RealizedVariantPrice = {
  id: string;
  productId: string;
  amountMinor: number | null;
  costMinor: number | null;
  desiGrams: number | null;
  vatBps: number;
  costIncludesVat: boolean;
  listings: readonly { channel: string; priceMinor?: number | null }[];
};

export type ChannelCostSlice = {
  commissionBps: number;
  cargoMinorPerOrder: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
};

/**
 * Gerçekleşen satış ve iade.
 * Kanal defteri `CHANNEL_SALE` / `RETURN_RESTOCK` sayılır.
 * Aynı siparişin envanter ikizi (`event=ORDER_`) ve set üyesi düşümü ikinci kez yazılmaz.
 */
export function selectRealizedCommerceMoves(rows: readonly RawCommerceMove[]): SelectedCommerceMove[] {
  const selected: SelectedCommerceMove[] = [];
  for (const row of rows) {
    if (SET_MEMBER_NOTE.test(row.note)) {
      continue;
    }
    if (row.source === "INVENTORY" && CHANNEL_TWIN_NOTE.test(row.note)) {
      continue;
    }
    if (row.source === "LEDGER" && row.type === "CHANNEL_SALE") {
      const quantity = readApplied(row.note, row.quantity);
      if (quantity < 1) {
        continue;
      }
      selected.push({
        kind: "SALE",
        quantity,
        variantId: row.variantId || readVariantId(row.note),
        productId: row.productId,
        channel: row.channel,
      });
      continue;
    }
    if (row.source === "LEDGER" && row.type === "RETURN_RESTOCK") {
      const kind = classifyStockMovement(row.type, row.note);
      if (!kind || !Number.isInteger(row.quantity) || row.quantity < 1) {
        continue;
      }
      selected.push({
        kind,
        quantity: row.quantity,
        variantId: row.variantId || readVariantId(row.note),
        productId: row.productId,
        channel: row.channel,
      });
      continue;
    }
    if (row.source === "INVENTORY" && row.type === "SALE") {
      if (!Number.isInteger(row.quantity) || row.quantity < 1) {
        continue;
      }
      selected.push({
        kind: "SALE",
        quantity: row.quantity,
        variantId: row.variantId,
        productId: row.productId,
        channel: row.channel,
      });
      continue;
    }
    if (row.source === "INVENTORY" && (row.type === "RETURN" || row.type === "CANCEL")) {
      const kind = classifyStockMovement(row.type, row.note);
      if (!kind || !Number.isInteger(row.quantity) || row.quantity < 1) {
        continue;
      }
      selected.push({
        kind,
        quantity: row.quantity,
        variantId: row.variantId,
        productId: row.productId,
        channel: row.channel,
      });
    }
  }
  return selected;
}

/** Aktif kanal fiyatı doluysa o kuruş, boşsa varyant tutarı. */
export function activeChannelSaleMinor(
  variant: Pick<RealizedVariantPrice, "amountMinor" | "listings">,
  channel: string | null,
): number | null {
  const named =
    channel && channel !== "OWN_STORE" ? variant.listings.find((row) => row.channel === channel) : undefined;
  if (named && typeof named.priceMinor === "number" && named.priceMinor > 0) {
    return channelListingSaleMinor(named, variant.amountMinor);
  }
  if (channel && channel !== "OWN_STORE") {
    return channelListingSaleMinor(named ?? null, variant.amountMinor);
  }
  const anyFilled = variant.listings.find((row) => typeof row.priceMinor === "number" && row.priceMinor > 0);
  return channelListingSaleMinor(anyFilled ?? null, variant.amountMinor);
}

export function summarizeRealizedSales(input: {
  moves: readonly SelectedCommerceMove[];
  variants: readonly RealizedVariantPrice[];
  economicsByChannel: Readonly<Record<string, ChannelCostSlice>>;
  cargoMinor: (desiGrams: number, channel: string) => number;
}): {
  realizedNetMinor: number;
  returnImpactMinor: number;
  soldUnits: number;
  returnedUnits: number;
  cancelledUnits: number;
} {
  const byId = new Map(input.variants.map((row) => [row.id, row]));
  const byProduct = new Map<string, RealizedVariantPrice[]>();
  for (const variant of input.variants) {
    const bucket = byProduct.get(variant.productId) ?? [];
    bucket.push(variant);
    byProduct.set(variant.productId, bucket);
  }
  let realizedNetMinor = 0;
  let returnImpactMinor = 0;
  let soldUnits = 0;
  let returnedUnits = 0;
  let cancelledUnits = 0;
  for (const move of input.moves) {
    if (move.kind === "SALE") {
      soldUnits += move.quantity;
    } else if (move.kind === "CANCEL") {
      cancelledUnits += move.quantity;
    } else {
      returnedUnits += move.quantity;
    }
    let variant = move.variantId ? byId.get(move.variantId) : undefined;
    if (!variant) {
      const known = byProduct.get(move.productId) ?? [];
      if (known.length === 1) {
        variant = known[0];
      }
    }
    if (!variant || variant.costMinor == null || variant.desiGrams == null) {
      continue;
    }
    const salePriceMinor = activeChannelSaleMinor(variant, move.channel);
    if (salePriceMinor == null || salePriceMinor < 1) {
      continue;
    }
    const channelKey =
      move.channel === "TRENDYOL" || move.channel === "HEPSIBURADA" || move.channel === "OWN_STORE"
        ? move.channel
        : "OWN_STORE";
    const economics = input.economicsByChannel[channelKey] ?? input.economicsByChannel.OWN_STORE;
    if (!economics) {
      continue;
    }
    const net = calculateUnitNet({
      priceMinor: salePriceMinor,
      quantity: move.quantity,
      costMinor: variant.costMinor,
      commissionBps: economics.commissionBps,
      cargoMinor: input.cargoMinor(variant.desiGrams, channelKey),
      returnRateBps: economics.returnRateBps,
      adCostMinorPerOrder: economics.adCostMinorPerOrder,
      vatBps: variant.vatBps,
      costIncludesVat: variant.costIncludesVat,
    }).netMinor;
    if (move.kind === "SALE") {
      realizedNetMinor += net;
    } else {
      returnImpactMinor += net;
    }
  }
  return { realizedNetMinor, returnImpactMinor, soldUnits, returnedUnits, cancelledUnits };
}

/** Ağırlığa uyan barem — aynı bandın **en güncel** satırı kazanır (`profit.cargoForWeight`). */
function cargoForGrams(tariffs: readonly ShippingBand[], grams: number, fallbackMinor: number): number {
  const fits = tariffs.filter((row) => grams >= row.bandMinGrams && grams <= row.bandMaxGrams);
  if (fits.length === 0) {
    return fallbackMinor;
  }
  const newest = [...fits].sort((a, b) => effectiveKey(b) - effectiveKey(a))[0];
  return newest?.priceMinor ?? fallbackMinor;
}

function effectiveKey(row: ShippingBand): number {
  const raw = row.effectiveFrom;
  if (raw == null) {
    return 0;
  }
  if (raw instanceof Date) {
    return raw.getTime();
  }
  if (typeof raw === "number") {
    return raw;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function scanStoreSkus(storeId: string): Promise<BriefPayload> {
  const dayKey = istanbulDayKey();
  const channel = await resolveChannelEconomics(storeId, "TRENDYOL");
  const tariffRows = await loadShippingTariffs(storeId);
  const tariffs: ShippingBand[] = tariffRows.map((row) => ({
    bandMinGrams: row.bandMinGrams,
    bandMaxGrams: row.bandMaxGrams,
    priceMinor: row.priceMinor,
    effectiveFrom: row.effectiveFrom,
  }));
  const products = await getPrisma().commerceProduct.findMany({
    where: { storeId, status: "ACTIVE" },
    include: {
      variants: {
        where: { status: { in: ["ACTIVE", "PASSIVE"] } },
        include: {
          unitEconomics: true,
          channelListings: { select: { channel: true, priceMinor: true } },
        },
      },
    },
    take: 200,
  });

  const lossSkus: SkuRow[] = [];
  const thinSkus: SkuRow[] = [];
  const nearBreakEven: SkuRow[] = [];
  const criticalStock: BriefPayload["criticalStock"] = [];
  let catalogNetMinor = 0;
  let skuCount = 0;
  let netSellableQty = 0;

  for (const product of products) {
    // M4-7 — kritik stok **varyant toplamı** üzerinden okunur. Ürün alanı
    // türetilmiş kolondur; drift olan kartta uyarı kaçmaz.
    const variantTotal = sumVariantOnHand(product.variants);
    if (isCriticalStock(variantTotal, product.criticalStockQty)) {
      criticalStock.push({
        productId: product.id,
        title: product.title,
        approvedStockQty: variantTotal,
        criticalStockQty: product.criticalStockQty,
        variantId: criticalRestockVariantId(product.variants) ?? "",
      });
    }
    for (const variant of product.variants) {
      if (variant.status === "PASSIVE" || variant.status === "DRAFT") {
        continue;
      }
      netSellableQty += Math.max(0, variant.onHandQty - (variant.safetyBuffer ?? 0));
      if (!variant.unitEconomics || !variant.amountMinor || variant.amountMinor < 1) {
        continue;
      }
      skuCount += 1;
      const vatBps = variant.unitEconomics.vatBps ?? DEFAULT_VAT_BPS;
      const costIncludesVat = variant.unitEconomics.costIncludesVat === true;
      const cargo = cargoForGrams(tariffs, variant.unitEconomics.desiGrams, channel.cargoMinorPerOrder);
      const unit = calculateUnitNet({
        priceMinor: variant.amountMinor,
        quantity: 1,
        costMinor: variant.unitEconomics.costMinor,
        commissionBps: channel.commissionBps,
        cargoMinor: cargo,
        returnRateBps: channel.returnRateBps,
        adCostMinorPerOrder: channel.adCostMinorPerOrder,
        vatBps,
        costIncludesVat,
      });
      const breakEvenBps = breakEvenDiscountBps({
        priceMinor: variant.amountMinor,
        cogsMinor: variant.unitEconomics.costMinor,
        commissionBps: channel.commissionBps,
        cargoMinor: cargo,
        returnBps: channel.returnRateBps,
        adCostMinor: channel.adCostMinorPerOrder,
        vatBps,
        costIncludesVat,
      });
      const sim = simulateCampaign({
        priceMinor: variant.amountMinor,
        discountBps: 0,
        cogsMinor: variant.unitEconomics.costMinor,
        commissionBps: channel.commissionBps,
        cargoMinor: cargo,
        returnBps: channel.returnRateBps,
        adCostMinor: channel.adCostMinorPerOrder,
        vatBps,
        costIncludesVat,
      });
      const row: SkuRow = {
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        sku: variant.sku,
        priceMinor: variant.amountMinor,
        costMinor: variant.unitEconomics.costMinor,
        desiGrams: variant.unitEconomics.desiGrams,
        vatBps,
        costIncludesVat,
        onHandQty: variant.onHandQty,
        approvedStockQty: variantTotal,
        criticalStockQty: product.criticalStockQty,
        netMinor: unit.netMinor,
        marginBps: unit.marginBps,
        breakEvenBps,
        verdict: sim.verdict,
      };
      catalogNetMinor += unit.netMinor;
      if (sim.verdict === "LOSS") {
        lossSkus.push(row);
      } else if (sim.verdict === "THIN") {
        thinSkus.push(row);
      }
      if (breakEvenBps < BREAK_EVEN_NEAR_BPS) {
        nearBreakEven.push(row);
      }
    }
  }

  const prisma = getPrisma();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [hepsiburada, ownStore] = await Promise.all([
    resolveChannelEconomics(storeId, "HEPSIBURADA"),
    resolveChannelEconomics(storeId, "OWN_STORE"),
  ]);
  const economicsByChannel = {
    TRENDYOL: channel,
    HEPSIBURADA: hepsiburada,
    OWN_STORE: ownStore,
  };
  const [ledgers, inventory] = await Promise.all([
    prisma.stockLedger.findMany({
      where: {
        storeId,
        createdAt: { gte: since },
        type: { in: ["CHANNEL_SALE", "RETURN_RESTOCK"] },
      },
      select: { type: true, note: true, quantity: true, productId: true, channel: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.inventoryTransaction.findMany({
      where: { storeId, createdAt: { gte: since }, type: { in: ["SALE", "RETURN"] } },
      select: { type: true, note: true, quantity: true, variantId: true, variant: { select: { productId: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);
  const rawMoves: RawCommerceMove[] = [
    ...ledgers.map((row) => ({
      source: "LEDGER" as const,
      type: row.type,
      note: row.note,
      quantity: row.quantity,
      variantId: "",
      productId: row.productId,
      channel: row.channel,
    })),
    ...inventory.map((row) => ({
      source: "INVENTORY" as const,
      type: row.type,
      note: row.note,
      quantity: row.quantity,
      variantId: row.variantId,
      productId: row.variant.productId,
      channel: null,
    })),
  ];
  const selected = selectRealizedCommerceMoves(rawMoves);
  const priced: RealizedVariantPrice[] = [];
  for (const product of products) {
    for (const variant of product.variants) {
      priced.push({
        id: variant.id,
        productId: product.id,
        amountMinor: variant.amountMinor,
        costMinor: variant.unitEconomics?.costMinor ?? null,
        desiGrams: variant.unitEconomics?.desiGrams ?? null,
        vatBps: variant.unitEconomics?.vatBps ?? DEFAULT_VAT_BPS,
        costIncludesVat: variant.unitEconomics?.costIncludesVat === true,
        listings: variant.channelListings ?? [],
      });
    }
  }
  const known = new Set(priced.map((row) => row.id));
  const missing = [...new Set(selected.map((row) => row.variantId).filter((id) => id.length > 0 && !known.has(id)))];
  if (missing.length > 0) {
    const extra = await prisma.commerceVariant.findMany({
      where: { storeId, id: { in: missing } },
      select: {
        id: true,
        productId: true,
        amountMinor: true,
        unitEconomics: { select: { costMinor: true, desiGrams: true, vatBps: true, costIncludesVat: true } },
        channelListings: { select: { channel: true, priceMinor: true } },
      },
    });
    for (const variant of extra) {
      priced.push({
        id: variant.id,
        productId: variant.productId,
        amountMinor: variant.amountMinor,
        costMinor: variant.unitEconomics?.costMinor ?? null,
        desiGrams: variant.unitEconomics?.desiGrams ?? null,
        vatBps: variant.unitEconomics?.vatBps ?? DEFAULT_VAT_BPS,
        costIncludesVat: variant.unitEconomics?.costIncludesVat === true,
        listings: variant.channelListings,
      });
    }
  }
  const realized = summarizeRealizedSales({
    moves: selected,
    variants: priced,
    economicsByChannel,
    cargoMinor: (grams, channelKey) =>
      cargoForGrams(
        tariffs,
        grams,
        economicsByChannel[channelKey as keyof typeof economicsByChannel]?.cargoMinorPerOrder ??
          channel.cargoMinorPerOrder,
      ),
  });
  const netMinor = realized.realizedNetMinor - realized.returnImpactMinor;

  return {
    dayKey,
    lossSkus,
    thinSkus,
    nearBreakEven,
    criticalStock,
    returnImpactMinor: realized.returnImpactMinor,
    realizedNetMinor: realized.realizedNetMinor,
    netSellableQty,
    totals: {
      netMinor,
      catalogNetMinor,
      realizedNetMinor: realized.realizedNetMinor,
      lossSkuCount: lossSkus.length,
      skuCount,
      returnImpactMinor: realized.returnImpactMinor,
      netSellableQty,
      returnedUnits: realized.returnedUnits,
      cancelledUnits: realized.cancelledUnits,
    },
  };
}

/**
 * REPRICE hedefi (P1.1) — kapalı form.
 *
 * Eski formül `fiyat + |net| + %5` idi; komisyon, iade ve KDV yeni fiyattan
 * yeniden kesildiği için satıcı zarardan **çıkmıyordu** (100 TL → 123,90 TL,
 * hâlâ −1,92 TL). Yeni hesap, hedefi `+500 bps` net marjı **garanti eden**
 * en küçük fiyattan türetir (`profit.profitablePriceMinor`).
 */
export function repriceTargetFor(input: {
  priceMinor: number;
  cogsMinor: number;
  desiGrams: number;
  vatBps: number;
  costIncludesVat?: boolean;
  channel: { commissionBps: number; cargoMinorPerOrder: number; returnRateBps: number; adCostMinorPerOrder: number };
  tariffs: readonly ShippingBand[];
  targetMarginBps?: number;
}): { toPriceMinor: number; expectedGainMinor: number } | null {
  const cargo = cargoForGrams(input.tariffs, input.desiGrams, input.channel.cargoMinorPerOrder);
  const toPriceMinor = profitablePriceMinor({
    cogsMinor: input.cogsMinor,
    commissionBps: input.channel.commissionBps,
    cargoMinor: cargo,
    returnBps: input.channel.returnRateBps,
    adCostMinor: input.channel.adCostMinorPerOrder,
    vatBps: input.vatBps,
    targetMarginBps: input.targetMarginBps ?? TARGET_NET_MARGIN_BPS,
    costIncludesVat: input.costIncludesVat === true,
  });
  if (toPriceMinor == null || toPriceMinor <= input.priceMinor) {
    // Bu maliyet yapısında hedef marj imkânsız ya da liste fiyatı zaten yeterli.
    return null;
  }
  const after = calculateUnitNet({
    priceMinor: toPriceMinor,
    quantity: 1,
    costMinor: input.cogsMinor,
    commissionBps: input.channel.commissionBps,
    cargoMinor: cargo,
    returnRateBps: input.channel.returnRateBps,
    adCostMinorPerOrder: input.channel.adCostMinorPerOrder,
    vatBps: input.vatBps,
    costIncludesVat: input.costIncludesVat === true,
  });
  const before = calculateUnitNet({
    priceMinor: input.priceMinor,
    quantity: 1,
    costMinor: input.cogsMinor,
    commissionBps: input.channel.commissionBps,
    cargoMinor: cargo,
    returnRateBps: input.channel.returnRateBps,
    adCostMinorPerOrder: input.channel.adCostMinorPerOrder,
    vatBps: input.vatBps,
    costIncludesVat: input.costIncludesVat === true,
  });
  return { toPriceMinor, expectedGainMinor: Math.max(0, after.netMinor - before.netMinor) };
}

function buildActions(briefId: string, storeId: string, payload: BriefPayload) {
  const actions: Array<{
    kind: "REPRICE" | "BUNDLE" | "RESTOCK";
    variantId: string | null;
    paramsJson: string;
    expectedGainMinor: number;
    rationale: string;
  }> = [];

  for (const sku of payload.lossSkus.slice(0, 8)) {
    actions.push({
      kind: "REPRICE",
      variantId: sku.variantId,
      paramsJson: JSON.stringify({
        variantId: sku.variantId,
        fromPriceMinor: sku.priceMinor,
        targetMarginBps: TARGET_NET_MARGIN_BPS,
      }),
      // Beklenen kazanç uygulama anında güncel maliyetle hesaplanır; burada 0.
      expectedGainMinor: Math.max(0, -sku.netMinor),
      rationale: `${sku.title} (${sku.sku}): net ${formatTryMinor(sku.netMinor)}. Hedef: en az %${TARGET_NET_MARGIN_BPS / 100} net kâr.`,
    });
  }

  if (payload.lossSkus.length >= 2 || payload.thinSkus.length >= 2) {
    actions.push({
      kind: "BUNDLE",
      variantId: payload.lossSkus[0]?.variantId ?? payload.thinSkus[0]?.variantId ?? null,
      paramsJson: JSON.stringify({ suggestPropose: true }),
      expectedGainMinor: Math.max(0, ...payload.lossSkus.slice(0, 2).map((row) => Math.abs(row.netMinor))),
      rationale: "Zarar/ince marjlı SKU'lar için barem kırıcı paket tara.",
    });
  }

  for (const stock of payload.criticalStock.slice(0, 5)) {
    actions.push({
      kind: "RESTOCK",
      variantId: stock.variantId || null,
      paramsJson: JSON.stringify({
        productId: stock.productId,
        variantId: stock.variantId,
        approvedStockQty: stock.approvedStockQty,
        criticalStockQty: stock.criticalStockQty,
      }),
      expectedGainMinor: 0,
      rationale: `${stock.title}: stok ${stock.approvedStockQty} — kritik eşiğin (${stock.criticalStockQty}) altında.`,
    });
  }

  return actions.map((action) => ({
    id: randomUUID(),
    storeId,
    briefId,
    kind: action.kind,
    variantId: action.variantId,
    paramsJson: action.paramsJson,
    expectedGainMinor: action.expectedGainMinor,
    rationale: action.rationale.slice(0, 300),
    status: "SUGGESTED" as const,
  }));
}

/** Özet cümlesi — TL basar, kuruş sızdırmaz. */
function summaryOf(payload: BriefPayload): string {
  if (payload.totals.skuCount === 0) {
    return "Bugün maliyetli aktif varyant yok. Önce birim maliyet kaydet.";
  }
  return [
    `${payload.totals.skuCount} SKU tarandı.`,
    `Gerçekleşen net satış ${formatTryMinor(payload.totals.realizedNetMinor)}.`,
    `${payload.totals.lossSkuCount} zarar eden SKU.`,
    `${payload.criticalStock.length} kritik stok.`,
    `Son 24 saat: ${payload.totals.returnedUnits} iade, ${payload.totals.cancelledUnits} iptal, etki ${formatTryMinor(payload.returnImpactMinor)}.`,
    `Satılabilir ${payload.netSellableQty} adet.`,
  ].join(" ");
}

export async function buildOrLoadTodayBrief(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  return buildTodayBriefForStore(storeId);
}

export async function buildTodayBriefForStore(
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const dayKey = istanbulDayKey();
  const prisma = getPrisma();
  const existing = await prisma.commerceDailyBrief.findUnique({
    where: { storeId_dayKey: { storeId, dayKey } },
    include: { actions: { orderBy: { expectedGainMinor: "desc" } } },
  });
  if (existing) {
    return {
      ok: true,
      data: {
        brief: serializeBrief(existing),
        actions: existing.actions.map(serializeAction),
        fresh: false,
      },
    };
  }

  const payload = await scanStoreSkus(storeId);
  const briefId = randomUUID();
  const actions = buildActions(briefId, storeId, payload);
  const created = await prisma.commerceDailyBrief.create({
    data: {
      id: briefId,
      storeId,
      dayKey,
      payloadJson: JSON.stringify(payload),
      netMinor: payload.totals.netMinor,
      lossSkuCount: payload.totals.lossSkuCount,
      summaryText: summaryOf(payload),
      actions: {
        create: actions.map(({ id, storeId: _s, briefId: _b, ...rest }) => ({
          id,
          storeId,
          ...rest,
        })),
      },
    },
    include: { actions: true },
  });
  return {
    ok: true,
    data: {
      brief: serializeBrief(created),
      actions: created.actions.map(serializeAction),
      fresh: true,
      message: "Bugünün kâr özeti üretildi.",
    },
  };
}

function serializeBrief(row: {
  id: string;
  dayKey: string;
  netMinor: number;
  lossSkuCount: number;
  summaryText: string;
  payloadJson: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    dayKey: row.dayKey,
    netMinor: row.netMinor,
    /** TL metni — arayüz ham kuruş basmaz. */
    netLabel: formatTryMinor(row.netMinor),
    lossSkuCount: row.lossSkuCount,
    summaryText: row.summaryText,
    payload: JSON.parse(row.payloadJson) as BriefPayload,
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeAction(row: {
  id: string;
  kind: string;
  variantId: string | null;
  paramsJson: string;
  expectedGainMinor: number;
  status: string;
  rationale: string;
  appliedAt: Date | null;
}) {
  return {
    id: row.id,
    kind: row.kind,
    variantId: row.variantId,
    params: JSON.parse(row.paramsJson) as Record<string, unknown>,
    expectedGainMinor: row.expectedGainMinor,
    expectedGainLabel: formatTryMinor(row.expectedGainMinor),
    status: row.status,
    rationale: row.rationale,
    appliedAt: row.appliedAt?.toISOString() ?? null,
  };
}

/** REPRICE uygulaması: fiyatı yaz, ilanları **PENDING**'e çek. */
async function applyReprice(
  storeId: string,
  variantId: string,
  targetMarginBps: number,
): Promise<CommerceResult<Record<string, unknown>>> {
  const prisma = getPrisma();
  const variant = await prisma.commerceVariant.findFirst({
    where: { id: variantId, storeId },
    select: {
      id: true,
      amountMinor: true,
      onHandQty: true,
      unitEconomics: { select: { costMinor: true, desiGrams: true, vatBps: true, costIncludesVat: true } },
    },
  });
  if (!variant) {
    return commerceFail(404, "Varyant bulunamadı.");
  }
  if (!variant.unitEconomics || !variant.amountMinor || variant.amountMinor < 1) {
    return commerceFail(422, "Fiyat aksiyonu için birim maliyet ve fiyat gerekir.");
  }
  const channel = await resolveChannelEconomics(storeId, "TRENDYOL");
  const tariffRows = await loadShippingTariffs(storeId);
  const target = repriceTargetFor({
    priceMinor: variant.amountMinor,
    cogsMinor: variant.unitEconomics.costMinor,
    desiGrams: variant.unitEconomics.desiGrams,
    vatBps: variant.unitEconomics.vatBps ?? DEFAULT_VAT_BPS,
    costIncludesVat: variant.unitEconomics.costIncludesVat === true,
    channel,
    tariffs: tariffRows.map((row) => ({
      bandMinGrams: row.bandMinGrams,
      bandMaxGrams: row.bandMaxGrams,
      priceMinor: row.priceMinor,
      effectiveFrom: row.effectiveFrom,
    })),
    targetMarginBps,
  });
  if (!target) {
    return commerceFail(422, "Bu maliyet yapısında hedef marj imkânsız. Maliyeti veya kanal komisyonunu gözden geçir.");
  }
  await prisma.commerceVariant.update({
    where: { id: variant.id },
    data: { amountMinor: target.toPriceMinor, updatedAt: new Date() },
  });
  // Fiyat yerelde kalırsa pazaryeri eski fiyatı satmaya devam eder.
  // İlan PENDING olur ve fiyat/stok itmesi aynı anda kuyruğa girer.
  const pendingListings = await prisma.commerceChannelListing.updateMany({
    where: { storeId, variantId: variant.id },
    data: { syncStatus: "PENDING", lastError: "" },
  });
  if (pendingListings.count > 0) {
    try {
      await publishAppliedTrendyolStock({
        storeId,
        variantId: variant.id,
        onHandAfter: variant.onHandQty,
        amountMinor: target.toPriceMinor,
      });
    } catch (error) {
      logEvent({
        level: "warn",
        event: "commerce.daily_brief.reprice_push",
        reason: "enqueue_failed",
        errorName: error instanceof Error ? error.name : "Error",
      });
    }
  }
  return {
    ok: true,
    data: {
      toPriceMinor: target.toPriceMinor,
      toPriceLabel: formatTryMinor(target.toPriceMinor),
      expectedGainMinor: target.expectedGainMinor,
      pendingListings: pendingListings.count,
      message:
        pendingListings.count > 0
          ? `Fiyat ${formatTryMinor(target.toPriceMinor)} oldu. ${pendingListings.count} ilan pazaryeri eşitleme kuyruğuna alındı.`
          : `Fiyat ${formatTryMinor(target.toPriceMinor)} oldu. yerel fiyat güncellendi; periyodik eşitlemede pazaryerine aktarılacak.`,
    },
  };
}

/**
 * RESTOCK uygulaması (P1.2) — no-op değil.
 * Kritik stok uyarısı gelen kutuya yazılır **ve** havuza onay bekleyen taslak
 * giriş düşer. Satıcı havuzdan tek tıkla onaylar; yeni bir form açmaz.
 */
async function applyRestock(
  userId: string,
  storeId: string,
  actionId: string,
  params: Record<string, unknown>,
): Promise<CommerceResult<Record<string, unknown>>> {
  const prisma = getPrisma();
  const productId = typeof params.productId === "string" ? params.productId : "";
  if (!productId) {
    return commerceFail(422, "Stok aksiyonu için ürün gerekli.");
  }
  const product = await prisma.commerceProduct.findFirst({
    where: { id: productId, storeId },
    select: {
      id: true,
      title: true,
      criticalStockQty: true,
      variants: { select: { id: true, onHandQty: true, safetyBuffer: true, status: true } },
    },
  });
  if (!product) {
    return commerceFail(404, "Ürün bulunamadı.");
  }
  const onHand = sumVariantOnHand(product.variants);
  const threshold = product.criticalStockQty > 0 ? product.criticalStockQty : 5;
  const suggestQty = Math.max(1, Math.min(1_000, threshold * 2 - onHand));
  const fromParams = typeof params.variantId === "string" ? params.variantId : "";
  const known = new Set(product.variants.map((row) => row.id));
  const variantId = fromParams && known.has(fromParams) ? fromParams : criticalRestockVariantId(product.variants);
  const draftNote = variantId ? restockTargetNote(variantId) : "Kritik stok taslağı";
  await prisma.commerceInboxEntry.create({
    data: {
      id: randomUUID(),
      storeId,
      productId: product.id,
      channel: "OWN_STORE",
      kind: "STOCK_ALERT",
      externalRef: `reprice-stock:${actionId}`,
      customerLabel: "Kritik stok uyarısı",
      body: `${product.title}: elde ${onHand} adet, eşik ${threshold}. ${suggestQty} adetlik taslak sipariş havuza yazıldı.`,
      priority: 90,
      orderStatus: null,
    },
  });
  const draft = await prisma.stockLedger.create({
    data: {
      id: randomUUID(),
      storeId,
      productId: product.id,
      actorUserId: userId,
      type: "INBOUND_DRAFT",
      channel: "OWN_STORE",
      quantity: suggestQty,
      stockAfter: onHand,
      note: draftNote,
      idempotencyKey: `os-daily-restock:${actionId}`,
    },
  });
  return {
    ok: true,
    data: {
      draftId: draft.id,
      quantity: suggestQty,
      message: `${suggestQty} adetlik stok taslağı havuza yazıldı. Havuzdan onayla, kanallara yayılsın.`,
    },
  };
}

export async function applyProfitAction(
  userId: string,
  storeId: string,
  actionId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const action = await prisma.commerceProfitAction.findFirst({
    where: { id: actionId, storeId },
  });
  if (!action) {
    return commerceFail(404, "Aksiyon bulunamadı.");
  }
  if (action.status === "APPLIED") {
    return {
      ok: true,
      data: { id: action.id, status: "APPLIED", message: "Aksiyon zaten uygulandı." },
    };
  }
  if (action.status !== "SUGGESTED") {
    return commerceFail(409, "Aksiyon uygulanamaz.");
  }

  const params = JSON.parse(action.paramsJson) as Record<string, unknown>;
  let message = "";
  if (action.kind === "REPRICE") {
    const variantId = typeof params.variantId === "string" ? params.variantId : action.variantId;
    if (!variantId) {
      return commerceFail(422, "Fiyat aksiyonu geçersiz.");
    }
    const targetMarginBps =
      typeof params.targetMarginBps === "number" && Number.isInteger(params.targetMarginBps)
        ? params.targetMarginBps
        : TARGET_NET_MARGIN_BPS;
    const applied = await applyReprice(storeId, variantId, targetMarginBps);
    if (!applied.ok) {
      return applied;
    }
    message = typeof applied.data.message === "string" ? applied.data.message : "Fiyat güncellendi.";
    await prisma.commerceProfitAction.update({
      where: { id: action.id },
      data: {
        status: "APPLIED",
        appliedAt: new Date(),
        paramsJson: JSON.stringify({
          ...params,
          toPriceMinor: applied.data.toPriceMinor,
          pendingListings: applied.data.pendingListings,
        }),
        expectedGainMinor:
          typeof applied.data.expectedGainMinor === "number"
            ? applied.data.expectedGainMinor
            : action.expectedGainMinor,
      },
    });
    return { ok: true, data: { id: action.id, kind: action.kind, status: "APPLIED", message } };
  }

  if (action.kind === "BUNDLE") {
    // P1.2 — paket aksiyonu gerçek taramayı çalıştırır. Öneri üretilemezse
    // aksiyon APPLIED olmaz; satıcı "yaptım" hissiyle bırakılmaz.
    const { proposeBundles } = await import("@/lib/commerce/bundle-engine");
    const proposed = await proposeBundles(userId, storeId);
    if (!proposed.ok) {
      return proposed;
    }
    message = typeof proposed.data.message === "string" ? proposed.data.message : "Paket taraması çalıştı.";
    await prisma.commerceProfitAction.update({
      where: { id: action.id },
      data: { status: "APPLIED", appliedAt: new Date() },
    });
    return { ok: true, data: { id: action.id, kind: action.kind, status: "APPLIED", message } };
  }

  // RESTOCK
  const restocked = await applyRestock(userId, storeId, action.id, params);
  if (!restocked.ok) {
    return restocked;
  }
  message = typeof restocked.data.message === "string" ? restocked.data.message : "Stok taslağı yazıldı.";
  await prisma.commerceProfitAction.update({
    where: { id: action.id },
    data: { status: "APPLIED", appliedAt: new Date() },
  });
  return { ok: true, data: { id: action.id, kind: action.kind, status: "APPLIED", message } };
}

/**
 * Özet e-postası (P0.6).
 *
 * Rakamlar koddan gelir; e-posta gövdesine AI metni girmez. Panel bağlantısı
 * doğrudan kokpitin Kâr & Büyüme sekmesidir.
 */
function sendBriefNotice(input: {
  ownerUserId: string;
  storeId: string;
  dayKey: string;
  payload: BriefPayload;
  summaryText: string;
}): void {
  const path = `/panel/e-ticaret?sekme=buyume&magaza=${encodeURIComponent(input.storeId)}`;
  try {
    emitCitizenNotice({
      kind: "commerce_daily_brief",
      userId: input.ownerUserId,
      reference: `commerce-brief:${input.storeId}:${input.dayKey}`,
      applied: true,
      commerceBrief: {
        summary: input.summaryText,
        lossSkuCount: input.payload.totals.lossSkuCount,
        criticalStockCount: input.payload.criticalStock.length,
        panelPath: path,
      },
    });
  } catch (error) {
    logEvent({
      level: "error",
      event: "commerce.daily_brief.notice",
      reason: "emit_failed",
      errorName: error instanceof Error ? error.name : "Error",
    });
  }
}

/**
 * Inngest cron — sabah 07:00. Her mağaza için özet üretir, satıcıya gönderir.
 *
 * Taslak mağaza da (yeni satıcı varsayılanı `DRAFT`) taranır: kart yoksa özet
 * de e-posta da yazılmaz, boş bildirim gönderilmez.
 */
export async function runCommerceDailyBriefScan(): Promise<{ stores: number; created: number; mailed: number }> {
  const stores = await getPrisma().commerceStore.findMany({
    where: { status: { in: ["ACTIVE", "DRAFT"] } },
    select: { id: true, ownerUserId: true, name: true },
    take: 500,
  });
  let created = 0;
  let mailed = 0;
  for (const store of stores) {
    const dayKey = istanbulDayKey();
    const exists = await getPrisma().commerceDailyBrief.findUnique({
      where: { storeId_dayKey: { storeId: store.id, dayKey } },
      select: { id: true, payloadJson: true, summaryText: true },
    });
    if (exists) {
      continue;
    }
    const result = await buildTodayBriefForStore(store.id);
    if (!result.ok || !result.data.fresh) {
      continue;
    }
    created += 1;
    const brief = result.data.brief as { summaryText?: string; payload?: BriefPayload };
    const payload = brief.payload;
    if (!payload || payload.totals.skuCount === 0) {
      continue;
    }
    sendBriefNotice({
      ownerUserId: store.ownerUserId,
      storeId: store.id,
      dayKey,
      payload,
      summaryText: brief.summaryText ?? summaryOf(payload),
    });
    mailed += 1;
  }
  return { stores: stores.length, created, mailed };
}
