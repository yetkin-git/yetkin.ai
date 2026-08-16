import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";

/** Pay ve iade oranı paydası — 10_000 bps = %100. */
export const SHARE_BPS_TOTAL = 10_000;

export function assertShareBps(shareBps: number): number {
  if (!Number.isInteger(shareBps) || shareBps < 0 || shareBps > SHARE_BPS_TOTAL) {
    throw new Error("Pay oranı 0–10.000 bps aralığında tam sayı olmalıdır.");
  }
  return shareBps;
}

export function computeShareMinorFromBps(amountMinor: number, shareBps: number): AmountMinor {
  assertShareBps(shareBps);
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Tutar negatif olmayan tam sayı olmalıdır.");
  }
  return toAmountMinor(Math.floor((amountMinor * shareBps) / SHARE_BPS_TOTAL));
}

export type ShareBpsSlice = {
  userId: string;
  shareBps: number;
};

export type AllocatedShare = {
  userId: string;
  amountMinor: AmountMinor;
};

/**
 * floor + kalan son paydaşa. Toplam shareBps = 10_000 zorunlu.
 * Sıfır tutar boş liste döner (pozitif minor yazılmaz).
 */
export function allocateMinorByShareBps(
  amountMinor: number,
  shares: readonly ShareBpsSlice[],
): AllocatedShare[] {
  if (shares.length === 0) {
    throw new Error("En az bir paydaş gerekir.");
  }
  const seen = new Set<string>();
  let totalBps = 0;
  for (const share of shares) {
    if (!share.userId.trim()) {
      throw new Error("Paydaş kimliği boş olamaz.");
    }
    if (seen.has(share.userId)) {
      throw new Error("Aynı paydaşa birden fazla pay yazılamaz.");
    }
    seen.add(share.userId);
    totalBps += assertShareBps(share.shareBps);
  }
  if (totalBps !== SHARE_BPS_TOTAL) {
    throw new Error(`Pay oranları toplamı ${totalBps} ≠ ${SHARE_BPS_TOTAL} bps.`);
  }
  if (amountMinor === 0) {
    return [];
  }
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Tutar negatif olmayan tam sayı olmalıdır.");
  }

  const allocated: AllocatedShare[] = [];
  let consumed = 0;
  for (let index = 0; index < shares.length; index += 1) {
    const share = shares[index]!;
    const isLast = index === shares.length - 1;
    const slice = isLast
      ? amountMinor - consumed
      : Math.floor((amountMinor * share.shareBps) / SHARE_BPS_TOTAL);
    consumed += slice;
    if (slice > 0) {
      allocated.push({ userId: share.userId, amountMinor: toAmountMinor(slice) });
    }
  }
  return allocated;
}
