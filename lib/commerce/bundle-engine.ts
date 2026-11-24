/**
 * Motor 1 — Akıllı paket / barem kırıcı.
 * Öneri üretimi deterministik; AI yalnız kabul sonrası satış metni yazar.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import {
  loadShippingTariffs,
  MISSING,
  requireOwnedStore,
  resolveChannelEconomics,
} from "@/lib/commerce/economics-service";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import { evaluateBundleOpportunity } from "@/lib/commerce/profit";
import { formatTryFromMinor, scrubInventedNumbers } from "@/lib/commerce/profit-text";
import {
  BUNDLE_CARGO_SAVED_COLUMN,
  BUNDLE_TYPE_COLUMN,
  bundleCostMinor,
  bundleDesiGrams,
  bundleMembersAttribute,
  bundleVatBps,
  setBarcode,
  setSku,
} from "@/lib/commerce/set-catalog";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { getPrisma } from "@/lib/kernel/db";

type Candidate = {
  variantId: string;
  productId: string;
  title: string;
  priceMinor: number;
  costMinor: number;
  desiGrams: number;
};

async function loadCandidates(storeId: string): Promise<Candidate[]> {
  const variants = await getPrisma().commerceVariant.findMany({
    where: { storeId, status: "ACTIVE", amountMinor: { gt: 0 } },
    include: {
      product: { select: { id: true, title: true, status: true } },
      unitEconomics: true,
    },
    take: 80,
  });
  const out: Candidate[] = [];
  for (const row of variants) {
    if (row.product.status !== "ACTIVE" || !row.unitEconomics || !row.amountMinor) {
      continue;
    }
    out.push({
      variantId: row.id,
      productId: row.productId,
      title: row.product.title,
      priceMinor: row.amountMinor,
      costMinor: row.unitEconomics.costMinor,
      desiGrams: row.unitEconomics.desiGrams,
    });
  }
  return out;
}

function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size < 1 || size > items.length) {
    return [];
  }
  const out: T[][] = [];
  const walk = (start: number, acc: T[]) => {
    if (acc.length === size) {
      out.push([...acc]);
      return;
    }
    for (let i = start; i < items.length; i += 1) {
      acc.push(items[i]!);
      walk(i + 1, acc);
      acc.pop();
    }
  };
  walk(0, []);
  return out;
}

export async function proposeBundles(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "bundle");
  if (denied) {
    return denied;
  }
  const [candidates, tariffs, channel] = await Promise.all([
    loadCandidates(storeId),
    loadShippingTariffs(storeId),
    resolveChannelEconomics(storeId, "TRENDYOL"),
  ]);
  if (candidates.length < 2) {
    return commerceFail(
      422,
      "Paket önerisi için en az 2 aktif varyant ve birim maliyet gerekir.",
    );
  }
  if (tariffs.length === 0) {
    return commerceFail(422, "Kargo tarifesi yok. Önce barem kaydet.");
  }
  const bands = tariffs.map((row) => ({
    bandMinGrams: row.bandMinGrams,
    bandMaxGrams: row.bandMaxGrams,
    priceMinor: row.priceMinor,
  }));
  const prisma = getPrisma();
  await prisma.commerceBundleProposal.updateMany({
    where: { storeId, status: "PROPOSED" },
    data: { status: "DISMISSED" },
  });
  const created: Array<Record<string, unknown>> = [];
  const sizes: Array<2 | 3> = candidates.length >= 3 ? [2, 3] : [2];
  for (const size of sizes) {
    const combos = combinations(candidates, size).slice(0, 40);
    for (const combo of combos) {
      const evaled = evaluateBundleOpportunity({
        members: combo.map((row) => ({
          variantId: row.variantId,
          priceMinor: row.priceMinor,
          costMinor: row.costMinor,
          desiGrams: row.desiGrams,
        })),
        tariffs: bands,
        commissionBps: channel.commissionBps,
        returnRateBps: channel.returnRateBps,
        adCostMinorPerOrder: channel.adCostMinorPerOrder,
      });
      if (!evaled.ok) {
        continue;
      }
      const row = await prisma.commerceBundleProposal.create({
        data: {
          id: randomUUID(),
          storeId,
          type: size === 2 ? "TWO" : "THREE",
          memberVariantIds: combo.map((item) => item.variantId),
          singlePriceMinor: evaled.singlePriceMinor,
          suggestedPriceMinor: evaled.suggestedPriceMinor,
          netMinor: evaled.bundleNetMinor,
          marginBps: evaled.marginBps,
          cargoSavedMinor: evaled.cargoSavedMinor,
          rationale: evaled.rationale,
          status: "PROPOSED",
        },
      });
      created.push({
        id: row.id,
        type: row.type,
        memberVariantIds: row.memberVariantIds,
        memberTitles: combo.map((item) => item.title),
        singlePriceMinor: row.singlePriceMinor,
        suggestedPriceMinor: row.suggestedPriceMinor,
        netMinor: row.netMinor,
        marginBps: row.marginBps,
        cargoSavedMinor: row.cargoSavedMinor,
        rationale: row.rationale,
        singleNetMinor: evaled.singleNetMinor,
        netLiftMinor: evaled.netLiftMinor,
      });
    }
  }
  created.sort(
    (a, b) =>
      Number(b.cargoSavedMinor ?? 0) - Number(a.cargoSavedMinor ?? 0) ||
      Number(b.netLiftMinor ?? 0) - Number(a.netLiftMinor ?? 0),
  );
  return {
    ok: true,
    data: {
      proposals: created.slice(0, 20),
      message:
        created.length === 0
          ? "Kâr artıran paket bulunamadı."
          : `${created.length} paket önerisi üretildi.`,
    },
  };
}

export async function listBundles(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const rows = await getPrisma().commerceBundleProposal.findMany({
    where: { storeId, status: { in: ["PROPOSED", "ACCEPTED"] } },
    orderBy: [{ cargoSavedMinor: "desc" }, { computedAt: "desc" }],
    take: 40,
  });
  return {
    ok: true,
    data: {
      proposals: rows.map((row) => ({
        id: row.id,
        type: row.type,
        memberVariantIds: row.memberVariantIds,
        singlePriceMinor: row.singlePriceMinor,
        suggestedPriceMinor: row.suggestedPriceMinor,
        netMinor: row.netMinor,
        marginBps: row.marginBps,
        cargoSavedMinor: row.cargoSavedMinor,
        rationale: row.rationale,
        status: row.status,
        acceptedProductId: row.acceptedProductId,
        salesCopy: row.salesCopy,
        computedAt: row.computedAt.toISOString(),
      })),
    },
  };
}

async function composeBundleSalesCopy(
  userId: string,
  input: {
    titles: string[];
    suggestedPriceMinor: number;
    cargoSavedMinor: number;
    rationale: string;
  },
): Promise<string> {
  const allowed = [
    { kind: "rawMinor" as const, value: input.suggestedPriceMinor },
    { kind: "rawMinor" as const, value: input.cargoSavedMinor },
    { kind: "formattedTry" as const, value: formatTryFromMinor(input.suggestedPriceMinor) },
    { kind: "formattedTry" as const, value: formatTryFromMinor(input.cargoSavedMinor) },
  ];
  const fallback = `${input.titles.join(" + ")} seti. Kargo tasarrufu ${formatTryFromMinor(input.cargoSavedMinor)} TL.`;
  try {
    const llm = await invokeLlm({
      role: "LITE_STREAM",
      model: await resolveProductModel("textEasy"),
      system:
        "Paket satış açıklaması yaz. 3 kısa madde. Yeni fiyat veya kâr rakamı uydurma. Yalnız verilen sayıları kullan.",
      user: [
        `Üyeler: ${input.titles.join(" | ")}`,
        `Önerilen fiyat kuruş: ${input.suggestedPriceMinor}`,
        `Kargo tasarrufu kuruş: ${input.cargoSavedMinor}`,
        `Gerekçe: ${input.rationale}`,
      ].join("\n"),
      temperature: 0.2,
      maxOutputTokens: 220,
      rateLimit: {
        identifier: userId,
        scope: "commerce-bundle-copy",
        limit: 40,
        windowMs: 3_600_000,
      },
      billing: {
        userId,
        source: AI_TOKEN_SOURCES.COMMERCE,
        recordUsage: true,
      },
    });
    const sealed = scrubInventedNumbers((llm?.text ?? "").slice(0, 1000), allowed);
    return sealed || fallback;
  } catch {
    return fallback;
  }
}

export async function acceptBundle(
  userId: string,
  storeId: string,
  proposalId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const proposal = await prisma.commerceBundleProposal.findFirst({
    where: { id: proposalId, storeId, status: "PROPOSED" },
  });
  if (!proposal) {
    return commerceFail(404, "Paket önerisi bulunamadı.");
  }
  const members = await prisma.commerceVariant.findMany({
    where: { storeId, id: { in: proposal.memberVariantIds } },
    include: { product: { select: { title: true, category: true } }, unitEconomics: true },
  });
  if (members.length !== proposal.memberVariantIds.length) {
    return commerceFail(422, "Paket üyeleri eksik.");
  }
  const missingCost = members.filter((row) => !row.unitEconomics);
  if (missingCost.length > 0) {
    // P1.3 — COGS/desi devredilmeden doğan set kartı kâr motoruna giremez.
    // Önce üyelerin birim maliyeti girilir; yarım kart üretilmez.
    return commerceFail(
      422,
      "Paket üyelerinin birim maliyeti eksik. Önce her üyenin maliyet ve desisini kaydet.",
    );
  }
  const titles = members.map((row) => row.product.title);
  const salesCopy = await composeBundleSalesCopy(userId, {
    titles,
    suggestedPriceMinor: proposal.suggestedPriceMinor,
    cargoSavedMinor: proposal.cargoSavedMinor,
    rationale: proposal.rationale,
  });
  const now = new Date();
  const sku = setSku(proposal.id);
  const barcode = setBarcode(proposal.id);
  const costMinor = bundleCostMinor(members.map((row) => ({ costMinor: row.unitEconomics!.costMinor })));
  const desiGrams = bundleDesiGrams(members.map((row) => ({ desiGrams: row.unitEconomics!.desiGrams })));
  const vatBps = bundleVatBps(members.map((row) => ({ vatBps: row.unitEconomics!.vatBps })));
  // Set stoğu üyelerin satılabilir adedinin **en küçüğüdür**: eksik bileşenle set
  // satılamaz. Böylece set kartı ilk günden satılabilir ve aşırı satmaz.
  const setStock = members.reduce(
    (min, row) => Math.min(min, Math.max(0, row.onHandQty - Math.max(0, row.safetyBuffer))),
    Number.POSITIVE_INFINITY,
  );
  const onHandQty = Number.isFinite(setStock) ? Math.max(0, setStock) : 0;
  const memberIds = members.map((row) => row.id);
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.commerceProduct.create({
      data: {
        id: randomUUID(),
        storeId,
        title: `${titles.join(" + ")} Seti`.slice(0, 200),
        description: salesCopy.slice(0, 4_000) || proposal.rationale,
        category: members[0]?.product.category ?? "Set",
        attributes: [
          { column: BUNDLE_TYPE_COLUMN, value: proposal.type === "TWO" ? "2'li set" : "3'lü set" },
          { column: BUNDLE_CARGO_SAVED_COLUMN, value: formatTryFromMinor(proposal.cargoSavedMinor) },
          bundleMembersAttribute(memberIds),
        ],
        otherNote: proposal.rationale.slice(0, 500),
        sku,
        basePriceMinor: proposal.suggestedPriceMinor,
        approvedStockQty: onHandQty,
        source: "MANUAL",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    });
    const variant = await tx.commerceVariant.create({
      data: {
        id: randomUUID(),
        storeId,
        productId: created.id,
        sku,
        barcode,
        amountMinor: proposal.suggestedPriceMinor,
        onHandQty,
        safetyBuffer: 0,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    });
    // P1.3 — COGS ve desi üyelerden devralınır; set kâr motorunda görünür.
    await tx.commerceUnitEconomics.create({
      data: {
        id: randomUUID(),
        storeId,
        variantId: variant.id,
        costMinor,
        desiGrams: Math.max(1, desiGrams),
        vatBps,
        updatedAt: now,
      },
    });
    await tx.commerceBundleProposal.update({
      where: { id: proposal.id },
      data: {
        status: "ACCEPTED",
        acceptedProductId: created.id,
        salesCopy,
      },
    });
    return created;
  });
  return {
    ok: true,
    data: {
      proposalId: proposal.id,
      productId: product.id,
      barcode,
      salesCopy,
      unitEconomics: { costMinor, desiGrams, vatBps },
      initialStock: onHandQty,
      message: "Set ürün oluşturuldu. Maliyet üyelerden devralındı; stok üye stoğundan düşer.",
    },
  };
}

export async function dismissBundle(
  userId: string,
  storeId: string,
  proposalId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const updated = await getPrisma().commerceBundleProposal.updateMany({
    where: { id: proposalId, storeId, status: "PROPOSED" },
    data: { status: "DISMISSED" },
  });
  if (updated.count === 0) {
    return commerceFail(404, "Paket önerisi bulunamadı.");
  }
  return { ok: true, data: { message: "Paket önerisi reddedildi." } };
}
