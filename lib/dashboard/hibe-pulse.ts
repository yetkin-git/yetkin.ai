import type { HibePulse } from "@/lib/hibe/types";

export type HibePulseSnapshot = HibePulse & { live: boolean };

export const EMPTY_HIBE_PULSE: HibePulseSnapshot = {
  live: false,
  applicationsOpen: 0,
  applicationsDone: 0,
  recommendations: [],
};
