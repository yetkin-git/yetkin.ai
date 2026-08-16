export const MODULE_ID = "pazaryeri" as const;

/** S61-A: dijital + hizmet + emlak + vasıta. Teklif ve doping çekirdek emanette. */
export const PAZARYERI_SURFACES = ["digital-goods", "services", "real-estate", "vehicles"] as const;

/** Faz 6A + Faz 10 — ilan → fiyat kilidi / teklif → cüzdan debit → anında net veya teslim teyidi. */
export const PAZARYERI_HAPPY_PATH = ["listing", "price-lock", "settle-or-escrow", "deliver"] as const;

export type PazaryeriHappyPathStep = (typeof PAZARYERI_HAPPY_PATH)[number];

export {
  PAZARYERI_ASSET_FLOOR_UNIT_KEY,
  PAZARYERI_DOPING_TTL_MS,
  PAZARYERI_DOPING_UNIT_KEY,
  PAZARYERI_LISTING_FLOOR_UNIT_KEY,
  PAZARYERI_MODULE_KEY,
} from "@/lib/pazaryeri/types";
export {
  confirmMarketplaceDelivery,
  listMarketplaceProduct,
  lockMarketplaceProductPrice,
  purchaseMarketplaceProduct,
  refundMarketplaceOrder,
} from "@/lib/pazaryeri/engine";
export {
  onEscrowRefunded as onPazaryeriEscrowRefunded,
  PAZARYERI_ESCROW_REFUND_PURPOSE,
} from "@/lib/pazaryeri/escrow-refund";
export { decideMarketplaceOffer, submitMarketplaceOffer } from "@/lib/pazaryeri/offer-engine";
export { purchaseMarketplaceDoping } from "@/lib/pazaryeri/doping-engine";
export {
  createProductInputSchema,
  pazaryeriDopingInputSchema,
  pazaryeriOfferInputSchema,
  purchaseProductInputSchema,
} from "@/lib/pazaryeri/schemas";
export {
  canConfirmDelivery,
  canRefundMarketplaceOrder,
  pazaryeriOfferUnitKey,
  pazaryeriOrderReferenceKey,
  pazaryeriProductUnitKey,
} from "@/lib/pazaryeri/fsm";
export type {
  MarketplaceDopingRecord,
  MarketplaceOfferRecord,
  MarketplaceOrderRecord,
  MarketplaceProductRecord,
  PazaryeriPulse,
  PazaryeriStore,
} from "@/lib/pazaryeri/types";
