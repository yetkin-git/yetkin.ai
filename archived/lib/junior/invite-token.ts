import { createHmac, randomBytes } from "node:crypto";
import {
  GUARDIAN_INVITE_PLAINTEXT_PATTERN,
  JUNIOR_GUARDIAN_INVITE_TOKEN_PREFIX,
} from "@/lib/junior/invite-format";

export const JUNIOR_GUARDIAN_INVITE_TTL_MS = 24 * 60 * 60 * 1000;
export { GUARDIAN_INVITE_PLAINTEXT_PATTERN, JUNIOR_GUARDIAN_INVITE_TOKEN_PREFIX };

const INVITE_HMAC_PURPOSE = "yetkin-rail-junior-invite-v1";

export function generateGuardianInvitePlaintext(): string {
  return `${JUNIOR_GUARDIAN_INVITE_TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

/** Ham token deftere/log'a yazılmaz. Yalnız HMAC-SHA256 hash saklanır. */
export function hashGuardianInviteToken(plaintext: string): string {
  return createHmac("sha256", INVITE_HMAC_PURPOSE).update(plaintext.trim()).digest("hex");
}

export function guardianInvitePrefix(plaintext: string): string {
  return plaintext.trim().slice(0, 12);
}

export { isGuardianInvitePlaintext } from "@/lib/junior/invite-format";
