import { EMPTY_ACADEMY_PULSE, type AcademyPulseSnapshot } from "@/lib/dashboard/academy-pulse";
import { EMPTY_CAREER_PULSE, type CareerPulseSnapshot } from "@/lib/dashboard/career-pulse";
import {
  EMPTY_FREELANCER_PULSE,
  type FreelancerPulseSnapshot,
} from "@/lib/dashboard/freelancer-pulse";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";

/** Kokpit tekil BFF okuma ucu. Yazma yok. Kernel bu yolu import etmez. */
export const DASHBOARD_PULSE_PATH = "/api/dashboard/pulse" as const;

export type DashboardPulse = {
  wallet: WalletStripSnapshot;
  freelancer: FreelancerPulseSnapshot;
  academy: AcademyPulseSnapshot;
  career: CareerPulseSnapshot;
};

export const EMPTY_DASHBOARD_PULSE: DashboardPulse = {
  wallet: EMPTY_WALLET_STRIP,
  freelancer: EMPTY_FREELANCER_PULSE,
  academy: EMPTY_ACADEMY_PULSE,
  career: EMPTY_CAREER_PULSE,
};

export const DASHBOARD_PULSE_ROOMS = [
  "wallet",
  "freelancer",
  "academy",
  "career",
] as const satisfies ReadonlyArray<keyof DashboardPulse>;

/** BFF yalnız çalışan 4 oda + cüzdan okur. */
export const WORKING_DASHBOARD_PULSE_ROOMS = DASHBOARD_PULSE_ROOMS;

export function withLiveFlag<T extends object>(pulse: T): T & { live: true } {
  return { ...pulse, live: true };
}

export function assembleDashboardPulse(parts: DashboardPulse): DashboardPulse {
  return {
    wallet: parts.wallet,
    freelancer: parts.freelancer,
    academy: parts.academy,
    career: parts.career,
  };
}
