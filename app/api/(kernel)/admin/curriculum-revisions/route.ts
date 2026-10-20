import { ACADEMY_STUDIO_GONE } from "@/lib/academy/studio-gone";
import { closedSurfaceGone } from "@/lib/kernel/http/closed-surface-route";

/**
 * Müfredat revizyon kuyruğu — motor arşivde. Kenar oturum istemez; her yöntem 410.
 */
export const auth = "public" as const;

const gone = closedSurfaceGone(ACADEMY_STUDIO_GONE.revisions);

export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
