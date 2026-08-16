import { EMPTY_ACADEMY_PULSE, type AcademyPulseSnapshot } from "@/lib/dashboard/academy-pulse";
import { EMPTY_ARENA_PULSE, type ArenaPulseSnapshot } from "@/lib/dashboard/arena-pulse";
import { EMPTY_CAREER_PULSE, type CareerPulseSnapshot } from "@/lib/dashboard/career-pulse";
import { EMPTY_DEVLABS_PULSE, type DevLabsPulseSnapshot } from "@/lib/dashboard/devlabs-pulse";
import {
  EMPTY_FREELANCER_PULSE,
  type FreelancerPulseSnapshot,
} from "@/lib/dashboard/freelancer-pulse";
import { EMPTY_HIBE_PULSE, type HibePulseSnapshot } from "@/lib/dashboard/hibe-pulse";
import { EMPTY_JUNIOR_PULSE, type JuniorPulseSnapshot } from "@/lib/dashboard/junior-pulse";
import { EMPTY_KURUMSAL_PULSE, type KurumsalPulseSnapshot } from "@/lib/dashboard/kurumsal-pulse";
import {
  EMPTY_PAZARYERI_PULSE,
  type PazaryeriPulseSnapshot,
} from "@/lib/dashboard/pazaryeri-pulse";
import { EMPTY_SOCIAL_PULSE, type SocialPulseSnapshot } from "@/lib/dashboard/social-pulse";
import { EMPTY_STUDIO_PULSE, type StudioPulseSnapshot } from "@/lib/dashboard/studio-pulse";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";

/** Kokpit tekil BFF okuma ucu. Yazma yok. Kernel bu yolu import etmez. */
export const DASHBOARD_PULSE_PATH = "/api/dashboard/pulse" as const;

export type DashboardPulse = {
  wallet: WalletStripSnapshot;
  freelancer: FreelancerPulseSnapshot;
  academy: AcademyPulseSnapshot;
  career: CareerPulseSnapshot;
  studio: StudioPulseSnapshot;
  kurumsal: KurumsalPulseSnapshot;
  arena: ArenaPulseSnapshot;
  devlabs: DevLabsPulseSnapshot;
  pazaryeri: PazaryeriPulseSnapshot;
  hibe: HibePulseSnapshot;
  junior: JuniorPulseSnapshot;
  social: SocialPulseSnapshot;
};

export const EMPTY_DASHBOARD_PULSE: DashboardPulse = {
  wallet: EMPTY_WALLET_STRIP,
  freelancer: EMPTY_FREELANCER_PULSE,
  academy: EMPTY_ACADEMY_PULSE,
  career: EMPTY_CAREER_PULSE,
  studio: EMPTY_STUDIO_PULSE,
  kurumsal: EMPTY_KURUMSAL_PULSE,
  arena: EMPTY_ARENA_PULSE,
  devlabs: EMPTY_DEVLABS_PULSE,
  pazaryeri: EMPTY_PAZARYERI_PULSE,
  hibe: EMPTY_HIBE_PULSE,
  junior: EMPTY_JUNIOR_PULSE,
  social: EMPTY_SOCIAL_PULSE,
};

export const DASHBOARD_PULSE_ROOMS = [
  "wallet",
  "freelancer",
  "academy",
  "career",
  "studio",
  "kurumsal",
  "arena",
  "devlabs",
  "pazaryeri",
  "hibe",
  "junior",
  "social",
] as const satisfies ReadonlyArray<keyof DashboardPulse>;

export function withLiveFlag<T extends object>(pulse: T): T & { live: true } {
  return { ...pulse, live: true };
}

export function assembleDashboardPulse(parts: DashboardPulse): DashboardPulse {
  return {
    wallet: parts.wallet,
    freelancer: parts.freelancer,
    academy: parts.academy,
    career: parts.career,
    studio: parts.studio,
    kurumsal: parts.kurumsal,
    arena: parts.arena,
    devlabs: parts.devlabs,
    pazaryeri: parts.pazaryeri,
    hibe: parts.hibe,
    junior: parts.junior,
    social: parts.social,
  };
}
