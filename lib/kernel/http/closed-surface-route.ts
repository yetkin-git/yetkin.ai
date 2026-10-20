import { jsonFail } from "@/lib/kernel/http/json";

/**
 * Hop sicilinde olmayan kalıcı 410.
 * Donmuş oda yakalayıcısı `frozenRoomGone` ayrıdır; o mesaj kenar odası içindir.
 * Bu fonksiyon oda motoru import etmez.
 */
export function closedSurfaceGone(error: string) {
  return async function gone(request: Request) {
    return jsonFail(error, 410, undefined, request);
  };
}
