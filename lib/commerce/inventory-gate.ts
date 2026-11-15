import {
  COMMERCE_INT_MAX,
  type InventoryDirection,
  type InventoryType,
  type VariantStatus,
} from "@/lib/commerce/types";

/** Satılabilir adet kolon değildir. */
export function sellableQty(onHandQty: number, safetyBuffer: number): number {
  return onHandQty - safetyBuffer;
}

export function inventoryDirectionMatches(type: InventoryType, direction: InventoryDirection): boolean {
  if (type === "INBOUND" || type === "RETURN") {
    return direction === "IN";
  }
  if (type === "SALE") {
    return direction === "OUT";
  }
  return direction === "IN" || direction === "OUT";
}

/**
 * SALE satılabilir adede bakar. Diğer çıkış eldeki adede bakar. Giriş her zaman geçer.
 */
export function movementAllowed(input: {
  type: InventoryType;
  direction: InventoryDirection;
  onHandQty: number;
  safetyBuffer: number;
  quantity: number;
}): boolean {
  if (input.direction === "IN") {
    return input.onHandQty + input.quantity <= COMMERCE_INT_MAX;
  }
  if (input.type === "SALE") {
    return sellableQty(input.onHandQty, input.safetyBuffer) >= input.quantity;
  }
  return input.onHandQty >= input.quantity;
}

export function nextOnHandQty(onHandQty: number, direction: InventoryDirection, quantity: number): number {
  return direction === "IN" ? onHandQty + quantity : onHandQty - quantity;
}

/**
 * Satış veya düzeltme çıkışı satılabilir adedi 0'a indirirse ACTIVE → PASSIVE.
 * Giriş veya iade satılabilir adedi 0'ın üstüne çıkarır ve fiyat ile barkod doluysa PASSIVE → ACTIVE.
 * DRAFT kendiliğinden açılmaz.
 */
export function nextVariantStatus(input: {
  status: VariantStatus;
  type: InventoryType;
  direction: InventoryDirection;
  nextOnHandQty: number;
  safetyBuffer: number;
  amountMinor: number | null;
  barcode: string | null;
}): VariantStatus {
  const sellable = sellableQty(input.nextOnHandQty, input.safetyBuffer);
  if (
    input.status === "ACTIVE" &&
    input.direction === "OUT" &&
    (input.type === "SALE" || input.type === "ADJUSTMENT") &&
    sellable <= 0
  ) {
    return "PASSIVE";
  }
  if (
    input.status === "PASSIVE" &&
    input.direction === "IN" &&
    (input.type === "INBOUND" || input.type === "RETURN") &&
    sellable > 0 &&
    input.amountMinor != null &&
    input.barcode != null
  ) {
    return "ACTIVE";
  }
  return input.status;
}
