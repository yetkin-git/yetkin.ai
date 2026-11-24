import "server-only";

import { sha256Hex } from "@/lib/kernel/crypto/sha256";

/** subject_key tuzu. Ortam yoksa sabit uygulama tuzu (ham IP yine saklanmaz). */
const GUEST_SUBJECT_FALLBACK_SALT = "yetkin-guest-subject-v1";

function guestSubjectSalt(): string {
  const fromEnv = process.env.GUEST_SUBJECT_SALT?.trim();
  return fromEnv && fromEnv.length >= 8 ? fromEnv : GUEST_SUBJECT_FALLBACK_SALT;
}

/** Ham IP yerine tuzlanmış SHA-256. Biçim: `guest:` + 64 hex. */
export function hashGuestSubjectKey(guestIp: string): string {
  const ip = guestIp.trim() || "unknown";
  return `guest:${sha256Hex(`${guestSubjectSalt()}:${ip}`)}`;
}

/**
 * Oturum yoksa veya ölü yenileme jetonu oturumu null bıraktıysa anonim kova.
 * Geçerli üye kimliği kendi kotasında kalır.
 * Misafir kovası ham IP taşımaz.
 */
export function assistantActorId(
  sessionUserId: string | null | undefined,
  guestIp: string,
): { userId: string; guest: boolean } {
  const id = sessionUserId?.trim() ?? "";
  if (id.length > 0) {
    return { userId: id, guest: false };
  }
  return { userId: hashGuestSubjectKey(guestIp), guest: true };
}
