export {
  HOLD_BPS_DEFAULT,
  HOLD_BPS_MAX,
  HOLD_BPS_MIN,
  assertHoldBps,
  resolveHoldBps,
} from "@/lib/kernel/pricing/hold-bps";
export {
  PRICE_LOCK_GRACE_MINUTES,
  PRICE_LOCK_GRACE_MS,
  assertPriceLockAllowsDebit,
  buildPriceLockKey,
  computePriceLockExpiresAt,
  isPriceLockExpired,
  remainingPriceLockMs,
  type CheckoutPriceLockSnapshot,
  type PriceLockDecision,
} from "@/lib/kernel/pricing/price-lock";
export {
  consumeCheckoutPriceLock,
  createCheckoutPriceLock,
  requireOpenCheckoutPriceLock,
} from "@/lib/kernel/pricing/lock-engine";
export type { PriceCatalogEntrySnapshot, PriceCatalogStore, PriceCatalogUnitType } from "@/lib/kernel/pricing/catalog";
export {
  REQUIRED_CATALOG_DEFINITIONS,
  catalogDefinitionKey,
  type RequiredCatalogDefinition,
} from "@/lib/kernel/pricing/catalog-definitions";
export { assertAmountWithinCatalogBand, requireActiveCatalogEntry } from "@/lib/kernel/pricing/catalog-band";
export type { CheckoutPriceLockStore, CheckoutPriceLockWrite } from "@/lib/kernel/pricing/lock-store";
