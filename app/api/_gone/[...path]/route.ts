import { frozenRoomGone } from "@/lib/kernel/http/frozen-gone-route";

/**
 * Donmuş oda tek HTTP handler'ı. Kenar `isFrozenRoomApi` 410'u önce basar;
 * bu rota yalnız `/api/_gone/...` sızıntısı ve mühür grep SSOT'udur.
 */
export const auth = "public" as const;

export const GET = frozenRoomGone;
export const POST = frozenRoomGone;
export const PUT = frozenRoomGone;
export const PATCH = frozenRoomGone;
export const DELETE = frozenRoomGone;
