/** Vitrin fiyat cümlesi. Kasa kapalıyken tahsilat vaadi yazılmaz. */
export function juniorPackageCta(priceLabel: string | null, checkoutOpen: boolean): string {
  if (!checkoutOpen) {
    return priceLabel ? `Liste fiyatı ${priceLabel} — satış kapalı` : "Satış kapalı";
  }
  return priceLabel ? `Paketi Al (${priceLabel})` : "Paketi Al";
}
