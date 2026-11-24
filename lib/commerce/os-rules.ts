import {
  COMMERCE_PLAN_CODES,
  COMMERCE_PLANS,
  commercePlanSpec,
  normalizeCommercePlan,
  type CommercePlanCode,
  type CommercePlanSpec,
} from "@/lib/commerce/plan-gates";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinorCompact } from "@/lib/kernel/money/format";

export {
  COMMERCE_PLAN_CODES,
  COMMERCE_PLANS,
  commercePlanSpec,
  normalizeCommercePlan,
  type CommercePlanCode,
  type CommercePlanSpec,
};

export const OS_TABS = ["havuz", "kanallar", "siparis", "kargo", "buyume"] as const;

export type OsTab = (typeof OS_TABS)[number];

/**
 * `comingSoon` kanal henüz canlı değil: kokpitte "Yakında" görünür, bağlantı API'de 422 ile reddedilir.
 * Arayüz ve sunucu aynı listeden okur.
 */
export const OS_CHANNEL_CATALOG = [
  { kind: "OWN_STORE", label: "Kendi Web Sitesi", needsKey: false, comingSoon: false },
  { kind: "TRENDYOL", label: "Trendyol", needsKey: true, comingSoon: false },
  { kind: "HEPSIBURADA", label: "Hepsiburada", needsKey: true, comingSoon: false },
  { kind: "AMAZON", label: "Amazon", needsKey: true, comingSoon: true },
  { kind: "N11", label: "N11", needsKey: true, comingSoon: true },
] as const;

export type OsChannelKind = (typeof OS_CHANNEL_CATALOG)[number]["kind"];

export const POOL_STORE_NAME = "E-Ticaret Havuzu";

export function parseOsTab(value: string | undefined): OsTab {
  if (value === "kanallar" || value === "siparis" || value === "kargo" || value === "buyume") {
    return value;
  }
  return "havuz";
}

export function isOsChannelKind(value: string): value is OsChannelKind {
  return OS_CHANNEL_CATALOG.some((row) => row.kind === value);
}

export function channelNeedsKey(kind: OsChannelKind): boolean {
  return OS_CHANNEL_CATALOG.find((row) => row.kind === kind)?.needsKey === true;
}

/** Kanal henüz açılmadıysa true. Bağlantı isteği bu durumda 422 döner. */
export function channelComingSoon(kind: OsChannelKind): boolean {
  return OS_CHANNEL_CATALOG.find((row) => row.kind === kind)?.comingSoon === true;
}

/** 0 eşik uyarıyı kapatır. Taslak stok bu hesaba girmez. */
export function isCriticalStock(approved: number, critical: number): boolean {
  return critical > 0 && approved <= critical;
}

/**
 * Havuz formuna ön-doldurma (P1.5).
 *
 * Radar önerisi `?sekme=havuz&taslakBaslik=...&taslakKategori=...&hedefFiyat=...`
 * bağlantısıyla gelir. Eski `?tezgah?seed=` yolu 307 ile çöpe gidiyordu; burada
 * adlandırılmış alanlar okunur. `hedefFiyat` **kuruş** tam sayısıdır.
 */
export type PoolPrefill = {
  title: string;
  category: string;
  targetPriceMinor: number | null;
};

export function readPoolPrefill(params: { get(name: string): string | null }): PoolPrefill {
  const title = (params.get("taslakBaslik") ?? "").trim().slice(0, 200);
  const category = (params.get("taslakKategori") ?? "").trim().slice(0, 80);
  const rawPrice = (params.get("hedefFiyat") ?? "").trim();
  const parsed = /^\d{1,12}$/.test(rawPrice) ? Number(rawPrice) : null;
  return {
    title,
    category,
    targetPriceMinor: parsed != null && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null,
  };
}

/** Eşik varsa eşiğin üstü yüksektir. Eşik yoksa 10 ve üstü. */
export function isHighStock(approved: number, critical: number): boolean {
  if (approved <= 0) {
    return false;
  }
  if (critical > 0) {
    return approved > critical;
  }
  return approved >= 10;
}

export type CommercePlanUnitAmounts = Readonly<{
  starter: number;
  growth: number;
  scale: number;
}>;

/** Plan açılış tutarları (kuruş). Katalog satırı yokken şerit bu değerleri basar; eski `monthly` 149000 yok. */
export function commercePlanOpenAmounts(): CommercePlanUnitAmounts {
  const amounts = { starter: 0, growth: 0, scale: 0 };
  for (const plan of COMMERCE_PLANS) {
    amounts[plan.unit] = plan.listPriceMinor;
  }
  return amounts;
}

/**
 * Kokpit lisans şeridi. Üç kademeyi tek satırda basar.
 * Örnek: `Başlangıç ₺1.990 • Büyüme ₺3.990 • Kurumsal ₺7.990 / Ay`
 */
export function formatCommercePlanPriceRibbon(amounts: CommercePlanUnitAmounts): string {
  const parts = COMMERCE_PLANS.map(
    (plan) => `${plan.title} ${formatMinorCompact(amounts[plan.unit], SETTLEMENT_CURRENCY)}`,
  );
  return `${parts.join(" • ")} / Ay`;
}

export function commercePlanTitle(code: CommercePlanCode | string | null | undefined): string {
  return commercePlanSpec(
    code === "STARTER" || code === "GROWTH" || code === "SCALE" ? code : "GROWTH",
  ).title;
}

/** Lisans CTA: mağaza varsa paket/lisans ekranı, yoksa yeni mağaza. */
export function commerceLicenseActivateHref(storeId: string | null | undefined): string {
  return storeId ? `/magazam/${storeId}/lisans` : "/magazam/yeni";
}

export function pickPoolStore<T extends { name: string }>(stores: readonly T[]): T | null {
  if (stores.length === 0) {
    return null;
  }
  return stores.find((store) => store.name === POOL_STORE_NAME) ?? stores[0] ?? null;
}

/** `?magaza=` seçili mağazayı özne yapar. Tanınmazsa havuz adı, o da yoksa ilk mağaza. */
export function selectCockpitStore<T extends { id: string; name: string }>(
  stores: readonly T[],
  preferredStoreId: string | null | undefined,
): T | null {
  if (preferredStoreId) {
    const match = stores.find((store) => store.id === preferredStoreId);
    if (match) {
      return match;
    }
  }
  return pickPoolStore(stores);
}

/** Taslak onaylı adedi değiştirmez. Onay, satış ve iade defter matematiği. */
export function nextApprovedQty(
  current: number,
  type: "INBOUND_DRAFT" | "INBOUND_APPROVED" | "CHANNEL_SALE" | "RETURN_RESTOCK",
  quantity: number,
): number | null {
  if (!Number.isInteger(current) || current < 0 || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  if (type === "INBOUND_DRAFT") {
    return current;
  }
  if (type === "INBOUND_APPROVED" || type === "RETURN_RESTOCK") {
    const next = current + quantity;
    return next <= 2_147_483_647 ? next : null;
  }
  return current >= quantity ? current - quantity : null;
}
