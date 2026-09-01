import { jsonFail } from "@/lib/kernel/http/json";
import { FREELANCER_SATELLITE_GONE } from "@/lib/freelancer/satellite-gone";

/**
 * Doğrudan teklif BFF — bu fazda kapalı. Kenar oturum istemez; her yöntem 410.
 */
export const auth = "public" as const;

async function gone(request: Request) {
  return jsonFail(FREELANCER_SATELLITE_GONE.directOffer, 410, undefined, request);
}

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
