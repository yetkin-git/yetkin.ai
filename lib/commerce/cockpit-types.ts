import type { ListingView } from "@/lib/commerce/marketplace-types";

export type CockpitStore = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE";
  currencyCode: "TRY";
  whatsappE164: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CockpitAttribute = {
  column: string;
  value: string;
};

export type CockpitVariant = {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  amountMinor: number | null;
  onHandQty: number;
  safetyBuffer: number;
  sellableQty: number;
  status: "DRAFT" | "ACTIVE" | "PASSIVE";
  updatedAt: string;
};

export type CockpitProduct = {
  id: string;
  storeId: string;
  title: string;
  description: string;
  category: string;
  attributes: CockpitAttribute[];
  other: string;
  listingMarket: "trendyol" | "hepsiburada" | "amazon" | null;
  source: "MANUAL" | "MANUAL_CSV" | "TEZGAH_PAZARYERI";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  updatedAt: string;
  variants: CockpitVariant[];
};

export type CockpitMovement = {
  id: string;
  type: string;
  direction: string;
  quantity: number;
  onHandAfter: number;
  note: string;
  createdAt: string;
  variant: CockpitVariant;
};

export type CockpitLicense = {
  phase: "absent" | "pending" | "open" | "closed";
  expiresAt: string | null;
  amountMinor: number | null;
  billingReady: boolean;
};

export type CockpitCredential = {
  supplierHint: string;
  updatedAt: string;
};

export type CockpitChannel = {
  credential: CockpitCredential | null;
  listings: ListingView[];
};

export type CockpitRead<T> = { kind: "ok"; value: T } | { kind: "missing" } | { kind: "down" };

export function productCounts(products: readonly CockpitProduct[]): {
  draft: number;
  active: number;
  archived: number;
  tezgah: number;
} {
  let draft = 0;
  let active = 0;
  let archived = 0;
  let tezgah = 0;
  for (const product of products) {
    if (product.status === "DRAFT") {
      draft += 1;
    } else if (product.status === "ACTIVE") {
      active += 1;
    } else if (product.status === "ARCHIVED") {
      archived += 1;
    }
    if (product.source === "TEZGAH_PAZARYERI") {
      tezgah += 1;
    }
  }
  return { draft, active, archived, tezgah };
}
