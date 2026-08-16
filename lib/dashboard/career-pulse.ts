import type { CareerPulse } from "@/lib/career/types";

export type CareerPulseSnapshot = CareerPulse & { live: boolean };

export const EMPTY_CAREER_PULSE: CareerPulseSnapshot = {
  live: false,
  visaCount: 0,
  portfolioCount: 0,
  lastVisaTitle: null,
};
