import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { AcademyPulse } from "@/lib/academy/types";

export type AcademyPulseSnapshot = AcademyPulse & { live: boolean };

export const EMPTY_ACADEMY_PULSE: AcademyPulseSnapshot = {
  live: false,
  purchasesCount: 0,
  certificatesHeld: 0,
  lastCertificateTitle: null,
  currencyCode: SETTLEMENT_CURRENCY,
};
