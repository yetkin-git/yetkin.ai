export const JUNIOR_GUARDIAN_INVITE_TOKEN_PREFIX = "yrg_";
export const GUARDIAN_INVITE_PLAINTEXT_PATTERN = /^yrg_[A-Za-z0-9_-]{32,64}$/;

export function isGuardianInvitePlaintext(raw: string): boolean {
  return GUARDIAN_INVITE_PLAINTEXT_PATTERN.test(raw.trim());
}
