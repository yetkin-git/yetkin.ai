import { toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";

/**
 * Lisans tahsilatı — istemci tutarı aktif katalog satırıyla aynı kuruş olmalıdır.
 * Sapma sipariş, iframe ve cüzdan düşümü açmaz.
 */

export const ACADEMY_LICENSE_PRICE_MISSING = "Aktif katalog fiyatı yok.";

export const ACADEMY_LICENSE_PRICE_MISMATCH =
  "İstenen tutar kataloğun aktif fiyatı ile aynı değil.";

export type AcademyLicenseAmountSeal =
  | { ok: true; amountMinor: AmountMinor }
  | { ok: false; message: string };

export function sealAcademyLicenseAmount(
  requestedMinor: number,
  activeCatalogMinor: number | null | undefined,
): AcademyLicenseAmountSeal {
  if (
    typeof activeCatalogMinor !== "number" ||
    !Number.isInteger(activeCatalogMinor) ||
    activeCatalogMinor <= 0
  ) {
    return { ok: false, message: ACADEMY_LICENSE_PRICE_MISSING };
  }
  if (!Number.isInteger(requestedMinor) || requestedMinor !== activeCatalogMinor) {
    return { ok: false, message: ACADEMY_LICENSE_PRICE_MISMATCH };
  }
  return { ok: true, amountMinor: toPositiveAmountMinor(activeCatalogMinor) };
}
