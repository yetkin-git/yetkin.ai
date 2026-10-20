import { FREELANCER_SATELLITE_GONE } from "@/lib/freelancer/satellite-gone";
import { closedSurfaceGone } from "@/lib/kernel/http/closed-surface-route";

/**
 * Takım / Squad BFF — bu fazda kapalı. Kenar oturum istemez; her yöntem 410.
 */
export const auth = "public" as const;

const gone = closedSurfaceGone(FREELANCER_SATELLITE_GONE.squad);

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
