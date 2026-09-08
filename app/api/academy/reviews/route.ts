import { jsonFail } from "@/lib/kernel/http/json";

const ACADEMY_STUDIO_GONE = {
  reviews: "Ders değerlendirmesi kapalı.",
} as const;

/**
 * Ders değerlendirmesi — bellek sicili arşivde. Kenar oturum istemez; her yöntem 410.
 */
export const auth = "public" as const;

async function gone(request: Request) {
  return jsonFail(ACADEMY_STUDIO_GONE.reviews, 410, undefined, request);
}

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
