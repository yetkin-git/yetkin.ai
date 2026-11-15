/** Giden senkron bu metni ilanın `lastError` alanına yazar. HTTP çağrısı yapılmaz. */
export const COMMERCE_LICENSE_ABSENT = "Abonelik yok.";

export type CommerceOutgoingLicense = {
  allowsOutgoing(storeId: string, now: Date): Promise<boolean>;
};

/** Lisans kapısı yoksa giden çağrı kapalıdır. Gelen satış bu kapıya bakmaz. */
export async function outgoingSyncAllowed(
  license: CommerceOutgoingLicense | undefined,
  storeId: string,
  now: Date,
): Promise<boolean> {
  if (!license) {
    return false;
  }
  return license.allowsOutgoing(storeId, now);
}
