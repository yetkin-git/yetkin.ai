import { jsonFail } from "@/lib/kernel/http/json";
import { EDGE_API_FROZEN_ROOM_ERROR } from "@/lib/kernel/security/edge-api-auth";

/** Donmuş oda HTTP yüzeyi — Prisma/engine import etmez. Kenar da 410 basar. */
export async function frozenRoomGone(request: Request) {
  return jsonFail(EDGE_API_FROZEN_ROOM_ERROR, 410, undefined, request);
}

/** @deprecated frozenRoomGone — okuma/yazma aynı. */
export const frozenRoomGoneGet = frozenRoomGone;
