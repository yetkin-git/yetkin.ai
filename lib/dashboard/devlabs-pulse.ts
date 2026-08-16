import type { DevLabsPulse } from "@/lib/devlabs/types";

export type DevLabsPulseSnapshot = DevLabsPulse & { live: boolean };

export const EMPTY_DEVLABS_PULSE: DevLabsPulseSnapshot = {
  live: false,
  projectsCount: 0,
  activeKeysCount: 0,
  revokedKeysCount: 0,
  artifactsCount: 0,
};
