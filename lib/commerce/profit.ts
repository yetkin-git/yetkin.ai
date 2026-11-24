/**
 * Saf kâr matematiği — DB bağımlılığı yok.
 * Tüm tutarlar kuruş (amountMinor); oranlar baz puan (bps). Float yasak.
 * AI bu dosyadaki sayıları uyduramaz; yalnız bu fonksiyonlar üretir.
 *
 * Türkiye pazaryeri standardı: satış fiyatı **KDV dahildir**. Matrah
 * `fiyat × 10000 / (10000 + vatBps)` ile ayrışır; kalan KDV olarak devlete gider.
 * Net kâr KDV'den **sonra** hesaplanır. Varsayılan KDV %20 (2000 bps).
 */

import { formatTryFromMinor } from "@/lib/commerce/profit-text";

export type CampaignVerdict = "SAFE" | "THIN" | "LOSS";

/** Marj %10 altında THIN sayılır (1000 bps). */
export const THIN_MARGIN_BPS = 1_000;

/** Başabaşa yakınlık payı: %5 (500 bps). */
export const BREAK_EVEN_NEAR_BPS = 500;

/** Türkiye standart KDV oranı: %20. */
export const DEFAULT_VAT_BPS = 2_000;

/** Fiyat düzeltmesinde hedeflenen en az net kâr: %5 (500 bps). */
export const TARGET_NET_MARGIN_BPS = 500;

export type UnitNetInput = {
  /** Satış fiyatı — KDV **dahil** (kuruş). */
  priceMinor: number;
  quantity: number;
  costMinor: number;
  commissionBps: number;
  cargoMinor: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
  /** KDV oranı (baz puan). Varsayılan 2000 = %20. */
  vatBps?: number;
  /**
   * `true` ise `costMinor` alış KDV'sini içerir. İçindeki KDV
   * (`vatIncludedMinor`) mahsup edilebilir girdi KDV'sidir; net kâra geri yazılır.
   * Varsayılan `false`: maliyet KDV hariçtir.
   */
  costIncludesVat?: boolean;
};

export type UnitNetResult = {
  /** KDV dahil tahsil edilen tutar. */
  revenueMinor: number;
  /** Fiyatın içindeki KDV — devlete gider, kâr değildir. */
  vatMinor: number;
  /** KDV hariç matrah. */
  netRevenueMinor: number;
  commissionMinor: number;
  cogsMinor: number;
  returnMinor: number;
  /** Mahsup edilen alış KDV'si. Maliyet KDV hariçse 0. */
  inputVatCreditMinor: number;
  netMinor: number;
  marginBps: number;
};

export type CampaignSimInput = {
  priceMinor: number;
  discountBps: number;
  cogsMinor: number;
  commissionBps: number;
  cargoMinor: number;
  returnBps: number;
  adCostMinor: number;
  /** KDV oranı (baz puan). Varsayılan 2000 = %20. */
  vatBps?: number;
  /** Maliyet KDV dahilse girdi KDV'si mahsup edilir. */
  costIncludesVat?: boolean;
};

export type CampaignSimResult = {
  soldPriceMinor: number;
  vatMinor: number;
  netMinor: number;
  marginBps: number;
  breakEvenBps: number;
  verdict: CampaignVerdict;
};

export type ShippingBand = {
  bandMinGrams: number;
  bandMaxGrams: number;
  priceMinor: number;
  /** Aynı aralık birden fazla satırda varsa **en güncel** tarife kazanır. */
  effectiveFrom?: Date | number | string | null;
};

export type BundleMember = {
  variantId: string;
  priceMinor: number;
  costMinor: number;
  desiGrams: number;
};

export type BundleEvalInput = {
  members: readonly BundleMember[];
  tariffs: readonly ShippingBand[];
  commissionBps: number;
  returnRateBps: number;
  adCostMinorPerOrder: number;
  /** Paket indirimi (tekil toplama göre). Varsayılan %5. */
  bundleDiscountBps?: number;
  /** KDV oranı (baz puan). Varsayılan 2000 = %20. */
  vatBps?: number;
};

export type BundleEvalResult = {
  ok: true;
  memberCount: 2 | 3;
  singlePriceMinor: number;
  suggestedPriceMinor: number;
  singleNetMinor: number;
  bundleNetMinor: number;
  netLiftMinor: number;
  marginBps: number;
  cargoSingleMinor: number;
  cargoBundleMinor: number;
  cargoSavedMinor: number;
  sameBand: boolean;
  rationale: string;
} | {
  ok: false;
  reason: string;
};

