import type { MarketplaceOrderRecord } from "@/lib/pazaryeri/types";

export function pazaryeriOrderReferenceKey(orderId: string): string {
  return `pazaryeri-order:${orderId}`;
}

export function pazaryeriProductUnitKey(productId: string): string {
  return `product:${productId}`;
}

export function pazaryeriOfferUnitKey(offerId: string): string {
  return `offer:${offerId}`;
}

export function canConfirmDelivery(order: MarketplaceOrderRecord, actorUserId: string): boolean {
  return order.status === "AWAITING_DELIVERY" && order.userId === actorUserId && order.kind === "SERVICE";
}

export function canRefundMarketplaceOrder(order: MarketplaceOrderRecord, actorUserId: string): boolean {
  return order.status === "AWAITING_DELIVERY" && order.userId === actorUserId && order.kind === "SERVICE";
}
