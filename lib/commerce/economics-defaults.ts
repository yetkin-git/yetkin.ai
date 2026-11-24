/**
 * Kanal maliyet varsayılanları — sektör ortalaması (yorumda kaynak).
 * Satıcı kendi değerini girene kadar simülatör bunları kullanır.
 */

export const ECONOMICS_CHANNELS = [
  "OWN_STORE",
  "TRENDYOL",
  "HEPSIBURADA",
  "AMAZON",
  "N11",
] as const;

export type EconomicsChannel = (typeof ECONOMICS_CHANNELS)[number];

export type ChannelEconomicsDefaults = {
  commissionBps: number;
  cargoMinorPerOrder: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
};

/** Trendyol kategori ortalaması ~%21; Hepsiburada ~%15–20. */
export const DEFAULT_CHANNEL_ECONOMICS: Record<EconomicsChannel, ChannelEconomicsDefaults> = {
  TRENDYOL: {
    commissionBps: 2_100,
    cargoMinorPerOrder: 3_990,
    returnRateBps: 800,
    adCostMinorPerOrder: 0,
  },
  HEPSIBURADA: {
    commissionBps: 1_800,
    cargoMinorPerOrder: 3_990,
    returnRateBps: 700,
    adCostMinorPerOrder: 0,
  },
  OWN_STORE: {
    commissionBps: 0,
    cargoMinorPerOrder: 3_990,
    returnRateBps: 300,
    adCostMinorPerOrder: 0,
  },
  AMAZON: {
    commissionBps: 1_500,
    cargoMinorPerOrder: 4_490,
    returnRateBps: 600,
    adCostMinorPerOrder: 0,
  },
  N11: {
    commissionBps: 1_600,
    cargoMinorPerOrder: 3_990,
    returnRateBps: 700,
    adCostMinorPerOrder: 0,
  },
};

export function defaultsForChannel(channel: EconomicsChannel): ChannelEconomicsDefaults {
  return DEFAULT_CHANNEL_ECONOMICS[channel];
}

export function isEconomicsChannel(value: unknown): value is EconomicsChannel {
  return typeof value === "string" && (ECONOMICS_CHANNELS as readonly string[]).includes(value);
}
