/**
 * Tam sayı minor unit — float para yasak (S5-A).
 * TRY UI kopyasında “kuruş” denir; şema ve tip adı amountMinor’dır.
 */

export type AmountMinor = number & { readonly __brand: "AmountMinor" };

export type SignedAmountMinor = number & { readonly __brand: "SignedAmountMinor" };

export function toAmountMinor(value: number): AmountMinor {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Tutar negatif olmayan tam sayı olmalıdır.");
  }
  return value as AmountMinor;
}

export function toPositiveAmountMinor(value: number): AmountMinor {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Tutar pozitif tam sayı olmalıdır.");
  }
  return value as AmountMinor;
}

export function toSignedAmountMinor(value: number): SignedAmountMinor {
  if (!Number.isInteger(value)) {
    throw new Error("İşaretli tutar tam sayı olmalıdır.");
  }
  return value as SignedAmountMinor;
}

export function addAmountMinor(a: AmountMinor, b: AmountMinor): AmountMinor {
  return toAmountMinor(a + b);
}

export function subtractAmountMinor(a: AmountMinor, b: AmountMinor): AmountMinor {
  const diff = a - b;
  if (!Number.isInteger(diff) || diff < 0) {
    throw new Error("Çıkarılan tutar mevcut tutarı aşamaz.");
  }
  return diff as AmountMinor;
}

/** Basis points hold — floor. Kayıp satıcı net’ine kalır. */
export function computeHoldMinorFromBps(
  grossMinor: AmountMinor,
  holdBps: number,
): AmountMinor {
  if (!Number.isInteger(holdBps) || holdBps < 0 || holdBps > 10_000) {
    throw new Error("Platform payı geçersiz.");
  }
  return toAmountMinor(Math.floor((grossMinor * holdBps) / 10_000));
}

/** Brüt = platform hold + satıcı net — release öncesi zorunlu assert. */
export function assertGrossSplitIntegrity(
  grossMinor: AmountMinor,
  platformHoldMinor: AmountMinor,
  sellerNetMinor: AmountMinor,
): void {
  if (platformHoldMinor + sellerNetMinor !== grossMinor) {
    throw new Error(
      `Emanet split bütünlüğü bozuk: ${platformHoldMinor} + ${sellerNetMinor} ≠ ${grossMinor}`,
    );
  }
}

export function subtractHoldFromGross(
  grossMinor: AmountMinor,
  holdMinor: AmountMinor,
): AmountMinor {
  return subtractAmountMinor(grossMinor, holdMinor);
}
