/**
 * Junior yıllık paket — GA4 kalemi.
 * Katalog satırı `lib/junior/price.ts` içindeki `JUNIOR_YEARLY_CATALOG_ID` ile aynıdır.
 * Bu dosya `server-only` değildir; kasa bileşeni istemciden okur.
 */

export const JUNIOR_YEARLY_GA_ITEM_ID = "cat_junior_yearly" as const;
export const JUNIOR_YEARLY_GA_ITEM_NAME = "Junior yıllık paket" as const;

export function juniorPlanIsActive(body: unknown): boolean {
  if (!body || typeof body !== "object") {
    return false;
  }
  const plan = (body as { plan?: unknown }).plan;
  if (!plan || typeof plan !== "object") {
    return false;
  }
  return (plan as { status?: unknown }).status === "ACTIVE";
}
