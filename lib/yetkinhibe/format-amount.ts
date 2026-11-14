import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { formatMinorCompact } from "@/lib/kernel/money/format";

/**
 * Tam lira vitrini: kuruş hanesi en yakın tam liraya yuvarlanır (₺1.590,50 → ₺1.591).
 * Girdi tam sayı minor birimdir; bölme yalnızca görüntü sınırında yapılır (A1).
 * Negatif girdi `toAmountMinor` tarafından reddedilir.
 */
export function formatAmountMinorAsWholeTry(amountMinor: AmountMinor | number): string {
  const minor = toAmountMinor(Math.trunc(amountMinor));
  const wholeLira = Math.round(minor / 100);
  return formatMinorCompact(toAmountMinor(wholeLira * 100), "TRY");
}
