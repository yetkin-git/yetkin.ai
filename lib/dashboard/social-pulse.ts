import type { SocialPulse } from "@/lib/social/types";

export type SocialPulseSnapshot = SocialPulse & { live: boolean };

export const EMPTY_SOCIAL_PULSE: SocialPulseSnapshot = {
  live: false,
  sealedCount: 0,
  squareCount: 0,
  lastTitle: null,
};
