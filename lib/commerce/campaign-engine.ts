/**
 * Motor 3 — Kâr korumalı kampanya simülatörü.
 * Sayılar profit.ts'te; AI yalnız başlık/metin üretir ve mühürlenir.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import type { EconomicsChannel } from "@/lib/commerce/economics-defaults";
import {
  isChannel,
  intField,
  loadUnitEconomics,
  MISSING,
  requireOwnedStore,
  resolveChannelEconomics,
} from "@/lib/commerce/economics-service";
import { DEFAULT_VAT_BPS, simulateCampaign, type CampaignSimResult } from "@/lib/commerce/profit";
import { formatTryFromMinor, scrubInventedNumbers } from "@/lib/commerce/profit-text";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { resolveProductModel } from "@/lib/kernel/ai/product-models";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import { getPrisma } from "@/lib/kernel/db";

function parseSimBody(raw: unknown): {
  ok: true;
  variantId: string;
  channel: EconomicsChannel;
  discountBps: number;
  listPriceMinor?: number;
} | { ok: false; error: string } {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "İstek geçersiz." };
  }
  const body = raw as Record<string, unknown>;
  const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";
  if (!variantId) {
    return { ok: false, error: "Varyant gerekli." };
  }
  if (!isChannel(body.channel)) {
    return { ok: false, error: "Kanal geçersiz." };
  }
  const discountBps = intField(body.discountBps, 0, 10_000);
  if (discountBps == null) {
    return { ok: false, error: "İndirim oranı geçersiz." };
  }
  let listPriceMinor: number | undefined;
  if (body.listPriceMinor != null) {
    const parsedPrice = intField(body.listPriceMinor, 1, 2_147_483_647);
    if (parsedPrice == null) {
      return { ok: false, error: "Liste fiyatı geçersiz." };
    }
    listPriceMinor = parsedPrice;
  }
  return { ok: true, variantId, channel: body.channel, discountBps, listPriceMinor };
}

async function runSimulation(
  storeId: string,
  parsed: {
    variantId: string;
    channel: EconomicsChannel;
    discountBps: number;
    listPriceMinor?: number;
  },
): Promise<CommerceResult<{ sim: CampaignSimResult & {
  listPriceMinor: number;
  variantId: string;
  channel: EconomicsChannel;
  cogsMinor: number;
  cargoMinor: number;
  vatBps: number;
} }>> {
  const variant = await getPrisma().commerceVariant.findFirst({
    where: { id: parsed.variantId, storeId },
    select: { id: true, amountMinor: true },
  });
  if (!variant) {
    return commerceFail(404, "Varyant bulunamadı.");
  }
  const listPriceMinor = parsed.listPriceMinor ?? variant.amountMinor ?? 0;
  if (listPriceMinor < 1) {
    return commerceFail(422, "Liste fiyatı yok. Önce varyant fiyatını yaz.");
  }
  const unit = await loadUnitEconomics(storeId, parsed.variantId);
  if (!unit) {
    return commerceFail(422, "Birim maliyet yok. Önce maliyet ve desi kaydet.");
  }
  const channel = await resolveChannelEconomics(storeId, parsed.channel);
  const vatBps = unit.vatBps ?? DEFAULT_VAT_BPS;
  const sim = simulateCampaign({
    priceMinor: listPriceMinor,
    discountBps: parsed.discountBps,
    cogsMinor: unit.costMinor,
    commissionBps: channel.commissionBps,
    cargoMinor: channel.cargoMinorPerOrder,
    returnBps: channel.returnRateBps,
    adCostMinor: channel.adCostMinorPerOrder,
    vatBps,
    costIncludesVat: unit.costIncludesVat === true,
  });
  return {
    ok: true,
    data: {
      sim: {
        ...sim,
        listPriceMinor,
        variantId: parsed.variantId,
        channel: parsed.channel,
        cogsMinor: unit.costMinor,
        cargoMinor: channel.cargoMinorPerOrder,
        vatBps,
      },
    },
  };
}

export async function simulateStoreCampaign(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "campaign");
  if (denied) {
    return denied;
  }
  const parsed = parseSimBody(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const result = await runSimulation(storeId, parsed);
  if (!result.ok) {
    return result;
  }
  const { sim } = result.data;
  return {
    ok: true,
    data: {
      listPriceMinor: sim.listPriceMinor,
      discountBps: parsed.discountBps,
      soldPriceMinor: sim.soldPriceMinor,
      netMinor: sim.netMinor,
      marginBps: sim.marginBps,
      breakEvenBps: sim.breakEvenBps,
      verdict: sim.verdict,
      channel: sim.channel,
      variantId: sim.variantId,
    },
  };
}

async function composeCampaignCopy(
  userId: string,
  facts: {
    discountBps: number;
    soldPriceMinor: number;
    netMinor: number;
    breakEvenBps: number;
    verdict: string;
  },
): Promise<{ title: string; body: string }> {
  const allowed = [
    // Birim kalkanı: kuruş → rawMinor, TL metni → formattedTry, oran → percent.
    { kind: "rawMinor" as const, value: facts.soldPriceMinor },
    { kind: "rawMinor" as const, value: Math.abs(facts.netMinor) },
    { kind: "formattedTry" as const, value: formatTryFromMinor(facts.soldPriceMinor) },
    { kind: "formattedTry" as const, value: formatTryFromMinor(Math.abs(facts.netMinor)) },
    { kind: "percent" as const, value: Math.floor(facts.discountBps / 100) },
    { kind: "percent" as const, value: Math.floor(facts.breakEvenBps / 100) },
  ];
  const fallback = {
    title: facts.verdict === "LOSS" ? "Zarar eşiği — yayına alma" : "Kâr korumalı indirim",
    body:
      facts.verdict === "LOSS"
        ? "Bu indirim net kârını eksiye çeker. Başabaş sınırının altında kal."
        : "İndirim başabaş sınırının içinde. Yayına almadan önce net kârını kontrol et.",
  };
  try {
    const llm = await invokeLlm({
      role: "LITE_STREAM",
      model: await resolveProductModel("textEasy"),
      system:
        "E-ticaret kampanya metni yaz. Yalnız verilen sayıları kullan. Yeni fiyat, kâr veya indirim uydurma. En çok 2 cümle. İlk satır başlık (en çok 80 karakter), ikinci satır gövde.",
      user: [
        `İndirim: %${Math.trunc(facts.discountBps / 100)}`,
        `Satış fiyatı: ${formatTryFromMinor(facts.soldPriceMinor)} TL`,
        `Net: ${formatTryFromMinor(facts.netMinor)} TL`,
        `Başabaş indirim: %${Math.trunc(facts.breakEvenBps / 100)}`,
        `Karar: ${facts.verdict}`,
        "Rakamları yalnız TL ve yüzde olarak yaz. Kuruş ve baz puan yazma.",
      ].join("\n"),
      temperature: 0.2,
      maxOutputTokens: 180,
      rateLimit: {
        identifier: userId,
        scope: "commerce-campaign-copy",
        limit: 40,
        windowMs: 3_600_000,
      },
      billing: {
        userId,
        source: AI_TOKEN_SOURCES.COMMERCE,
        recordUsage: true,
      },
    });
    const raw = (llm?.text ?? "").trim();
    if (!raw) {
      return fallback;
    }
    const [titleLine, ...rest] = raw.split(/\n+/);
    const title = scrubInventedNumbers((titleLine ?? "").slice(0, 120), allowed) || fallback.title;
    const body = scrubInventedNumbers(rest.join(" ").slice(0, 500), allowed) || fallback.body;
    return { title, body };
  } catch {
    return fallback;
  }
}

export async function saveStoreCampaign(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const denied = await enforcePlanFeature(userId, storeId, "campaign");
  if (denied) {
    return denied;
  }
  const parsed = parseSimBody(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const result = await runSimulation(storeId, parsed);
  if (!result.ok) {
    return result;
  }
  const { sim } = result.data;
  if (sim.verdict === "LOSS") {
    return commerceFail(422, "Bu indirim zarar yazıyor. Kampanya kaydedilmedi.");
  }
  const copy = await composeCampaignCopy(userId, {
    discountBps: parsed.discountBps,
    soldPriceMinor: sim.soldPriceMinor,
    netMinor: sim.netMinor,
    breakEvenBps: sim.breakEvenBps,
    verdict: sim.verdict,
  });
  const row = await getPrisma().commerceCampaignSimulation.create({
    data: {
      id: randomUUID(),
      storeId,
      variantId: sim.variantId,
      channel: sim.channel,
      listPriceMinor: sim.listPriceMinor,
      discountBps: parsed.discountBps,
      netMinor: sim.netMinor,
      marginBps: sim.marginBps,
      breakEvenBps: sim.breakEvenBps,
      verdict: sim.verdict,
      title: copy.title,
      body: copy.body,
    },
  });
  return {
    ok: true,
    data: {
      id: row.id,
      listPriceMinor: row.listPriceMinor,
      discountBps: row.discountBps,
      soldPriceMinor: sim.soldPriceMinor,
      netMinor: row.netMinor,
      marginBps: row.marginBps,
      breakEvenBps: row.breakEvenBps,
      verdict: row.verdict,
      title: row.title,
      body: row.body,
      message: "Kampanya simülasyonu kaydedildi.",
    },
  };
}

export async function listStoreCampaigns(
  userId: string,
  storeId: string,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await requireOwnedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const rows = await getPrisma().commerceCampaignSimulation.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return {
    ok: true,
    data: {
      campaigns: rows.map((row) => ({
        id: row.id,
        variantId: row.variantId,
        channel: row.channel,
        listPriceMinor: row.listPriceMinor,
        discountBps: row.discountBps,
        netMinor: row.netMinor,
        marginBps: row.marginBps,
        breakEvenBps: row.breakEvenBps,
        verdict: row.verdict,
        title: row.title,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
      })),
    },
  };
}
