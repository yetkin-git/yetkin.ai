import { sha256Hex } from "@/lib/kernel/crypto/sha256";

export const COMMERCE_MONTHLY_MODULE = "commerce" as const;
export const COMMERCE_MONTHLY_UNIT = "monthly" as const;

export type CommerceSubscriptionStatusName = "PENDING" | "ACTIVE";

export type CommerceSubscriptionRow = {
  id: string;
  storeId: string;
  ownerUserId: string;
  status: CommerceSubscriptionStatusName;
  listPriceMinor: number;
  appliedMerchantOids: string[];
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CommerceSubscriptionStore = {
  findByStoreId(storeId: string): Promise<CommerceSubscriptionRow | null>;
  save(row: CommerceSubscriptionRow): Promise<CommerceSubscriptionRow>;
};

export function commerceLicenseActive(
  row: Pick<CommerceSubscriptionRow, "status" | "expiresAt"> | null,
  now: Date,
): boolean {
  return Boolean(row && row.status === "ACTIVE" && row.expiresAt && row.expiresAt.getTime() > now.getTime());
}

/** Bitmemiş sürenin üstüne bir takvim ayı. Taşma `setUTCMonth` kuralıdır. */
export function addCommerceLicenseMonth(from: Date): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export function commerceLicenseExpiry(existingExpiresAt: Date | null, now: Date): Date {
  if (existingExpiresAt && existingExpiresAt.getTime() > now.getTime()) {
    return addCommerceLicenseMonth(existingExpiresAt);
  }
  return addCommerceLicenseMonth(now);
}

function compactStoreId(storeId: string): string | null {
  const hex = storeId.replace(/-/g, "").toLowerCase();
  return /^[0-9a-f]{32}$/.test(hex) ? hex : null;
}

function expandStoreId(hex: string): string {
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** PayTR sipariş numarası mağazayı geri okur. Aynı anahtar aynı numarayı üretir. */
export function commerceLicenseMerchantOid(storeId: string, idempotencyKey: string): string | null {
  const compact = compactStoreId(storeId);
  if (!compact) {
    return null;
  }
  const digest = sha256Hex(`commerce-license:${storeId}:${idempotencyKey}`).slice(0, 12).toUpperCase();
  return `CM${compact}${digest}`;
}

export function storeIdFromCommerceMerchantOid(merchantOid: string): string | null {
  if (!/^CM[0-9a-f]{32}[0-9A-F]{12}$/.test(merchantOid)) {
    return null;
  }
  return expandStoreId(merchantOid.slice(2, 34));
}
