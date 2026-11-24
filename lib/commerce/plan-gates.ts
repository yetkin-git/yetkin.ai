/**
 * E-Ticaret plan kapıları. Tutar katalog satırındadır; limit ve özellik burada.
 * Eski mağaza kodu yoksa `GROWTH` sayılır — mevcut lisans daralmaz.
 */

import { commerceFail, type CommerceFailure } from "@/lib/commerce/types";

export const COMMERCE_PLAN_CODES = ["STARTER", "GROWTH", "SCALE"] as const;

export type CommercePlanCode = (typeof COMMERCE_PLAN_CODES)[number];

export const COMMERCE_PLAN_FEATURES = [
  "repricer",
  "bundle",
  "campaign",
  "radar",
  "csv",
  "competitorFeed",
  "bulkLabel",
  "priorityScan",
] as const;

export type CommercePlanFeature = (typeof COMMERCE_PLAN_FEATURES)[number];

export type CommercePlanSpec = {
  code: CommercePlanCode;
  unit: "starter" | "growth" | "scale";
  title: string;
  summary: string;
  /** Açılış tutarı, kuruş. Katalog satırı varsa vitrin onu basar. */
  listPriceMinor: number;
  storeLimit: number | null;
  marketplaceLimit: number | null;
  skuLimit: number | null;
  featured: boolean;
  lines: readonly string[];
  features: readonly CommercePlanFeature[];
};

export const COMMERCE_PLANS: readonly CommercePlanSpec[] = [
  {
    code: "STARTER",
    unit: "starter",
    title: "Başlangıç",
    summary: "Tek mağaza, tek pazaryeri, sipariş masası ve barkodlu etiket.",
    listPriceMinor: 199_000,
    storeLimit: 1,
    marketplaceLimit: 1,
    skuLimit: 250,
    featured: false,
    lines: [
      "1 mağaza",
      "1 pazaryeri",
      "250 SKU",
      "Sipariş operasyon masası ve barkodlu etiket",
      "Günlük kâr özeti",
    ],
    features: [],
  },
  {
    code: "GROWTH",
    unit: "growth",
    title: "Büyüme",
    summary: "Üç mağaza, rekabet motoru, set mimarı, kampanya ve radar.",
    listPriceMinor: 399_000,
    storeLimit: 3,
    marketplaceLimit: null,
    skuLimit: 2_500,
    featured: true,
    lines: [
      "3 mağaza",
      "Trendyol ve Hepsiburada",
      "2.500 SKU",
      "Kâr korumalı otomatik rekabet motoru",
      "Barem kırıcı set mimarı",
      "Kampanya simülatörü",
      "Çok kaynaklı fırsat radarı",
      "CSV toplu işlem",
    ],
    features: ["repricer", "bundle", "campaign", "radar", "csv"],
  },
  {
    code: "SCALE",
    unit: "scale",
    title: "Kurumsal",
    summary: "Sınırsız mağaza ve SKU, toplu etiket, öncelikli tarama.",
    listPriceMinor: 799_000,
    storeLimit: null,
    marketplaceLimit: null,
    skuLimit: null,
    featured: false,
    lines: [
      "Sınırsız mağaza ve sınırsız SKU",
      "Öncelikli tarama",
      "Toplu etiket ve depo toplama listesi",
      "API rakip besleme erişimi",
    ],
    features: [
      "repricer",
      "bundle",
      "campaign",
      "radar",
      "csv",
      "competitorFeed",
      "bulkLabel",
      "priorityScan",
    ],
  },
] as const;

const RANK: Record<CommercePlanCode, number> = { STARTER: 1, GROWTH: 2, SCALE: 3 };

export function normalizeCommercePlan(value: unknown): CommercePlanCode {
  if (value === "STARTER" || value === "GROWTH" || value === "SCALE") {
    return value;
  }
  return "GROWTH";
}

export function commercePlanSpec(code: CommercePlanCode): CommercePlanSpec {
  const spec = COMMERCE_PLANS.find((row) => row.code === code);
  return spec ?? COMMERCE_PLANS[1]!;
}

export function highestCommercePlan(codes: readonly unknown[]): CommercePlanCode {
  let best: CommercePlanCode = "STARTER";
  let seen = false;
  for (const code of codes) {
    const plan = normalizeCommercePlan(code);
    seen = true;
    if (RANK[plan] > RANK[best]) {
      best = plan;
    }
  }
  return seen ? best : "GROWTH";
}

export type PlanGate =
  | { ok: true }
  | { ok: false; status: 403; message: string };

export function assertCommerceFeature(plan: CommercePlanCode, feature: CommercePlanFeature): PlanGate {
  const spec = commercePlanSpec(plan);
  if (spec.features.includes(feature)) {
    return { ok: true };
  }
  return { ok: false, status: 403, message: featureUpgradeMessage(feature) };
}

export function assertStoreCapacity(plan: CommercePlanCode, existingStoreCount: number): PlanGate {
  const limit = commercePlanSpec(plan).storeLimit;
  if (limit == null || existingStoreCount < limit) {
    return { ok: true };
  }
  if (plan === "STARTER") {
    return {
      ok: false,
      status: 403,
      message: "Başlangıç planında 1 mağaza var. İkinci mağaza için Büyüme planına geç.",
    };
  }
  return {
    ok: false,
    status: 403,
    message: "Bu planda mağaza sınırı doldu. Kurumsal plana geç, yeni mağaza aç.",
  };
}

export function assertMarketplaceCapacity(plan: CommercePlanCode, connectedMarketplaces: number): PlanGate {
  const limit = commercePlanSpec(plan).marketplaceLimit;
  if (limit == null || connectedMarketplaces < limit) {
    return { ok: true };
  }
  return {
    ok: false,
    status: 403,
    message: "Başlangıç planında 1 pazaryeri var. İkinci kanal için Büyüme planına geç.",
  };
}

export function assertSkuCapacity(plan: CommercePlanCode, skuCount: number): PlanGate {
  const limit = commercePlanSpec(plan).skuLimit;
  if (limit == null || skuCount < limit) {
    return { ok: true };
  }
  const next = plan === "STARTER" ? "Büyüme" : "Kurumsal";
  return {
    ok: false,
    status: 403,
    message: `Bu planda SKU sınırı doldu. ${next} planına geç, yeni kart ekle.`,
  };
}

export function featureUpgradeMessage(feature: CommercePlanFeature): string {
  switch (feature) {
    case "repricer":
      return "Otomatik rekabet motoru Büyüme planında. Planını yükselt, kuralı kaydet.";
    case "bundle":
      return "Barem kırıcı set mimarı Büyüme planında. Planını yükselt, seti kur.";
    case "campaign":
      return "Kampanya simülatörü Büyüme planında. Planını yükselt, indirimi dene.";
    case "radar":
      return "Fırsat radarı Büyüme planında. Planını yükselt, taramayı aç.";
    case "csv":
      return "CSV toplu işlem Büyüme planında. Planını yükselt, dosyayı yükle.";
    case "competitorFeed":
      return "API rakip besleme Kurumsal planda. Planını yükselt, fiyatı besle.";
    case "bulkLabel":
      return "Toplu etiket Kurumsal planda. Planını yükselt, seçilenlere bas.";
    case "priorityScan":
      return "Öncelikli tarama Kurumsal planda. Planını yükselt, kuyruğa gir.";
  }
}

export function planGateFailure(gate: Extract<PlanGate, { ok: false }>): CommerceFailure {
  return commerceFail(gate.status, gate.message);
}
