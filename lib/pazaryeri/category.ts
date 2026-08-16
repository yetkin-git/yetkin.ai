import type { MarketplaceProductCategory, MarketplaceProductKind, MarketplaceProductRecord } from "@/lib/pazaryeri/types";
import {
  PAZARYERI_ASSET_FLOOR_UNIT_KEY,
  PAZARYERI_LISTING_FLOOR_UNIT_KEY,
} from "@/lib/pazaryeri/types";

export const MARKETPLACE_PRODUCT_CATEGORIES = [
  "DIGITAL_GOOD",
  "SERVICE",
  "REAL_ESTATE",
  "VEHICLE",
] as const;

export function settlementKindForCategory(category: MarketplaceProductCategory): MarketplaceProductKind {
  return category === "DIGITAL_GOOD" ? "DIGITAL_GOOD" : "SERVICE";
}

export function isAssetCategory(category: MarketplaceProductCategory): boolean {
  return category === "REAL_ESTATE" || category === "VEHICLE";
}

export function listingCatalogUnitKey(category: MarketplaceProductCategory): string {
  return isAssetCategory(category) ? PAZARYERI_ASSET_FLOOR_UNIT_KEY : PAZARYERI_LISTING_FLOOR_UNIT_KEY;
}

export function resolveListingCategory(input: {
  category?: MarketplaceProductCategory;
  kind?: MarketplaceProductKind;
}): MarketplaceProductCategory {
  if (input.category) {
    return input.category;
  }
  if (input.kind === "DIGITAL_GOOD" || input.kind === "SERVICE") {
    return input.kind;
  }
  throw new Error("İlan kategorisi gerekli.");
}

export function normalizeTkgmBlockParcel(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(?:Ada\s+)?(\d+)\s*[/,]\s*(?:Parsel\s+)?(\d+)$/i);
  if (!match || !match[1] || !match[2]) {
    throw new Error("TKGM ada-parsel biçimi geçersiz (Ada 12 / Parsel 34).");
  }
  return `Ada ${match[1]} / Parsel ${match[2]}`;
}

export function normalizeInsuranceQuoteHook(raw: string): string {
  const trimmed = raw.trim();
  const lowered = trimmed.toLowerCase();
  if (lowered === "quick" || lowered === "hepiyi") {
    return lowered;
  }
  if (/^https:\/\/.+/i.test(trimmed) && trimmed.length <= 200) {
    return trimmed;
  }
  throw new Error("Sigorta kancası Quick, Hepiyi veya https bağlantısı olmalıdır.");
}

export function assertCategoryFields(input: {
  category: MarketplaceProductCategory;
  tkgmBlockParcel?: string | null;
  insuranceQuoteHook?: string | null;
}): { tkgmBlockParcel: string | null; insuranceQuoteHook: string | null } {
  if (input.category === "REAL_ESTATE") {
    if (!input.tkgmBlockParcel?.trim()) {
      throw new Error("Emlak ilanı TKGM ada-parsel alanı ister.");
    }
    if (input.insuranceQuoteHook?.trim()) {
      throw new Error("Emlak ilanında sigorta kancası kullanılmaz.");
    }
    return {
      tkgmBlockParcel: normalizeTkgmBlockParcel(input.tkgmBlockParcel),
      insuranceQuoteHook: null,
    };
  }
  if (input.category === "VEHICLE") {
    if (!input.insuranceQuoteHook?.trim()) {
      throw new Error("Vasıta ilanı sigorta kancası ister (Quick / Hepiyi).");
    }
    if (input.tkgmBlockParcel?.trim()) {
      throw new Error("Vasıta ilanında TKGM ada-parsel kullanılmaz.");
    }
    return {
      tkgmBlockParcel: null,
      insuranceQuoteHook: normalizeInsuranceQuoteHook(input.insuranceQuoteHook),
    };
  }
  if (input.tkgmBlockParcel?.trim() || input.insuranceQuoteHook?.trim()) {
    throw new Error("TKGM ve sigorta kancası yalnız emlak/vasıta kategorisindedir.");
  }
  return { tkgmBlockParcel: null, insuranceQuoteHook: null };
}

export function isProductDoped(product: Pick<MarketplaceProductRecord, "isDoped" | "dopedUntil">, now = new Date()): boolean {
  if (!product.isDoped) {
    return false;
  }
  if (!product.dopedUntil) {
    return true;
  }
  return product.dopedUntil.getTime() > now.getTime();
}

export function categoryLabel(category: MarketplaceProductCategory): string {
  switch (category) {
    case "REAL_ESTATE":
      return "Emlak";
    case "VEHICLE":
      return "Vasıta";
    case "SERVICE":
      return "Hizmet";
    default:
      return "Dijital ürün";
  }
}
