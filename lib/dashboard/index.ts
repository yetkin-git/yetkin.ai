/** Dashboard dikey dilimi — nabız Faz 2–7. Kernel bu modülü import etmez. */
export const MODULE_ID = "dashboard" as const;

export {
  EMPTY_FREELANCER_PULSE,
  type FreelancerPulseSnapshot,
} from "@/lib/dashboard/freelancer-pulse";
export {
  EMPTY_WALLET_STRIP,
  type WalletStripSnapshot,
} from "@/lib/dashboard/wallet-strip";
export {
  EMPTY_ACADEMY_PULSE,
  type AcademyPulseSnapshot,
} from "@/lib/dashboard/academy-pulse";
export {
  EMPTY_CAREER_PULSE,
  type CareerPulseSnapshot,
} from "@/lib/dashboard/career-pulse";
export {
  EMPTY_STUDIO_PULSE,
  type StudioPulseSnapshot,
} from "@/lib/dashboard/studio-pulse";
export {
  EMPTY_KURUMSAL_PULSE,
  type KurumsalPulseSnapshot,
} from "@/lib/dashboard/kurumsal-pulse";
export {
  EMPTY_ARENA_PULSE,
  type ArenaPulseSnapshot,
} from "@/lib/dashboard/arena-pulse";
export {
  EMPTY_DEVLABS_PULSE,
  type DevLabsPulseSnapshot,
} from "@/lib/dashboard/devlabs-pulse";
export {
  EMPTY_PAZARYERI_PULSE,
  type PazaryeriPulseSnapshot,
} from "@/lib/dashboard/pazaryeri-pulse";
export {
  EMPTY_HIBE_PULSE,
  type HibePulseSnapshot,
} from "@/lib/dashboard/hibe-pulse";
export {
  EMPTY_JUNIOR_PULSE,
  type JuniorPulseSnapshot,
} from "@/lib/dashboard/junior-pulse";
export {
  EMPTY_SOCIAL_PULSE,
  type SocialPulseSnapshot,
} from "@/lib/dashboard/social-pulse";
export {
  DEFAULT_RIBBON_ORDER,
  RIBBON_ORDER_STORAGE_KEY,
  applyStoredRibbonOrder,
  moveRibbonRoom,
  type RibbonRoomId,
} from "@/lib/dashboard/ribbon-order";
export {
  DASHBOARD_PULSE_PATH,
  DASHBOARD_PULSE_ROOMS,
  EMPTY_DASHBOARD_PULSE,
  assembleDashboardPulse,
  withLiveFlag,
  type DashboardPulse,
} from "@/lib/dashboard/pulse";
