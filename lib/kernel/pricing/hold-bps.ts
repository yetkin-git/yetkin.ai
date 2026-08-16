/** Super Admin hold bandı — kod tavanı, veri tabanı bu aralığı aşamaz (S11-A). */
export const HOLD_BPS_MIN = 1000;
export const HOLD_BPS_MAX = 1500;
export const HOLD_BPS_DEFAULT = 1000;

export function assertHoldBps(holdBps: number): number {
  if (!Number.isInteger(holdBps) || holdBps < HOLD_BPS_MIN || holdBps > HOLD_BPS_MAX) {
    throw new Error(
      `Hold bps ${HOLD_BPS_MIN}–${HOLD_BPS_MAX} aralığında tam sayı olmalıdır (gelen: ${holdBps}).`,
    );
  }
  return holdBps;
}

export function resolveHoldBps(catalogBps: number | null | undefined): number {
  if (catalogBps == null) {
    return HOLD_BPS_DEFAULT;
  }
  return assertHoldBps(catalogBps);
}
