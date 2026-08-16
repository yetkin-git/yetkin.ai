import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import type { PazaryeriPulse, PazaryeriSalePulse } from "@/lib/pazaryeri/types";

export type PazaryeriPulseSnapshot = PazaryeriPulse & { live: boolean };

export const EMPTY_PAZARYERI_PULSE: PazaryeriPulseSnapshot = {
  live: false,
  listedProducts: 0,
  ordersSold: 0,
  ordersBought: 0,
  pendingDelivery: 0,
  lastSales: [] as PazaryeriSalePulse[],
  currencyCode: SETTLEMENT_CURRENCY satisfies CurrencyCode,
};