function assertNonNegInt(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} negatif olmayan tam sayı olmalıdır.`);
  }
}

function assertBps(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error(`${label} 0–10000 baz puan olmalıdır.`);
  }
}

/** Gelir üzerinden komisyon / iade kesintisi (floor). */
export function bpsOf(amountMinor: number, bps: number): number {
  assertNonNegInt(amountMinor, "Tutar");
  assertBps(bps, "Baz puan");
  return Math.floor((amountMinor * bps) / 10_000);
}

/** Liste fiyatına indirim uygula (floor). */
export function applyDiscount(priceMinor: number, discountBps: number): number {
  assertNonNegInt(priceMinor, "Fiyat");
  assertBps(discountBps, "İndirim");
  return priceMinor - bpsOf(priceMinor, discountBps);
}

export function marginBpsOf(netMinor: number, revenueMinor: number): number {
  if (!Number.isInteger(netMinor) || !Number.isInteger(revenueMinor)) {
    throw new Error("Marj hesabı tam sayı ister.");
  }
  if (revenueMinor <= 0) {
    return netMinor < 0 ? -10_000 : 0;
  }
  return Math.trunc((netMinor * 10_000) / revenueMinor);
}

export function verdictOf(netMinor: number, marginBps: number): CampaignVerdict {
  if (netMinor < 0) {
    return "LOSS";
  }
  if (marginBps < THIN_MARGIN_BPS) {
    return "THIN";
  }
  return "SAFE";
}

/** KDV dahil fiyatın içindeki KDV tutarı (kuruş). */
export function vatIncludedMinor(grossMinor: number, vatBps: number): number {
  assertNonNegInt(grossMinor, "Tutar");
  assertBps(vatBps, "KDV");
  if (vatBps === 0) {
    return 0;
  }
  const netRevenueMinor = Math.round((grossMinor * 10_000) / (10_000 + vatBps));
  return grossMinor - netRevenueMinor;
}

/** KDV hariç matrah (kuruş). */
export function netRevenueMinorOf(grossMinor: number, vatBps: number): number {
  return grossMinor - vatIncludedMinor(grossMinor, vatBps);
}

/**
 * Birim / sipariş net kârı.
 * net = (KDV dahil gelir) − KDV − komisyon − kargo − COGS − beklenen iade − reklam.
 */
export function calculateUnitNet(input: UnitNetInput): UnitNetResult {
  assertNonNegInt(input.priceMinor, "Fiyat");
  assertNonNegInt(input.quantity, "Adet");
  if (input.quantity < 1) {
    throw new Error("Adet en az 1 olmalıdır.");
  }
  assertNonNegInt(input.costMinor, "Maliyet");
  assertBps(input.commissionBps, "Komisyon");
  assertNonNegInt(input.cargoMinor, "Kargo");
  assertBps(input.returnRateBps, "İade oranı");
  assertNonNegInt(input.adCostMinorPerOrder, "Reklam");
  const vatBps = input.vatBps ?? DEFAULT_VAT_BPS;
  assertBps(vatBps, "KDV");

  const revenueMinor = input.priceMinor * input.quantity;
  const vatMinor = vatIncludedMinor(revenueMinor, vatBps);
  const commissionMinor = bpsOf(revenueMinor, input.commissionBps);
  const cogsMinor = input.costMinor * input.quantity;
  const returnMinor = bpsOf(revenueMinor, input.returnRateBps);
  const inputVatCreditMinor = input.costIncludesVat ? vatIncludedMinor(cogsMinor, vatBps) : 0;
  const netMinor =
    revenueMinor -
    vatMinor -
    commissionMinor -
    input.cargoMinor -
    cogsMinor -
    returnMinor -
    input.adCostMinorPerOrder +
    inputVatCreditMinor;
  return {
    revenueMinor,
    vatMinor,
    netRevenueMinor: revenueMinor - vatMinor,
    commissionMinor,
    cogsMinor,
    returnMinor,
    inputVatCreditMinor,
    netMinor,
    marginBps: marginBpsOf(netMinor, revenueMinor),
  };
}

export type BreakEvenPriceInput = {
  cogsMinor: number;
  commissionBps: number;
  cargoMinor: number;
  returnBps: number;
  adCostMinor: number;
  /** KDV oranı (baz puan). Varsayılan 2000 = %20. */
  vatBps?: number;
  /**
   * Yeni fiyat üzerinden hedeflenen en az **net kâr** oranı (baz puan).
   * `0` ise salt başabaş. REPRICE aksiyonu 500 (%5) ister.
   */
  targetMarginBps?: number;
  /** Maliyet KDV dahilse sabit giderden alış KDV'si düşülür. */
  costIncludesVat?: boolean;
};

/**
 * Kapalı form başabaş / hedef fiyat.
 *
 * Satış fiyatı G KDV dahildir. K = 10000, V = vatBps, C = komisyon,
 * R = iade, T = hedef net marj (hepsi bps). Sabit gider F = COGS + kargo + reklam.
 *
 *   net(G) = G · [K/(K+V) − (C+R)/K] − F
 *
 * Maliyet KDV dahilse F'den alış KDV'si (`vatIncludedMinor`) düşülür; satış fiyatına bağlı değildir.
 *
 * `net(G) ≥ G·T/K` çözümü:
 *
 *   G_min = ceil( F · K · (K+V) / (K² − (C+R+T)·(K+V)) )
 *
 * Payda ≤ 0 ise bu maliyet yapısında hedef marj **imkânsızdır** → `null`.
 * Tam sayı taşması olmasın diye hesap `BigInt` ile yapılır.
 */
export function breakEvenPriceMinor(input: BreakEvenPriceInput): number | null {
  assertNonNegInt(input.cogsMinor, "Maliyet");
  assertBps(input.commissionBps, "Komisyon");
  assertNonNegInt(input.cargoMinor, "Kargo");
  assertBps(input.returnBps, "İade");
  assertNonNegInt(input.adCostMinor, "Reklam");
  const vatBps = input.vatBps ?? DEFAULT_VAT_BPS;
  assertBps(vatBps, "KDV");
  const targetBps = input.targetMarginBps ?? 0;
  assertBps(targetBps, "Hedef marj");

  const K = 10_000n;
  const vat = BigInt(vatBps);
  const keep = BigInt(input.commissionBps + input.returnBps + targetBps);
  const inputVat = input.costIncludesVat ? BigInt(vatIncludedMinor(input.cogsMinor, vatBps)) : 0n;
  const fixed = BigInt(input.cogsMinor + input.cargoMinor + input.adCostMinor) - inputVat;
  const denominator = K * K - keep * (K + vat);
  if (denominator <= 0n) {
    return null;
  }
  const numerator = fixed * K * (K + vat);
  const ceil = (numerator + denominator - 1n) / denominator;
  if (ceil > BigInt(Number.MAX_SAFE_INTEGER)) {
    return null;
  }
  return Number(ceil);
}

/**
 * Hedef net marjı **fiilen** sağlayan en küçük fiyat.
 * Kapalı form yuvarlama payı için en fazla 5 kuruş yukarı yürür; hâlâ
 * sağlanmıyorsa `null` (uydurma fiyat yazılmaz).
 */
export function profitablePriceMinor(input: BreakEvenPriceInput): number | null {
  const base = breakEvenPriceMinor(input);
  if (base == null) {
    return null;
  }
  const targetBps = input.targetMarginBps ?? 0;
  for (let priceMinor = Math.max(1, base); priceMinor <= Math.max(1, base) + 5; priceMinor += 1) {
    const net = calculateUnitNet({
      priceMinor,
      quantity: 1,
      costMinor: input.cogsMinor,
      commissionBps: input.commissionBps,
      cargoMinor: input.cargoMinor,
      returnRateBps: input.returnBps,
      adCostMinorPerOrder: input.adCostMinor,
      vatBps: input.vatBps ?? DEFAULT_VAT_BPS,
      costIncludesVat: input.costIncludesVat === true,
    }).netMinor;
    if (net >= bpsOf(priceMinor, targetBps)) {
      return priceMinor;
    }
  }
  return null;
}

/**
 * Başabaş indirim (kapalı form, KDV dahil).
 * Liste fiyatı başabaşı karşılamıyorsa indirim payı 0.
 */
export function breakEvenDiscountBps(input: {
  priceMinor: number;
  cogsMinor: number;
  commissionBps: number;
  cargoMinor: number;
  returnBps: number;
  adCostMinor: number;
  vatBps?: number;
  costIncludesVat?: boolean;
}): number {
  assertNonNegInt(input.priceMinor, "Fiyat");
  assertNonNegInt(input.cogsMinor, "Maliyet");
  assertBps(input.commissionBps, "Komisyon");
  assertNonNegInt(input.cargoMinor, "Kargo");
  assertBps(input.returnBps, "İade");
  assertNonNegInt(input.adCostMinor, "Reklam");

  if (input.priceMinor <= 0) {
    return 0;
  }
  const minSold = breakEvenPriceMinor({
    cogsMinor: input.cogsMinor,
    commissionBps: input.commissionBps,
    cargoMinor: input.cargoMinor,
    returnBps: input.returnBps,
    adCostMinor: input.adCostMinor,
    vatBps: input.vatBps,
    targetMarginBps: 0,
    costIncludesVat: input.costIncludesVat === true,
  });
  if (minSold == null || minSold >= input.priceMinor) {
    return 0;
  }
  const maxDiscount = Math.floor(((input.priceMinor - minSold) * 10_000) / input.priceMinor);
  return Math.max(0, Math.min(10_000, maxDiscount));
}

/** İndirimli kampanya simülasyonu + başabaş + karar. */
export function simulateCampaign(input: CampaignSimInput): CampaignSimResult {
  assertBps(input.discountBps, "İndirim");
  const soldPriceMinor = applyDiscount(input.priceMinor, input.discountBps);
  const unit = calculateUnitNet({
    priceMinor: soldPriceMinor,
    quantity: 1,
    costMinor: input.cogsMinor,
    commissionBps: input.commissionBps,
    cargoMinor: input.cargoMinor,
    returnRateBps: input.returnBps,
    adCostMinorPerOrder: input.adCostMinor,
    vatBps: input.vatBps,
    costIncludesVat: input.costIncludesVat === true,
  });
  const breakEvenBps = breakEvenDiscountBps({
    priceMinor: input.priceMinor,
    cogsMinor: input.cogsMinor,
    commissionBps: input.commissionBps,
    cargoMinor: input.cargoMinor,
    returnBps: input.returnBps,
    adCostMinor: input.adCostMinor,
    vatBps: input.vatBps,
    costIncludesVat: input.costIncludesVat === true,
  });
  return {
    soldPriceMinor,
    vatMinor: unit.vatMinor,
    netMinor: unit.netMinor,
    marginBps: unit.marginBps,
    breakEvenBps,
    verdict: verdictOf(unit.netMinor, unit.marginBps),
  };
}

function effectiveSortKey(row: ShippingBand): number {
  const raw = row.effectiveFrom;
  if (raw == null) {
    return 0;
  }
  if (raw instanceof Date) {
    return raw.getTime();
  }
  if (typeof raw === "number") {
    return raw;
  }
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Ağırlığa uyan kargo baremi.
 * Aynı bandı birden çok satır kapsıyorsa **en güncel** `effectiveFrom` kazanır;
 * eşitlikte dar bant, sonra düşük fiyat. Zam sonrası eski satır sessizce kazanmaz.
 */
export function cargoForWeight(tariffs: readonly ShippingBand[], grams: number): number | null {
  assertNonNegInt(grams, "Ağırlık");
  if (tariffs.length === 0) {
    return null;
  }
  const fits = tariffs.filter((row) => grams >= row.bandMinGrams && grams <= row.bandMaxGrams);
  if (fits.length === 0) {
    return null;
  }
  const sorted = [...fits].sort(
    (a, b) =>
      effectiveSortKey(b) - effectiveSortKey(a) ||
      a.bandMaxGrams - a.bandMinGrams - (b.bandMaxGrams - b.bandMinGrams) ||
      a.priceMinor - b.priceMinor,
  );
  return sorted[0]?.priceMinor ?? null;
}

/** İki ağırlık aynı barem bandında mı? */
export function sameShippingBand(
  tariffs: readonly ShippingBand[],
  gramsA: number,
  gramsB: number,
): boolean {
  const bandOf = (grams: number) =>
    tariffs.find((row) => grams >= row.bandMinGrams && grams <= row.bandMaxGrams) ?? null;
  const a = bandOf(gramsA);
  const b = bandOf(gramsB);
  if (!a || !b) {
    return false;
  }
  return a.bandMinGrams === b.bandMinGrams && a.bandMaxGrams === b.bandMaxGrams;
}

/**
 * 2'li / 3'lü paket fırsatı.
 * Aynı kargo bandında kalıp kargo tasarrufu + net kâr artışı varsa önerilir.
 */
export function evaluateBundleOpportunity(input: BundleEvalInput): BundleEvalResult {
  const count = input.members.length;
  if (count !== 2 && count !== 3) {
    return { ok: false, reason: "Paket 2 veya 3 üyeli olmalıdır." };
  }
  for (const member of input.members) {
    assertNonNegInt(member.priceMinor, "Üye fiyatı");
    assertNonNegInt(member.costMinor, "Üye maliyeti");
    assertNonNegInt(member.desiGrams, "Üye desisi");
    if (member.priceMinor < 1 || member.desiGrams < 1) {
      return { ok: false, reason: "Her üyenin fiyatı ve desisi pozitif olmalıdır." };
    }
  }
  assertBps(input.commissionBps, "Komisyon");
  assertBps(input.returnRateBps, "İade");
  assertNonNegInt(input.adCostMinorPerOrder, "Reklam");
  const discountBps = input.bundleDiscountBps ?? 500;
  assertBps(discountBps, "Paket indirimi");

  let cargoSingleMinor = 0;
  let singleNetMinor = 0;
  let singlePriceMinor = 0;
  let totalDesi = 0;
  let totalCogs = 0;

  for (const member of input.members) {
    const cargo = cargoForWeight(input.tariffs, member.desiGrams);
    if (cargo == null) {
      return { ok: false, reason: "Tekil gönderi için kargo baremi yok." };
    }
    cargoSingleMinor += cargo;
    singlePriceMinor += member.priceMinor;
    totalDesi += member.desiGrams;
    totalCogs += member.costMinor;
    const unit = calculateUnitNet({
      priceMinor: member.priceMinor,
      quantity: 1,
      costMinor: member.costMinor,
      commissionBps: input.commissionBps,
      cargoMinor: cargo,
      returnRateBps: input.returnRateBps,
      adCostMinorPerOrder: input.adCostMinorPerOrder,
      vatBps: input.vatBps,
    });
    singleNetMinor += unit.netMinor;
  }

  const cargoBundleMinor = cargoForWeight(input.tariffs, totalDesi);
  if (cargoBundleMinor == null) {
    return { ok: false, reason: "Paket ağırlığı için kargo baremi yok." };
  }

  const sameBand = input.members.every((member) =>
    sameShippingBand(input.tariffs, member.desiGrams, totalDesi),
  );
  const cargoSavedMinor = Math.max(0, cargoSingleMinor - cargoBundleMinor);
  const suggestedPriceMinor = applyDiscount(singlePriceMinor, discountBps);
  const bundle = calculateUnitNet({
    priceMinor: suggestedPriceMinor,
    quantity: 1,
    costMinor: totalCogs,
    commissionBps: input.commissionBps,
    cargoMinor: cargoBundleMinor,
    returnRateBps: input.returnRateBps,
    adCostMinorPerOrder: input.adCostMinorPerOrder,
    vatBps: input.vatBps,
  });
  const netLiftMinor = bundle.netMinor - singleNetMinor;
  const profitable = netLiftMinor > 0 || (sameBand && cargoSavedMinor > 0 && bundle.netMinor >= 0);
  if (!profitable) {
    return { ok: false, reason: "Paket tekil satışa göre kâr artırmıyor." };
  }

  const savedLabel = `${formatTryFromMinor(cargoSavedMinor)} TL`;
  const liftLabel = `${netLiftMinor < 0 ? "-" : "+"}${formatTryFromMinor(Math.abs(netLiftMinor))} TL`;
  const rationale = sameBand
    ? `${count}'lü paket aynı kargo bandında; ${savedLabel} kargo tasarrufu, net ${liftLabel}.`
    : `${count}'lü paket kargo baremini birleştirir; ${savedLabel} tasarruf, net ${liftLabel}.`;

  return {
    ok: true,
    memberCount: count,
    singlePriceMinor,
    suggestedPriceMinor,
    singleNetMinor,
    bundleNetMinor: bundle.netMinor,
    netLiftMinor,
    marginBps: bundle.marginBps,
    cargoSingleMinor,
    cargoBundleMinor,
    cargoSavedMinor,
    sameBand,
    rationale: rationale.slice(0, 500),
  };
}
