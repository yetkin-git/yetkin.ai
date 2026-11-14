import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";

/** Varsayılan danışmanlık bütçe limiti — tam lira (TRY). */
export const DEFAULT_CONSULTING_CAP_TRY = 100_000;

/** Hazır hibe bütçe paketleri — tam lira (TRY). */
export const GRANT_BUDGET_PRESET_CAPS_TRY = [50_000, 100_000, 200_000] as const;

/** KDV oranı — %20 (basis points). */
const KDV_BPS = 2_000;

/** Kurumlar vergisi simülasyonu — %25 (basis points). */
const CORPORATE_TAX_BPS = 2_500;

export type GrantBudgetBreakdown = {
  /** Danışmanlık bütçe limiti (minor unit; TRY'de kuruş). */
  consultingCapMinor: AmountMinor;
  /** Devletten dönecek hibe — KDV hariç limit */
  grantAmountMinor: AmountMinor;
  /** Ödenen KDV tutarı (%20) */
  kdvAmountMinor: AmountMinor;
  /** Müşteriye yüklenecek Yetkin Kullanım Kredisi */
  digitalCreditEarnedMinor: AmountMinor;
  /** Şirkette kalan net nakit simülasyonu (limit − kurumlar vergisi) */
  netCompanyCashMinor: AmountMinor;
};

export type CalculateGrantBudgetInput = {
  /** Danışmanlık bütçe limiti — tam lira (varsayılan 100.000) */
  consultingCap?: number;
};

function wholeTryToMinor(wholeTry: number): AmountMinor {
  if (!Number.isFinite(wholeTry) || wholeTry < 0 || !Number.isInteger(wholeTry)) {
    throw new Error("Danışmanlık bütçe limiti pozitif tam sayı (TL) olmalıdır.");
  }
  const minor = wholeTry * 100;
  if (!Number.isSafeInteger(minor)) {
    throw new Error("Danışmanlık bütçe limiti güvenli tam sayı aralığında olmalıdır.");
  }
  return toAmountMinor(minor);
}

/** Basis points üzerinden tam sayı kesir (floor). Float kullanılmaz (Anayasa A1). */
function computeBpsMinor(amountMinor: AmountMinor, bps: number): AmountMinor {
  return toAmountMinor(Math.floor((amountMinor * bps) / 10_000));
}

/**
 * Devlet hibe programı danışmanlık üst limiti üzerinden bütçe, KDV avantajı
 * ve net nakit simülasyonunu hesaplar.
 *
 * Mantık:
 * - Devlet Hibesi = Limit (KDV hariç)
 * - KDV (%20) = Limit × 0,20
 * - Dijital Bakiye = KDV tutarı kadar Yetkin Kullanım Kredisi
 * - Net Nakit = Limit − %25 kurumlar vergisi
 */
export function calculateGrantBudget(
  input: CalculateGrantBudgetInput = {},
): GrantBudgetBreakdown {
  const consultingCapMinor = wholeTryToMinor(
    input.consultingCap ?? DEFAULT_CONSULTING_CAP_TRY,
  );

  const grantAmountMinor = consultingCapMinor;
  const kdvAmountMinor = computeBpsMinor(consultingCapMinor, KDV_BPS);
  const digitalCreditEarnedMinor = kdvAmountMinor;
  const corporateTaxMinor = computeBpsMinor(consultingCapMinor, CORPORATE_TAX_BPS);
  const netCompanyCashMinor = toAmountMinor(consultingCapMinor - corporateTaxMinor);

  return {
    consultingCapMinor,
    grantAmountMinor,
    kdvAmountMinor,
    digitalCreditEarnedMinor,
    netCompanyCashMinor,
  };
}
