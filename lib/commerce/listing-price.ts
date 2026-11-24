/**
 * Kanal ilan fiyatı. Doluysa pazaryeri itmesi bu kuruşu kullanır;
 * boşsa varyantın kendi fiyatı geçerlidir.
 */

export function channelListingSaleMinor(
  listing: { priceMinor?: number | null } | null | undefined,
  variantAmountMinor: number | null | undefined,
): number | null {
  const listed = listing?.priceMinor;
  if (typeof listed === "number" && Number.isInteger(listed) && listed > 0) {
    return listed;
  }
  if (variantAmountMinor == null) {
    return null;
  }
  return variantAmountMinor;
}
